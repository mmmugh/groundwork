# Observations: input (how input lines become snippets)

Sessions run: `input-1` (55 entries: methods, if/else, nested braces, switch expressions, lambdas, blank lines, comments at the prompt and inside snippets, several snippets on one line, with and without semicolons, spaces, text blocks, strings holding comment openers, Unicode names, lone semicolons, open and closed braces and parentheses, incomplete expressions, classes, loops, try/catch), `input-2` (a 509-character line), `input-5` (48 entries: more comment placements, trailing operators, ternary, trailing dot, blank lines inside open snippets, braces inside strings and chars, text-block variants, import/declaration/method mixes on one line, an error or exception in the middle of a line, Unicode escapes, emoji, a 500-character string literal), `input-6` (a comment line before a value, and a snippet left open when the input ends), `input-7` (31 entries: what happens after an error in the middle of a line, a complete snippet followed by an incomplete one, a line starting with `/` inside an open snippet, leading and trailing spaces around a command, annotations, for headers split over lines, do/while, enum). Every line was fed one at a time as if Enter was pressed after it; the first prompt of an entry is `\njshell> ` and a continuation prompt is `   ...> `. In all of these sessions the output of the default engine and of `--execution local` was identical (the only differences seen earlier were object hash codes of printed lambdas, so those probes were rewritten to apply the lambda at once). Probes with a tab character were removed (see Open questions).

## When a line is evaluated and when the continuation prompt appears

- RULE input.1: A line that is already a complete snippet is evaluated at once, and the next line is answered by the normal prompt.
  - evidence: input-1#0 prompt "\njshell> "
  - evidence: input-1#0 real "$1 ==> 5\n"
  - evidence: input-5#13 real "|  Error:\n|  reached end of file while parsing\n|  1 :\n|     ^\n$16 ==> 2\n"

- RULE input.2: A snippet with an open brace (method, class, interface, enum, block, array initializer, for/while/do/try/switch body) shows the continuation prompt `   ...> ` for every further line, one prompt per line, and is evaluated only when the last line closes it. The reader then sees one result for the whole snippet, printed after the last line.
  - evidence: input-1#1 prompt "\njshell> |   ...> |   ...> "
  - evidence: input-1#1 real "|  created method square(int)\n"
  - evidence: input-1#3 prompt "\njshell> |   ...> |   ...> |   ...> |   ...> |   ...> |   ...> |   ...> "
  - evidence: input-1#2 real "yes\n"
  - evidence: input-1#47 real "arr ==> int[3] { 1, 2, 3 }\n"
  - evidence: input-1#49 real "|  created class Pt\n"
  - evidence: input-7#29 real "|  created enum Color\n"

- RULE input.3: Braces, parentheses and quotes that sit inside comments, string literals or char literals do not count toward the open nesting: a `{` in a line comment, a `}` in a string and a `}` in a char literal all leave the method open until its real closing brace.
  - evidence: input-5#17 real "|  created method cb()\n"
  - evidence: input-5#18 real "|  created method cs()\n"
  - evidence: input-5#19 real "|  created method cc()\n"

- RULE input.4: A switch expression assigned to a variable, a multi-line lambda applied at once, a for header split over several lines and a switch statement each keep the continuation prompt until they are complete; the earlier complete line of the same entry (`int k = 2;`) printed its result before the continuation lines.
  - evidence: input-1#4 prompt "\njshell> |\njshell> |   ...> |   ...> |   ...> |   ...> "
  - evidence: input-1#4 real "k ==> 2\ns ==> \"two\"\n"
  - evidence: input-1#5 real "g ==> 8\n"
  - evidence: input-7#21 real "01"
  - evidence: input-7#27 real "three\n"

- RULE input.5: A statement that is complete at the end of a line is evaluated even when the next line was meant to continue it: `if (...) stmt;` followed by a line `else ...` evaluates the `if` alone, and the `else` line is a separate failing input.
  - evidence: input-5#9 prompt "\njshell> |\njshell> "
  - evidence: input-5#9 real "|  Error:\n|  reached end of file while parsing\n|  else System.out.println(\"b\");\n|       ^----------------------^\n"
  - evidence: input-5#8 real "body\n"

