<!-- part: Part I: Foundations -->
# Chapter 4: Making Decisions

Every program so far has run straight through, doing the same thing every time. Real programs choose. The `if` statement is how they do it.

```java
void main() {
    int temperature = 95;

    if (temperature > 90) {
        IO.println("It is hot out.");
        IO.println("Bring water.");
    }

    IO.println("Have a good day.");
}
```

```output
It is hot out.
Bring water.
Have a good day.
```

Change `temperature` to `70` and the first two lines vanish, while the last one still prints. That difference is the whole point.

## Anatomy of an `if`

The structure has three parts, and Java is strict about all of them:

1. The keyword `if`
2. A **condition** in parentheses—any expression that produces `true` or `false`
3. A **block**: the statements between a `{` and its `}`, which run only when the condition is true

Java calls each instruction a **statement**, and a whole `if`, blocks and all, counts as one statement too. The braces are what group the statements. Java ignores indentation completely: you could write the whole block on one line and it would run the same. Indentation is a courtesy to whoever reads the program, but an important one, because it lets the shape on the page show which statements belong to the `if`.

```java
void main() {
    int score = 45;

    if (score >= 60) {
        IO.println("You passed.");
        IO.println("Congratulations.");
    }
}
```

Nothing prints, because both lines are inside the braces, so both belong to the `if`. Now leave the braces out:

```java
void main() {
    int score = 45;

    if (score >= 60)
        IO.println("You passed.");
        IO.println("Congratulations.");
}
```

```output
Congratulations.
```

Without braces, an `if` controls exactly one statement: the one right after it. The second `IO.println` is not inside the `if`, whatever its indentation suggests, so it always runs—and now congratulates a student who failed. Java did exactly what the braces, or their absence, said. The indentation lied, and nothing warned you. **Always write the braces**, even around a single statement.

Indent the inside of every block by four spaces, as every box in this course does, and the indentation will tell the truth.

## `else`

An `else` block runs when the condition is false. Exactly one of the two blocks runs, always.

```java
void main() {
    int age = Integer.parseInt(IO.readln("Your age: ").strip());

    if (age >= 18) {
        IO.println("You are eligible to vote.");
    } else {
        IO.println("You can vote in " + (18 - age) + " years.");
    }
}
```

```output
Your age: 15
You can vote in 3 years.
```

`else` takes no condition of its own—it means "in every other case"—so nothing in parentheses follows it, only its block. Java programmers write it on the same line as the closing brace before it, `} else {`, which keeps the two blocks visibly together.

## `else if`

When there are more than two possibilities, `else if` chains conditions together.

This program works out a grade in the chain and prints it afterward. A variable created inside a block exists only inside that block, so `grade` is created before the chain, outside all its braces. There is no grade to give it until the chain decides, so `String grade;` creates the variable with no value yet, and Java checks that every way through the chain gives it one before the last line uses it.

```java
void main() {
    int score = Integer.parseInt(IO.readln("Test score: ").strip());
    String grade;

    if (score >= 90) {
        grade = "A";
    } else if (score >= 80) {
        grade = "B";
    } else if (score >= 70) {
        grade = "C";
    } else if (score >= 60) {
        grade = "D";
    } else {
        grade = "F";
    }

    IO.println("Score " + score + " earns a " + grade + ".");
}
```

```output
Test score: 85
Score 85 earns a B.
```

Java checks the conditions **in order and stops at the first true one**. That is what makes this work with such simple tests. A score of 85 fails `>= 90`, passes `>= 80`, and Java never looks at the rest—so `else if (score >= 70)` does not need to also check that the score is below 80.

This also means **order matters enormously**. Reverse the chain and everything breaks:

```java
void main() {
    // BROKEN—do not copy this
    int score = 95;
    String grade;

    if (score >= 60) {
        grade = "D";
    } else if (score >= 70) {
        grade = "C";
    } else if (score >= 90) {
        grade = "A";
    } else {
        grade = "F";
    }

    IO.println(grade);
}
```

