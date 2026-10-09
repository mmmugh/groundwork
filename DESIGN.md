# Groundwork: design

Groundwork is the Java counterpart to Python Foundations: the same twelve-chapter first course,
the same standards, teaching Java. This document records what was decided before any chapter was
written, and why. Each decision was settled with the author in an interview; the evidence behind the
runtime decisions is summarized here, and each decision cited by number (D51, D53 and so on) is
recorded under that number in [DECISIONS.md](DECISIONS.md).

The Python course is an argument about how a course should be built. Two promises carry every gate
in it, and both carry over unchanged:

1. **The course is never wrong about itself.** Every stated output is what the code prints, no answer
   key reaches the published site, and no example uses anything the course has not taught yet.
2. **The course is built not to fail a reader who is right.** A check that cannot tell a correct
   answer from a realistic mistake is worse than no check. Every check is tested against several
   answers before it ships, and an exercise whose answers cannot be judged fairly gets no Check at all.

## 1. Running Java in the browser

Python runs in the browser through Pyodide. Java has no equivalent that is ready to use, and that one
fact reaches everything else.

**Decision: keep both of the Python course's promises to the reader.** Press Run with nothing
installed, and the page talks to nobody. Owning the runtime is the price: a Java compiler and runtime
compiled to WebAssembly, pinned by checksum, and served from the site itself.

**The engine is a fork of teavm-javac:** OpenJDK 25's real `javac` and the TeaVM compiler, both
compiled to WebAssembly. A spike proved it: 11 patches make runtime exceptions catchable, add keyboard
input (`System.in`, `IO.readln`, a `Scanner` subset), fix `String.format`, and print uncaught
exceptions the way the JDK does. TeaVM reimplements the Java library, so fidelity to the real JDK is
patched in piece by piece (exception message text, `HashMap` order, `Math.round`), and a build gate
catches every difference that remains. It downloads about 4.2 MB compressed: `compiler.wasm`,
`runtime-classlib-teavm.bin`, `compile-classlib-teavm.bin`, `compiler.wasm-runtime.js` and
`compiler.wasm-deobfuscator.wasm`, each compressed with gzip -9, summed. Hello World, run by the
course's runner in headless Chromium on localhost, takes about 0.54 seconds from a cold page (the
median of five fresh browsers, each timed from navigation to output) and 0.24 seconds after that (in
each of those browsers, the median of five more runs in the same page; then the median of those five).

**Programs run in a Web Worker,** a background thread the page can kill. That is what lets a runaway
program be stopped without freezing the page, and it was a condition of choosing this engine.

**Talks to nobody.** The page's own scripts talk to nobody, and so does a box's program. The runtime's
`java.net` makes no request at all: an http(s) connection fails at once, with an exception a program can
catch (patch teavm-0018). For a host name it is the one the JDK throws on a computer with no network
(`UnknownHostException` naming the host, as the JDK says for a `.invalid` host). 127.0.0.1 and localhost
answer as the JDK does when nothing listens there, `ConnectException: Connection refused` (patch teavm-0020,
D100): a box has no computer of its own, so nothing listens on its loopback. Any other address, such as
192.0.2.1, answers `ConnectException: Network is unreachable`, a choice, not the JDK's answer (D92):
the JDK's machine has a network, so its offline answer cannot be observed. TeaVM's JavaScript interop (`@JSBody`,
the `org.teavm.jso` package), which the real JDK does not have, is kept from a box by two barriers, so a
box cannot run JavaScript. It is not in the compiler's class library, so the runtime refuses it as the JDK
does (patch teavm-javac-0106). And a box cannot declare a class in `org.teavm` or in a package under it
(`runtime/runner/tjava-core.js` refuses it with a compile error of the course's own, since the JDK would
compile it), so it cannot declare its own `@JSBody` or `@Import`, which TeaVM would honor. The doors close
every other path: every worker that compiles or runs a box's program removes its doors to the network once
it has loaded what it needs (`web/runner/doors.js`). `fetch`, WebSockets, `EventSource`, nested workers,
`importScripts`, Cache Storage and font loading (`FontFace`, `fonts`) are gone, and `XMLHttpRequest` is a
stub whose `send()` fails as a synchronous request does with no network. `import()` cannot be removed, and
those two barriers keep everything a reader writes from reaching it. The scratchpad's worker (Ristretto's
pinned `worker.js`) was probed and reaches nothing: its virtual machine has no native socket support, so
`java.net` fails inside it (`web/test/scratchpad.mjs`, the W-8 check), and it runs without the doors.

