# Appendices

## Appendix A: Reading Errors and Debugging

An error message is not a rebuke. It is the most specific help you will get, and learning to read one is worth more than memorizing any amount of syntax.

Java gives two kinds. A **compile error** is javac refusing a program before any of it runs, as Chapter 1 showed. An **exception** stops a program that compiled, partway through its run, as Chapter 4 named it. They look different, and both are read from the top.

### How a box shows an error

A box shows an error much as a terminal does. When javac refuses a program, the box shows javac's message and nothing runs, not even the lines before the mistake. When a program throws an exception, the box shows whatever the program printed first, then the exception's line and the `at` lines under it, as Chapter 7's boxes did.

Runaway programs are stopped for you. A loop that never ends is stopped after five seconds, and a program that prints without end is stopped too; each time the box says why. A recursion that never reaches its base case ends with a `StackOverflowError`, and the box shows that first line alone, as Chapter 12's did.

In Safari, and in every browser on an iPhone or iPad, a box shows an exception's first line without the `at` lines under it. The first line still names the problem.

Run a downloaded file at a terminal (Appendix D) and you see the same messages, with a few small differences. After javac's message, `java` adds a line of its own, `error: compilation failed`. And where a box's messages call the program `Main`, a terminal's use the name of the file you ran: `ch07_04.java` reports `at ch07_04.main(ch07_04.java:3)`.

### How to read a stack trace

The `at` lines under an exception are a **stack trace**: the calls that were still unfinished when the program stopped, the stack Chapter 12 described. This program asks for the average of an empty array:

```java
int average(int[] numbers) {
    int total = 0;
    for (int number : numbers) {
        total += number;
    }
    return total / numbers.length;
}

void main() {
    int[] scores = {};
    IO.println(average(scores));
}
```

```output
Exception in thread "main" java.lang.ArithmeticException: / by zero
	at Main.average(Main.java:6)
	at Main.main(Main.java:11)
```

Read it **from the top**.

1. **The first line names the problem.** `java.lang.ArithmeticException: / by zero`. That is what went wrong: a whole number divided by zero.
2. **The first `at` line is where it happened.** `at Main.average(Main.java:6)`: inside the method `average`, on line 6, which is `return total / numbers.length;`.
3. **Work down for how you got there.** Line 11, in `main`, called `average`, and the failure happened inside it.

The top of a stack trace is where the program broke; the bottom is where it started. Beginners often read the last line, because it is the last thing printed, and it is the least useful part.

At a terminal, a trace can also hold lines that start `at java.base/`, from inside Java's own library: an `IndexOutOfBoundsException` from a list's `get` lists the library's methods above your own. Skip down to the first `at` line that names your program. That is the line of yours that asked for the impossible.

### The errors you will actually meet

javac's messages first. Each names its problem in a few words, and the rest of the message (the line, the caret, sometimes a `symbol:` or `found:` line) says where.

| What javac says | Usual cause and fix |
| --- | --- |
| `';' expected` | A statement without its semicolon: add it at the caret |
| `')' or ',' expected` | A parenthesis never closed, or a missing comma between arguments |
| `unclosed string literal` | A string with no closing quote |
| `unclosed character literal` | A string in single quotes: a string goes in double quotes |
| `'(' expected` | An `if` or `while` without parentheses around its condition |
| `reached end of file while parsing` | A `{` never closed: see the note on where javac points, below |
| `cannot find symbol` | A misspelled name or the wrong case; a variable used outside its block; a method that type does not have |
| `incompatible types` | A value of the wrong type, such as text stored in an `int`: convert it, with `Integer.parseInt` |
| `possible lossy conversion` | A `double` stored in an `int`: cast it, or use a `double` |
| `bad operand types for binary operator` | An operator the type does not have, such as `/` on a `String`, or `==` between a `char` and a `String` |
| `unexpected type` | `ArrayList<int>` where `ArrayList<Integer>` belongs, or an assignment to something that is not a variable, as in `word.charAt(0) = 'J';` |
| `variable ... might not have been initialized` | A way through the code that never gives the variable a value |
| `missing return statement` | A way through a method that returns nothing |
| `not a statement` | A value on its own, such as `2 + 3;`, or a method's name without its `()` |
| `cannot be applied to given types` | Too many or too few arguments, or arguments of the wrong types |
| `cannot assign a value to final variable` | Changing a constant, or a record's component |

