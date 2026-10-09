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

# build.sh: rebuild the course runtime (the teavm-javac fork) from pinned sources, from a fresh shell.
# The build is not yet byte-reproducible across sessions: compiler.wasm can differ from an earlier build of
# the same sources in a few hundred bytes (DESIGN.md section 7), so a rebuild
# is accepted by the differential suite (runtime/test), not by release/verify.sh.
#
#   1. download Eclipse Temurin JDK 25 (macOS aarch64) into .work/jdk25 and verify its SHA-256 against
#      the pin in pins.env AND both checksums Adoptium publishes (API + .sha256.txt next to the binary)
#   2. clone TeaVM and teavm-javac into .work/build/src, check the pinned commits, and check that
#      teavm-javac builds the jdk25u revision pins.env names
#   3. fetch the jdk25u source javac is compiled from and check it against its pin
#   4. prime the Gradle cache with the published TeaVM jars (one unpatched build, output discarded)
#   5. build every variant: apply its patch set, build patched TeaVM jars (overlay/build-overlay.sh, which
#      checks every published jar and POM it reads against pins.env), build teavm-javac's :compiler, copy
#      the artifacts out with a manifest naming the SHA-256 of every patch applied and of the build's own
#      inputs (pins.env, this script, the overlay script, Gradle's verification metadata), which
#      release/package.sh holds the working tree to before it packages dist/fork
# Before every Gradle run the wrapper is told the Gradle distribution's SHA-256 and Gradle is given
# gradle/verification-metadata.xml, so the distribution and every dependency Gradle resolves are checked
# too. pins.env says what is checked and what is not. Any mismatch stops the build.
#
# usage: bash build.sh                 build fork into dist/fork
#        bash build.sh --negatives     also build fork-no-NNNN (every patch but one and the patches that
#                                      declare they build on it) into .work/variants/
# Every cache stays inside .work/ (JDK, clones, Gradle home, Maven local repo). Nothing is published.
set -euo pipefail
F="$(cd "$(dirname "$0")" && pwd)"
W="$F/.work"
cd "$F"

# Any other argument is a mistake (a typo would build fork alone, and later negative proofs would then run
# on variants left over from an earlier build), so refuse it before doing anything.
usage() { echo "usage: bash build.sh [--negatives]" >&2; exit 2; }
WITH_NEGATIVES=0
for arg in "$@"; do
  case "$arg" in
    --negatives) WITH_NEGATIVES=1 ;;
    *) echo "build.sh: unknown argument: $arg" >&2; usage ;;
  esac
done

source "$F/pins.env"
# What this build was made from, hashed now (before anything runs), for every variant's manifest.
BUILD_INPUTS="pins.env build.sh overlay/build-overlay.sh gradle/verification-metadata.xml"
BUILD_INPUTS_SHA256=$(cd "$F" && shasum -a 256 $BUILD_INPUTS)

