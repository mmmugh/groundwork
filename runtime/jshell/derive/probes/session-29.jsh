# a variable
int x = 1

# set start none, no reset yet
/set start -none

# listing all, still has the startup snippet?
/list -all

# imports now
/imports

# a snippet still works
x + 1

# reset applies the start setting
/reset

# list all after reset
/list -all

# set start default again
/set start -default

# set start with a bad flag
/set start -bogus

# set start with two files, one missing
/set start /nonexistent/a.jsh /nonexistent/b.jsh

# set start PRINTING only, then reset
/set start PRINTING

# reset
/reset

# imports with printing only
/imports

# a print call works
println("p")

# set start back
/set start DEFAULT

# reset
/reset

# list
/list -all
