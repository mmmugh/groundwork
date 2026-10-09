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

import java.util.HashMap;
import java.util.Map;
import jdk.jshell.Snippet;

/**
 * The ids the reader sees (DERIVATION.md, N1 to N3). The library gives an overwriting snippet the same number as the
 * one it overwrites (JShell.Builder.idGenerator), while the reader sees every snippet under its own id: startup
 * snippets s1, s2 ...; accepted snippets 1, 2, 3 ... in the order typed; rejected ones e1, e2 .... A snippet's
 * acceptance is known only after it is evaluated, so the library is handed private ids and the visible ones are
 * given out afterward. A temporary variable is named "$" and the number its snippet will get if accepted.
 */
final class Numbers {
  private int privateIds, accepted, rejected, started;
  private final Map<String, String> visible = new HashMap<>();
  /** True while the startup snippets are evaluated. */
  boolean startup;

  /** The private id for the library: "p" and a counter, never shown. */
  String nextPrivate() {
    return "p" + (++privateIds);
  }

  /** N2: the temporary variable of the snippet being evaluated. */
  String nextTemporary() {
    return "$" + (accepted + 1);
  }

  /** N1: gives the snippet its visible id once its first status is known; later calls change nothing. */
  String assign(Snippet s, Snippet.Status status) {
    return visible.computeIfAbsent(s.id(), k -> status == Snippet.Status.REJECTED ? "e" + (++rejected)
        : startup ? "s" + (++started) : String.valueOf(++accepted));
  }

  /** The visible id of a snippet already numbered, or the private one if it never was (should not happen). */
  String of(Snippet s) {
    return visible.getOrDefault(s.id(), s.id());
  }

  /** A stack frame's file name "#p7" as the reader sees it, "#5". */
  String file(String privateFile) {
    return "#" + visible.getOrDefault(privateFile.substring(1), privateFile.substring(1));
  }
}
