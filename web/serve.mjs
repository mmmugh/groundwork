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
// The dev server: serves a built site/ on 127.0.0.1 so its pages run as a reader's browser runs them. Static
// files only, and no header but a content type: nothing may need COOP/COEP (D7). Never port 8731. The options beyond
// root and port are test-only and off by default, and the command line takes none of them:
// - types: "plain" knows only .html, .css, .js, .json and .txt by name, octet-stream for anything else, so no .mjs
//   and no .wasm type (stock nginx has no .mjs type, and 1.18 and older no .wasm type), to prove the built site works
//   from a server that knows nothing more (D85);
// - headers: more headers for every response (web/test/harness.mjs sends its test CSP with it, W-18);
// - hook: a function handed each request first, which answers it and returns true, or returns false to leave it to
//   the server (harness.mjs answers the CSP's reports, POST /__csp, with it);
// - prefix: "/groundwork/" serves the root at that path, as GitHub Pages serves a project site, and answers 404 to every
//   path outside it, so a page that reaches for a root-absolute URL fails here as it would there [B14]. It starts and
//   ends with a slash. The hook still sees every request first.
// Without headers, the content type stays the only header.
//   node web/serve.mjs [--root <dir>] [--port <n>]      (defaults: site, 8740; --port 0 picks a free port)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const DEFAULT_PORT = 8740;
const RESERVED = 8731; // the Python course's dev server
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".wasm": "application/wasm",
  ".bin": "application/octet-stream", ".java": "text/plain; charset=utf-8", ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png",
};

// A server that knows only these five types, the least the course needs (D85): stock nginx maps many more, but no .mjs,
// and 1.18 and older no .wasm either, so a page that needed either type would break there.
const PLAIN_TYPES = {
  ".html": "text/html", ".css": "text/css", ".js": "application/javascript", ".json": "application/json",
  ".txt": "text/plain",
};

export function serve({ root, port = DEFAULT_PORT, types, headers = {}, hook = null, prefix = "/" }) {
  if (types !== undefined && types !== "plain") throw new Error(`unknown types option ${JSON.stringify(types)}`);
  if (!/^\/([^/]+\/)*$/.test(prefix)) throw new Error(`prefix must start and end with a slash: ${JSON.stringify(prefix)}`);
  const typeTable = types === "plain" ? PLAIN_TYPES : TYPES;
  if (port === RESERVED) throw new Error(`port ${RESERVED} belongs to the Python course's dev server`);
  const base = fs.realpathSync(root);
  const server = http.createServer((req, res) => {
    if (hook && hook(req, res)) return;
    const notFound = () => res.writeHead(404, { ...headers, "Content-Type": "text/plain; charset=utf-8" }).end("not found\n");
    let rel;
    try { rel = decodeURIComponent(new URL(req.url, "http://localhost").pathname); } catch { return notFound(); }
    if (!rel.startsWith(prefix)) return notFound();
    rel = rel.slice(prefix.length - 1);
    let file = path.join(base, rel);
    if (rel.endsWith("/")) file = path.join(file, "index.html");
    let real;
    try {
      real = fs.realpathSync(file);
      if (!real.startsWith(base + path.sep) || !fs.statSync(real).isFile()) return notFound();
    } catch { return notFound(); }
    // No file inside the root can take the server down: one that vanishes or cannot be read (EACCES) is a 404
    // before anything is sent, or a cut-off response if it fails partway.
    const stream = fs.createReadStream(real);
    // A client that leaves early must not leave the file open until GC: pipe stops reading but never closes it.
    // Registered before the file opens, so a client gone before then is covered too.
    res.on("close", () => stream.destroy());
    stream.on("error", () => (res.headersSent ? res.destroy() : notFound()));
    stream.on("open", () => {
      res.writeHead(200, { ...headers, "Content-Type": typeTable[path.extname(real).toLowerCase()] ?? "application/octet-stream" });
      stream.pipe(res);
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () =>
      resolve({ port: server.address().port, close: () => new Promise((r) => server.close(r)) }));
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  let root = "site", port = DEFAULT_PORT;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--root" && i + 1 < args.length) root = args[++i];
    else if (args[i] === "--port" && /^\d+$/.test(args[i + 1] ?? "")) port = Number(args[++i]);
    else { console.log("usage: node web/serve.mjs [--root <dir>] [--port <n>]"); process.exit(2); }
  }
  if (port === RESERVED) { console.log(`port ${RESERVED} belongs to the Python course's dev server; pick another`); process.exit(2); }
  if (!fs.existsSync(root)) { console.log(`no ${root}: run java build/Build.java first`); process.exit(2); }
  const s = await serve({ root, port });
  console.log(`serving ${root} at http://127.0.0.1:${s.port}/`);
}
