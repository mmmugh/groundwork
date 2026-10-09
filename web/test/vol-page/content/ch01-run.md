# Chapter 1: Run

Hello:

```java
void main() {
    IO.println("Hello, <world> & café 😀");
}
```

```output
Hello, <world> & café 😀
```

A crash:

```java
void main() {
    int[] a = new int[3];
    IO.println(a[3]);
}
```

```output
Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3
	at Main.main(Main.java:3)
```

An endless loop:

```java
void main() {
    IO.println("start");
    while (true) {}
}
```

Endless printing:

```java
void main() {
    while (true) IO.println("x");
}
```

Endless recursion:

```java
int down(int n) {
    return down(n + 1) + 1;
}

void main() {
    IO.println(down(0));
}
```

A question:

```java
void main() {
    int n = Integer.parseInt(IO.readln("How many? "));
    IO.println(n * 2);
}
```

```output
How many? 21
42
```

Two questions:

```java
void main() {
    String name = IO.readln("Name? ");
    String city = IO.readln("City? ");
    IO.println(name + " from " + city);
}
```

```output
Name? café 😀
City? Oslo
café 😀 from Oslo
```

Until Ctrl-D:

```java
void main() {
    String s;
    int n = 0;
    while ((s = IO.readln("> ")) != null) n++;
    IO.println("lines: " + n);
}
```

A prompt, then a hang:

```java
void main() {
    IO.print("Guess: ");
    while (true) {}
}
```

A reminder, not a program:

```java
if (condition) {
```

A line wider than a phone:

```java
void main() {
    IO.println("This line is much wider than a phone held upright, so the box scrolls it inside itself and the page never scrolls sideways.");
}
```

Memory filled with arrays:

```java
void main() {
    var keep = new java.util.ArrayList<long[]>();
    while (true) keep.add(new long[1_000_000]);
}
```

Compiles with javac, fails at TeaVM's stage:

```java
void main() {
    System.out.write(65);
}
```

A warning on stderr, then a question:

```java
void main() {
    System.err.println("warming up");
    String name = IO.readln("Name? ");
    IO.println("Hi " + name);
}
```

The clock, then a question:

```java
void main() {
    IO.println(System.nanoTime());
    IO.readln("Go? ");
    IO.println("done");
}
```

Still printing when Run is pressed again:

```java
void main() {
    int run = (int) (Math.random() * 1_000_000);
    for (int i = 1; i <= 800; i++) {
        IO.println("run " + run + " line " + i);
        long until = System.nanoTime() + 2_000_000;
        while (System.nanoTime() < until) {}
    }
}
```
