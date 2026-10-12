<!-- part: Part II: Structuring Data -->
# Chapter 10: Records

A **record** is a small type of your own that holds a fixed set of values together, each with a name, and that cannot be changed after it is made. You declare one in a single line, outside every method, and then make as many as you like with `new`:

```java
record Point(int x, int y) {}

record Color(int red, int green, int blue) {}

void main() {
    Point point = new Point(3, 4);
    Color color = new Color(255, 128, 0);

    IO.println(point.x());
    IO.println(color.blue());

    IO.println(point);
    IO.println(color);
}
```

```output
3
0
Point[x=3, y=4]
Color[red=255, green=128, blue=0]
```

`record Point(int x, int y) {}` declares a new type, `Point`, and says what every `Point` holds: two `int`s, named `x` and `y`. These are the record's **components**. `Point` starts with a capital letter because it is a type, as Chapter 2 said, and it can be used like any other type: `Point point` creates a variable that holds one. `new Point(3, 4)` makes one, with the values in the order the components were declared. The `{}` at the end is the record's body, which this course always leaves empty.

To read a component, call its **accessor**: a method Java writes for every record, one for each component and named after it, which gives back that component's value. `point.x()` is 3, and the parentheses are there because an accessor is a method. A record prints as its type's name with each component and its value in square brackets.

A record is not a list. It has no indexes, no length and no loop over its parts: each part has a name instead, which is the point. And there is one thing you cannot do with a record at all, which is change it:

```java
record Student(String name, int score) {}

void main() {
    Student ada = new Student("Ada", 88);
    ada.score = 91;
    IO.println(ada);
}
```

Press Run, and javac refuses:

```text
Main.java:5: error: cannot assign a value to final variable score
    ada.score = 91;
       ^
1 error
```

Each component is held in a `final` variable, one that is set once and never changes, like Chapter 6's constants, so javac refuses any line that tries to change it. A student with a different score is a different record, `new Student("Ada", 91)`.

## Why have a type that cannot change?

The question is fair, and there are three answers.

**It documents intent.** A record says "these values belong together and this grouping will not change." A coordinate pair, an RGB color, a latitude and longitude, a month and day—these are single things that happen to have parts, not collections you will be adding to. A reader who sees a record knows not to look for code that modifies it.

**It cannot be corrupted by accident.** Chapter 7 showed that a method can change a list it is handed. Because a record cannot be changed, passing one to a method carries no risk that the method will alter it behind your back. That holds for components like this chapter's, numbers and text; a component that is itself a list holds a reference to it, as Chapter 7 put it, so a method can still change that list.

**It can be a map key.** This is the concrete, practical reason, and it rests on how records compare. Two records are equal when their components are equal:

```java
record Point(int x, int y) {}

void main() {
    Point a = new Point(3, 4);
    Point b = new Point(3, 4);
    Point c = a;

    IO.println(a.equals(b));
    IO.println(a == b);
    IO.println(a == c);
}
```

```output
true
false
true
```

`.equals` compares two records component by component, so `a` and `b` are equal. `==` asks Chapter 7's question instead: do these two variables hold the same object? Each `new` makes a new object, so `a` and `b` are two objects that happen to hold the same values, while `c = a` copies the reference, and `a` and `c` hold the same one. Compare records with `.equals`, as you compare text.

A map looks up a key by its value, as `.equals` compares it, and a key must never change while the map holds it, or the map could no longer find it. A record passes on both counts, so it makes a natural key: a `new Cell(1, 1)` made anywhere finds the entry put in under another `new Cell(1, 1)`.

```java
record Cell(int row, int col) {}

void main() {
    // Storing values on a grid, keyed by cell
    Map<Cell, String> board = new LinkedHashMap<>();
    board.put(new Cell(0, 0), "X");
    board.put(new Cell(1, 1), "O");
    board.put(new Cell(2, 2), "X");

    IO.println(board.get(new Cell(1, 1)));
    IO.println(board.containsKey(new Cell(0, 0)));
    IO.println(board.containsKey(new Cell(0, 1)));
}
```

```output
O
true
false
```

