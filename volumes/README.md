# Writing a volume

A volume is one course (`Groundwork` itself, or any other) rooted at `volumes/<slug>/`. This
file is for course authors: the directory layout the build expects, what each declaration key means,
and what stays private. For how the build and its gates run, see the root [README.md](../README.md);
for why the build makes the choices it does, see [DESIGN.md](../DESIGN.md) sections 2 to 4.

## Layout

```
volumes/<slug>/
  volume.json               required: number, title; optional: subtitle, blurb
  content/
    00-*.md                  front matter, published before chapter 1
    ch01-*.md, ch02-*.md...  chapters, published in numeric order
    99-*.md                  appendices, published after the last chapter
    _boxes.json               box declarations (the file is never published; see below for what reaches boxes.json)
    _checks.json               check declarations (the file is never published; see below for what reaches boxes.json)
    _solutions.md               worked solutions and mistakes (the file is never published; see below for the reveal)
  practice/
    ch01-<slug>-practice.md   practice pages, one per chapter that has one
  quizzes/
    ch01-quiz.txt              published as-is and linked from its chapter's page, one per chapter that has one
                               (see Quizzes below)
  answer-keys/
    ch01-answers.txt           each quiz's key (see Quizzes below); anything here, at any depth, is never published
```

`practice/`, `quizzes/`, `answer-keys/` and `content/_solutions.md` are all optional (a quiz and its key come together):
a volume with none of them still builds and still runs every gate, including the private-content scan. A practice page's
file name must start with its chapter's own `chNN-` prefix (the same digits as the chapter file, e.g. `ch02-...`) so the
build can place it on that chapter's shelf; anything else in `content/` that isn't `00-`, `chNN-`, `99-` or an
underscore-prefixed data file is a build error.

