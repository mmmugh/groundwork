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
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import jdk.jshell.ImportSnippet;
import jdk.jshell.MethodSnippet;
import jdk.jshell.PersistentSnippet;
import jdk.jshell.Snippet;
import jdk.jshell.Snippet.Status;
import jdk.jshell.SnippetEvent;
import jdk.jshell.TypeDeclSnippet;
import jdk.jshell.VarSnippet;

/** The slash commands (DERIVATION.md, C1 to C12, U1). Each writes what the reader sees with Shell.print. */
final class Commands {
  private final Shell shell;

  Commands(Shell shell) {
    this.shell = shell;
  }

  /** C1: every command name, in the order the real tool lists them when an abbreviation is ambiguous. */
  static final String[] NAMES = {"/list", "/edit", "/drop", "/save", "/open", "/vars", "/methods", "/types",
    "/imports", "/exit", "/env", "/reset", "/reload", "/history", "/debug", "/help", "/set", "/?", "/!"};

  private static final Pattern RERUN = Pattern.compile("/(!|-\\d+|[se]?\\d+(-[se]?\\d*)?)");

  void run(String line) {
    int space = indexOfSpace(line);
    String word = space < 0 ? line : line.substring(0, space);
    String rest = space < 0 ? "" : line.substring(space + 1).strip();
    String name = resolve(word, line);
    if (name == null) return;
    switch (name) {
      case "/list" -> list(rest, line);
      case "/vars" -> vars(rest, line);
      case "/methods" -> methods(rest, line);
      case "/types" -> types(rest, line);
      case "/imports" -> imports();
      case "/drop" -> drop(rest, line);
      case "/history" -> history(rest, line);
      case "/reset" -> reset(rest);
      case "/reload" -> reload(rest);
      case "/exit" -> exit(rest);
      case "/help", "/?" -> HelpText.help(rest);
      case "/set" -> set(rest, line);
      case "/rerun" -> rerun(line.substring(1).strip(), line);
      case "/env" -> { if (!rest.isEmpty()) HelpText.unavailable("/env " + words(rest).get(0)); }
      default -> HelpText.unavailable(name);
    }
  }

  /** Q1: the follow-up line only the modes that confirm commands (normal, verbose) print. */
  private String typeHelp() {
    return shell.mode.announces() ? "|  Type /help for help.\n" : "";
  }

  /** C1: the command word ends at the first space; a tab does not end it (probe G23). */
  private static int indexOfSpace(String s) {
    return s.indexOf(' ');
  }

  /** Whether the line is a rerun, whose history entry is the rerun source, not the line (H2). */
  static boolean isRerun(String line) {
    String word = line.strip().split(" ", 2)[0];
    for (String n : NAMES) if (n.startsWith(word) && !n.equals("/!")) return false;
    return word.equals("/!") || rerunWord(word);
  }

  /** C11: a rerun form; "/-n" whose n does not fit an int is no rerun but an invalid command (probe G23). */
  private static boolean rerunWord(String word) {
    if (!RERUN.matcher(word).matches()) return false;
    if (!word.startsWith("/-")) return true;
    try { Integer.parseInt(word.substring(2)); return true; } catch (NumberFormatException e) { return false; }
  }

  /** C1, C2: an exact name, a unique prefix, a rerun form; otherwise the ambiguous or invalid message. */
  private String resolve(String word, String line) {
    for (String n : NAMES) if (n.equals(word)) return word.equals("/!") ? "/rerun" : n;
    List<String> matches = new ArrayList<>();
    for (String n : NAMES) if (n.startsWith(word)) matches.add(n);
    if (matches.size() == 1) return matches.get(0).equals("/!") ? "/rerun" : matches.get(0);
    if (matches.size() > 1) {
      Shell.print("|  Command: '" + word + "' is ambiguous: " + String.join(", ", matches) + "\n" + typeHelp());
      return null;
    }
    if (rerunWord(word)) return "/rerun";
    Shell.print("|  Invalid command: " + word + "\n" + typeHelp());
    return null;
  }

