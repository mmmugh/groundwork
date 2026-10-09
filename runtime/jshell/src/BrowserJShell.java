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

/**
 * The entry points Ristretto's worker calls (its web/runner/src/lib.rs): it keeps one VM per session and invokes these
 * static methods in it, each returning one JSON answer. The name, the package (none) and the signatures are fixed by
 * Ristretto; everything else lives in foundations.scratchpad.
 *
 * Every answer is a "ready" object with "continuation", "closed" and "reset" as Ristretto's protocol defines them, and
 * one field of the course's own, "prompt": the prompt the panel should show for the next line, which depends on the
 * feedback mode.
 */
public final class BrowserJShell {
  private BrowserJShell() {}

  /** One line (or several, pasted) the reader entered; the first call of a session, usually with "", opens it. */
  public static String input(String text) {
    return foundations.scratchpad.Session.input(text);
  }

  /** Tab completion: the suggestions for the text before the cursor. */
  public static String complete(String text, String cursor) {
    return foundations.scratchpad.Session.complete(text, cursor);
  }

  /** Forgets an unfinished snippet (the panel's Ctrl-C). */
  public static String cancel() {
    return foundations.scratchpad.Session.cancel();
  }

  /** Called by Ristretto on the fresh VM it starts after an answer that asks for a reload (/reset and /reload). */
  public static String beginReload(String state) {
    return foundations.scratchpad.Session.beginReload(state);
  }

  /** Called by Ristretto for a reload's entries; this front end sends none and replays in beginReload. */
  public static String dropSource(String source) {
    return foundations.scratchpad.Session.ready();
  }
}
