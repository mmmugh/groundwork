# Inspection and editing commands (DERIVATION.md C1 to C7, C11, H1, H2).
/list

#! startup
/list -all

int x = 5

String s

int[] arr = {1, 2, 3}

record Point(int x, int y) {}

int square(int n) {
    return n * n;
}

int square(double d) {
    return 1;
}

<T> T id(T t) { return t; }

int sum(int... xs) { return 0; }

class A { int f; }

interface I { void m(); }

enum Color { RED, GREEN }

@interface Ann {}

class Box<T> { T v; }

import java.util.function.*;

int y = "a";

int x = 7

x + 1

/list

#! startup
/list -all

#! startup
/list -start

/list 3

/list x

/list x s

/list nope

/list square

/list e1

/list 1-3

/list 3-1

/list 1-x

/list -x

/list -all x

/list -start -all

/vars

/methods

/types

#! startup
/imports

/vars x

/vars square

/methods square

/types Point

/vars nope

int usesBar() { return bar(); }

Baz mkBaz() { return null; }

/methods

int bar() { return 1; }

/methods

/drop x

/drop square

/drop 3

/drop nope

/drop

/drop -all

/drop x

/drop 1-3

/vars

/list

/!

/-2

/22

/99

/-99

/hi

/h

/d

/

/LIST

/nosuch

# /exit with an unfinished expression takes the next line too (C9), so the /history after it is read as Java.
/ex 5 + 

/history

/history 3

# Options by prefix (C2, C4), /set by prefix (C10), a rerun count that does not fit an int (C11).
/vars -a

/methods -s

/types -bogus

/vars -all x

/set f

/-99999999999

# Last on purpose: in the real tool /debug turns on a trace of its own that changes every later entry.
#= "|  /debug is not available in this scratchpad. Type /help to see what is.\n"
/debug
