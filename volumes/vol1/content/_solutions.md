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

## ch05-repetition#15

Try It 1: the first 20 square numbers.

```java
// Prints the first 20 square numbers, one per line.

void main() {
    for (int i = 1; i <= 20; i++) {
        IO.println(i * i);
    }
}
```

Counting from 1 with `<=` gives the twenty values 1 to 20, and each pass prints its number times itself. Counting from 0 instead would print 0 first and stop at 361.

```java
void main() {
    int n = 1;
    while (n <= 20) {
        IO.println(n * n);
        n++;
    }
}
```

The second answer counts with a `while` loop, its three parts on three lines.

### mistake

`i < 20` stops before 20, so the list ends at 361, one square short:

```java
void main() {
    for (int i = 1; i < 20; i++) {
        IO.println(i * i);
    }
}
```

Doubling instead of squaring:

```java
void main() {
    for (int i = 1; i <= 20; i++) {
        IO.println(i * 2);
    }
}
```

## ch05-repetition#16

Try It 2: a multiplication table.

```java
// Prints the multiplication table, 1 to 12, for a number.

void main() {
    int number = Integer.parseInt(IO.readln("Enter a number: ").strip());

    for (int multiplier = 1; multiplier <= 12; multiplier++) {
        IO.println(number + " x " + multiplier + " = " + (number * multiplier));
    }
}
```

The question is asked once, before the loop, and the loop prints the twelve lines. The multiplication is in parentheses because it shares a line with text (Chapter 1).

```java
void main() {
    int table = Integer.parseInt(IO.readln("Which table? ").strip());
    int times = 1;

    while (times <= 12) {
        IO.println(times + " times " + table + " is " + (times * table));
        times++;
    }
}
```

The second answer counts with a `while` loop and words each line its own way.

### mistake

Stopping at 10, the way many tables are printed, leaves out 11 and 12:

```java
void main() {
    int number = Integer.parseInt(IO.readln("Enter a number: ").strip());

    for (int multiplier = 1; multiplier <= 10; multiplier++) {
        IO.println(number + " x " + multiplier + " = " + (number * multiplier));
    }
}
```

Starting at 0 with `< 12` gives twelve lines, but from 0 to 11:

```java
void main() {
    int number = Integer.parseInt(IO.readln("Enter a number: ").strip());

    for (int multiplier = 0; multiplier < 12; multiplier++) {
        IO.println(number + " x " + multiplier + " = " + (number * multiplier));
    }
}
```

The table of 5 whatever is typed, which looks right until someone types 7:

```java
void main() {
    IO.readln("Enter a number: ");

    for (int multiplier = 1; multiplier <= 12; multiplier++) {
        IO.println("5 x " + multiplier + " = " + (5 * multiplier));
    }
}
```

## ch05-repetition#17

Try It 3: a running sum that stops at 0.

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

`while (true)` with two ways out: the end of input, as in every loop that reads, and the 0 that means stop. The 0 is tested before it is added; adding it would do no harm, but the loop must end there.

```java
void main() {
    int total = 0;
    boolean done = false;

    while (!done) {
        String answer = IO.readln("Number: ");
        if (answer == null) {
            break;
        }
        int number = Integer.parseInt(answer.strip());
        if (number == 0) {
            done = true;
        } else {
            total += number;
        }
    }

    IO.println("Total: " + total);
}
```

The second answer keeps a flag, as the chapter's first re-prompt loop does, and lets the condition end the loop.

### mistake

The 0 is never tested, so the loop ends only when input runs out, and a number typed after the 0 is added too:

```java
void main() {
    int total = 0;

    while (true) {
        String answer = IO.readln("Enter a number (0 to stop): ");
        if (answer == null) {
            break;
        }
        total += Integer.parseInt(answer.strip());
    }

    IO.println("The total is " + total + ".");
}
```

`=` where `+=` belongs: each number replaces the total instead of adding to it, so the last one before the 0 is all that is left:

```java
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
        total = number;
    }

    IO.println("The total is " + total + ".");
}
```

## ch05-repetition#18

Try It 4: a right triangle of stars.

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

The inner loop's length depends on the outer loop's current row, which is what makes it a nested loop rather than two separate ones. `IO.print` keeps a row's stars on one line, and `IO.println()` ends the row.

```java
void main() {
    for (int row = 1; row <= 6; row++) {
        String line = "";
        for (int star = 0; star < row; star++) {
            line += "*";
        }
        IO.println(line);
    }
}
```

The second answer builds each row as a `String` first, the accumulator pattern for text, then prints it whole.

### mistake

`IO.println` in the inner loop puts every star on a line of its own:

```java
void main() {
    for (int row = 1; row <= 6; row++) {
        for (int star = 1; star <= row; star++) {
            IO.println("*");
        }
    }
}
```

`star < row` prints one star too few on every row, so the first row is empty and the longest has five:

```java
void main() {
    for (int row = 1; row <= 6; row++) {
        for (int star = 1; star < row; star++) {
            IO.print("*");
        }
        IO.println();
    }
}
```

## ch05-repetition#19

Try It 5: counting vowels.

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

`toLowerCase()` turns a capital `A` into `a` before the loop starts, so five tests catch every vowel, whatever its case. The condition is long enough to split over two lines; Java reads on to its closing parenthesis.

```java
void main() {
    String word = IO.readln("Word? ").strip();
    int count = 0;

    for (int i = 0; i < word.length(); i++) {
        char c = word.charAt(i);
        if (c == 'a' || c == 'A') {
            count++;
        } else if (c == 'e' || c == 'E') {
            count++;
        } else if (c == 'i' || c == 'I') {
            count++;
        } else if (c == 'o' || c == 'O') {
            count++;
        } else if (c == 'u' || c == 'U') {
            count++;
        }
    }

    IO.println(word + " has " + count + " vowels");
}
```

The second answer leaves the word as it was typed and tests each vowel in both cases, one `else if` per vowel.

### mistake

No `toLowerCase()`: a capital vowel is missed, so `Apple` has 1:

```java
void main() {
    String word = IO.readln("Enter a word: ").strip();
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

`<=` runs one position past the end, where `charAt` throws a `StringIndexOutOfBoundsException`:

```java
void main() {
    String word = IO.readln("Enter a word: ").strip().toLowerCase();
    int vowels = 0;

    for (int i = 0; i <= word.length(); i++) {
        char letter = word.charAt(i);
        if (letter == 'a' || letter == 'e' || letter == 'i'
                || letter == 'o' || letter == 'u') {
            vowels++;
        }
    }

    IO.println("Vowels: " + vowels);
}
```

## ch05-repetition#20

Try It 6: a guessing game.

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

The secret number is written into the code, not chosen at random: random numbers arrive in the chapter project, right after this exercise. A right guess ends the loop with `break`, and so does the end of input.

```java
void main() {
    int secret = 42;
    String answer = IO.readln("Your guess: ");

    while (answer != null) {
        int guess = Integer.parseInt(answer.strip());
        if (guess == secret) {
            IO.println("You got it!");
            break;
        }
        if (guess > secret) {
            IO.println("Too high, try again.");
        } else {
            IO.println("Too low, try again.");
        }
        answer = IO.readln("Your guess: ");
    }
}
```

The second answer asks once before the loop and again at the bottom of each pass, and lets `answer != null` end the loop when input runs out.

### mistake

The two messages the wrong way around, so a guess of 50 is called too low:

```java
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
            IO.println("Too high.");
        } else {
            IO.println("Too low.");
        }
    }
}
```

No loop: one guess, one answer, and the game is over:

```java
void main() {
    int secret = 42;
    int guess = Integer.parseInt(IO.readln("Guess a number: ").strip());

    if (guess == secret) {
        IO.println("You got it!");
    } else if (guess < secret) {
        IO.println("Too low.");
    } else {
        IO.println("Too high.");
    }
}
```

## ch05-repetition#21

Try It 7: a right prediction written another way (spaces at the end of the line and a blank line after it, which Check ignores).

```text
12   

```

### mistake

Forgetting what `continue` skips: 3 is added along with the rest.

```text
15
```

`continue` read as `break`: the loop stops at 3, after adding 1 and 2.

```text
3
```

## ch05-repetition-practice#1

```java
void main() {
    for (int week = 1; week <= 8; week++) {
        IO.println("Week " + week);
    }
}
```

`week = 1` and `week <= 8` give the eight weeks 1 to 8, from one `IO.println`. Starting at 0 would label the first week zero.

```java
void main() {
    int week = 0;
    while (week < 8) {
        week++;
        IO.println("Week " + week);
    }
}
```

The second answer counts with a `while`, adding one before it prints, so the first line is week 1.

### mistake

Starting at 0 with `< 8`: eight lines, from Week 0 to Week 7.

```java
void main() {
    for (int week = 0; week < 8; week++) {
        IO.println("Week " + week);
    }
}
```

## ch05-repetition-practice#2

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

`total` starts at 0 outside the loop and survives each pass. Created inside the loop, it would start again at 0 every week. A `double` prints with its decimal point, so 15 a week shows as `15.0`.

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("How much each week? ").strip());
    double saved = 0;
    int week = 1;

    while (week <= 8) {
        saved = saved + weekly;
        IO.println("After week " + week + " you have " + String.format("%.2f", saved));
        week++;
    }
}
```

The second answer counts the weeks with a `while` and shows each total to two decimal places.

### mistake

`total` created inside the loop starts again at 0 every week, so each line shows one week's amount:

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("Saving how much a week? ").strip());

    for (int week = 1; week <= 8; week++) {
        double total = 0;
        total += weekly;
        IO.println("Week " + week + ": " + total);
    }
}
```

## ch05-repetition-practice#3

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

`while (total < 240)` stops the moment the goal is met. Using `<=` keeps going for one more week after it is already reached.

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("Weekly amount? ").strip());
    double saved = 0;
    int week = 0;

    while (true) {
        if (saved >= 240) {
            break;
        }
        week++;
        saved += weekly;
    }

    IO.println("It takes " + week + " weeks.");
}
```

The second answer writes the goal test inside the loop, as a `break` at the top of each pass.

### mistake

`<=` where `<` belongs: at 15 a week the total is exactly 240 after week 16, and the loop saves one more week anyway.

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("Saving how much a week? ").strip());
    double total = 0;
    int weeks = 0;

    while (total <= 240) {
        total += weekly;
        weeks++;
    }

    IO.println("Weeks needed: " + weeks);
}
```

## ch05-repetition-practice#4

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

The `break` leaves the loop in the week the goal is met, and `reachedIn` keeps that week after the loop's own `week` is gone, so the report happens once, afterward. `reachedIn` stays 0 when the goal is never met, which is how the `if` after the loop tells the two endings apart.

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("Saving how much a week? ").strip());
    double total = 0;
    int weeks = 0;

    for (int week = 1; week <= 52; week++) {
        weeks++;
        total += weekly;
        if (total >= 240) {
            break;
        }
    }

    if (total >= 240) {
        IO.println("Reached in week " + weeks);
    } else {
        IO.println("Not this year");
    }
}
```

The second answer counts the weeks in a variable of its own and tests the total again after the loop to see which way it ended.

### mistake

No `break`: every week from the goal on overwrites `reachedIn`, so the loop runs all 52 weeks and reports week 52.

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("Saving how much a week? ").strip());
    double total = 0;
    int reachedIn = 0;

    for (int week = 1; week <= 52; week++) {
        total += weekly;
        if (total >= 240) {
            reachedIn = week;
        }
    }

    if (reachedIn > 0) {
        IO.println("Reached in week " + reachedIn);
    } else {
        IO.println("Not this year");
    }
}
```

`week < 52` is 51 weeks, so 4.62 a week, which reaches 240 only in week 52, says `Not this year`:

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("Saving how much a week? ").strip());
    double total = 0;
    int reachedIn = 0;

    for (int week = 1; week < 52; week++) {
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

## ch05-repetition-practice#5

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

`continue` skips the rest of this pass and moves on to the next week. `break` would end the loop entirely, which here means giving up in week 5.

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("Saving how much a week? ").strip());
    double total = 0;
    int week = 0;

    while (total < 240) {
        week++;
        if (week % 5 == 0) {
            continue;
        }
        total += weekly;
    }

    IO.println("Reached in week " + week);
}
```

The second answer counts the weeks itself in a `while` loop, adding one before the `continue`, so a skipped week still moves the count on.

### mistake

`break` where `continue` belongs: the loop ends in week 5, and nothing is printed.

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("Saving how much a week? ").strip());
    double total = 0;

    for (int week = 1; week < 200; week++) {
        if (week % 5 == 0) {
            break;
        }
        total += weekly;
        if (total >= 240) {
            IO.println("Reached in week " + week);
            break;
        }
    }
}
```

## ch05-repetition-practice#6

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

`week % 4 == 0` is every fourth week: 4, 8, 12. Comparing with 1 picks weeks 1, 5 and 9 instead, which pays the first bonus three weeks early.

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("Saving how much a week? ").strip());
    double total = 0;
    int week = 0;

    while (total < 240) {
        week++;
        total += weekly;
        if (week % 4 == 0) {
            total += 10;
        }
    }

    IO.println("Reached in week " + week);
}
```

The second answer uses a `while` loop whose condition is the goal itself.

### mistake

`week % 4 == 1` pays the bonus in weeks 1, 5 and 9. At 15 a week that still lands on week 14; at 9 a week it lands on week 21, not 22.

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("Saving how much a week? ").strip());
    double total = 0;

    for (int week = 1; week < 200; week++) {
        total += weekly;
        if (week % 4 == 1) {
            total += 10;
        }
        if (total >= 240) {
            IO.println("Reached in week " + week);
            break;
        }
    }
}
```

## ch05-repetition-practice#7

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

The deposit goes in first, then `total *= 1.01` adds one percent of the new balance. Doing it the other way around pays nothing on the money just paid in.

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("Saving how much a week? ").strip());
    double total = 0;
    int week = 0;

    while (total < 240) {
        week++;
        total = (total + weekly) * 1.01;
    }

    IO.println("Reached in week " + week);
}
```

The second answer does the deposit and the interest in one line, the deposit inside the parentheses so it is added first.

### mistake

Interest before the deposit: each week's deposit earns nothing until the week after, so 3 a week takes until week 60.

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("Saving how much a week? ").strip());
    double total = 0;

    for (int week = 1; week < 200; week++) {
        total *= 1.01;
        total += weekly;
        if (total >= 240) {
            IO.println("Reached in week " + week);
            break;
        }
    }
}
```

## ch05-repetition-practice#8

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

Nothing new, only assembly: the first loop prints the eight balances, then `total` goes back to 0 for the second, which skips every fifth week and pays the bonus every fourth. The bonus and the skipped weeks pull in opposite directions, and together they land on week 17 rather than either answer on its own.

```java
// Prints eight balances, then finds the goal week with the bonus and the skipped weeks.

