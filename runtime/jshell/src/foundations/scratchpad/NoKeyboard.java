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

import java.io.InputStream;

/**
 * System.in in the scratchpad (DERIVATION.md, U1). The real tool hands a program what the reader types; a page cannot,
 * since every entry is one call that must return. Ristretto's System.in is already at its end, so a Scanner throws with
 * no explanation; this stream says why, once per entry, and then is at its end too.
 */
final class NoKeyboard extends InputStream {
  /** Whether this entry has already been told. */
  static boolean told;

  @Override
  public int read() {
    tell();
    return -1;
  }

  @Override
  public int read(byte[] b, int off, int len) {
    if (len == 0) return 0;
    tell();
    return -1;
  }

  private static void tell() {
    if (told) return;
    told = true;
    Shell.print("|  This scratchpad cannot read keyboard input: System.in is always empty here.\n");
  }
}
