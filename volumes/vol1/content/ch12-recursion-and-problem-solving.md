<!-- part: Part III: Algorithms -->
# Chapter 12: Recursion and Problem Solving

A **recursive** method is one that calls itself. That sounds circular and is not, provided the method always calls itself on a *smaller* version of the problem and knows when to stop.

Start with something you can already write two ways. The factorial of 5 is 5 × 4 × 3 × 2 × 1.

```java
/// Returns n! using a loop.
int factorialLoop(int n) {
    int result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

/// Returns n! using recursion.
int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

void main() {
    IO.println(factorialLoop(5));
    IO.println(factorial(5));
}
```

```output
120
120
```

The recursive version rests on a fact about factorials: **5! is just 5 × 4!**. If you can get 4!, you are done. And 4! is 4 × 3!, and so on down to 1! which is simply 1.

## The two required parts

Every recursive method needs both of these, and leaving out either one breaks it:

1. A **base case**—a version of the problem small enough to answer outright, with no further call. Here: `if (n <= 1) { return 1; }`.
2. A **recursive case**—which calls itself on a smaller input and builds the answer from the result. Here: `return n * factorial(n - 1);`.

The recursive case must move *toward* the base case. `factorial(n - 1)` shrinks `n` each time, so it must eventually reach 1. Write `factorial(n)` instead and the method calls itself forever, or tries to:

```java
int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n);
}

void main() {
    IO.println(factorial(5));
}
```

```output
Exception in thread "main" java.lang.StackOverflowError
```

Every call that has not finished yet is waiting for an answer, and Java keeps what each one is holding—its own `n`, and where to carry on when the answer comes back—in an area of memory called the **stack**. A runaway recursion piles up calls that never finish, until, thousands of calls deep, the stack is full and Java stops the program with a `StackOverflowError`. That error nearly always means a missing or unreachable base case. At a terminal, Java follows the first line with a long column of `at` lines naming `factorial` again and again; the box shows the first line alone.

## Following the calls

Printing at each level shows what actually happens. To indent its lines, the traced version needs to know how deep each call is, so it takes a second parameter, `depth`. Whoever calls it should not have to pass the 0 that the first call starts from, so a one-parameter `factorialTraced` passes it for them. That is Chapter 6's overloading, two methods of one name, the shorter calling the longer with the starting value, and recursive methods use it constantly.

```java
/// Factorial that shows each call and each return.
int factorialTraced(int n) {
    return factorialTraced(n, 0);
}

int factorialTraced(int n, int depth) {
    String indent = "  ".repeat(depth);
    IO.println(indent + "factorial(" + n + ") called");

    if (n <= 1) {
        IO.println(indent + "base case, returning 1");
        return 1;
    }

    int result = n * factorialTraced(n - 1, depth + 1);
    IO.println(indent + "returning " + n + " * factorial(" + (n - 1) + ") = "
            + result);
    return result;
}

void main() {
    factorialTraced(4);
}
```

```output
factorial(4) called
  factorial(3) called
    factorial(2) called
      factorial(1) called
      base case, returning 1
    returning 2 * factorial(1) = 2
  returning 3 * factorial(2) = 6
returning 4 * factorial(3) = 24
```

`main` calls `factorialTraced(4)` for what it prints, and does nothing with the 24 it gives back: a call can stand on its own like that.

Notice the shape: the calls go all the way *down* to the base case before any of them returns, and then the answers come back *up*. Each level is waiting, holding its own `n`, for the level below to finish. Nothing is actually multiplied until the bottom is reached.

That is the mental model worth keeping. Recursion is not a loop that goes around; it is a stack of unfinished work that unwinds.

## More examples

**Summing an array:**

The smaller problem here is the rest of the array, everything after its first item. Chapter 7's `Arrays.copyOfRange` could copy the rest out, but copying on every call is wasted work. Instead, the method takes an index, `start`, that says where the rest begins, and each call moves it one place along. A one-parameter `total` starts it at 0.

