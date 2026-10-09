# Groundwork

*Groundwork: Learn to Program in Java*, the Java counterpart to Python Foundations: a
twelve-chapter first course where every example is an editable box that runs in the browser, with
nothing installed and no server.

**Status: no chapter yet.** The first chapter is being written, and the site at https://mmmugh.github.io/groundwork/
says so until it is published. [DESIGN.md](DESIGN.md) records how the course is built and why;
[DECISIONS.md](DECISIONS.md) records each decision by number.

## Building and checking

The pinned JDK the build and its gates run on:

```
J=runtime/.work/jdk25/jdk-25.0.4.1+1/Contents/Home/bin/java
```

(built by `runtime/build.sh`). That is the Mac's layout. On Linux, `bash ci/setup.sh` unpacks the same release for
linux x64 without `Contents/Home`: `J=runtime/.work/jdk25/jdk-25.0.4.1+1/bin/java`. The `ci/` scripts find it as
`ci/lib.sh` does: `JF_JAVA_HOME` if set, then the Mac's layout, then Linux's.

```
$J build/Build.java            # build: volumes/ -> site/, needing JDK 25 and the runtime and scratchpad releases
$J build/Build.java --check    # build and every gate, also needing Node 25 (see DESIGN.md section 4)
$J build/BuildTest.java         # the build's own tests
```