- RULE input.6: An `if (...)` header with no body yet is not complete, so the next line gets the continuation prompt and the body is read as part of the same statement.
  - evidence: input-5#8 prompt "\njshell> |   ...> "
  - evidence: input-5#8 real "body\n"

- RULE input.7: A line that ends with a binary operator (`1 +`, `10 /`), an open parenthesis or unfinished argument list (`(1 +`, `Math.max(1,`, `System.out.println(`), a trailing `=` in a declaration, a trailing dot, or the arrow of a lambda is incomplete and gets the continuation prompt; the next line completes it and the result is printed once.
  - evidence: input-1#39 prompt "\njshell> |   ...> "
  - evidence: input-1#39 real "$42 ==> 3\n"
  - evidence: input-5#12 real "$15 ==> 2\n"
  - evidence: input-5#11 real "$14 ==> 3\n"
  - evidence: input-5#14 real "$17 ==> 3\n"
  - evidence: input-1#42 real "w ==> 5\n"
  - evidence: input-1#41 real "hi\n"
  - evidence: input-7#20 real "$24 ==> 1\n"
  - evidence: input-7#26 real "run\n"

- RULE input.8: A ternary split before its second part (`true ?` then `1 :` then `2`) behaves differently from the other incomplete expressions: after `true ?` the prompt is the continuation prompt, but `1 :` is answered by an error (reached end of file) and the snippet is dropped, so the third line `2` is evaluated alone at a normal prompt.
  - evidence: input-5#13 prompt "\njshell> |   ...> |\njshell> "
  - evidence: input-5#13 real "|  Error:\n|  reached end of file while parsing\n|  1 :\n|     ^\n$16 ==> 2\n"

- RULE input.9: A line that starts with `+`, `++` or `.` after a complete line is not a continuation: the earlier line was already evaluated, and the new line is a separate input (a value with `+ 2` printed `$15 ==> 2`, the earlier variable stayed 1; a line `.toUpperCase()` is an error).
  - evidence: input-7#11 prompt "\njshell> |\njshell> "
  - evidence: input-7#11 real "k4 ==> 1\n$15 ==> 2\n"
  - evidence: input-7#12 real "k4 ==> 1\n"
  - evidence: input-1#48 real "$48 ==> \"abc\"\n|  Error:\n|  illegal start of expression\n|      .toUpperCase()\n|      ^\n|  Error:\n|  illegal start of expression\n|      .length()\n|      ^\n"
  - evidence: input-7#25 real "$29 ==> 1\n|  Error:\n|  reached end of file while parsing\n|  ++\n|    ^\n"

- RULE input.10: A continuation line that starts with `/` is read as part of the expression when the earlier line was incomplete (`(10` then `/ 5)` printed `$12 ==> 2`, as did `10 /` then `5`). When the earlier line was already complete (`int dv = 10`, or `10`), the `/` line is read as a command and the tool prints that `/` is ambiguous, listing the commands that start with `/`.
  - evidence: input-7#9 real "$12 ==> 2\n"
  - evidence: input-7#9 prompt "\njshell> |   ...> "
  - evidence: input-7#10 real "$13 ==> 2\n"
  - evidence: input-1#26 real "dv ==> 10\n|  Command: '/' is ambiguous: /list, /edit, /drop, /save, /open, /vars, /methods, /types, /imports, /exit, /env, /reset, /reload, /history, /debug, /help, /set, /?, /!\n|  Type /help for help.\n"
  - evidence: input-1#27 real "$29 ==> 10\n|  Command: '/' is ambiguous: /list, /edit, /drop, /save, /open, /vars, /methods, /types, /imports, /exit, /env, /reset, /reload, /history, /debug, /help, /set, /?, /!\n|  Type /help for help.\n"
  - evidence: input-1#26 prompt "\njshell> |\njshell> "

- RULE input.11: A text block opened with `"""` at the end of a line keeps the continuation prompt until the closing `"""` is read, including when a line inside it is blank or holds comment openers; the value has the common indentation removed.
  - evidence: input-1#28 prompt "\njshell> |   ...> |   ...> |   ...> "
  - evidence: input-1#28 real "tbk ==> \"hello\\n  world\\n\"\n"
  - evidence: input-5#21 real "tb3 ==> \"a\\n\\nb\\n\"\n"
  - evidence: input-5#20 real "tb2 ==> \"/* not a comment\\n// nor this\\n\"\n"
  - evidence: input-5#22 real "tb4 ==> \"x\"\n"
  - evidence: input-1#29 real "hello\n  world\n\n"

