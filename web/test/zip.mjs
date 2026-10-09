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
// The self-hosting zip (D80, D81), the round trip a self-hoster makes: build the fixture site, zip it with build/SiteZip.java
// and two fixture archives, unzip it, and serve the unzipped folder from a server that knows only .html, .css, .js, .json
// and .txt (types: "plain"), at / and under /groundwork/ as Pages serves it. Under the prefix every request must start with
// the prefix and anything outside it is 404 [B14]. In Chromium, at each: a box prints Hello, the scratchpad opens to ready,
// and both source archives download with the fixture's bytes; nothing goes off-origin. WebKit and Firefox run a box at the
// prefix. The archives here are fixtures of a few bytes that are not gzip: the real ones carry OpenJDK and Corretto source,
// which no test opens (D14, D51).
//   node web/test/zip.mjs [chromium|webkit|firefox]
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { REPO, J, ENGINES, check, done, buildSite, open, workDir } from "./harness.mjs";

const only = process.argv[2];
if (only && !ENGINES[only]) { console.log("usage: node web/test/zip.mjs [chromium|webkit|firefox]"); process.exit(2); }
const VERSION = "2026.10.06-1", PREFIX = "/groundwork/";
const site = path.join(buildSite(path.join(REPO, "web/test/vol-page"), "zip-test-site"), "site");
const work = workDir("zip-test");
const RUNTIME_BYTES = Buffer.from("fixture boxes archive: these bytes are not gzip");
const SCRATCHPAD_BYTES = Buffer.from([0x1f, 0x8b, 0, 1, 2, 3, 0xff, 0x7f]);
fs.writeFileSync(path.join(work, "runtime-source.tar.gz"), RUNTIME_BYTES);
fs.writeFileSync(path.join(work, "scratchpad-source.tar.gz"), SCRATCHPAD_BYTES);
const sha = (b) => spawnSync("shasum", ["-a", "256"], { input: b, encoding: "utf8" }).stdout.split(" ")[0];
fs.writeFileSync(path.join(work, "pins.sha256"),
  `${sha(RUNTIME_BYTES)}  runtime/source.tar.gz\n${sha(SCRATCHPAD_BYTES)}  scratchpad/source.tar.gz\n`);
const zipFile = path.join(work, `groundwork-${VERSION}.zip`);
const made = spawnSync(J, ["build/SiteZip.java", "--site", site, "--version", VERSION, "--out", zipFile,
  "--runtime-source", path.join(work, "runtime-source.tar.gz"), "--scratchpad-source", path.join(work, "scratchpad-source.tar.gz"),
  "--pins", path.join(work, "pins.sha256")], { cwd: REPO, encoding: "utf8" });
check("SiteZip zips the built fixture site", made.status === 0, made.stdout + made.stderr);
const unzipped = path.join(work, "unzipped");
const un = spawnSync("unzip", ["-q", zipFile, "-d", unzipped], { encoding: "utf8" });
check("the zip unzips", un.status === 0, un.stdout + un.stderr);
const folder = path.join(unzipped, `groundwork-${VERSION}`);
check("the folder holds the page, and both source archives beside the runtimes' notices",
  ["index.html", "runtime/NOTICE", "scratchpad/NOTICE", "runtime/source.tar.gz", "scratchpad/source.tar.gz"].every((f) => fs.existsSync(path.join(folder, f))),
  fs.existsSync(folder) ? fs.readdirSync(folder) : "no folder");
// L-1: and the course's own licenses beside the page, the repository's LICENSE and LICENSE-COURSE byte for byte, so whoever
// serves or shares the folder has them.
check("the folder holds the course's own LICENSE and LICENSE-COURSE beside index.html, as the repository has them",
  ["LICENSE", "LICENSE-COURSE"].every((f) => fs.existsSync(path.join(folder, f))
    && fs.readFileSync(path.join(folder, f)).equals(fs.readFileSync(path.join(REPO, f)))),
  fs.existsSync(folder) ? fs.readdirSync(folder) : "no folder");
if (made.status !== 0 || un.status !== 0) done();

const PAGE = "vol-page/ch01-run.html";
const ready = (t) => t.page.waitForFunction(() => document.documentElement.dataset.java, null, { timeout: 30000 });
const runBox = async (t, n) => {
  await t.page.locator(`.box[data-box="ch01-run#${n}"]`).getByRole("button", { name: "Run", exact: true }).click();
  await t.page.waitForFunction((id) => {
    const st = document.querySelector(`.box[data-box="${id}"]`).dataset.state;
    return st === "done" || st === "waiting";
  }, `ch01-run#${n}`, { timeout: 30000 });
  return (await t.page.locator(`.box[data-box="ch01-run#${n}"] .run`).innerText()).replace(/\r/g, "");
};
const fetchBytes = (t, rel) => t.page.evaluate(async (u) => {
  const r = await fetch(new URL(u, location.href));
  return { status: r.status, bytes: [...new Uint8Array(await r.arrayBuffer())] };
}, rel);

for (const engine of only ? [only] : Object.keys(ENGINES)) {
  console.log(engine);
  for (const prefix of engine === "chromium" ? ["/", PREFIX] : [PREFIX]) {
    const where = `${engine}, ${prefix === "/" ? "at /" : "under " + PREFIX}`;
    const t = await open(engine, folder, PAGE, {}, null, { server: { types: "plain", prefix } });
    await ready(t).catch(() => {});
    const java = await t.page.evaluate(() => document.documentElement.dataset.java);
    check(`${where}: the unzipped course can run Java from a server that knows only the common types`, java === "ready", java);
    if (java === "ready") {
      const out = await runBox(t, 1);
      check(`${where}: a box prints Hello`, out.includes("Hello, <world> & café 😀"), out);
    }
    if (engine === "chromium") {
      await t.page.waitForFunction(() => document.documentElement.dataset.scratchpad, null, { timeout: 30000 }).catch(() => {});
      await t.page.locator(".scratch-tab").click();
      const up = await t.page.waitForFunction(() => document.getElementById("scratchpad").dataset.state === "ready", null, { timeout: 120000, polling: 250 }).then(() => true, () => false);
      check(`${where}: the scratchpad opens to ready`, up, await t.page.evaluate(() => document.getElementById("scratchpad")?.dataset.state));
      for (const [rel, want] of [["../runtime/source.tar.gz", RUNTIME_BYTES], ["../scratchpad/source.tar.gz", SCRATCHPAD_BYTES]]) {
        const got = await fetchBytes(t, rel);
        check(`${where}: ${rel.slice(3)} downloads with the fixture's bytes`, got.status === 200 && Buffer.from(got.bytes).equals(want), { status: got.status, length: got.bytes.length });
      }
    }
    if (prefix !== "/") {
      const bad = t.requests.filter((u) => !u.startsWith(`${t.origin}${prefix}`));
      check(`${where}: every request starts with ${t.origin}${prefix}`, t.requests.length > 0 && bad.length === 0, bad);
      const outside = await t.page.evaluate(async () => (await fetch("/index.html")).status);
      check(`${where}: a root-absolute request is 404`, outside === 404, outside);
    }
    check(`${where}: nothing went off-origin`, t.offsite.length === 0, t.offsite);
    check(`${where}: no page error`, t.errors.length === 0, t.errors);
    await t.close();
  }
}
done();
