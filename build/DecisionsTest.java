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
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.regex.*;

/**
 * Holds every decision number the published tree cites to DECISIONS.md (D104). The code, tests, CI and docs cite
 * decisions as D1-D110 and J1-J3; a contributor must be able to look each one up, and a later commit that cites a new
 * number without recording it would quietly break that. R-numbers are not collected: the jshell front end's derivation
 * log uses the same shape for its own rules, and R1-R4 are in DECISIONS.md so that build/Jdk.java's "(R2)" resolves by
 * reading. DECISIONS.md is also held to its scrub: no verbatim quote of the author and no pointer at the private
 * working notes (D95). And a commit a patch header names, which is a commit of the private history (D96), is named in
 * docs/clean-room-records.md, which copies its clean-room record.
 */
final class DecisionsTest {
  static final Path FILE = Path.of("DECISIONS.md");

  /** Tokens of the decision shape that are not decision citations, each with its reason. Empty today. */
  static final Map<String, String> EXCEPTIONS = Map.of();

  /** What a scrubbed DECISIONS.md never holds. Built from pieces, so that neither the leak hook nor any scan of the
   *  published tree matches this file itself. */
  static final Map<String, Pattern> PRIVATE = new LinkedHashMap<>();
  static {
    PRIVATE.put("a verbatim quote of the author",
        Pattern.compile("(?i)\\b(the author|jus" + "tin)\\b[^.\\n]{0,40}(:|said|wrote|asked)\\s*[\"\u201c]"));
    PRIVATE.put("a notes folder", Pattern.compile("~/[A-Za-z_]+" + "-notes"));
    PRIVATE.put("the Claude Code folder", Pattern.compile("\\.cla" + "ude/"));
    PRIVATE.put("a session id", Pattern.compile("sess" + "ion_[0-9A-Za-z]"));
    PRIVATE.put("a home folder's encoded name", Pattern.compile("-Us" + "ers-"));
    PRIVATE.put("a home path", Pattern.compile("/Us" + "ers/"));
    PRIVATE.put("a worksheet's file name", Pattern.compile("WORK" + "SHEET-"));
    PRIVATE.put("a checkpoint of the working notes", Pattern.compile("check" + "point [0-9]"));
  }

  /** The numbers DECISIONS.md records: every line `- D<n> `, `- J<n> ` or `- R<n> `. */
  static Set<String> entries() throws Exception {
    Set<String> out = new TreeSet<>();
    Matcher m = Pattern.compile("(?m)^- ([DJR]\\d+) ").matcher(Files.readString(FILE));
    while (m.find()) out.add(m.group(1));
    return out;
  }

  /** Every D- and J-number cited in a tracked file. */
  static List<String> cited() throws Exception {
    Process p = new ProcessBuilder("git", "grep", "-I", "-o", "-h", "-P", "\\b[DJ]\\d{1,3}\\b")
        .redirectErrorStream(true).start();
    String out = new String(p.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
    T.eq(0, p.waitFor(), "git grep finds decision citations (exit 1 means none, 2 an error): " + out);
    return Arrays.asList(out.split("\n"));
  }

  static void testEveryCitedDecisionIsRecorded() throws Exception {
    Set<String> recorded = entries();
    T.check(recorded.size() > 100, "DECISIONS.md records the decisions: " + recorded.size() + " entries");
    List<String> cites = cited();
    Set<String> missing = new TreeSet<>();
    for (String c : cites) if (!recorded.contains(c) && !EXCEPTIONS.containsKey(c)) missing.add(c);
    T.check(missing.isEmpty(), "cited in the tree but not recorded in DECISIONS.md: " + missing);
    System.out.println("  info  " + cites.size() + " citations of " + new TreeSet<>(cites).size() + " decision numbers resolve in "
        + "DECISIONS.md; " + EXCEPTIONS.size() + " exception(s)");
  }

  static void testDecisionsHoldsNoQuoteAndNoPrivatePlace() throws Exception {
    List<String> lines = Files.readAllLines(FILE), found = new ArrayList<>();
    for (int i = 0; i < lines.size(); i++)
      for (var e : PRIVATE.entrySet())
        if (e.getValue().matcher(lines.get(i)).find()) found.add("DECISIONS.md:" + (i + 1) + " holds " + e.getKey());
    T.check(found.isEmpty(), "DECISIONS.md must hold no verbatim quote and no private place (D95, D104): " + found);
  }

  /** The upstream commits the patches apply to: TeaVM 0.13.1 and teavm-javac's master. Every other commit a patch
   *  header names is of the private history (D96), so it resolves only through docs/clean-room-records.md. */
  static final Set<String> UPSTREAM = Set.of("b3a245b7", "2ddcf02e");

  static void testEveryCommitAPatchHeaderNamesIsInTheCleanRoomRecords() throws Exception {
    String records = Files.readString(Path.of("docs/clean-room-records.md"));
    Pattern hash = Pattern.compile("(?<![0-9A-Za-z])(?:[0-9a-f]{7,8}|(?=[0-9a-f]*[a-f])[0-9a-f]{9,40})(?![0-9A-Za-z])");
    Set<String> named = new TreeSet<>(), unrecorded = new TreeSet<>();
    try (var s = Files.list(Path.of("runtime/patches"))) {
      for (Path f : s.filter(x -> x.toString().endsWith(".patch")).toList())
        for (String line : Files.readAllLines(f))
          if (line.startsWith("#"))
            for (Matcher m = hash.matcher(line); m.find(); named.add(m.group()))
              if (!UPSTREAM.contains(m.group()) && !records.contains(m.group())) unrecorded.add(f.getFileName() + ": " + m.group());
    }
    T.check(named.containsAll(UPSTREAM), "the search works: the upstream pins are found in the headers: " + named);
    T.check(unrecorded.isEmpty(), "a patch header names a private commit that docs/clean-room-records.md does not: " + unrecorded);
  }

  /** The two checks above must see what they are for: a missing entry and each private shape. */
  static void testTheChecksSeeWhatTheyAreFor() {
    T.check(PRIVATE.get("a verbatim quote of the author").matcher("Jus" + "tin: \"test\"").find(), "a quote matches");
    // The scrub wrote "the author" for the name, so a quote that survives it, or is added later, has this shape.
    T.check(PRIVATE.get("a verbatim quote of the author").matcher("the author: \"x\"").find(), "a scrubbed quote matches");
    T.check(PRIVATE.get("a verbatim quote of the author").matcher("the author said \"x\"").find(), "and its said form");
    T.check(PRIVATE.get("a notes folder").matcher("~/groundwork" + "-notes/x.md").find(), "a notes path matches");
    T.check(!PRIVATE.get("a notes folder").matcher("build/.work/notes").find(), "a build path does not");
  }
}
