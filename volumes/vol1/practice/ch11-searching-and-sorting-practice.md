# Practice: a race leaderboard

The parkrun finishes and somebody has a clipboard of names and times in the order people crossed the line, which is very nearly the order you want but not quite—the timekeeper writes them down as they are handed in. A result is a record, `record Result(String name, double seconds) {}`. Printed, one looks like this:

```text
Result[name=Priya, seconds=57.4]
```

Name, and seconds. You are going to build the leaderboard.

Everything here uses Chapters 1 to 11: lists, records, `Comparator.comparing`, and the searching and sorting from this chapter.

The results to test with, in the order they were handed in:

| Name | Seconds |
| --- | --- |
| Nadia | 58.2 |
| Omar | 61.0 |
| Priya | 57.4 |
| Quinn | 63.5 |

Nothing here may assume the results arrive in order, because they do not. Nothing here may change the list or array it is handed, either: where something needs reordering, sort a copy.

Each step names the method exactly: its return type, its name and its parameters. Check calls it with the cases under "What it should do," and those cases make each result with `new Result(...)` and each list with `new ArrayList<>(List.of(...))`, as in Chapter 10. Steps 2 and 7 are the exceptions: Check runs the program and reads what it prints, because what they do to the list or array they are handed shows only there. A case written `" Omar".strip()` is the plain name `"Omar"` made while the program runs, so an answer that compares names with `==` fails it, as in Chapter 7's practice: compare text with `.equals`. Every box that works with results declares the `Result` record on its first line, since each box is a whole program: keep that line.

## Steps

**Step 1.** Write `String fastestName(ArrayList<Result> results)`, returning the name of the winner. The fastest time is the smallest number.

```java
record Result(String name, double seconds) {}

String fastestName(ArrayList<Result> results) {
    Result best = results.get(0);
    for (Result result : results) {
        if (result.seconds() < best.seconds()) {
            best = result;
        }
    }
    return best.name();
}

void main() {
    ArrayList<Result> results = new ArrayList<>(List.of(
            new Result("Nadia", 58.2),
            new Result("Omar", 61.0),
            new Result("Priya", 57.4),
            new Result("Quinn", 63.5)));
    IO.println(fastestName(results));
}
```

**Step 2.** Write `ArrayList<Result> ranked(ArrayList<Result> results)`, returning a new list of the results ordered fastest first. Check runs the program: the runners in finishing order, then the first name handed in, which must still be Nadia; the program also ranks an empty race and a two-runner one.

```java
record Result(String name, double seconds) {}

ArrayList<Result> ranked(ArrayList<Result> results) {
    ArrayList<Result> sorted = new ArrayList<>(results);
    sorted.sort(Comparator.comparing(result -> result.seconds()));
    return sorted;
}

void main() {
    ArrayList<Result> results = new ArrayList<>(List.of(
            new Result("Nadia", 58.2),
            new Result("Omar", 61.0),
            new Result("Priya", 57.4),
            new Result("Quinn", 63.5)));
    for (Result result : ranked(results)) {
        IO.println(result.name() + " " + result.seconds());
    }
    IO.println("Handed in first: " + results.get(0).name());
    IO.println(ranked(new ArrayList<>()));
    IO.println(ranked(new ArrayList<>(List.of(
            new Result("Omar", 61.0),
            new Result("Priya", 57.4)))));
}
```

**Step 3.** Write `int placeOf(ArrayList<Result> results, String name)`, returning the place somebody finished in, counting from 1, or -1 for a name that did not run. Bring in your `ranked` from step 2, and use it.

```java
record Result(String name, double seconds) {}

ArrayList<Result> ranked(ArrayList<Result> results) {
    ArrayList<Result> sorted = new ArrayList<>(results);
    sorted.sort(Comparator.comparing(result -> result.seconds()));
    return sorted;
}

int placeOf(ArrayList<Result> results, String name) {
    ArrayList<Result> order = ranked(results);
    for (int i = 0; i < order.size(); i++) {
        if (order.get(i).name().equals(name)) {
            return i + 1;
        }
    }
    return -1;
}

void main() {
    ArrayList<Result> results = new ArrayList<>(List.of(
            new Result("Nadia", 58.2),
            new Result("Omar", 61.0),
            new Result("Priya", 57.4),
            new Result("Quinn", 63.5)));
    IO.println(placeOf(results, "Priya"));
    IO.println(placeOf(results, "Zed"));
}
```

**Step 4.** Write `Result resultFor(ArrayList<Result> results, String name)`, returning that runner's whole record, or `null` for a name that did not run. This is a linear search: the results are not sorted by name, so there is nothing cleverer available.