Then the exceptions, which stop a program while it runs:

- `ArrayIndexOutOfBoundsException`: an index below 0 or past the end of an array. Valid indexes are 0 to `length - 1`, and the message names the index asked for and the array's length.
- `IndexOutOfBoundsException`: the same for a list, from `get`, `set` or `remove` past `size() - 1`.
- `StringIndexOutOfBoundsException`: a position past the end of a `String`, from `charAt` or `substring`.
- `NumberFormatException`: text that is not a number, given to `Integer.parseInt` or `Double.parseDouble`. The message quotes the text, as in `For input string: "abc"`, and `Integer.parseInt` refuses even a space: `" 5"` fails. Strip the text first, and catch the exception wherever a person types (Chapter 4).
- `ArithmeticException`: `/ by zero`, a whole number divided by zero. Dividing a `double` by zero throws nothing: the answer prints as `Infinity` (`-Infinity` for a negative number), or as `NaN` (not a number) for zero divided by zero. Check the divisor before dividing.
- `NullPointerException`: a method called on `null`, or a `null` stored in an `int`, as when a map's `get` finds no such key. Check with `!= null` or `containsKey` first; the note below says what the message tells you.
- `StackOverflowError`: a recursion that never reaches its base case. Java calls it an error rather than an exception, and it stops the program the same way.
- `UnsupportedOperationException`: a change to a list, map or set made with `List.of`, `Map.of` or `Set.of`, which can never change. Copy it into a new `ArrayList`, `LinkedHashMap` or `LinkedHashSet` first.
- `ConcurrentModificationException`: a list changed while a for-each loop walks it; a removal while the loop is on the second-to-last item throws nothing, but the loop then skips the last one. Build a new list instead.

### A note on `NullPointerException`

A `NullPointerException` means the program used `null`, the value for no object at all, as if it were one: it called a method on it, or stored it in an `int`. At a terminal, Java adds a sentence after the exception's name, saying in plain words what it could not do (call a method, and which one, or turn a value into a number) and what was `null`: what a method gave back, or a variable, which it may name only by a number. In a box, the line ends at the exception's name, and this course never quotes that sentence; the scratchpad prints it too, naming a variable more briefly (Appendix D). Either way, the `at` line under it gives the line where `null` was used. From there, work back to where the value came from: a `get` with no such key, a search that found nothing, a variable never given an object.

### A note on where javac points

javac usually points at the right line. A missing semicolon or parenthesis is reported on the line it is missing from, with the caret just after the last thing javac read there. A missing closing brace is different:

```java
void main() {
    int count = 3;
    if (count > 2) {
        IO.println("big");

    IO.println("done");
}
```

Press Run, and the box shows javac's message:

```text
Main.java:7: error: reached end of file while parsing
}
 ^
1 error
```

The `if` is missing its `}`, which belongs on line 5. javac cannot know that: it does not read indentation (Chapter 4), so it pairs the `}` on line 7 with the `if`, reads on, and only at the end of the file finds that `main` was never closed. When an error makes no sense on the line reported, look above it, and for this message, count the braces.

### Silent bugs

The errors above are the easy ones—the program stops and tells you where. Worse is a program that runs happily and produces the wrong answer.

```java
void main() {
    // Intended: the average of the scores. Prints 44.0 instead of 88.0.
    int[] scores = {88, 92, 84};
    int total = 0;
    for (int score : scores) {
        total += score;
    }
    double average = (double) total / scores.length / 2;
    IO.println(average);
}
```

```output
44.0
```

Nothing is malformed. Java has no way to know what you meant. These are found by checking output against a case you can compute yourself.

Java has a silent bug all its own: `/` between two `int`s drops the fraction without a word (Chapter 3). With scores of 88, 92 and 85, `total / scores.length` gives 88, where the true average is about 88.33.

### Debugging techniques

**1. Print the variables.** Unglamorous and effective. When a program misbehaves, print everything involved right before the failure:

```java
void main() {
    int total = 10;
    int count = 4;
    IO.println("DEBUG: total=" + total + ", count=" + count
            + ", average=" + ((double) total / count));
}
```

```output
DEBUG: total=10, count=4, average=2.5
```

Start them with `DEBUG:` so they are easy to find and delete later.

**2. Check what the text holds.** Java checks types before a program runs (Chapter 2), so a `String` where a number belongs is a compile error rather than a surprise. What javac cannot check is what a `String` holds, and a space you cannot see is a common culprit. Print the text between brackets, with its length:

