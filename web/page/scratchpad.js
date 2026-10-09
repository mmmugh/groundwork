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
// The scratchpad: a sheet with jshell in it, on every chapter page (DESIGN section 2, D48, D62). Nothing of it
// downloads until the reader opens it (D29), and it is shut on every page load. The client (jshell-session.js)
// owns the session, its download and its stop policy; the course's jshell front end (runtime/jshell/) answers every
// line, commands included, and gives the prompt for the next one. This file is the page's half: jshell's banner, the
// echo of each line after the prompt the front end gave, jshell's output, what starting jshell is doing and for how
// long (D54), the reader's history, the way out of an unfinished snippet, and every ending in the client's plain
// words (endedWords). It answers no command itself and shows no prompt of its own. panel.dataset.state is "shut"
// until the reader first opens it, then the session's state (loading, ready, busy, ended) whether or not the panel
// shows; data-session counts the sessions started, data-ended names the last ending (the client's endedBy). Each is
// set only once what came before it is on screen, so tests can wait on them.
import { JShellSession } from "./jshell-session.js";
import { PLAIN_HTTP_SLOW } from "./support.js";

const HISTORY_KEY = "jf:scratchpad:history";
const HISTORY_SIZE = 100;
// The transcript keeps its newest 2,000,000 characters (twice an entry's output cap), from the start of a line.
const TRIM_CHARS = 2_000_000;
// What starting jshell is doing, by the client's onProgress phase (D54); a timer follows the words. Measured by
// web/test/scratchpad.mjs, the files served from the same machine: the download and its check 0.1 s, Java under a
// second, then jshell about 9 s in Chromium and WebKit and about 55 s in Firefox, so Firefox's minute goes with
// jshell's words. On an iPhone (D68, the files from a computer on the same network, about 2 s to download) the open
// took 12 s in Edge and between 30 s and a minute in Safari, both WebKit: the wait is jshell's start, so a phone's
// minute goes with jshell's words too.
// These times are for a secure page (https, localhost). On a page that is not secure (plain http from another device)
// Safari is far slower: on a MacBook Air (M4) it downloaded the files and then had not started jshell when the 240 s boot
// deadline passed, and Playwright's WebKit slowed the same way on a page loaded over the network at an insecure origin
// (JavaScript about 13 times, WebAssembly about 28 times; D90). Every browser on iPhone and iPad runs on WebKit. So such a
// page gets PLAIN_JSHELL's words instead, chosen by isSecureContext, never by the browser's name (D91).
const PHASES = {
  download: "Downloading jshell (about 30 MB) and checking it",
  engine: "Starting Java",
  jshell: "Starting jshell, which takes about 10 seconds in Chrome and Safari on a computer, and up to a minute in Firefox or on a phone",
};
const PLAIN_JSHELL = "Starting jshell, which takes about 10 seconds in Chrome and up to a minute in Firefox; on a plain http " +
  "address Safari and every browser on iPhone or iPad cannot start it (use https or localhost)";
// The client's words for a start, or a restart, that did not answer by its deadline: "... jshell did not answer within ...".
const START_TIMED_OUT = /jshell did not answer within/;
// A /reset or /reload starts a fresh VM inside its one request: the client says jshell as it sends the line, the
// session busy, and nothing follows until the answer. The note says so in words of its own, with the timer and no
// time claimed: a restart does not take the first open's time (a /reset about 8 s in Chromium and WebKit and 15 s in
// Firefox, measured), and a /reload then runs the session's entries again.
const RESTARTING = "Starting a fresh jshell";
// The endings after which a fresh session starts by itself (D49): the reader's entry was stopped, or the engine gave
// out. After exited (the reader asked to end) and failed-to-load (starting again by itself would download 30 MB in a
// loop on a bad connection, or wait out another restart that did not answer) the reader starts one: Enter, or New
// session.
const RESTARTS = ["stopped", "timeout", "output-limit", "out-of-memory", "crashed"];

// Storage that throws (a private window, blocked storage) is ignored: the panel works as if nothing were kept.
function readHistory() {
  try {
    const h = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(h) ? h.filter((x) => typeof x === "string") : [];
  } catch (e) { return []; }
}
function writeHistory(h) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch (e) { /* nothing is kept */ }
}

function element(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text != null) e.textContent = text;
  return e;
}

