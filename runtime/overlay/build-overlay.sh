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

# Build patched TeaVM 0.13.1 jars WITHOUT building TeaVM's own Gradle project.
#
# Why: TeaVM's core module build downloads Node.js + npm packages (node-gradle/uglify for its JS
# runtime), which is outside this spike's allowed network list. Instead we take the published
# 0.13.1 jars from Maven Central (already in the Gradle cache), compile ONLY the changed/added
# source files from the patched teavm checkout (tag 0.13.1) against them, applying TeaVM's own
# shading relocations (hppc -> org.teavm.hppc, asm -> org.teavm.asm) to the sources first, and
# replace those classes inside copies of the jars. verify mode proves the method reproduces the
# published bytecode for unmodified files.
#
# usage: build-overlay.sh <teavm-src-dir> <out-dir> [verify]
set -euo pipefail
SRC=$1; OUT=$2; MODE=${3:-build}
: "${GRADLE_USER_HOME:?source env.sh first}"
C=$GRADLE_USER_HOME/caches/modules-2/files-2.1
jar_of() { ls "$C"/org.teavm/"$1"/0.13.1/*/"$1"-0.13.1.jar | head -1; }

# This script reads from the Gradle cache exactly the published jars and POMs pins.env pins
# (OVERLAY_INPUTS_SHA256), and each must match its SHA-256 there; a missing or different file stops the
# build. That list's jars are the classpath, rather than every TeaVM jar the cache happens to hold: a jar
# the cache picks up later must not change what the patched classes are compiled against.
source "$(cd "$(dirname "$0")/.." && pwd)/pins.env"
CP=""
for key in $(printf '%s\n' "$OVERLAY_INPUTS_SHA256" | awk 'NF == 2 { print $2 }'); do
  want=$(printf '%s\n' "$OVERLAY_INPUTS_SHA256" | awk -v k="$key" '$2 == k { print $1 }')
  found=0
  for f in "$C/$(dirname "$key")"/*/"$(basename "$key")"; do
    [ -f "$f" ] || continue
    got=$(shasum -a 256 "$f" | cut -d' ' -f1)
    [ "$got" = "$want" ] || { echo "build-overlay.sh: checksum MISMATCH for $key (pin $want, file $got)" >&2; exit 1; }
    [ "$found" = 1 ] || case "$key" in *.jar) CP="$CP$f:" ;; esac
    found=1
  done
  [ "$found" = 1 ] || { echo "build-overlay.sh: $key is not in the Gradle cache" >&2; exit 1; }
done
CP=${CP%:}
mkdir -p "$OUT"
cd "$SRC"

