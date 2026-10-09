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
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.zip.*;

final class SiteZipTest {
  static final String V = "2026.10.06-1", ROOT = "groundwork-" + V + "/";
  // Not gzip data: SiteZip must copy these bytes and never try to read them as an archive (D14, D51).
  static final byte[] RUNTIME_BYTES = "fixture boxes archive: these bytes are not gzip".getBytes(StandardCharsets.UTF_8);
  static final byte[] SCRATCHPAD_BYTES = {0x1f, (byte) 0x8b, 0, 1, 2, 3, (byte) 0xff, 0x7f};
  static int n;

  record Fx(Path dir, Path site, Path runtime, Path scratchpad, Path pins) {}

  /** A fixture site, two fixture archives and a pin file that pins them, under build/.work/tests/. */
  static Fx fixture(String name) throws Exception {
    Path d = Fixtures.TOOLS.resolve("build/.work/tests/ziptest-" + name + "-" + (++n));
    Fixtures.deleteTree(d);
    Path site = d.resolve("site");
    put(site.resolve("index.html"), "<!doctype html><p>home ".repeat(50).getBytes(StandardCharsets.UTF_8));
    put(site.resolve("page/b.js"), "export const b = 1;\n".getBytes(StandardCharsets.UTF_8));
    put(site.resolve("page/a.js"), "export const a = 1;\n".getBytes(StandardCharsets.UTF_8));
    put(site.resolve("Zeta.txt"), "capital letters sort before lower case\n".getBytes(StandardCharsets.UTF_8));
    put(site.resolve("runtime/NOTICE"), "notice\n".getBytes(StandardCharsets.UTF_8));
    put(site.resolve("runtime/compiler.wasm"), new byte[]{0, 0x61, 0x73, 0x6d, 1, 0, 0, 0});
    put(site.resolve("scratchpad/jdk.zip"), new byte[]{'P', 'K', 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0});
    put(site.resolve("scratchpad/browser-jshell.jar"), "stands for a jar".getBytes(StandardCharsets.UTF_8));
    put(d.resolve("runtime-source.tar.gz"), RUNTIME_BYTES);
    put(d.resolve("scratchpad-source.tar.gz"), SCRATCHPAD_BYTES);
    Path pins = d.resolve("pins.sha256");
    Files.writeString(pins, SiteZip.sha256(d.resolve("runtime-source.tar.gz")) + "  runtime/source.tar.gz\n"
        + SiteZip.sha256(d.resolve("scratchpad-source.tar.gz")) + "  scratchpad/source.tar.gz\n");
    return new Fx(d, site, d.resolve("runtime-source.tar.gz"), d.resolve("scratchpad-source.tar.gz"), pins);
  }
  static void put(Path f, byte[] b) throws Exception { Files.createDirectories(f.getParent()); Files.write(f, b); }

  static List<String> args(Fx f, Path out) {
    return List.of("--site", f.site().toString(), "--version", V, "--out", out.toString(), "--runtime-source", f.runtime().toString(),
        "--scratchpad-source", f.scratchpad().toString(), "--pins", f.pins().toString());
  }
  static Fixtures.Result zip(List<String> args) {
    var bytes = new ByteArrayOutputStream();
    int exit = SiteZip.run(Fixtures.TOOLS, args, new PrintStream(bytes, true, StandardCharsets.UTF_8));
    return new Fixtures.Result(exit, bytes.toString(StandardCharsets.UTF_8));
  }

