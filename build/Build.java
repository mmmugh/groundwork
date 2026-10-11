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
import java.io.PrintStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Predicate;

/** Turns volumes/ into site/. Run with `java build/Build.java` (add --check to also run every box; --check --only chNN
 *  runs every gate on chapter NN's pages and quiz alone). */
public class Build {
  public static void main(String[] args) {
    Path cwd = Path.of("").toAbsolutePath();
    if (!Files.exists(cwd.resolve("build/Build.java"))) {
      System.out.println("build: run from the repository root");
      System.exit(2);
      return;
    }
    List<String> rest = List.of(args);
    Path project = cwd;
    if (rest.size() >= 1 && rest.get(0).equals("--project")) {
      if (rest.size() < 2) { System.out.println(usage()); System.exit(2); return; }
      project = cwd.resolve(rest.get(1)).normalize();
      if (!Files.isDirectory(project)) {
        System.out.println("no such project directory: " + rest.get(1));
        System.exit(2);
        return;
      }
      rest = rest.subList(2, rest.size());
    }
    System.exit(run(cwd, project, rest, System.out));
  }

  /** Runs the build. tools is the repository this launched from; project is the volumes/site root
   *  (the same directory in production, separate in tests). Returns the process exit code. */
  static int run(Path tools, Path project, List<String> args, PrintStream out) {
    String runtimeDir = null;
    String scratchpadDir = null;
    String onlyName = null;
    boolean check = false;
    boolean noForkGate = false;
    boolean fetchOnly = false;
    boolean fetchVariant = false;
    for (int i = 0; i < args.size(); i++) {
      String a = args.get(i);
      if (a.equals("--check")) {
        check = true;
      } else if (a.equals("--only")) {
        if (i + 1 >= args.size()) { out.println(usage()); return 2; }
        onlyName = args.get(++i);
      } else if (a.equals("--runtime")) {
        if (i + 1 >= args.size()) { out.println(usage()); return 2; }
        runtimeDir = args.get(++i);
      } else if (a.equals("--scratchpad")) {
        if (i + 1 >= args.size()) { out.println(usage()); return 2; }
        scratchpadDir = args.get(++i);
      } else if (a.equals("--fetch-runtime")) {
        fetchOnly = true;
      } else if (a.equals("--fetch-variant")) {
        fetchVariant = true;
      } else if (a.equals("--no-fork-gate-for-tests")) {
        // Skips the two gates that run under Node, the fork gate and the proof gate. Accepted only from the build's own
        // tests (BuildTest.main sets jf.test); a real user gets exit 2.
        if (System.getProperty("jf.test") == null) { out.println(usage()); return 2; }
        noForkGate = true;
      } else {
        out.println(usage());
        return 2;
      }
    }
    if (onlyName != null && !check) {
      // --only narrows what the gates check; a build without --check runs no gate, so --only there would do nothing, silently.
      out.println("--only works only with --check: it names the pages every gate checks");
      out.println(usage());
      return 2;
    }
    try {
      if (fetchVariant) {
        out.println(fetchVariant(tools));
        return 0;
      }
      if (fetchOnly) {
        if (!Files.isRegularFile(tools.resolve("runtime/release-url.txt")))
          throw new BuildError("no runtime/release-url.txt to fetch the runtime from");
        out.println(fetchRuntime(tools));
        return 0;
      }
      List<Volume> volumes = Volume.loadAll(project.resolve("volumes"));
      Path runtimeSource = resolveRuntimeSource(tools, runtimeDir);
      Path scratchpadSource = resolveScratchpadSource(tools, scratchpadDir);
      Map<Volume, Map<Page, List<Box>>> boxesByVolume = new LinkedHashMap<>();
      Map<Page, List<Box>> allBoxes = new LinkedHashMap<>();
      for (Volume v : volumes) {
        Map<Page, List<Box>> pageBoxes = new LinkedHashMap<>();
        for (Page p : v.pages()) pageBoxes.put(p, Boxes.of(v, p));
        Boxes.validate(v, pageBoxes);
        boxesByVolume.put(v, pageBoxes);
        allBoxes.putAll(pageBoxes);
      }
      Predicate<Page> only = selection(onlyName);
      if (onlyName != null && allBoxes.keySet().stream().noneMatch(only))
        throw new BuildError("--only " + onlyName + ": no page is named " + onlyName + " or starts " + onlyName + "-");
      Path site = project.resolve("site");
      Publish.guard(site); // what is there now: private content or a symlink refuses the build, and nothing is deleted
      Publish.empty(site); // then site/ holds only what this build writes
      Pages.writeSite(volumes, boxesByVolume, project);
      RuntimeFiles.install(project, runtimeSource, site);
      ScratchpadFiles.install(project, scratchpadSource, site);
      Pages.copyScripts(tools, project, site);
      for (Volume v : volumes) Publish.copyQuizzes(v, site);
      Bundle.write(volumes, boxesByVolume, project);
      try {
        Publish.guard(site);
      } catch (BuildError e) {
        // All of site/ is this build's own output (the first guard passed, then empty ran): emptied, nothing private is left
        // to serve, and the next build, its source fixed, is not refused by this copy (D98).
        Publish.empty(site);
        throw e;
      }
      for (Volume v : volumes) out.println(v.slug() + ": " + v.pages().size() + " pages");
      if (check) {
        if (volumes.isEmpty()) {
          // Short-circuits before Jdk.checkPinned() or any gate: a gate with nothing to check would
          // otherwise pass vacuously (the audit, the vocabulary gate) or fail for the wrong reason (the fork
          // gate: an empty examples.json is deliberately a failure). This skips only the
          // audit/vocabulary/fork-gate machinery—Publish.guard has already run above, unconditionally, on
          // both a plain build and --check, exactly like the global constraint requires.
          out.println("no volumes");
          return 0;
        }
        Jdk.checkPinned();
        // Each gate's time, for the line --check ends with: the Pages job's 30 minutes (.github/workflows/pages.yml) must
        // hold its setup and every gate, so the plan watches these as chapters arrive.
        Map<String, Long> times = new LinkedHashMap<>();
        long start = System.nanoTime(), t = start;
        List<String> problems = Audit.check(volumes, allBoxes, only);
        t = lap(times, "audit", t);
        for (Volume v : volumes) problems.addAll(Vocabulary.check(v, boxesByVolume.get(v), only));
        // DESIGN section 3: what each check's three-way proof needs, and whether _solutions.md gives it, needs no
        // runtime; the proof itself runs below, after the fork gate. Like the vocabulary gate it reads _solutions.md and
        // runs nothing, so its time is the vocabulary gate's.
        List<Object> proofs = new ArrayList<>();
        for (Volume v : volumes) proofs.addAll(Proofs.of(v, boxesByVolume.get(v), problems, only));
        t = lap(times, "vocabulary", t);
        int quizQuestions = 0;
        for (Volume v : volumes) {
          Quizzes.Checked quizzes = Quizzes.check(v, only);
          quizQuestions += quizzes.questions();
          problems.addAll(quizzes.problems());
        }
        t = lap(times, "quizzes", t);
        long checked = 0, stated = 0;
        for (Volume v : volumes) {
          for (Page p : v.pages()) {
            if (!only.test(p)) continue;
            long n = allBoxes.get(p).stream().filter(b -> !b.decl().reference()).count();
            out.println("  " + p.slug() + ": " + n + " boxes checked");
            checked += n;
            stated += allBoxes.get(p).stream().filter(Audit::statesComparedOutput).count();
          }
        }
        out.println("  quizzes: " + quizQuestions + " questions run");
        int exampleCount = 0, differing = 0, wrongVerdicts = 0;
        if (!noForkGate) {
          List<Object> examples = examplesOf(boxesByVolume, only);
          exampleCount = examples.size();
          if (examples.isEmpty() && onlyName != null) {
            // A plain --check with no example fails in the fork gate (an empty examples.json is never a pass), but the
            // pages --only names may hold nothing to run (front matter), and then the gate has nothing to compare.
            out.println("  fork gate: no example on the page(s) --only " + onlyName + " selects");
          } else {
            Path examplesJson = project.resolve("build/.work/examples.json");
            writeJson(examplesJson, examples);
            List<String> forkProblems = ForkGate.run(tools, examplesJson, site.resolve("runtime"));
            differing = forkProblems.size();
            problems.addAll(forkProblems);
            t = lap(times, "fork gate", t);
          }
          // Every answer judged by the page's own check.js on both runtimes, for the checks on the pages only selects. A
          // volume or a selection with no check has nothing to prove, and runtime/test/proofs.mjs refuses an empty list.
          // Every checked box is an example (a check on a reference box is a build error), so a selection with no
          // example has no check either.
          if (!proofs.isEmpty()) {
            Path proofsJson = project.resolve("build/.work/proofs.json");
            writeJson(proofsJson, proofs);
            List<String> proofProblems = ForkGate.runProofs(tools, proofsJson, site.resolve("runtime"));
            wrongVerdicts = proofProblems.size();
            problems.addAll(proofProblems);
            t = lap(times, "proofs", t);
          }
        }
        for (String problem : problems) out.println("  !! " + problem);
        out.println(checked + " boxes checked, " + stated + " stated outputs compared, " + problems.size() + " problem(s)");
        if (!noForkGate) {
          out.println(exampleCount + " examples, " + differing + " differing");
          out.println(proofs.size() + " checks, " + Proofs.answers(proofs) + " answers judged, " + wrongVerdicts + " wrong verdict(s)");
        }
        out.println(gateTimes(times, System.nanoTime() - start));
        if (!problems.isEmpty()) return 1;
      }
      return 0;
    } catch (BuildError e) {
      out.println("build: " + e.getMessage());
      return 1;
    }
  }