**Ristretto was measured against it and lost as the main engine.** It is a Java virtual machine
written in Rust and compiled to WebAssembly, interpreting a reduced copy of the real JDK library. Its
library behavior is closer to the real JDK, but it cannot run `void main()` files, has no keyboard
input, downloads about 24 MB compressed, takes about 5 seconds per Run, and computes 100 to 200 times slower than
the JDK. It does run the JDK's own jshell engine, which is where the course uses it (section 2).

## 2. What the reader sees

- **Every box is a complete Java file.** JDK 25 compact source files:
  `void main() { IO.println("Hello, world!"); }` runs unchanged with `java Hello.java`. Chapter 1
  explains `main` in one honest sentence; `void` and methods get their real explanation in the
  Functions chapter.
- **`IO.println` and `IO.readln` throughout.** `System.out.println` and `Scanner` appear once, in an
  appendix, as "what you will see elsewhere", with `Scanner`'s `nextInt`/`nextLine` trap explained.
- **Types arrive in chapter 2** as declarations: `int`, `double`, `String`, `boolean`. `char` waits for
  the Strings chapter; `long`, integer overflow and integer division appear in chapter 3; `var` stays
  in an appendix. Chapter 2 shows the first deliberate compile error: `int count = "three";`.
- **`==` versus `.equals`** is taught in chapter 3 with the comparison operators, with the trap shown
  on the spot. The full "same object" explanation comes when objects arrive: arrays in chapter 7 and
  records in chapter 10.
- **Validating input** in chapter 4 is `try`/`catch` around `Integer.parseInt`, the one tool; later
  chapters use it wherever the Python course uses `.isdigit()`.
- **Lists** (chapter 7): arrays first, with the same `[]` indexing as Python, then `ArrayList` for
  lists that grow.
- **Tuples:** chapter 6 methods return one value each; chapter 10 becomes Records. Tuple unpacking and
  the one-line swap have no Java equivalent and are dropped; the three-line swap with a temporary
  variable is taught where assignment is.
- **Maps and sets** (chapter 9): printing order matches the real JDK exactly, and the order is the
  lesson: `HashMap` promises none, `LinkedHashMap` keeps insertion order like a Python `dict`,
  `TreeMap` sorts. A dedicated test covers every insertion method, several resizes and colliding keys.
- **Runtime error messages match the real JDK** for everything a first course shows. The one
  exception is the null-pointer "helpful" message; no page shows its text, and an appendix explains it.
  In Safari (on the Mac, iPhone and iPad), an uncaught exception also loses the `at` lines under its
  first line, because Safari does not tell the page where in the compiled program it happened; a way
  around that is planned.
- **`Math.log` can differ from an x86-64 JDK in the last digit.** A box computes it with fdlibm, the library
  `StrictMath.log` is defined by, which is what the JDK gives on a Mac with Apple silicon. The JDK on an x86-64 machine
  may compute it another way, as Java allows (within one unit in the last place): on x86-64 Linux, 458 of 20,000 values
  tested differ, and `Math.log(0.0822)` prints `-2.498599976920003` in a box where that JDK prints
  `-2.4985999769200027` (D112).
- **Keyboard input in Run** works by replay: the program stops at a question, the reader answers in
  place, and the program re-runs with the answers so far. The transcript reads like a terminal.
  `Random` holds steady across replays, no example times the reader, and Ctrl-D ends input.
- **In a box, a runaway program is stopped, never left to hang or crash the page.** An endless loop is stopped
  at a deadline; endless printing is stopped by an output cap; a program that runs out of memory or
  recurses without end is reported the way the JDK reports it (`java.lang.OutOfMemoryError`,
  `java.lang.StackOverflowError`), and the next Run works. One exception: in Chrome, Edge and other
  Chromium browsers, a program that keeps filling memory with arrays can take the whole tab down
  before its deadline, because the browser runs the program's worker in the page's own process, and
  Safari can lose the page the same way after other runaway programs. Reloading brings the page back
  with the reader's edited code, which each box keeps in the browser's storage. The engine cannot
  yet let a program *catch* those two errors, so no example tries to, and the differential gate
  enforces that.
  Chapter 12's deliberate runaway recursion is declared as an example that crashes on purpose.
