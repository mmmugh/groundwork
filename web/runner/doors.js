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
// D86: once a worker has loaded what it needs, it closes every door to the network, so a reader's program talks to
// nobody. A door is removed from the worker's global object and from every object up its prototype chain. FontFace
// and fonts are doors too: a worker's FontFace fetches its url() when loaded, through itself or through fonts.load().
// XMLHttpRequest stays as a stub whose send() fails as XHR fails on a computer with no network, so a request never
// leaves. The runtime's java.net no longer reaches it: an http(s) connection throws before any XHR (patch teavm-0018);
// the doors are the defense for every other path.
// import() cannot be removed. Nothing a reader writes can call it, behind two barriers: org.teavm.jso is not in the
// compile classlib (S1, D46, patch teavm-javac-0106), so a box cannot name TeaVM's JavaScript interop, and a box cannot
// declare a class in org.teavm or in a package under it (C-1, runtime/runner/tjava-core.js), so it cannot declare its
// own JSBody or Import either, which TeaVM would honor.
export const DOORS = ["fetch", "WebSocket", "WebSocketStream", "WebTransport", "EventSource", "Worker", "SharedWorker",
  "importScripts", "caches", "CacheStorage", "Cache", "FontFace", "fonts"];

class OfflineXMLHttpRequest {
  open() {}
  setRequestHeader() {}
  overrideMimeType() {}
  abort() {}
  getAllResponseHeaders() { return ""; }
  getResponseHeader() { return null; }
  send() { throw new DOMException("This course's programs have no network.", "NetworkError"); }
}

// Every call removes the doors and then checks every one, so no call returns with a door reachable. A second call on a
// closed worker must return quietly, since the compile worker closes its doors each time its handler says ready (once
// per init): its removals find nothing left to remove, and the stub, which cannot be removed again, is installed only
// where it is absent. The stub is never taken as proof that the doors are closed: it goes in before the final check.
export function closeNetworkDoors(scope = globalThis) {
  const remove = (name) => {
    for (let o = scope; o !== null; o = Object.getPrototypeOf(o))
      if (Object.prototype.hasOwnProperty.call(o, name) && !delete o[name]) throw new Error(`cannot remove ${name}`);
  };
  for (const name of DOORS) remove(name);
  if (scope.XMLHttpRequest !== OfflineXMLHttpRequest) {
    remove("XMLHttpRequest");
    Object.defineProperty(scope, "XMLHttpRequest", { value: OfflineXMLHttpRequest, writable: false, configurable: false });
  }
  for (const name of DOORS) if (name in scope) throw new Error(`${name} is still reachable`);
}
