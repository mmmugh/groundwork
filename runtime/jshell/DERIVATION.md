# Derivation log: where every output rule of the scratchpad's jshell front end comes from

A citation of a worksheet or one of its checkpoints points at the author's private working notes (D95); J1-J3 are in
DECISIONS.md.

The front end in `src/` was written for decision D55 under the clean room of D14. Nobody working on it opened OpenJDK
source in any form or decompiled the JDK's jshell classes. Every rule it applies comes from one of these:
- the real jshell's observed output, on the pinned JDK 25.0.4.1;
- the real tool's own listings (`/set mode`, `/set prompt`, `/set truncation`);
- the public documentation: the `jdk.jshell` Javadoc, the JVM TI specification for class redefinition, and the JVM
  specification's class-file format.

This file ties each rule the code cites (`DERIVATION.md, X1` and so on) to that evidence.

## How the evidence was gathered, and how to check it

- `test/RealJShell.java` runs the real tool through its public builder (`jdk.jshell.tool.JavaShellToolBuilder`), default
  engine, US locale, empty environment and in-memory settings. It feeds a session's exact lines and splits the record
  per entry by the console's echo of each line. It equals a pty run of the `jshell` binary on 71 of the 72 course
  entries; the 72nd is a typing artifact of the pty's line editor (worksheet checkpoint 2). A session line `@@cancel` is
  the reader's Ctrl-C: it sends the byte 0x03 and waits for the tool's prompt around it (fed all at once, the tool
  honors only a session's first Ctrl-C).
- `derive/EventProbe.java` records what the public `jdk.jshell` API reports for the same snippets (events, statuses,
  values, exceptions, diagnostics with positions), on the default engine and on the local one.
- `derive/observe.mjs SESSION OUT` runs one probe session through four observers: the real tool, the real tool with
  `--execution local`, and the event probe on each engine. The probe sessions are `derive/probes/*.jsh`. Rerun them all
  with `for f in derive/probes/*.jsh; do node derive/observe.mjs $f ../.work/corpus/$(basename $f .jsh); done` from this
  directory, about five minutes. The corpus (`runtime/.work/corpus`) is git-ignored: a fresh clone regenerates it
  this way before `check-observations.mjs` (and `derive/fit/diags.mjs`) can verify anything.
- `derive/observations/*.md` are the eight area reports written from that corpus by probe agents (worksheet checkpoint 3).
- Every evidence line below and in those reports names a session, an entry index and a quoted substring of what was
  recorded there; `real= ""` (a kind followed by `=`) asks for the whole record instead, so "printed nothing" is checked
  rather than assumed (an empty quote is refused). `node derive/check-observations.mjs DERIVATION.md` verifies each one
  against the corpus. Kinds: `real` (the real tool's output), `local` (with `--execution local`), `prompt`, `events`,
  `elocal`, `banner`, `tail`.
- `derive/fit/diags.mjs` fits the error-block rule against every diagnostic in the corpus: 369 of 375 predicted exactly
  under the first hypothesis. The six misses were five artifacts of the event probe and one rule refined by gap probe G1
  (rule E4).
- `test/sweep.mjs` then runs every probe session through the real tool and through this front end on the pinned JDK.
  Every difference left is listed in the check's allowed differences (`test/check.mjs`), so each rule below is also
  confirmed on about 3,000 entries, not only on the cases quoted here.

## Decisions

- **J1, startup imports** (the author, worksheet): the ten imports of the real tool's own `--startup DEFAULT_NO_MODULE_IMPORTS`,
  then `import java.time.*;`. The default `import module java.base;` doubles memory per entry on Ristretto and ends a
  session near entry 62. The listing of that startup comes from the real tool (`/list -start` under that option, worksheet
  checkpoint 2).
- **J2, help** (the author): course-written help, no OpenJDK prose in this Apache-2.0 jar. Every line is behind `|  ` and the
  command list has the real first screen's shape (a usage line, its description behind a tab); the rest is the course's
  own layout.
- **J3, locale** (the author, worksheet checkpoint 7): the scratchpad runs in `en_US`, as a US reader's JDK does. Ristretto's
  VM starts with `en` and no country, so `NumberFormat.getCurrencyInstance()` printed `¤1,234.50` and a `DecimalFormat`
  showed `English` where the JDK shows `$1,234.50` and `English (United States)`. The front end sets the default locale
  and `user.country`; the check pins every JDK run to `en_US` (`-Duser.language=en -Duser.country=US`, and `-R` for the
  real tool's agent), so the proof does not depend on the machine's locale.
- **U1, what is not offered** (this session, under the brief's "anything the real tool does that you do not support says
  so plainly"): `/edit`, `/open`, `/save`, `/env` with options, `/debug`, `/set` other than `feedback`, and the class-path
  options of `/reset` and `/reload` answer `|  <command> is not available in this scratchpad. Type /help to see what is.`
  A browser page has no external editor, no file system the reader can name, and no class path. A bare `/env` lists
  nothing, which is what the real tool lists when no option was set. The course's own words also answer `/help` on a
  topic it has no help for (`|  The scratchpad has no help on <topic>. Type /help to see what it offers.`), a second
  restart inside one pasted entry (R5: `|  Only one /reset or /reload runs per entry in this scratchpad: "<line>" and the
  lines after it did not run.`), and a failure of the front end itself (`|  The scratchpad itself failed (<what was
  thrown>). Use /reset to start over.`), which no session of the check reaches. A program that reads `System.in` gets
  what the reader types next in the real tool; a page cannot hand it anything, since every entry is one call that must
  return, and Ristretto's `System.in` is at its end, so a `Scanner` threw with no explanation. The front end's `System.in`
  (`NoKeyboard`) first prints `|  This scratchpad cannot read keyboard input: System.in is always empty here.`, once
  per entry, and is then at its end as before. The check cannot hold such an entry: the real tool's reference run waits
  for keyboard input that never comes (tried, worksheet checkpoint 8); it was checked by hand natively and on Ristretto.
  A program that calls `System.exit` ends Ristretto's VM and, after it,
  the worker (`Cannot start a runtime from within a runtime`); Ristretto's own front end does the same, the front end
  cannot stop it, and the page has to start a new worker (worksheet report).

## B. The session

- RULE B1: The banner is the two lines below, with the running JDK's `java.version`; the first prompt follows.
  - evidence: feedback-1#0 banner "|  Welcome to JShell -- Version 25.0.4.1\n|  For an introduction type: /help intro\n"
- RULE M1: Each feedback mode has its own prompt and continuation prompt. Normal and verbose use `\njshell> ` and
  `   ...> `; concise uses `jshell> ` and `   ...> `; silent uses `-> ` and `>> `. The real tool's `/set prompt` lists the
  same pairs. The modes are listed in the order concise, normal, silent, verbose.
  - evidence: feedback-1#15 prompt "jshell> |   ...> |   ...> "
  - evidence: feedback-2#15 prompt "-> |>> |>> "
  - evidence: feedback-3#15 prompt "\njshell> |   ...> |   ...> "
  - evidence: feedback-6#2 real "|  /set prompt normal \"\\njshell> \" \"   ...> \"\n|  /set prompt silent \"-> \" \">> \"\n"
  - evidence: feedback-5#0 real "|  Available feedback modes:\n|     concise\n|     normal\n|     silent\n|     verbose\n"

## I. Input lines

- RULE I0: White space at the end of a line does not count: a snippet's source and `/history` drop it.
  - evidence: errors-7#18 real "|  List<String> lc2 = new ArrayList();\n|                     ^-------------^\n"
  - evidence: inspect-5#36 real "\n/vars\n/vars x\n"
- RULE I1: A line is a command only when it starts with `/` (not `//` or `/*`) and no snippet is waiting. With leading
  spaces it is Java and fails as such; inside an open snippet a `/` line continues the snippet.
  - evidence: inspect-5#25 real "|  Error:\n|  illegal start of expression\n|     /list\n|     ^\n"
  - evidence: input-7#9 real "$12 ==> 2\n"
  - evidence: input-7#9 prompt "\njshell> |   ...> "
- RULE I2: A snippet the library rates definitely or considered incomplete waits for the next line under the continuation
  prompt. Anything else is evaluated at once, errors included (an unclosed string literal is reported, not waited for).
  An empty line or a comment alone prints nothing.
  - evidence: input-1#1 prompt "\njshell> |   ...> |   ...> "
  - evidence: input-5#8 prompt "\njshell> |   ...> "
  - evidence: input-1#45 real "|  Error:\n|  unclosed string literal\n|  String u = \"abc\n|             ^\n"
  - evidence: input-1#6 real= ""
  - evidence: input-1#9 real= ""
- RULE I3: Several snippets on one line are evaluated in order, each with its own feedback. The first one rejected, or the
  first one that throws, ends the line: the rest are not run.
  - evidence: input-1#19 real "p ==> 1\nq ==> 2\n$21 ==> 3\n"
  - evidence: input-7#0 real "ok1 ==> 1\n|  Error:\n|  incompatible types: java.lang.String cannot be converted to int\n|   int bad1 = \"s\";\n|              ^-^\n"
  - evidence: input-7#1 real "|    symbol:   variable ok2\n"
  - evidence: input-7#3 real "|    symbol:   variable b5\n"
- RULE I4: A cancel (the reader's Ctrl-C; Ristretto's `cancel()`) forgets the unfinished input, an `/exit` argument still
  being typed included (C9), and prints nothing; the next line starts a new entry. The cancelled lines stay in `/history`.
  Observed through the in-memory driver (probe G29, `@@cancel` in a session file), which sends the byte 0x03 and waits
  for the tool's prompt around it: fed all at once, the tool honors only a session's first Ctrl-C, in terminal mode as
  well (worksheet checkpoint 9). The review that found the gap (a cancel left the `/exit` pending, so the next valid
  expression ended the session) is the Plan 3b controller's.
  - evidence: gaps-20#0 real= ""
  - evidence: gaps-20#1 real "$1 ==> 5\n"
  - evidence: gaps-20#2 real= ""
  - evidence: gaps-20#3 real "$2 ==> 9\n"
  - evidence: gaps-20#4 real= ""
  - evidence: gaps-20#6 real "\n1 +\n2 + 3\n/exit (1 +\n4 + 5\nint q = (\n/history\n"

## H. History

- RULE H1: `/history` prints a blank line, then every line typed, commands included. It leaves out empty lines, lines that
  start with white space, and a line equal to the one before it.
  - evidence: inspect-1#35 real "int square(int n) {\n}\nint square(double d) {\n}\n"
  - evidence: gaps-1#10 real "int g5 = 1\n/history\n"
- RULE H2: A rerun that runs is recorded as the source it reran, not as the command; one that fails is recorded as typed.
  - evidence: session-27#26 real "/set feedback concise\nint d = 1;\n/set feedback silent\nint d = 1;\n/reload\n"

## O. Order of output

- RULE O1: An entry prints the program's own output as it runs; then the snippet's diagnostics, warnings included; then
  its feedback. The library reports diagnostics only after a snippet runs, and so does the tool. The tool's own output
  does not go through the reader's `System.out`: after a snippet replaces it, feedback still shows (probe G26), so the
  front end keeps the stream it started with.
  - evidence: gaps-1#11 real "printed in the block\n|  Warning:\n|  unchecked call to add(E) as a member of the raw type java.util.List\n"
  - evidence: values-9#39 real "side\n$41 ==> 5\n"
  - evidence: gaps-17#3 real "after ==> 5\n"

## N. Snippet ids

- RULE N1: Startup snippets are `s1`, `s2` and so on; every accepted snippet gets the next number, whether it is a
  declaration, statement, import or expression, and whether or not it throws; a rejected snippet gets `e1`, `e2` and so on
  and uses up no number. A redefinition gets a new number. The library gives an overwriting snippet the same integer as the
  one it overwrites (JShell.Builder.idGenerator Javadoc), so the visible ids are the front end's own.
  - evidence: values-10#18 real "\n   1 : 100\n   3 : 200\n   4 : $3 + 1\n"
  - evidence: inspect-1#21 real "  15 : import java.util.*;\n  e1 : int y = \"a\";\n  16 : int x = 7;\n"
  - evidence: values-8#9 real "|        at (#8:1)\n"
  - evidence: values-8#10 real "$9 ==> 7\n"
- RULE N2: An expression's temporary variable is `$` and its snippet's number; a rejected expression leaves the number for
  the next one.
  - evidence: values-1#4 real "$5 ==> 'a'\n"
  - evidence: values-8#6 real "$6 ==> 5\n"
- RULE N3: In a stack frame a snippet's file is `#` and its visible number.
  - evidence: exceptions-2#5 real "|        at c (#3:3)\n|        at b (#4:3)\n|        at a (#5:2)\n|        at (#6:1)\n"

## E. Errors and warnings

- RULE E1: A diagnostic prints `|  Error:` (or `|  Warning:`), its message, the source line its range starts on, and a caret
  line, each behind `|  `. Every diagnostic the library reports for the snippet is printed, in order; a snippet that waits
  on undeclared names has none.
  - evidence: errors-1#7 real "|  Error:\n|  incompatible types: int cannot be converted to java.lang.String\n|  String s = 5;\n|             ^\n"
  - evidence: errors-1#3 real "|  Error:\n|  cannot find symbol\n|    symbol:   class Foo\n|  Foo f = new Foo();\n|  ^-^\n|  Error:\n|  cannot find symbol\n|    symbol:   class Foo\n|  Foo f = new Foo();\n|              ^-^\n"
  - evidence: errors-1#28 real "|  Warning:\n|  unchecked call to add(E) as a member of the raw type java.util.List\n|  raw.add(\"a\");\n|  ^----------^\n$6 ==> true\n"
- RULE E2: The message's `location:` line, which the library's message carries, is not printed.
  - evidence: errors-1#0 events "location: class "
  - evidence: errors-1#0 real "|  Error:\n|  cannot find symbol\n|    symbol:   variable foo\n|  int a = foo;\n|          ^-^\n"
- RULE E3: The caret line marks the range: `^` for one character, `^^` for two, `^`, dashes and `^` for more. Tabs and
  every UTF-16 unit before the range count one column.
  - evidence: errors-1#0 real "|  int a = foo;\n|          ^-^\n"
  - evidence: errors-2#15 real "|  $9\n|  ^^\n"
  - evidence: errors-5#0 real "|  \tint u = \"x\";\n|           ^-^\n"
  - evidence: errors-2#21 real "|  String emo = \"😀😀\" + foo;\n|                        ^-^\n"
- RULE E4: A range that runs past the end of its first line is marked from its start to the end of that line, `^`, dashes,
  then `...`; when only one character of it is on that line the mark is a lone `^`. The diagnostic's own position does not
  decide this.
  - evidence: errors-7#48 real "|  int sp = new int[] {\n|           ^----------...\n"
  - evidence: gaps-1#0 real "|  int g1(int a) { // note\n|                ^--------...\n"
  - evidence: gaps-1#1 real "|  int g1b(int a) {\n|                 ^\n"

## X. Exceptions

- RULE X1: An uncaught exception prints `|  Exception ` with its class name, then `: ` and its message if it has one. A
  user class is named as the library reports it (`REPL.$JShell$20$MyEx`). No value line follows.
  - evidence: exceptions-1#15 real "|  Exception java.lang.IllegalArgumentException\n|        at (#16:1)\n"
  - evidence: exceptions-1#19 real "|  Exception REPL.$JShell$20$MyEx: custom boom\n"
- RULE X2: Each frame prints as `|        at ` and then `Class.method (File.java:line)`, with the class's simple name (nested
  `$` kept). The library already gives a reader's own classes by their simple name and a top-level method with no class.
  A snippet's own frame has neither a class nor a method and prints as `at (#id:line)`. Frames print `Native Method` and
  `Unknown Source` where the frame says so.
  - evidence: exceptions-1#9 real "|        at NumberFormatException.forInputString (NumberFormatException.java:67)\n|        at Integer.parseInt (Integer.java:565)\n|        at Integer.parseInt (Integer.java:662)\n|        at (#10:1)\n"
  - evidence: exceptions-1#9 events "java.lang.NumberFormatException|forInputString|NumberFormatException.java|67"
  - evidence: exceptions-4#67 real "|        at Object.clone (Native Method)\n|        at $0.c (#63:1)\n"
  - evidence: exceptions-2#23 real "|        at lambda$do_it$$0 (#24:1)\n|        at ap (#23:1)\n|        at (#24:1)\n"
- RULE X3: Each cause prints `|  Caused by: ` with its class and message, then its frames without the ones it shares at the
  bottom with the trace above it, then `|        ...` if it shared any.
  - evidence: exceptions-1#22 real "|  Caused by: java.lang.IllegalStateException: inner\n|        ...\n"
  - evidence: exceptions-2#49 real "|  Caused by: java.lang.NumberFormatException: For input string: \"zz\"\n|        at NumberFormatException.forInputString (NumberFormatException.java:67)\n|        at Integer.parseInt (Integer.java:565)\n|        at Integer.parseInt (Integer.java:662)\n|        at wrap (#46:3)\n|        ...\n"
  - evidence: exceptions-2#19 real "|  Caused by: java.lang.ExceptionInInitializerError: Exception java.lang.ArithmeticException: / by zero [in thread \"main\"]\n|        at Boom.<clinit> (#18:2)\n|        at (#19:1)\n"
- RULE X4: A trace prints at most 1,024 frames, the depth the reference JVM records; a deep recursion's top-level frame is
  therefore not shown.
  - evidence: exceptions-2#42 real "|  Exception java.lang.StackOverflowError\n|        at rec (#39:1)\n"
- RULE X5: A trace leaves out the frames of a lambda's hidden class. The real tool shows the lambda's own method and then
  the method that called the lambda, with nothing between them. Ristretto's VM also reports the frame of the class the
  lambda was turned into, named `$Lambda+0x` and a number (`runtime/.work/rist-sweep-report.txt`, exceptions-2#23 to #26,
  before this rule), so the front end drops a frame whose class's simple name ends that way. The pattern also accepts `/`
  for `+`, the separator the `Class.getName` Javadoc gives for a hidden class's name
  (https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Class.html#getName(); a copy in the git-ignored
  `runtime/.work/docs/raw/Class.html`).
  - evidence: exceptions-2#23 real "|        at lambda$do_it$$0 (#24:1)\n|        at ap (#23:1)\n"
  - evidence: exceptions-2#25 real "|        at lambda$do_it$$0 (#26:1)\n|        at ImmutableCollections$List12.forEach (ImmutableCollections.java:683)\n"

## V. Values

- RULE V1: A value after a declaration, an assignment or `/vars`-free feedback is shortened past 80 characters; the value of
  an expression or of a bare variable name past 1,000. The real tool's `/set truncation` lists exactly these two limits.
  - evidence: feedback-6#4 real "|  /set truncation normal 80 \n|  /set truncation normal 1000 varvalue,expression\n"
  - evidence: values-3#2 real "q79 ==> \"cccccccccccccccccccccccccccccccccccccccccccccccc ... ccccccccccccccccccccccccc\"\n"
  - evidence: values-2#16 real "$17 ==> [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10"
- RULE V2: A shortened value keeps its head and tail around ` ... `, in all exactly the limit long: the tail is a third of
  the limit rounded down and the head the rest (49 + 26 at 80, 662 + 333 at 1,000).
  - evidence: gaps-1#6 real "g2d ==> \"abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuv ... bcdefghijklmnopqrstuvwxyz\"\n"
  - evidence: gaps-1#3 real "150, 151, 152, 153, 1 ... 33, 334, 335"

## F. Feedback

The real tool's `/set mode` prints each mode's whole configuration: the action words, and the display formats with the
cases each applies to, a later line replacing an earlier one for the same case (evidence feedback-6#1). The code applies
those lines in their listed order for each kind of snippet.

- RULE F1: Per mode, what each event shows. In normal: a value line `name ==> value` for a new or changed variable or
  expression; `|  created method sq(int)` (or `modified`, `replaced`) for methods; `|  created class A` (and the other
  kinds) for types; nothing for imports and statements. For dependents, only a variable reset (`update replaced variable d,
  reset to null`) or a variable that can no longer be referenced. Concise prints values but not fully resolved
  declarations or assignments. Verbose adds `created scratch variable`, `value of`, `assigned to`,
  `created variable x : int` and every update line. Silent prints none of this.
  - evidence: feedback-6#1 real "|  /set format normal display \"{result}\" added,modified,replaced-expression,varvalue,assignment,varinit,vardec"
  - evidence: feedback-6#1 real "|  /set format concise display \"\" class,interface,enum,annotation,record,method,assignment,varinit,vardecl-ok\n"
  - evidence: feedback-4#4 real "|  created method sq(int)\n"
  - evidence: feedback-3#1 real "$1 ==> 5\n|  created scratch variable $1 : int\n"
  - evidence: feedback-3#5 real "|  modified method sq(int)\n|    update overwrote method sq(int)\n"
  - evidence: feedback-1#2 real= ""
  - evidence: feedback-2#1 real= ""
  - evidence: declarations-2#8 real "|  replaced class Dog\n|    update replaced variable d, reset to null\n"
- RULE F2: Type kinds print as `class`, `interface`, `enum`, `record` and `annotation interface`; `/types` shows the last
  as `@interface`.
  - evidence: declarations-2#27 real "|  created annotation interface Marker\n"
  - evidence: inspect-1#33 real "|    @interface Ann\n"
- RULE F3: The action is `created` for a snippet that was not active before; `modified` or `replaced` for one that was,
  `replaced` when its signature changed; `overwrote` and `dropped` for those statuses. Rule R1 says when the signature
  counts as changed.
  - evidence: declarations-1#2 real "|  modified method square(int)\n"
  - evidence: declarations-1#4 real "|  replaced method square(int)\n"
  - evidence: declarations-1#4 events "\"signature\":\"(int)long\",\"parameterTypes\":\"int\",\"status\":\"VALID\",\"previousStatus\":\"VALID\",\"signatureChange\":true"
- RULE F4: A shown value is the library's own value text (an array `int[3] { 1, 2, 3 }`, a string quoted and escaped),
  shortened per V1 and V2.
  - evidence: values-4#0 real "$1 ==> int[3] { 1, 2, 3 }\n"
  - evidence: values-1#48 real "$49 ==> \"say \\\"hi\\\"\"\n"
- RULE F5: Undeclared names are listed as `a`, `a, and b`, `a, b, and c`, then `is declared` or `are declared`.
  - evidence: declarations-5#25 real "until variable aa, and method bb() are declared\n"
  - evidence: declarations-5#30 real "until class Foo, variable qq, and method rr() are declared\n"
- RULE F6: What a waiting declaration says: `, however, it cannot be invoked until` (a method),
  `, however, it cannot be instantiated or its methods invoked until` (a class or record), `, however, its methods cannot
  be invoked until` (an interface), `, however, it cannot be used until` (an enum or annotation), `, however, it cannot be
  referenced until` (anything whose type is missing); updates and calls use ` which cannot be invoked until` and so on.
  - evidence: feedback-6#1 real "|  /set format normal until \", however, it cannot be instantiated or its methods invoked until\" defined-class,"
  - evidence: declarations-1#16 real "|  created method usesX(), however, it cannot be invoked until variable x is declared\n"
  - evidence: declarations-1#17 real "|  attempted to call method usesX() which cannot be invoked until variable x is declared\n"
  - evidence: declarations-5#56 real "|  created method pm(Undecl), however, it cannot be referenced until class Undecl is declared\n"
- RULE F7: A declaration that waits on a compile error says `this error is corrected:` (or `these errors are`), then each
  error's lines indented under `|      `.
  - evidence: declarations-3#21 real "|  attempted to call method getN() which cannot be invoked until this error is corrected: \n|      incompatible types: java.lang.String cannot be converted to int\n|      int getN() { return n; }\n|                          ^\n"
  - evidence: errors-25#32 real "|  created class K2, however, it cannot be instantiated or its methods invoked until this error is corrected: \n"
- RULE F8: Calling a method that waits, or using a class that waits, prints `|  attempted to call method f() which ...` or
  `|  attempted to use class C which ...`, in every mode but silent.
  - evidence: declarations-15#27 real "|  attempted to use class UDm which cannot be instantiated or its methods invoked until method dm1() is declared\n"
  - evidence: feedback-8#16 real= ""

## R. Redefinition and the engine

- RULE R1: Ristretto can host only an in-process engine, which cannot redefine a loaded class. The library replaces such a
  class and reports a signature change, so the local engine says `replaced` where the default engine says `modified`.
  The default engine redefines in place whenever the JVM allows it. Per the JVM TI specification (RetransformClasses, the
  rule `Instrumentation.redefineClasses` defers to; https://docs.oracle.com/en/java/javase/25/docs/specs/jvmti.html, a copy in
  the git-ignored `runtime/.work/docs/text/jvmti-retransform.txt`), a redefinition "must
  not add, remove or rename fields or methods, change the signatures of methods, change modifiers, or change inheritance"
  nor the NestHost, NestMembers, Record or PermittedSubclasses attributes. So when every class the library asks to redefine
  keeps that shape (`ClassShape`), the front end reports `modified` and leaves out the dependents' events the replacement
  caused, as the default engine never touches them. Body-only edits, added `extends Object`, a renamed type parameter and
  a changed throws clause keep the shape; a new field or method, a changed bound, a new constructor or `implements`, or a
  changed modifier do not.
  - evidence: declarations-1#2 elocal "\"name\":\"square\",\"signature\":\"(int)int\",\"parameterTypes\":\"int\",\"status\":\"VALID\",\"previousStatus\":\"VALID\",\"signatureChange\":true,\"cause\":null"
  - evidence: declarations-1#2 events "\"name\":\"square\",\"signature\":\"(int)int\",\"parameterTypes\":\"int\",\"status\":\"VALID\",\"previousStatus\":\"VALID\",\"signatureChange\":false,\"cause\":null"
  - evidence: declarations-4#31 real "|  modified class Gen\n"
  - evidence: declarations-4#28 real "|  modified class Kind\n"
  - evidence: declarations-2#30 real "|  replaced class Cell\n"
  - evidence: declarations-4#35 real "|  replaced class Ctor\n"
  - evidence: declarations-4#37 real "|  replaced class Vis\n"
  - evidence: feedback-9#17 real "|  created method g2()\n|    update modified method f2()\n"
- RULE R2: When redefining in place would keep state the replacement loses, the front end prints the local engine's own
  text instead, which is what really happened. That is the case when a variable holding an instance is reset, or when the
  reader's class holds a non-final static field. The check proves these entries against the real tool run with
  `--execution local` (allowed difference `engine`).
  - evidence: declarations-4#3 real "|  modified class Ctr\n"
  - evidence: declarations-4#3 local "|  replaced class Ctr\n|    update replaced variable c1, reset to null\n|    update replaced variable c2, reset to null\n"
  - evidence: declarations-3#80 local "$74 ==> 2\n"
- RULE R3: The front end uses the library's direct engine, which runs a snippet on the calling thread. The real tool's
  default engine runs it on its agent's `main` thread, and the stock local engine on a thread of its own, adding a
  `$Cancel$.stopCheck` call to the reader's code that then shows as the top frame of a StackOverflowError (seen in this
  front end's first sweep, worksheet checkpoint 3).
  - evidence: errors-29#3 real "$4 ==> \"main\"\n"
  - evidence: errors-29#3 local "$4 ==> \"Thread-6\"\n"
- RULE R4: The compiler's file manager answers a request for the files of a location with nothing when the request comes
  from any thread but the one evaluating snippets (`OwnThreadFiles`, through the public `JShell.Builder.fileManager`). The
  library's source analysis starts a background thread that indexes class names for Tab completion. Observed natively at
  run time, by sampling that thread's stack and by logging the calls our own file manager received from it
  (`runtime/.work/scratch/threads/`, worksheet checkpoint 5), it asks only for the paths of the class path, the platform
  classes and the source path. On Ristretto a Java thread stops when the call that started it returns, so the walk was
  left half done, and a later call could find nothing runnable and end the VM (`condvar wait not supported`; 1 of 6
  parallel runs of a 37-entry session before, 36 of 36 after, `runtime/.work/scratch/crash/`). This changes no output:
  only Tab completion of a class name the session has not imported finds less. Not an output rule, so no evidence lines
  in the corpus.
- RULE R5: `/reset` and `/reload` end the session on its VM and go on in a fresh one. A second library instance in the
  same Ristretto VM defines its snippets' classes under the names the first instance used, and that VM resolves them to
  the old classes: on the first Ristretto run of the check, `100 + 1` after a `/reload` printed `$9 ==> 1` and `/vars`
  printed `[java.lang.NoSuchFieldException: $1]` (worksheet checkpoint 7). Ristretto's protocol has the answer for this
  (`web/runner/src/lib.rs`): an answer with `reload` makes it drop the VM, start a new one and call `beginReload` with
  the answer's `feedback` string. The front end puts in that string what the reader's session keeps (`Carried`: the
  feedback mode, the retained mode, the history, the replay lists, a refused option for C9, and the lines of the same
  request still to run), and `beginReload` rebuilds the session from it with no banner, then replays for `/reload`
  (L1, L2). Ristretto's own front end instead answers `/reset` by dropping the VM, so by its source its next entry opens
  a new session with the banner and an empty history.

## Q. Confirmations

- RULE Q1: The lines that only confirm a command print in normal and verbose mode, which the real tool marks `-command`,
  and not in concise or silent, marked `-quiet`. That covers `Type /help for help.`, `See ...`, the list of modes after a
  bad mode name, `Resetting state.`, the reload headers, `Feedback mode: ...` and `Goodbye`. Errors print in every mode.
  - evidence: feedback-6#1 real "|  /set mode normal -command\n"
  - evidence: gaps-2#13 real "|  Invalid command: /nosuch\n"
  - evidence: gaps-2#16 real "|  No such snippet: nosuch\n"
  - evidence: gaps-2#17 real= ""
  - evidence: gaps-2#20 real= ""
  - evidence: inspect-5#21 real "|  Invalid command: /foo\n|  Type /help for help.\n"

## C. Commands

- RULE C1: A command word is matched exactly, else by unique prefix, case sensitive. An ambiguous one lists the candidates in
  the order `/list, /edit, /drop, /save, /open, /vars, /methods, /types, /imports, /exit, /env, /reset, /reload, /history,
  /debug, /help, /set, /?, /!`; an unknown one prints `Invalid command: <word>`. The word ends at the first space: a tab
  does not end it, so `/drop<tab>b` is an invalid command (probe G23).
  - evidence: inspect-5#14 real "|  Command: '/d' is ambiguous: /drop, /debug\n|  Type /help for help.\n"
  - evidence: inspect-5#22 real "|  Command: '/' is ambiguous: /list, /edit, /drop, /save, /open, /vars, /methods, /types, /imports, /exit, /env, /reset, /reload, /history, /debug, /help, /set, /?, /!\n|  Type /help for help.\n"
  - evidence: inspect-5#23 real "|  Invalid command: /LIST\n"
  - evidence: gaps-14#3 real "|  Invalid command: /drop\tb\n"
  - evidence: inspect-5#56 real "|  Goodbye\n"
- RULE C2: `/list` prints a blank line, then `%4s : ` and each live snippet's source, continuation lines behind seven
  spaces; nothing at all when there is none. `-all` adds startup, replaced, dropped and rejected snippets; `-start` only
  the startup ones. Its option errors are `Unknown option`, `Options and snippets must not both be used` and `Conflicting
  options`. `/list`, `/vars`, `/methods` and `/types` read `-all` and `-start` alike, by any prefix after one or two
  dashes (`-a`, `--a`, `-s`), and refuse other options and options mixed with snippets the same way (probe G24).
  - evidence: inspect-1#0 real= ""
  - evidence: inspect-1#20 real "   5 : int square(int n) {\n           return n * n;\n       }\n"
  - evidence: gaps-15#3 real "|  Unknown option: -x -- /vars -x\n"
  - evidence: gaps-15#4 real "|    int x = 1\n"
  - evidence: gaps-15#5 real "|  Options and snippets must not both be used: /vars -all x\n"
  - evidence: gaps-15#12 real "\n  s1 : import module java.base;\n"
  - evidence: inspect-6#3 real "\n 100 : int v100=100;\n"
  - evidence: inspect-2#31 real "|  Unknown option: -x -- /list -x\n"
  - evidence: inspect-5#38 real "|  Options and snippets must not both be used: /list -all x\n"
  - evidence: inspect-5#39 real "|  Conflicting options -- /list -start -all\n"
- RULE C3: Snippets are chosen by name (the active ones; if none, every one of that name), by id, or by a range `a-b`,
  arguments in the order given. Errors: `No such snippet: <name>`, `No snippet with ID: <id>`, `Snippet ranges require
  snippet IDs: <x>`, `End of snippet range less than start: a - b`. A range's start must exist before its end is looked at.
  A range runs over the ids in their order, not the order typed: startup ids, then main ids, then error ids, each by
  number. Its two ends are taken as if given by id; between them only what the command would choose by name: everything
  for `/list` and a rerun, any snippet of the command's kind for `/vars`, `/methods` and `/types`, whatever its status,
  and for `/drop` the active snippets other than imports (probes G12 to G18).
  - evidence: gaps-7#7 real "\n   1 : int a = 1;\n   2 : int b = 1;\n  e1 : int q = \"x\";\n  e2 : int r = \"y\";\n"
  - evidence: gaps-7#10 real "\n   2 : int b = 1;\n  e1 : int q = \"x\";\n"
  - evidence: gaps-6#21 real "\n   1 : int a = 1;\n   2 : import java.util.*;\n   3 : int b = 1;\n"
  - evidence: gaps-6#13 real "|    int a = 1\n|    int b = (not-active)\n|    int b = 2\n|    int z = 0\n"
  - evidence: gaps-5#28 real "|  This command does not accept the snippet '2' : int m() { return 1; }\n"
  - evidence: gaps-9#6 real "int a = 1;\na ==> 1\nint b = 2;\nb ==> 2\nint a = 3;\na ==> 3\n"
  - evidence: inspect-1#25 real "\n  16 : int x = 7;\n   2 : String s;\n"
  - evidence: inspect-1#26 real "|  No such snippet: nope\n"
  - evidence: inspect-4#31 real "|  No snippet with ID: 13\n"
  - evidence: inspect-5#46 real "|  End of snippet range less than start: 3 - 1\n"
  - evidence: session-28#27 real "|  No snippet with ID: 2\n"
  - evidence: session-27#30 real "|  Snippet ranges require snippet IDs: \n"
- RULE C4: `/vars` prints `|    type name = value` with the full value, `(not-active)` for one that is not valid;
  `/methods` prints `|    returnType name(paramTypes)`; `/types` prints `|    kind name`; `/imports` prints `|    import
  name` for each active import. A name of another kind is refused with `This command does not accept the snippet ...`.
  - evidence: inspect-1#31 real "|    String s = null\n|    int[] arr = int[3] { 1, 2, 3 }\n|    int x = 7\n"
  - evidence: inspect-7#20 real "|    java.util.List<String> names = [a, b]\n"
  - evidence: inspect-2#2 real "|    Foo f = (not-active)\n"
  - evidence: inspect-1#32 real "|    int square(int)\n|    int square(double)\n|    T id(T)\n|    int sum(int...)\n|    int[] mk(int[][])\n"
  - evidence: inspect-2#20 real "|    import java.util.List\n|    import static java.lang.Math.abs\n|    import static java.lang.Math.*\n"
  - evidence: inspect-5#33 real "|  This command does not accept the snippet 'x' : int x = 5;\n"
- RULE C5: A method or type that waits on undeclared names gets a second line, `|      ` and the update form of F6.
  - evidence: inspect-2#5 real "|    int usesBar()\n|       which cannot be invoked until method bar() is declared\n|    Baz mkBaz()\n|       which cannot be referenced until class Baz is declared\n"
- RULE C6: `/drop` drops every snippet chosen, all or nothing, and reports each with the F1 display (`|  dropped variable
  a`, and the dependents' update lines). Without an argument it prints a two-line message whose second line has no bar.
  Imports can be dropped only by id. Between the ends of a range (C3) a dropped or replaced snippet, or an import, is
  skipped; at either end it is refused. Its refusals add `|  See /types, /methods, /vars, or /list` in normal and verbose.
  - evidence: gaps-5#4 real "|  dropped variable a\n|  dropped variable c\n"
  - evidence: inspect-8#21 real "|  dropped variable x\n|  dropped method f()\n"
  - evidence: gaps-6#23 real "|  dropped variable a\n|  dropped variable b\n"
  - evidence: gaps-5#10 real "|  This command does not accept the snippet '2' : int b = 1;\n"
  - evidence: gaps-3#29 real "|  This command does not accept the snippet '1' : int g() { return 1; }\n"
  - evidence: inspect-3#7 real "|  dropped variable a\n"
  - evidence: inspect-3#11 real "|  dropped method twice(int)\n|  dropped method twice(String)\n"
  - evidence: inspect-3#18 real "|  In the /drop argument, please specify an import, variable, method, or class to drop.\nSpecify by ID or name. Use /list to see IDs. Use /reset to reset all state.\n"
  - evidence: inspect-8#26 real "|  No such snippet: List\n|  See /types, /methods, /vars, or /list\n"
  - evidence: inspect-3#28 real "|  This command does not accept the snippet '1' : int a = 1;\n"
  - evidence: inspect-4#9 real "|  dropped class K\n|    update replaced variable k which cannot be referenced until class K is declared\n"
- RULE C7: `/history` (H1, H2); `-all` prints the same; any other argument is refused.
  - evidence: inspect-5#35 real "|  Unexpected arguments at end of command: 3 -- /history 3\n"
- RULE C8: `/reset` prints `|  Resetting state.` and starts over with the startup snippets, numbering from 1 again; it
  keeps the feedback mode and the history. `/reset` and `/reload` read their options alike (probe G21): `--name` names an
  option by any prefix of its name, and so does `-name`, which otherwise is a cluster of one-letter options (`r` and `q`
  for `/reload`, none for `/reset`); `-` alone is an argument and `--` ends the options. An unknown option is refused
  first, as `Unknown option: ` and the letter or the name after `--`; then words left over, as `Unexpected arguments at
  end of command: [a, b] -- ` and every argument. The path options are not offered (U1).
  - evidence: session-4#23 real "|  Unexpected arguments at end of command: [foo] -- foo\n"
  - evidence: session-4#27 real "|  Unknown option: q\n"
  - evidence: session-4#29 real "|  /set feedback verbose\n"
  - evidence: gaps-12#0 real "|  Restarting and restoring state.\n"
  - evidence: gaps-12#7 real "|  Restarting and restoring from previous state.\n"
  - evidence: gaps-12#6 real "|  Unknown option: u\n"
  - evidence: gaps-12#12 real "|  Unknown option: bogus\n"
  - evidence: gaps-12#10 real "|  Unexpected arguments at end of command: [extra, more] -- -quiet extra more\n"
  - evidence: gaps-12#16 real "|  Unexpected arguments at end of command: [-] -- -\n"
  - evidence: gaps-12#21 real "|  Unknown option: b\n"
  - evidence: gaps-12#23 real "|  Unexpected arguments at end of command: [-bogus] -- -quiet -- -bogus\n"
- RULE C9: `/exit` prints `|  Goodbye` and ends the session. With an int expression it prints `|  Goodbye (n)` (plain
  Goodbye for 0); a non-int expression is refused, a broken one prints its errors, and the session goes on. An expression
  not yet complete takes the next lines as a snippet does, blank ones included, at the continuation prompt; a refusal
  then quotes those lines joined. The expression is a snippet of the session, listed under its id and taking a `$`
  number, though `/reload` does not replay it (probes G13, G17, G19). Once an option of `/reset` or `/reload` was refused
  as unknown, a bare `/exit` reports status 1, `|  Goodbye (1)`, whatever came after; no other refusal does (probe G20).
  The real tool also counts a path option's missing file, which this front end never meets (U1). The expression must be
  one of type `int`, `Integer`, `short`, `Short`, `byte` or `Byte` (`char`, `long`, `Long` and `null`'s `Object` are
  refused by type); a null value is refused as `has bad value is null`; a statement or declaration runs and is refused as
  `it is not an expression`; an exception prints as any other and the session goes on (probe G25).
  - evidence: gaps-4a#1 real "|  Goodbye (11)\n"
  - evidence: gaps-4a#1 prompt "   ...> "
  - evidence: gaps-4d#3 real "|  Goodbye (3)\n"
  - evidence: gaps-8#4 real "|  The argument to /exit must be a valid integer expression. The type is String : \"a\" +\n\"b\"\n"
  - evidence: gaps-8#6 real "|  x + (\n|  ^\n"
  - evidence: gaps-8#2 real "   1 : \"s\"\n   2 : 1 + 1\n"
  - evidence: gaps-10#3 real "|  Restarting and restoring state.\n-: int k = 1;\n"
  - evidence: gaps-11a#3 real "|  Goodbye (1)\n"
  - evidence: gaps-11b#5 real "|  Goodbye\n"
  - evidence: gaps-11c#1 real "|  Goodbye\n"
  - evidence: gaps-16d1#0 real "|  Goodbye (7)\n"
  - evidence: gaps-16d2#0 real "The type is char : 'a'\n"
  - evidence: gaps-16d4#0 real "The type is long : 3L\n"
  - evidence: gaps-16d3#0 real "|  Goodbye (3)\n"
  - evidence: gaps-16e1#0 real "|  Goodbye (4)\n"
  - evidence: gaps-16c#0 real "|  The argument to /exit has bad value is null : (Integer) null\n"
  - evidence: gaps-16d9#0 real "x\n|  The argument to /exit must be a valid integer expression, it is not an expression: System.out.println(\"x\")\n"
  - evidence: gaps-16a#0 real "|  Exception java.lang.NumberFormatException: For input string: \"x\"\n"
  - evidence: gaps-16a#1 real "|  Goodbye\n"
  - evidence: session-17#1 real "|  Goodbye (6)\n"
  - evidence: session-16#1 real "|  The argument to /exit must be a valid integer expression. The type is String : \"s\"\n"
  - evidence: session-18#1 real "|  The argument to /exit must be a valid integer expression. The type is double : 2.5\n"
- RULE C10: `/set feedback <mode>` switches mode, the mode name matched by unique prefix and case sensitive; normal and
  verbose announce `|  Feedback mode: <mode>`. With no mode it lists `/set feedback <mode>` (and `-retain <mode>` first when
  one was retained, the plain line only when it differs), a `|  ` line and the modes. Its errors are those quoted. The
  word after `/set` is matched by unique prefix too; an ambiguous one (`f`) prints `|  Ambiguous sub-command argument to
  '/set': f` and `|  Use one of: format, feedback` (probe G24).
  - evidence: feedback-5#24 real "|  Feedback mode: verbose\n"
  - evidence: feedback-5#35 real "|  /set feedback -retain verbose\n|  /set feedback silent\n|  \n|  Available feedback modes:\n"
  - evidence: feedback-11#3 real "|  /set feedback -retain concise\n|  \n|  Available feedback modes:\n"
  - evidence: gaps-15#16 real "|  Ambiguous sub-command argument to '/set': f\n|  Use one of: format, feedback\n"
  - evidence: feedback-5#22 real "|  Does not match any current feedback mode: nonsense -- /set feedback nonsense\n|  Available feedback modes:\n"
  - evidence: feedback-5#32 real "|  Unexpected arguments at end of command: extra words -- /set feedback verbose extra words\n"
  - evidence: feedback-5#37 real "|  Unknown option: -bogus -- /set feedback -bogus verbose\n"
  - evidence: feedback-11#7 real "|  Expected a feedback mode name: normal;\n|  See /help /set feedback for help.\n"
- RULE C11: `/!` reruns the last snippet, `/<id>` that snippet, `/-n` the nth from the end, each echoing the source on its
  own line and then giving its feedback; out of range prints `Out of range`. A `/-n` whose n does not fit an int is not a
  rerun but an invalid command (probe G23), and so is a `/-n` with anything after it. After `/<id>` (an id or a range),
  a word starting with `-` is refused first as `Unknown option: <word> -- /<id> <arguments>`; `/!` ignores what follows
  (probe G28).
  - evidence: gaps-2#5 real "twice(5)\n$8 ==> 10\n"
  - evidence: session-3#7 real "|  Out of range\n"
  - evidence: gaps-14#6 real "|  Invalid command: /-99999999999\n"
  - evidence: gaps-19#9 real "|  Invalid command: /-1\n"
  - evidence: gaps-18#11 real "|  Invalid command: /-1\n"
  - evidence: gaps-19#2 real "|  Unknown option: -all -- /<id> 1 -all\n"
  - evidence: gaps-19#12 real "|  Unknown option: -x -- /<id> e1 -x\n"
  - evidence: gaps-18#12 real "|  Unknown option: -99999999999 -- /<id> 1 -99999999999\n"
  - evidence: gaps-19#8 real "int b = 2;\nb ==> 2\n"
- RULE C12: `/reload` (L1, L2).

## L. Reload

- RULE L1: `/reload` replays, in order, the source of every evaluation that was accepted (one entry for `int p = 1, q = 2;`)
  and every `/drop`; rejected snippets are gone afterward. `/reset` empties the list. `-restore` replays the list from
  before the last `/reset` or `/reload`; before the first of them it prints `|  No previous history to restore` and
  changes nothing (probe G22). A `/drop` typed by a prefix (`/dr a`) is replayed under its full name (probe G23). A
  replayed `/drop` that misses prints its refusal without the `See ...` line and is not kept for the next replay. It can
  miss: a refused `/exit` keeps a snippet id but is not replayed, so later ids shift by one, in the real tool as well
  (probe G27, checked because the controller's review asked).
  - evidence: session-6#11 real "|  Restarting and restoring state.\n-: int x = 10;\n-: x + 1\n"
  - evidence: session-6#11 real "-: int gone = 1;\n-: /drop gone\n-: int x = 20;\n"
  - evidence: gaps-2#6 real "-: int p = 1, q = 2;\n-: twice(5)\n-: twice(5)\n"
  - evidence: session-6#19 real "|  Restarting and restoring from previous state.\n"
  - evidence: gaps-13#0 real "|  No previous history to restore\n"
  - evidence: gaps-13#3 real "|    int a = 1\n"
  - evidence: gaps-13#12 real "|  Restarting and restoring from previous state.\n"
  - evidence: gaps-14#4 real "-: int a = 1;\n-: int b = 2;\n-: /drop a\n"
  - evidence: gaps-18#5 real "-: /drop 3\n|  No snippet with ID: 3\n"
  - evidence: gaps-18#6 real "|    int a = 1\n|    int b = 2\n"
  - evidence: gaps-18#9 real= "|  Restarting and restoring state.\n"
- RULE L2: Each entry is echoed as `-: ` and its source, continuation lines indented three spaces; the program's output,
  warnings and exceptions show, values and declarations do not. `-quiet` drops the echoes.
  - evidence: gaps-2#6 real "-: int twice(int n) {\n       return n * 2;\n   }\n"
  - evidence: session-6#16 real "|  Restarting and restoring state.\nhello\n"
  - evidence: session-6#33 real "-: arr[9]\n|  Exception java.lang.ArrayIndexOutOfBoundsException: Index 9 out of bounds for length 2\n"

## Changes after the derivation

- **The course's new name** (Plan 4, decision D77): the copyright line of the license header of every file in `src/`
  now reads `Copyright 2026 Groundwork contributors.` in place of the course's former name. It is a header rename
  with no code change: one comment line per file, the same line in each and the line count unchanged, so the compiled
  classes, and the jar `build.sh` makes of them, keep their bytes (SHA-256
  e5ee02f466698fa0548f9b93299eee22c5f858a058ae61c624b6be26587f5ae4, the `jar` pin in `test/pins.json`, which
  `test/pin.mjs` leaves unchanged). No rule above changes, and no observation was added or needed.

## Disclosures

Clean room (D14), as stated when the work was handed off: no OpenJDK source opened in any form, nothing decompiled; an
independent audit of the transcripts found that every web fetch was public Javadoc, the jshell man page and User's
Guide, JEP 222 or the JVM TI specification. Disclosed: three runs of the jshell binary by the work itself (jshell
--version; the research's pty driver once, for the 28-of-72 baseline, which wrote course lines into the macOS
preferences that D59 later cleared; a recording-factory control); lib/src.zip named by an ls and excluded from a copy,
never opened; Ristretto's zip entry names listed; one rule (R4) rests on run-time observation whose stack frames name
jdk.jshell classes; one /tmp file deleted at once; two empty /save files deleted. Training exposure: the models that
wrote and reviewed the front end have OpenJDK, the jshell tool included, in their training data; the author's private working notes (D95) name
where each group of probes came from, and every rule rests on an observed output line regardless.
