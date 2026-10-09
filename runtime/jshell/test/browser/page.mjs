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
// The staged page: the page's own client (page/jshell-session.js, which composes our jar into Ristretto's pinned zip
// with page/compose.js) over Ristretto's unmodified worker, everything fetched from this page's own origin, the
// scratchpad's files under scratchpad/ as a built site has them. test/browser.mjs runs a session file through it with
// window.scratch.drive, the same loop (drive.mjs) ristretto.mjs runs under Node.
import { JShellSession } from "./page/jshell-session.js";
import { drive } from "./drive.mjs";

window.scratch = {
  drive: (entries) => drive(entries, (onOutput) => new JShellSession(new URL("scratchpad/", location.href), { onOutput })),
};
