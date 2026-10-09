# set the mode
/set feedback verbose

# a value
2 + 3

# a variable declaration
int x = 5

# an uninitialized declaration
String s

# a method create
int sq(int n) { return n * n; }

# the same method modified
int sq(int n) { return n * n * 1; }

# a class create
class A { int v = 1; }

# the class changed so it is replaced
class A { int v = 2; String w; }

# a compile error
int y = "hello";

# an exception
int z = 1 / 0;

# a method with a forward reference
int f() { return g(); }

# an import
import java.util.*;

# a statement that prints
System.out.println("hi");

# the vars listing
/vars

# drop a variable
/drop x

# a multi-line method so the continuation prompt shows
int cube(int n) {
    return n * n * n;
}

# a value after the battery
cube(3)

