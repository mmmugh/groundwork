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
// The ci/ scripts' own promises, each run on a copy of the scripts under build/.work/ci-test/ with stand-ins first on
// PATH, so nothing here downloads, installs or runs a real test (uname says what the case needs; curl, sha256sum, tar and
// git are the real ones, the JDK a fixture tarball laid out as Temurin's, fetched from a file:// URL), and the workflows'
// own, read from .github/workflows/ as they are:
// - setup.sh never unpacks, marks or runs a JDK whose download failed its SHA-256 check, on that run or a later one, and
//   leaves nothing of it behind (C-2, T-1); a JDK an earlier run verified against today's pin is not downloaded again,
//   and one whose VERIFIED records another hash, or none, is never trusted;
// - setup.sh --dry-run prints the commands, runs none, and says so;
// - a DRY_RUN in the environment does not turn a suite into a no-op that passes (T-3);
// - everything.sh runs the two hook tests, as its header says (B4);
// - quick.sh leaks on a fork's pull request, which GitHub runs without the repository secret, scans the history with the
//   generic patterns and says why; any other run without the secret fails, naming it (D102);
// - the secret's temp file is gone however the history scan ends, and a signal stops the run; the hook tests and the
//   gitleaks download never see the secret, by name or by value; with the secret, a fork's pull request still gets the
//   full scan;
// - the history scan fails, never passes having scanned nothing, when it cannot write the secret to its file, when git
//   cannot list the commits or lists none, and when git cannot give a commit's whole diff;
// - with the secret, every scan reads the secret itself (its file holds the synthetic mark, not an empty line) and its
//   own commit's diff, the root commit's included; a secret of only blank or comment lines, which leak-scan would skip,
//   fails the scan, since nothing personal would be scanned;
// - every action a workflow uses is pinned to a full commit SHA with its version; no workflow has a trigger that runs on
//   a fork's behalf with the secret; quick.yml runs on pushes to every branch, so a release's tag starts no run.
//   node ci/test.mjs
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const WORK = path.join(REPO, "build/.work/ci-test");
fs.rmSync(WORK, { recursive: true, force: true });
fs.mkdirSync(WORK, { recursive: true });
const results = [];
const check = (label, ok, got) => { results.push(ok); console.log(`  ${ok ? "ok  " : "FAIL"}  ${label}${ok ? "" : "  got " + JSON.stringify(got)}`); };
const exists = (f) => fs.existsSync(f);
const write = (f, text, mode = 0o644) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text, { mode }); };
const sha256 = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const REAL_CURL = spawnSync("sh", ["-c", "command -v curl"], { encoding: "utf8" }).stdout.trim();
// The secret the leaks cases use: a synthetic pattern written under build/.work/, never the real one.
const SECRET_MARK = "synthetic-ci-test-pattern";
const SECRET_FILE = path.join(WORK, "synthetic-leak-patterns");
write(SECRET_FILE, `${SECRET_MARK}-[0-9]+\n`);
const SECRET = fs.readFileSync(SECRET_FILE, "utf8").trim();
// What a stand-in records: its name and its arguments, one line per call, in the case's log, and one line more for each
// way it can see the secret: LEAK_PATTERNS_LOCAL in its environment, or the secret's text there under any name (only
// leaks_history may see it).
const RECORD = 'printf "%s %s\\n" "$(basename "$0")" "$*" >> "$CI_TEST_LOG"; '
  + '[ -z "${LEAK_PATTERNS_LOCAL+set}" ] || echo "$(basename "$0") saw LEAK_PATTERNS_LOCAL" >> "$CI_TEST_LOG"; '
  + `if env | grep -qF "${SECRET_MARK}"; then echo "$(basename "$0") saw the secret" >> "$CI_TEST_LOG"; fi`;

