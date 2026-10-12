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

## ch03-expressions-and-operators#16

Try It 1: a number of minutes as hours and minutes.

```java
// Converts a number of minutes into hours and minutes.

void main() {
    int minutes = Integer.parseInt(IO.readln("Minutes: ").strip());
    int hours = minutes / 60;
    int leftOver = minutes % 60;
    IO.println(hours + " hours and " + leftOver + " minutes");
}
```

`/` on two `int`s gives the whole hours and drops the rest, and `%` gives the minutes left over: 150 minutes is 2 hours and 30 minutes.

```java
void main() {
    String answer = IO.readln("How many minutes? ");
    int total = Integer.parseInt(answer.strip());
    IO.println(total + " minutes is " + (total / 60) + "h " + (total % 60) + "m");
}
```

The second answer keeps the typed text in a variable before converting it, and works out the hours and minutes inside the join, each in parentheses.

### mistake

Dividing by `60.0`, which keeps the fraction, so 150 minutes comes out as `2.5 hours and 30 minutes`:

```java
void main() {
    int minutes = Integer.parseInt(IO.readln("Minutes: ").strip());
    double hours = minutes / 60.0;
    int leftOver = minutes % 60;
    IO.println(hours + " hours and " + leftOver + " minutes");
}
```

Taking 60 away instead of finding the remainder, `2 hours and 90 minutes`:

```java
void main() {
    int minutes = Integer.parseInt(IO.readln("Minutes: ").strip());
    int hours = minutes / 60;
    int leftOver = minutes - 60;
    IO.println(hours + " hours and " + leftOver + " minutes");
}
```

## ch03-expressions-and-operators#17

Try It 2: the tax on a price, and the total, to two decimal places.

```java
// Works out the tax on a price, and the total, to the cent.

void main() {
    double price = Double.parseDouble(IO.readln("Price: ").strip());
    double rate = Double.parseDouble(IO.readln("Tax rate (%): ").strip());

    double tax = price * rate / 100;
    double total = price + tax;

    IO.println("Tax: " + String.format("%.2f", tax));
    IO.println("Total: " + String.format("%.2f", total));
}
```

A rate of 8 percent means 8 hundredths, so the tax is the price times the rate, divided by 100. Both answers are read with `Double.parseDouble`, since a price has cents and a rate can be 7.5, and `%.2f` shows each amount to the cent.

```java
void main() {
    String priceText = IO.readln("What does it cost? ");
    String rateText = IO.readln("Sales tax percent? ");
    double price = Double.parseDouble(priceText.strip());
    double rate = Double.parseDouble(rateText.strip());
    double total = price * (1 + rate / 100);
    IO.println(String.format("Tax %.2f, total %.2f", total - price, total));
}
```

The second answer finds the total in one step, the price times one whole price plus the rate in hundredths, then the tax as the difference, and prints both with one format string.

### mistake

The rate read as an `int` and divided by the `int` `100`: integer division makes `8 / 100` zero, so there is never any tax.

```java
void main() {
    double price = Double.parseDouble(IO.readln("Price: ").strip());
    int rate = Integer.parseInt(IO.readln("Tax rate (%): ").strip());

    double tax = price * (rate / 100);
    double total = price + tax;

    IO.println("Tax: " + String.format("%.2f", tax));
    IO.println("Total: " + String.format("%.2f", total));
}
```

The percentage used as it is, without dividing by 100, so 8% of 250 comes out as 2000:

```java
void main() {
    double price = Double.parseDouble(IO.readln("Price: ").strip());
    double rate = Double.parseDouble(IO.readln("Tax rate (%): ").strip());

    double tax = price * rate;
    double total = price + tax;

    IO.println("Tax: " + String.format("%.2f", tax));
    IO.println("Total: " + String.format("%.2f", total));
}
```

## ch03-expressions-and-operators#18

Try It 3: a rectangle of `#` characters, 20 wide and 5 tall.

```java
// Prints a rectangle of # characters, 20 wide and 5 tall.

void main() {
    IO.println("#".repeat(20));
    IO.println("#".repeat(20));
    IO.println("#".repeat(20));
    IO.println("#".repeat(20));
    IO.println("#".repeat(20));
}
```

`repeat` builds each row of 20, and each `IO.println` prints one row, so five calls make five rows.

```java
void main() {
    String row = "#".repeat(20);
    IO.println(row);
    IO.println(row);
    IO.println(row);
    IO.println(row);
    IO.println(row);
}
```

The second answer builds the row once, in a variable, and prints it five times: change the width in one place and every row follows.

### mistake

All 100 characters on one line: 20 times 5 is the rectangle's area, not its shape.

```java
void main() {
    IO.println("#".repeat(20 * 5));
}
```

One row short:

```java
void main() {
    IO.println("#".repeat(20));
    IO.println("#".repeat(20));
    IO.println("#".repeat(20));
    IO.println("#".repeat(20));
}
```

## ch03-expressions-and-operators#19

Try It 4: a right prediction written another way (spaces at the end of a line and a blank line after it, which Check ignores).

```text
3 1 3.5   
512.0
555
15

```

### mistake

Expecting `/` to keep the fraction and `Math.pow` to give back a whole number:

