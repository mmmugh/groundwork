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
// One off-origin gate for every browser test (P3-15): web/test/harness.mjs's open and runtime/jshell/test/browser.mjs
// both guard their context with it. Everything that leaves the page's origin is recorded and stopped, so nothing
// arrives anywhere during a test (the page must talk to nobody):
// - a request, the page's or a worker's: context.route records it and aborts it, and context.on("request") records
//   what the route might not see. Neither sees what WebKit and Firefox refuse before sending (a port the fetch
//   standard bars, such as 9), which is never sent.
// - a page's WebSocket: context.routeWebSocket records it and closes it with code 1008, never connecting it.
// - a worker's WebSocket, which Playwright's socket route sees in no engine: the origin server sends CSP, which blocks
//   only off-origin WebSockets (http: and https: stay allowed, so the route still sees every other request) [B1].
//   Chromium and Firefox report the block to /__csp, where cspReportHandler records it (their only record of it); a
//   report arrives asynchronously, so a check that reads one waits for it with a bound. WebKit blocks it without a
//   report. page.on("websocket") records every socket a page reports, a worker's included when no CSP stops it (all
//   three engines, measured with Playwright 1.63).
// No playwright import: it works on the context it is given.

// The test servers' header (W-18). The shipped site sends no such header.
export const CSP = "connect-src 'self' http: https: blob: data:; report-uri /__csp";

// Whether url leaves origin: anything but the origin's own URLs and the page's blob: and data: URLs.
export function isOffsite(origin, url) {
  return !url.startsWith(origin + "/") && !url.startsWith("blob:") && !url.startsWith("data:");
}

// Guards context, opened at origin, before its first page: requests collects the URL of every request the context
// sees, in order; offsite collects everything that left the origin, each stopped before it arrives.
export async function guardOrigin(context, origin) {
  const requests = [], offsite = [];
  const leaves = (u) => isOffsite(origin, u.href);
  const seen = new WeakSet(); // a request both routed and reported is recorded once
  const record = (r) => { if (!seen.has(r) && isOffsite(origin, r.url())) { seen.add(r); offsite.push(r.url()); } };
  const onRequest = (r) => { requests.push(r.url()); record(r); };
  const abort = (route) => { record(route.request()); return route.abort(); };
  const onSocket = (ws) => { if (isOffsite(origin, ws.url())) offsite.push(ws.url()); };
  const onPage = (page) => page.on("websocket", onSocket);
  context.on("request", onRequest);
  context.on("page", onPage);
  context.pages().forEach(onPage);
  await context.route(leaves, abort);
  await context.routeWebSocket(leaves, (ws) => {
    offsite.push(ws.url());
    return ws.close({ code: 1008, reason: "off-origin" });
  });
  return { requests, offsite };
}

// For an origin server that sends CSP: answers a POST to /__csp, the browser's report of something the CSP blocked
// (sent to the page's own origin, so the gate lets it through), and hands the blocked URL to record. A report it
// cannot read is recorded too, in words, so it fails a check rather than vanishing. Returns whether it answered.
export function cspReportHandler(record) {
  return (req, res) => {
    if (req.method !== "POST" || new URL(req.url, "http://x").pathname !== "/__csp") return false;
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const body = Buffer.concat(chunks).toString("utf8");
      let blocked = null;
      try { blocked = JSON.parse(body)["csp-report"]["blocked-uri"]; } catch { /* recorded below, in words */ }
      record(typeof blocked === "string" && blocked ? blocked : `an unreadable CSP report: ${body.slice(0, 200)}`);
      res.writeHead(204).end();
    });
    return true;
  };
}
