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
// The course's own examples on both runtimes: every box Build.java --check writes to its examples file runs on
// the fork and on the pinned JDK, and any difference fails. Unlike differential.mjs there is no list of known
// differences: a page may not show a program the reader's browser runs differently. The one exemption is declared by
// the box itself: a runaway recursion's frames, which the browser cannot print (below). A box's revealed worked
// solution, marked "solution" (Build.java's examplesOf), must also run to its end, or end in the exception its box
// declares: no other gate runs it, and agreeing is not enough when both runtimes throw.
//   node runtime/test/examples.mjs <examples.json>    (JF_DIST: the runtime to test; JF_JAVA_HOME: the JDK)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NodeRunner } from "../runner/node-runner.mjs";
import { STACK_OVERFLOW } from "../runner/java-line.js";
import { checkJdk, runJdk } from "./jdk.mjs";
import { outcome, jdkOutcome, same } from "./compare.mjs";

const RUNTIME = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const file = process.argv[2];
if (!file) { console.log("usage: node runtime/test/examples.mjs <examples.json>"); process.exit(2); }
const examples = JSON.parse(fs.readFileSync(file, "utf8"));
if (!Array.isArray(examples) || examples.length === 0) { console.log("no examples to check"); process.exit(1); }
checkJdk();
const runner = new NodeRunner(process.env.JF_DIST || path.join(RUNTIME, "dist", "fork"));
const work = path.join(RUNTIME, ".work", "examples");
let differing = 0;
for (const ex of examples) {
  const fork = outcome(await runner.compileAndRun(ex.src, { stdin: ex.stdin ?? "", deadlineMs: 10000 }));
  const jdk = jdkOutcome(runJdk(ex.src, ex.stdin ?? "", path.join(work, ex.id.replace(/[^\w-]/g, "_"))));
  // The fork's NodeRunner and jdk.mjs's runJdk kill a hung or flooding program in different, independently
  // shaped ways (the fork: an explicit 10 s deadline and output cap, reporting "timeout"/"output-limit";
  // jdk.mjs: spawnSync's built-in 30 s timeout and default maxBuffer, reporting "killed-<signal>" or an
  // exit-N from the kill): fold both into one "did-not-finish" bucket before comparing, so a box that hangs
  // or floods on both sides for the same reason is not reported as a fork/JDK disagreement. Such a box still
  // fails Task 6's audit (it declares no "raises" for a non-ok status), so this never masks a real problem.
  // In practice jdk.mjs's kill never shows up as "killed-<signal>" on this JVM/Node combination: HotSpot traps
  // SIGTERM for an orderly shutdown and exits 128+15=143 rather than dying by the raw signal, so spawnSync sees
  // `signal: null, status: 143` and runJdk reports "exit-143". Fold that shape too, alongside the (currently
  // theoretical, kept for robustness) "killed-<signal>" case. exit-143 is otherwise safe to fold: a first-course
  // Java program calling System.exit(143) on purpose is not a realistic case this course teaches or would ever
  // produce, and 143 is specifically 128+SIGTERM, the signal spawnSync's default killSignal sends.
  const finished = (o) => o.status === "timeout" || o.status === "output-limit" || o.status === "exit-143" || /^killed-/.test(o.status) ? { status: "did-not-finish" } : o;
  // A box declared to raise java.lang.StackOverflowError (DESIGN section 2: chapter 12's runaway recursion crashes on
  // purpose) is compared without frames when it overflowed: the fork reports a stack overflow with the JDK's first line
  // alone (runtime/runner/java-line.js: the engine's overflow is no Java exception, so no frame is known), where the
  // JDK prints up to 1,024 frames below it. Its status, stdout and first line still count, so a box that does not
  // overflow, throws something else, prints something else or catches the overflow (the JDK can, the fork cannot) still
  // differs; and an overflow no box declares is compared frame by frame, as before.
  const frameless = (o) => ex.raises === "java.lang.StackOverflowError" && o.stderrHead === STACK_OVERFLOW ? { ...o, frames: [] } : o;
  const key = (o) => ex.varies ? { status: finished(o).status, stderrHead: o.stderrHead } : frameless(finished(o));
  // How a worked solution may end (both runtimes agree, so one side is enough): ok, or the box's declared exception's
  // first line, as the audit holds a raises box (its message, if any, after ": ").
  const thrown = `Exception in thread "main" ${ex.raises}`;
  const ended = (o) => o.status === "ok" || (ex.raises != null && o.status === "uncaught"
    && (o.stderrHead === thrown || o.stderrHead.startsWith(`${thrown}: `)));
  if (!same(key(fork), key(jdk))) {
    differing++;
    console.log(`  !! ${ex.id}: the browser runtime and the JDK disagree\n    fork ${JSON.stringify(fork)}\n    jdk  ${JSON.stringify(jdk)}`);
  } else if (ex.solution && !ended(jdk)) {
    differing++;
    console.log(`  !! ${ex.id}: does not run to its end${ex.raises ? ` or end in ${ex.raises}` : ""}: on both runtimes, ` +
      `${finished(jdk).status === "did-not-finish" ? "it did not finish" : jdk.stderrHead || jdk.status}` +
      (finished(jdk).status === "compile-error" ? " (the first worked solution is what Show a solution reveals and the " +
        "reader runs: a whole program, with its void main, even for a method check)" : ""));
  }
}
await runner.close();
console.log(`${examples.length} examples, ${differing} differing`);
process.exit(differing ? 1 : 0);
