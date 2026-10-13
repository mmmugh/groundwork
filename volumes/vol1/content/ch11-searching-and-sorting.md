<!-- part: Part III: Algorithms -->
# Chapter 11: Searching and Sorting

An **algorithm** is a procedure for solving a problem: a finite sequence of unambiguous steps that turns an input into the right output. Every program you have written contains algorithms. This chapter is about a handful that are important enough to have names, and about the question that separates a working program from a good one—*how much work does this take?*

Java can already search and sort for you: Chapter 7's `indexOf` and `contains` search a list, and `Collections.sort` and `Arrays.sort` sort. You will write these by hand anyway, for the same reason you learn long division after getting a calculator: how they work is the point.

## Linear search

To find something in an array, look at each item until you find it.

```java
/// Returns the index of target in items, or -1 if it is absent.
int linearSearch(int[] items, int target) {
    for (int i = 0; i < items.length; i++) {
        if (items[i] == target) {
            return i;
        }
    }
    return -1;
}

void main() {
    int[] numbers = {17, 4, 23, 8, 42, 15, 9};

    IO.println(linearSearch(numbers, 42));
    IO.println(linearSearch(numbers, 99));
}
```

```output
4
-1
```

Returning -1 for "not found" is Chapter 6's convention, and the one `indexOf` follows, because -1 cannot be mistaken for a valid index.

The important question is how many comparisons this takes. Best case, the target is first: one comparison. Worst case, it is last or absent: one comparison per item. On average, about half the array.

The headline number is the worst case, because it is what you can promise. For an array of *n* items, linear search needs **at most n comparisons**. Double the array and you double the work.

This is fine for a hundred items and painful for ten million.

## Binary search

If the array is **already sorted**, you can do enormously better.

Think about looking up a word in a paper dictionary. You do not start at page one. You open near the middle, see whether your word falls before or after, and throw away half the dictionary. Then you repeat.

```java
/// Returns the index of target in a SORTED array, or -1 if it is absent.
int binarySearch(int[] items, int target) {
    int low = 0;
    int high = items.length - 1;

    while (low <= high) {
        int middle = (low + high) / 2;

        if (items[middle] == target) {
            return middle;
        } else if (items[middle] < target) {
            low = middle + 1;
        } else {
            high = middle - 1;
        }
    }

    return -1;
}

void main() {
    int[] numbers = {4, 8, 9, 15, 17, 23, 42};

    IO.println(binarySearch(numbers, 42));
    IO.println(binarySearch(numbers, 4));
    IO.println(binarySearch(numbers, 99));
}
```

```output
6
0
-1
```

The variables `low` and `high` mark the section still under consideration. Each pass checks the middle item and discards half of what remains. When `low` passes `high`, nothing is left and the target is absent. `(low + high) / 2` divides two `int`s, so, as Chapter 3 showed, it drops any fraction: the middle of 0 and 5 is 2, always a whole index.

Watching it work makes the idea concrete. This search runs over a longer array, the fifty even numbers from 0 to 98. Typing them all would be tedious, so the program makes the array empty and fills it: `new int[50]` makes an array of 50 `int`s, each 0 to begin with, and the loop then sets each one.

```java
/// Binary search that prints each step.
int binarySearchVerbose(int[] items, int target) {
    int low = 0;
    int high = items.length - 1;
    int step = 0;

    while (low <= high) {
        step++;
        int middle = (low + high) / 2;
        IO.println("Step " + step + ": checking index " + middle
                + " (value " + items[middle] + "), "
                + (high - low + 1) + " items still in range");

        if (items[middle] == target) {
            return middle;
        } else if (items[middle] < target) {
            low = middle + 1;
        } else {
            high = middle - 1;
        }
    }

    return -1;
}

void main() {
    int[] numbers = new int[50];
    for (int i = 0; i < numbers.length; i++) {
        numbers[i] = i * 2;
    }

    int result = binarySearchVerbose(numbers, 74);
    IO.println("Found at index " + result);
}
```

```output
Step 1: checking index 24 (value 48), 50 items still in range
Step 2: checking index 37 (value 74), 25 items still in range
Found at index 37
```

Two steps to find one value among fifty. Linear search would have taken 38.

## Counting the work

Binary search halves the remaining range each step, so the question "how many steps?" becomes "how many times can I halve *n* before reaching 1?" That is the base-2 logarithm.

