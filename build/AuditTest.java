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
import java.nio.file.*;
import java.util.*;

final class AuditTest {
  static void testTheTranscriptRuleRemovesTypedAnswersInOrder() throws Exception {
    T.eq("How many? 42\n", Audit.stdoutFromTranscript("How many? 21\n42\n", List.of("21")), "one answer after a prompt");
    T.eq("Name:\nAge:\nAda is 36\n", Audit.stdoutFromTranscript("Name:\nAda\nAge:\n36\nAda is 36\n", List.of("Ada", "36")), "answers on their own lines");
    T.fails("does not show the typed answer \"7\"", () -> Audit.stdoutFromTranscript("How many? 21\n42\n", List.of("7")), "missing answer");
  }
  static void testABlankLineRightAfterAnAnswerMatchesTheRun() throws Exception {
    // A program that prints an empty line straight after reading an answer (chapter 2's receipt: a prompt, then
    // IO.println()) writes "Customer name: \n" to stdout, which tidy makes "Customer name:". Its terminal transcript,
    // "Customer name: Ada" then a blank line, must recover the same text once the answer is removed, or no transcript
    // can state such a run: tidy applies to both sides, as volumes/README.md says and web/test/replay.mjs does.
    String run = "Customer name: \n===== CORNER STORE =====\n";
    T.eq(Audit.tidy(run) + "\n", Audit.statedStdout("Customer name: Ada\n\n===== CORNER STORE =====\n", List.of("Ada")),
        "a blank line right after an answer");
    T.eq("How many? 42\n", Audit.statedStdout("How many? 21\n42\n", List.of("21")), "an answer then more output on its line");
  }
  static void testTheFixturePassesCheck() throws Exception {
    var r = Fixtures.build(Fixtures.project("audit"), "--check", "--no-fork-gate-for-tests");
    T.eq(0, r.exit(), "check passes on the fixture: " + r.out());
    // ch02-types-and-input#3 is both varies:true and carries a stated output fence: checkBox skips rule 4
    // for it (decl.varies()), so it must not be counted as "compared" either—4 of the fixture's 5 stated
    // outputs are actually compared, not 5. The practice page's reference box does not count either (never
    // checked at all), but its compileError box does (checked, just not for output).
    T.check(r.out().contains("10 boxes checked, 4 stated outputs compared, 0 problem(s)"),
        "a varies box with a stated output is not counted as compared: " + r.out());
  }
  static void testEachRuleFailsWhenBroken() throws Exception {
    record Break(String file, String from, String to, String expect) {}
    var breaks = List.of(
      new Break("content/ch01-first-programs.md", "Hello, <world> & café 😀\n```", "Hello, <world> & cafe 😀\n```", "states an output the code does not print"),
      new Break("content/_boxes.json", "\"raises\": \"java.lang.ArrayIndexOutOfBoundsException\"", "\"raises\": \"java.lang.ArithmeticException\"", "does not fail the way it says"),
      new Break("content/_boxes.json", "\"compileError\": \"incompatible types: String cannot be converted to int\"", "\"compileError\": \"missing return\"", "does not fail to compile the way it says"),
      new Break("content/_boxes.json", "\"ch02-types-and-input#1\": {\"stdin\": [\"21\"]},", "", "reads input but declares no stdin"),
      new Break("content/ch01-first-programs.md", "IO.println(\"Ada\");", "IO.println(System.nanoTime());", "output varies between runs"),
      new Break("content/ch01-first-programs.md", "IO.println(\"Ada\");", "IO.println(\"Ada\") ;;; int x = ;", "fails to compile"));
    for (var b : breaks) {
      Path p = Fixtures.project("audit-break");
      Path f = p.resolve("volumes/vol-fixture/" + b.file());
      String s = Files.readString(f);
      T.check(s.contains(b.from()), "the break applies: " + b.from());
      Files.writeString(f, s.replace(b.from(), b.to()));
      var r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests");
      T.eq(1, r.exit(), "exit when " + b.expect());
      T.check(r.out().contains(b.expect()), "message \"" + b.expect() + "\" in: " + r.out());
    }
  }
  static void testAMalformedTranscriptIsReportedWithItsBoxIdAndDoesNotAbortTheRun() throws Exception {
    // stdoutFromTranscript used to throw a bare BuildError straight out of Audit.check: no box id, and every
    // other problem already found (including a separately broken box's own) silently discarded. Break two
    // boxes at once and confirm both problems survive in the same run.
    Path p = Fixtures.project("audit-transcript-plus-other-break");
    Path ch1 = p.resolve("volumes/vol-fixture/content/ch01-first-programs.md");
    Files.writeString(ch1, Files.readString(ch1).replace("Hello, <world> & café 😀\n```", "Hello, <world> & cafe 😀\n```"));
    Path ch2 = p.resolve("volumes/vol-fixture/content/ch02-types-and-input.md");
    Files.writeString(ch2, Files.readString(ch2).replace("How many? 21\n42", "How many? 99\n42"));
    var r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests");
    T.eq(1, r.exit(), "exit");
    T.check(r.out().contains("ch02-types-and-input#1: the stated sample run does not show the typed answer \"21\""),
        "names the box with the malformed transcript: " + r.out());
    T.check(r.out().contains("ch01-first-programs#1: states an output the code does not print"),
        "a separately broken box's own problem is not discarded: " + r.out());
  }
  static void testTrailingSpacesAndCrlfDoNotFailInteriorChangesDo() throws Exception {
    Path p = Fixtures.project("audit-tidy");
    Path f = p.resolve("volumes/vol-fixture/content/ch01-first-programs.md");
    Files.writeString(f, Files.readString(f).replace("\n", "\r\n").replace("café 😀\r\n```", "café 😀   \r\n```"));
    T.eq(0, Fixtures.build(p, "--check", "--no-fork-gate-for-tests").exit(), "CRLF and trailing spaces are tidied");
    Files.writeString(f, Files.readString(f).replace("Hello, <world> & café 😀   \r\n```", "Hello,  <world> & café 😀   \r\n```"));
    T.eq(1, Fixtures.build(p, "--check", "--no-fork-gate-for-tests").exit(), "a doubled interior space is a difference");
  }
  static void testARunawayBoxIsReportedAndTheOthersStillRun() throws Exception {
    Path p = Fixtures.project("audit-runaway");
    Path f = p.resolve("volumes/vol-fixture/content/ch01-first-programs.md");
    Files.writeString(f, Files.readString(f).replace("IO.println(\"Ada\");", "while (true) {}"));
    var r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests");
    T.eq(1, r.exit(), "a runaway box fails the check");
    T.check(r.out().contains("ch01-first-programs#4: timeout"), "named with its status: " + r.out());
    T.check(r.out().contains("ch02-types-and-input"), "later boxes were still audited: " + r.out());
  }
  /** D73: a terminal interleaves stdout and stderr in the order the program wrote them, but a run captured
   *  apart cannot say that order, so a box that writes to System.err and then dies uncaught has no output
   *  the page can state truthfully. The build refuses it and says what to do instead. An uncaught throw
   *  with nothing written to stderr first is the ordinary raises box and still builds. System.err.print
   *  with no newline is the same case: the JDK prints the exception line straight after the program's
   *  unfinished text ("beforeException in thread ..."), so no newline comes before it. */
  static void testABoxThatWritesToStderrThenThrowsUncaughtIsRefused() throws Exception {
    for (String write : new String[] {"println", "print"}) {
      String body = "void main() {\n    System.err." + write + "(\"before\");\n    throw new IllegalStateException(\"x\");\n}\n";
      for (boolean declared : new boolean[] {false, true}) {
        Path p = Fixtures.project("audit-stderr-then-throw");
        Path ch1 = p.resolve("volumes/vol-fixture/content/ch01-first-programs.md");
        Files.writeString(ch1, Files.readString(ch1).replace("void main() {\n    IO.println(\"Ada\");\n}\n", body));
        if (declared) {
          Path boxes = p.resolve("volumes/vol-fixture/content/_boxes.json");
          Files.writeString(boxes, Files.readString(boxes).replace("{\n \"ch01-first-programs#2\"",
              "{\n \"ch01-first-programs#4\": {\"raises\": \"java.lang.IllegalStateException\", \"why\": \"It throws on purpose.\"},\n \"ch01-first-programs#2\""));
        }
        var r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests");
        String how = "System.err." + write + ", " + (declared ? "declared raises" : "no declaration");
        T.eq(1, r.exit(), "refused (" + how + "): " + r.out());
        T.check(r.out().contains("ch01-first-programs#4: writes to System.err before an uncaught exception"),
            "names the box and why (" + how + "): " + r.out());
        T.check(r.out().contains("print from a catch block instead"), "says what to do instead (" + how + "): " + r.out());
      }
    }
  }
  static void testAnUncaughtThrowWithNothingBeforeItStillBuilds() throws Exception {
    Path p = Fixtures.project("audit-bare-throw");
    Path ch1 = p.resolve("volumes/vol-fixture/content/ch01-first-programs.md");
    Files.writeString(ch1, Files.readString(ch1).replace("void main() {\n    IO.println(\"Ada\");\n}\n",
        "void main() {\n    throw new IllegalStateException(\"x\");\n}\n"));
    Path boxes = p.resolve("volumes/vol-fixture/content/_boxes.json");
    Files.writeString(boxes, Files.readString(boxes).replace("{\n \"ch01-first-programs#2\"",
        "{\n \"ch01-first-programs#4\": {\"raises\": \"java.lang.IllegalStateException\", \"why\": \"It throws on purpose.\"},\n \"ch01-first-programs#2\""));
    var r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests");
    T.eq(0, r.exit(), "a bare uncaught throw is a raises box, not refused: " + r.out());
  }
  static void testCheckWithNoVolumesPrintsNoVolumesAndExitsZero() throws Exception {
    // A gate with nothing to check would otherwise pass vacuously (audit, vocabulary) or fail for the wrong
    // reason (the fork gate: an empty examples.json is deliberately a failure, Task 8). --check short-circuits
    // before any gate runs, so both are moot and a course with zero volumes is not itself an error.
    Path p = Fixtures.project("audit-no-volumes");
    Fixtures.deleteTree(p.resolve("volumes/vol-fixture"));
    var r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests");
    T.eq(0, r.exit(), "no volumes is not a failure: " + r.out());
    T.check(r.out().contains("no volumes"), "says so: " + r.out());
  }
  /** DESIGN section 2: chapter 12's runaway recursion crashes on purpose, declared raises java.lang.StackOverflowError.
   *  The browser runtime reports a stack overflow with the JDK's first line alone (runtime/runner/java-line.js), so the
   *  box states that line alone; the JDK's frames below it (up to 1,024) are compared neither with the stated output
   *  nor between the audit's two runs. The fixture's ch02-types-and-input#5 is such a box and passes
   *  (testTheFixturePassesCheck). It still fails when it does not overflow, throws something else first, states a
   *  frame, or prints what it does not state. */
  static void testARunawayRecursionBoxStatesItsFirstLineAlone() throws Exception {
    String overflow = "Exception in thread \"main\" java.lang.StackOverflowError\n```";
    record Break(String from, String to, String expect) {}
    var breaks = List.of(
      new Break("return down(n + 1) + 1;", "return n > 3 ? n : down(n + 1) + 1;", "ch02-types-and-input#5: does not fail the way it says"),
      new Break("return down(n + 1) + 1;", "return 1 / (100 - n) + down(n + 1);", "ch02-types-and-input#5: does not fail the way it says"),
      new Break(overflow, "Exception in thread \"main\" java.lang.StackOverflowError\n\tat Main.down(Main.java:2)\n```",
          "ch02-types-and-input#5: states an output the code does not print"),
      new Break("    IO.println(down(0));", "    IO.println(\"down we go\");\n    IO.println(down(0));",
          "ch02-types-and-input#5: states an output the code does not print"));
    for (var b : breaks) {
      Path p = Fixtures.project("audit-overflow");
      Path f = p.resolve("volumes/vol-fixture/content/ch02-types-and-input.md");
      String s = Files.readString(f);
      T.check(s.contains(b.from()), "the break applies: " + b.from());
      Files.writeString(f, s.replace(b.from(), b.to()));
      var r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests");
      T.eq(1, r.exit(), "exit when " + b.expect() + ": " + r.out());
      T.check(r.out().contains(b.expect()), "message \"" + b.expect() + "\" in: " + r.out());
    }
  }
  // --only is the authoring loop: every gate on the pages it names and their chapter's quiz, nothing else. Chapter 1's
  // first box is broken here, so --only ch02 passes only if chapter 1 is truly left out, and --only ch01 fails only if it
  // is truly checked. "ch02" names chapter 2's page and its practice page alike.
  static void testTheOnlyFlagChecksTheNamedChaptersPagesAndQuizAlone() throws Exception {
    Path p = Fixtures.project("only");
    Path ch1 = p.resolve("volumes/vol-fixture/content/ch01-first-programs.md");
    Files.writeString(ch1, Files.readString(ch1).replace("Hello, <world> & café 😀\n```", "Hello, <world> & cafe 😀\n```"));
    var two = Fixtures.build(p, "--check", "--no-fork-gate-for-tests", "--only", "ch02");
    T.eq(0, two.exit(), "--only ch02 leaves chapter 1's broken box alone: " + two.out());
    // The fixture as Tasks 5 and 6 leave it: chapter 2's page has #1 to #5, none a reference box (5), and its practice
    // page #1 and #3, #2 being one (2): 5 + 2 = 7 checked. Compared outputs: #1 and #5 (#2 is compileError, #3 varies,
    // #4 states none): 2.
    T.check(two.out().contains("  ch02-types-and-input: 5 boxes checked") && two.out().contains("  ch02-types-and-input-practice: 2 boxes checked"),
        "chapter 2's page and its practice page are checked: " + two.out());
    T.check(!two.out().contains("ch01-first-programs"), "chapter 1's page is not: " + two.out());
    T.check(two.out().contains("  quizzes: 0 questions run"), "nor chapter 1's quiz: " + two.out());
    T.check(two.out().contains("7 boxes checked, 2 stated outputs compared, 0 problem(s)"), "the totals count the named pages alone: " + two.out());
    var one = Fixtures.build(p, "--check", "--no-fork-gate-for-tests", "--only", "ch01");
    T.eq(1, one.exit(), "--only ch01 checks the broken box: " + one.out());
    T.check(one.out().contains("ch01-first-programs#1: states an output the code does not print"), one.out());
    T.check(one.out().contains("  quizzes: 2 questions run"), "and chapter 1's quiz: " + one.out());
  }
  // A page checked alone is still held to what the chapters before it taught: every earlier chapter's vocabulary is derived
  // from its boxes though none of them is checked. int[] is taught by chapter 1 alone (ch01-first-programs#2), so chapter
  // 2's practice step may use it under --only ch02. Math.max is taught by no chapter, so the same step with it fails,
  // which proves the vocabulary gate ran on the named page at all.
  static void testTheOnlyFlagStillHoldsAPageToTheChaptersBeforeIt() throws Exception {
    Path p = Fixtures.project("only-vocab");
    Path f = p.resolve("volumes/vol-fixture/practice/ch02-types-and-input-practice.md");
    String clean = Files.readString(f);
    Files.writeString(f, clean.replace("IO.println(n * 2);", "IO.println(Math.max(n, 2));"));
    var r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests", "--only", "ch02");
    T.eq(1, r.exit(), "Math.max is shown by no chapter: " + r.out());
    T.check(r.out().contains("member java.lang.Math#max"), r.out());
    Files.writeString(f, clean.replace("IO.println(n * 2);", "int[] a = new int[] {n}; IO.println(a[0] * 2);"));
    r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests", "--only", "ch02");
    T.eq(0, r.exit(), "int[], taught by chapter 1 alone, is known on chapter 2's practice page under --only ch02: " + r.out());
  }
  // --only narrows the gates, so it means nothing without --check; and a name no page has must fail, never check nothing
  // and pass.
  static void testTheOnlyFlagNeedsCheckAndAPageItNames() throws Exception {
    Path p = Fixtures.project("only-misuse");
    var r = Fixtures.build(p, "--only", "ch02");
    T.eq(2, r.exit(), "--only without --check is misuse: " + r.out());
    T.check(r.out().contains("--only works only with --check"), "and says why: " + r.out());
    r = Fixtures.build(p, "--check", "--only");
    T.eq(2, r.exit(), "a bare --only is misuse: " + r.out());
    T.check(r.out().contains("usage: java build/Build.java"), "with the usage line: " + r.out());
    // M7: one word for what --only takes, as README.md and Build.java's comment write it.
    T.check(r.out().contains("[--check [--only <name>]]"), "the usage line names it <name>: " + r.out());
    r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests", "--only", "ch09");
    T.eq(1, r.exit(), "a name no page has fails: " + r.out());
    T.check(r.out().contains("--only ch09: no page is named ch09 or starts ch09-"), r.out());
  }
  // The Pages job has 75 minutes for its setup and every gate (.github/workflows/pages.yml), so --check ends with each
  // gate's time and their sum, for the plan to watch as chapters arrive: on a failing run as on a passing one.
  static void testCheckEndsWithEachGatesTime() throws Exception {
    // Under --no-fork-gate-for-tests neither the fork gate nor the proof runs, so neither is timed (the proof gate's count
    // rule runs nothing and is timed with the vocabulary gate); ForkGateTest's --only test reads the line with both.
    var times = java.util.regex.Pattern.compile(
        "(?m)^gate times: audit \\d+\\.\\d s, vocabulary \\d+\\.\\d s, quizzes \\d+\\.\\d s; all gates \\d+\\.\\d s$");
    Path p = Fixtures.project("gate-times");
    var r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests");
    T.eq(0, r.exit(), r.out());
    T.check(times.matcher(r.out()).find(), "each gate's time and their sum: " + r.out());
    Path ch1 = p.resolve("volumes/vol-fixture/content/ch01-first-programs.md");
    Files.writeString(ch1, Files.readString(ch1).replace("Hello, <world> & café 😀\n```", "Hello, <world> & cafe 😀\n```"));
    r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests");
    T.eq(1, r.exit(), r.out());
    T.check(times.matcher(r.out()).find(), "printed when a gate fails too: " + r.out());
  }
}