```java
void main() {
    String score = " 85";
    IO.println("DEBUG: score=[" + score + "], length " + score.length());
}
```

```output
DEBUG: score=[ 85], length 3
```

The brackets show where the text starts and ends, so the space appears as a gap after `[`, and the length counts it. That space is why `Integer.parseInt(score)` would throw a `NumberFormatException` here, and why this course strips typed text before converting it.

**3. Cut the problem in half.** If a 60-line program misbehaves, turn the second half of `main` into comments, with `//` at the start of each line. Still broken? The bug is in the first half. This is binary search applied to your own code, and it finds a bug in a few steps rather than by reading everything.

**4. Test the pieces separately.** This is what Chapter 6's decomposition is for. Call each method with a value whose answer you know:

```java
String letterGrade(int score) {
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

void main() {
    IO.println(letterGrade(90));
    IO.println(letterGrade(89));
    IO.println(letterGrade(0));
}
```

```output
A
B
F
```

Boundaries are where bugs live. Test 89 and 90, not 85.

**5. Read the code aloud.** Describe what each line does, out loud, in plain language. The line where your description differs from the code is usually the bug. This works absurdly well and feels ridiculous, which is why people skip it.

**6. Rubber-duck it.** Explain the program, line by line, to a patient object. Articulating what you *think* it does forces you to notice where that is not what it *says*.

**7. Walk through it by hand.** For a short loop, write out the variables on paper for each pass. Slow, and it finds off-by-one errors nothing else catches.

### Before asking for help

A good question is most of an answer. Have these ready:

- What you expected to happen
- What actually happened, with the **complete** error message
- The smallest piece of code that still shows the problem
- What you have already tried

Assembling that list solves the problem outright surprisingly often.

### Habits that prevent bugs

- **Write a little, run a little.** Three lines at a time, not sixty. A bug in three new lines is trivial to locate.
- **Name things honestly.** `x` hides meaning; `remainingAttempts` reveals it.
- **One method, one job.** Small methods are testable; large ones are guesswork.
- **Test the boundaries.** Zero, one, empty, negative, the largest allowed value, and one past it.
- **Do not repeat yourself.** The same logic in two places will eventually be updated in one.
- **Comment the reasoning.** Not what the line does—why it does it.

## Appendix B: Quick Reference

Everything in this course, on one page. These boxes are reminders, not programs: each holds lines to copy into a program of your own, so none has a Run button.

### Output and input

```java
IO.println("text");
// + joins text and values:
IO.println("Total: " + total);
// arithmetic in parentheses:
IO.println("Sum: " + (a + b));
// a blank line:
IO.println();
// no line ending:
IO.print(word + " ");
// 2 decimal places:
IO.println(String.format("%.2f", price));
// left-aligned in 12 columns,
// then right-aligned in 6:
IO.println(String.format("%-12s%6d", name, score));

// ALWAYS gives back a String:
String name = IO.readln("Name: ");
int age = Integer.parseInt(IO.readln("Age: ").strip());
double cost = Double.parseDouble(text.strip());
// IO.readln gives back null
// when input ends
```

### Types and conversion

```java
// whole numbers:
int count = 3;
// whole numbers past an int's range:
long total = 0;
// decimals:
double price = 3.5;
// true or false:
boolean done = false;
// one character, in single quotes:
char letter = 'a';
// text, in double quotes:
String name = "Ada";

// text to a number:
Integer.parseInt("42")
Double.parseDouble("3.5")
// a number to text, as "" + 42 is:
String.valueOf(42)
(int) 3.9   // 3: drops the fraction
(double) 5  // 5.0
// to 2 decimal places, 3.14:
Math.round(3.14159 * 100) / 100.0

int temp = a;  // swap a and b
a = b;
b = temp;
```

### Operators

```java
+  -  *  /
%           // remainder: 17 % 5 is 2
// int / int drops the fraction:
17 / 5      // 3
17.0 / 5    // 3.4: a double keeps it
// a true average of two ints:
(double) total / count
// 1024.0, always a double:
Math.pow(2, 10)

// comparison, gives true or false:
==  !=  <  >  <=  >=
&&  ||  !    // and, or, not
a.equals(b)  // text: never ==
// a comes before b:
a.compareTo(b) < 0

// shorthand assignment:
x += 1;   x -= 1;   x *= 2;
// add 1, take away 1:
x++;      x--;
```

