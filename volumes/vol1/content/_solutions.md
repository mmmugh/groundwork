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

## ch02-variables-and-types#13

Try It 1: a book's title, author and page count, in one sentence.

```java
// Prints a sentence about a book using three variables.

void main() {
    String title = "The Hobbit";
    String author = "J.R.R. Tolkien";
    int pageCount = 310;

    IO.println(title + " by " + author + " has " + pageCount + " pages.");
}
```

The pieces are joined with `+`, as the chapter's own examples print, and the spaces are inside the strings, since `+` adds none. The page count is an `int`, because a book has a whole number of pages.

## ch02-variables-and-types#14

Try It 2: two numbers in; their sum, difference and product out.

```java
// Reads two whole numbers and prints their sum, difference and product.

void main() {
    int first = Integer.parseInt(IO.readln("First number: ").strip());
    int second = Integer.parseInt(IO.readln("Second number: ").strip());

    IO.println("Sum: " + (first + second));
    IO.println("Difference: " + (first - second));
    IO.println("Product: " + (first * second));
}
```

Each answer is converted before any arithmetic is done with it, and each calculation sits in parentheses, so Java works it out before joining it onto the text.

```java
void main() {
    String a = IO.readln("A number: ");
    String b = IO.readln("Another: ");
    double x = Double.parseDouble(a.strip());
    double y = Double.parseDouble(b.strip());

    IO.println(x + " + " + y + " = " + (x + y));
    IO.println(x + " - " + y + " = " + (x - y));
    IO.println(x + " * " + y + " = " + (x * y));
}
```

The second answer reads each number into a `String` first, converts to `double` so decimals work too, and prints each result as an equation.

### mistake

The sum without its parentheses: the first `+` has a string on its left, so both numbers are joined on as text, `Sum: 64`.

```java
void main() {
    int first = Integer.parseInt(IO.readln("First number: ").strip());
    int second = Integer.parseInt(IO.readln("Second number: ").strip());

    IO.println("Sum: " + first + second);
    IO.println("Difference: " + (first - second));
    IO.println("Product: " + (first * second));
}
```

The starter, unchanged, prints nothing:

```java
void main() {
    // Two numbers in; their sum, difference and product out.
}
```

## ch02-variables-and-types#15

Try It 3: a number of seconds as minutes and seconds.

```java
// Converts a number of seconds into minutes and seconds.

void main() {
    String answer = IO.readln("Seconds? ");
    double seconds = Double.parseDouble(answer.strip());

    int minutes = (int) (seconds / 60);
    double leftOver = seconds - minutes * 60;

    IO.println(minutes + " minutes and " + leftOver + " seconds");
}
```

The seconds are a `double`, so the division keeps its decimals: 195 seconds is `3.25` minutes. The cast to `int` drops the part of a minute and leaves `3`, and the parentheses around `seconds / 60` make the division happen before the cast. Multiplying back and subtracting finds the seconds left over, `15.0`, a `double` like the seconds it came from.

```java
void main() {
    int seconds = Integer.parseInt(IO.readln("Seconds? ").strip());

    int minutes = seconds / 60;
    int leftOver = seconds - minutes * 60;

    IO.println(minutes + " minutes and " + leftOver + " seconds");
}
```

The second answer divides one `int` by another, which Java does in whole numbers: `195 / 60` is `3`, and the part of a minute is dropped with no cast. Chapter 3 explains this kind of division, and its `%` operator finds the leftover in one step.

### mistake

Subtracting the minutes instead of the seconds they hold, `192 seconds`:

```java
void main() {
    int seconds = Integer.parseInt(IO.readln("Seconds? ").strip());

    int minutes = seconds / 60;
    int leftOver = seconds - minutes;

    IO.println(minutes + " minutes and " + leftOver + " seconds");
}
```

## ch02-variables-and-types#16

Try It 4: a right prediction written another way (spaces at the end of the line and a blank line after it, which Check ignores).

```text
99 10   

```

### mistake

Expecting `b` to follow `a` when it changes:

```text
99 99
```

## ch02-variables-and-types#17

Try It 5: the broken program, fixed.

```java
// Converts a height in inches to feet.

void main() {
    String height = "72";
    double inches = Double.parseDouble(height);
    IO.println("That is " + (inches / 12) + " feet");
}
```

javac's message, `bad operand types for binary operator '/'`, names the trouble: `height` is a `String`, and text cannot be divided. Converting it gives a number to divide. It is a `double` because a height can be 70.5 inches.

## ch02-variables-and-types-practice#1

```java
void main() {
    String trail = "Kettle Ridge";
    double distanceKm = 12.4;
    IO.println(trail + " is " + distanceKm + " km");
}
```

`+` puts nothing between the pieces it joins, so the spaces are typed inside the strings, `" is "` and `" km"`.

