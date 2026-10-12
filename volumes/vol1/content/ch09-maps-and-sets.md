<!-- part: Part II: Structuring Data -->
# Chapter 9: Maps and Sets

Chapter 7's gradebook kept names in one array and scores in another, matched by position. That works until something disturbs the order, and then it fails quietly, handing out grades to the wrong students. The problem is that the connection between a name and a score lived nowhere in the program—it was a convention the programmer had to remember.

A **map** stores that connection directly.

```java
void main() {
    Map<String, Integer> scores = new LinkedHashMap<>();
    scores.put("Ada", 88);
    scores.put("Grace", 92);
    scores.put("Alan", 45);

    IO.println(scores.get("Grace"));
    IO.println(scores.size());
}
```

```output
92
3
```

`Map<String, Integer>` is the variable's type: a map whose keys are `String`s and whose values are `Integer`s, the object twin of `int` from Chapter 7 (a map with `char` keys says `Character`, `char`'s twin). `new LinkedHashMap<>()` makes an empty map of one particular kind. Java has several kinds, and a section below shows how they differ and why the variable says only `Map`.

`put(key, value)` stores an entry: a **key**, which you look things up by, and the **value** it leads to. `get(key)` gives back the value stored for that key, and `size()` counts the entries, as it counts a list's items. You look things up by key rather than by position, which is both clearer and—for reasons Chapter 11 makes precise—dramatically faster on large collections.

## Reading, adding, and changing

```java
void main() {
    Map<String, Integer> scores = new LinkedHashMap<>();
    scores.put("Ada", 88);
    scores.put("Grace", 92);

    scores.put("Alan", 45);
    scores.put("Ada", 91);
    IO.println(scores);

    scores.remove("Alan");
    IO.println(scores);
}
```

```output
{Ada=91, Grace=92, Alan=45}
{Ada=91, Grace=92}
```

A map prints its entries between braces, each key with an `=` and its value. `put` with a key the map already has changes its value, and the key keeps its place; `put` with a new key adds an entry. There is no separate "add" operation, which is convenient and occasionally lets a typo create an entry you did not intend. `remove(key)` takes the entry out, key and value together.

Looking up a key the map does not have is not an error:

```java
void main() {
    Map<String, Integer> scores = new LinkedHashMap<>();
    scores.put("Ada", 88);
    IO.println(scores.get("Grace"));
}
```

```output
null
```

`get` gives back `null`, Chapter 5's value for "nothing here," which `IO.readln` gave back when input ended. That is quieter than an error, and not always kinder: `null` is not a number, so storing it in an `int`, as in `int score = scores.get("Grace");`, stops the program with a `NullPointerException`.

There are two ways to avoid that. Ask first, with `containsKey`, or use `getOrDefault`, which gives back a default you supply instead of `null`:

```java
void main() {
    Map<String, Integer> scores = new LinkedHashMap<>();
    scores.put("Ada", 88);

    if (scores.containsKey("Grace")) {
        IO.println(scores.get("Grace"));
    } else {
        IO.println("No score recorded.");
    }

    IO.println(scores.getOrDefault("Grace", 0));
}
```

```output
No score recorded.
0
```

`getOrDefault(key, default)` is the tool that makes counting work, as you will see shortly.

## Looping over a map

Three loops, depending on what you need:

```java
void main() {
    Map<String, Integer> scores = new LinkedHashMap<>();
    scores.put("Ada", 88);
    scores.put("Grace", 92);
    scores.put("Alan", 45);

    for (String name : scores.keySet()) {
        IO.println(name);
    }

    IO.println();

    for (int score : scores.values()) {
        IO.println(score);
    }

    IO.println();

    for (String name : scores.keySet()) {
        IO.println(name + ": " + scores.get(name));
    }
}
```

```output
Ada
Grace
Alan

88
92
45

Ada: 88
Grace: 92
Alan: 45
```