### Conditionals

```java
if (condition) {
    ...
} else if (otherCondition) {
    ...
} else {
    ...
}

// a conditional expression:
String result = condition ? a : b;
```

A condition must be a `boolean`, `true` or `false`, so `if (name)` does not compile. Test text with `text.isEmpty()`, a list with `list.isEmpty()`, and an object with `found != null`.

### Loops

```java
// i is 0 1 2 3 4:
for (int i = 0; i < 5; i++)
// i is 2 3 4 5:
for (int i = 2; i < 6; i++)
// i is 0 5 10 15:
for (int i = 0; i < 20; i += 5)
// i is 5 4 3 2 1:
for (int i = 5; i > 0; i--)
// i is 1 to 100, both ends:
for (int i = 1; i <= 100; i++)

// each item of an array or list:
for (int score : scores)
// i is the position:
for (int i = 0; i < items.size(); i++) {
    // numbered from 1:
    IO.println((i + 1) + ". " + items.get(i));
}
// each key, for map.get(key):
for (String key : map.keySet())

while (condition)
while (true) {
    if (done) {
        // leave the loop:
        break;
    }
    // skip to the next pass:
    continue;
}
```

### Methods

```java
// return type, name, parameter:
int square(int n) {
    return n * n;
}

// void gives nothing back:
void greet(String name) {
    if (name.isEmpty()) {
        // ends a void method early:
        return;
    }
    IO.println("Hello, " + name);
}

// the same name, no parameter:
void greet() {
    // it passes the usual value:
    greet("world");
}

/// One line, above the method.
```

### Arrays

```java
int[] scores = {88, 92, 79};
scores[0]        // the first
scores.length    // no parentheses
scores[1] = 95;  // change an item
new int[5]       // five zeros
// the last:
scores[scores.length - 1]
// grid[row][col]:
int[][] grid = {{1, 2}, {3, 4}};

// [88, 95, 79], for printing:
Arrays.toString(scores)
// sorts IN PLACE:
Arrays.sort(scores);
// a real copy:
Arrays.copyOf(scores, scores.length)
// items 1 and 2; stop excluded:
Arrays.copyOfRange(scores, 1, 3)
// true if the same items, in order:
Arrays.equals(a, b)
```

### Lists

```java
ArrayList<Integer> items = new ArrayList<>(List.of(1, 2, 3));
// an empty list:
ArrayList<String> names = new ArrayList<>();

items.get(0)      // the first
// the last:
items.get(items.size() - 1)
items.set(1, x);  // replace an item
items.add(x);     // add to the end
items.add(i, x);  // at position i
// remove by position; gives it back:
items.remove(i)
// remove by value:
names.remove("Ada")
items.size()    items.isEmpty()
items.contains(x)
items.indexOf(x)  // -1 if absent
// add every item of another:
items.addAll(other);
// items 1 and 2, a window:
items.subList(1, 3)
// a real copy, not another name:
new ArrayList<>(items)

// IN PLACE, and gives back nothing:
Collections.sort(items);
// reverses in place; after a sort,
// the highest comes first:
Collections.reverse(items);
// how many times x appears:
Collections.frequency(items, x)
// a sorted copy, items unchanged:
ArrayList<Integer> copy = new ArrayList<>(items);
Collections.sort(copy);
// by a key, lowest first, then
// highest first:
students.sort(Comparator.comparing(s -> s.score()));
students.sort(Comparator.comparing((Student s) -> s.score()).reversed());
```

On an `ArrayList<Integer>`, `remove(1)` removes the item at position 1, not the number 1.

### Strings

```java
text.length()
text.charAt(0)  // a char
// the last character:
text.charAt(text.length() - 1)
// positions 1 to 3:
text.substring(1, 4)
// from position 2 to the end:
text.substring(2)

text.toUpperCase()
text.toLowerCase()
text.strip()
// every appearance:
text.replace(a, b)
// a String[] of the pieces:
text.split(",")
// split at spaces:
text.strip().split("\\s+")
// . and | need \\ before them:
text.split("\\.")
String.join(", ", pieces)
text.indexOf(x)  // -1 if absent
text.contains(x)
text.startsWith(x)   text.endsWith(x)
text.isEmpty()     text.equals(other)
"-".repeat(30)

Character.isLetter(c)
Character.isDigit(c)
Character.isLetterOrDigit(c)
(char) ('a' + 1)  // 'b'

// escape sequences:
\n  \t  \"  \'  \\
```

