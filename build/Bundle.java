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
import java.io.InputStreamReader;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

/** Writes site/&lt;slug&gt;/bundle/chNN/chNN_MM.java for every non-reference box on a chapter page (never
 *  practice, front matter or appendices, and never a box whose check has a starter), and
 *  site/&lt;slug&gt;/bundle.html listing them. Each .java file is the box's source byte for byte, so its line
 *  numbers match the page, followed by a comment block that says where it came from, how to run it, and, for a
 *  raises or compileError box, that it fails on purpose and why. */
final class Bundle {
  private Bundle() {}

  /** Writes every volume's bundle. Pages.writeSite must already have created site/&lt;slug&gt; for each
   *  volume; this only adds the bundle/ directory and bundle.html beside it. */
  static void write(List<Volume> volumes, Map<Volume, Map<Page, List<Box>>> boxes, Path project) throws BuildError {
    Path site = project.resolve("site");
    for (Volume v : volumes) writeVolume(v, boxes.get(v), site);
  }

  private static void writeVolume(Volume v, Map<Page, List<Box>> pageBoxes, Path site) throws BuildError {
    Path volDir = site.resolve(v.slug());
    Path bundleDir = volDir.resolve("bundle");

    StringBuilder body = new StringBuilder();
    body.append("<h1>").append(escape(v.title())).append("—downloadable examples</h1>");

    for (Page p : v.pages()) {
      if (p.chapter() < 0 || p.practice()) continue;
      List<Box> runnable = new ArrayList<>();
      // A box whose check has a starter publishes the starter, never its own fence, which is the author's
      // answer (the starter rule): it simply has no download.
      for (Box b : pageBoxes.get(p)) {
        Checks.Check c = Checks.of(v, b);
        if (!b.decl().reference() && (c == null || c.starter() == null)) runnable.add(b);
      }
      if (runnable.isEmpty()) continue;

      String chNN = String.format("%02d", p.chapter());
      Path chDir = bundleDir.resolve("ch" + chNN);
      body.append("<section><h2>").append(escape(p.slug())).append("</h2><ul>");
      for (Box b : runnable) {
        String name = "ch" + chNN + "_" + String.format("%02d", b.index());
        writeFile(chDir.resolve(name + ".java"), b.source() + commentBlock(v, p, name, b));
        body.append("<li><a href=\"bundle/ch").append(chNN).append('/').append(name).append(".java\">")
            .append(escape(name)).append(".java</a>: ").append(escape(firstLineFor(b, Checks.of(v, b)))).append("</li>");
      }
      body.append("</ul></section>");
    }

    String html = "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
        + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<title>"
        + escape(v.title()) + " - downloads</title>\n<link rel=\"stylesheet\" href=\"../app.css\">\n</head>\n<body>\n<main>\n"
        + body + "\n</main>\n</body>\n</html>\n";
    writeFile(volDir.resolve("bundle.html"), html);
  }

  /** What the bundle.html listing says a box does: a stdin box waits for typed input; a raises or
   *  compileError box fails on purpose, with why; a predict box says only that, since its stated output is
   *  its answer and travels only inside its own box (D37), or bundle.html would be one page holding every
   *  predict answer; anything else is the first line of its stated output. */
  private static String firstLineFor(Box b, Checks.Check c) {
    Decl d = b.decl();
    if (c != null && c.kind().equals("predict")) return "predict what it prints";
    if (!d.stdin().isEmpty()) return "waits for typed input";
    if (d.raises() != null) return "fails on purpose: " + d.why();
    if (d.compileError() != null) return "fails on purpose: " + d.why();
    if (b.expected() != null) {
      int nl = b.expected().indexOf('\n');
      return nl >= 0 ? b.expected().substring(0, nl) : b.expected();
    }
    return "";
  }

  /** The trailing comment block: never precedes the source, so the source's own line numbers (and a stack
   *  trace's) are untouched. */
  private static String commentBlock(Volume v, Page p, String name, Box b) {
    Decl d = b.decl();
    StringBuilder c = new StringBuilder();
    if (!b.source().endsWith("\n")) c.append('\n');
    c.append("\n// From ").append(v.title()).append(", chapter ").append(p.chapter())
        .append(" (").append(p.slug()).append("), box ").append(b.index()).append(".\n");
    c.append("// This example is from Groundwork, licensed CC BY-NC-SA 4.0.\n");
    c.append("// Run with: java ").append(name).append(".java\n");
    if (d.raises() != null)
      c.append("// This fails on purpose: it throws ").append(d.raises()).append("—").append(d.why()).append('\n');
    else if (d.compileError() != null)
      c.append("// This fails on purpose: it does not compile—").append(d.why()).append('\n');
    return c.toString();
  }

  /** Runs a downloaded file the way a reader would: `java &lt;flags&gt; &lt;file&gt;` with the source
   *  launcher, in the file's own directory, so a relative stack trace names the file as downloaded. */
  static Jdk.Run runAsReaderWould(Path file, Duration deadline) throws BuildError {
    String java = Path.of(System.getProperty("java.home"), "bin", "java").toString();
    var cmd = new ArrayList<String>(List.of(java));
    cmd.addAll(Jdk.FLAGS);
    cmd.add(file.getFileName().toString());
    try {
      Process proc = Jdk.cleanEnvironment(new ProcessBuilder(cmd).directory(file.getParent().toFile())).start();
      var pool = Executors.newFixedThreadPool(2);
      try {
        Future<String[]> out = pool.submit(() -> read(proc.getInputStream(), proc));
        Future<String[]> err = pool.submit(() -> read(proc.getErrorStream(), proc));
        try { proc.getOutputStream().close(); } catch (IOException ignored) { /* it may not read stdin */ }
        boolean done = proc.waitFor(deadline.toMillis(), TimeUnit.MILLISECONDS);
        if (!done) { proc.destroyForcibly().waitFor(); }
        String[] o = out.get(), e = err.get();
        String status = !done ? "timeout"
            : o[1] != null || e[1] != null ? "output-limit"
            : proc.exitValue() == 0 ? "ok"
            : e[0].startsWith("Exception in thread") ? "uncaught"
            : "exit-" + proc.exitValue();
        return new Jdk.Run(status, o[0], e[0]);
      } finally { pool.shutdownNow(); }
    } catch (IOException | InterruptedException | ExecutionException x) {
      throw new BuildError("running " + file + " as a reader would: " + x);
    }
  }

  private static String[] read(InputStream s, Process p) throws IOException {
    var r = new InputStreamReader(s, StandardCharsets.UTF_8);
    var b = new StringBuilder();
    char[] buf = new char[8192];
    int n;
    while ((n = r.read(buf)) > 0) {
      b.append(buf, 0, n);
      if (b.length() > Jdk.CAP) { p.destroyForcibly(); return new String[] {b.substring(0, Jdk.CAP), "limit"}; }
    }
    return new String[] {b.toString(), null};
  }

  private static void writeFile(Path file, String content) throws BuildError {
    try {
      Files.createDirectories(file.getParent());
      Files.writeString(file, content, StandardCharsets.UTF_8);
    } catch (IOException e) {
      throw new BuildError(file + ": " + e.getMessage());
    }
  }

  private static String escape(String s) {
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
  }
}
