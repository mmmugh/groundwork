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
// Runs every case on the fork and on the pinned JDK. Passes only when each difference is listed in
// known-differences.json with a reason, and each listed difference is still exactly what was recorded.
// A listed case that has become identical is a failure too: the list must shrink when the fork improves.
// A difference only some platforms' JDK shows (D112: Math.log on x86-64) names them in its entry's "platforms", spelled
// process.platform-process.arch ("linux-x64"); there it is held as any entry is, everywhere else the case must be
// identical, and --record keeps the entry as it was.
//   node runtime/test/differential.mjs            the gate
//   node runtime/test/differential.mjs --record   rewrite the list from this run (a new entry gets
//                                                 reason "UNEXPLAINED", a changed one "UNEXPLAINED (was:
//                                                 <old reason>)"; the gate rejects both until reviewed)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cases } from "./cases.mjs";
import { NodeRunner } from "../runner/node-runner.mjs";
import { checkJdk, runJdk } from "./jdk.mjs";
import { outcome, jdkOutcome, same } from "./compare.mjs";

const HERE = path.resolve(fileURLToPath(new URL(".", import.meta.url)));
const RUNTIME = path.resolve(HERE, "..");
const LIST = path.join(HERE, "known-differences.json");
const WORK = path.join(RUNTIME, ".work", "jdk-cases");

// A difference that changed no longer has a reason: the old one explained something else.
const unexplained = (old) => (old ?? "").startsWith("UNEXPLAINED") ? old : `UNEXPLAINED (was: ${old})`;

checkJdk();
const PLATFORM = `${process.platform}-${process.arch}`;
const listed = fs.existsSync(LIST) ? JSON.parse(fs.readFileSync(LIST, "utf8")) : {};
const elsewhere = (e) => e.platforms !== undefined && !e.platforms.includes(PLATFORM);
const known = Object.fromEntries(Object.entries(listed).filter(([, e]) => !elsewhere(e)));
// JF_DIST points the gate at another build, which is how a negative proof runs it without a patch.
const runner = new NodeRunner(process.env.JF_DIST || path.join(RUNTIME, "dist", "fork"));
const problems = [], recorded = {};
let ran = 0;
for (const c of cases) {
  const fork = outcome(await runner.compileAndRun(c.src, { stdin: c.stdin ?? "", deadlineMs: 10000 }));
  const jdk = jdkOutcome(runJdk(c.src, c.stdin, path.join(WORK, c.id)));
  ran++;
  const entry = known[c.id];
  if (same(fork, jdk)) {
    if (entry) problems.push(`${c.id}: listed as a difference but now identical; delete its entry`);
    continue;
  }
  const changed = entry && (!same(entry.fork, fork) || !same(entry.jdk, jdk));
  recorded[c.id] = { reason: !entry ? "UNEXPLAINED" : changed ? unexplained(entry.reason) : entry.reason,
    ...(entry?.platforms && { platforms: entry.platforms }), fork, jdk };
  const only = listed[c.id] && !entry ? ` on ${PLATFORM} (its entry lists only ${listed[c.id].platforms.join(", ")})` : "";
  if (!entry) problems.push(`${c.id}: NEW difference${only}\n    fork ${JSON.stringify(fork)}\n    jdk  ${JSON.stringify(jdk)}`);
  else if (changed) problems.push(`${c.id}: the difference changed; re-record and review\n    fork ${JSON.stringify(fork)}\n    jdk  ${JSON.stringify(jdk)}`);
  else if (!entry.reason || entry.reason.startsWith("UNEXPLAINED")) problems.push(`${c.id}: listed without a reason`);
}
await runner.close();
for (const id of Object.keys(listed)) if (!cases.some((c) => c.id === id)) problems.push(`${id}: listed but no such case`);
if (process.argv.includes("--record")) {
  // In case order, as before; another platform's entry stays unless the case now differs here too, when this
  // platform's UNEXPLAINED entry takes its place and the gate rejects it until someone reviews both.
  const out = {};
  for (const c of cases) {
    const e = recorded[c.id] ?? (listed[c.id] && elsewhere(listed[c.id]) ? listed[c.id] : undefined);
    if (e) out[c.id] = e;
  }
  fs.writeFileSync(LIST, JSON.stringify(out, null, 1) + "\n");
  console.log(`recorded ${Object.keys(recorded).length} differences to ${LIST}`);
}
for (const p of problems) console.log(`  !! ${p}`);
console.log(`${ran} cases, ${Object.keys(recorded).length} differing, ${problems.length} problem(s)`);
if (ran === 0) { console.log("no case ran at all"); process.exit(1); }
process.exit(problems.length ? 1 : 0);
