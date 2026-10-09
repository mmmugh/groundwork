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

# setup.sh: what a Linux runner needs before ci/quick.sh or ci/weekly.sh (W-13): the pinned Temurin JDK, the published
# runtimes (the boxes', the scratchpad's, and the CI-only variant of D88), and the browsers a job names.
#   bash ci/setup.sh [--dry-run] [engine...]      engine: chromium | webkit | firefox
# --dry-run prints every command instead of running it (it runs on a Mac too). With no engine no browser is installed.
# Each command runs whatever happened before it, but for the JDK's: the script exits 1 and names every one that failed.
source "$(dirname "$0")/lib.sh"
source "$ROOT/ci/pins.env"

browsers=()
for a in "$@"; do
  case "$a" in
    --dry-run) dry_run=1 ;;
    # README.md's names: Playwright 1.63.0 calls Chromium's headless build chromium-headless-shell.
    chromium) browsers+=(chromium-headless-shell) ;;
    webkit|firefox) browsers+=("$a") ;;
    *) echo "usage: bash ci/setup.sh [--dry-run] [chromium] [webkit] [firefox]" >&2; exit 2 ;;
  esac
done
if [ -z "$dry_run" ] && [ "$(uname)" != Linux ]; then
  echo "ci/setup.sh installs the Linux JDK and the browsers' system packages; on a Mac use runtime/build.sh and README.md's steps (or --dry-run)" >&2
  exit 2
fi

verify_sha256() { # verify_sha256 <file> <hash>
  local got; got=$(sha256sum "$1" | cut -d' ' -f1)
  [ "$got" = "$2" ] || { echo "$1 hashes to $got, ci/pins.env pins $2" >&2; return 1; }
}
# VERIFIED holds the SHA-256 the download was found to have, written only after it matched the pin in this run.
mark_verified() {
  echo "$(sha256sum runtime/.work/jdk25/jdk.tar.gz | cut -d' ' -f1)  $(basename "$TEMURIN_LINUX_X64_URL")" > runtime/.work/jdk25/VERIFIED
}
jdk_verified() {
  [ -x "$JDK_DIR/bin/java" ] && [ -f runtime/.work/jdk25/VERIFIED ] \
    && [ "$(cut -d' ' -f1 runtime/.work/jdk25/VERIFIED)" = "$TEMURIN_LINUX_X64_SHA256" ]
}
# Unlike every other step, each of the JDK's runs only if the ones before it passed, and a failure ends the script: a
# download that fails its check is never unpacked, marked VERIFIED or run (C-2, T-1). The failure removes the download,
# anything unpacked and VERIFIED, so the next run starts again from the download.
jdk_step() {
  step "$@"
  if [ "${#FAILED[@]}" -gt 0 ]; then rm -rf "$JDK_DIR" runtime/.work/jdk25/jdk.tar.gz runtime/.work/jdk25/VERIFIED; finish; fi
}

# A JDK an earlier run unpacked and checked (a restored cache) is not downloaded again, as runtime/build.sh does for the
# Mac's, when its VERIFIED records the SHA-256 ci/pins.env pins now. Anything else found there is removed and fetched again.
if jdk_verified; then
  echo "the pinned JDK is already unpacked and verified at $JDK_DIR"
else
  jdk_step jdk-clear rm -rf "$JDK_DIR" runtime/.work/jdk25/VERIFIED
  jdk_step jdk-mkdir mkdir -p runtime/.work/jdk25
  jdk_step jdk-download curl -fsSL -o runtime/.work/jdk25/jdk.tar.gz "$TEMURIN_LINUX_X64_URL"
  jdk_step jdk-check verify_sha256 runtime/.work/jdk25/jdk.tar.gz "$TEMURIN_LINUX_X64_SHA256"
  jdk_step jdk-unpack tar -xzf runtime/.work/jdk25/jdk.tar.gz -C runtime/.work/jdk25
  jdk_step jdk-verified mark_verified
fi
step fetch-runtime "$J" build/Build.java --fetch-runtime
step fetch-scratchpad bash runtime/ristretto/fetch-release.sh
step fetch-variant "$J" build/Build.java --fetch-variant
if [ "${#browsers[@]}" -gt 0 ]; then step playwright-install npx playwright-core install --with-deps "${browsers[@]}"; fi
finish