```java
/// Returns the sum of an array, recursively.
int total(int[] numbers) {
    return total(numbers, 0);
}

/// Returns the sum of the items from index start to the end.
int total(int[] numbers, int start) {
    if (start == numbers.length) {
        return 0;
    }
    return numbers[start] + total(numbers, start + 1);
}

void main() {
    IO.println(total(new int[] {1, 2, 3, 4, 5}));
}
```

```output
15
```

The base case is an empty rest: once `start` reaches `numbers.length`, no items are left, and their sum is 0. Otherwise: the item at `start` plus the sum of everything after it.

**Reversing a string:**

A `String` already has a way to take its rest: `text.substring(1)` is a new, shorter `String` holding everything after the first character (Chapter 8).

```java
/// Returns the text reversed, recursively.
String reverse(String text) {
    if (text.length() <= 1) {
        return text;
    }
    return reverse(text.substring(1)) + text.charAt(0);
}

void main() {
    IO.println(reverse("recursion"));
}
```

```output
noisrucer
```

**Counting down:**

```java
/// Prints a countdown from n to 1, then Liftoff.
void countdown(int n) {
    if (n <= 0) {
        IO.println("Liftoff.");
        return;
    }
    IO.println(n);
    countdown(n - 1);
}

void main() {
    countdown(3);
}
```

```output
3
2
1
Liftoff.
```

`return;` with no value ends a `void` method at once, as it did in Chapter 6's project. This method has nothing to give back, only something to print.

## When recursion goes wrong: Fibonacci

The Fibonacci sequence starts 0, 1, and each later number is the sum of the two before it. The recursive definition is so natural it almost writes itself:

```java
/// Returns the nth Fibonacci number. Correct, but very slow.
int fib(int n) {
    if (n <= 1) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}

void main() {
    for (int i = 0; i < 10; i++) {
        IO.print(fib(i) + " ");
    }
    IO.println();
}
```

```output
0 1 1 2 3 5 8 13 21 34
```

This is correct and it is a disaster. `fib(30)` makes 2,692,537 calls, about 2.7 million; `fib(50)` would take longer than you will wait.

The reason is that it recomputes the same values endlessly. Calculating `fib(5)` requires `fib(4)` and `fib(3)`; but `fib(4)` also requires `fib(3)`, which gets computed from scratch a second time—and each of those recomputes `fib(2)`, and so on. Each step up in `n` multiplies the work by about 1.6: `fib(30)` makes eleven times the calls `fib(25)` makes. Growth by a steady factor like that is exponential. Big-O rounds the factor up to 2 and writes it **O(2ⁿ)**: `fib(n)` never makes more than 2ⁿ calls.

The fix is to remember answers already computed, a technique called **memoization**. A map from each `n` to its answer does the remembering: before working a value out, look for it in the map, and after working it out, put it there.

Two things in the program below need a word. The answers are `long`s, Chapter 3's whole numbers with room for far bigger values, because Fibonacci numbers outgrow an `int` quickly: `fib(47)` is 2,971,215,073, past the largest `int`, 2,147,483,647. And a map holds objects, so its values are `Long`, the object twin of `long`, as `Integer` is of `int` (Chapter 7); Java converts between the two on its own. The map is made by a one-parameter `fibFast`, so each outside call starts with an empty one, and it is handed along to every recursive call. It is a `HashMap`: nothing prints it, so its order does not matter, and its lookups are O(1) on average, as Chapter 11 showed.

```java
/// Returns the nth Fibonacci number, remembering previous results.
long fibFast(int n) {
    Map<Integer, Long> memo = new HashMap<>();
    return fibFast(n, memo);
}

long fibFast(int n, Map<Integer, Long> memo) {
    if (memo.containsKey(n)) {
        return memo.get(n);
    }
    if (n <= 1) {
        return n;
    }

    memo.put(n, fibFast(n - 1, memo) + fibFast(n - 2, memo));
    return memo.get(n);
}

void main() {
    IO.println(fibFast(50));
    IO.println(fibFast(90));
}
```

