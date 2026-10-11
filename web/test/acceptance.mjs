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
// The acceptance: every page of a chapter of the real course, as a reader uses it, in Chromium, WebKit and Firefox at
// 390 px, through the page's own controls and nothing else (no call into the page's code). It builds the volume as the
// course is built (harness buildSite), then on each of the chapter's pages, the chapter and its practice page:
// - Check, three ways (DESIGN section 3): each worked solution in _solutions.md, typed into its box, must pass and each
//   mistake must fail; a box whose check has a starter is held to two answers more, as build/Proofs.java holds it, with
//   the same labels: its own fence in the page's Markdown, the author's answer, must pass ("the box's own fence"), and
//   the code it publishes must fail ("the published code"), which ties the check to the box it lands on (C1). A predict
//   box takes its stated output and each right prediction (at least one besides it), which must pass, and each wrong
//   prediction, which must fail. A box with noCheck says so in its own words and offers no Check.
// - Each box is of the kind the build published for it in boxes.json, so none is left unrun by being shown as another.
// - Show a solution: a box with a worked solution offers it, shut as the page loads, and no other box does; opening
//   it shows that box's own first worked solution, and every other box's stays shut.
// - On a fresh load, Run on every box that runs, each question answered in place with the box's declared stdin, as a
//   reader types it: the box must show its stated output; a raises box ends in its exception's line (in WebKit with no
//   "at" lines under it, D42); a compileError box shows javac's error; every other box, a varies box or a starter
//   included, runs to its end with no status line, no compile error and no exception it does not declare.
// - Nothing scrolls sideways at 390 px, no request leaves the page's origin, and no page error happens.
// It saves a screenshot of each page and of each box, and what it saw (results.json), under
// build/.work/acceptance/<chNN>/<engine>/ (build/.work/acceptance-<slug>/... for another volume), and prints how long
// each page took. It never opens the scratchpad (web/test/scratchpad.mjs holds that, D115), and it runs after the
// build's own gates (Build.java --check), which it does not repeat.
//   node web/test/acceptance.mjs [--volume <dir>] <chNN|all> [chromium|webkit|firefox]
// The course is volumes/vol1; while no volume exists it says "no volumes" and passes, as Build.java --check does. Its
// fixture, web/test/vol-accept, holds a box of every kind it drives.
import fs from "node:fs";
import path from "node:path";
import { REPO, ENGINES, check, done, buildSite, open } from "./harness.mjs";
import { tidy, statedStderr } from "../page/transcript.js";
import { FATAL } from "../page/support.js";

const USAGE = "usage: node web/test/acceptance.mjs [--volume <dir>] <chNN|all> [chromium|webkit|firefox]";
const COURSE = path.join(REPO, "volumes/vol1");
// What a box shows when its run went wrong in a way no stated output allows (web/page/box.js's STATUS): the fatal
// error, a run worker that died, and a replay that printed something else the second time. A compileError box must show
// none of them; every other box must show no status line at all (runBox).
const BROKEN = [FATAL, "The program stopped unexpectedly.", "This program printed something different when it ran again"];
// WebKit prints an uncaught exception's first line only (D42, web/test/runner.mjs's NO_FRAMES): there a stated output
// is compared without the program's own frames, the "at" lines a terminal shows under that line.
const NO_FRAMES = ["webkit"];
const OWN_FRAME = /^\tat [^()]*\(Main\.java:\d+\)$/; // a frame of the program's own, as transcript.js and Audit.java keep it
// Where a program that fills memory takes the whole page down: Chromium (D41), and on Linux WebKit and Firefox too
// (D113), as web/test/page.mjs's CRASHES_THE_PAGE records it. A box declared to raise OutOfMemoryError is not run
// there; the skip is printed and kept in results.json, never passed in silence.
const LOSES_THE_PAGE = ["chromium", ...(process.platform === "linux" ? ["webkit", "firefox"] : [])];
// A verdict that says the answer is right (web/page/box.js): a method or input check's count, an output or predict
// check's "Correct.".
const PASSED = /^(Passed all \d+ (cases|runs)\.|Correct\.)$/;
// The reveal (build/Pages.java's appendBox): a box with a worked solution has, as a direct child, a native
// <details class="solution"> whose summary says these words and whose <pre> holds the first worked solution.
const SHOW = "Show a solution";
const SOLUTION = (id) => `.box[data-box="${id}"] > details.solution`;
// What each box offers as the page loads: its direct details.solution children, the summary's words, and whether any is
// open. Runs in the page.
const REVEALS_AT_LOAD = () => Object.fromEntries([...document.querySelectorAll(".box")].map((b) => {
  const d = [...b.children].filter((c) => c.matches("details.solution"));
  return [b.dataset.box, { count: d.length, summary: d[0]?.querySelector(":scope > summary")?.textContent ?? null, open: d.some((x) => x.open) }];
}));
// Bounds on a wait, so a box that never settles fails instead of hanging; the page's own limit is 5 s a run.
const RUN_MS = 30_000, CHECK_MS = 60_000;
// A phone's 390 px (Firefox has no isMobile: a desktop window 390 px wide), as web/test/scratchpad.mjs opens it.
const PHONE = (engine) => ({ viewport: { width: 390, height: 844 }, ...(engine === "firefox" ? {} : { isMobile: true }) });

