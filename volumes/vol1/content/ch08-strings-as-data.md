<!-- part: Part II: Structuring Data -->
# Chapter 8: Strings as Data

You have used strings since Chapter 1 as labels and messages. This chapter treats them as data to be examined, taken apart and rebuilt—which is what most real programs do with text.

A string is a **sequence of characters**, and much of what Chapter 7 did with arrays works on text too, through a `String`'s own methods.

```java
void main() {
    String word = "Java";

    IO.println(word.length());
    IO.println(word.charAt(0));
    IO.println(word.charAt(word.length() - 1));
    IO.println(word.substring(0, 3));
    IO.println(word.substring(1));

    String reversed = "";
    for (int i = word.length() - 1; i >= 0; i--) {
        reversed += word.charAt(i);
    }
    IO.println(reversed);
}
```

```output
4
J
a
Jav
ava
avaJ
```

Positions count from zero, as an array's indexes do, and there are no negative positions: the last character is at `length() - 1`. `substring(from, to)` is a string's slice: the characters from position `from` up to, but not including, position `to`, given back as a new `String`, exactly as `Arrays.copyOfRange` slices an array. With only one number, `substring(1)`, the slice runs to the end. A position past the end stops the program with a `StringIndexOutOfBoundsException`, as it did for Chapter 5's `charAt`.

A `String` has no method that reverses it, so the loop does the job: it walks the positions backward, from the last to 0, and adds each character to the end of a new string. `+=` joins a `char` onto a `String` just as it joins text.

## Strings are immutable

Here is the one large difference from arrays: **a string cannot be changed after it is created.** An array is mutable, in Chapter 7's word; a `String` is **immutable**. Java will not even accept a line that tries to change one character:

```java
void main() {
    String word = "Lava";
    word.charAt(0) = 'J';
}
```

Press Run, and javac refuses:

```text
Main.java:3: error: unexpected type
    word.charAt(0) = 'J';
               ^
  required: variable
  found:    value
1 error
```

`charAt` gives back a value, a copy of the character, and only a variable can be assigned to: `required: variable`, `found: value`.

This is not a limitation so much as a design decision, and it has a practical consequence: every `String` method that seems to change text *gives back a new string* and leaves the original as it was.

```java
void main() {
    String word = "java";
    word.toUpperCase();
    IO.println(word);

    word = word.toUpperCase();
    IO.println(word);
}
```

```output
java
JAVA
```

The first `word.toUpperCase()` worked out `"JAVA"` and threw it away, because nothing stored the result. This is the single most common string mistake, and the fix is always the same: **store the result.**

## Essential string methods

| Method | Gives back |
| --- | --- |
| `toUpperCase()` | All uppercase |
| `toLowerCase()` | All lowercase |
| `strip()` | Spaces, tabs and line breaks removed from both ends |
| `replace(a, b)` | Every `a` replaced with `b` |
| `split(",")` | An array of the pieces between the commas |
| `indexOf(x)` | Position of the first `x`, or -1 |
| `contains(x)` | `true` if `x` appears in it |
| `startsWith(x)` | `true` if it begins with `x` |
| `endsWith(x)` | `true` if it ends with `x` |

Here they are at work:

```java
void main() {
    IO.println("abc".toUpperCase());
    IO.println("ABC".toLowerCase());
    IO.println("[" + "  hi  ".strip() + "]");
    IO.println("banana".replace("a", "o"));
    IO.println("banana".indexOf("n"));
    IO.println("banana".indexOf("z"));
    IO.println("hello".startsWith("he"));
    IO.println("Main.java".endsWith(".java"));
}
```

```output
ABC
abc
[hi]
bonono
2
-1
true
true
```

Some jobs have no ready-made method. Nothing counts how many times a letter appears, and nothing capitalizes the first letter of each word: exercises 2 and 4 of Try It build those from loops. Whether a whole piece of text is a number is still Chapter 4's job, `Integer.parseInt` inside a `try`. And whether one character is a letter or a digit is a question for that character alone, which this chapter comes to when it walks text character by character.

