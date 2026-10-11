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

/** DESIGN section 3's three-way proof of every check (Proofs, runtime/test/proofs.mjs): every worked solution must
 *  pass and every mistake must fail, judged by the page's own web/page/check.js on the browser runtime and on the
 *  pinned JDK. */
final class ProofGateTest {
  static final Path DIST = Fixtures.DIST;
  static final Map<String, Object> IS_EVEN = Map.of("kind", "method", "name", "isEven", "returns", "boolean",
      "params", List.of("int"), "cases", List.of(List.of("4", "true"), List.of("7", "false")));
  static final String EVEN = "boolean isEven(int n) {\n    return n % 2 == 0;\n}\n";
  static final String ODD = "boolean isEven(int n) {\n    return n % 2 == 1;\n}\n";

  /** One answer, as proofs.json carries it. */
  static Map<String, Object> answer(String label, String source, boolean right) {
    Map<String, Object> a = new LinkedHashMap<>();
    a.put("label", label);
    a.put("source", source);
    a.put("right", right);
    return a;
  }
  /** The published code's answer, as Proofs.of writes it for a starter box: wrong, and marked. */
  static Map<String, Object> published(String source) {
    Map<String, Object> a = answer("the published code", source, false);
    a.put("published", true);
    return a;
  }
  static Map<String, Object> proof(String id, Map<String, Object> check, List<Map<String, Object>> answers) {
    Map<String, Object> p = new LinkedHashMap<>();
    p.put("id", id);
    p.put("check", check);
    p.put("answers", answers);
    return p;
  }
  /** Runs the proof gate on these proofs, with the boxes' runtime the build's tests use. */
  static List<String> prove(String name, Object... proofs) throws Exception {
    Path f = Fixtures.TOOLS.resolve("build/.work/tests/" + name + ".json");
    Files.createDirectories(f.getParent());
    Files.writeString(f, Json.write(List.of(proofs)));
    return ForkGate.runProofs(Fixtures.TOOLS, f, DIST);
  }
  /** Gives chapter 1's first box, which states "Hello, <world> & café 😀", a predict check. */
  static void predictTheFirstBox(Path p) throws Exception {
    Path checks = p.resolve("volumes/vol-fixture/content/_checks.json");
    String s = Files.readString(checks);
    T.check(s.startsWith("{\n \"ch01-first-programs#4\""), "the fixture's checks start with chapter 1's output check: " + s);
    Files.writeString(checks, s.replace("{\n \"ch01-first-programs#4\"", "{\n \"ch01-first-programs#1\": {\"kind\": \"predict\"},\n \"ch01-first-programs#4\""));
  }

  /** The reviewer's probe (C1): chapter 1's page with a teaching box added above its exercise and no key changed, so
   *  every key for #4 (its check, its starter, its _solutions.md section) now lands on the new box, and the exercise is
   *  #5. With vary, the exercise's fence gains a comment, so it is no worked solution and the starter rule cannot see
   *  the shift: only the proof can. */
  static Path shifted(String name, boolean vary) throws Exception {
    Path p = Fixtures.project(name);
    Path ch1 = p.resolve("volumes/vol-fixture/content/ch01-first-programs.md");
    String s = Files.readString(ch1), exercise = "1. Make it print your name.\n\n```java\nvoid main() {\n";
    T.check(s.contains("\n### Try It\n") && s.contains(exercise), "the fixture's chapter 1 ends with its Try It exercise: " + s);
    s = s.replace("\n### Try It\n", "\nAnother program prints a name:\n\n```java\nvoid main() {\n    IO.println(\"Bo\");\n}\n```\n\n"
        + "```output\nBo\n```\n\n### Try It\n");
    if (vary) s = s.replace(exercise, exercise + "    // my name\n");
    Files.writeString(ch1, s);
    return p;
  }
  static List<String> labels(Object proof) {
    List<String> out = new ArrayList<>();
    for (Object a : (List<?>) ((Map<?, ?>) proof).get("answers")) out.add((String) ((Map<?, ?>) a).get("label"));
    return out;
  }

