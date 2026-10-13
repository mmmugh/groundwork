<!-- part: Part I: Foundations -->
# Chapter 6: Methods

A **method** is a named block of code you can run whenever you want. You have been using methods since Chapter 1: `IO.println`, `IO.readln`, `Integer.parseInt` and `strip()` are all methods someone else wrote. (Many languages call them functions; Java calls them methods.) This chapter is about writing your own.

```java
void greet() {
    IO.println("Hello!");
    IO.println("Welcome to the program.");
}

void main() {
    greet();
    greet();
}
```

```output
Hello!
Welcome to the program.
Hello!
Welcome to the program.
```

The first four lines **declare** the method `greet`: they store its instructions under that name, and run nothing. `greet();` **calls** it, which is what actually runs the block. Declaring and calling are separate acts, and confusing them is the most common early error: a program that declares `greet` but never calls it produces no output at all, and looks broken.

Now the line every program in this course has started with can be read in full. `main` is a method too: the one Java calls when the program starts. The parentheses after a method's name hold what it takes in, and `main`'s and `greet`'s are empty because they take nothing. `void`, the word in front of the name, says that the method gives nothing back when it finishes; the section on return values below shows methods that do.

A method is declared beside `main`, never inside it, and the order does not matter: Java reads the whole file before it runs any of it, so `greet` could just as well come after `main`. A method of your own is called by its name alone, `greet()`. The dot in `IO.println` says where that method lives: `println` belongs to `IO`, just as `strip()` belongs to the text it is called on.

## Parameters

A method becomes far more useful when you can hand it information. The variables declared in the parentheses of a method's declaration are its **parameters**; the values you pass when calling it are **arguments**. A parameter is declared like any other variable, type first:

```java
void greet(String name) {
    IO.println("Hello, " + name + "!");
}

void main() {
    greet("Ada");
    greet("Grace");
}
```

```output
Hello, Ada!
Hello, Grace!
```

Several parameters are separated by commas, each with its own type, and the order matters—arguments are matched to parameters by position:

```java
void describeRectangle(int width, int height) {
    IO.println("A " + width + " by " + height + " rectangle has area " + (width * height) + ".");
}

void main() {
    describeRectangle(7, 4);
    describeRectangle(4, 7);
}
```

```output
A 7 by 4 rectangle has area 28.
A 4 by 7 rectangle has area 28.
```

Some arguments are nearly always the same, and it would be convenient to leave them out. Java's way is to declare a second method with the same name and fewer parameters, which calls the first with the usual value filled in:

```java
void greet(String name, String greeting) {
    IO.println(greeting + ", " + name + "!");
}

void greet(String name) {
    greet(name, "Hello");
}

void main() {
    greet("Ada");
    greet("Ada", "Good morning");
}
```

```output
Hello, Ada!
Good morning, Ada!
```

Declaring two methods with the same name is called **overloading**, and Java tells them apart by the arguments in each call. `greet("Ada")` passes one `String`, so it runs the one-parameter `greet`, which calls the two-parameter one with `"Hello"` filled in. `greet("Ada", "Good morning")` passes two, and runs the two-parameter one directly. So methods that share a name must differ in the number or the types of their parameters: a second `greet` that also takes one `String` is refused, `method greet(String) is already defined`.

## Return values

So far these methods print. Far more often you want a method that **produces a value** for the rest of the program to use. That is what `return` does. The word in front of the method's name, where `void` was, says what type of value the method gives back: it is the method's **return type**.

```java
int area(int width, int height) {
    return width * height;
}

void main() {
    int room = area(12, 10);
    IO.println("The room is " + room + " square feet.");
    IO.println("Two rooms would be " + (area(12, 10) * 2) + " square feet.");
}
```

```output
The room is 120 square feet.
Two rooms would be 240 square feet.
```

