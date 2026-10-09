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
// Worker-side handlers shared by the browser Web Workers and Node worker_threads.
// Only the message transport differs between the two environments.
import { createToolchain, runProgram, compilerLoadOptions } from "./tjava-core.js";

// ---- compile worker: one per page, long-lived ----
// in:  {type:"init", compilerWasm, sdkUrl|sdk, classlibUrl|classlib}  -> {type:"ready", ms}
// in:  {type:"compile", id, source, strictMode}                        -> {type:"compiled", id, ok, wasm, ...}
export function compileWorker(load, fetchBytes, post) {
  let toolchain = null;
  return async (msg) => {
    if (msg.type === "init") {
      const t0 = Date.now();
      const teavm = await load(msg.compilerWasm, compilerLoadOptions);
      const [sdk, classlib] = await Promise.all([fetchBytes(msg.sdk), fetchBytes(msg.classlib)]);
      toolchain = createToolchain(teavm.exports, sdk, classlib);
      post({ type: "ready", ms: Date.now() - t0 });
    } else if (msg.type === "compile") {
      const r = toolchain.compile(msg.source, { strictMode: msg.strictMode !== false });
      const transfer = r.wasm ? [r.wasm.buffer] : [];
      post({ type: "compiled", id: msg.id, ...r }, transfer);
    }
  };
}

// ---- run worker: a fresh one per run; the page/parent kills it with terminate() at the deadline ----
// in:  {type:"run", wasm, stdin, final?, deobfuscator, randomSeed?, outputLimitChars?, outputLimitLines?}
// out: {type:"out"|"err", text} as the program prints, then {type:"done", exception, exitCode, needsInput, ms}.
//      Each message is a piece of the output stream, not a line: it usually ends at a newline, but a
//      line longer than tjava-core's chunk size (8192 code units), or one the program flushed before its
//      end, arrives as several pieces with no newline between them. A consumer must concatenate the
//      pieces, never render each as a line.
// Output is posted as it is printed, not batched: batching would have to hold text back, and text
// held when the program enters a silent infinite loop could never be sent (the worker is blocked).
// outputLimitLines counts finished lines (pieces that end in a newline); unfinished pieces, which a flush
// or a long line produces, are bounded by the character cap.
// A program that prints without end would flood the page instead, so output is capped here: past
// the cap the worker posts {type:"limit"}, stops forwarding, and aborts the program by throwing from
// the output callback (the deadline + terminate() remains the backstop).
export class OutputLimitError extends Error {}
export const OUTPUT_LIMIT_CHARS = 4_000_000; // the default cap; a run may pass its own
export function runWorker(load, post) {
  return async (msg) => {
    if (msg.type !== "run") return;
    const t0 = Date.now();
    const limitChars = msg.outputLimitChars ?? OUTPUT_LIMIT_CHARS;
    const limitLines = msg.outputLimitLines ?? 250_000;
    let chars = 0, lines = 0, limited = false;
    const emit = (type) => (text) => {
      if (limited) throw new OutputLimitError("output limit exceeded");
      chars += text.length;
      // Once limitLines lines are finished, any piece starts one line too many, so it is not shown.
      if (chars > limitChars || lines >= limitLines) {
        limited = true;
        post({ type: "limit", chars, lines });
        throw new OutputLimitError("output limit exceeded");
      }
      if (text.endsWith("\n")) lines++;
      post({ type, text });
    };
    const r = await runProgram(load, msg.wasm, {
      stdin: msg.stdin || new Uint8Array(0),
      final: msg.final !== false,
      deobfuscator: msg.deobfuscator || null,
      randomSeed: msg.randomSeed,
      onOut: emit("out"),
      onErr: emit("err"),
      collect: false,
    });
    post({ type: "done", exception: r.exception, exitCode: r.exitCode, needsInput: r.needsInput, limited, ms: Date.now() - t0 });
  };
}