- RULE input.12: An open block comment keeps the continuation prompt until `*/` is read, with nothing printed; code that follows the `*/` on the closing line is evaluated, and a `//` inside the open block comment does not end it.
  - evidence: input-1#11 prompt "\njshell> |   ...> "
  - evidence: input-1#11 real= ""
  - evidence: input-5#43 prompt "\njshell> |   ...> "
  - evidence: input-5#43 real "bc2 ==> 2\n"
  - evidence: input-5#44 real= ""
  - evidence: input-5#44 prompt "\njshell> |   ...> |   ...> "
  - evidence: input-7#18 real "z2 ==> 1\nz3 ==> 2\n"

- RULE input.13: An unclosed string literal or char literal is not waited for: the line is rejected at once with an error, the prompt after it is normal, and nothing is kept for the next line. Inside an open method the failing line ends the whole snippet, and the following lines are then read as new inputs (a lone `}` is an error).
  - evidence: input-1#45 prompt "\njshell> "
  - evidence: input-1#45 real "|  Error:\n|  unclosed string literal\n|  String u = \"abc\n|             ^\n"
  - evidence: input-1#46 real "|  Error:\n|  unclosed character literal\n|  char ch = 'a\n|            ^\n"
  - evidence: input-7#19 prompt "\njshell> |   ...> |\njshell> |\njshell> "
  - evidence: input-7#19 real "|  Error:\n|  unclosed string literal\n|      String t = \"abc;\n|                 ^\n|  Error:\n|  reached end of file while parsing\n|      String t = \"abc;\n|                      ^\n|  Error:\n|  illegal start of statement\n|  }\n|  ^\n"

- RULE input.14: A syntax error on a line inside an open method is reported right after that line (the errors for the lines so far), the snippet is dropped, the prompt returns to normal, and each remaining line is read as a fresh input (the closing `}` alone is an error).
  - evidence: input-1#44 prompt "\njshell> |   ...> |\njshell> "
  - evidence: input-1#44 real "|  Error:\n|  illegal start of expression\n|      return n +;\n|                ^\n|  Error:\n|  reached end of file while parsing\n|      return n +;\n|                 ^\n|  Error:\n|  illegal start of statement\n|  }\n|  ^\n"

- RULE input.15: A lone `}`, a lone `)` and a lone `else` are each rejected with an error; `else` alone prints the same "reached end of file" error twice.
  - evidence: input-5#29 real "|  Error:\n|  illegal start of statement\n|  }\n|  ^\n"
  - evidence: input-5#30 real "|  Error:\n|  illegal start of expression\n|  )\n|  ^\n"
  - evidence: input-5#10 real "|  Error:\n|  reached end of file while parsing\n|  else\n|      ^\n|  Error:\n|  reached end of file while parsing\n|  else\n|      ^\n"

- RULE input.16: An annotation on a line by itself is rejected at once with an error that shows the line with a `;` added (`@Deprecated;`), and the method on the next line is then created alone.
  - evidence: input-7#22 prompt "\njshell> |\njshell> "
  - evidence: input-7#22 real "|  Error:\n|  illegal start of type\n|  @Deprecated;\n|             ^\n|  created method old()\n"

## Blank lines

- RULE input.17: An empty line at the prompt prints nothing and the prompt stays normal; two empty lines print nothing either. A line of only spaces behaves the same.
  - evidence: input-1#6 real= ""
  - evidence: input-1#6 prompt "\njshell> "
  - evidence: input-1#7 real= ""
  - evidence: input-1#7 prompt "\njshell> |\njshell> "
  - evidence: input-5#7 real= ""

