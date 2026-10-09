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
// The proof that the scratchpad's jshell front end prints what the JDK's jshell prints.
//
//   node runtime/jshell/test/check.mjs              every session in test/sessions/, our jar on Ristretto under Node,
//                                                   driven by the page's own client (web/page/jshell-session.js)
//   node runtime/jshell/test/check.mjs --native     the same with our jar on the pinned JDK instead (fast, a witness)
//   node runtime/jshell/test/check.mjs --browser webkit   the same client in a headless browser through the staged page
//                                                    (chromium, webkit or firefox; test/browser.mjs), no request may leave its origin
//   options: --sessions a,b   only those sessions; --keep   keep the run directory; --scratchpad DIR   a built site's
//            scratchpad/ (holding manifest.json), which holds Ristretto's five files and our jar as the build publishes
//            them (default: a fixture site that web/test/harness.mjs's buildSite builds)
//
// What it does, and how it fails (exit 2: a pin moved, a driver broke, or misuse; exit 1: an entry differs; 0: every
// entry matches):
// 1. Pins. Ristretto's five files in the scratchpad must have the SHA-256 that runtime/ristretto/CHECKSUMS gives them
//    (the scratchpad's one pin list), and the jar built from src/ by build.sh the one test/pins.json gives it: changing
//    the front end without re-pinning fails. On Ristretto, the jar the client loads must be that jar too: CHECKSUMS
//    must pin it, the scratchpad's copy must match, and manifest.json must give the client the pinned hashes.
// 2. Four runs per session, in parallel: the real jshell on the pinned JDK with the scratchpad's startup (decision J1)
//    as the reference; the real jshell with its plain default startup; the real jshell with --execution local; and our
//    front end (on Ristretto, or with --native on the pinned JDK).
// 3. Each entry is compared byte for byte: its output, and the prompt each of its lines answered; then the banner and
//    the prompt after the last entry. An entry may differ only by the allowed differences announced before it in the
//    session file ("#! name ..."), each of which must change something there ("fire"): an allowed difference that is
//    announced and does not fire fails, and so does a difference nobody announced. Where the scratchpad says something
//    in its own words (help, an unsupported command), the session gives the exact text ("#= <JSON string>").
// 4. The two session parsers (sessions.mjs here, Sessions.java in the drivers) must agree on every entry's lines.
import { execFile } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scratchpadDir } from "../../../web/test/jshell-node.mjs";
import { annotatedSession } from "./sessions.mjs";
import { javaBin } from "../../jdk-home.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const front = path.resolve(here, "..");
const root = path.resolve(front, "../..");
const work = path.join(root, "runtime/.work");
const USAGE = "usage: node runtime/jshell/test/check.mjs [--native | --browser chromium|webkit|firefox] [--sessions a,b] [--keep] " +
  "[--scratchpad DIR]\n  DIR: a built site's scratchpad/, holding manifest.json (default: a fixture site harness.buildSite builds)";
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (["--browser", "--sessions", "--scratchpad"].includes(args[i]) && i + 1 < args.length) i++;
  else if (args[i] !== "--native" && args[i] !== "--keep") { console.log(USAGE); process.exit(2); }
}
const option = (name) => { const i = args.indexOf(name); return i < 0 ? null : args[i + 1]; };
const native = args.includes("--native");
const browserName = option("--browser");
if (browserName && native) { console.error("--native and --browser exclude each other"); process.exit(2); }
if (browserName && !["chromium", "webkit", "firefox"].includes(browserName)) { console.log(USAGE); process.exit(2); }
const scratchpad = scratchpadDir(option("--scratchpad") ? ["--scratchpad", option("--scratchpad")] : [], USAGE, "jshell-check-site");
const bin = path.dirname(javaBin("java"));
const startup = ["--startup", "DEFAULT_NO_MODULE_IMPORTS", "--startup", path.join(here, "startup-time.jsh")];
// Decision J3: the scratchpad runs in en_US, so every JDK run does too, whatever this machine's locale: the drivers' JVM
// (the local engine and our jar run in it) and the real tool's agent JVM (-R).
const locale = ["-Duser.language=en", "-Duser.country=US"];
const agentLocale = locale.map((o) => "-R" + o);
const started = Date.now();

