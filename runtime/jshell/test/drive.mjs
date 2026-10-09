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
// One session file through the page's own client (web/page/jshell-session.js), line by line as a reader types it:
// ristretto.mjs runs this under Node, and the staged page (test/browser/page.mjs) in a browser, so both prove the same
// client. Plain ES module with no Node imports, so the page can load it. The result has the shape RealJShell and
// OurJShell write: per entry its lines, the prompt each line answered, its output and what showed between its lines.
import { CANCEL } from "./sessions.mjs";

/**
 * @param {string[][]} entries the session's entries, each its lines (CANCEL: the reader's Ctrl-C)
 * @param {(onOutput: (text: string) => void) => object} open makes the JShellSession, its output going to onOutput
 */
export async function drive(entries, open) {
  let text = "";
  const session = open((t) => { text += t; });
  const started = Date.now();
  let opened;
  try { opened = await session.start(); }
  catch (e) {
    // A start that failed (a download or check, the worker, the boot deadline) still says how long it took.
    const ms = Date.now() - started;
    return { banner: null, entries: [], bootMs: ms, ended: { reason: e.reason ?? null, words: e.message }, closed: false,
      tail: "", totalMs: ms };
  }
  const result = { banner: opened.banner, entries: [], bootMs: Date.now() - started };
  let prompt = opened.prompt, ended = null, closed = false;
  for (const lines of entries) {
    const entry = { lines, prompts: [], out: "" };
    const t = Date.now(), between = [];
    for (const [i, line] of lines.entries()) {
      if (ended || closed) break;
      entry.prompts.push(prompt);
      text = "";
      const answer = line === CANCEL ? await session.cancel() : await session.submit(line);
      entry.out += text;
      if (i < lines.length - 1 && text) between.push(text); // what showed before the entry's next line
      // /exit closes the session, as the real tool's; any other ending loses it, which fails the check. (System.exit
      // ends as "exited" too, but the real tool goes on after it, so the comparison catches that.)
      if (answer.status !== "ready") { if (answer.reason === "exited") closed = true; else ended = { reason: answer.reason, words: session.endedWords }; break; }
      prompt = answer.prompt;
    }
    if (between.length) entry.between = between;
    entry.ms = Date.now() - t;
    result.entries.push(entry);
    if (ended) break;
  }
  session.stop();
  result.ended = ended;
  result.closed = closed;
  result.tail = ended || closed ? "" : prompt;
  result.totalMs = Date.now() - started;
  return result;
}
