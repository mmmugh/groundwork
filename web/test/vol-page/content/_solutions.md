## ch02-check#1

```java
boolean isEven(int n) {
    return n % 2 == 0; // even when dividing by two leaves nothing over, which holds for negative numbers too
}

void main() {
    IO.println(isEven(4));
}
```

The remainder is 0 for every even number, negative ones included.

```java
boolean isEven(int n) {
    if (n % 2 == 0) {
        return true;
    }
    return false;
}

void main() {
    IO.println(isEven(4));
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

## ch02-check#2

```java
void main() {
    IO.println("Ada");
}
```
