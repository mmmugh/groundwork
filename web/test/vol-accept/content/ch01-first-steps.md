# Chapter 1: First steps

A program prints:

```java
void main() {
    IO.println("Hello, world!");
}
```

```output
Hello, world!
```

It can ask a question and use the answer:

```java
void main() {
    String name = IO.readln("Your name? ");
    IO.println("Hello, " + name + "!");
}
```

```output
Your name? Ada
Hello, Ada!
```

This one crashes on purpose:

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

This one does not compile, on purpose:

```java
void main() {
    IO.println(count);
}
```

### Try It

1. Write `isEven`, which says whether a number is even:

```java
boolean isEven(int n) {
    return n % 2 == 0;
}

void main() {
    IO.println(isEven(4));
}
```

```output
true
```

2. Make it print `Ada`:

```java
void main() {
    IO.println("Hi");
}
```

```output
Hi
```

3. Ask for a number and print it doubled:

```java
void main() {
    int n = Integer.parseInt(IO.readln("Number: "));
    IO.println(n * 2);
}
```

```output
Number: 5
10
```

4. What does this print?

```java
void main() {
    int x = 3;
    IO.println(x + 2);
    IO.println("x" + 2);
}
```

```output
5
x2
```

5. Print a box of stars, any size:

```java
void main() {
    IO.println("*");
}
```

```output
*
```

A syntax reminder is not a program:

```java
if (condition) {
```

A set prints in an order of its own:

```java
void main() {
    IO.println(java.util.Set.of("a", "b", "c", "d", "e", "f"));
}
```

```output
[a, b, c, d, e, f]
```
