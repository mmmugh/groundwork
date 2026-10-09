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

# package.sh: assemble a scratchpad release from Ristretto's five pinned files and the course's jshell front end,
# in the shape of the boxes' runtime release (runtime/release/package.sh). Writes
# runtime/.work/ristretto/release/<release>/ holding the five files under their published names, browser-jshell.jar
# (built by runtime/jshell/build.sh, and refused unless it is the jar runtime/jshell/test/pins.json pins), the legal
# files (NOTICE, LICENSE-APACHE, LICENSE-MIT, THIRD-PARTY.txt, SOURCES.txt, and Corretto's own notices under legal/),
# CHECKSUMS for all of them, and source.tar.gz, the corresponding source; then rewrites the tracked
# runtime/ristretto/CHECKSUMS from the release and points runtime/.work/ristretto/current at it. Every input is
# checked against pins.env, and cross-checked against Ristretto's own lock files, before anything is written.
# The release is built in a sibling, release/.tmp-<release>/, and moved into place only once every check has passed:
# a run that fails leaves a release of the same name (the one current may point at), the tracked CHECKSUMS and current
# as they were. The release it replaces is moved aside to release/.tmp-old-<release>/, not deleted, until the new one
# is in place: an interrupt between the two moves leaves the old one set aside, and the EXIT trap puts it back under
# the release's name; an interrupt once the new one is in place leaves the old one set aside, and the EXIT trap
# removes it. Nothing in the legal files names the release, so packaging the same pins and sources twice gives the
# same CHECKSUMS and the same source.tar.gz.
#
# Clean room (D14, D51): Corretto's source archive is downloaded, hashed and copied into source.tar.gz whole; it is
# never extracted or listed, here or anywhere. Its copies include the staging directories, release/.tmp-*/ (the
# release's source.tar.gz and the source staged for it). From jdk.zip only legal/ is extracted, never lib/modules.
#
# usage: bash runtime/ristretto/package.sh <release>      (release: scratchpad-YYYY.MM.DD-N)
set -euo pipefail
F="$(cd "$(dirname "$0")" && pwd)"     # runtime/ristretto/
W="$(cd "$F/.." && pwd)/.work/ristretto"
if [ $# -ne 1 ] || ! [[ "$1" =~ ^scratchpad-[0-9]{4}\.[0-9]{2}\.[0-9]{2}-[0-9]+$ ]]; then
  echo "usage: bash runtime/ristretto/package.sh scratchpad-YYYY.MM.DD-N" >&2; exit 2
fi
release=$1
source "$F/pins.env"
in="$W/v$RISTRETTO_VERSION"
final="$W/release/$release"        # the release, once every check has passed
outdir="$W/release/.tmp-$release"  # where it is built until then
old="$W/release/.tmp-old-$release" # a release of the same name, set aside while the new one moves in
# A failed or interrupted run leaves no staging behind: it puts back a release it had set aside but not yet replaced,
# and removes the one set aside once a release is in place under the name.
trap 'rm -rf "$outdir" "$W/release/.tmp-source-$release"; if [ -e "$final" ]; then rm -rf "$old"; elif [ -e "$old" ]; then mv "$old" "$final"; fi' EXIT
UPSTREAM_FILES="jdk.zip runner.core.wasm runner.core2.wasm runner.core3.wasm worker.js"   # Ristretto's five, unmodified
JSHELL="$(cd "$F/../jshell" && pwd)"                              # runtime/jshell/: the course's front end (D55, D62)
JAR="$(cd "$F/.." && pwd)/.work/jshell/out/browser-jshell.jar"    # where runtime/jshell/build.sh writes it

log() { printf '[package %s] %s\n' "$(date +%H:%M:%S)" "$*"; }

# ---------------------------------------------------------------- 0. the five files and the jar, verified
bash "$F/fetch.sh" > /dev/null || { echo "package.sh: refusing: fetch.sh could not verify the five pinned files" >&2; exit 1; }
log "the five pinned files verify against CHECKSUMS and upstream's blob ids"

# The jar readers run must be the one runtime/jshell/test/check.mjs holds to the real jshell: built from
# runtime/jshell/src/ by its own build.sh (the pinned JDK; the same sources give the same bytes), and refused unless
# its SHA-256 is the "jar" pin in runtime/jshell/test/pins.json (D62).
sh "$JSHELL/build.sh" > /dev/null || { echo "package.sh: refusing: runtime/jshell/build.sh could not build the front end" >&2; exit 1; }
jar_pin=$(python3 -c 'import json, sys; print(json.load(open(sys.argv[1]))["jar"])' "$JSHELL/test/pins.json")
jar_sha=$(shasum -a 256 "$JAR" | cut -d' ' -f1)
[ "$jar_sha" = "$jar_pin" ] || { echo "package.sh: refusing: the front end built from runtime/jshell/src/ is $jar_sha; runtime/jshell/test/pins.json pins $jar_pin" >&2; exit 1; }
log "the front end built from runtime/jshell/src/ is the jar runtime/jshell/test/pins.json pins"

# A file package.sh reads: the checked local copy (downloaded once into .work/ristretto/inputs/, checked against
# its pin on every run).
fetch_pinned() { # $1 = url
  local url=$1 want f got
  want=$(printf '%s\n' "$SOURCE_INPUTS_SHA256" | awk -v u="$url" '$2 == u { print $1 }')
  [[ "$want" =~ ^[0-9a-f]{64}$ ]] || { echo "package.sh: $url is not pinned in pins.env (SOURCE_INPUTS_SHA256)" >&2; exit 1; }
  f="$W/inputs/$want-$(basename "$url")"
  if [ ! -f "$f" ]; then
    mkdir -p "$W/inputs"
    curl -fsSL "$url" -o "$f.part" || { rm -f "$f.part"; echo "package.sh: could not download $url" >&2; exit 1; }
    mv "$f.part" "$f"
  fi
  got=$(shasum -a 256 "$f" | cut -d' ' -f1)
  [ "$got" = "$want" ] || { rm -f "$f"; echo "package.sh: checksum MISMATCH for $url (pin $want, file $got)" >&2; exit 1; }
  printf '%s\n' "$f"
}

# ---------------------------------------------------------------- 1. every input fetched and checked
while read -r _ url; do [ -n "$url" ] && fetch_pinned "$url" > /dev/null; done <<< "$SOURCE_INPUTS_SHA256"
RISTRETTO_SRC=$(fetch_pinned "$RISTRETTO_SOURCE_URL")
CORRETTO_SRC=$(fetch_pinned "$CORRETTO_SOURCE_URL")
log "every input matches its pin"

# Cross-checks, before anything is written: each crate pin is the checksum Ristretto's Cargo.lock gives it; each npm
# pin's tarball has the integrity web/package-lock.json gives it; the two license texts are the pinned ones; every
# crate carries a license file; every legal/<module>/LICENSE in jdk.zip is the GPLv2 with the Classpath Exception.
export W RISTRETTO_SRC RISTRETTO_SOURCE_PREFIX SOURCE_INPUTS_SHA256 RISTRETTO_LICENSE_APACHE_SHA256 \
  RISTRETTO_LICENSE_MIT_SHA256 CORRETTO_GPL_LICENSE_SHA256
# What the cross-checks and THIRD-PARTY.txt (step 3) share, defined once so the two cannot drift apart: the pins, where
# each input is cached, the crate URL pattern and the license-file pattern. "Every crate carries a license file" is
# then about the very files THIRD-PARTY.txt collects. Each of the two Python steps is this text followed by its own.
IFS= read -r -d '' INPUTS_PY <<'PY' || true
import os, re
env = os.environ
pins = [l.split() for l in env["SOURCE_INPUTS_SHA256"].splitlines() if l.strip()]
cached = lambda sha, url: os.path.join(env["W"], "inputs", sha + "-" + url.rsplit("/", 1)[1])
CRATE_URL = re.compile(r"https://static\.crates\.io/crates/([^/]+)/\1-(.+)\.crate")
LICENSE_FILE = re.compile(r"^[^/]+/(.*/)?(LICEN[CS]E|COPYING|NOTICE|UNLICENSE|COPYRIGHT)[^/]*$", re.I)
PY
{ printf '%s' "$INPUTS_PY"; cat <<'PY'; } | python3 - "$in/jdk.zip"
import base64, hashlib, json, sys, tarfile, tomllib, zipfile
sha256 = lambda b: hashlib.sha256(b).hexdigest()
problems = []
src = tarfile.open(env["RISTRETTO_SRC"])
member = lambda name: src.extractfile(env["RISTRETTO_SOURCE_PREFIX"] + name).read()
lock = {(p["name"], p["version"]): p.get("checksum") for p in tomllib.loads(member("Cargo.lock").decode())["package"]}
npm = {p.get("resolved"): p.get("integrity") for p in json.loads(member("web/package-lock.json"))["packages"].values()}
crates = npm_seen = 0
for sha, url in pins:
    m = CRATE_URL.fullmatch(url)
    if m:
        crates += 1
        if lock.get((m[1], m[2])) != sha: problems.append(f"{m[1]} {m[2]}: pinned {sha}, Cargo.lock says {lock.get((m[1], m[2]))}")
        with tarfile.open(cached(sha, url)) as t:
            if not any(x.isfile() and LICENSE_FILE.match(x.name) for x in t.getmembers()): problems.append(f"{m[1]} {m[2]}: no license file")
    elif url.startswith("https://registry.npmjs.org/"):
        npm_seen += 1
        got = "sha512-" + base64.b64encode(hashlib.sha512(open(cached(sha, url), "rb").read()).digest()).decode()
        if npm.get(url) != got: problems.append(f"{url}: package-lock.json gives integrity {npm.get(url)}, the tarball is {got}")
for name, key in (("LICENSE-APACHE", "RISTRETTO_LICENSE_APACHE_SHA256"), ("LICENSE-MIT", "RISTRETTO_LICENSE_MIT_SHA256")):
    if sha256(member(name)) != env[key]: problems.append(f"{name} in Ristretto's source archive is not the pinned text")
with zipfile.ZipFile(sys.argv[1]) as z:
    licenses = [n for n in z.namelist() if re.fullmatch(r"legal/[^/]+/LICENSE", n)]
    if not licenses: problems.append("jdk.zip holds no legal/<module>/LICENSE")
    for n in licenses:
        if sha256(z.read(n)) != env["CORRETTO_GPL_LICENSE_SHA256"]: problems.append(f"jdk.zip's {n} is not the GPLv2 with the Classpath Exception")
if crates == 0 or npm_seen == 0: problems.append(f"pins.env pins {crates} crates and {npm_seen} npm packages")
for p in problems: print("  " + p, file=sys.stderr)
sys.exit(1 if problems else 0)
PY
log "crates match Cargo.lock, npm tarballs match package-lock.json, license texts and jdk.zip's notices are the pinned ones"

rm -rf "$outdir"
mkdir -p "$outdir"

# ---------------------------------------------------------------- 2. the six files, Ristretto's five unmodified
for f in $UPSTREAM_FILES; do cp "$in/$f" "$outdir/$f"; done
cp "$JAR" "$outdir/browser-jshell.jar"

# ---------------------------------------------------------------- 3. the legal files
tar -xzOf "$RISTRETTO_SRC" "${RISTRETTO_SOURCE_PREFIX}LICENSE-APACHE" > "$outdir/LICENSE-APACHE"
tar -xzOf "$RISTRETTO_SRC" "${RISTRETTO_SOURCE_PREFIX}LICENSE-MIT" > "$outdir/LICENSE-MIT"
unzip -q "$in/jdk.zip" 'legal/*' -d "$outdir"
{ printf '%s' "$INPUTS_PY"; cat <<'PY'; } | python3 - "$outdir/THIRD-PARTY.txt"
import sys, tarfile, tomllib
out = []
def verbatim(title, data):
    text = data.decode("utf-8")
    out.append(f"---- {title} ----\n{text}{'' if text.endswith(chr(10)) else chr(10)}\n")
def texts(prefix):
    return [(sha, url) for sha, url in pins if url.startswith(prefix)]
out.append("Third-party notices for the scratchpad's runtime files: the license texts of everything compiled into\n"
           "runner.core.wasm, runner.core2.wasm and runner.core3.wasm, and bundled into worker.js, verbatim, and the IJG\n"
           "README, which the IJG license asks the source of one of those crates to carry. NOTICE says what each file\n"
           "holds. The reduced Corretto in jdk.zip carries its own notices, under legal/.\n\n")
out.append("== 1. The Rust standard library 1.98.1 (rust-lang/rust at the commit SOURCES.txt names) ==\n\n")
for sha, url in texts("https://raw.githubusercontent.com/rust-lang/rust/"):
    verbatim(url.rsplit("/", 1)[1], open(cached(sha, url), "rb").read())
out.append("== 2. wasi-libc, from wasi-sdk-33 (WebAssembly/wasi-libc at the commit SOURCES.txt names) ==\n\n")
for sha, url in texts("https://raw.githubusercontent.com/WebAssembly/wasi-libc/"):
    verbatim(url.split("/", 6)[6], open(cached(sha, url), "rb").read())
crates = [(CRATE_URL.fullmatch(u), s, u) for s, u in pins
          if u.startswith("https://static.crates.io/")]
out.append(f"== 3. The {len(crates)} Rust crates compiled into runner.core.wasm (each .crate is in source.tar.gz) ==\n\n")
for m, sha, url in sorted(crates, key=lambda c: (c[0][1], c[0][2])):
    with tarfile.open(cached(sha, url)) as t:
        meta = tomllib.loads(t.extractfile(f"{m[1]}-{m[2]}/Cargo.toml").read().decode())["package"]
        out.append(f"{m[1]} {m[2]}\n  license: {meta.get('license', '(see its license files)')}\n"
                   f"  repository: {meta.get('repository', '(none given)')}\n\n")
        for x in sorted((x for x in t.getmembers() if x.isfile() and LICENSE_FILE.match(x.name)), key=lambda x: x.name):
            verbatim(x.name, t.extractfile(x).read())
npm = [(s, u) for s, u in pins if u.startswith("https://registry.npmjs.org/")]
out.append(f"== 4. The {len(npm)} npm packages bundled into worker.js (each tarball is in source.tar.gz) ==\n\n")
for sha, url in sorted(npm, key=lambda p: p[1]):
    with tarfile.open(cached(sha, url)) as t:
        out.append(f"{url}\n\n")
        for x in sorted((x for x in t.getmembers() if x.isfile() and re.fullmatch(r"package/(LICEN[CS]E|COPYING|NOTICE)[^/]*", x.name, re.I)), key=lambda x: x.name):
            verbatim(x.name, t.extractfile(x).read())
# libjpeg-turbo-rs ports files of libjpeg-turbo, which the IJG license covers; a distribution of their source must
# include its README, unaltered. source.tar.gz carries it beside the crate too (step 5).
ijg = texts("https://raw.githubusercontent.com/libjpeg-turbo/libjpeg-turbo/")
if len(ijg) != 1: sys.exit(f"package.sh: pins.env must pin one README.ijg of libjpeg-turbo; it pins {len(ijg)}")
out.append("== 5. The IJG README, for libjpeg-turbo-rs 0.8.0's source (in source.tar.gz as crates/README.ijg) ==\n\n")
verbatim("README.ijg", open(cached(*ijg[0]), "rb").read())
open(sys.argv[1], "w", encoding="utf-8", newline="\n").write("".join(out))
PY

corretto_size=$(wc -c < "$CORRETTO_SRC" | tr -d ' ')
corretto_sha=$(shasum -a 256 "$CORRETTO_SRC" | cut -d' ' -f1)
{
  echo "Where the scratchpad's files come from. Nothing below was modified; source.tar.gz, beside these files in"
  echo "each GitHub release of this runtime at https://github.com/mmmugh/groundwork/releases, and inside the course's"
  echo "site zip whenever one is published, holds every archive marked (in source.tar.gz), exactly as downloaded, and"
  echo "the course's own front end's source."
  echo
  echo "Ristretto v$RISTRETTO_VERSION (Apache-2.0 OR MIT)"
  echo "  repo:          https://github.com/theseus-rs/ristretto"
  echo "  tag:           v$RISTRETTO_VERSION"
  echo "  commit:        $RISTRETTO_COMMIT"
  echo "  source:        $RISTRETTO_SOURCE_URL (in source.tar.gz)"
  echo "  sha256:        $(shasum -a 256 "$RISTRETTO_SRC" | cut -d' ' -f1)"
  echo "  web build:     GitHub Pages, branch playground-pages, deploy commit $RISTRETTO_DEPLOY_COMMIT,"
  echo "                 built from the commit above; the five files, as published here:"
  while read -r name path blob; do
    [ -n "$name" ] || continue
    echo "    $name  (upstream $path, $(wc -c < "$outdir/$name" | tr -d ' ') bytes, git blob $blob)"
    echo "      sha256 $(shasum -a 256 "$outdir/$name" | cut -d' ' -f1)"
  done <<< "$RISTRETTO_FILES"
  echo "  The interpreter and worker are built by web/scripts/build-runtime.mjs and web/package.json in the"
  echo "  source above; browser-jshell.jar, inside jdk.zip, is web/runner/java/BrowserJShell.java compiled there."
  echo "  The page puts the course's own browser-jshell.jar (below) in its place when it loads; this one is unused."
  echo
  echo "The course's jshell front end, browser-jshell.jar (Apache-2.0)"
  echo "  copyright:     Copyright 2026 Groundwork contributors"
  echo "  repo:          https://github.com/mmmugh/groundwork"
  echo "  source:        runtime/jshell/src/ (in source.tar.gz as jshell/src/)"
  echo "  built by:      runtime/jshell/build.sh (in source.tar.gz as jshell/build.sh) with Eclipse Temurin"
  echo "                 25.0.4.1+1; the same sources give the same bytes"
  echo "  pin:           runtime/jshell/test/pins.json (\"jar\"); package.sh refuses a jar that differs"
  echo "  size, sha256:  $(wc -c < "$outdir/browser-jshell.jar" | tr -d ' ') bytes, $jar_sha"
  echo "  The page puts it in place of Ristretto's browser-jshell.jar inside jdk.zip, in memory, when it loads;"
  echo "  jdk.zip is published unmodified."
  echo
  echo "Amazon Corretto $CORRETTO_VERSION (GPLv2 with the Classpath Exception), reduced by jlink into jdk.zip"
  echo "  repo:          https://github.com/corretto/corretto-25"
  echo "  tag:           $CORRETTO_VERSION"
  echo "  commit:        $CORRETTO_COMMIT"
  echo "  source:        $CORRETTO_SOURCE_URL (in source.tar.gz, never extracted)"
  echo "  size, sha256:  $corretto_size bytes, $corretto_sha"
  echo "  jlinked from:  $CORRETTO_BINARY_URL"
  echo "  its sha256:    $CORRETTO_BINARY_SHA256"
  echo "  The jlink invocation is web/scripts/build-runtime.mjs in Ristretto's source."
  echo
  echo "Compilers whose libraries are in runner.core.wasm (sources not shipped; none is copyleft):"
  echo "  rustc 1.98.1:  https://github.com/rust-lang/rust, commit $RUST_COMMIT"
  echo "  wasi-sdk-33:   https://github.com/WebAssembly/wasi-libc, commit $WASI_LIBC_COMMIT;"
  echo "                 https://github.com/llvm/llvm-project, commit $LLVM_COMMIT"
  echo
  echo "Every input package.sh read, \"<sha256>  <url>\" (the crates, the npm tarballs and README.ijg are in source.tar.gz):"
  printf '%s\n' "$SOURCE_INPUTS_SHA256" | sed '/^$/d; s/^/  /'
  echo
  echo "Written offer (GPLv2, section 3(b)). For at least three years after you received these files from us, and"
  echo "for as long as we distribute them, anyone may have a complete machine-readable copy of the corresponding"
  echo "source code of the GPL-licensed parts of these files (Amazon Corretto, above), under the terms of the GPLv2,"
  echo "at no charge beyond the cost of physically performing the distribution, by download or on a medium"
  echo "customarily used for software interchange: ask at https://github.com/mmmugh/groundwork/issues. The same"
  echo "source is in source.tar.gz, beside these files in each GitHub release of this runtime at"
  echo "https://github.com/mmmugh/groundwork/releases, and inside the course's site zip whenever one is published."
} > "$outdir/SOURCES.txt"

cat > "$outdir/NOTICE" <<EOF
Groundwork scratchpad runtime

These files are what a reader's browser runs when it opens a chapter's scratchpad: the web build of
Ristretto v$RISTRETTO_VERSION, a Java virtual machine compiled to WebAssembly, with the reduced Amazon Corretto 25
class library it runs, published unmodified, and the course's own jshell front end. CHECKSUMS fixes each
file's bytes, SOURCES.txt says where each came from, and their corresponding source is source.tar.gz, beside
these files in each GitHub release of this runtime at https://github.com/mmmugh/groundwork/releases, and
inside the course's site zip whenever one is published. Nothing here is under the course's CC BY-NC-SA 4.0
license; each work below is under its own license.

What each file holds:
- worker.js: Ristretto's web worker (TypeScript, compiled), with the JavaScript packages in section 3.
- runner.core.wasm, runner.core2.wasm, runner.core3.wasm: Ristretto's interpreter and its WebAssembly
  component glue (Rust, compiled), with the Rust standard library, wasi-libc and the crates in section 2.
- jdk.zip: the reduced Corretto (section 4), and browser-jshell.jar, Ristretto's jshell front end (section 1),
  which the page does not use.
- browser-jshell.jar: the course's own jshell front end (section 5), which the page puts in place of
  Ristretto's inside jdk.zip when it loads.

1. Ristretto v$RISTRETTO_VERSION, https://github.com/theseus-rs/ristretto, commit $RISTRETTO_COMMIT:
   Apache License, Version 2.0 OR MIT License. Both texts ship, LICENSE-APACHE and LICENSE-MIT, and neither
   is elected. Ristretto ships no NOTICE file.

2. Compiled into runner.core.wasm, besides Ristretto's own code: the Rust standard library 1.98.1 (MIT OR
   Apache-2.0); wasi-libc from wasi-sdk-33 (Apache-2.0 WITH LLVM-exception, Apache-2.0 and MIT, with code from
   cloudlibc under BSD-2-Clause, musl under MIT and the others its LICENSE names); and the Rust crates
   THIRD-PARTY.txt lists, under MIT, Apache-2.0, BSD, 0BSD, Zlib and Unlicense terms, and one, option-ext
   0.2.0, under the Mozilla Public License 2.0, whose Source Code Form is crates/option-ext-0.2.0.crate in
   source.tar.gz, unmodified. THIRD-PARTY.txt carries every one of their license texts, verbatim.
   The crate libjpeg-turbo-rs 0.8.0 ports files of libjpeg-turbo, and those files are covered by the IJG
   license, whose README THIRD-PARTY.txt carries verbatim (source.tar.gz carries it beside the crate, as
   crates/README.ijg). As that license asks of a distribution of executable code: this software is based in
   part on the work of the Independent JPEG Group.

