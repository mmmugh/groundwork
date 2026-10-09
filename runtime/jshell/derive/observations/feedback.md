# Observations: feedback modes

Sessions run: feedback-1 (concise), feedback-2 (silent), feedback-3 (verbose) and feedback-4 (normal) each run one fixed battery of 17 entries (a value, a variable declaration, an uninitialized declaration, a method create, the same method modified, a class create, the class changed so it is replaced, a compile error, an exception, a method with a forward reference, an import, a statement that prints, /vars, /drop of a variable, a multi-line method, and a value after the battery) after one `/set feedback <mode>` entry. feedback-5 switches back and forth between all four modes, asks `/set feedback` in each, and covers `-retain`, an unknown mode name, abbreviated mode names, extra words and abbreviated commands. feedback-6 lists the settings commands (`/set`, `/set mode`, `/set prompt`, `/set format`, `/set truncation`, `/set editor`, `/set start`, and per-mode forms) in full. feedback-7 (concise), feedback-8 (silent), feedback-9 (verbose) and feedback-10 (normal, with no mode switch) run a second battery of 37 entries (bare variable, assignment, redeclaration, replaced variable, record, interface, enum, unresolved references, a variable that throws, arrays, long strings, drops of methods and classes, a warning, two snippets on one line). feedback-11 covers the order of `-retain`, silent-mode multi-line errors, the listing commands in silent and concise, and drops with dependents in concise and verbose. The sessions ran against the pinned JDK 25.0.4.1 and each is a fresh jshell.

- RULE feedback.1: The startup banner is printed in every session before the first entry, and the real tool starts in normal feedback mode; starting in another mode is not possible here, so only the banner's presence is noted.
  - evidence: feedback-1#0 banner "|  Welcome to JShell -- Version 25.0.4.1\n|  For an introduction type: /help intro\n"
  - evidence: feedback-3#0 banner "|  Welcome to JShell -- Version 25.0.4.1\n|  For an introduction type: /help intro\n"
  - evidence: feedback-5#0 real "|  /set feedback normal\n"
  - evidence: feedback-10#0 real "|  /set feedback normal\n"

- RULE feedback.2: The prompts are mode-specific: normal and verbose show a blank line then `jshell> ` with the continuation prompt `   ...> `; concise shows `jshell> ` with `   ...> `; silent shows `-> ` with `>> `. The prompt on the line that switches the mode is still the previous mode's prompt, and the next line shows the new one.
  - evidence: feedback-1#15 prompt "jshell> |   ...> |   ...> "
  - evidence: feedback-2#15 prompt "-> |>> |>> "
  - evidence: feedback-3#15 prompt "\njshell> |   ...> |   ...> "
  - evidence: feedback-4#15 prompt "\njshell> |   ...> |   ...> "
  - evidence: feedback-1#1 prompt "jshell> "
  - evidence: feedback-2#1 prompt "-> "
  - evidence: feedback-5#4 prompt "jshell> "
  - evidence: feedback-5#5 prompt "-> "
  - evidence: feedback-5#14 prompt "-> "
  - evidence: feedback-5#15 prompt "jshell> "
  - evidence: feedback-1#16 tail "jshell> \r\n"
  - evidence: feedback-2#16 tail "-> \r\n"
  - evidence: feedback-3#16 tail "\njshell> \r\n"

- RULE feedback.3: `/set feedback verbose` and `/set feedback normal` print `|  Feedback mode: <name>`; `/set feedback concise` and `/set feedback silent` print nothing, whichever mode the session was in before.
  - evidence: feedback-3#0 real "|  Feedback mode: verbose\n"
  - evidence: feedback-4#0 real "|  Feedback mode: normal\n"
  - evidence: feedback-1#0 real= ""
  - evidence: feedback-2#0 real= ""
  - evidence: feedback-5#7 real "|  Feedback mode: verbose\n"
  - evidence: feedback-5#10 real "|  Feedback mode: normal\n"
  - evidence: feedback-5#15 real "|  Feedback mode: verbose\n"
  - evidence: feedback-5#17 real "|  Feedback mode: normal\n"
  - evidence: feedback-5#18 real "|  Feedback mode: normal\n"
  - evidence: feedback-7#0 real= ""

- RULE feedback.4: A value (`2 + 3`) prints `$1 ==> 5` in concise, verbose and normal, and nothing in silent; verbose adds `|  created scratch variable $1 : int`.
  - evidence: feedback-1#1 real "$1 ==> 5\n"
  - evidence: feedback-4#1 real "$1 ==> 5\n"
  - evidence: feedback-3#1 real "$1 ==> 5\n|  created scratch variable $1 : int\n"
  - evidence: feedback-2#1 real= ""

