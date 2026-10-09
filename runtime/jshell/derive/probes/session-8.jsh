# open a file with a multi-line method
/open ../.work/scratch/session/input2.jsh

# list after multi-line open
/list

# open DEFAULT startup
/open DEFAULT

# list all after DEFAULT
/list -all

# open PRINTING
/open PRINTING

# methods after PRINTING
/methods

# open JAVASE
/open JAVASE

# imports after JAVASE
/imports

# imports count: a plain import
import java.util.*;

# env now
/env

# env with a class path that does not exist
/env -class-path /nonexistent/dir

# env with an existing directory
/env -class-path ../.work/scratch/session

# env shows the class path
/env

# vars survive env?
/vars

# a variable
int kept = 3

# env with another class path
/env -class-path ../.work/scratch/session/t

# is the variable still there
kept

# the env output again
/env

# env with a module-path option
/env -module-path ../.work/scratch/session

# env with add-modules
/env -add-modules java.sql

# env shows all
/env

# env bad option
/env -bogus

# env with a double-dash option
/env --class-path ../.work/scratch/session

# env with add-exports
/env --add-exports java.base/jdk.internal.misc=ALL-UNNAMED

# env now
/env

# reset keeps the env?
/reset

# env after reset
/env

# reload keeps the env?
/reload

# env after reload
/env

# set start with no arguments
/set start

# set start with a missing file
/set start /nonexistent/file.jsh

# set start none
/set start -none

# show start
/set start

# reset after start none
/reset

# list all after start none
/list -all

# imports after start none
/imports

# set start default
/set start -default

# show start
/set start

# reset
/reset

# list all after default
/list -all

# set start with a file
/set start ../.work/scratch/session/input2.jsh

# show the start setting
/set start

# reset with a custom start
/reset

# list all with custom start
/list -all

# set start to PRINTING
/set start PRINTING

# set start to DEFAULT PRINTING
/set start DEFAULT PRINTING

# reset
/reset

# list all
/list -all

# set start default at the end
/set start -default
