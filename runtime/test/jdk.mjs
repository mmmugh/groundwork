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
// The reference: the pinned Temurin JDK, run the same way every time.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { javaHome } from "../jdk-home.mjs";
export const JAVA_HOME = javaHome();
export const JAVA = path.join(JAVA_HOME, "bin", "java");
export const JAVA_FLAGS = ["-Dstdout.encoding=UTF-8", "-Dstderr.encoding=UTF-8", "-Dstdin.encoding=UTF-8",
  "-Dfile.encoding=UTF-8", "-Duser.language=en", "-Duser.country=US"];

export function checkJdk() {
  const p = spawnSync(JAVA, ["-version"], { encoding: "utf8" });
  if (p.status !== 0 || !/"25\.0\.4\.1"/.test(p.stderr)) {
    throw new Error(`the pinned JDK 25.0.4.1 is not at ${JAVA}: run runtime/build.sh`);
  }
}

export function runJdk(src, stdin, dir) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "Main.java"), src);
  const p = spawnSync(JAVA, [...JAVA_FLAGS, "Main.java"], { cwd: dir, input: stdin ?? "", encoding: "utf8",
    timeout: 30000, env: { PATH: "/usr/bin:/bin", LANG: "en_US.UTF-8", HOME: process.env.HOME } });
  const stderr = p.stderr ?? "";
  const status = p.status === 0 ? "ok"
    : /error: compilation failed/.test(stderr) ? "compile-error"
    : stderr.startsWith("Exception in thread") ? "uncaught"
    : p.signal ? `killed-${p.signal}` : `exit-${p.status}`;
  return { status, stdout: p.stdout ?? "", stderr, stderrHead: stderr.split("\n")[0] };
}
