<!-- part: Part I: Foundations -->
# Chapter 2: Variables and Types

A **variable** is a name that holds a value. You create one by writing its type (the kind of value it will hold), a name, an equals sign, and the value you want it to hold. Here `int` is the type for a whole number and `String` the type for text (more on types shortly):

```java
void main() {
    int score = 42;
    String player = "Ada";
    IO.println(player + " scored " + score);
}
```

```output
Ada scored 42
```

The `=` sign here does not mean *equals* in the algebra sense. It is an instruction: **work out the value on the right, then store it in the variable on the left**. Read `score = 42` as "let score be 42," not as a statement of fact. This matters because a line that would be nonsense in algebra is perfectly ordinary in Java:

```java
void main() {
    int count = 5;
    count = count + 1;
    IO.println(count);
}
```

```output
6
```

Java works out the right side first (`5 + 1`, which is `6`), then stores the new value in `count`. The old value is simply forgotten. Only the first line says `int`: that line creates the variable, and the second changes it. This pattern—a variable updating itself—is the engine of nearly every loop you will write in Chapter 5.

## Swapping two values

Because a variable forgets its old value the moment it is given a new one, swapping the values of two variables takes three lines and a third variable, which holds one value while the other moves:

```java
void main() {
    int first = 3;
    int second = 8;

    int temp = first;   // keep the 3 before first changes
    first = second;
    second = temp;

    IO.println(first + " " + second);
}
```

```output
8 3
```

Try it without `temp`: `first = second;` and then `second = first;` leave both at 8, because the first of those lines forgot the 3 before anything saved it.

## The four basic types

Every value in Java has a **type**, which determines what you can do with it. Four types cover almost everything in this course.

| Type | Name | Examples | Holds |
| --- | --- | --- | --- |
| `int` | integer | `7`, `0`, `-250` | Whole numbers, no decimal point |
| `double` | floating point | `3.14`, `-0.5`, `98.6` | Numbers with a decimal point |
| `String` | string | `"hello"`, `"A"`, `"42"` | Text, always in double quotes |
| `boolean` | boolean | `true`, `false` | One of exactly two values |

`String` is written with a capital S and the other three are all lowercase. Java is case-sensitive, so `string` with a small s is an error.

In Java you never have to ask what type a variable holds: you wrote it yourself, when you created the variable. This is called **declaring** the variable, and here is one of each type:

```java
void main() {
    int count = 7;
    double weight = 7.0;
    String label = "7";
    boolean ready = true;

    IO.println(count);
    IO.println(weight);
    IO.println(label);
    IO.println(ready);
}
```

```output
7
7.0
7
true
```

Note that `7`, `7.0`, and `"7"` are three different values of three different types. They look similar on screen and behave completely differently:

```java
void main() {
    IO.println(7 + 7);
    IO.println("7" + "7");
}
```

```output
14
77
```

Adding integers adds. Adding strings glues them end to end, which is called **concatenation** (Chapter 1 called it joining). Neither is wrong; they are different operations that happen to share a symbol.

`true` and `false` are written in lowercase and are not strings—no quotes. They come up constantly from Chapter 4 onward, because every decision a program makes comes down to a boolean.

A variable holds values of its declared type and no other, and javac checks every assignment before the program runs. Here is the first type error, made on purpose:

```java
void main() {
    int count = "three";
    IO.println(count);
}
```

Press Run, and javac refuses:

```text
Main.java:2: error: incompatible types: String cannot be converted to int
    int count = "three";
                ^
1 error
```

The message says exactly what happened: the value on the right is a `String`, `count` was declared to hold an `int`, and Java does not turn one into the other on its own. The caret points at the value that does not fit. With a number instead, `int count = 3;` is fine.

## Naming variables

Java enforces a few rules, and programmers follow a few more conventions.

**Rules (javac will reject violations):**

- Names contain letters, digits, and underscores (Java also allows `$`, which is meant for code that programs write, not people)
- Names cannot start with a digit
- Names cannot be one of Java's reserved words (`int`, `if`, `class`, `true`, and about fifty others)

**Conventions (Java allows violations; readers will not):**

- Use **camelCase**: the first word in lowercase and every later word starting with a capital letter, as in `finalScore` or `daysRemaining`
- Say what the thing is. `x` is fine for a coordinate and terrible for a student's grade
- Start a variable's name with a lowercase letter. Names that start with a capital, like `String` and `IO`, belong to types, and a reader who sees one expects a type