ALL_TEAVM=$(ls "$F"/patches/teavm-0*.patch | sed -E 's#.*/teavm-([0-9]{4})-.*#\1#' | tr '\n' ' ')
ALL_JAVAC=$(ls "$F"/patches/teavm-javac-01*.patch | sed -E 's#.*/teavm-javac-([0-9]{4})-.*#\1#' | tr '\n' ' ')
# A patch that changes lines another patch wrote cannot apply without it, so it says so above its diff in a
# header line "# Builds on: teavm-NNNN" (or teavm-javac-NNNN; more than one name may follow). Every
# leave-one-out build applies: fork-no-NNNN leaves out NNNN and every patch that builds on it, directly or
# through another. A name that is not a patch in patches/ stops the build here, before anything runs.
dependents() { # every "dependent:base" pair the headers declare, by patch number
  local p b
  for p in $ALL_TEAVM $ALL_JAVAC; do
    for b in $(sed -n '/^diff --git/q; s/^# Builds on://p' "$F"/patches/*-"$p"-*.patch); do
      if ! [[ "$b" =~ ^teavm(-javac)?-([0-9]{4})$ ]] || ! ls "$F/patches/$b"-*.patch >/dev/null 2>&1; then
        echo "build.sh: $(basename "$F"/patches/*-"$p"-*.patch) builds on $b, which is not a patch in patches/" >&2
        return 1
      fi
      printf '%s:%s ' "$p" "${BASH_REMATCH[2]}"
    done
  done
}
DEPS=$(dependents)
NEGATIVES=$(for p in $ALL_TEAVM $ALL_JAVAC; do [ "$p" = 0101 ] || printf 'fork-no-%s ' "$p"; done)

log() { printf '[build %s] %s\n' "$(date +%H:%M:%S)" "$*"; }

# ---------------------------------------------------------------- 1. JDK
JDK_HOME="$W/jdk25/$JDK_RELEASE/Contents/Home"
if [ ! -x "$JDK_HOME/bin/java" ] || [ ! -f "$W/jdk25/VERIFIED" ]; then
  mkdir -p "$W/jdk25"
  log "downloading $JDK_FILE"
  curl -fsSL -o "$W/jdk25/jdk.tar.gz" "$JDK_URL"
  curl -fsSL -o "$W/jdk25/jdk.sha256.txt" "$JDK_URL.sha256.txt"
  api_sum=$(curl -fsSL "$JDK_API" | python3 -c 'import json,sys; print([b["package"]["checksum"] for b in json.load(sys.stdin)["binaries"] if b["package"]["name"]==sys.argv[1]][0])' "$JDK_FILE")
  txt_sum=$(awk '{print $1}' "$W/jdk25/jdk.sha256.txt")
  got_sum=$(shasum -a 256 "$W/jdk25/jdk.tar.gz" | awk '{print $1}')
  log "sha256 pin=$JDK_SHA256 api=$api_sum txt=$txt_sum file=$got_sum"
  if [ "$JDK_SHA256" != "$got_sum" ] || [ "$api_sum" != "$got_sum" ] || [ "$txt_sum" != "$got_sum" ]; then
    echo "JDK checksum MISMATCH, refusing to use it" >&2; exit 1
  fi
  tar -xzf "$W/jdk25/jdk.tar.gz" -C "$W/jdk25"
  echo "$got_sum  $JDK_FILE" > "$W/jdk25/VERIFIED"
fi
export JAVA_HOME="$JDK_HOME"
export PATH="$JAVA_HOME/bin:$PATH"
export GRADLE_USER_HOME="$W/gradle-home"
export GRADLE_OPTS="-Dmaven.repo.local=$W/m2"
java -version 2>&1 | head -1

# ---------------------------------------------------------------- 2. sources
SRC="$W/build/src"
mkdir -p "$SRC"
if [ ! -d "$SRC/teavm/.git" ]; then
  log "cloning teavm $TEAVM_TAG"
  git clone -q --depth 1 --branch "$TEAVM_TAG" https://github.com/konsoletyper/teavm.git "$SRC/teavm"
fi
if [ ! -d "$SRC/teavm-javac/.git" ]; then
  log "cloning teavm-javac"
  git clone -q https://github.com/konsoletyper/teavm-javac.git "$SRC/teavm-javac"
fi
[ "$(git -C "$SRC/teavm" rev-parse HEAD)" = "$TEAVM_COMMIT" ] || { echo "teavm tag $TEAVM_TAG is not $TEAVM_COMMIT" >&2; exit 1; }
git -C "$SRC/teavm-javac" cat-file -e "$JAVAC_COMMIT^{commit}"
# teavm-javac's build downloads and compiles the jdk25u revision its gradle.properties names; it must be
# the one pins.env records (and a release's SOURCES.txt names), so read that one tracked file at the pin.
javac_jdk_rev=$(git -C "$SRC/teavm-javac" show "$JAVAC_COMMIT:gradle.properties" | sed -n 's/^jdk\.revision=//p')
[ "$javac_jdk_rev" = "$JDK25U_REVISION" ] \
  || { echo "teavm-javac ${JAVAC_COMMIT:0:8} builds jdk25u '$javac_jdk_rev', but pins.env pins $JDK25U_REVISION" >&2; exit 1; }

# ---------------------------------------------------------------- Gradle, checked
# Every Gradle run goes through gw. The wrapper downloads and runs a Gradle distribution: the clone's
# gradle-wrapper.properties gets distributionSha256Sum, so the wrapper checks every download of it against
# the pin, and a distribution unpacked before this check existed (no VERIFIED marker holding the pin) is
# removed first, so it is downloaded and checked again. This is set here, not by a patch: it changes no
# behavior, so a patch for it would have a fork-no variant that passes every gate. gradle/verification-
# metadata.xml goes into the clone too, so Gradle checks every dependency and plugin it resolves.
# Each variant checks out and cleans the clone, which undoes both, so gw does both before every run.
GRADLE_RAN=0
stop_gradle() { # on every exit, so a failed variant leaves no Gradle daemon running
  if [ "$GRADLE_RAN" = 1 ]; then (cd "$SRC/teavm-javac" && ./gradlew -q --stop) > /dev/null 2>&1 || true; fi
}
trap stop_gradle EXIT
gw() { # $1 = log name, then Gradle arguments
  local name=$1; shift
  local props="$SRC/teavm-javac/gradle/wrapper/gradle-wrapper.properties"
  local dist="$GRADLE_USER_HOME/wrapper/dists/${GRADLE_DIST%.zip}"
  grep -qxF "distributionUrl=https\\://services.gradle.org/distributions/$GRADLE_DIST" "$props" \
    || { echo "teavm-javac's Gradle wrapper does not name $GRADLE_DIST, the distribution pins.env pins" >&2; exit 1; }
  grep -v '^distributionSha256Sum=' "$props" > "$props.pinned"
  echo "distributionSha256Sum=$GRADLE_DIST_SHA256" >> "$props.pinned"
  mv "$props.pinned" "$props"
  cp "$F/gradle/verification-metadata.xml" "$SRC/teavm-javac/gradle/verification-metadata.xml"
  if [ -d "$dist" ] && [ "$(cat "$dist/VERIFIED" 2> /dev/null)" != "$GRADLE_DIST_SHA256" ]; then
    log "the Gradle distribution in .work was never checked against the pin: removing it to download it again"
    rm -rf "${dist:?}"
  fi
  GRADLE_RAN=1
  (cd "$SRC/teavm-javac" && ./gradlew "$@") > "$W/build/gradle-$name.log" 2>&1 \
    || { tail -40 "$W/build/gradle-$name.log"; echo "Gradle run $name FAILED" >&2; exit 1; }
  echo "$GRADLE_DIST_SHA256" > "$dist/VERIFIED"
}

# ---------------------------------------------------------------- 3. jdk25u source
# teavm-javac's build downloads the jdk25u source (javac/build.gradle, downloadJDK; kept across variants,
# build/ is git-ignored) and compiles javac from it into compiler.wasm. Fetch it alone first, then check it
# against the pin before any variant is built from it.
mkdir -p "$W/build"
JDK_ZIP="$SRC/teavm-javac/javac/build/jdk-$JDK25U_REVISION.zip"
if [ ! -f "$JDK_ZIP" ]; then
  log "downloading the jdk25u source (teavm-javac's :javac:downloadJDK)"
  git -C "$SRC/teavm-javac" checkout -q -f "$JAVAC_COMMIT"
  git -C "$SRC/teavm-javac" clean -q -fd
  gw download-jdk25u -q --no-configuration-cache :javac:downloadJDK
fi
jdk_zip_sum=$(shasum -a 256 "$JDK_ZIP" | awk '{print $1}')
[ "$jdk_zip_sum" = "$JDK25U_ZIP_SHA256" ] \
  || { echo "jdk25u source checksum MISMATCH (pin $JDK25U_ZIP_SHA256, file $jdk_zip_sum), refusing to build from it" >&2; exit 1; }
log "jdk25u source matches its pin"

# ---------------------------------------------------------------- 4. variants
patch_file() { ls "$F"/patches/*-"$1"-*.patch; }
# leaves_with NNNN: NNNN and every patch that builds on it, directly or through another, as " NNNN ... ".
leaves_with() {
  local out=" $1 " grew=1 d
  while [ "$grew" = 1 ]; do
    grew=0
    for d in $DEPS; do
      case "$out" in *" ${d#*:} "*) case "$out" in *" ${d%%:*} "*) ;; *) out="$out${d%%:*} "; grew=1 ;; esac ;; esac
    done
  done
  printf '%s' "$out"
}
without() { local drop=$1; shift; for x in "$@"; do case "$drop" in *" $x "*) ;; *) printf '%s ' "$x" ;; esac; done; }

# :compiler:clean because prepareTeaVMClassLib is a Copy (not Sync): classes from a previous
# variant would otherwise survive in the runtime classlib.
gradle_compiler() { # $1 = log name, then extra Gradle arguments
  local name=$1; shift
  gw "$name" -q --no-configuration-cache -Dmaven.repo.local="$W/m2" "$@" :compiler:clean :compiler:build -x check
}

build_variant() {
  local name=$1 javac_commit teavm_patches javac_patches
  case "$name" in
    fork)     javac_commit=$JAVAC_COMMIT; teavm_patches="$ALL_TEAVM"; javac_patches="$ALL_JAVAC" ;;
    fork-no-*)   javac_commit=$JAVAC_COMMIT; local drop; drop=$(leaves_with "${name#fork-no-}")
                 teavm_patches=$(without "$drop" $ALL_TEAVM); javac_patches=$(without "$drop" $ALL_JAVAC) ;;
    *) echo "unknown variant $name" >&2; exit 1 ;;
  esac
  log "variant $name: teavm-javac ${javac_commit:0:8}, teavm patches [${teavm_patches}], teavm-javac patches [${javac_patches}]"
  local t0; t0=$(date +%s)

  # The SHA-256 of each patch file as it is applied, for the manifest.
  local applied=""
  git -C "$SRC/teavm" checkout -q -f "$TEAVM_COMMIT"
  git -C "$SRC/teavm" clean -q -fd
  for p in $teavm_patches; do
    git -C "$SRC/teavm" apply "$(patch_file "$p")"
    applied="$applied$(cd "$F" && shasum -a 256 "patches/$(basename "$(patch_file "$p")")")"$'\n'
  done

  local fork_arg=""
  if [ -n "$teavm_patches" ]; then
    local ov="$W/build/overlay/$name"
    rm -rf "${ov:?}"
    "$F/overlay/build-overlay.sh" "$SRC/teavm" "$ov" 2>&1 | grep -v '^Note:' | sed 's/^/    /'
    fork_arg="-Pteavm.forkRepo=$ov/repo"
  fi

  git -C "$SRC/teavm-javac" checkout -q -f "$javac_commit"
  git -C "$SRC/teavm-javac" clean -q -fd
  for p in $javac_patches; do
    git -C "$SRC/teavm-javac" apply "$(patch_file "$p")"
    applied="$applied$(cd "$F" && shasum -a 256 "patches/$(basename "$(patch_file "$p")")")"$'\n'
  done

  gradle_compiler "$name" $fork_arg

  local out; if [ "$name" = fork ]; then out="$F/dist/fork"; else out="$W/variants/$name"; fi
  local gen="$SRC/teavm-javac/compiler/build"
  mkdir -p "$out"
  cp "$gen/generated/teavm/wasm-gc/compiler.wasm" "$gen/generated/teavm/wasm-gc/compiler.wasm-runtime.js" \
     "$gen/generated/teavm/wasm-gc/compiler.wasm-deobfuscator.wasm" \
     "$gen/classlib/compile-classlib-teavm.bin" "$gen/classlib/runtime-classlib-teavm.bin" "$out/"
  cp "$out/compiler.wasm-runtime.js" "$out/compiler.wasm-runtime.mjs"
  local secs=$(( $(date +%s) - t0 ))
  python3 - "$out" "$name" "$javac_commit" "$TEAVM_COMMIT" "$teavm_patches" "$javac_patches" "$secs" \
      "$applied" "$BUILD_INPUTS_SHA256" <<'PY'
import hashlib, json, os, sys
out, name, jc, tc, tp, jp, secs, applied, inputs = sys.argv[1:]
files = {f: {"bytes": os.path.getsize(os.path.join(out, f)),
             "sha256": hashlib.sha256(open(os.path.join(out, f), "rb").read()).hexdigest()}
         for f in sorted(os.listdir(out)) if f != "manifest.json"}
# "<sha256>  <path>" lines, as shasum prints them, into {path: sha256}
pairs = lambda text: {line.split("  ", 1)[1]: line.split("  ", 1)[0] for line in text.splitlines() if line}
json.dump({"variant": name, "teavm_javac_commit": jc, "teavm_commit": tc,
           "teavm_patches": tp.split(), "teavm_javac_patches": jp.split(),
           "patches_sha256": pairs(applied), "build_inputs_sha256": pairs(inputs),
           "build_seconds": int(secs), "files": files}, open(os.path.join(out, "manifest.json"), "w"), indent=2)
PY
  log "variant $name done in ${secs}s -> ${out#"$F"/}"
}

mkdir -p "$F/dist"

# build-overlay.sh compiles against the published, unpatched TeaVM 0.13.1 jars, which it reads straight
# out of the Gradle module cache. Every variant is built with -Pteavm.forkRepo, which never downloads
# them, so on an empty cache one plain build of teavm-javac puts them there first.
if ! ls "$GRADLE_USER_HOME"/caches/modules-2/files-2.1/org.teavm/teavm-core/0.13.1/*/teavm-core-0.13.1.jar >/dev/null 2>&1; then
  log "priming the Gradle cache: unpatched teavm-javac ${JAVAC_COMMIT:0:8}, no fork repo, output discarded"
  git -C "$SRC/teavm-javac" checkout -q -f "$JAVAC_COMMIT"
  git -C "$SRC/teavm-javac" clean -q -fd
  gradle_compiler prime
fi

targets=fork
[ "$WITH_NEGATIVES" = 1 ] && targets="fork $NEGATIVES"
for v in $targets; do build_variant "$v"; done

log "all done: $targets"
