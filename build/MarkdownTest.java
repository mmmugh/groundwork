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

import java.util.*;

final class MarkdownTest {
  static void testBlocksInDocumentOrder() {
    var b = Markdown.blocks("# Title\r\n\r\nSome *text* here\r\nand more.\r\n\r\n```java\r\nvoid main() {}\r\n```\r\n\r\n- one\r\n- two\r\n");
    T.eq(new Markdown.Heading(1, "Title"), b.get(0), "heading");
    T.eq(new Markdown.Para("Some *text* here\nand more."), b.get(1), "paragraph joins its lines");
    T.eq(new Markdown.Fence("java", "void main() {}\n"), b.get(2), "fence keeps its body, CRLF gone");
    T.eq(new Markdown.Bullets(false, List.of("one", "two")), b.get(3), "list");
    T.eq(4, b.size(), "nothing else");
  }
  static void testAFenceKeepsBlankLinesAndMarkdownInside() {
    var b = Markdown.blocks("```\n# not a heading\n\n* not a list\n```\n");
    T.eq(List.of(new Markdown.Fence("", "# not a heading\n\n* not a list\n")), b, "fence body is literal");
  }
  static void testInlineEscapesThenFormats() {
    T.eq("a &lt;b&gt; &amp; <code>x &lt; y</code> <strong>bold</strong> <em>it</em> <a href=\"https://x.org/?a=1&amp;b=2\">link</a>",
        Markdown.inline("a <b> & `x < y` **bold** *it* [link](https://x.org/?a=1&b=2)"), "inline");
    T.eq("<code>**not bold**</code>", Markdown.inline("`**not bold**`"), "code spans are not formatted");
    T.eq("&quot;quoted&quot;", Markdown.inline("\"quoted\""), "quotes escaped");
  }
  static void testTablesAndQuotesAndOrderedLists() {
    var b = Markdown.blocks("| a | b |\n|---|---|\n| 1 | `x` |\n\n> note\n\n1. first\n2. second\n");
    T.eq(new Markdown.Table(List.of("a", "b"), List.of(List.of("1", "`x`"))), b.get(0), "table");
    T.eq("<table><thead><tr><th>a</th><th>b</th></tr></thead><tbody><tr><td>1</td><td><code>x</code></td></tr></tbody></table>",
        Markdown.html(b.get(0)), "table html");
    T.eq(new Markdown.Quote("note"), b.get(1), "quote");
    T.eq(new Markdown.Bullets(true, List.of("first", "second")), b.get(2), "ordered list");
    T.eq("<ol><li>first</li><li>second</li></ol>", Markdown.html(b.get(2)), "ordered list html");
  }
  static void testAFenceRightAfterATextLineIsNotSwallowed() {
    // CommonMark: a ``` line always ends the current paragraph, blank line or not. Before this was
    // enforced, the fence became literal text inside the paragraph and the box it declared silently
    // vanished from Audit, Vocabulary, the fork gate and the bundle.
    var b = Markdown.blocks("Here it is:\n```java\nvoid main() { IO.println(1); }\n```\n\nNext.\n");
    T.eq(new Markdown.Para("Here it is:"), b.get(0), "paragraph ends before the fence");
    T.eq(new Markdown.Fence("java", "void main() { IO.println(1); }\n"), b.get(1), "fence, not swallowed");
    T.eq(new Markdown.Para("Next."), b.get(2), "paragraph after the fence");
    T.eq(3, b.size(), "nothing else");
  }
  static void testAWrappedLineWithAnInlineCodeSpanDoesNotOpenABogusFence() {
    // Re-review probe: a wrapped paragraph line like "```output``` fence right after it." starts with ```
    // but is not a fence opener under CommonMark (a fence's info string may not itself contain a
    // backtick). Before this was enforced, this line opened a bogus fence that ran to the next real
    // fence's closing line, swallowing the real java fence below it—its box vanished with no error.
    var b = Markdown.blocks("Here it is in an\n```output``` fence right after it.\n\n```java\nvoid main() { IO.println(1); }\n```\n");
    T.eq(new Markdown.Para("Here it is in an\n```output``` fence right after it."), b.get(0), "the whole paragraph, backtick line included");
    T.eq(new Markdown.Fence("java", "void main() { IO.println(1); }\n"), b.get(1), "the java fence still opens");
    T.eq(2, b.size(), "nothing else");
  }
  static void testALineWithAnInlineCodeSpanDoesNotOpenAFenceAtBlockStart() {
    // Same rule applies in the main block loop, not just the paragraph-break check: a line starting a new
    // block that merely starts with ``` (but contains another backtick) is not a fence opener either.
    var b = Markdown.blocks("```output``` is inline, not a fence.\n");
    T.eq(new Markdown.Para("```output``` is inline, not a fence."), b.get(0), "treated as a paragraph, not a fence opener");
    T.eq(1, b.size(), "nothing else");
  }
  static void testAnUnclosedFenceIsAnError() {
    T.fails("unclosed", () -> Markdown.checkedBlocks("```java\nvoid main() {}\n"), "a fence must close");
  }
  static void testAFourBacktickFenceIsAnError() {
    // Markdown's fence opener requires ^```[^`]*$ (right for inline spans: a fence's info string may not
    // itself contain a backtick), so a line of four or more backticks used to match no case at all and fall
    // through into a silent one-line paragraph—the box it declared vanished with no error. checkedBlocks (the
    // real build gate) must instead refuse it. The message names no page: Markdown is handed text, not a
    // file, so Boxes.of and Vocabulary.solutions add the path (BoxesTest, VocabularyTest).
    try {
      Markdown.checkedBlocks("# Ch9 Fixture\n\nHere:\n\n````java\nvoid main() {}\n````\n");
      throw new AssertionError("a four-backtick fence opener is refused: did not fail");
    } catch (BuildError e) {
      T.eq("fences of four or more backticks are not supported (the course uses three)", e.getMessage(),
          "the refusal, with no page title in front of it");
    }
  }
  static void testAFourBacktickFenceRightAfterATextLineIsAlsoCaught() {
    // Same rule as the three-backtick "does not swallow a fence into the preceding paragraph" fix: a
    // four-or-more-backtick line right after a text line, no blank line between, must not be silently
    // absorbed into that paragraph either.
    T.fails("fences of four or more backticks are not supported (the course uses three)",
        () -> Markdown.checkedBlocks("# Ch9 Fixture\n\nHere it is:\n````java\nvoid main() {}\n````\n"),
        "a four-backtick fence right after a text line is still caught, not swallowed");
  }
  static void testAThreeBacktickFenceStillOpensNextToTheFourBacktickRule() {
    var b = Markdown.blocks("```java\nvoid main() {}\n```\n");
    T.eq(new Markdown.Fence("java", "void main() {}\n"), b.get(0), "a plain three-backtick fence still opens a fence");
  }
  static void testAFourBacktickFenceIsSilentInTheLenientParser() {
    // blocks() is for input already known good (e.g. in tests) and must never throw; only checkedBlocks, the
    // real build gate, refuses a four-or-more-backtick fence.
    var b = Markdown.blocks("````java\nvoid main() {}\n````\n");
    T.check(!b.isEmpty(), "the lenient parser does not throw on an oversized fence opener");
  }
  static void testHeadingIdsAreStable() {
    T.eq("<h2 id=\"try-it-now\">Try It, now!</h2>", Markdown.html(new Markdown.Heading(2, "Try It, now!")), "id from text");
  }
}