```java
void main() {
    // Clear
    int daysUntilExam = 14;
    double averageRainfallMm = 82.4;

    // Legal, but you will regret it
    int d = 14;
    double x1 = 82.4;
}
```

Code is read far more often than it is written, usually by someone who has forgotten the context. Naming is not decoration.

## Getting input

The `IO.readln` method pauses the program, waits for the user to type a line and press Enter, and gives back what they typed (`readln` is short for "read line"). In the sample run under this program, the user typed `Ada`:

```java
void main() {
    String name = IO.readln("What is your name? ");
    IO.println("Nice to meet you, " + name);
}
```

```output
What is your name? Ada
Nice to meet you, Ada
```

The text inside the parentheses of `IO.readln` is the **prompt**. Ending it with a space keeps the user's typing from running into your question.

Here is the single most important fact about `IO.readln`: **it always gives back a `String`.** Always, even when the user types a number. This trips up everyone exactly once:

```java
void main() {
    String age = IO.readln("How old are you? ");
    IO.println(age + 1);
}
```

```output
How old are you? 14
141
```

The user typed `14`, and the program said `141`. Java is being literal. `age` holds the string `"14"`, and `+` with a string on either side joins (Chapter 1), so the `1` is written on the end as text: `"14" + 1` is `"141"`, just as `"5" + 1` is `"51"`. Nothing crashed and nothing warned you, which is what makes this mistake dangerous: the answer is simply wrong.

Declaring `age` as an `int` does not help on its own. `int age = IO.readln("How old are you? ");` is the type error from earlier in this chapter, `incompatible types: String cannot be converted to int`. The text has to be converted.

## Converting between types

Three methods convert values from one type to another:

| Example | Result |
| --- | --- |
| `Integer.parseInt("14")` | `14`, an `int` |
| `Double.parseDouble("3.5")` | `3.5`, a `double` |
| `String.valueOf(14)` | `"14"`, a `String` |

The fix for the program above is to convert the input before doing arithmetic. `Integer.parseInt` is strict about what it accepts: a space before or after the digits, which is easy to type by accident, makes it fail. So the text is first tidied with `strip()`, which gives back the same text with any spaces at either end removed. It is written after the text, joined to it by a dot, so `" 14 ".strip()` is `"14"`:

```java
void main() {
    int age = Integer.parseInt(IO.readln("How old are you? ").strip());
    IO.println("Next year you will be " + (age + 1));
}
```

```output
How old are you? 14
Next year you will be 15
```

Read the right side of the first line from the inside out: `IO.readln` runs first and produces a string, `strip()` trims its ends, and then `Integer.parseInt` converts what is left to an `int`. This nesting is a standard idiom and worth recognizing on sight. The parentheses around `age + 1` are Chapter 1's habit: arithmetic that shares a line with text goes in parentheses.

Conversion can fail. `Integer.parseInt("hello")` stops the program with a `NumberFormatException`, because there is no integer that text describes. `Integer.parseInt("3.7")` fails too, because `"3.7"` is not the way an integer is written—you need `Double.parseDouble("3.7")`.

Changing one kind of number into another needs no text at all. Java will not put a `double` into an `int` variable on its own: `int pages = 3.9;` is a compile error (`possible lossy conversion from double to int`), because the `.9` would be lost (the other way, an `int` into a `double`, is safe, so Java does it on its own: `double price = 3;` holds `3.0`). You say that you mean it with a **cast**, the type you want in parentheses in front of the value. A cast to `int` truncates toward zero rather than rounding, so `(int) 3.9` gives `3`; a cast to `double` gives the same number with a decimal point:

```java
void main() {
    IO.println((int) 3.9);
    IO.println((double) 5);
}
```

```output
3
5.0
```

## Worked example: unit conversion

This program uses two arithmetic signs Chapter 1 did not: `-` subtracts and `/` divides. Chapter 3 covers them properly, along with a surprise `/` keeps for whole numbers; here `fahrenheit` is a `double`, so the division keeps its decimals. The program also reads its answer in two steps, keeping the text in a variable of its own before converting it, which keeps each line short.

