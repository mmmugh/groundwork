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

final class BoxesTest {
  static Map<Page, List<Box>> all(Volume v) throws Exception {
    var m = new LinkedHashMap<Page, List<Box>>();
    for (Page p : v.pages()) m.put(p, Boxes.of(v, p));
    return m;
  }
  static void testTheFixtureHasEveryKind() throws Exception {
    Volume v = Volume.loadAll(Fixtures.project("boxes").resolve("volumes")).get(0);
    var boxes = all(v);
    Boxes.validate(v, boxes);
    var ch1 = boxes.get(v.pages().get(1));
    T.eq(4, ch1.size(), "chapter 1 boxes");
    T.eq("ch01-first-programs#1", ch1.get(0).id(), "ids count java fences from 1");
    T.eq("Hello, <world> & café 😀\n", ch1.get(0).expected(), "stated output attached");
    T.eq("java.lang.ArrayIndexOutOfBoundsException", ch1.get(1).decl().raises(), "raises");
    T.check(ch1.get(2).decl().reference(), "reference");
    T.eq(null, ch1.get(3).expected(), "no stated output");
    var ch2 = boxes.get(v.pages().get(2));
    T.eq(List.of("21"), ch2.get(0).decl().stdin(), "typed input");
    T.check(ch2.get(2).decl().varies(), "varies");
  }
  static void testAFenceRightAfterThePartCommentLineIsNotSwallowed() throws Exception {
    // A <!-- part: ... --> line has no blank line after it, so it used to start a paragraph that, pre-fix,
    // swallowed a fence running straight into it: Boxes.of saw fewer boxes than were actually on the page
    // (and, since Pages.render strips the part comment before parsing, fewer than Pages.render itself would
    // find—the IndexOutOfBoundsException the finding reproduces). The Markdown.java fix means the part
    // comment's paragraph now ends at the fence, so both fences are found here exactly as Pages.render would
    // find them in the part-stripped text.
    Path p = Fixtures.project("boxes-part-fence");
    Files.writeString(p.resolve("volumes/vol-fixture/content/ch01-first-programs.md"),
        "<!-- part: One -->\n```java\nvoid main() { IO.println(1); }\n```\n\n```java\nvoid main() { IO.println(2); }\n```\n");
    Files.writeString(p.resolve("volumes/vol-fixture/content/_boxes.json"), "{}");
    Volume v = Volume.loadAll(p.resolve("volumes")).get(0);
    List<Box> boxes = Boxes.of(v, v.pages().get(1));
    T.eq(2, boxes.size(), "both fences found, none swallowed into the part-comment's paragraph");
    T.eq("ch01-first-programs#1", boxes.get(0).id(), "first box id");
    T.eq("ch01-first-programs#2", boxes.get(1).id(), "second box id");
  }
  static void testAFourBacktickFenceNamesThePageByItsFile() throws Exception {
    // Markdown's own error cannot know which file it is parsing, and a page's first heading is not where a
    // writer looks: Boxes.of is the one that holds the path, so it adds it, the way Volume does for JSON.
    Path p = Fixtures.project("boxes-four-backticks");
    Files.writeString(p.resolve("volumes/vol-fixture/content/ch01-first-programs.md"),
        "# Chapter 1\n\n````java\nvoid main() {}\n````\n");
    Volume v = Volume.loadAll(p.resolve("volumes")).get(0);
    T.fails("content/ch01-first-programs.md: fences of four or more backticks are not supported",
        () -> Boxes.of(v, v.pages().get(1)), "the error names the page's file");
  }
  static void testAnOutputFenceUnderAReferenceOrCompileErrorBoxIsRejected() throws Exception {
    // Neither box ever runs to completion (a reference box never runs at all; a compileError box never
    // compiles), so Audit skips rule 4 (the output comparison) for both. A stated output fence under either
    // was previously published to the page unchecked, and Build.java's "stated outputs compared" count still
    // included the compileError one—the same class of miscount an earlier fix corrected for varies boxes. Boxes.of
    // attaches any fence directly after a box's fence as its "expected" output regardless of the box's kind,
    // so the rejection lives in Boxes.validate, at the same point every other declaration rule is enforced.
    Path p = Fixtures.project("boxes-unchecked-output");
    Path ch1 = p.resolve("volumes/vol-fixture/content/ch01-first-programs.md");
    Files.writeString(ch1, Files.readString(ch1).replace(
        "```java\nif (condition) {\n```\n",
        "```java\nif (condition) {\n```\n\n```output\nthis is never checked\n```\n"));
    Path ch2 = p.resolve("volumes/vol-fixture/content/ch02-types-and-input.md");
    Files.writeString(ch2, Files.readString(ch2).replace(
        "```java\nvoid main() {\n    int count = \"three\";\n}\n```\n",
        "```java\nvoid main() {\n    int count = \"three\";\n}\n```\n\n```output\nthis is never checked\n```\n"));
    Volume v = Volume.loadAll(p.resolve("volumes")).get(0);
    try {
      Boxes.validate(v, all(v));
      throw new AssertionError("expected both output fences to be rejected");
    } catch (BuildError e) {
      T.check(e.getMessage().contains("ch01-first-programs#3: a reference box"), "reference box: " + e.getMessage());
      T.check(e.getMessage().contains("ch02-types-and-input#2: a compileError box"), "compileError box: " + e.getMessage());
    }
  }
  static void testAStringChecksEntryIsABuildErrorNamingItsId() throws Exception {
    // A _checks.json entry like "ch01-first-programs#4": "output" (a string, not an object) used to throw
    // an uncaught ClassCastException in Pages.checkKind during a plain build's writeSite—a stack trace, not
    // a BuildError. Validated up front in Boxes.validate instead, before anything is written.
    Path p = Fixtures.project("boxes-bad-checks-string");
    Files.writeString(p.resolve("volumes/vol-fixture/content/_checks.json"), "{\"ch01-first-programs#4\": \"output\"}");
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "a string _checks.json entry is a BuildError, not a crash: " + r.out());
    // The exact line, not just the id: #4 has a worked solution in _solutions.md, so the worked-solution rule
    // also names it, and a check for the id alone would pass with this rule deleted.
    T.check(r.out().contains("ch01-first-programs#4: _checks.json entry must be an object with a string \"kind\""), "names the id and the rule: " + r.out());
  }
  static void testAChecksEntryWithoutAStringKindIsABuildErrorNamingItsId() throws Exception {
    Path p = Fixtures.project("boxes-bad-checks-kind");
    Files.writeString(p.resolve("volumes/vol-fixture/content/_checks.json"), "{\"ch01-first-programs#4\": {\"expected\": \"Ada\\n\"}}");
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "a _checks.json entry without a string \"kind\" is a BuildError, not a crash: " + r.out());
    T.check(r.out().contains("ch01-first-programs#4: _checks.json entry must be an object with a string \"kind\""), "names the id and the rule: " + r.out());
  }
  static void testDeclarationsAreChecked() throws Exception {
    Path p = Fixtures.project("boxes-bad");
    Path f = p.resolve("volumes/vol-fixture/content/_boxes.json");
    Files.writeString(f, """
        {"ch01-first-programs#9": {"reference": true},
         "ch01-first-programs#1": {"raise": "java.lang.Oops"},
         "ch01-first-programs#2": {"raises": "java.lang.X", "compileError": "y"},
         "ch01-first-programs#4": {"reference": true, "stdin": ["1"]},
         "ch02-types-and-input#3": {"varies": true}}
        """);
    Volume v = Volume.loadAll(p.resolve("volumes")).get(0);
    T.fails("ch01-first-programs#9: no such box", () -> Boxes.validate(v, all(v)), "a declaration for a missing box");
    T.fails("ch01-first-programs#1: unknown key \"raise\"", () -> Boxes.validate(v, all(v)), "typo in a key");
    T.fails("ch01-first-programs#2: raises and compileError", () -> Boxes.validate(v, all(v)), "exclusive keys");
    T.fails("ch01-first-programs#4: a reference box", () -> Boxes.validate(v, all(v)), "reference takes nothing else");
    T.fails("ch02-types-and-input#3: varies needs a why", () -> Boxes.validate(v, all(v)), "every exemption says why");
  }
}