```output
12586269025
2880067194370816120
```

That returns instantly. A map—the Chapter 9 structure—turns an O(2ⁿ) algorithm into an O(n) one by ensuring each value is computed exactly once. This is a genuinely important idea, and choosing the right data structure is again what made the difference.

A loop also handles Fibonacci perfectly well, in O(n) and with no recursion at all:

```java
/// Returns the nth Fibonacci number, using a loop.
long fibLoop(int n) {
    long a = 0;
    long b = 1;
    for (int i = 0; i < n; i++) {
        long next = a + b;
        a = b;
        b = next;
    }
    return a;
}

void main() {
    IO.println(fibLoop(50));
}
```

```output
12586269025
```

`a` and `b` are two neighbors in the sequence, moving along it one place each pass: the new `a` is the old `b`, and the new `b` is the sum of the two. `next` holds the sum while `a` takes `b`'s old value, which is Chapter 2's temporary variable doing the job it did in the swap.

## When to use recursion

Anything recursive can be written with a loop, and anything looped can be written recursively. The choice is about clarity.

**Recursion fits** when the problem is naturally self-similar: tree and folder structures, nested menus, dividing a problem in half repeatedly, or puzzles like the Towers of Hanoi whose rules are stated recursively.

**Loops fit** when you are stepping through a sequence. Summing an array recursively, as above, is a fine teaching exercise and worse code than Chapter 7's loop.

For a first course the honest summary is: recognize recursion, be able to trace it, and know that some problems become much simpler when expressed this way. Do not force it where a loop is clearer.

## A problem that wants recursion

Binary search from Chapter 11, written recursively, is arguably clearer than the loop version—the "search this half instead" step becomes a literal call. The range still to search is two more parameters, `low` and `high`, and a two-parameter `binarySearch` starts them at the whole array:

```java
/// Returns the index of target in a sorted array, or -1 if it is absent.
int binarySearch(int[] items, int target) {
    return binarySearch(items, target, 0, items.length - 1);
}

/// Searches items from index low to index high, both included.
int binarySearch(int[] items, int target, int low, int high) {
    if (low > high) {
        return -1;
    }

    int middle = (low + high) / 2;

    if (items[middle] == target) {
        return middle;
    } else if (items[middle] < target) {
        return binarySearch(items, target, middle + 1, high);
    } else {
        return binarySearch(items, target, low, middle - 1);
    }
}

void main() {
    int[] numbers = {4, 8, 9, 15, 17, 23, 42};
    IO.println(binarySearch(numbers, 23));
    IO.println(binarySearch(numbers, 5));
}
```

```output
5
-1
```

The base cases are "the range is empty" and "found it." Each recursive call searches a strictly smaller range, so it always terminates.

## Common mistakes

| Mistake | What happens |
| --- | --- |
| No base case | `StackOverflowError` |
| A base case that is never reached | `StackOverflowError` |
| Not returning the recursive call's result | `missing return statement`—javac refuses it |
| Not shrinking the input | Infinite recursion, then `StackOverflowError` |
| Using recursion where a loop is clearer | Slower and harder to read |
| An `int` for answers that outgrow it | Wrong, even negative, answers with no error; use `long` |

The third row is a method that makes its recursive call, `factorial(n - 1);`, and does nothing with the answer: a method that promises an `int` must return one on every path. The last row is `fibFast` written with `int`s: `fib(47)` and everything after it come out wrong, `fib(50)` as -298632863, because an `int` overflows silently, as Chapter 3 showed.

## Try It

