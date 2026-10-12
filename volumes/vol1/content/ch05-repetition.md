<!-- part: Part I: Foundations -->
# Chapter 5: Repetition

Computers are useful mainly because they will do a boring thing ten million times without complaint. A **loop** repeats a block of code. Java's loops come in two main kinds, and choosing between them is easy once you know the rule:

- Use a **`for` loop** when you know how many times to repeat, or have a collection to go through
- Use a **`while` loop** when you repeat until something becomes true, and cannot say in advance how long that takes

## The `while` loop

A `while` loop repeats its block as long as its condition stays true. The condition goes in parentheses and the block in braces, as with `if`.

```java
void main() {
    int count = 1;

    while (count <= 5) {
        IO.println("Count is " + count);
        count += 1;
    }

    IO.println("Done.");
}
```

```output
Count is 1
Count is 2
Count is 3
Count is 4
Count is 5
Done.
```

Java checks the condition, runs the block if it is true, then goes back and checks again. When `count` reaches 6, the condition is false and the loop ends.

Every `while` loop needs three things, and leaving out any one of them breaks it:

1. A variable set up **before** the loop (`int count = 1;`)
2. A condition that can eventually become false (`count <= 5`)
3. Something **inside** the loop that moves toward that (`count += 1;`)

Delete `count += 1;` and `count` stays at 1 forever. The condition never goes false, and the program prints `Count is 1` until something stops it. This is an **infinite loop**, and every programmer writes one. Here the box stops it for you, after five seconds or once it has printed too much, and says why.

`while` loops shine when the number of repetitions depends on the user. The next program keeps asking until it gets a whole number, with Chapter 4's `try` and `catch` inside the loop.

It also stops if the answers run out. When input ends (Ctrl-D at a terminal, or **End input** under a box), `IO.readln` has no text to give back, and gives back `null` instead, Java's word for no value at all.

`answer == null` tests for it (`null` is not text, so this is a job for `==`, not `.equals`), and `break` leaves the loop at once; the section on `break` below says more. Every loop in this course that reads input stops this way.

```java
// Keeps asking until the answer is a whole number.

void main() {
    boolean answered = false;

    while (!answered) {
        String answer = IO.readln("Enter a number: ");
        if (answer == null) {
            break;
        }

        try {
            int number = Integer.parseInt(answer.strip());
            IO.println("Thank you. You entered " + number + ".");
            answered = true;
        } catch (NumberFormatException e) {
            IO.println("That is not a whole number.");
        }
    }
}
```

```output
Enter a number: seven
That is not a whole number.
Enter a number: 7
Thank you. You entered 7.
```

`answered` is the loop's three things at work: set up before the loop, tested by the condition, and changed inside. Each pass asks the question. When `Integer.parseInt` reads the answer, the program thanks the user and sets `answered` to `true`, so the condition is false the next time Java checks it and the loop ends. When it throws, Java leaves the `try` block, the `catch` complains, and the loop goes back to ask again. As in Chapter 4, the `catch` runs only when the conversion fails: `Integer.parseInt` reads a minus sign, so `-7` is thanked like any other whole number. A loop that also had to refuse negative numbers would test the number with an `if` after reading it, as this chapter's project does.

This is the standard shape of an input-validation loop, and it is a real improvement on Chapter 4's version, which gave up after one bad answer.

## The `for` loop

A `for` loop does its counting in its first line. `for (int i = 0; i < 5; i++)` holds, between its parentheses and separated by semicolons, the three things every `while` loop needs: `int i = 0` creates the loop's variable, once, before anything else; `i < 5` is the condition, checked before every pass; and `i++` runs after every pass. `i++` adds one to `i`: it is short for `i += 1`. Its partner `i--` subtracts one. Java programmers write `++` and `--` almost everywhere a variable counts up or down by one.

```java
void main() {
    for (int i = 0; i < 5; i++) {
        IO.println("i is " + i);
    }
}
```

```output
i is 0
i is 1
i is 2
i is 3
i is 4
```

Notice that the loop runs **five times, starting at zero**: 0, 1, 2, 3, 4. It stops *before* 5, because `i < 5` is false once `i` reaches 5. Starting at zero looks arbitrary and is not; it fits the way Java numbers the positions of the letters in a piece of text, which this chapter shows in a moment, and of the values in an array (Chapter 7), and it means `int i = 0; i < n` always runs exactly `n` times.

The three parts can count from anywhere, by any step:

| Header | Values of `i` |
| --- | --- |
| `for (int i = 0; i < 5; i++)` | 0, 1, 2, 3, 4 |
| `for (int i = 2; i < 6; i++)` | 2, 3, 4, 5 |
| `for (int i = 0; i < 20; i += 5)` | 0, 5, 10, 15 |
| `for (int i = 10; i > 0; i -= 2)` | 10, 8, 6, 4, 2 |