That is a clean way to represent a sparse grid—a chess or tic-tac-toe board where most squares are empty—without building a full two-dimensional array.

## Reading the parts

You read each component with its accessor, a line apiece:

```java
record Point(int x, int y) {}

void main() {
    Point point = new Point(3, 4);
    int x = point.x();
    int y = point.y();
    IO.println("x is " + x + ", y is " + y);
}
```

```output
x is 3, y is 4
```

Making a record works the other way, and is just as strict: `new` takes exactly one value for each component, in order. `new Point(3)` leaves out `y`, and javac refuses it with `cannot be applied to given types`, listing the types it `required` and the ones it `found`.

One of a record's best uses is as a method's result. Chapter 6 said a method returns one value, and wrote two methods where two answers were wanted. A record is one value that holds several, so one method can hand back both:

```java
record Range(int lowest, int highest) {}

/// Returns the smallest and largest values in an array.
Range minMax(int[] numbers) {
    int lowest = numbers[0];
    int highest = numbers[0];
    for (int number : numbers) {
        if (number < lowest) {
            lowest = number;
        }
        if (number > highest) {
            highest = number;
        }
    }
    return new Range(lowest, highest);
}

void main() {
    int[] numbers = {5, 2, 9, 1};
    Range result = minMax(numbers);
    IO.println(result);
    IO.println("from " + result.lowest() + " to " + result.highest());
}
```

```output
Range[lowest=1, highest=9]
from 1 to 9
```

`minMax` names `Range` as its return type, makes one with `new` at the end, and the caller reads each part with an accessor. A record declared just to carry one method's answer is common, and cheap: it is one line.

You have met the idea before. Chapter 9's `Map.Entry` is a key and its value held together in one object, read with `getKey()` and `getValue()`, which is why a loop over `entrySet()` can hand you both at once.

## Lists of records

Here is where Part II comes together. Real data is usually a **collection of records**, each record holding several named fields. In Java that is a list of records: an `ArrayList` whose items are records.

```java
record Student(String name, int grade, int score) {}

void main() {
    ArrayList<Student> students = new ArrayList<>(List.of(
            new Student("Ada", 9, 88),
            new Student("Grace", 10, 92),
            new Student("Alan", 9, 45),
            new Student("Katherine", 11, 95)));

    for (Student student : students) {
        IO.println(student.name() + ": " + student.score());
    }
}
```

```output
Ada: 88
Grace: 92
Alan: 45
Katherine: 95
```

Any type can go between an `ArrayList`'s angle brackets, a record of your own included, so `ArrayList<Student>` is a list of students.

Compare this with Chapter 7's parallel arrays. Each student's facts now travel together in one place. Sorting the list rearranges whole records rather than breaking the correspondence between them, and adding a new field means adding a component rather than creating and maintaining a fourth array; javac then points to every `new Student(...)` that leaves it out. Compare it with Chapter 9's map of maps, too: there every fact had to be a `String`, while each component of a record has its own type, so a score is an `int` you can add up.

## Working with records

Each program in this section starts from the same four students, so that each one runs on its own.

**Filtering:**

```java
record Student(String name, int grade, int score) {}

void main() {
    ArrayList<Student> students = new ArrayList<>(List.of(
            new Student("Ada", 9, 88),
            new Student("Grace", 10, 92),
            new Student("Alan", 9, 45),
            new Student("Katherine", 11, 95)));

    ArrayList<Student> ninthGraders = new ArrayList<>();
    for (Student student : students) {
        if (student.grade() == 9) {
            ninthGraders.add(student);
        }
    }

    for (Student student : ninthGraders) {
        IO.println(student.name());
    }
}
```

```output
Ada
Alan
```

**Extracting one field:**

```java
record Student(String name, int grade, int score) {}

void main() {
    ArrayList<Student> students = new ArrayList<>(List.of(
            new Student("Ada", 9, 88),
            new Student("Grace", 10, 92),
            new Student("Alan", 9, 45),
            new Student("Katherine", 11, 95)));

    ArrayList<Integer> allScores = new ArrayList<>();
    for (Student student : students) {
        allScores.add(student.score());
    }
    IO.println(allScores);

    int total = 0;
    for (int score : allScores) {
        total += score;
    }
    IO.println((double) total / allScores.size());
}
```