Exercises 1, 3, 4, 5 and 6 name their methods exactly, as Chapter 6's did, and Check calls them with the cases listed under "What it should do"; exercise 5's cases write each array in place, as `new int[] {1, 2, 1, 1}`. Exercises 2 and 7 print, and Check compares what they print with the lines the exercise describes. Write each one recursively: Check cannot tell a loop from a recursion, but the recursion is the practice.

**1.** Write `int power(int base, int exponent)`, returning `base` to the power `exponent`, recursively and without `Math.pow`. The exponent is 0 or more, and any number to the power 0 is 1.

```java
/// Returns base to the power exponent, recursively.
int power(int base, int exponent) {
    if (exponent == 0) {
        return 1;
    }
    return base * power(base, exponent - 1);
}

void main() {
    IO.println(power(2, 10));
    IO.println(power(5, 0));
}
```

**2.** Write `void countDownUp(int n)`, printing n down to 1 and then 1 back up to n, one number to a line, using one recursive method. `countDownUp(3)` prints 3, 2, 1, 1, 2, 3: the 1 appears twice.

```java
/// Prints n down to 1, then 1 back up to n.
void countDownUp(int n) {
    if (n <= 0) {
        return;
    }
    IO.println(n);
    countDownUp(n - 1);
    IO.println(n);
}

void main() {
    countDownUp(3);
}
```

**3.** Write `int digitSum(int n)`, returning the sum of a number's digits, recursively: `digitSum(1234)` is 1 + 2 + 3 + 4, which is 10. The number is 0 or more.

```java
/// Returns the sum of the digits of n, recursively.
int digitSum(int n) {
    if (n < 10) {
        return n;
    }
    return n % 10 + digitSum(n / 10);
}

void main() {
    IO.println(digitSum(1234));
}
```

**4.** Write `boolean isPalindrome(String text)`, recursively: whether the text reads the same forward and backward, exactly as written (`"racecar"` does; `"Racecar"` does not). Empty text and a single letter are palindromes.

```java
/// Returns whether text reads the same forward and backward.
boolean isPalindrome(String text) {
    if (text.length() <= 1) {
        return true;
    }
    if (text.charAt(0) != text.charAt(text.length() - 1)) {
        return false;
    }
    return isPalindrome(text.substring(1, text.length() - 1));
}

void main() {
    IO.println(isPalindrome("racecar"));
    IO.println(isPalindrome("hello"));
}
```

**5.** Write `int countItem(int[] items, int target)`, counting how many times the target appears in the array, recursively. As `total` did, give it a second method that takes the index where the rest begins.

```java
/// Returns how many times target appears in items.
int countItem(int[] items, int target) {
    return countItem(items, target, 0);
}

/// Counts target in items from index start to the end.
int countItem(int[] items, int target, int start) {
    if (start == items.length) {
        return 0;
    }
    int rest = countItem(items, target, start + 1);
    if (items[start] == target) {
        return 1 + rest;
    }
    return rest;
}

void main() {
    IO.println(countItem(new int[] {1, 2, 1, 1}, 1));
}
```

**6.** Write `int gcd(int a, int b)` using Euclid's algorithm. The GCD, the greatest common divisor, is the largest number that divides both; the GCD of a and b equals the GCD of b and `a % b`, and the GCD of a and 0 is a.

```java
/// Returns the greatest common divisor of a and b, by Euclid's algorithm.
int gcd(int a, int b) {
    if (b == 0) {
        return a;
    }
    return gcd(b, a % b);
}

void main() {
    IO.println(gcd(12, 8));
}
```

**7.** Solve the Towers of Hanoi for 3 disks, printing each move. Three pegs, A, B and C, hold disks of three sizes, all on A to begin with, largest at the bottom. Move them all to C, one disk at a time, never putting a larger disk on a smaller one, in the fewest moves, which is seven. Write `void hanoi(int n, String from, String to, String spare)`, call it as `hanoi(3, "A", "C", "B")`, and print each move as `Move disk 1 from A to C`, numbering the disks from 1, the smallest, to 3.

