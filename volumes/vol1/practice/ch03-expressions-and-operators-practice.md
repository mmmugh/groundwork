# Practice: a pizza party splitter

Games night, and somebody has to work out how many pizzas to order and what everyone owes. It is the same argument every month. You are going to settle it with a program.

The shop sells one size: **8 slices, 13.50 a pizza**, whole pizzas only.

Everything here uses Chapters 1 to 3: variables, `IO.readln`, `Integer.parseInt`, arithmetic, `/` and `%`, `Math.pow`, `String.format`, `Math.round`, and the comparison operators. There is still no `if`—that is Chapter 4—so where this asks a yes-or-no question, print the comparison itself and let it show `true` or `false`.

One trick you will need in step 2. Ordering whole pizzas means rounding *up*, and `/` on two `int`s drops the fraction, which for these numbers rounds down. Adding 7 before dividing by 8 fixes that: 15 slices becomes `22 / 8`, which is 2. Any number of slices that is already a multiple of 8 is unaffected.

## Steps

**Step 1.** Ask how many people are coming and how many slices each one eats, then print the total number of slices needed. Both answers are whole numbers.

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int slices = people * each;
    IO.println("You need " + slices + " slices");
}
```

**Step 2.** Print how many whole pizzas to order, rounding up as described above.

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int slices = people * each;
    int pizzas = (slices + 7) / 8;
    IO.println("Order " + pizzas + " pizzas");
}
```

**Step 3.** Print how many slices will be left in the boxes afterward—that is, the slices ordered minus the slices eaten.

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int slices = people * each;
    int pizzas = (slices + 7) / 8;
    IO.println((pizzas * 8 - slices) + " slices left over");
}
```

**Step 4.** Print what the order costs at 13.50 a pizza, to two decimal places. `String.format` with `%.2f` does the formatting.

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

**Step 5.** Print what each person owes, split evenly and rounded to the nearest penny.

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

**Step 6.** Print whether a single pizza would have been enough, as a comparison that shows `true` or `false`.

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    int each = Integer.parseInt(IO.readln("Slices each? ").strip());
    int slices = people * each;
    IO.println("Would one pizza have done? " + (slices <= 8));
}
```

**Step 7.** The shop adds 15% for delivery. Print the new total and the new share each, both to two decimal places.

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

**Step 8.** Put it together: ask for the two numbers, then print the slices needed, the pizzas to order, the slices left over, the cost, the delivery total, and what each person owes with delivery included.

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