The pattern is start, condition, step. A condition with `<` never reaches its stop value; to include it, use `<=`, so `for (int i = 1; i <= 5; i++)` gives 1 to 5. To count down, start high, test with `>`, and subtract:

```java
void main() {
    IO.println("Countdown:");
    for (int i = 5; i > 0; i--) {
        IO.println(i);
    }
    IO.println("Liftoff.");
}
```

```output
Countdown:
5
4
3
2
1
Liftoff.
```

The loop variable is an ordinary variable, and `i` is only a convention. Name it for what it holds when that helps:

```java
void main() {
    for (int table = 1; table <= 3; table++) {
        for (int multiplier = 1; multiplier <= 3; multiplier++) {
            IO.println(table + " x " + multiplier + " = " + (table * multiplier));
        }
        IO.println();
    }
}
```

```output
1 x 1 = 1
1 x 2 = 2
1 x 3 = 3

2 x 1 = 2
2 x 2 = 4
2 x 3 = 6

3 x 1 = 3
3 x 2 = 6
3 x 3 = 9
```

That is a **nested loop**: the inner loop runs completely for every single pass of the outer one. Three outer passes times three inner passes is nine lines of output. Nested loops are how you handle grids, tables, and anything two-dimensional.

A grid wants each row on a line of its own, and for that there is `IO.print`. It prints exactly what `IO.println` would, but does not end the line, so whatever prints next carries on along the same line. An empty `IO.println()` ends it:

```java
void main() {
    for (int row = 1; row <= 3; row++) {
        for (int column = 1; column <= 4; column++) {
            IO.print((row * column) + " ");
        }
        IO.println();
    }
}
```

```output
1 2 3 4
2 4 6 8
3 6 9 12
```

Each pass of the inner loop prints one value and a space after it, and the `IO.println()` after the inner loop ends the row.

## Looping over a string

A `for` loop can also walk through a piece of text one character at a time, by position. Two methods make that work. `word.length()` gives the number of characters in `word`, so `"Java".length()` is 4. `word.charAt(i)` gives the character at position `i`, and positions start at zero, like the loops above: `"Java".charAt(0)` is the `J`, and the last character is at position `word.length() - 1`.

A single character has a type of its own, **`char`**, and a `char` value is written in single quotes: `'J'`, `'a'`, `'?'`. That is what single quotes are for in Java, and why Chapter 1's `'hi'` was an error: single quotes hold exactly one character.

```java
void main() {
    String word = "Java";

    for (int i = 0; i < word.length(); i++) {
        char letter = word.charAt(i);
        IO.println(letter);
    }
}
```

```output
J
a
v
a
```

`i < word.length()` stops after the last position, whatever the word's length, just as `i < 5` stopped after 4. Written `i <= word.length()`, the loop would take one more pass and ask for the position just past the end, which stops the program with a `StringIndexOutOfBoundsException`.

`'a'` and `"a"` are different things: `'a'` is one `char`, and `"a"` is a `String` that happens to be one character long. A `char` compares with `==`, like a number (`.equals` is for text), so a loop can look for a particular letter:

```java
void main() {
    String word = "banana";

    for (int i = 0; i < word.length(); i++) {
        if (word.charAt(i) == 'a') {
            IO.println("There is an a at position " + i + ".");
        }
    }
}
```

```output
There is an a at position 1.
There is an a at position 3.
There is an a at position 5.
```

The same counting loop walks through arrays in Chapter 7, which also shows a shorter `for` for visiting every item in turn. `for (int i = 0; i < n; i++)` is one of the most-used lines in the language.

## The accumulator pattern

Most useful loops build up an answer as they go. The shape is always the same: set up a variable before the loop, update it inside.

**Summing:**

```java
void main() {
    int total = 0;

    for (int number = 1; number <= 100; number++) {
        total += number;
    }

    IO.println("The numbers 1 to 100 add up to " + total + ".");
}
```

```output
The numbers 1 to 100 add up to 5050.
```

**Counting things that match a test:**

```java
void main() {
    int evens = 0;

    for (int number = 1; number <= 50; number++) {
        if (number % 2 == 0) {
            evens++;
        }
    }

    IO.println("There are " + evens + " even numbers from 1 to 50.");
}
```

```output
There are 25 even numbers from 1 to 50.
```

**Tracking the largest so far:**

