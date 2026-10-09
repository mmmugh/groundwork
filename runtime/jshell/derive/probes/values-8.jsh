# first expression
10

# second expression uses $1
$1 * 2

# $2 var type
$2 + 0.5

# assign to $ variable
$1 = 99

# $1 again
$1

# a compile error does it consume a number
undefinedName + 1

# next expression after compile error
5

# type error
int bad = "str"

# next expression after type error
6

# exception entry
1 / 0

# next expression after exception
7

# declaration consumes numbers
int k = 3

# next expression after declaration
k + 1

# a method declaration
int twice(int n) { return n * 2; }

# next after method
twice(4)

# void method declaration
void hello() { System.out.println("hello"); }

# void method call prints nothing extra
hello()

# next after void call
8

# println statement
System.out.println("hi")

# next after println
9

# print without newline
System.out.print("no newline")

# next after print
11

# if statement prints nothing
if (k > 1) { System.out.println("big"); }

# if without output
if (k > 100) { k = 0; }

# next number after if
12

# for loop prints nothing
for (int i = 0; i < 3; i++) { }

# for loop with output
for (int i = 0; i < 3; i++) { System.out.println(i); }

# next number after for
13

# for loop variable is gone
i

# while loop
int cnt = 0; while (cnt < 3) cnt++;

# next after while
14

# block statement
{ int tmp = 1; }

# empty statement
;

# next after empty
15

# import consumes a number?
import java.util.concurrent.*;

# next after import
16

# several statements on one line
int e1 = 1; int e2 = 2; e1 + e2

# next after multi
17

# expression statement with semicolon
3 + 4;

# next after semicolon expr
18

# string expression with semicolon
"semi";

# method call returning value with semicolon
Math.max(1, 2);

# method call returning value no semicolon
Math.min(1, 2)

# ignored: new object statement
new StringBuilder("sb");

# increment with semicolon
k++;

# k++ printed value
k

# throw statement
throw new RuntimeException("t");

# next after throw
19

# try catch statement
try { int z = 1 / 0; } catch (ArithmeticException ex) { System.out.println("caught"); }

# next after try
20

# switch expression
switch (k) { case 4 -> "four"; default -> "other"; }

# switch expression result
String sw = switch (k) { case 4 -> "four"; default -> "other"; }

# var shadows $
int $3 = 5

# $ names
$3

# list expression names
List.of($1, $2)

# expression of var type via ternary
k > 1 ? 1 : 2.0

# lambda expression is not a value expression test: method ref assign
Math::abs

# text block
"""
hello
world
"""

# text block var
String tb = """
    indented
      more
    """

# line comment
// just a comment

# trailing comment after expression
5 + 5 // comment

# block comment expression
/* c */ 6 + 6

# expression with leading spaces
   7 + 7   

# empty entry
@@blank

# 0 literal
0

# negative literal
-5

# same value twice
5
5

# do while
do { k--; } while (k > 0);

# k now
k
