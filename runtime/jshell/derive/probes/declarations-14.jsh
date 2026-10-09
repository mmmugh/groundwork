# a class split over lines with a blank line inside
class Blk {
@@blank
    int v = 1;
@@blank
    int get() {
        return v;
    }
}

# use it
new Blk().get()

# a method split over lines, wrong
int split(int a) {
    return a;

# close it
}

# call it
split(2)

# declaration with a comment line inside
class Cmt {
    // comment
    int v = 2; // trailing
}

# a method whose body has an error on line 2
int err2() {
    return "s";
}

# a class with an error on line 3
class Err3 {
    int a = 1;
    int b = "s";
}

# a method with two errors
int two() {
    int a = "s";
    return "t";
}

# a method redefined with the error then fixed
int fix() { return "s"; }

# fix proper
int fix() { return 1; }

# a method unresolved then redefined resolved
int unr() { return later; }

# unresolved redefined to another unresolved
int unr() { return later2; }

# unresolved redefined to resolved
int unr() { return 1; }

# class unresolved then redefined resolved
class UC { Later1 x; }

# redefine UC to unresolved other
class UC { Later2 x; }

# UC resolved
class UC { int x; }

# variable unresolved then resolved by redefinition
Later3 lv3;

# redefine lv3 as int
int lv3;

# a variable redefined while a method depends on it, and the new type breaks the method
int dep = 1;

# method on dep
int useDep() { return dep + 1; }

# redefine dep to double
double dep = 1.5;

# useDep
useDep()

# redefine dep to int again
int dep = 3;

# useDep
useDep()

# class with a static nested use of a method
int helper() { return 1; }

# class using helper
class UsesHelper { int h() { return helper(); } }

# redefine helper
int helper() { return 2; }

# UsesHelper
new UsesHelper().h()

# change helper return type breaking class
String helper() { return "s"; }

# UsesHelper broken
new UsesHelper().h()