  // ---- selecting snippets by name, id or range (C3)

  private static final Pattern ID = Pattern.compile("[se]?\\d+");
  private static final Pattern RANGE = Pattern.compile("([^-]+)-(.*)");

  /** The selection, or null after printing the reason it failed. */
  private List<Snippet> select(List<String> args, java.util.function.Predicate<Snippet> byName, boolean dropping, String line) {
    List<Snippet> all = shell.jshell.snippets().toList();
    List<Snippet> chosen = new ArrayList<>();
    String see = dropping && shell.mode.announces() && !shell.replaying ? "|  See /types, /methods, /vars, or /list\n" : "";
    for (String arg : args) {
      Matcher range = RANGE.matcher(arg);
      if (!ID.matcher(arg).matches() && range.matches()) {
        String from = range.group(1), to = range.group(2);
        if (!ID.matcher(from).matches()) {
          Shell.print("|  Snippet ranges require snippet IDs: " + from + "\n" + see);
          return null;
        }
        if (position(all, from) < 0) {
          Shell.print("|  No snippet with ID: " + from + "\n" + see);
          return null;
        }
        if (!ID.matcher(to).matches()) {
          Shell.print("|  Snippet ranges require snippet IDs: " + to + "\n" + see);
          return null;
        }
        // C3: a range runs over the ids in order, startup ids, then main ids, then error ids
        List<Snippet> ordered = new ArrayList<>(all);
        ordered.sort(java.util.Comparator.comparing(s -> idOrder(shell.numbers.of(s))));
        int a = position(ordered, from), b = position(ordered, to);
        if (a < 0 || b < 0) {
          Shell.print("|  No snippet with ID: " + (a < 0 ? from : to) + "\n" + see);
          return null;
        }
        if (b < a) {
          Shell.print("|  End of snippet range less than start: " + from + " - " + to + "\n" + see);
          return null;
        }
        // C3: its two ends are taken as if given by id; between them only the snippets the command would
        // choose by name, and for /drop only active ones
        for (int i = a; i <= b; i++) {
          Snippet s = ordered.get(i);
          if (i == a || i == b || (byName.test(s) && (!dropping || shell.jshell.status(s).isActive()))) chosen.add(s);
        }
      } else if (ID.matcher(arg).matches()) {
        int at = position(all, arg);
        if (at < 0) {
          Shell.print("|  No snippet with ID: " + arg + "\n" + see);
          return null;
        }
        chosen.add(all.get(at));
      } else {
        List<Snippet> named = new ArrayList<>(), anyKind = new ArrayList<>();
        for (Snippet s : all) {
          if (!(s instanceof PersistentSnippet p) || !p.name().equals(arg)) continue;
          if (dropping && s instanceof ImportSnippet) continue; // C6: imports are dropped by id only
          anyKind.add(s);
          if (byName.test(s) && shell.jshell.status(s).isActive()) named.add(s);
        }
        if (named.isEmpty()) for (Snippet s : anyKind) if (byName.test(s)) named.add(s);
        if (named.isEmpty() && !anyKind.isEmpty()) {
          Snippet shown = anyKind.get(0);
          for (Snippet s : anyKind) if (shell.jshell.status(s).isActive()) { shown = s; break; }
          Shell.print("|  This command does not accept the snippet '" + arg + "' : " + shown.source().strip() + "\n" + see);
          return null;
        }
        if (named.isEmpty()) {
          Shell.print("|  No such snippet: " + arg + "\n" + see);
          return null;
        }
        chosen.addAll(named);
      }
    }
    return chosen;
  }

  private int position(List<Snippet> all, String id) {
    for (int i = 0; i < all.size(); i++) if (shell.numbers.of(all.get(i)).equals(id)) return i;
    return -1;
  }

  private static String idOrder(String id) {
    int rank = id.startsWith("s") ? 0 : id.startsWith("e") ? 2 : 1;
    String number = rank == 1 ? id : id.substring(1);
    return rank + String.format("%010d", Long.parseLong(number));
  }

