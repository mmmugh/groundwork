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
// The page's Run code, loaded by app.js only in a browser that can run Java: wires every box that runs to one
// BrowserRunner, made on the first Run, every predict box, which needs none, and the scratchpad. Sets data-java to
// "ready" once the boxes are wired; the scratchpad sets data-scratchpad itself.
import { wireBox, wirePredict } from "./box.js";
import { BrowserRunner } from "../runner/browser-runner.js";

const root = document.documentElement;
let runner = null;
function getRunner() {
  if (!runner) {
    runner = new BrowserRunner(new URL("../", import.meta.url)); // the site root, where runtime/ and runner/ sit
    root.dataset.runner = "started";
  }
  return runner;
}
for (const box of document.querySelectorAll(".box:not([data-kind=reference]):not([data-kind=predict])")) wireBox(box, getRunner);
for (const box of document.querySelectorAll(".box[data-kind=predict]")) wirePredict(box);
// The scratchpad, unless app.js found this browser cannot run it; nothing of it downloads until the reader opens it.
// Its code loads apart from the boxes' (a dynamic import, not a static one, which would take this whole module down
// with it): a fault in it, a file missing from the site or an error while wiring, leaves its tab hidden, sets
// data-scratchpad to "failed" and reaches the page's error reporting, and never stops a box.
// window.jfScratchpadLimits is a test's hook (the browser tests shorten the backstop and a restart's deadline with
// it); no page sets it.
if (root.dataset.scratchpad !== "unsupported")
  import("./scratchpad.js")
    .then((m) => m.wireScratchpad(document.getElementById("scratchpad"), document.querySelector(".scratch-tab"),
      new URL("../scratchpad/", import.meta.url), window.jfScratchpadLimits))
    .catch((e) => { root.dataset.scratchpad = "failed"; setTimeout(() => { throw e; }); });
root.dataset.java = "ready";
