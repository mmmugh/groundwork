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

/** The scratchpad reaches site/scratchpad/ only as runtime/ristretto/CHECKSUMS pins it: every listed byte verified,
 *  nothing unlisted, nothing stale, its legal files present (D53), and a manifest the page's client trusts. */
final class ScratchpadFilesTest {
  /** A copy of the fixture release, to change one thing in. */
  static Path release(String name) throws Exception {
    Path d = Fixtures.TOOLS.resolve("build/.work/tests/" + name);
    Fixtures.deleteTree(d);
    Fixtures.copyTree(Fixtures.SCRATCHPAD, d);
    return d;
  }
  /** Rewrites dir/CHECKSUMS from dir's files (except CHECKSUMS itself and any name in leaveOut), as package.sh does,
   *  and puts it into the project as runtime/ristretto/CHECKSUMS. */
  static void pin(Path dir, Path project, String... leaveOut) throws Exception {
    var lines = new ArrayList<String>();
    try (var s = Files.walk(dir)) {
      for (Path f : s.filter(Files::isRegularFile).sorted().toList()) {
        String n = dir.relativize(f).toString();
        if (n.equals("CHECKSUMS") || List.of(leaveOut).contains(n)) continue;
        lines.add(RuntimeFiles.sha256(f) + "  " + n);
      }
    }
    Files.writeString(dir.resolve("CHECKSUMS"), String.join("\n", lines) + "\n");
    Files.copy(dir.resolve("CHECKSUMS"), project.resolve("runtime/ristretto/CHECKSUMS"), StandardCopyOption.REPLACE_EXISTING);
  }
  @SuppressWarnings("unchecked")
  static Map<String, Object> manifest(Path project) throws Exception {
    return (Map<String, Object>) Json.parse(Files.readString(project.resolve("site/scratchpad/manifest.json")));
  }

