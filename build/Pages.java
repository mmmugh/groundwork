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
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Renders a build's volumes to site/, using web/page.html as the per-page template and web/app.css as the
 *  one stylesheet. Volumes.of + Boxes.validate are Build's job; this class only renders what it is given. */
final class Pages {
  private Pages() {}

  private static final Pattern PART = Pattern.compile("<!-- part: (.*) -->");

  /** web/page.html's own leading Apache-2.0 header comment (Code's license, not the course's): the block
   *  right after &lt;!doctype html&gt;, up to and including its closing --&gt;. Kept on the source file (it
   *  is Code), stripped from every rendered page (which is CC BY-NC-SA 4.0 course content, not code), so a
   *  reader never sees a page claim the wrong license. Unrelated to the {{part}} comment stripped out of each
   *  chapter's own Markdown in render() below—that one strips a per-page label from content; this one
   *  strips the template's own license notice, once, before token substitution. Its own group captures the
   *  comment's body, so stripLicenseHeader can check it is actually the Apache header before stripping it. */
  private static final Pattern LEADING_COMMENT = Pattern.compile("(?s)\\A<!doctype html>\\n<!--(.*?)-->\\n");
  private static final String APACHE_MARKER = "Licensed under the Apache License";

  /** Renders every current volume's pages, writes site/boxes.json and site/index.html, and copies web/app.css. Build.run
   *  has already emptied site/ (Publish.empty), so a volume that no longer exists is simply not written. project is the
   *  volumes/site/web root. */
  static void writeSite(List<Volume> volumes, Map<Volume, Map<Page, List<Box>>> boxes, Path project) throws BuildError {
    Path site = project.resolve("site");
    Path web = project.resolve("web");

    try {
      Files.createDirectories(site);
    } catch (IOException e) {
      throw new BuildError(site + ": " + e.getMessage());
    }

    List<Map<String, Object>> entries = new ArrayList<>();
    for (Volume v : volumes) {
      Map<Page, List<Box>> pageBoxes = boxes.get(v);
      write(v, pageBoxes, site);
      for (Page p : v.pages()) for (Box b : pageBoxes.get(p)) entries.add(entry(v, b));
    }

    writeFile(site.resolve("boxes.json"), Json.write(entries));
    writeIndex(site, volumes);
    try {
      Files.copy(web.resolve("app.css"), site.resolve("app.css"), StandardCopyOption.REPLACE_EXISTING);
    } catch (IOException e) {
      throw new BuildError(web.resolve("app.css") + ": " + e.getMessage());
    }
  }

  /** The page's own scripts, as paths under web/ (and under site/, where they publish at the same path). Publishing
   *  is by whitelist (DESIGN section 4): nothing under web/ reaches site/ unless it is named here, so web/test/,
   *  the dev server and a script still being written stay off the site, and a new page script is published only
   *  by being added to this list. */
  static final List<String> WEB_SCRIPTS = List.of("app.js", "page/support.js", "page/wire.js", "page/box.js", "page/replay.js",
      "page/transcript.js", "page/check.js", "page/scratchpad.js", "page/jshell-session.js", "page/sha256.js", "page/compose.js",
      "runner/browser-runner.js", "runner/browser-worker.js", "runner/doors.js");

  /** The runner files the page shares with the Node runner: they live in runtime/runner/ (the tools tree) and
   *  publish under site/runner/. */
  static final List<String> RUNNER_SHARED = List.of("tjava-core.js", "worker-protocol.js", "java-line.js");

  /** Copies every WEB_SCRIPTS name from project/web/ to site/ and every RUNNER_SHARED name from
   *  tools/runtime/runner/ to site/runner/. A listed file that is missing is a BuildError naming it. */
  static void copyScripts(Path tools, Path project, Path site) throws BuildError {
    for (String name : WEB_SCRIPTS) copyScript(project.resolve("web").resolve(name), site.resolve(name));
    for (String name : RUNNER_SHARED)
      copyScript(tools.resolve("runtime/runner").resolve(name), site.resolve("runner").resolve(name));
  }

