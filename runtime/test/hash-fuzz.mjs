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
// Black-box, beside hash-order.mjs: generated HashMap and HashSet programs from a fixed seed, so every run
// checks the same programs. Each prints the iteration order after every operation, so a divergence shows
// at the operation that caused it. The pinned JDK's output is the only oracle. The programs reach the
// parts of teavm-0011 that hash-order.mjs's fixed programs do not:
//   - a crowded bucket that became a tree, emptied again by map.remove, an iterator, keySet().remove and
//     removeIf, with keys put back in between;
//   - such a bucket split in two when the table doubles, the halves as uneven as the generator can make;
//   - the table size chosen by new HashMap<>(m), putAll into a new or a used map, new HashSet<>(c) and
//     addAll, for every source size up to 120 and several requested capacities and load factors;
//   - merge, compute and computeIfAbsent crowding one bucket, in tables that are too small to hold a tree
//     and in ones that are not, next to put and putIfAbsent;
//   - a function that changes the map during computeIfAbsent, compute or merge, and a null function.
// Every crowded bucket holds keys of one Comparable class: for colliding keys of one non-Comparable
// class, the JDK's order was seen to move with unrelated allocations (teavm-0011's known limit; other
// mixes of key classes were not tried). Keys of the record CK carry
// the hash code they are given, which is how a scenario crowds one bucket on purpose.
//   node runtime/test/hash-fuzz.mjs      (JF_DIST points it at another build, as for the other gates)
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NodeRunner } from "../runner/node-runner.mjs";
import { checkJdk, runJdk } from "./jdk.mjs";
const RUNTIME = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const PROGRAMS = 40;