  static void testThePinnedFilesArePublishedWithAManifestOfTheRuntimeFilesOnly() throws Exception {
    Path p = Fixtures.project("scratchpad");
    T.eq(0, Fixtures.build(p).exit(), "build");
    var sums = ScratchpadFiles.sums(p.resolve("runtime/ristretto/CHECKSUMS"));
    for (var e : sums.entrySet())
      T.eq(e.getValue(), RuntimeFiles.sha256(p.resolve("site/scratchpad/" + e.getKey())), e.getKey() + " published byte for byte");
    var m = manifest(p);
    @SuppressWarnings("unchecked") var files = (Map<String, Map<String, Object>>) m.get("files");
    // Only what the browser fetches: a NOTICE edit must not change the manifest. Its version changes exactly when a runtime
    // byte does; the client keys its cache entries by each file's own SHA-256, never by the version.
    // Named here, not taken from RUNTIME: the client downloads what the manifest lists, the course's jar among them.
    T.eq(new TreeSet<>(List.of("browser-jshell.jar", "jdk.zip", "runner.core.wasm", "runner.core2.wasm", "runner.core3.wasm", "worker.js")),
        new TreeSet<>(files.keySet()), "the manifest lists the six runtime files and nothing else");
    for (String n : ScratchpadFiles.RUNTIME) {
      T.eq(sums.get(n), files.get(n).get("sha256"), n + "'s manifest hash is CHECKSUMS's");
      T.eq(Files.size(p.resolve("site/scratchpad/" + n)), files.get(n).get("size"), n + "'s manifest size is the file's");
    }
    T.check(String.valueOf(m.get("version")).matches("[0-9a-f]{16}"), "version is 16 hex digits: " + m.get("version"));
  }
  static void testTheManifestVersionChangesWhenARuntimeByteDoesAndNotForANotice() throws Exception {
    Path p = Fixtures.project("scratchpad-version");
    T.eq(0, Fixtures.build(p).exit(), "build");
    Object v1 = manifest(p).get("version");
    Path r = release("scratchpad-version-notice");
    Files.writeString(r.resolve("NOTICE"), "a reworded notice\n");
    pin(r, p);
    T.eq(0, Fixtures.build(p, "--scratchpad", r.toString()).exit(), "build with a new NOTICE");
    T.eq(v1, manifest(p).get("version"), "a notice is not a byte the reader runs");
    Files.writeString(r.resolve("runner.core3.wasm"), "another interpreter glue\n");
    pin(r, p);
    T.eq(0, Fixtures.build(p, "--scratchpad", r.toString()).exit(), "build with a new runner.core3.wasm");
    T.check(!v1.equals(manifest(p).get("version")), "a new runtime byte is a new version: " + v1);
  }
  static void testOnlyListedFilesArePublished() throws Exception {
    Path r = release("scratchpad-extra");
    Files.writeString(r.resolve("index.html"), "<p>not ours to publish</p>\n");
    Files.writeString(r.resolve("_solutions.md"), "private\n");
    Files.writeString(r.resolve("CHECKSUMS"), "the release's own CHECKSUMS, which the build never reads\n");
    Path p = Fixtures.project("scratchpad-extra");
    T.eq(0, Fixtures.build(p, "--scratchpad", r.toString()).exit(), "a release directory holding more than CHECKSUMS lists still builds");
    T.check(!Files.exists(p.resolve("site/scratchpad/index.html")), "an unlisted file is not published");
    T.check(!Files.exists(p.resolve("site/scratchpad/_solutions.md")), "nor a private one");
    // W-12 (P-3): NOTICE says CHECKSUMS fixes each file's bytes, so it is published beside them, and it is the tracked
    // pin they were verified against, not whatever the release directory holds under that name.
    T.check(Files.isRegularFile(p.resolve("site/scratchpad/CHECKSUMS")), "CHECKSUMS is published");
    T.eq(-1L, Files.mismatch(p.resolve("runtime/ristretto/CHECKSUMS"), p.resolve("site/scratchpad/CHECKSUMS")),
        "and it is runtime/ristretto/CHECKSUMS, not the release's own");
  }
  static void testChecksumsMustNameEveryRuntimeFileAndNothingElse() throws Exception {
    Path f = Fixtures.TOOLS.resolve("build/.work/tests/scratchpad-CHECKSUMS");
    Files.createDirectories(f.getParent());
    String good = Files.readString(Fixtures.SCRATCHPAD.resolve("CHECKSUMS"));
    String h = "0".repeat(64);
    Files.writeString(f, good);
    T.eq(12, ScratchpadFiles.sums(f).size(), "the fixture's CHECKSUMS parses");
    Files.writeString(f, "");
    T.fails("empty", () -> ScratchpadFiles.sums(f), "an empty CHECKSUMS");
    for (String n : List.of("jdk.zip", "browser-jshell.jar")) {
      Files.writeString(f, good.lines().filter(l -> !l.endsWith("  " + n)).map(l -> l + "\n").reduce("", String::concat));
      T.fails("does not list " + n, () -> ScratchpadFiles.sums(f), "a CHECKSUMS missing " + n);
    }
    for (String bad : List.of("index.html", "assets/runtime-DCdWMB6d.js", "legal/../NOTICE", "legal/java.base/../../x", "/etc/passwd",
        "legal/java.base", "legal/.hidden/LICENSE", "../jdk.zip")) {
      Files.writeString(f, good + h + "  " + bad + "\n");
      T.fails("does not publish: " + bad, () -> ScratchpadFiles.sums(f), "CHECKSUMS naming " + bad);
    }
    Files.writeString(f, good + "not-a-hash  NOTICE\n");
    T.fails("not a checksum line", () -> ScratchpadFiles.sums(f), "a malformed line");
    Files.writeString(f, good + h + "  NOTICE\n");
    T.fails("lists NOTICE twice", () -> ScratchpadFiles.sums(f), "a name listed twice");
  }
  static void testMissingOutranksDiffersAndTheBuildStops() throws Exception {
    Path p = Fixtures.project("scratchpad-tamper");
    T.eq(0, Fixtures.build(p).exit(), "a first, good build publishes the fixture");
    Path r = release("scratchpad-tamper");
    Files.write(r.resolve("jdk.zip"), new byte[] {0}, StandardOpenOption.APPEND);
    Files.delete(r.resolve("worker.js"));
    var res = Fixtures.build(p, "--scratchpad", r.toString());
    T.eq(1, res.exit(), "a tampered scratchpad stops the build: " + res.out());
    int missing = res.out().indexOf("worker.js: missing"), differs = res.out().indexOf("jdk.zip: differs");
    T.check(missing >= 0 && differs > missing, "names both, the missing one first: " + res.out());
    // Since site/ is emptied before each build writes it (D98), a refused build leaves no scratchpad/ at all.
    Path published = p.resolve("site/scratchpad");
    List<String> reached = new ArrayList<>();
    if (Files.exists(published))
      try (var s = Files.walk(published)) { s.filter(Files::isRegularFile).forEach(f -> reached.add(published.relativize(f).toString())); }
    T.check(reached.isEmpty(), "the tampered scratchpad never reached site/scratchpad/ (it is checked before anything is copied): " + reached);
  }
  static void testAFileAnEarlierReleaseLeftIsNotPublished() throws Exception {
    String extra = "legal/java.base/ASSEMBLY_EXCEPTION";
    Path r = release("scratchpad-stale");
    Files.writeString(r.resolve(extra), "a notice that a later release drops\n");
    Path p = Fixtures.project("scratchpad-stale");
    pin(r, p);
    T.eq(0, Fixtures.build(p, "--scratchpad", r.toString()).exit(), "build with the extra notice pinned");
    T.check(Files.exists(p.resolve("site/scratchpad/" + extra)), "it is published while a release lists it");
    Files.writeString(p.resolve("site/scratchpad/runtime-old.js"), "an old Ristretto file\n");
    Files.copy(Fixtures.SCRATCHPAD.resolve("CHECKSUMS"), p.resolve("runtime/ristretto/CHECKSUMS"), StandardCopyOption.REPLACE_EXISTING);
    T.eq(0, Fixtures.build(p).exit(), "build with the fixture release, which does not list it");
    T.check(!Files.exists(p.resolve("site/scratchpad/" + extra)), "the dropped notice is gone");
    T.check(!Files.exists(p.resolve("site/scratchpad/runtime-old.js")), "and so is a file no release lists");
  }
  static void testAMissingLegalFileStopsTheBuild() throws Exception {
    for (String n : ScratchpadFiles.LEGAL) {
      Path r = release("scratchpad-legal-" + n.replace('/', '-'));
      Files.delete(r.resolve(n));
      Path p = Fixtures.project("scratchpad-legal");
      pin(r, p);
      var res = Fixtures.build(p, "--scratchpad", r.toString());
      T.eq(1, res.exit(), "a release without " + n + " stops the build: " + res.out());
      T.check(res.out().contains(n + ": missing") && res.out().contains("D53"), "and says which file and why: " + res.out());
    }
    Path r = release("scratchpad-legal-empty");
    Files.writeString(r.resolve("NOTICE"), "");
    Path p = Fixtures.project("scratchpad-legal-empty");
    pin(r, p);
    var res = Fixtures.build(p, "--scratchpad", r.toString());
    T.eq(1, res.exit(), "an empty NOTICE stops the build too");
    T.check(res.out().contains("NOTICE: empty"), "and says so: " + res.out());
  }
  static void testTheGuardScansTheScratchpad() throws Exception {
    Path r = release("scratchpad-guard");
    Files.writeString(r.resolve("THIRD-PARTY.txt"), "ANSWER KEY: 1. Hi\n");
    Path p = Fixtures.project("scratchpad-guard");
    pin(r, p);
    var res = Fixtures.build(p, "--scratchpad", r.toString());
    T.eq(1, res.exit(), "a pinned file carrying the marker is still refused: " + res.out());
    T.check(res.out().contains("scratchpad/THIRD-PARTY.txt"), "names it: " + res.out());
  }
  static void testNoScratchpadSaysHowToMakeOne() throws Exception {
    Path emptyTools = Fixtures.TOOLS.resolve("build/.work/tests/scratchpad-no-tools");
    Fixtures.deleteTree(emptyTools);
    Files.createDirectories(emptyTools);
    T.fails("runtime/ristretto/fetch.sh", () -> Build.resolveScratchpadSource(emptyTools, null), "names the fetch step");
    T.fails("runtime/ristretto/package.sh", () -> Build.resolveScratchpadSource(emptyTools, null), "names the package step");
    T.fails("--scratchpad <dir>", () -> Build.resolveScratchpadSource(emptyTools, null), "names the flag");
    // P-8: and a fresh clone's way, the published release's fetch, which README gives first and so does the message.
    T.fails("runtime/ristretto/fetch-release.sh", () -> Build.resolveScratchpadSource(emptyTools, null), "names the release's fetch");
    String message = "";
    try { Build.resolveScratchpadSource(emptyTools, null); } catch (BuildError e) { message = e.getMessage(); }
    int release = message.indexOf("runtime/ristretto/fetch-release.sh"), build = message.indexOf("runtime/ristretto/fetch.sh");
    T.check(release >= 0 && release < build, "the release's fetch comes before building one, as in README: " + message);
    var res = Fixtures.build(Fixtures.project("scratchpad-flag"), "--scratchpad");
    T.eq(2, res.exit(), "--scratchpad without a directory is misuse");
  }
  /** The real release (runtime/.work/ristretto/current, made by runtime/ristretto/package.sh) against the tracked
   *  CHECKSUMS: the one build per run that copies Ristretto's 30 MB. */
  static void testTheRealReleaseBuilds() throws Exception {
    Path current = Fixtures.TOOLS.resolve("runtime/.work/ristretto/current");
    T.check(Files.isDirectory(current), "runtime/.work/ristretto/current exists (run runtime/ristretto/fetch-release.sh, or fetch.sh then package.sh)");
    Path p = Fixtures.project("scratchpad-real");
    Files.copy(Fixtures.TOOLS.resolve("runtime/ristretto/CHECKSUMS"), p.resolve("runtime/ristretto/CHECKSUMS"), StandardCopyOption.REPLACE_EXISTING);
    var res = Fixtures.build(p, "--scratchpad", current.toString());
    T.eq(0, res.exit(), "build: " + res.out());
    var sums = ScratchpadFiles.sums(p.resolve("runtime/ristretto/CHECKSUMS"));
    T.eq(103L, sums.keySet().stream().filter(n -> n.startsWith("legal/")).count(), "all 103 of jdk.zip's notices are pinned");
    T.eq("31fed6b4cd242fb1acbfeddc5ec52dd0ab9c7690cd95b681f132fb62d9328984", RuntimeFiles.sha256(p.resolve("site/scratchpad/jdk.zip")),
        "the published jdk.zip is Ristretto v0.34.0's");
    @SuppressWarnings("unchecked")
    var jshellPins = (Map<String, Object>) Json.parse(Files.readString(Fixtures.TOOLS.resolve("runtime/jshell/test/pins.json")));
    T.eq(jshellPins.get("jar"), RuntimeFiles.sha256(p.resolve("site/scratchpad/browser-jshell.jar")),
        "the published front end is the jar runtime/jshell/test/pins.json pins, the one its check holds to the real jshell");
    // D58: the release's SOURCES.txt carries GPLv2's written offer (runtime/ristretto/package.sh writes it).
    String sources = Files.readString(p.resolve("site/scratchpad/SOURCES.txt"));
    T.check(sources.contains("Written offer (GPLv2, section 3(b))"), "the published SOURCES.txt carries the written offer");
    T.check(sources.contains("https://github.com/mmmugh/groundwork/issues"), "and says where to ask for the source");
    // W-12: the offer runs per distribution (R-1), and both notices name the source's places with no release name.
    // The texts wrap their lines, so runs of whitespace compare as one space. The places are the releases (D109) and the
    // site zip only once one is published (D103 defers it), in words true before and after the zip ships, since the
    // texts live inside the release. SOURCES.txt says so twice, in its opening and in the offer, and each is held to it
    // in its own place: the offer alone would satisfy a check that looked anywhere in the file.
    String offer = sources.replaceAll("\\s+", " ");
    T.check(offer.contains("For at least three years after you received these files from us, and for as long as we distribute them,"),
        "the offer runs for three years after a reader received the files from us, and while we distribute them (R-1)");
    String where = "source.tar.gz, beside these files in each GitHub release of this runtime at"
        + " https://github.com/mmmugh/groundwork/releases, and inside the course's site zip whenever one is published";
    String opening = "Where the scratchpad's files come from. Nothing below was modified; " + where
        + ", holds every archive marked (in source.tar.gz), exactly as downloaded, and the course's own front end's source.";
    T.check(offer.startsWith(opening), "SOURCES.txt opens by naming both places of source.tar.gz: " + opening);
    T.check(offer.contains("The same source is in " + where + "."), "the offer says where source.tar.gz is: " + where);
    String notice = Files.readString(p.resolve("site/scratchpad/NOTICE")).replaceAll("\\s+", " ");
    T.check(notice.contains(where), "and so does NOTICE");
    // R-2: the IJG license asks a distribution of executable code to say so; NOTICE does, in the published release.
    T.check(notice.contains("this software is based in part on the work of the Independent JPEG Group"),
        "NOTICE credits the Independent JPEG Group, as the IJG license asks");
    // R-2: libjpeg-turbo-rs ports files the IJG license covers, so THIRD-PARTY.txt carries the IJG README, verbatim.
    String thirdParty = Files.readString(p.resolve("site/scratchpad/THIRD-PARTY.txt"));
    T.check(thirdParty.contains("== 5. The IJG README, for libjpeg-turbo-rs 0.8.0's source"), "THIRD-PARTY.txt has the IJG README's section");
    T.check(thirdParty.contains("Thomas G. Lane, Guido Vollbeding"), "and the README itself, with its copyright line");
    try (var s = Files.walk(p.resolve("site/scratchpad"))) {
      T.eq((long) sums.size() + 2, s.filter(Files::isRegularFile).count(),
          "site/scratchpad holds the pinned files, CHECKSUMS and manifest.json, nothing else");
    }
  }
  /** P3b-14: the version ScratchpadFiles.manifest gives the real release, from the tracked runtime/ristretto/CHECKSUMS,
   *  is this literal (DESIGN section 7 names the derivation). Anything else that writes or reads a manifest version is
   *  held to the same string; it moves only when a byte a reader runs does, and then this literal moves with it. */
  static void testTheRealReleaseHasThePublishedManifestVersion() throws Exception {
    Path current = Fixtures.TOOLS.resolve("runtime/.work/ristretto/current");
    T.check(Files.isDirectory(current), "runtime/.work/ristretto/current exists (run runtime/ristretto/fetch-release.sh)");
    var sums = ScratchpadFiles.sums(Fixtures.TOOLS.resolve("runtime/ristretto/CHECKSUMS"));
    @SuppressWarnings("unchecked")
    var m = (Map<String, Object>) Json.parse(ScratchpadFiles.manifest(sums, current));
    T.eq("fc8afd322759f4e1", m.get("version"), "the manifest version of the six runtime files runtime/ristretto/CHECKSUMS pins");
  }
}
