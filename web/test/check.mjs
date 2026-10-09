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
// Check under Node against the real runtime: a right answer passes, a wrong one fails with the case that shows it,
// a changed signature is explained in plain words, the reader's own main never runs, and a runaway case stops the
// check with a reason. Plus the output, predict and input verdicts.
//   node web/test/check.mjs
import { NodeRunner } from "../../runtime/runner/node-runner.mjs";
import { methodHarness, explainCompile, runCheck, outputVerdict, predictVerdict, inputVerdict } from "../page/check.js";
import { DIST, check, done } from "./harness.mjs";

const r = new NodeRunner(DIST);
const IS_EVEN = { kind: "method", name: "isEven", returns: "boolean", params: ["int"], cases: [["4", "true"], ["7", "false"], ["0", "true"]] };
const file = (body) => `${body}\n\nvoid main() {\n    IO.println("MAIN RAN " + isEven(4));\n}\n`;

let v = await runCheck(r, file("boolean isEven(int n) {\n    return n % 2 == 0;\n}"), IS_EVEN);
check("a right answer passes every case", v.passed && v.lines.length === 3 && v.lines.every((l) => l.ok), v);
check("the passing lines read as the cases do", v.lines[0].text === "isEven(4) -> true", v.lines);
v = await runCheck(r, file("boolean isEven(int n) {\n    return n % 2 == 1;\n}"), IS_EVEN);
check("a wrong answer fails, naming the case", !v.passed && v.lines[0].text === "isEven(4) returned false, expected true", v.lines);
const h = methodHarness(file("boolean isEven(int n) { return true; }"), IS_EVEN);
check("the reader's main is renamed", h.source.includes('void jf$m() {\n    IO.println("MAIN RAN'), h.source);
// The rename alone does not show that the reader's main never runs, and what it prints never reaches the verdict
// anyway. A main that calls System.exit(3) would end the run before any case if it ran, and the check would stop.
v = await runCheck(r, 'boolean isEven(int n) {\n    return n % 2 == 0;\n}\n\nvoid main() {\n    IO.println("MAIN RAN");\n    System.exit(3);\n}\n', IS_EVEN);
check("the reader's main never runs: one that calls System.exit(3) still lets every case pass",
  v.passed && v.lines.length === 3 && !v.stopped, v);
// The long form is renamed too: left as it is, the JDK would launch it ahead of the generated main() (a static
// main(String[]) comes first), and its System.exit(3) would stop the check before any case.
v = await runCheck(r, 'boolean isEven(int n) {\n    return n % 2 == 0;\n}\n\npublic static void main(String[] args) {\n    System.exit(3);\n}\n', IS_EVEN);
check("a long-form public static void main(String[] args) is renamed too: its System.exit(3) still lets every case pass",
  v.passed && v.lines.length === 3 && !v.stopped, v);

const sig = async (body) => (await runCheck(r, file(body), IS_EVEN)).compile;
// In each of these the reader's own main still calls isEven(4) and fails too: the signature is still the message.
let c = await sig("boolean isOdd(int n) { return n % 2 == 1; }");
check("a renamed method is explained", c?.kind === "signature" && c.message === "Check could not find a method isEven that takes (int). The exercise needs: boolean isEven(int).", c);
c = await sig("boolean isEven(String n) { return true; }");
check("a changed parameter type is explained", c?.kind === "signature" && c.message === "isEven's parameter should be int, but yours takes String. The exercise needs: boolean isEven(int).", c);
c = await sig("String isEven(int n) { return \"yes\"; }");
check("a changed return type is explained", c?.kind === "signature" && c.message === "isEven should return boolean, but yours returns String. The exercise needs: boolean isEven(int).", c);
c = await sig("boolean isEven(int n, int m) { return true; }");
check("a changed parameter count is explained", c?.kind === "signature" && c.message === "Check calls isEven with (int), but your isEven takes (int,int). The exercise needs: boolean isEven(int).", c);
// The error on the generated call says which side is wrong by its column: at the call's open, it is the return type,
// however many arguments follow; anywhere else, an argument.
c = (await runCheck(r, 'String add(int a, int b) { return "3"; }\n', { kind: "method", name: "add", returns: "int", params: ["int", "int"], cases: [["1, 2", "3"]] })).compile;
check("a changed return type on a method with two parameters is explained as the return type",
  c?.kind === "signature" && c.message === "add should return int, but yours returns String. The exercise needs: int add(int, int).", c);
