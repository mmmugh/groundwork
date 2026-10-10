## ch01-first-programs#4

```java
void main() {
    IO.println("Ada");
}
```

```java
void main() {
    IO.println("Ada   ");
}
```

### mistake

A missing semicolon does not compile:

```java
void main() {
    IO.println("Ada")
}
```

The starter, unchanged:

```java
void main() {
    IO.println("");
}
```

## ch02-types-and-input#4

```java
double average(double a, double b) {
    return (a + b) / 2;
}

void main() {
    IO.println(average(2, 3));
}
```

```java
double average(double a, double b) {
    return a / 2 + b / 2;
}

void main() {
    IO.println(average(1, 4));
}
```

### mistake

Division before addition:

```java
double average(double a, double b) {
    return a + b / 2;
}

void main() {
    IO.println(average(1, 4));
}
```
