# Chapter 2: Types and input

```java
void main() {
    String line = IO.readln("How many? ");
    int n = Integer.parseInt(line);
    IO.println(n * 2);
}
```

```output
How many? 21
42
```

The first deliberate compile error:

```java
void main() {
    int count = "three";
}
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

Write `average`, which returns the average of two numbers:

```java
double average(double a, double b) {
    return (a + b) / 2;
}

void main() {
    IO.println(average(1, 4));
}
```

A method that calls itself with no way to stop crashes on purpose:

```java
int down(int n) {
    return down(n + 1) + 1;
}

void main() {
    IO.println(down(0));
}
```

```output
Exception in thread "main" java.lang.StackOverflowError
```