`keySet()` gives you the **keys**, each once, and `values()` the values, each an `Integer` that `int score` takes as an `int`, as Chapter 7's loops did. When you need both, loop over the keys and `get` each one's value—which is what you want most of the time. The map itself is not something the enhanced `for` can walk: always loop over one of these.

A `LinkedHashMap` remembers the order its keys were put in, so these loops always visit the entries in that order. Not every kind of map does, as a section below shows.

There is one more loop, which hands you each key and its value together as one **entry**:

```java
void main() {
    Map<String, Integer> scores = new LinkedHashMap<>();
    scores.put("Ada", 88);
    scores.put("Grace", 92);
    scores.put("Alan", 45);

    for (Map.Entry<String, Integer> entry : scores.entrySet()) {
        IO.println(entry.getKey() + " scored " + entry.getValue());
    }
}
```

```output
Ada scored 88
Grace scored 92
Alan scored 45
```

`entrySet()` gives back the map's entries, and each one is a `Map.Entry<String, Integer>`, with `getKey()` and `getValue()`. The type is a mouthful, so most loops in this course use `keySet()` and `get`; entries come back when it is time to sort them.

Totals and averages are Chapter 7's accumulator loops, walking the values:

```java
void main() {
    Map<String, Integer> scores = new LinkedHashMap<>();
    scores.put("Ada", 88);
    scores.put("Grace", 92);
    scores.put("Alan", 45);

    int total = 0;
    for (int score : scores.values()) {
        total += score;
    }

    IO.println(total);
    IO.println((double) total / scores.size());
}
```

```output
225
75.0
```

To find the highest score *and whose it is*, loop over the keys instead, keeping the best name so far:

```java
void main() {
    Map<String, Integer> scores = new LinkedHashMap<>();
    scores.put("Ada", 88);
    scores.put("Grace", 92);
    scores.put("Alan", 45);

    String top = null;
    for (String name : scores.keySet()) {
        if (top == null || scores.get(name) > scores.get(top)) {
            top = name;
        }
    }

    IO.println(top + " has the highest score: " + scores.get(top));
}
```

```output
Grace has the highest score: 92
```

A map has no `scores[0]` to start from, as Chapter 7's arrays had, so `top` starts as `null`, no name at all, and the first name the loop meets becomes the best so far. After that, a name replaces it only with a higher score. `||` stops at a true left side, as Chapter 5 showed, so `scores.get(top)` is never asked for while `top` is still `null`. And `>` compares the two `Integer`s as numbers: only `==` asks Chapter 7's question of whether they are the same object.

## Three kinds of map

Here are the same five entries in all three kinds of map worth knowing:

```java
void main() {
    Map<String, Integer> linked = new LinkedHashMap<>();
    linked.put("Ada", 88);
    linked.put("Grace", 92);
    linked.put("Alan", 45);
    linked.put("Katherine", 95);
    linked.put("Edsger", 71);

    Map<String, Integer> hashed = new HashMap<>(linked);
    Map<String, Integer> sorted = new TreeMap<>(linked);

    IO.println(linked);
    IO.println(hashed);
    IO.println(sorted);
    IO.println(linked.equals(hashed));
}
```

```output
{Ada=88, Grace=92, Alan=45, Katherine=95, Edsger=71}
{Grace=92, Edsger=71, Ada=88, Alan=45, Katherine=95}
{Ada=88, Alan=45, Edsger=71, Grace=92, Katherine=95}
true
```

`new HashMap<>(linked)` and `new TreeMap<>(linked)` make new maps holding the same entries, as `new ArrayList<>(list)` copied a list in Chapter 7. What differs is the order each one keeps, and that is the main thing to know about them:

- A `LinkedHashMap` keeps the order the keys were first put in.
- A `TreeMap` keeps its keys sorted, text in Chapter 3's character-code order.
- A `HashMap` promises no order at all. It places each key by a number worked out from the key itself, which is how it finds a key so quickly, and the order that comes out looks scrambled. Adding more keys can rearrange it, too.