  private static void copyScript(Path from, Path to) throws BuildError {
    if (!Files.isRegularFile(from)) throw new BuildError(from + ": a page script the build publishes is missing");
    try {
      Files.createDirectories(to.getParent());
      Files.copy(from, to, StandardCopyOption.REPLACE_EXISTING);
    } catch (IOException e) {
      throw new BuildError(to + ": " + e.getMessage());
    }
  }

  /** Renders one volume's pages to site/<slug>/<page>.html from web/page.html. site is the project's site/
   *  directory; web/page.html is read from the web/ directory beside it. */
  static void write(Volume v, Map<Page, List<Box>> boxes, Path site) throws BuildError {
    Path web = site.getParent().resolve("web");
    Path pageHtml = web.resolve("page.html");
    // No .gitattributes normalizes this on checkout: a CRLF copy must strip exactly like an LF one, not
    // fail stripLicenseHeader's regex and blame the header's shape for what is really just line endings.
    String raw = readFile(pageHtml).replace("\r\n", "\n").replace("\r", "\n");
    String template = stripLicenseHeader(raw, pageHtml);
    Path volDir = site.resolve(v.slug());
    try {
      Files.createDirectories(volDir);
    } catch (IOException e) {
      throw new BuildError(volDir + ": " + e.getMessage());
    }

    List<Page> pages = v.pages();
    List<Rendered> rendered = new ArrayList<>();
    for (Page p : pages) rendered.add(render(v, p.file(), boxes.get(p)));

    for (int i = 0; i < pages.size(); i++) {
      Page p = pages.get(i);
      Rendered r = rendered.get(i);
      String title = escape(r.pageTitle()) + " - " + escape(v.title());
      String volume = escape(v.title());
      String part = r.part().isEmpty() ? "" : "<p class=\"part\">" + escape(r.part()) + "</p>";
      String prev = i > 0 ? link(pages.get(i - 1).slug(), rendered.get(i - 1).pageTitle()) : "";
      String next = i < pages.size() - 1 ? link(pages.get(i + 1).slug(), rendered.get(i + 1).pageTitle()) : "";
      String html = template
          .replace("{{title}}", title)
          .replace("{{volume}}", volume)
          .replace("{{part}}", part)
          .replace("{{prev}}", prev)
          .replace("{{next}}", next)
          .replace("{{body}}", r.body());
      writeFile(volDir.resolve(p.slug() + ".html"), html);
    }
  }

  /** Strips web/page.html's own Apache-2.0 header comment before it is copied verbatim into every
   *  generated page: the template is Code and rightly carries the header, but a rendered page is course
   *  content under a different license, and copying the comment made every page claim Apache-2.0. */
  private static String stripLicenseHeader(String template, Path file) throws BuildError {
    Matcher m = LEADING_COMMENT.matcher(template);
    if (!m.find())
      throw new BuildError(file + ": expected its Apache-2.0 header comment right after <!doctype html>, to strip before publishing");
    if (!m.group(1).contains(APACHE_MARKER))
      throw new BuildError(file + ": expected the comment right after <!doctype html> to be the Apache-2.0 header"
          + " (containing \"" + APACHE_MARKER + "\"), to strip before publishing; found a different comment");
    return m.replaceFirst("<!doctype html>\n");
  }

  private static String link(String slug, String title) {
    return "<a href=\"" + slug + ".html\">" + escape(title) + "</a>";
  }

  /** One page's rendered pieces: its own first-heading text (for {{title}} and adjacent-page links), its
   *  stripped-out part label, and its body HTML. */
  private record Rendered(String pageTitle, String part, String body) {}

