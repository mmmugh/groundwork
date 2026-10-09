# option after the mode
/set feedback verbose -retain

# abbreviated option
/set feedback -r concise

# a value in whatever mode that left
1 + 2

# the listing after retained forms
/set feedback

# retain with an unknown mode
/set feedback -retain nonsense

# double spaces before the mode
/set feedback   normal

# quoted mode name
/set feedback "verbose"

# a trailing semicolon
/set feedback normal;

# an empty-looking extra argument
/set feedback silent ""

# silent mode and a multi-line error
/set feedback silent

# a multi-line statement with a compile error in silent mode
int bad(int n) {
    return "x";
}

# a multi-line class in silent mode
class Q {
    int a;
}

# the listing commands in silent mode
/methods

# types in silent mode
/types

# list in silent mode
/list

# imports in silent mode
/imports

# switching out of silent mode
/set feedback concise

# the listing commands in concise mode
/methods

# types in concise mode
/types

# list in concise mode
/list

# imports in concise mode
/imports

# drop something with a dependent
int base = 1

# a dependent method
int useBase() { return base; }

# drop the base in concise
/drop base

# call the dependent
useBase()

# verbose drop
/set feedback verbose

# define again
int base = 2

# drop in verbose
/drop base

# drop a method in verbose
/drop useBase

# the resulting mode listing again
/set feedback
