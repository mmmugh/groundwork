# Practice: a hiking trip planner

The Kettle Ridge trail is 12.4 km, and every time somebody plans a day on it they do the same sums on the back of an envelope: how long it takes, how much water to carry, what the permits come to. You are going to write the planner.

Everything here uses only Chapters 1 and 2: variables, `IO.readln`, `Integer.parseInt` and `Double.parseDouble`, and arithmetic. No `String.format` and no `if`—those are Chapters 3 and 4, so every line you print is built from `IO.println` and `+`.

The numbers the planner works from:

| Quantity | Value |
| --- | --- |
| Trail length | 12.4 km |
| Water | 0.75 liters per hour of walking |
| Permit | 4.50 per person |

Walking pace varies by person, so that one is always asked for, in minutes per kilometer. A steady walker does about 11.

## Steps

**Step 1.** Put the trail name `Kettle Ridge` and its length `12.4` into two variables, then print `Kettle Ridge is 12.4 km` from them. Join the pieces with `+`, which adds no spaces of its own, so the spaces go inside the strings.

```java
void main() {
    String trail = "Kettle Ridge";
    double distanceKm = 12.4;
    IO.println(trail + " is " + distanceKm + " km");
}
```

**Step 2.** Ask for a walking pace in minutes per kilometer and print how many minutes the trail takes. Remember that `IO.readln` gives back a `String`: multiply 12.4 by that string and javac will refuse, so convert it first.

```java
void main() {
    double distanceKm = 12.4;
    String answer = IO.readln("Pace in minutes per km? ");
    double pace = Double.parseDouble(answer.strip());
    double minutes = distanceKm * pace;
    IO.println("That takes " + minutes + " minutes");
}
```

**Step 3.** Minutes are hard to picture. Print the time in hours as well as minutes, by dividing.

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

**Step 4.** Work out the water. At 0.75 liters for every hour walked, print how many liters one person needs—and note that it is liters per *hour*, not per minute.

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

**Step 5.** Ask how many people are going, and print the water the group needs altogether.

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

**Step 6.** Ask how many people are going, and print what the permits cost, at 4.50 each.

```java
void main() {
    int people = Integer.parseInt(IO.readln("How many people? ").strip());
    IO.println("Permits: " + (4.50 * people));
}
```

**Step 7.** Put the planner together: ask for the trail length, the pace, and the group size, then print the length, the time in minutes, the time in hours, the water for one person, the water for the group, and the permit total.

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