Strings are **immutable**—every method gives back a new string.

### Maps

```java
Map<String, Integer> scores = new LinkedHashMap<>();
// add, or replace the value:
scores.put("Ada", 88);
// null if absent:
scores.get("Ada")
// 0 if absent:
scores.getOrDefault("Ada", 0)
scores.containsKey("Ada")
scores.remove("Ada");
scores.size()

for (String name : scores.keySet())
for (int score : scores.values())
for (Map.Entry<String, Integer> entry : scores.entrySet())
entry.getKey()    entry.getValue()

// count:
counts.put(word, counts.getOrDefault(word, 0) + 1);
// group:
if (!groups.containsKey(key)) {
    groups.put(key, new ArrayList<>());
}
groups.get(key).add(item);

// no promised order:
new HashMap<>()
// the order put in:
new LinkedHashMap<>()
// the keys sorted:
new TreeMap<>()
```

### Sets

```java
Set<String> seen = new HashSet<>();
// a duplicate changes nothing:
seen.add(x);
seen.contains(x)
seen.size()
// the list's items, no duplicates:
new HashSet<>(list)

Set<String> either = new LinkedHashSet<>(a);
either.addAll(b);    // union
Set<String> both = new LinkedHashSet<>(a);
both.retainAll(b);   // intersection
Set<String> onlyA = new LinkedHashSet<>(a);
onlyA.removeAll(b);  // difference
```

### Records

```java
// at the top of the file:
record Point(int x, int y) {}
Point p = new Point(3, 4);
// a component, by its accessor:
p.x()
// true, compared by value:
p.equals(new Point(3, 4))
ArrayList<Point> points = new ArrayList<>();
```

A record cannot be changed: make a new one. A method with two answers returns one record holding both.

### Handling errors

```java
try {
    int value = Integer.parseInt(text.strip());
    IO.println(value * 2);
} catch (NumberFormatException e) {
    IO.println("Not a number.");
}
```

### Random numbers

```java
// made once:
Random random = new Random();
// 1 to 6, as nextInt(6) is 0 to 5:
random.nextInt(6) + 1
// a random item:
items.get(random.nextInt(items.size()))
// shuffles in place:
Collections.shuffle(items, random);
```

### Cost of common operations

| Operation | Cost |
| --- | --- |
| `scores[i]`, `list.get(i)`, `size()` | O(1) |
| `get` or `containsKey` on a `HashMap`, `contains` on a `HashSet` | O(1) on average |
| `get` on a `TreeMap` | O(log n) |
| `contains` or `indexOf` on a list, a loop over every item | O(n) |
| Binary search (sorted) | O(log n) |
| `Arrays.sort`, `Collections.sort` | O(n log n) |
| Selection sort, bubble sort | O(n²) |
| Naive recursive Fibonacci | O(2ⁿ) |

### Choosing a container

| Need | Use |
| --- | --- |
| A fixed number of items, by position | An array |
| Ordered, can grow, duplicates allowed | An `ArrayList` |
| Look up by a name or ID | A map |
| Membership and uniqueness only | A set |
| A fixed group of related values | A record |
| A collection of multi-field records | An `ArrayList` of records |

For a map or a set, choose the kind by the order you need: the order things arrived in, a `LinkedHashMap` or `LinkedHashSet`; sorted, a `TreeMap` or `TreeSet`; no order at all, a `HashMap` or `HashSet`.

### Style conventions

```java
camelCase    // variables and methods
PascalCase   // record and type names
UPPER_CASE   // constants
four spaces  // one level in braces,
             // and always the braces

// the program's entry point:
void main() {
    ...
}
```

## Appendix C: Where to Go Next

This course covered the core of programming: values, decisions, repetition, decomposition, data structures, and algorithms. Those ideas transfer to every language you will ever use. What follows are the things deliberately left out, roughly in the order they become useful, and then what you will meet in other people's Java that this course wrote another way.

### Left out on purpose

**Classes and objects.** Java is built on them. A record is a simple kind of class, whose parts never change; a full class can hold data that changes, and methods that work on it, so a `Student` could keep its own scores and work out its own `average()`. This is the single biggest idea still ahead, and it is normally the start of a second course. Everything in this course works without it.