Methods chain left to right, each working on the result of the last:

```java
void main() {
    String messy = "   Ada LOVELACE  ";
    String clean = messy.strip().toLowerCase();
    IO.println("[" + clean + "]");
}
```

```output
[ada lovelace]
```

`strip()` gives back a new string, and `toLowerCase()` is called on that one. That combination—strip the whitespace, normalize the case—is what you want on almost any input a human typed.

## Comparing text safely

String comparison is case-sensitive and whitespace-sensitive, so raw user input rarely compares the way you want:

```java
void main() {
    String answer = " Yes ";

    IO.println(answer.equals("yes"));
    IO.println(answer.strip().toLowerCase().equals("yes"));
}
```

```output
false
true
```

Normalize before comparing. Every time.

And compare with `.equals`, as Chapter 3 taught. Here `strip()` and `toLowerCase()` each gave back a new `String` object, and `==` asks Chapter 7's question, whether two variables hold the same object, so it can say `false` when every letter matches.

`contains` tests whether one string appears inside another:

```java
void main() {
    String sentence = "The quick brown fox";

    IO.println(sentence.contains("quick"));
    IO.println(sentence.contains("slow"));
    IO.println(sentence.contains("the"));
    IO.println(sentence.toLowerCase().contains("the"));
}
```

```output
true
false
false
true
```

`contains` is case-sensitive too, so the `The` at the start is not a `the` until the sentence is lowercased.

## `split` and `String.join`

These two are opposites, and between them they handle most text processing.

`split` cuts a string into an array of strings, at every place its argument appears:

```java
void main() {
    String sentence = "the quick brown fox";
    IO.println(Arrays.toString(sentence.split(" ")));

    String date = "2026-09-17";
    IO.println(Arrays.toString(date.split("-")));

    String row = "Ada,88,A";
    String[] fields = row.split(",");
    String name = fields[0];
    String score = fields[1];
    String grade = fields[2];
    IO.println(name + " scored " + score + " for a " + grade);
}
```

```output
[the, quick, brown, fox]
[2026, 09, 17]
Ada scored 88 for a A
```

That last pattern—split a comma-separated line, then give each piece a name—is how nearly every program reads data files. Every piece is a `String`, the score included: to do arithmetic with it, convert it with Chapter 2's `Integer.parseInt`.

Text a person typed is rarely so tidy. Splitting at every single space gives an empty piece wherever two spaces meet, or the text starts with one:

```java
void main() {
    String typed = " the quick  brown fox";

    IO.println(Arrays.toString(typed.split(" ")));
    IO.println(Arrays.toString(typed.strip().split("\\s+")));
}
```

```output
[, the, quick, , brown, fox]
[the, quick, brown, fox]
```

The second line is the fix. `split`'s argument is a **pattern**, a short description of what to split at. Most characters in a pattern stand for themselves, which is why `","` and `"-"` meant what they said. A few have special meanings: `\s` stands for any space, tab or line break, and `+` after something means "one or more of it in a row," so the pattern `\s+` matches every run of spaces, however long. Written in a Java string, its backslash is doubled, `"\\s+"`, for a reason the section on escape sequences explains. `strip()` goes first because a space at the very start would still leave an empty first piece. `strip().split("\\s+")` is the way to cut typed text into words.

Two more things about `split` are worth knowing before they surprise you. Empty pieces at the very end are dropped, so `"a,b,,".split(",")` gives two pieces, not four. And splitting an empty string gives back one piece, the empty string itself, so a program that counts words checks `isEmpty()` first.

`.` and `|` are special in a pattern as well, and splitting at either one goes wrong quietly: `.` stands for any character at all, and `split("|")` cuts the text apart at every character. Put `\\` in front of either to make it an ordinary character:

```java
void main() {
    String version = "25.0.4";
    IO.println(Arrays.toString(version.split(".")));
    IO.println(Arrays.toString(version.split("\\.")));

    String entry = "Ada|88";
    IO.println(Arrays.toString(entry.split("\\|")));
}
```