- RULE feedback.5: A variable declaration with an initializer prints `x ==> 5` in normal, nothing in concise or silent, and in verbose also `|  created variable x : int`. An uninitialized declaration prints `s ==> null` in normal and verbose (verbose adds `|  created variable s : String`) and nothing in concise or silent.
  - evidence: feedback-4#2 real "x ==> 5\n"
  - evidence: feedback-3#2 real "x ==> 5\n|  created variable x : int\n"
  - evidence: feedback-1#2 real= ""
  - evidence: feedback-2#2 real= ""
  - evidence: feedback-4#3 real "s ==> null\n"
  - evidence: feedback-3#3 real "s ==> null\n|  created variable s : String\n"
  - evidence: feedback-1#3 real= ""
  - evidence: feedback-2#3 real= ""
  - evidence: feedback-9#21 real "list ==> []\n|  created variable list : ArrayList<String>\n"
  - evidence: feedback-9#23 real "arr ==> int[3] { 1, 2, 3 }\n|  created variable arr : int[]\n"

- RULE feedback.6: Creating a method prints `|  created method sq(int)` in normal and verbose, nothing in concise or silent. Creating a class, record, interface or enum prints `|  created class A` (`record`, `interface`, `enum`) in normal and verbose, nothing in concise or silent.
  - evidence: feedback-4#4 real "|  created method sq(int)\n"
  - evidence: feedback-3#4 real "|  created method sq(int)\n"
  - evidence: feedback-1#4 real= ""
  - evidence: feedback-2#4 real= ""
  - evidence: feedback-4#6 real "|  created class A\n"
  - evidence: feedback-3#6 real "|  created class A\n"
  - evidence: feedback-1#6 real= ""
  - evidence: feedback-2#6 real= ""
  - evidence: feedback-10#10 real "|  created record P\n"
  - evidence: feedback-10#11 real "|  created interface I\n"
  - evidence: feedback-10#12 real "|  created enum Color\n"
  - evidence: feedback-7#12 real= ""

- RULE feedback.7: Redefining a method with the same signature prints `|  modified method sq(int)` in normal; verbose adds `|    update overwrote method sq(int)`; concise and silent print nothing. Redefining a class prints `|  replaced class A` in normal; verbose adds `|    update overwrote class A`.
  - evidence: feedback-4#5 real "|  modified method sq(int)\n"
  - evidence: feedback-3#5 real "|  modified method sq(int)\n|    update overwrote method sq(int)\n"
  - evidence: feedback-1#5 real= ""
  - evidence: feedback-2#5 real= ""
  - evidence: feedback-4#7 real "|  replaced class A\n"
  - evidence: feedback-3#7 real "|  replaced class A\n|    update overwrote class A\n"

- RULE feedback.8: Redeclaring a variable with the same type prints `n ==> 3` in normal and, in verbose, `|  modified variable n : int` plus `|    update overwrote variable n : int`; with a different type verbose prints `|  replaced variable n : String` plus `|    update overwrote variable n : int`. Concise and silent print nothing.
  - evidence: feedback-9#6 real "n ==> 3\n|  modified variable n : int\n|    update overwrote variable n : int\n"
  - evidence: feedback-9#7 real "n ==> \"text\"\n|  replaced variable n : String\n|    update overwrote variable n : int\n"
  - evidence: feedback-10#6 real "n ==> 3\n"
  - evidence: feedback-10#7 real "n ==> \"text\"\n"
  - evidence: feedback-7#6 real= ""
  - evidence: feedback-7#7 real= ""

- RULE feedback.9: A method whose return type changes prints `|  replaced method h()` in normal and verbose (verbose adds `|    update overwrote method h()`); concise and silent print nothing.
  - evidence: feedback-10#31 real "|  replaced method h()\n"
  - evidence: feedback-9#31 real "|  replaced method h()\n|    update overwrote method h()\n"
  - evidence: feedback-7#31 real= ""

