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
// JShellSession under Node. First against a fake of Ristretto's worker, for every state change and every ending a
// reader can meet (a real engine cannot be made to fail on cue, and a browser would make each check cost a boot);
// then against the real pinned worker running the course's front end in a worker thread: a round trip with its
// prompts, a cancel at an unfinished /exit, a real /reset and /reload, a real memory abort and the engine's other ways
// of giving out (an impossible allocation, Ristretto's own 1 MiB stop, memory past 2 GiB), the client's line cap met by
// a real runaway of short lines, a real deadline, a real Stop.
// The fake's events copy the real worker's, recorded by the real round trip's probes.
//   node web/test/jshell-session.mjs [--scratchpad <dir>]   (<dir>: a built site's scratchpad/, holding manifest.json;
//   default: a fixture site built by harness.buildSite)
import fs from "node:fs";
import path from "node:path";
import { JShellSession, ASSETS, COMMANDS } from "../page/jshell-session.js";
import { withFrontEnd } from "../page/compose.js";
import { check, done, REPO } from "./harness.mjs";
import { nodeWorker, nodeFetchBytes, scratchpadDir, dirUrl } from "./jshell-node.mjs";

const USAGE = "usage: node web/test/jshell-session.mjs [--scratchpad <dir>]\n" +
  "  <dir>: a built site's scratchpad directory, holding manifest.json (not a release directory, which has none)";
const BASE = "https://course.test/vol-1/scratchpad/";
const BANNER = "|  Welcome to JShell -- Version 25.0.4.1\n|  For an introduction type: /help intro\n";
const PROMPT = "\njshell> ", MORE = "   ...> ";
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const sha = async (bytes) => hex(await crypto.subtle.digest("SHA-256", bytes));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Every check that waits gets a wall clock, so a client that hangs fails the check instead of hanging the test.
const within = (ms, p) => Promise.race([p, sleep(ms).then(() => ({ status: "no-answer" }))]);
const text = (s) => new TextEncoder().encode(s);

// A stored zip archive of the given entries (no compression, no CRCs, which compose.js never reads): the fake
// jdk.zip, holding a browser-jshell.jar for the course's front end to replace.
function storedZip(entries) {
  const parts = [], central = [];
  let offset = 0;
  for (const [name, data] of entries) {
    const n = text(name);
    const local = new Uint8Array(30 + n.length), lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 10, true); lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true); lv.setUint16(26, n.length, true); local.set(n, 30);
    const c = new Uint8Array(46 + n.length), cv = new DataView(c.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 10, true); cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true); cv.setUint16(28, n.length, true); cv.setUint32(42, offset, true); c.set(n, 46);
    parts.push(local, data);
    central.push(c);
    offset += local.length + data.length;
  }
  const size = central.reduce((s, c) => s + c.length, 0);
  const end = new Uint8Array(22), ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, entries.length, true); ev.setUint16(10, entries.length, true);
  ev.setUint32(12, size, true); ev.setUint32(16, offset, true);
  const out = new Uint8Array(offset + size + 22);
  let at = 0;
  for (const p of [...parts, ...central, end]) { out.set(p, at); at += p.length; }
  return out;
}

// The files a fake site serves: five small assets (jdk.zip a real archive, as compose.js needs) and a manifest of
// their real hashes.
const FILES = Object.fromEntries(ASSETS.map((n) => [n, text(`the bytes of ${n}`)]));
FILES["jdk.zip"] = storedZip([["lib/modules", text("the JDK's classes")], ["browser-jshell.jar", text("Ristretto's own front end")]]);
// version: the manifest's (null: none).
const manifestOf = async (files, version = "test") => text(JSON.stringify({ ...(version === null ? {} : { version }),
  files: Object.fromEntries(await Promise.all(Object.entries(files).map(async ([n, b]) => [n, { sha256: await sha(b), size: b.length }]))) }));
const MANIFEST = await manifestOf(FILES);
const COMPOSED = withFrontEnd(FILES["jdk.zip"], FILES["browser-jshell.jar"]);
// A file's hash-qualified URL: where the client downloads it from, and its key in Cache Storage.
const keyOf = async (name, bytes) => `${BASE}${name}?sha256=${await sha(bytes)}`;
const KEYS = await Promise.all(ASSETS.map((n) => keyOf(n, FILES[n])));
// fetched: every URL asked for, in order; cache: what each last asked of the HTTP cache (fetch's init.cache, or null).
// The site serves a file by its path, whatever the query (as GitHub Pages does); change replaces a file's body, or
// throws, or waits. httpCache holds what a browser's HTTP cache kept for an exact URL (a name with its query, if any),
// which it hands back unless the request says no-cache.
function fakeSite(change = {}, httpCache = {}) {
  const fetched = [], cache = {};
  const fetchBytes = async (url, init) => {
    fetched.push(url);
    cache[url] = init?.cache ?? null;
    const asked = url.slice(BASE.length), name = asked.split("?")[0];
    if (asked in httpCache && init?.cache !== "no-cache") return httpCache[asked];
    if (change[name] instanceof Error) throw change[name];
    if (change[name] instanceof Promise) return change[name];
    if (change[name]) return change[name];
    if (name === "manifest.json") return MANIFEST;
    if (FILES[name]) return FILES[name];
    throw new Error("HTTP 404");
  };
  return { fetched, cache, fetchBytes };
}
// A fake of Ristretto's worker. answer(request, w) replies through w.emit; a request it does not answer is never
// answered. emit delivers even after terminate(), the worst a real worker could do with a message already queued.
// Its ready answers carry a prompt, as the course's front end's do.
const ok = (r, extra = {}) => ({ id: r.id, type: "ready", continuation: false, closed: false, reset: false, prompt: PROMPT, ...extra });
const out = (r, text, stream = "stdout") => ({ id: r.id, type: "output", stream, text });
function bootThen(answer) {
  return (r, w) => {
    if (r.source === "" && r.operation === "input" && w.boots++ === 0) {
      w.emit({ id: r.id, type: "phase", phase: "loading" });
      w.emit({ id: r.id, type: "phase", phase: "evaluating" });
      w.emit(out(r, BANNER.slice(0, 20)));
      w.emit(out(r, BANNER.slice(20)));
      return w.emit(ok(r));
    }
    answer(r, w);
  };
}
function session(answer, opts = {}, site = fakeSite()) {
  const log = { workers: [], output: [], states: [], progress: [] };
  const s = new JShellSession(BASE, {
    fetchBytes: site.fetchBytes, caches: null,
    createWorker: (url) => {
      const w = { url, posts: [], boots: 0, terminated: false, onmessage: null, onerror: null,
        postMessage(m) { w.posts.push(m); setTimeout(() => { if (!w.terminated) answer(m.request, w); }, 0); },
        terminate() { w.terminated = true; },
        emit(e) { w.onmessage?.({ data: e }); } };
      log.workers.push(w);
      return w;
    },
    onOutput: (text, stream) => log.output.push([stream, text]),
    onState: (st) => log.states.push(st),
    onProgress: (ph) => log.progress.push(ph),
    ...opts,
  });
  return { s, log, site, w: () => log.workers.at(-1) };
}
const started = async (answer, opts) => { const t = session(bootThen(answer), opts); await within(2000, t.s.start()); return t; };
const shown = (log) => log.output.map(([, t]) => t).join("");

// ---- the stop policy's numbers (D49) ----
const d = new JShellSession(BASE);
check("the client's limits are D49's: 60,000 ms an entry, 240,000 ms a boot, 1,000,000 characters or 100,000 lines of output an entry",
  d.deadlineMs === 60_000 && d.bootDeadlineMs === 240_000 && d.outputLimitChars === 1_000_000 && d.outputLimitLines === 100_000,
  { deadlineMs: d.deadlineMs, bootDeadlineMs: d.bootDeadlineMs, outputLimitChars: d.outputLimitChars, outputLimitLines: d.outputLimitLines });

