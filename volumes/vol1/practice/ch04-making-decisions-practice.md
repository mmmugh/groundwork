# Practice: a launch console

The model rocket club will not fly unless four readings are within limits, and at the moment somebody checks them on a clipboard. You are going to build the console that does it, one reading at a time, ending with a program that reads all four and gives a verdict.

The limits are:

| Reading | Safe |
| --- | --- |
| Wind | under 30 mph |
| Temperature | 2 to 35 °C, ends included |
| Cloud ceiling | 2000 feet or more |
| Fuel | 95 percent or more |

Everything here uses Chapters 1 to 4: variables, `IO.readln`, `Double.parseDouble` and `Integer.parseInt`, arithmetic, comparisons, `&&`, `||` and `!`, `String.format`, `if`, `else if` and `else`, and `try` and `catch`. No loops—so each program asks for each reading exactly once, in the order **wind, temperature, ceiling, fuel**.

Each step names the exact line it must print. The wording around it is yours.

## Steps

**Step 1.** Ask for the wind speed in mph and print it back to one decimal place, as `Wind: 12.5 mph`. Remember that `IO.readln` gives back a `String`.

```java
void main() {
    double wind = Double.parseDouble(IO.readln("Wind speed in mph? ").strip());
    IO.println("Wind: " + String.format("%.1f", wind) + " mph");
}
```

**Step 2.** Now judge it. Print `Wind: OK` when the speed is under 30, and `Wind: TOO STRONG` otherwise. 30 exactly is too strong.

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

**Step 3.** Ask for the temperature in °C and print `Temperature: OK` when it is from 2 to 35 with both ends allowed, and `Temperature: OUT OF RANGE` otherwise. One `if`, with `&&`.

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

**Step 4.** Ask for the cloud ceiling in feet and sort it into three bands with an `else if` chain: `Ceiling: CLEAR` at 5000 or above, `Ceiling: MARGINAL` from 2000 to 4999, and `Ceiling: TOO LOW` below 2000. Put the narrow test before the broad one, or one branch will never run.

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

**Step 5.** Ask for the fuel as a whole-number percentage, but do not trust it: convert it with `Integer.parseInt` inside a `try`, and print `Fuel: 97%` with the number that was typed. If `Integer.parseInt` throws, catch the `NumberFormatException` and print `Fuel: NOT A NUMBER` instead.

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

**Step 6.** Put all four together. Ask for all four readings in order, then print one verdict line: `LAUNCH: GO` when every reading is safe, `LAUNCH: NO GO` when any of them is not. Fuel that is not a number counts as not safe.

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

**Step 7.** A bare refusal is no use to anyone. After a `LAUNCH: NO GO`, print the first thing that failed, checked in the order wind, temperature, ceiling, fuel, as `HOLD: wind`, `HOLD: temperature`, `HOLD: ceiling` or `HOLD: fuel`. Print nothing extra when the verdict is `LAUNCH: GO`.

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

**Step 8.** Finish the console: ask for the four readings, print the four status lines from steps 2 to 5, then the verdict, then the `HOLD:` line if there is one.

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
