# List.of
List.of(1, 2, 3)

# ArrayList var
List<String> names = new ArrayList<>(List.of("a", "b"))

# empty list
new ArrayList<String>()

# empty List.of
List.of()

# LinkedList var
LinkedList<Integer> ll = new LinkedList<>(List.of(3, 1, 2))

# TreeMap var
TreeMap<String, Integer> tm = new TreeMap<>(Map.of("b", 2, "a", 1))

# LinkedHashMap var
Map<String, Integer> lhm = new LinkedHashMap<>()

# put into LinkedHashMap
lhm.put("z", 26)

# put again returns old
lhm.put("z", 27)

# lhm
lhm

# TreeSet var
Set<Integer> ts = new TreeSet<>(List.of(5, 3, 9))

# nested lists
List<List<Integer>> nl = List.of(List.of(1), List.of(), List.of(2, 3))

# map of lists
Map<String, List<Integer>> ml = new TreeMap<>(Map.of("k", List.of(1, 2)))

# empty map
new HashMap<String, String>()

# empty set
new TreeSet<Integer>()

# list with null
Arrays.asList("a", null)

# list of strings with special chars
List.of("a\nb", "q\"uote", "")

# list of chars
List.of('a', 'b')

# list of doubles
List.of(1.0, 2.5, Double.NaN)

# list of longs and floats
List.of(1L, 2.5f)

# list of records
record Pt(int x, String name) {}

# list of records value
List.of(new Pt(1, "a"), new Pt(2, "b"))

# record
new Pt(3, "c")

# record var
Pt p = new Pt(4, "d")

# record with null
new Pt(0, null)

# record with nested record
record Line(Pt a, Pt b) {}

# nested record value
new Line(new Pt(1, "a"), new Pt(2, "b"))

# empty record
record Unit() {}

# empty record value
new Unit()

# record with array
record Holder(int[] data) {}

# record with array value
new Holder(new int[]{1}).toString().startsWith("Holder[data=[I@")

# record with list
record WL(List<Integer> items) {}

# record with list value
new WL(List.of(1, 2))

# record with double
record D(double v, float f, char c, long l) {}

# record primitives
new D(1, 2, 'x', 3)

# enum
enum Day { MON, TUE }

# enum value
Day.MON

# enum var
Day d = Day.TUE

# enum values
Day.values()

# enum with fields
enum Planet { EARTH(1.0), MARS(0.38); final double g; Planet(double g) { this.g = g; } }

# enum with fields value
Planet.MARS

# enum overriding toString
enum Fancy { A { public String toString() { return "fancy-a"; } } }

# fancy value
Fancy.A

# Optional present
Optional.of("x")

# Optional empty
Optional.empty()

# Optional int
OptionalInt.of(3)

# Optional of record
Optional.of(new Pt(1, "a"))

# Optional var
Optional<Integer> op = Optional.of(5)

# StringBuilder
new StringBuilder("abc")

# empty StringBuilder
new StringBuilder()

# StringBuilder with newline
new StringBuilder("a\nb")

# StringBuffer
new StringBuffer("sb")

# boxed Integer
Integer.valueOf(5)

# boxed Double
Double.valueOf(2)

# boxed Character
Character.valueOf('c')

# boxed Boolean
Boolean.TRUE

# boxed Long
Long.valueOf(7)

# boxed Byte
Byte.valueOf((byte) 1)

# boxed Float
Float.valueOf(1.5f)

# Integer var null
Integer nul = null

# Object holding int
Object o = 5

# Object holding string
Object os = "s"

# Object holding char
Object oc = 'c'

# Object holding double array
Object oda = new double[]{1}

# BigInteger
new java.math.BigInteger("123456789012345678901234567890")

# BigDecimal
new java.math.BigDecimal("1.50")

# BigDecimal division
new java.math.BigDecimal("1").divide(new java.math.BigDecimal("3"), 5, java.math.RoundingMode.HALF_UP)

# BigDecimal big exponent
new java.math.BigDecimal("1E+10")

# BigInteger var
java.math.BigInteger bi = java.math.BigInteger.TWO.pow(100)

# LocalDate
java.time.LocalDate.of(2024, 2, 29)

# LocalDate var
java.time.LocalDate ld = java.time.LocalDate.of(2020, 1, 1)

# Duration
java.time.Duration.ofMinutes(90)

# LocalTime
java.time.LocalTime.of(13, 5)

# LocalDateTime
java.time.LocalDateTime.of(2024, 1, 2, 3, 4, 5)

# Period
java.time.Period.of(1, 2, 3)

# Class object
String.class

# Class of int
int.class

# Class of array
int[].class

# Thread? Object class name
new Object().getClass()

# Character class
Character.class
