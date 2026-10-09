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
// The runner's promises beyond runner-safety.mjs's fifteen checks. The JDK's line for a failure lands
// where the JDK prints it, after earlier stderr, and a dead worker of either kind ends in an answer,
// never a hang or a dead host (the build-time checks run in that host).
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NodeRunner } from "../runner/node-runner.mjs";
import { checkJdk, runJdk } from "./jdk.mjs";
const RUNTIME = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const DIST = process.env.JF_DIST || path.join(RUNTIME, "dist", "fork");
const results = [];
const check = (label, ok, got) => { results.push(ok); console.log(`  ${ok ? "ok  " : "FAIL"}  ${label}${ok ? "" : "  got " + JSON.stringify(got)}`); };
// A hang must fail the check, not the whole test, so every await on a dying worker is bounded.
const within = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r("HUNG"), ms).unref())]);
const crashed = (c) => c !== "HUNG" && c.ok === false && c.stage === "crash" && /^compile worker died: /.test(c.crash);

// Held to the pinned JDK itself, not to a remembered string: a later change that moves the line to
// the front of stderr ("first in stderr") would make the fork disagree with the JDK here.
checkJdk();
let r = new NodeRunner(DIST);
const src = 'int down(int n) { return down(n + 1) + 1; } void main() { System.err.print("before "); IO.println(down(0)); }';
const fork = await r.compileAndRun(src, { deadlineMs: 10000 });
const jdk = runJdk(src, "", path.join(RUNTIME, ".work", "jdk-cases", "runner-faults-stderr-order"));
check("the JDK's line follows earlier stderr, as on the JDK",
  jdk.stderrHead === 'before Exception in thread "main" java.lang.StackOverflowError'
    && (fork.stderr ?? "").split("\n")[0] === jdk.stderrHead, { fork: fork.stderr, jdk: jdk.stderrHead });

// The result's exitCode: the status a program gave System.exit, cut to the low 8 bits as a process
// exit code is (the pinned JDK's java exits 255 for System.exit(-1)), and null when it never called it.
let o = await r.compileAndRun("void main() { System.exit(-1); }", { deadlineMs: 5000 });
check("System.exit(-1) reports status exit-255 and exitCode 255", o.status === "exit-255" && o.exitCode === 255, o);
o = await r.compileAndRun('void main() { IO.println("fine"); }', { deadlineMs: 5000 });
check("a run that never calls System.exit reports exitCode null", o.status === "ok" && o.exitCode === null, o);

// An idle spare that errors must not kill the host: the run that claims it reports the crash,
// and the run after that gets a fresh worker.
await r.spare.ready;
r.spare.w.emit("error", Object.assign(new Error("synthetic"), { code: "ERR_SYNTHETIC" }));
o = await within(r.compileAndRun('void main() { IO.println("c"); }', { deadlineMs: 3000 }), 15000);
check("an idle spare that errors is reported as crashed", o !== "HUNG" && o.status === "crashed"
  && o.exception?.message === "ERR_SYNTHETIC", o);
o = await within(r.compileAndRun('void main() { IO.println("d"); }', { deadlineMs: 3000 }), 15000);
check("an idle spare that errors: the next Run works", o !== "HUNG" && o.status === "ok" && o.stdout === "d\n", o);
await r.close();

// The compile worker dies before it is ready: the waiting compile() answers, and ready is never
// resolved with anything but the compiler's init time.
r = new NodeRunner(DIST);
const early = r.compile('void main() { IO.println("a"); }');
r.compileWorker.terminate();
let c = await within(early, 15000);
check("compile worker dies before ready: compile() answers crash", crashed(c), c);
check("compile worker dies before ready: it never reports itself ready",
  (await within(r.ready.catch((e) => e), 500)) === "HUNG", "ready settled");
await r.close();

// The compile worker dies mid-compile, and is not respawned: that compile() and every later one
// answer crash, loudly, instead of waiting forever.
r = new NodeRunner(DIST);
check("a healthy compile worker reports its init time", typeof (await r.ready) === "number", r.ready);
await r.compile("void main() {}");
const mid = r.compile('void main() { IO.println("b"); }');
r.compileWorker.terminate();
c = await within(mid, 15000);
check("compile worker dies mid-compile: compile() answers crash", crashed(c), c);
c = await within(r.compile("void main() {}"), 15000);
check("compile worker dead: a later compile() answers crash", crashed(c), c);
await r.close();

console.log(results.every(Boolean) ? "\nthe runner answers every fault" : `\n${results.filter((x) => !x).length} failed`);
process.exit(results.every(Boolean) && results.length === 10 ? 0 : 1);
