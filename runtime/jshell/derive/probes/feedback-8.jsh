# set the mode
/set feedback silent

# a variable for later
int n = 10

# bare variable name
n

# assignment
n = 20

# compound assignment on a var
n += 1

# a string value
"hello"

# redeclare a variable with the same type
int n = 3

# redeclare with a different type (replaced)
String n = "text"

# a void method call
System.out.print("")

# a method call that returns a value
Math.max(3, 4)

# a record
record P(int a, int b) {}

# an interface
interface I { void m(); }

# an enum
enum Color { RED, GREEN }

# a class that refers to something missing
class B extends Missing { }

# using a class that is not yet defined
new B()

# a method with a forward reference
int f2() { return g2(); }

# call it
f2()

# define the missing method (update)
int g2() { return 7; }

# call again
f2()

# a variable referencing a missing class
Missing m1 = null;

# a variable declared with an initializer that throws
int bad = Integer.parseInt("x");

# a var declaration
var list = new java.util.ArrayList<String>()

# adding to the list
list.add("a")

# an array declaration
int[] arr = {1, 2, 3}

# a long string value
"a very long string value that goes on and on and on and on and on and on and on and on and on and on and on"

# define a method then drop it
int sq(int n) { return n * n; }

# drop a method
/drop sq

# a class then drop it
class K { }

# drop a class
/drop K

# drop a variable that does not exist
/drop nope

# a method
int h() { return 1; }

# method with changed return type
String h() { return "x"; }

# an if statement
if (n.length() > 1) System.out.println("long");

# a for loop
for (int i = 0; i < 2; i++) System.out.println(i);

# unchecked raw use
java.util.List raw = new java.util.ArrayList(); raw.add(1);

# two snippets on one line
int a1 = 1; int a2 = 2;

# an expression with a semicolon
3 + 4;
