# Decisions

Every decision Groundwork was built on, by the number the code, the tests and DESIGN.md cite it with. D-numbers are the
course's decisions; R1-R4 are the defaults a review of the design settled before the first commit; J1-J3 belong to the
scratchpad's jshell front end (runtime/jshell/). Each entry is recorded as it was decided, in the order it was decided;
a later refinement or correction is marked REFINED or CORRECTED in place, and a later decision that replaces an earlier
one says so. The decisions were settled with the author one at a time, usually by choosing among offered options, and
the author's words are paraphrased here. The working notes these entries were first written in stay private (D95); the
plans the course was built from are in docs/superpowers/plans/. A commit hash in an entry names a commit of the history
before the public repository's first commit, which stays private too (D96; D17's 2e05eb9 is the Python course's).

## D1-D112

- D1 (2026-09-27) RUNTIME: keep both promises (nothing installed; page talks to nobody) by OWNING
  the runtime: fork teavm-javac, fix it, pin and self-host it. The build will also diff every
  example against a real JDK 25. CONDITIONAL on a second spike proving: strict traps catchable,
  Worker runner stops a runaway loop, System.in/IO.readln/Scanner from a runner-supplied buffer.
  Fallback if that fails: server-side sandbox (real JDK 25; gives up "talks to nobody").
  The author approved a Temurin JDK 25 local to the spike (not system-wide).
- D2 CHAPTER 1: every box is a complete JDK 25 compact source file (`void main() { ... }`), explained
  in one honest sentence; `void`/methods properly in the Functions chapter. IO.println throughout;
  System.out.println gets one appendix mention ("what you will see elsewhere"). A box is a file:
  it runs unchanged with `java Hello.java`.
- D3 BUILD LANGUAGE: Java. One Build.java run with `java build/Build.java` (source launcher), JDK 25
  the only requirement; examples compiled in-process; javac's own tree for the vocabulary gate.
  Exception: the leak-hook tests stay Python, copied from the Python course.
- D4 VOCABULARY: syntax kinds (Tree.Kind), library members resolved to their owner (String.length,
  ArrayList.add), library types used, and modifiers/keywords (static, final, var). Learner-invented
  names ignored; deliberately non-compiling fences skipped. Scope: everything that is not a
  chapter's own teaching fence (practice solutions, Try It solutions, check stubs, quiz code).
- D5 TYPES: ch02 teaches int/double/String/boolean with explicit declarations; char in the Strings
  chapter; long/overflow noted in ch03 with integer division; `var` only in an appendix. ch02 has
  the first deliberate compile error (`int count = "three";`).
- D6 INPUT API: IO.readln() + Integer.parseInt in the chapters (mirrors input() + int()); Scanner
  only in an appendix with the nextInt/nextLine trap. The fork needs course-grade IO.readln only.
- D7 HOSTING: plain static hosting, GitHub Pages-compatible; nothing may require COOP/COEP headers.
  Checks never need interactive input (inputs are known up front). Interactive input for Run needs a
  header-free technique (replay from start, or JSPI) -- a later spike item.
- D8 VOICE: the author's formatting rules for all course prose: closed em dashes, American spelling,
  "course" not "book", whitelist/blacklist.
- D9 LISTS (ch07): arrays first (same [] indexing as Python, loops, 2D), then ArrayList for growing
  lists with one honest paragraph on <Integer> vs int.
- D10 TUPLES: ch06 methods return one value each (examples and practice step redesigned); ch10
  becomes "Records" (immutable, named; "list of dicts" -> ArrayList<Book>); tuple unpacking and the
  one-line swap dropped; the three-line temp swap goes where assignment is taught.
- D11 ERROR MESSAGES: the fork prints real JDK text for the runtime errors a first course shows
  (array/string index, parseInt, / by zero, casts). Exception: the NPE "helpful" message; no page
  shows it (differential gate enforces), an appendix explains it. The author's course 10 years ago had
  exactly this mismatch; consistency with real Java matters.
- D12 HASH ORDER: the fork matches OpenJDK HashMap/HashSet iteration order exactly (bucket choice,
  resize, head insert for merge/compute vs tail for put, treeified bins), proven by a dedicated test
  (all insertion methods, several resizes, colliding keys like "Aa"/"BB") against the real JDK.
  ch09 teaches the order as the lesson; LinkedHashMap = Python dict; TreeMap = sorted. Set.of/Map.of
  order is randomized per JVM run: examples printing them need a "varies" mark, and the gate runs
  them twice.
- D13 UPSTREAM: offer general fixes to TeaVM / teavm-javac later, once the fork has run the course;
  each patch tidied with a minimal repro test; one PR at a time, each approved by the author first.
  Evidence: TeaVM active (release every 1-3 months; 0.15.0 2026-06-14); one maintainer (293 of ~315
  commits last 12 months); outside PRs last 2 years 43 merged / 26 closed / 8 open, median 1 day to
  merge; issues: maintainer replied to 21 of the last 40 outside issues, median ~10 hours.
  teavm-javac: small side project, 1 outside PR merged in 2 years.
- D14 CLEAN ROOM: TeaVM's README refuses classlib code "based on OpenJDK or other code licensed under
  (L)GPL". Fork patches are written only from black-box JDK behavior (the differential gate) and
  public Javadoc, never from OpenJDK source. Whoever has read the relevant OpenJDK source does not
  write that patch (the design session read HashMap.java's constants; a fresh agent writes D12's patch).
  No OpenJDK mentions in the current 11 patches; the build agent's transcript shows no reads of
  OpenJDK library source.
  REFINED (the author): upstream only genuine bug fixes (uncatchable exceptions, constant /0 crash,
  clone bug under String.format, casts returning null, %n, Integer.sum, getMessage visibility).
  JDK-fidelity patches stay ours: JDK message text (D11), HashMap order (D12), Scanner, IO.readln,
  the stdin hook. TeaVM is a usable proxy for environments without a JDK, not a JDK clone, and it
  cares about size.
