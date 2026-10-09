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
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** One published volume: its metadata, its pages in publish order, its box and check declarations, and the
 *  paths to its private files (solutions, quizzes). */
record Volume(String slug, Path dir, long number, String title, String subtitle, String blurb,
              List<Page> pages, Map<String, Object> boxes, Map<String, Object> checks,
              Path solutions, List<Path> quizzes) {

  private static final Pattern FRONT = Pattern.compile("00-.*\\.md");
  private static final Pattern CHAPTER = Pattern.compile("ch(\\d+)-.*\\.md");
  private static final Pattern APPENDIX = Pattern.compile("99-.*\\.md");

  /** Site paths the build writes for itself (site/runtime/, site/runner/, site/page/, site/scratchpad/): a volume
   *  named like one would publish into it or be wiped by it. Compared ignoring case, since the filesystem may. */
  static final List<String> RESERVED = List.of("runtime", "runner", "page", "scratchpad");

  /** Loads every volumes/*&#47;volume.json, sorted by number. */
  static List<Volume> loadAll(Path volumesDir) throws BuildError {
    List<Path> dirs;
    if (!Files.isDirectory(volumesDir)) return List.of();
    try (var s = Files.list(volumesDir)) {
      dirs = s.filter(Files::isDirectory).sorted().toList();
    } catch (IOException e) {
      throw new BuildError(volumesDir + ": " + e.getMessage());
    }
    List<Volume> volumes = new ArrayList<>();
    for (Path dir : dirs) {
      Path volumeJson = dir.resolve("volume.json");
      if (!Files.exists(volumeJson)) continue;
      String name = dir.getFileName().toString();
      if (RESERVED.contains(name.toLowerCase(java.util.Locale.ROOT)))
        throw new BuildError("volume directory \"" + name + "\" has a name the site keeps for itself (" + String.join(", ", RESERVED)
            + "); rename it");
      volumes.add(load(dir, volumeJson));
    }
    volumes.sort(Comparator.comparingLong(Volume::number));
    for (int i = 1; i < volumes.size(); i++) {
      if (volumes.get(i - 1).number == volumes.get(i).number)
        throw new BuildError("volumes \"" + volumes.get(i - 1).slug + "\" and \"" + volumes.get(i).slug
            + "\" both claim number " + volumes.get(i).number);
    }
    return volumes;
  }

  private static Volume load(Path dir, Path volumeJson) throws BuildError {
    Object parsed = parseJsonFile(volumeJson);
    if (!(parsed instanceof Map<?, ?> raw)) throw new BuildError(volumeJson + ": expected a JSON object");
    Object numberVal = raw.get("number");
    if (!(numberVal instanceof Long number))
      throw new BuildError(volumeJson + ": \"number\" is required and must be an integer");
    Object titleVal = raw.get("title");
    if (!(titleVal instanceof String title) || title.isEmpty())
      throw new BuildError(volumeJson + ": \"title\" is required");
    String subtitle = raw.get("subtitle") instanceof String s ? s : "";
    String blurb = raw.get("blurb") instanceof String s ? s : "";

    String slug = dir.getFileName().toString();
    List<Page> pages = loadPages(dir);
    Map<String, Object> boxes = loadJsonObject(dir.resolve("content/_boxes.json"));
    Map<String, Object> checks = loadJsonObject(dir.resolve("content/_checks.json"));
    Path solutionsFile = dir.resolve("content/_solutions.md");
    Path solutions = Files.exists(solutionsFile) ? solutionsFile : null;
    List<Path> quizzes = loadQuizzes(dir);

    return new Volume(slug, dir, number, title, subtitle, blurb, pages, boxes, checks, solutions, quizzes);
  }

  private static List<Page> loadPages(Path dir) throws BuildError {
    Path content = dir.resolve("content");
    List<Path> files;
    try (var s = Files.list(content)) {
      files = s.filter(f -> f.getFileName().toString().endsWith(".md")).sorted().toList();
    } catch (IOException e) {
      throw new BuildError(content + ": " + e.getMessage());
    }

    List<Page> front = new ArrayList<>();
    List<Page> appendices = new ArrayList<>();
    TreeMap<Integer, Chapter> chapters = new TreeMap<>();
    for (Path f : files) {
      String name = f.getFileName().toString();
      if (name.startsWith("_")) continue; // _solutions.md; handled separately
      if (FRONT.matcher(name).matches()) { front.add(pageOf(f, -1, false)); continue; }
      if (APPENDIX.matcher(name).matches()) { appendices.add(pageOf(f, -1, false)); continue; }
      Matcher m = CHAPTER.matcher(name);
      if (m.matches()) {
        int num = Integer.parseInt(m.group(1));
        Chapter existing = chapters.get(num);
        // Any two files that parse to the same chapter number collide, not only digit strings that differ
        // ("01" vs "1"): a stale renamed chapter file left behind is the realistic case, and it sorted after
        // the real one and silently won, exit 0, with the real chapter's boxes, audit and vocabulary
        // contribution simply gone. The volume-number collision a few lines up is already a BuildError; this
        // one now is too.
        if (existing != null)
          throw new BuildError("chapter " + num + ": both " + existing.file().getFileName() + " and " + name + " claim it");
        chapters.put(num, new Chapter(m.group(1), f));
        continue;
      }
      throw new BuildError(f + ": not a front-matter, chapter or appendix file");
    }

    Path practiceDir = dir.resolve("practice");
    List<Path> practiceFiles = List.of();
    if (Files.isDirectory(practiceDir)) {
      try (var s = Files.list(practiceDir)) {
        practiceFiles = s.filter(f -> f.getFileName().toString().endsWith(".md")).sorted().toList();
      } catch (IOException e) {
        throw new BuildError(practiceDir + ": " + e.getMessage());
      }
    }

    List<Page> pages = new ArrayList<>(front);
    for (var e : chapters.entrySet()) {
      int chapter = e.getKey();
      Chapter c = e.getValue();
      String prefix = "ch" + c.numStr() + "-";
      pages.add(pageOf(c.file(), chapter, false));
      for (Path pf : practiceFiles)
        if (pf.getFileName().toString().startsWith(prefix)) pages.add(pageOf(pf, chapter, true));
    }
    pages.addAll(appendices);
    return pages;
  }

  /** A chapter's content file, keyed by its number as written (e.g. "01") so a practice file's own
   *  "chNN-" prefix can be matched against exactly the same digits. */
  private record Chapter(String numStr, Path file) {}

  private static Page pageOf(Path file, int chapter, boolean practice) {
    String name = file.getFileName().toString();
    return new Page(name.substring(0, name.length() - ".md".length()), file, chapter, practice);
  }

  private static List<Path> loadQuizzes(Path dir) throws BuildError {
    Path quizzesDir = dir.resolve("quizzes");
    if (!Files.isDirectory(quizzesDir)) return List.of();
    try (var s = Files.list(quizzesDir)) {
      return s.filter(f -> f.getFileName().toString().endsWith("-quiz.txt")).sorted().toList();
    } catch (IOException e) {
      throw new BuildError(quizzesDir + ": " + e.getMessage());
    }
  }

  private static Map<String, Object> loadJsonObject(Path file) throws BuildError {
    if (!Files.exists(file)) return Map.of();
    Object parsed = parseJsonFile(file);
    if (!(parsed instanceof Map<?, ?> raw)) throw new BuildError(file + ": expected a JSON object");
    @SuppressWarnings("unchecked")
    Map<String, Object> m = (Map<String, Object>) raw;
    return m;
  }

  private static Object parseJsonFile(Path file) throws BuildError {
    String text;
    try {
      text = Files.readString(file, StandardCharsets.UTF_8);
    } catch (IOException e) {
      throw new BuildError(file + ": " + e.getMessage());
    }
    try {
      return Json.parse(text);
    } catch (BuildError e) {
      throw new BuildError(file + ": " + e.getMessage());
    }
  }
}
