# variable create
int n = 5;

# redeclare same type
int n = 6;

# redeclare different type
String n = "s";

# redeclare back
int n = 7;

# variable without initializer
int m;

# var type
var v = 3;

# redeclare var with other type
var v = "x";

# redeclare same type no initializer
int n;

# array variable
int[] a = {1, 2};

# redeclare array differently typed
long[] a = {1L};

# list variable
java.util.List<String> names = new java.util.ArrayList<>();

# redeclare same list type
java.util.List<String> names = new java.util.ArrayList<>();

# final variable
final int K = 3;

# redeclare final
int K = 4;

# static variable
static int S = 1;

# private variable
private int Pv = 2;

# public variable
public int Pu = 3;

# multiple declarators
int p = 1, q = 2;

# redeclare one declarator
int p = 10;

# method depends on variable; redeclare variable with a different type
int getN() { return n; }

# redeclare n as String
String n = "str";

# call getN
getN()

# redeclare n back to int
int n = 1;

# getN works again
getN()

# method depends on variable; redeclare same type
int n = 2;

# getN
getN()

# method depends on method; change return type of dependency
int base() { return 1; }

# dependent
int top() { return base() + 1; }

# change base return type to long
long base() { return 1L; }

# top
top()

# change base return type to String
String base() { return "x"; }

# top
top()

# base back to int
int base() { return 2; }

# top
top()

# method depends on class; class has instance var
class Acc { public String toString() { return "Acc"; } int total = 0; }

# variable of Acc
Acc acc = new Acc();

# method uses the variable
int tot() { return acc.total; }

# redefine Acc with only a body change of a method
class Acc { public String toString() { return "Acc"; } int total = 0; int add(int k) { return total += k; } }

# variable acc after
acc

# modify only (same members different init)
class Acc { public String toString() { return "Acc"; } int total = 0; int add(int k) { return total += k + 0; } }

# acc after
acc

# redefine Acc with different field
class Acc { public String toString() { return "Acc"; } int total = 5; }

# acc after
acc

# tot
tot()

# static var depends on class
Acc[] accs = new Acc[2];

# redefine Acc again
class Acc { public String toString() { return "Acc"; } int total = 6; }

# accs
accs

# list of Acc
java.util.List<Acc> la = new java.util.ArrayList<>();

# add to la
la.add(new Acc())

# redefine Acc
class Acc { public String toString() { return "Acc"; } int total = 7; }

# la
la

# drop Acc then dependents
/drop Acc

# check variable acc
acc

# redeclare Acc after drop
class Acc {}

# the var after
acc

# variable declared with undeclared type
Widget w = null;

# declare Widget
class Widget {}

# w
w

# variable with initializer using undeclared
int z = zz + 1;

# variable with undeclared method call
int z2 = nope();

# variable with generics of undeclared
java.util.List<Gadget> gl;

# gadget
class Gadget {}

# gl
gl

# variable with compile error type mismatch
int bad = "s";

# variable with expression error
int bad2 = 1 / 0;

# enum redefine with variable
enum Dir { N, S }

# variable of enum
Dir dir = Dir.N;

# redefine enum
enum Dir { N, S, E }

# dir
dir

# record variable
record Pt(int x) {}

# pt var
Pt pt = new Pt(1);

# redefine record
record Pt(int x, int y) {}

# pt
pt

# interface var
interface Fn { int ap(int x); }

# null var of interface type
Fn inc = null;

# redefine Fn
interface Fn { int ap(int x); default int two() { return 2; } }

# inc
inc

# static nested
class Q { static int c = 1; }

# Q.c
Q.c

# modify Q
class Q { static int c = 2; }

# Q.c after
Q.c