- RULE feedback.10: Compile errors print the same `|  Error:` block in all four modes, including silent; concise does not shorten it.
  - evidence: feedback-1#8 real "|  Error:\n|  incompatible types: java.lang.String cannot be converted to int\n|  int y = \"hello\";\n|          ^-----^\n"
  - evidence: feedback-2#8 real "|  Error:\n|  incompatible types: java.lang.String cannot be converted to int\n|  int y = \"hello\";\n|          ^-----^\n"
  - evidence: feedback-3#8 real "|  Error:\n|  incompatible types: java.lang.String cannot be converted to int\n|  int y = \"hello\";\n|          ^-----^\n"
  - evidence: feedback-4#8 real "|  Error:\n|  incompatible types: java.lang.String cannot be converted to int\n|  int y = \"hello\";\n|          ^-----^\n"
  - evidence: feedback-8#19 real "|  Error:\n|  cannot find symbol\n|    symbol:   class Missing\n"
  - evidence: feedback-11#10 real "|  Error:\n|  incompatible types: java.lang.String cannot be converted to int\n|      return \"x\";\n|             ^-^\n"

- RULE feedback.11: An exception prints the same `|  Exception ...` block with its `at` lines in all four modes, including silent; a variable whose initializer throws also prints nothing else (no created line, even in verbose).
  - evidence: feedback-1#9 real "|  Exception java.lang.ArithmeticException: / by zero\n|        at (#8:1)\n"
  - evidence: feedback-2#9 real "|  Exception java.lang.ArithmeticException: / by zero\n|        at (#8:1)\n"
  - evidence: feedback-3#9 real "|  Exception java.lang.ArithmeticException: / by zero\n|        at (#8:1)\n"
  - evidence: feedback-4#9 real "|  Exception java.lang.ArithmeticException: / by zero\n|        at (#8:1)\n"
  - evidence: feedback-9#20 real "|  Exception java.lang.NumberFormatException: For input string: \"x\"\n"
  - evidence: feedback-8#20 real "|  Exception java.lang.NumberFormatException: For input string: \"x\"\n"

- RULE feedback.12: A method with an unresolved forward reference prints `|  created method f(), however, it cannot be invoked until method g() is declared` in concise, normal and verbose, and nothing in silent. A class extending a missing class prints the `cannot be referenced until class Missing is declared` form the same way. Calling the unresolved method prints `|  attempted to call method f2() which cannot be invoked until method g2() is declared` in concise, normal and verbose and nothing in silent; `new B()` of an unresolved class is a compile error in all modes.
  - evidence: feedback-1#10 real "|  created method f(), however, it cannot be invoked until method g() is declared\n"
  - evidence: feedback-4#10 real "|  created method f(), however, it cannot be invoked until method g() is declared\n"
  - evidence: feedback-3#10 real "|  created method f(), however, it cannot be invoked until method g() is declared\n"
  - evidence: feedback-2#10 real= ""
  - evidence: feedback-7#13 real "|  created class B, however, it cannot be referenced until class Missing is declared\n"
  - evidence: feedback-8#13 real= ""
  - evidence: feedback-7#16 real "|  attempted to call method f2() which cannot be invoked until method g2() is declared\n"
  - evidence: feedback-8#16 real= ""
  - evidence: feedback-8#14 real "|  Error:\n|  cannot find symbol\n|    symbol:   class B\n|  new B()\n|      ^\n"

- RULE feedback.13: Defining the missing method later: verbose lists the dependent method as an update (`|    update modified method f2()`); normal prints only the created line; concise and silent print nothing. Calling the now-resolved method prints its value in concise, normal and verbose.
  - evidence: feedback-9#17 real "|  created method g2()\n|    update modified method f2()\n"
  - evidence: feedback-10#17 real "|  created method g2()\n"
  - evidence: feedback-7#17 real= ""
  - evidence: feedback-7#18 real "$17 ==> 7\n"
  - evidence: feedback-8#18 real= ""

- RULE feedback.14: An import prints nothing in any mode (concise, silent, verbose, normal).
  - evidence: feedback-1#11 real= ""
  - evidence: feedback-2#11 real= ""
  - evidence: feedback-3#11 real= ""
  - evidence: feedback-4#11 real= ""
  - evidence: feedback-3#11 prompt "\njshell> "

- RULE feedback.15: A statement that prints shows only the program's own output in every mode; statements without a value (`if`, `for`, a void call) print nothing from the tool in any mode.
  - evidence: feedback-1#12 real "hi\n"
  - evidence: feedback-2#12 real "hi\n"
  - evidence: feedback-3#12 real "hi\n"
  - evidence: feedback-4#12 real "hi\n"
  - evidence: feedback-8#33 real "0\n1\n"
  - evidence: feedback-9#32 real "long\n"
  - evidence: feedback-9#8 real= ""

