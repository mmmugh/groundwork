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
// Re-pins what the proof is made of after a meant change: the jar build.sh builds from src/, every session file, the
// J1 startup file and the number of entries. Ristretto's five files are not pinned here: runtime/ristretto/CHECKSUMS
// pins them, with this jar (a re-pinned jar reaches the Ristretto and browser modes through a new scratchpad release).
// usage: node pin.mjs     then review the diff of test/pins.json and commit it with the change.
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { annotatedSession } from "./sessions.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const front = path.resolve(here, "..");
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
execFileSync("sh", [path.join(front, "build.sh")], { stdio: "ignore" });
const file = path.join(here, "pins.json");
const pins = JSON.parse(fs.readFileSync(file, "utf8"));
pins.jar = sha(path.resolve(front, "../.work/jshell/out/browser-jshell.jar"));
pins.sessions = {};
let entries = 0;
for (const f of fs.readdirSync(path.join(here, "sessions")).filter((f) => f.endsWith(".jsh")).sort()) {
  const p = path.join(here, "sessions", f);
  pins.sessions[f] = sha(p);
  entries += annotatedSession(fs.readFileSync(p, "utf8")).length;
}
pins.sessions["startup-time.jsh"] = sha(path.join(here, "startup-time.jsh"));
pins.entries = entries;
fs.writeFileSync(file, JSON.stringify(pins, null, 1) + "\n");
console.log(`pinned jar ${pins.jar}, ${Object.keys(pins.sessions).length} files, ${entries} entries`);
