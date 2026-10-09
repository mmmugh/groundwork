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
// The scratchpad in Chromium, WebKit and Firefox with the real jshell: Ristretto's pinned files and the course's
// front end, composed in the browser, from the built site, at 390 px. It downloads nothing until it is opened; then it
// says what it is doing, phase by phase; it answers, character for character and prompt for prompt, as the same client
// answers under Node; it continues an unfinished line, shows a StackOverflowError's trace whole and lives on, restarts
// with /reset (saying so while the fresh VM starts, and forgetting the session's variables), stops a runaway and starts
// afresh, ends a session whose memory runs out and starts afresh, ends an entry at the output cap, at the line cap (a
// runaway of short lines), at Ristretto's own output stop and at the backstop, ends a session whose memory passes
// 2 GiB (this browser's own RangeError), and talks to nobody, a jshell entry that opens a java.net URL included
// (Chromium, W-8). Firefox takes about a minute to start jshell, so every
// open has a 250-second allowance. Each engine prints how long the open took, phase by phase, the first entry and the
// /reset. The panel's own behavior, against a stand-in worker, is web/test/scratchpad-panel.mjs.
//   node web/test/scratchpad.mjs [chromium|webkit|firefox]
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { REPO, ENGINES, check, done, buildSite, open } from "./harness.mjs";
import { JShellSession, ASSETS } from "../page/jshell-session.js";
import { nodeWorker, nodeFetchBytes, dirUrl } from "./jshell-node.mjs";

const only = process.argv[2];
if (only && !ENGINES[only]) { console.log("usage: node web/test/scratchpad.mjs [chromium|webkit|firefox]"); process.exit(2); }
const site = path.join(buildSite(path.join(REPO, "web/test/vol-page"), "scratchpad-test"), "site");
const PAGE = "vol-page/ch01-run.html";
// The manifest's version, under which the client starts worker.js (worker.js?v=<version>), and its hashes: the client
// fetches each of the five files at its hash-qualified URL, <name>?sha256=<hash>.
const MANIFEST = JSON.parse(fs.readFileSync(path.join(site, "scratchpad/manifest.json"), "utf8"));
const VERSION = MANIFEST.version;
const FILE_URLS = ASSETS.map((n) => `${n}?sha256=${MANIFEST.files[n].sha256}`);
const BOOT_MS = 250_000; // the client's own boot deadline is 240 s
const ENTRY_MS = 120_000; // the slowest entry below, f(0), took 6.8 s under Node
const PHASE_WORDS = ["Downloading jshell (about 30 MB) and checking it", "Starting Java",
  "Starting jshell, which takes about 10 seconds in Chrome and Safari on a computer, and up to a minute in Firefox or on a phone"];
// The same on a page that is not secure (plain http from another device), where Safari and every iPhone or iPad browser
// cannot start jshell (D90, D91; chosen by isSecureContext).
const PHASE_WORDS_PLAIN = [...PHASE_WORDS.slice(0, 2), "Starting jshell, which takes about 10 seconds in Chrome and up to a " +
  "minute in Firefox; on a plain http address Safari and every browser on iPhone or iPad cannot start it (use https or localhost)"];
const RESTARTING = /^Starting a fresh jshell… (\d+) s$/; // the note while /reset restarts: no time claimed
// What a reader might type first: values, a variable, an empty line (the front end answers it with its prompt), a
// method over three lines, an error; a program's own System.err; then endless recursion, whose trace (the front end
// shows its first 1,024 frames) must arrive whole, and an entry after it, which shows the session lived through it;
// then /reset, after which x is gone, and x again.
const LINES = ["2 + 3", "int x = 10", "x * 2", "", "int twice(int n) {", "    return n * 2;", "}", "twice(x)", "y + 1",
  "\"hi\".repeat(3)", "System.err.println(\"to stderr\")", "int f(int n) { return f(n + 1); }", "f(0)", "\"hi\".length()",
  "/reset", "x", "int x = 10"];