  private static Rendered render(Volume v, Path file, List<Box> boxes) throws BuildError {
    String raw;
    try {
      raw = Files.readString(file, StandardCharsets.UTF_8);
    } catch (IOException e) {
      throw new BuildError(file + ": " + e.getMessage());
    }
    String normalized = raw.replace("\r\n", "\n").replace("\r", "\n");

    String part = "";
    String md = normalized;
    int nl = normalized.indexOf('\n');
    String firstLine = nl >= 0 ? normalized.substring(0, nl) : normalized;
    Matcher m = PART.matcher(firstLine);
    if (m.matches()) {
      part = m.group(1);
      md = nl >= 0 ? normalized.substring(nl + 1) : "";
    }

    List<Markdown.Block> blocks = Markdown.checkedBlocks(md);
    String pageTitle = "";
    for (Markdown.Block b : blocks) {
      if (b instanceof Markdown.Heading h) { pageTitle = h.text(); break; }
    }

    StringBuilder body = new StringBuilder();
    int boxIdx = 0;
    for (int i = 0; i < blocks.size(); i++) {
      Markdown.Block blk = blocks.get(i);
      if (blk instanceof Markdown.Fence f) {
        if (f.lang().equals("java")) {
          appendBox(body, v, boxes.get(boxIdx++));
          if (Boxes.isOutput(blocks, i + 1)) i++; // its stated output fence: already consumed
          continue;
        }
        body.append("<pre>").append(escape(f.body())).append("</pre>");
        continue;
      }
      body.append(Markdown.html(blk));
    }
    return new Rendered(pageTitle, part, body.toString());
  }

  /** One box. A box with a check carries that check's published fields, and nothing more, in data-check
   *  (D37); its code is the check's starter when it has one, never the author's own fence (D40(b)), and then
   *  nothing that describes that fence either (see stated and declared). A method check lists its cases under
   *  the code; a predict box shows its code read-only and holds back its output, which is the answer the
   *  reader predicts. */
  private static void appendBox(StringBuilder out, Volume v, Box b) {
    Checks.Check c = Checks.of(v, b);
    Decl d = declared(c, b);
    if (d.why() != null && !d.why().isBlank())
      out.append("<p class=\"note\">").append(escape(d.why())).append("</p>");
    String kind = c != null && c.kind().equals("predict") ? "predict" : kindOf(d);
    out.append("<div class=\"box\" id=\"").append(b.id()).append("\" data-box=\"").append(b.id())
        .append("\" data-kind=\"").append(kind).append('"');
    if (c != null) out.append(" data-check=\"").append(escape(Json.compact(Checks.published(c, b)))).append('"');
    out.append('>');
    String source = shown(c, b);
    if (kind.equals("reference")) out.append("<pre class=\"reference\">").append(escape(source)).append("</pre>");
    else if (kind.equals("predict")) out.append("<pre class=\"predict-code\">").append(escape(source)).append("</pre>");
    else out.append("<textarea class=\"code\" wrap=\"off\" spellcheck=\"false\">").append(escape(source)).append("</textarea>");
    if (c != null && c.kind().equals("method")) {
      out.append("<div class=\"cases\"><p>What it should do:</p><ul>");
      for (List<String> cs : c.cases())
        out.append("<li><code>").append(escape(c.name() + "(" + cs.get(0) + ") -> " + cs.get(1))).append("</code></li>");
      out.append("</ul></div>");
    }
    String stated = stated(c, b);
    if (stated != null) out.append("<pre class=\"output\">").append(escape(stated)).append("</pre>");
    out.append("</div>");
  }

  /** The code a box publishes, on its page and in boxes.json: its check's starter when there is one, else
   *  its own fence. */
  private static String shown(Checks.Check c, Box b) {
    return hasStarter(c) ? c.starter() : b.source();
  }

  /** The output a box states, on its page and in boxes.json: its own stated output, except none for a
   *  predict box (the answer, which travels only in its data-check) and none for a box whose check has a
   *  starter (Ruling 18: the stated output is what the author's fence prints, not the starter). The audit
   *  still compares the author's fence with that output; it reads the Box, not this. */
  private static String stated(Checks.Check c, Box b) {
    return hasStarter(c) || (c != null && c.kind().equals("predict")) ? null : b.expected();
  }

