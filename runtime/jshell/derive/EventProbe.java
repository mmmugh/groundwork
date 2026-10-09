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

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import jdk.jshell.DeclarationSnippet;
import jdk.jshell.Diag;
import jdk.jshell.EvalException;
import jdk.jshell.JShell;
import jdk.jshell.JShellException;
import jdk.jshell.MethodSnippet;
import jdk.jshell.PersistentSnippet;
import jdk.jshell.Snippet;
import jdk.jshell.SnippetEvent;
import jdk.jshell.SourceCodeAnalysis;
import jdk.jshell.TypeDeclSnippet;
import jdk.jshell.UnresolvedReferenceException;
import jdk.jshell.VarSnippet;

/**
 * A derivation tool, not part of the front end: feeds a session's entries to the public jdk.jshell API and
 * records everything the API reports about each one (every SnippetEvent with its snippet, statuses, value and
 * exception; the diagnostics with their positions; unresolved dependencies; the user code's output). Running it
 * with the default engine and with the local one, next to the real tool's transcript of the same session, is how
 * each output rule in DERIVATION.md is tied to an observation.
 *
 * usage: java EventProbe.java SESSION_FILE OUT_JSON [local]
 *
 * Lines starting with "/" are not snippets; they are recorded as skipped commands. The JShell instance is built
 * with the builder's defaults except the engine, so ids and temporary names are the library's own.
 */
public final class EventProbe {
  public static void main(String[] args) throws Exception {
    boolean local = args.length > 2 && args[2].equals("local");
    List<List<String>> entries = Sessions.parse(Files.readString(Path.of(args[0])));
    ByteArrayOutputStream user = new ByteArrayOutputStream();
    PrintStream userStream = new PrintStream(user, true, StandardCharsets.UTF_8);
    PrintStream stdout = System.out;
    System.setOut(userStream);
    System.setErr(userStream);
    JShell.Builder builder = JShell.builder().out(userStream).err(userStream);
    if (local) builder.executionEngine("local");
    StringBuilder json = new StringBuilder("{\n \"engine\": \"" + (local ? "local" : "default") + "\",\n \"startup\": ");
    try (JShell shell = builder.build()) {
      json.append(Json.strings(shell.snippets().map(s -> s.id() + " " + s.source()).collect(Collectors.toList())));
      json.append(",\n \"entries\": [");
      String pending = "";
      boolean firstEntry = true;
      for (List<String> entry : entries) {
        json.append(firstEntry ? "\n" : ",\n").append("  {\"lines\": ").append(Json.strings(entry)).append(", \"evals\": [");
        firstEntry = false;
        boolean firstEval = true;
        for (String line : entry) {
          if (line.equals(Sessions.CANCEL)) { pending = ""; continue; } // Ctrl-C
          if (pending.isEmpty() && line.strip().startsWith("/") && !line.strip().startsWith("//") && !line.strip().startsWith("/*")) {
            json.append(firstEval ? "" : ",").append("\n   {\"command\": ").append(Json.string(line)).append("}");
            firstEval = false;
            continue;
          }
          pending += line + "\n";
          while (!pending.isEmpty()) {
            SourceCodeAnalysis.CompletionInfo info = shell.sourceCodeAnalysis().analyzeCompletion(pending);
            if (info.completeness() == SourceCodeAnalysis.Completeness.EMPTY) { pending = ""; break; }
            if (!info.completeness().isComplete()) break;
            user.reset();
            List<SnippetEvent> events = shell.eval(info.source());
            json.append(firstEval ? "" : ",").append("\n   {\"completeness\": ").append(Json.string(info.completeness().name()))
                .append(", \"source\": ").append(Json.string(info.source()))
                .append(", \"remaining\": ").append(Json.string(info.remaining()))
                .append(", \"events\": [");
            firstEval = false;
            for (int i = 0; i < events.size(); i++) {
              json.append(i == 0 ? "\n    " : ",\n    ").append(event(shell, events.get(i)));
            }
            json.append("], \"user\": ").append(Json.string(user.toString(StandardCharsets.UTF_8))).append("}");
            pending = info.remaining();
          }
        }
        json.append(firstEval ? "]" : "\n  ]").append(", \"pendingAfter\": ").append(Json.string(pending)).append("}");
      }
      json.append("\n ],\n \"snippetsAtEnd\": [");
      List<Snippet> all = shell.snippets().collect(Collectors.toList());
      for (int i = 0; i < all.size(); i++) {
        Snippet s = all.get(i);
        json.append(i == 0 ? "\n  " : ",\n  ").append("{\"id\": ").append(Json.string(s.id()))
            .append(", \"kind\": ").append(Json.string(s.kind().name()))
            .append(", \"status\": ").append(Json.string(shell.status(s).name()))
            .append(", \"source\": ").append(Json.string(s.source())).append("}");
      }
      json.append("\n ]\n}\n");
    }
    System.setOut(stdout);
    Files.writeString(Path.of(args[1]), json.toString());
    stdout.println("event probe (" + (local ? "local" : "default") + "): " + entries.size() + " entries");
  }