const args = process.argv.slice(2);
let volumeDir = COURSE;
if (args[0] === "--volume") {
  if (!args[1]) { console.log(USAGE); process.exit(2); }
  volumeDir = path.resolve(REPO, args[1]);
  args.splice(0, 2);
}
const [which, only] = args;
if (args.length < 1 || args.length > 2 || !/^(ch\d+|all)$/.test(which) || (only && !Object.hasOwn(ENGINES, only))) {
  console.log(USAGE);
  process.exit(2);
}
if (!fs.existsSync(path.join(volumeDir, "volume.json"))) {
  const volumes = path.join(REPO, "volumes");
  const any = fs.readdirSync(volumes).some((d) => fs.existsSync(path.join(volumes, d, "volume.json")));
  // As Build.java --check: with no volume at all there is nothing to accept, which is no failure. Once a volume
  // exists, a course that is missing is one.
  if (volumeDir === COURSE && !any) { console.log("no volumes"); process.exit(0); }
  console.log(`no volume at ${path.relative(REPO, volumeDir)} (no volume.json)`);
  process.exit(2);
}
const slug = path.basename(volumeDir);
const mdIn = (d) => (fs.existsSync(d) ? fs.readdirSync(d).filter((f) => f.endsWith(".md")).sort() : []);
const pageFiles = [...mdIn(path.join(volumeDir, "content")), ...mdIn(path.join(volumeDir, "practice"))];
const pageFile = (f) => path.join(volumeDir, fs.existsSync(path.join(volumeDir, "content", f)) ? "content" : "practice", f);
const chapters = [...new Set(pageFiles.map((f) => /^(ch\d+)-/.exec(f)?.[1]).filter(Boolean))].sort();
if (!chapters.length) { console.log(`${path.relative(REPO, volumeDir)} has no chapter: nothing was accepted`); process.exit(1); }
if (which !== "all" && !chapters.includes(which)) {
  console.log(`no chapter ${which} in ${path.relative(REPO, volumeDir)}; it has ${chapters.join(", ")}`);
  process.exit(2);
}
// The chapter's page, then its practice page: the slugs the build publishes them under.
const pagesOf = (ch) => pageFiles.filter((f) => f.startsWith(`${ch}-`)).map((f) => f.slice(0, -3));
const json = (f) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : {});
const DECL = json(path.join(volumeDir, "content/_boxes.json"));
const CHECKS = json(path.join(volumeDir, "content/_checks.json"));
const SOLUTIONS = readSolutions(path.join(volumeDir, "content/_solutions.md"));
const NONE = { rightJava: [], rightText: [], mistakeJava: [], mistakeText: [] };
// Each box's own fence, the code the author wrote in the page's Markdown, by box id (for a starter box, what Proofs calls
// the box's own fence).
const FENCES = new Map(pageFiles.flatMap((f) => javaFences(pageFile(f)).map((body, i) => [`${f.slice(0, -3)}#${i + 1}`, body])));
// The two answers that tie a starter box's check to its box, labeled as build/Proofs.java's FENCE and PUBLISHED.
const FENCE = "the box's own fence", PUBLISHED = "the published code";
const site = path.join(buildSite(volumeDir, `acceptance-site-${slug}`), "site");
const BOXES = JSON.parse(fs.readFileSync(path.join(site, "boxes.json"), "utf8"));
const OUT = path.join(REPO, "build/.work", slug === "vol1" ? "acceptance" : `acceptance-${slug}`);

