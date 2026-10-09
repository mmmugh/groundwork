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
// The clean-room audit (D14): reads Claude Code transcripts (JSONL) and lists every tool call whose input names
// something the clean room forbids or the brief's rules guard: OpenJDK source in any form, the JDK's jshell internals,
// disassembly or decompiling, a run of the jshell binary, the private leak list, writes outside the worktree's scratch
// directories, the reserved port. It reads only the calls (commands, paths, URLs, prompts), not what came back.
// usage: node audit-transcripts.mjs TRANSCRIPT.jsonl ...
// Prints each hit with its transcript, the tool, the rule and the matching text; a person then judges each one.
import fs from "node:fs";
import path from "node:path";

const RULES = [
  ["OpenJDK source archive", /\bsrc\.zip\b/i],
  ["the JDK's jshell tool internals", /jdk[./]internal[./]jshell/i],
  ["OpenJDK source tree", /teavm-javac\/javac\/build|github\.com\/openjdk|hg\.openjdk|git\.openjdk|openjdk\.org\/(?!jeps\/)/i],
  ["Corretto or other source archive", /corretto[^ ]*(src|source)|openjdk[^ ]*-src/i],
  ["disassembly or decompiling", /\bjavap\b|\bjimage\b|\bjrt:\/|decompil|\bcfr\b|procyon|fernflower|jd-gui|\blib\/modules\b/i],
  // A command word "jshell", the binary by path (bin/jshell, $VAR/jshell), or any path ending in /jshell given an
  // option or input (the review found "$J/jshell --version", which the first version of this rule missed).
  ["a run of the jshell binary", /(^|[\n;|&(]\s*|\b(exec|env|xargs|nohup|sh -c ["'])\s+|\btimeout\s+\S+\s+)jshell(\s|$)|bin\/jshell\b|\$\{?\w+\}?\/jshell\b|\/jshell\s+(-|<)/],
  ["Java's preferences store (the real tool's history and settings)", /java\.util\.prefs\.plist|Library\/Preferences\/com\.apple\.java/],
  ["the private leak list", /leak-patterns\.local/],
  ["the reserved port", /\b8731\b/],
  ["the system temp directory", /(^|[\s>"'`=])\/tmp\//],
  ["the Python course (read-only)", /python_foundations/],
];

/** Every string inside a tool call's input, flattened, so a nested field cannot hide a path. */
function strings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => strings(v, out));
  return out;
}

let calls = 0, hits = 0;
for (const file of process.argv.slice(2)) {
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue;
    let record;
    try { record = JSON.parse(line); } catch { continue; }
    const content = record?.message?.content;
    if (record?.type !== "assistant" || !Array.isArray(content)) continue;
    for (const block of content) {
      if (block?.type !== "tool_use") continue;
      calls++;
      const text = strings(block.input).join("\n");
      for (const [rule, pattern] of RULES) {
        const m = text.match(pattern);
        if (!m) continue;
        hits++;
        const at = Math.max(0, m.index - 100);
        const context = text.slice(at, m.index + m[0].length + 100).replace(/\s+/g, " ");
        console.log(`${path.basename(file)} ${record.timestamp ?? ""} ${block.name}: ${rule}\n    ...${context}...`);
      }
    }
  }
}
console.log(`${process.argv.length - 2} transcripts, ${calls} tool calls, ${hits} hits`);
