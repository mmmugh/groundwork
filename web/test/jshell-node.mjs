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
// What JShellSession needs from a browser, given under Node: Ristretto's worker script in a worker thread that looks
// like a Web Worker from inside (self, postMessage, onmessage) and from outside (postMessage, terminate, onmessage,
// onerror, and exited, which a Web Worker lacks), and file downloads read from disk. Used by
// web/test/jshell-session.mjs and by the transcript check (runtime/jshell/test/check.mjs and its ristretto.mjs).
import fs from "node:fs";
import path from "node:path";
import { Worker } from "node:worker_threads";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildSite, REPO } from "./harness.mjs";

// Inside the thread. A browser holds a worker's messages until its script has run; so does this, since the client
// posts its first request at once and the script takes a moment to load.
const HOST = `
const { parentPort, workerData } = require("node:worker_threads");
globalThis.self = globalThis;
globalThis.postMessage = (m) => parentPort.postMessage(m);
const queue = [];
let loaded = false;
parentPort.on("message", (m) => (loaded ? globalThis.onmessage({ data: m }) : queue.push(m)));
import(workerData.url).then(() => { loaded = true; for (const m of queue.splice(0)) globalThis.onmessage({ data: m }); });
`;
export function nodeWorker(url) {
  const thread = new Worker(HOST, { eval: true, workerData: { url } });
  const w = {
    onmessage: null, onerror: null, onmessageerror: null, terminated: false,
    // Settles once the thread has really stopped (its exit event): a test can tell a stopped thread from the flag.
    exited: new Promise((resolve) => thread.once("exit", resolve)),
    postMessage: (m) => thread.postMessage(m),
    terminate: () => { w.terminated = true; thread.terminate(); },
  };
  thread.on("message", (data) => w.onmessage?.({ data }));
  thread.on("messageerror", () => w.onmessageerror?.({}));
  thread.on("error", (e) => w.onerror?.({ message: String(e?.message ?? e) }));
  thread.on("exit", (code) => { if (!w.terminated) w.onerror?.({ message: `the worker thread exited (${code})` }); });
  return w;
}
export const nodeFetchBytes = async (url) => new Uint8Array(fs.readFileSync(fileURLToPath(url)));

// The directory under test, laid out as site/scratchpad/: --scratchpad <dir>, or a fixture site built the way the
// course is (harness.buildSite), so the test reads what the build publishes, manifest.json included.
export function scratchpadDir(argv, usage, siteName) {
  if (argv.length === 0) return path.join(buildSite(path.join(REPO, "web/test/vol-page"), siteName), "site/scratchpad");
  if (argv.length === 2 && argv[0] === "--scratchpad" && fs.existsSync(path.join(argv[1], "manifest.json"))) return path.resolve(argv[1]);
  console.log(usage);
  process.exit(2);
}
export const dirUrl = (dir) => pathToFileURL(dir.endsWith(path.sep) ? dir : dir + path.sep);