- RULE feedback.16: `/vars` prints the same listing in every mode, including silent.
  - evidence: feedback-1#13 real "|    int $1 = 5\n|    int x = 5\n|    String s = null\n|    int z = 0\n"
  - evidence: feedback-2#13 real "|    int $1 = 5\n|    int x = 5\n|    String s = null\n|    int z = 0\n"
  - evidence: feedback-3#13 real "|    int $1 = 5\n|    int x = 5\n|    String s = null\n|    int z = 0\n"
  - evidence: feedback-4#13 real "|    int $1 = 5\n|    int x = 5\n|    String s = null\n|    int z = 0\n"

- RULE feedback.17: `/methods`, `/types`, `/list` and `/imports` print their listings in silent and in concise alike (`/methods` printed nothing when no method was defined).
  - evidence: feedback-11#13 real "|    class Q\n"
  - evidence: feedback-11#14 real "\n   1 : 1 + 2\n   2 : class Q {\n           int a;\n       }\n"
  - evidence: feedback-11#15 real "|    import java.base\n"
  - evidence: feedback-11#18 real "|    class Q\n"
  - evidence: feedback-11#19 real "\n   1 : 1 + 2\n   2 : class Q {\n           int a;\n       }\n"
  - evidence: feedback-11#20 real "|    import java.base\n"
  - evidence: feedback-11#12 real= ""

- RULE feedback.18: `/drop` of a variable, method or class prints `|  dropped variable x` (`method sq(int)`, `class K`) in normal and verbose, and nothing in concise or silent. `/drop` of a missing name prints `|  No such snippet: nope` in all modes, with a second line `|  See /types, /methods, /vars, or /list` in normal and verbose only.
  - evidence: feedback-4#14 real "|  dropped variable x\n"
  - evidence: feedback-3#14 real "|  dropped variable x\n"
  - evidence: feedback-1#14 real= ""
  - evidence: feedback-2#14 real= ""
  - evidence: feedback-10#26 real "|  dropped method sq(int)\n"
  - evidence: feedback-10#28 real "|  dropped class K\n"
  - evidence: feedback-7#26 real= ""
  - evidence: feedback-7#29 real "|  No such snippet: nope\n"
  - evidence: feedback-8#29 real "|  No such snippet: nope\n"
  - evidence: feedback-9#29 real "|  No such snippet: nope\n|  See /types, /methods, /vars, or /list\n"
  - evidence: feedback-10#29 real "|  No such snippet: nope\n|  See /types, /methods, /vars, or /list\n"

- RULE feedback.19: Dropping a variable that a method uses: verbose prints the update line with the new unresolved state (`|    update modified method useBase() which cannot be invoked until variable base is declared`); concise prints nothing for the drop and prints the `attempted to call method` line when the dependent is then called.
  - evidence: feedback-11#27 real "|  dropped variable base\n|    update modified method useBase() which cannot be invoked until variable base is declared\n"
  - evidence: feedback-11#26 real "base ==> 2\n|  created variable base : int\n|    update modified method useBase()\n"
  - evidence: feedback-11#23 real= ""
  - evidence: feedback-11#24 real "|  attempted to call method useBase() which cannot be invoked until variable base is declared\n"
  - evidence: feedback-11#28 real "|  dropped method useBase()\n"

- RULE feedback.20: A multi-line method (three fed lines) prints its single created line after the last line in normal and verbose, and nothing in concise or silent; the continuation prompt shows for the second and third lines in every mode.
  - evidence: feedback-4#15 real "|  created method cube(int)\n"
  - evidence: feedback-3#15 real "|  created method cube(int)\n"
  - evidence: feedback-1#15 real= ""
  - evidence: feedback-2#15 real= ""
  - evidence: feedback-11#11 real= ""

- RULE feedback.21: A value after the battery (`cube(3)`) numbers its scratch variable after the failed and dropped entries seen so far (`$13`); concise and normal print `$13 ==> 27`, verbose adds the created-scratch-variable line, silent prints nothing.
  - evidence: feedback-1#16 real "$13 ==> 27\n"
  - evidence: feedback-4#16 real "$13 ==> 27\n"
  - evidence: feedback-3#16 real "$13 ==> 27\n|  created scratch variable $13 : int\n"
  - evidence: feedback-2#16 real= ""

