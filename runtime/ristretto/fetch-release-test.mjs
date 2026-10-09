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
// Tests runtime/ristretto/fetch-release.sh the way a fresh clone meets it: the scratchpad's release files served flat
// behind a 302 hop (GitHub answers a release asset's URL with a redirect to another host), no network, no jshell.
//   node runtime/ristretto/fetch-release-test.mjs      0 = every check passed
// The files are real copies of the current release's 11 non-legal files under build/.work/fetch-release-test/; the
// originals and the runtime/.work/ristretto/current link are hashed before and after and must not change. verify.sh's
// own cases run on the fetched release, on a real copy of it, and on small files the test writes.
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "../..");
const script = path.join(here, "fetch-release.sh");
const sums = fs.readFileSync(path.join(here, "CHECKSUMS"), "utf8").split("\n").filter(Boolean)
  .map((l) => { const [hash, name] = l.split(/\s+/); return { hash, name }; });
const flat = sums.filter((s) => !s.name.startsWith("legal/")).map((s) => s.name);
const legal = sums.filter((s) => s.name.startsWith("legal/"));
const realCurrent = path.join(repo, "runtime/.work/ristretto/current");
const sha = (buf) => crypto.createHash("sha256").update(buf).digest("hex");

let failed = 0, ran = 0;
function check(ok, what, detail = "") {
  ran++;
  if (ok) console.log(`  ok    ${what}`);
  else { failed++; console.log(`  FAIL  ${what}${detail ? "\n      " + detail : ""}`); }
}

// What must not change: the originals, and where runtime/.work/ristretto/current points.
function snapshot() {
  const dir = fs.realpathSync(realCurrent);
  return JSON.stringify({ link: fs.readlinkSync(realCurrent), files: flat.map((n) => [n, sha(fs.readFileSync(path.join(dir, n)))]) });
}
const before = snapshot();

const work = path.join(repo, "build/.work/fetch-release-test");
fs.rmSync(work, { recursive: true, force: true });
const assets = path.join(work, "assets");
fs.mkdirSync(assets, { recursive: true });
for (const n of flat) fs.copyFileSync(path.join(fs.realpathSync(realCurrent), n), path.join(assets, n));

