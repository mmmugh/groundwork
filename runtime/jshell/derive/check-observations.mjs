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
// Checks that every piece of evidence an observations file quotes is really in the corpus it cites, so a
// summary written by a person or an agent cannot drift from what the tools printed.
// usage: node check-observations.mjs OBSERVATIONS.md [CORPUS_DIR]
// An evidence line looks like
//   - evidence: values-1#12 real "$13 ==> 3.0\n"
// where values-1 is a session (CORPUS_DIR/values-1/), 12 the entry index, and the quoted JSON string must be a
// substring of that entry's output in the named record:
//   real    the real tool, default engine (real.json, the entry's "out")
//   local   the real tool, --execution local (real-local.json)
//   prompt  the prompts the entry's lines answered, joined with "|" (real.json)
//   events  the default engine's events for the entry, as JSON text (events.json)
//   elocal  the local engine's events for the entry (events-local.json)
//   banner, tail   the real tool's banner or the text after the last entry (the entry index is ignored)
// A kind followed by "=" (real= "") asks for the whole record to equal the quote; a plain empty quote is refused,
// since every text contains it.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const [file, corpusArg] = process.argv.slice(2);
const corpus = corpusArg ?? path.resolve(here, "../../.work/corpus");
const cache = new Map();
const load = (session, name) => {
  const key = session + "/" + name;
  if (!cache.has(key)) cache.set(key, JSON.parse(fs.readFileSync(path.join(corpus, session, name), "utf8")));
  return cache.get(key);
};
let checked = 0, bad = 0;
const lines = fs.readFileSync(file, "utf8").split("\n");
lines.forEach((line, n) => {
  const m = line.match(/^\s*- evidence: ([\w.-]+)#(\d+) (real|local|prompt|events|elocal|banner|tail)(=?) ("(?:[^"\\]|\\.)*")\s*$/);
  if (!m) {
    if (/evidence:/.test(line)) { bad++; console.log(`${file}:${n + 1}: malformed evidence line: ${line.trim()}`); }
    return;
  }
  checked++;
  const [, session, idx, kind, exact, quoted] = m;
  let needle;
  try { needle = JSON.parse(quoted); } catch { bad++; console.log(`${file}:${n + 1}: quote is not a JSON string`); return; }
  // Every text contains "", so an empty quote proves nothing; "kind=" asks for the whole record instead.
  if (needle === "" && !exact) { bad++; console.log(`${file}:${n + 1}: an empty quote proves nothing; write ${kind}= "" for "printed nothing"`); return; }
  let hay;
  try {
    const i = Number(idx);
    if (kind === "real") hay = load(session, "real.json").entries[i].out;
    else if (kind === "local") hay = load(session, "real-local.json").entries[i].out;
    else if (kind === "prompt") hay = load(session, "real.json").entries[i].prompts.join("|");
    else if (kind === "events") hay = JSON.stringify(load(session, "events.json").entries[i].evals);
    else if (kind === "elocal") hay = JSON.stringify(load(session, "events-local.json").entries[i].evals);
    else if (kind === "banner") hay = load(session, "real.json").banner;
    else hay = load(session, "real.json").tail;
  } catch (e) { bad++; console.log(`${file}:${n + 1}: cannot read ${session}#${idx} ${kind}: ${e.message}`); return; }
  if (exact ? hay !== needle : !hay.includes(needle)) { bad++; console.log(`${file}:${n + 1}: ${exact ? "NOT EQUAL to" : "NOT FOUND in"} ${session}#${idx} ${kind}: ${quoted}`); }
});
console.log(`${file}: ${checked} evidence lines, ${bad} problems`);
process.exitCode = bad || !checked ? 1 : 0;