`int area(...)` promises an `int`, and `return width * height;` keeps the promise: it ends the method and hands the value back to the call, so `area(12, 10)` can stand anywhere an `int` can, stored in a variable or used in a calculation. javac holds every method to its promise: one that promises an `int` and could finish without returning one does not compile. `void` is the return type that promises nothing. A `void` method does its work and gives back no value at all, which is why `main` is declared `void`: nothing is waiting to receive a value from it.

The difference between printing and returning is the most important idea in this chapter.

|  | Printing | Returning |
| --- | --- | --- |
| Who receives it | A human, on screen | The rest of the program |
| Can it be stored? | No | Yes |
| Can it be used in a calculation? | No | Yes |

Compare these two:

```java
void doublePrint(int n) {
    IO.println(n * 2);
}

int doubleReturn(int n) {
    return n * 2;
}

void main() {
    doublePrint(5);
    int b = doubleReturn(5);
    IO.println("b is " + b);
}
```

```output
10
b is 10
```

`doublePrint` displays `10` and hands back nothing: its return type is `void`. `doubleReturn` displays nothing but hands back `10`, which `b` holds and the last line prints. Try to store what `doublePrint` gives back, and the program never runs:

```java
void doublePrint(int n) {
    IO.println(n * 2);
}

void main() {
    int a = doublePrint(5);
    IO.println("a is " + a);
}
```

Press Run, and javac refuses:

```text
Main.java:6: error: incompatible types: void cannot be converted to int
    int a = doublePrint(5);
                       ^
1 error
```

`void` means no value at all, so there is nothing to put in `a`, and javac catches the mistake before the program runs.

The rule of thumb: **methods that calculate should return; only methods whose job is display should print.** A method that calculates *and* prints is hard to reuse, because you cannot get at the answer.

`return` also ends the method immediately, wherever it is, which is useful for stopping as soon as the answer is known. This method looks for a letter in a word, and stops the moment it finds one:

```java
int positionOf(String word, char letter) {
    for (int i = 0; i < word.length(); i++) {
        if (word.charAt(i) == letter) {
            return i;
        }
    }
    return -1;
}

void main() {
    IO.println(positionOf("banana", 'n'));
    IO.println(positionOf("banana", 'z'));
}
```

```output
2
-1
```

When the loop finds an `n`, `return i;` hands back its position, and the method is over, loop and all. When the loop runs out of letters, the method reaches its last line and returns -1. No letter is ever at position -1, so -1 can mean "not found," and the caller tests for it: `if (positionOf(word, 'z') == -1)`. In a `void` method, `return;` with no value ends the method early in the same way, and gives nothing back.

Not every method has a spare value like -1. A division can give back any `double` at all, so no value is left over to mean "no answer." Then the caller checks before it calls:

```java
double divide(double a, double b) {
    return a / b;
}

void main() {
    IO.println(divide(10, 2));

    double divisor = 0;
    if (divisor != 0) {
        IO.println(divide(10, divisor));
    } else {
        IO.println("Cannot divide by zero.");
    }
}
```

```output
5.0
Cannot divide by zero.
```

`divide(10, 2)` passes two `int`s, and its `double` parameters take them as readily as `double price = 3;` took an `int` in Chapter 2. Without the check, `divide(10, 0)` would not stop the program as Chapter 3's `5 / 0` did: a `double` divided by zero gives `Infinity`, which prints as that word and is no use as an answer.

A method gives back exactly one value. Where two answers are wanted, such as the minutes and the seconds in a number of seconds, write two methods, one for each:

```java
int minutesIn(int totalSeconds) {
    return totalSeconds / 60;
}

int secondsLeft(int totalSeconds) {
    return totalSeconds % 60;
}

void main() {
    int total = 500;
    IO.println(minutesIn(total) + " minutes and " + secondsLeft(total) + " seconds");
}
```

```output
8 minutes and 20 seconds
```

(Chapter 10 shows how to hand back several values bundled into one, called a record.)

## Scope