const TRACE = LINES.indexOf("f(0)"), RESET = LINES.indexOf("/reset");
const TRACE_LINES = 1025; // the exception's line and 1,024 frames (TraceBlock.java's MOST_FRAMES)
const MEMORY = "var l = new ArrayList<long[]>(); while (true) l.add(new long[1_000_000]);";

// The same lines through the same client under Node (Ristretto's worker in a worker thread), on the same files: the
// transcript each browser must show, character for character (jshell's banner, the echo of each line after the prompt
// the front end gave for it, then jshell's output).
let expected = "";
const marks = []; // how long the expected transcript is after each line
const ns = new JShellSession(dirUrl(path.join(site, "scratchpad")), { createWorker: nodeWorker, fetchBytes: nodeFetchBytes,
  caches: null, onOutput: (text) => { expected += text; } });
let { banner, prompt } = await ns.start();
expected += banner; // after anything onOutput gave meanwhile, as the panel prints it
for (const line of LINES) {
  expected += `${prompt}${line}\n`;
  const r = await ns.submit(line);
  if (r.status !== "ready") { console.log(`under Node, ${JSON.stringify(line)} ended the session: ${r.reason}`); process.exit(1); }
  prompt = r.prompt;
  marks.push(expected.length);
}
ns.stop();
const trace = expected.slice(marks[TRACE - 1], marks[TRACE]).split("\n")
  .filter((l) => l.startsWith("|  Exception") || l.startsWith("|        at "));
const reset = expected.slice(marks[RESET - 1], marks[RESET + 1]);
// Without these, a client broken the same way in Node and in the browser would pass the comparison below.
check("under Node: jshell's welcome, its prompts with their blank lines, values, an empty line, a method, an error, System.err and the trace, as jshell prints them",
  expected.startsWith("|  Welcome to JShell -- Version 25.0.4.1\n|  For an introduction type: /help intro\n\njshell> 2 + 3\n$1 ==> 5\n\njshell> int x = 10\n")
    && expected.includes("\njshell> \n\njshell> int twice(int n) {\n   ...>     return n * 2;\n   ...> }\n|  created method twice(int)\n")
    && expected.includes("|    symbol:   variable y\n") && expected.includes('\njshell> System.err.println("to stderr")\nto stderr\n')
    && trace.length === TRACE_LINES && trace[0].startsWith("|  Exception java.lang.StackOverflowError")
    && /\n\$\d+ ==> 2\n$/.test(expected.slice(0, marks[RESET - 1])), { head: expected.slice(0, 400), traceLines: trace.length });
check("under Node: /reset prints no banner, and x is gone after it",
  reset.startsWith("\njshell> /reset\n|  Resetting state.\n\njshell> x\n|  Error:\n|  cannot find symbol\n|    symbol:   variable x\n")
    && !reset.includes("Welcome") && expected.endsWith("\njshell> int x = 10\nx ==> 10\n"), reset);