const boxOf = (t, id) => t.page.locator(`.box[data-box="${id}"]`);
// The kind a box's boxes.json entry implies, as build/Pages.java names it (appendBox, kindOf): a predict check makes a
// predict box; else reference, raises, compileError and stdin, in that order; else a box that runs.
const publishedKind = (e) => e.check?.kind === "predict" ? "predict" : e.reference ? "reference" : e.raises ? "raises"
  : e.compileError ? "compile-error" : e.stdin.length ? "input" : "run";
const stateOf = (t, id) => t.page.evaluate((id) => document.querySelector(`.box[data-box="${id}"]`).dataset.state, id);
const settled = (t, id) => t.page.waitForFunction((id) =>
  ["done", "waiting"].includes(document.querySelector(`.box[data-box="${id}"]`).dataset.state), id, { timeout: RUN_MS });
const ready = (t) => t.page.waitForFunction(() => document.documentElement.dataset.java, null, { timeout: RUN_MS });
const withoutFrames = (s) => s.split("\n").filter((l) => !OWN_FRAME.test(l)).join("\n");

// What a box's .run shows, taken apart as web/page/box.js puts it together: the program's output with the answers
// typed in place (text nodes and span.typed), its stderr (span.err), javac's error (span.javac) and the box's status
// lines (p.status). Runs in the page.
const READ_RUN = (run) => {
  const r = { out: "", err: "", javac: "", status: [] };
  for (const n of run.childNodes) {
    if (n.nodeType === Node.TEXT_NODE || n.matches("span.typed")) r.out += n.textContent;
    else if (n.matches("span.javac")) r.javac += n.textContent;
    else if (n.matches("span.err")) r.err += n.textContent;
    else if (n.matches("p.status")) r.status.push(n.textContent);
  }
  return r;
};
// What runs wider than a phone at 390 px: the page, a box (which hides its overflow, so the page's own width cannot
// see it), or a verdict's or a case list's own text. Code, outputs and javac's errors scroll inside their own box on
// purpose (web/test/page.mjs), so a pre or textarea, and anything inline, is not measured. A desktop Firefox window
// has no phone viewport to compare (no isMobile). Runs in the page.
const OVERFLOW = (firefox) => {
  const wide = [];
  if (document.documentElement.scrollWidth > 390) wide.push(`the page ${document.documentElement.scrollWidth}`);
  if (!firefox && visualViewport.width !== 390) wide.push(`laid out ${visualViewport.width} wide`);
  for (const el of document.querySelectorAll(".box, .box .verdict, .box .verdict *, .box .cases, .box .cases *")) {
    if (el.closest("pre, textarea") || getComputedStyle(el).display === "inline") continue;
    if (el.scrollWidth > el.clientWidth)
      wide.push(`${el.closest(".box").dataset.box}: ${el.tagName.toLowerCase()}.${el.className} ${el.scrollWidth} > ${el.clientWidth}`);
  }
  return wide;
};

// A page's java fences in order, read as build/Markdown.java reads a fence (a line of three backticks and a language opens
// it, a line of three backticks closes it, and its body is each line followed by "\n"): the nth is box <page>#n's code.
function javaFences(file) {
  const lines = fs.readFileSync(file, "utf8").replace(/\r\n?/g, "\n").split("\n"), fences = [];
  for (let i = 0; i < lines.length; i++) {
    const fence = /^```([^`]*)$/.exec(lines[i]);
    if (!fence) continue;
    let body = "";
    for (i++; i < lines.length && lines[i] !== "```"; i++) body += lines[i] + "\n";
    if (fence[1].trim() === "java") fences.push(body);
  }
  return fences;
}

