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
// Keyboard input by replay (D16), under Node against the real runtime: the transcript rules match the build's,
// a Run stops at each question and replays with the answers so far, and every input example gives the same
// transcript answered all at once and one question at a time (DESIGN section 4's replay test).
//   node web/test/replay.mjs [--site <built project dir>]   (default: the build's own fixture volume)
import path from "node:path";
import fs from "node:fs";
import { NodeRunner } from "../../runtime/runner/node-runner.mjs";
import { tidy, stdoutFromTranscript, statedStderr } from "../page/transcript.js";
import { Replay } from "../page/replay.js";
import { REPO, DIST, check, done, buildSite } from "./harness.mjs";

const args = process.argv.slice(2);
if (args.length && !(args.length === 2 && args[0] === "--site")) { console.log("usage: node web/test/replay.mjs [--site <dir>]"); process.exit(2); }
const r = new NodeRunner(DIST);

// The transcript rules, against build/AuditTest's own cases.
check("tidy drops CRLF, trailing spaces and outer blank lines", tidy("\r\n\r\nA  \r\nB\t\r\n\r\n") === "A\nB", tidy("\r\n\r\nA  \r\nB\t\r\n\r\n"));
check("one answer after a prompt", stdoutFromTranscript("How many? 21\n42\n", ["21"]) === "How many? 42\n", null);
check("answers on their own lines", stdoutFromTranscript("Name:\nAda\nAge:\n36\nAda is 36\n", ["Ada", "36"]) === "Name:\nAge:\nAda is 36\n", null);
let threw = null;
try { stdoutFromTranscript("How many? 21\n42\n", ["7"]); } catch (e) { threw = e.message; }
check("a missing answer is an error naming it", threw === 'the stated sample run does not show the typed answer "7"', threw);
check("statedStderr keeps the first line and the program's own frames",
  statedStderr('Exception in thread "main" java.lang.IllegalStateException: no\n\tat Main.f(Main.java:3)\n\tat java.base/x.y(Z.java:1)\n\tat Main.main(Main.java:5)\n')
    === 'Exception in thread "main" java.lang.IllegalStateException: no\n\tat Main.f(Main.java:3)\n\tat Main.main(Main.java:5)\n', null);
check("statedStderr is empty without an uncaught exception", statedStderr("oops\n") === "", null);
// Java's `$` also matches before a final line terminator, so the build strips the blanks before a last U+2028.
check("tidy strips blanks before a final Unicode line terminator, as the build's `$` does", tidy("a  \u2028") === "a\u2028", tidy("a  \u2028"));

const compiled = async (src) => { const c = await r.compile(src); if (!c.ok) throw new Error(`${src}: ${JSON.stringify(c.diagnostics)}`); return c.wasm; };
const ASK = 'void main() { int n = Integer.parseInt(IO.readln("How many? ")); IO.println(n * 2); }';
let p = new Replay(r, await compiled(ASK), { randomSeed: 1 });
await p.start();
check("a Run stops at its first question, prompt shown", p.waiting && p.transcript === "How many? ", p.transcript);
await p.answer("21");
check("the answer is echoed where it was typed, then the program goes on", !p.waiting && p.result.status === "ok" && p.transcript === "How many? 21\n42\n", p.transcript);
check("segments mark what was typed", JSON.stringify(p.segments) === JSON.stringify([{ kind: "out", text: "How many? " }, { kind: "typed", text: "21\n" }, { kind: "out", text: "42\n" }]), p.segments);

const TWO = 'void main() { String a = IO.readln("Name? "); String b = IO.readln("City? "); IO.println(a + " from [" + b + "]"); }';
p = new Replay(r, await compiled(TWO), { randomSeed: 1 });
await p.start(); await p.answer("café 😀"); await p.answer("");
check("a non-ASCII answer and an empty one (just Enter) arrive and show exactly",
  p.result.status === "ok" && p.transcript === "Name? café 😀\nCity? \ncafé 😀 from []\n", p.transcript);

p = new Replay(r, await compiled('void main() { String s = IO.readln("Say: "); IO.println("got " + s); }'), { randomSeed: 1 });
await p.start(); await p.endInput();
check("Ctrl-D ends input: the question reads null, nothing is echoed", p.result.status === "ok" && p.transcript === "Say: got null\n", p.transcript);

