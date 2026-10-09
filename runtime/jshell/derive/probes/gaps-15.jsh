# G24: options of /vars, /methods, /types, /list and /imports
int x = 1

int m() { return 1; }

class T {}

/vars -x

/vars -a

/vars -all x

/vars --all

/methods -s

/methods -start

/types -all T

/types -bogus

/list -a

/list -s

/list --a

/imports foo

/imports -all

/set f

/set fe

/set m

/set