// A fixed seed: change it and the programs change, so the test is the same one on every run.
let seed = 20260928;
const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x80000000; };
const ri = (n) => Math.floor(rnd() * n);
const pick = (a) => a[ri(a.length)];
const shuffled = (n) => { const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = ri(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
// n distinct key names in no particular order, so compareTo's order is not the insertion order
const names = (prefix, n) => { const s = new Set(); while (s.size < n) s.add(`${prefix}${ri(1000)}`); return [...s]; };
const ck = (name, h) => `new CK("${name}", ${h})`;
let fresh = 0; // numbers the keys a scenario adds later, so no name is used with two hash codes
const show = "IO.println(m.keySet());";

// A bucket of 10 to 21 keys in a table of 64 (a tree), emptied in a random order by every kind of removal.
function treeRemoval() {
  const b = ri(64), ks = names("t", 10 + ri(12)).map((n) => ck(n, b + 64 * ri(8)));
  const L = [`HashMap<CK, Integer> m = new HashMap<>(64); CK[] K = { ${ks.join(", ")} };`,
    `for (CK k : K) { m.put(k, 1); ${show} }`];
  for (const i of shuffled(ks.length)) {
    const k = `K[${i}]`;
    L.push(pick([`m.remove(${k});`, `m.remove(${k});`,
      `for (var it = m.keySet().iterator(); it.hasNext();) if (it.next().equals(${k})) it.remove();`,
      `m.keySet().remove(${k});`, `m.entrySet().removeIf(e -> e.getKey().equals(${k}));`,
      `m.remove(${k}); m.put(${k}, 2); m.remove(${k});`, `m.put(${ck(`z${fresh++}`, b + 64 * ri(8))}, 3);`]) + " " + show);
  }
  return L;
}

// A tree of 9 to 22 keys in a table of 64, then enough other keys to double the table once or twice. The
// crowded keys' hashes differ above bit 6, which picks the half each goes to; `hi` says how many at most.
function treeSplit() {
  const b = ri(64), n = 9 + ri(14), hi = pick([0, 1, 3, 6, 7, n]);
  let odd = 0;
  const ks = names("s", n).map((name) => {
    let j = 2 * ri(8);
    if (odd < hi && ri(2) === 0) { j += 1; odd++; }
    return ck(name, b + 64 * j);
  });
  const fill = 45 + ri(120);
  const L = [`HashMap<CK, Integer> m = new HashMap<>(64); CK[] K = { ${ks.join(", ")} };`,
    `for (CK k : K) m.put(k, 1); ${show}`,
    `for (int i = 0; i < ${fill}; i++) { m.put(new CK("f" + i, (i * 7919) % 100003), i); if (i % 4 == 3) ${show} }`, show];
  for (const i of shuffled(n).slice(0, 1 + ri(n))) L.push(`m.remove(K[${i}]); ${show}`);
  return L;
}

// The table size a copy or a bulk add chooses shows in the order it iterates, so print each one.
function sizing() {
  const type = pick(["Integer", "String", "CK"]), s = ri(4) === 0 ? ri(8) : ri(121);
  const key = type === "Integer" ? () => `${ri(4000) - 1000}` : type === "String" ? () => `"w${ri(5000)}"` : () => ck(`c${ri(100000)}`, ri(1 << 20));
  const seen = new Set(), ks = [];
  while (ks.length < s) { const k = key(); const id = type === "CK" ? k.split('"')[1] : k; if (!seen.has(id)) { seen.add(id); ks.push(k); } }
  const cap = pick([0, 1, 2, 3, 16, 17, 64, 100]), lf = pick(["0.5f", "0.75f", "1f", "2f"]);
  const extra = type === "Integer" ? "-5000" : type === "String" ? '"extra"' : ck("extra", 7);
  const t = type;
  return [`${t}[] K = { ${ks.join(", ")} }; var src = new LinkedHashMap<${t}, Integer>(); for (${t} k : K) src.put(k, 1);`,
    `IO.println(new HashMap<>(src).keySet());`,
    `{ var m = new HashMap<${t}, Integer>(${cap}); m.putAll(src); ${show} }`,
    `{ var m = new HashMap<${t}, Integer>(${cap}, ${lf}); m.putAll(src); ${show} }`,
    `{ var m = new HashMap<${t}, Integer>(${cap}); m.put(${extra}, 0); m.putAll(src); ${show} }`,
    `{ var m = new HashMap<${t}, Integer>(); m.putAll(new HashMap<>(src)); m.putAll(src); m.put(${extra}, 0); ${show} }`,
    `IO.println(new HashMap<>(new HashMap<>(src)).keySet());`,
    `IO.println(new HashSet<>(src.keySet()));`,
    `IO.println(new HashSet<>(Arrays.asList(K)));`,
    `{ var s = new HashSet<${t}>(${cap}); s.addAll(Arrays.asList(K)); IO.println(s); }`];
}

// merge, compute and computeIfAbsent crowding one bucket (these keys collide in every table size up to
// 1024), in tables below and at 64 buckets, mixed with put and putIfAbsent, then emptied by the family.
function computeThreshold() {
  const cap = pick([2, 16, 32, 64, 64]), b = ri(cap), ks = names("m", 7 + ri(10)).map((n) => ck(n, b + 1024 * ri(4)));
  const L = [`HashMap<CK, Integer> m = new HashMap<>(${cap}); CK[] K = { ${ks.join(", ")} };`];
  ks.forEach((_, i) => L.push(pick([`m.merge(K[${i}], 1, Integer::sum);`, `m.compute(K[${i}], (k, v) -> v == null ? 1 : v + 1);`,
    `m.computeIfAbsent(K[${i}], k -> 1);`, `m.computeIfAbsent(K[${i}], k -> 1);`, `m.put(K[${i}], 1);`, `m.putIfAbsent(K[${i}], 1);`]) + " " + show));
  for (const i of shuffled(ks.length).slice(0, ri(ks.length))) {
    L.push(pick([`m.compute(K[${i}], (k, v) -> null);`, `m.computeIfPresent(K[${i}], (k, v) -> null);`,
      `m.merge(K[${i}], 1, (a, c) -> null);`, `m.computeIfAbsent(K[${i}], k -> null);`, `m.computeIfPresent(K[${i}], (k, v) -> v + 1);`]) + " " + show);
  }
  return L;
}

// A mix of every operation on one map, as the black-box fuzz that tuned teavm-0011 did.
function mixed() {
  const mode = pick(["ck", "string", "int"]), n = 10 + ri(60), hot = [0, 64, 128, -2147450880, -1, 1, 65, 5, 7, 1031];
  const k0 = mode === "string" ? () => JSON.stringify(pick(["the", "cat", "Aa", "BB", "AaAa", "AaBB", "BBAa", "BBBB", "AaAaAa", "BBBBBB", "", "café", `x${ri(60)}`, `y${ri(60)}`]))
    : mode === "int" ? () => `${pick([ri(100), ri(100000) - 50000, ri(64) * 64, ri(8) * 65536])}` : null;
  const ks = mode === "ck" ? names("k", n).map((nm) => ck(nm, ri(3) === 0 ? ri(0x7fffffff) - 0x40000000 : pick(hot))) : Array.from({ length: n }, k0);
  const t = mode === "string" ? "String" : mode === "int" ? "Integer" : "CK";
  const L = [`HashMap<${t}, Integer> m = ${pick(["new HashMap<>()", `new HashMap<>(${pick([0, 1, 3, 16, 64])})`, `new HashMap<>(${pick([1, 16])}, ${pick(["0.5f", "2f"])})`])}; ${t}[] K = { ${ks.join(", ")} };`];
  for (let s = 0; s < 30 + ri(40); s++) {
    const k = `K[${ri(n)}]`;
    L.push(pick([`m.put(${k}, ${s});`, `m.putIfAbsent(${k}, ${s});`, `m.merge(${k}, 1, Integer::sum);`, `m.compute(${k}, (a, v) -> v == null ? ${s} : v + 1);`,
      `m.computeIfAbsent(${k}, a -> ${s});`, `m.remove(${k});`, `m.entrySet().removeIf(e -> e.getValue() % ${2 + ri(5)} == 0);`,
      `{ var src = new LinkedHashMap<${t}, Integer>(); for (int i : new int[] {${Array.from({ length: ri(12) }, () => ri(n)).join(",")}}) src.put(K[i], i); m.putAll(src); }`,
      `m = new HashMap<>(m);`]) + " " + show);
  }
  L.push("IO.println(m); m.forEach((a, v) -> IO.print(a + \";\")); IO.println();");
  return L;
}

// Functions that change the map while merge, compute or computeIfAbsent runs, and a null function.
const faults = [`HashMap<String, Integer> m = new HashMap<>(Map.of("a", 1, "b", 2));`,
  ...[`m.computeIfAbsent("c", k -> { m.put("x", 9); return 3; })`, `m.compute("d", (k, v) -> { m.remove("a"); return 4; })`,
    `m.merge("b", 5, (x, y) -> { m.put("y", 8); return x + y; })`, `m.computeIfAbsent("e", null)`, `m.merge("b", null, Integer::sum)`]
    .map((call) => `try { ${call}; IO.println("returned"); } catch (RuntimeException e) { IO.println(e.getClass().getName()); } ${show}`)];

const prelude = `import java.util.*;
record CK(String n, int h) implements Comparable<CK> {
  public int hashCode() { return h; }
  public boolean equals(Object o) { return o instanceof CK k && k.n.equals(n); }
  public String toString() { return n; }
  public int compareTo(CK o) { return n.compareTo(o.n); }
}
`;
checkJdk();
const runner = new NodeRunner(process.env.JF_DIST || path.join(RUNTIME, "dist", "fork"));
let bad = 0;
for (let p = 0; p < PROGRAMS; p++) {
  const parts = [treeRemoval(), treeSplit(), sizing(), computeThreshold(), mixed(), ...(p === 0 ? [faults] : [])];
  const src = prelude + `void main() { ${parts.map((_, i) => `s${i}();`).join(" ")} }\n`
    + parts.map((body, i) => `static void s${i}() {\n${body.join("\n")}\n}`).join("\n") + "\n";
  const fork = await runner.compileAndRun(src, { deadlineMs: 60000 });
  const jdk = runJdk(src, "", path.join(RUNTIME, ".work", "hash-fuzz", `p${p}`));
  const ok = fork.status === "ok" && !fork.stderr && jdk.status === "ok" && fork.stdout === jdk.stdout;
  const lines = jdk.stdout.split("\n").length - 1;
  if (ok) { console.log(`  ok    program ${p} (${lines} lines)`); continue; }
  bad++;
  const a = fork.stdout.split("\n"), b = jdk.stdout.split("\n");
  let i = 0; while (i < a.length && a[i] === b[i]) i++;
  console.log(`  FAIL  program ${p}: fork ${fork.status}, jdk ${jdk.status}; first difference at output line ${i + 1}`
    + ` (source in .work/hash-fuzz/p${p}/Main.java)\n        fork: ${(a[i] ?? "").slice(0, 240)}\n        jdk : ${(b[i] ?? "").slice(0, 240)}`
    + (fork.stderr ? `\n        fork stderr: ${fork.stderr.split("\n")[0]}` : "")
    + (fork.compile && !fork.compile.ok ? `\n        compile: ${JSON.stringify(fork.compile).slice(0, 400)}` : ""));
}
await runner.close();
console.log(bad ? `\n${bad} of ${PROGRAMS} programs iterate differently from the JDK` : `\nall ${PROGRAMS} programs iterate exactly as the JDK does`);
process.exit(bad ? 1 : 0);
