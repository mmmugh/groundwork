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
// The scratchpad's panel in Chromium, WebKit and Firefox, on the page fixture volume, against a stand-in for
// Ristretto's worker running the course's jshell front end: the same requests and events, the front end's prompts
// and words, canned answers at once, no Java. Everything the panel does is checked here in seconds (the real jshell
// takes 10 to 60 seconds to open: web/test/scratchpad.mjs). The client (web/page/jshell-session.js) is the real one,
// its download, its checks and its composing of the front end into jdk.zip included: the stand-in replaces only the
// worker. Also: a browser that cannot run the scratchpad is told plainly, nothing of it downloads before the reader
// opens it, and a second page opening it downloads none of jshell's files again.
//   node web/test/scratchpad-panel.mjs [chromium|webkit|firefox]
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { REPO, ENGINES, check, done, buildSite, open, workDir, forwardProxy } from "./harness.mjs";
import { serve } from "../serve.mjs";
import { ASSETS } from "../page/jshell-session.js";

const only = process.argv[2];
if (only && !ENGINES[only]) { console.log("usage: node web/test/scratchpad-panel.mjs [chromium|webkit|firefox]"); process.exit(2); }
const site = path.join(buildSite(path.join(REPO, "web/test/vol-page"), "scratchpad-panel-test"), "site");
const PAGE = "vol-page/ch01-run.html";
// The client fetches each of jshell's five files at its hash-qualified URL, <name>?sha256=<the manifest's hash>.
const MANIFEST = JSON.parse(fs.readFileSync(path.join(site, "scratchpad/manifest.json"), "utf8"));
const FILE_URLS = ASSETS.map((n) => `${n}?sha256=${MANIFEST.files[n].sha256}`);
const zips = (t) => t.requests.filter((u) => u.endsWith(`/scratchpad/jdk.zip?sha256=${MANIFEST.files["jdk.zip"].sha256}`)).length;
const MINIMUMS = "Chrome 119, Firefox 120 and Safari 18.2";
const BANNER = "|  Welcome to JShell -- Version 25.0.4.1\n|  For an introduction type: /help intro\n";
// The panel's words for the client's three onProgress phases, in order (D54), on a secure page (https, localhost) and on
// one that is not (plain http from another device), where Safari and every iPhone or iPad browser cannot start jshell
// (D90, D91): the words are chosen by isSecureContext, never by the browser's name.
const PHASE_WORDS = ["Downloading jshell (about 30 MB) and checking it", "Starting Java",
  "Starting jshell, which takes about 10 seconds in Chrome and Safari on a computer, and up to a minute in Firefox or on a phone"];
const PHASE_WORDS_PLAIN = [...PHASE_WORDS.slice(0, 2), "Starting jshell, which takes about 10 seconds in Chrome and up to a " +
  "minute in Firefox; on a plain http address Safari and every browser on iPhone or iPad cannot start it (use https or localhost)"];
// The sentence a start that timed out adds on a page that is not secure (D91).
const PLAIN_HTTP_SLOW = "On a plain http address, Safari and every iPhone or iPad browser run Java much more slowly; open the " +
  "course over https or from localhost.";
// What the note says while a /reset or /reload restarts jshell: words of its own, the timer, and no time claimed.
const RESTARTING = /^Starting a fresh jshell… \d+ s$/;
// The site with its jshell download cut short by a byte, as a dropped connection leaves it.
const cut = workDir("scratchpad-panel-cut");
fs.cpSync(site, cut, { recursive: true });
fs.truncateSync(path.join(cut, "scratchpad/jdk.zip"), fs.statSync(path.join(cut, "scratchpad/jdk.zip")).size - 1);

// The stand-in, run as the worker's own script: Ristretto's protocol (jshell-session.mjs speaks it), answering as the
// course's front end does (runtime/jshell/src/): every answer carries the prompt for the next line, by feedback mode
// (Mode.java), /exit answers closed with an empty prompt, and the front end answers every command itself. One canned
// answer per line the checks type. "spin" never answers, as an endless loop does, so only terminate() ends it. A boot
// takes BOOT_MS, as jshell's start does; /reset and /reload take RESTART_MS inside their one request, with no phase
// event, as Ristretto's worker starts a fresh VM for them (its lib.rs).
function standIn() {
  let booted = false, values = 0, depth = 0, mode = "normal"; // depth: braces still open, as jshell counts them
  let slowCancel = false; // the open snippet began "int slowCancel() {": its cancel answers after a second
  const PROMPTS = { normal: ["\njshell> ", "   ...> "], concise: ["jshell> ", "   ...> "], silent: ["-> ", ">> "] };
  self.onmessage = ({ data: { request: r, assets } }) => {
    const post = (e) => self.postMessage({ id: r.id, ...e });
    const out = (text, stream = "stdout") => post({ type: "output", stream, text });
    const ready = (continuation = false) => post({ type: "ready", continuation, closed: false, reset: false,
      prompt: PROMPTS[mode][continuation ? 1 : 0] });
    if (!booted) {
      if (!assets || assets.length !== 4) return post({ type: "error", message: "Missing Java runtime assets." });
      booted = true;
      post({ type: "phase", phase: "loading" });
      post({ type: "phase", phase: "evaluating" });
      return setTimeout(() => {
        out("|  Welcome to JShell -- Version 25.0.4.1\n");
        out("|  For an introduction type: /help intro\n");
        ready();
      }, BOOT_MS); // BOOT_MS and RESTART_MS: set where the page makes this worker (STAND_IN)
    }
    if (r.operation === "cancel") { // the front end drops the lines not yet finished
      depth = 0;
      if (slowCancel) { slowCancel = false; return setTimeout(() => ready(), 1000); }
      return ready();
    }
    const s = r.source;
    if (s === "int slowCancel() {") slowCancel = true;
    if (s.trimEnd().endsWith("{")) { depth++; return ready(true); }
    if (s.trim() === "}" && depth) { depth = 0; out("|  created method twice(int)\n"); return ready(); }
    if (depth) return ready(true); // a line typed inside an unfinished snippet joins it, whatever it is
    if (!s.trim()) return ready(); // an empty line: the front end prints nothing and gives its prompt again
    if (s === "2 + 3") { out(`$${++values} ==> 5\n`); return ready(); }
    if (s === "spin") for (;;) { /* an endless loop */ }
    // A loop that prints: Ristretto's worker sends each println as an output event of its own.
    if (s === "flood") { for (let i = 0; i < 16352; i++) out("flood line\n"); return ready(); }
    // A program's own System.err is the only output on stderr: the front end prints its feedback, errors and traces
    // on stdout.
    if (s === 'System.err.println("oops")') { out("oops\n", "stderr"); return ready(); }
    if (/^half \d$/.test(s)) {
      for (let i = 0; i < 900; i++) out(`${s} line ${String(i).padStart(3, "0")} ${"y".repeat(980)}\n`);
      return ready();
    }
    if (s === "over") { for (let i = 0; i < 1100; i++) out("z".repeat(999) + "\n"); return ready(); }
    // Exactly n characters of output in one event, in lines of at most 1,000: the trim's checks size entries with it.
    const fill = /^fill (\d+)$/.exec(s);
    if (fill) {
      const n = Number(fill[1]), whole = Math.floor(n / 1000), rest = n - 1000 * whole;
      out(("w".repeat(999) + "\n").repeat(whole) + (rest ? "w".repeat(rest - 1) + "\n" : ""));
      return ready();
    }
    if (s === "die") return post({ type: "error", message: "unreachable" });
    if (s === "die later") { out("later\n"); ready(); return setTimeout(() => { throw new Error("boom"); }, 100); }
    // Recorded from the real worker (web/test/jshell-session.mjs): memory used up is a Rust abort on stderr, in
    // pieces, then an error.
    if (s === "oom") {
      out("l ==> []\n");
      for (const piece of ["memory allocation of ", "8000000", " bytes failed\n", "note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace\n"]) out(piece, "stderr");
      return post({ type: "error", message: "unreachable" });
    }
    // An answer that carries no prompt, as a front end that gives none would send.
    if (s === "no prompt") { out("echo: no prompt\n"); return post({ type: "ready", continuation: false, closed: false, reset: false }); }
    if (s === "/reset" || s === "/reload") {
      if (s === "/reset") values = 0;
      out(s === "/reset" ? "|  Resetting state.\n" : "|  Restarting and restoring state.\n");
      return setTimeout(() => ready(), RESTART_MS);
    }
    if (s === "/exit") { out("|  Goodbye\n"); return post({ type: "ready", continuation: false, closed: true, reset: false, prompt: "" }); }
    const feedback = /^\/set feedback (normal|concise|silent)$/.exec(s);
    if (feedback) { mode = feedback[1]; if (mode === "normal") out("|  Feedback mode: normal\n"); return ready(); }
    // The front end's own words for the rest (HelpText.java, Commands.java): a line of its help (J2), and what it says
    // of a command it does not offer, or does not know.
    if (s === "/help") { out("|  This is the course's Java scratchpad. Type a piece of Java and press Enter to run it.\n"); return ready(); }
    if (s === "/help intro") { out("|  The scratchpad runs Java one piece at a time: an expression shows its value,\n"); return ready(); }
    const word = s.split(" ")[0];
    if (["/open", "/save", "/edit"].includes(word)) { out(`|  ${word} is not available in this scratchpad. Type /help to see what is.\n`); return ready(); }
    if (word.startsWith("/")) { out(`|  Invalid command: ${word}\n|  Type /help for help.\n`); return ready(); }
    out(`echo: ${s}\n`);
    return ready();
  };
}
// Runs in the page before its own scripts: the scratchpad's worker becomes the stand-in (booting in bootMs, restarting
// in restartMs), and every one of its workers is recorded, with when it was made and when the page terminated it.
// Recorders on the panel: jfAtReady, the transcript at each moment data-state turns ready (a MutationObserver runs
// before any later task or promise callback), and jfAtEnded, the transcript's end at each moment it turns ended;
// jfNotes, each new thing the note says, without its timer, and jfTicks, each new thing it says, timer included.
const STAND_IN = (source, bootMs, restartMs) => {
  const Real = window.Worker;
  const url = URL.createObjectURL(new Blob([`const BOOT_MS = ${bootMs}, RESTART_MS = ${restartMs};\n(${source})();\n`],
    { type: "text/javascript" }));
  window.jfWorkers = [];
  window.Worker = class Worker extends Real {
    constructor(u, options) {
      const ours = /\/scratchpad\/worker\.js(\?|$)/.test(String(u)); // started as worker.js?v=<the manifest's version>
      super(ours ? url : u, options);
      if (ours) window.jfWorkers.push(this.jf = { made: performance.now(), terminated: null });
    }
    terminate() {
      if (this.jf && this.jf.terminated == null) this.jf.terminated = performance.now();
      return super.terminate();
    }
  };
  window.jfAtReady = [];
  window.jfAtEnded = [];
  window.jfNotes = [];
  window.jfTicks = [];
  document.addEventListener("DOMContentLoaded", () => {
    const p = document.getElementById("scratchpad");
    if (!p) return; // Firefox runs this in about:blank too
    const note = p.querySelector(".scratch-note");
    new MutationObserver((records) => {
      const shown = p.querySelector(".transcript").textContent;
      if (p.dataset.state === "ready") window.jfAtReady.push(shown);
      // Each record's value is the next one's old value, the last one's the current value: an ended that a fresh
      // session's loading follows at once is seen too.
      for (const value of records.slice(1).map((r) => r.oldValue).concat(p.dataset.state))
        if (value === "ended") window.jfAtEnded.push(shown.slice(-200));
    }).observe(p, { attributes: true, attributeFilter: ["data-state"], attributeOldValue: true });
    new MutationObserver(() => {
      const said = note.textContent, words = said.replace(/… \d+ s$/, "");
      if (said && said !== window.jfTicks[window.jfTicks.length - 1]) window.jfTicks.push(said);
      if (words && words !== window.jfNotes[window.jfNotes.length - 1]) window.jfNotes.push(words);
    }).observe(note, { childList: true, characterData: true, subtree: true });
  });
};
const standInScript = (bootMs, more = "", restartMs = 1500) =>
  `(${STAND_IN})(${JSON.stringify(String(standIn))}, ${bootMs}, ${restartMs});\n${more}`;
