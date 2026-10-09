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
import java.util.*;
import java.util.regex.*;

/**
 * The Markdown subset Python Foundations' course used: headings 1 to 3, fences, pipe tables, flat
 * lists, one-line quotes, paragraphs, and inline code/bold/italic/links. CRLF is normalized to LF
 * before anything else.
 */
final class Markdown {
  private Markdown() {}

  sealed interface Block permits Heading, Para, Fence, Bullets, Quote, Table {}
  record Heading(int level, String text) implements Block {}
  record Para(String text) implements Block {}
  record Fence(String lang, String body) implements Block {}
  record Bullets(boolean ordered, List<String> items) implements Block {}
  record Quote(String text) implements Block {}
  record Table(List<String> header, List<List<String>> rows) implements Block {}

  /** A fence opener: CommonMark says a backtick fence's info string may not itself contain a backtick, so
   *  a line like "```output``` fence right after it." (a wrapped paragraph line that merely starts with
   *  ```) is not a fence opener. */
  private static final Pattern FENCE_OPEN = Pattern.compile("```[^`]*");
  private static final Pattern HEADING = Pattern.compile("(#{1,3}) (.*)");
  private static final Pattern ORDERED_ITEM = Pattern.compile("\\d+\\. ");
  private static final Pattern DELIMITER_ROW = Pattern.compile("[|:\\- ]+");
  private static final Pattern CODE_SPAN = Pattern.compile("`([^`]+)`");
  private static final Pattern BOLD = Pattern.compile("\\*\\*([^*]+)\\*\\*");
  private static final Pattern ITALIC = Pattern.compile("(?<!\\*)\\*([^*]+)\\*(?!\\*)");
  private static final Pattern LINK = Pattern.compile("\\[([^\\]]+)\\]\\(([^)\\s]+)\\)");
  private static final Pattern STASH = Pattern.compile("\u0000(\\d+)\u0000");

  /** Blocks for input already known good, e.g. in tests. An unclosed fence runs to the end of the input. */
  static List<Block> blocks(String md) {
    try { return parse(md, false); }
    catch (BuildError e) { throw new RuntimeException(e); }
  }

  /** Blocks for a real page. Throws BuildError if a fence never closes. */
  static List<Block> checkedBlocks(String md) throws BuildError { return parse(md, true); }

  private static List<Block> parse(String md, boolean strict) throws BuildError {
    String[] lines = md.replace("\r\n", "\n").replace("\r", "\n").split("\n", -1);
    List<Block> blocks = new ArrayList<>();
    int i = 0, n = lines.length;
    while (i < n) {
      String line = lines[i];

      if (isFenceOpen(line)) {
        String lang = line.substring(3).trim();
        StringBuilder body = new StringBuilder();
        i++;
        boolean closed = false;
        while (i < n) {
          if (lines[i].equals("```")) { closed = true; i++; break; }
          body.append(lines[i]).append('\n');
          i++;
        }
        if (!closed && strict) throw new BuildError("unclosed fence (" + (lang.isEmpty() ? "no language" : lang) + ")");
        blocks.add(new Fence(lang, body.toString()));
        continue;
      }

      // A line of four or more backticks is not a fence opener under isFenceOpen's exact-three rule, so
      // without this it fell through into a silent one-line paragraph and the box it declared vanished with
      // no error (the course uses three backticks only). checkedBlocks (strict) refuses it; blocks()
      // (lenient, for input already known good) must not throw, so this check runs only when strict.
      if (strict && isOversizedFenceOpen(line))
        throw new BuildError("fences of four or more backticks are not supported (the course uses three)");

      if (line.isBlank()) { i++; continue; }

      Matcher heading = HEADING.matcher(line);
      if (heading.matches()) {
        blocks.add(new Heading(heading.group(1).length(), heading.group(2)));
        i++;
        continue;
      }

      if (line.startsWith("|")) {
        List<String> rows = new ArrayList<>();
        while (i < n && lines[i].startsWith("|")) { rows.add(lines[i]); i++; }
        if (rows.size() < 2 || !DELIMITER_ROW.matcher(rows.get(1)).matches())
          throw new BuildError("table without a delimiter row");
        List<String> header = tableRow(rows.get(0));
        List<List<String>> body = new ArrayList<>();
        for (int r = 2; r < rows.size(); r++) body.add(tableRow(rows.get(r)));
        blocks.add(new Table(header, body));
        continue;
      }

      if (line.startsWith("- ") || line.startsWith("* ")) {
        List<String> items = new ArrayList<>();
        while (i < n && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
          items.add(lines[i].substring(2));
          i++;
        }
        blocks.add(new Bullets(false, items));
        continue;
      }

      Matcher ordered = ORDERED_ITEM.matcher(line);
      if (ordered.lookingAt()) {
        List<String> items = new ArrayList<>();
        while (i < n) {
          Matcher m = ORDERED_ITEM.matcher(lines[i]);
          if (!m.lookingAt()) break;
          items.add(lines[i].substring(m.end()));
          i++;
        }
        blocks.add(new Bullets(true, items));
        continue;
      }

      if (line.startsWith("> ")) {
        blocks.add(new Quote(line.substring(2)));
        i++;
        continue;
      }

      List<String> para = new ArrayList<>();
      // CommonMark: a fence opener always ends the current paragraph and starts a fence, blank line or
      // not (but a line that merely starts with ``` while containing another backtick, e.g. a wrapped
      // paragraph line ending in an inline code span, is not a fence opener—see isFenceOpen). Without the
      // opener check, a fence directly after a text line (no blank line between) was swallowed into the
      // paragraph as literal text, so the box it declared never existed for Audit, Vocabulary, the fork
      // gate or the bundle—a silent gate bypass.
      while (i < n && !lines[i].isBlank() && !isFenceOpen(lines[i]) && !(strict && isOversizedFenceOpen(lines[i]))) {
        para.add(lines[i]);
        i++;
      }
      blocks.add(new Para(String.join("\n", para)));
    }
    return blocks;
  }