// The fixture JDK: jdk-25.0.4.1+1/bin/java, as Temurin's Linux tarball lays it out, a java that records each run.
const JDK = "jdk-25.0.4.1+1";
write(path.join(WORK, "jdk-fixture", JDK, "bin/java"), `#!/bin/sh\n${RECORD}\n`, 0o755);
const TGZ = path.join(WORK, "jdk.tar.gz");
const made = spawnSync("tar", ["-czf", TGZ, "-C", path.join(WORK, "jdk-fixture"), JDK], { encoding: "utf8" });
if (made.status !== 0) { console.log(`could not make the fixture tarball: ${made.stderr}`); process.exit(1); }
const PIN = sha256(TGZ), WRONG = "0".repeat(64);

// A copy of the scripts at the root of a directory of its own (lib.sh goes to the root it finds from its own path), with
// a pins.env pointing at the fixture tarball and the given pin, and a stand-in for the scratchpad's fetch.
function root(name, pin) {
  const r = path.join(WORK, name);
  for (const f of ["lib.sh", "setup.sh", "quick.sh", "everything.sh"]) write(path.join(r, "ci", f), fs.readFileSync(path.join(REPO, "ci", f)), 0o755);
  write(path.join(r, "ci/pins.env"), `TEMURIN_LINUX_X64_URL=file://${TGZ}\nTEMURIN_LINUX_X64_SHA256=${pin}\n`);
  write(path.join(r, "runtime/ristretto/fetch-release.sh"), "exit 0\n");
  return r;
}
const jdk = (r) => ({ dir: path.join(r, "runtime/.work/jdk25", JDK), tgz: path.join(r, "runtime/.work/jdk25/jdk.tar.gz"),
  verified: path.join(r, "runtime/.work/jdk25/VERIFIED") });
const left = (r) => Object.fromEntries(Object.entries(jdk(r)).map(([k, f]) => [k, exists(f)]));
// Runs ci/<script> in root r: uname says os, python3 and node only record their calls, curl records then runs the real
// one. The environment is this process's without what lib.sh would read from it, plus env.
function run(r, script, args = [], { os = "Linux", env = {} } = {}) {
  const bin = path.join(r, ".stand-ins"), log = path.join(r, "ran.log");
  write(path.join(bin, "uname"), `#!/bin/sh\necho ${os}\n`, 0o755);
  write(path.join(bin, "curl"), `#!/bin/sh\n${RECORD}\nexec "${REAL_CURL}" "$@"\n`, 0o755);
  for (const name of ["python3", "node"]) write(path.join(bin, name), `#!/bin/sh\n${RECORD}\n`, 0o755);
  fs.writeFileSync(log, "");
  const e = { ...process.env, PATH: `${bin}:${process.env.PATH}`, CI_TEST_LOG: log };
  for (const k of ["JF_JAVA_HOME", "JF_DIST", "CI_LOG_DIR", "DRY_RUN", "LEAK_PATTERNS_LOCAL", "LEAKS_FORK_PR"]) delete e[k];
  const p = spawnSync("bash", [path.join(r, "ci", script), ...args], { cwd: r, env: { ...e, ...env }, encoding: "utf8" });
  const ran = fs.readFileSync(log, "utf8");
  return { status: p.status, signal: p.signal, out: p.stdout + p.stderr, ran, javaRuns: ran.split("\n").filter((l) => l.startsWith("java ")).length };
}

// The pin matches: downloaded, checked, unpacked, marked, and the two fetches run the JDK.
let r = root("matches", PIN);
let o = run(r, "setup.sh");
check("setup.sh with a download that matches its pin exits 0, and the runtime and variant fetches run that JDK",
  o.status === 0 && o.javaRuns === 2, o);
check("and VERIFIED records the SHA-256 the download was found to have",
  exists(jdk(r).verified) && fs.readFileSync(jdk(r).verified, "utf8") === `${PIN}  jdk.tar.gz\n`, left(r));
o = run(r, "setup.sh");
check("a second run finds that JDK verified against today's pin and downloads nothing", o.status === 0 && !o.ran.includes("curl ") && o.javaRuns === 2, o);

