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

# quick.sh: what runs on every push (W-13, W-15). Each command runs whatever happened before it; the script exits 1 and
# names every one that failed.
#   bash ci/quick.sh node|chromium|leaks
source "$(dirname "$0")/lib.sh"

# The leak scanners over the whole history. gitleaks is downloaded and checked from ci/pins.env, on Linux only.
gitleaks_scan() {
  local dir="$ROOT/runtime/.work/gitleaks"
  mkdir -p "$dir" || return 1
  curl -fsSL -o "$dir/gitleaks.tar.gz" "$GITLEAKS_LINUX_X64_URL" || return 1
  local got; got=$(sha256sum "$dir/gitleaks.tar.gz" | cut -d' ' -f1)
  [ "$got" = "$GITLEAKS_LINUX_X64_SHA256" ] || { echo "gitleaks: the download hashes to $got, ci/pins.env pins $GITLEAKS_LINUX_X64_SHA256" >&2; return 1; }
  tar -xzf "$dir/gitleaks.tar.gz" -C "$dir" gitleaks || return 1
  # --redact: a finding's secret never reaches the log, which is public.
  "$dir/gitleaks" git --no-banner --redact --verbose "$ROOT"
}
# .githooks/leak-scan over every commit, as the pre-push hook scans each one, with the personal patterns from the
# repository secret LEAK_PATTERNS_LOCAL. The leaks case below takes the secret out of the environment before anything
# runs, so this function alone sees it: never the hook tests, never gitleaks. It goes to a file in the runner's temp
# directory and is never echoed; the file is removed however the scan ends, and a signal removes it and stops the run.
# leak-scan's own output is dropped, because it prints the matching line and this log is public: a failure names the
# commit, and `git -c core.quotePath=false diff-tree -p -U0 --root -m <commit> | .githooks/leak-scan` shows the rest
# where the patterns are.
# GitHub gives no repository secret to a pull request from a fork (D102 turns pull requests on). quick.yml's leaks job
# sets LEAKS_FORK_PR=1 for one, and with no secret the scan then names no personal-patterns file: leak-scan falls back
# to .githooks/leak-patterns.local, which a runner does not have, and scans with the generic patterns only (on a Mac the
# same call would still read the local file). Any other run with no secret fails, and so does a secret of only blank or
# comment lines: leak-scan skips those, so it would scan with the generic patterns alone and pass.
leaks_history() {
  local file= bad=0 c commits rc
  if [ -n "$leaks_secret" ]; then
    if ! printf '%s\n' "$leaks_secret" | sed -e '/^[[:space:]]*#/d' -e '/^[[:space:]]*$/d' | grep -q .; then
      echo "LEAK_PATTERNS_LOCAL holds only blank or comment lines, which leak-scan skips: nothing personal was scanned" >&2
      return 1
    fi
    # A signal removes the file and stops the run, with the status the signal gives a shell (128 + its number). The
    # traps are set first, so they cover the file before the secret is written to it.
    trap 'rm -f "$file"; exit 129' HUP; trap 'rm -f "$file"; exit 130' INT; trap 'rm -f "$file"; exit 143' TERM
    if ! file=$(mktemp "${RUNNER_TEMP:-${TMPDIR:-/tmp}}/leak-patterns-local.XXXXXX") || ! printf '%s\n' "$leaks_secret" > "$file"; then
      rm -f "$file"; trap - HUP INT TERM
      echo "could not write the personal patterns to a temp file: nothing was scanned" >&2
      return 1
    fi
  elif [ "${LEAKS_FORK_PR:-}" = 1 ]; then
    echo "LEAK_PATTERNS_LOCAL is empty on a pull request from a fork: the personal leak patterns are a repository secret, which GitHub withholds from forks, so this scan uses the generic patterns only; the full scan runs on the push to main after a merge"
  else
    echo "LEAK_PATTERNS_LOCAL is not set: the personal leak patterns are a repository secret by that name; set it before this job can pass" >&2
    return 1
  fi
  # The scan never passes having scanned nothing: git failing to list the commits, listing none, or failing to give a
  # commit's whole diff (leak-scan would pass what it did not see) fails it.
  if ! commits=$(git rev-list --all); then
    echo "git rev-list --all failed: no commit was scanned" >&2
    bad=1; commits=
  elif [ -z "$commits" ]; then
    echo "git rev-list --all listed no commits: nothing was scanned" >&2
    bad=1
  fi
  for c in $commits; do
    git -c core.quotePath=false diff-tree -p -U0 --root -m --no-color "$c" | LEAK_PATTERNS_LOCAL="$file" .githooks/leak-scan > /dev/null 2>&1
    rc=("${PIPESTATUS[@]}")
    if [ "${rc[0]}" -ne 0 ]; then
      echo "git diff-tree failed on commit $(git rev-parse --short "$c"): leak-scan did not see all of it" >&2
      bad=1
    fi
    if [ "${rc[1]}" -ne 0 ]; then
      echo "leak-scan blocked commit $(git rev-parse --short "$c")" >&2
      bad=1
    fi
  done
  if [ -n "$file" ]; then rm -f "$file"; trap - HUP INT TERM; fi
  return $bad
}

case "${1:-}" in
  node) node_steps ;;
  chromium) chromium_steps ;;
  leaks)
    # The secret is leaks_history's alone (above): out of the environment before the hook tests and gitleaks run.
    leaks_secret=${LEAK_PATTERNS_LOCAL:-}
    unset LEAK_PATTERNS_LOCAL
    hook_test_steps
    if [ "$(uname)" = Linux ]; then
      source "$ROOT/ci/pins.env"
      step gitleaks-history gitleaks_scan
      step leak-scan-history leaks_history
    else
      echo "gitleaks-history and leak-scan-history run on CI (Linux) only"
    fi
    ;;
  *) echo "usage: bash ci/quick.sh node|chromium|leaks" >&2; exit 2 ;;
esac
finish