  /** --runtime <dir>; else runtime/dist/fork under the tools root, if it exists; else runtime/release-url.txt
   *  fetched into build/.work/runtime/; else a BuildError naming all three options. */
  private static Path resolveRuntimeSource(Path tools, String runtimeDir) throws BuildError {
    if (runtimeDir != null) return Path.of(runtimeDir);
    Path dist = tools.resolve("runtime/dist/fork");
    if (Files.isDirectory(dist)) return dist;
    if (Files.isRegularFile(tools.resolve("runtime/release-url.txt"))) {
      try {
        return fetchRuntime(tools);
      } catch (BuildError e) {
        // A fresh clone has no runtime/dist/fork, and the release runtime/release-url.txt names may not be published yet (P-3).
        // A cached file that was changed is a different failure: nothing was fetched, and the hint would misdirect.
        if (e.getMessage().contains("has been changed")) throw e;
        throw new BuildError(e.getMessage() + "\n(this build fetches the runtime from the release runtime/release-url.txt names;"
            + " if that release is not published, run runtime/build.sh to build the runtime, or pass --runtime <dir>)");
      }
    }
    throw new BuildError("no runtime: run runtime/build.sh, pass --runtime <dir>, or add runtime/release-url.txt");
  }

  /** Fetches the boxes' six files from the base URL in runtime/release-url.txt into build/.work/runtime/ (only what is
   *  missing; every file is checked against runtime/CHECKSUMS before it is kept) and returns that directory. */
  private static Path fetchRuntime(Path tools) throws BuildError {
    Path release = tools.resolve("runtime/release-url.txt");
    Path cache = tools.resolve("build/.work/runtime");
    RuntimeFiles.fetch(RuntimeFiles.baseUrl(release), cache, RuntimeFiles.sums(tools.resolve("runtime/CHECKSUMS")));
    return cache;
  }

