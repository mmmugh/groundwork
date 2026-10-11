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
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** DESIGN section 6: a quiz per chapter, plain text, every "What does this print?" answer verified on the real JDK, answer
 *  keys never published. quizzes/chNN-quiz.txt is chapter NN's quiz and answer-keys/chNN-answers.txt its key, both in the
 *  Python course's layout (volumes/README.md, "Quizzes"). check pairs every quiz with its key and every key with its quiz,
 *  and runs the code of every "What does this print?" question on the pinned JDK, which must print exactly the key's
 *  answer once both are tidied as a stated output is (Audit.tidy). Vocabulary.check holds the same code to its chapter.
 *  Every other question (a term, code with a blank in it, a reason) is read by the review, not run. */
final class Quizzes {
  private Quizzes() {}

  static final Pattern QUIZ_NAME = Pattern.compile("ch(\\d+)-quiz\\.txt");
  private static final Pattern KEY_NAME = Pattern.compile("ch(\\d+)-answers\\.txt");
  /** A question's first line: its number right-aligned in two columns (" 5. ", "12. "), then its text. */
  private static final Pattern QUESTION = Pattern.compile("( \\d|\\d\\d)\\. (.*)");
  /** Anything that looks like a numbered question (a number and a dot, then white space, at the margin or a few spaces in)
   *  and so must match QUESTION exactly or be reported: otherwise a misaligned question would be neither run nor said. */
  private static final Pattern LOOKS_NUMBERED = Pattern.compile("[ \\t]{0,7}\\d+\\.[ \\t].*");
  /** The place to write under a quiz's code: four spaces and 36 underscores. */
  private static final Pattern PLACE = Pattern.compile(" {4}_{36}");
  /** A section heading (VOCABULARY) and its hyphen underline. */
  private static final Pattern HEADING = Pattern.compile("[A-Z][A-Z ]*");
  private static final Pattern UNDERLINE = Pattern.compile("-{3,}");
  private static final Pattern MENTIONS_OUTPUT = Pattern.compile("(?i).*(print|output).*");
  /** An answer in a key: "ANSWER:", one space, then the answer's first line exactly as printed (any more spaces are its own). */
  private static final Pattern ANSWER = Pattern.compile(" *ANSWER:(?: (.*))?");
  static final String PRINT = "What does this print?";
  private static final String CODE_INDENT = " ".repeat(8);
  private static final String ANSWER_INDENT = " ".repeat(10);
  private static final Duration DEADLINE = Duration.ofSeconds(10);
  /** Five runs, not two: a small Set.of or Map.of agrees with itself across two JVM starts about a quarter of the time. */
  private static final int RUNS = 5;
  /** An identity hash (an array's or a plain object's toString: a type-name character, "@", hex) repeats across starts of
   *  one JDK but is promised nowhere. A hash may be short or have a word character after it; "a@b.c" (a dot and more
   *  after the hex) is an address, not a hash. */
  private static final Pattern IDENTITY_HASH = Pattern.compile("[A-Za-z0-9_$;\\]]@[0-9a-f]{1,8}(?![0-9a-f])(?!\\.[A-Za-z0-9])");

  /** One "What does this print?" question: its number, its code with the 8-space indent removed (no trailing newline),
   *  and each answer under it, its lines joined with "\n" (none in a quiz). */
  record Question(int number, String code, List<String> answers) {}

  /** What check found: how many questions it ran, and every problem. */
  record Checked(int questions, List<String> problems) {}