- D15 FORK HOME: patch series in the course repo (runtime/patches/*.patch) plus a pinned
  runtime/build.sh (upstream commits, JDK checksum). Built runtime (~6.9 MB, ~4.2 MB gzip) attached
  to a GitHub Release, pinned by a tracked CHECKSUMS; Build.java fetches and verifies it on first
  build (as the Python course does with Pyodide). Contributors need Gradle only to change the
  runtime. GOAL: make compiler.wasm byte-reproducible (it is not yet); until then a rebuild is
  verified by behavior (full differential suite).
- D16 RUN INPUT: replay. The program stops at IO.readln with no answer queued; the page shows the
  output so far with an answer field inline; the program re-runs from the start with the answers so
  far. Transcript matches a terminal (`How many? 21` then `42`). Needs: Random held steady across
  replays within one Run (fork patch); rule that course examples never time the reader (clock);
  Ctrl-D in the field = end of input (IO.readln returns null); a test running every input example
  both ways (all input up front vs question by question) requiring identical transcripts. Later:
  JSPI as a progressive upgrade where supported (untested with TeaVM; browser support is new).
- D17 CHECKS: method exercises start with the full signature plus a `void main()` that calls it (Run
  works at once; Check never runs main). Check wraps the reader's file in a class, generates a second
  class whose main calls the method with each case, compiles both with the real javac, runs with the
  deadline, reports per case. Case values are written into the generated Java and compared inside
  Java: nothing crosses the JS/Java data boundary (the 2e05eb9 lesson). javac signature errors are
  translated for the reader. "What it should do" shows cases in Java syntax. Three-way proof per
  check, on both runtimes. Input checks as in Python (numbers/words in order); predict-the-output
  answered from build-verified output.
- D18 SCRATCHPAD: the author chose a browser jshell (option b). Research (verified):
  PRIOR ART EXISTS -- Ristretto (github.com/theseus-rs/ristretto, Apache-2.0 OR MIT): a Rust JVM
  interpreter compiled to Wasm, running real jdk.jshell on a "reduced Corretto" JDK in the browser, no
  server, Java 8-25 selectable; also a Java playground. Created 2024-07, 66 stars, one developer (1,791
  of ~1,800 commits), releases ~monthly (v0.34.0 2026-09-27). Browser System.in returns EOF today.
  TeaVM route (jdk.jshell compiled by TeaVM + replay ExecutionControl): FEASIBLE WITH NAMED OBSTACLES;
  biggest risk is jshell's javac entry point (ToolProvider -> JavacTaskPool) never exercised under
  teavm-javac; varValue() needs its own replay; value formatting must be reimplemented (~65 lines).
- D21 LICENSES: code (Build.java, web runtime glue, tests, hooks, runtime patches) Apache-2.0; course
  (chapters incl. their example programs, exercises, solutions, practice pages, quizzes, and the
  generated .java bundle) CC BY-NC-SA 4.0. The author: the text is Claude-written, derived from reading
  others' work; nobody should ever commercialize it, the author included.
  README maps licenses to directories. Runtime releases ship Apache-2.0 (TeaVM or Ristretto),
  GPLv2+CE (OpenJDK/javac/Corretto parts) and the exact corresponding source with each release.
- D22 AUDIENCE: same as the Python course (its voice and pace are age-appropriate); no adaptation.
- D23 PUBLISHING/CI: repo mmmugh/java-foundations, public from the first push (created/pushed only on
  the author's explicit go at that moment). CI on every push: both leak-hook tests + gitleaks over full
  history; Build.java with JDK 25 (all gates + differential); runtime tests (three-way checks,
  replay, hash order); browser test in Chromium/WebKit/Firefox watching for off-origin requests.
  Pages deploy only on the author's go-ahead. CI never rebuilds the runtime; it verifies checksums.
- D24 EXTRAS: practice pages (same stories where they fit), quizzes (ASCII; every "what does this print"
  verified on real Java; keys never in site/), generated .java bundle, worked solutions (per-exercise
  reveal only), appendices adapted (A: compile + runtime errors; D: "Boxes and jshell"; plus the
  "what you will see elsewhere" pieces), and the .docx: built by a Python script adapted from
  the Python course's scripts/make_docx.py (the author: support tooling need not be Java), optional, with
  Author/Title/Comments metadata per the author's rule, the private-content scan reading inside the .docx,
  and a textutil parse check.
- D25 TITLE: "Java Foundations: A First Course in Programming"; byline "Justin Stewart—built with Claude
  Opus 5.5" (echoes the Python course).
- D26 VALIDATING INPUT (ch04): try/catch NumberFormatException is the one tool (no isdigit equivalent
  that early); later chapters use it wherever Python uses .isdigit().
- D27 STRING EQUALITY: ch03 with the comparison operators: == for numbers/booleans, .equals for text,
  the trap shown on the spot (readln "yes" == "yes" -> false; verified by the differential gate);
  the "same object" explanation when objects arrive (arrays ch07, records ch10).
- NOTE for the engine decision: ch12 shows runaway recursion on purpose (Python: RecursionError). The
  fork turns StackOverflowError into an uncatchable trap (reproducer finding) -- must be fixed or the
  engine must handle it.
- D28 LEAK LIST: copy the author's own private leak-patterns list as-is into .githooks/leak-patterns.local (git-ignored);
  confirm no false positive on intended public strings (the author's name in byline/LICENSE) by running
  the scan over the first commit's content, not by reading the list.
- ENGINE HEAD-TO-HEAD RESULT (spike + reproducer; my own jshell timing): Ristretto loses as the
  MAIN runtime: JEP 512 unsupported (launcher only finds public static main(String[]); 77/79 cases
  fail on that alone); 23 MB gzip download vs 4.2 MB; ~5 s per Run (fresh worker + wasm each time) vs
  0.23 s; compute 100-200x slower than the JDK (StringBuilder 100k: 4 ms JDK vs 697 ms); no stdin
  at all; uncaught exceptions lack the "Exception in thread" line and gain a bogus trailing line;
  OutOfMemoryError is a Rust panic; the playground shipped the day of the test and redeploys the same
  day. Where testable, library fidelity was strong (HashMap order, Math.round, Float.MIN_VALUE,
  log10, StackOverflowError catchable). The fork stays the engine.
  AS THE SCRATCHPAD it is viable: MEASURED MYSELF (Chromium + WebKit, self-hosted mirror): page to shell
  ready ~9.3-9.6 s (one-time), first entry ~2.0-2.2 s, then 0.3-0.9 s per entry; values identical to
  jshell ($1 ==> 5, x ==> 10, "555", created method, loop output, [3, 1, 2]); zero off-origin
  requests (the one hit in my filter was the page's own blob: worker URL). Known diffs vs real jshell:
  stray blank "location:" line, shorter caret, /list numbering after a failure, "created" instead of
  "modified" on redefinition.
- D1 ENGINE CONFIRMED (2026-09-27): the teavm-javac fork is the main engine.
- D29 SCRATCHPAD: Ristretto's real jshell, pinned and self-hosted, loaded only when the reader opens
  it; CI compares a session transcript against real jshell; its 4 known diffs listed. D13 EXTENDED:
  Ristretto joins the give-back list (jshell formatting diffs, void main() support, uncaught-exception
  text, OOM handling), one PR at a time with the author's approval.
- ENGINE RE-EVALUATION: CLOSED (see D1 ENGINE CONFIRMED and D29).: Ristretto runs the real JDK library, so D11/D12/Scanner/format could come
  free. Head-to-head spike (Ristretto vs fork: fidelity on the 79-case suite, size, speed in
  Chromium+WebKit, loop stopping, input, jshell transcripts vs real jshell, Node, maturity) running.
  D1's principle stands either way; only the engine may change. The author to decide on facts.
- D19 WRITING/REVIEW: adapt the Python course chapter by chapter (same structure, projects, practice
  stories where they fit; redesign per D-decisions; Python course voice + D8 formatting). Machinery
  first with ch01 as the pilot. Before the author sees a chapter: all gates + differential + three-way
  checks + a fresh-agent review panel. The author reviews each built chapter as a PRIVATE Artifact
  (working Run/Check, comments) on a phone; commit after approval; then the next chapter.
- D20 BROWSERS: current Chrome, Firefox, Safari incl. iOS; browser test runs Chromium + WebKit +
  Firefox via Playwright. Older browsers: pages read fine; boxes explain that the browser can't run
  Java and name the minimum versions (feature detection, not user-agent sniffing). Everything must
  work at 390 px. VERIFIED NOW in headless WebKit 26.6 (Playwright webkit-2359, 296 MB, the author
  approved): hello, readln, String.format, caught NPE, JDK-style uncaught line, runaway stopped at
  the 2 s deadline and the next run works, 0 off-origin requests, 0 page errors; compiler ready
  512 ms, first run 471 ms, warm ~300 ms. Real iPhone Safari is still the final proof (ch01 review).
- D1 CONDITION MET: the fork spike proved all three fixes. D1 stands.
- D30 (2026-09-28) HASHMAP PROVENANCE: the author accepts teavm-0011 (HashMap/HashSet order) with its disclosure
  as written: no OpenJDK source was opened in any Task 6 session (transcripts audited), every ordering rule is
  backed by a JDK experiment, and the commits and patch header say plainly that the first version's internal
  names matched OpenJDK's (training exposure) and were renamed. The patch stays ours (not upstreamed, D14).
- D31 (2026-09-28) BUILD NEEDS NODE FOR --check (Plan 2's D-P2-1): `java build/Build.java` needs only JDK 25;
  `--check` also needs Node 25 to run the browser runtime, and fails, never skips, without it. DESIGN.md
  section 4's wording changes accordingly (Plan 2 Task 10).
- D32 (2026-09-28) FDLIBM ALLOWED: fdlibm from netlib (Sun's permissive license, the library the StrictMath
  Javadoc names) is an allowed source for StrictMath functions under the clean room; OpenJDK's own Java
  translation of it stays off limits. Its notice travels with any code ported from it. First use: StrictMath.log
  (Random.nextGaussian differs from the JDK in the last digit on ~0.75% of values because TeaVM uses JS Math.log).
- D33 (2026-09-28) MATH.LOG FROM FDLIBM TOO: Math.log uses the fdlibm port as StrictMath.log does (on the
  pinned JDK they are equal on every input checked; the fork's JS Math.log differed on 29 of 20,000).
- D34 (2026-09-28) OTHER FDLIBM FUNCTIONS ONLY WHEN NEEDED: the fork's other StrictMath functions differ from the
  JDK (the Math ones matched in samples); port one only when Plan 2's example gate shows a course example needs it.
- D35 (2026-09-28) PLAN 2's RESIDUALS FIXED BEFORE MERGE: all seven, after the fix wave's re-review.
- D36 (2026-09-28) PLAN 3 SPLIT: Plan 3 = the page (Run in a Worker, replay, Check, feature detection, 390 px, and the
  runner fixes they need). Plan 3b = the scratchpad (Ristretto mirror, our own CHECKSUMS, the reduced Corretto's
  licenses and corresponding source, lazy load, transcript check in Node), written after Plan 3 lands.
- D37 (2026-09-28) CHECK DATA PER BOX, like Python ("per-exercise reveals are fine; a single page carrying the lot is
  not"): each check's own cases and expected values ride in its own box; _checks.json and any file carrying every check
  stay unpublished; DESIGN.md section 4 is reworded. Accepted cost: view-source shows an exercise's expected output,
  including a predict-the-output answer.
- D38 (2026-09-28) BROWSER TESTS IN PLAN 3: the dev server (port 8740), a pinned playwright-core dev dependency and
  page tests in Chromium, WebKit and Firefox move into Plan 3; the author approved installing Playwright's Firefox. Plan 4
  keeps CI and the checks' three-way proofs.
- D39 (2026-09-28) CHECK APPENDS A GENERATED MAIN: the reader's file stays a compact source file (its own main renamed),
  and a generated main calls the method once per case, each in its own try/catch. Wrapping the file in a class, as
  DESIGN section 3 said, drops the compact file's implicit java.base imports (probed on the fork: a wrapped ArrayList
  exercise fails "cannot find symbol"). DESIGN section 3 is reworded in Plan 3.
- D40 (2026-09-28) PLAN 3's FIVE CALLS ACCEPTED as written, one question each: (a) the flush patch (teavm-0016, clean
  room, matching the pinned JDK's observed output exactly); (b) the starter rule (a declared starter replaces the
  fence everywhere it is published, and a box that would publish its worked solution fails the build); (c) page
  limits of 5 s and 1,000,000 characters or 100,000 lines (Python uses 5 s too); (d) all four check kinds, predict
  included; (e) the runtime loads on a page's first Run or Check, like Python's Pyodide, not on page load or first
  touch.
- D41 (2026-09-29) CHROMIUM TAB CRASH ON MEMORY: DISCLOSE + RESTORE EDITS. Task 3's stop point: in Chromium a program
  that keeps filling memory with arrays takes the whole tab down in about 1-3 s (a dedicated worker runs in the page's
  process; a full V8 heap is fatal to it); WebKit and Firefox stop it at the deadline; the usual runaways (endless
  list.add of one value, StringBuilder.append, string churn) trap or time out everywhere. Controller reproduced it
  (ArrayList<long[]> 927 ms; ArrayList<int[]> of new int[100] about 2.6 s). The author (AskUserQuestion, recommended option):
  disclose it in DESIGN section 2, pin the crash in a test so a Chromium fix is noticed, and keep each box's edited code
  in the browser's storage so a reload brings the reader's work back. Controller's ruling on the mechanism: localStorage
  keyed by page path and box id, written only while the code differs from the original, as Python Foundations does
  (web/app.js remember/restore), which also makes the crash round trip testable in a new page of the same context.
  Plan amended in 8b0a901.
- D42 (2026-09-29) SAFARI STACK TRACES: DISCLOSE + PIN, FIX LATER. In WebKit an uncaught exception prints only its
  first line: WebKit names a WebAssembly frame without a code offset ("1@wasm-function[1]", controller's own probe of a
  hand-made module), and TeaVM's deobfuscator needs the offset, so no "at Main.main(Main.java:2)" line follows.
  Chromium and Firefox are fine. The author (recommended option): DESIGN section 2 says so, a WebKit check pins it
  (NO_FRAMES), and a fix (TeaVM keeping line numbers itself where the browser gives no offsets) is investigated in a
  later plan. Cost accepted: on iPhone, iPad and Mac Safari, a crashing box's output lacks the "at" line its stated
  output shows.
- D43 (2026-09-29) SAFARI LOSES THE PAGE TOO: EXTEND D41. Controller reproduced it: after four deadline-stopped runs, the
  memory program never answers in WebKit, nor does the next Run (20 s wall clocks), while a new page in the same context
  works; alone in a fresh page it times out at 20 s. The author (recommended option): DESIGN's D41 sentence names Safari too;
  the runner test runs the memory program in a page of its own in every engine and puts a wall clock on every browser
  call; no WebKit check pins it, since it depends on what ran before.
- D44 (2026-09-29) TEAVM BUG: A NON-VOID METHOD THAT NEVER RETURNS, CALLED INSIDE A TRY: PATCH IT NOW. Task 5 found it;
  controller reproduced it: `int spin(int n) { while (true) {} }` called inside a try ends `fatal` (WebAssembly.compile:
  "Main::spin failed: expected 1 elements on the stack for fallthru, found 0"); bare call, void method, or any return or
  throw in the method all behave; every leave-one-out variant fails alike, so it is TeaVM's own bug. Check wraps every
  case in a try, so a reader's forgotten loop exit would say "stopped unexpectedly" instead of "An endless loop?".
  The author (recommended option): patch now as teavm-0017 (plan Task 11, an addendum run before Task 5 is committed), a new
  release; on the upstream list (D13, one PR at a time with the author's approval).
- D45 (2026-09-30) MERGE PLAN 3: fast-forward plan-3-page into main, local only, nothing pushed (AskUserQuestion,
  recommended option), after the final review, one fix wave and the controller's full verification.
- D46 (2026-09-30) S1 FIXED IN PLAN 4, NOTED NOW: a reader's program can run JavaScript through TeaVM's @JSBody
  (org.teavm.jso is in the compile classlib) and reach the network from its worker, and a WebSocket from it slips past
  the browser test. Plan 4 drops org.teavm.jso from the compile classlib, so javac refuses it as the JDK does, in a new
  release; DESIGN section 1 says so until then (recommended option).
- D47 (2026-09-30) WRITE PLAN 3b NEXT: the scratchpad (D36), researched, written and pre-flighted the way Plan 3 was,
  then brought to the author before execution (recommended option).
- D48 (2026-09-30) SCRATCHPAD PAGE SHAPE: our own panel (about 250 lines) over Ristretto's five unmodified files (worker,
  three wasm files, the JDK zip), not a patched copy of Ristretto's page (its /ristretto/ base path, eager 24 MB load and
  a 3-minute Chromium freeze on a StackOverflowError's output rule it out). Recommended option.
- D49 (2026-09-30) SCRATCHPAD RUNAWAYS: a Stop button, a 60 s backstop, output caps, then a fresh session with the failure
  in plain words; DESIGN gets its own sentence for the scratchpad (the boxes' runaway promise cannot hold there: memory
  runs out as a Rust abort, a session dies after about 150 entries). Recommended option.
- D50 (2026-09-30) DEVICE TRIALS DURING PLAN 3b: the author tries a real iPhone and a stock Firefox during Plan 3b's
  execution, before DESIGN's scratchpad paragraph is final and before merge. Recommended option.
- OPEN (2026-09-30), the author's reply to "the real jshell" question: jshell is used only for the scratchpad (and the planned
  "Boxes and jshell" appendix); if Ristretto's front end gives hacky output, consider a jshell whose output is
  transparently like the JDK's official tool, handed to a separate session with a clear definition of done,
  integration points and dependency path if it is large. Controller's next step: a spike on running
  the JDK's own jshell tool (JavaShellToolBuilder, in the image's jdk.jshell module) on Ristretto; fallback a clean-room
  front end written from observed output.
- D51 (2026-09-30) CORRETTO SOURCE SHIPPED UNOPENED: the scratchpad release's source bundle carries the exact Corretto
  25.0.4.10.1 tag archive (about 200 MB), hashed on two downloads and never extracted; its path joins the clean-room
  forbidden list. Recommended option. The paths (Plan 3b, Task 1): runtime/.work/ristretto/corretto-download-1.tar.gz and
  -2.tar.gz, runtime/.work/ristretto/inputs/*-25.0.4.10.1.tar.gz, and the Corretto member of every
  runtime/.work/ristretto/release/*/source.tar.gz and runtime/.work/ristretto/release/.tmp-*/ (widened 2026-10-03 from
  .tmp-source-*/: package.sh now stages the whole release in .tmp-<release>/, final review triage 111): handled by curl, wc,
  shasum, mv, cp and rm only; never extracted, listed or decompressed (listing the outer source.tar.gz is allowed).
- D52 (2026-09-30) RISTRETTO PINNED BY BYTES NOW, REBUILT LATER: v0.34.0's exact web-build bytes pinned by our own hashes in
  a scratchpad release; one from-source rebuild of the interpreter proved on Linux in a later plan. Recommended option.
- D53 (2026-09-30) LEGAL FILES FATAL, BOTH RUNTIMES: Plan 3b adds one shared check: a build that would publish a runtime
  without its NOTICE, license and source files fails, for the boxes' runtime (closing Plan 2's best-effort ruling C) and
  the scratchpad's alike. Recommended option.