**Reading and writing files.** Programs here kept data in variables, so it vanished when the program ended. Java's `Files.readAllLines` and `Files.writeString` let a program save its work and read data it did not create.

**Libraries.** This course never wrote an `import` line, because a compact source file can use Java's base library, the `java.base` module, without one. That library holds far more than the course used—dates and times, files, network connections—and the wider Java world adds libraries for data analysis, graphics, games, and web servers.

**Error handling in depth.** `try`/`catch` appeared for one exception, `NumberFormatException`. Real programs use it systematically, and can `throw` exceptions of their own.

**Testing frameworks.** Checking work by calling methods with known inputs is testing by hand. Tools like JUnit run hundreds of such checks automatically, every time you change something.

### What you will see elsewhere

This course wrote Java the way Java 25 lets a beginner write it: short files, `IO.println`, a type written on every variable. Most Java you will read is older, or written for larger programs, and does some of these things another way. None of it is new underneath: each is another way to say something you already know. Here is what you will meet first, each shown once.

**`public class` and `public static void main(String[] args)`.** Until Java 25, this was the only standard way to write a program, and most Java you will read is written so:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}
```

```output
Hello, world!
```

`public class Main` declares the class the file holds, and `public` lets code outside it use it. `static` comes below, and `String[] args` holds any words typed after the program's name when it is started at a terminal. `System.out.println` is `IO.println`'s older twin, and `System.out.print` is `IO.print`'s. A compact source file, the kind this course uses, is the same program with the wrapping left out.

**`printf`.** `System.out.printf` prints a format string the way `String.format` builds one:

```java
void main() {
    double price = 7.5;
    System.out.printf("Price: %.2f%n", price);
    IO.println(String.format("Price: %.2f", price));
}
```

```output
Price: 7.50
Price: 7.50
```

`printf` does not end the line by itself; the `%n` in its format string does. Chapter 3's `String.format` is the same formatting, given back as text.

**`Scanner`.** Before `IO.readln`, Java programs read typed input with a `Scanner`, and many still do. It has a trap that catches nearly everyone once:

```java
void main() {
    Scanner scanner = new Scanner(System.in);
    System.out.print("Age: ");
    int age = scanner.nextInt();
    System.out.print("Name: ");
    String name = scanner.nextLine();
    System.out.println("Hello, " + name + ", age " + age);
}
```

```output
Age: 21
Name: Hello, , age 21
```

The program never waits for a name. `nextInt` reads the number and stops, leaving the Enter typed after it unread; `nextLine` reads up to the next Enter, finds that one at once, and gives back an empty line. The usual cure is an extra `scanner.nextLine();` after `nextInt`, to read past it, or reading every answer with `nextLine` and converting it with `Integer.parseInt`, as this course has done with `IO.readln` all along.

**`var`.** Java can work out a local variable's type from its value:

```java
void main() {
    var name = "Ada";
    var count = 3;
    var scores = new ArrayList<Integer>();
    scores.add(88);
    IO.println(name + " " + count + " " + scores);
}
```

```output
Ada 3 [88]
```

`name` is still a `String` and `count` an `int`; `var` only saves writing it. The type is as fixed as ever, so `name = 5;` does not compile. This course wrote every type out, because seeing them is how you learn them.

**`static`.** In other people's code, constants are written `static final`, and many methods are `static` too:

```java
static final int PASS_MARK = 60;

static boolean passed(int score) {
    return score >= PASS_MARK;
}

void main() {
    IO.println(passed(75));
    IO.println(passed(42));
}
```

```output
true
false
```

`static` makes a field or a method belong to the class itself rather than to each object made from it. In a class written the long way, `main` is `static`, and a `static` method can call another method of its class directly only if that one is `static` too, which is why so much code is marked with it.

**Streams.** Where this course wrote a loop to total, filter or change every item, much Java uses streams:

```java
void main() {
    int[] scores = {88, 92, 79, 95};
    IO.println(Arrays.stream(scores).sum());

    List<String> names = List.of("Ada", "Grace", "Alan");
    List<String> longer = names.stream()
            .filter(name -> name.length() > 3)
            .map(name -> name.toUpperCase())
            .toList();
    IO.println(longer);
}
```

```output
354
[GRACE, ALAN]
```

A stream passes the items through a chain of steps: `filter` keeps the ones its lambda says yes to, `map` changes each one, and `toList` collects what comes out. Underneath, each step is a loop like the ones you wrote, as Chapter 7 said.

**`StringBuilder`.** Building text with `+=` makes a new `String` each time, which is fine for short text (Chapter 8). Programs that build long text use a `StringBuilder`, which grows in place:

```java
void main() {
    StringBuilder row = new StringBuilder();
    for (int i = 1; i <= 5; i++) {
        row.append(i).append(" ");
    }
    IO.println(row.toString().strip());
}
```

```output
1 2 3 4 5
```

**Javadoc.** This course wrote documentation comments with `///` (Chapter 6), which Java has allowed since version 23. Most code writes them the older way, between `/**` and `*/`, often with `@param` and `@return` lines for each parameter and the result:

