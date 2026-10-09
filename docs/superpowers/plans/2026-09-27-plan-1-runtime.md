# Plan 1: the runtime, implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the spike's teavm-javac fork into `runtime/`: rebuilt from pinned sources, run by a Node
runner that survives any program a beginner can write, held to the real JDK by a differential test with
an explicit list of known differences, fixed where the course needs JDK fidelity, and packaged as a
checksummed release with its licenses and corresponding source.

**Architecture:** `runtime/build.sh` fetches a checksum-verified Temurin JDK, clones pinned TeaVM and
teavm-javac commits, applies `runtime/patches/`, and builds `runtime/dist/fork/` (six runtime files and a
build manifest). Everything
the build and tests need lives in `runtime/.work/` (git-ignored). `runtime/runner/` compiles in one
worker thread and runs each program in a fresh one. `runtime/test/` holds the cases and the tests that
compare the fork against the pinned JDK. `runtime/release/` packages and verifies a release.

**Tech Stack:** bash, Node 25 (`worker_threads`), Gradle 9.1 via teavm-javac's wrapper, Temurin JDK
25.0.4.1, TeaVM 0.13.1 patched through an overlay of recompiled classes.

**Spec:** [DESIGN.md](../../../DESIGN.md) sections 1, 2 and 7; decisions D1, D11, D12, D14, D15, D16,
D21, R1, R2 in the [worksheet](../../../WORKSHEET-2026-09-26-java-port.md). Starting code and evidence:
[spike/2026-09-27/](../../../spike/2026-09-27/) (read its README and `reports/teavm-fork-report.md`
first).

## Global Constraints

- JDK: Eclipse Temurin `jdk-25.0.4.1+1`, macOS aarch64 file
  `OpenJDK25U-jdk_aarch64_mac_hotspot_25.0.4.1_1.tar.gz`, SHA-256
  `61979887f7506a24a57439ff99adb8b3a7fc89977d9cfe3b8984f58a981b7b9d` (verified against both the Adoptium
  API and the published `.sha256.txt`).
