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

final class ForkGateTest {
  static Path examples(String name, String json) throws Exception {
    Path f = Fixtures.TOOLS.resolve("build/.work/tests/" + name + ".json");
    Files.createDirectories(f.getParent());
    Files.writeString(f, json);
    return f;
  }
  static final Path DIST = Fixtures.DIST;
  static void testTheFixtureAgreesOnBothRuntimes() throws Exception {
    var r = Fixtures.build(Fixtures.project("fork"), "--check", "--runtime", DIST.toString());
    T.eq(0, r.exit(), "full --check including the fork gate: " + r.out());
    T.check(r.out().contains("examples, 0 differing"), r.out());
  }
  static void testNoForkGateFlagSkipsTheForkGateEntirely() throws Exception {
    Path p = Fixtures.project("fork-skip");
    var r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests", "--runtime", DIST.toString());
    T.eq(0, r.exit(), "the audit and vocabulary gates still pass without the fork gate: " + r.out());
    T.check(!r.out().contains("examples,"), "no fork-gate summary line printed: " + r.out());
    T.check(!Files.exists(p.resolve("build/.work/examples.json")), "examples.json never written when the flag is set");
  }
  /** The variant built without patch 0009 (runtime/build.sh --negatives on the Mac; java build/Build.java --fetch-variant
   *  on CI, from the CI-only release of W-14). */
  static final Path VARIANT = Fixtures.TOOLS.resolve("runtime/.work/variants/fork-no-0009");
  static final String HOW_TO_GET_IT = "run `bash runtime/build.sh --negatives` (the Mac) or `java build/Build.java --fetch-variant` (CI)";
  static final String FORK_RAN = "fork {\"status\":\"ok\"";
  static final String EXCEPTION_MESSAGE_EXAMPLE = """
      [{"id": "x#1", "src": "void main() { try { Integer.parseInt(\\"12a\\"); } catch (NumberFormatException e) { IO.println(e.getMessage()); } }", "stdin": "", "varies": false}]
      """;
  /** A variant counts only if its six files are there and its manifest says it is this tree's series without patch 0009,
   *  each patch the very file now in runtime/patches/: runtime/test/negatives.mjs's rule, so a variant left over from
   *  before any patch changed fails here too. Null when it counts, else what is wrong. */
  static String variantProblem(Path dir) throws Exception {
    if (!Files.isDirectory(dir)) return "no such variant (" + dir.getFileName() + "): " + HOW_TO_GET_IT;
    var missing = RuntimeFiles.NAMES.stream().filter(n -> !Files.isRegularFile(dir.resolve(n))).toList();
    if (!missing.isEmpty()) return "the variant " + dir.getFileName() + " is missing " + String.join(", ", missing) + ": " + HOW_TO_GET_IT;
    if (!Files.isRegularFile(dir.resolve("manifest.json"))) return "the variant " + dir.getFileName() + " has no manifest.json: " + HOW_TO_GET_IT;
    @SuppressWarnings("unchecked")
    var m = (Map<String, Object>) Json.parse(Files.readString(dir.resolve("manifest.json")));
    List<String> teavm = new ArrayList<>(), javac = new ArrayList<>();
    try (var s = Files.list(Fixtures.TOOLS.resolve("runtime/patches"))) {
      for (String f : s.map(p -> p.getFileName().toString()).sorted().toList()) {
        var t = java.util.regex.Pattern.compile("teavm-(0\\d{3})-.*\\.patch").matcher(f);
        var j = java.util.regex.Pattern.compile("teavm-javac-(01\\d{2})-.*\\.patch").matcher(f);
        if (t.matches() && !t.group(1).equals("0009")) teavm.add(t.group(1));
        if (j.matches()) javac.add(j.group(1));
      }
    }
    if (!"fork-no-0009".equals(m.get("variant"))) return "the variant's manifest.json names variant " + m.get("variant") + ", not fork-no-0009: " + HOW_TO_GET_IT;
    if (!teavm.equals(m.get("teavm_patches")) || !javac.equals(m.get("teavm_javac_patches")))
      return "the variant is stale: it was built from teavm " + m.get("teavm_patches") + " teavm-javac " + m.get("teavm_javac_patches")
          + ", not this tree's series without 0009 (teavm " + teavm + " teavm-javac " + javac + "): " + HOW_TO_GET_IT;
    if (!(m.get("patches_sha256") instanceof Map<?, ?> hashes)) return "the variant's manifest.json records no patch hashes: " + HOW_TO_GET_IT;
    for (var e : hashes.entrySet()) {
      Path patch = Fixtures.TOOLS.resolve("runtime/" + e.getKey());
      if (!Files.isRegularFile(patch) || !RuntimeFiles.sha256(patch).equals(e.getValue()))
        return "the variant is stale: " + e.getKey() + " is not the file it was built with: " + HOW_TO_GET_IT;
    }
    return null;
  }
  /** Null when the variant is the right build and the 0009 example gives the one problem, from a program that ran
   *  (`fork {"status":"ok"`) and printed the wrong message: a variant that cannot run anything differs from the JDK
   *  too, and would otherwise pass for the very difference this check exists to see [B15]. */
  static String variantVerdict(Path dir) throws Exception {
    String bad = variantProblem(dir);
    if (bad != null) return bad;
    var probs = ForkGate.run(Fixtures.TOOLS, examples("fork-0009", EXCEPTION_MESSAGE_EXAMPLE), dir);
    if (probs.size() != 1) return "the variant gave " + probs.size() + " problems, not the one difference: " + probs;
    if (!probs.get(0).contains(FORK_RAN)) return "the variant did not run the program (its fork line lacks " + FORK_RAN + "): " + probs.get(0);
    if (!probs.get(0).contains("x#1")) return "the variant's problem does not name x#1: " + probs.get(0);
    return null;
  }
  static void testAnExceptionMessageDifferenceIsCaughtWithoutPatch0009() throws Exception {
    Path f = examples("fork-0009", EXCEPTION_MESSAGE_EXAMPLE);
    T.eq(List.of(), ForkGate.run(Fixtures.TOOLS, f, DIST), "the released fork agrees");
    T.eq(null, variantVerdict(VARIANT), "the build without patch 0009 is there, current, runs, and disagrees with the JDK");
  }
  static Path variantCopy(String name) throws Exception {
    Path c = Fixtures.TOOLS.resolve("build/.work/tests/" + name);
    Fixtures.deleteTree(c);
    Fixtures.copyTree(VARIANT, c);
    return c;
  }
  static void testAMissingVariantFailsNamingIt() throws Exception {
    String v = variantVerdict(Fixtures.TOOLS.resolve("build/.work/tests/no-such-variant"));
    T.check(v != null && v.contains("no such variant (no-such-variant)") && v.contains("--fetch-variant"), "a missing variant fails, saying how to get one: " + v);
    Path partial = variantCopy("fork-variant-partial");
    Files.delete(partial.resolve("compiler.wasm"));
    v = variantVerdict(partial);
    T.check(v != null && v.contains("missing compiler.wasm"), "a variant missing a file fails naming it: " + v);
  }
  static void testAStaleVariantFailsNamingIt() throws Exception {
    Path stale = variantCopy("fork-variant-stale");
    Files.writeString(stale.resolve("manifest.json"), Files.readString(stale.resolve("manifest.json")).replace("\"0008\"", "\"0099\""));
    String v = variantVerdict(stale);
    T.check(v != null && v.contains("the variant is stale") && v.contains("0099"), "a manifest naming another patch list fails as stale: " + v);
    Path edited = variantCopy("fork-variant-edited");
    String m = Files.readString(edited.resolve("manifest.json"));
    var h = java.util.regex.Pattern.compile("(teavm-0001-[^\"]*\": \")([0-9a-f]{64})").matcher(m);
    T.check(h.find(), "the manifest records patch 0001's hash");
    Files.writeString(edited.resolve("manifest.json"), m.substring(0, h.start(2)) + "0".repeat(64) + m.substring(h.end(2)));
    v = variantVerdict(edited);
    T.check(v != null && v.contains("teavm-0001") && v.contains("not the file it was built with"), "a patch that changed since the build makes it stale: " + v);
  }
  static void testABrokenVariantFailsBecauseItsProgramNeverRan() throws Exception {
    Path broken = variantCopy("fork-variant-broken");
    byte[] wasm = Files.readAllBytes(broken.resolve("compiler.wasm"));
    Files.write(broken.resolve("compiler.wasm"), Arrays.copyOf(wasm, wasm.length / 2));
    T.eq(null, variantProblem(broken), "its files and manifest look right, so only running it can tell");
    String v = variantVerdict(broken);
    T.check(v != null && v.contains("did not run the program") && v.contains(FORK_RAN), "a truncated compiler.wasm fails because the fork line shows no program ran: " + v);
  }
  static void testABoxThatHangsOnBothRuntimesIsNotReportedAsADisagreement() throws Exception {
    // A box that genuinely hangs on both sides (the fork's 10 s deadline inside examples.mjs, then jdk.mjs's
    // 30 s spawnSync timeout) must fold to "did-not-finish" on both sides and NOT be reported as a fork/JDK
    // disagreement. This is the fold's actual protection scenario; it runs both timeouts for real (~40 s).
    Path f = examples("fork-hang", """
        [{"id": "h#1", "src": "void main() { while (true) {} }", "stdin": "", "varies": false}]
        """);
    T.eq(List.of(), ForkGate.run(Fixtures.TOOLS, f, DIST), "a box that hangs on both runtimes is silently folded, not reported as a disagreement");
  }
  static void testVariesComparesOnlyTheStatus() throws Exception {
    Path f = examples("fork-varies", """
        [{"id": "v#1", "src": "void main() { IO.println(java.util.Set.of(\\"a\\", \\"b\\", \\"c\\", \\"d\\", \\"e\\", \\"f\\")); }", "stdin": "", "varies": true}]
        """);
    T.eq(List.of(), ForkGate.run(Fixtures.TOOLS, f, DIST), "a varies example passes whatever order each side prints");
  }
  static void testAnEmptyExampleListIsAFailure() throws Exception {
    T.check(!ForkGate.run(Fixtures.TOOLS, examples("fork-empty", "[]"), DIST).isEmpty(), "zero examples is not a pass");
  }
  static void testMissingOrOldNodeFailsNeverSkips() {
    T.eq(null, ForkGate.checkNodeVersion("v25.9.0"), "25 or later passes");
    T.eq(null, ForkGate.checkNodeVersion("v25.0.0"), "exactly 25 passes");
    T.check(ForkGate.checkNodeVersion("v24.4.1").contains("the fork gate needs Node 25 or later (D-P2-1)"), "below 25 fails, worded per D-P2-1");
    T.check(ForkGate.checkNodeVersion("not a version").contains("the fork gate needs Node 25 or later (D-P2-1)"), "unparseable output fails the same way, never silently passes");
  }
  static final String DOWN = "int down(int n) {\n    return down(n + 1) + 1;\n}\n\nvoid main() {\n    IO.println(down(0));\n}\n";
  /** One example as Build.java writes it, raises included (null when the box declares none). */
  static Path example(String name, String src, String raises) throws Exception {
    Map<String, Object> e = new LinkedHashMap<>();
    e.put("id", "s#1");
    e.put("src", src);
    e.put("stdin", "");
    e.put("varies", false);
    e.put("raises", raises);
    return examples(name, Json.write(List.of(e)));
  }
  /** DESIGN section 2: chapter 12's runaway recursion crashes on purpose. The fork reports the overflow with the JDK's
   *  first line alone (runtime/runner/java-line.js); the JDK prints up to 1,024 frames below it. Declared, the box is
   *  compared without frames; undeclared, frame by frame as before; and a program that catches the overflow, which
   *  the JDK can and the fork cannot, disagrees either way (DESIGN section 2: the differential gate enforces that no
   *  example tries). */
  static void testADeclaredRunawayRecursionIsComparedWithoutItsFrames() throws Exception {
    String overflow = "java.lang.StackOverflowError";
    T.eq(List.of(), ForkGate.run(Fixtures.TOOLS, example("fork-overflow", DOWN, overflow), DIST),
        "declared, it agrees: the same status, stdout and first line");
    var undeclared = ForkGate.run(Fixtures.TOOLS, example("fork-overflow-undeclared", DOWN, null), DIST);
    T.check(undeclared.size() == 1 && undeclared.get(0).startsWith("s#1: the browser runtime and the JDK disagree")
        && undeclared.get(0).contains("Main.down(Main.java:2)"),
        "undeclared, the JDK's frames are compared, and the fork has none: " + undeclared);
    String caught = DOWN.replace("    IO.println(down(0));",
        "    try {\n        IO.println(down(0));\n    } catch (StackOverflowError e) {\n        IO.println(\"caught\");\n    }");
    var caughtProblems = ForkGate.run(Fixtures.TOOLS, example("fork-overflow-caught", caught, overflow), DIST);
    T.check(caughtProblems.size() == 1 && caughtProblems.get(0).startsWith("s#1: the browser runtime and the JDK disagree"),
        "a program that catches the overflow still disagrees: " + caughtProblems);
  }
  // --only hands the fork gate the named pages' examples alone, and the proof gate their checks alone. As Tasks 5 and 6
  // leave the fixture, chapter 2's page and its practice page hold seven of its ten non-reference boxes (5 + 2; chapter
  // 1 has the other 3), each one example, and one of its two checks, ch02-types-and-input#4, with 5 answers (2 worked
  // solutions, its own fence, 1 mistake and its published code; chapter 1's check has 2, 1, 2 and 1). Pages with none to
  // run (the front matter) skip the gate and say so, where a plain --check with none fails
  // (testAnEmptyExampleListIsAFailure): a page with nothing to run is not a pass of the course.
  static void testTheOnlyFlagGivesTheForkGateTheNamedPagesExamplesAlone() throws Exception {
    var r = Fixtures.build(Fixtures.project("fork-only"), "--check", "--runtime", DIST.toString(), "--only", "ch02");
    T.eq(0, r.exit(), r.out());
    T.check(r.out().contains("7 examples, 0 differing"), "chapter 2's seven examples, not the fixture's ten: " + r.out());
    T.check(r.out().contains("1 checks, 5 answers judged, 0 wrong verdict(s)"), "and its one check, not the fixture's two: " + r.out());
    T.check(java.util.regex.Pattern.compile("fork gate \\d+\\.\\d s, proofs \\d+\\.\\d s; all gates").matcher(r.out()).find(),
        "and the fork gate's and the proof's times: " + r.out());
    r = Fixtures.build(Fixtures.project("fork-only-none"), "--check", "--runtime", DIST.toString(), "--only", "00-front-matter");
    T.eq(0, r.exit(), r.out());
    T.check(r.out().contains("  fork gate: no example on the page(s) --only 00-front-matter selects"), r.out());
  }
}