  /** --fetch-variant: the CI-only build without patch 0009 (W-14), found through runtime/variants/fork-no-0009/release-url.txt,
   *  its seven files fetched into runtime/.work/variants/fork-no-0009/ (only what is missing; each checked against
   *  runtime/variants/fork-no-0009/CHECKSUMS before it is kept) and that directory returned. */
  private static Path fetchVariant(Path tools) throws BuildError {
    Path dir = tools.resolve("runtime/variants/fork-no-0009");
    Path release = dir.resolve("release-url.txt");
    if (!Files.isRegularFile(release)) throw new BuildError("no runtime/variants/fork-no-0009/release-url.txt to fetch the variant from");
    Path cache = tools.resolve("runtime/.work/variants/fork-no-0009");
    RuntimeFiles.fetch(RuntimeFiles.baseUrl(release), cache, RuntimeFiles.sums(dir.resolve("CHECKSUMS"), RuntimeFiles.VARIANT_NAMES),
        "runtime/variants/fork-no-0009/CHECKSUMS");
    return cache;
  }

  /** --scratchpad <dir>; else runtime/.work/ristretto/current under the tools root (the release
   *  runtime/ristretto/package.sh made last), if it exists; else a BuildError saying how to make one. */
  static Path resolveScratchpadSource(Path tools, String scratchpadDir) throws BuildError {
    if (scratchpadDir != null) return Path.of(scratchpadDir);
    Path current = tools.resolve("runtime/.work/ristretto/current");
    if (Files.isDirectory(current)) return current;
    throw new BuildError("no scratchpad: run runtime/ristretto/fetch-release.sh, which fetches the release"
        + " runtime/ristretto/release-url.txt names; or build one: runtime/ristretto/fetch.sh, then"
        + " runtime/ristretto/package.sh scratchpad-YYYY.MM.DD-N; or pass --scratchpad <dir>");
  }

