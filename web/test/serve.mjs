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
// The dev server serves a built site as it is, to 127.0.0.1 only, with a content type and no other header
// (nothing may need COOP/COEP, D7), and never outside its root. Port 8731 belongs to the Python course.
import dc from "node:diagnostics_channel";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { serve } from "../serve.mjs";
import { REPO, check, done, workDir } from "./harness.mjs";

const root = workDir("serve-test");
fs.writeFileSync(path.join(root, "index.html"), "<!doctype html><p>home");
fs.writeFileSync(path.join(root, "a.mjs"), "export const a = 1;\n");
fs.writeFileSync(path.join(root, "b.wasm"), Buffer.from([0, 0x61, 0x73, 0x6d, 1, 0, 0, 0]));
fs.mkdirSync(path.join(root, "sub"));
fs.writeFileSync(path.join(root, "sub", "c.html"), "<!doctype html><p>c");
const s = await serve({ root, port: 0 });
const base = `http://127.0.0.1:${s.port}`;
const get = async (p) => { const r = await fetch(base + p); return { status: r.status, type: r.headers.get("content-type"), headers: [...r.headers.keys()], body: await r.text() }; };
let r = await get("/");
check("/ is the root's index.html", r.status === 200 && r.body.includes("home") && r.type.startsWith("text/html"), r);
r = await get("/a.mjs");
check("a module script is served as JavaScript", r.status === 200 && r.type.startsWith("text/javascript"), r);
r = await get("/b.wasm");
check("WebAssembly is served as application/wasm", r.status === 200 && r.type === "application/wasm", r);
// types: "plain" is test-only (D85): five types and no .mjs or .wasm, so a page that needs either to be typed fails here.
fs.writeFileSync(path.join(root, "d.js"), "export const d = 1;\n");
fs.writeFileSync(path.join(root, "e.json"), "{}\n");
const plain = await serve({ root, port: 0, types: "plain" });
const getPlain = async (p) => { const x = await fetch(`http://127.0.0.1:${plain.port}${p}`); await x.arrayBuffer(); return { status: x.status, type: x.headers.get("content-type"), headers: [...x.headers.keys()] }; };
r = await getPlain("/");
check("plain: .html is text/html", r.status === 200 && r.type === "text/html", r);
r = await getPlain("/d.js");
check("plain: .js is application/javascript", r.status === 200 && r.type === "application/javascript", r);
r = await getPlain("/e.json");
check("plain: .json is application/json", r.status === 200 && r.type === "application/json", r);
r = await getPlain("/a.mjs");
check("plain: .mjs is octet-stream, which a browser refuses for a module script", r.status === 200 && r.type === "application/octet-stream", r);
r = await getPlain("/b.wasm");
check("plain: .wasm is octet-stream, so only bytes can load it", r.status === 200 && r.type === "application/octet-stream", r);
check("plain: no cross-origin isolation or Content-Security-Policy header is sent", !r.headers.some((h) => h.startsWith("cross-origin") || h.startsWith("content-security")), r.headers);
await plain.close();
let refused = null;
try { await serve({ root, port: 0, types: "nginx" }); } catch (e) { refused = String(e); }
check("an unknown types option is refused, never ignored", refused !== null && refused.includes("nginx"), refused);
r = await get("/sub/c.html");
check("a file in a subdirectory is served", r.status === 200 && r.body.includes("<p>c"), r);
check("no cross-origin isolation headers are sent", !r.headers.some((h) => h.startsWith("cross-origin")), r.headers);
r = await get("/missing.html");
check("a missing file is 404", r.status === 404, r);
const up = path.relative(root, REPO).split(path.sep).length;
// The slash is encoded, not the dots: fetch's URL parser collapses a "%2e%2e" segment before the request is sent,
// so only "..%2f" reaches the server as a way out. This one leads, unguarded, to the repository's README.md.
check("the canary word is in the README an escape would serve", fs.readFileSync(path.join(REPO, "README.md"), "utf8").includes("Groundwork"), "README.md");
r = await get("/" + "..%2f".repeat(up) + "README.md");
check("an encoded ../ cannot leave the root", r.status === 404 && !r.body.includes("Groundwork"), r);
// prefix is test-only (Task 8): the site under /groundwork/ as Pages serves a project site, and 404 for anything else [B14].
const pref = await serve({ root, port: 0, prefix: "/groundwork/" });
const getPref = async (p) => { const x = await fetch(`http://127.0.0.1:${pref.port}${p}`); return { status: x.status, body: await x.text() }; };
r = await getPref("/groundwork/");
check("prefix: the root's index.html answers at the prefix", r.status === 200 && r.body.includes("home"), r);
r = await getPref("/groundwork/sub/c.html");
check("prefix: a file in a subdirectory answers under the prefix", r.status === 200 && r.body.includes("<p>c"), r);
r = await getPref("/");
check("prefix: / is outside the prefix, so 404", r.status === 404, r);
r = await getPref("/sub/c.html");
check("prefix: a root-absolute path to a file that exists under the root is 404", r.status === 404, r);
r = await getPref("/groundwork");
check("prefix: the prefix without its slash is outside it, so 404", r.status === 404, r);
r = await getPref("/groundworkx/index.html");
check("prefix: a path that merely starts with the same letters is 404", r.status === 404, r);
r = await getPref("/groundwork/" + "..%2f".repeat(up + 1) + "README.md");
check("prefix: an encoded ../ still cannot leave the root", r.status === 404 && !r.body.includes("Groundwork"), r);
await pref.close();
for (const bad of ["groundwork/", "/groundwork", "groundwork"]) {
  let e = null;
  try { await serve({ root, port: 0, prefix: bad }); } catch (x) { e = String(x); }
  check(`a prefix of ${JSON.stringify(bad)} is refused, never guessed at`, e !== null && e.includes("prefix"), e);
}
fs.symlinkSync(path.join(REPO, "package.json"), path.join(root, "link.json"));
r = await get("/link.json");
check("a symlink cannot lead outside the root", r.status === 404, r);
// A file inside the root that cannot be read (EACCES) must not take the server down: it gets no 200, and the next
// request is still served. A cut-off response counts as no 200. A process that can read a mode-000 file (root, as on
// many CI runners) cannot make the OS refuse, so there the check injects EACCES for that path, as the fs.open override
// further down does for its race, and says so in its label (P3-12 [C13]).
const lockedFile = path.join(root, "locked.txt");
fs.writeFileSync(lockedFile, "secret\n");
const lockedReal = fs.realpathSync(lockedFile);
const canRead = (f) => { try { fs.accessSync(f, fs.constants.R_OK); return true; } catch { return false; } };
// fs.open fails with EACCES for the one file; every other open goes through. Returns the undo.
const refuseOpenOfLocked = () => {
  const realOpen = fs.open;
  fs.open = function (file, ...rest) {
    if (String(file) !== lockedReal) return realOpen.call(this, file, ...rest);
    const callback = rest.pop();
    process.nextTick(callback, Object.assign(new Error(`EACCES: permission denied, open '${file}'`), { code: "EACCES", errno: -13, syscall: "open", path: String(file) }));
  };
  return () => { fs.open = realOpen; };
};
const lockedCheck = async (label, inject) => {
  const undo = inject ? refuseOpenOfLocked() : () => {};
  const locked = await get("/locked.txt").catch((e) => ({ status: "closed", error: String(e) }));
  const after = await get("/a.mjs").catch((e) => ({ status: "closed", error: String(e) }));
  undo();
  check(label, locked.status !== 200 && after.status === 200, { locked, after });
};
fs.chmodSync(lockedFile, 0o000);
const rootLike = canRead(lockedFile);
await lockedCheck(`an unreadable file gets no 200 and the server keeps serving${rootLike ? " (EACCES injected: this process can read mode 000)" : ""}`, rootLike);
// The forced "readable" run: the file is back at 644 and the open of it is refused, so only the injection can stop the 200.
fs.chmodSync(lockedFile, 0o644);
const served = await get("/locked.txt");
check("the same file at mode 644, with nothing injected, is served (so the injection below is all that can stop it)", served.status === 200 && served.body === "secret\n", served);
await lockedCheck("a readable file whose open is refused with EACCES gets no 200 and the server keeps serving (EACCES injected: forced readable, mode 644)", true);
fs.chmodSync(lockedFile, 0o000);
// A client that disconnects after the headers must not leave the file's descriptor open until GC: the 20 MB file is
// far past the socket's buffers, so the stream is still paused on backpressure when the client goes. The process's
// descriptors open on that file (those in /dev/fd whose device and inode are its own) must be none within a second
// of the abort. Counting them, not every descriptor, keeps the earlier requests' keep-alive sockets out of it: those
// close by themselves a few seconds later and, in a count of all, could hide a leaked one. While the response
// streams, the count must see the file open once, or it could pass only because it sees nothing.
const big = path.join(root, "big.bin");
fs.writeFileSync(big, Buffer.alloc(20 * 1024 * 1024));
const openOn = (file) => {
  const { dev, ino } = fs.statSync(file);
  return fs.readdirSync("/dev/fd").filter((n) => {
    try { const st = fs.fstatSync(Number(n)); return st.dev === dev && st.ino === ino; } catch { return false; }
  }).length;
};
const until = async (ready, ms) => { for (let t = 0; t < ms && !ready(); t += 10) await new Promise((r) => setTimeout(r, 10)); };
const streaming = await new Promise((resolve, reject) => {
  const req = http.get(`${base}/big.bin`, { agent: false }, (res) => { const n = openOn(big); req.destroy(); res.destroy(); resolve(n); });
  req.on("error", () => {}); // the abort resets the socket
  setTimeout(() => reject(new Error("no headers in 5 s")), 5000).unref();
});
await until(() => openOn(big) === 0, 1000);
const left = openOn(big);
check("a client that aborts after the headers leaves no descriptor open (within 1 s)", streaming === 1 && left === 0, { streaming, left });
// A client gone before the file even opens must not leave it open either (Ruling 4): the close handler is in place
// from the stream's creation, not only from its "open". The stream's open (it calls fs.open) is held until the
// server's response has closed (seen through node:diagnostics_channel's http.server.request.start), then let through.
const early = path.join(root, "early.txt");
fs.writeFileSync(early, "opened after the client left\n");
const earlyReal = fs.realpathSync(early), realOpen = fs.open;
let release, asked = false, opened = null;
const held = new Promise((r) => (release = r));
fs.open = function (file, ...rest) {
  if (String(file) !== earlyReal) return realOpen.call(this, file, ...rest);
  const callback = rest.pop();
  asked = true;
  held.then(() => realOpen.call(this, file, ...rest, (err, fd) => { opened = err ? String(err) : fd; callback(err, fd); }));
};
const responses = [];
const seeRequest = ({ request, response }) => { if (request.url === "/early.txt") responses.push(response); };
dc.subscribe("http.server.request.start", seeRequest);
const req = http.get(`${base}/early.txt`, { agent: false });
req.on("error", () => {}); // destroyed before any answer
await until(() => asked && responses.length === 1, 5000);
const gone = responses.length === 1 && new Promise((r) => responses[0].once("close", () => r(true)));
req.destroy();
const sawGo = gone && (await Promise.race([gone, new Promise((r) => setTimeout(() => r(false), 5000))]));
release();
await until(() => opened !== null, 5000);
await until(() => openOn(early) === 0, 1000);
const earlyLeft = openOn(early);
fs.open = realOpen;
dc.unsubscribe("http.server.request.start", seeRequest);
check("a client gone before the file opens leaves no descriptor open (within 1 s of the open)",
  asked && sawGo === true && typeof opened === "number" && earlyLeft === 0, { asked, sawGo, opened, earlyLeft });
await s.close();
const cli = (args) => spawnSync(process.execPath, [path.join(REPO, "web/serve.mjs"), ...args], { encoding: "utf8", timeout: 5000 });
let p = cli(["--port", "8731"]);
check("port 8731 is refused (it belongs to the Python course)", p.status === 2 && p.stdout.includes("8731"), p.stdout);
// Exit 2 alone could come from a CLI that skipped the argument and then found no site/; only the usage path prints usage.
p = cli(["--prot", "1"]);
check("an unknown argument is misuse", p.status === 2 && p.stdout.includes("usage:"), p.stdout);
done();