  static void testAStarterBoxIsProvedWithItsOwnFenceAndThePublishedCodeToo() throws Exception {
    // C1: a check is tied to the box it lands on. A box whose check has a starter publishes the starter, so its own
    // fence is the author's answer, which must pass, and the starter, the code the box publishes, must fail (a starter
    // that passes is an exercise with nothing to do). Neither counts toward the two worked solutions and a mistake. A
    // box whose check has no starter publishes its fence, which may be the exercise's wrong starting code (the
    // acceptance fixture's "Make it print Ada" box) or its answer, so the data cannot say which: it gets neither.
    Path p = Fixtures.project("proof-tie");
    Path checks = p.resolve("volumes/vol-fixture/content/_checks.json");
    Files.writeString(checks, Files.readString(checks).replace("\n}", ",\n \"ch02-types-and-input#1\": {\"kind\": \"input\", "
        + "\"runs\": [{\"typed\": [\"21\"], \"numbers\": [\"42\"]}]}\n}"));
    Path solutions = p.resolve("volumes/vol-fixture/content/_solutions.md");
    String ask = "```java\nvoid main() {\n    int n = Integer.parseInt(IO.readln(\"How many? \"));\n    IO.println(%s);\n}\n```\n\n";
    Files.writeString(solutions, Files.readString(solutions) + "\n## ch02-types-and-input#1\n\n" + ask.formatted("n * 2")
        + ask.formatted("n + n") + "### mistake\n\n" + ask.formatted("n"));
    Volume v = Volume.loadAll(p.resolve("volumes")).get(0);
    Map<Page, List<Box>> boxes = new LinkedHashMap<>();
    for (Page page : v.pages()) boxes.put(page, Boxes.of(v, page));
    List<String> problems = new ArrayList<>();
    List<Object> proofs = Proofs.of(v, boxes, problems, page -> true);
    T.eq(List.of(), problems, "the two extra answers count toward nothing the rule asks for");
    T.eq(3, proofs.size(), "three checks: " + proofs);
    T.eq(List.of("worked solution 1", "worked solution 2", "the box's own fence", "mistake 1", "mistake 2", "the published code"),
        labels(proofs.get(0)), "chapter 1's starter box: its worked solutions, its own fence, its mistakes, then the code it publishes");
    List<?> answers = (List<?>) ((Map<?, ?>) proofs.get(0)).get("answers");
    T.eq(answer("the box's own fence", "void main() {\n    IO.println(\"Ada\");\n}\n", true), answers.get(2), "the fence is right");
    T.eq(published("void main() {\n    IO.println(\"\");\n}\n"), answers.get(5), "the starter is wrong, and marked as the published code, which proofs.mjs's compile rule leaves out");
    T.eq("ch02-types-and-input#1", ((Map<?, ?>) proofs.get(1)).get("id"), "chapter 2's input check, which has no starter");
    T.eq(List.of("worked solution 1", "worked solution 2", "mistake 1"), labels(proofs.get(1)), "a box with no starter gets neither");
    T.eq(List.of("worked solution 1", "worked solution 2", "the box's own fence", "mistake 1", "the published code"),
        labels(proofs.get(2)), "chapter 2's method check has a starter too");
  }
  static void testAFenceAddedAboveAnExerciseFailsTheProofOfTheBoxItsCheckNowLandsOn() throws Exception {
    // The probe with the exercise's fence varied: the starter rule sees nothing, so the build reaches the proof, where
    // the new box #4, which the check, starter and solutions now land on, is held to its own fence: it prints Bo, not
    // Ada.
    var r = Fixtures.build(shifted("proof-shift", true), "--check", "--runtime", DIST.toString());
    T.eq(1, r.exit(), "the shifted keys fail --check: " + r.out());
    for (String where : List.of("on the browser runtime", "on the JDK"))
      T.check(r.out().contains("  !! ch01-first-programs#4: the box's own fence fails " + where + ", but it is right. Check said:\n"),
          "names the box the check landed on, and its fence, " + where + ": " + r.out());
    T.check(r.out().contains("2 checks, 11 answers judged, 2 wrong verdict(s)"), "and nothing else is wrong: " + r.out());
  }
  static void testAStarterThatAlreadyPassesItsCheckFails() throws Exception {
    // The starter prints Ada already; a blank line inside it keeps it from being a worked solution, so the starter rule
    // passes it and only the proof sees that a reader who changed nothing would pass.
    Path p = Fixtures.project("proof-starter-passes");
    Path checks = p.resolve("volumes/vol-fixture/content/_checks.json");
    String s = Files.readString(checks), starter = "\"starter\": \"void main() {\\n    IO.println(\\\"\\\");\\n}\\n\"";
    T.check(s.contains(starter), "the fixture's chapter 1 starter: " + s);
    Files.writeString(checks, s.replace(starter, "\"starter\": \"void main() {\\n    IO.println(\\\"Ada\\\");\\n\\n}\\n\""));
    var r = Fixtures.build(p, "--check", "--runtime", DIST.toString());
    T.eq(1, r.exit(), "a starter that passes fails --check: " + r.out());
    for (String where : List.of("on the browser runtime", "on the JDK"))
      T.check(r.out().contains("  !! ch01-first-programs#4: the published code passes " + where + ", but it is a mistake. Check said:\n    Correct."),
          where + ": " + r.out());
    T.check(r.out().contains("2 wrong verdict(s)"), "and nothing else: " + r.out());
  }

