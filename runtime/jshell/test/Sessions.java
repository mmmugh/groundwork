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

import java.util.ArrayList;
import java.util.List;

/**
 * The session file format both sides of the check read (test/check.mjs parses it the same way and compares).
 * Entries are separated by blank lines. A line starting with "#" is a comment ("#!" lines carry the check's
 * annotations, which only check.mjs reads). Every other line is fed exactly as written, one line per Enter.
 * A line that is exactly "@@blank" is fed as an empty line, so an entry can contain one; a line "@@cancel" is the reader
 * pressing Ctrl-C there, kept as the character U+0003 (the real tool reads that byte as Ctrl-C; ours gets a cancel call).
 */
final class Sessions {
  /** A line that stands for Ctrl-C: the real tool reads this byte as an interrupt. */
  static final String CANCEL = "\u0003";

  private Sessions() {}

  static List<List<String>> parse(String text) {
    List<List<String>> entries = new ArrayList<>();
    List<String> current = new ArrayList<>();
    for (String line : text.split("\n", -1)) {
      if (line.startsWith("#")) continue;
      if (line.isEmpty()) {
        if (!current.isEmpty()) entries.add(current);
        current = new ArrayList<>();
        continue;
      }
      current.add(line.equals("@@blank") ? "" : line.equals("@@cancel") ? CANCEL : line);
    }
    if (!current.isEmpty()) entries.add(current);
    return entries;
  }
}