  private static List<String> words(String rest) {
    List<String> out = new ArrayList<>();
    for (String w : rest.split("\\s+")) if (!w.isEmpty()) out.add(w);
    return out;
  }

  // ---- /list (C2)

  private void list(String rest, String line) {
    List<String> args = words(rest);
    List<String> options = new ArrayList<>(), names = new ArrayList<>();
    for (String a : args) (a.startsWith("-") ? options : names).add(a);
    String option = listOption(options, names, line);
    if ("?".equals(option)) return;
    List<Snippet> shown = new ArrayList<>();
    if (!names.isEmpty()) {
      List<Snippet> chosen = select(names, s -> true, false, line);
      if (chosen == null) return;
      shown = chosen;
    } else {
      for (Snippet s : shell.jshell.snippets().toList()) {
        String id = shell.numbers.of(s);
        boolean startup = id.startsWith("s");
        if ("-all".equals(option) || ("-start".equals(option) && startup)
            || (option == null && !startup && shell.jshell.status(s).isActive())) shown.add(s);
      }
      if (shown.isEmpty()) return;
    }
    StringBuilder out = new StringBuilder("\n");
    for (Snippet s : shown) {
      String[] lines = s.source().replaceAll("\n+$", "").split("\n", -1);
      out.append(String.format("%4s : ", shell.numbers.of(s))).append(lines[0]).append('\n');
      for (int i = 1; i < lines.length; i++) out.append("       ").append(lines[i]).append('\n');
    }
    Shell.print(out.toString());
  }

  /**
   * C2, C4: the options of /list, /vars, /methods and /types, "-all" and "-start" by any prefix after one or two
   * dashes (probe G24). Returns the option, null for none, or "?" after printing why the arguments are refused.
   */
  private static String listOption(List<String> options, List<String> names, String line) {
    String option = null;
    for (String o : options) {
      String name = o.replaceFirst("^--?", "");
      String which = name.isEmpty() ? null : "all".startsWith(name) ? "-all" : "start".startsWith(name) ? "-start" : null;
      if (which == null) { Shell.print("|  Unknown option: " + o + " -- " + line + "\n"); return "?"; }
      if (option != null && !option.equals(which)) { Shell.print("|  Conflicting options -- " + line + "\n"); return "?"; }
      option = which;
    }
    if (option != null && !names.isEmpty()) { Shell.print("|  Options and snippets must not both be used: " + line + "\n"); return "?"; }
    return option;
  }

  // ---- /vars, /methods, /types, /imports (C4, C5)

  private interface Row { String of(Snippet s); }

  private void listing(String rest, String line, java.util.function.Predicate<Snippet> kind, Row row) {
    List<String> options = new ArrayList<>(), names = new ArrayList<>();
    for (String a : words(rest)) (a.startsWith("-") ? options : names).add(a);
    String option = listOption(options, names, line);
    if ("?".equals(option)) return;
    boolean all = "-all".equals(option);
    List<Snippet> shown = new ArrayList<>();
    if ("-start".equals(option)) {
      for (Snippet s : shell.jshell.snippets().toList()) if (kind.test(s) && shell.numbers.of(s).startsWith("s")) shown.add(s);
    } else if (!names.isEmpty()) {
      List<Snippet> chosen = select(names, kind, false, line);
      if (chosen == null) return;
      for (Snippet s : chosen) {
        if (!kind.test(s)) {
          Shell.print("|  This command does not accept the snippet '" + shell.numbers.of(s) + "' : " + s.source().strip() + "\n");
          return;
        }
      }
      shown = chosen;
    } else {
      for (Snippet s : shell.jshell.snippets().toList()) {
        if (kind.test(s) && (all || shell.jshell.status(s).isActive())) shown.add(s);
      }
    }
    StringBuilder out = new StringBuilder();
    for (Snippet s : shown) out.append(row.of(s));
    Shell.print(out.toString());
  }