- D54 (2026-09-30) FIREFOX'S SLOW OPEN DISCLOSED: DESIGN states the real per-browser timings; the panel shows what it is
  doing and a timer while it opens; raised upstream later (give-back). Recommended option.
- D55 (2026-09-30) JSHELL OUTPUT FROM OUR OWN FRONT END (closes the OPEN item above): the spike showed the
  JDK's own jshell tool runs on Ristretto with --execution local and matches the real jshell on 68 of 72 entries (Ristretto's
  front end: 44), but feeding it needs JSPI (no iPhone before Safari 27, no Android Chrome) and a patched worker, and it is
  slower (17-19 s to open, 26 MB per entry). The author chose a course-written, clean-room replacement for Ristretto's front
  end (BrowserJShell.java), written from the real jshell's observed output and proved against it entry by entry, working
  wherever Ristretto works. Recommended option.
- D56 (2026-09-30) THE FRONT END IS A SEPARATE SESSION, LAUNCHED NOW: the controller writes its brief (definition of done,
  the seams it plugs into, dependencies, clean-room rules) and launches it as a separate session on its own worktree and branch;
  Plan 3b is written here in parallel with those seams, starting on Ristretto's front end until the new one lands
  (nothing is published before go-live). Recommended option.
- D57 (2026-10-01) PLAN 3B WAITS FOR THE AUTHOR'S REVIEW: written, pre-flighted and fixed (c712c7c), not executed until the author
  approves it. (Asked twice: the author asked for the four questions again; the second answers stand, D57-D60.)