// Runs in the page before its own scripts: every worker the scratchpad makes is recorded, with when it was made and
// when the page terminated it; so is each new thing the panel's note says (without its timer), with when, and each
// moment data-state turns ready.
const WATCH = () => {
  const Real = window.Worker;
  window.jfWorkers = [];
  window.Worker = class Worker extends Real {
    constructor(u, options) {
      super(u, options);
      // worker.js?v=<the manifest's version>, as the client starts it
      if (/\/scratchpad\/worker\.js(\?|$)/.test(String(u))) window.jfWorkers.push(this.jf = { made: performance.now(), terminated: null });
    }
    terminate() {
      if (this.jf && this.jf.terminated == null) this.jf.terminated = performance.now();
      return super.terminate();
    }
  };
  window.jfNotes = [];
  window.jfReadyAt = [];
  document.addEventListener("DOMContentLoaded", () => {
    const p = document.getElementById("scratchpad");
    if (!p) return; // Firefox runs this in about:blank too
    const note = p.querySelector(".scratch-note");
    new MutationObserver(() => { if (p.dataset.state === "ready") window.jfReadyAt.push(performance.now()); })
      .observe(p, { attributes: true, attributeFilter: ["data-state"] });
    let last = ""; // what the note said last, "" once it is cleared, so a restart's words are recorded again
    new MutationObserver(() => {
      const words = note.textContent.replace(/… \d+ s$/, "");
      if (words && words !== last) window.jfNotes.push({ words, at: performance.now() });
      last = words;
    }).observe(note, { childList: true, characterData: true, subtree: true });
  });
};
const SCRATCH_URL = /\/scratchpad\//;
const within = (ms, p) => Promise.race([p, new Promise((r) => setTimeout(() => r(false), ms))]);
const until = (t, fn, arg, ms) => within(ms + 5000, t.page.waitForFunction(fn, arg, { timeout: ms, polling: 250 }).then(() => true, () => false));

