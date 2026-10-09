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
// Every way a beginner's program can run away must end in a readable result, and the next Run must work.
import { fileURLToPath } from "node:url";
import { NodeRunner } from "../runner/node-runner.mjs";
import { OUTPUT_LIMIT_CHARS } from "../runner/worker-protocol.js";
import { loadDist } from "../runner/tjava-node.mjs";
const DIST = process.env.JF_DIST || fileURLToPath(new URL("../dist/fork/", import.meta.url));
const r = new NodeRunner(DIST);
const results = [];
const check = (label, ok, got) => { results.push(ok); console.log(`  ${ok ? "ok  " : "FAIL"}  ${label}${ok ? "" : "  got " + JSON.stringify(got)}`); };
const run = (src, deadlineMs = 3000) => r.compileAndRun(src, { deadlineMs });
const next = async (label) => { const n = await run('void main() { IO.println("next"); }'); check(`${label}: the next Run works`, n.stdout === "next\n", n); };

let o = await run('void main() { IO.println("start"); while (true) {} }');
check("endless loop stops at the deadline, earlier output kept", o.status === "timeout" && o.stdout === "start\n", o);
await next("endless loop");

// Output the program flushed before it ran away stays on screen, as the JDK shows it (Task 2's patch). Each
// expectation is what the pinned JDK printed before it was killed (recorded in Plan 3 Task 2's report).
const beforeHang = [
  ['void main() { IO.print("Guess: "); while (true) {} }', "Guess: ", ""],
  ['void main() { System.out.print("Guess: "); while (true) {} }', "Guess: ", ""],
  ['void main() { System.out.print("Guess: "); System.out.flush(); while (true) {} }', "Guess: ", ""],
  ['void main() { System.out.printf("%d: ", 7); while (true) {} }', "7: ", ""],
  ['void main() { System.err.print("oops "); while (true) {} }', "", "oops "],
  ['void main() { IO.print("a"); IO.print("b"); while (true) {} }', "ab", ""],
];
for (const [src, out, err] of beforeHang) {
  const b = await run(src, 2000);
  check(`what ${JSON.stringify(src.slice(14, 60))} printed before its loop is kept`, b.status === "timeout" && b.stdout === out && b.stderr === err, b);
}
await next("output before a hang");

// A non-void method that never returns, called inside a try (Check calls every case that way), is stopped at the
// deadline like any endless loop (patch teavm-0017: TeaVM emitted invalid WebAssembly for it). Each expectation is what
// the pinned JDK printed before it was killed (Plan 3 Task 11's report).
const neverReturns = [
  ['int spin(int n) { while (true) {} } void main() { try { IO.println(spin(1)); } catch (Throwable t) { IO.println("caught"); } }', "", ""],
  ['static String spin() { for (;;) {} } void main() { try { IO.println(spin()); } catch (RuntimeException e) { IO.println("caught"); } }', "", ""],
  ['int count(int n) { while (true) { n++; } } void main() { try { IO.println(count(0)); } finally { IO.println("finally"); } }', "", ""],
];
for (const [src, out, err] of neverReturns) {
  const n = await run(src, 2000);
  check(`${JSON.stringify(src.slice(0, 40))}...: a method that never returns is stopped at the deadline`, n.status === "timeout" && n.stdout === out && n.stderr === err, n);
}
await next("a method that never returns");

o = await run('void main() { while (true) IO.println("x"); }');
check("endless printing stops at the output cap", o.status === "output-limit", { status: o.status, len: o.stdout.length });
await next("endless printing");

o = await run("int down(int n) { return down(n + 1) + 1; } void main() { IO.println(down(0)); }");
check("endless recursion is reported as the JDK reports it",
  (o.stderr ?? "").startsWith('Exception in thread "main" java.lang.StackOverflowError'), o);
await next("endless recursion");

o = await run('void main() { IO.print("no newline at the end"); }');
check("output without a trailing newline still arrives", o.stdout === "no newline at the end", o);

// Output that never ends its line must meet the output cap too. Each print now reaches the host as a piece
// of its own (since teavm-0016), so endless IO.print("*") is a flood of pieces the cap counts one by one. The
// runner that held a line until its newline is history: its held line grew without bound, and endless
// IO.print("*") ran the worker out of memory (reported as a made-up OutOfMemoryError, and in some runs V8
// aborted the host), and a finite line past the cap was handed on only after main returned, where the cap's
// error escaped the run ("fatal").
const brief = (o) => ({ status: o.status, stdoutChars: o.stdout.length, stderr: (o.stderr ?? "").slice(0, 300) });
o = await r.compileAndRun('void main() { while (true) IO.print("*"); }', { deadlineMs: 3000, outputLimitChars: 100_000 });
check("endless printing without a newline stops at the output cap, output kept",
  o.status === "output-limit" && o.stdout.length > 0, brief(o));
await next("endless printing without a newline");

o = await run('void main() { IO.print("x".repeat(5_000_000)); }', 10000);
check("one line longer than the output cap stops at the cap, output kept",
  o.status === "output-limit" && o.stdout.length > 0, brief(o));

// The cap crossed only by the text runProgram hands on after main returns, where the cap's error must still end
// in a result (its final-flush guard), not escape the run as "fatal". Since teavm-0016 every IO.print flushes, so
// ordinary unfinished text crosses the cap during the run instead. A piece never ends with the first half of a
// surrogate pair, so a print ending in a lone high surrogate leaves that one code unit held until the final flush:
// one character short of the cap in whole lines, then "y" (the cap exactly), then the held "\uD83D", past it.
o = await run(`void main() { IO.println("x".repeat(${OUTPUT_LIMIT_CHARS - 2})); IO.print("y\\uD83D"); }`, 10000);
check("unfinished output that crosses the cap after main returns ends as output-limit, not fatal",
  o.status === "output-limit" && o.stdout.length === OUTPUT_LIMIT_CHARS, brief(o));
await next("unfinished output past the cap");

// The pieces are cut between whole characters: none ends with the first half of a surrogate pair. Each
// emoji is two UTF-16 code units and the leading "a" puts a pair across every even boundary. Run on this
// thread through tjava-core directly, since the Node runner joins the pieces before anyone sees them.
const direct = await loadDist(DIST);
const emoji = direct.compile('void main() { IO.print("a" + "\u{1F600}".repeat(10_000)); }');
const pieces = [];
if (emoji.ok) await direct.run(emoji.wasm, { onOut: (t) => pieces.push(t) });
const halves = pieces.filter((p) => /[\ud800-\udbff]$/.test(p)).length;
check("a line handed on in pieces never splits a surrogate pair",
  pieces.length > 1 && halves === 0 && pieces.join("") === "a" + "\u{1F600}".repeat(10_000),
  { compiled: emoji.ok, pieces: pieces.length, endingInFirstHalf: halves });

// Last on purpose: before the fix this case kills the host process, which would hide every check after it.
o = await run('void main() { var l = new java.util.ArrayList<long[]>(); while (true) l.add(new long[1_000_000]); }', 20000);
check("running out of memory is reported as the JDK reports it",
  (o.stderr ?? "").startsWith('Exception in thread "main" java.lang.OutOfMemoryError'), o);
await next("out of memory");

await r.close();
console.log(results.every(Boolean) ? "\nthe runner survives every runaway" : `\n${results.filter((x) => !x).length} failed`);
process.exit(results.every(Boolean) && results.length === 26 ? 0 : 1);
