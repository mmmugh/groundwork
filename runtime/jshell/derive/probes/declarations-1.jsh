# method create
int square(int n) {
    return n * n;
}

# method call
square(4)

# redefine same signature new body
int square(int n) {
    return n * n * 2;
}

# call after redefine
square(4)

# change return type
long square(int n) {
    return n;
}

# add overload
int square(int a, int b) { return a * b; }

# change parameters (new overload with String)
String square(String s) { return s + s; }

# generic method
<T> T first(java.util.List<T> l) { return l.get(0); }

# varargs
int sum(int... xs) { int s = 0; for (int x : xs) s += x; return s; }

# void method
void hi() { System.out.println("hi"); }

# call void
hi()

# static method
static int twice(int n) { return 2 * n; }

# public method
public int thrice(int n) { return 3 * n; }

# final method
final int four() { return 4; }

# private method
private int five() { return 5; }

# abstract method
abstract int six();

# method using undeclared variable
int usesX() { return x + 1; }

# call it
usesX()

# declare x
int x = 5;

# call usesX now
usesX()

# method using undeclared method
int callsFoo() { return foo() + 1; }

# declare foo
int foo() { return 10; }

# callsFoo works
callsFoo()

# redefine foo
int foo() { return 20; }

# callsFoo after redefine
callsFoo()

# method using undeclared class
int useThing() { return new Thing().v; }

# declare Thing
class Thing { int v = 7; }

# useThing
useThing()

# redefine Thing change only a field value
class Thing { int v = 8; }

# useThing after
useThing()

# remove field v from Thing
class Thing { int w = 8; }

# useThing now
useThing()

# restore Thing
class Thing { int v = 9; }

# useThing
useThing()

# method with compile error inside
int bad() { return "s"; }

# method missing return
int noret() { }

# method duplicate param
int dup(int a, int a) { return a; }

# call a method that has unresolved reference
bad()

# generic method redefine
<T> T first(java.util.List<T> l) { return null; }

# method with throws
void thrower() throws Exception { throw new Exception("e"); }

# call thrower
thrower()

# method with checked exception unhandled
void t2() { throw new Exception("e"); }

# overload with same erasure
void er(java.util.List<String> l) {}

# second same erasure
void er(java.util.List<Integer> l) {}

# recursive method
int fact(int n) { return n <= 1 ? 1 : n * fact(n - 1); }

# fact call
fact(5)

# method with same name as variable
int fact = 3;

# fact call after
fact(4)

# fact value
fact

# method redefine with different modifiers
static int fact(int n) { return 1; }

# method with annotation
@Deprecated int old() { return 1; }

# method with generics bounds
<T extends Comparable<T>> T max(T a, T b) { return a.compareTo(b) > 0 ? a : b; }

# call max
max(3, 4)

# method named like a keyword-ish
int record() { return 1; }

# method returning array
int[] arr() { return new int[]{1,2}; }

# method returning generic
java.util.List<String> names() { return java.util.List.of("a"); }

# redefine variable-using method
int usesY() { return y; }

# define y String
String y = "s";

# usesY wrong type
usesY()
