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
import com.sun.source.tree.*;
import com.sun.source.util.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;
import javax.lang.model.element.Element;
import javax.lang.model.element.ExecutableElement;
import javax.lang.model.element.TypeElement;
import javax.lang.model.element.VariableElement;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.StandardLocation;
import javax.tools.ToolProvider;

/** Runs the five rules --check enforces on every non-reference box (compiles, runs to completion, reads
 *  input iff it declares stdin, matches its stated output, is deterministic), and formats what a terminal
 *  would show for a run, for comparison against a box's stated output. */
final class Audit {
  private Audit() {}

  private static final Duration DEADLINE = Duration.ofSeconds(10);
  private static final Pattern OWN_FRAME = Pattern.compile("\tat [^()]*\\(Main\\.java:\\d+\\)");

  /** Compiles and runs every non-reference box of every page of every volume, applying the five rules;
   *  returns each problem as "<box id>: <problem>", in page order. A box's own directory under
   *  build/.work/classes/ is named after its id, with '#' turned into '_'. */
  static List<String> check(List<Volume> volumes, Map<Page, List<Box>> allBoxes) throws BuildError {
    List<String> problems = new ArrayList<>();
    for (Volume v : volumes) {
      for (Page p : v.pages()) {
        for (Box box : allBoxes.get(p)) {
          if (box.decl().reference()) continue;
          problems.addAll(checkBox(box));
        }
      }
    }
    return problems;
  }

  /** True when checkBox actually runs rule 4 (compares a box's stated output): the box states one and is
   *  neither reference, compileError nor varies. Boxes.validate already refuses a stated output fence on a
   *  reference or compileError box; this predicate names the condition directly rather than relying on that.
   *  Build.java derives its "stated outputs compared" count from this exact predicate, not a separately
   *  restated one, so the two can no longer drift the way they did for compileError boxes (an earlier fix corrected
   *  the same drift for varies boxes alone). */
  static boolean statesComparedOutput(Box box) {
    Decl d = box.decl();
    return !d.reference() && d.compileError() == null && box.expected() != null && !d.varies();
  }

  private static List<String> checkBox(Box box) throws BuildError {
    List<String> problems = new ArrayList<>();
    Path outDir = Path.of("build/.work/classes/" + box.id().replace('#', '_'));
    Decl decl = box.decl();
    Jdk.Compiled compiled = Jdk.compile(box.source(), outDir);

    if (decl.compileError() != null) {
      if (compiled.ok() || !humanErrorMessage(box.source(), outDir).contains(decl.compileError()))
        problems.add(box.id() + ": does not fail to compile the way it says");
      return problems;
    }
    if (!compiled.ok()) {
      problems.add(box.id() + ": fails to compile: " + humanErrorMessage(box.source(), outDir));
      return problems;
    }

    boolean readsInput = readsInput(box.source());
    boolean declaresStdin = !decl.stdin().isEmpty();
    if (readsInput && !declaresStdin) problems.add(box.id() + ": reads input but declares no stdin");
    if (!readsInput && declaresStdin) problems.add(box.id() + ": declares stdin but reads no input");

    String stdin = decl.stdin().isEmpty() ? "" : String.join("\n", decl.stdin()) + "\n";
    Jdk.Run run = Jdk.run(compiled.classes(), stdin, DEADLINE);

    // D73. A terminal shows stdout and stderr in the order the program wrote them; captured apart, that order
    // is unknowable, so no stated output can be checked against such a run and the page could not replay it
    // truthfully (web/page/transcript.js's statedStderr keeps nothing for it). Jdk.run calls a run "uncaught"
    // only when stderr starts with the exception line, so this one arrives as exit-1: refused here, with the
    // reason, rather than reported as "exit-1" or as a box that "does not fail the way it says".
    if (writesToStderrBeforeAnUncaughtException(run)) {
      problems.add(box.id() + ": writes to System.err before an uncaught exception; a terminal's order of stdout and"
          + " stderr is unknowable once they are captured apart, so print from a catch block instead");
      return problems;
    }

    if (decl.raises() != null) {
      if (!run.status().equals("uncaught") || !run.stderr().startsWith("Exception in thread \"main\" " + decl.raises()))
        problems.add(box.id() + ": does not fail the way it says");
    } else if (!run.status().equals("ok")) {
      String message = run.status();
      if (message.equals("timeout") || message.equals("output-limit")) message += " (earlier output: " + run.stdout() + ")";
      problems.add(box.id() + ": " + message);
    }

    if (statesComparedOutput(box)) {
      // stdoutFromTranscript throws a BuildError, with no box id, when a stdin box's stated transcript does
      // not show a typed answer. Left uncaught, that BuildError propagated straight out of Audit.check and
      // aborted the whole of --check: no box id in the message, every problem already found discarded, and
      // the vocabulary gate never ran. Caught here and reported like any other problem instead, so one
      // malformed transcript no longer silences everything else.
      try {
        String want = stdoutFromTranscript(box.expected(), decl.stdin());
        String got = tidy(stated(run)) + "\n";
        if (!want.equals(got))
          problems.add(box.id() + ": states an output the code does not print\n      expected: " + show(want) + "\n      actual:   " + show(got));
      } catch (BuildError e) {
        problems.add(box.id() + ": " + e.getMessage());
      }
    }

    if (!decl.varies()) {
      Jdk.Run second = Jdk.run(compiled.classes(), stdin, DEADLINE);
      if (!run.equals(second))
        problems.add(box.id() + ": output varies between runs: mark it varies, with why");
    }
    return problems;
  }

