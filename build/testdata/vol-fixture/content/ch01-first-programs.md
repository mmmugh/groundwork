<!-- part: Part one: the basics -->
# Chapter 1: First programs

A program prints with `IO.println`, even text with <angle brackets> & ampersands:

```java
void main() {
    IO.println("Hello, <world> & café 😀");
}
```

```output
Hello, <world> & café 😀
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

A syntax reminder is not a program:

```java
if (condition) {
```

### Try It

1. Make it print your name.

```java
void main() {
    IO.println("Ada");
}
```
