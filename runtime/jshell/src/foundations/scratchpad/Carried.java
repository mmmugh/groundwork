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

/**
 * What a session carries into the fresh VM that Ristretto starts for /reset and /reload (DERIVATION.md, R5): the
 * reader's settings and history, the snippets to replay, and the lines of the same request not yet run. It travels as
 * the "feedback" string of Ristretto's reload answer and comes back to beginReload. Each value is written as its
 * length, a colon and its characters, so any text survives.
 */
final class Carried {
  Mode mode = Mode.NORMAL;
  Mode retained;
  boolean optionFailed;
  List<String> history = new ArrayList<>();
  /** The replay list before this restart, or null if the session never restarted (C8, L1). */
  List<String> previous;
  /** True for /reload: replay {@code entries}; false for /reset. */
  boolean reload;
  boolean quiet;
  List<String> entries = new ArrayList<>();
  List<String> rest = new ArrayList<>();

  String encode() {
    StringBuilder out = new StringBuilder("v1");
    put(out, mode.name());
    put(out, retained == null ? "" : retained.name());
    put(out, optionFailed ? "1" : "0");
    putList(out, history);
    put(out, previous == null ? "0" : "1");
    putList(out, previous == null ? List.of() : previous);
    put(out, reload ? "1" : "0");
    put(out, quiet ? "1" : "0");
    putList(out, entries);
    putList(out, rest);
    return out.toString();
  }

  static Carried decode(String text) {
    if (!text.startsWith("v1")) throw new IllegalArgumentException("not a carried session");
    int[] at = {2};
    Carried c = new Carried();
    c.mode = Mode.valueOf(take(text, at));
    String retained = take(text, at);
    c.retained = retained.isEmpty() ? null : Mode.valueOf(retained);
    c.optionFailed = take(text, at).equals("1");
    c.history = takeList(text, at);
    boolean hasPrevious = take(text, at).equals("1");
    List<String> previous = takeList(text, at);
    c.previous = hasPrevious ? previous : null;
    c.reload = take(text, at).equals("1");
    c.quiet = take(text, at).equals("1");
    c.entries = takeList(text, at);
    c.rest = takeList(text, at);
    return c;
  }

  private static void put(StringBuilder out, String value) {
    out.append(value.length()).append(':').append(value);
  }

  private static void putList(StringBuilder out, List<String> values) {
    put(out, String.valueOf(values.size()));
    for (String v : values) put(out, v);
  }

  private static String take(String text, int[] at) {
    int colon = text.indexOf(':', at[0]);
    int length = Integer.parseInt(text.substring(at[0], colon));
    at[0] = colon + 1 + length;
    return text.substring(colon + 1, at[0]);
  }

  private static List<String> takeList(String text, int[] at) {
    int count = Integer.parseInt(take(text, at));
    List<String> values = new ArrayList<>();
    for (int i = 0; i < count; i++) values.add(take(text, at));
    return values;
  }
}
