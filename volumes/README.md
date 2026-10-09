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
    _solutions.md               worked solutions (never published)
  practice/
    ch01-<slug>-practice.md   practice pages, one per chapter that has one
  quizzes/
    ch01-quiz.txt              published as-is, one per chapter that has one
  answer-keys/
    ...                        anything here, at any depth, is never published
```

`practice/`, `quizzes/`, `answer-keys/` and `content/_solutions.md` are all optional: a volume with
none of them still builds and still runs every gate, including the private-content scan. A practice
page's file name must start with its chapter's own `chNN-` prefix (the same digits as the chapter
file, e.g. `ch02-...`) so the build can place it on that chapter's shelf; anything else in `content/`
that isn't `00-`, `chNN-`, `99-` or an underscore-prefixed data file is a build error.

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
| `"raises": "java.lang.ArrayIndexOutOfBoundsException"` | The box is expected to throw this exception (a fully qualified name); needs `why`. |
| `"compileError": "..."` | The box is expected to fail to compile with this message; needs `why`. Exempted from the vocabulary gate only if it truly fails to compile. |
| `"varies": true` | The stated output is not exactly reproducible (e.g. `Set.of` iteration order); the box compiles and runs once to ok, and its stated output is not checked against anything. Needs `why`. |
| `"stdin": ["21"]` | The typed answers an input box receives, in order, one per prompt. |
| `"why"` | Required alongside `raises`, `compileError` or `varies`; explains the exemption. It is not private: it is shown to readers as a note above the box, and in the downloaded bundle, except on a box whose check has a `starter`, where it explains the author's fence and so is published nowhere (see the starter rule). |

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
| `method` | `name`, `returns`, `params`, `cases`, optional `starter` | Check calls the method `name` with each case and compares what it returns. `returns` is the return type (never `void`); `params` is the list of parameter types, such as `["int"]`; `cases` is a non-empty list of `["<arguments>", "<expected>"]`, such as `["4", "true"]`. The page lists the cases under the box as "What it should do", such as `isEven(4) -> true`. |
| `input` | `runs`, optional `starter` | Each run types its `typed` answers (a list of strings, one per prompt) and looks for at least one of: `numbers` (decimals written as text, such as `"42"`, `"-8"` or `"2.5"`, found in order within 0.005; digits only, with an optional leading `-` and decimal part, because that is the only form the page can find in a program's output, so `"1e3"`, `"+2"` and `".5"` are build errors), `words` (found in order, any case; each one word of letters or digits, such as `"many"` or `"café"`, because the page splits the output at every other character, so `"New York"` and `"can't"` are build errors) or `contains` (text the output must hold as written), however the program words the rest. |
| `output` | `expected`, optional `starter` | The program's output must be `expected`, compared after both are tidied as a stated output is (above: line endings become LF, and spaces and tabs at the end of a line and blank lines at the start and end are ignored); any other difference fails. |
| `predict` | none | The reader reads the code and says what it prints; the answer is the box's own stated output, which the audit has already verified, and the two are compared after the same tidying as an `output` check. A predict box needs a stated output, and cannot be `varies`, `raises`, `compileError` or `stdin`. |

A check on a reference box, on no such box, of an unknown kind, or with a key its kind does not take is
a build error. The three-way proof that each check's verdicts are right (DESIGN.md section 3) is not
built yet.

**The starter rule.** A `starter` is the code the reader starts from, held to the same vocabulary rule as
everything else below. When a check declares one, the box shows the starter, and its own fence, the
author's answer, is published nowhere: the page's editor and `site/boxes.json`'s `source` both carry the
starter, and the box has no file in the downloadable bundle. Nothing that describes the author's fence
is published with the starter either, since the starter does not print or do what the fence does: the
page shows no stated output under the box, and its `site/boxes.json` entry has `expected` `null`,
`stdin` `[]`, `raises` and `compileError` `null`, `varies` `false` and `why` `null` (no note above the box
shows it, since it explains the author's fence). The
audit still runs the author's fence and compares it with the box's stated output fence, exactly as for
any other box. The build fails with
`the page would publish the worked solution; give its check a "starter"` when the code a box publishes
(its starter, or its own fence when it has none) is, once tidied, a fence under that box's own `## <id>`
in `_solutions.md`.

**What reaches the page.** `_checks.json` itself is never published. Each check travels only inside its
own box, in the box's `data-check` attribute, with just what that check needs: a method check's `name`,
`returns`, `params` and `cases`; an input check's `runs`; an output check's `expected`; a predict box's
answer. The `starter` is never in it (the box already shows it as its code). `site/boxes.json` carries
only each check's `"kind"`, as `{"kind": "..."}`, and a predict box's `expected` there is `null`, so no
single file holds every check's answers. The accepted cost (D37): view-source on a page shows a box's own
expected values, a predict box's answer included. Never put anything in a check that the reader must not
see.

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
  asks.
- **Reset**, shown only while the box's code differs from the code the page was built with (after an edit,
  or when a reload brings a kept edit back). It restores the box as the page was built: its code, no output
  and no verdict, and it stops a run or a Check in progress. Until then, the reader's edited code stays in
  the browser's storage (D41), so reloading a page keeps it.

**A `predict` box**: its code is shown, not edited or run. The reader writes what it will print in the
prediction field ("What will it print?") and presses Check, which compares that with the box's stated
output (tidied, as for an `output` check) and then shows the output. A predict box has no Run and no Reset,
and nothing of it is kept.

**The scratchpad**: a tab on every chapter page, beside the boxes, that opens a jshell in the page. Nothing is downloaded
until the reader opens it (DESIGN.md section 2).

In a browser that cannot run Java, a note takes the place of the buttons in every box but a `reference`:
it says so and names the minimum versions, Chrome 119, Firefox 120 and Safari 18.2 (on iPhone and iPad,
iOS 18.2). Support is found by feature, never by the browser's name. The limits of Chromium and Safari are
in DESIGN.md section 2.

## The vocabulary gate

A worked solution, a practice step, or a check's `starter` may not use anything the chapters have not
taught by that point. "Taught by chapter N" is the union, over chapters 1 to N, of every teaching box's
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
in `boxes.json` and never all together in one file; nothing published ever carries `_solutions.md`'s
content, a checked box's own fence when its check has a starter, or anything under `answer-keys/`.
