# startup: list before anything
/list

# -all at start
/list -all

# int var
int x = 5

# uninitialized var
String s

# array var
int[] arr = {1, 2, 3}

# record
record Point(int x, int y) {}

# two-line method
int square(int n) {
    return n * n;
}

# overload
int square(double d) {
    return 1;
}

# generic method
<T> T id(T t) { return t; }

# varargs
int sum(int... xs) { return 0; }

# array method
int[] mk(int[][] a) { return null; }

# class
class A { int f; }

# interface
interface I { void m(); }

# enum
enum Color { RED, GREEN }

# annotation
@interface Ann {}

# generic class
class Box<T> { T v; }

# import
import java.util.*;

# rejected entry
int y = "a";

# redefinition of x
int x = 7

# expression
x + 1

# list no arg
/list

# list -all
/list -all

# list -start
/list -start

# list id
/list 3

# list name
/list x

# list two names
/list x s

# list unknown
/list nope

# list overloaded
/list square

# list error id
/list e1

# list range
/list 1-3

# list s1
/list s1

# vars
/vars

# methods
/methods

# types
/types

# imports
/imports

# history
/history
