# Plan 3b: the scratchpad, implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Decided (worksheet D36, D45-D60, 2026-09-28 to 2026-10-01).**
> - **D36:** the scratchpad is its own plan, written after Plan 3 landed (it did: D45, main at 6ef7233).
> - **D48:** our own panel (about 250 lines) over Ristretto v0.34.0's five unmodified files (the worker, three wasm files,
>   the JDK zip), not a copy of Ristretto's page (its `/ristretto/` base path, its eager 24 MB load and a three-minute
>   Chromium freeze on a `StackOverflowError`'s output rule that out).
> - **D49:** a runaway entry meets a Stop button, a 60-second backstop and output caps, then a fresh session with the reason
>   in plain words. DESIGN gets its own sentence for the scratchpad: the boxes' runaway promise cannot hold there (memory
>   runs out as a Rust abort, never `java.lang.OutOfMemoryError`; a session dies after about 150 entries).
> - **D50:** The author tries a real iPhone and a stock Firefox during this plan's execution, before DESIGN's scratchpad
>   paragraph is final and before merge (Task 8 stops for the author).
> - **D51:** the release's source bundle carries the exact Corretto 25.0.4.10.1 tag archive, hashed on two downloads and
>   never extracted; its path joins the clean-room forbidden list.
> - **D52:** Ristretto is pinned by bytes now (v0.34.0's web build, by our own hashes, in a scratchpad release); one rebuild
>   from source is proved in a later plan.
> - **D53:** one shared check makes a missing NOTICE, license text or source pointer fatal for both runtimes: the boxes'
>   runtime (closing Plan 2's best-effort ruling C) and the scratchpad's.
> - **D54:** Firefox's slow open (55-61 s measured, against about 10 s in Chromium and WebKit) is disclosed in DESIGN with the
>   real per-browser timings, and the panel shows what it is doing and a timer while it opens.
> - **D55, D56:** the output readers see today comes from Ristretto's own front end (`BrowserJShell.java`, 438 lines, inside
>   `jdk-25.zip` as `browser-jshell.jar`), and 28 of 72 course-style entries differ from the JDK's jshell. A course-written,
>   clean-room replacement is being built in a separate session (worktree `jshell-frontend`). This plan ships Ristretto's
>   front end with its differences pinned, and leaves the seams so the replacement drops in without changing this plan's
>   code: the panel and the check speak Ristretto's unmodified worker protocol, and the replacement arrives as a rebuilt
>   `jdk.zip` (Ristretto's worker reads `BrowserJShell` from the jar inside it), so only pinned bytes (`pins.env`'s file
>   table, `fetch.sh`'s blob check, `jdk.zip`'s CHECKSUMS line) and the transcript check's one list of allowed differences
>   change.
>
> **Also decided in this plan, for the author's review** (the research critic's defaults, `~/java_foundations-notes/plan3b-critique.md`
> section 4): JDK 25 only; our own scoped NOTICE (not upstream's 4.5 MB rollup), both Ristretto license texts shipped and
> neither elected, the IJG sentence added; the crate and npm tarballs the wasm and worker contain go into `source.tar.gz`; the
> transcript check's real side is a live Python pty driver that fails, never skips, without `python3`; the check drives the
> page's own client (`JShellSession`), not a second harness; the research's 72 entries; storage is the entry history only,
> plus Cache Storage (`jf-scratchpad`, one entry per file keyed by its own SHA-256), both said on the page; the panel answers `/help`, `/help intro`, `/open`
> and `/save` itself with course-owned lines (Ristretto's own text promises a UI this panel does not have); feature detection
> is `javaSupport()` plus SIMD, bulk memory and `crypto.subtle`; the browser test's scratchpad visit is in this plan (the
> roadmap row that says Plan 4 is corrected); front-end differences are documented, not patched (D55's session replaces the
> front end); the panel is shut on every page load.
>
> **Also decided while assembling the drafts, for the author's review** (rulings A1-A21 and B1-B11, copied into the worksheet):
> the boxes' notices become tracked copies in `runtime/legal/`, written by Plan 1's `package.sh` (a new local release of the
> same bytes) and tied to `runtime/CHECKSUMS`, and the build's best-effort license download goes; `manifest.json` lists only
> the browser's files, so a reworded notice never empties a reader's cache; a fresh clone builds only after `fetch.sh` and
> `package.sh` until Plan 4 publishes the release; the real jshell runs with in-memory preferences (macOS keeps jshell's
> history in the user's preferences whatever `HOME` says); an out-of-memory ending is told apart from a crash; a fresh
> session starts by itself after Stop, the backstop, an output cap, a crash or running out of memory, but not after `/exit`
> or a failed load; the jshell transcript never wraps, so carets stay under what they point at; a test hook
> (`window.jfScratchpadLimits`, set by no page) shortens the backstop in the browser test. After the pre-flight (rulings
> P1-P10): the separate front-end jar route is dropped (the front end arrives as a rebuilt `jdk.zip`); a `...>` continuation
> can be cancelled (Escape, Ctrl+C, or a Cancel button on phones); the panel answers `/reload` itself; the scratchpad's script
> loads apart from the boxes', so its faults never stop a box.
>
> **Decided at the plan review (2026-10-01):** D58: both runtimes' `SOURCES.txt` carry GPLv2's three-year written offer of
> the source, asked for in the repository's issues (Tasks 1, 2, 7). D59: the jshell history and `REPLAY_RESTORE` the
> research runs left in the author's macOS preferences were backed up and cleared. D60: every "Also decided" item stands.
> D57: The author reviews the plan before it is executed.

> **Amended after the course's front end merged (D61-D63, 2026-10-01; this amendment is D62).** The clean-room front end
> built in its own session is in main (1d5e57b, `runtime/jshell/`), and this plan now ships it from day one. That reverses
> P1 (the jar travels separately and is composed with Ristretto's pinned zip in the reader's browser), P3 (the front end
> answers `/reload`, and `/help`, `/open` and `/save` too, J2), and the critic's defaults "a live Python pty driver" and "the
> panel answers /help, /help intro, /open and /save". Ruled in the amendment, for the author's review: compose at load, not at
> release (every upstream byte stays pinned as published, the composed zip exists only in memory, made by the same
> `compose.mjs` the front end's proof runs, and a front-end fix costs readers 54 KB, not 22 MB); the front end's
> `runtime/jshell/test/check.mjs` is this plan's one transcript check, its "ours" side driving the page's own client. Carried
> from the front end: J1 (the scratchpad's startup imports), J2 (course-written help), J3 (en_US).

**Goal:** every chapter page offers a scratchpad: a jshell that runs in the reader's browser on Ristretto, pinned by our own
hashes and served from the site, loaded only when the reader opens it, stoppable, honest about its limits, tested in
Chromium, WebKit and Firefox, and checked entry by entry against the real jshell with every difference pinned.

**Architecture:** the build verifies Ristretto's five files and the course's front-end jar against
`runtime/ristretto/CHECKSUMS` and publishes them unmodified under `site/scratchpad/` with a generated `manifest.json` and
their legal files. The page's panel (`web/page/scratchpad.mjs`) drives Ristretto's worker through an environment-agnostic
client (`web/page/jshell-session.mjs`), which verifies the files, composes the jar into Ristretto's `jdk.zip` in memory
(`web/page/compose.mjs`), and is the same client the front end's transcript check drives under Node
(`runtime/jshell/test/check.mjs`). The client owns the stop policy (Stop, a 60 s backstop, output caps) and says every
ending in plain words.

**Tech Stack:** JavaScript ES modules (no framework, no bundler), Web Workers, Ristretto v0.34.0's web build (pinned bytes),
the course's jshell front end (`runtime/jshell/`, Java 25, built with the pinned JDK), the build from Plan 2 (Java 25), Node
25, `playwright-core` 1.63.0 with Chromium, WebKit and Firefox, Python 3 (`package.sh` reads Cargo.lock), bash (the release
tools, in Plan 1's style).

**Spec:** [DESIGN.md](../../../DESIGN.md) sections 1, 2, 5, 7 and 8; decisions D7, D14, D18, D21, D29, D36 and D45-D63 in the
[worksheet](../../../WORKSHEET-2026-09-26-java-port.md). Research: `~/java_foundations-notes/plan3b-{ristretto,licenses,transcript,page,build,critique}.md`
and `jshell-spike-{ristretto,tool,probe}.md` (outside the repository; their working files are under `runtime/.work/plan3b-research/`
and `runtime/.work/jshell-spike/`). Plans 1-3 built what this plan consumes.

## Global Constraints

- Machine: no system JDK. `J=runtime/.work/jdk25/jdk-25.0.4.1+1/Contents/Home/bin/java`. Node is `node` (v25.9.0 here).
  `npm` is used only for `playwright-core`. `python3` 3.11 or newer (3.14.7 here): Task 1's `package.sh` reads Cargo.lock
  with `tomllib`. Task 1 needs the network (GitHub, crates.io, the npm registry); nothing after it does.
- The real jshell runs only through `runtime/jshell/test/RealJShell.java` (the tool's builder with in-memory persistence),
  never the `jshell` binary: on macOS the binary keeps its history and settings in the author's own
  `~/Library/Preferences/com.apple.java.util.prefs.plist` whatever `HOME` says. A task that runs the real tool hashes that
  file before and after and says it did not change.
- Never bind port 8731 (the Python course's dev server). Tests serve on port 0 on 127.0.0.1.
- The page talks to nobody: every request the scratchpad makes goes to the site's own origin, and the browser test fails on any
  other. Nothing may need COOP/COEP (D7); Ristretto's web build needs no SharedArrayBuffer, threads or JSPI (research: it boots
  with all three removed).
- The scratchpad loads only when opened (D29): no request under `site/scratchpad/` before the reader opens the panel, and the
  panel is shut on every page load.
- Ristretto's five files are published unmodified, beside the course's front end (`browser-jshell.jar`, built
  byte-reproducibly from `runtime/jshell/src/`). The build verifies every published file against
  `runtime/ristretto/CHECKSUMS`; the client verifies again (SHA-256 through `crypto.subtle`, against the `manifest.json` the
  build writes) the five files it downloads and caches (`jdk.zip`, the wasm and the jar), composes the jar into `jdk.zip` in
  memory, and starts `worker.js` by URL like the page's own scripts, under the manifest's version (`worker.js?v=<version>`),
  the manifest itself asked of the site past the HTTP cache.
- Scratchpad limits (D49): an entry is stopped by the reader's Stop or by a 60,000 ms backstop; output stops at 1,000,000
  characters or 100,000 lines per entry; a boot that has not answered in 240,000 ms is a failed load (Firefox measured 55-61 s
  on a fast machine). A stop ends the session; the panel starts a fresh one and says why in plain words.
- Browsers: the minimum versions stay Chrome 119, Firefox 120 and Safari 18.2 (macOS and iOS): everything the scratchpad
  needs beyond `javaSupport()` (SIMD, bulk memory, `crypto.subtle` in a secure context) is older. Support is detected by
  feature, never by user agent.
- 390 px: with the panel open, no page scrolls sideways.
- Reader-facing text: American spelling, closed em dashes (word—word), "course" not "book". Text jshell prints is shown
  verbatim.
- Publishing by whitelist: a file reaches `site/` only because the build wrote it on purpose; `Publish.guard` still scans
  everything afterward.
- Clean room (D14): no task changes TeaVM or reads OpenJDK or Corretto source. The Corretto source archive is downloaded,
  hashed and copied whole, never extracted or listed (D51): its copies (`runtime/.work/ristretto/corretto-download-*.tar.gz`,
  `runtime/.work/ristretto/inputs/*-25.0.4.10.1.tar.gz`, the Corretto member of every `release/*/source.tar.gz` and the
  staged copies under `release/.tmp-*/`, the release's own staging directory included since the final review) join D51's list. Ristretto's own source (Apache-2.0 OR MIT) may be read.
- The course's jshell front end (D55, D56) is in `runtime/jshell/` (1d5e57b). Its Java is outside this plan; a change to
  it follows its own clean room (D14): derivation evidence in `runtime/jshell/DERIVATION.md` verified by
  `derive/check-observations.mjs`, a re-pin (`node runtime/jshell/test/pin.mjs`), and `check.mjs` and `breaks.mjs` rerun.
  Tasks 3 and 4 change the front end's test files and move `compose.mjs` to `web/page/`, never its Java; `breaks.mjs` is
  rewritten and rerun in Task 4, not Task 3, because the old one needs an upstream-layout site.
- New code files carry the Apache-2.0 header with `Copyright 2026 Java Foundations contributors`; fixture data files carry none.
- Scripts exit 0 when every check passes, 1 when one fails, 2 on misuse. Test output follows `runtime/test/runner-safety.mjs`:
  one `  ok    <label>` or `  FAIL  <label>  got <json>` line per check.
- Scratch goes to `build/.work/` or `runtime/.work/` (git-ignored), never `/tmp`. Fixtures a test may edit are real copies,
  never symlinks (Node's `fs.cpSync` keeps a symlink, so a copy-then-edit writes through to the original).
  `runtime/jshell/build.sh` writes `runtime/.work/jshell/out/`: never run `package.sh` and `check.mjs` at the same time.
- Every gate is proven by breaking something on purpose, and the commit message says how and with what exit code. Every check
  in this plan names the break that fails it. Never `--no-verify`; never push.

## Review Focus

1. **Nothing is fetched until the reader opens the scratchpad, and nothing leaves the origin after.** Tests: Task 5
   (`scratchpad-panel.mjs`), Task 6 (`scratchpad.mjs`, and `page.mjs`'s check that a page whose boxes run downloads nothing
   of the scratchpad).
2. **A runaway entry (an endless loop, endless printing, a 1,025-line `StackOverflowError` trace, memory used up) never freezes
   or crashes the page:** the reader gets a plain-words ending and a fresh session. Tests: Task 3 (a fake worker and the real
   one), Task 6 (memory past 2 GiB, the long-session ending, met in one entry in Node and each browser).
3. **Every published byte is pinned and verified by the build, the five downloaded files again by the client,** and a
   missing legal file fails the build for both runtimes. Tests: Task 1 (verify.sh), Task 2 (BuildTest), Task 3 (a corrupted
   asset).
4. **The transcript check fails loud** on an unannounced difference, on an announced one that stops firing, and on a moved
   hash, and it proves the page's own client with the shipped bytes. Test: Task 4 (`check.mjs`, `breaks.mjs`).
5. **What the scratchpad is, and is not, is said plainly:** Firefox's slow open (with progress, a `/reset` included), the
   announced differences from the JDK's jshell, the stop policy, and that a reader is never stuck at a `...>` continuation.
   Tests: Task 5 (the panel's about line and cancel checks), Task 6 (the phases in a real open, a real `/reset`); text: Task 7.
6. **What readers run is what the proof proves:** the jar the page composes is the one `check.mjs` holds to the real jshell
   (one hash in `pins.json`, refused by `package.sh` otherwise), composed by the same `compose.mjs`, and Ristretto's five
   files stay its deploy bytes. Evidence: Task 1 (package.sh, verify.sh), Task 3 (compose after verifying), Task 4.

## Files

| Path | Task | Responsibility |
|---|---|---|
| `runtime/ristretto/pins.env`, `runtime/ristretto/CHECKSUMS` | 1 | where Ristretto's bytes came from; the hash of every published file |
| `runtime/ristretto/fetch.sh`, `verify.sh`, `package.sh` | 1 | download and verify Ristretto's five files; check a directory; build the course's jar and assemble a scratchpad release with its legal files and source |
| `build/LegalFiles.java`, `build/LegalFilesTest.java` | 2 | D53's one check: a runtime is published only with its notices |
| `build/ScratchpadFiles.java`, `build/ScratchpadFilesTest.java`, `build/testdata/scratchpad-fixture/` | 2 | the build installs `site/scratchpad/` and its `manifest.json`; a tiny fixture release for the build's tests |
| `build/RuntimeFiles.java`, `build/RuntimeFilesTest.java`, `runtime/legal/`, `runtime/release/package.sh` | 2 | the boxes' notices from the tracked `runtime/legal/`, tied to `runtime/CHECKSUMS`; `fetchAux` gone |
| `build/Build.java`, `build/BuildMainTest.java`, `build/BuildTest.java`, `build/Fixtures.java` | 2 | `--scratchpad <dir>`; the new suites; fixture projects carry the scratchpad and the notices |
| `build/Volume.java`, `build/VolumeTest.java` | 2 | reserved site names refused as volume names |
| `build/Pages.java`, `build/PagesTest.java` | 2, 5 | `site/page/` and `site/runner/` emptied before copying; the three new page scripts by whitelist |
| `web/test/harness.mjs` | 2 | `SCRATCHPAD`; `buildSite` builds with the scratchpad |
| `web/page/jshell-session.mjs`, `web/test/jshell-session.mjs` | 3 | the client the page and the check share: download, verify, cache, compose, protocol, restarts, stop policy, endings in words |
| `web/page/compose.mjs` (moved from `runtime/jshell/`) | 3 | the course's jar composed into Ristretto's `jdk.zip` in memory |
| `web/test/jshell-node.mjs` | 3 | Ristretto's real worker under Node, in a worker thread |
| `runtime/jshell/test/check.mjs`, `drive.mjs`, `ristretto.mjs`, `browser.mjs`, `browser/page.mjs`, `browser/index.html`, `breaks.mjs`, `rist-sweep.mjs`, `pins.json`, `pin.mjs` (its header comment only; `measure.mjs` deleted) | 3, 4 | the one transcript check, its ours side the page's own client; the proof of its gates |
| `web/page.html`, `web/app.css`, `web/app.mjs`, `web/page/support.mjs`, `web/page/wire.mjs` | 5 | the tab and the panel; feature detection; the unsupported case; the panel loaded apart from the boxes |
| `web/page/scratchpad.mjs`, `web/test/scratchpad-panel.mjs` | 5, 8 | the panel; the panel in three browsers against a stand-in worker |
| `web/test/scratchpad.mjs` | 6, 8 | the real scratchpad in three browsers |
| `web/test/page.mjs` | 5, 6 | nothing of the scratchpad loads until opened; a box still runs without the scratchpad's code |
| `DESIGN.md`, `README.md`, `volumes/README.md`, `docs/superpowers/plans/2026-09-27-roadmap.md` | 7, 8 | what the scratchpad is, its limits and licenses; the device results |

## Interfaces between tasks (the contract every task's text must keep)

- **Pin (Task 1):** `runtime/ristretto/CHECKSUMS` lists `<sha256>  <name>`, sorted (`LC_ALL=C`), for every file the
  scratchpad release publishes (114 lines): the six runtime files under their published names (`worker.js`, `jdk.zip`,
  `runner.core.wasm`, `runner.core2.wasm`, `runner.core3.wasm`, and `browser-jshell.jar`, the course's front end) and the
  legal files (`NOTICE`, `LICENSE-APACHE`, `LICENSE-MIT`, `THIRD-PARTY.txt`, `SOURCES.txt`, and the 103 files
  `legal/<module>/<file>` from `jdk.zip`). Ristretto's five files are its unmodified deploy bytes; `jdk.zip` still holds
  Ristretto's own `browser-jshell.jar`, which the page replaces at load. `runtime/ristretto/pins.env` (sourced by `fetch.sh` and
  `package.sh`; `verify.sh` reads only `CHECKSUMS`) records where Ristretto's bytes came from: its version, tag commit and deploy commit, the live site and the deploy
  commit's raw files as two bases, each file's path and git blob SHA-1, the Corretto tag, commit and source archive's hash,
  and `<sha256>  <url>` for every input `package.sh` downloads. `bash runtime/ristretto/fetch.sh` downloads and verifies the
  five upstream files into `runtime/.work/ristretto/v0.34.0/`; `bash runtime/ristretto/package.sh scratchpad-YYYY.MM.DD-N`
  builds the front end's jar with `sh runtime/jshell/build.sh`, refuses unless it equals the `jar` pin in
  `runtime/jshell/test/pins.json`, and assembles `runtime/.work/ristretto/release/<release>/` (the six files, the legal files
  with a NOTICE section and a SOURCES.txt entry for the course's jar, `CHECKSUMS`, `source.tar.gz` holding
  `runtime/jshell/src/` and `build.sh` besides the upstream sources), rewrites the tracked CHECKSUMS from it and points
  `runtime/.work/ristretto/current` at it (byte-identical output for the same pins and sources); `sh
  runtime/ristretto/verify.sh <dir>` checks a directory against CHECKSUMS, the jar among the required names. All three exit
  0, 1 (a file differs or an input fails), 2 (something missing, or misuse).
- **Build (Task 2):** `java build/Build.java [--project <dir>] [--check] [--runtime <dir>] [--scratchpad <dir>]`; the
  scratchpad source is `--scratchpad`, else `runtime/.work/ristretto/current`, else a `BuildError` naming `fetch.sh`,
  `package.sh` and the flag. `ScratchpadFiles.install` reads the project's `runtime/ristretto/CHECKSUMS`, verifies the source,
  replaces `site/scratchpad/` with exactly the listed files plus `manifest.json`, and verifies the copies.
  `site/scratchpad/manifest.json` = `{"version", "files": {name: {"sha256", "size"}}}`: `files` holds the six runtime files,
  never a legal file; `version` is the first 16 hex digits of the SHA-256 of those files' CHECKSUMS lines.
  `build/LegalFiles.java` (D53): `LegalFiles.require(Path dir, List<String> names)` fails the build naming every missing or
  empty file; `RuntimeFiles.install` calls it on `site/runtime/` and `ScratchpadFiles.install` on `site/scratchpad/`. The boxes'
  runtime takes its legal files only from the tracked `runtime/legal/` (written by Plan 1's `runtime/release/package.sh`
  with the release's `CHECKSUMS`), and only when `runtime/legal/CHECKSUMS` equals `runtime/CHECKSUMS`; `fetchAux` is gone.
  `Volume.RESERVED` (`runtime`, `runner`, `page`, `scratchpad`, ignoring case) fails a volume directory so named.
  `web/test/harness.mjs` exports `SCRATCHPAD` (`JF_SCRATCHPAD`, else `runtime/.work/ristretto/current`), and `buildSite`
  builds with it, so every built test site carries `site/scratchpad/` from Task 2 on.
- **Client (Task 3):** `compose.mjs` moves from `runtime/jshell/` to `web/page/compose.mjs` (one copy; the front end's
  tests import it from there) and keeps `withFrontEnd(zip, jar)`. `web/page/jshell-session.mjs` exports `ASSETS` (`jdk.zip`,
  the three wasm files and `browser-jshell.jar`: what the client downloads, verifies and caches), `COMMANDS` (the front end's
  command names, which a check keeps equal to `Commands.java`'s `NAMES`) and `class JShellSession(base, { deadlineMs = 60_000, bootDeadlineMs = 240_000, outputLimitChars = 1_000_000, outputLimitLines =
  100_000, onOutput(text, stream), onState(state), onProgress(phase), createWorker(url), fetchBytes(url, init), caches })` with
  `state` (`idle | loading | ready | busy | ended`), `endedBy` (`stopped | timeout | output-limit | out-of-memory | crashed |
  exited | failed-to-load`), `endedWords` (the ending in plain words), `banner`, `start() -> Promise<{ banner, prompt }>`
  (rejecting with an `Error` whose `reason` is `endedBy`; `failed-to-load` when the browser will not start the worker, a
  boot has not answered within `bootDeadlineMs`, or the manifest gives no `version`), `submit(line) -> Promise<{ status: "ready", continuation, prompt }
  | { status: "ended", reason }>` (`prompt` is the next prompt the front end gives, e.g. `"\njshell> "`, `"   ...> "`, or a
  feedback mode's own; rejecting when not `ready` or when `line` holds a newline: one line per request, so a caller splits
  pasted text), `cancel()` (the front end forgets an unfinished snippet, `/exit` included; the same result shape as
  `submit`), `stop()`; `onProgress` phases `download | engine | jshell` (`download` only when the files are not already in
  memory). A restart line (`/reset` or `/reload` as the front end resolves command names, against `COMMANDS`; never a line
  typed at a continuation) gets an `onProgress("jshell")` as it is sent and the boot deadline, a `/reload` also twice the
  time the session's entries (restarts aside) have taken since `start()`, while Ristretto's worker starts a fresh VM inside
  that one request; one that does not answer by then ends the session as `failed-to-load` ("after /reload, jshell did not
  answer within N seconds"). The client never restarts jshell itself. `base` is the URL of `site/scratchpad/`. It fetches `manifest.json` past the HTTP cache (`{ cache: "no-cache" }`), then each of `ASSETS`,
  verifies each SHA-256 with `crypto.subtle`, keeps each verified file in Cache Storage keyed by its own hash (the one cache
  `jf-scratchpad`, keys `<base><name>?sha256=<hash>`: a new jar never evicts the 22 MB zip; entries no longer in the manifest
  are deleted), composes `withFrontEnd(jdk.zip,
  browser-jshell.jar)` and hands the result to the worker as its `jdk.zip` asset, starts the worker at `<base>worker.js?v=<the manifest's version>`, and speaks
  Ristretto's unmodified protocol (request `{id, javaVersion: 25, action: "jshell", className: "BrowserJShell", source,
  operation: "input" | "complete" | "cancel", cursor}`; events `phase`, `output {stream, text}`, and exactly one terminal event
  per request: `ready`, `completions`, `error` or `done`); Ristretto's own 1 MiB output stop, in either wording, ends the
  session as `output-limit`. After an `error`, the VM is gone: the session ends and a new one
  needs a new worker. `web/test/jshell-node.mjs` gives the client a browser under Node: `nodeWorker(url)` (the real worker in
  a `node:worker_threads` thread; `exited`, a promise the thread's exit resolves), `nodeFetchBytes(url)`,
  `scratchpadDir(argv, usage, siteName)`, `dirUrl(dir)`. A test's `--scratchpad <dir>` takes a built site's `scratchpad/`
  (holding `manifest.json`), never a release directory.
- **Check (Task 4):** the one transcript check is the front end's `node runtime/jshell/test/check.mjs` (in main since
  1d5e57b): ten session files, 562 entries, byte for byte against the real jshell started through its builder with
  in-memory persistence (`RealJShell`, J1 startup, en_US), never the binary, with five announced differences (`startup`,
  `engine`, `frames`, `message`, `own`) that must fire where announced. Task 4 makes its "ours" side drive `JShellSession`
  through `jshell-node.mjs`, so the page's own client is what the check proves, and has it read Ristretto's files and the jar
  from a built site's `scratchpad/` (`--scratchpad <dir>`, default the fixture site `jshell-check-site` that
  `harness.buildSite` builds), Ristretto's hashes from `runtime/ristretto/CHECKSUMS` (one pin list), the jar's from
  `pins.json`; its browser mode drives the same client on a staged page served with no header but a content type.
  `runtime/jshell/test/breaks.mjs` stays the proof of its gates; an off-origin break is recorded and aborted, never sent
  (proved against a local canary).
- **Page (Task 5):** `web/page.html` carries `button.scratch-tab[hidden]` and `section#scratchpad.scratchpad[hidden]`
  (markup in Task 5) on every page the template renders; `web/page/support.mjs` exports `scratchpadSupport() -> { ok,
  missing }` (`javaSupport()`'s gaps plus WebAssembly SIMD, bulk memory and `crypto.subtle`); `web/app.mjs` marks a browser
  that cannot run the scratchpad (`document.documentElement.dataset.scratchpad = "unsupported"`) and makes the panel say why;
  `web/page/scratchpad.mjs` exports `wireScratchpad(panel, tab, base, limits = {})` (`limits`: the client's four limits,
  from `window.jfScratchpadLimits`, a test hook no page sets), which sets `dataset.scratchpad = "ready"`; `wire.mjs` sets
  `failed` instead when the panel's code does not load or wire, and sets either after `data-java`, which never waits for
  the scratchpad. The panel's header holds `.scratch-title`, `.scratch-cancel` (shown only at a continuation),
  `.scratch-stop`, `.scratch-new` and `.scratch-close`. `panel.dataset.state` is `shut` until the first open, then the
  session's `loading | ready | busy | ended` (`ended` only once the ending's words are on screen); `panel.dataset.session`
  counts sessions from 1 and `panel.dataset.ended` holds the last `endedBy`; `document.body.dataset.sheet` is `shut` from the
  wiring on, `open` while the sheet shows (the unsupported sheet's too, which also sets `--sheet`, so the page's end scrolls
  above it). The panel shows `start()`'s banner, `onOutput`'s text, each answer's `prompt`, the
  client's `onProgress` phases in words (D54; a `/reset` or `/reload` shows words of its own, "Starting a fresh jshell", with
  the timer and no time claim) and `endedWords`, and starts a fresh session
  by itself after `stopped`, `timeout`, `output-limit`, `out-of-memory` and `crashed`. At a `...>` continuation, Escape or
  Ctrl+C (nothing selected) or the `.scratch-cancel` header button (shown only then) calls `cancel()`. The about line ends by saying what
  Stop and Cancel do. The panel answers no
  command itself: `/help`, `/open`, `/save`, `/reload` and the rest go to the front end. So does an empty line at a plain
  prompt, which the front end answers with its prompt. `web/page/wire.mjs` loads
  `scratchpad.mjs` by dynamic import, isolated, so a scratchpad fault never stops a box from running. History:
  `localStorage["jf:scratchpad:history"]`, the last 100 entries. `Pages.WEB_SCRIPTS` gains `page/scratchpad.mjs`,
  `page/jshell-session.mjs` and `page/compose.mjs`. Nothing under `site/scratchpad/` is requested before the reader opens the
  panel. `node web/test/scratchpad-panel.mjs [chromium|webkit|firefox]` tests the panel against a stand-in worker that
  answers as the course's front end does (prompts included).
- **Browser test (Task 6):** `node web/test/scratchpad.mjs [chromium|webkit|firefox]` opens the real scratchpad (the course's
  front end composed in the browser) through `harness.buildSite`, compares the browsers' transcripts with the same client's
  under Node (`jshell-node.mjs`), runs a real `/reset` in each engine, and prints each engine's open-to-ready time by phase,
  its first entry's time and its `/reset` time; `web/test/page.mjs` gains the check that a page whose boxes run downloads
  nothing under `scratchpad/`.

## Tasks

### Task 1: pin Ristretto and package the scratchpad release

**Files:**
- Create: `runtime/ristretto/pins.env`, `runtime/ristretto/CHECKSUMS` (written by hand with five lines in Step 2, then by
  `package.sh`), `runtime/ristretto/fetch.sh`, `runtime/ristretto/verify.sh`, `runtime/ristretto/package.sh`
- Read, never changed: the course's front end in `runtime/jshell/` (main since 1d5e57b): `build.sh`, `src/`, and the `jar`
  pin in `test/pins.json`
- Not tracked, made here: `runtime/.work/ristretto/v0.34.0/` (the five files), `runtime/.work/ristretto/inputs/` (every
  input `package.sh` downloads, Corretto's source archive among them), `runtime/.work/ristretto/release/<release>/`, the
  pointer `runtime/.work/ristretto/current`, and `runtime/.work/jshell/out/` (where `build.sh` writes the jar; the front
  end's own `check.mjs` builds the same jar there)

**Interfaces:**
- Consumes: nothing from earlier tasks. From main: the course's front end, `runtime/jshell/` (1d5e57b): `build.sh`, `src/`
  and the `jar` pin in `test/pins.json` (`e5ee02f4…`). Upstream: Ristretto v0.34.0's web build on GitHub Pages (deploy
  commit `4a4b5867`), Ristretto's v0.34.0 release asset `source.tar.gz`, crates.io, the npm registry, Corretto 25.0.4.10.1's
  tag archive.
- Produces: `runtime/ristretto/CHECKSUMS`, `<sha256>  <name>` sorted by name (`LC_ALL=C`), for every file the release
  publishes: the six runtime files `worker.js`, `jdk.zip`, `runner.core.wasm`, `runner.core2.wasm`, `runner.core3.wasm` and
  `browser-jshell.jar`, and the legal files `NOTICE`, `LICENSE-APACHE`, `LICENSE-MIT`, `THIRD-PARTY.txt`, `SOURCES.txt` and
  the 103 files `legal/<module>/<file>` (114 lines). Ristretto's five are its unmodified deploy bytes; `jdk.zip` still holds
  Ristretto's own `browser-jshell.jar`, which the page replaces at load (Task 3). The published `browser-jshell.jar` is the
  course's front end, built by `runtime/jshell/build.sh`; its one pin is the `jar` value in `runtime/jshell/test/pins.json`
  (the jar the front end's `check.mjs` holds to the real jshell), and its CHECKSUMS line follows from it. A front-end change
  is re-pinned there (`node runtime/jshell/test/pin.mjs`) and packaged again; Ristretto's pins do not move.
- Produces: `runtime/ristretto/pins.env` (sourced by `fetch.sh` and `package.sh`; `verify.sh` reads only `CHECKSUMS`): `RISTRETTO_VERSION`, `RISTRETTO_COMMIT`,
  `RISTRETTO_DEPLOY_COMMIT`, `RISTRETTO_SITE`, `RISTRETTO_DEPLOY_RAW`, `RISTRETTO_FILES` (`<published name>  <path under the
  site>  <git blob SHA-1>` per file), `RISTRETTO_SOURCE_URL`, `RISTRETTO_SOURCE_PREFIX`, the two license-text hashes, the
  Corretto version, commit, source and binary URLs and hashes, the GPL text's hash, the compilers' commits, and
  `SOURCE_INPUTS_SHA256` (`<sha256>  <url>` for every file `package.sh` downloads).
- Produces: `bash runtime/ristretto/fetch.sh` (no arguments): the five files into `runtime/.work/ristretto/v0.34.0/` under
  their published names, verified; exit 0, 1 (a download failed or a file differs; a differing file is never overwritten),
  2 (misuse).
- Produces: `bash runtime/ristretto/package.sh scratchpad-YYYY.MM.DD-N`: first builds the front end with `sh
  runtime/jshell/build.sh` (the pinned JDK) and refuses unless the jar's SHA-256 is the `jar` value in
  `runtime/jshell/test/pins.json`; then writes `runtime/.work/ristretto/release/<release>/` (the six files, the legal files
  with a NOTICE section and a SOURCES.txt entry for the course's jar, `CHECKSUMS`, and `source.tar.gz`, which holds
  `runtime/jshell/src/` and `build.sh` besides the upstream sources), rewrites the tracked `CHECKSUMS` from it, and points
  `runtime/.work/ristretto/current` at it (a relative symlink, `current -> release/<release>`); exit 0, 1 (an input, the
  front end's build or pin, or a cross-check failed; the tracked `CHECKSUMS` and `current` are untouched), 2 (misuse). The
  same pins and sources packaged twice give byte-identical `CHECKSUMS` and `source.tar.gz`.
- Produces: `sh runtime/ristretto/verify.sh <dir>`: 0 when every CHECKSUMS line matches, 1 when a file differs, 2 when
  something is missing (CHECKSUMS itself, a required name's line, a listed file) or on misuse; missing outranks differs.
  The required names are the six runtime files, `browser-jshell.jar` among them, and the legal files.

Clean room for this task (D14, D51): Corretto's source archive is handled by `curl`, `wc -c`, `shasum`, `mv`, `cp` and
`rm` only. Never `tar`, `gunzip`, `zcat`, `file` or any listing of it, and never open the outer `source.tar.gz`'s
Corretto member. (Two uses are not "of it": `package.sh` stamps the staged copy's mtime and archives it whole as one
member of the outer `source.tar.gz`, and Step 4 lists the outer archive's own members, which names the Corretto member
and its size without reading inside it.) From `jdk.zip` only `legal/*` is ever extracted (by `package.sh`); never
`lib/modules`, never `javap`. Ristretto's own source (Apache-2.0 OR MIT) may be read. The course's front end is built,
hashed and archived here, never changed: a change to `runtime/jshell/` goes through its own clean room (Global
Constraints). Step 4's breaks edit `runtime/jshell/test/pins.json` and `runtime/jshell/src/BrowserJShell.java` in the
working tree only, each restored exactly (`git checkout --` the file, then `git diff --exit-code runtime/jshell`) before
the next; nothing committed changes them.

- [ ] **Step 1: Re-check upstream on the day (stop if anything moved)**

Run each and compare with the expected value:
```bash
gh api repos/theseus-rs/ristretto/compare/v0.34.0...main --jq '{ahead_by, behind_by, status}'
gh api repos/theseus-rs/ristretto/releases/latest --jq .tag_name
gh api repos/theseus-rs/ristretto/git/ref/tags/v0.34.0 --jq .object.sha
gh api repos/theseus-rs/ristretto/branches/playground-pages --jq '.commit.sha + " " + .commit.commit.message'
gh api repos/corretto/corretto-25/git/ref/tags/25.0.4.10.1 --jq .object.sha
mkdir -p runtime/.work/ristretto/recheck && cd runtime/.work/ristretto/recheck && \
  for p in assets/runner.worker-DguS-WMz.js runtime/31fed6b4cd242fb1-jdk-25.zip runtime/612f0dd3c12f268a-runner.core.wasm \
      runtime/c473092805a4a7ee-runner.core2.wasm runtime/dfc7ad43bbd16ac2-runner.core3.wasm; do
    curl -fsSL "https://theseus-rs.github.io/ristretto/$p" -o "$(basename "$p")" \
      && echo "$(shasum -a 256 "$(basename "$p")" | cut -d' ' -f1) $(git hash-object --no-filters "$(basename "$p")") $p"
  done; cd -
```
Expected: `{"ahead_by":0,"behind_by":0,"status":"identical"}`; `v0.34.0`; `8448588ecfcedf79a59d697939493f289c1c6ad7`;
`4a4b58677da6fff1e92bc9fed78e9a3d9a3a7525 Deploying to playground-pages from @ theseus-rs/ristretto@8448588ecfcedf79a59d697939493f289c1c6ad7 …`;
`c63f7d4b8e3a9f39c58e625f65f2435d7039416d`; and these five lines (SHA-256, git blob, path):
```
0a23e53fee6b8bd03871e01138c9764b489437cf7e02b5b618b3fe75774542e2 acbb1664442ea157e159ad433b538a00b05501ad assets/runner.worker-DguS-WMz.js
31fed6b4cd242fb1acbfeddc5ec52dd0ab9c7690cd95b681f132fb62d9328984 b84eb24f035889b44c7c2f2e8236d81e41c63018 runtime/31fed6b4cd242fb1-jdk-25.zip
612f0dd3c12f268a9edfe6410c5339cf59ca85600b6b0ba003af63b1577ce38d 0311b5a6341f70aaada6a9cb1d7883060a7ea6cd runtime/612f0dd3c12f268a-runner.core.wasm
c473092805a4a7ee4290139e9ac71c5d8e23cfd195e445cd5e606fd987c80ff4 3c39e1086b56b7ef0263d417e89c92e6c9740e3e runtime/c473092805a4a7ee-runner.core2.wasm
dfc7ad43bbd16ac21e18736e15d2b76417c8d38b5f79d355511c45f34d72ba88 e3c4e730f9752001576c2e19c828ec4441869166 runtime/dfc7ad43bbd16ac2-runner.core3.wasm
```
If any value differs, or a download fails (upstream has redeployed and the old names 404), stop and report to the
controller with the output: the choice of v0.34.0 reopens (critique section 5). Do not pin newer bytes on your own.
Delete `runtime/.work/ristretto/recheck/` afterward.

- [ ] **Step 2: Write the pin file, the five-line CHECKSUMS, `fetch.sh` and `verify.sh`, and prove both scripts fail**

Create the directory first (`mkdir -p runtime/ristretto`; nothing earlier makes it).
`runtime/ristretto/pins.env`, exactly (the Corretto archive's pin is filled in Step 4; until then `package.sh` refuses to
run, which Step 4 shows):
```bash
# Copyright 2026 Java Foundations contributors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# What the scratchpad's release is made from, pinned (D52). The bytes the site publishes are pinned in CHECKSUMS
# beside this file; this file says where they came from and pins every input package.sh reads to write the legal
# files and source.tar.gz. Change a pin here, rerun fetch.sh and package.sh, and review the CHECKSUMS diff.
#
# Ristretto v0.34.0 (Apache-2.0 OR MIT): tag v0.34.0 is commit 8448588e (lightweight tag; gh api
# repos/theseus-rs/ristretto/git/ref/tags/v0.34.0). Its web build is not a release asset: GitHub Pages serves it from
# branch playground-pages, one commit force-replaced at every deploy; the deploy commit below says it was built from
# 8448588e (workflow run 36335818040). Each file's git blob SHA-1 in that commit's tree is recorded so fetch.sh can
# prove the bytes are the ones upstream deployed, not only the ones we hashed.
RISTRETTO_VERSION="0.34.0"
RISTRETTO_COMMIT="8448588ecfcedf79a59d697939493f289c1c6ad7"
RISTRETTO_DEPLOY_COMMIT="4a4b58677da6fff1e92bc9fed78e9a3d9a3a7525"
RISTRETTO_SITE="https://theseus-rs.github.io/ristretto/"
RISTRETTO_DEPLOY_RAW="https://raw.githubusercontent.com/theseus-rs/ristretto/$RISTRETTO_DEPLOY_COMMIT/"
# One line per published file: "<published name>  <path under RISTRETTO_SITE>  <git blob SHA-1 at the deploy commit>".
RISTRETTO_FILES="
worker.js  assets/runner.worker-DguS-WMz.js  acbb1664442ea157e159ad433b538a00b05501ad
jdk.zip  runtime/31fed6b4cd242fb1-jdk-25.zip  b84eb24f035889b44c7c2f2e8236d81e41c63018
runner.core.wasm  runtime/612f0dd3c12f268a-runner.core.wasm  0311b5a6341f70aaada6a9cb1d7883060a7ea6cd
runner.core2.wasm  runtime/c473092805a4a7ee-runner.core2.wasm  3c39e1086b56b7ef0263d417e89c92e6c9740e3e
runner.core3.wasm  runtime/dfc7ad43bbd16ac2-runner.core3.wasm  e3c4e730f9752001576c2e19c828ec4441869166
"
# Ristretto's own source for this version: the release asset GitHub publishes with a .sha256 beside it.
RISTRETTO_SOURCE_URL="https://github.com/theseus-rs/ristretto/releases/download/v$RISTRETTO_VERSION/source.tar.gz"
RISTRETTO_SOURCE_PREFIX="ristretto_javac-$RISTRETTO_VERSION/"
# Both license texts, as the source archive carries them (neither is elected: both ship).
RISTRETTO_LICENSE_APACHE_SHA256="62c7a1e35f56406896d7aa7ca52d0cc0d272ac022b5d2796e7d6905db8a3636a"
RISTRETTO_LICENSE_MIT_SHA256="d44fc70eebad4f87fa514dc4c0361970b776dbc51e1750be24376b70f6ae5c5c"
#
# jdk.zip is a jlink-reduced Amazon Corretto 25.0.4.10.1 (GPLv2 with the Classpath Exception), made by Ristretto's
# web/scripts/build-runtime.mjs from the Linux x64 binary below (web/jdks.json pins its SHA-256; Corretto's release
# notes give the same). Its corresponding source is Corretto's tag archive, which package.sh ships in source.tar.gz,
# downloaded and hashed only, never extracted (D51). GitHub publishes no checksum for an archive: CORRETTO_SOURCE's
# pin is two separate downloads agreeing.
CORRETTO_VERSION="25.0.4.10.1"
CORRETTO_COMMIT="c63f7d4b8e3a9f39c58e625f65f2435d7039416d"
CORRETTO_SOURCE_URL="https://github.com/corretto/corretto-25/archive/refs/tags/$CORRETTO_VERSION.tar.gz"
CORRETTO_BINARY_URL="https://corretto.aws/downloads/resources/$CORRETTO_VERSION/amazon-corretto-$CORRETTO_VERSION-linux-x64.tar.gz"
CORRETTO_BINARY_SHA256="a45f1d385da8221fe1225dde5b6afa8e932a6acb93571b55eff4a39a2ebe7378"
# Every legal/<module>/LICENSE in jdk.zip is this text, the same bytes runtime/pins.env pins for the OpenJDK LICENSE.
CORRETTO_GPL_LICENSE_SHA256="4b9abebc4338048a7c2dc184e9f800deb349366bdf28eb23c2677a77b4c87726"
#
# What runner.core.wasm was compiled with (its producers section): rustc 1.98.1 and wasi-sdk-33. Their sources
# are named in SOURCES.txt, not shipped (none is copyleft); their notices ship in THIRD-PARTY.txt.
RUST_COMMIT="48a229ceaefd4985c50990b14116b6d856af0985"
WASI_LIBC_COMMIT="161b3195fc2558d2b1ba3eb9ffae3b2b47407623"
LLVM_COMMIT="4434dabb69916856b824f68a64b029c67175e532"
#
# Every file package.sh downloads, "<sha256>  <url>", checked on every run, cached copy or not. Where the pins came
# from: Ristretto's source archive, GitHub's published source.tar.gz.sha256; the crates, the "checksum" each has in
# Cargo.lock inside that archive (package.sh checks again); the npm tarballs, the "integrity" each has in
# web/package-lock.json there (package.sh checks again); the Rust and wasi-libc texts, downloads at the pinned
# commits; Corretto's archive, two downloads agreeing (Task 1 Step 3 of Plan 3b). The crates are the 79 the
# wasm32-wasip2 build of ristretto_playground compiles (normal dependencies, target cfg evaluated, proc macros
# excluded; an upper bound); the npm packages are the three worker.js bundles (fflate, preview2-shim and the glue
# jco-transpile generates).
SOURCE_INPUTS_SHA256="
7ed8971c9a9981c4759aca67153733eb39992c3abdb294845c8de53f273380b5  https://github.com/theseus-rs/ristretto/releases/download/v0.34.0/source.tar.gz
TO-BE-PINNED-IN-STEP-4  https://github.com/corretto/corretto-25/archive/refs/tags/25.0.4.10.1.tar.gz
172020dbfd5b53a226dfde77616190a48dcff519b0bc0e6deb91a8450782c4af  https://raw.githubusercontent.com/rust-lang/rust/48a229ceaefd4985c50990b14116b6d856af0985/COPYRIGHT
b71bd43a069ca0641a9ecfe585ca7b3c53b5cc1608f8b68321168698e28b5ea1  https://raw.githubusercontent.com/rust-lang/rust/48a229ceaefd4985c50990b14116b6d856af0985/LICENSE-MIT
62c7a1e35f56406896d7aa7ca52d0cc0d272ac022b5d2796e7d6905db8a3636a  https://raw.githubusercontent.com/rust-lang/rust/48a229ceaefd4985c50990b14116b6d856af0985/LICENSE-APACHE
2711a8b5a5cdfef0e639f96c1aca12ae23d7d64a02d0507f1bdf14d2b27bbc3a  https://raw.githubusercontent.com/WebAssembly/wasi-libc/161b3195fc2558d2b1ba3eb9ffae3b2b47407623/LICENSE
a60eea817514531668d7e00765731449fe14d059d3249e0bc93b36de45f759f2  https://raw.githubusercontent.com/WebAssembly/wasi-libc/161b3195fc2558d2b1ba3eb9ffae3b2b47407623/LICENSE-APACHE
268872b9816f90fd8e85db5a28d33f8150ebb8dd016653fb39ef1f94f2686bc5  https://raw.githubusercontent.com/WebAssembly/wasi-libc/161b3195fc2558d2b1ba3eb9ffae3b2b47407623/LICENSE-APACHE-LLVM
23f18e03dc49df91622fe2a76176497404e46ced8a715d9d2b67a7446571cca3  https://raw.githubusercontent.com/WebAssembly/wasi-libc/161b3195fc2558d2b1ba3eb9ffae3b2b47407623/LICENSE-MIT
c8b789cf5a746611e6300a0cc7750dbf92b61912a709d04e639245f7290656d0  https://raw.githubusercontent.com/WebAssembly/wasi-libc/161b3195fc2558d2b1ba3eb9ffae3b2b47407623/libc-bottom-half/cloudlibc/LICENSE
f9bc4423732350eb0b3f7ed7e91d530298476f8fec0c6c427a1c04ade22655af  https://raw.githubusercontent.com/WebAssembly/wasi-libc/161b3195fc2558d2b1ba3eb9ffae3b2b47407623/libc-top-half/musl/COPYRIGHT
38c2cd824402407b43153c782274aec2ea83ea688e4aa0b743c5f2c305857d92  https://registry.npmjs.org/fflate/-/fflate-0.8.3.tgz
05b3fb46034a30e791723893daab0f0e04a158751694bf291f6b2e57e98bd208  https://registry.npmjs.org/@bytecodealliance/preview2-shim/-/preview2-shim-0.23.0.tgz
72fce45dedf185f979d94b1e2eee2821b5cbdd2618f48ef9e6ceac231af63e6b  https://registry.npmjs.org/@bytecodealliance/jco-transpile/-/jco-transpile-0.12.1.tgz
320119579fcad9c21884f5c4861d16174d0e06250625266f50fe6898340abefa  https://static.crates.io/crates/adler2/adler2-2.0.1.crate
5a15f179cd60c4584b8a8c596927aadc462e27f2ca70c04e0071964a73ba7a75  https://static.crates.io/crates/ahash/ahash-0.8.12.crate
683d7910e743518b0e34f1186f92494becacb047c7b6bf616c96772180fef923  https://static.crates.io/crates/allocator-api2/allocator-api2-0.2.21.crate
330a5ed07fa54e4702c9d6c4174f74427fc0ef6e214bbd677ae50a5099946470  https://static.crates.io/crates/anyhow/anyhow-1.0.104.crate
8b75356056920673b02621b35afd0f7dda9306d03c79a30f5c56c44cf256e3de  https://static.crates.io/crates/async-task/async-task-4.7.1.crate
3ded4057c258ba199e2d26386d3af3780957ecaee6c4ef4041c6b4b8b97c0b06  https://static.crates.io/crates/bitflags/bitflags-2.13.2.crate
72f5acc6cb2ba439de613abc23857ec3d78374d8ed5ac84e9d11336e87da8649  https://static.crates.io/crates/bumpalo/bumpalo-3.20.3.crate
95832e849adfb21180ccb6826a99da14e5d266ae5c2e668e1602cf234f153797  https://static.crates.io/crates/bytemuck/bytemuck-1.25.2.crate
1fd0f2584146f6f2ef48085050886acf353beff7305ebd1ae69500e27c67f64b  https://static.crates.io/crates/byteorder/byteorder-1.5.0.crate
fc652a48c352aef3ea3aed32080501cf3ef6ed5da78602a020c991775b0aff04  https://static.crates.io/crates/bytes/bytes-1.12.1.crate
4e7648175b45a9a48536d676f68d918270699102aa8dab5496df06904c914600  https://static.crates.io/crates/cfg-if/cfg-if-1.0.5.crate
01a7799fd6b852db0e61728dde9a204c423b44d689dbd432522543614b490e78  https://static.crates.io/crates/crc32fast/crc32fast-1.5.2.crate
a31eee39dddec8330830986fcd7625edb5a24ec90ea038215273bbc3adb08ac6  https://static.crates.io/crates/crossbeam-utils/crossbeam-utils-0.8.23.crate
e6361d5c062261c78a176addb82d4c821ae42bed6089de0e12603cd25de2059c  https://static.crates.io/crates/dashmap/dashmap-6.2.1.crate
8d57d423b3c82e89b9a24ca3091fee61f456a26edbd28d26c65906f4bc1dcd8f  https://static.crates.io/crates/dirs/dirs-7.0.0.crate
e01a3366d27ee9890022452ee61b2b63a67e6f13f58900b651ff5665f0bb1fab  https://static.crates.io/crates/dirs-sys/dirs-sys-0.5.0.crate
877a4ace8713b0bcf2a4e7eec82529c029f1d0619886d18145fea96c3ffe5c0f  https://static.crates.io/crates/equivalent/equivalent-1.0.2.crate
39cab71617ae0d63f51a36d69f866391735b51691dbda63cf6f96d042b63efeb  https://static.crates.io/crates/errno/errno-0.3.14.crate
e51093e27b0797c359783294ca4f0a911c270184cb10f85783b118614a1501be  https://static.crates.io/crates/fastrand/fastrand-1.9.0.crate
da7c62ceae207dd37ea5b845da6a0696c799f85e97da1ab5b7910be3c1c80223  https://static.crates.io/crates/fastrand/fastrand-2.5.0.crate
5c287a33c7f0a620c38e641e7f60827713987b3c0f26e8ddc9462cc69cf75759  https://static.crates.io/crates/filetime/filetime-0.2.29.crate
6e634e2e0ebac1ee034020da1ca582e17ffe4e0f5e985823721e168928136dcb  https://static.crates.io/crates/flate2/flate2-1.1.10.crate
77ce24cb58228fbb8aa041425bb1050850ac19177686ea6e0f41a70416f56fdb  https://static.crates.io/crates/foldhash/foldhash-0.2.0.crate
92d699e522242e69e3003b94ecc1f960f3a5e015aa7c5d7486e65ad01dd94f5e  https://static.crates.io/crates/futures-core/futures-core-0.3.34.crate
53c0fa8157de1303bfffdaa1cc2a673bfffb60102f76b0ef4441659124373fed  https://static.crates.io/crates/futures-io/futures-io-0.3.34.crate
49a9d51ce47660b1e808d3c990b4709f2f415d928835a17dfd16991515c46bce  https://static.crates.io/crates/futures-lite/futures-lite-1.13.0.crate
899def5c37c4fd7b2664648c28120ecec138e4d395b459e5ca34f9cce2dd77fd  https://static.crates.io/crates/getrandom/getrandom-0.3.4.crate
300e883d756b2e4ec94e02791f39b04b522276138852cfc41d9fb7e904106099  https://static.crates.io/crates/getrandom/getrandom-0.4.3.crate
e5274423e17b7c9fc20b6e7e208532f9b19825d82dfd615708b70edd83df41f1  https://static.crates.io/crates/hashbrown/hashbrown-0.14.5.crate
ed5909b6e89a2db4456e54cd5f673791d7eca6732202bbf2a9cc504fe2f9b84a  https://static.crates.io/crates/hashbrown/hashbrown-0.17.1.crate
918d3568bebf352712bc2ef3d46a8bcf1a75b373be6539de198e9105cbbf9ce0  https://static.crates.io/crates/http/http-1.5.0.crate
ca2a8f2913ee65f60facd6a5905613afaa448497a0230cc41ce022d93290bc2c  https://static.crates.io/crates/http-body/http-body-1.1.0.crate
23169fe34a5fbcdd3f3862e78fb9b6fccd5f02a6dc6f732547005d45631ce71c  https://static.crates.io/crates/http-body-util/http-body-util-0.1.5.crate
cc4e190f5d26ca7051642629da2c52fc03bde85a03197c99408dcd291734c855  https://static.crates.io/crates/indexmap/indexmap-2.14.2.crate
8f42a60cbdf9a97f5d2305f08a87dc4e09308d1276d28c869c684d7777685682  https://static.crates.io/crates/itoa/itoa-1.0.18.crate
0ab1baf72f08796de0260609515130699b890ac25f30e610ad894bc5856cafdb  https://static.crates.io/crates/jiff/jiff-0.2.37.crate
5e52fe76043ccecc9005d2305ebaadf7d7fc0cc89ca6baa10a94d6bc68c7128c  https://static.crates.io/crates/jiff-core/jiff-core-0.1.1.crate
142bd39932ad231f10513df9ab62661fead8719872150b7ad02a2df79f4e141e  https://static.crates.io/crates/jiff-tzdb/jiff-tzdb-0.1.8.crate
875a5a69ac2bab1a891711cf5eccbec1ce0341ea805560dcd90b7a2e925132e8  https://static.crates.io/crates/jiff-tzdb-platform/jiff-tzdb-platform-0.1.3.crate
3eaf3ede3fee6db1a4c2ee091bf8a8b4dccdc6d17f656fb07896ee72867612f2  https://static.crates.io/crates/libc/libc-0.2.189.crate
a0d8a1c652b51dbb85c3c3164b1da63b88dafcc3fc12ecceb52f7577738c21f1  https://static.crates.io/crates/libjpeg-turbo-rs/libjpeg-turbo-rs-0.8.0.crate
224399e74b87b5f3557511d98dff8b14089b3dadafcab6bb93eab67d3aace965  https://static.crates.io/crates/lock_api/lock_api-0.4.14.crate
f9f8bd3e56ce4dfc153cf470fffbfa98c7620958b312ca5c3a4b8d5181fd13c6  https://static.crates.io/crates/log/log-0.4.34.crate
cf8baf1c55e62ffcace7a9f06f4bd9cd3f0c4beb022d3b367256b91b87513d98  https://static.crates.io/crates/memchr/memchr-2.8.3.crate
b63fbc4a50860e98e7b2aa7804ded1db5cbc3aff9193adaff57a6931bf7c4b4c  https://static.crates.io/crates/miniz_oxide/miniz_oxide-0.9.1.crate
9f7c3e4beb33f85d45ae3e3a1792185706c8e16d043238c593331cc7cd313b50  https://static.crates.io/crates/once_cell/once_cell-1.21.4.crate
04744f49eae99ab78e0d5c0b603ab218f515ea8cfe5a456d7629ad883a3b6e7d  https://static.crates.io/crates/option-ext/option-ext-0.2.0.crate
f38d5652c16fde515bb1ecef450ab0f6a219d619a7274976324d5e377f7dceba  https://static.crates.io/crates/parking/parking-2.2.1.crate
93857453250e3077bd71ff98b6a65ea6621a19bb0f559a85248955ac12c45a1a  https://static.crates.io/crates/parking_lot/parking_lot-0.12.5.crate
2621685985a2ebf1c516881c026032ac7deafcda1a2c9b7850dc81e3dfcb64c1  https://static.crates.io/crates/parking_lot_core/parking_lot_core-0.9.12.crate
a89322df9ebe1c1578d689c92318e070967d1042b512afbe49518723f4e6d5cd  https://static.crates.io/crates/pin-project-lite/pin-project-lite-0.2.17.crate
05c8b63e8d9609db387f0324918f81d68fe27748f084ef092fb35954d0539a85  https://static.crates.io/crates/portable-atomic/portable-atomic-1.15.0.crate
891efababe418670775f199f0d233d84843c227a0949a883ce15b37c78d6629d  https://static.crates.io/crates/rustix/rustix-1.1.5.crate
93fc1dc3aaa9bfed95e02e6eadabb4baf7e3078b0bd1b4d7b6b0b68378900502  https://static.crates.io/crates/same-file/same-file-1.0.6.crate
94143f37725109f92c262ed2cf5e59bce7498c01bcc1502d7b9afe439a4e9f49  https://static.crates.io/crates/scopeguard/scopeguard-1.2.0.crate
4148590afebada386688f18773da617792bf2ef03ffc1e4cbd2b1d45b023e0ba  https://static.crates.io/crates/serde/serde-1.0.229.crate
67dca2c9c51e58a4791a4b1ed58308b39c64224d349a935ab5039aa360942a48  https://static.crates.io/crates/serde_core/serde_core-1.0.229.crate
c841b55ecdae098c80dcae9cf767f6f8a0c2cdb3416bbef72181df4d0fe73f14  https://static.crates.io/crates/serde_json/serde_json-1.0.151.crate
3a219298ac11a56ea9a6d2120044824d6f01aeb034955e7af7bc16858527deea  https://static.crates.io/crates/simd-adler32/simd-adler32-0.3.10.crate
0c790de23124f9ab44544d7ac05d60440adc586479ce501c1d6d7da3cd8c9cf5  https://static.crates.io/crates/slab/slab-0.4.12.crate
f9395f0f0eee849a9b707b2f06bb92a6a422090e2123bb2ef8e87a0e61892a8e  https://static.crates.io/crates/smallvec/smallvec-1.16.2.crate
8eab9a99a024a169fe8a903cf9d4a3b3601109bcc13bd9e3c6fff259138626c4  https://static.crates.io/crates/sys-locale/sys-locale-0.3.2.crate
3f6221d9a6003c78398e3b239969f352578258df48c8eb051caadae0015bc840  https://static.crates.io/crates/tar/tar-0.4.46.crate
32497e9a4c7b38532efcdebeef879707aa9f794296a4f0244f6f69e9bc8574bd  https://static.crates.io/crates/tempfile/tempfile-3.27.0.crate
09e52cb86a36cede5cb101bf8908837b3e4c6e5e59fe7fd85c23fb56200d189e  https://static.crates.io/crates/thiserror/thiserror-2.0.21.crate
202caea871b69668250d242070849eb495be178ed697a3e98aebce5bc81a0bed  https://static.crates.io/crates/tokio/tokio-1.53.1.crate
63e71662fa4b2a2c3a26f570f037eb95bb1f85397f3cd8076caed2f026a6d100  https://static.crates.io/crates/tracing/tracing-0.1.44.crate
db97caf9d906fbde555dd62fa95ddba9eecfd14cb388e4f491a66d74cd5fb79a  https://static.crates.io/crates/tracing-core/tracing-core-0.1.36.crate
8e28f89b80c87b8fb0cf04ab448d5dd0dd0ade2f8891bae878de66a75a28600e  https://static.crates.io/crates/typed-path/typed-path-0.12.3.crate
317211a0dc0ceedd78fb2ca9a44aed3d7b9b26f81870d485c07122b4350673b7  https://static.crates.io/crates/waker-fn/waker-fn-1.2.0.crate
29790946404f91d9c5d06f9874efddea1dc06c5efe94541a7d6863108e3a5e4b  https://static.crates.io/crates/walkdir/walkdir-2.5.0.crate
b67efb37e106e55ce722a510d6b5f9c17f083e5fc79afc2badeb12cc313d9487  https://static.crates.io/crates/wasip2/wasip2-1.0.4+wasi-0.2.12.crate
1ebf944e87a7c253233ad6766e082e3cd714b5d03812acc24c318f549614536e  https://static.crates.io/crates/wit-bindgen/wit-bindgen-0.57.1.crate
29b52936db10a79bb724dadd1c2c3aac958e8229dcb1f1c7f2b7044ca9fc6a3a  https://static.crates.io/crates/wstd/wstd-0.6.8.crate
6df92bf3d9227be3d53173901ddbffac2babc27ae50f397776ffd6dc33f800cb  https://static.crates.io/crates/zerocopy/zerocopy-0.8.59.crate
2d04a6b5381502aa6087c94c669499eb1602eb9c5e8198e534de571f7154809b  https://static.crates.io/crates/zip/zip-8.6.0.crate
b268e58e7c693d7c271f93ffc4ba3b380412554231c85bf61ca7af91042a4112  https://static.crates.io/crates/zlib-rs/zlib-rs-0.6.8.crate
29666d0abbfad1e3dc4dcf6144730dd3a3ab225bbbdac83319345b1b44ccfc1b  https://static.crates.io/crates/zmij/zmij-1.0.23.crate
f05cd8797d63865425ff89b5c4a48804f35ba0ce8d125800027ad6017d2b5249  https://static.crates.io/crates/zopfli/zopfli-0.8.3.crate
"
```

`runtime/ristretto/CHECKSUMS`, for now exactly these five lines (`package.sh` rewrites the file in Step 4 and keeps these
five lines as they are):
```
31fed6b4cd242fb1acbfeddc5ec52dd0ab9c7690cd95b681f132fb62d9328984  jdk.zip
612f0dd3c12f268a9edfe6410c5339cf59ca85600b6b0ba003af63b1577ce38d  runner.core.wasm
c473092805a4a7ee4290139e9ac71c5d8e23cfd195e445cd5e606fd987c80ff4  runner.core2.wasm
dfc7ad43bbd16ac21e18736e15d2b76417c8d38b5f79d355511c45f34d72ba88  runner.core3.wasm
0a23e53fee6b8bd03871e01138c9764b489437cf7e02b5b618b3fe75774542e2  worker.js
```

`runtime/ristretto/fetch.sh`:
```bash
#!/bin/bash
# Copyright 2026 Java Foundations contributors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# fetch.sh: download Ristretto's five pinned files into runtime/.work/ristretto/v<version>/ under their published
# names, and verify each against CHECKSUMS (our SHA-256) and pins.env (the git blob SHA-1 upstream's deploy commit
# records for it). Downloads only what is missing; a file already there with other bytes is never overwritten.
# Tries the live site first, then the deploy commit's raw files (upstream force-replaces the site at every deploy,
# so either may be gone; the pinned bytes are then only in our own release).
#
# usage: bash runtime/ristretto/fetch.sh    0 = all five verified, 1 = a download failed or a file differs,
#                                           2 = misuse (an argument, or CHECKSUMS lacks one of the five)
set -euo pipefail
F="$(cd "$(dirname "$0")" && pwd)"     # runtime/ristretto/
W="$(cd "$F/.." && pwd)/.work/ristretto"
[ $# -eq 0 ] || { echo "usage: bash runtime/ristretto/fetch.sh" >&2; exit 2; }
source "$F/pins.env"
out="$W/v$RISTRETTO_VERSION"
mkdir -p "$out"
status=0
while read -r name path blob; do
  [ -n "$name" ] || continue
  want=$(awk -v n="$name" '$2 == n { print $1 }' "$F/CHECKSUMS")
  [ -n "$want" ] || { echo "fetch.sh: CHECKSUMS does not list $name" >&2; exit 2; }
  f="$out/$name"
  if [ ! -f "$f" ]; then
    if ! curl -fsL "$RISTRETTO_SITE$path" -o "$f.part" && ! curl -fsSL "$RISTRETTO_DEPLOY_RAW$path" -o "$f.part"; then
      rm -f "$f.part"; echo "fetch.sh: could not download $path from the site or the deploy commit" >&2; status=1; continue
    fi
    got=$(shasum -a 256 "$f.part" | cut -d' ' -f1)
    if [ "$got" != "$want" ]; then
      rm -f "$f.part"; echo "fetch.sh: $path downloaded with other bytes than CHECKSUMS pins for $name (got $got)" >&2; status=1; continue
    fi
    mv "$f.part" "$f"
  fi
  got=$(shasum -a 256 "$f" | cut -d' ' -f1)
  if [ "$got" != "$want" ]; then
    echo "fetch.sh: $f differs from CHECKSUMS; not overwritten (delete it to download it again)" >&2; status=1; continue
  fi
  got=$(git hash-object --no-filters "$f")
  if [ "$got" != "$blob" ]; then
    echo "fetch.sh: $name is not the blob $blob upstream's deploy commit records (got $got)" >&2; status=1; continue
  fi
  echo "verified $name"
done <<< "$RISTRETTO_FILES"
exit "$status"
```

`runtime/ristretto/verify.sh`:
```sh
#!/bin/sh
# Copyright 2026 Java Foundations contributors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Verify a scratchpad release directory against runtime/ristretto/CHECKSUMS, the way runtime/release/verify.sh
# verifies the boxes' runtime. 0 = all match, 1 = a file differs, 2 = something is missing: CHECKSUMS itself, its
# entry for a file every release must have, or a file it names; or misuse. Every line CHECKSUMS has is checked.
set -eu
[ $# -eq 1 ] || { echo "usage: verify.sh <dir>" >&2; exit 2; }
dir=$1
sums="$(dirname "$0")/CHECKSUMS"
# A missing CHECKSUMS would fall through the empty loop below and exit 0 (runtime/release/verify.sh says why).
[ -f "$sums" ] || { echo "missing: $sums" >&2; exit 2; }
status=0
# The files every release must carry: the six runtime files (Ristretto's five and the course's jshell front end)
# and the legal files (D53). An empty or truncated CHECKSUMS would otherwise pass for want of anything to compare.
for f in worker.js jdk.zip runner.core.wasm runner.core2.wasm runner.core3.wasm browser-jshell.jar \
    NOTICE LICENSE-APACHE LICENSE-MIT THIRD-PARTY.txt SOURCES.txt legal/java.base/LICENSE; do
  awk -v f="$f" '$2 == f { found = 1 } END { exit !found }' "$sums" || { echo "not in CHECKSUMS: $f" >&2; status=2; }
done
while read -r want name || [ -n "$want" ]; do
  [ -n "$name" ] || continue
  if [ ! -f "$dir/$name" ]; then echo "missing: $name" >&2; status=2; continue; fi
  got=$(shasum -a 256 "$dir/$name" | cut -d' ' -f1)
  if [ "$got" != "$want" ]; then echo "DIFFERS: $name" >&2; [ "$status" -eq 2 ] || status=1; fi
done < "$sums"
exit "$status"
```

Run: `bash runtime/ristretto/fetch.sh`
Expected: five `verified <name>` lines, exit 0, and the five files in `runtime/.work/ristretto/v0.34.0/` (30,278,661 bytes in
all).
Breaks, each restored before the next:
- Append a byte to `runtime/.work/ristretto/v0.34.0/runner.core3.wasm` (`printf x >> …`) and rerun: exit 1, `… differs
  from CHECKSUMS; not overwritten`, and the file still has 496 bytes. Delete it and rerun: it downloads again, exit 0.
- Change the last hex digit of `runner.core3.wasm`'s blob id in `pins.env` and rerun: exit 1, `runner.core3.wasm is not
  the blob … upstream's deploy commit records`. Restore it.
- Point `RISTRETTO_SITE` at `https://theseus-rs.github.io/ristretto/no-such-dir/`, delete `runner.core3.wasm`, rerun:
  exit 0, `verified runner.core3.wasm` (the deploy commit's raw file answered). Restore `pins.env`.
- `bash runtime/ristretto/fetch.sh extra`: exit 2.

Run: `sh runtime/ristretto/verify.sh runtime/.work/ristretto/v0.34.0`
Expected: exit 2, with `not in CHECKSUMS:` for `browser-jshell.jar`, the five legal names and `legal/java.base/LICENSE`
(seven lines): CHECKSUMS does not list them yet. `sh runtime/ristretto/verify.sh` with no argument: exit 2. (The full
verifier proof is in Step 4, on a release.)

- [ ] **Step 3: Download Corretto's source archive twice, hash it, never open it (D51)**

```bash
URL=https://github.com/corretto/corretto-25/archive/refs/tags/25.0.4.10.1.tar.gz
date -u; curl -fsSL "$URL" -o runtime/.work/ristretto/corretto-download-1.tar.gz
# wait at least ten minutes, so the two downloads are separate requests GitHub answers separately
date -u; curl -fsSL "$URL" -o runtime/.work/ristretto/corretto-download-2.tar.gz
wc -c runtime/.work/ristretto/corretto-download-*.tar.gz
shasum -a 256 runtime/.work/ristretto/corretto-download-*.tar.gz
```
Expected: two downloads of the same size (about 200 MB) and the same SHA-256. If the two differ, stop and report: GitHub's
archive is not stable for this tag, and D51's pin cannot rest on two downloads agreeing.
Then, with `<sha>` the agreed hash:
```bash
mkdir -p runtime/.work/ristretto/inputs
mv runtime/.work/ristretto/corretto-download-1.tar.gz runtime/.work/ristretto/inputs/<sha>-25.0.4.10.1.tar.gz
rm runtime/.work/ristretto/corretto-download-2.tar.gz
```
`pins.env` still holds `TO-BE-PINNED-IN-STEP-4` for this archive: Step 4 shows the gate that refuses an unpinned archive,
then fills the pin. Record both download times, the size and the hash for the commit message.

- [ ] **Step 4: Write `package.sh`; show its unpinned-archive gate, pin the archive, package, verify, package again, and prove it fails**

`runtime/ristretto/package.sh`:
```bash
#!/bin/bash
# Copyright 2026 Java Foundations contributors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# package.sh: assemble a scratchpad release from Ristretto's five pinned files and the course's jshell front end,
# in the shape of the boxes' runtime release (runtime/release/package.sh). Writes
# runtime/.work/ristretto/release/<release>/ holding the five files under their published names, browser-jshell.jar
# (built by runtime/jshell/build.sh, and refused unless it is the jar runtime/jshell/test/pins.json pins), the legal
# files (NOTICE, LICENSE-APACHE, LICENSE-MIT, THIRD-PARTY.txt, SOURCES.txt, and Corretto's own notices under legal/),
# CHECKSUMS for all of them, and source.tar.gz, the corresponding source; then rewrites the tracked
# runtime/ristretto/CHECKSUMS from the release and points runtime/.work/ristretto/current at it. Every input is
# checked against pins.env, and cross-checked against Ristretto's own lock files, before anything is written.
# Nothing in the legal files names the release, so packaging the same pins and sources twice gives the same
# CHECKSUMS and the same source.tar.gz.
#
# Clean room (D14, D51): Corretto's source archive is downloaded, hashed and copied into source.tar.gz whole; it is
# never extracted or listed, here or anywhere. From jdk.zip only legal/ is extracted, never lib/modules.
#
# usage: bash runtime/ristretto/package.sh <release>      (release: scratchpad-YYYY.MM.DD-N)
set -euo pipefail
F="$(cd "$(dirname "$0")" && pwd)"     # runtime/ristretto/
W="$(cd "$F/.." && pwd)/.work/ristretto"
if [ $# -ne 1 ] || ! [[ "$1" =~ ^scratchpad-[0-9]{4}\.[0-9]{2}\.[0-9]{2}-[0-9]+$ ]]; then
  echo "usage: bash runtime/ristretto/package.sh scratchpad-YYYY.MM.DD-N" >&2; exit 2
fi
release=$1
source "$F/pins.env"
in="$W/v$RISTRETTO_VERSION"
outdir="$W/release/$release"
UPSTREAM_FILES="jdk.zip runner.core.wasm runner.core2.wasm runner.core3.wasm worker.js"   # Ristretto's five, unmodified
JSHELL="$(cd "$F/../jshell" && pwd)"                              # runtime/jshell/: the course's front end (D55, D62)
JAR="$(cd "$F/.." && pwd)/.work/jshell/out/browser-jshell.jar"    # where runtime/jshell/build.sh writes it

log() { printf '[package %s] %s\n' "$(date +%H:%M:%S)" "$*"; }

# ---------------------------------------------------------------- 0. the five files and the jar, verified
bash "$F/fetch.sh" > /dev/null || { echo "package.sh: refusing: fetch.sh could not verify the five pinned files" >&2; exit 1; }
log "the five pinned files verify against CHECKSUMS and upstream's blob ids"

# The jar readers run must be the one runtime/jshell/test/check.mjs holds to the real jshell: built from
# runtime/jshell/src/ by its own build.sh (the pinned JDK; the same sources give the same bytes), and refused unless
# its SHA-256 is the "jar" pin in runtime/jshell/test/pins.json (D62).
sh "$JSHELL/build.sh" > /dev/null || { echo "package.sh: refusing: runtime/jshell/build.sh could not build the front end" >&2; exit 1; }
jar_pin=$(python3 -c 'import json, sys; print(json.load(open(sys.argv[1]))["jar"])' "$JSHELL/test/pins.json")
jar_sha=$(shasum -a 256 "$JAR" | cut -d' ' -f1)
[ "$jar_sha" = "$jar_pin" ] || { echo "package.sh: refusing: the front end built from runtime/jshell/src/ is $jar_sha; runtime/jshell/test/pins.json pins $jar_pin" >&2; exit 1; }
log "the front end built from runtime/jshell/src/ is the jar runtime/jshell/test/pins.json pins"

# A file package.sh reads: the checked local copy (downloaded once into .work/ristretto/inputs/, checked against
# its pin on every run).
fetch_pinned() { # $1 = url
  local url=$1 want f got
  want=$(printf '%s\n' "$SOURCE_INPUTS_SHA256" | awk -v u="$url" '$2 == u { print $1 }')
  [[ "$want" =~ ^[0-9a-f]{64}$ ]] || { echo "package.sh: $url is not pinned in pins.env (SOURCE_INPUTS_SHA256)" >&2; exit 1; }
  f="$W/inputs/$want-$(basename "$url")"
  if [ ! -f "$f" ]; then
    mkdir -p "$W/inputs"
    curl -fsSL "$url" -o "$f.part" || { rm -f "$f.part"; echo "package.sh: could not download $url" >&2; exit 1; }
    mv "$f.part" "$f"
  fi
  got=$(shasum -a 256 "$f" | cut -d' ' -f1)
  [ "$got" = "$want" ] || { rm -f "$f"; echo "package.sh: checksum MISMATCH for $url (pin $want, file $got)" >&2; exit 1; }
  printf '%s\n' "$f"
}

# ---------------------------------------------------------------- 1. every input fetched and checked
while read -r _ url; do [ -n "$url" ] && fetch_pinned "$url" > /dev/null; done <<< "$SOURCE_INPUTS_SHA256"
RISTRETTO_SRC=$(fetch_pinned "$RISTRETTO_SOURCE_URL")
CORRETTO_SRC=$(fetch_pinned "$CORRETTO_SOURCE_URL")
log "every input matches its pin"

# Cross-checks, before anything is written: each crate pin is the checksum Ristretto's Cargo.lock gives it; each npm
# pin's tarball has the integrity web/package-lock.json gives it; the two license texts are the pinned ones; every
# crate carries a license file; every legal/<module>/LICENSE in jdk.zip is the GPLv2 with the Classpath Exception.
export W RISTRETTO_SRC RISTRETTO_SOURCE_PREFIX SOURCE_INPUTS_SHA256 RISTRETTO_LICENSE_APACHE_SHA256 \
  RISTRETTO_LICENSE_MIT_SHA256 CORRETTO_GPL_LICENSE_SHA256
python3 - "$in/jdk.zip" <<'PY'
import base64, hashlib, json, os, re, sys, tarfile, tomllib, zipfile
env = os.environ
sha256 = lambda b: hashlib.sha256(b).hexdigest()
pins = [l.split() for l in env["SOURCE_INPUTS_SHA256"].splitlines() if l.strip()]
cached = lambda sha, url: os.path.join(env["W"], "inputs", sha + "-" + url.rsplit("/", 1)[1])
LICENSE_FILE = re.compile(r"^[^/]+/(.*/)?(LICEN[CS]E|COPYING|NOTICE|UNLICENSE|COPYRIGHT)[^/]*$", re.I)
problems = []
src = tarfile.open(env["RISTRETTO_SRC"])
member = lambda name: src.extractfile(env["RISTRETTO_SOURCE_PREFIX"] + name).read()
lock = {(p["name"], p["version"]): p.get("checksum") for p in tomllib.loads(member("Cargo.lock").decode())["package"]}
npm = {p.get("resolved"): p.get("integrity") for p in json.loads(member("web/package-lock.json"))["packages"].values()}
crates = npm_seen = 0
for sha, url in pins:
    m = re.fullmatch(r"https://static\.crates\.io/crates/([^/]+)/\1-(.+)\.crate", url)
    if m:
        crates += 1
        if lock.get((m[1], m[2])) != sha: problems.append(f"{m[1]} {m[2]}: pinned {sha}, Cargo.lock says {lock.get((m[1], m[2]))}")
        with tarfile.open(cached(sha, url)) as t:
            if not any(x.isfile() and LICENSE_FILE.match(x.name) for x in t.getmembers()): problems.append(f"{m[1]} {m[2]}: no license file")
    elif url.startswith("https://registry.npmjs.org/"):
        npm_seen += 1
        got = "sha512-" + base64.b64encode(hashlib.sha512(open(cached(sha, url), "rb").read()).digest()).decode()
        if npm.get(url) != got: problems.append(f"{url}: package-lock.json gives integrity {npm.get(url)}, the tarball is {got}")
for name, key in (("LICENSE-APACHE", "RISTRETTO_LICENSE_APACHE_SHA256"), ("LICENSE-MIT", "RISTRETTO_LICENSE_MIT_SHA256")):
    if sha256(member(name)) != env[key]: problems.append(f"{name} in Ristretto's source archive is not the pinned text")
with zipfile.ZipFile(sys.argv[1]) as z:
    licenses = [n for n in z.namelist() if re.fullmatch(r"legal/[^/]+/LICENSE", n)]
    if not licenses: problems.append("jdk.zip holds no legal/<module>/LICENSE")
    for n in licenses:
        if sha256(z.read(n)) != env["CORRETTO_GPL_LICENSE_SHA256"]: problems.append(f"jdk.zip's {n} is not the GPLv2 with the Classpath Exception")
if crates == 0 or npm_seen == 0: problems.append(f"pins.env pins {crates} crates and {npm_seen} npm packages")
for p in problems: print("  " + p, file=sys.stderr)
sys.exit(1 if problems else 0)
PY
log "crates match Cargo.lock, npm tarballs match package-lock.json, license texts and jdk.zip's notices are the pinned ones"

rm -rf "$outdir"
mkdir -p "$outdir"

# ---------------------------------------------------------------- 2. the six files, Ristretto's five unmodified
for f in $UPSTREAM_FILES; do cp "$in/$f" "$outdir/$f"; done
cp "$JAR" "$outdir/browser-jshell.jar"

# ---------------------------------------------------------------- 3. the legal files
tar -xzOf "$RISTRETTO_SRC" "${RISTRETTO_SOURCE_PREFIX}LICENSE-APACHE" > "$outdir/LICENSE-APACHE"
tar -xzOf "$RISTRETTO_SRC" "${RISTRETTO_SOURCE_PREFIX}LICENSE-MIT" > "$outdir/LICENSE-MIT"
unzip -q "$in/jdk.zip" 'legal/*' -d "$outdir"
python3 - "$outdir/THIRD-PARTY.txt" <<'PY'
import os, re, sys, tarfile, tomllib
env = os.environ
pins = [l.split() for l in env["SOURCE_INPUTS_SHA256"].splitlines() if l.strip()]
cached = lambda sha, url: os.path.join(env["W"], "inputs", sha + "-" + url.rsplit("/", 1)[1])
LICENSE_FILE = re.compile(r"^[^/]+/(.*/)?(LICEN[CS]E|COPYING|NOTICE|UNLICENSE|COPYRIGHT)[^/]*$", re.I)
out = []
def verbatim(title, data):
    text = data.decode("utf-8")
    out.append(f"---- {title} ----\n{text}{'' if text.endswith(chr(10)) else chr(10)}\n")
def texts(prefix):
    return [(sha, url) for sha, url in pins if url.startswith(prefix)]
out.append("Third-party notices for the scratchpad's runtime files: the license texts of everything compiled into\n"
           "runner.core.wasm, runner.core2.wasm and runner.core3.wasm, and bundled into worker.js, verbatim. NOTICE\n"
           "says what each file holds. The reduced Corretto in jdk.zip carries its own notices, under legal/.\n\n")
out.append("== 1. The Rust standard library 1.98.1 (rust-lang/rust at the commit SOURCES.txt names) ==\n\n")
for sha, url in texts("https://raw.githubusercontent.com/rust-lang/rust/"):
    verbatim(url.rsplit("/", 1)[1], open(cached(sha, url), "rb").read())
out.append("== 2. wasi-libc, from wasi-sdk-33 (WebAssembly/wasi-libc at the commit SOURCES.txt names) ==\n\n")
for sha, url in texts("https://raw.githubusercontent.com/WebAssembly/wasi-libc/"):
    verbatim(url.split("/", 6)[6], open(cached(sha, url), "rb").read())
crates = [(re.fullmatch(r"https://static\.crates\.io/crates/([^/]+)/\1-(.+)\.crate", u), s, u) for s, u in pins
          if u.startswith("https://static.crates.io/")]
out.append(f"== 3. The {len(crates)} Rust crates compiled into runner.core.wasm (each .crate is in source.tar.gz) ==\n\n")
for m, sha, url in sorted(crates, key=lambda c: (c[0][1], c[0][2])):
    with tarfile.open(cached(sha, url)) as t:
        meta = tomllib.loads(t.extractfile(f"{m[1]}-{m[2]}/Cargo.toml").read().decode())["package"]
        out.append(f"{m[1]} {m[2]}\n  license: {meta.get('license', '(see its license files)')}\n"
                   f"  repository: {meta.get('repository', '(none given)')}\n\n")
        for x in sorted((x for x in t.getmembers() if x.isfile() and LICENSE_FILE.match(x.name)), key=lambda x: x.name):
            verbatim(x.name, t.extractfile(x).read())
npm = [(s, u) for s, u in pins if u.startswith("https://registry.npmjs.org/")]
out.append(f"== 4. The {len(npm)} npm packages bundled into worker.js (each tarball is in source.tar.gz) ==\n\n")
for sha, url in sorted(npm, key=lambda p: p[1]):
    with tarfile.open(cached(sha, url)) as t:
        out.append(f"{url}\n\n")
        for x in sorted((x for x in t.getmembers() if x.isfile() and re.fullmatch(r"package/(LICEN[CS]E|COPYING|NOTICE)[^/]*", x.name, re.I)), key=lambda x: x.name):
            verbatim(x.name, t.extractfile(x).read())
open(sys.argv[1], "w", encoding="utf-8", newline="\n").write("".join(out))
PY

corretto_size=$(wc -c < "$CORRETTO_SRC" | tr -d ' ')
corretto_sha=$(shasum -a 256 "$CORRETTO_SRC" | cut -d' ' -f1)
{
  echo "Where the scratchpad's files come from. Nothing below was modified; source.tar.gz, in the release beside"
  echo "these files, holds every archive marked (in source.tar.gz), exactly as downloaded, and the course's own"
  echo "front end's source."
  echo
  echo "Ristretto v$RISTRETTO_VERSION (Apache-2.0 OR MIT)"
  echo "  repo:          https://github.com/theseus-rs/ristretto"
  echo "  tag:           v$RISTRETTO_VERSION"
  echo "  commit:        $RISTRETTO_COMMIT"
  echo "  source:        $RISTRETTO_SOURCE_URL (in source.tar.gz)"
  echo "  sha256:        $(shasum -a 256 "$RISTRETTO_SRC" | cut -d' ' -f1)"
  echo "  web build:     GitHub Pages, branch playground-pages, deploy commit $RISTRETTO_DEPLOY_COMMIT,"
  echo "                 built from the commit above; the five files, as published here:"
  while read -r name path blob; do
    [ -n "$name" ] || continue
    echo "    $name  (upstream $path, $(wc -c < "$outdir/$name" | tr -d ' ') bytes, git blob $blob)"
    echo "      sha256 $(shasum -a 256 "$outdir/$name" | cut -d' ' -f1)"
  done <<< "$RISTRETTO_FILES"
  echo "  The interpreter and worker are built by web/scripts/build-runtime.mjs and web/package.json in the"
  echo "  source above; browser-jshell.jar, inside jdk.zip, is web/runner/java/BrowserJShell.java compiled there."
  echo "  The page puts the course's own browser-jshell.jar (below) in its place when it loads; this one is unused."
  echo
  echo "The course's jshell front end, browser-jshell.jar (Apache-2.0)"
  echo "  copyright:     Copyright 2026 Java Foundations contributors"
  echo "  repo:          https://github.com/mmmugh/java-foundations"
  echo "  source:        runtime/jshell/src/ (in source.tar.gz as jshell/src/)"
  echo "  built by:      runtime/jshell/build.sh (in source.tar.gz as jshell/build.sh) with Eclipse Temurin"
  echo "                 25.0.4.1+1; the same sources give the same bytes"
  echo "  pin:           runtime/jshell/test/pins.json (\"jar\"); package.sh refuses a jar that differs"
  echo "  size, sha256:  $(wc -c < "$outdir/browser-jshell.jar" | tr -d ' ') bytes, $jar_sha"
  echo "  The page puts it in place of Ristretto's browser-jshell.jar inside jdk.zip, in memory, when it loads;"
  echo "  jdk.zip is published unmodified."
  echo
  echo "Amazon Corretto $CORRETTO_VERSION (GPLv2 with the Classpath Exception), reduced by jlink into jdk.zip"
  echo "  repo:          https://github.com/corretto/corretto-25"
  echo "  tag:           $CORRETTO_VERSION"
  echo "  commit:        $CORRETTO_COMMIT"
  echo "  source:        $CORRETTO_SOURCE_URL (in source.tar.gz, never extracted)"
  echo "  size, sha256:  $corretto_size bytes, $corretto_sha"
  echo "  jlinked from:  $CORRETTO_BINARY_URL"
  echo "  its sha256:    $CORRETTO_BINARY_SHA256"
  echo "  The jlink invocation is web/scripts/build-runtime.mjs in Ristretto's source."
  echo
  echo "Compilers whose libraries are in runner.core.wasm (sources not shipped; none is copyleft):"
  echo "  rustc 1.98.1:  https://github.com/rust-lang/rust, commit $RUST_COMMIT"
  echo "  wasi-sdk-33:   https://github.com/WebAssembly/wasi-libc, commit $WASI_LIBC_COMMIT;"
  echo "                 https://github.com/llvm/llvm-project, commit $LLVM_COMMIT"
  echo
  echo "Every input package.sh read, \"<sha256>  <url>\" (the crates and npm tarballs are in source.tar.gz):"
  printf '%s\n' "$SOURCE_INPUTS_SHA256" | sed '/^$/d; s/^/  /'
  echo
  echo "Written offer (GPLv2, section 3(b)). For at least three years from the day this release was published,"
  echo "anyone may have a complete machine-readable copy of the corresponding source code of the GPL-licensed parts"
  echo "of these files (Amazon Corretto, above), under the terms of the GPLv2, at no charge beyond the cost of"
  echo "physically performing the distribution, by download or on a medium customarily used for software"
  echo "interchange: ask at https://github.com/mmmugh/java-foundations/issues. The same source is in source.tar.gz,"
  echo "in the release beside these files."
} > "$outdir/SOURCES.txt"

cat > "$outdir/NOTICE" <<EOF
Java Foundations scratchpad runtime

These files are what a reader's browser runs when it opens a chapter's scratchpad: the web build of
Ristretto v$RISTRETTO_VERSION, a Java virtual machine compiled to WebAssembly, with the reduced Amazon Corretto 25
class library it runs, published unmodified, and the course's own jshell front end. CHECKSUMS fixes each
file's bytes, SOURCES.txt says where each came from, and source.tar.gz, in the release beside these files, is
their corresponding source. Nothing here is under the course's CC BY-NC-SA 4.0 license; each work below is
under its own license.

What each file holds:
- worker.js: Ristretto's web worker (TypeScript, compiled), with the JavaScript packages in section 3.
- runner.core.wasm, runner.core2.wasm, runner.core3.wasm: Ristretto's interpreter and its WebAssembly
  component glue (Rust, compiled), with the Rust standard library, wasi-libc and the crates in section 2.
- jdk.zip: the reduced Corretto (section 4), and browser-jshell.jar, Ristretto's jshell front end (section 1),
  which the page does not use.
- browser-jshell.jar: the course's own jshell front end (section 5), which the page puts in place of
  Ristretto's inside jdk.zip when it loads.

1. Ristretto v$RISTRETTO_VERSION, https://github.com/theseus-rs/ristretto, commit $RISTRETTO_COMMIT:
   Apache License, Version 2.0 OR MIT License. Both texts ship, LICENSE-APACHE and LICENSE-MIT, and neither
   is elected. Ristretto ships no NOTICE file.

2. Compiled into runner.core.wasm, besides Ristretto's own code: the Rust standard library 1.98.1 (MIT OR
   Apache-2.0); wasi-libc from wasi-sdk-33 (Apache-2.0 WITH LLVM-exception, Apache-2.0 and MIT, with code from
   cloudlibc under BSD-2-Clause, musl under MIT and the others its LICENSE names); and the Rust crates
   THIRD-PARTY.txt lists, under MIT, Apache-2.0, BSD, 0BSD, Zlib and Unlicense terms, and one, option-ext
   0.2.0, under the Mozilla Public License 2.0, whose Source Code Form is crates/option-ext-0.2.0.crate in
   source.tar.gz, unmodified. THIRD-PARTY.txt carries every one of their license texts, verbatim.
   The crate libjpeg-turbo-rs 0.8.0 says it is based in part on the Independent JPEG Group's work; as the IJG
   license asks of a distribution of executable code: this software is based in part on the work of the
   Independent JPEG Group.

3. Bundled into worker.js: fflate 0.8.3 (MIT); @bytecodealliance/preview2-shim 0.23.0 and the glue
   @bytecodealliance/jco-transpile 0.12.1 generates (Apache-2.0 WITH LLVM-exception). THIRD-PARTY.txt carries
   their license texts, verbatim.

4. jdk.zip: Amazon Corretto $CORRETTO_VERSION, https://github.com/corretto/corretto-25, tag $CORRETTO_VERSION,
   commit $CORRETTO_COMMIT, reduced by jlink: GNU General Public License,
   version 2, with the Classpath Exception. Its notices are under legal/, one directory per module,
   extracted unmodified from jdk.zip: each LICENSE is the GPLv2 with the Classpath Exception, and
   ASSEMBLY_EXCEPTION, ADDITIONAL_LICENSE_INFO and the .md files are the notices Corretto ships for the
   code it includes. Corresponding source: Corretto's tag archive, in source.tar.gz exactly as downloaded
   (SOURCES.txt gives its URL, size and SHA-256); the jlink step is web/scripts/build-runtime.mjs in
   Ristretto's source archive, also there.

5. browser-jshell.jar: the course's own jshell front end, Copyright 2026 Java Foundations contributors,
   Apache License, Version 2.0 (the text is LICENSE-APACHE). Its source is runtime/jshell/src/ in the
   course's repository, https://github.com/mmmugh/java-foundations, and is in source.tar.gz with the
   build.sh that makes these exact bytes. When the page loads, it puts this jar in place of Ristretto's
   browser-jshell.jar inside jdk.zip, in memory; jdk.zip as published still carries Ristretto's, unused.

This NOTICE, SOURCES.txt, CHECKSUMS and THIRD-PARTY.txt's own headings are licensed Apache License, Version
2.0, as part of this project's scripts and documentation.
EOF
log "wrote the legal files ($(find "$outdir/legal" -type f | wc -l | tr -d ' ') Corretto notices under legal/)"

# ---------------------------------------------------------------- 4. CHECKSUMS (every published file, sorted)
( cd "$outdir" && find . -type f ! -name CHECKSUMS | sed 's#^\./##' | LC_ALL=C sort | while read -r n; do shasum -a 256 "$n"; done ) \
  > "$outdir/CHECKSUMS"
for f in $UPSTREAM_FILES; do
  [ "$(awk -v f="$f" '$2 == f' "$outdir/CHECKSUMS")" = "$(awk -v f="$f" '$2 == f' "$F/CHECKSUMS")" ] \
    || { echo "package.sh: $f's line in the release's CHECKSUMS differs from the pinned one" >&2; exit 1; }
done

# ---------------------------------------------------------------- 5. source.tar.gz
# Staged, then archived member by member in sorted order with owner 0/0, one fixed mtime and no gzip timestamp,
# as runtime/release/package.sh does.
tmp="$W/release/.tmp-source-$release"
rm -rf "$tmp"
mkdir -p "$tmp/src/crates" "$tmp/src/npm" "$tmp/src/tools" "$tmp/src/jshell"
cp "$RISTRETTO_SRC" "$tmp/src/ristretto-$RISTRETTO_VERSION-source.tar.gz"
cp -c "$CORRETTO_SRC" "$tmp/src/corretto-25-$CORRETTO_VERSION.tar.gz" 2> /dev/null || cp "$CORRETTO_SRC" "$tmp/src/corretto-25-$CORRETTO_VERSION.tar.gz"
while read -r sha url; do
  case "$url" in
    https://static.crates.io/*) cp "$W/inputs/$sha-$(basename "$url")" "$tmp/src/crates/$(basename "$url")" ;;
    https://registry.npmjs.org/*) cp "$W/inputs/$sha-$(basename "$url")" "$tmp/src/npm/$(basename "$url")" ;;
  esac
done <<< "$SOURCE_INPUTS_SHA256"
cp "$F/pins.env" "$F/fetch.sh" "$F/package.sh" "$F/verify.sh" "$tmp/src/tools/"
# The course's front end: the .java files build.sh compiles, and build.sh.
( cd "$JSHELL" && find src -name '*.java' ) | while read -r f; do mkdir -p "$tmp/src/jshell/$(dirname "$f")"; cp "$JSHELL/$f" "$tmp/src/jshell/$f"; done
cp "$JSHELL/build.sh" "$tmp/src/jshell/build.sh"
find "$tmp/src" -exec env TZ=UTC touch -h -t 202601010000.00 {} +
( cd "$tmp/src" && find . -mindepth 1 | sed 's#^\./##' | LC_ALL=C sort ) \
  | tar -c -z -n -f "$outdir/source.tar.gz" -C "$tmp/src" --uid 0 --gid 0 --numeric-owner \
      --options gzip:!timestamp -T -
rm -rf "$tmp"
log "source.tar.gz is $(du -h "$outdir/source.tar.gz" | cut -f1)"

# ---------------------------------------------------------------- 6. the tracked CHECKSUMS and the current pointer
cp "$outdir/CHECKSUMS" "$F/CHECKSUMS"
ln -sfn "release/$release" "$W/current"
log "release $release packaged at $outdir; runtime/ristretto/CHECKSUMS rewritten; current -> release/$release"
```

First the gate, while `pins.env` still holds `TO-BE-PINNED-IN-STEP-4` for Corretto's archive:
```bash
bash runtime/ristretto/package.sh scratchpad-2026.01.01-1; echo "exit $?"
```
Expected: exit 1, after the log lines `the five pinned files verify against CHECKSUMS and upstream's blob ids` and `the
front end built from runtime/jshell/src/ is the jar runtime/jshell/test/pins.json pins`, with
`package.sh: https://github.com/corretto/corretto-25/archive/refs/tags/25.0.4.10.1.tar.gz is not pinned in pins.env
(SOURCE_INPUTS_SHA256)`: the gate that keeps an unpinned archive out of a release. It made no `release/` directory, and
`wc -l < runtime/ristretto/CHECKSUMS` still prints `5`. Now fill the pin: in `pins.env` replace `TO-BE-PINNED-IN-STEP-4`
with the `<sha>` Step 3 agreed on.

Run: `bash runtime/ristretto/package.sh scratchpad-<today as YYYY.MM.DD>-1`
Expected: exit 0, in under a minute once the inputs are cached (the scratch dry run, with a 71-byte stand-in for the Corretto
archive, took 5 s, the jar's build included), with the log line `the front end built from runtime/jshell/src/ is the jar
runtime/jshell/test/pins.json pins` second, and log lines ending `wrote the legal files (103 Corretto notices under legal/)`,
`source.tar.gz is <the Corretto archive plus about 13 MB>` and `release … packaged …; runtime/ristretto/CHECKSUMS rewritten; current -> release/…`.
Then check what it wrote:
```bash
R=runtime/.work/ristretto/current
sh runtime/ristretto/verify.sh $R; echo "verify exit $?"
wc -l < runtime/ristretto/CHECKSUMS
grep ' browser-jshell.jar$' runtime/ristretto/CHECKSUMS
grep -c '^---- ' $R/THIRD-PARTY.txt
grep -c 'https://static.crates.io/crates/' $R/SOURCES.txt
tar tzf $R/source.tar.gz | wc -l
tar tzf $R/source.tar.gz 'jshell/*' | wc -l
tar tvzf $R/source.tar.gz corretto-25-25.0.4.10.1.tar.gz
readlink runtime/.work/ristretto/current
```
Expected: `verify exit 0`; `114`; `e5ee02f466698fa0548f9b93299eee22c5f858a058ae61c624b6be26587f5ae4  browser-jshell.jar`
(the `jar` pin); `174` (3 Rust texts, 6 wasi-libc texts, 162 crate license files, 3 npm license files); `79`; `113` (the two
archives, 79 crates, 3 npm tarballs, 4 tools, the front end's 17 `.java` files and `build.sh`, and 7 directories); `22` (the
front end's members, under `jshell/`); one line, owner `0 0`, whose size is the size Step 3 recorded (this lists the outer
archive's member, never the Corretto archive's contents); `release/<the name>`. Read `NOTICE` and `SOURCES.txt` once in
full: `SOURCES.txt` must give the Corretto archive's size and SHA-256 from Step 3, and the jar's size (54,116 bytes) and
SHA-256; `NOTICE` must list `browser-jshell.jar` and give it section 5 (Apache-2.0, its source, and that the page puts it in
place of Ristretto's inside `jdk.zip`). `SOURCES.txt` must also end with the written offer (D58,
"Written offer (GPLv2, section 3(b))"). `package.sh` does not check that itself: Task 2's `testTheRealReleaseBuilds` does,
and its Step 4 breaks this script's offer on purpose.

Determinism: `cp runtime/ristretto/CHECKSUMS runtime/.work/ristretto/CHECKSUMS.first`, then
`bash runtime/ristretto/package.sh scratchpad-<today>-2`, then
`cmp runtime/.work/ristretto/CHECKSUMS.first runtime/ristretto/CHECKSUMS && shasum -a 256 runtime/.work/ristretto/release/*/source.tar.gz`.
Expected: `cmp` silent, and the two `source.tar.gz` hashes equal (measured in scratch, with the stand-in: `cf8afc81…`
twice). Then delete `release/scratchpad-<today>-1` (`current` points at `-2`).

Breaks, each restored before the next; after each, `cmp runtime/.work/ristretto/CHECKSUMS.first runtime/ristretto/CHECKSUMS`
is silent (a failed run leaves the tracked `CHECKSUMS` and `current` alone):
- `bash runtime/ristretto/package.sh scratchpad-2026.9.30-1`: exit 2 (the name is checked).
- Set `CORRETTO_GPL_LICENSE_SHA256="0000"` in `pins.env`: exit 1, 23 lines `jdk.zip's legal/<module>/LICENSE is not the GPLv2
  with the Classpath Exception`. Restore.
- A crate pin that is not Cargo.lock's: copy `inputs/<ahash's sha>-ahash-0.8.12.crate` to `inputs/<ahash's sha>-adler2-2.0.1.crate`
  and give adler2's line ahash's hash: exit 1, `adler2 2.0.1: pinned 5a15f179…, Cargo.lock says 32011957…`. Delete that copy
  and restore the line.
- The front end is not the pinned jar, three ways, each exit 1 before anything is written:
  - change the last hex digit of `jar` in `runtime/jshell/test/pins.json`: `package.sh: refusing: the front end built from
    runtime/jshell/src/ is e5ee02f4…; runtime/jshell/test/pins.json pins …5ae5`. Restore it;
  - put an empty line first in `runtime/jshell/src/BrowserJShell.java` (its line numbers move, so the jar's bytes do): the
    same refusal, naming the jar it built (`9fee3451…` in scratch), so the jar comes from the sources, never from a build
    left in `runtime/.work/jshell/out/`. Restore it (`git checkout -- runtime/jshell/src/BrowserJShell.java`);
  - append a line `x` to the same file: javac's error, then `package.sh: refusing: runtime/jshell/build.sh could not build
    the front end`. Restore it.
- Append a byte to the cached `fflate-0.8.3.tgz`: exit 1, `checksum MISMATCH for https://registry.npmjs.org/fflate/-/fflate-0.8.3.tgz`,
  and the cached copy is deleted. Rerun `bash runtime/ristretto/package.sh scratchpad-<today>-2`: it downloads it again,
  exit 0, and builds the pinned jar again into `runtime/.work/jshell/out/` (the breaks above left another jar there, or none).
Verifier breaks, on copies (`cp -R runtime/.work/ristretto/current/ runtime/.work/ristretto/tamper`). "Missing outranks
differs" is proved by two breaks, one for each order the two files can come in CHECKSUMS (sorted `LC_ALL=C`): a verifier
that let a difference seen first block a later missing file (measured: `[ "$status" -ne 0 ] || status=2` on the missing
line) passes the missing-file-first break and fails the differing-file-first one, and one that let a missing file seen
first be downgraded by a later difference (`status=1` on the differs line) passes the differing-file-first break and fails
the missing-file-first one. Neither alone proves it.
- Append a byte to `tamper/legal/java.xml/xerces.md`: exit 1, `DIFFERS: legal/java.xml/xerces.md`.
- On a fresh copy, append a byte to `tamper/browser-jshell.jar`: exit 1, `DIFFERS: browser-jshell.jar`.
- On a fresh copy, the differing file first: append a byte to `tamper/browser-jshell.jar` and delete
  `tamper/runner.core.wasm` (`browser-jshell.jar` sorts before `runner.core.wasm`): exit 2, both `DIFFERS: browser-jshell.jar`
  and `missing: runner.core.wasm`.
- On a fresh copy, the missing file first: append a byte to `tamper/legal/java.xml/xerces.md` and delete `tamper/NOTICE`
  (`NOTICE` sorts before `legal/…`): exit 2, both `DIFFERS: legal/java.xml/xerces.md` and `missing: NOTICE`.
- Save `CHECKSUMS`, remove its `NOTICE` line, verify a fresh copy: exit 2, `not in CHECKSUMS: NOTICE`. Restore `CHECKSUMS`
  from the saved copy, `cmp` it, and verify the same copy again: exit 0.
- Remove `CHECKSUMS`'s `browser-jshell.jar` line the same way: exit 2, `not in CHECKSUMS: browser-jshell.jar`. Restore it,
  `cmp` it, verify again: exit 0.
Delete `runtime/.work/ristretto/tamper` and `CHECKSUMS.first`.

- [ ] **Step 5: Commit**

```bash
git add runtime/ristretto/pins.env runtime/ristretto/CHECKSUMS runtime/ristretto/fetch.sh runtime/ristretto/package.sh runtime/ristretto/verify.sh
git commit
```
The message records: Step 1's upstream values on the day; the Corretto archive's two download times, its size and SHA-256,
and that it was never extracted or listed; the front end's jar (its SHA-256, built by `build.sh` and equal to `pins.json`'s
`jar`); the release name `current` points at and its `source.tar.gz` size and SHA-256;
the determinism result; the unpinned-archive gate and every break above, each with its exit code; and that nothing is
published (the release waits for the author's go and Plan 4).

### Task 2: the build installs the scratchpad; legal files fatal for both runtimes (D53)

**Files:**
- Create: `build/LegalFiles.java`, `build/LegalFilesTest.java`, `build/ScratchpadFiles.java`, `build/ScratchpadFilesTest.java`,
  `build/testdata/scratchpad-fixture/` (twelve one-line files and `CHECKSUMS`, Step 3), `runtime/legal/` (twelve files,
  written by `runtime/release/package.sh` in Step 2)
- Modify: `build/RuntimeFiles.java` (`LEGAL_NAMES`, `install`, `sameBytes`; `fetchAux` and `AUX_NAMES` removed),
  `build/RuntimeFilesTest.java`, `build/Build.java` (`--scratchpad`, `resolveScratchpadSource`, the install call, no
  `fetchAux`), `build/Volume.java` (`RESERVED`), `build/VolumeTest.java`, `build/Pages.java` (`copyScripts` empties
  `site/page/` and `site/runner/`), `build/PagesTest.java`, `build/Fixtures.java`, `build/BuildMainTest.java`,
  `build/BuildTest.java` (two suites), `web/test/harness.mjs` (`SCRATCHPAD`, `buildSite`),
  `runtime/release/package.sh` (the written offer in `SOURCES.txt`; a last step writing `runtime/legal/`)

**Interfaces:**
- Consumes: Task 1's `runtime/ristretto/CHECKSUMS` and `runtime/.work/ristretto/current`; in one test, the `jar` pin in
  `runtime/jshell/test/pins.json`.
- Produces: `java build/Build.java [--project <dir>] [--check] [--runtime <dir>] [--scratchpad <dir>]`. The scratchpad
  source is `--scratchpad <dir>`, else `runtime/.work/ristretto/current` under the tools root, else a `BuildError` naming
  `runtime/ristretto/fetch.sh`, `runtime/ristretto/package.sh` and `--scratchpad <dir>`.
  `Build.resolveScratchpadSource(Path tools, String dir) -> Path` is package-private static (a test calls it).
- Produces: `ScratchpadFiles` (package-private): `RUNTIME` (the six names: Ristretto's five and `browser-jshell.jar`),
  `LEGAL` (`NOTICE`, `LICENSE-APACHE`, `LICENSE-MIT`, `THIRD-PARTY.txt`, `SOURCES.txt`, `legal/java.base/LICENSE`),
  `sums(Path checksums)`, `install(Path project, Path source, Path site)`, `manifest(Map sums, Path dir)`. `install` reads
  `project/runtime/ristretto/CHECKSUMS` (project, not tools, as `RuntimeFiles` does, so fixture projects work), verifies the
  source (missing before differs), replaces `site/scratchpad/` with exactly the listed files plus `manifest.json`, verifies
  the copies, then `LegalFiles.require(site/scratchpad, LEGAL)`.
- Produces: `site/scratchpad/manifest.json` = `{"version", "files": {name: {"sha256", "size"}}}`, `files` holding the six
  runtime files and no legal file; `version` = the first 16 hex digits of the SHA-256 of those files' CHECKSUMS lines,
  joined as `<sha256>  <name>\n` in CHECKSUMS order: `fc8afd322759f4e1` with today's pins (Ristretto's five and the jar
  `e5ee02f4…`).
- Produces: `LegalFiles.require(Path dir, List<String> names)`: each name must be a non-empty regular file under `dir`; else a
  `BuildError` naming every gap (`<name>: missing` or `<name>: empty`) and D53. `RuntimeFiles.install` calls it on
  `site/runtime/` with `RuntimeFiles.LEGAL_NAMES` (the eleven names `AUX_NAMES` held), `ScratchpadFiles.install` on
  `site/scratchpad/`.
- Produces: `site/runtime/`'s legal files come from `project/runtime/legal/`, whatever the runtime source holds, and only when
  `runtime/legal/CHECKSUMS` equals `runtime/CHECKSUMS` byte for byte; `runtime/release/package.sh` writes `runtime/legal/`
  (the release's legal files and its `CHECKSUMS`) every time it writes `runtime/CHECKSUMS`.
- Produces: `Volume.RESERVED` = `runtime`, `runner`, `page`, `scratchpad`; a volume directory (one holding `volume.json`)
  with one of these names, compared ignoring case, is a `BuildError`.
- Produces: `Pages.copyScripts` empties `site/page/` and `site/runner/` before copying, so a script that left `WEB_SCRIPTS`
  or `RUNNER_SHARED` leaves the site (the Plan 3 ledger's deferred item).
- Produces: `Fixtures.SCRATCHPAD` (the fixture release); `Fixtures.project` also copies `runtime/legal/` and the fixture's
  `CHECKSUMS` as `runtime/ristretto/CHECKSUMS`; `Fixtures.build` adds `--scratchpad <fixture>` unless the caller names one.
- Produces: `web/test/harness.mjs` exports `SCRATCHPAD` (`JF_SCRATCHPAD`, else `runtime/.work/ristretto/current`);
  `buildSite` copies `runtime/legal/` and `runtime/ristretto/CHECKSUMS` into its project and passes `--scratchpad SCRATCHPAD`.

Why the legal files of the boxes' runtime are tracked copies: `runtime/dist/fork`, which every local build and test uses, has
none (`ls runtime/dist/fork`), and the site built from it carries none today (`ls site/runtime`), so "require what the source
directory has" cannot meet D53. A release directory exists only where `package.sh` ran, and a test must not depend on a
git-ignored release (Plan 2's Residual 6). `runtime/legal/` is written by the same `package.sh` run that writes
`runtime/CHECKSUMS`, and the copy of the release's `CHECKSUMS` inside it lets the build refuse notices written for other bytes.
`fetchAux` goes: it fetched, best-effort, files the build no longer reads (Plan 2's ruling C, closed).

Why the build's tests use a fixture scratchpad: `Files.copy` does not clone on APFS (measured: 40 copies of the 22 MB zip took
868 MB), one BuildTest run builds about 110 project sites, and `build/.work/tests/` already holds 5.0 GB; Ristretto's 30 MB in
each would add about 3.3 GB and 20 s a run. One test builds with the real release. `buildSite` (two callers at this task,
`page.mjs` and `replay.mjs`; later tasks add more) uses the real release: measured +0.2 s a call.

Why `Publish.guard` gets no skip: measured 0.078-0.103 s for the whole site with the scratchpad (0.018 s without), and a test
shows it scans `site/scratchpad/`.

- [ ] **Step 1: Write the failing tests for D53**

`build/LegalFilesTest.java` (Apache-2.0 header, as in `build/RuntimeFilesTest.java`):
```java
/*
 *  Copyright 2026 Java Foundations contributors.
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
import java.nio.file.*;
import java.util.*;

/** D53's one check: a published runtime directory without one of its notices stops the build, naming every gap. */
final class LegalFilesTest {
  static Path dir(String name, List<String> files) throws Exception {
    Path d = Fixtures.TOOLS.resolve("build/.work/tests/" + name);
    Fixtures.deleteTree(d);
    for (String f : files) { Files.createDirectories(d.resolve(f).getParent()); Files.writeString(d.resolve(f), f + " text\n"); }
    return d;
  }
  static void testEveryNamedFileMustBeThereAndNotEmpty() throws Exception {
    var names = List.of("NOTICE", "SOURCES.txt", "legal/java.base/LICENSE");
    LegalFiles.require(dir("legal-all", names), names); // must not throw
    Path d = dir("legal-gaps", List.of("NOTICE", "SOURCES.txt"));
    Files.writeString(d.resolve("SOURCES.txt"), "");
    Files.createDirectories(d.resolve("legal/java.base/LICENSE")); // a directory where the file belongs is no notice
    T.fails("SOURCES.txt: empty", () -> LegalFiles.require(d, names), "an empty file is named");
    T.fails("legal/java.base/LICENSE: missing", () -> LegalFiles.require(d, names), "a directory in a file's place is named");
    T.fails("D53", () -> LegalFiles.require(d, names), "and the message says why the build stops");
  }
}
```

In `build/RuntimeFilesTest.java`: delete `testARealReleasesFullLicenseSetReachesSiteRuntime` (lines 55-81: it asserts the
legal files are copied from the runtime source, the behavior D53 replaces) and
`testFetchAuxDownloadsAvailableLicenseFilesAndSkipsMissingOnes` (lines 83-118: `fetchAux` and its best-effort skip are
removed), and add in their place:
```java
  /** D53 (closing Plan 2's ruling C): the legal files come from the tracked runtime/legal/, whatever the runtime
   *  source holds, so a build from runtime/dist/fork (which has none) publishes them as a release build does. */
  static void testTheTrackedLegalFilesReachSiteRuntimeWhateverTheSourceHolds() throws Exception {
    Path release = copyOfDist("release-shaped");
    for (String name : RuntimeFiles.LEGAL_NAMES) Files.writeString(release.resolve(name), "an older release's " + name + "\n");
    Files.writeString(release.resolve("source.tar.gz"), "not a notice or license file");
    for (Path source : List.of(DIST, release)) {
      Path p = Fixtures.project("runtime-legal");
      T.eq(0, Fixtures.build(p, "--runtime", source.toString()).exit(), "build from " + source);
      for (String n : RuntimeFiles.LEGAL_NAMES)
        T.eq(-1L, Files.mismatch(p.resolve("runtime/legal/" + n), p.resolve("site/runtime/" + n)), n + " in site/runtime/ is runtime/legal/'s, building from " + source);
      T.check(!Files.exists(p.resolve("site/runtime/source.tar.gz")), "source.tar.gz does not reach site/runtime/");
    }
  }
  static void testAMissingLegalFileStopsTheBuild() throws Exception {
    for (String n : RuntimeFiles.LEGAL_NAMES) {
      Path p = Fixtures.project("runtime-legal-missing");
      Files.delete(p.resolve("runtime/legal/" + n));
      var r = Fixtures.build(p);
      T.eq(1, r.exit(), "a runtime without " + n + " is not published: " + r.out());
      T.check(r.out().contains(n + ": missing") && r.out().contains("D53"), "names it and says why: " + r.out());
    }
  }
  static void testTheLegalCopyMustBeTheOneWrittenForThesePinnedBytes() throws Exception {
    Path p = Fixtures.project("runtime-legal-stale");
    // Appended to, never edited in place: an edit of one character is no change when that character is already the new one.
    Files.writeString(p.resolve("runtime/legal/CHECKSUMS"), Files.readString(p.resolve("runtime/legal/CHECKSUMS")) + "x\n");
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "notices written for other bytes stop the build: " + r.out());
    T.check(r.out().contains("runtime/legal/CHECKSUMS is not runtime/CHECKSUMS"), "and say so: " + r.out());
  }
  /** D58: the boxes' SOURCES.txt carries GPLv2's three-year written offer, asked for in the repository's issues. It is
   *  written by runtime/release/package.sh into the tracked copy, so this reads the copy a reader's build publishes. */
  static void testTheTrackedSourcesFileCarriesTheWrittenOffer() throws Exception {
    String sources = Files.readString(Fixtures.TOOLS.resolve("runtime/legal/SOURCES.txt"));
    T.check(sources.contains("Written offer (GPLv2, section 3(b))"), "runtime/legal/SOURCES.txt carries the written offer");
    T.check(sources.contains("https://github.com/mmmugh/java-foundations/issues"), "and says where to ask for the source");
  }
  static void testAFileAnEarlierBuildLeftInSiteRuntimeIsNotPublished() throws Exception {
    Path p = Fixtures.project("runtime-stale");
    T.eq(0, Fixtures.build(p).exit(), "first build");
    Files.writeString(p.resolve("site/runtime/LICENSE-Dropped.txt"), "a license an older release shipped\n");
    T.eq(0, Fixtures.build(p).exit(), "second build");
    T.check(!Files.exists(p.resolve("site/runtime/LICENSE-Dropped.txt")), "a file no build writes is gone from site/runtime/");
  }
```

In `build/BuildTest.java`, `SUITES` gains `LegalFilesTest.class` after `RuntimeFilesTest.class`.

Run: `$J build/BuildTest.java RuntimeFilesTest`
Expected: exit 1, `error: compilation failed` (`LegalFiles` and `RuntimeFiles.LEGAL_NAMES` do not exist).

- [ ] **Step 2: Make legal files fatal for the boxes' runtime, and write `runtime/legal/`**

Create `build/LegalFiles.java`:
```java
/*
 *  Copyright 2026 Java Foundations contributors.
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
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/** D53: a runtime reaches site/ only with its notices. Both runtimes call this on the directory they just
 *  published (site/runtime/, site/scratchpad/), so what it checks is what a reader is served. */
final class LegalFiles {
  private LegalFiles() {}

  /** Each name must be a non-empty regular file under dir. Every one that is not is named, then the build stops. */
  static void require(Path dir, List<String> names) throws BuildError {
    var bad = new ArrayList<String>();
    for (String n : names) {
      Path f = dir.resolve(n);
      try {
        if (!Files.isRegularFile(f)) bad.add(n + ": missing");
        else if (Files.size(f) == 0) bad.add(n + ": empty");
      } catch (IOException e) { throw new BuildError(f + ": " + e.getMessage()); }
    }
    if (!bad.isEmpty()) throw new BuildError(dir + " would be published without its legal files:\n  " + String.join("\n  ", bad)
        + "\nthe licenses of the code a reader's browser runs require them (D21, D53), so the build stops");
  }
}
```

In `build/RuntimeFiles.java`, replace `install` (lines 57-80) with the following, add `sameBytes` above `sha256`, and delete
`AUX_NAMES`, `fetchAux` and their comments (lines 102-136):
```java
  /** The license, notice and source files that ship beside the six binaries: the set runtime/release/package.sh
   *  writes into a release, kept tracked in runtime/legal/ (package.sh refreshes that copy) so every build, from a
   *  release or from runtime/dist/fork, publishes them. */
  static final List<String> LEGAL_NAMES = List.of("NOTICE", "SOURCES.txt", "NOTICE-Rhino.txt", "NOTICE-Rhino-tools.txt",
      "LICENSE-Apache-2.0.txt", "LICENSE-GPLv2-CE.txt", "LICENSE-MPL-2.0-Rhino.txt", "LICENSE-BSD-3-Clause-ASM.txt",
      "LICENSE-BSD-3-Clause-ThreeTen.txt", "LICENSE-BSD-JZlib.txt", "LICENSE-Unicode.txt");

  /** Verifies source against project/runtime/CHECKSUMS, replaces site/runtime/ with the six binaries and the legal
   *  files from project/runtime/legal/, verifies the copies, then requires the legal files there (D53). The legal
   *  copy must have been written for these bytes: runtime/legal/CHECKSUMS, the release's CHECKSUMS kept beside its
   *  notices, must equal runtime/CHECKSUMS. */
  static void install(Path project, Path source, Path site) throws BuildError {
    var sums = sums(project.resolve("runtime/CHECKSUMS"));
    var probs = problems(source, sums);
    if (!probs.isEmpty()) throw new BuildError("the runtime at " + source + " does not match runtime/CHECKSUMS:\n  "
        + String.join("\n  ", probs) + "\nthese are the bytes a reader's browser would run, so the build stops");
    Path legal = project.resolve("runtime/legal");
    if (!sameBytes(legal.resolve("CHECKSUMS"), project.resolve("runtime/CHECKSUMS")))
      throw new BuildError("runtime/legal/CHECKSUMS is not runtime/CHECKSUMS: the notices in runtime/legal/ were written for"
          + " other runtime bytes; copy them from the release runtime/CHECKSUMS pins (runtime/release/package.sh does)");
    Path out = site.resolve("runtime");
    try {
      // The directory is the build's alone: a file an older build or release left there must not stay published.
      if (Files.exists(out)) try (var s = Files.walk(out)) { for (Path f : s.sorted(Comparator.reverseOrder()).toList()) Files.delete(f); }
      Files.createDirectories(out);
      for (String n : NAMES) Files.copy(source.resolve(n), out.resolve(n));
      for (String n : LEGAL_NAMES) if (Files.isRegularFile(legal.resolve(n))) Files.copy(legal.resolve(n), out.resolve(n));
    } catch (IOException e) { throw new BuildError("installing the runtime: " + e.getMessage()); }
    if (!problems(out, sums).isEmpty()) throw new BuildError("the runtime changed while it was copied");
    LegalFiles.require(out, LEGAL_NAMES);
  }
```
```java
  private static boolean sameBytes(Path a, Path b) throws BuildError {
    try { return Files.isRegularFile(a) && Files.mismatch(a, b) == -1; } catch (IOException e) { throw new BuildError(a + ": " + e.getMessage()); }
  }
```
In `build/Build.java`, delete `RuntimeFiles.fetchAux(baseUri, cache);` (line 149).

In `build/Fixtures.java`, `project` copies the legal files after `runtime/CHECKSUMS`:
```java
    copyTree(TOOLS.resolve("runtime/legal"), p.resolve("runtime/legal"));
```
(Step 3 rewrites the class comment, with the rest of the fixture wiring.)

In `runtime/release/package.sh`'s step 5, add the same written offer to the boxes' `SOURCES.txt`: insert these lines
immediately before `  cat "$outdir/SOURCES.txt.provenance"` (the author's decision D58: both runtimes, the repository's
issues as the channel):
```bash
  echo "Written offer (GPLv2, section 3(b)). For at least three years from the day this release was published,"
  echo "anyone may have a complete machine-readable copy of the corresponding source code of the GPL-licensed parts"
  echo "of these files (OpenJDK jdk25u, above), under the terms of the GPLv2, at no charge beyond the cost of"
  echo "physically performing the distribution, by download or on a medium customarily used for software"
  echo "interchange: ask at https://github.com/mmmugh/java-foundations/issues. The same source is in source.tar.gz,"
  echo "in the release beside these files."
  echo
```
`runtime/CHECKSUMS` does not list `SOURCES.txt`, so it stays unchanged; `runtime/legal/SOURCES.txt` carries the offer once
the step below has run.

Append to `runtime/release/package.sh`, after its last line:
```bash
# ---------------------------------------------------------------- 7. runtime/legal/, the tracked copy
# The build publishes these beside the six files (build/RuntimeFiles.java), from a release or from dist/fork,
# which has none (D53). CHECKSUMS rides along so the build can tell the copy was written for the bytes
# runtime/CHECKSUMS pins.
rm -rf "$F/legal"
mkdir -p "$F/legal"
( cd "$outdir" && cp NOTICE NOTICE-*.txt LICENSE-*.txt SOURCES.txt CHECKSUMS "$F/legal/" )
log "wrote runtime/legal/ (the notices the build publishes, and the CHECKSUMS they were written for)"
```
(`$F` is `runtime/`, line 30; `$outdir` is the release directory, line 37; by this point step 3 wrote the `LICENSE-*.txt` and
`NOTICE-*.txt`, step 5 `SOURCES.txt`, step 6 `NOTICE`, and step 2 `CHECKSUMS`.)

Run: `bash runtime/release/package.sh <today as YYYY.MM.DD>-1` (if that name exists under `runtime/.work/release/`, the next
`-N`). It refuses unless `runtime/dist/fork` was built from this tree; it was (`sh runtime/release/verify.sh runtime/dist/fork`
exits 0). It copies the jdk25u source zip into its `source.tar.gz` unopened, as Plan 1 always has.
Expected: exit 0 in about 5 s, last line `wrote runtime/legal/ (the notices the build publishes, and the CHECKSUMS they were
written for)`. Then:
```bash
git diff --exit-code runtime/CHECKSUMS; echo "CHECKSUMS unchanged: $?"
ls runtime/legal | wc -l
cmp runtime/legal/CHECKSUMS runtime/CHECKSUMS && echo tied
diff <(cd runtime/.work/release/2026.09.29-2 && cat LICENSE-*.txt NOTICE-*.txt) <(cd runtime/legal && cat LICENSE-*.txt NOTICE-*.txt) && echo "texts as 2026.09.29-2"
```
Expected: `CHECKSUMS unchanged: 0` (the same bytes, so the same pins); `12`; `tied`; `texts as 2026.09.29-2`. Only the
first lines of `NOTICE` and `SOURCES.txt` name the new release, and `SOURCES.txt` gains the written offer.

Run: `$J build/BuildTest.java RuntimeFilesTest`, then `$J build/BuildTest.java LegalFilesTest`
Expected: `9 test(s), 0 failed`, then `1 test(s), 0 failed` (the tenth RuntimeFilesTest test, the case check, arrives in
Step 5).
Breaks, each restored before the next, each exit 1 with the test named:
- Delete `LegalFiles.require(out, LEGAL_NAMES);` from `RuntimeFiles.install`: `testAMissingLegalFileStopsTheBuild` fails
  (the build publishes without the GPL text, exit 0).
- In `RuntimeFiles.install`, require only the GPL text, `LegalFiles.require(out, List.of("LICENSE-GPLv2-CE.txt"));`:
  `testAMissingLegalFileStopsTheBuild` fails (on `NOTICE`: the build publishes without it, exit 0).
- Delete the `if (!sameBytes(…)) throw …` statement: `testTheLegalCopyMustBeTheOneWrittenForThesePinnedBytes` fails.
- Copy each legal file from the runtime source when it has one, else from `runtime/legal/`:
  `testTheTrackedLegalFilesReachSiteRuntimeWhateverTheSourceHolds` fails on the planted "an older release's NOTICE".
- Delete the emptying of `site/runtime/` and give both copies `StandardCopyOption.REPLACE_EXISTING`:
  `testAFileAnEarlierBuildLeftInSiteRuntimeIsNotPublished` fails.
- In `LegalFiles`, `Files.size(f) == 0` to `Files.size(f) < 0`: `LegalFilesTest` fails ("SOURCES.txt: empty"); and
  `isRegularFile` to `exists`: it fails on the directory in the file's place.
- Delete the seven written-offer lines (the six `echo "Written offer…` … `echo "in the release beside these files."` lines
  and the `echo` after them) from `runtime/release/package.sh`, rerun it with the same name (it rewrites `runtime/legal/`
  without the offer): `testTheTrackedSourcesFileCarriesTheWrittenOffer` fails (exit 1). Nothing else in this step notices:
  `CHECKSUMS` does not list `SOURCES.txt`. Restore the script and rerun it with the same name.
- In `runtime/release/package.sh`'s new step, drop `CHECKSUMS` from the `cp` list and rerun it: every build exits 1 with
  `runtime/legal/CHECKSUMS is not runtime/CHECKSUMS` (check with `$J build/BuildTest.java BuildMainTest`: 1 failed). Restore
  and rerun `package.sh` with the same name.

- [ ] **Step 3: Write the failing scratchpad tests, the fixture release and the fixture wiring**

The fixture release: twelve files, each one line, `scratchpad fixture: <its name>` and a newline, made with
```bash
( cd build/testdata && mkdir -p scratchpad-fixture/legal/java.base && cd scratchpad-fixture && \
  for f in worker.js jdk.zip runner.core.wasm runner.core2.wasm runner.core3.wasm browser-jshell.jar NOTICE LICENSE-APACHE \
      LICENSE-MIT THIRD-PARTY.txt SOURCES.txt legal/java.base/LICENSE; do printf 'scratchpad fixture: %s\n' "$f" > "$f"; done && \
  find . -type f ! -name CHECKSUMS | sed 's#^\./##' | LC_ALL=C sort | while read -r n; do shasum -a 256 "$n"; done > CHECKSUMS )
```
(A subshell, so the shell is still at the repository root afterward: the commands below are relative to it.)
`build/testdata/scratchpad-fixture/CHECKSUMS` must then read exactly (fixture data files carry no header):
```
339b51b26a2c0a118e6218999df467f58d4bb7e2851c143a28d5f8502a11e500  LICENSE-APACHE
9740b9d1f44ac3fbf7689d8f69120009ca98e90d41efcac593525d3585d9aa72  LICENSE-MIT
1fbf7153ee3bef17f74cabc1179f3ce80784cc1213ae758899901f25d24cd158  NOTICE
7b3a353f7e45f107f13964b111c3ed7b194d67453595bc56318c883b98cac86a  SOURCES.txt
be09c6f1cd3114383e2017ce8e28a66613f4bea07d1c7cf094e07c5d5df552c5  THIRD-PARTY.txt
a73f7e619e727a5833e4020c24996193ae00f2db4c4f49a6cfdec3b855b01cd1  browser-jshell.jar
4d9364dc733ad1cd0e08778ed7d7c7e3e3342d4776c547c1a734bc82a7fb589d  jdk.zip
ac4534a3a9d7b719d38ccb101c5a6c2b56b788e684ef32b2fbb32775c3235cf4  legal/java.base/LICENSE
8bd0f6c98f2a18581f76de1dc04dedb0a79e085ccc4f460e485c3a72941731ea  runner.core.wasm
03a18548c65f225990de59558329d46f575039ae7405c9e3c172dbe2d2242524  runner.core2.wasm
563a0d0896559add6624357593370d9a68aa164f39ae25358efbe62ac8ed4627  runner.core3.wasm
4e9447256356ba08c56a97c95938b6e3972a1d2d82f6050b8ed0c3fa0f18bf2a  worker.js
```

`build/ScratchpadFilesTest.java` (Apache-2.0 header):
```java
/*
 *  Copyright 2026 Java Foundations contributors.
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
import java.nio.file.*;
import java.util.*;

/** The scratchpad reaches site/scratchpad/ only as runtime/ristretto/CHECKSUMS pins it: every listed byte verified,
 *  nothing unlisted, nothing stale, its legal files present (D53), and a manifest the page's client trusts. */
final class ScratchpadFilesTest {
  /** A copy of the fixture release, to change one thing in. */
  static Path release(String name) throws Exception {
    Path d = Fixtures.TOOLS.resolve("build/.work/tests/" + name);
    Fixtures.deleteTree(d);
    Fixtures.copyTree(Fixtures.SCRATCHPAD, d);
    return d;
  }
  /** Rewrites dir/CHECKSUMS from dir's files (except CHECKSUMS itself and any name in leaveOut), as package.sh does,
   *  and puts it into the project as runtime/ristretto/CHECKSUMS. */
  static void pin(Path dir, Path project, String... leaveOut) throws Exception {
    var lines = new ArrayList<String>();
    try (var s = Files.walk(dir)) {
      for (Path f : s.filter(Files::isRegularFile).sorted().toList()) {
        String n = dir.relativize(f).toString();
        if (n.equals("CHECKSUMS") || List.of(leaveOut).contains(n)) continue;
        lines.add(RuntimeFiles.sha256(f) + "  " + n);
      }
    }
    Files.writeString(dir.resolve("CHECKSUMS"), String.join("\n", lines) + "\n");
    Files.copy(dir.resolve("CHECKSUMS"), project.resolve("runtime/ristretto/CHECKSUMS"), StandardCopyOption.REPLACE_EXISTING);
  }
  @SuppressWarnings("unchecked")
  static Map<String, Object> manifest(Path project) throws Exception {
    return (Map<String, Object>) Json.parse(Files.readString(project.resolve("site/scratchpad/manifest.json")));
  }

  static void testThePinnedFilesArePublishedWithAManifestOfTheRuntimeFilesOnly() throws Exception {
    Path p = Fixtures.project("scratchpad");
    T.eq(0, Fixtures.build(p).exit(), "build");
    var sums = ScratchpadFiles.sums(p.resolve("runtime/ristretto/CHECKSUMS"));
    for (var e : sums.entrySet())
      T.eq(e.getValue(), RuntimeFiles.sha256(p.resolve("site/scratchpad/" + e.getKey())), e.getKey() + " published byte for byte");
    var m = manifest(p);
    @SuppressWarnings("unchecked") var files = (Map<String, Map<String, Object>>) m.get("files");
    // Only what the browser fetches: a NOTICE edit must not change the manifest. Its version changes exactly when a runtime
    // byte does; the client keys its cache entries by each file's own SHA-256, never by the version.
    // Named here, not taken from RUNTIME: the client downloads what the manifest lists, the course's jar among them.
    T.eq(new TreeSet<>(List.of("browser-jshell.jar", "jdk.zip", "runner.core.wasm", "runner.core2.wasm", "runner.core3.wasm", "worker.js")),
        new TreeSet<>(files.keySet()), "the manifest lists the six runtime files and nothing else");
    for (String n : ScratchpadFiles.RUNTIME) {
      T.eq(sums.get(n), files.get(n).get("sha256"), n + "'s manifest hash is CHECKSUMS's");
      T.eq(Files.size(p.resolve("site/scratchpad/" + n)), files.get(n).get("size"), n + "'s manifest size is the file's");
    }
    T.check(String.valueOf(m.get("version")).matches("[0-9a-f]{16}"), "version is 16 hex digits: " + m.get("version"));
  }
  static void testTheManifestVersionChangesWhenARuntimeByteDoesAndNotForANotice() throws Exception {
    Path p = Fixtures.project("scratchpad-version");
    T.eq(0, Fixtures.build(p).exit(), "build");
    Object v1 = manifest(p).get("version");
    Path r = release("scratchpad-version-notice");
    Files.writeString(r.resolve("NOTICE"), "a reworded notice\n");
    pin(r, p);
    T.eq(0, Fixtures.build(p, "--scratchpad", r.toString()).exit(), "build with a new NOTICE");
    T.eq(v1, manifest(p).get("version"), "a notice is not a byte the reader runs");
    Files.writeString(r.resolve("runner.core3.wasm"), "another interpreter glue\n");
    pin(r, p);
    T.eq(0, Fixtures.build(p, "--scratchpad", r.toString()).exit(), "build with a new runner.core3.wasm");
    T.check(!v1.equals(manifest(p).get("version")), "a new runtime byte is a new version: " + v1);
  }
  static void testOnlyListedFilesArePublished() throws Exception {
    Path r = release("scratchpad-extra");
    Files.writeString(r.resolve("index.html"), "<p>not ours to publish</p>\n");
    Files.writeString(r.resolve("_solutions.md"), "private\n");
    Path p = Fixtures.project("scratchpad-extra");
    T.eq(0, Fixtures.build(p, "--scratchpad", r.toString()).exit(), "a release directory holding more than CHECKSUMS lists still builds");
    T.check(!Files.exists(p.resolve("site/scratchpad/index.html")), "an unlisted file is not published");
    T.check(!Files.exists(p.resolve("site/scratchpad/_solutions.md")), "nor a private one");
    T.check(!Files.exists(p.resolve("site/scratchpad/CHECKSUMS")), "nor the release's own CHECKSUMS");
  }
  static void testChecksumsMustNameEveryRuntimeFileAndNothingElse() throws Exception {
    Path f = Fixtures.TOOLS.resolve("build/.work/tests/scratchpad-CHECKSUMS");
    Files.createDirectories(f.getParent());
    String good = Files.readString(Fixtures.SCRATCHPAD.resolve("CHECKSUMS"));
    String h = "0".repeat(64);
    Files.writeString(f, good);
    T.eq(12, ScratchpadFiles.sums(f).size(), "the fixture's CHECKSUMS parses");
    Files.writeString(f, "");
    T.fails("empty", () -> ScratchpadFiles.sums(f), "an empty CHECKSUMS");
    for (String n : List.of("jdk.zip", "browser-jshell.jar")) {
      Files.writeString(f, good.lines().filter(l -> !l.endsWith("  " + n)).map(l -> l + "\n").reduce("", String::concat));
      T.fails("does not list " + n, () -> ScratchpadFiles.sums(f), "a CHECKSUMS missing " + n);
    }
    for (String bad : List.of("index.html", "assets/runtime-DCdWMB6d.js", "legal/../NOTICE", "legal/java.base/../../x", "/etc/passwd",
        "legal/java.base", "legal/.hidden/LICENSE", "../jdk.zip")) {
      Files.writeString(f, good + h + "  " + bad + "\n");
      T.fails("does not publish: " + bad, () -> ScratchpadFiles.sums(f), "CHECKSUMS naming " + bad);
    }
    Files.writeString(f, good + "not-a-hash  NOTICE\n");
    T.fails("not a checksum line", () -> ScratchpadFiles.sums(f), "a malformed line");
    Files.writeString(f, good + h + "  NOTICE\n");
    T.fails("lists NOTICE twice", () -> ScratchpadFiles.sums(f), "a name listed twice");
  }
  static void testMissingOutranksDiffersAndTheBuildStops() throws Exception {
    Path p = Fixtures.project("scratchpad-tamper");
    T.eq(0, Fixtures.build(p).exit(), "a first, good build publishes the fixture");
    Path r = release("scratchpad-tamper");
    Files.write(r.resolve("jdk.zip"), new byte[] {0}, StandardOpenOption.APPEND);
    Files.delete(r.resolve("worker.js"));
    var res = Fixtures.build(p, "--scratchpad", r.toString());
    T.eq(1, res.exit(), "a tampered scratchpad stops the build: " + res.out());
    int missing = res.out().indexOf("worker.js: missing"), differs = res.out().indexOf("jdk.zip: differs");
    T.check(missing >= 0 && differs > missing, "names both, the missing one first: " + res.out());
    T.eq(RuntimeFiles.sha256(Fixtures.SCRATCHPAD.resolve("jdk.zip")), RuntimeFiles.sha256(p.resolve("site/scratchpad/jdk.zip")),
        "the tampered jdk.zip never reached site/scratchpad/ (it is checked before anything is copied)");
  }
  static void testAFileAnEarlierReleaseLeftIsNotPublished() throws Exception {
    String extra = "legal/java.base/ASSEMBLY_EXCEPTION";
    Path r = release("scratchpad-stale");
    Files.writeString(r.resolve(extra), "a notice that a later release drops\n");
    Path p = Fixtures.project("scratchpad-stale");
    pin(r, p);
    T.eq(0, Fixtures.build(p, "--scratchpad", r.toString()).exit(), "build with the extra notice pinned");
    T.check(Files.exists(p.resolve("site/scratchpad/" + extra)), "it is published while a release lists it");
    Files.writeString(p.resolve("site/scratchpad/runtime-old.js"), "an old Ristretto file\n");
    Files.copy(Fixtures.SCRATCHPAD.resolve("CHECKSUMS"), p.resolve("runtime/ristretto/CHECKSUMS"), StandardCopyOption.REPLACE_EXISTING);
    T.eq(0, Fixtures.build(p).exit(), "build with the fixture release, which does not list it");
    T.check(!Files.exists(p.resolve("site/scratchpad/" + extra)), "the dropped notice is gone");
    T.check(!Files.exists(p.resolve("site/scratchpad/runtime-old.js")), "and so is a file no release lists");
  }
  static void testAMissingLegalFileStopsTheBuild() throws Exception {
    for (String n : ScratchpadFiles.LEGAL) {
      Path r = release("scratchpad-legal-" + n.replace('/', '-'));
      Files.delete(r.resolve(n));
      Path p = Fixtures.project("scratchpad-legal");
      pin(r, p);
      var res = Fixtures.build(p, "--scratchpad", r.toString());
      T.eq(1, res.exit(), "a release without " + n + " stops the build: " + res.out());
      T.check(res.out().contains(n + ": missing") && res.out().contains("D53"), "and says which file and why: " + res.out());
    }
    Path r = release("scratchpad-legal-empty");
    Files.writeString(r.resolve("NOTICE"), "");
    Path p = Fixtures.project("scratchpad-legal-empty");
    pin(r, p);
    var res = Fixtures.build(p, "--scratchpad", r.toString());
    T.eq(1, res.exit(), "an empty NOTICE stops the build too");
    T.check(res.out().contains("NOTICE: empty"), "and says so: " + res.out());
  }
  static void testTheGuardScansTheScratchpad() throws Exception {
    Path r = release("scratchpad-guard");
    Files.writeString(r.resolve("THIRD-PARTY.txt"), "ANSWER KEY: 1. Hi\n");
    Path p = Fixtures.project("scratchpad-guard");
    pin(r, p);
    var res = Fixtures.build(p, "--scratchpad", r.toString());
    T.eq(1, res.exit(), "a pinned file carrying the marker is still refused: " + res.out());
    T.check(res.out().contains("scratchpad/THIRD-PARTY.txt"), "names it: " + res.out());
  }
  static void testNoScratchpadSaysHowToMakeOne() throws Exception {
    Path emptyTools = Fixtures.TOOLS.resolve("build/.work/tests/scratchpad-no-tools");
    Fixtures.deleteTree(emptyTools);
    Files.createDirectories(emptyTools);
    T.fails("runtime/ristretto/fetch.sh", () -> Build.resolveScratchpadSource(emptyTools, null), "names the fetch step");
    T.fails("runtime/ristretto/package.sh", () -> Build.resolveScratchpadSource(emptyTools, null), "names the package step");
    T.fails("--scratchpad <dir>", () -> Build.resolveScratchpadSource(emptyTools, null), "names the flag");
    var res = Fixtures.build(Fixtures.project("scratchpad-flag"), "--scratchpad");
    T.eq(2, res.exit(), "--scratchpad without a directory is misuse");
  }
  /** The real release (runtime/.work/ristretto/current, made by runtime/ristretto/package.sh) against the tracked
   *  CHECKSUMS: the one build per run that copies Ristretto's 30 MB. */
  static void testTheRealReleaseBuilds() throws Exception {
    Path current = Fixtures.TOOLS.resolve("runtime/.work/ristretto/current");
    T.check(Files.isDirectory(current), "runtime/.work/ristretto/current exists (run runtime/ristretto/fetch.sh, then package.sh)");
    Path p = Fixtures.project("scratchpad-real");
    Files.copy(Fixtures.TOOLS.resolve("runtime/ristretto/CHECKSUMS"), p.resolve("runtime/ristretto/CHECKSUMS"), StandardCopyOption.REPLACE_EXISTING);
    var res = Fixtures.build(p, "--scratchpad", current.toString());
    T.eq(0, res.exit(), "build: " + res.out());
    var sums = ScratchpadFiles.sums(p.resolve("runtime/ristretto/CHECKSUMS"));
    T.eq(103L, sums.keySet().stream().filter(n -> n.startsWith("legal/")).count(), "all 103 of jdk.zip's notices are pinned");
    T.eq("31fed6b4cd242fb1acbfeddc5ec52dd0ab9c7690cd95b681f132fb62d9328984", RuntimeFiles.sha256(p.resolve("site/scratchpad/jdk.zip")),
        "the published jdk.zip is Ristretto v0.34.0's");
    @SuppressWarnings("unchecked")
    var jshellPins = (Map<String, Object>) Json.parse(Files.readString(Fixtures.TOOLS.resolve("runtime/jshell/test/pins.json")));
    T.eq(jshellPins.get("jar"), RuntimeFiles.sha256(p.resolve("site/scratchpad/browser-jshell.jar")),
        "the published front end is the jar runtime/jshell/test/pins.json pins, the one its check holds to the real jshell");
    // D58: the release's SOURCES.txt carries GPLv2's written offer (runtime/ristretto/package.sh writes it).
    String sources = Files.readString(p.resolve("site/scratchpad/SOURCES.txt"));
    T.check(sources.contains("Written offer (GPLv2, section 3(b))"), "the published SOURCES.txt carries the written offer");
    T.check(sources.contains("https://github.com/mmmugh/java-foundations/issues"), "and says where to ask for the source");
    try (var s = Files.walk(p.resolve("site/scratchpad"))) {
      T.eq((long) sums.size() + 1, s.filter(Files::isRegularFile).count(), "site/scratchpad holds the pinned files and manifest.json, nothing else");
    }
  }
}
```

In `build/Fixtures.java`: after `TOOLS`,
```java
  /** A release-shaped scratchpad of a few bytes per file, so the build's tests do not copy Ristretto's 30 MB into
   *  every project (over a hundred per run); ScratchpadFilesTest builds once with the real release. */
  static final Path SCRATCHPAD = TOOLS.resolve("build/testdata/scratchpad-fixture");
```
in `project`, after the `runtime/legal` copy,
```java
    Files.createDirectories(p.resolve("runtime/ristretto"));
    Files.copy(SCRATCHPAD.resolve("CHECKSUMS"), p.resolve("runtime/ristretto/CHECKSUMS"));
```
and `build` becomes
```java
  /** Runs the build on a fixture project; returns exit code and everything it printed. The fixture scratchpad is
   *  the source unless args name another with --scratchpad. */
  record Result(int exit, String out) {}
  static Result build(Path project, String... args) {
    var all = new ArrayList<>(List.of(args));
    if (!all.contains("--scratchpad")) all.addAll(0, List.of("--scratchpad", SCRATCHPAD.toString()));
    var bytes = new ByteArrayOutputStream();
    int exit = Build.run(TOOLS, project, all, new PrintStream(bytes, true, java.nio.charset.StandardCharsets.UTF_8));
    return new Result(exit, bytes.toString(java.nio.charset.StandardCharsets.UTF_8));
  }
```
and the class comment becomes (it was two lines, naming `runtime/CHECKSUMS` and `web/` only):
```java
/** A fresh project directory per test: volumes/vol-fixture copied from build/testdata, plus runtime/CHECKSUMS,
 *  runtime/legal/ and web/ from the repository, and the small fixture scratchpad's CHECKSUMS
 *  (build/testdata/scratchpad-fixture/) as runtime/ristretto/CHECKSUMS. Everything lives under build/.work/tests/. */
```

In `build/BuildMainTest.java`, `testProjectBuildsAnotherDirectory` passes the fixture (its project carries the fixture's
`CHECKSUMS`, which the real release would not match) and checks the scratchpad arrived:
```java
    var o = main("--project", p.toString(), "--runtime", Fixtures.TOOLS.resolve("runtime/dist/fork").toString(),
        "--scratchpad", Fixtures.SCRATCHPAD.toString());
    T.eq(0, o.exit(), "exit: " + o.text());
    T.check(Files.exists(p.resolve("site/vol-fixture/ch01-first-programs.html")), "the project's site/ was written");
    T.check(Files.exists(p.resolve("site/scratchpad/manifest.json")), "with its scratchpad");
```
`SUITES` gains `ScratchpadFilesTest.class` after `LegalFilesTest.class`.

Run: `$J build/BuildTest.java ScratchpadFilesTest`
Expected: exit 1, `error: compilation failed` (`ScratchpadFiles` and `Build.resolveScratchpadSource` do not exist).

- [ ] **Step 4: Install the scratchpad**

Create `build/ScratchpadFiles.java`:
```java
/*
 *  Copyright 2026 Java Foundations contributors.
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
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/** The scratchpad's files (Ristretto's five, unmodified, the course's jshell front end, and their legal files),
 *  verified against runtime/ristretto/CHECKSUMS before they reach site/scratchpad/. Publishing is by whitelist: only
 *  the names CHECKSUMS lists are copied, and CHECKSUMS may list only the names below. */
final class ScratchpadFiles {
  private ScratchpadFiles() {}

  /** What the reader's browser fetches and runs; manifest.json lists exactly these. browser-jshell.jar is the course's
   *  front end, which the page composes into jdk.zip in place of Ristretto's own (D62). */
  static final List<String> RUNTIME = List.of("worker.js", "jdk.zip", "runner.core.wasm", "runner.core2.wasm", "runner.core3.wasm",
      "browser-jshell.jar");
  /** The legal files every release carries (D21, D53); LegalFiles.require checks them on site/scratchpad/. The
   *  last is Corretto's GPLv2 text, the one notice of the legal/ tree that names jdk.zip's license. */
  static final List<String> LEGAL = List.of("NOTICE", "LICENSE-APACHE", "LICENSE-MIT", "THIRD-PARTY.txt", "SOURCES.txt",
      "legal/java.base/LICENSE");
  /** Corretto's own notices, extracted unmodified from jdk.zip by runtime/ristretto/package.sh. */
  private static final Pattern CORRETTO_NOTICE = Pattern.compile("legal/[A-Za-z0-9_-][A-Za-z0-9._-]*/[A-Za-z0-9_-][A-Za-z0-9._-]*");

  static boolean allowed(String name) {
    return RUNTIME.contains(name) || LEGAL.contains(name) || CORRETTO_NOTICE.matcher(name).matches();
  }

  /** Name to SHA-256, in CHECKSUMS order. CHECKSUMS must name every RUNTIME file, nothing it may not, and no name twice. */
  static Map<String, String> sums(Path checksums) throws BuildError {
    List<String> lines;
    try { lines = Files.readAllLines(checksums); } catch (IOException e) { throw new BuildError(checksums + ": " + e.getMessage()); }
    var m = new LinkedHashMap<String, String>();
    for (String line : lines) {
      if (line.isBlank()) continue;
      String[] f = line.trim().split("\\s+");
      if (f.length != 2 || !f[0].matches("[0-9a-f]{64}")) throw new BuildError(checksums + ": not a checksum line: " + line);
      if (!allowed(f[1])) throw new BuildError(checksums + ": lists a file the scratchpad does not publish: " + f[1]);
      if (m.put(f[1], f[0]) != null) throw new BuildError(checksums + ": lists " + f[1] + " twice");
    }
    if (m.isEmpty()) throw new BuildError(checksums + ": empty");
    for (String n : RUNTIME) if (!m.containsKey(n)) throw new BuildError(checksums + ": does not list " + n);
    return m;
  }

  /** Verifies source against project/runtime/ristretto/CHECKSUMS, replaces site/scratchpad/ with exactly the listed
   *  files and manifest.json, verifies the copies, then requires the legal files there. */
  static void install(Path project, Path source, Path site) throws BuildError {
    var sums = sums(project.resolve("runtime/ristretto/CHECKSUMS"));
    var probs = RuntimeFiles.problems(source, sums);
    if (!probs.isEmpty()) throw new BuildError("the scratchpad at " + source + " does not match runtime/ristretto/CHECKSUMS:\n  "
        + String.join("\n  ", probs) + "\nthese are the bytes a reader's browser would run, so the build stops");
    Path out = site.resolve("scratchpad");
    try {
      // A name a newer release drops (or an old Ristretto file) must not stay published: the directory is the build's alone.
      if (Files.exists(out)) try (var s = Files.walk(out)) { for (Path f : s.sorted(Comparator.reverseOrder()).toList()) Files.delete(f); }
      for (String n : sums.keySet()) {
        Path to = out.resolve(n);
        Files.createDirectories(to.getParent());
        Files.copy(source.resolve(n), to);
      }
      Files.writeString(out.resolve("manifest.json"), manifest(sums, out));
    } catch (IOException e) { throw new BuildError("installing the scratchpad: " + e.getMessage()); }
    if (!RuntimeFiles.problems(out, sums).isEmpty()) throw new BuildError("the scratchpad changed while it was copied");
    LegalFiles.require(out, LEGAL);
  }

  /** {"version", "files": {name: {"sha256", "size"}}} for the files the browser fetches. version is the first 16
   *  hex digits of the SHA-256 of those files' CHECKSUMS lines: it changes exactly when a byte a reader runs does. */
  static String manifest(Map<String, String> sums, Path dir) throws BuildError {
    var files = new LinkedHashMap<String, Object>();
    var lines = new StringBuilder();
    for (var e : sums.entrySet()) {
      if (!RUNTIME.contains(e.getKey())) continue;
      long size;
      try { size = Files.size(dir.resolve(e.getKey())); } catch (IOException x) { throw new BuildError(e.getKey() + ": " + x.getMessage()); }
      var entry = new LinkedHashMap<String, Object>();
      entry.put("sha256", e.getValue());
      entry.put("size", size);
      files.put(e.getKey(), entry);
      lines.append(e.getValue()).append("  ").append(e.getKey()).append('\n');
    }
    var m = new LinkedHashMap<String, Object>();
    m.put("version", sha256(lines.toString()).substring(0, 16));
    m.put("files", files);
    return Json.write(m);
  }

  private static String sha256(String s) throws BuildError {
    try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(s.getBytes(java.nio.charset.StandardCharsets.UTF_8))); }
    catch (Exception e) { throw new BuildError("SHA-256: " + e.getMessage()); }
  }
}
```

In `build/Build.java`:
- after `String runtimeDir = null;` add `String scratchpadDir = null;`;
- after the `--runtime` branch add
```java
      } else if (a.equals("--scratchpad")) {
        if (i + 1 >= args.size()) { out.println(usage()); return 2; }
        scratchpadDir = args.get(++i);
```
- after `Path runtimeSource = resolveRuntimeSource(tools, runtimeDir);` add
  `Path scratchpadSource = resolveScratchpadSource(tools, scratchpadDir);` (both sources are found before anything is
  written);
- after `RuntimeFiles.install(project, runtimeSource, site);` add `ScratchpadFiles.install(project, scratchpadSource, site);`;
- above `usage()` add
```java
  /** --scratchpad <dir>; else runtime/.work/ristretto/current under the tools root (the release
   *  runtime/ristretto/package.sh made last), if it exists; else a BuildError saying how to make one. */
  static Path resolveScratchpadSource(Path tools, String scratchpadDir) throws BuildError {
    if (scratchpadDir != null) return Path.of(scratchpadDir);
    Path current = tools.resolve("runtime/.work/ristretto/current");
    if (Files.isDirectory(current)) return current;
    throw new BuildError("no scratchpad: run runtime/ristretto/fetch.sh, then runtime/ristretto/package.sh scratchpad-YYYY.MM.DD-N,"
        + " or pass --scratchpad <dir>");
  }
```
- `usage()` returns `"usage: java build/Build.java [--project <dir>] [--check] [--runtime <dir>] [--scratchpad <dir>]"`.

In `web/test/harness.mjs`, after `DIST`:
```js
// The scratchpad release a built site publishes (runtime/ristretto/package.sh points current at the newest).
export const SCRATCHPAD = process.env.JF_SCRATCHPAD || path.join(REPO, "runtime/.work/ristretto/current");
```
and `buildSite` becomes:
```js
// A built site for a fixture volume, built the way the course is: the volume copied into a fresh project under
// build/.work/<name>/ with runtime/CHECKSUMS, runtime/legal/, runtime/ristretto/CHECKSUMS and web/ from the
// repository, then `java build/Build.java --project`. The real scratchpad (SCRATCHPAD) is copied into every such
// site: about 30 MB, measured at 0.2 s more a build, so no cheaper stand-in is needed here.
export function buildSite(volumeDir, name) {
  const d = workDir(name);
  fs.cpSync(volumeDir, path.join(d, "volumes", path.basename(volumeDir)), { recursive: true });
  fs.mkdirSync(path.join(d, "runtime/ristretto"), { recursive: true });
  fs.copyFileSync(path.join(REPO, "runtime/CHECKSUMS"), path.join(d, "runtime/CHECKSUMS"));
  fs.cpSync(path.join(REPO, "runtime/legal"), path.join(d, "runtime/legal"), { recursive: true });
  fs.copyFileSync(path.join(REPO, "runtime/ristretto/CHECKSUMS"), path.join(d, "runtime/ristretto/CHECKSUMS"));
  fs.cpSync(path.join(REPO, "web"), path.join(d, "web"), { recursive: true });
  const p = spawnSync(J, ["build/Build.java", "--project", d, "--runtime", DIST, "--scratchpad", SCRATCHPAD], { cwd: REPO, encoding: "utf8" });
  if (p.status !== 0) throw new Error(`building ${volumeDir} failed (exit ${p.status}):\n${p.stdout}${p.stderr}`);
  return d;
}
```

Run: `$J build/BuildTest.java ScratchpadFilesTest`, then `$J build/BuildTest.java BuildMainTest`
Expected: `10 test(s), 0 failed` (in about 3 s), then `2 test(s), 0 failed`.
Breaks, each restored before the next, each exit 1 with the named test failing:
- Delete `LegalFiles.require(out, LEGAL);`: `testAMissingLegalFileStopsTheBuild` (a release without its NOTICE builds,
  exit 0).
- Delete the emptying of `site/scratchpad/` and copy with `REPLACE_EXISTING`: `testAFileAnEarlierReleaseLeftIsNotPublished`.
- Delete the `continue` line in `manifest` (every file listed): `testThePinnedFilesArePublishedWithAManifestOfTheRuntimeFilesOnly`
  and `testTheManifestVersionChangesWhenARuntimeByteDoesAndNotForANotice`.
- Move `"browser-jshell.jar"` from `RUNTIME` to `LEGAL` (still published and required, but out of the manifest, so the
  client would never download it): `testThePinnedFilesArePublishedWithAManifestOfTheRuntimeFilesOnly` (the manifest lists
  five) and `testChecksumsMustNameEveryRuntimeFileAndNothingElse` (a CHECKSUMS without the jar parses).
- Delete the first `problems` check (copy before anything is verified): `testMissingOutranksDiffersAndTheBuildStops` (the
  build dies copying the missing `worker.js`, with neither file named; the tampered `jdk.zip` was already copied).
- `allowed` returns `true`: `testChecksumsMustNameEveryRuntimeFileAndNothingElse` (a traversal name is accepted).
- Copy every regular file under the source instead of the CHECKSUMS names: `testOnlyListedFilesArePublished` (and
  `testTheRealReleaseBuilds`, whose release holds `CHECKSUMS` and `source.tar.gz` besides the pinned files).
- In `Publish.isPrivate`, skip files under `site/scratchpad/` (after the runtime skip, `if
  (site.relativize(f).getName(0).toString().equals("scratchpad")) return false;`): `testTheGuardScansTheScratchpad`.
- Delete the six `echo "Written offer…` … `echo "in the release beside these files."` lines from `runtime/ristretto/package.sh`
  and rerun it with the release's name (`scratchpad-<today>-2`; it rewrites `runtime/ristretto/CHECKSUMS` and the release's
  `SOURCES.txt` without the offer): `testTheRealReleaseBuilds` fails on "the published SOURCES.txt carries the written
  offer" (exit 1). Restore the script, rerun it, and `git diff --exit-code runtime/ristretto/CHECKSUMS` is silent again.
- Rename `runtime/.work/ristretto/current` aside: `testTheRealReleaseBuilds` fails on its first check. Rename it back.
- Change the last hex digit of `jar` in `runtime/jshell/test/pins.json` (a re-pin the release has not caught up with):
  `testTheRealReleaseBuilds` (the published jar is not the pinned one). Restore it.

- [ ] **Step 5: Write the failing tests for reserved names, stale scripts and case clashes**

In `build/VolumeTest.java`, before `testUnknownArgumentsAreMisuse`:
```java
  static void testAVolumeNamedLikeASitePathTheBuildWritesIsRefused() throws Exception {
    for (String name : List.of("runtime", "runner", "page", "scratchpad", "Scratchpad")) {
      Path p = Fixtures.project("volume-reserved");
      Files.move(p.resolve("volumes/vol-fixture"), p.resolve("volumes").resolve(name));
      T.fails("\"" + name + "\" has a name the site keeps for itself", () -> Volume.loadAll(p.resolve("volumes")), name + " is refused");
    }
    Path p = Fixtures.project("volume-reserved-build");
    Files.move(p.resolve("volumes/vol-fixture"), p.resolve("volumes/scratchpad"));
    var r = Fixtures.build(p);
    T.eq(1, r.exit(), "the build stops before writing a volume into site/scratchpad/: " + r.out());
    T.check(r.out().contains("has a name the site keeps for itself"), "and says why: " + r.out());
  }
```
In `build/PagesTest.java`, before `testThePagesScriptsArePublishedByNameAndNothingElseFromWeb`:
```java
  static void testAScriptThatLeftTheListsLeavesTheSite() throws Exception {
    Path p = Fixtures.project("pages-stale-scripts");
    T.eq(0, Fixtures.build(p).exit(), "first build");
    // What a script dropped from WEB_SCRIPTS or RUNNER_SHARED leaves behind after an earlier build.
    Files.writeString(p.resolve("site/page/dropped.mjs"), "export const old = 1;\n");
    Files.writeString(p.resolve("site/runner/dropped.mjs"), "export const old = 1;\n");
    T.eq(0, Fixtures.build(p).exit(), "second build");
    T.check(!Files.exists(p.resolve("site/page/dropped.mjs")) && !Files.exists(p.resolve("site/runner/dropped.mjs")), "neither is published");
    T.check(Files.exists(p.resolve("site/page/wire.mjs")) && Files.exists(p.resolve("site/runner/java-line.mjs")), "every listed script still is");
  }
```
In `build/RuntimeFilesTest.java`, before `testFetchDownloadsOnlyWhatIsMissingAndNeverOverwritesAMismatch` (the regression
test for worksheet checkpoint 30; it lives with the runtime because the clash is `runtime/RELEASE`):
```java
  /** Worksheet checkpoint 30: runtime/RELEASE (a file Plan 2 reads) cannot exist beside the directory runtime/release/
   *  on a filesystem that ignores case. No path may differ from another, or from a directory above one, only in case. */
  static List<String> caseClashes(List<String> paths) {
    var spellings = new TreeMap<String, TreeSet<String>>();
    for (String p : paths) {
      String[] parts = p.split("/");
      for (int i = 1; i <= parts.length; i++) {
        String prefix = String.join("/", Arrays.copyOf(parts, i));
        spellings.computeIfAbsent(prefix.toLowerCase(Locale.ROOT), k -> new TreeSet<>()).add(prefix);
      }
    }
    return spellings.values().stream().filter(s -> s.size() > 1).map(s -> String.join(" vs ", s)).toList();
  }
  static List<String> git(String... args) throws Exception {
    var cmd = new ArrayList<>(List.of("git", "-C", Fixtures.TOOLS.toString()));
    cmd.addAll(List.of(args));
    Process pr = new ProcessBuilder(cmd).redirectErrorStream(true).start();
    String out = new String(pr.getInputStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
    T.eq(0, pr.waitFor(), "git " + String.join(" ", args) + ": " + out);
    return out.lines().filter(l -> !l.isEmpty()).toList();
  }
  static void testNoTwoTrackedPathsDifferOnlyInCase() throws Exception {
    T.eq(List.of("runtime/RELEASE vs runtime/release"), caseClashes(List.of("runtime/RELEASE", "runtime/release/package.sh", "runtime/CHECKSUMS")),
        "a file and a directory differing only in case are a clash");
    T.eq(List.of("Docs vs docs"), caseClashes(List.of("docs/a.md", "Docs/b.md")), "so are two directories");
    T.eq(List.of(), caseClashes(List.of("runtime/ristretto/CHECKSUMS", "runtime/CHECKSUMS")), "the same name in two directories is not");
    var paths = new ArrayList<>(git("ls-files"));
    paths.addAll(git("ls-files", "--others", "--exclude-standard")); // what is about to be added counts too
    T.eq(List.of(), caseClashes(paths), "no tracked or addable paths differ only in case");
  }
```

Run: `$J build/BuildTest.java VolumeTest`, then `$J build/BuildTest.java PagesTest`, then
`$J build/BuildTest.java testNoTwoTracked`
Expected: exit 1 (`testAVolumeNamedLikeASitePathTheBuildWritesIsRefused`: "did not fail"), exit 1
(`testAScriptThatLeftTheListsLeavesTheSite`: "neither is published"), and exit 0 (nothing in the repository clashes today;
its break is in Step 6).

- [ ] **Step 6: Refuse reserved names, clear stale scripts**

In `build/Volume.java`, above `loadAll`:
```java
  /** Site paths the build writes for itself (site/runtime/, site/runner/, site/page/, site/scratchpad/): a volume
   *  named like one would publish into it or be wiped by it. Compared ignoring case, since the filesystem may. */
  static final List<String> RESERVED = List.of("runtime", "runner", "page", "scratchpad");
```
and in `loadAll` replace `if (Files.exists(volumeJson)) volumes.add(load(dir, volumeJson));` with
```java
      if (!Files.exists(volumeJson)) continue;
      String name = dir.getFileName().toString();
      if (RESERVED.contains(name.toLowerCase(java.util.Locale.ROOT)))
        throw new BuildError("volume directory \"" + name + "\" has a name the site keeps for itself (" + String.join(", ", RESERVED)
            + "); rename it");
      volumes.add(load(dir, volumeJson));
```
In `build/Pages.java`, `copyScripts` begins with
```java
    // site/page/ and site/runner/ hold only what this method writes: emptied first, a script that left the lists
    // above leaves the site too.
    for (String dir : List.of("page", "runner")) if (Files.exists(site.resolve(dir))) deleteTree(site.resolve(dir));
```
and its comment says "…to site/runner/, after emptying site/page/ and site/runner/. A listed file that is missing is a
BuildError naming it." (`deleteTree` is `Pages`'s own, line 342; nothing else writes into either directory: `grep -n
'site.resolve' build/*.java`.) A stale script at the site root (a root-level name leaving `WEB_SCRIPTS`; only `app.mjs` is
there) is not covered; a published site is built from a clean `site/` (Plan 4).

Run: `$J build/BuildTest.java VolumeTest`, `$J build/BuildTest.java PagesTest`
Expected: each `… test(s), 0 failed`.
Breaks, each restored, each exit 1:
- Make the reserved check `if (false)`: `testAVolumeNamedLikeASitePathTheBuildWritesIsRefused`.
- Delete the `deleteTree` line in `copyScripts`: `testAScriptThatLeftTheListsLeavesTheSite`.
- A case clash, without touching the real index:
```bash
export GIT_INDEX_FILE=$PWD/build/.work/case-index
git read-tree HEAD && git update-index --add --info-only --cacheinfo 100644,e69de29bb2d1d6434b8b29ae775ad8c2e48c5391,runtime/RELEASE
$J build/BuildTest.java testNoTwoTracked; echo "exit $?"
unset GIT_INDEX_FILE; rm build/.work/case-index; git status --short
```
  Expected: `FAIL  RuntimeFilesTest.testNoTwoTrackedPathsDifferOnlyInCase`, `got:  [runtime/RELEASE vs runtime/release]`,
  exit 1; then `git status` shows only this task's own changes.

- [ ] **Step 7: Run everything this task touches**

Run, each expected to exit 0:
- `$J build/BuildTest.java`: `124 test(s), 0 failed` (107 before this task; minus the two replaced RuntimeFilesTest tests,
  plus six there, one LegalFilesTest, ten ScratchpadFilesTest, one VolumeTest, one PagesTest). It takes about as long as
  before (91 s measured before, 89-94 s in the scratch copy).
- `node web/test/replay.mjs` and `node web/test/page.mjs`: the same counts they printed before this task (both build
  through `buildSite`).
- `$J build/Build.java --check` at the repository root: prints `no volumes`. Then `ls site/runtime | wc -l` is `17` (six
  binaries, eleven legal files), `find site/scratchpad -type f | wc -l` is `115` (114 pinned files and `manifest.json`),
  and `grep -c '"sha256"' site/scratchpad/manifest.json` is `6`, with `"version": "fc8afd322759f4e1"`.
- `sh runtime/ristretto/verify.sh runtime/.work/ristretto/current` and `sh runtime/release/verify.sh runtime/dist/fork`.

- [ ] **Step 8: Commit**

```bash
git add build/LegalFiles.java build/LegalFilesTest.java build/ScratchpadFiles.java build/ScratchpadFilesTest.java \
  build/testdata/scratchpad-fixture build/RuntimeFiles.java build/RuntimeFilesTest.java build/Build.java build/Volume.java \
  build/VolumeTest.java build/Pages.java build/PagesTest.java build/Fixtures.java build/BuildMainTest.java build/BuildTest.java \
  web/test/harness.mjs runtime/release/package.sh runtime/legal
git commit
```
If the pre-commit leak scan refuses (`runtime/legal/` holds third-party license texts with copyright names), stop and report;
never `--no-verify`, never edit a license text to get past it.
The message records: why the boxes' legal files are tracked copies tied to `runtime/CHECKSUMS` and why `fetchAux` went (D53,
closing Plan 2's ruling C); the fork release `package.sh` wrote and that `runtime/CHECKSUMS` did not change; why the build's
tests use a fixture release (the APFS copy measurement) and the guard no skip (its timing); the manifest's contents and
`version`; every break above with its exit code; and BuildTest's count before and after.

**Existing tests this task changes, and why:**
- `RuntimeFilesTest.testARealReleasesFullLicenseSetReachesSiteRuntime`: replaced by
  `testTheTrackedLegalFilesReachSiteRuntimeWhateverTheSourceHolds`. It asserted the legal files are copied from the runtime
  source directory; D53 makes `runtime/legal/` their one source, for a release and for dist/fork alike.
- `RuntimeFilesTest.testFetchAuxDownloadsAvailableLicenseFilesAndSkipsMissingOnes`: deleted with `fetchAux`, whose
  best-effort skip is the weakness ruling C named.
- `BuildMainTest.testProjectBuildsAnotherDirectory`: passes `--scratchpad <fixture>` (the subprocess build would otherwise use
  the real release against the fixture's `CHECKSUMS`) and checks `site/scratchpad/manifest.json`.
- Every test that builds through `Fixtures.build` (about 110 builds) now installs the fixture scratchpad and the tracked legal
  files; none needed a change of its own (124 pass in scratch). `PublishTest`'s runtime-skip tests are unchanged: the guard is.
- `web/test/page.mjs` and `web/test/replay.mjs` build through `buildSite`, which now publishes the real scratchpad; their
  checks are unchanged.

### Task 3: JShellSession, the client both the page and the check use

**Files:**
- Move: `runtime/jshell/compose.mjs` to `web/page/compose.mjs` (`git mv`; not a byte of it changes)
- Modify: `runtime/jshell/test/ristretto.mjs` and `runtime/jshell/test/browser.mjs` (one line each: where they find
  `compose.mjs`; Task 4 rewrites both)
- Create: `web/page/jshell-session.mjs`, `web/test/jshell-session.mjs`, `web/test/jshell-node.mjs`

This task changes files the course's front end owns in main (`runtime/jshell/`, 1d5e57b): it moves `compose.mjs` and
edits one line in each of two of its drivers. No pinned file moves (`runtime/jshell/test/pins.json` pins the jar built
from `src/`, the ten session files and `startup-time.jsh`), so there is no re-pin, and the front end's check must still
pass after the move (Step 1). Its `breaks.mjs` cannot pass between this task and Task 4, which rewrites it and runs it
(Step 1 says why).

**Interfaces:**
- Consumes: Task 2's `site/scratchpad/` (the six runtime files `worker.js`, `jdk.zip`, `runner.core.wasm`,
  `runner.core2.wasm`, `runner.core3.wasm` and `browser-jshell.jar`, and `manifest.json` = `{"version", "files": {name:
  {"sha256", "size"}}}` listing those six) and `harness.buildSite`, which since Task 2 builds with the scratchpad
  (`<dir>/site/scratchpad/` exists after it); Task 1's `runtime/ristretto/CHECKSUMS` and `runtime/.work/ristretto/v0.34.0/`;
  from the front end in main, `runtime/jshell/compose.mjs` and the command table `NAMES` in
  `runtime/jshell/src/foundations/scratchpad/Commands.java`.
- Produces: `web/page/compose.mjs` (`withFrontEnd(zip, jar)`, moved unchanged): Ristretto's pinned `jdk.zip` byte for byte
  as a prefix, then the jar as one stored entry and a new central directory that lists it in place of the zip's own
  `browser-jshell.jar`; it throws if the zip has no `browser-jshell.jar` to replace.
- Produces: `web/page/jshell-session.mjs` exports `ASSETS` (`jdk.zip`, the three wasm files and `browser-jshell.jar`: what
  the client downloads, checks and caches), `COMMANDS` (the front end's command names, in its order: what the client
  resolves a line's command against; a check keeps it equal to `Commands.java`'s `NAMES`) and `class JShellSession(base, {
  deadlineMs = 60_000, bootDeadlineMs = 240_000, outputLimitChars = 1_000_000, outputLimitLines = 100_000, onOutput(text,
  stream), onState(state), onProgress(phase), createWorker(url), fetchBytes(url, init), caches })`:
  - `state`: `idle | loading | ready | busy | ended`.
  - `endedBy`: `stopped | timeout | output-limit | out-of-memory | crashed | exited | failed-to-load`.
  - `endedWords`: the ending in plain words, for the panel to show as it is. `banner`.
  - `start() -> Promise<{ banner, prompt }>`, rejecting with an `Error` whose `reason` is `endedBy` if the session ends
    first: a download or check fails (the manifest's `version` included), the browser will not start the worker, the
    engine fails, or jshell does not answer within `bootDeadlineMs` (each `failed-to-load`), or `stop()`.
  - `submit(line) -> Promise<{ status: "ready", continuation, prompt } | { status: "ended", reason }>`. `prompt` is
    the next prompt as the front end gives it (`"\njshell> "`, `"   ...> "`, or a feedback mode's own, such as concise's
    `"jshell> "`), `null` if an answer carries none; the client never makes one up. It rejects when `state` is not `ready`
    or `line` holds a newline (one line per request, so a caller splits pasted text).
  - `cancel()` (Ctrl-C: the front end forgets the unfinished snippet, an `/exit`'s argument included; same result shape)
    and `stop()`.
  - A restart line: a line not typed at a continuation whose first word (up to a space) the front end resolves to
    `/reset` or `/reload` (the exact name in `COMMANDS`, else the one name the word begins). Ristretto's worker starts a
    fresh VM inside that one request and sends no phase event for it (its `lib.rs`, `execute_jshell`), so the client
    reports `onProgress("jshell")` as it sends the line and gives the request `bootDeadlineMs`, and a `/reload` also twice
    the time the session's entries (restarts aside) have taken since `start()`, since its replay runs them again. A restart
    that has not answered by then ends the session as `failed-to-load`: "The scratchpad could not start: after /reload,
    jshell did not answer within N seconds." No `reset` result, no second request: the client never restarts jshell
    itself.
  - `onProgress` phases: `download` (only when the files are not already in memory: a new session after an ending reports
    `engine`, then `jshell`), `engine`, `jshell` (also as a restart line is sent). `onOutput` never receives the banner or
    the Rust runtime's lines.
  - An entry's output past `outputLimitChars` or `outputLimitLines` ends the session as `output-limit`, and so does
    Ristretto's own stop at 1 MiB of UTF-8, in either wording: the worker's (`Output exceeded 1 MiB; session stopped.`)
    or the engine's (`Output exceeded 1 MiB; execution stopped.`), which is what the course's front end's output meets.
    The client counts characters and Ristretto bytes, so endless printing of a character wider than one byte meets
    Ristretto's stop first (`"é"`: 524 lines, under Node and in Chromium, WebKit and Firefox alike: Step 3's real half and
    Task 6 meet it).
  - Downloads: `manifest.json`, then each of `ASSETS`, each checked (size, and SHA-256 with `crypto.subtle`) and kept in the
    Cache Storage cache `jf-scratchpad` under `<base><name>?sha256=<hash>`, so a new jar never evicts the 22 MB zip; every
    load deletes the entries whose keys the manifest no longer gives. Only then `withFrontEnd(jdk.zip, browser-jshell.jar)`,
    and the worker's first request carries `[jdk.zip (composed), runner.core.wasm, runner.core2.wasm, runner.core3.wasm]`.
  - `base` is the URL of `site/scratchpad/`; `createWorker`, `fetchBytes` and `caches` default to the browser's own.
    `fetchBytes(url, init)` takes fetch's `init`: `manifest.json` is asked for with `{ cache: "no-cache" }`, so the
    browser always asks the site for it (GitHub Pages lets a browser keep any file for ten minutes), and a manifest that
    gives no `version` fails to load ("manifest.json does not give its version"). The worker is started at
    `<base>worker.js?v=<the manifest's version>`, so a browser that kept an old `worker.js` never runs it against a
    re-pin's files (the version changes whenever one of the six runtime files does, Task 2).
- Produces: `web/test/jshell-node.mjs`: `nodeWorker(url)` (a Web Worker's surface, plus `exited`, a promise settled by the
  thread's exit event), `nodeFetchBytes(url)`, `scratchpadDir(argv, usage, siteName)`, `dirUrl(dir)`. Task 4's
  `check.mjs` uses `scratchpadDir`, its `ristretto.mjs` the other three. Each test builds its own fixture site
  (`jshell-session-site` here; `jshell-check-site` and `jshell-breaks-site` in Task 4), so they can run at once. A test's
  `--scratchpad <dir>` names a built site's `scratchpad/` directory, which holds `manifest.json` (not a release directory,
  which holds none; `scratchpadDir` refuses one with the usage, exit 2).

Why a `/reload`'s deadline grows with the session (measured through this client, with the course's front end, on a
fixture site's scratchpad; Node 25.9, Chromium 153, WebKit 26.6, Firefox 155): a `/reload` is a fresh VM's boot and then a
replay of every entry the session accepted, each at about what it cost when typed.

| 50 accepted entries, then `/reload` | Node | Chromium | WebKit | Firefox |
|---|---|---|---|---|
| first boot | 11.2 s | 9.7 s | 10.5 s | 59.3 s |
| the 50 entries as typed (median each) | 39.5 s (0.66 s) | 36.9 s (0.65 s) | 34.5 s (0.58 s) | 61.0 s (1.03 s) |
| `/reset` (a fresh VM's boot) | 8.8 s | 9.6 s | 9.0 s | 15.2 s |
| `/reload` (boot and replay) | 43.1 s | 47.5 s | 43.4 s | 81.6 s |
| replay against typing | 0.88 | 1.03 | 1.00 | 1.09 |

Under Node the replay of 25 and 100 entries took 0.87 and 0.88 times their typing too (`/reload` 23.9 s and 106.1 s in
all: later entries cost more, so the total grows faster than the count), and the session that tried 140 entries ran out
of memory before its `/reload`. A fixed 240 s covers these in every engine, but not a long session in Firefox: an
estimate from the measured ratios (Firefox about 1.5 times Node per entry, replay 1.09 times typing) puts 100 entries at
about 15 + 1.09 × 170 ≈ 200 s and anything much longer past 240 s. So a `/reload` gets the boot deadline plus twice what
the session's entries have taken: at least 1.8 times the replay's own measure, on top of a boot deadline 16 times
Firefox's restart. A `/reset` replays nothing and keeps the boot deadline. Stop ends either at once.

- [ ] **Step 1: Move `compose.mjs` where the page can load it, and keep the front end's proof passing**

```bash
git mv runtime/jshell/compose.mjs web/page/compose.mjs
```
In `runtime/jshell/test/ristretto.mjs`, `import { withFrontEnd } from "../compose.mjs";` becomes
`import { withFrontEnd } from "../../../web/page/compose.mjs";`. In `runtime/jshell/test/browser.mjs`,
`["/compose.mjs", path.join(here, "../compose.mjs")],` becomes `["/compose.mjs", path.join(here, "../../../web/page/compose.mjs")],`.
Nothing else in `runtime/jshell/` loads it: `test/browser/page.mjs` imports `./compose.mjs`, which is the URL
`browser.mjs` serves it at.

Until Task 4, the proof reads Ristretto's files in upstream's layout; stage them from Task 1's verified copies, as real
files:
```bash
S=build/.work/jshell-upstream-site R=runtime/.work/ristretto/v0.34.0
rm -rf $S && mkdir -p $S/runtime && cp $R/worker.js $S/runner.worker.js && cp $R/jdk.zip $S/runtime/31fed6b4cd242fb1-jdk-25.zip \
  && cp $R/runner.core.wasm $S/runtime/612f0dd3c12f268a-runner.core.wasm && cp $R/runner.core2.wasm $S/runtime/c473092805a4a7ee-runner.core2.wasm \
  && cp $R/runner.core3.wasm $S/runtime/dfc7ad43bbd16ac2-runner.core3.wasm
```
(Drafting ran these commands with the scratch release's copies of the same five files in place of Task 1's `v0.34.0/`.)
Run (it runs the real jshell only through `RealJShell`, the builder with in-memory persistence; hash
`~/Library/Preferences/com.apple.java.util.prefs.plist` with `shasum -a 256` before and after, and stop if it changed):
`node runtime/jshell/test/check.mjs --site build/.work/jshell-upstream-site`, then
`node runtime/jshell/test/check.mjs --site build/.work/jshell-upstream-site --browser chromium --sessions startup`.
Expected: `10 sessions, 562 entries (our jar on Ristretto under Node): 525 byte-identical to the real jshell (with the
scratchpad's startup, J1), 37 equal to it after an allowed difference, 0 not; announced and fired: startup 20, engine 4,
frames 13, message 4, own 16.` and `ok: 0 failing, 131.9 s`, exit 0 (drafting run, 132 s); then `1 sessions, 18 entries
(our jar on Ristretto in headless chromium, staged page): 18 byte-identical …` and `ok: 0 failing, 30.4 s`, exit 0. The
plist's hash is unchanged.

`runtime/jshell/test/breaks.mjs` is not run here: it cannot pass at this task's commit, and Task 4 rewrites it and runs
it (its Step 7). Drafting ran it on a scratch copy of main's front end with this step's edits. Its copies under
`runtime/.work/breaks/<name>/` hold `runtime/jshell` alone, so a copied `test/ristretto.mjs` or `test/browser.mjs` finds
no `web/page/compose.mjs`: its six Ristretto and browser breaks end with exit 2 where they expect 1 (two were run:
`ERR_MODULE_NOT_FOUND` from the Ristretto driver, `ENOENT` for the staged page's `/compose.mjs`; the other four start the
same two drivers), while its 17 fast breaks pass (`--skip-slow`: `17 breaks, 0 not caught as expected`, exit 0, 63 s). And it reads Ristretto's files from `runtime/.work/ristretto/` in
upstream's layout, where Task 1 keeps its own (`v0.34.0/`, `release/`, `current`): with Task 1's layout it stops before
its first break (`Error: ENOENT: no such file or directory, open '…/runtime/.work/ristretto/runner.worker.js'`, exit 1).
Task 4's `breaks.mjs` copies `web/` beside the front end and reads a built site's `scratchpad/`.

- [ ] **Step 2: Node can run Ristretto's worker**

Create `web/test/jshell-node.mjs`:
```js
/*
 *  Copyright 2026 Java Foundations contributors.
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
// What JShellSession needs from a browser, given under Node: Ristretto's worker script in a worker thread that looks
// like a Web Worker from inside (self, postMessage, onmessage) and from outside (postMessage, terminate, onmessage,
// onerror, and exited, which a Web Worker lacks), and file downloads read from disk. Used by
// web/test/jshell-session.mjs and by the transcript check (runtime/jshell/test/check.mjs and its ristretto.mjs).
import fs from "node:fs";
import path from "node:path";
import { Worker } from "node:worker_threads";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildSite, REPO } from "./harness.mjs";

// Inside the thread. A browser holds a worker's messages until its script has run; so does this, since the client
// posts its first request at once and the script takes a moment to load.
const HOST = `
const { parentPort, workerData } = require("node:worker_threads");
globalThis.self = globalThis;
globalThis.postMessage = (m) => parentPort.postMessage(m);
const queue = [];
let loaded = false;
parentPort.on("message", (m) => (loaded ? globalThis.onmessage({ data: m }) : queue.push(m)));
import(workerData.url).then(() => { loaded = true; for (const m of queue.splice(0)) globalThis.onmessage({ data: m }); });
`;
export function nodeWorker(url) {
  const thread = new Worker(HOST, { eval: true, workerData: { url } });
  const w = {
    onmessage: null, onerror: null, onmessageerror: null, terminated: false,
    // Settles once the thread has really stopped (its exit event): a test can tell a stopped thread from the flag.
    exited: new Promise((resolve) => thread.once("exit", resolve)),
    postMessage: (m) => thread.postMessage(m),
    terminate: () => { w.terminated = true; thread.terminate(); },
  };
  thread.on("message", (data) => w.onmessage?.({ data }));
  thread.on("messageerror", () => w.onmessageerror?.({}));
  thread.on("error", (e) => w.onerror?.({ message: String(e?.message ?? e) }));
  thread.on("exit", (code) => { if (!w.terminated) w.onerror?.({ message: `the worker thread exited (${code})` }); });
  return w;
}
export const nodeFetchBytes = async (url) => new Uint8Array(fs.readFileSync(fileURLToPath(url)));

// The directory under test, laid out as site/scratchpad/: --scratchpad <dir>, or a fixture site built the way the
// course is (harness.buildSite), so the test reads what the build publishes, manifest.json included.
export function scratchpadDir(argv, usage, siteName) {
  if (argv.length === 0) return path.join(buildSite(path.join(REPO, "web/test/vol-page"), siteName), "site/scratchpad");
  if (argv.length === 2 && argv[0] === "--scratchpad" && fs.existsSync(path.join(argv[1], "manifest.json"))) return path.resolve(argv[1]);
  console.log(usage);
  process.exit(2);
}
export const dirUrl = (dir) => pathToFileURL(dir.endsWith(path.sep) ? dir : dir + path.sep);
```

- [ ] **Step 3: Write the failing test**

`web/test/jshell-session.mjs`. The fake worker's events are copies of what the real worker sent in the drafting probes (a
memory abort's stderr arrives in three fragments; a panic opens with a blank line); each is labeled "Recorded from the real
worker" where it is. The real half then meets each way the engine gives out in the engine's own words, never a copy: a
Rust abort, a Rust panic (capacity overflow), Ristretto's own 1 MiB stop in the engine's wording, and memory past 2 GiB,
which ends a long session with the JavaScript engine's RangeError (V8's under Node; one entry holding 2 GB gets there at
once, measured in Node, Chromium, WebKit and Firefox). Task 6 meets the last two in each browser, where WebKit's and
Firefox's RangeErrors are worded differently. Its answers carry a prompt, as the course's front end's do, and its `jdk.zip` is a real (tiny) zip
archive holding a `browser-jshell.jar`, so the client's composition runs on it as on the real one.
```js
/*
 *  Copyright 2026 Java Foundations contributors.
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
// JShellSession under Node. First against a fake of Ristretto's worker, for every state change and every ending a
// reader can meet (a real engine cannot be made to fail on cue, and a browser would make each check cost a boot);
// then against the real pinned worker running the course's front end in a worker thread: a round trip with its
// prompts, a cancel at an unfinished /exit, a real /reset and /reload, a real memory abort and the engine's other ways
// of giving out (an impossible allocation, Ristretto's own 1 MiB stop, memory past 2 GiB), a real deadline, a real Stop.
// The fake's events copy the real worker's, recorded by the real round trip's probes.
//   node web/test/jshell-session.mjs [--scratchpad <dir>]   (<dir>: a built site's scratchpad/, holding manifest.json;
//   default: a fixture site built by harness.buildSite)
import fs from "node:fs";
import path from "node:path";
import { JShellSession, ASSETS, COMMANDS } from "../page/jshell-session.mjs";
import { withFrontEnd } from "../page/compose.mjs";
import { check, done, REPO } from "./harness.mjs";
import { nodeWorker, nodeFetchBytes, scratchpadDir, dirUrl } from "./jshell-node.mjs";

const USAGE = "usage: node web/test/jshell-session.mjs [--scratchpad <dir>]\n" +
  "  <dir>: a built site's scratchpad directory, holding manifest.json (not a release directory, which has none)";
const BASE = "https://course.test/vol-1/scratchpad/";
const BANNER = "|  Welcome to JShell -- Version 25.0.4.1\n|  For an introduction type: /help intro\n";
const PROMPT = "\njshell> ", MORE = "   ...> ";
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const sha = async (bytes) => hex(await crypto.subtle.digest("SHA-256", bytes));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Every check that waits gets a wall clock, so a client that hangs fails the check instead of hanging the test.
const within = (ms, p) => Promise.race([p, sleep(ms).then(() => ({ status: "no-answer" }))]);
const text = (s) => new TextEncoder().encode(s);

// A stored zip archive of the given entries (no compression, no CRCs, which compose.mjs never reads): the fake
// jdk.zip, holding a browser-jshell.jar for the course's front end to replace.
function storedZip(entries) {
  const parts = [], central = [];
  let offset = 0;
  for (const [name, data] of entries) {
    const n = text(name);
    const local = new Uint8Array(30 + n.length), lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 10, true); lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true); lv.setUint16(26, n.length, true); local.set(n, 30);
    const c = new Uint8Array(46 + n.length), cv = new DataView(c.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 10, true); cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true); cv.setUint16(28, n.length, true); cv.setUint32(42, offset, true); c.set(n, 46);
    parts.push(local, data);
    central.push(c);
    offset += local.length + data.length;
  }
  const size = central.reduce((s, c) => s + c.length, 0);
  const end = new Uint8Array(22), ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, entries.length, true); ev.setUint16(10, entries.length, true);
  ev.setUint32(12, size, true); ev.setUint32(16, offset, true);
  const out = new Uint8Array(offset + size + 22);
  let at = 0;
  for (const p of [...parts, ...central, end]) { out.set(p, at); at += p.length; }
  return out;
}

// The files a fake site serves: five small assets (jdk.zip a real archive, as compose.mjs needs) and a manifest of
// their real hashes.
const FILES = Object.fromEntries(ASSETS.map((n) => [n, text(`the bytes of ${n}`)]));
FILES["jdk.zip"] = storedZip([["lib/modules", text("the JDK's classes")], ["browser-jshell.jar", text("Ristretto's own front end")]]);
// version: the manifest's (null: none).
const manifestOf = async (files, version = "test") => text(JSON.stringify({ ...(version === null ? {} : { version }),
  files: Object.fromEntries(await Promise.all(Object.entries(files).map(async ([n, b]) => [n, { sha256: await sha(b), size: b.length }]))) }));
const MANIFEST = await manifestOf(FILES);
const COMPOSED = withFrontEnd(FILES["jdk.zip"], FILES["browser-jshell.jar"]);
// fetched: every URL asked for, in order; cache: what each last asked of the HTTP cache (fetch's init.cache, or null).
function fakeSite(change = {}) {
  const fetched = [], cache = {};
  const fetchBytes = async (url, init) => {
    fetched.push(url);
    cache[url] = init?.cache ?? null;
    const name = url.slice(BASE.length);
    if (change[name] instanceof Error) throw change[name];
    if (change[name] instanceof Promise) return change[name];
    if (change[name]) return change[name];
    if (name === "manifest.json") return MANIFEST;
    if (FILES[name]) return FILES[name];
    throw new Error("HTTP 404");
  };
  return { fetched, cache, fetchBytes };
}
// A fake of Ristretto's worker. answer(request, w) replies through w.emit; a request it does not answer is never
// answered. emit delivers even after terminate(), the worst a real worker could do with a message already queued.
// Its ready answers carry a prompt, as the course's front end's do.
const ok = (r, extra = {}) => ({ id: r.id, type: "ready", continuation: false, closed: false, reset: false, prompt: PROMPT, ...extra });
const out = (r, text, stream = "stdout") => ({ id: r.id, type: "output", stream, text });
function bootThen(answer) {
  return (r, w) => {
    if (r.source === "" && r.operation === "input" && w.boots++ === 0) {
      w.emit({ id: r.id, type: "phase", phase: "loading" });
      w.emit({ id: r.id, type: "phase", phase: "evaluating" });
      w.emit(out(r, BANNER.slice(0, 20)));
      w.emit(out(r, BANNER.slice(20)));
      return w.emit(ok(r));
    }
    answer(r, w);
  };
}
function session(answer, opts = {}, site = fakeSite()) {
  const log = { workers: [], output: [], states: [], progress: [] };
  const s = new JShellSession(BASE, {
    fetchBytes: site.fetchBytes, caches: null,
    createWorker: (url) => {
      const w = { url, posts: [], boots: 0, terminated: false, onmessage: null, onerror: null,
        postMessage(m) { w.posts.push(m); setTimeout(() => { if (!w.terminated) answer(m.request, w); }, 0); },
        terminate() { w.terminated = true; },
        emit(e) { w.onmessage?.({ data: e }); } };
      log.workers.push(w);
      return w;
    },
    onOutput: (text, stream) => log.output.push([stream, text]),
    onState: (st) => log.states.push(st),
    onProgress: (ph) => log.progress.push(ph),
    ...opts,
  });
  return { s, log, site, w: () => log.workers.at(-1) };
}
const started = async (answer, opts) => { const t = session(bootThen(answer), opts); await within(2000, t.s.start()); return t; };
const shown = (log) => log.output.map(([, t]) => t).join("");

// ---- the stop policy's numbers (D49) ----
const d = new JShellSession(BASE);
check("the client's limits are D49's: 60,000 ms an entry, 240,000 ms a boot, 1,000,000 characters or 100,000 lines of output an entry",
  d.deadlineMs === 60_000 && d.bootDeadlineMs === 240_000 && d.outputLimitChars === 1_000_000 && d.outputLimitLines === 100_000,
  { deadlineMs: d.deadlineMs, bootDeadlineMs: d.bootDeadlineMs, outputLimitChars: d.outputLimitChars, outputLimitLines: d.outputLimitLines });

// ---- starting ----
let t = session(bootThen(() => {}));
let r = await within(2000, t.s.start());
const first = t.w().posts[0];
check("start downloads the manifest, then the five files, and nothing else",
  JSON.stringify(t.site.fetched.slice(0, 1)) === JSON.stringify([BASE + "manifest.json"])
    && JSON.stringify(t.site.fetched.slice(1).sort()) === JSON.stringify(ASSETS.map((n) => BASE + n).sort()), t.site.fetched);
check("the worker is the site's own worker.js under the manifest's version, so a browser that kept an old worker.js never runs it",
  t.w().url === BASE + "worker.js?v=test", t.w().url);
check("manifest.json is asked of the site past the HTTP cache (cache: no-cache), the five files as usual",
  t.site.cache[BASE + "manifest.json"] === "no-cache" && ASSETS.every((n) => t.site.cache[BASE + n] === null), t.site.cache);
check("the first request is Ristretto's jshell request with the worker's four files, the course's front end composed into jdk.zip",
  JSON.stringify(first.request) === JSON.stringify({ id: 1, javaVersion: 25, action: "jshell", className: "BrowserJShell", source: "", operation: "input", cursor: 0 })
    && JSON.stringify(first.assets.map(([n]) => n)) === JSON.stringify(["jdk.zip", "runner.core.wasm", "runner.core2.wasm", "runner.core3.wasm"])
    && (await sha(first.assets[0][1])) === (await sha(COMPOSED)) && first.assets[1][1] === FILES["runner.core.wasm"],
  { request: first.request, assets: first.assets.map(([n, b]) => [n, b.length]) });
check("start resolves with jshell's banner and its first prompt, and the banner is not also sent as output",
  r?.banner === BANNER && r?.prompt === PROMPT && t.log.output.length === 0, { r, output: t.log.output });
check("start goes idle to loading to ready, and says what it is doing", t.log.states.join(" ") === "loading ready"
  && t.log.progress.join(" ") === "download engine jshell" && t.s.state === "ready", t.log);
// The browser's own fetch, which the client uses when it is given no fetchBytes, is asked the same way.
const browserFetch = globalThis.fetch, fetchAsked = [];
globalThis.fetch = async (url, init) => {
  fetchAsked.push([String(url).slice(BASE.length), init?.cache ?? null]);
  return new Response(await fakeSite().fetchBytes(String(url)));
};
t = session(bootThen(() => {}), { fetchBytes: undefined });
try { r = await within(2000, t.s.start()).catch((x) => x); } finally { globalThis.fetch = browserFetch; }
check("with no fetchBytes of its own, the client asks the browser's fetch for manifest.json with cache: no-cache, the files as usual",
  r?.banner === BANNER && JSON.stringify(fetchAsked[0]) === JSON.stringify(["manifest.json", "no-cache"])
    && JSON.stringify(fetchAsked.slice(1).sort()) === JSON.stringify(ASSETS.map((n) => [n, null]).sort()), fetchAsked);

// ---- entries ----
t = await started((r, w) => {
  if (r.source === "2 + 3") { w.emit({ id: r.id, type: "phase", phase: "evaluating" }); w.emit(out(r, "$1 ==> 5\n")); w.emit(ok(r)); }
  else if (r.source === "if (true) {") w.emit(ok(r, { continuation: true, prompt: MORE }));
  else if (r.operation === "cancel") w.emit(ok(r));
  else if (r.source === "/set feedback concise") w.emit(ok(r, { prompt: "jshell> " }));
});
r = await within(2000, t.s.submit("2 + 3"));
check("an entry is one request without the files, and its output arrives as it is printed",
  r.status === "ready" && r.continuation === false && t.w().posts[1].assets === undefined && t.w().posts[1].request.id === 2
    && t.w().posts[1].request.source === "2 + 3" && JSON.stringify(t.log.output) === JSON.stringify([["stdout", "$1 ==> 5\n"]]), { r, output: t.log.output });
check("an entry goes busy, then ready", t.log.states.slice(-2).join(" ") === "busy ready", t.log.states);
const prompts = [r.prompt];
r = await within(2000, t.s.submit("if (true) {"));
check("a line that leaves the snippet open is a continuation", r.status === "ready" && r.continuation === true && t.s.state === "ready", r);
prompts.push(r.prompt);
r = await within(2000, t.s.cancel());
check("cancel drops the open snippet, as Ctrl-C does", r.status === "ready" && r.continuation === false
  && t.w().posts.at(-1).request.operation === "cancel" && t.w().posts.at(-1).request.source === "", { r, post: t.w().posts.at(-1) });
prompts.push(r.prompt);
r = await within(2000, t.s.submit("/set feedback concise"));
prompts.push(r.prompt);
check("each answer hands on the front end's next prompt as it is: after an entry, at a continuation, after a cancel, in concise mode",
  JSON.stringify(prompts) === JSON.stringify([PROMPT, MORE, PROMPT, "jshell> "]), prompts);
let threw = null;
try { await t.s.submit("int a = 1;\nint b = 2;"); } catch (e) { threw = e.message; }
check("one line per request: a line holding a newline is refused before anything is sent", threw === "submit() takes one line" && t.w().posts.length === 5, threw);
const busy = t.s.submit("while (true) {}");
threw = null;
try { await t.s.submit("1 + 1"); } catch (e) { threw = e.message; }
check("a second entry while one runs is refused, never sent (the worker would drop it)", threw === "submit() while busy" && t.w().posts.length === 6, { threw, posts: t.w().posts.length });
threw = null;
try { await t.s.start(); } catch (e) { threw = e.message; }
check("start while a session runs is refused", threw === "start() while busy", threw);

// ---- Stop and the deadline ----
t.s.stop();
r = await within(2000, busy);
check("Stop ends a running entry at once: the worker is terminated and the session is gone",
  r.status === "ended" && r.reason === "stopped" && t.w().terminated && t.s.state === "ended" && t.s.endedBy === "stopped", { r, state: t.s.state });
check("Stop is said in plain words", t.s.endedWords === "Stopped. The session ended, and its variables and methods are gone.", t.s.endedWords);
// The stopped worker keeps talking after a new session has started: output and an answer for the request it was
// stopped in (its own id, the late answer a real worker would send) and for another (the new session's boot's id), its
// error and a message it could not pass change nothing.
const stoppedWorker = t.w(), stoppedId = stoppedWorker.posts.at(-1).request.id;
await within(2000, t.s.start());
const before = t.log.output.length, statesBefore = t.log.states.length;
for (const id of [stoppedId, t.w().posts[0].request.id]) { stoppedWorker.emit(out({ id }, "late\n")); stoppedWorker.emit(ok({ id })); }
stoppedWorker.onerror?.({ message: "late", preventDefault() {} });
stoppedWorker.onmessageerror?.({});
await sleep(10);
check("output, an answer and an error from the stopped worker change nothing, once a new session has started",
  t.log.output.length === before && t.log.states.length === statesBefore && t.s.state === "ready" && t.s.endedBy === null,
  { output: t.log.output.slice(before), states: t.log.states.slice(statesBefore), state: t.s.state, endedBy: t.s.endedBy });
// And while the new session's first entry runs: the stopped worker's late answer to its own request neither shows its
// output nor stands in for the entry's answer.
const running = t.s.submit("2 + 3").catch((e) => ({ status: "refused", message: e.message }));
stoppedWorker.emit(out({ id: stoppedId }, "late\n"));
stoppedWorker.emit(ok({ id: stoppedId }));
r = await within(2000, running);
check("and while the new session's entry runs, the stopped worker's late answer to its own request is not taken for the entry's",
  r.status === "ready" && JSON.stringify(t.log.output.slice(before)) === JSON.stringify([["stdout", "$1 ==> 5\n"]])
    && t.log.states.slice(statesBefore).join(" ") === "busy ready", { r, output: t.log.output.slice(before), states: t.log.states.slice(statesBefore) });
// The worker in use, answering for a request other than the one in flight (an earlier id), is not heard either.
t = await started((r, w) => { w.emit(out({ id: r.id - 1 }, "stale\n")); w.emit(ok({ id: r.id - 1 })); w.emit(out(r, "fresh\n")); w.emit(ok(r)); });
r = await within(2000, t.s.submit("x"));
check("output and an answer from the worker for another request than the one in flight change nothing",
  r.status === "ready" && JSON.stringify(t.log.output) === JSON.stringify([["stdout", "fresh\n"]]) && t.log.states.join(" ") === "loading ready busy ready",
  { r, output: t.log.output, states: t.log.states });
t = await started(() => {}, { deadlineMs: 50 });
r = await within(2000, t.s.submit("while (true) {}"));
check("an entry that runs past the deadline is stopped there, its worker terminated", r.status === "ended" && r.reason === "timeout" && t.w().terminated, r);
check("the deadline is said in plain words, with its length",
  t.s.endedWords === "This entry ran for 0 seconds without finishing, so it was stopped. The session ended, and its variables and methods are gone.", t.s.endedWords);
t = await started((r, w) => { w.emit(out(r, "1\n")); w.emit(ok(r)); }, { deadlineMs: 50, bootDeadlineMs: 50 });
r = await within(2000, t.s.submit("1"));
await sleep(150);
check("an entry and a boot that finished in time are never timed out later",
  r.status === "ready" && t.s.state === "ready" && t.s.endedBy === null, { r, states: t.log.states, endedBy: t.s.endedBy });

// ---- the output caps ----
t = await started((r, w) => { for (let i = 0; i < 5; i++) w.emit(out(r, "x".repeat(40) + "\n")); w.emit(ok(r)); }, { outputLimitChars: 100 });
r = await within(2000, t.s.submit("print"));
check("output past the character cap ends the session; what came before the cap was shown",
  r.status === "ended" && r.reason === "output-limit" && t.w().terminated && t.log.output.length === 2, { r, shown: t.log.output.length });
t = await started((r, w) => { for (let i = 0; i < 5; i++) w.emit(out(r, "a\n")); w.emit(ok(r)); }, { outputLimitLines: 3 });
r = await within(2000, t.s.submit("print"));
check("output past the line cap ends the session", r.status === "ended" && r.reason === "output-limit" && t.log.output.length === 3, { r, shown: t.log.output.length });
t = await started((r, w) => { w.emit(out(r, "x".repeat(59) + "\ny\n")); w.emit(ok(r)); }, { outputLimitChars: 100, outputLimitLines: 3 });
const firstEntry = await within(2000, t.s.submit("print"));
r = await within(2000, t.s.submit("print")).catch((e) => ({ status: "refused", message: e.message }));
check("the caps count each entry's output on its own: two entries of 62 characters and 2 lines each, under caps of 100 and 3, both finish",
  firstEntry.status === "ready" && r.status === "ready" && t.s.state === "ready", { firstEntry, r, endedBy: t.s.endedBy });
t = await started((r, w) => w.emit({ id: r.id, type: "error", message: "Output exceeded 1 MiB; session stopped." }));
r = await within(2000, t.s.submit("print"));
check("the worker's own 1 MiB cap is the same ending", r.status === "ended" && r.reason === "output-limit", r);
// Recorded from the real worker running the course's front end: its output meets the engine's own stop, in the engine's
// words (endless printing of a two-byte character reaches 1 MiB of UTF-8 before the client's character cap).
t = await started((r, w) => w.emit({ id: r.id, type: "error", message: "Output exceeded 1 MiB; execution stopped." }));
r = await within(2000, t.s.submit("print"));
check("so is the engine's own 1 MiB stop, in its own words", r.status === "ended" && r.reason === "output-limit" && t.s.endedWords.startsWith("This entry printed more"),
  { r, words: t.s.endedWords });

// ---- the engine's own endings ----
t = await started((r, w) => w.emit({ id: r.id, type: "error", message: "unreachable" }));
r = await within(2000, t.s.submit("x"));
check("an engine error ends the session as crashed, and its raw message goes nowhere",
  r.status === "ended" && r.reason === "crashed" && t.w().terminated && !JSON.stringify(r).includes("unreachable")
    && !t.s.endedWords.includes("unreachable") && t.log.output.length === 0, { r, words: t.s.endedWords });
// Recorded from the real worker: an ArrayList filled with long[1_000_000] until memory runs out.
t = await started((r, w) => {
  w.emit(out(r, "l ==> []\n"));
  for (const piece of ["memory allocation of ", "8000000", " bytes failed\n", "note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace\n"]) w.emit(out(r, piece, "stderr"));
  w.emit({ id: r.id, type: "error", message: "unreachable" });
});
r = await within(2000, t.s.submit("var l = new ArrayList<long[]>(); while (true) l.add(new long[1_000_000]);"));
check("a memory abort ends the session as out-of-memory", r.status === "ended" && r.reason === "out-of-memory", r);
check("the Rust runtime's lines are withheld; Java's own output is not", shown(t.log) === "l ==> []\n", t.log.output);
check("out-of-memory is said in plain words", t.s.endedWords.startsWith("This session ran out of memory"), t.s.endedWords);
// Recorded from the real worker: new int[Integer.MAX_VALUE].
t = await started((r, w) => {
  w.emit(out(r, "\nthread '<unnamed>' (1) panicked at /rustc/48a229ceaefd4985c50990b14116b6d856af0985/library/alloc/src/raw_vec/mod.rs:28:5:\ncapacity overflow\n", "stderr"));
  w.emit(out(r, "note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace\n", "stderr"));
  w.emit({ id: r.id, type: "error", message: "unreachable" });
});
r = await within(2000, t.s.submit("new int[Integer.MAX_VALUE]"));
check("an impossible allocation (a Rust panic, capacity overflow) is out-of-memory, and nothing of the panic is shown",
  r.reason === "out-of-memory" && t.log.output.length === 0, { r, output: t.log.output });
for (const message of ["Start offset -2070491856 is outside the bounds of the buffer", "byteOffset cannot be negative", "invalid or out-of-range index"]) {
  t = await started((r, w) => w.emit({ id: r.id, type: "error", message }));
  r = await within(2000, t.s.submit("n = n + 1"));
  check(`the end of a long session (about 150 entries; "${message}") is out-of-memory`, r.reason === "out-of-memory", r);
}
// Recorded from the real worker: any request after System.exit.
t = await started((r, w) => {
  w.emit(out(r, "\nthread '<unnamed>' (1) panicked at web/runner/src/lib.rs:487:40:\nCannot start a runtime from within a runtime.\n", "stderr"));
  w.emit(out(r, "note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace\n", "stderr"));
  w.emit({ id: r.id, type: "error", message: "unreachable" });
});
r = await within(2000, t.s.submit("1 + 1"));
check("a Rust panic that is not about memory is crashed, and is not shown", r.reason === "crashed" && t.log.output.length === 0, { r, output: t.log.output });
t = await started((r, w) => {
  w.emit(out(r, "|  Err", "stderr"));
  w.emit(out(r, "or:\n|  cannot find symbol\n", "stderr"));
  w.emit(out(r, "\n", "stderr"));
  w.emit(out(r, "between\n"));
  w.emit(out(r, "\n|  after a blank line\n", "stderr"));
  w.emit(out(r, "no newline", "stderr"));
  w.emit(ok(r));
});
r = await within(2000, t.s.submit("y + 1"));
check("Java's own stderr passes through whole, in arrival order, blank lines and a last line without a newline included",
  r.status === "ready" && JSON.stringify(t.log.output) === JSON.stringify([["stderr", "|  Error:\n"], ["stderr", "|  cannot find symbol\n"],
    ["stderr", "\n"], ["stdout", "between\n"], ["stderr", "\n"], ["stderr", "|  after a blank line\n"], ["stderr", "no newline"]]), t.log.output);
t = await started((r, w) => w.emit({ id: r.id, type: "done", exitCode: 0 }));
r = await within(2000, t.s.submit("System.exit(0)"));
check("System.exit(0) ends the session as exited", r.status === "ended" && r.reason === "exited" && t.w().terminated, r);
t = await started((r, w) => w.emit({ id: r.id, type: "error", message: "Java exited unsuccessfully (code 1)." }));
r = await within(2000, t.s.submit("System.exit(3)"));
check("System.exit with another status ends it as exited too", r.reason === "exited", r);
t = await started((r, w) => { w.emit(out(r, "|  Goodbye\n")); w.emit(ok(r, { closed: true, prompt: "" })); });
r = await within(2000, t.s.submit("/exit"));
check("/exit ends the session as exited, after jshell's goodbye", r.reason === "exited" && t.w().terminated && shown(t.log) === "|  Goodbye\n", { r, output: t.log.output });
t = await started((r, w) => w.emit({ id: r.id, type: "completions", anchor: 0, suggestions: [] }));
r = await within(2000, t.s.submit("Math.ab"));
check("completions, never asked for, end the request instead of leaving it waiting", r.status === "ended" && r.reason === "crashed", r);
let prevented = false;
t = await started((r, w) => w.onerror({ message: "Uncaught Error: boom", preventDefault() { prevented = true; } }));
r = await within(2000, t.s.submit("x"));
check("a worker that throws ends the session as crashed, and the error goes no further (the page's own error report)",
  r.status === "ended" && r.reason === "crashed" && prevented, { r, prevented });
t = await started((r, w) => w.onmessageerror?.({}));
r = await within(2000, t.s.submit("x"));
check("a message the worker could not pass ends the session as crashed", r.status === "ended" && r.reason === "crashed", r);

// ---- /reset and /reload ----
// The front end answers them in the same request, after Ristretto's worker has started a fresh VM (lib.rs): one
// request, one answer, no phase event. Here the restart answers after 200 ms, past the entry deadline of 50 ms: a
// restart has a boot's deadline (Firefox takes about a minute to start jshell; an entry's deadline is a minute).
const table = /static final String\[\] NAMES = \{([^}]*)\};/.exec(fs.readFileSync(path.join(REPO, "runtime/jshell/src/foundations/scratchpad/Commands.java"), "utf8"));
const names = table ? [...table[1].matchAll(/"([^"]*)"/g)].map((m) => m[1]) : null;
check("the client resolves commands against the front end's own command names (Commands.java's NAMES)",
  JSON.stringify(names) === JSON.stringify(COMMANDS), { names, COMMANDS });
const slow = (r, w) => {
  if (r.source.startsWith("/re")) { w.emit(out(r, "|  Resetting state.\n")); setTimeout(() => w.emit(ok(r)), 200); }
  else if (r.source === "if (true) {") w.emit(ok(r, { continuation: true, prompt: MORE }));
  else w.emit(ok(r));
};
t = await started(slow, { deadlineMs: 50 });
t.log.progress.length = 0;
let settled = false;
const reset = t.s.submit("/reset").then((x) => { settled = true; return x; });
await sleep(10);
check("/reset says at once that jshell is starting, and stays busy while the worker starts a fresh VM",
  !settled && t.s.state === "busy" && JSON.stringify(t.log.progress) === JSON.stringify(["jshell"]), { settled, state: t.s.state, progress: t.log.progress });
r = await within(2000, reset);
check("/reset is one request and one answer, though it outlasts the entry deadline: the client never restarts jshell itself",
  r.status === "ready" && r.prompt === PROMPT && !("reset" in r) && t.s.state === "ready" && t.s.endedBy === null
    && t.w().posts.length === 2 && t.log.workers.length === 1 && shown(t.log) === "|  Resetting state.\n",
  { r, endedBy: t.s.endedBy, posts: t.w().posts.length, output: t.log.output });
const restarts = ["/reset", "/res", "/reload", "/rel", "/reload -quiet", "/reset   ", "/reset foo"];
const others = ["/r", "/re", "/resets", "/rerun", "/list", "//reset", "/* /reset */ 1", " /reset", "reset()"];
t = await started((r, w) => w.emit(ok(r)));
const progressOf = async (line) => { t.log.progress.length = 0; await within(2000, t.s.submit(line)); return t.log.progress.join(" "); };
const said = [];
for (const line of restarts) said.push(await progressOf(line));
check("a line the front end reads as /reset or /reload (the name, a unique prefix, with options or spaces after) says jshell is starting",
  said.every((p) => p === "jshell"), Object.fromEntries(restarts.map((l, i) => [l, said[i]])));
said.length = 0;
for (const line of others) said.push(await progressOf(line));
check("an ambiguous prefix, another command, a comment, or Java does not",
  said.every((p) => p === ""), Object.fromEntries(others.map((l, i) => [l, said[i]])));
t = await started(slow, { deadlineMs: 50 });
await within(2000, t.s.submit("if (true) {"));
t.log.progress.length = 0;
r = await within(2000, t.s.submit("/reset"));
check("at a continuation, /reset is part of what is being typed, not a restart: an entry's deadline, and no word of starting jshell",
  r.status === "ended" && r.reason === "timeout" && t.log.progress.length === 0, { r, progress: t.log.progress });
// Its deadline here is 1.5 s, said as 2 seconds (the boot's below, 50 ms, as 0): the words carry the real length.
t = await started((r, w) => { if (r.source === "/reload") w.emit(out(r, "|  Restarting and restoring state.\n")); }, { bootDeadlineMs: 1500 });
r = await within(4000, t.s.submit("/reload"));
check("a restart that never answers fails to load at its deadline, saying so, its worker terminated",
  r.status === "ended" && r.reason === "failed-to-load" && t.w().terminated
    && t.s.endedWords === "The scratchpad could not start: after /reload, jshell did not answer within 2 seconds.", { r, words: t.s.endedWords });
// A /reload replays what the session ran, so on top of the boot deadline (50 ms here) it gets twice the time the
// session's entries took; a restart answers here after 350 ms, an entry after 100 ms. After two entries (about 200 ms)
// a /reload's deadline is about 450 ms, and the answer is in time; with the entries' time counted once (about 250 ms)
// it would not be. With nothing run, or for a /reset, the deadline is the boot's 50 ms.
const timed = (r, w) => setTimeout(() => w.emit(ok(r)), r.source.startsWith("/re") ? 350 : 100);
const asked = (t, line) => within(2000, t.s.submit(line)).catch((e) => ({ status: "refused", message: e.message }));
t = await started(timed, { bootDeadlineMs: 50 });
r = await asked(t, "/reload");
check("a /reload with nothing run before it has only the boot deadline", r.status === "ended" && r.reason === "failed-to-load", r);
t = await started(timed, { bootDeadlineMs: 50 });
await asked(t, "int a = 1");
await asked(t, "int b = 2");
r = await asked(t, "/reload");
check("a /reload after entries that took 200 ms gets twice that for its replay, on top of the boot deadline", r.status === "ready", r);
r = await asked(t, "/reset");
check("a /reset replays nothing, so it has only the boot deadline, however long the session's entries took",
  r.status === "ended" && r.reason === "failed-to-load", r);

// ---- a download that fails ----
const failing = async (change, label, words) => {
  const f = session(bootThen(() => {}), {}, fakeSite(change));
  let e = null;
  try { await within(2000, f.s.start()); } catch (x) { e = x; }
  check(label, e?.reason === "failed-to-load" && f.s.endedBy === "failed-to-load" && f.log.workers.length === 0 && f.s.endedWords === words,
    { reason: e?.reason, words: f.s.endedWords, workers: f.log.workers.length });
};
await failing({ "runner.core.wasm": new Error("HTTP 404") }, "a file that cannot be downloaded fails to load, naming it, and no worker starts",
  "The scratchpad could not start: runner.core.wasm could not be downloaded (HTTP 404).");
const flipped = FILES["jdk.zip"].slice(); flipped[3] ^= 1;
await failing({ "jdk.zip": flipped }, "a file with one byte changed fails its hash", "The scratchpad could not start: jdk.zip did not download whole.");
await failing({ "jdk.zip": FILES["jdk.zip"].slice(0, -1) }, "a file cut short fails", "The scratchpad could not start: jdk.zip did not download whole.");
const flippedJar = FILES["browser-jshell.jar"].slice(); flippedJar[3] ^= 1;
await failing({ "browser-jshell.jar": flippedJar }, "the front end's jar is checked like the rest: one byte changed, and nothing starts",
  "The scratchpad could not start: browser-jshell.jar did not download whole.");
await failing({ "manifest.json": text('{"files":{}}') }, "a manifest that does not list a file fails", "The scratchpad could not start: manifest.json does not list jdk.zip.");
const { "browser-jshell.jar": _jar, ...noJar } = FILES;
await failing({ "manifest.json": await manifestOf(noJar) }, "a manifest that does not list the front end's jar fails",
  "The scratchpad could not start: manifest.json does not list browser-jshell.jar.");
await failing({ "manifest.json": await manifestOf(FILES, null) }, "a manifest that does not give its version, which names the worker, fails",
  "The scratchpad could not start: manifest.json does not give its version.");
const bareZip = storedZip([["lib/modules", text("the JDK's classes")]]);
await failing({ "jdk.zip": bareZip, "manifest.json": await manifestOf({ ...FILES, "jdk.zip": bareZip }) },
  "a jdk.zip with no front end to replace fails to load, and no worker starts",
  "The scratchpad could not start: the archive has no browser-jshell.jar to replace.");
t = session(() => {}, { bootDeadlineMs: 50 });
let e = null;
try { await within(2000, t.s.start()); } catch (x) { e = x; }
check("a boot that never answers fails to load at the boot deadline, its worker terminated",
  e?.reason === "failed-to-load" && t.w().terminated && t.s.endedWords === "The scratchpad could not start: jshell did not answer within 0 seconds.", { reason: e?.reason, words: t.s.endedWords });
t = session((r, w) => w.emit({ id: r.id, type: "error", message: "CompileError: bad magic" }));
e = null;
try { await within(2000, t.s.start()); } catch (x) { e = x; }
check("an engine error while starting fails to load, not crashed", e?.reason === "failed-to-load" && t.w().terminated, { reason: e?.reason });
t = session(bootThen(() => {}), { createWorker: () => { throw new Error("SecurityError: workers are blocked"); } });
e = null;
try { await within(2000, t.s.start()); } catch (x) { e = x; }
check("a browser that will not start the worker fails to load, and says so",
  e?.reason === "failed-to-load" && t.s.state === "ended"
    && t.s.endedWords === "The scratchpad could not start: the browser did not start its worker (SecurityError: workers are blocked).",
  { reason: e?.reason, message: e?.message, state: t.s.state, words: t.s.endedWords });
let release;
t = session(bootThen(() => {}), {}, fakeSite({ "jdk.zip": new Promise((r) => { release = r; }) }));
const loading = within(2000, t.s.start()).catch((x) => x);
await sleep(10);
t.s.stop();
e = await loading;
release(FILES["jdk.zip"]);
await sleep(20);
check("Stop during the download ends it: start rejects as stopped, and the download finishing later starts no worker",
  e?.reason === "stopped" && t.s.state === "ended" && t.log.workers.length === 0, { reason: e?.reason, state: t.s.state, workers: t.log.workers.length });

// ---- a new session, and the cache ----
t = await started((r, w) => w.emit({ id: r.id, type: "error", message: "unreachable" }));
await within(2000, t.s.submit("x"));
const fetchedBefore = t.site.fetched.length;
t.log.progress.length = 0;
r = await within(2000, t.s.start());
check("after an ending, start begins a new session in a new worker, without downloading again",
  r?.banner === BANNER && t.log.workers.length === 2 && t.site.fetched.length === fetchedBefore && t.s.state === "ready" && t.s.endedBy === null, { r, workers: t.log.workers.length });
check("and says it is starting Java and jshell, never that it is downloading", JSON.stringify(t.log.progress) === JSON.stringify(["engine", "jshell"]), t.log.progress);
// A fake of Cache Storage: named caches of entries keyed by URL; deleted lists the entries a cache deleted.
function fakeCaches(seed = {}) {
  const stores = new Map(Object.entries(seed).map(([n, entries]) => [n, new Map(entries)]));
  const deleted = [];
  const key = (u) => (typeof u === "string" ? u : u.url);
  return { stores, deleted,
    async keys() { return [...stores.keys()]; },
    async delete(n) { return stores.delete(n); },
    async open(n) {
      if (!stores.has(n)) stores.set(n, new Map());
      const m = stores.get(n);
      return { async keys() { return [...m.keys()].map((url) => ({ url })); },
        async match(u) { return m.has(key(u)) ? new Response(m.get(key(u))) : undefined; },
        async put(u, resp) { m.set(key(u), new Uint8Array(await resp.arrayBuffer())); },
        async delete(u) { deleted.push(key(u)); return m.delete(key(u)); } };
    } };
}
const keyOf = async (name, bytes) => `${BASE}${name}?sha256=${await sha(bytes)}`;
const KEYS = await Promise.all(ASSETS.map((n) => keyOf(n, FILES[n])));
const stale = BASE + "browser-jshell.jar?sha256=" + "0".repeat(64);
const caches = fakeCaches({ "jf-scratchpad": [[stale, text("an older front end")]], "someone-else": [["https://other.test/x", text("theirs")]] });
const stored = () => [...caches.stores.get("jf-scratchpad").keys()].sort();
t = session(bootThen(() => {}), { caches });
await within(2000, t.s.start());
check("each verified file is kept in Cache Storage under its own hash; an entry the manifest no longer lists is deleted, another site's cache is not",
  JSON.stringify(stored()) === JSON.stringify([...KEYS].sort()) && JSON.stringify(caches.deleted) === JSON.stringify([stale])
    && caches.stores.get("someone-else").size === 1, { stored: stored(), deleted: caches.deleted });
const offline = Object.fromEntries(ASSETS.map((n) => [n, new Error("offline")]));
t = session(bootThen(() => {}), { caches }, fakeSite(offline));
r = await within(2000, t.s.start()).catch((x) => x);
check("a new page starts from the cache without downloading the files, and composes them as before",
  r?.banner === BANNER && t.site.fetched.length === 1 && (await sha(t.w().posts[0].assets[0][1])) === (await sha(COMPOSED)), { r, fetched: t.site.fetched });
caches.stores.get("jf-scratchpad").set(KEYS[0], flipped);
t = session(bootThen(() => {}), { caches });
r = await within(2000, t.s.start()).catch((x) => x);
check("a cached file that fails its hash is downloaded again and replaced",
  r?.banner === BANNER && JSON.stringify(t.site.fetched) === JSON.stringify([BASE + "manifest.json", BASE + "jdk.zip"])
    && (await sha(caches.stores.get("jf-scratchpad").get(KEYS[0]))) === (await sha(FILES["jdk.zip"])), t.site.fetched);
const fixedJar = text("the bytes of a fixed front end");
caches.deleted.length = 0;
t = session(bootThen(() => {}), { caches }, fakeSite({ "browser-jshell.jar": fixedJar,
  "manifest.json": await manifestOf({ ...FILES, "browser-jshell.jar": fixedJar }, "test2") }));
r = await within(2000, t.s.start()).catch((x) => x);
check("a new front end downloads only its jar: the zip and the wasm files come from the cache, the old jar's entry is deleted, and the new version names the worker",
  r?.banner === BANNER && JSON.stringify(t.site.fetched) === JSON.stringify([BASE + "manifest.json", BASE + "browser-jshell.jar"])
    && JSON.stringify(caches.deleted) === JSON.stringify([KEYS[4]]) && stored().includes(await keyOf("browser-jshell.jar", fixedJar))
    && (await sha(t.w().posts[0].assets[0][1])) === (await sha(withFrontEnd(FILES["jdk.zip"], fixedJar))) && t.w().url === BASE + "worker.js?v=test2",
  { fetched: t.site.fetched, deleted: caches.deleted, stored: stored(), worker: t.w().url });
t = session(bootThen(() => {}), { caches: { open: async () => { throw new Error("SecurityError"); } } });
r = await within(2000, t.s.start()).catch((x) => x);
check("storage that refuses (a private window) only means downloading", r?.banner === BANNER && t.site.fetched.length === 6, { r, fetched: t.site.fetched.length });
t = session(bootThen(() => {}), { caches: { open: async () => ({ keys: async () => [], match: async () => undefined,
  delete: async () => false, put: async () => { throw new Error("QuotaExceededError"); } }) } });
r = await within(2000, t.s.start()).catch((x) => x);
check("storage that is full (it refuses to keep a file) only means downloading again next time",
  r?.banner === BANNER && t.site.fetched.length === 6, { r, fetched: t.site.fetched.length });

// ---- the real pinned worker, running the course's front end, in a worker thread ----
const dir = scratchpadDir(process.argv.slice(2), USAGE, "jshell-session-site");
const real = (opts = {}) => {
  const log = { output: "", streams: new Set(), workers: [], progress: [] };
  const s = new JShellSession(dirUrl(dir), { createWorker: (url) => { const w = nodeWorker(url); log.workers.push(w); return w; },
    fetchBytes: nodeFetchBytes, caches: null, onOutput: (text, stream) => { log.output += text; log.streams.add(stream); },
    onProgress: (phase) => log.progress.push(phase), ...opts });
  return { s, log, take: () => { const o = log.output; log.output = ""; log.streams.clear(); log.progress.length = 0; return o; } };
};
// Whether a worker's thread has really stopped (its exit event), within 5 s: terminate() was called and worked.
const exited = async (w) => (await within(5000, w.exited.then(() => "exited"))) === "exited";
let a = real();
let t0 = Date.now();
r = await within(300_000, a.s.start()).catch((x) => x);
console.log(`  (real worker: ready in ${Date.now() - t0} ms)`);
check("real: the pinned worker starts the course's front end: the pinned JDK's banner, then jshell's prompt",
  r?.banner === BANNER && r?.prompt === PROMPT, r);
r = await within(60_000, a.s.submit("2 + 3"));
let o = a.take();
check("real: 2 + 3", r.status === "ready" && r.prompt === PROMPT && o === "$1 ==> 5\n", { r, o });
r = await within(60_000, a.s.submit("int twice(int n) {"));
let r2 = await within(60_000, a.s.submit("    return n * 2;"));
let r3 = await within(60_000, a.s.submit("}"));
o = a.take();
check("real: a method typed over three lines continues at the continuation prompt, then is created",
  r.continuation === true && r.prompt === MORE && r2.continuation === true && r3.continuation === false && r3.prompt === PROMPT
    && o === "|  created method twice(int)\n", { r, r2, r3, o });
r = await within(60_000, a.s.submit("if (true) {"));
r2 = await within(60_000, a.s.cancel());
check("real: cancel drops an open snippet", r.continuation === true && r2.status === "ready" && r2.continuation === false && r2.prompt === PROMPT, { r, r2 });
r = await within(60_000, a.s.submit("/exit (1 +"));
r2 = await within(60_000, a.s.cancel());
r3 = await within(60_000, a.s.submit("2 + 3"));
o = a.take();
check("real: cancel at an unfinished /exit forgets the /exit too, so the next entry runs and the session goes on",
  r.continuation === true && r2.continuation === false && r3.status === "ready" && a.s.state === "ready" && /^\$\d+ ==> 5\n$/.test(o), { r, r2, r3, o });
r = await within(60_000, a.s.submit("y + 1"));
const errorStreams = [...a.log.streams];
o = a.take();
check("real: an error arrives whole, on stdout, where the real jshell's console shows it",
  r.status === "ready" && o.startsWith("|  Error:\n|  cannot find symbol\n") && JSON.stringify(errorStreams) === JSON.stringify(["stdout"]),
  { o, streams: errorStreams });
await within(60_000, a.s.submit("int k = 1"));
await within(60_000, a.s.submit("/set feedback concise"));
a.take();
t0 = Date.now();
r = await within(300_000, a.s.submit("/reset"));
const resetMs = Date.now() - t0;
const resetProgress = [...a.log.progress];
const resetOut = a.take();
r2 = await within(60_000, a.s.submit("k"));
o = a.take();
check(`real: /reset starts a fresh VM in its own request (${resetMs} ms): it says jshell is starting, prints no banner, ` +
  "keeps the feedback mode (concise's prompt), and the variable is gone",
  r.status === "ready" && r.prompt === "jshell> " && JSON.stringify(resetProgress) === JSON.stringify(["jshell"]) && resetOut === ""
    && r2.status === "ready" && o.startsWith("|  Error:\n|  cannot find symbol\n"), { r, resetProgress, resetOut, r2, o });
await within(60_000, a.s.submit("/set feedback normal"));
await within(60_000, a.s.submit("int m = 2"));
a.take();
t0 = Date.now();
r = await within(300_000, a.s.submit("/reload"));
const reloadMs = Date.now() - t0;
const reloadProgress = [...a.log.progress];
const reloadOut = a.take();
r2 = await within(60_000, a.s.submit("m"));
o = a.take();
check(`real: /reload starts a fresh VM and replays the session on it (${reloadMs} ms), saying jshell is starting`,
  r.status === "ready" && r.prompt === PROMPT && JSON.stringify(reloadProgress) === JSON.stringify(["jshell"])
    && reloadOut === "|  Restarting and restoring state.\n-: int m = 2;\n" && r2.status === "ready" && o === "m ==> 2\n",
  { r, reloadProgress, reloadOut, r2, o });
r = await within(60_000, a.s.submit("/exit"));
o = a.take();
check("real: /exit ends the session as exited", r.status === "ended" && r.reason === "exited" && o === "|  Goodbye\n", { r, o });

a = real();
await within(300_000, a.s.start());
t0 = Date.now();
r = await within(120_000, a.s.submit("var l = new ArrayList<long[]>(); while (true) l.add(new long[1_000_000]);"));
check(`real: memory used up ends the session as out-of-memory (${Date.now() - t0} ms), and no Rust text reaches the output`,
  r.status === "ended" && r.reason === "out-of-memory" && !/memory allocation|RUST_BACKTRACE|panicked/.test(a.log.output), { r, out: a.log.output });
// The engine's other ways of giving out, each met in the real engine's own words, never a copy of them: an impossible
// allocation (a Rust panic); Ristretto's own 1 MiB stop, in the engine's words (a two-byte character reaches 1 MiB of
// UTF-8 at 524 lines, before the client's caps); and memory past 2 GiB, which is how a long session ends (the worker's
// glue then fails with the JavaScript engine's RangeError, V8's here; one entry holding 2 GB gets there at once).
// web/test/scratchpad.mjs meets the last two in each browser, whose RangeErrors differ.
a.take();
await within(300_000, a.s.start());
r = await within(60_000, a.s.submit("new int[Integer.MAX_VALUE]"));
check("real: an impossible allocation (a Rust panic, capacity overflow) ends the session as out-of-memory, and nothing of the panic is shown",
  r.status === "ended" && r.reason === "out-of-memory" && a.take() === "", { r, out: a.log.output });
await within(300_000, a.s.start());
r = await within(120_000, a.s.submit('while (true) System.out.println("é".repeat(1000))'));
o = a.take();
const wide = o.split("é".repeat(1000) + "\n").length - 1;
check(`real: endless printing of a two-byte character meets Ristretto's own 1 MiB stop, in the engine's words (${wide} lines): output-limit`,
  r.status === "ended" && r.reason === "output-limit" && wide > 400 && wide < 600, { r, wide, words: a.s.endedWords });
await within(300_000, a.s.start());
r = await within(120_000, a.s.submit("long[][] big = new long[260][]; for (int i = 0; i < 260; i++) big[i] = new long[1_000_000];"));
r2 = r.status === "ready" ? await within(60_000, a.s.submit("1 + 1")) : null;
o = a.take();
check("real: memory past 2 GiB (2 GB held by one entry: how a long session ends) ends the session at the next entry as out-of-memory, with nothing of the engine's shown",
  r.status === "ready" && /^big ==> long\[260\]\[\] \{[^\n]*\}\n$/.test(o) && r2?.status === "ended" && r2.reason === "out-of-memory", { r, r2, o });

a = real({ deadlineMs: 3000 });
await within(300_000, a.s.start());
t0 = Date.now();
r = await within(30_000, a.s.submit("while (true) {}"));
const stopMs = Date.now() - t0;
check(`real: an endless loop is stopped at the deadline (${stopMs} ms), and its worker thread exits`,
  r.status === "ended" && r.reason === "timeout" && stopMs < 6000 && await exited(a.log.workers[0]), { r, stopMs });
check("real: the deadline is said with its length (3 seconds here; 0 for the fake's 50 ms)",
  a.s.endedWords === "This entry ran for 3 seconds without finishing, so it was stopped. The session ended, and its variables and methods are gone.",
  a.s.endedWords);
a.s.deadlineMs = 60_000; // a fresh session's first entry compiles cold: under load it can take more than 3 s
r = await within(300_000, a.s.start()).catch((x) => x);
r2 = r?.banner ? await within(60_000, a.s.submit("1 + 1")) : null;
check("real: a new session starts after the ending and numbers from $1 again", r?.banner === BANNER && r2?.status === "ready" && a.take() === "$1 ==> 2\n", { r, r2, out: a.log.output });
const spin = within(30_000, a.s.submit("while (true) {}"));
await sleep(500);
t0 = Date.now();
a.s.stop();
r = await spin;
const gone = await exited(a.log.workers[1]);
check(`real: Stop ends a running entry, and its worker thread exits (${Date.now() - t0} ms)`,
  r.status === "ended" && r.reason === "stopped" && gone, { r, gone });
done();
```
Run: `node web/test/jshell-session.mjs`
Expected: exit 1, `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '…/web/page/jshell-session.mjs' imported from
…/web/test/jshell-session.mjs`.

- [ ] **Step 4: Write `web/page/jshell-session.mjs`**

```js
/*
 *  Copyright 2026 Java Foundations contributors.
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
// One jshell session in the scratchpad: Ristretto's unmodified worker (D48) running the course's own jshell front end
// (runtime/jshell/, D55, D56, D62), spoken to in Ristretto's own protocol, one line per request. It downloads the five
// files in ASSETS, checks each against site/scratchpad/manifest.json's size and SHA-256, and keeps each in Cache Storage
// under its own hash, so a new front end costs a reader its small jar, never the 22 MB zip again. The manifest itself is
// asked of the site every time, never taken from the browser's HTTP cache, and worker.js is started under the manifest's
// version (worker.js?v=<version>): GitHub Pages lets a browser keep any file for ten minutes, and a kept manifest or
// worker would meet a re-pin's new files. Once both are verified, the front end's jar goes into Ristretto's pinned
// jdk.zip (compose.mjs, in memory: every published byte stays as pinned), and the worker is handed the result as its
// jdk.zip. The client owns the stop policy (D49): Stop, a per-entry deadline and output caps. The engine runs each
// entry in one synchronous call that nothing can interrupt, so every stop terminates the worker and ends the session.
// Every ending is named (endedBy) and said in plain words (endedWords). Each answer carries the prompt the front end
// gives next. /reset and /reload start a fresh VM inside that one request (Ristretto's lib.rs), so such a line gets a
// boot's deadline and says it is starting jshell; the client never restarts jshell itself. No DOM:
// web/page/scratchpad.mjs draws the panel, and runtime/jshell/test/check.mjs drives this same class, under Node and in a
// browser, against the real jshell.
import { withFrontEnd } from "./compose.mjs";

export const ASSETS = ["jdk.zip", "runner.core.wasm", "runner.core2.wasm", "runner.core3.wasm", "browser-jshell.jar"];
const FRONT_END = "browser-jshell.jar"; // composed into jdk.zip; the worker is handed the other four
// The front end's command names, as it lists them (runtime/jshell/src/foundations/scratchpad/Commands.java, NAMES), so
// a line's command resolves here as it does there: the exact name, else the one name the word begins.
// web/test/jshell-session.mjs keeps this list equal to the front end's own.
export const COMMANDS = ["/list", "/edit", "/drop", "/save", "/open", "/vars", "/methods", "/types", "/imports",
  "/exit", "/env", "/reset", "/reload", "/history", "/debug", "/help", "/set", "/?", "/!"];
const RESTARTS = ["/reset", "/reload"];
const CACHE = "jf-scratchpad";
const TERMINAL = new Set(["ready", "completions", "error", "done"]);
// A /reload replays the session's entries on the fresh VM, each at about the cost it had when typed. Measured: the
// replay of 50 entries took 0.88 times their first run under Node, 1.03 in Chromium, 1.00 in WebKit and 1.09 in Firefox,
// after a fresh VM's boot of 9 to 15 s (Firefox's first boot takes about a minute; a restart's, 15 s); its total grows
// faster than the count, since later entries cost more (100 entries: 106 s under Node). So a /reload gets the boot
// deadline plus twice what the session's entries have taken so far.
const REPLAY_FACTOR = 2;

// What the engine's Rust runtime writes to stderr just before the worker reports an error. It means nothing to a
// reader, so it is never shown; the ending's plain words take its place. Recorded under Node (web/test/jshell-session.mjs's
// real round trip) and, by the research, in Chromium, WebKit and Firefox: the text is the WebAssembly's own, the same
// in every engine. A panic is a blank line, the "panicked at" line, its message, then the note.
const RUST_ABORT = /^memory allocation of \d+ bytes failed$/;
const RUST_PANIC = /^thread '.*' \(\d+\) panicked at .+:\d+:\d+:$/;
const RUST_NOTE = /^note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace$/;
// Running out of memory, three ways. The Rust allocator aborts (RUST_ABORT) when the engine cannot grow; a Rust panic
// says "capacity overflow" for an impossible allocation (new int[Integer.MAX_VALUE]); and the worker's glue fails once
// the engine's memory passes 2 GiB, which ends a session after about 150 entries, sooner when it declares many classes
// (54 in the front end's class-heavy session), since the engine never gives memory back. That last one reaches the
// client as an error event whose message is the JavaScript engine's own RangeError text.
const OUT_OF_MEMORY_PANICS = [/^capacity overflow$/];
const OUT_OF_MEMORY_ERRORS = [
  /Start offset -\d+ is outside the bounds of the buffer/, // V8: Node, Chromium
  /byteOffset cannot be negative/, // WebKit
  /invalid or out-of-range index/, // Firefox
];
const EXITED = /^Java exited unsuccessfully \(code \d+\)\.$/; // System.exit with a nonzero status (the code is always 1)
// Ristretto's own output stop, at 1 MiB of UTF-8 (the client counts characters, so text of wider characters meets it
// first): the worker's words, or the engine's, which is what the course's front end's output meets (recorded under Node).
const ENGINE_OUTPUT_CAP = /^Output exceeded 1 MiB; (session|execution) stopped\.$/;

const GONE = "The session ended, and its variables and methods are gone.";
function words(endedBy, detail) {
  switch (endedBy) {
    case "stopped": return `Stopped. ${GONE}`;
    case "timeout": return `This entry ran for ${Math.round(detail / 1000)} seconds without finishing, so it was stopped. ${GONE}`;
    case "output-limit": return `This entry printed more than the scratchpad can show, so it was stopped. ${GONE}`;
    case "out-of-memory": return "This session ran out of memory, so it ended, and its variables and methods are gone. A session " +
      "keeps everything it makes until it ends, so a program that keeps making things, or a long session (about 150 " +
      "entries, fewer when it declares many classes), fills it up.";
    case "exited": return "This session has ended (System.exit or /exit).";
    case "failed-to-load": return `The scratchpad could not start: ${detail}.`;
    default: return `The scratchpad's Java engine failed. ${GONE}`;
  }
}

// The command a line restarts jshell with (/reset or /reload), resolved as the front end resolves it (Commands.java:
// a line that starts with "/" is a command, named by its first word, up to a space); else null. A line typed at a
// continuation is never a command. A /reset the front end refuses (an unknown option) is still treated as a restart
// here: it only gets a longer deadline than it needs.
function restartOf(line) {
  const text = line.trimEnd();
  if (!text.startsWith("/")) return null;
  const word = text.split(" ", 1)[0];
  const names = COMMANDS.includes(word) ? [word] : COMMANDS.filter((n) => n.startsWith(word));
  return names.length === 1 && RESTARTS.includes(names[0]) ? names[0] : null;
}

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const sha256 = async (bytes) => hex(await crypto.subtle.digest("SHA-256", bytes));
const matches = async (bytes, want) => bytes.length === want.size && (await sha256(bytes)) === want.sha256;
async function fetchBytesDefault(url, init) {
  const r = await fetch(url, init);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return new Uint8Array(await r.arrayBuffer());
}

export class JShellSession {
  // base: the URL of site/scratchpad/ (it holds worker.js, manifest.json and ASSETS). createWorker, fetchBytes and
  // caches are the browser's own unless a caller (a Node test) passes its own; fetchBytes(url, init) takes fetch's init
  // (the manifest's is { cache: "no-cache" }), and one reading files from disk may ignore it.
  constructor(base, { deadlineMs = 60_000, bootDeadlineMs = 240_000, outputLimitChars = 1_000_000,
      outputLimitLines = 100_000, onOutput = () => {}, onState = () => {}, onProgress = () => {},
      createWorker = (url) => new Worker(url, { type: "module" }), fetchBytes = fetchBytesDefault,
      caches = globalThis.caches } = {}) {
    this.base = new URL(base);
    Object.assign(this, { deadlineMs, bootDeadlineMs, outputLimitChars, outputLimitLines, onOutput, onState,
      onProgress, createWorker, fetchBytes, caches });
    this.state = "idle"; // idle | loading | ready | busy | ended
    this.endedBy = null; // stopped | timeout | output-limit | out-of-memory | crashed | exited | failed-to-load
    this.endedWords = null;
    this.banner = null;
    this.assets = null; // the files the worker takes, verified and composed, kept so a new session downloads nothing
    this.version = null; // the manifest's version, which names worker.js
    this.worker = null;
    this.pending = null; // the one request in flight
    this.nextId = 1;
    this.generation = 0; // bumped by every start and every ending: work for an earlier session then does nothing
    this.interrupt = null; // settles a start that is still downloading
    this.continuation = false; // the front end waits for more of a snippet (or of an /exit's argument)
    this.ran = 0; // ms the session's entries have taken since start(), restarts aside: what a /reload replays
  }
  set(state) { this.state = state; this.onState(state); }
  endError() { return Object.assign(new Error(this.endedWords), { reason: this.endedBy }); }

  // Resolves { banner, prompt } when jshell is ready for its first entry. Rejects (an Error whose reason is endedBy)
  // when the session ends first: a download or check fails, the browser will not start the worker, the engine fails or
  // does not answer in bootDeadlineMs, or stop().
  async start() {
    if (this.state !== "idle" && this.state !== "ended") throw new Error(`start() while ${this.state}`);
    const generation = ++this.generation;
    this.endedBy = this.endedWords = null;
    this.continuation = false;
    this.ran = 0;
    this.set("loading");
    if (!this.assets) this.onProgress("download"); // a new session from the files already verified downloads nothing
    // Stop during the download settles start at once; the download, left to finish, is then thrown away.
    const stopped = new Promise((resolve) => { this.interrupt = resolve; });
    let loaded;
    try {
      const load = this.assets ? Promise.resolve({ version: this.version, assets: this.assets }) : this.loadAssets();
      load.catch(() => {});
      loaded = await Promise.race([load, stopped]);
    } catch (e) {
      if (generation === this.generation) this.end("failed-to-load", e.message);
      throw this.endError();
    }
    if (generation !== this.generation) throw this.endError(); // stopped during the download
    this.assets = loaded.assets;
    this.version = loaded.version;
    try { this.worker = this.createWorker(new URL(`worker.js?v=${encodeURIComponent(this.version)}`, this.base).href); }
    catch (e) { this.end("failed-to-load", `the browser did not start its worker (${e.message})`); throw this.endError(); }
    const r = await this.request("", { boot: true, assets: this.assets, deadlineMs: this.bootDeadlineMs });
    if (r.status !== "ready") throw this.endError();
    this.banner = r.output;
    this.set("ready");
    return { banner: r.output, prompt: r.prompt };
  }

  // One line, as the reader pressed Enter. Resolves { status: "ready", continuation, prompt } (continuation: jshell
  // waits for more of the snippet; prompt: the front end's next prompt, null if it gave none) or { status: "ended",
  // reason }.
  async submit(line) {
    if (this.state !== "ready") throw new Error(`submit() while ${this.state}`);
    if (/[\r\n]/.test(line)) throw new Error("submit() takes one line");
    this.set("busy");
    const restart = this.continuation ? null : restartOf(line);
    if (!restart) return this.request(line, { deadlineMs: this.deadlineMs });
    // A fresh VM boots inside this request, and a /reload then replays the session on it: a boot's deadline (and the
    // replay's), and the words for a boot, though Ristretto's worker sends no phase event for it.
    this.onProgress("jshell");
    const replay = restart === "/reload" ? REPLAY_FACTOR * this.ran : 0;
    return this.request(line, { restart, deadlineMs: this.bootDeadlineMs + replay });
  }
  // Forgets a half-typed snippet, an /exit's argument included (jshell's Ctrl-C).
  async cancel() {
    if (this.state !== "ready") throw new Error(`cancel() while ${this.state}`);
    this.set("busy");
    return this.request("", { operation: "cancel", deadlineMs: this.deadlineMs });
  }
  stop() { this.end("stopped"); }

  // The manifest, asked of the site past the HTTP cache; the five files, each from the cache or downloaded and checked;
  // then the manifest's version and the worker's four files, with the front end composed into jdk.zip.
  async loadAssets() {
    let manifestBytes, files, version;
    try { manifestBytes = await this.fetchBytes(new URL("manifest.json", this.base).href, { cache: "no-cache" }); }
    catch (e) { throw new Error(`manifest.json could not be downloaded (${e.message})`); }
    try { ({ files, version } = JSON.parse(new TextDecoder().decode(manifestBytes))); }
    catch { throw new Error("manifest.json is not JSON"); }
    const want = ASSETS.map((name) => {
      const f = files?.[name];
      if (typeof f?.sha256 !== "string" || !Number.isInteger(f?.size)) throw new Error(`manifest.json does not list ${name}`);
      return f;
    });
    if (typeof version !== "string" || !version) throw new Error("manifest.json does not give its version");
    const keys = ASSETS.map((name, i) => new URL(`${name}?sha256=${want[i].sha256}`, this.base).href);
    const cache = await this.openCache(new Set(keys));
    const verified = await Promise.all(ASSETS.map(async (name, i) => {
      let bytes = await this.fromCache(cache, keys[i], want[i]);
      if (!bytes) {
        try { bytes = await this.fetchBytes(new URL(name, this.base).href); }
        catch (e) { throw new Error(`${name} could not be downloaded (${e.message})`); }
        if (!(await matches(bytes, want[i]))) throw new Error(`${name} did not download whole`);
        try { await cache?.put(keys[i], new Response(bytes)); } catch { /* storage refused: the next open downloads again */ }
      }
      return [name, bytes];
    }));
    const jar = verified.find(([name]) => name === FRONT_END)[1];
    return { version, assets: verified.filter(([name]) => name !== FRONT_END)
      .map(([name, bytes]) => [name, name === "jdk.zip" ? withFrontEnd(bytes, jar) : bytes]) };
  }
  // One cache holds the scratchpad's files, each under its own hash (keys), so a new pin never reads an old file and one
  // changed file leaves the others cached; an entry the manifest no longer lists is deleted. Storage can be refused (a
  // private window, blocked site data); then every open downloads.
  async openCache(keys) {
    if (!this.caches) return null;
    try {
      const cache = await this.caches.open(CACHE);
      for (const request of await cache.keys()) if (!keys.has(request.url)) await cache.delete(request);
      return cache;
    } catch { return null; }
  }
  // A cached file is checked like a downloaded one; one that fails is deleted and downloaded again.
  async fromCache(cache, key, want) {
    if (!cache) return null;
    try {
      const r = await cache.match(key);
      if (!r) return null;
      const bytes = new Uint8Array(await r.arrayBuffer());
      if (await matches(bytes, want)) return bytes;
      await cache.delete(key);
    } catch { /* unreadable: download instead */ }
    return null;
  }

  // Exactly one request is in flight at a time: Ristretto's worker drops a message that arrives while it is busy.
  request(source, { operation = "input", boot = false, restart = null, assets = null, deadlineMs }) {
    const id = this.nextId++;
    return new Promise((resolve) => {
      const p = { id, boot, restart, sent: Date.now(), resolve, output: "", chars: 0, lines: 0, held: "", blank: false, panic: false, memory: false };
      p.timer = setTimeout(() => {
        const within = `jshell did not answer within ${Math.round(deadlineMs / 1000)} seconds`;
        if (boot) return this.end("failed-to-load", within);
        // A restart that does not answer is a failed load too: the fresh VM never came up, or its replay never ended.
        if (restart) return this.end("failed-to-load", `after ${restart}, ${within}`);
        this.end("timeout", deadlineMs);
      }, deadlineMs);
      this.pending = p;
      // A stopped worker's late error is ignored, as receive ignores its late messages.
      const worker = this.worker;
      worker.onmessage = (e) => this.receive(p, e.data);
      worker.onerror = (e) => { e?.preventDefault?.(); if (this.worker === worker) this.fault(p, String(e?.message ?? "")); };
      worker.onmessageerror = () => { if (this.worker === worker) this.fault(p, ""); };
      const request = { id, javaVersion: 25, action: "jshell", className: "BrowserJShell", source, operation, cursor: 0 };
      worker.postMessage(assets ? { request, assets } : { request });
    });
  }
  receive(p, m) {
    if (this.pending !== p || m?.id !== p.id) return; // late: an earlier request's, or a stopped worker's
    if (m.type === "phase") { if (p.boot) this.onProgress(m.phase === "loading" ? "engine" : "jshell"); return; }
    if (m.type === "output") return this.output(p, String(m.text), m.stream === "stderr" ? "stderr" : "stdout");
    if (!TERMINAL.has(m.type)) return;
    this.flushHeld(p);
    if (m.type === "ready") return this.ready(p, m);
    if (m.type === "error") return this.fault(p, String(m.message));
    if (m.type === "done") return this.state === "loading" ? this.end("failed-to-load", "jshell exited while starting") : this.end("exited");
    this.fault(p, ""); // completions: this client never asks for them, so the protocol is not the one it knows
  }
  // Output is counted as it arrives. stdout is passed on at once; stderr is held to the end of each line, so a Rust
  // runtime line can be recognized and withheld, and is passed on before anything that arrives after it.
  output(p, text, stream) {
    p.chars += text.length;
    p.lines += text.split("\n").length - 1;
    if (p.chars > this.outputLimitChars || p.lines > this.outputLimitLines) return this.end("output-limit");
    if (stream === "stdout") { this.flushHeld(p); return this.show(p, text, "stdout"); }
    p.held += text;
    for (let nl = p.held.indexOf("\n"); nl >= 0; nl = p.held.indexOf("\n")) {
      const line = p.held.slice(0, nl);
      p.held = p.held.slice(nl + 1);
      this.stderrLine(p, line);
    }
  }
  stderrLine(p, line) {
    if (p.panic) {
      if (RUST_NOTE.test(line)) p.panic = false;
      else if (OUT_OF_MEMORY_PANICS.some((r) => r.test(line))) p.memory = true;
      return;
    }
    if (RUST_PANIC.test(line)) { p.blank = false; p.panic = true; return; }
    if (RUST_ABORT.test(line)) { p.blank = false; p.memory = true; return; }
    if (RUST_NOTE.test(line)) return;
    if (p.blank) { p.blank = false; this.show(p, "\n", "stderr"); }
    if (line === "") { p.blank = true; return; } // held: a Rust panic begins with a blank line
    this.show(p, line + "\n", "stderr");
  }
  flushHeld(p) {
    if (p.blank) { p.blank = false; this.show(p, "\n", "stderr"); }
    if (p.held) { const text = p.held; p.held = ""; this.show(p, text, "stderr"); }
  }
  show(p, text, stream) { if (p.boot) p.output += text; else this.onOutput(text, stream); }
  ready(p, m) {
    if (m.closed) return this.state === "loading" ? this.end("failed-to-load", "jshell closed while starting") : this.end("exited");
    clearTimeout(p.timer);
    this.pending = null;
    if (!p.boot && !p.restart) this.ran += Date.now() - p.sent;
    this.continuation = Boolean(m.continuation);
    const prompt = typeof m.prompt === "string" ? m.prompt : null;
    if (p.boot) return p.resolve({ status: "ready", output: p.output, prompt });
    this.set("ready");
    p.resolve({ status: "ready", continuation: this.continuation, prompt });
  }
  // The engine is unusable after any error (every later request answers "unreachable"), so every fault ends the session.
  fault(p, message) {
    if (this.state === "loading") return this.end("failed-to-load", "the Java engine failed while starting");
    if (EXITED.test(message)) return this.end("exited");
    if (ENGINE_OUTPUT_CAP.test(message)) return this.end("output-limit");
    if (p.memory || OUT_OF_MEMORY_ERRORS.some((r) => r.test(message))) return this.end("out-of-memory");
    this.end("crashed");
  }
  // The first ending wins. The worker is terminated, the request in flight answers { status: "ended", reason }.
  end(endedBy, detail) {
    if (this.state === "ended" || this.state === "idle") return;
    this.generation++;
    this.interrupt?.();
    this.interrupt = null;
    this.endedBy = endedBy;
    this.endedWords = words(endedBy, detail);
    this.worker?.terminate();
    this.worker = null;
    const p = this.pending;
    this.pending = null;
    this.set("ended");
    if (p) { clearTimeout(p.timer); p.resolve({ status: "ended", reason: endedBy }); }
  }
}
```

- [ ] **Step 5: Run to green, and break it on purpose**

Run: `node web/test/jshell-session.mjs`
Expected: `92 check(s), 0 failed`, exit 0, in about two minutes (drafting run: 123 s; the fake checks take a few
seconds, and the real worker boots nine times: the round trip's session, its `/reset` and its `/reload`, the memory
abort's session and the three after it (the panic, Ristretto's own stop, memory past 2 GiB), the deadline's session and
the new session after it). It prints `(real worker: ready in N ms)` (about 11 s here) and, in its labels, the real
`/reset` (about 8 s), the real `/reload` (about 9 s), the memory abort's time (about 4 s) and the lines Ristretto's own
stop lets through (524).

Break it on purpose, one at a time, rerunning each time, and restore after each: every check fails under at least one
break below. Each was applied to a scratch copy of `web/` and run (`node web/test/jshell-session.mjs --scratchpad <a built
site's scratchpad/>`), five at a time, and each exits 1. Where a break leaves a later step impossible (a session still
waiting, a start that rejects), the run stops there, after the failures listed. (a) to (m) are the ones the client most
needs.

| Break | Exit | What failed (as run) |
|---|---|---|
| (a) In `receive`, delete `if (this.pending !== p \|\| m?.id !== p.id) return;`: a stopped worker's late answer would flip a dead session back to ready | 1 | "output, an answer and an error from the stopped worker change nothing, once a new session has started"; "and while the new session's entry runs, the stopped worker's late answer to its own request is not taken for the entry's"; "output and an answer from the worker for another request than the one in flight change nothing" |
| In `receive`, only `this.pending !== p \|\|` deleted: the stopped worker's late answer to the request it was stopped in (its own id) is taken for the new session's | 1 | "output, an answer and an error from the stopped worker change nothing, once a new session has started"; "and while the new session's entry runs, the stopped worker's late answer to its own request is not taken for the entry's" |
| In `receive`, only `\|\| m?.id !== p.id` deleted: the worker in use, answering for another request than the one in flight, is taken for it | 1 | "output and an answer from the worker for another request than the one in flight change nothing" |
| (b) In `request`, replace `setTimeout(() => {` with `(() => {`: no deadline is armed (each of its checks fails on the test's wall clock, so the test does not hang) | 1 | "an entry that runs past the deadline is stopped there, its worker terminated"; "the deadline is said in plain words, with its length"; "at a continuation, /reset is part of what is being typed, not a restart: an entry's deadline, and no word of starting jshell"; "a restart that never answers fails to load at its deadline, saying so, its worker terminated"; "a /reload with nothing run before it has only the boot deadline"; "a /reset replays nothing, so it has only the boot deadline, however long the session's entries took"; "a boot that never answers fails to load at the boot deadline, its worker terminated"; "real: an endless loop is stopped at the deadline (30002 ms), and its worker thread exits"; "real: the deadline is said with its length (3 seconds here; 0 for the fake's 50 ms)"; "real: a new session starts after the ending and numbers from $1 again" (then the run stops at a later step the break makes impossible) |
| (c) In `stderrLine`, delete the `RUST_ABORT` line | 1 | "a memory abort ends the session as out-of-memory"; "the Rust runtime's lines are withheld; Java's own output is not"; "out-of-memory is said in plain words"; "real: memory used up ends the session as out-of-memory (4364 ms), and no Rust text reaches the output" |
| (d) Make `matches` return `true` | 1 | "a file with one byte changed fails its hash"; "a file cut short fails"; "the front end's jar is checked like the rest: one byte changed, and nothing starts"; "a cached file that fails its hash is downloaded again and replaced"; "a new front end downloads only its jar: the zip and the wasm files come from the cache, the old jar's entry is deleted, and the new version names the worker" |
| (e) In `end`, delete `this.interrupt?.();`: `start` then waits out the download after Stop, the Plan 3 lesson of a cancel landing during a compile | 1 | "Stop during the download ends it: start rejects as stopped, and the download finishing later starts no worker" |
| (f) In `output`, replace `p.held += text;` with `this.show(p, text, "stderr"); return;` (stderr not held to line ends) | 1 | "a memory abort ends the session as out-of-memory"; "the Rust runtime's lines are withheld; Java's own output is not"; "out-of-memory is said in plain words"; "an impossible allocation (a Rust panic, capacity overflow) is out-of-memory, and nothing of the panic is shown"; "a Rust panic that is not about memory is crashed, and is not shown"; "Java's own stderr passes through whole, in arrival order, blank lines and a last line without a newline included"; "real: memory used up ends the session as out-of-memory (4229 ms), and no Rust text reaches the output"; "real: an impossible allocation (a Rust panic, capacity overflow) ends the session as out-of-memory, and nothing of the panic is shown" |
| (g) Remove `"completions"` from `TERMINAL` | 1 | "completions, never asked for, end the request instead of leaving it waiting" |
| (h) The worker gets the zip as downloaded (`name === "jdk.zip" ? withFrontEnd(bytes, jar) : bytes` becomes `bytes`): Ristretto's own front end runs | 1 | "the first request is Ristretto's jshell request with the worker's four files, the course's front end composed into jdk.zip"; "a jdk.zip with no front end to replace fails to load, and no worker starts"; "a new page starts from the cache without downloading the files, and composes them as before"; "a new front end downloads only its jar: the zip and the wasm files come from the cache, the old jar's entry is deleted, and the new version names the worker"; "real: the pinned worker starts the course's front end: the pinned JDK's banner, then jshell's prompt"; "real: 2 + 3"; "real: a method typed over three lines continues at the continuation prompt, then is created"; "real: cancel drops an open snippet" (then the run stops at a later step the break makes impossible) |
| (i) In `ready`, `const prompt = null;`: the front end's prompt is not handed on | 1 | "start resolves with jshell's banner and its first prompt, and the banner is not also sent as output"; "each answer hands on the front end's next prompt as it is: after an entry, at a continuation, after a cancel, in concise mode"; "/reset is one request and one answer, though it outlasts the entry deadline: the client never restarts jshell itself"; "real: the pinned worker starts the course's front end: the pinned JDK's banner, then jshell's prompt"; "real: 2 + 3"; "real: a method typed over three lines continues at the continuation prompt, then is created"; "real: cancel drops an open snippet"; "real: /reset starts a fresh VM in its own request (9158 ms): it says jshell is starting, prints no banner, keeps the feedback mode (concise's prompt), and the variable is gone"; "real: /reload starts a fresh VM and replays the session on it (10692 ms), saying jshell is starting" |
| (j) A restart line gets the entry deadline (`deadlineMs: this.deadlineMs`) | 1 | "/reset is one request and one answer, though it outlasts the entry deadline: the client never restarts jshell itself"; "a restart that never answers fails to load at its deadline, saying so, its worker terminated"; "a /reload with nothing run before it has only the boot deadline"; "a /reset replays nothing, so it has only the boot deadline, however long the session's entries took" |
| (k) In `submit`, delete `this.onProgress("jshell");`: a restart says nothing while the fresh VM boots | 1 | "/reset says at once that jshell is starting, and stays busy while the worker starts a fresh VM"; "a line the front end reads as /reset or /reload (the name, a unique prefix, with options or spaces after) says jshell is starting"; "real: /reset starts a fresh VM in its own request (9186 ms): it says jshell is starting, prints no banner, keeps the feedback mode (concise's prompt), and the variable is gone"; "real: /reload starts a fresh VM and replays the session on it (10658 ms), saying jshell is starting" |
| (l) `"/reload"` deleted from `COMMANDS`, as a front-end change the client missed would leave it | 1 | "the client resolves commands against the front end's own command names (Commands.java's NAMES)"; "a line the front end reads as /reset or /reload (the name, a unique prefix, with options or spaces after) says jshell is starting"; "an ambiguous prefix, another command, a comment, or Java does not"; "a restart that never answers fails to load at its deadline, saying so, its worker terminated"; "a /reload with nothing run before it has only the boot deadline"; "real: /reload starts a fresh VM and replays the session on it (10780 ms), saying jshell is starting" |
| (m) `const replay = 0;`: a `/reload` gets no time for its replay | 1 | "a /reload after entries that took 200 ms gets twice that for its replay, on top of the boot deadline"; "a /reset replays nothing, so it has only the boot deadline, however long the session's entries took" |
| `const REPLAY_FACTOR = 1;`: a `/reload` gets its entries' time once, not twice (D64), so the fake's 350 ms answer misses its deadline (added at the task review, Ruling 13) | 1 | "a /reload after entries that took 200 ms gets twice that for its replay, on top of the boot deadline"; "a /reset replays nothing, so it has only the boot deadline, however long the session's entries took" (it reuses the session the failed /reload ended) |
| The jar is not checked (`if (name !== FRONT_END && !(await matches(bytes, want[i]))) throw`) | 1 | "the front end's jar is checked like the rest: one byte changed, and nothing starts" |
| `start` resolves `{ banner: r.output }`, without the first prompt | 1 | "start resolves with jshell's banner and its first prompt, and the banner is not also sent as output"; "real: the pinned worker starts the course's front end: the pinned JDK's banner, then jshell's prompt" |
| `const restart = restartOf(line);`: a `/reset` typed at a continuation is taken for a restart | 1 | "at a continuation, /reset is part of what is being typed, not a restart: an entry's deadline, and no word of starting jshell" |
| In `ready`, delete `this.continuation = Boolean(m.continuation);` | 1 | "a line that leaves the snippet open is a continuation"; "at a continuation, /reset is part of what is being typed, not a restart: an entry's deadline, and no word of starting jshell"; "real: a method typed over three lines continues at the continuation prompt, then is created"; "real: cancel drops an open snippet"; "real: cancel at an unfinished /exit forgets the /exit too, so the next entry runs and the session goes on" |
| `restartOf` takes any prefix that some restart name begins with (`return names.find((n) => RESTARTS.includes(n)) ?? null;`): `/r` and `/re` restart | 1 | "an ambiguous prefix, another command, a comment, or Java does not" |
| `restartOf` takes the exact name only (`const names = COMMANDS.includes(word) ? [word] : [];`) | 1 | "a line the front end reads as /reset or /reload (the name, a unique prefix, with options or spaces after) says jshell is starting" |
| `restartOf` trims the line's start too (`line.trim()`): ` /reset`, which the front end reads as Java, restarts | 1 | "an ambiguous prefix, another command, a comment, or Java does not" |
| A `/reset` gets the replay time too (`const replay = REPLAY_FACTOR * this.ran;`) | 1 | "a /reset replays nothing, so it has only the boot deadline, however long the session's entries took" |
| In the deadline timer, delete the `if (restart)` line: a restart that never answers ends as `timeout`, "This entry ran for 0 seconds…" | 1 | "a restart that never answers fails to load at its deadline, saying so, its worker terminated"; "a /reload with nothing run before it has only the boot deadline"; "a /reset replays nothing, so it has only the boot deadline, however long the session's entries took" |
| In `ready`, delete `clearTimeout(p.timer);`: an entry or boot answered in time is timed out later | 1 | "an entry and a boot that finished in time are never timed out later"; "a restart that never answers fails to load at its deadline, saying so, its worker terminated"; "a /reload after entries that took 200 ms gets twice that for its replay, on top of the boot deadline"; "a /reset replays nothing, so it has only the boot deadline, however long the session's entries took" |
| `start` makes the worker without its `try`/`catch` | 1 | "a browser that will not start the worker fails to load, and says so" |
| The `onerror` and `onmessageerror` handlers without `if (this.worker === worker)` | 1 | "output, an answer and an error from the stopped worker change nothing, once a new session has started"; "and while the new session's entry runs, the stopped worker's late answer to its own request is not taken for the entry's" |
| `start` reports `download` every time (`this.onProgress("download");`, without `if (!this.assets)`) | 1 | "and says it is starting Java and jshell, never that it is downloading" |
| In `end`, delete `this.worker?.terminate();` | 1 | "Stop ends a running entry at once: the worker is terminated and the session is gone"; "an entry that runs past the deadline is stopped there, its worker terminated"; "output past the character cap ends the session; what came before the cap was shown"; "an engine error ends the session as crashed, and its raw message goes nowhere"; "System.exit(0) ends the session as exited"; "/exit ends the session as exited, after jshell's goodbye"; "a restart that never answers fails to load at its deadline, saying so, its worker terminated"; "a boot that never answers fails to load at the boot deadline, its worker terminated"; "an engine error while starting fails to load, not crashed"; "real: an endless loop is stopped at the deadline (3003 ms), and its worker thread exits"; "real: Stop ends a running entry, and its worker thread exits (5002 ms)" |
| In `loadAssets`, delete the line that puts a verified file in the cache | 1 | "each verified file is kept in Cache Storage under its own hash; an entry the manifest no longer lists is deleted, another site's cache is not"; "a new page starts from the cache without downloading the files, and composes them as before"; "a cached file that fails its hash is downloaded again and replaced"; "a new front end downloads only its jar: the zip and the wasm files come from the cache, the old jar's entry is deleted, and the new version names the worker" |
| That line without its `try`/`catch` (`await cache?.put(keys[i], new Response(bytes));`) | 1 | "storage that is full (it refuses to keep a file) only means downloading again next time" |
| In `openCache`, delete the loop that deletes the entries the manifest no longer lists | 1 | "each verified file is kept in Cache Storage under its own hash; an entry the manifest no longer lists is deleted, another site's cache is not"; "a new front end downloads only its jar: the zip and the wasm files come from the cache, the old jar's entry is deleted, and the new version names the worker" |
| That loop deletes every entry (`await cache.delete(request);`, without `if (!keys.has(request.url))`) | 1 | "a new page starts from the cache without downloading the files, and composes them as before"; "a cached file that fails its hash is downloaded again and replaced"; "a new front end downloads only its jar: the zip and the wasm files come from the cache, the old jar's entry is deleted, and the new version names the worker" |
| Each file cached under its name alone (`new URL(name, this.base).href`), not its hash | 1 | "each verified file is kept in Cache Storage under its own hash; an entry the manifest no longer lists is deleted, another site's cache is not"; "a cached file that fails its hash is downloaded again and replaced"; "a new front end downloads only its jar: the zip and the wasm files come from the cache, the old jar's entry is deleted, and the new version names the worker" |
| `openCache` rethrows instead of returning `null` (`} catch (e) { throw e; }`) | 1 | "storage that refuses (a private window) only means downloading" |
| `loadAssets` also downloads `worker.js` (`await this.fetchBytes(new URL("worker.js", this.base).href).catch(() => {});` after the manifest) | 1 | "start downloads the manifest, then the five files, and nothing else"; "with no fetchBytes of its own, the client asks the browser's fetch for manifest.json with cache: no-cache, the files as usual"; "a new page starts from the cache without downloading the files, and composes them as before"; "a cached file that fails its hash is downloaded again and replaced"; "a new front end downloads only its jar: the zip and the wasm files come from the cache, the old jar's entry is deleted, and the new version names the worker"; "storage that refuses (a private window) only means downloading"; "storage that is full (it refuses to keep a file) only means downloading again next time" |
| The worker made from `"worker.js"`, not from its URL under `base` | 1 | "the worker is the site's own worker.js under the manifest's version, so a browser that kept an old worker.js never runs it"; "a new front end downloads only its jar: the zip and the wasm files come from the cache, the old jar's entry is deleted, and the new version names the worker"; "real: the pinned worker starts the course's front end: the pinned JDK's banner, then jshell's prompt" (then the run stops at a later step the break makes impossible) |
| The request names `className: "JShell"` | 1 | "the first request is Ristretto's jshell request with the worker's four files, the course's front end composed into jdk.zip" |
| After `this.banner = r.output;` add `this.onOutput(r.output, "stdout");` | 1 | "start resolves with jshell's banner and its first prompt, and the banner is not also sent as output"; "an entry is one request without the files, and its output arrives as it is printed"; "output and an answer from the worker for another request than the one in flight change nothing"; "output past the character cap ends the session; what came before the cap was shown"; "output past the line cap ends the session"; "an engine error ends the session as crashed, and its raw message goes nowhere"; "the Rust runtime's lines are withheld; Java's own output is not"; "an impossible allocation (a Rust panic, capacity overflow) is out-of-memory, and nothing of the panic is shown"; "a Rust panic that is not about memory is crashed, and is not shown"; "Java's own stderr passes through whole, in arrival order, blank lines and a last line without a newline included"; "/exit ends the session as exited, after jshell's goodbye"; "/reset is one request and one answer, though it outlasts the entry deadline: the client never restarts jshell itself"; "real: 2 + 3"; "real: an impossible allocation (a Rust panic, capacity overflow) ends the session as out-of-memory, and nothing of the panic is shown"; "real: memory past 2 GiB (2 GB held by one entry: how a long session ends) ends the session at the next entry as out-of-memory, with nothing of the engine's shown"; "real: a new session starts after the ending and numbers from $1 again" |
| In `start`, delete the `download` progress line | 1 | "start goes idle to loading to ready, and says what it is doing" |
| Every request carries the files (`worker.postMessage({ request, assets: this.assets })`) | 1 | "an entry is one request without the files, and its output arrives as it is printed" |
| In `submit`, delete `this.set("busy");` | 1 | "an entry goes busy, then ready"; "a second entry while one runs is refused, never sent (the worker would drop it)"; "start while a session runs is refused"; "Stop ends a running entry at once: the worker is terminated and the session is gone"; "and while the new session's entry runs, the stopped worker's late answer to its own request is not taken for the entry's"; "output and an answer from the worker for another request than the one in flight change nothing"; "/reset says at once that jshell is starting, and stays busy while the worker starts a fresh VM" |
| In `ready`, `continuation: false` always | 1 | "a line that leaves the snippet open is a continuation"; "real: a method typed over three lines continues at the continuation prompt, then is created"; "real: cancel drops an open snippet"; "real: cancel at an unfinished /exit forgets the /exit too, so the next entry runs and the session goes on" |
| `cancel` sends `operation: "input"` (the default) instead of `"cancel"` | 1 | "cancel drops the open snippet, as Ctrl-C does" (then the run stops at a later step the break makes impossible) |
| In `submit`, delete the newline check | 1 | "one line per request: a line holding a newline is refused before anything is sent"; "a second entry while one runs is refused, never sent (the worker would drop it)" (then the run stops at a later step the break makes impossible) |
| In `start`, delete the `start() while …` check | 1 | "start while a session runs is refused"; "Stop ends a running entry at once: the worker is terminated and the session is gone" |
| In `words`, delete the `stopped` case (Stop said as an engine failure) | 1 | "Stop is said in plain words" |
| The character cap dropped (`if (p.lines > this.outputLimitLines)`) | 1 | "output past the character cap ends the session; what came before the cap was shown" |
| The line cap dropped (`if (p.chars > this.outputLimitChars)`) | 1 | "output past the line cap ends the session" |
| In `fault`, delete the `ENGINE_OUTPUT_CAP` line | 1 | "the worker's own 1 MiB cap is the same ending"; "so is the engine's own 1 MiB stop, in its own words"; "real: endless printing of a two-byte character meets Ristretto's own 1 MiB stop, in the engine's words (524 lines): output-limit" |
| `ENGINE_OUTPUT_CAP` back to the worker's wording alone (`/^Output exceeded 1 MiB; session stopped\.$/`): the engine's own stop, which the course's front end's output meets, is called a crash again | 1 | "so is the engine's own 1 MiB stop, in its own words"; "real: endless printing of a two-byte character meets Ristretto's own 1 MiB stop, in the engine's words (524 lines): output-limit" |
| The last line of `fault` ends the session as `out-of-memory`, not `crashed` | 1 | "an engine error ends the session as crashed, and its raw message goes nowhere"; "a Rust panic that is not about memory is crashed, and is not shown"; "completions, never asked for, end the request instead of leaving it waiting"; "a worker that throws ends the session as crashed, and the error goes no further (the page's own error report)"; "a message the worker could not pass ends the session as crashed" |
| `OUT_OF_MEMORY_PANICS = []` | 1 | "an impossible allocation (a Rust panic, capacity overflow) is out-of-memory, and nothing of the panic is shown"; "real: an impossible allocation (a Rust panic, capacity overflow) ends the session as out-of-memory, and nothing of the panic is shown" |
| `OUT_OF_MEMORY_ERRORS` emptied (its three RangeError texts deleted) | 1 | "the end of a long session (about 150 entries; "Start offset -2070491856 is outside the bounds of the buffer") is out-of-memory"; "the end of a long session (about 150 entries; "byteOffset cannot be negative") is out-of-memory"; "the end of a long session (about 150 entries; "invalid or out-of-range index") is out-of-memory"; "real: memory past 2 GiB (2 GB held by one entry: how a long session ends) ends the session at the next entry as out-of-memory, with nothing of the engine's shown" |
| In `receive`, delete the `done` line | 1 | "System.exit(0) ends the session as exited" |
| In `fault`, delete the `EXITED` line | 1 | "System.exit with another status ends it as exited too" |
| In `ready`, delete the `m.closed` line | 1 | "/exit ends the session as exited, after jshell's goodbye"; "real: /exit ends the session as exited" |
| In the `onerror` handler, delete `e?.preventDefault?.();` | 1 | "a worker that throws ends the session as crashed, and the error goes no further (the page's own error report)" |
| Delete the `onmessageerror` handler | 1 | "a message the worker could not pass ends the session as crashed" |
| A failed download rethrown as it came (`catch (e) { throw e; }`), not naming the file | 1 | "a file that cannot be downloaded fails to load, naming it, and no worker starts" |
| In `loadAssets`, delete the check that the manifest lists each file | 1 | "a manifest that does not list a file fails"; "a manifest that does not list the front end's jar fails" |
| In `fault`, delete the first line (an error while starting is `failed-to-load`) | 1 | "an engine error while starting fails to load, not crashed" |
| `end` keeps `this.worker`, and `start` reuses it (`this.worker = this.worker \|\| this.createWorker(…)`) | 1 | "output, an answer and an error from the stopped worker change nothing, once a new session has started"; "and while the new session's entry runs, the stopped worker's late answer to its own request is not taken for the entry's"; "after an ending, start begins a new session in a new worker, without downloading again"; "and says it is starting Java and jshell, never that it is downloading" (then the run stops at a later step the break makes impossible) |
| In `output`, replace `p.held += text;` with `return;` (stderr dropped) | 1 | "a memory abort ends the session as out-of-memory"; "out-of-memory is said in plain words"; "an impossible allocation (a Rust panic, capacity overflow) is out-of-memory, and nothing of the panic is shown"; "Java's own stderr passes through whole, in arrival order, blank lines and a last line without a newline included"; "real: memory used up ends the session as out-of-memory (4373 ms), and no Rust text reaches the output"; "real: an impossible allocation (a Rust panic, capacity overflow) ends the session as out-of-memory, and nothing of the panic is shown" |
| In `receive`, every output is taken as stderr (`return this.output(p, String(m.text), "stderr");`) | 1 | "an entry is one request without the files, and its output arrives as it is printed"; "and while the new session's entry runs, the stopped worker's late answer to its own request is not taken for the entry's"; "output and an answer from the worker for another request than the one in flight change nothing"; "Java's own stderr passes through whole, in arrival order, blank lines and a last line without a newline included"; "real: an error arrives whole, on stdout, where the real jshell's console shows it" |
| `manifest.json` fetched without `{ cache: "no-cache" }`: a browser may answer with the manifest it kept, from before a re-pin | 1 | "manifest.json is asked of the site past the HTTP cache (cache: no-cache), the five files as usual"; "with no fetchBytes of its own, the client asks the browser's fetch for manifest.json with cache: no-cache, the files as usual" |
| `fetchBytesDefault` drops fetch's `init` (`fetch(url)`): the browser's own fetch may answer from its HTTP cache | 1 | "with no fetchBytes of its own, the client asks the browser's fetch for manifest.json with cache: no-cache, the files as usual" |
| The worker started at plain `worker.js` (`new URL("worker.js", this.base).href`), not under the manifest's version | 1 | "the worker is the site's own worker.js under the manifest's version, so a browser that kept an old worker.js never runs it"; "a new front end downloads only its jar: the zip and the wasm files come from the cache, the old jar's entry is deleted, and the new version names the worker" |
| In `loadAssets`, delete the check that the manifest gives its version (the worker is then started at `worker.js?v=undefined`) | 1 | "a manifest that does not give its version, which names the worker, fails" |
| The output counted for the session, not the entry (`p.chars = this.chars = (this.chars ?? 0) + text.length;`, and the same for lines) | 1 | "output past the character cap ends the session; what came before the cap was shown"; "output past the line cap ends the session"; "the caps count each entry's output on its own: two entries of 62 characters and 2 lines each, under caps of 100 and 3, both finish" |
| The deadline's words say 0 seconds whatever the deadline (`This entry ran for 0 seconds without finishing`) | 1 | "real: the deadline is said with its length (3 seconds here; 0 for the fake's 50 ms)" |
| A boot's or a restart's words say 0 seconds whatever the deadline (`const within = "jshell did not answer within 0 seconds";`) | 1 | "a restart that never answers fails to load at its deadline, saying so, its worker terminated" |
| The default entry deadline 600,000 ms (`deadlineMs = 600_000,`), not D49's 60,000 | 1 | "the client's limits are D49's: 60,000 ms an entry, 240,000 ms a boot, 1,000,000 characters or 100,000 lines of output an entry" |
| The default boot deadline 2,400,000 ms (`bootDeadlineMs = 2_400_000,`), not 240,000 | 1 | "the client's limits are D49's: 60,000 ms an entry, 240,000 ms a boot, 1,000,000 characters or 100,000 lines of output an entry" |
| The default character cap 10,000,000 (`outputLimitChars = 10_000_000,`), not 1,000,000 | 1 | "the client's limits are D49's: 60,000 ms an entry, 240,000 ms a boot, 1,000,000 characters or 100,000 lines of output an entry" |
| The default line cap 10,000,000 (`outputLimitLines = 10_000_000,`), not 100,000 | 1 | "the client's limits are D49's: 60,000 ms an entry, 240,000 ms a boot, 1,000,000 characters or 100,000 lines of output an entry" |
| In `stderrLine`, delete the `RUST_PANIC` line | 1 | "an impossible allocation (a Rust panic, capacity overflow) is out-of-memory, and nothing of the panic is shown"; "a Rust panic that is not about memory is crashed, and is not shown"; "real: an impossible allocation (a Rust panic, capacity overflow) ends the session as out-of-memory, and nothing of the panic is shown" |
| In `stderrLine`, delete the line that withholds a `RUST_NOTE` on its own | 1 | "the Rust runtime's lines are withheld; Java's own output is not"; "real: memory used up ends the session as out-of-memory (4315 ms), and no Rust text reaches the output" |
| `ENGINE_OUTPUT_CAP` to the engine's wording alone (`/^Output exceeded 1 MiB; execution stopped\.$/`): the worker's own stop is called a crash | 1 | "the worker's own 1 MiB cap is the same ending" |
| `OUT_OF_MEMORY_ERRORS` without V8's text (`Start offset -N is outside the bounds of the buffer`) | 1 | "the end of a long session (about 150 entries; "Start offset -2070491856 is outside the bounds of the buffer") is out-of-memory"; "real: memory past 2 GiB (2 GB held by one entry: how a long session ends) ends the session at the next entry as out-of-memory, with nothing of the engine's shown" |
| `OUT_OF_MEMORY_ERRORS` without WebKit's text (`byteOffset cannot be negative`): Task 6 runs WebKit's real check | 1 | "the end of a long session (about 150 entries; "byteOffset cannot be negative") is out-of-memory" |
| `OUT_OF_MEMORY_ERRORS` without Firefox's text (`invalid or out-of-range index`): Task 6 runs Firefox's real check | 1 | "the end of a long session (about 150 entries; "invalid or out-of-range index") is out-of-memory" |

- [ ] **Step 6: Commit**

```bash
git add web/page/compose.mjs web/page/jshell-session.mjs web/test/jshell-session.mjs web/test/jshell-node.mjs \
  runtime/jshell/test/ristretto.mjs runtime/jshell/test/browser.mjs
git commit
```
(`git mv` already staged the move; `git status` shows `runtime/jshell/compose.mjs -> web/page/compose.mjs` renamed with no
change.) The message says why every stop ends the session (the engine runs an entry in one synchronous call; only
terminating the worker stops it); why the client composes the front end into the pinned zip in memory and caches each file
by its own hash (every published byte stays as pinned; a front-end fix costs a reader 54 KB, not 22 MB); why a restart
line gets a boot's deadline and a `/reload` twice its session's entry time on top (the table above); that the client
resolves restart lines against the front end's own command names and a check keeps the two lists equal; how a memory
abort and the long-session death reach the client (stderr Rust lines then `error "unreachable"`; an `error` event carrying
the engine's RangeError text); that Ristretto's own output stop reaches the client in two wordings, the engine's being the
one the course's front end meets, and both end as `output-limit`; that each of these is met in the real engine as well as
in the fake (memory past 2 GiB by one entry holding 2 GB); why `manifest.json` is asked of the site past the HTTP cache and
`worker.js` started under the manifest's version (a re-pin must never meet a kept manifest or worker); that D49's four
numbers are the client's defaults and a check holds them there; the real worker's boot, `/reset` and `/reload` times;
the front end's check after the move (562 entries, 0 failing, Step 1) and why its `breaks.mjs` waits for Task 4; and the
on-purpose breaks with their exit codes.

### Task 4: the transcript check against the real jshell

**Files:**
- Create: `runtime/jshell/test/drive.mjs`
- Modify: `runtime/jshell/test/check.mjs`, `runtime/jshell/test/ristretto.mjs`, `runtime/jshell/test/browser.mjs`,
  `runtime/jshell/test/browser/page.mjs`, `runtime/jshell/test/browser/index.html` (its comment),
  `runtime/jshell/test/breaks.mjs`, `runtime/jshell/test/rist-sweep.mjs`, `runtime/jshell/test/pins.json`,
  `runtime/jshell/test/pin.mjs` (its header comment)
- Delete: `runtime/jshell/test/measure.mjs`
- Not created (D62 replaces them with the front end's check): the planned `web/test/jshell-transcript.mjs`,
  `web/test/jshell-pty.py`, `web/test/MemoryPreferences.java`, `web/test/jshell-entries.json` and `web/test/jshell-rules.mjs`

This task changes files the course's front end owns in main (`runtime/jshell/test/`, 1d5e57b). It moves no pinned file:
the jar built from `src/`, the ten session files and `startup-time.jsh` are untouched, so there is no re-pin (only a change
to one of those would need `node runtime/jshell/test/pin.mjs`). `pins.json` is edited by hand: its five Ristretto hashes
go, since `runtime/ristretto/CHECKSUMS` holds them, and its `jar` and `entries` (562) stay.

**Interfaces:**
- Consumes: Task 1's `runtime/ristretto/CHECKSUMS` (the six runtime lines, the jar's among them, besides the legal files);
  Task 2's `site/scratchpad/` and `harness.buildSite`; Task 3's `JShellSession`, `ASSETS`, `web/page/compose.mjs` and
  `web/test/jshell-node.mjs` (`scratchpadDir`, `nodeWorker`, `nodeFetchBytes`, `dirUrl`); from the front end in main,
  `RealJShell.java`, `OurJShell.java`, `Sessions.java`, `Json.java`, `sessions.mjs`, `sessions/`, `startup-time.jsh`,
  `pin.mjs` and `build.sh`.
- Produces: `node runtime/jshell/test/check.mjs [--native | --browser chromium|webkit|firefox] [--sessions a,b] [--keep]
  [--scratchpad DIR]`, this plan's one transcript check. Ten session files, 562 entries, byte for byte against the real
  jshell started through its builder with in-memory persistence (`RealJShell`, J1 startup, en_US), never the binary, with
  five announced differences (`startup`, `engine`, `frames`, `message`, `own`) that must fire where announced; per entry
  the output, the prompt each line answered and the output between lines, then the banner and the tail. Its "ours" side
  is the page's own client: `JShellSession` over Ristretto's worker in a Node worker thread (default), or in a headless
  browser on the staged page (`--browser`); `--native` runs the jar built from `src/` on the pinned JDK as a fast witness.
  `DIR` is a built site's `scratchpad/` (holding `manifest.json`), default the fixture site `harness.buildSite` builds
  (`jshell-check-site`); Ristretto's five hashes come from `runtime/ristretto/CHECKSUMS`, the jar's from `pins.json`, and
  on Ristretto `CHECKSUMS`, the scratchpad's jar and `manifest.json` must agree with them. Exit 0 when every entry matches,
  1 when one differs (or the entry count is not the pinned 562), 2 when a pin moved, a driver broke, or on misuse (an
  unknown option included).
- Produces: `node runtime/jshell/test/ristretto.mjs SESSION.jsh OUT_JSON --scratchpad DIR` and `node
  runtime/jshell/test/browser.mjs SESSION.jsh OUT_JSON --browser chromium|webkit|firefox --scratchpad DIR`, each writing
  `{banner, entries: [{lines, prompts, out, between?, ms}], bootMs, ended, closed, tail, totalMs, side}` (the browser's
  adds `browser`, `requests`, `offOrigin`, `problems`; a start that failed still gives `bootMs` and `totalMs`, the time it
  took to fail); both run `drive(entries, open)` from `runtime/jshell/test/drive.mjs`.
- Produces: `node runtime/jshell/test/breaks.mjs [--only a,b] [--skip-slow] [--scratchpad DIR]`, the proof of the check's
  gates (36 breaks); `node runtime/jshell/test/rist-sweep.mjs --scratchpad DIR [PARALLEL]` (exit 0 when Ristretto prints
  every swept entry as the pinned JDK does; 1 when one differs, a session ends early or fails to run, or there is nothing
  to compare; 2 on misuse).

What changes in the check's modes, exactly:
- Default (Ristretto under Node): `ristretto.mjs` imported Ristretto's worker into the driver's own main thread (`self`
  and `postMessage` stubbed) and drove it by hand (no deadline, no checks, the jar read from a path), which let it record
  each entry's wasm memory by wrapping `WebAssembly.instantiate`. It now runs `JShellSession` through `jshell-node.mjs`,
  the worker in a worker thread, so the session's files come from the scratchpad as a page gets them (`manifest.json`,
  five downloads checked, the jar composed by `web/page/compose.mjs`), with the client's limits (60 s an entry; a restart
  line per Task 3). An ending other than `/exit` is "our session ended early". Per-entry wasm memory is dropped on
  purpose: nothing in the check reads it (it compares output and prompts), its one reader, `measure.mjs`, goes in this
  task, and the figures it gave stand in the front end's handoff (section 6). Keeping it would mean reporting the memory
  from inside the worker thread in messages outside Ristretto's protocol, which the page's client must never see; the
  browser mode never recorded it (a page cannot see its worker's memory).
- `--browser`: the staged page ran its own fetch-and-compose driver; it now runs `JShellSession` and `drive.mjs` in the
  page, from the scratchpad served under `scratchpad/` (the client checks, caches in Cache Storage and composes there). It
  is served with no header but a content type, as the course's site is (`web/serve.mjs`): the CSP header is gone, so the
  off-origin gate is the request log alone, which records every request that leaves the origin and aborts it, so it never
  arrives anywhere (as `web/test/harness.mjs` does), and fails the check. The off-origin break aims at a canary server on
  another 127.0.0.1 port and passes only if the canary saw nothing; the CSP's own break goes with the header.
- `--native`: unchanged (the jar built from `src/` on the pinned JDK, Ristretto's VM rules not applied), except that it
  reads Ristretto's five pins from the scratchpad too, as every mode does.
- Gone: `--site DIR` (Ristretto's files in upstream's layout; now misuse, exit 2, never silently ignored), `--jar` and
  `--upstream` (Ristretto's own front end) in both drivers, and with `--upstream` the front end's `measure.mjs`, whose ours
  against upstream timing is recorded in the front end's handoff (section 6). `rist-sweep.mjs` passes `--scratchpad` on.

- [ ] **Step 1: One pin list for Ristretto**

`runtime/jshell/test/pins.json` loses its `ristretto` object (the five hashes keyed by upstream's paths, a second copy of
`runtime/ristretto/CHECKSUMS`'s lines) and says where they are:
```json
{
 "about": "SHA-256 of what the proof is made of besides Ristretto: the front end's jar as runtime/jshell/build.sh builds it from src/, every session file and the J1 startup file, and the number of entries. Ristretto's five files are pinned once, in runtime/ristretto/CHECKSUMS, which also lists this jar (runtime/ristretto/package.sh refuses a jar that is not this one). test/check.mjs fails (exit 2) if a file differs, is missing or is added. Re-pin a meant change with node runtime/jshell/test/pin.mjs.",
 "jar": "e5ee02f466698fa0548f9b93299eee22c5f858a058ae61c624b6be26587f5ae4",
 "sessions": {
  "commands.jsh": "72ef3a2ce644c3aff3b3ab2f14bb9a81f3b209a3cddac4413bf89da598d3c1b0",
  "course.jsh": "37b5bd9562bea2d198f213c3a69b7dfd004474e717e636c973e42702da00c179",
  "declarations.jsh": "b17d2751178812d7016b8f65f77e391e21dbbd10f176d6dbc489287fdd134b21",
  "errors.jsh": "c1cb584b7078d06c0153e7c06c058e482588d3d5805a64fcf4b4d66a6d843b21",
  "exceptions.jsh": "050cc778761c6b97fe610040c7ab0907f4f3083f46cc6bec1098abb540f6ea77",
  "feedback.jsh": "61778df87369a2bb076b13a8d20949566a7bca7dd57296aff5af967048e7cbe0",
  "input.jsh": "956b827992073dc2fdbf24c8301f67121031e7845fabaa582609c30559920f3b",
  "session.jsh": "5bac4f2d91b50a14cc2090ad95aa3a18c75bff561b28484d7ad580625ed8a48b",
  "startup.jsh": "5899d7fc610886e6e17b47e842feaa80099917d367f427845e8fcf4302f1fe8b",
  "values.jsh": "82ee0447c20b21121784a521e9ae294e0dd6b616ec9471ae1c7c3e4617d41ca3",
  "startup-time.jsh": "5201a7bb604fa0f933acce5600c9c7fcdc68b55c2a58c632a21c4df2c713959d"
 },
 "entries": 562
}
```
`pin.mjs`'s code needs no change: it rewrites `jar`, `sessions` and `entries` and keeps the rest. Its header still says
Ristretto's files are "not touched (Plan 3b pins those bytes)", as if `pins.json` held them; it becomes:
```js
// Re-pins what the proof is made of after a meant change: the jar build.sh builds from src/, every session file, the
// J1 startup file and the number of entries. Ristretto's five files are not pinned here: runtime/ristretto/CHECKSUMS
// pins them, with this jar (a re-pinned jar reaches the Ristretto and browser modes through a new scratchpad release).
```

- [ ] **Step 2: The loop both "ours" sides share**

Create `runtime/jshell/test/drive.mjs` (plain ES, no Node import, so the staged page loads it too):
```js
/*
 *  Copyright 2026 Java Foundations contributors.
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
// One session file through the page's own client (web/page/jshell-session.mjs), line by line as a reader types it:
// ristretto.mjs runs this under Node, and the staged page (test/browser/page.mjs) in a browser, so both prove the same
// client. Plain ES module with no Node imports, so the page can load it. The result has the shape RealJShell and
// OurJShell write: per entry its lines, the prompt each line answered, its output and what showed between its lines.
import { CANCEL } from "./sessions.mjs";

/**
 * @param {string[][]} entries the session's entries, each its lines (CANCEL: the reader's Ctrl-C)
 * @param {(onOutput: (text: string) => void) => object} open makes the JShellSession, its output going to onOutput
 */
export async function drive(entries, open) {
  let text = "";
  const session = open((t) => { text += t; });
  const started = Date.now();
  let opened;
  try { opened = await session.start(); }
  catch (e) {
    // A start that failed (a download or check, the worker, the boot deadline) still says how long it took.
    const ms = Date.now() - started;
    return { banner: null, entries: [], bootMs: ms, ended: { reason: e.reason ?? null, words: e.message }, closed: false,
      tail: "", totalMs: ms };
  }
  const result = { banner: opened.banner, entries: [], bootMs: Date.now() - started };
  let prompt = opened.prompt, ended = null, closed = false;
  for (const lines of entries) {
    const entry = { lines, prompts: [], out: "" };
    const t = Date.now(), between = [];
    for (const [i, line] of lines.entries()) {
      if (ended || closed) break;
      entry.prompts.push(prompt);
      text = "";
      const answer = line === CANCEL ? await session.cancel() : await session.submit(line);
      entry.out += text;
      if (i < lines.length - 1 && text) between.push(text); // what showed before the entry's next line
      // /exit closes the session, as the real tool's; any other ending loses it, which fails the check. (System.exit
      // ends as "exited" too, but the real tool goes on after it, so the comparison catches that.)
      if (answer.status !== "ready") { if (answer.reason === "exited") closed = true; else ended = { reason: answer.reason, words: session.endedWords }; break; }
      prompt = answer.prompt;
    }
    if (between.length) entry.between = between;
    entry.ms = Date.now() - t;
    result.entries.push(entry);
    if (ended) break;
  }
  session.stop();
  result.ended = ended;
  result.closed = closed;
  result.tail = ended || closed ? "" : prompt;
  result.totalMs = Date.now() - started;
  return result;
}
```

- [ ] **Step 3: "Ours" is the page's own client, under Node and in a browser**

`runtime/jshell/test/ristretto.mjs` becomes:
```js
/*
 *  Copyright 2026 Java Foundations contributors.
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
// Our front end on Ristretto, headless under Node, driven by the page's own client: JShellSession
// (web/page/jshell-session.mjs) over Ristretto's unmodified worker in a worker thread (web/test/jshell-node.mjs), reading
// a built site's scratchpad/ as a page does: manifest.json, then the five files, each checked, the jar composed into the
// pinned zip, then one request per line (drive.mjs). One worker per process, so one session per run.
// usage: node ristretto.mjs SESSION.jsh OUT_JSON --scratchpad DIR   (DIR: a built site's scratchpad/, holding manifest.json)
// Writes the shape RealJShell and OurJShell write, plus per-entry milliseconds.
import fs from "node:fs";
import { JShellSession } from "../../../web/page/jshell-session.mjs";
import { nodeWorker, nodeFetchBytes, dirUrl } from "../../../web/test/jshell-node.mjs";
import { drive } from "./drive.mjs";
import { parseSession } from "./sessions.mjs";

const args = process.argv.slice(2);
const [sessionFile, outFile] = args;
const dir = args[2] === "--scratchpad" ? args[3] : null;
if (args.length !== 4 || !dir) { console.error("usage: node ristretto.mjs SESSION.jsh OUT_JSON --scratchpad DIR"); process.exit(2); }

const entries = parseSession(fs.readFileSync(sessionFile, "utf8"));
const result = await drive(entries, (onOutput) => new JShellSession(dirUrl(dir), { createWorker: nodeWorker,
  fetchBytes: nodeFetchBytes, caches: null, onOutput }));
result.side = "ours-ristretto";
fs.writeFileSync(outFile, JSON.stringify(result, null, 1));
console.error(`${result.side}: ${result.entries.length} of ${entries.length} entries, boot ${result.bootMs} ms, total ${result.totalMs} ms` +
  `${result.ended ? ", ENDED: " + JSON.stringify(result.ended) : ""}`);
process.exit(0);
```
`runtime/jshell/test/browser/page.mjs` becomes:
```js
/*
 *  Copyright 2026 Java Foundations contributors.
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
// The staged page: the page's own client (page/jshell-session.mjs, which composes our jar into Ristretto's pinned zip
// with page/compose.mjs) over Ristretto's unmodified worker, everything fetched from this page's own origin, the
// scratchpad's files under scratchpad/ as a built site has them. test/browser.mjs runs a session file through it with
// window.scratch.drive, the same loop (drive.mjs) ristretto.mjs runs under Node.
import { JShellSession } from "./page/jshell-session.mjs";
import { drive } from "./drive.mjs";

window.scratch = {
  drive: (entries) => drive(entries, (onOutput) => new JShellSession(new URL("scratchpad/", location.href), { onOutput })),
};
```
`runtime/jshell/test/browser/index.html` (its comment only):
```html
<!doctype html>
<!-- Copyright 2026 Java Foundations contributors. Licensed under the Apache License, Version 2.0. -->
<!-- The staged page for test/browser.mjs: the page's own client over Ristretto's worker, all from this origin. -->
<html lang="en">
<head>
<meta charset="utf-8">
<title>Scratchpad front end, staged</title>
<script type="module" src="page.mjs"></script>
</head>
<body></body>
</html>
```
`runtime/jshell/test/browser.mjs` becomes:
```js
/*
 *  Copyright 2026 Java Foundations contributors.
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
// Our front end on Ristretto in a real browser, driven by the page's own client: the staged page (test/browser/) served
// from 127.0.0.1 on a free port with a built site's scratchpad/ under scratchpad/, headless Chromium, WebKit or Firefox
// through Playwright, the session run in the page by drive.mjs over JShellSession. Like the course's own site (and
// web/serve.mjs), the page is served with no header but a content type. Every request the browser makes, the worker's
// included, is logged; one that leaves the page's origin is recorded, then aborted, so it never arrives anywhere (as
// web/test/harness.mjs does), and the check fails on it.
// usage: node browser.mjs SESSION.jsh OUT_JSON --browser chromium|webkit|firefox --scratchpad DIR
// Writes the shape ristretto.mjs writes, plus "browser", "requests", "offOrigin" and "problems".
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import playwright from "playwright-core";
import { ASSETS } from "../../../web/page/jshell-session.mjs";
import { parseSession } from "./sessions.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const webPage = path.resolve(here, "../../../web/page");
const args = process.argv.slice(2);
const [sessionFile, outFile] = args;
const option = (name) => { const i = args.indexOf(name); return i < 0 ? null : args[i + 1]; };
const browserName = option("--browser"), dir = option("--scratchpad");
if (!["chromium", "webkit", "firefox"].includes(browserName) || !dir || args.length !== 6) {
  console.error("usage: node browser.mjs SESSION.jsh OUT_JSON --browser chromium|webkit|firefox --scratchpad DIR");
  process.exit(2);
}

// The page's origin serves exactly these files and nothing else.
const files = new Map([
  ["/", path.join(here, "browser/index.html")],
  ["/page.mjs", path.join(here, "browser/page.mjs")],
  ["/drive.mjs", path.join(here, "drive.mjs")],
  ["/sessions.mjs", path.join(here, "sessions.mjs")],
  ["/page/jshell-session.mjs", path.join(webPage, "jshell-session.mjs")],
  ["/page/compose.mjs", path.join(webPage, "compose.mjs")],
  ...["manifest.json", "worker.js", ...ASSETS].map((name) => [`/scratchpad/${name}`, path.join(dir, name)]),
]);
const TYPES = { ".html": "text/html", ".mjs": "text/javascript", ".js": "text/javascript", ".json": "application/json",
  ".wasm": "application/wasm" };
const server = http.createServer((req, res) => {
  const file = files.get(new URL(req.url, "http://x").pathname);
  if (!file) { res.writeHead(404).end(); return; }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file) || ".html"] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await playwright[browserName].launch({ headless: true });
const context = await browser.newContext();
const requests = [], offOrigin = [], problems = [];
const leaves = (u) => !u.startsWith(origin + "/") && !u.startsWith("blob:") && !u.startsWith("data:");
const seen = new WeakSet(); // a request both routed and reported is recorded once
const record = (r) => { if (!seen.has(r) && leaves(r.url())) { seen.add(r); offOrigin.push(r.url()); } };
context.on("request", (r) => { requests.push(r.url()); record(r); });
await context.route((u) => leaves(u.href), (route) => { record(route.request()); return route.abort(); });
const page = await context.newPage();
page.on("pageerror", (e) => problems.push("page error: " + e.message));
page.on("console", (m) => { if (m.type() === "error") problems.push("console: " + m.text()); });
page.on("requestfailed", (r) => problems.push(`request failed: ${r.url()} ${r.failure()?.errorText ?? ""}`));
page.setDefaultTimeout(0);
await page.goto(origin + "/");
await page.waitForFunction(() => window.scratch !== undefined);

const entries = parseSession(fs.readFileSync(sessionFile, "utf8"));
const result = await page.evaluate((e) => window.scratch.drive(e), entries);
result.side = `ours-${browserName}`;
result.browser = `${browserName} ${browser.version()}`;
result.requests = requests.map((u) => u.replace(origin, ""));
result.offOrigin = offOrigin;
result.problems = problems;
await browser.close();
server.close();
fs.writeFileSync(outFile, JSON.stringify(result, null, 1));
console.error(`${result.side} (${result.browser}): ${result.entries.length} of ${entries.length} entries, boot ${result.bootMs} ms, ` +
  `total ${result.totalMs} ms, ${requests.length} requests, ${offOrigin.length} off the origin` +
  `${problems.length ? ", problems: " + problems.join("; ") : ""}${result.ended ? ", ENDED: " + JSON.stringify(result.ended) : ""}`);
process.exit(0);
```

- [ ] **Step 4: The check reads a built site's scratchpad and one pin list**

`runtime/jshell/test/check.mjs` becomes (the comparison, the rules and the runs of the real jshell are unchanged; the
options, the pins and the two "ours" commands change):
```js
/*
 *  Copyright 2026 Java Foundations contributors.
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
// The proof that the scratchpad's jshell front end prints what the JDK's jshell prints.
//
//   node runtime/jshell/test/check.mjs              every session in test/sessions/, our jar on Ristretto under Node,
//                                                   driven by the page's own client (web/page/jshell-session.mjs)
//   node runtime/jshell/test/check.mjs --native     the same with our jar on the pinned JDK instead (fast, a witness)
//   node runtime/jshell/test/check.mjs --browser webkit   the same client in a headless browser through the staged page
//                                                    (chromium, webkit or firefox; test/browser.mjs), no request may leave its origin
//   options: --sessions a,b   only those sessions; --keep   keep the run directory; --scratchpad DIR   a built site's
//            scratchpad/ (holding manifest.json), which holds Ristretto's five files and our jar as the build publishes
//            them (default: a fixture site that web/test/harness.mjs's buildSite builds)
//
// What it does, and how it fails (exit 2: a pin moved, a driver broke, or misuse; exit 1: an entry differs; 0: every
// entry matches):
// 1. Pins. Ristretto's five files in the scratchpad must have the SHA-256 that runtime/ristretto/CHECKSUMS gives them
//    (the scratchpad's one pin list), and the jar built from src/ by build.sh the one test/pins.json gives it: changing
//    the front end without re-pinning fails. On Ristretto, the jar the client loads must be that jar too: CHECKSUMS
//    must pin it, the scratchpad's copy must match, and manifest.json must give the client the pinned hashes.
// 2. Four runs per session, in parallel: the real jshell on the pinned JDK with the scratchpad's startup (decision J1)
//    as the reference; the real jshell with its plain default startup; the real jshell with --execution local; and our
//    front end (on Ristretto, or with --native on the pinned JDK).
// 3. Each entry is compared byte for byte: its output, and the prompt each of its lines answered; then the banner and
//    the prompt after the last entry. An entry may differ only by the allowed differences announced before it in the
//    session file ("#! name ..."), each of which must change something there ("fire"): an allowed difference that is
//    announced and does not fire fails, and so does a difference nobody announced. Where the scratchpad says something
//    in its own words (help, an unsupported command), the session gives the exact text ("#= <JSON string>").
// 4. The two session parsers (sessions.mjs here, Sessions.java in the drivers) must agree on every entry's lines.
import { execFile } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scratchpadDir } from "../../../web/test/jshell-node.mjs";
import { annotatedSession } from "./sessions.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const front = path.resolve(here, "..");
const root = path.resolve(front, "../..");
const work = path.join(root, "runtime/.work");
const USAGE = "usage: node runtime/jshell/test/check.mjs [--native | --browser chromium|webkit|firefox] [--sessions a,b] [--keep] " +
  "[--scratchpad DIR]\n  DIR: a built site's scratchpad/, holding manifest.json (default: a fixture site harness.buildSite builds)";
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (["--browser", "--sessions", "--scratchpad"].includes(args[i]) && i + 1 < args.length) i++;
  else if (args[i] !== "--native" && args[i] !== "--keep") { console.log(USAGE); process.exit(2); }
}
const option = (name) => { const i = args.indexOf(name); return i < 0 ? null : args[i + 1]; };
const native = args.includes("--native");
const browserName = option("--browser");
if (browserName && native) { console.error("--native and --browser exclude each other"); process.exit(2); }
if (browserName && !["chromium", "webkit", "firefox"].includes(browserName)) { console.log(USAGE); process.exit(2); }
const scratchpad = scratchpadDir(option("--scratchpad") ? ["--scratchpad", option("--scratchpad")] : [], USAGE, "jshell-check-site");
const bin = path.join(work, "jdk25/jdk-25.0.4.1+1/Contents/Home/bin");
const startup = ["--startup", "DEFAULT_NO_MODULE_IMPORTS", "--startup", path.join(here, "startup-time.jsh")];
// Decision J3: the scratchpad runs in en_US, so every JDK run does too, whatever this machine's locale: the drivers' JVM
// (the local engine and our jar run in it) and the real tool's agent JVM (-R).
const locale = ["-Duser.language=en", "-Duser.country=US"];
const agentLocale = locale.map((o) => "-R" + o);
const started = Date.now();

/** The allowed differences: what each one changes, and why it is allowed. */
const RULES = {
  startup: {
    why: "Decision J1: the scratchpad starts with the ten imports of the real tool's --startup DEFAULT_NO_MODULE_IMPORTS " +
      "and java.time, not import module java.base, which doubles memory per entry on Ristretto. Announced on an entry " +
      "the real tool's plain startup prints differently; the reference already uses the scratchpad's startup.",
  },
  engine: {
    why: "Ristretto can host only an in-process engine, which cannot redefine a loaded class in place. Where that loses " +
      "state (a variable holding an instance is reset, a class's static field starts over) the front end prints what " +
      "happened, the real tool's own text with --execution local, and the entry must equal that run.",
  },
  frames: {
    why: "Ristretto's JDK image is linked with --strip-debug, so a JDK frame has no file or line: the real tool's " +
      "\"(Integer.java:565)\" is \"(Unknown Source)\" there. Only JDK frames; a snippet's own \"(#5:1)\" is unchanged.",
  },
  message: {
    why: "Ristretto's VM words some exception messages itself: a helpful NullPointerException says \"s\" where the JDK " +
      "says \"REPL.$JShell$3.s\", a ClassCastException leaves out the JDK's module and loader clause, a StackOverflowError " +
      "names the method where the JDK gives no message. On the line \"|  Exception <class>\" only the message after the " +
      "class may differ, and on Ristretto it must; the class and every other byte must match.",
  },
  own: {
    why: "The scratchpad's own words, given exactly by the session (\"#=\"): its help (decision J2) and the answer to a " +
      "command it does not offer (U1, DERIVATION.md).",
  },
};

/** frames: every JDK frame location (File.java:N) becomes (Unknown Source). */
function stripFrames(text) {
  return text.replace(/^(\|        at [^\n(]*\()([\w$]+\.java):\d+\)$/gm, "$1Unknown Source)");
}

/** message: the message on the entry's first exception header line, whatever it is, becomes one placeholder. */
const HEADER = /^(\|  Exception [^:\n]+)(: .*)?$/m;
function maskMessage(text) {
  return text.replace(HEADER, "$1: <message>");
}

const read = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
function fail(code, message) { console.error("FAIL: " + message); process.exit(code); }

// 1. Pins
const pins = read(path.join(here, "pins.json"));
const checksums = new Map(fs.readFileSync(path.join(root, "runtime/ristretto/CHECKSUMS"), "utf8").split("\n").filter(Boolean)
  .map((line) => { const m = /^([0-9a-f]{64}) {2}(\S+)$/.exec(line); if (!m) fail(2, `runtime/ristretto/CHECKSUMS: not "<sha256>  <name>": ${line}`); return [m[2], m[1]]; }));
const JAR = "browser-jshell.jar", RISTRETTO = ["worker.js", "jdk.zip", "runner.core.wasm", "runner.core2.wasm", "runner.core3.wasm"];
// Our jar runs from the scratchpad only on Ristretto; --native runs the one built from src/.
if (!native && checksums.get(JAR) !== pins.jar) {
  fail(2, `pin: runtime/ristretto/CHECKSUMS pins ${JAR} as ${checksums.get(JAR)}, test/pins.json as ${pins.jar}: package a ` +
    "scratchpad release with this jar (runtime/ristretto/package.sh) and build the site again");
}
const manifest = read(path.join(scratchpad, "manifest.json")).files ?? {};
for (const name of native ? RISTRETTO : [...RISTRETTO, JAR]) {
  const want = checksums.get(name), file = path.join(scratchpad, name);
  if (!want) fail(2, `pin: runtime/ristretto/CHECKSUMS does not list ${name}`);
  if (!fs.existsSync(file)) fail(2, `pin: ${file} is missing`);
  if (sha(file) !== want) fail(2, `pin: ${name} in ${scratchpad} is ${sha(file)}, runtime/ristretto/CHECKSUMS pins ${want}`);
  if (!native && manifest[name]?.sha256 !== want) fail(2, `pin: ${scratchpad}/manifest.json gives ${name} as ${manifest[name]?.sha256}, pinned ${want}`);
}
const built = await new Promise((resolve) => execFile("sh", [path.join(front, "build.sh")], { maxBuffer: 1 << 24 },
  (err, stdout, stderr) => resolve({ err, stdout, stderr })));
if (built.err) fail(2, "build.sh failed:\n" + built.stderr);
const jar = path.join(work, "jshell/out/browser-jshell.jar");
if (sha(jar) !== pins.jar) fail(2, `pin: the jar built from src/ is ${sha(jar)}, pinned ${pins.jar} (re-pin in test/pins.json if the change is meant)`);
// The sessions are part of the proof: each file, and the J1 startup file, must be the pinned one, and none may be added
// or missing, so the proof cannot shrink or change unnoticed.
const sessionFiles = fs.readdirSync(path.join(here, "sessions")).filter((f) => f.endsWith(".jsh")).sort();
for (const f of sessionFiles) if (!pins.sessions[f]) fail(2, `pin: test/sessions/${f} is not pinned`);
for (const [f, want] of Object.entries(pins.sessions)) {
  const file = f === "startup-time.jsh" ? path.join(here, f) : path.join(here, "sessions", f);
  if (!fs.existsSync(file)) fail(2, `pin: ${f} is missing`);
  if (sha(file) !== want) fail(2, `pin: ${f} is ${sha(file)}, pinned ${want}`);
}
console.log(`pins ok: Ristretto's ${RISTRETTO.length} files (runtime/ristretto/CHECKSUMS), our jar ${pins.jar.slice(0, 16)}...` +
  `${native ? "" : " (in the scratchpad too)"}, ${Object.keys(pins.sessions).length - 1} session files and the startup file`);

// 2. Runs
const classes = path.join(work, "check-classes");
const javac = await new Promise((resolve) => execFile(path.join(bin, "javac"), ["-d", classes,
  ...["Sessions.java", "Json.java", "RealJShell.java", "OurJShell.java"].map((f) => path.join(here, f))], (err, o, e) => resolve(err ? e : null)));
if (javac) fail(2, "compiling the drivers failed:\n" + javac);
const only = option("--sessions")?.split(",");
const sessions = sessionFiles.filter((f) => !only || only.includes(f.replace(/\.jsh$/, "")));
if (!sessions.length) fail(2, "no sessions");
const run = fs.mkdtempSync(path.join(work, "check-"));
const env = { ...process.env };
delete env.JAVA_TOOL_OPTIONS;
// The drivers run inside the run directory, so a command that writes a file (the real tool's /save) writes it there.
const exec = (file, argv, label) => new Promise((resolve, reject) => execFile(file, argv,
  { env, cwd: run, timeout: 1_800_000, maxBuffer: 1 << 26 }, (err, stdout, stderr) => err ? reject(new Error(`${label}: ${err.message}\n${stderr.slice(-1500)}`)) : resolve()));
const jobs = [];
for (const s of sessions) {
  const file = path.join(here, "sessions", s), base = path.join(run, s.replace(/\.jsh$/, ""));
  const real = (out, extra, label) => ({ slow: false, go: () => exec(path.join(bin, "java"), [...locale, "-cp", classes, "RealJShell", file, out, ...agentLocale, ...extra], label) });
  jobs.push(real(base + ".real.json", startup, `${s} real`));
  jobs.push(real(base + ".plain.json", [], `${s} plain`));
  jobs.push(real(base + ".local.json", ["--execution", "local", ...startup], `${s} local`));
  jobs.push(native
    ? { slow: false, go: () => exec(path.join(bin, "java"), [...locale, "-cp", classes, "OurJShell", jar, file, base + ".ours.json"], `${s} ours (native)`) }
    : browserName
    ? { slow: true, go: () => exec(process.execPath, [path.join(here, "browser.mjs"), file, base + ".ours.json", "--browser", browserName, "--scratchpad", scratchpad], `${s} ours (${browserName})`) }
    : { slow: true, go: () => exec(process.execPath, [path.join(here, "ristretto.mjs"), file, base + ".ours.json", "--scratchpad", scratchpad], `${s} ours (Ristretto)`) });
}
// The Ristretto runs are the long ones: they start first, and the JDK runs fill the other slots.
jobs.sort((a, b) => Number(b.slow) - Number(a.slow));
const width = Math.max(2, Math.min(12, os.availableParallelism() - 4));
let next = 0;
try {
  await Promise.all(Array.from({ length: width }, async () => { while (next < jobs.length) await jobs[next++].go(); }));
} catch (e) { fail(2, e.message + `\n(run directory kept: ${run})`); }

// 3. Compare
const lines = [];
const fired = Object.fromEntries(Object.keys(RULES).map((k) => [k, 0]));
let entries = 0, identical = 0, allowed = 0, failures = 0;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
for (const s of sessions) {
  const name = s.replace(/\.jsh$/, ""), base = path.join(run, name);
  const real = read(base + ".real.json"), plain = read(base + ".plain.json"), local = read(base + ".local.json"), ours = read(base + ".ours.json");
  const spec = annotatedSession(fs.readFileSync(path.join(here, "sessions", s), "utf8"));
  const problem = (where, text) => { failures++; lines.push(`FAIL ${name}${where}: ${text}`); };
  if (spec.length !== real.entries.length || spec.some((e, i) => !same(e.lines, real.entries[i].lines))) problem("", "the session parsers disagree");
  if (ours.ended) problem("", `our session ended early: ${JSON.stringify(ours.ended)}`);
  if (ours.offOrigin?.length) problem("", `requests left the page's origin: ${ours.offOrigin.join(", ")}`);
  if (ours.problems?.length) problem("", `the page reported: ${ours.problems.join("; ")}`);
  if (ours.banner !== real.banner) problem("#banner", `ours ${JSON.stringify(ours.banner)} real ${JSON.stringify(real.banner)}`);
  spec.forEach((entry, i) => {
    entries++;
    const r = real.entries[i], o = ours.entries[i];
    if (!o) { problem(`#${i}`, "no output from our front end"); return; }
    const notes = entry.notes.filter((n) => !n.startsWith("="));
    for (const n of notes) if (!RULES[n]) problem(`#${i}`, `unknown rule "${n}"`);
    let expected = r.out, prompts = r.prompts, between = r.between ?? [];
    if (plain.entries[i].out !== r.out && !notes.includes("startup")) problem(`#${i}`, "the plain startup prints differently here, and \"startup\" is not announced");
    if (notes.includes("startup")) {
      if (plain.entries[i].out === r.out) problem(`#${i}`, "\"startup\" is announced and did not fire"); else fired.startup++;
    }
    if (notes.includes("engine")) {
      if (local.entries[i].out === r.out && same(local.entries[i].prompts, r.prompts)) problem(`#${i}`, "\"engine\" is announced and did not fire");
      else { fired.engine++; expected = local.entries[i].out; prompts = local.entries[i].prompts; between = local.entries[i].between ?? []; }
    }
    if (notes.includes("own")) {
      const own = entry.own;
      if (own === undefined) problem(`#${i}`, "\"own\" is announced without its \"#=\" text");
      else if (own === expected) problem(`#${i}`, "\"own\" is announced and did not fire");
      else { fired.own++; expected = own; between = []; }
    }
    // The VM rules describe Ristretto; with --native our jar runs on the pinned JDK, where they do not apply.
    if (notes.includes("frames")) {
      const t = stripFrames(expected);
      if (t === expected) problem(`#${i}`, "\"frames\" is announced and did not fire");
      else { fired.frames++; if (!native) { expected = t; between = between.map(stripFrames); } }
    }
    let got = o.out, gotBetween = o.between ?? [];
    if (notes.includes("message")) {
      // It fires where the reference has a header and, on Ristretto, where our output differs there and only there.
      if (!HEADER.test(expected) || (!native && (o.out === expected || maskMessage(o.out) !== maskMessage(expected)))) {
        problem(`#${i}`, "\"message\" is announced and did not fire");
      } else {
        fired.message++;
        if (!native) { expected = maskMessage(expected); got = maskMessage(o.out); between = between.map(maskMessage); gotBetween = gotBetween.map(maskMessage); }
      }
    }
    // Each line is its own request, so where output shows inside an entry is part of what the reader sees.
    if (got !== expected || !same(o.prompts, prompts) || !same(gotBetween, between)) {
      problem(`#${i}`, `${JSON.stringify(entry.lines.join(" / ")).slice(0, 120)}${notes.length ? " [" + notes.join(" ") + "]" : ""}\n  expected ${JSON.stringify(expected).slice(0, 1200)}\n  ours     ${JSON.stringify(o.out).slice(0, 1200)}${same(o.prompts, prompts) ? "" : "\n  prompts expected " + JSON.stringify(prompts) + " ours " + JSON.stringify(o.prompts)}${same(gotBetween, between) ? "" : "\n  between lines expected " + JSON.stringify(between) + " ours " + JSON.stringify(gotBetween)}`);
    } else if (o.out === r.out && same(o.prompts, r.prompts) && same(o.between ?? [], r.between ?? [])) identical++;
    else allowed++;
  });
  const tail = real.tail.replace(/\r\n$/, "");
  if (tail !== ours.tail) problem("#tail", `ours ${JSON.stringify(ours.tail)} real ${JSON.stringify(real.tail)}`);
}

const mode = native ? "our jar on the pinned JDK" : browserName ? `our jar on Ristretto in headless ${browserName}, the page's client on a staged page`
  : "our jar on Ristretto under Node, the page's client";
if (!only && entries !== pins.entries) { failures++; lines.push(`FAIL: ${entries} entries, pinned ${pins.entries}`); }
console.log(`${sessions.length} sessions, ${entries} entries (${mode}): ${identical} byte-identical to the real jshell ` +
  "(with the scratchpad's startup, J1), " +
  `${allowed} equal to it after an allowed difference, ${entries - identical - allowed} not; ` +
  `announced and fired: ${Object.entries(fired).map(([k, v]) => `${k} ${v}`).join(", ")}.`);
for (const l of lines) console.log(l);
console.log(`${failures ? "FAIL" : "ok"}: ${failures} failing, ${((Date.now() - started) / 1000).toFixed(1)} s`);
if (!args.includes("--keep") && !failures) fs.rmSync(run, { recursive: true, force: true });
else console.log("run directory: " + run);
process.exitCode = failures ? 1 : 0;
```

- [ ] **Step 5: The sweep follows; the upstream timing goes**

`runtime/jshell/test/rist-sweep.mjs` becomes:
```js
/*
 *  Copyright 2026 Java Foundations contributors.
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
// The Ristretto sweep: every session sweep.mjs ran, now through our jar on Ristretto under Node, compared entry by
// entry with our jar on the pinned JDK (sweep.mjs's cached ours.json). What differs here is what Ristretto's VM and
// image change, which is what the check's VM rules must cover. Run sweep.mjs first. Each run is ristretto.mjs, which
// reads Ristretto's files and our jar from a built site's scratchpad/ (DIR), as the check does.
// usage: node rist-sweep.mjs --scratchpad DIR [PARALLEL]
// Exit 0 when Ristretto prints every entry as the pinned JDK does; 1 when an entry differs, a session ended early or
// failed to run, or there was nothing to compare (sweep.mjs has not run); 2 on misuse.
import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const front = path.resolve(here, "..");
const work = path.resolve(front, "../.work");
const cache = path.join(work, "sweep");
const args = process.argv.slice(2);
if (args[0] !== "--scratchpad" || !args[1] || args.length > 3) { console.error("usage: node rist-sweep.mjs --scratchpad DIR [PARALLEL]"); process.exit(2); }
const scratchpad = args[1];
const width = Number(args[2] ?? 8);
const sources = new Map();
for (const dir of [path.join(front, "derive/probes"), path.join(here, "sessions")]) {
  for (const f of fs.readdirSync(dir)) if (f.endsWith(".jsh")) sources.set(f.replace(/\.jsh$/, ""), path.join(dir, f));
}
const runs = (fs.existsSync(cache) ? fs.readdirSync(cache) : []).filter((d) => fs.existsSync(path.join(cache, d, "ours.json")))
  .map((d) => ({ dir: path.join(cache, d), session: sources.get(d.replace(/-[0-9a-f]{16}$/, "")) })).filter((r) => r.session);

const node = (args) => new Promise((resolve) => execFile(process.execPath, args, { timeout: 1_800_000, maxBuffer: 1 << 26 },
  (err, stdout, stderr) => resolve({ err, stderr })));
let next = 0;
const results = [];
await Promise.all(Array.from({ length: width }, async () => {
  while (next < runs.length) {
    const r = runs[next++];
    const out = path.join(r.dir, "rist.json");
    if (!fs.existsSync(out)) {
      const { err, stderr } = await node([path.join(here, "ristretto.mjs"), r.session, out, "--scratchpad", scratchpad]);
      if (err) { results.push({ r, failed: stderr.slice(-500) }); continue; }
    }
    results.push({ r });
  }
}));
const lines = [];
let entries = 0, differ = 0, ended = 0;
for (const { r, failed } of results.sort((a, b) => a.r.dir.localeCompare(b.r.dir, "en", { numeric: true }))) {
  const name = path.basename(r.dir).replace(/-[0-9a-f]{16}$/, "");
  if (failed) { lines.push(`FAILED ${name}: ${failed}`); continue; }
  const ours = JSON.parse(fs.readFileSync(path.join(r.dir, "ours.json"), "utf8"));
  const rist = JSON.parse(fs.readFileSync(path.join(r.dir, "rist.json"), "utf8"));
  if (rist.ended) { ended++; lines.push(`ENDED ${name} after ${rist.entries.length} entries: ${JSON.stringify(rist.ended)}`); }
  if (ours.banner !== rist.banner) lines.push(`--- ${name}#banner\n  native ${JSON.stringify(ours.banner)}\n  rist   ${JSON.stringify(rist.banner)}`);
  rist.entries.forEach((e, i) => {
    entries++;
    const o = ours.entries[i];
    if (o.out === e.out && JSON.stringify(o.prompts) === JSON.stringify(e.prompts)) return;
    differ++;
    lines.push(`--- ${name}#${i} ${JSON.stringify(e.lines.join(" / ")).slice(0, 160)}\n  native ${JSON.stringify(o.out).slice(0, 900)}\n  rist   ${JSON.stringify(e.out).slice(0, 900)}`);
  });
}
fs.writeFileSync(path.join(work, "rist-sweep-report.txt"), lines.join("\n") + "\n");
const failed = results.filter((r) => r.failed).length;
console.log(`${results.length} sessions on Ristretto, ${entries} entries: ${differ} differ from native, ${ended} sessions ended early` +
  `${failed ? `, ${failed} failed to run` : ""}. Details: runtime/.work/rist-sweep-report.txt`);
if (!results.length) console.error("FAIL: nothing to compare: run sweep.mjs first (runtime/.work/sweep holds no session it ran)");
process.exitCode = !results.length || failed || ended || differ ? 1 : 0;
```
Then `git rm runtime/jshell/test/measure.mjs` (it timed our front end against Ristretto's own through `ristretto.mjs
--upstream`, which is gone; nothing else runs it).

- [ ] **Step 6: Run every mode**

Every run starts the real jshell only through `RealJShell` (the builder with in-memory persistence), never the binary.
Before the first and after the last, `shasum -a 256 ~/Library/Preferences/com.apple.java.util.prefs.plist`; the hash must
not change (stop if it does).

Run, one after another (the drafting runs, on the final files; each mode without `--scratchpad` builds its fixture site
first, about 1 s):
- `node runtime/jshell/test/check.mjs --native`. Expected: `pins ok: Ristretto's 5 files (runtime/ristretto/CHECKSUMS),
  our jar e5ee02f466698fa0..., 10 session files and the startup file`, then `10 sessions, 562 entries (our jar on the
  pinned JDK): 542 byte-identical to the real jshell (with the scratchpad's startup, J1), 20 equal to it after an allowed
  difference, 0 not; announced and fired: startup 20, engine 4, frames 13, message 4, own 16.` and `ok: 0 failing, 12.2 s`,
  exit 0 (14 s).
- `node runtime/jshell/test/check.mjs`. Expected: the pins line with `(in the scratchpad too)`, then `10 sessions, 562
  entries (our jar on Ristretto under Node, the page's client): 525 byte-identical to the real jshell (with the
  scratchpad's startup, J1), 37 equal to it after an allowed difference, 0 not; announced and fired: startup 20, engine 4,
  frames 13, message 4, own 16.` and `ok: 0 failing, 131.2 s`, exit 0 (132 s). The same counts the front end's own driver
  gave (handoff section 3), now through `JShellSession`: every `/reset`, `/reload`, `@@cancel` and the closing `/exit` of
  the session files go through the client's restart, cancel and ending paths.
- `node runtime/jshell/test/check.mjs --browser chromium`. Expected: `10 sessions, 562 entries (our jar on Ristretto in
  headless chromium, the page's client on a staged page): 525 byte-identical …, 37 equal …, 0 not; …` and `ok: 0 failing,
  118.9 s`, exit 0 (120 s); no request left the origin.
- `node runtime/jshell/test/check.mjs --browser webkit` and `node runtime/jshell/test/check.mjs --browser firefox`, the
  same 562 / 525 / 37 / 0 expected. In drafting only `--sessions startup` ran in WebKit (`1 sessions, 18 entries (our jar
  on Ristretto in headless webkit, the page's client on a staged page): 18 byte-identical …, 0 not; announced and fired:
  startup 11, …`, `ok: 0 failing, 26.0 s`, exit 0) and `--sessions session` in Firefox (`1 sessions, 61 entries (our jar
  on Ristretto in headless firefox, the page's client on a staged page): 45 byte-identical to the real jshell (with the
  scratchpad's startup, J1), 16 equal to it after an allowed difference, 0 not; announced and fired: startup 2, engine 0,
  frames 1, message 0, own 15.`, `ok: 0 failing, 234.1 s`, exit 0: first boot 56.6 s, each `/reset` 14.5 s, each
  `/reload` 14.4 to 23.5 s, nothing off the origin). The front end's own last full runs took 105 s in WebKit and 255 s in
  Firefox. These two full runs are first made at execution, through the client's limits (60 s an entry, 240 s a boot) and
  up to 12 jobs at once, ten of them Firefox instances that each take about a minute to boot alone. If either gives other
  counts: an entry whose output or prompts differ (`FAIL <session>#<n>`) is a finding about that engine (the research found
  Ristretto's output the same in Node and the three browsers): stop, rerun with `--keep`, and report it to the controller
  with the run directory; never announce a difference to make it pass. A session that ended early (`our session ended
  early: {"reason":"timeout"…}` or `failed-to-load`) may be those limits meeting a loaded machine: rerun that session alone
  (`--sessions <name>`) and report both runs and their times; if it ends early alone too, it is a finding. Never raise the
  client's limits for the proof: they are what readers get, and Task 3 holds them at D49's numbers.
- Misuse: `node runtime/jshell/test/check.mjs --site x` prints the usage and exits 2 (an option the check does not know is
  never ignored); so do a `--scratchpad` directory without `manifest.json` and `--browser opera` (Step 7 runs each).
- `node runtime/jshell/test/sweep.mjs runtime/jshell/test/sessions/startup.jsh`, then `node
  runtime/jshell/test/rist-sweep.mjs --scratchpad build/.work/jshell-check-site/site/scratchpad 2`. Expected: `1 sessions, 18 entries: 0 differ, 0 equal the local engine's output, 0 unstable in the real tool; 0 sessions failed. …`
  (2 s), then `1 sessions on Ristretto, 18 entries: 0 differ from native, 0 sessions ended early. Details:
  runtime/.work/rist-sweep-report.txt`, exit 0 (31 s); `node runtime/jshell/test/rist-sweep.mjs` alone prints its
  usage and exits 2. The sweep fails when it finds anything, so break it three ways, each on the files the run above
  cached (it reuses its `rist.json`, so no Ristretto run), restoring each before the next: one entry of the cached
  `ours.json` (`runtime/.work/sweep/startup-<hash>/`) changed, exit 1, `1 sessions on Ristretto, 18 entries: 1 differ from native, 0 sessions ended early. …`; the cached `rist.json` given an
  `ended`, exit 1, `1 sessions on Ristretto, 18 entries: 0 differ from native, 1 sessions ended early. …`; `runtime/.work/sweep/` moved aside, exit 1, `0 sessions on Ristretto, 0 entries: 0 differ from native, 0 sessions ended early. …` and on stderr
  `FAIL: nothing to compare: run sweep.mjs first (runtime/.work/sweep holds no session it ran)`. Restored, it exits 0
  again.

The plist's hash was `8b2b34e1…` before the first run and after every one.

- [ ] **Step 7: Prove every gate by breaking it**

`runtime/jshell/test/breaks.mjs` becomes (each break on a copy of `runtime/jshell`, `web/` and `runtime/ristretto/CHECKSUMS`,
the scratchpad copied for real whenever a break changes it, the originals hashed again after every break):
```js
/*
 *  Copyright 2026 Java Foundations contributors.
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
// Proves each gate of test/check.mjs by breaking one thing on purpose and checking that the proof fails with the
// expected exit code and message. Every break runs on a copy under runtime/.work/breaks/<name>/ of runtime/jshell, web/
// (the page's client, which the check drives) and runtime/ristretto/CHECKSUMS, with a .work of its own (its jar, run
// directories and classes), linking only the JDK, which it reads; the working tree is never edited. Every break reads
// one built site's scratchpad/ (--scratchpad, or a fixture site this script builds), and a break that changes the
// scratchpad's bytes works on a real copy of it, never through a link. After every break the pinned originals (the
// scratchpad's six files and the working tree's jar) are hashed again, and the run stops loudly if one moved.
// usage: node breaks.mjs [--only name,name] [--skip-slow] [--scratchpad DIR]
// The slow breaks run Ristretto (a minute or two) or a browser.
import { execFile, execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scratchpadDir } from "../../../web/test/jshell-node.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const front = path.resolve(here, "..");
const repo = path.resolve(front, "../..");
const work = path.resolve(front, "../.work");
const args = process.argv.slice(2);
const option = (name) => { const i = args.indexOf(name); return i < 0 ? null : args[i + 1]; };
const only = option("--only")?.split(",") ?? null;
const skipSlow = args.includes("--skip-slow");
const site = scratchpadDir(option("--scratchpad") ? ["--scratchpad", option("--scratchpad")] : [],
  "usage: node runtime/jshell/test/breaks.mjs [--only name,name] [--skip-slow] [--scratchpad DIR]", "jshell-breaks-site");

/** A fresh copy of the code under test, laid out as the repository is, with a .work of its own (the JDK linked). */
function copy(name) {
  const root = path.join(work, "breaks", name);
  fs.rmSync(root, { recursive: true, force: true });
  fs.mkdirSync(path.join(root, "runtime/.work"), { recursive: true });
  fs.mkdirSync(path.join(root, "runtime/ristretto"));
  fs.cpSync(front, path.join(root, "runtime/jshell"), { recursive: true });
  fs.cpSync(path.join(repo, "web"), path.join(root, "web"), { recursive: true });
  fs.copyFileSync(path.join(repo, "runtime/ristretto/CHECKSUMS"), path.join(root, "runtime/ristretto/CHECKSUMS"));
  fs.symlinkSync(path.join(work, "jdk25"), path.join(root, "runtime/.work/jdk25"));
  return path.join(root, "runtime/jshell");
}
/** A real copy of the scratchpad beside the code copy (dereferenced: a change to it must never reach the original). */
function scratchpadCopy(dir) {
  const copied = path.join(path.dirname(path.dirname(dir)), "scratchpad");
  fs.cpSync(site, copied, { recursive: true, dereference: true });
  return copied;
}
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const pins = JSON.parse(fs.readFileSync(path.join(here, "pins.json"), "utf8"));
const checksums = new Map(fs.readFileSync(path.join(repo, "runtime/ristretto/CHECKSUMS"), "utf8").split("\n").filter(Boolean)
  .map((line) => line.split("  ").reverse()));
const realJar = path.join(work, "jshell/out/browser-jshell.jar");
const SIX = ["worker.js", "jdk.zip", "runner.core.wasm", "runner.core2.wasm", "runner.core3.wasm", "browser-jshell.jar"];
/** The pinned originals that a break must never touch: the scratchpad's six files and the working tree's jar. */
function originalsIntact() {
  for (const name of SIX) {
    const got = sha(path.join(site, name));
    if (got !== checksums.get(name)) return `the scratchpad's ${name} is ${got}, pinned ${checksums.get(name)}`;
  }
  if (sha(realJar) !== pins.jar) return `the working tree's jar is ${sha(realJar)}, pinned ${pins.jar}`;
  return null;
}
const edit = (file, from, to) => {
  const text = fs.readFileSync(file, "utf8");
  if (!text.includes(from)) throw new Error(`${file}: "${from}" not found`);
  if (text.indexOf(from) !== text.lastIndexOf(from)) throw new Error(`${file}: "${from}" is not unique`);
  fs.writeFileSync(file, text.replace(from, to));
};
/** Re-pins the copy (its jar, sessions and entry count), so a change gets past the pins to the comparison. */
function repin(dir) {
  execFileSync(process.execPath, [path.join(dir, "test/pin.mjs")], { stdio: "ignore" });
}
/**
 * What a release and a site build do with a re-pinned jar, for a break that runs it on Ristretto: a scratchpad copy
 * holding the copy's jar, its manifest.json entry and the copy's runtime/ristretto/CHECKSUMS line rewritten to match.
 */
function restage(dir) {
  const staged = scratchpadCopy(dir), jar = path.resolve(dir, "../.work/jshell/out/browser-jshell.jar");
  fs.copyFileSync(jar, path.join(staged, "browser-jshell.jar"));
  const manifest = JSON.parse(fs.readFileSync(path.join(staged, "manifest.json"), "utf8"));
  manifest.files["browser-jshell.jar"] = { sha256: sha(jar), size: fs.statSync(jar).size };
  fs.writeFileSync(path.join(staged, "manifest.json"), JSON.stringify(manifest));
  const sums = path.resolve(dir, "../ristretto/CHECKSUMS");
  fs.writeFileSync(sums, fs.readFileSync(sums, "utf8").replace(/^[0-9a-f]{64}(  browser-jshell\.jar)$/m, `${sha(jar)}$1`));
  return ["--scratchpad", staged];
}
// Another port of 127.0.0.1 is another origin. The off-origin break aims its request here, and it counts only if the
// request never arrives: the check must record it and abort it, never send it.
const canary = { hits: 0 };
const canaryServer = http.createServer((req, res) => { canary.hits++; res.end(); });
await new Promise((resolve) => canaryServer.listen(0, "127.0.0.1", resolve));
canary.url = `http://127.0.0.1:${canaryServer.address().port}/off-origin`;

const BREAKS = [
  { name: "zip-byte", why: "one byte of the scratchpad's jdk.zip changed", expect: 2, message: "pin: jdk.zip in",
    setup(dir) {
      const copied = scratchpadCopy(dir);
      const zip = path.join(copied, "jdk.zip");
      const b = fs.readFileSync(zip); b[1000] ^= 1; fs.writeFileSync(zip, b);
      return ["--native", "--sessions", "startup", "--scratchpad", copied];
    } },
  { name: "jar-change", why: "the front end's source changed without re-pinning the jar", expect: 2, message: "pin: the jar built from src/",
    setup(dir) {
      edit(path.join(dir, "src/foundations/scratchpad/Commands.java"), "|  Resetting state.\\n", "|  Resetting state!\\n");
      return ["--native", "--sessions", "startup"];
    } },
  { name: "session-unpinned", why: "one character of a session file changed without re-pinning", expect: 2, message: "pin: commands.jsh is",
    setup(dir) {
      edit(path.join(dir, "test/sessions/commands.jsh"), "\nint x = 5\n", "\nint x = 6\n");
      return ["--native", "--sessions", "startup"];
    } },
  { name: "session-removed", why: "a session file deleted and the rest re-pinned, so only the entry count can see it", expect: 1, message: "entries, pinned",
    setup(dir) {
      const pins = JSON.parse(fs.readFileSync(path.join(dir, "test/pins.json"), "utf8"));
      fs.rmSync(path.join(dir, "test/sessions/input.jsh"));
      repin(dir);
      const repinned = JSON.parse(fs.readFileSync(path.join(dir, "test/pins.json"), "utf8"));
      repinned.entries = pins.entries; // the count stays as it was: the proof must notice the missing entries
      fs.writeFileSync(path.join(dir, "test/pins.json"), JSON.stringify(repinned, null, 1));
      return ["--native"];
    } },
  { name: "front-end-regression", why: "the front end prints one byte differently (re-pinned, so the comparison must catch it)", expect: 1,
    message: "FAIL session#20: \"/reset\"",
    setup(dir) {
      edit(path.join(dir, "src/foundations/scratchpad/Commands.java"), "|  Resetting state.\\n", "|  Resetting state!\\n");
      repin(dir);
      return ["--native", "--sessions", "session"];
    } },
  { name: "between-dropped", why: "our side stops recording what shows between the lines of an entry", expect: 1, message: "between lines expected",
    setup(dir) {
      edit(path.join(dir, "test/OurJShell.java"), "if (i < entry.size() - 1 && !text.isEmpty()) between.add(text);", "");
      return ["--native", "--sessions", "input"];
    } },
  { name: "cancel-keeps-exit", why: "a cancel no longer forgets an /exit argument being typed (the review's F3)", expect: 1,
    message: "FAIL input#36: \"2 + 3\"",
    setup(dir) {
      edit(path.join(dir, "src/foundations/scratchpad/Shell.java"), "  void forget() {\n    pending = \"\";\n    exiting = false;\n",
        "  void forget() {\n    pending = \"\";\n");
      repin(dir);
      return ["--native", "--sessions", "input"];
    } },
  { name: "no-scratchpad", why: "--scratchpad names a directory with no manifest.json", expect: 2, message: "usage: node runtime/jshell/test/check.mjs",
    setup(dir) {
      return ["--native", "--sessions", "startup", "--scratchpad", path.join(path.dirname(dir), "no-scratchpad")];
    } },
  { name: "old-option", why: "the proof's old --site option, which must be refused, never ignored", expect: 2, message: "usage: node runtime/jshell/test/check.mjs",
    setup(dir) {
      return ["--native", "--sessions", "startup", "--site", site];
    } },
  { name: "bad-browser", why: "--browser names an engine the check does not run", expect: 2, message: "usage: node runtime/jshell/test/check.mjs",
    setup(dir) {
      return ["--browser", "opera", "--sessions", "startup"];
    } },
  { name: "native-and-browser", why: "--native and --browser together", expect: 2, message: "--native and --browser exclude each other",
    setup(dir) {
      return ["--native", "--browser", "chromium", "--sessions", "startup"];
    } },
  { name: "checksums-malformed", why: "a line of runtime/ristretto/CHECKSUMS that is not \"<sha256>  <name>\"", expect: 2,
    message: "runtime/ristretto/CHECKSUMS: not",
    setup(dir) {
      const sums = path.resolve(dir, "../ristretto/CHECKSUMS");
      fs.writeFileSync(sums, fs.readFileSync(sums, "utf8").replace(/^([0-9a-f]{64})  (jdk\.zip)$/m, "$1 $2"));
      return ["--native", "--sessions", "startup"];
    } },
  { name: "checksums-unlisted", why: "runtime/ristretto/CHECKSUMS without its jdk.zip line", expect: 2,
    message: "pin: runtime/ristretto/CHECKSUMS does not list jdk.zip",
    setup(dir) {
      const sums = path.resolve(dir, "../ristretto/CHECKSUMS");
      fs.writeFileSync(sums, fs.readFileSync(sums, "utf8").replace(/^[0-9a-f]{64}  jdk\.zip\n/m, ""));
      return ["--native", "--sessions", "startup"];
    } },
  { name: "scratchpad-file-missing", why: "the scratchpad without worker.js", expect: 2, message: "worker.js is missing",
    setup(dir) {
      const copied = scratchpadCopy(dir);
      fs.rmSync(path.join(copied, "worker.js"));
      return ["--native", "--sessions", "startup", "--scratchpad", copied];
    } },
  { name: "banner", why: "the banner printed one character differently", expect: 1, message: "FAIL startup#banner",
    setup(dir) {
      edit(path.join(dir, "src/foundations/scratchpad/Shell.java"), "|  Welcome to JShell -- Version ", "|  Welcome to JShell - Version ");
      repin(dir);
      return ["--native", "--sessions", "startup"];
    } },
  { name: "parsers-disagree", why: "the Node parser reads \"@@blank\" differently from the Java one", expect: 1, message: "the session parsers disagree",
    setup(dir) {
      edit(path.join(dir, "test/sessions.mjs"), 'lines.push(line === "@@blank" ? "" :', 'lines.push(line === "@@blank" ? " " :');
      return ["--native", "--sessions", "input"];
    } },
  { name: "stray-engine", why: "\"#! engine\" on an entry the local engine prints the same", expect: 1, message: "FAIL commands#2: \"engine\" is announced and did not fire",
    setup(dir) {
      edit(path.join(dir, "test/sessions/commands.jsh"), "\nint x = 5\n", "\n#! engine\nint x = 5\n");
      repin(dir);
      return ["--native", "--sessions", "commands"];
    } },
  { name: "stray-startup", why: "\"#! startup\" on an entry the plain startup prints the same", expect: 1, message: "FAIL commands#2: \"startup\" is announced and did not fire",
    setup(dir) {
      edit(path.join(dir, "test/sessions/commands.jsh"), "\nint x = 5\n", "\n#! startup\nint x = 5\n");
      repin(dir);
      return ["--native", "--sessions", "commands"];
    } },
  { name: "stray-own", why: "a \"#=\" text equal to what the real tool prints", expect: 1, message: "FAIL commands#2: \"own\" is announced and did not fire",
    setup(dir) {
      edit(path.join(dir, "test/sessions/commands.jsh"), "\nint x = 5\n", "\n#= \"x ==> 5\\n\"\nint x = 5\n");
      repin(dir);
      return ["--native", "--sessions", "commands"];
    } },
  { name: "removed-startup", why: "an entry the J1 startup changes, its \"#! startup\" removed", expect: 1, message: "\"startup\" is not announced",
    setup(dir) {
      edit(path.join(dir, "test/sessions/commands.jsh"), "#! startup\n/imports\n", "/imports\n");
      repin(dir);
      return ["--native", "--sessions", "commands"];
    } },
  { name: "removed-engine", why: "a redefinition that loses state, its \"#! engine\" removed", expect: 1, message: "FAIL declarations#48: \"class Box",
    setup(dir) {
      edit(path.join(dir, "test/sessions/declarations.jsh"), "#! engine\nclass Box { int v = 2;", "class Box { int v = 2;");
      repin(dir);
      return ["--native", "--sessions", "declarations"];
    } },
  { name: "stray-annotation", why: "\"#! frames\" on an entry with no JDK frame", expect: 1, message: "\"frames\" is announced and did not fire",
    setup(dir) {
      edit(path.join(dir, "test/sessions/commands.jsh"), "\nint x = 5\n", "\n#! frames\nint x = 5\n");
      repin(dir);
      return ["--native", "--sessions", "commands"];
    } },
  { name: "changed-own-text", why: "one character of a \"#=\" text changed", expect: 1, message: "FAIL session#45: \"/help nosuch\" [own]",
    setup(dir) {
      edit(path.join(dir, "test/sessions/session.jsh"), "The scratchpad has no help on nosuch.", "The scratchpad has no help on nosuch!");
      repin(dir);
      return ["--native", "--sessions", "session"];
    } },
  { name: "stale-release", why: "on Ristretto, a re-pinned front end the scratchpad release does not carry yet", expect: 2,
    message: "pin: runtime/ristretto/CHECKSUMS pins browser-jshell.jar as",
    setup(dir) {
      edit(path.join(dir, "src/foundations/scratchpad/Commands.java"), "|  Resetting state.\\n", "|  Resetting state!\\n");
      repin(dir);
      return ["--sessions", "startup"];
    } },
  { name: "scratchpad-jar-byte", why: "on Ristretto, one byte of the scratchpad's jar changed", expect: 2, message: "pin: browser-jshell.jar in",
    setup(dir) {
      const copied = scratchpadCopy(dir);
      const jar = path.join(copied, "browser-jshell.jar");
      const b = fs.readFileSync(jar); b[1000] ^= 1; fs.writeFileSync(jar, b);
      return ["--sessions", "startup", "--scratchpad", copied];
    } },
  { name: "manifest-disagrees", why: "on Ristretto, manifest.json gives the client another hash for jdk.zip", expect: 2,
    message: "manifest.json gives jdk.zip as 0000",
    setup(dir) {
      const copied = scratchpadCopy(dir);
      const manifest = JSON.parse(fs.readFileSync(path.join(copied, "manifest.json"), "utf8"));
      manifest.files["jdk.zip"].sha256 = "0".repeat(64);
      fs.writeFileSync(path.join(copied, "manifest.json"), JSON.stringify(manifest));
      return ["--sessions", "startup", "--scratchpad", copied];
    } },
  { name: "removed-frames-ristretto", slow: true, why: "on Ristretto, course entry 35's \"#! frames\" removed", expect: 1, message: "FAIL course#35",
    setup(dir) {
      edit(path.join(dir, "test/sessions/course.jsh"), "#! frames\nInteger.parseInt(\"abc\")", "Integer.parseInt(\"abc\")");
      repin(dir);
      return ["--sessions", "course"];
    } },
  { name: "stray-message-ristretto", slow: true, why: "on Ristretto, \"#! message\" on an exception whose message Ristretto words as the JDK does",
    expect: 1, message: "\"message\" is announced and did not fire",
    setup(dir) {
      edit(path.join(dir, "test/sessions/exceptions.jsh"), "\nthrow new RuntimeException(\"outer\"", "\n#! message\nthrow new RuntimeException(\"outer\"");
      repin(dir);
      return ["--sessions", "exceptions"];
    } },
  { name: "missing-prompt-ristretto", slow: true, why: "on Ristretto, our answers stop carrying the next prompt (the review's F9)",
    expect: 1, message: "prompts expected",
    setup(dir) {
      edit(path.join(dir, "src/foundations/scratchpad/Session.java"), ',\\"reset\\":false,\\"prompt\\":"', ',\\"reset\\":false,\\"noprompt\\":"');
      repin(dir);
      return ["--sessions", "startup", ...restage(dir)];
    } },
  { name: "removed-message-ristretto", slow: true, why: "on Ristretto, rec(0)'s \"#! message\" removed", expect: 1, message: "FAIL exceptions#49: \"rec(0)\"",
    setup(dir) {
      edit(path.join(dir, "test/sessions/exceptions.jsh"), "#! message\nrec(0)", "rec(0)");
      repin(dir);
      return ["--sessions", "exceptions"];
    } },
  { name: "client-drops-prompt", slow: true, why: "on Ristretto, the page's client stops handing on the front end's prompt", expect: 1,
    message: "prompts expected",
    setup(dir) {
      edit(path.resolve(dir, "../../web/page/jshell-session.mjs"), 'const prompt = typeof m.prompt === "string" ? m.prompt : null;', "const prompt = null;");
      return ["--sessions", "startup"];
    } },
  { name: "client-ends-early", slow: true, why: "on Ristretto, the page's client ends the session (an entry deadline of 1 ms)", expect: 1,
    message: "our session ended early: {\"reason\":\"timeout\"",
    setup(dir) {
      edit(path.resolve(dir, "../../web/page/jshell-session.mjs"), "deadlineMs = 60_000,", "deadlineMs = 1,");
      return ["--sessions", "startup"];
    } },
  { name: "drive-loses-tail", slow: true, why: "on Ristretto, the shared driver stops recording the prompt after the last entry", expect: 1,
    message: "FAIL startup#tail",
    setup(dir) {
      edit(path.join(dir, "test/drive.mjs"), 'result.tail = ended || closed ? "" : prompt;', 'result.tail = "";');
      return ["--sessions", "startup"];
    } },
  { name: "drive-drops-between", slow: true, why: "on Ristretto, the shared driver stops recording what shows between an entry's lines", expect: 1,
    message: "between lines expected",
    setup(dir) {
      edit(path.join(dir, "test/drive.mjs"), "if (i < lines.length - 1 && text) between.push(text);", "");
      return ["--sessions", "input"];
    } },
  { name: "off-origin-browser", slow: true, why: "the staged page fetches from another origin (a local canary that must see nothing)", expect: 1,
    message: `requests left the page's origin: ${canary.url}`,
    setup(dir) {
      edit(path.join(dir, "test/browser/page.mjs"), 'import { drive } from "./drive.mjs";\n',
        `import { drive } from "./drive.mjs";\nawait fetch(${JSON.stringify(canary.url)}).catch(() => {});\n`);
      return ["--browser", "chromium", "--sessions", "startup"];
    },
    after: () => (canary.hits === 0 ? null : `the off-origin request arrived (${canary.hits})`) },
  { name: "page-error-browser", slow: true, why: "the staged page throws", expect: 1, message: "the page reported: page error: staged page fault",
    setup(dir) {
      edit(path.join(dir, "test/browser/page.mjs"), 'import { drive } from "./drive.mjs";\n',
        'import { drive } from "./drive.mjs";\nsetTimeout(() => { throw new Error("staged page fault"); });\n');
      return ["--browser", "chromium", "--sessions", "startup"];
    } },
];

// The working tree's jar must be the pinned one before anything is broken, so every copy starts from the proof as pinned.
execFileSync("sh", [path.join(front, "build.sh")], { stdio: "ignore" });
const before = originalsIntact();
if (before) { console.error(`FAIL: before any break, ${before} (re-pin with test/pin.mjs first)`); process.exit(2); }
const results = [];
for (const b of BREAKS) {
  if (only && !only.includes(b.name)) continue;
  if (skipSlow && b.slow) continue;
  const dir = copy(b.name);
  const argv = b.setup(dir);
  if (!argv.includes("--scratchpad")) argv.push("--scratchpad", site);
  const run = await new Promise((resolve) => execFile(process.execPath, [path.join(dir, "test/check.mjs"), ...argv],
    { maxBuffer: 1 << 26 }, (err, stdout, stderr) => resolve({ code: err ? err.code : 0, text: stdout + stderr })));
  const leaked = b.after?.() ?? null;
  const ok = run.code === b.expect && run.text.includes(b.message) && !leaked;
  const first = leaked ?? run.text.split("\n").find((l) => l.startsWith("FAIL") || l.startsWith("usage")) ?? run.text.split("\n").slice(-3).join(" | ");
  results.push(`${ok ? "ok  " : "BAD "} ${b.name}: ${b.why}; exit ${run.code} (expected ${b.expect}): ${first.slice(0, 160)}`);
  console.log(results[results.length - 1]);
  if (ok) fs.rmSync(path.dirname(path.dirname(dir)), { recursive: true, force: true });
  const moved = originalsIntact();
  if (moved) { console.error(`FAIL: after ${b.name}, ${moved}; stopped, restore it before anything else`); process.exit(2); }
}
canaryServer.close();
const bad = results.filter((r) => r.startsWith("BAD")).length;
console.log(`${results.length} breaks, ${bad} not caught as expected`);
process.exitCode = bad ? 1 : 0;
```
Run: `node runtime/jshell/test/breaks.mjs` (the plist hashed before and after, as in Step 6).
Expected: `36 breaks, 0 not caught as expected`, exit 0, in about 8 minutes (drafting runs: 478 s, and 523 s on the final files; the 26 fast breaks take
about a minute, then eight Ristretto runs and two in Chromium). Each line is `ok   <name>: <why>; exit <code> (expected
<code>): <the first failing line>`; the run stops with exit 2 if a break moved one of the originals. The front end's 23
breaks keep their gates, with these changes: `zip-byte` now flips a byte of a scratchpad copy (`pin: jdk.zip in …`);
`no-site` becomes `no-scratchpad` (the usage, exit 2); `missing-prompt-ristretto` restages a scratchpad copy with the
re-pinned jar, as a release and a site build would, since the client loads the jar from the scratchpad; the two
off-origin breaks become one (`off-origin-browser`, no CSP any more), which now also requires that the canary on another
127.0.0.1 port received nothing. New: `old-option`, `bad-browser`, `native-and-browser`, `checksums-malformed`,
`checksums-unlisted`, `scratchpad-file-missing`, `stale-release`, `scratchpad-jar-byte`, `manifest-disagrees` (the new
pin and misuse gates); `client-drops-prompt` and `client-ends-early` (the page's own client is what runs);
`drive-loses-tail` and `drive-drops-between` (the shared loop); `page-error-browser` (the page's error gate, which the CSP
break exercised before). As run (hashes and paths shortened):

| Break | What it does | Exit (expected) | The line that shows it |
|---|---|---|---|
| `zip-byte` | one byte of the scratchpad's jdk.zip changed | 2 (2) | `FAIL: pin: jdk.zip in runtime/.work/breaks/zip-byte/scratchpad is 1e7097c1148e75b01ef9c30c0bac9` |
| `jar-change` | the front end's source changed without re-pinning the jar | 2 (2) | `FAIL: pin: the jar built from src/ is 3d97779e…, pinned e5ee02f466698fa0548f9b93299eee22c5f858a058ae61c62` |
| `session-unpinned` | one character of a session file changed without re-pinning | 2 (2) | `FAIL: pin: commands.jsh is 078f8faa…, pinned 72ef3a2ce644c3aff3b3ab2f14bb9a81f3b209a3cddac4413bf89da598d3` |
| `session-removed` | a session file deleted and the rest re-pinned, so only the entry count can see it | 1 (1) | `FAIL: 522 entries, pinned 562` |
| `front-end-regression` | the front end prints one byte differently (re-pinned, so the comparison must catch it) | 1 (1) | `FAIL session#20: "/reset"` |
| `between-dropped` | our side stops recording what shows between the lines of an entry | 1 (1) | `FAIL input#18: "int dv = 10 / / 2"` |
| `cancel-keeps-exit` | a cancel no longer forgets an /exit argument being typed (the review's F3) | 1 (1) | `FAIL input#36: "2 + 3"` |
| `no-scratchpad` | --scratchpad names a directory with no manifest.json | 2 (2) | `usage: node runtime/jshell/test/check.mjs [--native \| --browser chromium\|webkit\|firefox] [--sessions a,b] [--keep] [--scratchpad DIR]` |
| `old-option` | the proof's old --site option, which must be refused, never ignored | 2 (2) | `usage: node runtime/jshell/test/check.mjs [--native \| --browser chromium\|webkit\|firefox] [--sessions a,b] [--keep] [--scratchpad DIR]` |
| `bad-browser` | --browser names an engine the check does not run | 2 (2) | `usage: node runtime/jshell/test/check.mjs [--native \| --browser chromium\|webkit\|firefox] [--sessions a,b] [--keep] [--scratchpad DIR]` |
| `native-and-browser` | --native and --browser together | 2 (2) | `--native and --browser exclude each other` |
| `checksums-malformed` | a line of runtime/ristretto/CHECKSUMS that is not "<sha256>  <name>" | 2 (2) | `FAIL: runtime/ristretto/CHECKSUMS: not "<sha256>  <name>": 31fed6b4… jdk.zip` |
| `checksums-unlisted` | runtime/ristretto/CHECKSUMS without its jdk.zip line | 2 (2) | `FAIL: pin: runtime/ristretto/CHECKSUMS does not list jdk.zip` |
| `scratchpad-file-missing` | the scratchpad without worker.js | 2 (2) | `FAIL: pin: runtime/.work/breaks/scratchpad-file-missing/scratchpad/worker.js is missing` |
| `banner` | the banner printed one character differently | 1 (1) | `FAIL startup#banner: ours "\|  Welcome to JShell - Version 25.0.4.1\n\|  For an introduction type: /help intro\n" real "\|  Welcome to JShell -- Version 25.0.4.1\n` |
| `parsers-disagree` | the Node parser reads "@@blank" differently from the Java one | 1 (1) | `FAIL input: the session parsers disagree` |
| `stray-engine` | "#! engine" on an entry the local engine prints the same | 1 (1) | `FAIL commands#2: "engine" is announced and did not fire` |
| `stray-startup` | "#! startup" on an entry the plain startup prints the same | 1 (1) | `FAIL commands#2: "startup" is announced and did not fire` |
| `stray-own` | a "#=" text equal to what the real tool prints | 1 (1) | `FAIL commands#2: "own" is announced and did not fire` |
| `removed-startup` | an entry the J1 startup changes, its "#! startup" removed | 1 (1) | `FAIL commands#37: the plain startup prints differently here, and "startup" is not announced` |
| `removed-engine` | a redefinition that loses state, its "#! engine" removed | 1 (1) | `FAIL declarations#48: "class Box { int v = 2; public String toString() { return \"Box\" + v; } }"` |
| `stray-annotation` | "#! frames" on an entry with no JDK frame | 1 (1) | `FAIL commands#2: "frames" is announced and did not fire` |
| `changed-own-text` | one character of a "#=" text changed | 1 (1) | `FAIL session#45: "/help nosuch" [own]` |
| `stale-release` | on Ristretto, a re-pinned front end the scratchpad release does not carry yet | 2 (2) | `FAIL: pin: runtime/ristretto/CHECKSUMS pins browser-jshell.jar as e5ee02f4…, test/pins.json as 3d97779e24` |
| `scratchpad-jar-byte` | on Ristretto, one byte of the scratchpad's jar changed | 2 (2) | `FAIL: pin: browser-jshell.jar in runtime/.work/breaks/scratchpad-jar-byte/scratchpad is a836703` |
| `manifest-disagrees` | on Ristretto, manifest.json gives the client another hash for jdk.zip | 2 (2) | `FAIL: pin: runtime/.work/breaks/manifest-disagrees/scratchpad/manifest.json gives jdk.zip as 00` |
| `removed-frames-ristretto` | on Ristretto, course entry 35's "#! frames" removed | 1 (1) | `FAIL course#35: "Integer.parseInt(\"abc\")"` |
| `stray-message-ristretto` | on Ristretto, "#! message" on an exception whose message Ristretto words as the JDK does | 1 (1) | `FAIL exceptions#14: "message" is announced and did not fire` |
| `missing-prompt-ristretto` | on Ristretto, our answers stop carrying the next prompt (the review's F9) | 1 (1) | `FAIL startup#0: "/list -start" [startup]` |
| `removed-message-ristretto` | on Ristretto, rec(0)'s "#! message" removed | 1 (1) | `FAIL exceptions#49: "rec(0)"` |
| `client-drops-prompt` | on Ristretto, the page's client stops handing on the front end's prompt | 1 (1) | `FAIL startup#0: "/list -start" [startup]` |
| `client-ends-early` | on Ristretto, the page's client ends the session (an entry deadline of 1 ms) | 1 (1) | `FAIL startup: our session ended early: {"reason":"timeout","words":"This entry ran for 0 seconds without finishing, so it was stopped. The session ended, and it` |
| `drive-loses-tail` | on Ristretto, the shared driver stops recording the prompt after the last entry | 1 (1) | `FAIL startup#tail: ours "" real "\njshell> \r\n"` |
| `drive-drops-between` | on Ristretto, the shared driver stops recording what shows between an entry's lines | 1 (1) | `FAIL input#18: "int dv = 10 / / 2"` |
| `off-origin-browser` | the staged page fetches from another origin (a local canary that must see nothing) | 1 (1) | `FAIL startup: requests left the page's origin: http://127.0.0.1:56845/off-origin` |
| `page-error-browser` | the staged page throws | 1 (1) | `FAIL startup: the page reported: page error: staged page fault` |

- [ ] **Step 8: Commit**

```bash
git add runtime/jshell/test/check.mjs runtime/jshell/test/drive.mjs runtime/jshell/test/ristretto.mjs \
  runtime/jshell/test/browser.mjs runtime/jshell/test/browser/page.mjs runtime/jshell/test/browser/index.html \
  runtime/jshell/test/breaks.mjs runtime/jshell/test/rist-sweep.mjs runtime/jshell/test/pins.json runtime/jshell/test/pin.mjs
git commit
```
(`git rm` already staged `measure.mjs`'s deletion.) The message says that the front end's check is now this plan's one
transcript check (D62) and its "ours" side the page's own client, under Node and in browsers; that Ristretto's hashes live
only in `runtime/ristretto/CHECKSUMS` (and `pin.mjs`'s header says so); exactly what changed in each mode (the list above:
the CSP gone, the off-origin gate's record-and-abort and its canary, `--site`, `--jar`, `--upstream` and `measure.mjs` gone,
per-entry wasm memory dropped and why); that a failed start still reports its timings; that `rist-sweep.mjs` fails when it
finds anything or has nothing to compare; each mode's result and time and the plist's unchanged hash; and every break,
the sweep's three included, with its exit code.

### Task 5: the panel on the page

**Files:**
- Create: `web/page/scratchpad.mjs`, `web/test/scratchpad-panel.mjs`
- Modify: `web/page.html` (the tab and the panel), `web/app.css` (the scratchpad's rules), `web/page/support.mjs`
  (`scratchpadSupport`), `web/app.mjs` (a browser that cannot run the scratchpad gets the tab and the reason),
  `web/page/wire.mjs` (loads the panel apart from the boxes), `build/Pages.java` (`WEB_SCRIPTS` gains
  `page/scratchpad.mjs`, `page/jshell-session.mjs` and `page/compose.mjs`), `build/PagesTest.java`, `web/test/page.mjs`
  (the tab stays hidden where the page's code did not load; a site without the panel's code still runs a box)

**Interfaces:**
- Consumes: Task 2's `site/scratchpad/` (`manifest.json` and the six runtime files), which `harness.buildSite` puts in
  every fixture site it builds (Task 2). Task 3's `JShellSession(base, { deadlineMs, bootDeadlineMs, outputLimitChars,
  outputLimitLines, onOutput, onState, onProgress })`, as Task 3 gives it: `start() -> Promise<{ banner, prompt }>` (the
  banner never reaches `onOutput`), `submit(line) -> Promise<{ status: "ready", continuation, prompt } | { status:
  "ended", reason }>`, `cancel()` (the same result shape), `stop()`, `state`, `endedBy` (`stopped | timeout |
  output-limit | out-of-memory | crashed | exited | failed-to-load`), `endedWords`, and the `onProgress` phases
  `download` (only when the files are not yet in memory), `engine` and `jshell`. `prompt` is the course's front end's
  prompt for the next line, as it gives it: `"\njshell> "` in normal mode (a blank line, then the prompt), `"   ...> "`
  at a continuation, concise's `"jshell> "`, silent's `"-> "` and `">> "`; `null` when an answer carries none. A
  restart line (`/reset` or `/reload`) gets `onProgress("jshell")` inside `submit`, the session already `busy`, and
  nothing after it until the answer (Ristretto's worker starts a fresh VM inside that one request); a restart that has
  not answered by `bootDeadlineMs` (a `/reload` also gets twice its session's entry time) ends `failed-to-load`. Also
  relied on, as Task 3's code does it: the worker is made at `<base>worker.js?v=<the manifest's version>` (the stand-in
  is recognized by that path, its query aside); a limit passed as `undefined` keeps its default; `start()` after an ending starts a new session in a new worker from the files the client already verified.
  From the course's front end, the jar the client composes into `jdk.zip` (D62): it answers every line, commands
  included (`/help` with the course's own help, J2; a command it does not offer, or does not know, in its own words);
  its feedback, errors and traces arrive on stdout, and only a program's own `System.err` on stderr; `/exit` answers
  `closed` with an empty prompt.
- Produces: `web/page.html`'s `button.scratch-tab[hidden]` and `section#scratchpad.scratchpad[hidden][data-state=shut]`
  (a header with `.scratch-title`, `.scratch-cancel`, `.scratch-stop`, `.scratch-new`, `.scratch-close`; `p.scratch-about`;
  `pre.transcript[role=log]`; `p.scratch-note`; `.entry` with an empty `.caret` and a `textarea[readonly][wrap=off]`), on
  every page the template renders.
- Produces: `web/page/support.mjs`: `scratchpadSupport() -> { ok, missing }`, synchronous: `javaSupport()`'s missing
  features plus `"WebAssembly SIMD"`, `"WebAssembly bulk memory"` and `"crypto.subtle"`. `javaSupport` is unchanged.
- Produces: `web/app.mjs` sets `document.documentElement.dataset.scratchpad = "unsupported"` (before `data-java`)
  when the browser cannot run the scratchpad, reveals the tab, and makes the panel say why: the page's own `#nojava`
  sentence when Java cannot run at all; a secure-page sentence when `isSecureContext` is false; otherwise a
  scratchpad-only sentence with the minimum versions. The panel then has no input, no about line and no New session.
  Its sheet, like the panel that runs, sets `document.body.dataset.sheet` (`shut`, then `open | shut`) and `--sheet`,
  so the page's end, its Previous and Next links included, still scrolls above it.
- Produces: `web/page/scratchpad.mjs`: `wireScratchpad(panel, tab, base, limits = {})`; `base` is `site/scratchpad/`'s
  URL; `limits` may carry `deadlineMs`, `bootDeadlineMs`, `outputLimitChars`, `outputLimitLines`, passed to the page's
  one `JShellSession`. It reveals the tab and sets `document.documentElement.dataset.scratchpad = "ready"`.
  `panel.dataset.state` is `shut` until the first open, then the session's `loading | ready | busy | ended` whether or
  not the panel shows; `panel.dataset.session` counts the sessions started, from 1; `panel.dataset.ended` is the last
  ending's `endedBy`. `ready`, `ended` and `data-ended` are set only once what precedes them is on screen (a session's
  first `ready` once its banner is, `ended` and `data-ended` once the ending's words are). `document.body.dataset.sheet`
  is `shut` from the wiring on, then `open | shut`. The panel prints `start()`'s banner, echoes each line after the
  prompt the previous answer gave (normal mode's blank line included), and shows that prompt on the caret without its
  blank line or trailing space; it never shows a prompt of its own (an answer with none leaves the caret empty and the
  next echo bare). It answers no command itself: every line goes to the front end, an empty one at a plain prompt
  included (the front end answers it with its prompt, as the transcript check's `@@blank` shows). While a `/reset` or `/reload`
  restarts (the session `busy` when `onProgress("jshell")` comes), the note says "Starting a fresh jshell" with its
  timer and claims no time; the first open keeps the D54 words, Firefox's minute included. At a `...>` continuation, Escape or Ctrl+C (nothing
  selected in the input) or `.scratch-cancel` (shown only then) calls the client's `cancel()`: the transcript shows the
  prompt and what was typed, then `^C`, and the caret is the prompt the cancel's answer gave; New session pressed while
  a cancel is on its way drops the cancel's answer, as it does an entry's. History:
  `localStorage["jf:scratchpad:history"]`, a JSON array of the last 100 entries.
- Produces: `web/page/wire.mjs` loads `scratchpad.mjs` by dynamic import, apart from the boxes' code, unless
  `data-scratchpad` is already `unsupported`, and calls `wireScratchpad(..., new URL("../scratchpad/", import.meta.url),
  window.jfScratchpadLimits)`; it sets `data-java` once the boxes are wired, without waiting for the scratchpad. A fault
  in the scratchpad's code (a file missing from the site, an error while wiring) sets `data-scratchpad = "failed"`, leaves
  the tab hidden and reaches the page's error reporting; the boxes run. `window.jfScratchpadLimits` is a test hook only;
  no page sets it.
- Produces: `Pages.WEB_SCRIPTS` gains `page/scratchpad.mjs`, `page/jshell-session.mjs` and `page/compose.mjs` (Task 3
  publishes none: the panel imports the client, and the client imports `compose.mjs`).
- Produces: `node web/test/scratchpad-panel.mjs [chromium|webkit|firefox]`, exit 0, 1 or 2 as the other browser tests.

The panel is the DOM half; the client (Task 3) owns the session, its download, its words for every ending and its stop
policy, and the course's front end owns what jshell says, its prompts and its commands. Full code is given for
`scratchpad.mjs`, `support.mjs`'s addition, `app.mjs` and `wire.mjs`, where exact behavior matters (batching, trimming,
the order of banner, prompt, echo and output, which line goes to jshell, which ending restarts, what an old browser runs,
how a scratchpad fault is kept from the boxes); the markup and the CSS are given too, since the tests measure them.

- [ ] **Step 1: Write the failing tests**

Add to `build/PagesTest.java`, before `testThePagesScriptsArePublishedByNameAndNothingElseFromWeb`:
```java
  static void testEveryRenderedPageCarriesTheScratchpadHiddenAndShut() throws Exception {
    // The scratchpad is on every page the template renders (Task 5), its tab hidden until web/app.mjs or
    // web/page/scratchpad.mjs decides this browser can show it, and its panel shut: no page opens it by itself (D29).
    Path p = Fixtures.project("pages-scratchpad");
    T.eq(0, Fixtures.build(p).exit(), "build");
    for (String page : new String[] {"00-front-matter", "ch01-first-programs", "99-appendices"}) {
      String html = Files.readString(p.resolve("site/vol-fixture/" + page + ".html"));
      T.check(html.contains("<button class=\"scratch-tab\" type=\"button\" aria-controls=\"scratchpad\" aria-expanded=\"false\" hidden>"),
          page + ": the scratchpad's tab, hidden");
      T.check(html.contains("<section id=\"scratchpad\" class=\"scratchpad\" aria-label=\"jshell scratchpad\" data-state=\"shut\" hidden>"),
          page + ": its panel, shut");
    }
  }
```
and in `testThePagesScriptsArePublishedByNameAndNothingElseFromWeb`, the list of published files becomes:
```java
    for (String f : List.of("app.mjs", "page/support.mjs", "page/wire.mjs", "page/box.mjs", "page/replay.mjs", "page/transcript.mjs",
        "page/check.mjs", "page/scratchpad.mjs", "page/jshell-session.mjs", "page/compose.mjs", "runner/browser-runner.mjs",
        "runner/browser-worker.mjs", "runner/tjava-core.mjs", "runner/worker-protocol.mjs", "runner/java-line.mjs"))
```

`web/test/scratchpad-panel.mjs`. The stand-in is a worker, not a client: it speaks Ristretto's protocol and answers as
the course's front end does (each answer's `prompt` by feedback mode, `/exit` closed with an empty prompt, `/reset` and
`/reload` inside their one request after a delay and with no phase event, an empty line with its prompt and nothing
printed, `/help` and the commands the front end leaves out in its own words), so the real client's download, its checks,
its composing of the front end into `jdk.zip`, its endings and its words all run in the page. Its memory abort is a copy
of what the real worker sent (Task 3's recording). One snippet's cancel answers after a second, so a check can press New
session while a cancel is on its way. Every wait on the page has a wall clock that gives `false`, so a page that stops
answering fails its check.
```js
/*
 *  Copyright 2026 Java Foundations contributors.
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
// The scratchpad's panel in Chromium, WebKit and Firefox, on the page fixture volume, against a stand-in for
// Ristretto's worker running the course's jshell front end: the same requests and events, the front end's prompts
// and words, canned answers at once, no Java. Everything the panel does is checked here in seconds (the real jshell
// takes 10 to 60 seconds to open: web/test/scratchpad.mjs). The client (web/page/jshell-session.mjs) is the real one,
// its download, its checks and its composing of the front end into jdk.zip included: the stand-in replaces only the
// worker. Also: a browser that cannot run the scratchpad is told plainly, nothing of it downloads before the reader
// opens it, and a second page opening it downloads none of jshell's files again.
//   node web/test/scratchpad-panel.mjs [chromium|webkit|firefox]
import fs from "node:fs";
import path from "node:path";
import { REPO, ENGINES, check, done, buildSite, open, workDir } from "./harness.mjs";

const only = process.argv[2];
if (only && !ENGINES[only]) { console.log("usage: node web/test/scratchpad-panel.mjs [chromium|webkit|firefox]"); process.exit(2); }
const site = path.join(buildSite(path.join(REPO, "web/test/vol-page"), "scratchpad-panel-test"), "site");
const PAGE = "vol-page/ch01-run.html";
const MINIMUMS = "Chrome 119, Firefox 120 and Safari 18.2";
const BANNER = "|  Welcome to JShell -- Version 25.0.4.1\n|  For an introduction type: /help intro\n";
// The panel's words for the client's three onProgress phases, in order (D54).
const PHASE_WORDS = ["Downloading jshell (about 24 MB, once) and checking it", "Starting Java",
  "Starting jshell, which takes about 10 seconds in Chrome and Safari and about a minute in Firefox"];
// What the note says while a /reset or /reload restarts jshell: words of its own, the timer, and no time claimed.
const RESTARTING = /^Starting a fresh jshell… \d+ s$/;
// The site with its jshell download cut short by a byte, as a dropped connection leaves it.
const cut = workDir("scratchpad-panel-cut");
fs.cpSync(site, cut, { recursive: true });
fs.truncateSync(path.join(cut, "scratchpad/jdk.zip"), fs.statSync(path.join(cut, "scratchpad/jdk.zip")).size - 1);

// The stand-in, run as the worker's own script: Ristretto's protocol (jshell-session.mjs speaks it), answering as the
// course's front end does (runtime/jshell/src/): every answer carries the prompt for the next line, by feedback mode
// (Mode.java), /exit answers closed with an empty prompt, and the front end answers every command itself. One canned
// answer per line the checks type. "spin" never answers, as an endless loop does, so only terminate() ends it. A boot
// takes BOOT_MS, as jshell's start does; /reset and /reload take RESTART_MS inside their one request, with no phase
// event, as Ristretto's worker starts a fresh VM for them (its lib.rs).
function standIn() {
  let booted = false, values = 0, depth = 0, mode = "normal"; // depth: braces still open, as jshell counts them
  let slowCancel = false; // the open snippet began "int slowCancel() {": its cancel answers after a second
  const PROMPTS = { normal: ["\njshell> ", "   ...> "], concise: ["jshell> ", "   ...> "], silent: ["-> ", ">> "] };
  self.onmessage = ({ data: { request: r, assets } }) => {
    const post = (e) => self.postMessage({ id: r.id, ...e });
    const out = (text, stream = "stdout") => post({ type: "output", stream, text });
    const ready = (continuation = false) => post({ type: "ready", continuation, closed: false, reset: false,
      prompt: PROMPTS[mode][continuation ? 1 : 0] });
    if (!booted) {
      if (!assets || assets.length !== 4) return post({ type: "error", message: "Missing Java runtime assets." });
      booted = true;
      post({ type: "phase", phase: "loading" });
      post({ type: "phase", phase: "evaluating" });
      return setTimeout(() => {
        out("|  Welcome to JShell -- Version 25.0.4.1\n");
        out("|  For an introduction type: /help intro\n");
        ready();
      }, BOOT_MS); // BOOT_MS and RESTART_MS: set where the page makes this worker (STAND_IN)
    }
    if (r.operation === "cancel") { // the front end drops the lines not yet finished
      depth = 0;
      if (slowCancel) { slowCancel = false; return setTimeout(() => ready(), 1000); }
      return ready();
    }
    const s = r.source;
    if (s === "int slowCancel() {") slowCancel = true;
    if (s.trimEnd().endsWith("{")) { depth++; return ready(true); }
    if (s.trim() === "}" && depth) { depth = 0; out("|  created method twice(int)\n"); return ready(); }
    if (depth) return ready(true); // a line typed inside an unfinished snippet joins it, whatever it is
    if (!s.trim()) return ready(); // an empty line: the front end prints nothing and gives its prompt again
    if (s === "2 + 3") { out(`$${++values} ==> 5\n`); return ready(); }
    if (s === "spin") for (;;) { /* an endless loop */ }
    // A loop that prints: Ristretto's worker sends each println as an output event of its own.
    if (s === "flood") { for (let i = 0; i < 16352; i++) out("flood line\n"); return ready(); }
    // A program's own System.err is the only output on stderr: the front end prints its feedback, errors and traces
    // on stdout.
    if (s === 'System.err.println("oops")') { out("oops\n", "stderr"); return ready(); }
    if (/^half \d$/.test(s)) {
      for (let i = 0; i < 900; i++) out(`${s} line ${String(i).padStart(3, "0")} ${"y".repeat(980)}\n`);
      return ready();
    }
    if (s === "over") { for (let i = 0; i < 1100; i++) out("z".repeat(999) + "\n"); return ready(); }
    if (s === "die") return post({ type: "error", message: "unreachable" });
    if (s === "die later") { out("later\n"); ready(); return setTimeout(() => { throw new Error("boom"); }, 100); }
    // Recorded from the real worker (web/test/jshell-session.mjs): memory used up is a Rust abort on stderr, in
    // pieces, then an error.
    if (s === "oom") {
      out("l ==> []\n");
      for (const piece of ["memory allocation of ", "8000000", " bytes failed\n", "note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace\n"]) out(piece, "stderr");
      return post({ type: "error", message: "unreachable" });
    }
    // An answer that carries no prompt, as a front end that gives none would send.
    if (s === "no prompt") { out("echo: no prompt\n"); return post({ type: "ready", continuation: false, closed: false, reset: false }); }
    if (s === "/reset" || s === "/reload") {
      if (s === "/reset") values = 0;
      out(s === "/reset" ? "|  Resetting state.\n" : "|  Restarting and restoring state.\n");
      return setTimeout(() => ready(), RESTART_MS);
    }
    if (s === "/exit") { out("|  Goodbye\n"); return post({ type: "ready", continuation: false, closed: true, reset: false, prompt: "" }); }
    const feedback = /^\/set feedback (normal|concise|silent)$/.exec(s);
    if (feedback) { mode = feedback[1]; if (mode === "normal") out("|  Feedback mode: normal\n"); return ready(); }
    // The front end's own words for the rest (HelpText.java, Commands.java): a line of its help (J2), and what it says
    // of a command it does not offer, or does not know.
    if (s === "/help") { out("|  This is the course's Java scratchpad. Type a piece of Java and press Enter to run it.\n"); return ready(); }
    if (s === "/help intro") { out("|  The scratchpad runs Java one piece at a time: an expression shows its value,\n"); return ready(); }
    const word = s.split(" ")[0];
    if (["/open", "/save", "/edit"].includes(word)) { out(`|  ${word} is not available in this scratchpad. Type /help to see what is.\n`); return ready(); }
    if (word.startsWith("/")) { out(`|  Invalid command: ${word}\n|  Type /help for help.\n`); return ready(); }
    out(`echo: ${s}\n`);
    return ready();
  };
}
// Runs in the page before its own scripts: the scratchpad's worker becomes the stand-in (booting in bootMs, restarting
// in restartMs), and every one of its workers is recorded, with when it was made and when the page terminated it.
// Recorders on the panel: jfAtReady, the transcript at each moment data-state turns ready (a MutationObserver runs
// before any later task or promise callback), and jfAtEnded, the transcript's end at each moment it turns ended;
// jfNotes, each new thing the note says, without its timer, and jfTicks, each new thing it says, timer included.
const STAND_IN = (source, bootMs, restartMs) => {
  const Real = window.Worker;
  const url = URL.createObjectURL(new Blob([`const BOOT_MS = ${bootMs}, RESTART_MS = ${restartMs};\n(${source})();\n`],
    { type: "text/javascript" }));
  window.jfWorkers = [];
  window.Worker = class Worker extends Real {
    constructor(u, options) {
      const ours = /\/scratchpad\/worker\.js(\?|$)/.test(String(u)); // started as worker.js?v=<the manifest's version>
      super(ours ? url : u, options);
      if (ours) window.jfWorkers.push(this.jf = { made: performance.now(), terminated: null });
    }
    terminate() {
      if (this.jf && this.jf.terminated == null) this.jf.terminated = performance.now();
      return super.terminate();
    }
  };
  window.jfAtReady = [];
  window.jfAtEnded = [];
  window.jfNotes = [];
  window.jfTicks = [];
  document.addEventListener("DOMContentLoaded", () => {
    const p = document.getElementById("scratchpad");
    if (!p) return; // Firefox runs this in about:blank too
    const note = p.querySelector(".scratch-note");
    new MutationObserver((records) => {
      const shown = p.querySelector(".transcript").textContent;
      if (p.dataset.state === "ready") window.jfAtReady.push(shown);
      // Each record's value is the next one's old value, the last one's the current value: an ended that a fresh
      // session's loading follows at once is seen too.
      for (const value of records.slice(1).map((r) => r.oldValue).concat(p.dataset.state))
        if (value === "ended") window.jfAtEnded.push(shown.slice(-200));
    }).observe(p, { attributes: true, attributeFilter: ["data-state"], attributeOldValue: true });
    new MutationObserver(() => {
      const said = note.textContent, words = said.replace(/… \d+ s$/, "");
      if (said && said !== window.jfTicks[window.jfTicks.length - 1]) window.jfTicks.push(said);
      if (words && words !== window.jfNotes[window.jfNotes.length - 1]) window.jfNotes.push(words);
    }).observe(note, { childList: true, characterData: true, subtree: true });
  });
};
const standInScript = (bootMs, more = "", restartMs = 1500) =>
  `(${STAND_IN})(${JSON.stringify(String(standIn))}, ${bootMs}, ${restartMs});\n${more}`;
const SCRATCH_URL = /\/scratchpad\//;
// The page sets data-java once its boxes are wired, and data-scratchpad once the scratchpad is (wire.mjs loads it apart
// from the boxes, a moment later) or app.mjs found it cannot run here. Bounded: a page that sets neither fails a check.
const ready = (t) => t.page.waitForFunction(() => document.documentElement.dataset.java && document.documentElement.dataset.scratchpad,
  null, { timeout: 10000 }).catch(() => {});
// A wall clock around every wait on the page, so a page that stops answering fails its check instead of hanging: the
// wait then gives false, as a wait that timed out does.
const within = (ms, p) => Promise.race([p, new Promise((r) => setTimeout(() => r(false), ms))]);
const until = (t, fn, arg, ms = 10000) => within(ms + 2000, t.page.waitForFunction(fn, arg, { timeout: ms }).then(() => true, () => false));

for (const engine of only ? [only] : Object.keys(ENGINES)) {
  console.log(engine);
  let t = await open(engine, site, PAGE, { viewport: { width: 390, height: 844 } }, standInScript(1500));
  const panel = t.page.locator("#scratchpad");
  const tab = t.page.locator(".scratch-tab");
  const input = t.page.locator("#scratchpad .entry textarea");
  const text = async () => (await panel.locator(".transcript").textContent()) ?? "";
  const state = () => panel.getAttribute("data-state");
  const waitState = (want, ms = 10000) => until(t, (w) => w.includes(document.getElementById("scratchpad").dataset.state), want, ms);
  const waitText = (needle, ms = 10000) => until(t, (n) => document.querySelector("#scratchpad .transcript").textContent.includes(n), needle, ms);
  const session = async () => Number(await panel.getAttribute("data-session"));
  const waitSession = (n, ms = 10000) => until(t, (n) => document.getElementById("scratchpad").dataset.session === String(n)
    && document.getElementById("scratchpad").dataset.state === "ready", n, ms);
  const type = async (line) => { await input.fill(line); await input.press("Enter"); };
  await ready(t);

  check(`${engine}: the page wires the scratchpad and shows its tab`,
    await t.page.evaluate(() => document.documentElement.dataset.scratchpad) === "ready" && await tab.isVisible(), null);
  const sheet = await t.page.evaluate(() => document.body.dataset.sheet);
  check(`${engine}: the panel is shut, the page says so, and nothing of the scratchpad has downloaded`,
    await panel.isHidden() && await state() === "shut" && sheet === "shut" && !t.requests.some((u) => SCRATCH_URL.test(u)),
    { state: await state(), sheet, requests: t.requests.filter((u) => SCRATCH_URL.test(u)) });

  await tab.click();
  check(`${engine}: opening starts the load at once, the input read-only and New session hidden`,
    await state() === "loading" && !(await input.isEditable()) && !(await input.isDisabled())
      && await panel.locator(".scratch-new").isHidden(), await state());
  const about = await panel.locator(".scratch-about").isVisible() ? await panel.locator(".scratch-about").textContent() : "";
  check(`${engine}: the panel says what this browser keeps (the 24 MB download, the last 100 entries) and that its wording differs from the JDK's jshell`,
    about.includes("about 24 MB") && about.includes("last 100 entries") && about.includes("worded differently from the JDK's own jshell"), about);
  check(`${engine}: and says up front what Stop costs and how to leave an unfinished line`,
    about.includes("Stop ends an entry that runs too long, and the session with it; at ...>, Cancel drops an unfinished line."), about);
  // The stand-in takes 1.5 s to boot, after the download: the seconds count changes at least once while jshell starts
  // (any 1.5 s holds a whole second, and the note ticks every 250 ms), read from what the note said, not by the clock.
  await waitState(["ready"]);
  const notes = await t.page.evaluate(() => window.jfNotes);
  const ticks = await t.page.evaluate(() => window.jfTicks);
  const secs = (s) => Number((s.match(/(\d+) s$/) ?? [])[1]);
  const counted = ticks.filter((s) => s.startsWith(PHASE_WORDS[2])).map(secs);
  check(`${engine}: while it opens, the panel says what it is doing, phase by phase (D54), Firefox's minute with jshell's`,
    JSON.stringify(notes) === JSON.stringify(PHASE_WORDS), notes);
  check(`${engine}: and counts the seconds`, counted.length >= 2 && counted.every((n, i) => Number.isInteger(n) && (i === 0 || n > counted[i - 1])), ticks);
  const atReady = await t.page.evaluate(() => window.jfAtReady);
  check(`${engine}: jshell's banner shows once, before the panel says ready, and the note goes`,
    (await text()) === BANNER && atReady[0] === BANNER && await panel.locator(".scratch-note").isHidden(), { text: await text(), atReady });
  check(`${engine}: and the caret shows the first prompt the front end gave`, await panel.locator(".caret").textContent() === "jshell>",
    await panel.locator(".caret").textContent());
  const fetched = [...new Set(t.requests.filter((u) => SCRATCH_URL.test(u)).map((u) => u.replace(/.*\/scratchpad\//, "")))].sort();
  check(`${engine}: opening downloaded the manifest and jshell's five files, the course's front end among them`,
    JSON.stringify(fetched) === JSON.stringify(["browser-jshell.jar", "jdk.zip", "manifest.json", "runner.core.wasm", "runner.core2.wasm", "runner.core3.wasm"]), fetched);

  // Ready means the entry's output is on screen (jfAtReady), which web/test/scratchpad.mjs relies on when it reads
  // the transcript. Each line is echoed after the prompt the front end gave for it: in normal mode a blank line, then
  // "jshell> ", as the real tool prints it.
  let before = await text();
  await type("2 + 3");
  await waitText("$1 ==> 5\n");
  check(`${engine}: an entry is echoed after the prompt the front end gave, its blank line included, then jshell's answer`,
    (await text()) === before + "\njshell> 2 + 3\n$1 ==> 5\n", (await text()).slice(before.length));
  const lastReady = await t.page.evaluate(() => window.jfAtReady.pop() ?? "");
  check(`${engine}: and the answer is on screen by the time data-state says ready`, lastReady.endsWith("\njshell> 2 + 3\n$1 ==> 5\n"), lastReady.slice(-80));
  // An empty line at the prompt goes to the front end too, as the transcript check sends one (input.jsh's @@blank): it
  // answers with its prompt, so the transcript shows the prompt and an empty line, as the real tool's terminal does.
  before = await text();
  const readies = await t.page.evaluate(() => window.jfAtReady.length);
  await input.press("Enter");
  const answeredBlank = await until(t, (n) => window.jfAtReady.length > n, readies, 5000);
  check(`${engine}: Enter on an empty line at the prompt sends it to the front end, which answers with its prompt`,
    answeredBlank && (await text()).slice(before.length) === "\njshell> \n" && await panel.locator(".caret").textContent() === "jshell>",
    { answeredBlank, got: (await text()).slice(before.length) });
  before = await text();
  await type("int twice(int n) {");
  await waitState(["ready"]);
  const caretMore = await panel.locator(".caret").textContent();
  await type("return n * 2;");
  await type("}");
  await waitText("created method twice(int)");
  check(`${engine}: an unfinished line continues at ...>, then the prompt comes back`,
    caretMore === "   ...>" && (await text()).slice(before.length) === "\njshell> int twice(int n) {\n   ...> return n * 2;\n   ...> }\n|  created method twice(int)\n"
      && await panel.locator(".caret").textContent() === "jshell>", { caretMore, got: (await text()).slice(before.length) });
  // Shift+Enter makes a new line in the input, and sends nothing; Enter then sends each line as its own request, so
  // the second is jshell's continuation (one request of two lines would get the stand-in's echo instead).
  before = await text();
  await input.fill("int twice(int n) {");
  await input.press("Shift+Enter");
  await input.pressSequentially("}");
  const twoLines = await input.inputValue();
  await t.page.waitForTimeout(300);
  const sentNothing = (await text()) === before && await state() === "ready";
  await input.press("Enter");
  await waitText("created method twice(int)\n", 5000);
  await t.page.waitForTimeout(300);
  check(`${engine}: Shift+Enter adds a line and sends nothing; Enter sends each line as a request of its own`,
    twoLines === "int twice(int n) {\n}" && sentNothing
      && (await text()).slice(before.length) === "\njshell> int twice(int n) {\n   ...> }\n|  created method twice(int)\n", { twoLines, sentNothing, got: (await text()).slice(before.length) });

  // History: Up walks back through what was entered, Down forward, past the newest to an empty input; it is kept
  // in localStorage under a jf: key.
  await input.press("ArrowUp");
  const up1 = await input.inputValue();
  await input.press("ArrowUp");
  const up2 = await input.inputValue();
  await input.press("ArrowDown");
  const down1 = await input.inputValue();
  await input.press("ArrowDown");
  const down2 = await input.inputValue();
  const stored = await t.page.evaluate(() => JSON.parse(localStorage.getItem("jf:scratchpad:history")));
  check(`${engine}: Up and Down walk the history`,
    up1 === "int twice(int n) {\n}" && up2 === "}" && down1 === "int twice(int n) {\n}" && down2 === "", { up1, up2, down1, down2 });
  check(`${engine}: the history is kept in localStorage under jf:scratchpad:history`,
    Array.isArray(stored) && stored[0] === "2 + 3" && stored[stored.length - 1] === "int twice(int n) {\n}", stored);
  // It keeps the last 100 entries.
  for (let i = 1; i <= 105; i++) await type(`entry ${i}`);
  await waitText("echo: entry 105\n");
  const hundred = await t.page.evaluate(() => JSON.parse(localStorage.getItem("jf:scratchpad:history"))) ?? [];
  check(`${engine}: and keeps the last 100 entries`, hundred.length === 100 && hundred[0] === "entry 6" && hundred[99] === "entry 105",
    { length: hundred.length, first: hundred[0], last: hundred[hundred.length - 1] });

  // The panel answers no command itself: each goes to the front end, which answers /help with the course's own help
  // (J2) and a command it does not offer, or does not know, in its own words.
  before = await text();
  for (const line of ["/help", "/help intro", "/open", "/save notes.jsh", "/edit 1"]) await type(line);
  await type("/foo");
  await waitText("Invalid command: /foo\n|  Type /help for help.\n");
  const commands = (await text()).slice(before.length);
  check(`${engine}: the panel answers no command itself: /help, /help intro, /open, /save, /edit and an unknown one each get the front end's words alone`,
    commands === "\njshell> /help\n|  This is the course's Java scratchpad. Type a piece of Java and press Enter to run it.\n"
      + "\njshell> /help intro\n|  The scratchpad runs Java one piece at a time: an expression shows its value,\n"
      + "\njshell> /open\n|  /open is not available in this scratchpad. Type /help to see what is.\n"
      + "\njshell> /save notes.jsh\n|  /save is not available in this scratchpad. Type /help to see what is.\n"
      + "\njshell> /edit 1\n|  /edit is not available in this scratchpad. Type /help to see what is.\n"
      + "\njshell> /foo\n|  Invalid command: /foo\n|  Type /help for help.\n", commands);

  // The prompt is the front end's: each feedback mode has its own, and its own continuation, and the panel echoes
  // each line after the prompt the last answer gave and shows it on the caret.
  const caret = () => panel.locator(".caret").textContent();
  const answered = async (line) => { await type(line); await waitState(["ready"]); };
  before = await text();
  await answered("/set feedback concise");
  const carets = [await caret()];
  await answered("hello");
  await answered("/set feedback silent");
  carets.push(await caret());
  await answered("int twice(int n) {");
  carets.push(await caret());
  await answered("}");
  await answered("/set feedback normal");
  carets.push(await caret());
  const modes = (await text()).slice(before.length);
  check(`${engine}: each line is echoed after the prompt the front end gave last, in each feedback mode and at its continuation, and the caret shows it`,
    modes === "\njshell> /set feedback concise\njshell> hello\necho: hello\njshell> /set feedback silent\n-> int twice(int n) {\n>> }\n"
      + "|  created method twice(int)\n-> /set feedback normal\n|  Feedback mode: normal\n"
      && JSON.stringify(carets) === JSON.stringify(["jshell>", "->", ">>", "jshell>"]), { modes, carets });
  // A front end that gives no prompt gets none made up.
  before = await text();
  await answered("no prompt");
  const bare = await caret();
  await answered("hello");
  check(`${engine}: an answer that gives no prompt gets none made up: the next line is echoed bare, and the caret is empty`,
    (await text()).slice(before.length) === "\njshell> no prompt\necho: no prompt\nhello\necho: hello\n" && bare === "" && await caret() === "jshell>",
    { got: (await text()).slice(before.length), bare });

  // /reset and /reload: Ristretto's worker starts a fresh VM inside the one request (no phase event), and the client
  // says jshell is starting as it sends the line; the panel says a fresh jshell is starting while it waits, with the
  // timer (D54) but not the first open's words, whose times a restart does not take. The real jshell prints no banner
  // after a restart, and neither does the panel.
  for (const [line, said] of [["/reset", "|  Resetting state.\n"], ["/reload", "|  Restarting and restoring state.\n"]]) {
    before = await text();
    await type(line);
    await t.page.waitForTimeout(400);
    const restarting = { state: await state(), note: await panel.locator(".scratch-note").textContent() };
    await waitState(["ready"]);
    check(`${engine}: ${line} says a fresh jshell is starting while it waits, timer and no time claimed, then answers, with no second banner`,
      restarting.state === "busy" && RESTARTING.test(restarting.note)
        && (await text()).slice(before.length) === `\njshell> ${line}\n${said}` && await panel.locator(".scratch-note").isHidden()
        && await caret() === "jshell>", { restarting, got: (await text()).slice(before.length) });
  }

  // The way out of an unfinished snippet, the session kept: Escape, Ctrl+C with nothing selected, or Cancel, which
  // shows only at ...> (a phone has neither key). The front end drops the lines not yet finished; the stand-in counts
  // $1 again since /reset.
  const caretIs = (c) => until(t, (c) => document.querySelector("#scratchpad .caret").textContent === c
    && document.getElementById("scratchpad").dataset.state === "ready", c, 5000);
  const waitEnd = (tail) => until(t, (n) => document.querySelector("#scratchpad .transcript").textContent.endsWith(n), tail, 5000);
  before = await text();
  const cancelAtPrompt = await panel.locator(".scratch-cancel").isHidden();
  await type("int twice(int n) {");
  await caretIs("   ...>");
  const cancelAtMore = await panel.locator(".scratch-cancel").isVisible();
  await input.press("Escape");
  const back1 = await caretIs("jshell>");
  const cancelAfter = await panel.locator(".scratch-cancel").isHidden();
  await type("2 + 3");
  await waitEnd("\njshell> 2 + 3\n$1 ==> 5\n");
  check(`${engine}: at ...> Escape drops the unfinished lines: the caret is jshell> again, and the next entry runs on its own`,
    back1 && (await text()).slice(before.length) === "\njshell> int twice(int n) {\n   ...> ^C\n\njshell> 2 + 3\n$1 ==> 5\n",
    { back1, got: (await text()).slice(before.length) });
  check(`${engine}: Cancel shows at ...>, and only there`, cancelAtPrompt && cancelAtMore && cancelAfter, { cancelAtPrompt, cancelAtMore, cancelAfter });
  before = await text();
  await type("int twice(int n) {");
  await caretIs("   ...>");
  await input.press("Control+c");
  const back2 = await caretIs("jshell>");
  await type("int twice(int n) {");
  await caretIs("   ...>");
  await panel.locator(".scratch-cancel").click({ timeout: 5000 }).catch(() => {});
  const back3 = await caretIs("jshell>");
  await type("2 + 3");
  await waitEnd("\njshell> 2 + 3\n$2 ==> 5\n");
  check(`${engine}: Ctrl+C and the Cancel button drop them too`, back2 && back3 && (await text()).slice(before.length)
    === "\njshell> int twice(int n) {\n   ...> ^C\n\njshell> int twice(int n) {\n   ...> ^C\n\njshell> 2 + 3\n$2 ==> 5\n",
    { back2, back3, got: (await text()).slice(before.length) });

  // By now the transcript is taller than the phone: the sheet still keeps within its width and to 60% of its height,
  // so its header (Stop, New session, Close) stays on screen.
  const fits = await t.page.evaluate(() => {
    const r = document.getElementById("scratchpad").getBoundingClientRect();
    return { top: Math.round(r.top), right: Math.round(r.right), height: Math.round(r.height), innerW: innerWidth, innerH: innerHeight };
  });
  check(`${engine}: the sheet keeps within the phone's width and to 60% of its height`,
    fits.right <= fits.innerW && fits.height <= fits.innerH * 0.6 + 1, fits);
  // And the page behind it still scrolls to its end: the Previous and Next links clear the open sheet.
  const pager = await t.page.evaluate(async () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const n = document.querySelector(".pager"), r = document.getElementById("scratchpad").getBoundingClientRect();
    return { pagerBottom: n ? Math.round(n.getBoundingClientRect().bottom) : null, sheetTop: Math.round(r.top), scrollY: Math.round(scrollY) };
  });
  check(`${engine}: scrolled to its end, the page's Previous and Next links stay above the open sheet`,
    pager.pagerBottom != null && pager.pagerBottom <= pager.sheetTop, pager);

  // A runaway entry: Stop shows while it runs, the input stays read-only (not disabled), and Stop terminates the
  // worker at once; the ending is said in plain words and a fresh session starts by itself (D49).
  const s1 = await session();
  await type("spin");
  await waitState(["busy"]);
  await t.page.waitForTimeout(300);
  const busy = { stop: await panel.locator(".scratch-stop").isVisible(), editable: await input.isEditable(), disabled: await input.isDisabled() };
  const clicked = await t.page.evaluate(() => performance.now());
  await panel.locator(".scratch-stop").click();
  const fresh = await waitSession(s1 + 1);
  const lag = await t.page.evaluate(([k, at]) => window.jfWorkers[k].terminated == null ? null : window.jfWorkers[k].terminated - at, [s1 - 1, clicked]);
  check(`${engine}: while an entry runs, Stop shows and the input is read-only, not disabled`,
    busy.stop && !busy.editable && !busy.disabled, busy);
  check(`${engine}: Stop terminates the worker at once`, lag != null && lag < 1000, lag);
  check(`${engine}: says so in plain words, and a fresh session starts by itself`,
    fresh && (await text()).includes("\njshell> spin\nStopped. The session ended, and its variables and methods are gone.\n" + BANNER)
      && await panel.getAttribute("data-ended") === "stopped" && (await text()).endsWith(BANNER), (await text()).slice(-300));
  check(`${engine}: the fresh session is a new worker`, await t.page.evaluate(() => window.jfWorkers.length) === s1 + 1, await t.page.evaluate(() => window.jfWorkers.length));

  // Everything a session prints reaches the page once per animation frame: 16,352 lines printed by a loop, arriving
  // as 16,352 events at once, are on screen within seconds, and the page stays live.
  before = await text();
  const flooded = Date.now();
  await type("flood");
  const landed = await until(t, (n) => document.getElementById("scratchpad").dataset.state === "ready"
    && document.querySelector("#scratchpad .transcript").textContent.split("flood line\n").length - 1 === n, 16352, 10000);
  const floodMs = Date.now() - flooded;
  check(`${engine}: 16,352 lines printed at once are on screen, whole, within seconds of Enter`,
    landed && floodMs < 10000 && (await text()).slice(before.length).startsWith("\njshell> flood\nflood line\n"), { landed, floodMs });
  // stderr is a program's own System.err (the front end's errors come on stdout), shown in the error style.
  await type('System.err.println("oops")');
  await waitText("oops\n");
  const styled = await t.page.evaluate(() => [...document.querySelectorAll("#scratchpad .transcript .err")].pop()?.textContent ?? null);
  check(`${engine}: a program's System.err shows in the error style`,
    styled === "oops\n" && (await text()).endsWith('\njshell> System.err.println("oops")\noops\n'), { styled, tail: (await text()).slice(-80) });

  // The transcript keeps its newest 2,000,000 characters, from the start of a line: three entries of about 900,000.
  for (const n of [1, 2, 3]) { await type(`half ${n}`); await waitText(`half ${n} line 899 `); }
  await t.page.waitForTimeout(300);
  const kept = await t.page.evaluate(() => {
    const s = document.querySelector("#scratchpad .transcript").textContent;
    return { length: s.length, head: s.slice(0, 20), oldest: s.includes("half 1 line 000 "), newest: s.trimEnd().endsWith("y".repeat(980)) && s.includes("half 3 line 899 ") };
  });
  check(`${engine}: the transcript keeps its newest 2,000,000 characters, from the start of a line`,
    kept.length <= 2_000_000 && kept.length > 1_900_000 && kept.newest && !kept.oldest && /^half 1 line \d{3} /.test(kept.head), kept);

  // The other endings, each in the client's words and never the engine's own; after a cap, memory used up or a
  // crash (in an entry, or between entries, which nothing is waiting on) a fresh session starts by itself, after /exit
  // the reader starts one.
  let s = await session();
  await type("over");
  check(`${engine}: output past the cap ends the session, says why, and a fresh one starts`,
    await waitSession(s + 1) && (await text()).includes("This entry printed more than the scratchpad can show, so it was stopped.")
      && await panel.getAttribute("data-ended") === "output-limit", (await text()).slice(-300));
  s = await session();
  await type("oom");
  check(`${engine}: memory used up ends the session, says so, and a fresh one starts`,
    await waitSession(s + 1) && (await text()).includes("\njshell> oom\nl ==> []\nThis session ran out of memory, so it ended")
      && await panel.getAttribute("data-ended") === "out-of-memory", (await text()).slice(-500));
  s = await session();
  await type("die");
  check(`${engine}: an engine error ends the session in plain words, not the engine's message`,
    await waitSession(s + 1) && (await text()).includes("The scratchpad's Java engine failed.") && !(await text()).includes("unreachable")
      && await panel.getAttribute("data-ended") === "crashed", (await text()).slice(-300));
  s = await session();
  await type("die later");
  check(`${engine}: a worker that fails between entries is said in plain words too, and a fresh session starts`,
    await waitSession(s + 1) && (await text()).includes("\njshell> die later\nlater\nThe scratchpad's Java engine failed.")
      && await panel.getAttribute("data-ended") === "crashed", (await text()).slice(-300));
  s = await session();
  await type("/exit");
  const exited = await waitText("|  Goodbye\nThis session has ended (System.exit or /exit).\n");
  await t.page.waitForTimeout(2500); // an absence: longer than the stand-in's boot, so a session started by itself would be ready
  check(`${engine}: /exit ends the session in plain words, after jshell's goodbye, and no new one starts by itself`,
    exited && await state() === "ended" && await session() === s && await panel.getAttribute("data-ended") === "exited"
      && await input.isEditable(), { exited, state: await state(), session: await session(), tail: (await text()).slice(-200) });
  // Six endings so far (Stop, the cap, memory, the engine twice, /exit): data-state turned ended for each only once the
  // ending's words were on screen (jfAtEnded holds the transcript's end at that moment).
  const atEnded = await t.page.evaluate(() => window.jfAtEnded);
  check(`${engine}: data-state says ended only once the ending's words are on screen`,
    atEnded.length === 6 && atEnded.every((end) => /(are gone\.|fills it up\.|\(System\.exit or \/exit\)\.)\n$/.test(end)), atEnded);
  await type("2 + 3");
  check(`${engine}: Enter after /exit starts a new session and sends the line`,
    await waitSession(s + 1) && await until(t, (b) => document.querySelector("#scratchpad .transcript").textContent
      .endsWith(b + "\njshell> 2 + 3\n$1 ==> 5\n"), BANNER, 5000), (await text()).slice(-200));

  // Closing the panel leaves the session running; New session clears the transcript and starts again.
  await panel.locator(".scratch-close").click();
  const closed = { panel: await panel.isHidden(), tab: await tab.isVisible(), state: await state() };
  await tab.click();
  check(`${engine}: closing shows the tab and keeps the session; reopening shows the same transcript`,
    closed.panel && closed.tab && closed.state === "ready" && (await text()).includes("\njshell> 2 + 3\n$1 ==> 5\n"), closed);
  s = await session();
  await panel.locator(".scratch-new").click();
  check(`${engine}: New session clears the transcript and starts a fresh session`,
    await waitSession(s + 1) && (await text()) === BANNER, (await text()).slice(0, 200));
  // New session pressed while a cancel is on its way (the stand-in answers this snippet's cancel after a second): the
  // stopped cancel's ending is not said in the new transcript, and no second session starts.
  await type("int slowCancel() {");
  await caretIs("   ...>");
  s = await session();
  await input.press("Escape");
  await panel.locator(".scratch-new").click();
  const renewed = await waitSession(s + 1);
  await t.page.waitForTimeout(1500); // an absence: past the slow cancel's second, a second session would be starting
  check(`${engine}: New session pressed while a cancel is on its way starts one fresh session, its transcript jshell's banner alone`,
    renewed && (await text()) === BANNER && await session() === s + 1 && await state() === "ready",
    { renewed, session: await session(), state: await state(), text: (await text()).slice(0, 300) });

  // 390 px with the panel open and a long transcript: nothing scrolls sideways but the transcript and the input, and
  // code never wraps (Ruling 22): a long entry stays one line in the transcript and in the input, each scrolling
  // inside itself. The page's own width cannot see inside a fixed sheet, so the sheet, the transcript's last entry
  // and the input are each measured, and the transcript must actually move when scrolled.
  await type("half 1");
  await waitText("half 1 line 899 ");
  const LONG = `String s = "${"a line wider than a phone held upright ".repeat(4)}"`;
  await type(LONG);
  await waitText(`echo: ${LONG}\n`);
  await input.fill(LONG);
  const wide = await t.page.evaluate(() => {
    const p = document.getElementById("scratchpad"), tr = p.querySelector(".transcript"), ta = p.querySelector(".entry textarea");
    const typed = [...tr.querySelectorAll(".typed")].pop();
    const range = document.createRange();
    range.selectNodeContents(typed);
    const s = getComputedStyle(ta);
    tr.scrollLeft = 100000; // only a transcript that scrolls sideways moves
    return { page: document.documentElement.scrollWidth, innerW: innerWidth, trMoved: tr.scrollLeft > 0,
      sheetW: [p.scrollWidth, p.clientWidth, Math.round(p.getBoundingClientRect().right)],
      typedLines: new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size,
      taLines: Math.round((ta.scrollHeight - parseFloat(s.paddingTop) - parseFloat(s.paddingBottom)) / parseFloat(s.lineHeight)), taScroll: ta.scrollWidth > ta.clientWidth };
  });
  check(`${engine}: at 390 px with the panel open neither the page nor the sheet scrolls sideways`,
    wide.page <= 390 && wide.sheetW[0] <= wide.sheetW[1] && wide.sheetW[2] <= wide.innerW, wide);
  check(`${engine}: a long entry stays one line in the transcript, which scrolls sideways`, wide.typedLines === 1 && wide.trMoved, wide);
  check(`${engine}: and one line in the input, which scrolls sideways`, wide.taLines === 1 && wide.taScroll, wide);
  check(`${engine}: no request left the page's origin`, t.offsite.length === 0, t.offsite);
  check(`${engine}: no page error`, t.errors.length === 0, t.errors);

  // The panel is shut on every page load, the history comes back, and still nothing downloads before an open. Opened,
  // the second page downloads only the manifest: jshell's four files come from Cache Storage, checked again.
  const p2 = await t.context.newPage();
  const p2errors = [];
  p2.on("pageerror", (e) => p2errors.push(String(e)));
  const seen = t.requests.length;
  await p2.goto(`${t.origin}/${PAGE}`);
  await p2.waitForFunction(() => document.documentElement.dataset.java && document.documentElement.dataset.scratchpad, null, { timeout: 10000 })
    .catch(() => {});
  const again = await p2.evaluate(() => ({ hidden: document.getElementById("scratchpad").hidden, state: document.getElementById("scratchpad").dataset.state }));
  check(`${engine}: after a reload the panel is shut and nothing of the scratchpad has downloaded`,
    again.hidden && again.state === "shut" && !t.requests.slice(seen).some((u) => SCRATCH_URL.test(u)), { again, requests: t.requests.slice(seen) });
  const opening = t.requests.length;
  await p2.locator(".scratch-tab").click();
  await p2.waitForFunction(() => document.getElementById("scratchpad").dataset.state === "ready", null, { timeout: 10000 });
  const second = t.requests.slice(opening).filter((u) => SCRATCH_URL.test(u)).map((u) => u.replace(/.*\/scratchpad\//, ""));
  check(`${engine}: and opened there, it downloads only the manifest: jshell's files come from the browser's cache`,
    JSON.stringify(second) === JSON.stringify(["manifest.json"]), second);
  await p2.locator("#scratchpad textarea").press("ArrowUp");
  check(`${engine}: and Up brings back the last entry from before the reload`, await p2.locator("#scratchpad textarea").inputValue() === LONG, await p2.locator("#scratchpad textarea").inputValue());
  check(`${engine}: no page error after the reload`, p2errors.length === 0, p2errors);
  await t.close();

  // The backstop: an entry that runs past the client's deadline (shortened here by the page's test hook) ends in
  // plain words, and a fresh session starts. The hook also shortens the boot deadline, which a /reset gets, below the
  // stand-in's 3 s restart here.
  t = await open(engine, site, PAGE, {}, standInScript(0, "window.jfScratchpadLimits = { deadlineMs: 2000, bootDeadlineMs: 2000 };", 3000));
  await ready(t);
  await t.page.locator(".scratch-tab").click();
  await t.page.waitForFunction(() => document.getElementById("scratchpad").dataset.state === "ready", null, { timeout: 10000 });
  await t.page.locator("#scratchpad textarea").fill("spin");
  await t.page.locator("#scratchpad textarea").press("Enter");
  const backstop = await until(t, () => document.getElementById("scratchpad").dataset.session === "2"
    && document.getElementById("scratchpad").dataset.state === "ready", null, 6000);
  const said = (await t.page.locator("#scratchpad .transcript").textContent()) ?? "";
  check(`${engine}: an entry past the deadline ends the session in plain words, and a fresh one starts`,
    backstop && said.includes("This entry ran for 2 seconds without finishing, so it was stopped.")
      && await t.page.locator("#scratchpad").getAttribute("data-ended") === "timeout", said.slice(-300));
  // A restart that does not answer by its deadline is a failed load: said in the client's words, and no session
  // starts by itself (another restart might not answer either); Enter starts one, from the files already checked.
  // Bounded: an input still read-only (the entry above never ended) fails the checks below, not the script.
  const typeHere = async (line) => {
    await t.page.locator("#scratchpad textarea").fill(line, { timeout: 5000 }).catch(() => {});
    await t.page.locator("#scratchpad textarea").press("Enter", { timeout: 5000 }).catch(() => {});
  };
  await typeHere("/reset");
  const gaveUp = await until(t, () => document.getElementById("scratchpad").dataset.ended === "failed-to-load", null, 6000);
  await t.page.waitForTimeout(1000); // an absence: a session started by itself would be ready by now
  const afterRestart = { gaveUp, state: await t.page.locator("#scratchpad").getAttribute("data-state"),
    session: await t.page.locator("#scratchpad").getAttribute("data-session"),
    tail: ((await t.page.locator("#scratchpad .transcript").textContent()) ?? "").slice(-160) };
  check(`${engine}: a restart that does not answer by its deadline ends in plain words, and no session starts by itself`,
    gaveUp && afterRestart.state === "ended" && afterRestart.session === "2" && afterRestart.tail.endsWith("\njshell> /reset\n|  Resetting state.\n"
      + "The scratchpad could not start: after /reset, jshell did not answer within 2 seconds.\n"), afterRestart);
  await typeHere("2 + 3");
  const resumed = await until(t, () => document.getElementById("scratchpad").dataset.session === "3"
    && document.querySelector("#scratchpad .transcript").textContent.endsWith("\njshell> 2 + 3\n$1 ==> 5\n"), null, 6000);
  check(`${engine}: and Enter starts a new session, downloading nothing again`,
    resumed && t.requests.filter((u) => /\/scratchpad\/jdk\.zip$/.test(u)).length === 1, { resumed, zips: t.requests.filter((u) => /\/scratchpad\/jdk\.zip$/.test(u)).length });
  await t.close();

  // Storage refused (a private window, blocked storage: localStorage and Cache Storage both throw): the panel still
  // works, with no page error, and a fresh session does not download jshell again (the client keeps what it checked).
  t = await open(engine, site, PAGE, {}, standInScript(0, 'for (const m of ["getItem", "setItem", "removeItem"]) ' +
    'Storage.prototype[m] = () => { throw new DOMException("blocked", "SecurityError"); };\n' +
    'for (const m of ["keys", "open", "match", "has", "delete"]) ' +
    'CacheStorage.prototype[m] = () => Promise.reject(new DOMException("blocked", "SecurityError"));'));
  // Bounded: a panel that throws while it is wired never says ready (wire.mjs sets data-scratchpad to "failed"), and
  // must fail here, not hang the script.
  const wired = await until(t, () => document.documentElement.dataset.scratchpad === "ready", null, 10000);
  let ran = false, again2 = false;
  if (wired) {
    await t.page.locator(".scratch-tab").click();
    await until(t, () => document.getElementById("scratchpad").dataset.state === "ready", null, 10000);
    await t.page.locator("#scratchpad textarea").fill("2 + 3");
    await t.page.locator("#scratchpad textarea").press("Enter");
    ran = await until(t, () => document.querySelector("#scratchpad .transcript").textContent.includes("$1 ==> 5"), null, 5000);
    await t.page.locator("#scratchpad textarea").fill("spin");
    await t.page.locator("#scratchpad textarea").press("Enter");
    await until(t, () => document.getElementById("scratchpad").dataset.state === "busy", null, 5000);
    await t.page.locator("#scratchpad .scratch-stop").click();
    again2 = await until(t, () => document.getElementById("scratchpad").dataset.session === "2"
      && document.getElementById("scratchpad").dataset.state === "ready", null, 10000);
  }
  const zips = t.requests.filter((u) => /\/scratchpad\/jdk\.zip$/.test(u)).length;
  check(`${engine}: with storage refused, the panel still runs an entry`, wired && ran, { wired, ran });
  check(`${engine}: and a fresh session after Stop downloads nothing again`, again2 && zips === 1, { again2, zips });
  check(`${engine}: and raises no page error`, t.errors.length === 0, t.errors);
  await t.close();

  // A download cut short is never handed to jshell: the panel says so, no worker is made, and nothing starts again
  // by itself (a download that keeps failing is not fetched again and again).
  t = await open(engine, cut, PAGE, {}, standInScript(0));
  await ready(t);
  await t.page.locator(".scratch-tab").click();
  const failed = await until(t, () => document.getElementById("scratchpad").dataset.ended === "failed-to-load", null, 10000);
  await t.page.waitForTimeout(1000); // an absence: a session started again by itself would have downloaded by now
  const gave = { failed, state: await t.page.locator("#scratchpad").getAttribute("data-state"),
    session: await t.page.locator("#scratchpad").getAttribute("data-session"), workers: await t.page.evaluate(() => window.jfWorkers.length),
    zips: t.requests.filter((u) => /\/scratchpad\/jdk\.zip$/.test(u)).length };
  check(`${engine}: a download cut short ends in plain words, and no worker is made`,
    failed && (await t.page.locator("#scratchpad .transcript").textContent()).includes("The scratchpad could not start: jdk.zip did not download whole.")
      && gave.workers === 0, gave);
  check(`${engine}: and no session starts again by itself`, gave.state === "ended" && gave.session === "1" && gave.zips === 1, gave);
  await t.close();

  // A browser that cannot run Java: the boxes say so (web/test/page.mjs), and so does the scratchpad, plainly,
  // with no input, no New session and nothing downloaded.
  const unsupported = async (label, init, says, java) => {
    t = await open(engine, site, PAGE, {}, init);
    await ready(t);
    const shown = await t.page.locator(".scratch-tab").isVisible();
    if (shown) await t.page.locator(".scratch-tab").click(); // a hidden tab fails the first check below, not the script
    const end = await t.page.evaluate(async () => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const n = document.querySelector(".pager"), r = document.getElementById("scratchpad").getBoundingClientRect();
      return { pagerBottom: n ? Math.round(n.getBoundingClientRect().bottom) : null, sheetTop: Math.round(r.top), sheet: document.body.dataset.sheet };
    });
    const got = { java: await t.page.evaluate(() => document.documentElement.dataset.java),
      scratchpad: await t.page.evaluate(() => document.documentElement.dataset.scratchpad), shown,
      text: await t.page.locator("#scratchpad .transcript").textContent(), entry: await t.page.locator("#scratchpad .entry").isHidden(),
      newSession: await t.page.locator("#scratchpad .scratch-new").isHidden(), about: await t.page.locator("#scratchpad .scratch-about").isHidden() };
    if (shown) await t.page.locator("#scratchpad .scratch-close").click();
    got.closed = await t.page.locator("#scratchpad").isHidden() && await t.page.locator(".scratch-tab").isVisible();
    check(`${engine}: ${label}: the tab shows, and the panel says so plainly`,
      got.java === java && got.scratchpad === "unsupported" && got.shown && got.text.includes(says) && got.closed, got);
    check(`${engine}: ${label}: and offers no input and no New session`, got.entry && got.newSession && got.about, got);
    check(`${engine}: ${label}: and nothing of the scratchpad downloads`, !t.requests.some((u) => SCRATCH_URL.test(u)), t.requests.filter((u) => SCRATCH_URL.test(u)));
    check(`${engine}: ${label}: scrolled to its end, the page's Previous and Next links stay above the sheet`,
      end.pagerBottom != null && end.pagerBottom <= end.sheetTop && end.sheet === "open", end);
    check(`${engine}: ${label}: no page error`, t.errors.length === 0, t.errors);
    await t.close();
  };
  await unsupported("without WasmGC", () => { WebAssembly.validate = () => false; }, MINIMUMS, "unsupported");
  // The boxes run here; only the scratchpad cannot. WebAssembly.validate refuses only a module holding a SIMD
  // instruction (the 0xfd 0x0c of v128.const), which none of javaSupport()'s three modules holds.
  await unsupported("without WebAssembly SIMD", () => {
    const real = WebAssembly.validate;
    WebAssembly.validate = (b) => {
      const a = new Uint8Array(b);
      for (let i = 0; i + 1 < a.length; i++) if (a[i] === 0xfd && a[i + 1] === 0x0c) return false;
      return real(b);
    };
  }, "This browser can't run the scratchpad. It runs in Chrome 119", "ready");
  // And the same for bulk memory: only a module holding memory.fill (0xfc 0x0b) is refused.
  await unsupported("without WebAssembly bulk memory", () => {
    const real = WebAssembly.validate;
    WebAssembly.validate = (b) => {
      const a = new Uint8Array(b);
      for (let i = 0; i + 1 < a.length; i++) if (a[i] === 0xfc && a[i + 1] === 0x0b) return false;
      return real(b);
    };
  }, "This browser can't run the scratchpad. It runs in Chrome 119", "ready");
  await unsupported("on a page that is not secure (no crypto.subtle)", () => {
    Object.defineProperty(window, "isSecureContext", { configurable: true, get: () => false });
    Object.defineProperty(Crypto.prototype, "subtle", { configurable: true, get: () => undefined });
  }, "The scratchpad needs a secure page: an address starting with https://, or localhost.", "ready");
}
done();
```

In `web/test/page.mjs`, in the block for the site whose Run code is missing (after
`` check(`${engine}: and every box that could run says so`, ...) ``) add
```js
  check(`${engine}: and the scratchpad's tab stays hidden, since its code did not load either`, await t.page.locator(".scratch-tab").isHidden(), null);
```
and in the nomodule block (after `` check(`${engine}: and no box offers a button`, ...) ``) add
```js
  check(`${engine}: and the scratchpad's tab stays hidden`, await t.page.locator(".scratch-tab").isHidden(), null);
```
A site whose scratchpad code is missing must still run its boxes. Before the site without `app.mjs` (`const noApp =
...`), add
```js
// The built site with the scratchpad's code missing: the boxes' Run code loads it apart, so the boxes must still run.
const noScratchpad = workDir("page-test-noscratchpad");
fs.cpSync(site, noScratchpad, { recursive: true });
fs.rmSync(path.join(noScratchpad, "page/scratchpad.mjs"));
```
and after the block for the site whose Run code is missing (after its `await t.close();`) add
```js
  // A page whose scratchpad code fails to load still runs its boxes (wire.mjs loads the scratchpad apart), and the
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
  await t.close();
```

Run: `$J build/BuildTest.java PagesTest`
Expected: exit 1, `10 test(s), 2 failed` (eight tests before Task 2, Task 2's one, this task's one):
`testEveryRenderedPageCarriesTheScratchpadHiddenAndShut` (`00-front-matter: the scratchpad's tab, hidden`: no scratchpad
markup yet) and `testThePagesScriptsArePublishedByNameAndNothingElseFromWeb` (`page/scratchpad.mjs published`).
Run: `node web/test/scratchpad-panel.mjs chromium`
Expected: exit 1, `FAIL  chromium: the page wires the scratchpad and shows its tab  got null` (no tab, and
`data-scratchpad` never set, after a bounded 10 s wait for it), then the script stops at its next step with Playwright's
`locator.getAttribute: Timeout 30000ms exceeded`, waiting for `#scratchpad`, which does not exist yet. (Both red runs
were made in scratch on main's page code with Task 3's client in place; that scratch repository had no Task 2, so its
PagesTest counted `9 test(s), 2 failed`, the same two.)

- [ ] **Step 2: The markup and the stylesheet**

In `web/page.html`, between `</nav>` and `<script type="module" src="../app.mjs"></script>`:
```html
<button class="scratch-tab" type="button" aria-controls="scratchpad" aria-expanded="false" hidden>Scratchpad</button>
<section id="scratchpad" class="scratchpad" aria-label="jshell scratchpad" data-state="shut" hidden>
<header>
<span class="scratch-title">Scratchpad: jshell</span>
<button type="button" class="scratch-cancel" hidden>Cancel</button>
<button type="button" class="scratch-stop" hidden>Stop</button>
<button type="button" class="scratch-new" hidden>New session</button>
<button type="button" class="scratch-close" aria-label="Close the scratchpad">Close</button>
</header>
<p class="scratch-about">Java runs here, in your browser, one line at a time. In places, what it prints is worded differently from the JDK's own jshell. The first time you open it, it downloads about 24 MB, which this browser keeps, along with your last 100 entries for Up and Down. A session ends when you leave the page. Stop ends an entry that runs too long, and the session with it; at ...&gt;, Cancel drops an unfinished line.</p>
<pre class="transcript" role="log" aria-label="jshell transcript"></pre>
<p class="scratch-note" hidden></p>
<div class="entry"><span class="caret"></span><textarea rows="1" wrap="off" spellcheck="false" autocapitalize="off" autocomplete="off" readonly aria-label="jshell input"></textarea></div>
</section>
```
The tab stays hidden until a script decides; a browser without module scripts or without JavaScript never sees it
(the page's `noscript` and `nomodule` sentence already says Java cannot run there). `wrap="off"` keeps a long typed
line one line, as Pages renders `textarea.code` (Ruling 22). Cancel is a button because a phone has neither Escape nor
Ctrl+C; it shows only at a `...>` continuation. The caret is empty until a session gives its first prompt: the panel
shows only the front end's prompts (D62). The about line says, before anything else about storage, that the
scratchpad's wording differs from the JDK's jshell in places (the course's front end differs where Task 4's check
announces it: the startup imports, JDK frames, a few messages the VM words itself, and its own help, J1, J2), and it ends
with what Stop costs and how to leave an unfinished line: the course's help (J2) mentions neither, and a reader should
not first learn that Stop ends the session by pressing it.

Append to `web/app.css`:
```css
/* The scratchpad (web/page/scratchpad.mjs): a tab at the bottom right opens a sheet with jshell in it. Hidden must
   win over every display rule below, so each element the page hides by the attribute stays hidden. */
.scratch-tab[hidden], .scratchpad[hidden], .scratchpad [hidden] { display: none !important; }
.scratch-tab {
  position: fixed;
  right: 1rem;
  bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
  z-index: 6;
  padding: 0.5rem 1rem;
  font: 600 0.8rem/1.2 ui-sans-serif, system-ui, sans-serif;
  color: var(--paper);
  background: var(--accent);
  border: 0;
  border-radius: 999px;
  box-shadow: 0 6px 20px rgb(0 0 0 / 0.18);
  cursor: pointer;
}
.scratchpad {
  position: fixed;
  inset: auto 0 0 0;
  z-index: 7;
  display: flex;
  flex-direction: column;
  max-height: min(60vh, 32rem);
  max-height: min(60dvh, 32rem);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: var(--panel);
  border-top: 1px solid var(--rule);
  box-shadow: 0 -8px 32px rgb(0 0 0 / 0.18);
}
.scratchpad header {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem 0.9rem;
  font: 0.76rem/1.4 ui-sans-serif, system-ui, sans-serif;
  color: var(--soft);
  border-bottom: 1px solid var(--rule);
}
.scratchpad .scratch-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.scratchpad header button {
  padding: 0.15rem 0.55rem;
  font: inherit;
  color: var(--soft);
  background: transparent;
  border: 1px solid var(--rule);
  border-radius: 0.3rem;
  cursor: pointer;
}
.scratchpad .scratch-about, .scratchpad .scratch-note {
  margin: 0;
  padding: 0.4rem 0.9rem 0;
  font: 0.76rem/1.4 ui-sans-serif, system-ui, sans-serif;
  color: var(--soft);
}
/* jshell's transcript is a terminal's: an entry, a caret under an error and a stack frame each stay one line (Ruling
   22), and a long one scrolls inside the transcript, never the page. After pre:not(.output):not(.reference), whose
   specificity this rule ties, so its margin and background lose. */
.scratchpad pre.transcript {
  flex: 1;
  min-height: 5rem;
  margin: 0;
  padding: 0.6rem 0.9rem 0;
  font-size: 0.84rem;
  line-height: 1.5;
  white-space: pre;
  overflow: auto;
  overscroll-behavior: contain;
  background: transparent;
  border-radius: 0;
}
.scratchpad .transcript .typed { color: var(--accent); font-weight: 600; }
.scratchpad .transcript .err { color: var(--warn); }
.scratchpad .transcript .status { color: var(--soft); font-style: italic; }
.scratchpad .entry { display: flex; gap: 0.5rem; align-items: flex-start; padding: 0.5rem 0.9rem 0.75rem; }
.scratchpad .caret {
  padding-top: 0.15rem;
  font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.84rem;
  color: var(--accent);
  white-space: pre;
  user-select: none;
}
/* What the reader types is code: it never wraps either. */
.scratchpad .entry textarea {
  flex: 1;
  min-width: 0;
  max-height: 9rem;
  padding: 0.15rem 0;
  font-size: 0.84rem;
  line-height: 1.5;
  color: var(--ink);
  background: transparent;
  border: 0;
  resize: none;
  tab-size: 4;
  white-space: pre;
  overflow: auto;
}
.scratchpad .entry textarea:focus { outline: none; }
/* While the sheet is open the page's end, its Previous and Next links included, can still scroll above it (--sheet:
   its height, scratchpad.mjs). On body, not main: the pager comes after main. */
body[data-sheet=open] { padding-bottom: var(--sheet, 0px); }
```
Two traps, both guarded above: `hidden` loses to any rule that sets `display` (hence the `!important` line, which also
covers `.entry` and the header buttons, Cancel included), and `pre:not(.output):not(.reference)` (specificity 0,2,1)
gives every `pre` a margin and a background, which `.scratchpad pre.transcript` ties and beats by coming later. The
transcript never wraps (B7): jshell's transcript mixes the reader's code, carets under errors (which must stay under
their character, as `.javac` keeps javac's) and values, so it is a terminal's screen, `white-space: pre`, scrolling
sideways inside the sheet; the page itself never scrolls sideways at 390 px. The room the open sheet needs goes on
`body`, not `main`: the page's Previous and Next links (`nav.pager`) come after `main`, and with the room on `main` the
sheet covered them at the page's end.

- [ ] **Step 3: Feature detection and the entry module**

Append to `web/page/support.mjs` (after `javaSupport`), in the same old syntax, which
`PagesTest.testTheEntryModuleParsesInEveryBrowserWithModuleScripts` already checks for this file:
```js
// Can this browser run the scratchpad (jshell on Ristretto, web/page/scratchpad.mjs)? Everything javaSupport() asks,
// two WebAssembly features Ristretto's interpreter uses and the fork does not, and crypto.subtle, which the scratchpad
// uses to check its download and which a browser gives only to a secure page (https, or localhost). Every browser that
// passes javaSupport() has both features; they are still tested, by feature. Each module validates in Node 25,
// Chromium, WebKit and Firefox, and its control does not: the same module with its feature's instruction prefix
// (0xfd for SIMD, 0xfc for bulk memory) replaced by 0xff, an opcode that does not exist.
var SCRATCHPAD_FEATURES = {
  // a function returning v128.const 0
  "WebAssembly SIMD": [0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7b,
    0x03, 0x02, 0x01, 0x00, 0x0a, 0x16, 0x01, 0x14, 0x00, 0xfd, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0b],
  // a function doing memory.fill on a one-page memory
  "WebAssembly bulk memory": [0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x04, 0x01, 0x60, 0x00, 0x00,
    0x03, 0x02, 0x01, 0x00, 0x05, 0x03, 0x01, 0x00, 0x01, 0x0a, 0x0d, 0x01, 0x0b, 0x00, 0x41, 0x00, 0x41, 0x00, 0x41,
    0x00, 0xfc, 0x0b, 0x00, 0x0b],
};
export function scratchpadSupport() {
  var missing = javaSupport().missing.slice();
  if (typeof WebAssembly === "object" && typeof WebAssembly.validate === "function")
    for (var name in SCRATCHPAD_FEATURES) if (!validates(SCRATCHPAD_FEATURES[name])) missing.push(name);
  if (typeof crypto !== "object" || !crypto.subtle || typeof crypto.subtle.digest !== "function") missing.push("crypto.subtle");
  return { ok: missing.length === 0, missing: missing };
}
```
Before writing the bytes, confirm them and their controls in Node:
```bash
node -e '
const SIMD = [<the SIMD array above>], BULK = [<the bulk-memory array above>];
const swap = (b, from) => b.map((x, i) => (i === b.indexOf(from) ? 0xff : x));
const v = (b) => WebAssembly.validate(new Uint8Array(b));
console.log(v(SIMD), v(swap(SIMD, 0xfd)), v(BULK), v(swap(BULK, 0xfc)));'
```
Expected: `true false true false` (run with these exact bytes in Node 25.9.0; when this plan was drafted the same
modules and controls gave the same answers in Chromium, WebKit and Firefox).

`web/app.mjs` becomes (the scratchpad's sentences and `scratchpadCannot` are new; the rest is as it is now):
```js
/*
 *  Copyright 2026 Java Foundations contributors.
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
// The page's entry. Checks once whether this browser can run Java; if it cannot, every box that could run says so,
// with the minimum versions, and offers nothing, and so does the scratchpad's panel (also when only the scratchpad
// cannot run). This module and support.mjs, the only one it imports, are kept to
// syntax every browser with module scripts parses (no dynamic import, no module meta URL, nothing newer than
// ES2017), so a browser too old to run Java still gets the message and not a parse error that skips the nomodule
// fallback too (DESIGN section 5, D20). The Run code is page/wire.mjs, loaded only once support is confirmed.
import { javaSupport, scratchpadSupport } from "./page/support.mjs";

var root = document.documentElement;
// Every box that could run says message, and offers nothing.
function tell(message) {
  var boxes = document.querySelectorAll(".box:not([data-kind=reference])");
  for (var i = 0; i < boxes.length; i++) {
    var p = document.createElement("p");
    p.className = "nojava";
    p.textContent = message;
    boxes[i].appendChild(p);
  }
}
// The scratchpad (web/page.html's tab and panel) in a browser that cannot run it: the tab still shows, and the panel
// says why where jshell would be, with no input and nothing downloaded. page/scratchpad.mjs never loads here, so
// this stays in the same old syntax as the rest of this file.
var SCRATCHPAD_INSECURE = "The scratchpad needs a secure page: an address starting with https://, or localhost. " +
  "This page was opened another way, so the scratchpad cannot check its download and does not start. The boxes on the page still run.";
var SCRATCHPAD_CANNOT = "This browser can't run the scratchpad. It runs in Chrome 119, Firefox 120 and Safari 18.2 " +
  "(on iPhone and iPad, iOS 18.2) or newer. The boxes on the page still run.";
function scratchpadCannot(message) {
  var tab = document.querySelector(".scratch-tab"), panel = document.getElementById("scratchpad");
  panel.querySelector(".transcript").textContent = message;
  panel.querySelector(".scratch-about").hidden = true;
  panel.querySelector(".entry").hidden = true;
  // While the sheet shows, the page's end, its Previous and Next links included, can still scroll above it (app.css,
  // body[data-sheet=open], --sheet: the sheet's height), as page/scratchpad.mjs keeps it for the panel that runs.
  function sheet() { root.style.setProperty("--sheet", panel.hidden ? "0px" : panel.offsetHeight + "px"); }
  function setOpen(yes) {
    panel.hidden = !yes;
    tab.hidden = yes;
    tab.setAttribute("aria-expanded", String(yes));
    document.body.dataset.sheet = yes ? "open" : "shut";
    sheet();
  }
  tab.onclick = function () { setOpen(true); };
  panel.querySelector(".scratch-close").onclick = function () { setOpen(false); };
  if (typeof ResizeObserver === "function") new ResizeObserver(sheet).observe(panel);
  document.body.dataset.sheet = "shut";
  tab.hidden = false;
  root.dataset.scratchpad = "unsupported";
}
if (!javaSupport().ok) {
  tell(document.getElementById("nojava").textContent);
  scratchpadCannot(document.getElementById("nojava").textContent);
  root.dataset.java = "unsupported";
} else {
  if (!scratchpadSupport().ok) scratchpadCannot(window.isSecureContext === false ? SCRATCHPAD_INSECURE : SCRATCHPAD_CANNOT);
  // Everything that runs Java loads only in a browser that can run it, by a module script element whose address is
  // found from this module's own script element (a module has no document.currentScript).
  var entry = document.querySelector('script[type="module"][src$="app.mjs"]');
  var wire = document.createElement("script");
  wire.type = "module";
  wire.src = new URL("page/wire.mjs", entry.src).href; // app.mjs sits at the site root
  // The Run code did not load (a dropped connection, a file missing from the site): every box says so, in the words
  // web/page/box.mjs uses for a run that went wrong, and data-java is set, so nothing waits forever.
  wire.onerror = function () {
    tell("Something went wrong running this box. Reload the page and try again.");
    root.dataset.java = "failed";
  };
  document.head.appendChild(wire);
}
```
The two sentences live here, not in `page.html`: only this file shows them, and `page.html`'s `#nojava` sentence is
there for the nomodule fallback, which never touches the scratchpad.

`web/page/wire.mjs` becomes (a dynamic import, which the Run code may use and the entry module may not, as
`PagesTest.testTheEntryModuleParsesInEveryBrowserWithModuleScripts` says; a static import would take the whole module,
and every box's Run button, down with a missing or broken `scratchpad.mjs`):
```js
/*
 *  Copyright 2026 Java Foundations contributors.
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
// The page's Run code, loaded by app.mjs only in a browser that can run Java: wires every box that runs to one
// BrowserRunner, made on the first Run, every predict box, which needs none, and the scratchpad. Sets data-java to
// "ready" once the boxes are wired; the scratchpad sets data-scratchpad itself.
import { wireBox, wirePredict } from "./box.mjs";
import { BrowserRunner } from "../runner/browser-runner.mjs";

const root = document.documentElement;
let runner = null;
function getRunner() {
  if (!runner) {
    runner = new BrowserRunner(new URL("../", import.meta.url)); // the site root, where runtime/ and runner/ sit
    root.dataset.runner = "started";
  }
  return runner;
}
for (const box of document.querySelectorAll(".box:not([data-kind=reference]):not([data-kind=predict])")) wireBox(box, getRunner);
for (const box of document.querySelectorAll(".box[data-kind=predict]")) wirePredict(box);
// The scratchpad, unless app.mjs found this browser cannot run it; nothing of it downloads until the reader opens it.
// Its code loads apart from the boxes' (a dynamic import, not a static one, which would take this whole module down
// with it): a fault in it, a file missing from the site or an error while wiring, leaves its tab hidden, sets
// data-scratchpad to "failed" and reaches the page's error reporting, and never stops a box.
// window.jfScratchpadLimits is a test's hook (the browser tests shorten the backstop and a restart's deadline with
// it); no page sets it.
if (root.dataset.scratchpad !== "unsupported")
  import("./scratchpad.mjs")
    .then((m) => m.wireScratchpad(document.getElementById("scratchpad"), document.querySelector(".scratch-tab"),
      new URL("../scratchpad/", import.meta.url), window.jfScratchpadLimits))
    .catch((e) => { root.dataset.scratchpad = "failed"; setTimeout(() => { throw e; }); });
root.dataset.java = "ready";
```

- [ ] **Step 4: The panel**

Create `web/page/scratchpad.mjs`:
```js
/*
 *  Copyright 2026 Java Foundations contributors.
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
// The scratchpad: a sheet with jshell in it, on every chapter page (DESIGN section 2, D48, D62). Nothing of it
// downloads until the reader opens it (D29), and it is shut on every page load. The client (jshell-session.mjs)
// owns the session, its download and its stop policy; the course's jshell front end (runtime/jshell/) answers every
// line, commands included, and gives the prompt for the next one. This file is the page's half: jshell's banner, the
// echo of each line after the prompt the front end gave, jshell's output, what starting jshell is doing and for how
// long (D54), the reader's history, the way out of an unfinished snippet, and every ending in the client's plain
// words (endedWords). It answers no command itself and shows no prompt of its own. panel.dataset.state is "shut"
// until the reader first opens it, then the session's state (loading, ready, busy, ended) whether or not the panel
// shows; data-session counts the sessions started, data-ended names the last ending (the client's endedBy). Each is
// set only once what came before it is on screen, so tests can wait on them.
import { JShellSession } from "./jshell-session.mjs";

const HISTORY_KEY = "jf:scratchpad:history";
const HISTORY_SIZE = 100;
// The transcript keeps its newest 2,000,000 characters (twice an entry's output cap), from the start of a line.
const TRIM_CHARS = 2_000_000;
// What starting jshell is doing, by the client's onProgress phase (D54); a timer follows the words. Measured by
// web/test/scratchpad.mjs, the files served from the same machine: the download and its check 0.1 s, Java under a
// second, then jshell about 9 s in Chromium and WebKit and about 55 s in Firefox, so Firefox's minute goes with
// jshell's words.
const PHASES = {
  download: "Downloading jshell (about 24 MB, once) and checking it",
  engine: "Starting Java",
  jshell: "Starting jshell, which takes about 10 seconds in Chrome and Safari and about a minute in Firefox",
};
// A /reset or /reload starts a fresh VM inside its one request: the client says jshell as it sends the line, the
// session busy, and nothing follows until the answer. The note says so in words of its own, with the timer and no
// time claimed: a restart does not take the first open's time (a /reset about 8 s in Chromium and WebKit and 15 s in
// Firefox, measured), and a /reload then runs the session's entries again.
const RESTARTING = "Starting a fresh jshell";
// The endings after which a fresh session starts by itself (D49): the reader's entry was stopped, or the engine gave
// out. After exited (the reader asked to end) and failed-to-load (starting again by itself would download 24 MB in a
// loop on a bad connection, or wait out another restart that did not answer) the reader starts one: Enter, or New
// session.
const RESTARTS = ["stopped", "timeout", "output-limit", "out-of-memory", "crashed"];

// Storage that throws (a private window, blocked storage) is ignored: the panel works as if nothing were kept.
function readHistory() {
  try {
    const h = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(h) ? h.filter((x) => typeof x === "string") : [];
  } catch (e) { return []; }
}
function writeHistory(h) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch (e) { /* nothing is kept */ }
}

function element(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text != null) e.textContent = text;
  return e;
}

// panel: section#scratchpad; tab: button.scratch-tab; base: the URL of site/scratchpad/. limits: the client's
// deadlineMs, bootDeadlineMs, outputLimitChars and outputLimitLines; each one left out keeps the client's default.
export function wireScratchpad(panel, tab, base, limits = {}) {
  const transcript = panel.querySelector(".transcript");
  const note = panel.querySelector(".scratch-note");
  const input = panel.querySelector(".entry textarea");
  const caret = panel.querySelector(".caret");
  const stopButton = panel.querySelector(".scratch-stop");
  const cancelButton = panel.querySelector(".scratch-cancel");
  const newButton = panel.querySelector(".scratch-new");
  const history = readHistory();
  let cursor = history.length;
  let sessions = 0, continuing = false, opened = false;
  // The prompt the front end gave for the next line ("" until a session gives one, and once it ends): the echo of a
  // line starts with it, and the caret shows it.
  let nextPrompt = "";
  let booting = false; // a start() has not yet resolved: its first ready waits for the banner
  let pending = [], frame = 0, shown = 0;
  let entering = false; // an Enter is still sending its lines, or a cancel is on its way
  let renewing = false; // New session is ending the session itself, and starts the next
  let words = "", since = 0, clock = 0; // what the note says jshell is doing, since when, and its timer

  // One client for the page; each session is one start() of it. It keeps the files it verified, so a fresh session
  // downloads nothing again, even where storage is refused (a private window).
  const { deadlineMs, bootDeadlineMs, outputLimitChars, outputLimitLines } = limits;
  const session = new JShellSession(base, { deadlineMs, bootDeadlineMs, outputLimitChars, outputLimitLines,
    // stderr is a program's own System.err: jshell's feedback, its errors and its traces all arrive on stdout.
    onOutput: (text, stream) => show(text, stream === "stderr" ? "err" : ""),
    onState: (state) => {
      // ready and ended are set only once everything before them is on screen, as box.mjs flushes before done;
      // a session's first ready waits for its banner (begin), and ended for the ending's words (ended).
      if (state === "idle" || (state === "ready" && booting)) return;
      if (state === "ready" || state === "ended") { flush(); working(""); }
      if (state !== "ended") return setState(state);
      // An ending that nothing is waiting on (the worker failed between entries) is said here, once the client is done;
      // an entry, a cancel or a start that was waiting says its own ending (ended).
      if (!entering && !booting && !renewing) queueMicrotask(() => ended(session.endedBy));
    },
    onProgress: (phase) => working(session.state === "busy" ? RESTARTING : PHASES[phase] ?? PHASES.jshell) });

  // readonly, not disabled, while jshell works: a disabled field loses focus, and on iOS the keyboard goes with it.
  function setState(s) {
    panel.dataset.state = s;
    input.readOnly = s === "loading" || s === "busy";
    stopButton.hidden = s !== "busy";
    newButton.hidden = s === "shut" || s === "loading";
    cancelButton.hidden = !(continuing && s === "ready");
  }
  function say(text) { note.textContent = text; note.hidden = !text; }
  // The note says what jshell is doing and counts the seconds since it began (D54); working("") ends it.
  function working(text) {
    if (!text) { clearInterval(clock); clock = 0; words = ""; say(""); return; }
    if (!clock) { since = performance.now(); clock = setInterval(tick, 250); }
    words = text;
    tick();
  }
  function tick() { say(`${words}… ${Math.floor((performance.now() - since) / 1000)} s`); }
  // The caret shows the front end's prompt as a terminal's last line does: without the blank line normal mode puts
  // before it and without its trailing space. Cancel shows only at a ...> continuation that waits for the reader (a
  // phone has neither Escape nor Ctrl+C).
  function prompt() {
    caret.textContent = nextPrompt.replace(/^\n+/, "").trimEnd();
    cancelButton.hidden = !(continuing && panel.dataset.state === "ready");
  }
  function fit() { input.style.height = "auto"; input.style.height = `${input.scrollHeight}px`; }

  // Everything the transcript shows goes through show(), in order, and reaches the page at most once per animation
  // frame: a loop that prints sends one output event per line, and a page update for each one (an append and a
  // scroll) kept the page busy for minutes with 16,352 of them.
  function show(text, kind = "") {
    if (!text) return;
    const last = pending[pending.length - 1];
    if (last && last.kind === kind) last.text += text;
    else pending.push({ kind, text });
    if (!frame) frame = requestAnimationFrame(flush);
  }
  function flush() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    for (const p of pending) {
      transcript.append(p.kind ? element("span", p.kind, p.text) : p.text);
      shown += p.text.length;
    }
    pending = [];
    trim();
    transcript.scrollTop = transcript.scrollHeight;
  }
  // Drops the oldest text until TRIM_CHARS are left, then on to the start of the next line.
  function trim() {
    while (shown > TRIM_CHARS && transcript.firstChild) {
      const first = transcript.firstChild, text = first.textContent;
      const over = shown - TRIM_CHARS;
      if (text.length <= over) { first.remove(); shown -= text.length; continue; }
      const cut = text.indexOf("\n", over - 1) + 1 || text.length;
      if (cut === text.length) first.remove(); else first.textContent = text.slice(cut);
      shown -= cut;
    }
  }
  // What the reader typed, after its prompt, in the typed style; the blank line normal mode's prompt starts with is
  // plain transcript, so the echo of a line stays one line.
  function echo(text) {
    const typed = text.replace(/^\n+/, "");
    show(text.slice(0, text.length - typed.length));
    show(typed, "typed");
  }
  function clearTranscript() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    pending = [];
    shown = 0;
    transcript.replaceChildren();
  }

  // A session: the client's start(), then jshell's banner, shown once, before the panel says ready, and its first
  // prompt on the caret.
  async function begin() {
    panel.dataset.session = String(++sessions);
    continuing = false;
    nextPrompt = "";
    prompt();
    booting = true;
    try {
      const started = await session.start();
      booting = false;
      nextPrompt = started.prompt ?? "";
      show(started.banner);
      flush();
      working("");
      setState("ready");
      prompt();
      input.focus();
    } catch (e) {
      booting = false;
      // A start that rejects without ending its session is a mistake in the code: it reaches the page's error
      // reporting on its own task, and is never swallowed.
      if (session.state === "ended") ended(session.endedBy);
      else setTimeout(() => { throw e; });
    }
  }

  // An ending, said in the client's words, never the engine's own message; then a fresh session, or not (RESTARTS).
  function ended(reason) {
    continuing = false;
    nextPrompt = "";
    prompt();
    show(`${session.endedWords}\n`, "status");
    flush();
    panel.dataset.ended = reason;
    setState("ended");
    if (RESTARTS.includes(reason)) return begin();
    say("Press Enter, or New session, to start a new session.");
  }

  function remember(text) {
    if (text.trim() && history[history.length - 1] !== text) {
      history.push(text);
      history.splice(0, history.length - HISTORY_SIZE);
      writeHistory(history);
    }
    cursor = history.length;
  }

  // Enter: each line of the input goes to jshell as one request, in order, as the transcript check sends them
  // (runtime/jshell/test/check.mjs, through this same client), each echoed after the prompt the last answer gave. An
  // empty line goes too, at a plain prompt as at ...>, as the check sends one: the front end answers it (normal mode:
  // its prompt again, so the transcript shows the prompt and an empty line, as the real tool's terminal does).
  async function enter() {
    entering = true;
    try { await send(input.value); } finally { entering = false; }
  }
  async function send(text) {
    input.value = "";
    fit();
    remember(text);
    if (session.state === "ended") {
      await begin();
      if (session.state !== "ready") { input.value = text; fit(); return; }
    }
    const n = sessions;
    for (const line of text.split("\n")) {
      echo(`${nextPrompt}${line}\n`);
      const r = await session.submit(line);
      if (n !== sessions) return; // New session was pressed meanwhile
      if (r.status === "ended") return ended(r.reason);
      continuing = r.continuation;
      nextPrompt = r.prompt ?? "";
      prompt();
    }
    input.focus();
  }

  // Escape, Ctrl+C or Cancel at a ...> continuation: jshell drops the lines not yet finished (the client's cancel), and
  // the session keeps everything it defined. The transcript shows what was typed, then ^C, as a terminal does.
  async function cancel() {
    if (!continuing || entering || session.state !== "ready") return;
    entering = true;
    const text = input.value;
    input.value = "";
    fit();
    echo(nextPrompt + text.split("\n").join(`\n${nextPrompt}`));
    show("^C\n", "status");
    const n = sessions;
    try {
      const r = await session.cancel();
      if (n !== sessions) return; // New session was pressed meanwhile: its own session is starting
      if (r.status === "ended") return ended(r.reason);
      continuing = r.continuation;
      nextPrompt = r.prompt ?? "";
      prompt();
      input.focus();
    } finally { entering = false; }
  }

  input.addEventListener("input", fit);
  input.addEventListener("keydown", (e) => {
    if (e.isComposing) return;
    // Ctrl+C copies when something is selected; with nothing selected it cancels, as in a terminal.
    const ctrlC = e.ctrlKey && !e.altKey && !e.metaKey && e.key.toLowerCase() === "c"
      && input.selectionStart === input.selectionEnd;
    if (continuing && (e.key === "Escape" || ctrlC)) {
      e.preventDefault();
      cancel();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!input.readOnly && !entering) enter();
      return;
    }
    // Up and Down walk the history while the input is one line, or still the entry they brought back.
    if ((e.key === "ArrowUp" || e.key === "ArrowDown") && (!input.value.includes("\n") || input.value === history[cursor])) {
      if (e.key === "ArrowUp" && cursor > 0) cursor--;
      else if (e.key === "ArrowDown" && cursor < history.length) cursor++;
      else return;
      e.preventDefault();
      input.value = history[cursor] ?? "";
      fit();
    }
  });
  stopButton.addEventListener("click", () => session.stop());
  cancelButton.addEventListener("click", () => cancel());
  newButton.addEventListener("click", () => {
    renewing = true;
    session.stop();
    renewing = false;
    clearTranscript();
    begin();
  });

  // The sheet's height, so the page's last lines can scroll above it (app.css, body[data-sheet=open]).
  function sheet() {
    document.documentElement.style.setProperty("--sheet", panel.hidden ? "0px" : `${panel.offsetHeight}px`);
  }
  function setOpen(yes) {
    panel.hidden = !yes;
    tab.hidden = yes;
    tab.setAttribute("aria-expanded", String(yes));
    document.body.dataset.sheet = yes ? "open" : "shut";
    sheet();
    if (yes && !opened) { opened = true; begin(); }
    if (yes) input.focus(); else tab.focus();
  }
  tab.addEventListener("click", () => setOpen(true));
  panel.querySelector(".scratch-close").addEventListener("click", () => setOpen(false));
  new ResizeObserver(sheet).observe(panel);
  document.body.dataset.sheet = "shut";
  setState("shut");
  tab.hidden = false;
  document.documentElement.dataset.scratchpad = "ready";
}
```
What each part answers to:
- One client for the page. Each session is one `start()` of it, and Task 3's client keeps the files it verified, so a
  fresh session after Stop reads nothing again. A client per session would download 24 MB again after every Stop
  wherever storage is refused (a private window), since the client's cache is then empty; the storage-refused check
  holds the panel to one.
- jshell's banner comes from `start()` (Task 3 never sends it through `onOutput`), and the panel prints it once per
  session. A session's first `ready` is held back (`booting`) until the banner is on screen, as every later `ready` waits
  for the entry's output (`flush()` in `onState`, as `box.mjs` flushes before `done`).
- The prompt is the front end's (D62). Each answer's `prompt` is printed before the next line's echo, so the transcript
  is the real tool's, the blank line before each normal-mode prompt included (Task 6 holds the page's transcript to the
  client's own under Node, where Task 4 holds the client to the real jshell), and the caret shows it without that
  blank line and its trailing space. The panel never makes one up: an answer without a prompt leaves the caret empty and
  the next echo bare, and from an ending until the next session's first prompt the caret is empty, since no jshell is
  listening. The blank line is plain transcript, outside the echo's typed span, so the echo of a long entry stays one
  line (the 390 px check measures it).
- Every line goes to the front end, commands included. The course's front end answers `/help` with the course's own
  help (J2), `/reload` by restarting and replaying the session, and `/open`, `/save`, `/edit` and the other commands it
  leaves out, or does not know, in its own words; so the panel's own answers, and Ristretto's command list they resolved
  against, are gone.
- Every ending is shown in the client's own words (`endedWords`), never the engine's message; `data-ended` is the
  client's `endedBy`. A fresh session starts by itself after `stopped`, `timeout`, `output-limit`, `out-of-memory` and
  `crashed` (`RESTARTS`, D49): the reader's entry was stopped or the engine gave out, and starting at once overlaps the
  boot with the reader reading the reason. Not after `exited` (the reader asked to end) or `failed-to-load` (starting
  again by itself would download 24 MB in a loop on a bad connection, or wait out another restart that did not answer);
  Enter or New session starts one. Stop terminates the worker (the engine cannot be interrupted from inside); the
  variables are gone, the history stays.
- What starting jshell is doing (D54), by Task 3's phases: `download` (the manifest, the five files, their check),
  `engine` (Ristretto's `loading` phase: the worker builds the engine) and `jshell` (its `evaluating` phase: the engine
  starts jshell), with a timer from the first. Firefox's minute is in the `jshell` phase, so its words carry it:
  measured in Task 6's real opens, the files served from the same machine, the download and its check took 0.1 to
  0.2 s, Java 0.4 to 0.9 s, and jshell 9.2 s in Chromium, 8.4 s in WebKit and 54.2 s in Firefox. A `/reset` or
  `/reload` restarts inside its one request: Task 3 calls `onProgress("jshell")` as it sends the line, the session
  `busy`, and nothing follows until the answer. The note then says "Starting a fresh jshell", with the timer: not the
  first open's words, whose times a restart does not take (a real `/reset` took 8.1 s in Chromium, 7.3 s in WebKit and
  14.7 s in Firefox, and a `/reload` then replays the session too), and no time of its own, since a `/reload`'s grows
  with the session. A restart past its deadline ends `failed-to-load` in the client's
  words, and like any failed load starts nothing by itself. A `/reset` the front end refuses (`/reset foo`) still gets
  the words, for the milliseconds it takes (Task 3 classifies restart lines by command name alone).
- One line per request (the transcript check, `runtime/jshell/test/check.mjs`, sends one line per request through this
  same client, so the page does too). A pasted or Shift+Entered block goes line by line, each echoed with the prompt the
  last answer gave. An empty line goes too, at a plain prompt as at `...>`: the check sends one (`input.jsh`'s `@@blank`),
  and the front end answers it (in normal mode its prompt again and nothing printed), so the transcript shows the prompt
  and an empty line, as the real tool's terminal does. Enter on an empty input is never swallowed.
- The way out of a `...>` continuation: Escape, Ctrl+C with nothing selected in the input (Ctrl+C still copies a
  selection), or Cancel, shown only at `...>` because a phone has neither key. Each calls the client's `cancel()` (the
  front end drops the lines not yet finished, an `/exit`'s argument included; the session and everything it defined
  stay) and shows the prompt and what was typed, then `^C`, as a terminal does. Without it a reader who types `for (int
  i = 0; i < 3; i++) {` has only New session, which throws away every definition; `/reset` typed at `...>` would only
  join the unfinished snippet. New session pressed while a cancel is on its way (Stop and New session show while the
  session is busy) ends that session; the cancel's answer then reports it stopped, and `cancel()` drops it, as `send()`
  drops an answer from before New session (`n !== sessions`): otherwise its "Stopped." would land in the new transcript
  and start a second session while New session's is still loading.
- An ending is on screen before the panel says so: the client reports `ended` before the request in flight resolves, so
  `onState` leaves `data-state` alone for `ended`, and `ended()` sets it after showing the client's words (and after
  `data-ended`), as `ready` waits for the entry's output. An ending that nothing waits on (the worker failing between
  entries) is said by `onState` itself, a microtask after the client is done, and starts a fresh session like any other;
  New session marks the ending it causes as its own (`renewing`), since it starts the next session itself.
  `document.body.dataset.sheet` is `shut` from the wiring on, so the page says the sheet is shut before the reader first
  opens it.
- Output reaches the page once per animation frame (as `box.mjs` batches a run's output). Measured in Plan 3b's
  research with Ristretto's own front end, whose `StackOverflowError` trace came as 16,352 output events: batching cost
  57 to 95 ms in all, while an append and a scroll per event kept WebKit busy for 195 s and Firefox for 39 s, and
  Chromium was still busy at 240 s. With the course's front end a trace is at most 1,025 lines (it shows 1,024 frames,
  measured: 3 output events), but a loop that prints still sends one event per line (2,000 events for 2,000 `println`
  calls, measured under Node), so the batching stays and the stand-in's flood is such a loop. The longest gap between
  frames does not see that cost in WebKit or Firefox (frames keep coming while the output trickles in), so the check
  measures the time from Enter until all of it is on screen.
- stderr is a program's own `System.err` (the front end prints its feedback, errors and traces on stdout), shown in the
  error style; nothing else is styled by stream.
- The transcript keeps its newest 2,000,000 characters, cut inside the oldest node to a line start: dropping whole
  nodes emptied the transcript when one frame's text alone passed the limit. It bounds what a long session keeps in the
  page; rendering is not the reason (2.7 million characters cost a 100 to 150 ms frame untrimmed).
- Closing hides the sheet and keeps the session; nothing records that the panel was open, so every page load starts
  shut (D29: reopening on load would start a 24 MB download on every chapter page).

- [ ] **Step 5: Publish the three scripts**

In `build/Pages.java`, `WEB_SCRIPTS` becomes:
```java
  static final List<String> WEB_SCRIPTS = List.of("app.mjs", "page/support.mjs", "page/wire.mjs", "page/box.mjs", "page/replay.mjs",
      "page/transcript.mjs", "page/check.mjs", "page/scratchpad.mjs", "page/jshell-session.mjs", "page/compose.mjs",
      "runner/browser-runner.mjs", "runner/browser-worker.mjs");
```
The comment above it already says why: publishing is by whitelist. Task 3 created `web/page/jshell-session.mjs` and
moved `compose.mjs` to `web/page/`, and published neither; this task publishes both, with the panel that imports the
first (the client imports the second: without it the panel's import fails on the page, and the scratchpad's tab stays
hidden).

- [ ] **Step 6: Run to green**

Run: `$J build/BuildTest.java`
Expected: every test passes, exit 0, one test more than after Task 2: `125 test(s), 0 failed` (Task 2's 124 plus
`testEveryRenderedPageCarriesTheScratchpadHiddenAndShut`). In scratch, on main plus this task and Task 3's client (no
Task 2): `108 test(s), 0 failed`, 87 s; `$J build/BuildTest.java PagesTest` there: `9 test(s), 0 failed`.
Run: `node web/test/scratchpad-panel.mjs`
Expected: `246 check(s), 0 failed`, exit 0 (82 per engine; 119 s for the three).
Run: `node web/test/page.mjs`
Expected: every check passes in all three engines, exit 0, three more per engine than before this task (the two hidden-tab
checks and the site without the scratchpad's code).

- [ ] **Step 7: Break each check on purpose**

One at a time, rerun the named test in Chromium (each test builds its own fixture site, so nothing is rebuilt by hand),
and restore. Each break below was applied to its own scratch copy of the repository and run; the last column is what the
run printed.

| Break | Test | Exit | What failed (Chromium, as run) |
|---|---|---|---|
| `wireScratchpad` starts a session as it wires the page (`opened = true; begin();` before `tab.hidden = false`) | `scratchpad-panel.mjs` | 1 | "chromium: the panel is shut, the page says so, and nothing of the scratchpad has downloaded"; "chromium: after a reload the panel is shut and nothing of the scratchpad has downloaded"; "chromium: and opened there, it downloads only the manifest: jshell's files come from the browser's cache" |
| no timer while jshell starts (`clock = setInterval(tick, 250)` becomes `clock = 1`) | `scratchpad-panel.mjs` | 1 | "chromium: and counts the seconds" |
| `onProgress` ignored (`onProgress: () => {}`) | `scratchpad-panel.mjs` | 1 | "chromium: while it opens, the panel says what it is doing, phase by phase (D54), Firefox's minute with jshell's"; "chromium: and counts the seconds"; "chromium: /reset says a fresh jshell is starting while it waits, timer and no time claimed, then answers, with no second banner"; "chromium: /reload says a fresh jshell is starting while it waits, timer and no time claimed, then answers, with no second banner" |
| the `engine` and `jshell` words swapped in `PHASES` (Firefox's minute said while Java starts) | `scratchpad-panel.mjs` | 1 | "chromium: while it opens, the panel says what it is doing, phase by phase (D54), Firefox's minute with jshell's"; "chromium: and counts the seconds" |
| no progress words while `busy` (`onProgress` calls `working` only when the session is not `busy`), so a `/reset` or `/reload` waits in silence | `scratchpad-panel.mjs` | 1 | "chromium: /reset says a fresh jshell is starting while it waits, timer and no time claimed, then answers, with no second banner"; "chromium: /reload says a fresh jshell is starting while it waits, timer and no time claimed, then answers, with no second banner" |
| the banner from `start()` is not printed (drop `show(started.banner);` in `begin`) | `scratchpad-panel.mjs` | 1 | "chromium: jshell's banner shows once, before the panel says ready, and the note goes"; "chromium: says so in plain words, and a fresh session starts by itself"; "chromium: Enter after /exit starts a new session and sends the line"; "chromium: New session clears the transcript and starts a fresh session"; "chromium: New session pressed while a cancel is on its way starts one fresh session, its transcript jshell's banner alone" |
| a session's first `ready` is not held back for its banner (`onState` without `\|\| (state === "ready" && booting)`) | `scratchpad-panel.mjs` | 1 | "chromium: jshell's banner shows once, before the panel says ready, and the note goes" |
| the line is not echoed (drop the `echo(...)` line in `send`) | `scratchpad-panel.mjs` | 1 | "chromium: an entry is echoed after the prompt the front end gave, its blank line included, then jshell's answer"; "chromium: and the answer is on screen by the time data-state says ready"; "chromium: Enter on an empty line at the prompt sends it to the front end, which answers with its prompt"; "chromium: an unfinished line continues at ...>, then the prompt comes back"; "chromium: Shift+Enter adds a line and sends nothing; Enter sends each line as a request of its own"; "chromium: the panel answers no command itself: /help, /help intro, /open, /save, /edit and an unknown one each get the front end's words alone"; "chromium: each line is echoed after the prompt the front end gave last, in each feedback mode and at its continuation, and the caret shows it"; "chromium: an answer that gives no prompt gets none made up: the next line is echoed bare, and the caret is empty"; "chromium: /reset says a fresh jshell is starting while it waits, timer and no time claimed, then answers, with no second banner"; "chromium: /reload says a fresh jshell is starting while it waits, timer and no time claimed, then answers, with no second banner"; "chromium: at ...> Escape drops the unfinished lines: the caret is jshell> again, and the next entry runs on its own"; "chromium: Ctrl+C and the Cancel button drop them too"; "chromium: says so in plain words, and a fresh session starts by itself"; "chromium: 16,352 lines printed at once are on screen, whole, within seconds of Enter"; "chromium: a program's System.err shows in the error style"; "chromium: memory used up ends the session, says so, and a fresh one starts"; "chromium: a worker that fails between entries is said in plain words too, and a fresh session starts"; "chromium: Enter after /exit starts a new session and sends the line"; "chromium: closing shows the tab and keeps the session; reopening shows the same transcript" (then the run stops at a later step the break makes impossible) |
| the caret is not updated after an answer (drop `prompt();` after `nextPrompt = r.prompt ?? "";` in `send`) | `scratchpad-panel.mjs` | 1 | "chromium: an unfinished line continues at ...>, then the prompt comes back"; "chromium: each line is echoed after the prompt the front end gave last, in each feedback mode and at its continuation, and the caret shows it"; "chromium: an answer that gives no prompt gets none made up: the next line is echoed bare, and the caret is empty"; "chromium: Cancel shows at ...>, and only there"; "chromium: Ctrl+C and the Cancel button drop them too" (then the run stops at a later step the break makes impossible) |
| the whole input goes as one request (`for (const line of [text])`) | `scratchpad-panel.mjs` | 1 | "chromium: Shift+Enter adds a line and sends nothing; Enter sends each line as a request of its own"; "chromium: no page error" |
| `writeHistory` stores nothing | `scratchpad-panel.mjs` | 1 | "chromium: the history is kept in localStorage under jf:scratchpad:history"; "chromium: and keeps the last 100 entries"; "chromium: and Up brings back the last entry from before the reload" |
| no cap on the history (drop the `history.splice(...)` line) | `scratchpad-panel.mjs` | 1 | "chromium: and keeps the last 100 entries" |
| Up does nothing (the ArrowUp branch of the key handler made `if (false)`) | `scratchpad-panel.mjs` | 1 | "chromium: Up and Down walk the history"; "chromium: and Up brings back the last entry from before the reload" |
| the about line no longer says its wording differs from the JDK's jshell | `scratchpad-panel.mjs` | 1 | "chromium: the panel says what this browser keeps (the 24 MB download, the last 100 entries) and that its wording differs from the JDK's jshell" |
| `disabled` instead of `readonly` while jshell works (`input.readOnly = false; input.disabled = s === "loading" \|\| s === "busy";`) | `scratchpad-panel.mjs` | 1 | "chromium: opening starts the load at once, the input read-only and New session hidden"; "chromium: while an entry runs, Stop shows and the input is read-only, not disabled" |
| Stop calls `session.cancel()` instead of `session.stop()` | `scratchpad-panel.mjs` | 1 | "chromium: Stop terminates the worker at once"; "chromium: says so in plain words, and a fresh session starts by itself"; "chromium: the fresh session is a new worker" (then the run stops at a later step the break makes impossible) |
| Escape and Ctrl+C do nothing at `...>` (their `if` in the keydown handler made `if (false)`) | `scratchpad-panel.mjs` | 1 | "chromium: at ...> Escape drops the unfinished lines: the caret is jshell> again, and the next entry runs on its own"; "chromium: Cancel shows at ...>, and only there"; "chromium: Ctrl+C and the Cancel button drop them too" |
| Cancel never shows (`cancelButton.hidden = true;` in `setState` and `prompt`) | `scratchpad-panel.mjs` | 1 | "chromium: Cancel shows at ...>, and only there"; "chromium: Ctrl+C and the Cancel button drop them too" (then the run stops at a later step the break makes impossible) |
| canceling only resets the caret and never asks jshell (`const r = { status: "ready", continuation: false, prompt: "\njshell> " };` for `await session.cancel()`) | `scratchpad-panel.mjs` | 1 | "chromium: at ...> Escape drops the unfinished lines: the caret is jshell> again, and the next entry runs on its own"; "chromium: Ctrl+C and the Cancel button drop them too" (then the run stops at a later step the break makes impossible) |
| no fresh session after any ending (`RESTARTS = []`) | `scratchpad-panel.mjs` | 1 | "chromium: says so in plain words, and a fresh session starts by itself"; "chromium: the fresh session is a new worker"; "chromium: 16,352 lines printed at once are on screen, whole, within seconds of Enter"; "chromium: output past the cap ends the session, says why, and a fresh one starts"; "chromium: memory used up ends the session, says so, and a fresh one starts"; "chromium: an engine error ends the session in plain words, not the engine's message"; "chromium: a worker that fails between entries is said in plain words too, and a fresh session starts"; "chromium: data-state says ended only once the ending's words are on screen"; "chromium: an entry past the deadline ends the session in plain words, and a fresh one starts"; "chromium: and a fresh session after Stop downloads nothing again" |
| a fresh session starts by itself after `/exit` too (`"exited"` added to `RESTARTS`) | `scratchpad-panel.mjs` | 1 | "chromium: /exit ends the session in plain words, after jshell's goodbye, and no new one starts by itself" |
| a fresh session starts by itself after a failed load (`"failed-to-load"` added to `RESTARTS`) | `scratchpad-panel.mjs` | 1 | "chromium: a restart that does not answer by its deadline ends in plain words, and no session starts by itself"; "chromium: and no session starts again by itself" |
| no fresh session after memory runs out (`"out-of-memory"` taken out of `RESTARTS`) | `scratchpad-panel.mjs` | 1 | "chromium: memory used up ends the session, says so, and a fresh one starts"; "chromium: an engine error ends the session in plain words, not the engine's message" |
| each session forgets the files the client verified, as a client per session would (`session.assets = null;` in `begin`) | `scratchpad-panel.mjs` | 1 | "chromium: and a fresh session after Stop downloads nothing again" |
| a page update per output event: `show()` pushes and calls `flush()` at once (an append and a scroll each time) | `scratchpad-panel.mjs` | 1 | "chromium: 16,352 lines printed at once are on screen, whole, within seconds of Enter" (then the run stops at a later step the break makes impossible) |
| no trimming (drop `trim();` in `flush`) | `scratchpad-panel.mjs` | 1 | "chromium: the transcript keeps its newest 2,000,000 characters, from the start of a line" |
| trimming drops whole nodes only (the first `if` in `trim` made unconditional) | `scratchpad-panel.mjs` | 1 | "chromium: the transcript keeps its newest 2,000,000 characters, from the start of a line" |
| the ending shown as its raw reason instead of `session.endedWords` | `scratchpad-panel.mjs` | 1 | "chromium: says so in plain words, and a fresh session starts by itself"; "chromium: output past the cap ends the session, says why, and a fresh one starts"; "chromium: memory used up ends the session, says so, and a fresh one starts"; "chromium: an engine error ends the session in plain words, not the engine's message"; "chromium: a worker that fails between entries is said in plain words too, and a fresh session starts"; "chromium: /exit ends the session in plain words, after jshell's goodbye, and no new one starts by itself"; "chromium: data-state says ended only once the ending's words are on screen"; "chromium: an entry past the deadline ends the session in plain words, and a fresh one starts"; "chromium: a restart that does not answer by its deadline ends in plain words, and no session starts by itself"; "chromium: a download cut short ends in plain words, and no worker is made" |
| `data-state` turns `ended` before the ending's words show (`onState` calls `setState(state)` for `ended` too) | `scratchpad-panel.mjs` | 1 | "chromium: data-state says ended only once the ending's words are on screen" |
| an ending nothing waits on is not said (drop the `queueMicrotask(() => ended(session.endedBy))` line in `onState`) | `scratchpad-panel.mjs` | 1 | "chromium: a worker that fails between entries is said in plain words too, and a fresh session starts"; "chromium: /exit ends the session in plain words, after jshell's goodbye, and no new one starts by itself"; "chromium: data-state says ended only once the ending's words are on screen"; "chromium: Enter after /exit starts a new session and sends the line" |
| New session does not mark the ending as its own (drop `renewing = true;`) | `scratchpad-panel.mjs` | 1 | "chromium: New session clears the transcript and starts a fresh session" |
| closing the panel stops the session (`session.stop()` in `setOpen(false)`) | `scratchpad-panel.mjs` | 1 | "chromium: closing shows the tab and keeps the session; reopening shows the same transcript" |
| the panel remembers being open (`localStorage` `jf:scratchpad:open`, reopened on load) | `scratchpad-panel.mjs` | 1 | "chromium: after a reload the panel is shut and nothing of the scratchpad has downloaded" (then the run stops at a later step the break makes impossible) |
| `document.body.dataset.sheet` left unset until the first open (drop its line in the wiring) | `scratchpad-panel.mjs` | 1 | "chromium: the panel is shut, the page says so, and nothing of the scratchpad has downloaded" |
| `readHistory` without its `try`/`catch` | `scratchpad-panel.mjs` | 1 | "chromium: with storage refused, the panel still runs an entry"; "chromium: and a fresh session after Stop downloads nothing again"; "chromium: and raises no page error" |
| `ready` and `ended` set without flushing first (drop the `flush()` in `onState`) | `scratchpad-panel.mjs` | 1 | "chromium: and the answer is on screen by the time data-state says ready" |
| stderr shown like stdout, not in the error style (`onOutput: (text) => show(text)`) | `scratchpad-panel.mjs` | 1 | "chromium: a program's System.err shows in the error style" |
| `wireScratchpad` never reveals the tab (drop `tab.hidden = false;`) | `scratchpad-panel.mjs` | 1 | "chromium: the page wires the scratchpad and shows its tab" (then the run stops at a later step the break makes impossible) |
| the echo uses prompts of the panel's own (`${continuing ? "   ...> " : "\njshell> "}` in place of `${nextPrompt}` in `send`) | `scratchpad-panel.mjs` | 1 | "chromium: each line is echoed after the prompt the front end gave last, in each feedback mode and at its continuation, and the caret shows it"; "chromium: an answer that gives no prompt gets none made up: the next line is echoed bare, and the caret is empty" |
| the caret shows a prompt of the panel's own (`caret.textContent = "jshell>";` in `prompt`) | `scratchpad-panel.mjs` | 1 | "chromium: an unfinished line continues at ...>, then the prompt comes back"; "chromium: each line is echoed after the prompt the front end gave last, in each feedback mode and at its continuation, and the caret shows it"; "chromium: an answer that gives no prompt gets none made up: the next line is echoed bare, and the caret is empty" |
| an answer without a prompt gets one made up (`nextPrompt = r.prompt ?? "\njshell> ";` in `send`) | `scratchpad-panel.mjs` | 1 | "chromium: an answer that gives no prompt gets none made up: the next line is echoed bare, and the caret is empty" |
| the caret is not set from the first prompt (drop `prompt();` after `setState("ready");` in `begin`) | `scratchpad-panel.mjs` | 1 | "chromium: and the caret shows the first prompt the front end gave" |
| the panel answers `/help` itself again (in `send`, `/help` is echoed and answered with a line of the panel's own, never sent) | `scratchpad-panel.mjs` | 1 | "chromium: the panel answers no command itself: /help, /help intro, /open, /save, /edit and an unknown one each get the front end's words alone" |
| the echo's typed span holds the prompt's blank line too (`echo` does `show(text, "typed")`) | `scratchpad-panel.mjs` | 1 | "chromium: a long entry stays one line in the transcript, which scrolls sideways" |
| the transcript wraps (`white-space: pre-wrap` in `.scratchpad pre.transcript`) | `scratchpad-panel.mjs` | 1 | "chromium: a long entry stays one line in the transcript, which scrolls sideways" |
| the input wraps (drop `wrap="off"` from the textarea and `white-space: pre` from its rule) | `scratchpad-panel.mjs` | 1 | "chromium: and one line in the input, which scrolls sideways" |
| the transcript does not scroll (`overflow: visible` in `.scratchpad pre.transcript`; merely dropping its `overflow: auto` is no break, since `pre:not(.output):not(.reference)` still gives it `overflow-x: auto`) | `scratchpad-panel.mjs` | 1 | "chromium: at 390 px with the panel open neither the page nor the sheet scrolls sideways"; "chromium: a long entry stays one line in the transcript, which scrolls sideways" |
| no height limit on the sheet (drop both `max-height` lines in `.scratchpad`) | `scratchpad-panel.mjs` | 1 | "chromium: Ctrl+C and the Cancel button drop them too"; "chromium: the sheet keeps within the phone's width and to 60% of its height" (then the run stops at a later step the break makes impossible) |
| the sheet wider than the phone (`min-width: 30rem` in `.scratchpad`) | `scratchpad-panel.mjs` | 1 | "chromium: the sheet keeps within the phone's width and to 60% of its height" (then the run stops at a later step the break makes impossible) |
| the sheet's room on `main` again (`body[data-sheet=open] main { padding-bottom: calc(4rem + var(--sheet, 0px)); }`) | `scratchpad-panel.mjs` | 1 | "chromium: scrolled to its end, the page's Previous and Next links stay above the open sheet"; "chromium: without WasmGC: scrolled to its end, the page's Previous and Next links stay above the sheet"; "chromium: without WebAssembly SIMD: scrolled to its end, the page's Previous and Next links stay above the sheet"; "chromium: without WebAssembly bulk memory: scrolled to its end, the page's Previous and Next links stay above the sheet"; "chromium: on a page that is not secure (no crypto.subtle): scrolled to its end, the page's Previous and Next links stay above the sheet" |
| `wire.mjs` does not pass `window.jfScratchpadLimits` | `scratchpad-panel.mjs` | 1 | "chromium: an entry past the deadline ends the session in plain words, and a fresh one starts"; "chromium: a restart that does not answer by its deadline ends in plain words, and no session starts by itself"; "chromium: and Enter starts a new session, downloading nothing again" |
| `app.mjs` does not call `scratchpadCannot` when Java cannot run (the tab stays hidden) | `scratchpad-panel.mjs` | 1 | "chromium: without WasmGC: the tab shows, and the panel says so plainly"; "chromium: without WasmGC: scrolled to its end, the page's Previous and Next links stay above the sheet" |
| the unsupported panel downloads on open (`scratchpadCannot`'s `tab.onclick` also fetches `scratchpad/manifest.json`) | `scratchpad-panel.mjs` | 1 | "chromium: without WasmGC: and nothing of the scratchpad downloads"; "chromium: without WebAssembly SIMD: and nothing of the scratchpad downloads"; "chromium: without WebAssembly bulk memory: and nothing of the scratchpad downloads"; "chromium: on a page that is not secure (no crypto.subtle): and nothing of the scratchpad downloads" |
| `scratchpadSupport` skips the two WebAssembly probes | `scratchpad-panel.mjs` | 1 | "chromium: without WebAssembly SIMD: the tab shows, and the panel says so plainly"; "chromium: without WebAssembly SIMD: and offers no input and no New session"; "chromium: without WebAssembly SIMD: and nothing of the scratchpad downloads"; "chromium: without WebAssembly bulk memory: the tab shows, and the panel says so plainly"; "chromium: without WebAssembly bulk memory: and offers no input and no New session"; "chromium: without WebAssembly bulk memory: and nothing of the scratchpad downloads" |
| `scratchpadSupport` skips only the bulk-memory probe (its entry dropped from `SCRATCHPAD_FEATURES`) | `scratchpad-panel.mjs` | 1 | "chromium: without WebAssembly bulk memory: the tab shows, and the panel says so plainly"; "chromium: without WebAssembly bulk memory: and offers no input and no New session"; "chromium: without WebAssembly bulk memory: and nothing of the scratchpad downloads" |
| `scratchpadSupport` skips the `crypto.subtle` test | `scratchpad-panel.mjs` | 1 | "chromium: on a page that is not secure (no crypto.subtle): the tab shows, and the panel says so plainly"; "chromium: on a page that is not secure (no crypto.subtle): and offers no input and no New session"; "chromium: on a page that is not secure (no crypto.subtle): and nothing of the scratchpad downloads" |
| `app.mjs` always shows the scratchpad-only sentence (no secure-page sentence) | `scratchpad-panel.mjs` | 1 | "chromium: on a page that is not secure (no crypto.subtle): the tab shows, and the panel says so plainly" |
| `.scratchpad [hidden] { display: none !important; }` dropped from the guard line | `scratchpad-panel.mjs` | 1 | "chromium: without WasmGC: and offers no input and no New session"; "chromium: without WebAssembly SIMD: and offers no input and no New session"; "chromium: without WebAssembly bulk memory: and offers no input and no New session"; "chromium: on a page that is not secure (no crypto.subtle): and offers no input and no New session" |
| `page/compose.mjs` taken out of `WEB_SCRIPTS` (the client's import of it fails on the page) | `scratchpad-panel.mjs` | 1 | "chromium: the page wires the scratchpad and shows its tab"; "chromium: the panel is shut, the page says so, and nothing of the scratchpad has downloaded" (then the run stops at a later step the break makes impossible) |
| Task 3's client skips its size and SHA-256 check (`matches` returns `true`; shows this check reaches the client) | `scratchpad-panel.mjs` | 1 | "chromium: a download cut short ends in plain words, and no worker is made" |
| Task 3's client never writes Cache Storage (drop the `cache?.put(...)` line in `loadAssets`) | `scratchpad-panel.mjs` | 1 | "chromium: and opened there, it downloads only the manifest: jshell's files come from the browser's cache" |
| Task 3's client does not download the front end's jar (`browser-jshell.jar` dropped from `ASSETS`) | `scratchpad-panel.mjs` | 1 | "chromium: while it opens, the panel says what it is doing, phase by phase (D54), Firefox's minute with jshell's"; "chromium: and counts the seconds"; "chromium: jshell's banner shows once, before the panel says ready, and the note goes"; "chromium: and the caret shows the first prompt the front end gave"; "chromium: opening downloaded the manifest and jshell's five files, the course's front end among them"; "chromium: an entry is echoed after the prompt the front end gave, its blank line included, then jshell's answer"; "chromium: and the answer is on screen by the time data-state says ready"; "chromium: Enter on an empty line at the prompt sends it to the front end, which answers with its prompt"; "chromium: an unfinished line continues at ...>, then the prompt comes back"; "chromium: Shift+Enter adds a line and sends nothing; Enter sends each line as a request of its own"; "chromium: Up and Down walk the history"; "chromium: the panel answers no command itself: /help, /help intro, /open, /save, /edit and an unknown one each get the front end's words alone"; "chromium: each line is echoed after the prompt the front end gave last, in each feedback mode and at its continuation, and the caret shows it"; "chromium: an answer that gives no prompt gets none made up: the next line is echoed bare, and the caret is empty"; "chromium: /reset says a fresh jshell is starting while it waits, timer and no time claimed, then answers, with no second banner"; "chromium: /reload says a fresh jshell is starting while it waits, timer and no time claimed, then answers, with no second banner"; "chromium: at ...> Escape drops the unfinished lines: the caret is jshell> again, and the next entry runs on its own"; "chromium: Cancel shows at ...>, and only there"; "chromium: Ctrl+C and the Cancel button drop them too" (then the run stops at a later step the break makes impossible) |
| Task 3's client ends a restart past its deadline as `timeout` (the deadline timer's `if (restart)` line deleted) | `scratchpad-panel.mjs` | 1 | "chromium: a restart that does not answer by its deadline ends in plain words, and no session starts by itself" |
| Task 3's client says nothing as a restart line is sent (delete `this.onProgress("jshell");` in `submit`) | `scratchpad-panel.mjs` | 1 | "chromium: /reset says a fresh jshell is starting while it waits, timer and no time claimed, then answers, with no second banner"; "chromium: /reload says a fresh jshell is starting while it waits, timer and no time claimed, then answers, with no second banner" |
| Task 3's client hands on no prompt (`const prompt = null;` in `ready`) | `scratchpad-panel.mjs` | 1 | "chromium: and the caret shows the first prompt the front end gave"; "chromium: an entry is echoed after the prompt the front end gave, its blank line included, then jshell's answer"; "chromium: and the answer is on screen by the time data-state says ready"; "chromium: Enter on an empty line at the prompt sends it to the front end, which answers with its prompt"; "chromium: an unfinished line continues at ...>, then the prompt comes back"; "chromium: Shift+Enter adds a line and sends nothing; Enter sends each line as a request of its own"; "chromium: the panel answers no command itself: /help, /help intro, /open, /save, /edit and an unknown one each get the front end's words alone"; "chromium: each line is echoed after the prompt the front end gave last, in each feedback mode and at its continuation, and the caret shows it"; "chromium: an answer that gives no prompt gets none made up: the next line is echoed bare, and the caret is empty"; "chromium: /reset says a fresh jshell is starting while it waits, timer and no time claimed, then answers, with no second banner"; "chromium: /reload says a fresh jshell is starting while it waits, timer and no time claimed, then answers, with no second banner"; "chromium: at ...> Escape drops the unfinished lines: the caret is jshell> again, and the next entry runs on its own"; "chromium: Ctrl+C and the Cancel button drop them too"; "chromium: says so in plain words, and a fresh session starts by itself"; "chromium: 16,352 lines printed at once are on screen, whole, within seconds of Enter"; "chromium: a program's System.err shows in the error style"; "chromium: memory used up ends the session, says so, and a fresh one starts"; "chromium: a worker that fails between entries is said in plain words too, and a fresh session starts"; "chromium: Enter after /exit starts a new session and sends the line"; "chromium: closing shows the tab and keeps the session; reopening shows the same transcript"; "chromium: a restart that does not answer by its deadline ends in plain words, and no session starts by itself"; "chromium: and Enter starts a new session, downloading nothing again" |
| a restart says the first open's words, Firefox's minute and all (`onProgress: (phase) => working(PHASES[phase] ?? PHASES.jshell)`) | `scratchpad-panel.mjs` | 1 | "chromium: /reset says a fresh jshell is starting while it waits, timer and no time claimed, then answers, with no second banner"; "chromium: /reload says a fresh jshell is starting while it waits, timer and no time claimed, then answers, with no second banner" |
| the about line's sentence on Stop and Cancel dropped | `scratchpad-panel.mjs` | 1 | "chromium: and says up front what Stop costs and how to leave an unfinished line" |
| `app.mjs` reveals the tab before the Run code loads (`document.querySelector(".scratch-tab").hidden = false;` in the supported branch) | `page.mjs` | 1 | "chromium: and the scratchpad's tab stays hidden, since its code did not load either"; "chromium: a site without the scratchpad's code still runs a box, and keeps the scratchpad's tab hidden" |
| the tab's `hidden` attribute dropped from `web/page.html` | `page.mjs` | 1 | "chromium: and the scratchpad's tab stays hidden, since its code did not load either"; "chromium: a site without the scratchpad's code still runs a box, and keeps the scratchpad's tab hidden"; "chromium: and the scratchpad's tab stays hidden" |
| `wire.mjs` imports `scratchpad.mjs` statically again (`import { wireScratchpad } from "./scratchpad.mjs";` and a plain call) | `page.mjs` | 1 | "chromium: a site without the scratchpad's code still runs a box, and keeps the scratchpad's tab hidden" |
| a cancel's answer heard after New session (in `cancel`, delete `if (n !== sessions) return;`) | `scratchpad-panel.mjs` | 1 | "chromium: New session pressed while a cancel is on its way starts one fresh session, its transcript jshell's banner alone"; "chromium: no page error" |
| the unsupported sheet leaves the page's end no room (`function sheet() {}` in `scratchpadCannot`) | `scratchpad-panel.mjs` | 1 | "chromium: without WasmGC: scrolled to its end, the page's Previous and Next links stay above the sheet"; "chromium: without WebAssembly SIMD: scrolled to its end, the page's Previous and Next links stay above the sheet"; "chromium: without WebAssembly bulk memory: scrolled to its end, the page's Previous and Next links stay above the sheet"; "chromium: on a page that is not secure (no crypto.subtle): scrolled to its end, the page's Previous and Next links stay above the sheet" |
| Enter on an empty line at a plain prompt does nothing again (`if (!continuing && !input.value.trim()) return;` at the top of `enter`) | `scratchpad-panel.mjs` | 1 | "chromium: Enter on an empty line at the prompt sends it to the front end, which answers with its prompt" |
| `send` skips an empty line at a plain prompt again (`if (!continuing && !line.trim()) continue;` before its echo) | `scratchpad-panel.mjs` | 1 | "chromium: Enter on an empty line at the prompt sends it to the front end, which answers with its prompt" |
| a page opened with a history throws (`if (readHistory().length) setTimeout(() => { throw new Error("a page opened with a history"); });` at the end of `wireScratchpad`) | `scratchpad-panel.mjs` | 1 | "chromium: no page error after the reload" |

The Cache Storage break was also run in WebKit and Firefox: exit 1 in each, failing the same check there, and only it ("webkit: and opened there, it downloads only the manifest: jshell's files come from the browser's cache"; "firefox: and opened there, it downloads only the manifest: jshell's files come from the browser's cache").

Also break `PagesTest` twice, restoring after each: remove `hidden` from the tab in `web/page.html`, and `$J
build/BuildTest.java PagesTest` exits 1, `10 test(s), 1 failed`: `testEveryRenderedPageCarriesTheScratchpadHiddenAndShut`
(`00-front-matter: the scratchpad's tab, hidden`); take `page/compose.mjs` out of `WEB_SCRIPTS`, and it exits 1, `10
test(s), 1 failed`: `testThePagesScriptsArePublishedByNameAndNothingElseFromWeb` (`page/compose.mjs published`). Run so in
the scratch repository, which had no Task 2: `9 test(s), 1 failed` there, each time.

Every check above fails under at least one break in the table, except the harness's gates: "no request left the
page's origin" and the four unsupported cases' "no page error" are `web/test/harness.mjs`'s page-error and offsite
gates, each proven by an on-purpose break when Plan 3 built them. "no page error after the reload" is not one: it reads
the test's own listener on the second page, and the table's break that makes only a page with a history throw fails
it.

- [ ] **Step 8: Commit**

```bash
git add web/page.html web/app.css web/page/support.mjs web/app.mjs web/page/wire.mjs web/page/scratchpad.mjs build/Pages.java build/PagesTest.java web/test/scratchpad-panel.mjs web/test/page.mjs
git commit
```
The message records: why the panel speaks one line per request; why the page keeps one client (the storage-refused
download); why the banner is printed by the panel and the first `ready` waits for it; why the prompts are the front
end's and the panel answers no command (D62); why output is batched per animation frame and why the check measures time
to the whole output, not frame gaps (the numbers in Step 4); why a restart has words of its own and the about line
says what Stop costs and how to leave `...>`; which endings start a fresh session by themselves and why
not `exited` or `failed-to-load` (a restart past its deadline among the latter); the SIMD and bulk-memory probes and
their controls; the test hook (`window.jfScratchpadLimits`) and that no page sets it; how a reader leaves a `...>`
continuation; why an empty line goes to the front end; why a cancel's answer after New session is dropped; why the
unsupported sheet leaves the page's end room too; why the scratchpad loads apart from the boxes; what each engine did on
the second page's open (Cache Storage); and every on-purpose break above with its exit code.

### Task 6: the scratchpad in three browsers

**Files:**
- Create: `web/test/scratchpad.mjs`
- Modify: `web/test/page.mjs` (a page that is read, its boxes run, downloads nothing of the scratchpad)

**Interfaces:**
- Consumes: Task 5's panel and its test surface (`data-state`, `data-session`, `data-ended`, `.scratch-note`, the
  `.caret`, Stop, `window.jfScratchpadLimits`, and `data-scratchpad`, set once the panel is wired, which Task 5's
  `wire.mjs` does apart from the boxes, a moment after `data-java`); Task 2's `site/scratchpad/` in the fixture site
  `harness.buildSite` builds (Ristretto's five files and the course's jar, which the client composes in the browser);
  Task 3's `JShellSession` and `web/test/jshell-node.mjs`'s `nodeWorker`, `nodeFetchBytes` and `dirUrl` (`new
  JShellSession(dirUrl(dir), { createWorker: nodeWorker, fetchBytes: nodeFetchBytes, caches: null, onOutput })`, whose
  `start()` gives `{ banner, prompt }` and each answer its `prompt`); the client starts the worker at
  `worker.js?v=<the manifest's version>`, which this test reads from the site's `scratchpad/manifest.json`.
- Produces: `node web/test/scratchpad.mjs [chromium|webkit|firefox]`, exit 0, 1 or 2 as the other browser tests; its
  printed open-to-ready time per engine, split by phase, the first entry's time and the `/reset`'s time per engine,
  which Task 7's and Task 8's timing sentences use.

This is the real thing: Ristretto's pinned worker and files and the course's front end, composed by the client in the
browser, from the built fixture site, in each engine at 390 px (phone contexts for Chromium and WebKit; Firefox has no
`isMobile`). It does not repeat the panel's checks (`scratchpad-panel.mjs`, Task 5); it checks what only the real jshell
can show: that the bytes load only on open, seven requests in all, the worker under the manifest's version; that the panel says each real phase in turn, with
Firefox's minute where Firefox spends it; that the panel shows exactly what the same client shows under Node (where Task
4 holds that client to the real jshell), banner and the front end's prompts included, blank lines and all; that a
`StackOverflowError`'s trace (1,025 lines: the front end shows 1,024 frames) arrives whole and the session lives on;
that a real `/reset` says a fresh jshell is starting while the fresh VM starts (the panel's restart words, with the
timer and no time claimed), prints no banner and forgets the session's variables; that Stop terminates the real worker and a fresh session has forgotten everything (read from what any jshell
front end says of a name it does not know, the error naming it and no value); that memory used up ends a session in the
course's words with none of the engine's, and a fresh one starts; that the client's output cap fires before Ristretto's
own for one-byte characters, and Ristretto's own stop, in the engine's words, for two-byte ones; that memory past 2 GiB,
which is how a long session ends, ends it in the course's words though each engine's glue fails with a RangeError of its
own (V8's, WebKit's and Firefox's differ, and Task 3's client knows all three); that the backstop ends a real endless
loop; and that nothing leaves the origin. jshell is booted seven times per engine (the first open, the fresh VM of the
`/reset`, the fresh sessions after Stop, after memory runs out, after the output cap and after Ristretto's own stop, and a
second page whose backstop the test hook shortens to 5 s); the session that memory past 2 GiB ends is not waited for. The boot
allowance is 250 s, above the client's 240 s, so a slow Firefox fails on the client's own words, not on the test's clock.

- [ ] **Step 1: Write the test**

Create `web/test/scratchpad.mjs`:
```js
/*
 *  Copyright 2026 Java Foundations contributors.
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
// The scratchpad in Chromium, WebKit and Firefox with the real jshell: Ristretto's pinned files and the course's
// front end, composed in the browser, from the built site, at 390 px. It downloads nothing until it is opened; then it
// says what it is doing, phase by phase; it answers, character for character and prompt for prompt, as the same client
// answers under Node; it continues an unfinished line, shows a StackOverflowError's trace whole and lives on, restarts
// with /reset (saying so while the fresh VM starts, and forgetting the session's variables), stops a runaway and starts
// afresh, ends a session whose memory runs out and starts afresh, ends an entry at the output cap, at Ristretto's own
// output stop and at the backstop, ends a session whose memory passes 2 GiB (this browser's own RangeError), and talks
// to nobody. Firefox takes about a minute to start jshell, so every open has a 250-second allowance. Each
// engine prints how long the open took, phase by phase, the first entry and the /reset. The panel's own behavior,
// against a stand-in worker, is web/test/scratchpad-panel.mjs.
//   node web/test/scratchpad.mjs [chromium|webkit|firefox]
import fs from "node:fs";
import path from "node:path";
import { REPO, ENGINES, check, done, buildSite, open } from "./harness.mjs";
import { JShellSession } from "../page/jshell-session.mjs";
import { nodeWorker, nodeFetchBytes, dirUrl } from "./jshell-node.mjs";

const only = process.argv[2];
if (only && !ENGINES[only]) { console.log("usage: node web/test/scratchpad.mjs [chromium|webkit|firefox]"); process.exit(2); }
const site = path.join(buildSite(path.join(REPO, "web/test/vol-page"), "scratchpad-test"), "site");
const PAGE = "vol-page/ch01-run.html";
// The manifest's version, under which the client starts worker.js (worker.js?v=<version>).
const VERSION = JSON.parse(fs.readFileSync(path.join(site, "scratchpad/manifest.json"), "utf8")).version;
const BOOT_MS = 250_000; // the client's own boot deadline is 240 s
const ENTRY_MS = 120_000; // the slowest entry below, f(0), took 6.8 s under Node
const PHASE_WORDS = ["Downloading jshell (about 24 MB, once) and checking it", "Starting Java",
  "Starting jshell, which takes about 10 seconds in Chrome and Safari and about a minute in Firefox"];
const RESTARTING = /^Starting a fresh jshell… (\d+) s$/; // the note while /reset restarts: no time claimed
// What a reader might type first: values, a variable, an empty line (the front end answers it with its prompt), a
// method over three lines, an error; a program's own System.err; then endless recursion, whose trace (the front end
// shows its first 1,024 frames) must arrive whole, and an entry after it, which shows the session lived through it;
// then /reset, after which x is gone, and x again.
const LINES = ["2 + 3", "int x = 10", "x * 2", "", "int twice(int n) {", "    return n * 2;", "}", "twice(x)", "y + 1",
  "\"hi\".repeat(3)", "System.err.println(\"to stderr\")", "int f(int n) { return f(n + 1); }", "f(0)", "\"hi\".length()",
  "/reset", "x", "int x = 10"];
const TRACE = LINES.indexOf("f(0)"), RESET = LINES.indexOf("/reset");
const TRACE_LINES = 1025; // the exception's line and 1,024 frames (TraceBlock.java's MOST_FRAMES)
const MEMORY = "var l = new ArrayList<long[]>(); while (true) l.add(new long[1_000_000]);";

// The same lines through the same client under Node (Ristretto's worker in a worker thread), on the same files: the
// transcript each browser must show, character for character (jshell's banner, the echo of each line after the prompt
// the front end gave for it, then jshell's output).
let expected = "";
const marks = []; // how long the expected transcript is after each line
const ns = new JShellSession(dirUrl(path.join(site, "scratchpad")), { createWorker: nodeWorker, fetchBytes: nodeFetchBytes,
  caches: null, onOutput: (text) => { expected += text; } });
let { banner, prompt } = await ns.start();
expected += banner; // after anything onOutput gave meanwhile, as the panel prints it
for (const line of LINES) {
  expected += `${prompt}${line}\n`;
  const r = await ns.submit(line);
  if (r.status !== "ready") { console.log(`under Node, ${JSON.stringify(line)} ended the session: ${r.reason}`); process.exit(1); }
  prompt = r.prompt;
  marks.push(expected.length);
}
ns.stop();
const trace = expected.slice(marks[TRACE - 1], marks[TRACE]).split("\n")
  .filter((l) => l.startsWith("|  Exception") || l.startsWith("|        at "));
const reset = expected.slice(marks[RESET - 1], marks[RESET + 1]);
// Without these, a client broken the same way in Node and in the browser would pass the comparison below.
check("under Node: jshell's welcome, its prompts with their blank lines, values, an empty line, a method, an error, System.err and the trace, as jshell prints them",
  expected.startsWith("|  Welcome to JShell -- Version 25.0.4.1\n|  For an introduction type: /help intro\n\njshell> 2 + 3\n$1 ==> 5\n\njshell> int x = 10\n")
    && expected.includes("\njshell> \n\njshell> int twice(int n) {\n   ...>     return n * 2;\n   ...> }\n|  created method twice(int)\n")
    && expected.includes("|    symbol:   variable y\n") && expected.includes('\njshell> System.err.println("to stderr")\nto stderr\n')
    && trace.length === TRACE_LINES && trace[0].startsWith("|  Exception java.lang.StackOverflowError")
    && /\n\$\d+ ==> 2\n$/.test(expected.slice(0, marks[RESET - 1])), { head: expected.slice(0, 400), traceLines: trace.length });
check("under Node: /reset prints no banner, and x is gone after it",
  reset.startsWith("\njshell> /reset\n|  Resetting state.\n\njshell> x\n|  Error:\n|  cannot find symbol\n|    symbol:   variable x\n")
    && !reset.includes("Welcome") && expected.endsWith("\njshell> int x = 10\nx ==> 10\n"), reset);

// Runs in the page before its own scripts: every worker the scratchpad makes is recorded, with when it was made and
// when the page terminated it; so is each new thing the panel's note says (without its timer), with when, and each
// moment data-state turns ready.
const WATCH = () => {
  const Real = window.Worker;
  window.jfWorkers = [];
  window.Worker = class Worker extends Real {
    constructor(u, options) {
      super(u, options);
      // worker.js?v=<the manifest's version>, as the client starts it
      if (/\/scratchpad\/worker\.js(\?|$)/.test(String(u))) window.jfWorkers.push(this.jf = { made: performance.now(), terminated: null });
    }
    terminate() {
      if (this.jf && this.jf.terminated == null) this.jf.terminated = performance.now();
      return super.terminate();
    }
  };
  window.jfNotes = [];
  window.jfReadyAt = [];
  document.addEventListener("DOMContentLoaded", () => {
    const p = document.getElementById("scratchpad");
    if (!p) return; // Firefox runs this in about:blank too
    const note = p.querySelector(".scratch-note");
    new MutationObserver(() => { if (p.dataset.state === "ready") window.jfReadyAt.push(performance.now()); })
      .observe(p, { attributes: true, attributeFilter: ["data-state"] });
    let last = ""; // what the note said last, "" once it is cleared, so a restart's words are recorded again
    new MutationObserver(() => {
      const words = note.textContent.replace(/… \d+ s$/, "");
      if (words && words !== last) window.jfNotes.push({ words, at: performance.now() });
      last = words;
    }).observe(note, { childList: true, characterData: true, subtree: true });
  });
};
const SCRATCH_URL = /\/scratchpad\//;
const within = (ms, p) => Promise.race([p, new Promise((r) => setTimeout(() => r(false), ms))]);
const until = (t, fn, arg, ms) => within(ms + 5000, t.page.waitForFunction(fn, arg, { timeout: ms, polling: 250 }).then(() => true, () => false));

for (const engine of only ? [only] : Object.keys(ENGINES)) {
  console.log(engine);
  // A phone's 390 px (Firefox has no isMobile: a desktop window 390 px wide).
  const PHONE = { viewport: { width: 390, height: 844 }, ...(engine === "firefox" ? {} : { isMobile: true }) };
  let t = await open(engine, site, PAGE, PHONE, WATCH);
  const panel = t.page.locator("#scratchpad");
  const input = t.page.locator("#scratchpad .entry textarea");
  const text = async () => (await panel.locator(".transcript").textContent()) ?? "";
  const ready = (ms = ENTRY_MS) => until(t, () => document.getElementById("scratchpad").dataset.state === "ready", null, ms);
  const fresh = (n) => until(t, (n) => document.getElementById("scratchpad").dataset.session === String(n)
    && document.getElementById("scratchpad").dataset.state === "ready", n, BOOT_MS);
  const type = async (line) => { await input.fill(line); await input.press("Enter"); };
  await t.page.waitForFunction(() => document.documentElement.dataset.java && document.documentElement.dataset.scratchpad);

  check(`${engine}: the tab shows, and nothing of the scratchpad has downloaded`,
    await t.page.locator(".scratch-tab").isVisible() && !t.requests.some((u) => SCRATCH_URL.test(u)), t.requests.filter((u) => SCRATCH_URL.test(u)));
  const opened = Date.now();
  await t.page.locator(".scratch-tab").click();
  await t.page.waitForTimeout(2500);
  const note = await panel.locator(".scratch-note").textContent();
  check(`${engine}: 2.5 s into the open, the panel says jshell is starting, Firefox's minute included, and counts the seconds (D54)`,
    note.startsWith(PHASE_WORDS[2]) && Number((note.match(/(\d+) s$/) ?? [])[1]) >= 2, note);
  const up = await ready(BOOT_MS);
  const phases = await t.page.evaluate(() => ({ notes: window.jfNotes, readyAt: window.jfReadyAt[0] }));
  const at = phases.notes.map((n) => n.at).concat(phases.readyAt);
  const s = (i) => ((at[i + 1] - at[i]) / 1000).toFixed(1);
  console.log(`      ${engine}: open to ready in ${Math.round((Date.now() - opened) / 1000)} s (download ${s(0)} s, Java ${s(1)} s, jshell ${s(2)} s)`);
  check(`${engine}: it said each phase in turn: the download, Java, then jshell`,
    JSON.stringify(phases.notes.map((n) => n.words)) === JSON.stringify(PHASE_WORDS), phases);
  const scratch = t.requests.filter((u) => SCRATCH_URL.test(u)).map((u) => u.replace(/.*\/scratchpad\//, ""));
  const fetched = [...new Set(scratch)].sort();
  check(`${engine}: jshell opens, from the six pinned files and the manifest, seven requests, the worker under the manifest's version`,
    up && scratch.length === 7 && JSON.stringify(fetched) === JSON.stringify(["browser-jshell.jar", "jdk.zip", "manifest.json",
      "runner.core.wasm", "runner.core2.wasm", "runner.core3.wasm", `worker.js?v=${VERSION}`]), { up, scratch });

  let caretMore = null, resetNote = null;
  for (const [i, line] of LINES.entries()) {
    const sent = await t.page.evaluate(() => performance.now());
    await type(line);
    if (i === RESET) {
      await t.page.waitForTimeout(2500);
      resetNote = await panel.locator(".scratch-note").textContent();
    }
    await ready(i === RESET ? BOOT_MS : ENTRY_MS);
    const took = await t.page.evaluate((s) => ((window.jfReadyAt[window.jfReadyAt.length - 1] - s) / 1000).toFixed(1), sent);
    if (i === 0) console.log(`      ${engine}: the first entry (${line}) answered in ${took} s`);
    if (i === RESET) console.log(`      ${engine}: /reset answered in ${took} s`);
    if (line === "int twice(int n) {") caretMore = await panel.locator(".caret").textContent();
    if (i === 8) {
      const got = await text();
      check(`${engine}: jshell's banner and nine entries show exactly what the client shows under Node, prompts included`,
        got === expected.slice(0, marks[8]), { got: got.slice(-400), want: expected.slice(marks[8] - 400, marks[8]) });
      check(`${engine}: an unfinished line continues at ...>`, caretMore === "   ...>", caretMore);
    }
  }
  const all = await text();
  check(`${engine}: a ${TRACE_LINES.toLocaleString("en-US")}-line StackOverflowError trace arrives whole, and every entry after it, /reset among them, shows what the client shows under Node`,
    all === expected, { length: [all.length, expected.length], tail: all.slice(-200) });
  const afterReset = all.slice(all.lastIndexOf("\njshell> /reset\n"));
  check(`${engine}: a real /reset says a fresh jshell is starting while the fresh VM starts, counting the seconds (D54), prints no banner, and x is gone`,
    Number((resetNote.match(RESTARTING) ?? [])[1]) >= 2
      && afterReset.startsWith("\njshell> /reset\n|  Resetting state.\n\njshell> x\n|  Error:\n|  cannot find symbol\n|    symbol:   variable x\n")
      && !afterReset.includes("Welcome"), { resetNote, afterReset: afterReset.slice(0, 300) });
  const wide = await t.page.evaluate(() => {
    const p = document.getElementById("scratchpad"), tr = p.querySelector(".transcript");
    tr.scrollLeft = 100000; // the trace's first line is wider than a phone: only a transcript that scrolls moves
    return { page: document.documentElement.scrollWidth, sheetW: [p.scrollWidth, p.clientWidth, Math.round(p.getBoundingClientRect().right)],
      innerW: innerWidth, sheetH: p.offsetHeight, innerH: innerHeight, trMoved: tr.scrollLeft > 0 };
  });
  check(`${engine}: at 390 px with the trace shown, only the transcript scrolls sideways, and the sheet keeps to 60% of the height`,
    wide.page <= 390 && wide.sheetW[0] <= wide.sheetW[1] && wide.sheetW[2] <= wide.innerW && wide.trMoved && wide.sheetH <= wide.innerH * 0.6 + 1, wide);

  // A runaway: Stop terminates jshell's worker at once, the panel says what that cost, and a fresh session starts,
  // which no longer knows x (defined again after the /reset).
  await type("while (true) {}");
  await until(t, () => document.getElementById("scratchpad").dataset.state === "busy", null, 10000);
  await t.page.waitForTimeout(1000);
  const busy = { stop: await panel.locator(".scratch-stop").isVisible(), editable: await input.isEditable(), disabled: await input.isDisabled() };
  check(`${engine}: while an entry runs, Stop shows and the input is read-only`, busy.stop && !busy.editable && !busy.disabled, busy);
  const clicked = await t.page.evaluate(() => performance.now());
  await panel.locator(".scratch-stop").click();
  await until(t, () => window.jfWorkers[0].terminated != null, null, 5000);
  const lag = await t.page.evaluate((at) => window.jfWorkers[0].terminated == null ? null : window.jfWorkers[0].terminated - at, clicked);
  check(`${engine}: Stop terminates jshell's worker at once`, lag != null && lag < 2000, lag);
  const restarted = await fresh(2);
  check(`${engine}: says so in plain words, and a fresh session starts`,
    restarted && (await text()).includes("\njshell> while (true) {}\nStopped. The session ended, and its variables and methods are gone.\n|  Welcome to JShell")
      && await t.page.evaluate(() => window.jfWorkers.length) === 2, { restarted, tail: (await text()).slice(-300) });
  await type("x");
  await ready();
  // Only what any jshell front end says of a name it does not know: the error naming it, and no value.
  const afterX = (await text()).split("jshell> x\n").pop();
  check(`${engine}: the fresh session has forgotten x`,
    afterX.includes("cannot find symbol") && afterX.includes("variable x") && !afterX.includes("==>"), afterX.slice(0, 300));

  // Memory used up: the engine aborts (a Rust abort, never java.lang.OutOfMemoryError, D49); the reader reads the
  // course's words and none of the engine's, and a fresh session starts.
  await type(MEMORY);
  const t0 = Date.now();
  const oom = await until(t, () => document.getElementById("scratchpad").dataset.ended === "out-of-memory", null, ENTRY_MS);
  const oomMs = Date.now() - t0;
  const restarted2 = await fresh(3);
  const afterOom = await text();
  check(`${engine}: memory used up ends the session in plain words (${oomMs} ms), with no engine text, and a fresh session starts`,
    oom && restarted2 && afterOom.includes(`\njshell> ${MEMORY}\nl ==> []\nThis session ran out of memory, so it ended`)
      && !/memory allocation|RUST_BACKTRACE|panicked|unreachable/.test(afterOom), { oom, restarted2, tail: afterOom.slice(-400) });

  // Endless printing ends at the client's cap (1,000,000 characters: fewer than 1,000 of these lines shown), before
  // Ristretto's own 1 MiB stop (1,048,576 bytes, 1,047 of these lines), so the course's limit is the one a reader meets
  // (for text of one-byte characters; Ristretto counts UTF-8 bytes, so wider ones meet its stop first).
  await type('while (true) System.out.println("x".repeat(1000))');
  const capped = await until(t, () => document.getElementById("scratchpad").dataset.ended === "output-limit", null, ENTRY_MS);
  const printed = (await text()).split("x".repeat(1000) + "\n").length - 1;
  check(`${engine}: endless printing stops at the course's output cap (${printed} lines shown), in plain words`,
    capped && printed > 900 && printed < 1000 && (await text()).includes("This entry printed more than the scratchpad can show, so it was stopped."),
    { capped, printed, tail: (await text()).slice(-300) });

  // The engine's other two ways of giving out, in this browser: Ristretto's own 1 MiB stop, in the engine's words,
  // which a two-byte character meets before the client's caps (524 lines of these); and memory past 2 GiB, which is
  // how a long session ends: the worker's glue then fails with this browser's own RangeError (V8, WebKit and Firefox
  // word it differently, and the client knows all three). One entry holding 2 GB gets there at once.
  const restarted3 = await fresh(4);
  await type('while (true) System.out.println("é".repeat(1000))');
  const restarted4 = await fresh(5);
  const afterWide = await text();
  const twoByte = afterWide.split("é".repeat(1000) + "\n").length - 1;
  check(`${engine}: endless printing of a two-byte character meets Ristretto's own 1 MiB stop first (${twoByte} lines shown), in plain words, and a fresh session starts`,
    restarted3 && restarted4 && twoByte > 400 && twoByte < 600 && await panel.getAttribute("data-ended") === "output-limit"
      && afterWide.includes(`${"é".repeat(1000)}\nThis entry printed more than the scratchpad can show, so it was stopped.`),
    { restarted3, restarted4, twoByte, tail: afterWide.slice(-300) });
  await type("long[][] big = new long[260][]; for (int i = 0; i < 260; i++) big[i] = new long[1_000_000];");
  const held = await ready();
  await type("1 + 1");
  const gone = await until(t, () => document.getElementById("scratchpad").dataset.ended === "out-of-memory", null, ENTRY_MS);
  const afterBig = await text();
  check(`${engine}: memory past 2 GiB (2 GB held by one entry: how a long session ends) ends the session at the next entry in plain words, with nothing of the engine's`,
    held && gone && /\nbig ==> long\[260\]\[\] \{[^\n]*\}\n\njshell> 1 \+ 1\nThis session ran out of memory, so it ended/.test(afterBig)
      && !/Start offset|byteOffset|out-of-range|unreachable|RUST_BACKTRACE/.test(afterBig), { held, gone, tail: afterBig.slice(-400) });
  check(`${engine}: no request left the page's origin`, t.offsite.length === 0, t.offsite);
  check(`${engine}: no page error`, t.errors.length === 0, t.errors);
  await t.close();

  // The backstop, shortened to 5 s by the page's test hook (it is 60 s for readers): an endless loop ends there.
  t = await open(engine, site, PAGE, PHONE, `(${WATCH})();\nwindow.jfScratchpadLimits = { deadlineMs: 5000 };`);
  await t.page.waitForFunction(() => document.documentElement.dataset.java && document.documentElement.dataset.scratchpad);
  await t.page.locator(".scratch-tab").click();
  const up2 = await until(t, () => document.getElementById("scratchpad").dataset.state === "ready", null, BOOT_MS);
  await t.page.locator("#scratchpad .entry textarea").fill("while (true) {}");
  await t.page.locator("#scratchpad .entry textarea").press("Enter");
  const sent = await t.page.evaluate(() => performance.now());
  const ended = await until(t, () => document.getElementById("scratchpad").dataset.ended === "timeout", null, 20000);
  const stopAt = await t.page.evaluate((s) => window.jfWorkers[0].terminated == null ? null : window.jfWorkers[0].terminated - s, sent);
  check(`${engine}: an endless loop ends at the backstop, in plain words`,
    up2 && ended && stopAt != null && stopAt >= 4500 && stopAt < 8000
      && (await t.page.locator("#scratchpad .transcript").textContent()).includes("This entry ran for 5 seconds without finishing, so it was stopped."), { up2, ended, stopAt });
  check(`${engine}: no request left the page's origin (backstop)`, t.offsite.length === 0, t.offsite);
  check(`${engine}: no page error (backstop)`, t.errors.length === 0, t.errors);
  await t.close();
}
done();
```
Why the comparison is with Node, not with fixed strings: Task 4 proves the client's output against the real jshell
entry by entry; this test proves the page shows the client's output unchanged, banner and prompts included, in each
engine (the research found Ristretto's output identical in Node and the three browsers). The expected transcript is
built from the prompts the front end gave under Node, so it carries the real tool's blank line before each normal-mode
prompt. The two `under Node` checks pin the comparison's own side, so a client broken the same way in both places (its
banner sent twice, or its prompts dropped) still fails.

Why the output cap check counts lines: Task 3 ends a session as `output-limit` both at its own cap (1,000,000
characters) and at Ristretto's own stop (1 MiB of UTF-8, which with the course's front end arrives as the engine's
error, `Output exceeded 1 MiB; execution stopped.`), so the words alone cannot tell which fired. Under the course's cap
fewer than 1,000 of these 1,000-character lines reach the page (999 in every engine); under Ristretto's, 1,047. The
two-byte check counts them too: Ristretto's stop lets 524 of its lines through (2,001 bytes each), where the client's caps
would let 999, so fewer than 600 shows Ristretto's own stop fired; a client that did not know the engine's wording would
call it a crash (`data-ended` `crashed`).

In `web/test/page.mjs`: after `const RUNTIME_URL = ...` add
```js
// What only the scratchpad downloads, and only once the reader opens it (D29).
const SCRATCHPAD_URL = /\/scratchpad\//;
```
and after `` check(`${engine}: no page error while running`, ...) ``, when every box on the page has run:
```js
  check(`${engine}: a page that is read, its boxes run, downloads nothing of the scratchpad (D29)`,
    !t.requests.some((u) => SCRATCHPAD_URL.test(u)), t.requests.filter((u) => SCRATCHPAD_URL.test(u)));
  // Without this the check above could pass only because the listener never sees the scratchpad's requests.
  await t.page.locator(".scratch-tab").click();
  for (const end = Date.now() + 10000; !t.requests.some((u) => /\/scratchpad\/manifest\.json$/.test(u)) && Date.now() < end;)
    await new Promise((r) => setTimeout(r, 25));
  check(`${engine}: and the test sees the scratchpad's requests once its panel opens`,
    t.requests.some((u) => /\/scratchpad\/manifest\.json$/.test(u)), t.requests.filter((u) => SCRATCHPAD_URL.test(u)));
```
(The page closes a moment later; the boot it started dies with it.)

- [ ] **Step 2: Run it**

Run: `node web/test/scratchpad.mjs`
Expected: `68 check(s), 0 failed`, exit 0 (two Node checks, then 22 per engine), each engine printing `open to ready in
<n> s (download <a> s, Java <b> s, jshell <c> s)`, `the first entry (2 + 3) answered in <e> s` and `/reset answered in
<r> s`. Seen in scratch, 660 s for the three (475 s before the engine's own stop and memory past 2 GiB joined, with their
two boots): chromium `open to ready in 10 s (download 0.1 s, Java 0.4 s, jshell 9.4 s)`, its first entry in 1.9 s and its
`/reset` in 8.2 s; webkit `10 s (0.1, 0.9, 8.4)`, 1.7 s and 7.3 s; firefox `56 s (0.2, 0.4, 55.7)`, 5.2 s and 14.9 s;
memory ran out in 2.5, 2.3 and 5.1 s; the client's cap left 999 lines on screen in each, Ristretto's own stop 524; memory
past 2 GiB ended each session at its next entry, as out-of-memory.
Record the times for the commit message and Task 7.
Run: `node web/test/page.mjs`
Expected: every check passes in all three engines, exit 0, two more per engine than after Task 5
(in scratch, with both tasks' additions: 99, 99 and 91, `289 check(s), 0 failed`, 191 s).

If Firefox's open passes 240 s on this machine, the client ends the load as `failed-to-load` and the run fails: report
the times, do not raise the allowance (DESIGN's timing sentence depends on them, and Task 8 measures a stock Firefox).

- [ ] **Step 3: Break each check on purpose**

One at a time, rerun in Chromium, restore. Each was applied to its own scratch copy of the repository and run.

| Break | Test | Exit | What failed (Chromium, as run) |
|---|---|---|---|
| `wireScratchpad` starts a session as it wires the page (`opened = true; begin();` before `tab.hidden = false`) | `scratchpad.mjs` | 1 | "chromium: the tab shows, and nothing of the scratchpad has downloaded" |
| `onProgress` ignored (`onProgress: () => {}`) | `scratchpad.mjs` | 1 | "chromium: 2.5 s into the open, the panel says jshell is starting, Firefox's minute included, and counts the seconds (D54)"; "chromium: it said each phase in turn: the download, Java, then jshell"; "chromium: a real /reset says a fresh jshell is starting while the fresh VM starts, counting the seconds (D54), prints no banner, and x is gone" |
| the `engine` and `jshell` words swapped in `PHASES` (Firefox's minute said while Java starts) | `scratchpad.mjs` | 1 | "chromium: 2.5 s into the open, the panel says jshell is starting, Firefox's minute included, and counts the seconds (D54)"; "chromium: it said each phase in turn: the download, Java, then jshell" |
| no progress words while `busy` (`onProgress` calls `working` only when the session is not `busy`), so a `/reset` or `/reload` waits in silence | `scratchpad.mjs` | 1 | "chromium: a real /reset says a fresh jshell is starting while the fresh VM starts, counting the seconds (D54), prints no banner, and x is gone" |
| the banner from `start()` is not printed (drop `show(started.banner);` in `begin`) | `scratchpad.mjs` | 1 | "chromium: jshell's banner and nine entries show exactly what the client shows under Node, prompts included"; "chromium: a 1,025-line StackOverflowError trace arrives whole, and every entry after it, /reset among them, shows what the client shows under Node"; "chromium: says so in plain words, and a fresh session starts" |
| Task 3's client also sends the banner through `onOutput` (`this.onOutput(r.output, "stdout");` after `this.banner = r.output;`), so the page and Node both show it twice | `scratchpad.mjs` | 1 | "under Node: jshell's welcome, its prompts with their blank lines, values, an empty line, a method, an error, System.err and the trace, as jshell prints them" |
| the panel drops `stderr` output | `scratchpad.mjs` | 1 | "chromium: a 1,025-line StackOverflowError trace arrives whole, and every entry after it, /reset among them, shows what the client shows under Node" |
| `TRIM_CHARS` is 200,000 | `scratchpad.mjs` | 1 | "chromium: endless printing stops at the course's output cap (199 lines shown), in plain words"; "chromium: endless printing of a two-byte character meets Ristretto's own 1 MiB stop first (199 lines shown), in plain words, and a fresh session starts" |
| Stop calls `session.cancel()` instead of `session.stop()` | `scratchpad.mjs` | 1 | "chromium: Stop terminates jshell's worker at once"; "chromium: says so in plain words, and a fresh session starts"; "chromium: no page error" |
| no fresh session after any ending (`RESTARTS = []`) | `scratchpad.mjs` | 1 | "chromium: says so in plain words, and a fresh session starts"; "chromium: memory used up ends the session in plain words (2520 ms), with no engine text, and a fresh session starts"; "chromium: endless printing of a two-byte character meets Ristretto's own 1 MiB stop first (524 lines shown), in plain words, and a fresh session starts" |
| no fresh session after memory runs out (`"out-of-memory"` taken out of `RESTARTS`) | `scratchpad.mjs` | 1 | "chromium: memory used up ends the session in plain words (2521 ms), with no engine text, and a fresh session starts" |
| Task 3's client drops its character cap, keeping the line cap (Ristretto's own 1 MiB stop then ends the entry, also as `output-limit`) | `scratchpad.mjs` | 1 | "chromium: endless printing stops at the course's output cap (1047 lines shown), in plain words" |
| `wire.mjs` does not pass `window.jfScratchpadLimits` | `scratchpad.mjs` | 1 | "chromium: an endless loop ends at the backstop, in plain words" |
| the transcript does not scroll (`overflow: visible` in `.scratchpad pre.transcript`; merely dropping its `overflow: auto` is no break, since `pre:not(.output):not(.reference)` still gives it `overflow-x: auto`) | `scratchpad.mjs` | 1 | "chromium: at 390 px with the trace shown, only the transcript scrolls sideways, and the sheet keeps to 60% of the height" |
| no height limit on the sheet (drop both `max-height` lines in `.scratchpad`) | `scratchpad.mjs` | 1 | "chromium: at 390 px with the trace shown, only the transcript scrolls sideways, and the sheet keeps to 60% of the height" (then the run stops at a later step the break makes impossible) |
| the sheet wider than the phone (`min-width: 30rem` in `.scratchpad`) | `scratchpad.mjs` | 1 | "chromium: at 390 px with the trace shown, only the transcript scrolls sideways, and the sheet keeps to 60% of the height" |
| the caret shows a prompt of the panel's own (`caret.textContent = "jshell>";` in `prompt`) | `scratchpad.mjs` | 1 | "chromium: an unfinished line continues at ...>" |
| the input stays writable while an entry runs (`input.readOnly = s === "loading";`) | `scratchpad.mjs` | 1 | "chromium: while an entry runs, Stop shows and the input is read-only" |
| Task 3's client also downloads `worker.js` before the files (`await this.fetchBytes(new URL("worker.js", this.base).href).catch(() => {});` after the manifest), an eighth request | `scratchpad.mjs` | 1 | "chromium: jshell opens, from the six pinned files and the manifest, seven requests, the worker under the manifest's version" |
| Task 3's client says nothing as a restart line is sent (delete `this.onProgress("jshell");` in `submit`) | `scratchpad.mjs` | 1 | "chromium: a real /reset says a fresh jshell is starting while the fresh VM starts, counting the seconds (D54), prints no banner, and x is gone" |
| Task 3's client hands on no prompt (`const prompt = null;` in `ready`) | `scratchpad.mjs` | 1 | "under Node: jshell's welcome, its prompts with their blank lines, values, an empty line, a method, an error, System.err and the trace, as jshell prints them"; "under Node: /reset prints no banner, and x is gone after it"; "chromium: jshell's banner and nine entries show exactly what the client shows under Node, prompts included"; "chromium: an unfinished line continues at ...>"; "chromium: a 1,025-line StackOverflowError trace arrives whole, and every entry after it, /reset among them, shows what the client shows under Node"; "chromium: a real /reset says a fresh jshell is starting while the fresh VM starts, counting the seconds (D54), prints no banner, and x is gone"; "chromium: says so in plain words, and a fresh session starts"; "chromium: the fresh session has forgotten x"; "chromium: memory used up ends the session in plain words (2520 ms), with no engine text, and a fresh session starts"; "chromium: memory past 2 GiB (2 GB held by one entry: how a long session ends) ends the session at the next entry in plain words, with nothing of the engine's" |
| a restart says the first open's words, Firefox's minute and all (`onProgress: (phase) => working(PHASES[phase] ?? PHASES.jshell)`) | `scratchpad.mjs` | 1 | "chromium: a real /reset says a fresh jshell is starting while the fresh VM starts, counting the seconds (D54), prints no banner, and x is gone" |
| `wireScratchpad` starts a session as it wires the page (`opened = true; begin();` before `tab.hidden = false`) | `page.mjs` | 1 | "chromium: a page that is read, its boxes run, downloads nothing of the scratchpad (D29)" |
| Task 3's client starts the worker at plain `worker.js`, not under the manifest's version | `scratchpad.mjs` | 1 | "chromium: jshell opens, from the six pinned files and the manifest, seven requests, the worker under the manifest's version" |
| Task 3's client knows Ristretto's stop in the worker's wording alone (`ENGINE_OUTPUT_CAP` without `execution`) | `scratchpad.mjs` | 1 | "chromium: endless printing of a two-byte character meets Ristretto's own 1 MiB stop first (524 lines shown), in plain words, and a fresh session starts" |
| Task 3's client knows none of the three RangeError texts (`OUT_OF_MEMORY_ERRORS` emptied) | `scratchpad.mjs` | 1 | "chromium: memory past 2 GiB (2 GB held by one entry: how a long session ends) ends the session at the next entry in plain words, with nothing of the engine's" |
| Task 3's client without V8's RangeError text | `scratchpad.mjs` | 1 | "chromium: memory past 2 GiB (2 GB held by one entry: how a long session ends) ends the session at the next entry in plain words, with nothing of the engine's" |
| Task 3's client without WebKit's RangeError text, run in WebKit | `scratchpad.mjs` (webkit) | 1 | "webkit: memory past 2 GiB (2 GB held by one entry: how a long session ends) ends the session at the next entry in plain words, with nothing of the engine's" |
| Task 3's client without Firefox's RangeError text, run in Firefox | `scratchpad.mjs` (firefox) | 1 | "firefox: memory past 2 GiB (2 GB held by one entry: how a long session ends) ends the session at the next entry in plain words, with nothing of the engine's" |
| `send` skips an empty line at a plain prompt again (`if (!continuing && !line.trim()) continue;` before its echo) | `scratchpad.mjs` | 1 | "chromium: jshell's banner and nine entries show exactly what the client shows under Node, prompts included"; "chromium: a 1,025-line StackOverflowError trace arrives whole, and every entry after it, /reset among them, shows what the client shows under Node" |
| Enter on an empty line at a plain prompt does nothing again (`if (!continuing && !input.value.trim()) return;` at the top of `enter`) | `scratchpad.mjs` | 1 | "chromium: jshell's banner and nine entries show exactly what the client shows under Node, prompts included"; "chromium: a 1,025-line StackOverflowError trace arrives whole, and every entry after it, /reset among them, shows what the client shows under Node" |

Also run, and passed (exit 0) as expected, because each is another test's to catch: the whole input goes as one request (`for (const line of [text])`; this test types one line per Enter, so only Task 5's Shift+Enter check sees it; `24 check(s), 0 failed`, 145 s), and the echo uses prompts of the panel's own (`${continuing ? "   ...> " : "\njshell> "}` in place of `${nextPrompt}`: they are normal mode's, the only mode this test uses, so only Task 5's feedback-mode check sees it; `24 check(s), 0 failed`, 149 s).

Every check above fails under at least one break in the table, except the harness's gates: both "no request left the
page's origin" checks and "no page error (backstop)" are `web/test/harness.mjs`'s gates, proven when Plan 3 built them.

- [ ] **Step 4: Commit**

```bash
git add web/test/scratchpad.mjs web/test/page.mjs
git commit
```
The message records each engine's open-to-ready time split by phase, its first entry's time, its `/reset`'s time, and
the whole run's time per engine; the trace's length with the course's front end (1,025 lines); the output-cap ordering
it relies on (the client's cap at the 1,000th line, Ristretto's own stop at the 1,047th, for one-byte characters; 524
lines of a two-byte character under Ristretto's stop); each engine's time for memory to run out, and that memory past
2 GiB ends a session in each engine through its own RangeError; that the worker is started under the manifest's
version; every on-purpose break with its exit code; and that the roadmap's row is corrected
in Task 7 (the browser test's visit to the scratchpad is this plan's).

### Task 7: DESIGN, README and the roadmap say what the scratchpad is

**Files:**
- Modify: `DESIGN.md` (sections 1, 2, 4, 5, 7), `README.md`, `volumes/README.md`, `docs/superpowers/plans/2026-09-27-roadmap.md`

**Interfaces:**
- Consumes: what Tasks 1-6 built and measured.
- Produces: the spec says what the scratchpad is; Task 8 finalizes the timing sentence after the device trials.

- [ ] **Step 1: DESIGN sections 1 and 2**

Replace the scratchpad bullet in section 2 ("The scratchpad is the real jshell, ...") with:
> - **The scratchpad is a jshell in the browser:** the JDK's own jshell engine (its `jdk.jshell` library) running on
>   Ristretto, a Java virtual machine compiled to WebAssembly, with the course's own front end, written from the real tool's
>   observed output and public documents, never from its source (D55); pinned and served from the site, and loaded only when
>   a reader opens it. It prints what the JDK 25 jshell prints, and a check holds it to the real tool entry by entry: of 562
>   entries, the 72 the course uses among them, 525 are byte-identical and the rest differ only where announced. It starts
>   with the ten imports of jshell's own `DEFAULT_NO_MODULE_IMPORTS` startup plus `java.time.*`, not `import module
>   java.base;` (which doubles the memory each entry uses on Ristretto and slows each by about 60%), so snippet numbers and
>   `/imports` differ from a plain
>   `jshell`; redefining a class in place loses its state where the real tool's local engine would too; JDK stack frames
>   print `(Unknown Source)`; the virtual machine words a few exception messages itself; and `/help`, and the commands it
>   does not offer, answer in the course's own words. There is no keyboard input (`System.in` is empty, and the scratchpad
>   says so), and `System.exit` ends the session. Opening it downloads about 24 MB, which the browser keeps for the next
>   visit, and takes about 10 seconds in Chrome and Safari and about a minute in Firefox; an entry then takes a couple of
>   seconds (about six for the first one in Firefox); `/reset` starts a fresh virtual machine (under 10 seconds, about 15 in
>   Firefox), and `/reload` then runs the session's entries again. A runaway entry is stopped by the reader or after 60 seconds, and the scratchpad starts a fresh session and
>   says why. Unlike a box, an entry that uses up memory is not reported as `java.lang.OutOfMemoryError`: the engine aborts,
>   the session ends in plain words, and a fresh one starts; a session can use several gigabytes first, so a small device
>   may lose the tab. The memory a session uses is never given back, so a long session ends and starts again: after roughly
>   70 to 150 entries, fewer when entries declare many classes (about 50 in the worst case measured).

(The timings are the headless measurements; Task 8 replaces them with what the author's devices show. If Task 5's second-visit
check found an engine that does not keep the files, "which the browser keeps for the next visit" becomes "which most
browsers keep for the next visit" and names the one that did not.)

In section 2's runaway bullet, scope the promise to the boxes: "**A runaway program is stopped, ...**" becomes "**In a box, a
runaway program is stopped, ...**" (the scratchpad's own sentence above says what happens there). In section 1, "downloads
about 23 MB" becomes "downloads about 24 MB", and "It does run the real jshell well, which is where the course uses it
(section 2)." becomes "It does run the JDK's own jshell engine, which is where the course uses it (section 2)."

- [ ] **Step 2: DESIGN sections 4, 5 and 7**

Section 4: "needing only JDK 25 to build" becomes "needing JDK 25 and the pinned runtime and scratchpad releases (section 7)
to build". Section 5 already says the browser test opens the scratchpad as well as the boxes; leave it, and check that Task 6
made it true. In section 7's "Two engines are pinned" bullet, name what the scratchpad release carries: the course's own jshell front
end (Apache-2.0, built byte-reproducibly from `runtime/jshell/src/` and composed with Ristretto's unmodified zip in the
reader's browser), Ristretto under Apache-2.0 OR MIT (both texts, neither elected), the Rust standard library, wasi-libc and the crates compiled into its
WebAssembly (among them MPL-2.0 and Zlib code), the IJG notice, and the reduced Corretto under GPLv2 with the Classpath
Exception, with the exact Corretto source archive in the release, never extracted here (D51). In the "Clean room" bullet, add
one sentence: nobody opens OpenJDK or Corretto source in any form (a JDK's `lib/src.zip`, a source archive, OpenJDK on the
web); the Corretto archive the scratchpad release ships is downloaded, hashed and copied whole, never extracted or listed
(D51); and the course's jshell front end was written the same way, from the real tool's observed output and public
documents, its derivation log `runtime/jshell/DERIVATION.md` and its disclosures in the squash commit 1d5e57b. (The exact
paths are in the worksheet's D51 entry: `runtime/.work/ristretto/corretto-download-*.tar.gz`,
`runtime/.work/ristretto/inputs/*-25.0.4.10.1.tar.gz`, and the Corretto member of each
`runtime/.work/ristretto/release/*/source.tar.gz` and `release/.tmp-source-*/`.) Say that D53 now holds for both runtimes: a
missing notice, license text or source pointer stops the build, and the boxes' notices are tracked in `runtime/legal/`;
and that each runtime's `SOURCES.txt` carries GPLv2's three-year written offer of the source, asked for in the
repository's issues (D58).

- [ ] **Step 3: README, volumes/README.md, the roadmap**

`README.md`: line 21's "needing only JDK 25" becomes "needing JDK 25 and the runtime and scratchpad releases"; the
scratchpad's release tools (`runtime/ristretto/fetch.sh`, `package.sh`, `verify.sh`) and what they need (the network,
`python3` 3.11 or newer); that a fresh clone builds only after `fetch.sh` and `package.sh` have made a scratchpad release
(about 230 MB of inputs, once), until Plan 4 publishes the release; the build's `--scratchpad` flag; `runtime/legal/` and how
`runtime/release/package.sh` refreshes it; in the license table, a row saying `runtime/legal/` holds third-party notices and
license texts under their own licenses, and that `runtime/jshell/derive/` quotes short pieces of the real tool's output as
evidence; `runtime/jshell/` (the front end: `build.sh`, `DERIVATION.md`, and a change to it only through its clean room); the
paragraph on "the two tests that drive a real browser" names all of them (`runner.mjs`, `page.mjs`, `scratchpad-panel.mjs`,
`scratchpad.mjs`, and `check.mjs --browser`), each failing on any request that leaves the page's origin; the closing
sentence on the runtimes' licenses says TeaVM under Apache-2.0, Ristretto under Apache-2.0 OR MIT (both texts shipped,
neither elected), the course's front end under Apache-2.0, and the OpenJDK and Corretto parts under GPLv2 with the
Classpath Exception;
and the new tests (`node web/test/jshell-session.mjs`, `node runtime/jshell/test/check.mjs` (the one transcript check: the
real tool only through `RealJShell`, never the `jshell` binary) and `node runtime/jshell/test/breaks.mjs`, `node
web/test/scratchpad-panel.mjs [engine]`, `node web/test/scratchpad.mjs [engine]`). `volumes/README.md`'s "What a reader
sees": the scratchpad tab on every chapter page. The roadmap: a Plan 3b row (the scratchpad, this plan); Plan 3's row no
longer says it delivers the scratchpad; and the row that puts the browser test's scratchpad visit in Plan 4 now says Plan 3b
(Plan 3's "Not in this plan", D36 and D38 already did).

- [ ] **Step 4: Commit**

```bash
git add DESIGN.md README.md volumes/README.md docs/superpowers/plans/2026-09-27-roadmap.md
git commit
```

### Task 8: device trials (D50), the final wording, and everything run

- [ ] **Step 1: Stop for the author: how the phone reaches the site**

The trials need the built site on the author's iPhone and in a stock Firefox. `web/serve.mjs` binds 127.0.0.1 only, and the client
verifies files with `crypto.subtle`, which a browser gives only to a secure context: a phone opening `http://<LAN address>` is
not one, so the scratchpad would say it cannot run. Report to the controller, which asks the author (one question, AskUserQuestion)
how the phone should reach the site, with these options and a recommendation: an HTTPS name on the author's own private network if there
is one (for example Tailscale's HTTPS serve), a locally trusted certificate for a LAN name, or another way the author names. Nothing is
exposed beyond the author's own network, and nothing is published.

- [ ] **Step 2: The trials (the author)**

On the iPhone (Safari) and in a stock, release-channel Firefox on the Mac, recording each browser's version (and iOS's):
open a chapter page, open the scratchpad and time it to the first prompt; five entries (`2 + 3`, `int x = 10`, `x * 2`, a
method and a call to it, `"hi".repeat(3)`), timing the first; one error (`int y = "no";`); Stop an endless loop (`while (true)
{}`); a memory runaway (`var a = new java.util.ArrayList<long[]>(); while (true) a.add(new long[1_000_000]);`); start a block
(`for (int i = 0; i < 3; i++) {`) and leave the `...>` continuation without finishing it, on the iPhone with the Cancel button;
`/help`, then `/reset`, timing the reset, then `x` (gone after the reset), and in Firefox a `/reload` after a few entries,
timed; leave the scratchpad open for five minutes and enter
one more line; then open the same chapter page again in a new tab and
time the second open (the files should not download again). On the iPhone also: with the on-screen keyboard up, are the
input and Stop visible; does anything scroll sideways; rotate the phone once; can the page behind the open sheet still be
scrolled to its Previous/Next links. The author reports what was seen and the times; the controller records them in the worksheet.

- [ ] **Step 3: The final wording**

Replace Task 7's timing sentence in DESIGN section 2 with what the devices showed (and, if a device failed a trial, what the page
does there, after a decision by the author). The panel says the same timings while it opens: change the words for the `jshell`
phase in `web/page/scratchpad.mjs` (`PHASES`) and the matching `PHASE_WORDS` in `web/test/scratchpad-panel.mjs` and
`web/test/scratchpad.mjs` with DESIGN, so the page and the spec never disagree, and rerun both browser tests in the three
engines.

- [ ] **Step 4: Run everything**

Each expected to exit 0; report each command's last line: `$J build/BuildTest.java`; `node runtime/test/differential.mjs`,
`smoke.mjs`, `runner-safety.mjs`, `runner-faults.mjs`, `runner-input.mjs`; `node web/test/serve.mjs`, `runner.mjs`,
`replay.mjs`, `check.mjs`, `page.mjs`, `jshell-session.mjs`, `scratchpad-panel.mjs`, `scratchpad.mjs` (the browser tests in
each of `chromium`, `webkit` and `firefox`); `node runtime/jshell/test/check.mjs` (and `--native`, and `--browser` in each
engine) and `node runtime/jshell/test/breaks.mjs`, with the preferences file hashed before and after;
`node runtime/jshell/derive/check-observations.mjs runtime/jshell/DERIVATION.md`;
`node web/test/replay.mjs --site build/.work/page-test`; `sh runtime/ristretto/verify.sh runtime/.work/ristretto/current`;
`$J build/Build.java --check` (prints `no volumes`, exit 0).

- [ ] **Step 5: Commit**

```bash
git add DESIGN.md web/page/scratchpad.mjs web/test/scratchpad-panel.mjs web/test/scratchpad.mjs
git commit
```
The message records the device results and every command's last line.

**As executed (2026-10-03; worksheet D66-D69).** Step 1: the iPhone reached the trial site over HTTPS on the local network with a
mkcert certificate (D66; mkcert's CA trusted on the phone only, a scratch server never committed). Step 2: mobile Safari
opened the scratchpad in 30 seconds to a minute and mobile Edge in 12 seconds (the files downloaded in about 2 seconds; a
second open came from Cache Storage); the author judged the trials done (D68), so Firefox kept Playwright's measured minute and
the rest of the list was not tried on the phone. The phone showed one bug: a tap on the input raised no keyboard, because
the panel focused the input itself and iOS raises its keyboard only for a focus the reader's tap gives. A refocus inside
the tap (D67, 644fc1e) did not help on the device; the fix that did (D69, d6dcc0f, confirmed in mobile Safari and Edge):
on a touch device (`(hover: none) and (pointer: coarse)`) the panel never focuses its input and never makes it read-only,
and Enter waits for a ready jshell on every device. Step 3's wording (5193991) says about 10 seconds in Chrome and Safari
on a computer and up to a minute in Firefox or on a phone. Step 4 ran in full twice, every command exit 0.

## Not in this plan

- Changes to the course's jshell front end itself (`runtime/jshell/src/`): only through its own clean room (Global
  Constraints).
- A rebuild of Ristretto's interpreter from source (D52): a later plan.
- CI (Plan 4). It adds the transcript check (about 130 s under Node, 1.5 to 4 minutes per browser) and the browser test's
  Firefox visit (minutes) to every push. RealJShell, the check's real side, has run only on macOS: a Linux runner's timings
  are unmeasured. The client test and the browser test hold about 2 GB in the engine for a moment (the memory checks, one
  engine at a time): a runner needs that much free.
- Publishing the scratchpad release and a `fetch` of it for fresh clones (Plan 4). GitHub release assets are flat, and the
  release has 103 files under `legal/<module>/`: Plan 4 uploads a tarball of `legal/` or flattened names. Before the site
  goes live, Plan 4 must give the `NOTICE` and `SOURCES.txt` the site serves (both runtimes) a real URL for the release's
  `source.tar.gz`: today they say the source is in the release beside them, and the site carries no source archive. The
  repository they name for the written offer and the front end's source (`github.com/mmmugh/java-foundations`) must be
  public by then.
  The same pre-publication pass fixes three legal-text findings of this plan's final review (both runtimes, one
  repackaging): the written offer's term runs three years from each distribution, not from the day a release was
  published (R-1); `THIRD-PARTY.txt` carries the IJG notice that libjpeg-turbo-rs's source, shipped in `source.tar.gz`, needs
  (R-2: the crate ports libjpeg-turbo's jidctint.c, jidctred.c, jcphuff.c, jdarith.c and jcarith.c; pin a README.ijg like the
  other license texts); and `NOTICE` stops saying "CHECKSUMS fixes each file's bytes" of a file the site does not publish,
  or the site publishes it (P-3).
- Plan 5's Appendix D lists, for readers, the announced differences the transcript check pins.
- S1 and WebSockets in the offsite gate (D46, Plan 4).
- The Artifact tool's 15 MB limit per binary file is below `jdk.zip`'s 22.2 MB, so D19's private phone review of a chapter cannot
  carry the scratchpad as it is: decide in Plan 5.
- Tying the transcript check's entries to the jshell sessions the chapters and Appendix D quote (Plan 5, when they exist).
- Give-back pull requests to Ristretto (after this plan ships, one at a time, each approved by the author).
- A Temurin re-pin now also waits on Ristretto's Corretto, since the transcript check compares the two banners.
