<!-- part: Part II: Structuring Data -->
# Chapter 7: Arrays and Lists

Every variable so far has held one value. A program that tracks four test scores needs four variables, which is tolerable. A program that tracks a class of thirty needs a different idea.

Java has two, and this chapter teaches both: the array, whose length is fixed when it is made, and the list, which grows as you add to it. Arrays come first.

An **array** holds many values in one variable, in order.

```java
void main() {
    int[] scores = {88, 92, 79, 95};
    String[] names = {"Ada", "Grace", "Alan"};
    int[] empty = {};

    IO.println(Arrays.toString(scores));
    IO.println(Arrays.toString(names));
    IO.println(scores.length);
    IO.println(empty.length);
}
```

```output
[88, 92, 79, 95]
[Ada, Grace, Alan]
4
0
```

Square brackets after a type make an array of it: `int[]`, read "int array," is an array of `int`s, and `String[]` an array of `String`s. Braces create the array where it is declared, commas separate the items, and `.length` reports how many there are. An array's `length` has no parentheses, unlike a `String`'s `length()`.

`Arrays.toString` gives back an array's items as text, ready to print. `Arrays` is a set of ready-made methods for arrays that comes with Java, and a compact source file can use it with nothing added at the top, as Chapter 5's `Random` did. Printing the array itself, `IO.println(scores)`, shows something like this instead:

```text
[I@3578436e
```

That is Java's label for an array of `int`s, `[I`, then an `@` and a code Java makes up for that one array, which another computer or another version of Java may print differently. The items themselves are nowhere in it. Whenever you print an array, pass it to `Arrays.toString` first.

Every item in an array has the array's type. An `int[]` holds `int`s and nothing else, so an array that mixes types does not compile:

```java
void main() {
    int[] mixed = {1, "two", 3};
}
```

Press Run, and javac refuses:

```text
Main.java:2: error: incompatible types: String cannot be converted to int
    int[] mixed = {1, "two", 3};
                      ^
1 error
```

That is rarely a loss. In practice an array whose items are all the same kind of thing is what you want anyway: scores with scores, names with names.

## Indexing

Each item has a position, called its **index**. Java counts from **zero**.

```java
void main() {
    String[] names = {"Ada", "Grace", "Alan", "Katherine"};

    IO.println(names[0]);
    IO.println(names[2]);
    IO.println(names[names.length - 1]);
    IO.println(names[names.length - 2]);
}
```

```output
Ada
Alan
Katherine
Alan
```

Counting from zero surprises everyone at first. It is worth making peace with it early, because it is consistent across the whole language: Chapter 5's `charAt` counted a word's letters from 0 too, and a `for` loop from 0 up to `length - 1` visits every index once.

| Item | `Ada` | `Grace` | `Alan` | `Katherine` |
| --- | --- | --- | --- | --- |
| Index | 0 | 1 | 2 | 3 |
| From the end | `length - 4` | `length - 3` | `length - 2` | `length - 1` |

The length counts the items from 1 and the indexes start at 0, so the last item is always at `names.length - 1`, however long the array is, and the one before it at `names.length - 2`.

Java has no negative indexes. `names[-1]` does not count back from the end: it asks for a position before the first, which does not exist, and the program stops with an exception:

```java
void main() {
    String[] names = {"Ada", "Grace", "Alan", "Katherine"};
    IO.println(names[-1]);
}
```

```output
Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index -1 out of bounds for length 4
	at Main.main(Main.java:3)
```

Asking for an index past the end fails the same way:

```java
void main() {
    String[] names = {"Ada", "Grace"};
    IO.println(names[5]);
}
```

```output
Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 2
	at Main.main(Main.java:3)
```

The first line names the index that was asked for and the array's length, and the line under it gives the line of the program that asked. The last valid index is always `length - 1`. An `ArrayIndexOutOfBoundsException` almost always means a loop ran one step too far.

## Changing an item

An array's items can be changed after it is made. Assigning to an index replaces the item there:

```java
void main() {
    int[] scores = {88, 92, 79, 95};
    scores[2] = 85;
    IO.println(Arrays.toString(scores));
}
```

```output
[88, 92, 85, 95]
```

This property is called **mutability**, and an array is mutable. Text is not: no line of Java can change the letters of a `String` once it exists, as Chapter 8 shows. What an array cannot change is its length. An array made with four items holds four for good, which is why the lists that grow come later in this chapter.