build_module() { # $1 = teavm module dir (core|classlib), $2 = artifact name
  local mod=$1 art=$2 files
  if [ "$MODE" = verify ]; then
    # the files the patches touch (plus any new, untracked file, e.g. when run on a patched tree)
    files=$( (git ls-files "$mod/src/main/java" | grep -E 'DependencyGraphBuilder|BoundCheckInsertion|GlobalValueNumbering|runtime/Fiber.java|DependencyAnalyzer.java|TConsoleInputStream|lang/TIO.java|TFormatter.java|TDefaultUncaught|TDecimalFormatSymbols|WasmGCGenerationVisitor|lang/TInteger.java|lang/TLong.java|lang/TDouble.java' || true;
             git ls-files --others --exclude-standard "$mod/src/main/java") | sort -u)
  else
    files=$( (git diff --name-only HEAD -- "$mod/src/main/java"; git ls-files --others --exclude-standard "$mod/src/main/java") | sort -u)
  fi
  [ -z "$files" ] && { cp "$(jar_of "$art")" "$OUT/$art-0.13.1.jar"; echo "$art: no changes"; return; }
  local work; work=$(mktemp -d "$OUT/work-$art.XXXX")
  mkdir -p "$work/src" "$work/classes"
  for f in $files; do
    local rel=${f#"$mod/src/main/java/"}
    mkdir -p "$work/src/$(dirname "$rel")"
    sed -e 's/com\.carrotsearch\.hppc/org.teavm.hppc/g' -e 's/org\.objectweb\.asm/org.teavm.asm/g' "$f" > "$work/src/$rel"
  done
  # --release 11 == class file major 55, the version the published jars use
  javac -nowarn -XDignore.symbol.file --release 11 -encoding UTF-8 -cp "$CP" -d "$work/classes" $(find "$work/src" -name '*.java')
  if [ "$MODE" = verify ]; then
    local bad=0
    (cd "$work/classes" && find . -name '*.class' | sed 's|^\./||') > "$work/list"
    mkdir -p "$work/orig" && (cd "$work/orig" && unzip -q -o "$(jar_of "$art")" $(cat "$work/list") 2>/dev/null || true)
    while read -r cls; do
      if [ ! -f "$work/orig/$cls" ]; then echo "NEW (not in published jar): $cls"; bad=1; continue; fi
      # Normalization of encoding-only differences (content must still match exactly):
      #  - constant-pool indices (#NN): the published jar was rewritten by the Shadow relocator,
      #    which reorders the pool; that also turns some ldc into ldc_w (3 bytes instead of 2),
      #    shifting bytecode offsets and branch targets, so offsets are stripped too;
      #  - synthetic lambda method names: newer javac numbers lambda$m$N differently.
      local norm='s/#[0-9]+(, *[0-9]+)?//; s/ldc_w/ldc/; s/^ *[0-9]+: //; s/(if[a-z_]*|goto|jsr)( +)[0-9]+/\1/; s/lambda\$[A-Za-z0-9_]*\$[0-9]+/lambda$X/g; s/^ *[0-9]+: [0-9]+$//; s/[[:space:]]+/ /g'
      if ! diff <(javap -c -p "$work/orig/$cls" | grep -v '^Compiled from' | sed -E "$norm" | grep -v '^ *$') \
                <(javap -c -p "$work/classes/$cls" | grep -v '^Compiled from' | sed -E "$norm" | grep -v '^ *$') > "$work/diff.txt"; then
        head -20 "$work/diff.txt"
        echo "DIFFERS: $cls"; bad=1
      fi
    done < "$work/list"
    echo "$art verify: $(wc -l < "$work/list") classes compared, bytecode $([ $bad = 0 ] && echo IDENTICAL || echo DIFFERENT)"
  else
    cp "$(jar_of "$art")" "$OUT/$art-0.13.1.jar"
    chmod u+w "$OUT/$art-0.13.1.jar"
    (cd "$work/classes" && jar uf "$OUT/$art-0.13.1.jar" .)
    echo "$art: replaced/added $(cd "$work/classes" && find . -name '*.class' | wc -l | tr -d ' ') classes from: $(echo $files | tr '\n' ' ')"
  fi
  rm -rf "$work"
}
build_module core teavm-core
build_module classlib teavm-classlib

# Publish into a file-based Maven repo as version 0.13.1-fork1 (POM copied from the original with only
# the artifact's own <version> changed; its dependencies stay 0.13.1). teavm-javac is pointed at this
# repo and rewrites teavm-core / teavm-classlib to 0.13.1-fork1, so exactly one copy of each class
# is on every classpath.
if [ "$MODE" = build ]; then
  for art in teavm-core teavm-classlib; do
    d="$OUT/repo/org/teavm/$art/0.13.1-fork1"
    mkdir -p "$d"
    cp "$OUT/$art-0.13.1.jar" "$d/$art-0.13.1-fork1.jar"
    pom=$(ls "$C"/org.teavm/"$art"/0.13.1/*/"$art"-0.13.1.pom | head -1)
    python3 - "$pom" "$d/$art-0.13.1-fork1.pom" <<'PY'
import sys, re
s = open(sys.argv[1]).read()
# the first <version> after <artifactId> of the project itself (before <dependencies>)
head, sep, tail = s.partition("<dependencies>")
head = head.replace("<version>0.13.1</version>", "<version>0.13.1-fork1</version>", 1)
open(sys.argv[2], "w").write(head + sep + tail)
PY
  done
  echo "published to $OUT/repo as 0.13.1-fork1"
fi
