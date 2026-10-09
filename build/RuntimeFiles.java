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
import java.net.URI;
import java.net.http.*;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.stream.Stream;

/** The runtime a reader's browser runs, verified against runtime/CHECKSUMS before it reaches site/. */
final class RuntimeFiles {
  private RuntimeFiles() {}
  static final List<String> NAMES = List.of("compile-classlib-teavm.bin", "compiler.wasm", "compiler.wasm-deobfuscator.wasm",
      "compiler.wasm-runtime.js", "compiler.wasm-runtime.mjs", "runtime-classlib-teavm.bin");

  /** The CI-only variant's files (W-14): the six runtime files and the manifest that names the patches they were built with. */
  static final List<String> VARIANT_NAMES = Stream.concat(NAMES.stream(), Stream.of("manifest.json")).toList();

  static Map<String, String> sums(Path checksums) throws BuildError { return sums(checksums, NAMES); }

  /** checksums must list exactly the files in names. */
  static Map<String, String> sums(Path checksums, List<String> names) throws BuildError {
    List<String> lines;
    try { lines = Files.readAllLines(checksums); } catch (IOException e) { throw new BuildError(checksums + ": " + e.getMessage()); }
    var m = new LinkedHashMap<String, String>();
    for (String line : lines) {
      if (line.isBlank()) continue;
      String[] f = line.trim().split("\\s+");
      if (f.length != 2 || !f[0].matches("[0-9a-f]{64}")) throw new BuildError(checksums + ": not a checksum line: " + line);
      if (!names.contains(f[1])) throw new BuildError(checksums + ": lists an unknown file " + f[1]);
      m.put(f[1], f[0]);
    }
    if (m.isEmpty()) throw new BuildError(checksums + ": empty");
    for (String n : names) if (!m.containsKey(n)) throw new BuildError(checksums + ": does not list " + n);
    return m;
  }

  /** The base URL a release-url.txt holds, with the trailing slash URI.resolve needs added when the line lacks one. A line
   *  that is not an http(s) URL is a BuildError naming the file, never the stack trace of an IllegalArgumentException. */
  static URI baseUrl(Path file) throws BuildError {
    String text;
    try { text = Files.readString(file).strip(); } catch (IOException e) { throw new BuildError(file + ": " + e.getMessage()); }
    try {
      URI u = URI.create(text.endsWith("/") ? text : text + "/");
      if (u.getHost() == null || u.getScheme() == null || !(u.getScheme().equals("http") || u.getScheme().equals("https")))
        throw new IllegalArgumentException("no http or https host");
      return u;
    } catch (IllegalArgumentException e) {
      throw new BuildError(file + ": \"" + text + "\" is not an http or https URL (" + e.getMessage() + ")");
    }
  }

  /** Missing files first, then differing ones, each "<name>: missing|differs". Empty means all match. */
  static List<String> problems(Path dir, Map<String, String> sums) throws BuildError {
    var missing = new ArrayList<String>(); var differs = new ArrayList<String>();
    for (var e : sums.entrySet()) {
      Path f = dir.resolve(e.getKey());
      if (!Files.isRegularFile(f)) missing.add(e.getKey() + ": missing");
      else if (!sha256(f).equals(e.getValue())) differs.add(e.getKey() + ": differs");
    }
    missing.addAll(differs);
    return missing;
  }

  /** The license, notice and source files that ship beside the six binaries: the set runtime/release/package.sh
   *  writes into a release, kept tracked in runtime/legal/ (package.sh refreshes that copy) so every build, from a
   *  release or from runtime/dist/fork, publishes them. CHECKSUMS is among them because NOTICE says it fixes the
   *  files' exact bytes, so a reader of the site can check them (W-12, P-3). */
  static final List<String> LEGAL_NAMES = List.of("NOTICE", "SOURCES.txt", "CHECKSUMS", "NOTICE-Rhino.txt", "NOTICE-Rhino-tools.txt",
      "LICENSE-Apache-2.0.txt", "LICENSE-GPLv2-CE.txt", "LICENSE-MPL-2.0-Rhino.txt", "LICENSE-BSD-3-Clause-ASM.txt",
      "LICENSE-BSD-3-Clause-ThreeTen.txt", "LICENSE-BSD-JZlib.txt", "LICENSE-Unicode.txt");

