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
// Puts the course's jshell front end into Ristretto's JDK archive without changing a byte of it.
//
// Ristretto's worker builds the VM's /jdk directory from the "jdk.zip" asset it is handed, and its jshell action
// loads class BrowserJShell from /jdk/browser-jshell.jar. withFrontEnd(zip, jar) returns the upstream archive's bytes
// unchanged, followed by our jar as one more stored entry and a new central directory that lists every upstream
// entry except the old browser-jshell.jar, then ours. Every zip reader starts from the central directory at the
// end, so the worker sees our jar; anyone can check that the first zip.length bytes are still the pinned upstream
// archive. Only a reader that starts from the central directory sees the new jar: the old browser-jshell.jar stays in
// the prefix as dead bytes, and a reader that scans local headers from the front (a streaming unzip) would find the
// old one first and stop at the old directory. Ristretto's worker, the browsers' path through it and the Node check all
// read the central directory. Plain ES module, no dependencies: the page and the Node check run the same code.

const LOCAL = 0x04034b50, CENTRAL = 0x02014b50, END = 0x06054b50;

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function endRecord(zip, view) {
  // The end record is 22 bytes plus a comment of at most 65,535 bytes.
  for (let at = zip.length - 22; at >= Math.max(0, zip.length - 22 - 65535); at--) {
    if (view.getUint32(at, true) === END && at + 22 + view.getUint16(at + 20, true) === zip.length) return at;
  }
  throw new Error("not a zip archive: no end-of-central-directory record");
}

/**
 * @param {Uint8Array} zip the pinned upstream jdk zip
 * @param {Uint8Array} jar our front end's jar
 * @param {string} [name] the entry to replace
 * @returns {Uint8Array} the composed archive
 */
export function withFrontEnd(zip, jar, name = "browser-jshell.jar") {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  const end = endRecord(zip, view);
  const count = view.getUint16(end + 10, true);
  const cdSize = view.getUint32(end + 12, true);
  const cdOffset = view.getUint32(end + 16, true);
  if (view.getUint16(end + 4, true) !== 0 || view.getUint16(end + 6, true) !== 0 || view.getUint16(end + 8, true) !== count) {
    throw new Error("multi-disk archives are not supported");
  }
  if (count === 0xffff || cdSize === 0xffffffff || cdOffset === 0xffffffff) throw new Error("zip64 archives are not supported");
  if (cdOffset + cdSize !== end) throw new Error("unexpected bytes between the central directory and its end record");

  const decoder = new TextDecoder();
  const kept = [];
  let replaced = 0;
  for (let at = cdOffset, i = 0; i < count; i++) {
    if (view.getUint32(at, true) !== CENTRAL) throw new Error(`central directory entry ${i} is malformed`);
    const length = 46 + view.getUint16(at + 28, true) + view.getUint16(at + 30, true) + view.getUint16(at + 32, true);
    const entryName = decoder.decode(zip.subarray(at + 46, at + 46 + view.getUint16(at + 28, true)));
    if (entryName === name) replaced++;
    else kept.push(zip.subarray(at, at + length));
    at += length;
  }
  if (replaced > 1) throw new Error(`the archive lists ${name} ${replaced} times`);
  // An upstream rename must not pass unnoticed: the worker would load whatever the archive calls the front end.
  if (replaced === 0) throw new Error(`the archive has no ${name} to replace`);

  const nameBytes = new TextEncoder().encode(name);
  const crc = crc32(jar);
  const time = 0, date = ((2026 - 1980) << 9) | (1 << 5) | 1; // 2026-01-01 00:00, as upstream's entries
  const local = new Uint8Array(30 + nameBytes.length);
  const lv = new DataView(local.buffer);
  lv.setUint32(0, LOCAL, true); lv.setUint16(4, 10, true); lv.setUint16(6, 0, true); lv.setUint16(8, 0, true);
  lv.setUint16(10, time, true); lv.setUint16(12, date, true); lv.setUint32(14, crc, true);
  lv.setUint32(18, jar.length, true); lv.setUint32(22, jar.length, true); lv.setUint16(26, nameBytes.length, true);
  lv.setUint16(28, 0, true); local.set(nameBytes, 30);

  const central = new Uint8Array(46 + nameBytes.length);
  const cv = new DataView(central.buffer);
  cv.setUint32(0, CENTRAL, true); cv.setUint16(4, 20, true); cv.setUint16(6, 10, true); cv.setUint16(8, 0, true);
  cv.setUint16(10, 0, true); cv.setUint16(12, time, true); cv.setUint16(14, date, true); cv.setUint32(16, crc, true);
  cv.setUint32(20, jar.length, true); cv.setUint32(24, jar.length, true); cv.setUint16(28, nameBytes.length, true);
  cv.setUint32(42, zip.length, true); central.set(nameBytes, 46); // extra, comment, disk, attributes: all zero

  const directory = [...kept, central];
  const directorySize = directory.reduce((n, part) => n + part.length, 0);
  const directoryOffset = zip.length + local.length + jar.length;
  const tail = new Uint8Array(22);
  const tv = new DataView(tail.buffer);
  tv.setUint32(0, END, true); tv.setUint16(8, directory.length, true); tv.setUint16(10, directory.length, true);
  tv.setUint32(12, directorySize, true); tv.setUint32(16, directoryOffset, true);

  const out = new Uint8Array(directoryOffset + directorySize + tail.length);
  let at = 0;
  for (const part of [zip, local, jar, ...directory, tail]) { out.set(part, at); at += part.length; }
  return out;
}
