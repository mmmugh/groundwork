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

/** DESIGN section 6's "every 'what does this print' answer verified on the real JDK", on the fixture's chapter 1 quiz (a
 *  statement snippet whose output has a blank line, a whole program whose code has one) and its key. */
final class QuizzesTest {
  static final String QUIZ = "volumes/vol-fixture/quizzes/ch01-quiz.txt";
  static final String KEY = "volumes/vol-fixture/answer-keys/ch01-answers.txt";

  /** The quiz gate alone on a fixture project's volume: no site is built and no other gate runs. */
  static Quizzes.Checked check(Path p) throws Exception {
    return Quizzes.check(Volume.loadAll(p.resolve("volumes")).get(0));
  }

  // A key carries a program's output, so it must give back exactly what was printed: the rest of the "ANSWER: " line with
  // its own leading spaces (a right-aligned number starts with spaces), each further line with exactly its 10-space indent
  // removed, and a blank output line whether or not an editor kept its 10 spaces. The code above it loses exactly its
  // 8-space indent and keeps the blank line inside it. In a quiz the place to write ends the code, and there is no answer.
  static void testAKeyGivesBackTheCodeAndTheAnswerExactlyAsWritten() {
    String key = String.join("\n",
        " 4. What does this print?",
        "",
        "        int n = 7;",
        "",
        "        IO.println(\"  \" + n);",
        "        IO.println(\"    \" + (n + 1));",
        "        IO.println();",
        "        IO.println();",
        "        IO.println(\"end\");",
        "",
        "      ANSWER:   7",
        "              8",
        "          ",
        "",
        "          end",
        "",
        " 5. Why does a program need main?",
        "");
    List<String> problems = new ArrayList<>();
    var answered = Quizzes.printQuestions("key", key, problems);
    T.eq(List.of(), problems, "a well-formed key raises nothing");
    T.eq(Set.of(4), answered.keySet(), "question 4 is the one print question; question 5 is not one");
    T.eq("int n = 7;\n\nIO.println(\"  \" + n);\nIO.println(\"    \" + (n + 1));\nIO.println();\nIO.println();\nIO.println(\"end\");",
        answered.get(4).code(), "8 spaces off each code line, the blank line inside kept");
    T.eq(1, answered.get(4).answers().size(), "one ANSWER: line");
    T.eq("  7\n    8\n\n\nend", Audit.tidy(answered.get(4).answers().get(0)),
        "the first line's own spaces kept, 10 off each further line, both blank lines kept");
    String quiz = String.join("\n", " 4. What does this print?", "", "        IO.println(1);", "", "    " + "_".repeat(36), "");
    var asked = Quizzes.printQuestions("quiz", quiz, problems);
    T.eq("IO.println(1);", asked.get(4).code(), "the place to write ends the code");
    T.eq(List.of(), asked.get(4).answers(), "and a quiz holds no answer");
  }

  // A question's code is statements, run as main's body, or a whole compact source file with its own void main, run as
  // written: the two forms a quiz writes, and the only two the build runs.
  static void testAStatementSnippetRunsAsMainsBodyAndAWholeProgramAsWritten() {
    T.eq("void main() {\n    int n = 7;\n\n    IO.println(n);\n}\n", Quizzes.program("int n = 7;\n\nIO.println(n);"),
        "statements become main's body, indented 4, the blank line left blank");
    String whole = "int twice(int n) {\n    return n * 2;\n}\n\nvoid main() {\n    IO.println(twice(4));\n}";
    T.eq(whole + "\n", Quizzes.program(whole), "code with its own void main runs as written");
  }

  // Both of the fixture's print questions must run and agree with the key. The count matters as much as the silence: a
  // gate that found no question would report no problem either.
  static void testTheFixturesQuizRunsBothQuestionsAndAgreesWithItsKey() throws Exception {
    var r = check(Fixtures.project("quiz"));
    T.eq(List.of(), r.problems(), "the fixture's quiz agrees with its key");
    T.eq(2, r.questions(), "both print questions ran");
  }

