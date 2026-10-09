# a variable
int x = 10

# a method
int sq(int n) { return n * n; }

# reset
/reset

# reload (current history is empty since reset)
/reload

# vars after plain reload
/vars

# restore the previous session from before the reset
/reload -restore

# vars after restore
/vars

# methods after restore
/methods

# numbering after restore
x + 1

# restore again
/reload -restore

# list all after the second restore
/list -all

# a drop then rerun of the dropped id
int d = 1

# drop it
/drop d

# rerun the dropped id
/6

# vars to see the variable
/vars

# set concise
/set feedback concise

# rerun last in concise
/!

# rerun by minus in concise
/-1

# rerun a method in concise
/-3

# rerun id in concise
/1

# set silent
/set feedback silent

# rerun last in silent
/!

# reload in silent
/reload

# set normal
/set feedback normal

# restore in normal
/reload -restore -quiet

# reload quiet in normal
/reload -quiet

# history all
/history -all

# a rerun of a statement with output
System.out.println("out");

# rerun with range containing an output
/-1

# rerun a range of ids with a hyphen
/2-3

# rerun a range reversed text
/2-
