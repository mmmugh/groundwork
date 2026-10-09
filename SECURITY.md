# Security

Groundwork runs readers' Java programs in their own browsers. A box's program is compiled and run in a Web Worker that
closes its doors to the network before the program starts; the scratchpad's jshell runs in its own worker, whose virtual
machine has no socket support (DESIGN.md, sections 1 and 2). If you find a way around either—a box or the scratchpad that
reaches the network, runs JavaScript of its own, reads another page's data or escapes its worker—or a build that
publishes something it must not, please report it privately.

## How to report

Use GitHub's private vulnerability reporting: open this repository's **Security** tab and choose **Report a
vulnerability**. Only you and the maintainer see the report until an advisory is published.

Please do not open a public issue, pull request or discussion about a vulnerability.

## What to include

The program or the steps, the browser and its version, what you expected and what happened.

## Scope

In scope: everything in this repository, including the page and runner in `web/`, the runner's core in
`runtime/runner/`, the build in `build/`, the runtime patches in `runtime/patches/`, the jshell front end in
`runtime/jshell/`, CI in `ci/` and `.github/workflows/`, and the git hooks in `.githooks/`; the runtime releases
published from it; and the published site at https://mmmugh.github.io/groundwork/. A flaw in
TeaVM, teavm-javac, Ristretto or a browser that does not depend on how the course uses it belongs with that project.
