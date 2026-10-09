# ArithmeticException at top level
1 / 0

# NullPointerException helpful message on a null String
String s = null;

# NPE calling method on null variable
s.length()

# AIOOBE
int[] a = new int[3];

# array index out of bounds read
a[5]

# negative index
a[-1]

# charAt out of range
"abc".charAt(10)

# substring out of range
"abc".substring(5)

# substring begin>end
"abc".substring(2, 1)

# NumberFormatException
Integer.parseInt("abc")

# NumberFormatException empty
Integer.parseInt("")

# Double.parseDouble bad
Double.parseDouble("x.y")

# ClassCastException
Object o = "hi";

# cast fail
(Integer) o

# IllegalArgumentException with message
throw new IllegalArgumentException("bad arg")

# IllegalArgumentException no message
throw new IllegalArgumentException()

# IllegalStateException with message
throw new IllegalStateException("bad state")

# IllegalStateException no message
throw new IllegalStateException()

# custom exception class
class MyEx extends RuntimeException {
    MyEx(String m) { super(m); }
}

# throw custom
throw new MyEx("custom boom")

# checked exception at top level
throw new Exception("checked")

# checked exception no message
throw new java.io.IOException()

# exception with cause
throw new RuntimeException("outer", new IllegalStateException("inner"))

# cause chain of three
throw new RuntimeException("top", new IllegalStateException("mid", new ArithmeticException("root")))

# exception with only a cause
throw new RuntimeException(new IllegalStateException("inner"))

# message with newline
throw new RuntimeException("line1\nline2")

# variable still usable after exceptions
a.length

# variable initializer that throws
int v = 1 / 0;

# is v defined
v

# v in vars
/vars

# throw null
throw null

# Error subclass
throw new Error("plain error")

# AssertionError directly
throw new AssertionError("assertion direct")

# assert statement
assert 1 > 2 : "math broke";

# assert no message
assert false;

# unchecked in a statement with semicolon
Integer.parseInt("12x");

# 1/0 with semicolon
int z = 5 / 0;

# list index
java.util.List<Integer> li = new java.util.ArrayList<>();

# list get oob
li.get(2)

# List.of immutable
java.util.List.of(1).add(2)

# iterator NoSuchElement
new java.util.ArrayList<String>().iterator().next()

# Optional get
java.util.Optional.empty().get()

# ConcurrentModification
for (Integer x : new java.util.ArrayList<>(java.util.List.of(1,2,3))) { }

# negative array size
new int[-1]

# ArrayStoreException
Object[] objs = new String[1];

# store wrong type
objs[0] = 1;

# Objects.requireNonNull
java.util.Objects.requireNonNull(null, "must not be null")

# Objects.requireNonNull no msg
java.util.Objects.requireNonNull(null)

# NPE unboxing
Integer boxed = null;

# unbox
int un = boxed;

# NPE field array
int[] na = null;

# NPE array length
na.length

# NPE array element
na[0]

# NPE on chained
String[] sa = new String[2];

# chain
sa[0].length()

# throw in the middle of a expression statement
System.out.println("before"); int q = 1 / 0;