  /** True when the run ended on an uncaught exception but stderr held something before its "Exception in
   *  thread" line: after a newline, or straight after a System.err.print's unfinished text, where the JDK
   *  prints it on the same line. Such a run's status is exit-N, never "uncaught" (Jdk.run). */
  private static boolean writesToStderrBeforeAnUncaughtException(Jdk.Run run) {
    return run.status().startsWith("exit-") && run.stderr().indexOf("Exception in thread \"") > 0;
  }

  /** The first error a reader would actually see running `java Main.java`: javac's own command-line
   *  formatter picks short, unambiguous type names ("String"), but javax.tools's Diagnostic.getMessage
   *  reverts to fully qualified ones ("java.lang.String") the moment a DiagnosticListener is attached, so a
   *  compileError declaration written against what a reader sees needs a plain, listener-free compile to
   *  match against. */
  private static String humanErrorMessage(String source, Path outDir) throws BuildError {
    JavaCompiler javac = ToolProvider.getSystemJavaCompiler();
    var sw = new StringWriter();
    try (var fm = javac.getStandardFileManager(null, Locale.US, StandardCharsets.UTF_8)) {
      fm.setLocationFromPaths(StandardLocation.CLASS_OUTPUT, List.of(outDir));
      JavaFileObject src = new SimpleJavaFileObject(URI.create("string:///Main.java"), JavaFileObject.Kind.SOURCE) {
        @Override public CharSequence getCharContent(boolean ignore) { return source; }
      };
      javac.getTask(new PrintWriter(sw), fm, null, List.of("--release", "25", "-encoding", "UTF-8"), null, List.of(src)).call();
    } catch (IOException e) { throw new BuildError("compiling: " + e.getMessage()); }
    String out = sw.toString();
    int at = out.indexOf(": error: ");
    if (at < 0) return "";
    int start = at + ": error: ".length();
    int end = out.indexOf('\n', start);
    return end < 0 ? out.substring(start) : out.substring(start, end);
  }

  private static String show(String s) { return s.replace("\n", "\\n"); }

  /** What a terminal shows for run: stdout, then, for an uncaught exception, the first stderr line and the
   *  program's own frames ("\tat ...(Main.java:N)"), library frames left out. */
  static String stated(Jdk.Run run) {
    if (!run.status().equals("uncaught")) return run.stdout();
    StringBuilder sb = new StringBuilder(run.stdout());
    String[] lines = run.stderr().split("\n", -1);
    if (lines.length > 0) sb.append(lines[0]).append('\n');
    for (int i = 1; i < lines.length; i++)
      if (OWN_FRAME.matcher(lines[i]).matches()) sb.append(lines[i]).append('\n');
    return sb.toString();
  }

