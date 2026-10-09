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

# package.sh: build a checksummed release directory from an existing runtime/dist/fork build.
#
# Does not rebuild anything (run build.sh first), and refuses a dist/fork this working tree did not
# build: dist/fork/manifest.json must name the pinned commits, the SHA-256 of every patch in
# runtime/patches/ and of the build's own inputs (pins.env, build.sh, overlay/build-overlay.sh,
# gradle/verification-metadata.xml) exactly as they are now, and the six runtime files' own hashes. So the
# source this release ships is the source its bytes were built from. Writes runtime/.work/release/<version>/
# holding the six runtime files, CHECKSUMS, the license texts and notices of everything compiled into
# them, NOTICE, SOURCES.txt and the corresponding source archive (source.tar.gz); also writes the tracked
# runtime/CHECKSUMS so Plan 2's Build.java and verify.sh have something to check a fetched release
# against. Every file it fetches is checked against RELEASE_INPUTS_SHA256 in pins.env.
#
# usage: bash package.sh <version>
set -euo pipefail
F="$(cd "$(dirname "$0")/.." && pwd)"   # runtime/
ROOT="$(cd "$F/.." && pwd)"             # repo root
W="$F/.work"

source "$F/pins.env"

version="${1:?usage: package.sh <version>}"
outdir="$W/release/$version"
FILES="compile-classlib-teavm.bin compiler.wasm compiler.wasm-deobfuscator.wasm compiler.wasm-runtime.js compiler.wasm-runtime.mjs runtime-classlib-teavm.bin"
TEAVM_SRC="$W/build/src/teavm"
JAVAC_SRC="$W/build/src/teavm-javac"

log() { printf '[package %s] %s\n' "$(date +%H:%M:%S)" "$*"; }

# ---------------------------------------------------------------- 0. dist/fork is this tree's build
# Checked before anything is written, the tracked runtime/CHECKSUMS included.
if ! python3 - "$F" "$TEAVM_COMMIT" "$JAVAC_COMMIT" $FILES <<'PY'
import glob, hashlib, json, os, sys
F, teavm_commit, javac_commit, files = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4:]
sha = lambda p: hashlib.sha256(open(p, "rb").read()).hexdigest()
dist = os.path.join(F, "dist", "fork")
problems = []
try:
    m = json.load(open(os.path.join(dist, "manifest.json")))
except (OSError, ValueError) as e:
    sys.exit(f"  no readable dist/fork/manifest.json ({e})")
if m.get("variant") != "fork":
    problems.append(f"manifest names variant {m.get('variant')!r}, not fork")
if m.get("teavm_commit") != teavm_commit or m.get("teavm_javac_commit") != javac_commit:
    problems.append(f"manifest names commits {m.get('teavm_commit')} / {m.get('teavm_javac_commit')}, "
                    f"pins.env pins {teavm_commit} / {javac_commit}")
for f in files:
    p = os.path.join(dist, f)
    if not os.path.isfile(p):
        problems.append(f"dist/fork/{f} is missing")
    elif m.get("files", {}).get(f, {}).get("sha256") != sha(p):
        problems.append(f"dist/fork/{f} is not the file its manifest names (replaced after the build?)")
have = {os.path.relpath(p, F): sha(p) for p in sorted(glob.glob(os.path.join(F, "patches", "*.patch")))}
built = m.get("patches_sha256")
if not isinstance(built, dict):
    problems.append("manifest has no patches_sha256 (built before build.sh recorded them)")
else:
    for p in sorted(set(have) | set(built)):
        if p not in built: problems.append(f"{p} is in the tree but was not applied to this build")
        elif p not in have: problems.append(f"{p} was applied to this build but is not in the tree")
        elif have[p] != built[p]: problems.append(f"{p} differs from the one this build applied")
inputs = m.get("build_inputs_sha256")
if not isinstance(inputs, dict) or not inputs:
    problems.append("manifest has no build_inputs_sha256 (built before build.sh recorded them)")
