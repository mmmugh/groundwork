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
// Node glue: load a dist dir (compiler.wasm + runtime + both .bin) and expose compile/run.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createToolchain, runProgram, compilerLoadOptions } from "./tjava-core.js";

export async function loadDist(distDir) {
  const { load } = await import(pathToFileURL(path.join(distDir, "compiler.wasm-runtime.mjs")).href);
  const t0 = Date.now();
  const teavm = await load(path.join(distDir, "compiler.wasm"), compilerLoadOptions);
  const sdk = new Int8Array(fs.readFileSync(path.join(distDir, "compile-classlib-teavm.bin")));
  const rt = new Int8Array(fs.readFileSync(path.join(distDir, "runtime-classlib-teavm.bin")));
  const tc = createToolchain(teavm.exports, sdk, rt);
  const loadMs = Date.now() - t0;
  const deob = path.join(distDir, "compiler.wasm-deobfuscator.wasm");
  return {
    loadMs,
    compile: (src, opts) => tc.compile(src, opts),
    // real stack frames when the dist ships TeaVM's deobfuscator (all builds produce it)
    run: (wasm, opts) => runProgram(load, wasm, { deobfuscator: fs.existsSync(deob) ? deob : null, ...opts }),
  };
}
