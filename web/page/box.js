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
// One runnable box: Run, keyboard input by replay (D16), Reset, the reader's edits kept in the browser (D41), and
// Check for a box whose check the build published (DESIGN section 3). box.dataset.state is idle, loading
// (compiling), running, waiting (for an answer), checking or done; every handler sets it before it awaits anything,
// so the page's tests can wait on it. A predict box (wirePredict) has no code to run: its Check needs no runner.
import { Replay } from "./replay.js";
import { runCheck, predictVerdict, OUTPUT_CAPS } from "./check.js";
import { FATAL, PLAIN_HTTP_SLOW } from "./support.js";

// The page limits (DESIGN section 2): BrowserRunner passes caps through without defaults. Check's runs use the same
// caps (check.js's OUTPUT_CAPS).
const LIMITS = { deadlineMs: 5000, ...OUTPUT_CAPS };
const STATUS = {
  timeout: "Stopped: the program ran for more than 5 seconds. An endless loop?",
  "output-limit": "Stopped: the program printed more than a million characters or 100,000 lines.",
  crashed: "The program stopped unexpectedly. It may have run out of memory.",
  fatal: FATAL,
  diverged: "This program printed something different when it ran again with your answer (does it use the clock?), " +
    "so the output above may be mixed up.",
};

// A compile error as javac prints it at a terminal: "Main.java:<line>: error: <the message's first line>", the source
// line, a caret under the column, the message's other lines, then the count. Only javac's own diagnostics name a line
// of the reader's file. TeaVM's carry line numbers from TeaVM's class library, and the "main" stage has none, so
// those print as javac prints an error with no position ("error: <message>"), once for each distinct message.
export function javacText(diagnostics, source) {
  const lines = source.split("\n");
  const seen = new Set();
  const shown = diagnostics.filter((d) => {
    if (/warn|note/i.test(d.severity)) return false;
    if (!d.phase || d.phase === "javac") return true;
    const text = String(d.message);
    return !seen.has(text) && seen.add(text);
  });
  const text = shown.map((d) => {
    const [first, ...rest] = String(d.message).split("\n");
    const more = rest.map((l) => l + "\n").join("");
    if (d.line == null || (d.phase && d.phase !== "javac")) return `error: ${first}\n${more}`;
    const caret = d.column != null ? " ".repeat(Math.max(0, d.column - 1)) + "^\n" : "";
    return `Main.java:${d.line}: error: ${first}\n${lines[d.line - 1] ?? ""}\n${caret}${more}`;
  });
  return text.join("") + `${shown.length} error${shown.length === 1 ? "" : "s"}\n`;
}

// Storage that throws (a private window, blocked storage) is ignored: the box works as if nothing were kept.
function readKept(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function writeKept(key, code, original) {
  try {
    if (code === original) localStorage.removeItem(key);
    else localStorage.setItem(key, code);
  } catch (e) { /* nothing is kept */ }
}

function element(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text != null) e.textContent = text;
  return e;
}
function button(label, onClick) {
  const b = element("button", null, label);
  b.type = "button";
  b.addEventListener("click", onClick);
  return b;
}

// A verdict replaces the box's earlier one at once, right after its controls; data-done="yes" once it is filled.
function newVerdict(box, controls) {
  box.querySelector(".verdict")?.remove();
  const v = element("div", "verdict");
  v.setAttribute("aria-live", "polite");
  controls.after(v);
  return v;
}
function finish(v, summary, ...more) {
  v.append(element("p", "summary", summary), ...more);
  v.dataset.done = "yes";
}
const count = (lines, noun) => {
  const failed = lines.filter((l) => !l.ok).length;
  return failed ? `${failed} of ${lines.length} ${noun} failed.` : `Passed all ${lines.length} ${noun}.`;
};
// What runCheck found, in the verdict: its summary first, then one line per case or run for method and input.
function showVerdict(v, check, result, source) {
  const c = result.compile;
  if (c && c.kind === "signature") return finish(v, c.message);
  // A compiler that died has no diagnostics to show (BrowserRunner's "crash" stage): only that says to reload.
  if (c && !c.diagnostics.length) return finish(v, STATUS.fatal);
  if (c) return finish(v, "Your code does not compile yet:", element("pre", "err", javacText(c.diagnostics, source)));
  if (check.kind === "output") return finish(v, result.text);
  const list = element("ul");
  for (const l of result.lines) list.append(element("li", l.ok ? "pass" : "fail", l.text));
  const noun = check.kind === "method" ? "cases" : "runs";
  // A method check that stopped lists the cases that ran before it did.
  finish(v, result.stopped ?? count(result.lines, noun), ...(result.lines.length ? [list] : []));
}