- **The scratchpad is a jshell in the browser:** the JDK's own jshell engine (its `jdk.jshell` library) running on
  Ristretto, a Java virtual machine compiled to WebAssembly, with the course's own front end, written from the real
  tool's observed output and public documents, never from its source (D55); pinned and served from the site, and loaded
  only when a reader opens it. It prints what the JDK 25 jshell prints, and a check holds it to the real tool entry by
  entry: of 562 entries, the 72 the course uses among them, 525 are byte-identical and the rest differ only where
  announced. It starts with the ten imports of jshell's own `DEFAULT_NO_MODULE_IMPORTS` startup plus `java.time.*`, not
  `import module java.base;` (which doubles the memory each entry uses on Ristretto and slows each by about 60%), so
  snippet numbers and `/imports` differ from a plain `jshell`; redefining a class in place loses its state where the
  real tool's local engine would too; JDK stack frames print `(Unknown Source)`; the virtual machine words a few
  exception messages itself; and `/help`, and the commands it does not offer, answer in the course's own words. There is
  no keyboard input (`System.in` is empty, and the scratchpad says so), and `System.exit` ends the session. Opening it
  downloads about 30 MB; a page served over https or from localhost keeps it for the next visit unless the browser is
  set not to keep site data, and one served over plain http may download it again on each visit. The download is checked
  with SHA-256: the browser's own where it has one, the course's own JavaScript where it does not. Over plain http the
  check catches a damaged or cut-short download, not a tampered one, since the list of hashes arrives the same way. Over
  plain http Safari, and every browser on iPhone or iPad (all of them WebKit), cannot start it (D90): on a MacBook Air
  (M4), Safari downloaded the files from a site served over plain http from the Mac's LAN address, then had not started
  jshell when the client's 240 s boot deadline passed, and a box ran noticeably slowly there. Playwright's WebKit slows
  the same way on a page loaded over the network at a non-secure origin (JavaScript about 13 times, WebAssembly about 28
  times), but not on a page a test serves through a route, so a route-served test would be falsely reassuring; its
  plain-http check stops once the download is checked and jshell's worker has started, before the engine runs. On a page
  that is not secure the startup note says so, and a start or a box that runs out of time adds that Safari and every
  iPhone or iPad browser run Java much more slowly there and names https or localhost (D91), chosen by
  `isSecureContext`, never by the browser's name. Chrome and Firefox are tested end to end at a plain-http origin. The
  times that follow are for https or localhost. Opening it takes about 10 seconds in Chrome and Safari on a computer and
  up to a minute in Firefox or on a phone (on an iPhone, 12 seconds in Edge and up to a minute in Safari); an entry then
  takes a couple of seconds (about five for the first one in Firefox); `/reset` starts a fresh virtual machine (under 10
  seconds, about 15 in Firefox), and `/reload` then runs the session's entries again. A runaway entry is stopped by the
  reader or after 60 seconds, and the scratchpad starts a fresh session and says why. Unlike a box, an entry that uses
  up memory is not reported as `java.lang.OutOfMemoryError`: the engine aborts, the session ends in plain words, and a
  fresh one starts; a session can use several gigabytes first, so a small device may lose the tab. The memory a session
  uses is never given back, so a long session ends and starts again: after roughly 70 to 150 entries, fewer when entries
  declare many classes (about 50 in the worst case measured).

## 3. Checking answers

- **Method exercises** start with the method's full signature and a `main` that calls it, so Run works at once.
  Check keeps the reader's file as it is, a compact source file, except that it renames the reader's `main` so it
  never runs; it appends a generated `main` that calls the method with each test case, each in its own
  `try`/`catch`, compiles the result with the real `javac`, and reports each case. Test values are written into the
  generated Java and compared inside Java; no test data crosses between JavaScript and Java, which is where the
  Python course's worst check bugs lived. If the reader changed the method's signature, `javac`'s error is
  translated into plain words.
- **"What it should do"** lists the test cases in Java syntax, such as `isEven(4) -> true`.
- **Input exercises** feed fixed answers and look for the pinned numbers or words, in order, however
  they are worded. **Output** exercises compare the output line for line after tidying it as the build
  tidies a stated output: line endings become LF, and spaces and tabs at the end of a line and blank lines
  at the start and end are ignored; any other difference fails. **Predict the output** compares the same
  way, against output the build has already verified.
- **Every check is tested three ways before it ships:** a correct answer passes, a second correct
  answer in another style passes, a realistic mistake fails. On both the browser runtime and the real
  JDK. That is evidence, not proof over every possible answer, which is why the next rule exists.