3. Bundled into worker.js: fflate 0.8.3 (MIT); @bytecodealliance/preview2-shim 0.23.0 and the glue
   @bytecodealliance/jco-transpile 0.12.1 generates (Apache-2.0 WITH LLVM-exception). THIRD-PARTY.txt carries
   their license texts, verbatim.

4. jdk.zip: Amazon Corretto $CORRETTO_VERSION, https://github.com/corretto/corretto-25, tag $CORRETTO_VERSION,
   commit $CORRETTO_COMMIT, reduced by jlink: GNU General Public License,
   version 2, with the Classpath Exception. Its notices are under legal/, one directory per module,
   extracted unmodified from jdk.zip: each LICENSE is the GPLv2 with the Classpath Exception, and
   ASSEMBLY_EXCEPTION, ADDITIONAL_LICENSE_INFO and the .md files are the notices Corretto ships for the
   code it includes. Corresponding source: Corretto's tag archive, in source.tar.gz exactly as downloaded
   (SOURCES.txt gives its URL, size and SHA-256); the jlink step is web/scripts/build-runtime.mjs in
   Ristretto's source archive, also there.

5. browser-jshell.jar: the course's own jshell front end, Copyright 2026 Groundwork contributors,
   Apache License, Version 2.0 (the text is LICENSE-APACHE). Its source is runtime/jshell/src/ in the
   course's repository, https://github.com/mmmugh/groundwork, and is in source.tar.gz with the
   build.sh that makes these exact bytes. When the page loads, it puts this jar in place of Ristretto's
   browser-jshell.jar inside jdk.zip, in memory; jdk.zip as published still carries Ristretto's, unused.