The last line shows that two maps with the same entries are equal, whatever order each keeps: `.equals` compares maps by their keys and values.

`HashMap` is the kind you will meet most often in other people's programs, where the order does not matter. When the order matters, say so by choosing the kind that promises it. The other maps this chapter prints are `LinkedHashMap`s unless it says otherwise, so they print in the order their entries went in. And this is why a variable's type says only `Map`: it can hold any kind of map, so changing your mind about the kind means changing one word, where the map is made.

## Counting: the killer application

Counting occurrences is the thing maps do best, and the pattern is worth memorizing.

```java
void main() {
    String text = "the quick brown fox jumps over the lazy dog the end";
    Map<String, Integer> counts = new LinkedHashMap<>();

    for (String word : text.split(" ")) {
        counts.put(word, counts.getOrDefault(word, 0) + 1);
    }

    IO.println(counts.get("the"));
    IO.println(counts);
}
```

```output
3
{the=3, quick=1, brown=1, fox=1, jumps=1, over=1, lazy=1, dog=1, end=1}
```

The whole trick is one line: `counts.getOrDefault(word, 0)` gives back the current count, or `0` if this is the first sighting, and adding one and putting it back handles both cases identically. Without `getOrDefault` you would need an `if` to check whether the key exists yet.

To see the most common items, sort by value:

```java
void main() {
    String text = "the quick brown fox jumps over the lazy dog the end";
    Map<String, Integer> counts = new LinkedHashMap<>();
    for (String word : text.split(" ")) {
        counts.put(word, counts.getOrDefault(word, 0) + 1);
    }

    ArrayList<Map.Entry<String, Integer>> ranked = new ArrayList<>(counts.entrySet());
    ranked.sort(Comparator.comparing((Map.Entry<String, Integer> e) -> e.getValue())
            .reversed());

    for (Map.Entry<String, Integer> entry : ranked.subList(0, 3)) {
        IO.println(String.format("%-8s%d", entry.getKey(), entry.getValue()));
    }
}
```

```output
the     3
quick   1
brown   1
```

A map's entries cannot be rearranged where they are, so `new ArrayList<>(counts.entrySet())` copies them into a list, which can. A list's own `sort` method then puts it in order by a rule you hand it, called a **comparator**. `Comparator.comparing` makes a comparator from what to compare, and `.reversed()` turns it around, largest first.

What to compare is the part in the middle: `(Map.Entry<String, Integer> e) -> e.getValue()`. That is a **lambda**, a small method with no name, written right where it is used: before the arrow, its parameter, an entry called `e`; after the arrow, what it gives back, that entry's value. So the whole line reads "sort the entries by their values, largest first." Entries with the same value keep the order they already had, which is why `quick` and `brown` come next: of the words seen once, they came first.

The parameter's type is written out because `.reversed()` needs it. Sorting smallest first, with no `.reversed()`, Java can work the type out from the list, and `ranked.sort(Comparator.comparing(e -> e.getValue()))` is enough; with `.reversed()` after it, Java cannot, and the shorter form does not compile. `subList(0, 3)` is Chapter 7's window onto the first three.

This is also the answer to Chapter 7's playlist, which had to order its titles by their lengths by hand: with each title and its length in one map, sorting the entries by value does it in one line. You do not need to write lambdas to work through this course, but they appear constantly in real Java, and sorting is by far their most common use. This course uses them for nothing else.

## Maps inside maps

A value can itself be a map, which is how you store several facts about each key:

```java
void main() {
    Map<String, String> ada = new LinkedHashMap<>();
    ada.put("score", "88");
    ada.put("grade", "B");
    ada.put("absences", "2");

    Map<String, String> grace = new LinkedHashMap<>();
    grace.put("score", "92");
    grace.put("grade", "A");
    grace.put("absences", "0");

    Map<String, Map<String, String>> students = new LinkedHashMap<>();
    students.put("Ada", ada);
    students.put("Grace", grace);

    IO.println(students.get("Ada").get("score"));
    IO.println(students.get("Grace").get("absences"));

    for (String name : students.keySet()) {
        Map<String, String> info = students.get(name);
        IO.println(name + ": " + info.get("score") + " (" + info.get("grade") + ")");
    }
}
```

