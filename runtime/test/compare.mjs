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
// What is compared: status, stdout, and for an uncaught exception the first stderr line and the
// program's own stack frames. Those are the stderr lines "\tat ...(Main.java:N)", the frames of Main and
// its nested, local and anonymous classes (every class of a program is compiled from Main.java), which
// the course teaches students to read. Library frames are left out on purpose: they name the library's
// own files and lines (TeaVM's TInteger.java where the JDK has java.base/.../Integer.java), which no
// course page asks anyone to read. The frames are kept only for an uncaught outcome, so other outcomes
// compare (and are recorded) as before.
export const programFrames = (stderr) => stderr.split("\n").filter((l) => /^\tat .*\(Main\.java(:\d+)?\)$/.test(l));
export function outcome(r) {
  if (r.status === "compile-error") return { status: "compile-error", stdout: "", stderrHead: "" };
  const stderr = r.stderr ?? "";
  const stderrHead = stderr.split("\n")[0];
  const status = stderrHead.startsWith("Exception in thread") ? "uncaught"
    : r.status === "ok" ? "ok" : r.status;
  return status === "uncaught" ? { status, stdout: r.stdout ?? "", stderrHead, frames: programFrames(stderr) }
    : { status, stdout: r.stdout ?? "", stderrHead: "" };
}
export const jdkOutcome = (j) => j.status === "uncaught"
  ? { status: j.status, stdout: j.stdout, stderrHead: j.stderrHead, frames: programFrames(j.stderr) }
  : { status: j.status, stdout: j.status === "compile-error" ? "" : j.stdout, stderrHead: "" };
export const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
