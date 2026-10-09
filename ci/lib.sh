# Copyright 2026 Groundwork contributors.
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

# lib.sh: what every ci script shares (sourced, never run). It finds the repository root from its own path and goes
# there, resolves the pinned JDK (JF_JAVA_HOME, then the Mac's Contents/Home, then Linux's bare layout), points JF_DIST at
# the fetched runtime when runtime/dist/fork is absent, and holds the command lists the three scripts compose. `step` runs
# one command whatever happened before it and remembers a failure; `finish` exits 1 naming every command that failed.
# The same lists run on the Mac and on a runner (W-13). ci/test.mjs holds these scripts to their promises.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 2

JDK_DIR="$ROOT/runtime/.work/jdk25/jdk-25.0.4.1+1"
if [ -n "${JF_JAVA_HOME:-}" ]; then :
elif [ -x "$JDK_DIR/Contents/Home/bin/java" ]; then JF_JAVA_HOME="$JDK_DIR/Contents/Home"
else JF_JAVA_HOME="$JDK_DIR"; fi
export JF_JAVA_HOME
J="$JF_JAVA_HOME/bin/java"

# The boxes' runtime: runtime/dist/fork where a build made it, else what `Build.java --fetch-runtime` put in build/.work/runtime.
if [ -z "${JF_DIST:-}" ] && [ ! -d "$ROOT/runtime/dist/fork" ]; then export JF_DIST="$ROOT/build/.work/runtime"; fi

FAILED=()
# Set only by setup.sh's --dry-run, never read from the environment: an inherited DRY_RUN made every script print its
# commands, run none and say "every command passed" (T-3).
dry_run=
# CI_LOG_DIR set (ci/everything.sh): each command's output goes to <name>.log there and one line to SUMMARY.txt, in the
# format build/.work/run-everything.sh used. Unset: the output goes to the terminal, which is the job's log on a runner.
step() { # step <name> <command...>
  local name=$1 rc t0; shift
  if [ -n "$dry_run" ]; then printf '+ %s\n' "$*"; return 0; fi
  t0=$(date +%s)
  if [ -n "${CI_LOG_DIR:-}" ]; then "$@" > "$CI_LOG_DIR/$name.log" 2>&1; rc=$?
  else printf '== %s\n' "$name"; "$@"; rc=$?; fi
  if [ -n "${CI_LOG_DIR:-}" ]; then
    printf '%-40s exit %d  %4ds  %s\n' "$name" "$rc" $(( $(date +%s) - t0 )) \
      "$(grep -v '^[[:space:]]*$' "$CI_LOG_DIR/$name.log" | tail -1 | cut -c1-150)" >> "$CI_LOG_DIR/SUMMARY.txt"
  fi
  if [ "$rc" -ne 0 ]; then FAILED+=("$name (exit $rc)"); printf 'FAILED: %s exit %d\n' "$name" "$rc" >&2; fi
  return 0
}
finish() {
  if [ -n "$dry_run" ]; then echo "dry run: nothing ran"; exit 0; fi
  if [ "${#FAILED[@]}" -gt 0 ]; then
    printf '%d command(s) failed:\n' "${#FAILED[@]}" >&2
    printf '  %s\n' "${FAILED[@]}" >&2
    exit 1
  fi
  echo "every command passed"
  exit 0
}

# RealJShell must not write preferences: a fresh Linux runner has no ~/.java/.userPrefs, so one means an entry ran un-isolated.
# (The Mac's check is the plist hash in ci/everything.sh.)
no_user_prefs() { test ! -e "$HOME/.java/.userPrefs"; }
user_prefs_step() { [ "$(uname)" = Linux ] && step "$1" no_user_prefs; return 0; }

# --- the lists -------------------------------------------------------------------------------------------------------

# the hook tests (quick leaks, and everything.sh); they supply their own patterns
hook_test_steps() {
  step leak-scan-test python3 tests/leak_scan_test.py
  step pre-push-test python3 tests/pre_push_test.py
}

# quick node
node_steps() {
  step BuildTest "$J" build/BuildTest.java
  local t
  for t in differential smoke runner-safety runner-faults runner-input packages hash-order random-seed; do step "rt-$t" node "runtime/test/$t.mjs"; done
  for t in serve replay check sha256 jshell-session; do step "web-$t" node "web/test/$t.mjs"; done
  step jshell-check node runtime/jshell/test/check.mjs
  step jshell-check-native node runtime/jshell/test/check.mjs --native
  user_prefs_step jshell-no-user-prefs
  step ci-test node ci/test.mjs
  step fetch-release-test node runtime/ristretto/fetch-release-test.mjs
  step ristretto-verify sh runtime/ristretto/verify.sh runtime/.work/ristretto/current
  step build-check "$J" build/Build.java --check
}

# quick chromium
chromium_steps() {
  step web-runner-chromium node web/test/runner.mjs chromium
  step web-page-chromium node web/test/page.mjs chromium
  step replay-page-test node web/test/replay.mjs --site build/.work/page-test
  step web-doors-chromium node web/test/doors.mjs chromium
}

# weekly node: quick node plus the front end's breaks
weekly_node_steps() {
  node_steps
  step jshell-breaks node runtime/jshell/test/breaks.mjs
  user_prefs_step jshell-breaks-no-user-prefs
}

# weekly <engine>
browser_steps() { # browser_steps <engine>
  local e=$1 t
  for t in runner page scratchpad-panel scratchpad doors zip; do step "web-$t-$e" node "web/test/$t.mjs" "$e"; done
  step "jshell-check-$e" node runtime/jshell/test/check.mjs --browser "$e"
  user_prefs_step "jshell-check-$e-no-user-prefs"
}