// ---- starting ----
let t = session(bootThen(() => {}));
let r = await within(2000, t.s.start());
const first = t.w().posts[0];
check("start downloads the manifest, then the five files, each at its hash-qualified URL (<name>?sha256=<hash>), and nothing else",
  JSON.stringify(t.site.fetched.slice(0, 1)) === JSON.stringify([BASE + "manifest.json"])
    && JSON.stringify(t.site.fetched.slice(1).sort()) === JSON.stringify([...KEYS].sort()), t.site.fetched);
check("the worker is the site's own worker.js under the manifest's version, so a browser that kept an old worker.js never runs it",
  t.w().url === BASE + "worker.js?v=test", t.w().url);
check("manifest.json is asked of the site past the HTTP cache (cache: no-cache); the five files at URLs that name their hashes, which an HTTP cache may keep",
  t.site.cache[BASE + "manifest.json"] === "no-cache" && KEYS.every((k) => t.site.cache[k] === null), t.site.cache);
check("the first request is Ristretto's jshell request with the worker's four files, the course's front end composed into jdk.zip",
  JSON.stringify(first.request) === JSON.stringify({ id: 1, javaVersion: 25, action: "jshell", className: "BrowserJShell", source: "", operation: "input", cursor: 0 })
    && JSON.stringify(first.assets.map(([n]) => n)) === JSON.stringify(["jdk.zip", "runner.core.wasm", "runner.core2.wasm", "runner.core3.wasm"])
    && (await sha(first.assets[0][1])) === (await sha(COMPOSED)) && first.assets[1][1] === FILES["runner.core.wasm"],
  { request: first.request, assets: first.assets.map(([n, b]) => [n, b.length]) });
check("start resolves with jshell's banner and its first prompt, and the banner is not also sent as output",
  r?.banner === BANNER && r?.prompt === PROMPT && t.log.output.length === 0, { r, output: t.log.output });
check("start goes idle to loading to ready, and says what it is doing", t.log.states.join(" ") === "loading ready"
  && t.log.progress.join(" ") === "download engine jshell" && t.s.state === "ready", t.log);
// The browser's own fetch, which the client uses when it is given no fetchBytes, is asked the same way.
const browserFetch = globalThis.fetch, fetchAsked = [];
globalThis.fetch = async (url, init) => {
  fetchAsked.push([String(url).slice(BASE.length), init?.cache ?? null]);
  return new Response(await fakeSite().fetchBytes(String(url)));
};
t = session(bootThen(() => {}), { fetchBytes: undefined });
try { r = await within(2000, t.s.start()).catch((x) => x); } finally { globalThis.fetch = browserFetch; }
check("with no fetchBytes of its own, the client asks the browser's fetch for manifest.json with cache: no-cache, the files at their hash-qualified URLs",
  r?.banner === BANNER && JSON.stringify(fetchAsked[0]) === JSON.stringify(["manifest.json", "no-cache"])
    && JSON.stringify(fetchAsked.slice(1).sort()) === JSON.stringify(KEYS.map((k) => [k.slice(BASE.length), null]).sort()), fetchAsked);
// GitHub Pages lets a browser keep any file for ten minutes. A browser that fetched the old jar by its bare name just
// before a release changed it would get the old bytes back, fail their hash and refuse to start until the ten minutes
// were up (Chromium and Firefox do; the final review's probe): the fake's HTTP cache holds the old jar under its bare
// name. At its hash-qualified URL the new jar is a URL no HTTP cache holds.
const newJar = text("the bytes of a new front end");
t = session(bootThen(() => {}), {}, fakeSite({ "browser-jshell.jar": newJar,
  "manifest.json": await manifestOf({ ...FILES, "browser-jshell.jar": newJar }, "test3") }, { "browser-jshell.jar": FILES["browser-jshell.jar"] }));
r = await within(2000, t.s.start()).catch((x) => x);
check("after a release, a jar the browser's HTTP cache still holds under its bare name is never asked for: the new jar comes from its hash-qualified URL, and jshell starts",
  r?.banner === BANNER && t.site.fetched.includes(await keyOf("browser-jshell.jar", newJar)) && !t.site.fetched.includes(BASE + "browser-jshell.jar")
    && (await sha(t.w().posts[0].assets[0][1])) === (await sha(withFrontEnd(FILES["jdk.zip"], newJar))),
  { r: r?.banner ?? r?.message, fetched: t.site.fetched });

// ---- entries ----
t = await started((r, w) => {
  if (r.source === "2 + 3") { w.emit({ id: r.id, type: "phase", phase: "evaluating" }); w.emit(out(r, "$1 ==> 5\n")); w.emit(ok(r)); }
  else if (r.source === "if (true) {") w.emit(ok(r, { continuation: true, prompt: MORE }));
  else if (r.operation === "cancel") w.emit(ok(r));
  else if (r.source === "/set feedback concise") w.emit(ok(r, { prompt: "jshell> " }));
});
r = await within(2000, t.s.submit("2 + 3"));
check("an entry is one request without the files, and its output arrives as it is printed",
  r.status === "ready" && r.continuation === false && t.w().posts[1].assets === undefined && t.w().posts[1].request.id === 2
    && t.w().posts[1].request.source === "2 + 3" && JSON.stringify(t.log.output) === JSON.stringify([["stdout", "$1 ==> 5\n"]]), { r, output: t.log.output });
check("an entry goes busy, then ready", t.log.states.slice(-2).join(" ") === "busy ready", t.log.states);
const prompts = [r.prompt];
r = await within(2000, t.s.submit("if (true) {"));
check("a line that leaves the snippet open is a continuation", r.status === "ready" && r.continuation === true && t.s.state === "ready", r);
prompts.push(r.prompt);
r = await within(2000, t.s.cancel());
check("cancel drops the open snippet, as Ctrl-C does", r.status === "ready" && r.continuation === false
  && t.w().posts.at(-1).request.operation === "cancel" && t.w().posts.at(-1).request.source === "", { r, post: t.w().posts.at(-1) });
prompts.push(r.prompt);
r = await within(2000, t.s.submit("/set feedback concise"));
prompts.push(r.prompt);
check("each answer hands on the front end's next prompt as it is: after an entry, at a continuation, after a cancel, in concise mode",
  JSON.stringify(prompts) === JSON.stringify([PROMPT, MORE, PROMPT, "jshell> "]), prompts);
let threw = null;
try { await t.s.submit("int a = 1;\nint b = 2;"); } catch (e) { threw = e.message; }
check("one line per request: a line holding a newline is refused before anything is sent", threw === "submit() takes one line" && t.w().posts.length === 5, threw);
const busy = t.s.submit("while (true) {}");
threw = null;
try { await t.s.submit("1 + 1"); } catch (e) { threw = e.message; }
check("a second entry while one runs is refused, never sent (the worker would drop it)", threw === "submit() while busy" && t.w().posts.length === 6, { threw, posts: t.w().posts.length });
threw = null;
try { await t.s.start(); } catch (e) { threw = e.message; }
check("start while a session runs is refused", threw === "start() while busy", threw);

// ---- Stop and the deadline ----
t.s.stop();
r = await within(2000, busy);
check("Stop ends a running entry at once: the worker is terminated and the session is gone",
  r.status === "ended" && r.reason === "stopped" && t.w().terminated && t.s.state === "ended" && t.s.endedBy === "stopped", { r, state: t.s.state });
check("Stop is said in plain words", t.s.endedWords === "Stopped. The session ended, and its variables and methods are gone.", t.s.endedWords);
// The stopped worker keeps talking after a new session has started: output and an answer for the request it was
// stopped in (its own id, the late answer a real worker would send) and for another (the new session's boot's id), its
// error and a message it could not pass change nothing.
const stoppedWorker = t.w(), stoppedId = stoppedWorker.posts.at(-1).request.id;
await within(2000, t.s.start());
const before = t.log.output.length, statesBefore = t.log.states.length;
for (const id of [stoppedId, t.w().posts[0].request.id]) { stoppedWorker.emit(out({ id }, "late\n")); stoppedWorker.emit(ok({ id })); }
stoppedWorker.onerror?.({ message: "late", preventDefault() {} });
stoppedWorker.onmessageerror?.({});
await sleep(10);
check("output, an answer and an error from the stopped worker change nothing, once a new session has started",
  t.log.output.length === before && t.log.states.length === statesBefore && t.s.state === "ready" && t.s.endedBy === null,
  { output: t.log.output.slice(before), states: t.log.states.slice(statesBefore), state: t.s.state, endedBy: t.s.endedBy });
