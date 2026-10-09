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
// worker_threads entry: the same protocol handlers the browser workers use.
import { parentPort, workerData } from "node:worker_threads";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compileWorker, runWorker } from "./worker-protocol.js";
const { load } = await import(pathToFileURL(path.join(workerData.dist, "compiler.wasm-runtime.mjs")).href);
const post = (m, t) => parentPort.postMessage(m, t || []);
const handle = workerData.role === "compile"
  ? compileWorker(load, async (p) => new Int8Array(fs.readFileSync(p)), post)
  : runWorker(load, post);
parentPort.on("message", (m) => handle(m).catch((e) => post({ type: "fatal", message: String(e && e.stack || e) })));
post({ type: "spawned" });