```java
/**
 * Returns the average of the numbers.
 *
 * @param numbers the numbers to average, at least one
 * @return their mean
 */
double average(int[] numbers) {
    int total = 0;
    for (int number : numbers) {
        total += number;
    }
    return (double) total / numbers.length;
}

void main() {
    IO.println(average(new int[] {88, 92, 84}));
}
```

```output
88.0
```

### A sensible order to learn them

1. **Files**—because a program that remembers things is far more interesting
2. **Libraries**—Java's own is enormous and free
3. **Classes**—once your programs have several kinds of thing in them
4. **Testing**—once your programs are too big to check by hand
5. **A second language**—the concepts transfer; only the syntax is new

### Where the algorithms go

Chapter 11 covered searching and sorting because they are the classic introduction. The field continues:

- **Data structures**—stacks, queues, linked lists, trees, graphs, hash tables (which is what a `HashMap` actually is)
- **Better sorts**—merge sort and quicksort, both O(n log n) (quicksort on average), both naturally recursive
- **Graph algorithms**—shortest paths, network connectivity, dependency ordering
- **Dynamic programming**—the general form of the memoization trick from Chapter 12

A first algorithms course covers roughly that list, and it is where computer science starts to feel like mathematics.

### Practicing

Programming is learned by writing programs. Some ways to keep going:

- **Finish the exercises.** Every Try It in this course, including the ones you skipped.
- **Extend the projects.** Add letter-grade curves to the gradebook. Make the inventory system accept new items. Give the guessing game a high-score table.
- **Solve puzzles.** Project Euler, Advent of Code, and similar sites offer graded problems that are good practice and genuinely fun.
- **Automate something tedious.** The best beginner projects solve a problem you actually have—renaming a folder of files, tracking a habit, calculating something you currently do by hand.
- **Read other people's code.** Open-source projects are free to read. Most of it will be over your head at first, which is fine and normal, and "What you will see elsewhere," above, names what you will meet first.

### A closing thought

The difficulty in programming is rarely syntax. Syntax is memorization and it comes with practice. The difficulty is **decomposition**—looking at a problem and seeing the pieces it breaks into, and working out how to represent its data.

That skill is what Chapter 6 and Part II were really teaching, and it is the one that makes a good programmer. It is also the one that does not become obsolete: the languages change every decade, and knowing how to break a problem apart does not.

## Appendix D: Boxes and jshell

There are two places to type Java on these pages, and they do not behave the same way. The difference trips people up once, and then never again.

### A code box is a file

Every code box in a chapter behaves like a file you have saved and run. javac reads all of it first, and then the program starts from nothing, runs top to bottom, and finishes. Nothing it makes is kept: a variable you create in one box does not exist in the next box, and neither does a method you declare.

Because a box is a file, it shows you only what you ask it to show you, and it holds every line to Java's rules. Press Run on this one and watch what happens.

```java
void main() {
    2 + 3;
}
```

javac refuses it:

```text
Main.java:2: error: not a statement
    2 + 3;
      ^
1 error
```

A value on a line of its own is not a statement, Java's word for an instruction (Chapter 4): nothing is done with it, so javac refuses the whole program. That is not the page being unhelpful—a file you run with `java Main.java` does exactly the same. To see a value, print it.

```java
void main() {
    IO.println(2 + 3);
}
```

```output
5
```

This is the behavior the whole course is written around, which is why the chapter boxes work this way.

### The scratchpad is jshell

The **Scratchpad** button in the bottom right-hand corner opens jshell, the Java shell, and it is a different thing. Two differences matter.

