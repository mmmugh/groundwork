# method missing semicolon
int f1() { return 1 }

# class field missing semicolon
class A1 { int x }

# missing return type
foo1() { return 1; }

# class with no name
class { }

# variable no initializer expression
int x1 = ;

# method call void return value
void f2() { return 1; }

# class with a bad name
class 1A {}

# method param without name
int f3(int) { return 1; }

# extra closing brace
class A2 { } }

# extra closing brace after method
int f4() { return 1; } }

# void variable
void v1;

# array without size
int[] a1 = new int[];

# constructor returning value
class A3 { A3() { return 1; } }

# extends final class
class A4 extends String {}

# cyclic extends
class A5 extends A5 {}

# record with instance field
record R3() { int x; }

# interface method with body
interface I3 { void f() {} }

# abstract method in non-abstract class
class A6 { abstract void f(); }

# modifiers: protected method
protected int mp() { return 1; }

# synchronized method
synchronized int ms() { return 1; }

# native method
native int mn();

# default method top level
default int md() { return 1; }

# transient variable
transient int vt = 1;

# volatile variable
volatile int vv = 1;

# strictfp method
strictfp int mf() { return 1; }

# abstract class instantiate
abstract class Ab1 { }

# new abstract
new Ab1()

# final variable assigned later
final int fv = 1;

# assign to final
fv = 2;

# static modifier on class and variable
static String sv = "a";

# public private conflict
public private int pp = 1;

# duplicate modifier
final final int ff = 1;

# class duplicates same line
class Dd { } class Dd { }

# method duplicates same line
int dm() { return 1; } int dm() { return 2; }

# method with same signature different return
int sr() { return 1; }

# other return same params
long sr() { return 1; }

# method generic redefinition different bound
<T extends Number> T gn(T t) { return t; }

# gn call
gn(3)

# method with varargs and array overload
int va(int... a) { return a.length; }

# va array
int va(int[] a) { return 0; }

# call va
va(1, 2, 3)

# main method style
public static void main(String[] args) { System.out.println("hello"); }

# call main
main(null)

# method named like a type
int String() { return 1; }

# method named var
int var() { return 1; }

# method named yield
int yield() { return 1; }

# record as identifier
int record = 1;

# method using this
int th() { return this.hashCode() * 0; }

# method using super
int su() { return super.hashCode() * 0; }

# a method whose name is a java keyword
int new() { return 1; }

# unicode method name
int größe() { return 1; }

# unicode call
größe()

# unicode class
class Straße { }

# very long method name
int aVeryLongMethodNameThatGoesOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOn() { return 1; }

# method with 10 params
int ten(int a, int b, int c, int d, int e, int f, int g, int h, int i, int j) { return a; }

# method with generic param of two args
void two2(java.util.Map<String, java.util.List<Integer>> m) { }

# method with array param
void arr2(int[][] m, String... s) { }

# method with function param
void fn(java.util.function.Function<Integer, String> f) { }

# method with wildcard
void wc(java.util.List<? extends Number> l) { }

# method with nested class param
void np(java.util.Map.Entry<String, Integer> e) { }

# method with annotation param
void ap(@Deprecated int a) { }

# method with final param
void fp(final int a) { }