```output
[88, 92, 45, 95]
80.0
```

**Sorting by a field:**

```java
record Student(String name, int grade, int score) {}

void main() {
    ArrayList<Student> students = new ArrayList<>(List.of(
            new Student("Ada", 9, 88),
            new Student("Grace", 10, 92),
            new Student("Alan", 9, 45),
            new Student("Katherine", 11, 95)));

    ArrayList<Student> byScore = new ArrayList<>(students);
    byScore.sort(Comparator.comparing((Student s) -> s.score())
            .reversed());

    for (Student student : byScore) {
        IO.println(String.format("%-12s%d", student.name(), student.score()));
    }
}
```

```output
Katherine   95
Grace       92
Ada         88
Alan        45
```

That comparator is the same idea as in Chapter 9: the lambda `(Student s) -> s.score()` says what to compare, each student's score, and `.reversed()` puts the highest first, which is why the lambda's parameter has its type written out. The sort works on a copy, so `students` keeps its own order. Crucially, the records stay intact—Katherine keeps her own score, which is exactly what parallel arrays could not guarantee.

**Finding one record:**

```java
record Student(String name, int grade, int score) {}

/// Returns the record for a named student, or null if there is none.
Student findStudent(ArrayList<Student> students, String name) {
    for (Student student : students) {
        if (student.name().toLowerCase().equals(name.toLowerCase())) {
            return student;
        }
    }
    return null;
}

void main() {
    ArrayList<Student> students = new ArrayList<>(List.of(
            new Student("Ada", 9, 88),
            new Student("Grace", 10, 92),
            new Student("Alan", 9, 45),
            new Student("Katherine", 11, 95)));

    Student found = findStudent(students, "grace");
    if (found != null) {
        IO.println(found.name() + " is in grade " + found.grade() + ".");
    } else {
        IO.println("Not found.");
    }
}
```

```output
Grace is in grade 10.
```

Returning `null` when nothing matches, and having the caller check, is a standard pattern. Chapter 6's methods answered `-1` for a position that was not there; a method that gives back a record answers `null`, no record at all, the value Chapter 9's `get` gave for a missing key. The check matters: calling a method on `null`, as `found.name()` would be if no student matched, stops the program with a `NullPointerException`. Chapter 11 looks at what this loop costs when the list gets long.

**Grouping into a map:**

```java
record Student(String name, int grade, int score) {}

void main() {
    ArrayList<Student> students = new ArrayList<>(List.of(
            new Student("Ada", 9, 88),
            new Student("Grace", 10, 92),
            new Student("Alan", 9, 45),
            new Student("Katherine", 11, 95)));

    Map<Integer, ArrayList<String>> byGrade = new TreeMap<>();
    for (Student student : students) {
        int grade = student.grade();
        if (!byGrade.containsKey(grade)) {
            byGrade.put(grade, new ArrayList<>());
        }
        byGrade.get(grade).add(student.name());
    }

    for (int grade : byGrade.keySet()) {
        IO.println("Grade " + grade + ": " + String.join(", ", byGrade.get(grade)));
    }
}
```

```output
Grade 9: Ada, Alan
Grade 10: Grace
Grade 11: Katherine
```

Each value in the map is a list of names, and the map's type says so: `Map<Integer, ArrayList<String>>`. The first time the loop meets a grade, the map has no list for it, so the `if` puts in an empty one. After that, `byGrade.get(grade)` gives back the list the map holds—the same object, not a copy—and `add` puts the name into it. A `TreeMap` keeps the grades in order, smallest first.

That pattern—a map whose values are lists—is how you group anything by a shared property, and it shows up constantly once you start handling real data.

## Common mistakes

| Mistake | What happens |
| --- | --- |
| `ada.score = 91;` on a record | Does not compile—a record cannot be changed; make a new one |
| `student.getName()` | `cannot find symbol`—the accessor is `name()` |
| `new Point(3)` for a two-part record | Does not compile—give every component, in order |
| `a == b` on two records | `false` for two objects, even with the same parts—use `.equals` |
| `found.name()` when `found` is `null` | An exception—check `found != null` first |
| `Collections.sort` on a list of records | Does not compile—a record has no order of its own; sort with `Comparator.comparing` |