else:
    for p, want in sorted(inputs.items()):
        path = os.path.join(F, p)
        if not os.path.isfile(path): problems.append(f"{p}, a build input, is missing")
        elif sha(path) != want: problems.append(f"{p} differs from the one this build used")
for p in problems:
    print("  " + p, file=sys.stderr)
sys.exit(1 if problems else 0)
PY
then
  echo "package.sh: refusing: dist/fork was not built from this working tree; run build.sh, then package" >&2
  exit 1
fi
log "dist/fork was built from this tree: its manifest matches every patch, pin and build input"

# A file package.sh fetches: the checked local copy (downloaded once into .work/release-inputs/,
# checked against its pin on every run).
fetch_pinned() { # $1 = url
  local url=$1 want f got
  want=$(printf '%s\n' "$RELEASE_INPUTS_SHA256" | awk -v u="$url" '$2 == u { print $1 }')
  [ -n "$want" ] || { echo "package.sh: $url is not pinned in pins.env (RELEASE_INPUTS_SHA256)" >&2; exit 1; }
  f="$W/release-inputs/$want-$(basename "$url")"
  if [ ! -f "$f" ]; then
    mkdir -p "$W/release-inputs"
    curl -fsSL "$url" -o "$f.part"
    mv "$f.part" "$f"
  fi
  got=$(shasum -a 256 "$f" | cut -d' ' -f1)
  [ "$got" = "$want" ] || { rm -f "$f"; echo "package.sh: checksum MISMATCH for $url (pin $want, file $got)" >&2; exit 1; }
  printf '%s\n' "$f"
}
# A published jar build.sh already checked (OVERLAY_INPUTS_SHA256): its copy in the Gradle cache.
cached_input() { # $1 = its path as OVERLAY_INPUTS_SHA256 names it
  local key=$1 want f
  want=$(printf '%s\n' "$OVERLAY_INPUTS_SHA256" | awk -v k="$key" '$2 == k { print $1 }')
  [ -n "$want" ] || { echo "package.sh: $key is not pinned in pins.env (OVERLAY_INPUTS_SHA256)" >&2; exit 1; }
  for f in "$W/gradle-home/caches/modules-2/files-2.1/$(dirname "$key")"/*/"$(basename "$key")"; do
    if [ -f "$f" ] && [ "$(shasum -a 256 "$f" | cut -d' ' -f1)" = "$want" ]; then printf '%s\n' "$f"; return; fi
  done
  echo "package.sh: no copy of $key matching its pin in the Gradle cache; run build.sh" >&2; exit 1
}
# The license comment of a source file (stdin) that contains $1, comment markers removed, text otherwise
# as the file has it.
license_comment() {
  python3 -c '
import re, sys
marker, text = sys.argv[1], sys.stdin.read()
lines = text.split("\n")
blocks, i = [], 0
while i < len(lines):
    if lines[i].lstrip().startswith("//"):
        j = i
        while j < len(lines) and lines[j].lstrip().startswith("//"): j += 1
        blocks.append([re.sub(r"^\s*// ?", "", l) for l in lines[i:j]]); i = j
    elif lines[i].lstrip().startswith("/*") and "*/" not in lines[i]:
        j = i + 1
        while "*/" not in lines[j]: j += 1
        blocks.append([re.sub(r"^ ?\*(?: |$)", "", l) for l in lines[i + 1:j]]); i = j + 1
    else:
        i += 1
block = next((b for b in blocks if marker in "\n".join(b)), None)
if block is None: sys.exit("no license comment containing " + repr(marker))
while block and not block[0].strip(): block.pop(0)
while block and not block[-1].strip(): block.pop()
indent = min(len(l) - len(l.lstrip(" ")) for l in block if l.strip())
print("\n".join(l[indent:] for l in block))
' "$1"
}

