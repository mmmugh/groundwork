# env with nothing set
/env

# a variable
int x = 10

# a method
int dbl(int n) { return n * 2; }

# an import
import java.util.*;

# a class
class P { int a; }

# a rejected snippet
int bad = "s";

# a value
x + 1

# a dropped snippet
int gone = 1

# drop it
/drop gone

# save current
/save ../.work/scratch/session/saved.jsh

# save all
/save -all ../.work/scratch/session/saved-all.jsh

# save history
/save -history ../.work/scratch/session/saved-hist.jsh

# save start
/save -start ../.work/scratch/session/saved-start.jsh

# save with no argument
/save

# save with a bad option
/save -bogus ../.work/scratch/session/saved-b.jsh

# save to an unwritable directory
/save /nonexistent/dir/out.jsh

# save by id
/save 1 ../.work/scratch/session/saved-id.jsh

# reset then open the saved file
/reset

# open the saved file
/open ../.work/scratch/session/saved.jsh

# list after open
/list

# reset
/reset

# open the saved all file
/open ../.work/scratch/session/saved-all.jsh

# list all
/list -all

# reset
/reset

# open the saved history file
/open ../.work/scratch/session/saved-hist.jsh

# list all
/list -all

# open the saved start file
/open ../.work/scratch/session/saved-start.jsh

# open a missing file
/open ../.work/scratch/session/missing.jsh

# open with no argument
/open

# open a hand-written file with a command and an error
/open ../.work/scratch/session/input.jsh

# list all after that
/list -all

# open a file with a multi-line method
/open ../.work/scratch/session/input2.jsh

# open an empty file
/open ../.work/scratch/session/empty.jsh

# open a directory
/open ../.work/scratch/session

# history after open
/history

# open a startup name
/open DEFAULT

# open PRINTING
/open PRINTING

# open JAVASE
/open JAVASE

# open with two files
/open ../.work/scratch/session/empty.jsh ../.work/scratch/session/empty.jsh
