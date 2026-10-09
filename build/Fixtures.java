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
import java.nio.file.*;
import java.util.*;

/** A fresh project directory per test: volumes/vol-fixture copied from build/testdata, plus runtime/CHECKSUMS,
 *  runtime/legal/ and web/ from the repository, and the small fixture scratchpad's CHECKSUMS
 *  (build/testdata/scratchpad-fixture/) as runtime/ristretto/CHECKSUMS. Everything lives under build/.work/tests/. */
final class Fixtures {
  private Fixtures() {}
  static final Path TOOLS = Path.of("").toAbsolutePath();
  /** A release-shaped scratchpad of a few bytes per file, so the build's tests do not copy Ristretto's 30 MB into
   *  every project (over a hundred per run); ScratchpadFilesTest builds once with the real release. */
  static final Path SCRATCHPAD = TOOLS.resolve("build/testdata/scratchpad-fixture");
  /** The boxes' built runtime the tests read: JF_DIST if set (web/test/harness.mjs reads it too), else runtime/dist/fork. */
  static final Path DIST = System.getenv("JF_DIST") != null ? Path.of(System.getenv("JF_DIST")) : TOOLS.resolve("runtime/dist/fork");
  private static int n;
  static Path project(String name) throws IOException {
    Path p = TOOLS.resolve("build/.work/tests/" + name + "-" + (++n));
    deleteTree(p);
    copyTree(TOOLS.resolve("build/testdata/vol-fixture"), p.resolve("volumes/vol-fixture"));
    Files.createDirectories(p.resolve("runtime"));
    Files.copy(TOOLS.resolve("runtime/CHECKSUMS"), p.resolve("runtime/CHECKSUMS"));
    copyTree(TOOLS.resolve("runtime/legal"), p.resolve("runtime/legal"));
    Files.createDirectories(p.resolve("runtime/ristretto"));
    Files.copy(SCRATCHPAD.resolve("CHECKSUMS"), p.resolve("runtime/ristretto/CHECKSUMS"));
    if (Files.isDirectory(TOOLS.resolve("web"))) copyTree(TOOLS.resolve("web"), p.resolve("web"));
    return p;
  }
  /** Runs the build on a fixture project; returns exit code and everything it printed. The fixture scratchpad is
   *  the source unless args name another with --scratchpad. */
  record Result(int exit, String out) {}
  static Result build(Path project, String... args) {
    var all = new ArrayList<>(List.of(args));
    if (!all.contains("--scratchpad")) all.addAll(0, List.of("--scratchpad", SCRATCHPAD.toString()));
    var bytes = new ByteArrayOutputStream();
    int exit = Build.run(TOOLS, project, all, new PrintStream(bytes, true, java.nio.charset.StandardCharsets.UTF_8));
    return new Result(exit, bytes.toString(java.nio.charset.StandardCharsets.UTF_8));
  }
  static void copyTree(Path from, Path to) throws IOException {
    try (var s = Files.walk(from)) {
      for (Path f : s.toList()) {
        Path t = to.resolve(from.relativize(f).toString());
        if (Files.isDirectory(f)) Files.createDirectories(t); else Files.copy(f, t, StandardCopyOption.REPLACE_EXISTING);
      }
    }
  }
  static void deleteTree(Path p) throws IOException {
    if (!Files.exists(p)) return;
    try (var s = Files.walk(p)) { for (Path f : s.sorted(Comparator.reverseOrder()).toList()) Files.delete(f); }
  }
}
