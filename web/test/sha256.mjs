/*
 *  Copyright 2026 Groundwork contributors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
// web/page/sha256.js under Node: the FIPS 180-4 example vectors, every length 0..300 against node:crypto (padding
// crosses into a second block at 56 and into the length field at every boundary), the scratchpad's real jdk.zip
// against its line in runtime/ristretto/CHECKSUMS, the three input shapes the page can hand over, and K and H0 against
// their definition.
//   node web/test/sha256.mjs
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { sha256Hex, K, H0 } from "../page/sha256.js";
import { check, done, REPO, SCRATCHPAD } from "./harness.mjs";

const text = (s) => new TextEncoder().encode(s);
const VECTORS = [
  ["the empty message", "", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"],
  ["abc", "abc", "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"],
  ["the 448-bit message", "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq",
    "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1"],
  ["the 896-bit message", "abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu",
    "cf5b16a778af8380036ce59e7b0492370b249b11e8f07a51afac45037afee9d1"],
  ["one million a", "a".repeat(1_000_000), "cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0"],
];
for (const [label, message, want] of VECTORS) {
  const got = sha256Hex(text(message));
  check(`FIPS 180-4 example: ${label}`, got === want, got);
}

const reference = (bytes) => createHash("sha256").update(bytes).digest("hex");
const pattern = (n) => Uint8Array.from({ length: n }, (_, i) => (i * 131 + 7) & 0xff);
const wrong = [];
for (let n = 0; n <= 300; n++) if (sha256Hex(pattern(n)) !== reference(pattern(n))) wrong.push(n);
check("every length 0..300 of a byte pattern matches node:crypto (the padding's every boundary)", wrong.length === 0, wrong);

const jdk = fs.readFileSync(path.join(SCRATCHPAD, "jdk.zip"));
// The tracked pin, as every other reader of the scratchpad takes it: a fetched release (CI, a fresh clone) has no
// CHECKSUMS beside jdk.zip; only one runtime/ristretto/package.sh made has its own.
const line = fs.readFileSync(path.join(REPO, "runtime/ristretto/CHECKSUMS"), "utf8").split("\n").find((l) => /\sjdk\.zip$/.test(l));
check("the scratchpad's real jdk.zip (22 MB) hashes to its line in runtime/ristretto/CHECKSUMS", line !== undefined && sha256Hex(jdk) === line.split(/\s+/)[0],
  { line, got: sha256Hex(jdk) });

const big = pattern(1000), want = reference(big.subarray(37, 37 + 500));
const holder = new Uint8Array(1000);
holder.set(big);
check("a Uint8Array view at a nonzero offset of a larger buffer hashes only the view",
  sha256Hex(new Uint8Array(holder.buffer, 37, 500)) === want, sha256Hex(new Uint8Array(holder.buffer, 37, 500)));
check("an Int8Array of the same bytes gives the same digest", sha256Hex(new Int8Array(big.buffer.slice(37, 537))) === want);
check("a bare ArrayBuffer gives the same digest", sha256Hex(big.buffer.slice(37, 537)) === want);

// K and H0 from their definition (FIPS 180-4 4.2.2 and 5.3.3): the first 32 bits of the fractional parts of the cube
// roots of the first 64 primes and the square roots of the first 8, by exact integer roots.
const primes = [];
for (let c = 2; primes.length < 64; c++) if (primes.every((p) => c % p !== 0)) primes.push(c);
const iroot = (n, k) => {
  let lo = 0n, hi = 1n << 200n;
  while (lo < hi) { const mid = (lo + hi + 1n) >> 1n; if (mid ** BigInt(k) <= n) lo = mid; else hi = mid - 1n; }
  return lo;
};
const frac32 = (p, k) => Number(iroot(BigInt(p) << BigInt(32 * k), k) & 0xffffffffn);
check("K is the first 32 bits of the fractional parts of the cube roots of the first 64 primes",
  K.length === 64 && primes.every((p, i) => K[i] === frac32(p, 3)), [...K].map((x) => x.toString(16)));
check("H0 is the first 32 bits of the fractional parts of the square roots of the first 8 primes",
  H0.length === 8 && primes.slice(0, 8).every((p, i) => H0[i] === frac32(p, 2)), [...H0].map((x) => x.toString(16)));
done();
