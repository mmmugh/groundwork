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
import java.io.IOException;
import java.io.InputStream;
import java.io.InterruptedIOException;
import java.io.OutputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import jdk.jshell.tool.JavaShellToolBuilder;

/**
 * The reference side of the transcript check: the JDK's own jshell tool, started through its public builder
 * (jdk.jshell.tool.JavaShellToolBuilder), fed a session's lines from memory, its output split per entry.
 *
 * usage: java RealJShell.java SESSION_FILE OUT_JSON [jshell options, e.g. --execution local]
 *
 * The tool runs with its default engine unless options say otherwise, the US locale, an empty environment and
 * an in-memory settings store, so nothing on this machine leaks in or out. It gets the exact bytes our front
 * end gets, with no terminal in between (a terminal's line editor adds indentation of its own). Every channel
 * the builder offers is recorded in arrival order: the tool's own text, its console (prompts and the echo of
 * each line it reads) and the user code's two streams. The console is what splits the record into entries:
 * the text before each line's echo is the prompt that line answered, and everything other channels write
 * after that echo belongs to that line.
 */
public final class RealJShell {
  private record Chunk(String channel, int consoleOffset, byte[] bytes) {}

  private static final List<Chunk> record = new ArrayList<>();
  private static final ByteArrayOutputStream console = new ByteArrayOutputStream();

  private static PrintStream channel(String name) {
    return new PrintStream(new OutputStream() {
      @Override public void write(int b) { write(new byte[] {(byte) b}, 0, 1); }
      @Override public void write(byte[] b, int off, int len) {
        synchronized (record) {
          if (name.equals("console")) console.write(b, off, len);
          else record.add(new Chunk(name, console.size(), Arrays.copyOfRange(b, off, off + len)));
        }
      }
    }, true, StandardCharsets.UTF_8);
  }