// The pin does not match. The first run used to unpack the download, mark it VERIFIED and run it, and a later run
// trusted it without a check.
r = root("mismatch", WRONG);
for (const n of [1, 2]) {
  o = run(r, "setup.sh");
  check(`run ${n}: a download that fails its SHA-256 check ends setup.sh with exit 1, naming jdk-check`,
    o.status === 1 && o.out.includes("FAILED: jdk-check exit 1"), o.out);
  check(`run ${n}: and no java ran, and no download, unpacked JDK or VERIFIED is left`,
    o.javaRuns === 0 && Object.values(left(r)).every((x) => !x), { javaRuns: o.javaRuns, left: left(r), ran: o.ran });
}

// What an earlier run or a restored cache left: a JDK whose VERIFIED records another hash, and one with no VERIFIED.
// Neither is trusted; the first is fetched and checked again, and the second, with a download that fails its check, never
// runs and is not left.
r = root("other-hash", PIN);
write(path.join(jdk(r).dir, "bin/java"), `#!/bin/sh\necho "stale java $*" >> "$CI_TEST_LOG"\n`, 0o755);
write(jdk(r).verified, `${WRONG}  jdk.tar.gz\n`);
o = run(r, "setup.sh");
check("a JDK whose VERIFIED records another hash is downloaded and checked again, and only the new one runs",
  o.status === 0 && o.ran.includes("curl ") && !o.ran.includes("stale java") && o.javaRuns === 2
    && fs.readFileSync(jdk(r).verified, "utf8") === `${PIN}  jdk.tar.gz\n`, o);
r = root("unverified", WRONG);
write(path.join(jdk(r).dir, "bin/java"), `#!/bin/sh\necho "stale java $*" >> "$CI_TEST_LOG"\n`, 0o755);
o = run(r, "setup.sh");
check("a JDK with no VERIFIED and a download that fails its check: exit 1, no java of either ran, and neither is left",
  o.status === 1 && !o.ran.includes("stale java") && o.javaRuns === 0 && Object.values(left(r)).every((x) => !x),
  { status: o.status, ran: o.ran, left: left(r) });

// --dry-run runs nothing and says so, rather than "every command passed".
r = root("dry-run", PIN);
o = run(r, "setup.sh", ["--dry-run"]);
check("setup.sh --dry-run prints the JDK's commands, runs none, and ends saying nothing ran",
  o.status === 0 && ["+ curl -fsSL", "+ verify_sha256", "+ tar -xzf"].every((s) => o.out.includes(s)) && o.ran === ""
    && !exists(path.join(r, "runtime/.work")) && o.out.trimEnd().endsWith("dry run: nothing ran"), o);

// T-3: only setup.sh's --dry-run makes a dry run. A DRY_RUN inherited from the environment used to make quick.sh print
// its commands, run none of them and say "every command passed".
r = root("inherited-dry-run", PIN);
o = run(r, "quick.sh", ["leaks"], { os: "Darwin", env: { DRY_RUN: "1" } });
check("with DRY_RUN=1 in the environment, quick.sh leaks still runs its two hook tests",
  o.status === 0 && o.ran === "python3 tests/leak_scan_test.py\npython3 tests/pre_push_test.py\n" && !o.out.includes("+ python3"), o);

// B4: everything.sh is "every command of the quick and weekly lists", the hook tests among them. HOME is the copy, so the
// plist it hashes is absent; J is a stand-in that records its calls. The exit code is not checked: the copy holds none
// of the files the suite's other commands name.
r = root("everything", PIN);
write(path.join(r, "java-home/bin/java"), `#!/bin/sh\n${RECORD}\n`, 0o755);
o = run(r, "everything.sh", [], { os: "Darwin", env: { HOME: r, JF_JAVA_HOME: path.join(r, "java-home") } });
check("everything.sh runs the two hook tests",
  o.ran.includes("python3 tests/leak_scan_test.py\n") && o.ran.includes("python3 tests/pre_push_test.py\n"), o.ran);

