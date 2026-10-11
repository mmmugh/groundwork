# Practice: a film club flyer

The Riverside Film Club needs a flyer for Friday's showing, and the person who used to make them has left. You are going to print one, a piece at a time, until the whole thing comes out in one go.

Everything here uses only what Chapter 1 covered: `IO.println`, text in quotes, joining with `+`, arithmetic, and a comment. No variables—those arrive in Chapter 2.

This is what you are working toward:

```text
======================================
         RIVERSIDE FILM CLUB
======================================

Feature:  The Quiet Harbor  (1998)
When:     Friday, 7:30 pm
Where:    Room 14

Seats available: 96
Snack bar total: 17.25

======================================
```

Two of those numbers are not typed in. The club has **8 rows of 12 seats**, and Friday's snack order is **3 boxes of popcorn at 3.75 each and 2 drinks at 3.00 each**. Let Java do that arithmetic—if the price changes, you want to edit one number, not recount.

## Steps

**Step 1.** Start with the banner. Print the rule, the club name, and the rule again—three lines, exactly as they appear above. The rule is 38 equals signs, and the club name is indented by nine spaces.

```java
void main() {
    IO.println("======================================");
    IO.println("         RIVERSIDE FILM CLUB");
    IO.println("======================================");
}
```

**Step 2.** Print the feature line: `Feature:  The Quiet Harbor  (1998)`, with two spaces after the colon and two before the year, as in the flyer. Use a single `IO.println` with one string.

```java
void main() {
    IO.println("Feature:  The Quiet Harbor  (1998)");
}
```

**Step 3.** Now a variation on that line, built from two pieces joined with `+`: `"Feature:"` and `"The Quiet Harbor  (1998)"`. Run the box as it is first, and notice that `+` puts nothing at all between the pieces. Then join a space, `" "`, in between them, so the line reads `Feature: The Quiet Harbor  (1998)`: one space after the colon this time (the flyer keeps two), and two before the year, as before.

```java
void main() {
    IO.println("Feature:" + " " + "The Quiet Harbor  (1998)");
}
```

**Step 4.** Print the two booking lines together, `When:` and `Where:`, as two separate `IO.println` lines, lining the values up under each other exactly as in the flyer.

```java
void main() {
    IO.println("When:     Friday, 7:30 pm");
    IO.println("Where:    Room 14");
}
```

**Step 5.** Print the seat count as `Seats available: 96`—but work out the 96 with a calculation from 8 rows of 12 seats, not by typing it.

```java
void main() {
    IO.println("Seats available: " + (8 * 12));
}
```

**Step 6.** Print the snack total as `Snack bar total: 17.25`, again calculated: 3 boxes of popcorn at 3.75, plus 2 drinks at 3.00.

```java
void main() {
    IO.println("Snack bar total: " + (3 * 3.75 + 2 * 3.00));
}
```

**Step 7.** Put the whole flyer together in one program, blank lines and all, with a comment on the first line saying what it prints. Every line of the target output, in order.

```java
// Prints the flyer for Friday's Riverside Film Club showing.

void main() {
    IO.println("======================================");
    IO.println("         RIVERSIDE FILM CLUB");
    IO.println("======================================");
    IO.println();
    IO.println("Feature:  The Quiet Harbor  (1998)");
    IO.println("When:     Friday, 7:30 pm");
    IO.println("Where:    Room 14");
    IO.println();
    IO.println("Seats available: " + (8 * 12));
    IO.println("Snack bar total: " + (3 * 3.75 + 2 * 3.00));
    IO.println();
    IO.println("======================================");
}
```