  public static void main(String[] args) throws Exception {
    if (args.length < 2) throw new IllegalArgumentException("usage: RealJShell SESSION_FILE OUT_JSON [jshell options]");
    List<List<String>> entries = Sessions.parse(Files.readString(Path.of(args[0])));
    // Each line as typed; a Ctrl-C is the byte itself. Around a Ctrl-C the input waits for the tool's prompt, as a
    // person would: fed all at once, the tool honors only the first Ctrl-C of a session.
    List<byte[]> groups = new ArrayList<>();
    List<Boolean> paced = new ArrayList<>();
    boolean afterCancel = false;
    for (List<String> entry : entries) for (String line : entry) {
      boolean cancel = line.equals(Sessions.CANCEL);
      groups.add((cancel ? line : line + "\n").getBytes(StandardCharsets.UTF_8));
      paced.add(cancel || afterCancel);
      afterCancel = cancel;
    }
    String[] options = Arrays.copyOfRange(args, 2, args.length);

    // The local engine runs snippets in this VM, so their output goes to this VM's streams, not to userOut.
    PrintStream stdout = System.out, stderr = System.err;
    System.setOut(channel("userOut"));
    System.setErr(channel("userErr"));
    long started = System.nanoTime();
    int status = JavaShellToolBuilder.builder()
        .in(new PacedInput(groups, paced), null)
        .out(channel("tool"), channel("console"), channel("userOut"))
        .err(channel("toolErr"), channel("userErr"))
        .locale(Locale.US)
        .env(Map.of())
        .persistence(new HashMap<String, String>())
        .start(options);
    long millis = (System.nanoTime() - started) / 1_000_000;
    System.setOut(stdout);
    System.setErr(stderr);

    String text = console.toString(StandardCharsets.UTF_8);
    // Offsets in the record count console bytes; the console text is searched as a string, so map them.
    int[] charAt = byteToCharOffsets(console.toByteArray());

    List<String> lines = new ArrayList<>();
    for (List<String> entry : entries) lines.addAll(entry);
    List<String> prompts = new ArrayList<>();
    int[] echoEnd = new int[lines.size()];
    int position = 0;
    int read = 0;
    for (; read < lines.size(); read++) {
      // The console echoes a tab as spaces up to the next tab stop; the snippet itself keeps the tab.
      StringBuilder echo = new StringBuilder();
      String typed = lines.get(read).equals(Sessions.CANCEL) ? "" : lines.get(read); // Ctrl-C shows as a bare line end
      for (String part : typed.split("\t", -1)) {
        if (echo.length() > 0) echo.append(" {1,8}");
        echo.append(java.util.regex.Pattern.quote(part));
      }
      java.util.regex.Matcher m = java.util.regex.Pattern.compile(echo + "\r\n").matcher(text);
      if (!m.find(position)) break; // the tool stopped reading (for example after /exit)
      int start = m.start();
      // Every prompt ends with a space; a tab at the start of the line can make the pattern begin on it.
      if (lines.get(read).startsWith("\t") && start > position && text.charAt(start - 1) != ' ' && text.charAt(start) == ' ') start++;
      prompts.add(text.substring(position, start));
      position = m.end();
      echoEnd[read] = position;
    }
    String tail = text.substring(position);

    // Assign every non-console chunk to the line whose echo came last before it.
    StringBuilder banner = new StringBuilder();
    List<StringBuilder> outputs = new ArrayList<>();
    List<List<String>> streams = new ArrayList<>();
    for (int i = 0; i < read; i++) { outputs.add(new StringBuilder()); streams.add(new ArrayList<>()); }
    ByteArrayOutputStream pending = new ByteArrayOutputStream();
    int owner = -2;
    String ownerChannel = null;
    List<String[]> pieces = new ArrayList<>(); // [owner, channel, text]
    for (Chunk chunk : record) {
      int offset = charAt[chunk.consoleOffset()];
      int line = -1;
      for (int i = 0; i < read; i++) if (echoEnd[i] <= offset) line = i;
      if (line != owner || !chunk.channel().equals(ownerChannel)) {
        if (owner != -2) pieces.add(new String[] {String.valueOf(owner), ownerChannel, pending.toString(StandardCharsets.UTF_8)});
        pending.reset();
        owner = line;
        ownerChannel = chunk.channel();
      }
      pending.write(chunk.bytes());
    }
    if (owner != -2) pieces.add(new String[] {String.valueOf(owner), ownerChannel, pending.toString(StandardCharsets.UTF_8)});
    for (String[] piece : pieces) {
      int line = Integer.parseInt(piece[0]);
      if (line < 0) banner.append(piece[2]);
      else {
        outputs.get(line).append(piece[2]);
        streams.get(line).add(piece[1]);
      }
    }

    StringBuilder json = new StringBuilder("{\n");
    json.append(" \"side\": \"real\",\n");
    json.append(" \"options\": ").append(Json.strings(Arrays.asList(options))).append(",\n");
    json.append(" \"java\": ").append(Json.string(System.getProperty("java.runtime.version"))).append(",\n");
    json.append(" \"status\": ").append(status).append(",\n");
    json.append(" \"ms\": ").append(millis).append(",\n");
    json.append(" \"banner\": ").append(Json.string(banner.toString())).append(",\n");
    json.append(" \"entries\": [");
    int line = 0;
    for (int e = 0; e < entries.size(); e++) {
      List<String> entry = entries.get(e);
      List<String> entryPrompts = new ArrayList<>();
      StringBuilder out = new StringBuilder();
      List<String> entryStreams = new ArrayList<>();
      List<String> between = new ArrayList<>(); // output printed after a line that is not the entry's last
      for (int i = 0; i < entry.size(); i++, line++) {
        if (line >= read) break;
        entryPrompts.add(prompts.get(line));
        if (i < entry.size() - 1 && outputs.get(line).length() > 0) between.add(outputs.get(line).toString());
        out.append(outputs.get(line));
        for (String s : streams.get(line)) if (!entryStreams.contains(s)) entryStreams.add(s);
      }
      json.append(e == 0 ? "\n" : ",\n");
      json.append("  {\"lines\": ").append(Json.strings(entry))
          .append(", \"prompts\": ").append(Json.strings(entryPrompts))
          .append(", \"out\": ").append(Json.string(out.toString()))
          .append(", \"streams\": ").append(Json.strings(entryStreams));
      if (!between.isEmpty()) json.append(", \"between\": ").append(Json.strings(between));
      json.append("}");
    }
    json.append("\n ],\n");
    json.append(" \"linesRead\": ").append(read).append(",\n");
    json.append(" \"tail\": ").append(Json.string(tail)).append("\n}\n");
    Files.writeString(Path.of(args[1]), json.toString());
    System.err.printf("real jshell %s: %d entries, %d of %d lines read, status %d, %d ms%n",
        String.join(" ", options), entries.size(), read, lines.size(), status, millis);
  }

  /** The typed bytes, group by group; a paced group waits until the console shows a prompt it had not shown before. */
  private static final class PacedInput extends InputStream {
    private final List<byte[]> groups;
    private final List<Boolean> paced;
    private byte[] current = new byte[0];
    private int at, next, seen;

    PacedInput(List<byte[]> groups, List<Boolean> paced) {
      this.groups = groups;
      this.paced = paced;
    }

    @Override
    public int read() throws IOException {
      while (at >= current.length) {
        if (next >= groups.size()) return -1;
        if (paced.get(next)) waitForPrompt();
        current = groups.get(next++);
        at = 0;
        synchronized (record) { seen = console.size(); }
      }
      return current[at++] & 0xff;
    }

    private void waitForPrompt() throws IOException {
      long deadline = System.currentTimeMillis() + 10_000;
      while (System.currentTimeMillis() < deadline) {
        synchronized (record) {
          String text = console.toString(StandardCharsets.UTF_8);
          if (console.size() > seen && text.endsWith("> ")) return;
        }
        try { Thread.sleep(10); } catch (InterruptedException e) { throw new InterruptedIOException(); }
      }
      throw new IOException("no prompt within 10 s before a paced line");
    }
  }

  private static int[] byteToCharOffsets(byte[] bytes) {
    int[] map = new int[bytes.length + 1];
    int chars = 0;
    for (int i = 0; i < bytes.length; ) {
      int b = bytes[i] & 0xff;
      int width = b < 0x80 ? 1 : b < 0xe0 ? 2 : b < 0xf0 ? 3 : 4;
      for (int k = 0; k < width && i + k < bytes.length; k++) map[i + k] = chars;
      chars += width == 4 ? 2 : 1;
      i += width;
    }
    map[bytes.length] = chars;
    return map;
  }
}
