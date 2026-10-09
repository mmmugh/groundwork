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
// The native sweep: every probe session of the derivation and every check session, run through the real jshell (the
// J1 startup, twice, to find entries that differ from run to run), the real jshell with --execution local, and our
// front end on the pinned JDK. It reports every entry where ours differs from the real tool, marking the ones where
// ours equals the local engine's output. It is the inner loop for writing the front end; test/check.mjs is the proof.
// usage: node sweep.mjs [SESSION.jsh ...]      (default: derive/probes/*.jsh and test/sessions/*.jsh)
import { execFile, execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { javaBin } from "../../jdk-home.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const front = path.resolve(here, "..");
const work = path.resolve(front, "../.work");
const bin = path.dirname(javaBin("java"));
// Its own drivers, compiled here when their sources change (derive/observe.mjs keeps a classes directory of its own).
const classes = path.join(work, "sweep-classes");
const sources = ["Sessions.java", "Json.java", "RealJShell.java", "OurJShell.java"].map((f) => path.join(here, f));
const stamp = path.join(classes, ".stamp");
if (!fs.existsSync(stamp) || fs.statSync(stamp).mtimeMs < Math.max(...sources.map((f) => fs.statSync(f).mtimeMs))) {
  fs.rmSync(classes, { recursive: true, force: true });
  execFileSync(path.join(bin, "javac"), ["-d", classes, ...sources], { stdio: "inherit" });
  fs.writeFileSync(stamp, "");
}
const cache = path.join(work, "sweep");
const jar = path.join(work, "jshell/out/browser-jshell.jar");
const startup = ["--startup", "DEFAULT_NO_MODULE_IMPORTS", "--startup", path.join(here, "startup-time.jsh")];
fs.mkdirSync(cache, { recursive: true });

const env = { ...process.env };
delete env.JAVA_TOOL_OPTIONS;
const java = (args) => new Promise((resolve, reject) =>
  execFile(path.join(bin, "java"), ["-cp", classes, ...args], { env, timeout: 600_000, maxBuffer: 1 << 26 },
    (err, stdout, stderr) => err ? reject(new Error(`${args.slice(0, 3).join(" ")}: ${err.message}\n${stderr.slice(-2000)}`)) : resolve()));

const sessions = process.argv.length > 2 ? process.argv.slice(2).map((f) => path.resolve(f))
  : [...fs.readdirSync(path.join(front, "derive/probes")).filter((f) => f.endsWith(".jsh")).map((f) => path.join(front, "derive/probes", f)),
     ...fs.readdirSync(path.join(here, "sessions")).filter((f) => f.endsWith(".jsh")).map((f) => path.join(here, "sessions", f))];

const read = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
async function reference(session) {
  const text = fs.readFileSync(session);
  const key = crypto.createHash("sha256").update(text).update(startup.join(" ")).digest("hex").slice(0, 16);
  const dir = path.join(cache, path.basename(session, ".jsh") + "-" + key);
  if (!fs.existsSync(path.join(dir, "done"))) {
    fs.mkdirSync(dir, { recursive: true });
    await Promise.all([java(["RealJShell", session, path.join(dir, "real.json"), ...startup]),
      java(["RealJShell", session, path.join(dir, "real2.json"), ...startup]),
      java(["RealJShell", session, path.join(dir, "local.json"), "--execution", "local", ...startup])]);
    fs.writeFileSync(path.join(dir, "done"), "");
  }
  return dir;
}

async function one(session) {
  const dir = await reference(session);
  const ours = path.join(dir, "ours.json");
  await java(["OurJShell", jar, session, ours]);
  const real = read(path.join(dir, "real.json")), real2 = read(path.join(dir, "real2.json"));
  const local = read(path.join(dir, "local.json")), mine = read(ours);
  const rows = [];
  const same = (x, y) => x && y && x.out === y.out && JSON.stringify(x.prompts) === JSON.stringify(y.prompts);
  if (real.banner !== mine.banner) rows.push({ entry: "banner", real: real.banner, ours: mine.banner });
  real.entries.forEach((e, i) => {
    const o = mine.entries[i];
    if (same(e, o)) return;
    if (i === real.entries.length - 1 && e.out.startsWith("|  Incomplete input:")) return; // end of input: no browser session has one
    const unstable = !same(e, real2.entries[i]);
    const engine = same(local.entries[i], o);
    rows.push({ entry: i, lines: e.lines, real: e.out, ours: o?.out, prompts: same({ out: "", prompts: e.prompts }, { out: "", prompts: o?.prompts }) ? undefined : [e.prompts, o?.prompts], unstable, engine });
  });
  if (real.tail.replace(/\r\n$/, "") !== mine.tail && real.linesRead === mine.linesRead) rows.push({ entry: "tail", real: real.tail, ours: mine.tail });
  return { session: path.basename(session), entries: real.entries.length, rows };
}

const width = Math.max(2, os.availableParallelism() - 4);
const results = [];
let next = 0;
await Promise.all(Array.from({ length: width }, async () => {
  while (next < sessions.length) {
    const s = sessions[next++];
    try { results.push(await one(s)); } catch (e) { results.push({ session: path.basename(s), entries: 0, rows: [], failed: e.message }); }
  }
}));
results.sort((a, b) => a.session.localeCompare(b.session, "en", { numeric: true }));
let entries = 0, differ = 0, engine = 0, unstable = 0;
const lines = [];
for (const r of results) {
  entries += r.entries;
  if (r.failed) { lines.push(`FAILED ${r.session}: ${r.failed}`); continue; }
  for (const d of r.rows) {
    if (d.unstable) { unstable++; continue; }
    if (d.engine) engine++; else differ++;
    lines.push(`--- ${r.session}#${d.entry}${d.engine ? " (= local engine)" : ""} ${JSON.stringify((d.lines ?? []).join(" / ")).slice(0, 200)}\n  real ${JSON.stringify(d.real).slice(0, 900)}\n  ours ${JSON.stringify(d.ours).slice(0, 900)}${d.prompts ? "\n  prompts " + JSON.stringify(d.prompts) : ""}`);
  }
}
fs.writeFileSync(path.join(work, "sweep-report.txt"), lines.join("\n") + "\n");
console.log(`${results.length} sessions, ${entries} entries: ${differ} differ, ${engine} equal the local engine's output, ${unstable} unstable in the real tool; ${results.filter((r) => r.failed).length} sessions failed. Details: runtime/.work/sweep-report.txt`);
