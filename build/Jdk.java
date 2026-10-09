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
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;
import javax.tools.*;

/** Compiles a box in this JVM; runs it as a fresh JVM of the same pinned JDK. status is Jdk's own five-way
 *  vocabulary (ok, uncaught, exit-N, timeout, output-limit), decided from Jdk's own 10 s deadline and
 *  1,000,000-character cap; it is not runtime/test/jdk.mjs's narrower, differently named vocabulary
 *  (ok, compile-error, uncaught, killed-&lt;signal&gt;, exit-N), which relies on spawnSync's own timeout and
 *  buffer instead (Task 8 normalizes the two before comparing). */
final class Jdk {
  private Jdk() {}
  static final List<String> FLAGS = List.of("-Dstdout.encoding=UTF-8", "-Dstderr.encoding=UTF-8", "-Dstdin.encoding=UTF-8",
      "-Dfile.encoding=UTF-8", "-Duser.language=en", "-Duser.country=US");
  static final int CAP = 1_000_000;
  record Diag(long line, long column, String message) {}
  record Compiled(boolean ok, List<Diag> errors, Path classes) {}
  record Run(String status, String stdout, String stderr) {}

  /** Clears pb's inherited environment and sets exactly PATH, LANG and HOME, matching
   *  runtime/test/jdk.mjs's spawnSync env (the fork gate's JDK side). Without this, a box's JVM ran with the
   *  build's own shell environment: JDK_JAVA_OPTIONS or JAVA_TOOL_OPTIONS set there can silently change a
   *  box's classified behavior (the java launcher prints a "NOTE: Picked up JDK_JAVA_OPTIONS..." line to stderr first,
   *  which no longer starts with "Exception in thread", flipping a raises box from uncaught to exit-1), and
   *  the audit's result would then depend on the author's own environment instead of being reproducible. */
  static ProcessBuilder cleanEnvironment(ProcessBuilder pb) {
    Map<String, String> env = pb.environment();
    env.clear();
    env.put("PATH", "/usr/bin:/bin");
    env.put("LANG", "en_US.UTF-8");
    String home = System.getenv("HOME");
    if (home != null) env.put("HOME", home);
    return pb;
  }

  /** Throws unless this JVM is the pinned JDK 25.0.4.1 (R2): --check runs every box on that exact build. */
  static void checkPinned() throws BuildError { checkPinned(Runtime.version()); }

  /** The same check on a given version, so a test can reach the wrong-JDK message from the pinned JVM. */
  static void checkPinned(Runtime.Version v) throws BuildError {
    if (v.feature() != 25 || v.interim() != 0 || v.update() != 4 || v.patch() != 1)
      throw new BuildError("--check runs on the pinned JDK 25.0.4.1 (R2), not " + v + ": use "
          + "runtime/.work/jdk25/jdk-25.0.4.1+1/Contents/Home/bin/java on a Mac or runtime/.work/jdk25/jdk-25.0.4.1+1/bin/java on Linux");
  }

  /** Compiles source (a compact source file, "Main.java") in this JVM with javax.tools, --release 25. */
  static Compiled compile(String source, Path outDir) throws BuildError {
    try {
      Files.createDirectories(outDir);
      JavaCompiler javac = ToolProvider.getSystemJavaCompiler();
      var diags = new DiagnosticCollector<JavaFileObject>();
      try (var fm = javac.getStandardFileManager(diags, Locale.US, StandardCharsets.UTF_8)) {
        fm.setLocationFromPaths(StandardLocation.CLASS_OUTPUT, List.of(outDir));
        JavaFileObject src = new SimpleJavaFileObject(URI.create("string:///Main.java"), JavaFileObject.Kind.SOURCE) {
          @Override public CharSequence getCharContent(boolean ignore) { return source; }
        };
        boolean ok = javac.getTask(null, fm, diags, List.of("--release", "25", "-encoding", "UTF-8"), null, List.of(src)).call();
        var errors = diags.getDiagnostics().stream().filter(d -> d.getKind() == Diagnostic.Kind.ERROR)
            .map(d -> new Diag(d.getLineNumber(), d.getColumnNumber(), d.getMessage(Locale.US))).toList();
        return new Compiled(ok, errors, outDir);
      }
    } catch (IOException e) { throw new BuildError("compiling: " + e.getMessage()); }
  }

  /** Runs classes/Main as a fresh subprocess of this same pinned JDK, with the pinned flags, stdin piped in,
   *  killed at the deadline or the output cap, whichever comes first. */
  static Run run(Path classes, String stdin, Duration deadline) throws BuildError {
    String java = Path.of(System.getProperty("java.home"), "bin", "java").toString();
    var cmd = new ArrayList<String>(List.of(java));
    cmd.addAll(FLAGS);
    cmd.addAll(List.of("-cp", classes.toString(), "Main"));
    try {
      Process p = cleanEnvironment(new ProcessBuilder(cmd)).start();
      var pool = Executors.newFixedThreadPool(2);
      try {
        Future<String[]> out = pool.submit(() -> read(p.getInputStream(), p));
        Future<String[]> err = pool.submit(() -> read(p.getErrorStream(), p));
        try (var in = p.getOutputStream()) { in.write(stdin.getBytes(StandardCharsets.UTF_8)); } catch (IOException ignored) { /* it may not read */ }
        boolean done = p.waitFor(deadline.toMillis(), TimeUnit.MILLISECONDS);
        if (!done) { p.destroyForcibly().waitFor(); }
        String[] o = out.get(), e = err.get();
        String status = !done ? "timeout"
            : o[1] != null || e[1] != null ? "output-limit"
            : p.exitValue() == 0 ? "ok"
            : e[0].startsWith("Exception in thread") ? "uncaught"
            : "exit-" + p.exitValue();
        return new Run(status, o[0], e[0]);
      } finally { pool.shutdownNow(); }
    } catch (IOException | InterruptedException | ExecutionException x) { throw new BuildError("running a box: " + x); }
  }

  /** Reads a stream as UTF-8 up to CAP characters; past the cap, kills the process and marks [1]. */
  private static String[] read(InputStream s, Process p) throws IOException {
    var r = new InputStreamReader(s, StandardCharsets.UTF_8);
    var b = new StringBuilder();
    char[] buf = new char[8192];
    int n;
    while ((n = r.read(buf)) > 0) {
      b.append(buf, 0, n);
      if (b.length() > CAP) { p.destroyForcibly(); return new String[] {b.substring(0, CAP), "limit"}; }
    }
    return new String[] {b.toString(), null};
  }
}