The build reads two releases, the boxes' runtime (`runtime/dist/fork`) and the scratchpad's. A fresh clone fetches both,
in this order: `bash runtime/ristretto/fetch-release.sh` first (the build stops with "no scratchpad" without it), which
fetches the scratchpad's release into `runtime/.work/ristretto/release/`, made current only when complete; then
`java build/Build.java`, which fetches the boxes' runtime itself when there is no `runtime/dist/fork` (into
`build/.work/runtime`, every file checked against its checksum; `--fetch-runtime` does only that). The fetches read their
base URLs from `runtime/release-url.txt` and `runtime/ristretto/release-url.txt`, follow GitHub's redirect, verify
every byte and leave nothing half-made. A build with no `runtime/dist/fork` whose fetch fails names the file it could not
get and says to run `runtime/build.sh`. Building the releases yourself is the alternative: `runtime/build.sh` builds the
boxes' runtime into `runtime/dist/fork`, and the scratchpad's release tools are `runtime/ristretto/fetch.sh` (downloads
Ristretto's five pinned files, checking each against its checksum), `runtime/ristretto/package.sh
scratchpad-YYYY.MM.DD-N` (downloads the source inputs, Corretto's archive among them, and builds the release: the front
end, the notices, the corresponding source) and `runtime/ristretto/verify.sh <dir>` (checks a release directory). Those
need the network and `python3` 3.11 or newer, and the scratchpad's release takes about 160 MB of downloads, once.
`--scratchpad <dir>` points the build at another release directory than the one `package.sh` made last
(`runtime/.work/ristretto/current`).

`runtime/legal/` holds the boxes' runtime's third-party notices, license texts and source pointer, tracked so the build can
publish them without the runtime's work directory; `runtime/release/package.sh` rewrites it from the release it packages.
The course's jshell front end for the scratchpad is `runtime/jshell/` (`build.sh` builds it; `DERIVATION.md` records how it
was written from the real tool's observed output). A change to it goes only through its clean room, described there.

`--check` fails, never skips, without Node 25: it runs every example on the browser runtime as well as
the pinned JDK and refuses to ship if they disagree. See [volumes/README.md](volumes/README.md) for the
course layout and box declaration rules `_boxes.json` and `_checks.json` enforce.

## Reading the course locally

After a build, serve `site/` and open the course in a browser:

```
node web/serve.mjs             # serves site/ at http://127.0.0.1:8740/
```

`web/serve.mjs` takes `--root <dir>` and `--port <n>`. It listens only on 127.0.0.1, sends no header but a content
type (nothing in the course needs COOP/COEP), and refuses port 8731, which is the Python course's dev server. The
course itself installs nothing; the page runs Java in the reader's own browser. Any static server will do: the page's
scripts end in `.js` and its two WebAssembly files load as bytes, so a server that knows no `.mjs` or `.wasm` type
(stock nginx has no `.mjs` type, and 1.18 and older no `.wasm` type either), or one that knows only `.html`, `.css`,
`.js`, `.json` and `.txt`, serves a course that works.

## Host it yourself

The ready-site zip, `groundwork-<version>.zip`, arrives on the [releases page](https://github.com/mmmugh/groundwork/releases)
with the first chapter; until then there is no course to host. Then: download it, unzip it, and serve the folder with any
static web server. For example, inside the folder:

```
python3 -m http.server 8000     # then open http://localhost:8000/
```

No configuration is needed for any common server, and the folder works at the root of a site or under a subpath. Over
https or from localhost, the scratchpad keeps its download. Over plain http from another device it works in Chrome and
Firefox on a computer (tested) and may download again on each visit, but Safari and every browser on iPhone or iPad
run Java far too slowly there to start the scratchpad: Safari on a MacBook Air had not started it after four minutes,
and a box ran noticeably slowly. The page says so. For those browsers serve the folder over https; two easy routes are
Caddy, which gets and renews a certificate by itself for a domain name that points at your server, and Tailscale
Serve, which serves the folder at an https address inside your tailnet. Plain http on localhost works for the host's
own browser. The folder carries the runtimes' source (`runtime/source.tar.gz` and `scratchpad/source.tar.gz`) beside
their notices, so serving the folder offers the source from the same place, as GPLv2 section 3 allows.

## Continuous integration

Two workflows under `.github/workflows/` are thin: every step calls a script under `ci/`, which runs the same command
list on a Mac and on a Linux runner, but for the few steps that run on one of them only (below). They run on GitHub
Actions. A third workflow, `pages.yml`, builds the site from a fresh checkout and deploys it to GitHub Pages when the
author runs it; its build runs the publishing guard, and every gate once a volume exists.

```
bash ci/quick.sh node|chromium|leaks             # what runs on every push
bash ci/weekly.sh node|chromium|webkit|firefox   # the whole suite, split for a runner (Mondays)
bash ci/everything.sh                            # the whole suite on a Mac, about an hour
bash ci/setup.sh --dry-run chromium              # prints what a Linux runner installs, running nothing
node ci/test.mjs                                 # the ci scripts' own promises, on copies of them with stand-ins
```

Each exits 0 when every command passed and 1 naming every command that failed. `ci/setup.sh` without `--dry-run` runs
only on Linux, and a JDK download that fails its SHA-256 check stops it there, with nothing of it left behind or run.
A few steps run on Linux only: on a Linux runner `quick.sh leaks` also scans the whole history, with gitleaks and with
the project's own scanner, which needs the repository secret `LEAK_PATTERNS_LOCAL` and fails saying so without it (on
a Mac it runs only the two hook tests and says the history scans run on CI), and each list that starts the real jshell
then checks that it wrote no `~/.java/.userPrefs`. On a pull request from a fork,
GitHub withholds the secret, so the job runs gitleaks and the generic patterns and says so.

The maintainer never checks out a pull request from outside (with `git checkout` or `gh pr checkout`) in a clone whose
`core.hooksPath` is `.githooks`: the pull request's own hooks would run as the maintainer, and a checkout replaces or
deletes ignored files, the personal list included. Such a pull request is read with `gh pr diff <n>`, and run only in a
throwaway clone made with `git clone -c core.hooksPath=/dev/null`. That keeps the personal list and the hooks safe,
not the machine, since the pull request's scripts still run as the maintainer: run outside code only somewhere
disposable, never in the clone that holds the personal list. Before merging one, the maintainer scans its diff
through the guard below, which fails loudly when the personal list is missing or holds no pattern, where
`.githooks/leak-scan` alone skips a missing or empty list without a word:

```
grep -q -v -e '^[[:space:]]*#' -e '^[[:space:]]*$' .githooks/leak-patterns.local \
  || { echo "the personal list is missing or holds no pattern: nothing personal would be scanned" >&2; false; } \
  && gh pr diff <n> | LEAK_PATTERNS_LOCAL=.githooks/leak-patterns.local .githooks/leak-scan
```

`ci/everything.sh` is the Mac's run: it adds `check-observations`, which reads the git-ignored corpus only the real
jshell regenerates, hashes the Java preferences plist before and after (the real jshell must not write it), and writes
each command's output to `build/.work/logs/everything/` with one line per command in `SUMMARY.txt`. On Linux, CI
fetches the published releases and the CI-only variant built without patch 0009 instead of building the runtime.

## The page's tests

The tests are the only thing that needs `npm`, and only for the test tooling (`playwright-core`, pinned
in `package.json`):

```
npm install
```

`playwright-core` does not download browsers by itself, and the browser tests use Playwright's headless
Chromium, WebKit and Firefox. Install them by name; the names `playwright-core` 1.63.0 accepts
for these are `chromium-headless-shell` (Chromium's headless build), `webkit` and `firefox`:

```
npx playwright-core install chromium-headless-shell webkit firefox
```

Then, from the repository root (Node 25; each command exits 0 when every check passes, 1 when one fails,
2 on misuse):

```
node runtime/test/runner-input.mjs   # keyboard input by replay, on the browser runtime under Node
node runtime/test/runner-safety.mjs  # runaway programs are stopped and reported
node runtime/test/packages.mjs       # a box in a package runs, and no box declares a class in org.teavm
node web/test/serve.mjs              # the dev server
node web/test/sha256.mjs             # the page's own SHA-256 (for a page with no crypto.subtle), under Node
node web/test/replay.mjs             # replay transcripts, under Node
node web/test/check.mjs              # Check verdicts, under Node
node web/test/runner.mjs             # the runner in a real browser
node web/test/page.mjs               # a built page, box by box, in a real browser
node web/test/jshell-session.mjs     # the scratchpad's client, under Node
node runtime/jshell/test/check.mjs   # the one transcript check: the scratchpad against the real jshell, entry by entry
node runtime/jshell/test/breaks.mjs  # proves each of that check's gates by breaking it
node web/test/scratchpad-panel.mjs [engine]   # the scratchpad's panel in a real browser, against a stand-in worker
node web/test/scratchpad.mjs [engine]         # the real scratchpad in a real browser
node web/test/doors.mjs [engine]              # a worker that has closed its doors reaches nobody
node web/test/zip.mjs [engine]                # the self-hosting zip, unzipped and served as a self-hoster would
```

`check.mjs` runs the real tool only through `runtime/jshell/test/RealJShell.java`, never the `jshell` binary, which keeps
its history and settings in your own preferences file.

The tests that drive a real browser, `runner.mjs`, `page.mjs`, `scratchpad-panel.mjs`, `scratchpad.mjs`, `doors.mjs`,
`zip.mjs` and `check.mjs --browser`, run in Chromium, WebKit and Firefox in turn; give any of them an engine name to
run just that one, such as `node web/test/page.mjs webkit` (`check.mjs` takes `--browser webkit`). Each serves on port
0 (a free port) on 127.0.0.1, and fails if any request leaves the page's own origin. `doors.mjs` is the exception on
purpose: it serves with no header but a content type and no off-origin route, so nothing but the doors stands between
its worker and the network, and it counts the connections a live server on another port receives instead. `page.mjs`
builds a small test site in `build/.work/page-test`, which `node web/test/replay.mjs --site build/.work/page-test`
then reads. The rest of the runtime's gates are the other scripts under `runtime/test/` (`differential.mjs`,
`smoke.mjs` and the like).

## Setting up a clone

This repository is public, so every commit is scanned for leaks before it is made. Git hooks do not
travel with a clone; turn them on first:

```
git config core.hooksPath .githooks
cp .githooks/leak-patterns.local.example .githooks/leak-patterns.local   # then add your own literals
python3 tests/leak_scan_test.py
python3 tests/pre_push_test.py
```

`.githooks/leak-patterns` holds generic shapes (home directories, private network addresses, token
formats) and is safe to publish. `.githooks/leak-patterns.local` holds your personal literals and is
never committed. The hooks read the diff git produces; a binary file's contents are not seen.

## Licenses

| What | License |
| --- | --- |
| The course: chapters and their example programs, exercises, worked solutions, practice pages, quizzes, and the `.java` files and `.docx` generated from them (everything under `volumes/`, once it exists) | [CC BY-NC-SA 4.0](LICENSE-COURSE) |
| Everything else: the build, page scripts, tests, git hooks, runtime patches and the scratchpad's front end | [Apache-2.0](LICENSE) |
| `runtime/legal/`: third-party notices and license texts, which stay under their own licenses; and `runtime/jshell/derive/`, which quotes short pieces of the real tool's output as evidence | their own licenses |

The course is written with Claude, from reading others' work, and is shared freely. Nobody,
the author included, should sell it; the NonCommercial terms say so.

The runtimes the site serves carry their own licenses (TeaVM under Apache-2.0, Ristretto under Apache-2.0 OR MIT with
both texts shipped and neither elected, the course's front end under Apache-2.0, and the OpenJDK and Corretto parts under
GPLv2 with the Classpath Exception); each runtime release ships them alongside its corresponding source.
