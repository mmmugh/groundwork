# class with static state and an instance variable
class Ctr { static int made = 0; int id; Ctr() { id = ++made; } int get() { return id; } public String toString() { return "Ctr" + id; } }

# instance
Ctr c1 = new Ctr();

# instance 2
Ctr c2 = new Ctr();

# modify only the body of get
class Ctr { static int made = 0; int id; Ctr() { id = ++made; } int get() { return id * 10; } public String toString() { return "Ctr" + id; } }

# does the old instance see the new body
c1.get()

# static state kept?
Ctr.made

# new instance after modify
new Ctr().get()

# the instance variable still alive
c2

# change only the toString body
class Ctr { static int made = 0; int id; Ctr() { id = ++made; } int get() { return id * 10; } public String toString() { return "C" + id; } }

# c1 now
c1

# change a field initializer only
class Ctr { static int made = 100; int id; Ctr() { id = ++made; } int get() { return id * 10; } public String toString() { return "C" + id; } }

# c1
c1

# change a method's parameter names only
int add(int a, int b) { return a + b; }

# same signature other parameter names
int add(int x, int y) { return x + y; }

# add throws clause
int add(int x, int y) throws Exception { return x + y; }

# remove throws clause
int add(int x, int y) { return x + y; }

# add static
static int add(int x, int y) { return x + y; }

# add public
public int add(int x, int y) { return x + y; }

# add annotation
@Deprecated int add(int x, int y) { return x + y; }

# remove annotation
int add(int x, int y) { return x + y; }

# same text twice
int add(int x, int y) { return x + y; }

# class to interface same name
class Kind { }

# interface same name
interface Kind { }

# enum same name
enum Kind { A }

# record same name
record Kind(int a) { }

# class same name again
class Kind { }

# class add final
final class Kind { }

# class remove final
class Kind { }

# class add extends
class Kind extends Object { }

# class add implements
class Kind implements Runnable { public void run() {} }

# class add generic param name change
class Gen<T> { T t; }

# class rename type parameter
class Gen<U> { U t; }

# class modify generic method body
class Gen<U> { U t; U get() { return t; } }

# modify body
class Gen<U> { U t; U get() { return null; } }

# class constructor added
class Ctor { }

# constructor added
class Ctor { Ctor() { } }

# method visibility change
class Vis { void f() { } }

# public method
class Vis { public void f() { } }

# method body change in a class with a nested class
class Nest { class In { int v() { return 1; } } }

# nested body change
class Nest { class In { int v() { return 2; } } }

# nested add method
class Nest { class In { int v() { return 2; } int w() { return 3; } } }

# method local class change
int loc() { class L { } return 1; }

# change local class
int loc() { class L { int a; } return 1; }

# method with lambda
int lam() { java.util.function.IntUnaryOperator f = x -> x; return f.applyAsInt(1); }

# change lambda
int lam() { java.util.function.IntUnaryOperator f = x -> x + 1; return f.applyAsInt(1); }

# method local variable names only
int lv() { int aa = 1; return aa; }

# method local variable rename
int lv() { int bb = 1; return bb; }

# whitespace and comment only change
int lv() { int bb = 1; /* c */ return bb; }

# comment preceding
// a comment
int lv() { int bb = 1; return bb; }

# method with javadoc
/** doc */ int jd() { return 1; }

# class with comment inside and trailing text
class Cm { /* x */ } // trailing

# empty statement after declaration
class Em { };

# two declarations on one line
int one() { return 1; } int two() { return 2; }

# declaration followed by expression
class Ab { public String toString() { return "Ab"; } } new Ab()

# interface with generic method
interface Mapper { <T> T map(T t); }

# class implementing generic method interface
class Id implements Mapper { public <T> T map(T t) { return t; } }

# static state after a modified class (initializer changed earlier)
Ctr.made

# a method that works
int keep() { return 1; }

# redefine it with a compile error
int keep() { return "s"; }

# does the old one survive
keep()

# a class that works
class Keep2 { int v = 1; }

# redefine with a compile error
class Keep2 { int v = "s"; }

# does the old class survive
new Keep2().v

# a variable that works
int keep3 = 1;

# redefine with a compile error
int keep3 = "s";

# does the old variable survive
keep3

# redefine with a runtime exception in the initializer
int keep3 = 1 / 0;

# value after
keep3
