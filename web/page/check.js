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
// Check (DESIGN section 3, D17, D39). The reader's file stays a compact source file: Check renames the reader's own
// main so it never runs, and appends a generated main that calls the exercise's method once per case, each case in
// its own try/catch, comparing inside Java. Case values are Java source text written into the generated code;
// nothing is converted between JavaScript and Java values. A signature the reader changed comes back as javac's
// error, which explainCompile puts in plain words. Works with NodeRunner and BrowserRunner alike.
import { tidy } from "./transcript.js";

const MAIN_DECL = /\bvoid(\s+)main(\s*)\(/g; // also renamed inside a comment or string: harmless, main never runs
// The new name is as long as "main", so no line of the reader's changes length: javac counts columns in the file Check
// compiles, and the page draws the caret under the reader's own line (Ruling 29).
const MAIN_RENAMED = "jf$m";
// A javac message that quotes the renamed main (a reader who declares main twice) names it main again, as javac names
// it in the reader's file alone; the names are the same length, so no column moves.
const unrenamed = (diagnostics) => diagnostics.map((d) =>
  typeof d.message === "string" && d.message.includes(MAIN_RENAMED) ? { ...d, message: d.message.replaceAll(MAIN_RENAMED, "main") } : d);
// The page's output caps (D40(c)): a run stops at a million characters or 100,000 lines. Run (box.js's LIMITS) and
// Check both use them, so no Check runs to the worker's larger defaults.
export const OUTPUT_CAPS = { outputLimitChars: 1_000_000, outputLimitLines: 100_000 };
// Every line the generated main prints starts on a fresh line (a partial line of the reader's own, printed without a
// newline, never joins it) and carries a marker made per check, which the reader's program cannot know, so what the
// program prints never counts.
const newMark = () => `\u001fjf ${Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, "0")).join("")} `;
const helpers = (mark) => [
  "void jf$say(String s) {",
  `  System.out.println("\\n${mark.replace("\u001f", "\\u001f")}" + s);`,
  "}",
  "void jf$report(int i, Object got, Object want) {",
  '  jf$say(i + (java.util.Objects.deepEquals(got, want) ? " ok" : " fail " + jf$show(got)));',
  "}",
  "void jf$threw(int i, Throwable t) {",
  '  jf$say(i + " threw " + t.getClass().getName() + (t.getMessage() == null ? "" : ": " + t.getMessage()));',
  "}",
  "String jf$show(Object o) {",
  '  if (o == null) return "null";',
  '  if (o instanceof String s) return "\\"" + s.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"").replace("\\n", "\\\\n") + "\\"";',
  '  if (o instanceof Character c) return "\'" + c + "\'";',
  '  if (o.getClass().isArray()) { String s = java.util.Arrays.deepToString(new Object[] { o }); return s.substring(1, s.length() - 1); }',
  "  return String.valueOf(o);",
  "}",
];

export function methodHarness(source, check) {
  const reader = (source.endsWith("\n") ? source : source + "\n").replace(MAIN_DECL, `void$1${MAIN_RENAMED}$2(`);
  const readerLines = reader.split("\n").length - 1;
  const mark = newMark(), lines = ["void main() {"], calls = [];
  check.cases.forEach(([args, expected], i) => {
    const before = `  try { ${check.returns} jf$got = ${check.name}`;
    lines.push(`${before}(${args}); ${check.returns} jf$want = ${expected}; jf$report(${i}, jf$got, jf$want); } catch (Throwable jf$t) { jf$threw(${i}, jf$t); }`);
    calls.push({ line: readerLines + lines.length, open: before.length + 1 });
  });
  lines.push('  jf$say("done");', "}", ...helpers(mark));
  return { source: reader + lines.join("\n") + "\n", reader, readerLines, calls, mark };
}

const simple = (t) => t.trim().replace(/\bjava\.lang\./g, "");
const signature = (check) => `${check.returns} ${check.name}(${check.params.join(", ")})`;
const takes = (check) => `(${check.params.join(",")})`;

// An error on a generated line means the method is not what the exercise needs: that is the root cause, even when
// the reader's own (renamed) main fails too, as it does when it still calls the old signature. With no error on a
// generated line, every error is the reader's own, shown on their own lines. An error on a generated line that is not
// one of the signature shapes below is unclear: a brace the reader dropped or added makes javac's parse error land in
// the code Check appends. runCheck settles it by compiling the reader's file alone (settleUnclear).
export function explainCompile(diagnostics, harness, check) {
  const d = diagnostics.find((x) => x.phase === "javac" && x.line != null && x.line > harness.readerLines);
  if (!d) return { kind: "reader", diagnostics: unrenamed(diagnostics) };
  const need = ` The exercise needs: ${signature(check)}.`;
  const msg = d.message;
  const call = harness.calls.find((c) => c.line === d.line);
  let m;
  if (/^cannot find symbol/.test(msg) && /symbol:\s+method /.test(msg))
    return { kind: "signature", message: `Check could not find a method ${check.name} that takes ${takes(check)}.${need}` };
  if ((m = /^incompatible types: (?:possible lossy conversion from )?(.+?) (?:cannot be converted )?to (.+)$/s.exec(msg)) && call) {
    if (d.column === call.open) return { kind: "signature", message: `${check.name} should return ${simple(m[2])}, but yours returns ${simple(m[1])}.${need}` };
    return { kind: "signature", message: `${check.name}'s parameter should be ${simple(m[1])}, but yours takes ${simple(m[2])}.${need}` };
  }
  if ((m = /cannot be applied to given types;[\s\S]*required:\s*(.*)\n\s*found:\s*(.*)/.exec(msg))) {
    const req = m[1].trim() === "no arguments" ? "()" : `(${simple(m[1]).replace(/\s+/g, "")})`;
    return { kind: "signature", message: `Check calls ${check.name} with ${takes(check)}, but your ${check.name} takes ${req}.${need}` };
  }
  const cause = msg.split("\n")[0];
  return { kind: "unclear", cause, message: `Check could not call ${check.name}: ${cause}.${need}` };
}

// The reader's file alone, with the generated tail gone, and a stub main in its place (the reader's own main is
// renamed, and a compact file with no main never compiles; the stub is one line at the end, so no reader line moves).
// An error there that is not the unclear one is the reader's own, on their own line. If the file compiles, or fails
// on the same error (its own main calls the method as well), the unclear error was about the signature after all.
async function settleUnclear(runner, compile, harness) {
  if (compile.kind !== "unclear") return compile;
  const alone = await runner.compile(harness.reader + "void main() {}\n");
  const same = !alone.ok && alone.diagnostics.some((d) => d.message?.split("\n")[0] === compile.cause);
  return alone.ok || same ? { kind: "signature", message: compile.message } : { kind: "reader", diagnostics: unrenamed(alone.diagnostics) };
}

function parseCases(stdout, n, mark) {
  const cases = new Array(n).fill(null);
  let finished = false;
  for (const line of stdout.split("\n")) {
    if (!line.startsWith(mark)) continue;
    const rest = line.slice(mark.length);
    if (rest === "done") { finished = true; continue; }
    const m = /^(\d+) (ok|fail|threw)(?: (.*))?$/.exec(rest);
    if (m && Number(m[1]) < n) cases[Number(m[1])] = { outcome: m[2], detail: m[3] ?? "" };
  }
  return { cases, finished };
}

// The first line of an uncaught exception, as the JDK prints it, or null. Both runners report a program that ends
// with one as status "ok" with the JDK's trace on stderr (the JDK exits 1); runtime/test/differential.mjs derives
// "uncaught" from that line. Text the program wrote to System.err before it threw comes first, on the same line
// when it had no newline ("before Exception in thread ..."), so the line is found wherever it starts. In WebKit the
// trace is that line alone (D42), which is all a verdict names.
const uncaught = (stderr) => /Exception in thread "[^"\n]*" [^\n]*/.exec(stderr ?? "")?.[0] ?? null;