- **Where a verdict cannot be trusted, there is no Check button,** and the page says so.

## 4. The build, the tests, and their gates

**The build** is Java: one `Build.java`, run with `java build/Build.java`, needing JDK 25 and the pinned runtime and scratchpad
releases (section 7) to build; `--check` also needs Node 25 to run the browser runtime, and fails, never skips, without it.
It fails, rather than shipping, when:

- a box fails without being declared a deliberate teaching error, or a box declared to fail does not
  fail the way it says;
- a stated output is not what the code prints;
- **the browser runtime and the real JDK disagree** on any example, including examples that read
  input. Examples whose output legitimately varies, such as `Set.of` ordering, carry a "varies" mark
  and run twice;
- a worked solution, practice step, check starter or quiz uses something the chapters have not
  shown yet. Vocabulary is derived from the chapters themselves using `javac`'s own syntax tree:
  syntax kinds, library members by their owning type, library types, and keywords. A fence exempted
  because it fails to compile on purpose must really fail to compile. The gate is syntactic, so ideas
  with no syntax of their own, such as recursion, rely on the review in section 6;
- anything private is reachable under the published site: answer keys, worked solutions, or the check declarations
  as a whole. Each check travels only inside its own box, with just what that check needs; a single file or page
  carrying every check is never published;
- the runtime files do not match their pinned checksums.

**The trusted JDK is pinned too.** The real JDK the differential gate compares against is a specific
Temurin JDK 25 build, verified by checksum, and run with a fixed locale and UTF-8 encoding, so the
reference cannot drift under the gate.

**Publishing is by whitelist.** Files reach the published site only by an explicit list of what a page
is; the private-content scan is the second line of defense, not the first. The `.docx` export runs the
same scan inside the file it writes, because it can run on its own, after the build.

**The tests** run the parts that need the browser runtime or a real browser: every check's three-way
proof, the replay test (every input example answered all at once and one question at a time must give
the same transcript), the `HashMap` order test, the jshell transcript check, and the browser test.

Support tooling need not be Java: the leak-hook tests and the `.docx` export are Python.

## 5. Browsers

Current Chrome, Firefox and Safari, including iOS; Safari and every browser on iPhone or iPad need the
course over https or from localhost, since over plain http they cannot start the scratchpad (section 8).
The browser test runs in Chromium, WebKit and Firefox, opens the scratchpad as well as the boxes, and
fails if any request leaves the site. Older browsers can still read every page; a box says plainly that
the browser cannot run Java and names the minimum versions. Support is found by feature detection, never
by guessing from the browser's name. Everything works at 390 pixels wide.

## 6. Content and review

Chapters are adapted one by one from Python Foundations: same structure, same projects and practice
stories where they fit Java, redesigned where the decisions above say so, in the Python course's voice.
The machinery comes first, with chapter 1 as its pilot. Before the author sees a chapter, it passes
every gate and a review by fresh reviewers. The author then reviews the built chapter privately, as a
page with working Run and Check buttons that takes comments and reads well on a phone; only after
approval is it committed.

Also carried over:
- a practice page per chapter, one project built in checked steps;
- a quiz per chapter, plain text, every "what does this print" answer verified on the real JDK, answer
  keys never published;
- worked solutions, revealed one exercise at a time, never published together;
- the code as downloadable `.java` files;
- a `.docx` of the whole course, optional, built by a Python script adapted from the Python course's,
  with its Author, Title and Comments metadata filled in and a check that the file actually opens;
- the appendices, adapted: errors cover compile errors as well as runtime ones, and "the two kinds of
  box" becomes boxes and jshell.

## 7. The runtime, owned

