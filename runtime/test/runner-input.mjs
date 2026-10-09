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
// The replay stop (D16): a run whose stdin is not final stops with status "needs-input" the moment the program
// reads past its answers, and no Java code can catch that stop. Plus the output caps a caller passes.
//   node runtime/test/runner-input.mjs        (JF_DIST: the runtime to test)
import { fileURLToPath } from "node:url";
import { NodeRunner } from "../runner/node-runner.mjs";
const DIST = process.env.JF_DIST || fileURLToPath(new URL("../dist/fork/", import.meta.url));
const r = new NodeRunner(DIST);
const results = [];
const check = (label, ok, got) => { results.push(ok); console.log(`  ${ok ? "ok  " : "FAIL"}  ${label}${ok ? "" : "  got " + JSON.stringify(got)}`); };
const run = (src, opts = {}) => r.compileAndRun(src, { deadlineMs: 5000, ...opts });
const brief = (o) => ({ status: o.status, stdout: o.stdout, stderr: o.stderr, exception: o.exception });

const ASK = 'void main() { String s = IO.readln("How many? "); IO.println(s); }';
let o = await run(ASK, { stdin: "", final: false });
check("a question with no answer yet stops as needs-input, its prompt shown", o.status === "needs-input" && o.stdout === "How many? ", brief(o));
o = await run(ASK, { stdin: "21\n", final: false });
check("the same question answered runs to the end", o.status === "ok" && o.stdout === "How many? 21\n", brief(o));
o = await run(ASK, { stdin: "", final: true });
check("with final stdin, end of input reads as null, as on the JDK (Ctrl-D)", o.status === "ok" && o.stdout === "How many? null\n", brief(o));
o = await run(ASK, { stdin: "" });
check("final is the default", o.status === "ok" && o.stdout === "How many? null\n", brief(o));
o = await run(ASK, { stdin: "21", final: false });
check("an answer without its newline is not finished yet", o.status === "needs-input" && o.stdout === "How many? ", brief(o));
const LOOP = 'void main() { String s; int n = 0; while ((s = IO.readln()) != null) { n++; IO.println(n + ": " + s); } IO.println("end"); }';
o = await run(LOOP, { stdin: "a\nb\n", final: false });
check("a reading loop stops at the first answer it lacks, after printing what it had", o.status === "needs-input" && o.stdout === "1: a\n2: b\n", brief(o));
o = await run(LOOP, { stdin: "a\nb\n", final: true });
check("the same loop with final stdin ends at end of input", o.status === "ok" && o.stdout === "1: a\n2: b\nend\n", brief(o));
o = await run('void main() { try { IO.readln(); } catch (Throwable t) { IO.println("caught"); } finally { IO.println("finally"); } }', { stdin: "", final: false });
check("no Java catch or finally runs when the program stops for input", o.status === "needs-input" && o.stdout === "", brief(o));
o = await run('void main() { var sc = new java.util.Scanner(System.in); IO.println(sc.nextLine()); }', { stdin: "", final: false });
check("Scanner stops for input the same way (it reads the same System.in)", o.status === "needs-input", brief(o));
o = await run('void main() { IO.println("no input here"); }', { stdin: "", final: false });
check("a program that never reads is not stopped for input", o.status === "ok" && o.stdout === "no input here\n", brief(o));
o = await run('void main() { String a = IO.readln("Name? "); IO.println("Hi " + a); }', { stdin: "café 😀\n", final: false });
check("a non-ASCII answer reaches the program intact", o.status === "ok" && o.stdout === "Name? Hi café 😀\n", brief(o));
o = await run('void main() { String a = IO.readln("Name? "); IO.println("[" + a + "]"); }', { stdin: "\n", final: false });
check("an empty answer (just Enter) is an empty line, not a stop", o.status === "ok" && o.stdout === "Name? []\n", brief(o));
o = await run('void main() { for (int i = 0; i < 10; i++) IO.println("line " + i); }', { outputLimitLines: 3 });
check("a caller's line cap stops the program after that many lines", o.status === "output-limit" && o.stdout === "line 0\nline 1\nline 2\n", brief(o));
o = await run('void main() { IO.println("x".repeat(50)); }', { outputLimitChars: 20 });
check("a caller's character cap stops the program, the 50-character piece withheld whole",
  o.status === "output-limit" && o.stdout === "", brief(o));
// The cap wins over the stop for input (node-runner.mjs checks limited first): the print's lone high surrogate is
// held until the end-of-run flush, which runs after a needs-input stop too, and there it crosses the cap of 1.
o = await run('void main() { IO.print("y\\uD83D"); IO.readln(); }', { outputLimitChars: 1, final: false });
check("the output cap wins over needs-input when the flush after the stop crosses it, output kept",
  o.status === "output-limit" && o.stdout === "y", brief(o));
const SEED = 'void main() { var g = new java.util.Random(); IO.println(g.nextInt(1000) + " " + Math.random()); }';
const s1 = await run(SEED, { randomSeed: 7 }), s2 = await run(SEED, { randomSeed: 7 });
check("two runs with one seed print the same numbers (D16)", s1.status === "ok" && s1.stdout === s2.stdout, [s1.stdout, s2.stdout]);
await r.close();
const failed = results.filter((x) => !x).length;
console.log(`${results.length} check(s), ${failed} failed`);
process.exit(failed ? 1 : 0);
