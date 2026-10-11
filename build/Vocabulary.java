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
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Predicate;
import java.util.regex.Matcher;

/** D4: refuses a worked solution, practice step, check starter or quiz question that uses something the chapters have
 *  not shown yet. The known vocabulary at chapter N is the union, over chapters 1 to N, of every teaching box's
 *  Vocab (a chapter's own content page, its non-reference, non-compileError boxes); a practice page's boxes,
 *  every worked solution in _solutions.md, every mistake there that compiles, every starter in _checks.json and the
 *  code of every "What does this print?" question in quizzes/chNN-quiz.txt (as Quizzes.program runs it) are held to
 *  their own chapter's known vocabulary. */
final class Vocabulary {
  private Vocabulary() {}

  /** Every problem this volume's practice steps, worked solutions, mistakes that compile, check starters and quiz
   *  questions raise against the vocabulary its chapters have actually taught by then, for the pages only selects
   *  (every page, unless --only names some): a practice page's boxes, the solutions, mistakes and starters keyed to a
   *  box on a selected page, and the quiz of a chapter whose content page is selected. */
  static List<String> check(Volume v, Map<Page, List<Box>> boxes, Predicate<Page> only) throws BuildError {
    Map<String, Page> pageOf = new HashMap<>();
    for (var e : boxes.entrySet()) for (Box b : e.getValue()) pageOf.put(b.id(), e.getKey());

    // Every chapter's vocabulary comes from all of its boxes, whatever only selects: a page checked alone is still held
    // to what the chapters before it taught.
    Map<Integer, Vocab> knownByChapter = knownByChapter(v, boxes);

    List<String> problems = new ArrayList<>();
    for (var e : boxes.entrySet()) {
      Page p = e.getKey();
      if (!p.practice() || !only.test(p)) continue;
      Vocab known = knownByChapter.get(p.chapter());
      for (Box b : e.getValue()) {
        // A reference box never runs, and a compileError box is meant not to compile: Audit already proves
        // that separately (volumes/README.md: a compileError box is exempt "only if it truly fails to
        // compile"). knownByChapter already skips both when gathering what a chapter teaches; the practice
        // loop must skip them too, or a syntax reminder or a deliberate compile error on a practice page
        // fails --check with "does not compile" no matter what it uses.
        if (b.decl().reference() || b.decl().compileError() != null) continue;
        check(problems, b.id(), "practice", b.source(), p.chapter(), known);
      }
    }
    if (v.solutions() != null) {
      for (var s : solutions(v.solutions()).entrySet()) {
        String id = s.getKey();
        Page p = pageOf.get(id);
        if (p == null) throw new BuildError(v.solutions() + ": " + id + ": no such box");
        if (!only.test(p)) continue;
        Vocab known = knownFor(knownByChapter, p, v.solutions() + ": " + id, "a solution");
        for (String fence : s.getValue().worked()) check(problems, id, "solution", fence, p.chapter(), known);
        // A mistake is held to its chapter too: one a reader at this point could not have written proves nothing about
        // whether the check is fair to that reader. One that does not compile is let be (a realistic mistake may be a
        // compile error), since javac gives no resolved tree to read its vocabulary from.
        for (String fence : s.getValue().mistakes()) {
          Vocab used;
          try { used = Vocab.of(fence); } catch (BuildError e) { continue; }
          beyond(problems, id, "mistake", used, p.chapter(), known);
        }
      }
    }
    for (var e : v.checks().entrySet()) {
      if (!(e.getValue() instanceof Map<?, ?> m) || !(m.get("starter") instanceof String starter)) continue;
      String id = e.getKey();
      Page p = pageOf.get(id);
      if (p == null) throw new BuildError("_checks.json: " + id + ": no such box");
      if (!only.test(p)) continue;
      Vocab known = knownFor(knownByChapter, p, "_checks.json: " + id, "a starter");
      check(problems, id, "starter", starter, p.chapter(), known);
    }
    // DESIGN section 4: a quiz is held to its chapter as a solution is. Chapter N's quiz may use what chapters 1 to N
    // teach; its "What does this print?" code is the only code in it the build can read (the rest has blanks in it). A
    // misnamed quiz, one for a chapter the volume lacks, and a malformed question are Quizzes.check's to report, so
    // printQuestions' own problems are dropped here rather than reported twice.
    for (Path quiz : v.quizzes()) {
      Matcher m = Quizzes.QUIZ_NAME.matcher(quiz.getFileName().toString());
      if (!m.matches()) continue;
      int chapter = Integer.parseInt(m.group(1));
      Vocab known = knownByChapter.get(chapter);
      if (known == null || !only.test(Quizzes.chapterPage(v, chapter))) continue;
      String where = "quizzes/" + quiz.getFileName();
      for (Quizzes.Question q : Quizzes.printQuestions(where, Quizzes.text(quiz), new ArrayList<>()).values())
        check(problems, where + " question " + q.number(), "quiz", Quizzes.program(q.code()), chapter, known);
    }
    return problems;
  }

