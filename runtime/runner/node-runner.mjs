/*
 *  Copyright 2026 Groundwork contributors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
// Node twin of web/runner/browser-runner.js's BrowserRunner: compile in one worker thread, run each program
// in a fresh worker thread, terminate() it at the deadline. Used by the build-time checks (no browser, no
// JDK), so the host process must never die because of a program: a dead host would be a dead build.
import { Worker } from "node:worker_threads";
import path from "node:path";
import { javaLineFor } from "./java-line.js";
const ENTRY = new URL("./node-worker-entry.mjs", import.meta.url);
export { javaLineFor };

const describe = (e) => String((e && e.code) || e);

export class NodeRunner {
  constructor(distDir) {
    this.dist = path.resolve(distDir);
    this.nextId = 1;
    this.pending = new Map();
    this.compileDeath = null;
    this.compileWorker = new Worker(ENTRY, { workerData: { dist: this.dist, role: "compile" } });
    this.ready = new Promise((resolve, reject) => {
      this.compileWorker.on("message", (m) => {
        if (m.type === "ready") resolve(m.ms);
        else if (m.type === "compiled") { this.pending.get(m.id)?.(m); this.pending.delete(m.id); }
        else if (m.type === "fatal") reject(new Error(m.message));
      });
    });
    // The compile worker holds the compiler, not a program, but it can still die. Listening keeps
    // its error event from killing the host, and every waiting compile() gets an answer instead of
    // waiting forever. Any exit counts: this worker only exits when it dies or close() ends it.
    // Known limits, accepted for now: the worker is never respawned, so after one death every later
    // compile() of this runner answers "crash"; it has no resourceLimits, so a compiler that runs out
    // of memory meets Node's default heap limit; and a "fatal" during init rejects this.ready, which
    // nothing handles until the first compile().
    this.compileDied = new Promise((resolve) => {
      const died = (message) => {
        if (this.compileDeath) return;
        this.compileDeath = message;
        for (const settle of this.pending.values()) settle(this.compileWorkerDied());
        this.pending.clear();
        resolve();
      };
      this.compileWorker.on("error", (e) => died(describe(e)));
      this.compileWorker.on("exit", (code) => died(`exit ${code}`));
    });
    this.compileWorker.postMessage({ type: "init", compilerWasm: path.join(this.dist, "compiler.wasm"),
      sdk: path.join(this.dist, "compile-classlib-teavm.bin"), classlib: path.join(this.dist, "runtime-classlib-teavm.bin") });
    this.spare = this.spawn();
  }
  compileWorkerDied() {
    return { ok: false, stage: "crash", crash: `compile worker died: ${this.compileDeath}`, diagnostics: [] };
  }
  // The memory limit makes a program that allocates without end kill its worker, not the machine.
  // The error and exit listeners go on here, not when run() claims the worker: the spare waits idle
  // between runs, and an error event with no listener would kill the host.
  spawn() {
    const w = new Worker(ENTRY, { workerData: { dist: this.dist, role: "run" },
      resourceLimits: { maxOldGenerationSizeMb: 512 } });
    const ready = new Promise((r) => w.once("message", r));
    const death = new Promise((resolve) => {
      w.on("error", (e) => resolve(describe(e)));
      w.on("exit", (code) => { if (code !== 0) resolve(`exit ${code}`); });
    });
    return { w, ready, death };
  }
  async compile(source, strictMode = true) {
    await Promise.race([this.ready, this.compileDied]); // a worker that died early never becomes ready
    if (this.compileDeath) return this.compileWorkerDied();
    const id = this.nextId++;
    return new Promise((resolve) => { this.pending.set(id, resolve); this.compileWorker.postMessage({ type: "compile", id, source, strictMode }); });
  }
  // randomSeed: the Run's seed for new Random() and Math.random() (D16), a whole number from 0 to 2^53 - 1;
  // omitted, the run gets a fresh one.
  async run(wasm, { stdin = "", final = true, deadlineMs = 5000, randomSeed, outputLimitChars, outputLimitLines } = {}) {
    const { w, ready, death } = this.spare;
    this.spare = this.spawn();
    await Promise.race([ready, death]); // a spare that died while idle never becomes ready
    let stdout = "", stderr = "", limit = null, settled = false, exitCode = null;
    const t0 = performance.now();
    return new Promise((resolve) => {
      // Settles once. terminate() below, at the deadline or after done, itself ends the worker with a
      // non-zero exit code; that exit must not turn a timeout or an ok run into a crash.
      const finish = (status, exception) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        w.terminate();
        const line = javaLineFor(status, exception);
        // Where the JDK prints it: after anything the program already wrote to stderr, not in front of
        // it. The pinned JDK prints "before Exception in thread..." for System.err.print("before ")
        // followed by endless recursion; runtime/test/runner-faults.mjs holds the fork to that.
        if (line) stderr += line + "\n";
        resolve({ status, exception, exitCode, stdout, stderr, ms: performance.now() - t0 });
      };
      const timer = setTimeout(() => finish(limit ? "output-limit" : "timeout", null), deadlineMs);
      death.then((message) => finish("crashed", { message }));
      w.on("message", (m) => {
        if (m.type === "out") stdout += m.text;
        else if (m.type === "err") stderr += m.text;
        else if (m.type === "limit") limit = m;
        else if (m.type === "done") {
          // A program that called System.exit reports the exit code a process would: the low 8 bits of
          // its status, as the pinned JDK's java does (System.exit(-1) exits 255). Code 0 is "ok" and any
          // other is "exit-N", the names runtime/test/jdk.mjs gives the JDK's exit codes. Only those names
          // are shared: a program that ends with an uncaught exception is "ok" here, with exitCode null and
          // the JDK-format trace on stderr, where jdk.mjs says "uncaught" (the JDK exits 1).
          // runtime/test/differential.mjs derives "uncaught" from that first stderr line.
          exitCode = m.exitCode == null ? null : m.exitCode & 0xff;
          const exited = exitCode ? `exit-${exitCode}` : "ok";
          finish(m.limited ? "output-limit" : m.needsInput ? "needs-input" : m.exception ? "trap" : exited, m.exception);
        } else if (m.type === "fatal") finish("fatal", { message: m.message });
      });
      const deob = path.join(this.dist, "compiler.wasm-deobfuscator.wasm");
      const bytes = typeof stdin === "string" ? new TextEncoder().encode(stdin) : stdin;
      w.postMessage({ type: "run", wasm, stdin: bytes, final, deobfuscator: deob, randomSeed, outputLimitChars, outputLimitLines }, [wasm.buffer]);
    });
  }
  async compileAndRun(source, opts = {}) {
    const c = await this.compile(source, opts.strictMode !== false);
    if (!c.ok) return { compile: c, status: "compile-error", stdout: "", stderr: "" };
    return { compile: { ok: true, ms: c.ms }, ...(await this.run(c.wasm, opts)) };
  }
  async close() { await this.compileWorker.terminate(); await this.spare.w.terminate(); }
}
