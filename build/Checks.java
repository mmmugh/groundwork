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
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import javax.lang.model.SourceVersion;

/** A volume's _checks.json, box by box: Checks.problems holds every entry to the rules below, Checks.of
 *  reads one box's entry, and Checks.published is the part of it the box carries on the page (D37: each check
 *  travels only inside its own box; no file carrying every check is published). The starter rule (D40(b)):
 *  a box whose check declares a starter publishes the starter in place of its own fence, and no box may
 *  publish a fence from its own _solutions.md section. */
final class Checks {
  private Checks() {}

  /** One box's check. Every value is Java source text, written by the page into the generated Java, so each
   *  stays a string. name, returns, params and cases are a method check's; runs an input check's; expected an
   *  output check's (a predict check's answer is the box's own stated output, which published reads from the
   *  box, so it is null here); starter any kind's but predict, or null. */
  record Check(String kind, String name, String returns, List<String> params, List<List<String>> cases,
               List<Map<String, Object>> runs, String expected, String starter) {}

  private static final Map<String, Set<String>> KEYS = Map.of(
      "method", Set.of("kind", "name", "returns", "params", "cases", "starter"),
      "input", Set.of("kind", "runs", "starter"),
      "output", Set.of("kind", "expected", "starter"),
      "predict", Set.of("kind"));
  /** The keys of one input run, and the only ones published: what check.js's inputVerdict reads. */
  private static final List<String> RUN_KEYS = List.of("typed", "numbers", "words", "contains");
  /** A number as the page finds one in a program's output (check.js matches -?\d+(?:\.\d+)?): a pinned
   *  number written any other way (1e3, +2, .5) could never be found there. */
  private static final Pattern DECIMAL = Pattern.compile("-?\\d+(\\.\\d+)?");
  /** A word as the page finds one in a program's output: check.js lowercases the output, splits it at every
   *  character that is not a letter or digit (\p{L}\p{N}) and compares each lowercased pinned word with one
   *  piece. A pinned word that is not one such piece once lowercased ("New York", "can't", or "İ", which
   *  lowercases to i and a combining dot) could never be found, so no answer could pass, the right one included. */
  private static final Pattern WORD = Pattern.compile("[\\p{L}\\p{N}]+");

  /** v's check for b, or null when b has none. Call only after Boxes.validate passed. */
  @SuppressWarnings("unchecked")
  static Check of(Volume v, Box b) {
    if (!(v.checks().get(b.id()) instanceof Map<?, ?> raw)) return null;
    Map<String, Object> m = (Map<String, Object>) raw;
    List<List<String>> cases = null;
    if (m.get("cases") instanceof List<?> l) {
      cases = new ArrayList<>();
      for (Object c : l) cases.add((List<String>) c);
    }
    return new Check((String) m.get("kind"), (String) m.get("name"), (String) m.get("returns"),
        (List<String>) m.get("params"), cases, (List<Map<String, Object>>) m.get("runs"),
        (String) m.get("expected"), (String) m.get("starter"));
  }

