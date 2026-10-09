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

/** How long values are shortened in feedback lines (DERIVATION.md, V1, V2). */
final class ValueText {
  private ValueText() {}

  /** V1: declarations and assignments show up to 80 characters; expression results and bare names up to 1000. */
  static final int SHORT = 80, LONG = 1000;

  /**
   * V2: a value longer than the limit keeps its head and its tail around " ... ", in all exactly the limit's length:
   * the tail is a third of the limit (rounded down) and the head the rest, 49 + 26 for 80 and 662 + 333 for 1000.
   */
  static String cut(String value, int limit) {
    if (value == null || value.length() <= limit) return value;
    int tail = limit / 3;
    int head = limit - tail - 5;
    return value.substring(0, head) + " ... " + value.substring(value.length() - tail);
  }
}
