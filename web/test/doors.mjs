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
// web/runner/doors.js in Chromium, WebKit and Firefox (D86, W-7): a module worker that imports it and closes its doors
// can reach nothing. Each door is tried against a live server on another port that counts every connection made to it
// (an upgrade counts too). The page is served with no header but a content type and no route, so nothing but the
// doors stands between the worker and that server: a CSP header or the harness's off-origin route would stop some of
// these attempts on their own and hide a door left open. The same worker without closeNetworkDoors() reaches the
// server, so the check can fail; and a door that cannot be removed makes closeNetworkDoors() throw. Before any browser,
// a check in Node holds closeNetworkDoors() to its postcondition on every call, a second call included. FontFace and fonts
// are exposed in a worker in all three engines (each control says so); a worker's FontFace reaches another origin in
// Chromium and Firefox, while WebKit's fetches only from the page's origin, so WebKit's control says that instead.
//   node web/test/doors.mjs [chromium|webkit|firefox]
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { REPO, ENGINES, check, done, workDir } from "./harness.mjs";
import { serve } from "../serve.mjs";
import { closeNetworkDoors } from "../runner/doors.js";

// The doors, written here rather than read from doors.js, so a name dropped from DOORS cannot drop its own check (B22).
const NAMES = ["fetch", "WebSocket", "WebSocketStream", "WebTransport", "EventSource", "Worker", "SharedWorker",
  "importScripts", "caches", "CacheStorage", "Cache", "FontFace", "fonts"];
// The engines whose worker FontFace fetches a url() on another origin. WebKit's refuses one ("Cannot load <url>." in
// its console) and fetches only from the page's origin, so its control cannot show FontFace reaching the live server.
const FONTS_REACH_OFF_ORIGIN = ["chromium", "firefox"];
const SETTLE_MS = 1500; // after the worker reports, how long a connection it started may take to arrive

const dir = workDir("doors-test");
fs.mkdirSync(path.join(dir, "runner"));
fs.copyFileSync(path.join(REPO, "web/runner/doors.js"), path.join(dir, "runner/doors.js"));
fs.writeFileSync(path.join(dir, "noop.js"), "// a same-origin script for new Worker\n");
fs.writeFileSync(path.join(dir, "index.html"), '<!doctype html><meta charset="utf-8"><title>doors</title>\n' +
  '<script type="module">\nwindow.probe = (data) => new Promise((resolve) => {\n' +
  '  const w = new Worker("probe.js", { type: "module" });\n' +
  '  w.onmessage = (e) => { w.terminate(); resolve(e.data); };\n' +
  '  w.onerror = (e) => { e.preventDefault(); resolve({ error: e.message || "worker error" }); };\n' +
  '  w.postMessage(data);\n});\n</script>\n');
