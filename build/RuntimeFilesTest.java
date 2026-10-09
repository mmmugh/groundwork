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
import com.sun.net.httpserver.*;
import java.net.*;
import java.nio.file.*;
import java.util.*;

final class RuntimeFilesTest {
  static final Path DIST = Fixtures.DIST;
  static Map<String, String> sums() throws Exception { return RuntimeFiles.sums(Fixtures.TOOLS.resolve("runtime/CHECKSUMS")); }
  static Path copyOfDist(String name) throws Exception {
    Path d = Fixtures.TOOLS.resolve("build/.work/tests/" + name);
    Fixtures.deleteTree(d);
    Fixtures.copyTree(DIST, d);
    return d;
  }
  static void testTheBuiltRuntimeVerifiesAndIsInstalled() throws Exception {
    Path p = Fixtures.project("runtime");
    T.eq(0, Fixtures.build(p, "--runtime", DIST.toString()).exit(), "build");
    for (String f : sums().keySet()) T.check(Files.exists(p.resolve("site/runtime/" + f)), f + " installed");
  }
  /** W-12 (P-3): NOTICE says CHECKSUMS fixes the six files' exact bytes, so the site publishes it beside the notices
   *  (the copy written for these bytes), and a reader or a self-hoster can check every file a browser runs. */
  static void testChecksumsIsPublishedBesideTheNotices() throws Exception {
    Path p = Fixtures.project("runtime-checksums");
    T.eq(0, Fixtures.build(p, "--runtime", DIST.toString()).exit(), "build");
    T.check(Files.isRegularFile(p.resolve("site/runtime/CHECKSUMS")), "site/runtime/CHECKSUMS is published");
    T.eq(-1L, Files.mismatch(p.resolve("runtime/CHECKSUMS"), p.resolve("site/runtime/CHECKSUMS")),
        "and it is runtime/CHECKSUMS, the pin of the six files beside it");
  }
  static void testMissingOutranksDiffers() throws Exception {
    Path d = copyOfDist("rt-tamper");
    Files.write(d.resolve("compiler.wasm"), new byte[] {0}, StandardOpenOption.APPEND);
    T.eq(List.of("compiler.wasm: differs"), RuntimeFiles.problems(d, sums()), "a flipped file is named");
    Files.delete(d.resolve("runtime-classlib-teavm.bin"));
    var probs = RuntimeFiles.problems(d, sums());
    T.check(probs.contains("runtime-classlib-teavm.bin: missing") && probs.contains("compiler.wasm: differs"), "both named: " + probs);
    Path p = Fixtures.project("runtime-tamper");
    var r = Fixtures.build(p, "--runtime", d.toString());
    T.eq(1, r.exit(), "the build stops on a tampered runtime");
    T.check(r.out().contains("compiler.wasm: differs"), "and says which file: " + r.out());
  }
  static void testAnIncompleteChecksumsFileIsAFailure() throws Exception {
    Path f = Fixtures.TOOLS.resolve("build/.work/tests/CHECKSUMS-short");
    Files.createDirectories(f.getParent());
    Files.writeString(f, Files.readString(Fixtures.TOOLS.resolve("runtime/CHECKSUMS")).lines().limit(5).map(l -> l + "\n").reduce("", String::concat));
    T.fails("does not list runtime-classlib-teavm.bin", () -> RuntimeFiles.sums(f), "a CHECKSUMS missing one name");
    Files.writeString(f, "");
    T.fails("empty", () -> RuntimeFiles.sums(f), "an empty CHECKSUMS");
  }
  /** D53 (closing Plan 2's ruling C): the legal files come from the tracked runtime/legal/, whatever the runtime
   *  source holds, so a build from runtime/dist/fork (which has none) publishes them as a release build does. */
  static void testTheTrackedLegalFilesReachSiteRuntimeWhateverTheSourceHolds() throws Exception {
    Path release = copyOfDist("release-shaped");
    for (String name : RuntimeFiles.LEGAL_NAMES) Files.writeString(release.resolve(name), "an older release's " + name + "\n");
    Files.writeString(release.resolve("source.tar.gz"), "not a notice or license file");
    for (Path source : List.of(DIST, release)) {
      Path p = Fixtures.project("runtime-legal");
      T.eq(0, Fixtures.build(p, "--runtime", source.toString()).exit(), "build from " + source);
      for (String n : RuntimeFiles.LEGAL_NAMES)
        T.eq(-1L, Files.mismatch(p.resolve("runtime/legal/" + n), p.resolve("site/runtime/" + n)), n + " in site/runtime/ is runtime/legal/'s, building from " + source);
      T.check(!Files.exists(p.resolve("site/runtime/source.tar.gz")), "source.tar.gz does not reach site/runtime/");
    }
  }
  /** runtime/release/package.sh writes runtime/legal/ by its own glob, and the build publishes LEGAL_NAMES from it: a
   *  license text a re-pin adds there would never reach the site, and a name with no file behind it stops every build.
   *  So the tracked directory holds exactly LEGAL_NAMES and CHECKSUMS, and drift either way fails here. */
  static void testRuntimeLegalHoldsExactlyTheLegalNamesAndChecksums() throws Exception {
    var want = new TreeSet<>(RuntimeFiles.LEGAL_NAMES);
    want.add("CHECKSUMS");
    var got = new TreeSet<String>();
    // Dot-files are skipped: a Finder visit leaves a git-ignored .DS_Store here, which is not part of the tracked directory.
    try (var s = Files.list(Fixtures.TOOLS.resolve("runtime/legal"))) {
      s.map(f -> f.getFileName().toString()).filter(n -> !n.startsWith(".")).forEach(got::add);
    }
    T.eq(want, got, "runtime/legal/ holds exactly RuntimeFiles.LEGAL_NAMES and CHECKSUMS");
  }
  static void testAMissingLegalFileStopsTheBuild() throws Exception {
    for (String n : RuntimeFiles.LEGAL_NAMES) {
      Path p = Fixtures.project("runtime-legal-missing");
      Files.delete(p.resolve("runtime/legal/" + n));
      var r = Fixtures.build(p);
      T.eq(1, r.exit(), "a runtime without " + n + " is not published: " + r.out());
      T.check(r.out().contains(n + ": missing") && r.out().contains("D53"), "names it and says why: " + r.out());
    }
  }
  static void testTheLegalCopyMustBeTheOneWrittenForThesePinnedBytes() throws Exception {
    Path p = Fixtures.project("runtime-legal-stale");
    // Appended to, never edited in place: an edit of one character is no change when that character is already the new one.
    Files.writeString(p.resolve("runtime/legal/CHECKSUMS"), Files.readString(p.resolve("runtime/legal/CHECKSUMS")) + "x\n");
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "notices written for other bytes stop the build: " + r.out());
    T.check(r.out().contains("runtime/legal/CHECKSUMS is not runtime/CHECKSUMS"), "and say so: " + r.out());
  }
  /** D58: the boxes' SOURCES.txt carries GPLv2's three-year written offer, asked for in the repository's issues. It is
   *  written by runtime/release/package.sh into the tracked copy, so this reads the copy a reader's build publishes. */
  static void testTheTrackedSourcesFileCarriesTheWrittenOffer() throws Exception {
    String sources = Files.readString(Fixtures.TOOLS.resolve("runtime/legal/SOURCES.txt"));
    T.check(sources.contains("Written offer (GPLv2, section 3(b))"), "runtime/legal/SOURCES.txt carries the written offer");
    T.check(sources.contains("https://github.com/mmmugh/groundwork/issues"), "and says where to ask for the source");
  }
  /** W-12 and R-1, as ScratchpadFilesTest holds the scratchpad's: the boxes' published SOURCES.txt says the offer runs
   *  per distribution, and it and NOTICE name the source's places with no release name. Read where a reader gets them,
   *  site/runtime/ after a build (copied from runtime/legal/). The texts wrap their lines, so runs of whitespace compare
   *  as one space. The places are the releases (D109) and the site zip only once one is published (D103 defers it), in
   *  words true before and after the zip ships, since the texts live inside the releases. */
  static void testThePublishedNoticesSayHowLongTheOfferRunsAndWhereTheSourceIs() throws Exception {
    Path p = Fixtures.project("rt-offer-terms");
    T.eq(0, Fixtures.build(p).exit(), "build");
    String sources = Files.readString(p.resolve("site/runtime/SOURCES.txt")).replaceAll("\\s+", " ");
    T.check(sources.contains("For at least three years after you received these files from us, and for as long as we distribute them,"),
        "the offer runs for three years after a reader received the files from us, and while we distribute them (R-1)");
    String where = "source.tar.gz, beside these files in each GitHub release of this runtime at"
        + " https://github.com/mmmugh/groundwork/releases, and inside the course's site zip whenever one is published";
    T.check(sources.contains(where), "SOURCES.txt says where source.tar.gz is: " + where);
    T.check(Files.readString(p.resolve("site/runtime/NOTICE")).replaceAll("\\s+", " ").contains(where), "and so does NOTICE");
  }
  /** runtime/release-url.txt and runtime/variants/fork-no-0009/release-url.txt are the one place each of the two tags is
   *  typed, and publishing reads the tags from them. Their last segments, runtime-<version> and
   *  variant-fork-no-0009-<version>, must name the release runtime/release/package.sh wrote runtime/legal/ for, the
   *  version NOTICE's first line names (package-variant.sh packages the variant only beside that release), so a tag typed
   *  for no packaged release fails here, not as a 404 on a fresh clone. */
  static void testTheReleaseUrlsNameTheReleaseTheLegalCopyWasWrittenFor() throws Exception {
    String version = "(\\d{4}\\.\\d{2}\\.\\d{2}-\\d+)";
    String first = Files.readAllLines(Fixtures.TOOLS.resolve("runtime/legal/NOTICE")).get(0);
    var named = java.util.regex.Pattern.compile("Groundwork course runtime—release " + version).matcher(first);
    T.check(named.matches(), "runtime/legal/NOTICE's first line names its release: " + first);
    for (var f : List.of(List.of("runtime/release-url.txt", "runtime-"), List.of("runtime/variants/fork-no-0009/release-url.txt", "variant-fork-no-0009-"))) {
      String url = Files.readString(Fixtures.TOOLS.resolve(f.get(0))).strip();
      var tag = java.util.regex.Pattern.compile("https://github\\.com/mmmugh/groundwork/releases/download/" + f.get(1) + version + "/").matcher(url);
      T.check(tag.matches(), f.get(0) + " is a release's download URL ending in " + f.get(1) + "<version>/: " + url);
      T.eq(named.group(1), tag.group(1), f.get(0) + "'s tag names the release runtime/legal/NOTICE was written for");
    }
  }
  /** S1 (D46): TeaVM's JavaScript interop, org.teavm.jso, is not in the JDK, and a program that could name it could run
   *  JavaScript, so javac must not see it. The class library javac compiles against, compile-classlib-teavm.bin (gzip;
   *  per entry a u16 name length, the UTF-8 name, a u32 length and the bytes), holds no entry under org/teavm/jso/, and
   *  its module-info exports no package of it. It reads Fixtures.DIST, so JF_DIST points it at another build. */
  static void testTheCompileClasslibHoldsNoJavaScriptInterop() throws Exception {
    var names = new ArrayList<String>();
    byte[] moduleInfo = null;
    try (var in = new java.io.DataInputStream(new java.util.zip.GZIPInputStream(Files.newInputStream(DIST.resolve("compile-classlib-teavm.bin"))))) {
      while (true) {
        int length;
        try { length = in.readUnsignedShort(); } catch (java.io.EOFException e) { break; }
        String name = new String(in.readNBytes(length), java.nio.charset.StandardCharsets.UTF_8);
        int size = in.readInt();
        byte[] bytes = in.readNBytes(size);
        T.check(bytes.length == size, name + ": its entry ends early");
        names.add(name);
        if (name.equals("module-info.class")) moduleInfo = bytes;
      }
    }
    T.check(names.contains("java/lang/Object.class") && names.size() > 1000, "the reader understands the file: " + names.size() + " entries");
    var jso = names.stream().filter(n -> n.startsWith("org/teavm/jso/")).toList();
    T.check(jso.isEmpty(), "the compile classlib holds no entry under org/teavm/jso/: it holds " + jso.size() + ", e.g. " + jso.stream().limit(3).toList());
    T.check(moduleInfo != null, "the compile classlib has its module-info");
    T.check(!new String(moduleInfo, java.nio.charset.StandardCharsets.ISO_8859_1).contains("org/teavm/jso"),
        "its module-info exports no package under org/teavm/jso");
  }
  static void testAFileAnEarlierBuildLeftInSiteRuntimeIsNotPublished() throws Exception {
    Path p = Fixtures.project("runtime-stale");
    T.eq(0, Fixtures.build(p).exit(), "first build");
    Files.writeString(p.resolve("site/runtime/LICENSE-Dropped.txt"), "a license an older release shipped\n");
    T.eq(0, Fixtures.build(p).exit(), "second build");
    T.check(!Files.exists(p.resolve("site/runtime/LICENSE-Dropped.txt")), "a file no build writes is gone from site/runtime/");
  }

  /** runtime/RELEASE (the file Plan 2 read, before runtime/release-url.txt replaced it) could not
   *  exist beside the directory runtime/release/ on a filesystem that ignores case. No path may differ from another, or
   *  from a directory above one, only in case; the clash below is synthetic now, and the guard stays for any such name. */
  static List<String> caseClashes(List<String> paths) {
    var spellings = new TreeMap<String, TreeSet<String>>();
    for (String p : paths) {
      String[] parts = p.split("/");
      for (int i = 1; i <= parts.length; i++) {
        String prefix = String.join("/", Arrays.copyOf(parts, i));
        spellings.computeIfAbsent(prefix.toLowerCase(Locale.ROOT), k -> new TreeSet<>()).add(prefix);
      }
    }
    return spellings.values().stream().filter(s -> s.size() > 1).map(s -> String.join(" vs ", s)).toList();
  }
  static List<String> git(String... args) throws Exception {
    var cmd = new ArrayList<>(List.of("git", "-C", Fixtures.TOOLS.toString()));
    cmd.addAll(List.of(args));
    Process pr = new ProcessBuilder(cmd).redirectErrorStream(true).start();
    String out = new String(pr.getInputStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
    T.eq(0, pr.waitFor(), "git " + String.join(" ", args) + ": " + out);
    return out.lines().filter(l -> !l.isEmpty()).toList();
  }
  static void testNoTwoTrackedPathsDifferOnlyInCase() throws Exception {
    T.eq(List.of("runtime/RELEASE vs runtime/release"), caseClashes(List.of("runtime/RELEASE", "runtime/release/package.sh", "runtime/CHECKSUMS")),
        "a file and a directory differing only in case are a clash");
    T.eq(List.of("Docs vs docs"), caseClashes(List.of("docs/a.md", "Docs/b.md")), "so are two directories");
    T.eq(List.of(), caseClashes(List.of("runtime/ristretto/CHECKSUMS", "runtime/CHECKSUMS")), "the same name in two directories is not");
    var paths = new ArrayList<>(git("ls-files"));
    paths.addAll(git("ls-files", "--others", "--exclude-standard")); // what is about to be added counts too
    T.eq(List.of(), caseClashes(paths), "no tracked or addable paths differ only in case");
  }
  static void testFetchDownloadsOnlyWhatIsMissingAndNeverOverwritesAMismatch() throws Exception {
    HttpServer server = HttpServer.create(new InetSocketAddress(InetAddress.getLoopbackAddress(), 0), 0);
    var served = new ArrayList<String>();
    server.createContext("/", ex -> {
      String name = ex.getRequestURI().getPath().substring(1);
      served.add(name);
      byte[] body = Files.readAllBytes(DIST.resolve(name));
      ex.sendResponseHeaders(200, body.length);
      try (var o = ex.getResponseBody()) { o.write(body); }
    });
    server.start();
    try {
      URI base = URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/");
      Path cache = copyOfDist("rt-cache");
      Files.delete(cache.resolve("compiler.wasm"));
      RuntimeFiles.fetch(base, cache, sums());
      T.eq(List.of("compiler.wasm"), served, "only the missing file was fetched");
      Files.write(cache.resolve("compiler.wasm-runtime.js"), new byte[] {0}, StandardOpenOption.APPEND);
      T.fails("compiler.wasm-runtime.js: differs", () -> RuntimeFiles.fetch(base, cache, sums()), "a mismatch is not fetched over");
      T.eq(1, served.size(), "nothing downloaded over the tampered file");
    } finally { server.stop(0); }
  }
  /** GitHub answers a release asset's URL with 302 to another host, so a fresh clone's fetch must follow it (Plan 4,
   *  review focus 4). Two local servers stand for the two hosts: the holder serves the files (a tampered copy of one,
   *  or a 404 for one, when a test says so) and the front only redirects every path to the holder. */
  record Hosts(HttpServer front, HttpServer holder, List<String> asked) {
    URI base() { return URI.create("http://127.0.0.1:" + front.getAddress().getPort() + "/download/runtime-test-1/"); }
    void stop() { front.stop(0); holder.stop(0); }
  }
  static Hosts hosts(Path files, String tampered, String missing) throws Exception {
    var asked = new ArrayList<String>();
    HttpServer holder = HttpServer.create(new InetSocketAddress(InetAddress.getLoopbackAddress(), 0), 0);
    holder.createContext("/", ex -> {
      String name = ex.getRequestURI().getPath().substring(1);
      asked.add(name);
      if (name.equals(missing)) { ex.sendResponseHeaders(404, -1); ex.close(); return; }
      byte[] body = Files.readAllBytes(files.resolve(name));
      if (name.equals(tampered)) body[body.length / 2] ^= 1;
      ex.sendResponseHeaders(200, body.length);
      try (var o = ex.getResponseBody()) { o.write(body); }
    });
    holder.start();
    HttpServer front = HttpServer.create(new InetSocketAddress(InetAddress.getLoopbackAddress(), 0), 0);
    int to = holder.getAddress().getPort();
    front.createContext("/", ex -> {
      // Only under the release's path: a base URL that lost its trailing slash would ask for /download/<name> and get a 404.
      if (!ex.getRequestURI().getPath().startsWith("/download/runtime-test-1/")) { ex.sendResponseHeaders(404, -1); ex.close(); return; }
      String name = ex.getRequestURI().getPath().replaceAll(".*/", "");
      ex.getResponseHeaders().add("Location", "http://127.0.0.1:" + to + "/" + name);
      ex.sendResponseHeaders(302, -1);
      ex.close();
    });
    front.start();
    return new Hosts(front, holder, asked);
  }
  /** The names in the cache that are the file or its .part. */
  static List<String> leftovers(Path cache, String name) throws Exception {
    try (var s = Files.list(cache)) { return s.map(f -> f.getFileName().toString()).filter(n -> n.equals(name) || n.equals(name + ".part")).sorted().toList(); }
  }
  /** Guard, not a fix: RuntimeFiles.fetch already follows redirects (Break 1 removes that and this fails). */
  static void testFetchFollowsTheRedirectGitHubAnswersWith() throws Exception {
    var h = hosts(DIST, null, null);
    try {
      Path cache = Fixtures.TOOLS.resolve("build/.work/tests/rt-redirect");
      Fixtures.deleteTree(cache);
      RuntimeFiles.fetch(h.base(), cache, sums());
      T.eq(List.of(), RuntimeFiles.problems(cache, sums()), "all six files arrived through the redirect, byte for byte");
      T.eq(new TreeSet<>(sums().keySet()), new TreeSet<>(h.asked()), "each was asked of the second host once");
    } finally { h.stop(); }
  }
  /** A fetched file that is not the pinned one must never sit in the cache under its own name: a later build would
   *  see it as present and wrong, and the next fetch refuses to overwrite a wrong file (C2, B11). */
  static void testFetchLeavesNoFileOfThatNameWhenOneByteChanged() throws Exception {
    var h = hosts(DIST, "compiler.wasm", null);
    try {
      Path cache = Fixtures.TOOLS.resolve("build/.work/tests/rt-onebyte");
      Fixtures.deleteTree(cache);
      // A 404 for compiler.wasm also names it, so the message must be the mismatch itself: the tampered file's own hash
      // and the hash the pin holds (a 404 prints neither).
      byte[] body = Files.readAllBytes(DIST.resolve("compiler.wasm"));
      body[body.length / 2] ^= 1;
      Path tampered = Fixtures.TOOLS.resolve("build/.work/tests/rt-onebyte-copy");
      Files.write(tampered, body);
      String tamperedHash = RuntimeFiles.sha256(tampered);
      T.fails("its SHA-256 is " + tamperedHash, () -> RuntimeFiles.fetch(h.base(), cache, sums()), "one changed byte behind the redirect");
      T.fails(" pins " + sums().get("compiler.wasm"), () -> RuntimeFiles.fetch(h.base(), cache, sums()), "and says which hash the pin holds");
      T.eq(List.of(), leftovers(cache, "compiler.wasm"),
          "neither the file nor a .part of it is in the cache");
    } finally { h.stop(); }
  }
  static void testFetchLeavesNoFileOfThatNameWhenTheServerAnswers404() throws Exception {
    var h = hosts(DIST, null, "compiler.wasm-runtime.js");
    try {
      Path cache = Fixtures.TOOLS.resolve("build/.work/tests/rt-404");
      Fixtures.deleteTree(cache);
      T.fails("compiler.wasm-runtime.js", () -> RuntimeFiles.fetch(h.base(), cache, sums()), "a 404 behind the redirect");
      T.eq(List.of(), leftovers(cache, "compiler.wasm-runtime.js"),
          "neither the file nor a .part of it is in the cache");
    } finally { h.stop(); }
  }
  /** C-4: a .part that a killed fetch left (Ctrl-C or a CI timeout skips the catch that deletes it), longer than the new
   *  download, must not keep its tail in it: BodyHandlers.ofFile opens the file without truncating it, and the hash check
   *  then failed that run, blaming the download. */
  static void testALeftoverPartLongerThanTheDownloadDoesNotSpoilIt() throws Exception {
    var h = hosts(DIST, null, null);
    try {
      Path cache = Fixtures.TOOLS.resolve("build/.work/tests/rt-leftover-part");
      Fixtures.deleteTree(cache);
      Files.createDirectories(cache);
      String name = "compiler.wasm-runtime.js";
      Files.write(cache.resolve(name + ".part"), new byte[(int) Files.size(DIST.resolve(name)) + 1000]);
      RuntimeFiles.fetch(h.base(), cache, sums());
      T.eq(List.of(), RuntimeFiles.problems(cache, sums()), "all six files arrived whole, the leftover's tail gone");
      T.eq(List.of(name), leftovers(cache, name), "and no .part of it is left");
    } finally { h.stop(); }
  }
  /** P-3: a fresh clone before Plan 4b publishes has no runtime/dist/fork, and runtime/release-url.txt (tracked) names a
   *  release that is not there yet, so the build's fetch fails; its message says how to build the runtime instead. */
  static void testABuildWhoseRuntimeReleaseCannotBeFetchedSaysToRunBuildSh() throws Exception {
    var h = hosts(DIST, null, "compiler.wasm");
    try {
      Path tools = toolsWithReleaseUrl("fetch-runtime-unpublished", h.base());
      Path p = Fixtures.project("unpublished-runtime");
      var bytes = new java.io.ByteArrayOutputStream();
      int exit = Build.run(tools, p, List.of("--scratchpad", Fixtures.SCRATCHPAD.toString()), new java.io.PrintStream(bytes, true, java.nio.charset.StandardCharsets.UTF_8));
      String out = bytes.toString(java.nio.charset.StandardCharsets.UTF_8);
      T.eq(1, exit, "a release that cannot be fetched: " + out);
      T.check(out.contains("compiler.wasm") && out.contains("runtime/build.sh"), "names the file and runtime/build.sh: " + out);
    } finally { h.stop(); }
  }
  /** A cached runtime file with other bytes is a different failure from an unpublished release: nothing was fetched, so
   *  the message must not claim the release "could not be fetched", only that the file has been changed. */
  static void testAChangedCacheFileIsNotBlamedOnTheFetch() throws Exception {
    var h = hosts(DIST, null, null);
    try {
      Path tools = toolsWithReleaseUrl("fetch-runtime-changed", h.base());
      Path cache = tools.resolve("build/.work/runtime");
      Files.createDirectories(cache);
      byte[] body = Files.readAllBytes(DIST.resolve("compiler.wasm"));
      body[body.length / 2] ^= 1;
      Files.write(cache.resolve("compiler.wasm"), body);
      Path p = Fixtures.project("changed-cache-runtime");
      var bytes = new java.io.ByteArrayOutputStream();
      int exit = Build.run(tools, p, List.of("--scratchpad", Fixtures.SCRATCHPAD.toString()), new java.io.PrintStream(bytes, true, java.nio.charset.StandardCharsets.UTF_8));
      String out = bytes.toString(java.nio.charset.StandardCharsets.UTF_8);
      T.eq(1, exit, "a changed cache file stops the build: " + out);
      T.check(out.contains("has been changed") && out.contains("compiler.wasm"), "says the file has been changed, and which: " + out);
      T.check(!out.contains("could not be fetched"), "does not claim a fetch failure that did not happen: " + out);
      // The hint belongs to a release that could not be fetched; here the cache was changed, so the hint would misdirect.
      T.check(!out.contains("runtime/build.sh") && !out.contains("this build fetches"), "carries no fetch hint: " + out);
    } finally { h.stop(); }
  }
  /** The variant's legal names are listed twice: RuntimeFiles.LEGAL_NAMES, which the build publishes, and the LEGAL line of
   *  runtime/release/package-variant.sh, which packs them. A name in one and not the other ships a release the build refuses
   *  or a build that publishes nothing for a file. */
  static void testThePackagersLegalNamesAreTheBuildsLegalNames() throws Exception {
    String line = Files.readAllLines(Fixtures.TOOLS.resolve("runtime/release/package-variant.sh")).stream()
        .filter(l -> l.startsWith("LEGAL=\"")).findFirst().orElseThrow(() -> new AssertionError("package-variant.sh has no LEGAL=\"...\" line"));
    var packed = new TreeSet<>(Arrays.asList(line.substring("LEGAL=\"".length(), line.lastIndexOf('"')).split(" ")));
    T.eq(new TreeSet<>(RuntimeFiles.LEGAL_NAMES), packed, "package-variant.sh packs exactly RuntimeFiles.LEGAL_NAMES");
  }
  /** --fetch-runtime: what a clone with no runtime/dist/fork runs first. It reads runtime/release-url.txt, fills
   *  build/.work/runtime/ under the tools root, prints that directory and exits 0; a bad file exits 1 naming it. */
  static Path toolsWithReleaseUrl(String name, URI base) throws Exception {
    Path t = Fixtures.TOOLS.resolve("build/.work/tests/" + name);
    Fixtures.deleteTree(t);
    Files.createDirectories(t.resolve("runtime"));
    Files.copy(Fixtures.TOOLS.resolve("runtime/CHECKSUMS"), t.resolve("runtime/CHECKSUMS"));
    Files.writeString(t.resolve("runtime/release-url.txt"), base + "\n");
    return t;
  }
  static Fixtures.Result fetchRuntime(Path tools) {
    var bytes = new java.io.ByteArrayOutputStream();
    int exit = Build.run(tools, tools, List.of("--fetch-runtime"), new java.io.PrintStream(bytes, true, java.nio.charset.StandardCharsets.UTF_8));
    return new Fixtures.Result(exit, bytes.toString(java.nio.charset.StandardCharsets.UTF_8));
  }
  static void testFetchRuntimeFillsTheCacheAndPrintsIt() throws Exception {
    var h = hosts(DIST, null, null);
    try {
      Path tools = toolsWithReleaseUrl("fetch-runtime-ok", h.base());
      var r = fetchRuntime(tools);
      T.eq(0, r.exit(), "fetch-runtime: " + r.out());
      T.eq(tools.resolve("build/.work/runtime").toString(), r.out().strip(), "it prints the directory");
      T.eq(List.of(), RuntimeFiles.problems(tools.resolve("build/.work/runtime"), sums()), "holding the six pinned files");
    } finally { h.stop(); }
  }
  static void testFetchRuntimeNamesTheFileThatFailed() throws Exception {
    var h = hosts(DIST, "compiler.wasm", null);
    try {
      var r = fetchRuntime(toolsWithReleaseUrl("fetch-runtime-bad", h.base()));
      T.eq(1, r.exit(), "a one-byte change exits 1: " + r.out());
      T.check(r.out().contains("compiler.wasm"), "and names the file: " + r.out());
    } finally { h.stop(); }
  }
  static void testFetchRuntimeWithoutAReleaseUrlSaysWhatToAdd() throws Exception {
    Path tools = toolsWithReleaseUrl("fetch-runtime-none", URI.create("http://127.0.0.1:1/"));
    Files.delete(tools.resolve("runtime/release-url.txt"));
    var r = fetchRuntime(tools);
    T.eq(1, r.exit(), "no release-url.txt: " + r.out());
    T.check(r.out().contains("runtime/release-url.txt"), "names the file: " + r.out());
  }
  static Fixtures.Result build(Path tools, String flag) {
    var bytes = new java.io.ByteArrayOutputStream();
    int exit = Build.run(tools, tools, List.of(flag), new java.io.PrintStream(bytes, true, java.nio.charset.StandardCharsets.UTF_8));
    return new Fixtures.Result(exit, bytes.toString(java.nio.charset.StandardCharsets.UTF_8));
  }
  /** A release-url.txt line a person might write: no trailing slash. URI.resolve would drop the last path segment, so
   *  both fetches add it (a Task 5 review finding). */
  static void testFetchRuntimeAddsTheTrailingSlashAReleaseUrlLacks() throws Exception {
    var h = hosts(DIST, null, null);
    try {
      String bare = h.base().toString().replaceAll("/$", "");
      Path tools = toolsWithReleaseUrl("fetch-runtime-noslash", URI.create(bare + "/"));
      Files.writeString(tools.resolve("runtime/release-url.txt"), bare + "\n");
      var r = fetchRuntime(tools);
      T.eq(0, r.exit(), "a base URL without its slash still fetches: " + r.out());
      T.eq(List.of(), RuntimeFiles.problems(tools.resolve("build/.work/runtime"), sums()), "all six files arrived");
    } finally { h.stop(); }
  }
  static void testABadReleaseUrlIsExitOneNamingTheFileNeverAStackTrace() throws Exception {
    for (String bad : List.of("not a url", "ftp://example.com/x/", "no-scheme/path")) {
      Path tools = toolsWithReleaseUrl("fetch-runtime-badurl", URI.create("http://127.0.0.1:1/"));
      Files.writeString(tools.resolve("runtime/release-url.txt"), bad + "\n");
      var r = fetchRuntime(tools);
      T.eq(1, r.exit(), "--fetch-runtime with the line \"" + bad + "\": " + r.out());
      T.check(r.out().contains("runtime/release-url.txt") && r.out().contains(bad) && !r.out().contains("Exception"), "names the file and the line, no exception: " + r.out());
      Path v = toolsWithVariant("fetch-variant-badurl", URI.create("http://127.0.0.1:1/"));
      Files.writeString(v.resolve("runtime/variants/fork-no-0009/release-url.txt"), bad + "\n");
      r = build(v, "--fetch-variant");
      T.eq(1, r.exit(), "--fetch-variant with the line \"" + bad + "\": " + r.out());
      T.check(r.out().contains("runtime/variants/fork-no-0009/release-url.txt") && r.out().contains(bad) && !r.out().contains("Exception"),
          "names the file and the line, no exception: " + r.out());
    }
  }
  /** --fetch-variant (W-14, D88): the CI-only build without patch 0009, from runtime/variants/fork-no-0009/release-url.txt,
   *  checked against runtime/variants/fork-no-0009/CHECKSUMS, into runtime/.work/variants/fork-no-0009/ under the tools root. */
  static Path toolsWithVariant(String name, URI base) throws Exception {
    Path t = Fixtures.TOOLS.resolve("build/.work/tests/" + name);
    Fixtures.deleteTree(t);
    Path d = t.resolve("runtime/variants/fork-no-0009");
    Files.createDirectories(d);
    Files.copy(Fixtures.TOOLS.resolve("runtime/variants/fork-no-0009/CHECKSUMS"), d.resolve("CHECKSUMS"));
    Files.writeString(d.resolve("release-url.txt"), base + "\n");
    return t;
  }
  static void testFetchVariantFillsTheScratchDirectoryAndTheForkGateCheckPassesOnIt() throws Exception {
    var h = hosts(ForkGateTest.VARIANT, null, null);
    try {
      Path tools = toolsWithVariant("fetch-variant-ok", h.base());
      var r = build(tools, "--fetch-variant");
      Path got = tools.resolve("runtime/.work/variants/fork-no-0009");
      T.eq(0, r.exit(), "fetch-variant: " + r.out());
      T.eq(got.toString(), r.out().strip(), "it prints the directory");
      T.eq(List.of(), RuntimeFiles.problems(got, RuntimeFiles.sums(tools.resolve("runtime/variants/fork-no-0009/CHECKSUMS"), RuntimeFiles.VARIANT_NAMES)),
          "holding the seven pinned files, through the redirect");
      T.eq(7, new TreeSet<>(h.asked()).size(), "each of the seven was asked of the second host");
      T.eq(null, ForkGateTest.variantVerdict(got), "the fork-no-0009 check passes on the fetched copy");
    } finally { h.stop(); }
  }
  static void testFetchVariantRefusesAChangedManifestAndLeavesNothingOfThatName() throws Exception {
    var h = hosts(ForkGateTest.VARIANT, "manifest.json", null);
    try {
      Path tools = toolsWithVariant("fetch-variant-bad", h.base());
      var r = build(tools, "--fetch-variant");
      T.eq(1, r.exit(), "a one-byte change in manifest.json exits 1: " + r.out());
      T.check(r.out().contains("manifest.json"), "and names the file: " + r.out());
      T.eq(List.of(), leftovers(tools.resolve("runtime/.work/variants/fork-no-0009"), "manifest.json"), "neither it nor a .part is left");
    } finally { h.stop(); }
  }
  static void testTheTrackedVariantPinsAreTheVariantPackageVariantWrote() throws Exception {
    Path pins = Fixtures.TOOLS.resolve("runtime/variants/fork-no-0009");
    var sums = RuntimeFiles.sums(pins.resolve("CHECKSUMS"), RuntimeFiles.VARIANT_NAMES);
    T.eq(7, sums.size(), "seven files are pinned");
    T.eq(List.of(), RuntimeFiles.problems(ForkGateTest.VARIANT, sums), "the variant this tree built is the one the pins name (rebuild: package-variant.sh)");
    String url = Files.readString(pins.resolve("release-url.txt"));
    T.check(url.matches("https://github.com/mmmugh/groundwork/releases/download/variant-fork-no-0009-\\d{4}\\.\\d{2}\\.\\d{2}-\\d+/\n"), "the URL is the variant's own tag, ending in a slash: " + url);
  }
  /** The build with no --runtime and no runtime/dist/fork reads runtime/release-url.txt (W-10), the file that replaced
   *  runtime/RELEASE; its three-way error names it. */
  static void testNoRuntimeAnywhereNamesReleaseUrlTxt() throws Exception {
    Path tools = Fixtures.TOOLS.resolve("build/.work/tests/no-runtime-tools");
    Fixtures.deleteTree(tools);
    Files.createDirectories(tools.resolve("runtime"));
    Path p = Fixtures.project("no-runtime");
    var bytes = new java.io.ByteArrayOutputStream();
    int exit = Build.run(tools, p, List.of("--scratchpad", Fixtures.SCRATCHPAD.toString()), new java.io.PrintStream(bytes, true, java.nio.charset.StandardCharsets.UTF_8));
    String out = bytes.toString(java.nio.charset.StandardCharsets.UTF_8);
    T.eq(1, exit, "no runtime anywhere: " + out);
    T.check(out.contains("add runtime/release-url.txt") && !out.contains("RELEASE"), "the message names the new file: " + out);
  }
}