// And while the new session's first entry runs: the stopped worker's late answer to its own request neither shows its
// output nor stands in for the entry's answer.
const running = t.s.submit("2 + 3").catch((e) => ({ status: "refused", message: e.message }));
stoppedWorker.emit(out({ id: stoppedId }, "late\n"));
stoppedWorker.emit(ok({ id: stoppedId }));
r = await within(2000, running);
check("and while the new session's entry runs, the stopped worker's late answer to its own request is not taken for the entry's",
  r.status === "ready" && JSON.stringify(t.log.output.slice(before)) === JSON.stringify([["stdout", "$1 ==> 5\n"]])
    && t.log.states.slice(statesBefore).join(" ") === "busy ready", { r, output: t.log.output.slice(before), states: t.log.states.slice(statesBefore) });
// The worker in use, answering for a request other than the one in flight (an earlier id), is not heard either.
t = await started((r, w) => { w.emit(out({ id: r.id - 1 }, "stale\n")); w.emit(ok({ id: r.id - 1 })); w.emit(out(r, "fresh\n")); w.emit(ok(r)); });
r = await within(2000, t.s.submit("x"));
check("output and an answer from the worker for another request than the one in flight change nothing",
  r.status === "ready" && JSON.stringify(t.log.output) === JSON.stringify([["stdout", "fresh\n"]]) && t.log.states.join(" ") === "loading ready busy ready",
  { r, output: t.log.output, states: t.log.states });
t = await started(() => {}, { deadlineMs: 50 });
r = await within(2000, t.s.submit("while (true) {}"));
check("an entry that runs past the deadline is stopped there, its worker terminated", r.status === "ended" && r.reason === "timeout" && t.w().terminated, r);
check("the deadline is said in plain words, with its length",
  t.s.endedWords === "This entry ran for 0 seconds without finishing, so it was stopped. The session ended, and its variables and methods are gone.", t.s.endedWords);
t = await started((r, w) => { w.emit(out(r, "1\n")); w.emit(ok(r)); }, { deadlineMs: 50, bootDeadlineMs: 50 });
r = await within(2000, t.s.submit("1"));
await sleep(150);
check("an entry and a boot that finished in time are never timed out later",
  r.status === "ready" && t.s.state === "ready" && t.s.endedBy === null, { r, states: t.log.states, endedBy: t.s.endedBy });

// ---- the output caps ----
t = await started((r, w) => { for (let i = 0; i < 5; i++) w.emit(out(r, "x".repeat(40) + "\n")); w.emit(ok(r)); }, { outputLimitChars: 100 });
r = await within(2000, t.s.submit("print"));
check("output past the character cap ends the session; what came before the cap was shown",
  r.status === "ended" && r.reason === "output-limit" && t.w().terminated && t.log.output.length === 2, { r, shown: t.log.output.length });
t = await started((r, w) => { for (let i = 0; i < 5; i++) w.emit(out(r, "a\n")); w.emit(ok(r)); }, { outputLimitLines: 3 });
r = await within(2000, t.s.submit("print"));
check("output past the line cap ends the session", r.status === "ended" && r.reason === "output-limit" && t.log.output.length === 3, { r, shown: t.log.output.length });
t = await started((r, w) => { w.emit(out(r, "x".repeat(59) + "\ny\n")); w.emit(ok(r)); }, { outputLimitChars: 100, outputLimitLines: 3 });
const firstEntry = await within(2000, t.s.submit("print"));
r = await within(2000, t.s.submit("print")).catch((e) => ({ status: "refused", message: e.message }));
check("the caps count each entry's output on its own: two entries of 62 characters and 2 lines each, under caps of 100 and 3, both finish",
  firstEntry.status === "ready" && r.status === "ready" && t.s.state === "ready", { firstEntry, r, endedBy: t.s.endedBy });
t = await started((r, w) => w.emit({ id: r.id, type: "error", message: "Output exceeded 1 MiB; session stopped." }));
r = await within(2000, t.s.submit("print"));
check("the worker's own 1 MiB cap is the same ending", r.status === "ended" && r.reason === "output-limit", r);
// Recorded from the real worker running the course's front end: its output meets the engine's own stop, in the engine's
// words (endless printing of a two-byte character reaches 1 MiB of UTF-8 before the client's character cap).
t = await started((r, w) => w.emit({ id: r.id, type: "error", message: "Output exceeded 1 MiB; execution stopped." }));
r = await within(2000, t.s.submit("print"));
check("so is the engine's own 1 MiB stop, in its own words", r.status === "ended" && r.reason === "output-limit" && t.s.endedWords.startsWith("This entry printed more"),
  { r, words: t.s.endedWords });

// ---- the engine's own endings ----
t = await started((r, w) => w.emit({ id: r.id, type: "error", message: "unreachable" }));
r = await within(2000, t.s.submit("x"));
check("an engine error ends the session as crashed, and its raw message goes nowhere",
  r.status === "ended" && r.reason === "crashed" && t.w().terminated && !JSON.stringify(r).includes("unreachable")
    && !t.s.endedWords.includes("unreachable") && t.log.output.length === 0, { r, words: t.s.endedWords });
// Recorded from the real worker: an ArrayList filled with long[1_000_000] until memory runs out.
t = await started((r, w) => {
  w.emit(out(r, "l ==> []\n"));
  for (const piece of ["memory allocation of ", "8000000", " bytes failed\n", "note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace\n"]) w.emit(out(r, piece, "stderr"));
  w.emit({ id: r.id, type: "error", message: "unreachable" });
});
r = await within(2000, t.s.submit("var l = new ArrayList<long[]>(); while (true) l.add(new long[1_000_000]);"));
check("a memory abort ends the session as out-of-memory", r.status === "ended" && r.reason === "out-of-memory", r);
check("the Rust runtime's lines are withheld; Java's own output is not", shown(t.log) === "l ==> []\n", t.log.output);
check("out-of-memory is said in plain words", t.s.endedWords.startsWith("This session ran out of memory"), t.s.endedWords);
// The page never promises more than the spec measured: the words give DESIGN's range of entries a session lasts.
const designRange = /roughly \d+ to \d+ entries/.exec(fs.readFileSync(path.join(REPO, "DESIGN.md"), "utf8").replace(/\s+/g, " "))?.[0];
check(`the out-of-memory words give DESIGN's range of entries a long session lasts (${designRange}), fewer when it declares many classes`,
  designRange != null && t.s.endedWords.includes(`a long session (${designRange}, fewer when it declares many classes), fills it up.`),
  { designRange, words: t.s.endedWords });
// Recorded from the real worker: new int[Integer.MAX_VALUE].
t = await started((r, w) => {
  w.emit(out(r, "\nthread '<unnamed>' (1) panicked at /rustc/48a229ceaefd4985c50990b14116b6d856af0985/library/alloc/src/raw_vec/mod.rs:28:5:\ncapacity overflow\n", "stderr"));
  w.emit(out(r, "note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace\n", "stderr"));
  w.emit({ id: r.id, type: "error", message: "unreachable" });
});
r = await within(2000, t.s.submit("new int[Integer.MAX_VALUE]"));
check("an impossible allocation (a Rust panic, capacity overflow) is out-of-memory, and nothing of the panic is shown",
  r.reason === "out-of-memory" && t.log.output.length === 0, { r, output: t.log.output });