Variables created inside a method exist only inside it. This is called **local scope**, and it is a feature: it means you can name a variable `total` inside a method without worrying about whether some other part of the program already uses that name. It is Chapter 4's rule for blocks again, since a method's body is a block.

```java
int calculate() {
    int result = 42;
    return result;
}

void main() {
    IO.println(calculate());
    IO.println(result);
}
```

javac refuses the program, because of its last line:

```text
Main.java:8: error: cannot find symbol
    IO.println(result);
               ^
  symbol:   variable result
  location: class Main
1 error
```

Its `symbol:` and `location:` lines say what javac looked for, a variable named `result`, and where it looked: `class Main` is javac's name for the whole program in the file. `result` was created inside `calculate`, and nothing outside `calculate` can see it, `main` included. Values get out of a method by being returned, and only by being returned. Parameters are local too: each one is created when its method is called, holding a copy of the argument it was handed, and is gone when the method returns.

A method cannot see another method's variables. A variable declared outside every method, at the top of the file, is different: it is called a **field**, and every method in the file can read it and change it. Relying on that makes methods harder to reuse and harder to reason about. Pass what a method needs as parameters instead. This version is fragile, because it depends on a field:

```java
double taxRate = 0.08;

double totalWithTax(double price) {
    return price * (1 + taxRate);
}

void main() {
    IO.println(totalWithTax(50));
}
```

```output
54.0
```

This one is better, because everything it needs is declared in its parameters:

```java
double totalWithTax(double price, double taxRate) {
    return price * (1 + taxRate);
}

void main() {
    IO.println(totalWithTax(50, 0.08));
}
```

```output
54.0
```

The second version can be read, tested, and moved to another program on its own. The first cannot.

One kind of field is safe to share: a value that never changes. Write `final` in front of it, and javac refuses any line that tries to change it. A `final` field is called a **constant**, and its name is written in capitals, with underscores between the words, so every reader can see that it is fixed; it is the one exception to Chapter 2's rule that a name starts with a lowercase letter. Here is the minutes-and-seconds program again, with its 60 given a name:

```java
final int SECONDS_PER_MINUTE = 60;

int minutesIn(int totalSeconds) {
    return totalSeconds / SECONDS_PER_MINUTE;
}

int secondsLeft(int totalSeconds) {
    return totalSeconds % SECONDS_PER_MINUTE;
}

void main() {
    int total = 500;
    IO.println(minutesIn(total) + " minutes and " + secondsLeft(total) + " seconds");
}
```

```output
8 minutes and 20 seconds
```

The output is the same, but the program says more: `SECONDS_PER_MINUTE` explains what 60 means wherever it appears, and a constant that ever needs a new value gets it in one place.

## Documentation comments

A comment that starts with three slashes, `///`, written just above a method, is a **documentation comment**, and it is the standard way to say what a method does:

```java
/// Converts a Celsius temperature to Fahrenheit.
double celsiusToFahrenheit(double celsius) {
    return celsius * 9 / 5 + 32;
}

void main() {
    IO.println(celsiusToFahrenheit(100));
}
```

```output
212.0
```

Java ignores it when the program runs, as it ignores any comment, but the tools that build a reference to a program's methods read it. It can run over several lines, each starting with `///`. Write documentation comments for anything non-obvious; a one-line description of what goes in and what comes out is usually enough.

## Decomposition

The real reason methods matter is not that they save typing. It is that they let you **name a piece of a problem**, and once a piece has a name you can think about it without thinking about its insides. Breaking a problem into small methods, each with one job and a name, is called **decomposition**.

Here is Chapter 4's ticket kiosk, rewritten:

