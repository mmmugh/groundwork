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
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

final class PublishTest {
  static void testQuizzesArePublishedAndAnswerKeysAreNot() throws Exception {
    Path p = Fixtures.project("publish");
    T.eq(0, Fixtures.build(p).exit(), "build");
    T.check(Files.exists(p.resolve("site/vol-fixture/quizzes/ch01-quiz.txt")), "quiz published");
    try (var s = Files.walk(p.resolve("site"))) {
      T.check(s.noneMatch(f -> f.toString().contains("answer")), "no answer key anywhere under site/");
    }
  }
  static void testAQuizDirectoryHoldingAKeyIsNotCopied() throws Exception {
    Path p = Fixtures.project("publish-whitelist");
    Files.writeString(p.resolve("volumes/vol-fixture/quizzes/ch01-answers.txt"), "ANSWER KEY\n1. Hi\n");
    T.eq(0, Fixtures.build(p).exit(), "a key misfiled in quizzes/ is simply not published");
    T.check(!Files.exists(p.resolve("site/vol-fixture/quizzes/ch01-answers.txt")), "whitelist, not blacklist");
  }
  static void testTheGuardCatchesALeakTheWhitelistMissed() throws Exception {
    Path p = Fixtures.project("publish-guard");
    Files.writeString(p.resolve("volumes/vol-fixture/quizzes/ch01-quiz.txt"), "Quiz\nANSWER KEY: 1. Hi\n");
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "a quiz carrying its key stops the build");
    T.check(r.out().contains("quizzes/ch01-quiz.txt"), "names the file: " + r.out());
  }
  // D98: when the final guard refuses a build, all of site/ is that build's own output, private content included. Left
  // there, a dev server would serve it, and the next build's first guard would refuse it before anything is overwritten,
  // even once the source is fixed. So the refused build leaves no file, and the fixed source builds.
  static void testABuildTheFinalGuardRefusesLeavesNoFileAndTheFixedSourceBuilds() throws Exception {
    Path p = Fixtures.project("publish-refused-output");
    Path quiz = p.resolve("volumes/vol-fixture/quizzes/ch01-quiz.txt"), site = p.resolve("site");
    String clean = Files.readString(quiz);
    Files.writeString(quiz, clean + "ANSWER KEY: 1. Hi\n");
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "a quiz carrying its key stops the build: " + r.out());
    T.check(r.out().contains("content that must not be published is reachable") && r.out().contains("vol-fixture/quizzes/ch01-quiz.txt"),
        "with the guard's message: " + r.out());
    List<String> left = new ArrayList<>();
    try (var s = Files.walk(site)) { s.filter(Files::isRegularFile).forEach(f -> left.add(site.relativize(f).toString())); }
    Files.writeString(quiz, clean);
    var fixed = Fixtures.build(p);
    T.eq(0, fixed.exit(), "the source fixed, the next build publishes, not refused by a copy the refused one left: " + fixed.out());
    T.check(left.isEmpty(), "the refused build left no file in site/: " + left);
  }
  static void testAnAnswerKeysPathSegmentIsCaughtWithNoMarkerNeeded() throws Exception {
    // Publish.guard's other rules could all be deleted from Publish.java and PublishTest would still pass
    // 4/4 (the finding's own mutation proof). This exercises the answer-keys/ path-segment rule directly: a
    // file under such a directory is caught by its path alone, with no "ANSWER KEY" text needed.
    Path p = Fixtures.project("publish-answer-keys-path");
    T.eq(0, Fixtures.build(p).exit(), "first build");
    Path leak = p.resolve("site/vol-fixture/answer-keys/notes.txt");
    Files.createDirectories(leak.getParent());
    Files.writeString(leak, "nothing suspicious in this text at all\n");
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "any file under an answer-keys/ directory is caught by path alone");
    T.check(r.out().contains("answer-keys/notes.txt"), "names it: " + r.out());
  }
  static void testABoxesOrChecksNamedFileIsCaughtByNameAlone() throws Exception {
    Path p = Fixtures.project("publish-boxes-checks-name");
    T.eq(0, Fixtures.build(p).exit(), "first build");
    Files.writeString(p.resolve("site/vol-fixture/_boxes-extra.json"), "{}");
    Files.writeString(p.resolve("site/vol-fixture/_checks-extra.json"), "{}");
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "a _boxes*/_checks* name is caught regardless of content");
    T.check(r.out().contains("_boxes-extra.json"), "names the _boxes file: " + r.out());
    T.check(r.out().contains("_checks-extra.json"), "names the _checks file: " + r.out());
  }
  static void testADocxCarryingAnAnswerKeyIsCaught() throws Exception {
    Path p = Fixtures.project("publish-docx");
    T.eq(0, Fixtures.build(p).exit(), "first build");
    Path docx = p.resolve("site/vol-fixture/worked-solutions.docx");
    // A minimal real .docx: a zip whose word/document.xml entry holds ANSWER KEY, same shape Word itself
    // writes (no external library needed to build or to read one back).
    try (var out = new ZipOutputStream(Files.newOutputStream(docx))) {
      out.putNextEntry(new ZipEntry("word/document.xml"));
      out.write("<w:document><w:body><w:p><w:r><w:t>ANSWER KEY</w:t></w:r></w:p></w:body></w:document>"
          .getBytes(StandardCharsets.UTF_8));
      out.closeEntry();
    }
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "a .docx whose word/document.xml holds ANSWER KEY is caught");
    T.check(r.out().contains("worked-solutions.docx"), "names it: " + r.out());
  }
  static void testCheckWithZeroVolumesStillRunsTheGuard() throws Exception {
    // --check with zero volumes used to short-circuit before Publish.guard ever ran, making --check WEAKER
    // than a plain build in this one case: a plain build with zero volumes and a planted leak under site/
    // already caught it (the guard runs unconditionally, second line, regardless of which directories or
    // volumes exist), but --check with zero volumes did not.
    Path p = Fixtures.project("publish-check-no-volumes");
    Fixtures.deleteTree(p.resolve("volumes/vol-fixture"));
    T.eq(0, Fixtures.build(p, "--check", "--no-fork-gate-for-tests").exit(), "first build, nothing to publish");
    Files.writeString(p.resolve("site/_solutions.md"), "planted");
    var r = Fixtures.build(p, "--check", "--no-fork-gate-for-tests");
    T.eq(1, r.exit(), "the guard still runs when --check has zero volumes: " + r.out());
    T.check(r.out().contains("_solutions.md"), "names it: " + r.out());
  }
  static void testASymlinkedSiteIsRefusedRatherThanSilentlyUnscanned() throws Exception {
    // Files.walk (no FOLLOW_LINKS) does not descend into a symlinked directory, so a symlinked site/ used to
    // be entirely invisible to the scan while Pages/Bundle/RuntimeFiles still write straight through it.
    Path p = Fixtures.project("publish-symlink-site");
    T.eq(0, Fixtures.build(p).exit(), "first build");
    Path real = p.resolve("site-real");
    Files.move(p.resolve("site"), real);
    Files.writeString(real.resolve("_solutions.md"), "planted");
    Files.createSymbolicLink(p.resolve("site"), real);
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "a symlinked site/ is refused, not silently unscanned: " + r.out());
    T.check(r.out().contains("symlink"), "says why: " + r.out());
  }
  static void testASymlinkedSubdirectoryUnderSiteIsRefused() throws Exception {
    Path p = Fixtures.project("publish-symlink-subdir");
    T.eq(0, Fixtures.build(p).exit(), "first build");
    Path outside = p.resolve("outside-leak");
    Files.createDirectories(outside);
    Files.writeString(outside.resolve("_solutions.md"), "planted");
    Files.createSymbolicLink(p.resolve("site/vol-fixture/extras"), outside);
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "a symlinked subdirectory under site/ is refused, not silently unscanned: " + r.out());
    T.check(r.out().contains("symlink"), "says why: " + r.out());
  }
  static void testAnMjsFileContainingAnAnswerKeyIsCaught() throws Exception {
    // The old TEXT_EXTENSIONS whitelist covered only txt/md/html/json/java/js—.mjs (and .css, .htm, .xml,
    // .svg, .csv, .webmanifest, .map, extensionless files like NOTICE) went unscanned even though the build
    // already writes some of these into site/. The scan is now by content (decodes as UTF-8), not extension.
    Path p = Fixtures.project("publish-mjs");
    T.eq(0, Fixtures.build(p).exit(), "first build");
    Files.writeString(p.resolve("site/vol-fixture/extra.mjs"), "// ANSWER KEY: 42\n");
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "an .mjs file is scanned like any other UTF-8 text file: " + r.out());
    T.check(r.out().contains("extra.mjs"), "names it: " + r.out());
  }
  static void testARuntimeFileNameOutsideSiteRuntimeIsScannedLikeAnyOtherFile() throws Exception {
    // Controller reproduction: the six runtime names used to be skipped wherever they appeared, not just
    // in site/runtime/ where install() has just verified their bytes against runtime/CHECKSUMS. Two of the
    // six (compiler.wasm-runtime.js, compiler.wasm-runtime.mjs) are actually JavaScript text.
    Path p = Fixtures.project("publish-runtime-name-elsewhere");
    T.eq(0, Fixtures.build(p).exit(), "first build");
    Path leak = p.resolve("site/vol-fixture/elsewhere/compiler.wasm-runtime.js");
    Files.createDirectories(leak.getParent());
    Files.writeString(leak, "// ANSWER KEY\n");
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "a runtime-binary name outside site/runtime/ is scanned like any other file: " + r.out());
    T.check(r.out().contains("elsewhere/compiler.wasm-runtime.js"), "names it: " + r.out());
  }
  static void testARuntimeBinaryNamedFileInSiteRuntimeIsStillSkippedByLocation() throws Exception {
    // Even carrying the marker, a file at exactly site/runtime/<one of the six names> is skipped: install()
    // has just verified those exact bytes against runtime/CHECKSUMS, so there is nothing to gain by
    // scanning them there.
    Path site = Fixtures.TOOLS.resolve("build/.work/tests/publish-runtime-scope-real");
    Fixtures.deleteTree(site);
    Path rt = site.resolve("runtime/compiler.wasm-runtime.js");
    Files.createDirectories(rt.getParent());
    Files.writeString(rt, "// ANSWER KEY\n");
    Publish.guard(site); // must not throw
  }
  static void testALatin1FileCarryingAnAnswerKeyIsCaught() throws Exception {
    // A file whose bytes fail strict UTF-8 decoding used to be skipped outright (fail-open): a Latin-1
    // "caf\xe9" byte makes the whole file undecodable as UTF-8, even though "ANSWER KEY" itself is plain
    // ASCII bytes sitting right there in the file.
    Path p = Fixtures.project("publish-latin1");
    T.eq(0, Fixtures.build(p).exit(), "first build");
    Path leak = p.resolve("site/vol-fixture/probe-latin1.txt");
    Files.write(leak, "café\nANSWER KEY: 1. Hi\n".getBytes(StandardCharsets.ISO_8859_1));
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "a non-UTF-8 file whose bytes carry ANSWER KEY still fails the build: " + r.out());
    T.check(r.out().contains("probe-latin1.txt"), "names it: " + r.out());
  }
  static void testAUtf16LeFileCarryingAnAnswerKeyIsCaught() throws Exception {
    // Windows "Unicode" text files are UTF-16LE with a leading 0xFF 0xFE byte-order mark; that BOM alone
    // (0xFF is never a valid UTF-8 leading byte) fails strict UTF-8 decoding, while the marker still sits
    // in plain sight, just encoded two bytes per character.
    Path p = Fixtures.project("publish-utf16");
    T.eq(0, Fixtures.build(p).exit(), "first build");
    Path leak = p.resolve("site/vol-fixture/probe-utf16.txt");
    byte[] bom = {(byte) 0xFF, (byte) 0xFE};
    byte[] text = "ANSWER KEY: 1. Hi\n".getBytes(StandardCharsets.UTF_16LE);
    byte[] bytes = new byte[bom.length + text.length];
    System.arraycopy(bom, 0, bytes, 0, bom.length);
    System.arraycopy(text, 0, bytes, bom.length, text.length);
    Files.write(leak, bytes);
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "a UTF-16LE file whose bytes carry ANSWER KEY still fails the build: " + r.out());
    T.check(r.out().contains("probe-utf16.txt"), "names it: " + r.out());
  }
  static void testABomlessUtf16LeFileCarryingAnAnswerKeyIsCaught() throws Exception {
    // A UTF-16LE file with no byte-order mark interleaves a 0x00 byte after every ASCII byte, and every one
    // of those 0x00 bytes is itself valid single-byte UTF-8, so the whole file decodes as valid (if useless)
    // UTF-8 text: "A\0N\0S\0W\0E\0R\0 \0K\0E\0Y\0...", whose UTF-8 .contains("ANSWER KEY") is false. A
    // reviewer reproduced this through Build.run: this published with exit 0 before the fix always searched
    // raw bytes regardless of whether UTF-8 decoding succeeded.
    Path p = Fixtures.project("publish-utf16le-bomless");
    T.eq(0, Fixtures.build(p).exit(), "first build");
    Path leak = p.resolve("site/vol-fixture/probe-utf16le-bomless.txt");
    Files.write(leak, "ANSWER KEY: 1. Hi\n".getBytes(StandardCharsets.UTF_16LE));
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "a BOM-less UTF-16LE file whose bytes carry ANSWER KEY still fails the build: " + r.out());
    T.check(r.out().contains("probe-utf16le-bomless.txt"), "names it: " + r.out());
  }
  static void testABomlessUtf16BeFileCarryingAnAnswerKeyIsCaught() throws Exception {
    // Same as the LE case above, mirrored for UTF-16BE (0x00 leads instead of trails each ASCII byte).
    Path p = Fixtures.project("publish-utf16be-bomless");
    T.eq(0, Fixtures.build(p).exit(), "first build");
    Path leak = p.resolve("site/vol-fixture/probe-utf16be-bomless.txt");
    Files.write(leak, "ANSWER KEY: 1. Hi\n".getBytes(StandardCharsets.UTF_16BE));
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "a BOM-less UTF-16BE file whose bytes carry ANSWER KEY still fails the build: " + r.out());
    T.check(r.out().contains("probe-utf16be-bomless.txt"), "names it: " + r.out());
  }
  static void testABinaryFileWithNoMarkerStillPasses() throws Exception {
    // Scanning raw bytes for the marker in three encodings must not turn into flagging every binary that
    // simply fails to decode as UTF-8: an ordinary image is not text and carries no marker.
    Path p = Fixtures.project("publish-binary-ok");
    T.eq(0, Fixtures.build(p).exit(), "first build");
    Path bin = p.resolve("site/vol-fixture/probe.png");
    Files.write(bin, new byte[] {(byte) 0x89, 'P', 'N', 'G', 13, 10, 26, 10, 0, 0, 0, 13, 'I', 'H', 'D', 'R'});
    var r = Fixtures.build(p);
    T.eq(0, r.exit(), "a binary file with no marker is not flagged just for failing UTF-8 decode: " + r.out());
  }
  static void testTheGuardRunsWithoutQuizzesOrSolutions() throws Exception {
    Path p = Fixtures.project("publish-bare");
    Fixtures.deleteTree(p.resolve("volumes/vol-fixture/quizzes"));
    Fixtures.deleteTree(p.resolve("volumes/vol-fixture/practice"));
    Fixtures.deleteTree(p.resolve("volumes/vol-fixture/answer-keys"));
    Files.delete(p.resolve("volumes/vol-fixture/content/_solutions.md"));
    Path boxes = p.resolve("volumes/vol-fixture/content/_boxes.json");
    String noPractice = Files.readString(boxes)
        .replace(",\n \"ch02-types-and-input-practice#2\": {\"reference\": true}", "")
        .replace(",\n \"ch02-types-and-input-practice#3\": {\"compileError\": \"incompatible types: String cannot be converted to int\", \"why\": \"Text is not a number, same mistake as chapter 2.\"}", "")
        .replace(",\n \"ch02-types-and-input-practice#1\": {\"stdin\": [\"5\"]}", "");
    Files.writeString(boxes, noPractice);
    T.eq(0, Fixtures.build(p).exit(), "first build");
    Files.writeString(p.resolve("site/vol-fixture/_solutions.md"), "planted");
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "the guard still runs when quizzes/ and practice/ are absent");
    T.check(r.out().contains("_solutions.md"), "names it");
  }
}