// _solutions.md as Plan 5 extends it, read as build/Markdown.java reads fences and headings: under "## <box id>", the
// java fences before any level-3 heading are worked solutions (the first is the one a reader may reveal) and the text
// fences there are further right predictions; under "### mistake", java fences are mistakes and text fences wrong
// predictions. A fence opens on a line of three backticks and a language and closes on a line of three backticks; its
// body is each line followed by "\n".
function readSolutions(file) {
  const sections = new Map();
  if (!fs.existsSync(file)) return sections;
  const lines = fs.readFileSync(file, "utf8").replace(/\r\n?/g, "\n").split("\n");
  let id = null, part = null;
  for (let i = 0; i < lines.length; i++) {
    const fence = /^```([^`]*)$/.exec(lines[i]);
    if (fence) {
      let body = "";
      for (i++; i < lines.length && lines[i] !== "```"; i++) body += lines[i] + "\n";
      const lang = fence[1].trim(), s = id == null ? null : sections.get(id);
      if (s && part && (lang === "java" || lang === "text")) s[part + (lang === "java" ? "Java" : "Text")].push(body);
      continue;
    }
    const h = /^(#{1,3}) (.*)$/.exec(lines[i]);
    if (!h) continue;
    if (h[1].length === 2) {
      id = h[2].trim();
      part = "right";
      if (!sections.has(id)) sections.set(id, { rightJava: [], rightText: [], mistakeJava: [], mistakeText: [] });
    } else if (h[1].length === 3) part = h[2].trim() === "mistake" ? "mistake" : null;
    else id = part = null;
  }
  return sections;
}

// Check, three ways, through the box's own field and button; then the box is put back as it was built.
async function prove(t, e, r, expect, wide, engine) {
  const box = boxOf(t, e.id), s = SOLUTIONS.get(e.id) ?? NONE, predict = r.kind === "predict";
  // A starter box's two more answers (build/Proofs.java): they count toward neither the two right answers nor the mistake.
  const tie = !predict && r.starter;
  const answers = predict
    ? [{ label: "the stated output", answer: JSON.parse(await box.getAttribute("data-check")).expected, want: "pass" },
      ...s.rightText.map((a, i) => ({ label: `right prediction ${i + 2}`, answer: a, want: "pass" })),
      ...s.mistakeText.map((a, i) => ({ label: `wrong prediction ${i + 1}`, answer: a, want: "fail" }))]
    : [...s.rightJava.map((a, i) => ({ label: `worked solution ${i + 1}`, answer: a, want: "pass" })),
      ...(tie ? [{ label: FENCE, answer: FENCES.get(e.id), want: "pass" }] : []),
      ...s.mistakeJava.map((a, i) => ({ label: `mistake ${i + 1}`, answer: a, want: "fail" })),
      ...(tie ? [{ label: PUBLISHED, answer: e.source, want: "fail" }] : [])];
  const own = answers.filter((a) => a.label !== FENCE && a.label !== PUBLISHED);
  const rights = own.filter((a) => a.want === "pass").length, wrongs = own.length - rights;
  const enough = predict ? "a right prediction besides its stated output, and a wrong one,"
    : "two worked solutions and a mistake";
  expect(`${e.id}: its ${e.check.kind} check has ${enough} to prove it with`, rights >= 2 && wrongs >= 1,
    { rights, wrongs });
  const field = box.locator(predict ? "textarea.prediction" : "textarea.code");
  for (const a of answers) {
    await field.fill(a.answer);
    const t0 = Date.now();
    await box.getByRole("button", { name: "Check", exact: true }).click();
    await t.page.waitForFunction((id) => document.querySelector(`.box[data-box="${id}"] .verdict`)?.dataset.done === "yes",
      e.id, { timeout: CHECK_MS });
    a.ms = Date.now() - t0;
    a.summary = (await box.locator(".verdict p.summary").innerText()).replace(/\r/g, "").trim();
    a.ok = a.summary !== FATAL && PASSED.test(a.summary) === (a.want === "pass");
    expect(`${e.id}: ${a.label} ${a.want === "pass" ? "passes" : "fails"} its Check`, a.ok, { summary: a.summary, answer: a.answer });
    r.proof.push(a);
    wide.push(...await t.page.evaluate(OVERFLOW, engine === "firefox"));
  }
  if (predict) await field.fill("");
  else {
    const reset = box.getByRole("button", { name: "Reset", exact: true });
    if (await reset.isVisible()) await reset.click();
  }
}

