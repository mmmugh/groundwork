# cannot find symbol variable
int a = foo;

# cannot find symbol variable in expression
foo + 1

# cannot find symbol method
bar(3)

# cannot find symbol class
Foo f = new Foo();

# method on a String
"abc".foo()

# field on a String
"abc".size

# incompatible types literal
int x = "hello";

# String from int
String s = 5;

# int from method result
int n = "abc".length() + "x";

# double to int lossy
int d = 3.5;

# long to int
long big = 5L;
int i = big;

# missing return
int f(int a) {
    if (a > 0) return 1;
}

# unreachable statement
int g() {
    return 1;
    System.out.println("x");
}

# not a statement
5;

# not a statement 2
x + 1;

# illegal start of expression
int y = ;

# illegal start of expression 2
int z = * 3;

# wrong number of args
Math.max(1)

# wrong types of args
Math.abs("x")

# method wrong args user
int add(int a, int b) { return a + b; }

# call add wrong
add(1)

# call add wrong types
add("a", 2)

# non-static from static context
class P {
    int v;
    static int q() { return v; }
}

# non-static method from static
class P2 {
    void m() {}
    static void q() { m(); }
}

# duplicate variable in block
{
    int k = 1;
    int k = 2;
}

# duplicate variable in method
void dd() {
    int k = 1;
    int k = 2;
}

# generic mismatch
List<String> ls = new ArrayList<Integer>();

# generic add wrong
List<String> l2 = new ArrayList<>();
l2.add(5);

# raw type unchecked
List raw = new ArrayList();
raw.add("a");

# raw alone
List r3 = new ArrayList<String>();

# deprecation
new Integer(5)

# deprecation with error
new Integer(5) + "a" + foo

# deprecated method
Thread.currentThread().stop();

# unchecked cast
Object o = new ArrayList<String>();
List<String> l5 = (List<String>) o;

# division by constant zero
int q = 1 / 0;

# division by zero expression
1 / 0

# multi-line error on second line
int aa = 1;
int bb = "x";

# multi-line method error line 3
void mm() {
    int t = 1;
    int u = "x";
}

# error spans several lines
int w = 1 +
    "a" -
    foo;

# several errors in one snippet
int e1 = foo; int e2 = bar;

# several errors in method
void sev() {
    int a = foo;
    String s = 5;
    bar();
}

# error inside class body
class C1 {
    int f = "x";
    void m() { undefined(); }
}

# unclosed string literal
String us = "abc;

# two snippets one line first wrong
int p1 = "x"; int p2 = 2;

# second wrong
int p3 = 1; int p4 = "x";

# both wrong
int p5 = "x"; int p6 = "y";

# unicode before error
String é = "é"; int uu = "x";

# emoji before
String emo = "😀😀"; int ue = "x";

# error after rejected entries
foo
bar
$1
1+1
int ok = "x";
5