  // An answer is compared as a stated output is (Audit.tidy): CRLF line ends and trailing spaces an editor leaves in the
  // key do not fail a right answer, and a change inside a line does.
  static void testAnAnswerIsComparedAfterTheStatedOutputTidying() throws Exception {
    Path p = Fixtures.project("quiz-tidy");
    Path key = p.resolve(KEY);
    Files.writeString(key, Files.readString(key).replace("          there\n", "          there   \n").replace("\n", "\r\n"));
    T.eq(List.of(), check(p).problems(), "CRLF and trailing spaces in the key are tidied away");
    Files.writeString(key, Files.readString(key).replace("there   ", "the re"));
    T.check(check(p).problems().stream().anyMatch(s -> s.contains("question 2: its key's answer is not what the code prints")),
        "a space inside a line is a difference");
  }

  // Each rule, broken once on the fixture. "where" says which file the edit goes to: the quiz, the key, or both (a change
  // to the code itself, which the key repeats).
  static void testEachQuizRuleFailsWhenBroken() throws Exception {
    record Break(String where, String from, String to, String expect) {}
    var breaks = List.of(
      new Break("key", "ANSWER: 0", "ANSWER: 1", "quizzes/ch01-quiz.txt question 3: its key's answer is not what the code prints"),
      new Break("key", "ANSWER: Hi\n\n          there", "ANSWER: Hi\n          there", "question 2: its key's answer is not what the code prints"),
      new Break("both", "IO.println(a[0]);", "IO.println(a[0])", "question 3: fails to compile"),
      new Break("both", "IO.println(a[0]);", "IO.println(a[3]);", "question 3: uncaught"),
      new Break("both", "IO.println(\"there\");", "IO.println(System.nanoTime());", "question 2: prints something else each run"),
      new Break("both", "IO.println(\"there\");", "IO.println(new int[] {1});", "question 2: prints an identity hash"),
      new Break("key", "        IO.println(\"Hi\");", "        IO.println(\"Ho\");", "question 2: its key shows other code than the quiz"),
      new Break("key", "ANSWER: 0", "ANSWER: 0\n      ANSWER: 0", "question 3: its key has 2 ANSWER: lines, not one"),
      new Break("quiz", " 2. What does this print?", " 2. What does this print, line by line?", "question 2: write it as \"What does this print?\""),
      new Break("quiz", "        IO.println(\"Hi\");\n        IO.println();\n        IO.println(\"there\");",
          "    IO.println(\"Hi\");\n    IO.println();\n    IO.println(\"there\");", "question 2: no code under it"),
      new Break("key", " 3. What does this print?", " 3. What is printed?",
          "quizzes/ch01-quiz.txt question 3: its key has no \"What does this print?\" question 3"),
      new Break("quiz", " 3. What does this print?", " 3. What is printed?",
          "answer-keys/ch01-answers.txt question 3: the quiz has no \"What does this print?\" question 3"),
      new Break("quiz", " 3. What does this print?", " 2. What does this print?", "quizzes/ch01-quiz.txt question 2: the number is used twice"),
      new Break("quiz", "Date: ______________", "Date: ______________\n      ANSWER: Hi", "quizzes/ch01-quiz.txt: line 5 is an ANSWER: line"),
      new Break("quiz", "Chapter 1 - First programs", "Chapter 1 \u2014 First programs", "quizzes/ch01-quiz.txt: line 2 is not plain ASCII"),
      new Break("key", "\nANSWER KEY\n", "\nANSWERS\n", "answer-keys/ch01-answers.txt: does not say ANSWER KEY"),
      // A misaligned or reworded print question would otherwise be neither run nor said, and since the key repeats the
      // quiz, the pairing would pass: both files carry the same misformat, as an author copying one into the other would.
      new Break("both", " 3. What does this print?", "  3. What does this print?", "quizzes/ch01-quiz.txt: line 28 looks like a question but is not laid out as one"),
      new Break("both", " 3. What does this print?", " 3.\tWhat does this print?", "quizzes/ch01-quiz.txt: line 28 looks like a question but is not laid out as one"),
      new Break("both", " 3. What does this print?", " 3. What does this program print?", "question 3: it asks for output and shows code with no blank to fill in"),
      new Break("both", " 3. What does this print?", " 3. What is the output?", "question 3: it asks for output and shows code with no blank to fill in"),
      // The code ends at the first line not indented 8, and a line after the answer that is not a question or heading is
      // not ignored: either would silently change what is run or compared.
      new Break("both", "        IO.println();\n", "      IO.println();\n", "question 2: line 23 is not what follows the code"),
      new Break("key", "          there\n", "          there\n        IO.println(9);\n", "answer-keys/ch01-answers.txt question 2: line 27 is not what follows the answer"),
      // An identity hash may be short, or have a word character after it; five runs on one JDK would not show either.
      new Break("both", "IO.println(\"there\");", "IO.println(new int[] {1} + \"x\");", "question 2: prints an identity hash"),
      new Break("both", "IO.println(\"there\");", "IO.println(\"[I@1a\");", "question 2: prints an identity hash"));
    for (var b : breaks) {
      Path p = Fixtures.project("quiz-break");
      List<String> files = switch (b.where()) { case "quiz" -> List.of(QUIZ); case "key" -> List.of(KEY); default -> List.of(QUIZ, KEY); };
      for (String f : files) {
        Path file = p.resolve(f);
        String s = Files.readString(file);
        T.check(s.contains(b.from()), "the break applies to " + f + ": " + b.from());
        Files.writeString(file, s.replace(b.from(), b.to()));
      }
      var problems = check(p).problems();
      T.check(problems.stream().anyMatch(x -> x.contains(b.expect())), "\"" + b.expect() + "\" in: " + problems);
    }
  }

