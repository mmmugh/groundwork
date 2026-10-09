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
package foundations.scratchpad;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import jdk.jshell.Diag;

/**
 * A compiler diagnostic as the reader sees it (DERIVATION.md, E1 to E4): a header line, the message, the source line
 * the range starts on, and a caret line under the range.
 */
final class ErrorBlock {
  private ErrorBlock() {}

  /** The whole block, each line prefixed "|  " (E1). */
  static String of(Diag d, String source) {
    StringBuilder out = new StringBuilder(d.isError() ? "|  Error:\n" : "|  Warning:\n");
    for (String line : body(d, source)) out.append("|  ").append(line).append('\n');
    return out.toString();
  }

  /** The message lines, then the source and caret lines, without prefixes; used inside other messages too (F7). */
  static List<String> body(Diag d, String source) {
    List<String> lines = new ArrayList<>();
    for (String line : d.getMessage(Locale.US).split("\n", -1)) {
      if (!line.stripLeading().startsWith("location:")) lines.add(line); // E2: no location lines
    }
    long start = d.getStartPosition(), end = d.getEndPosition();
    if (start < 0 || start > source.length()) return lines;
    int from = (int) start;
    int lineStart = source.lastIndexOf('\n', from - 1) + 1;
    int lineEnd = source.indexOf('\n', from);
    if (lineEnd < 0) lineEnd = source.length();
    lines.add(source.substring(lineStart, lineEnd));
    String pad = " ".repeat(from - lineStart);
    if (end > lineEnd) {
      // E4: a range that runs past its first line is marked to the end of that line and then "...", unless only
      // one character of it is on that line, which gets a lone caret.
      int width = lineEnd - from;
      lines.add(pad + (width <= 1 ? "^" : "^" + "-".repeat(width - 1) + "..."));
    } else {
      lines.add(pad + caret((int) Math.max(1, end - start)));
    }
    return lines;
  }

  /** E3: one character is "^", two "^^", more "^" then dashes then "^". */
  private static String caret(int width) {
    if (width <= 1) return "^";
    if (width == 2) return "^^";
    return "^" + "-".repeat(width - 2) + "^";
  }
}
