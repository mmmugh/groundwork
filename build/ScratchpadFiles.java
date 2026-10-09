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
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/** The scratchpad's files (Ristretto's five, unmodified, the course's jshell front end, and their legal files),
 *  verified against runtime/ristretto/CHECKSUMS before they reach site/scratchpad/. Publishing is by whitelist: only
 *  the names CHECKSUMS lists are copied, with CHECKSUMS itself, and CHECKSUMS may list only the names below. */
final class ScratchpadFiles {
  private ScratchpadFiles() {}

  /** What the reader's browser fetches and runs; manifest.json lists exactly these. browser-jshell.jar is the course's
   *  front end, which the page composes into jdk.zip in place of Ristretto's own (D62). */
  static final List<String> RUNTIME = List.of("worker.js", "jdk.zip", "runner.core.wasm", "runner.core2.wasm", "runner.core3.wasm",
      "browser-jshell.jar");
  /** The legal files every release carries (D21, D53); LegalFiles.require checks them on site/scratchpad/. The
   *  last is Corretto's GPLv2 text, the one notice of the legal/ tree that names jdk.zip's license. */
  static final List<String> LEGAL = List.of("NOTICE", "LICENSE-APACHE", "LICENSE-MIT", "THIRD-PARTY.txt", "SOURCES.txt",
      "legal/java.base/LICENSE");
  /** Corretto's own notices, extracted unmodified from jdk.zip by runtime/ristretto/package.sh. */
  private static final Pattern CORRETTO_NOTICE = Pattern.compile("legal/[A-Za-z0-9_-][A-Za-z0-9._-]*/[A-Za-z0-9_-][A-Za-z0-9._-]*");

  static boolean allowed(String name) {
    return RUNTIME.contains(name) || LEGAL.contains(name) || CORRETTO_NOTICE.matcher(name).matches();
  }

  /** Name to SHA-256, in CHECKSUMS order. CHECKSUMS must name every RUNTIME file, nothing it may not, and no name twice. */
  static Map<String, String> sums(Path checksums) throws BuildError {
    List<String> lines;
    try { lines = Files.readAllLines(checksums); } catch (IOException e) { throw new BuildError(checksums + ": " + e.getMessage()); }
    var m = new LinkedHashMap<String, String>();
    for (String line : lines) {
      if (line.isBlank()) continue;
      String[] f = line.trim().split("\\s+");
      if (f.length != 2 || !f[0].matches("[0-9a-f]{64}")) throw new BuildError(checksums + ": not a checksum line: " + line);
      if (!allowed(f[1])) throw new BuildError(checksums + ": lists a file the scratchpad does not publish: " + f[1]);
      if (m.put(f[1], f[0]) != null) throw new BuildError(checksums + ": lists " + f[1] + " twice");
    }
    if (m.isEmpty()) throw new BuildError(checksums + ": empty");
    for (String n : RUNTIME) if (!m.containsKey(n)) throw new BuildError(checksums + ": does not list " + n);
    return m;
  }

  /** Verifies source against project/runtime/ristretto/CHECKSUMS, fills site/scratchpad/ with exactly the listed
   *  files, that CHECKSUMS and manifest.json, verifies the copies, then requires the legal files there. */
  static void install(Path project, Path source, Path site) throws BuildError {
    var sums = sums(project.resolve("runtime/ristretto/CHECKSUMS"));
    var probs = RuntimeFiles.problems(source, sums);
    if (!probs.isEmpty()) throw new BuildError("the scratchpad at " + source + " does not match runtime/ristretto/CHECKSUMS:\n  "
        + String.join("\n  ", probs) + "\nthese are the bytes a reader's browser would run, so the build stops");
    Path out = site.resolve("scratchpad");
    try {
      for (String n : sums.keySet()) {
        Path to = out.resolve(n);
        Files.createDirectories(to.getParent());
        Files.copy(source.resolve(n), to);
      }
      // NOTICE says CHECKSUMS fixes each file's bytes, so it is published beside them (W-12, P-3): the tracked pin they
      // were just verified against, never the release's own copy. It does not list itself or manifest.json.
      Files.copy(project.resolve("runtime/ristretto/CHECKSUMS"), out.resolve("CHECKSUMS"));
      Files.writeString(out.resolve("manifest.json"), manifest(sums, out));
    } catch (IOException e) { throw new BuildError("installing the scratchpad: " + e.getMessage()); }
    if (!RuntimeFiles.problems(out, sums).isEmpty()) throw new BuildError("the scratchpad changed while it was copied");
    LegalFiles.require(out, LEGAL);
  }

  /** {"version", "files": {name: {"sha256", "size"}}} for the files the browser fetches. version is the first 16
   *  hex digits of the SHA-256 of those files' CHECKSUMS lines: it changes exactly when a byte a reader runs does. */
  static String manifest(Map<String, String> sums, Path dir) throws BuildError {
    var files = new LinkedHashMap<String, Object>();
    var lines = new StringBuilder();
    for (var e : sums.entrySet()) {
      if (!RUNTIME.contains(e.getKey())) continue;
      long size;
      try { size = Files.size(dir.resolve(e.getKey())); } catch (IOException x) { throw new BuildError(e.getKey() + ": " + x.getMessage()); }
      var entry = new LinkedHashMap<String, Object>();
      entry.put("sha256", e.getValue());
      entry.put("size", size);
      files.put(e.getKey(), entry);
      lines.append(e.getValue()).append("  ").append(e.getKey()).append('\n');
    }
    var m = new LinkedHashMap<String, Object>();
    m.put("version", sha256(lines.toString()).substring(0, 16));
    m.put("files", files);
    return Json.write(m);
  }

  private static String sha256(String s) throws BuildError {
    try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(s.getBytes(java.nio.charset.StandardCharsets.UTF_8))); }
    catch (Exception e) { throw new BuildError("SHA-256: " + e.getMessage()); }
  }
}