```output
D
```

A score of 95 satisfies `>= 60`, so Java stores `"D"` and stops. When you chain conditions that overlap, put the most specific or most extreme case first.

## Nesting

An `if` can contain another `if`. Each level sits inside the braces of the one around it and indents four more spaces.

```java
void main() {
    boolean hasTicket = true;
    int age = 15;

    if (hasTicket) {
        if (age >= 13) {
            IO.println("Enjoy the show.");
        } else {
            IO.println("You need an adult with you.");
        }
    } else {
        IO.println("Please buy a ticket first.");
    }
}
```

```output
Enjoy the show.
```

Nesting is sometimes the clearest way to express a decision, but it gets hard to read quickly. Past two levels, consider whether `&&` would say the same thing more plainly:

```java
void main() {
    boolean hasTicket = true;
    int age = 15;

    if (hasTicket && age >= 13) {
        IO.println("Enjoy the show.");
    }
}
```

```output
Enjoy the show.
```

That version is shorter but loses the distinction between the two failure messages. Neither is automatically better; choose the one that matches what you actually need to say.

## A condition is true or false

A condition must produce a `boolean`: `true` or `false`. A comparison such as `score >= 60` produces one, and so does a `boolean` variable, which is why `if (hasTicket)` works. Nothing else will do—not a number, and not a piece of text. Here is a program that tries to use what the user typed as a condition, meaning "if a name was given":

```java
void main() {
    String name = IO.readln("Your name (or press Enter to skip): ").strip();

    if (name) {
        IO.println("Hello, " + name + ".");
    } else {
        IO.println("Hello, stranger.");
    }
}
```

Press Run, and javac refuses:

```text
Main.java:4: error: incompatible types: String cannot be converted to boolean
    if (name) {
        ^
1 error
```

The message says exactly what is wrong: `name` is a `String`, and a condition needs a `boolean`. To ask whether any text was typed, ask the string itself. `isEmpty()` is written after the text, joined to it by a dot like `strip()`, and gives back `true` when the text has no characters in it at all (`""`, which is what pressing Enter alone gives) and `false` otherwise. In the sample run under this program, the user typed `Ada`:

```java
void main() {
    String name = IO.readln("Your name (or press Enter to skip): ").strip();

    if (!name.isEmpty()) {
        IO.println("Hello, " + name + ".");
    } else {
        IO.println("Hello, stranger.");
    }
}
```

```output
Your name (or press Enter to skip): Ada
Hello, Ada.
```

`!name.isEmpty()` reads as "if the name is not empty"—if a name was given—which is exactly what it means. Run it and press Enter without typing anything to meet the stranger.

The `strip()` matters here. `isEmpty()` is `true` only for text with nothing in it at all, so without `strip()`, a single space typed before Enter would count as a name. Stripped, the space is gone, and whoever typed it is a stranger too.

The rule also means text never passes for something else. The text `"false"` is not the boolean `false`, and the text `"0"` is not the number `0`: javac refuses either one as a condition. Convert input to the type you actually want before testing it.

## Validating input

Until now, a user typing `banana` at a number prompt has stopped the program with a `NumberFormatException` (Chapter 2). One tool handles that.

When `Integer.parseInt` is given text it cannot read as a whole number, it **throws** an **exception**: Java's way of saying that something went wrong, which stops the program unless something catches it. A `try` block lets the risky line run, and the `catch` block after it says what to do if that exception is thrown:

```java
void main() {
    String answer = IO.readln("How many tickets? ");

    try {
        int tickets = Integer.parseInt(answer.strip());
        IO.println("That will be $" + (tickets * 12) + ".");
    } catch (NumberFormatException e) {
        IO.println("Please enter a whole number.");
    }
}
```

```output
How many tickets? three
Please enter a whole number.
```

