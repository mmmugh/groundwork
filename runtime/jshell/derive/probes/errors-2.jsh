# unclosed comment
/* abc

# blank continues
@@blank

# still inside
int afterc = 1;

# close the comment
*/

# after it
int afterd = 2;

# ids: plain value first
10

# rejected
foo

# value after rejected
11

# rejected var decl
int r1 = "x";

# value
12

# rejected method
int mf() { }

# value
13

# rejected class
class Q { int x = "s"; }

# value
14

# valid var after rejections
int okv = 4;

# ref to var $ that does not exist
$9

# value
15

# $1 still usable?
$1 + 1

# leading spaces
   int sp = "x";

# unicode before error
String é = "é"; int uu = "x";

# unicode in same expression
String u2 = "日本語" + foo;

# emoji before error
String emo = "😀😀" + foo;

# emoji in line, error before
int ue = "x" + "😀😀";

# very long line error near end
int longv = 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + "x";

# very long line, caret at end
int longw = 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + foo;

# missing semicolon
int ms = 5 int mt = 6;

# missing paren
System.out.println("a";

# extra paren
System.out.println("a"));

# missing close brace
void nb() { int a = 1;

# stray close brace
}

# else without if
else { }

# class missing name
class { }

# unbalanced bracket
int[] arr = {1, 2;

# char literal unclosed
char c = 'a;

# empty char
char c2 = '';

# bad escape
String e = "\q";

# invalid number
int big = 99999999999;

# int too large hex
int h = 0xFFFFFFFFF;

# unknown keyword use
int class = 5;

# bad identifier
int 1a = 5;

# string minus
"a" - 1

# boolean to int
int bi = true;

# if with int
if (1) { }

# missing return type
foo() { }

# return in void
void rv() { return 1; }

# missing return value
int mv() { return; }

# uninitialized var
int un;
un + 1

# uninitialized in method
void uv() { int z; System.out.println(z); }

# final reassign
final int fx = 1;
fx = 2;

# final local in method
void fr() { final int a = 1; a = 2; }

# unreported exception
Thread.sleep(1);

# unreported in method
void ue2() { throw new Exception("x"); }

# unreported in lambda-free class
class T1 { void m() { throw new Exception(); } }

# call undefined on object
String str = "a";
str.foo(1, "b")

# wrong arg ctor
new Scanner()

# abstract instantiation
new Number()

# interface instantiation
new Runnable()

# private access
class Pr { private int v; }
new Pr().v

# static ref to instance in jshell
String.length()

# array index type
int[] ar = new int[2];
ar["a"]

# array to int
int ai = new int[2];

# incomparable
"a" == 1

# bad operand
true + 1

# bad operand unary
!5

# missing cast
long lg = 5; int li = lg * 2;

# generics primitive
List<int> lp = new ArrayList<>();

# switch dup
int sw = 1;
switch (sw) { case 1: break; case 1: break; }

# break outside
break;

# continue outside
continue;

# this in jshell
this

# super call
super.toString()

# void value
int vv = System.out.println("a");

# void in expression
"a" + System.out.println("b")

# var without init
var vq;

# var null
var vn = null;

# var array init
var va = {1, 2};

# record error
record R(int a) { R { if (a < 0) throw new Foo(); } }

# interface method body
interface I { void m() { } }

# enum error
enum E { A, B; int x = "s"; }

# override error
class Base { final void m() {} }
class Der extends Base { void m() {} }

# missing abstract impl
interface Sh { double area(); }
class Sq implements Sh { }

# cyclic
class A1 extends A1 { }

# duplicate class
class Dup {}
class Dup { int x; }

# duplicate method
void dm() {}
void dm() {}

# duplicate variable top-level
int dv = 1;
int dv = 2;

# duplicate variable with different type
int dw = 1;
String dw = "a";