// The leaks cases, each in a root of its own: a git repository with two commits (else `git rev-list --all` walks this
// repository's history; the second commit is the scan a signal must stop before), each adding file-<n>.txt, and a
// stand-in .githooks/leak-scan that logs, per call, what it was given: whether the personal-patterns file
// LEAK_PATTERNS_LOCAL names holds the synthetic mark (the stand-in's own text, so an empty or blank file says no), the
// commit whose diff came on stdin (diff-tree's first line), the `+++ b/` paths of that diff, and the file itself ("none"
// when it names no file). Then it exits as LEAK_SCAN_STUB says: pass 0; fail 1; term sends SIGTERM to its parent, the
// shell running leaks_history, on its first call, then 0. TMPDIR and RUNNER_TEMP are a fresh directory, where the
// secret's file is looked for afterwards. The root's pins.env has no gitleaks pin, so gitleaks-history always fails
// here: each case reads its `FAILED: leak-scan-history` line, never the exit status. The secret is a synthetic pattern,
// never the real one.
const STUB_SCAN = `#!/bin/sh
input=$(cat)
if [ -n "\${LEAK_PATTERNS_LOCAL:-}" ] && [ -f "$LEAK_PATTERNS_LOCAL" ]; then f=$LEAK_PATTERNS_LOCAL; else f=none; fi
if [ "$f" != none ] && grep -qF ${SECRET_MARK} "$f"; then mark=yes; else mark=no; fi
commit=$(printf '%s\\n' "$input" | head -n 1 | grep -E '^[0-9a-f]{40}$')
paths=$(printf '%s\\n' "$input" | sed -n 's|^+++ b/||p' | paste -sd, -)
if grep -q '^leak-scan ' "$CI_TEST_LOG"; then first=; else first=1; fi
echo "leak-scan mark=$mark commit=$commit paths=$paths patterns=$f" >> "$CI_TEST_LOG"
case "$LEAK_SCAN_STUB" in
  fail) exit 1 ;;
  term) [ -z "$first" ] || kill -TERM "$PPID" ;;
esac
exit 0
`;
// leaks(name, env, { commits, prepare, standIns }): `commits` commits (2 unless a case says), then prepare(r, git) may
// damage the repository, and standIns adds stand-ins of the case's own to .stand-ins/.
function leaks(name, env, { commits = 2, prepare = () => {}, standIns = {} } = {}) {
  const r = root(name, PIN), tmp = path.join(r, "tmp");
  write(path.join(r, ".githooks/leak-scan"), STUB_SCAN, 0o755);
  for (const [f, text] of Object.entries(standIns)) write(path.join(r, ".stand-ins", f), text, 0o755);
  fs.mkdirSync(tmp);
  const git = (...a) => spawnSync("git", ["-c", "user.name=ci-test", "-c", "user.email=ci-test@example.invalid", ...a], { cwd: r, encoding: "utf8" });
  git("init", "-q");
  const files = {}; // commit → the file it adds
  for (let n = 1; n <= commits; n++) {
    write(path.join(r, `file-${n}.txt`), `${n}\n`); git("add", `file-${n}.txt`); git("commit", "-q", "-m", `commit ${n}`);
    files[git("rev-parse", "HEAD").stdout.trim()] = `file-${n}.txt`;
  }
  const made = git("rev-list", "--all").stdout.split("\n").filter(Boolean).length;
  if (made !== commits) { console.log(`could not make the git repository in ${name}: ${made} commits`); process.exit(1); }
  prepare(r, git);
  const o = run(r, "quick.sh", ["leaks"], { os: "Linux", env: { TMPDIR: tmp, RUNNER_TEMP: tmp, ...env } });
  return { ...o, tmp, files, historyFailed: o.out.includes("FAILED: leak-scan-history"),
    scans: o.ran.split("\n").filter((l) => l.startsWith("leak-scan ")).map((l) => {
      const m = /^leak-scan mark=(\w+) commit=(\w*) paths=(\S*) patterns=(.*)$/.exec(l);
      return m ? { mark: m[1], commit: m[2], paths: m[3], patterns: m[4] } : { line: l };
    }),
    left: fs.readdirSync(tmp).filter((f) => f.startsWith("leak-patterns-local.")) };
}
// What the stand-in saw: every scan's patterns file held the secret's mark; every scan read its own commit's diff, the
// file that commit adds; and every commit was scanned.
const marked = (o) => o.scans.every((s) => s.mark === "yes");
const ownDiff = (o) => o.scans.every((s) => s.paths === o.files[s.commit]);
const everyCommit = (o) => Object.keys(o.files).every((c) => o.scans.some((s) => s.commit === c));

