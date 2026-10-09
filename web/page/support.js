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
// Can this browser run Java? Decided by feature, never by the browser's name (DESIGN section 5). The fork needs
// module workers and three WebAssembly proposals, the ones compiler.wasm and every compiled program use: WasmGC,
// typed function references and legacy exception handling. Each test is the smallest module a browser accepts
// only when it has the feature (checked with WebAssembly.validate in Node 25, with a corrupted module as the control).
// Kept to syntax every browser with module scripts parses, so an old one still reaches the message.
var FEATURES = {
  "WebAssembly GC": [0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x03, 0x01, 0x5f, 0x00],
  "WebAssembly typed function references": [0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x04, 0x01, 0x60,
    0x00, 0x00, 0x06, 0x07, 0x01, 0x63, 0x00, 0x00, 0xd0, 0x00, 0x0b],
  // Legacy exception handling: a function whose body is a try (0x06) ... end. A tag section would also validate under
  // the newer exnref proposal, which is not the try/catch opcodes compiler.wasm and every program use. In Node 25 this
  // module validates, and does not with --no-experimental-wasm-legacy-eh.
  "WebAssembly exception handling": [0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x04, 0x01, 0x60, 0x00,
    0x00, 0x03, 0x02, 0x01, 0x00, 0x0a, 0x07, 0x01, 0x05, 0x00, 0x06, 0x40, 0x0b, 0x0b],
};
function validates(bytes) {
  try { return WebAssembly.validate(new Uint8Array(bytes)); } catch (e) { return false; }
}
// A browser reads a Worker's options.type only if it supports module workers (the web.dev test).
function moduleWorkers() {
  var supported = false;
  try { new Worker("blob://", { get type() { supported = true; return "module"; } }).terminate(); } catch (e) { /* the getter already answered */ }
  return supported;
}
export function javaSupport() {
  var missing = [];
  if (typeof Worker !== "function") missing.push("Web Workers");
  else if (!moduleWorkers()) missing.push("module workers");
  if (typeof WebAssembly !== "object" || typeof WebAssembly.validate !== "function") missing.push("WebAssembly");
  else for (var name in FEATURES) if (!validates(FEATURES[name])) missing.push(name);
  return { ok: missing.length === 0, missing: missing };
}
// Can this browser run the scratchpad (jshell on Ristretto, web/page/scratchpad.js)? Everything javaSupport() asks,
// two WebAssembly features Ristretto's interpreter uses and the fork does not. The scratchpad needs no secure page: it
// checks its download with crypto.subtle where the browser has one (https, or localhost) and with the course's own
// SHA-256 where it has not (page/sha256.js, D79). Every browser that passes javaSupport() has both features; they are
// still tested, by feature. Each module validates in Node 25,
// Chromium, WebKit and Firefox, and its control does not: the same module with its feature's instruction prefix
// (0xfd for SIMD, 0xfc for bulk memory) replaced by 0xff, an opcode that does not exist.
var SCRATCHPAD_FEATURES = {
  // a function returning v128.const 0
  "WebAssembly SIMD": [0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7b,
    0x03, 0x02, 0x01, 0x00, 0x0a, 0x16, 0x01, 0x14, 0x00, 0xfd, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0b],
  // a function doing memory.fill on a one-page memory
  "WebAssembly bulk memory": [0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x04, 0x01, 0x60, 0x00, 0x00,
    0x03, 0x02, 0x01, 0x00, 0x05, 0x03, 0x01, 0x00, 0x01, 0x0a, 0x0d, 0x01, 0x0b, 0x00, 0x41, 0x00, 0x41, 0x00, 0x41,
    0x00, 0xfc, 0x0b, 0x00, 0x0b],
};
export function scratchpadSupport() {
  var missing = javaSupport().missing.slice();
  if (typeof WebAssembly === "object" && typeof WebAssembly.validate === "function")
    for (var name in SCRATCHPAD_FEATURES) if (!validates(SCRATCHPAD_FEATURES[name])) missing.push(name);
  return { ok: missing.length === 0, missing: missing };
}
// What a box says when running it went wrong: web/page/box.js says it for a run, app.js when the Run code did not
// load or threw while it loaded. One source, so the two never drift apart.
export var FATAL = "Something went wrong running this box. Reload the page and try again.";
// What a box that ran out of time (box.js) and a scratchpad that could not start in time (scratchpad.js) add on a page
// that is not secure, as isSecureContext says (never the browser's name): over plain http, Safari on a Mac downloaded the
// scratchpad and then had not started jshell in 240 seconds, and a box ran noticeably slowly (D90). Every browser on
// iPhone and iPad runs on Safari's engine, WebKit. Chrome and Firefox start it there (D91).
export var PLAIN_HTTP_SLOW = "On a plain http address, Safari and every iPhone or iPad browser run Java much more slowly; " +
  "open the course over https or from localhost.";
