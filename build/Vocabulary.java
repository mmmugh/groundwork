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

/** D4: refuses a worked solution, practice step or check starter that uses something the chapters have not
 *  shown yet. The known vocabulary at chapter N is the union, over chapters 1 to N, of every teaching box's
 *  Vocab (a chapter's own content page, its non-reference, non-compileError boxes); a practice page's boxes,
 *  every fence in _solutions.md and every starter in _checks.json are held to their own chapter's known
 *  vocabulary. */
final class Vocabulary {
  private Vocabulary() {}

  /** Every problem this volume's practice steps, worked solutions and check starters raise against the
   *  vocabulary its chapters have actually taught by then. */
  static List<String> check(Volume v, Map<Page, List<Box>> boxes) throws BuildError {
    Map<String, Page> pageOf = new HashMap<>();
    for (var e : boxes.entrySet()) for (Box b : e.getValue()) pageOf.put(b.id(), e.getKey());

    Map<Integer, Vocab> knownByChapter = knownByChapter(v, boxes);

    List<String> problems = new ArrayList<>();
    for (var e : boxes.entrySet()) {
      Page p = e.getKey();
      if (!p.practice()) continue;
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
        Vocab known = knownFor(knownByChapter, p, v.solutions() + ": " + id, "a solution");
        for (String fence : s.getValue()) check(problems, id, "solution", fence, p.chapter(), known);
      }
    }
    for (var e : v.checks().entrySet()) {
      if (!(e.getValue() instanceof Map<?, ?> m) || !(m.get("starter") instanceof String starter)) continue;
      String id = e.getKey();
      Page p = pageOf.get(id);
      if (p == null) throw new BuildError("_checks.json: " + id + ": no such box");
      Vocab known = knownFor(knownByChapter, p, "_checks.json: " + id, "a starter");
      check(problems, id, "starter", starter, p.chapter(), known);
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

  /** _solutions.md's "## &lt;box id&gt;" sections, each mapped to the body of every java fence under it (an
   *  alternative or a second worked solution included, not only the first). */
  static Map<String, List<String>> solutions(Path file) throws BuildError {
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
    Map<String, List<String>> sections = new LinkedHashMap<>();
    String id = null;
    for (Markdown.Block block : blocks) {
      if (block instanceof Markdown.Heading h && h.level() == 2) id = h.text().trim();
      else if (id != null && block instanceof Markdown.Fence f && f.lang().equals("java"))
        sections.computeIfAbsent(id, k -> new ArrayList<>()).add(f.body());
    }
    return sections;
  }
}