It remembers. What you type on one line is still there on the next, so you can build something up a piece at a time.

It answers. Type an expression and it shows you the value, with no `IO.println` needed, and it lets you leave off the semicolon at the end of a line. Here is a short session, with `jshell>` marking what was typed.

```text
jshell> 2 + 3
$1 ==> 5

jshell> String word = "Java"
word ==> "Java"

jshell> word.toUpperCase()
$3 ==> "JAVA"

jshell> word.length()
$4 ==> 4

jshell> word.charAt(0)
$5 ==> 'J'
```

`$1` is the name jshell gives the first answer, so a later line can use it. jshell numbers every entry, declarations too, which is why the answer on the third line is `$3`; a declaration answers with its variable's own name.

Note the quotation marks around `"JAVA"`, and the single quotes around `'J'`. The scratchpad shows you what a value *is*, so you can see at a glance that the first is a `String` and the second a `char`. `IO.println` shows you what a value *looks like*, and prints `JAVA` with no quotes. Both are true, and the difference is a useful thing to be able to see.

### Which one to use

Use the scratchpad when you have a question. What does `"5" + 1` give? Is `7 / 2` 3 or 3.5? Does `Math.round(2.5)` give 2 or 3? Questions like these are answered faster by typing them than by reasoning about them, and getting an answer wrong costs you nothing there.

Use a code box when you are writing a program. A program is a thing that runs from the top every time, for anyone, without you typing at it, and the boxes hold you to that.

When you leave the page, the scratchpad forgets every variable and method you made, though the Up arrow still brings back the lines you typed. Your edits to the chapter boxes are kept, and the Reset button puts a box back to how it started.

### Where the scratchpad differs from jshell on a computer

The scratchpad runs the JDK's own jshell engine in your browser, and a test holds what it prints to what jshell prints on a computer, entry by entry, over more than five hundred entries. The two print the same, except in these places:

- **It starts with a different set of imports.** jshell on a computer starts with all of Java's base library, the `java.base` module. The scratchpad starts with the parts most programs use, which hold every class this course uses; `/imports` lists them, and a class from further afield needs an `import` line first.
- **Declaring a record again can reset more.** Change a record you declared and declare it again, and a variable holding one of the old kind may be reset where jshell on a computer would keep it. When that happens, the scratchpad says so, in jshell's own words.
- **Java's own `at` lines say `(Unknown Source)`.** When an entry throws an exception, the `at` lines from inside Java's library end in `(Unknown Source)`, where jshell on a computer gives the library's file and line. The lines for your own entries, such as `(#5:1)`, are the same.
- **A few exception messages are worded differently.** The words after an exception's name can differ: a `StackOverflowError` names the method that kept calling itself, where jshell on a computer gives no words at all, and a `NullPointerException` names its variable more briefly. The exception's name is always the same.
- **Its help is the course's own.** `/help` describes what the scratchpad offers, in the course's words, and a command it does not offer, such as `/save`, which would need a file, says so plainly.

Two more things are worth knowing. The scratchpad cannot read typed input, so a program that asks a question belongs in a box. And a session that runs a long time eventually fills its memory; the scratchpad then says so and starts a fresh one, as it does after an entry that runs for a minute.

### Taking it with you

Every example in a chapter is also available to download, as an ordinary `.java` file, if you would rather work in an editor on your own machine. At the end of each chapter's page, a link to that chapter's programs leads to [the downloads page](bundle.html), which lists every file with a few words about what it does. For the code you need Java 25 (the JDK) or newer and nothing else, and each file runs with the command its last lines give, such as `java ch07_04.java`.

Each file is one box: `ch07_04.java` is chapter 7's fourth box. Its code is the box's code exactly, so the line numbers in an error match the page, and a few comment lines under it say where it came from and how to run it.

A box that fails on purpose is kept as it is, and its comments say that it fails and why, so running it shows the same error the page did, with the file's own name where the page said `Main`. A program that asks you to type something simply stops and waits for you to type it. Some boxes have no file: an exercise whose Check runs the code you write, since its box starts from code for you to finish (its answer is behind Show a solution), and everything on the practice pages, the front matter and these appendices.

Those files are made from these chapters every time the course is built, so they cannot disagree with what you have been reading. One more thing can differ from the page: `String.format` follows the computer's language settings, so on a computer set to German, a file whose box printed `7.50` on the page prints `7,50` at the terminal.