```output
88
0
Ada: 88 (B)
Grace: 92 (A)
```

Read the type `Map<String, Map<String, String>>` from the outside in: a map from a name to a map of facts. A chain of `get`s reads the same way: `students.get("Ada")` gives back Ada's map, and `.get("score")` looks up the score in it.

Every value in a map has the map's one value type, so every fact here is a `String`, the score and the absences included, and adding the scores up would mean `Integer.parseInt` first. That clumsiness is a sign that a better tool exists. Chapter 10's records hold several facts together, each with its own name and its own type, and they replace maps like these.

## Sets

A **set** is a collection with no duplicates. It answers one question extremely well: is this thing in here?

```java
void main() {
    Set<String> vowels = Set.of("a", "e", "i", "o", "u");

    IO.println(vowels.contains("e"));
    IO.println(vowels.size());

    Set<String> guests = new HashSet<>();
    guests.add("Ada");
    guests.add("Grace");
    guests.add("Ada");
    IO.println(guests.size());

    ArrayList<Integer> numbers = new ArrayList<>(List.of(1, 2, 2, 3, 3, 3, 4));
    Set<Integer> unique = new TreeSet<>(numbers);
    IO.println(unique);
    IO.println(unique.size());
}
```

```output
true
5
2
[1, 2, 3, 4]
4
```

`Set<String>` is a set of `String`s, and sets come in the same three kinds as maps, with the same three promises: a `HashSet` promises no order, a `LinkedHashSet` keeps the order its items were added, and a `TreeSet` keeps them sorted. `Set.of` makes a set of its arguments that can never change, as `List.of` makes a list. An empty set is made like an empty list, `new HashSet<>()`, and `add` puts an item in; adding one that is already there changes nothing, which is why `guests` holds two names. `contains` and `size()` work as they do on a list.

Passing a list to a new set, as in `new TreeSet<>(numbers)`, removes the duplicates in one step, which is by far its most common use. A `TreeSet` then keeps the numbers sorted, and a set prints in square brackets, like a list.

`Map.of` does for a map what `Set.of` does for a set, taking its arguments in pairs, each key and then its value. Neither one promises any order, and the JDK means it: it picks a new order each time a program starts, so this box may print its items in another order when you run it.

```java
void main() {
    Set<String> band = Set.of("Ada", "Grace", "Alan", "Katherine");
    Map<String, Integer> scores = Map.of("Ada", 88, "Grace", 92, "Alan", 45);

    IO.println(band);
    IO.println(scores);
}
```

```output
[Ada, Katherine, Alan, Grace]
{Ada=88, Alan=45, Grace=92}
```

That makes them right for a fixed collection you only look things up in, like the vowels above, and wrong for anything you print in order. Neither can change, either: `add` or `put` on one stops the program with an `UnsupportedOperationException`.

Sets support the operations from mathematics, each a method that changes the set it is called on:

```java
void main() {
    Set<String> band = new LinkedHashSet<>(List.of("Ada", "Grace", "Alan"));
    Set<String> chorus = new LinkedHashSet<>(List.of("Grace", "Alan", "Katherine"));

    Set<String> everyone = new LinkedHashSet<>(band);
    everyone.addAll(chorus);
    IO.println(everyone);

    Set<String> both = new LinkedHashSet<>(band);
    both.retainAll(chorus);
    IO.println(both);

    Set<String> bandOnly = new LinkedHashSet<>(band);
    bandOnly.removeAll(chorus);
    IO.println(bandOnly);
}
```

```output
[Ada, Grace, Alan, Katherine]
[Grace, Alan]
[Ada]
```

