<!-- part: Part I: Foundations -->
# Chapter 1: Your First Programs

A program is a list of instructions written in an order a computer can follow. That is the whole idea. The computer is fast and literal: it will do exactly what you wrote, at enormous speed, including the parts you did not mean.

Java runs your instructions one at a time, top to bottom. Understanding that single fact explains most of what beginners find confusing.

## Output with `IO.println`

The `IO.println` method displays something on the screen and then ends the line (`IO` is short for input and output, and `println` for "print line"). It is the first tool you get and the one you will use most, because it is how a program tells you what it is doing.

Here it is in a whole program, displaying the text between the quotation marks. Java starts running a program at `void main()` and runs the instructions between the curly braces, `{` and `}`, that follow it; Chapter 6 explains what `void` and the empty parentheses mean, and until then every program in this course has this shape. Each instruction ends with a semicolon, `;`, the way a sentence ends with a period.

```java
void main() {
    IO.println("Hello, world!");
}
```

```output
Hello, world!
```

The quotation marks matter. Text inside quotes is called a **string**, and it means *these exact characters*. Java does not try to understand a string; it just carries it around. In Java a string always goes in double quotes (single quotes mean something else, which Chapter 5 explains), and an apostrophe inside one is just another character:

```java
void main() {
    IO.println("Double quotes go around the text.");
    IO.println("An apostrophe inside is fine: it's just a character.");
}
```

## One line at a time

Each `IO.println` puts its text on its own line, and Java runs them in the order written:

```java
void main() {
    IO.println("First line");
    IO.println("Second line");
    IO.println("Third line");
}
```

```output
First line
Second line
Third line
```

Swap the order of those three lines and the output order changes to match. Nothing in Java looks ahead or reorders your work.

You can print more than one thing on a line by joining the pieces with `+`. Java puts nothing at all between them, so a space has to be part of a string, like any other character:

```java
void main() {
    IO.println("Hydrogen" + "Helium" + "Lithium");
    IO.println("Hydrogen" + " " + "Helium" + " " + "Lithium");
}
```

```output
HydrogenHeliumLithium
Hydrogen Helium Lithium
```

An empty `IO.println()` prints a blank line, which is a cheap and useful way to space out your output:

```java
void main() {
    IO.println("Section 1");
    IO.println();
    IO.println("Section 2");
}
```

## Printing numbers

Numbers do not need quotes, and Java will do arithmetic on them (`*` is its sign for multiplying, and as in algebra it is worked out before `+`):

```java
void main() {
    IO.println(7);
    IO.println(3 + 4);
    IO.println("3 + 4");
}
```

```output
7
7
3 + 4
```

Look at the last two lines carefully. `3 + 4` without quotes is a calculation, so Java works it out and prints `7`. With quotes it is a string, so Java prints the characters exactly. This distinction between *a value* and *text describing a value* runs through the whole language, and Chapter 2 makes it precise.

Text and numbers can share a line, joined with `+`, and then `+` has two jobs. Between two numbers it adds; when either side is a string, it joins, writing the number out as text. Java works along a row of `+` signs from left to right, so a sum that shares a line with text needs parentheses around it. The second line below leaves them out, and it is a trap worth seeing once:

```java
void main() {
    IO.println("Total: " + (3.50 + 2.25));
    IO.println("Total: " + 3.50 + 2.25);
}
```

```output
Total: 5.75
Total: 3.52.25
```

In the first line, the parentheses make Java add `3.50 + 2.25` before anything else, then join the answer onto the text. In the second, the first `+` has a string on its left, so it joins, making `"Total: 3.5"` (Java writes the number `3.50` as `3.5`, which the chapter project comes back to). The next `+` has a string on its left too, so `2.25` is joined on the end. Whenever arithmetic shares a line with text, put the arithmetic in parentheses.

## Comments

Everything from `//` to the end of a line is a **comment**. Java ignores it completely. Comments are notes to human readers, including you in three weeks when you have forgotten why you wrote something.

```java
void main() {
    // Convert a distance from miles to kilometers
    IO.println(26.2 * 1.609);   // a marathon, in km
}
```

