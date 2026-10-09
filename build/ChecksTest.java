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

final class ChecksTest {
  static Map<Page, List<Box>> all(Volume v) throws Exception {
    var m = new LinkedHashMap<Page, List<Box>>();
    for (Page p : v.pages()) m.put(p, Boxes.of(v, p));
    return m;
  }
  static void write(Path p, String rel, String text) throws Exception { Files.writeString(p.resolve("volumes/vol-fixture/" + rel), text); }
  static String page(Path p, String slug) throws Exception { return Files.readString(p.resolve("site/vol-fixture/" + slug + ".html")); }
  static final String IS_EVEN_BOX = "\n```java\nboolean isEven(int n) {\n    return false;\n}\n\nvoid main() {\n    IO.println(isEven(4));\n}\n```\n";

  static void testEveryRuleSpeaksInItsOwnWords() throws Exception {
    Path p = Fixtures.project("checks-bad");
    write(p, "content/_checks.json", """
        {"ch01-first-programs#9": {"kind": "output", "expected": "x"},
         "ch01-first-programs#3": {"kind": "output", "expected": "x"},
         "ch01-first-programs#1": {"kind": "quiz"},
         "ch01-first-programs#2": "output",
         "ch02-types-and-input#2": {"kind": 3},
         "ch01-first-programs#4": {"kind": "method", "name": "isEven", "returns": "boolean", "params": ["int"], "cases": [["4"]], "answer": "x"},
         "ch02-types-and-input#1": {"kind": "input", "runs": [{"typed": ["21"]}]},
         "ch02-types-and-input#3": {"kind": "predict"},
         "ch02-types-and-input-practice#1": {"kind": "method", "name": "doubled", "returns": "void", "params": [], "cases": [["", "0"]]}}
        """);
    Volume v = Volume.loadAll(p.resolve("volumes")).get(0);
    for (String line : List.of(
        "ch01-first-programs#9: check for no such box",
        "ch01-first-programs#3: check on a reference box",
        "ch01-first-programs#1: unknown check kind \"quiz\" (method, input, output or predict)",
        "ch01-first-programs#2: _checks.json entry must be an object with a string \"kind\"",
        "ch02-types-and-input#2: _checks.json entry must be an object with a string \"kind\"",
        "ch01-first-programs#4: unknown key \"answer\" in a method check",
        "ch01-first-programs#4: case 1 must be [\"<arguments>\", \"<expected>\"]",
        "ch02-types-and-input#1: run 1 needs \"typed\" and at least one of \"numbers\", \"words\" or \"contains\"",
        "ch02-types-and-input#3: a predict box cannot be varies, raises, compileError or stdin",
        "ch02-types-and-input-practice#1: a method check's \"returns\" cannot be void"))
      T.fails(line, () -> Boxes.validate(v, all(v)), line);
  }
  static void testTheRulesTheFirstTestLeavesOutSpeakInTheirOwnWordsToo() throws Exception {
    // The brief's rules with exact words that testEveryRuleSpeaksInItsOwnWords does not reach, each on a box
    // it can apply to: a rule dropped from Checks.problems lets a check through that the page cannot run.
    Path p = Fixtures.project("checks-bad-more");
    write(p, "content/_checks.json", """
        {"ch01-first-programs#1": {"kind": "method", "name": "class", "returns": "int", "params": [1], "cases": []},
         "ch01-first-programs#2": {"kind": "method", "name": "f"},
         "ch01-first-programs#4": {"kind": "output", "starter": 3},
         "ch02-types-and-input#1": {"kind": "input", "runs": [{"typed": ["21"], "numbers": ["42", "4e1"], "answer": "x"}, {"typed": [21], "words": ["many", 2], "contains": 42}]},
         "ch02-types-and-input#2": {"kind": "input"},
         "ch02-types-and-input-practice#1": {"kind": "predict"},
         "ch02-types-and-input-practice#3": {"kind": "predict", "starter": "x"}}
        """);
    Volume v = Volume.loadAll(p.resolve("volumes")).get(0);
    for (String line : List.of(
        "ch01-first-programs#1: \"name\" is not a Java method name",
        "ch01-first-programs#1: \"params\" must be a list of types",
        "ch01-first-programs#1: \"cases\" must be a list of at least one case",
        "ch01-first-programs#2: a method check needs \"name\", \"returns\", \"params\" and \"cases\"",
        "ch01-first-programs#4: an output check needs \"expected\"",
        "ch01-first-programs#4: \"starter\" must be a string",
        "ch02-types-and-input#1: run 1's \"numbers\" must be numbers written as text",
        "ch02-types-and-input#1: unknown key \"answer\" in run 1",
        "ch02-types-and-input#1: run 2's \"typed\" must be a list of strings",
        "ch02-types-and-input#1: run 2's \"words\" must be a list of strings",
        "ch02-types-and-input#1: run 2's \"contains\" must be a string",
        "ch02-types-and-input#2: an input check needs \"runs\"",
        "ch02-types-and-input-practice#1: a predict box needs a stated output",
        "ch02-types-and-input-practice#3: unknown key \"starter\" in a predict check"))
      T.fails(line, () -> Boxes.validate(v, all(v)), line);
  }
  static void testAPinnedWordThePageCannotFindFailsTheBuild() throws Exception {
    // Ruling 36 (C-3): check.js's inputVerdict lowercases a run's output and splits it at every character that
    // is not a letter or digit, so a pinned word with a space or punctuation in it can never match any piece and
    // fails every answer, the right one included. "İ" lowercases to i and a combining dot, which splits too. The
    // fourth run's words (a capital, a non-ASCII letter, digits) are each one piece, and pass the rule.
    Path p = Fixtures.project("checks-words");
    write(p, "content/_checks.json", """
        {"ch01-first-programs#4": {"kind": "output", "expected": "Ada\\n", "starter": "void main() {\\n    IO.println(\\"\\");\\n}\\n"},
         "ch02-types-and-input#1": {"kind": "input", "runs": [{"typed": ["21"], "words": ["New York"]}, {"typed": ["21"], "words": ["many", "can't"]}, {"typed": ["21"], "words": ["İstanbul"]}, {"typed": ["21"], "words": ["Many", "café", "42"]}]}}
        """);
    Volume v = Volume.loadAll(p.resolve("volumes")).get(0);
    List<String> problems = Checks.problems(v, all(v));
    for (int n = 1; n <= 3; n++)
      T.check(problems.contains("ch02-types-and-input#1: run " + n + "'s \"words\" must each be one word of letters or digits, with no space or punctuation"),
          "run " + n + "'s word is refused in its own words: " + problems);
    T.eq(3, problems.size(), "and nothing else is refused, run 4's words included: " + problems);
  }
  static void testAnInputCheckRidesInItsBoxAsThePageReadsIt() throws Exception {
    Path p = Fixtures.project("checks-input");
    write(p, "content/_checks.json", """
        {"ch01-first-programs#4": {"kind": "output", "expected": "Ada\\n", "starter": "void main() {\\n    IO.println(\\"\\");\\n}\\n"},
         "ch02-types-and-input#1": {"kind": "input", "runs": [{"typed": ["21"], "numbers": ["42"], "words": ["many"], "contains": "42"}]}}
        """);
    T.eq(0, Fixtures.build(p).exit(), "build");
    T.check(page(p, "ch02-types-and-input").contains("data-check=\"{&quot;kind&quot;:&quot;input&quot;,&quot;runs&quot;:[{&quot;typed&quot;:[&quot;21&quot;],&quot;numbers&quot;:[&quot;42&quot;],&quot;words&quot;:[&quot;many&quot;],&quot;contains&quot;:&quot;42&quot;}]}\""),
        "the runs ride in their box as check.js reads them");
  }
  static void testACheckWithAStarterPublishesTheStarterNeverTheAnswer() throws Exception {
    Path p = Fixtures.project("checks-starter");
    T.eq(0, Fixtures.build(p).exit(), "build");
    String ch1 = page(p, "ch01-first-programs");
    T.check(ch1.contains("data-check=\"{&quot;kind&quot;:&quot;output&quot;,&quot;expected&quot;:&quot;Ada\\n&quot;}\""), "the output check rides in its box: " + ch1);
    T.check(ch1.contains("<textarea class=\"code\" wrap=\"off\" spellcheck=\"false\">void main() {\n    IO.println(&quot;&quot;);\n}\n</textarea>"), "the textarea holds the starter");
    T.check(!ch1.contains("IO.println(&quot;Ada&quot;)"), "the author's answer is not on the page");
    String boxes = Files.readString(p.resolve("site/boxes.json"));
    T.check(!boxes.contains("IO.println(\\\"Ada\\\")"), "nor in boxes.json");
    T.check(!Files.exists(p.resolve("site/vol-fixture/bundle/ch01/ch01_04.java")), "nor in the bundle");
    T.check(!ch1.contains("starter"), "the starter field itself is not published");
  }
  /** The fixture's starter box #4 with a stated output fence of its own (the fixture's #4 has none): the
   *  output its author's fence, `IO.println("Ada")`, prints. */
  static Path starterBoxStating(String name, String output) throws Exception {
    Path p = Fixtures.project(name);
    Path ch1 = p.resolve("volumes/vol-fixture/content/ch01-first-programs.md");
    Files.writeString(ch1, Files.readString(ch1) + "\n```output\n" + output + "\n```\n");
    return p;
  }
  static Map<?, ?> boxesJsonEntry(Path p, String id) throws Exception {
    for (Object o : (List<?>) Json.parse(Files.readString(p.resolve("site/boxes.json"))))
      if (((Map<?, ?>) o).get("id").equals(id)) return (Map<?, ?>) o;
    throw new AssertionError("no boxes.json entry for " + id);
  }
  static void testAStarterBoxPublishesNothingOfItsAuthorsFence() throws Exception {
    // Ruling 18: a box whose check declares a starter publishes the starter and nothing that belongs to the
    // author's fence. The starter does not print the author's stated output, raise the author's exception or
    // read the author's typed answers, so a page that showed that output under the starter would state an
    // output the code does not print (DESIGN.md's first promise), and a boxes.json that paired the starter
    // with the author's expected output and stdin would have web/test/replay.mjs run the starter against
    // answers it has nothing to do with. #4 declares every fence-describing field here, so each one's
    // "nothing declared" value in boxes.json is proof it was withheld, not merely absent.
    Path p = starterBoxStating("checks-starter-fence", "Ada");
    Path boxesJson = p.resolve("volumes/vol-fixture/content/_boxes.json");
    String decl = "\"ch01-first-programs#4\": {\"raises\": \"java.lang.IllegalStateException\", \"varies\": true, \"stdin\": [\"Grace\"], \"why\": \"The author's own run.\"},";
    Files.writeString(boxesJson, Files.readString(boxesJson).replace("\"ch01-first-programs#3\": {\"reference\": true},", "\"ch01-first-programs#3\": {\"reference\": true},\n " + decl));
    var r = Fixtures.build(p);
    T.eq(0, r.exit(), "build: " + r.out());
    String html = page(p, "ch01-first-programs");
    int at = html.indexOf("data-box=\"ch01-first-programs#4\"");
    String box = html.substring(at, html.indexOf("</div>", at));
    T.check(!box.contains("<pre class=\"output\">"), "the starter box states no output, since the starter does not print the author's: " + box);
    T.check(box.contains("data-kind=\"run\""), "its data-kind describes the starter, not the author's raising fence: " + box);
    Map<?, ?> e = boxesJsonEntry(p, "ch01-first-programs#4");
    T.eq("void main() {\n    IO.println(\"\");\n}\n", e.get("source"), "boxes.json's source is the starter");
    T.check(e.containsKey("expected") && e.get("expected") == null, "no expected output for the starter: " + e);
    T.eq(List.of(), e.get("stdin"), "no typed answers for the starter");
    T.check(e.containsKey("raises") && e.get("raises") == null, "no raises for the starter: " + e);
    T.check(e.containsKey("compileError") && e.get("compileError") == null, "no compileError for the starter: " + e);
    T.eq(false, e.get("varies"), "varies is false for the starter");
    // Its why explains the author's fence (here, why it raises), so it is withheld too (Ruling 36): no note on
    // the page, and null in boxes.json.
    try (var files = Files.walk(p.resolve("site"))) {
      for (Path f : files.filter(Files::isRegularFile).toList())
        T.check(!new String(Files.readAllBytes(f), java.nio.charset.StandardCharsets.UTF_8).contains("The author's own run."),
            "the starter box's why is nowhere on the site, but " + p.relativize(f) + " holds it");
    }
    T.check(e.containsKey("why") && e.get("why") == null, "boxes.json's why is null for the starter: " + e);
    // A box without a starter keeps everything its fence declares, on the page and in boxes.json.
    int at2 = html.indexOf("data-box=\"ch01-first-programs#2\"");
    String box2 = html.substring(at2, html.indexOf("</div>", at2));
    T.check(box2.contains("data-kind=\"raises\"") && box2.contains("<pre class=\"output\">Exception in thread &quot;main&quot; java.lang.ArrayIndexOutOfBoundsException"), "a plain box keeps its kind and stated output: " + box2);
    Map<?, ?> e2 = boxesJsonEntry(p, "ch01-first-programs#2");
    T.eq("java.lang.ArrayIndexOutOfBoundsException", e2.get("raises"), "a plain box keeps its raises");
    T.eq("Index 3 is one past the end.", e2.get("why"), "and its why");
    T.check(html.contains("<p class=\"note\">Index 3 is one past the end.</p><div class=\"box\" id=\"ch01-first-programs#2\""), "its why is the note above it: " + html);
    T.check(String.valueOf(e2.get("expected")).startsWith("Exception in thread \"main\" java.lang.ArrayIndexOutOfBoundsException"), "a plain box keeps its expected: " + e2);
    Map<?, ?> e3 = boxesJsonEntry(p, "ch02-types-and-input#1");
    T.eq(List.of("21"), e3.get("stdin"), "a plain input box keeps its stdin");
    T.check(e3.get("expected") != null, "and its expected: " + e3);
    T.check(page(p, "ch02-types-and-input").contains("data-kind=\"input\""), "and its kind");
  }
  static void testTheAuditStillHoldsAStarterBoxsAuthorFenceToItsStatedOutput() throws Exception {
    // What a starter box publishes changed; what the build checks did not. The audit still runs the author's
    // own fence and compares it with the stated output, which it never publishes: the right output passes
    // and is counted as compared (4, where the fixture alone has 3), and a wrong one fails as before.
    var ok = Fixtures.build(starterBoxStating("checks-starter-audit-ok", "Ada"), "--check", "--no-fork-gate-for-tests");
    T.eq(0, ok.exit(), "the author's fence prints its stated output: " + ok.out());
    T.check(ok.out().contains("4 stated outputs compared, 0 problem(s)"), "#4's stated output is compared: " + ok.out());
    var bad = Fixtures.build(starterBoxStating("checks-starter-audit-bad", "Bob"), "--check", "--no-fork-gate-for-tests");
    T.eq(1, bad.exit(), "a stated output the author's fence does not print fails --check: " + bad.out());
    T.check(bad.out().contains("ch01-first-programs#4: states an output the code does not print"), bad.out());
  }
  static void testAMethodCheckShowsWhatItShouldDo() throws Exception {
    Path p = Fixtures.project("checks-method");
    Path ch1 = p.resolve("volumes/vol-fixture/content/ch01-first-programs.md");
    Files.writeString(ch1, Files.readString(ch1) + "\nWrite `isEven`:\n" + IS_EVEN_BOX);
    write(p, "content/_checks.json", """
        {"ch01-first-programs#4": {"kind": "output", "expected": "Ada\\n", "starter": "void main() {\\n    IO.println(\\"\\");\\n}\\n"},
         "ch01-first-programs#5": {"kind": "method", "name": "isEven", "returns": "boolean", "params": ["int"], "cases": [["4", "true"], ["7", "false"]]}}
        """);
    T.eq(0, Fixtures.build(p).exit(), "build");
    String html = page(p, "ch01-first-programs");
    T.check(html.contains("<div class=\"cases\"><p>What it should do:</p><ul><li><code>isEven(4) -&gt; true</code></li><li><code>isEven(7) -&gt; false</code></li></ul></div>"), "the cases list: " + html);
    T.check(html.contains("&quot;cases&quot;:[[&quot;4&quot;,&quot;true&quot;],[&quot;7&quot;,&quot;false&quot;]]"), "the cases ride in data-check");
  }
  static void testAPredictBoxKeepsItsAnswerInItsOwnBox() throws Exception {
    Path p = Fixtures.project("checks-predict");
    write(p, "content/_checks.json", """
        {"ch01-first-programs#1": {"kind": "predict"},
         "ch01-first-programs#4": {"kind": "output", "expected": "Ada\\n", "starter": "void main() {\\n    IO.println(\\"\\");\\n}\\n"}}
        """);
    T.eq(0, Fixtures.build(p).exit(), "build");
    String html = page(p, "ch01-first-programs");
    int at = html.indexOf("data-box=\"ch01-first-programs#1\"");
    String box = html.substring(at, html.indexOf("</div>", at));
    T.check(box.contains("data-kind=\"predict\"") && box.contains("<pre class=\"predict-code\">"), "a predict box: " + box);
    T.check(!box.contains("<pre class=\"output\">"), "its answer is not shown before the reader predicts");
    T.check(box.contains("&quot;expected&quot;:&quot;Hello, &lt;world&gt; &amp; café 😀\\n&quot;"), "its answer rides in its own data-check");
    // The entry is read parsed: its "source" comes before "expected" and holds the box's own braces, so a
    // text slice up to the first "}" would end inside the source and never reach "expected".
    Map<?, ?> entry = null;
    for (Object o : (List<?>) Json.parse(Files.readString(p.resolve("site/boxes.json"))))
      if (((Map<?, ?>) o).get("id").equals("ch01-first-programs#1")) entry = (Map<?, ?>) o;
    T.check(entry != null && entry.containsKey("expected") && entry.get("expected") == null, "boxes.json does not carry the predict answer: " + entry);
  }
  static void testNoFileButItsOwnPageHoldsAPredictAnswer() throws Exception {
    // D37: a predict answer travels only inside its own box. The box above prints a string literal, so its
    // answer is readable in its own source wherever the source is published; this box computes its answer, so
    // any file that holds it anywhere but inside the box's data-check leaks it. bundle.html once listed the
    // first line of every box's stated output, predict boxes included: one page holding every predict answer.
    Path p = Fixtures.project("checks-predict-leak");
    Path ch1 = p.resolve("volumes/vol-fixture/content/ch01-first-programs.md");
    Files.writeString(ch1, Files.readString(ch1) + "\nPredict this one:\n\n```java\nvoid main() {\n    IO.println(\"<\" + \"tick\".toUpperCase() + \"> & \" + 3 * 7);\n}\n```\n\n```output\n<TICK> & 21\n```\n");
    write(p, "content/_checks.json", """
        {"ch01-first-programs#5": {"kind": "predict"},
         "ch01-first-programs#4": {"kind": "output", "expected": "Ada\\n", "starter": "void main() {\\n    IO.println(\\"\\");\\n}\\n"}}
        """);
    var r = Fixtures.build(p);
    T.eq(0, r.exit(), "build: " + r.out());
    List<String> forms = List.of("<TICK> & 21", "&lt;TICK&gt; &amp; 21");  // raw (and JSON-escaped, which is the same here), HTML-escaped
    Path site = p.resolve("site"), own = site.resolve("vol-fixture/ch01-first-programs.html");
    int files = 0;
    try (var s = Files.walk(site)) {
      for (Path f : s.filter(Files::isRegularFile).toList()) {
        files++;
        String text = new String(Files.readAllBytes(f), java.nio.charset.StandardCharsets.UTF_8);
        for (String form : forms) {
          if (!f.equals(own)) { T.check(!text.contains(form), site.relativize(f) + " holds the predict answer " + form); continue; }
          int at = text.indexOf(form), box = text.indexOf("data-box=\"ch01-first-programs#5\"");
          T.check(at < 0 || (text.lastIndexOf(form) == at && box >= 0 && at > box && at < text.indexOf("</div>", box)),
              "its own page holds the answer " + form + " only inside the box");
        }
      }
    }
    T.check(files > 3 && Files.exists(site.resolve("vol-fixture/bundle.html")), "the walk saw the whole site, bundle.html included: " + files);
    T.check(own.toFile().exists() && Files.readString(own).contains("&lt;TICK&gt; &amp; 21\\n"), "the answer does ride in its own box");
  }
  static void testAPageThatWouldShowItsWorkedSolutionFails() throws Exception {
    Path p = Fixtures.project("checks-solution");
    write(p, "content/_checks.json", """
        {"ch01-first-programs#4": {"kind": "output", "expected": "Ada\\n"}}
        """);
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "exit");
    T.check(r.out().contains("ch01-first-programs#4: the page would publish the worked solution; give its check a \"starter\""), r.out());
  }
  static void testAStarterThatIsTheWorkedSolutionFails() throws Exception {
    // D40(b), Ruling 19: the rule holds the code a box publishes, its starter when it has one, against its own
    // _solutions.md section. A starter that is the answer publishes the answer as surely as the fence would.
    Path p = Fixtures.project("checks-solution-starter");
    write(p, "content/_checks.json", """
        {"ch01-first-programs#4": {"kind": "output", "expected": "Ada\\n", "starter": "void main() {\\n    IO.println(\\"Ada\\");\\n}\\n"}}
        """);
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "exit: " + r.out());
    T.check(r.out().contains("ch01-first-programs#4: the page would publish the worked solution; give its check a \"starter\""), r.out());
  }
  static void testABoxWithNoCheckThatIsItsWorkedSolutionFails() throws Exception {
    // Ruling 19: every box, not only a checked one. #1 has no check and publishes its own fence, which is here also
    // the fence of its own _solutions.md section: the page would show the worked solution.
    Path p = Fixtures.project("checks-solution-nocheck");
    Path solutions = p.resolve("volumes/vol-fixture/content/_solutions.md");
    Files.writeString(solutions, Files.readString(solutions)
        + "\n## ch01-first-programs#1\n\n```java\nvoid main() {\n    IO.println(\"Hello, <world> & café 😀\");\n}\n```\n");
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "exit: " + r.out());
    T.check(r.out().contains("ch01-first-programs#1: the page would publish the worked solution; give its check a \"starter\""), r.out());
    T.check(!r.out().contains("ch01-first-programs#4: the page would publish"), "the starter box beside it is not refused: " + r.out());
  }
}
