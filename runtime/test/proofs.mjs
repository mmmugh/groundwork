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
// The three-way proof of every check (DESIGN section 3): for each checked box Build.java --check writes to its proofs
// file, every worked solution must pass and every mistake must fail, judged by the page's own web/page/check.js
// (runCheck) on the browser runtime and on the pinned JDK, so a check the page would get wrong cannot pass. A
// prediction is text: the page's predictVerdict judges it once, and no runtime runs it.
//   node runtime/test/proofs.mjs <proofs.json>    (JF_DIST: the runtime to test; JF_JAVA_HOME: the JDK)
// proofs.json, from build/Proofs.java: [{"id": "<box id>", "check": <its data-check>, "answers": [{"label", "source", "right"}]}]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NodeRunner } from "../runner/node-runner.mjs";
import { checkJdk, JdkRunner } from "./jdk.mjs";
import { runCheck, predictVerdict } from "../../web/page/check.js";

const RUNTIME = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const file = process.argv[2];
if (!file) { console.log("usage: node runtime/test/proofs.mjs <proofs.json>"); process.exit(2); }
const proofs = JSON.parse(fs.readFileSync(file, "utf8"));
if (!Array.isArray(proofs) || proofs.length === 0) { console.log("no checks to prove"); process.exit(1); }
checkJdk();
const fork = new NodeRunner(process.env.JF_DIST || path.join(RUNTIME, "dist", "fork"));
const runtimes = [["on the browser runtime", fork], ["on the JDK", new JdkRunner(path.join(RUNTIME, "..", "build", ".work", "proofs"))]];

// What Check said, in the page's own words, a line each: every case or run, why it stopped, or why the file did not
// compile.
function said(v) {
  if (v.compile) return v.compile.kind === "signature" ? [v.compile.message]
    : ["it does not compile:", ...v.compile.diagnostics.map((d) => `${d.line != null ? `line ${d.line}: ` : ""}${String(d.message).split("\n")[0]}`)];
  const lines = (v.lines ?? []).map((l) => `${l.ok ? "right" : "wrong"}: ${l.text}`);
  if (v.stopped) lines.push(v.stopped);
  if (v.text) lines.push(v.text);
  return lines.join("\n").split("\n");
}

let verdicts = 0, wrong = 0;
for (const p of proofs) {
  for (const a of p.answers) {
    const judged = [];
    if (p.check.kind === "predict") judged.push(["as text (a prediction runs on no runtime)", predictVerdict(a.source, p.check.expected)]);
    else for (const [where, runner] of runtimes) judged.push([where, await runCheck(runner, a.source, p.check)]);
    for (const [where, v] of judged) {
      verdicts++;
      if (v.passed === a.right) continue;
      wrong++;
      console.log(`  !! ${p.id}: ${a.label} ${a.right ? "fails" : "passes"} ${where}, but it is ${a.right ? "right" : "a mistake"}. Check said:\n`
        + said(v).map((l) => "    " + l).join("\n"));
    }
  }
}
await fork.close();
console.log(`${proofs.length} checks, ${verdicts} verdicts, ${wrong} wrong`);
process.exit(wrong ? 1 : 0);