```java
/// Prints the moves that take n disks from one peg to another.
void hanoi(int n, String from, String to, String spare) {
    if (n == 0) {
        return;
    }
    hanoi(n - 1, from, spare, to);
    IO.println("Move disk " + n + " from " + from + " to " + to);
    hanoi(n - 1, spare, to, from);
}

void main() {
    hanoi(3, "A", "C", "B");
}
```

## Capstone project: a student records system

This brings together everything in the course: methods, loops, conditionals, lists, maps, records, searching, and sorting.

One thing in it is new. Each student's scores are a list inside the record, and the component's type is written `List<Integer>`. `List` is to lists what Chapter 9's `Map` is to maps: a variable or a component typed `List` holds any kind of list, an `ArrayList` or the one that `List.of` makes, which can never change. So each student's scores can be written `List.of(88, 92, 85)` and stored as they are, and `average` takes a `List<Integer>` for the same reason. A `List` is read the way an `ArrayList` is, with `size()`, `isEmpty()` and a loop.

```java
// A student records system: search, sort, group, and report.

record Student(int id, String name, int grade, List<Integer> scores) {}

/// Returns the mean of a list of numbers, or 0.0 if it is empty.
double average(List<Integer> numbers) {
    if (numbers.isEmpty()) {
        return 0.0;
    }
    int total = 0;
    for (int number : numbers) {
        total += number;
    }
    return (double) total / numbers.size();
}

/// Returns the letter grade for a numeric average.
String letterGrade(double score) {
    if (score >= 90) {
        return "A";
    } else if (score >= 80) {
        return "B";
    } else if (score >= 70) {
        return "C";
    } else if (score >= 60) {
        return "D";
    }
    return "F";
}

/// Binary search of a list SORTED BY ID. Returns the student, or null.
Student findById(ArrayList<Student> students, int studentId) {
    int low = 0;
    int high = students.size() - 1;

    while (low <= high) {
        int middle = (low + high) / 2;
        Student student = students.get(middle);
        if (student.id() == studentId) {
            return student;
        } else if (student.id() < studentId) {
            low = middle + 1;
        } else {
            high = middle - 1;
        }
    }

    return null;
}

/// Returns every student whose name contains the text, ignoring case.
ArrayList<Student> searchByName(ArrayList<Student> students, String text) {
    ArrayList<Student> matches = new ArrayList<>();
    for (Student student : students) {
        if (student.name().toLowerCase().contains(text.toLowerCase())) {
            matches.add(student);
        }
    }
    return matches;
}

/// Returns a map from each grade level to its students, grades in order.
Map<Integer, ArrayList<Student>> groupByGrade(ArrayList<Student> students) {
    Map<Integer, ArrayList<Student>> groups = new TreeMap<>();
    for (Student student : students) {
        if (!groups.containsKey(student.grade())) {
            groups.put(student.grade(), new ArrayList<>());
        }
        groups.get(student.grade()).add(student);
    }
    return groups;
}

/// Prints every student, ranked by average, highest first.
void printRoster(ArrayList<Student> students) {
    ArrayList<Student> ranked = new ArrayList<>(students);
    ranked.sort(Comparator.comparing((Student s) -> average(s.scores())).reversed());

    IO.println(String.format("%-2s%-5s%-18s%-3s%4s%6s",
            "#", "ID", "Name", "Gr", "Avg", "Grade"));
    IO.println("-".repeat(38));
    for (int i = 0; i < ranked.size(); i++) {
        Student student = ranked.get(i);
        double mean = average(student.scores());
        IO.println(String.format("%-2d%-5d%-18s%-3d%4.1f%6s",
                i + 1, student.id(), student.name(), student.grade(),
                mean, letterGrade(mean)));
    }
    IO.println("-".repeat(38));
}

/// Prints a summary for each grade level.
void printGradeSummary(ArrayList<Student> students) {
    IO.println();
    IO.println("By grade level");
    Map<Integer, ArrayList<Student>> groups = groupByGrade(students);
    for (int grade : groups.keySet()) {
        ArrayList<Student> members = groups.get(grade);
        double total = 0;
        for (Student student : members) {
            total += average(student.scores());
        }
        IO.println(String.format("  Grade %d: %d students, average %.1f",
                grade, members.size(), total / members.size()));
    }
}

/// Prints statistics for the whole class.
void printClassStats(ArrayList<Student> students) {
    double total = 0;
    int passing = 0;
    Student best = students.get(0);
    for (Student student : students) {
        double mean = average(student.scores());
        total += mean;
        if (mean >= 60) {
            passing++;
        }
        if (mean > average(best.scores())) {
            best = student;
        }
    }

    IO.println();
    IO.println("Class statistics");
    IO.println("  Students:      " + students.size());
    IO.println(String.format("  Class average: %.1f", total / students.size()));
    IO.println(String.format("  Top student:   %s (%.1f)",
            best.name(), average(best.scores())));
    IO.println("  Passing:       " + passing + " of " + students.size());
}

void main() {
    ArrayList<Student> students = new ArrayList<>(List.of(
            new Student(1004, "Ada Lovelace", 9, List.of(88, 92, 85)),
            new Student(1001, "Grace Hopper", 10, List.of(95, 91, 98)),
            new Student(1007, "Alan Turing", 9, List.of(45, 62, 58)),
            new Student(1002, "Katherine Johnson", 11, List.of(99, 97, 94)),
            new Student(1009, "Edsger Dijkstra", 10, List.of(71, 68, 75))));

    printRoster(students);
    printGradeSummary(students);
    printClassStats(students);

    ArrayList<Student> byId = new ArrayList<>(students);
    byId.sort(Comparator.comparing(student -> student.id()));
    Student found = findById(byId, 1007);
    IO.println();
    IO.println("Lookup 1007:   " + (found != null ? found.name() : "not found"));
    IO.println("Lookup 9999:   " + findById(byId, 9999));

    ArrayList<Student> matches = searchByName(students, "a");
    IO.println("Names with 'a': " + matches.size());
}
```