- RULE feedback.22: Concise prints a bare variable name's value (`n ==> 10`) but not an assignment (`n = 20` prints nothing); normal prints both; verbose prints both with `|  value of n : int` and `|  assigned to n : int`; silent prints neither. A compound assignment `n += 1` is a value: `$4 ==> 21` in concise, normal and verbose.
  - evidence: feedback-7#2 real "n ==> 10\n"
  - evidence: feedback-7#3 real= ""
  - evidence: feedback-10#3 real "n ==> 20\n"
  - evidence: feedback-9#2 real "n ==> 10\n|  value of n : int\n"
  - evidence: feedback-9#3 real "n ==> 20\n|  assigned to n : int\n"
  - evidence: feedback-8#2 real= ""
  - evidence: feedback-8#3 real= ""
  - evidence: feedback-7#4 real "$4 ==> 21\n"
  - evidence: feedback-9#4 real "$4 ==> 21\n|  created scratch variable $4 : int\n"

- RULE feedback.23: String values print quoted, and a long string is printed whole in every mode that prints values (no truncation at the length used).
  - evidence: feedback-7#5 real "$5 ==> \"hello\"\n"
  - evidence: feedback-10#24 real "$22 ==> \"a very long string value that goes on and on and on and on and on and on and on and on and on and on and on\"\n"
  - evidence: feedback-7#24 real "$22 ==> \"a very long string value that goes on and on and on and on and on and on and on and on and on and on and on\"\n"

- RULE feedback.24: A snippet that warns prints the `|  Warning:` block in every mode, silent included; the declared name and value lines around it follow the mode (normal `raw ==> []` then the warning then `$30 ==> true`; concise skips `raw ==> []`; silent skips both lines; verbose adds the created lines). Two snippets on one line each get their own output.
  - evidence: feedback-10#34 real "raw ==> []\n|  Warning:\n|  unchecked call to add(E) as a member of the raw type java.util.List\n|   raw.add(1);\n|   ^--------^\n$30 ==> true\n"
  - evidence: feedback-7#34 real "|  Warning:\n|  unchecked call to add(E) as a member of the raw type java.util.List\n|   raw.add(1);\n|   ^--------^\n$30 ==> true\n"
  - evidence: feedback-8#34 real "|  Warning:\n|  unchecked call to add(E) as a member of the raw type java.util.List\n|   raw.add(1);\n|   ^--------^\n"
  - evidence: feedback-9#34 real "raw ==> []\n|  created variable raw : java.util.List\n|  Warning:\n"
  - evidence: feedback-10#35 real "a1 ==> 1\na2 ==> 2\n"
  - evidence: feedback-9#35 real "a1 ==> 1\n|  created variable a1 : int\na2 ==> 2\n|  created variable a2 : int\n"
  - evidence: feedback-7#35 real= ""

- RULE feedback.25: A value entered with a trailing semicolon (`3 + 4;`) still prints a scratch variable value in concise, normal and verbose.
  - evidence: feedback-7#36 real "$33 ==> 7\n"
  - evidence: feedback-10#36 real "$33 ==> 7\n"
  - evidence: feedback-9#36 real "$33 ==> 7\n|  created scratch variable $33 : int\n"
  - evidence: feedback-8#36 real= ""

- RULE feedback.26: `/set feedback` with no argument prints the current mode as a command, a blank `|  ` line, and the available modes in alphabetical order (concise, normal, silent, verbose), in every mode including silent. A mode switch that was never retained is shown as the plain command for the current mode.
  - evidence: feedback-5#0 real "|  /set feedback normal\n|  \n|  Available feedback modes:\n|     concise\n|     normal\n|     silent\n"
  - evidence: feedback-5#3 real "|  /set feedback concise\n|  \n|  Available feedback modes:\n|     concise\n|     normal\n|     silent\n"
  - evidence: feedback-5#6 real "|  /set feedback silent\n|  \n|  Available feedback modes:\n|     concise\n|     normal\n|     silent\n"
  - evidence: feedback-5#9 real "|  /set feedback verbose\n|  \n|  Available feedback modes:\n|     concise\n|     normal\n|     silent\n"
  - evidence: feedback-5#12 real "|  /set feedback normal\n|  \n|  Available feedback modes:\n|     concise\n|     normal\n|     silent\n"

