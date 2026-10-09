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
// tjava-core.js: environment-agnostic compile + run for the teavm-javac fork.
// Imported unchanged by: Node (build-time checks, worker_threads) and browser Web Workers.
// `load` is TeaVM's WasmGC runtime loader (compiler.wasm-runtime.js `load`).

// ---------- compile side ----------
// compiler.wasm built by the fork is itself compiled against the patched classlib and imports
// teavmConsole.getcharStdin (javac reaches System.in); the compiler never reads stdin, so give it EOF.
// It imports teavm-0016's flushStdout and flushStderr too, which it has no use for.
export const compilerLoadOptions = {
  stackDeobfuscator: { enabled: false },
  installImports(o) {
    o.teavmConsole.getcharStdin = () => -1;
    o.teavmConsole.flushStdout = () => {};
    o.teavmConsole.flushStderr = () => {};
  },
};

// The package of the first class javac wrote in org.teavm or a package under it ("org/teavm/jso/JSBody.class" gives
// "org.teavm.jso"), or null. A box may declare no class there (C-1): TeaVM gives those names powers no Java program
// has, honoring an annotation named org.teavm.jso.JSBody or org.teavm.interop.Import whoever declares it, so a box that
// declared its own would run JavaScript, or call the host, in its run worker, where import() reaches the network and
// the doors cannot remove it (web/runner/doors.js). S1 keeps org.teavm.jso out of the compile classlib; this keeps a box
// from declaring it. The JDK has no such rule (it compiles these boxes), so the words are the course's own.
function reservedPackage(classFiles) {
  const file = classFiles.find((f) => f.startsWith("org/teavm/"));
  return file ? file.slice(0, file.lastIndexOf("/")).replace(/\//g, ".") : null;
}

export function createToolchain(compilerLib, sdkBytes, classlibBytes) {
  let c = null;
  function fresh() {
    c = compilerLib.createCompiler();
    c.setSdk(sdkBytes);
    c.setTeaVMClasslib(classlibBytes);
  }
  fresh();
  const diag = (phase, d) => ({
    phase,
    severity: String(d.severity ?? d.kind ?? ""),
    message: String(d.message ?? d),
    line: typeof d.lineNumber === "number" ? d.lineNumber : undefined,
    column: typeof d.columnNumber === "number" ? d.columnNumber : undefined,
  });
  return {
    compile(source, { strictMode = true, fileName = "Main.java" } = {}) {
      const diagnostics = [];
      const t0 = Date.now();
      const done = (r) => ({ ...r, diagnostics, ms: Date.now() - t0 });
      try {
        c.clearSourceFiles();
        c.clearOutputFiles();
        c.addSourceFile(fileName, source);
        let reg = c.onDiagnostic((d) => diagnostics.push(diag("javac", d)));
        let ok;
        try { ok = c.compile(); } finally { reg.destroy(); }
        if (!ok) return done({ ok: false, stage: "javac" });
        const reserved = reservedPackage(Array.from(c.listOutputFiles()));
        if (reserved) {
          diagnostics.push({ phase: "package", severity: "ERROR", message: `package ${reserved} is reserved for the runtime: ` +
            "a box cannot declare classes in org.teavm or in a package under it" });
          return done({ ok: false, stage: "package" });
        }
        const mains = Array.from(c.detectMainClasses());
        if (mains.length !== 1) {
          diagnostics.push({ phase: "main", severity: "ERROR",
            message: mains.length ? "Multiple main methods found" : "Main method not found" });
          return done({ ok: false, stage: "main" });
        }
        // detectMainClasses names a class as its file does (foo/Main); TeaVM takes the class's name (foo.Main), and given
        // the other finds no main to export, so a box with a package statement would compile and then fail to start.
        const mainClass = mains[0].replace(/\//g, ".");
        reg = c.onDiagnostic((d) => diagnostics.push(diag("teavm", d)));
        try {
          ok = c.generateWebAssembly({ outputName: "app", mainClass, strictMode });
        } finally { reg.destroy(); }
        if (!ok) return done({ ok: false, stage: "teavm" });
        const w = c.getWebAssemblyOutputFile("app.wasm");
        const wasm = new Uint8Array(w.buffer, w.byteOffset, w.byteLength).slice();
        return done({ ok: true, wasm, mainClass });
      } catch (e) {
        // The compiler itself crashed (e.g. a Wasm trap inside TeaVM). Its state is suspect: rebuild it
        // so the next compile starts clean instead of wedging (the published playground wedges here).
        try { fresh(); } catch (_) { /* reported below */ }
        return done({ ok: false, stage: "crash", crash: String((e && e.message) || e) });
      }
    },
  };
}

// ---------- run side ----------
// stdin: the bytes a run reads, given up front. A run whose stdin is final (the default) sees end of input
// when they run out, as a program with piped input does. A run whose stdin is not final (D16's replay) stops
// with needsInput the moment the program reads past them: the page asks the reader, then runs the program
// again from the start with one answer more.
// onOut/onErr(text) receive text at every newline, at every flush and at program end.
// With the fork, TeaVM's stack deobfuscator (compiler.wasm-deobfuscator.wasm) + the debug info embedded
// in app.wasm give real frames ("at Main.main(Main.java:3)"). The JDK hides the exception's own
// constructor frames and never shows launcher internals; cleanStackTrace() does the same.
export function makeStackCleaner() {
  let leading = false;
  return (line) => {
    if (!line.startsWith("\tat ")) {
      leading = true; // header line: "Exception in thread ...", "Caused by: ...", or user text
      return line;
    }
    // TeaVM internals (Fiber launcher, StrictArithmetic helper) and the generated export shim
    if (line.startsWith("\tat org.teavm.") || line.includes("_$caller$exported$")) return null;
    if (leading && /^\tat (\S+\.<init>|java\.lang\.Throwable\.fillInStackTrace)\(/.test(line)) return null;
    leading = false;
    return line;
  };
}

// System.exit(status) calls the host import teavmConsole.exit (patch teavm-0012), which must not return:
// it throws this, which unwinds past every Java catch and finally, as the JDK skips them on exit.
class ProgramExit {
  constructor(status) { this.status = status; }
}

// A run whose stdin is not final stops here when the program reads past it. Thrown from the host import, it
// unwinds past every Java catch and finally, as ProgramExit does.
class NeedsInput {}

// The seed behind every new Random() and Math.random() in one run (patch teavm-0014): the program asks
// for it through the host import teavmRandom.seed. D16's replay passes the same randomSeed on every replay
// of a Run, so the numbers repeat; without one, the run gets a fresh seed. A whole number from 0 to
// 2^53 - 1, since it crosses into Wasm as a double.
function runSeed(randomSeed) {
  if (randomSeed == null) return Math.floor(Math.random() * 2 ** 53);
  if (!Number.isSafeInteger(randomSeed) || randomSeed < 0)
    throw new TypeError(`randomSeed must be a whole number from 0 to 2^53 - 1, not ${randomSeed}`);
  return randomSeed;
}

// A line is handed on in pieces of this many UTF-16 code units once it grows that long without a newline,
// so a program that prints without ever ending its line still reaches onOut/onErr (and the worker's
// output cap) instead of growing one string until the worker runs out of memory.
const LINE_PIECE = 8192;
const describeThrown = (e) => ({
  jsType: e && e.constructor ? e.constructor.name : typeof e,
  isWasmTrap: typeof WebAssembly !== "undefined" && e instanceof WebAssembly.RuntimeError,
  message: String((e && e.message) || e),
});

// deobfuscator is compiler.wasm-deobfuscator.wasm as a path (Node) or as a compiled WebAssembly.Module (the page, which
// never hands TeaVM's loader a URL: it would stream-compile it and need a .wasm content type, D85); the loader takes
// either as `path`.
// exitCode is the status the program passed to System.exit, or null if it never called it.
export async function runProgram(load, wasmBytes, { stdin = new Uint8Array(0), final = true, readByte, onOut, onErr,
    deobfuscator = null, cleanStackTraces = true, collect = true, randomSeed } = {}) {
  const seed = runSeed(randomSeed);
  let pos = 0;
  const nextByte = readByte || (() => {
    if (pos < stdin.length) return stdin[pos++];
    if (!final) throw new NeedsInput();
    return -1;
  });
  // System.out/err on WasmGC call putchar once per UTF-16 code unit (JSStdoutPrintStream), so a
  // code unit is appended as-is; surrogate pairs join up naturally. Flush at newline, when the line
  // reaches LINE_PIECE or the program flushes (never between the two halves of a surrogate pair), and at end.
  // The filter (the stack cleaner) judges a whole line by its start, so a line handed on in pieces
  // is kept or dropped as its first piece was.
  const mk = (cb, filter) => {
    let line = "";
    let all = "";
    let keep = null; // the filter's verdict on the line now being handed on in pieces
    return {
      put(c) {
        line += String.fromCharCode(c);
        if (c === 10) this.flush();
        else if (line.length >= LINE_PIECE) this.flush(true);
      },
      flush(piece = false) {
        let text = line;
        line = "";
        const last = text.charCodeAt(text.length - 1);
        if (piece && last >= 0xd800 && last <= 0xdbff) { line = text.slice(-1); text = text.slice(0, -1); }
        if (!text) return;
        if (keep === null) keep = !filter || filter(text) !== null;
        const kept = keep;
        if (!piece) keep = null;
        if (!kept) return;
        if (collect) all += text;
        if (cb) cb(text);
      },
      end() { this.flush(); return all; },
    };
  };
  const out = mk(onOut), err = mk(onErr, deobfuscator && cleanStackTraces ? makeStackCleaner() : null);
  const app = await load(wasmBytes, {
    stackDeobfuscator: deobfuscator ? { enabled: true, path: deobfuscator } : { enabled: false },
    installImports(o) {
      o.teavmConsole.putcharStdout = (c) => out.put(c);
      o.teavmConsole.putcharStderr = (c) => err.put(c);
      // Patch teavm-0016: a flush of System.out or System.err (IO.print flushes) hands on the unfinished line
      // at once, as a piece, so text the program flushed before it ran away or stopped for input is shown. A
      // piece keeps the stack cleaner's verdict for its line until the line's newline.
      o.teavmConsole.flushStdout = () => out.flush(true);
      o.teavmConsole.flushStderr = () => err.flush(true);
      // Used only by the patched classlib (TConsoleInputStream). Harmless for unpatched builds.
      o.teavmConsole.getcharStdin = () => nextByte();
      o.teavmConsole.exit = (status) => { throw new ProgramExit(status); };
      // Used only by the patched classlib (TRandom). Harmless for unpatched builds.
      o.teavmRandom = { seed: () => seed };
    },
  });
  let exception = null, exitCode = null, needsInput = false;
  try {
    app.exports.main([]);
  } catch (e) {
    if (e instanceof ProgramExit) exitCode = e.status;
    else if (e instanceof NeedsInput) needsInput = true;
    else exception = describeThrown(e);
  }
  // Hand on what the program left without a newline. onOut/onErr may throw here just as during the run
  // (the worker's output cap does), and that must end in a result, not escape runProgram.
  for (const stream of [out, err]) {
    try { stream.flush(); } catch (e) { exception ??= describeThrown(e); }
  }
  return { stdout: out.end(), stderr: err.end(), exception, exitCode, needsInput };
}
