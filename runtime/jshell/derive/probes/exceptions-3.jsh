# method using an undeclared variable
int f() { return missing + 1; }

# call it while unresolved
f()

# class using an undeclared class
class A {
    B b = new B();
}

# construct it while unresolved
new A()

# variable initializer calling the unresolved method
int x = f();

# is x defined
x

# declare the missing variable
int missing = 5;

# f works now
f()

# method calling an undeclared method
int g() { return h(2); }

# call g
g()

# initializer calling g
int y = g();

# vars after
/vars

# declare h
int h(int n) { return n * 2; }

# g works
g()

# unresolved class A still
new A()

# declare B
class B { }

# A works
new A().b != null

# method using undeclared name and another unresolved type
void m(Foo foo) { }

# call m
m(null)

# exception in a multi-line top-level statement
for (int i = 0; i < 3; i++) {
    if (i == 2) {
        throw new IllegalStateException("i is " + i);
    }
}

# multi-line expression with exception on later line
int w = 1 +
    Integer.parseInt("nope");

# multi-line call chain
String.valueOf(
    "abc".charAt(9));

# block statement with output then exception
{
    System.out.println("one");
    System.out.println("two");
    Object n = null;
    n.toString();
}

# local variable names in NPE inside a method
void loc() {
    String t = null;
    t.length();
}

# call loc
loc()

# NPE on a parameter
int plen(String p) { return p.length(); }

# call plen
plen(null)

# NPE on a field of a user class
class Node {
    Node next;
    int val;
    public String toString() { return "Node"; }
}

# make a node
Node nd = new Node();

# NPE through chain
nd.next.val

# NPE assigning through null field
nd.next.val = 3;

# NPE return of method call
class Box {
    String name() { return null; }
}

# call on null returned
new Box().name().length()

# nested class thrown
class Outer {
    static class Inner extends RuntimeException {
        Inner() { super("inner thrown"); }
    }
    static void go() { throw new Inner(); }
}

# throw Outer.Inner
Outer.go()

# anonymous class method throws
Runnable r = new Runnable() {
    public void run() { throw new IllegalStateException("anon"); }
    public String toString() { return "anon-runnable"; }
};

# run it
r.run()

# enum bad valueOf
enum Color { RED, GREEN }

# bad valueOf
Color.valueOf("BLUE")

# enum constructor failure
enum Bad { ONE; Bad() { if (true) throw new IllegalStateException("enum ctor"); } }

# touch Bad
Bad.ONE

# interface default throws
interface Greeter { default void hi() { throw new UnsupportedOperationException("not yet"); } }

# implement and call
new Greeter() {}.hi()

# method declared with throws
void risky() throws Exception { throw new Exception("risky"); }

# call risky at top level
risky()

# custom checked exception
class AppException extends Exception {
    AppException(String m, Throwable c) { super(m, c); }
}

# throw it with cause null
throw new AppException("app failed", null)

# throw it with cause
throw new AppException("app failed", new RuntimeException("db down"))

# override getMessage
class Odd extends RuntimeException {
    public String getMessage() { return "odd message"; }
}

# throw odd
throw new Odd()

# override toString
class Odder extends RuntimeException {
    public String toString() { return "ODDER!"; }
}

# throw odder
throw new Odder()

# empty message
throw new RuntimeException("")

# unicode message
throw new RuntimeException("café 你好")

# long message
throw new RuntimeException("x".repeat(300))

# addExact overflow
Math.addExact(Integer.MAX_VALUE, 1)

# modulo by zero
5 % 0

# long division by zero
5L / 0L

# double division by zero is not an exception
5.0 / 0

# ConcurrentModificationException
java.util.List<Integer> nums = new java.util.ArrayList<>(java.util.List.of(1, 2, 3));

# remove inside foreach
for (Integer n : nums) { nums.remove(n); }

# Arrays.asList add
java.util.Arrays.asList(1, 2).add(3)

# repeat negative
"ab".repeat(-1)

# ClassCastException with user class
Object oa = new Node();

# bad cast
(String) oa

# suppressed exceptions
class Res implements AutoCloseable {
    public void close() { throw new IllegalStateException("close failed"); }
}

# try with resources
try (Res rs = new Res()) { throw new RuntimeException("body failed"); }

# are assertions on
boolean ea = false;

# assert side effect
assert ea = true;

# check ea
ea

# stderr output then exception
System.err.println("to stderr");

# exception after stderr in one line
System.err.println("err first"); throw new RuntimeException("after err");

# two statements, first throws
int p = 1 / 0; int q = 2;

# is q defined
q

# throw in a switch expression
int sw = switch (3) { case 3 -> throw new IllegalStateException("sw"); default -> 0; };

# exception then immediate success
2 + 2

# vars at the end
/vars

# the multi-line initializer that failed
w
