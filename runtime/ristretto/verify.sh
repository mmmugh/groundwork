#!/bin/sh
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

# Verify a scratchpad release directory against runtime/ristretto/CHECKSUMS, the way runtime/release/verify.sh
# verifies the boxes' runtime. 0 = all match, 1 = a file differs, 2 = something is missing: CHECKSUMS itself, its
# entry for a file every release must have, or a file it names, or its legal/ lines not being jdk.zip's legal/ files;
# or misuse. Every line CHECKSUMS has is checked.
set -eu
# SHA-256 of a file (shasum on a Mac, sha256sum on most Linux images): the same "<hash>  <name>" lines either way.
if command -v shasum >/dev/null 2>&1; then sha256() { shasum -a 256 "$@"; }
elif command -v sha256sum >/dev/null 2>&1; then sha256() { sha256sum "$@"; }
else echo "verify.sh: neither shasum nor sha256sum is on the PATH" >&2; exit 2; fi
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
  got=$(sha256 "$dir/$name" | cut -d' ' -f1)
  if [ "$got" != "$want" ]; then echo "DIFFERS: $name" >&2; [ "$status" -eq 2 ] || status=1; fi
done < "$sums"
# The legal/ lines of CHECKSUMS must be exactly the files under legal/ in jdk.zip (fetch-release.sh unpacks them from
# there), so a CHECKSUMS that drops a legal file, or a jdk.zip with one it does not list, is not a release (P3b-9).
# A missing jdk.zip is already reported above.
if [ -f "$dir/jdk.zip" ]; then
  command -v unzip >/dev/null 2>&1 || { echo "verify.sh: unzip is not on the PATH" >&2; exit 2; }
  listed=$(awk '$2 ~ /^legal\// { print $2 }' "$sums" | LC_ALL=C sort)
  # unzip's own diagnostic goes on to stderr: a damaged jdk.zip lists nothing, so every legal/ line fails below, after
  # unzip says why. A jdk.zip with nothing under legal/ is an empty match, not damage: unzip exits 11 saying "caution:
  # filename not matched", that line alone is dropped, and the list stays empty. (Its listing goes through fd 3.)
  inzip=$({ unzip -Z1 "$dir/jdk.zip" 'legal/*' 2>&1 >&3 3>&- | grep -v '^caution: filename not matched' >&2; } 3>&1 \
    | grep -v '/$' | LC_ALL=C sort || true)
  if [ "$listed" != "$inzip" ]; then
    printf '%s\n' "$inzip" | while read -r n; do
      [ -z "$n" ] || printf '%s\n' "$listed" | grep -qxF "$n" || echo "not in CHECKSUMS: $n (it is in jdk.zip)" >&2
    done
    printf '%s\n' "$listed" | while read -r n; do
      [ -z "$n" ] || printf '%s\n' "$inzip" | grep -qxF "$n" || echo "not in jdk.zip: $n (CHECKSUMS lists it)" >&2
    done
    status=2
  fi
fi
exit "$status"
