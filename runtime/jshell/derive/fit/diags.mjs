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
// Derivation: fit the rule that turns a diagnostic (message, start, end, position) into the tool's error block,
// against every diagnostic in the corpus. Prints how many blocks the current hypothesis predicts exactly, and the
// first misses. usage: node diags.mjs [CORPUS_DIR]
import fs from "node:fs"; import path from "node:path";
import { fileURLToPath } from "node:url";
const corpus = process.argv[2] ?? fileURLToPath(new URL("../../../.work/corpus", import.meta.url));
const caret = (n) => n <= 1 ? "^" : n === 2 ? "^^" : "^" + "-".repeat(n - 2) + "^";
function block(src, d) {
  const head = d.error ? "|  Error:\n" : "|  Warning:\n";
  const msg = d.message.split("\n").filter((l) => !/^\s*location:/.test(l)).map((l) => "|  " + l + "\n").join("");
  const lineStart = src.lastIndexOf("\n", d.start - 1) + 1;
  let lineEnd = src.indexOf("\n", d.start); if (lineEnd < 0) lineEnd = src.length;
  const line = src.slice(lineStart, lineEnd);
  const col = d.start - lineStart;
  let mark;
  if (d.end > lineEnd) mark = " ".repeat(col) + "^" + "-".repeat(Math.max(0, lineEnd - d.start - 1)) + "...";
  else mark = " ".repeat(col) + caret(d.end - d.start);
  return head + msg + "|  " + line + "\n|  " + mark + "\n";
}
let total = 0, hit = 0; const misses = [];
for (const s of fs.readdirSync(corpus).sort()) {
  const ev = path.join(corpus, s, "events.json"), re = path.join(corpus, s, "real.json");
  if (!fs.existsSync(ev) || !fs.existsSync(re)) continue;
  const events = JSON.parse(fs.readFileSync(ev, "utf8")), real = JSON.parse(fs.readFileSync(re, "utf8"));
  events.entries.forEach((e, i) => {
    const out = real.entries[i]?.out ?? "";
    for (const v of e.evals) for (const x of v.events ?? []) for (const d of x.diagnostics ?? []) {
      if (x.cause !== null) continue;
      const first = d.message.split("\n")[0];
      if (!out.includes("|  " + first + "\n")) continue; // the real tool did not print this diagnostic (different context)
      total++;
      const b = block(v.source, d);
      if (out.includes(b)) hit++; else if (misses.length < 25) misses.push({ s, i, d, src: v.source, b, out });
    }
  });
}
console.log(`${hit} of ${total} printed diagnostics predicted exactly`);
for (const m of misses) console.log(`--- ${m.s}#${m.i} ${JSON.stringify(m.d)}\n src ${JSON.stringify(m.src)}\n predicted ${JSON.stringify(m.b)}\n real      ${JSON.stringify(m.out)}`);