// What each box offers to reveal as the page loads (acceptPage checks it before anything is pressed): a box with a
// worked solution offers one Show a solution, shut; every other box offers none.
function revealsAtLoad(entries, atLoad, expect) {
  for (const e of entries) {
    const a = atLoad[e.id] ?? { count: 0, summary: null, open: false };
    if (SOLUTIONS.get(e.id)?.rightJava[0] === undefined) expect(`${e.id}: has no worked solution, and offers none`, a.count === 0, a);
    else expect(`${e.id}: offers its worked solution behind "${SHOW}", shut as the page loads`,
      a.count === 1 && a.summary === SHOW && !a.open, a);
  }
}

// Show a solution, pressed as a reader presses it: its summary opens that box's own details, whose pre is the box's
// first worked solution, and every other box's stays shut. Then it is shut again by its summary, so the next box starts
// from the page as it loaded.
async function reveal(t, e, r, expect, wide, engine) {
  const first = SOLUTIONS.get(e.id)?.rightJava[0];
  if (first === undefined || await t.page.locator(SOLUTION(e.id)).count() !== 1) return; // revealsAtLoad judged it
  await t.page.locator(`${SOLUTION(e.id)} > summary`).click();
  await t.page.waitForTimeout(300); // an absence: time for a page script answering the toggle to open another box's
  const seen = await t.page.locator(SOLUTION(e.id)).evaluate((d) => ({ open: d.open,
    text: d.querySelector(":scope > pre")?.textContent ?? null,
    others: [...document.querySelectorAll(".box > details.solution")].filter((x) => x !== d && x.open).map((x) => x.parentElement.dataset.box) }));
  seen.visible = await t.page.locator(`${SOLUTION(e.id)} > pre`).isVisible();
  const ok = seen.open && seen.visible && seen.text != null && tidy(seen.text) === tidy(first) && seen.others.length === 0;
  r.reveal = { solution: first, ok };
  expect(`${e.id}: "${SHOW}" opens that box's own first worked solution, and every other box's stays shut`, ok, seen);
  wide.push(...await t.page.evaluate(OVERFLOW, engine === "firefox"));
  if (seen.open) await t.page.locator(`${SOLUTION(e.id)} > summary`).click();
}