for (const message of ["Start offset -2070491856 is outside the bounds of the buffer", "byteOffset cannot be negative", "invalid or out-of-range index"]) {
  t = await started((r, w) => w.emit({ id: r.id, type: "error", message }));
  r = await within(2000, t.s.submit("n = n + 1"));
  check(`the end of a long session (roughly 70 to 150 entries; "${message}") is out-of-memory`, r.reason === "out-of-memory", r);
}
// Recorded from the real worker: any request after System.exit.
t = await started((r, w) => {
  w.emit(out(r, "\nthread '<unnamed>' (1) panicked at web/runner/src/lib.rs:487:40:\nCannot start a runtime from within a runtime.\n", "stderr"));
  w.emit(out(r, "note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace\n", "stderr"));
  w.emit({ id: r.id, type: "error", message: "unreachable" });
});
r = await within(2000, t.s.submit("1 + 1"));
check("a Rust panic that is not about memory is crashed, and is not shown", r.reason === "crashed" && t.log.output.length === 0, { r, output: t.log.output });
t = await started((r, w) => {
  w.emit(out(r, "|  Err", "stderr"));
  w.emit(out(r, "or:\n|  cannot find symbol\n", "stderr"));
  w.emit(out(r, "\n", "stderr"));
  w.emit(out(r, "between\n"));
  w.emit(out(r, "\n|  after a blank line\n", "stderr"));
  w.emit(out(r, "no newline", "stderr"));
  w.emit(ok(r));
});
r = await within(2000, t.s.submit("y + 1"));
check("Java's own stderr passes through whole, in arrival order, blank lines and a last line without a newline included",
  r.status === "ready" && JSON.stringify(t.log.output) === JSON.stringify([["stderr", "|  Error:\n"], ["stderr", "|  cannot find symbol\n"],
    ["stderr", "\n"], ["stdout", "between\n"], ["stderr", "\n"], ["stderr", "|  after a blank line\n"], ["stderr", "no newline"]]), t.log.output);
// stderr without its newline yet is held, in case it is a Rust runtime line. An entry that ends without another word
// from the worker still shows a program's last System.err.print when Stop or the deadline ended it (the program did not
// cause those), ahead of the ending; never one that begins a Rust runtime line, and nothing held after an ending the
// engine caused. seen: output and states in the order the client gave them, from the entry's busy on.
const heldThen = (last, finish = () => {}) => (r, w) => {
  w.emit(out(r, "Working...\n", "stderr")); w.emit(out(r, "out-part")); w.emit(out(r, last, "stderr")); finish(r, w);
};
const heldEnding = async (answer, opts = {}, stop = false) => {
  const seen = [];
  const h = await started(answer, { onOutput: (text, stream) => seen.push([stream, text]), onState: (st) => seen.push(["state", st]), ...opts });
  const entry = within(2000, h.s.submit("print"));
  if (stop) { await sleep(20); h.s.stop(); }
  const res = await entry;
  return { res, seen: seen.slice(seen.findIndex(([k, v]) => k === "state" && v === "busy")) };
};
const SHOWN_HELD = [["state", "busy"], ["stderr", "Working...\n"], ["stdout", "out-part"], ["stderr", "Still going"], ["state", "ended"]];
const NOT_HELD = [["state", "busy"], ["stderr", "Working...\n"], ["stdout", "out-part"], ["state", "ended"]];
let h = await heldEnding(heldThen("Still going"), {}, true);
check("Stop shows the program's stderr still held without its newline, ahead of the ending (a last System.err.print before a hang)",
  h.res.reason === "stopped" && JSON.stringify(h.seen) === JSON.stringify(SHOWN_HELD), h);
h = await heldEnding(heldThen("Still going"), { deadlineMs: 50 });
check("so does the deadline", h.res.reason === "timeout" && JSON.stringify(h.seen) === JSON.stringify(SHOWN_HELD), h);
h = await heldEnding(heldThen("memory allocation of "), {}, true);
check("but held text that begins a Rust runtime line (the abort's first piece) is withheld, even at Stop",
  h.res.reason === "stopped" && JSON.stringify(h.seen) === JSON.stringify(NOT_HELD), h);
// A program's unfinished System.err.print, then the engine's abort on the same line (memory ran out mid-entry): at Stop
// the program's text is shown, and nothing from the abort's opening on.
h = await heldEnding((r, w) => { w.emit(out(r, "Working...", "stderr")); w.emit(out(r, "memory allocation of 8 bytes failed", "stderr")); }, {}, true);
check("held text that joins a program's unfinished stderr to a Rust runtime line shows the program's part at Stop, never the engine's",
  h.res.reason === "stopped" && JSON.stringify(h.seen) === JSON.stringify([["state", "busy"], ["stderr", "Working..."], ["state", "ended"]]), h);
// The same join when the abort's line reaches its newline and the engine's error follows (the pieces recorded from the
// real worker): the line is split at the abort's text, the program's part shown, the rest taken as the abort, so the
// ending is out-of-memory (Ruling 8a).
h = await heldEnding((r, w) => {
  w.emit(out(r, "Working...", "stderr"));
  for (const piece of ["memory allocation of ", "8000000", " bytes failed\n", "note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace\n"]) w.emit(out(r, piece, "stderr"));
  w.emit({ id: r.id, type: "error", message: "unreachable" });
});
check("a line that joins a program's unfinished stderr to the abort's whole line shows the program's part, never the engine's, and the ending is out-of-memory",
  h.res.reason === "out-of-memory" && JSON.stringify(h.seen) === JSON.stringify([["state", "busy"], ["stderr", "Working..."], ["state", "ended"]]), h);
// Mid-text, only the abort's opening can follow a program's unfinished print: a panic's "thread '" line and its note
// open their own line, after a blank one. So a program's own held stderr that names a thread mid-text is shown whole at
// Stop, and held text that begins a panic's line is still withheld (Ruling 8b).
h = await heldEnding((r, w) => w.emit(out(r, "Waiting for thread 'main'...", "stderr")), {}, true);
check("held text that names a thread mid-text is the program's own and is shown whole at Stop",
  h.res.reason === "stopped" && JSON.stringify(h.seen) === JSON.stringify([["state", "busy"], ["stderr", "Waiting for thread 'main'..."], ["state", "ended"]]), h);
h = await heldEnding(heldThen("\nthread '<unnamed>' (1) panicked at"), {}, true);
check("but held text that begins a Rust panic's line (after its blank line) is withheld at Stop, the blank line with it",
  h.res.reason === "stopped" && JSON.stringify(h.seen) === JSON.stringify(NOT_HELD), h);
for (const [ending, finish, opts] of [
  ["crashed", (r, w) => w.onerror({ message: "Uncaught Error: boom", preventDefault() {} }), {}],
  ["out-of-memory", (r, w) => w.onerror({ message: "Start offset -2070491856 is outside the bounds of the buffer", preventDefault() {} }), {}],
  ["output-limit", (r, w) => w.emit(out(r, "x".repeat(200))), { outputLimitChars: 150 }]]) {
  h = await heldEnding(heldThen("Still going", finish), opts);
  check(`after an ending the engine caused (${ending}, without another word from the worker), nothing held is shown`,
    h.res.reason === ending && JSON.stringify(h.seen) === JSON.stringify(NOT_HELD), h);
}
t = await started((r, w) => w.emit({ id: r.id, type: "done", exitCode: 0 }));
r = await within(2000, t.s.submit("System.exit(0)"));
check("System.exit(0) ends the session as exited", r.status === "ended" && r.reason === "exited" && t.w().terminated, r);
t = await started((r, w) => w.emit({ id: r.id, type: "error", message: "Java exited unsuccessfully (code 1)." }));
r = await within(2000, t.s.submit("System.exit(3)"));
check("System.exit with another status ends it as exited too", r.reason === "exited", r);
t = await started((r, w) => { w.emit(out(r, "|  Goodbye\n")); w.emit(ok(r, { closed: true, prompt: "" })); });
r = await within(2000, t.s.submit("/exit"));
check("/exit ends the session as exited, after jshell's goodbye", r.reason === "exited" && t.w().terminated && shown(t.log) === "|  Goodbye\n", { r, output: t.log.output });
t = await started((r, w) => w.emit({ id: r.id, type: "completions", anchor: 0, suggestions: [] }));
r = await within(2000, t.s.submit("Math.ab"));
check("completions, never asked for, end the request instead of leaving it waiting", r.status === "ended" && r.reason === "crashed", r);
let prevented = false;
t = await started((r, w) => w.onerror({ message: "Uncaught Error: boom", preventDefault() { prevented = true; } }));
r = await within(2000, t.s.submit("x"));
check("a worker that throws ends the session as crashed, and the error goes no further (the page's own error report)",
  r.status === "ended" && r.reason === "crashed" && prevented, { r, prevented });
