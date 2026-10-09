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
import java.time.Duration;

final class JdkTest {
  static Path dir(String n) throws Exception { Path d = Fixtures.TOOLS.resolve("build/.work/tests/jdk-" + n); Fixtures.deleteTree(d); return d; }
  static void testCompilesACompactFileAndReportsLineAndColumn() throws Exception {
    var ok = Jdk.compile("void main() { IO.println(\"x\"); }\n", dir("ok"));
    T.check(ok.ok(), "compiles");
    var bad = Jdk.compile("void main() {\n    int x = ;\n}\n", dir("bad"));
    T.check(!bad.ok(), "fails");
    T.eq(2L, bad.errors().get(0).line(), "line");
    T.eq(13L, bad.errors().get(0).column(), "column");
  }
  static void testRunsWithStdinAndTheJdkFlags() throws Exception {
    var c = Jdk.compile("void main() { String s = IO.readln(); IO.println(s + \" / \" + s.length()); }\n", dir("stdin"));
    var r = Jdk.run(c.classes(), "café 😀\n", Duration.ofSeconds(10));
    T.eq(new Jdk.Run("ok", "café 😀 / 7\n", ""), r, "UTF-8 in and out, char count as Java counts it");
  }
  /** The wrong-JDK message is what a reader on another JDK sees first, and README.md documents two layouts for the pinned
   *  one: the Mac's Contents/Home and Linux's bare directory. A message naming only one sends the other reader to a path
   *  that does not exist. Every test runs on the pinned JVM, so the seam takes the version. */
  static void testTheWrongJdkMessageNamesTheMacAndTheLinuxLayouts() {
    T.fails("jdk-25.0.4.1+1/Contents/Home/bin/java on a Mac", () -> Jdk.checkPinned(Runtime.Version.parse("21")), "the Mac layout");
    T.fails("jdk-25.0.4.1+1/bin/java on Linux", () -> Jdk.checkPinned(Runtime.Version.parse("21")), "the Linux layout");
  }
  static void testATightLoopIsKilledAtTheDeadline() throws Exception {
    var c = Jdk.compile("void main() { IO.println(\"start\"); while (true) {} }\n", dir("loop"));
    long t0 = System.nanoTime();
    var r = Jdk.run(c.classes(), "", Duration.ofSeconds(2));
    T.eq("timeout", r.status(), "status");
    T.eq("start\n", r.stdout(), "earlier output kept");
    T.check(System.nanoTime() - t0 < 6_000_000_000L, "killed near the deadline");
  }
  static void testEndlessPrintingMeetsTheCap() throws Exception {
    var c = Jdk.compile("void main() { while (true) IO.print(\"x\"); }\n", dir("flood"));
    T.eq("output-limit", Jdk.run(c.classes(), "", Duration.ofSeconds(10)).status(), "status");
  }
  static void testCleanEnvironmentStripsWhateverTheBuildsOwnShellSet() throws Exception {
    // A box's JVM used to inherit the build's own shell environment: JDK_JAVA_OPTIONS or
    // JAVA_TOOL_OPTIONS set there can silently change a box's classified behavior (the finding proved
    // JDK_JAVA_OPTIONS=-Xshare:auto flips an ArrayIndexOutOfBoundsException box from uncaught to exit-1,
    // because the java launcher prints a "NOTE: Picked up JDK_JAVA_OPTIONS..." line to stderr first). ProcessBuilder's
    // environment() otherwise mirrors the CURRENT process's environment, so this simulates the author's shell
    // by mutating a throwaway ProcessBuilder's own map, never the real test runner's environment.
    var pb = new ProcessBuilder("true");
    pb.environment().put("JDK_JAVA_OPTIONS", "-Xshare:auto");
    pb.environment().put("JAVA_TOOL_OPTIONS", "-Dsomething=weird");
    Jdk.cleanEnvironment(pb);
    T.check(!pb.environment().containsKey("JDK_JAVA_OPTIONS"), "JDK_JAVA_OPTIONS is stripped: " + pb.environment());
    T.check(!pb.environment().containsKey("JAVA_TOOL_OPTIONS"), "JAVA_TOOL_OPTIONS is stripped: " + pb.environment());
    T.eq("/usr/bin:/bin", pb.environment().get("PATH"), "PATH is fixed, matching runtime/test/jdk.mjs");
    T.eq("en_US.UTF-8", pb.environment().get("LANG"), "LANG is fixed, matching runtime/test/jdk.mjs");
    T.check(pb.environment().keySet().stream().allMatch(java.util.Set.of("PATH", "LANG", "HOME")::contains),
        "nothing beyond PATH/LANG/HOME survives: " + pb.environment());
  }
  static void testCleanEnvironmentIsActuallyAppliedToABoxsSubprocess() throws Exception {
    // testCleanEnvironmentStripsWhateverTheBuildsOwnShellSet above proves cleanEnvironment's own behavior in
    // isolation on a throwaway ProcessBuilder, but removing the cleanEnvironment call from Jdk.run or
    // Bundle.runAsReaderWould would fail no test: neither is ever asked what its own subprocess actually
    // saw. This runs a box through both paths that prints its own sorted environment variable names, the
    // way a box's JVM itself would see them. The test JVM's own environment has many more variables (USER,
    // SHELL and others), so a missing cleanEnvironment call makes the assertion fail.
    String src = "void main() { var names = new java.util.TreeSet<>(System.getenv().keySet()); "
        + "IO.println(String.join(\",\", names)); }\n";
    var allowed = java.util.Set.of("HOME", "LANG", "PATH", "__CF_USER_TEXT_ENCODING");

    var c = Jdk.compile(src, dir("env-run"));
    var r = Jdk.run(c.classes(), "", Duration.ofSeconds(10));
    T.eq("ok", r.status(), "Jdk.run status: " + r);
    for (String name : r.stdout().trim().split(","))
      T.check(allowed.contains(name), "Jdk.run's box saw an unexpected environment variable " + name + ": " + r.stdout());

    Path bundleDir = dir("env-bundle");
    Files.createDirectories(bundleDir);
    Path file = bundleDir.resolve("env.java");
    Files.writeString(file, src);
    var br = Bundle.runAsReaderWould(file, Duration.ofSeconds(10));
    T.eq("ok", br.status(), "Bundle.runAsReaderWould status: " + br);
    for (String name : br.stdout().trim().split(","))
      T.check(allowed.contains(name), "Bundle.runAsReaderWould's box saw an unexpected environment variable " + name + ": " + br.stdout());
  }
  static void testUncaughtAndExitCodesAreClassifiedLikeJdkMjs() throws Exception {
    var u = Jdk.run(Jdk.compile("void main() { throw new IllegalStateException(\"no\"); }\n", dir("u")).classes(), "", Duration.ofSeconds(10));
    T.eq("uncaught", u.status(), "uncaught");
    T.check(u.stderr().startsWith("Exception in thread \"main\" java.lang.IllegalStateException: no"), u.stderr());
    var e = Jdk.run(Jdk.compile("void main() { System.exit(3); }\n", dir("e")).classes(), "", Duration.ofSeconds(10));
    T.eq("exit-3", e.status(), "exit code");
  }
}