  private static boolean isFenceOpen(String line) {
    return FENCE_OPEN.matcher(line).matches();
  }

  /** A line of four or more backticks: not a fence opener (isFenceOpen requires exactly three), and not
   *  supported as one either—the course uses three backticks only. */
  private static boolean isOversizedFenceOpen(String line) {
    return line.startsWith("````");
  }

  private static List<String> tableRow(String row) {
    String r = row.trim();
    if (r.startsWith("|")) r = r.substring(1);
    if (r.endsWith("|")) r = r.substring(0, r.length() - 1);
    List<String> cells = new ArrayList<>();
    for (String c : r.split("\\|", -1)) cells.add(c.trim());
    return cells;
  }

  /** Inline markdown to HTML: code spans, then escaping, then bold/italic/links. */
  static String inline(String text) {
    List<String> spans = new ArrayList<>();
    StringBuilder stashed = new StringBuilder();
    Matcher code = CODE_SPAN.matcher(text);
    int last = 0;
    while (code.find()) {
      stashed.append(text, last, code.start());
      spans.add(code.group(1));
      stashed.append('\u0000').append(spans.size() - 1).append('\u0000');
      last = code.end();
    }
    stashed.append(text, last, text.length());

    String out = escape(stashed.toString());
    out = BOLD.matcher(out).replaceAll("<strong>$1</strong>");
    out = ITALIC.matcher(out).replaceAll("<em>$1</em>");
    out = LINK.matcher(out).replaceAll(m -> "<a href=\"" + m.group(2) + "\">" + m.group(1) + "</a>");

    Matcher restore = STASH.matcher(out);
    StringBuilder result = new StringBuilder();
    int rlast = 0;
    while (restore.find()) {
      result.append(out, rlast, restore.start());
      result.append("<code>").append(escape(spans.get(Integer.parseInt(restore.group(1))))).append("</code>");
      rlast = restore.end();
    }
    result.append(out, rlast, out.length());
    return result.toString();
  }

  private static String escape(String s) {
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
  }

  /** A block as HTML. Not for Fence: pages render fences themselves. */
  static String html(Block block) {
    return switch (block) {
      case Heading h -> "<h" + h.level() + " id=\"" + slug(h.text()) + "\">" + inline(h.text()) + "</h" + h.level() + ">";
      case Para p -> "<p>" + inline(p.text()) + "</p>";
      case Bullets l -> {
        String tag = l.ordered() ? "ol" : "ul";
        StringBuilder sb = new StringBuilder("<").append(tag).append(">");
        for (String item : l.items()) sb.append("<li>").append(inline(item)).append("</li>");
        sb.append("</").append(tag).append(">");
        yield sb.toString();
      }
      case Quote q -> "<blockquote><p>" + inline(q.text()) + "</p></blockquote>";
      case Table t -> {
        StringBuilder sb = new StringBuilder("<table><thead><tr>");
        for (String h : t.header()) sb.append("<th>").append(inline(h)).append("</th>");
        sb.append("</tr></thead><tbody>");
        for (List<String> row : t.rows()) {
          sb.append("<tr>");
          for (String c : row) sb.append("<td>").append(inline(c)).append("</td>");
          sb.append("</tr>");
        }
        sb.append("</tbody></table>");
        yield sb.toString();
      }
      case Fence f -> throw new IllegalArgumentException("a fence has no html(); pages render it themselves");
    };
  }

  private static String slug(String text) {
    String s = text.toLowerCase().replaceAll("[^a-z0-9]+", "-");
    return s.replaceAll("^-+", "").replaceAll("-+$", "");
  }
}