- RULE input.18: An empty line inside an open snippet (method body, incomplete expression, text block, argument list) does not end it and does not evaluate it: the continuation prompt is shown for the blank line too, and the snippet completes when its real closing line arrives. The blank line stays in the snippet source.
  - evidence: input-1#8 prompt "\njshell> |   ...> |   ...> |   ...> "
  - evidence: input-1#8 real "|  created method h(int)\n"
  - evidence: input-1#8 events "\"source\":\"int h(int n) {\\n\\n    return n;\\n}\\n\""
  - evidence: input-1#43 real "$46 ==> 3\n"
  - evidence: input-5#15 real "$18 ==> 3\n"
  - evidence: input-5#15 prompt "\njshell> |   ...> |   ...> |   ...> "
  - evidence: input-7#20 real "$24 ==> 1\n"
  - evidence: input-5#41 real "|  created method cbm()\n"

## Comments

- RULE input.19: A comment-only line at the prompt (`// hi`, `/* x */`) prints nothing, and the prompt stays normal. A line comment before a value does not change that value's result.
  - evidence: input-1#9 real= ""
  - evidence: input-1#9 prompt "\njshell> "
  - evidence: input-1#10 real= ""
  - evidence: input-6#0 prompt "\njshell> |\njshell> "
  - evidence: input-6#0 real "$1 ==> 1\n"

- RULE input.20: Comment lines inside an open snippet are accepted and do not end it.
  - evidence: input-1#12 real "|  created method c1(int)\n"
  - evidence: input-5#16 real "|  created method cm()\n"

- RULE input.21: A comment after a snippet on the same line (`// ...` or `/* ... */`), or before it, does not change what is printed; a `;` inside a trailing line comment does not count as the statement's semicolon (the expression still printed its value).
  - evidence: input-1#13 real "d ==> 4\n"
  - evidence: input-1#14 real "d2 ==> 5\n"
  - evidence: input-1#15 real "$12 ==> 9\n"
  - evidence: input-5#0 real "m1 ==> 1\n"
  - evidence: input-5#1 real "m2 ==> 2\nm3 ==> 3\n"
  - evidence: input-5#2 real "$4 ==> 2\n"

## Several snippets on one line

- RULE input.22: Two or three snippets on one line are each evaluated in order and each prints its own feedback, in the order written. This holds for two declarations, two expressions, a declaration then an expression, three snippets, an import then a declaration, a declaration then a method, a method then an expression, and a leading `;` then a declaration. The second snippet needs no semicolon.
  - evidence: input-1#16 real "a ==> 1\nb ==> 2\n"
  - evidence: input-1#17 real "$15 ==> 2\n$16 ==> 4\n"
  - evidence: input-1#18 real "e ==> 7\n$18 ==> 14\n"
  - evidence: input-1#19 real "p ==> 1\nq ==> 2\n$21 ==> 3\n"
  - evidence: input-5#3 real "n1 ==> 1\nn2 ==> 2\n"
  - evidence: input-5#4 real "1\n2\n"
  - evidence: input-5#23 real "li ==> []\n"
  - evidence: input-5#24 real "mm ==> 1\n|  created method sq(int)\n"
  - evidence: input-5#25 real "|  created method v()\n"
  - evidence: input-5#40 real "af ==> 1\n"
  - evidence: input-5#1 real "m2 ==> 2\nm3 ==> 3\n"

- RULE input.23: The number in a temporary name such as `$18` is the number of that snippet in the session, counted over every snippet (declarations, methods and statements included), so the numbers skip over the other snippets. The programming interface, which numbers its own temporaries from 1, reports the same snippet number as the event id.
  - evidence: input-1#18 real "e ==> 7\n$18 ==> 14\n"
  - evidence: input-1#18 events "\"id\":\"18\""
  - evidence: input-1#15 real "$12 ==> 9\n"
  - evidence: input-1#15 events "\"id\":\"12\""

- RULE input.24: When one snippet on a multi-snippet line fails, the snippets after it on that line are not run: an incompatible-types error stopped the rest of the line (the later `ok2` does not exist afterward), and an exception stopped the rest of the line the same way (the later `b5` does not exist), while the snippets before it had already printed. The public API, fed the same line, did evaluate the snippets after the failing one.
  - evidence: input-7#0 real "ok1 ==> 1\n|  Error:\n|  incompatible types: java.lang.String cannot be converted to int\n|   int bad1 = \"s\";\n|              ^-^\n"
  - evidence: input-7#1 real "|  Error:\n|  cannot find symbol\n|    symbol:   variable ok2\n|  ok2\n|  ^-^\n"
  - evidence: input-7#2 real "a5 ==> 1\n|  Exception java.lang.ArithmeticException: / by zero\n|        at (#3:1)\n"
  - evidence: input-7#3 real "|  Error:\n|  cannot find symbol\n|    symbol:   variable b5\n|  b5\n|  ^^\n"
  - evidence: input-5#28 real "p\n|  Exception java.lang.NumberFormatException: For input string: \"x\"\n"
  - evidence: input-7#0 events "\"name\":\"ok2\""