- Pinned sources: teavm-javac `2ddcf02e4983e5c74d45b945c2fd41a829358828`; TeaVM tag `0.13.1` =
  `b3a245b7d9034ff35cdfab2def057a3d4f256efb`; OpenJDK `jdk25u` revision
  `6c48f4ed707bf0b15f9b6098de30db8aae6fa40f` (pinned inside teavm-javac's `gradle.properties`).
- Every cache stays in `runtime/.work/`: `GRADLE_USER_HOME`, `-Dmaven.repo.local`, the JDK, clones. No
  global installs, nothing written to `~/.gradle` or `~/.m2`. Stop Gradle daemons at the end of a build.
- The JDK is always run with `-Dstdout.encoding=UTF-8 -Dstderr.encoding=UTF-8 -Dstdin.encoding=UTF-8
  -Dfile.encoding=UTF-8 -Duser.language=en -Duser.country=US`.
- **Clean room (D14).** Fidelity patches are written from the pinned JDK's observed output and the public
  Javadoc only. Do not open OpenJDK source (including `lib/src.zip`) while working on Tasks 4 to 7.
  The session that wrote this plan read OpenJDK's `HashMap.java`, so Task 6 carries tests only; its
  implementation must come from an implementer who has not.
  OpenJDK source sits on disk here: teavm-javac's build downloads the pinned jdk25u source into
  `runtime/.work` to compile `javac`. During Tasks 4 to 8 (every task that writes a fidelity patch), read
  and search TeaVM's checkout (`runtime/.work/build/src/teavm/`) and this repository; in teavm-javac's
  checkout, only its tracked files, through `git -C <checkout> ls-files` and `git -C <checkout> grep`
  (tracked files are teavm-javac's own code; the OpenJDK tree is untracked build output). Never search
  recursively across `runtime/.work` (a recursive search of `runtime/` reaches it too; search this
  repository with `git grep`), never open anything under `runtime/.work/build/src/teavm-javac/javac/build/`
  (the jdk25u download) or the JDK's `lib/src.zip`, and never read OpenJDK source on the web. This is the
  boundary Tasks 4 to 8 were held to, and their transcripts were audited against it.
- New files carry the Apache-2.0 header TeaVM uses, with `Copyright 2026 Java Foundations contributors`.
- Never push, never create a remote, never commit with `--no-verify`. Never bind port 8731.
- Scratch files go in `runtime/.work/` or the session scratchpad, never `/tmp`.
- Commit messages carry the reasoning, name the gate each change adds, and say how it was proven to
  fail.

## Review Focus

1. A program whose last output has no trailing newline: the text must still appear (Task 3).
2. Non-ASCII text in and out (`café`, `😀`) through `IO.readln` and `IO.println` must match the JDK
   byte for byte (Task 2 adds the input case).
3. Reading past the end of input: `IO.readln()` returns `null`, and `Integer.parseInt(null)` then
   throws with the JDK's exact message (Task 4 case).
4. An uncaught exception from inside a nested method call with a custom message: first stderr line
   must equal the JDK's (Task 4 case).
5. `int` overflow, `long` arithmetic and `char` arithmetic (`'a' + 1`, `(char) ('a' + 1)`) must match
   the JDK (Task 2 cases).

---

### Task 1: `runtime/` rebuilt from pinned sources

**Files:**
- Create: `runtime/pins.env`, `runtime/build.sh`, `runtime/test/smoke.mjs`
- Copy from `spike/2026-09-27/teavm-fork/`: `patches/*.patch` (not `upstream-*`), `overlay/build-overlay.sh`,
  `runner/*.mjs`, `tests/cases.mjs` → `runtime/test/cases.mjs`
- Modify: `.gitignore` (add `runtime/.work/`)

**Interfaces:**
- Produces: `runtime/dist/fork/{compiler.wasm,compiler.wasm-runtime.js,compiler.wasm-runtime.mjs,compiler.wasm-deobfuscator.wasm,compile-classlib-teavm.bin,runtime-classlib-teavm.bin}`
  (the six runtime files) plus `manifest.json` (build metadata). `compiler.wasm-runtime.mjs` is a copy of
  the `.js` that the build makes because Node loads it as an ES module: `node-worker-entry.mjs` and
  `tjava-node.mjs` import the `.mjs`, so it is load-bearing, not a leftover.
  `NodeRunner` from `runtime/runner/node-runner.mjs` with `compileAndRun(src, {stdin, deadlineMs})`
  returning `{status, stdout, stderr, exception, ms}`, `status` one of `ok`, `trap`, `timeout`,
  `output-limit`, `fatal`, `compile-error`; `close()`.

- [ ] **Step 1: Copy the spike sources into place**

```bash
cd "$(git rev-parse --show-toplevel)"
S=spike/2026-09-27/teavm-fork
mkdir -p runtime/{patches,overlay,runner,test}
cp $S/patches/teavm-0*.patch $S/patches/teavm-javac-01*.patch runtime/patches/
cp $S/overlay/build-overlay.sh runtime/overlay/
cp $S/runner/*.mjs runtime/runner/
cp $S/tests/cases.mjs runtime/test/cases.mjs
printf '\n# Runtime build workspace: JDK, clones, Gradle and Maven caches.\nruntime/.work/\n' >> .gitignore
```

- [ ] **Step 2: Write the pins**

`runtime/pins.env`:
```bash
# Everything the runtime is built from. Change a pin here, rebuild, rerun every test in runtime/test.
JDK_RELEASE="jdk-25.0.4.1+1"
JDK_FILE="OpenJDK25U-jdk_aarch64_mac_hotspot_25.0.4.1_1.tar.gz"
JDK_URL="https://github.com/adoptium/temurin25-binaries/releases/download/jdk-25.0.4.1%2B1/$JDK_FILE"
JDK_SHA256="61979887f7506a24a57439ff99adb8b3a7fc89977d9cfe3b8984f58a981b7b9d"
JDK_API="https://api.adoptium.net/v3/assets/release_name/eclipse/jdk-25.0.4.1%2B1?architecture=aarch64&image_type=jdk&os=mac&project=jdk"
TEAVM_TAG="0.13.1"
TEAVM_COMMIT="b3a245b7d9034ff35cdfab2def057a3d4f256efb"
JAVAC_COMMIT="2ddcf02e4983e5c74d45b945c2fd41a829358828"
JDK25U_REVISION="6c48f4ed707bf0b15f9b6098de30db8aae6fa40f"
```

- [ ] **Step 3: Write the failing smoke test**

`runtime/test/smoke.mjs`:
```js
// The smallest proof the runtime exists: compile and run Hello World through the Node runner.
import { NodeRunner } from "../runner/node-runner.mjs";
const DIST = new URL("../dist/fork/", import.meta.url).pathname;
const r = new NodeRunner(DIST);
const out = await r.compileAndRun('void main() { IO.println("Hello, world!"); }', { deadlineMs: 10000 });
await r.close();
const ok = out.status === "ok" && out.stdout === "Hello, world!\n";
console.log(`${ok ? "ok  " : "FAIL"}  Hello World through the fork (status=${out.status}, stdout=${JSON.stringify(out.stdout)})`);
process.exit(ok ? 0 : 1);
```

Run: `node runtime/test/smoke.mjs`
Expected: a non-zero exit (the runner cannot find `runtime/dist/fork/`).

- [ ] **Step 4: Write `runtime/build.sh`**

Start from `spike/2026-09-27/teavm-fork/setup.sh` (`cp spike/2026-09-27/teavm-fork/setup.sh runtime/build.sh`)
and make exactly these changes:
1. Replace its pin variables (lines 16 to 23) with `source "$F/pins.env"`. `pins.env` defines
   `JDK_API` too, which line 38's checksum lookup still reads (the script runs under `set -u`).
   `JAVAC_HEAD` becomes `$JAVAC_COMMIT` everywhere. Drop `JAVAC_BASE`, including its commit check
   (`git -C "$SRC/teavm-javac" cat-file -e "$JAVAC_BASE^{commit}"`, line 67), which would otherwise abort
   the script under `set -u`; only the `$JAVAC_COMMIT` check remains.
2. Set `W="$F/.work"` right after `F=`, and move every cache and clone under it: `$F/jdk25` → `$W/jdk25`,
   `$F/gradle-home` → `$W/gradle-home`, `$F/m2` → `$W/m2`, `$F/build` → `$W/build` (this also moves
   `SRC` and the Gradle logs).
3. Verify the JDK download against `$JDK_SHA256` from `pins.env` as well as the two Adoptium sources;
   stop on any mismatch.
4. Derive the patch lists from the files, so a new patch is applied the moment it is added. Replace
   lines 25 to 27 (`ALL_TEAVM`, `ALL_JAVAC`, `VARIANTS`) with:
   ```bash
   ALL_TEAVM=$(ls "$F"/patches/teavm-0*.patch | sed -E 's#.*/teavm-([0-9]{4})-.*#\1#' | tr '\n' ' ')
   ALL_JAVAC=$(ls "$F"/patches/teavm-javac-01*.patch | sed -E 's#.*/teavm-javac-([0-9]{4})-.*#\1#' | tr '\n' ' ')
   NEGATIVES=$(for p in $ALL_TEAVM $ALL_JAVAC; do [ "$p" = 0101 ] || printf 'fork-no-%s ' "$p"; done)
   ```
   (0101 is the build wiring every fork variant needs, so it has no negative.) In `build_variant`,
   delete the `baseline` and `head` cases.
5. Default: build only `fork`, into `$F/dist/fork/`. With `--negatives`, also build every name in
   `$NEGATIVES`. In `build_variant`, replace `local out="$F/dist/$name"` with:
   ```bash
   local out; if [ "$name" = fork ]; then out="$F/dist/fork"; else out="$W/variants/$name"; fi
   ```
   so negatives land in `runtime/.work/variants/fork-no-NNNN/`, where Tasks 2 and 4 to 7 point `JF_DIST`.
   Replace the dispatch at lines 129 and 130 (`targets=${*:-$VARIANTS}` and its loop), since `VARIANTS`
   no longer exists:
   ```bash
   targets=fork
   [ "${1:-}" = --negatives ] && targets="fork $NEGATIVES"
   for v in $targets; do build_variant "$v"; done
   ```
6. After the builds: `(cd "$W/build/src/teavm-javac" && ./gradlew --stop)`.
7. Point the overlay step at `$F/overlay/build-overlay.sh` and the patches at `$F/patches/`.
8. Prime the Gradle cache before the first variant. `build-overlay.sh` compiles against the published,
   unpatched TeaVM 0.13.1 jars, which it reads straight out of `$GRADLE_USER_HOME`'s module cache. In the
   spike, the `baseline` and `head` variants put them there, because they were built first and without
   `-Pteavm.forkRepo`; every variant left after this step is built with it, so on an empty `runtime/.work`
   nothing would download them and the first overlay would fail. So, when the cache holds no
   `org.teavm/teavm-core/0.13.1` jar, run one plain build of teavm-javac at `$JAVAC_COMMIT` with no patches
   and no `-Pteavm.forkRepo` (the spike's `head` variant, output discarded) before the variant loop.

Run: `bash runtime/build.sh`
Expected: exit 0; `ls runtime/dist/fork` lists the six runtime files and `manifest.json`;
`git status --short` shows nothing under `runtime/.work` or `runtime/dist`; `~/.gradle` and `~/.m2` do
not exist.

- [ ] **Step 5: Run the smoke test**

Run: `node runtime/test/smoke.mjs`
Expected: `ok    Hello World through the fork (status=ok, stdout="Hello, world!\n")`, exit 0.

- [ ] **Step 6: Commit**

```bash
git add .gitignore runtime/pins.env runtime/build.sh runtime/overlay runtime/patches runtime/runner runtime/test/cases.mjs runtime/test/smoke.mjs
git commit -m "feat(runtime): rebuild the teavm-javac fork from pinned sources"
```
The message says where each pin came from and that `smoke.mjs` failed before the build and passed after.

---

### Task 2: the differential test, with an explicit known-differences list

**Files:**
- Create: `runtime/test/jdk.mjs`, `runtime/test/differential.mjs`, `runtime/test/known-differences.json`
- Modify: `runtime/test/cases.mjs` (append the Review Focus cases 2 and 5)

**Interfaces:**
- Consumes: `NodeRunner` (Task 1); `cases` from `runtime/test/cases.mjs`: objects with `id`, `group`,
  `src`, optional `stdin`.
- Produces: `runJdk(src, stdin, dir) → {status, stdout, stderrHead}` and `checkJdk()` from `jdk.mjs`;
  `outcome(result) → {status, stdout, stderrHead}` from `differential.mjs`; the command
  `node runtime/test/differential.mjs [--record]`, exit 0 only when every difference is known.

- [ ] **Step 1: Add the Review Focus cases**

Append to `runtime/test/cases.mjs`:
```js
cases.push(
  { id: "RF-utf8-input", group: "review-focus", stdin: "café 😀\n",
    src: 'void main() { String s = IO.readln(); IO.println(s + " / " + s.length()); }' },
  { id: "RF-int-overflow", group: "review-focus",
    src: 'void main() { int x = Integer.MAX_VALUE; IO.println(x + 1); long y = x; IO.println(y + 1); }' },
  { id: "RF-char-arithmetic", group: "review-focus",
    src: "void main() { char c = 'a'; IO.println(c + 1); IO.println((char) (c + 1)); IO.println('A' + 'B'); }" },
);
```

- [ ] **Step 2: Write the JDK side**

`runtime/test/jdk.mjs`:
```js
// The reference: the pinned Temurin JDK, run the same way every time.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const RUNTIME = path.resolve(new URL("..", import.meta.url).pathname);
export const JAVA_HOME = process.env.JF_JAVA_HOME ||
  path.join(RUNTIME, ".work/jdk25/jdk-25.0.4.1+1/Contents/Home");
export const JAVA = path.join(JAVA_HOME, "bin", "java");
export const JAVA_FLAGS = ["-Dstdout.encoding=UTF-8", "-Dstderr.encoding=UTF-8", "-Dstdin.encoding=UTF-8",
  "-Dfile.encoding=UTF-8", "-Duser.language=en", "-Duser.country=US"];

export function checkJdk() {
  const p = spawnSync(JAVA, ["-version"], { encoding: "utf8" });
  if (p.status !== 0 || !/"25\.0\.4\.1"/.test(p.stderr)) {
    throw new Error(`the pinned JDK 25.0.4.1 is not at ${JAVA}: run runtime/build.sh`);
  }
}

export function runJdk(src, stdin, dir) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "Main.java"), src);
  const p = spawnSync(JAVA, [...JAVA_FLAGS, "Main.java"], { cwd: dir, input: stdin ?? "", encoding: "utf8",
    timeout: 30000, env: { PATH: "/usr/bin:/bin", LANG: "en_US.UTF-8", HOME: process.env.HOME } });
  const stderr = p.stderr ?? "";
  const status = p.status === 0 ? "ok"
    : /error: compilation failed/.test(stderr) ? "compile-error"
    : stderr.startsWith("Exception in thread") ? "uncaught"
    : p.signal ? `killed-${p.signal}` : `exit-${p.status}`;
  return { status, stdout: p.stdout ?? "", stderrHead: stderr.split("\n")[0] };
}
```

- [ ] **Step 3: Write the gate**

`runtime/test/differential.mjs`:
```js
// Runs every case on the fork and on the pinned JDK. Passes only when each difference is listed in
// known-differences.json with a reason, and each listed difference is still exactly what was recorded.
// A listed case that has become identical is a failure too: the list must shrink when the fork improves.
//   node runtime/test/differential.mjs            the gate
//   node runtime/test/differential.mjs --record   rewrite the list from this run (new entries get
//                                                 reason "UNEXPLAINED", which the gate rejects)
import fs from "node:fs";
import path from "node:path";
import { cases } from "./cases.mjs";
import { NodeRunner } from "../runner/node-runner.mjs";
import { checkJdk, runJdk } from "./jdk.mjs";

const HERE = path.resolve(new URL(".", import.meta.url).pathname);
const RUNTIME = path.resolve(HERE, "..");
const LIST = path.join(HERE, "known-differences.json");
const WORK = path.join(RUNTIME, ".work", "jdk-cases");

export function outcome(r) {
  if (r.status === "compile-error") return { status: "compile-error", stdout: "", stderrHead: "" };
  const stderrHead = (r.stderr ?? "").split("\n")[0];
  const status = stderrHead.startsWith("Exception in thread") ? "uncaught"
    : r.status === "ok" ? "ok" : r.status;
  return { status, stdout: r.stdout ?? "", stderrHead: status === "uncaught" ? stderrHead : "" };
}
const jdkOutcome = (j) => ({ status: j.status, stdout: j.status === "compile-error" ? "" : j.stdout,
  stderrHead: j.status === "uncaught" ? j.stderrHead : "" });
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

checkJdk();
const known = fs.existsSync(LIST) ? JSON.parse(fs.readFileSync(LIST, "utf8")) : {};
// JF_DIST points the gate at another build, which is how a negative proof runs it without a patch.
const runner = new NodeRunner(process.env.JF_DIST || path.join(RUNTIME, "dist", "fork"));
const problems = [], recorded = {};
let ran = 0;
for (const c of cases) {
  const fork = outcome(await runner.compileAndRun(c.src, { stdin: c.stdin ?? "", deadlineMs: 10000 }));
  const jdk = jdkOutcome(runJdk(c.src, c.stdin, path.join(WORK, c.id)));
  ran++;
  const entry = known[c.id];
  if (same(fork, jdk)) {
    if (entry) problems.push(`${c.id}: listed as a difference but now identical; delete its entry`);
    continue;
  }
  recorded[c.id] = { reason: entry?.reason ?? "UNEXPLAINED", fork, jdk };
  if (!entry) problems.push(`${c.id}: NEW difference\n    fork ${JSON.stringify(fork)}\n    jdk  ${JSON.stringify(jdk)}`);
  else if (!same(entry.fork, fork) || !same(entry.jdk, jdk)) problems.push(`${c.id}: the difference changed; re-record and review`);
  else if (!entry.reason || entry.reason === "UNEXPLAINED") problems.push(`${c.id}: listed without a reason`);
}
await runner.close();
for (const id of Object.keys(known)) if (!cases.some((c) => c.id === id)) problems.push(`${id}: listed but no such case`);
if (process.argv.includes("--record")) {
  fs.writeFileSync(LIST, JSON.stringify(recorded, null, 1) + "\n");
  console.log(`recorded ${Object.keys(recorded).length} differences to ${LIST}`);
}
for (const p of problems) console.log(`  !! ${p}`);
console.log(`${ran} cases, ${Object.keys(recorded).length} differing, ${problems.length} problem(s)`);
if (ran === 0) { console.log("no case ran at all"); process.exit(1); }
process.exit(problems.length ? 1 : 0);
```

- [ ] **Step 4: Run it with an empty list, expecting failure**

Run: `echo '{}' > runtime/test/known-differences.json && node runtime/test/differential.mjs`
Expected: exit 1 with one `NEW difference` line per case that differs (about 21, matching
`spike/2026-09-27/teavm-fork/results/differential.md`), and no problem for any `RF-*` case unless it
differs too (if one does, it stays listed and is fixed in Task 4 or 5).

- [ ] **Step 5: Record, then give every entry a reason**

Run: `node runtime/test/differential.mjs --record` (exit 1: every entry is `UNEXPLAINED`).
Edit each `reason` in `known-differences.json` into one sentence naming the cause and the task that
will fix it, using the spike's groups: exception message text (Task 4); unused throwing reads deleted
by the optimizer (known limitation); parse and `Scanner` messages (Task 4); two readers on piped input
(known limitation, the course reads through one reader); `%e` unsupported (known limitation, the course
does not use it); `Math.round(-2.5)`, `Float.MIN_VALUE`, `Math.log10` (Task 5); `System.exit` (Task 7).

Run: `node runtime/test/differential.mjs`
Expected: exit 0, `N cases, 21 differing, 0 problem(s)` (N is the case count).

- [ ] **Step 6: Prove the gate fails when it should**

Run each, expecting exit 1, and restore the file after each (`git checkout runtime/test/known-differences.json`):
1. Delete one entry: `NEW difference`.
2. Change one entry's `fork.stdout`: `the difference changed`.
3. Add `"G-hello-classic": {"reason": "x", "fork": {}, "jdk": {}}` for an identical case: `now identical`.
4. Build the variants and run the gate on the one without patch 0006:
   `bash runtime/build.sh --negatives && JF_DIST=runtime/.work/variants/fork-no-0006 node runtime/test/differential.mjs`:
   `NEW difference` on the formatting cases.

- [ ] **Step 7: Commit**

```bash
git add runtime/test/jdk.mjs runtime/test/differential.mjs runtime/test/known-differences.json runtime/test/cases.mjs
git commit -m "test(runtime): the fork is held to the pinned JDK, difference by difference"
```
The message names the four proofs from Step 6 and the exit code each produced.

---

### Task 3: a runner that survives any program (R1)

**Files:**
- Create: `runtime/test/runner-safety.mjs`
- Modify: `runtime/runner/node-runner.mjs`, `runtime/runner/tjava-core.mjs` (only if the output
  cap or trailing-output flush lives there), `runtime/test/known-differences.json` (only if a listed
  difference changes because trapped programs now print the JDK's line)

**Interfaces:**
- Consumes: `NodeRunner`.
- Produces: `NodeRunner` statuses gain `crashed`; for out-of-memory and stack exhaustion, `stderr`
  carries the line the JDK would print (`Exception in thread "main" java.lang.OutOfMemoryError:
  Java heap space`, `Exception in thread "main" java.lang.StackOverflowError`) where the JDK prints it:
  after anything the program already wrote to stderr, so first when it wrote nothing. The host process
  never dies because of a program.

- [ ] **Step 1: Write the failing test**

`runtime/test/runner-safety.mjs`:
```js
// Every way a beginner's program can run away must end in a readable result, and the next Run must work.
import { NodeRunner } from "../runner/node-runner.mjs";
const r = new NodeRunner(new URL("../dist/fork/", import.meta.url).pathname);
const results = [];
const check = (label, ok, got) => { results.push(ok); console.log(`  ${ok ? "ok  " : "FAIL"}  ${label}${ok ? "" : "  got " + JSON.stringify(got)}`); };
const run = (src, deadlineMs = 3000) => r.compileAndRun(src, { deadlineMs });
const next = async (label) => { const n = await run('void main() { IO.println("next"); }'); check(`${label}: the next Run works`, n.stdout === "next\n", n); };

let o = await run('void main() { IO.println("start"); while (true) {} }');
check("endless loop stops at the deadline, earlier output kept", o.status === "timeout" && o.stdout === "start\n", o);
await next("endless loop");

o = await run('void main() { while (true) IO.println("x"); }');
check("endless printing stops at the output cap", o.status === "output-limit", { status: o.status, len: o.stdout.length });
await next("endless printing");

o = await run("int down(int n) { return down(n + 1) + 1; } void main() { IO.println(down(0)); }");
check("endless recursion is reported as the JDK reports it",
  (o.stderr ?? "").startsWith('Exception in thread "main" java.lang.StackOverflowError'), o);
await next("endless recursion");

o = await run('void main() { IO.print("no newline at the end"); }');
check("output without a trailing newline still arrives", o.stdout === "no newline at the end", o);

// Last on purpose: before the fix this case kills the host process, which would hide every check after it.
o = await run('void main() { var l = new java.util.ArrayList<long[]>(); while (true) l.add(new long[1_000_000]); }', 20000);
check("running out of memory is reported as the JDK reports it",
  (o.stderr ?? "").startsWith('Exception in thread "main" java.lang.OutOfMemoryError'), o);
await next("out of memory");

await r.close();
console.log(results.every(Boolean) ? "\nthe runner survives every runaway" : `\n${results.filter((x) => !x).length} failed`);
process.exit(results.every(Boolean) && results.length === 9 ? 0 : 1);
```

- [ ] **Step 2: Run it and record which checks fail**

Run: `node runtime/test/runner-safety.mjs`
Expected: exit 1 (or the host process dying). From the spike's reproduction, the out-of-memory case
kills the host process (`ERR_WORKER_OUT_OF_MEMORY` as an unhandled `error` event), which is why it runs
last, and the recursion case is a trap without the JDK line. Note the exact trap messages printed; Step 3
maps them.

- [ ] **Step 3: Implement**

In `NodeRunner.run()`:
- Create the run worker with `resourceLimits: { maxOldGenerationSizeMb: 512 }` in the `Worker` options
  inside `spawn()` so memory exhaustion ends the worker instead of the machine.
- Add `w.on("error", (e) => finish("crashed", { message: String(e && e.code || e) }))` and
  `w.on("exit", (code) => { if (code !== 0) finish("crashed", { message: `exit ${code}` }); })`, so the
  promise always settles and the host survives. Attach both listeners when the worker is created in
  `spawn()`, not only once `run()` claims it: the spare worker waits idle between runs, and an `error`
  event with no listener on it would still kill the host. `finish` must settle once: `terminate()` at
  the deadline itself fires `exit` with a non-zero code, which must not turn a `timeout` into `crashed`.
- In `finish`, map the outcome to the JDK's line and append it to `stderr`, which is where the JDK prints
  it (the pinned JDK prints `before Exception in thread "main" java.lang.StackOverflowError` for
  `System.err.print("before ")` followed by endless recursion):

```js
// The JDK's own first line for failures that do not come back from the program as a Java exception.
export function javaLineFor(status, exception) {
  const m = String(exception?.message ?? "");
  if (status === "crashed" && /OUT_OF_MEMORY|out of memory/i.test(m))
    return 'Exception in thread "main" java.lang.OutOfMemoryError: Java heap space';
  if (/call stack|stack overflow|Maximum call stack/i.test(m))
    return 'Exception in thread "main" java.lang.StackOverflowError';
  return null;
}
```
Replace the regular expressions with the exact messages Step 2 printed, so nothing else matches by accident.
- If the no-newline check failed, flush the stdout buffer when the program ends, in the same place
  that posts the final `done` message.

- [ ] **Step 4: Run to green**

Run: `node runtime/test/runner-safety.mjs` then `node runtime/test/differential.mjs`
Expected: `the runner survives every runaway`, exit 0; the differential still exits 0. No case in
`cases.mjs` exercises stack exhaustion yet, so no entry should change; if the gate reports a listed
difference as changed, re-record it and review why.

- [ ] **Step 5: Commit**

```bash
git add runtime/runner runtime/test/runner-safety.mjs runtime/test/known-differences.json
git commit -m "fix(runtime): a runaway, out-of-memory or endlessly recursing program never takes the runner down"
```
The message records the failing output from Step 2 and that the host process survived out-of-memory
after the change.

---

### Task 4: JDK message text for the errors a first course shows (D11, clean room)

**Files:**
- Modify: `runtime/test/cases.mjs`, `runtime/test/known-differences.json`
- Create: `runtime/patches/teavm-0009-jdk-exception-messages.patch`

**Interfaces:**
- Consumes: the differential test (Task 2).
- Produces: no new API. Uncaught and caught messages match the pinned JDK for every case below.

- [ ] **Step 1: Add the cases, which are the specification**

Every case uses the value it computes: TeaVM's optimizer deletes an array read or a cast whose result is
unused, so a case that discards its result can pass for the wrong reason.

```js
const msg = (id, body) => ({ id: `D11-${id}`, group: "jdk-messages", src: `void main() { ${body} }` });
cases.push(
  msg("array-index-uncaught", "int[] a = new int[3]; IO.println(a[3]);"),
  msg("array-index-caught", "int[] a = new int[3]; try { a[-1] = 1; } catch (ArrayIndexOutOfBoundsException e) { IO.println(e.getMessage()); }"),
  msg("charAt", 'try { IO.println("abc".charAt(5)); } catch (StringIndexOutOfBoundsException e) { IO.println(e.getMessage()); }'),
  msg("substring", 'try { IO.println("abc".substring(2, 7)); } catch (StringIndexOutOfBoundsException e) { IO.println(e.getMessage()); }'),
  msg("parseInt-letters", 'try { IO.println(Integer.parseInt("12a")); } catch (NumberFormatException e) { IO.println(e.getMessage()); }'),
  msg("parseInt-empty", 'try { IO.println(Integer.parseInt("")); } catch (NumberFormatException e) { IO.println(e.getMessage()); }'),
  msg("parseInt-null", "String s = null; try { IO.println(Integer.parseInt(s)); } catch (NumberFormatException e) { IO.println(e.getMessage()); }"),
  msg("parseInt-overflow", 'try { IO.println(Integer.parseInt("99999999999")); } catch (NumberFormatException e) { IO.println(e.getMessage()); }'),
  msg("parseDouble", 'try { IO.println(Double.parseDouble("1.2.3")); } catch (NumberFormatException e) { IO.println(e.getMessage()); }'),
  msg("div-zero", "int z = 0; try { IO.println(5 / z); } catch (ArithmeticException e) { IO.println(e.getMessage()); }"),
  msg("mod-zero", "int z = 0; try { IO.println(5 % z); } catch (ArithmeticException e) { IO.println(e.getMessage()); }"),
  msg("cast", 'Object o = "text"; try { IO.println((Integer) o + 1); } catch (ClassCastException e) { IO.println(e.getMessage()); }'),
  msg("uncaught-custom-nested", 'class Oops extends RuntimeException { Oops(String m) { super(m); } } new Object() { void a() { b(); } void b() { throw new Oops("nested failure"); } }.a();'),
  msg("readln-at-end", "String s = IO.readln(); IO.println(s == null); IO.println(Integer.parseInt(s));"),
);
```

- [ ] **Step 2: Run the gate; it must fail on these cases**

Run: `node runtime/test/differential.mjs`
Expected: exit 1 with `NEW difference` for each case whose message text differs. Read the JDK's text
from the `jdk` side of each line: that output, and the Javadoc, are the only sources for Step 3.

- [ ] **Step 3: Implement in TeaVM's library, clean room**

Change the message construction in TeaVM's classlib (for example the `T`-prefixed classes behind array
and string index checks, `Integer.parseInt`, `Double.parseDouble`, integer division, and casts) so each
produces the JDK text observed in Step 2. Save the change as
`runtime/patches/teavm-0009-jdk-exception-messages.patch` with a header comment saying what it changes and
that it was written from observed JDK output only. If a message is built in the compiler rather than the
library (bounds checks inserted by strict mode), fix it there in the same patch.

How to make a patch that holds only the new change (Tasks 5 to 8 do the same). `build.sh` leaves the TeaVM
checkout (`runtime/.work/build/src/teavm`) at the pinned commit with every earlier patch applied as
uncommitted changes, so a bare `git diff` there would repeat patches 0001 to 0008 and then fail to apply
on top of them. Instead: run `bash runtime/build.sh` (default, `fork` only) so the checkout holds the whole
current series; record that state as a throwaway local commit in the clone
(`git -C runtime/.work/build/src/teavm add -A && git -C runtime/.work/build/src/teavm commit -qm base`);
make the change; write the patch with `git -C runtime/.work/build/src/teavm diff HEAD`, plus the header.
The throwaway commit never leaves the clone. Before the next build, put the clone back on the pinned
commit (`git -C runtime/.work/build/src/teavm checkout -q -f b3a245b7d9034ff35cdfab2def057a3d4f256efb`):
`build.sh` checks that the clone's HEAD is the pinned commit before it checks anything out, and refuses
to build from anywhere else. The build then applies the full series from `runtime/patches/`, which is
what proves the new patch applies in order. The overlay compiles only `core` and `classlib` sources under
`src/main/java`, so a change anywhere else in TeaVM never reaches the build.

Every patch must also apply, and the build succeed, with any single earlier patch left out:
`build.sh --negatives` builds each `fork-no-NNNN` from the series minus that one patch, and the negative
proofs need all of them. So a new patch never edits lines an earlier patch added. Where a fix depends on
an earlier patch's code, reach it without touching that patch's lines (Task 4's cast message does this
for patch 0008), and say so in the header.

- [ ] **Step 4: Rebuild and run to green**

Run: `bash runtime/build.sh && node runtime/test/differential.mjs`
Expected: exit 0. Delete the entries that became identical (the gate names them). Any case that still
differs stays listed only with a reason explaining why the course never shows it.

- [ ] **Step 5: Prove the patch is necessary**

Run: `bash runtime/build.sh --negatives && JF_DIST=runtime/.work/variants/fork-no-0009 node runtime/test/differential.mjs`
Expected: exit 1, with `NEW difference` on the D11 cases.

- [ ] **Step 6: Commit**

```bash
git add runtime/patches/teavm-0009-jdk-exception-messages.patch runtime/test/cases.mjs runtime/test/known-differences.json
git commit -m "fix(runtime): runtime errors carry the JDK's own message text"
```
The message says the patch was written from observed JDK output only, and names the negative proof.

---

### Task 5: numeric fidelity (Javadoc-specified)

**Files:**
- Modify: `runtime/test/cases.mjs`, `runtime/test/known-differences.json`
- Create: `runtime/patches/teavm-0010-math-fidelity.patch`

- [ ] **Step 1: Add the cases**

```js
cases.push(
  { id: "D11-round-halves", group: "numeric", src: "void main() { for (double d : new double[] { -2.5, -1.5, -0.5, 0.5, 1.5, 2.5 }) IO.println(Math.round(d)); }" },
  { id: "D11-float-min", group: "numeric", src: "void main() { IO.println(Float.MIN_VALUE); IO.println(Float.MIN_NORMAL); IO.println(Double.MIN_VALUE); }" },
  { id: "D11-log10-powers", group: "numeric", src: "void main() { for (int n = -3; n <= 6; n++) IO.println(Math.log10(Math.pow(10, n))); }" },
);
```

- [ ] **Step 2: Run the gate and see it fail**

Run: `node runtime/test/differential.mjs`
Expected: exit 1, `NEW difference` on `D11-round-halves`, `D11-float-min` and `D11-log10-powers` (and
the existing known-differences entries for `Math.round`, `Float.MIN_VALUE` and `Math.log10` stay listed
until Step 4).

- [ ] **Step 3: Implement from the Javadoc**

- `Math.round(double)`: the Javadoc defines it as the closest `long` with ties rounding toward positive
  infinity, so `-2.5` gives `-2`.
- `Float.MIN_VALUE`: the constant is `0x0.000002P-126f`; `Float.toString` must print `1.4E-45`.
- `Math.log10`: the Javadoc guarantees that if the argument is `10^n` for integer `n`, the result is `n`.

Save the change as `runtime/patches/teavm-0010-math-fidelity.patch`, made as in Task 4 Step 3.

- [ ] **Step 4: Rebuild and run to green**

Run: `bash runtime/build.sh && node runtime/test/differential.mjs`
Expected: exit 0 after deleting every entry the gate reports as now identical.

- [ ] **Step 5: Prove the patch is necessary**

Run: `bash runtime/build.sh --negatives && JF_DIST=runtime/.work/variants/fork-no-0010 node runtime/test/differential.mjs`
Expected: exit 1 on the three numeric cases.

- [ ] **Step 6: Commit**

```bash
git add runtime/patches/teavm-0010-math-fidelity.patch runtime/test/cases.mjs runtime/test/known-differences.json
git commit -m "fix(runtime): Math.round, Float.MIN_VALUE and Math.log10 as the Javadoc specifies"
```

---

### Task 6: `HashMap` and `HashSet` order match the JDK (D12, clean room, tests only here)

**Files:**
- Create: `runtime/test/hash-order.mjs`
- Create (by a clean-room implementer): `runtime/patches/teavm-0011-hash-order.patch`

**Interfaces:**
- Consumes: `NodeRunner`, `runJdk`, `checkJdk`.
- Produces: `node runtime/test/hash-order.mjs`, exit 0 only when every program prints identically.

- [ ] **Step 1: Write the test**

`runtime/test/hash-order.mjs`:
```js
// Black-box: generated programs exercise every insertion path, several resizes and colliding keys,
// and print every iteration view. The pinned JDK's output is the only oracle.
import path from "node:path";
import { NodeRunner } from "../runner/node-runner.mjs";
import { checkJdk, runJdk } from "./jdk.mjs";
const RUNTIME = path.resolve(new URL("..", import.meta.url).pathname);
const views = "IO.println(m); IO.println(m.keySet()); IO.println(m.values()); IO.println(m.entrySet()); m.forEach((k, v) -> IO.print(k + \"=\" + v + \";\")); IO.println();";
const words = `"the cat sat on the mat by the door and a dog ran in the yard while birds sang"`;
// "Aa" and "BB" share a hash code, so every string built from them collides: 2^n keys, one bucket.
const collide = (n) => `String[] parts = {"Aa", "BB"}; java.util.List<String> keys = new java.util.ArrayList<>(); keys.add(""); for (int i = 0; i < ${n}; i++) { var nx = new java.util.ArrayList<String>(); for (String k : keys) for (String p : parts) nx.add(k + p); keys = nx; }`;
const programs = {
  put: `var m = new java.util.HashMap<String, Integer>(); for (String w : ${words}.split(" ")) m.put(w, m.getOrDefault(w, 0) + 1); ${views}`,
  merge: `var m = new java.util.HashMap<String, Integer>(); for (String w : ${words}.split(" ")) m.merge(w, 1, Integer::sum); ${views}`,
  compute: `var m = new java.util.HashMap<String, Integer>(); for (String w : ${words}.split(" ")) m.compute(w, (k, v) -> v == null ? 1 : v + 1); ${views}`,
  computeIfAbsent: `var m = new java.util.HashMap<String, Integer>(); for (String w : ${words}.split(" ")) m.computeIfAbsent(w, String::length); ${views}`,
  putIfAbsent: `var m = new java.util.HashMap<String, Integer>(); for (String w : ${words}.split(" ")) m.putIfAbsent(w, w.length()); ${views}`,
  removeReadd: `var m = new java.util.HashMap<String, Integer>(); for (String w : ${words}.split(" ")) m.put(w, 1); m.remove("cat"); m.remove("the"); m.put("the", 2); m.put("cat", 3); ${views}`,
  integers: `var m = new java.util.HashMap<Integer, Integer>(); for (int i = -40; i < 300; i += 7) m.put(i * 31, i); ${views}`,
  resizes: `var m = new java.util.HashMap<String, Integer>(); for (int i = 0; i < 2000; i++) m.put("k" + (i * 7919 % 2003), i); IO.println(m.keySet().stream().limit(40).toList()); int h = 0; for (String k : m.keySet()) h = 31 * h + k.hashCode(); IO.println(h);`,
  capacity: `var m = new java.util.HashMap<String, Integer>(3); for (String w : ${words}.split(" ")) m.put(w, 1); ${views}`,
  collidingSmall: `${collide(3)} var m = new java.util.HashMap<String, Integer>(); for (String k : keys) m.put(k, k.length()); ${views}`,
  collidingTreeified: `${collide(6)} var m = new java.util.HashMap<String, Integer>(); for (int i = 0; i < 100; i++) m.put("pad" + i, i); for (String k : keys) m.put(k, 1); IO.println(m.keySet());`,
  hashSet: `var s = new java.util.HashSet<String>(); for (String w : ${words}.split(" ")) s.add(w); s.remove("dog"); s.add("zebra"); IO.println(s); for (String w : s) IO.print(w + " "); IO.println();`,
  nonAscii: `var m = new java.util.HashMap<String, Integer>(); for (String w : "café naïve résumé jalapeño 😀 Ωμέγα".split(" ")) m.put(w, w.length()); ${views}`,
};
checkJdk();
const runner = new NodeRunner(process.env.JF_DIST || path.join(RUNTIME, "dist", "fork"));
let bad = 0;
for (const [name, body] of Object.entries(programs)) {
  const src = `void main() { ${body} }`;
  const fork = await runner.compileAndRun(src, { deadlineMs: 20000 });
  const jdk = runJdk(src, "", path.join(RUNTIME, ".work", "hash-order", name));
  const ok = fork.status === "ok" && jdk.status === "ok" && fork.stdout === jdk.stdout;
  if (!ok) bad++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${name}${ok ? "" : `\n        fork: ${JSON.stringify(fork.stdout.slice(0, 200))} (${fork.status})\n        jdk : ${JSON.stringify(jdk.stdout.slice(0, 200))} (${jdk.status})`}`);
}
await runner.close();
console.log(bad ? `\n${bad} program(s) iterate differently from the JDK` : "\nHashMap and HashSet iterate exactly as the JDK does");
process.exit(bad ? 1 : 0);
```

- [ ] **Step 2: Run it; expect failures**

Run: `node runtime/test/hash-order.mjs`
Expected: exit 1 (the spike showed `HashMap` printing in a different order).

- [ ] **Step 3: Implement, clean room**

Hand this step to an implementer who has not read OpenJDK's `HashMap` source (a fresh subagent is
clean by construction). Their only inputs: this test, the pinned JDK's outputs, and the public Javadoc
for `HashMap`, `HashSet` and `Object.hashCode`. They change TeaVM's `THashMap` (and `THashSet` if it is
not backed by it) until every program prints what the JDK prints, and save the diff as
`runtime/patches/teavm-0011-hash-order.patch` (made as in Task 4 Step 3) with a header recording how it
was derived.

- [ ] **Step 4: Rebuild and run to green**

Run: `bash runtime/build.sh && node runtime/test/hash-order.mjs && node runtime/test/differential.mjs`
Expected: `HashMap and HashSet iterate exactly as the JDK does`, exit 0; the differential still exits 0.

- [ ] **Step 5: Prove the patch is necessary**

Run: `bash runtime/build.sh --negatives && JF_DIST=runtime/.work/variants/fork-no-0011 node runtime/test/hash-order.mjs`
Expected: exit 1.

- [ ] **Step 6: Commit**

```bash
git add runtime/patches/teavm-0011-hash-order.patch runtime/test/hash-order.mjs
git commit -m "fix(runtime): HashMap and HashSet iterate in the JDK's order"
```
The message records who wrote the patch and that they had not read OpenJDK's HashMap source.

---

### Task 7: the remaining exception gaps

**Files:**
- Modify: `runtime/test/cases.mjs`, `runtime/test/known-differences.json`
- Create: `runtime/patches/teavm-0012-throwable-gaps.patch` (only for what is fixed), and for 7b below,
  `runtime/patches/teavm-0013-compiler-gaps.patch` and/or `runtime/patches/teavm-javac-0104-<name>.patch`
  for fixes outside TeaVM's library (its code generator, or the classlib javac compiles against)

**Done in two parts.** The cases below grew while Tasks 4 to 6 ran, and they fall into two kinds that
need different work, so Task 7 is executed as two dispatches, each with its own review and commit:
- **7a, the library:** `G7-getSuppressed`, `G7-twr-both-throw`, `G7-array-store` (stays listed),
  `G7-negative-size`, `G7-system-exit`, the `G7-arraylist-*` and `G7-stringbuilder-*` cases, and
  `G7-cast-temp`, into `teavm-0012-throwable-gaps.patch`. 7a adds the whole Step 1 block, and lists each
  7b case that differs with the reason "fixed or listed in Task 7b", so the gate stays green.
- **7b, the compiler and the compile classlib:** `G7-joining`, `G7-nan-compare`, `G7-negative-zero`,
  `G7-map-entry` and `G7-suppress-warnings`, into `teavm-0013-compiler-gaps.patch` (TeaVM core) and/or
  a `teavm-javac-0104-*.patch` (teavm-javac; `build.sh` picks up any `teavm-javac-01NN` file, and
  `--negatives` builds a `fork-no-0104` for it). 7b replaces the placeholder reasons 7a wrote.

- [ ] **Step 1: Add the cases**

```js
cases.push(
  { id: "G7-getSuppressed", group: "gaps", src: 'void main() { try { throw new RuntimeException("plain"); } catch (RuntimeException e) { IO.println(e.getSuppressed().length); } }' },
  { id: "G7-twr-both-throw", group: "gaps", src: 'void main() { class R implements AutoCloseable { public void close() { throw new IllegalStateException("close"); } } try (R r = new R()) { throw new RuntimeException("body"); } catch (RuntimeException e) { IO.println(e.getMessage() + " / " + e.getSuppressed().length); } }' },
  { id: "G7-joining", group: "gaps", src: 'void main() { IO.println(java.util.List.of("a", "b").stream().map(String::toUpperCase).collect(java.util.stream.Collectors.joining(", "))); }' },
  { id: "G7-array-store", group: "gaps", src: 'void main() { Object[] a = new String[2]; try { a[0] = 1; } catch (ArrayStoreException e) { IO.println("caught"); } }' },
  { id: "G7-negative-size", group: "gaps", src: "void main() { int n = -1; try { IO.println(new int[n].length); } catch (NegativeArraySizeException e) { IO.println(e.getMessage()); } }" },
  { id: "G7-system-exit", group: "gaps", src: 'void main() { IO.println("before"); System.exit(0); }' },
  // Index errors a first course meets outside arrays and strings (chapter 7 teaches ArrayList), found
  // missing their JDK text while doing Task 4, plus a cast whose operand is not a local variable, which
  // pins the second path teavm-0009 uses to find the cast value.
  { id: "G7-arraylist-get", group: "gaps", src: 'void main() { var l = new java.util.ArrayList<Integer>(java.util.List.of(1, 2)); try { IO.println(l.get(5)); } catch (IndexOutOfBoundsException e) { IO.println(e.getMessage()); } }' },
  { id: "G7-arraylist-set", group: "gaps", src: 'void main() { var l = new java.util.ArrayList<Integer>(java.util.List.of(1, 2)); try { IO.println(l.set(2, 9)); } catch (IndexOutOfBoundsException e) { IO.println(e.getMessage()); } }' },
  { id: "G7-arraylist-remove", group: "gaps", src: 'void main() { var l = new java.util.ArrayList<Integer>(java.util.List.of(1, 2)); try { IO.println(l.remove(-1)); } catch (IndexOutOfBoundsException e) { IO.println(e.getMessage()); } }' },
  { id: "G7-stringbuilder-charAt", group: "gaps", src: 'void main() { var b = new StringBuilder("abc"); try { IO.println(b.charAt(3)); } catch (IndexOutOfBoundsException e) { IO.println(e.getClass().getName() + ": " + e.getMessage()); } }' },
  { id: "G7-stringbuilder-deleteCharAt", group: "gaps", src: 'void main() { var b = new StringBuilder("abc"); try { IO.println(b.deleteCharAt(3)); } catch (IndexOutOfBoundsException e) { IO.println(e.getClass().getName() + ": " + e.getMessage()); } }' },
  { id: "G7-cast-temp", group: "gaps", src: 'void main() { try { IO.println((String) (Object) Integer.valueOf(4)); } catch (ClassCastException e) { IO.println(e.getMessage()); } }' },
  // Found while doing Task 5: the fork evaluates NaN < x and NaN <= x as true, so a comparison gives the
  // wrong answer, which is worse than a wrong message. And a -0.0 literal loses its sign.
  { id: "G7-nan-compare", group: "gaps", src: "void main() { double n = 0.0 / 0.0; double one = 1; IO.println(n < one); IO.println(n <= one); IO.println(n > one); IO.println(n >= one); IO.println(n == n); IO.println(n != n); IO.println(one < n); IO.println(Math.max(n, one)); }" },
  { id: "G7-negative-zero", group: "gaps", src: "void main() { double z = -0.0; IO.println(z); IO.println(1 / z); IO.println(0.0 == -0.0); }" },
  // Found while doing Task 6: Map.Entry cannot be named as a type on the fork ("cannot find symbol class
  // Entry"), so chapter 9's usual loop over entrySet() does not compile; and any @SuppressWarnings
  // annotation crashes the compiler.
  { id: "G7-map-entry", group: "gaps", src: 'void main() { var m = new java.util.TreeMap<String, Integer>(java.util.Map.of("a", 1, "b", 2)); for (java.util.Map.Entry<String, Integer> e : m.entrySet()) IO.println(e.getKey() + "=" + e.getValue()); }' },
  { id: "G7-suppress-warnings", group: "gaps", src: '@SuppressWarnings("unchecked") void main() { IO.println("ok"); }' },
);
```

- [ ] **Step 2: Run the gate and see it fail**

Run: `node runtime/test/differential.mjs`
Expected: exit 1, a `NEW difference` line for each `G7-*` case that differs from the JDK.

- [ ] **Step 3: Fix what the course or its readers will meet; list the rest**

Fix (Javadoc and observed output only): `getSuppressed()` returning an empty array rather than throwing,
the try-with-resources message when body and `close()` both throw, `NegativeArraySizeException`,
`System.exit` (the program ends; the runner reports exit status), and the JDK's text (and exception
class) for the `ArrayList` and `StringBuilder` index errors. `G7-cast-temp` should already match after
Task 4; if it does not, fix it here. `NaN` comparisons are a code-generator bug, not a library
difference: fix them if the fix is contained (a genuine bug fix, so it also joins the give-back list,
D13); otherwise list the case with its reason and the give-back entry. `G7-negative-zero` gets the same
treatment. Like `Collectors.joining`, each of these two gets at most two hours. `G7-map-entry` must be
fixed: chapter 9 loops over `entrySet()` with `Map.Entry`, the idiom every Java course teaches (it is a
compile-time gap, so look first at how teavm-javac builds its compile classlib and whether nested types
reach it). `G7-suppress-warnings` gets two hours; if it is not fixed, list it (the course has no reason
to use the annotation). Spend at most two hours on
`Collectors.joining`, which crashes TeaVM's compiler; if it is not fixed by then, list it with the
reason "crashes TeaVM 0.13.1's code generator; not used by the course; offered upstream (D13)" and add
it to the give-back list in the worksheet. `ArrayStoreException` stays listed: the course never stores
into a covariant array. Save what is fixed as `runtime/patches/teavm-0012-throwable-gaps.patch`, made as in
Task 4 Step 3.

- [ ] **Step 4: Rebuild and run to green**

Run: `bash runtime/build.sh && node runtime/test/differential.mjs`
Expected: exit 0; the fixed `G7-*` cases are identical, the rest are listed with their reasons.

- [ ] **Step 5: Prove the patch is necessary**

Run: `bash runtime/build.sh --negatives && JF_DIST=runtime/.work/variants/fork-no-0012 node runtime/test/differential.mjs`
Expected: exit 1 on the fixed `G7-*` cases.

- [ ] **Step 6: Commit**

```bash
git add runtime/patches/teavm-0012-throwable-gaps.patch runtime/test/cases.mjs runtime/test/known-differences.json
git commit -m "fix(runtime): getSuppressed, try-with-resources, negative array sizes and System.exit behave as in the JDK"
```

---

### Task 8: `Random` holds steady within one Run (D16)

**Files:**
- Create: `runtime/test/random-seed.mjs`
- Modify: `runtime/runner/node-runner.mjs` (a `randomSeed` option), `runtime/runner/worker-protocol.mjs`
  (`runWorker` passes it on), `runtime/runner/tjava-core.mjs` (`runProgram` installs the seeded source),
  `runtime/test/cases.mjs` (one case), and `runtime/patches/teavm-0014-random.patch`

**Found before this task started:** TeaVM's `TRandom` ignores its seed. Its seeded constructor and
`setSeed` do nothing, and every method draws from `Math.random()`, so `new Random(42)` prints different
numbers on every run where the JDK prints the same ones (fork: `23 48 8 52 2` then `68 11 17 15 97`; JDK,
every time: `30 63 48 84 70` for five `nextInt(100)`). The `java.util.Random` Javadoc specifies its
algorithms exactly and requires every Java implementation to use them, so this is a fidelity fix written
from the Javadoc (clean room, D14, as in Tasks 4 to 7). It also settles D16's design: once `Random` is the
Javadoc's generator, `new Random()` and `Math.random()` need only a default seed, and the host supplies
it per Run.

**Interfaces:**
- Produces: `compileAndRun(src, { randomSeed })`; two runs with the same `randomSeed` print identical
  `new Random()` and `Math.random()` sequences; different seeds differ. Plan 3's replay passes one seed
  per Run. `new Random(seed)` prints exactly the JDK's numbers whatever `randomSeed` is.

- [ ] **Step 1: Write the failing test**

`runtime/test/random-seed.mjs`:
```js
import { NodeRunner } from "../runner/node-runner.mjs";
const r = new NodeRunner(new URL("../dist/fork/", import.meta.url).pathname);
const src = 'void main() { var g = new java.util.Random(); for (int i = 0; i < 5; i++) IO.print(g.nextInt(1000) + " "); IO.println(Math.random()); }';
// Status too, not only stdout: a run that crashed after printing part of its line would still replay the
// same prefix, and the test must not pass for that reason.
const run = (seed) => r.compileAndRun(src, { randomSeed: seed }).then((o) => o.status === "ok" ? o.stdout : `(${o.status}) ${o.stdout}`);
const a1 = await run(42), a2 = await run(42), b = await run(43);
await r.close();
const same = a1 === a2 && !a1.startsWith("("), differ = a1 !== b;
console.log(`  ${same ? "ok  " : "FAIL"}  the same seed replays the same numbers (${JSON.stringify(a1)} / ${JSON.stringify(a2)})`);
console.log(`  ${differ ? "ok  " : "FAIL"}  a different seed gives different numbers`);
process.exit(same && differ ? 0 : 1);
```

Run: `node runtime/test/random-seed.mjs`
Expected: exit 1 (no `randomSeed` option yet, so runs differ).

Append to `runtime/test/cases.mjs`, so the differential holds the seeded generator to the JDK:
```js
cases.push(
  { id: "R8-default-random", group: "random", src: 'void main() { double d = Math.random(); var g = new java.util.Random(); int k = g.nextInt(10); IO.println(d >= 0 && d < 1 && k >= 0 && k < 10); }' },
  { id: "R8-seeded-random", group: "random", src: 'void main() { var r = new java.util.Random(42); for (int i = 0; i < 5; i++) IO.print(r.nextInt(100) + " "); IO.println(); IO.println(r.nextInt()); IO.println(r.nextLong()); IO.println(r.nextDouble()); IO.println(r.nextFloat()); IO.println(r.nextBoolean()); IO.println(r.nextGaussian()); IO.println(r.nextInt(5, 10)); r.setSeed(7); IO.println(r.nextInt(1 << 20)); }' },
);
```
Run: `node runtime/test/differential.mjs`. Expected: exit 1, `NEW difference` on `R8-seeded-random`.

- [ ] **Step 2: Find where the fork's `Random` gets its seed**

Run: `grep -rn "seed\|nanoTime\|random()" runtime/.work/build/src/teavm/classlib/src/main/java/org/teavm/classlib/java/util/TRandom.java`
(This is TeaVM's own Apache-2.0 source, not OpenJDK; reading it is allowed.)

- [ ] **Step 3: Implement `Random` from its Javadoc, seeded from the host**

Rewrite TeaVM's `TRandom` so the seeded constructor, `setSeed`, `next(bits)` and every public method the
Javadoc defines in terms of them (`nextInt()`, `nextInt(bound)`, `nextInt(origin, bound)`, `nextLong`,
`nextBoolean`, `nextFloat`, `nextDouble`, `nextGaussian`, `nextBytes`) follow the algorithms the Javadoc
states, and nothing else: the Javadoc and the pinned JDK's output are the only sources. Then give the
no-argument constructor (and `Math.random()`, which the Javadoc defines as drawing from one `new Random()`
made on first use) a default seed that comes from the host: a host import the run worker answers with
the Run's `randomSeed`, or with fresh randomness when none is given. Save the change as
`runtime/patches/teavm-0014-random.patch`, made as in Task 4 Step 3.

The seed travels one path, and the host side lives in the shared `tjava-core.mjs`, which the browser's run
worker imports unchanged, so Plan 3 gets the same behavior: `NodeRunner.run()` takes `randomSeed` from its
options and puts it in the `run` message; `runWorker` in `worker-protocol.mjs` passes `msg.randomSeed` to
`runProgram`; `runProgram` answers the host import in `installImports`.

- [ ] **Step 4: Run to green**

Run: `bash runtime/build.sh && node runtime/test/random-seed.mjs && node runtime/test/differential.mjs`
Expected: all exit 0; `R8-seeded-random` is identical to the JDK.

Then prove the patch is necessary: `bash runtime/build.sh --negatives && JF_DIST=runtime/.work/variants/fork-no-0014 node runtime/test/differential.mjs`
Expected: exit 1 on `R8-seeded-random`.

- [ ] **Step 5: Commit**

```bash
git add runtime/runner runtime/test/random-seed.mjs runtime/test/cases.mjs runtime/patches/teavm-0014-random.patch
git commit -m "feat(runtime): a Run can fix its random seed, so replayed input sees the same numbers"
```

---

### Task 9: a checksummed release with its licenses and source

**Files:**
- Create: `runtime/release/package.sh` (which also writes each release's `NOTICE`), `runtime/release/verify.sh`,
  `runtime/CHECKSUMS` (generated, tracked)

**Interfaces:**
- Produces: `bash runtime/release/package.sh <version>` writes
  `runtime/.work/release/<version>/` containing the six runtime files from `runtime/dist/fork` (every
  file the runner loads; not `manifest.json`, whose build time changes on every build), `CHECKSUMS`, `NOTICE`,
  `LICENSE-Apache-2.0.txt`, `LICENSE-GPLv2-CE.txt`, `SOURCES.txt`, and the corresponding source
  archive; also writes the tracked `runtime/CHECKSUMS`. `bash runtime/release/verify.sh <dir>` exits 0
  when every file matches `runtime/CHECKSUMS`, 1 when one differs, 2 when one is missing. Plan 2's
  build calls `verify.sh` logic.

- [ ] **Step 1: Write `verify.sh` and its negative proof first**

`runtime/release/verify.sh`:
```bash
#!/bin/sh
# Verify a runtime directory against runtime/CHECKSUMS. 0 = all match, 1 = a file differs, 2 = missing.
set -eu
dir="${1:?usage: verify.sh <dir>}"
sums="$(dirname "$0")/../CHECKSUMS"
# set -e does not fire when the redirection on a `while ... done < file` fails (bash 3.2, macOS /bin/sh),
# so a missing CHECKSUMS would fall through the empty loop and exit 0.
[ -f "$sums" ] || { echo "missing: $sums" >&2; exit 2; }
status=0
while read -r want name; do
  [ -n "$name" ] || continue
  if [ ! -f "$dir/$name" ]; then echo "missing: $name" >&2; status=2; continue; fi
  got=$(shasum -a 256 "$dir/$name" | cut -d' ' -f1)
  if [ "$got" != "$want" ]; then echo "DIFFERS: $name" >&2; [ "$status" -eq 2 ] || status=1; fi
done < "$sums"
exit "$status"
```
Run: `bash runtime/release/verify.sh runtime/dist/fork`
Expected: non-zero (no `runtime/CHECKSUMS` yet). A missing file outranks a differing one: when both
happen, the exit is 2.

- [ ] **Step 2: Write `package.sh`**

It must: (1) copy the six runtime files from `runtime/dist/fork/` into the release directory; (2) write
`CHECKSUMS` there and to `runtime/CHECKSUMS` with `shasum -a 256` over the six files, bare file names,
sorted by name; (3) copy `LICENSE` from
the repository root as `LICENSE-Apache-2.0.txt`, and fetch OpenJDK's `LICENSE` at
`https://raw.githubusercontent.com/openjdk/jdk25u/$JDK25U_REVISION/LICENSE` as `LICENSE-GPLv2-CE.txt`;
(4) write `SOURCES.txt` listing the pinned commits from `pins.env`, the URL and SHA-256 of the jdk25u
source zip teavm-javac's build downloads (read it from `runtime/.work` after a build), and the SHA-256
of each patch; (5) create `source.tar.gz` holding `runtime/patches/`, `runtime/overlay/`,
`runtime/build.sh`, `runtime/pins.env` and the jdk25u source zip; (6) write `NOTICE` stating what each
file is and its license: TeaVM and teavm-javac (Apache-2.0; teavm-javac's own repository has no license
file, only its README's statement, noted as such), OpenJDK `javac` and class library parts (GPLv2 with
the Classpath Exception), our patches (Apache-2.0).

- [ ] **Step 3: Package, verify, and prove the verifier fails**

Run: `bash runtime/release/package.sh 2026.09.27-1 && bash runtime/release/verify.sh runtime/dist/fork`
Expected: exit 0.
Then: flip one byte of a copy (`cp -r runtime/dist/fork runtime/.work/tamper && printf 'x' | dd of=runtime/.work/tamper/compiler.wasm bs=1 seek=100 conv=notrunc`) and verify it: exit 1, `DIFFERS: compiler.wasm`. Delete one file from another copy: exit 2, `missing:`.
Delete a file from the tampered copy as well (one missing, one differing): exit 2.

- [ ] **Step 4: Commit**

```bash
git add runtime/release runtime/CHECKSUMS
git commit -m "feat(runtime): a checksummed release with its licenses and corresponding source"
```
The message records both negative proofs (exit 1 on a flipped byte, exit 2 on a missing file).

Publishing the release anywhere is outward-facing and is not part of this plan: it waits for the
author's go-ahead.

---

### Task 10: reproducibility probe (goal, not a blocker)

**Files:** none unless a fix is found; findings go in the worksheet.

- [ ] **Step 1: Build twice from clean and compare**

```bash
bash runtime/build.sh && shasum -a 256 runtime/dist/fork/* > runtime/.work/build-a.sha
rm -rf runtime/.work/build runtime/dist && bash runtime/build.sh && shasum -a 256 runtime/dist/fork/* > runtime/.work/build-b.sha
diff runtime/.work/build-a.sha runtime/.work/build-b.sha
```
Expected, from the spike: only `compiler.wasm` differs.

- [ ] **Step 2: Locate the difference (two hours at most)**

Compare the two `compiler.wasm` files byte by byte (`cmp -l a b | head`), find which WebAssembly
section holds the first differing offset, and look for an unordered collection or a timestamp in
TeaVM's code generator that feeds it. If found, fix it as a patch, and add a test to `runtime/test/`
that builds twice and requires identical checksums. If not, record what was learned in the worksheet
and leave the goal open (DESIGN.md section 7 already says a rebuild is accepted by behavior until then).

- [ ] **Step 3: Put the released bytes back**

The rebuilds replaced `runtime/dist/fork`, and `compiler.wasm` is not reproducible, so it no longer
matches `runtime/CHECKSUMS`. Copy the six runtime files back from `runtime/.work/release/<version>/`
(Task 9), then run `bash runtime/release/verify.sh runtime/dist/fork`. Expected: exit 0. Every later test
then runs on the bytes the checksums pin. (If Step 2 found a fix, the release is rebuilt and repackaged
in Step 4 instead.)

- [ ] **Step 4: Commit, only if Step 2 found a fix**

```bash
git add runtime/patches/<the new patch> runtime/test/<the new test> runtime/CHECKSUMS
git commit -m "fix(runtime): compiler.wasm builds byte for byte the same twice"
```
The message names the section and offset where the builds differed, the cause, and how the new test was
seen to fail before the fix. Rerun `package.sh` so `runtime/CHECKSUMS` pins the reproducible bytes. If
Step 2 found nothing, the worksheet entry is the record and there is no commit.

---

### Task 11 (addendum, 2026-09-28): `StrictMath.log` from fdlibm (D32)

Added after Plan 1 finished, on the author's decisions D32 (fdlibm from netlib is an allowed clean-room source for
`StrictMath`) and "before Plan 2". Task 8 found that `Random.nextGaussian` differs from the JDK in the last digit
on about 0.75% of values, because TeaVM's `StrictMath.log` is JavaScript's `Math.log`, while the JDK's
`StrictMath` is specified by fdlibm (its Javadoc names the library and says the results must match it).