```text
3.5 1 3.5
512
555
15
```

## ch03-expressions-and-operators#20

Try It 5: the average of three test scores, to one decimal place.

```java
// Averages three test scores, to one decimal place.

void main() {
    int first = Integer.parseInt(IO.readln("First score: ").strip());
    int second = Integer.parseInt(IO.readln("Second score: ").strip());
    int third = Integer.parseInt(IO.readln("Third score: ").strip());

    int total = first + second + third;
    double average = (double) total / 3;

    IO.println("Average: " + String.format("%.1f", average));
}
```

The cast makes `total` a `double` before the division, so the fraction is kept: 251 divided by 3 is 83.666..., which `%.1f` shows as `83.7`. Without the cast, `total / 3` would be integer division, `83`.

```java
void main() {
    double a = Double.parseDouble(IO.readln("First test? ").strip());
    double b = Double.parseDouble(IO.readln("Second test? ").strip());
    double c = Double.parseDouble(IO.readln("Third test? ").strip());
    IO.println(String.format("The average is %.1f", (a + b + c) / 3));
}
```

The second answer reads each score as a `double`, so the division keeps its fraction with no cast, and a score like 87.5 works too.

### mistake

Storing the answer in a `double` does not help when the division is done with `int`s: `251 / 3` is `83`, and the average prints as `83.0`.

```java
void main() {
    int first = Integer.parseInt(IO.readln("First score: ").strip());
    int second = Integer.parseInt(IO.readln("Second score: ").strip());
    int third = Integer.parseInt(IO.readln("Third score: ").strip());
    double average = (first + second + third) / 3;
    IO.println("Average: " + String.format("%.1f", average));
}
```

## ch03-expressions-and-operators-practice#1

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int slices = people * each;
    IO.println("You need " + slices + " slices");
}
```

Both answers go through `Integer.parseInt`. Without it, `IO.readln` gives back text, and javac refuses to multiply two `String`s: `bad operand types for binary operator '*'`.

```java
void main() {
    String peopleText = IO.readln("Guests? ");
    String eachText = IO.readln("Slices per guest? ");
    int people = Integer.parseInt(peopleText.strip());
    int each = Integer.parseInt(eachText.strip());
    IO.println("Slices needed: " + (people * each));
}
```

The second answer keeps each answer's text in a variable before converting it, and multiplies inside the join, in parentheses.

### mistake

Adding instead of multiplying: five people eating three slices each need 15, not 8.

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int slices = people + each;
    IO.println("You need " + slices + " slices");
}
```

## ch03-expressions-and-operators-practice#2

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int slices = people * each;
    int pizzas = (slices + 7) / 8;
    IO.println("Order " + pizzas + " pizzas");
}
```

Plain `slices / 8` rounds down, which orders one pizza for fifteen slices and leaves someone hungry. The `+ 7` rounds up without needing an `if`.

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    IO.println("Pizzas to order: " + ((people * each + 7) / 8));
}
```

The second answer works out the whole sum inside the join, in parentheses, with no variable for the slices or the pizzas.

### mistake

Dividing without rounding up orders one pizza for fifteen slices:

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int slices = people * each;
    int pizzas = slices / 8;
    IO.println("Order " + pizzas + " pizzas");
}
```

## ch03-expressions-and-operators-practice#3

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int slices = people * each;
    int pizzas = (slices + 7) / 8;
    IO.println((pizzas * 8 - slices) + " slices left over");
}
```

What is left is what was ordered minus what is eaten: two pizzas are 16 slices, and 15 are eaten. `slices % 8` answers a different question and happens to agree sometimes, which is worse than always being wrong.

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int eaten = people * each;
    int ordered = (eaten + 7) / 8 * 8;
    int leftOver = ordered - eaten;
    IO.println("Slices left in the boxes: " + leftOver);
}
```

The second answer names the slices ordered and the slices eaten, and the leftover is one minus the other.

### mistake

The remainder, which agrees only by chance: 15 slices leave 1 in the boxes, but `15 % 8` is 7.

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int slices = people * each;
    IO.println((slices % 8) + " slices left over");
}
```

## ch03-expressions-and-operators-practice#4

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int slices = people * each;
    int pizzas = (slices + 7) / 8;
    double cost = pizzas * 13.50;
    IO.println("That comes to " + String.format("%.2f", cost));
}
```

`%.2f` shows money properly, so `27.0` prints as `27.00`.

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int pizzas = (people * each + 7) / 8;
    IO.println(String.format("%d pizzas cost %.2f", pizzas, pizzas * 13.50));
}
```

The second answer puts both numbers in one format string: `%d` for the whole number of pizzas and `%.2f` for the money.

### mistake

Pricing the slices, not the pizzas:

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int slices = people * each;
    double cost = slices * 13.50;
    IO.println("That comes to " + String.format("%.2f", cost));
}
```

## ch03-expressions-and-operators-practice#5

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int slices = people * each;
    int pizzas = (slices + 7) / 8;
    double cost = pizzas * 13.50;
    IO.println("Each of you owes " + String.format("%.2f", cost / people));
}
```

