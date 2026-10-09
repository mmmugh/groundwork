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
// Proves each gate of test/check.mjs by breaking one thing on purpose and checking that the proof fails with the
// expected exit code and message. Every break runs on a copy under runtime/.work/breaks/<name>/ of runtime/jshell, web/
// (the page's client, which the check drives) and runtime/ristretto/CHECKSUMS, with a .work of its own (its jar, run
// directories and classes), linking only the JDK, which it reads; the working tree is never edited. Every break reads
// one built site's scratchpad/ (--scratchpad, or a fixture site this script builds), and a break that changes the
// scratchpad's bytes works on a real copy of it, never through a link. After every break the originals are checked
// again (the scratchpad's six files and the working tree's jar against their pins; the scratchpad's manifest.json and
// the tracked files a break copies against what they were before the first break), and the run stops loudly (exit 2)
// if one moved.
// usage: node breaks.mjs [--only name,name] [--skip-slow] [--scratchpad DIR]
// An unknown option, an --only name no break has, or a selection that leaves no break to run (every --only name a
// slow break, with --skip-slow) is refused (exit 2) before anything is built.
// The slow breaks run Ristretto (a minute or two) or a browser.
import { execFile, execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scratchpadDir } from "../../../web/test/jshell-node.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const front = path.resolve(here, "..");
const repo = path.resolve(front, "../..");
const work = path.resolve(front, "../.work");
const USAGE = "usage: node runtime/jshell/test/breaks.mjs [--only name,name] [--skip-slow] [--scratchpad DIR]";
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (["--only", "--scratchpad"].includes(args[i]) && i + 1 < args.length) i++;
  else if (args[i] !== "--skip-slow") { console.log(USAGE); process.exit(2); }
}
const option = (name) => { const i = args.indexOf(name); return i < 0 ? null : args[i + 1]; };
const only = option("--only")?.split(",") ?? null;
const skipSlow = args.includes("--skip-slow");

/** A fresh copy of the code under test, laid out as the repository is, with a .work of its own (the JDK linked). */
function copy(name) {
  const root = path.join(work, "breaks", name);
  fs.rmSync(root, { recursive: true, force: true });
  fs.mkdirSync(path.join(root, "runtime/.work"), { recursive: true });
  fs.mkdirSync(path.join(root, "runtime/ristretto"));
  fs.cpSync(front, path.join(root, "runtime/jshell"), { recursive: true, dereference: true });
  fs.cpSync(path.join(repo, "web"), path.join(root, "web"), { recursive: true, dereference: true });
  fs.copyFileSync(path.join(repo, "runtime/ristretto/CHECKSUMS"), path.join(root, "runtime/ristretto/CHECKSUMS"));
  // check.mjs and web/test/harness.mjs take their JDK from here (the linked jdk25 below is what it resolves to).
  fs.copyFileSync(path.join(repo, "runtime/jdk-home.mjs"), path.join(root, "runtime/jdk-home.mjs"));
  fs.symlinkSync(path.join(work, "jdk25"), path.join(root, "runtime/.work/jdk25"));
  return path.join(root, "runtime/jshell");
}
/** A real copy of the scratchpad beside the code copy (dereferenced: a change to it must never reach the original). */
function scratchpadCopy(dir) {
  const copied = path.join(path.dirname(path.dirname(dir)), "scratchpad");
  fs.cpSync(site, copied, { recursive: true, dereference: true });
  return copied;
}
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const pins = JSON.parse(fs.readFileSync(path.join(here, "pins.json"), "utf8"));
const checksums = new Map(fs.readFileSync(path.join(repo, "runtime/ristretto/CHECKSUMS"), "utf8").split("\n").filter(Boolean)
  .map((line) => line.split("  ").reverse()));
const realJar = path.join(work, "jshell/out/browser-jshell.jar");
const SIX = ["worker.js", "jdk.zip", "runner.core.wasm", "runner.core2.wasm", "runner.core3.wasm", "browser-jshell.jar"];
// What the tracked files a break copies differ by from the index. It is compared with what it was before the first
// break, not required empty, so the proof also runs on a working tree with edits of its own.
const trackedDiff = () => execFileSync("git", ["diff", "--binary", "--", "runtime/jshell", "web", "runtime/ristretto/CHECKSUMS"],
  { cwd: repo, encoding: "utf8", maxBuffer: 1 << 28 });
