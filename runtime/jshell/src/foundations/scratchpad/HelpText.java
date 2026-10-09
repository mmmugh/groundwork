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

/**
 * The scratchpad's own help, in the course's words (decision J2): the real tool's help text is OpenJDK's, so it is not
 * copied here. Every line is behind "|  " as the real tool's are, and the command list has the real first screen's shape
 * (a usage line, then its description indented by a tab); the rest, including /help intro and the help for one
 * command, is the course's own layout. Everything the real tool offers and the scratchpad does not is named as such.
 */
final class HelpText {
  private HelpText() {}

  private static final String[][] COMMANDS = {
    {"/list [<name or id>|-all|-start]", "show the snippets you have entered, with their ids"},
    {"/vars [<name or id>|-all|-start]", "show your variables and their values"},
    {"/methods [<name or id>|-all|-start]", "show your methods"},
    {"/types [<name or id>|-all|-start]", "show your classes, interfaces, enums and records"},
    {"/imports", "show the imports in effect"},
    {"/drop <name or id>", "remove a snippet, by its name or its id"},
    {"/history", "show every line you have typed"},
    {"/reset", "start over: forget every snippet"},
    {"/reload [-restore] [-quiet]", "start over, then run your snippets again; -restore runs the ones from before the last /reset or /reload"},
    {"/set feedback [concise|normal|silent|verbose]", "choose how much the scratchpad says after each entry"},
    {"/! or /<id> or /-<n>", "run the last snippet, the snippet with that id, or the nth one back, again"},
    {"/help [<command>|intro]", "show this help, or the help for one command"},
    {"/exit", "end this session"},
  };

  static void help(String topic) {
    String t = topic.strip();
    if (t.isEmpty()) {
      StringBuilder out = new StringBuilder();
      out.append("|  This is the course's Java scratchpad. Type a piece of Java and press Enter to run it.\n");
      out.append("|  A line that is not finished (an open brace, for example) waits for the next line.\n");
      out.append("|  These commands work here:\n");
      for (String[] c : COMMANDS) out.append("|  ").append(c[0]).append("\n|  \t").append(c[1]).append('\n');
      out.append("|  \n");
      out.append("|  The JDK's own jshell also has /edit, /open, /save, /env, /debug and more of /set;\n");
      out.append("|  the scratchpad leaves them out: it runs in your browser, with no files or editor of its own.\n");
      Shell.print(out.toString());
      return;
    }
    if ("intro".startsWith(t)) {
      Shell.print("|  \n|  The scratchpad runs Java one piece at a time: an expression shows its value,\n"
          + "|  a declaration makes a variable, method or class you can use in the next entries.\n"
          + "|  Try 2 + 3, then int x = 10, then x * 2. Type /help to see the commands.\n");
      return;
    }
    String word = t.startsWith("/") ? t : "/" + t;
    for (String[] c : COMMANDS) {
      if (c[0].startsWith(word)) {
        Shell.print("|  " + c[0] + "\n|  \t" + c[1] + "\n");
        return;
      }
    }
    Shell.print("|  The scratchpad has no help on " + t + ". Type /help to see what it offers.\n");
  }

  /** What a command the real tool has, and the scratchpad does not, answers. */
  static void unavailable(String command) {
    Shell.print("|  " + command + " is not available in this scratchpad. Type /help to see what is.\n");
  }
}
