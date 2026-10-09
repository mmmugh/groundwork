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

/** D53's one check: a published runtime directory without one of its notices stops the build, naming every gap. */
final class LegalFilesTest {
  static Path dir(String name, List<String> files) throws Exception {
    Path d = Fixtures.TOOLS.resolve("build/.work/tests/" + name);
    Fixtures.deleteTree(d);
    for (String f : files) { Files.createDirectories(d.resolve(f).getParent()); Files.writeString(d.resolve(f), f + " text\n"); }
    return d;
  }
  static void testEveryNamedFileMustBeThereAndNotEmpty() throws Exception {
    var names = List.of("NOTICE", "SOURCES.txt", "legal/java.base/LICENSE");
    LegalFiles.require(dir("legal-all", names), names); // must not throw
    Path d = dir("legal-gaps", List.of("NOTICE", "SOURCES.txt"));
    Files.writeString(d.resolve("SOURCES.txt"), "");
    Files.createDirectories(d.resolve("legal/java.base/LICENSE")); // a directory where the file belongs is no notice
    T.fails("SOURCES.txt: empty", () -> LegalFiles.require(d, names), "an empty file is named");
    T.fails("legal/java.base/LICENSE: missing", () -> LegalFiles.require(d, names), "a directory in a file's place is named");
    T.fails("D53", () -> LegalFiles.require(d, names), "and the message says why the build stops");
  }
}
