# class name typo
Strin s = "a";

# lowercase string
string s2 = "a";

# system lowercase
system.out.println("a");

# typo in System
Sytem.out.println("a");

# typo in println
System.out.printn("a");

# typo in out
System.ou.println("a");

# println no args wrong type
System.out.println("a", "b");

# Math typo
Math.sqroot(4)

# Integer parse typo
Integer.parseint("5")

# length vs length()
String t = "abc";
t.length

# array length()
int[] ar = {1, 2};
ar.length()

# array size
ar.size()

# list length
List<Integer> li = new ArrayList<>();
li.length()

# list get string
li.get("a")

# undefined increment
cnt++

# undefined assign
total = 5;

# undefined in loop
for (int i = 0; i < n; i++) { }

# assign in condition
int p = 1;
if (p = 1) { }

# char literal with two chars
char c = 'ab';

# string to char
char c3 = "a";

# int to boolean in while
while (1) { }

# compare string to int
if (t == 3) { }

# method on int
int num = 5;
num.toString()

# method on primitive length
num.length()

# call method with void result
void hi() { }
int r = hi();

# return type mismatch
String ret() { return 5; }

# return type mismatch 2
int ret2() { return "a"; }

# call instance method of class statically
class Dog { void bark() { } }
Dog.bark()

# new with wrong args
class Pt { Pt(int x, int y) { } }
new Pt(1)

# new with wrong types
new Pt("a", "b")

# default ctor missing
new Pt()

# in class cannot find symbol location
class K { void m() { foo; } }

# in class wrong args
class K2 { void a(int x) { } void b() { a(); } }

# in class wrong args types
class K3 { void a(int x) { } void b() { a("s"); } }

# in class wrong args two overloads
class K4 { void a(int x) { } void a(String s) { } void b() { a(1.5); } }

# user method wrong arg count
void two(int a, int b) { }
two(1, 2, 3)

# overloaded user method no match
void ov(int a) { }
void ov(String a) { }
ov(1.5)

# static call on instance field typo
class Cnt { int n; }
Cnt cc = null;
cc.m

# private field
class Sec { private int s; }
new Sec().s = 5;

# field typo
cc.nn = 3;

# generic method arg wrong
List<String> ls = new ArrayList<>();
ls.add(1)

# generic assign wrong
List<Integer> lint = ls;

# map wrong
Map<String, Integer> mp = new HashMap<>();
mp.put(1, "a")

# optional
Optional<String> op = Optional.of(5);

# lambda error
Runnable rn = () -> { int q = "x"; };

# lambda wrong
Function<Integer, Integer> fn = x -> "s";

# lambda wrong arg count
Function<Integer, Integer> fn2 = (a, b) -> a;

# string with escapes caret
String esc = "a\tb\n" + foo;

# string with quote escapes
String q2 = "say \"hi\"" + foo;

# unicode escape
String ue = "é" + foo;

# for loop error line
for (int i = 0; i < 3; i++) {
    int j = "x";
}

# if else error
if (true) {
    foo();
} else {
    bar();
}

# exception never thrown
try { } catch (Exception e) { }

# switch missing
String sw = "a";
switch (sw) { case 1: break; }

# nested generics
Map<String, List<Integer>> nm = new HashMap<String, List<String>>();

# ternary mismatch
int tern = true ? "a" : 1;

# instanceof incompatible
Integer in = 5;
in instanceof String

# cast incompatible
String cs = (String) in;

# array init wrong
int[] ai = {1, "a"};

# array wrong dim
int[] a2 = new int[2][2];

# missing array size
int[] a3 = new int[];

# negative dims type
int[] a4 = new int["a"];

# record wrong args
record Pnt(int x, int y) { }
new Pnt(1)

# record accessor wrong
new Pnt(1, 2).z()

# enum wrong constant
enum Color { RED, GREEN }
Color.BLUE

# interface wrong
interface Sh { double area(); }
new Sh()

# super class final
final class Fin { }
class Sub extends Fin { }

# extends interface wrong
class Ex extends Sh { }

# implements class
class Im implements Fin { }