- RULE feedback.27: `/set feedback -retain verbose` prints `|  Feedback mode: verbose` and switches to it; `-retain` with no mode prints nothing. Afterward `/set feedback` lists two command lines: `/set feedback -retain verbose` first and the current mode second. The retained setting did not carry into later sessions (feedback-6 started in normal after feedback-5 retained verbose).
  - evidence: feedback-5#19 real "|  Feedback mode: verbose\n"
  - evidence: feedback-5#20 real "$5 ==> 2\n|  created scratch variable $5 : int\n"
  - evidence: feedback-5#21 real= ""
  - evidence: feedback-5#35 real "|  /set feedback -retain verbose\n|  /set feedback silent\n|  \n|  Available feedback modes:\n|     concise\n"
  - evidence: feedback-6#0 real "|  /set feedback normal\n"
  - evidence: feedback-10#0 real "|  /set feedback normal\n"

- RULE feedback.28: The `-retain` option works before or after the mode and abbreviated as `-r`; the listing then shows `/set feedback -retain <mode>` for the retained mode. With `-retain` and an unknown mode only the one error line prints. Retained and current can differ, and the listing shows both lines.
  - evidence: feedback-11#0 real "|  Feedback mode: verbose\n"
  - evidence: feedback-11#1 real= ""
  - evidence: feedback-11#3 real "|  /set feedback -retain concise\n|  \n|  Available feedback modes:\n|     concise\n|     normal\n|     silent\n"
  - evidence: feedback-11#4 real "|  Does not match any current feedback mode: nonsense -- /set feedback -retain nonsense\n"
  - evidence: feedback-11#29 real "|  /set feedback -retain concise\n|  /set feedback verbose\n|  \n|  Available feedback modes:\n|     concise\n"

- RULE feedback.29: An unknown mode name prints the mismatch with the command echoed after `--`, the list of available modes, and a help pointer; the mode is unchanged afterward.
  - evidence: feedback-5#22 real "|  Does not match any current feedback mode: nonsense -- /set feedback nonsense\n|  Available feedback modes:\n"
  - evidence: feedback-5#23 real "$6 ==> 5\n|  created scratch variable $6 : int\n"
  - evidence: feedback-5#34 real "|  Does not match any current feedback mode: VERBOSE -- /set feedback VERBOSE\n"

- RULE feedback.30: Mode names are case sensitive, and a unique prefix is accepted: `v`, `ve`, `conc`, `c`, `n`, `no`, `s`, `si` each switch to the mode they begin, printing `|  Feedback mode: ...` only when the result is verbose or normal.
  - evidence: feedback-5#24 real "|  Feedback mode: verbose\n"
  - evidence: feedback-5#25 real= ""
  - evidence: feedback-5#26 real "|  Feedback mode: normal\n"
  - evidence: feedback-5#27 real= ""
  - evidence: feedback-5#28 real= ""
  - evidence: feedback-5#29 real "|  Feedback mode: verbose\n"
  - evidence: feedback-5#30 real "|  Feedback mode: normal\n"
  - evidence: feedback-5#31 real= ""
  - evidence: feedback-5#26 prompt "jshell> "
  - evidence: feedback-5#28 prompt "-> "
  - evidence: feedback-5#29 prompt "jshell> "
  - evidence: feedback-5#32 prompt "-> "

- RULE feedback.31: Extra words after a valid mode name print `|  Unexpected arguments at end of command: <words> -- <command>`, and the mode stays unchanged; the same after `-retain <mode>`. An unknown option prints `|  Unknown option: -bogus -- <command>`. A mode name with a trailing semicolon prints `|  Expected a feedback mode name: normal;` plus a help pointer. A quoted mode name and extra spaces are accepted; an empty quoted extra argument is accepted silently.
  - evidence: feedback-5#32 real "|  Unexpected arguments at end of command: extra words -- /set feedback verbose extra words\n"
  - evidence: feedback-5#33 real "|  Unexpected arguments at end of command: x -- /set feedback normal x\n"
  - evidence: feedback-5#36 real "|  Unexpected arguments at end of command: extra -- /set feedback -retain concise extra\n"
  - evidence: feedback-5#37 real "|  Unknown option: -bogus -- /set feedback -bogus verbose\n"
  - evidence: feedback-11#7 real "|  Expected a feedback mode name: normal;\n|  See /help /set feedback for help.\n"
  - evidence: feedback-11#6 real "|  Feedback mode: verbose\n"
  - evidence: feedback-11#5 real "|  Feedback mode: normal\n"
  - evidence: feedback-11#8 real= ""

- RULE feedback.32: The command name may be abbreviated: `/set fee verbose` and `/se feedback normal` both work.
  - evidence: feedback-5#38 real "|  Feedback mode: verbose\n"
  - evidence: feedback-5#39 real "|  Feedback mode: normal\n"

