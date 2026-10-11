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
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;

/** DESIGN section 3: every check is tested three ways before it ships. For each checked box, the answers its
 *  _solutions.md section gives (Vocabulary.solutions): every worked solution is right and must pass, every java fence
 *  under "### mistake" is a realistic mistake and must fail. runtime/test/proofs.mjs judges each one with the page's
 *  own web/page/check.js on the browser runtime and on the pinned JDK (ForkGate.runProofs). A checked box needs two
 *  worked solutions, the second in another style, and a mistake. A predict box's answers are text: its stated output
 *  is the first right one, and it needs one more (a text fence under its heading) and a wrong one (a text fence under
 *  "### mistake").
 *
 *  <p>Box ids are positional, so a fence added or removed above an exercise moves its check, starter and solutions onto
 *  another box unless every key is moved too (C1). So a checked box whose check has a starter is proved with two more
 *  answers, which tie the check to the box it lands on: its own fence, the author's answer, which the audit already
 *  runs and which must pass ("the box's own fence"), and the starter, the code the box publishes, which must fail ("the
 *  published code": a starter that passes is an exercise with nothing to do). A box whose check has no starter
 *  publishes its fence, which may be the answer or the exercise's wrong starting code, so the data cannot say which way
 *  it must go: it gets neither. Neither answer counts toward the two worked solutions and a mistake, nor toward the
 *  mistake that compiles (runtime/test/proofs.mjs reads "published"); web/test/acceptance.mjs adds both, in this order,
 *  with these labels. */
final class Proofs {
  private Proofs() {}

  /** A box with no section in _solutions.md. */
  private static final Vocabulary.Section NONE = new Vocabulary.Section(List.of(), List.of(), List.of(), List.of(), List.of());
  /** The labels of the two answers that tie a starter box's check to the box (the class comment). */
  static final String FENCE = "the box's own fence", PUBLISHED = "the published code";

  /** v's checked boxes on the pages only selects (every page, unless --only names some), in page order, as proofs.json
   *  entries {id, check, answers: [{label, source, right}]} (the published code's answer also carries "published":
   *  true), check being exactly what the box's data-check carries
   *  (Checks.published). Each such box without the answers its proof needs adds a problem saying which are missing; a
   *  box on a page only leaves out is neither held to its answers nor proved. */
  static List<Object> of(Volume v, Map<Page, List<Box>> boxes, List<String> problems, Predicate<Page> only) throws BuildError {
    Map<String, Vocabulary.Section> sections = v.solutions() == null ? Map.of() : Vocabulary.solutions(v.solutions());
    List<Object> proofs = new ArrayList<>();
    for (var e : boxes.entrySet()) {
      if (!only.test(e.getKey())) continue;
      for (Box b : e.getValue()) {
        Checks.Check c = Checks.of(v, b);
        if (c == null) continue;
        Vocabulary.Section s = sections.getOrDefault(b.id(), NONE);
        List<Object> answers = new ArrayList<>();
        if (c.kind().equals("predict")) {
          answers.add(answer("the stated output", b.expected(), true));
          // The stated output is the first right prediction, so the text fences under the heading count from 2.
          add(answers, "right prediction ", 2, s.rightText(), true);
          add(answers, "wrong prediction ", 1, s.mistakeText(), false);
          if (s.rightText().isEmpty())
            problems.add(b.id() + ": its predict check needs a right prediction besides its stated output: a text fence under \"## "
                + b.id() + "\" in _solutions.md");
          if (s.mistakeText().isEmpty())
            problems.add(b.id() + ": its predict check needs a wrong prediction: a text fence under \"### mistake\" in _solutions.md");
        } else {
          boolean starter = c.starter() != null;
          add(answers, "worked solution ", 1, s.worked(), true);
          if (starter) answers.add(answer(FENCE, b.source(), true));
          add(answers, "mistake ", 1, s.mistakes(), false);
          if (starter) {
            Map<String, Object> published = answer(PUBLISHED, c.starter(), false);
            published.put("published", true);
            answers.add(published);
          }
          if (s.worked().size() < 2)
            problems.add(b.id() + ": its check needs two worked solutions in _solutions.md, the second in another style; it has "
                + s.worked().size());
          if (s.mistakes().isEmpty())
            problems.add(b.id() + ": its check needs a realistic mistake: a java fence under \"### mistake\" in _solutions.md");
        }
        Map<String, Object> proof = new LinkedHashMap<>();
        proof.put("id", b.id());
        proof.put("check", Checks.published(c, b));
        proof.put("answers", answers);
        proofs.add(proof);
      }
    }
    return proofs;
  }

  /** How many answers proofs hold in all. */
  static int answers(List<Object> proofs) {
    int n = 0;
    for (Object p : proofs) n += ((List<?>) ((Map<?, ?>) p).get("answers")).size();
    return n;
  }

  /** Each of sources as an answer, labeled label and its number, counting from first. */
  private static void add(List<Object> answers, String label, int first, List<String> sources, boolean right) {
    for (int i = 0; i < sources.size(); i++) answers.add(answer(label + (first + i), sources.get(i), right));
  }

  private static Map<String, Object> answer(String label, String source, boolean right) {
    Map<String, Object> a = new LinkedHashMap<>();
    a.put("label", label);
    a.put("source", source);
    a.put("right", right);
    return a;
  }
}