The table's exception is a `NullPointerException`.

## Try It

Exercises 2 and 6 name their methods exactly, as Chapter 6's did, and Check calls them with the cases listed under "What it should do." Those cases make each record in place with `new`, such as `new Point(3, 4)`, and Check compares records with `.equals`, so any record with the right components is the right answer.

**1.** Store five cities as records, each with a name, a latitude and a longitude—Tokyo (35.68, 139.69), Cairo (30.04, 31.24), Lima (-12.05, -77.04), Oslo (59.91, 10.75) and Perth (-31.95, 115.86)—and print each on its own line, in that order, with its coordinates to two decimal places, as `Tokyo: (35.68, 139.69)`.

```java
// Five cities as records, printed with their coordinates.

record City(String name, double latitude, double longitude) {}

void main() {
    ArrayList<City> cities = new ArrayList<>(List.of(
            new City("Tokyo", 35.68, 139.69),
            new City("Cairo", 30.04, 31.24),
            new City("Lima", -12.05, -77.04),
            new City("Oslo", 59.91, 10.75),
            new City("Perth", -31.95, 115.86)));

    for (City city : cities) {
        IO.println(String.format("%s: (%.2f, %.2f)",
                city.name(), city.latitude(), city.longitude()));
    }
}
```

**2.** Write `double distance(Point p1, Point p2)`, taking two points and returning the distance between them, where each point is a `record Point(double x, double y) {}`. `Math.sqrt(n)` gives the square root of `n` as a `double`: `Math.sqrt(25)` is `5.0`.

```java
record Point(double x, double y) {}

double distance(Point p1, Point p2) {
    double dx = p2.x() - p1.x();
    double dy = p2.y() - p1.y();
    return Math.sqrt(dx * dx + dy * dy);
}

void main() {
    IO.println(distance(new Point(0, 0), new Point(3, 4)));
}
```

**3.** Build a list of book records, each with a title, an author and a year—Dune by Frank Herbert (1965), Neuromancer by William Gibson (1984), The Hobbit by J.R.R. Tolkien (1937), Project Hail Mary by Andy Weir (2021) and Foundation by Isaac Asimov (1951)—then print them sorted by year, oldest first, one to a line, as `1965: Dune by Frank Herbert`.

```java
// Book records, printed oldest first.

record Book(String title, String author, int year) {}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Neuromancer", "William Gibson", 1984),
            new Book("The Hobbit", "J.R.R. Tolkien", 1937),
            new Book("Project Hail Mary", "Andy Weir", 2021),
            new Book("Foundation", "Isaac Asimov", 1951)));

    ArrayList<Book> byYear = new ArrayList<>(books);
    byYear.sort(Comparator.comparing(book -> book.year()));

    for (Book book : byYear) {
        IO.println(book.year() + ": " + book.title() + " by " + book.author());
    }
}
```

**4.** From that list, print only the books published after 2000, each as its title and year, as `Dune (1965)`.

```java
// Prints the books published after 2000.

record Book(String title, String author, int year) {}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Neuromancer", "William Gibson", 1984),
            new Book("The Hobbit", "J.R.R. Tolkien", 1937),
            new Book("Project Hail Mary", "Andy Weir", 2021),
            new Book("Foundation", "Isaac Asimov", 1951)));

    ArrayList<Book> recent = new ArrayList<>();
    for (Book book : books) {
        if (book.year() > 2000) {
            recent.add(book);
        }
    }

    for (Book book : recent) {
        IO.println(book.title() + " (" + book.year() + ")");
    }
}
```

**5.** Group the books by author into a map from each author to a list of their titles, then print each author, in alphabetical order, with their titles after a colon in the order the books are listed. The list here adds a sixth book, Children of Dune by Frank Herbert (1976), so that one author has two, printed as `Frank Herbert: Dune, Children of Dune`.

