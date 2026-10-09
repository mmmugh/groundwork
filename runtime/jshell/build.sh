#!/bin/sh
# Builds the scratchpad's jshell front end into runtime/.work/jshell/out/browser-jshell.jar with the pinned JDK:
# javac --release 25 over the sources in sorted order, then jar with a fixed date over the classes in sorted order,
# so the same sources always give the same bytes (pinned in test/pins.json, which test/check.mjs checks).
# usage: sh runtime/jshell/build.sh        (JF_JAVA_HOME, else JDK_HOME, overrides the pinned JDK)
set -eu
here=$(cd "$(dirname "$0")" && pwd)
root=$(cd "$here/../.." && pwd)
# The JDK: JF_JAVA_HOME as given (as ci/lib.sh and runtime/jdk-home.mjs take it), else JDK_HOME as given, else the
# pinned JDK, which unpacks to <dir>/Contents/Home on a Mac and to <dir> on Linux (probed as ci/lib.sh probes it).
jdk_dir=$root/runtime/.work/jdk25/jdk-25.0.4.1+1
if [ -n "${JF_JAVA_HOME:-}" ]; then jdk=$JF_JAVA_HOME
elif [ -n "${JDK_HOME:-}" ]; then jdk=$JDK_HOME
elif [ -x "$jdk_dir/Contents/Home/bin/java" ]; then jdk=$jdk_dir/Contents/Home
else jdk=$jdk_dir; fi
# SHA-256 of a file (shasum on a Mac, sha256sum on most Linux images): the same "<hash>  <name>" lines either way.
if command -v shasum >/dev/null 2>&1; then sha256() { shasum -a 256 "$@"; }
elif command -v sha256sum >/dev/null 2>&1; then sha256() { sha256sum "$@"; }
else echo "build.sh: neither shasum nor sha256sum is on the PATH" >&2; exit 2; fi
out=$root/runtime/.work/jshell/out
rm -rf "$out/classes" "$out/browser-jshell.jar"
mkdir -p "$out/classes"
(cd "$here/src" && find . -name '*.java' | LC_ALL=C sort) > "$out/sources.txt"
(cd "$here/src" && "$jdk/bin/javac" --release 25 -encoding UTF-8 -Xlint:all -Werror -d "$out/classes" @"$out/sources.txt")
(cd "$out/classes" && find . -name '*.class' | LC_ALL=C sort | sed 's|^\./||' > "$out/classes.txt" \
  && "$jdk/bin/jar" --create --date=2026-01-01T00:00:00Z --file "$out/browser-jshell.jar" @"$out/classes.txt")
sha256 "$out/browser-jshell.jar" | sed "s|$out/||"