This NOTICE, SOURCES.txt, CHECKSUMS and THIRD-PARTY.txt's own headings are licensed Apache License, Version
2.0, as part of this project's scripts and documentation.
EOF
log "wrote the legal files ($(find "$outdir/legal" -type f | wc -l | tr -d ' ') Corretto notices under legal/)"

# ---------------------------------------------------------------- 4. CHECKSUMS (every published file, sorted)
( cd "$outdir" && find . -type f ! -name CHECKSUMS | sed 's#^\./##' | LC_ALL=C sort | while read -r n; do shasum -a 256 "$n"; done ) \
  > "$outdir/CHECKSUMS"
for f in $UPSTREAM_FILES; do
  [ "$(awk -v f="$f" '$2 == f' "$outdir/CHECKSUMS")" = "$(awk -v f="$f" '$2 == f' "$F/CHECKSUMS")" ] \
    || { echo "package.sh: $f's line in the release's CHECKSUMS differs from the pinned one" >&2; exit 1; }
done

# ---------------------------------------------------------------- 5. source.tar.gz
# Staged, then archived member by member in sorted order with owner 0/0, one fixed mtime and no gzip timestamp,
# as runtime/release/package.sh does.
tmp="$W/release/.tmp-source-$release"
rm -rf "$tmp"
mkdir -p "$tmp/src/crates" "$tmp/src/npm" "$tmp/src/tools" "$tmp/src/jshell"
cp "$RISTRETTO_SRC" "$tmp/src/ristretto-$RISTRETTO_VERSION-source.tar.gz"
cp -c "$CORRETTO_SRC" "$tmp/src/corretto-25-$CORRETTO_VERSION.tar.gz" 2> /dev/null || cp "$CORRETTO_SRC" "$tmp/src/corretto-25-$CORRETTO_VERSION.tar.gz"
while read -r sha url; do
  case "$url" in
    https://static.crates.io/*) cp "$W/inputs/$sha-$(basename "$url")" "$tmp/src/crates/$(basename "$url")" ;;
    https://registry.npmjs.org/*) cp "$W/inputs/$sha-$(basename "$url")" "$tmp/src/npm/$(basename "$url")" ;;
    # The IJG README, beside libjpeg-turbo-rs's crate, as the IJG license asks of its source (THIRD-PARTY.txt, step 3).
    https://raw.githubusercontent.com/libjpeg-turbo/libjpeg-turbo/*/README.ijg) cp "$W/inputs/$sha-README.ijg" "$tmp/src/crates/README.ijg" ;;
  esac