// runner(): the page's one BrowserRunner, created on first use.
export function wireBox(box, runner) {
  const code = box.querySelector("textarea.code");
  const original = code.defaultValue; // the code as the page was built
  const key = `jf:${location.pathname}:${box.dataset.box}`; // the path carries the volume
  const controls = element("div", "controls");
  const runButton = button("Run", run);
  const endButton = button("End input", endInput);
  const resetButton = button("Reset", reset);
  endButton.hidden = true;
  controls.append(runButton, endButton, resetButton);
  // Where a verdict cannot be trusted there is none (DESIGN section 3): only a box with a check offers Check. The
  // check's values stay the strings the build published: Java source text that check.js writes into Java.
  const check = box.dataset.check ? JSON.parse(box.dataset.check) : null;
  if (check) resetButton.before(button("Check", checkCode));
  const out = element("div", "run");
  out.setAttribute("aria-live", "polite");
  code.after(controls, out);

  // The Run in progress: every callback of an older one finds it replaced and does nothing.
  let current = null;
  const setState = (s) => { box.dataset.state = s; };
  const edited = () => { resetButton.hidden = code.value === original; };

  const kept = readKept(key);
  if (kept != null && kept !== original) code.value = kept;
  edited();
  setState("idle");
  code.addEventListener("input", () => { writeKept(key, code.value, original); edited(); });

  function stop() {
    if (current) current.abort.abort(); // a run that ends canceled shows nothing
    // A Check stopped before its verdict is filled takes that verdict away now, not when its compile returns.
    if (current?.verdict && !current.verdict.dataset.done) current.verdict.remove();
    current = null;
    endButton.hidden = true;
  }
  function clear() { out.replaceChildren(); }

  // Output reaches the page at most once per animation frame, so a flood of lines never freezes it.
  function show(session, kind, text) {
    if (!text || session !== current) return;
    const last = session.pending[session.pending.length - 1];
    if (last && last.kind === kind) last.text += text;
    else session.pending.push({ kind, text });
    if (!session.frame) session.frame = requestAnimationFrame(() => flush(session));
  }
  function flush(session) {
    if (session.frame) cancelAnimationFrame(session.frame);
    session.frame = 0;
    if (session !== current) return;
    for (const p of session.pending) out.append(p.kind === "err" ? element("span", "err", p.text) : p.text);
    session.pending = [];
  }

  // Each run of a replay reprints what the previous run printed before its question: this run's stdout shows only
  // past that length, and its stderr only past the previous run's stderr length, so nothing appears twice.
  async function step(session, go) {
    const before = session.replay.result;
    session.skipOut = before ? before.stdout.length : 0;
    session.skipErr = before ? before.stderr.length : 0;
    session.seenOut = 0;
    session.seenErr = 0;
    await go();
    if (session !== current) return;
    flush(session);
    const replay = session.replay, r = replay.result;
    if (replay.waiting) return ask(session);
    endButton.hidden = true;
    let status = STATUS[r.status === "trap" ? "crashed" : r.status];
    if ((r.status === "crashed" || r.status === "trap") && /^Exception in thread/m.test(r.stderr)) status = null;
    // On a page that is not secure the time may have run out because the browser runs Java slowly there (D91).
    if (r.status === "timeout" && !self.isSecureContext) status += ` ${PLAIN_HTTP_SLOW}`;
    if (status) out.append(element("p", "status", status));
    if (replay.diverged) out.append(element("p", "status", STATUS.diverged));
    setState("done");
  }
  function onOut(session, text) {
    const from = Math.max(0, session.skipOut - session.seenOut);
    session.seenOut += text.length;
    show(session, "out", text.slice(from));
  }
  function onErr(session, text) {
    const from = Math.max(0, session.skipErr - session.seenErr);
    session.seenErr += text.length;
    show(session, "err", text.slice(from));
  }

  // The answer field sits inline right after what is shown, only while the replay waits for an answer.
  function ask(session) {
    const input = element("input", "answer");
    input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("aria-label", "Your answer");
    input.addEventListener("keydown", (e) => {
      if (session !== current || !session.replay.waiting || e.isComposing) return;
      if (e.key === "Enter") {
        e.preventDefault();
        setState("running");
        const answer = input.value;
        input.replaceWith(element("span", "typed", answer + "\n"));
        session.input = null;
        endButton.hidden = true;
        step(session, () => session.replay.answer(answer));
      } else if (e.ctrlKey && !e.altKey && !e.metaKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        endInput();
      }
    });
    session.input = input;
    out.append(input);
    fit(input);
    endButton.hidden = false;
    setState("waiting");
    input.focus();
  }
  // The field fills the rest of the prompt's line, or the whole next line when the prompt leaves too little room.
  function fit(input) {
    const room = out.getBoundingClientRect().right - parseFloat(getComputedStyle(out).paddingRight)
      - input.getBoundingClientRect().left;
    input.style.width = room >= input.offsetWidth ? `${Math.floor(room)}px` : "100%";
  }
  // Ctrl-D, or the End input button (phones have no Ctrl): the answers so far are all there will be.
  function endInput() {
    const session = current;
    if (!session || !session.replay?.waiting || !session.input) return;
    setState("running");
    session.input.remove();
    session.input = null;
    endButton.hidden = true;
    step(session, () => session.replay.endInput());
  }

  async function run() {
    setState("loading");
    stop();
    clear();
    const session = current = { abort: new AbortController(), pending: [], frame: 0, replay: null, input: null };
    const randomSeed = Math.floor(Math.random() * 2 ** 53); // one seed for the Run and all its replays (D16)
    const source = code.value;
    const r = runner();
    const c = await r.compile(source);
    if (session !== current) return;
    if (!c.ok) {
      // A compile that fails with diagnostics fails the same way every time, whatever its stage (javac, finding
      // main, or TeaVM's): the reader sees why. Only a compiler that died (stage "crash") says to reload.
      if (c.stage !== "crash" && c.diagnostics.length) out.append(element("span", "err javac", javacText(c.diagnostics, source)));
      else out.append(element("p", "status", STATUS.fatal));
      setState("done");
      return;
    }
    setState("running");
    session.replay = new Replay(r, c.wasm, { ...LIMITS, randomSeed, signal: session.abort.signal,
      onOut: (t) => onOut(session, t), onErr: (t) => onErr(session, t) });
    await step(session, () => session.replay.start());
  }

  // Check is a session like a Run: a Run, a Reset or another Check stops it, and stop() takes its unfilled verdict.
  async function checkCode() {
    setState("checking");
    stop();
    clear();
    const session = current = { abort: new AbortController(), pending: [], frame: 0, replay: null, input: null };
    const v = session.verdict = newVerdict(box, controls);
    const source = code.value; // the reader's edit, or the kept one
    try {
      const result = await runCheck(runner(), source, check, { signal: session.abort.signal });
      if (session !== current) return;
      showVerdict(v, check, result, source);
    } catch (e) {
      // The reader gets the fatal verdict, and the error, thrown again on its own task, still reaches the page's
      // error reporting: a mistake in Check is never swallowed.
      setTimeout(() => { throw e; });
      if (session !== current) return;
      v.replaceChildren();
      finish(v, STATUS.fatal);
    }
    setState("done");
  }

  // Reset restores the box as the page was built: its code, no output and no verdict.
  function reset() {
    setState("idle");
    stop();
    clear();
    box.querySelector(".verdict")?.remove();
    code.value = original;
    writeKept(key, original, original);
    edited();
  }
}

// A predict box: the reader says what the program will print, and Check compares. The answer is check.expected, the
// program's output the build recorded, which Check then shows; nothing runs.
export function wirePredict(box) {
  const check = JSON.parse(box.dataset.check);
  const label = element("label", "predict", "What will it print?");
  const prediction = element("textarea", "prediction");
  prediction.rows = 3;
  prediction.spellcheck = false;
  prediction.setAttribute("wrap", "off");
  label.append(prediction);
  const controls = element("div", "controls");
  controls.append(button("Check", () => {
    const v = newVerdict(box, controls);
    finish(v, predictVerdict(prediction.value, check.expected).text, element("pre", "output", check.expected));
  }));
  box.querySelector("pre.predict-code").after(label, controls);
}
