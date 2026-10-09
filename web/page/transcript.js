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
// The build's transcript rules (build/Audit.java: tidy, stdoutFromTranscript, and the stderr half of stated),
// character for character, so the page, the replay test and the build agree on what "the same output" means.
// Java's `$` also matches before a final line terminator, so the blanks before a last U+0085, U+2028 or U+2029
// go too (the lookahead in tidy); the terminator itself stays, as in the build.
export function tidy(s) {
  const lines = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").map((l) => l.replace(/[ \t]+(?=[\u0085\u2028\u2029]?$)/, ""));
  while (lines.length && lines[0] === "") lines.shift();
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines.join("\n");
}
// A stated sample run shows each typed answer on its own line; the program's own stdout does not.
export function stdoutFromTranscript(transcript, typed) {
  let t = tidy(transcript) + "\n";
  let pos = 0;
  for (const answer of typed) {
    const at = t.indexOf(answer + "\n", pos);
    if (at < 0) throw new Error(`the stated sample run does not show the typed answer "${answer}"`);
    t = t.slice(0, at) + t.slice(at + answer.length + 1);
    pos = at;
  }
  return t;
}
// What a terminal shows of stderr after an uncaught exception: its first line and the program's own frames.
// Stderr that starts with anything else shows nothing: a run that wrote to System.err before it threw has no
// order of stdout and stderr to replay once they are captured apart, so the build refuses such a box (D73) and
// none reaches a page.
const OWN_FRAME = /^\tat [^()]*\(Main\.java:\d+\)$/;
export function statedStderr(stderr) {
  if (!stderr.startsWith("Exception in thread")) return "";
  const lines = stderr.split("\n");
  return [lines[0], ...lines.slice(1).filter((l) => OWN_FRAME.test(l))].map((l) => l + "\n").join("");
}