```java
record Result(String name, double seconds) {}

Result resultFor(ArrayList<Result> results, String name) {
    for (Result result : results) {
        if (result.name().equals(name)) {
            return result;
        }
    }
    return null;
}

void main() {
    ArrayList<Result> results = new ArrayList<>(List.of(
            new Result("Nadia", 58.2),
            new Result("Omar", 61.0),
            new Result("Priya", 57.4),
            new Result("Quinn", 63.5)));
    IO.println(resultFor(results, "Omar"));
    IO.println(resultFor(results, "Zed"));
}
```

**Step 5.** A separate screen keeps the finishing times in a sorted array and needs to slot new ones in. Write `int insertionPoint(double[] times, double target)`, returning the index where the target belongs to keep the array sorted, using a binary search rather than scanning. A time equal to one already there goes *before* it.

```java
int insertionPoint(double[] times, double target) {
    int low = 0;
    int high = times.length;
    while (low < high) {
        int middle = (low + high) / 2;
        if (times[middle] < target) {
            low = middle + 1;
        } else {
            high = middle;
        }
    }
    return low;
}

void main() {
    double[] times = {57.4, 58.2, 61.0};
    IO.println(insertionPoint(times, 60.0));
    IO.println(insertionPoint(times, 58.2));
}
```

**Step 6.** Write `ArrayList<String> podium(ArrayList<Result> results)`, returning the first three names, fastest first. A race with fewer than three finishers returns as many as there were. Bring in your `ranked` from step 2.

```java
record Result(String name, double seconds) {}

ArrayList<Result> ranked(ArrayList<Result> results) {
    ArrayList<Result> sorted = new ArrayList<>(results);
    sorted.sort(Comparator.comparing(result -> result.seconds()));
    return sorted;
}

ArrayList<String> podium(ArrayList<Result> results) {
    ArrayList<String> names = new ArrayList<>();
    for (Result result : ranked(results)) {
        if (names.size() < 3) {
            names.add(result.name());
        }
    }
    return names;
}

void main() {
    ArrayList<Result> results = new ArrayList<>(List.of(
            new Result("Nadia", 58.2),
            new Result("Omar", 61.0),
            new Result("Priya", 57.4),
            new Result("Quinn", 63.5)));
    IO.println(podium(results));
}
```

**Step 7.** Write `double[] sortTimes(double[] times)`, returning the times in order, sorted by hand with one of this chapter's sorts rather than by calling `Arrays.sort`. Leave the array you were given alone. Check runs the program, and its second line, the array you were given, must still be in the order it was handed in.

```java
double[] sortTimes(double[] times) {
    double[] out = Arrays.copyOf(times, times.length);
    for (int i = 1; i < out.length; i++) {
        double current = out[i];
        int j = i - 1;
        while (j >= 0 && out[j] > current) {
            out[j + 1] = out[j];
            j--;
        }
        out[j + 1] = current;
    }
    return out;
}

void main() {
    double[] times = {61.0, 57.4, 58.2};
    IO.println(Arrays.toString(sortTimes(times)));
    IO.println(Arrays.toString(times));
    IO.println(Arrays.toString(sortTimes(new double[] {3.0, 1.0, 2.0, 5.0, 4.0})));
    IO.println(Arrays.toString(sortTimes(new double[] {1.0})));
    IO.println(Arrays.toString(sortTimes(new double[] {2.0, 1.0})));
    IO.println(Arrays.toString(sortTimes(new double[] {})));
}
```

**Step 8.** Write `ArrayList<String> leaderboardLines(ArrayList<Result> results)`, returning the printable leaderboard, one string per runner reading `1. Priya 57.4`, in finishing order. Bring in your `ranked` from step 2.

```java
record Result(String name, double seconds) {}

ArrayList<Result> ranked(ArrayList<Result> results) {
    ArrayList<Result> sorted = new ArrayList<>(results);
    sorted.sort(Comparator.comparing(result -> result.seconds()));
    return sorted;
}

ArrayList<String> leaderboardLines(ArrayList<Result> results) {
    ArrayList<String> lines = new ArrayList<>();
    ArrayList<Result> order = ranked(results);
    for (int i = 0; i < order.size(); i++) {
        Result result = order.get(i);
        lines.add((i + 1) + ". " + result.name() + " " + result.seconds());
    }
    return lines;
}

void main() {
    ArrayList<Result> results = new ArrayList<>(List.of(
            new Result("Nadia", 58.2),
            new Result("Omar", 61.0),
            new Result("Priya", 57.4),
            new Result("Quinn", 63.5)));
    for (String line : leaderboardLines(results)) {
        IO.println(line);
    }
}
```