Java runs the `try` block a line at a time. If `Integer.parseInt` reads the text, the rest of the block runs and the `catch` block is skipped. If it throws, Java leaves the `try` block at once—the line after it never runs—and runs the `catch` block instead. `catch (NumberFormatException e)` says which exception this block handles, and gives the caught exception a name, `e`; this chapter's programs do not use `e`, but Java requires the name.

Note what is inside the `try`: the conversion, and the line that uses its answer. `tickets` is created inside the `try` block, so, like any variable created inside a block, it exists only there. Everything that needs `tickets` goes inside too.

The same shape works for decimals, with `Double.parseDouble`:

```java
void main() {
    String answer = IO.readln("Enter a price: ");

    try {
        double price = Double.parseDouble(answer.strip());
        IO.println("With tax: $" + String.format("%.2f", price * 1.08));
    } catch (NumberFormatException e) {
        IO.println("That is not a number.");
    }
}
```

```output
Enter a price: 12.50
With tax: $13.50
```

The `catch` runs only when the conversion fails, and `Integer.parseInt` reads a minus sign, so `-2` tickets gets through and costs `$-24`. Whether a number that was read makes sense is a question for an `if`, as this chapter's project shows.

## Common mistakes

| Mistake | What you see |
| --- | --- |
| `if (score = 90)` | `incompatible types: int cannot be converted to boolean`—use `==` |
| `if score >= 60 {` | `'(' expected`—the condition goes in parentheses |
| Braces left out around two lines | No error: the second line always runs, whatever its indentation says |
| `if (score >= 60);` | No error: the `;` ends the `if` there, so the block after it always runs |
| `score > 0 && score < 100` when you meant `>=` and `<=` | Off-by-one at the boundaries |
| Broad condition before narrow one in an `else if` chain | The narrow branch never runs |
| `grade.equals("a")` when the user typed `A` | `false`—`equals` is case-sensitive; compare `grade.toLowerCase()`, which the chapter project introduces |
| A variable created inside a `try` block, used after its closing brace | `cannot find symbol`—a variable exists only inside the block it was created in |
| `String grade;`, a chain with no `else`, then `IO.println(grade);` | `variable grade might not have been initialized`—add an `else`, or give `grade` a starting value |

## Try It

**1.** Ask for a number and print whether it is positive, negative, or zero.

```java
void main() {
    double number = Double.parseDouble(IO.readln("Enter a number: ").strip());

    if (number > 0) {
        IO.println("The number is positive.");
    } else if (number < 0) {
        IO.println("The number is negative.");
    } else {
        IO.println("The number is zero.");
    }
}
```

**2.** Ask for a year and print whether it is a leap year, as `2024 is a leap year.` or `2023 is not a leap year.` (A year is a leap year if divisible by 4, except years divisible by 100, unless also divisible by 400.)

```java
void main() {
    int year = Integer.parseInt(IO.readln("Enter a year: ").strip());

    if (year % 400 == 0) {
        IO.println(year + " is a leap year.");
    } else if (year % 100 == 0) {
        IO.println(year + " is not a leap year.");
    } else if (year % 4 == 0) {
        IO.println(year + " is a leap year.");
    } else {
        IO.println(year + " is not a leap year.");
    }
}
```

**3.** Ask for two numbers and print the larger. Handle the case where they are equal by printing that they are equal.

```java
void main() {
    double first = Double.parseDouble(IO.readln("First number: ").strip());
    double second = Double.parseDouble(IO.readln("Second number: ").strip());

    if (first > second) {
        IO.println(first + " is larger.");
    } else if (second > first) {
        IO.println(second + " is larger.");
    } else {
        IO.println("The numbers are equal.");
    }
}
```

**4.** Ask for a month number, 1 to 12, and print how many days it has. Assume February has 28.