  private void vars(String rest, String line) {
    listing(rest, line, s -> s instanceof VarSnippet, s -> {
      VarSnippet v = (VarSnippet) s;
      String value = shell.jshell.status(v) == Status.VALID ? shell.jshell.varValue(v) : "(not-active)";
      return "|    " + v.typeName() + " " + v.name() + " = " + value + "\n";
    });
  }

  private void methods(String rest, String line) {
    listing(rest, line, s -> s instanceof MethodSnippet, s -> {
      MethodSnippet m = (MethodSnippet) s;
      String signature = m.signature();
      String returns = signature.substring(signature.lastIndexOf(')') + 1);
      return "|    " + returns + " " + m.name() + "(" + m.parameterTypes() + ")\n" + waiting(s);
    });
  }

  private void types(String rest, String line) {
    listing(rest, line, s -> s instanceof TypeDeclSnippet, s -> {
      String kind = Reports.typeKind(s);
      if (kind.equals("annotation interface")) kind = "@interface";
      return "|    " + kind + " " + ((TypeDeclSnippet) s).name() + "\n" + waiting(s);
    });
  }

  /** C5: a second line for a declaration that still waits on undeclared names. */
  private String waiting(Snippet s) {
    Status status = shell.jshell.status(s);
    if (status == Status.VALID || !status.isActive()) return "";
    Reports.Facts f = Reports.facts(s, Reports.Act.MODIFIED, true, Reports.resolution(status), null);
    return "|      " + Reports.resolve(f, shell.jshell) + "\n";
  }

  private void imports() {
    StringBuilder out = new StringBuilder();
    for (Snippet s : shell.jshell.snippets().toList()) {
      if (s instanceof ImportSnippet i && shell.jshell.status(s).isActive()) {
        out.append("|    import ").append(i.isStatic() ? "static " : "").append(i.fullname()).append('\n');
      }
    }
    Shell.print(out.toString());
  }

  // ---- /drop (C6)

  private void drop(String rest, String line) {
    List<String> args = words(rest);
    if (args.isEmpty()) {
      Shell.print("|  In the /drop argument, please specify an import, variable, method, or class to drop.\n"
          + "Specify by ID or name. Use /list to see IDs. Use /reset to reset all state.\n");
      return;
    }
    for (String a : args) {
      if (a.startsWith("-")) { Shell.print("|  Unknown option: " + a + " -- " + line + "\n"); return; }
    }
    List<Snippet> chosen = select(args, s -> !(s instanceof ImportSnippet), true, line);
    if (chosen == null) return;
    for (int i = 0; i < chosen.size(); i++) {
      Snippet s = chosen.get(i);
      if (!(s instanceof PersistentSnippet) || !shell.jshell.status(s).isActive()) {
        String see = shell.mode.announces() ? "|  See /types, /methods, /vars, or /list\n" : "";
        String arg = s instanceof PersistentSnippet p && args.contains(p.name()) ? p.name() : shell.numbers.of(s);
        Shell.print("|  This command does not accept the snippet '" + arg + "' : " + s.source().strip() + "\n" + see);
        return;
      }
    }
    for (Snippet s : chosen) {
      Engine engine = shell.watch();
      List<SnippetEvent> events = shell.jshell.drop(s);
      shell.report(events, engine);
    }
    shell.replay.add("/drop " + rest.strip()); // L1: replayed under its full name (probe G23)
  }

  // ---- /history, /reset, /exit (C7 to C9)

  private void history(String rest, String line) {
    if (!rest.isEmpty() && !rest.equals("-all")) {
      Shell.print("|  Unexpected arguments at end of command: " + rest + " -- " + line + "\n");
      return;
    }
    StringBuilder out = new StringBuilder("\n");
    for (String h : shell.history) out.append(h).append('\n');
    Shell.print(out.toString());
  }

  /** C8: /reset and /reload refuse words and unknown options before doing anything; null when the line is fine. */
  private static final List<String> PATH_OPTIONS = List.of("class-path", "module-path", "add-modules", "add-exports");