```java
/// Returns the ticket price in dollars for a customer of the given age.
int basePrice(int age) {
    if (age < 5) {
        return 0;
    } else if (age <= 12) {
        return 8;
    } else if (age <= 64) {
        return 14;
    } else {
        return 10;
    }
}

/// Returns the price after any day-of-week discount.
int applyDiscount(int price, String day) {
    if (day.equals("tuesday") && price > 0) {
        return price - 3;
    }
    return price;
}

/// Returns the final ticket price for an age and day.
int ticketPrice(int age, String day) {
    return applyDiscount(basePrice(age), day);
}

void main() {
    IO.println(ticketPrice(70, "tuesday"));
    IO.println(ticketPrice(3, "tuesday"));
    IO.println(ticketPrice(30, "friday"));
}
```

```output
7
0
14
```

The deep nesting from Chapter 4 is gone. Each method does one thing, and the name says what. `ticketPrice` reads almost as English: take the base price for this age, then apply the day's discount. `basePrice`'s chain ends in an `else`, so every way through it reaches a `return`, which is what javac checks for a method that promises a value.

Better still, each piece can be tested on its own. Those three `IO.println` calls in `main` check that an infant on Tuesday stays free and that a senior gets the discount—the exact edge cases that are easy to get wrong. Checking pieces separately is the difference between a program you hope works and one you know works.

## Common mistakes

| Mistake | What happens |
| --- | --- |
| Declaring a method but never calling it | Nothing happens; no error |
| `greet;` instead of `greet();` | `not a statement`—without its parentheses, nothing is called |
| `greet(String name) {` with no return type | `invalid method declaration; return type required`—a method that gives nothing back is `void` |
| Using `IO.println` where `return` was needed | The method is `void`, so storing its result is `incompatible types: void cannot be converted to int` |
| A way through a method that promises a value but reaches no `return` | `missing return statement` |
| Calling with the wrong number of arguments | `cannot be applied to given types`, then what it needs (`required:`) and what it got (`found:`) |
| Expecting a method to change a variable passed to it | It cannot: it changes its own copy, so return the new value and store it |
| Assigning to a `final` field | `cannot assign a value to final variable` |

## Try It

Each exercise names its method exactly: its return type, its name and its parameters. Its box starts with that method returning a stand-in value, and a `main` that calls it, so Run works at once. Check calls your method itself, not `main`, with each case the box lists under "What it should do," and compares what it returns; keep the name and the parameters as written, and everything inside is up to you.

**1.** Write `boolean isEven(int n)`, returning `true` when `n` is even and `false` when it is not, then use it in a loop in `main` to print the even numbers from 1 to 20.

```java
// Prints the even numbers from 1 to 20, asking isEven about each.

boolean isEven(int n) {
    return n % 2 == 0;
}

void main() {
    for (int i = 1; i <= 20; i++) {
        if (isEven(i)) {
            IO.println(i);
        }
    }
}
```

**2.** Write `double bmi(double weightKg, double heightM)`, returning the body mass index—the weight divided by the square of the height—rounded to one decimal place.

```java
/// Returns the body mass index, rounded to one decimal place.
double bmi(double weightKg, double heightM) {
    return Math.round(weightKg / (heightM * heightM) * 10) / 10.0;
}

void main() {
    IO.println(bmi(70, 1.75));
}
```