  /** The fields b's data-check attribute carries, and nothing else: never the starter, which the box
   *  already shows as its code. */
  static Map<String, Object> published(Check c, Box b) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("kind", c.kind());
    switch (c.kind()) {
      case "method" -> {
        m.put("name", c.name());
        m.put("returns", c.returns());
        m.put("params", c.params());
        m.put("cases", c.cases());
      }
      case "input" -> {
        List<Map<String, Object>> runs = new ArrayList<>();
        for (Map<String, Object> run : c.runs()) {
          Map<String, Object> r = new LinkedHashMap<>();
          for (String k : RUN_KEYS) if (run.containsKey(k)) r.put(k, run.get(k));
          runs.add(r);
        }
        m.put("runs", runs);
      }
      case "output" -> m.put("expected", c.expected());
      case "predict" -> m.put("expected", b.expected());
      default -> throw new IllegalArgumentException("no such check kind: " + c.kind());
    }
    return m;
  }

  /** Every problem in v's _checks.json, one line each, and every box that would publish its own worked
   *  solution. */
  static List<String> problems(Volume v, Map<Page, List<Box>> all) throws BuildError {
    Map<String, Box> boxes = new HashMap<>();
    for (List<Box> list : all.values()) for (Box b : list) boxes.put(b.id(), b);

    List<String> problems = new ArrayList<>();
    for (var e : v.checks().entrySet()) {
      String id = e.getKey();
      Box b = boxes.get(id);
      if (b == null) { problems.add(id + ": check for no such box"); continue; }
      if (!(e.getValue() instanceof Map<?, ?> m) || !(m.get("kind") instanceof String kind)) {
        problems.add(id + ": _checks.json entry must be an object with a string \"kind\"");
        continue;
      }
      if (b.decl().reference()) { problems.add(id + ": check on a reference box"); continue; }
      Set<String> keys = KEYS.get(kind);
      if (keys == null) {
        problems.add(id + ": unknown check kind \"" + kind + "\" (method, input, output or predict)");
        continue;
      }
      for (Object k : m.keySet())
        if (!keys.contains(String.valueOf(k))) problems.add(id + ": unknown key \"" + k + "\" in a " + kind + " check");
      if (m.containsKey("starter") && keys.contains("starter") && !(m.get("starter") instanceof String))
        problems.add(id + ": \"starter\" must be a string");
      switch (kind) {
        case "method" -> method(problems, id, m);
        case "input" -> input(problems, id, m);
        case "output" -> {
          if (!(m.get("expected") instanceof String)) problems.add(id + ": an output check needs \"expected\"");
        }
        default -> predict(problems, b);
      }
    }
    workedSolutions(problems, v, boxes);
    return problems;
  }

  private static void method(List<String> problems, String id, Map<?, ?> m) {
    if (m.get("name") == null || !(m.get("returns") instanceof String r) || r.isBlank()
        || m.get("params") == null || m.get("cases") == null) {
      problems.add(id + ": a method check needs \"name\", \"returns\", \"params\" and \"cases\"");
      return;
    }
    if (!(m.get("name") instanceof String name) || !SourceVersion.isIdentifier(name) || SourceVersion.isKeyword(name))
      problems.add(id + ": \"name\" is not a Java method name");
    if (r.strip().equals("void")) problems.add(id + ": a method check's \"returns\" cannot be void");
    if (!isStrings(m.get("params"))) problems.add(id + ": \"params\" must be a list of types");
    if (!(m.get("cases") instanceof List<?> cases) || cases.isEmpty()) {
      problems.add(id + ": \"cases\" must be a list of at least one case");
      return;
    }
    for (int n = 1; n <= cases.size(); n++)
      if (!(isStrings(cases.get(n - 1)) && ((List<?>) cases.get(n - 1)).size() == 2))
        problems.add(id + ": case " + n + " must be [\"<arguments>\", \"<expected>\"]");
  }

  private static void input(List<String> problems, String id, Map<?, ?> m) {
    if (!(m.get("runs") instanceof List<?> runs) || runs.isEmpty()) {
      problems.add(id + ": an input check needs \"runs\"");
      return;
    }
    for (int n = 1; n <= runs.size(); n++) {
      if (!(runs.get(n - 1) instanceof Map<?, ?> run) || !run.containsKey("typed")
          || !(run.containsKey("numbers") || run.containsKey("words") || run.containsKey("contains"))) {
        problems.add(id + ": run " + n + " needs \"typed\" and at least one of \"numbers\", \"words\" or \"contains\"");
        continue;
      }
      for (Object k : run.keySet())
        if (!RUN_KEYS.contains(String.valueOf(k))) problems.add(id + ": unknown key \"" + k + "\" in run " + n);
      if (!isStrings(run.get("typed"))) problems.add(id + ": run " + n + "'s \"typed\" must be a list of strings");
      if (run.containsKey("numbers")) {
        boolean ok = isStrings(run.get("numbers"));
        if (ok) for (Object s : (List<?>) run.get("numbers")) ok &= DECIMAL.matcher((String) s).matches();
        if (!ok) problems.add(id + ": run " + n + "'s \"numbers\" must be numbers written as text");
      }
      if (run.containsKey("words") && !isStrings(run.get("words")))
        problems.add(id + ": run " + n + "'s \"words\" must be a list of strings");
      else if (run.containsKey("words"))
        for (Object w : (List<?>) run.get("words"))
          if (!WORD.matcher(((String) w).toLowerCase(Locale.ROOT)).matches()) {
            problems.add(id + ": run " + n + "'s \"words\" must each be one word of letters or digits, with no space or punctuation");
            break;
          }
      if (run.containsKey("contains") && !(run.get("contains") instanceof String))
        problems.add(id + ": run " + n + "'s \"contains\" must be a string");
    }
  }

  /** A predict box's answer is its own stated output, which the audit has verified: so it must have one,
   *  and it must be the one output every run prints. */
  private static void predict(List<String> problems, Box b) {
    Decl d = b.decl();
    if (b.expected() == null) problems.add(b.id() + ": a predict box needs a stated output");
    if (d.varies() || d.raises() != null || d.compileError() != null || !d.stdin().isEmpty())
      problems.add(b.id() + ": a predict box cannot be varies, raises, compileError or stdin");
  }

  /** The second half of the starter rule: the source a box publishes (its starter, or its own fence when
   *  it has none) must not be, after Audit.tidy, any fence in that box's own _solutions.md section. */
  private static void workedSolutions(List<String> problems, Volume v, Map<String, Box> boxes) throws BuildError {
    if (v.solutions() == null) return;
    for (var s : Vocabulary.solutions(v.solutions()).entrySet()) {
      Box b = boxes.get(s.getKey());
      if (b == null) continue; // Vocabulary.check reports a section for no such box
      Object starter = v.checks().get(b.id()) instanceof Map<?, ?> m ? m.get("starter") : null;
      String shown = Audit.tidy(starter instanceof String t ? t : b.source());
      for (String fence : s.getValue()) {
        if (Audit.tidy(fence).equals(shown)) {
          problems.add(b.id() + ": the page would publish the worked solution; give its check a \"starter\"");
          break;
        }
      }
    }
  }

  private static boolean isStrings(Object o) {
    if (!(o instanceof List<?> l)) return false;
    for (Object x : l) if (!(x instanceof String)) return false;
    return true;
  }
}
