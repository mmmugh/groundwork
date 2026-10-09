# var string length 20
String v20 = "a".repeat(20)

# var string length 50
String v50 = "b".repeat(50)

# var string length 80
String v80 = "c".repeat(80)

# var string length 100
String v100 = "d".repeat(100)

# var string length 110
String v110 = "e".repeat(110)

# var string length 150
String v150 = "f".repeat(150)

# var string length 200 with distinct chars
String v200 = "0123456789".repeat(20)

# expression string length 200 not truncated
"0123456789".repeat(20)

# var string length 3000
String v3000 = "g".repeat(3000)

# expression string length 3000
"h".repeat(3000)

# reassign long var
v200 = "0123456789".repeat(21)

# plain name of long var
v200

# assignment expression long
v200 = "0123456789".repeat(22)

# long var from an expression not declaration
var lv = "ij".repeat(100)

# StringBuilder long var
StringBuilder sbl = new StringBuilder("k".repeat(200))

# long list var
List<Integer> longList = new ArrayList<>(java.util.stream.IntStream.range(0, 100).boxed().toList())

# long list expression
java.util.stream.IntStream.range(0, 100).boxed().toList()

# long int array var
int[] bigArr = new int[200]

# long int array expression
new int[200]

# long array of range
int[] rangeArr = java.util.stream.IntStream.range(0, 100).toArray()

# long array of range expression
java.util.stream.IntStream.range(0, 100).toArray()

# String with newline over limit var
String vnl = "ab\n".repeat(60)

# String exactly 5 chars var
String v5 = "abcde"

# long string with quotes var
String vq = "\"q\"".repeat(60)

# long string with unicode var
String vu = "é✓".repeat(60)

# long string var of emoji
String ve = "😀".repeat(80)

# long string with control chars var
String vc = "\t\u0001".repeat(60)

# char array long var
char[] ca = "abcdefghij".repeat(20).toCharArray()

# long map expression
java.util.stream.IntStream.range(0, 60).boxed().collect(java.util.stream.Collectors.toMap(i -> i, i -> "v" + i, (a, b) -> a, java.util.TreeMap::new))

# long string 100 chars boundary 
String v99 = "x".repeat(99)

# 101
String v101 = "y".repeat(101)

# 120
String v120 = "z".repeat(120)

# 124
String v124 = "w".repeat(124)