c = await sig("boolean isEven(int n) {\n    return n % 2 == 0\n}");
check("the reader's own syntax error is shown as their own, on their own line", c?.kind === "reader" && c.diagnostics[0].line === 2, c);
// Check's name for the reader's main never reaches the reader: two mains are named as main, as javac names them in the
// reader's file alone.
c = await sig("boolean isEven(int n) {\n    return n % 2 == 0;\n}\n\nvoid main() {\n}");
check("a file that declares main twice is told main() is already defined, never Check's own name for it",
  c?.kind === "reader" && c.diagnostics.some((d) => d.message === "method main() is already defined in class Main") && !JSON.stringify(c).includes("jf$m"), c);
// Check renames the reader's main, and javac counts columns in the file Check compiles, but the page draws the caret
// under the reader's own line: a column on that line must be the column the reader's file alone gets (Ruling 29).
const ONE_LINE_MAIN = "boolean isEven(int n) {\n    return n % 2 == 0;\n}\n\nvoid main() { IO.println(isEven(4)) }\n";
const alone = (await r.compile(ONE_LINE_MAIN)).diagnostics[0];
c = (await runCheck(r, ONE_LINE_MAIN, IS_EVEN)).compile;
check("an error on the line of the reader's main has the line and column of the reader's file alone",
  c?.kind === "reader" && alone?.line === 5 && c.diagnostics[0].line === alone.line && c.diagnostics[0].column === alone.column,
  { check: c?.diagnostics?.[0], alone });
c = await sig('boolean isEven(int n) {\n    int x = "two";\n    return true;\n}');
check("a type error of the reader's own, with the right signature, is shown on their own line", c?.kind === "reader" && c.diagnostics.some((d) => d.line === 2), c);
c = await sig("");
check("a deleted method is explained", c?.kind === "signature" && c.message.startsWith("Check could not find a method isEven that takes (int)."), c);
// A brace the reader dropped or added unbalances the file, and javac's error then lands past the reader's own lines,
// in the code Check appends. It is still the reader's own mistake, so it is shown on the reader's own lines.
const readerLines = (body) => file(body).split("\n").length - 1;
c = await sig("boolean isEven(int n) {\n    return n % 2 == 0;\n");
check("a missing closing brace is shown as the reader's own error, on a reader line",
  c?.kind === "reader" && c.diagnostics[0].line != null && c.diagnostics[0].line <= readerLines("boolean isEven(int n) {\n    return n % 2 == 0;\n"), c);
c = await sig("boolean isEven(int n) {\n    return n % 2 == 0;\n}\n}");
check("an extra closing brace is shown as the reader's own error, on a reader line",
  c?.kind === "reader" && c.diagnostics[0].line != null && c.diagnostics[0].line <= readerLines("boolean isEven(int n) {\n    return n % 2 == 0;\n}\n}"), c);

// An error Check cannot put in its own words is settled by the reader's file alone. Its main is renamed, so the file
// alone must not be blamed for having no main: overloads that leave no applicable isEven(int) are the signature's
// fault, whether or not the reader's own main still calls isEven(4) and trips on the same error.
const OVERLOADS = "boolean isEven(String s) { return true; }\nboolean isEven(boolean b) { return b; }";
const NO_APPLICABLE = "Check could not call isEven: no suitable method found for isEven(int). The exercise needs: boolean isEven(int).";
c = (await runCheck(r, `${OVERLOADS}\n\nvoid main() {\n    IO.println("hi");\n}\n`, IS_EVEN)).compile;
check("an unclear error is a signature message when the reader's file compiles on its own", c?.kind === "signature" && c.message === NO_APPLICABLE, c);
c = await sig(OVERLOADS);
check("...and when the reader's own main trips on the same error", c?.kind === "signature" && c.message === NO_APPLICABLE, c);
check("the reader is never told their file has no main", !JSON.stringify(c).includes("does not have main"), c);

// The reader's own output never counts (DESIGN section 3): a method may print, with or without a newline, and a
// method may even print what looks like Check's own lines.
v = await runCheck(r, file('boolean isEven(int n) {\n    System.out.print("checking " + n + " ");\n    return n % 2 == 0;\n}'), IS_EVEN);
check("a method that prints without a newline still passes: its partial line never joins Check's",
  v.passed && v.lines.length === 3 && !v.stopped, v);