// The worker: closes its doors (or, for the control, does not), says what is still reachable, then tries each door.
// Every attempt that throws or rejects is reported with the error's name; one that settles is reported as reached.
fs.writeFileSync(path.join(dir, "probe.js"), `import { DOORS, closeNetworkDoors } from "./runner/doors.js";
self.onmessage = async ({ data: { close, freeze, names, live, ws } }) => {
  const r = { doors: DOORS, attempts: {} };
  if (freeze) Object.defineProperty(self, "fetch", { value: self.fetch, writable: false, configurable: false });
  try { if (close) closeNetworkDoors(); r.closed = "closed"; } catch (e) { r.closed = String(e); }
  if (close) {
    try { closeNetworkDoors(); r.again = "returned"; } catch (e) { r.again = String(e); }
    const d = Object.getOwnPropertyDescriptor(self, "XMLHttpRequest");
    r.stub = { configurable: d.configurable, writable: d.writable };
  }
  r.reachable = names.filter((n) => n in self);
  r.xhr = typeof XMLHttpRequest === "function" ? XMLHttpRequest.name : typeof XMLHttpRequest;
  if (freeze) return self.postMessage(r);
  const bound = (p) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error("no answer in 3 s")), 3000))]);
  const attempt = async (name, fn) => {
    try { r.attempts[name] = { reached: String(await bound(fn())) }; }
    catch (e) { r.attempts[name] = { threw: e && e.name, message: String(e && e.message), dom: e instanceof DOMException }; }
  };
  await attempt("fetch", () => fetch(live + "/fetch").then((x) => x.text()));
  await attempt("XMLHttpRequest", () => { const x = new XMLHttpRequest(); x.open("GET", live + "/xhr", false); x.send(); return x.status; });
  await attempt("WebSocket", () => new Promise((yes, no) => {
    const s = new WebSocket(ws + "/ws");
    s.onopen = () => { s.close(); yes("open"); };
    s.onerror = () => no(new Error("an error event"));
  }));
  await attempt("EventSource", () => new Promise((yes, no) => {
    const s = new EventSource(live + "/events");
    s.onopen = () => { s.close(); yes("open"); };
    s.onerror = () => { s.close(); no(new Error("an error event")); };
  }));
  await attempt("Worker", () => { new Worker("noop.js").terminate(); return "made"; });
  await attempt("importScripts", () => { importScripts(live + "/imported.js"); return "imported"; });
  await attempt("caches", () => caches.open("x").then((c) => c.add(live + "/cached")).then(() => "cached"));
  await attempt("FontFace", () => new FontFace("probe-face", "url(" + live + "/fontface)").load().then((f) => f.status));
  await attempt("fonts", () => {
    fonts.add(new FontFace("probe-set", "url(" + live + "/fonts)"));
    return fonts.load("12px probe-set").then((faces) => faces.length);
  });
  self.postMessage(r);
};
`);

