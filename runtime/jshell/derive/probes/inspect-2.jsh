# variable of undeclared type
Foo f

# list shows it
/list

# vars with undeclared type
/vars

# method waiting on undeclared name
int usesBar() { return bar(); }

# method waiting on undeclared type
Baz mkBaz() { return null; }

# methods listing
/methods

# types listing empty
/types

# define the missing type
class Foo {}

# vars after Foo defined
/vars

# methods after
/methods

# define bar
int bar() { return 1; }

# methods again
/methods

# a class waiting on missing type
class Q extends Missing {}

# types with unresolved
/types

# list with unresolved
/list Q

# imports default
/imports

# import single
import java.util.List;

# import static
import static java.lang.Math.abs;

# import static star
import static java.lang.Math.*;

# import module
import module java.sql;

# imports after
/imports

# list imports
/list

# list -all after imports
/list -all

# imports with extra arg
/imports foo

# vars with arg
/vars s1

# vars all
/vars -all

# vars start
/vars -start

# methods -all
/methods -all

# types -all
/types -all

# imports -all
/imports -all

# imports -start
/imports -start

# list bad option
/list -x

# list a name and an id
/list f 1
