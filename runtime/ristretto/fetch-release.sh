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

# fetch-release.sh: a fresh clone's way to the scratchpad's published release. Downloads the 11 files of
# runtime/ristretto/CHECKSUMS that are not under legal/ from the release's base URL (curl follows GitHub's redirect to
# the asset's real host), checks each against CHECKSUMS, unpacks legal/ from the pinned jdk.zip (its files are the
# release's, byte for byte) and checks those, runs verify.sh over the lot, and only then makes <dest>/<name>/ and
# points <dest>/../current at it. The work happens in <dest>/.tmp-<name>/, removed on any failure, so a bad file or a
# half-made release is never left where the build looks. <name> is the last path segment of the base URL. A second
# run with <dest>/<name>/ already complete downloads nothing.
#
# usage: bash runtime/ristretto/fetch-release.sh [--dest <releases dir>] [--base <url>]
#   defaults: runtime/.work/ristretto/release/ and the URL on the one line of runtime/ristretto/release-url.txt
#   0 = the release is in place and current points at it, 1 = a download failed, a file differs, or <dest>/<name>/ is
#   there but not complete, 2 = misuse (an argument, no base URL, a missing tool)
set -euo pipefail
F="$(cd "$(dirname "$0")" && pwd)"     # runtime/ristretto/
usage() { echo "usage: bash runtime/ristretto/fetch-release.sh [--dest <releases dir>] [--base <url>]" >&2; exit 2; }
dest="$(cd "$F/.." && pwd)/.work/ristretto/release"
base=""
base_given=0
while [ $# -gt 0 ]; do
  case "$1" in
    --dest) [ $# -ge 2 ] || usage; dest=$2; shift 2 ;;
    --base) [ $# -ge 2 ] || usage; base=$2; base_given=1; shift 2 ;;
    *) usage ;;
  esac
done
# One helper, two tools: shasum on a Mac, sha256sum on most Linux images.
if command -v shasum >/dev/null 2>&1; then sha256() { shasum -a 256 "$1" | cut -d' ' -f1; }
elif command -v sha256sum >/dev/null 2>&1; then sha256() { sha256sum "$1" | cut -d' ' -f1; }
else echo "fetch-release.sh: neither shasum nor sha256sum is on the PATH" >&2; exit 2; fi
for tool in curl unzip; do
  command -v "$tool" >/dev/null 2>&1 || { echo "fetch-release.sh: $tool is not on the PATH" >&2; exit 2; }
done
if [ -z "$base" ] && [ "$base_given" -eq 0 ]; then
  [ -f "$F/release-url.txt" ] || { echo "fetch-release.sh: no --base, and $F/release-url.txt does not exist" >&2; exit 2; }
  base=$(head -n 1 "$F/release-url.txt" | tr -d '[:space:]')
fi
[ -n "$base" ] || { echo "fetch-release.sh: the base URL is empty" >&2; exit 2; }
case "$base" in */) ;; *) base="$base/" ;; esac
name=$(basename "$base")
[ -n "$name" ] && [ "$name" != "." ] && [ "$name" != "/" ] || { echo "fetch-release.sh: the base URL $base names no release" >&2; exit 2; }
sums="$F/CHECKSUMS"
[ -f "$sums" ] || { echo "fetch-release.sh: missing $sums" >&2; exit 2; }

mkdir -p "$dest"
dest="$(cd "$dest" && pwd)"
current="$(dirname "$dest")/current"
tmp="$dest/.tmp-$name"
point() { ln -sfn "$(basename "$dest")/$name" "$current"; echo "current -> $(basename "$dest")/$name"; }

if [ -e "$dest/$name" ]; then
  if sh "$F/verify.sh" "$dest/$name" >/dev/null 2>&1; then
    echo "$name is already complete in $dest; nothing to download"
    point
    exit 0
  fi
  echo "fetch-release.sh: $dest/$name exists but is not a complete release (sh $F/verify.sh $dest/$name says why); delete it to fetch it again" >&2
  exit 1
fi

rm -rf "$tmp"
mkdir -p "$tmp"
trap 'rm -rf "$tmp"' EXIT

# check <name>: the file in $tmp has the SHA-256 CHECKSUMS pins for it.
check() {
  local want got
  want=$(awk -v n="$1" '$2 == n { print $1 }' "$sums")
  [ -f "$tmp/$1" ] || { echo "fetch-release.sh: $1 is not there" >&2; exit 1; }
  got=$(sha256 "$tmp/$1")
  [ "$got" = "$want" ] || { echo "fetch-release.sh: $1 has SHA-256 $got but CHECKSUMS pins $want" >&2; exit 1; }
}

while read -r want file; do
  [ -n "$file" ] || continue
  case "$file" in legal/*) continue ;; esac
  curl -fsSL "$base$file" -o "$tmp/$file" || { echo "fetch-release.sh: could not download $file from $base$file" >&2; exit 1; }
  check "$file"
  echo "fetched $file"
done < "$sums"

(cd "$tmp" && unzip -q jdk.zip 'legal/*') || { echo "fetch-release.sh: could not unpack legal/ from jdk.zip" >&2; exit 1; }
while read -r want file; do
  case "$file" in legal/*) check "$file" ;; esac
done < "$sums"
echo "unpacked and checked legal/ from jdk.zip"

sh "$F/verify.sh" "$tmp" || { echo "fetch-release.sh: verify.sh refuses the downloaded release" >&2; exit 1; }
mv "$tmp" "$dest/$name"
point