```java
// Groups the books by author.

record Book(String title, String author, int year) {}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Neuromancer", "William Gibson", 1984),
            new Book("The Hobbit", "J.R.R. Tolkien", 1937),
            new Book("Project Hail Mary", "Andy Weir", 2021),
            new Book("Foundation", "Isaac Asimov", 1951),
            new Book("Children of Dune", "Frank Herbert", 1976)));

    Map<String, ArrayList<String>> byAuthor = new TreeMap<>();
    for (Book book : books) {
        String author = book.author();
        if (!byAuthor.containsKey(author)) {
            byAuthor.put(author, new ArrayList<>());
        }
        byAuthor.get(author).add(book.title());
    }

    for (String author : byAuthor.keySet()) {
        IO.println(author + ": " + String.join(", ", byAuthor.get(author)));
    }
}
```

**6.** Write `Book oldest(ArrayList<Book> books)`, returning the record—not just the title—of the earliest book.

```java
record Book(String title, String author, int year) {}

/// Returns the record of the earliest published book.
Book oldest(ArrayList<Book> books) {
    Book earliest = books.get(0);
    for (Book book : books) {
        if (book.year() < earliest.year()) {
            earliest = book;
        }
    }
    return earliest;
}

void main() {
    ArrayList<Book> books = new ArrayList<>(List.of(
            new Book("Dune", "Frank Herbert", 1965),
            new Book("Neuromancer", "William Gibson", 1984),
            new Book("The Hobbit", "J.R.R. Tolkien", 1937),
            new Book("Project Hail Mary", "Andy Weir", 2021),
            new Book("Foundation", "Isaac Asimov", 1951)));

    Book result = oldest(books);
    IO.println(result.title() + " (" + result.year() + ") by " + result.author());
}
```

**7.** Use a map with `Cell` keys to store a 3-by-3 tic-tac-toe board with an X at row 0, column 0 and at row 0, column 2, and an O at row 1, column 1 and at row 2, column 0. Then print it as a grid: three lines, the squares separated by a space and `.` for an empty square, so the top line reads `X . X`.

```java
// A tic-tac-toe board in a map with Cell keys, printed as a grid.

record Cell(int row, int col) {}

void main() {
    Map<Cell, String> board = new LinkedHashMap<>();
    board.put(new Cell(0, 0), "X");
    board.put(new Cell(1, 1), "O");
    board.put(new Cell(0, 2), "X");
    board.put(new Cell(2, 0), "O");

    for (int row = 0; row < 3; row++) {
        ArrayList<String> cells = new ArrayList<>();
        for (int col = 0; col < 3; col++) {
            cells.add(board.getOrDefault(new Cell(row, col), "."));
        }
        IO.println(String.join(" ", cells));
    }
}
```

## Chapter project: an inventory system

Build an inventory that stores items as records and answers real questions about them.

One line in it, in `printAlerts`, chooses between two words with something new: a **conditional expression**. `left == 0 ? "OUT OF STOCK" : left + " left"` works out the condition before the `?`, then gives back the value after the `?` when the condition is `true` and the value after the `:` when it is `false`. It is an `if`/`else` that produces a value rather than choosing statements.