// A fork's pull request gets no secret from GitHub (D102 turns pull requests on): the scan runs on the generic patterns.
o = leaks("leaks-fork", { LEAKS_FORK_PR: "1", LEAK_SCAN_STUB: "pass" });
check("no secret on a fork's pull request: leak-scan-history scans every commit's own diff with no personal-patterns "
  + "file named and passes, saying the secret is withheld from forks and the full scan runs after a merge",
  !o.historyFailed && o.scans.length === 2 && o.scans.every((s) => s.patterns === "none") && everyCommit(o) && ownDiff(o)
    && o.out.includes("the personal leak patterns are a repository secret, which GitHub withholds from forks")
    && o.out.includes("the full scan runs on the push to main after a merge"), o.out + o.ran);
o = leaks("leaks-no-secret", { LEAKS_FORK_PR: "", LEAK_SCAN_STUB: "pass" });
check("no secret on any other run: FAILED: leak-scan-history, naming LEAK_PATTERNS_LOCAL, and no commit scanned",
  o.historyFailed && o.out.includes("LEAK_PATTERNS_LOCAL is not set") && o.scans.length === 0, o.out + o.ran);

// With the secret, in three endings, its file is gone afterwards; after a signal the run stops.
const withSecret = [];
for (const [stub, ending] of [["pass", "every scan passes"], ["fail", "a scan fails"], ["term", "SIGTERM during the loop"]]) {
  o = leaks(`leaks-secret-${stub}`, { LEAK_PATTERNS_LOCAL: SECRET, LEAK_SCAN_STUB: stub });
  withSecret.push(o);
  const inTmp = o.scans.length > 0 && o.scans.every((s) => s.patterns?.startsWith(`${o.tmp}/leak-patterns-local.`));
  const ended = stub === "pass" ? !o.historyFailed && o.scans.length === 2 && everyCommit(o)
    : stub === "fail" ? o.historyFailed && o.out.includes("leak-scan blocked commit") && o.scans.length === 2 && everyCommit(o)
    : o.scans.length === 1 && o.status !== 0 && !/command\(s\) failed|every command passed/.test(o.out);
  check(`with the secret, ${ending}: every scan read the secret (its mark) from a file in the temp directory and its own `
    + `commit's diff${stub === "term" ? "" : ", every commit's"}, and no leak-patterns-local.* is left there`
    + `${stub === "term" ? "; the run stops, scanning no later commit" : ""}`,
    inTmp && marked(o) && ownDiff(o) && ended && o.left.length === 0,
    { status: o.status, signal: o.signal, left: o.left, scans: o.scans, out: o.out });
}

// The secret wins over LEAKS_FORK_PR: a run that has it gets the full scan, wherever the pull request comes from.
o = leaks("leaks-secret-fork", { LEAK_PATTERNS_LOCAL: SECRET, LEAKS_FORK_PR: "1", LEAK_SCAN_STUB: "pass" });
withSecret.push(o);
check("with the secret on a fork's pull request, the secret wins: every commit's own diff is scanned with it (its "
  + "mark) from the temp directory, no fork notice, and nothing is left there",
  !o.historyFailed && o.scans.length === 2 && o.scans.every((s) => s.patterns?.startsWith(`${o.tmp}/leak-patterns-local.`))
    && marked(o) && everyCommit(o) && ownDiff(o) && !o.out.includes("withholds from forks") && o.left.length === 0,
  o.out + o.ran);

