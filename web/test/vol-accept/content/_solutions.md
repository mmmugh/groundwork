## ch01-first-steps#5

```java
boolean isEven(int n) {
    return n % 2 == 0;
}

void main() {
    IO.println(isEven(4));
}
```

```java
boolean isEven(int n) {
    if (n % 2 == 0) {
        return true;
    }
    return false;
}

void main() {
    IO.println(isEven(7));
}
```

### mistake

```java
boolean isEven(int n) {
    return n % 2 == 1;
}

void main() {
    IO.println(isEven(4));
}
```

```java
boolean isEven(int n) {
    return n % 2 == 0
}

void main() {
    IO.println(isEven(4));
}
```

## ch01-first-steps#6

```java
void main() {
    IO.println("Ada");
}
```

```java
void main() {
    String name = "Ada";
    IO.println(name);
}
```

### mistake

```java
void main() {
    IO.println("ada");
}
```

## ch01-first-steps#7

```java
void main() {
    int n = Integer.parseInt(IO.readln("Number: "));
    IO.println(n * 2);
}
```

```java
void main() {
    String line = IO.readln("Number: ");
    int n = Integer.parseInt(line);
    IO.println("Doubled: " + (n + n));
}
```

### mistake

```java
void main() {
    int n = Integer.parseInt(IO.readln("Number: "));
    IO.println(n + 2);
}
```

## ch01-first-steps#8

```text
5   
x2
```

### mistake

```text
5
x5
```

## ch01-first-steps#9

```java
void main() {
    IO.println("***");
    IO.println("* *");
    IO.println("***");
}
```

## ch01-first-steps-practice#1

```java
String greet(String name) {
    return "Hello, " + name + "!";
}

void main() {
    IO.println(greet("Ada"));
}
```

```java
String greet(String name) {
    String s = "Hello, ";
    s = s + name;
    return s + "!";
}

void main() {
    IO.println(greet("Bo"));
}
```

### mistake

```java
String greet(String name) {
    return "Hello " + name + "!";
}

void main() {
    IO.println(greet("Ada"));
}
```

```java
String greet(String name) {
    return "Hello, " + name;
}

void main() {
    IO.println(greet("Ada"));
}
```
