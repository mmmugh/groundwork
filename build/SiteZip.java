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
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.zip.CRC32;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipOutputStream;

/** Packs the built site, the course's own license files and the two runtimes' source archives into
 *  groundwork-<version>.zip (W-11, D80, L-1): every entry
 *  under groundwork-<version>/, sorted, with one fixed local time, so the same inputs make the same bytes in any time
 *  zone. The source archives carry OpenJDK and Corretto source: they are copied and compared as raw bytes only, never
 *  decompressed or listed (D14, D51), and checked against runtime/source-archives.sha256, not scanned.
 *  java build/SiteZip.java --site <dir> --version <v> --out <file.zip> [--runtime-source <file>] [--scratchpad-source <file>]
 *  Exits 0, 1 (a refused input, named; no zip left behind) or 2 (usage). */
public class SiteZip {
  static final String RUNTIME_ARCHIVE = "runtime/source.tar.gz", SCRATCHPAD_ARCHIVE = "scratchpad/source.tar.gz";
  /** The course's own license files, taken from the repository root (tools) into the zip's root beside index.html,
   *  whichever of them exist: the site's own files carry no statement of their license, and the chapters' CC BY-NC-SA
   *  4.0 asks a sharer to keep it (L-1). Nothing else of the repository goes in. */
  static final List<String> LICENSES = List.of("LICENSE", "LICENSE-COURSE");
  // Each DOS time field is local time, so setTimeLocal keeps the bytes the same in every zone; setTime would not [B13].
  static final LocalDateTime WHEN = LocalDateTime.of(2026, 1, 1, 0, 0);

  public static void main(String[] args) {
    Path cwd = Path.of("").toAbsolutePath();
    if (!Files.exists(cwd.resolve("build/SiteZip.java"))) {
      System.out.println("sitezip: run from the repository root");
      System.exit(2);
      return;
    }
    System.exit(run(cwd, List.of(args), System.out));
  }

  static String usage() {
    return "usage: java build/SiteZip.java --site <dir> --version <v> --out <file.zip> [--runtime-source <file>] [--scratchpad-source <file>]";
  }