Union (`addAll`) is everyone in either; intersection (`retainAll`) keeps those in both; difference (`removeAll`) leaves those in the first but not the second. Because each one changes its set, each starts from a copy of `band`, made by passing it to a new `LinkedHashSet` as Chapter 7 copied a list; without the copies, `band` itself would change. They are `LinkedHashSet`s, so they print in the order the names were added.

## Choosing a container

This is the practical payoff of Part II.

| Use | When |
| --- | --- |
| **List** | Order matters, duplicates are fine, you look things up by position |
| **Map** | You look things up by a name or ID |
| **Set** | You care only about membership and uniqueness |

Ask yourself: *how will I look this up later?* By position: a list. By name: a map. Only "is it there?": a set. For a map or a set, ask one more question: what order do I need? The order things arrived in: a `LinkedHashMap` or `LinkedHashSet`. Sorted: a `TreeMap` or `TreeSet`. No order at all: a `HashMap` or `HashSet`. Choosing well makes the rest of the program shorter; choosing badly means writing loops to compensate for the wrong structure, which is most of what a struggling program is doing.

## Common mistakes

| Mistake | What happens |
| --- | --- |
| `scores.get("Bob")` when Bob is absent | `null`, not an error—use `getOrDefault` or `containsKey` |
| `int score = scores.get("Bob");` when Bob is absent | An exception: `null` is not a number |
| `Map<String, int>` | `unexpected type`—write `Map<String, Integer>` |
| `add` or `put` on a `Set.of` or `Map.of` | An exception: neither can change, so copy it into a new set or map first |
| Expecting a `HashMap` or `HashSet` to keep an order | It promises none; the linked and tree kinds do |
| `put` with a key the map already has | The old value is replaced, with no warning |
| `for (String name : scores)` | Does not compile—loop over `scores.keySet()` |
| A lambda with no type before `.reversed()` | Does not compile—write its type, `(Map.Entry<String, Integer> e)` |

The table's first exception is a `NullPointerException`, and its second an `UnsupportedOperationException`.

## Try It

Exercise 4 names its method exactly, as Chapter 6's did, and Check calls it with the cases listed under "What it should do." Those cases write each map in place with `Map.of`, each key and then its value: `Map.of("one", "uno")` is a map from `"one"` to `"uno"`. Check compares two maps by their keys and values, so the order each one keeps makes no difference to it.

**1.** Build a map of five countries and their capitals—France and Paris, Japan and Tokyo, Egypt and Cairo, Brazil and Brasilia, Canada and Ottawa—then ask for a country and print its capital, or `I don't have that country.` when the map has none for it.

```java
// Looks up the capital of a country the user types.

void main() {
    Map<String, String> capitals = new LinkedHashMap<>();
    capitals.put("France", "Paris");
    capitals.put("Japan", "Tokyo");
    capitals.put("Egypt", "Cairo");
    capitals.put("Brazil", "Brasilia");
    capitals.put("Canada", "Ottawa");

    String country = IO.readln("Enter a country: ").strip();

    if (capitals.containsKey(country)) {
        IO.println("The capital of " + country + " is "
                + capitals.get(country) + ".");
    } else {
        IO.println("I don't have that country.");
    }
}
```

**2.** Ask for a word and print how many times each letter appears in it, one letter to a line, as `b: 1`, in the order the letters first appear in the word.

```java
// Counts the letters of a word, in the order they first appear.

void main() {
    String word = IO.readln("Enter a word: ").strip();

    Map<Character, Integer> counts = new LinkedHashMap<>();
    for (int i = 0; i < word.length(); i++) {
        char letter = word.charAt(i);
        counts.put(letter, counts.getOrDefault(letter, 0) + 1);
    }

    for (char letter : counts.keySet()) {
        IO.println(letter + ": " + counts.get(letter));
    }
}
```

