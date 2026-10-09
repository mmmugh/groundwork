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

# everything.sh: the whole suite on the Mac, replacing build/.work/run-everything.sh (W-13, W-17). Every command of the
# quick and weekly lists (the hook tests included; quick.sh leaks's two history scans run on Linux CI only), then
# check-observations, which reads the git-ignored corpus only the real jshell regenerates and so runs in no CI job.
# Each command's output goes to build/.work/logs/everything/<name>.log and one line to SUMMARY.txt. The prefs plist is
# hashed before and after: RealJShell must not write it, so a changed hash fails the run. Exits 1 if anything failed.
#   bash ci/everything.sh
export CI_LOG_DIR=build/.work/logs/everything
source "$(dirname "$0")/lib.sh"
OUT="$ROOT/$CI_LOG_DIR"
CI_LOG_DIR="$OUT"
rm -rf "$OUT"; mkdir -p "$OUT"
PREFS="$HOME/Library/Preferences/com.apple.java.util.prefs.plist"
hash_prefs() { if [ -f "$PREFS" ]; then shasum -a 256 "$PREFS" | cut -c1-64; else echo "absent"; fi; }

[ "$(uname)" = Darwin ] && before=$(hash_prefs)
echo "plist before: ${before:-not hashed (not macOS)}" > "$OUT/SUMMARY.txt"

weekly_node_steps
hook_test_steps
for e in chromium webkit firefox; do browser_steps "$e"; done
step web-replay-page-test node web/test/replay.mjs --site build/.work/page-test
step check-observations node runtime/jshell/derive/check-observations.mjs runtime/jshell/DERIVATION.md

if [ "$(uname)" = Darwin ]; then
  after=$(hash_prefs)
  echo "plist after:  $after" >> "$OUT/SUMMARY.txt"
  if [ "$before" != "$after" ]; then
    FAILED+=("prefs plist changed during the run ($before before, $after after)")
    echo "FAILED: the prefs plist changed during the run" >&2
  fi
else
  echo "plist after:  not hashed (not macOS)" >> "$OUT/SUMMARY.txt"
fi
echo "git status: $(git status --short | wc -l | tr -d ' ') lines" >> "$OUT/SUMMARY.txt"
printf '%s\n' "${FAILED[@]}" | sed '/^$/d; s/^/FAILED: /' >> "$OUT/SUMMARY.txt"
echo DONE >> "$OUT/SUMMARY.txt"
cat "$OUT/SUMMARY.txt"
finish
