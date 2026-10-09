# var
int x = 1

# redefine var same type
int x = 2

# method
int f() { return 1; }

# redefine method same signature
int f() { return 2; }

# class
class C { }

# redefine class
class C { int q; }

# var
String s = "s"

# redefine var other type
int s = 3

# list default
/list

# list -all
/list -all

# list range two
/list 7-9

# list range with extra id
/list 1-2 5

# list range of e ids
/list e1-e2

# list names with extra spaces
/list    x     f

# list duplicate name
/list x x

# list id and name same snippet
/list 8 s

# bad entries for error ids
int q = "a";

# bad entry two
String r = 5;

# list e ids
/list e1 e2

# list e range
/list e1-e2

# list e number only
/list e

# drop range with an overwritten id
/drop 2-4

# drop two live ids
/drop 4 6

# list after drop range
/list

# list -all after drops
/list -all

# import drop by name
import java.util.List;

# drop import by name
/drop List

# drop import by id
/drop 9

# import star
import java.util.*;

# drop import star by name
/drop java.util.*

# drop import star by id
/drop 10

# imports after
/imports

# list -start after dropping s1
/list -start

# drop s1 then list s1
/list s1

# vars with two names one unknown
/vars x nope

# types with method name
/types f

# methods with var name
/methods s

# vars multiple names
/vars s x

# static import and drop
import static java.lang.Math.max;

# drop static import by name
/drop max

# drop static import by id
/drop 11

# imports final
/imports

# drop an expression statement id
2 + 2

# drop it by id
/drop 12

# drop with trailing spaces
/drop 12   

# drop uppercase option-like
/drop -all

# drop -start
/drop -start