| Size | Linear search (worst) | Binary search (worst) |
| --- | --- | --- |
| 10 | 10 | 4 |
| 100 | 100 | 7 |
| 1,000 | 1,000 | 10 |
| 1,000,000 | 1,000,000 | 20 |
| 1,000,000,000 | 1,000,000,000 | 30 |

Read the bottom row again. Searching a billion sorted items takes about thirty comparisons. This is not a small optimization; it is a different category of thing, and it is why so much of computing is arranged around keeping data sorted or indexed. The 100 row is Chapter 5's guessing game: always guessing the middle finds any number from 1 to 100 in at most 7 tries.

The standard notation for this is **big-O**. Linear search is **O(n)**—work grows in proportion to the size. Binary search is **O(log n)**—work grows like the logarithm, which is to say barely. Big-O describes how cost *scales*, deliberately ignoring constant factors and the speed of the machine, because those change and the scaling does not.

A few common classes:

| Notation | Name | Doubling *n* means |
| --- | --- | --- |
| O(1) | Constant | No change |
| O(log n) | Logarithmic | One more step |
| O(n) | Linear | Twice the work |
| O(n²) | Quadratic | Four times the work |

Reading `array[5]` is O(1): one step, however long the array is. Binary search is O(log n), linear search and summing an array are O(n), and the sorts written by hand below are O(n²).

This also makes precise a claim from Chapter 9, that looking things up by key is dramatically faster on large collections. Finding a name in a list of a thousand takes up to a thousand comparisons; finding it in a `HashMap` takes roughly one, regardless of size. A `HashMap` lookup is O(1) on average, and so is a `LinkedHashMap`'s. (A `TreeMap`, which keeps its keys sorted, takes about log n steps, much as binary search does.) That is the real reason to choose a map, and it is why Chapter 9's map of names to scores is faster than Chapter 7's parallel arrays as well as safer.

Binary search has one prerequisite, and it is a real cost: **the array must be sorted.** Which raises the next question.

## Selection sort

Repeatedly find the smallest remaining item and put it in place.

```java
/// Returns a sorted copy of items, using selection sort.
int[] selectionSort(int[] items) {
    int[] result = Arrays.copyOf(items, items.length);

    for (int i = 0; i < result.length; i++) {
        int smallest = i;
        for (int j = i + 1; j < result.length; j++) {
            if (result[j] < result[smallest]) {
                smallest = j;
            }
        }
        int temp = result[i];
        result[i] = result[smallest];
        result[smallest] = temp;
    }

    return result;
}

void main() {
    int[] numbers = {64, 25, 12, 22, 11};
    IO.println(Arrays.toString(selectionSort(numbers)));
}
```

```output
[11, 12, 22, 25, 64]
```

The outer loop walks a boundary from left to right: everything to its left is sorted and final. The inner loop scans the unsorted remainder for the smallest value, and the three-line swap from Chapter 2 puts it where it belongs, with `temp` holding one value while the other moves. The method sorts a copy, made with Chapter 7's `Arrays.copyOf`, so the array it is handed keeps its order.

Watching the boundary move:

```java
/// Selection sort that shows the array after each pass.
int[] selectionSortVerbose(int[] items) {
    int[] result = Arrays.copyOf(items, items.length);

    for (int i = 0; i < result.length; i++) {
        int smallest = i;
        for (int j = i + 1; j < result.length; j++) {
            if (result[j] < result[smallest]) {
                smallest = j;
            }
        }
        int temp = result[i];
        result[i] = result[smallest];
        result[smallest] = temp;

        int[] sortedPart = Arrays.copyOfRange(result, 0, i + 1);
        int[] rest = Arrays.copyOfRange(result, i + 1, result.length);
        IO.println("Pass " + (i + 1) + ": " + Arrays.toString(sortedPart) + " "
                + Arrays.toString(rest));
    }

    return result;
}

void main() {
    selectionSortVerbose(new int[] {64, 25, 12, 22, 11});
}
```

```output
Pass 1: [11] [25, 12, 22, 64]
Pass 2: [11, 12] [25, 22, 64]
Pass 3: [11, 12, 22] [25, 64]
Pass 4: [11, 12, 22, 25] [64]
Pass 5: [11, 12, 22, 25, 64] []
```