let unbroken = null; // the scratchpad's manifest.json hash and trackedDiff(), taken before the first break
/**
 * The originals that a break must never touch: the scratchpad's six files and the working tree's jar (against their
 * pins), and the scratchpad's manifest.json and the tracked files a break copies (against what they were).
 */
function originalsIntact() {
  for (const name of SIX) {
    const got = sha(path.join(site, name));
    if (got !== checksums.get(name)) return `the scratchpad's ${name} is ${got}, pinned ${checksums.get(name)}`;
  }
  if (sha(realJar) !== pins.jar) return `the working tree's jar is ${sha(realJar)}, pinned ${pins.jar}`;
  const manifest = sha(path.join(site, "manifest.json"));
  if (manifest !== unbroken.manifest) return `the scratchpad's manifest.json is ${manifest}, was ${unbroken.manifest}`;
  if (trackedDiff() !== unbroken.diff) return "a tracked file under runtime/jshell, web or runtime/ristretto/CHECKSUMS changed (git diff)";
  return null;
}
const edit = (file, from, to) => {
  const text = fs.readFileSync(file, "utf8");
  if (!text.includes(from)) throw new Error(`${file}: "${from}" not found`);
  if (text.indexOf(from) !== text.lastIndexOf(from)) throw new Error(`${file}: "${from}" is not unique`);
  fs.writeFileSync(file, text.replace(from, to));
};
/** Re-pins the copy (its jar, sessions and entry count), so a change gets past the pins to the comparison. */
function repin(dir) {
  execFileSync(process.execPath, [path.join(dir, "test/pin.mjs")], { stdio: "ignore" });
}
/**
 * What a release and a site build do with a re-pinned jar, for a break that runs it on Ristretto: a scratchpad copy
 * holding the copy's jar, its manifest.json entry and the copy's runtime/ristretto/CHECKSUMS line rewritten to match.
 */
function restage(dir) {
  const staged = scratchpadCopy(dir), jar = path.resolve(dir, "../.work/jshell/out/browser-jshell.jar");
  fs.copyFileSync(jar, path.join(staged, "browser-jshell.jar"));
  const manifest = JSON.parse(fs.readFileSync(path.join(staged, "manifest.json"), "utf8"));
  manifest.files["browser-jshell.jar"] = { sha256: sha(jar), size: fs.statSync(jar).size };
  fs.writeFileSync(path.join(staged, "manifest.json"), JSON.stringify(manifest));
  const sums = path.resolve(dir, "../ristretto/CHECKSUMS");
  fs.writeFileSync(sums, fs.readFileSync(sums, "utf8").replace(/^[0-9a-f]{64}(  browser-jshell\.jar)$/m, `${sha(jar)}$1`));
  return ["--scratchpad", staged];
}
// Another port of 127.0.0.1 is another origin. The off-origin break aims its request here, and it counts only if the
// request never arrives: the check must record it and abort it, never send it.
const canary = { hits: 0 };
const canaryServer = http.createServer((req, res) => { canary.hits++; res.end(); });
await new Promise((resolve) => canaryServer.listen(0, "127.0.0.1", resolve));
canary.url = `http://127.0.0.1:${canaryServer.address().port}/off-origin`;

