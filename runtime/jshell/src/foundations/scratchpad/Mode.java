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
package foundations.scratchpad;

/**
 * The four feedback modes a reader can pick with /set feedback, and the prompts each one shows (DERIVATION.md, M1).
 * Declared in the order the real tool lists them in "Available feedback modes".
 */
enum Mode {
  CONCISE("concise", "jshell> ", "   ...> "),
  NORMAL("normal", "\njshell> ", "   ...> "),
  SILENT("silent", "-> ", ">> "),
  VERBOSE("verbose", "\njshell> ", "   ...> ");

  final String word;
  final String prompt;
  final String continuation;

  Mode(String word, String prompt, String continuation) {
    this.word = word;
    this.prompt = prompt;
    this.continuation = continuation;
  }

  /** Whether switching to this mode announces itself ("Feedback mode: verbose"); concise and silent stay quiet. */
  boolean announces() {
    return this == NORMAL || this == VERBOSE;
  }
}
