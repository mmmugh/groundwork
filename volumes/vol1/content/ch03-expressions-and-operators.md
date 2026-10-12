<!-- part: Part I: Foundations -->
# Chapter 3: Expressions and Operators

An **expression** is anything Java can work out to produce a single value. `7` is an expression. So is `3 + 4`, and `(price * quantity) * 1.08`, and `score > 90`. Java **evaluates** an expression—reduces it to one value—and then uses that value.

This chapter covers the operators you build expressions from.

## Arithmetic

| Operator | Name | Example |
| --- | --- | --- |
| `+` | Addition | `17 + 5` is `22` |
| `-` | Subtraction | `17 - 5` is `12` |
| `*` | Multiplication | `17 * 5` is `85` |
| `/` | Division | `17 / 5` is `3` |
| `%` | Remainder | `17 % 5` is `2` |

Java has no operator for raising a number to a power. Instead, `Math.pow(2, 10)` works out 2 to the power 10. `Math` is where Java keeps its mathematical methods, and `Math.pow` always gives back a `double`, so this one is `1024.0`.

The first three operators in the table behave as you expect. The other two deserve attention.

**`/` on two whole numbers gives a whole number.** `17 / 5` is `3`, not `3.4`: when both sides are `int`s, Java divides and throws away the fractional part. This is called **integer division**, and it catches everyone at least once: `10 / 4` is `2`, not `2.5`. When either side is a `double`, the division keeps its fraction, so `17.0 / 5` is `3.4`. Java drops the fraction by truncating toward zero, as a cast to `int` does (Chapter 2), so `-17 / 5` is `-3`: the `-3.4` loses its `.4`.

**`%` gives the remainder** after that division: `17 % 5` is `2`, because 17 is 5 × 3 with 2 left over. With a negative number the remainder is negative too, so `-17 % 5` is `-2`: -17 is 5 × -3 with -2 left over. The remainder is far more useful than it first appears, and two uses come up constantly:

```java
void main() {
    // Even numbers have remainder 0 when divided by 2
    IO.println(24 % 2);
    IO.println(25 % 2);

    // 500 seconds is how many minutes and seconds?
    int totalSeconds = 500;
    int minutes = totalSeconds / 60;
    int seconds = totalSeconds % 60;
    IO.println(minutes + " minutes and " + seconds + " seconds");
}
```

```output
0
1
8 minutes and 20 seconds
```

That pairing of `/` and `%`—one for the whole units, one for what is left over—is the standard way to break a quantity into larger and smaller parts, and you will use it for time, money, and page counts.

**When you want the fraction, make one side a `double`.** Integer division is right for minutes and coins, and wrong for an average. A cast (Chapter 2) turns an `int` into a `double` for one calculation: `(double) total / count`. A cast applies to the value right after it, before any arithmetic, so `total` becomes a `double`, the division sees a `double`, and the fraction is kept. Put the division in parentheses and the cast comes too late:

```java
void main() {
    int total = 17;
    int count = 5;

    IO.println(total / count);
    IO.println((double) total / count);
    IO.println((double) (total / count));
}
```

```output
3
3.4
3.0
```

The last line divides first, as `int`s, which gives `3`; the cast then turns `3` into `3.0`, and the `.4` is already gone.

**Whole numbers have limits.** An `int` holds whole numbers from -2147483648 to 2147483647, a little over two billion either way. Arithmetic that goes past either end does not stop the program or warn you: the answer wraps around to the other end, which is called **overflow**. For bigger whole numbers Java has a second type, `long`, which is declared the same way as an `int` and holds whole numbers up to 9223372036854775807, about nine billion billion:

```java
void main() {
    // The seconds in a century, worked out with ints
    int centuryInt = 60 * 60 * 24 * 365 * 100;
    IO.println(centuryInt);

    // The same, through a long
    long secondsPerYear = 60 * 60 * 24 * 365;
    long centuryLong = secondsPerYear * 100;
    IO.println(centuryLong);
}
```

```output
-1141367296
3153600000
```