Split between people, not between slices. Both are numbers the program has, which is exactly how that mistake happens. `%.2f` rounds to the nearest penny as it displays.

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int pizzas = (people * each + 7) / 8;
    double share = pizzas * 13.50 / people;
    double rounded = Math.round(share * 100) / 100.0;
    IO.println("Your share: " + rounded);
}
```

The second answer rounds the share to the penny as a value, with `Math.round`, and joins it with `+`. That prints `5.4` rather than `5.40`, which is why `%.2f` is the better tool for money.

### mistake

Split between the slices instead of the people:

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int slices = people * each;
    int pizzas = (slices + 7) / 8;
    double cost = pizzas * 13.50;
    IO.println("Each of you owes " + String.format("%.2f", cost / slices));
}
```

## ch03-expressions-and-operators-practice#6

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int slices = people * each;
    IO.println("Would one pizza have done? " + (slices <= 8));
}
```

A comparison is a value in its own right and can be printed. The parentheses make Java compare first and join the answer on afterward. Chapter 4 puts the same expression inside an `if`.

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    boolean onePizza = people * each <= 8;
    IO.println("One pizza enough: " + onePizza);
}
```

The second answer keeps the comparison's answer in a `boolean` variable before printing it.

### mistake

`<` instead of `<=`: exactly 8 slices is one pizza, but `8 < 8` is `false`.

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int slices = people * each;
    IO.println("Would one pizza have done? " + (slices < 8));
}
```

## ch03-expressions-and-operators-practice#7

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int slices = people * each;
    int pizzas = (slices + 7) / 8;
    double cost = pizzas * 13.50;
    double delivered = cost * 1.15;
    IO.println("With delivery: " + String.format("%.2f", delivered));
    IO.println("Each: " + String.format("%.2f", delivered / people));
}
```

Multiplying by 1.15 adds the 15% and keeps the original. Multiplying by 0.15 throws the pizza away and bills for the delivery.

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int pizzas = (people * each + 7) / 8;
    double total = pizzas * 13.50;
    total += total * 0.15;
    IO.println(String.format("Delivered: %.2f, or %.2f each", total, total / people));
}
```

The second answer adds the delivery charge onto the total with `+=`, then prints both amounts with one format string.

### mistake

`cost * 0.15` is the delivery charge alone, billed without the pizza:

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int slices = people * each;
    int pizzas = (slices + 7) / 8;
    double cost = pizzas * 13.50;
    double delivered = cost * 0.15;
    IO.println("With delivery: " + String.format("%.2f", delivered));
    IO.println("Each: " + String.format("%.2f", delivered / people));
}
```

## ch03-expressions-and-operators-practice#8

```java
// Settles games night: pizzas to order, leftovers, and what everyone owes.

void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());

    int slices = people * each;
    int pizzas = (slices + 7) / 8;
    double cost = pizzas * 13.50;
    double delivered = cost * 1.15;

    IO.println("Slices needed:   " + slices);
    IO.println("Pizzas to order: " + pizzas);
    IO.println("Slices left:     " + (pizzas * 8 - slices));
    IO.println("Cost:            " + String.format("%.2f", cost));
    IO.println("With delivery:   " + String.format("%.2f", delivered));
    IO.println("Each of you:     " + String.format("%.2f", delivered / people));
}
```

Nothing new, only arrangement. The labels are padded with spaces so the numbers line up in a column.

```java
// The pizza order, worked out in full.

void main() {
    String peopleText = IO.readln("How many people? ");
    String eachText = IO.readln("Slices each? ");
    int people = Integer.parseInt(peopleText.strip());
    int slices = people * Integer.parseInt(eachText.strip());

    int pizzas = (slices + 7) / 8;
    int leftOver = pizzas * 8 - slices;
    double cost = pizzas * 13.50;
    double delivered = cost * 1.15;

    IO.println(slices + " slices means " + pizzas + " pizzas, " + leftOver + " to spare.");
    IO.println(String.format("Cost %.2f, delivered %.2f, or %.2f each.", cost, delivered, delivered / people));
}
```

The second answer keeps the leftover in a variable of its own and reports the order in two sentences, the money in one format string.

### mistake

Each person's share worked out from the cost before delivery:

```java
// Settles games night: pizzas to order, leftovers, and what everyone owes.

void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());

    int slices = people * each;
    int pizzas = (slices + 7) / 8;
    double cost = pizzas * 13.50;
    double delivered = cost * 1.15;

    IO.println("Slices needed:   " + slices);
    IO.println("Pizzas to order: " + pizzas);
    IO.println("Slices left:     " + (pizzas * 8 - slices));
    IO.println("Cost:            " + String.format("%.2f", cost));
    IO.println("With delivery:   " + String.format("%.2f", delivered));
    IO.println("Each of you:     " + String.format("%.2f", cost / people));
}
```

## ch04-making-decisions#13

Try It 1: positive, negative, or zero.