**3.** Given the lists `Ada, Grace, Alan, Katherine` and `Grace, Alan, Margaret`, print the names in both lists, then the names only in the first, then everyone, each group in the order the names first appear.

```java
// Compares two lists of names with sets.

void main() {
    ArrayList<String> first = new ArrayList<>(List.of("Ada", "Grace", "Alan", "Katherine"));
    ArrayList<String> second = new ArrayList<>(List.of("Grace", "Alan", "Margaret"));

    Set<String> both = new LinkedHashSet<>(first);
    both.retainAll(second);

    Set<String> firstOnly = new LinkedHashSet<>(first);
    firstOnly.removeAll(second);

    Set<String> everyone = new LinkedHashSet<>(first);
    everyone.addAll(second);

    IO.println("In both lists: " + both);
    IO.println("Only in the first list: " + firstOnly);
    IO.println("Everyone: " + everyone);
}
```

**4.** Write `Map<String, String> invert(Map<String, String> map)`, returning a new map with the keys and values swapped, so that each value leads back to its key.

```java
Map<String, String> invert(Map<String, String> map) {
    Map<String, String> inverted = new LinkedHashMap<>();
    for (String key : map.keySet()) {
        inverted.put(map.get(key), key);
    }
    return inverted;
}

void main() {
    Map<String, String> spanish = new LinkedHashMap<>();
    spanish.put("one", "uno");
    spanish.put("two", "dos");
    IO.println(invert(spanish));
}
```

**5.** Store three students, each with a grade level and a favorite subject—Ada, grade 9, Math; Grace, grade 10, Science; Alan, grade 9, History—then print a roster: a line for each student, in that order, with the name, grade level and favorite subject.

```java
// A roster of students, each with a grade level and a favorite subject.

void main() {
    Map<String, String> ada = new LinkedHashMap<>();
    ada.put("grade", "9");
    ada.put("subject", "Math");

    Map<String, String> grace = new LinkedHashMap<>();
    grace.put("grade", "10");
    grace.put("subject", "Science");

    Map<String, String> alan = new LinkedHashMap<>();
    alan.put("grade", "9");
    alan.put("subject", "History");

    Map<String, Map<String, String>> students = new LinkedHashMap<>();
    students.put("Ada", ada);
    students.put("Grace", grace);
    students.put("Alan", alan);

    IO.println(String.format("%-10s%-8s%s", "Name", "Grade", "Favorite Subject"));
    for (String name : students.keySet()) {
        Map<String, String> info = students.get(name);
        IO.println(String.format("%-10s%-8s%s",
                name, info.get("grade"), info.get("subject")));
    }
}
```

**6.** Given the words `cat, dog, cat, bird, dog, cat, fish`, print the words that appear more than once, each just once and on its own line, in the order the words first appear.

```java
// Prints the words that appear more than once.

void main() {
    String[] words = {"cat", "dog", "cat", "bird", "dog", "cat", "fish"};

    Map<String, Integer> counts = new LinkedHashMap<>();
    for (String word : words) {
        counts.put(word, counts.getOrDefault(word, 0) + 1);
    }

    for (String word : counts.keySet()) {
        if (counts.get(word) > 1) {
            IO.println(word);
        }
    }
}
```

**7.** Ask for a sentence and print its most common character, not counting spaces, with how many times it appears.

```java
// Finds the most common character in a sentence, ignoring spaces.

void main() {
    String sentence = IO.readln("Enter a sentence: ");

    Map<Character, Integer> counts = new LinkedHashMap<>();
    for (int i = 0; i < sentence.length(); i++) {
        char c = sentence.charAt(i);
        if (c != ' ') {
            counts.put(c, counts.getOrDefault(c, 0) + 1);
        }
    }

    char mostCommon = ' ';
    int most = 0;
    for (char c : counts.keySet()) {
        if (counts.get(c) > most) {
            mostCommon = c;
            most = counts.get(c);
        }
    }

    IO.println("The most common character is '" + mostCommon
            + "', appearing " + most + " times.");
}
```