// isEven(0) is the last case, so what this prints there lands after every real line: on a fixed marker, the wrong
// method (isEven(4) is false here) would pass.
v = await runCheck(r, file('boolean isEven(int n) {\n    if (n == 0) {\n        System.out.println("\\u001fjf 0 ok");\n        System.out.println("\\u001fjf 1 ok");\n        System.out.println("\\u001fjf 2 ok");\n        System.out.println("\\u001fjf done");\n    }\n    return n == 0;\n}'), IS_EVEN);
check("a method that prints forged result lines cannot make a wrong answer pass", !v.passed && v.lines[0]?.ok === false, v);
check("each check writes its own marker into the generated code, so a line printed by the reader cannot be guessed",
  methodHarness(file("boolean isEven(int n) { return true; }"), IS_EVEN).source !== methodHarness(file("boolean isEven(int n) { return true; }"), IS_EVEN).source, null);

v = await runCheck(r, "int reciprocal(int n) { return 100 / n; }\n", { kind: "method", name: "reciprocal", returns: "int", params: ["int"], cases: [["5", "20"], ["0", "0"], ["4", "25"]] });
check("a case that throws fails alone; the others still run",
  !v.passed && v.lines[0].ok && v.lines[1].text === "reciprocal(0) threw java.lang.ArithmeticException: / by zero" && v.lines[2].ok, v.lines);
v = await runCheck(r, "int down(int n) { return down(n + 1); }\n", { kind: "method", name: "down", returns: "int", params: ["int"], cases: [["1", "0"]] });
check("endless recursion stops the check with a reason naming the case",
  !v.passed && v.stopped === "Check stopped while running down(1): StackOverflowError. Does your method call itself without end?", v);
v = await runCheck(r, "int spin(int n) { while (true) {} }\n", { kind: "method", name: "spin", returns: "int", params: ["int"], cases: [["1", "0"]] }, { deadlineMs: 2000 });
check("an endless loop stops the check at the deadline", !v.passed && v.stopped === "Check stopped while running spin(1): it ran for more than 2 seconds. An endless loop?", v);
v = await runCheck(r, "int size(ArrayList<String> xs) { return xs.size(); }\n", { kind: "method", name: "size", returns: "int", params: ["ArrayList<String>"], cases: [["new ArrayList<>(List.of(\"a\", \"b\"))", "2"]] });
check("a java.util exercise compiles: the file keeps its implicit imports (D39)", v.passed, v);
v = await runCheck(r, "import java.util.List;\n\nint first(List<Integer> xs) { return xs.get(0); }\n", { kind: "method", name: "first", returns: "int", params: ["List<Integer>"], cases: [["List.of(7, 8)", "7"]] });
check("a file that starts with an import still works", v.passed, v);
v = await runCheck(r, "int[] twice(int[] a) { int[] b = new int[a.length]; for (int i = 0; i < a.length; i++) b[i] = 2 * a[i]; return b; }\n",
  { kind: "method", name: "twice", returns: "int[]", params: ["int[]"], cases: [["new int[] {1, 2}", "new int[] {2, 4}"], ["new int[] {3}", "new int[] {7}"]] });
check("arrays compare by content, and a wrong one is shown readably", v.lines[0].ok && v.lines[1].text === "twice(new int[] {3}) returned [6], expected new int[] {7}", v.lines);
v = await runCheck(r, 'String greet(String n) { return "Hi " + n; }\n', { kind: "method", name: "greet", returns: "String", params: ["String"], cases: [['"Ada"', '"Hello Ada"']] });
check("a wrong String is shown in quotes", v.lines[0].text === 'greet("Ada") returned "Hi Ada", expected "Hello Ada"', v.lines);
v = await runCheck(r, "record Point(int x, int y) {}\n\nint sum(Point p) { return p.x() + p.y(); }\n", { kind: "method", name: "sum", returns: "int", params: ["Point"], cases: [["new Point(3, 4)", "7"]] });
check("a record the reader declares works as a parameter", v.passed, v);
v = await runCheck(r, "static boolean isEven(int n) { return n % 2 == 0; }\n", IS_EVEN);
check("a static method is called the same way", v.passed, v);