```output
42.1558
```

Comments can sit on their own line or at the end of a line of code. Good comments explain *why*, not *what*: `// add 1 to count` is noise, because the code already says that. `// count starts at 0 because the first lap does not score` is worth writing.

## When things go wrong

Java will refuse to run code it cannot understand, and it tells you where it gave up. This is a feature, not a scolding.

Before Java runs a program, a tool called the **compiler** reads all of it and translates it into instructions the computer can carry out. This is called **compiling** the program, and Java's compiler is named `javac`. A mistake javac finds is a **compile error**, and a program with one does not run at all, not even the lines before the mistake. This program is missing a closing quote:

```java
void main() {
    IO.println("Missing a quote);
}
```

Press Run, and the box shows javac's message:

```text
Main.java:2: error: unclosed string literal
    IO.println("Missing a quote);
               ^
1 error
```

Read javac's message from the top. Its first line names the file (a box's program is always `Main.java`), the number of the line where javac noticed the problem, and the problem itself: an unclosed string literal, which is javac's name for a string whose closing quote never comes.

Under it is a copy of that line, with a caret, `^`, pointing at the spot javac noticed: here, the opening quote of the string it could not close. The mistake is usually at or just before that spot. The last line counts the errors; when there are several, fix the first one and run again, because one mistake can confuse javac into reporting others. Appendix A collects the messages you will meet most often.

## Common mistakes

| Mistake | What you see |
| --- | --- |
| `IO.Println("hi");` | `cannot find symbol`—Java is case-sensitive; it must be `IO.println`, with `println` in lowercase |
| `IO.println("hi";` | `')' or ',' expected`—the closing parenthesis is missing |
| `IO.println("hi")` | `';' expected`—every instruction ends with a semicolon |
| `IO.println(Hello);` | `cannot find symbol`—without quotes, Java looks for a variable named `Hello` |
| `IO.println('hi');` | `unclosed character literal`—a string goes in double quotes |
| Using smart quotes from a word processor | `illegal character: '\u201c'`—type quotes in the editor, not in Google Docs |

## Try It

**1.** Write a program that prints your name, your school, and your favorite subject, each on its own line.

```java
void main() {
    // Your name, your school and your favorite subject, one on each line.
}
```

**2.** Make Java calculate and print the number of minutes in a week. Use a calculation, not the answer.

```java
void main() {
    IO.println(7 * 24 * 60);
}
```

**3.** Write a program that prints a small shape out of asterisks, like a triangle four rows tall.

```java
void main() {
    // A small shape made of asterisks, one row on each line.
}
```

**4.** Predict what the program below prints *before* you see it: write your prediction under the code, then press Check to compare it with the real output.

```java
void main() {
    IO.println("A");
    IO.println("B" + "C");
    IO.println();
    IO.println(2 * 3);
    IO.println("2 * 3");
}
```

```output
A
BC

6
2 * 3
```

## Chapter project: a receipt

Write a program that prints a tidy receipt for a purchase of three items. Use `IO.println` for the layout, a comment at the top explaining what the program does, and a calculation (not a typed-in answer) for the total.

A solution looks like this:

```java
// Prints a receipt for three items and calculates the total.

void main() {
    IO.println("===== CORNER STORE =====");
    IO.println();
    IO.println("Notebook           3.50");
    IO.println("Pens (pack of 4)   2.25");
    IO.println("Stickers           1.75");
    IO.println("------------------------");
    IO.println("Total              " + (3.50 + 2.25 + 1.75));
    IO.println("========================");
}
```

```output
===== CORNER STORE =====

Notebook           3.50
Pens (pack of 4)   2.25
Stickers           1.75
------------------------
Total              7.5
========================
```

Notice the total prints as `7.5`, not `7.50`. Java does not know these are dollars, and it has no reason to keep a trailing zero. Chapter 3 shows how to control the way numbers are displayed. The parentheses around the sum matter too: they make it a sum, where without them the three prices would be joined into one long run of digits.

The program also has a real weakness: the prices appear twice, once in the text and once in the calculation. Change a price in one place and forget the other, and the receipt lies. Chapter 2 fixes this.
