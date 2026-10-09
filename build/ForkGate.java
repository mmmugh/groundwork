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
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** D-P2-1: holds the browser runtime to what the pinned JDK does on every course example, by running
 *  runtime/test/examples.mjs under Node. --check fails (never skips) without Node 25 or later. */
final class ForkGate {
  private ForkGate() {}

  private static final Duration DEADLINE = Duration.ofMinutes(30);
  private static final Pattern VERSION = Pattern.compile("v?(\\d+)\\.");
  private static final String NEEDS_NODE = "the fork gate needs Node 25 or later (D-P2-1)";

  /** Pure: the failure message for versionOutput ("v25.9.0", node --version's own format), or null when
   *  the major version is 25 or later. Unparseable output fails the same way a low version does; it never
   *  silently passes. */
  static String checkNodeVersion(String versionOutput) {
    String v = versionOutput == null ? "" : versionOutput.strip();
    Matcher m = VERSION.matcher(v);
    if (m.find() && Integer.parseInt(m.group(1)) >= 25) return null;
    return NEEDS_NODE + "; node reported \"" + v + "\"";
  }

  /** Runs runtime/test/examples.mjs (found under tools) on examplesJson, testing dist against the pinned
   *  JDK this JVM is running (java.home). Returns each "  !! " problem block from its output, or, when it
   *  exited non-zero with none (Node itself failed to start, or the script's own usage/empty-list message),
   *  the tail of what it printed, so a fork-gate failure is never silently swallowed. */
  static List<String> run(Path tools, Path examplesJson, Path dist) throws BuildError {
    String versionOutput;
    try {
      versionOutput = exec(new ProcessBuilder("node", "--version"), tools, Duration.ofSeconds(10)).output();
    } catch (IOException e) {
      return List.of(NEEDS_NODE + "; node was not found");
    }
    String badVersion = checkNodeVersion(versionOutput);
    if (badVersion != null) return List.of(badVersion);

    ProcessBuilder pb = new ProcessBuilder("node", "runtime/test/examples.mjs", examplesJson.toString());
    pb.environment().put("JF_DIST", dist.toString());
    pb.environment().put("JF_JAVA_HOME", System.getProperty("java.home"));
    Result r;
    try {
      r = exec(pb, tools, DEADLINE);
    } catch (IOException e) {
      throw new BuildError("running the fork gate: " + e.getMessage());
    }
    if (r.timedOut()) return List.of("the fork gate did not finish within 30 minutes");
    return problemsFrom(r.output(), r.exitCode());
  }

  /** Each "  !! <first line>" block, with its indented continuation lines folded in (the shape both this
   *  task's examples.mjs and Audit's own problems use); or, if none and the process failed, the tail of
   *  what it printed, as one problem. */
  private static List<String> problemsFrom(String output, int exitCode) {
    List<String> problems = new ArrayList<>();
    StringBuilder current = null;
    for (String line : output.split("\n", -1)) {
      if (line.startsWith("  !! ")) {
        if (current != null) problems.add(current.toString());
        current = new StringBuilder(line.substring("  !! ".length()));
      } else if (current != null && line.startsWith("    ")) {
        current.append('\n').append(line);
      } else {
        if (current != null) problems.add(current.toString());
        current = null;
      }
    }
    if (current != null) problems.add(current.toString());
    if (problems.isEmpty() && exitCode != 0) {
      String[] lines = output.strip().split("\n");
      int from = Math.max(0, lines.length - 20);
      String tail = String.join("\n", Arrays.copyOfRange(lines, from, lines.length));
      problems.add(tail.isEmpty() ? "the fork gate exited " + exitCode + " with no output" : tail);
    }
    return problems;
  }

  private record Result(String output, int exitCode, boolean timedOut) {}

  /** Runs cmd from cwd, stdout and stderr merged, killed at deadline. */
  private static Result exec(ProcessBuilder pb, Path cwd, Duration deadline) throws IOException {
    pb.directory(cwd.toFile());
    pb.redirectErrorStream(true);
    Process p = pb.start();
    ExecutorService pool = Executors.newSingleThreadExecutor();
    try {
      Callable<String> read = () -> new String(p.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
      Future<String> reading = pool.submit(read);
      boolean done;
      try {
        done = p.waitFor(deadline.toMillis(), TimeUnit.MILLISECONDS);
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new IOException(e);
      }
      if (!done) {
        p.destroyForcibly();
        try { p.waitFor(); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
      }
      String output;
      try { output = reading.get(10, TimeUnit.SECONDS); }
      catch (Exception e) { output = ""; }
      return new Result(output, done ? p.exitValue() : -1, !done);
    } finally { pool.shutdownNow(); }
  }
}