// Why a run stopped before its end, in plain words, never the runner's status names (Ruling 36). method: the words
// for a method check, where the run is the reader's method called by Check.
function whyStopped(result, deadlineMs, method) {
  const stderr = result.stderr ?? "", it = method ? "it" : "the program";
  if (result.status === "timeout") return `${it} ran for more than ${Math.round(deadlineMs / 1000)} seconds. An endless loop?`;
  if (result.status === "output-limit") return `${it} printed too much.`;
  if (stderr.includes("java.lang.StackOverflowError")) return `StackOverflowError. Does ${method ? "your" : "a"} method call itself without end?`;
  if (stderr.includes("java.lang.OutOfMemoryError")) return `OutOfMemoryError: ${it} ran out of memory.`;
  // System.exit(0) ends a run as "ok" with exit code 0; any other status is "exit-N".
  if (result.exitCode != null || /^exit-/.test(result.status)) return `${method ? "your method" : "the program"} called System.exit.`;
  const thrown = uncaught(stderr);
  if (thrown) return `${it} threw an exception that nothing caught:\n${thrown}`;
  if (result.status === "canceled") return "Check was canceled.";
  return "the program ended unexpectedly.";
}
// A run an output or input check can judge: it ran to its end (System.exit(0) included), with no uncaught exception
// (Ruling 34).
const ranToEnd = (result) => result.status === "ok" && !uncaught(result.stderr);

function stopReason(result, call, deadlineMs) {
  return `Check stopped while running ${call}: ${whyStopped(result, deadlineMs, true)}`;
}

export function methodVerdict(result, harness, check, deadlineMs = 5000) {
  if (result.status === "compile-error") return { passed: false, lines: [], compile: explainCompile(result.compile.diagnostics, harness, check) };
  const { cases, finished } = parseCases(result.stdout, check.cases.length, harness.mark);
  const lines = [];
  for (let i = 0; i < check.cases.length; i++) {
    const [args, expected] = check.cases[i], c = cases[i], call = `${check.name}(${args})`;
    if (!c) return { passed: false, lines, stopped: stopReason(result, call, deadlineMs) };
    lines.push(c.outcome === "ok" ? { ok: true, text: `${call} -> ${expected}` }
      : c.outcome === "fail" ? { ok: false, text: `${call} returned ${c.detail}, expected ${expected}` }
      : { ok: false, text: `${call} threw ${c.detail}` });
  }
  if (!finished) return { passed: false, lines, stopped: stopReason(result, `${check.name}(...)`, deadlineMs) };
  return { passed: lines.every((l) => l.ok), lines };
}