- Patches live in this repository as a series, with a pinned build script. The built runtime is
  published as a release, pinned by checksum, and fetched by the build. The scratchpad's version, in the
  `manifest.json` its client reads, is the first 16 hex digits of the SHA-256 over `"<sha256>  <name>\n"` for its six
  runtime files, in `CHECKSUMS` order, so it changes exactly when a byte a reader runs does (a test pins today's).
- **What the checksum proves, and what it does not.** It proves the bytes a reader runs are the bytes
  that were released. It does not prove they came from the patches here, because the same hands build
  and pin them. That proof comes from rebuilding: the goal is a byte-reproducible build (the compiler
  file is not reproducible yet), and until then a rebuild is accepted only when it passes the full
  differential suite.
- **Clean room.** Patches are written from the JDK's observed behavior and its public documentation,
  never from OpenJDK source, both because upstream TeaVM will not accept OpenJDK-derived code and
  because it keeps the licensing clean. Whoever has read the relevant OpenJDK source does not write
  that patch; someone who has not, working only from the differential gate and the public Javadoc,
  does. Nobody opens OpenJDK or Corretto source in any form (a JDK's `lib/src.zip`, a source archive, OpenJDK on the web);
  the Corretto archive the scratchpad release ships is downloaded, hashed and copied whole, never extracted or listed
  (D51); and the course's jshell front end was written the same way, from the real tool's observed output and public
  documents, its derivation log `runtime/jshell/DERIVATION.md`, whose Disclosures section
  records what its clean room let through. Three patch headers (teavm-0011, teavm-0019 and teavm-0020) point at
  clean-room records kept in commit messages of the private history (D95, D96); `docs/clean-room-records.md` copies them.
- Genuine bug fixes are offered upstream later, one at a time, each approved by the author first:
  to TeaVM and teavm-javac, and to Ristretto: Firefox's slow jshell start (about a minute, against
  about 10 seconds elsewhere: D54), `void main()` support, uncaught-exception text, and out-of-memory
  handling, including the end of a session whose memory passes 2 GiB. JDK-fidelity changes to TeaVM
  stay ours, since TeaVM is a usable stand-in for the JDK rather than a copy of it.
- teavm-javac's repository states Apache-2.0 in its README but carries no license file. Asking its
  author to add one is the first thing on the give-back list.
- Two engines are pinned: the teavm-javac fork for every box, and Ristretto for the scratchpad. Each
  runtime release ships the licenses it needs and the exact source that corresponds to it, including
  the OpenJDK and Corretto parts under GPLv2 with the Classpath Exception. The scratchpad release carries the
  course's own jshell front end (Apache-2.0, built byte-reproducibly from `runtime/jshell/src/` and composed with
  Ristretto's unmodified zip in the reader's browser); Ristretto under Apache-2.0 OR MIT (both texts, neither elected); the
  Rust standard library, wasi-libc and the crates compiled into its WebAssembly (among them MPL-2.0 and Zlib code); the IJG
  notice; and the reduced Corretto under GPLv2 with the Classpath Exception, with the exact Corretto source archive in the
  release, never extracted here (D51). For both runtimes now, a missing notice, license text or source pointer stops the
  build (D53), and the boxes' notices are tracked in `runtime/legal/`. Each runtime's `SOURCES.txt` carries GPLv2's
  written offer of the source, asked for in the repository's issues (D58); the offer runs for at least three years after
  a reader received the files from us and for as long as we distribute them. Each runtime's `CHECKSUMS` is published
  beside its notices (a missing one stops the build too), and each runtime's notices say where its source archive lies,
  in the same words (D109): "beside these files in each GitHub release of this runtime at
  https://github.com/mmmugh/groundwork/releases, and inside the course's site zip whenever one is published". The
  crate libjpeg-turbo-rs ports files of libjpeg-turbo, which the IJG license covers, so the scratchpad's
  `THIRD-PARTY.txt` carries the IJG README, verbatim, and its `source.tar.gz` carries it beside the crate.

## 8. Publishing, CI and licenses

- Public repository `mmmugh/groundwork`, which began as one fresh-start commit (D96); the history before it, with the
  author's working notes, stays private (D95). Nothing is pushed, released or deployed without the author's explicit
  go-ahead at the time.
- Leak-scanning git hooks are installed before the first commit. The personal pattern list stays out
  of the repository.
