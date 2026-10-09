# int array
new int[]{1, 2, 3}

# int array var
int[] ia = {1, 2, 3}

# double array
double[] da = {1.5, 2, 3e10, Double.NaN}

# char array
char[] ch = {'a', '\n', 'é', '\u0001'}

# boolean array
boolean[] ba = {true, false}

# String array
String[] sa = {"a", "b\n", null, "c\"d"}

# Object array with nulls
Object[] oa = {1, "two", null, 3.0, 'c'}

# empty int array
int[] e0 = {}

# empty String array expression
new String[0]

# new int array default
new int[3]

# new String array default
new String[2]

# long array
long[] la = {1L, 2L}

# short array
short[] sha = {1, 2}

# byte array
byte[] bya = {1, -2}

# float array
float[] fa = {1.5f, 2f}

# int 2d
int[][] i2 = {{1, 2}, {3, 4}}

# ragged int 2d
int[][] rag = {{1}, {2, 3}, {}}

# ragged with null row
int[][] rn = new int[2][]

# String 2d
String[][] s2 = {{"a", "b"}, {"c"}}

# 3d array
int[][][] i3 = new int[2][2][2]

# char 2d
char[][] c2 = {{'a', 'b'}, {'c'}}

# Object array containing array
Object[] nest = {new int[]{1, 2}, "x", new String[]{"p"}}

# array of lists
List<Integer>[] al = new List[]{List.of(1, 2), List.of(3)}

# array of records
record P(int x, int y) {}

# array of records value
P[] pa = {new P(1, 2), new P(3, 4)}

# array of enum
enum Color { RED, GREEN }

# enum array
Color[] ce = Color.values()

# array of Strings via split
"a,b,c".split(",")

# array length
ia.length

# array element
ia[1]

# array element assign
ia[1] = 9

# array element compound
ia[0] += 5

# array element incr
ia[2]++

# whole array again
ia

# array element out of range
ia[5]

# array of doubles with ints
double[] dd = {1, 2}

# array of Integer
Integer[] boxed = {1, null, 3}

# array of StringBuilder
StringBuilder[] sbs = {new StringBuilder("a"), new StringBuilder("b")}

# array of BigInteger
java.math.BigInteger[] bis = {java.math.BigInteger.ONE, java.math.BigInteger.TEN}

# array as var with var
var va = new int[]{7, 8}

# array in expression
new int[]{1, 2}.length

# nested String arrays with null
String[][] sn = {{"a", null}, null}

# Arrays.toString
java.util.Arrays.toString(ia)

# Arrays.asList
java.util.Arrays.asList(1, 2, 3)

# char array expression
"hey".toCharArray()

# boolean array default
new boolean[3]

# double array default
new double[2]

# char array default
new char[2]

# String 2d default
new String[2][2]

# array of arrays of records
P[][] pp = {{new P(1, 1)}, {}}

# array 1000
new int[1000].length