```java
// Converts a temperature from Fahrenheit to Celsius.

void main() {
    String answer = IO.readln("Temperature in degrees F: ");
    double fahrenheit = Double.parseDouble(answer.strip());
    double celsius = (fahrenheit - 32) * 5 / 9;

    IO.println(fahrenheit + " degrees F is " + celsius + " degrees C");
}
```

```output
Temperature in degrees F: 100
100.0 degrees F is 37.77777777777778 degrees C
```

The answer is right and the display is unhelpful—nobody wants fourteen decimal places on a weather report. Chapter 3 shows how to round a number for display, and also why decimal arithmetic sometimes arrives with a tiny error attached.

Note the use of `Double.parseDouble` rather than `Integer.parseInt`. Temperatures come with decimal points, and `Integer.parseInt` would have rejected `98.6`. Choosing the right conversion is part of choosing the right type.

## Common mistakes

| Mistake | What you see |
| --- | --- |
| `42 = score;` | `unexpected type`—the variable goes on the left, always |
| Printing `name` before `String name = ...;` | `cannot find symbol`—you cannot use a variable before creating it |
| `int age = IO.readln("Age: ");` | `incompatible types: String cannot be converted to int`—convert the text with `Integer.parseInt` |
| The user types `fourteen` when asked for a number | `NumberFormatException`—Chapter 4 shows how to handle this |
| `Score` where you declared `score` | `cannot find symbol`—Java is case-sensitive, so these are two different names |
| `total = total + 1;` with no earlier `int total = 0;` | `cannot find symbol`—a counter must be created and started before it can grow |
| `int count = 6;` when `count` already exists | `variable count is already defined in method main()`—write the type only when you create a variable; to change it, write `count = 6;` |

## Try It

**1.** Create variables for a book's title, author, and page count, then print a sentence using all three.

```java
void main() {
    // A book's title, author and page count, then one sentence.
}
```

**2.** Ask the user for two numbers and print their sum, difference, and product.

```java
void main() {
    int first = Integer.parseInt(IO.readln("First number: ").strip());
    int second = Integer.parseInt(IO.readln("Second number: ").strip());

    IO.println("Sum: " + (first + second));
    IO.println("Difference: " + (first - second));
    IO.println("Product: " + (first * second));
}
```

**3.** Ask for a number of seconds and print it as minutes and seconds. (Chapter 3 introduces the operators that make this clean; try it with division first, and a cast to `int` to drop the part of a minute.)

```java
void main() {
    int seconds = Integer.parseInt(IO.readln("Seconds: ").strip());
    int minutes = seconds / 60;
    int remainingSeconds = seconds - minutes * 60;
    IO.println(minutes + " minutes and " + remainingSeconds + " seconds");
}
```

**4.** What does this print, and why? Write your prediction under the code, then press Check to compare it with the real output.

```java
void main() {
    int a = 10;
    int b = a;
    a = 99;
    IO.println(a + " " + b);
}
```

```output
99 10
```

**5.** Fix this broken program, which holds a height as text, the way `IO.readln` gives one back. Press Run first and read javac's message.

```java
void main() {
    String height = "72";
    IO.println("That is " + (height / 12) + " feet");
}
```

## Chapter project: the receipt, improved

Rewrite Chapter 1's receipt so every price appears exactly once, stored in a well-named variable, and the customer's name is asked for at the start.

A solution:

```java
// Prints a personalized receipt. Each price is stored once, in a variable.

void main() {
    String customer = IO.readln("Customer name: ");

    double notebookPrice = 3.50;
    double pensPrice = 2.25;
    double stickersPrice = 1.75;

    double total = notebookPrice + pensPrice + stickersPrice;

    IO.println();
    IO.println("===== CORNER STORE =====");
    IO.println("Customer: " + customer);
    IO.println();
    IO.println("Notebook           " + notebookPrice);
    IO.println("Pens (pack of 4)   " + pensPrice);
    IO.println("Stickers           " + stickersPrice);
    IO.println("------------------------");
    IO.println("Total              " + total);
}
```

```output
Customer name: Ada

===== CORNER STORE =====
Customer: Ada

Notebook           3.5
Pens (pack of 4)   2.25
Stickers           1.75
------------------------
Total              7.5
```

This version cannot lie about its own total: change `notebookPrice` and both the line item and the total move together, because both read the same variable. That property—one fact stored in one place—is worth more than it looks, and every later chapter leans on it.
