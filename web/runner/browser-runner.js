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
// The page's runner: the browser twin of runtime/runner/node-runner.mjs, with the same result shape, so
// web/page/replay.js and web/page/check.js run unchanged against either. One long-lived compile worker per
// page; a fresh run worker per run, terminated at the deadline; a spare run worker kept warm.
import { javaLineFor } from "./java-line.js";

export class BrowserRunner {
  // base: the URL of the site root, which holds runner/ and runtime/.
  constructor(base, { compileDeadlineMs = 60_000 } = {}) {
    this.base = new URL(base);
    this.compileDeadlineMs = compileDeadlineMs;
    this.nextId = 1;
    this.startCompiler();
    this.spare = this.spawn();
  }
  worker(role) { return new Worker(new URL(`runner/browser-worker.js?role=${role}`, this.base), { type: "module" }); }
  runtime(name) { return new URL(`runtime/${name}`, this.base).href; }

  // The compile worker can die: an error, a "fatal", or no answer before the compile deadline. Every compile
  // waiting on it then gets a "crash" answer instead of waiting forever, and the next compile gets a fresh worker.
  // One that was ready is replaced at once, so the next compile finds its replacement warming up. One that never
  // started (compiler.wasm missing, a 404 or 5xx, no network, an instantiate failure) is replaced only when a compile
  // asks, one fresh worker per compile: replacing it at once would start worker after worker on its own, each
  // downloading the compiler again (Ruling 34).
  startCompiler() {
    const c = { w: this.worker("compile"), pending: new Map(), dead: null, started: false };
    c.ready = new Promise((resolve, reject) => { c.resolve = resolve; c.reject = reject; });
    c.ready.catch(() => {}); // compile() reports a failed start
    c.w.onmessage = (e) => {
      const m = e.data;
      if (m.type === "ready") { c.started = true; c.resolve(m.ms); }
      else if (m.type === "compiled") { const settle = c.pending.get(m.id); c.pending.delete(m.id); settle?.(m); }
      else if (m.type === "fatal") this.compilerDied(c, m.message);
    };
    c.w.onerror = (e) => { e.preventDefault(); this.compilerDied(c, e.message || "error"); };
    c.w.postMessage({ type: "init", compilerWasm: this.runtime("compiler.wasm"),
      sdk: this.runtime("compile-classlib-teavm.bin"), classlib: this.runtime("runtime-classlib-teavm.bin") });
    this.compiler = c;
  }
  compilerDied(c, message) {
    if (c.dead) return;
    c.dead = message;
    c.w.terminate();
    c.reject(new Error(message));
    for (const settle of c.pending.values()) settle({ ok: false, stage: "crash", crash: `compile worker died: ${message}`, diagnostics: [] });
    c.pending.clear();
    if (this.compiler === c && c.started) this.startCompiler();
  }
  async compile(source, strictMode = true) {
    if (this.compiler.dead) this.startCompiler();
    const c = this.compiler;
    try { await c.ready; } catch (e) { return { ok: false, stage: "crash", crash: `compile worker died: ${e.message}`, diagnostics: [] }; }
    const id = this.nextId++;
    return new Promise((resolve) => {
      const timer = setTimeout(() => this.compilerDied(c, `no answer within ${this.compileDeadlineMs} ms`), this.compileDeadlineMs);
      c.pending.set(id, (m) => { clearTimeout(timer); resolve(m); });
      c.w.postMessage({ type: "compile", id, source, strictMode });
    });
  }

  spawn() {
    const w = this.worker("run");
    return {
      w,
      ready: new Promise((resolve) => { w.onmessage = (e) => { if (e.data.type === "spawned") resolve(); }; }),
      death: new Promise((resolve) => { w.onerror = (e) => { e.preventDefault(); resolve(e.message || "error"); }; }),
    };
  }
  // wasm is transferred to the run worker, so a caller that runs one program again (replay) passes a copy.
  // onOut/onErr receive the output as it arrives, in pieces, not lines. signal: an AbortSignal; aborting ends
  // the run at once with status "canceled".
  async run(wasm, { stdin = "", final = true, deadlineMs = 5000, randomSeed, outputLimitChars, outputLimitLines,
      onOut, onErr, signal } = {}) {
    const { w, ready, death } = this.spare;
    this.spare = this.spawn();
    // A spare says it has spawned only once it has fetched the deobfuscator (browser-worker.js), so Stop must not wait
    // for that: an abort ends the wait too, and the run below then ends at once as canceled (C-3).
    const stopped = new Promise((resolve) => signal?.addEventListener("abort", resolve, { once: true }));
    if (!signal?.aborted) await Promise.race([ready, death, stopped]);
    let stdout = "", stderr = "", limit = null, settled = false, exitCode = null, timer = null;
    const t0 = performance.now();
    return new Promise((resolve) => {
      const finish = (status, exception) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal?.removeEventListener("abort", cancel);
        w.terminate();
        const line = javaLineFor(status, exception);
        // After anything the program already wrote to stderr, where the JDK prints it (runtime/test/runner-faults.mjs).
        if (line) { stderr += line + "\n"; onErr?.(line + "\n"); }
        resolve({ status, exception, exitCode, stdout, stderr, ms: performance.now() - t0 });
      };
      const cancel = () => finish("canceled", null);
      if (signal?.aborted) return cancel();
      signal?.addEventListener("abort", cancel);
      timer = setTimeout(() => finish(limit ? "output-limit" : "timeout", null), deadlineMs);
      death.then((message) => finish("crashed", { message }));
      w.onmessage = (e) => {
        const m = e.data;
        if (m.type === "out") { stdout += m.text; onOut?.(m.text); }
        else if (m.type === "err") { stderr += m.text; onErr?.(m.text); }
        else if (m.type === "limit") limit = m;
        else if (m.type === "done") {
          exitCode = m.exitCode == null ? null : m.exitCode & 0xff;
          const exited = exitCode ? `exit-${exitCode}` : "ok";
          finish(m.limited ? "output-limit" : m.needsInput ? "needs-input" : m.exception ? "trap" : exited, m.exception);
        } else if (m.type === "fatal") finish("fatal", { message: m.message });
      };
      const bytes = typeof stdin === "string" ? new TextEncoder().encode(stdin) : stdin;
      w.postMessage({ type: "run", wasm, stdin: bytes, final, randomSeed, outputLimitChars, outputLimitLines }, [wasm.buffer]);
    });
  }
  async compileAndRun(source, opts = {}) {
    const c = await this.compile(source, opts.strictMode !== false);
    if (!c.ok) return { compile: c, status: "compile-error", stdout: "", stderr: "" };
    return { compile: { ok: true, ms: c.ms }, ...(await this.run(c.wasm, opts)) };
  }
  close() { this.compiler.w.terminate(); this.spare.w.terminate(); }
}
