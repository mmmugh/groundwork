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
import java.nio.charset.CharacterCodingException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.zip.ZipFile;

/** Publishing is by whitelist: a file reaches site/ only because the build wrote it on purpose (here,
 *  copyQuizzes). guard is the safety net: it scans the whole of site/ for anything private, whether or not
 *  the whitelist logic let it through. And site/ holds only what this build wrote (D98): once guard has scanned what was
 *  there, empty deletes all of it before the first write, so a page that left its volume, a dropped volume, a volume
 *  renamed by case only or a file put there by hand cannot survive into what is published. */
final class Publish {
  private Publish() {}

  /** Deletes everything under site/, keeping site/ itself. Build.run calls it after guard has scanned what was there:
   *  private content or a symlink refuses the build before anything is deleted, rather than vanishing unremarked. Then
   *  site/ holds only what this build writes, so a page that left its volume, a dropped volume, a volume renamed by case
   *  only (D98) or a file put there by hand cannot survive into what is published. Build.run calls it a second time
   *  when the final guard refuses this build's own output, so nothing private is left in site/ to serve (D98). */
  static void empty(Path site) throws BuildError {
    if (!Files.isDirectory(site)) return;
    try (var s = Files.walk(site)) {
      for (Path f : s.sorted(Comparator.reverseOrder()).toList()) if (!f.equals(site)) Files.delete(f);
    } catch (IOException e) {
      throw new BuildError(site + ": " + e.getMessage());
    }
  }

  /** The runtime's own checksummed files, skipped only at site/runtime/&lt;name&gt;, where install() has
   *  just verified those exact bytes against runtime/CHECKSUMS—there is nothing to gain by scanning them
   *  there. A build's first guard skips them there too, in the previous build's copy, without verifying them: empty
   *  deletes them next, before anything is written. The same name anywhere else is scanned like any other file: two of
   *  these six (compiler.wasm-runtime.js, compiler.wasm-runtime.mjs) are JavaScript text, not binary. */
  private static final Set<String> RUNTIME_BINARIES = new HashSet<>(RuntimeFiles.NAMES);
  private static final String ANSWER_KEY = "ANSWER KEY";

  /** Copies a volume's quizzes (already filtered to *-quiz.txt by Volume.loadAll) to
   *  site/<slug>/quizzes/. */
  static void copyQuizzes(Volume v, Path site) throws BuildError {
    if (v.quizzes().isEmpty()) return;
    Path quizzesDir = site.resolve(v.slug()).resolve("quizzes");
    try {
      Files.createDirectories(quizzesDir);
      for (Path q : v.quizzes()) {
        Files.copy(q, quizzesDir.resolve(q.getFileName()), StandardCopyOption.REPLACE_EXISTING);
      }
    } catch (IOException e) {
      throw new BuildError(quizzesDir + ": " + e.getMessage());
    }
  }

  /** Scans the whole of site/ for anything private and refuses to publish if it finds any. Runs at the start of
   *  every build's write phase, on whatever an earlier build or a person left there, before empty deletes anything,
   *  and again, unconditionally, at the end of every build, whether or not quizzes/, practice/ or answer-keys/ exist.
   *  Files.walk (no FileVisitOption.FOLLOW_LINKS) does not descend into a symlinked directory, so a
   *  symlinked site/ or a symlinked subdirectory under it would otherwise be invisible to this scan even
   *  though Pages/Bundle/RuntimeFiles write straight through such a link—refused outright instead, the
   *  simpler and equally safe alternative to following links and detecting a loop. */
  static void guard(Path site) throws BuildError {
    if (!Files.isDirectory(site)) return;
    List<String> leaks = new ArrayList<>();
    try (var s = Files.walk(site)) {
      for (Path f : s.sorted().toList()) {
        if (Files.isSymbolicLink(f)) {
          String rel = site.relativize(f).toString();
          throw new BuildError((rel.isEmpty() ? "site/" : rel) + " is a symlink; refused, not scanned");
        }
        if (Files.isRegularFile(f) && isPrivate(site, f)) leaks.add(site.relativize(f).toString());
      }
    } catch (IOException e) {
      throw new BuildError(site + ": " + e.getMessage());
    }
    if (!leaks.isEmpty())
      throw new BuildError("content that must not be published is reachable:\n" + String.join("\n", leaks));
  }

