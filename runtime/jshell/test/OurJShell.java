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
import java.io.OutputStream;
import java.io.PrintStream;
import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Our front end on the pinned JDK, driven the way Ristretto's worker drives it, so the check has a fast inner loop and
 * a second witness beside the Ristretto run.
 *
 * usage: java OurJShell.java JAR SESSION_FILE OUT_JSON
 *
 * Ristretto keeps one VM per session and calls the static methods of class BrowserJShell in it; a fresh class loader
 * plays that VM here, so a restart really starts from nothing. As in Ristretto's lib.rs: the first call is
 * input("") (the page opens the session), every line is one input(line) call, an answer with "reload" drops the VM,
 * makes a new one, calls beginReload(feedback) and replays its entries through input or dropSource, and an answer with
 * "closed" or "reset" true drops the VM so the next call makes a new one. Output is what the class writes to System.out
 * and System.err during each call. The JSON written has the shape RealJShell writes, plus each answer's raw JSON.
 */
public final class OurJShell {
  private static final ByteArrayOutputStream captured = new ByteArrayOutputStream();
  private static final List<String> streams = new ArrayList<>();
  private static String lastStream;

  private static PrintStream channel(String name) {
    return new PrintStream(new OutputStream() {
      @Override public void write(int b) { write(new byte[] {(byte) b}, 0, 1); }
      @Override public void write(byte[] b, int off, int len) {
        synchronized (captured) {
          captured.write(b, off, len);
          if (len > 0 && !name.equals(lastStream)) {
            if (!streams.contains(name)) streams.add(name);
            lastStream = name;
          }
        }
      }
    }, true, StandardCharsets.UTF_8);
  }

  private static Path jar;
  private static Class<?> shell;

  private static String call(String method, String... args) throws Exception {
    if (shell == null) {
      URLClassLoader loader = new URLClassLoader(new URL[] {jar.toUri().toURL()}, ClassLoader.getPlatformClassLoader());
      shell = Class.forName("BrowserJShell", true, loader);
    }
    Class<?>[] types = new Class<?>[args.length];
    java.util.Arrays.fill(types, String.class);
    Method m = shell.getMethod(method, types);
    return (String) m.invoke(null, (Object[]) args);
  }

  /** One request as Ristretto's lib.rs handles it: the call, then any reload, then the VM's fate. */
  private static String request(String source) throws Exception {
    if (source.equals(Sessions.CANCEL)) return call("cancel");
    String answer = call("input", source);
    String reload = field(answer, "reload");
    if (reload != null) {
      shell = null;
      answer = call("beginReload", stringField(reload, "feedback"));
      Matcher entry = Pattern.compile("\\{\"source\":(\"(?:[^\"\\\\]|\\\\.)*\"),\"drop\":(true|false)\\}").matcher(field(reload, "entries"));
      while (entry.find()) answer = call(entry.group(2).equals("true") ? "dropSource" : "input", unquote(entry.group(1)));
    }
    if (answer.contains("\"closed\":true") || answer.contains("\"reset\":true")) shell = null;
    return answer;
  }

  public static void main(String[] args) throws Exception {
    jar = Path.of(args[0]).toAbsolutePath();
    List<List<String>> entries = Sessions.parse(Files.readString(Path.of(args[1])));
    PrintStream stdout = System.out, stderr = System.err;
    System.setOut(channel("stdout"));
    System.setErr(channel("stderr"));
    long started = System.nanoTime();
    StringBuilder json = new StringBuilder("{\n \"side\": \"ours\",\n \"jar\": ").append(Json.string(jar.getFileName().toString())).append(",\n");
    String answer = request("");
    String banner = take();
    json.append(" \"banner\": ").append(Json.string(banner)).append(",\n \"entries\": [");
    String prompt = stringField(answer, "prompt");
    boolean closed = answer.contains("\"closed\":true");
    int read = 0;
    for (int e = 0; e < entries.size(); e++) {
      List<String> entry = entries.get(e);
      List<String> prompts = new ArrayList<>(), answers = new ArrayList<>(), between = new ArrayList<>();
      StringBuilder out = new StringBuilder();
      List<String> entryStreams = new ArrayList<>();
      for (int i = 0; i < entry.size() && !closed; i++, read++) {
        prompts.add(prompt);
        answer = request(entry.get(i));
        String text = take();
        for (String s : streams) if (!entryStreams.contains(s)) entryStreams.add(s);
        streams.clear();
        if (i < entry.size() - 1 && !text.isEmpty()) between.add(text);
        out.append(text);
        answers.add(answer);
        prompt = stringField(answer, "prompt");
        closed = answer.contains("\"closed\":true");
      }
      json.append(e == 0 ? "\n" : ",\n").append("  {\"lines\": ").append(Json.strings(entry))
          .append(", \"prompts\": ").append(Json.strings(prompts))
          .append(", \"out\": ").append(Json.string(out.toString()))
          .append(", \"streams\": ").append(Json.strings(entryStreams))
          .append(", \"answers\": ").append(Json.strings(answers));
      if (!between.isEmpty()) json.append(", \"between\": ").append(Json.strings(between));
      json.append("}");
    }
    long millis = (System.nanoTime() - started) / 1_000_000;
    System.setOut(stdout);
    System.setErr(stderr);
    json.append("\n ],\n \"linesRead\": ").append(read).append(",\n \"closed\": ").append(closed)
        .append(",\n \"tail\": ").append(Json.string(closed ? "" : prompt == null ? "" : prompt))
        .append(",\n \"ms\": ").append(millis).append("\n}\n");
    Files.writeString(Path.of(args[2]), json.toString());
    stderr.printf("ours (native): %d entries, %d lines read, %d ms%n", entries.size(), read, millis);
  }

  private static String take() {
    synchronized (captured) {
      String text = captured.toString(StandardCharsets.UTF_8);
      captured.reset();
      lastStream = null;
      return text;
    }
  }

  // Just enough JSON reading for the answers our own class writes: string fields and one nested object.
  private static String field(String json, String name) {
    int at = json.indexOf("\"" + name + "\":");
    if (at < 0) return null;
    int start = at + name.length() + 3, depth = 0;
    boolean inString = false;
    for (int i = start; i < json.length(); i++) {
      char c = json.charAt(i);
      if (inString) { if (c == '\\') i++; else if (c == '"') inString = false; continue; }
      if (c == '"') inString = true;
      else if (c == '{' || c == '[') depth++;
      else if (c == '}' || c == ']') { if (depth == 0) return json.substring(start, i); depth--; }
      else if (c == ',' && depth == 0) return json.substring(start, i);
    }
    return json.substring(start);
  }

  private static String stringField(String json, String name) {
    String raw = field(json, name);
    return raw == null || raw.equals("null") ? null : unquote(raw);
  }

  private static String unquote(String quoted) {
    StringBuilder out = new StringBuilder();
    for (int i = 1; i < quoted.length() - 1; i++) {
      char c = quoted.charAt(i);
      if (c != '\\') { out.append(c); continue; }
      char n = quoted.charAt(++i);
      switch (n) {
        case 'n' -> out.append('\n');
        case 'r' -> out.append('\r');
        case 't' -> out.append('\t');
        case 'b' -> out.append('\b');
        case 'f' -> out.append('\f');
        case 'u' -> { out.append((char) Integer.parseInt(quoted.substring(i + 1, i + 5), 16)); i += 4; }
        default -> out.append(n);
      }
    }
    return out.toString();
  }

}
