# G14: a /drop range whose first snippet is active, with inactive ones after it
# F: a dropped snippet in the middle
int a = 1

int b = 1

int c = 1

/drop b

/drop 1-3

/vars

/reset

# G: an overwritten snippet at the end of the range
int a = 1

int b = 1

int b = 2

/drop 1-2

/vars

/reset

# H: a dropped snippet at the end of the range
int a = 1

int b = 1

/drop b

/drop 1-2

/vars

/reset

# I: a range that ends on an erroneous snippet's neighbor, and a range with an id that never existed in the middle
int a = 1

int b = 1

/drop 1-2

/reset

# K: ranges for /vars, /methods and /types that cross kinds
int x = 1

int m() { return 1; }

int y = 2

class T {}

/vars 1-3

/vars 2-3

/methods 1-2

/methods 1-3

/types 1-4

/types 4-4

/list 1-3

/drop y

/vars 1-3

/list 1-3
