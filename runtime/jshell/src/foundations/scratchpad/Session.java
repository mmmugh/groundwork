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
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import jdk.jshell.SourceCodeAnalysis;

/**
 * The one session a Ristretto VM holds, behind BrowserJShell's static entry points. Nothing thrown inside may reach
 * Ristretto (it would end the session with a raw trace), so each call catches everything and says so plainly.
 */
public final class Session {
  private Session() {}

  private static Shell shell;

  public static String input(String text) {
    try {
      if (shell == null) {
        shell = new Shell();
        shell.open();
        if (text.isEmpty()) return ready();
      }
      if (shell.closed) return ready();
      List<String> lines = List.of(text.split("\r\n|\r|\n", -1));
      for (int i = 0; i < lines.size(); i++) {
        shell.line(lines.get(i));
        if (shell.closed) break;
        if (shell.restart != null) {
          // R5: the lines after the command run on the fresh VM, after the restart
          Carried carried = shell.restart;
          carried.rest = new ArrayList<>(lines.subList(i + 1, lines.size()));
          shell = null;
          String answer = ready();
          return answer.substring(0, answer.length() - 1) + ",\"reload\":{\"feedback\":" + JsonText.quote(carried.encode())
              + ",\"entries\":[]}}";
        }
      }
    } catch (Throwable t) {
      Shell.print("|  The scratchpad itself failed (" + t + "). Use /reset to start over.\n");
      if (shell != null) shell.forget();
    }
    return ready();
  }

  /** R5: Ristretto's call on the fresh VM it started for a reload answer, with what that answer carried. */
  public static String beginReload(String state) {
    try {
      Carried carried = Carried.decode(state);
      shell = new Shell();
      shell.resume(carried);
      for (int i = 0; i < carried.rest.size(); i++) {
        shell.line(carried.rest.get(i));
        if (shell.closed) break;
        if (shell.restart != null) {
          // Ristretto starts one fresh VM per request (lib.rs), so a second restart cannot happen here
          shell.restart = null;
          Shell.print("|  Only one /reset or /reload runs per entry in this scratchpad: \"" + carried.rest.get(i)
              + "\" and the lines after it did not run.\n");
          break;
        }
      }
    } catch (Throwable t) {
      Shell.print("|  The scratchpad itself failed (" + t + "). Use /reset to start over.\n");
      if (shell != null) shell.forget();
    }
    return ready();
  }

  public static String complete(String text, String cursor) {
    StringBuilder out = new StringBuilder("{\"type\":\"completions\",\"anchor\":");
    Set<String> suggestions = new LinkedHashSet<>();
    int anchor = 0;
    try {
      if (shell != null && !shell.closed) {
        int at = Math.max(0, Math.min(text.length(), Integer.parseInt(cursor)));
        String before = shell.pending;
        if (before.isEmpty() && text.startsWith("/") && text.indexOf(' ') < 0) {
          for (String n : Commands.NAMES) if (n.startsWith(text.substring(0, at))) suggestions.add(n);
        } else {
          int[] start = new int[1];
          List<SourceCodeAnalysis.Suggestion> found = shell.jshell.sourceCodeAnalysis()
              .completionSuggestions(before + text, before.length() + at, start);
          for (SourceCodeAnalysis.Suggestion s : found) {
            suggestions.add(s.continuation());
            if (suggestions.size() >= 100) break;
          }
          anchor = Math.max(0, start[0] - before.length());
        }
      }
    } catch (Throwable ignored) {
      suggestions.clear();
    }
    out.append(anchor).append(",\"suggestions\":[");
    boolean first = true;
    for (String s : suggestions) {
      if (!first) out.append(',');
      first = false;
      out.append(JsonText.quote(s));
    }
    return out.append("]}").toString();
  }

  public static String cancel() {
    if (shell != null) shell.forget();
    return ready();
  }

  /** The answer Ristretto expects, plus the prompt for the next line (see BrowserJShell). */
  public static String ready() {
    boolean closed = shell != null && shell.closed;
    boolean continuation = shell != null && !shell.pending.isEmpty();
    String prompt = shell == null || closed ? "" : shell.prompt();
    return "{\"type\":\"ready\",\"continuation\":" + continuation + ",\"closed\":" + closed + ",\"reset\":false,\"prompt\":"
        + JsonText.quote(prompt) + "}";
  }
}