t = await started((r, w) => w.onmessageerror?.({}));
r = await within(2000, t.s.submit("x"));
check("a message the worker could not pass ends the session as crashed", r.status === "ended" && r.reason === "crashed", r);

// ---- /reset and /reload ----
// The front end answers them in the same request, after Ristretto's worker has started a fresh VM (lib.rs): one
// request, one answer, no phase event. Here the restart answers after 200 ms, past the entry deadline of 50 ms: a
// restart has a boot's deadline (Firefox takes about a minute to start jshell; an entry's deadline is a minute).
const table = /static final String\[\] NAMES = \{([^}]*)\};/.exec(fs.readFileSync(path.join(REPO, "runtime/jshell/src/foundations/scratchpad/Commands.java"), "utf8"));
const names = table ? [...table[1].matchAll(/"([^"]*)"/g)].map((m) => m[1]) : null;
check("the client resolves commands against the front end's own command names (Commands.java's NAMES)",
  JSON.stringify(names) === JSON.stringify(COMMANDS), { names, COMMANDS });
const slow = (r, w) => {
  if (r.source.startsWith("/re")) { w.emit(out(r, "|  Resetting state.\n")); setTimeout(() => w.emit(ok(r)), 200); }
  else if (r.source === "if (true) {") w.emit(ok(r, { continuation: true, prompt: MORE }));
  else w.emit(ok(r));
};
t = await started(slow, { deadlineMs: 50 });
t.log.progress.length = 0;
let settled = false;
const reset = t.s.submit("/reset").then((x) => { settled = true; return x; });
await sleep(10);
check("/reset says at once that jshell is starting, and stays busy while the worker starts a fresh VM",
  !settled && t.s.state === "busy" && JSON.stringify(t.log.progress) === JSON.stringify(["jshell"]), { settled, state: t.s.state, progress: t.log.progress });
r = await within(2000, reset);
check("/reset is one request and one answer, though it outlasts the entry deadline: the client never restarts jshell itself",
  r.status === "ready" && r.prompt === PROMPT && !("reset" in r) && t.s.state === "ready" && t.s.endedBy === null
    && t.w().posts.length === 2 && t.log.workers.length === 1 && shown(t.log) === "|  Resetting state.\n",
  { r, endedBy: t.s.endedBy, posts: t.w().posts.length, output: t.log.output });
const restarts = ["/reset", "/res", "/reload", "/rel", "/reload -quiet", "/reset   ", "/reset foo"];
const others = ["/r", "/re", "/resets", "/rerun", "/list", "//reset", "/* /reset */ 1", " /reset", "reset()"];
t = await started((r, w) => w.emit(ok(r)));
const progressOf = async (line) => { t.log.progress.length = 0; await within(2000, t.s.submit(line)); return t.log.progress.join(" "); };
const said = [];
for (const line of restarts) said.push(await progressOf(line));
check("a line the front end reads as /reset or /reload (the name, a unique prefix, with options or spaces after) says jshell is starting",
  said.every((p) => p === "jshell"), Object.fromEntries(restarts.map((l, i) => [l, said[i]])));
said.length = 0;
for (const line of others) said.push(await progressOf(line));
check("an ambiguous prefix, another command, a comment, or Java does not",
  said.every((p) => p === ""), Object.fromEntries(others.map((l, i) => [l, said[i]])));
t = await started(slow, { deadlineMs: 50 });
await within(2000, t.s.submit("if (true) {"));
t.log.progress.length = 0;
r = await within(2000, t.s.submit("/reset"));
check("at a continuation, /reset is part of what is being typed, not a restart: an entry's deadline, and no word of starting jshell",
  r.status === "ended" && r.reason === "timeout" && t.log.progress.length === 0, { r, progress: t.log.progress });
// Its deadline here is 1.5 s, said as 2 seconds (the boot's below, 50 ms, as 0): the words carry the real length.
t = await started((r, w) => { if (r.source === "/reload") w.emit(out(r, "|  Restarting and restoring state.\n")); }, { bootDeadlineMs: 1500 });
r = await within(4000, t.s.submit("/reload"));
check("a restart that never answers fails to load at its deadline, saying so, its worker terminated",
  r.status === "ended" && r.reason === "failed-to-load" && t.w().terminated
    && t.s.endedWords === "The scratchpad could not start: after /reload, jshell did not answer within 2 seconds.", { r, words: t.s.endedWords });
// A /reload replays what the session ran, so on top of the boot deadline (50 ms here) it gets twice the time the
// session's entries took; a restart answers here after 350 ms, an entry after 100 ms. After two entries (about 200 ms)
// a /reload's deadline is about 450 ms, and the answer is in time; with the entries' time counted once (about 250 ms)
// it would not be. With nothing run, or for a /reset, the deadline is the boot's 50 ms.
const timed = (r, w) => setTimeout(() => w.emit(ok(r)), r.source.startsWith("/re") ? 350 : 100);
const asked = (t, line) => within(2000, t.s.submit(line)).catch((e) => ({ status: "refused", message: e.message }));
t = await started(timed, { bootDeadlineMs: 50 });
r = await asked(t, "/reload");
check("a /reload with nothing run before it has only the boot deadline", r.status === "ended" && r.reason === "failed-to-load", r);
t = await started(timed, { bootDeadlineMs: 50 });
await asked(t, "int a = 1");
await asked(t, "int b = 2");
r = await asked(t, "/reload");
check("a /reload after entries that took 200 ms gets twice that for its replay, on top of the boot deadline", r.status === "ready", r);
r = await asked(t, "/reset");
check("a /reset replays nothing, so it has only the boot deadline, however long the session's entries took",
  r.status === "ended" && r.reason === "failed-to-load", r);

// ---- a download that fails ----
// What a file that fails its check twice is said to be, with the advice that a new deploy may take minutes to arrive.
const NOT_WHOLE = "did not download whole (reloading the page in a few minutes may help: a new version can take that long to reach every server)";
const failing = async (change, label, words) => {
  const f = session(bootThen(() => {}), {}, fakeSite(change));
  let e = null;
  try { await within(2000, f.s.start()); } catch (x) { e = x; }
  check(label, e?.reason === "failed-to-load" && f.s.endedBy === "failed-to-load" && f.log.workers.length === 0 && f.s.endedWords === words,
    { reason: e?.reason, words: f.s.endedWords, workers: f.log.workers.length });
};
await failing({ "runner.core.wasm": new Error("HTTP 404") }, "a file that cannot be downloaded fails to load, naming it, and no worker starts",
  "The scratchpad could not start: runner.core.wasm could not be downloaded (HTTP 404).");
const flipped = FILES["jdk.zip"].slice(); flipped[3] ^= 1;
await failing({ "jdk.zip": flipped }, "a file with one byte changed fails its hash", `The scratchpad could not start: jdk.zip ${NOT_WHOLE}.`);
await failing({ "jdk.zip": FILES["jdk.zip"].slice(0, -1) }, "a file cut short fails", `The scratchpad could not start: jdk.zip ${NOT_WHOLE}.`);
const flippedJar = FILES["browser-jshell.jar"].slice(); flippedJar[3] ^= 1;
await failing({ "browser-jshell.jar": flippedJar }, "the front end's jar is checked like the rest: one byte changed, and nothing starts",
  `The scratchpad could not start: browser-jshell.jar ${NOT_WHOLE}.`);
