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
// The browser runner in Chromium, WebKit and Firefox: everything runtime/test/runner-safety.mjs and
// runner-input.mjs hold NodeRunner to, in each engine, with no request leaving the page's origin; the off-origin gate
// itself, WebSockets included; and boxes that try to phone home, which reach nobody (D86).
//   node web/test/runner.mjs [chromium|webkit|firefox]
import fs from "node:fs";
import http from "node:http";
import net from "node:net";
import path from "node:path";
import { ENGINES, check, done, stageRunner, open } from "./harness.mjs";
import { STACK_OVERFLOW } from "../../runtime/runner/java-line.js";
import { javacText } from "../page/box.js";
// web/test/doors.mjs holds DOORS to a literal list of the 13 doors, so a name dropped from it fails there.
import { DOORS } from "../runner/doors.js";

// What a box that opens a java.net URL shows the reader, the first line of what it prints, as measured in each engine
// (WebKit prints that line only, D42). The runtime's java.net (patch teavm-0018) makes no request: an http(s)
// connection throws at once. For a host name that is what the JDK throws offline, java.net.UnknownHostException, which
// runtime/test/cases.mjs pins against the JDK. The URL here is 127.0.0.1, where the live server below listens. A box
// has no computer of its own, so nothing listens on its loopback, and for 127.0.0.1 and localhost the runtime throws
// what the JDK throws when nothing listens there, java.net.ConnectException "Connection refused" (patch teavm-0020,
// D100), which runtime/test/cases.mjs pins against the JDK.
const OFFLINE_LINE = 'Exception in thread "main" java.net.ConnectException: Connection refused';
const PHONE_HOME = { chromium: OFFLINE_LINE, webkit: OFFLINE_LINE, firefox: OFFLINE_LINE };
// What the page shows for a box that opens any other address literal: the runtime throws java.net.ConnectException
// with the operating system's words for ENETUNREACH, a choice, not the JDK's answer (D92): the JDK's machine has a
// network, so its offline answer for an address cannot be observed. The box uses 192.0.2.1, in TEST-NET-1 (RFC 5737),
// an address set aside for documentation that no machine answers.
const UNREACHABLE_LINE = 'Exception in thread "main" java.net.ConnectException: Network is unreachable';
// What the page shows for a box that names TeaVM's JavaScript interop, the first line of javac's message as the box
// prints it (web/page/box.js javacText): the runtime's compile classlib holds no org.teavm.jso (S1, patch
// teavm-javac-0106), so javac refuses the import as the JDK does.
const NO_JSO_LINE = "Main.java:1: error: package org.teavm.jso does not exist";
// What the page shows for a box that declares a class in org.teavm or a package under it (C-1): the one line
// runtime/runner/tjava-core.js gives, as javacText prints a diagnostic with no position.
const RESERVED_LINE = (pkg) => `error: package ${pkg} is reserved for the runtime: a box cannot declare classes in org.teavm or in a package under it`;
// The engines whose CSP block of a worker's WebSocket is reported to /__csp; WebKit blocks it without a report.
const REPORTS_WORKER_SOCKETS = ["chromium", "firefox"];
// The runner with one role's worker unable to close a door: its fetch made non-configurable before the worker starts.
const stuckDoor = (role) => {
  const d = stageRunner(`runner-test-stuck-${role}`);
  const file = path.join(d, "runner/browser-worker.js");
  const src = fs.readFileSync(file, "utf8"), at = src.indexOf("const post =");
  fs.writeFileSync(file, src.slice(0, at) + `if (new URL(self.location.href).searchParams.get("role") === "${role}") ` +
    'Object.defineProperty(self, "fetch", { value: self.fetch, writable: false, configurable: false });\n' + src.slice(at));
  return d;
};
const STUCK = { compile: stuckDoor("compile"), run: stuckDoor("run") };