```output
# ID   Name              Gr  Avg Grade
--------------------------------------
1 1002 Katherine Johnson 11 96.7     A
2 1001 Grace Hopper      10 94.7     A
3 1004 Ada Lovelace      9  88.3     B
4 1009 Edsger Dijkstra   10 71.3     C
5 1007 Alan Turing       9  55.0     F
--------------------------------------

By grade level
  Grade 9: 2 students, average 71.7
  Grade 10: 2 students, average 83.0
  Grade 11: 1 students, average 96.7

Class statistics
  Students:      5
  Class average: 81.2
  Top student:   Katherine Johnson (96.7)
  Passing:       4 of 5

Lookup 1007:   Alan Turing
Lookup 9999:   null
Names with 'a': 5
```

Read through that program and count what it uses. Methods with documentation comments and single responsibilities. Loops and conditionals. Lists, maps and records, including a record that holds a list. Comparators and lambdas to sort. Binary search on a sorted list, and linear search where the data is not sorted by the field being searched. `String.format` alignment throughout.

That is the whole course.

A few points of craft worth extracting.

`findById` requires its input sorted by id, which is why the call site sorts a copy first. Its documentation comment says so, because a method with a precondition that is not documented is a trap. When a caller violates it, binary search does not fail loudly—it returns a confidently wrong answer.

The roster numbers its lines with `i + 1`, as Chapter 7's numbered lists did: a rank counts from 1, where an index counts from 0.

`printClassStats` finds the top student with a best-so-far loop that keeps the whole record rather than just the number, so the name and the average come with it.

And "Grade 11: 1 students" is grammatically wrong. Fixing that is your first exercise: it needs a conditional expression, Chapter 10's `? :`, and noticing it at all is the skill worth having.