The first array on each line is the sorted part, and the second is what is left to sort.

Selection sort makes about n²/2 comparisons: the outer loop runs n times and the inner loop averages n/2. That is **O(n²)**, and it is a sharp contrast with what came before. Ten times the data means a hundred times the work.

## Bubble sort

Repeatedly compare neighboring items and swap them when they are out of order. Large values "bubble" toward the end.

```java
/// Returns a sorted copy of items, using bubble sort with early exit.
int[] bubbleSort(int[] items) {
    int[] result = Arrays.copyOf(items, items.length);
    int n = result.length;

    for (int i = 0; i < n; i++) {
        boolean swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (result[j] > result[j + 1]) {
                int temp = result[j];
                result[j] = result[j + 1];
                result[j + 1] = temp;
                swapped = true;
            }
        }
        if (!swapped) {
            break;
        }
    }

    return result;
}

void main() {
    IO.println(Arrays.toString(bubbleSort(new int[] {64, 25, 12, 22, 11})));
    IO.println(Arrays.toString(bubbleSort(new int[] {1, 2, 3, 4, 5})));
}
```

```output
[11, 12, 22, 25, 64]
[1, 2, 3, 4, 5]
```

The `swapped` flag is the interesting part. If a full pass makes no swaps, the array is already in order and the method stops. That makes bubble sort **O(n)** on already-sorted data, which is its one genuine advantage—and a reminder that worst-case analysis does not describe every situation.

The `n - i - 1` in the inner loop skips the tail, where the largest values have already settled.

## What Java actually does

```java
void main() {
    int[] numbers = {64, 25, 12, 22, 11};
    int[] ascending = Arrays.copyOf(numbers, numbers.length);
    Arrays.sort(ascending);
    IO.println(Arrays.toString(ascending));

    ArrayList<Integer> descending = new ArrayList<>(List.of(64, 25, 12, 22, 11));
    Collections.sort(descending);
    Collections.reverse(descending);
    IO.println(descending);

    ArrayList<String> words = new ArrayList<>(List.of("banana", "Apple", "cherry"));
    words.sort(Comparator.comparing(s -> s.toLowerCase()));
    IO.println(words);
}
```

```output
[11, 12, 22, 25, 64]
[64, 25, 22, 12, 11]
[Apple, banana, cherry]
```

The first sorts a copy of an array, smallest first. The second sorts a list largest first: `Collections.sort`, then `Collections.reverse`. The third sorts text with a comparator, as Chapter 9 did; this one compares the words in lowercase, so a capital letter no longer sorts ahead of every lowercase one.

`Arrays.sort`, `Collections.sort` and a list's `sort` are all **O(n log n)**—far better than the quadratic sorts here, and close to the best possible for general-purpose sorting. (Lists are sorted with an algorithm called Timsort, arrays of numbers with a quicksort.) They are also thoroughly tested, and they handle edge cases you have not thought of.

**Always use `Arrays.sort`, `Collections.sort` or a list's `sort` in real programs.** The hand-written sorts in this chapter are for understanding, not for production. Knowing that the built-in is O(n log n) while a naive sort is O(n²)—and knowing what that difference means for a million records—is the actual takeaway.

## Common mistakes

| Mistake | What happens |
| --- | --- |
| Binary search on an unsorted array | Silently wrong answers, no error |
| `int middle = (low + high) / 2.0;` | `possible lossy conversion`—`/ 2` on two `int`s is already whole |
| `while (low < high)` instead of `<=` | Misses a one-item range |
| `low = middle` instead of `middle + 1` | Can loop forever |
| A swap with no temporary variable | Both places end up holding the same value |
| Sorting in place when the caller needed the original | Copy first, with `Arrays.copyOf` or `new ArrayList<>(...)` |
| Writing your own sort for real work | Slower, and probably wrong on some edge case |

## Try It

Exercises 1, 3, 4 and 6 name their methods exactly, as Chapter 6's did, and Check calls them with the cases listed under "What it should do." As in Chapter 7, those cases write each array in place, as `new int[] {1, 3, 5, 7}`, and Check compares two arrays or two lists item by item.

**1.** Change `linearSearch` so that it returns every index where the target appears, not just the first: `ArrayList<Integer> linearSearch(int[] items, int target)`, giving back an empty list when the target is absent.