```java
void main() {
    String trail = "Kettle Ridge";
    double distanceKm = 12.4;
    String line = trail + " is " + distanceKm + " km";
    IO.println(line);
}
```

The second answer builds the line in a variable of its own, then prints that.

### mistake

No spaces inside the strings, so the pieces run together: `Kettle Ridgeis12.4km`.

```java
void main() {
    String trail = "Kettle Ridge";
    double distanceKm = 12.4;
    IO.println(trail + "is" + distanceKm + "km");
}
```

## ch02-variables-and-types-practice#2

```java
void main() {
    double distanceKm = 12.4;
    String answer = IO.readln("Pace in minutes per km? ");
    double pace = Double.parseDouble(answer.strip());
    double minutes = distanceKm * pace;
    IO.println("That takes " + minutes + " minutes");
}
```

`Double.parseDouble` and not `Integer.parseInt`, because a pace can be 10.5. Without the conversion, javac refuses to multiply a number by a `String`: `bad operand types for binary operator '*'`.

```java
void main() {
    double pace = Double.parseDouble(IO.readln("Your pace (min/km): ").strip());
    IO.println("Minutes on the trail: " + (12.4 * pace));
}
```

The second answer converts in one nested line and does the multiplication inside the join, in parentheses.

### mistake

Dividing the distance by the pace: kilometers divided by minutes per kilometer is not a time.

```java
void main() {
    double distanceKm = 12.4;
    String answer = IO.readln("Pace in minutes per km? ");
    double pace = Double.parseDouble(answer.strip());
    IO.println("That takes " + (distanceKm / pace) + " minutes");
}
```

## ch02-variables-and-types-practice#3

```java
void main() {
    double distanceKm = 12.4;
    String answer = IO.readln("Pace in minutes per km? ");
    double pace = Double.parseDouble(answer.strip());
    double minutes = distanceKm * pace;
    double hours = minutes / 60;
    IO.println(minutes + " minutes, or " + hours + " hours");
}
```

Sixty minutes in an hour, so the hours are the minutes divided by 60. The answer is a long decimal for now; Chapter 3 shows how to round it.

```java
void main() {
    double distanceKm = 12.4;
    String answer = IO.readln("Pace in minutes per km? ");
    double pace = Double.parseDouble(answer.strip());
    IO.println("Minutes: " + (distanceKm * pace));
    IO.println("Hours: " + (distanceKm * pace / 60));
}
```

The second answer keeps no variables for the times and prints each on its own line.

### mistake

Multiplying by 60 instead of dividing, which turns minutes into seconds, not hours:

```java
void main() {
    double distanceKm = 12.4;
    String answer = IO.readln("Pace in minutes per km? ");
    double pace = Double.parseDouble(answer.strip());
    double minutes = distanceKm * pace;
    double hours = minutes * 60;
    IO.println(minutes + " minutes, or " + hours + " hours");
}
```

## ch02-variables-and-types-practice#4

```java
void main() {
    double distanceKm = 12.4;
    String answer = IO.readln("Pace in minutes per km? ");
    double pace = Double.parseDouble(answer.strip());
    double minutes = distanceKm * pace;
    double hours = minutes / 60;
    double water = hours * 0.75;
    IO.println("Water per person: " + water + " liters");
}
```

Per hour, so it multiplies the hours. Multiplying the minutes asks for 102 liters, which is a clue that the units were wrong.

```java
void main() {
    String answer = IO.readln("Pace in minutes per km? ");
    double pace = Double.parseDouble(answer.strip());
    double hours = 12.4 * pace / 60;
    IO.println("Each walker needs " + (0.75 * hours) + " liters");
}
```

The second answer works out the hours in one line and the water inside the join.

### mistake

Multiplying the minutes, not the hours, asks for about 102 liters:

```java
void main() {
    double distanceKm = 12.4;
    String answer = IO.readln("Pace in minutes per km? ");
    double pace = Double.parseDouble(answer.strip());
    double minutes = distanceKm * pace;
    double water = minutes * 0.75;
    IO.println("Water per person: " + water + " liters");
}
```

## ch02-variables-and-types-practice#5

```java
void main() {
    double distanceKm = 12.4;
    String answer = IO.readln("Pace in minutes per km? ");
    double pace = Double.parseDouble(answer.strip());
    double minutes = distanceKm * pace;
    double hours = minutes / 60;
    double water = hours * 0.75;
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    IO.println("Water for the group: " + (water * people) + " liters");
}
```

`Integer.parseInt` for a head count, since half a walker does not turn up.

```java
void main() {
    String paceAnswer = IO.readln("Pace in minutes per km? ");
    String peopleAnswer = IO.readln("How many people? ");
    double pace = Double.parseDouble(paceAnswer.strip());
    int people = Integer.parseInt(peopleAnswer.strip());
    double groupWater = 12.4 * pace / 60 * 0.75 * people;
    IO.println("The group needs " + groupWater + " liters");
}
```