Every page's first `# ` heading is its title: the browser's tab, the pager and the index (which lists every page by it,
each chapter's practice pages under that chapter) show it, and a page without one is a build error. A quiz is named
after its chapter's own digits, `chNN-quiz.txt` (a chapter file `ch01-<anything>.md` takes `ch01-quiz.txt`); any other
`*-quiz.txt` is a build error, since no page would link it.

## Boxes

A ` ```java ` fence on a chapter or practice page is a box, numbered by its order on the page:
`<page-slug>#1`, `#2`, and so on. A fence directly after it that is untagged or tagged ` ```output `
is that box's stated output—what the reader is told the box prints.

### `_boxes.json`

Keyed by box id. Every key is optional; an entry may combine `stdin` with `raises`, `compileError` or
`varies`, but not with `reference` (a reference box takes no key but `why`), and `raises` and
`compileError` cannot both be set. A box with no entry runs and must print exactly its stated output.

| Key | Meaning |
| --- | --- |
| `"reference": true` | A syntax reference with nothing to run: no other key but `why` is allowed. |
| `"raises": "java.lang.ArrayIndexOutOfBoundsException"` | The box is expected to throw this exception (a fully qualified name); needs `why`. Its stated output is what a terminal shows: anything it printed first, the exception's first line, and the program's own `at Main...` lines below it. A box that raises `java.lang.StackOverflowError` (a runaway recursion that crashes on purpose, as in chapter 12) states the first line alone, as the browser prints it; the JDK's frames below it are left out of every comparison. |
| `"compileError": "..."` | The box is expected to fail to compile with this message; needs `why`. Exempted from the vocabulary gate only if it truly fails to compile. |
| `"varies": true` | The stated output is not exactly reproducible (e.g. `Set.of` iteration order); the box compiles and runs once to ok, and the build does not compare its stated output with the JDK's. A varies box that also has `stdin` is still replayed by web/test/replay.mjs with the runner's random seed 5, and its stated output must be that replay's transcript. Needs `why`. |
| `"stdin": ["21"]` | The typed answers an input box receives, in order, one per prompt. |
| `"why"` | Required alongside `raises`, `compileError` or `varies`; explains the exemption. It is not private: it is shown to readers as a note above the box, and in the downloaded bundle, except on a box whose check has a `starter`, where it explains the author's fence and so is published nowhere (see the starter rule). |
| `"noCheck": "Any poem is right: run it and read it."` | An exercise whose answers cannot be judged fairly (DESIGN.md section 3): the box has no Check, and the page shows these words under its controls, where Check would be. Not on a reference box, and not on a box with a check in `_checks.json`. Needs a worked solution in `_solutions.md`: with no Check, it is what a reader compares with. It is not private: write it for readers. |

### The transcript rule for input boxes

A box with `stdin` states its output as a full transcript: the reader's typed answers appear on their
own line, in the order `stdin` gives them, exactly where a terminal would echo them. The build strips
each typed line, in that order, to recover what the program itself printed—what its stdout alone
would hold, with no terminal echoing the input back—and checks that against the real run. If a typed
answer's line cannot be found in the stated transcript, in the order given, the build fails.

Before comparison, both the stated output and the real run are tidied: CRLF becomes LF, trailing
whitespace is stripped from every line, and blank lines at either end are dropped. A stated output
with CRLF endings or trailing spaces still matches; a difference inside a line does not.

### `_checks.json`

Keyed by box id, one entry per checked box: the reader edits the box and presses Check. Every entry is
an object with a `"kind"`, and each kind takes only its own keys; every value is Java source text,
written as a JSON string, because the page writes it into generated Java and compares inside Java.

| Kind | Keys | Meaning |
| --- | --- | --- |
| `method` | `name`, `returns`, `params`, `cases`, optional `starter` | Check calls the method `name` with each case and compares what it returns: a `double` within 1e-9 times the larger of 1 and the expected value's size, so a right answer that differs in the last bit passes (a `float` is compared within the same tolerance, which is finer than one `float` step; the course never teaches `float`), and anything else with `Objects.deepEquals`. `returns` is the return type (never `void`); `params` is the list of parameter types, such as `["int"]`; `cases` is a non-empty list of `["<arguments>", "<expected>"]`, such as `["4", "true"]`. The page lists the cases under the box as "What it should do", such as `isEven(4) -> true`. |
| `input` | `runs`, optional `starter` | Each run types its `typed` answers (a list of strings, one per prompt) and looks for at least one of: `numbers` (decimals written as text, such as `"42"`, `"-8"` or `"2.5"`, found in order within 0.005; digits only, with an optional leading `-` and decimal part, because that is the only form the page can find in a program's output, so `"1e3"`, `"+2"` and `".5"` are build errors), `words` (found in order, any case; each one word of letters or digits, such as `"many"` or `"café"`, because the page splits the output at every other character, so `"New York"` and `"can't"` are build errors) or `contains` (text the output must hold as written), however the program words the rest. |
| `output` | `expected`, optional `starter` | The program's output must be `expected`, compared after both are tidied as a stated output is (above: line endings become LF, and spaces and tabs at the end of a line and blank lines at the start and end are ignored); any other difference fails. |
| `predict` | none | The reader reads the code and says what it prints; the answer is the box's own stated output, which the audit has already verified, and the two are compared after the same tidying as an `output` check. A predict box needs a stated output, and cannot be `varies`, `raises`, `compileError` or `stdin`. |

A check on a reference box, on no such box, of an unknown kind, or with a key its kind does not take is
a build error.

**The three-way proof.** `--check` proves every check before it ships (DESIGN.md section 3) with the answers
its box's section of `_solutions.md` gives (below): every worked solution must pass, and every mistake must
fail. A checked box needs two worked solutions, the second in another style, and one mistake, or the build
says which is missing. A `predict` check's answers are text: its stated output is right, and it needs one
more right prediction (a ` ```text ` fence under `## <box id>`) and one wrong one (a ` ```text ` fence under
`### mistake`). Each answer is judged by the page's own Check code (`web/page/check.js`) on the browser
runtime and on the pinned JDK, a prediction once, as text; a wrong verdict fails the build and names the
box, the answer (`worked solution 2`, `mistake 1`), the runtime and what Check said. A `method`, `output` or
`input` check also needs a mistake that compiles: one that fails to compile, or changes the method's signature,
never reaches the check's cases, so a box whose every mistake stops at the compiler fails the build.

Box ids count fences, so a fence added or removed above an exercise moves every key below it onto another box
unless each key is moved too. So a check with a `starter` is proved with two answers more, which tie it to the box it
lands on: the box's own fence, the author's answer, must pass (`the box's own fence`), and the starter, the code the
box publishes, must fail (`the published code`: a starter that already passes is an exercise with nothing to do).
Neither counts toward the two worked solutions and a mistake, nor as the mistake that compiles. A check with no
starter would publish the box's own fence, which may be the answer or the exercise's wrong starting code, so the data
could not say which and could not tie the check to its box: `--check` refuses every check but `predict` that has no
`starter`, and says so (a `predict` check publishes the box's code and has none to carry).

**The starter rule.** A `starter` is the code the reader starts from, held to the same vocabulary rule as
everything else below. When a check declares one, the box shows the starter, and its own fence, the
author's answer, is never what the box shows: the page's editor and `site/boxes.json`'s `source` both carry the
starter, and the box has no file in the downloadable bundle (a reader who wants an answer opens the box's worked
solution, below). Nothing that describes the author's fence
is published with the starter either, since the starter does not print or do what the fence does: the
page shows no stated output under the box, and its `site/boxes.json` entry has `expected` `null`,
`stdin` `[]`, `raises` and `compileError` `null`, `varies` `false` and `why` `null` (no note above the box
shows it, since it explains the author's fence). The
audit still runs the author's fence and compares it with the box's stated output fence, exactly as for
any other box. The build fails with
`the page would publish the worked solution; give its check a "starter"` when the code a box publishes
(its starter, or its own fence when it has none) is, once tidied, a worked solution in that box's own
section of `_solutions.md`, and with `the page would publish <box id>'s worked solution as this box's code` when it
is another box's worked solution on the same page (most often a fence added or removed above it, its keys left
behind); a mistake may be (the unchanged starter is the commonest mistake).

**What reaches the page.** `_checks.json` itself is never published. Each check travels only inside its
own box, in the box's `data-check` attribute, with just what that check needs: a method check's `name`,
`returns`, `params` and `cases`; an input check's `runs`; an output check's `expected`; a predict box's
answer. The `starter` is never in it (the box already shows it as its code). `site/boxes.json` carries
only each check's `"kind"`, as `{"kind": "..."}`, and a predict box's `expected` there is `null`, so no
single file holds every check's answers. The accepted cost (D37): view-source on a page shows a box's own
expected values, a predict box's answer included. Never put anything in a check that the reader must not
see.

### `_solutions.md`

Markdown, keyed by box id: `## <box id>` starts a box's section. The ` ```java ` fences under it, before any
level-3 heading, are its **worked solutions**, each a right answer; the first is the one a reader may reveal, and
the paragraphs right after it, up to the next fence or heading, are its note. `### mistake`, the only level-3
heading a section takes (any other is a build error), starts its **mistakes**: the ` ```java ` fences after it
are realistic wrong answers, and need not compile. A `predict` box's ` ```text ` fences are its predictions, right
ones under the heading and wrong ones under `### mistake` (the three-way proof, above); the build reads no other
fence here. Worked solutions are
held to the starter rule (above) and to the vocabulary gate (below). The first, the one a reader may reveal and copy,
is what Show a solution reveals and the reader runs, so it is a whole compact source file with its `void main`, a
method check's too (Check stubs `main` for a method check, but the reveal does not). It also runs on both runtimes in
`--check`'s fork gate, as `<box id> (worked solution)`, typed its input check's first run's answers, else its box's
`stdin`: the two must agree, and it must run to its end, or end in its box's `raises`, even where no check runs it. A
mistake is never held to the starter
rule; it is held to the vocabulary gate when it compiles (a mistake a reader at that chapter could not write
proves nothing about the check), and let be when it does not.

**What reaches the page.** A box with a worked solution ends with **Show a solution**, shut. Opening it shows
that box's first worked solution and its note, and nothing of any other box: they ride inside the box's own
markup (DESIGN.md section 6, D24, D37), never in `site/boxes.json`, the bundle or any file of every solution. A
second worked solution and every mistake are published nowhere. The accepted cost, as for a check:
view-source on a page shows the first worked solution of each of its boxes.

## What a reader sees

On a built page, a `reference` box is shown as it is. Every other box is one of two kinds.

**A program the reader can edit** (every box that is not a `predict` box), with these controls:

- **Run**. When the program asks a question, the reader types the answer in place and the program runs
  again with the answers so far (DESIGN.md section 2).
- **End input**, shown only while the program waits for an answer. It ends input, as Ctrl-D does at a
  terminal (Ctrl-D in the answer field works too): the program reads no more answers. On a phone, which has
  no Ctrl key, it is the only way.
- **Check**, for a box whose entry `_checks.json` declares one. The verdict appears under the box: for a
  `method` check, one line per case; for `input` and `output`, whether the program did what the check
  asks. A box whose `_boxes.json` entry has `noCheck` has no Check: its words stand under its controls instead.
- **Reset**, shown only while the box's code differs from the code the page was built with (after an edit,
  or when a reload brings a kept edit back). It restores the box as the page was built: its code, no output
  and no verdict, and it stops a run or a Check in progress. Until then, the reader's edited code stays in
  the browser's storage (D41), so reloading a page keeps it.

**A `predict` box**: its code is shown, not edited or run. The reader writes what it will print in the
prediction field ("What will it print?") and presses Check, which compares that with the box's stated
output (tidied, as for an `output` check) and then shows the output. A predict box has no Run and no Reset,
and nothing of it is kept.

**Show a solution**, at the end of a box with a worked solution in `_solutions.md` (an exercise or a practice
step): shut until the reader opens it, it shows that box's first worked solution and its note, and nothing of any
other box.

**The scratchpad**: a tab on every chapter page, beside the boxes, that opens a jshell in the page. Nothing is downloaded
until the reader opens it (DESIGN.md section 2).

**At the end of a chapter's page**, before the links to the previous and next pages: its quiz, when the volume has one
for it, and its programs as `.java` files (its section of `bundle.html`), when it has any to download.

In a browser that cannot run Java, a note takes the place of the buttons in every box but a `reference`:
it says so and names the minimum versions, Chrome 119, Firefox 120 and Safari 18.2 (on iPhone and iPad,
iOS 18.2). Support is found by feature, never by the browser's name. The limits of Chromium and Safari are
in DESIGN.md section 2.

## Quizzes

`quizzes/chNN-quiz.txt` is chapter NN's quiz, published as it is, and `answer-keys/chNN-answers.txt` is its key, never
published; NN is written as the chapter's own file writes it (`ch01`). Every quiz needs its key, every key its quiz, and
a quiz needs its chapter. Both are plain text in the Python course's layout: `GROUNDWORK`, `Chapter N - <title>`, then
the quiz's `Name:` and `Date:` blanks or the key's line `ANSWER KEY` (the words the publishing guard refuses to publish,
so a key that reached `site/` by mistake would stop the build); then the sections `VOCABULARY`, `READING CODE`,
`WRITING CODE` and `WHY IT WORKS`, each underlined with hyphens. A question starts at the margin with its number
right-aligned in two columns (` 5. `, `12. `), its further lines are indented four spaces, and lines wrap at 74 columns.
In the key, each blank's answer follows its question on its own line, `      ANSWER: <answer>` (six spaces). A quiz is
plain ASCII, because a `.txt` cannot say its encoding and a phone may garble anything else: `-` for a dash, `'` and `"`
for curly quotes, `...` for an ellipsis. A quiz never holds an `ANSWER:` line. A line that looks like a numbered
question (a number, a dot and a space, at the margin or a few spaces in) but is not laid out as one (the number
right-aligned in two columns, then a dot and one space) is reported with its file and line, never skipped.

**"What does this print?"** A question whose line is exactly ` N. What does this print?` is run. Its code is the lines
under it indented eight spaces (a blank line inside the code is kept), and in the quiz the place to write follows, four
spaces and 36 underscores. In the key the same question and the same code are followed by one `ANSWER:` line holding
what the program prints: the output's first line after `ANSWER: ` (one space; any further leading spaces are the
program's own), each further line under it indented ten spaces, and a blank line of output as a blank line:

```text
 6. What does this print?

        IO.println("A");
        IO.println();
        IO.println("B");

    ____________________________________
```

```text
 6. What does this print?

        IO.println("A");
        IO.println();
        IO.println("B");

      ANSWER: A

          B
```

Code like this, statements, runs as `main`'s body (`void main() {`, the code indented four spaces, `}`). When a line of
the code starts `void main(` at the code's own margin, the code is a whole compact source file and runs as written; code
that needs a method or an import beside `main` is written that way. `--check` compiles each such question on the pinned
JDK, runs it five times with no input, and requires it to run to its end, print the same every time, print no identity
hash, and print exactly the key's answer, both tidied as a stated output is (above). A key whose answer differs is
reported with where the two first differ and how many lines each has, never the answer or the output itself (the quick
and Pages jobs' logs are public); both in full go to `build/.work/quizzes/chNN-quiz-<question>/differs.txt`, which CI
never uploads. The key must show the quiz's code, so the two cannot drift apart unnoticed, and a question that asks
"does this print" in any other words is reported rather than skipped. So is a question that asks for the output in any
other words ("print" or "output" in its text) and shows code with no blank (`__`) to fill in, which must be worded
exactly "What does this print?" to be run. The code ends at the first line not indented eight spaces, and the next
non-blank line must be the place to write (a quiz) or the `ANSWER:` line (a key); after the answer only a new question,
a section heading or its underline may follow, and any other line is reported with its file and line rather than
ignored. An identity hash in the output (a type-name character, `@`, then hex, such as `[I@1b6d3586`, short or followed
by a word character) is reported as well, since it repeats across starts of one JDK and no JDK promises it; an address
such as `a@b.c` is not one. The code is also held to the vocabulary gate (below). Every other question (a term, code
with a blank in it, a reason) is neither run nor held to the vocabulary gate: the review reads it.

## The vocabulary gate

A worked solution, a practice step, a check's `starter`, a mistake that compiles, or the code of a quiz's "What does
this print?" question may not use anything the chapters have not taught by that point (a quiz for chapter N may use
what chapters 1 to N teach). "Taught by chapter N" is the union, over chapters 1 to N, of every teaching box's
vocabulary on that chapter's own content page—a box marked `reference` or `compileError` teaches
nothing. Vocabulary is derived from `javac`'s own syntax tree, not a word list: syntax kinds, library
members by their owning type, library types, and keywords. A fence exempted with `compileError` still
has to really fail to compile, or the exemption itself is a build error. Because the gate is syntactic,
an idea with no syntax of its own (recursion, say) is not something it can check; that is the review's
job (DESIGN.md section 6), not the build's.

## What is never published

`answer-keys/` (the whole directory, at any depth), `_boxes.json`, `_checks.json` and `_solutions.md`
are never published as files, whether or not the build's whitelist logic would have copied them: the
private-content scan (`Publish.guard`) walks the built `site/` afterward and refuses to ship if it
finds any of them, or any text file containing the literal `ANSWER KEY`, or a `.docx` file whose body
holds `ANSWER KEY` or `Worked solutions`. This runs on every build, whether or not a volume happens to
have practice pages, quizzes or answer keys at all.

This is a statement about the files, not about every byte inside them. `site/boxes.json` deliberately
publishes, per box, `_boxes.json`'s own declared fields (`why`, `raises`, `compileError`, `varies`,
`stdin`, `reference`; for a box whose check has a starter, none of them: each is `null`, `[]` or `false`)
and, from `_checks.json`, only the check's `"kind"`. A box's `why` (on a box without a starter) is also
shown to readers above the box, in `bundle.html`, and in the box's downloaded `.java` file, so write it for
readers. A check's published fields ride in its own box's `data-check` (see `_checks.json` above), never
in `boxes.json` and never all together in one file. Of `_solutions.md`, only each box's first worked
solution and its note are published, inside that box's own Show a solution; nothing published ever
carries a second worked solution, a mistake, a checked box's own fence as its code when its check has a starter,
or anything under `answer-keys/`.