```java
// Says whether a number is positive, negative, or zero.

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

Three possibilities make a chain of two conditions and an `else`. A number that is neither above zero nor below it can only be zero, so the last case needs no test of its own. `Double.parseDouble` reads `2.5` as well as `5`.

```java
void main() {
    int n = Integer.parseInt(IO.readln("Number? ").strip());

    if (n == 0) {
        IO.println("zero");
    } else {
        if (n > 0) {
            IO.println(n + " is positive");
        } else {
            IO.println(n + " is negative");
        }
    }
}
```

The second answer tests for zero first and nests the other two cases inside its `else`, and reads whole numbers only.

### mistake

`>=` lets zero into the first branch, so zero comes out positive and the zero case never runs:

```java
void main() {
    double number = Double.parseDouble(IO.readln("Enter a number: ").strip());

    if (number >= 0) {
        IO.println("The number is positive.");
    } else if (number < 0) {
        IO.println("The number is negative.");
    } else {
        IO.println("The number is zero.");
    }
}
```

Two cases where there are three, so zero comes out negative:

```java
void main() {
    double number = Double.parseDouble(IO.readln("Enter a number: ").strip());

    if (number > 0) {
        IO.println("The number is positive.");
    } else {
        IO.println("The number is negative.");
    }
}
```

## ch04-making-decisions#14

Try It 2: a leap year.

```java
// Asks for a year and reports whether it is a leap year.

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

The most specific rule (divisible by 400) goes first, exactly as this chapter warns: an `else if` chain stops at the first true condition, so order decides the outcome for overlapping cases. A remainder of 0 (`%`, Chapter 3) means the year divides evenly.

```java
void main() {
    int year = Integer.parseInt(IO.readln("Year? ").strip());
    boolean leap = false;

    if (year % 4 == 0) {
        leap = true;
        if (year % 100 == 0) {
            leap = year % 400 == 0;
        }
    }

    if (leap) {
        IO.println(year + " is a leap year");
    } else {
        IO.println(year + " is not a leap year");
    }
}
```

The second answer follows the rule in the order it is written, nesting the exception inside the rule, and keeps the answer in a `boolean` before printing one of two lines.

### mistake

The rules in the order the sentence gives them: every year divisible by 100 is also divisible by 4, so 1900 is caught by the first test and called a leap year.

```java
void main() {
    int year = Integer.parseInt(IO.readln("Enter a year: ").strip());

    if (year % 4 == 0) {
        IO.println(year + " is a leap year.");
    } else if (year % 100 == 0) {
        IO.println(year + " is not a leap year.");
    } else if (year % 400 == 0) {
        IO.println(year + " is a leap year.");
    } else {
        IO.println(year + " is not a leap year.");
    }
}
```

The exception without its exception: 2000 is divisible by 400, and so a leap year, but this calls it not one.

```java
void main() {
    int year = Integer.parseInt(IO.readln("Enter a year: ").strip());

    if (year % 100 == 0) {
        IO.println(year + " is not a leap year.");
    } else if (year % 4 == 0) {
        IO.println(year + " is a leap year.");
    } else {
        IO.println(year + " is not a leap year.");
    }
}
```

## ch04-making-decisions#15

Try It 3: the larger of two numbers.

```java
// Asks for two numbers and prints the larger one.

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

If neither number is larger than the other, they are equal, so the `else` needs no test of its own. A `double` prints with its decimal point, so typing 8 gives `8.0 is larger.`

```java
void main() {
    int a = Integer.parseInt(IO.readln("First? ").strip());
    int b = Integer.parseInt(IO.readln("Second? ").strip());

    if (a == b) {
        IO.println("Equal");
    } else if (a > b) {
        IO.println("Larger: " + a);
    } else {
        IO.println("Larger: " + b);
    }
}
```

The second answer handles the equal case first, and reads whole numbers.

### mistake

No equal case: when the two are the same, the `else` calls the second one larger.

```java
void main() {
    double first = Double.parseDouble(IO.readln("First number: ").strip());
    double second = Double.parseDouble(IO.readln("Second number: ").strip());

    if (first > second) {
        IO.println(first + " is larger.");
    } else {
        IO.println(second + " is larger.");
    }
}
```

## ch04-making-decisions#16

Try It 4: the days in a month.

```java
// Asks for a month number and prints how many days it has.

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

February is the one exception, so it goes first. The four 30-day months share one condition, joined with `||`, and every month left has 31 days.

```java
void main() {
    int month = Integer.parseInt(IO.readln("Which month? ").strip());
    int days = 31;

    if (month == 2) {
        days = 28;
    }
    if (month == 4 || month == 6 || month == 9 || month == 11) {
        days = 30;
    }

    IO.println("That month has " + days + " days.");
}
```

The second answer starts from the commonest answer, 31, and changes it only for the months that differ; two separate `if`s are safe here because no month passes both tests.

### mistake

November left out of the 30-day months, so it gets 31:

```java
void main() {
    int month = Integer.parseInt(IO.readln("Month number: ").strip());

    if (month == 2) {
        IO.println("28 days");
    } else if (month == 4 || month == 6 || month == 9) {
        IO.println("30 days");
    } else {
        IO.println("31 days");
    }
}
```

## ch04-making-decisions#17

Try It 5: a right prediction written another way (spaces at the end of the line and a blank line after it, which Check ignores).

```text
medium   

```

### mistake

Stopping at the outer test: `x > 10` is true, but the inner `if` still decides, and 12 is not above 20.

```text
big
```

## ch04-making-decisions#18

Try It 6: the grade program, rejecting impossible scores.