  /**
   * C8: how /reset and /reload read their options (probes G20, G21). "--name" names an option by a prefix of its name;
   * "-name" does too, and otherwise is a cluster of one-letter options (r and q for /reload); "-" alone is an argument
   * and "--" ends the options. An unknown option is reported first, then arguments left over. The path options take a
   * value and are not offered (U1). Returns the refusal, or null with the options chosen in {@code chosen}.
   */
  private String refused(List<String> args, boolean reload, List<String> chosen) {
    List<String> known = new ArrayList<>(reload ? List.of("restore", "quiet") : List.of());
    known.addAll(PATH_OPTIONS);
    List<String> loose = new ArrayList<>();
    String unavailable = null;
    boolean ended = false;
    for (int i = 0; i < args.size(); i++) {
      String a = args.get(i);
      if (ended || a.equals("-") || !a.startsWith("-")) { loose.add(a); continue; }
      if (a.equals("--")) { ended = true; continue; }
      boolean twoDashes = a.startsWith("--");
      String name = a.substring(twoDashes ? 2 : 1);
      List<String> matches = new ArrayList<>();
      for (String k : known) if (k.startsWith(name)) matches.add(k);
      List<String> options = new ArrayList<>();
      if (matches.size() == 1) options.add(matches.get(0));
      else if (twoDashes) return unknownOption(name);
      else {
        for (char c : name.toCharArray()) {
          String letter = !reload ? null : c == 'r' ? "restore" : c == 'q' ? "quiet" : null;
          if (letter == null) return unknownOption(String.valueOf(c));
          options.add(letter);
        }
      }
      for (String o : options) {
        if (PATH_OPTIONS.contains(o)) {
          if (unavailable == null) unavailable = o;
          i++; // its value
        } else chosen.add(o);
      }
    }
    if (unavailable != null) {
      return "|  " + (reload ? "/reload" : "/reset") + " -" + unavailable + " is not available in this scratchpad. Type /help to see what is.\n";
    }
    if (!loose.isEmpty()) {
      return "|  Unexpected arguments at end of command: [" + String.join(", ", loose) + "] -- " + String.join(" ", args) + "\n";
    }
    return null;
  }

  /** C9: an unknown option is the one refusal that a later bare /exit reports, as status 1. */
  private String unknownOption(String name) {
    shell.optionFailed = true;
    return "|  Unknown option: " + name + "\n";
  }

  private void reset(String rest) {
    String refusal = refused(words(rest), false, new ArrayList<>());
    if (refusal != null) { Shell.print(refusal); return; }
    if (shell.mode.announces()) Shell.print("|  Resetting state.\n");
    shell.restart(false, false, List.of());
  }

  /** L1, L2: start over and replay what was accepted, echoing each entry as "-: source". */
  private void reload(String rest) {
    List<String> args = words(rest);
    List<String> options = new ArrayList<>();
    String refusal = refused(args, true, options);
    if (refusal != null) { Shell.print(refusal); return; }
    boolean quiet = options.contains("quiet"), restore = options.contains("restore");
    // C8: before the first /reset or /reload there is nothing to restore, and nothing changes
    if (restore && shell.previousReplay == null) { Shell.print("|  No previous history to restore\n"); return; }
    if (shell.mode.announces()) {
      Shell.print(restore ? "|  Restarting and restoring from previous state.\n" : "|  Restarting and restoring state.\n");
    }
    shell.restart(true, quiet, restore ? shell.previousReplay : shell.replay);
  }

  /** L1, L2: on the fresh VM (R5), replays what was accepted, echoing each entry as "-: source". */
  void replay(List<String> entries, boolean quiet) {
    shell.replaying = true;
    try {
      for (String entry : entries) {
        if (!quiet) Shell.print("-: " + entry.replaceAll("\n+$", "").replace("\n", "\n   ") + "\n");
        if (entry.startsWith("/drop ")) {
          List<Snippet> chosen = select(words(entry.substring(6)), s -> !(s instanceof ImportSnippet), true, entry);
          if (chosen == null) continue; // L1 (probe G27): a drop that misses is not kept for the next replay
          for (Snippet s : chosen) if (shell.jshell.status(s).isActive()) shell.jshell.drop(s);
          shell.replay.add(entry);
        } else {
          shell.evaluate(entry);
        }
      }
    } finally {
      shell.replaying = false;
    }
  }