// Run, as a reader runs the box: each question answered in place with the next declared answer, and End input past
// the last one, as the build's stdin ends there (web/test/replay.mjs).
async function runBox(t, e, r, expect, engine) {
  const box = boxOf(t, e.id);
  if (e.raises === "java.lang.OutOfMemoryError" && LOSES_THE_PAGE.includes(engine)) {
    r.skipped = `not run: in ${engine} on ${process.platform} a program that fills memory takes the page down (D41, D113)`;
    console.log(`  skip  ${engine}: ${e.id}: ${r.skipped}`);
    return;
  }
  const t0 = Date.now();
  await box.getByRole("button", { name: "Run", exact: true }).click();
  await settled(t, e.id);
  const typed = [...e.stdin];
  for (let i = 0; i <= e.stdin.length && await stateOf(t, e.id) === "waiting"; i++) {
    if (typed.length) {
      await box.locator("input.answer").fill(typed.shift());
      await box.locator("input.answer").press("Enter");
    } else await box.getByRole("button", { name: "End input", exact: true }).click();
    await settled(t, e.id);
  }
  const ms = Date.now() - t0;
  const got = await box.locator(".run").evaluate(READ_RUN);
  const waiting = await stateOf(t, e.id) === "waiting";
  // What the box showed, javac's error included: a box meant to run that did not compile shows that alone.
  const shown = r.kind === "compile-error" ? got.javac : got.javac + got.out + statedStderr(got.err);
  r.run = { shown, status: got.status, ms, ok: false };
  let ok = !waiting && typed.length === 0 && !got.status.some((s) => BROKEN.some((b) => s.startsWith(b))), label;
  if (r.kind === "compile-error") {
    const first = got.javac.split("\n")[0];
    ok = ok && /^Main\.java:\d+: error: /.test(first) && first.includes(e.compileError);
    label = `Run shows javac's error: ${e.compileError}`;
  } else {
    // Every other box runs to its end: no status line (a timeout, the output limit, a crash, a replay that diverged),
    // no compile error, and no uncaught exception but the one a raises box declares. A varies box and a starter, whose
    // output is compared with nothing, are held to this alone.
    ok = ok && got.status.length === 0 && got.javac === "";
    const line = got.err.split("\n")[0], thrown = `Exception in thread "main" ${e.raises}`;
    if (e.raises) ok = ok && (line === thrown || line.startsWith(`${thrown}: `));
    else ok = ok && !/^Exception in thread/m.test(got.err);
    if (e.expected != null && !e.varies) {
      const want = NO_FRAMES.includes(engine) ? withoutFrames(e.expected) : e.expected;
      r.run.want = want;
      ok = ok && tidy(shown) === tidy(want);
      label = `Run shows its stated output${e.stdin.length ? `, its ${e.stdin.length} answer(s) typed in place` : ""}` +
        (e.raises ? `, ending in ${e.raises}${NO_FRAMES.includes(engine) ? " without its at lines (D42)" : ""}` : "");
    } else label = e.varies ? "Run runs to its end (varies: its output is compared with nothing)"
      : `Run runs${r.starter ? " its starter" : ""}, and the box shows nothing broken`;
  }
  r.run.ok = ok;
  expect(`${e.id}: ${label}`, ok, { shown, status: got.status, waiting, unused: typed });
}

