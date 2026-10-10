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
// The built page in Chromium, WebKit and Firefox, on the page fixture volume: it knows whether it can run Java,
// tells an old browser so plainly, talks to nobody, and never scrolls sideways at 390 px. A box runs its program,
// asks its questions by replay, stops a runaway, and keeps the reader's edits (Task 8, D41). Task 9 adds Check.
//   node web/test/page.mjs [chromium|webkit|firefox]
import fs from "node:fs";
import path from "node:path";
import { REPO, ENGINES, check, done, buildSite, open, workDir } from "./harness.mjs";

const only = process.argv[2];
if (only && !ENGINES[only]) { console.log("usage: node web/test/page.mjs [chromium|webkit|firefox]"); process.exit(2); }
const site = path.join(buildSite(path.join(REPO, "web/test/vol-page"), "page-test"), "site");
const PAGES = ["vol-page/ch01-run.html", "vol-page/ch02-check.html"];
const MINIMUMS = "Chrome 119, Firefox 120 and Safari 18.2";
// The page sets data-java once it is set up; nothing can be clicked before that.
const ready = (t) => t.page.waitForFunction(() => document.documentElement.dataset.java);
const FATAL = "Something went wrong running this box. Reload the page and try again.";
const DIVERGED = "This program printed something different when it ran again with your answer (does it use the clock?), " +
  "so the output above may be mixed up.";
// What a box that ran out of time says, and the sentence it adds on a page that is not secure (plain http from another
// device), where Safari and every iPhone or iPad browser run Java much more slowly (D90, D91; chosen by isSecureContext).
const TIMED_OUT = "Stopped: the program ran for more than 5 seconds. An endless loop?";
const PLAIN_HTTP_SLOW = "On a plain http address, Safari and every iPhone or iPad browser run Java much more slowly; open the " +
  "course over https or from localhost.";
// What a page downloads only to run Java (D40e): the runtime's files and the worker that loads them.
const RUNTIME_URL = /\/runtime\/|\/runner\/browser-worker\.js(\?|$)/;
// What only the scratchpad downloads, and only once the reader opens it (D29).
const SCRATCHPAD_URL = /\/scratchpad\//;
// Every run the page starts, seen from the page (an init script): when its worker was sent the program, and when the
// page terminated that worker. A spare worker never sent a program is not a run.
const WATCH_RUNS = () => {
  const Real = window.Worker;
  window.jfRuns = [];
  window.Worker = class Worker extends Real {
    postMessage(m, ...rest) {
      if (m && m.type === "run") window.jfRuns.push(this.jfRun = { posted: performance.now(), terminated: null });
      return super.postMessage(m, ...rest);
    }
    terminate() {
      if (this.jfRun && this.jfRun.terminated == null) this.jfRun.terminated = performance.now();
      return super.terminate();
    }
  };
};
// How an element's text lays out: its lines of text, the lines they take on screen (the distinct tops of the text's
// boxes, so an inline element is measured too), whether it scrolls sideways, and the page's own width.
const LAYOUT = (el) => {
  const range = document.createRange();
  range.selectNodeContents(el);
  return { textLines: el.textContent.replace(/\n$/, "").split("\n").length,
    visualLines: new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size,
    scrollW: el.scrollWidth, clientW: el.clientWidth, page: document.documentElement.scrollWidth };
};
// The built site with its Run code missing, as a dropped connection or a broken deploy would leave it.
const broken = workDir("page-test-nobox");
fs.cpSync(site, broken, { recursive: true });
fs.rmSync(path.join(broken, "page/box.js"));
// The built site with an error planted at the end of page/box.js: the Run code loads, then throws while it evaluates,
// so page/wire.js, which imports it, never runs and never sets data-java.
const PLANTED = "jf: an error planted at the end of box.js";
const planted = workDir("page-test-planted");
fs.cpSync(site, planted, { recursive: true });
fs.appendFileSync(path.join(planted, "page/box.js"), `\nthrow new Error(${JSON.stringify(PLANTED)});\n`);
// The built site with the scratchpad's code missing: the boxes' Run code loads it apart, so the boxes must still run.
const noScratchpad = workDir("page-test-noscratchpad");
fs.cpSync(site, noScratchpad, { recursive: true });
fs.rmSync(path.join(noScratchpad, "page/scratchpad.js"));
// Each engine's words for that missing module's dynamic import, probed (WebKit's do not name the module).
const SCRATCHPAD_IMPORT_FAILED = new RegExp("^TypeError: (Failed to fetch dynamically imported module: .*/page/scratchpad\\.js" +
  "|error loading dynamically imported module: .*/page/scratchpad\\.js|Importing a module script failed\\.)$");
// The built site with app.js missing: no module code tells the boxes anything, so the nomodule fallback is all there is.
const noApp = workDir("page-test-noapp");
fs.cpSync(site, noApp, { recursive: true });
fs.rmSync(path.join(noApp, "app.js"));

