# setup var
int a = 1

# setup overload 1
int twice(int n) { return 2 * n; }

# setup overload 2
int twice(String s) { return 0; }

# setup class
class K {}

# var of class
K k = null

# method not using class
int make() { return 3; }

# setup import
import java.util.List;

# drop one overload by id
/drop 3

# methods
/methods

# drop class with dependents
/drop K

# vars after
/vars

# methods after
/methods

# list after
/list

# types after
/types

# redefine class
class K { int z; }

# vars after redefine
/vars

# methods after redefine
/methods

# drop import by id
/drop 7

# imports
/imports

# drop id with several
/drop 1 2

# drop with a name that is a type and var
/drop make k

# list
/list

# drop startup snippet by name
/drop java.base

# drop with extra spaces
/drop    2

# multi-line snippet list numbering after ids pass 9
int m1() {
  return 1;
}

# multi line var
int[] big = {
  1,
  2
}

# multi-line class
class Long1 {
    int a;
    int b;
}

# list
/list

# list -all
/list -all

# long id name
int aVeryLongVariableNameForTesting = 12345

# 12 more snippets to reach three digits ids is too many, skip. list one multi
/list m1

# list two ids
/list 12 13

# list multi-line by id
/list Long1
