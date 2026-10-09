# first wrong, second fine
int p1 = "x"; int p2 = 2;

# was the second created
p2

# first fine, second wrong
int p3 = 1; int p4 = "x";

# first created second not
p3 + 1

# second not created
p4

# first throws, second fine
int a1 = 1 / 0; int a2 = 5;

# was the second created
a2

# first prints, second wrong
System.out.println("hi"); int b2 = "x";

# three snippets middle wrong
int c1 = 1; int c2 = "x"; int c3 = 3;

# which exist
c1 + c3

# three snippets last wrong
int d1 = 1; int d2 = 2; int d3 = "x";

# two snippets first a warning second an error
List rw = new ArrayList(); int e2 = "x";

# class then error
class Z1 { } int e3 = "x";

# method then error
void z2() { } int e4 = "x";

# blank line between
@@blank

# error then a value
int bad = "x"
42