```output
[]
[25, 0, 4]
[Ada, 88]
```

`split(".")` found a separator at every character, so every piece was empty, and the empty pieces at the end were dropped: all of them.

`String.join` does the reverse, gluing strings together with a separator between each one. It is called on `String` itself, as `Arrays.toString` is called on `Arrays`, and takes the separator first, then the pieces: an array of `String`s, or an `ArrayList<String>`.

```java
void main() {
    String[] words = {"the", "quick", "brown", "fox"};

    IO.println(String.join(" ", words));
    IO.println(String.join("-", words));
    IO.println(String.join(", ", words));

    ArrayList<String> names = new ArrayList<>(List.of("Ada", "Grace", "Alan"));
    IO.println(String.join(" and ", names));
}
```

```output
the quick brown fox
the-quick-brown-fox
the, quick, brown, fox
Ada and Grace and Alan
```

`String.join` takes only text. Given an `int[]`, it does not compile, so numbers are joined with a loop, Chapter 5's accumulator:

```java
void main() {
    int[] scores = {88, 92, 79};

    String joined = "";
    for (int i = 0; i < scores.length; i++) {
        if (i > 0) {
            joined += ", ";
        }
        joined += scores[i];
    }
    IO.println(joined);
}
```

```output
88, 92, 79
```

The separator goes in front of every number but the first, so none is left dangling at the end.

## Processing character by character

Chapter 5's counting loop with `charAt` hands you one character at a time, which is how you examine text in detail:

```java
/// Returns the number of vowels in a piece of text.
int countVowels(String text) {
    String lower = text.toLowerCase();
    int count = 0;
    for (int i = 0; i < lower.length(); i++) {
        char letter = lower.charAt(i);
        if ("aeiou".indexOf(letter) >= 0) {
            count++;
        }
    }
    return count;
}

void main() {
    IO.println(countVowels("Programming in Java"));
}
```

```output
6
```

Note `"aeiou".indexOf(letter) >= 0`. `indexOf` takes a `char` as well as a `String`, and asks where it appears in `"aeiou"`: any position at all, 0 or more, means the letter is a vowel, and -1 means it is not. That one test does the work of five comparisons joined with `||`, `letter == 'a' || letter == 'e'` and so on, which makes checking against a set of characters very compact.

Building a new string works by accumulation, as Chapter 7 built lists, with `+=` doing the adding:

```java
/// Returns the text with all vowels removed.
String removeVowels(String text) {
    String result = "";
    for (int i = 0; i < text.length(); i++) {
        char letter = text.charAt(i);
        if ("aeiouAEIOU".indexOf(letter) == -1) {
            result += letter;
        }
    }
    return result;
}

void main() {
    IO.println(removeVowels("Programming in Java"));
}
```

```output
Prgrmmng n Jv
```

Each `+=` makes a new string one character longer, which is fine for text of this size. Programs that build very long text use a tool called `StringBuilder` instead, which Appendix C names.

Three questions about one character have ready-made answers, from `Character`, the object twin of `char` that Chapter 7 named: `Character.isLetter(c)`, `Character.isDigit(c)` and `Character.isLetterOrDigit(c)`, each `true` or `false`.

```java
void main() {
    String address = "Room 101, floor 3";
    int letters = 0;
    int digits = 0;
    int others = 0;

    for (int i = 0; i < address.length(); i++) {
        char c = address.charAt(i);
        if (Character.isLetter(c)) {
            letters++;
        } else if (Character.isDigit(c)) {
            digits++;
        } else {
            others++;
        }
    }

    IO.println(letters + " letters, " + digits + " digits, " + others + " others");
}
```

```output
9 letters, 4 digits, 4 others
```

The spaces and the comma are neither letters nor digits, so they land in `others`.

## Characters are numbers

Every `char` is stored as a number, its character code, and Chapter 3's character-code order is simply the order of those numbers: `'a'` is 97, `'b'` is 98, and so on to `'z'`, 122, with the capitals earlier, from `'A'`, 65, to `'Z'`, 90. Arithmetic on a `char` works on its number, and gives back an `int`:

