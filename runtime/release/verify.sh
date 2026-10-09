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

# Verify a runtime directory against runtime/CHECKSUMS. 0 = all match, 1 = a file differs, 2 = something
# is missing: CHECKSUMS itself, its entry for one of the six runtime files, or a file it names.
set -eu
# SHA-256 of a file (shasum on a Mac, sha256sum on most Linux images): the same "<hash>  <name>" lines either way.
if command -v shasum >/dev/null 2>&1; then sha256() { shasum -a 256 "$@"; }
elif command -v sha256sum >/dev/null 2>&1; then sha256() { sha256sum "$@"; }
else echo "verify.sh: neither shasum nor sha256sum is on the PATH" >&2; exit 2; fi
dir="${1:?usage: verify.sh <dir>}"
sums="$(dirname "$0")/../CHECKSUMS"
# set -e does not fire when the redirection on a `while ... done < file` compound command fails
# (observed on bash 3.2, both as /bin/bash and as macOS's /bin/sh), so a missing CHECKSUMS would
# otherwise fall through the empty loop and exit 0. Check for it explicitly instead.
[ -f "$sums" ] || { echo "missing: $sums" >&2; exit 2; }
status=0
# CHECKSUMS must name all six runtime files: an empty or truncated one, or one that leaves a file out,
# would otherwise pass for want of anything to compare. A name it leaves out counts as missing.
for f in compile-classlib-teavm.bin compiler.wasm compiler.wasm-deobfuscator.wasm compiler.wasm-runtime.js \
    compiler.wasm-runtime.mjs runtime-classlib-teavm.bin; do
  awk -v f="$f" '$2 == f { found = 1 } END { exit !found }' "$sums" || { echo "not in CHECKSUMS: $f" >&2; status=2; }
done
# `|| [ -n "$want" ]`: read returns non-zero on a last line with no newline, which must be checked too.
while read -r want name || [ -n "$want" ]; do
  [ -n "$name" ] || continue
  # Missing always outranks differing, regardless of which name sorts first in CHECKSUMS. Set status
  # unconditionally here (not only from status=0): a "differs" seen earlier in sort order must not
  # block a later "missing" from winning.
  if [ ! -f "$dir/$name" ]; then echo "missing: $name" >&2; status=2; continue; fi
  got=$(sha256 "$dir/$name" | cut -d' ' -f1)
  if [ "$got" != "$want" ]; then echo "DIFFERS: $name" >&2; [ "$status" -eq 2 ] || status=1; fi
done < "$sums"
exit "$status"
