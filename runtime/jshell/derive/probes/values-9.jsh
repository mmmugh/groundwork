# array boundary 23
int[] t23 = new int[23]

# array boundary 24
int[] t24 = new int[24]

# char double quote
'"'

# string single quote
"it's"

# char form feed
'\f'

# char backspace
'\b'

# char carriage return
'\r'

# char escape ESC
'\u001b'

# char DEL
'\u007f'

# char nbsp
' '

# char U+2028
' '

# char CJK
'中'

# char Greek
'λ'

# char space
' '

# char digit
'7'

# string with ESC
"a\u001bb"

# string with form feed
"a\fb"

# string with s escape
"a\sb"

# string with literal backslash u text
"\\u0041"

# string with surrogate pair
"😀"

# string with NEL
"a\u0085b"

# string with nbsp
"a b"

# float NaN
Float.NaN

# float max
Float.MAX_VALUE

# float min
Float.MIN_VALUE

# float small
1e-5f

# float negative zero
-0.0f

# float 100/3
100.0f / 3

# float 1e7
1e7f

# float 1234567.0
1234567.0f

# float infinity
1.0f / 0

# double neg inf var
double ninf = -1.0 / 0

# double NaN var
double nan = 0.0 / 0.0

# double -0.0 var
double nz = -0.0

# double 0.0 var
double zero = 0.0

# byte min
Byte.MIN_VALUE

# short max
Short.MAX_VALUE

# char max
Character.MAX_VALUE

# char min value
Character.MIN_VALUE

# println then value in one entry
System.out.println("side"); 5

# method printing and returning
int loud() { System.out.println("loud"); return 1; }

# call it
loud()

# call it in var declaration
int lv = loud()

# print with no newline then value
System.out.print("pfx"); 6

# value then print
7; System.out.println("after");

# StringBuilder multi-line var truncation
StringBuilder nlv = new StringBuilder("ab\n".repeat(40))

# 40 char sb no truncation
StringBuilder nsv = new StringBuilder("ab\n".repeat(20))

# Set of small ints HashSet
new HashSet<>(List.of(3, 1, 2))

# HashMap with small int keys
new HashMap<>(Map.of(1, "a", 2, "b"))

# HashMap var with string keys
Map<String, Integer> hm = new HashMap<>(Map.of("one", 1))

# Map.of single
Map.of("k", 1)

# Map entry
Map.entry("k", 1)

# map with null value
new HashMap<String, String>(Collections.singletonMap("a", null))

# map with string values containing special
new TreeMap<>(Map.of("a\nb", "c\"d"))

# map nested truncation var
Map<Integer, String> bigm = new TreeMap<>(); for (int i = 0; i < 30; i++) bigm.put(i, "v" + i);

# bigm name
bigm

# Deque
new ArrayDeque<>(List.of(1, 2))

# PriorityQueue
new PriorityQueue<>(List.of(3, 1, 2))

# Stack
new Stack<Integer>()

# Collections.emptyList
Collections.emptyList()

# unmodifiable list value
Collections.unmodifiableList(new ArrayList<>(List.of(1)))

# stream value avoided; stream toList
List.of(1, 2, 3).stream().map(x -> x * 2).toList()

# Iterator? sum
List.of(1, 2, 3).stream().mapToInt(x -> x).sum()

# average OptionalDouble
List.of(1, 2).stream().mapToInt(x -> x).average()

# joined
String.join("-", List.of("a", "b"))

# String.format
String.format("%5.2f|%d", 3.14159, 42)

# string switch var of Character
Character chv = 'z'

# long var with L
long lv2 = 10000000000L

# int var from char
int fromc = 'a'

# hex literal long
0xFFFFFFFFL

# binary literal
0b1010

# underscore literal
1_000_000

# octal
017

# int min literal
-2147483648

# float var from int
float ff = 3

# double var from long
double dl = 5L

# char var from int constant
char fromi = 65

# byte var from char constant
byte bc = 'a'