```java
void main() {
    char letter = 'x';

    IO.println(letter + 1);
    IO.println((char) (letter + 1));
    IO.println(letter - 'a');
    IO.println((char) ('a' + 2));
    IO.println(letter >= 'a' && letter <= 'z');
}
```

```output
121
y
23
c
true
```

`letter + 1` is the `int` 121, one more than the code of `'x'`, and `IO.println` prints it as a number. The cast `(char)`, like Chapter 2's `(int)`, turns a number back into the character it is the code of: `y`. `letter - 'a'` is how far a letter is from `a`, which is its position in the alphabet counting from 0: 0 for `a`, 23 for `x`. And since `char`s compare as numbers, `letter >= 'a' && letter <= 'z'` asks whether a character is a lowercase letter.

The parentheses around `letter + 1` matter. A cast applies to the value right after it, so `(char) letter + 1` casts first, adds after, and gives the `int` 121 again.

## A worked example: palindromes

A palindrome reads the same forward and backward, ignoring case, spaces and punctuation. Checking for one combines most of this chapter.

```java
/// Returns only the letters and digits of a text, in lowercase.
String cleanText(String text) {
    String lower = text.toLowerCase();
    String result = "";
    for (int i = 0; i < lower.length(); i++) {
        char c = lower.charAt(i);
        if (Character.isLetterOrDigit(c)) {
            result += c;
        }
    }
    return result;
}

/// Returns the text backward.
String reverse(String text) {
    String reversed = "";
    for (int i = text.length() - 1; i >= 0; i--) {
        reversed += text.charAt(i);
    }
    return reversed;
}

/// Returns true if the text reads the same forward and backward.
boolean isPalindrome(String text) {
    String cleaned = cleanText(text);
    return cleaned.equals(reverse(cleaned));
}

void main() {
    String[] tests = {
        "racecar",
        "A man, a plan, a canal: Panama",
        "Was it a car or a cat I saw?",
        "hello world"
    };

    for (String test : tests) {
        IO.println(isPalindrome(test) + "  " + test);
    }
}
```

```output
true  racecar
true  A man, a plan, a canal: Panama
true  Was it a car or a cat I saw?
false  hello world
```

The structure is worth studying. `cleanText` does one job—strip the text down to comparable characters—`reverse` does one job, and `isPalindrome` does one job, given clean text. Splitting the work that way makes the actual test a single readable line, and it compares with `.equals`, because the two sides are different `String` objects. `Character.isLetterOrDigit` is `true` for letters and digits, which is exactly the filter needed.

## Escape sequences

Some characters cannot be typed directly inside a string, so they are written with a backslash. These pairs are called **escape sequences**:

| Sequence | Means |
| --- | --- |
| `\n` | New line |
| `\t` | Tab |
| `\"` | A double quote |
| `\'` | A single quote |
| `\\` | A backslash |

```java
void main() {
    IO.println("Name:\tAda\nRole:\tMathematician");
    IO.println("She said, \"Hello.\"");
}
```

```output
Name:	Ada
Role:	Mathematician
She said, "Hello."
```

A single quote needs no backslash inside a string, as Chapter 1 found with its apostrophe; `\'` is for a `char`, where `'\''` is the single quote itself. And `\\` is why `split`'s pattern for spaces was written `"\\s+"`: the pattern needs one backslash before the `s`, and in a Java string one backslash is written `\\`.

A **text block**, opened and closed with three double quotes, spans several lines without needing `\n`:

```java
void main() {
    String menu = """
        1. Add a student
        2. View the roster
        3. Quit
        """;
    IO.print(menu);
}
```

```output
1. Add a student
2. View the roster
3. Quit
```

The text starts on the line after the opening `"""`, and Java removes the indentation its lines share, so a text block can be indented along with the code around it. The closing `"""` on a line of its own ends the text with a line break, which is why `IO.print` is enough here: `IO.println` would add a blank line after the menu.

## Common mistakes