  /** Every quiz of v paired with its key, every key with its quiz, and every "What does this print?" question run; how
   *  many questions ran, and each problem as "<file> question N: <problem>" or "<file>: <problem>", in file order. */
  static Checked check(Volume v) throws BuildError {
    List<String> problems = new ArrayList<>();
    int ran = 0;
    for (Path quiz : v.quizzes()) {
      String name = quiz.getFileName().toString(), where = "quizzes/" + name;
      Matcher m = QUIZ_NAME.matcher(name);
      if (!m.matches()) {
        problems.add(where + ": a quiz is named chNN-quiz.txt, NN being its chapter's number as the chapter's file writes it");
        continue;
      }
      int chapter = Integer.parseInt(m.group(1));
      if (chapterPage(v, chapter) == null) {
        problems.add(where + ": there is no chapter " + chapter + " for it to belong to");
        continue;
      }
      String keyWhere = "answer-keys/ch" + m.group(1) + "-answers.txt";
      Path key = v.dir().resolve(keyWhere);
      if (!Files.isRegularFile(key)) {
        problems.add(where + ": has no key " + keyWhere);
        continue;
      }
      String quizText = text(quiz), keyText = text(key);
      String[] lines = quizText.split("\n", -1);
      for (int i = 0; i < lines.length; i++) {
        if (lines[i].chars().anyMatch(c -> c > 127)) {
          problems.add(where + ": line " + (i + 1) + " is not plain ASCII; a .txt cannot say its encoding, so a reader's phone may garble it");
          break;
        }
      }
      for (int i = 0; i < lines.length; i++)
        if (ANSWER.matcher(lines[i]).matches()) problems.add(where + ": line " + (i + 1) + " is an ANSWER: line; answers live only in " + keyWhere);
      if (!keyText.contains("ANSWER KEY"))
        problems.add(keyWhere + ": does not say ANSWER KEY, the words the publishing guard refuses to publish");
      Map<Integer, Question> asked = printQuestions(where, quizText, problems);
      Map<Integer, Question> answered = printQuestions(keyWhere, keyText, problems);
      for (int n : answered.keySet())
        if (!asked.containsKey(n)) problems.add(keyWhere + " question " + n + ": the quiz has no \"" + PRINT + "\" question " + n);
      for (Question q : asked.values()) {
        String id = where + " question " + q.number();
        Question k = answered.get(q.number());
        if (k == null) {
          problems.add(id + ": its key has no \"" + PRINT + "\" question " + q.number());
          continue;
        }
        if (!k.code().equals(q.code())) {
          problems.add(id + ": its key shows other code than the quiz");
          continue;
        }
        if (k.answers().size() != 1) {
          problems.add(id + ": its key has " + k.answers().size() + " ANSWER: lines, not one (the output's further lines go under it, indented 10 spaces)");
          continue;
        }
        ran++;
        problems.addAll(run(id, q.code(), k.answers().get(0), Path.of("build/.work/quizzes/" + name.replace(".txt", "") + "-" + q.number())));
      }
    }
    Path keys = v.dir().resolve("answer-keys");
    if (Files.isDirectory(keys)) {
      List<Path> files;
      try (var s = Files.list(keys)) {
        files = s.sorted().toList();
      } catch (IOException e) {
        throw new BuildError(keys + ": " + e.getMessage());
      }
      for (Path k : files) {
        Matcher m = KEY_NAME.matcher(k.getFileName().toString());
        if (m.matches() && !Files.isRegularFile(v.dir().resolve("quizzes/ch" + m.group(1) + "-quiz.txt")))
          problems.add("answer-keys/" + k.getFileName() + ": has no quiz quizzes/ch" + m.group(1) + "-quiz.txt");
      }
    }
    return new Checked(ran, problems);
  }

  /** Every "What does this print?" question in text, a quiz's or a key's, by number. A question starts at a line " N. "
   *  (N right-aligned in two columns). A print question's line is exactly " N. What does this print?"; its code is the
   *  lines under it that are blank or indented 8 spaces, from the first indented one, the 8 spaces removed and blank lines
   *  at its end dropped (a blank line inside it stays). In a key, each "ANSWER: " line before the next question is one
   *  answer: the rest of that line, then each line under it that is blank or indented 10 spaces, the 10 removed, up to the
   *  first line that is neither. Adds to problems a number used twice, a print question with no code, and a question that
   *  says "does this print" in other words, which would otherwise be skipped without a word. */
  static Map<Integer, Question> printQuestions(String where, String text, List<String> problems) {
    String[] lines = text.replace("\r\n", "\n").split("\n", -1);
    Map<Integer, Question> found = new TreeMap<>();
    Set<Integer> numbers = new HashSet<>();
    for (int i = 0; i < lines.length; i++) {
      Matcher q = QUESTION.matcher(lines[i]);
      if (!q.matches()) {
        if (LOOKS_NUMBERED.matcher(lines[i]).matches())
          problems.add(where + ": line " + (i + 1) + " looks like a question but is not laid out as one: write its number right-aligned in two columns,"
              + " then a dot and one space (\" 5. text\", \"12. text\")");
        continue;
      }
      int n = Integer.parseInt(q.group(1).trim());
      if (!numbers.add(n)) {
        problems.add(where + " question " + n + ": the number is used twice");
        continue;
      }
      if (!q.group(2).equals(PRINT)) {
        if (q.group(2).toLowerCase(Locale.ROOT).contains("does this print"))
          problems.add(where + " question " + n + ": write it as \"" + PRINT + "\" alone on its line, or the build cannot find its code");
        else if (asksWhatIsPrinted(lines, i, q.group(2)))
          problems.add(where + " question " + n + ": it asks for output and shows code with no blank to fill in, so it must be worded exactly \""
              + PRINT + "\" on its line to be run");
        continue;
      }
      int j = i + 1;
      while (j < lines.length && lines[j].isBlank()) j++;
      List<String> code = new ArrayList<>();
      for (; j < lines.length && (lines[j].isBlank() || lines[j].startsWith(CODE_INDENT)); j++)
        code.add(lines[j].isBlank() ? "" : lines[j].substring(CODE_INDENT.length()));
      while (!code.isEmpty() && code.get(code.size() - 1).isEmpty()) code.remove(code.size() - 1);
      if (code.isEmpty()) {
        problems.add(where + " question " + n + ": no code under it, indented 8 spaces");
        continue;
      }
      List<String> answers = new ArrayList<>();
      boolean afterCode = true, reported = false;
      while (j < lines.length && !QUESTION.matcher(lines[j]).matches() && !LOOKS_NUMBERED.matcher(lines[j]).matches()) {
        String line = lines[j++];
        if (line.isBlank()) continue;
        Matcher a = ANSWER.matcher(line);
        if (!a.matches()) {
          // Right after the code comes the place to write (a quiz) or the ANSWER: line (a key); after those only a new
          // question, a section heading or its underline. Anything else is a line the build would otherwise skip.
          boolean fine = PLACE.matcher(line).matches() || (!afterCode && (HEADING.matcher(line).matches() || UNDERLINE.matcher(line).matches()));
          if (!fine && !reported) {
            problems.add(where + " question " + n + ": line " + j + " is not what follows "
                + (afterCode ? "the code (the place to write, 4 spaces and 36 underscores, or an ANSWER: line; the code ends at the first line not indented 8 spaces)"
                             : "the answer (a new question or a section heading)") + ": " + line.strip());
            reported = true;
          }
          afterCode = false;
          continue;
        }
        afterCode = false;
        List<String> answer = new ArrayList<>(List.of(a.group(1) == null ? "" : a.group(1)));
        for (; j < lines.length && (lines[j].isBlank() || lines[j].startsWith(ANSWER_INDENT)); j++)
          answer.add(lines[j].isBlank() ? "" : lines[j].substring(ANSWER_INDENT.length()));
        answers.add(String.join("\n", answer));
      }
      found.put(n, new Question(n, String.join("\n", code), answers));
      i = j - 1;
    }
    return found;
  }