for (const engine of only ? [only] : Object.keys(ENGINES)) {
  console.log(engine);
  let t = await open(engine, site, PAGES[0]);
  await ready(t);
  check(`${engine}: the page can run Java`, await t.page.evaluate(() => document.documentElement.dataset.java) === "ready", null);
  check(`${engine}: no box says it cannot`, await t.page.locator(".nojava:visible").count() === 0, null);
  check(`${engine}: no request left the page's origin`, t.offsite.length === 0, t.offsite);
  check(`${engine}: no page error`, t.errors.length === 0, t.errors);
  await t.close();

  // Both pages: ch02's boxes have checks and predictions, and a box with one says why not as plainly.
  for (const p of PAGES) {
    // A browser without the WebAssembly features Java needs: every box says so, and offers nothing that cannot work.
    t = await open(engine, site, p, {}, () => { WebAssembly.validate = () => false; });
    await ready(t);
    check(`${engine}: ${p} without WasmGC knows it`, await t.page.evaluate(() => document.documentElement.dataset.java) === "unsupported", null);
    const runnable = await t.page.locator(".box:not([data-kind=reference])").count();
    const told = await t.page.locator(".box p.nojava", { hasText: MINIMUMS }).count();
    check(`${engine}: ${p} without WasmGC: every box that could run says why not, with the minimum versions`, runnable > 0 && told === runnable, { runnable, told });
    check(`${engine}: ${p} without WasmGC: no box offers a button`, await t.page.locator(".box button").count() === 0, null);
    await t.close();

    // A browser whose Worker never reads options.type (no module workers) but has every WebAssembly feature: the
    // module-worker test alone must turn the page away. The Worker here is a constructor that ignores its options.
    t = await open(engine, site, p, {}, () => { window.Worker = function Worker() { this.terminate = () => {}; }; });
    await ready(t);
    check(`${engine}: ${p} without module workers knows it`, await t.page.evaluate(() => document.documentElement.dataset.java) === "unsupported", null);
    const runnableW = await t.page.locator(".box:not([data-kind=reference])").count();
    const toldW = await t.page.locator(".box:not([data-kind=reference]) p.nojava", { hasText: MINIMUMS }).count();
    check(`${engine}: ${p} without module workers: every box that could run says why not`, runnableW > 0 && toldW === runnableW, { runnableW, toldW });
    check(`${engine}: ${p} without module workers: no box offers a button`, await t.page.locator(".box button").count() === 0, null);
    await t.close();
  }

  t = await open(engine, site, PAGES[0], { javaScriptEnabled: false });
  check(`${engine}: without JavaScript the page says Java cannot run here`,
    await t.page.locator("p.nojava", { hasText: MINIMUMS }).isVisible(), null);
  await t.close();

  t = await open(engine, site, PAGES[0], {}, WATCH_RUNS);
  await ready(t);
  const box = (n) => t.page.locator(`.box[data-box="ch01-run#${n}"]`);
  const text = async (n) => (await box(n).locator(".run").innerText()).replace(/\r/g, "");
  const click = (n, name) => box(n).getByRole("button", { name, exact: true }).click();
  const settled = (n, ms = 15000) => t.page.waitForFunction((id) => {
    const s = document.querySelector(`.box[data-box="${id}"]`).dataset.state;
    return s === "done" || s === "waiting";
  }, `ch01-run#${n}`, { timeout: ms });
  const answer = async (n, a) => { await box(n).locator("input.answer").fill(a); await box(n).locator("input.answer").press("Enter"); await settled(n); };

  check(`${engine}: a page that is only read loads no runtime`, await t.page.evaluate(() => document.documentElement.dataset.runner) === undefined, null);
  check(`${engine}: and downloads none of it (D40e)`, !t.requests.some((u) => RUNTIME_URL.test(u)), t.requests.filter((u) => RUNTIME_URL.test(u)));
  await click(1, "Run"); await settled(1);
  check(`${engine}: the first Run starts the runtime`, await t.page.evaluate(() => document.documentElement.dataset.runner) === "started", null);
  // Without this the check above could pass only because the listener never sees such requests.
  check(`${engine}: and the test sees the runtime's requests once a Run makes them`,
    t.requests.some((u) => /\/runtime\//.test(u)) && t.requests.some((u) => /\/runner\/browser-worker\.js/.test(u)), t.requests);
  check(`${engine}: Run shows what the program prints`, (await text(1)).includes("Hello, <world> & café 😀"), await text(1));
  await click(2, "Run"); await settled(2);
  check(`${engine}: an uncaught exception reads as the JDK prints it`,
    (await text(2)).includes('Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3'), await text(2));
  await click(3, "Run"); await settled(3);
  check(`${engine}: an endless loop is stopped and says so, and on this secure page says nothing about plain http`,
    (await text(3)).startsWith("start") && (await text(3)).includes(TIMED_OUT) && !(await text(3)).includes("plain http"), await text(3));
  await click(1, "Run"); await settled(1);
  check(`${engine}: the next Run works`, (await text(1)).includes("Hello"), await text(1));
  await click(4, "Run"); await settled(4, 20000);
  check(`${engine}: endless printing is stopped at a cap, and the page lives`,
    (await text(4)).includes("Stopped: the program printed more than a million characters or 100,000 lines."), (await text(4)).slice(-200));
  await click(5, "Run"); await settled(5);
  check(`${engine}: endless recursion reads as the JDK prints it`, (await text(5)).includes('Exception in thread "main" java.lang.StackOverflowError'), await text(5));
  await click(6, "Run"); await settled(6);
  check(`${engine}: a question waits inline after its prompt`,
    (await text(6)).startsWith("How many?") && await box(6).locator("input.answer").isVisible(), await text(6));
  await answer(6, "21");
  check(`${engine}: the answer shows where it was typed and the program goes on`, (await text(6)).replace(/\n$/, "") === "How many? 21\n42", await text(6));
  await click(7, "Run"); await settled(7);
  await answer(7, "café 😀"); await answer(7, "Oslo");
  check(`${engine}: two answers, one non-ASCII, read like a terminal`, (await text(7)).replace(/\n$/, "") === "Name? café 😀\nCity? Oslo\ncafé 😀 from Oslo", await text(7));
  await click(7, "Run"); await settled(7);
  await answer(7, ""); await answer(7, "");
  check(`${engine}: an empty answer (just Enter) is an answer`, (await text(7)).replace(/\n$/, "") === "Name? \nCity? \n from ", await text(7));
  await click(8, "Run"); await settled(8);
  await answer(8, "a"); await answer(8, "b");
  await box(8).locator("input.answer").press("Control+d"); await settled(8);
  check(`${engine}: Ctrl-D ends input`, (await text(8)).includes("lines: 2") && await box(8).locator("input.answer").count() === 0, await text(8));
  await click(8, "Run"); await settled(8);
  await answer(8, "a");
  await click(8, "End input"); await settled(8);
  check(`${engine}: the End input button ends input too (phones have no Ctrl)`, (await text(8)).includes("lines: 1"), await text(8));
  await click(9, "Run"); await settled(9);
  check(`${engine}: a prompt printed before a hang stays on screen`, (await text(9)).startsWith("Guess: ") && (await text(9)).includes("Stopped:"), await text(9));
  // Run pressed again, or Reset, while box 3's endless loop runs: its worker is terminated at once, not at the 5 s
  // deadline. Returns how long after the click the page terminated the worker of the run the first click started.
  const stopsAt = async (n, name) => {
    const k = await t.page.evaluate(() => window.jfRuns.length);
    await click(n, "Run");
    await t.page.waitForFunction(([id, k]) => document.querySelector(`.box[data-box="${id}"]`).dataset.state === "running"
      && window.jfRuns.length > k, [`ch01-run#${n}`, k]); // the run's worker has the program: it is spinning
    const at = await t.page.evaluate(() => performance.now());
    await click(n, name);
    await t.page.waitForFunction((k) => window.jfRuns[k].terminated != null, k, { timeout: 10000 });
    return t.page.evaluate(([k, at]) => window.jfRuns[k].terminated - at, [k, at]);
  };
  const lagRun = await stopsAt(3, "Run"); await settled(3);
  const twice = await text(3);
  check(`${engine}: Run pressed again stops the old run; its output never lands in the new one`,
    twice.split("start").length === 2 && twice.split("Stopped:").length === 2, twice);
  check(`${engine}: Run pressed again terminates the old run's worker at once, not at its deadline`, lagRun < 1000, lagRun);
  await box(3).locator("textarea.code").fill('void main() {\n    IO.println("edited");\n    while (true) {}\n}\n');
  const lagReset = await stopsAt(3, "Reset");
  await t.page.waitForTimeout(6000); // an absence: past the deadline the stopped run would have reached
  check(`${engine}: Reset during a run stops it, and nothing of it lands afterward`,
    (await box(3).locator(".run").count() === 0 || (await text(3)) === "")
      && (await box(3).locator("textarea.code").inputValue()).includes('"start"'), await box(3).innerText());
  check(`${engine}: Reset during a run terminates its worker at once, not at its deadline`, lagReset < 1000, lagReset);
  await box(1).locator("textarea.code").fill("void main() {\n    IO.println(x);\n}\n");
  await click(1, "Run"); await settled(1);
  check(`${engine}: a compile error reads as javac prints it`,
    (await text(1)).includes("Main.java:2: error: cannot find symbol\n    IO.println(x);\n               ^") && (await text(1)).includes("1 error"), await text(1));
  await click(1, "Reset");
  check(`${engine}: Reset restores the code and clears the output`,
    (await box(1).locator("textarea.code").inputValue()).includes("Hello, <world>") && (await box(1).locator(".run").count() === 0 || (await text(1)) === ""), null);
  await click(13, "Run"); await settled(13);
  const teavm = await text(13);
  check(`${engine}: a compile that fails at TeaVM's stage shows why once, with no line of the file`,
    teavm.includes("error: Parameter 1 of method") && teavm.split("is marked with @JSByRef").length === 2
      && !teavm.includes("Main.java") && !teavm.includes("Reload the page") && teavm.trimEnd().endsWith("1 error")
      && await box(13).locator(".run span.err").count() === 1, teavm);
  await click(14, "Run"); await settled(14);
  await answer(14, "Ann");
  const warned = await text(14);
  check(`${engine}: what a program wrote to stderr before a question shows once after the answer`,
    warned.split("warming up").length === 2 && warned.includes("Hi Ann"), warned);
  await click(15, "Run"); await settled(15);
  await answer(15, "y");
  check(`${engine}: a replay that prints something different (the clock) says so`, (await text(15)).includes(DIVERGED), await text(15));
  // Run pressed again, and Reset, while box 16 still prints (a line every 2 ms): output of the old run already on its
  // way (in the worker's messages, or waiting for the next frame) never lands in the box. Every line carries its
  // run's own random number, so a line of the old run is told from a line of the new one.
  const runsIn = async () => [...new Set((await text(16)).match(/^run \d+/gm) ?? [])];
  const printing = () => t.page.waitForFunction(() =>
    /line 20\n/.test(document.querySelector('.box[data-box="ch01-run#16"] .run').textContent), null, { timeout: 20000 });
  await click(16, "Run"); await printing();
  const [old] = await runsIn();
  await click(16, "Run"); await settled(16, 20000);
  const again = await runsIn();
  check(`${engine}: Run pressed again while the old run still prints: no line of it lands in the new run's output`,
    old != null && again.length === 1 && again[0] !== old && (await text(16)).includes("line 800\n"), { old, again });
  // Reset is offered only for edited code: the edit is a comment, so the run prints as before.
  await box(16).locator("textarea.code").fill((await box(16).locator("textarea.code").inputValue()) + "// edited\n");
  await click(16, "Run"); await printing();
  await click(16, "Reset");
  await t.page.waitForTimeout(1000); // an absence: time for output already on its way to land
  check(`${engine}: Reset while a run still prints: nothing of it lands afterward`,
    await box(16).locator(".run").count() === 0 || (await text(16)) === "", (await box(16).innerText()).slice(0, 200));
  check(`${engine}: no request left the page's origin while running`, t.offsite.length === 0, t.offsite);
  check(`${engine}: no page error while running`, t.errors.length === 0, t.errors);
  check(`${engine}: a page that is read, its boxes run, downloads nothing of the scratchpad (D29)`,
    !t.requests.some((u) => SCRATCHPAD_URL.test(u)), t.requests.filter((u) => SCRATCHPAD_URL.test(u)));
  // Without this the check above could pass only because the listener never sees the scratchpad's requests.
  await t.page.locator(".scratch-tab").click();
  for (const end = Date.now() + 10000; !t.requests.some((u) => /\/scratchpad\/manifest\.json$/.test(u)) && Date.now() < end;)
    await new Promise((r) => setTimeout(r, 25));
  check(`${engine}: and the test sees the scratchpad's requests once its panel opens`,
    t.requests.some((u) => /\/scratchpad\/manifest\.json$/.test(u)), t.requests.filter((u) => SCRATCHPAD_URL.test(u)));
  check(`${engine}: a box with no check offers no Check button`,
    await t.page.getByRole("button", { name: "Check", exact: true }).count() === 0, null);
  await t.close();

  // The same endless loop on a page that is not secure: a real insecure origin (harness forwardProxy), loaded over the
  // network, where WebKit really is slower (D90). The box still stops it at the deadline, and adds where Safari and every
  // iPhone or iPad browser can run Java at speed (D91).
  t = await open(engine, site, PAGES[0], {}, null, { insecure: true });
  await ready(t);
  const insecureHere = await t.page.evaluate(() => window.isSecureContext);
  await box(3).getByRole("button", { name: "Run", exact: true }).click();
  await settled(3, 90000).catch(() => {}); // bounded: a box that never settles fails the check below
  check(`${engine}: plain http: an endless loop is stopped and says so, and that Safari and every iPhone or iPad browser run Java much more slowly there`,
    insecureHere === false && (await text(3)).startsWith("start") && (await text(3)).includes(`${TIMED_OUT} ${PLAIN_HTTP_SLOW}`),
    { insecureHere, text: await text(3) });
  check(`${engine}: plain http: no request left the page's origin, and no page error`, t.offsite.length === 0 && t.errors.length === 0,
    { offsite: t.offsite, errors: t.errors });
  await t.close();

  t = await open(engine, site, PAGES[1], {}, WATCH_RUNS);
  await ready(t);
  const cbox = (n) => t.page.locator(`.box[data-box="ch02-check#${n}"]`);
  const verdict = async (n) => (await cbox(n).locator(".verdict").innerText()).replace(/\r/g, "");
  const checkBox = async (n, code) => {
    if (code != null) await cbox(n).locator("textarea.code").fill(code);
    await cbox(n).getByRole("button", { name: "Check", exact: true }).click();
    await t.page.waitForFunction((id) => document.querySelector(`.box[data-box="${id}"] .verdict`)?.dataset.done === "yes",
      `ch02-check#${n}`, { timeout: 20000 });
    return verdict(n);
  };
  const EVEN = "boolean isEven(int n) {\n    return n % 2 == 0;\n}\n\nvoid main() {\n    IO.println(isEven(4));\n}\n";
  let v = await checkBox(1);
  check(`${engine}: the starter fails, naming a case`, v.includes("isEven(4) returned false, expected true") && v.includes("of 4 cases failed."), v);
  v = await checkBox(1, EVEN);
  check(`${engine}: a right method passes every case`, v.includes("Passed all 4 cases."), v);
  v = await checkBox(1, EVEN.replaceAll("isEven", "isEvn"));
  check(`${engine}: a renamed method is explained in plain words`, v.includes("Check could not find a method isEven that takes (int)."), v);
  v = await checkBox(1, EVEN.replace("int n", "String n").replace("n % 2", "n.length() % 2"));
  check(`${engine}: a changed parameter type is explained`, v.includes("isEven's parameter should be int, but yours takes String."), v);
  v = await checkBox(1, EVEN.replace("boolean isEven", "int isEven").replace("return n % 2 == 0;", "return n % 2;"));
  check(`${engine}: a changed return type is explained`, v.includes("isEven should return boolean, but yours returns int."), v);
  v = await checkBox(1, EVEN.replace("return n % 2 == 0;", "return n % 2 == 0"));
  check(`${engine}: the reader's own syntax error is shown as javac prints it`, v.includes("Your code does not compile yet:") && v.includes("Main.java:2: error:"), v);
  // javac, given this file alone, puts the caret right after the closing parenthesis (column 36) (Ruling 29).
  v = await checkBox(1, EVEN.replace("void main() {\n    IO.println(isEven(4));\n}\n", "void main() { IO.println(isEven(4)) }\n"));
  check(`${engine}: an error on the line of the reader's main puts the caret where javac puts it`,
    v.includes("Main.java:5: error: ';' expected\nvoid main() { IO.println(isEven(4)) }\n" + " ".repeat(35) + "^\n"), v);
  check(`${engine}: What it should do lists the cases`, (await cbox(1).locator(".cases").innerText()).includes("isEven(4) -> true"), null);
  v = await checkBox(2);
  // The starter prints one blank line, which tidying removes: it prints nothing, not "a blank line".
  check(`${engine}: an output exercise's starter fails`, v.includes("It prints nothing. Line 1 should be: Ada"), v);
  v = await checkBox(2, 'void main() {\n    IO.println("Ada");\n}\n');
  check(`${engine}: a right output passes`, v.includes("Correct."), v);
  v = await checkBox(3, 'void main() {\n    int n = Integer.parseInt(IO.readln("Number: "));\n    IO.println("Doubled: " + (n * 2));\n}\n');
  check(`${engine}: an input exercise passes however it is worded`, v.includes("Passed all 2 runs."), v);
  v = await checkBox(3, 'void main() {\n    int n = Integer.parseInt(IO.readln("Number: "));\n    IO.println(n + n + 1);\n}\n');
  // "With input 5:" alone would also match a pass ("With input 5: correct"): the verdict must fail, naming the input.
  check(`${engine}: a wrong input exercise fails, naming the input`,
    v.includes("of 2 runs failed.") && v.includes("With input 5: expected"), v);
  await cbox(4).locator("textarea.prediction").fill("5\nx5");
  v = await checkBox(4);
  check(`${engine}: a wrong prediction says what it prints`, v.includes("Line 2: you said x5, it prints x2"), v);
  await cbox(4).locator("textarea.prediction").fill("5\nx2");
  v = await checkBox(4);
  check(`${engine}: a right prediction passes and shows the output`, v.includes("Correct.") && await cbox(4).locator("pre.output").isVisible(), v);
  const cclick = (n, name) => cbox(n).getByRole("button", { name, exact: true }).click();
  const cstate = (n, want) => t.page.waitForFunction(([id, want]) => want.includes(document.querySelector(`.box[data-box="${id}"]`).dataset.state),
    [`ch02-check#${n}`, want], { timeout: 20000 });
  // Check stops a run that spins: its worker is terminated at once, not at the 5 s deadline.
  const k = await t.page.evaluate(() => window.jfRuns.length);
  await cbox(1).locator("textarea.code").fill(EVEN.replace("IO.println(isEven(4));", "while (true) {}"));
  await cclick(1, "Run");
  await t.page.waitForFunction(([id, k]) => document.querySelector(`.box[data-box="${id}"]`).dataset.state === "running"
    && window.jfRuns.length > k, ["ch02-check#1", k], { timeout: 20000 }); // the run's worker has the program: it spins
  const at = await t.page.evaluate(() => performance.now());
  v = await checkBox(1);
  const lag = await t.page.evaluate(([k, at]) => window.jfRuns[k].terminated == null ? null : window.jfRuns[k].terminated - at, [k, at]);
  check(`${engine}: Check stops a running box at once, then gives its verdict`, lag != null && lag < 1000 && v.includes("Passed all 4 cases."), { lag, v });
  // Check stops a box waiting for an answer: the answer field goes away with the run.
  const DOUBLED = 'void main() {\n    int n = Integer.parseInt(IO.readln("Number: "));\n    IO.println("Doubled: " + (n * 2));\n}\n';
  await cbox(3).locator("textarea.code").fill(DOUBLED);
  await cclick(3, "Run"); await cstate(3, ["waiting"]);
  const asked = await cbox(3).locator("input.answer").isVisible();
  await cclick(3, "Check");
  const field = await cbox(3).locator("input.answer").count(), endInput = await cbox(3).getByRole("button", { name: "End input" }).isVisible();
  await cstate(3, ["done"]);
  check(`${engine}: Check stops a box waiting for input; its answer field goes away`,
    asked && field === 0 && !endInput && (await verdict(3)).includes("Passed all 2 runs."), { asked, field, endInput });
  // A Check that a Run overtakes: its unfilled verdict goes at once, and no verdict ever lands.
  await cbox(1).locator("textarea.code").fill(EVEN);
  await cclick(1, "Check");
  const unfilled = await cbox(1).locator(".verdict:not([data-done])").count();
  await cclick(1, "Run");
  const atOnce = await cbox(1).locator(".verdict").count();
  await cstate(1, ["done"]); // the Run compiled after the Check did (one compile worker), so the Check has its answer
  await t.page.waitForTimeout(500); // an absence: time for a verdict that must never land to land
  check(`${engine}: a Check overtaken by Run takes its unfilled verdict away at once`, unfilled === 1 && atOnce === 0, { unfilled, atOnce });
  check(`${engine}: and never lands a verdict`, await cbox(1).locator(".verdict").count() === 0
    && (await cbox(1).locator(".run").innerText()).includes("true"), await cbox(1).innerText());
  // A Check that a Reset overtakes never lands a verdict, and leaves the box as Reset left it.
  await cclick(1, "Check");
  await cclick(1, "Reset");
  await checkBox(2); // compiled after box 1's Check (one compile worker): box 1's Check has its answer by now
  await t.page.waitForTimeout(500); // an absence: time for a verdict that must never land to land
  const afterReset = await cbox(1).evaluate((b) => ({ verdicts: b.querySelectorAll(".verdict").length, state: b.dataset.state }));
  check(`${engine}: a Check overtaken by Reset never lands a verdict`, afterReset.verdicts === 0 && afterReset.state === "idle", afterReset);
  // A finished verdict stays through an edit, and Reset, which restores the box as the page was built, removes it.
  v = await checkBox(1, EVEN);
  await cbox(1).locator("textarea.code").fill(EVEN + "\n");
  const edited = await cbox(1).locator(".verdict").count();
  await cclick(1, "Reset");
  check(`${engine}: an edit leaves the verdict; Reset removes it`, v.includes("Passed all 4 cases.") && edited === 1
    && await cbox(1).locator(".verdict").count() === 0, { v, edited });
  check(`${engine}: no request left the page's origin while checking`, t.offsite.length === 0, t.offsite);
  check(`${engine}: no page error while checking`, t.errors.length === 0, t.errors);
  await t.close();

  // A programming error inside Check (here, a TypeError where the check makes its marker) gives the reader the fatal
  // verdict and still reaches the page's error reporting, so the tests' page-error gates see it.
  t = await open(engine, site, PAGES[1], {}, () => {
    Crypto.prototype.getRandomValues = () => { throw new TypeError("jf: an error inside Check"); };
  });
  await ready(t);
  v = await checkBox(1);
  // The error is thrown on its own task, after the verdict: wait for it to reach the page's error reporting (up to 5 s).
  for (const end = Date.now() + 5000; !t.errors.some((e) => e.includes("jf: an error inside Check")) && Date.now() < end;)
    await new Promise((r) => setTimeout(r, 25));
  check(`${engine}: an error inside Check gives the fatal verdict`, v.trim() === FATAL, v);
  check(`${engine}: and reaches the page's error reporting`, t.errors.some((e) => e.includes("jf: an error inside Check")), t.errors);
  await t.close();

  // An edited box keeps its code across a reload, and across the tab crash box 12 causes in Chromium (D41) and, on
  // Linux, in WebKit and Firefox (D113), as web/test/runner.mjs records them.
  const CRASHES_THE_PAGE = ["chromium", ...(process.platform === "linux" ? ["webkit", "firefox"] : [])];
  t = await open(engine, site, PAGES[0]);
  await ready(t);
  const KEPT = 'void main() {\n    IO.println("kept");\n}\n';
  await box(1).locator("textarea.code").fill(KEPT);
  await click(12, "Run");
  let crashed = false;
  try { await settled(12, 15000); } catch (e) { crashed = /crash/i.test(String(e)) || t.errors.includes("the page crashed"); }
  check(`${engine}: a box that fills memory ${CRASHES_THE_PAGE.includes(engine) ? `takes the tab down (${engine === "chromium" ? "D41" : "D113"})` : "is stopped, and the page lives"}`,
    CRASHES_THE_PAGE.includes(engine) ? crashed : !crashed && (await text(12)).includes("Stopped:"), { crashed, errors: t.errors });
  const reopened = []; // page errors and crashes of the pages reopen() makes
  const reopen = async () => {
    const p = await t.context.newPage(); // the same browser context: what a reader's reload keeps, this keeps
    p.on("pageerror", (e) => reopened.push(String(e)));
    p.on("crash", () => reopened.push("the page crashed"));
    await p.goto(`${t.origin}/${PAGES[0]}`);
    await p.waitForFunction(() => document.documentElement.dataset.java);
    return p.locator('.box[data-box="ch01-run#1"]');
  };
  let b1 = await reopen();
  check(`${engine}: the edited box has its code back after ${crashed ? "the crash" : "a reload"}, with Reset offered`,
    await b1.locator("textarea.code").inputValue() === KEPT && await b1.getByRole("button", { name: "Reset", exact: true }).isVisible(), null);
  await b1.getByRole("button", { name: "Reset", exact: true }).click();
  b1 = await reopen();
  check(`${engine}: Reset forgets the kept edit`, (await b1.locator("textarea.code").inputValue()).includes("Hello, <world>"), null);
  check(`${engine}: no request left the page's origin across the reloads`, t.offsite.length === 0, t.offsite);
  // The crash box 12 causes is the one page error expected, and only where the tab went down.
  const reloadErrors = [...t.errors.filter((e) => !(crashed && e === "the page crashed")), ...reopened];
  check(`${engine}: no page error across the reloads`, reloadErrors.length === 0, reloadErrors);
  await t.close();

  // Storage that throws (a private window, blocked storage) is ignored: the box works as if nothing were kept (D41).
  t = await open(engine, site, PAGES[0], {}, () => {
    for (const m of ["getItem", "setItem", "removeItem"]) Storage.prototype[m] = () => { throw new DOMException("blocked", "SecurityError"); };
  });
  await ready(t);
  await box(1).locator("textarea.code").fill('void main() {\n    IO.println("nothing kept");\n}\n');
  await click(1, "Run"); await settled(1);
  check(`${engine}: with storage that throws, a box can still be edited and run`,
    (await text(1)).includes("nothing kept") && await box(1).getByRole("button", { name: "Reset", exact: true }).isVisible(), await text(1));
  check(`${engine}: and storage that throws raises no page error`, t.errors.length === 0, t.errors);
  await t.close();

  // A page whose Run code fails to load says so in every box that could run, and sets data-java, so nothing waits
  // forever. The wait is bounded here so that a page that never sets it fails the check instead of the script.
  t = await open(engine, broken, PAGES[0]);
  await t.page.waitForFunction(() => document.documentElement.dataset.java, null, { timeout: 10000 }).catch(() => {});
  check(`${engine}: when the Run code fails to load, the page knows it`, await t.page.evaluate(() => document.documentElement.dataset.java) === "failed", null);
  const runnableF = await t.page.locator(".box:not([data-kind=reference])").count();
  const toldF = await t.page.locator(".box:not([data-kind=reference]) p.nojava", { hasText: FATAL }).count();
  check(`${engine}: and every box that could run says so`, runnableF > 0 && toldF === runnableF, { runnableF, toldF });
  check(`${engine}: and the scratchpad's tab stays hidden, since its code did not load either`, await t.page.locator(".scratch-tab").isHidden(), null);
  await t.close();

  // A page whose Run code loads but throws while it evaluates (the planted error) says so the same way, and the error
  // still reaches the page's error reporting. Bounded as above.
  t = await open(engine, planted, PAGES[0]);
  await t.page.waitForFunction(() => document.documentElement.dataset.java, null, { timeout: 10000 }).catch(() => {});
  check(`${engine}: when the Run code throws while it loads, the page knows it`, await t.page.evaluate(() => document.documentElement.dataset.java) === "failed", null);
  const runnableP = await t.page.locator(".box:not([data-kind=reference])").count();
  const toldP = await t.page.locator(".box:not([data-kind=reference]) p.nojava", { hasText: FATAL }).count();
  check(`${engine}: and every box that could run says so, in the fatal words`, runnableP > 0 && toldP === runnableP, { runnableP, toldP });
  check(`${engine}: and the error reaches the page's error reporting`, t.errors.some((e) => e.includes(PLANTED)), t.errors);
  await t.close();

  // A page whose scratchpad code fails to load still runs its boxes (wire.js loads the scratchpad apart), and the
  // scratchpad's tab stays hidden. Bounded: a page whose boxes did not wire fails here instead of waiting on a button.
  t = await open(engine, noScratchpad, PAGES[0]);
  await ready(t);
  await t.page.waitForFunction(() => document.documentElement.dataset.scratchpad, null, { timeout: 10000 }).catch(() => {});
  const withoutScratchpad = { java: await t.page.evaluate(() => document.documentElement.dataset.java),
    scratchpad: await t.page.evaluate(() => document.documentElement.dataset.scratchpad), tab: await t.page.locator(".scratch-tab").isHidden() };
  if (withoutScratchpad.java === "ready") { await click(1, "Run"); await settled(1); withoutScratchpad.ran = await text(1); }
  check(`${engine}: a site without the scratchpad's code still runs a box, and keeps the scratchpad's tab hidden`,
    withoutScratchpad.java === "ready" && (withoutScratchpad.ran ?? "").includes("Hello, <world> & café 😀")
      && withoutScratchpad.scratchpad === "failed" && withoutScratchpad.tab, withoutScratchpad);
  // wire.js throws the failed import again on its own task, so it reaches the page's error reporting. Bounded: an
  // error that never comes fails the check.
  for (const end = Date.now() + 5000; !t.errors.some((e) => SCRATCHPAD_IMPORT_FAILED.test(e)) && Date.now() < end;) await t.page.waitForTimeout(100);
  check(`${engine}: and the scratchpad's failed load reaches the page's error reporting`,
    t.errors.some((e) => SCRATCHPAD_IMPORT_FAILED.test(e)), t.errors);
  await t.close();

  // The nomodule fallback in web/page.html (a copy of app.js's telling code, for a browser with no module scripts)
  // never runs in these browsers on its own: here it runs, from its own text, in the site without app.js.
  t = await open(engine, noApp, PAGES[0]);
  const toldBefore = await t.page.locator("p.nojava:visible").count();
  await t.page.evaluate(() => (0, eval)(document.querySelector("script[nomodule]").textContent));
  const runnableN = await t.page.locator(".box:not([data-kind=reference])").count();
  const toldN = await t.page.locator(".box:not([data-kind=reference]) p.nojava", { hasText: MINIMUMS }).count();
  const refs = await t.page.locator(".box[data-kind=reference]").count(), refsTold = await t.page.locator(".box[data-kind=reference] p.nojava").count();
  check(`${engine}: the nomodule fallback tells every box but a reference, with the minimum versions`,
    toldBefore === 0 && runnableN > 0 && toldN === runnableN && refs > 0 && refsTold === 0, { toldBefore, runnableN, toldN, refs, refsTold });
  check(`${engine}: and no box offers a button`, await t.page.locator(".box button").count() === 0, null);
  check(`${engine}: and the scratchpad's tab stays hidden`, await t.page.locator(".scratch-tab").isHidden(), null);
  await t.close();

  for (const p of PAGES) {
    t = await open(engine, site, p, { viewport: { width: 390, height: 844 } });
    await ready(t);
    const wide = await t.page.evaluate(() => document.documentElement.scrollWidth);
    check(`${engine}: ${p} at 390 px does not scroll sideways`, wide <= 390, wide);
    await t.close();
  }

  // On a phone the viewport meta decides the layout width, and a desktop context (above) ignores it: a page that
  // pinned width=390 was laid out 390 wide on a 360 px phone, where Chromium panned sideways and WebKit shrank the
  // whole page to fit (Ruling 35). So each page the build writes, on a phone 360 px and 390 px wide: nothing wider
  // than what the phone shows, and what it shows is the phone's own width, unshrunk. Firefox has no isMobile; its
  // desktop 390 px checks above stay.
  if (engine !== "firefox") {
    for (const width of [360, 390]) {
      for (const p of [...PAGES, "index.html", "vol-page/bundle.html"]) {
        t = await open(engine, site, p, { viewport: { width, height: 780 }, isMobile: true });
        if (PAGES.includes(p)) await ready(t);
        const m = await t.page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, visual: visualViewport.width }));
        check(`${engine}: ${p} on a ${width} px phone is laid out at that width and does not scroll sideways`, m.scrollWidth <= m.visual && m.visual === width, m);
        await t.close();
      }
    }
  }

  // ch02-check at 390 px with a verdict in every box (a list of cases, an output difference, a failed run's output,
  // a prediction and the program's output) and the case list: nothing scrolls sideways. .box hides its overflow, so
  // the page's width alone cannot see a box, a verdict or the case list running wide: each is measured too. An
  // inline element has no width of its own to measure.
  t = await open(engine, site, PAGES[1], { viewport: { width: 390, height: 844 } });
  await ready(t);
  await checkBox(1);
  await checkBox(2);
  await checkBox(3, 'void main() {\n    int n = Integer.parseInt(IO.readln("Number: "));\n    IO.println(n + n + 1);\n}\n');
  await cbox(4).locator("textarea.prediction").fill("5\nx5");
  await checkBox(4);
  const sideways = await t.page.evaluate(() => {
    const wide = [];
    if (document.documentElement.scrollWidth > 390) wide.push(`the page ${document.documentElement.scrollWidth}`);
    for (const el of document.querySelectorAll(".box, .box .verdict, .box .verdict *, .box .cases, .box .cases *")) {
      if (getComputedStyle(el).display === "inline") continue;
      if (el.scrollWidth > el.clientWidth) wide.push(`${el.tagName.toLowerCase()}.${el.className} ${el.scrollWidth} > ${el.clientWidth}`);
    }
    return { verdicts: document.querySelectorAll(".box .verdict[data-done=yes]").length, wide };
  });
  check(`${engine}: ${PAGES[1]} at 390 px with its verdicts shown scrolls sideways nowhere`,
    sideways.verdicts === 4 && sideways.wide.length === 0, sideways);
  // Check's verdict for code that does not compile shows javac's error as the Run does: unwrapped, scrolling.
  await checkBox(1, EVEN.replace("IO.println(isEven(4));", 'IO.println("a line longer than a phone is wide, so its caret needs room " + isEven(4))'));
  const verdictErr = await cbox(1).locator(".verdict pre.err").evaluate(LAYOUT);
  check(`${engine}: a compile error in a verdict at 390 px does not wrap, and scrolls inside its box`,
    verdictErr.textLines === 4 && verdictErr.visualLines === verdictErr.textLines && verdictErr.scrollW > verdictErr.clientW
      && verdictErr.page <= 390, verdictErr);
  await t.close();

  // A long code line stays one line, so the line numbers javac and a stack trace name are the lines the reader sees,
  // and it scrolls sideways inside its own box. The page-level check above cannot see this: .box hides its overflow,
  // so the page stays at 390 px even when the line wraps.
  t = await open(engine, site, PAGES[0], { viewport: { width: 390, height: 844 } });
  await ready(t);
  const code = await t.page.locator('[data-box="ch01-run#11"] textarea.code').evaluate((el) => {
    const s = getComputedStyle(el);
    const pad = parseFloat(s.paddingTop) + parseFloat(s.paddingBottom);
    return { scrollW: el.scrollWidth, clientW: el.clientWidth, sourceLines: el.value.split("\n").length,
      visualLines: Math.round((el.scrollHeight - pad) / parseFloat(s.lineHeight)), page: document.documentElement.scrollWidth };
  });
  check(`${engine}: a long code line scrolls sideways inside its textarea`, code.scrollW > code.clientW, code);
  check(`${engine}: and does not wrap: one visual line per source line`, code.visualLines === code.sourceLines, code);
  check(`${engine}: and the page itself still does not scroll sideways`, code.page <= 390, code);
  // A compile error on that line: its source line and caret stay one line each, so the caret sits under its
  // character; the error scrolls inside its box, and the page still does not scroll sideways.
  await box(11).locator("textarea.code").fill((await box(11).locator("textarea.code").inputValue()).replace('sideways.");', 'sideways.")'));
  await click(11, "Run"); await settled(11);
  const javac = await box(11).locator(".run .javac").evaluate(LAYOUT);
  check(`${engine}: a compile error on a long line does not wrap: one visual line per line of text, caret included`,
    javac.textLines === 4 && javac.visualLines === javac.textLines, javac);
  check(`${engine}: and it scrolls sideways inside its box, not the page`, javac.scrollW > javac.clientW && javac.page <= 390, javac);
  await t.close();

  // D85: the built site from a server that knows only .html, .css, .js, .json and .txt (no .mjs, which stock nginx lacks,
  // and no .wasm, which nginx 1.18 and older lack: both would be refused if the page needed them). Boxes run, a stack
  // trace is still deobfuscated, and the scratchpad starts.
  const plain = { server: { types: "plain" } };
  const boxText = async (page, n) => (await page.locator(`.box[data-box="ch01-run#${n}"] .run`).innerText()).replace(/\r/g, "");
  const runBox = async (page, n) => {
    await page.locator(`.box[data-box="ch01-run#${n}"]`).getByRole("button", { name: "Run", exact: true }).click();
    await page.waitForFunction((id) => {
      const st = document.querySelector(`.box[data-box="${id}"]`).dataset.state;
      return st === "done" || st === "waiting";
    }, `ch01-run#${n}`, { timeout: 30000 });
  };
  t = await open(engine, site, PAGES[0], {}, null, plain);
  await ready(t).catch(() => {}); // bounded: a page that never wires its boxes fails the check below
  const plainJava = await t.page.evaluate(() => document.documentElement.dataset.java);
  check(`${engine}: from a server that knows only the common types, the page can run Java`, plainJava === "ready", plainJava);
  if (plainJava === "ready") {
    await runBox(t.page, 1);
    check(`${engine}: from that server, a box prints Hello`, (await boxText(t.page, 1)).includes("Hello, <world> & café 😀"), await boxText(t.page, 1));
    await runBox(t.page, 2);
    const plainTrace = await boxText(t.page, 2);
    check(`${engine}: from that server, an uncaught exception still reads as the JDK prints it`,
      plainTrace.includes('Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3'), plainTrace);
    // The box shows the course's stated output, not the JDK's trace, so the trace is read where the runner reports it: a
    // BrowserRunner the page's own script makes (the built site's runner/browser-runner.js), on each server.
    const trace = async (page) => page.evaluate(async () => {
      const { BrowserRunner } = await import(new URL("../runner/browser-runner.js", location.href).href);
      const runner = new BrowserRunner(new URL("../", location.href));
      try { return (await runner.compileAndRun("void main() { int[] a = new int[3];\n  IO.println(a[3]); }")).stderr; } finally { runner.close(); }
    });
    const plainStderr = await trace(t.page);
    const normal = await open(engine, site, PAGES[0]);
    await ready(normal);
    const normalStderr = await trace(normal.page);
    await normal.close();
    // WebKit names a WebAssembly frame without a code offset and prints the first line only (web/test/runner.mjs, D42).
    check(`${engine}: from that server, a stack trace is the deobfuscated one the normal server gives${engine === "webkit" ? " (first line only, D42)" : ""}`,
      plainStderr === normalStderr && plainStderr.startsWith('Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3\n')
        && (engine === "webkit" || plainStderr.includes("\tat Main.main(Main.java:2)")), { plainStderr, normalStderr });
  }
  check(`${engine}: no page error from that server`, t.errors.length === 0, t.errors);
  await t.close();
  if (engine === "chromium") {
    t = await open(engine, site, PAGES[0], {}, null, plain);
    await ready(t).catch(() => {});
    await t.page.locator(".scratch-tab").click({ timeout: 5000 }).catch(() => {});
    const upMs = 250000; // the client's own boot deadline is 240 s
    const up = await t.page.waitForFunction(() => document.getElementById("scratchpad").dataset.state === "ready", null, { timeout: upMs }).then(() => true, () => false);
    check(`${engine}: from that server, the scratchpad opens to ready`, up, await t.page.evaluate(() => document.getElementById("scratchpad").dataset.state));
    await t.close();
  }
}
done();
