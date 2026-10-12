# Practice: a log line parser

A server writes a line every time something happens, and by Friday there are forty thousand of them. Each line looks like this:

```text
WARN|14:03|Disk usage at 91 percent
```

Three fields separated by `|`: the level, the time, and the message. The message is never empty and never contains a `|`. You are going to write the methods that pull a line apart, and then one that finds the lines worth reading.

Everything here uses Chapters 1 to 8: arrays, `ArrayList`, loops, and now `split`, `String.join`, `toUpperCase`, `strip`, `replace` and `Character.isLetter`.

Real logs are untidy. Some lines come in with the level in lowercase and stray spaces around the message, so a couple of these steps have to cope with that rather than assume it away.

Each step names the method exactly: its return type, its name and its parameters. Check calls it with the cases under "What it should do," and step 8's cases write each list of lines in place, as `new ArrayList<>(List.of(...))`.

## Steps

**Step 1.** Write `String levelOf(String line)`, returning the level, so `WARN` from the line above. Split on the separator rather than counting characters, remembering that `|` is special in a pattern.

```java
String levelOf(String line) {
    return line.split("\\|")[0];
}

void main() {
    IO.println(levelOf("WARN|14:03|Disk usage at 91 percent"));
}
```

**Step 2.** Write `String timeOf(String line)`, returning the time field.

```java
String timeOf(String line) {
    return line.split("\\|")[1];
}

void main() {
    IO.println(timeOf("WARN|14:03|Disk usage at 91 percent"));
}
```

**Step 3.** Write `String messageOf(String line)`, returning the message field.

```java
String messageOf(String line) {
    return line.split("\\|")[2];
}

void main() {
    IO.println(messageOf("WARN|14:03|Disk usage at 91 percent"));
}
```

**Step 4.** Write `boolean isWarning(String line)`, returning `true` for a warning and `false` otherwise. It must say `true` for `warn` in lowercase too, because half the services write it that way.

```java
boolean isWarning(String line) {
    String level = line.split("\\|")[0];
    return level.toUpperCase().equals("WARN");
}

void main() {
    IO.println(isWarning("WARN|14:03|Disk usage at 91 percent"));
    IO.println(isWarning("warn|08:00|  Fan speed low  "));
    IO.println(isWarning("INFO|09:15|Backup finished"));
}
```

**Step 5.** Write `String tidy(String line)`, returning the line rebuilt with the level in uppercase and the message stripped of leading and trailing spaces, still separated by `|`. Use `String.join` to put it back together.

```java
String tidy(String line) {
    String[] fields = line.split("\\|");
    fields[0] = fields[0].toUpperCase();
    fields[2] = fields[2].strip();
    return String.join("|", fields);
}

void main() {
    IO.println(tidy("warn|08:00|  Fan speed low  "));
}
```

**Step 6.** Write `ArrayList<String> wordsIn(String message)`, returning a list of the message's words that are made only of letters, so `Disk usage at 91 percent` loses the `91`. The message may have stray spaces, like the untidy line's.

```java
ArrayList<String> wordsIn(String message) {
    ArrayList<String> words = new ArrayList<>();
    for (String word : message.strip().split("\\s+")) {
        boolean allLetters = true;
        for (int i = 0; i < word.length(); i++) {
            if (!Character.isLetter(word.charAt(i))) {
                allLetters = false;
            }
        }
        if (allLetters) {
            words.add(word);
        }
    }
    return words;
}

void main() {
    IO.println(wordsIn("Disk usage at 91 percent"));
}
```

**Step 7.** Write `String redact(String line, String word)`, returning the line with every appearance of that word replaced by `****`.

```java
String redact(String line, String word) {
    return line.replace(word, "****");
}

void main() {
    IO.println(redact("WARN|14:03|Disk usage at 91 percent", "91"));
}
```

**Step 8.** Write `ArrayList<String> warningMessages(ArrayList<String> lines)`, returning just the messages of the warnings, each stripped of the spaces around it—not the whole lines, and not the other levels.

```java
ArrayList<String> warningMessages(ArrayList<String> lines) {
    ArrayList<String> messages = new ArrayList<>();
    for (String line : lines) {
        String[] fields = line.split("\\|");
        if (fields[0].toUpperCase().equals("WARN")) {
            messages.add(fields[2].strip());
        }
    }
    return messages;
}

void main() {
    ArrayList<String> lines = new ArrayList<>();
    lines.add("WARN|14:03|Disk usage at 91 percent");
    lines.add("INFO|09:15|Backup finished");
    lines.add("warn|08:00|  Fan speed low  ");
    IO.println(warningMessages(lines));
}
```