// One retry: a file whose bytes do not match is fetched once more, past the HTTP cache ({ cache: "reload" }), because a CDN
// that has not yet received a new deploy serves the old file. changedUnless(reload) returns changed bytes for jdk.zip
// until the request says reload.
const changedUnless = (also) => {
  const site = fakeSite();
  const fetchBytes = site.fetchBytes;
  site.jdkCaches = []; // what each fetch of jdk.zip asked of the HTTP cache, in order (site.cache keeps only the last per URL)
  site.fetchBytes = (url, init) => {
    if (url.includes("/jdk.zip?")) site.jdkCaches.push(init?.cache ?? null);
    const bytes = fetchBytes(url, init);
    return url.includes("/jdk.zip?") && !(also && init?.cache === "reload") ? bytes.then(() => flipped) : bytes;
  };
  return site;
};
const jdkFetches = (site) => site.fetched.filter((u) => u.includes("/jdk.zip?"));
let site = changedUnless(true), err;
r = await within(2000, session(bootThen(() => {}), {}, site).s.start()).catch((x) => x);
check("a file that fails its check once is fetched again with cache: reload, and the load succeeds after exactly one retry",
  r?.banner === BANNER && jdkFetches(site).length === 2 && JSON.stringify(site.jdkCaches) === '[null,"reload"]',
  { r, fetched: jdkFetches(site).length, caches: site.jdkCaches });
site = changedUnless(false);
const twice = session(bootThen(() => {}), {}, site);
err = null;
try { await within(2000, twice.s.start()); } catch (x) { err = x; }
check("a file that fails its check both times fails to load with the advice to reload in a few minutes, after exactly two fetches of that file",
  err?.reason === "failed-to-load" && twice.s.endedWords === `The scratchpad could not start: jdk.zip ${NOT_WHOLE}.` && jdkFetches(site).length === 2 && twice.log.workers.length === 0,
  { reason: err?.reason, words: twice.s.endedWords, fetched: jdkFetches(site).length });

// A page served over plain http has no crypto.subtle (a browser gives it only to a secure page): the client falls back to
// the course's own SHA-256. In Node 25 the getter lives on Crypto.prototype, so it is shadowed by an own property of
// globalThis.crypto, asserted undefined before every load, and removed after.
Object.defineProperty(globalThis.crypto, "subtle", { value: undefined, configurable: true });
try {
  check("(precondition) crypto.subtle is undefined while the next three checks run", globalThis.crypto.subtle === undefined, typeof globalThis.crypto.subtle);
  site = fakeSite();
  r = await within(2000, session(bootThen(() => {}), {}, site).s.start()).catch((x) => x);
  check("without crypto.subtle, the client loads a good release, every file checked by the course's own SHA-256", r?.banner === BANNER && site.fetched.length === 6, { r, fetched: site.fetched.length });
  // Same length as the real file, so its length passes and only the hash can refuse it (a truncated file is caught by its length
  // before any hash runs, which would prove nothing about the fallback).
  site = fakeSite({ "jdk.zip": flipped });
  const refused = session(bootThen(() => {}), {}, site);
  err = null;
  try { await within(2000, refused.s.start()); } catch (x) { err = x; }
  check("without crypto.subtle, a jdk.zip of the right length with one byte changed is refused by the hash, and no worker starts",
    flipped.length === FILES["jdk.zip"].length && err?.reason === "failed-to-load" && refused.s.endedWords === `The scratchpad could not start: jdk.zip ${NOT_WHOLE}.` && refused.log.workers.length === 0,
    { reason: err?.reason, words: refused.s.endedWords });
  check("(precondition) crypto.subtle was still undefined at the end", globalThis.crypto.subtle === undefined, typeof globalThis.crypto.subtle);
} finally { delete globalThis.crypto.subtle; }
check("(restored) crypto.subtle is Node's again", typeof globalThis.crypto.subtle?.digest === "function", typeof globalThis.crypto.subtle);

await failing({ "manifest.json": text('{"files":{}}') }, "a manifest that does not list a file fails", "The scratchpad could not start: manifest.json does not list jdk.zip.");
const { "browser-jshell.jar": _jar, ...noJar } = FILES;
await failing({ "manifest.json": await manifestOf(noJar) }, "a manifest that does not list the front end's jar fails",
  "The scratchpad could not start: manifest.json does not list browser-jshell.jar.");
await failing({ "manifest.json": await manifestOf(FILES, null) }, "a manifest that does not give its version, which names the worker, fails",
  "The scratchpad could not start: manifest.json does not give its version.");
const bareZip = storedZip([["lib/modules", text("the JDK's classes")]]);
await failing({ "jdk.zip": bareZip, "manifest.json": await manifestOf({ ...FILES, "jdk.zip": bareZip }) },
  "a jdk.zip with no front end to replace fails to load, and no worker starts",
  "The scratchpad could not start: the archive has no browser-jshell.jar to replace.");
t = session(() => {}, { bootDeadlineMs: 50 });
let e = null;
try { await within(2000, t.s.start()); } catch (x) { e = x; }
check("a boot that never answers fails to load at the boot deadline, its worker terminated",
  e?.reason === "failed-to-load" && t.w().terminated && t.s.endedWords === "The scratchpad could not start: jshell did not answer within 0 seconds.", { reason: e?.reason, words: t.s.endedWords });
t = session((r, w) => w.emit({ id: r.id, type: "error", message: "CompileError: bad magic" }));
e = null;
try { await within(2000, t.s.start()); } catch (x) { e = x; }
check("an engine error while starting fails to load, not crashed", e?.reason === "failed-to-load" && t.w().terminated, { reason: e?.reason });
t = session(bootThen(() => {}), { createWorker: () => { throw new Error("SecurityError: workers are blocked"); } });
e = null;
try { await within(2000, t.s.start()); } catch (x) { e = x; }
check("a browser that will not start the worker fails to load, and says so",
  e?.reason === "failed-to-load" && t.s.state === "ended"
    && t.s.endedWords === "The scratchpad could not start: the browser did not start its worker (SecurityError: workers are blocked).",
  { reason: e?.reason, message: e?.message, state: t.s.state, words: t.s.endedWords });
let release;
t = session(bootThen(() => {}), {}, fakeSite({ "jdk.zip": new Promise((r) => { release = r; }) }));
const loading = within(2000, t.s.start()).catch((x) => x);
await sleep(10);
t.s.stop();
e = await loading;
release(FILES["jdk.zip"]);
await sleep(20);
check("Stop during the download ends it: start rejects as stopped, and the download finishing later starts no worker",
  e?.reason === "stopped" && t.s.state === "ended" && t.log.workers.length === 0, { reason: e?.reason, state: t.s.state, workers: t.log.workers.length });

// ---- a new session, and the cache ----
t = await started((r, w) => w.emit({ id: r.id, type: "error", message: "unreachable" }));
await within(2000, t.s.submit("x"));
const fetchedBefore = t.site.fetched.length;
t.log.progress.length = 0;
r = await within(2000, t.s.start());
check("after an ending, start begins a new session in a new worker, without downloading again",
  r?.banner === BANNER && t.log.workers.length === 2 && t.site.fetched.length === fetchedBefore && t.s.state === "ready" && t.s.endedBy === null, { r, workers: t.log.workers.length });
check("and says it is starting Java and jshell, never that it is downloading", JSON.stringify(t.log.progress) === JSON.stringify(["engine", "jshell"]), t.log.progress);
// A start from the files an earlier session verified starts worker.js under the version it kept, and the site serves
// its current worker.js whatever the version asked: after a release (here, a new jar and version test2) that worker
// need not fit the kept files. A start from kept files that fails to load forgets them, so the next reads the manifest
// afresh; one stopped while it boots keeps them, as an ordinary new session does, reading nothing. Boots 2 and 3 never
// answer (Stop ends the first, the boot deadline the second); boots 1 and 4 do.
const afterRelease = {};
let bootsAsked = 0;
t = session((r, w) => {
  if (r.source === "" && r.operation === "input" && w.boots++ === 0) {
    if (++bootsAsked === 2 || bootsAsked === 3) return;
    w.emit(out(r, BANNER));
    return w.emit(ok(r));
  }
  w.emit({ id: r.id, type: "error", message: "unreachable" });
}, { bootDeadlineMs: 200 }, fakeSite(afterRelease));
await within(2000, t.s.start());
await within(2000, t.s.submit("x"));
const releasedJar = text("the bytes of a released front end");
afterRelease["browser-jshell.jar"] = releasedJar;
afterRelease["manifest.json"] = await manifestOf({ ...FILES, "browser-jshell.jar": releasedJar }, "test2");
const askedBefore = t.site.fetched.length;
const stoppedBoot = within(2000, t.s.start()).catch((x) => x);
await sleep(20);
t.s.stop();
const stoppedReason = (await stoppedBoot)?.reason;
const failedBoot = await within(2000, t.s.start()).catch((x) => x);
const kept = { stopped: stoppedReason, failed: failedBoot?.reason, fetched: t.site.fetched.slice(askedBefore), worker: t.w().url };
r = await within(2000, t.s.start()).catch((x) => x);
check("a start from kept files stopped while it boots keeps them: the next start reads nothing, its worker under the version it kept",
  kept.stopped === "stopped" && kept.fetched.length === 0 && kept.worker === BASE + "worker.js?v=test", kept);