```java
/// Returns every index where target appears in items.
ArrayList<Integer> linearSearch(int[] items, int target) {
    ArrayList<Integer> found = new ArrayList<>();
    for (int i = 0; i < items.length; i++) {
        if (items[i] == target) {
            found.add(i);
        }
    }
    return found;
}

void main() {
    int[] numbers = {17, 4, 23, 4, 42};
    IO.println(linearSearch(numbers, 4));
    IO.println(linearSearch(numbers, 99));
}
```

**2.** Add a step counter to both searches, counting one step each time a search checks an item, and compare them on an array of the 1,000 numbers from 0 to 999, searching for 999. Print, for each search, where it found 999 and how many steps it took, the linear search first. A record can carry both answers back, as `Range` did in Chapter 10.

```java
// Counts the steps each search takes on 1,000 numbers.

record Search(int index, int steps) {}

Search linearSearch(int[] items, int target) {
    int steps = 0;
    for (int i = 0; i < items.length; i++) {
        steps++;
        if (items[i] == target) {
            return new Search(i, steps);
        }
    }
    return new Search(-1, steps);
}

Search binarySearch(int[] items, int target) {
    int low = 0;
    int high = items.length - 1;
    int steps = 0;

    while (low <= high) {
        steps++;
        int middle = (low + high) / 2;
        if (items[middle] == target) {
            return new Search(middle, steps);
        } else if (items[middle] < target) {
            low = middle + 1;
        } else {
            high = middle - 1;
        }
    }
    return new Search(-1, steps);
}

void main() {
    int[] numbers = new int[1000];
    for (int i = 0; i < numbers.length; i++) {
        numbers[i] = i;
    }

    Search linear = linearSearch(numbers, 999);
    Search binary = binarySearch(numbers, 999);
    IO.println("Linear search: found at " + linear.index()
            + " in " + linear.steps() + " steps");
    IO.println("Binary search: found at " + binary.index()
            + " in " + binary.steps() + " steps");
}
```

**3.** Change `binarySearch` so that when the target is absent it returns the index where the target *would* go to keep the array sorted, rather than -1: in `{1, 3, 5, 7}`, 4 would go at index 2, between the 3 and the 5. A target that is there still gives its own index.

```java
/// Returns the index of target in a sorted array, or where it would go.
int binarySearch(int[] items, int target) {
    int low = 0;
    int high = items.length - 1;

    while (low <= high) {
        int middle = (low + high) / 2;

        if (items[middle] == target) {
            return middle;
        } else if (items[middle] < target) {
            low = middle + 1;
        } else {
            high = middle - 1;
        }
    }

    return low;
}

void main() {
    int[] numbers = {1, 3, 5, 7};
    IO.println(binarySearch(numbers, 4));
    IO.println(binarySearch(numbers, 9));
}
```

**4.** Write insertion sort, `int[] insertionSort(int[] items)`: take each item in turn, from the second on, and slide it back past every larger item before it, so that the part of the array behind it stays sorted. Return the sorted items, working on a copy as `selectionSort` does.

```java
/// Returns a sorted copy of items, using insertion sort.
int[] insertionSort(int[] items) {
    int[] result = Arrays.copyOf(items, items.length);

    for (int i = 1; i < result.length; i++) {
        int current = result[i];
        int j = i - 1;
        while (j >= 0 && result[j] > current) {
            result[j + 1] = result[j];
            j--;
        }
        result[j + 1] = current;
    }

    return result;
}

void main() {
    IO.println(Arrays.toString(insertionSort(new int[] {64, 25, 12, 22, 11})));
}
```

**5.** Sort a list of student records, `record Student(String name, int score) {}`, by score, lowest first, with students on the same score in alphabetical order by name, and print each name and score. The students are Ada (88), Grace (95), Alan (88), Katherine (99) and Edsger (99). Edsger is there so that a tie needs the names to settle it: Edsger is listed after Katherine but prints first. A list's `sort` keeps tied items in the order it found them, as the tie in Chapter 9's poll counter showed—a sort that does is called **stable**—so the order of two sorts can do the work.