The second answer asks both questions first and works out the group's water in one line.

### mistake

One person's water, printed as the group's:

```java
void main() {
    double distanceKm = 12.4;
    String answer = IO.readln("Pace in minutes per km? ");
    double pace = Double.parseDouble(answer.strip());
    double minutes = distanceKm * pace;
    double hours = minutes / 60;
    double water = hours * 0.75;
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    IO.println("Water for the group: " + water + " liters");
}
```

## ch02-variables-and-types-practice#6

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    IO.println("Permits: " + (4.50 * people));
}
```

Without `Integer.parseInt`, the program would multiply 4.50 by a `String`, and javac refuses to.

```java
void main() {
    String answer = IO.readln("Group size? ");
    int people = Integer.parseInt(answer.strip());
    double permits = people * 4.50;
    IO.println("The permits come to " + permits);
}
```

The second answer keeps the total in a variable of its own before printing it.

### mistake

The price of one permit, not the group's:

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    IO.println("Permits: " + 4.50);
}
```

## ch02-variables-and-types-practice#7

```java
// Plans a day on a trail: time, water and permits, from three answers.

void main() {
    String lengthAnswer = IO.readln("Trail length in km? ");
    double distanceKm = Double.parseDouble(lengthAnswer.strip());
    String paceAnswer = IO.readln("Pace in minutes per km? ");
    double pace = Double.parseDouble(paceAnswer.strip());
    int people = Integer.parseInt(IO.readln("How many people? ").strip());

    double minutes = distanceKm * pace;
    double hours = minutes / 60;
    double water = hours * 0.75;

    IO.println("Length: " + distanceKm + " km");
    IO.println("Time: " + minutes + " minutes");
    IO.println("Time: " + hours + " hours");
    IO.println("Water each: " + water + " liters");
    IO.println("Water total: " + (water * people) + " liters");
    IO.println("Permits: " + (4.50 * people));
}
```

Every printed number comes from the three that were typed in. Change the trail length and the whole plan follows.

```java
// A trail planner: three questions, six answers.

void main() {
    double distanceKm = Double.parseDouble(IO.readln("Trail length in km? ").strip());
    double pace = Double.parseDouble(IO.readln("Pace in minutes per km? ").strip());
    int people = Integer.parseInt(IO.readln("How many people? ").strip());

    double minutes = distanceKm * pace;
    double hours = minutes / 60;
    double waterEach = hours * 0.75;
    double waterTotal = waterEach * people;
    double permits = 4.50 * people;

    IO.println("Trail: " + distanceKm + " km");
    IO.println("Walking time: " + minutes + " minutes, or " + hours + " hours");
    IO.println("Water: " + waterEach + " liters each, " + waterTotal + " liters in all");
    IO.println("Permits: " + permits);
}
```

The second answer reads each typed value in one nested line, keeps every result in a named variable, and prints the plan in four lines.

### mistake

The water worked out from the minutes, not the hours, so both water lines are far too large:

```java
// Plans a day on a trail: time, water and permits, from three answers.

void main() {
    String lengthAnswer = IO.readln("Trail length in km? ");
    double distanceKm = Double.parseDouble(lengthAnswer.strip());
    String paceAnswer = IO.readln("Pace in minutes per km? ");
    double pace = Double.parseDouble(paceAnswer.strip());
    int people = Integer.parseInt(IO.readln("How many people? ").strip());

    double minutes = distanceKm * pace;
    double hours = minutes / 60;
    double water = minutes * 0.75;

    IO.println("Length: " + distanceKm + " km");
    IO.println("Time: " + minutes + " minutes");
    IO.println("Time: " + hours + " hours");
    IO.println("Water each: " + water + " liters");
    IO.println("Water total: " + (water * people) + " liters");
    IO.println("Permits: " + (4.50 * people));
}
```

The length asked for but never used: `double distanceKm = 12.4;` kept from steps 2 to 6, so the plan stays the same whatever length is typed:

```java
// Plans a day on a trail: time, water and permits, from three answers.

void main() {
    double distanceKm = 12.4;
    String lengthAnswer = IO.readln("Trail length in km? ");
    String paceAnswer = IO.readln("Pace in minutes per km? ");
    double pace = Double.parseDouble(paceAnswer.strip());
    int people = Integer.parseInt(IO.readln("How many people? ").strip());

    double minutes = distanceKm * pace;
    double hours = minutes / 60;
    double water = hours * 0.75;

    IO.println("Length: " + distanceKm + " km");
    IO.println("Time: " + minutes + " minutes");
    IO.println("Time: " + hours + " hours");
    IO.println("Water each: " + water + " liters");
    IO.println("Water total: " + (water * people) + " liters");
    IO.println("Permits: " + (4.50 * people));
}
```