  /** What a box declares about how it runs, on its page and in boxes.json: its own _boxes.json entry, except
   *  that a box whose check has a starter declares nothing (Ruling 18): raises, compileError, varies, stdin and
   *  the why that explains them all describe the author's fence, which the box does not publish. */
  private static Decl declared(Checks.Check c, Box b) {
    return hasStarter(c) ? new Decl(false, null, null, false, List.of(), null) : b.decl();
  }

  private static boolean hasStarter(Checks.Check c) {
    return c != null && c.starter() != null;
  }

  private static String kindOf(Decl d) {
    if (d.reference()) return "reference";
    if (d.raises() != null) return "raises";
    if (d.compileError() != null) return "compile-error";
    if (!d.stdin().isEmpty()) return "input";
    return "run";
  }

  /** A box's boxes.json entry: what the box publishes and nothing else. Its source is what the box shows
   *  (the starter rule), with only what describes that source: a starter box has no expected output and
   *  declares nothing, not even its why. A predict box's expected is null: its answer travels only inside its own
   *  box, so no one file holds every predict answer (D37). */
  private static Map<String, Object> entry(Volume v, Box b) {
    Checks.Check c = Checks.of(v, b);
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("id", b.id());
    m.put("page", b.page().slug());
    m.put("source", shown(c, b));
    m.put("expected", stated(c, b));
    Decl d = declared(c, b);
    m.put("reference", d.reference());
    m.put("raises", d.raises());
    m.put("compileError", d.compileError());
    m.put("varies", d.varies());
    m.put("stdin", d.stdin());
    m.put("why", d.why());
    m.put("check", checkKind(c));
    return m;
  }

  /** A check's public footprint in boxes.json is its kind alone (Plan 2's ruling): never its answer, its
   *  starter, or any other field the raw _checks.json entry carries. Null in, null out. */
  private static Map<String, Object> checkKind(Checks.Check c) {
    if (c == null) return null;
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("kind", c.kind());
    return m;
  }

  private static void writeIndex(Path site, List<Volume> volumes) throws BuildError {
    StringBuilder body = new StringBuilder();
    body.append("<h1>Groundwork</h1>");
    // D103: the public index must say why it is empty, never show a bare title.
    if (volumes.isEmpty()) body.append("<p>The first chapter is being written.</p>");
    for (Volume v : volumes) {
      body.append("<section class=\"volume\"><h2>").append(escape(v.title())).append("</h2>");
      if (!v.subtitle().isEmpty()) body.append("<p class=\"subtitle\">").append(escape(v.subtitle())).append("</p>");
      if (!v.blurb().isEmpty()) body.append("<p>").append(escape(v.blurb())).append("</p>");
      body.append("<ul>");
      for (Page p : v.pages())
        body.append("<li><a href=\"").append(v.slug()).append('/').append(p.slug()).append(".html\">")
            .append(escape(p.slug())).append("</a></li>");
      body.append("</ul></section>");
    }
    String html = "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
        + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
        + "<title>Groundwork</title>\n<link rel=\"stylesheet\" href=\"app.css\">\n</head>\n<body>\n<main>\n"
        + body + "\n</main>\n</body>\n</html>\n";
    writeFile(site.resolve("index.html"), html);
  }

  private static String readFile(Path file) throws BuildError {
    try {
      return Files.readString(file, StandardCharsets.UTF_8);
    } catch (IOException e) {
      throw new BuildError(file + ": " + e.getMessage());
    }
  }

  private static void writeFile(Path file, String content) throws BuildError {
    try {
      Files.writeString(file, content, StandardCharsets.UTF_8);
    } catch (IOException e) {
      throw new BuildError(file + ": " + e.getMessage());
    }
  }

  private static String escape(String s) {
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
  }
}
