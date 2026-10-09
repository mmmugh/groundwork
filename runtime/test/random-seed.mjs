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
// D16: a Run replays the program from the start with the answers so far, so everything random must
// come out the same on every replay. Two runs with one randomSeed must print the same numbers from
// `new Random()` and Math.random(); another seed must print others.
import { fileURLToPath } from "node:url";
import { NodeRunner } from "../runner/node-runner.mjs";
// JF_DIST points the test at another build, which is how a negative proof runs it without a patch.
const r = new NodeRunner(process.env.JF_DIST || fileURLToPath(new URL("../dist/fork/", import.meta.url)));
const src = 'void main() { var g = new java.util.Random(); for (int i = 0; i < 5; i++) IO.print(g.nextInt(1000) + " "); IO.println(Math.random()); }';
// A run counts only when it finished cleanly: status "ok" and nothing on stderr. The runner reports a
// program that dies of an uncaught exception as "ok" with the trace on stderr (node-runner.mjs), and a
// run that failed partway prints the same prefix every time, so such a run is neither a replay nor
// "different numbers". This holds for the seed-43 run too.
const run = (seed) => r.compileAndRun(src, { randomSeed: seed }).then((o) => o.status === "ok" && !o.stderr
  ? { ok: true, text: o.stdout }
  : { ok: false, text: `(${o.status}) ${o.stdout}${o.stderr ? `[stderr ${o.stderr.split("\n")[0]}]` : ""}` });
const a1 = await run(42), a2 = await run(42), b = await run(43);
await r.close();
const same = a1.ok && a2.ok && a1.text === a2.text, differ = a1.ok && b.ok && a1.text !== b.text;
console.log(`  ${same ? "ok  " : "FAIL"}  the same seed replays the same numbers (${JSON.stringify(a1.text)} / ${JSON.stringify(a2.text)})`);
console.log(`  ${differ ? "ok  " : "FAIL"}  a different seed gives different numbers (${JSON.stringify(b.text)})`);
process.exit(same && differ ? 0 : 1);