```java
// Students sorted by score, then by name.

record Student(String name, int score) {}

void main() {
    ArrayList<Student> students = new ArrayList<>(List.of(
            new Student("Ada", 88),
            new Student("Grace", 95),
            new Student("Alan", 88),
            new Student("Katherine", 99),
            new Student("Edsger", 99)));

    ArrayList<Student> ranked = new ArrayList<>(students);
    ranked.sort(Comparator.comparing(student -> student.name()));
    ranked.sort(Comparator.comparing(student -> student.score()));

    for (Student student : ranked) {
        IO.println(String.format("%-10s%5d", student.name(), student.score()));
    }
}
```

**6.** Write `boolean isSorted(int[] items)`, returning whether the items are already in order, smallest first, in one pass. Equal neighbors are in order, and an array of no items or one item is sorted.

```java
/// Returns whether items is in order, smallest first.
boolean isSorted(int[] items) {
    for (int i = 0; i < items.length - 1; i++) {
        if (items[i] > items[i + 1]) {
            return false;
        }
    }
    return true;
}

void main() {
    IO.println(isSorted(new int[] {1, 2, 2, 3}));
    IO.println(isSorted(new int[] {3, 1}));
}
```

**7.** Find the two closest values in `{17, 4, 23, 8, 42, 15, 9, 41}`, two ways, and compare the work each does. First try every pair, the brute-force way; then sort a copy and look only at neighbors. Count one comparison for each pair a way looks at, and print one line for each way, brute force first: the two values, the gap between them and the count, in that order. Two pairs here are 1 apart, and either is right.

```java
// The two closest values, found two ways.

record Closest(int first, int second, int gap, int comparisons) {}

/// Checks every pair.
Closest bruteForce(int[] numbers) {
    int bestFirst = 0;
    int bestSecond = 0;
    int bestGap = -1;
    int comparisons = 0;

    for (int i = 0; i < numbers.length; i++) {
        for (int j = i + 1; j < numbers.length; j++) {
            comparisons++;
            int gap;
            if (numbers[i] > numbers[j]) {
                gap = numbers[i] - numbers[j];
            } else {
                gap = numbers[j] - numbers[i];
            }
            if (bestGap == -1 || gap < bestGap) {
                bestFirst = numbers[i];
                bestSecond = numbers[j];
                bestGap = gap;
            }
        }
    }
    return new Closest(bestFirst, bestSecond, bestGap, comparisons);
}

/// Sorts a copy first, then checks only neighbors.
Closest sortedFirst(int[] numbers) {
    int[] ordered = Arrays.copyOf(numbers, numbers.length);
    Arrays.sort(ordered);
    int bestFirst = 0;
    int bestSecond = 0;
    int bestGap = -1;
    int comparisons = 0;

    for (int i = 0; i < ordered.length - 1; i++) {
        comparisons++;
        int gap = ordered[i + 1] - ordered[i];
        if (bestGap == -1 || gap < bestGap) {
            bestFirst = ordered[i];
            bestSecond = ordered[i + 1];
            bestGap = gap;
        }
    }
    return new Closest(bestFirst, bestSecond, bestGap, comparisons);
}

void main() {
    int[] values = {17, 4, 23, 8, 42, 15, 9, 41};

    Closest brute = bruteForce(values);
    IO.println("Brute force:  " + brute.first() + " and " + brute.second()
            + ", gap " + brute.gap() + ", " + brute.comparisons() + " comparisons");

    Closest sorted = sortedFirst(values);
    IO.println("Sorted first: " + sorted.first() + " and " + sorted.second()
            + ", gap " + sorted.gap() + ", " + sorted.comparisons() + " comparisons");
}
```

## Chapter project: measuring algorithms

Write a program that counts the actual operations each algorithm performs, so the big-O claims stop being theory.

It needs one new tool. `Collections.shuffle(list, random)` puts a list's items in a random order, using the `Random` it is handed, Chapter 5's kind, to make its choices. The sort here works on an array, so `shuffled` shuffles the numbers as a list and then copies them into a new array, one by one.

