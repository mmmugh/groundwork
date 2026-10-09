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

final class VolumeTest {
  static void testLoadsTheFixtureInPageOrder() throws Exception {
    Path p = Fixtures.project("volume");
    Volume v = Volume.loadAll(p.resolve("volumes")).get(0);
    T.eq("vol-fixture", v.slug(), "slug");
    T.eq(List.of("00-front-matter", "ch01-first-programs", "ch02-types-and-input", "ch02-types-and-input-practice", "99-appendices"),
        v.pages().stream().map(Page::slug).toList(), "front matter, chapters with their practice pages, appendices");
    T.eq(2, v.pages().get(3).chapter(), "a practice page belongs to its chapter");
    T.check(v.pages().get(3).practice(), "practice flag");
    T.eq(-1, v.pages().get(0).chapter(), "front matter has no chapter");
    T.eq(8, v.boxes().size(), "box declarations loaded");
    T.eq(1, v.quizzes().size(), "quizzes found");
  }
  static void testABadVolumeFileFailsTheBuildWithItsName() throws Exception {
    Path p = Fixtures.project("volume-bad");
    Files.writeString(p.resolve("volumes/vol-fixture/volume.json"), "{\"number\": 1, \"title\": }");
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "exit code");
    T.check(r.out().contains("volume.json") && r.out().contains("line 1"), "message names the file and position: " + r.out());
  }
  static void testAMissingTitleIsAnError() throws Exception {
    Path p = Fixtures.project("volume-title");
    Files.writeString(p.resolve("volumes/vol-fixture/volume.json"), "{\"number\": 1}");
    T.fails("title", () -> Volume.loadAll(p.resolve("volumes")), "title is required");
  }
  static void testTwoChapterFilesParsingToTheSameNumberIsAnError() throws Exception {
    // Not only digit strings that differ ("01" vs "1") collide—any two files parsing to the same chapter
    // number do, including a stale renamed chapter file left behind (it sorts after the real one and used to
    // win silently, exit 0, the real chapter simply gone).
    Path p = Fixtures.project("volume-chapter-collision");
    Files.writeString(p.resolve("volumes/vol-fixture/content/ch01-first.md"), "# Chapter 1 (stale)\n");
    T.fails("ch01-first-programs.md", () -> Volume.loadAll(p.resolve("volumes")), "names the original file");
    T.fails("ch01-first.md", () -> Volume.loadAll(p.resolve("volumes")), "names the colliding file");
    T.fails("chapter 1", () -> Volume.loadAll(p.resolve("volumes")), "names the chapter number");
  }
  static void testAVolumeNamedLikeASitePathTheBuildWritesIsRefused() throws Exception {
    for (String name : List.of("runtime", "runner", "page", "scratchpad", "Scratchpad")) {
      Path p = Fixtures.project("volume-reserved");
      Files.move(p.resolve("volumes/vol-fixture"), p.resolve("volumes").resolve(name));
      T.fails("\"" + name + "\" has a name the site keeps for itself", () -> Volume.loadAll(p.resolve("volumes")), name + " is refused");
    }
    Path p = Fixtures.project("volume-reserved-build");
    Files.move(p.resolve("volumes/vol-fixture"), p.resolve("volumes/scratchpad"));
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "the build stops before writing a volume into site/scratchpad/: " + r.out());
    T.check(r.out().contains("has a name the site keeps for itself"), "and says why: " + r.out());
  }
  static void testUnknownArgumentsAreMisuse() throws Exception {
    var r = Fixtures.build(Fixtures.project("args"), "--chekc");
    T.eq(2, r.exit(), "a typo is misuse, not a silent plain build");
  }
}