  private static String event(JShell shell, SnippetEvent e) {
    Snippet s = e.snippet();
    StringBuilder out = new StringBuilder("{");
    out.append("\"id\": ").append(Json.string(s.id()))
        .append(", \"kind\": ").append(Json.string(s.kind().name()))
        .append(", \"subKind\": ").append(Json.string(s.subKind().name()));
    if (s instanceof PersistentSnippet p) out.append(", \"name\": ").append(Json.string(p.name()));
    if (s instanceof VarSnippet v) out.append(", \"typeName\": ").append(Json.string(v.typeName()));
    if (s instanceof MethodSnippet m) out.append(", \"signature\": ").append(Json.string(m.signature()))
        .append(", \"parameterTypes\": ").append(Json.string(m.parameterTypes()));
    if (s instanceof TypeDeclSnippet) out.append(", \"typeDecl\": true");
    out.append(", \"status\": ").append(Json.string(e.status().name()))
        .append(", \"previousStatus\": ").append(Json.string(e.previousStatus().name()))
        .append(", \"signatureChange\": ").append(e.isSignatureChange())
        .append(", \"cause\": ").append(e.causeSnippet() == null ? "null" : Json.string(e.causeSnippet().id()))
        .append(", \"value\": ").append(e.value() == null ? "null" : Json.string(e.value()));
    if (e.exception() != null) out.append(", \"exception\": ").append(exception(e.exception()));
    List<Diag> diags = shell.diagnostics(s).collect(Collectors.toList());
    if (!diags.isEmpty()) {
      out.append(", \"diagnostics\": [");
      for (int i = 0; i < diags.size(); i++) {
        Diag d = diags.get(i);
        out.append(i == 0 ? "" : ", ").append("{\"error\": ").append(d.isError())
            .append(", \"code\": ").append(Json.string(d.getCode()))
            .append(", \"position\": ").append(d.getPosition())
            .append(", \"start\": ").append(d.getStartPosition())
            .append(", \"end\": ").append(d.getEndPosition())
            .append(", \"message\": ").append(Json.string(d.getMessage(Locale.US))).append("}");
      }
      out.append("]");
    }
    if (s instanceof DeclarationSnippet d) {
      List<String> unresolved = shell.unresolvedDependencies(d).collect(Collectors.toList());
      if (!unresolved.isEmpty()) out.append(", \"unresolved\": ").append(Json.strings(unresolved));
    }
    return out.append("}").toString();
  }

  private static String exception(JShellException x) {
    StringBuilder out = new StringBuilder("{\"type\": ").append(Json.string(x.getClass().getSimpleName()));
    if (x instanceof EvalException ee) out.append(", \"exceptionClassName\": ").append(Json.string(ee.getExceptionClassName()));
    if (x instanceof UnresolvedReferenceException ure) out.append(", \"snippet\": ").append(Json.string(ure.getSnippet().id()));
    out.append(", \"message\": ").append(x.getMessage() == null ? "null" : Json.string(x.getMessage()));
    List<String> frames = new ArrayList<>();
    for (StackTraceElement f : x.getStackTrace())
      frames.add(f.getClassName() + "|" + f.getMethodName() + "|" + f.getFileName() + "|" + f.getLineNumber());
    out.append(", \"frames\": ").append(Json.strings(frames));
    if (x.getCause() instanceof JShellException c) out.append(", \"cause\": ").append(exception(c));
    else if (x.getCause() != null) out.append(", \"causeOther\": ").append(Json.string(x.getCause().toString()));
    return out.append("}").toString();
  }
}
