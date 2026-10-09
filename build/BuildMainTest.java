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

/** Build.main as a reader runs it: a subprocess of the pinned JDK, from the repository root. */
final class BuildMainTest {
  static final String JAVA = Path.of(System.getProperty("java.home"), "bin", "java").toString();
  record Out(int exit, String text) {}
  static Out main(String... args) throws Exception {
    var cmd = new ArrayList<>(List.of(JAVA, "build/Build.java"));
    cmd.addAll(List.of(args));
    Process p = new ProcessBuilder(cmd).directory(Fixtures.TOOLS.toFile()).redirectErrorStream(true).start();
    String text = new String(p.getInputStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
    return new Out(p.waitFor(), text);
  }
  static void testProjectBuildsAnotherDirectory() throws Exception {
    Path p = Fixtures.project("main-project");
    var o = main("--project", p.toString(), "--runtime", Fixtures.DIST.toString(),
        "--scratchpad", Fixtures.SCRATCHPAD.toString());
    T.eq(0, o.exit(), "exit: " + o.text());
    T.check(Files.exists(p.resolve("site/vol-fixture/ch01-first-programs.html")), "the project's site/ was written");
    T.check(Files.exists(p.resolve("site/scratchpad/manifest.json")), "with its scratchpad");
  }
  static void testAMissingProjectIsMisuse() throws Exception {
    // The path is made absent here, not assumed absent: a stray directory of that name (a leftover, a
    // careless mkdir) would make the build run on it and the test fail for a reason that has nothing to do
    // with a missing project.
    Path missing = Fixtures.TOOLS.resolve("build/.work/tests/no-such-project");
    Fixtures.deleteTree(missing);
    var o = main("--project", missing.toString());
    T.eq(2, o.exit(), "a missing project directory is misuse: " + o.text());
    T.check(o.text().contains("no such project directory:"), "and it says why, not just the usage line: " + o.text());
  }
  static void testABareProjectFlagIsMisuse() throws Exception {
    // --project with nothing after it names no directory to build: misuse, with the usage line, not a build of
    // the repository itself and not a crash on the missing argument.
    var o = main("--project");
    T.eq(2, o.exit(), "a bare --project is misuse: " + o.text());
    T.check(o.text().contains("usage: java build/Build.java"), "and it prints the usage line: " + o.text());
  }
}
