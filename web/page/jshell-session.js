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
// One jshell session in the scratchpad: Ristretto's unmodified worker (D48) running the course's own jshell front end
// (runtime/jshell/, D55, D56, D62), spoken to in Ristretto's own protocol, one line per request. It downloads the five
// files in ASSETS, each at its hash-qualified URL (<name>?sha256=<the manifest's hash>), checks each against
// site/scratchpad/manifest.json's size and SHA-256, and keeps each in Cache Storage under that same URL, so a new front
// end costs a reader its small jar, never the 22 MB zip again. GitHub Pages lets a browser keep any file for ten
// minutes, so the manifest itself is asked of the site every time, never taken from the browser's HTTP cache; and
// worker.js (under the manifest's version, worker.js?v=<version>) and a file whose hash changed each have a URL no HTTP
// cache holds yet, since the site serves a file whatever its query. A kept manifest, worker or file would meet a
// re-pin's new files. Once the five files are verified, the front end's jar goes into Ristretto's pinned jdk.zip
// (compose.js, in memory: every published byte stays as pinned), and the worker is handed the result as its
// jdk.zip. The client owns the stop policy (D49): Stop, a per-entry deadline and output caps. The engine runs each
// entry in one synchronous call that nothing can interrupt, so every stop terminates the worker and ends the session.
// Every ending is named (endedBy) and said in plain words (endedWords). Each answer carries the prompt the front end
// gives next. /reset and /reload start a fresh VM inside that one request (Ristretto's lib.rs), so such a line gets a
// boot's deadline and says it is starting jshell; the client never restarts jshell itself. No DOM:
// web/page/scratchpad.js draws the panel, and runtime/jshell/test/check.mjs drives this same class, under Node and in a
// browser, against the real jshell.
import { withFrontEnd } from "./compose.js";
import { sha256Hex } from "./sha256.js";

export const ASSETS = ["jdk.zip", "runner.core.wasm", "runner.core2.wasm", "runner.core3.wasm", "browser-jshell.jar"];
const FRONT_END = "browser-jshell.jar"; // composed into jdk.zip; the worker is handed the other four
// The front end's command names, as it lists them (runtime/jshell/src/foundations/scratchpad/Commands.java, NAMES), so
// a line's command resolves here as it does there: the exact name, else the one name the word begins.
// web/test/jshell-session.mjs keeps this list equal to the front end's own.
export const COMMANDS = ["/list", "/edit", "/drop", "/save", "/open", "/vars", "/methods", "/types", "/imports",
  "/exit", "/env", "/reset", "/reload", "/history", "/debug", "/help", "/set", "/?", "/!"];
const RESTARTS = ["/reset", "/reload"];
const CACHE = "jf-scratchpad";
const TERMINAL = new Set(["ready", "completions", "error", "done"]);
// A /reload replays the session's entries on the fresh VM, each at about the cost it had when typed. Measured: the
// replay of 50 entries took 0.88 times their first run under Node, 1.03 in Chromium, 1.00 in WebKit and 1.09 in Firefox,
// after a fresh VM's boot of 9 to 15 s (Firefox's first boot takes about a minute; a restart's, 15 s); its total grows
// faster than the count, since later entries cost more (100 entries: 106 s under Node). So a /reload gets the boot
// deadline plus twice what the session's entries have taken so far.
const REPLAY_FACTOR = 2;