- RULE input.25: When the first snippet on a line is complete and the last one is incomplete, the complete one is evaluated and printed first, then the continuation prompt appears for the unfinished one. The same holds for a complete declaration followed by `{`, and for a closing line that has a snippet after the `}`.
  - evidence: input-7#4 prompt "\njshell> |   ...> "
  - evidence: input-7#4 real "x1 ==> 1\ny1 ==> 3\n"
  - evidence: input-7#6 real "u1 ==> 1\n"
  - evidence: input-7#7 real "|  created method k1()\n$10 ==> 1\n"
  - evidence: input-7#18 real "z2 ==> 1\nz3 ==> 2\n"

- RULE input.26: A complete block followed by a snippet on the same line evaluates both (`if (true) { } int u4 = 1;` printed `u4 ==> 1`); an empty `;` produces nothing, and `;;` and a lone `;` are accepted silently.
  - evidence: input-7#17 real "u4 ==> 1\n"
  - evidence: input-1#36 real= ""
  - evidence: input-1#37 real= ""
  - evidence: input-1#38 real= ""

## Semicolons, spaces and tabs

- RULE input.27: A statement or declaration with or without its closing semicolon behaves the same; a value expression with a semicolon still prints its value; extra semicolons or a space before the semicolon are accepted.
  - evidence: input-1#20 real "$22 ==> 7\n"
  - evidence: input-1#21 real "no semi\n"
  - evidence: input-1#22 real "semi\n"
  - evidence: input-5#5 real "dd ==> 1\n"
  - evidence: input-5#6 real "sb ==> 5\n"
  - evidence: input-5#36 real "$42 ==> 1\n"
  - evidence: input-5#37 real "$43 ==> 2\n"

- RULE input.28: A bare variable name echoes `name ==> value` using the variable's own name rather than creating a temporary; a bare literal creates one.
  - evidence: input-5#38 real "mm ==> 3\n"
  - evidence: input-5#39 real "$45 ==> \"hi\"\n"

- RULE input.29: Leading and trailing spaces on a line are ignored for snippets.
  - evidence: input-1#23 real "sp ==> 9\n"
  - evidence: input-1#24 real "tr ==> 8\n"
  - evidence: input-1#25 real "$27 ==> 17\n"

- RULE input.30: A command with leading spaces is not a command: `  /vars` is treated as code and fails with an error, while the same command with trailing spaces (`/vars   `) works.
  - evidence: input-7#15 real "|  Error:\n|  illegal start of expression\n|    /vars\n|    ^\n"
  - evidence: input-7#16 real "|    int ok1 = 1\n"

## Strings, Unicode and long lines

- RULE input.31: A string literal containing `/*` or `//` is an ordinary string: it does not start a comment, does not hide the rest of the line, and the semicolon after it still ends the snippet. Escaped quotes and `\n` stay escaped in the echo.
  - evidence: input-1#30 real "sc ==> \"a /* b\"\n"
  - evidence: input-1#31 real "sl ==> \"a // b\"\n"
  - evidence: input-1#32 real "$34 ==> \"a /* ba // b\"\n"
  - evidence: input-5#45 real "eq ==> \"a\\\"b\"\n"
  - evidence: input-5#46 real "bn ==> \"a\\nb\"\n"
  - evidence: input-5#47 real "cl ==> '{'\n"

- RULE input.32: Unicode identifiers (accented, Greek, CJK) are accepted and echoed as typed; a `a` escape in an identifier is echoed as the character it stands for; an emoji in a string counts as two chars.
  - evidence: input-1#33 real "café ==> 1\n"
  - evidence: input-1#35 real "αβγ ==> \"x\"\n"
  - evidence: input-5#32 real "变量 ==> 1\n"
  - evidence: input-5#31 real "ab ==> 1\n"
  - evidence: input-5#33 real "em ==> \"😀\"\n"
  - evidence: input-5#34 real "$40 ==> 2\n"

