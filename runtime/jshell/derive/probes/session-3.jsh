# rerun with nothing entered yet
/!

# a value
2 + 2

# rerun last
/!

# a variable
int z = 5

# rerun previous minus one
/-1

# rerun minus two
/-2

# rerun minus 4
/-4

# rerun out of range
/-99

# rerun minus zero
/-0

# rerun by id
/1

# rerun by id range
/1-2

# rerun two ids
/1 2

# rerun an id that does not exist
/77

# rerun a startup snippet id
/s1

# a rejected snippet
int q = "text";

# rerun last after rejection
/!

# rerun by error id
/e1

# rerun minus one after rejection
/-1

# a method
int sq(int n) { return n * n; }

# rerun it
/!

# a typo-d identifier
undefinedVar + 1

# rerun it
/-1

# list all to see ids
/list -all

# rerun with trailing text
/! extra

# rerun minus with text
/-x

# rerun id with slash dash range
/3-1

# a statement
System.out.println("hi");

# rerun statement
/!

# a command is not a snippet for rerun
/vars

# rerun after a command
/!

# rerun an import
import java.util.*;

# rerun the import
/!

# a class
class A { int v; }

# rerun the class
/!

# rerun a range spanning all
/1-9

# rerun mixed
/1 s1 e1