  /** C9: the types /exit takes (probe G25: char, long and Long are refused). */
  private static final List<String> EXIT_TYPES = List.of("int", "Integer", "short", "Short", "byte", "Byte");

  void exit(String rest) {
    if (!rest.isEmpty()) {
      // C9: an expression not yet complete takes the next lines too, as a snippet does
      switch (shell.jshell.sourceCodeAnalysis().analyzeCompletion(rest).completeness()) {
        case DEFINITELY_INCOMPLETE, CONSIDERED_INCOMPLETE -> {
          shell.pending = rest + "\n";
          shell.exiting = true;
          return;
        }
        default -> {}
      }
      List<SnippetEvent> events = shell.jshell.eval(rest);
      // C9: the expression stays a snippet of the session, with its id, though /reload does not replay it
      for (SnippetEvent x : events) shell.numbers.assign(x.snippet(), x.status());
      SnippetEvent e = events.isEmpty() ? null : events.get(0);
      if (e == null || e.status() == Status.REJECTED) {
        if (e != null) shell.jshell.diagnostics(e.snippet()).forEach(d -> Shell.print(ErrorBlock.of(d, e.snippet().source())));
        return;
      }
      // C9 (probe G25): an exception prints as any other and the session goes on
      if (e.exception() instanceof jdk.jshell.EvalException x) { Shell.print(TraceBlock.of(x, shell.numbers::file)); return; }
      // only an expression counts, and only of these types; a statement runs and is then refused
      boolean expression = e.snippet() instanceof jdk.jshell.ExpressionSnippet
          || (e.snippet() instanceof VarSnippet v && v.subKind() == Snippet.SubKind.TEMP_VAR_EXPRESSION_SUBKIND);
      if (!expression) {
        Shell.print("|  The argument to /exit must be a valid integer expression, it is not an expression: " + rest + "\n");
        return;
      }
      String type = e.snippet() instanceof VarSnippet v ? v.typeName() : ((jdk.jshell.ExpressionSnippet) e.snippet()).typeName();
      if (!EXIT_TYPES.contains(type)) {
        Shell.print("|  The argument to /exit must be a valid integer expression. The type is " + type + " : " + rest + "\n");
        return;
      }
      String value = e.value();
      if (value == null || value.equals("null")) {
        Shell.print("|  The argument to /exit has bad value is null : " + rest + "\n");
        return;
      }
      if (shell.mode.announces()) Shell.print(value == null || value.equals("0") ? "|  Goodbye\n" : "|  Goodbye (" + value + ")\n");
    } else if (shell.mode.announces()) {
      Shell.print(shell.optionFailed ? "|  Goodbye (1)\n" : "|  Goodbye\n");
    }
    shell.closed = true;
    shell.jshell.close();
  }

  // ---- /set (C10, U1)

  /** The words of /set, as its help lists them; "format" before "feedback" as the real tool names an ambiguous "f". */
  private static final String[] SET_WORDS = {"editor", "start", "format", "feedback", "mode", "prompt", "truncation", "indent"};

  private void set(String rest, String line) {
    List<String> args = words(rest);
    if (args.isEmpty()) { HelpText.unavailable("/set"); return; }
    List<String> matches = new ArrayList<>();
    for (String w : SET_WORDS) if (w.startsWith(args.get(0))) matches.add(w);
    if (matches.size() > 1) {
      // C10: an ambiguous prefix names the matches (probe G24: "/set f" gives "format, feedback")
      Shell.print("|  Ambiguous sub-command argument to '/set': " + args.get(0) + "\n|  Use one of: " + String.join(", ", matches) + "\n");
      return;
    }
    if (!matches.equals(List.of("feedback"))) { HelpText.unavailable("/set " + (matches.isEmpty() ? args.get(0) : matches.get(0))); return; }
    feedback(args.subList(1, args.size()), line);
  }

