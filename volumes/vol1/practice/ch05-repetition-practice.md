# Practice: a savings goal tracker

The bike costs **240**. You put something aside each week, and you want to know when you will have it—not roughly, but which week.

Everything here uses Chapters 1 to 5: variables, `IO.readln` and `Double.parseDouble`, arithmetic, joining text with `+`, `if`, and now `while`, `for`, `break` and `continue`. There are no arrays or lists yet, so the running total lives in a single variable that you add to as you go—the accumulator pattern from the chapter.

Each step is the same question with one thing changed, so the answer moves:

| Saving 15 a week | Weeks to reach 240 |
| --- | --- |
| Straightforwardly | 16 |
| Skipping every 5th week | 19 |
| With a 10 bonus every 4th week | 14 |
| With 1% interest added weekly | 15 |

In every step that looks for the goal, reaching exactly 240 counts.

## Steps

**Step 1.** Print `Week 1` through `Week 8`, one per line, with a `for` loop. Eight lines, and one `IO.println` in your code.

```java
void main() {
    for (int week = 1; week <= 8; week++) {
        IO.println("Week " + week);
    }
}
```

**Step 2.** Ask how much goes in each week, then print the running total at the end of each of the first 8 weeks. Keep one variable and add to it—do not recalculate from scratch each time.

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("Saving how much a week? ").strip());
    double total = 0;

    for (int week = 1; week <= 8; week++) {
        total += weekly;
        IO.println("Week " + week + ": " + total);
    }
}
```

**Step 3.** Ask the weekly amount again and use a `while` loop to find how many weeks it takes to reach 240. Print the number of weeks. Reaching exactly 240 counts.

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("Saving how much a week? ").strip());
    double total = 0;
    int weeks = 0;

    while (total < 240) {
        total += weekly;
        weeks++;
    }

    IO.println("Weeks needed: " + weeks);
}
```

**Step 4.** A `while` loop that never reaches its goal runs forever. Do the same thing with a `for` loop over 52 weeks and a `break` when the goal is met. Report *after* the loop rather than inside it: print `Reached in week N`, or `Not this year` if the 52 weeks run out. The loop's own `week` is gone once the loop ends, so keep the week you reach the goal in a variable created before the loop. Reporting from inside the loop is the bug this step is about—without the `break` it announces success every week from the 16th on.

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("Saving how much a week? ").strip());
    double total = 0;
    int reachedIn = 0;

    for (int week = 1; week <= 52; week++) {
        total += weekly;
        if (total >= 240) {
            reachedIn = week;
            break;
        }
    }

    if (reachedIn > 0) {
        IO.println("Reached in week " + reachedIn);
    } else {
        IO.println("Not this year");
    }
}
```

**Step 5.** Every 5th week the money goes on something else. Using `continue`, skip weeks 5, 10, 15 and so on—nothing saved, nothing lost—and print which week the goal is reached.

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("Saving how much a week? ").strip());
    double total = 0;

    for (int week = 1; week < 200; week++) {
        if (week % 5 == 0) {
            continue;
        }
        total += weekly;
        if (total >= 240) {
            IO.println("Reached in week " + week);
            break;
        }
    }
}
```

**Step 6.** Instead, a 10 bonus lands every 4th week—weeks 4, 8, 12—on top of the usual amount. Print which week the goal is reached now. Be careful which weeks you mean: paying it on weeks 1, 5 and 9 instead gives the same answer for a lot of weekly amounts, and a different one for the rest.

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("Saving how much a week? ").strip());
    double total = 0;

    for (int week = 1; week < 200; week++) {
        total += weekly;
        if (week % 4 == 0) {
            total += 10;
        }
        if (total >= 240) {
            IO.println("Reached in week " + week);
            break;
        }
    }
}
```

**Step 7.** The account pays 1% a week, added after your deposit goes in. Print which week the goal is reached.

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("Saving how much a week? ").strip());
    double total = 0;

    for (int week = 1; week < 200; week++) {
        total += weekly;
        total *= 1.01;
        if (total >= 240) {
            IO.println("Reached in week " + week);
            break;
        }
    }
}
```

**Step 8.** Put the tracker together: ask for the weekly amount, then print the balance at the end of each of the first 8 weeks as Step 2 did, with no bonus and no skipped weeks, and then the week the goal is reached, this time counting the bonus every 4th week and skipping every 5th.

```java
// The savings tracker: eight weekly balances, then the week the goal is reached.

void main() {
    double weekly = Double.parseDouble(IO.readln("Saving how much a week? ").strip());
    double total = 0;

    for (int week = 1; week <= 8; week++) {
        total += weekly;
        IO.println("Week " + week + ": " + total);
    }

    total = 0;
    for (int week = 1; week < 200; week++) {
        if (week % 5 == 0) {
            continue;
        }
        total += weekly;
        if (week % 4 == 0) {
            total += 10;
        }
        if (total >= 240) {
            IO.println("Goal reached in week " + week);
            break;
        }
    }
}
```
