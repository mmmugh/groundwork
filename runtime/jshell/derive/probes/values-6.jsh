# class with overridden toString
class Dog { public String toString() { return "Dog!"; } }

# its value
new Dog()

# its var
Dog dg = new Dog()

# toString with newlines
class NL { public String toString() { return "line1\nline2\n"; } }

# newline value
new NL()

# newline var
NL nl1 = new NL()

# toString very long
class Long1 { public String toString() { return "L".repeat(300); } }

# long value
new Long1()

# long var
Long1 l1 = new Long1()

# toString throws
class Thrower { public String toString() { throw new IllegalStateException("boom"); } }

# throwing value
new Thrower()

# throwing var
Thrower th = new Thrower()

# next entry after thrower
1 + 1

# toString returning empty
class Empty { public String toString() { return ""; } }

# empty toString value
new Empty()

# toString with quotes
class Q { public String toString() { return "say \"hi\""; } }

# quotes value
new Q()

# toString with tab and unicode
class TU { public String toString() { return "a\tb é ✓"; } }

# tab value
new TU()

# toString with control char
class CC { public String toString() { return "a\u0001b"; } }

# control value
new CC()

# toString with trailing spaces
class TS { public String toString() { return "  padded  "; } }

# padded value
new TS()

# toString of object in list
List.of(new Dog(), new Dog())

# toString of object with null in list
List.of(new Dog()).toString()

# plain class no toString replaced by hash is avoided; use getClass name
new Dog().getClass().getName()

# static nested name
class Outer { static class In { public String toString() { return "in"; } } }

# nested value
new Outer.In()

# anonymous object toString
new Object() { public String toString() { return "anon"; } }

# interface instance toString
interface Shape { double area(); }

# class implementing
class Sq implements Shape { public double area() { return 4; } public String toString() { return "Sq"; } }

# typed as interface
Shape shp = new Sq()

# char sequence
CharSequence cs = "text"

# Object holding StringBuilder
Object osb = new StringBuilder("sb")

# Comparable holding int
Comparable<Integer> cmp = 3

# Number holding double
Number num = 2.5

# Object holding null
Object onull = null

# Object holding list
Object ol = List.of(1)

# Iterable
Iterable<Integer> it = List.of(1, 2)

# Exception value
new RuntimeException("x")

# Exception without message
new IllegalArgumentException()

# Throwable var
Exception ex = new Exception("msg")

# Exception with cause
new RuntimeException("outer", new Exception("inner"))

# String.valueOf of char array
String.valueOf(new char[]{'h', 'i'})