| Mistake | What happens |
| --- | --- |
| `word.toUpperCase();` on its own | Nothing changes; store the result |
| `word.charAt(0) = 'J'` | `unexpected type`—build a new string, `"J" + word.substring(1)` |
| `answer.equals("yes")` on raw input | `false` for `"Yes"` or `" yes"`; strip and lowercase first |
| `"a,b".split(", ")` | One piece, not two: the separator must match exactly |
| `String.join(", ", scores)` on an `int[]` | Does not compile: `join` takes text, so use a loop |
| `indexOf(x)` returning 0 read as "not found" | 0 is the first position; not found is -1 |
| `split(".")` to split at dots | No pieces at all: `.` is special in a pattern, so write `split("\\.")` |
| `'a' + 'b'` to join two letters | `195`: two `char`s add as numbers |
| `(char) letter + 1` | An `int`: the cast applies to `letter` alone; write `(char) (letter + 1)` |

## Try It

Exercises 2, 4 and 6 name their methods exactly, as Chapter 6's did, and Check calls each one with the cases listed under "What it should do."

**1.** Ask for a word and print it forward, backward, in uppercase, and its length, each on its own line.

```java
// A word forward, backward, in uppercase, and its length.

void main() {
    String word = IO.readln("Enter a word: ").strip();

    String reversed = "";
    for (int i = word.length() - 1; i >= 0; i--) {
        reversed += word.charAt(i);
    }

    IO.println(word);
    IO.println(reversed);
    IO.println(word.toUpperCase());
    IO.println(word.length());
}
```

**2.** Write `int countLetter(String text, String letter)`, returning how many times the letter (a one-letter `String`) appears in the text, ignoring case.

```java
int countLetter(String text, String letter) {
    String lowerText = text.toLowerCase();
    char target = letter.toLowerCase().charAt(0);
    int count = 0;
    for (int i = 0; i < lowerText.length(); i++) {
        if (lowerText.charAt(i) == target) {
            count++;
        }
    }
    return count;
}

void main() {
    IO.println(countLetter("Hello World", "l"));
}
```

**3.** Ask for a full name and print its initials in capitals, as `AL` for Ada Lovelace. The name may be typed in any case, with extra spaces.

```java
// Prints the initials of a full name.

void main() {
    String fullName = IO.readln("Enter your full name: ");
    String[] words = fullName.strip().split("\\s+");

    String initials = "";
    for (String word : words) {
        initials += word.substring(0, 1).toUpperCase();
    }

    IO.println(initials);
}
```

**4.** Write `String titleCase(String sentence)`, returning the sentence with the first letter of each word in uppercase. Java has no ready-made method for this, so build it. The words are lowercase, with one space between them.

```java
String titleCase(String sentence) {
    ArrayList<String> words = new ArrayList<>();
    for (String word : sentence.split(" ")) {
        words.add(word.substring(0, 1).toUpperCase() + word.substring(1));
    }
    return String.join(" ", words);
}

void main() {
    IO.println(titleCase("the quick brown fox"));
}
```

**5.** Count the words in a sentence the user enters, however many spaces are typed before, between and after them.

```java
// Counts the words in a sentence.

void main() {
    String sentence = IO.readln("Enter a sentence: ").strip();

    if (sentence.isEmpty()) {
        IO.println("Words: 0");
    } else {
        String[] words = sentence.split("\\s+");
        IO.println("Words: " + words.length);
    }
}
```

**6.** Write `String caesarShift(String text, int n)`, returning the text with each lowercase letter shifted `n` places along the alphabet, wrapping around from `z` to `a`, and every other character left as it is. `n` is from 0 to 25.

```java
String caesarShift(String text, int n) {
    String result = "";
    for (int i = 0; i < text.length(); i++) {
        char c = text.charAt(i);
        if (c >= 'a' && c <= 'z') {
            result += (char) ('a' + (c - 'a' + n) % 26);
        } else {
            result += c;
        }
    }
    return result;
}

void main() {
    IO.println(caesarShift("hello world", 3));
}
```

**7.** Given the text `"Ada,88\nGrace,92\nAlan,45"`, print each name with its score on its own line, as `Ada: 88`.

