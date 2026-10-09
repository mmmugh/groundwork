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
import java.nio.file.*;
import java.util.*;

final class PagesTest {
  static void testTheBuildWritesEveryPageAndEscapesText() throws Exception {
    Path p = Fixtures.project("pages");
    var r = Fixtures.build(p);
    T.eq(0, r.exit(), "build exit: " + r.out());
    Path site = p.resolve("site");
    for (String page : new String[] {"00-front-matter", "ch01-first-programs", "ch02-types-and-input", "ch02-types-and-input-practice", "99-appendices"})
      T.check(Files.exists(site.resolve("vol-fixture/" + page + ".html")), page + ".html written");
    String ch1 = Files.readString(site.resolve("vol-fixture/ch01-first-programs.html"));
    T.check(ch1.contains("IO.println(&quot;Hello, &lt;world&gt; &amp; café 😀&quot;);"), "code escaped in the textarea");
    T.check(ch1.contains("<pre class=\"output\">Hello, &lt;world&gt; &amp; café 😀\n</pre>"), "output escaped");
    T.check(ch1.contains("data-kind=\"raises\""), "raises box marked");
    T.check(ch1.contains("<pre class=\"reference\">if (condition) {\n</pre>"), "reference box has no textarea");
    T.check(ch1.contains("Part one: the basics"), "part label from the first-line comment");
    T.check(!ch1.contains("<!-- part"), "the part comment itself is not published");
    T.check(Files.readString(site.resolve("boxes.json")).contains("\"ch02-types-and-input#1\""), "boxes.json lists every box");
    T.check(Files.exists(site.resolve("index.html")), "library page");
  }
  static void testARenderedPageDoesNotCarryWebPageHtmlsApacheHeader() throws Exception {
    Path p = Fixtures.project("license-header");
    T.eq(0, Fixtures.build(p).exit(), "build");
    String ch1 = Files.readString(p.resolve("site/vol-fixture/ch01-first-programs.html"));
    T.check(!ch1.contains("Apache License"), "the template's Apache-2.0 header (Code's license) is not course content's license");
    T.check(ch1.startsWith("<!doctype html>\n<html"), "the doctype survives the strip, with nothing but the header removed");
  }
  static void testACrlfPageHtmlTemplateStillBuilds() throws Exception {
    // No .gitattributes normalizes web/page.html on checkout: a CRLF copy used to make stripLicenseHeader's
    // regex fail to find the leading comment at all, "blaming the header's shape" with a misleading message
    // when the real problem was just line endings.
    Path p = Fixtures.project("license-header-crlf");
    Path page = p.resolve("web/page.html");
    Files.writeString(page, Files.readString(page).replace("\n", "\r\n"));
    var r = Fixtures.build(p);
    T.eq(0, r.exit(), "a CRLF page.html template still builds: " + r.out());
    String ch1 = Files.readString(p.resolve("site/vol-fixture/ch01-first-programs.html"));
    T.check(!ch1.contains("Apache License"), "the header still strips from a CRLF template");
  }
  static void testATemplateWhoseFirstCommentIsNotTheLicenseHeaderFailsLoud() throws Exception {
    // stripLicenseHeader used to strip whatever the leading comment was, without checking it was actually
    // the Apache license block.
    Path p = Fixtures.project("license-header-wrong-comment");
    Path page = p.resolve("web/page.html");
    Files.writeString(page, "<!doctype html>\n<!-- Not the license header -->\n<html></html>\n");
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "a template whose first comment is not the Apache header fails loud: " + r.out());
    T.check(r.out().contains("Licensed under the Apache License"), "the message says what was expected: " + r.out());
  }
  static void testBoxesJsonPublishesOnlyTheCheckKindNeverItsAnswerOrStarter() throws Exception {
    Path p = Fixtures.project("check-privacy");
    Files.writeString(p.resolve("volumes/vol-fixture/content/_checks.json"),
        "{\"ch01-first-programs#4\": {\"kind\": \"output\", \"expected\": \"SECRET_ANSWER\", \"starter\": \"SECRET_STARTER\"}}");
    var r = Fixtures.build(p);
    T.eq(0, r.exit(), "build exit: " + r.out());
    String boxes = Files.readString(p.resolve("site/boxes.json"));
    T.check(boxes.contains("\"kind\": \"output\""), "the check's kind is published");
    T.check(!boxes.contains("SECRET_ANSWER"), "the check's expected answer is not published");
    T.check(boxes.contains("\"source\": \"SECRET_STARTER\""), "the box's published source is its starter");
    T.check(!boxes.contains("IO.println(\\\"Ada\\\")"), "the author's own fence, the answer, is not published");
    T.check(!boxes.contains("\"starter\""), "no starter key reaches boxes.json");
  }
  static void testARemovedVolumeIsGoneAfterTheNextBuild() throws Exception {
    Path p = Fixtures.project("prune");
    T.eq(0, Fixtures.build(p).exit(), "first build");
    Files.move(p.resolve("volumes/vol-fixture"), p.resolve("volumes/vol-renamed"));
    T.eq(0, Fixtures.build(p).exit(), "second build");
    T.check(!Files.exists(p.resolve("site/vol-fixture")), "the old volume's pages are gone");
    T.check(Files.exists(p.resolve("site/vol-renamed/ch01-first-programs.html")), "and the renamed volume's are there");
  }
  // D98: on a case-insensitive file system a volume renamed by case only was written through its old on-disk folder,
  // recorded under the new name and swept, so the next build exited 0 without it. Proves anything only where case is
  // ignored (a Mac); on Linux CI it prints a skip line. Files.move("a", "A") does nothing on APFS (the JDK sees one file),
  // so the rename goes through a temporary name, and the listing proves it happened before the second build.
  static void testAVolumeRenamedByCaseOnlyIsStillPublished() throws Exception {
    Path p = Fixtures.project("case-rename");
    Files.writeString(p.resolve("case-probe"), "");
    boolean ignoresCase = Files.exists(p.resolve("CASE-PROBE"));
    Files.delete(p.resolve("case-probe"));
    if (!ignoresCase) {
      System.out.println("  skip  a volume renamed by case only: this file system is case-sensitive, so the case cannot arise here (it is proven on a Mac)");
      return;
    }
    T.eq(0, Fixtures.build(p).exit(), "first build");
    Files.move(p.resolve("volumes/vol-fixture"), p.resolve("volumes/case-rename-tmp"));
    Files.move(p.resolve("volumes/case-rename-tmp"), p.resolve("volumes/Vol-Fixture"));
    T.check(names(p.resolve("volumes")).contains("Vol-Fixture"), "the volume's folder is now spelled Vol-Fixture: " + names(p.resolve("volumes")));
    T.eq(0, Fixtures.build(p).exit(), "second build");
    List<String> site = names(p.resolve("site"));
    T.check(site.contains("Vol-Fixture") && !site.contains("vol-fixture"), "site/ names the volume as it is now spelled: " + site);
    T.check(Files.exists(p.resolve("site/Vol-Fixture/ch01-first-programs.html")), "and its pages are there");
  }
  private static List<String> names(Path dir) throws IOException {
    try (var s = Files.list(dir)) { return s.map(f -> f.getFileName().toString()).toList(); }
  }
  /** D98: site/ holds only what this build wrote. site/ is emptied after the first guard and before the first write
   *  (the guard has scanned the whole of site/ by then, and still refuses private content whoever put it there:
   *  PublishTest plants files this way), so nothing the build did not write this run is left: a page that left its
   *  volume, a bundle file of a box that is gone, a file at the site's root, one in site/runtime/ or site/scratchpad/,
   *  and a directory put there by hand. This replaces Plan 2's rule that a directory the build did not write stays (D98). */
  static void testAFileTheBuildDidNotWriteThisRunIsNotPublished() throws Exception {
    Path p = Fixtures.project("stale-site");
    T.eq(0, Fixtures.build(p).exit(), "first build");
    Path site = p.resolve("site");
    List<String> stale = List.of("old.html", "vol-fixture/ch09-gone.html", "vol-fixture/bundle/ch09/ch09_01.java",
        "runtime/LICENSE-Dropped.txt", "scratchpad/runtime-old.js", ".well-known/keep.txt");
    for (String f : stale) {
      Files.createDirectories(site.resolve(f).getParent());
      Files.writeString(site.resolve(f), "left by an earlier build\n");
    }
    T.eq(0, Fixtures.build(p).exit(), "second build");
    for (String f : stale) T.check(!Files.exists(site.resolve(f)), f + " is not published");
    T.check(!Files.exists(site.resolve(".well-known")) && !Files.exists(site.resolve("vol-fixture/bundle/ch09")),
        "nor the directories they leave empty");
    for (String f : List.of("index.html", "boxes.json", "app.css", "app.js", "page/box.js", "runner/tjava-core.js", "runtime/compiler.wasm",
        "runtime/NOTICE", "scratchpad/manifest.json", "vol-fixture/ch01-first-programs.html", "vol-fixture/bundle.html",
        "vol-fixture/quizzes/ch01-quiz.txt"))
      T.check(Files.isRegularFile(site.resolve(f)), f + ", which the build writes, is published");
  }
  static void testTheEntryModuleParsesInEveryBrowserWithModuleScripts() throws Exception {
    // Ruling 36 (P-2): app.js decides whether this browser can run Java and, if not, says so in every box. A
    // browser that runs module scripts but cannot parse dynamic import or import.meta (Chrome 61-63, Firefox 60-66,
    // Safari 11.0) skipped the whole module, and the nomodule fallback too: its boxes got neither buttons nor the
    // message. So the entry and support.js, the one module it imports, hold none of that syntax, nor ES2020's ?.
    // and ??. The Run code (page/wire.js) may: it loads only once support is confirmed.
    Path p = Fixtures.project("pages-entry-syntax");
    T.eq(0, Fixtures.build(p).exit(), "build");
    var newer = java.util.regex.Pattern.compile("\\bimport\\s*\\(|\\bimport\\s*\\.\\s*meta\\b|\\?\\.(?!\\d)|\\?\\?");
    for (String f : List.of("app.js", "page/support.js")) {
      var m = newer.matcher(Files.readString(p.resolve("site").resolve(f)));
      boolean found = m.find();
      T.check(!found, f + " holds syntax an older module browser cannot parse: " + (found ? m.group() : ""));
    }
  }
  static void testNoModuleOfTheSiteEndsInMjsAndEveryScriptItNamesExists() throws Exception {
    // D85: stock nginx has no .mjs type and serves a module script as application/octet-stream, which browsers refuse.
    // So no file of the site ends in .mjs except the runtime release's own Node copy (site/runtime/compiler.wasm-runtime.mjs,
    // one of its six pinned files, which no page loads), and every script page.html and the runner name is there.
    Path p = Fixtures.project("pages-no-mjs");
    T.eq(0, Fixtures.build(p).exit(), "build");
    Path site = p.resolve("site");
    List<String> mjs = new java.util.ArrayList<>();
    try (var walk = Files.walk(site)) {
      walk.filter(Files::isRegularFile).map(f -> site.relativize(f).toString())
          .filter(n -> n.endsWith(".mjs") && !n.equals("runtime/compiler.wasm-runtime.mjs")).forEach(mjs::add);
    }
    T.check(mjs.isEmpty(), "no module of the site ends in .mjs but the runtime's Node copy: " + mjs);
    var src = java.util.regex.Pattern.compile("<script[^>]*\\ssrc=\"([^\"]+)\"");
    var rel = java.util.regex.Pattern.compile("(?:from\\s*|import\\s*\\(\\s*)[\"'](\\.{1,2}/[^\"']+)[\"']");
    var worker = java.util.regex.Pattern.compile("runner/browser-worker\\.js");
    Path page = site.resolve("vol-fixture/ch01-first-programs.html");
    var m = src.matcher(Files.readString(page));
    int named = 0;
    while (m.find()) {
      named++;
      T.check(Files.exists(page.getParent().resolve(m.group(1)).normalize()), "page.html's script " + m.group(1) + " exists");
    }
    T.check(named > 0, "the page names at least one script");
    T.check(worker.matcher(Files.readString(site.resolve("page/wire.js"))).find()
        || worker.matcher(Files.readString(site.resolve("runner/browser-runner.js"))).find(), "the runner names its worker");
    T.check(Files.exists(site.resolve("runner/browser-worker.js")), "and the worker is there");
    for (String f : List.of("app.js", "page/wire.js", "page/box.js", "page/scratchpad.js", "page/jshell-session.js", "runner/browser-runner.js",
        "runner/browser-worker.js", "runner/worker-protocol.js", "runner/tjava-core.js")) {
      Path file = site.resolve(f);
      var im = rel.matcher(Files.readString(file));
      while (im.find())
        T.check(Files.exists(file.getParent().resolve(im.group(1)).normalize()), f + " imports " + im.group(1) + ", which exists");
    }
  }
  static void testAScriptThatLeftTheListsLeavesTheSite() throws Exception {
    Path p = Fixtures.project("pages-stale-scripts");
    T.eq(0, Fixtures.build(p).exit(), "first build");
    // What a script dropped from WEB_SCRIPTS or RUNNER_SHARED leaves behind after an earlier build.
    Files.writeString(p.resolve("site/page/dropped.js"), "export const old = 1;\n");
    Files.writeString(p.resolve("site/runner/dropped.js"), "export const old = 1;\n");
    T.eq(0, Fixtures.build(p).exit(), "second build");
    T.check(!Files.exists(p.resolve("site/page/dropped.js")) && !Files.exists(p.resolve("site/runner/dropped.js")), "neither is published");
    T.check(Files.exists(p.resolve("site/page/wire.js")) && Files.exists(p.resolve("site/runner/java-line.js")), "every listed script still is");
  }
  static void testEveryRenderedPageCarriesTheScratchpadHiddenAndShut() throws Exception {
    // The scratchpad is on every page the template renders (Task 5), its tab hidden until web/app.js or
    // web/page/scratchpad.js decides this browser can show it, and its panel shut: no page opens it by itself (D29).
    Path p = Fixtures.project("pages-scratchpad");
    T.eq(0, Fixtures.build(p).exit(), "build");
    for (String page : new String[] {"00-front-matter", "ch01-first-programs", "99-appendices"}) {
      String html = Files.readString(p.resolve("site/vol-fixture/" + page + ".html"));
      T.check(html.contains("<button class=\"scratch-tab\" type=\"button\" aria-controls=\"scratchpad\" aria-expanded=\"false\" hidden>"),
          page + ": the scratchpad's tab, hidden");
      T.check(html.contains("<section id=\"scratchpad\" class=\"scratchpad\" aria-label=\"jshell scratchpad\" data-state=\"shut\" hidden>"),
          page + ": its panel, shut");
    }
  }
  static void testThePagesScriptsArePublishedByNameAndNothingElseFromWeb() throws Exception {
    Path p = Fixtures.project("pages-scripts");
    T.eq(0, Fixtures.build(p).exit(), "build");
    Path site = p.resolve("site");
    for (String f : List.of("app.js", "page/support.js", "page/wire.js", "page/box.js", "page/replay.js", "page/transcript.js",
        "page/check.js", "page/scratchpad.js", "page/jshell-session.js", "page/sha256.js", "page/compose.js", "runner/browser-runner.js",
        "runner/browser-worker.js", "runner/tjava-core.js", "runner/worker-protocol.js", "runner/java-line.js"))
      T.check(Files.exists(site.resolve(f)), f + " published");
    T.check(!Files.exists(site.resolve("test")) && !Files.exists(site.resolve("serve.mjs")), "web/test/ and the dev server are not");
    Files.delete(p.resolve("web/app.js"));
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "a listed script that is missing stops the build");
    T.check(r.out().contains("app.js"), "and names it: " + r.out());
  }
  // D103: with no volume the public index must say why it is empty, never show a bare title; and it must never call a
  // chapter unwritten once one is published. Its one link is relative, so it resolves under Pages' /groundwork/ prefix.
  static void testAnIndexWithNoVolumeSaysTheFirstChapterIsBeingWritten() throws Exception {
    Path p = Fixtures.project("index-no-volume");
    Fixtures.deleteTree(p.resolve("volumes/vol-fixture"));
    T.eq(0, Fixtures.build(p).exit(), "build");
    String index = Files.readString(p.resolve("site/index.html"));
    T.check(index.contains("<p>The first chapter is being written.</p>"), "the empty index says the first chapter is being written");
    T.check(index.contains("href=\"app.css\""), "and links its stylesheet relatively");
  }
  static void testAnIndexWithAVolumeNeverSaysAChapterIsBeingWritten() throws Exception {
    Path p = Fixtures.project("index-one-volume");
    T.eq(0, Fixtures.build(p).exit(), "build");
    String index = Files.readString(p.resolve("site/index.html"));
    T.check(!index.contains("being written"), "a published chapter is never called unwritten");
    T.check(index.contains("href=\"vol-fixture/"), "and the index links the volume's pages");
  }
}
