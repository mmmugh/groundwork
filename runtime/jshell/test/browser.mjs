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
// Our front end on Ristretto in a real browser, driven by the page's own client: the staged page (test/browser/) served
// from 127.0.0.1 on a free port with a built site's scratchpad/ under scratchpad/, headless Chromium, WebKit or Firefox
// through Playwright, the session run in the page by drive.mjs over JShellSession. Like the course's own site (and
// web/serve.mjs), the page is served with a content type, plus only the test CSP (W-18), which stops a worker's
// off-origin WebSocket and reports it to /__csp. Every request the browser makes, the worker's included, is logged;
// anything that leaves the page's origin, a request or a WebSocket, is recorded and stopped, so it never arrives
// anywhere (web/test/offsite.mjs, the gate web/test/harness.mjs uses too), and the check fails on it.
// usage: node browser.mjs SESSION.jsh OUT_JSON --browser chromium|webkit|firefox --scratchpad DIR
// Writes the shape ristretto.mjs writes, plus "browser", "requests", "offOrigin" and "problems".
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import playwright from "playwright-core";
import { ASSETS } from "../../../web/page/jshell-session.js";
import { CSP, guardOrigin, cspReportHandler } from "../../../web/test/offsite.mjs";
import { parseSession } from "./sessions.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const webPage = path.resolve(here, "../../../web/page");
const args = process.argv.slice(2);
const [sessionFile, outFile] = args;
const option = (name) => { const i = args.indexOf(name); return i < 0 ? null : args[i + 1]; };
const browserName = option("--browser"), dir = option("--scratchpad");
if (!["chromium", "webkit", "firefox"].includes(browserName) || !dir || args.length !== 6) {
  console.error("usage: node browser.mjs SESSION.jsh OUT_JSON --browser chromium|webkit|firefox --scratchpad DIR");
  process.exit(2);
}

// The page's origin serves exactly these files and nothing else.
const files = new Map([
  ["/", path.join(here, "browser/index.html")],
  ["/page.mjs", path.join(here, "browser/page.mjs")],
  ["/drive.mjs", path.join(here, "drive.mjs")],
  ["/sessions.mjs", path.join(here, "sessions.mjs")],
  ["/page/jshell-session.js", path.join(webPage, "jshell-session.js")],
  ["/page/sha256.js", path.join(webPage, "sha256.js")],
  ["/page/compose.js", path.join(webPage, "compose.js")],
  ...["manifest.json", "worker.js", ...ASSETS].map((name) => [`/scratchpad/${name}`, path.join(dir, name)]),
]);
const TYPES = { ".html": "text/html", ".mjs": "text/javascript", ".js": "text/javascript", ".json": "application/json",
  ".wasm": "application/wasm" };
let guard = null; // set before the page opens, so before any report can arrive
const reported = cspReportHandler((url) => guard.offsite.push(url));
const server = http.createServer((req, res) => {
  if (reported(req, res)) return;
  const file = files.get(new URL(req.url, "http://x").pathname);
  if (!file) { res.writeHead(404, { "Content-Security-Policy": CSP }).end(); return; }
  res.writeHead(200, { "Content-Security-Policy": CSP, "Content-Type": TYPES[path.extname(file) || ".html"] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await playwright[browserName].launch({ headless: true });
const context = await browser.newContext();
guard = await guardOrigin(context, origin);
const { requests, offsite: offOrigin } = guard;
const problems = [];
const page = await context.newPage();
page.on("pageerror", (e) => problems.push("page error: " + e.message));
page.on("console", (m) => { if (m.type() === "error") problems.push("console: " + m.text()); });
page.on("requestfailed", (r) => problems.push(`request failed: ${r.url()} ${r.failure()?.errorText ?? ""}`));
page.setDefaultTimeout(0);
await page.goto(origin + "/");
// The staged page sets window.scratch as soon as its few small modules load, in seconds. One that has not in two
// minutes never will (a module that failed to load or threw), and what the page reported says why. A wait that fails
// any other way (a closed page, a crashed target, a check that throws) is named by its own error, never as the timeout.
const SCRATCH_MS = 120_000;
try {
  await page.waitForFunction(() => window.scratch !== undefined, null, { timeout: SCRATCH_MS });
} catch (e) {
  const why = e instanceof playwright.errors.TimeoutError ? `the staged page set no window.scratch in ${SCRATCH_MS} ms`
    : `waiting for the staged page's window.scratch failed: ${e?.message ?? e}`;
  console.error(`browser.mjs: ${why}${problems.length ? "; the page reported: " + problems.join("; ") : ""}`);
  await browser.close();
  server.close();
  process.exit(1);
}

const entries = parseSession(fs.readFileSync(sessionFile, "utf8"));
const result = await page.evaluate((e) => window.scratch.drive(e), entries);
result.side = `ours-${browserName}`;
result.browser = `${browserName} ${browser.version()}`;
result.requests = requests.map((u) => u.replace(origin, ""));
result.offOrigin = offOrigin;
result.problems = problems;
await browser.close();
server.close();
fs.writeFileSync(outFile, JSON.stringify(result, null, 1));
console.error(`${result.side} (${result.browser}): ${result.entries.length} of ${entries.length} entries, boot ${result.bootMs} ms, ` +
  `total ${result.totalMs} ms, ${requests.length} requests, ${offOrigin.length} off the origin` +
  `${problems.length ? ", problems: " + problems.join("; ") : ""}${result.ended ? ", ENDED: " + JSON.stringify(result.ended) : ""}`);
process.exit(0);