/** The allowed differences: what each one changes, and why it is allowed. */
const RULES = {
  startup: {
    why: "Decision J1: the scratchpad starts with the ten imports of the real tool's --startup DEFAULT_NO_MODULE_IMPORTS " +
      "and java.time, not import module java.base, which doubles memory per entry on Ristretto. Announced on an entry " +
      "the real tool's plain startup prints differently; the reference already uses the scratchpad's startup.",
  },
  engine: {
    why: "Ristretto can host only an in-process engine, which cannot redefine a loaded class in place. Where that loses " +
      "state (a variable holding an instance is reset, a class's static field starts over) the front end prints what " +
      "happened, the real tool's own text with --execution local, and the entry must equal that run.",
  },
  frames: {
    why: "Ristretto's JDK image is linked with --strip-debug, so a JDK frame has no file or line: the real tool's " +
      "\"(Integer.java:565)\" is \"(Unknown Source)\" there. Only JDK frames; a snippet's own \"(#5:1)\" is unchanged.",
  },
  message: {
    why: "Ristretto's VM words some exception messages itself: a helpful NullPointerException says \"s\" where the JDK " +
      "says \"REPL.$JShell$3.s\", a ClassCastException leaves out the JDK's module and loader clause, a StackOverflowError " +
      "names the method where the JDK gives no message. On the line \"|  Exception <class>\" only the message after the " +
      "class may differ, and on Ristretto it must; the class and every other byte must match.",
  },
  own: {
    why: "The scratchpad's own words, given exactly by the session (\"#=\"): its help (decision J2) and the answer to a " +
      "command it does not offer (U1, DERIVATION.md).",
  },
};