- D58 (2026-10-01) WRITTEN OFFER, BOTH RUNTIMES: both releases' SOURCES.txt carry GPLv2 section 3(b)'s three-year written
  offer of the corresponding source (Corretto for the scratchpad, OpenJDK jdk25u for the boxes), asked for at
  github.com/mmmugh/java-foundations/issues (no personal address in a public file). Plan 3b Tasks 1, 2, 7. Recommended
  options (offer; both runtimes; the repository's issues).
- D59 (2026-10-01) JSHELL PREFERENCES CLEARED: the research and drafting runs' jshell history (585 HISTORY_LINE_* keys) and
  REPLAY_RESTORE removed from the author's macOS Java preferences (node tool/JShell, through java.util.prefs with the pinned JDK;
  nothing else was in the node); a backup was kept in the author's private notes (restore: defaults
  import com.apple.java.util.prefs <backup>). Recommended option.
- D60 (2026-10-01) PLAN 3B'S DEFAULTS STAND: every "Also decided" item (the critic's list, A1-A21, B1-B13, P1-P10).
  Recommended option.
- D61 (2026-10-01) THE JSHELL SESSION FIXES ITS BRANCH BEFORE THE MERGE: the controller's final review of jshell-frontend
  (the controller reproduced the jar hash, check.mjs 557/0 and breaks.mjs 14/14, audited the
  session's transcripts and found the merge clean) found must-fix items: about 60K characters of the real tool's /set mode
  templates quoted in derive/observations/feedback.md (the /help trim missed them), the clean-room disclosures (training
  exposure, probe provenance, D59, a jshell --version run), a cancel bug, breaks.mjs writing through symlinks, a missing
  header; plus small ones. Sent to the front end's session as a list of fixes. Recommended option.
- D62 (2026-10-01) MERGE THE FRONT END FIRST, THEN AMEND PLAN 3B: after the fix round the branch is squash-merged, and Plan
  3b is amended to ship the course front end from day one (its jar composed with Ristretto's pinned zip at load; prompts from
  the front end; /reset and /reload as a fresh VM; the branch's check.mjs as the one transcript check). This reverses P1 (the
  separate-jar route), P3 (the panel answering /reload) and the critic's defaults "a live Python pty driver" and "the panel
  answers /help, /help intro, /open and /save". The author's review of Plan 3b (D57) moves to the amended plan. Recommended
  option.
- D63 (2026-10-01) DELETE THE OLD BRANCH AFTER THE SQUASH: once the squash is verified, remove the front end's
  worktree, the branch jshell-frontend and the tag ws/jshell-frontend (they hold the untrimmed help quotes;
  nothing was pushed). Recommended option.
- D64 (2026-10-02) THE AMENDMENT'S DEFAULTS STAND: compose at load; the front end's check.mjs as the one transcript check,
  driving the page's client; a /reload's deadline growing with the session (boot plus twice its entries' time); the worker
  URL versioned by the manifest; "Starting a fresh jshell" during a restart; tests that briefly hold 2 GB for the memory
  ending; and the rest of the amendment's rulings (A-, B-, C-, Q-). Recommended option. Asked with "execute now?", which
  the author did not answer, asking to compact first.
- D65 (2026-10-02) EXECUTE PLAN 3B NOW: subagent-driven on branch plan-3b-scratchpad (from main at fcceb30, in place, not
  a worktree: a worktree lacks the git-ignored leak list), stopping at Task 8 for the device trials (AskUserQuestion after the
  compaction: "Execute now (Recommended)"). Nothing pushed; the merge into main is asked separately.
- D66 (2026-10-02) THE IPHONE REACHES THE TRIAL SITE THROUGH MKCERT ON THE LAN: the author first asked whether plain http
  would do, as for the Python course; it cannot (Safari gives crypto.subtle and Cache Storage only to HTTPS or localhost,
  and on a phone localhost is the phone). Offered a never-committed plain-http trial copy (no file check, no cache) as the
  low-setup choice; the author chose "mkcert on the LAN": mkcert's own CA, trusted on the iPhone only for the trials and deleted
  after (never added to the Mac's trust store), a scratch HTTPS server on the local network only, never committed. Firefox on the
  Mac uses http://127.0.0.1 (already a secure context).
- D67 (2026-10-03) FIX THE IOS KEYBOARD NOW: on the iPhone (Safari and Edge) a tap on the scratchpad's input raised no
  keyboard until focus went elsewhere and came back. Cause: the panel focuses the input while it is read-only (loading)
  and again after the boot, outside any gesture; iOS raises the keyboard only for a focus a tap makes, and a tap on an
  already-focused field makes none. Fix: a touch on the already-focused, editable input blurs and refocuses it inside
  that tap (mouse and desktop unaffected), with a WebKit touch check and its break. Recommended option.
- D68 (2026-10-03) THE DEVICE TRIALS ARE DONE: the author's iPhone results stand for D50 (the scratchpad opens in 30 s to a
  minute in mobile Safari and in 12 s in mobile Edge; it runs; the keyboard bug, D67). Firefox keeps Playwright's measured
  minute; the rest of the trial list (Stop, memory runaway, Cancel, /reset, a second open) was not tried on the phone.
  DESIGN and the panel's open words say about 10 seconds on a computer and up to a minute on a phone. The author: it need not
  be optimized for mobile, and it is good that it runs there. Recommended option.
- D69 (2026-10-03) THE NATIVE-TAP KEYBOARD FIX: D67's fix (a touch on the focused input blurs and refocuses it, 644fc1e)
  reached the phone (the log shows the new script fetched; the second open came from Cache Storage, so
  caching works on the iPhone) but iOS still raised no keyboard: with the focus already there and no keyboard, the author
  still had to tap away and then back. Chosen: on a touch device the panel never focuses the input itself and never
  makes it read-only, so the only focus is the reader's tap (iOS's own behavior); Enter still waits for a ready jshell;
  D67's handler goes. One more retest; if it fails, back to the original code with the workaround noted. Recommended.
- D70 (2026-10-04) MERGE PLAN 3B: fast-forward main to plan-3b-scratchpad, local only, nothing pushed (there is no remote);
  then delete the branch. Recommended option (AskUserQuestion after the final review and its fix wave).
- D71 (2026-10-04) MKCERT REMOVED FROM THE MAC: delete mkcert's CA files and the trial certificate and key
  (build/.work/trial-https/), then brew uninstall mkcert; the author removes the profile from the iPhone. Recommended option.
- D72 (2026-10-04) CLEAN UP THE PARKED MINORS BEFORE PLAN 4: after hearing Plan 4's scope (tests, CI, and publishing:
  GitHub Pages sounded like a good path forward to the author), the author chose a short pass over the parked and can-wait minors of
  Plans 2, 3 and 3b first, reviewed and merged, then Plan 4. Items that belong to Plan 4's decisions (publishing, legal
  texts, HTTPS for self-hosting, S1, WebSockets, the 24 MB figure) stay there.
