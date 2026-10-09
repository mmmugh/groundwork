# G12: which snippets a /drop range skips (check run 1, commands#55 against inspect-8#21)
# A: an overwritten snippet alone in a range, its replacement active and outside the range
int x = 1

int x = 2

/drop 1-1

/list -all

/reset

# B: overwritten, replacement after the range and active; another variable inside the range
int x = 1

int y = 1

int x = 2

/drop 1-2

/vars

/reset

# C: overwritten, replacement dropped
int x = 1

int x = 2

/drop x

/drop 1-1

/drop 1

/reset

# D: overwritten by a different kind of snippet with the same name, and a method overwritten by a changed signature
int x = 1

String x = "s"

int f() { return 1; }

int f(int a) { return a; }

/drop 1-2

/vars

/methods

/reset

# E: an overwritten method in a range together with its active replacement, then one already dropped
int g() { return 1; }

int g() { return 2; }

int h = 0

/drop h

/drop 1-2

/drop 1-3
