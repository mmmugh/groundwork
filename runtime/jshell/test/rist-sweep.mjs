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
// The Ristretto sweep: every session sweep.mjs ran, now through our jar on Ristretto under Node, compared entry by
// entry with our jar on the pinned JDK (sweep.mjs's cached ours.json). What differs here is what Ristretto's VM and
// image change, which is what the check's VM rules must cover. Run sweep.mjs first. Each run is ristretto.mjs, which
// reads Ristretto's files and our jar from a built site's scratchpad/ (DIR), as the check does. A session's rist.json
// is reused only when it records DIR's manifest version (which changes exactly when a byte the browser runs does);
// one from another scratchpad, or from before versions were recorded, is run again.
// usage: node rist-sweep.mjs --scratchpad DIR [PARALLEL]
// Exit 0 when Ristretto prints every entry as the pinned JDK does; 1 when an entry differs, a session ended early or
// failed to run, or there was nothing to compare (sweep.mjs has not run); 2 on misuse (DIR without manifest.json too).
import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const front = path.resolve(here, "..");
const work = path.resolve(front, "../.work");
const cache = path.join(work, "sweep");
const args = process.argv.slice(2);
// PARALLEL is a whole number of at least 1: 0 or "abc" would start no worker and report "nothing to compare".
if (args[0] !== "--scratchpad" || !args[1] || args.length > 3 || (args.length === 3 && !(/^\d+$/.test(args[2]) && Number(args[2]) >= 1))) {
  console.error("usage: node rist-sweep.mjs --scratchpad DIR [PARALLEL]"); process.exit(2);
}
const scratchpad = args[1];
let version;
try { version = JSON.parse(fs.readFileSync(path.join(scratchpad, "manifest.json"), "utf8")).version; } catch { /* below */ }
if (typeof version !== "string" || !version) { console.error(`rist-sweep.mjs: ${scratchpad}/manifest.json gives no version`); process.exit(2); }
const width = Number(args[2] ?? 8);
const sources = new Map();
for (const dir of [path.join(front, "derive/probes"), path.join(here, "sessions")]) {
  for (const f of fs.readdirSync(dir)) if (f.endsWith(".jsh")) sources.set(f.replace(/\.jsh$/, ""), path.join(dir, f));
}
const runs = (fs.existsSync(cache) ? fs.readdirSync(cache) : []).filter((d) => fs.existsSync(path.join(cache, d, "ours.json")))
  .map((d) => ({ dir: path.join(cache, d), session: sources.get(d.replace(/-[0-9a-f]{16}$/, "")) })).filter((r) => r.session);

const node = (args) => new Promise((resolve) => execFile(process.execPath, args, { timeout: 1_800_000, maxBuffer: 1 << 26 },
  (err, stdout, stderr) => resolve({ err, stderr })));
let next = 0;
const results = [];
await Promise.all(Array.from({ length: width }, async () => {
  while (next < runs.length) {
    const r = runs[next++];
    const out = path.join(r.dir, "rist.json");
    let cached = null;
    try { cached = JSON.parse(fs.readFileSync(out, "utf8")); } catch { /* none yet, or unreadable: run it */ }
    if (cached?.scratchpad !== version) {
      const { err, stderr } = await node([path.join(here, "ristretto.mjs"), r.session, out, "--scratchpad", scratchpad]);
      if (err) { results.push({ r, failed: stderr.slice(-500) }); continue; }
      const ran = JSON.parse(fs.readFileSync(out, "utf8"));
      fs.writeFileSync(out, JSON.stringify({ ...ran, scratchpad: version }, null, 1));
    }
    results.push({ r });
  }
}));
const lines = [];
let entries = 0, differ = 0, ended = 0;
for (const { r, failed } of results.sort((a, b) => a.r.dir.localeCompare(b.r.dir, "en", { numeric: true }))) {
  const name = path.basename(r.dir).replace(/-[0-9a-f]{16}$/, "");
  if (failed) { lines.push(`FAILED ${name}: ${failed}`); continue; }
  const ours = JSON.parse(fs.readFileSync(path.join(r.dir, "ours.json"), "utf8"));
  const rist = JSON.parse(fs.readFileSync(path.join(r.dir, "rist.json"), "utf8"));
  if (rist.ended) { ended++; lines.push(`ENDED ${name} after ${rist.entries.length} entries: ${JSON.stringify(rist.ended)}`); }
  if (ours.banner !== rist.banner) lines.push(`--- ${name}#banner\n  native ${JSON.stringify(ours.banner)}\n  rist   ${JSON.stringify(rist.banner)}`);
  rist.entries.forEach((e, i) => {
    entries++;
    const o = ours.entries[i];
    if (o.out === e.out && JSON.stringify(o.prompts) === JSON.stringify(e.prompts)) return;
    differ++;
    lines.push(`--- ${name}#${i} ${JSON.stringify(e.lines.join(" / ")).slice(0, 160)}\n  native ${JSON.stringify(o.out).slice(0, 900)}\n  rist   ${JSON.stringify(e.out).slice(0, 900)}`);
  });
}
fs.writeFileSync(path.join(work, "rist-sweep-report.txt"), lines.join("\n") + "\n");
const failed = results.filter((r) => r.failed).length;
console.log(`${results.length} sessions on Ristretto, ${entries} entries: ${differ} differ from native, ${ended} sessions ended early` +
  `${failed ? `, ${failed} failed to run` : ""}. Details: runtime/.work/rist-sweep-report.txt`);
if (!results.length) console.error("FAIL: nothing to compare: run sweep.mjs first (runtime/.work/sweep holds no session it ran)");
process.exitCode = !results.length || failed || ended || differ ? 1 : 0;
