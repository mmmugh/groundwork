# declaration without initializer int
int y;

# declaration without initializer String
String s;

# declaration without initializer array
int[] a;

# declaration without initializer double boolean char
double dz;

# boolean no init
boolean bz;

# char no init
char cz;

# long no init
long lz;

# Object no init
Object oz;

# List no init
List<Integer> lst;

# using uninitialized
y + 1

# several declarators
int p = 1, q = 2;

# several declarators no semicolon
int m = 3, n = 4

# mixed declarators with and without init
int u, w = 5

# several declarators of arrays
int[] a1 = {1}, a2 = {2, 3}

# several string declarators
String s1 = "x", s2 = "y"

# var declaration
var v = 10

# var with string
var vs = "str"

# var with list
var vl = new ArrayList<Integer>()

# var with double
var vd = 1.0 / 4

# final var
final int fin = 7

# static var
static int stat = 8

# declaration with semicolon
int sc = 9;

# declaration reinit
int sc = 10

# type change redeclare
String sc = "now string"

# redeclare without value
String sc

# assignment simple
y = 5

# assignment string
s = "abc"

# assignment chain
int c1, c2; c1 = c2 = 4

# assignment chain separate
c1 = c2 = 6

# compound add
y += 3

# compound multiply
y *= 2

# compound string
s += "d"

# compound shifts
y <<= 1

# compound division
y /= 4

# compound modulo
y %= 3

# compound on double
dz += 1.5

# compound on char
cz += 1

# compound on byte
byte bb = 10; bb += 5

# post increment
y++

# pre increment
++y

# post decrement
y--

# pre decrement
--y

# y now
y

# increment on double
dz++

# increment on char
cz++

# increment on Integer
Integer boxed = 5

# boxed increment
boxed++

# ternary
y > 0 ? "pos" : "neg"

# unary minus
-y

# boolean not
!true

# string compare
"a".equals("a")

# comparisons
5 == 5.0

# cast int to char
(char) 97

# cast double to int
(int) 3.99

# cast long to int overflow
(int) 3000000000L

# cast to byte
(byte) 200

# cast to short
(short) 70000

# cast int to double
(double) 5

# cast int to float
(float) 5

# cast char to int
(int) 'a'

# cast Object to String
(String) (Object) "s"

# char arithmetic
'a' + 1

# char plus char
(char) ('a' + 1)

# int division
7 / 2

# integer division by zero error
7 / 0

# modulo negative
-7 % 3

# long arithmetic
1L << 40

# shift int
1 << 33

# double formatting precise
2.0 / 3

# float to double
(double) 0.1f

# float arith
0.1f + 0.2f

# double sum 
0.1 + 0.7

# large double
123456789.123

# very large
1.0e100

# 1e6 vs 1e7 boundaries
1234567.0

# 12345678.0
12345678.0

# small
0.00012

# negative large
-1.5e-7

# long max overflow
Long.MAX_VALUE + 1

# Math
Math.sqrt(2)

# Math.PI
Math.PI

# Math round
Math.round(2.5)

# Math floor
Math.floor(-1.5)

# Math abs
Math.abs(-5)

# Math.pow
Math.pow(2, 10)

# int parse
Integer.parseInt("42")

# string length
"hello".length()

# char at
"hello".charAt(1)

# substring
"hello".substring(1, 3)