  /** Removes, in order, each typed answer's own line from a stated-output transcript, leaving what the
   *  program itself actually printed (what Jdk.run's stdout, with no pty echo, would capture). Throws if an
   *  answer's line cannot be found, in the order given. */
  static String stdoutFromTranscript(String transcript, List<String> typed) throws BuildError {
    String t = tidy(transcript) + "\n";
    int pos = 0;
    for (String answer : typed) {
      int at = t.indexOf(answer + "\n", pos);
      if (at < 0) throw new BuildError("the stated sample run does not show the typed answer \"" + answer + "\"");
      t = t.substring(0, at) + t.substring(at + answer.length() + 1);
      pos = at;
    }
    return t;
  }

  /** CRLF to LF, trailing whitespace per line removed, blank lines at either end removed. */
  static String tidy(String s) {
    var lines = new ArrayList<>(Arrays.asList(s.replace("\r\n", "\n").replace('\r', '\n').split("\n", -1)));
    lines.replaceAll(l -> l.replaceAll("[ \\t]+$", ""));
    while (!lines.isEmpty() && lines.get(0).isEmpty()) lines.remove(0);
    while (!lines.isEmpty() && lines.get(lines.size() - 1).isEmpty()) lines.remove(lines.size() - 1);
    return String.join("\n", lines);
  }

  /** True when source, parsed and analyzed by javac's own tree, resolves a method invocation to
   *  java.lang.IO.readln, or resolves any identifier or member select to the type java.util.Scanner or the
   *  field java.lang.System.in. */
  private static boolean readsInput(String source) throws BuildError {
    JavaCompiler javac = ToolProvider.getSystemJavaCompiler();
    var diags = new DiagnosticCollector<JavaFileObject>();
    try (var fm = javac.getStandardFileManager(diags, Locale.US, StandardCharsets.UTF_8)) {
      JavaFileObject src = new SimpleJavaFileObject(URI.create("string:///Main.java"), JavaFileObject.Kind.SOURCE) {
        @Override public CharSequence getCharContent(boolean ignore) { return source; }
      };
      JavacTask task = (JavacTask) javac.getTask(null, fm, diags, List.of("--release", "25"), null, List.of(src));
      Iterable<? extends CompilationUnitTree> units = task.parse();
      task.analyze();
      Trees trees = Trees.instance(task);
      boolean[] found = {false};
      var scanner = new TreePathScanner<Void, Void>() {
        @Override public Void visitMethodInvocation(MethodInvocationTree node, Void p) {
          Element el = trees.getElement(getCurrentPath());
          if (el instanceof ExecutableElement ex && ex.getSimpleName().contentEquals("readln")
              && ex.getEnclosingElement() instanceof TypeElement te && te.getQualifiedName().contentEquals("java.lang.IO"))
            found[0] = true;
          return super.visitMethodInvocation(node, p);
        }
        @Override public Void visitIdentifier(IdentifierTree node, Void p) { check(); return super.visitIdentifier(node, p); }
        @Override public Void visitMemberSelect(MemberSelectTree node, Void p) { check(); return super.visitMemberSelect(node, p); }
        private void check() {
          Element el = trees.getElement(getCurrentPath());
          if (el instanceof TypeElement te && te.getQualifiedName().contentEquals("java.util.Scanner")) found[0] = true;
          if (el instanceof VariableElement ve && ve.getSimpleName().contentEquals("in")
              && ve.getEnclosingElement() instanceof TypeElement owner && owner.getQualifiedName().contentEquals("java.lang.System"))
            found[0] = true;
        }
      };
      for (CompilationUnitTree unit : units) scanner.scan(unit, null);
      return found[0];
    } catch (IOException e) { throw new BuildError("reading a box's source: " + e.getMessage()); }
  }
}