  static void testTheEntriesAreTheSiteAndBothArchivesInSortedOrderWithEachOnesBytes() throws Exception {
    Fx f = fixture("entries");
    Path out = f.dir().resolve("out.zip");
    var r = zip(args(f, out));
    T.eq(0, r.exit(), r.out());
    // L-1: the course's own license files at the root, beside index.html, from the repository (Fixtures.TOOLS).
    List<String> want = new ArrayList<>(List.of("LICENSE", "LICENSE-COURSE", "Zeta.txt", "index.html", "page/a.js", "page/b.js", "runtime/NOTICE",
        "runtime/compiler.wasm", "runtime/source.tar.gz", "scratchpad/browser-jshell.jar", "scratchpad/jdk.zip", "scratchpad/source.tar.gz"));
    want.replaceAll(s -> ROOT + s);
    want.add(0, ROOT);
    try (ZipFile z = new ZipFile(out.toFile())) {
      // An order, not only a set: a zip that lists its entries differently each build cannot be compared or cached [B27].
      T.eq(want, z.stream().map(ZipEntry::getName).toList(), "entries, in order");
      for (ZipEntry e : Collections.list(z.entries())) {
        T.eq(LocalDateTime.of(2026, 1, 1, 0, 0), e.getTimeLocal(), e.getName() + ": the one fixed local time, so no build date leaks in");
        if (e.isDirectory()) continue;
        String rel = e.getName().substring(ROOT.length());
        boolean packed = rel.endsWith(".gz") || rel.endsWith(".zip") || rel.endsWith(".jar");
        T.eq(packed ? ZipEntry.STORED : ZipEntry.DEFLATED, e.getMethod(), rel + ": already-compressed files are stored, the rest deflated");
        Path src = rel.equals("runtime/source.tar.gz") ? f.runtime() : rel.equals("scratchpad/source.tar.gz") ? f.scratchpad()
            : rel.startsWith("LICENSE") ? Fixtures.TOOLS.resolve(rel) : f.site().resolve(rel);
        T.check(Arrays.equals(Files.readAllBytes(src), z.getInputStream(e).readAllBytes()), rel + ": the entry's bytes are its source's");
      }
    }
    T.check(!Files.exists(f.dir().resolve("out.zip.part")), "no .part left after the rename");
  }

