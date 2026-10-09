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
// Shared by web/test/*.mjs: the check lines, the three browsers, and the sites the tests serve.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium, webkit, firefox } from "playwright-core";
import { serve } from "../serve.mjs";
import { javaBin } from "../../runtime/jdk-home.mjs";
import { CSP, guardOrigin, cspReportHandler } from "./offsite.mjs";

export const REPO = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
export const J = javaBin("java");
export const DIST = process.env.JF_DIST || path.join(REPO, "runtime/dist/fork");
// The scratchpad release a built site publishes (runtime/ristretto/package.sh points current at the newest).
export const SCRATCHPAD = process.env.JF_SCRATCHPAD || path.join(REPO, "runtime/.work/ristretto/current");
export const ENGINES = { chromium, webkit, firefox };
const RUNTIME_FILES = ["compile-classlib-teavm.bin", "compiler.wasm", "compiler.wasm-deobfuscator.wasm",
  "compiler.wasm-runtime.js", "compiler.wasm-runtime.mjs", "runtime-classlib-teavm.bin"];

const results = [];
export function check(label, ok, got) {
  results.push(ok);
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${label}${ok ? "" : "  got " + JSON.stringify(got)}`);
  return ok;
}
export function done() {
  const failed = results.filter((x) => !x).length;
  console.log(`${results.length} check(s), ${failed} failed`);
  process.exit(failed ? 1 : 0);
}
export function workDir(name) {
  const d = path.join(REPO, "build/.work", name);
  fs.rmSync(d, { recursive: true, force: true });
  fs.mkdirSync(d, { recursive: true });
  return d;
}
// The runner on its own, laid out as a built site lays it out: runtime/ and runner/, and a page that makes one
// BrowserRunner (window.jf).
export function stageRunner(name) {
  const d = workDir(name);
  fs.mkdirSync(path.join(d, "runtime"));
  fs.mkdirSync(path.join(d, "runner"));
  for (const f of RUNTIME_FILES) fs.copyFileSync(path.join(DIST, f), path.join(d, "runtime", f));
  for (const f of ["tjava-core.js", "worker-protocol.js", "java-line.js"])
    fs.copyFileSync(path.join(REPO, "runtime/runner", f), path.join(d, "runner", f));
  for (const f of ["browser-runner.js", "browser-worker.js", "doors.js"])
    fs.copyFileSync(path.join(REPO, "web/runner", f), path.join(d, "runner", f));
  fs.writeFileSync(path.join(d, "index.html"), '<!doctype html><meta charset="utf-8"><title>runner</title>\n' +
    '<script type="module">import { BrowserRunner } from "./runner/browser-runner.js";\n' +
    'window.BrowserRunner = BrowserRunner; window.jf = new BrowserRunner(new URL("./", location.href));</script>\n');
  return d;
}
// The name an insecure page is opened under. Not localhost or *.localhost, nor an address in 127.0.0.0/8, which every
// engine treats as a secure origin: a browser gives crypto.subtle and Cache Storage only to a secure page.
export const INSECURE_HOST = "groundwork.test";
// A forward proxy on 127.0.0.1, any free port, that answers only for INSECURE_HOST:<serverPort>: such a request goes to
// the test server on 127.0.0.1:<serverPort>, anything else gets 502, and a CONNECT (https) is refused. Handed to an
// engine as its `proxy` launch option, it makes a real http origin of a name that is not secure, in all three engines
// (Chromium's host-resolver rules and Firefox's DNS preference reach only their own; WebKit has neither).
export async function forwardProxy(serverPort) {
  const want = `${INSECURE_HOST}:${serverPort}`;
  const proxy = http.createServer((req, res) => {
    if (req.headers.host !== want) { res.writeHead(502); return res.end(`this proxy answers only for ${want}`); }
    const url = new URL(req.url, `http://${want}`);
    const up = http.request({ host: "127.0.0.1", port: serverPort, method: req.method, path: url.pathname + url.search, headers: req.headers },
      (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
    up.on("error", () => { res.writeHead(502); res.end("the test server did not answer"); });
    req.pipe(up);
  });
  proxy.on("connect", (req, socket) => socket.end("HTTP/1.1 502 Bad Gateway\r\n\r\n"));
  await new Promise((resolve) => proxy.listen(0, "127.0.0.1", resolve));
  return { port: proxy.address().port, close: () => new Promise((resolve) => { proxy.close(resolve); proxy.closeAllConnections(); }) };
}
// Serves dir on a free port and opens pagePath in a fresh context of the engine, guarded by web/test/offsite.mjs:
// offsite collects everything that left the origin, requests and WebSockets, each stopped before it arrives (the page
// must talk to nobody); requests collects the URL of every request the context saw, in order; errors collects page
// errors and crashes. initScript, when given, is a function the browser runs in every page before the page's own
// scripts. options is an object: { server } is handed to serve (types: "plain" knows only .html, .css, .js, .json and
// .txt, so no .mjs or .wasm type, which stock nginx lacks too); { insecure: true } opens the page at
// http://groundwork.test:<port>, a real origin that is not secure (forwardProxy):
// origin is then that address, and what counts as leaving the origin is judged against it. The server sends the test
// CSP (W-18), which stops a worker's off-origin WebSocket, and records what it reports in offsite and in reports;
// { csp: false } serves with no header but a content type, for a test of what stops a program when no header does
// (the doors).
export async function open(engine, dir, pagePath = "index.html", contextOptions = {}, initScript = null, options = {}) {
  let guard = null; // set before the page opens, so before any report can arrive
  const reports = [];
  const reported = (url) => { reports.push(url); guard.offsite.push(url); };
  const csp = options.csp === false ? {} : { headers: { "Content-Security-Policy": CSP }, hook: cspReportHandler(reported) };
  const server = await serve({ root: dir, port: 0, ...options.server, ...csp });
  const proxy = options.insecure ? await forwardProxy(server.port) : null;
  const origin = options.insecure ? `http://${INSECURE_HOST}:${server.port}` : `http://127.0.0.1:${server.port}`;
  const browser = await ENGINES[engine].launch(proxy ? { proxy: { server: `http://127.0.0.1:${proxy.port}` } } : {});
  const context = await browser.newContext(contextOptions);
  if (initScript) await context.addInitScript(initScript);
  guard = await guardOrigin(context, origin);
  const errors = [];
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("crash", () => errors.push("the page crashed"));
  await page.goto(`${origin}${options.server?.prefix ?? "/"}${pagePath}`);
  return { page, context, origin, offsite: guard.offsite, reports, errors, requests: guard.requests,
    close: async () => { await browser.close(); await proxy?.close(); await server.close(); } };
}
// A built site for a fixture volume, built the way the course is: the volume copied into a fresh project under
// build/.work/<name>/ with runtime/CHECKSUMS, runtime/legal/, runtime/ristretto/CHECKSUMS and web/ from the
// repository, then `java build/Build.java --project`. The real scratchpad (SCRATCHPAD) is copied into every such
// site: about 30 MB, measured at 0.2 s more a build, so no cheaper stand-in is needed here.
export function buildSite(volumeDir, name) {
  const d = workDir(name);
  fs.cpSync(volumeDir, path.join(d, "volumes", path.basename(volumeDir)), { recursive: true });
  fs.mkdirSync(path.join(d, "runtime/ristretto"), { recursive: true });
  fs.copyFileSync(path.join(REPO, "runtime/CHECKSUMS"), path.join(d, "runtime/CHECKSUMS"));
  fs.cpSync(path.join(REPO, "runtime/legal"), path.join(d, "runtime/legal"), { recursive: true });
  fs.copyFileSync(path.join(REPO, "runtime/ristretto/CHECKSUMS"), path.join(d, "runtime/ristretto/CHECKSUMS"));
  fs.cpSync(path.join(REPO, "web"), path.join(d, "web"), { recursive: true });
  const p = spawnSync(J, ["build/Build.java", "--project", d, "--runtime", DIST, "--scratchpad", SCRATCHPAD], { cwd: REPO, encoding: "utf8" });
  if (p.status !== 0) throw new Error(`building ${volumeDir} failed (exit ${p.status}):\n${p.stdout}${p.stderr}`);
  return d;
}
