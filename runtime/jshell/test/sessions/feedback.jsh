# Feedback modes (DERIVATION.md M1, F1, Q1, C10): one battery per mode.
/set feedback

2 + 3

int x = 5

int sq(int n) { return n * n; }

/set feedback concise

/set feedback

2 + 3

int y = 5

y

y = 6

y += 1

int sq(int n) { return n * n * n; }

class A { int v; }

int z = "oops";

1 / 0

int f() { return g(); }

f()

/drop y

/drop nope

int cube(int n) {
    return n * n * n;
}

/set feedback silent

2 + 3

int w = 5

w

class B { int v; }

int z2 = "oops";

1 / 0

int f2() { return g2(); }

f2()

/vars

/drop w

/drop nope

/set feedback nonsense

/set feedback verbose

2 + 3

int v = 5

v

v = 6

v += 1

String s;

int v = 9

String v = "text"

int sq2(int n) { return n * n; }

int sq2(int n) { return n + n; }

class C { int v; }

class C { int v; int w; }

int h() { return g3(); }

int g3() { return 3; }

/drop v

/drop nope

/set feedback normal

/set feedback -retain verbose

/set feedback

/set feedback c

/set feedback

/set feedback normal extra words

/set feedback -bogus verbose

/set feedback normal;

/set feedback VERBOSE

/set fee normal

/se feedback normal

/set feedback