- RULE feedback.33: `/set` with no arguments lists the editor, indent, start and current feedback settings, the available modes, and a two-line hint about `/set prompt`, `/set truncation` and `/set mode`.
  - evidence: feedback-6#0 real "|  /set editor -default\n|  /set indent 4\n|  /set start -default\n|  /set feedback normal\n|  \n"

- RULE feedback.34: `/set mode` lists each mode's whole configuration, modes in the order normal, silent, concise, verbose: a `/set mode <name> -command` or `-quiet` line (normal and verbose `-command`; silent and concise `-quiet`), its prompt, its format lines and its truncation lines. Silent has only the generic formats and a display of the empty string.
  - evidence: feedback-6#1 real "|  /set mode normal -command\n|  /set prompt normal \"\\njshell> \" \"   ...> \"\n"

- RULE feedback.35: `/set prompt` lists the four prompt pairs in the order normal, silent, concise, verbose; `/set prompt <mode>` lists one.
  - evidence: feedback-6#2 real "|  /set prompt normal \"\\njshell> \" \"   ...> \"\n|  /set prompt silent \"-> \" \">> \"\n"
  - evidence: feedback-6#8 real "|  /set prompt normal \"\\njshell> \" \"   ...> \"\n"
  - evidence: feedback-6#12 real "|  /set prompt concise \"jshell> \" \"   ...> \"\n"
  - evidence: feedback-6#13 real "|  /set prompt silent \"-> \" \">> \"\n"
  - evidence: feedback-6#14 real "|  /set prompt verbose \"\\njshell> \" \"   ...> \"\n"

- RULE feedback.36: `/set format` lists every format line for all modes (concise first, then normal, silent, verbose); `/set format <mode>` lists one mode; `/set format <mode> <field>` lists only that field's lines.
  - evidence: feedback-6#3 real "|  /set format concise action \"created\" added-primary\n"
  - evidence: feedback-6#15 real "|  /set format normal action \"created\" added-primary\n|  /set format normal action \"modified\" modified-primary\n"
  - evidence: feedback-6#19 real "|  /set format normal display \"{result}{pre}created scratch variable {name} : {type}{post}\" expression-added,m"
  - evidence: feedback-6#20 real "|  /set format normal action \"created\" added-primary\n|  /set format normal action \"modified\" modified-primary\n"
  - evidence: feedback-6#21 real "|  /set format verbose action \"created\" added-primary\n"
  - evidence: feedback-6#22 real "|  /set format concise action \"created\" added-primary\n"
  - evidence: feedback-6#23 real "|  /set format silent display \"\" \n|  /set format silent err \"%6$s\" \n"

- RULE feedback.37: `/set truncation` lists two truncation lines per mode (80 for all, 1000 for `varvalue,expression`) with a trailing space after the 80, in the order normal, silent, concise, verbose; `/set truncation <mode>` lists one pair.
  - evidence: feedback-6#4 real "|  /set truncation normal 80 \n|  /set truncation normal 1000 varvalue,expression\n"
  - evidence: feedback-6#16 real "|  /set truncation normal 80 \n|  /set truncation normal 1000 varvalue,expression\n"
  - evidence: feedback-6#24 real "|  /set truncation verbose 80 \n|  /set truncation verbose 1000 varvalue,expression\n"
  - evidence: feedback-6#25 real "|  /set truncation concise 80 \n|  /set truncation concise 1000 varvalue,expression\n"
  - evidence: feedback-6#26 real "|  /set truncation silent 80 \n|  /set truncation silent 1000 varvalue,expression\n"

- RULE feedback.38: `/set editor` prints `|  /set editor -default` and `/set start` prints `|  /set start -default` in a fresh session, before and after the other listings.
  - evidence: feedback-6#5 real "|  /set editor -default\n"
  - evidence: feedback-6#6 real "|  /set start -default\n"
  - evidence: feedback-6#27 real "|  /set editor -default\n"
  - evidence: feedback-6#28 real "|  /set start -default\n"

- RULE feedback.39: `/set mode normal` and `/set mode verbose` list the mode's full configuration; the two differ in three display-format lines that normal has and verbose lacks (the empty-string update display, the `replaced-vardecl,varinit-notdefined` display and the final `{result}` display), and concise and silent print their own full configuration with `-quiet`.
  - evidence: feedback-6#7 real "|  /set mode normal -command\n|  /set prompt normal \"\\njshell> \" \"   ...> \"\n"
  - evidence: feedback-6#10 real "|  /set mode verbose -command\n|  /set prompt verbose \"\\njshell> \" \"   ...> \"\n"
  - evidence: feedback-6#9 real "|  /set mode concise -quiet\n|  /set prompt concise \"jshell> \" \"   ...> \"\n"
  - evidence: feedback-6#11 real "|  /set mode silent -quiet\n|  /set prompt silent \"-> \" \">> \"\n|  /set format silent display \"\" \n"