```java
// An inventory of items stored as records, with reports.

record Item(String name, String category, double price, int quantity) {}

final int LOW_STOCK = 10;

/// Returns the total value of one item's stock.
double itemValue(Item item) {
    return item.price() * item.quantity();
}

/// Returns the total value of all stock.
double totalValue(ArrayList<Item> items) {
    double total = 0.0;
    for (Item item : items) {
        total += itemValue(item);
    }
    return total;
}

/// Returns the items at or below a stock threshold, fewest first.
ArrayList<Item> lowStock(ArrayList<Item> items, int threshold) {
    ArrayList<Item> low = new ArrayList<>();
    for (Item item : items) {
        if (item.quantity() <= threshold) {
            low.add(item);
        }
    }
    low.sort(Comparator.comparing(item -> item.quantity()));
    return low;
}

/// Returns a map from each category to its items, categories in order.
Map<String, ArrayList<Item>> byCategory(ArrayList<Item> items) {
    Map<String, ArrayList<Item>> groups = new TreeMap<>();
    for (Item item : items) {
        if (!groups.containsKey(item.category())) {
            groups.put(item.category(), new ArrayList<>());
        }
        groups.get(item.category()).add(item);
    }
    return groups;
}

/// Prints the full inventory table.
void printInventory(ArrayList<Item> items) {
    ArrayList<Item> byName = new ArrayList<>(items);
    byName.sort(Comparator.comparing(item -> item.name()));

    IO.println(String.format("%-10s%-8s%6s%5s%9s",
            "Item", "Category", "Price", "Qty", "Value"));
    IO.println("-".repeat(38));
    for (Item item : byName) {
        IO.println(String.format("%-10s%-8s$%5.2f%5d  $%6.2f",
                item.name(), item.category(), item.price(),
                item.quantity(), itemValue(item)));
    }
    IO.println("-".repeat(38));
    IO.println(String.format("%-31s$%6.2f", "TOTAL", totalValue(items)));
}

/// Prints low-stock and out-of-stock warnings.
void printAlerts(ArrayList<Item> items) {
    IO.println();
    IO.println("Low stock (at or below " + LOW_STOCK + "):");
    for (Item item : lowStock(items, LOW_STOCK)) {
        int left = item.quantity();
        String state = left == 0 ? "OUT OF STOCK" : left + " left";
        IO.println(String.format("  %-12s%s", item.name(), state));
    }
}

/// Prints a summary of each category.
void printCategories(ArrayList<Item> items) {
    IO.println();
    IO.println("By category:");
    Map<String, ArrayList<Item>> groups = byCategory(items);
    for (String category : groups.keySet()) {
        ArrayList<Item> members = groups.get(category);
        double value = totalValue(members);
        IO.println(String.format("  %-10s%d items%10.2f",
                category, members.size(), value));
    }
}

void main() {
    ArrayList<Item> inventory = new ArrayList<>(List.of(
            new Item("Notebook", "paper", 3.50, 42),
            new Item("Pens", "writing", 2.25, 8),
            new Item("Stickers", "paper", 1.75, 120),
            new Item("Backpack", "bags", 34.99, 5),
            new Item("Pencils", "writing", 1.20, 3),
            new Item("Lunch box", "bags", 12.00, 0)));

    printInventory(inventory);
    printAlerts(inventory);
    printCategories(inventory);
}
```

```output
Item      Category Price  Qty    Value
--------------------------------------
Backpack  bags    $34.99    5  $174.95
Lunch box bags    $12.00    0  $  0.00
Notebook  paper   $ 3.50   42  $147.00
Pencils   writing $ 1.20    3  $  3.60
Pens      writing $ 2.25    8  $ 18.00
Stickers  paper   $ 1.75  120  $210.00
--------------------------------------
TOTAL                          $553.55

Low stock (at or below 10):
  Lunch box   OUT OF STOCK
  Pencils     3 left
  Backpack    5 left
  Pens        8 left

By category:
  bags      2 items    174.95
  paper     2 items    357.00
  writing   2 items     21.60
```

Four things to notice.

`final int LOW_STOCK = 10;` is a constant, as in Chapter 6—a value fixed for the whole program, written in capitals. Java enforces it: a line that tries to change `LOW_STOCK` stops at javac with `cannot assign a value to final variable`, the message a record gave at the start of this chapter, for the same reason. Having the threshold in one named place beats scattering `10` through the code.

`byCategory` groups with the three lines from earlier in this chapter: it puts in an empty list for a category the map does not have yet, then adds to the list the map holds. Its map is a `TreeMap`, so `printCategories` meets the categories in alphabetical order with no sorting of its own, while `printInventory` sorts a copy by name, so `inventory` itself keeps the order the items were listed in.

The long `String.format` calls in `printInventory` are split across lines after a comma, as in Chapter 7. A formatting line that runs past 80 characters is hard to check, and this keeps each piece readable.

Finally, `left == 0 ? "OUT OF STOCK" : left + " left"` is the conditional expression from before the program. It is a compact form of the four-line `if`/`else` you already know, and is worth using only when it fits comfortably on one line.
