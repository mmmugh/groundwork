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
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Extracts the boxes from one page's Markdown, and checks a volume's _boxes.json against the boxes that
 *  actually exist. A ```java``` fence is a box; an ```output``` fence (or an untagged fence) directly after
 *  it is that box's stated output. */
final class Boxes {
  private Boxes() {}

  /** The boxes on one page, in document order. Never throws for a malformed _boxes.json entry: that is
   *  Boxes.validate's job, so every problem can be reported together instead of stopping at the first
   *  page that happens to hit one. A box with no entry gets Decl.EMPTY. */
  static List<Box> of(Volume v, Page p) throws BuildError {
    String md;
    try {
      md = Files.readString(p.file(), StandardCharsets.UTF_8);
    } catch (IOException e) {
      throw new BuildError(p.file() + ": " + e.getMessage());
    }
    List<Markdown.Block> blocks;
    try {
      blocks = Markdown.checkedBlocks(md);
    } catch (BuildError e) {
      throw new BuildError(p.file() + ": " + e.getMessage());
    }

    List<Box> boxes = new ArrayList<>();
    int index = 0;
    for (int i = 0; i < blocks.size(); i++) {
      if (!(blocks.get(i) instanceof Markdown.Fence f) || !f.lang().equals("java")) continue;
      index++;
      String id = p.slug() + "#" + index;
      String expected = isOutput(blocks, i + 1) ? ((Markdown.Fence) blocks.get(i + 1)).body() : null;

      Object raw = v.boxes().get(id);
      Decl decl = Decl.EMPTY;
      if (raw != null) {
        try {
          decl = Decl.from(id, raw);
        } catch (BuildError ignored) {
          // malformed; Boxes.validate reports it, not this extraction pass
        }
      }
      boxes.add(new Box(id, p, index, f.body(), expected, decl));
    }
    return boxes;
  }

  /** True when blocks.get(i) is the output fence that a box directly above it consumes as its stated
   *  output: an untagged fence, or one tagged "output". */
  static boolean isOutput(List<Markdown.Block> blocks, int i) {
    return i < blocks.size() && blocks.get(i) instanceof Markdown.Fence f
        && (f.lang().isEmpty() || f.lang().equals("output"));
  }

  /** Checks every _boxes.json entry, and through Checks.problems every _checks.json entry, against the
   *  boxes that actually exist on v's pages, collecting every problem into one BuildError (one line each)
   *  rather than stopping at the first. */
  static void validate(Volume v, Map<Page, List<Box>> all) throws BuildError {
    Set<String> ids = new LinkedHashSet<>();
    for (List<Box> boxes : all.values()) for (Box b : boxes) ids.add(b.id());

    List<String> problems = new ArrayList<>();
    for (var e : v.boxes().entrySet()) {
      String id = e.getKey();
      if (!ids.contains(id)) {
        problems.add(id + ": no such box");
        continue;
      }
      try {
        Decl.from(id, e.getValue());
      } catch (BuildError err) {
        problems.add(err.getMessage());
      }
    }
    // A reference box never runs, and a compileError box never reaches its stated output: Audit skips rule
    // 4 (the output comparison) for both, so a stated output fence under either is published to the page and
    // checked by nothing. Reject the fence at validation time instead of publishing it unchecked.
    for (List<Box> boxes : all.values()) {
      for (Box b : boxes) {
        if (b.expected() == null) continue;
        if (b.decl().reference())
          problems.add(b.id() + ": a reference box never runs, so its stated output fence is never checked; remove it");
        else if (b.decl().compileError() != null)
          problems.add(b.id() + ": a compileError box never reaches its output, so its stated output fence is never checked; remove it");
      }
    }
    problems.addAll(Checks.problems(v, all));
    if (!problems.isEmpty()) throw new BuildError(String.join("\n", problems));
  }
}
