# setup var
int a = 1

# setup var
int b = 2

# setup method
int twice(int n) { return 2 * n; }

# setup overload
int twice(String s) { return 0; }

# setup type
class K {}

# setup interface
interface J {}

# setup rejected
int bad = "q";

# drop var
/drop a

# list after drop var
/list

# vars after drop
/vars

# drop already dropped
/drop a

# drop overloaded method by name
/drop twice

# methods after
/methods

# drop one overload by id
/drop 4

# methods after id drop
/methods

# drop type
/drop K

# types after
/types

# drop unknown
/drop zzz

# drop no argument
/drop

# drop s1
/drop s1

# imports after drop s1
/imports

# list -all after
/list -all

# drop error id
/drop e1

# drop id by number
/drop 2

# vars
/vars

# drop two at once
/drop J b

# list
/list

# list -all
/list -all

# drop with a range
/drop 1-3

# redefine a dropped name
int a = 9

# history
/history

# drop an expression temp
10 * 2

# drop temp
/drop $