- D73 (2026-10-05) THE BUILD REFUSES A BOX THAT WRITES TO STDERR AND THEN THROWS UNCAUGHT (P3-16): the build names the box
  and says to print from a catch block instead. Recommended option. (Premise corrected in execution: the build already
  refused such a box, as a bare "exit-1", because Jdk.run calls a run uncaught only when stderr starts with the exception
  line; the page's statedStderr returns "" for it. What D73 changes is the reason given: f2d6be0, and the final review's
  fix for a System.err.print with no newline before the exception.)
- D74 (2026-10-05) OLD BROWSERS KEEP ONE MESSAGE ON EVERY BOX (P3-36): predict boxes included; the minimum versions are
  already old. Recommended option.
- D75 (2026-10-05) MERGE THE MINORS CLEANUP: fast-forward main to minors-cleanup, local only, nothing pushed; then delete
  the branch. Recommended option.
- D76 (2026-10-05) START PLAN 4 AFTER THE COMPACTION: the author asked to end the shift, compact, then continue with Plan 4.
- D77 (2026-10-05) RENAME THE COURSE GROUNDWORK: the author's reason: Java Foundations is already the name of an official course,
  and it breaks Oracle's style guide for naming third-party Java programming resources. Oracle's Java Branding and
  Licensing Guidelines allow "[My Product/Service/Event] for Java" (also "in Java", "on Java"), never "Java [My
  Product/Service/Event]". The full title is "Groundwork: Learn to Program in Java"; the public repo would be groundwork, so
  the site would be mmmugh.github.io/groundwork. A web search found no Java course or book by that name. Rejected
  alternatives: Main Course, First Class, Ground Up (McGraw-Hill's "Java Programming: From The Ground Up"). The name
  appears in about 170 tracked files. The rename lands in Plan 4; historical records (worksheets, past plans) may keep the
  old name. Recommended option.
- D78 (2026-10-05) PLAN 4 STAYS LOCAL; A SHORT PLAN 4B PUBLISHES: Plan 4 does the rename, the legal texts, the CI setup and
  the carried fixes on the Mac, reviewed and merged; Plan 4b then creates the repo, pushes, and turns on Pages and the
  release, each step on the author's go. Nothing goes public until Plan 4 is finished and reviewed. (Offered as "Plan 5";
  named 4b because Plan 5 is already the chapters, as Plan 3b followed Plan 3.) Recommended option.
- D79 (2026-10-05) THE SCRATCHPAD WORKS OVER PLAIN HTTP: a SHA-256 in JavaScript when crypto.subtle is missing, so the
  download check still runs on a self-hosted page served over plain http (a LAN address), with no certificate on any
  device. The scratchpad needs a secure context for only two things: crypto.subtle (the check) and Cache Storage (already
  optional: without it, the scratchpad downloads its files on each open, a few seconds on a home network). No
  SharedArrayBuffer or other secure-context feature is used (git grep). SCRATCHPAD_INSECURE (web/app.mjs:38) and the
  "once" wording change with it. Recommended option.
- D80 (2026-10-05) SELF-HOSTERS DOWNLOAD A READY SITE: each GitHub release carries the built site as one zip; unzip it and
  serve the folder with any static web server, no JDK and no build. DESIGN and the README document it as a supported path;
  building from a clone stays documented for contributors. Recommended option.