  /** The DOS time fields are local time: a zip built where the clock says another zone must still be the same file. */
  static void testTheZipIsByteIdenticalWhateverTheTimeZone() throws Exception {
    Fx f = fixture("zones");
    String java = Path.of(System.getProperty("java.home"), "bin", "java").toString();
    Path a = f.dir().resolve("utc.zip"), b = f.dir().resolve("ny.zip");
    for (var run : List.of(Map.entry("UTC", a), Map.entry("America/New_York", b))) {
      var cmd = new ArrayList<>(List.of(java, "-Duser.timezone=" + run.getKey(), "build/SiteZip.java"));
      cmd.addAll(args(f, run.getValue()));
      Process p = new ProcessBuilder(cmd).directory(Fixtures.TOOLS.toFile()).redirectErrorStream(true).start();
      String text = new String(p.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
      T.eq(0, p.waitFor(), "SiteZip in " + run.getKey() + ": " + text);
    }
    T.check(Arrays.equals(Files.readAllBytes(a), Files.readAllBytes(b)), "the zip built in UTC and in America/New_York differ");
  }

  static void testAnArchiveThatMissesItsPinIsRefusedAndLeavesNoZip() throws Exception {
    Fx f = fixture("pin");
    Path out = f.dir().resolve("out.zip");
    Files.write(f.runtime(), "changed after it was pinned".getBytes(StandardCharsets.UTF_8));
    var r = zip(args(f, out));
    T.eq(1, r.exit(), "a changed archive: " + r.out());
    T.check(r.out().contains("runtime/source.tar.gz") && r.out().contains("pin"), "names the archive and the pin: " + r.out());
    T.check(!Files.exists(out) && !Files.exists(f.dir().resolve("out.zip.part")), "no zip and no .part left behind");
    // Fix the first, break the second: each archive has its own pin.
    Files.write(f.runtime(), RUNTIME_BYTES);
    Files.write(f.scratchpad(), new byte[]{9});
    r = zip(args(f, out));
    T.eq(1, r.exit(), "a changed scratchpad archive: " + r.out());
    T.check(r.out().contains("scratchpad/source.tar.gz"), r.out());
    T.check(!Files.exists(out), "no zip behind");
  }

  static void testAnArchiveWithNoPinLineIsRefused() throws Exception {
    Fx f = fixture("nopin");
    Files.writeString(f.pins(), Files.readAllLines(f.pins()).get(0) + "\n");
    Path out = f.dir().resolve("out.zip");
    var r = zip(args(f, out));
    T.eq(1, r.exit(), r.out());
    T.check(r.out().contains("no pin for scratchpad/source.tar.gz"), r.out());
    T.check(!Files.exists(out), "no zip behind");
  }

  static void testAMissingArchiveOrSiteIsRefusedByName() throws Exception {
    Fx f = fixture("missing");
    Files.delete(f.scratchpad());
    var r = zip(args(f, f.dir().resolve("out.zip")));
    T.eq(1, r.exit(), r.out());
    T.check(r.out().contains(f.scratchpad().toString()), r.out());
    Fx g = fixture("nosite");
    Fixtures.deleteTree(g.site());
    r = zip(args(g, g.dir().resolve("out.zip")));
    T.eq(1, r.exit(), r.out());
    T.check(r.out().contains("no site directory"), r.out());
  }

  /** L-1: whichever of LICENSE and LICENSE-COURSE the repository holds goes in, and nothing else of it: a tools root with
   *  only LICENSE gives a zip with LICENSE and no LICENSE-COURSE. */
  static void testOnlyTheLicenseFilesThatExistGoIn() throws Exception {
    Fx f = fixture("one-license");
    Path tools = f.dir().resolve("tools");
    put(tools.resolve("LICENSE"), "the code's license\n".getBytes(StandardCharsets.UTF_8));
    put(tools.resolve("README.md"), "not a license file\n".getBytes(StandardCharsets.UTF_8));
    Path out = f.dir().resolve("out.zip");
    var bytes = new ByteArrayOutputStream();
    int exit = SiteZip.run(tools, args(f, out), new PrintStream(bytes, true, StandardCharsets.UTF_8));
    T.eq(0, exit, bytes.toString(StandardCharsets.UTF_8));
    try (ZipFile z = new ZipFile(out.toFile())) {
      List<String> names = z.stream().map(ZipEntry::getName).toList();
      T.check(names.contains(ROOT + "LICENSE") && !names.contains(ROOT + "LICENSE-COURSE") && !names.contains(ROOT + "README.md"),
          "LICENSE in, no LICENSE-COURSE, nothing else of the repository: " + names);
      T.eq("the code's license\n", new String(z.getInputStream(z.getEntry(ROOT + "LICENSE")).readAllBytes(), StandardCharsets.UTF_8), "LICENSE's bytes");
    }
  }

  static void testASiteThatAlreadyHoldsALicenseFileIsRefused() throws Exception {
    Fx f = fixture("dup-license");
    put(f.site().resolve("LICENSE"), new byte[]{1});
    var r = zip(args(f, f.dir().resolve("out.zip")));
    T.eq(1, r.exit(), "the license files come from the repository, beside the site, never from inside it: " + r.out());
    T.check(r.out().contains("LICENSE"), r.out());
  }

  static void testASiteThatAlreadyHoldsAnArchiveIsRefused() throws Exception {
    Fx f = fixture("dup");
    put(f.site().resolve("runtime/source.tar.gz"), new byte[]{1});
    var r = zip(args(f, f.dir().resolve("out.zip")));
    T.eq(1, r.exit(), "the archives come after the build, never inside site/ where Publish.guard would read them: " + r.out());
  }

  /** A symlink in the site is refused, never followed: Build's guard refuses one in a site/ it just wrote, but SiteZip can
   *  be pointed at a site/ no build just wrote, and a followed link would put a file from outside the site in the zip. The
   *  link points at a file in this test's own fixture directory. */
  static void testASymlinkInTheSiteIsRefusedNotFollowed() throws Exception {
    Fx f = fixture("symlink");
    Path outside = f.dir().resolve("outside.txt");
    put(outside, "a file outside the site\n".getBytes(StandardCharsets.UTF_8));
    Files.createSymbolicLink(f.site().resolve("runtime/linked.txt"), outside);
    Path out = f.dir().resolve("out.zip");
    var r = zip(args(f, out));
    T.eq(1, r.exit(), "a symlink in the site is refused, not zipped: " + r.out());
    T.check(r.out().contains("runtime/linked.txt") && r.out().contains("symlink"), "names the link and says why: " + r.out());
    T.check(!Files.exists(out) && !Files.exists(f.dir().resolve("out.zip.part")), "no zip and no .part left behind");
    // The site directory itself a symlink (to the site, moved aside in its own fixture directory): refused, and named.
    Fx g = fixture("symlink-root");
    Files.move(g.site(), g.dir().resolve("site-real"));
    Files.createSymbolicLink(g.site(), g.dir().resolve("site-real"));
    r = zip(args(g, g.dir().resolve("out.zip")));
    T.eq(1, r.exit(), "a symlinked site directory is refused: " + r.out());
    T.check(r.out().contains("sitezip: " + g.site() + " is a symlink"), "and named: " + r.out());
  }

  static void testUsageErrorsExitTwo() throws Exception {
    T.eq(2, zip(List.of()).exit(), "no arguments");
    T.eq(2, zip(List.of("--version", V)).exit(), "no --out");
    T.eq(2, zip(List.of("--version", V, "--out", "x.zip", "--bogus", "y")).exit(), "an unknown flag");
    T.eq(2, zip(List.of("--version", "../x", "--out", "x.zip")).exit(), "a version that is not a name");
  }
}