done <<< "$SOURCE_INPUTS_SHA256"
cp "$F/pins.env" "$F/fetch.sh" "$F/package.sh" "$F/verify.sh" "$tmp/src/tools/"
# The course's front end: the .java files build.sh compiles, and build.sh.
( cd "$JSHELL" && find src -name '*.java' ) | while read -r f; do mkdir -p "$tmp/src/jshell/$(dirname "$f")"; cp "$JSHELL/$f" "$tmp/src/jshell/$f"; done
cp "$JSHELL/build.sh" "$tmp/src/jshell/build.sh"
find "$tmp/src" -exec env TZ=UTC touch -h -t 202601010000.00 {} +
( cd "$tmp/src" && find . -mindepth 1 | sed 's#^\./##' | LC_ALL=C sort ) \
  | tar -c -z -n -f "$outdir/source.tar.gz" -C "$tmp/src" --uid 0 --gid 0 --numeric-owner \
      --options gzip:!timestamp -T -
rm -rf "$tmp"
log "source.tar.gz is $(du -h "$outdir/source.tar.gz" | cut -f1)"

# ---------------------------------------------------------------- 6. into place; the tracked CHECKSUMS and current
# Every check has passed: only now does a release of the same name give way. It is moved aside and deleted only once
# the new one is in its place; an interrupt between the two moves finds no $final, and the EXIT trap puts it back.
if [ -e "$final" ]; then rm -rf "$old"; mv "$final" "$old"; fi
mv "$outdir" "$final"
rm -rf "$old"
cp "$final/CHECKSUMS" "$F/CHECKSUMS"
ln -sfn "release/$release" "$W/current"
log "release $release packaged at $final; runtime/ristretto/CHECKSUMS rewritten; current -> release/$release"
