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
// A derivation tool: runs one probe session through four observers on the pinned JDK and writes a readable
// report beside their raw JSON.
//   1. the real jshell tool, default engine (test/RealJShell.java): the reference
//   2. the real jshell tool, --execution local: the engine our front end has on Ristretto
//   3. the public jdk.jshell API, default engine (EventProbe.java): what the library reports
//   4. the public jdk.jshell API, local engine
// usage: node observe.mjs SESSION.jsh OUT_DIR
// The report lists, per entry, the lines fed, the prompt each line answered (when not the normal one), the
// real tool's output verbatim, the local engine's output where it differs, and the events of both engines.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { javaBin } from "../../jdk-home.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const work = path.resolve(here, "../../.work");
const [session, outDir] = process.argv.slice(2);
if (!session || !outDir) { console.error("usage: node observe.mjs SESSION.jsh OUT_DIR"); process.exit(2); }
fs.mkdirSync(outDir, { recursive: true });

const classes = path.join(work, "classes");
const sources = [path.join(here, "../test/Sessions.java"), path.join(here, "../test/Json.java"),
  path.join(here, "../test/RealJShell.java"), path.join(here, "EventProbe.java")];
const newest = Math.max(...sources.map((f) => fs.statSync(f).mtimeMs));
const stamp = path.join(classes, ".stamp");
if (!fs.existsSync(stamp) || fs.statSync(stamp).mtimeMs < newest) {
  fs.rmSync(classes, { recursive: true, force: true });
  execFileSync(javaBin("javac"), ["-d", classes, ...sources], { stdio: "inherit" });
  fs.writeFileSync(stamp, "");
}
const env = { ...process.env };
delete env.JAVA_TOOL_OPTIONS;
const java = (args) => execFileSync(javaBin("java"), ["-cp", classes, ...args], { env, stdio: ["ignore", "pipe", "inherit"], timeout: 600_000 });
const out = (name) => path.join(outDir, name);
java(["RealJShell", session, out("real.json")]);
java(["RealJShell", session, out("real-local.json"), "--execution", "local"]);
java(["EventProbe", session, out("events.json")]);
java(["EventProbe", session, out("events-local.json"), "local"]);

const read = (n) => JSON.parse(fs.readFileSync(out(n), "utf8"));
const real = read("real.json"), local = read("real-local.json"), ev = read("events.json"), evl = read("events-local.json");
const show = (s) => JSON.stringify(s);
const summarize = (e) => [e.id, e.kind, e.name ?? "", e.signature ?? e.typeName ?? "", `${e.status}<-${e.previousStatus}`,
  `sig=${e.signatureChange}`, `cause=${e.cause ?? "-"}`, e.value === null ? "" : `value=${show(e.value)}`,
  e.exception ? `exception=${show(e.exception)}` : "", e.diagnostics ? `diags=${show(e.diagnostics)}` : "",
  e.unresolved ? `unresolved=${show(e.unresolved)}` : ""].filter(Boolean).join(" ");
const evalLines = (evals) => evals.map((v) => v.command !== undefined ? `      command ${show(v.command)}`
  : [`      eval ${show(v.source)}${v.remaining ? " remaining=" + show(v.remaining) : ""}${v.user ? " user=" + show(v.user) : ""}`,
    ...v.events.map((e) => "        " + summarize(e))].join("\n")).join("\n");

const report = [`session ${session}`, `real banner ${show(real.banner)}`, `real tail ${show(real.tail)} status ${real.status}`,
  `local tail ${show(local.tail)}`, ""];
real.entries.forEach((e, i) => {
  const l = local.entries[i];
  report.push(`[${i}] ${e.lines.map(show).join(" / ")}`);
  if (e.prompts.some((p, k) => p !== (k === 0 ? "\njshell> " : "   ...> "))) report.push(`    prompts ${show(e.prompts)}`);
  report.push(`    real  ${show(e.out)}${e.streams.length > 1 || (e.streams[0] && e.streams[0] !== "tool") ? "  streams " + show(e.streams) : ""}`);
  if (e.between) report.push(`    real output between lines ${show(e.between)}`);
  if (!l) report.push("    local: no entry (the local run stopped reading)");
  else if (l.out !== e.out || show(l.prompts) !== show(e.prompts)) report.push(`    LOCAL ${show(l.out)}${show(l.prompts) !== show(e.prompts) ? " prompts " + show(l.prompts) : ""}`);
  const d = ev.entries[i]?.evals ?? [], dl = evl.entries[i]?.evals ?? [];
  report.push("    events (default engine)");
  report.push(evalLines(d));
  if (show(d) !== show(dl)) { report.push("    EVENTS (local engine) differ"); report.push(evalLines(dl)); }
});
fs.writeFileSync(out("report.txt"), report.join("\n") + "\n");
console.log(`observe: ${real.entries.length} entries -> ${out("report.txt")}`);