  static void testTheFixtureProvesEveryCheckOnBothRuntimes() throws Exception {
    // The fixture's two checks: chapter 1's output check (two worked solutions; two mistakes, one that does not
    // compile and one that is the starter itself) and chapter 2's method check on a double (two worked solutions, each
    // one unit in the last place from 0.15 for average(0.1, 0.2), and one mistake), each answer judged on both
    // runtimes; both have a starter, so each is also held to its own fence and its published code (C1): 6 and 5
    // answers.
    Path p = Fixtures.project("proof");
    var r = Fixtures.build(p, "--check", "--runtime", DIST.toString());
    T.eq(0, r.exit(), "full --check with the proof gate: " + r.out());
    T.check(r.out().contains("2 checks, 11 answers judged, 0 wrong verdict(s)"), r.out());
    // What the gate judged with is what the page carries: each proof's check is its box's data-check, as written.
    for (Object o : (List<?>) Json.parse(Files.readString(p.resolve("build/.work/proofs.json")))) {
      Map<?, ?> proof = (Map<?, ?>) o;
      String id = (String) proof.get("id");
      String attr = Json.compact(proof.get("check")).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
      String html = Files.readString(p.resolve("site/vol-fixture/" + id.substring(0, id.indexOf('#')) + ".html"));
      int at = html.indexOf("data-box=\"" + id + "\"");
      T.check(at >= 0 && html.substring(at, html.indexOf('>', at)).contains(" data-check=\"" + attr + "\""),
          id + "'s proof judged the check its box carries: " + attr);
    }
  }
  static void testEveryKindIsJudgedByThePagesOwnCodeOnBothRuntimes() throws Exception {
    String ask = "void main() {\n    int n = Integer.parseInt(IO.readln(\"Number: \"));\n    IO.println(%s);\n}\n";
    T.eq(List.of(), prove("proof-kinds",
        proof("m#1", IS_EVEN, List.of(
            answer("worked solution 1", EVEN, true),
            answer("worked solution 2", "boolean isEven(int n) {\n    if (n % 2 == 0) {\n        return true;\n    }\n    return false;\n}\n", true),
            answer("mistake 1", ODD, false))),
        proof("i#1", Map.of("kind", "input", "runs", List.of(Map.of("typed", List.of("5"), "numbers", List.of("10")))), List.of(
            answer("worked solution 1", ask.formatted("n * 2"), true),
            answer("worked solution 2", ask.formatted("\"Twice that is \" + (n + n)"), true),
            answer("mistake 1", ask.formatted("n + 2"), false))),
        proof("o#1", Map.of("kind", "output", "expected", "Ada\n"), List.of(
            answer("worked solution 1", "void main() {\n    IO.println(\"Ada\");\n}\n", true),
            answer("worked solution 2", "void main() {\n    String name = \"Ada\";\n    IO.println(name);\n}\n", true),
            answer("mistake 1", "void main() {\n    IO.println(\"ada\");\n}\n", false))),
        proof("p#1", Map.of("kind", "predict", "expected", "3\n5\n"), List.of(
            answer("the stated output", "3\n5\n", true),
            answer("right prediction 2", "3  \n5", true),
            answer("wrong prediction 1", "3\n4\n", false)))),
        "every worked solution passes and every mistake fails, on each runtime");
  }
  static void testAWrongVerdictNamesTheBoxTheAnswerTheRuntimeAndWhatCheckSaid() throws Exception {
    // A "worked solution" that is wrong and a "mistake" that is right: each is reported once per runtime, in the
    // order judged (each answer on the browser runtime, then on the JDK).
    var problems = prove("proof-wrong", proof("m#1", IS_EVEN, List.of(
        answer("worked solution 2", ODD, true), answer("mistake 1", EVEN, false))));
    T.eq(List.of(
        "m#1: worked solution 2 fails on the browser runtime, but it is right. Check said:\n"
            + "    wrong: isEven(4) returned false, expected true\n    wrong: isEven(7) returned true, expected false",
        "m#1: worked solution 2 fails on the JDK, but it is right. Check said:\n"
            + "    wrong: isEven(4) returned false, expected true\n    wrong: isEven(7) returned true, expected false",
        "m#1: mistake 1 passes on the browser runtime, but it is a mistake. Check said:\n"
            + "    right: isEven(4) -> true\n    right: isEven(7) -> false",
        "m#1: mistake 1 passes on the JDK, but it is a mistake. Check said:\n"
            + "    right: isEven(4) -> true\n    right: isEven(7) -> false"),
        problems, "each wrong verdict names the box, the answer, the runtime and what Check said");
  }
  static void testEachRuntimeIsJudgedApart() throws Exception {
    // The browser runtime leaves out the JDK's helpful NullPointerException message on purpose
    // (runtime/test/known-differences.json, F1-npe-catch-exception), so this program prints one line on the fork and
    // another on the JDK. As a right answer it fails on the JDK alone; as a mistake it passes on the fork alone. A
    // gate that ran one runtime and reported it for both could not give exactly these two.
    String npe = "void main() {\n    String s = null;\n    try {\n        IO.println(s.length());\n    } catch (Exception e) {\n        IO.println(\"caught: \" + e);\n    }\n}\n";
    var problems = prove("proof-apart", proof("o#1", Map.of("kind", "output", "expected", "caught: java.lang.NullPointerException\n"),
        List.of(answer("worked solution 1", npe, true), answer("mistake 1", npe, false))));
    T.eq(2, problems.size(), "one wrong verdict on each runtime: " + problems);
    T.check(problems.get(0).startsWith("o#1: worked solution 1 fails on the JDK, but it is right. Check said:\n"
        + "    Line 1 is: caught: java.lang.NullPointerException: Cannot invoke"), problems.get(0));
    T.check(problems.get(1).startsWith("o#1: mistake 1 passes on the browser runtime, but it is a mistake. Check said:\n    Correct."),
        problems.get(1));
  }
  static void testAPredictBoxsAnswersAreItsStatedOutputAndItsTextFences() throws Exception {
    Path p = Fixtures.project("proof-predict");
    predictTheFirstBox(p);
    Path solutions = p.resolve("volumes/vol-fixture/content/_solutions.md");
    Files.writeString(solutions, Files.readString(solutions) + """

        ## ch01-first-programs#1

        Trailing spaces are still right:

        ```text
        Hello, <world> & café 😀  \s
        ```

        ### mistake

        ```text
        Hello, world
        ```
        """);
    Volume v = Volume.loadAll(p.resolve("volumes")).get(0);
    Map<Page, List<Box>> boxes = new LinkedHashMap<>();
    for (Page page : v.pages()) boxes.put(page, Boxes.of(v, page));
    List<String> problems = new ArrayList<>();
    List<Object> proofs = Proofs.of(v, boxes, problems, page -> true);
    T.eq(List.of(), problems, "every checked box has its answers");
    T.eq(3, proofs.size(), "three checks: " + proofs);
    Map<?, ?> first = (Map<?, ?>) proofs.get(0);
    T.eq("ch01-first-programs#1", first.get("id"), "in page order");
    T.eq(Map.of("kind", "predict", "expected", "Hello, <world> & café 😀\n"), first.get("check"), "the check its data-check carries");
    T.eq(List.of(answer("the stated output", "Hello, <world> & café 😀\n", true),
        answer("right prediction 2", "Hello, <world> & café 😀   \n", true),
        answer("wrong prediction 1", "Hello, world\n", false)), first.get("answers"), "the stated output, then each text fence");
    Path f = Fixtures.TOOLS.resolve("build/.work/tests/proof-predict.json");
    Files.writeString(f, Json.write(List.of(first)));
    T.eq(List.of(), ForkGate.runProofs(Fixtures.TOOLS, f, DIST), "each prediction is judged by the page's predictVerdict");
  }
  static void testACheckedBoxWithoutItsAnswersFailsSayingWhichIsMissing() throws Exception {
    // Chapter 1's output check keeps one worked solution and no mistake; chapter 2's method check keeps both worked
    // solutions and no mistake; chapter 1's first box gets a predict check with nothing but its stated output. The
    // rule needs no runtime, so it holds even when the build's own tests skip the gates that run under Node.
    Path p = Fixtures.project("proof-missing");
    predictTheFirstBox(p);
    Files.writeString(p.resolve("volumes/vol-fixture/content/_solutions.md"), """
        ## ch01-first-programs#4

        ```java
        void main() {
            IO.println("Ada");
        }
        ```

        ## ch02-types-and-input#4

        ```java
        double average(double a, double b) {
            return (a + b) / 2;
        }

        void main() {
            IO.println(average(2, 3));
        }
        ```

        ```java
        double average(double a, double b) {
            return a / 2 + b / 2;
        }

        void main() {
            IO.println(average(1, 4));
        }
        ```
        """);
    var r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests");
    T.eq(1, r.exit(), "exit: " + r.out());
    for (String line : List.of(
        "ch01-first-programs#1: its predict check needs a right prediction besides its stated output: a text fence under \"## ch01-first-programs#1\" in _solutions.md",
        "ch01-first-programs#1: its predict check needs a wrong prediction: a text fence under \"### mistake\" in _solutions.md",
        "ch01-first-programs#4: its check needs two worked solutions in _solutions.md, the second in another style; it has 1",
        "ch01-first-programs#4: its check needs a realistic mistake: a java fence under \"### mistake\" in _solutions.md",
        "ch02-types-and-input#4: its check needs a realistic mistake: a java fence under \"### mistake\" in _solutions.md"))
      T.check(r.out().contains("  !! " + line + "\n"), "says what is missing: " + line + " in: " + r.out());
    T.check(r.out().contains(", 5 problem(s)"), "and nothing else: " + r.out());
    T.check(!Files.exists(p.resolve("build/.work/proofs.json")) && !r.out().contains("answers judged"),
        "the proof itself runs only with the gates that run under Node: " + r.out());
  }
  static void testAnExpectedInfinityIsMetOnlyByItselfOnBothRuntimes() throws Exception {
    // The method harness's tolerance, 1e-9 × max(1, |expected|), is infinite for an expected infinity, and would pass
    // any answer but NaN: it applies to a finite expected value only. web/test/check.mjs shows it on the browser runtime;
    // here the page's own check.js judges it on each.
    Map<String, Object> big = Map.of("kind", "method", "name", "big", "returns", "double", "params", List.of("double"),
        "cases", List.of(List.of("1", "Double.POSITIVE_INFINITY")));
    String f = "double big(double x) {\n    return %s;\n}\n";
    T.eq(List.of(), prove("proof-infinity", proof("m#1", big, List.of(
            answer("worked solution 1", f.formatted("1.0 / 0"), true),
            answer("worked solution 2", f.formatted("Double.POSITIVE_INFINITY"), true),
            answer("mistake 1", f.formatted("5"), false),
            answer("mistake 2", f.formatted("Double.NEGATIVE_INFINITY"), false)))),
        "an expected infinity passes itself alone, on each runtime");
  }
  static void testABoxWhoseMistakesAllFailToCompileFails() throws Exception {
    // A mistake that fails to compile, or that changes the method's signature, proves only that Check reports it: it
    // never reaches the check's cases. With one case, 4 -> true, m#1's check passes `return true;`, and no such mistake
    // could show it. So a checked box needs a mistake that compiles: m#1 and o#1 have none and are reported, once each
    // whatever their number of mistakes and runtimes; m#2, with one that compiles beside one that does not, is not.
    // o#1's published code compiles and fails, as a starter's must, but it is no mistake the author chose (Proofs), so
    // it does not count as the one that compiles.
    String noSemicolon = "boolean isEven(int n) {\n    return n % 2 == 0\n}\n";
    Map<String, Object> weak = Map.of("kind", "method", "name", "isEven", "returns", "boolean", "params", List.of("int"),
        "cases", List.of(List.of("4", "true")));
    var problems = prove("proof-uncompiled",
        proof("m#1", weak, List.of(
            answer("worked solution 1", EVEN, true),
            answer("worked solution 2", "boolean isEven(int n) {\n    return n % 2 != 1;\n}\n", true),
            answer("mistake 1", noSemicolon, false),
            answer("mistake 2", "boolean isEven(String n) {\n    return true;\n}\n", false))),
        proof("o#1", Map.of("kind", "output", "expected", "Ada\n"), List.of(
            answer("worked solution 1", "void main() {\n    IO.println(\"Ada\");\n}\n", true),
            answer("worked solution 2", "void main() {\n    IO.print(\"Ada\\n\");\n}\n", true),
            answer("mistake 1", "void main() {\n    IO.println(\"Ada\")\n}\n", false),
            published("void main() {\n    IO.println(\"\");\n}\n"))),
        proof("m#2", IS_EVEN, List.of(
            answer("worked solution 1", EVEN, true),
            answer("mistake 1", noSemicolon, false),
            answer("mistake 2", ODD, false))));
    T.eq(List.of(
        "m#1: every mistake fails to compile, so none tries the check's cases: add a mistake that compiles and gives a wrong answer",
        "o#1: every mistake fails to compile, so none tries the check's cases: add a mistake that compiles and gives a wrong answer"),
        problems, "a box whose every mistake stops at the compiler is reported, once");
  }
  static void testAnEmptyProofListIsAFailure() throws Exception {
    T.check(!prove("proof-empty").isEmpty(), "zero proofs is not a pass (Build.java never sends an empty list)");
  }
  // --only holds the named pages' checks alone to the answers a proof needs (and proves them alone, which
  // ForkGateTest's --only test counts). Chapter 1's check keeps one worked solution and no mistake here, so --only ch02
  // passes only if chapter 1's check is truly left out, and --only ch01 fails only if it is truly held. The rule needs
  // no runtime, as in testACheckedBoxWithoutItsAnswersFailsSayingWhichIsMissing.
  static void testTheOnlyFlagHoldsTheNamedPagesChecksAlone() throws Exception {
    Path p = Fixtures.project("proof-only");
    Path f = p.resolve("volumes/vol-fixture/content/_solutions.md");
    String s = Files.readString(f);
    int ch2 = s.indexOf("## ch02-types-and-input#4\n");
    T.check(s.startsWith("## ch01-first-programs#4\n") && ch2 > 0, "the fixture's chapter 1 section comes first, then chapter 2's: " + s);
    Files.writeString(f, "## ch01-first-programs#4\n\n```java\nvoid main() {\n    IO.println(\"Ada\");\n}\n```\n\n" + s.substring(ch2));
    var two = Fixtures.build(p, "--check", "--no-fork-gate-for-tests", "--only", "ch02");
    T.eq(0, two.exit(), "--only ch02 leaves chapter 1's check alone: " + two.out());
    var one = Fixtures.build(p, "--check", "--no-fork-gate-for-tests", "--only", "ch01");
    T.eq(1, one.exit(), "--only ch01 holds chapter 1's check: " + one.out());
    for (String line : List.of(
        "ch01-first-programs#4: its check needs two worked solutions in _solutions.md, the second in another style; it has 1",
        "ch01-first-programs#4: its check needs a realistic mistake: a java fence under \"### mistake\" in _solutions.md"))
      T.check(one.out().contains("  !! " + line + "\n"), "says what is missing: " + line + " in: " + one.out());
  }
}
