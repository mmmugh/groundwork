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
// Keyboard input by replay (D16). A Run goes until the program asks a question it has no answer for; the reader
// answers in place; the program runs again from the start with every answer so far. One seed for the whole Run
// keeps Random and Math.random the same across replays. Works with NodeRunner and BrowserRunner alike.
import { statedStderr } from "./transcript.js";

export class Replay {
  // wasm: the compiled program; run() transfers what it is given, so every run gets a copy.
  // runOptions go to every run (randomSeed, deadlineMs, caps, onOut, onErr, signal); stdin and final are ours. With
  // no randomSeed the Replay picks one, so its replays still share it (the runner draws a fresh one per run without).
  constructor(runner, wasm, runOptions = {}) {
    this.runner = runner;
    this.wasm = wasm;
    this.runOptions = runOptions.randomSeed == null ? { ...runOptions, randomSeed: Math.floor(Math.random() * 2 ** 53) } : runOptions;
    this.answers = [];
    this.pauses = []; // pauses[i]: how much the program had printed when it asked for answer i
    this.result = null;
    this.diverged = false;
  }
  start() { return this.step(false); }
  // Only a Run waiting for an answer takes one; otherwise both do nothing, and nothing runs again.
  async answer(text) {
    if (!this.waiting) return this;
    this.answers.push(text);
    return this.step(false);
  }
  async endInput() { return this.waiting ? this.step(true) : this; } // Ctrl-D: the answers so far are all there will be
  async step(final) {
    const stdin = this.answers.map((a) => a + "\n").join("");
    const before = this.result;
    const r = await this.runner.run(this.wasm.slice(), { ...this.runOptions, stdin, final });
    // A replay must print again exactly what the last run printed before its question.
    if (before?.status === "needs-input" && !r.stdout.startsWith(before.stdout)) this.diverged = true;
    if (r.status === "needs-input") this.pauses[this.answers.length] = r.stdout.length;
    this.result = r;
    return this;
  }
  get waiting() { return this.result?.status === "needs-input"; }
  get segments() {
    const out = [], s = this.result?.stdout ?? "";
    let at = 0;
    for (let i = 0; i < this.answers.length; i++) {
      const p = this.pauses[i];
      if (p === undefined) break; // answered after Ctrl-D or a divergence: nothing more to place
      out.push({ kind: "out", text: s.slice(at, p) }, { kind: "typed", text: this.answers[i] + "\n" });
      at = p;
    }
    out.push({ kind: "out", text: s.slice(at) });
    return out.filter((x) => x.text);
  }
  get transcript() { return this.segments.map((x) => x.text).join(""); }
  get shown() { return this.transcript + statedStderr(this.result?.stderr ?? ""); }
}