```java
// Prints each name and score from lines of comma-separated text.

void main() {
    String data = "Ada,88\nGrace,92\nAlan,45";
    String[] lines = data.split("\n");

    for (String line : lines) {
        String[] parts = line.split(",");
        IO.println(parts[0] + ": " + parts[1]);
    }
}
```

## Chapter project: a text analyzer

Write a program that reports statistics about a passage of text. Its report lines up its columns with Chapter 7's `String.format` widths.

```java
// Reports statistics about a passage of text.

/// Returns the words of the text, stripped of punctuation and in lowercase.
ArrayList<String> wordList(String text) {
    ArrayList<String> words = new ArrayList<>();
    for (String raw : text.strip().split("\\s+")) {
        String lower = raw.toLowerCase();
        String cleaned = "";
        for (int i = 0; i < lower.length(); i++) {
            char c = lower.charAt(i);
            if (Character.isLetter(c) || c == '\'') {
                cleaned += c;
            }
        }
        if (!cleaned.isEmpty()) {
            words.add(cleaned);
        }
    }
    return words;
}

/// Returns the number of vowels in the text.
int countVowels(String text) {
    String lower = text.toLowerCase();
    int count = 0;
    for (int i = 0; i < lower.length(); i++) {
        if ("aeiou".indexOf(lower.charAt(i)) >= 0) {
            count++;
        }
    }
    return count;
}

/// Returns the longest word in a list, or an empty string if there are none.
String longestWord(ArrayList<String> words) {
    String longest = "";
    for (String word : words) {
        if (word.length() > longest.length()) {
            longest = word;
        }
    }
    return longest;
}

/// Returns the mean length of the words, or 0.0 for an empty list.
double averageWordLength(ArrayList<String> words) {
    if (words.isEmpty()) {
        return 0.0;
    }
    int total = 0;
    for (String word : words) {
        total += word.length();
    }
    return (double) total / words.size();
}

/// Prints a report of statistics about the text.
void analyze(String text) {
    ArrayList<String> words = wordList(text);
    int sentences = 0;
    for (int i = 0; i < text.length(); i++) {
        if (".!?".indexOf(text.charAt(i)) >= 0) {
            sentences++;
        }
    }
    int noSpaces = text.replace(" ", "").length();
    double average = averageWordLength(words);

    IO.println("=".repeat(34));
    IO.println(String.format("%-23s%11d", "Characters:", text.length()));
    IO.println(String.format("%-23s%11d", "Characters (no spaces):", noSpaces));
    IO.println(String.format("%-23s%11d", "Words:", words.size()));
    IO.println(String.format("%-23s%11d", "Sentences:", sentences));
    IO.println(String.format("%-23s%11d", "Vowels:", countVowels(text)));
    IO.println(String.format("%-23s%11s", "Longest word:", longestWord(words)));
    IO.println(String.format("%-23s%11.1f", "Average word length:", average));
    IO.println("=".repeat(34));
}

void main() {
    String sample = "The quick brown fox jumps over the lazy dog. "
            + "Programming is the art of telling another human what one wants "
            + "the computer to do. Is that not remarkable?";

    analyze(sample);
}
```

```output
==================================
Characters:                    151
Characters (no spaces):        124
Words:                          28
Sentences:                       3
Vowels:                         42
Longest word:          programming
Average word length:           4.3
==================================
```

Two notes.

The sample text is written as several strings joined with `+` across lines, which is the usual way to write a long piece of text without an enormous line. A text block would not do here: it keeps its line breaks as part of the text, and every count would change.

The sentence count is a heuristic, not a fact. It counts `.`, `!` and `?`, which means `Dr. Smith` would count as a sentence ending and `...` as three. Real sentence detection is a hard problem. A program that is approximately right is often the correct engineering answer, but you should know which of your numbers are exact and which are estimates—and say so in a comment when it matters.

`longestWord` also quietly picks the *first* longest word when several tie. That is a reasonable choice, and it is a choice; someone reading the output has no way to know a tie occurred.