check("output: equal after tidying passes", outputVerdict("Ada  \r\n", "Ada\n").passed, null);
let o = outputVerdict("Hello\nAda\n", "Hello\nBob\n");
check("output: the first differing line is named", !o.passed && o.text === "Line 2 is: Ada\nIt should be: Bob", o);
o = outputVerdict("Hello\n", "Hello\nBob\n");
check("output: a missing line is named", !o.passed && o.text === "The output stops after line 1. Line 2 should be: Bob", o);
o = predictVerdict("3\n4", "3\n5\n");
check("predict: says what the reader said and what it prints", !o.passed && o.text === "Line 2: you said 4, it prints 5", o);
// A quoted line that is empty is named as blank, and one that is missing as nothing, never an empty gap.
o = predictVerdict("3\n\n5", "3\n4\n5\n");
check("predict: a blank line the reader said is named as one", !o.passed && o.text === "Line 2: you said a blank line, it prints 4", o);
o = predictVerdict("3", "3\n5\n");
check("predict: a line the reader left out is named as missing", !o.passed && o.text === "Line 2: you said nothing, it prints 5", o);
o = outputVerdict("Hello\n\nAda\n", "Hello\nAda\n");
check("output: a blank line is named as one", !o.passed && o.text === "Line 2 is: a blank line\nIt should be: Ada", o);
// A text that is empty after tidying has no lines: it is nothing, not a blank line, and output that printed nothing
// does not "stop after line 0".
o = predictVerdict("", "5\n");
check("predict: an empty prediction reads as saying nothing", !o.passed && o.text === "Line 1: you said nothing, it prints 5", o);
o = outputVerdict("", "Ada\n");
check("output: a program that prints nothing is told so plainly", !o.passed && o.text === "It prints nothing. Line 1 should be: Ada", o);
o = outputVerdict("\n\n", "Ada\n");
check("output: only blank lines, which tidying removes, is nothing too", !o.passed && o.text === "It prints nothing. Line 1 should be: Ada", o);
check("predict: right passes, trailing spaces and a missing last newline don't matter", predictVerdict("3  \n5", "3\n5\n").passed, null);
check("predict: a leading space does", !predictVerdict(" 3\n5", "3\n5\n").passed, null);

const DOUBLE = 'void main() { int n = Integer.parseInt(IO.readln("Number: ")); IO.println("Twice " + n + " is " + (2 * n)); }';
const runs = [{ typed: ["5"], numbers: ["5", "10"] }, { typed: ["-3"], numbers: ["-6"], words: ["twice"] }];
v = await runCheck(r, DOUBLE, { kind: "input", runs });
check("input: the pinned numbers and words come out in order, however worded", v.passed && v.lines.length === 2, v);
v = await runCheck(r, 'void main() { int n = Integer.parseInt(IO.readln("Number: ")); IO.println("Twice is " + (n + n + 1)); }', { kind: "input", runs });
check("input: a wrong number fails, saying which input showed it", !v.passed && v.lines[0].text.startsWith('With input 5: expected the numbers 5, 10 in order'), v.lines);
v = inputVerdict([{ status: "ok", stdout: "2.504\n", stderr: "" }], [{ typed: [], numbers: ["2.5"] }]);
check("input: a decimal matches within 0.005", v.passed, v);
v = await runCheck(r, 'void main() { IO.println("Ada"); }', { kind: "output", expected: "Ada\n" });
check("output: runs the program and compares", v.passed, v);

// A program that prints the right text and then dies of an uncaught exception fails: on the JDK it exits 1 (Ruling
// 34). Both runners report it as status "ok", with the JDK's trace on stderr, so the check looks there for the JDK's
// "Exception in thread" line, as runtime/test/differential.mjs does (which looks only at the start: here the line may
// follow the program's own stderr text). The verdict says the program stopped and names the exception's first line.
const ADA = { kind: "output", expected: "Ada\n" };
const THREW = 'Stopped: the program threw an exception that nothing caught:\nException in thread "main" java.lang.RuntimeException: boom';
v = await runCheck(r, 'void main() { IO.println("Ada"); throw new RuntimeException("boom"); }', ADA);
check("output: the right text, then an uncaught exception, fails, naming the exception", !v.passed && v.text === THREW, v);
v = await runCheck(r, 'void main() { int n = Integer.parseInt(IO.readln("Number: ")); IO.println(2 * n); throw new RuntimeException("boom"); }',
  { kind: "input", runs: [{ typed: ["5"], numbers: ["10"] }] });