void main() {
    double weekly = Double.parseDouble(IO.readln("Weekly amount? ").strip());

    double balance = 0;
    int week = 1;
    while (week <= 8) {
        balance += weekly;
        IO.println("Week " + week + ": " + String.format("%.2f", balance));
        week++;
    }

    double saved = 0;
    int goalWeek = 0;
    while (saved < 240) {
        goalWeek++;
        if (goalWeek % 5 == 0) {
            continue;
        }
        saved += weekly;
        if (goalWeek % 4 == 0) {
            saved += 10;
        }
    }
    IO.println("Goal: week " + goalWeek);
}
```

The second answer keeps the two parts in two variables of their own, so neither has to be set back to 0, and lets the goal end its `while` loop.

### mistake

`total` not set back to 0: the second loop starts from week 8's balance, so the goal comes far too soon.

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("Saving how much a week? ").strip());
    double total = 0;

    for (int week = 1; week <= 8; week++) {
        total += weekly;
        IO.println("Week " + week + ": " + total);
    }

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

The two loops without the skipped weeks: the bonus alone gets there in week 14.

```java
void main() {
    double weekly = Double.parseDouble(IO.readln("Saving how much a week? ").strip());
    double total = 0;

    for (int week = 1; week <= 8; week++) {
        total += weekly;
        IO.println("Week " + week + ": " + total);
    }

    total = 0;
    for (int week = 1; week < 200; week++) {
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

## ch06-methods#17

Try It 1: `isEven`, then the even numbers from 1 to 20.

```java
// Prints the even numbers from 1 to 20, asking isEven about each.

boolean isEven(int n) {
    return n % 2 == 0;
}

void main() {
    for (int i = 1; i <= 20; i++) {
        if (isEven(i)) {
            IO.println(i);
        }
    }
}
```

`n % 2 == 0` is already a `boolean`, `true` or `false`, so the method can return the comparison itself. `main` asks `isEven` about each number from 1 to 20 and prints the ones it says yes to.

```java
boolean isEven(int n) {
    if (n % 2 == 0) {
        return true;
    } else {
        return false;
    }
}

void main() {
    int number = 1;
    while (number <= 20) {
        if (isEven(number)) {
            IO.println(number);
        }
        number++;
    }
}
```

The second answer spells the decision out with `if` and `else`, one `return` on each side, and counts with a `while` loop.

### mistake

`n % 2 != 1` looks like the same test, but in Java the remainder of a negative odd number is -1, not 1, so `isEven(-3)` says `true`:

```java
boolean isEven(int n) {
    return n % 2 != 1;
}

void main() {
    for (int i = 1; i <= 20; i++) {
        if (isEven(i)) {
            IO.println(i);
        }
    }
}
```

The test the wrong way around, which answers whether `n` is odd:

```java
boolean isEven(int n) {
    return n % 2 == 1;
}

void main() {
    for (int i = 1; i <= 20; i++) {
        if (isEven(i)) {
            IO.println(i);
        }
    }
}
```

## ch06-methods#18

Try It 2: the body mass index, to one decimal place.

```java
/// Returns the body mass index, rounded to one decimal place.
double bmi(double weightKg, double heightM) {
    return Math.round(weightKg / (heightM * heightM) * 10) / 10.0;
}

void main() {
    IO.println(bmi(70, 1.75));
}
```

The parentheses around `heightM * heightM` make Java square the height before it divides. Then Chapter 3's rounding: times 10, `Math.round`, and divided by `10.0`, a `double`, so the answer keeps its decimal place.

```java
double bmi(double weightKg, double heightM) {
    double index = weightKg / Math.pow(heightM, 2);
    return Math.round(index * 10) / 10.0;
}

void main() {
    IO.println(bmi(90, 1.8));
}
```

The second answer squares the height with `Math.pow` and rounds on a line of its own.

### mistake

No rounding: `bmi(70, 1.75)` returns 22.857142857142858, not 22.9.

```java
double bmi(double weightKg, double heightM) {
    return weightKg / (heightM * heightM);
}

void main() {
    IO.println(bmi(70, 1.75));
}
```

Dividing by `10` instead of `10.0`: `Math.round` gives a `long`, and a `long` divided by an `int` drops the fraction, so the answer is 22.0.

```java
double bmi(double weightKg, double heightM) {
    return Math.round(weightKg / (heightM * heightM) * 10) / 10;
}

void main() {
    IO.println(bmi(70, 1.75));
}
```

No parentheses: `weightKg / heightM * heightM` divides by the height and then multiplies by it again, which gives the weight back.

```java
double bmi(double weightKg, double heightM) {
    return Math.round(weightKg / heightM * heightM * 10) / 10.0;
}

void main() {
    IO.println(bmi(70, 1.75));
}
```

## ch06-methods#19

Try It 3: the largest of three numbers, without `Math.max`.

```java
int largestOfThree(int a, int b, int c) {
    if (a >= b && a >= c) {
        return a;
    } else if (b >= c) {
        return b;
    } else {
        return c;
    }
}

void main() {
    IO.println(largestOfThree(3, 9, 5));
}
```

`a` wins when it is at least as large as both of the others. Otherwise the largest is `b` or `c`, and one more comparison settles which. `>=` rather than `>` matters when two numbers tie for the largest: with `>`, `7, 7, 2` would fall through to the `else` and return 2.

```java
int largestOfThree(int a, int b, int c) {
    int largest = a;
    if (b > largest) {
        largest = b;
    }
    if (c > largest) {
        largest = c;
    }
    return largest;
}

void main() {
    IO.println(largestOfThree(-1, -5, -3));
}
```

The second answer keeps the largest so far, as Chapter 5's loop did, starting from the first number rather than from 0.

### mistake

`>` where `>=` belongs: when `a` and `b` tie for the largest, neither test is true, and `largestOfThree(7, 7, 2)` returns 2.

```java
int largestOfThree(int a, int b, int c) {
    if (a > b && a > c) {
        return a;
    } else if (b > a && b > c) {
        return b;
    } else {
        return c;
    }
}

void main() {
    IO.println(largestOfThree(7, 7, 2));
}
```

Starting the largest at 0: when all three are negative, none is larger than 0, so the answer is 0.

```java
int largestOfThree(int a, int b, int c) {
    int largest = 0;
    if (a > largest) {
        largest = a;
    }
    if (b > largest) {
        largest = b;
    }
    if (c > largest) {
        largest = c;
    }
    return largest;
}

void main() {
    IO.println(largestOfThree(-1, -5, -3));
}
```

`a` returned as soon as it beats `b`, without asking about `c`: `largestOfThree(5, 3, 9)` returns 5.

```java
int largestOfThree(int a, int b, int c) {
    if (a > b) {
        return a;
    } else if (b > c) {
        return b;
    } else {
        return c;
    }
}

void main() {
    IO.println(largestOfThree(5, 3, 9));
}
```

## ch06-methods#20

Try It 4: counting vowels.

```java
int countVowels(String word) {
    String lower = word.toLowerCase();
    int vowels = 0;
    for (int i = 0; i < lower.length(); i++) {
        char letter = lower.charAt(i);
        if (letter == 'a' || letter == 'e' || letter == 'i'
                || letter == 'o' || letter == 'u') {
            vowels++;
        }
    }
    return vowels;
}

void main() {
    IO.println(countVowels("banana"));
}
```

Chapter 5's vowel loop, moved into a method: `toLowerCase()` turns a capital `O` into `o` before the loop starts, so the five tests catch every vowel, whatever its case. The count starts at 0, every vowel adds one, and `return vowels;` hands the total back instead of printing it. An empty word never enters the loop, so it has 0 vowels.

```java
boolean isVowel(char letter) {
    return letter == 'a' || letter == 'e' || letter == 'i' || letter == 'o' || letter == 'u';
}

int countVowels(String word) {
    word = word.toLowerCase();
    int count = 0;
    int position = 0;
    while (position < word.length()) {
        if (isVowel(word.charAt(position))) {
            count++;
        }
        position++;
    }
    return count;
}

void main() {
    IO.println(countVowels("Ocean"));
}
```

The second answer gives the vowel test a method of its own, `isVowel`, replaces the parameter `word` with its lowercase copy, so `isVowel` only ever sees lowercase letters, and walks the word with a `while` loop.

### mistake

No `toLowerCase()`: a capital vowel is missed, so `countVowels("Ocean")` is 2:

```java
int countVowels(String word) {
    int vowels = 0;
    for (int i = 0; i < word.length(); i++) {
        char letter = word.charAt(i);
        if (letter == 'a' || letter == 'e' || letter == 'i'
                || letter == 'o' || letter == 'u') {
            vowels++;
        }
    }
    return vowels;
}

void main() {
    IO.println(countVowels("Ocean"));
}
```

`u` left out of the test, so `countVowels("queue")` is 2:

```java
int countVowels(String word) {
    String lower = word.toLowerCase();
    int vowels = 0;
    for (int i = 0; i < lower.length(); i++) {
        char letter = lower.charAt(i);
        if (letter == 'a' || letter == 'e' || letter == 'i' || letter == 'o') {
            vowels++;
        }
    }
    return vowels;
}

void main() {
    IO.println(countVowels("queue"));
}
```

`<=` runs one position past the end, where `charAt` throws a `StringIndexOutOfBoundsException`:

```java
int countVowels(String word) {
    String lower = word.toLowerCase();
    int vowels = 0;
    for (int i = 0; i <= lower.length(); i++) {
        char letter = lower.charAt(i);
        if (letter == 'a' || letter == 'e' || letter == 'i'
                || letter == 'o' || letter == 'u') {
            vowels++;
        }
    }
    return vowels;
}

void main() {
    IO.println(countVowels("banana"));
}
```

Starting at position 1 skips the first letter, which only matters when it is a vowel: `countVowels("idea")` is 2.

```java
int countVowels(String word) {
    String lower = word.toLowerCase();
    int vowels = 0;
    for (int i = 1; i < lower.length(); i++) {
        char letter = lower.charAt(i);
        if (letter == 'a' || letter == 'e' || letter == 'i'
                || letter == 'o' || letter == 'u') {
            vowels++;
        }
    }
    return vowels;
}

void main() {
    IO.println(countVowels("idea"));
}
```

## ch06-methods#21

Try It 5: `isPrime`, then every prime under 50.

```java
// Prints every prime under 50, asking isPrime about each number.

boolean isPrime(int n) {
    if (n < 2) {
        return false;
    }
    for (int divisor = 2; divisor < n; divisor++) {
        if (n % divisor == 0) {
            return false;
        }
    }
    return true;
}

void main() {
    for (int n = 1; n < 50; n++) {
        if (isPrime(n)) {
            IO.println(n);
        }
    }
}
```

The special case comes first: nothing below 2 is prime. Then the loop tries every divisor from 2 up to `n - 1`, and the first one that divides evenly ends the method with `false`. Only a number that survives the whole loop reaches `return true;`.

```java
boolean isPrime(int n) {
    if (n <= 1) {
        return false;
    }
    int divisor = 2;
    while (divisor * divisor <= n) {
        if (n % divisor == 0) {
            return false;
        }
        divisor++;
    }
    return true;
}

void main() {
    int n = 2;
    while (n < 50) {
        if (isPrime(n)) {
            IO.println(n);
        }
        n++;
    }
}
```

The second answer stops at the square root: if `n` has a divisor larger than its square root, it also has one smaller, which the loop has already tried.

### mistake

Trying only 2 and 3 as divisors gets every number below 25 right, but calls 25, which is 5 times 5, prime:

```java
boolean isPrime(int n) {
    if (n < 2) {
        return false;
    }
    if (n == 2 || n == 3) {
        return true;
    }
    return n % 2 != 0 && n % 3 != 0;
}

void main() {
    IO.println(isPrime(25));
}
```

`return true;` in an `else` inside the loop decides after the first divisor alone, so 9, which 2 does not divide, is called prime:

```java
boolean isPrime(int n) {
    if (n < 2) {
        return false;
    }
    for (int divisor = 2; divisor < n; divisor++) {
        if (n % divisor == 0) {
            return false;
        } else {
            return true;
        }
    }
    return true;
}

void main() {
    IO.println(isPrime(9));
}
```

No special case for numbers below 2: the loop never runs for 1 or 0, so both reach `return true;`.

```java
boolean isPrime(int n) {
    for (int divisor = 2; divisor < n; divisor++) {
        if (n % divisor == 0) {
            return false;
        }
    }
    return true;
}

void main() {
    IO.println(isPrime(1));
}
```

Only 1 kept out: the loop never runs for 0, so 0 is called prime, though the definition starts above 1.

```java
boolean isPrime(int n) {
    if (n == 1) {
        return false;
    }
    for (int divisor = 2; divisor < n; divisor++) {
        if (n % divisor == 0) {
            return false;
        }
    }
    return true;
}

void main() {
    IO.println(isPrime(0));
}
```

Stopping at `divisor < n / 2` leaves out half the number itself, so for 4 the loop never tries 2:

```java
boolean isPrime(int n) {
    if (n < 2) {
        return false;
    }
    for (int divisor = 2; divisor < n / 2; divisor++) {
        if (n % divisor == 0) {
            return false;
        }
    }
    return true;
}

void main() {
    IO.println(isPrime(4));
}
```

`divisor <= n` tries `n` itself, which always divides evenly, so no number is prime:

```java
boolean isPrime(int n) {
    if (n < 2) {
        return false;
    }
    for (int divisor = 2; divisor <= n; divisor++) {
        if (n % divisor == 0) {
            return false;
        }
    }
    return true;
}

void main() {
    IO.println(isPrime(13));
}
```

## ch06-methods#22

Try It 6: a right prediction written another way (spaces at the end of the line and a blank line after it, which Check ignores).

```text
5   

```

### mistake

Expecting `addTen` to change `x`: it changes only its own copy, `n`.

```text
15
```

## ch06-methods-practice#1

```java
double cToF(double celsius) {
    return Math.round((celsius * 9 / 5 + 32) * 10) / 10.0;
}

void main() {
    IO.println(cToF(100));
    IO.println(cToF(0));
}
```

Multiply first, then add 32, then round. `celsius` is a `double`, so `celsius * 9 / 5` keeps its fraction all the way through. Adding first is the classic way to get this wrong, and it even looks right at a glance.

```java
double cToF(double celsius) {
    double fahrenheit = celsius * 1.8 + 32;
    return Math.round(fahrenheit * 10) / 10.0;
}

void main() {
    IO.println(cToF(37));
}
```

The second answer multiplies by 1.8 and rounds on a line of its own.

### mistake

Adding 32 before multiplying:

```java
double cToF(double celsius) {
    return Math.round((celsius + 32) * 9 / 5 * 10) / 10.0;
}

void main() {
    IO.println(cToF(100));
}
```

`9 / 5` first: two `int`s, so it is 1, and 100 comes out as 132.

```java
double cToF(double celsius) {
    return Math.round((9 / 5 * celsius + 32) * 10) / 10.0;
}

void main() {
    IO.println(cToF(100));
}
```

No rounding: 36.6 comes out as 97.88000000000001, not 97.9.

```java
double cToF(double celsius) {
    return celsius * 9 / 5 + 32;
}

void main() {
    IO.println(cToF(36.6));
}
```

## ch06-methods-practice#2

```java
double fToC(double fahrenheit) {
    return Math.round((fahrenheit - 32) * 5 / 9 * 10) / 10.0;
}

void main() {
    IO.println(fToC(212));
    IO.println(fToC(32));
}
```

Going back the other way means subtracting first and turning the fraction upside down. -40 is the temperature where the two scales meet.

```java
double fToC(double fahrenheit) {
    double celsius = (fahrenheit - 32) / 1.8;
    return Math.round(celsius * 10) / 10.0;
}

void main() {
    IO.println(fToC(98.6));
}
```

The second answer divides by 1.8 instead of multiplying by 5 and dividing by 9.

### mistake

No parentheses: `32 * 5 / 9` is worked out first, as `int`s, so the method takes 17 from the temperature and nothing else.

```java
double fToC(double fahrenheit) {
    return Math.round((fahrenheit - 32 * 5 / 9) * 10) / 10.0;
}

void main() {
    IO.println(fToC(212));
}
```

The fraction the right way up for the other direction:

```java
double fToC(double fahrenheit) {
    return Math.round((fahrenheit - 32) * 9 / 5 * 10) / 10.0;
}

void main() {
    IO.println(fToC(212));
}
```

No rounding: 100 comes out as 37.77777777777778, not 37.8.

```java
double fToC(double fahrenheit) {
    return (fahrenheit - 32) * 5 / 9;
}

void main() {
    IO.println(fToC(100));
}
```

## ch06-methods-practice#3

```java
double kmToMiles(double km) {
    return Math.round(km * 0.621371 * 100) / 100.0;
}

void main() {
    IO.println(kmToMiles(10));
}
```

A mile is longer than a kilometer, so the number gets smaller. Dividing by 0.621371 gives 1.61 for one kilometer, which is the answer to the opposite question.

```java
double kmToMiles(double km) {
    double miles = km / 1.609344;
    return Math.round(miles * 100) / 100.0;
}

void main() {
    IO.println(kmToMiles(42.195));
}
```

The second answer divides by 1.609344, the number of kilometers in a mile, which is the same conversion from the other side.

### mistake

Dividing where multiplying belongs:

```java
double kmToMiles(double km) {
    return Math.round(km / 0.621371 * 100) / 100.0;
}

void main() {
    IO.println(kmToMiles(10));
}
```

Rounded to one place instead of two: 10 kilometers comes out as 6.2.

```java
double kmToMiles(double km) {
    return Math.round(km * 0.621371 * 10) / 10.0;
}

void main() {
    IO.println(kmToMiles(10));
}
```

## ch06-methods-practice#4

```java
double cupsToMl(double cups) {
    return Math.round(cups * 236.588 * 10) / 10.0;
}

void main() {
    IO.println(cupsToMl(1));
}
```

A cup is not 250 ml, however tempting the round number is. The error is small per cup and ruins bread at three.

```java
double cupsToMl(double cups) {
    double milliliters = cups * 236.588;
    return Math.round(milliliters * 10) / 10.0;
}

void main() {
    IO.println(cupsToMl(3));
}
```

The second answer gives the unrounded amount a name before rounding it.

### mistake

The tempting round number:

```java
double cupsToMl(double cups) {
    return cups * 250;
}

void main() {
    IO.println(cupsToMl(1));
}
```

No rounding: one cup comes out as 236.588.

```java
double cupsToMl(double cups) {
    return cups * 236.588;
}

void main() {
    IO.println(cupsToMl(1));
}
```

## ch06-methods-practice#5

```java
double cToF(double celsius) {
    return Math.round((celsius * 9 / 5 + 32) * 10) / 10.0;
}

int ovenSetting(double celsius) {
    return (int) Math.round(cToF(celsius) / 25) * 25;
}

void main() {
    IO.println(ovenSetting(180));
}
```

Dividing by 25, rounding, then multiplying back is how you snap a number to a step of any size. Calling `cToF` means the conversion lives in one place. The `(int)` cast applies to `Math.round`'s answer, before the `* 25`.

```java
double cToF(double celsius) {
    return Math.round((celsius * 9 / 5 + 32) * 10) / 10.0;
}

int ovenSetting(double celsius) {
    int fahrenheit = (int) Math.round(cToF(celsius));
    return (fahrenheit + 12) / 25 * 25;
}

void main() {
    IO.println(ovenSetting(200));
}
```

The second answer rounds with whole numbers: adding 12, just under half of 25, before the integer division makes it round to the nearest step rather than down.

### mistake

The cast on the division instead of `Math.round`: `(int)` drops the fraction, so 392 goes down to 375 rather than up to 400.

```java
double cToF(double celsius) {
    return Math.round((celsius * 9 / 5 + 32) * 10) / 10.0;
}

int ovenSetting(double celsius) {
    return (int) (cToF(celsius) / 25) * 25;
}

void main() {
    IO.println(ovenSetting(200));
}
```

Rounding the Celsius temperature and never converting it: 180 becomes 175.

```java
int ovenSetting(double celsius) {
    return (int) Math.round(celsius / 25) * 25;
}

void main() {
    IO.println(ovenSetting(180));
}
```

## ch06-methods-practice#6

```java
int hoursIn(int totalMinutes) {
    return totalMinutes / 60;
}

int minutesLeft(int totalMinutes) {
    return totalMinutes % 60;
}

void main() {
    IO.println("90 minutes is " + hoursIn(90) + " h " + minutesLeft(90) + " min");
    IO.println("45 minutes is " + hoursIn(45) + " h " + minutesLeft(45) + " min");
    IO.println("125 minutes is " + hoursIn(125) + " h " + minutesLeft(125) + " min");
}
```

Two answers, so two methods, one value each. Hours come from `/` and minutes from `%`, and swapping them is silent until the numbers happen to differ.

```java
int hoursIn(int totalMinutes) {
    return totalMinutes / 60;
}

int minutesLeft(int totalMinutes) {
    return totalMinutes - hoursIn(totalMinutes) * 60;
}

void showTime(int totalMinutes) {
    IO.println(totalMinutes + " minutes is " + hoursIn(totalMinutes) + " h " + minutesLeft(totalMinutes) + " min");
}

void main() {
    showTime(90);
    showTime(45);
    showTime(125);
}
```

The second answer works out the minutes left by taking away the whole hours, and gives the printing a `void` method of its own, so each line is one call.

### mistake

`/` and `%` swapped: 90 minutes is 30 h 1 min.

```java
int hoursIn(int totalMinutes) {
    return totalMinutes % 60;
}

int minutesLeft(int totalMinutes) {
    return totalMinutes / 60;
}

void main() {
    IO.println("90 minutes is " + hoursIn(90) + " h " + minutesLeft(90) + " min");
    IO.println("45 minutes is " + hoursIn(45) + " h " + minutesLeft(45) + " min");
    IO.println("125 minutes is " + hoursIn(125) + " h " + minutesLeft(125) + " min");
}
```

A copied line left unchanged: the third line asks about 90 minutes again.

```java
int hoursIn(int totalMinutes) {
    return totalMinutes / 60;
}

int minutesLeft(int totalMinutes) {
    return totalMinutes % 60;
}

void main() {
    IO.println("90 minutes is " + hoursIn(90) + " h " + minutesLeft(90) + " min");
    IO.println("45 minutes is " + hoursIn(45) + " h " + minutesLeft(45) + " min");
    IO.println("125 minutes is " + hoursIn(90) + " h " + minutesLeft(90) + " min");
}
```

## ch06-methods-practice#7

```java
double scaleRecipe(double amount, double factor) {
    return Math.round(amount * factor * 100) / 100.0;
}

void main() {
    IO.println(scaleRecipe(200, 0.5));
}
```

Two parameters, in the order the name suggests. Scaling by 1 should give the amount back, which is a quick way to check you have not mixed them up.

```java
double scaleRecipe(double amount, double factor) {
    double scaled = amount * factor;
    return Math.round(scaled * 100) / 100.0;
}

void main() {
    IO.println(scaleRecipe(1.5, 3));
}
```

The second answer names the scaled amount before rounding it.

### mistake

No rounding: 2 cups scaled by 0.333, a third, comes out as 0.666, not 0.67.

```java
double scaleRecipe(double amount, double factor) {
    return amount * factor;
}

void main() {
    IO.println(scaleRecipe(2, 0.333));
}
```

Rounded to one place instead of two: the same third comes out as 0.7.

```java
double scaleRecipe(double amount, double factor) {
    return Math.round(amount * factor * 10) / 10.0;
}

void main() {
    IO.println(scaleRecipe(2, 0.333));
}
```

Dividing by the factor: half a recipe comes out double.

```java
double scaleRecipe(double amount, double factor) {
    return Math.round(amount / factor * 100) / 100.0;
}

void main() {
    IO.println(scaleRecipe(200, 0.5));
}
```

## ch06-methods-practice#8

```java
// A small conversion table, from three methods.

double cToF(double celsius) {
    return Math.round((celsius * 9 / 5 + 32) * 10) / 10.0;
}

double kmToMiles(double km) {
    return Math.round(km * 0.621371 * 100) / 100.0;
}

double cupsToMl(double cups) {
    return Math.round(cups * 236.588 * 10) / 10.0;
}

void main() {
    IO.println("180 C is " + cToF(180) + " F");
    IO.println("5 km is " + kmToMiles(5) + " miles");
    IO.println("2 cups is " + cupsToMl(2) + " ml");
}
```

Three methods declared once and called once each. The program reads as the table it prints, which is the whole point of giving the arithmetic a name.

```java
double cToF(double celsius) {
    double fahrenheit = celsius * 1.8 + 32;
    return Math.round(fahrenheit * 10) / 10.0;
}

double kmToMiles(double km) {
    double miles = km / 1.609344;
    return Math.round(miles * 100) / 100.0;
}

double cupsToMl(double cups) {
    double milliliters = cups * 236.588;
    return Math.round(milliliters * 10) / 10.0;
}

void main() {
    double oven = cToF(180);
    double run = kmToMiles(5);
    double flour = cupsToMl(2);

    IO.println("180 C is " + oven + " F");
    IO.println("5 km is " + run + " miles");
    IO.println("2 cups is " + flour + " ml");
}
```

The second answer uses the second style of each method, and stores the three answers before printing them.

### mistake

`cupsToMl` without its rounding: 2 cups comes out as 473.176 ml.

```java
double cToF(double celsius) {
    return Math.round((celsius * 9 / 5 + 32) * 10) / 10.0;
}

double kmToMiles(double km) {
    return Math.round(km * 0.621371 * 100) / 100.0;
}

double cupsToMl(double cups) {
    return cups * 236.588;
}

void main() {
    IO.println("180 C is " + cToF(180) + " F");
    IO.println("5 km is " + kmToMiles(5) + " miles");
    IO.println("2 cups is " + cupsToMl(2) + " ml");
}
```

`kmToMiles` rounded to one place: 5 km is 3.1 miles.

```java
double cToF(double celsius) {
    return Math.round((celsius * 9 / 5 + 32) * 10) / 10.0;
}

double kmToMiles(double km) {
    return Math.round(km * 0.621371 * 10) / 10.0;
}

double cupsToMl(double cups) {
    return Math.round(cups * 236.588 * 10) / 10.0;
}

void main() {
    IO.println("180 C is " + cToF(180) + " F");
    IO.println("5 km is " + kmToMiles(5) + " miles");
    IO.println("2 cups is " + cupsToMl(2) + " ml");
}
```

## ch07-arrays-and-lists#23

Try It 1: the total, average, largest and smallest of ten numbers.

```java
// The total, average, largest and smallest of ten numbers.

void main() {
    int[] numbers = {88, 92, 79, 95, 60, 73, 85, 91, 68, 77};

    int total = 0;
    int largest = numbers[0];
    int smallest = numbers[0];
    for (int number : numbers) {
        total += number;
        if (number > largest) {
            largest = number;
        }
        if (number < smallest) {
            smallest = number;
        }
    }

    IO.println("Total: " + total);
    IO.println("Average: " + ((double) total / numbers.length));
    IO.println("Largest: " + largest);
    IO.println("Smallest: " + smallest);
}
```

One pass over the array does all three jobs, as in the chapter's totals program. `largest` and `smallest` both start from the first number, never from 0, and the `(double)` cast keeps the average's fraction: 808 divided by 10 is 80.8, where two `int`s would give 80.

```java
void main() {
    int[] numbers = {88, 92, 79, 95, 60, 73, 85, 91, 68, 77};

    int total = 0;
    for (int i = 0; i < numbers.length; i++) {
        total += numbers[i];
    }

    int largest = numbers[0];
    int smallest = numbers[0];
    for (int i = 1; i < numbers.length; i++) {
        if (numbers[i] > largest) {
            largest = numbers[i];
        }
        if (numbers[i] < smallest) {
            smallest = numbers[i];
        }
    }

    double average = (double) total / numbers.length;
    IO.println("Total: " + total);
    IO.println(String.format("Average: %.1f", average));
    IO.println("Largest: " + largest);
    IO.println("Smallest: " + smallest);
}
```

The second answer uses counting loops, two of them, the second starting at index 1 since index 0 is already the first guess, and formats the average with `String.format`.

### mistake

Dividing two `int`s: the average comes out as 80, not 80.8.

```java
void main() {
    int[] numbers = {88, 92, 79, 95, 60, 73, 85, 91, 68, 77};

    int total = 0;
    int largest = numbers[0];
    int smallest = numbers[0];
    for (int number : numbers) {
        total += number;
        if (number > largest) {
            largest = number;
        }
        if (number < smallest) {
            smallest = number;
        }
    }

    IO.println("Total: " + total);
    IO.println("Average: " + (total / numbers.length));
    IO.println("Largest: " + largest);
    IO.println("Smallest: " + smallest);
}
```

Starting the smallest at 0: no number is below 0, so the smallest comes out as 0.

```java
void main() {
    int[] numbers = {88, 92, 79, 95, 60, 73, 85, 91, 68, 77};

    int total = 0;
    int largest = 0;
    int smallest = 0;
    for (int number : numbers) {
        total += number;
        if (number > largest) {
            largest = number;
        }
        if (number < smallest) {
            smallest = number;
        }
    }

    IO.println("Total: " + total);
    IO.println("Average: " + ((double) total / numbers.length));
    IO.println("Largest: " + largest);
    IO.println("Smallest: " + smallest);
}
```

## ch07-arrays-and-lists#24

Try It 2: five words in alphabetical order.

```java
// Sorts five words the user types.

void main() {
    ArrayList<String> words = new ArrayList<>();

    for (int i = 0; i < 5; i++) {
        String word = IO.readln("Word " + (i + 1) + ": ");
        if (word == null) {
            break;
        }
        words.add(word.strip());
    }

    Collections.sort(words);
    for (String word : words) {
        IO.println(word);
    }
}
```

An `ArrayList` starts empty and takes each word as it comes, and `Collections.sort` puts them in order once all five are in. As in every loop that reads, a `null` answer ends the loop early. Words typed with capitals sort before lowercase ones, in Chapter 3's character-code order.

```java
void main() {
    ArrayList<String> words = new ArrayList<>();

    while (words.size() < 5) {
        String word = IO.readln("Next word: ");
        if (word == null) {
            break;
        }
        words.add(word.strip());
    }

    Collections.sort(words);
    IO.println(words);
}
```

The second answer loops until the list holds five words, and prints the sorted list in one line.

### mistake

No sort: the words come out in the order they were typed.

```java
void main() {
    ArrayList<String> words = new ArrayList<>();

    for (int i = 0; i < 5; i++) {
        String word = IO.readln("Word " + (i + 1) + ": ");
        if (word == null) {
            break;
        }
        words.add(word.strip());
    }

    for (String word : words) {
        IO.println(word);
    }
}
```

Counting from 1 but stopping before 5: the loop asks for only four words, so the fifth never arrives.

```java
void main() {
    ArrayList<String> words = new ArrayList<>();

    for (int i = 1; i < 5; i++) {
        String word = IO.readln("Word " + i + ": ");
        if (word == null) {
            break;
        }
        words.add(word.strip());
    }

    Collections.sort(words);
    for (String word : words) {
        IO.println(word);
    }
}
```

## ch07-arrays-and-lists#25

Try It 3: `countAbove`.

```java
int countAbove(int[] numbers, int threshold) {
    int count = 0;
    for (int number : numbers) {
        if (number > threshold) {
            count++;
        }
    }
    return count;
}

void main() {
    int[] scores = {88, 92, 45, 95, 58, 71};
    IO.println(countAbove(scores, 80));
}
```

A counter that starts at 0 and goes up by one for each number above the threshold. "Greater than" is `>`: a number equal to the threshold does not count, so three 3s are not above 3. An empty array never enters the loop and counts 0.

```java
int countAbove(int[] numbers, int threshold) {
    int count = 0;
    for (int i = 0; i < numbers.length; i++) {
        if (numbers[i] > threshold) {
            count += 1;
        }
    }
    return count;
}

void main() {
    IO.println(countAbove(new int[] {-5, 0, 5}, -1));
}
```

The second answer walks the indexes with a counting loop.

### mistake

`>=` where `>` belongs: three 3s count as above 3.

```java
int countAbove(int[] numbers, int threshold) {
    int count = 0;
    for (int number : numbers) {
        if (number >= threshold) {
            count++;
        }
    }
    return count;
}

void main() {
    IO.println(countAbove(new int[] {3, 3, 3}, 3));
}
```

A counting loop that starts at index 1 skips the first number, which only matters when it is above the threshold: `{10, 2, 3}` above 5 counts 0.

```java
int countAbove(int[] numbers, int threshold) {
    int count = 0;
    for (int i = 1; i < numbers.length; i++) {
        if (numbers[i] > threshold) {
            count++;
        }
    }
    return count;
}

void main() {
    IO.println(countAbove(new int[] {10, 2, 3}, 5));
}
```

## ch07-arrays-and-lists#26

Try It 4: the even numbers, in a new list.

```java
// Keeps the even numbers from an array, in a new list.

void main() {
    int[] numbers = {3, 8, 15, 22, 41, 56, 7, 10};
    ArrayList<Integer> evens = new ArrayList<>();

    for (int number : numbers) {
        if (number % 2 == 0) {
            evens.add(number);
        }
    }

    IO.println(evens);
}
```

The chapter's filtering loop: the list starts empty and the `if` decides what gets added. A number is even when dividing it by 2 leaves no remainder, Chapter 3's `% 2 == 0`.

```java
void main() {
    int[] numbers = {3, 8, 15, 22, 41, 56, 7, 10};
    ArrayList<Integer> evens = new ArrayList<>();

    for (int i = 0; i < numbers.length; i++) {
        if (numbers[i] % 2 == 0) {
            evens.add(numbers[i]);
        }
    }

    IO.println(evens);
}
```

The second answer walks the indexes with a counting loop.

### mistake

The test the wrong way around, which keeps the odd numbers:

```java
void main() {
    int[] numbers = {3, 8, 15, 22, 41, 56, 7, 10};
    ArrayList<Integer> evens = new ArrayList<>();

    for (int number : numbers) {
        if (number % 2 == 1) {
            evens.add(number);
        }
    }

    IO.println(evens);
}
```

Printing each even number as it is found, instead of building the list and printing it:

```java
void main() {
    int[] numbers = {3, 8, 15, 22, 41, 56, 7, 10};

    for (int number : numbers) {
        if (number % 2 == 0) {
            IO.println(number);
        }
    }
}
```

## ch07-arrays-and-lists#27

Try It 5: a reversed copy, without `Collections.reverse`.

```java
// Builds a reversed copy of an array by walking it backward.

void main() {
    int[] original = {1, 2, 3, 4, 5};
    ArrayList<Integer> reversed = new ArrayList<>();

    for (int i = original.length - 1; i >= 0; i--) {
        reversed.add(original[i]);
    }

    IO.println(reversed);
}
```

The loop walks the indexes backward, from the last, `length - 1`, down to 0, and adds each item to the end of the new list. `i >= 0` keeps index 0 in: the loop stops only once `i` has gone below it.

```java
void main() {
    int[] original = {1, 2, 3, 4, 5};
    ArrayList<Integer> reversed = new ArrayList<>();

    for (int number : original) {
        reversed.add(0, number);
    }

    IO.println(reversed);
}
```

The second answer walks forward and inserts each item at the front, so the last one in ends up first.

### mistake

`i > 0` stops before index 0, so the 1 is left out:

```java
void main() {
    int[] original = {1, 2, 3, 4, 5};
    ArrayList<Integer> reversed = new ArrayList<>();

    for (int i = original.length - 1; i > 0; i--) {
        reversed.add(original[i]);
    }

    IO.println(reversed);
}
```

Starting at `original.length`, one past the last index: the first pass stops the program with an exception.

```java
void main() {
    int[] original = {1, 2, 3, 4, 5};
    ArrayList<Integer> reversed = new ArrayList<>();

    for (int i = original.length; i >= 0; i--) {
        reversed.add(original[i]);
    }

    IO.println(reversed);
}
```

## ch07-arrays-and-lists#28

Try It 6: `secondLargest`.

```java
int secondLargest(int[] numbers) {
    int[] sorted = Arrays.copyOfRange(numbers, 0, numbers.length);
    Arrays.sort(sorted);
    return sorted[sorted.length - 2];
}

void main() {
    IO.println(secondLargest(new int[] {3, 1, 4, 1, 5}));
}
```

Sort a copy, and the second-largest value is one from the end, at `length - 2`. Copying the whole array first, from 0 to its length, leaves the caller's array in its own order.

```java
int secondLargest(int[] numbers) {
    int largest = numbers[0];
    int second = numbers[1];
    if (second > largest) {
        largest = numbers[1];
        second = numbers[0];
    }
    for (int i = 2; i < numbers.length; i++) {
        if (numbers[i] > largest) {
            second = largest;
            largest = numbers[i];
        } else if (numbers[i] > second) {
            second = numbers[i];
        }
    }
    return second;
}

void main() {
    IO.println(secondLargest(new int[] {9, 5, 7}));
}
```

The second answer makes one pass and keeps the two largest so far, starting from the first two numbers in the right order. A new largest pushes the old one down to second; a number that beats only the second takes its place.

### mistake

Index 1 of the sorted copy is the second-*smallest*:

```java
int secondLargest(int[] numbers) {
    int[] sorted = Arrays.copyOfRange(numbers, 0, numbers.length);
    Arrays.sort(sorted);
    return sorted[1];
}

void main() {
    IO.println(secondLargest(new int[] {3, 1, 4, 1, 5}));
}
```

Updating the second only when a new largest arrives misses a number that comes after the largest: `{5, 9, 7}` gives 5.

```java
int secondLargest(int[] numbers) {
    int largest = numbers[0];
    int second = numbers[0];
    for (int number : numbers) {
        if (number > largest) {
            second = largest;
            largest = number;
        }
    }
    return second;
}

void main() {
    IO.println(secondLargest(new int[] {5, 9, 7}));
}
```

Starting both at the first number: when the first is the largest, nothing ever beats the second, so `{9, 5, 7}` gives 9.

```java
int secondLargest(int[] numbers) {
    int largest = numbers[0];
    int second = numbers[0];
    for (int number : numbers) {
        if (number > largest) {
            second = largest;
            largest = number;
        } else if (number > second) {
            second = number;
        }
    }
    return second;
}

void main() {
    IO.println(secondLargest(new int[] {9, 5, 7}));
}
```

Starting both at 0: when every number is negative, the answer is 0.

```java
int secondLargest(int[] numbers) {
    int largest = 0;
    int second = 0;
    for (int number : numbers) {
        if (number > largest) {
            second = largest;
            largest = number;
        } else if (number > second) {
            second = number;
        }
    }
    return second;
}

void main() {
    IO.println(secondLargest(new int[] {-3, -1, -7}));
}
```

## ch07-arrays-and-lists#29

Try It 7: a grid of zeros with a 5 in the center.

```java
// A 3-by-3 grid of zeros with a 5 in the center.

void main() {
    int[][] grid = {
        {0, 0, 0},
        {0, 0, 0},
        {0, 0, 0}
    };

    grid[1][1] = 5;

    for (int[] row : grid) {
        for (int value : row) {
            IO.print(value + " ");
        }
        IO.println();
    }
}
```

The center of a 3-by-3 grid is row 1, position 1, since both count from 0. The two loops are the chapter's grid printer: the outer one hands out the rows, and the inner one prints each value with a space after it.

```java
void main() {
    int[][] grid = {
        {0, 0, 0},
        {0, 0, 0},
        {0, 0, 0}
    };
    grid[1][1] = 5;

    for (int row = 0; row < grid.length; row++) {
        for (int column = 0; column < grid[row].length; column++) {
            IO.print(grid[row][column] + " ");
        }
        IO.println();
    }
}
```

The second answer walks the grid with counting loops, row and column, as two indexes.

### mistake

Counting from 1: row 2, position 2 is the bottom right corner, not the center.

```java
void main() {
    int[][] grid = {
        {0, 0, 0},
        {0, 0, 0},
        {0, 0, 0}
    };

    grid[2][2] = 5;

    for (int[] row : grid) {
        for (int value : row) {
            IO.print(value + " ");
        }
        IO.println();
    }
}
```

Printing each row with `Arrays.toString`, which adds brackets and commas:

```java
void main() {
    int[][] grid = {
        {0, 0, 0},
        {0, 0, 0},
        {0, 0, 0}
    };

    grid[1][1] = 5;

    for (int[] row : grid) {
        IO.println(Arrays.toString(row));
    }
}
```

## ch07-arrays-and-lists-practice#1

```java
int totalSeconds(ArrayList<Integer> seconds) {
    int total = 0;
    for (int length : seconds) {
        total += length;
    }
    return total;
}

void main() {
    ArrayList<Integer> seconds = new ArrayList<>(List.of(210, 185, 240));
    IO.println(totalSeconds(seconds));
}
```

An accumulator over the list. The empty case falls out for free, because the total starts at 0 and the loop never runs.

```java
int totalSeconds(ArrayList<Integer> seconds) {
    int total = 0;
    for (int i = 0; i < seconds.size(); i++) {
        total += seconds.get(i);
    }
    return total;
}

void main() {
    IO.println(totalSeconds(new ArrayList<>()));
}
```

The second answer walks the indexes with `get(i)`.

### mistake

Starting at index 1 leaves out the first song, so a one-song playlist totals 0.

```java
int totalSeconds(ArrayList<Integer> seconds) {
    int total = 0;
    for (int i = 1; i < seconds.size(); i++) {
        total += seconds.get(i);
    }
    return total;
}

void main() {
    IO.println(totalSeconds(new ArrayList<>(List.of(90))));
}
```

Starting the total at the first song and then adding every song counts the first one twice.

```java
int totalSeconds(ArrayList<Integer> seconds) {
    int total = seconds.get(0);
    for (int length : seconds) {
        total += length;
    }
    return total;
}

void main() {
    IO.println(totalSeconds(new ArrayList<>(List.of(210, 185, 240))));
}
```

## ch07-arrays-and-lists-practice#2

```java
double averageSeconds(ArrayList<Integer> seconds) {
    int total = 0;
    for (int length : seconds) {
        total += length;
    }
    return Math.round((double) total / seconds.size() * 10) / 10.0;
}

void main() {
    ArrayList<Integer> seconds = new ArrayList<>(List.of(210, 185, 240));
    IO.println(averageSeconds(seconds));
}
```

Divide by `size()`, not by the number of songs you happen to be testing with, and cast first, so the division keeps its fraction. Then Chapter 3's rounding: times 10, `Math.round`, divided by `10.0`.

```java
int totalSeconds(ArrayList<Integer> seconds) {
    int total = 0;
    for (int length : seconds) {
        total += length;
    }
    return total;
}

double averageSeconds(ArrayList<Integer> seconds) {
    double average = (double) totalSeconds(seconds) / seconds.size();
    return Math.round(average * 10) / 10.0;
}

void main() {
    IO.println(averageSeconds(new ArrayList<>(List.of(100, 200))));
}
```

The second answer reuses step 1's `totalSeconds` and rounds on a line of its own.

### mistake

Two `int`s divided: 635 divided by 3 is 211, and 211.7 never appears.

```java
double averageSeconds(ArrayList<Integer> seconds) {
    int total = 0;
    for (int length : seconds) {
        total += length;
    }
    return Math.round(total / seconds.size() * 10) / 10.0;
}

void main() {
    IO.println(averageSeconds(new ArrayList<>(List.of(210, 185, 240))));
}
```

Dividing by 3, the test playlist's length, gets the test playlist right and every other wrong:

```java
double averageSeconds(ArrayList<Integer> seconds) {
    int total = 0;
    for (int length : seconds) {
        total += length;
    }
    return Math.round((double) total / 3 * 10) / 10.0;
}

void main() {
    IO.println(averageSeconds(new ArrayList<>(List.of(100, 200))));
}
```

No rounding: 211.66666666666666, not 211.7.

```java
double averageSeconds(ArrayList<Integer> seconds) {
    int total = 0;
    for (int length : seconds) {
        total += length;
    }
    return (double) total / seconds.size();
}

void main() {
    IO.println(averageSeconds(new ArrayList<>(List.of(210, 185, 240))));
}
```

## ch07-arrays-and-lists-practice#3

```java
String longestTitle(ArrayList<String> titles) {
    String best = titles.get(0);
    for (String title : titles) {
        if (title.length() > best.length()) {
            best = title;
        }
    }
    return best;
}

void main() {
    ArrayList<String> titles = new ArrayList<>(List.of("Ghost Town", "Ribbons", "Anvil"));
    IO.println(longestTitle(titles));
}
```

The largest-so-far loop, comparing lengths. Starting from the first title, not from an empty string, means the answer is always a real title.

```java
String longestTitle(ArrayList<String> titles) {
    int best = 0;
    for (int i = 1; i < titles.size(); i++) {
        if (titles.get(i).length() > titles.get(best).length()) {
            best = i;
        }
    }
    return titles.get(best);
}

void main() {
    IO.println(longestTitle(new ArrayList<>(List.of("Anvil", "Ribbons"))));
}
```

The second answer keeps the index of the longest title so far, as the gradebook kept the index of the highest score.

### mistake

Comparing the titles themselves with `compareTo` finds the one that comes last alphabetically, which answers a different question and gets "Ribbons" most of the time by luck:

```java
String longestTitle(ArrayList<String> titles) {
    String best = titles.get(0);
    for (String title : titles) {
        if (title.compareTo(best) > 0) {
            best = title;
        }
    }
    return best;
}

void main() {
    IO.println(longestTitle(new ArrayList<>(List.of("Anvil", "Ghost Town", "Ribbons"))));
}
```

`<` where `>` belongs finds the shortest title:

```java
String longestTitle(ArrayList<String> titles) {
    String best = titles.get(0);
    for (String title : titles) {
        if (title.length() < best.length()) {
            best = title;
        }
    }
    return best;
}

void main() {
    IO.println(longestTitle(new ArrayList<>(List.of("Anvil", "Ghost Town", "Ribbons"))));
}
```

## ch07-arrays-and-lists-practice#4

```java
ArrayList<String> playlistWith(ArrayList<String> titles, String title) {
    ArrayList<String> longer = new ArrayList<>(titles);
    longer.add(title);
    return longer;
}

void main() {
    ArrayList<String> titles = new ArrayList<>(List.of("Ghost Town", "Ribbons", "Anvil"));
    IO.println(playlistWith(titles, "Lanterns"));
    IO.println(titles);
}
```

Copy first, so the caller's playlist is left alone: `main` prints the original afterward, and it still has three songs. `titles.add(title)` would have changed the caller's list, since `titles` holds the same object the caller passed in.

```java
ArrayList<String> playlistWith(ArrayList<String> titles, String title) {
    ArrayList<String> longer = new ArrayList<>();
    longer.addAll(titles);
    longer.add(title);
    return longer;
}

void main() {
    ArrayList<String> titles = new ArrayList<>(List.of("Ghost Town", "Ribbons", "Anvil"));
    IO.println(playlistWith(titles, "Lanterns"));
    IO.println(titles);
}
```

The second answer starts from an empty list and copies the titles in with `addAll`.

### mistake

Adding to the caller's list and returning it: the first line is right, but the second shows that the original has four songs now.

```java
ArrayList<String> playlistWith(ArrayList<String> titles, String title) {
    titles.add(title);
    return titles;
}

void main() {
    ArrayList<String> titles = new ArrayList<>(List.of("Ghost Town", "Ribbons", "Anvil"));
    IO.println(playlistWith(titles, "Lanterns"));
    IO.println(titles);
}
```

`add(0, title)` puts the new song at the front instead of the end:

```java
ArrayList<String> playlistWith(ArrayList<String> titles, String title) {
    ArrayList<String> longer = new ArrayList<>(titles);
    longer.add(0, title);
    return longer;
}

void main() {
    ArrayList<String> titles = new ArrayList<>(List.of("Ghost Town", "Ribbons", "Anvil"));
    IO.println(playlistWith(titles, "Lanterns"));
    IO.println(titles);
}
```

A new list with only the new title in it:

```java
ArrayList<String> playlistWith(ArrayList<String> titles, String title) {
    ArrayList<String> longer = new ArrayList<>();
    longer.add(title);
    return longer;
}

void main() {
    ArrayList<String> titles = new ArrayList<>(List.of("Ghost Town", "Ribbons", "Anvil"));
    IO.println(playlistWith(titles, "Lanterns"));
    IO.println(titles);
}
```

## ch07-arrays-and-lists-practice#5

```java
ArrayList<String> firstThree(ArrayList<String> titles) {
    if (titles.size() <= 3) {
        return new ArrayList<>(titles);
    }
    return new ArrayList<>(titles.subList(0, 3));
}

void main() {
    ArrayList<String> titles = new ArrayList<>(List.of("Ghost Town", "Ribbons", "Anvil"));
    titles.add("Lanterns");
    IO.println(firstThree(titles));
}
```

`subList(0, 3)` stops the program with an exception when the list is shorter than three, so a short playlist is copied whole before it gets there. Each `return` hands back a new list, never the caller's.

```java
ArrayList<String> firstThree(ArrayList<String> titles) {
    ArrayList<String> first = new ArrayList<>();
    for (int i = 0; i < titles.size() && i < 3; i++) {
        first.add(titles.get(i));
    }
    return first;
}

void main() {
    IO.println(firstThree(new ArrayList<>(List.of("a"))));
}
```

The second answer copies titles one at a time, and its loop stops at whichever comes first: the end of the list or the third title.

### mistake

`subList(0, 3)` with no check: a one-song playlist stops the program with an exception.

```java
ArrayList<String> firstThree(ArrayList<String> titles) {
    return new ArrayList<>(titles.subList(0, 3));
}

void main() {
    IO.println(firstThree(new ArrayList<>(List.of("a"))));
}
```

`i <= 3` lets a fourth title in:

```java
ArrayList<String> firstThree(ArrayList<String> titles) {
    ArrayList<String> first = new ArrayList<>();
    for (int i = 0; i < titles.size() && i <= 3; i++) {
        first.add(titles.get(i));
    }
    return first;
}

void main() {
    IO.println(firstThree(new ArrayList<>(List.of("a", "b", "c", "d"))));
}
```

## ch07-arrays-and-lists-practice#6

```java
boolean hasSong(ArrayList<String> titles, String title) {
    return titles.contains(title);
}

void main() {
    ArrayList<String> titles = new ArrayList<>(List.of("Ghost Town", "Ribbons", "Anvil"));
    IO.println(hasSong(titles, "Anvil"));
    IO.println(hasSong(titles, "Lanterns"));
}
```

`contains` asks whether the list holds the title, and its answer is already the `true` or `false` the method returns.

```java
boolean hasSong(ArrayList<String> titles, String title) {
    for (String t : titles) {
        if (t.equals(title)) {
            return true;
        }
    }
    return false;
}

void main() {
    IO.println(hasSong(new ArrayList<>(), "Anvil"));
}
```

The second answer searches by hand: `return true` the moment a title matches, and `false` only once the loop has seen them all.

### mistake

`indexOf(title) > 0` forgets that the first song is at index 0:

```java
boolean hasSong(ArrayList<String> titles, String title) {
    return titles.indexOf(title) > 0;
}

void main() {
    IO.println(hasSong(new ArrayList<>(List.of("Anvil", "Ribbons")), "Anvil"));
}
```

`return false` inside the loop decides after the first title alone:

```java
boolean hasSong(ArrayList<String> titles, String title) {
    for (String t : titles) {
        if (t.equals(title)) {
            return true;
        } else {
            return false;
        }
    }
    return false;
}

void main() {
    IO.println(hasSong(new ArrayList<>(List.of("Anvil", "Ribbons")), "Ribbons"));
}
```

## ch07-arrays-and-lists-practice#7

```java
ArrayList<Integer> positions(ArrayList<String> titles, String title) {
    ArrayList<Integer> found = new ArrayList<>();
    for (int i = 0; i < titles.size(); i++) {
        if (titles.get(i).equals(title)) {
            found.add(i);
        }
    }
    return found;
}

void main() {
    ArrayList<String> titles = new ArrayList<>(List.of("Ribbons", "Anvil", "Ribbons"));
    IO.println(positions(titles, "Ribbons"));
}
```

A counting loop gives the index and the title together, and the filtering pattern keeps the indexes that match. Titles are text, so they are compared with `.equals`. The last case makes its title at run time, with `strip()`, so it is a separate `String` object with the same letters: `.equals` matches it, and `==` would not.

```java
ArrayList<Integer> positions(ArrayList<String> titles, String title) {
    ArrayList<Integer> found = new ArrayList<>();
    int index = 0;
    for (String t : titles) {
        if (t.equals(title)) {
            found.add(index);
        }
        index++;
    }
    return found;
}

void main() {
    IO.println(positions(new ArrayList<>(List.of("Anvil")), "Ribbons"));
}
```

The second answer uses the enhanced `for` and counts the index alongside it.

### mistake

`indexOf` finds only the first:

```java
ArrayList<Integer> positions(ArrayList<String> titles, String title) {
    ArrayList<Integer> found = new ArrayList<>();
    if (titles.contains(title)) {
        found.add(titles.indexOf(title));
    }
    return found;
}

void main() {
    IO.println(positions(new ArrayList<>(List.of("Ribbons", "Anvil", "Ribbons")), "Ribbons"));
}
```

`i + 1` numbers the songs from 1, as a printed list would, but these are indexes:

```java
ArrayList<Integer> positions(ArrayList<String> titles, String title) {
    ArrayList<Integer> found = new ArrayList<>();
    for (int i = 0; i < titles.size(); i++) {
        if (titles.get(i).equals(title)) {
            found.add(i + 1);
        }
    }
    return found;
}

void main() {
    IO.println(positions(new ArrayList<>(List.of("Ribbons", "Anvil", "Ribbons")), "Ribbons"));
}
```

`==` asks whether two titles are the same object. The titles written in the program are one object, so the first cases pass, but a title made with `strip()` is a separate one:

```java
ArrayList<Integer> positions(ArrayList<String> titles, String title) {
    ArrayList<Integer> found = new ArrayList<>();
    for (int i = 0; i < titles.size(); i++) {
        if (titles.get(i) == title) {
            found.add(i);
        }
    }
    return found;
}

void main() {
    IO.println(positions(new ArrayList<>(List.of("Ribbons", "Anvil", "Ribbons")), " Ribbons".strip()));
}
```

## ch07-arrays-and-lists-practice#8

```java
ArrayList<String> byLength(ArrayList<String> titles, ArrayList<Integer> seconds) {
    ArrayList<String> titlesLeft = new ArrayList<>(titles);
    ArrayList<Integer> secondsLeft = new ArrayList<>(seconds);
    ArrayList<String> ordered = new ArrayList<>();

    while (!secondsLeft.isEmpty()) {
        int shortest = 0;
        for (int i = 1; i < secondsLeft.size(); i++) {
            if (secondsLeft.get(i) < secondsLeft.get(shortest)) {
                shortest = i;
            }
        }
        ordered.add(titlesLeft.get(shortest));
        titlesLeft.remove(shortest);
        secondsLeft.remove(shortest);
    }
    return ordered;
}

void main() {
    ArrayList<String> titles = new ArrayList<>(List.of("Ghost Town", "Ribbons", "Anvil"));
    ArrayList<Integer> seconds = new ArrayList<>(List.of(210, 185, 240));
    IO.println(byLength(titles, seconds));
}
```

Each pass of the `while` finds the index of the shortest length left, moves that song's title to the answer, and removes the pair from both copies at the same index, so the copies stay parallel. `shortest` is an `int`, so `remove` takes it as an index, which is what is wanted here. `<`, not `<=`, keeps the first of two equal lengths, so ties stay in playlist order.

```java
ArrayList<String> byLength(ArrayList<String> titles, ArrayList<Integer> seconds) {
    ArrayList<Integer> sorted = new ArrayList<>(seconds);
    Collections.sort(sorted);

    ArrayList<Integer> unused = new ArrayList<>(seconds);
    ArrayList<String> ordered = new ArrayList<>();
    for (int length : sorted) {
        int i = unused.indexOf(length);
        ordered.add(titles.get(i));
        unused.set(i, -1);
    }
    return ordered;
}

void main() {
    ArrayList<String> titles = new ArrayList<>(List.of("a", "b", "c"));
    ArrayList<Integer> seconds = new ArrayList<>(List.of(200, 100, 200));
    IO.println(byLength(titles, seconds));
}
```

The second answer sorts a copy of the lengths, then finds each length's song with `indexOf`. Setting a used length to -1, which no song lasts, stops `indexOf` from finding the same song twice when two songs are the same length.

### mistake

Sorting the titles sorts them alphabetically, which is a different playlist entirely:

```java
ArrayList<String> byLength(ArrayList<String> titles, ArrayList<Integer> seconds) {
    ArrayList<String> ordered = new ArrayList<>(titles);
    Collections.sort(ordered);
    return ordered;
}

void main() {
    ArrayList<String> titles = new ArrayList<>(List.of("Ghost Town", "Ribbons", "Anvil"));
    ArrayList<Integer> seconds = new ArrayList<>(List.of(210, 185, 240));
    IO.println(byLength(titles, seconds));
}
```

`indexOf` without marking a length as used: two songs of 200 seconds both find the first one.

```java
ArrayList<String> byLength(ArrayList<String> titles, ArrayList<Integer> seconds) {
    ArrayList<Integer> sorted = new ArrayList<>(seconds);
    Collections.sort(sorted);

    ArrayList<String> ordered = new ArrayList<>();
    for (int length : sorted) {
        ordered.add(titles.get(seconds.indexOf(length)));
    }
    return ordered;
}

void main() {
    ArrayList<String> titles = new ArrayList<>(List.of("a", "b", "c"));
    ArrayList<Integer> seconds = new ArrayList<>(List.of(200, 100, 200));
    IO.println(byLength(titles, seconds));
}
```

`<=` keeps the last of two equal lengths, so a tie comes out in the wrong order:

```java
ArrayList<String> byLength(ArrayList<String> titles, ArrayList<Integer> seconds) {
    ArrayList<String> titlesLeft = new ArrayList<>(titles);
    ArrayList<Integer> secondsLeft = new ArrayList<>(seconds);
    ArrayList<String> ordered = new ArrayList<>();

    while (!secondsLeft.isEmpty()) {
        int shortest = 0;
        for (int i = 1; i < secondsLeft.size(); i++) {
            if (secondsLeft.get(i) <= secondsLeft.get(shortest)) {
                shortest = i;
            }
        }
        ordered.add(titlesLeft.get(shortest));
        titlesLeft.remove(shortest);
        secondsLeft.remove(shortest);
    }
    return ordered;
}

void main() {
    ArrayList<String> titles = new ArrayList<>(List.of("a", "b", "c"));
    ArrayList<Integer> seconds = new ArrayList<>(List.of(200, 100, 200));
    IO.println(byLength(titles, seconds));
}
```

## ch08-strings-as-data#20

Try It 1: a word forward, backward, in uppercase, and its length.

```java
// A word forward, backward, in uppercase, and its length.

void main() {
    String word = IO.readln("Enter a word: ").strip();

    String reversed = "";
    for (int i = word.length() - 1; i >= 0; i--) {
        reversed += word.charAt(i);
    }

    IO.println(word);
    IO.println(reversed);
    IO.println(word.toUpperCase());
    IO.println(word.length());
}
```

The backward loop is the one from the start of the chapter: from the last position, `length() - 1`, down to 0, adding each character to the end of a new string. `toUpperCase()` gives back a new string, so its result is printed straight away; called on a line of its own, it would be lost.

```java
void main() {
    String word = IO.readln("Word: ").strip();

    String reversed = "";
    for (int i = 0; i < word.length(); i++) {
        reversed = word.charAt(i) + reversed;
    }

    String upper = word.toUpperCase();
    IO.println(word);
    IO.println(reversed);
    IO.println(upper);
    IO.println(word.length());
}
```

The second answer walks forward and puts each character in front of the ones before it, so the last one ends up first, and stores the uppercase word before printing it.

### mistake

Calling `toUpperCase()` without storing what it gives back: `word` is unchanged, so the third line is still lowercase.

```java
void main() {
    String word = IO.readln("Enter a word: ").strip();

    String reversed = "";
    for (int i = word.length() - 1; i >= 0; i--) {
        reversed += word.charAt(i);
    }

    IO.println(word);
    IO.println(reversed);
    word.toUpperCase();
    IO.println(word);
    IO.println(word.length());
}
```

`i > 0` stops before position 0, so the backward word loses its last letter, the word's first:

```java
void main() {
    String word = IO.readln("Enter a word: ").strip();

    String reversed = "";
    for (int i = word.length() - 1; i > 0; i--) {
        reversed += word.charAt(i);
    }

    IO.println(word);
    IO.println(reversed);
    IO.println(word.toUpperCase());
    IO.println(word.length());
}
```

## ch08-strings-as-data#21

Try It 2: `countLetter`.

```java
int countLetter(String text, String letter) {
    String lowerText = text.toLowerCase();
    char target = letter.toLowerCase().charAt(0);
    int count = 0;
    for (int i = 0; i < lowerText.length(); i++) {
        if (lowerText.charAt(i) == target) {
            count++;
        }
    }
    return count;
}

void main() {
    IO.println(countLetter("Hello World", "l"));
}
```

Lowercase both the text and the letter, so neither one's case matters, then count with Chapter 5's loop. `charAt(0)` takes the letter's one character as a `char`, which compares with `==`.

```java
int countLetter(String text, String letter) {
    String lower = text.toLowerCase();
    String without = lower.replace(letter.toLowerCase(), "");
    return lower.length() - without.length();
}

void main() {
    IO.println(countLetter("Banana", "A"));
}
```

The second answer removes every copy of the letter with `replace` and counts how many characters went missing.

### mistake

No lowercasing at all: an uppercase `A` never matches the lowercase letters of `Banana`.

```java
int countLetter(String text, String letter) {
    int count = 0;
    for (int i = 0; i < text.length(); i++) {
        if (text.charAt(i) == letter.charAt(0)) {
            count++;
        }
    }
    return count;
}

void main() {
    IO.println(countLetter("Banana", "A"));
}
```

Lowercasing the letter but not the text misses the capital at the start of `Anna`:

```java
int countLetter(String text, String letter) {
    char target = letter.toLowerCase().charAt(0);
    int count = 0;
    for (int i = 0; i < text.length(); i++) {
        if (text.charAt(i) == target) {
            count++;
        }
    }
    return count;
}

void main() {
    IO.println(countLetter("Anna", "a"));
}
```

Comparing one-letter strings with `==` asks whether they are the same object, and `substring` makes a new one every time, so nothing ever matches:

```java
int countLetter(String text, String letter) {
    String lowerText = text.toLowerCase();
    String target = letter.toLowerCase();
    int count = 0;
    for (int i = 0; i < lowerText.length(); i++) {
        if (lowerText.substring(i, i + 1) == target) {
            count++;
        }
    }
    return count;
}

void main() {
    IO.println(countLetter("Hello World", "l"));
}
```

## ch08-strings-as-data#22

Try It 3: initials.

```java
// Prints the initials of a full name.

void main() {
    String fullName = IO.readln("Enter your full name: ");
    String[] words = fullName.strip().split("\\s+");

    String initials = "";
    for (String word : words) {
        initials += word.substring(0, 1).toUpperCase();
    }

    IO.println(initials);
}
```

`strip().split("\\s+")` cuts the name into words however many spaces were typed. Each word's first letter is its `substring(0, 1)`, a one-letter `String`, which `toUpperCase()` turns into a capital, and `+=` joins the initials into one string.

```java
void main() {
    String name = IO.readln("Full name: ").strip().toUpperCase();

    String initials = "" + name.charAt(0);
    for (int i = 1; i < name.length(); i++) {
        if (name.charAt(i - 1) == ' ' && name.charAt(i) != ' ') {
            initials += name.charAt(i);
        }
    }

    IO.println(initials);
}
```

The second answer uppercases the whole name first, then walks it a character at a time: a character that is not a space, right after a space, starts a word. `"" + name.charAt(0)` starts the initials as text, so a `char` can be joined on.

### mistake

`split(" ")` gives an empty piece wherever two spaces meet, and an empty string has no first letter, so the program stops with an exception:

```java
void main() {
    String fullName = IO.readln("Enter your full name: ");
    String[] words = fullName.strip().split(" ");

    String initials = "";
    for (String word : words) {
        initials += word.substring(0, 1).toUpperCase();
    }

    IO.println(initials);
}
```

No `toUpperCase()`: a name typed in lowercase gives lowercase initials.

```java
void main() {
    String fullName = IO.readln("Enter your full name: ");
    String[] words = fullName.strip().split("\\s+");

    String initials = "";
    for (String word : words) {
        initials += word.substring(0, 1);
    }

    IO.println(initials);
}
```

## ch08-strings-as-data#23

Try It 4: `titleCase`.

```java
String titleCase(String sentence) {
    ArrayList<String> words = new ArrayList<>();
    for (String word : sentence.split(" ")) {
        words.add(word.substring(0, 1).toUpperCase() + word.substring(1));
    }
    return String.join(" ", words);
}

void main() {
    IO.println(titleCase("the quick brown fox"));
}
```

Split at the spaces, capitalize each word's first letter with `substring(0, 1).toUpperCase()`, keep the rest with `substring(1)`, and `String.join` puts the spaces back between the words, with none left over at the end.

```java
String titleCase(String sentence) {
    String result = "";
    boolean startOfWord = true;
    for (int i = 0; i < sentence.length(); i++) {
        if (startOfWord) {
            result += sentence.substring(i, i + 1).toUpperCase();
        } else {
            result += sentence.charAt(i);
        }
        startOfWord = sentence.charAt(i) == ' ';
    }
    return result;
}

void main() {
    IO.println(titleCase("hello world"));
}
```

The second answer walks the sentence a character at a time and capitalizes each one that starts a word: the first, and every one after a space.

### mistake

Adding a space after every word leaves one dangling at the end: `"Hello World "`.

```java
String titleCase(String sentence) {
    String result = "";
    for (String word : sentence.split(" ")) {
        result += word.substring(0, 1).toUpperCase() + word.substring(1) + " ";
    }
    return result;
}

void main() {
    IO.println(titleCase("hello world"));
}
```

Capitalizing only the sentence's first letter:

```java
String titleCase(String sentence) {
    return sentence.substring(0, 1).toUpperCase() + sentence.substring(1);
}

void main() {
    IO.println(titleCase("hello world"));
}
```

## ch08-strings-as-data#24

Try It 5: counting words.

```java
// Counts the words in a sentence.

void main() {
    String sentence = IO.readln("Enter a sentence: ").strip();

    if (sentence.isEmpty()) {
        IO.println("Words: 0");
    } else {
        String[] words = sentence.split("\\s+");
        IO.println("Words: " + words.length);
    }
}
```

`strip()` and then `split("\\s+")` give exactly one piece per word, however many spaces surround them, so the array's `length` is the count. An empty sentence would still split into one empty piece, which is why it is checked first.

```java
void main() {
    String sentence = IO.readln("Sentence: ");

    int words = 0;
    boolean inWord = false;
    for (int i = 0; i < sentence.length(); i++) {
        if (sentence.charAt(i) == ' ') {
            inWord = false;
        } else if (!inWord) {
            inWord = true;
            words++;
        }
    }

    IO.println(words + " words");
}
```

The second answer walks the sentence and counts each character that starts a word: one that is not a space, where the character before was a space or there was none.

### mistake

`split(" ")` counts an empty piece wherever two spaces meet:

```java
void main() {
    String sentence = IO.readln("Enter a sentence: ").strip();
    IO.println("Words: " + sentence.split(" ").length);
}
```

No `strip()`: spaces at the start give an empty first piece, and it is counted as a word.

```java
void main() {
    String sentence = IO.readln("Enter a sentence: ");
    IO.println("Words: " + sentence.split("\\s+").length);
}
```

## ch08-strings-as-data#25

Try It 6: `caesarShift`.

```java
String caesarShift(String text, int n) {
    String result = "";
    for (int i = 0; i < text.length(); i++) {
        char c = text.charAt(i);
        if (c >= 'a' && c <= 'z') {
            result += (char) ('a' + (c - 'a' + n) % 26);
        } else {
            result += c;
        }
    }
    return result;
}

void main() {
    IO.println(caesarShift("hello world", 3));
}
```

For a lowercase letter, `c - 'a'` is its place in the alphabet, from 0 to 25. Adding `n` and taking the remainder after dividing by 26 wraps anything past `z` back to the start, and `'a'` plus that place, cast to `char`, is the shifted letter. Anything else, such as the space, is added unchanged.

```java
String caesarShift(String text, int n) {
    String alphabet = "abcdefghijklmnopqrstuvwxyz";
    String result = "";
    for (int i = 0; i < text.length(); i++) {
        int place = alphabet.indexOf(text.charAt(i));
        if (place == -1) {
            result += text.charAt(i);
        } else {
            result += alphabet.charAt((place + n) % 26);
        }
    }
    return result;
}

void main() {
    IO.println(caesarShift("xyz", 3));
}
```

The second answer does no arithmetic on characters: it finds each letter's place in a string of the alphabet with `indexOf`, and the shifted letter with `charAt`.

### mistake

No wrapping: `x` shifted 3 places runs past `z` into the characters after it.

```java
String caesarShift(String text, int n) {
    String result = "";
    for (int i = 0; i < text.length(); i++) {
        char c = text.charAt(i);
        if (c >= 'a' && c <= 'z') {
            result += (char) (c + n);
        } else {
            result += c;
        }
    }
    return result;
}

void main() {
    IO.println(caesarShift("xyz", 3));
}
```

Shifting every character, the space included:

```java
String caesarShift(String text, int n) {
    String result = "";
    for (int i = 0; i < text.length(); i++) {
        char c = text.charAt(i);
        result += (char) ('a' + (c - 'a' + n) % 26);
    }
    return result;
}

void main() {
    IO.println(caesarShift("hello world", 1));
}
```

## ch08-strings-as-data#26

Try It 7: names and scores.

```java
// Prints each name and score from lines of comma-separated text.

void main() {
    String data = "Ada,88\nGrace,92\nAlan,45";
    String[] lines = data.split("\n");

    for (String line : lines) {
        String[] parts = line.split(",");
        IO.println(parts[0] + ": " + parts[1]);
    }
}
```

`split("\n")` cuts the text into its three lines, and each line splits at its comma into a name and a score, taken from the array by index.

```java
void main() {
    String data = "Ada,88\nGrace,92\nAlan,45";

    for (String line : data.split("\n")) {
        int comma = line.indexOf(",");
        IO.println(line.substring(0, comma) + ": " + line.substring(comma + 1));
    }
}
```

The second answer finds each line's comma with `indexOf` and keeps what comes before it and after it with `substring`.

```java
void main() {
    String data = "Ada,88\nGrace,92\nAlan,45";
    IO.println(data.replace(",", ": "));
}
```

The third answer needs no loop: `replace` turns every comma into a colon and a space, and the line breaks stay where they were.

### mistake

A space where the colon belongs:

```java
void main() {
    String data = "Ada,88\nGrace,92\nAlan,45";
    String[] lines = data.split("\n");

    for (String line : lines) {
        String[] parts = line.split(",");
        IO.println(parts[0] + " " + parts[1]);
    }
}
```

Splitting the whole text at its commas: the line breaks stay inside the pieces, so names and scores come out on lines of their own.

```java
void main() {
    String data = "Ada,88\nGrace,92\nAlan,45";
    String[] parts = data.split(",");

    for (String part : parts) {
        IO.println(part);
    }
}
```

## ch08-strings-as-data-practice#1

```java
String levelOf(String line) {
    return line.split("\\|")[0];
}

void main() {
    IO.println(levelOf("WARN|14:03|Disk usage at 91 percent"));
}
```

Split on the separator the format actually uses, and the level is the first piece, index 0. `|` is special in a pattern, so it is written `"\\|"`. Counting characters would work for `WARN` and `INFO` and break on `ERROR`.

```java
String levelOf(String line) {
    return line.substring(0, line.indexOf("|"));
}

void main() {
    IO.println(levelOf("ERROR|00:01|Down"));
}
```

The second answer cuts the line at its first `|`. `indexOf` looks for plain text, not a pattern, so its `|` needs no backslash.

### mistake

`split("|")` cuts the line apart at every character, so its first piece is not the level:

```java
String levelOf(String line) {
    return line.split("|")[0];
}

void main() {
    IO.println(levelOf("WARN|14:03|Disk usage at 91 percent"));
}
```

Counting characters: four is right for `WARN` and `INFO`, and cuts `ERROR` short.

```java
String levelOf(String line) {
    return line.substring(0, 4);
}

void main() {
    IO.println(levelOf("ERROR|00:01|Down"));
}
```

## ch08-strings-as-data-practice#2

```java
String timeOf(String line) {
    return line.split("\\|")[1];
}

void main() {
    IO.println(timeOf("WARN|14:03|Disk usage at 91 percent"));
}
```

The time is the second field, so it is at index 1. Counting from 0 is the whole of this step.

```java
String timeOf(String line) {
    String afterLevel = line.substring(line.indexOf("|") + 1);
    return afterLevel.substring(0, afterLevel.indexOf("|"));
}

void main() {
    IO.println(timeOf("ERROR|00:01|Down"));
}
```

The second answer cuts off the level and its `|`, then keeps what comes before the next `|`.

### mistake

Index 2 is the third field, the message:

```java
String timeOf(String line) {
    return line.split("\\|")[2];
}

void main() {
    IO.println(timeOf("WARN|14:03|Disk usage at 91 percent"));
}
```

Counting characters works while every level has four letters, and slips by one on `ERROR`:

```java
String timeOf(String line) {
    return line.substring(5, 10);
}

void main() {
    IO.println(timeOf("ERROR|00:01|Down"));
}
```

## ch08-strings-as-data-practice#3

```java
String messageOf(String line) {
    return line.split("\\|")[2];
}

void main() {
    IO.println(messageOf("WARN|14:03|Disk usage at 91 percent"));
}
```

The message is the third and last field, at index 2.

```java
String messageOf(String line) {
    String[] fields = line.split("\\|");
    return fields[fields.length - 1];
}

void main() {
    IO.println(messageOf("ERROR|00:01|Down"));
}
```

The second answer takes the last field with `length - 1`, which finds it however many fields come before.

### mistake

Index 1 is the time:

```java
String messageOf(String line) {
    return line.split("\\|")[1];
}

void main() {
    IO.println(messageOf("WARN|14:03|Disk usage at 91 percent"));
}
```

Counting characters works for four-letter levels and keeps a `|` for `ERROR`:

```java
String messageOf(String line) {
    return line.substring(11);
}

void main() {
    IO.println(messageOf("ERROR|00:01|Down"));
}
```

## ch08-strings-as-data-practice#4

```java
boolean isWarning(String line) {
    String level = line.split("\\|")[0];
    return level.toUpperCase().equals("WARN");
}

void main() {
    IO.println(isWarning("WARN|14:03|Disk usage at 91 percent"));
    IO.println(isWarning("warn|08:00|  Fan speed low  "));
    IO.println(isWarning("INFO|09:15|Backup finished"));
}
```

Put the level in one case before comparing, and compare text with `.equals`. Without `toUpperCase()`, half the services are never warned about.

```java
boolean isWarning(String line) {
    return line.toUpperCase().startsWith("WARN|");
}

void main() {
    IO.println(isWarning("warn|08:00|  Fan speed low  "));
}
```

The second answer uppercases the whole line and asks whether it starts with the level and its separator; the `|` keeps a level such as `WARNING` from counting.

### mistake

No `toUpperCase()`: the lowercase `warn` is missed.

```java
boolean isWarning(String line) {
    return line.split("\\|")[0].equals("WARN");
}

void main() {
    IO.println(isWarning("warn|08:00|  Fan speed low  "));
}
```

`==` asks whether two `String`s are the same object, and `split` makes new ones, so even `WARN` is not a warning:

```java
boolean isWarning(String line) {
    return line.split("\\|")[0].toUpperCase() == "WARN";
}

void main() {
    IO.println(isWarning("WARN|14:03|Disk usage at 91 percent"));
}
```

`contains` looks at the whole line, message included, so an `INFO` line that mentions a warning counts:

```java
boolean isWarning(String line) {
    return line.toUpperCase().contains("WARN");
}

void main() {
    IO.println(isWarning("INFO|10:00|Warning cleared"));
}
```

## ch08-strings-as-data-practice#5

```java
String tidy(String line) {
    String[] fields = line.split("\\|");
    fields[0] = fields[0].toUpperCase();
    fields[2] = fields[2].strip();
    return String.join("|", fields);
}

void main() {
    IO.println(tidy("warn|08:00|  Fan speed low  "));
}
```

An array's items can be replaced, so the level and the message are swapped for their tidied versions, and `String.join` puts the separator back between the pieces. `String.join` takes plain text, not a pattern, so its `|` needs no backslash. A line that was already tidy comes back unchanged.

```java
String tidy(String line) {
    String[] fields = line.split("\\|");
    return fields[0].toUpperCase() + "|" + fields[1] + "|" + fields[2].strip();
}

void main() {
    IO.println(tidy("WARN|14:03|Disk usage at 91 percent"));
}
```

The second answer joins the three pieces with `+` and writes each separator itself.

### mistake

Calling `toUpperCase()` and `strip()` without storing what they give back: the fields are unchanged, and so is the line.

```java
String tidy(String line) {
    String[] fields = line.split("\\|");
    fields[0].toUpperCase();
    fields[2].strip();
    return String.join("|", fields);
}

void main() {
    IO.println(tidy("warn|08:00|  Fan speed low  "));
}
```

Uppercasing the whole line shouts the message too:

```java
String tidy(String line) {
    String[] fields = line.toUpperCase().split("\\|");
    fields[2] = fields[2].strip();
    return String.join("|", fields);
}

void main() {
    IO.println(tidy("warn|08:00|  Fan speed low  "));
}
```

## ch08-strings-as-data-practice#6

```java
ArrayList<String> wordsIn(String message) {
    ArrayList<String> words = new ArrayList<>();
    for (String word : message.strip().split("\\s+")) {
        boolean allLetters = true;
        for (int i = 0; i < word.length(); i++) {
            if (!Character.isLetter(word.charAt(i))) {
                allLetters = false;
            }
        }
        if (allLetters) {
            words.add(word);
        }
    }
    return words;
}

void main() {
    IO.println(wordsIn("Disk usage at 91 percent"));
}
```

`strip().split("\\s+")` gives the words however the spaces fall. A word is kept only if every one of its characters is a letter: the flag starts `true` for each word, and any character that is not a letter turns it `false`, which is how `91` and `sda1` drop out.

```java
ArrayList<String> wordsIn(String message) {
    ArrayList<String> words = new ArrayList<>();
    for (String word : message.strip().split("\\s+")) {
        int letters = 0;
        for (int i = 0; i < word.length(); i++) {
            if (Character.isLetter(word.charAt(i))) {
                letters++;
            }
        }
        if (letters > 0 && letters == word.length()) {
            words.add(word);
        }
    }
    return words;
}

void main() {
    IO.println(wordsIn("  Fan speed low  "));
}
```

The second answer counts each word's letters and keeps the word when every character was one.

### mistake

`split(" ")` with no `strip()`: the spaces at the start of the message leave empty pieces, and an empty piece has no character that is not a letter, so it is kept.

```java
ArrayList<String> wordsIn(String message) {
    ArrayList<String> words = new ArrayList<>();
    for (String word : message.split(" ")) {
        boolean allLetters = true;
        for (int i = 0; i < word.length(); i++) {
            if (!Character.isLetter(word.charAt(i))) {
                allLetters = false;
            }
        }
        if (allLetters) {
            words.add(word);
        }
    }
    return words;
}

void main() {
    IO.println(wordsIn("  Fan speed low  "));
}
```

Testing only the first character lets `sda1` through:

```java
ArrayList<String> wordsIn(String message) {
    ArrayList<String> words = new ArrayList<>();
    for (String word : message.strip().split("\\s+")) {
        if (Character.isLetter(word.charAt(0))) {
            words.add(word);
        }
    }
    return words;
}

void main() {
    IO.println(wordsIn("Disk sda1 at 91 percent"));
}
```

A flag set up once, before the loop over the words: after `91`, it stays `false`, and every later word is left out.

```java
ArrayList<String> wordsIn(String message) {
    ArrayList<String> words = new ArrayList<>();
    boolean allLetters = true;
    for (String word : message.strip().split("\\s+")) {
        for (int i = 0; i < word.length(); i++) {
            if (!Character.isLetter(word.charAt(i))) {
                allLetters = false;
            }
        }
        if (allLetters) {
            words.add(word);
        }
    }
    return words;
}

void main() {
    IO.println(wordsIn("Disk usage at 91 percent"));
}
```

## ch08-strings-as-data-practice#7

```java
String redact(String line, String word) {
    return line.replace(word, "****");
}

void main() {
    IO.println(redact("WARN|14:03|Disk usage at 91 percent", "91"));
}
```

`replace` changes every appearance, not just the first, and gives back the line unchanged when the word is not there.

```java
String redact(String line, String word) {
    String result = "";
    String rest = line;
    int at = rest.indexOf(word);
    while (at >= 0) {
        result += rest.substring(0, at) + "****";
        rest = rest.substring(at + word.length());
        at = rest.indexOf(word);
    }
    return result + rest;
}

void main() {
    IO.println(redact("a b a", "a"));
}
```

The second answer does `replace`'s work by hand: while the word is still in what is left, it keeps the text before it, adds the stars, and carries on after it.

### mistake

`replace` gives back a new string, and this throws it away, returning the line as it was:

```java
String redact(String line, String word) {
    line.replace(word, "****");
    return line;
}

void main() {
    IO.println(redact("WARN|14:03|Disk usage at 91 percent", "91"));
}
```

One star per character, where the step asks for `****` every time:

```java
String redact(String line, String word) {
    return line.replace(word, "*".repeat(word.length()));
}

void main() {
    IO.println(redact("WARN|14:03|Disk usage at 91 percent", "91"));
}
```

## ch08-strings-as-data-practice#8

```java
ArrayList<String> warningMessages(ArrayList<String> lines) {
    ArrayList<String> messages = new ArrayList<>();
    for (String line : lines) {
        String[] fields = line.split("\\|");
        if (fields[0].toUpperCase().equals("WARN")) {
            messages.add(fields[2].strip());
        }
    }
    return messages;
}

void main() {
    ArrayList<String> lines = new ArrayList<>();
    lines.add("WARN|14:03|Disk usage at 91 percent");
    lines.add("INFO|09:15|Backup finished");
    lines.add("warn|08:00|  Fan speed low  ");
    IO.println(warningMessages(lines));
}
```

The messages, not the lines: each warning's third field, stripped. The lowercase line has to be caught and its message tidied, which is why the level is uppercased before the comparison.

```java
boolean isWarning(String line) {
    return line.split("\\|")[0].toUpperCase().equals("WARN");
}

String messageOf(String line) {
    return line.split("\\|")[2];
}

ArrayList<String> warningMessages(ArrayList<String> lines) {
    ArrayList<String> messages = new ArrayList<>();
    for (String line : lines) {
        if (isWarning(line)) {
            messages.add(messageOf(line).strip());
        }
    }
    return messages;
}

void main() {
    ArrayList<String> lines = new ArrayList<>();
    lines.add("warn|08:00|  Fan speed low  ");
    IO.println(warningMessages(lines));
}
```

The second answer reuses steps 3 and 4, which is why they were worth writing separately.

### mistake

The whole lines, not the messages:

```java
ArrayList<String> warningMessages(ArrayList<String> lines) {
    ArrayList<String> messages = new ArrayList<>();
    for (String line : lines) {
        if (line.split("\\|")[0].toUpperCase().equals("WARN")) {
            messages.add(line);
        }
    }
    return messages;
}

void main() {
    ArrayList<String> lines = new ArrayList<>();
    lines.add("WARN|14:03|Disk usage at 91 percent");
    IO.println(warningMessages(lines));
}
```

The message kept with its spaces:

```java
ArrayList<String> warningMessages(ArrayList<String> lines) {
    ArrayList<String> messages = new ArrayList<>();
    for (String line : lines) {
        String[] fields = line.split("\\|");
        if (fields[0].toUpperCase().equals("WARN")) {
            messages.add(fields[2]);
        }
    }
    return messages;
}

void main() {
    ArrayList<String> lines = new ArrayList<>();
    lines.add("warn|08:00|  Fan speed low  ");
    IO.println(warningMessages(lines));
}
```

No `toUpperCase()`: the lowercase warning is missed.

```java
ArrayList<String> warningMessages(ArrayList<String> lines) {
    ArrayList<String> messages = new ArrayList<>();
    for (String line : lines) {
        String[] fields = line.split("\\|");
        if (fields[0].equals("WARN")) {
            messages.add(fields[2].strip());
        }
    }
    return messages;
}

void main() {
    ArrayList<String> lines = new ArrayList<>();
    lines.add("warn|08:00|  Fan speed low  ");
    IO.println(warningMessages(lines));
}
```

`contains` looks at the whole line, message included, so an `INFO` line that mentions a warning is let in:

```java
ArrayList<String> warningMessages(ArrayList<String> lines) {
    ArrayList<String> messages = new ArrayList<>();
    for (String line : lines) {
        if (line.toUpperCase().contains("WARN")) {
            messages.add(line.split("\\|")[2].strip());
        }
    }
    return messages;
}

void main() {
    ArrayList<String> lines = new ArrayList<>();
    lines.add("INFO|10:00|Warning cleared");
    IO.println(warningMessages(lines));
}
```

## ch09-maps-and-sets#16

Try It 1: a capital looked up in a map.

```java
// Looks up the capital of a country the user types.

void main() {
    Map<String, String> capitals = new LinkedHashMap<>();
    capitals.put("France", "Paris");
    capitals.put("Japan", "Tokyo");
    capitals.put("Egypt", "Cairo");
    capitals.put("Brazil", "Brasilia");
    capitals.put("Canada", "Ottawa");

    String country = IO.readln("Enter a country: ").strip();

    if (capitals.containsKey(country)) {
        IO.println("The capital of " + country + " is "
                + capitals.get(country) + ".");
    } else {
        IO.println("I don't have that country.");
    }
}
```

`containsKey` asks before `get` does, so a country the map does not have gets the message rather than `null`. `strip()` takes off any spaces typed around the country.

```java
void main() {
    Map<String, String> capitals = new TreeMap<>();
    capitals.put("France", "Paris");
    capitals.put("Japan", "Tokyo");
    capitals.put("Egypt", "Cairo");
    capitals.put("Brazil", "Brasilia");
    capitals.put("Canada", "Ottawa");

    String country = IO.readln("Country: ").strip();
    IO.println(capitals.getOrDefault(country, "I don't have that country."));
}
```

The second answer lets `getOrDefault` supply the message as its default, so one line does both the lookup and the refusal; it prints the capital alone.

### mistake

No test before `get`: a missing country prints `null` as its capital.

```java
void main() {
    Map<String, String> capitals = new LinkedHashMap<>();
    capitals.put("France", "Paris");
    capitals.put("Japan", "Tokyo");
    capitals.put("Egypt", "Cairo");
    capitals.put("Brazil", "Brasilia");
    capitals.put("Canada", "Ottawa");

    String country = IO.readln("Enter a country: ").strip();
    IO.println("The capital of " + country + " is " + capitals.get(country) + ".");
}
```

A typo in a key: `put` makes an entry for `Canda`, and Canada is never found.

```java
void main() {
    Map<String, String> capitals = new LinkedHashMap<>();
    capitals.put("France", "Paris");
    capitals.put("Japan", "Tokyo");
    capitals.put("Egypt", "Cairo");
    capitals.put("Brazil", "Brasilia");
    capitals.put("Canda", "Ottawa");

    String country = IO.readln("Enter a country: ").strip();

    if (capitals.containsKey(country)) {
        IO.println("The capital of " + country + " is " + capitals.get(country) + ".");
    } else {
        IO.println("I don't have that country.");
    }
}
```

## ch09-maps-and-sets#17

Try It 2: letter counts in the order the letters first appear.

```java
// Counts the letters of a word, in the order they first appear.

void main() {
    String word = IO.readln("Enter a word: ").strip();

    Map<Character, Integer> counts = new LinkedHashMap<>();
    for (int i = 0; i < word.length(); i++) {
        char letter = word.charAt(i);
        counts.put(letter, counts.getOrDefault(letter, 0) + 1);
    }

    for (char letter : counts.keySet()) {
        IO.println(letter + ": " + counts.get(letter));
    }
}
```

This is the counting pattern from the chapter: `getOrDefault(letter, 0) + 1` handles a first sighting and a repeat with the same line. A `LinkedHashMap` keeps the letters in the order they were first put in, which is the order they first appear in the word, and `char letter` takes each `Character` key as a `char`.

```java
void main() {
    String word = IO.readln("Word: ").strip();

    Map<String, Integer> counts = new LinkedHashMap<>();
    for (int i = 0; i < word.length(); i++) {
        String letter = word.substring(i, i + 1);
        if (counts.containsKey(letter)) {
            counts.put(letter, counts.get(letter) + 1);
        } else {
            counts.put(letter, 1);
        }
    }

    for (String letter : counts.keySet()) {
        IO.println(letter + ": " + counts.get(letter));
    }
}
```

The second answer keeps each letter as a one-letter `String` and asks `containsKey` before counting: the `if` that `getOrDefault` saves.

### mistake

A `HashMap` promises no order, and prints `banana`'s letters as a, b, n rather than in the order they first appear:

```java
void main() {
    String word = IO.readln("Enter a word: ").strip();

    Map<Character, Integer> counts = new HashMap<>();
    for (int i = 0; i < word.length(); i++) {
        char letter = word.charAt(i);
        counts.put(letter, counts.getOrDefault(letter, 0) + 1);
    }

    for (char letter : counts.keySet()) {
        IO.println(letter + ": " + counts.get(letter));
    }
}
```

Putting 1 every time counts every letter once, however often it appears:

```java
void main() {
    String word = IO.readln("Enter a word: ").strip();

    Map<Character, Integer> counts = new LinkedHashMap<>();
    for (int i = 0; i < word.length(); i++) {
        counts.put(word.charAt(i), 1);
    }

    for (char letter : counts.keySet()) {
        IO.println(letter + ": " + counts.get(letter));
    }
}
```

## ch09-maps-and-sets#18

Try It 3: two lists compared with sets.

```java
// Compares two lists of names with sets.

void main() {
    ArrayList<String> first = new ArrayList<>(List.of("Ada", "Grace", "Alan", "Katherine"));
    ArrayList<String> second = new ArrayList<>(List.of("Grace", "Alan", "Margaret"));

    Set<String> both = new LinkedHashSet<>(first);
    both.retainAll(second);

    Set<String> firstOnly = new LinkedHashSet<>(first);
    firstOnly.removeAll(second);

    Set<String> everyone = new LinkedHashSet<>(first);
    everyone.addAll(second);

    IO.println("In both lists: " + both);
    IO.println("Only in the first list: " + firstOnly);
    IO.println("Everyone: " + everyone);
}
```

Each group starts as a copy of the first list, made into a `LinkedHashSet` so it keeps the names in the order they first appear; then `retainAll`, `removeAll` or `addAll` does the rest, exactly as the chapter's band and chorus do.

```java
void main() {
    ArrayList<String> first = new ArrayList<>(List.of("Ada", "Grace", "Alan", "Katherine"));
    ArrayList<String> second = new ArrayList<>(List.of("Grace", "Alan", "Margaret"));

    ArrayList<String> both = new ArrayList<>();
    ArrayList<String> firstOnly = new ArrayList<>();
    for (String name : first) {
        if (second.contains(name)) {
            both.add(name);
        } else {
            firstOnly.add(name);
        }
    }

    ArrayList<String> everyone = new ArrayList<>(first);
    for (String name : second) {
        if (!everyone.contains(name)) {
            everyone.add(name);
        }
    }

    IO.println(both);
    IO.println(firstOnly);
    IO.println(everyone);
}
```

The second answer uses no sets: `contains` on the second list sorts each name of the first into one group or the other, and everyone is the first list plus each name of the second that it does not already hold.

### mistake

No copies: `retainAll` changes the one set, so the names only in the first list are already gone when `removeAll` looks for them.

```java
void main() {
    ArrayList<String> first = new ArrayList<>(List.of("Ada", "Grace", "Alan", "Katherine"));
    ArrayList<String> second = new ArrayList<>(List.of("Grace", "Alan", "Margaret"));

    Set<String> names = new LinkedHashSet<>(first);
    names.retainAll(second);
    IO.println("In both lists: " + names);

    names.removeAll(second);
    IO.println("Only in the first list: " + names);

    names.addAll(second);
    IO.println("Everyone: " + names);
}
```

`HashSet`s keep no promised order, so the groups do not come out in the order the names first appear:

```java
void main() {
    ArrayList<String> first = new ArrayList<>(List.of("Ada", "Grace", "Alan", "Katherine"));
    ArrayList<String> second = new ArrayList<>(List.of("Grace", "Alan", "Margaret"));

    Set<String> both = new HashSet<>(first);
    both.retainAll(second);

    Set<String> firstOnly = new HashSet<>(first);
    firstOnly.removeAll(second);

    Set<String> everyone = new HashSet<>(first);
    everyone.addAll(second);

    IO.println("In both lists: " + both);
    IO.println("Only in the first list: " + firstOnly);
    IO.println("Everyone: " + everyone);
}
```

## ch09-maps-and-sets#19

Try It 4: `invert`.

```java
Map<String, String> invert(Map<String, String> map) {
    Map<String, String> inverted = new LinkedHashMap<>();
    for (String key : map.keySet()) {
        inverted.put(map.get(key), key);
    }
    return inverted;
}

void main() {
    Map<String, String> spanish = new LinkedHashMap<>();
    spanish.put("one", "uno");
    spanish.put("two", "dos");
    IO.println(invert(spanish));
}
```

Each value becomes a key of the new map, leading back to the key it came from. The method builds a new map and leaves the one it is handed as it was. If two keys share a value, the new map keeps only one of them: `put` replaces, so the last key the loop reaches wins.

```java
Map<String, String> invert(Map<String, String> map) {
    Map<String, String> inverted = new HashMap<>();
    for (Map.Entry<String, String> entry : map.entrySet()) {
        inverted.put(entry.getValue(), entry.getKey());
    }
    return inverted;
}

void main() {
    Map<String, String> spanish = new LinkedHashMap<>();
    spanish.put("one", "uno");
    IO.println(invert(spanish));
}
```

The second answer walks the entries, each key with its value, and fills a `HashMap`. Check compares maps by their keys and values, so the order it keeps makes no difference.

### mistake

Copying instead of swapping: each key still leads to its own value.

```java
Map<String, String> invert(Map<String, String> map) {
    Map<String, String> inverted = new LinkedHashMap<>();
    for (String key : map.keySet()) {
        inverted.put(key, map.get(key));
    }
    return inverted;
}

void main() {
    Map<String, String> spanish = new LinkedHashMap<>();
    spanish.put("one", "uno");
    IO.println(invert(spanish));
}
```

`inverted = map` makes a second variable for the same map, not a new one, so the method changes the map it is handed; a `Map.of` map cannot change, and stops the method with an exception.

```java
Map<String, String> invert(Map<String, String> map) {
    Map<String, String> inverted = map;
    for (String key : map.keySet()) {
        inverted.put(map.get(key), key);
    }
    return inverted;
}

void main() {
    Map<String, String> spanish = Map.of("one", "uno");
    IO.println(invert(spanish));
}
```

## ch09-maps-and-sets#20

Try It 5: a roster from a map of maps.

```java
// A roster of students, each with a grade level and a favorite subject.

void main() {
    Map<String, String> ada = new LinkedHashMap<>();
    ada.put("grade", "9");
    ada.put("subject", "Math");

    Map<String, String> grace = new LinkedHashMap<>();
    grace.put("grade", "10");
    grace.put("subject", "Science");

    Map<String, String> alan = new LinkedHashMap<>();
    alan.put("grade", "9");
    alan.put("subject", "History");

    Map<String, Map<String, String>> students = new LinkedHashMap<>();
    students.put("Ada", ada);
    students.put("Grace", grace);
    students.put("Alan", alan);

    IO.println(String.format("%-10s%-8s%s", "Name", "Grade", "Favorite Subject"));
    for (String name : students.keySet()) {
        Map<String, String> info = students.get(name);
        IO.println(String.format("%-10s%-8s%s",
                name, info.get("grade"), info.get("subject")));
    }
}
```

Each student's facts live in a map of their own, and the outer map leads from a name to it, as the chapter's `students.get("Ada").get("score")` does. The grade level is stored as text, because every value in a map has the map's one value type, and the `LinkedHashMap`s keep the students in the order they were put in.

```java
void main() {
    Map<String, Integer> grades = new LinkedHashMap<>();
    Map<String, String> subjects = new LinkedHashMap<>();

    grades.put("Ada", 9);
    subjects.put("Ada", "Math");
    grades.put("Grace", 10);
    subjects.put("Grace", "Science");
    grades.put("Alan", 9);
    subjects.put("Alan", "History");

    for (String name : grades.keySet()) {
        IO.println(name + ", grade " + grades.get(name) + ", likes " + subjects.get(name));
    }
}
```

The second answer keeps two maps with the same keys instead of a map of maps, so each fact keeps its own type: the grade level is an `Integer`.

### mistake

One inner map for all three students: every `put` changes the same map, so each name leads to Alan's facts.

```java
void main() {
    Map<String, String> info = new LinkedHashMap<>();
    Map<String, Map<String, String>> students = new LinkedHashMap<>();

    info.put("grade", "9");
    info.put("subject", "Math");
    students.put("Ada", info);

    info.put("grade", "10");
    info.put("subject", "Science");
    students.put("Grace", info);

    info.put("grade", "9");
    info.put("subject", "History");
    students.put("Alan", info);

    for (String name : students.keySet()) {
        Map<String, String> facts = students.get(name);
        IO.println(name + " " + facts.get("grade") + " " + facts.get("subject"));
    }
}
```

A `HashMap` for the roster promises no order, and lists Grace first:

```java
void main() {
    Map<String, String> ada = new LinkedHashMap<>();
    ada.put("grade", "9");
    ada.put("subject", "Math");

    Map<String, String> grace = new LinkedHashMap<>();
    grace.put("grade", "10");
    grace.put("subject", "Science");

    Map<String, String> alan = new LinkedHashMap<>();
    alan.put("grade", "9");
    alan.put("subject", "History");

    Map<String, Map<String, String>> students = new HashMap<>();
    students.put("Ada", ada);
    students.put("Grace", grace);
    students.put("Alan", alan);

    for (String name : students.keySet()) {
        Map<String, String> info = students.get(name);
        IO.println(name + " " + info.get("grade") + " " + info.get("subject"));
    }
}
```

## ch09-maps-and-sets#21

Try It 6: the words that appear more than once.

```java
// Prints the words that appear more than once.

void main() {
    String[] words = {"cat", "dog", "cat", "bird", "dog", "cat", "fish"};

    Map<String, Integer> counts = new LinkedHashMap<>();
    for (String word : words) {
        counts.put(word, counts.getOrDefault(word, 0) + 1);
    }

    for (String word : counts.keySet()) {
        if (counts.get(word) > 1) {
            IO.println(word);
        }
    }
}
```

The same counting pattern as exercise 2, then a loop over the keys picks out the words counted more than once. The `LinkedHashMap` keeps the words in the order they first appear, and each key is there once, so each repeated word prints once.

```java
void main() {
    ArrayList<String> words = new ArrayList<>(List.of("cat", "dog", "cat", "bird", "dog", "cat", "fish"));

    Set<String> printed = new HashSet<>();
    for (String word : words) {
        if (Collections.frequency(words, word) > 1 && !printed.contains(word)) {
            IO.println(word);
            printed.add(word);
        }
    }
}
```

The second answer counts with Chapter 7's `Collections.frequency` and keeps a set of the words it has printed already, so none prints twice.

### mistake

Printing a word each time it turns up again prints `cat` twice:

```java
void main() {
    String[] words = {"cat", "dog", "cat", "bird", "dog", "cat", "fish"};

    ArrayList<String> seen = new ArrayList<>();
    for (String word : words) {
        if (seen.contains(word)) {
            IO.println(word);
        }
        seen.add(word);
    }
}
```

`>= 1` is true of every word, so all four print:

```java
void main() {
    String[] words = {"cat", "dog", "cat", "bird", "dog", "cat", "fish"};

    Map<String, Integer> counts = new LinkedHashMap<>();
    for (String word : words) {
        counts.put(word, counts.getOrDefault(word, 0) + 1);
    }

    for (String word : counts.keySet()) {
        if (counts.get(word) >= 1) {
            IO.println(word);
        }
    }
}
```

## ch09-maps-and-sets#22

Try It 7: the most common character.

```java
// Finds the most common character in a sentence, ignoring spaces.

void main() {
    String sentence = IO.readln("Enter a sentence: ");

    Map<Character, Integer> counts = new LinkedHashMap<>();
    for (int i = 0; i < sentence.length(); i++) {
        char c = sentence.charAt(i);
        if (c != ' ') {
            counts.put(c, counts.getOrDefault(c, 0) + 1);
        }
    }

    char mostCommon = ' ';
    int most = 0;
    for (char c : counts.keySet()) {
        if (counts.get(c) > most) {
            mostCommon = c;
            most = counts.get(c);
        }
    }

    IO.println("The most common character is '" + mostCommon
            + "', appearing " + most + " times.");
}
```

Spaces are left out before anything is counted. The second loop keeps the character with the highest count so far; `most` can start at 0 because every character in the map was counted at least once.

```java
void main() {
    String sentence = IO.readln("Sentence: ");

    Map<Character, Integer> counts = new HashMap<>();
    for (int i = 0; i < sentence.length(); i++) {
        char c = sentence.charAt(i);
        if (c != ' ') {
            counts.put(c, counts.getOrDefault(c, 0) + 1);
        }
    }

    ArrayList<Map.Entry<Character, Integer>> ranked = new ArrayList<>(counts.entrySet());
    ranked.sort(Comparator.comparing((Map.Entry<Character, Integer> e) -> e.getValue())
            .reversed());
    Map.Entry<Character, Integer> top = ranked.get(0);
    IO.println(top.getKey() + " appears " + top.getValue() + " times");
}
```

The second answer sorts the entries by count, largest first, with the chapter's comparator, and takes the first.

### mistake

Counting the spaces too: in `to be or not to be` the space is the most common character.

```java
void main() {
    String sentence = IO.readln("Enter a sentence: ");

    Map<Character, Integer> counts = new LinkedHashMap<>();
    for (int i = 0; i < sentence.length(); i++) {
        char c = sentence.charAt(i);
        counts.put(c, counts.getOrDefault(c, 0) + 1);
    }

    char mostCommon = ' ';
    int most = 0;
    for (char c : counts.keySet()) {
        if (counts.get(c) > most) {
            mostCommon = c;
            most = counts.get(c);
        }
    }

    IO.println("The most common character is '" + mostCommon
            + "', appearing " + most + " times.");
}
```

An `if` without braces controls only the line after it, so `mostCommon` is set on every pass and ends as the last character counted:

```java
void main() {
    String sentence = IO.readln("Enter a sentence: ");

    Map<Character, Integer> counts = new LinkedHashMap<>();
    for (int i = 0; i < sentence.length(); i++) {
        char c = sentence.charAt(i);
        if (c != ' ') {
            counts.put(c, counts.getOrDefault(c, 0) + 1);
        }
    }

    char mostCommon = ' ';
    int most = 0;
    for (char c : counts.keySet()) {
        if (counts.get(c) > most)
            most = counts.get(c);
            mostCommon = c;
    }

    IO.println("The most common character is '" + mostCommon
            + "', appearing " + most + " times.");
}
```

## ch09-maps-and-sets-practice#1

```java
int countOf(Map<String, Integer> register, String item) {
    return register.getOrDefault(item, 0);
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    register.put("phone", 1);
    register.put("scarf", 2);
    IO.println(countOf(register, "phone"));
    IO.println(countOf(register, "hat"));
}
```

`getOrDefault` with a default of 0 answers for something that was never handed in. `get` alone gives back `null` for it, and `null` is not an `int`.

```java
int countOf(Map<String, Integer> register, String item) {
    if (register.containsKey(item)) {
        return register.get(item);
    }
    return 0;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    IO.println(countOf(register, "umbrella"));
}
```

The second answer asks `containsKey` first and returns 0 for an item that is not held.

### mistake

`get` alone: for something never handed in it gives back `null`, which is not an `int`, so the method stops with an exception.

```java
int countOf(Map<String, Integer> register, String item) {
    return register.get(item);
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    IO.println(countOf(register, "umbrella"));
}
```

Answering whether the item is held, not how many:

```java
int countOf(Map<String, Integer> register, String item) {
    if (register.containsKey(item)) {
        return 1;
    }
    return 0;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    IO.println(countOf(register, "umbrella"));
}
```

## ch09-maps-and-sets-practice#2

```java
int totalItems(Map<String, Integer> register) {
    int total = 0;
    for (int count : register.values()) {
        total += count;
    }
    return total;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    register.put("phone", 1);
    register.put("scarf", 2);
    IO.println(totalItems(register));
}
```

`values()` gives the counts, so adding them gives every object in the office. `size()` is how many kinds of thing are held, which is a different number and looks plausible until someone hands in a second umbrella.

```java
int totalItems(Map<String, Integer> register) {
    int total = 0;
    for (String item : register.keySet()) {
        total += register.get(item);
    }
    return total;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    register.put("hat", 5);
    IO.println(totalItems(register));
}
```

The second answer loops over the names and looks up each one's count.

### mistake

`size()` counts the kinds of thing, 3, not the objects, 6:

```java
int totalItems(Map<String, Integer> register) {
    return register.size();
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    IO.println(totalItems(register));
}
```

Adding 1 for each name counts the names again:

```java
int totalItems(Map<String, Integer> register) {
    int total = 0;
    for (String item : register.keySet()) {
        total++;
    }
    return total;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    IO.println(totalItems(register));
}
```

## ch09-maps-and-sets-practice#3

```java
Map<String, Integer> addItem(Map<String, Integer> register, String item) {
    Map<String, Integer> updated = new LinkedHashMap<>(register);
    updated.put(item, updated.getOrDefault(item, 0) + 1);
    return updated;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    register.put("phone", 1);
    register.put("scarf", 2);
    IO.println(addItem(register, "hat"));
    IO.println(register);
}
```

The copy is changed and handed back, and the register itself is left as it was. `getOrDefault(item, 0) + 1` covers both cases at once: a new item starts from 0, an existing one carries on.

```java
Map<String, Integer> addItem(Map<String, Integer> register, String item) {
    Map<String, Integer> updated = new TreeMap<>(register);
    if (updated.containsKey(item)) {
        updated.put(item, updated.get(item) + 1);
    } else {
        updated.put(item, 1);
    }
    return updated;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("phone", 1);
    IO.println(addItem(register, "phone"));
}
```

The second answer copies into a `TreeMap` and asks `containsKey` first. Check compares maps by their keys and values, so the kind of copy makes no difference.

### mistake

Putting 1 for every item loses the ones already there: a second phone still counts as one.

```java
Map<String, Integer> addItem(Map<String, Integer> register, String item) {
    Map<String, Integer> updated = new LinkedHashMap<>(register);
    updated.put(item, 1);
    return updated;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("phone", 1);
    IO.println(addItem(register, "phone"));
}
```

Changing the register it is handed instead of a copy: a `Map.of` register cannot change, and the method stops with an exception.

```java
Map<String, Integer> addItem(Map<String, Integer> register, String item) {
    register.put(item, register.getOrDefault(item, 0) + 1);
    return register;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("phone", 1);
    IO.println(addItem(register, "phone"));
}
```

## ch09-maps-and-sets-practice#4

```java
Map<String, Integer> removeItem(Map<String, Integer> register, String item) {
    Map<String, Integer> updated = new LinkedHashMap<>(register);
    if (!updated.containsKey(item)) {
        return updated;
    }
    int left = updated.get(item) - 1;
    if (left == 0) {
        updated.remove(item);
    } else {
        updated.put(item, left);
    }
    return updated;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    register.put("phone", 1);
    register.put("scarf", 2);
    IO.println(removeItem(register, "phone"));
    IO.println(removeItem(register, "umbrella"));
}
```

One fewer, and the entry disappears only when the count reaches zero. An item that is not held comes back unchanged, in the copy.

```java
Map<String, Integer> removeItem(Map<String, Integer> register, String item) {
    Map<String, Integer> updated = new HashMap<>();
    for (String name : register.keySet()) {
        int count = register.get(name);
        if (name.equals(item)) {
            count--;
        }
        if (count > 0) {
            updated.put(name, count);
        }
    }
    return updated;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    register.put("phone", 1);
    IO.println(removeItem(register, "phone"));
}
```

The second answer builds the new register entry by entry, one fewer for the item claimed, and leaves out any entry that reaches zero.

### mistake

Removing the entry outright hands back all three umbrellas to someone who claimed one:

```java
Map<String, Integer> removeItem(Map<String, Integer> register, String item) {
    Map<String, Integer> updated = new LinkedHashMap<>(register);
    updated.remove(item);
    return updated;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    IO.println(removeItem(register, "umbrella"));
}
```

`==` asks whether two `String`s are the same object, and an item name made while the program runs is a different object from the register's, so nothing is claimed:

```java
Map<String, Integer> removeItem(Map<String, Integer> register, String item) {
    Map<String, Integer> updated = new HashMap<>();
    for (String name : register.keySet()) {
        int count = register.get(name);
        if (name == item) {
            count--;
        }
        if (count > 0) {
            updated.put(name, count);
        }
    }
    return updated;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("phone", 1);
    IO.println(removeItem(register, " phone".strip()));
}
```

One fewer, but the last phone leaves an entry of 0 behind:

```java
Map<String, Integer> removeItem(Map<String, Integer> register, String item) {
    Map<String, Integer> updated = new LinkedHashMap<>(register);
    if (updated.containsKey(item)) {
        updated.put(item, updated.get(item) - 1);
    }
    return updated;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("phone", 1);
    IO.println(removeItem(register, "phone"));
}
```

## ch09-maps-and-sets-practice#5

```java
ArrayList<String> sortedItems(Map<String, Integer> register) {
    ArrayList<String> names = new ArrayList<>(register.keySet());
    Collections.sort(names);
    return names;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    register.put("phone", 1);
    register.put("scarf", 2);
    IO.println(sortedItems(register));
}
```

`keySet()` gives the names, a new `ArrayList` holds them, and `Collections.sort` puts them in alphabetical order. The register's own order is no help: the cases' `Map.of` registers keep no order at all.

```java
ArrayList<String> sortedItems(Map<String, Integer> register) {
    Map<String, Integer> sorted = new TreeMap<>(register);
    return new ArrayList<>(sorted.keySet());
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    register.put("phone", 1);
    IO.println(sortedItems(register));
}
```

The second answer copies the register into a `TreeMap`, which keeps its keys sorted, and lists them.

### mistake

Sorting the names by their counts, not alphabetically:

```java
ArrayList<String> sortedItems(Map<String, Integer> register) {
    ArrayList<Map.Entry<String, Integer>> entries = new ArrayList<>(register.entrySet());
    entries.sort(Comparator.comparing(e -> e.getValue()));

    ArrayList<String> names = new ArrayList<>();
    for (Map.Entry<String, Integer> entry : entries) {
        names.add(entry.getKey());
    }
    return names;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    register.put("phone", 1);
    IO.println(sortedItems(register));
}
```

## ch09-maps-and-sets-practice#6

```java
String busiest(Map<String, Integer> register) {
    String best = null;
    for (String item : register.keySet()) {
        if (best == null || register.get(item) > register.get(best)) {
            best = item;
        }
    }
    return best;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    register.put("phone", 1);
    register.put("scarf", 2);
    IO.println(busiest(register));
}
```

`best` starts as `null`, no item yet, and an item replaces it only with a higher count. Comparing the names themselves, with `compareTo`, would give the last name alphabetically instead: the zebra case is there to catch exactly that.

```java
String busiest(Map<String, Integer> register) {
    ArrayList<Map.Entry<String, Integer>> ranked = new ArrayList<>(register.entrySet());
    ranked.sort(Comparator.comparing((Map.Entry<String, Integer> e) -> e.getValue())
            .reversed());
    return ranked.get(0).getKey();
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("hat", 9);
    register.put("zebra", 2);
    IO.println(busiest(register));
}
```

The second answer sorts the entries by count, largest first, and takes the first entry's name.

### mistake

Comparing the names, not their counts, gives the last name alphabetically:

```java
String busiest(Map<String, Integer> register) {
    String best = null;
    for (String item : register.keySet()) {
        if (best == null || item.compareTo(best) > 0) {
            best = item;
        }
    }
    return best;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("hat", 9);
    register.put("zebra", 2);
    IO.println(busiest(register));
}
```

Sorting without `.reversed()` puts the fewest first:

```java
String busiest(Map<String, Integer> register) {
    ArrayList<Map.Entry<String, Integer>> ranked = new ArrayList<>(register.entrySet());
    ranked.sort(Comparator.comparing(e -> e.getValue()));
    return ranked.get(0).getKey();
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("hat", 9);
    register.put("zebra", 2);
    IO.println(busiest(register));
}
```

## ch09-maps-and-sets-practice#7

```java
ArrayList<String> inBoth(ArrayList<String> left, ArrayList<String> right) {
    Set<String> both = new TreeSet<>(left);
    both.retainAll(new HashSet<>(right));
    return new ArrayList<>(both);
}

void main() {
    ArrayList<String> left = new ArrayList<>(List.of("umbrella", "phone"));
    ArrayList<String> right = new ArrayList<>(List.of("phone", "hat"));
    IO.println(inBoth(left, right));
}
```

A `TreeSet` of the first list holds each name once, sorted, and `retainAll` keeps only the names the second has too. The repeated `a` collapses because a set holds one of each.

```java
ArrayList<String> inBoth(ArrayList<String> left, ArrayList<String> right) {
    ArrayList<String> both = new ArrayList<>();
    for (String item : left) {
        if (right.contains(item) && !both.contains(item)) {
            both.add(item);
        }
    }
    Collections.sort(both);
    return both;
}

void main() {
    ArrayList<String> left = new ArrayList<>(List.of("a", "a", "b"));
    ArrayList<String> right = new ArrayList<>(List.of("b", "a"));
    IO.println(inBoth(left, right));
}
```

The second answer uses lists alone: each name of the first list that the second has, added once, then sorted.

### mistake

`addAll` gives everything either list has, not what both have:

```java
ArrayList<String> inBoth(ArrayList<String> left, ArrayList<String> right) {
    Set<String> both = new TreeSet<>(left);
    both.addAll(right);
    return new ArrayList<>(both);
}

void main() {
    ArrayList<String> left = new ArrayList<>(List.of("umbrella", "phone"));
    ArrayList<String> right = new ArrayList<>(List.of("phone", "hat"));
    IO.println(inBoth(left, right));
}
```

No set: a name the first list repeats is added twice.

```java
ArrayList<String> inBoth(ArrayList<String> left, ArrayList<String> right) {
    ArrayList<String> both = new ArrayList<>();
    for (String item : left) {
        if (right.contains(item)) {
            both.add(item);
        }
    }
    Collections.sort(both);
    return both;
}

void main() {
    ArrayList<String> left = new ArrayList<>(List.of("a", "a", "b"));
    ArrayList<String> right = new ArrayList<>(List.of("b", "a"));
    IO.println(inBoth(left, right));
}
```

## ch09-maps-and-sets-practice#8

```java
Map<String, Integer> registerFrom(ArrayList<String> found) {
    Map<String, Integer> register = new LinkedHashMap<>();
    for (String item : found) {
        register.put(item, register.getOrDefault(item, 0) + 1);
    }
    return register;
}

void main() {
    ArrayList<String> found = new ArrayList<>(List.of("hat", "scarf", "hat"));
    IO.println(registerFrom(found));
}
```

The same `getOrDefault(item, 0) + 1` as step 3, now in a loop. This is the counting pattern, and it turns up everywhere once you have seen it.

```java
Map<String, Integer> registerFrom(ArrayList<String> found) {
    Map<String, Integer> register = new TreeMap<>();
    for (String item : found) {
        register.put(item, Collections.frequency(found, item));
    }
    return register;
}

void main() {
    ArrayList<String> found = new ArrayList<>(List.of("a", "a", "a"));
    IO.println(registerFrom(found));
}
```

The second answer asks Chapter 7's `Collections.frequency` how many times each item appears in the list; putting the same count again for a repeated item changes nothing.

### mistake

Putting 1 for every item counts each kind once, however many were handed in:

```java
Map<String, Integer> registerFrom(ArrayList<String> found) {
    Map<String, Integer> register = new LinkedHashMap<>();
    for (String item : found) {
        register.put(item, 1);
    }
    return register;
}

void main() {
    ArrayList<String> found = new ArrayList<>(List.of("hat", "scarf", "hat"));
    IO.println(registerFrom(found));
}
```

## ch10-records#13

Try It 1: five cities as records.

```java
// Five cities as records, printed with their coordinates.

record City(String name, double latitude, double longitude) {}

void main() {
    ArrayList<City> cities = new ArrayList<>(List.of(
            new City("Tokyo", 35.68, 139.69),
            new City("Cairo", 30.04, 31.24),
            new City("Lima", -12.05, -77.04),
            new City("Oslo", 59.91, 10.75),
            new City("Perth", -31.95, 115.86)));

    for (City city : cities) {
        IO.println(String.format("%s: (%.2f, %.2f)",
                city.name(), city.latitude(), city.longitude()));
    }
}
```

Each city is one record, so its name and its coordinates travel together, and the loop reads them back with the accessors. `%.2f` prints each coordinate to two decimal places, and a coordinate south of the equator or west of Greenwich keeps its minus sign.

```java
record City(String name, double latitude, double longitude) {}

void main() {
    City[] cities = {
        new City("Tokyo", 35.68, 139.69),
        new City("Cairo", 30.04, 31.24),
        new City("Lima", -12.05, -77.04),
        new City("Oslo", 59.91, 10.75),
        new City("Perth", -31.95, 115.86)
    };

    for (City city : cities) {
        IO.println(city.name() + ": (" + city.latitude() + ", " + city.longitude() + ")");
    }
}
```

The second answer keeps the cities in an array and joins each coordinate with `+`: these values already print with two decimal places, so no format is needed.

### mistake

Latitude and longitude read back in the wrong order:

```java
record City(String name, double latitude, double longitude) {}

void main() {
    ArrayList<City> cities = new ArrayList<>(List.of(
            new City("Tokyo", 35.68, 139.69),
            new City("Cairo", 30.04, 31.24),
            new City("Lima", -12.05, -77.04),
            new City("Oslo", 59.91, 10.75),
            new City("Perth", -31.95, 115.86)));

    for (City city : cities) {
        IO.println(String.format("%s: (%.2f, %.2f)",
                city.name(), city.longitude(), city.latitude()));
    }
}
```

One decimal place instead of two prints Tokyo at 35.7:

```java
record City(String name, double latitude, double longitude) {}

void main() {
    ArrayList<City> cities = new ArrayList<>(List.of(
            new City("Tokyo", 35.68, 139.69),
            new City("Cairo", 30.04, 31.24),
            new City("Lima", -12.05, -77.04),
            new City("Oslo", 59.91, 10.75),
            new City("Perth", -31.95, 115.86)));

    for (City city : cities) {
        IO.println(String.format("%s: (%.1f, %.1f)",
                city.name(), city.latitude(), city.longitude()));
    }
}
```

## ch10-records#14

Try It 2: `distance`.

```java
record Point(double x, double y) {}

double distance(Point p1, Point p2) {
    double dx = p2.x() - p1.x();
    double dy = p2.y() - p1.y();
    return Math.sqrt(dx * dx + dy * dy);
}

void main() {
    IO.println(distance(new Point(0, 0), new Point(3, 4)));
}
```

The differences in `x` and in `y` are the two short sides of a right triangle, and the distance is its long side: the square root of the sum of their squares. Squaring makes a negative difference positive, so it does not matter which point comes first.

```java
record Point(double x, double y) {}

double distance(Point p1, Point p2) {
    return Math.pow(Math.pow(p1.x() - p2.x(), 2) + Math.pow(p1.y() - p2.y(), 2), 0.5);
}

void main() {
    IO.println(distance(new Point(1, 1), new Point(4, 5)));
}
```

The second answer squares with Chapter 3's `Math.pow` and takes the square root as the power of one half.

### mistake

No square root: the sum of the squares, 25 for a distance of 5.

```java
record Point(double x, double y) {}

double distance(Point p1, Point p2) {
    double dx = p2.x() - p1.x();
    double dy = p2.y() - p1.y();
    return dx * dx + dy * dy;
}

void main() {
    IO.println(distance(new Point(0, 0), new Point(3, 4)));
}
```

Adding the differences walks along the two short sides instead of across:

```java
record Point(double x, double y) {}

double distance(Point p1, Point p2) {
    double dx = p2.x() - p1.x();
    double dy = p2.y() - p1.y();
    return dx + dy;
}

void main() {
    IO.println(distance(new Point(0, 0), new Point(3, 4)));
}
```

## ch10-records#15

Try It 3: book records, oldest first.

```java
// Book records, printed oldest first.

record Book(String title, String author, int year) {}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Neuromancer", "William Gibson", 1984),
            new Book("The Hobbit", "J.R.R. Tolkien", 1937),
            new Book("Project Hail Mary", "Andy Weir", 2021),
            new Book("Foundation", "Isaac Asimov", 1951)));

    ArrayList<Book> byYear = new ArrayList<>(books);
    byYear.sort(Comparator.comparing(book -> book.year()));

    for (Book book : byYear) {
        IO.println(book.year() + ": " + book.title() + " by " + book.author());
    }
}
```

A copy of the list is sorted by each book's year, the lambda saying what to compare, and the loop prints the copy. Each record keeps its title, author and year together however the list is rearranged.

```java
record Book(String title, String author, int year) {}

void main() {
    ArrayList<Book> books = new ArrayList<>();
    books.add(new Book("Dune", "Frank Herbert", 1965));
    books.add(new Book("Neuromancer", "William Gibson", 1984));
    books.add(new Book("The Hobbit", "J.R.R. Tolkien", 1937));
    books.add(new Book("Project Hail Mary", "Andy Weir", 2021));
    books.add(new Book("Foundation", "Isaac Asimov", 1951));

    books.sort(Comparator.comparing((Book b) -> b.year()));
    for (Book book : books) {
        IO.println(String.format("%d: %s by %s",
                book.year(), book.title(), book.author()));
    }
}
```

The second answer sorts the list itself, with the lambda's type written out, and builds each line with `String.format`.

### mistake

Sorting by title puts Dune first:

```java
record Book(String title, String author, int year) {}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Neuromancer", "William Gibson", 1984),
            new Book("The Hobbit", "J.R.R. Tolkien", 1937),
            new Book("Project Hail Mary", "Andy Weir", 2021),
            new Book("Foundation", "Isaac Asimov", 1951)));

    ArrayList<Book> sorted = new ArrayList<>(books);
    sorted.sort(Comparator.comparing(book -> book.title()));

    for (Book book : sorted) {
        IO.println(book.year() + ": " + book.title() + " by " + book.author());
    }
}
```

`.reversed()` puts the newest first:

```java
record Book(String title, String author, int year) {}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Neuromancer", "William Gibson", 1984),
            new Book("The Hobbit", "J.R.R. Tolkien", 1937),
            new Book("Project Hail Mary", "Andy Weir", 2021),
            new Book("Foundation", "Isaac Asimov", 1951)));

    ArrayList<Book> byYear = new ArrayList<>(books);
    byYear.sort(Comparator.comparing((Book book) -> book.year()).reversed());

    for (Book book : byYear) {
        IO.println(book.year() + ": " + book.title() + " by " + book.author());
    }
}
```

## ch10-records#16

Try It 4: the books published after 2000.

```java
// Prints the books published after 2000.

record Book(String title, String author, int year) {}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Neuromancer", "William Gibson", 1984),
            new Book("The Hobbit", "J.R.R. Tolkien", 1937),
            new Book("Project Hail Mary", "Andy Weir", 2021),
            new Book("Foundation", "Isaac Asimov", 1951)));

    ArrayList<Book> recent = new ArrayList<>();
    for (Book book : books) {
        if (book.year() > 2000) {
            recent.add(book);
        }
    }

    for (Book book : recent) {
        IO.println(book.title() + " (" + book.year() + ")");
    }
}
```

The first loop keeps each book whose year is greater than 2000 in a new list, as the chapter's filtering does, and the second prints them. `> 2000` leaves out a book from 2000 itself, which is what "after" means.

```java
record Book(String title, String author, int year) {}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Neuromancer", "William Gibson", 1984),
            new Book("The Hobbit", "J.R.R. Tolkien", 1937),
            new Book("Project Hail Mary", "Andy Weir", 2021),
            new Book("Foundation", "Isaac Asimov", 1951)));

    for (Book book : books) {
        if (book.year() > 2000) {
            IO.println(String.format("%s (%d)", book.title(), book.year()));
        }
    }
}
```

The second answer prints each book as the loop finds it, with no list in between, and formats the line with `String.format`.

### mistake

`<` keeps the older books instead:

```java
record Book(String title, String author, int year) {}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Neuromancer", "William Gibson", 1984),
            new Book("The Hobbit", "J.R.R. Tolkien", 1937),
            new Book("Project Hail Mary", "Andy Weir", 2021),
            new Book("Foundation", "Isaac Asimov", 1951)));

    for (Book book : books) {
        if (book.year() < 2000) {
            IO.println(book.title() + " (" + book.year() + ")");
        }
    }
}
```

Printing the whole record, not its title and year:

```java
record Book(String title, String author, int year) {}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Neuromancer", "William Gibson", 1984),
            new Book("The Hobbit", "J.R.R. Tolkien", 1937),
            new Book("Project Hail Mary", "Andy Weir", 2021),
            new Book("Foundation", "Isaac Asimov", 1951)));

    for (Book book : books) {
        if (book.year() > 2000) {
            IO.println(book);
        }
    }
}
```

## ch10-records#17

Try It 5: the books grouped by author.

```java
// Groups the books by author.

record Book(String title, String author, int year) {}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Neuromancer", "William Gibson", 1984),
            new Book("The Hobbit", "J.R.R. Tolkien", 1937),
            new Book("Project Hail Mary", "Andy Weir", 2021),
            new Book("Foundation", "Isaac Asimov", 1951),
            new Book("Children of Dune", "Frank Herbert", 1976)));

    Map<String, ArrayList<String>> byAuthor = new TreeMap<>();
    for (Book book : books) {
        String author = book.author();
        if (!byAuthor.containsKey(author)) {
            byAuthor.put(author, new ArrayList<>());
        }
        byAuthor.get(author).add(book.title());
    }

    for (String author : byAuthor.keySet()) {
        IO.println(author + ": " + String.join(", ", byAuthor.get(author)));
    }
}
```

The first time the loop meets an author, the map has no list for them, so the `if` puts in an empty one; every book then adds its title to its author's list. The `TreeMap` keeps the authors in alphabetical order, and `String.join` puts a comma between Frank Herbert's two titles.

```java
record Book(String title, String author, int year) {}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Neuromancer", "William Gibson", 1984),
            new Book("The Hobbit", "J.R.R. Tolkien", 1937),
            new Book("Project Hail Mary", "Andy Weir", 2021),
            new Book("Foundation", "Isaac Asimov", 1951),
            new Book("Children of Dune", "Frank Herbert", 1976)));

    Map<String, ArrayList<String>> byAuthor = new LinkedHashMap<>();
    for (Book book : books) {
        ArrayList<String> titles = byAuthor.getOrDefault(book.author(), new ArrayList<>());
        titles.add(book.title());
        byAuthor.put(book.author(), titles);
    }

    ArrayList<String> authors = new ArrayList<>(byAuthor.keySet());
    Collections.sort(authors);
    for (String author : authors) {
        IO.println(author + ": " + String.join(", ", byAuthor.get(author)));
    }
}
```

The second answer takes an author's list, or a new empty one, with `getOrDefault`, and puts it back after adding the title. Its `LinkedHashMap` keeps the authors in the order they first appear, so it sorts a list of them before printing.

### mistake

A new list for every book replaces the one already there, so Frank Herbert keeps only Children of Dune:

```java
record Book(String title, String author, int year) {}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Neuromancer", "William Gibson", 1984),
            new Book("The Hobbit", "J.R.R. Tolkien", 1937),
            new Book("Project Hail Mary", "Andy Weir", 2021),
            new Book("Foundation", "Isaac Asimov", 1951),
            new Book("Children of Dune", "Frank Herbert", 1976)));

    Map<String, ArrayList<String>> byAuthor = new TreeMap<>();
    for (Book book : books) {
        byAuthor.put(book.author(), new ArrayList<>());
        byAuthor.get(book.author()).add(book.title());
    }

    for (String author : byAuthor.keySet()) {
        IO.println(author + ": " + String.join(", ", byAuthor.get(author)));
    }
}
```

A `LinkedHashMap` keeps the authors in the order they first appear, not in alphabetical order:

```java
record Book(String title, String author, int year) {}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Neuromancer", "William Gibson", 1984),
            new Book("The Hobbit", "J.R.R. Tolkien", 1937),
            new Book("Project Hail Mary", "Andy Weir", 2021),
            new Book("Foundation", "Isaac Asimov", 1951),
            new Book("Children of Dune", "Frank Herbert", 1976)));

    Map<String, ArrayList<String>> byAuthor = new LinkedHashMap<>();
    for (Book book : books) {
        if (!byAuthor.containsKey(book.author())) {
            byAuthor.put(book.author(), new ArrayList<>());
        }
        byAuthor.get(book.author()).add(book.title());
    }

    for (String author : byAuthor.keySet()) {
        IO.println(author + ": " + String.join(", ", byAuthor.get(author)));
    }
}
```

No map at all: a copy sorted by author prints one line per book, so Frank Herbert's two titles land on two lines:

```java
record Book(String title, String author, int year) {}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Neuromancer", "William Gibson", 1984),
            new Book("The Hobbit", "J.R.R. Tolkien", 1937),
            new Book("Project Hail Mary", "Andy Weir", 2021),
            new Book("Foundation", "Isaac Asimov", 1951),
            new Book("Children of Dune", "Frank Herbert", 1976)));

    ArrayList<Book> byAuthor = new ArrayList<>(books);
    byAuthor.sort(Comparator.comparing(book -> book.author()));
    for (Book book : byAuthor) {
        IO.println(book.author() + ": " + book.title());
    }
}
```

## ch10-records#18

Try It 6: `oldest`.

```java
record Book(String title, String author, int year) {}

/// Returns the record of the earliest published book.
Book oldest(ArrayList<Book> books) {
    Book earliest = books.get(0);
    for (Book book : books) {
        if (book.year() < earliest.year()) {
            earliest = book;
        }
    }
    return earliest;
}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Neuromancer", "William Gibson", 1984),
            new Book("The Hobbit", "J.R.R. Tolkien", 1937),
            new Book("Project Hail Mary", "Andy Weir", 2021),
            new Book("Foundation", "Isaac Asimov", 1951)));

    Book result = oldest(books);
    IO.println(result.title() + " (" + result.year() + ") by " + result.author());
}
```

`earliest` starts as the first book, and a book replaces it only when it is older. The method gives back the whole record, so the caller can read any part of it.

```java
record Book(String title, String author, int year) {}

Book oldest(ArrayList<Book> books) {
    ArrayList<Book> byYear = new ArrayList<>(books);
    byYear.sort(Comparator.comparing(book -> book.year()));
    return byYear.get(0);
}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Foundation", "Isaac Asimov", 1951)));
    IO.println(oldest(books));
}
```

The second answer sorts a copy by year and takes the first record, leaving the list it is handed as it was.

### mistake

`>` keeps the newest book instead:

```java
record Book(String title, String author, int year) {}

Book oldest(ArrayList<Book> books) {
    Book earliest = books.get(0);
    for (Book book : books) {
        if (book.year() > earliest.year()) {
            earliest = book;
        }
    }
    return earliest;
}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Foundation", "Isaac Asimov", 1951)));
    IO.println(oldest(books));
}
```

Comparing every book with the first one, not with the oldest so far, ends on the last book older than the first:

```java
record Book(String title, String author, int year) {}

Book oldest(ArrayList<Book> books) {
    Book earliest = books.get(0);
    for (Book book : books) {
        if (book.year() < books.get(0).year()) {
            earliest = book;
        }
    }
    return earliest;
}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Foundation", "Isaac Asimov", 1951)));
    IO.println(oldest(books));
}
```

Starting from a made-up book from year 0: no real book is older, so the made-up one comes back.

```java
record Book(String title, String author, int year) {}

Book oldest(ArrayList<Book> books) {
    Book earliest = new Book("", "", 0);
    for (Book book : books) {
        if (book.year() < earliest.year()) {
            earliest = book;
        }
    }
    return earliest;
}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Foundation", "Isaac Asimov", 1951)));
    IO.println(oldest(books));
}
```

## ch10-records#19

Try It 7: a tic-tac-toe board in a map.

```java
// A tic-tac-toe board in a map with Cell keys, printed as a grid.

record Cell(int row, int col) {}

void main() {
    Map<Cell, String> board = new LinkedHashMap<>();
    board.put(new Cell(0, 0), "X");
    board.put(new Cell(1, 1), "O");
    board.put(new Cell(0, 2), "X");
    board.put(new Cell(2, 0), "O");

    for (int row = 0; row < 3; row++) {
        ArrayList<String> cells = new ArrayList<>();
        for (int col = 0; col < 3; col++) {
            cells.add(board.getOrDefault(new Cell(row, col), "."));
        }
        IO.println(String.join(" ", cells));
    }
}
```

`getOrDefault` gives back the mark on a square, or `.` for a square the map has no entry for, so the map holds only the four squares that are taken. Each `new Cell(row, col)` made in the loop equals the cell its mark was put under.

```java
record Cell(int row, int col) {}

void main() {
    Map<Cell, String> board = new LinkedHashMap<>();
    board.put(new Cell(0, 0), "X");
    board.put(new Cell(0, 2), "X");
    board.put(new Cell(1, 1), "O");
    board.put(new Cell(2, 0), "O");

    for (int row = 0; row < 3; row++) {
        for (int col = 0; col < 3; col++) {
            Cell cell = new Cell(row, col);
            String mark = board.containsKey(cell) ? board.get(cell) : ".";
            IO.print(mark + " ");
        }
        IO.println();
    }
}
```

The second answer asks `containsKey` in a conditional expression and prints each square as it goes, a space after each; the space at the end of a line does not show.

### mistake

Row and column swapped in the lookup: the board comes out turned on its side.

```java
record Cell(int row, int col) {}

void main() {
    Map<Cell, String> board = new LinkedHashMap<>();
    board.put(new Cell(0, 0), "X");
    board.put(new Cell(1, 1), "O");
    board.put(new Cell(0, 2), "X");
    board.put(new Cell(2, 0), "O");

    for (int row = 0; row < 3; row++) {
        ArrayList<String> cells = new ArrayList<>();
        for (int col = 0; col < 3; col++) {
            cells.add(board.getOrDefault(new Cell(col, row), "."));
        }
        IO.println(String.join(" ", cells));
    }
}
```

`get` gives back `null` for an empty square, and `null` is what prints:

```java
record Cell(int row, int col) {}

void main() {
    Map<Cell, String> board = new LinkedHashMap<>();
    board.put(new Cell(0, 0), "X");
    board.put(new Cell(1, 1), "O");
    board.put(new Cell(0, 2), "X");
    board.put(new Cell(2, 0), "O");

    for (int row = 0; row < 3; row++) {
        for (int col = 0; col < 3; col++) {
            IO.print(board.get(new Cell(row, col)) + " ");
        }
        IO.println();
    }
}
```

## ch10-records-practice#1

```java
record Service(String route, int departs, String destination) {}

String routeOf(Service service) {
    String route = service.route();
    int departs = service.departs();
    String destination = service.destination();
    return route;
}

void main() {
    Service service = new Service("47", 415, "Harbor");
    IO.println(routeOf(service));
}
```

The three lines name every part of a service, so whoever reads `routeOf` next sees at once what a service holds, and the method gives back the one it was asked for.

```java
record Service(String route, int departs, String destination) {}

String routeOf(Service service) {
    return service.route();
}

void main() {
    IO.println(routeOf(new Service("12", 380, "Museum")));
}
```

The second answer calls only the accessor it needs. It gives back the same route, but tells the next reader less about what a service holds.

### mistake

The wrong variable handed back:

```java
record Service(String route, int departs, String destination) {}

String routeOf(Service service) {
    String route = service.route();
    int departs = service.departs();
    String destination = service.destination();
    return destination;
}

void main() {
    IO.println(routeOf(new Service("47", 415, "Harbor")));
}
```

## ch10-records-practice#2

```java
String clock(int minutes) {
    return String.format("%02d:%02d", minutes / 60, minutes % 60);
}

void main() {
    IO.println(clock(380));
    IO.println(clock(0));
}
```

`%02d` pads to two digits with a zero. Without it, five past ten prints as 10:5 and the timetable stops lining up.

```java
String clock(int minutes) {
    int hours = minutes / 60;
    int mins = minutes % 60;
    String hh = hours < 10 ? "0" + hours : "" + hours;
    String mm = mins < 10 ? "0" + mins : "" + mins;
    return hh + ":" + mm;
}

void main() {
    IO.println(clock(605));
}
```

The second answer pads each half by hand, a `0` in front of a number below 10, with two conditional expressions.

### mistake

No padding: 415 comes out as 6:55.

```java
String clock(int minutes) {
    return minutes / 60 + ":" + minutes % 60;
}

void main() {
    IO.println(clock(415));
}
```

## ch10-records-practice#3

```java
record Service(String route, int departs, String destination) {}

ArrayList<String> destinations(ArrayList<Service> services) {
    Set<String> places = new TreeSet<>();
    for (Service service : services) {
        places.add(service.destination());
    }
    return new ArrayList<>(places);
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("12", 380, "Museum"),
            new Service("47", 415, "Harbor"),
            new Service("47", 500, "Harbor")));
    IO.println(destinations(services));
}
```

Two services run to the Harbor, so without the set it would appear twice. A `TreeSet` holds each destination once and keeps them sorted, and a new `ArrayList` hands them back as a list.

```java
record Service(String route, int departs, String destination) {}

ArrayList<String> destinations(ArrayList<Service> services) {
    ArrayList<String> places = new ArrayList<>();
    for (Service service : services) {
        if (!places.contains(service.destination())) {
            places.add(service.destination());
        }
    }
    Collections.sort(places);
    return places;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("47", 415, "Harbor"),
            new Service("9", 1000, "Airport")));
    IO.println(destinations(services));
}
```

The second answer uses a list, adding a destination only when the list does not hold it yet, then sorts it.

### mistake

No set: the Harbor appears twice.

```java
record Service(String route, int departs, String destination) {}

ArrayList<String> destinations(ArrayList<Service> services) {
    ArrayList<String> places = new ArrayList<>();
    for (Service service : services) {
        places.add(service.destination());
    }
    Collections.sort(places);
    return places;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("47", 415, "Harbor"),
            new Service("47", 500, "Harbor")));
    IO.println(destinations(services));
}
```

A `LinkedHashSet` removes the repeats but keeps the order the services came in, not alphabetical order:

```java
record Service(String route, int departs, String destination) {}

ArrayList<String> destinations(ArrayList<Service> services) {
    Set<String> places = new LinkedHashSet<>();
    for (Service service : services) {
        places.add(service.destination());
    }
    return new ArrayList<>(places);
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("12", 380, "Museum"),
            new Service("47", 415, "Harbor")));
    IO.println(destinations(services));
}
```

`==` asks whether two `String`s are the same object, and a destination made while the program runs is a different object from one written in the code, so the Harbor can go in twice:

```java
record Service(String route, int departs, String destination) {}

ArrayList<String> destinations(ArrayList<Service> services) {
    ArrayList<String> places = new ArrayList<>();
    for (Service service : services) {
        boolean seen = false;
        for (String place : places) {
            if (place == service.destination()) {
                seen = true;
            }
        }
        if (!seen) {
            places.add(service.destination());
        }
    }
    Collections.sort(places);
    return places;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("47", 415, "Harbor"),
            new Service("47", 500, " Harbor".strip())));
    IO.println(destinations(services));
}
```

## ch10-records-practice#4

```java
record Service(String route, int departs, String destination) {}

Service nextAfter(ArrayList<Service> services, int minute) {
    ArrayList<Service> sorted = new ArrayList<>(services);
    sorted.sort(Comparator.comparing(service -> service.departs()));
    for (Service service : sorted) {
        if (service.departs() > minute) {
            return service;
        }
    }
    return null;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("12", 380, "Museum"),
            new Service("47", 415, "Harbor"),
            new Service("47", 500, "Harbor")));
    IO.println(nextAfter(services, 400));
    IO.println(nextAfter(services, 600));
}
```

Strictly after, so the bus leaving at exactly that minute is the one you just missed. Sorting a copy first means the first match found is the earliest, and `null` after the loop says that no bus is left.

```java
record Service(String route, int departs, String destination) {}

Service nextAfter(ArrayList<Service> services, int minute) {
    Service best = null;
    for (Service service : services) {
        if (service.departs() > minute
                && (best == null || service.departs() < best.departs())) {
            best = service;
        }
    }
    return best;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("47", 500, "Harbor"),
            new Service("12", 380, "Museum")));
    IO.println(nextAfter(services, 400));
}
```

The second answer keeps the earliest bus after the minute seen so far, starting from `null`, so it needs no sort; when no bus qualifies, `best` is still `null` at the end.

### mistake

`>=` hands back the bus leaving at that very minute:

```java
record Service(String route, int departs, String destination) {}

Service nextAfter(ArrayList<Service> services, int minute) {
    ArrayList<Service> sorted = new ArrayList<>(services);
    sorted.sort(Comparator.comparing(service -> service.departs()));
    for (Service service : sorted) {
        if (service.departs() >= minute) {
            return service;
        }
    }
    return null;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("12", 380, "Museum"),
            new Service("47", 415, "Harbor")));
    IO.println(nextAfter(services, 415));
}
```

When the day is done, the last bus instead of `null`:

```java
record Service(String route, int departs, String destination) {}

Service nextAfter(ArrayList<Service> services, int minute) {
    ArrayList<Service> sorted = new ArrayList<>(services);
    sorted.sort(Comparator.comparing(service -> service.departs()));
    for (Service service : sorted) {
        if (service.departs() > minute) {
            return service;
        }
    }
    return sorted.get(sorted.size() - 1);
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("12", 380, "Museum"),
            new Service("47", 415, "Harbor")));
    IO.println(nextAfter(services, 600));
}
```

No sort: the first bus in the list after that minute, which is not the earliest when the services come out of order:

```java
record Service(String route, int departs, String destination) {}

Service nextAfter(ArrayList<Service> services, int minute) {
    for (Service service : services) {
        if (service.departs() > minute) {
            return service;
        }
    }
    return null;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("47", 500, "Harbor"),
            new Service("12", 380, "Museum"),
            new Service("47", 415, "Harbor")));
    IO.println(nextAfter(services, 400));
}
```

## ch10-records-practice#5

```java
record Service(String route, int departs, String destination) {}

ArrayList<Service> byTime(ArrayList<Service> services) {
    ArrayList<Service> sorted = new ArrayList<>(services);
    sorted.sort(Comparator.comparing(service -> service.departs()));
    return sorted;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("47", 500, "Harbor"),
            new Service("12", 380, "Museum"),
            new Service("47", 415, "Harbor")));
    IO.println(byTime(services));
}
```

The comparator says which part to sort on, the departure. Sorting a copy leaves the list it is handed as it was.

```java
record Service(String route, int departs, String destination) {}

ArrayList<Service> byTime(ArrayList<Service> services) {
    ArrayList<Service> left = new ArrayList<>(services);
    ArrayList<Service> sorted = new ArrayList<>();
    while (!left.isEmpty()) {
        int earliest = 0;
        for (int i = 1; i < left.size(); i++) {
            if (left.get(i).departs() < left.get(earliest).departs()) {
                earliest = i;
            }
        }
        sorted.add(left.remove(earliest));
    }
    return sorted;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("12", 380, "Museum"),
            new Service("9", 300, "Airport")));
    IO.println(byTime(services));
}
```

The second answer sorts by hand, as Chapter 7 did before comparators: it takes the earliest service left, again and again.

### mistake

Sorting by the route: route 12 comes before route 9, since `"12"` comes before `"9"` as text.

```java
record Service(String route, int departs, String destination) {}

ArrayList<Service> byTime(ArrayList<Service> services) {
    ArrayList<Service> sorted = new ArrayList<>(services);
    sorted.sort(Comparator.comparing(service -> service.route()));
    return sorted;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("12", 380, "Museum"),
            new Service("9", 300, "Airport")));
    IO.println(byTime(services));
}
```

`.reversed()` puts the last bus first:

```java
record Service(String route, int departs, String destination) {}

ArrayList<Service> byTime(ArrayList<Service> services) {
    ArrayList<Service> sorted = new ArrayList<>(services);
    sorted.sort(Comparator.comparing((Service s) -> s.departs()).reversed());
    return sorted;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("12", 380, "Museum"),
            new Service("9", 300, "Airport")));
    IO.println(byTime(services));
}
```

## ch10-records-practice#6

```java
record Service(String route, int departs, String destination) {}

Map<String, Integer> countByRoute(ArrayList<Service> services) {
    Map<String, Integer> counts = new LinkedHashMap<>();
    for (Service service : services) {
        String route = service.route();
        if (!counts.containsKey(route)) {
            counts.put(route, 0);
        }
        counts.put(route, counts.get(route) + 1);
    }
    return counts;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("12", 380, "Museum"),
            new Service("47", 415, "Harbor"),
            new Service("47", 500, "Harbor")));
    IO.println(countByRoute(services));
}
```

The `if` puts a 0 there only when nothing is there yet, so the line after it can always add one. Route 47 runs twice, which is what catches a version that puts 1.

```java
record Service(String route, int departs, String destination) {}

Map<String, Integer> countByRoute(ArrayList<Service> services) {
    Map<String, Integer> counts = new TreeMap<>();
    for (Service service : services) {
        counts.put(service.route(), counts.getOrDefault(service.route(), 0) + 1);
    }
    return counts;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("47", 415, "Harbor"),
            new Service("47", 500, "Harbor")));
    IO.println(countByRoute(services));
}
```

The second answer is Chapter 9's counting pattern, `getOrDefault(route, 0) + 1`, which does the same in one line. Check compares maps by their keys and values, so the `TreeMap` makes no difference.

### mistake

Putting 1 every time counts route 47 once:

```java
record Service(String route, int departs, String destination) {}

Map<String, Integer> countByRoute(ArrayList<Service> services) {
    Map<String, Integer> counts = new LinkedHashMap<>();
    for (Service service : services) {
        counts.put(service.route(), 1);
    }
    return counts;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("47", 415, "Harbor"),
            new Service("47", 500, "Harbor")));
    IO.println(countByRoute(services));
}
```

## ch10-records-practice#7

```java
String label(int minute) {
    return (minute >= 420 && minute < 560) || (minute >= 960 && minute < 1140)
            ? "peak"
            : "off-peak";
}

void main() {
    IO.println(label(415));
    IO.println(label(500));
}
```

Up to but not including, so 560 is already off-peak. The cases sit on the boundaries because that is the only place this can be wrong.

```java
String label(int minute) {
    boolean morning = minute >= 420 && minute < 560;
    boolean evening = minute >= 960 && minute < 1140;
    return morning || evening ? "peak" : "off-peak";
}

void main() {
    IO.println(label(960));
}
```

The second answer names each peak with a `boolean` first, which keeps the conditional expression short.

### mistake

`<=` at the end of each peak makes 560 and 1140 peak:

```java
String label(int minute) {
    return (minute >= 420 && minute <= 560) || (minute >= 960 && minute <= 1140)
            ? "peak"
            : "off-peak";
}

void main() {
    IO.println(label(560));
}
```

The evening peak left out:

```java
String label(int minute) {
    return minute >= 420 && minute < 560 ? "peak" : "off-peak";
}

void main() {
    IO.println(label(1000));
}
```

## ch10-records-practice#8

```java
record Service(String route, int departs, String destination) {}

String clock(int minutes) {
    return String.format("%02d:%02d", minutes / 60, minutes % 60);
}

ArrayList<Service> byTime(ArrayList<Service> services) {
    ArrayList<Service> sorted = new ArrayList<>(services);
    sorted.sort(Comparator.comparing(service -> service.departs()));
    return sorted;
}

ArrayList<String> timetableLines(ArrayList<Service> services) {
    ArrayList<String> lines = new ArrayList<>();
    for (Service service : byTime(services)) {
        lines.add(service.route() + " " + clock(service.departs()) + " "
                + service.destination());
    }
    return lines;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("47", 500, "Harbor"),
            new Service("12", 380, "Museum"),
            new Service("47", 415, "Harbor")));
    for (String line : timetableLines(services)) {
        IO.println(line);
    }
}
```

Two methods you already wrote, used rather than repeated. The check passes the services out of order on purpose.

```java
record Service(String route, int departs, String destination) {}

String clock(int minutes) {
    return String.format("%02d:%02d", minutes / 60, minutes % 60);
}

ArrayList<Service> byTime(ArrayList<Service> services) {
    ArrayList<Service> sorted = new ArrayList<>(services);
    sorted.sort(Comparator.comparing(service -> service.departs()));
    return sorted;
}

ArrayList<String> timetableLines(ArrayList<Service> services) {
    ArrayList<Service> ordered = byTime(services);
    ArrayList<String> lines = new ArrayList<>();
    for (int i = 0; i < ordered.size(); i++) {
        Service service = ordered.get(i);
        lines.add(String.format("%s %s %s", service.route(),
                clock(service.departs()), service.destination()));
    }
    return lines;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("9", 1000, "Airport")));
    IO.println(timetableLines(services));
}
```

The second answer keeps `byTime`'s list in a variable, walks it by index, and builds each line with `String.format` around `clock`'s result.

### mistake

No sort: the lines come out in the order the services were given.

```java
record Service(String route, int departs, String destination) {}

String clock(int minutes) {
    return String.format("%02d:%02d", minutes / 60, minutes % 60);
}

ArrayList<String> timetableLines(ArrayList<Service> services) {
    ArrayList<String> lines = new ArrayList<>();
    for (Service service : services) {
        lines.add(service.route() + " " + clock(service.departs()) + " "
                + service.destination());
    }
    return lines;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("47", 500, "Harbor"),
            new Service("12", 380, "Museum")));
    IO.println(timetableLines(services));
}
```

The departure in minutes, not as a clock: `47 415 Harbor`.

```java
record Service(String route, int departs, String destination) {}

ArrayList<String> timetableLines(ArrayList<Service> services) {
    ArrayList<Service> sorted = new ArrayList<>(services);
    sorted.sort(Comparator.comparing(service -> service.departs()));

    ArrayList<String> lines = new ArrayList<>();
    for (Service service : sorted) {
        lines.add(service.route() + " " + service.departs() + " " + service.destination());
    }
    return lines;
}

void main() {
    ArrayList<Service> services = new ArrayList<>(List.of(
            new Service("47", 415, "Harbor")));
    IO.println(timetableLines(services));
}
```
