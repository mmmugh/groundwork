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
import jdk.jshell.EvalException;
import jdk.jshell.JShell;
import jdk.jshell.JShellException;
import jdk.jshell.Snippet;
import jdk.jshell.Snippet.Status;
import jdk.jshell.SnippetEvent;
import jdk.jshell.SourceCodeAnalysis;
import jdk.jshell.UnresolvedReferenceException;
import jdk.jshell.VarSnippet;

/**
 * One scratchpad session: the library's JShell instance, what the reader has typed, and the feedback mode. Every
 * method writes what the reader sees straight to System.out, so it interleaves with the program's own output in the
 * order things happen (DERIVATION.md, O1).
 */
final class Shell {
  /** J1: the ten imports of the real tool's --startup DEFAULT_NO_MODULE_IMPORTS, then java.time (decision J1). */
  static final String[] STARTUP = {
    "import java.io.*;", "import java.math.*;", "import java.net.*;", "import java.nio.file.*;", "import java.util.*;",
    "import java.util.concurrent.*;", "import java.util.function.*;", "import java.util.prefs.*;",
    "import java.util.regex.*;", "import java.util.stream.*;", "import java.time.*;",
  };

  JShell jshell;
  Numbers numbers;
  private Engine.Provider provider;
  Mode mode = Mode.NORMAL;
  Mode retained;
  String pending = "";
  /** C9: the pending text is the argument of an /exit, still being typed. */
  boolean exiting;
  /** C9: an option of /reset or /reload was refused, so a bare /exit reports status 1. */
  boolean optionFailed;
  final List<String> history = new ArrayList<>();
  /** L1: what /reload replays: each accepted evaluation's source and each /drop, in order; and the list before. */
  List<String> replay = new ArrayList<>(), previousReplay = null;
  /** R5: set by /reset and /reload, which end this VM's session; Ristretto goes on in a fresh VM with this. */
  Carried restart;
  /** True while /reload replays: values and declarations are not reported, warnings and exceptions are (L2). */
  boolean replaying;
  boolean closed;
  final Commands commands = new Commands(this);

  /** B1: the banner a new session prints before its first prompt. */
  void open() {
    print("|  Welcome to JShell -- Version " + System.getProperty("java.version") + "\n"
        + "|  For an introduction type: /help intro\n");
    start();
  }

  /**
   * R5: ends this session for a fresh VM. A second library instance in the same Ristretto VM would define classes
   * under the names the first one used, and that VM resolves them to the old classes, so a restart needs a new VM.
   */
  void restart(boolean reload, boolean quiet, List<String> entries) {
    Carried c = new Carried();
    c.mode = mode;
    c.retained = retained;
    c.optionFailed = optionFailed;
    c.history = new ArrayList<>(history);
    c.previous = replay;
    c.reload = reload;
    c.quiet = quiet;
    c.entries = new ArrayList<>(entries);
    restart = c;
  }

  /** R5: a session going on in a fresh VM: no banner, the reader's settings and history, then the replay. */
  void resume(Carried c) {
    mode = c.mode;
    retained = c.retained;
    optionFailed = c.optionFailed;
    history.addAll(c.history);
    previousReplay = c.previous;
    start();
    if (c.reload) commands.replay(c.entries, c.quiet);
  }

  /** A fresh library instance with the startup snippets evaluated silently. */
  void start() {
    // J3: the locale of a US reader's JDK; Ristretto's VM starts with "en" and no country
    Locale.setDefault(Locale.US);
    System.setProperty("user.country", "US");
    System.setIn(new NoKeyboard()); // U1: reading the keyboard says plainly that it cannot
    if (jshell != null) jshell.close();
    numbers = new Numbers();
    provider = new Engine.Provider();
    Numbers ids = numbers;
    jshell = JShell.builder()
        .executionEngine(provider, null)
        .compilerOptions("-classpath", "")
        .fileManager(files -> new OwnThreadFiles(files, Thread.currentThread()))
        .idGenerator((snippet, index) -> ids.nextPrivate())
        .tempVariableNameGenerator(ids::nextTemporary)
        .in(System.in).out(System.out).err(System.err)
        .build();
    numbers.startup = true;
    for (String source : STARTUP) {
      for (SnippetEvent e : jshell.eval(source)) numbers.assign(e.snippet(), e.status());
    }
    numbers.startup = false;
    pending = "";
    exiting = false;
  }

  /** I4 (probe G29): Ctrl-C forgets the unfinished input, an /exit argument still being typed included. */
  void forget() {
    pending = "";
    exiting = false;
  }

  String prompt() {
    return pending.isEmpty() ? mode.prompt : mode.continuation;
  }

