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
import java.util.*;

final class BundleTest {
  static void testEveryFileRunsUnchangedAndPrintsWhatThePageSays() throws Exception {
    Path p = Fixtures.project("bundle");
    T.eq(0, Fixtures.build(p).exit(), "build");
    Path b = p.resolve("site/vol-fixture/bundle");
    T.check(Files.exists(b.resolve("ch01/ch01_01.java")), "first box");
    T.check(!Files.exists(b.resolve("ch01/ch01_03.java")), "no file for a reference box");
    String first = Files.readString(b.resolve("ch01/ch01_01.java"));
    T.check(first.startsWith("void main() {\n    IO.println(\"Hello, <world> & café 😀\");"), "raw source, not escaped, first line first");
    var r = Bundle.runAsReaderWould(b.resolve("ch01/ch01_02.java"), Duration.ofSeconds(20));
    T.check(r.stderr().contains("at ch01_02.main(ch01_02.java:3)"), "the crash is on the line the page shows: " + r.stderr());
    var h = Bundle.runAsReaderWould(b.resolve("ch01/ch01_01.java"), Duration.ofSeconds(20));
    T.eq("Hello, <world> & café 😀\n", h.stdout(), "prints what the page says");
    T.check(Files.readString(b.resolve("ch02/ch02_02.java")).contains("fails on purpose"), "a compile-error file says so");
    T.check(Files.readString(p.resolve("site/vol-fixture/bundle.html")).contains("ch02_01.java"), "listed");
  }
}