// A secret leak-scan reads as no pattern at all (only blank and comment lines, which it skips) would pass every scan on
// the generic patterns alone, as an empty one would; the scan refuses it before writing it anywhere.
o = leaks("leaks-secret-blank", { LEAK_PATTERNS_LOCAL: "  \n# a comment, no pattern\n\t\n", LEAK_SCAN_STUB: "pass" });
withSecret.push(o);
check("with a secret of only blank and comment lines: FAILED: leak-scan-history saying nothing personal was scanned, "
  + "no commit scanned, and no file left",
  o.historyFailed && o.out.includes("nothing personal was scanned") && o.scans.length === 0 && o.left.length === 0,
  { left: o.left, scans: o.scans, out: o.out });

// The history scan never passes having scanned nothing. Each failure is made for real: a mktemp stand-in hands back a
// read-only file, so writing the secret to it fails; a deleted parent commit makes `git rev-list --all` fail; a
// repository with no commit lists none; a deleted blob (and its working copy, which git would read instead) makes
// `git diff-tree` fail on the commit that adds it, while the scan of what it printed passes.
const READ_ONLY_MKTEMP = `#!/bin/sh
f="$(dirname "$1")/leak-patterns-local.read-only"
: > "$f" && chmod 444 "$f" && echo "mktemp made $f" >> "$CI_TEST_LOG" && echo "$f"
`;
o = leaks("leaks-write-fails", { LEAK_PATTERNS_LOCAL: SECRET, LEAK_SCAN_STUB: "pass" }, { standIns: { mktemp: READ_ONLY_MKTEMP } });
withSecret.push(o);
check("with the secret, when writing it to the temp file fails: FAILED: leak-scan-history saying so, no commit "
  + "scanned, and the file removed",
  o.ran.includes("mktemp made ") && o.historyFailed && o.out.includes("could not write the personal patterns to a temp file")
    && o.scans.length === 0 && o.left.length === 0, { left: o.left, scans: o.scans, out: o.out, ran: o.ran });
const objectPath = (r, id) => path.join(r, ".git/objects", id.slice(0, 2), id.slice(2));
o = leaks("leaks-rev-list-fails", { LEAK_PATTERNS_LOCAL: SECRET, LEAK_SCAN_STUB: "pass" }, {
  prepare: (r, git) => fs.rmSync(objectPath(r, git("rev-list", "--all").stdout.trim().split("\n").at(-1))) });
withSecret.push(o);
check("when git rev-list --all fails: FAILED: leak-scan-history saying so, no commit scanned, and no file left",
  o.historyFailed && o.out.includes("git rev-list --all failed") && o.scans.length === 0 && o.left.length === 0,
  { left: o.left, scans: o.scans, out: o.out });
o = leaks("leaks-no-commits", { LEAK_PATTERNS_LOCAL: SECRET, LEAK_SCAN_STUB: "pass" }, { commits: 0 });
withSecret.push(o);
check("when git rev-list --all lists no commits: FAILED: leak-scan-history saying so, and no file left",
  o.historyFailed && o.out.includes("git rev-list --all listed no commits") && o.scans.length === 0 && o.left.length === 0,
  { left: o.left, scans: o.scans, out: o.out });
o = leaks("leaks-diff-tree-fails", { LEAK_PATTERNS_LOCAL: SECRET, LEAK_SCAN_STUB: "pass" }, {
  prepare: (r, git) => {
    fs.rmSync(objectPath(r, git("rev-parse", "HEAD:file-2.txt").stdout.trim()));
    fs.rmSync(path.join(r, "file-2.txt"));
  } });