const BREAKS = [
  { name: "zip-byte", why: "one byte of the scratchpad's jdk.zip changed", expect: 2, message: "pin: jdk.zip in",
    setup(dir) {
      const copied = scratchpadCopy(dir);
      const zip = path.join(copied, "jdk.zip");
      const b = fs.readFileSync(zip); b[1000] ^= 1; fs.writeFileSync(zip, b);
      return ["--native", "--sessions", "startup", "--scratchpad", copied];
    } },
  { name: "jar-change", why: "the front end's source changed without re-pinning the jar", expect: 2, message: "pin: the jar built from src/",
    setup(dir) {
      edit(path.join(dir, "src/foundations/scratchpad/Commands.java"), "|  Resetting state.\\n", "|  Resetting state!\\n");
      return ["--native", "--sessions", "startup"];
    } },
  { name: "session-unpinned", why: "one character of a session file changed without re-pinning", expect: 2, message: "pin: commands.jsh is",
    setup(dir) {
      edit(path.join(dir, "test/sessions/commands.jsh"), "\nint x = 5\n", "\nint x = 6\n");
      return ["--native", "--sessions", "startup"];
    } },
  { name: "session-removed", why: "a session file deleted and the rest re-pinned, so only the entry count can see it", expect: 1, message: "entries, pinned",
    setup(dir) {
      const pins = JSON.parse(fs.readFileSync(path.join(dir, "test/pins.json"), "utf8"));
      fs.rmSync(path.join(dir, "test/sessions/input.jsh"));
      repin(dir);
      const repinned = JSON.parse(fs.readFileSync(path.join(dir, "test/pins.json"), "utf8"));
      repinned.entries = pins.entries; // the count stays as it was: the proof must notice the missing entries
      fs.writeFileSync(path.join(dir, "test/pins.json"), JSON.stringify(repinned, null, 1));
      return ["--native"];
    } },
  { name: "front-end-regression", why: "the front end prints one byte differently (re-pinned, so the comparison must catch it)", expect: 1,
    message: "FAIL session#20: \"/reset\"",
    setup(dir) {
      edit(path.join(dir, "src/foundations/scratchpad/Commands.java"), "|  Resetting state.\\n", "|  Resetting state!\\n");
      repin(dir);
      return ["--native", "--sessions", "session"];
    } },
  { name: "between-dropped", why: "our side stops recording what shows between the lines of an entry", expect: 1, message: "between lines expected",
    setup(dir) {
      edit(path.join(dir, "test/OurJShell.java"), "if (i < entry.size() - 1 && !text.isEmpty()) between.add(text);", "");
      return ["--native", "--sessions", "input"];
    } },
  { name: "cancel-keeps-exit", why: "a cancel no longer forgets an /exit argument being typed (the review's F3)", expect: 1,
    message: "FAIL input#36: \"2 + 3\"",
    setup(dir) {
      edit(path.join(dir, "src/foundations/scratchpad/Shell.java"), "  void forget() {\n    pending = \"\";\n    exiting = false;\n",
        "  void forget() {\n    pending = \"\";\n");
      repin(dir);
      return ["--native", "--sessions", "input"];
    } },
  { name: "no-scratchpad", why: "--scratchpad names a directory with no manifest.json", expect: 2, message: "usage: node runtime/jshell/test/check.mjs",
    setup(dir) {
      return ["--native", "--sessions", "startup", "--scratchpad", path.join(path.dirname(dir), "no-scratchpad")];
    } },
  { name: "old-option", why: "the proof's old --site option, which must be refused, never ignored", expect: 2, message: "usage: node runtime/jshell/test/check.mjs",
    setup(dir) {
      return ["--native", "--sessions", "startup", "--site", site];
    } },
  { name: "bad-browser", why: "--browser names an engine the check does not run", expect: 2, message: "usage: node runtime/jshell/test/check.mjs",
    setup(dir) {
      return ["--browser", "opera", "--sessions", "startup"];
    } },
  { name: "native-and-browser", why: "--native and --browser together", expect: 2, message: "--native and --browser exclude each other",
    setup(dir) {
      return ["--native", "--browser", "chromium", "--sessions", "startup"];
    } },
  { name: "checksums-malformed", why: "a line of runtime/ristretto/CHECKSUMS that is not \"<sha256>  <name>\"", expect: 2,
    message: "runtime/ristretto/CHECKSUMS: not",
    setup(dir) {
      const sums = path.resolve(dir, "../ristretto/CHECKSUMS");
      fs.writeFileSync(sums, fs.readFileSync(sums, "utf8").replace(/^([0-9a-f]{64})  (jdk\.zip)$/m, "$1 $2"));
      return ["--native", "--sessions", "startup"];
    } },
  { name: "checksums-unlisted", why: "runtime/ristretto/CHECKSUMS without its jdk.zip line", expect: 2,
    message: "pin: runtime/ristretto/CHECKSUMS does not list jdk.zip",
    setup(dir) {
      const sums = path.resolve(dir, "../ristretto/CHECKSUMS");
      fs.writeFileSync(sums, fs.readFileSync(sums, "utf8").replace(/^[0-9a-f]{64}  jdk\.zip\n/m, ""));
      return ["--native", "--sessions", "startup"];
    } },
  { name: "scratchpad-file-missing", why: "the scratchpad without worker.js", expect: 2, message: "worker.js is missing",
    setup(dir) {
      const copied = scratchpadCopy(dir);
      fs.rmSync(path.join(copied, "worker.js"));
      return ["--native", "--sessions", "startup", "--scratchpad", copied];
    } },
  { name: "banner", why: "the banner printed one character differently", expect: 1, message: "FAIL startup#banner",
    setup(dir) {
      edit(path.join(dir, "src/foundations/scratchpad/Shell.java"), "|  Welcome to JShell -- Version ", "|  Welcome to JShell - Version ");
      repin(dir);
      return ["--native", "--sessions", "startup"];
    } },
  { name: "parsers-disagree", why: "the Node parser reads \"@@blank\" differently from the Java one", expect: 1, message: "the session parsers disagree",
    setup(dir) {
      edit(path.join(dir, "test/sessions.mjs"), 'lines.push(line === "@@blank" ? "" :', 'lines.push(line === "@@blank" ? " " :');
      return ["--native", "--sessions", "input"];
    } },
  { name: "stray-engine", why: "\"#! engine\" on an entry the local engine prints the same", expect: 1, message: "FAIL commands#2: \"engine\" is announced and did not fire",
    setup(dir) {
      edit(path.join(dir, "test/sessions/commands.jsh"), "\nint x = 5\n", "\n#! engine\nint x = 5\n");
      repin(dir);
      return ["--native", "--sessions", "commands"];
    } },
  { name: "stray-startup", why: "\"#! startup\" on an entry the plain startup prints the same", expect: 1, message: "FAIL commands#2: \"startup\" is announced and did not fire",
    setup(dir) {
      edit(path.join(dir, "test/sessions/commands.jsh"), "\nint x = 5\n", "\n#! startup\nint x = 5\n");
      repin(dir);
      return ["--native", "--sessions", "commands"];
    } },
  { name: "stray-own", why: "a \"#=\" text equal to what the real tool prints", expect: 1, message: "FAIL commands#2: \"own\" is announced and did not fire",
    setup(dir) {
      edit(path.join(dir, "test/sessions/commands.jsh"), "\nint x = 5\n", "\n#= \"x ==> 5\\n\"\nint x = 5\n");
      repin(dir);
      return ["--native", "--sessions", "commands"];
    } },
  { name: "removed-startup", why: "an entry the J1 startup changes, its \"#! startup\" removed", expect: 1, message: "\"startup\" is not announced",
    setup(dir) {
      edit(path.join(dir, "test/sessions/commands.jsh"), "#! startup\n/imports\n", "/imports\n");
      repin(dir);
      return ["--native", "--sessions", "commands"];
    } },
  { name: "removed-engine", why: "a redefinition that loses state, its \"#! engine\" removed", expect: 1, message: "FAIL declarations#48: \"class Box",
    setup(dir) {
      edit(path.join(dir, "test/sessions/declarations.jsh"), "#! engine\nclass Box { int v = 2;", "class Box { int v = 2;");
      repin(dir);
      return ["--native", "--sessions", "declarations"];
    } },
  { name: "stray-annotation", why: "\"#! frames\" on an entry with no JDK frame", expect: 1, message: "\"frames\" is announced and did not fire",
    setup(dir) {
      edit(path.join(dir, "test/sessions/commands.jsh"), "\nint x = 5\n", "\n#! frames\nint x = 5\n");
      repin(dir);
      return ["--native", "--sessions", "commands"];
    } },
  { name: "changed-own-text", why: "one character of a \"#=\" text changed", expect: 1, message: "FAIL session#45: \"/help nosuch\" [own]",
    setup(dir) {
      edit(path.join(dir, "test/sessions/session.jsh"), "The scratchpad has no help on nosuch.", "The scratchpad has no help on nosuch!");
      repin(dir);
      return ["--native", "--sessions", "session"];
    } },
  { name: "stale-release", why: "on Ristretto, a re-pinned front end the scratchpad release does not carry yet", expect: 2,
    message: "pin: runtime/ristretto/CHECKSUMS pins browser-jshell.jar as",
    setup(dir) {
      edit(path.join(dir, "src/foundations/scratchpad/Commands.java"), "|  Resetting state.\\n", "|  Resetting state!\\n");
      repin(dir);
      return ["--sessions", "startup"];
    } },
  { name: "scratchpad-jar-byte", why: "on Ristretto, one byte of the scratchpad's jar changed", expect: 2, message: "pin: browser-jshell.jar in",
    setup(dir) {
      const copied = scratchpadCopy(dir);
      const jar = path.join(copied, "browser-jshell.jar");
      const b = fs.readFileSync(jar); b[1000] ^= 1; fs.writeFileSync(jar, b);
      return ["--sessions", "startup", "--scratchpad", copied];
    } },
  { name: "manifest-disagrees", why: "on Ristretto, manifest.json gives the client another hash for jdk.zip", expect: 2,
    message: "manifest.json gives jdk.zip as 0000",
    setup(dir) {
      const copied = scratchpadCopy(dir);
      const manifest = JSON.parse(fs.readFileSync(path.join(copied, "manifest.json"), "utf8"));
      manifest.files["jdk.zip"].sha256 = "0".repeat(64);
      fs.writeFileSync(path.join(copied, "manifest.json"), JSON.stringify(manifest));
      return ["--sessions", "startup", "--scratchpad", copied];
    } },
  { name: "removed-frames-ristretto", slow: true, why: "on Ristretto, course entry 35's \"#! frames\" removed", expect: 1, message: "FAIL course#35",
    setup(dir) {
      edit(path.join(dir, "test/sessions/course.jsh"), "#! frames\nInteger.parseInt(\"abc\")", "Integer.parseInt(\"abc\")");
      repin(dir);
      return ["--sessions", "course"];
    } },
  { name: "stray-message-ristretto", slow: true, why: "on Ristretto, \"#! message\" on an exception whose message Ristretto words as the JDK does",
    expect: 1, message: "\"message\" is announced and did not fire",
    setup(dir) {
      edit(path.join(dir, "test/sessions/exceptions.jsh"), "\nthrow new RuntimeException(\"outer\"", "\n#! message\nthrow new RuntimeException(\"outer\"");
      repin(dir);
      return ["--sessions", "exceptions"];
    } },
  { name: "missing-prompt-ristretto", slow: true, why: "on Ristretto, our answers stop carrying the next prompt (the review's F9)",
    expect: 1, message: "prompts expected",
    setup(dir) {
      edit(path.join(dir, "src/foundations/scratchpad/Session.java"), ',\\"reset\\":false,\\"prompt\\":"', ',\\"reset\\":false,\\"noprompt\\":"');
      repin(dir);
      return ["--sessions", "startup", ...restage(dir)];
    } },
  { name: "removed-message-ristretto", slow: true, why: "on Ristretto, rec(0)'s \"#! message\" removed", expect: 1, message: "FAIL exceptions#49: \"rec(0)\"",
    setup(dir) {
      edit(path.join(dir, "test/sessions/exceptions.jsh"), "#! message\nrec(0)", "rec(0)");
      repin(dir);
      return ["--sessions", "exceptions"];
    } },
  { name: "client-drops-prompt", slow: true, why: "on Ristretto, the page's client stops handing on the front end's prompt", expect: 1,
    message: "prompts expected",
    setup(dir) {
      edit(path.resolve(dir, "../../web/page/jshell-session.js"), 'const prompt = typeof m.prompt === "string" ? m.prompt : null;', "const prompt = null;");
      return ["--sessions", "startup"];
    } },
  { name: "client-ends-early", slow: true, why: "on Ristretto, the page's client ends the session (an entry deadline of 1 ms)", expect: 1,
    message: "our session ended early: {\"reason\":\"timeout\"",
    setup(dir) {
      edit(path.resolve(dir, "../../web/page/jshell-session.js"), "deadlineMs = 60_000,", "deadlineMs = 1,");
      return ["--sessions", "startup"];
    } },
  { name: "drive-loses-tail", slow: true, why: "on Ristretto, the shared driver stops recording the prompt after the last entry", expect: 1,
    message: "FAIL startup#tail",
    setup(dir) {
      edit(path.join(dir, "test/drive.mjs"), 'result.tail = ended || closed ? "" : prompt;', 'result.tail = "";');
      return ["--sessions", "startup"];
    } },
  { name: "drive-drops-between", slow: true, why: "on Ristretto, the shared driver stops recording what shows between an entry's lines", expect: 1,
    message: "between lines expected",
    setup(dir) {
      edit(path.join(dir, "test/drive.mjs"), "if (i < lines.length - 1 && text) between.push(text);", "");
      return ["--sessions", "input"];
    } },
  { name: "off-origin-browser", slow: true, why: "the staged page fetches from another origin (a local canary that must see nothing)", expect: 1,
    message: `requests left the page's origin: ${canary.url}`,
    setup(dir) {
      edit(path.join(dir, "test/browser/page.mjs"), 'import { drive } from "./drive.mjs";\n',
        `import { drive } from "./drive.mjs";\nawait fetch(${JSON.stringify(canary.url)}).catch(() => {});\n`);
      return ["--browser", "chromium", "--sessions", "startup"];
    },
    after: () => (canary.hits === 0 ? null : `the off-origin request arrived (${canary.hits})`) },
  { name: "page-error-browser", slow: true, why: "the staged page throws", expect: 1, message: "the page reported: page error: staged page fault",
    setup(dir) {
      edit(path.join(dir, "test/browser/page.mjs"), 'import { drive } from "./drive.mjs";\n',
        'import { drive } from "./drive.mjs";\nsetTimeout(() => { throw new Error("staged page fault"); });\n');
      return ["--browser", "chromium", "--sessions", "startup"];
    } },
  { name: "page-module-throws-browser", slow: true, why: "the staged page's module throws as it loads, so it never sets window.scratch",
    expect: 2, message: "page error: staged module fault",
    setup(dir) {
      edit(path.join(dir, "test/browser/page.mjs"), 'import { drive } from "./drive.mjs";\n',
        'import { drive } from "./drive.mjs";\nthrow new Error("staged module fault");\n');
      return ["--browser", "chromium", "--sessions", "startup"];
    } },
  { name: "scratch-throws-browser", slow: true, why: "reading the staged page's window.scratch throws, so the wait for it fails at once, not by its timeout",
    expect: 2, message: "window.scratch failed: page.waitForFunction: Error: staged scratch fault",
    setup(dir) {
      edit(path.join(dir, "test/browser/page.mjs"), "window.scratch = {",
        'Object.defineProperty(window, "scratch", { get() { throw new Error("staged scratch fault"); } });\nwindow.unused = {');
      return ["--browser", "chromium", "--sessions", "startup"];
    } },
];
const unknown = (only ?? []).filter((name) => !BREAKS.some((b) => b.name === name));
if (unknown.length) { console.log(`--only: no break is named ${unknown.join(", ")}\n${USAGE}`); process.exit(2); }
// A selection that leaves no break to run (every --only name a slow break, with --skip-slow) would pass on nothing.
const selected = BREAKS.filter((b) => (!only || only.includes(b.name)) && !(skipSlow && b.slow));
if (!selected.length) { console.log(`no break left to run: every one selected is slow, and --skip-slow skips them\n${USAGE}`); process.exit(2); }
const site = scratchpadDir(option("--scratchpad") ? ["--scratchpad", option("--scratchpad")] : [], USAGE, "jshell-breaks-site");