**3.** Write `int largestOfThree(int a, int b, int c)`, returning the largest of the three, without `Math.max` (Java's ready-made method for the larger of two numbers): `if` and `else` are all it takes.

```java
int largestOfThree(int a, int b, int c) {
    if (a >= b && a >= c) {
        return a;
    } else if (b >= c) {
        return b;
    } else {
        return c;
    }
}

void main() {
    IO.println(largestOfThree(3, 9, 5));
}
```

**4.** Write `int countVowels(String word)`, returning how many vowels (a, e, i, o and u) the word contains. Capital letters count too.

```java
int countVowels(String word) {
    String lower = word.toLowerCase();
    int vowels = 0;
    for (int i = 0; i < lower.length(); i++) {
        char letter = lower.charAt(i);
        if (letter == 'a' || letter == 'e' || letter == 'i'
                || letter == 'o' || letter == 'u') {
            vowels++;
        }
    }
    return vowels;
}

void main() {
    IO.println(countVowels("banana"));
}
```

**5.** Write `boolean isPrime(int n)`, returning whether `n` is prime (a whole number greater than 1 that no number divides evenly except 1 and itself), then use it in `main` to print every prime under 50.

```java
// Prints every prime under 50, asking isPrime about each number.

boolean isPrime(int n) {
    if (n < 2) {
        return false;
    }
    for (int divisor = 2; divisor < n; divisor++) {
        if (n % divisor == 0) {
            return false;
        }
    }
    return true;
}

void main() {
    for (int n = 1; n < 50; n++) {
        if (isPrime(n)) {
            IO.println(n);
        }
    }
}
```

**6.** What does this print, and why? Write what it prints under the code, then press Check to compare your answer with the real output.

```java
void addTen(int n) {
    n = n + 10;
}

void main() {
    int x = 5;
    addTen(x);
    IO.println(x);
}
```

```output
5
```

## Chapter project: a grade calculator

Build a program made entirely of small methods that computes a student's average and letter grade. Here is one, with a sample run under it:

```java
// Computes a student's average and letter grade from scores entered one at a time.

/// Asks until the user enters a whole number from 0 to 100, and returns it.
/// Returns -1 if input ends first.
int getScore(String prompt) {
    while (true) {
        String answer = IO.readln(prompt);
        if (answer == null) {
            break;
        }

        try {
            int score = Integer.parseInt(answer.strip());
            if (score >= 0 && score <= 100) {
                return score;
            }
        } catch (NumberFormatException e) {
            // Not a whole number: the message below says so.
        }
        IO.println("Please enter a whole number from 0 to 100.");
    }
    return -1;
}

/// Returns the letter grade for a numeric average.
String letterGrade(double average) {
    if (average >= 90) {
        return "A";
    } else if (average >= 80) {
        return "B";
    } else if (average >= 70) {
        return "C";
    } else if (average >= 60) {
        return "D";
    } else {
        return "F";
    }
}

/// Displays a formatted grade report.
void printReport(String name, double average, String grade) {
    IO.println();
    IO.println("=".repeat(32));
    IO.println("Student: " + name);
    IO.println("Average: " + String.format("%.1f", average));
    IO.println("Grade:   " + grade);
    IO.println("=".repeat(32));
}

/// Runs the grade calculator.
void main() {
    String name = IO.readln("Student name: ");

    int total = 0;
    int count = 4;
    for (int i = 0; i < count; i++) {
        int score = getScore("Score " + (i + 1) + " of " + count + ": ");
        if (score == -1) {
            return;
        }
        total += score;
    }

    double average = (double) total / count;
    printReport(name, average, letterGrade(average));
}
```

```output
Student name: Ada
Score 1 of 4: 88
Score 2 of 4: 105
Please enter a whole number from 0 to 100.
Score 2 of 4: 92
Score 3 of 4: 79
Score 4 of 4: 95

================================
Student: Ada
Average: 88.5
Grade:   B
================================
```

Notice the shape. Each method has one job, stated in its documentation comment, and `main` does nothing but call the others in order. In Java, `main` is more than a convention: it is the method Java calls to start the program, so nothing in the file calls it, and anyone reading the file can start at `main` to see the shape of the whole thing.

Notice also that `getScore` combines the validation loop from Chapter 5 with the early-`return` idea from this chapter, and the whole messy business of retrying takes up one line at the call site. A score comes back only from inside the `try`, once `Integer.parseInt` has read it and the range test has passed; anything else—text that is not a whole number, which sends Java to the `catch`, or a number outside 0 to 100, negative ones included—reaches the message after the `try` and goes around again. The `catch` has nothing to do but let the loop reach that message, so it holds only a comment saying so. When input ends, `getScore` has no score to give back, so it returns -1, which no score can be, and `main` stops when it sees one: `return;` ends a `void` method early.

That is what decomposition buys you: complexity does not disappear, but it gets boxed up behind a name and stops crowding everything else.
