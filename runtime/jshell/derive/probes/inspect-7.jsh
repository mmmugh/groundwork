# temp variable from expression
10 * 2

# temp variable from string
"hello"

# list temps
/list

# vars temps
/vars

# list temp by name
/list $1

# vars by temp name
/vars $2

# drop a temp
/drop $1

# vars after drop temp
/vars

# value kinds
String str = "a quoted \"string\" here"

# char
char c = 'x'

# double
double d = 1.0 / 3

# boolean
boolean flag = true

# null array
int[] none = null

# 2D array
int[][] grid = {{1, 2}, {3}}

# list value
java.util.List<String> names = new java.util.ArrayList<>(java.util.List.of("a", "b"))

# record variable
record P(int x, int y) {}

# record instance
P p = new P(1, 2)

# enum
enum Dir { N, S }

# enum value
Dir dir = Dir.N

# long string
String longs = "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz"

# vars all kinds
/vars

# exception initializer
int z = 1 / 0;

# vars after exception
/vars z

# list after exception
/list z

# exception expression
1 / 0

# list after exception expression
/list

# var and type same name
class Same {}

# var named Same
int Same = 4

# list Same
/list Same

# vars Same
/vars Same

# types Same
/types Same

# drop Same
/drop Same

# list after drop Same
/list

# method rejected body
int bad() { return "s"; }

# method with error rejected list
/list -all

# redefine var with different type
String x = "s"

# redefine as method name
int x() { return 1; }

# list x
/list x

# vars x
/vars x

# methods x
/methods x

# class redefined with different members
class R { int a; }

# class redefined again
class R { String b; }

# list R
/list R

# types R
/types R

# statement not stored
for (int i = 0; i < 2; i++) { }

# list after statement
/list

# comment before declaration
/* c */ int cm = 1;

# list cm
/list cm

# println
System.out.println("hi")

# list println
/list

# method with generic bound
<T extends Comparable<T>> T max(T a, T b) { return a; }

# method with array varargs generic
static <E> java.util.List<E> lst(E... es) { return null; }

# methods
/methods

# method with throws
void thrower() throws Exception { }

# methods thrower
/methods thrower

# final static modifiers
static final int K2 = 3

# list K2
/list K2

# vars K2
/vars K2

# end
/vars -all