  /** I1: one line as the reader pressed Enter after it; I0: white space at its end does not count. */
  void line(String text) {
    text = text.stripTrailing();
    boolean command = pending.isEmpty() && text.startsWith("/") && !text.startsWith("//") && !text.startsWith("/*");
    if (!command || !Commands.isRerun(text)) remember(text);
    if (command) {
      commands.run(text.strip());
      return;
    }
    pending += text + "\n";
    if (exiting) {
      String argument = pending.substring(0, pending.length() - 1);
      pending = "";
      exiting = false;
      commands.exit(argument);
      return;
    }
    consume();
  }

  /** H1: what /history keeps: no empty line, no line that starts with white space, no line twice in a row. */
  void remember(String text) {
    if (text.isEmpty() || Character.isWhitespace(text.charAt(0))) return;
    if (!history.isEmpty() && history.get(history.size() - 1).equals(text)) return;
    history.add(text);
  }

  /** I2, I3: evaluates every complete snippet in the pending text; a failing one drops the rest of the line. */
  private void consume() {
    while (true) {
      if (pending.isBlank()) { pending = ""; return; }
      SourceCodeAnalysis.CompletionInfo info = jshell.sourceCodeAnalysis().analyzeCompletion(pending);
      switch (info.completeness()) {
        case EMPTY -> { pending = ""; return; }
        case DEFINITELY_INCOMPLETE, CONSIDERED_INCOMPLETE -> { return; }
        default -> {
          pending = info.remaining();
          if (!evaluate(info.source())) { pending = ""; return; }
        }
      }
    }
  }

  /** The engine of the current library instance, ready to watch one more evaluation or drop. */
  Engine watch() {
    Engine engine = provider.engine;
    engine.beginEvaluation();
    return engine;
  }

  /** Evaluates one snippet and prints what the reader sees for it; false if it was rejected or threw. */
  boolean evaluate(String source) {
    NoKeyboard.told = false;
    Engine engine = watch();
    List<SnippetEvent> events = jshell.eval(source);
    boolean accepted = false;
    for (SnippetEvent e : events) {
      numbers.assign(e.snippet(), e.status());
      if (e.causeSnippet() == null && e.status() != Status.REJECTED) accepted = true;
    }
    if (accepted) replay.add(source);
    return report(events, engine);
  }

  /** R2: what the reader sees for one evaluation's events. */
  boolean report(List<SnippetEvent> events, Engine engine) {
    boolean inPlace = engine != null && engine.redefineAsked && engine.allInPlace && !engine.staticStateAtStake;
    if (inPlace) {
      for (SnippetEvent e : events) {
        if (e.causeSnippet() != null && e.snippet() instanceof VarSnippet && e.status() == Status.VALID
            && e.previousStatus() == Status.VALID && e.isSignatureChange()) {
          inPlace = false; // a variable was reset: say so, as the local engine does
        }
      }
    }
    StringBuilder out = new StringBuilder();
    boolean ok = true;
    for (SnippetEvent e : events) {
      Snippet s = e.snippet();
      boolean update = e.causeSnippet() != null;
      if (!update) {
        for (Diag d : jshell.diagnostics(s).toList()) out.append(ErrorBlock.of(d, s.source()));
        if (e.status() == Status.REJECTED) { ok = false; continue; }
        JShellException x = e.exception();
        if (x instanceof EvalException ee) {
          print(out.toString());
          out.setLength(0);
          out.append(TraceBlock.of(ee, numbers::file));
          ok = false;
          continue;
        }
        if (x instanceof UnresolvedReferenceException ure && !replaying) {
          Snippet target = ure.getSnippet();
          out.append(Reports.display(Reports.facts(target, Reports.Act.USED, true,
              Reports.resolution(jshell.status(target)), null), mode, jshell));
          ok = false;
          continue;
        }
      } else if (inPlace && e.status() == e.previousStatus()) {
        continue; // R1: the default engine redefines in place and never touches the dependents
      }
      if (replaying) continue;
      boolean signatureChange = e.isSignatureChange() && !(inPlace && e.previousStatus().isActive());
      Reports.Act act = Reports.act(e.previousStatus(), e.status(), signatureChange);
      out.append(Reports.display(Reports.facts(s, act, update, Reports.resolution(e.status()), e.value()), mode, jshell));
    }
    print(out.toString());
    return ok;
  }

  /** O1: the front end's own stream, kept from the start, so a snippet that replaces System.out does not take it (G26). */
  private static final java.io.PrintStream OUT = System.out;

  static void print(String text) {
    if (!text.isEmpty()) {
      OUT.print(text);
      OUT.flush();
    }
  }
}