## Slicing

Taking a section of an array is called **slicing**, and `Arrays.copyOfRange(array, from, to)` does it: it copies the items from index `from` up to, but not including, index `to` into a new array. As with `i < n` in a `for` loop, the stop position is not included.

```java
void main() {
    String[] letters = {"a", "b", "c", "d", "e", "f"};
    int end = letters.length;

    IO.println(Arrays.toString(Arrays.copyOfRange(letters, 1, 4)));
    IO.println(Arrays.toString(Arrays.copyOfRange(letters, 0, 3)));
    IO.println(Arrays.toString(Arrays.copyOfRange(letters, 3, end)));
    IO.println(Arrays.toString(Arrays.copyOfRange(letters, end - 2, end)));
}
```

```output
[b, c, d]
[a, b, c]
[d, e, f]
[e, f]
```

From the beginning is a `from` of 0, to the end is a `to` of the array's length, and the last two items start at `length - 2`. A `to` past the end is not cut back to fit, so keep `to` at most the array's length. There is no step: taking every second item is a job for a `for` loop that counts up by 2. A slice is always a **new array**; the original is untouched.

## Looping over an array

The direct way hands you each item in turn:

```java
void main() {
    int[] scores = {88, 92, 79, 95};

    for (int score : scores) {
        IO.println("Score: " + score);
    }
}
```

```output
Score: 88
Score: 92
Score: 79
Score: 95
```

This is the shorter `for` that Chapter 5 promised, called the **enhanced `for`**. Read its first line as "for each `int score` in `scores`": the loop runs once per item, and each time around, `score` holds the next one. The type before the name is the type of one item.

When you need the position as well as the value, use Chapter 5's counting loop, from 0 up to, but not including, the length:

```java
void main() {
    String[] names = {"Ada", "Grace", "Alan"};

    for (int i = 0; i < names.length; i++) {
        IO.println((i + 1) + ". " + names[i]);
    }
}
```

```output
1. Ada
2. Grace
3. Alan
```

The `+ 1` turns zero-based indexes into the one-based numbering humans expect in a printed list.

## Totals, largest and smallest

Adding up an array, or finding its largest item, is Chapter 5's accumulator pattern, walking an array instead of reading input:

```java
void main() {
    int[] scores = {88, 92, 79, 95};

    int total = 0;
    int largest = scores[0];
    int smallest = scores[0];
    for (int score : scores) {
        total += score;
        if (score > largest) {
            largest = score;
        }
        if (score < smallest) {
            smallest = score;
        }
    }

    IO.println(scores.length);
    IO.println(total);
    IO.println(largest);
    IO.println(smallest);
    IO.println((double) total / scores.length);
}
```

```output
4
354
95
79
88.5
```

Notice that `largest` and `smallest` start from the first score, `scores[0]`, not from 0. That is the fix Chapter 5 promised for its "largest so far" loop: every item is compared with a real score from the start, so the answer is right even when every number is negative. (An empty array has no `scores[0]`, so a program that might meet one checks its length first.) The `(double)` cast is Chapter 3's, and it keeps the average's fraction.

Larger Java programs often do these jobs with a feature called streams, which Appendix C names. Underneath, each is a loop like this one, and Chapter 11 has you write more of them by hand, because knowing how they work is the point of the exercise.

## Two-dimensional arrays

An array can hold arrays, which is how you represent a grid or table. `int[][]` is an array of `int[]` rows, and two indexes reach an item: the first picks the row, the second picks the position within it.

```java
void main() {
    int[][] grid = {
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9}
    };

    IO.println(Arrays.toString(grid[0]));
    IO.println(grid[1][2]);

    for (int[] row : grid) {
        for (int value : row) {
            IO.print(value + " ");
        }
        IO.println();
    }
}
```

```output
[1, 2, 3]
6
1 2 3
4 5 6
7 8 9
```

`grid[0]` is the whole first row, itself an array, and `grid[1][2]` is row 1, position 2: the 6. The outer loop hands out the rows, each an `int[]`, and the inner loop the values in each. `IO.print`, from Chapter 5, does not end the line, which is how the values of a row stay together; the bare `IO.println()` after the inner loop then ends the row.

## Lists that grow: `ArrayList`

An array's length is fixed when it is made, and many collections are not: the songs in a playlist, the guests at a party, the scores entered so far. For those, Java has the **ArrayList**, a list that grows as you add to it.

