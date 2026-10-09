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

final class VocabularyTest {
  static void testWhatAProgramUsesResolvedToItsOwners() throws Exception {
    var v = Vocab.of("""
        void main() {
            var names = new java.util.ArrayList<String>();
            names.add("x");
            final int n = names.get(0).length();
            IO.println(n);
        }
        """);
    T.check(v.members().contains("java.util.ArrayList#add"), "method by owner: " + v.members());
    T.check(v.members().contains("java.util.ArrayList#<init>"), "constructor: " + v.members());
    T.check(v.members().contains("java.lang.String#length"), "String.length: " + v.members());
    T.check(v.members().contains("java.lang.IO#println"), "IO.println: " + v.members());
    T.check(v.types().contains("java.util.ArrayList"), "library type: " + v.types());
    T.check(v.keywords().containsAll(List.of("var", "final")), "keywords: " + v.keywords());
    T.check(v.kinds().contains("MEMBER_SELECT") && v.kinds().contains("METHOD_INVOCATION"), "kinds: " + v.kinds());
    T.check(v.members().stream().noneMatch(m -> m.contains("#main")), "the program's own names never count");
  }
  static void testAFourBacktickFenceInSolutionsNamesTheFile() throws Exception {
    // The same refusal as a page's, from the solutions file: Markdown cannot say which file it parsed.
    Path f = Fixtures.project("vocab-solutions-four-backticks").resolve("volumes/vol-fixture/content/_solutions.md");
    Files.writeString(f, "## ch01-first-programs#4\n\n````java\nvoid main() {}\n````\n");
    T.fails("content/_solutions.md: fences of four or more backticks are not supported",
        () -> Vocabulary.solutions(f), "the error names the solutions file");
  }
  static void testTheFixturePasses() throws Exception {
    T.eq(0, Fixtures.build(Fixtures.project("vocab"), "--check", "--no-fork-gate-for-tests").exit(), "fixture is within its chapters");
  }
  static void testASolutionUsingSomethingUnshownFails() throws Exception {
    Path p = Fixtures.project("vocab-solution");
    Path f = p.resolve("volumes/vol-fixture/content/_solutions.md");
    Files.writeString(f, Files.readString(f).replace("IO.println(\"Ada\");", "var l = new java.util.ArrayList<String>(); l.add(\"Ada\"); IO.println(l.get(0));"));
    var r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests");
    T.eq(1, r.exit(), "exit");
    T.check(r.out().contains("ch01-first-programs#4 (solution): uses what the course has not shown by chapter 1"), r.out());
    T.check(r.out().contains("type java.util.ArrayList") && r.out().contains("keyword var"), "names each item: " + r.out());
  }
  static void testASecondSolutionFenceIsCheckedToo() throws Exception {
    // The _solutions.md parser used to reset its tracking id to null after the first java fence under a
    // "## <box id>" heading, so a second or alternative solution fence in the same section was never held to
    // D4, though the plan says every fence in _solutions.md is checked.
    Path p = Fixtures.project("vocab-solution-second-fence");
    Path f = p.resolve("volumes/vol-fixture/content/_solutions.md");
    Files.writeString(f, Files.readString(f)
        + "\n```java\nvoid main() {\n    var l = new java.util.ArrayList<String>();\n    l.add(\"Ada\");\n    IO.println(l.get(0));\n}\n```\n");
    var r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests");
    T.eq(1, r.exit(), "exit");
    T.check(r.out().contains("ch01-first-programs#4 (solution): uses what the course has not shown by chapter 1"),
        "the second fence, not just the first, is checked: " + r.out());
  }
  static void testASolutionKeyedToAnAppendixBoxFailsWithABuildErrorNotACrash() throws Exception {
    // A _solutions.md section (or a _checks.json starter) keyed to a box on a front-matter or appendix page
    // (chapter -1) has no entry in knownByChapter, which used to crash with an uncaught
    // NullPointerException instead of a named BuildError.
    Path p = Fixtures.project("vocab-solution-appendix");
    Path appendix = p.resolve("volumes/vol-fixture/content/99-appendices.md");
    Files.writeString(appendix, Files.readString(appendix) + "\n```java\nvoid main() {\n    System.out.println(\"legacy\");\n}\n```\n");
    // The solution differs from the box it is keyed to: one equal to it is the page publishing its own
    // worked solution, which Boxes.validate refuses (Checks.problems) before --check reaches this gate.
    Path solutions = p.resolve("volumes/vol-fixture/content/_solutions.md");
    Files.writeString(solutions, Files.readString(solutions) + "\n## 99-appendices#1\n\n```java\nvoid main() {\n    System.out.println(\"legacy, solved\");\n}\n```\n");
    var r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests");
    T.eq(1, r.exit(), "exit");
    T.check(r.out().contains("99-appendices#1"), "names the box: " + r.out());
    T.check(r.out().contains("outside any chapter"), "a BuildError, not a crash: " + r.out());
    T.check(!r.out().contains("NullPointerException"), "no raw stack trace: " + r.out());
  }
  static void testAPracticeStepMayUseItsOwnChapterButNotALaterOne() throws Exception {
    Path p = Fixtures.project("vocab-practice");
    Path f = p.resolve("volumes/vol-fixture/practice/ch02-types-and-input-practice.md");
    Files.writeString(f, Files.readString(f).replace("IO.println(n * 2);", "IO.println(Math.max(n, 2));"));
    var r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests");
    T.eq(1, r.exit(), "Math.max is not shown by chapter 2");
    T.check(r.out().contains("member java.lang.Math#max"), r.out());
  }
  static void testPracticeReferenceAndCompileErrorBoxesAreExemptFromTheVocabularyGate() throws Exception {
    // volumes/README.md: a compileError box is exempt from the vocabulary gate "only if it truly fails to
    // compile" (Audit already proves that separately), and a reference box never runs at all. The practice
    // loop used to require every box to compile, so the fixture's practice page now carries one of each
    // (ch02-types-and-input-practice#2 is reference, #3 is compileError) and this proves Vocabulary itself
    // skips both rather than reporting "does not compile".
    Path p = Fixtures.project("vocab-practice-exempt");
    Volume v = Volume.loadAll(p.resolve("volumes")).get(0);
    Map<Page, List<Box>> boxes = new LinkedHashMap<>();
    for (Page page : v.pages()) boxes.put(page, Boxes.of(v, page));
    List<String> problems = Vocabulary.check(v, boxes);
    T.check(problems.stream().noneMatch(s -> s.contains("ch02-types-and-input-practice#2") || s.contains("ch02-types-and-input-practice#3")),
        "the practice page's reference and compileError boxes are skipped: " + problems);
  }
  static void testAChapterOneSolutionMayNotUseWhatOnlyChapterTwoTeaches() throws Exception {
    // Pins D4's core ordering promise, forward: without this, VocabularyTest's existing negative cases would
    // still pass under a regression to an order-blind, whole-volume union, because their only unshown
    // vocabulary (ArrayList, var, Math.max, String.valueOf) is never taught anywhere in the fixture at all.
    // Integer.parseInt is taught, but only starting in chapter 2 (ch02-types-and-input#1); a chapter-1
    // solution using it must still fail.
    Path p = Fixtures.project("vocab-order-forward");
    Path f = p.resolve("volumes/vol-fixture/content/_solutions.md");
    Files.writeString(f, Files.readString(f).replace("IO.println(\"Ada\");", "IO.println(Integer.parseInt(\"1\"));"));
    var r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests");
    T.eq(1, r.exit(), "Integer.parseInt is not shown by chapter 1: " + r.out());
    T.check(r.out().contains("member java.lang.Integer#parseInt"), r.out());
  }
  static void testAChapterTwoPracticeStepMayUseWhatChapterOneTaught() throws Exception {
    // The other direction: the cumulative union must actually accumulate backward, or a regression that
    // checks each chapter against only its own content page would still pass every existing test.
    // int[] (array creation and indexing) is taught in chapter 1 (ch01-first-programs#2), never re-taught in
    // chapter 2's own content; a chapter-2 practice step using it must still pass.
    Path p = Fixtures.project("vocab-order-backward");
    Path f = p.resolve("volumes/vol-fixture/practice/ch02-types-and-input-practice.md");
    Files.writeString(f, Files.readString(f).replace("IO.println(n * 2);", "int[] a = new int[] {n}; IO.println(a[0] * 2);"));
    var r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests");
    T.eq(0, r.exit(), "int[] was taught in chapter 1, so chapter 2's practice may use it: " + r.out());
  }
  static void testAStarterIsCheckedToo() throws Exception {
    Path p = Fixtures.project("vocab-starter");
    Path f = p.resolve("volumes/vol-fixture/content/_checks.json");
    Files.writeString(f, Files.readString(f).replace("IO.println(\\\"\\\");", "IO.println(String.valueOf(1));"));
    T.eq(1, Fixtures.build(p, "--check", "--no-fork-gate-for-tests").exit(), "String.valueOf is not shown in chapter 1");
  }
  static void testTheCompactSourceClassesOwnSynthesizedMembersNeverCount() throws Exception {
    // Every box is a JEP 477 compact source file: javac silently gives its implicit class a "final" modifier
    // and an implicit no-arg constructor calling super(), neither written by the box's author. Neither may
    // count as taught vocabulary, or chapter 1's very first box would permanently "teach" final and
    // java.lang.Object#<init> and the gate could never flag their real first use in a later chapter.
    var v = Vocab.of("void main() { IO.println(\"x\"); }\n");
    T.check(!v.keywords().contains("final"), "the implicit class's final is not the author's: " + v.keywords());
    T.check(!v.members().contains("java.lang.Object#<init>"), "the implicit constructor's super() is not the author's: " + v.members());
  }
}
