# no argument in the starting mode
/set feedback

# switch to concise
/set feedback concise

# a value in concise
7 * 6

# no argument in concise
/set feedback

# switch to silent from concise
/set feedback silent

# a value in silent
int q = 4

# no argument in silent
/set feedback

# switch to verbose from silent
/set feedback verbose

# a declaration in verbose
int w = 9

# no argument in verbose
/set feedback

# switch to normal from verbose
/set feedback normal

# a declaration in normal
int e = 3

# no argument in normal
/set feedback

# switch to silent from normal
/set feedback silent

# switch to concise from silent
/set feedback concise

# switch to verbose from concise
/set feedback verbose

# switch to concise from verbose
/set feedback concise

# switch to normal from concise
/set feedback normal

# switch to the same mode
/set feedback normal

# retain verbose
/set feedback -retain verbose

# after retain, a value
1 + 1

# retain with no mode
/set feedback -retain

# an unknown mode name
/set feedback nonsense

# an unknown mode, then a value
5

# abbreviated v
/set feedback v

# abbreviated conc
/set feedback conc

# abbreviated n
/set feedback n

# abbreviated s (silent or ambiguous)
/set feedback s

# abbreviated c
/set feedback c

# abbreviated ve
/set feedback ve

# abbreviated no
/set feedback no

# abbreviated si
/set feedback si

# extra words
/set feedback verbose extra words

# extra word after normal
/set feedback normal x

# upper case mode name
/set feedback VERBOSE

# the retained mode setting after all this
/set feedback

# case of a lone slash set
/set feedback -retain concise extra

# unknown option
/set feedback -bogus verbose

# the command abbreviated
/set fee verbose

# the command abbreviated more
/se feedback normal