// The holder serves the copies; the front answers every path with a 302 to the holder. A scenario can ask the
// holder to flip one byte of a file or to answer 404 for it.
const asked = [];
let tamper = null, missing = null;
const holder = http.createServer((req, res) => {
  const name = decodeURIComponent(req.url.slice(1));
  asked.push(name);
  if (name === missing) { res.writeHead(404); res.end(); return; }
  const body = Buffer.from(fs.readFileSync(path.join(assets, name)));
  if (name === tamper) body[body.length >> 1] ^= 1;
  res.writeHead(200, { "content-length": body.length });
  res.end(body);
});
await new Promise((r) => holder.listen(0, "127.0.0.1", r));
const front = http.createServer((req, res) => {
  res.writeHead(302, { location: `http://127.0.0.1:${holder.address().port}/${path.basename(req.url)}` });
  res.end();
});
await new Promise((r) => front.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${front.address().port}/download/scratchpad-test-1/`;

function run(args, env = process.env) {
  return new Promise((resolve) => {
    const p = spawn("bash", [script, ...args], { cwd: repo, env });
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) => resolve({ code, out, err }));
  });
}
function verify(dir) {
  return new Promise((resolve) => {
    const p = spawn("sh", [path.join(here, "verify.sh"), dir], { cwd: repo });
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) => resolve({ code, err }));
  });
}
const link = (p) => { try { return fs.readlinkSync(p); } catch { return null; } };
// A zip of [name, text] entries, stored uncompressed: enough for unzip -Z1 to list it.
function storedZip(entries) {
  const parts = [], central = [];
  let at = 0;
  for (const [name, text] of entries) {
    const n = Buffer.from(name), data = Buffer.from(text), crc = zlib.crc32(data);
    const local = Buffer.alloc(30), entry = Buffer.alloc(46);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(n.length, 26);
    entry.writeUInt32LE(0x02014b50, 0); entry.writeUInt16LE(20, 4); entry.writeUInt16LE(20, 6); entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(data.length, 20); entry.writeUInt32LE(data.length, 24); entry.writeUInt16LE(n.length, 28); entry.writeUInt32LE(at, 42);
    parts.push(local, n, data); central.push(entry, n);
    at += local.length + n.length + data.length;
  }
  const dir = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(dir.length, 12); end.writeUInt32LE(at, 16);
  return Buffer.concat([...parts, dir, end]);
}
const names = (d) => fs.readdirSync(d).sort();

try {
  // 1. A fresh clone: nothing downloaded yet.
  const dest = path.join(work, "fresh/release");
  let r = await run(["--base", base, "--dest", dest]);
  check(r.code === 0, "a fresh fetch exits 0", r.err);
  const rel = path.join(dest, "scratchpad-test-1");
  check((await verify(rel)).code === 0, "verify.sh passes on the fetched release");
  const bad = sums.filter((s) => !fs.existsSync(path.join(rel, s.name)) || sha(fs.readFileSync(path.join(rel, s.name))) !== s.hash);
  check(bad.length === 0 && legal.length === 103, `every one of the ${sums.length} CHECKSUMS lines verifies (${legal.length} of them unzipped from jdk.zip)`, bad.map((s) => s.name).join(", "));
  check(link(path.join(work, "fresh/current")) === "release/scratchpad-test-1", "current points at the new directory", String(link(path.join(work, "fresh/current"))));
  check(fs.realpathSync(path.join(work, "fresh/current")) === fs.realpathSync(rel), "and it resolves there");
  check(!names(dest).some((n) => n.startsWith(".tmp-")), "no .tmp- directory is left");
  check(JSON.stringify([...asked].sort()) === JSON.stringify([...flat].sort()), "each of the 11 non-legal files was asked for once", asked.join(","));
  check(snapshot() === before, "runtime/.work/ristretto/current and the originals are untouched");

  // 2. The second run: complete already, so nothing is downloaded.
  const askedBefore = asked.length;
  r = await run(["--base", base, "--dest", dest]);
  check(r.code === 0, "a second run exits 0", r.err);
  check(asked.length === askedBefore, "and downloads nothing", `${asked.length - askedBefore} more requests`);
  check((await verify(rel)).code === 0, "verify.sh still passes");

  // 3. One byte changed in one file, and a 404 for another: exit 1 naming the file, and nothing left in place.
  const failure = async (what) => {
    const d = path.join(work, `fail-${what}/release`);
    fs.mkdirSync(path.join(d, "older"), { recursive: true });
    fs.symlinkSync("release/older", path.join(work, `fail-${what}/current`));
    const got = await run(["--base", base, "--dest", d]);
    return { d, got };
  };
  tamper = "NOTICE";
  let f = await failure("onebyte");
  const served = Buffer.from(fs.readFileSync(path.join(assets, "NOTICE"))); served[served.length >> 1] ^= 1;
  check(f.got.code === 1, "a file with one byte changed makes the fetch exit 1", `exit ${f.got.code}: ${f.got.err}`);
  check(f.got.err.includes("NOTICE") && f.got.err.includes(sha(served)), "the message names the file and the SHA-256 it got", f.got.err);
  check(f.got.err.includes(sums.find((s) => s.name === "NOTICE").hash), "and the SHA-256 CHECKSUMS pins");
  const after = (x) => link(path.join(path.dirname(x.d), "current")) === "release/older" && names(x.d).join() === "older";
  check(after(f), "current is unchanged, and no .tmp- and no scratchpad-test-1/ remain", names(f.d).join());
  tamper = null;

  missing = "browser-jshell.jar";
  f = await failure("notfound");
  check(f.got.code === 1 && f.got.err.includes("browser-jshell.jar"), "a 404 makes it exit 1 naming the file", `exit ${f.got.code}: ${f.got.err}`);
  check(after(f), "current is unchanged, and no .tmp- and no scratchpad-test-1/ remain", names(f.d).join());
  missing = null;

  // 4. Misuse exits 2.
  for (const args of [["--bogus"], ["--dest"], ["--base"], ["--base", ""], ["extra"]]) {
    r = await run(args);
    check(r.code === 2, `misuse exits 2: ${JSON.stringify(args)}`, `exit ${r.code}`);
  }

  // 5. verify.sh holds CHECKSUMS's legal/ lines to jdk.zip's legal/ files, both ways. A case with a CHECKSUMS of its own
  // runs the tracked verify.sh copied beside it, since verify.sh reads the CHECKSUMS next to itself.
  const verifyCopy = (name, lines, dir) => {
    const vd = path.join(work, name);
    fs.mkdirSync(vd, { recursive: true });
    fs.copyFileSync(path.join(here, "verify.sh"), path.join(vd, "verify.sh"));
    fs.writeFileSync(path.join(vd, "CHECKSUMS"), lines.join("\n") + "\n");
    return new Promise((resolve) => {
      const p = spawn("sh", [path.join(vd, "verify.sh"), dir]);
      let err = ""; p.stderr.on("data", (d) => (err += d)); p.on("close", (code) => resolve({ code, err }));
    });
  };
  const line = (s) => `${s.hash}  ${s.name}`;
  // A CHECKSUMS that leaves out a legal/ file the jdk.zip carries (P3b-9); the old verify.sh passed it.
  let v = await verifyCopy("verify-copy", sums.filter((s) => s.name !== "legal/java.xml/xmlxsd.md").map(line), rel);
  check(v.code === 2 && v.err.includes("legal/java.xml/xmlxsd.md"), "verify.sh exits 2 for a CHECKSUMS missing a legal/ line jdk.zip has, naming it", `exit ${v.code}: ${v.err}`);
  // And one that lists a legal/ file jdk.zip does not carry. The release lacks the file too, which alone exits 2
  // ("missing: legal/x/EXTRA"); the words checked are the ones only the comparison with jdk.zip prints.
  v = await verifyCopy("verify-extra", [...sums.map(line), `${"0".repeat(64)}  legal/x/EXTRA`], rel);
  check(v.code === 2 && v.err.includes("not in jdk.zip: legal/x/EXTRA"), "verify.sh exits 2 for a CHECKSUMS listing a legal/ file jdk.zip lacks, naming it", `exit ${v.code}: ${v.err}`);

  // A damaged jdk.zip (a real copy of the fetched release, its jdk.zip cut in half) lists nothing, so every legal/ line
  // fails; unzip's own diagnostic must reach the output to say why. Info-ZIP reports a zip with no central directory as
  // "End-of-central-directory signature not found"; the check looks for that substring, Info-ZIP's words, not a platform's.
  const damaged = path.join(work, "damaged");
  fs.cpSync(rel, damaged, { recursive: true });
  const zip = fs.readFileSync(path.join(rel, "jdk.zip"));
  fs.writeFileSync(path.join(damaged, "jdk.zip"), zip.subarray(0, zip.length >> 1));
  v = await verify(damaged);
  check(v.code === 2 && v.err.includes("End-of-central-directory"), "verify.sh exits 2 for a damaged jdk.zip, with unzip's own diagnostic", `exit ${v.code}: ${v.err.slice(0, 600)}`);

  // A jdk.zip with nothing under legal/ is an empty match, not damage: unzip -Z1 exits 11 and prints "caution: filename
  // not matched", and the list must stay empty with nothing said. CHECKSUMS lists no legal/ either, so the only
  // complaint is the one D53 makes verify.sh raise whatever the zip holds (every release lists legal/java.base/LICENSE):
  // exit 2 with that one line, and no other.
  const empty = path.join(work, "no-legal");
  fs.mkdirSync(empty, { recursive: true });
  for (const n of flat) fs.writeFileSync(path.join(empty, n), n === "jdk.zip" ? storedZip([["other/file.txt", "not a notice\n"]]) : `${n}\n`);
  v = await verifyCopy("verify-no-legal", flat.map((n) => line({ hash: sha(fs.readFileSync(path.join(empty, n))), name: n })), empty);
  check(v.code === 2 && v.err === "not in CHECKSUMS: legal/java.base/LICENSE\n", "a jdk.zip with no legal/ adds nothing to verify.sh's output (the one line is D53's)", `exit ${v.code}: ${JSON.stringify(v.err)}`);

  // 6. The one hash helper: sha256sum alone is enough; with neither tool the script exits 2 naming both.
  const tools = ["sh", "bash", "awk", "cut", "head", "tr", "basename", "dirname", "mkdir", "rm", "ln", "mv", "curl", "unzip", "grep", "sort", "sed", "cat"];
  const find = (t) => ["/usr/bin", "/bin", "/usr/sbin", "/sbin", "/usr/local/bin", "/opt/homebrew/bin"].map((d) => path.join(d, t)).find((p) => fs.existsSync(p));
  const pathWith = (name, extra) => {
    const d = path.join(work, name);
    fs.mkdirSync(d, { recursive: true });
    for (const t of [...tools, ...extra]) { const p = find(t); if (p) fs.symlinkSync(p, path.join(d, t)); }
    return d;
  };
  const sumOnly = pathWith("path-sha256sum", find("sha256sum") ? ["sha256sum"] : []);
  if (find("sha256sum")) {
    r = await run(["--base", base, "--dest", path.join(work, "sha256sum-only/release")], { ...process.env, PATH: sumOnly });
    check(r.code === 0 && link(path.join(work, "sha256sum-only/current")) === "release/scratchpad-test-1", "with sha256sum and no shasum the fetch still passes", `exit ${r.code}: ${r.err}`);
  } else console.log("  skip  sha256sum is not on this machine");
  const neither = pathWith("path-neither", []);
  r = await run(["--base", base, "--dest", path.join(work, "neither/release")], { ...process.env, PATH: neither });
  check(r.code === 2 && r.err.includes("shasum") && r.err.includes("sha256sum"), "with neither the script exits 2 naming both", `exit ${r.code}: ${r.err}`);

  check(snapshot() === before, "runtime/.work/ristretto/current and the originals are still untouched at the end");
} finally {
  holder.close(); front.close();
}
console.log(`${ran} check(s), ${failed} failed`);
process.exit(failed ? 1 : 0);