```java
void main() {
    int month = Integer.parseInt(IO.readln("Month number: ").strip());

    if (month == 2) {
        IO.println("28 days");
    } else if (month == 4 || month == 6 || month == 9 || month == 11) {
        IO.println("30 days");
    } else {
        IO.println("31 days");
    }
}
```

**5.** Trace this by hand and write what it prints under the code, then press Check to compare your answer with the real output.

```java
void main() {
    int x = 12;
    if (x > 10) {
        if (x > 20) {
            IO.println("big");
        } else {
            IO.println("medium");
        }
    } else {
        IO.println("small");
    }
}
```

```output
medium
```

**6.** Rewrite the grade program so it rejects scores below 0 or above 100 before grading, printing `Score must be between 0 and 100.` instead of a grade. The box starts as the grade program from this chapter.

```java
void main() {
    int score = Integer.parseInt(IO.readln("Test score: ").strip());

    if (score < 0 || score > 100) {
        IO.println("Score must be between 0 and 100.");
    } else {
        String grade;
        if (score >= 90) {
            grade = "A";
        } else if (score >= 80) {
            grade = "B";
        } else if (score >= 70) {
            grade = "C";
        } else if (score >= 60) {
            grade = "D";
        } else {
            grade = "F";
        }

        IO.println("Score " + score + " earns a " + grade + ".");
    }
}
```

## Chapter project: a ticket pricing kiosk

Write a program that calculates a movie ticket price from the customer's age and the day of the week, validating its input along the way.

Rules: children under 5 are free; ages 5 to 12 pay $8; ages 13 to 64 pay $14; ages 65 and over pay $10. On Tuesdays every paying customer gets $3 off.

The program uses one method you have not met: `toLowerCase()`, which gives back the same text with every capital letter made small, so `"Tuesday".toLowerCase()` is `"tuesday"`. It is written after `strip()`, and works on the text `strip()` gave back.

A solution, with a sample run under it:

```java
// Calculates a movie ticket price from age and day of the week.

void main() {
    String ageText = IO.readln("Customer age: ");

    try {
        int age = Integer.parseInt(ageText.strip());

        if (age < 0 || age > 120) {
            IO.println("Please enter a realistic age.");
        } else {
            String day = IO.readln("Day of the week: ").strip().toLowerCase();

            int price;
            String category;
            if (age < 5) {
                price = 0;
                category = "Infant";
            } else if (age <= 12) {
                price = 8;
                category = "Child";
            } else if (age <= 64) {
                price = 14;
                category = "Adult";
            } else {
                price = 10;
                category = "Senior";
            }

            int discount = 0;
            if (day.equals("tuesday") && price > 0) {
                discount = 3;
                price -= discount;
            }

            IO.println();
            IO.println("Category: " + category);
            if (discount > 0) {
                IO.println("Tuesday discount: -$" + discount);
            }
            IO.println("Price: $" + price);
        }
    } catch (NumberFormatException e) {
        IO.println("Age must be a whole number.");
    }
}
```

```output
Customer age: 70
Day of the week: Tuesday

Category: Senior
Tuesday discount: -$3
Price: $7
```

Three details are worth noticing.

`strip().toLowerCase()` cleans the day input before comparing it, so `" Tuesday "` and `"TUESDAY"` both work. Cleaning user input before testing it is a habit worth forming early; Chapter 8 covers these string methods properly.

The condition `day.equals("tuesday") && price > 0` prevents the discount from making a free infant ticket cost negative three dollars. Edge cases like this one rarely announce themselves, and finding them is most of what testing is for. The age check is another: `Integer.parseInt` happily reads `-3`, so the program refuses ages below 0 as well as ages over 120.

Finally, the nesting is getting deep—three levels before any real work happens. And because everything that uses `age` has to sit inside the `try` with it, the `catch` that answers a bad age is at the very end, far from the line it guards. The program is at about the size where that starts to hurt. Chapter 6 introduces methods, which are the usual cure.
