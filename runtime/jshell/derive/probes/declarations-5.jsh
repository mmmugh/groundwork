# import util
import java.util.*;

# use it
List<Integer> li = new ArrayList<>();

# import again
import java.util.*;

# import single
import java.util.function.Function;

# static import
import static java.lang.Math.*;

# use static import
max(3, 4)

# static import single
import static java.lang.Math.PI;

# module import
import module java.sql;

# module import use
Connection cn = null;

# import of unknown package
import foo.bar.*;

# import of unknown class
import java.util.Nope;

# import with typo
import java.utl.*;

# import static unknown member
import static java.lang.Math.nope;

# import module unknown
import module no.such.mod;

# import without semicolon
import java.io.File

# import java.io.*
import java.io.*;

# import then class using it
class UsesFile { File f; }

# method using an unimported class
int sz() { return new StringJoiner(",").length(); }

# import afterwards
import java.util.StringJoiner;

# sz
sz()

# method overriding import name
class List { }

# list variable now
List<Integer> l2 = null;

# method that conflicts with import static
int max(int a, int b, int c) { return 0; }

# max two
max(1, 2)

# max three
max(1, 2, 3)

# two undeclared in method
int two() { return aa + bb(); }

# declare aa
int aa = 1;

# call two
two()

# declare bb
int bb() { return 2; }

# call two now
two()

# three undeclared
int three() { return new Foo().x + qq + rr(); }

# declare Foo
class Foo { int x = 1; }

# declare qq
int qq = 2;

# declare rr
int rr() { return 3; }

# call three
three()

# class with two unresolved methods
class Two { int f() { return u() + v(); } }

# u
int u() { return 1; }

# v
int v() { return 2; }

# new Two
new Two().f()

# class using undeclared variable
class UsesVar { int f() { return gv; } }

# gv
int gv = 4;

# usesvar
new UsesVar().f()

# interface referring undeclared
interface Needs { Missing m(); }

# declare Missing
class Missing {}

# Needs declared ok
Needs nn = null;

# enum referring undeclared
enum E2 { A; Missing2 m; }

# declare Missing2
class Missing2 {}

# record referring undeclared
record R2(Missing3 m) {}

# declare Missing3
class Missing3 {}

# R2
new R2(null)

# extends undeclared and implements undeclared
class Both extends BaseX implements IfX {}

# BaseX
class BaseX {}

# IfX
interface IfX {}

# annotation referring undeclared
@Nope class Annotated {}

# generic method bound undeclared
<T extends Bound> void gm(T t) {}

# Bound
interface Bound {}

# method with undeclared param type
void pm(Undecl u) {}

# method with undeclared return type
Undecl2 rm() { return null; }

# declare them
class Undecl {}

# Undecl2
class Undecl2 {}

# call pm
pm(null)

# method with undeclared thrown exception
void tm() throws MyEx {}

# MyEx
class MyEx extends Exception {}

# tm
tm()

# method using undeclared in body and a real error
int mix() { return nope1 + "s"; }

# method referencing itself with undeclared
int rec(int n) { return n == 0 ? 0 : rec2(n - 1); }

# rec2
int rec2(int n) { return rec(n); }

# rec call
rec(3)

# drop a method that others depend on
/drop rec2

# rec call after drop
rec(3)

# class declared with a method calling dropped
rec2(1)

# unresolved list message with three
int tri() { return t1 + t2 + t3; }

# t1
int t1 = 1;