  private static String usage() {
    return "usage: java build/Build.java [--project <dir>] [--check [--only <page>]] [--runtime <dir>] [--scratchpad <dir>] [--fetch-runtime | --fetch-variant]";
  }

  /** --only's choice of pages: with no name, every page; with a name, each page whose slug is that name or starts with it
   *  and a hyphen, so "ch03" is chapter 3's content page and its practice page (ch03-<slug>, ch03-<slug>-practice). */
  private static Predicate<Page> selection(String name) {
    if (name == null) return p -> true;
    return p -> p.slug().equals(name) || p.slug().startsWith(name + "-");
  }

  /** Records under gate the milliseconds since start, and returns now: where the next gate's time starts. */
  private static long lap(Map<String, Long> times, String gate, long start) {
    long now = System.nanoTime();
    times.put(gate, (now - start) / 1_000_000);
    return now;
  }

  /** The line --check ends with: "gate times: audit 1.2 s, vocabulary 0.4 s, quizzes 0.9 s, fork gate 8.0 s, proofs
   *  5.1 s; all gates 15.7 s", each gate's time in the order it ran, then all of them together. */
  private static String gateTimes(Map<String, Long> times, long totalNanos) {
    List<String> parts = new ArrayList<>();
    for (var e : times.entrySet()) parts.add(e.getKey() + " " + seconds(e.getValue()));
    return "gate times: " + String.join(", ", parts) + "; all gates " + seconds(totalNanos / 1_000_000);
  }

  private static String seconds(long millis) { return String.format(Locale.ROOT, "%.1f s", millis / 1000.0); }

  /** The fork gate's input: every non-reference box (compileError boxes included: both sides must fail to compile the
   *  same way) on a page only selects, as {id, src, stdin, varies, raises, solution}, in page order (raises lets
   *  runtime/test/examples.mjs leave a declared runaway recursion's frames out). Right after each box comes the first
   *  worked solution of its _solutions.md section, the one a reader may reveal and copy (I1), as "<box id> (worked
   *  solution)", run as the reader's run of it would be: with its input check's first run's answers, else the box's
   *  declared stdin, and with the box's varies and raises. No other gate runs it (the audit runs the box's own fence, the
   *  proof a checked box's answers alone), so it is marked solution, and examples.mjs holds it to running to its end or
   *  ending in the box's declared raises, as well as to both runtimes agreeing. */
  static List<Object> examplesOf(Map<Volume, Map<Page, List<Box>>> boxesByVolume, Predicate<Page> only) throws BuildError {
    List<Object> examples = new ArrayList<>();
    for (var vol : boxesByVolume.entrySet()) {
      Volume v = vol.getKey();
      Map<String, Vocabulary.Section> sections = v.solutions() == null ? Map.of() : Vocabulary.solutions(v.solutions());
      for (var e : vol.getValue().entrySet()) {
        if (!only.test(e.getKey())) continue;
        for (Box b : e.getValue()) {
          if (!b.decl().reference()) examples.add(example(b.id(), b.source(), b.decl().stdin(), b.decl(), false));
          Vocabulary.Section s = sections.get(b.id());
          if (s == null || s.worked().isEmpty()) continue;
          Checks.Check c = Checks.of(v, b);
          @SuppressWarnings("unchecked")
          List<String> typed = c != null && c.kind().equals("input") ? (List<String>) c.runs().get(0).get("typed") : b.decl().stdin();
          examples.add(example(b.id() + " (worked solution)", s.worked().get(0), typed, b.decl(), true));
        }
      }
    }
    return examples;
  }

  private static Map<String, Object> example(String id, String src, List<String> stdin, Decl d, boolean solution) {
    Map<String, Object> entry = new LinkedHashMap<>();
    entry.put("id", id);
    entry.put("src", src);
    entry.put("stdin", stdin.isEmpty() ? "" : String.join("\n", stdin) + "\n");
    entry.put("varies", d.varies());
    entry.put("raises", d.raises());
    entry.put("solution", solution);
    return entry;
  }

  private static void writeJson(Path file, Object value) throws BuildError {
    try {
      Files.createDirectories(file.getParent());
      Files.writeString(file, Json.write(value));
    } catch (IOException e) { throw new BuildError(file + ": " + e.getMessage()); }
  }
}
