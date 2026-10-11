## ch01-your-first-programs#10

Try It 1: your name, your school and your favorite subject, each on its own line.

```java
// Prints my name, school, and favorite subject.

void main() {
    IO.println("Ada Lovelace");
    IO.println("Somerville Academy");
    IO.println("Mathematics");
}
```

## ch01-your-first-programs#11

Try It 2: the number of minutes in a week, calculated.

```java
// Calculates the number of minutes in a week.

void main() {
    IO.println(7 * 24 * 60);
}
```

Java does the multiplication; nothing is typed in as a pre-computed number.

```java
void main() {
    // the minutes in a day, then seven days of them
    IO.println((24 * 60) * 7);
}
```

The second answer groups the minutes in a day first; multiplication gives the same answer in any order.

### mistake

The calculation in quotes is a string, so it prints the characters instead of working them out:

```java
void main() {
    IO.println("7 * 24 * 60");
}
```

The hours in a week, not the minutes:

```java
void main() {
    IO.println(7 * 24);
}
```

The starter, unchanged, prints nothing:

```java
void main() {
    // Print the number of minutes in a week, worked out by Java.
}
```

## ch01-your-first-programs#12

Try It 3: a small shape made of asterisks.

```java
// Prints a triangle of asterisks, four rows tall.

void main() {
    IO.println("*");
    IO.println("**");
    IO.println("***");
    IO.println("****");
}
```

## ch01-your-first-programs#13

Try It 4: a right prediction written another way (trailing spaces and a blank line at the end, which Check ignores).

```text
A   
BC

6
2 * 3

```

### mistake

Expecting `+` to put a space between the pieces it joins:

```text
A
B C

6
2 * 3
```

## ch01-your-first-programs-practice#1

```java
void main() {
    IO.println("======================================");
    IO.println("         RIVERSIDE FILM CLUB");
    IO.println("======================================");
}
```

The rule is typed out in full. `"=".repeat(38)` would be shorter, but that is Chapter 3.

```java
void main() {
    IO.println("===================" + "===================");
    IO.println("         " + "RIVERSIDE FILM CLUB");
    IO.println("===================" + "===================");
}
```

The second answer joins two halves of the rule and puts the nine spaces in a string of their own; what prints is the same.

### mistake

The club name without its nine spaces:

```java
void main() {
    IO.println("======================================");
    IO.println("RIVERSIDE FILM CLUB");
    IO.println("======================================");
}
```

A rule one sign too long, miscounted when typed out:

```java
void main() {
    IO.println("=======================================");
    IO.println("         RIVERSIDE FILM CLUB");
    IO.println("=======================================");
}
```

The starter, unchanged, prints the first rule and stops:

```java
void main() {
    IO.println("======================================");
    // Then the club name, indented by nine spaces, and the rule again.
}
```

## ch01-your-first-programs-practice#2

```java
void main() {
    IO.println("Feature:  The Quiet Harbor  (1998)");
}
```

One string, spaces and all, exactly as it should appear.

```java
void main() {
    IO.println("Feature:  " + "The Quiet Harbor  (1998)");
}
```

The second answer joins two strings, with both spaces inside the first; it prints the same line.

### mistake

One space where the flyer has two:

```java
void main() {
    IO.println("Feature: The Quiet Harbor (1998)");
}
```

## ch01-your-first-programs-practice#3

```java
void main() {
    IO.println("Feature:" + " " + "The Quiet Harbor  (1998)");
}
```

`+` puts nothing between the pieces it joins, so the space after the colon has to be a string of its own, `" "`. When the spacing matters, put it inside a string.

```java
void main() {
    IO.println("Feature: " + "The Quiet Harbor  (1998)");
}
```

The second answer moves the space inside the first piece instead of joining a third.

### mistake

The starter, unchanged: the two pieces run together as `Feature:The Quiet Harbor  (1998)`.

```java
void main() {
    IO.println("Feature:" + "The Quiet Harbor  (1998)");
}
```

Two spaces, as in step 2, where this line has one:

```java
void main() {
    IO.println("Feature:" + "  " + "The Quiet Harbor  (1998)");
}
```

## ch01-your-first-programs-practice#4

```java
void main() {
    IO.println("When:     Friday, 7:30 pm");
    IO.println("Where:    Room 14");
}
```

Two lines, and the values line up because the spaces are inside the strings.

```java
void main() {
    IO.println("When:" + "     " + "Friday, 7:30 pm");
    IO.println("Where:" + "    " + "Room 14");
}
```

The second answer joins the label, its spaces and its value; `When:` is one letter shorter than `Where:`, so it takes one more space.

### mistake

The same number of spaces after both labels, so the values do not line up:

```java
void main() {
    IO.println("When:     Friday, 7:30 pm");
    IO.println("Where:     Room 14");
}
```

## ch01-your-first-programs-practice#5

```java
void main() {
    IO.println("Seats available: " + (8 * 12));
}
```

`8 * 12` rather than `96`: change the row count and the flyer stays right. The parentheses are the chapter's habit; a product is worked out first even without them, but a sum, as in step 6, needs them.

```java
void main() {
    // 12 seats in each of 8 rows
    IO.println("Seats available: " + (12 * 8));
}
```

### mistake

The calculation in quotes is joined on as text: `Seats available: 8 * 12`.

```java
void main() {
    IO.println("Seats available: " + "8 * 12");
}
```

No space after the colon, since `+` adds none: `Seats available:96`.

```java
void main() {
    IO.println("Seats available:" + (8 * 12));
}
```

## ch01-your-first-programs-practice#6

```java
void main() {
    IO.println("Snack bar total: " + (3 * 3.75 + 2 * 3.00));
}
```

The parentheses make Java finish the arithmetic before it joins the answer onto the text. The space after the colon is inside the string, since `+` adds none of its own.

```java
void main() {
    // popcorn, then drinks
    IO.println("Snack bar total: " + (3.75 * 3 + 3.00 * 2));
}
```

### mistake

Without the parentheses, Java joins each product on as text: `Snack bar total: 11.256.0`.

```java
void main() {
    IO.println("Snack bar total: " + 3 * 3.75 + 2 * 3.00);
}
```

## ch01-your-first-programs-practice#7

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

The comment says what the program is for, not what each line does. Blank lines come from `IO.println()` with nothing in it.

```java
// The Riverside Film Club's flyer for Friday.

void main() {
    // banner
    IO.println("===================" + "===================");
    IO.println("         " + "RIVERSIDE FILM CLUB");
    IO.println("===================" + "===================");
    IO.println();

    // the showing
    IO.println("Feature:  " + "The Quiet Harbor  (1998)");
    IO.println("When:     " + "Friday, 7:30 pm");
    IO.println("Where:    " + "Room 14");
    IO.println();

    // the numbers, worked out by Java
    IO.println("Seats available: " + (12 * 8));
    IO.println("Snack bar total: " + (3.75 * 3 + 3.00 * 2));
    IO.println();
    IO.println("===================" + "===================");
}
```

The second answer joins its pieces and groups the program with comments and blank lines; Java ignores both, so it prints the same flyer.

### mistake

The blank line before the numbers is missing, so the seat count comes straight after the room:

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
    IO.println("Seats available: " + (8 * 12));
    IO.println("Snack bar total: " + (3 * 3.75 + 2 * 3.00));
    IO.println();
    IO.println("======================================");
}
```
