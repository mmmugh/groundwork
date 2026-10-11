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
// web/review.mjs on the acceptance fixture: the review copy of its chapter 1 joins both its pages, carries every file the
// page loads and nothing else (no scratchpad, nothing private, nothing over an Artifact's limits), names only paths
// beside it, and, served from its own folder as an Artifact serves a page and its files, runs a box and checks one.
//   node web/test/review.mjs
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { REPO, check, done, open } from "./harness.mjs";

const p = spawnSync(process.execPath, ["web/review.mjs", "--volume", "web/test/vol-accept", "ch01"], { cwd: REPO, encoding: "utf8" });
check("node web/review.mjs --volume web/test/vol-accept ch01 exits 0 and says what it wrote",
  p.status === 0 && p.stdout.startsWith("review: build/.work/review/vol-accept-ch01/index.html and "),
  { status: p.status, out: (p.stdout + p.stderr).slice(-600) });
if (p.status !== 0) done();
const out = path.join(REPO, "build/.work/review/vol-accept-ch01");
const site = path.join(REPO, "build/.work/review-site-vol-accept/site");
const plan = JSON.parse(fs.readFileSync(path.join(out, "files.json"), "utf8"));
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((x) => (x.isDirectory() ? walk(path.join(d, x.name)) : [path.join(d, x.name)]));
const rel = (root, f) => path.relative(root, f).split(path.sep).join("/");
const want = ["app.css", "app.js", ...["page", "runner", "runtime"].flatMap((d) => walk(path.join(site, d)).map((f) => rel(site, f)))].sort();
const keys = Object.keys(plan.files).sort();
check("files.json maps exactly app.css, app.js and every file under the built site's page/, runner/ and runtime/",
  JSON.stringify(keys) === JSON.stringify(want) && want.includes("runtime/compiler.wasm"),
  { missing: want.filter((k) => !keys.includes(k)), extra: keys.filter((k) => !want.includes(k)) });
check("each is the built site's own file, byte for byte",
  keys.every((k) => fs.readFileSync(plan.files[k].from).equals(fs.readFileSync(path.join(site, k)))), null);
check("nothing of the scratchpad and nothing private is in it",
  !keys.some((k) => /^scratchpad\/|_solutions|_boxes|_checks|answer-keys/.test(k)) && !fs.existsSync(path.join(out, "scratchpad")), keys);
const sizes = keys.map((k) => [k, fs.statSync(plan.files[k].from).size, plan.files[k].contentType]);
check("every file is within an Artifact's limits (15 MB a binary file, 16 MB a text file and the page), with a media type, " +
  "and none is application/octet-stream, which the Artifact tool refused to publish in the spike",
  sizes.every(([, s, t]) => t && t !== "application/octet-stream" && s <= (t.startsWith("text/") ? 16e6 : 15e6))
    && fs.statSync(plan.file_path).size <= 16e6,
  sizes.filter(([, s, t]) => !t || t === "application/octet-stream" || s > 15e6));
const html = fs.readFileSync(plan.file_path, "utf8");
const published = JSON.parse(fs.readFileSync(path.join(site, "boxes.json"), "utf8")).filter((b) => /^ch01-/.test(b.page)).map((b) => b.id);
const ids = [...html.matchAll(/ data-box="([^"]+)"/g)].map((m) => m[1]);
check(`the page holds both pages' ${published.length} boxes, chapter then practice, in order`,
  JSON.stringify(ids) === JSON.stringify(published) && ids.some((id) => id.startsWith("ch01-first-steps-practice#")), { ids, published });
check("every path in the page is beside it: no ../ and no other site's address in a src or href",
  !html.includes('"../') && !/(src|href)="(https?:)?\/\//.test(html), html.match(/(src|href)="[^"]*"/g));
check("the scratchpad's tab is hidden, and a note says the scratchpad is on the live site",
  html.includes("<style>.scratch-tab { display: none !important; }</style>") && html.includes("The scratchpad is not here"), null);

// Served from its own folder, as an Artifact serves its page and files: a box runs, and a box on the joined practice
// page checks.
const t = await open("chromium", out, "index.html", { viewport: { width: 390, height: 844 }, isMobile: true });
const box = (id) => t.page.locator(`.box[data-box="${id}"]`);
const until = (fn, arg) => t.page.waitForFunction(fn, arg, { timeout: 30000 }).catch(() => {});
await until(() => document.documentElement.dataset.java);
await box("ch01-first-steps#1").getByRole("button", { name: "Run", exact: true }).click({ timeout: 10000 }).catch(() => {});
await until((id) => document.querySelector(`.box[data-box="${id}"]`).dataset.state === "done", "ch01-first-steps#1");
const ran = await box("ch01-first-steps#1").locator(".run").innerText().catch(() => "");
check("Run works in the copy: the first box prints Hello, world!", ran.includes("Hello, world!"), ran);
const step = box("ch01-first-steps-practice#1");
// The step's first worked solution, as its own reveal holds it (shut, so read as text, not as seen).
const worked = await t.page.locator('.box[data-box="ch01-first-steps-practice#1"] > details.solution > pre').textContent({ timeout: 10000 }).catch(() => "");
await step.locator("textarea.code").fill(worked ?? "", { timeout: 10000 }).catch(() => {});
await step.getByRole("button", { name: "Check", exact: true }).click({ timeout: 10000 }).catch(() => {});
await until((id) => document.querySelector(`.box[data-box="${id}"] .verdict`)?.dataset.done === "yes", "ch01-first-steps-practice#1");
const verdict = await step.locator(".verdict p.summary").innerText().catch(() => "");
check("Check works in the copy, on the practice page's box: its worked solution passes", verdict === "Passed all 2 cases.", verdict);
check("the scratchpad's tab is not shown", !(await t.page.locator(".scratch-tab").isVisible()), null);
check("no request left the copy's folder, and no page error", t.offsite.length === 0 && t.errors.length === 0,
  { offsite: t.offsite, errors: t.errors });
await t.close();
done();