// Every wait on the browser gets a wall clock, so a page that stops answering fails its checks instead of hanging.
const within = (ms, p) => Promise.race([p, new Promise((r) => setTimeout(() => r({ error: `no answer in ${ms} ms` }), ms))]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const only = process.argv[2];
if (only && !ENGINES[only]) { console.log("usage: node web/test/doors.mjs [chromium|webkit|firefox]"); process.exit(2); }

// In Node: a scope whose prototype answers true to every `in` (a Proxy's has trap) still has fetch after every delete, so
// closeNetworkDoors() must throw. A second call must throw too: the first call installed the XMLHttpRequest stub before
// its final check threw, and a second call that took the stub for proof of closed doors would return with fetch reachable.
{
  const scope = Object.create(new Proxy({}, { has: () => true }));
  const call = () => { try { closeNetworkDoors(scope); return "returned"; } catch (e) { return e.message; } };
  const first = call(), second = call();
  check("node: a door still in the scope after every delete makes closeNetworkDoors() throw, and a second call throws too",
    first === "fetch is still reachable" && second === "fetch is still reachable", { first, second });
}
for (const engine of only ? [only] : Object.keys(ENGINES)) {
  console.log(engine);
  let connections = 0;
  const arrived = [];
  const live = http.createServer((req, res) => {
    arrived.push(req.url);
    res.writeHead(200, { "Access-Control-Allow-Origin": "*", "Content-Type": "text/plain" }).end("answered");
  });
  live.on("connection", () => connections++);
  live.on("upgrade", (req, socket) => { arrived.push(`upgrade ${req.url}`); socket.destroy(); });
  await new Promise((r) => live.listen(0, "127.0.0.1", r));
  const port = live.address().port;
  const server = await serve({ root: dir, port: 0 });
  const browser = await ENGINES[engine].launch();
  const page = await (await browser.newContext()).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`http://127.0.0.1:${server.port}/index.html`);
  await page.waitForFunction(() => typeof window.probe === "function");
  const probe = async (opts) => {
    connections = 0;
    arrived.length = 0;
    const r = await within(30000, page.evaluate((o) => window.probe(o),
      { names: NAMES, live: `http://127.0.0.1:${port}`, ws: `ws://127.0.0.1:${port}`, ...opts }));
    await sleep(SETTLE_MS);
    return { ...r, connections, arrived: [...arrived] };
  };

  const shut = await probe({ close: true });
  check(`${engine}: DOORS is the 13 doors`, JSON.stringify(shut.doors) === JSON.stringify(NAMES), shut.doors ?? shut);
  check(`${engine}: once closeNetworkDoors() has run, none of them is in self, prototype chain included`,
    shut.closed === "closed" && Array.isArray(shut.reachable) && shut.reachable.length === 0, { closed: shut.closed, reachable: shut.reachable });
  check(`${engine}: a second closeNetworkDoors() on a closed scope returns without throwing`, shut.again === "returned", shut.again);
  check(`${engine}: the stub is neither configurable nor writable, so a page cannot swap it back`,
    shut.stub?.configurable === false && shut.stub?.writable === false, shut.stub);
  check(`${engine}: XMLHttpRequest is the offline stub`, shut.xhr === "OfflineXMLHttpRequest", shut.xhr);
  const a = shut.attempts ?? {};
  check(`${engine}: a synchronous XMLHttpRequest send throws a DOMException named NetworkError`,
    a.XMLHttpRequest?.dom === true && a.XMLHttpRequest?.threw === "NetworkError", a.XMLHttpRequest);
  // Each fails because its door is gone (a ReferenceError naming it), not because the attempt failed some other way:
  // an open WebSocket fails too, once the live server drops it, and the fonts attempt also calls new FontFace, whose
  // ReferenceError would otherwise stand in for a fonts left open.
  for (const door of ["fetch", "WebSocket", "EventSource", "Worker", "importScripts", "caches", "FontFace", "fonts"])
    check(`${engine}: ${door} fails because it is gone`,
      a[door]?.threw === "ReferenceError" && new RegExp(`\\b${door}\\b`).test(a[door]?.message ?? ""), a[door]);
  check(`${engine}: the live server saw no connection`, shut.connections === 0 && shut.arrived.length === 0,
    { connections: shut.connections, arrived: shut.arrived });

  // The control: the same worker with its doors open reaches the server by fetch and by WebSocket, and by
  // XMLHttpRequest, EventSource and Cache.add too, so the absence above is the doors' doing and not a server nothing
  // can reach. (importScripts always throws in a module worker, and a same-origin Worker contacts only the origin.)
  // In Chromium and Firefox, FontFace (alone and through fonts.load) reaches it too; WebKit's says why it does not.
  const control = await probe({ close: false });
  const fontsReach = FONTS_REACH_OFF_ORIGIN.includes(engine);
  const reached = ["/fetch", "upgrade /ws", "/xhr", "/events", "/cached", ...(fontsReach ? ["/fontface", "/fonts"] : [])];
  check(fontsReach
    ? `${engine}: control: with its doors open the same worker reaches the live server by fetch, WebSocket, XMLHttpRequest, EventSource, Cache.add, FontFace and fonts.load`
    : `${engine}: control: with its doors open the same worker reaches the live server by fetch, WebSocket, XMLHttpRequest, EventSource and Cache.add; ` +
      `not by FontFace or fonts.load, since this engine's worker FontFace fetches only from the page's origin (measured; if it arrives, add ${engine} to FONTS_REACH_OFF_ORIGIN)`,
    reached.every((u) => control.arrived.includes(u)) && control.connections >= 2
      && (fontsReach || !control.arrived.some((u) => u === "/fontface" || u === "/fonts")),
    { connections: control.connections, arrived: control.arrived, attempts: control.attempts });
  // An engine that did not expose FontFace or fonts in a worker would pass their "gone" checks above with nothing
  // removed, and WebKit's control above does not reach the live server through them; so each engine's control must
  // hold both, and this check fails naming the engine and the missing name if one does not.
  const fontDoors = ["FontFace", "fonts"];
  check(`${engine}: control: with its doors open the worker exposes FontFace and fonts, so their checks above are not vacuous here`,
    fontDoors.every((n) => control.reachable?.includes(n)),
    { missing: fontDoors.filter((n) => !control.reachable?.includes(n)), reachable: control.reachable });

  const stuck = await probe({ close: true, freeze: true });
  check(`${engine}: a door that cannot be removed (fetch made non-configurable) makes closeNetworkDoors() throw`,
    typeof stuck.closed === "string" && stuck.closed !== "closed" && !stuck.error, stuck.closed ?? stuck);
  check(`${engine}: no page error`, errors.length === 0, errors);
  await browser.close();
  await server.close();
  await new Promise((r) => { live.close(r); live.closeAllConnections(); });
}
done();
