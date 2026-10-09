# a method that divides
int div(int a, int b) {
    return a / b;
}

# call it with zero
div(1, 0)

# nested user methods
void c() {
    int[] x = new int[1];
    x[2] = 5;
}

# b calls c
void b() {
    System.out.println("in b");
    c();
}

# a calls b, three user frames
void a() {
    b();
}

# call a
a()

# call a as statement
a();

# multi-line method with throw deep inside
int pick(int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += i;
        if (i == 3) {
            throw new IllegalStateException("hit three");
        }
    }
    return total;
}

# call pick
pick(10)

# class with instance method
class Account {
    int balance = 10;
    public String toString() { return "Account"; }
    void withdraw(int amt) {
        if (amt > balance) {
            throw new IllegalArgumentException("insufficient funds: " + amt);
        }
        balance -= amt;
    }
}

# make one
Account acct = new Account();

# withdraw too much
acct.withdraw(50)

# withdraw too much as statement
acct.withdraw(50);

# class whose constructor throws
class Strict {
    Strict(int n) {
        if (n < 0) throw new IllegalArgumentException("negative: " + n);
    }
}

# construct bad
new Strict(-1)

# variable with throwing constructor
Strict st = new Strict(-2);

# is st defined
st

# static initializer failure
class Boom {
    static int V = 1 / 0;
}

# trigger it
Boom.V

# trigger again
Boom.V

# static block explicit
class Boom2 {
    static {
        if (true) throw new RuntimeException("static block");
    }
    static void hi() {}
}

# trigger block
Boom2.hi()

# method taking a lambda
int ap(java.util.function.IntUnaryOperator op, int v) { return op.applyAsInt(v); }

# lambda throwing
ap(x -> 10 / x, 0)

# stream with lambda
java.util.stream.IntStream.range(0, 3).map(i -> 10 / (i - 1)).sum()

# list forEach with lambda
java.util.List.of(1, 0).forEach(i -> System.out.println(10 / i));

# stream collect list map throws
java.util.List.of("1", "x").stream().map(Integer::parseInt).toList()

# record with compact constructor
record Pos(int x, int y) {
    Pos {
        if (x < 0) throw new IllegalArgumentException("x must be >= 0");
    }
}

# make bad record
new Pos(-1, 0)

# make good record
new Pos(1, 2)

# record with public compact constructor
record Pos2(int x, int y) {
    public Pos2 {
        if (x < 0) throw new IllegalArgumentException("x must be >= 0");
    }
}

# bad Pos2
new Pos2(-1, 0)

# bad Pos2 in a variable
Pos2 p2 = new Pos2(-1, 0);

# good Pos2
new Pos2(1, 2)

# class with bad toString
class BadStr {
    public String toString() { throw new RuntimeException("no string for you"); }
}

# displayed value
new BadStr()

# variable decl with bad toString
BadStr bs = new BadStr();

# show variable
bs

# list holding bad
java.util.List.of(new BadStr())

# println bad
System.out.println(bs)

# string concat bad
"x" + bs

# StackOverflow recursion
int rec(int n) { return rec(n + 1) + 1; }

# overflow
rec(0)

# after overflow still alive
1 + 1

# Error subclass
class MyErr extends Error {
    MyErr(String m) { super(m); }
}

# throw it
throw new MyErr("my error")

# exception from a method called in init
int bad = div(5, 0);

# bad var exists
bad

# method with exception cause chain in method
void wrap() {
    try {
        Integer.parseInt("zz");
    } catch (NumberFormatException e) {
        throw new IllegalStateException("wrapped", e);
    }
}

# call wrap
wrap()

# try catch at top level
try { Integer.parseInt("q"); } catch (NumberFormatException e) { System.out.println("caught " + e.getMessage()); }

# try finally propagate
try { int k = 1 / 0; } finally { System.out.println("finally ran"); }

# printStackTrace
new RuntimeException("trace me").printStackTrace();

# e.printStackTrace in catch inside method
void pst() {
    try { int[] q = new int[1]; q[3] = 1; } catch (Exception e) { e.printStackTrace(); }
}

# call pst
pst()

# getStackTrace length
new RuntimeException("x").getStackTrace().length

# first stack frame
new RuntimeException("x").getStackTrace()[0]

# exception value as expression
new RuntimeException("not thrown")

# exception stored in var
Exception ex = new IllegalStateException("kept");

# print ex
ex

# throw the stored one
throw ex;
