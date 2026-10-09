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
// The negative proofs, all at once: every patch must matter to at least one gate. `build.sh --negatives`
// builds fork-no-NNNN, the whole series but one patch and the patches that declare they build on it, into
// .work/variants/ for each patch; every such build must fail differential.mjs, hash-order.mjs,
// random-seed.mjs or runner-safety.mjs (the one gate that runs a program stopped at its deadline), or nothing
// tests that patch.
// The patch list is read from runtime/patches/ exactly as build.sh derives it (every teavm-0NNN and
// teavm-javac-01NN but 0101, which is what puts the fork's TeaVM into the build at all), so a new patch
// cannot be left out here. A missing or mismatched variant is a failure, never a skip.
// dist/fork runs first as the control: a gate that fails on the full build proves nothing by failing on
// a variant, so the proof fails then too.
//   node runtime/test/negatives.mjs      (about half an hour; each gate's output lands in
//                                         .work/logs/negatives/<variant>/<gate>.log)
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.resolve(fileURLToPath(new URL(".", import.meta.url)));
const RUNTIME = path.resolve(HERE, "..");
const LOGS = path.join(RUNTIME, ".work", "logs", "negatives");
const GATES = ["differential.mjs", "hash-order.mjs", "random-seed.mjs", "runner-safety.mjs"];
const FILES = ["compile-classlib-teavm.bin", "compiler.wasm", "compiler.wasm-deobfuscator.wasm",
  "compiler.wasm-runtime.js", "compiler.wasm-runtime.mjs", "runtime-classlib-teavm.bin"];

const names = fs.readdirSync(path.join(RUNTIME, "patches")).sort();
const teavm = names.map((f) => /^teavm-(0\d{3})-.*\.patch$/.exec(f)?.[1]).filter(Boolean);
const javac = names.map((f) => /^teavm-javac-(01\d{2})-.*\.patch$/.exec(f)?.[1]).filter(Boolean);
const dropped = [...teavm, ...javac].filter((p) => p !== "0101");
// A patch that changes lines another patch wrote declares it above its diff with "# Builds on: teavm-NNNN"
// (or teavm-javac-NNNN; more than one name may follow), and every leave-one-out build applies: fork-no-NNNN
// leaves out NNNN and every patch that builds on it, directly or through another, as build.sh does. A name
// that is not a patch in runtime/patches/ is a failure here, before any variant is checked.
const deps = []; // [dependent, base], by patch number
for (const f of names.filter((n) => /^teavm-(javac-)?\d{4}-.*\.patch$/.test(n))) {
  const header = fs.readFileSync(path.join(RUNTIME, "patches", f), "utf8").split(/^diff --git/m)[0];
  for (const [, list] of header.matchAll(/^# Builds on:(.*)$/gm)) for (const b of list.trim().split(/\s+/)) {
    const base = /^teavm(?:-javac)?-(\d{4})$/.exec(b)?.[1];
    if (!base || !names.some((n) => n.startsWith(`${b}-`) && n.endsWith(".patch"))) {
      console.log(`  !! ${f} builds on ${b}, which is not a patch in runtime/patches/`);
      process.exit(1);
    }
    deps.push([/^teavm-(?:javac-)?(\d{4})-/.exec(f)[1], base]);
  }
}
const leavesWith = (p) => {
  const out = new Set([p]);
  for (let grew = true; grew;) {
    grew = false;
    for (const [d, b] of deps) if (out.has(b) && !out.has(d)) { out.add(d); grew = true; }
  }
  return out;
};

// A variant counts only if its manifest says it is this series without exactly that patch and the patches
// that build on it, each patch the very file now in runtime/patches/ (build.sh records the SHA-256 of every
// patch it applies).
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
function problemWith(dir, name, drop) {
  if (!fs.existsSync(dir)) return `no such build (${path.relative(RUNTIME, dir)})`;
  const missing = FILES.filter((f) => !fs.existsSync(path.join(dir, f)));
  if (missing.length) return `missing ${missing.join(", ")}`;
  let m;
  try { m = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8")); } catch { return "no readable manifest.json"; }
  const leaving = drop ? leavesWith(drop) : new Set();
  const want = (all) => all.filter((p) => !leaving.has(p)).join(" ");
  if (m.variant !== name) return `manifest.json names variant ${m.variant}`;
  if (m.teavm_patches.join(" ") !== want(teavm) || m.teavm_javac_patches.join(" ") !== want(javac))
    return `built from teavm [${m.teavm_patches.join(" ")}] teavm-javac [${m.teavm_javac_patches.join(" ")}], not this series without ${[...leaving].join(" ")}`;
  if (!m.patches_sha256) return "manifest.json records no patch hashes (built before build.sh did)";
  for (const [p, h] of Object.entries(m.patches_sha256)) {
    if (!fs.existsSync(path.join(RUNTIME, p)) || sha256(path.join(RUNTIME, p)) !== h) return `${p} is not the file this build applied`;
  }
  return null;
}

const rows = [{ name: "fork (control)", dir: path.join(RUNTIME, "dist", "fork"), drop: null },
  ...dropped.map((p) => ({ name: `fork-no-${p}`, dir: path.join(RUNTIME, ".work", "variants", `fork-no-${p}`), drop: p }))];
const bad = rows.map((r) => [r.name, problemWith(r.dir, r.drop ? r.name : "fork", r.drop)]).filter(([, p]) => p);
if (bad.length) {
  for (const [n, p] of bad) console.log(`  !! ${n}: ${p}`);
  console.log(`${bad.length} build(s) missing or not what they claim; run \`bash runtime/build.sh --negatives\``);
  process.exit(1);
}

const width = Math.max(...rows.map((r) => r.name.length));
console.log(`${"build".padEnd(width)}  ${GATES.map((g) => g.replace(".mjs", "")).join("  ")}  verdict`);
let failed = 0;
for (const r of rows) {
  fs.mkdirSync(path.join(LOGS, r.drop ? r.name : "fork"), { recursive: true });
  const codes = GATES.map((g) => {
    const p = spawnSync(process.execPath, [path.join(HERE, g)], { env: { ...process.env, JF_DIST: r.dir },
      encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 20 * 60 * 1000 });
    fs.writeFileSync(path.join(LOGS, r.drop ? r.name : "fork", g.replace(".mjs", ".log")), (p.stdout ?? "") + (p.stderr ?? ""));
    return p.status ?? `killed-${p.signal}`;
  });
  const anyFailed = codes.some((c) => c !== 0);
  const ok = r.drop ? anyFailed : !anyFailed;
  if (!ok) failed++;
  const verdict = r.drop ? (ok ? "caught" : "NOT CAUGHT: no gate fails without this patch")
    : (ok ? "every gate passes" : "FAILS: the gates do not pass on the full build");
  console.log(`${r.name.padEnd(width)}  ${GATES.map((g, i) => String(codes[i]).padEnd(g.length - 4)).join("  ")}  ${verdict}`);
}
console.log(failed ? `\n${failed} problem(s)` : `\nevery one of ${dropped.length} patches is caught by at least one gate`);
process.exit(failed ? 1 : 0);