// What the engine's Rust runtime writes to stderr just before the worker reports an error. It means nothing to a
// reader, so it is never shown; the ending's plain words take its place. Recorded under Node (web/test/jshell-session.mjs's
// real round trip) and, by the research, in Chromium, WebKit and Firefox: the text is the WebAssembly's own, the same
// in every engine. A panic is a blank line, the "panicked at" line, its message, then the note. The abort's text is
// matched at the line's end only: it can complete a program's unfinished System.err.print ("Working...memory
// allocation of 8000000 bytes failed"), and stderrLine splits such a line there.
const RUST_ABORT = /memory allocation of \d+ bytes failed$/;
const RUST_PANIC = /^thread '.*' \(\d+\) panicked at .+:\d+:\d+:$/;
const RUST_NOTE = /^note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace$/;
// How each of those lines begins: of the stderr text held without its newline when Stop or the deadline ends the session
// (end()), only what comes before the first of these is shown. The abort's line arrives in pieces, "memory allocation
// of " first, and can follow a program's unfinished System.err.print on the same line, so it counts wherever it is; a
// panic's "thread '" line and its note open their own line, after a blank one, so they count only at the start of the
// held text, and a program's own words that name a thread are not cut.
const RUST_START = /^(?:thread '|note: run with `RUST_BACKTRACE)|memory allocation of /;
// Running out of memory, three ways. The Rust allocator aborts (RUST_ABORT) when the engine cannot grow; a Rust panic
// says "capacity overflow" for an impossible allocation (new int[Integer.MAX_VALUE]); and the worker's glue fails once
// the engine's memory passes 2 GiB, which ends a session after roughly 70 to 150 entries, fewer when it declares many
// classes (about 50 in the worst case measured: 54 in the front end's class-heavy session), since the engine never
// gives memory back. That last one reaches the client as an error event whose message is the JavaScript engine's own
// RangeError text.
const OUT_OF_MEMORY_PANICS = [/^capacity overflow$/];
const OUT_OF_MEMORY_ERRORS = [
  /Start offset -\d+ is outside the bounds of the buffer/, // V8: Node, Chromium
  /byteOffset cannot be negative/, // WebKit
  /invalid or out-of-range index/, // Firefox
];
const EXITED = /^Java exited unsuccessfully \(code \d+\)\.$/; // System.exit with a nonzero status (the code is always 1)
// Ristretto's own output stop, at 1 MiB of UTF-8 (the client counts characters, so text of wider characters meets it
// first): the worker's words, or the engine's, which is what the course's front end's output meets (recorded under Node).
const ENGINE_OUTPUT_CAP = /^Output exceeded 1 MiB; (session|execution) stopped\.$/;

const GONE = "The session ended, and its variables and methods are gone.";
function words(endedBy, detail) {
  switch (endedBy) {
    case "stopped": return `Stopped. ${GONE}`;
    case "timeout": return `This entry ran for ${Math.round(detail / 1000)} seconds without finishing, so it was stopped. ${GONE}`;
    case "output-limit": return `This entry printed more than the scratchpad can show, so it was stopped. ${GONE}`;
    case "out-of-memory": return "This session ran out of memory, so it ended, and its variables and methods are gone. A session " +
      "keeps everything it makes until it ends, so a program that keeps making things, or a long session (roughly 70 " +
      "to 150 entries, fewer when it declares many classes), fills it up.";
    case "exited": return "This session has ended (System.exit or /exit).";
    case "failed-to-load": return `The scratchpad could not start: ${detail}.`;
    default: return `The scratchpad's Java engine failed. ${GONE}`;
  }
}

// The command a line restarts jshell with (/reset or /reload), resolved as the front end resolves it (Commands.java:
// a line that starts with "/" is a command, named by its first word, up to a space); else null. A line typed at a
// continuation is never a command. A /reset the front end refuses (an unknown option) is still treated as a restart
// here: it only gets a longer deadline than it needs.
function restartOf(line) {
  const text = line.trimEnd();
  if (!text.startsWith("/")) return null;
  const word = text.split(" ", 1)[0];
  const names = COMMANDS.includes(word) ? [word] : COMMANDS.filter((n) => n.startsWith(word));
  return names.length === 1 && RESTARTS.includes(names[0]) ? names[0] : null;
}

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
// The browser's own digest where it has one; a page served over plain http has no crypto.subtle (a browser gives it only to
// a secure page), and sha256.js is the course's own (D79).
const sha256 = async (bytes) => typeof globalThis.crypto?.subtle?.digest === "function"
  ? hex(await crypto.subtle.digest("SHA-256", bytes)) : sha256Hex(bytes);
const matches = async (bytes, want) => bytes.length === want.size && (await sha256(bytes)) === want.sha256;
async function fetchBytesDefault(url, init) {
  const r = await fetch(url, init);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return new Uint8Array(await r.arrayBuffer());
}

export class JShellSession {
  // base: the URL of site/scratchpad/ (it holds worker.js, manifest.json and ASSETS). createWorker, fetchBytes and
  // caches are the browser's own unless a caller (a Node test) passes its own; fetchBytes(url, init) takes fetch's init
  // (the manifest's is { cache: "no-cache" }) and a file's hash-qualified URL, and one reading files from disk may
  // ignore the init and the query.
  constructor(base, { deadlineMs = 60_000, bootDeadlineMs = 240_000, outputLimitChars = 1_000_000,
      outputLimitLines = 100_000, onOutput = () => {}, onState = () => {}, onProgress = () => {},
      createWorker = (url) => new Worker(url, { type: "module" }), fetchBytes = fetchBytesDefault,
      caches = globalThis.caches } = {}) {
    this.base = new URL(base);
    Object.assign(this, { deadlineMs, bootDeadlineMs, outputLimitChars, outputLimitLines, onOutput, onState,
      onProgress, createWorker, fetchBytes, caches });
    this.state = "idle"; // idle | loading | ready | busy | ended
    this.endedBy = null; // stopped | timeout | output-limit | out-of-memory | crashed | exited | failed-to-load
    this.endedWords = null;
    this.banner = null;
    this.assets = null; // the files the worker takes, verified and composed, kept so a new session downloads nothing
    this.version = null; // the manifest's version, which names worker.js
    this.worker = null;
    this.pending = null; // the one request in flight
    this.nextId = 1;
    this.generation = 0; // bumped by every start and every ending: work for an earlier session then does nothing
    this.interrupt = null; // settles a start that is still downloading
    this.continuation = false; // the front end waits for more of a snippet (or of an /exit's argument)
    // ms the session's entries have taken since start(), restarts aside: an upper bound on what any /reload replays. A
    // /reset leaves it alone on purpose: /reload -restore after a /reset replays the entries from before it (the front
    // end's Commands.java reload, Shell.java restart), so a count zeroed at the /reset would stop that replay early.
    this.ran = 0;
  }
  set(state) { this.state = state; this.onState(state); }
  endError() { return Object.assign(new Error(this.endedWords), { reason: this.endedBy }); }

  // Resolves { banner, prompt } when jshell is ready for its first entry. Rejects (an Error whose reason is endedBy)
  // when the session ends first: a download or check fails, the browser will not start the worker, the engine fails or
  // does not answer in bootDeadlineMs, or stop().
  async start() {
    if (this.state !== "idle" && this.state !== "ended") throw new Error(`start() while ${this.state}`);
    const generation = ++this.generation;
    this.endedBy = this.endedWords = null;
    this.continuation = false;
    this.ran = 0;
    this.set("loading");
    const kept = Boolean(this.assets); // a start from the files an earlier session verified
    if (!kept) this.onProgress("download"); // a new session from the files already verified downloads nothing
    // Stop during the download settles start at once; the download, left to finish, is then thrown away.
    const stopped = new Promise((resolve) => { this.interrupt = resolve; });
    let loaded;
    try {
      const load = this.assets ? Promise.resolve({ version: this.version, assets: this.assets }) : this.loadAssets();
      load.catch(() => {});
      loaded = await Promise.race([load, stopped]);
    } catch (e) {
      if (generation === this.generation) this.end("failed-to-load", e.message);
      throw this.endError();
    }
    if (generation !== this.generation) throw this.endError(); // stopped during the download
    this.assets = loaded.assets;
    this.version = loaded.version;
    try { this.worker = this.createWorker(new URL(`worker.js?v=${encodeURIComponent(this.version)}`, this.base).href); }
    catch (e) { this.end("failed-to-load", `the browser did not start its worker (${e.message})`); throw this.failedStart(kept); }
    const r = await this.request("", { boot: true, assets: this.assets, deadlineMs: this.bootDeadlineMs });
    if (r.status !== "ready") throw this.failedStart(kept);
    this.banner = r.output;
    this.set("ready");
    return { banner: r.output, prompt: r.prompt };
  }
  // A start from kept files that fails to load forgets them, and the version that named its worker.js: the site serves
  // its current worker.js whatever the version asked (it ignores the query), which after a release need not fit the
  // kept files, so the next start reads the manifest afresh. Any other start, or ending, keeps them.
  failedStart(kept) {
    if (kept && this.endedBy === "failed-to-load") this.assets = this.version = null;
    return this.endError();
  }

  // One line, as the reader pressed Enter. Resolves { status: "ready", continuation, prompt } (continuation: jshell
  // waits for more of the snippet; prompt: the front end's next prompt, null if it gave none) or { status: "ended",
  // reason }.
  async submit(line) {
    if (this.state !== "ready") throw new Error(`submit() while ${this.state}`);
    if (/[\r\n]/.test(line)) throw new Error("submit() takes one line");
    this.set("busy");
    const restart = this.continuation ? null : restartOf(line);
    if (!restart) return this.request(line, { deadlineMs: this.deadlineMs });
    // A fresh VM boots inside this request, and a /reload then replays the session on it: a boot's deadline (and the
    // replay's), and the words for a boot, though Ristretto's worker sends no phase event for it.
    this.onProgress("jshell");
    const replay = restart === "/reload" ? REPLAY_FACTOR * this.ran : 0;
    return this.request(line, { restart, deadlineMs: this.bootDeadlineMs + replay });
  }
  // Forgets a half-typed snippet, an /exit's argument included (jshell's Ctrl-C).
  async cancel() {
    if (this.state !== "ready") throw new Error(`cancel() while ${this.state}`);
    this.set("busy");
    return this.request("", { operation: "cancel", deadlineMs: this.deadlineMs });
  }
  stop() { this.end("stopped"); }

  // The manifest, asked of the site past the HTTP cache; the five files, each from the cache or downloaded at its
  // hash-qualified URL and checked; then the manifest's version and the worker's four files, with the front end
  // composed into jdk.zip.
  async loadAssets() {
    let manifestBytes, files, version;
    try { manifestBytes = await this.fetchBytes(new URL("manifest.json", this.base).href, { cache: "no-cache" }); }
    catch (e) { throw new Error(`manifest.json could not be downloaded (${e.message})`); }
    try { ({ files, version } = JSON.parse(new TextDecoder().decode(manifestBytes))); }
    catch { throw new Error("manifest.json is not JSON"); }
    const want = ASSETS.map((name) => {
      const f = files?.[name];
      if (typeof f?.sha256 !== "string" || !Number.isInteger(f?.size)) throw new Error(`manifest.json does not list ${name}`);
      return f;
    });
    if (typeof version !== "string" || !version) throw new Error("manifest.json does not give its version");
    // Each file's URL names its hash: its key in Cache Storage, and the URL it is downloaded from (the site ignores the
    // query), so a browser's HTTP cache never hands back an older file of the same name.
    const keys = ASSETS.map((name, i) => new URL(`${name}?sha256=${want[i].sha256}`, this.base).href);
    const cache = await this.openCache(new Set(keys));
    const verified = await Promise.all(ASSETS.map(async (name, i) => {
      let bytes = await this.fromCache(cache, keys[i], want[i]);
      if (!bytes) {
        bytes = await this.download(name, keys[i], want[i]);
        try { await cache?.put(keys[i], new Response(bytes)); } catch { /* storage refused: the next open downloads again */ }
      }
      return [name, bytes];
    }));
    const jar = verified.find(([name]) => name === FRONT_END)[1];
    return { version, assets: verified.filter(([name]) => name !== FRONT_END)
      .map(([name, bytes]) => [name, name === "jdk.zip" ? withFrontEnd(bytes, jar) : bytes]) };
  }
  // A file downloaded and checked. One whose bytes do not match is asked for once more, past the HTTP cache: a new deploy
  // can take a few minutes to reach every server of a CDN, and one still serving the old file hands back bytes that
  // cannot match the new manifest (P3b-54). A file that fails twice is not whole.
  async download(name, key, want) {
    for (const init of [undefined, { cache: "reload" }]) {
      let bytes;
      try { bytes = await this.fetchBytes(key, init); }
      catch (e) { throw new Error(`${name} could not be downloaded (${e.message})`); }
      if (await matches(bytes, want)) return bytes;
    }
    throw new Error(`${name} did not download whole (reloading the page in a few minutes may help: a new version can take that long to reach every server)`);
  }
  // One cache holds the scratchpad's files, each under its own hash (keys), so a new pin never reads an old file and one
  // changed file leaves the others cached; an entry the manifest no longer lists is deleted. Storage can be refused (a
  // private window, blocked site data); then every open downloads.
  async openCache(keys) {
    if (!this.caches) return null;
    try {
      const cache = await this.caches.open(CACHE);
      for (const request of await cache.keys()) if (!keys.has(request.url)) await cache.delete(request);
      return cache;
    } catch { return null; }
  }
  // A cached file is checked like a downloaded one; one that fails is deleted and downloaded again.
  async fromCache(cache, key, want) {
    if (!cache) return null;
    try {
      const r = await cache.match(key);
      if (!r) return null;
      const bytes = new Uint8Array(await r.arrayBuffer());
      if (await matches(bytes, want)) return bytes;
      await cache.delete(key);
    } catch { /* unreadable: download instead */ }
    return null;
  }

  // Exactly one request is in flight at a time: Ristretto's worker drops a message that arrives while it is busy.
  request(source, { operation = "input", boot = false, restart = null, assets = null, deadlineMs }) {
    const id = this.nextId++;
    return new Promise((resolve) => {
      const p = { id, boot, restart, sent: Date.now(), resolve, output: "", chars: 0, lines: 0, held: "", blank: false, panic: false, memory: false };
      p.timer = setTimeout(() => {
        const within = `jshell did not answer within ${Math.round(deadlineMs / 1000)} seconds`;
        if (boot) return this.end("failed-to-load", within);
        // A restart that does not answer is a failed load too: the fresh VM never came up, or its replay never ended.
        if (restart) return this.end("failed-to-load", `after ${restart}, ${within}`);
        this.end("timeout", deadlineMs);
      }, deadlineMs);
      this.pending = p;
      // A stopped worker's late error is ignored, as receive ignores its late messages.
      const worker = this.worker;
      worker.onmessage = (e) => this.receive(p, e.data);
      worker.onerror = (e) => { e?.preventDefault?.(); if (this.worker === worker) this.fault(p, String(e?.message ?? "")); };
      worker.onmessageerror = () => { if (this.worker === worker) this.fault(p, ""); };
      const request = { id, javaVersion: 25, action: "jshell", className: "BrowserJShell", source, operation, cursor: 0 };
      worker.postMessage(assets ? { request, assets } : { request });
    });
  }
  receive(p, m) {
    if (this.pending !== p || m?.id !== p.id) return; // late: an earlier request's, or a stopped worker's
    if (m.type === "phase") { if (p.boot) this.onProgress(m.phase === "loading" ? "engine" : "jshell"); return; }
    if (m.type === "output") return this.output(p, String(m.text), m.stream === "stderr" ? "stderr" : "stdout");
    if (!TERMINAL.has(m.type)) return;
    this.flushHeld(p);
    if (m.type === "ready") return this.ready(p, m);
    if (m.type === "error") return this.fault(p, String(m.message));
    if (m.type === "done") return this.state === "loading" ? this.end("failed-to-load", "jshell exited while starting") : this.end("exited");
    this.fault(p, ""); // completions: this client never asks for them, so the protocol is not the one it knows
  }
  // Output is counted as it arrives. stdout is passed on at once; stderr is held to the end of each line, so a Rust
  // runtime line can be recognized and withheld, and is passed on before anything that arrives after it.
  output(p, text, stream) {
    p.chars += text.length;
    p.lines += text.split("\n").length - 1;
    if (p.chars > this.outputLimitChars || p.lines > this.outputLimitLines) return this.end("output-limit");
    if (stream === "stdout") { this.flushHeld(p); return this.show(p, text, "stdout"); }
    p.held += text;
    for (let nl = p.held.indexOf("\n"); nl >= 0; nl = p.held.indexOf("\n")) {
      const line = p.held.slice(0, nl);
      p.held = p.held.slice(nl + 1);
      this.stderrLine(p, line);
    }
  }
  stderrLine(p, line) {
    if (p.panic) {
      if (RUST_NOTE.test(line)) p.panic = false;
      else if (OUT_OF_MEMORY_PANICS.some((r) => r.test(line))) p.memory = true;
      return;
    }
    if (RUST_PANIC.test(line)) { p.blank = false; p.panic = true; return; }
    const abort = line.search(RUST_ABORT);
    if (abort > 0) { // a program's unfinished System.err.print, completed by the abort's line: the program's part is shown
      if (p.blank) { p.blank = false; this.show(p, "\n", "stderr"); }
      this.show(p, line.slice(0, abort), "stderr");
    }
    if (abort >= 0) { p.blank = false; p.memory = true; return; }
    if (RUST_NOTE.test(line)) return;
    if (p.blank) { p.blank = false; this.show(p, "\n", "stderr"); }
    if (line === "") { p.blank = true; return; } // held: a Rust panic begins with a blank line
    this.show(p, line + "\n", "stderr");
  }
  flushHeld(p) {
    if (p.blank) { p.blank = false; this.show(p, "\n", "stderr"); }
    if (p.held) { const text = p.held; p.held = ""; this.show(p, text, "stderr"); }
  }
  // What a program printed to stderr and the client still holds when Stop or the deadline ends it (its last
  // System.err.print), up to where a Rust runtime line begins; nothing when it is part of a Rust panic or begins with
  // a Rust runtime line.
  flushProgram(p) {
    const rust = p.held.search(RUST_START);
    if (p.panic || rust === 0) return;
    if (rust > 0) p.held = p.held.slice(0, rust);
    this.flushHeld(p);
  }
  show(p, text, stream) { if (p.boot) p.output += text; else this.onOutput(text, stream); }
  ready(p, m) {
    if (m.closed) return this.state === "loading" ? this.end("failed-to-load", "jshell closed while starting") : this.end("exited");
    clearTimeout(p.timer);
    this.pending = null;
    if (!p.boot && !p.restart) this.ran += Date.now() - p.sent;
    this.continuation = Boolean(m.continuation);
    const prompt = typeof m.prompt === "string" ? m.prompt : null;
    if (p.boot) return p.resolve({ status: "ready", output: p.output, prompt });
    this.set("ready");
    p.resolve({ status: "ready", continuation: this.continuation, prompt });
  }
  // The engine is unusable after any error (every later request answers "unreachable"), so every fault ends the session.
  fault(p, message) {
    if (this.state === "loading") return this.end("failed-to-load", "the Java engine failed while starting");
    if (EXITED.test(message)) return this.end("exited");
    if (ENGINE_OUTPUT_CAP.test(message)) return this.end("output-limit");
    if (p.memory || OUT_OF_MEMORY_ERRORS.some((r) => r.test(message))) return this.end("out-of-memory");
    this.end("crashed");
  }
  // The first ending wins. The worker is terminated, the request in flight answers { status: "ended", reason }. Stderr
  // text still held goes out ahead of the ending only after Stop or the deadline, which the program did not cause;
  // after an ending the engine caused (crashed, out-of-memory, output-limit) no more of its text reaches the reader.
  end(endedBy, detail) {
    if (this.state === "ended" || this.state === "idle") return;
    this.generation++;
    this.interrupt?.();
    this.interrupt = null;
    this.endedBy = endedBy;
    this.endedWords = words(endedBy, detail);
    this.worker?.terminate();
    this.worker = null;
    const p = this.pending;
    this.pending = null;
    if (p && (endedBy === "stopped" || endedBy === "timeout")) this.flushProgram(p);
    this.set("ended");
    if (p) { clearTimeout(p.timer); p.resolve({ status: "ended", reason: endedBy }); }
  }
}