  /** Whether the question at lines[i], not worded as a print question, asks what is printed or output (in its first line or
   *  the indented lines wrapping it) and shows code (lines indented 8) with no blank (a run of "__") to fill in: it would
   *  be neither run nor held to the vocabulary, and nobody would be told. */
  private static boolean asksWhatIsPrinted(String[] lines, int i, String first) {
    StringBuilder text = new StringBuilder(first);
    int j = i + 1;
    for (; j < lines.length && !lines[j].isBlank() && !lines[j].startsWith(CODE_INDENT); j++) text.append(' ').append(lines[j]);
    if (!MENTIONS_OUTPUT.matcher(text).matches()) return false;
    while (j < lines.length && lines[j].isBlank()) j++;
    if (j >= lines.length || !lines[j].startsWith(CODE_INDENT)) return false;
    for (; j < lines.length && (lines[j].isBlank() || lines[j].startsWith(CODE_INDENT)); j++) text.append(' ').append(lines[j]);
    return !text.toString().contains("__");
  }

  /** The compact source file a question's code runs as. Code with a line that starts "void main(" at its own margin is a
   *  whole program and runs as written; any other code is statements, run as main's body, each line indented 4 spaces (a
   *  blank line stays blank). A question that needs a method or an import beside main is written whole. */
  static String program(String code) {
    String[] lines = code.split("\n", -1);
    for (String l : lines) if (l.startsWith("void main(")) return code + "\n";
    StringBuilder sb = new StringBuilder("void main() {\n");
    for (String l : lines) sb.append(l.isEmpty() ? "" : "    " + l).append('\n');
    return sb.append("}\n").toString();
  }

  /** A quiz's or key's text, CRLF read as LF. Bytes that are not UTF-8 decode as U+FFFD rather than throwing, so a quiz
   *  saved in another encoding is reported as not ASCII instead of stopping --check. */
  static String text(Path file) throws BuildError {
    try {
      return new String(Files.readAllBytes(file), StandardCharsets.UTF_8).replace("\r\n", "\n");
    } catch (IOException e) {
      throw new BuildError(file + ": " + e.getMessage());
    }
  }

  /** Chapter n's own content page in v (not its practice page), or null when v has no chapter n. */
  static Page chapterPage(Volume v, int n) {
    for (Page p : v.pages()) if (p.chapter() == n && !p.practice()) return p;
    return null;
  }

  /** Compiles a question's program on the pinned JDK and runs it five times with no input. It must compile, run to its
   *  end, print the same every time (an answer that changes from run to run cannot be verified), print no identity hash,
   *  and print exactly answer, both tidied as a stated output is. */
  private static List<String> run(String id, String code, String answer, Path outDir) throws BuildError {
    Jdk.Compiled compiled = Jdk.compile(program(code), outDir);
    if (!compiled.ok())
      return List.of(id + ": fails to compile: " + (compiled.errors().isEmpty() ? "javac reported no error" : compiled.errors().get(0).message()));
    Jdk.Run first = Jdk.run(compiled.classes(), "", DEADLINE);
    if (!first.status().equals("ok")) return List.of(id + ": " + first.status() + " (a quiz question's code must run to its end)");
    for (int i = 1; i < RUNS; i++)
      if (!first.equals(Jdk.run(compiled.classes(), "", DEADLINE)))
        return List.of(id + ": prints something else each run, so no answer to it can be verified");
    if (IDENTITY_HASH.matcher(first.stdout()).find())
      return List.of(id + ": prints an identity hash (such as [I@1b6d3586), which no JDK promises to repeat");
    String want = Audit.tidy(answer), got = Audit.tidy(first.stdout());
    if (!want.equals(got))
      return List.of(id + ": its key's answer is not what the code prints\n      expected: " + show(want) + "\n      actual:   " + show(got));
    return List.of();
  }

  private static String show(String s) { return s.replace("\n", "\\n"); }
}
