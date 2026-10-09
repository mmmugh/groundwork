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

# package-variant.sh: package the build made without patch 0009 (runtime/.work/variants/fork-no-0009/, written by
# build.sh --negatives) as the CI-only release that build/ForkGateTest.java's fork-no-0009 check fetches (W-14, D88).
# Writes runtime/.work/release/variant-fork-no-0009-<version>/: the variant's six runtime files and manifest.json,
# CHECKSUMS of those seven, the boxes' notices (runtime/legal/, which package.sh wrote for release <version>) and
# VARIANT.txt. Also writes the tracked runtime/variants/fork-no-0009/CHECKSUMS and release-url.txt, which
# `java build/Build.java --fetch-variant` checks a download against and finds it by.
#
# Refuses a variant this working tree did not build (its manifest must name this tree's patches minus 0009, each the
# very file now in runtime/patches/: runtime/test/negatives.mjs's rule) and a release <version> that is not the one
# runtime/CHECKSUMS and runtime/legal/ were written for. Does not rebuild anything.
#
# usage: bash package-variant.sh <version>      exit 0 = packaged, 1 = refused or the result failed its own check,
#                                               2 = misuse
set -euo pipefail
F="$(cd "$(dirname "$0")/.." && pwd)"   # runtime/
W="$F/.work"

[ "$#" -eq 1 ] && [ -n "$1" ] || { echo "usage: package-variant.sh <version>" >&2; exit 2; }
version="$1"
case "$version" in [0-9][0-9][0-9][0-9].[0-9][0-9].[0-9][0-9]-[0-9]*) ;; *) echo "package-variant.sh: <version> looks like 2026.10.06-1, not $version" >&2; exit 2 ;; esac

if command -v shasum >/dev/null 2>&1; then sha256() { shasum -a 256 "$@"; }
elif command -v sha256sum >/dev/null 2>&1; then sha256() { sha256sum "$@"; }
else echo "package-variant.sh: neither shasum nor sha256sum is on the PATH" >&2; exit 2; fi

variant="$W/variants/fork-no-0009"
release="$W/release/$version"
tag="variant-fork-no-0009-$version"
outdir="$W/release/$tag"
FILES="compile-classlib-teavm.bin compiler.wasm compiler.wasm-deobfuscator.wasm compiler.wasm-runtime.js compiler.wasm-runtime.mjs runtime-classlib-teavm.bin manifest.json"
LEGAL="NOTICE SOURCES.txt CHECKSUMS NOTICE-Rhino.txt NOTICE-Rhino-tools.txt LICENSE-Apache-2.0.txt LICENSE-GPLv2-CE.txt LICENSE-MPL-2.0-Rhino.txt LICENSE-BSD-3-Clause-ASM.txt LICENSE-BSD-3-Clause-ThreeTen.txt LICENSE-BSD-JZlib.txt LICENSE-Unicode.txt"

log() { printf '[package-variant %s] %s\n' "$(date +%H:%M:%S)" "$*"; }
refuse() { echo "package-variant.sh: refusing: $*" >&2; exit 1; }

# ---------------------------------------------------------------- 0. everything checked before anything is written
[ -d "$variant" ] || refuse "$variant is missing; run runtime/build.sh --negatives"
for f in $FILES; do [ -f "$variant/$f" ] || refuse "$variant/$f is missing; run runtime/build.sh --negatives"; done
[ -d "$release" ] || refuse "no boxes release $version at $release"
[ -f "$release/CHECKSUMS" ] && cmp -s "$release/CHECKSUMS" "$F/CHECKSUMS" \
  || refuse "release $version is not the release runtime/CHECKSUMS was written for"
for f in $LEGAL; do [ -f "$F/legal/$f" ] || refuse "runtime/legal/$f is missing; run runtime/release/package.sh"; done
cmp -s "$F/legal/CHECKSUMS" "$F/CHECKSUMS" || refuse "runtime/legal/CHECKSUMS is not runtime/CHECKSUMS"
for f in $LEGAL; do
  [ "$f" = CHECKSUMS ] && continue
  cmp -s "$F/legal/$f" "$release/$f" || refuse "runtime/legal/$f is not the one in release $version"
done
if ! python3 - "$F" <<'PY'
import hashlib, json, os, re, sys
F = sys.argv[1]
sha = lambda p: hashlib.sha256(open(p, "rb").read()).hexdigest()
try:
    m = json.load(open(os.path.join(F, ".work", "variants", "fork-no-0009", "manifest.json")))