// The working tree's jar must be the pinned one before anything is broken, so every copy starts from the proof as pinned.
execFileSync("sh", [path.join(front, "build.sh")], { stdio: "ignore" });
unbroken = { manifest: sha(path.join(site, "manifest.json")), diff: trackedDiff() };
const before = originalsIntact();
if (before) { console.error(`FAIL: before any break, ${before} (re-pin with test/pin.mjs first)`); process.exit(2); }
const results = [];
for (const b of selected) {
  const dir = copy(b.name);
  const argv = b.setup(dir);
  if (!argv.includes("--scratchpad")) argv.push("--scratchpad", site);
  const run = await new Promise((resolve) => execFile(process.execPath, [path.join(dir, "test/check.mjs"), ...argv],
    { maxBuffer: 1 << 26 }, (err, stdout, stderr) => resolve({ code: err ? err.code : 0, text: stdout + stderr })));
  const leaked = b.after?.() ?? null;
  const ok = run.code === b.expect && run.text.includes(b.message) && !leaked;
  const first = leaked ?? run.text.split("\n").find((l) => l.startsWith("FAIL") || l.startsWith("usage")) ?? run.text.split("\n").slice(-3).join(" | ");
  results.push(`${ok ? "ok  " : "BAD "} ${b.name}: ${b.why}; exit ${run.code} (expected ${b.expect}): ${first.slice(0, 160)}`);
  console.log(results[results.length - 1]);
  if (ok) fs.rmSync(path.dirname(path.dirname(dir)), { recursive: true, force: true });
  const moved = originalsIntact();
  if (moved) { console.error(`FAIL: after ${b.name}, ${moved}; stopped, restore it before anything else`); process.exit(2); }
}
canaryServer.close();
const bad = results.filter((r) => r.startsWith("BAD")).length;
console.log(`${results.length} breaks, ${bad} not caught as expected`);
process.exitCode = bad ? 1 : 0;
