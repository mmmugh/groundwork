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
import java.util.*;

/** Minimal JSON for the build's own files. Objects keep key order; numbers are Long when integral, else Double. */
final class Json {
  private Json() {}
  static Object parse(String text) throws BuildError {
    var p = new Parser(text);
    p.ws();
    Object v = p.value();
    p.ws();
    if (p.i != text.length()) throw p.error("unexpected text after the value");
    return v;
  }
  private static final class Parser {
    final String s; int i;
    Parser(String s) { this.s = s; }
    BuildError error(String what) {
      int line = 1, col = 1;
      for (int k = 0; k < Math.min(i, s.length()); k++) { if (s.charAt(k) == '\n') { line++; col = 1; } else col++; }
      return new BuildError("JSON: " + what + " at line " + line + ", column " + col);
    }
    void ws() { while (i < s.length() && " \t\r\n".indexOf(s.charAt(i)) >= 0) i++; }
    boolean peek(char c) { return i < s.length() && s.charAt(i) == c; }
    void expect(char c) throws BuildError { if (!peek(c)) throw error("'" + c + "' expected"); i++; }
    Object value() throws BuildError {
      if (i >= s.length()) throw error("value expected");
      char c = s.charAt(i);
      if (c == '{') return object();
      if (c == '[') return array();
      if (c == '"') return string();
      if (s.startsWith("true", i)) { i += 4; return Boolean.TRUE; }
      if (s.startsWith("false", i)) { i += 5; return Boolean.FALSE; }
      if (s.startsWith("null", i)) { i += 4; return null; }
      if (c == '-' || (c >= '0' && c <= '9')) return number();
      throw error("value expected");
    }
    Map<String, Object> object() throws BuildError {
      var m = new LinkedHashMap<String, Object>();
      i++; ws();
      if (peek('}')) { i++; return m; }
      while (true) {
        ws();
        if (!peek('"')) throw error("key expected");
        String k = string();
        if (m.containsKey(k)) throw error("duplicate key \"" + k + "\"");
        ws(); expect(':'); ws();
        m.put(k, value());
        ws();
        if (peek(',')) { i++; continue; }
        expect('}');
        return m;
      }
    }
    List<Object> array() throws BuildError {
      var a = new ArrayList<Object>();
      i++; ws();
      if (peek(']')) { i++; return a; }
      while (true) {
        ws(); a.add(value()); ws();
        if (peek(',')) { i++; continue; }
        expect(']');
        return a;
      }
    }
    String string() throws BuildError {
      i++;
      var b = new StringBuilder();
      while (true) {
        if (i >= s.length()) throw error("unterminated string");
        char c = s.charAt(i++);
        if (c == '"') return b.toString();
        if (c < 0x20) throw error("control character in a string");
        if (c != '\\') { b.append(c); continue; }
        if (i >= s.length()) throw error("unterminated string");
        char e = s.charAt(i++);
        switch (e) {
          case '"' -> b.append('"');
          case '\\' -> b.append('\\');
          case '/' -> b.append('/');
          case 'b' -> b.append('\b');
          case 'f' -> b.append('\f');
          case 'n' -> b.append('\n');
          case 'r' -> b.append('\r');
          case 't' -> b.append('\t');
          case 'u' -> {
            if (i + 4 > s.length()) throw error("short \\u escape");
            try { b.append((char) Integer.parseInt(s.substring(i, i + 4), 16)); }
            catch (NumberFormatException x) { throw error("bad \\u escape"); }
            i += 4;
          }
          default -> throw error("bad escape \\" + e);
        }
      }
    }
    Object number() throws BuildError {
      int start = i;
      while (i < s.length() && "-+0123456789.eE".indexOf(s.charAt(i)) >= 0) i++;
      String t = s.substring(start, i);
      if (t.matches("-?(0|[1-9]\\d*)")) {
        try { return Long.parseLong(t); } catch (NumberFormatException x) { /* too big: a double */ }
      }
      if (t.matches("-?(0|[1-9]\\d*)(\\.\\d+)?([eE][+-]?\\d+)?")) return Double.parseDouble(t);
      i = start;
      throw error("bad number " + t);
    }
  }

  static String write(Object v) { var b = new StringBuilder(); write(v, b, 0, true); return b.append('\n').toString(); }
  /** v on one line, with no whitespace between tokens and no trailing newline: for an HTML attribute. */
  static String compact(Object v) { var b = new StringBuilder(); write(v, b, 0, false); return b.toString(); }
  private static void write(Object v, StringBuilder b, int depth, boolean indent) {
    String pad = indent ? "\n" + " ".repeat(depth + 1) : "", end = indent ? "\n" + " ".repeat(depth) : "";
    switch (v) {
      case null -> b.append("null");
      case Map<?, ?> m -> {
        if (m.isEmpty()) { b.append("{}"); return; }
        b.append('{');
        boolean first = true;
        for (var e : m.entrySet()) {
          if (!first) b.append(',');
          first = false;
          b.append(pad);
          str(String.valueOf(e.getKey()), b);
          b.append(indent ? ": " : ":");
          write(e.getValue(), b, depth + 1, indent);
        }
        b.append(end).append('}');
      }
      case List<?> l -> {
        if (l.isEmpty()) { b.append("[]"); return; }
        b.append('[');
        for (int k = 0; k < l.size(); k++) { if (k > 0) b.append(','); b.append(pad); write(l.get(k), b, depth + 1, indent); }
        b.append(end).append(']');
      }
      case String s -> str(s, b);
      case Boolean x -> b.append(x);
      case Long x -> b.append(x);
      case Integer x -> b.append(x);
      case Double x -> {
        if (x.isNaN() || x.isInfinite()) throw new IllegalArgumentException("JSON has no " + x);
        b.append(x);
      }
      default -> throw new IllegalArgumentException("cannot write a " + v.getClass().getName() + " as JSON");
    }
  }
  private static void str(String s, StringBuilder b) {
    b.append('"');
    for (char c : s.toCharArray()) {
      switch (c) {
        case '"' -> b.append("\\\"");
        case '\\' -> b.append("\\\\");
        case '\n' -> b.append("\\n");
        case '\r' -> b.append("\\r");
        case '\t' -> b.append("\\t");
        default -> { if (c < 0x20) b.append(String.format("\\u%04x", (int) c)); else b.append(c); }
      }
    }
    b.append('"');
  }
}