```java
void main() {
    int largest = 0;

    for (int i = 0; i < 5; i++) {
        String answer = IO.readln("Enter a number: ");
        if (answer == null) {
            break;
        }
        int value = Integer.parseInt(answer.strip());
        if (value > largest) {
            largest = value;
        }
    }

    IO.println("The largest was " + largest + ".");
}
```

```output
Enter a number: 12
Enter a number: 7
Enter a number: 31
Enter a number: 4
Enter a number: 18
The largest was 31.
```

That last one has a hidden bug: starting `largest` at 0 gives the wrong answer if every number entered is negative. The usual fixes are to start from the first value read rather than from zero, or to use a `boolean` variable as a flag—and Chapter 7 comes back to it, with a whole array of numbers to search.

**Building a string:**

```java
void main() {
    String bar = "";

    for (int i = 0; i < 10; i++) {
        bar += "#";
        IO.println(bar);
    }
}
```

```output
#
##
###
####
#####
######
#######
########
#########
##########
```

This prints a growing staircase of hash marks. The same accumulator idea works for text: on a `String`, `+=` joins onto the end.

## `break` and `continue`

Two keywords alter a loop's flow mid-pass.

`break` exits the loop immediately. Here it ends a `while (true)` loop, a deliberate infinite loop whose only exit is the `break`:

```java
void main() {
    while (true) {
        String command = IO.readln("Enter a command (or 'quit'): ");
        if (command == null || command.equals("quit")) {
            break;
        }
        IO.println("You said: " + command);
    }

    IO.println("Goodbye.");
}
```

```output
Enter a command (or 'quit'): hello
You said: hello
Enter a command (or 'quit'): quit
Goodbye.
```

This is a standard and readable way to write a menu, because the exit condition sits where the exit actually happens rather than being crammed into the `while` line. The `null` test comes first: Java works out `||` from left to right and stops as soon as one side is true, so when `command` is `null`, `command.equals("quit")` is never asked.

`continue` skips the rest of the current pass and starts the next one:

```java
void main() {
    for (int number = 1; number <= 20; number++) {
        if (number % 3 != 0) {
            continue;
        }
        IO.println(number);
    }
}
```

```output
3
6
9
12
15
18
```

Everything not divisible by 3 hits the `continue` and gets skipped. In a `for` loop, `continue` still runs the header's step, so `number` moves on as usual. Note that this loop could just as well be written with `if (number % 3 == 0)` around the `IO.println`. `continue` earns its place when the skip condition is complicated or when the work after it is long.

## Common mistakes

| Mistake | What happens |
| --- | --- |
| Forgetting `count += 1;` in a `while` | Infinite loop |
| `for (int i = 1; i < 10; i++)` expecting 10 passes | You get 9; `i < 10` stops before 10 |
| `total = 0;` inside the loop | Resets every pass; the total is always the last value |
| `i <= word.length()` in a letter loop | The last pass asks for a position past the end, and the program stops with an exception—the last position is `word.length() - 1` |
| `letter == "a"` | `bad operand types for binary operator '=='`—a `char` compares with a `char`, `'a'` |
| `!answer.equals("y")` or `!answer.equals("n")` as a loop's condition | Always true—one of them is always the case; join them with `&&` |
| Using `i` after its `for` loop | `cannot find symbol`—a variable created in the `for` line exists only inside the loop |
| `while (count <= 5);` | No error and no output: the `;` is the whole loop, and `count` never changes, so it never ends |

## Try It

**1.** Print the first 20 square numbers—1, 4, 9 and so on—one per line.

```java
// Prints the first 20 square numbers, one per line.

void main() {
    for (int i = 1; i <= 20; i++) {
        IO.println(i * i);
    }
}
```

**2.** Ask for a number and print its multiplication table from 1 to 12.

```java
// Prints the multiplication table, 1 to 12, for a number.

void main() {
    int number = Integer.parseInt(IO.readln("Enter a number: ").strip());

    for (int multiplier = 1; multiplier <= 12; multiplier++) {
        IO.println(number + " x " + multiplier + " = " + (number * multiplier));
    }
}
```

**3.** Sum the numbers a user enters, stopping when they enter 0, and print the total.

```java
// Adds up numbers until the user enters 0.

void main() {
    int total = 0;

    while (true) {
        String answer = IO.readln("Enter a number (0 to stop): ");
        if (answer == null) {
            break;
        }
        int number = Integer.parseInt(answer.strip());
        if (number == 0) {
            break;
        }
        total += number;
    }

    IO.println("The total is " + total + ".");
}
```

**4.** Print a right triangle of stars 6 rows tall using a nested loop: one `*` on the first row, two on the second, and so on to six, each row starting at the left edge with no spaces.

