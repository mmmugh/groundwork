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
// A Web Worker for the fork. The page starts it as a module worker, ?role=compile or ?role=run. It is the
// browser twin of runtime/runner/node-worker-entry.mjs: the handlers are the shared ones in worker-protocol.js,
// and only the transport (self.postMessage, e.data) and byte loading (fetch) differ. Once it has loaded what it needs,
// it closes its doors to the network (doors.js, D86), so a reader's program talks to nobody.
import { compileWorker, runWorker } from "./worker-protocol.js";
import { closeNetworkDoors } from "./doors.js";
import { load } from "../runtime/compiler.wasm-runtime.js";
const post = (m, t) => self.postMessage(m, t || []);
const fetchBytes = async (url, init) => {
  const r = await fetch(url, init);
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return new Int8Array(await r.arrayBuffer());
};
const role = new URL(self.location.href).searchParams.get("role");
// Both wasm files go by bytes, never by URL: TeaVM's loader compiles a URL with WebAssembly.compileStreaming, which
// needs Content-Type: application/wasm, and a server that has no .wasm type (nginx 1.18 and older) would break the
// page. Bytes need no type (D85). The compile worker's compiler.wasm arrives as a URL in "init" and is fetched here
// before the shared handler loads it; the run worker fetches the deobfuscator once, before it says it has spawned.
// The loader takes compiler.wasm as bytes, but the deobfuscator only as a compiled WebAssembly.Module (given bytes it
// would get {module, instance} back where it expects an instance), so that one is compiled here, as the loader compiles it.
const loadBytes = async (wasm, options) => load(typeof wasm === "string" ? await fetchBytes(wasm) : wasm, options);
let handle;
// The compile worker's doors close when the shared handler says ready, before ready goes out: init has fetched all it
// needs by then. A door that cannot be closed throws there, so the handler fails and the worker posts fatal instead.
if (role === "compile") handle = compileWorker(loadBytes, fetchBytes, (m, t) => { if (m.type === "ready") closeNetworkDoors(); post(m, t); });
else {
  let deobfuscator = null;
  try {
    // Bounded (C-3): the page waits for spawned before it runs a program, so a request that never answers (a hung
    // server) must not hold the run forever. The file is 36,608 bytes; given up after 10 s, the run goes on without it.
    const bytes = await fetchBytes(new URL("../runtime/compiler.wasm-deobfuscator.wasm", self.location).href,
      { signal: AbortSignal.timeout(10_000) });
    deobfuscator = await WebAssembly.compile(bytes, { builtins: ["js-string"] });
  } catch (err) { console.warn("Could not load deobfuscator", err); } // as TeaVM's loader does: the run goes on, with frames it cannot name
  // A run worker closes its doors before it says it has spawned. One that cannot answers its run fatal, never running
  // the program with a door open (the page waits for spawned before it sends a run, so the fatal goes with the run).
  let stuck = null;
  try { closeNetworkDoors(); } catch (err) { stuck = err; }
  const run = runWorker(load, post);
  handle = stuck ? async () => { throw stuck; } : (msg) => run({ ...msg, deobfuscator });
}
self.onmessage = (e) => handle(e.data).catch((err) => post({ type: "fatal", message: String((err && err.stack) || err) }));
post({ type: "spawned" });
