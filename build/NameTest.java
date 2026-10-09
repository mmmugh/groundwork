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
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Keeps the course's old name from coming back (D77). git grep lists every file, tracked or untracked and not ignored,
 * that carries the old name in any of its forms; the list must be exactly HISTORICAL (records that keep the name) plus
 * PENDING. PENDING held the release inputs and two URL lines while later tasks renamed them, each task removing what it
 * renamed; Tasks 6 and 7 emptied it, and it must stay empty.
 */
final class NameTest {
  // The pattern is built from pieces so that this file does not match it.
  static final String PATTERN = "java" + "[ _-]?" + "foundations" + "|" + "java" + "found";

  // DECISIONS.md is a historical record too: it records the rename itself (D77) and keeps the old name where a decision
  // used it.
  static final List<String> HISTORICAL = List.of("docs/superpowers/plans/**", "DECISIONS.md");

  static final Set<String> PENDING = Set.of();

  static boolean historical(String path) {
    return path.startsWith("docs/superpowers/plans/") || path.equals("DECISIONS.md");
  }

  /** The files git grep reports, run from the repository root; a git error or a bad pattern fails the test. */
  static Set<String> hits(String pattern) throws Exception {
    Path root = Path.of("").toAbsolutePath();
    Process p = new ProcessBuilder("git", "grep", "-I", "-l", "-i", "--untracked", "-E", pattern)
        .directory(root.toFile()).redirectErrorStream(true).start();
    String out = new String(p.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
    int exit = p.waitFor();
    T.eq(0, exit, "git grep finds the old name somewhere (exit 1 means no hits, 2 means an error): " + out);
    return new TreeSet<>(Arrays.asList(out.split("\n")));
  }

  static void testTheOldNameAppearsOnlyWhereItIsAllowed() throws Exception {
    T.check(PENDING.isEmpty(), "every release input is renamed, so NameTest.PENDING must stay empty: " + PENDING);
    Set<String> hits = hits(PATTERN);
    T.check(hits.contains("docs/superpowers/plans/2026-09-27-roadmap.md"),
        "the search works: the roadmap, a historical record, is found");
    List<String> unexpected = new ArrayList<>(), stale = new ArrayList<>();
    for (String h : hits) if (!historical(h) && !PENDING.contains(h)) unexpected.add(h);
    for (String f : PENDING) if (!hits.contains(f)) stale.add(f);
    T.check(unexpected.isEmpty(), "files carry the old name outside the historical records and PENDING: " + unexpected);
    T.check(stale.isEmpty(), "PENDING files no longer carry the old name (remove them from NameTest.PENDING): " + stale);
  }

  static void testTheNamesThatStayDoNotMatch() {
    Pattern p = Pattern.compile(PATTERN, Pattern.CASE_INSENSITIVE);
    T.check(!p.matcher("the Java counterpart to Python Foundations").find(), "Python Foundations is not the old name");
    T.check(!p.matcher("package foundations.scratchpad;").find(), "the package foundations.scratchpad is not the old name");
    T.check(p.matcher("Copyright 2026 " + "Java" + " Foundations contributors.").find(), "the old name, spaced, matches");
    T.check(p.matcher("mmmugh/" + "java" + "-foundations").find(), "the old name, hyphenated, matches");
  }
  /** The underscore form (an identifier) and the run-together form (a repository slug) are what the other two lines do not
   *  cover; the second can match only through the pattern's "java" + "found" alternative. */
  static void testTheUnderscoredAndRunTogetherFormsMatch() {
    Pattern p = Pattern.compile(PATTERN, Pattern.CASE_INSENSITIVE);
    T.check(p.matcher("java" + "_" + "foundations").find(), "the old name, underscored, matches");
    T.check(p.matcher("java" + "found" + "ation").find(), "the old name, run together, matches");
  }

  /**
   * The author chose that the published tree name the author only in the byline (DESIGN.md) and in D25 (DECISIONS.md).
   * Plans written later must say "the author". Tracked files only.
   * Either name is matched at the start of a word, so a handle, a slug or an email address that begins with it is found
   * too, while a word that only holds the first name's letters inside it is not. Both names are built from pieces, so
   * this file names neither, and the two bylines are known by what follows the name.
   */
  static void testTheAuthorsNameAppearsOnlyInTheTwoBylines() throws Exception {
    String names = "\\b(jus" + "tin|ste" + "wart)";
    Path root = Path.of("").toAbsolutePath();
    Process p = new ProcessBuilder("git", "grep", "-I", "-n", "-i", "-P", names)
        .directory(root.toFile()).redirectErrorStream(true).start();
    String out = new String(p.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
    int exit = p.waitFor();
    T.check(exit == 0 || exit == 1, "git grep ran (exit 2 means an error): " + out);
    List<String> stray = new ArrayList<>();
    boolean design = false, decisions = false;
    for (String line : out.split("\n")) {
      if (line.isEmpty()) continue;
      if (line.contains("\u2014built with Claude")) {
        if (line.startsWith("DESIGN.md:")) design = true;
        else if (line.startsWith("DECISIONS.md:")) decisions = true;
        else stray.add(line);
      } else stray.add(line);
    }
    T.check(design, "the search works: DESIGN.md's byline is found");
    T.check(decisions, "the search works: DECISIONS.md's D25 byline is found");
    T.check(stray.isEmpty(), "the author's name appears outside the two byline lines (write \"the author\"): " + stray);
  }
}