**Files:**
- Modify: `runtime/test/cases.mjs` (cases below), `runtime/release/package.sh` (NOTICE names fdlibm and carries its
  notice), `runtime/CHECKSUMS` (repackaged)
- Create: `runtime/patches/teavm-0015-strictmath-fdlibm.patch`

**Clean room for this task:** read netlib's fdlibm C sources (`https://www.netlib.org/fdlibm/`, e.g. `e_log.c`)
and the public Javadoc of `StrictMath` and `Random`; run the pinned JDK. Never open OpenJDK's Java translation of
fdlibm (`FdLibm.java`) or any other OpenJDK source, including `StrictMath.java`. fdlibm's copyright and permission
notice (Sun Microsystems, 1993: use, copy, modify and distribute freely, provided the notice is preserved) goes,
verbatim, into the ported file and into the release NOTICE.

- [ ] **Step 1: Add the cases, which must use their results**

```js
cases.push(
  { id: "R11-strictmath-log", group: "fdlibm", src: 'void main() { long h = 17; for (int i = 1; i <= 20000; i++) { double x = i * 0.0137 + 1e-300 * i; h = 31 * h + Double.doubleToLongBits(StrictMath.log(x)); } IO.println(h); IO.println(StrictMath.log(0.0)); IO.println(StrictMath.log(-1.0)); IO.println(StrictMath.log(Double.MIN_VALUE)); IO.println(StrictMath.log(Double.MAX_VALUE)); IO.println(StrictMath.log(1.0)); IO.println(StrictMath.log(Math.E)); }' },
  { id: "R11-gaussian", group: "fdlibm", src: 'void main() { var r = new java.util.Random(2026); long h = 17; for (int i = 0; i < 20000; i++) h = 31 * h + Double.doubleToLongBits(r.nextGaussian()); IO.println(h); }' },
  // e_log.c's near-1 and subnormal branches, which the sweep above never reaches (review of Task 11).
  // Written 1.0 / (1L << 52), not 0x1p-52: the fork compiles hexadecimal float literals to NaN (a separate
  // difference), which would keep these inputs from ever reaching log.
  { id: "R11-strictmath-log-edges", group: "fdlibm", src: 'void main() { double u = 1.0 / (1L << 52); long h = 17; for (int j = 1; j <= 4000; j++) { h = 31 * h + Double.doubleToLongBits(StrictMath.log(1 + j * u)); h = 31 * h + Double.doubleToLongBits(StrictMath.log(1 - j * (u / 2))); h = 31 * h + Double.doubleToLongBits(StrictMath.log(Double.MIN_VALUE * j)); } IO.println(h); }' },
  { id: "R11-math-log", group: "fdlibm", src: 'void main() { long h = 17; for (int i = 1; i <= 20000; i++) h = 31 * h + Double.doubleToLongBits(Math.log(i * 0.0137)); IO.println(h); IO.println(Math.log(10)); IO.println(Math.log(0.5)); }' },
);
```
Run: `node runtime/test/differential.mjs`. Expected: exit 1, `NEW difference` on both cases (record the fork and
JDK values in the report).