except (OSError, ValueError) as e:
    sys.exit(f"  no readable manifest.json ({e})")
names = sorted(os.listdir(os.path.join(F, "patches")))
want = {n for n in names if n.endswith(".patch") and not n.startswith("teavm-0009-")}
problems = []
if m.get("variant") != "fork-no-0009":
    problems.append(f"manifest names variant {m.get('variant')!r}, not fork-no-0009")
built = m.get("patches_sha256")
if not isinstance(built, dict):
    problems.append("manifest has no patches_sha256")
else:
    have = {os.path.basename(p) for p in built}
    for n in sorted(want - have): problems.append(f"patches/{n} is in the tree but was not applied to this build")
    for n in sorted(have - want): problems.append(f"patches/{n} was applied to this build but is not in the tree, or is 0009")
    for p, h in sorted(built.items()):
        path = os.path.join(F, p)
        if os.path.isfile(path) and sha(path) != h: problems.append(f"{p} differs from the one this build applied")
ids = lambda pat: [g.group(1) for g in (re.match(pat, n) for n in sorted(want)) if g]
if m.get("teavm_patches") != ids(r"teavm-(0\d{3})-.*\.patch$") or m.get("teavm_javac_patches") != ids(r"teavm-javac-(01\d{2})-.*\.patch$"):
    problems.append("manifest's patch list is not this tree's series without 0009")
for p in problems: print("  " + p, file=sys.stderr)
sys.exit(1 if problems else 0)
PY
then
  refuse "the variant was not built from this working tree; run runtime/build.sh --negatives"
fi
log "the variant was built from this tree (its manifest names every patch but 0009, each as it is now); release $version is the boxes' release"

# ---------------------------------------------------------------- 1. the seven files, CHECKSUMS, the notices
rm -rf "$outdir"
mkdir -p "$outdir"
for f in $FILES; do cp "$variant/$f" "$outdir/$f"; done
for f in $LEGAL; do cp "$F/legal/$f" "$outdir/$f"; done
# The boxes' CHECKSUMS fixed the six files of the full build; here CHECKSUMS fixes the variant's seven (bare names, sorted).
( cd "$outdir" && sha256 $FILES | LC_ALL=C sort -k2,2 ) > "$outdir/CHECKSUMS"

# ---------------------------------------------------------------- 2. VARIANT.txt
cat > "$outdir/VARIANT.txt" <<EOT
Groundwork course runtime, CI-only variant fork-no-0009 of release $version

These files are release $version of the course runtime (see NOTICE) built without
runtime/patches/teavm-0009-*.patch. They are not shipped to readers: the course's own checks fetch them to prove that
the one patch matters (build/ForkGateTest.java), and nothing else uses them. CHECKSUMS fixes the exact bytes of the
seven files here (the six runtime files and manifest.json, which names the patches this build applied) and so
replaces the boxes' CHECKSUMS; every other notice is the boxes' own, unchanged.

Corresponding source: source.tar.gz in the runtime-$version release on the same project page
(https://github.com/mmmugh/groundwork/releases/tag/runtime-$version) holds it, with that one patch left out,
as runtime/build.sh --negatives builds it. The written offer in SOURCES.txt applies to these files too.
EOT

# ---------------------------------------------------------------- 3. the result's own check
bad=0
for f in $LEGAL VARIANT.txt $FILES; do [ -f "$outdir/$f" ] || { echo "package-variant.sh: $outdir lacks $f" >&2; bad=1; }; done
[ "$(wc -l < "$outdir/CHECKSUMS" | tr -d ' ')" -eq 7 ] || { echo "package-variant.sh: CHECKSUMS does not list exactly seven files" >&2; bad=1; }
( cd "$outdir" && sha256 -c CHECKSUMS > /dev/null 2>&1 ) || { echo "package-variant.sh: the files here do not match CHECKSUMS" >&2; bad=1; }
[ "$bad" -eq 0 ] || exit 1

# ---------------------------------------------------------------- 4. the tracked pins
mkdir -p "$F/variants/fork-no-0009"
cp "$outdir/CHECKSUMS" "$F/variants/fork-no-0009/CHECKSUMS"
printf 'https://github.com/mmmugh/groundwork/releases/download/%s/\n' "$tag" > "$F/variants/fork-no-0009/release-url.txt"
log "variant packaged at $outdir; wrote runtime/variants/fork-no-0009/{CHECKSUMS,release-url.txt}"