check("a start from kept files that fails to load forgets them: the next start reads the manifest afresh, takes the new jar, and starts the worker under the new version",
  kept.failed === "failed-to-load" && r?.banner === BANNER && t.site.fetched[askedBefore] === BASE + "manifest.json"
    && t.w().url === BASE + "worker.js?v=test2"
    && (await sha(t.w().posts[0].assets[0][1])) === (await sha(withFrontEnd(FILES["jdk.zip"], releasedJar))),
  { kept, r: r?.banner ?? r?.message, fetched: t.site.fetched.slice(askedBefore), worker: t.w().url });
// A fake of Cache Storage: named caches of entries keyed by URL; deleted lists the entries a cache deleted.
function fakeCaches(seed = {}) {
  const stores = new Map(Object.entries(seed).map(([n, entries]) => [n, new Map(entries)]));
  const deleted = [];
  const key = (u) => (typeof u === "string" ? u : u.url);
  return { stores, deleted,
    async keys() { return [...stores.keys()]; },
    async delete(n) { return stores.delete(n); },
    async open(n) {
      if (!stores.has(n)) stores.set(n, new Map());
      const m = stores.get(n);
      return { async keys() { return [...m.keys()].map((url) => ({ url })); },
        async match(u) { return m.has(key(u)) ? new Response(m.get(key(u))) : undefined; },
        async put(u, resp) { m.set(key(u), new Uint8Array(await resp.arrayBuffer())); },
        async delete(u) { deleted.push(key(u)); return m.delete(key(u)); } };
    } };
}
const stale = BASE + "browser-jshell.jar?sha256=" + "0".repeat(64);
const caches = fakeCaches({ "jf-scratchpad": [[stale, text("an older front end")]], "someone-else": [["https://other.test/x", text("theirs")]] });
const stored = () => [...caches.stores.get("jf-scratchpad").keys()].sort();
t = session(bootThen(() => {}), { caches });
await within(2000, t.s.start());
check("each verified file is kept in Cache Storage under its own hash; an entry the manifest no longer lists is deleted, another site's cache is not",
  JSON.stringify(stored()) === JSON.stringify([...KEYS].sort()) && JSON.stringify(caches.deleted) === JSON.stringify([stale])
    && caches.stores.get("someone-else").size === 1, { stored: stored(), deleted: caches.deleted });
const offline = Object.fromEntries(ASSETS.map((n) => [n, new Error("offline")]));
t = session(bootThen(() => {}), { caches }, fakeSite(offline));
r = await within(2000, t.s.start()).catch((x) => x);
check("a new page starts from the cache without downloading the files, and composes them as before",
  r?.banner === BANNER && t.site.fetched.length === 1 && (await sha(t.w().posts[0].assets[0][1])) === (await sha(COMPOSED)), { r, fetched: t.site.fetched });
caches.stores.get("jf-scratchpad").set(KEYS[0], flipped);
t = session(bootThen(() => {}), { caches });
r = await within(2000, t.s.start()).catch((x) => x);
check("a cached file that fails its hash is downloaded again and replaced",
  r?.banner === BANNER && JSON.stringify(t.site.fetched) === JSON.stringify([BASE + "manifest.json", KEYS[0]])
    && (await sha(caches.stores.get("jf-scratchpad").get(KEYS[0]))) === (await sha(FILES["jdk.zip"])), t.site.fetched);
const fixedJar = text("the bytes of a fixed front end");
caches.deleted.length = 0;
t = session(bootThen(() => {}), { caches }, fakeSite({ "browser-jshell.jar": fixedJar,
  "manifest.json": await manifestOf({ ...FILES, "browser-jshell.jar": fixedJar }, "test2") }));
r = await within(2000, t.s.start()).catch((x) => x);
check("a new front end downloads only its jar: the zip and the wasm files come from the cache, the old jar's entry is deleted, and the new version names the worker",
  r?.banner === BANNER && JSON.stringify(t.site.fetched) === JSON.stringify([BASE + "manifest.json", await keyOf("browser-jshell.jar", fixedJar)])
    && JSON.stringify(caches.deleted) === JSON.stringify([KEYS[4]]) && stored().includes(await keyOf("browser-jshell.jar", fixedJar))
    && (await sha(t.w().posts[0].assets[0][1])) === (await sha(withFrontEnd(FILES["jdk.zip"], fixedJar))) && t.w().url === BASE + "worker.js?v=test2",
  { fetched: t.site.fetched, deleted: caches.deleted, stored: stored(), worker: t.w().url });
t = session(bootThen(() => {}), { caches: { open: async () => { throw new Error("SecurityError"); } } });
r = await within(2000, t.s.start()).catch((x) => x);
check("storage that refuses (a private window) only means downloading", r?.banner === BANNER && t.site.fetched.length === 6, { r, fetched: t.site.fetched.length });
t = session(bootThen(() => {}), { caches: { open: async () => ({ keys: async () => [], match: async () => undefined,
  delete: async () => false, put: async () => { throw new Error("QuotaExceededError"); } }) } });
r = await within(2000, t.s.start()).catch((x) => x);
check("storage that is full (it refuses to keep a file) only means downloading again next time",
  r?.banner === BANNER && t.site.fetched.length === 6, { r, fetched: t.site.fetched.length });

// ---- the real pinned worker, running the course's front end, in a worker thread ----
const dir = scratchpadDir(process.argv.slice(2), USAGE, "jshell-session-site");
const real = (opts = {}) => {
  const log = { output: "", streams: new Set(), workers: [], progress: [] };
  const s = new JShellSession(dirUrl(dir), { createWorker: (url) => { const w = nodeWorker(url); log.workers.push(w); return w; },
    fetchBytes: nodeFetchBytes, caches: null, onOutput: (text, stream) => { log.output += text; log.streams.add(stream); },
    onProgress: (phase) => log.progress.push(phase), ...opts });
  return { s, log, take: () => { const o = log.output; log.output = ""; log.streams.clear(); log.progress.length = 0; return o; } };
};
// Whether a worker's thread has really stopped (its exit event), within 5 s: terminate() was called and worked.
const exited = async (w) => (await within(5000, w.exited.then(() => "exited"))) === "exited";
let a = real();
let t0 = Date.now();
r = await within(300_000, a.s.start()).catch((x) => x);
console.log(`  (real worker: ready in ${Date.now() - t0} ms)`);
check("real: the pinned worker starts the course's front end: the pinned JDK's banner, then jshell's prompt",
  r?.banner === BANNER && r?.prompt === PROMPT, r);
r = await within(60_000, a.s.submit("2 + 3"));
let o = a.take();
check("real: 2 + 3", r.status === "ready" && r.prompt === PROMPT && o === "$1 ==> 5\n", { r, o });
r = await within(60_000, a.s.submit("int twice(int n) {"));
let r2 = await within(60_000, a.s.submit("    return n * 2;"));
let r3 = await within(60_000, a.s.submit("}"));
o = a.take();
check("real: a method typed over three lines continues at the continuation prompt, then is created",
  r.continuation === true && r.prompt === MORE && r2.continuation === true && r3.continuation === false && r3.prompt === PROMPT
    && o === "|  created method twice(int)\n", { r, r2, r3, o });