```java
// Prints a right triangle of stars, 6 rows tall.

void main() {
    for (int row = 1; row <= 6; row++) {
        for (int star = 1; star <= row; star++) {
            IO.print("*");
        }
        IO.println();
    }
}
```

**5.** Count how many vowels (a, e, i, o and u) are in a word the user enters. Capital letters count too.

```java
// Counts the vowels in a word.

void main() {
    String word = IO.readln("Enter a word: ").strip().toLowerCase();
    int vowels = 0;

    for (int i = 0; i < word.length(); i++) {
        char letter = word.charAt(i);
        if (letter == 'a' || letter == 'e' || letter == 'i'
                || letter == 'o' || letter == 'u') {
            vowels++;
        }
    }

    IO.println("Vowels: " + vowels);
}
```

**6.** Write a guessing game: put the secret number 42 in the code, and keep asking until the user gets it, saying "too high" or "too low" each time, and `You got it!` when they do.

```java
// A guessing game with the secret number in the code.

void main() {
    int secret = 42;

    while (true) {
        String answer = IO.readln("Guess a number: ");
        if (answer == null) {
            break;
        }
        int guess = Integer.parseInt(answer.strip());

        if (guess == secret) {
            IO.println("You got it!");
            break;
        } else if (guess < secret) {
            IO.println("Too low.");
        } else {
            IO.println("Too high.");
        }
    }
}
```

**7.** Trace this by hand and write what it prints under the code, then press Check to compare your answer with the real output.

```java
void main() {
    int total = 0;
    for (int i = 1; i <= 5; i++) {
        if (i == 3) {
            continue;
        }
        total += i;
    }
    IO.println(total);
}
```

```output
12
```

## Chapter project: a number-guessing game

Write a complete guessing game in which the computer picks a number and the player guesses, with a limited number of tries.

This needs one new thing: random numbers. Java's `Random` makes them, and a compact source file can use it with nothing added at the top. `Random random = new Random();` creates one (`new` is how Java creates a value of a type like `Random`) and stores it in a variable named `random`: lowercase, as Chapter 2 asks, because the capitalized name belongs to the type. Then `random.nextInt(100)` gives a random whole number from 0 to 99. Like `i < 100`, it stops before 100 itself, so `random.nextInt(100) + 1` gives 1 to 100.

```java
// A guessing game with a limited number of tries.

void main() {
    Random random = new Random();
    int secret = random.nextInt(100) + 1;
    int maxTries = 7;
    int triesUsed = 0;
    boolean won = false;

    IO.println("I am thinking of a number between 1 and 100.");
    IO.println("You have " + maxTries + " tries.");
    IO.println();

    while (triesUsed < maxTries) {
        String guessText = IO.readln("Try " + (triesUsed + 1) + ": ");
        if (guessText == null) {
            break;
        }

        int guess;
        try {
            guess = Integer.parseInt(guessText.strip());
        } catch (NumberFormatException e) {
            IO.println("Please enter a whole number.");
            continue;
        }
        if (guess < 1 || guess > 100) {
            IO.println("Please guess from 1 to 100.");
            continue;
        }

        triesUsed++;

        if (guess == secret) {
            won = true;
            break;
        } else if (guess < secret) {
            IO.println("Too low.");
        } else {
            IO.println("Too high.");
        }
    }

    IO.println();
    if (won) {
        IO.println("Correct. You got it in " + triesUsed + " tries.");
    } else {
        IO.println("Out of tries. The number was " + secret + ".");
    }
}
```

A sample run, in which the number was 68:

```text
I am thinking of a number between 1 and 100.
You have 7 tries.

Try 1: 50
Too low.
Try 2: 75
Too high.
Try 3: 62
Too low.
Try 4: 68

Correct. You got it in 4 tries.
```

Two design decisions are worth pointing out.

The `continue` on invalid input means a typo does not cost the player a turn, because `triesUsed++` sits after the validation. Where you put that line is a rule of the game, not a technicality. The validation itself has two parts. `guess` is created before the `try`, so it still exists after it, and the `catch` ends in `continue`, so Java knows `guess` has a value whenever the lines after the `try` run. Then, because `Integer.parseInt` reads `-5` as happily as `5`, an `if` turns away any guess outside 1 to 100 the same way, before it costs a try. And as in every loop that reads, a `null` answer ends the game.

The variable `won` exists because the loop can end two ways—by `break` or by running out of tries—and the program needs to tell them apart afterward. A boolean used this way is called a **flag**, and it is a common tool whenever a loop's exit reason matters.

Finally: a player using the strategy in that sample run, always guessing the middle of the remaining range, can find any number from 1 to 100 in at most 7 tries. That is not a coincidence, and Chapter 11 explains why—it is an algorithm called binary search.