```java
// Counts the comparisons each algorithm performs at several sizes.

record SearchResult(int index, int comparisons) {}

/// Returns the index and the comparison count of a linear search.
SearchResult linearSearchCounted(int[] items, int target) {
    int comparisons = 0;
    for (int i = 0; i < items.length; i++) {
        comparisons++;
        if (items[i] == target) {
            return new SearchResult(i, comparisons);
        }
    }
    return new SearchResult(-1, comparisons);
}

/// Returns the index and the comparison count of a binary search.
SearchResult binarySearchCounted(int[] items, int target) {
    int low = 0;
    int high = items.length - 1;
    int comparisons = 0;

    while (low <= high) {
        comparisons++;
        int middle = (low + high) / 2;
        if (items[middle] == target) {
            return new SearchResult(middle, comparisons);
        } else if (items[middle] < target) {
            low = middle + 1;
        } else {
            high = middle - 1;
        }
    }

    return new SearchResult(-1, comparisons);
}

/// Sorts items in place with selection sort; returns the comparisons made.
int selectionSortCounted(int[] items) {
    int comparisons = 0;

    for (int i = 0; i < items.length; i++) {
        int smallest = i;
        for (int j = i + 1; j < items.length; j++) {
            comparisons++;
            if (items[j] < items[smallest]) {
                smallest = j;
            }
        }
        int temp = items[i];
        items[i] = items[smallest];
        items[smallest] = temp;
    }

    return comparisons;
}

/// Returns the numbers from 0 to size - 1, in order.
int[] upTo(int size) {
    int[] numbers = new int[size];
    for (int i = 0; i < size; i++) {
        numbers[i] = i;
    }
    return numbers;
}

/// Returns the numbers from 0 to size - 1, in a random order.
int[] shuffled(int size, Random random) {
    ArrayList<Integer> numbers = new ArrayList<>();
    for (int i = 0; i < size; i++) {
        numbers.add(i);
    }
    Collections.shuffle(numbers, random);

    int[] result = new int[size];
    for (int i = 0; i < size; i++) {
        result[i] = numbers.get(i);
    }
    return result;
}

/// Prints worst-case comparison counts for both searches.
void compareSearches(int[] sizes) {
    IO.println("SEARCHING for a missing value");
    IO.println(String.format("%8s%8s%8s%8s", "Size", "Linear", "Binary", "Ratio"));
    IO.println("-".repeat(32));

    for (int size : sizes) {
        int[] data = upTo(size);
        int missing = size + 1;
        int linear = linearSearchCounted(data, missing).comparisons();
        int binary = binarySearchCounted(data, missing).comparisons();
        IO.println(String.format("%8d%8d%8d%7.0fx",
                size, linear, binary, (double) linear / binary));
    }
}

/// Prints selection sort's comparison counts at several sizes.
void compareSorts(int[] sizes) {
    IO.println();
    IO.println("SORTING a shuffled array");
    IO.println(String.format("%8s%13s%14s", "Size", "Comparisons", "Size squared"));
    IO.println("-".repeat(35));

    Random random = new Random();
    for (int size : sizes) {
        int comparisons = selectionSortCounted(shuffled(size, random));
        IO.println(String.format("%8d%13d%14d", size, comparisons, size * size));
    }
}

void main() {
    compareSearches(new int[] {10, 100, 1000, 10000});
    compareSorts(new int[] {10, 50, 100, 200});
}
```

```output
SEARCHING for a missing value
    Size  Linear  Binary   Ratio
--------------------------------
      10      10       4      3x
     100     100       7     14x
    1000    1000      10    100x
   10000   10000      14    714x

SORTING a shuffled array
    Size  Comparisons  Size squared
-----------------------------------
      10           45           100
      50         1225          2500
     100         4950         10000
     200        19900         40000
```

The search table shows the gap widening as the data grows—3x at ten items, 714x at ten thousand. An algorithm choice that looks irrelevant on test data can dominate everything in production, and this is what people mean when they say a program "does not scale."

The sort table shows comparisons landing at almost exactly half of n². 4,950 against 10,000; 19,900 against 40,000. The ratio holds steady as n grows, which is what O(n²) means: the constant factor (here, one half) does not change the shape, so big-O ignores it. The shuffle never changes these counts, either: selection sort compares every remaining pair whatever the order, so the program prints the same table on every run.

Note `linearSearchCounted(data, missing).comparisons()`. The search gives back a record holding the index and the count, and this program needs only the count, so it calls the accessor on the result straight away. `selectionSortCounted` sorts the array it is handed, in place, because nothing else uses that array: each one is made fresh by `shuffled` for this call alone. And `Collections.shuffle` reorders a list in place too, giving back nothing, in the same way `Collections.sort` does.
