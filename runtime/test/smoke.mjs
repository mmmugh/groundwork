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
// The smallest proof the runtime exists: compile and run Hello World through the Node runner.
import { fileURLToPath } from "node:url";
import { NodeRunner } from "../runner/node-runner.mjs";
const DIST = fileURLToPath(new URL("../dist/fork/", import.meta.url));
const r = new NodeRunner(DIST);
const out = await r.compileAndRun('void main() { IO.println("Hello, world!"); }', { deadlineMs: 10000 });
await r.close();
const ok = out.status === "ok" && out.stdout === "Hello, world!\n";
console.log(`${ok ? "ok  " : "FAIL"}  Hello World through the fork (status=${out.status}, stdout=${JSON.stringify(out.stdout)})`);
process.exit(ok ? 0 : 1);