  private void feedback(List<String> args, String line) {
    boolean retain = false;
    String modeWord = null;
    for (String a : args) {
      String w = a.replaceAll("^\"|\"$", "");
      if (w.startsWith("-")) {
        if ("-retain".startsWith(w) && w.length() > 1) { retain = true; continue; }
        Shell.print("|  Unknown option: " + w + " -- " + line + "\n");
        return;
      }
      if (w.isEmpty()) continue;
      if (modeWord != null) {
        Shell.print("|  Unexpected arguments at end of command: " + String.join(" ", args.subList(args.indexOf(a), args.size())) + " -- " + line + "\n");
        return;
      }
      modeWord = w;
    }
    if (modeWord == null) {
      if (retain) { shell.retained = shell.mode; return; }
      StringBuilder out = new StringBuilder();
      if (shell.retained != null) out.append("|  /set feedback -retain ").append(shell.retained.word).append('\n');
      if (shell.retained != shell.mode) out.append("|  /set feedback ").append(shell.mode.word).append('\n');
      out.append("|  \n");
      out.append(available());
      Shell.print(out.toString());
      return;
    }
    if (!modeWord.matches("[A-Za-z0-9_]+")) {
      Shell.print("|  Expected a feedback mode name: " + modeWord + "\n" + (shell.mode.announces() ? "|  See /help /set feedback for help.\n" : ""));
      return;
    }
    Mode chosen = null;
    for (Mode m : Mode.values()) {
      if (m.word.startsWith(modeWord)) { chosen = chosen == null ? m : null; if (chosen == null) break; }
    }
    if (chosen == null) {
      String command = line;
      Shell.print("|  Does not match any current feedback mode: " + modeWord + " -- " + command + "\n"
          + (retain || !shell.mode.announces() ? "" : available() + "|  See /help /set feedback for help.\n"));
      return;
    }
    shell.mode = chosen;
    if (retain) shell.retained = chosen;
    if (chosen.announces()) Shell.print("|  Feedback mode: " + chosen.word + "\n");
  }

  private static String available() {
    StringBuilder out = new StringBuilder("|  Available feedback modes:\n");
    for (Mode m : Mode.values()) out.append("|     ").append(m.word).append('\n');
    return out.toString();
  }

  // ---- reruns (C11)

  private void rerun(String spec, String line) {
    List<Snippet> all = new ArrayList<>(shell.jshell.snippets().toList());
    List<Snippet> chosen = new ArrayList<>();
    List<String> parts = words(spec);
    // C11 (probe G28): "/-n" takes nothing after it; after "/<id>", a word starting with "-" is an unknown option
    if (parts.get(0).startsWith("-") && parts.size() > 1) {
      Shell.print("|  Invalid command: /" + parts.get(0) + "\n" + typeHelp());
      shell.remember(line);
      return;
    }
    if (!parts.get(0).equals("!")) {
      for (String part : parts.subList(1, parts.size())) {
        if (part.startsWith("-")) {
          Shell.print("|  Unknown option: " + part + " -- /<id> " + String.join(" ", parts) + "\n");
          shell.remember(line);
          return;
        }
      }
    }
    for (String part : parts) {
      if (part.equals("!")) {
        chosen.add(all.get(all.size() - 1)); // never empty: the startup snippets are always there
        break;
      }
      if (part.matches("-\\d+")) {
        int back = Integer.parseInt(part.substring(1));
        if (back <= 0 || back > all.size()) { Shell.print("|  Out of range\n"); shell.remember(line); return; }
        chosen.add(all.get(all.size() - back));
        continue;
      }
      List<Snippet> some = select(List.of(part), s -> true, false, "/" + spec);
      if (some == null) { shell.remember(line); return; }
      chosen.addAll(some);
    }
    if (chosen.isEmpty()) shell.remember(line);
    for (Snippet s : chosen) {
      String source = s.source();
      shell.remember(source.replaceAll("\n+$", ""));
      Shell.print(source.replaceAll("\n+$", "") + "\n");
      shell.pending = "";
      shell.evaluate(source);
    }
  }
}
