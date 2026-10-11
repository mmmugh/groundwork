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
// The acceptance keeps private text out of the logs a public CI job shows (M5, DESIGN section 4): a check that fails
// prints its label and Check's verdict, never what was typed into the box (a worked solution or a mistake). This runs
// the acceptance on a copy of its fixture in which a worked solution is wrong and a mistake is right, each carrying a
// marker in a comment, and requires the run to fail on both, print neither marker, and keep both in its results.json
// (under build/.work/, which CI never uploads), to debug with.
//   node web/test/acceptance-logs.mjs [chromium|webkit|firefox]    (Chromium when no engine is named)
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { REPO, ENGINES, check, done, workDir } from "./harness.mjs";

const engine = process.argv[2] ?? "chromium";
if (process.argv.length > 3 || !Object.hasOwn(ENGINES, engine)) {
  console.log("usage: node web/test/acceptance-logs.mjs [chromium|webkit|firefox]");
  process.exit(2);
}
const WORKED = "WORKED-MARKER-31d7", MISTAKE = "MISTAKE-MARKER-8e2a";
const vol = path.join(workDir("acceptance-logs"), "vol-logs");
fs.cpSync(path.join(REPO, "web/test/vol-accept"), vol, { recursive: true });
// #6 ("Make it print Ada"): its second worked solution now prints another name, and its mistake the right one.
const file = path.join(vol, "content/_solutions.md"), before = fs.readFileSync(file, "utf8");
const after = before.replace('    String name = "Ada";\n', `    String name = "Bo"; // ${WORKED}\n`)
  .replace('    IO.println("ada");\n', `    IO.println("Ada"); // ${MISTAKE}\n`);
fs.writeFileSync(file, after);
check("the copy's #6 has a wrong worked solution and a right mistake, each with its marker",
  after.includes(WORKED) && after.includes(MISTAKE), null);
const r = spawnSync(process.execPath, ["web/test/acceptance.mjs", "--volume", path.relative(REPO, vol), "ch01", engine],
  { cwd: REPO, encoding: "utf8" });
const out = r.stdout + r.stderr;
check(`${engine}: the acceptance fails the wrong worked solution and the right mistake, and nothing else`,
  r.status === 1 && /FAIL {2}\w+: ch01-first-steps: ch01-first-steps#6: worked solution 2 passes its Check/.test(out)
    && /FAIL {2}\w+: ch01-first-steps: ch01-first-steps#6: mistake 1 fails its Check/.test(out) && / 2 failed, /.test(out),
  { status: r.status, failed: out.split("\n").filter((l) => l.includes("FAIL")).map((l) => l.slice(0, 160)) });
check(`${engine}: and its output holds neither marker`, !out.includes(WORKED) && !out.includes(MISTAKE),
  out.split("\n").filter((l) => l.includes(WORKED) || l.includes(MISTAKE)).map((l) => l.slice(0, 200)));
const results = path.join(REPO, "build/.work/acceptance-vol-logs/ch01", engine, "results.json");
const kept = fs.existsSync(results) ? fs.readFileSync(results, "utf8") : "";
check(`${engine}: its results.json, under build/.work, keeps both to debug with`, kept.includes(WORKED) && kept.includes(MISTAKE),
  path.relative(REPO, results));
done();
