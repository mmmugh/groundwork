#!/bin/bash
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

# fetch.sh: download Ristretto's five pinned files into runtime/.work/ristretto/v<version>/ under their published
# names, and verify each against CHECKSUMS (our SHA-256) and pins.env (the git blob SHA-1 upstream's deploy commit
# records for it). Downloads only what is missing; a file already there with other bytes is never overwritten.
# Tries the live site first, then the deploy commit's raw files (upstream force-replaces the site at every deploy,
# so either may be gone; the pinned bytes are then only in our own release).
#
# usage: bash runtime/ristretto/fetch.sh    0 = all five verified, 1 = a download failed or a file differs,
#                                           2 = misuse (an argument, or CHECKSUMS lacks one of the five)
set -euo pipefail
# SHA-256 of a file (shasum on a Mac, sha256sum on most Linux images): the same "<hash>  <name>" lines either way.
if command -v shasum >/dev/null 2>&1; then sha256() { shasum -a 256 "$@"; }
elif command -v sha256sum >/dev/null 2>&1; then sha256() { sha256sum "$@"; }
else echo "fetch.sh: neither shasum nor sha256sum is on the PATH" >&2; exit 2; fi
F="$(cd "$(dirname "$0")" && pwd)"     # runtime/ristretto/
W="$(cd "$F/.." && pwd)/.work/ristretto"
[ $# -eq 0 ] || { echo "usage: bash runtime/ristretto/fetch.sh" >&2; exit 2; }
source "$F/pins.env"
out="$W/v$RISTRETTO_VERSION"
mkdir -p "$out"
status=0
while read -r name path blob; do
  [ -n "$name" ] || continue
  want=$(awk -v n="$name" '$2 == n { print $1 }' "$F/CHECKSUMS")
  [ -n "$want" ] || { echo "fetch.sh: CHECKSUMS does not list $name" >&2; exit 2; }
  f="$out/$name"
  if [ ! -f "$f" ]; then
    if ! curl -fsL "$RISTRETTO_SITE$path" -o "$f.part" && ! curl -fsSL "$RISTRETTO_DEPLOY_RAW$path" -o "$f.part"; then
      rm -f "$f.part"; echo "fetch.sh: could not download $path from the site or the deploy commit" >&2; status=1; continue
    fi
    got=$(sha256 "$f.part" | cut -d' ' -f1)
    if [ "$got" != "$want" ]; then
      rm -f "$f.part"; echo "fetch.sh: $path downloaded with other bytes than CHECKSUMS pins for $name (got $got)" >&2; status=1; continue
    fi
    mv "$f.part" "$f"
  fi
  got=$(sha256 "$f" | cut -d' ' -f1)
  if [ "$got" != "$want" ]; then
    echo "fetch.sh: $f differs from CHECKSUMS; not overwritten (delete it to download it again)" >&2; status=1; continue
  fi
  got=$(git hash-object --no-filters "$f")
  if [ "$got" != "$blob" ]; then
    echo "fetch.sh: $name is not the blob $blob upstream's deploy commit records (got $got)" >&2; status=1; continue
  fi
  echo "verified $name"
done <<< "$RISTRETTO_FILES"
exit "$status"
