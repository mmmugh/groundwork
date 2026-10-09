# Uncaught exceptions (DERIVATION.md X1 to X5, N3). JDK frames carry "frames"; "message" where Ristretto words the message itself.
1 / 0

int[] arr = {1, 2, 3}

arr[5]

#! frames
"abc".charAt(10)

#! frames
Integer.parseInt("abc")

#! frames
Integer.parseInt("")

#! frames
Double.parseDouble("x.y")

#! message
Object o = "s"; Integer i = (Integer) o;

throw new IllegalArgumentException("bad arg");

throw new IllegalStateException();

throw new RuntimeException("");

throw new Exception("checked");

class MyEx extends RuntimeException { MyEx(String m) { super(m); } }

#! startup
throw new MyEx("custom boom");

throw new RuntimeException("outer", new IllegalStateException("inner"));

throw new RuntimeException("top", new IllegalStateException("mid", new ArithmeticException("root")));

throw new RuntimeException("line1\nline2");

int v = 1 / 0;

v

int div(int a) {
    int b = 0;
    return a / b;
}

div(3)

void c3() { int[] x = new int[1]; x[2] = 1; }

void b3() { System.out.println("in b"); c3(); }

void a3() { b3(); }

a3()

class Account {
    int balance = 10;
    void withdraw(int n) {
        if (n > balance) {
            throw new IllegalArgumentException("insufficient funds: " + n);
        }
        balance -= n;
    }
}

new Account().withdraw(50)

class Strict { Strict(int n) { if (n < 0) throw new IllegalArgumentException("negative: " + n); } }

new Strict(-1)

class Boom { static int V = 1 / 0; }

Boom.V

int ap(java.util.function.IntUnaryOperator f, int x) { return f.applyAsInt(x); }

ap(x -> 10 / x, 0)

#! frames
java.util.stream.IntStream.range(0, 3).map(i -> 10 / (i - 1)).sum()

#! frames
java.util.List.of(1, 0).forEach(i -> System.out.println(10 / i));

int wrapped(String s) {
    try {
        return Integer.parseInt(s);
    } catch (NumberFormatException e) {
        throw new IllegalStateException("wrapped", e);
    }
}

#! frames
wrapped("zz")

String sn = null;

#! message
#! startup
sn.length()

int[] na = null;

#! message
#! startup
na.length

int usesMissing() { return missing + 1; }

usesMissing()

int later = usesMissing();

#! frames
java.util.Optional.empty().get()

#! frames
new java.util.ArrayList<String>().get(0)

#! frames
java.util.List.of(1).add(2)

System.out.print("partial"); throw new RuntimeException("noisy");

int rec(int n) { return rec(n + 1) + 1; }

#! message
rec(0)

5 + 5
