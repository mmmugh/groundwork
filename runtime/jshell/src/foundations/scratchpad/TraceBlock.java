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

import java.util.function.UnaryOperator;
import jdk.jshell.EvalException;

/**
 * An uncaught exception as the reader sees it (DERIVATION.md, X1 to X4): the header, one line per frame, and a
 * "Caused by:" block per cause.
 */
final class TraceBlock {
  private TraceBlock() {}

  /** X4: a trace shows at most this many frames, the depth the reference JVM records. */
  private static final int MOST_FRAMES = 1024;

  /** @param snippetFile turns a frame's file name ("#" + the library's snippet id) into what the reader sees */
  static String of(EvalException x, UnaryOperator<String> snippetFile) {
    StringBuilder out = new StringBuilder();
    out.append("|  Exception ").append(header(x)).append('\n');
    StackTraceElement[] frames = x.getStackTrace();
    frames(out, frames, frames.length, snippetFile);
    Throwable enclosing = x;
    for (Throwable cause = x.getCause(); cause != null; enclosing = cause, cause = cause.getCause()) {
      out.append("|  Caused by: ").append(header(cause)).append('\n');
      StackTraceElement[] own = cause.getStackTrace(), outer = enclosing.getStackTrace();
      int shared = 0;
      while (shared < own.length && shared < outer.length
          && own[own.length - 1 - shared].equals(outer[outer.length - 1 - shared])) shared++;
      frames(out, own, own.length - shared, snippetFile);
      if (shared > 0) out.append("|        ...\n"); // X3
    }
    return out.toString();
  }

  private static String header(Throwable t) {
    String name = t instanceof EvalException e ? e.getExceptionClassName() : t.getClass().getName();
    String message = t.getMessage();
    return message == null ? name : name + ": " + message; // X1
  }

  private static void frames(StringBuilder out, StackTraceElement[] frames, int count, UnaryOperator<String> snippetFile) {
    int shown = 0;
    for (int i = 0; i < count && shown < MOST_FRAMES; i++) {
      if (hidden(frames[i])) continue;
      out.append("|        at ").append(frame(frames[i], snippetFile)).append('\n');
      shown++;
    }
  }

  /**
   * X5: the class a lambda expression is turned into is a hidden class, whose frames the reference JVM leaves out of
   * every stack trace; Ristretto's VM keeps them, named "$Lambda+0x" and a number.
   */
  static boolean hidden(StackTraceElement f) {
    String cls = f.getClassName() == null ? "" : f.getClassName();
    return HIDDEN_LAMBDA.matcher(cls.substring(cls.lastIndexOf('.') + 1)).find();
  }

  private static final java.util.regex.Pattern HIDDEN_LAMBDA = java.util.regex.Pattern.compile("\\$Lambda[+/]0x[0-9a-fA-F]+$");

  /** X2: "Class.method (File.java:line)" with the class's simple name; a snippet's own frame is just "(#id:line)". */
  static String frame(StackTraceElement f, UnaryOperator<String> snippetFile) {
    String cls = f.getClassName() == null ? "" : f.getClassName();
    String method = f.getMethodName() == null ? "" : f.getMethodName();
    String name = cls.isEmpty() ? method : cls.substring(cls.lastIndexOf('.') + 1) + "." + method;
    String file = f.getFileName();
    String where;
    if (f.getLineNumber() == -2) where = "Native Method";
    else if (file == null) where = "Unknown Source";
    else {
      if (file.startsWith("#")) file = snippetFile.apply(file);
      where = f.getLineNumber() >= 0 ? file + ":" + f.getLineNumber() : file;
    }
    return (name.isEmpty() ? "" : name + " ") + "(" + where + ")";
  }
}