  /** tools is the repository root: it holds the course's license files, runtime/release-url.txt,
   *  runtime/source-archives.sha256 and the runtimes' default archives. Returns the process exit code. */
  static int run(Path tools, List<String> args, PrintStream out) {
    String site = "site", version = null, outFile = null, runtimeSource = null, scratchpadSource = null, pins = null;
    for (int i = 0; i < args.size(); i++) {
      String a = args.get(i);
      if (i + 1 >= args.size() || !List.of("--site", "--version", "--out", "--runtime-source", "--scratchpad-source", "--pins").contains(a)) {
        out.println(usage());
        return 2;
      }
      String v = args.get(++i);
      switch (a) {
        case "--site" -> site = v;
        case "--version" -> version = v;
        case "--out" -> outFile = v;
        case "--runtime-source" -> runtimeSource = v;
        case "--scratchpad-source" -> scratchpadSource = v;
        default -> pins = v; // --pins: tests only, a fixture pin file in place of runtime/source-archives.sha256
      }
    }
    if (version == null || outFile == null || !version.matches("[0-9A-Za-z][0-9A-Za-z._-]*")) {
      out.println(usage());
      return 2;
    }
    Path out0 = Path.of(outFile).toAbsolutePath(), part = out0.resolveSibling(out0.getFileName() + ".part");
    try {
      Path siteDir = Path.of(site).toAbsolutePath();
      if (!Files.isDirectory(siteDir)) throw new BuildError("no site directory " + site + ": run java build/Build.java first");
      Path runtimeArchive = runtimeSource != null ? Path.of(runtimeSource) : boxesArchive(tools);
      Path scratchpadArchive = scratchpadSource != null ? Path.of(scratchpadSource) : tools.resolve("runtime/.work/ristretto/current/source.tar.gz");
      Map<String, String> pinned = readPins(pins != null ? Path.of(pins) : tools.resolve("runtime/source-archives.sha256"));
      checkPin(RUNTIME_ARCHIVE, runtimeArchive, pinned);
      checkPin(SCRATCHPAD_ARCHIVE, scratchpadArchive, pinned);
      // Entry name (under the root) to source file, sorted by name: the zip's order is this order.
      Map<String, Path> files = new TreeMap<>();
      try (var s = Files.walk(siteDir)) {
        for (Path f : s.toList()) {
          if (Files.isSymbolicLink(f))
            throw new BuildError((f.equals(siteDir) ? site : siteDir.relativize(f).toString()) + " is a symlink; refused, not zipped");
          if (Files.isRegularFile(f, LinkOption.NOFOLLOW_LINKS)) files.put(siteDir.relativize(f).toString().replace('\\', '/'), f);
        }
      }
      for (String name : List.of(RUNTIME_ARCHIVE, SCRATCHPAD_ARCHIVE))
        if (files.containsKey(name)) throw new BuildError("the site already holds " + name + ": the archives are added after the build, never built into it");
      files.put(RUNTIME_ARCHIVE, runtimeArchive);
      files.put(SCRATCHPAD_ARCHIVE, scratchpadArchive);
      for (String name : LICENSES) {
        if (!Files.isRegularFile(tools.resolve(name))) continue;
        if (files.containsKey(name)) throw new BuildError("the site already holds " + name + ": the course's license files are added beside it, never built into it");
        files.put(name, tools.resolve(name));
      }
      write(part, "groundwork-" + version + "/", files);
      verify(part, "groundwork-" + version + "/", files);
      Files.move(part, out0, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
      out.println("sitezip: wrote " + outFile + " (" + (files.size() + 1) + " entries)");
      return 0;
    } catch (BuildError | IOException e) {
      try { Files.deleteIfExists(part); } catch (IOException ignored) { }
      out.println("sitezip: " + e.getMessage());
      return 1;
    }
  }

  /** runtime/.work/release/<version>/source.tar.gz, <version> being release-url.txt's last segment without "runtime-" [A26]. */
  static Path boxesArchive(Path tools) throws BuildError, IOException {
    Path url = tools.resolve("runtime/release-url.txt");
    if (!Files.isRegularFile(url)) throw new BuildError("no runtime/release-url.txt to name the boxes' release: pass --runtime-source");
    String base = Files.readString(url).strip();
    while (base.endsWith("/")) base = base.substring(0, base.length() - 1);
    String last = base.substring(base.lastIndexOf('/') + 1);
    if (last.startsWith("runtime-")) last = last.substring("runtime-".length());
    return tools.resolve("runtime/.work/release/" + last + "/source.tar.gz");
  }

  static Map<String, String> readPins(Path file) throws BuildError, IOException {
    if (!Files.isRegularFile(file)) throw new BuildError("no pin file " + file + ": the source archives must be pinned");
    Map<String, String> pins = new TreeMap<>();
    for (String line : Files.readAllLines(file)) {
      if (line.isBlank()) continue;
      String[] p = line.strip().split("\\s+", 2);
      if (p.length != 2 || !p[0].matches("[0-9a-f]{64}")) throw new BuildError("a malformed line in " + file + ": " + line);
      pins.put(p[1].strip(), p[0]);
    }
    return pins;
  }

  /** The archive's raw bytes must hash to the pin recorded for its zip path. */
  static void checkPin(String zipPath, Path archive, Map<String, String> pins) throws BuildError, IOException {
    if (!Files.isRegularFile(archive)) throw new BuildError("no " + zipPath + " at " + archive);
    String want = pins.get(zipPath);
    if (want == null) throw new BuildError("no pin for " + zipPath + " in the pin file");
    String got = sha256(archive);
    if (!got.equals(want)) throw new BuildError(archive + " does not match its pin for " + zipPath + " (pinned " + want + ", is " + got + ")");
  }

  static String sha256(Path f) throws IOException {
    try (InputStream in = Files.newInputStream(f)) {
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      byte[] buf = new byte[1 << 16];
      for (int n; (n = in.read(buf)) > 0; ) md.update(buf, 0, n);
      return HexFormat.of().formatHex(md.digest());
    } catch (java.security.NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
  }

  /** Already-compressed files are stored: deflating them again gains nothing and costs minutes. */
  static boolean stored(String name) { return name.endsWith(".gz") || name.endsWith(".zip") || name.endsWith(".jar"); }

  static void write(Path part, String root, Map<String, Path> files) throws IOException {
    try (OutputStream os = Files.newOutputStream(part); ZipOutputStream zip = new ZipOutputStream(os)) {
      ZipEntry dir = new ZipEntry(root);
      dir.setMethod(ZipEntry.STORED);
      dir.setSize(0);
      dir.setCompressedSize(0);
      dir.setCrc(0);
      dir.setTimeLocal(WHEN);
      zip.putNextEntry(dir);
      zip.closeEntry();
      for (var e : files.entrySet()) {
        ZipEntry z = new ZipEntry(root + e.getKey());
        z.setTimeLocal(WHEN);
        if (stored(e.getKey())) {
          // A stored entry's size and CRC come before its bytes.
          CRC32 crc = new CRC32();
          try (InputStream in = Files.newInputStream(e.getValue())) {
            byte[] buf = new byte[1 << 16];
            for (int n; (n = in.read(buf)) > 0; ) crc.update(buf, 0, n);
          }
          z.setMethod(ZipEntry.STORED);
          z.setSize(Files.size(e.getValue()));
          z.setCompressedSize(Files.size(e.getValue()));
          z.setCrc(crc.getValue());
        } else z.setMethod(ZipEntry.DEFLATED);
        zip.putNextEntry(z);
        Files.copy(e.getValue(), zip);
        zip.closeEntry();
      }
    }
  }

  /** Reopens the zip and compares every entry, in order, with its source, byte for byte. */
  static void verify(Path zipFile, String root, Map<String, Path> files) throws BuildError, IOException {
    try (ZipFile zf = new ZipFile(zipFile.toFile())) {
      List<String> want = new ArrayList<>(List.of(root));
      for (String n : files.keySet()) want.add(root + n);
      List<String> got = zf.stream().map(ZipEntry::getName).toList();
      if (!got.equals(want)) throw new BuildError("the zip's entries are not the planned ones, in order");
      for (var e : files.entrySet()) {
        ZipEntry z = zf.getEntry(root + e.getKey());
        try (InputStream a = zf.getInputStream(z); InputStream b = Files.newInputStream(e.getValue())) {
          if (!sameBytes(a, b)) throw new BuildError("the zip's " + z.getName() + " differs from " + e.getValue());
        }
      }
    }
  }

  static boolean sameBytes(InputStream a, InputStream b) throws IOException {
    byte[] x = new byte[1 << 16], y = new byte[1 << 16];
    while (true) {
      int n = a.readNBytes(x, 0, x.length), m = b.readNBytes(y, 0, y.length);
      if (n != m || !java.util.Arrays.equals(x, 0, n, y, 0, m)) return false;
      if (n == 0) return true;
    }
  }
}
