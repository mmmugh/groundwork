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
// The reference: the pinned Temurin JDK, run the same way every time.
import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { javaHome } from "../jdk-home.mjs";
export const JAVA_HOME = javaHome();
export const JAVA = path.join(JAVA_HOME, "bin", "java");
export const JAVAC = path.join(JAVA_HOME, "bin", "javac");
export const JAVA_FLAGS = ["-Dstdout.encoding=UTF-8", "-Dstderr.encoding=UTF-8", "-Dstdin.encoding=UTF-8",
  "-Dfile.encoding=UTF-8", "-Duser.language=en", "-Duser.country=US"];

export function checkJdk() {
  const p = spawnSync(JAVA, ["-version"], { encoding: "utf8" });
  if (p.status !== 0 || !/"25\.0\.4\.1"/.test(p.stderr)) {
    throw new Error(`the pinned JDK 25.0.4.1 is not at ${JAVA}: run runtime/build.sh`);
  }
}

export function runJdk(src, stdin, dir) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "Main.java"), src);
  const p = spawnSync(JAVA, [...JAVA_FLAGS, "Main.java"], { cwd: dir, input: stdin ?? "", encoding: "utf8",
    timeout: 30000, env: { PATH: "/usr/bin:/bin", LANG: "en_US.UTF-8", HOME: process.env.HOME } });
  const stderr = p.stderr ?? "";
  const status = p.status === 0 ? "ok"
    : /error: compilation failed/.test(stderr) ? "compile-error"
    : stderr.startsWith("Exception in thread") ? "uncaught"
    : p.signal ? `killed-${p.signal}` : `exit-${p.status}`;
  return { status, stdout: p.stdout ?? "", stderr, stderrHead: stderr.split("\n")[0] };
}

// The environment runJdk gives a run (and build/Jdk.java's cleanEnvironment the audit's): nothing of the caller's.
const ENV = { PATH: "/usr/bin:/bin", LANG: "en_US.UTF-8", HOME: process.env.HOME };

// javac's report on the command line, as the diagnostics web/page/check.js reads from the browser runtime's javac: one
// per "Main.java:<line>: error: <message>" line, its column from the caret under the echoed source line, and the
// indented lines after the caret ("symbol: ...", "location: ...") joined to the message, where javax.tools puts them.
function javacDiagnostics(stderr) {
  const lines = stderr.split("\n"), out = [];
  for (let i = 0; i < lines.length; i++) {
    const m = /^Main\.java:(\d+): error: (.*)$/.exec(lines[i]);
    if (!m) continue;
    const d = { phase: "javac", line: Number(m[1]), column: null, message: m[2] };
    const caret = (lines[i + 2] ?? "").indexOf("^");
    if (caret >= 0) {
      d.column = caret + 1;
      for (let j = i + 3; j < lines.length && /^\s/.test(lines[j]); j++) d.message += "\n" + lines[j];
    }
    out.push(d);
  }
  return out;
}

// The runner web/page/check.js's runCheck drives (compile, run and compileAndRun, as NodeRunner has them), on the pinned
// JDK, for the three-way proof of every check (runtime/test/proofs.mjs). javac compiles Main.java into a directory of its
// own; each run is a fresh `java -cp <dir> Main` with its stdin, killed at the deadline or the page's output caps. A
// result has NodeRunner's shape, so the page's code reads both alike: an uncaught exception ends a run "ok" with the
// JDK's trace on stderr, and System.exit(N), N not 0, is "exit-N" with exitCode N. Unlike NodeRunner it cannot tell
// System.exit(0) from an ordinary end: both are "ok" with exitCode null, so a method that calls System.exit(0) still
// fails its check, in other words ("the program ended unexpectedly").
export class JdkRunner {
  constructor(dir) {
    this.dir = dir;
    this.n = 0;
    fs.rmSync(dir, { recursive: true, force: true });
  }
  async compile(source) {
    const dir = path.join(this.dir, String(++this.n));
    fs.mkdirSync(path.join(dir, "classes"), { recursive: true });
    fs.writeFileSync(path.join(dir, "Main.java"), source);
    const p = spawnSync(JAVAC, ["--release", "25", "-encoding", "UTF-8", "-d", "classes", "Main.java"],
      { cwd: dir, encoding: "utf8", timeout: 60000, env: ENV });
    if (p.status !== 0) return { ok: false, stage: "javac", diagnostics: javacDiagnostics(p.stderr ?? "") };
    // runCheck copies what compile gave as "wasm" with slice() before each input run (NodeRunner hands the bytes to a
    // worker); the classes' directory needs no copy.
    return { ok: true, wasm: { classes: path.join(dir, "classes"), slice() { return this; } }, diagnostics: [] };
  }
  run(compiled, { stdin = "", deadlineMs = 5000, outputLimitChars = Infinity, outputLimitLines = Infinity } = {}) {
    return new Promise((resolve) => {
      const p = spawn(JAVA, [...JAVA_FLAGS, "-cp", compiled.classes, "Main"], { env: ENV });
      let stdout = "", stderr = "", lines = 0, stopped = null;
      const stop = (why) => { if (!stopped) { stopped = why; p.kill("SIGKILL"); } };
      const timer = setTimeout(() => stop("timeout"), deadlineMs);
      p.stdout.setEncoding("utf8");
      p.stderr.setEncoding("utf8");
      p.stdout.on("data", (s) => {
        stdout += s;
        lines += s.split("\n").length - 1;
        if (stdout.length > outputLimitChars || lines > outputLimitLines) stop("output-limit");
      });
      p.stderr.on("data", (s) => { stderr += s; });
      p.stdin.on("error", () => {}); // a program that ends without reading its input closes stdin under us
      p.stdin.end(stdin);
      p.on("close", (code) => {
        clearTimeout(timer);
        const uncaught = code === 1 && /Exception in thread "/.test(stderr);
        const status = stopped ?? (code === 0 || uncaught ? "ok" : code === null ? "crashed" : `exit-${code}`);
        resolve({ status, exception: null, exitCode: /^exit-/.test(status) ? code : null, stdout, stderr });
      });
    });
  }
  async compileAndRun(source, opts = {}) {
    const c = await this.compile(source);
    if (!c.ok) return { compile: c, status: "compile-error", stdout: "", stderr: "" };
    return { compile: { ok: true }, ...(await this.run(c.wasm, opts)) };
  }
}