for (const engine of only ? [only] : Object.keys(ENGINES)) {
  console.log(engine);
  // A phone's 390 px (Firefox has no isMobile: a desktop window 390 px wide). D69: isMobile without hasTouch is a desktop
  // panel (the panel focuses its input and makes it read-only while jshell works); a real phone's input never is.
  const PHONE = { viewport: { width: 390, height: 844 }, ...(engine === "firefox" ? {} : { isMobile: true }) };
  let t = await open(engine, site, PAGE, PHONE, WATCH);
  const panel = t.page.locator("#scratchpad");
  const input = t.page.locator("#scratchpad .entry textarea");
  const text = async () => (await panel.locator(".transcript").textContent()) ?? "";
  const ready = (ms = ENTRY_MS) => until(t, () => document.getElementById("scratchpad").dataset.state === "ready", null, ms);
  const fresh = (n) => until(t, (n) => document.getElementById("scratchpad").dataset.session === String(n)
    && document.getElementById("scratchpad").dataset.state === "ready", n, BOOT_MS);
  const type = async (line) => { await input.fill(line); await input.press("Enter"); };
  await t.page.waitForFunction(() => document.documentElement.dataset.java && document.documentElement.dataset.scratchpad);

  check(`${engine}: the tab shows, and nothing of the scratchpad has downloaded`,
    await t.page.locator(".scratch-tab").isVisible() && !t.requests.some((u) => SCRATCH_URL.test(u)), t.requests.filter((u) => SCRATCH_URL.test(u)));
  const opened = Date.now();
  await t.page.locator(".scratch-tab").click();
  // The exact 2.5 s check needs a machine fast enough that the download and Java are done by then; a CI runner may not be
  // (P3b-29), so there it waits, bounded by BOOT_MS, for the jshell note and for its counter to reach 2.
  if (process.env.CI) {
    console.log(`      ${engine}: CI is set, so the exact 2.5 s check is relaxed: it waits for the jshell note and a counter of 2 s or more, then checks the counter against the page's own timestamps`);
    await until(t, (w) => /(\d+) s$/.test(document.querySelector("#scratchpad .scratch-note").textContent)
      && document.querySelector("#scratchpad .scratch-note").textContent.startsWith(w)
      && Number(document.querySelector("#scratchpad .scratch-note").textContent.match(/(\d+) s$/)[1]) >= 2, PHASE_WORDS[2], BOOT_MS);
  } else {
    await t.page.waitForTimeout(2500);
  }
  const seen = await t.page.evaluate(() => ({ note: document.querySelector("#scratchpad .scratch-note").textContent, now: performance.now(),
    first: window.jfNotes[0]?.at }));
  const note = seen.note;
  const counted = Number((note.match(/(\d+) s$/) ?? [])[1]);
  check(`${engine}: ${process.env.CI ? "once it has started jshell" : "2.5 s into the open"}, the panel says jshell is starting, Firefox's minute included, and counts the seconds (D54)`,
    note.startsWith(PHASE_WORDS[2]) && counted >= 2, note);
  // The counter counts from the first note the panel said, which the page's own timestamps (jfNotes) record: it must agree
  // with the time since then, to the second, whatever the machine's speed.
  const elapsed = Math.floor((seen.now - seen.first) / 1000);
  check(`${engine}: the counter agrees with the page's own clock since its first note (counter ${counted} s, ${elapsed} s by jfNotes)`,
    Number.isFinite(counted) && seen.first !== undefined && Math.abs(counted - elapsed) <= 1, { counted, elapsed, seen });
  const up = await ready(BOOT_MS);
  const phases = await t.page.evaluate(() => ({ notes: window.jfNotes, readyAt: window.jfReadyAt[0] }));
  const at = phases.notes.map((n) => n.at).concat(phases.readyAt);
  const s = (i) => ((at[i + 1] - at[i]) / 1000).toFixed(1);
  console.log(`      ${engine}: open to ready in ${Math.round((Date.now() - opened) / 1000)} s (download ${s(0)} s, Java ${s(1)} s, jshell ${s(2)} s)`);
  check(`${engine}: it said each phase in turn: the download, Java, then jshell`,
    JSON.stringify(phases.notes.map((n) => n.words)) === JSON.stringify(PHASE_WORDS), phases);
  const scratch = t.requests.filter((u) => SCRATCH_URL.test(u)).map((u) => u.replace(/.*\/scratchpad\//, ""));
  const fetched = [...new Set(scratch)].sort();
  check(`${engine}: jshell opens, from the six pinned files and the manifest, seven requests, each file at its hash-qualified URL and the worker under the manifest's version`,
    up && scratch.length === 7 && JSON.stringify(fetched) === JSON.stringify(["manifest.json", ...FILE_URLS, `worker.js?v=${VERSION}`].sort()), { up, scratch });

  let caretMore = null, resetNote = null;
  for (const [i, line] of LINES.entries()) {
    const sent = await t.page.evaluate(() => performance.now());
    await type(line);
    if (i === RESET) {
      await t.page.waitForTimeout(2500);
      resetNote = await panel.locator(".scratch-note").textContent();
    }
    await ready(i === RESET ? BOOT_MS : ENTRY_MS);
    const took = await t.page.evaluate((s) => ((window.jfReadyAt[window.jfReadyAt.length - 1] - s) / 1000).toFixed(1), sent);
    if (i === 0) console.log(`      ${engine}: the first entry (${line}) answered in ${took} s`);
    if (i === RESET) console.log(`      ${engine}: /reset answered in ${took} s`);
    if (line === "int twice(int n) {") caretMore = await panel.locator(".caret").textContent();
    if (i === 8) {
      const got = await text();
      check(`${engine}: jshell's banner and nine entries show exactly what the client shows under Node, prompts included`,
        got === expected.slice(0, marks[8]), { got: got.slice(-400), want: expected.slice(marks[8] - 400, marks[8]) });
      check(`${engine}: an unfinished line continues at ...>`, caretMore === "   ...>", caretMore);
    }
  }
  const all = await text();
  check(`${engine}: a ${TRACE_LINES.toLocaleString("en-US")}-line StackOverflowError trace arrives whole, and every entry after it, /reset among them, shows what the client shows under Node`,
    all === expected, { length: [all.length, expected.length], tail: all.slice(-200) });
  const afterReset = all.slice(all.lastIndexOf("\njshell> /reset\n"));
  check(`${engine}: a real /reset says a fresh jshell is starting while the fresh VM starts, counting the seconds (D54), prints no banner, and x is gone`,
    Number((resetNote.match(RESTARTING) ?? [])[1]) >= 2
      && afterReset.startsWith("\njshell> /reset\n|  Resetting state.\n\njshell> x\n|  Error:\n|  cannot find symbol\n|    symbol:   variable x\n")
      && !afterReset.includes("Welcome"), { resetNote, afterReset: afterReset.slice(0, 300) });
  const wide = await t.page.evaluate(() => {
    const p = document.getElementById("scratchpad"), tr = p.querySelector(".transcript");
    tr.scrollLeft = 100000; // the trace's first line is wider than a phone: only a transcript that scrolls moves
    return { page: document.documentElement.scrollWidth, sheetW: [p.scrollWidth, p.clientWidth, Math.round(p.getBoundingClientRect().right)],
      innerW: innerWidth, sheetH: p.offsetHeight, innerH: innerHeight, trMoved: tr.scrollLeft > 0 };
  });
  check(`${engine}: at 390 px with the trace shown, only the transcript scrolls sideways, and the sheet keeps to 60% of the height`,
    wide.page <= 390 && wide.sheetW[0] <= wide.sheetW[1] && wide.sheetW[2] <= wide.innerW && wide.trMoved && wide.sheetH <= wide.innerH * 0.6 + 1, wide);

  // W-8: a jshell entry cannot reach the network either. Ristretto's JVM has no socket natives, so java.net fails inside
  // it (an UnsatisfiedLinkError) before any browser API is touched; a live server on another port, counting every
  // connection, sees none, and the gate records nothing. So the scratchpad's worker (Ristretto's worker.js, pinned)
  // runs with no doors wrapper. Probed in Chromium: the failure is the JVM's own, not the browser's.
  if (engine === "chromium") {
    let calls = 0;
    const home = http.createServer((req, res) => res.writeHead(200, { "Access-Control-Allow-Origin": "*" }).end("answered\n"));
    home.on("connection", () => calls++);
    await new Promise((r) => home.listen(0, "127.0.0.1", r));
    const from = (await text()).length;
    await type(`new java.net.URL("http://127.0.0.1:${home.address().port}/from-jshell").openStream()`);
    await ready();
    await t.page.waitForTimeout(1000); // time for a connection the entry started to arrive
    const said = (await text()).slice(from);
    check(`${engine}: a jshell entry that opens a java.net URL fails inside Ristretto (no socket natives) and reaches nobody: no connection, nothing recorded (W-8)`,
      said.includes("\n|  Exception java.lang.UnsatisfiedLinkError: 'sun/nio/ch/UnixDispatcher.init()V'\n") && calls === 0 && t.offsite.length === 0,
      { said: said.slice(0, 300), calls, offsite: t.offsite });
    await new Promise((r) => { home.close(r); home.closeAllConnections(); });
  }

  // A runaway: Stop terminates jshell's worker at once, the panel says what that cost, and a fresh session starts,
  // which no longer knows x (defined again after the /reset).
  await type("while (true) {}");
  await until(t, () => document.getElementById("scratchpad").dataset.state === "busy", null, 10000);
  await t.page.waitForTimeout(1000);
  const busy = { stop: await panel.locator(".scratch-stop").isVisible(), editable: await input.isEditable(), disabled: await input.isDisabled() };
  check(`${engine}: while an entry runs, Stop shows and the input is read-only`, busy.stop && !busy.editable && !busy.disabled, busy);
  const clicked = await t.page.evaluate(() => performance.now());
  await panel.locator(".scratch-stop").click();
  await until(t, () => window.jfWorkers[0].terminated != null, null, 5000);
  const lag = await t.page.evaluate((at) => window.jfWorkers[0].terminated == null ? null : window.jfWorkers[0].terminated - at, clicked);
  check(`${engine}: Stop terminates jshell's worker at once`, lag != null && lag >= 0 && lag < 2000, lag);
  const restarted = await fresh(2);
  check(`${engine}: says so in plain words, and a fresh session starts`,
    restarted && (await text()).includes("\njshell> while (true) {}\nStopped. The session ended, and its variables and methods are gone.\n|  Welcome to JShell")
      && await t.page.evaluate(() => window.jfWorkers.length) === 2, { restarted, tail: (await text()).slice(-300) });
  await type("x");
  await ready();
  // Only what any jshell front end says of a name it does not know: the error naming it, and no value.
  const afterX = (await text()).split("jshell> x\n").pop();
  check(`${engine}: the fresh session has forgotten x`,
    afterX.includes("cannot find symbol") && afterX.includes("variable x") && !afterX.includes("==>"), afterX.slice(0, 300));

  // Memory used up: the engine aborts (a Rust abort, never java.lang.OutOfMemoryError, D49); the reader reads the
  // course's words and none of the engine's, and a fresh session starts.
  await type(MEMORY);
  const t0 = Date.now();
  const oom = await until(t, () => document.getElementById("scratchpad").dataset.ended === "out-of-memory", null, ENTRY_MS);
  const oomMs = Date.now() - t0;
  const restarted2 = await fresh(3);
  const afterOom = await text();
  check(`${engine}: memory used up ends the session in plain words (${oomMs} ms), with no engine text, and a fresh session starts`,
    oom && restarted2 && afterOom.includes(`\njshell> ${MEMORY}\nl ==> []\nThis session ran out of memory, so it ended`)
      && !/memory allocation|RUST_BACKTRACE|panicked|unreachable/.test(afterOom), { oom, restarted2, tail: afterOom.slice(-400) });

  // Endless printing ends at the client's cap (1,000,000 characters: fewer than 1,000 of these lines shown), before
  // Ristretto's own 1 MiB stop (1,048,576 bytes, 1,047 of these lines), so the course's limit is the one a reader meets
  // (for text of one-byte characters; Ristretto counts UTF-8 bytes, so wider ones meet its stop first).
  await type('while (true) System.out.println("x".repeat(1000))');
  const capped = await until(t, () => document.getElementById("scratchpad").dataset.ended === "output-limit", null, ENTRY_MS);
  const printed = (await text()).split("x".repeat(1000) + "\n").length - 1;
  check(`${engine}: endless printing stops at the course's output cap (${printed} lines shown), in plain words`,
    capped && printed > 900 && printed < 1000 && (await text()).includes("This entry printed more than the scratchpad can show, so it was stopped."),
    { capped, printed, tail: (await text()).slice(-300) });

  // Endless printing of short lines, the runaway a reader is likeliest to type, ends at the client's other cap: 100,000
  // lines (200,000 characters, far under the character cap and Ristretto's stop), each its own output event, drawn once
  // per animation frame. The transcript shows exactly 100,000 lines of 1, then the client's words, then a fresh session.
  const freshBefore = await fresh(4);
  const RUNAWAY = "while (true) System.out.println(1)";
  const runawaySent = Date.now();
  await type(RUNAWAY);
  const runawayEnded = await until(t, () => document.getElementById("scratchpad").dataset.session === "5", null, ENTRY_MS);
  const runawayMs = Date.now() - runawaySent;
  const freshAfter = await fresh(5);
  const afterRunaway = await text();
  const from = afterRunaway.lastIndexOf(`\njshell> ${RUNAWAY}\n`) + `\njshell> ${RUNAWAY}\n`.length;
  const CAP_WORDS = "This entry printed more than the scratchpad can show, so it was stopped. The session ended, and its variables and methods are gone.\n";
  let ones = 0;
  while (afterRunaway.startsWith("1\n", from + 2 * ones)) ones++;
  check(`${engine}: endless printing of short lines stops at the client's 100,000-line cap (${runawayMs} ms): exactly 100,000 lines of 1, the client's words, then a fresh session`,
    freshBefore && runawayEnded && freshAfter && await panel.getAttribute("data-ended") === "output-limit" && ones === 100_000
      && afterRunaway.startsWith(CAP_WORDS + "|  Welcome to JShell", from + 2 * ones),
    { freshBefore, runawayEnded, freshAfter, ones, next: afterRunaway.slice(from + 2 * ones, from + 2 * ones + 200) });

  // The engine's other two ways of giving out, in this browser: Ristretto's own 1 MiB stop, in the engine's words,
  // which a two-byte character meets before the client's caps (524 lines of these); and memory past 2 GiB, which is
  // how a long session ends: the worker's glue then fails with this browser's own RangeError (V8, WebKit and Firefox
  // word it differently, and the client knows all three). One entry holding 2 GB gets there at once.
  const restarted3 = await fresh(5);
  await type('while (true) System.out.println("é".repeat(1000))');
  const restarted4 = await fresh(6);
  const afterWide = await text();
  const twoByte = afterWide.split("é".repeat(1000) + "\n").length - 1;
  check(`${engine}: endless printing of a two-byte character meets Ristretto's own 1 MiB stop first (${twoByte} lines shown), in plain words, and a fresh session starts`,
    restarted3 && restarted4 && twoByte > 400 && twoByte < 600 && await panel.getAttribute("data-ended") === "output-limit"
      && afterWide.includes(`${"é".repeat(1000)}\nThis entry printed more than the scratchpad can show, so it was stopped.`),
    { restarted3, restarted4, twoByte, tail: afterWide.slice(-300) });
  await type("long[][] big = new long[260][]; for (int i = 0; i < 260; i++) big[i] = new long[1_000_000];");
  const held = await ready();
  await type("1 + 1");
  const gone = await until(t, () => document.getElementById("scratchpad").dataset.ended === "out-of-memory", null, ENTRY_MS);
  const afterBig = await text();
  check(`${engine}: memory past 2 GiB (2 GB held by one entry: how a long session ends) ends the session at the next entry in plain words, with nothing of the engine's`,
    held && gone && /\nbig ==> long\[260\]\[\] \{[^\n]*\}\n\njshell> 1 \+ 1\nThis session ran out of memory, so it ended/.test(afterBig)
      && !/Start offset|byteOffset|out-of-range|unreachable|RUST_BACKTRACE/.test(afterBig), { held, gone, tail: afterBig.slice(-400) });
  check(`${engine}: no request left the page's origin`, t.offsite.length === 0, t.offsite);
  check(`${engine}: no page error`, t.errors.length === 0, t.errors);
  await t.close();

  // The backstop, shortened to 5 s by the page's test hook (it is 60 s for readers): an endless loop ends there.
  t = await open(engine, site, PAGE, PHONE, `(${WATCH})();\nwindow.jfScratchpadLimits = { deadlineMs: 5000 };`);
  await t.page.waitForFunction(() => document.documentElement.dataset.java && document.documentElement.dataset.scratchpad);
  await t.page.locator(".scratch-tab").click();
  const up2 = await until(t, () => document.getElementById("scratchpad").dataset.state === "ready", null, BOOT_MS);
  await t.page.locator("#scratchpad .entry textarea").fill("while (true) {}");
  await t.page.locator("#scratchpad .entry textarea").press("Enter");
  const sent = await t.page.evaluate(() => performance.now());
  const ended = await until(t, () => document.getElementById("scratchpad").dataset.ended === "timeout", null, 20000);
  const stopAt = await t.page.evaluate((s) => window.jfWorkers[0].terminated == null ? null : window.jfWorkers[0].terminated - s, sent);
  check(`${engine}: an endless loop ends at the backstop, in plain words`,
    up2 && ended && stopAt != null && stopAt >= 4500 && stopAt < 8000
      && (await t.page.locator("#scratchpad .transcript").textContent()).includes("This entry ran for 5 seconds without finishing, so it was stopped."), { up2, ended, stopAt });
  check(`${engine}: no request left the page's origin (backstop)`, t.offsite.length === 0, t.offsite);
  check(`${engine}: no page error (backstop)`, t.errors.length === 0, t.errors);
  await t.close();

  // A page served over plain http from a LAN address (D79): a real insecure origin (harness forwardProxy), where the
  // browser gives neither crypto.subtle nor Cache Storage. The real jshell still opens, its download checked by the
  // course's own SHA-256, and its note says what it is doing in the words for such a page (PHASE_WORDS_PLAIN). No reload
  // count: Playwright turns the browser's HTTP cache off whenever a route is installed, so a count would measure the
  // harness, not a reader's browser.
  t = await open(engine, site, PAGE, PHONE, WATCH, { insecure: true });
  await t.page.waitForFunction(() => document.documentElement.dataset.java && document.documentElement.dataset.scratchpad);
  const bare = await t.page.evaluate(() => ({ secure: window.isSecureContext, caches: typeof caches, subtle: typeof crypto.subtle }));
  check(`${engine}: plain http: the page is really insecure (isSecureContext false, no Cache Storage, no crypto.subtle)`,
    t.origin.startsWith("http://groundwork.test:") && bare.secure === false && bare.caches === "undefined" && bare.subtle === "undefined", { origin: t.origin, ...bare });
  await t.page.locator(".scratch-tab").click();
  if (engine === "webkit") {
    // D90: Safari on a MacBook Air (M4), on a site served over plain http from the Mac's LAN address, downloaded the
    // files and then said "jshell did not answer within 240 seconds". This Playwright WebKit slows the same way on a page
    // loaded over the network at an insecure origin, as this one is (JavaScript about 13 times, WebAssembly about 28
    // times; route-served pages are not slowed, so a route-served test would be falsely reassuring), and the real jshell,
    // 9 s at a secure origin, had not opened after 30 minutes here. So WebKit is held to what happens before the engine
    // runs: the five files downloaded and accepted by the course's own SHA-256 (the note has moved on to Starting Java, and
    // the worker was made only after the check), as a cut or changed download would have ended the session first, and the
    // note in the words for such a page. Waiting for the boot would only time out. DESIGN.md and the page say so (D91).
    const past = await until(t, () => window.jfNotes.length >= 3, null, 60_000);
    const state = await t.page.evaluate(() => ({ notes: window.jfNotes.map((n) => n.words), workers: window.jfWorkers.length,
      ended: document.getElementById("scratchpad").dataset.ended ?? null }));
    check(`${engine}: plain http: the download is checked by the course's own SHA-256, jshell's worker starts, and the note says Safari and iPhone or iPad cannot start it here (its boot is not waited for: WebKit at an insecure origin, loaded over the network, is too slow, D90)`,
      past && JSON.stringify(state.notes.slice(0, 3)) === JSON.stringify(PHASE_WORDS_PLAIN) && state.workers === 1 && state.ended === null, state);
  } else {
    const up3 = await until(t, () => document.getElementById("scratchpad").dataset.state === "ready", null, BOOT_MS);
    await t.page.locator("#scratchpad .entry textarea").fill("1 + 1");
    await t.page.locator("#scratchpad .entry textarea").press("Enter");
    const two = await until(t, () => document.querySelector("#scratchpad .transcript").textContent.endsWith("1 + 1\n$1 ==> 2\n"), null, ENTRY_MS);
    const notes3 = (await t.page.evaluate(() => window.jfNotes)).map((n) => n.words);
    check(`${engine}: plain http: the scratchpad starts, says what it is doing in the words for such a page, and shows $1 ==> 2 for 1 + 1`,
      up3 && two && JSON.stringify(notes3) === JSON.stringify(PHASE_WORDS_PLAIN), { up3, two, notes3 });
  }
  check(`${engine}: plain http: no request left the page's origin`, t.offsite.length === 0, t.offsite);
  check(`${engine}: plain http: no page error`, t.errors.length === 0, t.errors);
  await t.close();
}
done();