# Every input fetched and checked before anything is written, so a failed check leaves nothing half done.
RHINO_SOURCES=$(fetch_pinned https://repo1.maven.org/maven2/org/mozilla/rhino/1.7.15/rhino-1.7.15-sources.jar)
GPL_LICENSE=$(fetch_pinned "https://raw.githubusercontent.com/openjdk/jdk25u/$JDK25U_REVISION/LICENSE")
ASM_SOURCES=$(fetch_pinned https://repo1.maven.org/maven2/org/ow2/asm/asm/9.8/asm-9.8-sources.jar)
JZLIB_SOURCES=$(fetch_pinned https://repo1.maven.org/maven2/com/jcraft/jzlib/1.1.3/jzlib-1.1.3-sources.jar)
UNICODE_LICENSE=$(fetch_pinned https://raw.githubusercontent.com/unicode-org/cldr-json/37.0.0/LICENSE)
COMMONS_IO=$(cached_input org.teavm/teavm-relocated-libs-commons-io/0.13.1/teavm-relocated-libs-commons-io-0.13.1.jar)
jdk_zip="$JAVAC_SRC/javac/build/jdk-$JDK25U_REVISION.zip"
[ -f "$jdk_zip" ] || { echo "missing $jdk_zip—run build.sh first (it downloads jdk25u source to build javac)" >&2; exit 1; }
jdk_zip_sha=$(shasum -a 256 "$jdk_zip" | cut -d' ' -f1)
[ "$jdk_zip_sha" = "$JDK25U_ZIP_SHA256" ] || { echo "jdk25u source zip does not match its pin" >&2; exit 1; }
log "every fetched input, and the jdk25u source zip, matches its pin"
# fdlibm's notice, as teavm-0015 puts it into TStrictMath.java: the lines between its two "====" lines.
# It must be e_log.c's six lines exactly, so a notice that lost a line or its closing "====" (which would
# pull the ported code in after it) stops the release instead of reaching NOTICE.
FDLIBM_NOTICE=$(awk '/^\+ +\* =+$/{n++; next} n==1{sub(/^\+ +\* ?/, ""); print}' "$F/patches/teavm-0015-strictmath-fdlibm.patch")
FDLIBM_NOTICE_EXPECTED='Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.

Developed at SunSoft, a Sun Microsystems, Inc. business.
Permission to use, copy, modify, and distribute this
software is freely granted, provided that this notice
is preserved.'
[ "$FDLIBM_NOTICE" = "$FDLIBM_NOTICE_EXPECTED" ] \
  || { echo "package.sh: the fdlibm notice in patches/teavm-0015-strictmath-fdlibm.patch is not e_log.c's six lines, verbatim" >&2; exit 1; }

rm -rf "$outdir"
mkdir -p "$outdir"

# ---------------------------------------------------------------- 1. the six runtime files
for f in $FILES; do cp "$F/dist/fork/$f" "$outdir/$f"; done
log "copied six runtime files from dist/fork"

# ---------------------------------------------------------------- 2. CHECKSUMS (bare names, sorted)
( cd "$outdir" && shasum -a 256 $FILES | LC_ALL=C sort -k2,2 ) > "$outdir/CHECKSUMS"
cp "$outdir/CHECKSUMS" "$F/CHECKSUMS"
log "wrote CHECKSUMS (release and tracked runtime/CHECKSUMS)"

# ---------------------------------------------------------------- 3. license texts and notices
# What is compiled into the six files, and so what these cover, is set out in NOTICE (section 6 below).
cp "$ROOT/LICENSE" "$outdir/LICENSE-Apache-2.0.txt"
cp "$GPL_LICENSE" "$outdir/LICENSE-GPLv2-CE.txt"
unzip -p "$RHINO_SOURCES" META-INF/LICENSE.txt > "$outdir/LICENSE-MPL-2.0-Rhino.txt"
unzip -p "$RHINO_SOURCES" META-INF/NOTICE.txt > "$outdir/NOTICE-Rhino.txt"
unzip -p "$RHINO_SOURCES" META-INF/NOTICE-tools.txt > "$outdir/NOTICE-Rhino-tools.txt"
unzip -p "$ASM_SOURCES" org/objectweb/asm/ClassReader.java | license_comment "INRIA, France Telecom" > "$outdir/LICENSE-BSD-3-Clause-ASM.txt"
git -C "$TEAVM_SRC" show "$TEAVM_COMMIT:classlib/src/main/java/org/threeten/bp/Instant.java" \
  | license_comment "Stephen Colebourne & Michael Nascimento Santos" > "$outdir/LICENSE-BSD-3-Clause-ThreeTen.txt"
unzip -p "$JZLIB_SOURCES" com/jcraft/jzlib/JZlib.java | license_comment "ymnk, JCraft" > "$outdir/LICENSE-BSD-JZlib.txt"
cp "$UNICODE_LICENSE" "$outdir/LICENSE-Unicode.txt"
log "wrote the license texts and notices"

# ---------------------------------------------------------------- 4. source.tar.gz
# Staged, then archived member by member in sorted order with owner 0/0, no user or group names, one
# fixed mtime and no gzip timestamp, so the archive carries nothing of the machine that packaged it.
tmp="$W/release/.tmp-source-$version"
rm -rf "$tmp"
mkdir -p "$tmp/src/patches" "$tmp/src/overlay" "$tmp/src/gradle"
cp "$F"/patches/*.patch "$tmp/src/patches/"
cp "$F/overlay/build-overlay.sh" "$tmp/src/overlay/"
cp "$F/gradle/verification-metadata.xml" "$tmp/src/gradle/"
cp "$F/build.sh" "$F/pins.env" "$tmp/src/"
log "archiving pinned TeaVM commit $TEAVM_COMMIT (git archive, not the patched working tree)"
git -C "$TEAVM_SRC" archive --format=tar --prefix="teavm-$TEAVM_COMMIT/" "$TEAVM_COMMIT" \
  -o "$tmp/src/teavm-$TEAVM_COMMIT.tar"
log "archiving pinned teavm-javac commit $JAVAC_COMMIT (git archive, not the patched working tree)"
git -C "$JAVAC_SRC" archive --format=tar --prefix="teavm-javac-$JAVAC_COMMIT/" "$JAVAC_COMMIT" \
  -o "$tmp/src/teavm-javac-$JAVAC_COMMIT.tar"
cp -c "$jdk_zip" "$tmp/src/" 2> /dev/null || cp "$jdk_zip" "$tmp/src/"
cp "$RHINO_SOURCES" "$tmp/src/rhino-1.7.15-sources.jar"
find "$tmp/src" -exec env TZ=UTC touch -h -t 202601010000.00 {} +
log "writing source.tar.gz (patches, overlay, build.sh, pins.env, Gradle's verification metadata, both commit archives, the jdk25u source zip, Rhino's sources jar)"
( cd "$tmp/src" && find . -mindepth 1 | sed 's#^\./##' | LC_ALL=C sort ) \
  | tar -c -z -n -f "$outdir/source.tar.gz" -C "$tmp/src" --uid 0 --gid 0 --numeric-owner \
      --options gzip:!timestamp -T -
rm -rf "$tmp"
log "source.tar.gz is $(du -h "$outdir/source.tar.gz" | cut -f1)"

# ---------------------------------------------------------------- 5. SOURCES.txt
python3 - "$F/dist/fork/manifest.json" > "$outdir/SOURCES.txt.provenance" <<'PY'
import json, sys
m = json.load(open(sys.argv[1]))
print("What the six runtime files were built from (dist/fork/manifest.json, checked against this source):")
print(f"  teavm commit:       {m['teavm_commit']}, patches {' '.join(m['teavm_patches'])}")
print(f"  teavm-javac commit: {m['teavm_javac_commit']}, patches {' '.join(m['teavm_javac_patches'])}")
print("  SHA-256 of each patch applied (runtime/patches/ in source.tar.gz):")
for p, s in sorted(m["patches_sha256"].items()): print(f"    {s}  {p}")
print("  SHA-256 of the build's own inputs (in source.tar.gz):")
for p, s in sorted(m["build_inputs_sha256"].items()): print(f"    {s}  {p}")
PY
{
  echo "Pinned sources for runtime release $version."
  echo "No source here was modified from what these commits/revisions name; runtime/patches/ (in"
  echo "source.tar.gz) is applied on top at build time, not baked into any of the archives below."
  echo
  echo "TeaVM"
  echo "  repo:   https://github.com/konsoletyper/teavm"
  echo "  tag:    $TEAVM_TAG"
  echo "  commit: $TEAVM_COMMIT"
  echo
  echo "teavm-javac"
  echo "  repo:   https://github.com/konsoletyper/teavm-javac"
  echo "  commit: $JAVAC_COMMIT"
  echo
  echo "OpenJDK jdk25u (javac, compiled into compiler.wasm; revision pinned inside teavm-javac's"
  echo "gradle.properties, and inside this repo's pins.env)"
  echo "  revision:   $JDK25U_REVISION"
  echo "  source zip: https://github.com/openjdk/jdk25u/archive/$JDK25U_REVISION.zip"
  echo "  sha256:     $jdk_zip_sha  $(basename "$jdk_zip")"
  echo
  echo "Mozilla Rhino 1.7.15 (MPL-2.0; TeaVM compiles it into compiler.wasm with its packages renamed from"
  echo "org.mozilla to org.teavm.rhino, which TeaVM's settings.gradle.kts and build-logic, in the TeaVM"
  echo "archive, do)"
  echo "  source jar: https://repo1.maven.org/maven2/org/mozilla/rhino/1.7.15/rhino-1.7.15-sources.jar"
  echo "  sha256:     $(shasum -a 256 "$RHINO_SOURCES" | cut -d' ' -f1)  rhino-1.7.15-sources.jar"
  echo
  echo "Written offer (GPLv2, section 3(b)). For at least three years after you received these files from us, and"
  echo "for as long as we distribute them, anyone may have a complete machine-readable copy of the corresponding"
  echo "source code of the GPL-licensed parts of these files (OpenJDK jdk25u, above), under the terms of the GPLv2,"
  echo "at no charge beyond the cost of physically performing the distribution, by download or on a medium"
  echo "customarily used for software interchange: ask at https://github.com/mmmugh/groundwork/issues. The same"
  echo "source is in source.tar.gz, beside these files in each GitHub release of this runtime at"
  echo "https://github.com/mmmugh/groundwork/releases, and inside the course's site zip whenever one is published."
  echo
  cat "$outdir/SOURCES.txt.provenance"
} > "$outdir/SOURCES.txt"
rm "$outdir/SOURCES.txt.provenance"
log "wrote SOURCES.txt"

# ---------------------------------------------------------------- 6. NOTICE
{
cat <<EOF
Groundwork course runtime—release $version

This release is a WebAssembly build of a patched teavm-javac (TeaVM's javac-on-the-web fork). Its six
runtime files (compile-classlib-teavm.bin, compiler.wasm, compiler.wasm-deobfuscator.wasm,
compiler.wasm-runtime.js, compiler.wasm-runtime.mjs, runtime-classlib-teavm.bin) are compiled from the
works listed below, which come under several licenses; each work's license applies to what is compiled
from it. CHECKSUMS fixes the files' exact bytes. SOURCES.txt and source.tar.gz give the corresponding
source: source.tar.gz, beside these files in each GitHub release of this runtime at
https://github.com/mmmugh/groundwork/releases, and inside the course's site zip whenever one is published.

What each file holds: compiler.wasm is javac and TeaVM, compiled together (TeaVM compiles a program's
classes to WebAssembly in the browser); runtime-classlib-teavm.bin is the class library a compiled
program is linked with (TeaVM's, with the data it reads); compile-classlib-teavm.bin is the class
library javac compiles against, converted from TeaVM's; the deobfuscator and the two runtime scripts are
TeaVM's. The list below was derived from TeaVM's and teavm-javac's build files at the pinned commits
(their dependencies, TeaVM's package relocations, and the rules that copy classes into the two classlib
files), and checked against the class and resource names the built files contain.

1. Apache License, Version 2.0 (LICENSE-Apache-2.0.txt)
   - TeaVM: https://github.com/konsoletyper/teavm, tag $TEAVM_TAG,
     commit $TEAVM_COMMIT; in all six files. Its NOTICE file is
     reproduced verbatim in section 7. Its class library includes code from Apache Harmony (The Apache
     Software Foundation) and, in its time-zone support, code from Joda-Time (Joda.org), both
     Apache-2.0, which that NOTICE credits.
   - teavm-javac: https://github.com/konsoletyper/teavm-javac,
     commit $JAVAC_COMMIT; in compiler.wasm and the compile classlib. The
     repository ships no LICENSE file; its README's "License" section is the only license grant it
     makes, and is reproduced verbatim in section 7.
   - HPPC 0.10.0 (com.carrotsearch:hppc), which TeaVM bundles with its packages renamed to
     org.teavm.hppc; in compiler.wasm. Its jar carries no NOTICE file.
   - Apache Commons IO 2.20.0 (commons-io:commons-io), which TeaVM bundles renamed to
     org.teavm.apachecommons; it is on the classpath compiler.wasm is compiled from (teavm-tooling
     depends on it), though no class name of it was found in compiler.wasm. Its NOTICE is reproduced
     verbatim in section 7.
   - This project's patches (runtime/patches/) and build scripts (runtime/build.sh, runtime/release/,
     runtime/overlay/build-overlay.sh): Apache License, Version 2.0, per each file's own header.

2. GNU General Public License, version 2, with the Classpath Exception (LICENSE-GPLv2-CE.txt)
   - OpenJDK jdk25u, https://github.com/openjdk/jdk25u,
     revision $JDK25U_REVISION. teavm-javac compiles javac from it (the source
     directories its javac/build.gradle names) into compiler.wasm.
     Corresponding source is the source zip in source.tar.gz (see SOURCES.txt for its URL and SHA-256);
     it is included unopened, exactly as teavm-javac's build downloaded it.

3. Mozilla Public License, version 2.0 (LICENSE-MPL-2.0-Rhino.txt, Rhino's own LICENSE.txt)
   - Mozilla Rhino 1.7.15 (org.mozilla:rhino), which TeaVM bundles with its packages renamed to
     org.teavm.rhino; in compiler.wasm. Its Source Code Form is rhino-1.7.15-sources.jar in
     source.tar.gz, the published sources of that release (SOURCES.txt gives its URL and SHA-256);
     the renaming is done on compiled classes by TeaVM's build, which is in the TeaVM archive there.
     Rhino's own notices ship verbatim as NOTICE-Rhino.txt and NOTICE-Rhino-tools.txt; they carry the
     BSD-style licenses of code Rhino includes from the V8 project and from Sun Microsystems.

4. BSD 3-Clause and BSD-style licenses (each notice ships verbatim, its comment markers removed)
   - OW2 ASM 9.8 (org.ow2.asm), in compiler.wasm twice: bundled by TeaVM renamed to org.teavm.asm (asm,
     asm-tree, asm-analysis, asm-commons, asm-util), and as teavm-javac's own dependency under its own
     name (org.objectweb.asm, asm alone). LICENSE-BSD-3-Clause-ASM.txt, from ClassReader.java in
     asm-9.8-sources.jar.
   - ThreeTen backport code (org.threeten.bp), which TeaVM's class library uses as java.time; in the
     runtime classlib, and converted into java.time's classes in the compile classlib.
     LICENSE-BSD-3-Clause-ThreeTen.txt, from TeaVM's classlib/src/main/java/org/threeten/bp/Instant.java
     at the pinned commit.
   - JZlib 1.1.3 (com.jcraft:jzlib), in compiler.wasm and the runtime classlib. LICENSE-BSD-JZlib.txt,
     from JZlib.java in jzlib-1.1.3-sources.jar.

5. Unicode data (LICENSE-Unicode.txt)
   - CLDR 37 JSON data (the English and supplemental parts) and UnicodeData.txt, from TeaVM's class
     library, in the runtime classlib. LICENSE-Unicode.txt is Unicode's data-files license as
     unicode-org/cldr-json ships it at tag 37.0.0, the CLDR version the data names. Part of TeaVM's
     regular-expression code carries a Unicode, Inc. notice of its own, reproduced verbatim in section 7.
   - Time-zone data, compiled by TeaVM from the IANA tz database 2025b (tzdata2025b.zip in TeaVM's
     source), in the runtime classlib. Its LICENSE file says: "Unless specified below, all files in the
     tz code and data (including this LICENSE file) are in the public domain."

6. fdlibm's notice (use, copy, modify and distribute freely, provided the notice is preserved)
   - fdlibm (Freely Distributable LIBM, developed at Sun Microsystems), https://www.netlib.org/fdlibm/:
     patch runtime/patches/teavm-0015-strictmath-fdlibm.patch ports its __ieee754_log (e_log.c, version
     "1.3 95/01/18", fdlibm 5.3) to Java as java.lang.StrictMath.log in TeaVM's class library, which
     java.lang.Math.log calls too, so in the runtime classlib. The port carries e_log.c's notice, which is
     reproduced verbatim in section 7.

Patch runtime/patches/teavm-0014-random.patch gives java.util.Random's default (no-argument) seed a
mixer function that follows SplitMix64, a public-domain algorithm (its reference header states public
domain); this is noted here as the mixer's provenance, not as a separate license obligation, since
SplitMix64 carries none. See the patch's own header for detail and its relationship to JDK fidelity.

This NOTICE, SOURCES.txt and CHECKSUMS are themselves licensed Apache License, Version 2.0, as part
of this project's own scripts and documentation.

7. Notices reproduced verbatim

---- TeaVM's NOTICE (NOTICE in github.com/konsoletyper/teavm at commit $TEAVM_COMMIT) ----
EOF
git -C "$TEAVM_SRC" show "$TEAVM_COMMIT:NOTICE"
echo   # TeaVM's NOTICE ends without a newline
echo
echo "---- teavm-javac's README, its \"License\" section (README.md at commit $JAVAC_COMMIT) ----"
git -C "$JAVAC_SRC" show "$JAVAC_COMMIT:README.md" | sed -n '/^## License$/,$p'
echo   # the README ends without a newline
echo
echo "---- Apache Commons IO's NOTICE (META-INF/NOTICE.txt in teavm-relocated-libs-commons-io-0.13.1.jar) ----"
unzip -p "$COMMONS_IO" META-INF/NOTICE.txt
echo
echo "---- The Unicode, Inc. notice in TeaVM's regular-expression code (classlib/src/main/java/org/teavm/"
echo "     classlib/java/util/regex/TSupplCharSet.java and seven other files there, at commit $TEAVM_COMMIT) ----"
git -C "$TEAVM_SRC" show "$TEAVM_COMMIT:classlib/src/main/java/org/teavm/classlib/java/util/regex/TSupplCharSet.java" \
  | license_comment "Portions, Copyright"
echo
echo "---- fdlibm's notice (e_log.c, https://www.netlib.org/fdlibm/e_log.c, as runtime/patches/"
echo "     teavm-0015-strictmath-fdlibm.patch keeps it in TeaVM's TStrictMath.java) ----"
echo "$FDLIBM_NOTICE"
} > "$outdir/NOTICE"
log "wrote NOTICE"

log "release $version packaged at $outdir"

# ---------------------------------------------------------------- 7. runtime/legal/, the tracked copy
# The build publishes these beside the six files (build/RuntimeFiles.java), from a release or from dist/fork,
# which has none (D53). CHECKSUMS rides along so the build can tell the copy was written for the bytes
# runtime/CHECKSUMS pins.
rm -rf "$F/legal"
mkdir -p "$F/legal"
( cd "$outdir" && cp NOTICE NOTICE-*.txt LICENSE-*.txt SOURCES.txt CHECKSUMS "$F/legal/" )
log "wrote runtime/legal/ (the notices the build publishes, and the CHECKSUMS they were written for)"