const SCRATCH_URL = /\/scratchpad\//;
// The page sets data-java once its boxes are wired, and data-scratchpad once the scratchpad is (wire.js loads it apart
// from the boxes, a moment later) or app.js found it cannot run here. Bounded: a page that sets neither fails a check.
const ready = (t) => t.page.waitForFunction(() => document.documentElement.dataset.java && document.documentElement.dataset.scratchpad,
  null, { timeout: 10000 }).catch(() => {});
// A wall clock around every wait on the page, so a page that stops answering fails its check instead of hanging: the
// wait then gives false, as a wait that timed out does.
const within = (ms, p) => Promise.race([p, new Promise((r) => setTimeout(() => r(false), ms))]);
const until = (t, fn, arg, ms = 10000) => within(ms + 2000, t.page.waitForFunction(fn, arg, { timeout: ms }).then(() => true, () => false));

// The proxy that makes the insecure origin answers only for that name and port: a request through it for any other
// host, or the right host at another port, or the server's own address, gets 502 and never reaches the server.
{
  const s = await serve({ root: site, port: 0 });
  const proxy = await forwardProxy(s.port);
  const through = (host, target = host) => new Promise((resolve) => {
    http.get({ host: "127.0.0.1", port: proxy.port, path: `http://${target}/`, headers: { host } }, (r) => { r.resume(); resolve(r.statusCode); });
  });
  const got = { named: await through(`groundwork.test:${s.port}`), other: await through("example.test"),
    otherPort: await through(`groundwork.test:${s.port + 1}`), direct: await through(`127.0.0.1:${s.port}`) };
  check("the insecure origin's proxy forwards groundwork.test:<port> and answers 502 to any other host or port",
    got.named === 200 && got.other === 502 && got.otherPort === 502 && got.direct === 502, got);
  await proxy.close();
  await s.close();
}