  /** The known vocabulary for a page that must belong to a chapter (1 or higher): a solution or starter
   *  keyed to a box on a front-matter or appendix page (chapter -1) has no entry in knownByChapter, which
   *  used to surface as an uncaught NullPointerException from Vocab.beyond the moment such a box's vocabulary
   *  was compared against it. */
  private static Vocab knownFor(Map<Integer, Vocab> knownByChapter, Page p, String where, String what) throws BuildError {
    Vocab known = knownByChapter.get(p.chapter());
    if (known == null) throw new BuildError(where + ": " + what + " is keyed to a box outside any chapter (front matter or an appendix)");
    return known;
  }

  private static void check(List<String> problems, String id, String kind, String source, int chapter, Vocab known) {
    Vocab used;
    try {
      used = Vocab.of(source);
    } catch (BuildError e) {
      problems.add(id + " (" + kind + "): does not compile");
      return;
    }
    beyond(problems, id, kind, used, chapter, known);
  }

  private static void beyond(List<String> problems, String id, String kind, Vocab used, int chapter, Vocab known) {
    List<String> beyond = used.beyond(known);
    if (!beyond.isEmpty())
      problems.add(id + " (" + kind + "): uses what the course has not shown by chapter " + chapter + ": " + String.join(", ", beyond));
  }

  /** The known vocabulary through each chapter that has a content page: chapter N's entry is the union of
   *  every teaching box's Vocab (not reference, not compileError) from that chapter's own content page and
   *  every chapter before it. Practice pages teach nothing; they are only checked, below. A teaching box
   *  that fails to compile (not declared compileError) contributes nothing here rather than aborting the
   *  gate: Audit.check already reports it as "fails to compile" on its own. */
  private static Map<Integer, Vocab> knownByChapter(Volume v, Map<Page, List<Box>> boxes) {
    List<Page> content = new ArrayList<>();
    for (Page p : v.pages()) if (p.chapter() >= 1 && !p.practice()) content.add(p);
    content.sort(Comparator.comparingInt(Page::chapter));

    Map<Integer, Vocab> result = new TreeMap<>();
    Vocab cumulative = Vocab.EMPTY;
    for (Page p : content) {
      Vocab taught = Vocab.EMPTY;
      for (Box b : boxes.get(p)) {
        if (b.decl().reference() || b.decl().compileError() != null) continue;
        try { taught = taught.union(Vocab.of(b.source())); } catch (BuildError ignored) { /* Audit reports this box */ }
      }
      cumulative = cumulative.union(taught);
      result.put(p.chapter(), cumulative);
    }
    return result;
  }

  /** One "## &lt;box id&gt;" section of _solutions.md. worked: the body of every java fence under the heading before
   *  "### mistake", in order; each is a right answer, and the first is the one a reader may reveal (Pages.appendBox).
   *  note: the blocks right after that first fence, up to the next fence or heading, which the reveal shows under the
   *  code. mistakes: the body of every java fence after "### mistake": realistic wrong answers, published nowhere, never
   *  held to the starter rule, and free not to compile. rightText and mistakeText: the body of every text fence before
   *  and after "### mistake": a predict check's right and wrong predictions, for the three-way proof (Proofs). A fence
   *  in any other language is in none of them. */
  record Section(List<String> worked, List<Markdown.Block> note, List<String> mistakes, List<String> rightText,
                 List<String> mistakeText) {}

  /** _solutions.md's "## &lt;box id&gt;" sections, by id, in file order; each made at its heading, so a heading for no
   *  such box is reported even without a fence. "### mistake" is the one level-3 heading a section takes: any other is
   *  a BuildError, since a misspelled one would leave its mistakes worked solutions. */
  static Map<String, Section> solutions(Path file) throws BuildError {
    String md;
    try {
      md = Files.readString(file, StandardCharsets.UTF_8);
    } catch (IOException e) {
      throw new BuildError(file + ": " + e.getMessage());
    }
    List<Markdown.Block> blocks;
    try {
      blocks = Markdown.checkedBlocks(md);
    } catch (BuildError e) {
      throw new BuildError(file + ": " + e.getMessage());
    }
    Map<String, Section> sections = new LinkedHashMap<>();
    String id = null;
    boolean mistakes = false, note = false;
    for (Markdown.Block block : blocks) {
      if (block instanceof Markdown.Heading h) {
        note = false;
        if (h.level() == 2) {
          id = h.text().trim();
          sections.computeIfAbsent(id, k -> new Section(new ArrayList<>(), new ArrayList<>(), new ArrayList<>(), new ArrayList<>(), new ArrayList<>()));
          mistakes = false;
        } else if (h.level() == 3 && id != null) {
          if (!h.text().trim().equals("mistake"))
            throw new BuildError(file + ": " + id + ": \"### " + h.text().trim() + "\": the only level-3 heading a section takes is \"### mistake\"");
          mistakes = true;
        }
        continue;
      }
      if (id == null) continue;
      Section s = sections.get(id);
      if (block instanceof Markdown.Fence f) {
        note = false;
        if (f.lang().equals("text")) (mistakes ? s.mistakeText() : s.rightText()).add(f.body());
        if (!f.lang().equals("java")) continue;
        if (mistakes) {
          s.mistakes().add(f.body());
        } else {
          note = s.worked().isEmpty();
          s.worked().add(f.body());
        }
      } else if (note) {
        s.note().add(block);
      }
    }
    return sections;
  }
}