check("input: the pinned number, then an uncaught exception, fails, naming the exception",
  !v.passed && v.lines[0].text === 'With input 5: the program threw an exception that nothing caught:\nException in thread "main" java.lang.RuntimeException: boom', v.lines);
// What the program wrote to System.err before it threw comes first on stderr, as on the JDK: the exception still counts.
v = await runCheck(r, 'void main() { IO.println("Ada"); System.err.print("before "); throw new RuntimeException("boom"); }', ADA);
check("output: an uncaught exception after the program's own stderr text still fails", !v.passed && v.text === THREW, v);
// Writing to System.err is not an exception: an output check compares what the program prints.
v = await runCheck(r, 'void main() { IO.println("Ada"); System.err.println("a note"); }', ADA);
check("output: a program that also writes to System.err still passes", v.passed, v);

// A stopped run reads in plain words, never with the runner's own status names (Ruling 36).
const RAW = /exit-\d|\btrap\b|crashed|fatal|output-limit|\(ok\)/;
v = await runCheck(r, 'void main() { IO.println("Ada"); System.exit(3); }', ADA);
check("output: a program that calls System.exit(3) is told so in plain words",
  !v.passed && v.text === "Stopped: the program called System.exit." && !RAW.test(v.text), v);
v = await runCheck(r, 'int down(int n) { return down(n + 1) + 1; }\nvoid main() { IO.println("Ada"); IO.println(down(0)); }', ADA);
check("output: a program that overflows the stack is told so in plain words",
  !v.passed && v.text === "Stopped: StackOverflowError. Does a method call itself without end?" && !RAW.test(v.text), v);
v = await runCheck(r, 'void main() { IO.readln("Number: "); System.exit(3); }', { kind: "input", runs: [{ typed: ["5"], numbers: ["10"] }] });
check("input: a program that calls System.exit(3) is told so in plain words",
  !v.passed && v.lines[0].text === "With input 5: the program called System.exit." && !RAW.test(v.lines[0].text), v.lines);
// A run that ended with nothing to say why (a crash with an empty stderr, from a runner stub) is told so plainly.
const CRASHES = { compile: async () => ({ ok: true, wasm: new Uint8Array(0), diagnostics: [] }),
  run: async () => ({ status: "crashed", stdout: "", stderr: "" }) };
v = await runCheck(CRASHES, 'void main() { IO.println("Ada"); }', ADA);
check("output: a run that crashed with nothing on stderr reads \"Stopped: the program ended unexpectedly.\"",
  !v.passed && v.text === "Stopped: the program ended unexpectedly.", v);
// Check stops a run at the page's caps (D40(c)), a million characters and 100,000 lines, as Run does, not at the
// worker's larger defaults (4,000,000 and 250,000), in each of its three kinds of run.
const head = (x) => JSON.stringify(x).slice(0, 300);
v = await runCheck(r, 'void main() { IO.print("x".repeat(1_500_000)); }', ADA);
check("output: a program that prints 1,500,000 characters is stopped at the page's cap", !v.passed && v.text === "Stopped: the program printed too much.", head(v));
v = await runCheck(r, 'int loud(int n) { IO.print("x".repeat(1_500_000)); return n; }\n', { kind: "method", name: "loud", returns: "int", params: ["int"], cases: [["1", "1"]] });
check("method: a method that prints 1,500,000 characters is stopped at the page's cap",
  !v.passed && v.stopped === "Check stopped while running loud(1): it printed too much.", head(v));
v = await runCheck(r, 'void main() { IO.readln("Number: "); for (int i = 0; i < 150_000; i++) IO.println(); }', { kind: "input", runs: [{ typed: ["5"], numbers: ["10"] }] });
check("input: a program that prints 150,000 lines is stopped at the page's cap",
  !v.passed && v.lines[0]?.text === "With input 5: the program printed too much.", head(v));
// System.exit(0) ends the run as "ok" with exit code 0: in a method check that is still the method calling System.exit.
v = await runCheck(r, "boolean isEven(int n) { System.exit(0); return true; }\n", IS_EVEN);
check("method: a case that calls System.exit(0) is reported as calling System.exit",
  !v.passed && v.stopped === "Check stopped while running isEven(4): your method called System.exit.", v);
await r.close();
done();