for (const engine of only ? [only] : Object.keys(ENGINES)) {
  console.log(engine);
  let t = await open(engine, site, PAGE, { viewport: { width: 390, height: 844 } }, standInScript(1500));
  const panel = t.page.locator("#scratchpad");
  const tab = t.page.locator(".scratch-tab");
  const input = t.page.locator("#scratchpad .entry textarea");
  const text = async () => (await panel.locator(".transcript").textContent()) ?? "";
  const state = () => panel.getAttribute("data-state");
  const waitState = (want, ms = 10000) => until(t, (w) => w.includes(document.getElementById("scratchpad").dataset.state), want, ms);
  const waitText = (needle, ms = 10000) => until(t, (n) => document.querySelector("#scratchpad .transcript").textContent.includes(n), needle, ms);
  const session = async () => Number(await panel.getAttribute("data-session"));
  const waitSession = (n, ms = 10000) => until(t, (n) => document.getElementById("scratchpad").dataset.session === String(n)
    && document.getElementById("scratchpad").dataset.state === "ready", n, ms);
  const type = async (line) => { await input.fill(line); await input.press("Enter"); };
  await ready(t);

  check(`${engine}: the page wires the scratchpad and shows its tab`,
    await t.page.evaluate(() => document.documentElement.dataset.scratchpad) === "ready" && await tab.isVisible(), null);
  const sheet = await t.page.evaluate(() => document.body.dataset.sheet);
  check(`${engine}: the panel is shut, the page says so, and nothing of the scratchpad has downloaded`,
    await panel.isHidden() && await state() === "shut" && sheet === "shut" && !t.requests.some((u) => SCRATCH_URL.test(u)),
    { state: await state(), sheet, requests: t.requests.filter((u) => SCRATCH_URL.test(u)) });

  await tab.click();
  check(`${engine}: opening starts the load at once, the input read-only and New session hidden`,
    await state() === "loading" && !(await input.isEditable()) && !(await input.isDisabled())
      && await panel.locator(".scratch-new").isHidden(), await state());
  // Opening focuses the input at once (setOpen); the field is blurred while jshell starts, so the focus checked below
  // once it is ready is the one the panel gives when the boot ends.
  const blurField = () => t.page.evaluate(() => document.querySelector("#scratchpad .entry textarea").blur());
  const fieldFocused = () => t.page.evaluate(() => document.activeElement === document.querySelector("#scratchpad .entry textarea"));
  await blurField();
  const about = await panel.locator(".scratch-about").isVisible() ? await panel.locator(".scratch-about").textContent() : "";
  check(`${engine}: the panel says what this browser keeps (the 30 MB download, kept over https or from localhost and maybe downloaded again over plain http, the last 100 entries), that Safari and iPhone or iPad cannot start it over plain http (D90), and that its wording differs from the JDK's jshell`,
    about.includes("The first time you open it, it downloads about 30 MB. Over https or from localhost this browser keeps it (unless it is set not to keep site data), so later visits start sooner; from a plain http address it may download it again on each visit, and Safari and every browser on iPhone or iPad run Java there too slowly to start it (Safari on a Mac had not started it after four minutes): use https or localhost. It also keeps your last 100 entries for Up and Down.")
      && about.includes("worded differently from the JDK's own jshell"), about);
  check(`${engine}: and says up front what Stop costs and how to leave an unfinished line`,
    about.includes("Stop ends an entry that runs too long, and the session with it; at ...>, Cancel drops an unfinished line."), about);
  // The stand-in takes 1.5 s to boot, after the download: the seconds count changes at least once while jshell starts
  // (any 1.5 s holds a whole second, and the note ticks every 250 ms), read from what the note said, not by the clock.
  await waitState(["ready"]);
  // Not a touch device (D69 below): the panel focuses its input itself, so typing goes straight in once jshell is ready.
  const focusedHere = await fieldFocused();
  check(`${engine}: with a mouse and a keyboard, the panel focuses its input once jshell is ready, though the field lost the focus while it started`,
    focusedHere, focusedHere);
  const notes = await t.page.evaluate(() => window.jfNotes);
  const ticks = await t.page.evaluate(() => window.jfTicks);
  const secs = (s) => Number((s.match(/(\d+) s$/) ?? [])[1]);
  const counted = ticks.filter((s) => s.startsWith(PHASE_WORDS[2])).map(secs);
  check(`${engine}: while it opens, the panel says what it is doing, phase by phase (D54), Firefox's minute with jshell's`,
    JSON.stringify(notes) === JSON.stringify(PHASE_WORDS), notes);
  check(`${engine}: and counts the seconds`, counted.length >= 2 && counted.every((n, i) => Number.isInteger(n) && (i === 0 || n > counted[i - 1])), ticks);
  const atReady = await t.page.evaluate(() => window.jfAtReady);
  check(`${engine}: jshell's banner shows once, before the panel says ready, and the note goes`,
    (await text()) === BANNER && atReady[0] === BANNER && await panel.locator(".scratch-note").isHidden(), { text: await text(), atReady });
  check(`${engine}: and the caret shows the first prompt the front end gave`, await panel.locator(".caret").textContent() === "jshell>",
    await panel.locator(".caret").textContent());
  const fetched = [...new Set(t.requests.filter((u) => SCRATCH_URL.test(u)).map((u) => u.replace(/.*\/scratchpad\//, "")))].sort();
  check(`${engine}: opening downloaded the manifest and jshell's five files, each at its hash-qualified URL, the course's front end among them`,
    JSON.stringify(fetched) === JSON.stringify(["manifest.json", ...FILE_URLS].sort()), fetched);

  // Ready means the entry's output is on screen (jfAtReady), which web/test/scratchpad.mjs relies on when it reads
  // the transcript. Each line is echoed after the prompt the front end gave for it: in normal mode a blank line, then
  // "jshell> ", as the real tool prints it.
  let before = await text();
  await type("2 + 3");
  await waitText("$1 ==> 5\n");
  check(`${engine}: an entry is echoed after the prompt the front end gave, its blank line included, then jshell's answer`,
    (await text()) === before + "\njshell> 2 + 3\n$1 ==> 5\n", (await text()).slice(before.length));
  const lastReady = await t.page.evaluate(() => window.jfAtReady.pop() ?? "");
  check(`${engine}: and the answer is on screen by the time data-state says ready`, lastReady.endsWith("\njshell> 2 + 3\n$1 ==> 5\n"), lastReady.slice(-80));
  // An empty line at the prompt goes to the front end too, as the transcript check sends one (input.jsh's @@blank): it
  // answers with its prompt, so the transcript shows the prompt and an empty line, as the real tool's terminal does.
  before = await text();
  const readies = await t.page.evaluate(() => window.jfAtReady.length);
  await input.press("Enter");
  const answeredBlank = await until(t, (n) => window.jfAtReady.length > n, readies, 5000);
  check(`${engine}: Enter on an empty line at the prompt sends it to the front end, which answers with its prompt`,
    answeredBlank && (await text()).slice(before.length) === "\njshell> \n" && await panel.locator(".caret").textContent() === "jshell>",
    { answeredBlank, got: (await text()).slice(before.length) });
  before = await text();
  await type("int twice(int n) {");
  await waitState(["ready"]);
  const caretMore = await panel.locator(".caret").textContent();
  await type("return n * 2;");
  await type("}");
  await waitText("created method twice(int)");
  check(`${engine}: an unfinished line continues at ...>, then the prompt comes back`,
    caretMore === "   ...>" && (await text()).slice(before.length) === "\njshell> int twice(int n) {\n   ...> return n * 2;\n   ...> }\n|  created method twice(int)\n"
      && await panel.locator(".caret").textContent() === "jshell>", { caretMore, got: (await text()).slice(before.length) });
  // Shift+Enter makes a new line in the input, and sends nothing; Enter then sends each line as its own request, so
  // the second is jshell's continuation (one request of two lines would get the stand-in's echo instead).
  before = await text();
  await input.fill("int twice(int n) {");
  await input.press("Shift+Enter");
  await input.pressSequentially("}");
  const twoLines = await input.inputValue();
  await t.page.waitForTimeout(300);
  const sentNothing = (await text()) === before && await state() === "ready";
  await input.press("Enter");
  await waitText("created method twice(int)\n", 5000);
  await t.page.waitForTimeout(300);
  check(`${engine}: Shift+Enter adds a line and sends nothing; Enter sends each line as a request of its own`,
    twoLines === "int twice(int n) {\n}" && sentNothing
      && (await text()).slice(before.length) === "\njshell> int twice(int n) {\n   ...> }\n|  created method twice(int)\n", { twoLines, sentNothing, got: (await text()).slice(before.length) });

  // History: Up walks back through what was entered, Down forward, past the newest to an empty input; it is kept
  // in localStorage under a jf: key.
  await input.press("ArrowUp");
  const up1 = await input.inputValue();
  await input.press("ArrowUp");
  const up2 = await input.inputValue();
  await input.press("ArrowDown");
  const down1 = await input.inputValue();
  await input.press("ArrowDown");
  const down2 = await input.inputValue();
  const stored = await t.page.evaluate(() => JSON.parse(localStorage.getItem("jf:scratchpad:history")));
  check(`${engine}: Up and Down walk the history`,
    up1 === "int twice(int n) {\n}" && up2 === "}" && down1 === "int twice(int n) {\n}" && down2 === "", { up1, up2, down1, down2 });
  check(`${engine}: the history is kept in localStorage under jf:scratchpad:history`,
    Array.isArray(stored) && stored[0] === "2 + 3" && stored[stored.length - 1] === "int twice(int n) {\n}", stored);
  // It keeps the last 100 entries.
  for (let i = 1; i <= 105; i++) await type(`entry ${i}`);
  await waitText("echo: entry 105\n");
  const hundred = await t.page.evaluate(() => JSON.parse(localStorage.getItem("jf:scratchpad:history"))) ?? [];
  check(`${engine}: and keeps the last 100 entries`, hundred.length === 100 && hundred[0] === "entry 6" && hundred[99] === "entry 105",
    { length: hundred.length, first: hundred[0], last: hundred[hundred.length - 1] });

  // The panel answers no command itself: each goes to the front end, which answers /help with the course's own help
  // (J2) and a command it does not offer, or does not know, in its own words.
  before = await text();
  for (const line of ["/help", "/help intro", "/open", "/save notes.jsh", "/edit 1"]) await type(line);
  await type("/foo");
  await waitText("Invalid command: /foo\n|  Type /help for help.\n");
  const commands = (await text()).slice(before.length);
  check(`${engine}: the panel answers no command itself: /help, /help intro, /open, /save, /edit and an unknown one each get the front end's words alone`,
    commands === "\njshell> /help\n|  This is the course's Java scratchpad. Type a piece of Java and press Enter to run it.\n"
      + "\njshell> /help intro\n|  The scratchpad runs Java one piece at a time: an expression shows its value,\n"
      + "\njshell> /open\n|  /open is not available in this scratchpad. Type /help to see what is.\n"
      + "\njshell> /save notes.jsh\n|  /save is not available in this scratchpad. Type /help to see what is.\n"
      + "\njshell> /edit 1\n|  /edit is not available in this scratchpad. Type /help to see what is.\n"
      + "\njshell> /foo\n|  Invalid command: /foo\n|  Type /help for help.\n", commands);

  // The prompt is the front end's: each feedback mode has its own, and its own continuation, and the panel echoes
  // each line after the prompt the last answer gave and shows it on the caret.
  const caret = () => panel.locator(".caret").textContent();
  const answered = async (line) => { await type(line); await waitState(["ready"]); };
  before = await text();
  await answered("/set feedback concise");
  const carets = [await caret()];
  await answered("hello");
  await answered("/set feedback silent");
  carets.push(await caret());
  await answered("int twice(int n) {");
  carets.push(await caret());
  await answered("}");
  await answered("/set feedback normal");
  carets.push(await caret());
  const modes = (await text()).slice(before.length);
  check(`${engine}: each line is echoed after the prompt the front end gave last, in each feedback mode and at its continuation, and the caret shows it`,
    modes === "\njshell> /set feedback concise\njshell> hello\necho: hello\njshell> /set feedback silent\n-> int twice(int n) {\n>> }\n"
      + "|  created method twice(int)\n-> /set feedback normal\n|  Feedback mode: normal\n"
      && JSON.stringify(carets) === JSON.stringify(["jshell>", "->", ">>", "jshell>"]), { modes, carets });
  // A front end that gives no prompt gets none made up.
  before = await text();
  await answered("no prompt");
  const bare = await caret();
  await answered("hello");
  check(`${engine}: an answer that gives no prompt gets none made up: the next line is echoed bare, and the caret is empty`,
    (await text()).slice(before.length) === "\njshell> no prompt\necho: no prompt\nhello\necho: hello\n" && bare === "" && await caret() === "jshell>",
    { got: (await text()).slice(before.length), bare });

  // /reset and /reload: Ristretto's worker starts a fresh VM inside the one request (no phase event), and the client
  // says jshell is starting as it sends the line; the panel says a fresh jshell is starting while it waits, with the
  // timer (D54) but not the first open's words, whose times a restart does not take. The real jshell prints no banner
  // after a restart, and neither does the panel.
  const refocused = [];
  for (const [line, said] of [["/reset", "|  Resetting state.\n"], ["/reload", "|  Restarting and restoring state.\n"]]) {
    before = await text();
    await type(line);
    await t.page.waitForTimeout(400);
    const restarting = { state: await state(), note: await panel.locator(".scratch-note").textContent() };
    await blurField();
    await waitState(["ready"]);
    refocused.push(await fieldFocused());
    check(`${engine}: ${line} says a fresh jshell is starting while it waits, timer and no time claimed, then answers, with no second banner`,
      restarting.state === "busy" && RESTARTING.test(restarting.note)
        && (await text()).slice(before.length) === `\njshell> ${line}\n${said}` && await panel.locator(".scratch-note").isHidden()
        && await caret() === "jshell>", { restarting, got: (await text()).slice(before.length) });
  }
  check(`${engine}: after an entry (/reset, then /reload, the field blurred while each ran) the panel focuses its input again`,
    refocused.length === 2 && refocused.every(Boolean), refocused);

  // The way out of an unfinished snippet, the session kept: Escape, Ctrl+C with nothing selected, or Cancel, which
  // shows only at ...> (a phone has neither key). The front end drops the lines not yet finished; the stand-in counts
  // $1 again since /reset.
  const caretIs = (c) => until(t, (c) => document.querySelector("#scratchpad .caret").textContent === c
    && document.getElementById("scratchpad").dataset.state === "ready", c, 5000);
  const waitEnd = (tail) => until(t, (n) => document.querySelector("#scratchpad .transcript").textContent.endsWith(n), tail, 5000);
  before = await text();
  const cancelAtPrompt = await panel.locator(".scratch-cancel").isHidden();
  await type("int twice(int n) {");
  await caretIs("   ...>");
  const cancelAtMore = await panel.locator(".scratch-cancel").isVisible();
  await input.press("Escape");
  const back1 = await caretIs("jshell>");
  const cancelAfter = await panel.locator(".scratch-cancel").isHidden();
  await type("2 + 3");
  await waitEnd("\njshell> 2 + 3\n$1 ==> 5\n");
  check(`${engine}: at ...> Escape drops the unfinished lines: the caret is jshell> again, and the next entry runs on its own`,
    back1 && (await text()).slice(before.length) === "\njshell> int twice(int n) {\n   ...> ^C\n\njshell> 2 + 3\n$1 ==> 5\n",
    { back1, got: (await text()).slice(before.length) });
  check(`${engine}: Cancel shows at ...>, and only there`, cancelAtPrompt && cancelAtMore && cancelAfter, { cancelAtPrompt, cancelAtMore, cancelAfter });
  before = await text();
  await type("int twice(int n) {");
  await caretIs("   ...>");
  await input.press("Control+c");
  const back2 = await caretIs("jshell>");
  await type("int twice(int n) {");
  await caretIs("   ...>");
  await blurField(); // a click on a button takes the focus in Chromium and Firefox, not in WebKit: none has it here
  await panel.locator(".scratch-cancel").click({ timeout: 5000 }).catch(() => {});
  const back3 = await caretIs("jshell>");
  const cancelFocus = await fieldFocused();
  await type("2 + 3");
  await waitEnd("\njshell> 2 + 3\n$2 ==> 5\n");
  check(`${engine}: Ctrl+C and the Cancel button drop them too`, back2 && back3 && (await text()).slice(before.length)
    === "\njshell> int twice(int n) {\n   ...> ^C\n\njshell> int twice(int n) {\n   ...> ^C\n\njshell> 2 + 3\n$2 ==> 5\n",
    { back2, back3, got: (await text()).slice(before.length) });
  check(`${engine}: and after a mouse-clicked Cancel, the panel focuses its input again`, back3 && cancelFocus, { back3, cancelFocus });

  // By now the transcript is taller than the phone: the sheet still keeps within its width and to 60% of its height,
  // so its header (Stop, New session, Close) stays on screen.
  const fits = await t.page.evaluate(() => {
    const r = document.getElementById("scratchpad").getBoundingClientRect();
    return { top: Math.round(r.top), right: Math.round(r.right), height: Math.round(r.height), innerW: innerWidth, innerH: innerHeight };
  });
  check(`${engine}: the sheet keeps within the phone's width and to 60% of its height`,
    fits.right <= fits.innerW && fits.height <= fits.innerH * 0.6 + 1, fits);
  // And the page behind it still scrolls to its end: the Previous and Next links clear the open sheet.
  const pager = await t.page.evaluate(async () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const n = document.querySelector(".pager"), r = document.getElementById("scratchpad").getBoundingClientRect();
    return { pagerBottom: n ? Math.round(n.getBoundingClientRect().bottom) : null, sheetTop: Math.round(r.top), scrollY: Math.round(scrollY) };
  });
  check(`${engine}: scrolled to its end, the page's Previous and Next links stay above the open sheet`,
    pager.pagerBottom != null && pager.pagerBottom <= pager.sheetTop, pager);

  // A runaway entry: Stop shows while it runs, the input stays read-only (not disabled), and Stop terminates the
  // worker at once; the ending is said in plain words and a fresh session starts by itself (D49).
  const s1 = await session();
  await type("spin");
  await waitState(["busy"]);
  await t.page.waitForTimeout(300);
  const busy = { stop: await panel.locator(".scratch-stop").isVisible(), editable: await input.isEditable(), disabled: await input.isDisabled() };
  const clicked = await t.page.evaluate(() => performance.now());
  await panel.locator(".scratch-stop").click();
  const fresh = await waitSession(s1 + 1);
  const lag = await t.page.evaluate(([k, at]) => window.jfWorkers[k].terminated == null ? null : window.jfWorkers[k].terminated - at, [s1 - 1, clicked]);
  check(`${engine}: while an entry runs, Stop shows and the input is read-only, not disabled`,
    busy.stop && !busy.editable && !busy.disabled, busy);
  check(`${engine}: Stop terminates the worker at once`, lag != null && lag < 1000, lag);
  check(`${engine}: says so in plain words, and a fresh session starts by itself`,
    fresh && (await text()).includes("\njshell> spin\nStopped. The session ended, and its variables and methods are gone.\n" + BANNER)
      && await panel.getAttribute("data-ended") === "stopped" && (await text()).endsWith(BANNER), (await text()).slice(-300));
  check(`${engine}: the fresh session is a new worker`, await t.page.evaluate(() => window.jfWorkers.length) === s1 + 1, await t.page.evaluate(() => window.jfWorkers.length));

  // Everything a session prints reaches the page once per animation frame: 16,352 lines printed by a loop, arriving
  // as 16,352 events at once, are on screen within seconds, and the page stays live.
  before = await text();
  const flooded = Date.now();
  await type("flood");
  const landed = await until(t, (n) => document.getElementById("scratchpad").dataset.state === "ready"
    && document.querySelector("#scratchpad .transcript").textContent.split("flood line\n").length - 1 === n, 16352, 10000);
  const floodMs = Date.now() - flooded;
  check(`${engine}: 16,352 lines printed at once are on screen, whole, within seconds of Enter`,
    landed && floodMs < 10000 && (await text()).slice(before.length).startsWith("\njshell> flood\nflood line\n"), { landed, floodMs });
  // stderr is a program's own System.err (the front end's errors come on stdout), shown in the error style.
  await type('System.err.println("oops")');
  await waitText("oops\n");
  const styled = await t.page.evaluate(() => [...document.querySelectorAll("#scratchpad .transcript .err")].pop()?.textContent ?? null);
  check(`${engine}: a program's System.err shows in the error style`,
    styled === "oops\n" && (await text()).endsWith('\njshell> System.err.println("oops")\noops\n'), { styled, tail: (await text()).slice(-80) });

  // The transcript keeps its newest 2,000,000 characters, from the start of a line: three entries of about 900,000.
  for (const n of [1, 2, 3]) { await type(`half ${n}`); await waitText(`half ${n} line 899 `); }
  await t.page.waitForTimeout(300);
  const kept = await t.page.evaluate(() => {
    const s = document.querySelector("#scratchpad .transcript").textContent;
    return { length: s.length, head: s.slice(0, 20), oldest: s.includes("half 1 line 000 "), newest: s.trimEnd().endsWith("y".repeat(980)) && s.includes("half 3 line 899 ") };
  });
  check(`${engine}: the transcript keeps its newest 2,000,000 characters, from the start of a line`,
    kept.length <= 2_000_000 && kept.length > 1_900_000 && kept.newest && !kept.oldest && /^half 1 line \d{3} /.test(kept.head), kept);
  // The cut can land in a node with no newline of its own, and the line it is part of ends in a later node: a cancel's
  // echo ("   ...> " and what was typed, unsent) is one such node, its line ended by the ^C after it. New session
  // leaves jshell's banner alone in the transcript; then "int f() {" (39 characters, with the cancel's echo and ^C
  // after it) and three entries, each one output event, whose echoes are 21 characters each ("\n", then
  // "jshell> fill 666641\n"): 2,000,024 characters after the banner, the last entry's output in one flush, so the cut
  // lands 5 characters into the cancel's echo, inside its "   ...> ". The transcript then starts at the next line, the
  // first entry's echo: 1,999,985 characters kept, never the ^C that ended the line cut into.
  const trimSession = await session();
  await panel.locator(".scratch-new").click();
  const renewedForTrim = await waitSession(trimSession + 1);
  await type("int f() {");
  await caretIs("   ...>");
  await input.fill("return 1;");
  await input.press("Escape");
  const canceledForTrim = await caretIs("jshell>");
  for (const n of [666_641, 666_641, 666_640]) {
    const readies = await t.page.evaluate(() => window.jfAtReady.length);
    await type(`fill ${n}`);
    await until(t, (k) => window.jfAtReady.length > k, readies);
  }
  const lineCut = await t.page.evaluate(() => {
    const s = document.querySelector("#scratchpad .transcript").textContent;
    return { length: s.length, head: s.slice(0, 30) };
  });
  check(`${engine}: a cut inside a line that a later node ends (a cancel's echo, ended by its ^C) drops the rest of that line: the transcript starts at the start of a line`,
    renewedForTrim && canceledForTrim && lineCut.length === 1_999_985 && lineCut.head === "\njshell> fill 666641\n" + "w".repeat(9), lineCut);

  // The other endings, each in the client's words and never the engine's own; after a cap, memory used up or a
  // crash (in an entry, or between entries, which nothing is waiting on) a fresh session starts by itself, after /exit
  // the reader starts one.
  let s = await session();
  await type("over");
  check(`${engine}: output past the cap ends the session, says why, and a fresh one starts`,
    await waitSession(s + 1) && (await text()).includes("This entry printed more than the scratchpad can show, so it was stopped.")
      && await panel.getAttribute("data-ended") === "output-limit", (await text()).slice(-300));
  s = await session();
  await type("oom");
  check(`${engine}: memory used up ends the session, says so, and a fresh one starts`,
    await waitSession(s + 1) && (await text()).includes("\njshell> oom\nl ==> []\nThis session ran out of memory, so it ended")
      && await panel.getAttribute("data-ended") === "out-of-memory", (await text()).slice(-500));
  s = await session();
  await type("die");
  check(`${engine}: an engine error ends the session in plain words, not the engine's message`,
    await waitSession(s + 1) && (await text()).includes("The scratchpad's Java engine failed.") && !(await text()).includes("unreachable")
      && await panel.getAttribute("data-ended") === "crashed", (await text()).slice(-300));
  s = await session();
  await type("die later");
  check(`${engine}: a worker that fails between entries is said in plain words too, and a fresh session starts`,
    await waitSession(s + 1) && (await text()).includes("\njshell> die later\nlater\nThe scratchpad's Java engine failed.")
      && await panel.getAttribute("data-ended") === "crashed", (await text()).slice(-300));
  s = await session();
  await type("/exit");
  const exited = await waitText("|  Goodbye\nThis session has ended (System.exit or /exit).\n");
  await t.page.waitForTimeout(2500); // an absence: longer than the stand-in's boot, so a session started by itself would be ready
  check(`${engine}: /exit ends the session in plain words, after jshell's goodbye, and no new one starts by itself`,
    exited && await state() === "ended" && await session() === s && await panel.getAttribute("data-ended") === "exited"
      && await input.isEditable(), { exited, state: await state(), session: await session(), tail: (await text()).slice(-200) });
  // Six endings so far (Stop, the cap, memory, the engine twice, /exit): data-state turned ended for each only once the
  // ending's words were on screen (jfAtEnded holds the transcript's end at that moment).
  const atEnded = await t.page.evaluate(() => window.jfAtEnded);
  check(`${engine}: data-state says ended only once the ending's words are on screen`,
    atEnded.length === 6 && atEnded.every((end) => /(are gone\.|fills it up\.|\(System\.exit or \/exit\)\.)\n$/.test(end)), atEnded);
  await type("2 + 3");
  check(`${engine}: Enter after /exit starts a new session and sends the line`,
    await waitSession(s + 1) && await until(t, (b) => document.querySelector("#scratchpad .transcript").textContent
      .endsWith(b + "\njshell> 2 + 3\n$1 ==> 5\n"), BANNER, 5000), (await text()).slice(-200));

  // Closing the panel leaves the session running; New session clears the transcript and starts again.
  await panel.locator(".scratch-close").click();
  const closed = { panel: await panel.isHidden(), tab: await tab.isVisible(), state: await state() };
  await tab.click();
  check(`${engine}: closing shows the tab and keeps the session; reopening shows the same transcript`,
    closed.panel && closed.tab && closed.state === "ready" && (await text()).includes("\njshell> 2 + 3\n$1 ==> 5\n"), closed);
  s = await session();
  await panel.locator(".scratch-new").click();
  check(`${engine}: New session clears the transcript and starts a fresh session`,
    await waitSession(s + 1) && (await text()) === BANNER, (await text()).slice(0, 200));
  // New session pressed while a cancel is on its way (the stand-in answers this snippet's cancel after a second): the
  // stopped cancel's ending is not said in the new transcript, and no second session starts.
  await type("int slowCancel() {");
  await caretIs("   ...>");
  s = await session();
  await input.press("Escape");
  await panel.locator(".scratch-new").click();
  const renewed = await waitSession(s + 1);
  await t.page.waitForTimeout(1500); // an absence: past the slow cancel's second, a second session would be starting
  check(`${engine}: New session pressed while a cancel is on its way starts one fresh session, its transcript jshell's banner alone`,
    renewed && (await text()) === BANNER && await session() === s + 1 && await state() === "ready",
    { renewed, session: await session(), state: await state(), text: (await text()).slice(0, 300) });

  // 390 px with the panel open and a long transcript: nothing scrolls sideways but the transcript and the input, and
  // code never wraps (Ruling 22): a long entry stays one line in the transcript and in the input, each scrolling
  // inside itself. The page's own width cannot see inside a fixed sheet, so the sheet, the transcript's last entry
  // and the input are each measured, and the transcript must actually move when scrolled.
  await type("half 1");
  await waitText("half 1 line 899 ");
  const LONG = `String s = "${"a line wider than a phone held upright ".repeat(4)}"`;
  await type(LONG);
  await waitText(`echo: ${LONG}\n`);
  await input.fill(LONG);
  const wide = await t.page.evaluate(() => {
    const p = document.getElementById("scratchpad"), tr = p.querySelector(".transcript"), ta = p.querySelector(".entry textarea");
    const typed = [...tr.querySelectorAll(".typed")].pop();
    const range = document.createRange();
    range.selectNodeContents(typed);
    const s = getComputedStyle(ta);
    tr.scrollLeft = 100000; // only a transcript that scrolls sideways moves
    return { page: document.documentElement.scrollWidth, innerW: innerWidth, trMoved: tr.scrollLeft > 0,
      sheetW: [p.scrollWidth, p.clientWidth, Math.round(p.getBoundingClientRect().right)],
      typedLines: new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size,
      taLines: Math.round((ta.scrollHeight - parseFloat(s.paddingTop) - parseFloat(s.paddingBottom)) / parseFloat(s.lineHeight)), taScroll: ta.scrollWidth > ta.clientWidth };
  });
  check(`${engine}: at 390 px with the panel open neither the page nor the sheet scrolls sideways`,
    wide.page <= 390 && wide.sheetW[0] <= wide.sheetW[1] && wide.sheetW[2] <= wide.innerW, wide);
  check(`${engine}: a long entry stays one line in the transcript, which scrolls sideways`, wide.typedLines === 1 && wide.trMoved, wide);
  check(`${engine}: and one line in the input, which scrolls sideways`, wide.taLines === 1 && wide.taScroll, wide);
  check(`${engine}: no request left the page's origin`, t.offsite.length === 0, t.offsite);
  check(`${engine}: no page error`, t.errors.length === 0, t.errors);

  // The panel is shut on every page load, the history comes back, and still nothing downloads before an open. Opened,
  // the second page downloads only the manifest: jshell's four files come from Cache Storage, checked again.
  const p2 = await t.context.newPage();
  const p2errors = [];
  p2.on("pageerror", (e) => p2errors.push(String(e)));
  const seen = t.requests.length;
  await p2.goto(`${t.origin}/${PAGE}`);
  await p2.waitForFunction(() => document.documentElement.dataset.java && document.documentElement.dataset.scratchpad, null, { timeout: 10000 })
    .catch(() => {});
  const again = await p2.evaluate(() => ({ hidden: document.getElementById("scratchpad").hidden, state: document.getElementById("scratchpad").dataset.state }));
  check(`${engine}: after a reload the panel is shut and nothing of the scratchpad has downloaded`,
    again.hidden && again.state === "shut" && !t.requests.slice(seen).some((u) => SCRATCH_URL.test(u)), { again, requests: t.requests.slice(seen) });
  const opening = t.requests.length;
  await p2.locator(".scratch-tab").click();
  await p2.waitForFunction(() => document.getElementById("scratchpad").dataset.state === "ready", null, { timeout: 10000 });
  const second = t.requests.slice(opening).filter((u) => SCRATCH_URL.test(u)).map((u) => u.replace(/.*\/scratchpad\//, ""));
  check(`${engine}: and opened there, it downloads only the manifest: jshell's files come from the browser's cache`,
    JSON.stringify(second) === JSON.stringify(["manifest.json"]), second);
  await p2.locator("#scratchpad textarea").press("ArrowUp");
  check(`${engine}: and Up brings back the last entry from before the reload`, await p2.locator("#scratchpad textarea").inputValue() === LONG, await p2.locator("#scratchpad textarea").inputValue());
  check(`${engine}: no page error after the reload`, p2errors.length === 0, p2errors);
  await t.close();

  // D69: iOS raises its on-screen keyboard only for a focus the reader's own tap gives, and a tap on a field that
  // already has focus gives none, so on a touch device the panel never focuses its input itself and never makes it
  // read-only: the reader's tap is the only focus. A touch device is one where (hover: none) and (pointer: coarse)
  // matches; Playwright's hasTouch makes it match in all three engines (probed: Chromium, WebKit and Firefox alike;
  // isMobile alone, as web/test/scratchpad.mjs and page.mjs use it, matches in none), so these checks run in each.
  // Recorded in the page: each focus and blur of the input; the input's readOnly each time data-state changes; and
  // each request the page posts to the stand-in ("(boot)", "(cancel)", or the line). The reader dismissing the
  // keyboard (iOS's Done) is the field's blur(); a tap on Cancel blurs the field in each engine (probed).
  t = await open(engine, site, PAGE, { viewport: { width: 390, height: 844 }, hasTouch: true }, standInScript(2000,
    'window.jfFocus = [];\nfor (const type of ["focus", "blur"]) document.addEventListener(type, (e) => {\n' +
    '  if (e.target.matches && e.target.matches("#scratchpad textarea")) window.jfFocus.push(type);\n}, true);\n' +
    'window.jfReadOnly = [];\ndocument.addEventListener("DOMContentLoaded", () => {\n' +
    '  const p = document.getElementById("scratchpad");\n  if (!p) return;\n' +
    '  new MutationObserver(() => window.jfReadOnly.push([p.dataset.state, p.querySelector(".entry textarea").readOnly]))\n' +
    '    .observe(p, { attributes: true, attributeFilter: ["data-state"] });\n});\n' +
    'window.jfSent = [];\n{\n  const post = Worker.prototype.postMessage;\n  Worker.prototype.postMessage = function (m, ...rest) {\n' +
    '    if (this.jf) window.jfSent.push(m.assets ? "(boot)" : m.request.operation === "cancel" ? "(cancel)" : m.request.source);\n' +
    '    return post.call(this, m, ...rest);\n  };\n}', 2000));
  await ready(t);
  const field = t.page.locator("#scratchpad textarea");
  const panelT = t.page.locator("#scratchpad");
  const textT = async () => (await panelT.locator(".transcript").textContent()) ?? "";
  const stateT = () => panelT.getAttribute("data-state");
  const focusNow = () => t.page.evaluate(() => ({ events: window.jfFocus.splice(0),
    focused: document.activeElement === document.querySelector("#scratchpad textarea") }));
  const sent = () => t.page.evaluate(() => window.jfSent.length);
  const sentSince = (n) => t.page.evaluate((n) => window.jfSent.slice(n), n);
  const touchDevice = await t.page.evaluate(() => matchMedia("(hover: none) and (pointer: coarse)").matches);
  check(`${engine}: with touch, the context is a touch device: (hover: none) and (pointer: coarse) matches (D69)`, touchDevice, touchDevice);
  const editable = {};
  await t.page.locator(".scratch-tab").tap({ timeout: 5000 }).catch(() => {});
  editable.loading = { state: await stateT(), editable: await field.isEditable() };
  const booted = await waitState(["ready"]);
  const afterBoot = { booted, ...await focusNow() };
  check(`${engine}: on a touch device, opening and the boot leave the input unfocused: the panel never focuses it itself (D69)`,
    booted && afterBoot.events.length === 0 && !afterBoot.focused, afterBoot);
  // The reader taps the input and types; Enter enters the line.
  await field.tap({ timeout: 5000 }).catch(() => {});
  const tapped = (await focusNow()).focused;
  before = await textT();
  await t.page.keyboard.type("2 + 3");
  await t.page.keyboard.press("Enter");
  const entered = await until(t, (n) => document.querySelector("#scratchpad .transcript").textContent.endsWith(n), "\njshell> 2 + 3\n$1 ==> 5\n", 5000);
  check(`${engine}: and the reader's tap on the input focuses it, and a line typed there goes with Enter`,
    tapped && entered && (await textT()).slice(before.length) === "\njshell> 2 + 3\n$1 ==> 5\n", { tapped, entered, got: (await textT()).slice(before.length) });
  // A /reset keeps jshell busy for the stand-in's 2 s: the input stays editable, a line typed and entered meanwhile
  // sends nothing, and when the reader has dismissed the keyboard the panel does not take the focus back after it.
  before = await textT();
  let mark = await sent();
  await t.page.keyboard.type("/reset");
  await t.page.keyboard.press("Enter");
  await waitState(["busy"], 2000);
  editable.busy = { state: await stateT(), editable: await field.isEditable() };
  await t.page.keyboard.type("2 + 3");
  await t.page.keyboard.press("Enter");
  const busyAtEnter = await stateT();
  await focusNow();
  await field.blur();
  await waitState(["ready"]);
  await t.page.waitForTimeout(300); // an absence: a focus after the answer comes within a task of it
  const afterEntry = await focusNow();
  const sentBusy = await sentSince(mark);
  check(`${engine}: on a touch device, Enter while jshell is busy sends nothing`,
    busyAtEnter === "busy" && JSON.stringify(sentBusy) === '["/reset"]' && (await textT()).slice(before.length) === "\njshell> /reset\n|  Resetting state.\n",
    { busyAtEnter, sentBusy, got: (await textT()).slice(before.length) });
  check(`${engine}: and after an entry the panel does not focus the input the reader left`,
    JSON.stringify(afterEntry.events) === '["blur"]' && !afterEntry.focused, afterEntry);
  // The line typed and entered while jshell was busy waits in the field for Enter.
  const typedBusy = await field.inputValue({ timeout: 5000 }).catch(() => null);
  check(`${engine}: and the line typed while jshell was busy is still in the field, waiting for Enter`, typedBusy === "2 + 3", typedBusy);
  // New session: jshell loads again for 2 s; the reader taps the input meanwhile, types a line and presses Enter, which
  // sends nothing: the transcript is jshell's banner alone.
  await field.tap({ timeout: 5000 }).catch(() => {});
  await field.fill("", { timeout: 5000 }).catch(() => {}); // what was typed while busy
  mark = await sent();
  await panelT.locator(".scratch-new").tap({ timeout: 5000 }).catch(() => {});
  await field.tap({ timeout: 5000 }).catch(() => {});
  await t.page.keyboard.type("2 + 3");
  await t.page.keyboard.press("Enter");
  const loadingAtEnter = await stateT();
  await waitState(["ready"]);
  const sentLoading = await sentSince(mark);
  check(`${engine}: on a touch device, Enter while jshell is loading sends nothing`,
    loadingAtEnter === "loading" && JSON.stringify(sentLoading) === '["(boot)"]' && (await textT()) === BANNER,
    { loadingAtEnter, sentLoading, text: (await textT()).slice(0, 300) });
  const typedLoading = await field.inputValue({ timeout: 5000 }).catch(() => null);
  check(`${engine}: and the line typed while jshell was loading is still in the field, waiting for Enter`, typedLoading === "2 + 3", typedLoading);
  // At ...>, the reader taps Cancel, which blurs the field: the panel does not focus it again after the cancel.
  await field.tap({ timeout: 5000 }).catch(() => {});
  await field.fill("", { timeout: 5000 }).catch(() => {}); // what was typed while loading
  await t.page.keyboard.type("int twice(int n) {");
  await t.page.keyboard.press("Enter");
  const more = await until(t, () => document.querySelector("#scratchpad .caret").textContent === "   ...>"
    && document.getElementById("scratchpad").dataset.state === "ready", null, 5000);
  await focusNow();
  await panelT.locator(".scratch-cancel").tap({ timeout: 5000 }).catch(() => {});
  const back = await until(t, () => document.querySelector("#scratchpad .caret").textContent === "jshell>"
    && document.getElementById("scratchpad").dataset.state === "ready", null, 5000);
  await t.page.waitForTimeout(300); // an absence: a focus after the cancel comes within a task of it
  const afterCancel = { more, back, ...await focusNow() };
  check(`${engine}: and after a cancel the panel does not focus the input either`,
    more && back && !afterCancel.events.includes("focus") && !afterCancel.focused, afterCancel);
  const readOnly = await t.page.evaluate(() => window.jfReadOnly);
  const statesSeen = new Set(readOnly.map(([s]) => s));
  check(`${engine}: on a touch device the input is never read-only: while loading, ready and busy`,
    ["loading", "ready", "busy"].every((s) => statesSeen.has(s)) && readOnly.every(([, r]) => r === false)
      && editable.loading.state === "loading" && editable.loading.editable && editable.busy.state === "busy" && editable.busy.editable,
    { readOnly, editable });
  // Enter at an ended session starts a new one first; when that start fails, the line comes back, into an empty field
  // only: the field stays editable while jshell starts, and a line the reader typed meanwhile stays. The next
  // scratchpad worker made is one that never answers, failed on cue by an error event (as a worker whose script throws
  // gives one): no timing is involved.
  await field.tap({ timeout: 5000 }).catch(() => {});
  await field.fill("", { timeout: 5000 }).catch(() => {});
  await t.page.keyboard.type("/exit");
  await t.page.keyboard.press("Enter");
  const exitedT = await until(t, () => document.getElementById("scratchpad").dataset.ended === "exited", null, 5000);
  const failedStart = async (meanwhile) => {
    await t.page.evaluate(() => {
      const Made = window.Worker;
      window.jfHung = null;
      window.Worker = class extends Made {
        constructor(u, options) {
          super(URL.createObjectURL(new Blob(["self.onmessage = () => {};"], { type: "text/javascript" })), options);
          window.jfHung = this;
          window.Worker = Made; // only the next one
        }
      };
    });
    const n = Number(await panelT.getAttribute("data-session")) + 1;
    await field.fill("", { timeout: 5000 }).catch(() => {});
    await t.page.keyboard.type("2 + 3");
    await t.page.keyboard.press("Enter");
    const starting = await until(t, (n) => window.jfHung != null && document.getElementById("scratchpad").dataset.state === "loading"
      && document.getElementById("scratchpad").dataset.session === String(n), n, 5000);
    if (meanwhile) await t.page.keyboard.type(meanwhile);
    await t.page.evaluate(() => window.jfHung?.dispatchEvent(new ErrorEvent("error", { message: "the boot failed" })));
    const failed = await until(t, (n) => document.getElementById("scratchpad").dataset.state === "ended"
      && document.getElementById("scratchpad").dataset.session === String(n), n, 5000);
    return { starting, failed, ended: await panelT.getAttribute("data-ended"), field: await field.inputValue({ timeout: 5000 }).catch(() => null) };
  };
  const typedOver = await failedStart("int y = 4");
  const givenBack = await failedStart("");
  check(`${engine}: on a touch device, a start that fails after Enter at an ended session keeps the line the reader typed meanwhile`,
    exitedT && typedOver.starting && typedOver.failed && typedOver.ended === "failed-to-load" && typedOver.field === "int y = 4", typedOver);
  check(`${engine}: and gives the entered line back when the field is empty`,
    givenBack.starting && givenBack.failed && givenBack.ended === "failed-to-load" && givenBack.field === "2 + 3", givenBack);
  check(`${engine}: no page error with touch`, t.errors.length === 0, t.errors);
  await t.close();

  // The backstop: an entry that runs past the client's deadline (shortened here by the page's test hook) ends in
  // plain words, and a fresh session starts. The hook also shortens the boot deadline, which a /reset gets, below the
  // stand-in's 3 s restart here.
  t = await open(engine, site, PAGE, {}, standInScript(0, "window.jfScratchpadLimits = { deadlineMs: 2000, bootDeadlineMs: 2000 };", 3000));
  await ready(t);
  await t.page.locator(".scratch-tab").click();
  await t.page.waitForFunction(() => document.getElementById("scratchpad").dataset.state === "ready", null, { timeout: 10000 });
  await t.page.locator("#scratchpad textarea").fill("spin");
  await t.page.locator("#scratchpad textarea").press("Enter");
  const backstop = await until(t, () => document.getElementById("scratchpad").dataset.session === "2"
    && document.getElementById("scratchpad").dataset.state === "ready", null, 6000);
  const said = (await t.page.locator("#scratchpad .transcript").textContent()) ?? "";
  check(`${engine}: an entry past the deadline ends the session in plain words, and a fresh one starts`,
    backstop && said.includes("This entry ran for 2 seconds without finishing, so it was stopped.")
      && await t.page.locator("#scratchpad").getAttribute("data-ended") === "timeout", said.slice(-300));
  // A restart that does not answer by its deadline is a failed load: said in the client's words, and no session
  // starts by itself (another restart might not answer either); Enter starts one, from the files already checked.
  // Bounded: an input still read-only (the entry above never ended) fails the checks below, not the script.
  const typeHere = async (line) => {
    await t.page.locator("#scratchpad textarea").fill(line, { timeout: 5000 }).catch(() => {});
    await t.page.locator("#scratchpad textarea").press("Enter", { timeout: 5000 }).catch(() => {});
  };
  await typeHere("/reset");
  const gaveUp = await until(t, () => document.getElementById("scratchpad").dataset.ended === "failed-to-load", null, 6000);
  await t.page.waitForTimeout(1000); // an absence: a session started by itself would be ready by now
  const afterRestart = { gaveUp, state: await t.page.locator("#scratchpad").getAttribute("data-state"),
    session: await t.page.locator("#scratchpad").getAttribute("data-session"),
    tail: ((await t.page.locator("#scratchpad .transcript").textContent()) ?? "").slice(-160) };
  check(`${engine}: a restart that does not answer by its deadline ends in plain words, and no session starts by itself`,
    gaveUp && afterRestart.state === "ended" && afterRestart.session === "2" && afterRestart.tail.endsWith("\njshell> /reset\n|  Resetting state.\n"
      + "The scratchpad could not start: after /reset, jshell did not answer within 2 seconds.\n"), afterRestart);
  await typeHere("2 + 3");
  const resumed = await until(t, () => document.getElementById("scratchpad").dataset.session === "3"
    && document.querySelector("#scratchpad .transcript").textContent.endsWith("\njshell> 2 + 3\n$1 ==> 5\n"), null, 6000);
  check(`${engine}: and Enter starts a new session, downloading nothing again`,
    resumed && zips(t) === 1, { resumed, zips: zips(t) });
  await t.close();

  // Storage refused (a private window, blocked storage: localStorage and Cache Storage both throw): the panel still
  // works, with no page error, and a fresh session does not download jshell again (the client keeps what it checked).
  t = await open(engine, site, PAGE, {}, standInScript(0, 'for (const m of ["getItem", "setItem", "removeItem"]) ' +
    'Storage.prototype[m] = () => { throw new DOMException("blocked", "SecurityError"); };\n' +
    'for (const m of ["keys", "open", "match", "has", "delete"]) ' +
    'CacheStorage.prototype[m] = () => Promise.reject(new DOMException("blocked", "SecurityError"));'));
  // Bounded: a panel that throws while it is wired never says ready (wire.js sets data-scratchpad to "failed"), and
  // must fail here, not hang the script.
  const wired = await until(t, () => document.documentElement.dataset.scratchpad === "ready", null, 10000);
  let ran = false, again2 = false;
  if (wired) {
    await t.page.locator(".scratch-tab").click();
    await until(t, () => document.getElementById("scratchpad").dataset.state === "ready", null, 10000);
    await t.page.locator("#scratchpad textarea").fill("2 + 3");
    await t.page.locator("#scratchpad textarea").press("Enter");
    ran = await until(t, () => document.querySelector("#scratchpad .transcript").textContent.includes("$1 ==> 5"), null, 5000);
    await t.page.locator("#scratchpad textarea").fill("spin");
    await t.page.locator("#scratchpad textarea").press("Enter");
    await until(t, () => document.getElementById("scratchpad").dataset.state === "busy", null, 5000);
    await t.page.locator("#scratchpad .scratch-stop").click();
    again2 = await until(t, () => document.getElementById("scratchpad").dataset.session === "2"
      && document.getElementById("scratchpad").dataset.state === "ready", null, 10000);
  }
  const zipsAsked = zips(t);
  check(`${engine}: with storage refused, the panel still runs an entry`, wired && ran, { wired, ran });
  check(`${engine}: and a fresh session after Stop downloads nothing again`, again2 && zipsAsked === 1, { again2, zips: zipsAsked });
  check(`${engine}: and raises no page error`, t.errors.length === 0, t.errors);
  await t.close();

  // A start that rejects without ending its session is a mistake in the code (scratchpad.mjs's begin), and reaches the
  // page's error reporting: here posting to jshell's worker throws a planted error, so the client's start() rejects
  // while its session is still loading. Bounded: an error that never comes fails the check.
  const PLANTED = "jf: a planted failure to post to jshell's worker";
  t = await open(engine, site, PAGE, {}, standInScript(0, "{\n  const post = Worker.prototype.postMessage;\n" +
    "  Worker.prototype.postMessage = function (m, ...rest) {\n" +
    `    if (this.jf) throw new Error(${JSON.stringify(PLANTED)});\n    return post.call(this, m, ...rest);\n  };\n}`));
  await ready(t);
  await t.page.locator(".scratch-tab").click();
  for (const end = Date.now() + 5000; !t.errors.some((e) => e.includes(PLANTED)) && Date.now() < end;) await t.page.waitForTimeout(100);
  check(`${engine}: a start that rejects without ending its session reaches the page's error reporting`,
    t.errors.some((e) => e.includes(PLANTED)), t.errors);
  await t.close();

  // A download cut short is never handed to jshell: the panel says so, no worker is made, and nothing starts again
  // by itself (a download that keeps failing is fetched twice, the second time past the HTTP cache, and no more).
  t = await open(engine, cut, PAGE, {}, standInScript(0));
  await ready(t);
  await t.page.locator(".scratch-tab").click();
  const failed = await until(t, () => document.getElementById("scratchpad").dataset.ended === "failed-to-load", null, 10000);
  await t.page.waitForTimeout(1000); // an absence: a session started again by itself would have downloaded by now
  const gave = { failed, state: await t.page.locator("#scratchpad").getAttribute("data-state"),
    session: await t.page.locator("#scratchpad").getAttribute("data-session"), workers: await t.page.evaluate(() => window.jfWorkers.length),
    zips: zips(t) };
  check(`${engine}: a download cut short ends in plain words, and no worker is made`,
    failed && (await t.page.locator("#scratchpad .transcript").textContent()).includes("The scratchpad could not start: jdk.zip did not download whole (reloading the page in a few minutes may help: a new version can take that long to reach every server).")
      && gave.workers === 0, gave);
  check(`${engine}: and no session starts again by itself`, gave.state === "ended" && gave.session === "1" && gave.zips === 2, gave);
  await t.close();

  // A browser that cannot run Java: the boxes say so (web/test/page.mjs), and so does the scratchpad, plainly,
  // with no input, no New session and nothing downloaded.
  const unsupported = async (label, init, says, java) => {
    t = await open(engine, site, PAGE, {}, init);
    await ready(t);
    const shown = await t.page.locator(".scratch-tab").isVisible();
    if (shown) await t.page.locator(".scratch-tab").click(); // a hidden tab fails the first check below, not the script
    const end = await t.page.evaluate(async () => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const n = document.querySelector(".pager"), r = document.getElementById("scratchpad").getBoundingClientRect();
      return { pagerBottom: n ? Math.round(n.getBoundingClientRect().bottom) : null, sheetTop: Math.round(r.top), sheet: document.body.dataset.sheet };
    });
    const got = { java: await t.page.evaluate(() => document.documentElement.dataset.java),
      scratchpad: await t.page.evaluate(() => document.documentElement.dataset.scratchpad), shown,
      text: await t.page.locator("#scratchpad .transcript").textContent(), entry: await t.page.locator("#scratchpad .entry").isHidden(),
      newSession: await t.page.locator("#scratchpad .scratch-new").isHidden(), about: await t.page.locator("#scratchpad .scratch-about").isHidden() };
    if (shown) await t.page.locator("#scratchpad .scratch-close").click();
    got.closed = await t.page.locator("#scratchpad").isHidden() && await t.page.locator(".scratch-tab").isVisible();
    check(`${engine}: ${label}: the tab shows, and the panel says so plainly`,
      got.java === java && got.scratchpad === "unsupported" && got.shown && got.text.includes(says) && got.closed, got);
    check(`${engine}: ${label}: and offers no input and no New session`, got.entry && got.newSession && got.about, got);
    check(`${engine}: ${label}: and nothing of the scratchpad downloads`, !t.requests.some((u) => SCRATCH_URL.test(u)), t.requests.filter((u) => SCRATCH_URL.test(u)));
    check(`${engine}: ${label}: scrolled to its end, the page's Previous and Next links stay above the sheet`,
      end.pagerBottom != null && end.pagerBottom <= end.sheetTop && end.sheet === "open", end);
    check(`${engine}: ${label}: no page error`, t.errors.length === 0, t.errors);
    await t.close();
  };
  await unsupported("without WasmGC", () => { WebAssembly.validate = () => false; }, MINIMUMS, "unsupported");
  // The boxes run here; only the scratchpad cannot. WebAssembly.validate refuses only a module holding a SIMD
  // instruction (the 0xfd 0x0c of v128.const), which none of javaSupport()'s three modules holds.
  await unsupported("without WebAssembly SIMD", () => {
    const real = WebAssembly.validate;
    WebAssembly.validate = (b) => {
      const a = new Uint8Array(b);
      for (let i = 0; i + 1 < a.length; i++) if (a[i] === 0xfd && a[i + 1] === 0x0c) return false;
      return real(b);
    };
  }, "This browser can't run the scratchpad. It runs in Chrome 119", "ready");
  // And the same for bulk memory: only a module holding memory.fill (0xfc 0x0b) is refused.
  await unsupported("without WebAssembly bulk memory", () => {
    const real = WebAssembly.validate;
    WebAssembly.validate = (b) => {
      const a = new Uint8Array(b);
      for (let i = 0; i + 1 < a.length; i++) if (a[i] === 0xfc && a[i + 1] === 0x0b) return false;
      return real(b);
    };
  }, "This browser can't run the scratchpad. It runs in Chrome 119", "ready");

  // A page served over plain http from a LAN address (D79) gets neither crypto.subtle nor Cache Storage, and the
  // scratchpad still starts: its download is checked with the course's own SHA-256. A real insecure origin
  // (harness forwardProxy), not a faked flag, and the case first asserts that the page really has none of them.
  t = await open(engine, site, PAGE, {}, standInScript(1500), { insecure: true });
  await ready(t);
  const insecure = await t.page.evaluate(() => ({ secure: window.isSecureContext, caches: typeof caches, subtle: typeof crypto.subtle }));
  check(`${engine}: plain http: the page is really insecure (isSecureContext false, no Cache Storage, no crypto.subtle)`,
    t.origin.startsWith("http://groundwork.test:") && insecure.secure === false && insecure.caches === "undefined" && insecure.subtle === "undefined", { origin: t.origin, ...insecure });
  const plainPanel = t.page.locator("#scratchpad");
  check(`${engine}: plain http: the scratchpad is wired and its tab shows`,
    await t.page.evaluate(() => document.documentElement.dataset.scratchpad) === "ready" && await t.page.locator(".scratch-tab").isVisible(), null);
  await t.page.locator(".scratch-tab").click();
  // the 30 MB come through the harness's route and the proxy, and the course's own SHA-256 checks them: seconds, not the stand-in's instant
  const plainStarted = await until(t, () => document.getElementById("scratchpad").dataset.state === "ready", null, 30000);
  let plainShown = false; // a scratchpad that did not start has no input to type into: the check below fails instead
  if (plainStarted) {
    await t.page.locator("#scratchpad .entry textarea").fill("2 + 3");
    await t.page.locator("#scratchpad .entry textarea").press("Enter");
    plainShown = await until(t, () => document.querySelector("#scratchpad .transcript").textContent.includes("$1 ==> 5"), null, 10000);
  }
  check(`${engine}: plain http: the scratchpad starts, its download checked without crypto.subtle, and runs an entry`,
    plainStarted && plainShown && await plainPanel.getAttribute("data-ended") === null, { plainStarted, plainShown, text: await plainPanel.locator(".transcript").textContent() });
  check(`${engine}: plain http: all five of jshell's files downloaded, and nothing left the origin`,
    FILE_URLS.every((u) => t.requests.some((r) => r.endsWith(`/scratchpad/${u}`))) && t.offsite.length === 0, { offsite: t.offsite });
  const plainNotes = await t.page.evaluate(() => window.jfNotes);
  check(`${engine}: plain http: while it opens, the note says that Safari and every iPhone or iPad browser cannot start it there, not Safari's secure-page time (D91)`,
    JSON.stringify(plainNotes) === JSON.stringify(PHASE_WORDS_PLAIN), plainNotes);
  check(`${engine}: plain http: no page error`, t.errors.length === 0, t.errors);
  await t.close();

  // A start that runs past the boot deadline (shortened by the page's test hook, below the stand-in's 5 s boot) says so in
  // the client's words; on a page that is not secure it adds where Safari and iPhone or iPad can run it (D91), and on a
  // secure page it does not.
  for (const insecureHere of [false, true]) {
    const where = insecureHere ? "plain http" : "secure page";
    t = await open(engine, site, PAGE, {}, standInScript(5000, "window.jfScratchpadLimits = { bootDeadlineMs: 2000 };"),
      { insecure: insecureHere });
    await ready(t);
    await t.page.locator(".scratch-tab").click();
    const gaveUp = await until(t, () => document.getElementById("scratchpad").dataset.ended === "failed-to-load", null, 40000);
    const said = (await t.page.locator("#scratchpad .transcript").textContent()) ?? "";
    const timedOut = "The scratchpad could not start: jshell did not answer within 2 seconds.";
    check(insecureHere ? `${engine}: plain http: a start past the boot deadline says so, and that Safari and every iPhone or iPad browser run Java much more slowly there`
      : `${engine}: secure page: a start past the boot deadline says so, and nothing about plain http`,
    gaveUp && said.endsWith(insecureHere ? `${timedOut} ${PLAIN_HTTP_SLOW}\n` : `${timedOut}\n`), { gaveUp, said: said.slice(-300) });
    check(`${engine}: ${where}: no page error (a start past the boot deadline)`, t.errors.length === 0, t.errors);
    await t.close();
  }
}
done();