A century does not have a negative number of seconds. Every number in the first calculation is an `int`, so Java works it out as an `int`, and the last multiplication goes past 2147483647 and wraps around. The second time, `secondsPerYear` is a `long` (a year's 31536000 seconds fit easily), and when either side of an arithmetic operator is a `long`, Java works the answer out as a `long`, which has room.

As with `(double) (total / count)`, the arithmetic is finished before anything happens to its answer: `long century = 60 * 60 * 24 * 365 * 100;` still overflows, because the multiplying is all done, as `int`s, before the answer is stored in the `long`.

## Order of operations

Java follows the precedence rules from algebra. From highest to lowest:

1. Parentheses `()`
2. `*`, `/`, `%` (left to right)
3. `+`, `-` (left to right)

A method call such as `Math.pow(2, 3)` is worked out before the operators around it, and so is a cast such as `(double) total`, as the last section showed.

```java
void main() {
    IO.println(10 + 3 * 2);
    IO.println((10 + 3) * 2);
    IO.println(Math.pow(2, 3) * 4);
}
```

```output
16
26
32.0
```

The last line prints `32.0`, not `32`, because `Math.pow` gives back a `double`, and a `double` times an `int` is a `double`.

Parentheses override everything, and you should use them freely. An expression that is technically unambiguous but takes a reader ten seconds to parse is worse than one with two redundant parentheses.

## Why `0.1 + 0.2` is not `0.3`

Try this:

```java
void main() {
    IO.println(0.1 + 0.2);
}
```

```output
0.30000000000000004
```

This is not a bug in Java, and every other mainstream language does the same thing. Computers store a `double` in binary, and just as 1/3 cannot be written exactly as a decimal (0.3333... forever), 0.1 cannot be written exactly in binary. The stored value is very slightly off, and the error surfaces when you add.

Two practical consequences:

- **Round for display.** The error is far too small to matter for a temperature or a price, but it looks terrible on screen. Fix it when you print, using the tools below.
- **Do not test `double`s for exact equality.** `0.1 + 0.2 == 0.3` is `false`. If you need to compare `double`s, check that the difference is small rather than that they match.

## Rounding and formatting

`Math.round` rounds a number to the nearest whole number. It gives back a `long`, the bigger whole-number type from earlier in this chapter, and a value exactly halfway rounds up, so `Math.round(2.5)` is `3`. To round to two decimal places, multiply by 100, round, and divide by `100.0`:

```java
void main() {
    IO.println(Math.round(3.14159));
    IO.println(Math.round(3.14159 * 100) / 100.0);
    IO.println(Math.round((0.1 + 0.2) * 100) / 100.0);
}
```

```output
3
3.14
0.3
```

Read the second line from the inside out: `3.14159 * 100` is `314.159`, `Math.round` makes that `314`, and `314 / 100.0` is `3.14`. The `.0` on `100.0` matters. `Math.round` gives back a whole number, and dividing it by the whole number `100` would be integer division, giving `3`.

For controlling how a value *appears*, the better tool is `String.format`. Its first argument is a **format string**: text with placeholders in it, each starting with `%`. `String.format` replaces each placeholder with the next value after the format string, in order, and gives back the finished text. `%s` stands for a string, `%d` for a whole number, and `%.1f` for a `double` shown with one decimal place (`%.2f` shows two):

```java
void main() {
    String name = "Ada";
    double score = 91.5;

    IO.println(name + " scored " + score + " points.");
    IO.println(String.format("%s scored %.1f points.", name, score));
    IO.println(String.format("Half of that is %.2f.", score / 2));
}
```

```output
Ada scored 91.5 points.
Ada scored 91.5 points.
Half of that is 45.75.
```

`String.format` only builds the text; `IO.println` prints it. Each placeholder is a **format specifier**: `%.2f`, for instance, means "show this `double` with exactly 2 decimal places," rounding it if it has more. This is how you get money to display properly:

```java
void main() {
    double total = 7.5;
    IO.println(String.format("Total: $%.2f", total));
}
```

```output
Total: $7.50
```

That is the fix for the receipt in Chapters 1 and 2. Note that `%.2f` changes only the display; the variable `total` still holds `7.5`.

The values after the format string can be any expression, which can be easier to read than a long row of `+` signs and quotes. An instruction too long for one line can carry on to the next, because Java reads on to the semicolon:

```java
void main() {
    int width = 7;
    int height = 4;
    IO.println(String.format("A %d by %d rectangle has area %d.",
            width, height, width * height));
}
```

```output
A 7 by 4 rectangle has area 28.
```

The rest of this course joins text and values with `+`, as it has so far, and uses `String.format` whenever a number needs a set number of decimal places (and, from Chapter 7, to line up columns).

## String operators

The `+` sign works on strings too, joining them, as it has since Chapter 1. Repeating a string is a job for a method, `repeat`, written after the text and joined to it by a dot, like `strip()` in Chapter 2:

```java
void main() {
    String first = "Ada";
    String last = "Lovelace";

    IO.println(first + " " + last);
    IO.println("-".repeat(30));
    IO.println("ab".repeat(3));
}
```

```output
Ada Lovelace
------------------------------
ababab
```

`+` joins strings, and `repeat` repeats one. The repetition trick is genuinely useful for drawing separator lines. Note that `*` does not work on text at all: `"-" * 30` is a compile error, `bad operand types for binary operator '*'`. (`+` with a string and a number is fine, as Chapter 1 showed: it writes the number as text.)

## Comparison operators

These compare two values and produce a boolean—`true` or `false`.

| Operator | Meaning | Example |
| --- | --- | --- |
| `==` | Equal to | `5 == 5` is `true` |
| `!=` | Not equal to | `5 != 3` is `true` |
| `<` | Less than | `5 < 3` is `false` |
| `>` | Greater than | `5 > 3` is `true` |
| `<=` | Less than or equal | `5 <= 5` is `true` |
| `>=` | Greater than or equal | `3 >= 5` is `false` |

The distinction between `=` and `==` is the single most common beginner error. **`=` assigns a value; `==` asks a question.** `score = 90` sets the score. `score == 90` checks whether it is 90 and produces `true` or `false`.

Text needs one more rule. `==` works for numbers and booleans, but for two strings it does not compare their letters: it asks a different question, which Chapter 7 explains. To compare the letters, use `equals`. Like `strip()` and `repeat`, it is written after one string, joined to it by a dot, and the other string goes in its parentheses: `answer.equals("yes")`. Here are both, in a program where the user types `yes`:

```java
void main() {
    String answer = IO.readln("Ready? ");
    IO.println(answer == "yes");
    IO.println(answer.equals("yes"));
}
```

```output
Ready? yes
false
true
```

The user typed exactly `yes`, and `==` said `false`. Nothing crashed and nothing warned you, which is what makes this mistake dangerous. `answer.equals("yes")` compared the letters, which is what was meant. **Compare text with `.equals`, never with `==`.**

The ordering operators, `<`, `>`, `<=` and `>=`, work only on numbers: `"apple" < "banana"` is a compile error. To put two strings in order, use `compareTo`. `a.compareTo(b)` gives back a negative number when `a` comes before `b`, zero when they are equal, and a positive number when `a` comes after, so `a.compareTo(b) < 0` asks "does `a` come before `b`?" The order is alphabetical—more precisely, character-code order, which puts all uppercase letters before all lowercase ones:

```java
void main() {
    IO.println("apple".compareTo("banana") < 0);
    IO.println("Zebra".compareTo("apple") < 0);
}
```

```output
true
true
```

## Boolean operators

Three operators combine or invert booleans:

- `&&` (and)—`true` only when both sides are true
- `||` (or)—`true` when at least one side is true
- `!` (not)—flips a boolean to its opposite

```java
void main() {
    int age = 15;
    boolean hasPermission = true;

    IO.println(age >= 13 && age <= 19);
    IO.println(age < 13 || hasPermission);
    IO.println(!hasPermission);
}
```

```output
true
true
false
```

Arithmetic is worked out before a comparison, and comparisons before `&&` and `||`, so none of these needs parentheses.

On paper, you might write the first of those as one range, `13 <= age <= 19`. Java does not allow that shorthand:

```java
void main() {
    int age = 15;
    IO.println(13 <= age <= 19);
}
```

Press Run, and javac refuses:

```text
Main.java:3: error: bad operand types for binary operator '<='
    IO.println(13 <= age <= 19);
                         ^
  first type:  boolean
  second type: int
1 error
```

Java works out `13 <= age` first, which gives `true`, and then tries `true <= 19`: a boolean compared with a number, which means nothing, and javac's message names the two types it was given. Say both halves, joined with `&&`: `13 <= age && age <= 19`, the same test as the first line of this section's first box.

These expressions look pointless in isolation. In Chapter 4 they become the conditions that decide what a program does.

## Shorthand assignment

Updating a variable based on its own value is so common that Java has a shorthand for it:

| Shorthand | Means |
| --- | --- |
| `x += 3;` | `x = x + 3;` |
| `x -= 3;` | `x = x - 3;` |
| `x *= 3;` | `x = x * 3;` |
| `x /= 3;` | `x = x / 3;` |

```java
void main() {
    int score = 0;
    score += 10;
    score += 25;
    score *= 2;
    score -= 5;
    IO.println(score);
}
```

```output
65
```

These are conveniences, not new ideas—but `total += price;` is used so heavily from Chapter 5 onward that it is worth being fluent in.

## Common mistakes

| Mistake | What you see |
| --- | --- |
| `if (score = 90)` | `incompatible types: int cannot be converted to boolean`—Chapter 4's `if` needs a `true` or `false`, and comparison needs `==` |
| `answer == "yes"` | `false`, even when the user typed `yes`—compare text with `.equals` |
| Expecting `10 / 4` to be `2.5` | It is `2`: `/` on two `int`s drops the fraction; write `10 / 4.0`, or cast one side to `double` |
| `(double) (total / count)` | The fraction is already gone—cast before dividing, `(double) total / count` |
| `0.1 + 0.2 == 0.3` | `false`—never test `double`s for exact equality |
| A `String.format` call on a line by itself | Nothing is printed—`String.format` only builds the text; print it with `IO.println` |
| `"apple" < "banana"` | `bad operand types for binary operator '<'`—put text in order with `compareTo` |
| `int n = Math.round(2.7);` | `incompatible types: possible lossy conversion from long to int`—`Math.round` gives back a `long` |
| `5 / 0` | `ArithmeticException: / by zero`—check the divisor first |

## Try It

**1.** Ask for a number of minutes and print it as hours and minutes using `/` and `%`.

```java
void main() {
    int minutes = Integer.parseInt(IO.readln("Minutes: ").strip());
    int hours = minutes / 60;
    int leftOver = minutes % 60;
    IO.println(hours + " hours and " + leftOver + " minutes");
}
```

**2.** Write a program that asks for a price and a tax rate as a percentage, then prints the tax and the total, each to two decimal places.

```java
void main() {
    double price = Double.parseDouble(IO.readln("Price: ").strip());
    double rate = Double.parseDouble(IO.readln("Tax rate (%): ").strip());
    double tax = price * rate / 100;
    IO.println("Tax: " + String.format("%.2f", tax));
    IO.println("Total: " + String.format("%.2f", price + tax));
}
```

**3.** Print a rectangle of `#` characters 20 wide and 5 tall, using `repeat` and only five `IO.println` calls.

```java
void main() {
    IO.println("#".repeat(20));
    IO.println("#".repeat(20));
    IO.println("#".repeat(20));
    IO.println("#".repeat(20));
    IO.println("#".repeat(20));
}
```

**4.** What does this print? Write your prediction under the code, then press Check to compare it with the real output.

```java
void main() {
    IO.println((7 / 2) + " " + (7 % 2) + " " + (7 / 2.0));
    IO.println(Math.pow(2, Math.pow(3, 2)));
    IO.println("5".repeat(3));
    IO.println(Integer.parseInt("5") * 3);
}
```

```output
3 1 3.5
512.0
555
15
```

**5.** Ask the user for three test scores and print their average to one decimal place.

```java
void main() {
    int first = Integer.parseInt(IO.readln("First score: ").strip());
    int second = Integer.parseInt(IO.readln("Second score: ").strip());
    int third = Integer.parseInt(IO.readln("Third score: ").strip());
    double average = (first + second + third) / 3.0;
    IO.println("Average: " + String.format("%.1f", average));
}
```

## Chapter project: a change-making machine

Write a program that asks for an amount in cents and prints how to pay it with the fewest quarters, dimes, nickels, and pennies.

This is a genuine algorithm—a **greedy algorithm**, which at every step takes as much as it can of the largest remaining coin. For US coin values it always produces the fewest coins, though that is a property of these particular values rather than a general truth about greedy methods.

A solution, with a sample run under it:

```java
// Breaks an amount of cents into the fewest US coins, largest first.

void main() {
    int cents = Integer.parseInt(IO.readln("Amount in cents: ").strip());
    int original = cents;

    int quarters = cents / 25;
    cents = cents % 25;

    int dimes = cents / 10;
    cents = cents % 10;

    int nickels = cents / 5;
    int pennies = cents % 5;

    IO.println();
    IO.println(String.format("%d cents = $%.2f", original, original / 100.0));
    IO.println("Quarters: " + quarters);
    IO.println("Dimes:    " + dimes);
    IO.println("Nickels:  " + nickels);
    IO.println("Pennies:  " + pennies);
    IO.println("Total coins: " + (quarters + dimes + nickels + pennies));
}
```

```output
Amount in cents: 87

87 cents = $0.87
Quarters: 3
Dimes:    1
Nickels:  0
Pennies:  2
Total coins: 6
```

The same two-line pattern repeats for each coin: `/` takes as many as possible, `%` keeps what is left. Seeing a repeated pattern like that is a signal, and Chapter 5 gives you loops and Chapter 6 gives you methods—two different ways to stop writing the same thing four times.

Look at the dollar line too. `original / 100.0` divides by a `double`, so the cents survive as a fraction: 87 cents is `0.87` dollars. Divided by the `int` `100` instead, it would be integer division and give `0`, and worse, the program would stop with an `IllegalFormatConversionException`, because `%.2f` needs a `double`.
