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
// A box's package statement (C-1). A box in a package runs as the JDK runs it, and a class a box declares in org.teavm
// or in a package under it does not compile: TeaVM gives those names powers no Java program has. It honors an
// annotation named org.teavm.jso.JSBody or org.teavm.interop.Import whoever declares it, so a box declaring its own
// would run JavaScript, or call the host, in its run worker, where import() (which the doors cannot remove) reaches the
// network. S1 keeps org.teavm.jso out of the compile classlib; this keeps a box from declaring it. Every check runs
// with the main class handed to TeaVM by its dotted name, as it must be for a box in a package to run at all, so the
// refusal is what stops these boxes, not a main method TeaVM cannot find. web/test/runner.mjs holds the browser runner
// to the same, in each engine.
//   node runtime/test/packages.mjs        (JF_DIST: the runtime to test)
import { fileURLToPath } from "node:url";
import { NodeRunner } from "../runner/node-runner.mjs";
const DIST = process.env.JF_DIST || fileURLToPath(new URL("../dist/fork/", import.meta.url));
const r = new NodeRunner(DIST);
const results = [];
const check = (label, ok, got) => { results.push(ok); console.log(`  ${ok ? "ok  " : "FAIL"}  ${label}${ok ? "" : "  got " + JSON.stringify(got)}`); };
const run = (src) => r.compileAndRun(src, { deadlineMs: 10000 });
const brief = (o) => ({ status: o.status, stdout: o.stdout, stderr: (o.stderr ?? "").slice(0, 300), compile: o.compile });
// The one line a refused box gets, naming the package its class is declared in (runtime/runner/tjava-core.js).
const refused = (pkg) => `package ${pkg} is reserved for the runtime: a box cannot declare classes in org.teavm or in a package under it`;
const isRefused = (o, pkg) => o.status === "compile-error" && o.compile?.stage === "package"
  && o.compile.diagnostics?.length === 1 && o.compile.diagnostics[0].message === refused(pkg);

const HELLO = (pkg) => `package ${pkg};\npublic class Main {\n  public static void main(String[] args) { System.out.println("Hello"); }\n}\n`;
let o = await run(HELLO("foo"));
check("a box in package foo prints Hello", o.status === "ok" && o.stdout === "Hello\n" && o.stderr === "", brief(o));
o = await run(HELLO("org.teavmx.tools"));
check("a box in package org.teavmx.tools, a name that only begins like org.teavm, prints Hello",
  o.status === "ok" && o.stdout === "Hello\n" && o.stderr === "", brief(o));
o = await run('package foo;\npublic class Main {\n  public static void main(String[] args) {\n    int[] a = new int[1];\n    System.out.println(a[1]);\n  }\n}\n');
// The pinned JDK, given foo/Main.java (`java foo/Main.java`), prints this line and this frame.
check("a box in package foo that throws prints the line and the frame the JDK prints for foo/Main.java",
  o.status === "ok" && (o.stderr ?? "").startsWith('Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 1 out of bounds for length 1\n')
    && (o.stderr ?? "").includes("\tat foo.Main.main(Main.java:5)"), brief(o));

// The panel's box (C-1): its own JSBody, whose script would run in the run worker. Under the guard it never compiles.
const OWN_JSBODY = 'package org.teavm.jso;\nimport java.lang.annotation.*;\n@Retention(RetentionPolicy.CLASS) @Target(ElementType.METHOD)\n' +
  '@interface JSBody { String[] params() default {}; String script(); }\npublic class Main {\n' +
  '  @JSBody(script = "globalThis.jfReached = true; return 7;") static native int go();\n' +
  '  public static void main(String[] args) { System.out.println("go=" + go()); }\n}\n';
o = await run(OWN_JSBODY);
check(`a box that declares its own org.teavm.jso.JSBody does not compile: ${JSON.stringify(refused("org.teavm.jso"))}`,
  isRefused(o, "org.teavm.jso") && o.stdout === "", brief(o));
const OWN_IMPORT = 'package org.teavm.interop;\nimport java.lang.annotation.*;\n@Retention(RetentionPolicy.CLASS) @Target(ElementType.METHOD)\n' +
  '@interface Import { String module() default ""; String name(); }\npublic class Main {\n' +
  '  @Import(module = "teavmJso", name = "global") static native Object global(String name);\n' +
  '  public static void main(String[] args) { System.out.println(global("fetch")); }\n}\n';
o = await run(OWN_IMPORT);
check(`a box that declares its own org.teavm.interop.Import does not compile: ${JSON.stringify(refused("org.teavm.interop"))}`,
  isRefused(o, "org.teavm.interop") && o.stdout === "", brief(o));
o = await run(HELLO("org.teavm"));
check("a box in package org.teavm itself does not compile", isRefused(o, "org.teavm"), brief(o));
o = await run('void main() { IO.println("next"); }');
check("after them, a box with no package statement prints next", o.status === "ok" && o.stdout === "next\n", brief(o));

await r.close();
console.log(results.every(Boolean) ? "\na box runs in its package, never in TeaVM's" : `\n${results.filter((x) => !x).length} failed`);
process.exit(results.every(Boolean) && results.length === 7 ? 0 : 1);