- **CI is split in two (D83), each step a script under `ci/` that runs the same command list on a Mac and on a runner,
  but for the few steps named below.** On every push, `quick.yml` runs three jobs: `node` (the build's tests with every
  gate, the runtime and jshell tests under Node, `Build.java --check`), `chromium` (the runner, page and doors tests in
  Chromium) and `leaks`. `leaks` runs the hook tests, a pinned gitleaks over the whole history, and the project's own
  scanner over the whole history with the personal pattern list supplied as an encrypted CI secret
  (`LEAK_PATTERNS_LOCAL`), so it never appears in the repository; with no secret the job fails and says so. On a pull
  request from a fork GitHub withholds the secret, so the job runs gitleaks and the generic patterns and says so, and the
  maintainer runs the full scan before merging. `pages.yml` is a third workflow, run by hand: its build runs the
  publishing guard, and every gate once a volume exists. Every Monday
  `weekly.yml` runs the whole suite: the Node job with the front end's breaks, and every browser test in Chromium,
  WebKit and Firefox, one engine per job. Two checks run only on the Mac, through `ci/everything.sh`:
  `check-observations`, which reads the git-ignored corpus that only the real jshell regenerates, and the hash of the
  Java preferences plist before and after the run (the real jshell must not write it). And a few run only on Linux: the
  leaks job's two history scans (gitleaks and the project's own scanner, which needs the secret; on a Mac `quick.sh
  leaks` runs only the hook tests), the check after each list that starts the real jshell that it wrote no
  `~/.java/.userPrefs` (a fresh runner has none), and `ci/setup.sh`'s installs, whose JDK download must pass its SHA-256
  check before anything unpacks or runs it. CI never rebuilds the runtime: it fetches the published releases, and the
  CI-only variant built without patch 0009 for the fork gate, and verifies their checksums.
- `pages.yml` deploys the site to https://mmmugh.github.io/groundwork/, run by hand on the author's go: a fresh
  checkout's build, uploaded as a Pages artifact; no Jekyll runs, so nothing needs `.nojekyll` (D98).
  https://mmmugh.github.io is one origin, shared by every GitHub Pages site on the account (D82), so no other Pages site
  on the account may serve untrusted or proof-of-concept content: a page there could read the course's storage in a
  reader's browser. Until the first chapter the index says it is being written (D103). What Pages actually sends (its
  gzip of the `.wasm` and `.js` files) is unmeasured until the site is live.
- **Hosting is a supported path, not only the public site (D80, D85).** Each course release, from the first chapter
  on (D103), carries the built site as one zip, `groundwork-<version>.zip`, which anyone unzips and serves with any static web server and no configuration:
  at the root of a site or under a subpath, and from a server that knows only `.html`, `.css`, `.js`, `.json` and `.txt`
  (the page's modules end in `.js`, and both WebAssembly files load as bytes, so no `.mjs` or `.wasm` type is needed).
  `build/SiteZip.java` writes it, `README.md` ("Host it yourself") tells a reader how to use it, and the zip's test
  serves the unzipped site under `/groundwork/` with everything outside that prefix answering 404. The one real zip
  measured 352,278,442 bytes, most of it the two runtimes' source.
- **Plain http is supported for Chrome and Firefox on a computer, at a cost (D79, D91).** A page opened over plain http
  from another device has no `crypto.subtle` and no Cache Storage: the scratchpad still starts and still checks its
  download (a damaged or cut-short one, not a tampered one, as section 2 says), but it may download again on each visit,
  since only the browser's HTTP cache may keep the files. Chromium and Firefox are tested end to end at a plain-http
  origin. Safari, and every browser on iPhone or iPad, cannot start the scratchpad there (D90): on a MacBook Air (M4),
  Safari downloaded its files and then had not started jshell when the 240 s boot deadline passed, and a box ran
  noticeably slowly (section 2). The page says so where it matters and names https or localhost, and `README.md` ("Host
  it yourself") names an easy https route. The five scratchpad assets are 29,898,282 bytes, the "about 30 MB" the page
  states.
- **The source travels beside the runtimes (D81).** The zip carries `runtime/source.tar.gz` and
  `scratchpad/source.tar.gz` beside each runtime's `NOTICE`, so serving the folder offers the corresponding source from
  the same place, which is how GPLv2 section 3 is met for a self-hoster. Those archives hold OpenJDK and Corretto
  source, so nothing here opens them: `runtime/source-archives.sha256` pins each archive's SHA-256, `SiteZip` compares
  the raw bytes against it, and the publishing guard never reads them. The pin file is rewritten only after the
  last edit to anything an archive carries. The public Pages site carries no source archives; the runtimes' notices point
  at the GitHub releases, which hold them (D109).
- **Code** (build, page scripts, tests, hooks, runtime patches): Apache-2.0.
- **Course** (chapters and their example programs, exercises, solutions, practice pages, quizzes, the
  generated `.java` files and `.docx`): CC BY-NC-SA 4.0. It is written with Claude, from reading
  others' work, and is shared freely; nobody, the author included, should sell it.
- The README says which license covers which directories.

Title: *Groundwork: Learn to Program in Java*. Byline: Justin Stewart—built with Claude
Opus 5.5. The audience is the Python course's audience; its voice and pace carry over unchanged.
