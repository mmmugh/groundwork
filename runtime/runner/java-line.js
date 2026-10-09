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
// The JDK's own first line for the two failures that never come back from a program as a Java exception (the
// fork cannot let a program catch them, DESIGN.md section 2). Shared by NodeRunner and the browser's
// BrowserRunner. Each signature is the exact error a JavaScript engine raised for that failure, recorded by
// runtime/test/runner-safety.mjs (Node) and web/test/runner.mjs (Chromium, WebKit, Firefox), so no other crash
// or trap is mislabeled as one of these. One exception, marked where it stands: Node's huge-allocation trap was
// seen in a probe only.
export const OUT_OF_MEMORY = 'Exception in thread "main" java.lang.OutOfMemoryError: Java heap space';
export const STACK_OVERFLOW = 'Exception in thread "main" java.lang.StackOverflowError';
// status "trap": what runProgram's describeThrown reported for the error
export const STACK_OVERFLOW_TRAPS = [
  { jsType: "RangeError", message: "Maximum call stack size exceeded" }, // V8: Node, Chromium
  { jsType: "RangeError", message: "Maximum call stack size exceeded." }, // JavaScriptCore: WebKit (its own period)
  { jsType: "InternalError", message: "too much recursion" }, // SpiderMonkey: Firefox
];
// An array too large to allocate at all (new long[Integer.MAX_VALUE - 8]): each engine's Wasm trap.
export const OUT_OF_MEMORY_TRAPS = [
  // V8. Chromium: recorded by web/test/runner.mjs. Node gives the same trap, but that was seen in a probe only;
  // no Node test pins it (runtime/test/runner-safety.mjs runs no huge allocation).
  { jsType: "RuntimeError", message: "requested new array is too large" },
  // JavaScriptCore: WebKit. The suffix quotes the JavaScript that called into Wasm (the export wrapper TeaVM's
  // compiler.wasm-runtime.js generates), so a runtime that wraps its exports another way changes it.
  { jsType: "RuntimeError", message: "Failed to allocate new array (evaluating 'fn()')" },
  { jsType: "RuntimeError", message: "too many array elements" }, // SpiderMonkey: Firefox
];
// status "crashed": the message the runner recorded for a run worker that died
export const OUT_OF_MEMORY_CRASHES = [
  "ERR_WORKER_OUT_OF_MEMORY", // Node worker_threads
];
const matches = (list, e) => list.some((s) => s.jsType === e?.jsType && s.message === e?.message);
export function javaLineFor(status, exception) {
  if (status === "crashed" && OUT_OF_MEMORY_CRASHES.includes(exception?.message)) return OUT_OF_MEMORY;
  if (status === "trap" && matches(OUT_OF_MEMORY_TRAPS, exception)) return OUT_OF_MEMORY;
  if (status === "trap" && matches(STACK_OVERFLOW_TRAPS, exception)) return STACK_OVERFLOW;
  return null;
}
