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
  static void testTheFixturePassesCheck() throws Exception {
    var r = Fixtures.build(Fixtures.project("audit"), "--check", "--no-fork-gate-for-tests");
    T.eq(0, r.exit(), "check passes on the fixture: " + r.out());
    // ch02-types-and-input#3 is both varies:true and carries a stated output fence: checkBox skips rule 4
    // for it (decl.varies()), so it must not be counted as "compared" either—3 of the fixture's 4 stated
    // outputs are actually compared, not 4. The practice page's reference box does not count either (never
    // checked at all), but its compileError box does (checked, just not for output).
    T.check(r.out().contains("8 boxes checked, 3 stated outputs compared, 0 problem(s)"),
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
}
