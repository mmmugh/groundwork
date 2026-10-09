# class A
class A { int v = 1; }

# method returning A
A mk() { return new A(); }

# method taking A
int take(A a) { return a.v; }

# class with a field of type A
class HasA { A a = new A(); }

# class extends A
class SubA extends A { }

# redefine A with new field (replaced)
class A { int v = 1; int w = 2; }

# take on new
take(mk())

# redefine A with a body change only (modified)
class A { int v = 1; int w = 3; }

# redefine A removing v
class A { int w = 3; }

# call take
take(mk())

# redefine A with v again
class A { int v = 5; int w = 3; }

# take
take(mk())

# redefine A as interface
interface A { }

# redefine A as class again
class A { int v = 6; }

# variable initialized by method
int fromMk = take(mk());

# redefine take
int take(A a) { return a.v + 1; }

# fromMk
fromMk

# redefine take with other return
long take(A a) { return a.v; }

# fromMk after
fromMk

# variable initialized from method, redefine method to String
String take(A a) { return "s"; }

# fromMk after String
fromMk

# static method calls instance method of other class
class Helper { static int h() { return 1; } }

# method using Helper
int useH() { return Helper.h(); }

# redefine Helper with different method name
class Helper { static int k() { return 1; } }

# useH
useH()

# restore
class Helper { static int h() { return 2; } }

# useH
useH()

# generic class dependent
class Box2<T> { T t; public String toString() { return "B2"; } }

# variable of Box2
Box2<String> b2 = new Box2<>();

# redefine Box2 with another param count
class Box2<T, U> { T t; public String toString() { return "B2"; } }

# b2
b2

# a method with same name as a class
class Same { }

# method named Same
int Same() { return 1; }

# call Same()
Same()

# new Same
new Same() != null

# drop method Same and class
/drop Same

# list
/list -all

# declare a method with overloaded dependents
int ov(int a) { return a; }

# caller of ov(int)
int callov() { return ov(1); }

# add ov(long)
int ov(long a) { return 2; }

# callov
callov()

# remove ov(int) by drop
/drop ov(int)

# callov after drop
callov()

# class with explicit dependency on enum
enum Lvl { LO, HI }

# method on enum
Lvl top2() { return Lvl.HI; }

# redefine enum removing HI
enum Lvl { LO }

# top2
top2()

# static field of enum used by method redefine enum with HI
enum Lvl { LO, HI }

# top2
top2()