  // An address such as a@b.c is hex-looking after an "@" but is not an identity hash; flagging it would fail a right quiz.
  static void testAnAddressIsNotTakenForAnIdentityHash() throws Exception {
    Path p = Fixtures.project("quiz-address");
    for (String f : List.of(QUIZ, KEY)) {
      Path file = p.resolve(f);
      Files.writeString(file, Files.readString(file).replace("IO.println(\"there\");", "IO.println(\"a@b.c\");").replace("          there", "          a@b.c"));
    }
    T.eq(List.of(), check(p).problems(), "a@b.c is printed and agrees with the key");
  }

  // Every quiz needs its key, every key its quiz, and a quiz needs its chapter: a quiz without its key would publish
  // answers nobody checked, and a key without its quiz checks nothing a reader sees.
  static void testEveryQuizHasItsKeyAndEveryKeyItsQuiz() throws Exception {
    Path p = Fixtures.project("quiz-pairs");
    Path vol = p.resolve("volumes/vol-fixture");
    Files.delete(vol.resolve("answer-keys/ch01-answers.txt"));
    Files.writeString(vol.resolve("answer-keys/ch02-answers.txt"), "ANSWER KEY\n");
    Files.writeString(vol.resolve("quizzes/ch05-quiz.txt"), "GROUNDWORK\n");
    Files.writeString(vol.resolve("quizzes/ch02-types-and-input-quiz.txt"), "GROUNDWORK\n");
    var problems = check(p).problems();
    for (String want : List.of("quizzes/ch01-quiz.txt: has no key answer-keys/ch01-answers.txt",
        "answer-keys/ch02-answers.txt: has no quiz quizzes/ch02-quiz.txt",
        "quizzes/ch05-quiz.txt: there is no chapter 5 for it to belong to",
        "quizzes/ch02-types-and-input-quiz.txt: a quiz is named chNN-quiz.txt"))
      T.check(problems.stream().anyMatch(x -> x.startsWith(want)), want + " in: " + problems);
  }

  // The gate is wired into --check: the fixture passes and says how many questions ran, and a wrong answer fails the run
  // with the question named.
  static void testCheckRunsTheQuizGateAndAWrongAnswerFailsIt() throws Exception {
    Path p = Fixtures.project("quiz-check");
    var r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests");
    T.eq(0, r.exit(), "the fixture passes: " + r.out());
    T.check(r.out().contains("  quizzes: 2 questions run"), "and says how many quiz questions ran: " + r.out());
    Path key = p.resolve(KEY);
    Files.writeString(key, Files.readString(key).replace("ANSWER: 0", "ANSWER: 1"));
    r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests");
    T.eq(1, r.exit(), "a wrong answer fails --check: " + r.out());
    T.check(r.out().contains("  !! quizzes/ch01-quiz.txt question 3: its key's answer is not what the code prints"), r.out());
  }
}
