# reload with nothing entered
/reload

# a variable
int x = 10

# value
x + 1

# a method
int dbl(int n) { return n * 2; }

# an import
import java.util.*;

# a class
class P { int a; }

# a statement with output
System.out.println("hello");

# a rejected snippet
int bad = "s";

# a dropped snippet
int gone = 1

# drop it
/drop gone

# a redefinition
int x = 20

# reload
/reload

# listing after reload
/list

# list all after reload
/list -all

# vars after reload
/vars

# history after reload
/history

# reload quiet
/reload -quiet

# list after quiet reload
/list

# numbering after reloads
100 + 1

# reload restore with no previous session
/reload -restore

# reload restore and quiet
/reload -restore -quiet

# reload quiet and restore
/reload -quiet -restore

# bad option
/reload -bogus

# class path option
/reload -class-path /nonexistent/dir

# reload with a trailing word
/reload foo

# set concise then reload
/set feedback concise

# reload in concise
/reload

# a method call
dbl(4)

# set feedback verbose
/set feedback verbose

# reload in verbose
/reload

# set normal
/set feedback normal

# an exception snippet
int[] arr = new int[2];

# throws
arr[9]

# reload with exception in history
/reload

# a user output in history
System.out.println("again");

# reload again
/reload
