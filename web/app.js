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
// The page's entry. Checks once whether this browser can run Java; if it cannot, every box that could run says so,
// with the minimum versions, and offers nothing, and so does the scratchpad's panel (also when only the scratchpad
// cannot run). This module and support.js, the only one it imports, are kept to
// syntax every browser with module scripts parses (no dynamic import, no module meta URL, nothing newer than
// ES2017), so a browser too old to run Java still gets the message and not a parse error that skips the nomodule
// fallback too (DESIGN section 5, D20). The Run code is page/wire.js, loaded only once support is confirmed.
import { javaSupport, scratchpadSupport, FATAL } from "./page/support.js";

var root = document.documentElement;
// Every box that could run says message, and offers nothing.
function tell(message) {
  var boxes = document.querySelectorAll(".box:not([data-kind=reference])");
  for (var i = 0; i < boxes.length; i++) {
    var p = document.createElement("p");
    p.className = "nojava";
    p.textContent = message;
    boxes[i].appendChild(p);
  }
}
// The scratchpad (web/page.html's tab and panel) in a browser that cannot run it: the tab still shows, and the panel
// says why where jshell would be, with no input and nothing downloaded. page/scratchpad.js never loads here, so
// this stays in the same old syntax as the rest of this file.
var SCRATCHPAD_CANNOT = "This browser can't run the scratchpad. It runs in Chrome 119, Firefox 120 and Safari 18.2 " +
  "(on iPhone and iPad, iOS 18.2) or newer. The boxes on the page still run.";
function scratchpadCannot(message) {
  var tab = document.querySelector(".scratch-tab"), panel = document.getElementById("scratchpad");
  panel.querySelector(".transcript").textContent = message;
  panel.querySelector(".scratch-about").hidden = true;
  panel.querySelector(".entry").hidden = true;
  // While the sheet shows, the page's end, its Previous and Next links included, can still scroll above it (app.css,
  // body[data-sheet=open], --sheet: the sheet's height), as page/scratchpad.js keeps it for the panel that runs.
  function sheet() { root.style.setProperty("--sheet", panel.hidden ? "0px" : panel.offsetHeight + "px"); }
  function setOpen(yes) {
    panel.hidden = !yes;
    tab.hidden = yes;
    tab.setAttribute("aria-expanded", String(yes));
    document.body.dataset.sheet = yes ? "open" : "shut";
    sheet();
  }
  tab.onclick = function () { setOpen(true); };
  panel.querySelector(".scratch-close").onclick = function () { setOpen(false); };
  if (typeof ResizeObserver === "function") new ResizeObserver(sheet).observe(panel);
  document.body.dataset.sheet = "shut";
  tab.hidden = false;
  root.dataset.scratchpad = "unsupported";
}
if (!javaSupport().ok) {
  tell(document.getElementById("nojava").textContent);
  scratchpadCannot(document.getElementById("nojava").textContent);
  root.dataset.java = "unsupported";
} else {
  if (!scratchpadSupport().ok) scratchpadCannot(SCRATCHPAD_CANNOT);
  // Everything that runs Java loads only in a browser that can run it, by a module script element whose address is
  // found from this module's own script element (a module has no document.currentScript).
  var entry = document.querySelector('script[type="module"][src$="app.js"]');
  var wire = document.createElement("script");
  wire.type = "module";
  wire.src = new URL("page/wire.js", entry.src).href; // app.js sits at the site root
  // The Run code did not load (a dropped connection, a file missing from the site): every box says so, in the words
  // web/page/box.js uses for a run that went wrong (support.js's FATAL), and data-java is set, so nothing waits
  // forever.
  var failed = function () {
    tell(FATAL);
    root.dataset.java = "failed";
  };
  wire.onerror = failed;
  // The Run code loaded but threw while it ran (wire.js, or a module it imports): the browser reports the error and
  // still fires load, and wire.js, which sets data-java last, never set it.
  wire.onload = function () {
    if (!root.dataset.java) failed();
  };
  document.head.appendChild(wire);
}