- D81 (2026-10-05) THE SITE ZIP CARRIES THE GPL SOURCE: both runtimes' source.tar.gz (193,213,629 bytes for the boxes'
  2026.10.02-1, 130,121,244 for scratchpad-2026.10.02-2) go in the zip, so serving the unzipped folder offers the source
  from the same place (GPLv2 section 3's last paragraph), with nothing for a self-hoster to read or do; the zip grows from
  about 40 MB to about 360 MB. The public site offers the source too, from Pages or, if Pages' limits get in the way, from
  the release. SOURCES.txt's written offer stays as a backstop (3(c) covers only noncommercial redistributors). Today the
  build keeps source.tar.gz out of site/ on purpose (RuntimeFilesTest:66); Plan 4 changes that for the zip. The author was
  told this is a reading of GPLv2, not legal advice. Recommended option.
  REFINED (2026-10-07, D109): the source archives stay on the GitHub releases in Plan 4b; the public Pages site carries
  none, and the runtimes' notices name the releases. Plan 5 measures Pages with the site zip and decides.
- D82 (2026-10-05) THE PUBLIC SITE IS mmmugh.github.io/groundwork: free, HTTPS automatic, nothing to renew; a custom domain
  can come later (GitHub then redirects the github.io address to it). Recommended option.
- D83 (2026-10-05) CI: QUICK ON PUSH, FULL WEEKLY: GitHub Actions runs the build tests, the runner, the page in one browser
  and the Node transcript check on every push (about 15 minutes); the whole suite (three browsers, the breaks, the
  scratchpad trials; about an hour here) weekly and on demand. Plan 4 writes the workflows; they first run in Plan 4b.
  Recommended option.
- D84 (2026-10-05) RENAME THE LOCAL FOLDERS AFTER PLAN 4 MERGES: ~/java_foundations to ~/groundwork and
  the notes folder with it, between sessions (the working session runs inside the folder); the project's
  Claude Code memory moves with it (keyed by folder path) and the notes' paths are fixed. Recommended option.
- D85 (2026-10-05) THE PAGE'S MODULES BECOME .js; THE RUNNER FETCHES compiler.wasm AS BYTES: so the ready-site zip works on
  every static server with no configuration (D80). Research (in the author's working notes, checked here):
  stock nginx's mime.types (master, fetched 2026-10-05) maps only js to application/javascript, never mjs, so a module
  script is refused and the page does nothing (the nomodule fallback does not run in a module-capable browser); nginx 1.18
  and older and Apache 2.4.54 and older also lack wasm, and TeaVM's loader compiles a URL through compileStreaming (which
  needs application/wasm) but compiles bytes with WebAssembly.compile. Node learns that the renamed files are modules from
  a package.json "type": "module". The author accepted the rename and asked why it matters (explained:
  browsers require a JavaScript Content-Type for module scripts; servers choose it from the extension).
- D86 (2026-10-05) CUT BOXES OFF FROM THE NETWORK: before a reader's program runs, its worker removes every network door
  (fetch, XMLHttpRequest, WebSocket, EventSource, new workers, script imports), so java.net fails as on an offline computer
  and "talks to nobody" covers readers' programs too; @JSBody still leaves the compile classlib (D46). New finding from the
  research (in the author's working notes), reproduced here with its probe (build/.work/plan4-research/
  s1-probe.mjs, Chromium): a box using java.net.URL/HttpURLConnection compiled, ran with status ok, and sent an XHR that the
  test gate recorded and aborted; on the real site nothing stops it. (The probe's @JSBody WebSocket did not reach its live
  server in this rerun, though the agent reports one did; S1 stands either way.) Pages cannot set a CSP header, and per the
  research a <meta> CSP does not cover a same-origin module worker, so the worker's own lockdown is the defense that works
  on Pages. Whether the scratchpad's worker gets the same lockdown is for Plan 4's research and a ruling. Recommended option.
- D87 (2026-10-05) W-9 CONFIRMED: three GitHub releases per version in Plan 4b: runtime-<v> (the boxes' runtime),
  scratchpad-<v>, and site-<v> holding only groundwork-<v>.zip for self-hosters; D80's "each GitHub release carries the
  built site as one zip" read as each course release. The author asked what a release is (explained: a tag's download page
  of assets kept outside git; the runtimes' files share names, so they cannot share a flat release) and
  agreed.
- D88 (2026-10-05) NO SKIP: PUBLISH THE CI-ONLY VARIANT (replaces W-14's env-gated skip): ForkGateTest's fork-no-0009
  check runs on the Mac and on CI and fails on a missing, stale (manifest not this tree's patches minus 0009) or broken
  variant. Plan 4b publishes the variant as variant-fork-no-0009-<v> (its six files, manifest.json, the boxes' notices and
  VARIANT.txt pointing at runtime-<v>'s source.tar.gz with that patch left out); CI fetches it with --fetch-variant
  (Task 9). The author was told the variant is a GPL binary too, and that pointing at the sibling release's source is a reading
  of GPLv2 (the same place), not legal advice; the author may ask for a copy of the source in its release instead.
- D89 (2026-10-05) EXECUTE PLAN 4 SUBAGENT-DRIVEN: a fresh implementer per task, a review after each, a final panel and one
  fix wave, as with Plan 3b. Recommended option.
- D90 (2026-10-07) SAFARI OVER PLAIN HTTP, TRIED: the author's MacBook Air (M4), Safari, the trial site served by
  `python3 -m http.server` on the Mac's LAN address (plain http): the scratchpad downloaded its files (the server log shows
  them all within a second) and then said "The scratchpad could not start: jshell did not answer within 240 seconds."; a
  box's Run worked but was noticeably slow. Playwright's WebKit showed the same slowdown on pages loaded over the network
  at an insecure origin (JS ~13x, wasm ~28x) but not on route-served pages, so a route-served test would be falsely
  reassuring. Chrome and Firefox start the scratchpad there (tests). Every browser on iPhone and iPad runs on WebKit.
- D91 (2026-10-07) SAY SO PLAINLY: plain http stays supported for Chrome and Firefox on computers; the scratchpad's timeout
  message and a box's timeout message, on a non-secure page (detected by isSecureContext, never by browser name), add that
  Safari and every iPhone or iPad browser run the course too slowly there and need https or localhost; the about line,
  README and DESIGN say the same with the measured result; README names an easy https route for self-hosters (Caddy or
  Tailscale Serve). Recommended option. (The author found the box noticeably slow.)
- D92 (2026-10-07) LOOPBACK STAYS AS RELEASED: in a box, localhost and 127.0.0.1 fail with "Network is unreachable" (the
  JDK says "Connection refused" when nothing listens); the comments and DESIGN say it is a choice (a box has no computer of
  its own); revisit in a later runtime release. Recommended option.
- D93 (2026-10-07) MERGE PLAN 4: fast-forward main to plan-4 (fd491c1), local only, nothing pushed (there is no remote);
  then delete the branch. Recommended option. Verified on main: BuildTest 165/0, serve 33/0, sha256 12/0, packages ok, both
  release verifiers exit 0 (the whole suite ran 47/47 at 0f284d7; the only later commit changed only the working notes).
- D94 (2026-10-07) RENAME THE FOLDERS NOW, THEN COMPACT: the author asked for the renaming, then a compaction, with the work saved
  first (D84 had said between sessions). ~/java_foundations is now ~/groundwork and the notes folder took the new name
  too; the project's Claude Code memory moved to the new folder's key, with a link left at the old key. Because the session that did it
  runs inside the folder, links at the two old paths keep it working until it ends; delete them then.

- D95 (2026-10-07) PUBLISH THE COURSE AND ITS DESIGN RECORD, NOT THE SESSION LOGS: the published tree is README,
  DESIGN.md, both LICENSEs, build/, runtime/, web/, ci/, volumes/, .github/, package.json and
  docs/superpowers/plans/; the two worksheets and spike/2026-09-27/ (47 day-one throwaway files, referenced in no
  tracked doc) leave the tree first and live in the author's working notes, which stay private. A contributor gets the written
  rationale for why the runtime is shaped as it is; the author's quotes and hardware, and the notes' FEEDBACK block, do not go
  public. Recommended option.
  CORRECTED (2026-10-07, from research in the author's working notes): the list above was incomplete. The
  published tree is the whole tree minus the two worksheets and spike/2026-09-27/; tests/, .githooks/, .gitignore and
  package-lock.json go too (CI needs them). Two consequences D95 did not see are D104 (the D-numbers) and D107 (the test
  device).
- D96 (2026-10-07) FRESH START FOR THE FIRST PUSH: push one initial commit of the publishable tree, not the 323-commit
  history. D95 then holds by construction—no worksheet blob can reach the remote (the two worksheets and spike/ appear
  in 104 commits, 369 blobs, so a full-history push would publish them whatever the final tree looks like). CI's
  leaks_history scans every commit on every run (ci/quick.sh:36-53): one commit instead of 323, forever. And no bet
  that commits written against an older pattern list still pass today's. The 323 commits stay on this Mac, tagged
  history/pre-publish, never pushed. Rejected: a git filter-repo rewrite (keeps the per-commit record, but every hash
  changes, the ~104 worksheet-only commits become empty and are pruned anyway, and the whole history must pass the
  scan before the first push and on every later run). Recommended option.
  REFINED (2026-10-07, Plan 4b V-12): the history is archived as a mirror clone outside the repository, not a tag, so
  no ref that could reach a worksheet blob is left in the repository for any push to carry.
- D97 (2026-10-07) PRIVATE FIRST, THEN FLIP TO PUBLIC: create mmmugh/groundwork private; push, watch the leak-history
  scan and the quick CI run, publish the four releases, check the assets download and verify. Then, on the author's go at
  that moment, flip it public and only then deploy Pages. Everything except Pages is proven before anything is
  public. Pages cannot serve from a private repo on a GitHub Free personal account (paid plans can), so the flip has
  to come before the Pages step; the plan's research confirms this against GitHub's current docs before the step
  runs. Recommended option.
- D98 (2026-10-07) THE WIDE FIX WAVE: the local half of Plan 4b fixes the four Minors parked at the end of Plan 4 (B1's
  case-only-rename sweep and building anything published from an empty site/, its PagesTest assertion, Build.java's
  wrapped fetch message, ci/everything.sh's 223-column comment), adds .nojekyll (without it Pages runs Jekyll and
  drops any _-prefixed file), AND clears all 18 can-wait items from Plan 4's triage—not only the two that touch
  publishing. Offered as a narrower wave; the author chose the wide one.
  REFINED (2026-10-07, Plan 4b V-1): no .nojekyll. Jekyll runs for a site published from a branch; this site is deployed
  by an Actions workflow, which runs no Jekyll, and actions/upload-pages-artifact leaves dotfiles out anyway.
- D99 (2026-10-07) REPACKAGE AND REBUILD BOTH RUNTIMES: three of the 18 can-wait items can only land inside a runtime
  package (the scratchpad SOURCES.txt sentence that names both places the source sits per W-12 and D81, verify.sh's
  discarded unzip stderr, build.sh's JDK_HOME against jdk-home.mjs's JF_JAVA_HOME) and a fourth needs a real rebuild
  (getOutputStream() with doOutput=false throwing the offline exception where the JDK throws ProtocolException
  first). The author chose to rebuild rather than park the fourth, so D92's "keep the runtime as released; revisit in a
  later runtime release" is reopened here. Stated to the author once: a rebuild changes the compiled bytes, so the evidence
  from the 47-command suite at 0f284d7 no longer covers what gets published—the plan must redo the differential run
  (149 cases), the negatives, the CI-only variant from patches-minus-0009 and the three-browser runs, and re-measure
  the timing pins. Noted for the record: neither packager recompiles (runtime/release/package.sh assembles from an
  existing dist/fork and refuses one this tree did not build), so a repackage alone would have kept the runtime bytes
  identical; the rebuild is what costs the re-proving. Out of scope and unchanged: D52's rebuild of Ristretto from
  source, which Plan 3b and Plan 4 both sent to a later plan.
- D100 (2026-10-07) LOOPBACK MATCHES THE JDK: since D99 pays for a rebuild anyway, the fidelity choice D92 parked
  because it "costs another runtime rebuild and negatives run" is taken. Today a box reaching 127.0.0.1 gets
  ConnectException "Network is unreachable" and localhost gets UnknownHostException "localhost"; a box has no computer
  of its own, so nothing listens there, and the real JDK's answer when nothing listens is ConnectException
  "Connection refused" for both. Both now say that, pinned against the JDK oracle by a differential case. The
  comments in web/test/runner.mjs and DESIGN's java.net sentence, which D92 had them describe as a deliberate choice,
  change with it. Recommended option.
- D101 (2026-10-07) THE GIVE-BACK LIST IN ITS OWN SESSION: the author asked whether a unified list of the fixes meant for
  the upstream projects exists. It does not—only the policy (D13, D14 REFINED) and candidates scattered across
  DESIGN.md:246-253, the decisions and three patch headers, with DESIGN.md:251 already referring to "the
  give-back list" as though it had been written. A separate session compiles it with a Sonnet fan-out:
  all 24 patches and the Ristretto and teavm-javac findings classified upstream or ours with a reason, a draft PR or
  issue per upstream item with a repro recipe, and GIVEBACK.md ready to land here later.
  Its brief, seed prompt and output live in the author's working notes.
  It is told the repo is read-only for it (the plan's session holds the index), that
  it must build nothing (a build writes runtime/.work and the tracked CHECKSUMS), and that nothing is filed—D13 keeps
  one PR at a time, each approved by the author first. Recommended option (offered as classify-only or defer).

- D102 (2026-10-07) ISSUES ON, PULL REQUESTS FENCED: the public repo has issues and pull requests on, a SECURITY.md
  naming a private channel for sandbox-escape reports, and a CONTRIBUTING.md that fences the clean room—no outside code
  into runtime/patches/ or the differential gate, since D14 and TeaVM's own README refuse OpenJDK-derived classlib code
  and a tainted patch could never go upstream (D13). Chapter text, docs and page fixes are welcome by PR. Why it
  matters more than usual here: the course runs readers' Java in a browser sandbox, and Plan 4's final security lens
  found an escape (a box declaring its own org.teavm.jso.JSBody) that ten task reviews had missed; publishing invites
  exactly that scrutiny, and without a stated private channel the first finder may well post it in a public issue.
  Recommended option.
- D103 (2026-10-07) PUBLISH ALL OF IT, WITH AN HONEST PLACEHOLDER: no volume exists in the tree (volumes/ holds only
  its README; the roadmap's Plan 5 is the chapter 1 pilot), and a build with zero volumes renders an index reading only
  "Groundwork Groundwork"—neither D78 nor D82 had addressed that the public address would show nothing to read. Plan 4b
  still proves everything end to end, Pages included, but with no volume the index says plainly that the first chapter
  is being written (a small build change, with its test). site-<v>, the self-hosting zip (D80, D87), waits for chapter 1,
  since an empty zip helps nobody—so Plan 4b publishes three releases (runtime-<v>, scratchpad-<v>,
  variant-fork-no-0009-<v>), not four. Plan 5 then only adds content. Recommended option.

- D104 (2026-10-07) A SCRUBBED DECISIONS.md: 481 lines in 78 files of the published tree cite 75 distinct D-numbers
  (code comments, tests, CI, docs), and DESIGN.md:6-8 defines them as "the decision recorded under that number in the
  project's worksheet", which D95 made private. The decisions section of the author's working notes (105 entries at the time,
  D1-D107 and R1-R4) moves into the repo as DECISIONS.md: the author's verbatim quotes (about ten lines) become paraphrase,
  the private notes paths (about ten lines) are dropped, and DESIGN.md:6-8 points there. Every citation then resolves for a
  contributor, which is why D95 kept the design record public. The author reviews the scrubbed file before it is committed.
  The checkpoints, the rulings and FEEDBACK stay private. This partly revisits D95: the working notes stay private, one
  section of it goes public. Recommended option.
- D105 (2026-10-07) THE PRIVATE PHASE, NARROWED (refines D97): research found D97's private phase cannot deliver what it
  promised. Every runtime fetch is anonymous (build/RuntimeFiles.java's HttpClient, runtime/ristretto/fetch-release.sh's
  curl, ci/setup.sh), with no token code anywhere, so the node and chromium jobs fail by construction while the repo is
  private; rulesets and private vulnerability reporting are public-only on a Free account; private runners are half the
  size of public ones (2 vCPU/8 GB against 4/16, GitHub docs read 2026-10-07), so timing pins measured privately would be
  wrong; and the flip makes the private phase's Actions logs and artifacts public. The private phase now proves only what
  it can: the push with nobody watching, the leaks job and gitleaks' first run, and the three releases uploaded, then
  downloaded with an authenticated gh and checked by the local verifiers. Node and chromium go red there, stated in
  advance. Then the private runs are reviewed and deleted, the repo is flipped on the author's go, CI reruns as the first
  full proof, the pins are re-measured on public runners, the ruleset and vulnerability reporting are set, and Pages
  comes last. Rejected: a token fetch (code for one phase; the anonymous path readers use stays unproven; the pins would
  still be wrong) and dropping the private phase. Recommended option.
- D106 (2026-10-07) COMMITS CARRY THE NOREPLY ADDRESS: git's user.email here is the author's personal address, so every
  public commit's author and committer fields would carry it, and the leak hook scans diffs, not commit metadata.
  Before the fresh-start commit, user.email is set for this repository only (git config --local) to the author's GitHub noreply
  address, <id>+mmmugh@users.noreply.github.com, the id read with a read-only `gh api user`. The global config and the author's
  other repositories are untouched. Recommended option.
- D107 (2026-10-07) THE TEST DEVICE STAYS NAMED: "MacBook Air (M4)" appears in five files of the published tree as the
  device of D90's Safari measurement (DESIGN.md:123 and :304, README.md:79, web/page/scratchpad.js:40,
  web/test/scratchpad.mjs:360). D95's options had framed the hardware model as something only the worksheets would
  expose; that was wrong, and the author was told so before choosing. It stays: it makes the measurement reproducible, none
  of the five lines names the author, and the model identifies nobody. Recommended option.

- D108 (2026-10-07) PUBLIC COMMITS CARRY CO-AUTHORED-BY ONLY: every local commit here ends with a Co-Authored-By line
  and a Claude-Session line (a claude.ai session URL). In the public root commit and every public commit after it, only
  the Co-Authored-By line appears: the session link opens only for the author's account, but it would name a private session id
  permanently in an immutable root, no leak scan reads commit messages, and D95 kept session logs private. Commits before
  the fresh start, never published, keep theirs. Raised by the pre-flight (D-5, A-6, B-6). The author's instruction, so it
  governs over the harness's default attribution. Recommended option.
- D109 (2026-10-07) THE SOURCE STAYS ON THE RELEASES FOR NOW (D81 REFINED): D81 preferred the source archives on Pages
  beside the runtimes "or, if Pages' limits get in the way, from the release". The plan's first draft claimed the limits
  got in the way; the pre-flight (A-2) showed the research does not say so (about 363 MB fits Pages' documented 1 GB; the
  per-file limit is undocumented, not low). The honest reasons: a large file on Pages is unmeasured, a deploy times out at
  10 minutes, and a CI build has no archives to copy without new fetch code. The author chose releases only for Plan 4b; the
  runtimes' notices name the releases; Plan 5 measures Pages (A18) when the site zip ships, and decides. Told it is a
  reading of GPLv2, not legal advice. Recommended option.

- D110 (2026-10-07) EXECUTE PLAN 4B'S LOCAL HALF SUBAGENT-DRIVEN: Tasks 1-10 on branch plan-4b, a fresh implementer per
  task and a review after each, a final four-lens panel and one fix wave before the author's merge go, as Plans 3b and 4 ran
  (D89); Task 5 and Tasks 10-15 are the controller's, and Task 7's patches need a fresh clean-room agent by design. Chosen
  after reviewing the revised plan (c7b68b9). Recommended option.
- D111 (2026-10-08) MERGE PLAN 4B'S LOCAL HALF: fast-forward main to plan-4b, local only, nothing pushed (there is no
  remote); then delete the branch. Recommended option.
- D112 (2026-10-09) MATH.LOG STAYS ON FDLIBM; THE X86-64 JDK DIFFERS IN THE LAST PLACE: the first public CI run found
  that the pinned JDK on x86-64 Linux computes `Math.log` another way than `StrictMath.log`, as Math's Javadoc allows
  (within 1 ulp of the exact result): 458 of the differential case R11-math-log's 20,000 values differ by exactly 1 ulp,
  where on the Mac's arm64 the two agree on all of them, which D33's measurement had taken for every platform. The fork
  keeps fdlibm (D33): it cannot match both, and fdlibm is what `StrictMath` gives everywhere. The differential gate holds
  the difference on linux-x64 only, with the measured value and the reason, and requires the case identical elsewhere
  (Plan 4b's V-17); DESIGN says what a reader with an x86-64 JDK may see. Shown to the author before the push.

## R1-R4: the design review's defaults (2026-09-27)

A review panel over DESIGN.md found gaps the interviews had not covered; each was resolved as a default the author could
veto, and the author approved all four with the first commit.

- R1 (2026-09-27) STACKOVERFLOWERROR AND OUTOFMEMORYERROR: the fork cannot let a program catch them. The runner reports
  both the way the JDK does (uncaught line), output is capped, a crashed worker is reported and the next Run works; no
  example catches them (differential gate enforces); ch12's runaway recursion is declared as crashing on purpose. Node
  runner must handle worker 'error' (the reproducer found OOM killed the host process).
- R2 (2026-09-27) THE REFERENCE JDK IS PINNED: the differential gate's reference JDK is a specific Temurin 25 build by
  checksum, with fixed locale and UTF-8 flags.
- R3 (2026-09-27) CI SCANS THE FULL HISTORY WITH THE PROJECT'S OWN SCANNER TOO: the personal pattern list is supplied as
  an encrypted CI secret (the author adds the secret when the repo exists).
- R4 (2026-09-27) TEAVM-JAVAC'S LICENSE FILE: teavm-javac has no LICENSE file (its README says Apache-2.0); asking
  upstream to add one is first on the give-back list (outward-facing: the author approves when the time comes).

## J1-J3: the jshell front end (2026-09-30)

- J1 (2026-09-30) STARTUP IMPORTS: the scratchpad starts with the ten imports of JDK 25's own
  `--startup DEFAULT_NO_MODULE_IMPORTS` plus `import java.time.*;` (`s1`..`s11`), not `import module java.base;`, because
  the module import makes every entry about 1.6 times slower and ends a session near entry 62 on Ristretto v0.34.0.
  The check's reference is the real tool started with `--startup DEFAULT_NO_MODULE_IMPORTS --startup
  <file holding import java.time.*;>`; every entry where that differs from plain `jshell` carries a `startup` annotation,
  and the check fails if one fires unannounced. The author chose the recommended option (AskUserQuestion).
- J2 (2026-09-30) /HELP TEXT: course-written help in the real screen's layout, listing what the scratchpad supports;
  no OpenJDK prose in our Apache-2.0 jar. An allowed difference that fires on every `/help` entry. The author chose the
  recommended option (AskUserQuestion).
- J3 (2026-09-30) LOCALE: the scratchpad runs in `en_US` (`Locale.setDefault(Locale.US)` and `user.country=US` in
  `Shell.start`), because Ristretto's VM starts with `en` and no country (currency `¤1,234.50`, `Locale.getDefault()`
  `en`). The check pins every JDK run to `en_US` so the proof doesn't depend on the machine. The author chose the
  recommended option (AskUserQuestion).