  /** Verifies source against project/runtime/CHECKSUMS, fills site/runtime/ with the six binaries and the legal
   *  files from project/runtime/legal/, verifies the copies, then requires the legal files there (D53). The legal
   *  copy must have been written for these bytes: runtime/legal/CHECKSUMS, the release's CHECKSUMS kept beside its
   *  notices, must equal runtime/CHECKSUMS. */
  static void install(Path project, Path source, Path site) throws BuildError {
    var sums = sums(project.resolve("runtime/CHECKSUMS"));
    var probs = problems(source, sums);
    if (!probs.isEmpty()) throw new BuildError("the runtime at " + source + " does not match runtime/CHECKSUMS:\n  "
        + String.join("\n  ", probs) + "\nthese are the bytes a reader's browser would run, so the build stops");
    Path legal = project.resolve("runtime/legal");
    // A missing CHECKSUMS is a missing legal file (D53), said as such before its bytes are compared.
    LegalFiles.require(legal, List.of("CHECKSUMS"));
    if (!sameBytes(legal.resolve("CHECKSUMS"), project.resolve("runtime/CHECKSUMS")))
      throw new BuildError("runtime/legal/CHECKSUMS is not runtime/CHECKSUMS: the notices in runtime/legal/ were written for"
          + " other runtime bytes; copy them from the release runtime/CHECKSUMS pins (runtime/release/package.sh does)");
    Path out = site.resolve("runtime");
    try {
      Files.createDirectories(out);
      for (String n : NAMES) Files.copy(source.resolve(n), out.resolve(n));
      for (String n : LEGAL_NAMES)
        if (Files.isRegularFile(legal.resolve(n))) Files.copy(legal.resolve(n), out.resolve(n));
    } catch (IOException e) { throw new BuildError("installing the runtime: " + e.getMessage()); }
    if (!problems(out, sums).isEmpty()) throw new BuildError("the runtime changed while it was copied");
    LegalFiles.require(out, LEGAL_NAMES);
  }

  /** Download only what is missing; a file present with the wrong bytes is never overwritten. */
  static void fetch(URI base, Path cache, Map<String, String> sums) throws BuildError { fetch(base, cache, sums, "runtime/CHECKSUMS"); }

  /** pinnedBy names the CHECKSUMS file sums came from, for the messages. */
  static void fetch(URI base, Path cache, Map<String, String> sums, String pinnedBy) throws BuildError {
    var probs = problems(cache, sums);
    var wrong = probs.stream().filter(p -> p.endsWith(": differs")).toList();
    if (!wrong.isEmpty()) throw new BuildError("the cached runtime in " + cache + " has been changed:\n  " + String.join("\n  ", wrong)
        + "\ndelete it to download it again");
    HttpClient http = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build();
    try {
      Files.createDirectories(cache);
      for (String p : probs) {
        String name = p.substring(0, p.indexOf(':'));
        Path part = cache.resolve(name + ".part");
        try {
          // ofFile opens the file without truncating it: a longer .part a killed fetch left would keep its tail (C-4).
          Files.deleteIfExists(part);
          var resp = http.send(HttpRequest.newBuilder(base.resolve(name)).build(), HttpResponse.BodyHandlers.ofFile(part));
          if (resp.statusCode() != 200) throw new BuildError("downloading " + name + ": HTTP " + resp.statusCode());
          // Checked before it moves: a file with other bytes must never sit in the cache under its own name (C2, B11).
          String got = sha256(part);
          if (!got.equals(sums.get(name))) throw new BuildError("downloading " + name + ": its SHA-256 is " + got
              + " but " + pinnedBy + " pins " + sums.get(name));
          Files.move(part, cache.resolve(name), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException | InterruptedException | BuildError e) {
          Files.deleteIfExists(part);
          throw e;
        }
      }
    } catch (IOException | InterruptedException e) { throw new BuildError("downloading the runtime: " + e.getMessage()); }
    var after = problems(cache, sums);
    if (!after.isEmpty()) throw new BuildError("the downloaded runtime does not match " + pinnedBy + ":\n  " + String.join("\n  ", after));
  }

  private static boolean sameBytes(Path a, Path b) throws BuildError {
    try { return Files.isRegularFile(a) && Files.mismatch(a, b) == -1; } catch (IOException e) { throw new BuildError(a + ": " + e.getMessage()); }
  }

  static String sha256(Path f) throws BuildError {
    try {
      var md = MessageDigest.getInstance("SHA-256");
      try (var in = Files.newInputStream(f)) { byte[] buf = new byte[1 << 16]; int n; while ((n = in.read(buf)) > 0) md.update(buf, 0, n); }
      return HexFormat.of().formatHex(md.digest());
    } catch (Exception e) { throw new BuildError(f + ": " + e.getMessage()); }
  }
}