const dir = stageRunner("runner-test");
// The runner with its compiler missing, as a failed download (a 404, a dropped connection) leaves it.
const noCompiler = stageRunner("runner-test-no-compiler");
fs.rmSync(path.join(noCompiler, "runtime/compiler.wasm"));
// Counts the compile workers a page starts (an init script, before the page's own scripts).
const COUNT_COMPILERS = () => {
  const Real = window.Worker;
  window.jfCompilers = 0;
  window.Worker = class Worker extends Real {
    constructor(url, options) { super(url, options); if (String(url).includes("role=compile")) window.jfCompilers++; }
  };
};
// Every browser call gets a wall clock, so a page that stops answering (D43) fails its checks instead of hanging the test.
const within = (ms, p) => Promise.race([p, new Promise((r) => setTimeout(() => r({ status: "no-answer", stdout: "", stderr: "" }), ms))]);
const only = process.argv[2];
if (only && !ENGINES[only]) { console.log("usage: node web/test/runner.mjs [chromium|webkit|firefox]"); process.exit(2); }
for (const engine of only ? [only] : Object.keys(ENGINES)) {
  console.log(engine);
  // A compiler that cannot start answers every compile waiting on it "crash" at once, and is started again only when
  // a compile asks for one, never in a loop of its own (Ruling 34). The page's runner starts one compile worker when
  // it is made, and each compile starts at most one more when it finds the last one dead, so two compiles make at
  // most 3 compile workers, each fetching compiler.wasm once; a loop of its own made hundreds in these seconds. At
  // least one of each must be seen, or the counts could pass only because nothing counts them.
  const nc = await open(engine, noCompiler, "index.html", {}, COUNT_COMPILERS);
  const answers = await within(30000, nc.page.evaluate(async () =>
    [await window.jf.compile('void main() { IO.println("x"); }'), await window.jf.compile('void main() { IO.println("y"); }')]));
  await nc.page.waitForTimeout(3000); // an absence: the time a compiler restarting on its own would fill with workers
  const started = { workers: await nc.page.evaluate(() => window.jfCompilers),
    wasmRequests: nc.requests.filter((u) => new URL(u).pathname.endsWith("/runtime/compiler.wasm")).length };
  check(`${engine}: a compiler that cannot start answers each compile "crash"`,
    Array.isArray(answers) && answers.length === 2 && answers.every((a) => a.stage === "crash"), answers);
  check(`${engine}: and is started again only when a compile asks (at most 3 compile workers and 3 compiler.wasm requests)`,
    started.workers >= 1 && started.workers <= 3 && started.wasmRequests >= 1 && started.wasmRequests <= 3, started);
  check(`${engine}: a compiler that cannot start raises no page error`, nc.errors.length === 0, nc.errors);
  await nc.close();

  const t = await open(engine, dir);
  const run = (src, opts = {}) => within((opts.deadlineMs ?? 5000) + 15000,
    t.page.evaluate(([s, o]) => window.jf.compileAndRun(s, o), [src, { deadlineMs: 5000, ...opts }]));
  const next = async (label) => { const n = await run('void main() { IO.println("next"); }'); check(`${engine}: ${label}: the next Run works`, n.stdout === "next\n", n); };
  const brief = (o) => ({ status: o.status, stdout: o.stdout?.slice(0, 200), stderr: o.stderr?.slice(0, 300), exception: o.exception });

  let o = await run('void main() { IO.println("Hello, <world> & café 😀"); }');
  check(`${engine}: hello`, o.status === "ok" && o.stdout === "Hello, <world> & café 😀\n", brief(o));
  o = await run("void main() { int[] a = new int[3];\n  IO.println(a[3]); }");
  // D42: WebKit names a WebAssembly frame without a code offset, so TeaVM cannot say where the exception happened and
  // prints the first line only. Pinned, so a WebKit that starts giving offsets is noticed: then the engine leaves
  // NO_FRAMES, and DESIGN.md section 2 loses its note.
  const NO_FRAMES = [
    // D42. WebKit 2359: a WebAssembly frame in an Error's stack reads "1@wasm-function[1]", with no code offset, so
    // TeaVM's takeStackTrace finds no frames to deobfuscate. Chromium and Firefox name the offset (":0x27").
    "webkit",
  ];
  const FIRST = 'Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3\n';
  check(`${engine}: an uncaught exception prints as the JDK prints it${NO_FRAMES.includes(engine) ? ", first line only (D42)" : ""}`,
    NO_FRAMES.includes(engine) ? o.stderr === FIRST : o.stderr.startsWith(FIRST) && o.stderr.includes("\tat Main.main(Main.java:2)"), brief(o));
  o = await run('void main() { IO.println("start"); while (true) {} }', { deadlineMs: 2000 });
  check(`${engine}: an endless loop stops at the deadline, earlier output kept`, o.status === "timeout" && o.stdout === "start\n" && o.ms < 3500, brief(o));
  await next("endless loop");
  o = await run('void main() { IO.print("Guess: "); while (true) {} }', { deadlineMs: 2000 });
  check(`${engine}: a prompt printed before an endless loop is kept`, o.status === "timeout" && o.stdout === "Guess: ", brief(o));
  o = await run('void main() { while (true) IO.println("x"); }', { outputLimitLines: 1000 });
  check(`${engine}: endless printing stops at the cap`, o.status === "output-limit", brief(o));
  await next("endless printing");
  o = await run("int down(int n) { return down(n + 1) + 1; } void main() { IO.println(down(0)); }");
  check(`${engine}: endless recursion is reported as the JDK reports it`, o.stderr.startsWith(STACK_OVERFLOW), brief(o));
  await next("endless recursion");
  o = await run('void main() { long[] a = new long[Integer.MAX_VALUE - 8]; IO.println(a.length); }');
  // The JDK prints OutOfMemoryError here when its heap is smaller than the 16 GiB array, as on most machines; a JDK
  // with a larger default heap (a machine with 64 GiB of RAM or more) prints the length instead.
  check(`${engine}: a huge allocation is reported as the JDK reports it`, o.stderr.includes("java.lang.OutOfMemoryError"), brief(o));
  await next("huge allocation");
  // Step 5 decides this expectation per engine: the JDK's OutOfMemoryError line, or, only for an engine Step 5
  // recorded running this program to the deadline, a timeout. Either way the page lives on and the next Run works.
  // An engine in CRASHES_THE_PAGE loses the whole page instead (D41), and WebKit loses it when the program follows
  // other runaway runs (D43), so this program runs in a page of its own, after this session.
  const GROWS_TO_THE_DEADLINE = [
    "webkit", // WebKit 2359: no error by the 20 s deadline (about 24,500 arrays in, in a probe that counted them)
    "firefox", // Firefox 1543: the same (about 19,200 arrays in)
  ];
  const CRASHES_THE_PAGE = [
    // D41. Chromium 153 (headless shell 1243): the page crashed about 925 ms in, three times out of three, and the
    // next Run in that page failed. Playwright's page.reload() of the crashed target failed too, a limit of the
    // automation object, not evidence of what a reader's reload does. Chromium runs a dedicated worker in its
    // page's process.
    "chromium",
  ];
  const GROW = 'void main() { var keep = new java.util.ArrayList<long[]>(); while (true) keep.add(new long[1_000_000]); }';
  o = await run('void main() { String s = IO.readln("How many? "); IO.println(s); }', { stdin: "", final: false });
  check(`${engine}: a question with no answer yet stops as needs-input`, o.status === "needs-input" && o.stdout === "How many? ", brief(o));
  // The cap wins over the stop for input (browser-runner.js checks limited first), as runtime/test/runner-input.mjs
  // holds NodeRunner to: the print's lone high surrogate is held until the end-of-run flush, which runs after a
  // needs-input stop too, and there it crosses the cap of 1.
  o = await run('void main() { IO.print("y\\uD83D"); IO.readln(); }', { outputLimitChars: 1, final: false });
  check(`${engine}: the output cap wins over needs-input when the flush after the stop crosses it, output kept`,
    o.status === "output-limit" && o.stdout === "y", brief(o));
  o = await run('void main() { String s = IO.readln("Name? "); IO.println("Hi " + s); }', { stdin: "café 😀\n", final: false });
  check(`${engine}: a non-ASCII answer arrives intact`, o.status === "ok" && o.stdout === "Name? Hi café 😀\n", brief(o));
  const SEED = 'void main() { IO.println(new java.util.Random().nextInt(1000) + " " + Math.random()); }';
  const a = await run(SEED, { randomSeed: 11 }), b = await run(SEED, { randomSeed: 11 });
  check(`${engine}: one seed, the same numbers`, a.status === "ok" && a.stdout === b.stdout, [a.stdout, b.stdout]);
  o = await run("void main() { int x = ; }");
  check(`${engine}: a compile error comes back with its line`, o.status === "compile-error" && o.compile.diagnostics.some((d) => d.line === 1), brief(o));
  // Compiled first, so the abort lands while the program runs (not during the compile) and only the runner's abort
  // listener can end it; ms counts from the run's start.
  o = await within(20000, t.page.evaluate(async () => {
    const c = await window.jf.compile('void main() { while (true) {} }');
    if (!c.ok) return { status: "compile-failed", compile: c };
    const ac = new AbortController();
    const running = window.jf.run(c.wasm, { deadlineMs: 5000, signal: ac.signal });
    setTimeout(() => ac.abort(), 300);
    return running;
  }));
  check(`${engine}: an aborted run ends at once as canceled`, o.status === "canceled" && o.ms >= 250 && o.ms < 1500, { ...brief(o), ms: o.ms });
  await next("canceled run");
  o = await within(90000, t.page.evaluate(async () => {
    const r = new window.BrowserRunner(new URL("./", location.href), { compileDeadlineMs: 1 });
    const first = await r.compile('void main() { IO.println("x"); }');
    r.compileDeadlineMs = 60000;
    const second = await r.compileAndRun('void main() { IO.println("after"); }');
    r.close();
    return { first, second: { status: second.status, stdout: second.stdout } };
  }));
  check(`${engine}: a compiler that does not answer in time is replaced`, o.first?.stage === "crash" && o.second?.stdout === "after\n", o);
  check(`${engine}: no request left the page's origin`, t.offsite.length === 0, t.offsite);
  check(`${engine}: no page error`, t.errors.length === 0, t.errors);
  await t.close();

  // The memory program, in a page of its own (D41, D43).
  const c = await open(engine, dir);
  const g = await within(35000, c.page.evaluate((s) => window.jf.compileAndRun(s, { deadlineMs: 20000 }), GROW)
    .catch((e) => ({ status: "threw", threw: String(e) })));
  if (CRASHES_THE_PAGE.includes(engine)) {
    // Pinned, so a browser that stops crashing is noticed: then the engine leaves CRASHES_THE_PAGE, and DESIGN.md
    // section 2 loses its note (D41).
    check(`${engine}: memory used up still takes the whole page down (D41; if this fails, take ${engine} off CRASHES_THE_PAGE and update DESIGN.md section 2)`,
      g.status === "threw" && c.errors.includes("the page crashed"), { g, errors: c.errors });
  } else {
    check(`${engine}: memory used up bit by bit is reported as the JDK reports it`,
      g.stderr?.includes("java.lang.OutOfMemoryError") || (GROWS_TO_THE_DEADLINE.includes(engine) && g.status === "timeout"), brief(g));
    const n = await within(20000, c.page.evaluate(() => window.jf.compileAndRun('void main() { IO.println("next"); }')));
    check(`${engine}: memory used up: the next Run works`, n.stdout === "next\n", n);
  }
  await c.close();

  // The offsite gate itself, in a page of its own so the main session's "no request left the page's origin" stays
  // meaningful. A request to a port nothing listens on never connects and must still be recorded; requests to a
  // live server on another origin, from the page and from a worker, must be recorded and never arrive.
  const f = await open(engine, dir);
  const closed = await new Promise((r) => { const l = net.createServer().listen(0, "127.0.0.1", () => { const p = l.address().port; l.close(() => r(p)); }); });
  const arrived = [];
  const live = http.createServer((req, res) => { arrived.push(req.url); res.writeHead(200, { "Access-Control-Allow-Origin": "*" }).end("answered"); });
  await new Promise((r) => live.listen(0, "127.0.0.1", r));
  const OFF = [`http://127.0.0.1:${closed}/never-connects`, `http://127.0.0.1:${live.address().port}/from-page`,
    `http://127.0.0.1:${live.address().port}/from-worker`];
  const fetched = await within(10000, f.page.evaluate(async ([closedUrl, pageUrl, workerUrl]) => {
    const get = (u) => fetch(u).then((r) => r.text(), (e) => `failed: ${e}`);
    const code = "self.onmessage = (e) => fetch(e.data).then((r) => r.text(), (x) => `failed: ${x}`).then((t) => self.postMessage(t));";
    const w = new Worker(URL.createObjectURL(new Blob([code], { type: "text/javascript" })));
    const fromWorker = new Promise((r) => { w.onmessage = (e) => r(e.data); w.postMessage(workerUrl); });
    return [await get(closedUrl), await get(pageUrl), await fromWorker];
  }, OFF));
  check(`${engine}: requests to other origins are recorded, even one that never connects, and none arrives`,
    OFF.every((u) => f.offsite.includes(u)) && arrived.length === 0, { offsite: f.offsite, arrived, fetched });
  await new Promise((r) => live.close(r));
  await f.close();

  // The gate's WebSockets (P3-15), in pages of their own: one from the page and one from a blob worker, to a live
  // server on another port that counts every connection made to it. The page's socket is routed: recorded and closed
  // with code 1008, which a CSP block never gives, so the route did it [B4]. A worker's socket, which no route sees, is
  // blocked by the test CSP; Chromium and Firefox report the block (asynchronously, so the check waits with a bound).
  // The control, served with no CSP header, shows the worker's socket arriving, so the check can fail.
  const sockets = async (csp) => {
    const s = await open(engine, dir, "index.html", {}, null, { csp });
    let connections = 0;
    const upgrades = [];
    const server = http.createServer((req, res) => res.writeHead(404).end());
    server.on("connection", () => connections++);
    server.on("upgrade", (req, socket) => { upgrades.push(req.url); socket.destroy(); });
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    const at = `ws://127.0.0.1:${server.address().port}`;
    const ends = await within(15000, s.page.evaluate(async (at) => {
      const ended = (ws) => new Promise((r) => { ws.onclose = (e) => r(`close ${e.code}`); setTimeout(() => r("no close in 4 s"), 4000); });
      let page;
      try { page = await ended(new WebSocket(`${at}/from-page`)); } catch (e) { page = `threw ${e.name}`; }
      const code = "self.onmessage = (e) => { try { const ws = new WebSocket(e.data); ws.onopen = () => self.postMessage('open'); " +
        "ws.onerror = () => self.postMessage('error event'); } catch (x) { self.postMessage(`threw ${x.name}`); } };";
      const w = new Worker(URL.createObjectURL(new Blob([code], { type: "text/javascript" })));
      const worker = await new Promise((r) => { w.onmessage = (e) => r(e.data); w.postMessage(`${at}/from-worker`); setTimeout(() => r("no answer in 4 s"), 4000); });
      return { page, worker };
    }, at));
    const reported = () => s.reports.includes(`${at}/from-worker`);
    for (const until = Date.now() + 5000; csp !== false && !reported() && Date.now() < until;) await s.page.waitForTimeout(100);
    await s.page.waitForTimeout(500); // time for a connection the worker started to arrive
    const got = { ends, offsite: [...s.offsite], reports: [...s.reports], connections, upgrades: [...upgrades] };
    await new Promise((r) => { server.close(r); server.closeAllConnections(); });
    await s.close();
    const workerUrl = `${at}/from-worker`;
    return { ...got, recorded: got.offsite.includes(workerUrl), reported: got.reports.includes(workerUrl), pageUrl: `${at}/from-page` };
  };
  let ws = await sockets(true);
  check(`${engine}: a page's WebSocket to another origin is recorded and closed with code 1008 (the route's close, not a CSP block)`,
    ws.offsite.includes(ws.pageUrl) && ws.ends?.page === "close 1008", ws);
  check(REPORTS_WORKER_SOCKETS.includes(engine) ? `${engine}: a worker's WebSocket to another origin is blocked by the CSP and recorded from its report`
    : `${engine}: a worker's WebSocket to another origin is blocked by the CSP (a SecurityError), which WebKit does without a report, so it is not recorded`,
  REPORTS_WORKER_SOCKETS.includes(engine) ? ws.reported && ws.recorded : !ws.recorded && ws.ends?.worker === "threw SecurityError", ws);
  check(`${engine}: neither socket reached the live server`, ws.connections === 0 && ws.upgrades.length === 0, ws);
  ws = await sockets(false);
  check(`${engine}: control: served with no CSP header, the worker's WebSocket arrives`, ws.upgrades.includes("/from-worker"), ws);

  // Boxes that try to phone home (D86, W-7): each fails as on a computer with no network, nothing leaves the page, and
  // the next Run works. The runtime's java.net makes no request at all (patch teavm-0018 throws before any
  // XMLHttpRequest), and a box cannot name TeaVM's JavaScript interop (S1), so these boxes no longer reach the network
  // doors: those are proven by web/test/doors.mjs and by the workers' check below (page.workers()), which with the
  // stuck run worker's check is what fails when a run worker skips closeNetworkDoors() (Task 4's break 2). Served with
  // no CSP header, as the shipped site is [B1]. A live server on another port counts every connection made to it (an
  // upgrade counts too); the gate (harness open) records any request that leaves.
  const h = await open(engine, dir, "index.html", {}, null, { csp: false });
  let calls = 0;
  const called = [];
  const home = http.createServer((req, res) => { called.push(req.url); res.writeHead(200, { "Access-Control-Allow-Origin": "*" }).end("answered"); });
  home.on("connection", () => calls++);
  home.on("upgrade", (req, socket) => { called.push(`upgrade ${req.url}`); socket.destroy(); });
  await new Promise((r) => home.listen(0, "127.0.0.1", r));
  const HOME = `127.0.0.1:${home.address().port}`;
  const hrun = async (src) => {
    const r = await within(20000, h.page.evaluate((s) => window.jf.compileAndRun(s, { deadlineMs: 5000 }), src));
    await h.page.waitForTimeout(1000); // time for a connection the program started to arrive
    return r;
  };
  const CONNECT = `var c = (java.net.HttpURLConnection) new java.net.URL("http://${HOME}/via-url").openConnection(); IO.println(c.getResponseCode());`;
  const firstLine = (text) => (text ?? "").split("\n")[0];
  o = await hrun(`void main() throws Exception { ${CONNECT} }`);
  check(`${engine}: a box that opens a java.net URL ends at once (no timeout), printing nothing but ${JSON.stringify(PHONE_HOME[engine])}`,
    o.status !== "timeout" && o.status !== "no-answer" && o.stdout === "" && firstLine(o.stderr) === PHONE_HOME[engine], brief(o));
  // calls === 0 can see only a socket: since teavm-0018, java.net never reaches XHR. h.offsite is the gate for
  // everything else that would leave the origin.
  check(`${engine}: and reaches nobody: the live server saw no connection and the gate recorded nothing`,
    calls === 0 && h.offsite.length === 0, { calls, called, offsite: h.offsite });
  // Any other address literal (D92): the only box here that reaches the runtime's "Network is unreachable" branch. A
  // request to 192.0.2.1 could never reach the live server, so for this box the gate (h.offsite) is the check that it
  // reaches nobody; calls === 0 still holds for everything the boxes so far have done.
  const TEST_NET = 'var c = (java.net.HttpURLConnection) new java.net.URL("http://192.0.2.1/").openConnection(); IO.println(c.getResponseCode());';
  o = await hrun(`void main() throws Exception { ${TEST_NET} }`);
  check(`${engine}: a box that opens http://192.0.2.1/ (TEST-NET-1) ends at once, printing nothing but ${JSON.stringify(UNREACHABLE_LINE)}`,
    o.status !== "timeout" && o.status !== "no-answer" && o.stdout === "" && firstLine(o.stderr) === UNREACHABLE_LINE, brief(o));
  check(`${engine}: and reaches nobody either: the gate recorded nothing and the live server still saw no connection`,
    h.offsite.length === 0 && calls === 0, { calls, called, offsite: h.offsite });
  o = await hrun('void main() { IO.println("Hello"); }');
  check(`${engine}: after it, a Hello box prints Hello`, o.status === "ok" && o.stdout === "Hello\n", brief(o));
  // The same call in a box that catches java.io.IOException prints "offline": what fails is the JDK's own exception,
  // which a program can catch (D86).
  o = await hrun(`void main() { try { ${CONNECT} } catch (java.io.IOException e) { IO.println("offline"); } }`);
  check(`${engine}: a box that catches java.io.IOException around the same call prints "offline"`,
    o.status === "ok" && o.stdout === "offline\n" && o.stderr === "", brief(o));
  // S1 (D46): TeaVM's JavaScript interop is not in the runtime's compile classlib, so a box that names it does not
  // compile, as on the JDK, and its JavaScript never reaches a worker.
  const JSBODY = `import org.teavm.jso.JSBody; class Net { @JSBody(script = "new WebSocket('ws://${HOME}/from-jsbody'); return 42;") ` +
    "static native int probe(); } void main() { IO.println(Net.probe()); }";
  o = await hrun(JSBODY);
  check(`${engine}: an @JSBody box that would open a WebSocket does not compile, and the page shows ${JSON.stringify(NO_JSO_LINE)}`,
    o.status === "compile-error" && o.stdout === "" && javacText(o.compile?.diagnostics ?? [], JSBODY).split("\n")[0] === NO_JSO_LINE,
    { ...brief(o), compile: o.compile });
  // C-1: a box in a package runs (TeaVM is handed its main class by name), and a box that declares its own JSBody or
  // Import in org.teavm.* does not compile: TeaVM would honor it and run its script in the run worker, where import()
  // reaches the network and no door can remove it. The JSBody's script imports from the live server, so a box that ran
  // would show there as a connection.
  o = await hrun('package foo;\npublic class Main {\n  public static void main(String[] args) { System.out.println("Hello"); }\n}\n');
  check(`${engine}: a box in package foo prints Hello`, o.status === "ok" && o.stdout === "Hello\n" && o.stderr === "", brief(o));
  const OWN_JSBODY = "package org.teavm.jso;\nimport java.lang.annotation.*;\n@Retention(RetentionPolicy.CLASS) @Target(ElementType.METHOD)\n" +
    "@interface JSBody { String[] params() default {}; String script(); }\npublic class Main {\n" +
    `  @JSBody(script = "import('http://${HOME}/from-own-jsbody').catch(() => {}); return 7;") static native int go();\n` +
    '  public static void main(String[] args) { System.out.println("go=" + go()); }\n}\n';
  o = await hrun(OWN_JSBODY);
  check(`${engine}: a box that declares its own org.teavm.jso.JSBody, whose script would import from the live server, does not compile, and the page shows ${JSON.stringify(RESERVED_LINE("org.teavm.jso"))}`,
    o.status === "compile-error" && o.stdout === "" && javacText(o.compile?.diagnostics ?? [], OWN_JSBODY).split("\n")[0] === RESERVED_LINE("org.teavm.jso"),
    { ...brief(o), compile: o.compile });
  const OWN_IMPORT = "package org.teavm.interop;\nimport java.lang.annotation.*;\n@Retention(RetentionPolicy.CLASS) @Target(ElementType.METHOD)\n" +
    '@interface Import { String module() default ""; String name(); }\npublic class Main {\n' +
    '  @Import(module = "teavmJso", name = "global") static native Object global(String name);\n' +
    '  public static void main(String[] args) { System.out.println(global("fetch")); }\n}\n';
  o = await hrun(OWN_IMPORT);
  check(`${engine}: a box that declares its own org.teavm.interop.Import does not compile, and the page shows ${JSON.stringify(RESERVED_LINE("org.teavm.interop"))}`,
    o.status === "compile-error" && o.stdout === "" && javacText(o.compile?.diagnostics ?? [], OWN_IMPORT).split("\n")[0] === RESERVED_LINE("org.teavm.interop"),
    { ...brief(o), compile: o.compile });
  check(`${engine}: across these eight boxes the live server saw no connection and the gate recorded nothing`,
    calls === 0 && h.offsite.length === 0, { calls, called, offsite: h.offsite });
  // Every worker the page holds after those runs, the compile worker and the spare run worker both, has closed its
  // doors [B5]. The spare is asked once it has said it spawned, which it says only after closing them.
  await within(10000, h.page.evaluate(() => window.jf.spare.ready));
  const doors = [];
  for (const w of h.page.workers()) {
    const role = new URL(w.url()).searchParams.get("role");
    doors.push({ role, ...(await w.evaluate((names) => ({ open: names.filter((n) => n in self), xhr: XMLHttpRequest.name }), DOORS)
      .catch((e) => ({ gone: String(e).split("\n")[0] }))) });
  }
  const shut = (role) => doors.filter((d) => d.role === role && !d.gone);
  check(`${engine}: the compile worker and the spare run worker hold no door, and XMLHttpRequest is the offline stub`,
    shut("compile").length === 1 && shut("run").length >= 1
      && doors.every((d) => d.gone || (d.open.length === 0 && d.xhr === "OfflineXMLHttpRequest")), doors);
  check(`${engine}: no page error (phoning home)`, h.errors.length === 0, h.errors);
  await new Promise((r) => { home.close(r); home.closeAllConnections(); });
  await h.close();

  // A worker that cannot close a door never runs a program: the compile worker dies with fatal (the compile answers
  // crash), and a run worker answers its run fatal without running it. The fatal carries the error's stack, which
  // names closeNetworkDoors in every engine (WebKit's and Firefox's stack leave out the message).
  for (const role of ["compile", "run"]) {
    const s = await open(engine, STUCK[role]);
    const r = await within(60000, s.page.evaluate(() => window.jf.compileAndRun('void main() { IO.println("ran"); }')));
    if (role === "compile") {
      check(`${engine}: a compile worker that cannot close a door dies, and the compile answers crash from closeNetworkDoors`,
        r.status === "compile-error" && r.compile?.stage === "crash" && /closeNetworkDoors/.test(r.compile?.crash ?? ""), r.compile ?? r);
    } else {
      check(`${engine}: a run worker that cannot close a door answers its run fatal from closeNetworkDoors, and the program never runs`,
        r.status === "fatal" && /closeNetworkDoors/.test(r.exception?.message ?? "") && r.stdout === "", brief(r));
    }
    check(`${engine}: no page error (a ${role} worker that cannot close a door)`, s.errors.length === 0, s.errors);
    await s.close();
  }

  // C-3: a run worker says it has spawned only once it has fetched the deobfuscator (and closed its doors). One whose
  // deobfuscator request is never answered (a hung server) still runs its program once that fetch gives up, its frames
  // unnamed, as when the fetch fails; and Stop ends a run at once while its worker still waits, not once it has spawned.
  // The route that never answers is installed before these runners start their workers.
  const st = await open(engine, dir);
  await st.context.route((u) => u.pathname.endsWith("/runtime/compiler.wasm-deobfuscator.wasm"), () => {});
  const stall = await within(60000, st.page.evaluate(async () => {
    const r = new window.BrowserRunner(new URL("./", location.href));
    const t0 = performance.now();
    const ran = await r.compileAndRun('void main() { IO.println("ran"); }', { deadlineMs: 5000 });
    const ranAfter = performance.now() - t0;
    const c = await r.compile('void main() { while (true) {} }');
    // A runner made now: its run worker is still waiting on its deobfuscator when the run below claims it.
    const fresh = new window.BrowserRunner(new URL("./", location.href));
    const ac = new AbortController();
    const started = performance.now();
    const running = fresh.run(c.wasm, { deadlineMs: 5000, signal: ac.signal });
    setTimeout(() => ac.abort(), 300);
    const stopped = await running;
    const stoppedAfter = performance.now() - started;
    r.close();
    fresh.close();
    return { ran: { status: ran.status, stdout: ran.stdout, stderr: ran.stderr }, ranAfter, stopped: stopped.status, stoppedAfter };
  }));
  check(`${engine}: a run worker whose deobfuscator request is never answered still runs its program`,
    stall.ran?.status === "ok" && stall.ran.stdout === "ran\n", stall);
  check(`${engine}: and Stop ends a run whose worker still waits on that request at once (within 2 s of the abort)`,
    stall.stopped === "canceled" && stall.stoppedAfter < 2300, stall);
  check(`${engine}: no page error (a deobfuscator request never answered)`, st.errors.length === 0, st.errors);
  await st.close();
}
done();
