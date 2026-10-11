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
// The author's review copy of one chapter (DESIGN section 6, D119), for a private claude.ai Artifact: the chapter's page
// and its practice page as built, joined into one page whose boxes run, check and reveal as on the site, with each file
// that page loads beside it at the same relative path: the page's scripts, the runner, and the boxes' runtime with its
// notices. The scratchpad stays behind: its jdk.zip (22 MB) is more than an Artifact takes in one file (15 MB), so its
// tab is hidden and a note says where it is. It refuses to write a file over an Artifact's limits.
// Writes build/.work/review/<chNN>/ (build/.work/review/<slug>-<chNN>/ for another volume): index.html, the files beside
// it, and files.json, which holds what the Artifact tool's publish takes: file_path and the files map, with absolute
// paths and each file's media type.
//   node web/review.mjs [--volume <dir>] <chNN>
import fs from "node:fs";
import path from "node:path";
import { REPO, buildSite } from "./test/harness.mjs";

const USAGE = "usage: node web/review.mjs [--volume <dir>] <chNN>";
const args = process.argv.slice(2);
let volumeDir = path.join(REPO, "volumes/vol1");
if (args[0] === "--volume") {
  if (!args[1]) { console.log(USAGE); process.exit(2); }
  volumeDir = path.resolve(REPO, args[1]);
  args.splice(0, 2);
}
const [ch] = args;
if (args.length !== 1 || !/^ch\d+$/.test(ch)) { console.log(USAGE); process.exit(2); }
const slug = path.basename(volumeDir);
const pages = ["content", "practice"].flatMap((d) => {
  const dir = path.join(volumeDir, d);
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.startsWith(`${ch}-`) && f.endsWith(".md")).sort().map((f) => f.slice(0, -3)) : [];
});
if (!pages.length) { console.log(`no chapter ${ch} in ${path.relative(REPO, volumeDir)}`); process.exit(2); }

const site = path.join(buildSite(volumeDir, `review-site-${slug}`), "site");
const out = path.join(REPO, "build/.work/review", slug === "vol1" ? ch : `${slug}-${ch}`);
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
// What the page loads, copied whole from the built site, so this never has to follow the build's own lists: the page's
// scripts, the runner, and the boxes' runtime with its notices and CHECKSUMS.
for (const d of ["page", "runner", "runtime"]) fs.cpSync(path.join(site, d), path.join(out, d), { recursive: true });
for (const f of ["app.css", "app.js"]) fs.copyFileSync(path.join(site, f), path.join(out, f));

// Each edit must find exactly one place in the built page; anything else means the page's template changed under this
// script and the copy would be wrong, so it stops.
function once(html, from, to) {
  const at = html.indexOf(from);
  if (at < 0 || html.indexOf(from, at + 1) >= 0) throw new Error(`review: not exactly one ${JSON.stringify(from)} in the built page`);
  return html.slice(0, at) + to + html.slice(at + from.length);
}
function cut(html, start, end) {
  const at = html.indexOf(start), to = html.indexOf(end, at);
  if (at < 0 || to < 0 || html.indexOf(start, at + 1) >= 0) throw new Error(`review: not exactly one ${JSON.stringify(start)} in the built page`);
  return html.slice(0, at) + html.slice(to + end.length);
}
const built = (p) => fs.readFileSync(path.join(site, slug, `${p}.html`), "utf8");
const mainOf = (html) => {
  const a = html.indexOf("<main>\n"), b = html.lastIndexOf("\n</main>");
  if (a < 0 || b < a) throw new Error("review: no <main> in the built page");
  return html.slice(a + "<main>\n".length, b);
};
const n = Number(ch.slice(2));
const NOTE = `<p class="note">A review copy of chapter ${n}${pages.length > 1 ? " and its practice page" : ""}, as built. ` +
  "Run, Check and Show a solution work here as on the site. The scratchpad is not here: one of the files it downloads " +
  "is 22 MB, more than this copy can hold in one file. It is on the live site, https://mmmugh.github.io/groundwork/, " +
  "once the chapter is published.</p>\n";
let html = built(pages[0]);
html = once(html, '<link rel="stylesheet" href="../app.css">',
  '<link rel="stylesheet" href="app.css">\n<style>.scratch-tab { display: none !important; }</style>');
html = once(html, '<script type="module" src="../app.js"></script>', '<script type="module" src="app.js"></script>');
html = once(html, html.match(/<title>[^<]*<\/title>/)?.[0] ?? "<title>", `<title>Chapter ${n} review</title>`);
html = cut(html, '<header class="top">', "</header>\n"); // its home link leads off the copy
html = cut(html, '<nav class="pager">', "</nav>\n"); // so do Previous and Next; the practice page follows below
html = once(html, "<main>\n", `<main>\n${NOTE}`);
html = once(html, "\n</main>", `\n${pages.slice(1).map((p) => mainOf(built(p))).join("\n")}\n</main>`);
// Task 4's quiz and code links point at files this copy does not carry: the copy has none.
html = html.replace(/<ul class="chapter-links">[\s\S]*?<\/ul>\n?/g, "");
fs.writeFileSync(path.join(out, "index.html"), html);

// The Artifact tool's limits (its own description): 15 MB a binary file, 16 MB the page and each text file.
// .bin as application/wasm: the Artifact tool refused application/octet-stream; the runner reads it with arrayBuffer().
const TYPES = { ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".wasm": "application/wasm",
  ".bin": "application/wasm", ".txt": "text/plain", "": "text/plain" };
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((x) => (x.isDirectory() ? walk(path.join(d, x.name)) : [path.join(d, x.name)]));
const files = {};
for (const f of walk(out).sort()) {
  const rel = path.relative(out, f).split(path.sep).join("/");
  const type = TYPES[path.extname(f)], size = fs.statSync(f).size;
  if (rel !== "index.html" && !type) throw new Error(`review: no media type for ${rel}`);
  const limit = rel === "index.html" || type.startsWith("text/") ? 16e6 : 15e6;
  if (size > limit) throw new Error(`review: ${rel} is ${size} bytes, more than an Artifact takes in one file (${limit / 1e6} MB)`);
  if (rel !== "index.html") files[rel] = { from: f, contentType: type };
}
fs.writeFileSync(path.join(out, "files.json"), JSON.stringify({ file_path: path.join(out, "index.html"), files }, null, 1) + "\n");
console.log(`review: ${path.relative(REPO, out)}/index.html and ${Object.keys(files).length} files beside it (files.json)`);
