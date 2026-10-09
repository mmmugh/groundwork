# string with quoted length 79
String q77 = "a".repeat(77)

# quoted length 80
String q78 = "b".repeat(78)

# quoted length 81
String q79 = "c".repeat(79)

# quoted length 82
String q80 = "d".repeat(80)

# StringBuilder text length 80 exactly
StringBuilder s80 = new StringBuilder("e".repeat(80))

# StringBuilder text length 81
StringBuilder s81 = new StringBuilder("0123456789".repeat(8) + "X")

# StringBuilder text length 79
StringBuilder s79 = new StringBuilder("f".repeat(79))

# tail with emoji at end, units
String et = "a".repeat(60) + "😀".repeat(30)

# head with distinct chars to see which are kept
String dist = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>/?"

# distinct with 90 chars via StringBuilder
StringBuilder dsb = new StringBuilder("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>/?")

# compound assignment string long
dist += "tail"

# method call result long assigned
String viaMethod = dist.toUpperCase()

# list var length around limit
List<String> ls = List.of("alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel", "india")

# list var short enough
List<String> ls2 = List.of("alpha", "bravo", "charlie", "delta", "echo", "foxtrot")

# int array var 40 items
int[] a40 = new int[40]

# int array var 25 items
int[] a25 = new int[25]

# int array var 20 items
int[] a20 = new int[20]

# int array var 30 items
int[] a30 = new int[30]

# multi declarator long
String m1 = "p".repeat(100), m2 = "q".repeat(100)

# string array with long elements var
String[] sa = {"x".repeat(60), "y".repeat(60)}

# nested truncation 2d array var
int[][] g = new int[30][30]

# $ var assigned from long expression then name
String zz = "0123456789".repeat(10)

# name of it
zz

# $ var name usage
$1 = "r".repeat(100)
