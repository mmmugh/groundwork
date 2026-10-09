# method with a comment and blank line before the throwing statement
int calc(int n) {
    // compute
@@blank
    int r = 10 / n;
    return r;
}

# call calc zero
calc(0)

# redefine calc
int calc(int n) {
    return 100 / n;
}

# call the new calc
calc(0)

# list shows ids
/list

# list all shows failed snippets
/list -all

# an exception in a snippet then history of ids
1 / 0

# the next expression id
7

# vars after exceptions
/vars

# drop calc
/drop calc

# call dropped
calc(1)

# method overloaded frame names
int sq(int n) { return n / 0; }

# overload
int sq(String s) { return sq(s.length()); }

# call overload
sq("abc")

# class static method frame
class Util {
    static int half(int n) {
        return n / 0;
    }
}

# call static
Util.half(4)

# instance of class two levels
class Svc {
    void run() { Util.half(1); }
}

# call chain through class
new Svc().run()

# recursion with a base case failing at depth 3
int down(int n) {
    if (n == 0) throw new IllegalStateException("bottom");
    return down(n - 1);
}

# call down
down(3)

# exception with cause thrown from nested methods (cause frames)
void inner() { throw new IllegalArgumentException("deep cause"); }

# outer wraps
void outer() {
    try { inner(); }
    catch (IllegalArgumentException e) { throw new RuntimeException("wrapped", e); }
}

# call outer
outer()

# cause thrown in same method: frames shared
void same() {
    RuntimeException c = new RuntimeException("the cause");
    throw new RuntimeException("the effect", c);
}

# call same
same()

# rethrow same exception object
void rethrow() {
    try { int z = 1 / 0; }
    catch (ArithmeticException e) { throw e; }
}

# call rethrow
rethrow()

# exception object kept and thrown from a later line
Exception kept = new RuntimeException("kept at creation");

# throw kept
throw kept;

# fillInStackTrace differently
void make() { throw new RuntimeException("from make"); }

# call make in a statement with semicolon
make();

# toString of exception value
new IllegalStateException("shown as value")

# getMessage of caught value
try { Integer.parseInt("k"); } catch (Exception e) { e.getMessage(); }

# value of expression after catch
String msg = null;

# set msg in catch
try { Integer.parseInt("k"); } catch (Exception e) { msg = e.getMessage(); }

# msg shows
msg

# getClass name of caught
try { int[] t = new int[1]; t[1] = 0; } catch (Exception e) { System.out.println(e.getClass().getName()); }

# stack trace element of user frame
void ste() { throw new RuntimeException("ste"); }

# catch and print element
try { ste(); } catch (RuntimeException e) { System.out.println(e.getStackTrace()[0]); }

# catch print toString
try { ste(); } catch (RuntimeException e) { System.out.println(e); }

# System.out then exception inside a method
void noisy() { System.out.print("partial"); throw new RuntimeException("noisy"); }

# call noisy
noisy()

# next prompt text after partial output
1

# Throwable directly
throw new Throwable("throwable direct")

# ExceptionInInitializerError subclass chain from record
record R(int v) { static int S = 1 / 0; }

# touch R
R.S

# catch StackOverflowError
int deep(int n) { return deep(n + 1); }

# catch it
try { deep(0); } catch (StackOverflowError e) { System.out.println("caught SO"); }

# OutOfMemory style Error
throw new OutOfMemoryError("fake oom")

# VirtualMachineError
throw new StackOverflowError()

# ArithmeticException with custom message
throw new ArithmeticException("custom arithmetic")

# NumberFormatException thrown by user
throw new NumberFormatException("my nfe")

# uncaught exception inside static nested interface generics
java.util.Map<String,Integer> mp = new java.util.HashMap<>();

# unboxing null from map
int got = mp.get("k");

# Iterator remove illegal state
java.util.List.of(1).iterator().remove()

# Collections unmodifiable
java.util.Collections.unmodifiableList(new java.util.ArrayList<Integer>()).add(1)

# Integer.valueOf bad radix
Integer.parseInt("zz", 99)

# Long.parseLong
Long.parseLong("12.5")

# Boolean not exception
Boolean.parseBoolean("maybe")

# char arithmetic
"abc".substring(-1)

# String.format bad
String.format("%d", "s")

# array copy bad
System.arraycopy(new int[1], 0, new int[1], 0, 5)

# array copy dest null
java.util.Arrays.copyOfRange(new int[2], 3, 1)

# Scanner-free parse of null
Integer.parseInt(null)

# List.of null
java.util.List.of((Object) null)

# Map.of duplicate
java.util.Map.of("a", 1, "a", 2)

# Object.wait without monitor
new Object().wait()

# clone not supported
new Object() { Object c() throws Exception { return super.clone(); } }.c()