// A line quoted to the reader: an empty one is named as blank and a missing one as nothing, never an empty gap.
const quoted = (line) => line === undefined ? "nothing" : line === "" ? "a blank line" : line;
// A text that is empty after tidying has no lines at all (tidy gives "", which split would make one blank line).
const linesOf = (t) => { const s = tidy(t); return s === "" ? [] : s.split("\n"); };
function firstDifference(a, b, said) {
  const x = linesOf(a), y = linesOf(b);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if (x[i] === y[i]) continue;
    if (said) return `Line ${i + 1}: you said ${quoted(x[i])}, it prints ${quoted(y[i])}`;
    if (x.length === 0) return `It prints nothing. Line 1 should be: ${quoted(y[0])}`;
    if (x[i] === undefined) return `The output stops after line ${i}. Line ${i + 1} should be: ${quoted(y[i])}`;
    if (y[i] === undefined) return `Line ${i + 1} should not be there: ${quoted(x[i])}`;
    return `Line ${i + 1} is: ${quoted(x[i])}\nIt should be: ${quoted(y[i])}`;
  }
  return null;
}
export function outputVerdict(printed, expected) {
  const d = firstDifference(printed, expected, false);
  return d ? { passed: false, text: d } : { passed: true, text: "Correct." };
}
export function predictVerdict(prediction, expected) {
  const d = firstDifference(prediction, expected, true);
  return d ? { passed: false, text: d } : { passed: true, text: "Correct." };
}

// Input exercises are judged on what they print, not how: the pinned numbers must appear in order (a decimal
// within 0.005), the pinned words in order (any case), and `contains` as written.
const inOrder = (items, wanted, same) => { let i = 0; for (const x of items) if (i < wanted.length && same(x, wanted[i])) i++; return i === wanted.length; };
export function inputVerdict(results, runs, deadlineMs = 5000) {
  const lines = runs.map((run, k) => {
    const res = results[k], said = run.typed.length ? `With input ${run.typed.join(", ")}` : "With no input";
    if (!ranToEnd(res)) return { ok: false, text: `${said}: ${whyStopped(res, deadlineMs, false)}` };
    const out = res.stdout;
    if (run.numbers && !inOrder(out.match(/-?\d+(?:\.\d+)?/g) ?? [], run.numbers, (g, w) => Math.abs(Number(g) - Number(w)) <= 0.005))
      return { ok: false, text: `${said}: expected the numbers ${run.numbers.join(", ")} in order, and the output was:\n${out}` };
    if (run.words && !inOrder(out.toLowerCase().split(/[^\p{L}\p{N}]+/u), run.words.map((w) => w.toLowerCase()), (g, w) => g === w))
      return { ok: false, text: `${said}: expected the words ${run.words.join(", ")} in order, and the output was:\n${out}` };
    if (run.contains != null && !out.includes(run.contains))
      return { ok: false, text: `${said}: expected the output to contain ${run.contains}, and it was:\n${out}` };
    return { ok: true, text: `${said}: correct` };
  });
  return { passed: lines.every((l) => l.ok), lines };
}

// outputLimitChars and outputLimitLines go to every run; they default to the page's caps.
export async function runCheck(runner, source, check, { deadlineMs = 5000, signal,
  outputLimitChars = OUTPUT_CAPS.outputLimitChars, outputLimitLines = OUTPUT_CAPS.outputLimitLines } = {}) {
  const caps = { outputLimitChars, outputLimitLines };
  if (check.kind === "method") {
    const h = methodHarness(source, check);
    const result = await runner.compileAndRun(h.source, { deadlineMs, signal, final: true, ...caps });
    const v = methodVerdict(result, h, check, deadlineMs);
    if (v.compile) v.compile = await settleUnclear(runner, v.compile, h);
    return v;
  }
  const c = await runner.compile(source);
  if (!c.ok) return { passed: false, lines: [], compile: { kind: "reader", diagnostics: c.diagnostics } };
  if (check.kind === "output") {
    const r = await runner.run(c.wasm, { deadlineMs, signal, final: true, ...caps });
    return ranToEnd(r) ? outputVerdict(r.stdout, check.expected) : { passed: false, text: `Stopped: ${whyStopped(r, deadlineMs, false)}` };
  }
  if (check.kind === "input") {
    const results = [];
    for (const run of check.runs)
      results.push(await runner.run(c.wasm.slice(), { stdin: run.typed.map((t) => t + "\n").join(""), final: true, deadlineMs, signal, ...caps }));
    return inputVerdict(results, check.runs, deadlineMs);
  }
  throw new Error(`runCheck: no run for a ${check.kind} check`);
}