// panel: section#scratchpad; tab: button.scratch-tab; base: the URL of site/scratchpad/. limits: the client's
// deadlineMs, bootDeadlineMs, outputLimitChars and outputLimitLines; each one left out keeps the client's default.
export function wireScratchpad(panel, tab, base, limits = {}) {
  const transcript = panel.querySelector(".transcript");
  const note = panel.querySelector(".scratch-note");
  const input = panel.querySelector(".entry textarea");
  const caret = panel.querySelector(".caret");
  const stopButton = panel.querySelector(".scratch-stop");
  const cancelButton = panel.querySelector(".scratch-cancel");
  const newButton = panel.querySelector(".scratch-new");
  // iOS raises its on-screen keyboard only for a focus the reader's own tap gives, and a tap on a field that already
  // has focus gives none: an input the panel focused itself left the reader no keyboard until they tapped away and back
  // (D69; D67's refocus inside the tap did not help on the device). So on a touch device the panel never focuses its
  // input and never makes it read-only: the reader's tap is the only focus, and it always raises the keyboard. A
  // browser without matchMedia is not a touch device.
  const touchFirst = typeof matchMedia === "function" && matchMedia("(hover: none) and (pointer: coarse)").matches;
  const history = readHistory();
  const phases = self.isSecureContext ? PHASES : { ...PHASES, jshell: PLAIN_JSHELL };
  let cursor = history.length;
  let sessions = 0, continuing = false, opened = false;
  // The prompt the front end gave for the next line ("" until a session gives one, and once it ends): the echo of a
  // line starts with it, and the caret shows it.
  let nextPrompt = "";
  let booting = false; // a start() has not yet resolved: its first ready waits for the banner
  let pending = [], frame = 0, shown = 0;
  let entering = false; // an Enter is still sending its lines, or a cancel is on its way
  let renewing = false; // New session is ending the session itself, and starts the next
  let words = "", since = 0, clock = 0; // what the note says jshell is doing, since when, and its timer

  // One client for the page; each session is one start() of it. It keeps the files it verified, so a fresh session
  // downloads nothing again, even where storage is refused (a private window).
  const { deadlineMs, bootDeadlineMs, outputLimitChars, outputLimitLines } = limits;
  const session = new JShellSession(base, { deadlineMs, bootDeadlineMs, outputLimitChars, outputLimitLines,
    // stderr is a program's own System.err: jshell's feedback, its errors and its traces all arrive on stdout.
    onOutput: (text, stream) => show(text, stream === "stderr" ? "err" : ""),
    onState: (state) => {
      // ready and ended are set only once everything before them is on screen, as box.js flushes before done;
      // a session's first ready waits for its banner (begin), and ended for the ending's words (ended).
      if (state === "idle" || (state === "ready" && booting)) return;
      if (state === "ready" || state === "ended") { flush(); working(""); }
      if (state !== "ended") return setState(state);
      // An ending that nothing is waiting on (the worker failed between entries) is said here, once the client is done;
      // an entry, a cancel or a start that was waiting says its own ending (ended).
      if (!entering && !booting && !renewing) queueMicrotask(() => ended(session.endedBy));
    },
    onProgress: (phase) => working(session.state === "busy" ? RESTARTING : phases[phase] ?? phases.jshell) });

  // jshell is starting or answering a line: Enter sends nothing then, on every device (the keydown handler).
  function jshellBusy(s) { return s === "loading" || s === "busy"; }
  // readonly, not disabled, while jshell works: a disabled field loses focus. On a touch device never (D69): the input
  // stays editable, and a line typed meanwhile waits in it for Enter.
  function setState(s) {
    panel.dataset.state = s;
    input.readOnly = !touchFirst && jshellBusy(s);
    stopButton.hidden = s !== "busy";
    newButton.hidden = s === "shut" || s === "loading";
    cancelButton.hidden = !(continuing && s === "ready");
  }
  function say(text) { note.textContent = text; note.hidden = !text; }
  // The note says what jshell is doing and counts the seconds since it began (D54); working("") ends it.
  function working(text) {
    if (!text) { clearInterval(clock); clock = 0; words = ""; say(""); return; }
    if (!clock) { since = performance.now(); clock = setInterval(tick, 250); }
    words = text;
    tick();
  }
  function tick() { say(`${words}… ${Math.floor((performance.now() - since) / 1000)} s`); }
  // The caret shows the front end's prompt as a terminal's last line does: without the blank line normal mode puts
  // before it and without its trailing space. Cancel shows only at a ...> continuation that waits for the reader (a
  // phone has neither Escape nor Ctrl+C).
  function prompt() {
    caret.textContent = nextPrompt.replace(/^\n+/, "").trimEnd();
    cancelButton.hidden = !(continuing && panel.dataset.state === "ready");
  }
  function fit() { input.style.height = "auto"; input.style.height = `${input.scrollHeight}px`; }
  // The panel's own focus on its input, for a mouse and a keyboard; on a touch device only the reader's tap gives one.
  function focusInput() { if (!touchFirst) input.focus(); }

  // Everything the transcript shows goes through show(), in order, and reaches the page at most once per animation
  // frame: a loop that prints sends one output event per line, and a page update for each one (an append and a
  // scroll) kept the page busy for minutes with 16,352 of them.
  function show(text, kind = "") {
    if (!text) return;
    const last = pending[pending.length - 1];
    if (last && last.kind === kind) last.text += text;
    else pending.push({ kind, text });
    if (!frame) frame = requestAnimationFrame(flush);
  }
  function flush() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    for (const p of pending) {
      transcript.append(p.kind ? element("span", p.kind, p.text) : p.text);
      shown += p.text.length;
    }
    pending = [];
    trim();
    transcript.scrollTop = transcript.scrollHeight;
  }
  // Drops the oldest text until TRIM_CHARS are left, then on to the start of the next line, which can be in a later
  // node: a node with no newline past the cut (a cancel's echo, whose ^C ends its line) goes whole, and the cutting
  // goes on.
  function trim() {
    let over = shown - TRIM_CHARS; // still to drop before the cut may end, just past a newline
    while (over > 0 && transcript.firstChild) {
      const first = transcript.firstChild, text = first.textContent;
      const cut = text.indexOf("\n", over - 1) + 1;
      if (!cut) { first.remove(); shown -= text.length; over = Math.max(over - text.length, 1); continue; }
      if (cut === text.length) first.remove(); else first.textContent = text.slice(cut);
      shown -= cut;
      return;
    }
  }
  // What the reader typed, after its prompt, in the typed style; the blank line normal mode's prompt starts with is
  // plain transcript, so the echo of a line stays one line.
  function echo(text) {
    const typed = text.replace(/^\n+/, "");
    show(text.slice(0, text.length - typed.length));
    show(typed, "typed");
  }
  function clearTranscript() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    pending = [];
    shown = 0;
    transcript.replaceChildren();
  }

  // A session: the client's start(), then jshell's banner, shown once, before the panel says ready, and its first
  // prompt on the caret.
  async function begin() {
    panel.dataset.session = String(++sessions);
    continuing = false;
    nextPrompt = "";
    prompt();
    booting = true;
    try {
      const started = await session.start();
      booting = false;
      nextPrompt = started.prompt ?? "";
      show(started.banner);
      flush();
      working("");
      setState("ready");
      prompt();
      focusInput();
    } catch (e) {
      booting = false;
      // A start that rejects without ending its session is a mistake in the code: it reaches the page's error
      // reporting on its own task, and is never swallowed.
      if (session.state === "ended") ended(session.endedBy);
      else setTimeout(() => { throw e; });
    }
  }

  // An ending, said in the client's words, never the engine's own message; then a fresh session, or not (RESTARTS). A start
  // that timed out on a page that is not secure adds where Safari and iPhone or iPad can run it (D91).
  function ended(reason) {
    continuing = false;
    nextPrompt = "";
    prompt();
    const slowHere = reason === "failed-to-load" && !self.isSecureContext && START_TIMED_OUT.test(session.endedWords);
    show(`${session.endedWords}${slowHere ? ` ${PLAIN_HTTP_SLOW}` : ""}\n`, "status");
    flush();
    panel.dataset.ended = reason;
    setState("ended");
    if (RESTARTS.includes(reason)) return begin();
    say("Press Enter, or New session, to start a new session.");
  }

  function remember(text) {
    if (text.trim() && history[history.length - 1] !== text) {
      history.push(text);
      history.splice(0, history.length - HISTORY_SIZE);
      writeHistory(history);
    }
    cursor = history.length;
  }

  // Enter: each line of the input goes to jshell as one request, in order, as the transcript check sends them
  // (runtime/jshell/test/check.mjs, through this same client), each echoed after the prompt the last answer gave. An
  // empty line goes too, at a plain prompt as at ...>, as the check sends one: the front end answers it (normal mode:
  // its prompt again, so the transcript shows the prompt and an empty line, as the real tool's terminal does).
  async function enter() {
    entering = true;
    try { await send(input.value); } finally { entering = false; }
  }
  async function send(text) {
    input.value = "";
    fit();
    remember(text);
    if (session.state === "ended") {
      await begin();
      // A start that failed gives the line back, into an empty field only: on a touch device the field stays editable
      // while jshell starts (D69), and a line the reader typed meanwhile stays where it is.
      if (session.state !== "ready") { if (!input.value) { input.value = text; fit(); } return; }
    }
    const n = sessions;
    for (const line of text.split("\n")) {
      echo(`${nextPrompt}${line}\n`);
      const r = await session.submit(line);
      if (n !== sessions) return; // New session was pressed meanwhile
      if (r.status === "ended") return ended(r.reason);
      continuing = r.continuation;
      nextPrompt = r.prompt ?? "";
      prompt();
    }
    focusInput();
  }

  // Escape, Ctrl+C or Cancel at a ...> continuation: jshell drops the lines not yet finished (the client's cancel), and
  // the session keeps everything it defined. The transcript shows what was typed, then ^C, as a terminal does.
  async function cancel() {
    if (!continuing || entering || session.state !== "ready") return;
    entering = true;
    const text = input.value;
    input.value = "";
    fit();
    echo(nextPrompt + text.split("\n").join(`\n${nextPrompt}`));
    show("^C\n", "status");
    const n = sessions;
    try {
      const r = await session.cancel();
      if (n !== sessions) return; // New session was pressed meanwhile: its own session is starting
      if (r.status === "ended") return ended(r.reason);
      continuing = r.continuation;
      nextPrompt = r.prompt ?? "";
      prompt();
      focusInput();
    } finally { entering = false; }
  }

  input.addEventListener("input", fit);
  input.addEventListener("keydown", (e) => {
    if (e.isComposing) return;
    // Ctrl+C copies when something is selected; with nothing selected it cancels, as in a terminal.
    const ctrlC = e.ctrlKey && !e.altKey && !e.metaKey && e.key.toLowerCase() === "c"
      && input.selectionStart === input.selectionEnd;
    if (continuing && (e.key === "Escape" || ctrlC)) {
      e.preventDefault();
      cancel();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!jshellBusy(panel.dataset.state) && !entering) enter();
      return;
    }
    // Up and Down walk the history while the input is one line, or still the entry they brought back.
    if ((e.key === "ArrowUp" || e.key === "ArrowDown") && (!input.value.includes("\n") || input.value === history[cursor])) {
      if (e.key === "ArrowUp" && cursor > 0) cursor--;
      else if (e.key === "ArrowDown" && cursor < history.length) cursor++;
      else return;
      e.preventDefault();
      input.value = history[cursor] ?? "";
      fit();
    }
  });
  stopButton.addEventListener("click", () => session.stop());
  cancelButton.addEventListener("click", () => cancel());
  newButton.addEventListener("click", () => {
    renewing = true;
    session.stop();
    renewing = false;
    clearTranscript();
    begin();
  });

  // The sheet's height, so the page's last lines can scroll above it (app.css, body[data-sheet=open]).
  function sheet() {
    document.documentElement.style.setProperty("--sheet", panel.hidden ? "0px" : `${panel.offsetHeight}px`);
  }
  function setOpen(yes) {
    panel.hidden = !yes;
    tab.hidden = yes;
    tab.setAttribute("aria-expanded", String(yes));
    document.body.dataset.sheet = yes ? "open" : "shut";
    sheet();
    if (yes && !opened) { opened = true; begin(); }
    if (yes) focusInput(); else tab.focus();
  }
  tab.addEventListener("click", () => setOpen(true));
  panel.querySelector(".scratch-close").addEventListener("click", () => setOpen(false));
  new ResizeObserver(sheet).observe(panel);
  document.body.dataset.sheet = "shut";
  setState("shut");
  tab.hidden = false;
  document.documentElement.dataset.scratchpad = "ready";
}
