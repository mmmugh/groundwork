# a variable
int x = 10

# a value for numbering
x + 1

# a method
int dbl(int n) { return n * 2; }

# an import
import java.util.*;

# a class
class P { int a; }

# change feedback mode
/set feedback concise

# a snippet in concise
int y = 3

# history before reset
/history

# reset
/reset

# vars after reset
/vars

# methods after reset
/methods

# types after reset
/types

# imports after reset
/imports

# listing after reset
/list

# list all after reset
/list -all

# is the old variable gone
x

# numbering after reset
5 + 5

# feedback after reset
int w = 1

# feedback mode query
/set feedback

# history after reset
/history

# history all after reset
/history -all

# set verbose mode
/set feedback verbose

# a snippet in verbose
int v = 2

# reset with extra text
/reset foo

# reset with class-path option
/reset -class-path /nonexistent/dir

# vars after that
/vars

# env after that
/env

# reset quiet-like option
/reset -quiet

# reset with bad option
/reset -bogus

# the mode again
/set feedback

# a snippet
int after = 7

# a rejected snippet to get an e id
int bad = "s";

# reset then list -all for e ids
/reset

# list all
/list -all
