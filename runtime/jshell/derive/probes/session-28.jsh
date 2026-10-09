# a variable
int x = 10

# a method
int sq(int n) { return n * n; }

# a drop target
int d = 1

# drop it
/drop d

# reset
/reset

# restore the state from before the reset
/reload -restore

# vars after restore
/vars

# methods after restore
/methods

# list all after restore
/list -all

# numbering after restore
x + 1

# restore again
/reload -restore

# vars after second restore
/vars

# reset again
/reset

# restore quietly
/reload -restore -quiet

# vars after quiet restore
/vars

# rerun the dropped snippet by id
/3

# vars
/vars

# set concise
/set feedback concise

# rerun last in concise
/!

# rerun by minus in concise
/-1

# a value in concise
x + 2

# rerun the value in concise
/!

# set silent
/set feedback silent

# rerun last in silent
/!

# restore in silent
/reload -restore

# set normal
/set feedback normal

# an unrelated value
1 + 1

# rerun id with hyphen missing end
/2-

# rerun id range open start
/-3-5

# rerun range with letters
/a-b