```java
void main() {
    ArrayList<Integer> scores = new ArrayList<>(List.of(88, 92, 79));
    ArrayList<String> names = new ArrayList<>();

    scores.add(95);
    names.add("Ada");
    names.add("Grace");

    IO.println(scores);
    IO.println(names);
    IO.println(scores.size());
    IO.println(scores.get(0));
}
```

```output
[88, 92, 79, 95]
[Ada, Grace]
4
88
```

`ArrayList<Integer>` is the type, an ArrayList of `Integer`s: the type of the items goes between angle brackets after `ArrayList`. `new ArrayList<>()` makes an empty list (`new` makes a value of a type, as it made Chapter 5's `Random`), and `new ArrayList<>(List.of(88, 92, 79))` makes one that starts with those items: `List.of` gives back a list of its values that can never change, and the new ArrayList starts as a copy of it. The empty `<>` lets Java work out the item type from the variable's. `add` puts an item on the end, `get(0)` gives back the item at index 0, counting from zero as an array does, and `size()` reports how many items there are. That makes three spellings of one idea: an array's `length`, a `String`'s `length()` and a list's `size()`. Everyone mixes them up at first, and javac says so when you do. A list prints its own items, too, with no `Arrays.toString` needed.

Why `Integer` and not `int`? Chapter 2 pointed out that `String` is written with a capital letter and `int`, `double` and `boolean` are not, and the difference runs deeper than spelling. `int`, `double`, `boolean` and `char` are Java's **primitive types**: plain values and nothing more. `String`, `Random`, `ArrayList` and every array type are types of **object**, a value Java keeps in memory on its own (the end of this chapter shows why that matters). An ArrayList can hold only objects, so each primitive type has an object twin for jobs like this one: `Integer` for `int`, `Double` for `double`, `Character` for `char` and `Boolean` for `boolean`. Java converts between an `int` and an `Integer` on its own—`scores.add(95)` turns 95 into an `Integer`, and `int first = scores.get(0);` turns one back—so `int` works everywhere except between the angle brackets. The difference shows in two places:

```java
void main() {
    ArrayList<Integer> numbers = new ArrayList<>(List.of(1, 5, 9));
    numbers.remove(1);
    IO.println(numbers);

    ArrayList<Integer> a = new ArrayList<>(List.of(1000));
    ArrayList<Integer> b = new ArrayList<>(List.of(1000));
    IO.println(a.get(0) == b.get(0));
    IO.println(a.get(0).equals(b.get(0)));
}
```

```output
[1, 9]
false
true
```

`remove` takes either an index or an item, and on a list of `Integer`s a whole number is read as an index: `numbers.remove(1)` removed the item at index 1, the 5, and left the number 1 where it was. (To remove the number itself, turn it into an `Integer` first: `numbers.remove(Integer.valueOf(1))`.) And two `Integer`s are compared with `.equals`, as text is. `==` asks a different question, which the end of this chapter explains, and its answer can be `false` even when the numbers match. For small numbers it often says `true`, so a program that uses `==` can look right until the numbers grow.

These are the methods worth knowing now:

| Method | Does |
| --- | --- |
| `add(x)` | Adds `x` to the end |
| `add(i, x)` | Inserts `x` at index `i` |
| `get(i)` | Gives back the item at index `i` |
| `set(i, x)` | Replaces the item at index `i` with `x` |
| `remove(i)` | Removes the item at index `i` and gives it back |
| `remove(x)` | Removes the first `x` |
| `size()` | How many items there are |
| `indexOf(x)` | Index of the first `x`, or -1 |
| `contains(x)` | Whether `x` is in the list |
| `isEmpty()` | Whether the list has no items |
| `addAll(other)` | Adds every item of another list |

Three more jobs belong to `Collections`, a set of ready-made methods for lists as `Arrays` is for arrays: `Collections.sort(list)` sorts a list, `Collections.reverse(list)` reverses it, and `Collections.frequency(list, x)` counts how many times `x` appears.

```java
void main() {
    ArrayList<Integer> scores = new ArrayList<>(List.of(88, 92, 79));

    scores.add(95);
    IO.println(scores);

    Collections.sort(scores);
    IO.println(scores);

    int highest = scores.remove(scores.size() - 1);
    IO.println(highest + " " + scores);
}
```

```output
[88, 92, 79, 95]
[79, 88, 92, 95]
95 [79, 88, 92]
```

`scores.remove(scores.size() - 1)` removes the last item and gives it back, so it can be stored: after the sort, that is the highest score.

Here are the methods that change a list, on a guest list:

```java
void main() {
    ArrayList<String> guests = new ArrayList<>(List.of("Grace", "Alan"));
    ArrayList<String> late = new ArrayList<>(List.of("Katherine", "Edsger"));

    guests.add(0, "Ada");
    guests.addAll(late);
    IO.println(guests);

    guests.remove("Alan");
    guests.set(0, "Ada Lovelace");
    IO.println(guests);

    Collections.reverse(guests);
    IO.println(guests);
}
```

```output
[Ada, Grace, Alan, Katherine, Edsger]
[Ada Lovelace, Grace, Katherine, Edsger]
[Edsger, Katherine, Grace, Ada Lovelace]
```

The rest ask a list a question and leave it as it was:

```java
void main() {
    ArrayList<String> votes = new ArrayList<>(List.of("yes", "no", "yes", "yes", "no"));

    IO.println(votes.indexOf("no"));
    IO.println(votes.contains("yes"));
    IO.println(votes.contains("maybe"));
    IO.println(votes.isEmpty());
    IO.println(Collections.frequency(votes, "yes"));
    IO.println(votes.subList(1, 3));
}
```

```output
1
true
false
false
3
[no, yes]
```

`contains` gives back a boolean, which makes it useful directly in conditions: `if (guests.contains(name))`. `indexOf` gives back -1 when the item is not there, Chapter 6's "not found." And `subList(from, to)` is a list's slice, with the same two positions as `Arrays.copyOfRange`. It does not copy the items, though: it is a window onto the original list, and a change to one shows in the other. For a list of its own, copy it: `new ArrayList<>(votes.subList(1, 3))`. Past the end, `subList` stops the program with an `IndexOutOfBoundsException`, so a method that may meet a short list checks its `size()` first.

## Sorting

`Collections.sort(list)` sorts the list **in place**: it changes the list itself and gives back nothing. Its return type is `void`, so storing what it gives back does not compile:

```java
void main() {
    ArrayList<Integer> scores = new ArrayList<>(List.of(88, 92, 79));
    ArrayList<Integer> result = Collections.sort(scores);
}
```

Press Run, and javac refuses:

```text
Main.java:3: error: incompatible types: void cannot be converted to ArrayList<Integer>
    ArrayList<Integer> result = Collections.sort(scores);
                                                ^
1 error
```

Use `Collections.sort` on its own line. When you need both the sorted version and the original, copy the list first, with `new ArrayList<>(scores)`, and sort the copy. An array sorts in place the same way, with `Arrays.sort`:

```java
void main() {
    ArrayList<Integer> scores = new ArrayList<>(List.of(88, 92, 79));
    ArrayList<Integer> ordered = new ArrayList<>(scores);
    Collections.sort(ordered);
    IO.println(ordered + " " + scores);

    int[] times = {42, 17, 30};
    Arrays.sort(times);
    IO.println(Arrays.toString(times));
}
```

```output
[79, 88, 92] [88, 92, 79]
[17, 30, 42]
```

Text sorts in Chapter 3's character-code order, which puts capitals before lowercase letters.

## Building a new list

Building a new list from an old one uses the accumulator pattern from Chapter 5, with `add` doing the accumulating:

```java
void main() {
    double[] celsius = {0, 25, 100, 37};
    ArrayList<Double> fahrenheit = new ArrayList<>();

    for (double c : celsius) {
        fahrenheit.add(c * 9 / 5 + 32);
    }

    IO.println(fahrenheit);
}
```

```output
[32.0, 77.0, 212.0, 98.6]
```

The list starts empty, and each pass of the loop adds one converted temperature, a `Double`, the object twin of `double`.

Filtering works the same way, with an `if` deciding what gets added:

```java
void main() {
    ArrayList<Integer> scores = new ArrayList<>(List.of(88, 92, 45, 95, 58, 71));
    ArrayList<Integer> passing = new ArrayList<>();

    for (int score : scores) {
        if (score >= 60) {
            passing.add(score);
        }
    }

    IO.println(passing.size() + " of " + scores.size() + " passed: " + passing);
}
```

```output
4 of 6 passed: [88, 92, 95, 71]
```

The enhanced `for` walks a list exactly as it walks an array, and `int score` takes each `Integer` as an `int`.

**Never add to or remove from a list while a loop is walking through it.** An enhanced `for` usually notices and stops the program with a `ConcurrentModificationException`, and a counting loop loses track of its position and skips items. Build a new list instead, as above.

## Common mistakes

| Mistake | What happens |
| --- | --- |
| `scores[4]` on a 4-item array | An exception: valid indexes are 0 to 3 |
| `scores[-1]` for the last item | An exception too; the last item's index is `scores.length - 1` |
| Printing an array with `IO.println` | `[I@` and a code, not the items; use `Arrays.toString` |
| `scores.length()` on an array, or `.length` on a list | `cannot find symbol`—an array has `length`, a list `size()` |
| `ArrayList<int>` | `unexpected type`—a list holds objects, so write `ArrayList<Integer>` |
| Storing what `Collections.sort` gives back | `incompatible types`—it sorts in place and gives back nothing |
| `scores.add(1, 2)` to add two numbers | No error: it inserts 2 at index 1; add one at a time, or use `addAll` |
| `remove(1)` on a list of `Integer`s, meaning the number 1 | It removes the item at index 1 |
| Removing items while looping | An exception, or items skipped silently |
| `b = a` then changing `b` | Both variables hold the same list; copy it with `new ArrayList<>(a)` |

That last one deserves a demonstration, because it surprises people:

```java
void main() {
    ArrayList<Integer> a = new ArrayList<>(List.of(1, 2, 3));
    ArrayList<Integer> b = a;
    b.add(4);
    IO.println(a);

    ArrayList<Integer> c = new ArrayList<>(List.of(1, 2, 3));
    ArrayList<Integer> d = new ArrayList<>(c);
    d.add(4);
    IO.println(c);
}
```

```output
[1, 2, 3, 4]
[1, 2, 3]
```

`b = a` does not make a second list; it makes a second *variable* holding the same list. A variable of a primitive type, such as an `int`, holds its value itself. A variable of an object type holds a **reference** to the object: where Java can find it in memory. `b = a` copies the reference, not the list, so `a` and `b` lead to the **same object**, and a change made through either one shows through both. `new ArrayList<>(c)` makes a new object holding the same items, which can change without touching `c`.

An array behaves the same way: after `int[] y = x;` the two variables share one array, and `Arrays.copyOf(x, x.length)` copies all `x.length` items into a separate one. So does a method's parameter. Chapter 6's copy of the argument is a copy of the reference, so a method can change a list or an array it is handed, and the caller sees the change.

This is also the question `==` asks about objects, the one Chapter 3 put off: do these two variables hold the same object? Here it is asked of two lists and of two arrays:

```java
void main() {
    ArrayList<String> first = new ArrayList<>(List.of("Ada", "Grace"));
    ArrayList<String> same = first;
    ArrayList<String> copy = new ArrayList<>(first);
    IO.println(first == same);
    IO.println(first == copy);

    int[] x = {1, 2, 3};
    int[] y = Arrays.copyOf(x, x.length);
    IO.println(x == y);
    IO.println(Arrays.equals(x, y));
}
```

```output
true
false
false
true
```

`copy` holds the same items as `first`, but it is a different object, and so is `y` beside `x`: `==` says `false` for both. Whether two objects hold the same contents is a different question, asked by `Arrays.equals` for two arrays and by `.equals` for two `String`s (the same letters?) or two `Integer`s (the same number?). That is why Chapter 3's `answer == "yes"` was `false` when the user typed `yes`: the typed text and the `"yes"` in the program are two separate `String` objects with the same letters. It is also why two `Integer`s are compared with `.equals`. Compare text and `Integer`s with `.equals`, and keep `==` for numbers, `char`s and booleans.

## Try It

Exercises 3 and 6 name their methods exactly, as Chapter 6's did, and Check calls each one with the cases listed under "What it should do." Those cases write each array in place, as `new int[] {1, 5, 9}`: an array that is not created in a variable's declaration needs its type, `new int[]`, written in front of its braces.

**1.** Given the array `{88, 92, 79, 95, 60, 73, 85, 91, 68, 77}`, print the numbers' total, their average, the largest and the smallest, in that order.

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

**2.** Ask the user for five words and print them in alphabetical order.

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

**3.** Write `int countAbove(int[] numbers, int threshold)`, returning how many items are greater than the threshold.

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

**4.** Given the array `{3, 8, 15, 22, 41, 56, 7, 10}`, build a new `ArrayList<Integer>` holding only the even numbers, and print the list.

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

**5.** Given the array `{1, 2, 3, 4, 5}`, build a list holding its items in reverse order, without `Collections.reverse`, and print it.

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

**6.** Write `int secondLargest(int[] numbers)`, returning the second-largest value. The array always holds at least two numbers.

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

**7.** Build a 3-by-3 grid of zeros, set the center to 5, and print it row by row, with a space after each value, as the grid program above does.

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

## Chapter project: a class gradebook

Build a gradebook that stores students and their scores in parallel arrays and reports on the class. Its columns line up with `String.format` widths, explained after the program.

```java
// A class gradebook using parallel arrays.

/// Returns the mean of an array of numbers, or 0.0 for an empty one.
double average(int[] numbers) {
    if (numbers.length == 0) {
        return 0.0;
    }
    int total = 0;
    for (int number : numbers) {
        total += number;
    }
    return (double) total / numbers.length;
}

/// Returns the letter grade for a numeric score.
String letterGrade(int score) {
    if (score >= 90) {
        return "A";
    } else if (score >= 80) {
        return "B";
    } else if (score >= 70) {
        return "C";
    } else if (score >= 60) {
        return "D";
    } else {
        return "F";
    }
}

/// Prints each student with their score and letter grade.
void printRoster(String[] names, int[] scores) {
    IO.println(String.format("%-12s%6s%7s", "Student", "Score", "Grade"));
    IO.println("-".repeat(25));
    for (int i = 0; i < names.length; i++) {
        IO.println(String.format("%-12s%6d%7s",
                names[i], scores[i], letterGrade(scores[i])));
    }
}

/// Prints class statistics.
void printSummary(String[] names, int[] scores) {
    int best = 0;
    int lowest = scores[0];
    int passing = 0;
    for (int i = 0; i < scores.length; i++) {
        if (scores[i] > scores[best]) {
            best = i;
        }
        if (scores[i] < lowest) {
            lowest = scores[i];
        }
        if (scores[i] >= 60) {
            passing++;
        }
    }

    IO.println("-".repeat(25));
    IO.println(String.format("Class average: %.1f", average(scores)));
    IO.println("Highest:       " + scores[best] + " (" + names[best] + ")");
    IO.println("Lowest:        " + lowest);
    IO.println("Passing:       " + passing + " of " + scores.length);
}

void main() {
    String[] names = {"Ada", "Grace", "Alan", "Katherine", "Edsger"};
    int[] scores = {88, 92, 45, 95, 71};

    printRoster(names, scores);
    printSummary(names, scores);
}
```

```output
Student      Score  Grade
-------------------------
Ada             88      B
Grace           92      A
Alan            45      F
Katherine       95      A
Edsger          71      C
-------------------------
Class average: 78.2
Highest:       95 (Katherine)
Lowest:        45
Passing:       4 of 5
```

Three things here are new.

**Columns with `String.format`.** A number between the `%` and the letter of a format specifier is a **width**: the value is padded with spaces to that many characters, lined up on the right, and a minus sign in front of the width lines it up on the left instead. So `%-12s` is a string in 12 characters, left-aligned, and `%6d` a whole number in 6, right-aligned. A width works with decimal places too (`%7.2f` is a `double` with 2 decimal places in 7 characters), and a 0 in front of the width pads with zeros instead of spaces, so `String.format("%02d", 7)` gives back `07`, the way a clock shows minutes. This is how you get columns that line up without counting spaces by hand.

**Finding the matching name.** The loop in `printSummary` keeps `best`, the index of the highest score so far, rather than the score itself, and that same index in `names` gives the student. This works only because the two arrays are kept in the same order—they are **parallel arrays**, and every operation has to maintain that correspondence. It is fragile: sort `scores` and the gradebook starts attributing grades to the wrong students. Chapters 9 and 10 give you sturdier ways to tie a name to a score.

**One loop, three answers.** The highest score, the lowest and the number passing all come out of one pass over the scores. The filtering loop earlier in this chapter built a list of the passing scores; here only how many is wanted, so a counter does the job and no list is needed. When you need the scores themselves, build the list.
