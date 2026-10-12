# Practice: a playlist manager

A playlist is two lists that travel together: the titles, and how long each one runs in seconds. Same length, same order, so `titles.get(2)` and `seconds.get(2)` are the same song. You are going to write the handful of methods a playlist app actually needs.

Everything here uses Chapters 1 to 7: `ArrayList`, `get`, `size()`, `add`, `contains`, `subList`, `Collections.sort` and loops.

The test playlist:

| Title | Seconds |
| --- | --- |
| Ghost Town | 210 |
| Ribbons | 185 |
| Anvil | 240 |

No method here should change the list it is given. A method that quietly rearranges its caller's playlist is a bug that shows up three screens later, so where something needs to grow or be reordered, build a new list.

Each step names the method exactly: its return type, its name and its parameters. Check calls it with the cases under "What it should do," and those cases write each list in place, as `new ArrayList<>(List.of("Anvil", "Ribbons"))`, or `new ArrayList<>()` for an empty one. Step 4's Check is the exception: it runs the program, because a change to the caller's list shows only in what `main` prints.

## Steps

**Step 1.** Write `int totalSeconds(ArrayList<Integer> seconds)`, returning the total running time. An empty playlist totals 0.

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

**Step 2.** Write `double averageSeconds(ArrayList<Integer> seconds)`, returning the mean length, rounded to one decimal place.

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

**Step 3.** Write `String longestTitle(ArrayList<String> titles)`, returning the title with the most characters—the longest *name*, not the longest song. The playlist always has at least one song.

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

**Step 4.** Write `ArrayList<String> playlistWith(ArrayList<String> titles, String title)`, returning a new list with the title added at the end, and leaving the original list untouched: copy it with `new ArrayList<>(titles)`, then `add`. Check runs the program, and its second line, the original list, must still show three songs.

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

**Step 5.** Write `ArrayList<String> firstThree(ArrayList<String> titles)`, returning a new list of the first three titles. A playlist with fewer than three songs should come back whole, with no exception.

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

**Step 6.** Write `boolean hasSong(ArrayList<String> titles, String title)`, returning `true` or `false`.

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

**Step 7.** Write `ArrayList<Integer> positions(ArrayList<String> titles, String title)`, returning a list of every index where that title appears, since a playlist may well repeat a song. An absent title gives an empty list.

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

**Step 8.** Write `ArrayList<String> byLength(ArrayList<String> titles, ArrayList<Integer> seconds)`, returning the titles ordered shortest song first; two songs of the same length stay in their playlist order. There is no way yet to sort one list by another (Chapter 9 has one), so build the answer by hand: copy both lists, then, until the copies are empty, find the shortest length left, add its title to the answer, and remove that length and its title from the copies.

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