- [ ] **Step 2: Port `__ieee754_log` from netlib's `e_log.c` into TeaVM's `TStrictMath.log`**

Only `log`: it is what `nextGaussian` needs. `Math.log` uses the same port (author's decision D33): on the
pinned JDK `Math.log` equals fdlibm's result on every input checked (15 million), while the fork's was
JavaScript's `Math.log`, which differed in the last digit on 29 of 20,000 inputs and can vary by browser engine.
Both changes go in one patch, because a separate patch for `Math.log` would call code this one adds, and the
build without this patch (the negative proof) could not compile. Save as `teavm-0015-strictmath-fdlibm.patch`
with the recipe in Task 4 Step 3; the header names netlib's `e_log.c` as the source, carries its notice, and says
no OpenJDK source was read. Other `StrictMath` functions are ported only when a course example needs them (D34).

- [ ] **Step 3: Rebuild and run to green**

Run: `bash runtime/build.sh && node runtime/test/differential.mjs` and every other gate (smoke, runner-safety,
runner-faults, random-seed, hash-order, hash-fuzz). Expected: all exit 0; both R11 cases identical.

- [ ] **Step 4: Prove the patch is necessary**

Run: `bash runtime/build.sh --negatives && node runtime/test/negatives.mjs`. Expected: exit 0, with `fork-no-0015`
caught by the differential (both R11 cases NEW).

- [ ] **Step 5: Repackage and commit**

Name fdlibm in the NOTICE `package.sh` writes (what it is, where it came from, its notice verbatim), then run
`bash runtime/release/package.sh 2026.09.28-2` and `bash runtime/release/verify.sh runtime/dist/fork` (exit 0).
```bash
git add runtime/patches/teavm-0015-strictmath-fdlibm.patch runtime/test/cases.mjs runtime/release/package.sh runtime/CHECKSUMS
git commit -m "fix(runtime): StrictMath.log follows fdlibm, so nextGaussian matches the JDK"
```
The message says the port came from netlib's `e_log.c` under D32 with no OpenJDK source read, and names the
negative proof and its exit code.
