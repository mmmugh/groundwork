# The minors cleanup (D72): implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

> **Decided (worksheet D72-D74, 2026-10-04 and 05).** D72: before Plan 4, fix the parked and deferred Minor findings of Plans
> 2, 3 and 3b that need no decision and belong to no later plan. D73: the build refuses a box whose program writes to
> System.err and then throws uncaught (P3-16). D74: in a browser that cannot run Java, every box keeps the one message,
> predict boxes included (P3-36: not a defect). The backlog (103 items, each checked against the code at 51cd080: 31 here,
> 15 for Plan 4, 3 for Plan 5, 35 already fixed, 13 not defects, 3 for D13's upstream tidy, 1 history) is in the worksheet's
> checkpoint 61; its working file is build/.work/minors/backlog.md.

**Goal:** every item below fixed, each with a check that fails without the fix (proven by its on-purpose break), and the
whole suite green, before Plan 4 starts.

**Spec:** DESIGN.md; the decisions in the worksheet. No item changes a promise in DESIGN.md.

## Global Constraints

- Everything in Plan 3b's Global Constraints holds (docs/superpowers/plans/2026-09-30-plan-3b-scratchpad.md): no system JDK
  (`J=runtime/.work/jdk25/jdk-25.0.4.1+1/Contents/Home/bin/java`); the real jshell only through RealJShell with the prefs
  plist hashed before and after, never the binary; never port 8731 (tests on port 0, 127.0.0.1); the clean room (D14, D51:
  never OpenJDK or Corretto source, never inside Corretto's archive or release/.tmp-*); the front end's Java
  (runtime/jshell/src/) unchanged; scratch only under build/.work/ or runtime/.work/; fixtures a test edits are real copies;
  scripts exit 0 / 1 / 2 as each documents; new test lines print runner-safety's `  ok    `/`  FAIL  ` format.
- Every changed check is proven by its on-purpose break, restored exactly, and the commit message names each break with how
  it was made and its exit code. Never `--no-verify`; never push. Prose: closed em dashes, American spelling, "course".
- Never rewrite history. Never loosen an expected value; report real counts (test totals grow).
- Each task ends by running the test files its items touch; the last task's controller run is the whole suite
  (build/.work/run-everything.sh).

## Tasks

### Task 1: the build (Java)

Items:
- **P2-8** (S). A four-backtick fence fails naming the page by its first heading, not its file. The other two Markdown errors name no page at all ("unclosed fence", "table without a delimiter row").
  - Where today: STILL-PRESENT: build/Markdown.java:84 (`pageTitle(blocks)`, defined :165-168), :74, :99. build/Boxes.java:41 and build/Vocabulary.java:137 call `checkedBlocks` and never add the path.
  - Fix: Wrap `checkedBlocks`' BuildError with the file in Boxes.of and Vocabulary.solutions (`p.file() + ": " + e.getMessage()`), the convention Volume.java:185-188 already uses for JSON; drop `pageTitle` from Markdown.java:84 and update MarkdownTest.java:83.
  - Check: A new BoxesTest: a fixture page with a ````` ````java ````` fence fails with a message containing that page's path (content/ch01-first-programs.md).
  - Break: Remove the wrap in Boxes.of: the message lacks the path, the test fails.
  - Source: Worksheet ckpt 31 ("naming the page (by its first heading ... Minor, deferred)")
- **P3-20** (S). BuildMainTest's missing-project test assumes build/.work/tests/no-such-project is absent; a bare `--project` is untested.
  - Where today: STILL-PRESENT: build/BuildMainTest.java:37-41 never deletes the path; Build.java:38's `rest.size() < 2` branch has no test.
  - Fix: Delete the path first (`Fixtures.deleteTree`); add `main("--project")` expecting exit 2 and the usage line.
  - Check: BuildMainTest green with a stray build/.work/tests/no-such-project directory created beforehand.
  - Break: Make Build.java:38's branch exit 0: the new bare-flag test fails.
  - Source: Plan 3 L97 (triage: can-wait)
- **P3b-51** (S). RuntimeFilesTest lists runtime/legal/ from the working tree, so a git-ignored .DS_Store there (a Finder visit) fails BuildTest confusingly.
  - Where today: STILL-PRESENT: build/RuntimeFilesTest.java:76 (`Files.list` keeps dot-files).
  - Fix: Skip names starting with "." in that listing (Ruling 24's own fix).
  - Check: With `runtime/legal/.DS_Store` created, RuntimeFilesTest passes; remove the file after.
  - Break: Drop the dot-file filter: the test fails naming .DS_Store.
  - Source: Plan 3b L203 "Final: parked" (Ruling 24)
- **P3-16, D73 (the author, 2026-10-05): the build refuses a box whose program writes to System.err and then throws an
  uncaught exception.** Today build/Audit.java:162-171 keeps stderr's first line as the stated output (losing the
  "Exception in thread" line) while web/page/transcript.mjs:53-57's statedStderr returns "" for the same run; both are wrong,
  in opposite ways. Fix: when a box's reference run ends uncaught and its stderr holds anything before the "Exception in
  thread" line, the build fails naming the box and saying why (a terminal's order of stdout and stderr is unknowable once
  captured apart; print from a catch block instead). Leave transcript.mjs's behavior, with a comment that the build keeps
  such boxes off every page (D73). Check: a fixture box `void main() { System.err.println("before"); throw new
  IllegalStateException("x"); }` fails the build with that message; an uncaught throw with nothing before it still builds.
  (As executed: the premise above was wrong. Jdk.run calls a run uncaught only when stderr starts with "Exception in
  thread", so such a box already failed as a bare "exit-1"; f2d6be0 gives it D73's reason, and the final review's fix
  covers a System.err.print with no newline before the exception line.)
  Break: drop the refusal: the fixture builds (or fails differently); the check fails.

- [ ] **Step 1:** for each item, write or extend the check first and show it failing (RED), then fix, then show it
  passing (GREEN); then run the item's break and record its exit code; restore it exactly.
- [ ] **Step 2:** run every test file this task's items touch; each exits 0.
- [ ] **Step 3:** commit (one commit per item or per coherent group), each message naming its item ids, RED/GREEN,
  and every break with its exit code.

### Task 2: the runner, the runtime tests, the dev server and replay's test

Items:
- **P3-6** (S). No check shows output-limit winning over needs-input, and the caller's character-cap check asserts the status only.
  - Where today: STILL-PRESENT: runtime/test/runner-input.mjs:56-57 checks `o.status` alone; the order is runtime/runner/node-runner.mjs:123 (and web/runner/browser-runner.mjs:118). Reachable by reading: a print ending in a lone high surrogate holds one code unit until the end-of-run flush (runtime/test/runner-safety.mjs:87-91), and that flush runs after a needs-input stop too (runtime/runner/tjava-core.mjs:199-212).
  - Fix: Two checks in runner-input.mjs: `IO.print("y\uD83D"); IO.readln();` with `outputLimitChars: 1, final: false` ends `output-limit` with stdout `"y"`; the existing 20-character cap check also requires `o.stdout === ""` (the 50-character piece is withheld whole).
  - Check: runner-input.mjs green.
  - Break: Swap node-runner.mjs:123's ternary (needs-input first): the new check reads `needs-input` and fails.
  - Source: Plan 3 L53 (triage: can-wait)
- **P3-8** (S). runner-safety.mjs's comment still says "The runner holds a line until its newline"; since teavm-0016 every print flushes, so the check tests the cap against a flood of pieces.
  - Where today: STILL-PRESENT: runtime/test/runner-safety.mjs:73-76.
  - Fix: Reword the comment: each print reaches the host as a piece; the hold-until-newline runner is history.
  - Check: Read; `git grep -n "holds a line until its" runtime/test` prints nothing.
  - Break: None (comment only).
  - Source: Plan 3 L62 (triage: can-wait)
- **P3-10** (M). Scripts derive their own directory with `new URL(..., import.meta.url).pathname`, which keeps `%20` for a checkout path with a space.
  - Where today: STILL-PRESENT: web/test/harness.mjs:23; runtime/test/differential.mjs:30, examples.mjs:26, hash-fuzz.mjs:36, hash-order.mjs:21, jdk.mjs:20, negatives.mjs:32, random-seed.mjs:21, runner-faults.mjs:22, runner-input.mjs:20, runner-safety.mjs:20, smoke.mjs:18; runtime/jshell/derive/fit/diags.mjs:20.
  - Fix: `fileURLToPath(new URL(...))` in all thirteen, as runtime/jshell/test/*.mjs already do (Rule 7, above).
  - Check: Through a symlink outside the repository whose name has a space, `node --preserve-symlinks` importing harness.mjs from that path gets a REPO that exists (its package.json found); smoke.mjs and web/test/serve.mjs still pass from the real path.
  - Break: Put one file back to `.pathname`: its path ends in `a%20b` and is not found.
  - Source: Plan 3 L78 (triage: can-wait, "Plan 4 when CI is set up")
- **P3-13** (S). The dev server never destroys a file's read stream when the client disconnects early: the descriptor stays open until GC. Dev and test server only, never deployed.
  - Where today: STILL-PRESENT: web/serve.mjs:49-53 (`stream.pipe(res)`, no `close` handler).
  - Fix: `res.on("close", () => stream.destroy())`, or `stream.pipeline`.
  - Check: web/test/serve.mjs: serve a 20 MB file, abort the request after its headers; within 1 s the process's open descriptors (`/dev/fd`) are back to the count before.
  - Break: Remove the handler: the count stays one higher; the check fails.
  - Source: Plan 3 L86 (triage: can-wait)
- **P3-17** (S). replay.mjs's both-ways loop checks only that some input boxes exist, so a fixture change that dropped one passes.
  - Where today: STILL-PRESENT: web/test/replay.mjs:87 (`inputs.length > 0`).
  - Fix: When replay.mjs builds its own fixture (no project argument), require the ids `ch02-types-and-input#1` and `ch02-types-and-input-practice#1` (build/testdata/vol-fixture/content/_boxes.json).
  - Check: replay.mjs green.
  - Break: Exclude one of the two ids in the filter at :86: the pin fails.
  - Source: Plan 3 L94 (triage: can-wait)
- **P3-18** (S). `stdoutFromTranscript` throwing inside the loop kills the script with a stack trace (exit still 1) instead of a FAIL line naming the box.
  - Where today: STILL-PRESENT: web/test/replay.mjs:98, no try.
  - Fix: A try around it that fails that box's check with the error and goes on.
  - Check: With a planted wrong answer list for the transcript call (scratch edit), replay.mjs prints one FAIL line naming the box and exits 1 normally.
  - Break: Remove the try: the same plant ends in an uncaught Error.
  - Source: Plan 3 L95 (triage: can-wait)

- [ ] **Step 1:** for each item, write or extend the check first and show it failing (RED), then fix, then show it
  passing (GREEN); then run the item's break and record its exit code; restore it exactly.
- [ ] **Step 2:** run every test file this task's items touch; each exits 0.
- [ ] **Step 3:** commit (one commit per item or per coherent group), each message naming its item ids, RED/GREEN,
  and every break with its exit code.

### Task 3: the page's code and its Check (three engines)

Items:
- **P3-1** (S). An output check on a crashed run reads "Stopped: the program stopped unexpectedly." (the verb twice); a method check reads "Check stopped while running f(...): the program stopped unexpectedly."
  - Where today: STILL-PRESENT: web/page/check.mjs:137 (whyStopped's last line) under :218's `Stopped: ` and :144's prefix.
  - Fix: New words for whyStopped's fallback, for example "the program ended unexpectedly."
  - Check: web/test/check.mjs: runCheck with a stub runner (`compile` ok, `run` returning `{status: "crashed", stdout: "", stderr: ""}`) gives exactly the new words.
  - Break: Restore the old words: the check fails.
  - Source: Worksheet ckpt 45; Plan 3 L171
- **P3-2** (S). Check runs use the worker's default caps (4,000,000 characters, 250,000 lines), not the page's 1,000,000 and 100,000 (D40(c)) that Run uses.
  - Where today: STILL-PRESENT: web/page/check.mjs:206-226 (runCheck) passes no `outputLimitChars`/`outputLimitLines`; box.mjs:24 holds the page's LIMITS, box.mjs:277 calls runCheck with `{ signal }` only; worker defaults at runtime/runner/worker-protocol.mjs:55,61.
  - Fix: runCheck takes both caps with the page's values as defaults (one exported constant that box.mjs's LIMITS also uses) and passes them to `compileAndRun` and every `run`.
  - Check: web/test/check.mjs: an output check of `void main() { IO.print("x".repeat(1_500_000)); }` reads "Stopped: the program printed too much."
  - Break: Drop the caps from runCheck: the run ends at 1.5 M characters and the verdict is a line difference; the check fails.
  - Source: Worksheet ckpt 45; Plan 3 L171
- **P3-4** (S). An exception while page/wire.mjs (or box.mjs, which it imports) evaluates leaves data-java unset and the boxes with no buttons and no words. app.mjs handles only a failed fetch.
  - Where today: STILL-PRESENT: web/app.mjs:77-81 sets only `wire.onerror`; wire.mjs:31-44 has no guard.
  - Fix: In app.mjs (old syntax), `wire.onload`: if data-java is still unset, tell the boxes the fatal words and set data-java "failed". The HTML spec fires `load` after a module script's evaluation throws; confirm in the three engines.
  - Check: web/test/page.mjs: a site copy whose page/box.mjs ends with a planted `throw` gives data-java "failed", every runnable box shows the fatal words, and the planted error is in `t.errors`, in all three engines.
  - Break: Remove the onload handler: data-java stays unset; the check fails.
  - Source: Worksheet ckpt 45 ("an evaluation error in page/wire.mjs now reaches page errors instead of data-java=failed")
- **P3-19** (S). Replay has no default randomSeed (a caller that forgets one diverges on every replay), and `answer()` reruns the program when it is not waiting.
  - Where today: STILL-PRESENT: web/page/replay.mjs:24-35. Today's one caller is safe (box.mjs:263 passes a seed).
  - Fix: The constructor picks one seed per Replay when none is given; `answer()` and `endInput()` do nothing unless waiting.
  - Check: web/test/replay.mjs: a Replay with no seed over the RAND program is not diverged after an answer; `answer()` on a finished Replay leaves `answers` unchanged.
  - Break: Drop the default seed: the runner draws a fresh seed per run without one (tjava-core.mjs:119-121), the replay diverges, the check fails.
  - Source: Plan 3 L96 (triage: can-wait, "if a second caller appears")
- **P3-30** (S). The fatal words are written in box.mjs and app.mjs (and the test).
  - Where today: STILL-PRESENT: web/page/box.mjs:29, web/app.mjs:79, web/test/page.mjs:31.
  - Fix: Export the words from web/page/support.mjs (app.mjs's one import; ES2017 is fine) and use them in app.mjs and box.mjs; the test keeps its own literal, so it still pins the words.
  - Check: page.mjs's fatal checks (the box's and the load failure's) green.
  - Break: Change the string in support.mjs only: both checks fail, showing both scripts read one source.
  - Source: Plan 3 L143 (triage: can-wait)
- **P3-34** (S). A javac message quoting the renamed main (a reader who declares main twice in a method exercise) shows `jf$m` to the reader.
  - Where today: STILL-PRESENT: MAIN_RENAMED at web/page/check.mjs:26; explainCompile's `reader` return (:74) and settleUnclear's (:101) pass diagnostics through unchanged.
  - Fix: Map `jf$m` back to `main` in those diagnostics' message text (same length, so no column moves).
  - Check: web/test/check.mjs: a method exercise whose file declares `void main()` twice gets a diagnostic naming `main()`, not `jf$m`.
  - Break: Remove the mapping: the message says `jf$m`; the check fails.
  - Source: Plan 3 L157 (triage: can-wait)
- **P3-23** (S). No check covers a reader's long-form `public static void main(String[] args)` being renamed, or the return-type column rule on a method with two parameters.
  - Where today: STILL-PRESENT: `git grep "static void main" web/test/check.mjs web/test/page.mjs` is empty; MAIN_DECL at web/page/check.mjs:23, the column rule at :81-84.
  - Fix: Two web/test/check.mjs cases: a long-form main that calls System.exit(3) still lets every case pass; a two-parameter method returning the wrong type reads "... should return int, but yours returns String."
  - Check: check.mjs green.
  - Break: Narrow MAIN_DECL to `void main()` (the long main survives and runs first); flip the column comparison at :82. Each fails its case.
  - Source: Plan 3 L109 (triage: can-wait, "the chapter pilot")
- **P3-27** (S). The unsupported-browser checks (no WasmGC; no module workers) open only ch01, not ch02, the page with predict boxes and checks.
  - Where today: STILL-PRESENT: web/test/page.mjs:87 and :98 open `PAGES[0]` only.
  - Fix: Run both blocks over both PAGES.
  - Check: page.mjs green in three engines.
  - Break: Make app.mjs's `tell()` skip boxes with `data-check`: only the ch02 runs fail.
  - Source: Plan 3 L129 (triage: can-wait)

- [ ] **Step 1:** for each item, write or extend the check first and show it failing (RED), then fix, then show it
  passing (GREEN); then run the item's break and record its exit code; restore it exactly.
- [ ] **Step 2:** run every test file this task's items touch; each exits 0.
- [ ] **Step 3:** commit (one commit per item or per coherent group), each message naming its item ids, RED/GREEN,
  and every break with its exit code.

### Task 4: the scratchpad's client and panel, and their tests

Items:
- **P3b-17** (S). The ledger called it generous that `ran` resets only in start(). Reading the front end shows the behavior is right: `/reload -restore` after a `/reset` replays the history before it (runtime/jshell/src/foundations/scratchpad/Commands.java:432-443, Shell.java:76-86), so `ran` since start() is the bound that covers it. The comment is what is wrong: it says `ran` is "what a /reload replays".
  - Where today: Behavior NOT-A-DEFECT; comment STILL-PRESENT at web/page/jshell-session.mjs:139.
  - Fix: Say in the comment why `ran` survives a /reset (an upper bound on any /reload's replay, `-restore` included), so nobody "fixes" it into a premature stop.
  - Check: Read.
  - Break: None (comment only).
  - Source: Plan 3b L129 (triage: can-wait)
- **P3b-25** (M). When the transcript trim's cut lands in a node with no newline past it (an echo's prompt prefix), the node is dropped whole and the next one (the typed text) opens the transcript mid-line.
  - Where today: STILL-PRESENT: web/page/scratchpad.mjs:171-180.
  - Fix: After dropping such a node, keep cutting the following nodes up to the next newline.
  - Check: web/test/scratchpad-panel.mjs, next to the existing trim check (:468-475): entries sized so the cut lands on a prompt prefix; the transcript then starts at the start of a line.
  - Break: Revert: the transcript opens with the typed text; the check fails.
  - Source: Plan 3b L149 (triage: can-wait, "Plan 5's chapter work")
- **P3b-53** (S). The held-stderr filter at Stop tests only the start of the held text, so a program's unfinished stderr joined to a Rust opening ("Working..." then "memory allocation of ...") shows engine text at Stop.
  - Where today: STILL-PRESENT: web/page/jshell-session.mjs:333 with RUST_START anchored at :61.
  - Fix: flushProgram flushes only the held text before the first Rust opening found anywhere in it, never the Rust part.
  - Check: web/test/jshell-session.mjs, fake worker: stderr "Working..." then "memory allocation of 8 bytes failed" with no newline, then Stop: the transcript shows "Working..." and no "memory allocation".
  - Break: Put the anchored test back: the engine text shows; the check fails.
  - Source: Plan 3b L205 "Final: parked" (Ruling 26)
- **P3b-26** (S). Nothing asserts that a scratchpad fault reaches the page's error reporting, as wire.mjs:35-37 promises.
  - Where today: STILL-PRESENT: web/test/page.mjs:418-420 checks data-scratchpad and the tab, not `t.errors`; the rethrows are web/page/wire.mjs:43 and web/page/scratchpad.mjs:219.
  - Fix: Assert the load failure is in `t.errors` in page.mjs's no-scratchpad block; the same for scratchpad.mjs:219's rethrow in scratchpad-panel.mjs.
  - Check: Both green.
  - Break: Delete each rethrow in turn: its assertion fails.
  - Source: Plan 3b L150 (triage: can-wait)
- **P3b-27** (S). The Stop check's lag has no lower bound. Latent: the next check (the words and two workers) rules out a wrong-reason pass.
  - Where today: STILL-PRESENT: web/test/scratchpad.mjs:209 (`lag != null && lag < 2000`).
  - Fix: `lag >= 0 && lag < 2000`.
  - Check: scratchpad.mjs green.
  - Break: No code break can make lag negative; prove the bound with a scratch edit that takes `clicked` after the terminate.
  - Source: Plan 3b L156 (triage: can-wait)
- **P3b-28** (S). "The fresh session has forgotten x" fails only under break 21, for a side reason; no break makes a fresh session remember x.
  - Where today: STILL-PRESENT (proof gap): web/test/scratchpad.mjs:217-219.
  - Fix: No code change: run a break that makes the fresh session after Stop remember x (scratch edit: the client re-submits the ended session's entries after the fresh boot) and record it in the commit message. Rides with P3b-27.
  - Check: The check fails under that break, for its own reason.
  - Break: That scratch edit.
  - Source: Plan 3b L157 (triage: can-wait)

- [ ] **Step 1:** for each item, write or extend the check first and show it failing (RED), then fix, then show it
  passing (GREEN); then run the item's break and record its exit code; restore it exactly.
- [ ] **Step 2:** run every test file this task's items touch; each exits 0.
- [ ] **Step 3:** commit (one commit per item or per coherent group), each message naming its item ids, RED/GREEN,
  and every break with its exit code.

### Task 5: the transcript check's tools and the scratchpad release script

Items:
- **P3b-18** (S). browser.mjs waits for `window.scratch` with no bound: a page module that fails to load hangs to the 30-minute exec timeout and hides the page error.
  - Where today: STILL-PRESENT: runtime/jshell/test/browser.mjs:76 (`setDefaultTimeout(0)`), :78.
  - Fix: A bound on that wait (minutes); on timeout print `problems` and exit 1.
  - Check: A served page whose module throws at load: browser.mjs exits 1 within the bound, printing the page error.
  - Break: Unbounded again: still waiting at the bound; the check's own timeout ends it.
  - Source: Plan 3b L138 (triage: can-wait)
- **P3b-19** (S). rist-sweep.mjs never checks PARALLEL: 0 or "abc" gives zero workers and "nothing to compare" (exit 1) instead of usage (exit 2).
  - Where today: STILL-PRESENT: runtime/jshell/test/rist-sweep.mjs:40 (`Number(args[2] ?? 8)`).
  - Fix: The usage test at :35 also refuses a PARALLEL that is not a whole number of at least 1.
  - Check: `--scratchpad X 0` and `--scratchpad X abc` each exit 2 with the usage line.
  - Break: Drop the test: no usage line (the manifest's exit 2, or exit 1 with a real DIR); the check fails.
  - Source: Plan 3b L139 (triage: can-wait)
- **P3b-21** (S). breaks.mjs's originalsIntact re-hashes only the six files and the jar, so a break that touched the site's manifest.json or a tracked file would go unseen.
  - Where today: STILL-PRESENT: runtime/jshell/test/breaks.mjs:69-76.
  - Fix: Also compare the site's manifest.json (hashed before the first break) and run `git diff --quiet -- runtime/jshell web runtime/ristretto/CHECKSUMS`.
  - Check: A deliberately leaking break (scratch copy of breaks.mjs: its setup writes the original manifest.json) stops with exit 2, naming it.
  - Break: Drop the manifest comparison: the leak passes.
  - Source: Plan 3b L141 (triage: can-wait)
- **P3b-22** (S). breaks.mjs accepts unknown options, and an `--only` that matches no break passes on nothing ("0 breaks, 0 not caught", exit 0).
  - Where today: STILL-PRESENT: runtime/jshell/test/breaks.mjs:38-39, :358-359.
  - Fix: Before scratchpadDir and build.sh run (:41, :335), refuse unknown options and `--only` names that match no break, exit 2.
  - Check: `--only no-such-break` and `--bogus` each exit 2 at once.
  - Break: Revert: "0 breaks, 0 not caught as expected", exit 0.
  - Source: Plan 3b L142 (triage: can-wait, "before Plan 4 puts breaks.mjs in CI")
- **P3b-52** (S). package.sh deletes the live release and then moves the new one in: an interrupt between the two loses the release `current` points at.
  - Where today: STILL-PRESENT: runtime/ristretto/package.sh:335-336 (`rm -rf "$final"`, `mv "$outdir" "$final"`).
  - Fix: Move an existing release aside to release/.tmp-old-<release> (already on D51's release/.tmp-* list), move the new one in, then delete the old; the EXIT trap (:45) puts the old one back if `$final` is missing.
  - Check: A saved copy of package.sh with `kill -INT $$` between the two moves, run under the live name: `sh runtime/ristretto/verify.sh runtime/.work/ristretto/current` exits 0.
  - Break: The same kill against today's two lines: verify.sh exits 2 (recovered by one rerun from cached inputs).
  - Source: Plan 3b L204 "Final: parked" (Ruling 25)
- **P3b-1** (M). The two Python heredocs repeat `pins`, `cached`, LICENSE_FILE and the crate-URL regex; an edit to one copy would let the cross-check accept a crate whose license text THIRD-PARTY.txt never collects.
  - Where today: STILL-PRESENT: runtime/ristretto/package.sh:97-99 and :144-146; the regex at :107 and :162.
  - Fix: Define them once (a helper module written to the staging directory and imported by both heredocs, or one heredoc doing both jobs). Do it with P3b-52, same file.
  - Check: A repackage under the live name leaves runtime/ristretto/CHECKSUMS byte-identical (`git diff --exit-code`; it lists THIRD-PARTY.txt); Ruling 7's crate-without-license break, made in the one shared regex, still fails the cross-check, exit 1.
  - Break: That regex edit. Note: source.tar.gz changes on the next repackage because it carries tools/package.sh; no tracked file pins it (Plan 3b L199).
  - Source: Plan 3b ledger Ruling 9 (L104; triage: can-wait, "with the Ruling 11 fix or Plan 4")

- [ ] **Step 1:** for each item, write or extend the check first and show it failing (RED), then fix, then show it
  passing (GREEN); then run the item's break and record its exit code; restore it exactly.
- [ ] **Step 2:** run every test file this task's items touch; each exits 0.
- [ ] **Step 3:** commit (one commit per item or per coherent group), each message naming its item ids, RED/GREEN,
  and every break with its exit code.

## Not in this plan

- Plan 4's items (backlog section PLAN 4): publishing, release URLs, the legal texts R-1/R-2/P-3, HTTPS for self-hosting,
  S1 and @JSBody, WebSockets in the offsite gate, the 24 MB figure, CI, runtime/RELEASE's case clash, and the rest listed there.
- Plan 5's (Appendix D, D19's Artifact limit, settleUnclear's deferral). D13's upstream tidy of teavm-0016/0017. Plan 2's
  commit-message gaps (history).
- Plan 3b's Files table and its `got:` quote (P3b-6, P3b-7): plan prose, fixed by the controller in its own commit.