- RULE feedback.40: `/set mode nonesuch` and `/set mode -command normal` print errors: an unknown mode first prints `|  To create a new mode either the -command or the -quiet option must be used -- ` and then the mismatch, the available modes and a help pointer; creating a mode that exists prints `|  Mode to be created already exists: normal -- /set mode -command normal`.
  - evidence: feedback-6#17 real "|  To create a new mode either the -command or the -quiet option must be used -- \n"
  - evidence: feedback-6#29 real "|  Mode to be created already exists: normal -- /set mode -command normal\n|  See /help /set mode for help.\n"

- RULE feedback.41: The local engine prints the same output as the default engine in every mode for the whole battery, with one difference: where the default engine reports a redefinition with the same signature as `modified`, the local engine reports `replaced`. This holds for a modified method, a redeclared variable of the same type, and dependent methods in update lines.
  - evidence: feedback-4#5 local "|  replaced method sq(int)\n"
  - evidence: feedback-3#5 local "|  replaced method sq(int)\n|    update overwrote method sq(int)\n"
  - evidence: feedback-9#6 local "n ==> 3\n|  replaced variable n : int\n|    update overwrote variable n : int\n"
  - evidence: feedback-9#17 local "|  created method g2()\n|    update replaced method f2()\n"
  - evidence: feedback-11#27 local "|  dropped variable base\n|    update replaced method useBase() which cannot be invoked until variable base is declared\n"
  - evidence: feedback-4#7 local "|  replaced class A\n"

- RULE feedback.42: The events behind that difference: for a same-signature method redefinition the default engine reports signatureChange false and the local engine reports signatureChange true for the new snippet; the overwritten old snippet is false in both.
  - evidence: feedback-4#5 events "\"status\":\"VALID\",\"previousStatus\":\"VALID\",\"signatureChange\":false,\"cause\":null"
  - evidence: feedback-4#5 elocal "\"status\":\"VALID\",\"previousStatus\":\"VALID\",\"signatureChange\":true,\"cause\":null"
  - evidence: feedback-4#5 elocal "\"status\":\"OVERWRITTEN\",\"previousStatus\":\"VALID\",\"signatureChange\":false,\"cause\":\"4\""

- RULE feedback.43: In the local engine a redefined variable's dependent method also appears as an event (a second VALID event for the method with the variable's snippet as cause), which the default engine does not show.
  - evidence: feedback-11#26 elocal "\"name\":\"useBase\""
  - evidence: feedback-11#26 events "\"name\":\"base\""

## Surprises

- Silent mode still prints errors, exceptions, warnings, `/vars`, `/methods`, `/types`, `/list`, `/imports`, and program output; only the tool's own confirmation lines (values, created/modified/dropped, unresolved notes) are silenced. Silent prints even the `|  No such snippet: nope` line.
- Concise prints a bare variable's value and a method-call value but not a declaration's value, and it still prints the unresolved-reference lines (`created method f(), however, ...`) that silent hides.
- Concise and silent print nothing for `/drop`, while normal and verbose confirm it.
- The failed `/set feedback -retain nonsense` prints only one line, while `/set feedback nonsense` prints the whole list of modes and a help pointer.
- `/set feedback concise` and `/set feedback silent` are silent when switching, but `verbose` and `normal` announce `Feedback mode: ...`.
- The mode name `normal;` with a semicolon gets a different error (`Expected a feedback mode name`) than an unknown word.
- `/set format` lists concise first and `/set mode` lists normal first; the orders differ between listings.
- The `/set truncation` lines have a trailing space after `80`.
- Prompts: the entry that switches the mode is answered at the old mode's prompt, so a silent session ends with the prompt `-> `.
- Retaining a mode in one session did not leak into later sessions (each later session began in normal).

## Open questions

- Starting jshell in another feedback mode (a startup option) cannot be tried here, so whether the banner is absent in that case is unknown.
- Whether a retained mode persists across real sessions on a user's machine was not testable, since each probe session appears isolated; only the within-session listing of the retained setting was observed.
- The mode named `silent` printed no `Feedback mode` line when switched to; whether any other setting could change that was not probed.