```java
// Grades a test score, rejecting impossible scores first.

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

The validation wraps the whole original grading chain in an `else` block—the same "reject first, then work" shape as the chapter's own ticket kiosk. `String grade;` moves inside the `else` with the chain, since nothing outside it needs a grade.

```java
void main() {
    int score = Integer.parseInt(IO.readln("Test score: ").strip());

    if (score < 0) {
        IO.println("Score must be between 0 and 100.");
    } else if (score > 100) {
        IO.println("Score must be between 0 and 100.");
    } else if (score >= 90) {
        IO.println("Score " + score + " earns a A.");
    } else if (score >= 80) {
        IO.println("Score " + score + " earns a B.");
    } else if (score >= 70) {
        IO.println("Score " + score + " earns a C.");
    } else if (score >= 60) {
        IO.println("Score " + score + " earns a D.");
    } else {
        IO.println("Score " + score + " earns a F.");
    }
}
```

The second answer makes the two rejections the first links of one long chain and prints the grade in each branch, with no `grade` variable.

### mistake

Only the top end checked, so a score of -5 still earns an F:

```java
void main() {
    int score = Integer.parseInt(IO.readln("Test score: ").strip());

    if (score > 100) {
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

`<=` and `>=` turn away 0 and 100, which are real scores:

```java
void main() {
    int score = Integer.parseInt(IO.readln("Test score: ").strip());

    if (score <= 0 || score >= 100) {
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

## ch04-making-decisions-practice#1

```java
void main() {
    double wind = Double.parseDouble(IO.readln("Wind speed in mph? ").strip());
    IO.println("Wind: " + String.format("%.1f", wind) + " mph");
}
```

`Double.parseDouble` rather than `Integer.parseInt`, because a wind speed has a decimal point. `%.1f` keeps the display steady at one decimal place, whatever was typed: `7.46` shows as `7.5`, and `8` as `8.0`.

```java
void main() {
    String answer = IO.readln("How windy, in mph? ");
    double speed = Double.parseDouble(answer.strip());
    IO.println(String.format("Wind: %.1f mph", speed));
}
```

The second answer keeps the typed text in a variable before converting it, and puts the whole line in one format string.

### mistake

Reading a whole number: `Integer.parseInt` cannot read `12.5`, and the program stops with a `NumberFormatException`.

```java
void main() {
    int wind = Integer.parseInt(IO.readln("Wind speed in mph? ").strip());
    IO.println("Wind: " + wind + " mph");
}
```

Joining the number as it is, with no format: `7.46` prints as `7.46`, not to one decimal place.

```java
void main() {
    double wind = Double.parseDouble(IO.readln("Wind speed in mph? ").strip());
    IO.println("Wind: " + wind + " mph");
}
```

## ch04-making-decisions-practice#2

```java
void main() {
    double wind = Double.parseDouble(IO.readln("Wind speed in mph? ").strip());

    if (wind < 30) {
        IO.println("Wind: OK");
    } else {
        IO.println("Wind: TOO STRONG");
    }
}
```

Under 30 means `<`, not `<=`. At exactly 30 the club stays on the ground.

```java
void main() {
    double wind = Double.parseDouble(IO.readln("Wind speed in mph? ").strip());

    if (wind >= 30) {
        IO.println("Wind: TOO STRONG");
    } else {
        IO.println("Wind: OK");
    }
}
```

The second answer asks the opposite question, "too strong?", so its first branch is the refusal.

### mistake

`<=` lets exactly 30 through:

```java
void main() {
    double wind = Double.parseDouble(IO.readln("Wind speed in mph? ").strip());

    if (wind <= 30) {
        IO.println("Wind: OK");
    } else {
        IO.println("Wind: TOO STRONG");
    }
}
```

## ch04-making-decisions-practice#3

```java
void main() {
    double temperature = Double.parseDouble(IO.readln("Temperature in C? ").strip());

    if (temperature >= 2 && temperature <= 35) {
        IO.println("Temperature: OK");
    } else {
        IO.println("Temperature: OUT OF RANGE");
    }
}
```

Two comparisons joined with `&&`. Both ends count as safe, so both are `>=` and `<=`.

```java
void main() {
    double temperature = Double.parseDouble(IO.readln("Temperature in C? ").strip());

    if (temperature < 2 || temperature > 35) {
        IO.println("Temperature: OUT OF RANGE");
    } else {
        IO.println("Temperature: OK");
    }
}
```

The second answer tests for the two ways out of range, joined with `||`, and the safe band is what is left.

### mistake

`>` and `<` leave both ends out, so exactly 2 degrees is called out of range:

```java
void main() {
    double temperature = Double.parseDouble(IO.readln("Temperature in C? ").strip());

    if (temperature > 2 && temperature < 35) {
        IO.println("Temperature: OK");
    } else {
        IO.println("Temperature: OUT OF RANGE");
    }
}
```

`||` where `&&` belongs: every temperature is at least 2 or at most 35, so everything is OK.

```java
void main() {
    double temperature = Double.parseDouble(IO.readln("Temperature in C? ").strip());

    if (temperature >= 2 || temperature <= 35) {
        IO.println("Temperature: OK");
    } else {
        IO.println("Temperature: OUT OF RANGE");
    }
}
```

## ch04-making-decisions-practice#4

```java
void main() {
    double ceiling = Double.parseDouble(IO.readln("Cloud ceiling in feet? ").strip());

    if (ceiling >= 5000) {
        IO.println("Ceiling: CLEAR");
    } else if (ceiling >= 2000) {
        IO.println("Ceiling: MARGINAL");
    } else {
        IO.println("Ceiling: TOO LOW");
    }
}
```

The narrow test goes first. With 2000 tested before 5000, a clear sky reads as marginal and the CLEAR branch never runs.

```java
void main() {
    double ceiling = Double.parseDouble(IO.readln("Cloud ceiling in feet? ").strip());

    if (ceiling < 2000) {
        IO.println("Ceiling: TOO LOW");
    } else if (ceiling < 5000) {
        IO.println("Ceiling: MARGINAL");
    } else {
        IO.println("Ceiling: CLEAR");
    }
}
```

The second answer climbs from the bottom band, with `<`, which puts the narrow test first just as well.

### mistake

The broad test first: 6000 feet passes `>= 2000` and is called marginal.

```java
void main() {
    double ceiling = Double.parseDouble(IO.readln("Cloud ceiling in feet? ").strip());

    if (ceiling >= 2000) {
        IO.println("Ceiling: MARGINAL");
    } else if (ceiling >= 5000) {
        IO.println("Ceiling: CLEAR");
    } else {
        IO.println("Ceiling: TOO LOW");
    }
}
```

## ch04-making-decisions-practice#5

```java
void main() {
    String typed = IO.readln("Fuel percentage? ");

    try {
        int fuel = Integer.parseInt(typed.strip());
        IO.println("Fuel: " + fuel + "%");
    } catch (NumberFormatException e) {
        IO.println("Fuel: NOT A NUMBER");
    }
}
```

The conversion is the check: when `Integer.parseInt` cannot read what was typed, it throws, and the `catch` prints the warning. Without the `try`, `Integer.parseInt` on `full` would stop the program before it could print anything.

```java
void main() {
    try {
        IO.println("Fuel: " + Integer.parseInt(IO.readln("Fuel percentage? ").strip()) + "%");
    } catch (NumberFormatException e) {
        IO.println("Fuel: NOT A NUMBER");
    }
}
```

The second answer reads, converts and prints in one line, inside the `try`: if the conversion throws, the line prints nothing and the `catch` runs.

### mistake

No `try`: typing `full` stops the program with a `NumberFormatException`.

```java
void main() {
    String typed = IO.readln("Fuel percentage? ");
    int fuel = Integer.parseInt(typed.strip());
    IO.println("Fuel: " + fuel + "%");
}
```

`Double.parseDouble` for a whole-number percentage, so 97 prints as `Fuel: 97.0%`:

```java
void main() {
    String typed = IO.readln("Fuel percentage? ");

    try {
        double fuel = Double.parseDouble(typed.strip());
        IO.println("Fuel: " + fuel + "%");
    } catch (NumberFormatException e) {
        IO.println("Fuel: NOT A NUMBER");
    }
}
```

## ch04-making-decisions-practice#6

```java
void main() {
    double wind = Double.parseDouble(IO.readln("Wind speed in mph? ").strip());
    double temperature = Double.parseDouble(IO.readln("Temperature in C? ").strip());
    double ceiling = Double.parseDouble(IO.readln("Cloud ceiling in feet? ").strip());
    String typed = IO.readln("Fuel percentage? ");

    boolean windOk = wind < 30;
    boolean temperatureOk = temperature >= 2 && temperature <= 35;
    boolean ceilingOk = ceiling >= 2000;
    boolean fuelOk;
    try {
        fuelOk = Integer.parseInt(typed.strip()) >= 95;
    } catch (NumberFormatException e) {
        fuelOk = false;
    }

    if (windOk && temperatureOk && ceilingOk && fuelOk) {
        IO.println("LAUNCH: GO");
    } else {
        IO.println("LAUNCH: NO GO");
    }
}
```

Naming each condition keeps the verdict line readable, and the names are reused in the next step. `fuelOk` is created with no value, and the `try` and the `catch` each give it one, as every branch of the grade chain gives `grade` one: fuel that is not a number is not safe.

```java
void main() {
    double wind = Double.parseDouble(IO.readln("Wind speed in mph? ").strip());
    double temperature = Double.parseDouble(IO.readln("Temperature in C? ").strip());
    double ceiling = Double.parseDouble(IO.readln("Cloud ceiling in feet? ").strip());
    String typed = IO.readln("Fuel percentage? ");

    boolean go = wind < 30 && temperature >= 2 && temperature <= 35 && ceiling >= 2000;
    try {
        int fuel = Integer.parseInt(typed.strip());
        if (fuel < 95) {
            go = false;
        }
    } catch (NumberFormatException e) {
        go = false;
    }

    if (go) {
        IO.println("LAUNCH: GO");
    } else {
        IO.println("LAUNCH: NO GO");
    }
}
```

The second answer keeps one `boolean` for the whole verdict, and lets the fuel test turn it off.

### mistake

`||` where `&&` belongs: one safe reading is enough for a launch.

```java
void main() {
    double wind = Double.parseDouble(IO.readln("Wind speed in mph? ").strip());
    double temperature = Double.parseDouble(IO.readln("Temperature in C? ").strip());
    double ceiling = Double.parseDouble(IO.readln("Cloud ceiling in feet? ").strip());
    String typed = IO.readln("Fuel percentage? ");

    boolean windOk = wind < 30;
    boolean temperatureOk = temperature >= 2 && temperature <= 35;
    boolean ceilingOk = ceiling >= 2000;
    boolean fuelOk;
    try {
        fuelOk = Integer.parseInt(typed.strip()) >= 95;
    } catch (NumberFormatException e) {
        fuelOk = false;
    }

    if (windOk || temperatureOk || ceilingOk || fuelOk) {
        IO.println("LAUNCH: GO");
    } else {
        IO.println("LAUNCH: NO GO");
    }
}
```

## ch04-making-decisions-practice#7

```java
void main() {
    double wind = Double.parseDouble(IO.readln("Wind speed in mph? ").strip());
    double temperature = Double.parseDouble(IO.readln("Temperature in C? ").strip());
    double ceiling = Double.parseDouble(IO.readln("Cloud ceiling in feet? ").strip());
    String typed = IO.readln("Fuel percentage? ");

    boolean windOk = wind < 30;
    boolean temperatureOk = temperature >= 2 && temperature <= 35;
    boolean ceilingOk = ceiling >= 2000;
    boolean fuelOk;
    try {
        fuelOk = Integer.parseInt(typed.strip()) >= 95;
    } catch (NumberFormatException e) {
        fuelOk = false;
    }

    if (windOk && temperatureOk && ceilingOk && fuelOk) {
        IO.println("LAUNCH: GO");
    } else {
        IO.println("LAUNCH: NO GO");
        if (!windOk) {
            IO.println("HOLD: wind");
        } else if (!temperatureOk) {
            IO.println("HOLD: temperature");
        } else if (!ceilingOk) {
            IO.println("HOLD: ceiling");
        } else {
            IO.println("HOLD: fuel");
        }
    }
}
```

`else if` rather than four separate `if`s, so only the first failure is reported. Fuel is the `else` because it is the only one left.

```java
void main() {
    double wind = Double.parseDouble(IO.readln("Wind speed in mph? ").strip());
    double temperature = Double.parseDouble(IO.readln("Temperature in C? ").strip());
    double ceiling = Double.parseDouble(IO.readln("Cloud ceiling in feet? ").strip());
    String typed = IO.readln("Fuel percentage? ");

    String hold = "";
    try {
        if (Integer.parseInt(typed.strip()) < 95) {
            hold = "fuel";
        }
    } catch (NumberFormatException e) {
        hold = "fuel";
    }
    if (ceiling < 2000) {
        hold = "ceiling";
    }
    if (temperature < 2 || temperature > 35) {
        hold = "temperature";
    }
    if (wind >= 30) {
        hold = "wind";
    }

    if (hold.isEmpty()) {
        IO.println("LAUNCH: GO");
    } else {
        IO.println("LAUNCH: NO GO");
        IO.println("HOLD: " + hold);
    }
}
```

The second answer checks the readings backward, fuel first, each failure overwriting the one before it, so the reason left at the end is the first one in the order wind, temperature, ceiling, fuel. An empty reason means a launch.

### mistake

The reasons checked in the wrong order: with both the wind and the ceiling bad, it blames the ceiling.

```java
void main() {
    double wind = Double.parseDouble(IO.readln("Wind speed in mph? ").strip());
    double temperature = Double.parseDouble(IO.readln("Temperature in C? ").strip());
    double ceiling = Double.parseDouble(IO.readln("Cloud ceiling in feet? ").strip());
    String typed = IO.readln("Fuel percentage? ");

    boolean windOk = wind < 30;
    boolean temperatureOk = temperature >= 2 && temperature <= 35;
    boolean ceilingOk = ceiling >= 2000;
    boolean fuelOk;
    try {
        fuelOk = Integer.parseInt(typed.strip()) >= 95;
    } catch (NumberFormatException e) {
        fuelOk = false;
    }

    if (windOk && temperatureOk && ceilingOk && fuelOk) {
        IO.println("LAUNCH: GO");
    } else {
        IO.println("LAUNCH: NO GO");
        if (!ceilingOk) {
            IO.println("HOLD: ceiling");
        } else if (!windOk) {
            IO.println("HOLD: wind");
        } else if (!temperatureOk) {
            IO.println("HOLD: temperature");
        } else {
            IO.println("HOLD: fuel");
        }
    }
}
```

## ch04-making-decisions-practice#8

```java
// The launch console: four readings, four status lines, a verdict and its reason.

void main() {
    double wind = Double.parseDouble(IO.readln("Wind speed in mph? ").strip());
    double temperature = Double.parseDouble(IO.readln("Temperature in C? ").strip());
    double ceiling = Double.parseDouble(IO.readln("Cloud ceiling in feet? ").strip());
    String typed = IO.readln("Fuel percentage? ");

    boolean windOk = wind < 30;
    boolean temperatureOk = temperature >= 2 && temperature <= 35;
    boolean ceilingOk = ceiling >= 2000;

    if (windOk) {
        IO.println("Wind: OK");
    } else {
        IO.println("Wind: TOO STRONG");
    }

    if (temperatureOk) {
        IO.println("Temperature: OK");
    } else {
        IO.println("Temperature: OUT OF RANGE");
    }

    if (ceiling >= 5000) {
        IO.println("Ceiling: CLEAR");
    } else if (ceilingOk) {
        IO.println("Ceiling: MARGINAL");
    } else {
        IO.println("Ceiling: TOO LOW");
    }

    boolean fuelOk;
    try {
        int fuel = Integer.parseInt(typed.strip());
        IO.println("Fuel: " + fuel + "%");
        fuelOk = fuel >= 95;
    } catch (NumberFormatException e) {
        IO.println("Fuel: NOT A NUMBER");
        fuelOk = false;
    }

    if (windOk && temperatureOk && ceilingOk && fuelOk) {
        IO.println("LAUNCH: GO");
    } else {
        IO.println("LAUNCH: NO GO");
        if (!windOk) {
            IO.println("HOLD: wind");
        } else if (!temperatureOk) {
            IO.println("HOLD: temperature");
        } else if (!ceilingOk) {
            IO.println("HOLD: ceiling");
        } else {
            IO.println("HOLD: fuel");
        }
    }
}
```

Nothing new, only assembly: the status lines from steps 2 to 5, then the verdict, then the reason. The fuel's `try` both prints its status line and decides `fuelOk`, so the fuel is converted once.

```java
// Reads the four readings, reports each, and decides.

void main() {
    double wind = Double.parseDouble(IO.readln("Wind speed in mph? ").strip());
    double temperature = Double.parseDouble(IO.readln("Temperature in C? ").strip());
    double ceiling = Double.parseDouble(IO.readln("Cloud ceiling in feet? ").strip());
    String typed = IO.readln("Fuel percentage? ");

    String windLine = "Wind: OK";
    if (wind >= 30) {
        windLine = "Wind: TOO STRONG";
    }
    String temperatureLine = "Temperature: OK";
    if (temperature < 2 || temperature > 35) {
        temperatureLine = "Temperature: OUT OF RANGE";
    }
    String ceilingLine = "Ceiling: CLEAR";
    if (ceiling < 2000) {
        ceilingLine = "Ceiling: TOO LOW";
    } else if (ceiling < 5000) {
        ceilingLine = "Ceiling: MARGINAL";
    }
    int fuel;
    String fuelLine;
    try {
        fuel = Integer.parseInt(typed.strip());
        fuelLine = "Fuel: " + fuel + "%";
    } catch (NumberFormatException e) {
        fuel = 0;
        fuelLine = "Fuel: NOT A NUMBER";
    }

    IO.println(windLine);
    IO.println(temperatureLine);
    IO.println(ceilingLine);
    IO.println(fuelLine);

    if (wind >= 30) {
        IO.println("LAUNCH: NO GO");
        IO.println("HOLD: wind");
    } else if (temperature < 2 || temperature > 35) {
        IO.println("LAUNCH: NO GO");
        IO.println("HOLD: temperature");
    } else if (ceiling < 2000) {
        IO.println("LAUNCH: NO GO");
        IO.println("HOLD: ceiling");
    } else if (fuel < 95) {
        IO.println("LAUNCH: NO GO");
        IO.println("HOLD: fuel");
    } else {
        IO.println("LAUNCH: GO");
    }
}
```

The second answer works out each status line as text first and prints the four together, then decides the verdict and its reason in one chain, the first failure winning. Fuel that is not a number counts as 0, which is below 95.

### mistake

Step 6's verdict with no reason: a `LAUNCH: NO GO` never says why.

```java
void main() {
    double wind = Double.parseDouble(IO.readln("Wind speed in mph? ").strip());
    double temperature = Double.parseDouble(IO.readln("Temperature in C? ").strip());
    double ceiling = Double.parseDouble(IO.readln("Cloud ceiling in feet? ").strip());
    String typed = IO.readln("Fuel percentage? ");

    boolean windOk = wind < 30;
    boolean temperatureOk = temperature >= 2 && temperature <= 35;
    boolean ceilingOk = ceiling >= 2000;

    if (windOk) {
        IO.println("Wind: OK");
    } else {
        IO.println("Wind: TOO STRONG");
    }

    if (temperatureOk) {
        IO.println("Temperature: OK");
    } else {
        IO.println("Temperature: OUT OF RANGE");
    }

    if (ceiling >= 5000) {
        IO.println("Ceiling: CLEAR");
    } else if (ceilingOk) {
        IO.println("Ceiling: MARGINAL");
    } else {
        IO.println("Ceiling: TOO LOW");
    }

    boolean fuelOk;
    try {
        int fuel = Integer.parseInt(typed.strip());
        IO.println("Fuel: " + fuel + "%");
        fuelOk = fuel >= 95;
    } catch (NumberFormatException e) {
        IO.println("Fuel: NOT A NUMBER");
        fuelOk = false;
    }

    if (windOk && temperatureOk && ceilingOk && fuelOk) {
        IO.println("LAUNCH: GO");
    } else {
        IO.println("LAUNCH: NO GO");
    }
}
```