- RULE input.33: A 509-character line is read as one line with a single normal prompt and evaluated normally. When a long string value is echoed, the echo is shortened to the first 48 characters, ` ... `, and the last 25 characters.
  - evidence: input-2#0 prompt "\njshell> "
  - evidence: input-2#0 real "x500 ==> 249\n"
  - evidence: input-5#35 real "longs ==> \"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa ... aaaaaaaaaaaaaaaaaaaaaaaaa\"\n"

## When the input ends inside a snippet

- RULE input.34: When the input ends while a snippet is still open, the tool prints `Incomplete input:` followed by the lines read so far; the prompt shown last was the continuation prompt (the third line fed was an empty line, which was also read inside the open snippet).
  - evidence: input-6#1 real "|  Incomplete input: int open1(int n) {\n    return n;\n\n"
  - evidence: input-6#1 prompt "\njshell> |   ...> |   ...> "
  - evidence: input-6#1 tail "   ...> \r\n"

## Output shape

- RULE input.35: A `for` loop that prints without a newline leaves no extra output after the loop's own text (`012`); a statement that prints gives only the program's text and no result line.
  - evidence: input-1#52 real "012"
  - evidence: input-1#54 real "nfe\n"
  - evidence: input-1#2 real "yes\n"

- RULE input.36: Declaring a class, record, interface, enum or method prints a `|  created ...` line; a variable prints `name ==> value`; none of these prints anything else.
  - evidence: input-1#49 real "|  created class Pt\n"
  - evidence: input-1#50 real "|  created record R\n"
  - evidence: input-1#51 real "|  created interface Sh\n"
  - evidence: input-7#29 real "|  created enum Color\n"
  - evidence: input-7#30 real "vv ==> [1, 2]\n"

## Local engine

- RULE input.37: With `--execution local` every entry in these sessions printed exactly the same text as the default engine, with the same prompts, including the multi-line, error, multi-snippet and blank-line cases.
  - evidence: input-1#1 local "|  created method square(int)\n"
  - evidence: input-1#44 local "|  Error:\n|  illegal start of expression\n|      return n +;\n|                ^\n|  Error:\n|  reached end of file while parsing\n|      return n +;\n|                 ^\n|  Error:\n|  illegal start of statement\n|  }\n|  ^\n"
  - evidence: input-5#13 local "|  Error:\n|  reached end of file while parsing\n|  1 :\n|     ^\n$16 ==> 2\n"
  - evidence: input-7#0 local "ok1 ==> 1\n|  Error:\n|  incompatible types: java.lang.String cannot be converted to int\n|   int bad1 = \"s\";\n|              ^-^\n"
  - evidence: input-1#16 local "a ==> 1\nb ==> 2\n"

## Surprises

- A tab character in a fed line ended the session early (only one line was read), so tab behavior could not be recorded.
- A `/` line after a complete line is read as a command (ambiguous `/`), but after an incomplete line it is part of the expression.
- After an error or exception in the middle of a multi-snippet line, the real tool drops the rest of the line, while the public API evaluates every snippet.
- `else` on a line after a complete one-line `if` is an error; the `if` was not held back waiting for an `else`.
- `true ?` then `1 :` gives an error on the second line instead of waiting for the third.
- `  /vars` (leading spaces) is code, not a command, but `/vars   ` (trailing spaces) works.
- A lone `@Deprecated` is rejected immediately with `@Deprecated;` shown in the error.
- A long string value is echoed in a shortened form with ` ... ` in the middle.
- The temp-variable number in the tool (`$12`) is the snippet number, not a count of temporaries.

## Open questions

- Tab characters: any line containing a tab ended the session after one line was read; what the tool does with a tab (completion?) is not recorded.
- Printed lambdas show an object hash code that changes between runs, so the exact echo of a lambda variable could not be pinned (those probes were removed).
- The exact limit on the length of an echoed value (here 48 + ` ... ` + 25 for a 500-character string) was seen for one length only.
- How the tool treats a line with a non-ASCII space before a snippet was not isolated.