async function acceptPage(engine, pageSlug, dir, report) {
  const expect = (label, ok, got) => {
    report.checks++;
    if (!check(`${engine}: ${pageSlug}: ${label}`, ok, got)) report.failed++;
    return ok;
  };
  const t0 = Date.now();
  const entries = BOXES.filter((b) => b.page === pageSlug);
  const result = { page: pageSlug, seconds: null, shot: `${pageSlug}.png`, boxes: [] };
  const wide = [];
  const t = await open(engine, site, `${slug}/${pageSlug}.html`, PHONE(engine));
  try {
    await ready(t);
    expect("the page can run Java", await t.page.evaluate(() => document.documentElement.dataset.java) === "ready", null);
    const onPage = await t.page.locator(".box").count();
    expect(`it shows the ${entries.length} boxes the build published, and each is driven below`,
      entries.length > 0 && onPage === entries.length, { onPage, published: entries.length });
    revealsAtLoad(entries, await t.page.evaluate(REVEALS_AT_LOAD), expect);
    for (const e of entries) {
      const r = { id: e.id, kind: null, check: e.check?.kind ?? null, noCheck: DECL[e.id]?.noCheck ?? null, varies: e.varies,
        starter: CHECKS[e.id]?.starter != null, proof: [], reveal: null, run: null, skipped: null, shot: null };
      result.boxes.push(r);
      try {
        r.kind = await boxOf(t, e.id).getAttribute("data-kind");
        const published = publishedKind(e);
        expect(`${e.id}: the page shows it as the ${published} box the build published`, r.kind === published,
          { page: r.kind, published });
        const checkButtons = () => boxOf(t, e.id).getByRole("button", { name: "Check", exact: true }).count();
        if (e.check) await prove(t, e, r, expect, wide, engine);
        else if (r.noCheck != null) {
          const text = await boxOf(t, e.id).innerText();
          expect(`${e.id}: says why it has no Check, in its noCheck words, and offers no Check`,
            text.includes(r.noCheck) && await checkButtons() === 0, text.slice(0, 300));
        } else if (r.kind !== "reference") expect(`${e.id}: has no check, and offers no Check`, await checkButtons() === 0, null);
        await reveal(t, e, r, expect, wide, engine);
      } catch (err) { expect(`${e.id}: could be checked to the end`, false, String(err).slice(0, 300)); }
    }
    // A fresh load, as a reader comes to the page: every box runs, and stays run for the screenshots.
    await t.page.reload();
    await ready(t);
    for (const r of result.boxes) {
      const e = entries.find((x) => x.id === r.id);
      try {
        if (r.kind !== "reference" && r.kind !== "predict") await runBox(t, e, r, expect, engine);
        r.shot = `boxes/${pageSlug}-${r.id.slice(r.id.indexOf("#") + 1)}.png`;
        await boxOf(t, r.id).screenshot({ path: path.join(dir, r.shot) });
      } catch (err) { expect(`${r.id}: could be run to the end`, false, String(err).slice(0, 300)); }
    }
    wide.push(...await t.page.evaluate(OVERFLOW, engine === "firefox"));
    await t.page.screenshot({ path: path.join(dir, result.shot), fullPage: true });
  } catch (err) { expect("the page could be driven to the end", false, String(err).slice(0, 300)); }
  expect("nothing scrolls sideways at 390 px, with every verdict, revealed solution and output shown", wide.length === 0, [...new Set(wide)]);
  expect("no request left the page's origin", t.offsite.length === 0, t.offsite);
  expect("no page error", t.errors.length === 0, t.errors);
  await t.close();
  result.seconds = Math.round((Date.now() - t0) / 1000);
  console.log(`  ${engine}: ${pageSlug} took ${result.seconds} s`);
  return result;
}

// The fixture holds a box of every kind this test drives; a fixture that lost one fails here rather than passing
// having driven less (as web/test/replay.mjs holds its fixture's input boxes).
function covered(engine, report) {
  const seen = new Set();
  for (const b of report.pages.flatMap((p) => p.boxes)) {
    seen.add(b.kind);
    if (b.check) seen.add(`check:${b.check}`);
    if (b.varies) seen.add("varies");
    if (b.noCheck != null) seen.add("noCheck");
    if (b.starter) seen.add("starter");
    if (b.reveal) seen.add("reveal");
    for (const a of b.proof) if (a.label === FENCE || a.label === PUBLISHED) seen.add(a.label);
  }
  const want = ["run", "input", "raises", "compile-error", "predict", "reference", "varies", "check:method", "check:output",
    "check:input", "check:predict", "noCheck", "starter", "reveal", FENCE, PUBLISHED];
  const missing = want.filter((k) => !seen.has(k));
  report.checks++;
  if (!check(`${engine}: the fixture drove a box of every kind (${want.join(", ")})`, missing.length === 0, missing)) report.failed++;
}

for (const engine of only ? [only] : Object.keys(ENGINES)) {
  console.log(engine);
  for (const ch of which === "all" ? chapters : [which]) {
    const dir = path.join(OUT, ch, engine);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(path.join(dir, "boxes"), { recursive: true });
    const report = { volume: slug, chapter: ch, engine, platform: process.platform, seconds: null, checks: 0, failed: 0, pages: [] };
    const t0 = Date.now();
    for (const p of pagesOf(ch)) report.pages.push(await acceptPage(engine, p, dir, report));
    if (slug === "vol-accept") covered(engine, report);
    report.seconds = Math.round((Date.now() - t0) / 1000);
    fs.writeFileSync(path.join(dir, "results.json"), JSON.stringify(report, null, 1) + "\n");
    console.log(`  ${engine}: ${ch}: ${report.checks} check(s), ${report.failed} failed, ${report.seconds} s`);
  }
}
done();
