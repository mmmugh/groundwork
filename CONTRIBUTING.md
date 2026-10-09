# Contributing

Issues are welcome for anything wrong, unclear or missing. Pull requests are welcome for chapter text, documentation, the
page (`web/`), the build (`build/`) and CI (`ci/`, `.github/`). Outside chapter text is reviewed the way the author's own
is (DESIGN.md, section 6).

## The clean room

Three places take no outside code: `runtime/patches/` (the changes to TeaVM and teavm-javac that make a box behave like the
JDK), `runtime/jshell/` (the scratchpad's jshell front end), and the differential gate's cases and accepted differences
(`runtime/test/cases.mjs`, `runtime/test/known-differences.json`). They are written only from the JDK's observed behavior
and its public documentation, by someone who has not read the relevant OpenJDK source, so that the fixes can be offered
to TeaVM (whose README refuses classlib code based on OpenJDK) and so the licensing stays clean (DESIGN.md, section 7). A
pull request cannot show how it was written, so instead please open an issue with a short program, what the real JDK
prints for it and what a box prints (for the scratchpad: what the real jshell prints and what the scratchpad prints);
the case and the fix are then written through that process. Please do not paste, link or paraphrase OpenJDK source in an
issue; the program and the two outputs are all the fix needs.

## Licenses

Contributions are licensed as the directory they change: chapters and everything under `volumes/` under CC BY-NC-SA 4.0
(`LICENSE-COURSE`); everything else under Apache-2.0 (`LICENSE`), except the third-party material README.md's
"Licenses" section lists with its own licenses.

## Before you commit

Turn on the leak hooks once per clone: `git config core.hooksPath .githooks`. They scan every commit and push for
secrets, home paths and private addresses; never bypass them with `--no-verify`. README.md says how to run the tests.

On a pull request from a fork, GitHub withholds the repository's secrets, so CI's leaks job runs gitleaks and the
generic patterns and says so; the maintainer runs the full scan before merging. A push inside your own fork with Actions
turned on fails the leaks job, because the fork has no secret; a pull request into this repository is what runs the
reduced scan.

Security problems: see SECURITY.md, not an issue.