## Chapter project: a poll counter

Build a program that tallies votes, reports the results with a bar chart, and handles ties correctly.

```java
// Tallies votes and displays the results as a text bar chart.

/// Returns a map from each option to its number of votes, in the order
/// the options first appear.
Map<String, Integer> tally(ArrayList<String> votes) {
    Map<String, Integer> counts = new LinkedHashMap<>();
    for (String vote : votes) {
        counts.put(vote, counts.getOrDefault(vote, 0) + 1);
    }
    return counts;
}

/// Returns every option tied for the most votes.
ArrayList<String> winners(Map<String, Integer> counts) {
    int best = 0;
    for (int count : counts.values()) {
        if (count > best) {
            best = count;
        }
    }

    ArrayList<String> leaders = new ArrayList<>();
    for (String option : counts.keySet()) {
        int count = counts.get(option);
        if (count == best) {
            leaders.add(option);
        }
    }
    return leaders;
}

/// Prints each option with its count, percentage, and a bar, most votes first.
void report(Map<String, Integer> counts, int total) {
    ArrayList<Map.Entry<String, Integer>> ranked = new ArrayList<>(counts.entrySet());
    ranked.sort(Comparator.comparing((Map.Entry<String, Integer> e) -> e.getValue())
            .reversed());

    IO.println(String.format("%-12s%6s%8s  Chart", "Option", "Votes", "Share"));
    IO.println("-".repeat(38));
    for (Map.Entry<String, Integer> entry : ranked) {
        int count = entry.getValue();
        double share = (double) count / total * 100;
        String bar = "#".repeat((int) Math.round(share / 4));
        String row = String.format("%-12s%6d%7.1f", entry.getKey(), count, share);
        IO.println(row + "%  " + bar);
    }
    IO.println("-".repeat(38));
}

void main() {
    ArrayList<String> votes = new ArrayList<>(List.of(
            "pizza", "tacos", "pizza", "sushi", "pizza",
            "tacos", "salad", "sushi", "pizza", "tacos",
            "sushi", "pizza", "tacos", "pizza", "sushi"));

    Map<String, Integer> counts = tally(votes);
    report(counts, votes.size());

    IO.println("Total votes:  " + votes.size());
    IO.println("Options used: " + new HashSet<>(votes).size());

    ArrayList<String> leaders = winners(counts);
    if (leaders.size() == 1) {
        IO.println("Winner:       " + leaders.get(0));
    } else {
        Collections.sort(leaders);
        IO.println("Tied:         " + String.join(", ", leaders));
    }
}
```

```output
Option       Votes   Share  Chart
--------------------------------------
pizza            6   40.0%  ##########
tacos            4   26.7%  #######
sushi            4   26.7%  #######
salad            1    6.7%  ##
--------------------------------------
Total votes:  15
Options used: 4
Winner:       pizza
```

Four points.

`winners` returns a **list**, not a single option, because ties are possible and a program that assumes otherwise reports a false result the first time two options match. Deciding what to do about ties is a design question, and the honest answer is usually to report them rather than to pick arbitrarily. (Its `best` can start from 0, unlike a largest-so-far over any numbers at all, because every option in the map has at least one vote.)

`new HashSet<>(votes).size()` counts the distinct options in one expression. That is the set doing exactly the job it is for.

The bar chart divides the percentage by 4 so that 100% is 25 characters wide. Scaling a chart to fit the space available is a small thing that makes text output far more readable, and `Math.round` keeps the bars to whole characters. It gives back a `long`, so the `(int)` cast turns it into the `int` that `repeat` takes.

`tally` builds a `LinkedHashMap`, so the options stay in the order they first got a vote, and the sort keeps that order for a tie: tacos, the first to be voted for, is listed before sushi. With a `HashMap`, which promises no order, the tie could come out either way.

Try changing the vote list so that two options tie for first, and confirm the program says so.