r = await within(60_000, a.s.submit("if (true) {"));
r2 = await within(60_000, a.s.cancel());
check("real: cancel drops an open snippet", r.continuation === true && r2.status === "ready" && r2.continuation === false && r2.prompt === PROMPT, { r, r2 });
r = await within(60_000, a.s.submit("/exit (1 +"));
r2 = await within(60_000, a.s.cancel());
r3 = await within(60_000, a.s.submit("2 + 3"));
o = a.take();
check("real: cancel at an unfinished /exit forgets the /exit too, so the next entry runs and the session goes on",
  r.continuation === true && r2.continuation === false && r3.status === "ready" && a.s.state === "ready" && /^\$\d+ ==> 5\n$/.test(o), { r, r2, r3, o });
r = await within(60_000, a.s.submit("y + 1"));
const errorStreams = [...a.log.streams];
o = a.take();
check("real: an error arrives whole, on stdout, where the real jshell's console shows it",
  r.status === "ready" && o.startsWith("|  Error:\n|  cannot find symbol\n") && JSON.stringify(errorStreams) === JSON.stringify(["stdout"]),
  { o, streams: errorStreams });
await within(60_000, a.s.submit("int k = 1"));
await within(60_000, a.s.submit("/set feedback concise"));
a.take();
t0 = Date.now();
r = await within(300_000, a.s.submit("/reset"));
const resetMs = Date.now() - t0;
const resetProgress = [...a.log.progress];
const resetOut = a.take();
r2 = await within(60_000, a.s.submit("k"));
o = a.take();
check(`real: /reset starts a fresh VM in its own request (${resetMs} ms): it says jshell is starting, prints no banner, ` +
  "keeps the feedback mode (concise's prompt), and the variable is gone",
  r.status === "ready" && r.prompt === "jshell> " && JSON.stringify(resetProgress) === JSON.stringify(["jshell"]) && resetOut === ""
    && r2.status === "ready" && o.startsWith("|  Error:\n|  cannot find symbol\n"), { r, resetProgress, resetOut, r2, o });
await within(60_000, a.s.submit("/set feedback normal"));
await within(60_000, a.s.submit("int m = 2"));
a.take();
t0 = Date.now();
r = await within(300_000, a.s.submit("/reload"));
const reloadMs = Date.now() - t0;
const reloadProgress = [...a.log.progress];
const reloadOut = a.take();
r2 = await within(60_000, a.s.submit("m"));
o = a.take();
check(`real: /reload starts a fresh VM and replays the session on it (${reloadMs} ms), saying jshell is starting`,
  r.status === "ready" && r.prompt === PROMPT && JSON.stringify(reloadProgress) === JSON.stringify(["jshell"])
    && reloadOut === "|  Restarting and restoring state.\n-: int m = 2;\n" && r2.status === "ready" && o === "m ==> 2\n",
  { r, reloadProgress, reloadOut, r2, o });
r = await within(60_000, a.s.submit("/exit"));
o = a.take();
check("real: /exit ends the session as exited", r.status === "ended" && r.reason === "exited" && o === "|  Goodbye\n", { r, o });

a = real();
await within(300_000, a.s.start());
t0 = Date.now();
r = await within(120_000, a.s.submit("var l = new ArrayList<long[]>(); while (true) l.add(new long[1_000_000]);"));
check(`real: memory used up ends the session as out-of-memory (${Date.now() - t0} ms), and no Rust text reaches the output`,
  r.status === "ended" && r.reason === "out-of-memory" && !/memory allocation|RUST_BACKTRACE|panicked/.test(a.log.output), { r, out: a.log.output });
// The engine's other ways of giving out, each met in the real engine's own words, never a copy of them: an impossible
// allocation (a Rust panic); Ristretto's own 1 MiB stop, in the engine's words (a two-byte character reaches 1 MiB of
// UTF-8 at 524 lines, before the client's caps); and memory past 2 GiB, which is how a long session ends (the worker's
// glue then fails with the JavaScript engine's RangeError, V8's here; one entry holding 2 GB gets there at once).
// web/test/scratchpad.mjs meets the last two in each browser, whose RangeErrors differ.
a.take();
await within(300_000, a.s.start());
r = await within(60_000, a.s.submit("new int[Integer.MAX_VALUE]"));
check("real: an impossible allocation (a Rust panic, capacity overflow) ends the session as out-of-memory, and nothing of the panic is shown",
  r.status === "ended" && r.reason === "out-of-memory" && a.take() === "", { r, out: a.log.output });
await within(300_000, a.s.start());
r = await within(120_000, a.s.submit('while (true) System.out.println("é".repeat(1000))'));
o = a.take();
const wide = o.split("é".repeat(1000) + "\n").length - 1;
check(`real: endless printing of a two-byte character meets Ristretto's own 1 MiB stop, in the engine's words (${wide} lines): output-limit`,
  r.status === "ended" && r.reason === "output-limit" && wide > 400 && wide < 600, { r, wide, words: a.s.endedWords });
// The runaway a reader is likeliest to type prints short lines, each its own output event: it meets the client's
// 100,000-line cap (200,000 characters, far under the character cap and Ristretto's stop). Exactly 100,000 lines are
// shown, the ending is said in the client's words, and a fresh session starts.
await within(300_000, a.s.start());
t0 = Date.now();
r = await within(120_000, a.s.submit("while (true) System.out.println(1)"));
const linesMs = Date.now() - t0;
o = a.take();
const linesWords = a.s.endedWords;
r2 = await within(300_000, a.s.start()).catch((x) => x);
check(`real: endless printing of short lines ends at the client's 100,000-line cap (${linesMs} ms): exactly 100,000 lines of 1 shown, the client's words, then a fresh session`,
  r.status === "ended" && r.reason === "output-limit" && o === "1\n".repeat(100_000)
    && linesWords === "This entry printed more than the scratchpad can show, so it was stopped. The session ended, and its variables and methods are gone."
    && r2?.banner === BANNER, { r, lines: o.split("\n").length - 1, chars: o.length, head: o.slice(0, 20), words: linesWords, fresh: r2?.banner ?? r2?.message });
r = await within(120_000, a.s.submit("long[][] big = new long[260][]; for (int i = 0; i < 260; i++) big[i] = new long[1_000_000];"));
r2 = r.status === "ready" ? await within(60_000, a.s.submit("1 + 1")) : null;
o = a.take();
check("real: memory past 2 GiB (2 GB held by one entry: how a long session ends) ends the session at the next entry as out-of-memory, with nothing of the engine's shown",
  r.status === "ready" && /^big ==> long\[260\]\[\] \{[^\n]*\}\n$/.test(o) && r2?.status === "ended" && r2.reason === "out-of-memory", { r, r2, o });

a = real({ deadlineMs: 3000 });
await within(300_000, a.s.start());
t0 = Date.now();
r = await within(30_000, a.s.submit("while (true) {}"));
const stopMs = Date.now() - t0;
check(`real: an endless loop is stopped at the deadline (${stopMs} ms), and its worker thread exits`,
  r.status === "ended" && r.reason === "timeout" && stopMs < 6000 && await exited(a.log.workers[0]), { r, stopMs });
check("real: the deadline is said with its length (3 seconds here; 0 for the fake's 50 ms)",
  a.s.endedWords === "This entry ran for 3 seconds without finishing, so it was stopped. The session ended, and its variables and methods are gone.",
  a.s.endedWords);
a.s.deadlineMs = 60_000; // a fresh session's first entry compiles cold: under load it can take more than 3 s
r = await within(300_000, a.s.start()).catch((x) => x);
r2 = r?.banner ? await within(60_000, a.s.submit("1 + 1")) : null;
check("real: a new session starts after the ending and numbers from $1 again", r?.banner === BANNER && r2?.status === "ready" && a.take() === "$1 ==> 2\n", { r, r2, out: a.log.output });
const spin = within(30_000, a.s.submit("while (true) {}"));
await sleep(500);
t0 = Date.now();
a.s.stop();
r = await spin;
const gone = await exited(a.log.workers[1]);
check(`real: Stop ends a running entry, and its worker thread exits (${Date.now() - t0} ms)`,
  r.status === "ended" && r.reason === "stopped" && gone, { r, gone });
done();
