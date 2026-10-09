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
// Our front end on Ristretto, headless under Node, driven by the page's own client: JShellSession
// (web/page/jshell-session.js) over Ristretto's unmodified worker in a worker thread (web/test/jshell-node.mjs), reading
// a built site's scratchpad/ as a page does: manifest.json, then the five files, each checked, the jar composed into the
// pinned zip, then one request per line (drive.mjs). One worker per process, so one session per run.
// usage: node ristretto.mjs SESSION.jsh OUT_JSON --scratchpad DIR   (DIR: a built site's scratchpad/, holding manifest.json)
// Writes the shape RealJShell and OurJShell write, plus per-entry milliseconds.
import fs from "node:fs";
import { JShellSession } from "../../../web/page/jshell-session.js";
import { nodeWorker, nodeFetchBytes, dirUrl } from "../../../web/test/jshell-node.mjs";
import { drive } from "./drive.mjs";
import { parseSession } from "./sessions.mjs";

const args = process.argv.slice(2);
const [sessionFile, outFile] = args;
const dir = args[2] === "--scratchpad" ? args[3] : null;
if (args.length !== 4 || !dir) { console.error("usage: node ristretto.mjs SESSION.jsh OUT_JSON --scratchpad DIR"); process.exit(2); }

const entries = parseSession(fs.readFileSync(sessionFile, "utf8"));
const result = await drive(entries, (onOutput) => new JShellSession(dirUrl(dir), { createWorker: nodeWorker,
  fetchBytes: nodeFetchBytes, caches: null, onOutput }));
result.side = "ours-ristretto";
fs.writeFileSync(outFile, JSON.stringify(result, null, 1));
console.error(`${result.side}: ${result.entries.length} of ${entries.length} entries, boot ${result.bootMs} ms, total ${result.totalMs} ms` +
  `${result.ended ? ", ENDED: " + JSON.stringify(result.ended) : ""}`);
process.exit(0);