/** frames: every JDK frame location (File.java:N) becomes (Unknown Source). */
function stripFrames(text) {
  return text.replace(/^(\|        at [^\n(]*\()([\w$]+\.java):\d+\)$/gm, "$1Unknown Source)");
}

/** message: the message on the entry's first exception header line, whatever it is, becomes one placeholder. */
const HEADER = /^(\|  Exception [^:\n]+)(: .*)?$/m;
function maskMessage(text) {
  return text.replace(HEADER, "$1: <message>");
}

const read = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
function fail(code, message) { console.error("FAIL: " + message); process.exit(code); }

// 1. Pins
const pins = read(path.join(here, "pins.json"));
const checksums = new Map(fs.readFileSync(path.join(root, "runtime/ristretto/CHECKSUMS"), "utf8").split("\n").filter(Boolean)
  .map((line) => { const m = /^([0-9a-f]{64}) {2}(\S+)$/.exec(line); if (!m) fail(2, `runtime/ristretto/CHECKSUMS: not "<sha256>  <name>": ${line}`); return [m[2], m[1]]; }));
const JAR = "browser-jshell.jar", RISTRETTO = ["worker.js", "jdk.zip", "runner.core.wasm", "runner.core2.wasm", "runner.core3.wasm"];
// Our jar runs from the scratchpad only on Ristretto; --native runs the one built from src/.
if (!native && checksums.get(JAR) !== pins.jar) {
  fail(2, `pin: runtime/ristretto/CHECKSUMS pins ${JAR} as ${checksums.get(JAR)}, test/pins.json as ${pins.jar}: package a ` +
    "scratchpad release with this jar (runtime/ristretto/package.sh) and build the site again");
}
const manifest = read(path.join(scratchpad, "manifest.json")).files ?? {};
for (const name of native ? RISTRETTO : [...RISTRETTO, JAR]) {
  const want = checksums.get(name), file = path.join(scratchpad, name);
  if (!want) fail(2, `pin: runtime/ristretto/CHECKSUMS does not list ${name}`);
  if (!fs.existsSync(file)) fail(2, `pin: ${file} is missing`);
  if (sha(file) !== want) fail(2, `pin: ${name} in ${scratchpad} is ${sha(file)}, runtime/ristretto/CHECKSUMS pins ${want}`);
  if (!native && manifest[name]?.sha256 !== want) fail(2, `pin: ${scratchpad}/manifest.json gives ${name} as ${manifest[name]?.sha256}, pinned ${want}`);
}
const built = await new Promise((resolve) => execFile("sh", [path.join(front, "build.sh")], { maxBuffer: 1 << 24 },
  (err, stdout, stderr) => resolve({ err, stdout, stderr })));
if (built.err) fail(2, "build.sh failed:\n" + built.stderr);
const jar = path.join(work, "jshell/out/browser-jshell.jar");
if (sha(jar) !== pins.jar) fail(2, `pin: the jar built from src/ is ${sha(jar)}, pinned ${pins.jar} (re-pin in test/pins.json if the change is meant)`);
// The sessions are part of the proof: each file, and the J1 startup file, must be the pinned one, and none may be added
// or missing, so the proof cannot shrink or change unnoticed.
const sessionFiles = fs.readdirSync(path.join(here, "sessions")).filter((f) => f.endsWith(".jsh")).sort();
for (const f of sessionFiles) if (!pins.sessions[f]) fail(2, `pin: test/sessions/${f} is not pinned`);
for (const [f, want] of Object.entries(pins.sessions)) {
  const file = f === "startup-time.jsh" ? path.join(here, f) : path.join(here, "sessions", f);
  if (!fs.existsSync(file)) fail(2, `pin: ${f} is missing`);
  if (sha(file) !== want) fail(2, `pin: ${f} is ${sha(file)}, pinned ${want}`);
}
console.log(`pins ok: Ristretto's ${RISTRETTO.length} files (runtime/ristretto/CHECKSUMS), our jar ${pins.jar.slice(0, 16)}...` +
  `${native ? "" : " (in the scratchpad too)"}, ${Object.keys(pins.sessions).length - 1} session files and the startup file`);

// 2. Runs
const classes = path.join(work, "check-classes");
const javac = await new Promise((resolve) => execFile(path.join(bin, "javac"), ["-d", classes,
  ...["Sessions.java", "Json.java", "RealJShell.java", "OurJShell.java"].map((f) => path.join(here, f))], (err, o, e) => resolve(err ? e : null)));
if (javac) fail(2, "compiling the drivers failed:\n" + javac);
const only = option("--sessions")?.split(",");
const sessions = sessionFiles.filter((f) => !only || only.includes(f.replace(/\.jsh$/, "")));
if (!sessions.length) fail(2, "no sessions");
const run = fs.mkdtempSync(path.join(work, "check-"));
const env = { ...process.env };
delete env.JAVA_TOOL_OPTIONS;
// The drivers run inside the run directory, so a command that writes a file (the real tool's /save) writes it there.
const exec = (file, argv, label) => new Promise((resolve, reject) => execFile(file, argv,
  { env, cwd: run, timeout: 1_800_000, maxBuffer: 1 << 26 }, (err, stdout, stderr) => err ? reject(new Error(`${label}: ${err.message}\n${stderr.slice(-1500)}`)) : resolve()));
const jobs = [];
for (const s of sessions) {
  const file = path.join(here, "sessions", s), base = path.join(run, s.replace(/\.jsh$/, ""));
  const real = (out, extra, label) => ({ slow: false, go: () => exec(path.join(bin, "java"), [...locale, "-cp", classes, "RealJShell", file, out, ...agentLocale, ...extra], label) });
  jobs.push(real(base + ".real.json", startup, `${s} real`));
  jobs.push(real(base + ".plain.json", [], `${s} plain`));
  jobs.push(real(base + ".local.json", ["--execution", "local", ...startup], `${s} local`));
  jobs.push(native
    ? { slow: false, go: () => exec(path.join(bin, "java"), [...locale, "-cp", classes, "OurJShell", jar, file, base + ".ours.json"], `${s} ours (native)`) }
    : browserName
    ? { slow: true, go: () => exec(process.execPath, [path.join(here, "browser.mjs"), file, base + ".ours.json", "--browser", browserName, "--scratchpad", scratchpad], `${s} ours (${browserName})`) }
    : { slow: true, go: () => exec(process.execPath, [path.join(here, "ristretto.mjs"), file, base + ".ours.json", "--scratchpad", scratchpad], `${s} ours (Ristretto)`) });
}
// The Ristretto runs are the long ones: they start first, and the JDK runs fill the other slots.
jobs.sort((a, b) => Number(b.slow) - Number(a.slow));
const width = Math.max(2, Math.min(12, os.availableParallelism() - 4));
let next = 0;
try {
  await Promise.all(Array.from({ length: width }, async () => { while (next < jobs.length) await jobs[next++].go(); }));
} catch (e) { fail(2, e.message + `\n(run directory kept: ${run})`); }

// 3. Compare
const lines = [];
const fired = Object.fromEntries(Object.keys(RULES).map((k) => [k, 0]));
let entries = 0, identical = 0, allowed = 0, failures = 0;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
for (const s of sessions) {
  const name = s.replace(/\.jsh$/, ""), base = path.join(run, name);
  const real = read(base + ".real.json"), plain = read(base + ".plain.json"), local = read(base + ".local.json"), ours = read(base + ".ours.json");
  const spec = annotatedSession(fs.readFileSync(path.join(here, "sessions", s), "utf8"));
  const problem = (where, text) => { failures++; lines.push(`FAIL ${name}${where}: ${text}`); };
  if (spec.length !== real.entries.length || spec.some((e, i) => !same(e.lines, real.entries[i].lines))) problem("", "the session parsers disagree");
  if (ours.ended) problem("", `our session ended early: ${JSON.stringify(ours.ended)}`);
  if (ours.offOrigin?.length) problem("", `requests left the page's origin: ${ours.offOrigin.join(", ")}`);
  if (ours.problems?.length) problem("", `the page reported: ${ours.problems.join("; ")}`);
  if (ours.banner !== real.banner) problem("#banner", `ours ${JSON.stringify(ours.banner)} real ${JSON.stringify(real.banner)}`);
  spec.forEach((entry, i) => {
    entries++;
    const r = real.entries[i], o = ours.entries[i];
    if (!o) { problem(`#${i}`, "no output from our front end"); return; }
    const notes = entry.notes.filter((n) => !n.startsWith("="));
    for (const n of notes) if (!RULES[n]) problem(`#${i}`, `unknown rule "${n}"`);
    let expected = r.out, prompts = r.prompts, between = r.between ?? [];
    if (plain.entries[i].out !== r.out && !notes.includes("startup")) problem(`#${i}`, "the plain startup prints differently here, and \"startup\" is not announced");
    if (notes.includes("startup")) {
      if (plain.entries[i].out === r.out) problem(`#${i}`, "\"startup\" is announced and did not fire"); else fired.startup++;
    }
    if (notes.includes("engine")) {
      if (local.entries[i].out === r.out && same(local.entries[i].prompts, r.prompts)) problem(`#${i}`, "\"engine\" is announced and did not fire");
      else { fired.engine++; expected = local.entries[i].out; prompts = local.entries[i].prompts; between = local.entries[i].between ?? []; }
    }
    if (notes.includes("own")) {
      const own = entry.own;
      if (own === undefined) problem(`#${i}`, "\"own\" is announced without its \"#=\" text");
      else if (own === expected) problem(`#${i}`, "\"own\" is announced and did not fire");
      else { fired.own++; expected = own; between = []; }
    }
    // The VM rules describe Ristretto; with --native our jar runs on the pinned JDK, where they do not apply.
    if (notes.includes("frames")) {
      const t = stripFrames(expected);
      if (t === expected) problem(`#${i}`, "\"frames\" is announced and did not fire");
      else { fired.frames++; if (!native) { expected = t; between = between.map(stripFrames); } }
    }
    let got = o.out, gotBetween = o.between ?? [];
    if (notes.includes("message")) {
      // It fires where the reference has a header and, on Ristretto, where our output differs there and only there.
      if (!HEADER.test(expected) || (!native && (o.out === expected || maskMessage(o.out) !== maskMessage(expected)))) {
        problem(`#${i}`, "\"message\" is announced and did not fire");
      } else {
        fired.message++;
        if (!native) { expected = maskMessage(expected); got = maskMessage(o.out); between = between.map(maskMessage); gotBetween = gotBetween.map(maskMessage); }
      }
    }
    // Each line is its own request, so where output shows inside an entry is part of what the reader sees.
    if (got !== expected || !same(o.prompts, prompts) || !same(gotBetween, between)) {
      problem(`#${i}`, `${JSON.stringify(entry.lines.join(" / ")).slice(0, 120)}${notes.length ? " [" + notes.join(" ") + "]" : ""}\n  expected ${JSON.stringify(expected).slice(0, 1200)}\n  ours     ${JSON.stringify(o.out).slice(0, 1200)}${same(o.prompts, prompts) ? "" : "\n  prompts expected " + JSON.stringify(prompts) + " ours " + JSON.stringify(o.prompts)}${same(gotBetween, between) ? "" : "\n  between lines expected " + JSON.stringify(between) + " ours " + JSON.stringify(gotBetween)}`);
    } else if (o.out === r.out && same(o.prompts, r.prompts) && same(o.between ?? [], r.between ?? [])) identical++;
    else allowed++;
  });
  const tail = real.tail.replace(/\r\n$/, "");
  if (tail !== ours.tail) problem("#tail", `ours ${JSON.stringify(ours.tail)} real ${JSON.stringify(real.tail)}`);
}

const mode = native ? "our jar on the pinned JDK" : browserName ? `our jar on Ristretto in headless ${browserName}, the page's client on a staged page`
  : "our jar on Ristretto under Node, the page's client";
if (!only && entries !== pins.entries) { failures++; lines.push(`FAIL: ${entries} entries, pinned ${pins.entries}`); }
console.log(`${sessions.length} sessions, ${entries} entries (${mode}): ${identical} byte-identical to the real jshell ` +
  "(with the scratchpad's startup, J1), " +
  `${allowed} equal to it after an allowed difference, ${entries - identical - allowed} not; ` +
  `announced and fired: ${Object.entries(fired).map(([k, v]) => `${k} ${v}`).join(", ")}.`);
for (const l of lines) console.log(l);
console.log(`${failures ? "FAIL" : "ok"}: ${failures} failing, ${((Date.now() - started) / 1000).toFixed(1)} s`);
if (!args.includes("--keep") && !failures) fs.rmSync(run, { recursive: true, force: true });
else console.log("run directory: " + run);
process.exitCode = failures ? 1 : 0;
