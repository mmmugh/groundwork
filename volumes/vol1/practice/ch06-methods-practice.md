# Practice: a unit converter toolkit

Every recipe in the box is American, the oven dial is in Fahrenheit, and the running app is in kilometers. You keep doing the same conversions by hand. This time you are going to write them down once, as methods, and then use them.

Everything here uses Chapters 1 to 6. A method gives back one value, so where there are two things to report, each one gets a method of its own.

The conversions:

| From | To | Multiply by |
| --- | --- | --- |
| Celsius | Fahrenheit | 1.8 (9 divided by 5), then add 32 |
| Kilometers | Miles | 0.621371 |
| Cups | Milliliters | 236.588 |

Each step names the method exactly: its return type, its name and its parameters. That is the contract the check calls, so write it as given; everything inside is up to you. To round to one decimal place, Chapter 3's `Math.round(x * 10) / 10.0` does it, and to two places, `Math.round(x * 100) / 100.0`.

## Steps

**Step 1.** Write `double cToF(double celsius)`, returning the temperature in Fahrenheit rounded to one decimal place. Check it against the two you know: 100 is 212, and 0 is 32.

```java
double cToF(double celsius) {
    return Math.round((celsius * 9 / 5 + 32) * 10) / 10.0;
}

void main() {
    IO.println(cToF(100));
    IO.println(cToF(0));
}
```

**Step 2.** Write `double fToC(double fahrenheit)` going the other way, also rounded to one decimal place. There is exactly one temperature where both methods agree; if you are curious, look for it.

```java
double fToC(double fahrenheit) {
    return Math.round((fahrenheit - 32) * 5 / 9 * 10) / 10.0;
}

void main() {
    IO.println(fToC(212));
    IO.println(fToC(32));
}
```

**Step 3.** Write `double kmToMiles(double km)`, rounded to two decimal places.

```java
double kmToMiles(double km) {
    return Math.round(km * 0.621371 * 100) / 100.0;
}

void main() {
    IO.println(kmToMiles(10));
}
```

**Step 4.** Write `double cupsToMl(double cups)`, rounded to one decimal place.

```java
double cupsToMl(double cups) {
    return Math.round(cups * 236.588 * 10) / 10.0;
}

void main() {
    IO.println(cupsToMl(1));
}
```

**Step 5.** Oven dials only go in 25s. Write `int ovenSetting(double celsius)` that converts to Fahrenheit and rounds to the nearest 25—so 180 becomes 350. Call `cToF` rather than repeating its arithmetic: the box starts with one. `Math.round` gives back a `long`, so Chapter 2's `(int)` cast turns its answer into the `int` this method returns.

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

**Step 6.** A method gives back one value, so hours and minutes take a method each. Write `int hoursIn(int totalMinutes)` and `int minutesLeft(int totalMinutes)`, then use them to print 90, 45 and 125 minutes on three lines, each reading like `90 minutes is 1 h 30 min`.

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

**Step 7.** Write `double scaleRecipe(double amount, double factor)`—two parameters this time—returning the amount multiplied by the factor, rounded to two decimal places, so half a recipe or a triple one is a single call.

```java
double scaleRecipe(double amount, double factor) {
    return Math.round(amount * factor * 100) / 100.0;
}

void main() {
    IO.println(scaleRecipe(200, 0.5));
}
```

**Step 8.** Put three of them in one program and print a small table, one line each: `180 C is 356.0 F`, `5 km is 3.11 miles` and `2 cups is 473.2 ml`. Bring in your `cToF`, `kmToMiles` and `cupsToMl` from steps 1, 3 and 4.

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