  private static boolean isPrivate(Path site, Path f) throws BuildError {
    String name = f.getFileName().toString();
    if (name.startsWith("_solutions") || name.startsWith("_boxes") || name.startsWith("_checks")) return true;
    for (Path part : site.relativize(f)) if (part.toString().equals("answer-keys")) return true;

    if (extensionOf(name).equals("docx")) return docxHoldsAnAnswer(f);
    if (RUNTIME_BINARIES.contains(name) && isSiteRuntimeFile(site, f)) return false;
    return holdsAnswerKeyMarker(f);
  }

  /** True only for site/runtime/&lt;name&gt; exactly (not any deeper or shallower path): the one place
   *  install() ever writes these six names, right after verifying their bytes against runtime/CHECKSUMS.
   *  The runtime files are skipped by name AND location together—a file with one of these six names
   *  sitting anywhere else is scanned like any other file (isPrivate checks RUNTIME_BINARIES.contains(name)
   *  and this method both). */
  private static boolean isSiteRuntimeFile(Path site, Path f) {
    Path rel = site.relativize(f);
    return rel.getNameCount() == 2 && rel.getName(0).toString().equals("runtime");
  }

  private static String extensionOf(String name) {
    int dot = name.lastIndexOf('.');
    return dot < 0 ? "" : name.substring(dot + 1).toLowerCase(java.util.Locale.ROOT);
  }

  /** Every regular file is scanned by content, rather than a whitelist of extensions (the old
   *  TEXT_EXTENSIONS covered only txt/md/html/json/java/js and missed, among others, .mjs, .css, .htm,
   *  .xml, .svg, .csv, .webmanifest, .map and extensionless files like NOTICE—files the build already
   *  writes into site/). The raw bytes are always searched for the marker in three byte forms
   *  (ASCII/ISO-8859-1, UTF-16LE, UTF-16BE), whether or not the file also decodes as UTF-8: a Latin-1 file
   *  or a Windows "Unicode" (UTF-16) text file both fail strict UTF-8 decoding while carrying the marker in
   *  plain sight, but a plain-ASCII UTF-16 file with no byte-order mark decodes as valid (if useless) UTF-8
   *  text—every other byte is 0x00, itself legal UTF-8—so a check that only fell back to raw bytes when
   *  UTF-8 decoding failed missed it outright: the marker survives as "A\0N\0S\0W\0E\0R\0...", and the
   *  UTF-8 .contains("ANSWER KEY") is false. When the bytes do decode as UTF-8, that text is checked too, in
   *  addition to the raw-byte search. A genuine binary with no marker (an image, a font, .wasm) still
   *  passes either way. */
  private static boolean holdsAnswerKeyMarker(Path f) throws BuildError {
    byte[] bytes;
    try {
      bytes = Files.readAllBytes(f);
    } catch (IOException e) {
      throw new BuildError(f + ": " + e.getMessage());
    }
    for (byte[] marker : ANSWER_KEY_BYTES) if (indexOf(bytes, marker) >= 0) return true;
    try {
      String content = StandardCharsets.UTF_8.newDecoder().decode(java.nio.ByteBuffer.wrap(bytes)).toString();
      return content.contains(ANSWER_KEY);
    } catch (CharacterCodingException e) {
      return false;
    }
  }

  /** ANSWER_KEY encoded the three byte-for-byte ways a non-UTF-8 text file plausibly carries it: plain
   *  ASCII/ISO-8859-1, and Windows "Unicode" text files' UTF-16LE and UTF-16BE. */
  private static final byte[][] ANSWER_KEY_BYTES = {
      ANSWER_KEY.getBytes(StandardCharsets.ISO_8859_1),
      ANSWER_KEY.getBytes(StandardCharsets.UTF_16LE),
      ANSWER_KEY.getBytes(StandardCharsets.UTF_16BE),
  };

  private static int indexOf(byte[] haystack, byte[] needle) {
    outer:
    for (int i = 0; i <= haystack.length - needle.length; i++) {
      for (int j = 0; j < needle.length; j++) if (haystack[i + j] != needle[j]) continue outer;
      return i;
    }
    return -1;
  }

  private static boolean docxHoldsAnAnswer(Path f) throws BuildError {
    try (ZipFile zip = new ZipFile(f.toFile())) {
      var entry = zip.getEntry("word/document.xml");
      if (entry == null) return false;
      String xml = new String(zip.getInputStream(entry).readAllBytes(), StandardCharsets.UTF_8);
      return xml.contains(ANSWER_KEY) || xml.contains("Worked solutions");
    } catch (IOException e) {
      throw new BuildError(f + ": " + e.getMessage());
    }
  }
}