const LOOP = 'void main() { String s; int n = 0; while ((s = IO.readln("> ")) != null) n += s.length(); IO.println("total " + n); }';
p = new Replay(r, await compiled(LOOP), { randomSeed: 1 });
await p.start(); await p.answer("ab"); await p.answer("cde"); await p.endInput();
check("a reading loop replays every answer, then ends at Ctrl-D", p.transcript === "> ab\n> cde\n> total 5\n", p.transcript);

const RAND = 'void main() { int k = new java.util.Random().nextInt(1000); String s = IO.readln("Guess " + k + ": "); IO.println(k + " " + s); }';
p = new Replay(r, await compiled(RAND), { randomSeed: 42 });
await p.start(); const asked = p.transcript; await p.answer("7");
check("one seed for the whole Run: the replay draws the same number", !p.diverged && p.transcript.startsWith(asked + "7\n"), [asked, p.transcript]);
// A caller that gives no seed still gets one for the whole Run: without it the runner draws a fresh seed on every run
// (runtime/runner/tjava-core.js), and the replay would draw a different number (999 times in 1,000).
p = new Replay(r, await compiled(RAND));
await p.start(); const askedNoSeed = p.transcript; await p.answer("7");
check("with no seed given, the Replay picks one for the whole Run: the replay draws the same number",
  !p.diverged && p.transcript.startsWith(askedNoSeed + "7\n"), [askedNoSeed, p.transcript]);
// A finished Run takes no more answers: answer() and endInput() do nothing, and the program does not run again.
const finished = p.result;
await p.answer("8");
check("answer() on a finished Replay leaves its answers as they were and runs nothing", p.answers.length === 1 && p.result === finished, p.answers);
await p.endInput();
check("endInput() on a finished Replay runs nothing", p.result === finished, p.result);

p = new Replay(r, await compiled('void main() { IO.println(System.nanoTime()); IO.readln("? "); }'), { randomSeed: 1 });
await p.start(); await p.answer("x");
check("a program that prints something different on replay is marked diverged", p.diverged, p.transcript);

p = new Replay(r, await compiled('void main() { int[] a = new int[1]; IO.readln("? "); IO.println(a[2]); }'), { randomSeed: 1 });
await p.start(); await p.answer("x");
check("an uncaught exception shows after the transcript, as a terminal shows it",
  p.shown.startsWith("? x\nException in thread \"main\" java.lang.ArrayIndexOutOfBoundsException: Index 2 out of bounds for length 1\n"), p.shown);

// DESIGN section 4's replay test, over every input box of a built site.
const project = args.length ? path.resolve(args[1]) : buildSite(path.join(REPO, "build/testdata/vol-fixture"), "replay-fixture");
const boxes = JSON.parse(fs.readFileSync(path.join(project, "site/boxes.json"), "utf8"));
const inputs = boxes.filter((b) => b.stdin?.length && !b.reference && !b.compileError && !b.raises);
check(`the site has input boxes to test (${inputs.length})`, inputs.length > 0, null);
// The build's own fixture has two input boxes, one in each chapter file; a fixture change that dropped one must fail.
if (!args.length) for (const id of ["ch02-types-and-input#1", "ch02-types-and-input-practice#1"])
  check(`the fixture's input box ${id} is among those tested`, inputs.some((b) => b.id === id), inputs.map((b) => b.id));
for (const box of inputs) {
  const wasm = await compiled(box.source);
  const all = await r.run(wasm.slice(), { stdin: box.stdin.map((a) => a + "\n").join(""), final: true, randomSeed: 5 });
  const q = new Replay(r, wasm, { randomSeed: 5 });
  await q.start();
  for (const a of box.stdin) { if (!q.waiting) break; await q.answer(a); }
  // The build's stdin ends after the declared answers, so a program that reads on meets end of input: Ctrl-D.
  if (q.waiting) await q.endInput();
  check(`${box.id}: uses every declared answer`, !q.waiting && q.answers.length === box.stdin.length, q.transcript);
  // stdoutFromTranscript throws when a declared answer is missing from the transcript: that fails this box's check,
  // with the error, and the loop goes on.
  let fromTranscript = null, stripFailed = null;
  try { fromTranscript = tidy(stdoutFromTranscript(q.transcript, box.stdin)); } catch (e) { stripFailed = e.message; }
  check(`${box.id}: one question at a time gives what all at once gives`, !q.diverged && stripFailed === null
    && fromTranscript === tidy(all.stdout), stripFailed ?? [q.transcript, all.stdout]);
  if (box.expected) check(`${box.id}: the replayed transcript is the page's stated output`, tidy(q.shown) === tidy(box.expected), [q.shown, box.expected]);
}
await r.close();
done();