withSecret.push(o);
check("when git diff-tree fails on a commit whose scan passed: FAILED: leak-scan-history naming that commit, every "
  + "scan with the secret (its mark), and no file left",
  o.historyFailed && o.out.includes("git diff-tree failed on commit") && !o.out.includes("leak-scan blocked commit")
    && o.scans.length === 2 && marked(o) && o.left.length === 0, { left: o.left, scans: o.scans, out: o.out });

check("with the secret, the hook tests (python3) and the gitleaks download (curl) never see it, under "
  + "LEAK_PATTERNS_LOCAL or any other name",
  withSecret.every((x) => x.ran.includes("python3 tests/leak_scan_test.py\n") && x.ran.includes("curl ")
    && !x.ran.includes("saw LEAK_PATTERNS_LOCAL") && !x.ran.includes("saw the secret")), withSecret.map((x) => x.ran));

// The workflows, read as they are. A branch filter alone makes GitHub start no run for a tag, so a release's tag starts
// no quick run. pull_request_target, workflow_run and issue_comment run in this repository's own context, with its
// secret, on events a fork's author can cause.
const WF = path.join(REPO, ".github/workflows");
const workflows = fs.readdirSync(WF).filter((f) => /\.ya?ml$/.test(f))
  .map((f) => ({ f, text: fs.readFileSync(path.join(WF, f), "utf8") }));
const uses = workflows.flatMap(({ f, text }) => text.split("\n").filter((l) => /^\s*(- )?uses:/.test(l)).map((l) => `${f}: ${l.trim()}`));
const unpinned = uses.filter((l) => !/ uses: [\w.-]+\/[\w./-]+@[0-9a-f]{40} {2}# v\d+(\.\d+)*$/.test(l));
check("every uses: line under .github/workflows/ pins a full 40-hex commit SHA followed by `  # v<version>`",
  uses.length > 0 && unpinned.length === 0, unpinned);
const forkTriggers = workflows.filter(({ text }) => /\b(pull_request_target|workflow_run|issue_comment)\b/.test(text)).map(({ f }) => f);
check("no workflow names pull_request_target, workflow_run or issue_comment",
  workflows.length > 0 && forkTriggers.length === 0, forkTriggers);
// The lines nested under the first `<key>:` line at the given indentation, read by indentation as YAML nests them.
function under(lines, key, indent) {
  const pad = " ".repeat(indent), i = lines.findIndex((l) => l === `${pad}${key}:` || l.startsWith(`${pad}${key}: `));
  const out = [];
  if (i >= 0) for (const l of lines.slice(i + 1)) { if (l.trim() !== "" && l.search(/\S/) <= indent) break; out.push(l); }
  return out;
}
const quickYml = fs.readFileSync(path.join(WF, "quick.yml"), "utf8").split("\n");
const push = under(under(quickYml, "on", 0), "push", 2);
check('quick.yml\'s push trigger is branches: ["**"] and no tags, so every branch runs and a release\'s tag starts none',
  push.some((l) => l === '    branches: ["**"]') && !push.some((l) => /^ {4}tags/.test(l)), push);
const leaksJob = under(under(quickYml, "jobs", 0), "leaks", 2);
check("quick.yml's leaks job sets LEAKS_FORK_PR beside the secret: 1 on a pull request from a fork, else empty",
  leaksJob.some((l) => l.trim() === "LEAKS_FORK_PR: ${{ github.event.pull_request.head.repo.fork && '1' || '' }}")
    && leaksJob.some((l) => l.trim() === "LEAK_PATTERNS_LOCAL: ${{ secrets.LEAK_PATTERNS_LOCAL }}"), leaksJob);

console.log(results.every(Boolean) ? "\nthe ci scripts keep their promises" : `\n${results.filter((x) => !x).length} failed`);
process.exit(results.every(Boolean) && results.length === 28 ? 0 : 1);
