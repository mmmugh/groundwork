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
// Where the pinned Temurin JDK is, on a Mac (the archive unpacks to <jdk>/Contents/Home) and on Linux (the bare
// directory). runtime/jshell/build.sh resolves its JDK the same way; the tests take theirs from here.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const JDK = path.join(path.dirname(fileURLToPath(import.meta.url)), ".work/jdk25/jdk-25.0.4.1+1");

/** JF_JAVA_HOME if set, else <jdk>/Contents/Home if it exists, else <jdk> itself. */
export function javaHome() {
  if (process.env.JF_JAVA_HOME) return process.env.JF_JAVA_HOME;
  const mac = path.join(JDK, "Contents/Home");
  return fs.existsSync(mac) ? mac : JDK;
}

/** The path of one of the JDK's tools: javaBin("java"), javaBin("javac"). */
export function javaBin(name) {
  return path.join(javaHome(), "bin", name);
}
