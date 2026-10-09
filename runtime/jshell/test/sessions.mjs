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
// The session file format, as Sessions.java reads it (the check compares the two parses): entries separated by blank
// lines; "#" lines are comments, "#!" lines annotate the next entry; a line "@@blank" is fed as an empty line, and a
// line "@@cancel" is the reader pressing Ctrl-C there (kept as U+0003, which the real tool reads as Ctrl-C).
export const CANCEL = "\u0003";

/** The entries' lines, as the drivers feed them. */
export function parseSession(text) {
  return annotatedSession(text).map((e) => e.lines);
}

/**
 * Each entry with the annotations written before it: "#! name name ..." names allowed differences, and "#= <JSON
 * string>" gives the exact output the scratchpad prints in its own words there (it implies the rule "own").
 */
export function annotatedSession(text) {
  const entries = [];
  let lines = [], notes = [], own;
  const close = () => {
    if (lines.length) entries.push(own === undefined ? { lines, notes } : { lines, notes, own });
    lines = [];
    notes = [];
    own = undefined;
  };
  for (const line of text.split("\n")) {
    if (line.startsWith("#!")) { notes.push(...line.slice(2).trim().split(/\s+/).filter(Boolean)); continue; }
    if (line.startsWith("#=")) { own = JSON.parse(line.slice(2).trim()); if (!notes.includes("own")) notes.push("own"); continue; }
    if (line.startsWith("#")) continue;
    if (line === "") { if (lines.length) close(); continue; }
    lines.push(line === "@@blank" ? "" : line === "@@cancel" ? CANCEL : line);
  }
  close();
  return entries;
}
