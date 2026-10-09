# G15: what the middle of a range keeps, per command
int a = 1

int b = 1

int c = 1

/drop b

/list 1-3

/vars 1-3

/reset

# a replaced variable and a replaced class in the middle
int a = 1

int b = 1

class K {}

int b = 2

class K { int f; }

int z = 0

/vars 1-6

/types 1-6

/list 1-6

/reset

# an import and a rejected snippet in the middle
int a = 1

import java.util.*;

int q = "x";

int b = 1

/list 1-3

/list -all

/drop 1-3

/list -all
