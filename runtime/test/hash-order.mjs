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
// Black-box: generated programs exercise every insertion path, several resizes and colliding keys,
// and print every iteration view. The pinned JDK's output is the only oracle.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NodeRunner } from "../runner/node-runner.mjs";
import { checkJdk, runJdk } from "./jdk.mjs";
const RUNTIME = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const views = "IO.println(m); IO.println(m.keySet()); IO.println(m.values()); IO.println(m.entrySet()); m.forEach((k, v) -> IO.print(k + \"=\" + v + \";\")); IO.println();";
const words = `"the cat sat on the mat by the door and a dog ran in the yard while birds sang"`;
// "Aa" and "BB" share a hash code, so every string built from them collides: 2^n keys, one bucket.
const collide = (n) => `String[] parts = {"Aa", "BB"}; java.util.List<String> keys = new java.util.ArrayList<>(); keys.add(""); for (int i = 0; i < ${n}; i++) { var nx = new java.util.ArrayList<String>(); for (String k : keys) for (String p : parts) nx.add(k + p); keys = nx; }`;
const programs = {
  put: `var m = new java.util.HashMap<String, Integer>(); for (String w : ${words}.split(" ")) m.put(w, m.getOrDefault(w, 0) + 1); ${views}`,
  merge: `var m = new java.util.HashMap<String, Integer>(); for (String w : ${words}.split(" ")) m.merge(w, 1, Integer::sum); ${views}`,
  compute: `var m = new java.util.HashMap<String, Integer>(); for (String w : ${words}.split(" ")) m.compute(w, (k, v) -> v == null ? 1 : v + 1); ${views}`,
  computeIfAbsent: `var m = new java.util.HashMap<String, Integer>(); for (String w : ${words}.split(" ")) m.computeIfAbsent(w, String::length); ${views}`,
  putIfAbsent: `var m = new java.util.HashMap<String, Integer>(); for (String w : ${words}.split(" ")) m.putIfAbsent(w, w.length()); ${views}`,
  removeReadd: `var m = new java.util.HashMap<String, Integer>(); for (String w : ${words}.split(" ")) m.put(w, 1); m.remove("cat"); m.remove("the"); m.put("the", 2); m.put("cat", 3); ${views}`,
  integers: `var m = new java.util.HashMap<Integer, Integer>(); for (int i = -40; i < 300; i += 7) m.put(i * 31, i); ${views}`,
  resizes: `var m = new java.util.HashMap<String, Integer>(); for (int i = 0; i < 2000; i++) m.put("k" + (i * 7919 % 2003), i); IO.println(m.keySet().stream().limit(40).toList()); int h = 0; for (String k : m.keySet()) h = 31 * h + k.hashCode(); IO.println(h);`,
  capacity: `var m = new java.util.HashMap<String, Integer>(3); for (String w : ${words}.split(" ")) m.put(w, 1); ${views}`,
  collidingSmall: `${collide(3)} var m = new java.util.HashMap<String, Integer>(); for (String k : keys) m.put(k, k.length()); ${views}`,
  collidingTreeified: `${collide(6)} var m = new java.util.HashMap<String, Integer>(); for (int i = 0; i < 100; i++) m.put("pad" + i, i); for (String k : keys) m.put(k, 1); IO.println(m.keySet());`,
  hashSet: `var s = new java.util.HashSet<String>(); for (String w : ${words}.split(" ")) s.add(w); s.remove("dog"); s.add("zebra"); IO.println(s); for (String w : s) IO.print(w + " "); IO.println();`,
  nonAscii: `var m = new java.util.HashMap<String, Integer>(); for (String w : "café naïve résumé jalapeño 😀 Ωμέγα".split(" ")) m.put(w, w.length()); ${views}`,
};
checkJdk();
const runner = new NodeRunner(process.env.JF_DIST || path.join(RUNTIME, "dist", "fork"));
let bad = 0;
for (const [name, body] of Object.entries(programs)) {
  const src = `void main() { ${body} }`;
  const fork = await runner.compileAndRun(src, { deadlineMs: 20000 });
  const jdk = runJdk(src, "", path.join(RUNTIME, ".work", "hash-order", name));
  const ok = fork.status === "ok" && jdk.status === "ok" && fork.stdout === jdk.stdout;
  if (!ok) bad++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${name}${ok ? "" : `\n        fork: ${JSON.stringify(fork.stdout.slice(0, 200))} (${fork.status})\n        jdk : ${JSON.stringify(jdk.stdout.slice(0, 200))} (${jdk.status})`}`);
}
await runner.close();
console.log(bad ? `\n${bad} program(s) iterate differently from the JDK` : "\nHashMap and HashSet iterate exactly as the JDK does");
process.exit(bad ? 1 : 0);
