# Practice: a lost property register

The station's lost property office keeps a register: what is being held, and how many of each. It is a map, item name to count, and printed it looks like this:

```text
{umbrella=3, phone=1, scarf=2}
```

Things arrive and things get claimed, so the register changes all day. You are going to write the methods behind the counter.

Everything here uses Chapters 1 to 9: maps, `getOrDefault`, `keySet()`, `values()`, `remove`, sets and `retainAll`.

As in Chapter 7, none of these methods should change the register they are handed—they return a new one. An office where looking something up can quietly alter the records is not an office anyone can trust.

An item held zero times is not held. When the last one is claimed, its entry comes out of the register rather than sitting there as a zero.

Each step names the method exactly: its return type, its name and its parameters. Check calls it with the cases under "What it should do," and those cases write each register with `Map.of`, which makes a map that can never change: a method that changes the register it is handed stops there with an `UnsupportedOperationException`. So copy the register first, `new LinkedHashMap<>(register)`, and change the copy. Step 7's cases write each list as `new ArrayList<>(List.of(...))`, as in Chapter 7. A case written `" phone".strip()` is the plain word `"phone"` made while the program runs, so an answer that compares item names with `==` fails it, as in Chapter 7's practice: compare text with `.equals`.

## Steps

**Step 1.** Write `int countOf(Map<String, Integer> register, String item)`, returning how many are held, and `0` for something that was never handed in. `getOrDefault` does this in one line.

```java
int countOf(Map<String, Integer> register, String item) {
    return register.getOrDefault(item, 0);
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    register.put("phone", 1);
    register.put("scarf", 2);
    IO.println(countOf(register, "phone"));
    IO.println(countOf(register, "hat"));
}
```

**Step 2.** Write `int totalItems(Map<String, Integer> register)`, returning how many objects are in the office altogether—6 for the register above, not 3.

```java
int totalItems(Map<String, Integer> register) {
    int total = 0;
    for (int count : register.values()) {
        total += count;
    }
    return total;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    register.put("phone", 1);
    register.put("scarf", 2);
    IO.println(totalItems(register));
}
```

**Step 3.** Write `Map<String, Integer> addItem(Map<String, Integer> register, String item)`, returning a new register with one more of that item, whether or not it was already there.

```java
Map<String, Integer> addItem(Map<String, Integer> register, String item) {
    Map<String, Integer> updated = new LinkedHashMap<>(register);
    updated.put(item, updated.getOrDefault(item, 0) + 1);
    return updated;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    register.put("phone", 1);
    register.put("scarf", 2);
    IO.println(addItem(register, "hat"));
    IO.println(register);
}
```

**Step 4.** Write `Map<String, Integer> removeItem(Map<String, Integer> register, String item)`, returning a new register with one fewer. When the last one goes, drop the entry entirely with `remove`. Claiming something that is not held changes nothing.

```java
Map<String, Integer> removeItem(Map<String, Integer> register, String item) {
    Map<String, Integer> updated = new LinkedHashMap<>(register);
    if (!updated.containsKey(item)) {
        return updated;
    }
    int left = updated.get(item) - 1;
    if (left == 0) {
        updated.remove(item);
    } else {
        updated.put(item, left);
    }
    return updated;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    register.put("phone", 1);
    register.put("scarf", 2);
    IO.println(removeItem(register, "phone"));
    IO.println(removeItem(register, "umbrella"));
}
```

**Step 5.** Write `ArrayList<String> sortedItems(Map<String, Integer> register)`, returning the item names in alphabetical order. `keySet()` gives you the names.

```java
ArrayList<String> sortedItems(Map<String, Integer> register) {
    ArrayList<String> names = new ArrayList<>(register.keySet());
    Collections.sort(names);
    return names;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    register.put("phone", 1);
    register.put("scarf", 2);
    IO.println(sortedItems(register));
}
```

**Step 6.** Write `String busiest(Map<String, Integer> register)`, returning the name of the item there are most of. Assume no ties.

```java
String busiest(Map<String, Integer> register) {
    String best = null;
    for (String item : register.keySet()) {
        if (best == null || register.get(item) > register.get(best)) {
            best = item;
        }
    }
    return best;
}

void main() {
    Map<String, Integer> register = new LinkedHashMap<>();
    register.put("umbrella", 3);
    register.put("phone", 1);
    register.put("scarf", 2);
    IO.println(busiest(register));
}
```

**Step 7.** Write `ArrayList<String> inBoth(ArrayList<String> left, ArrayList<String> right)`, given two lists of item names, returning a sorted list of the names in both, each name once. Turn them into sets and use `retainAll`.

```java
ArrayList<String> inBoth(ArrayList<String> left, ArrayList<String> right) {
    Set<String> both = new TreeSet<>(left);
    both.retainAll(new HashSet<>(right));
    return new ArrayList<>(both);
}

void main() {
    ArrayList<String> left = new ArrayList<>(List.of("umbrella", "phone"));
    ArrayList<String> right = new ArrayList<>(List.of("phone", "hat"));
    IO.println(inBoth(left, right));
}
```

**Step 8.** Write `Map<String, Integer> registerFrom(ArrayList<String> found)`, given a list of item names as they were handed in, returning the register that counts them.

```java
Map<String, Integer> registerFrom(ArrayList<String> found) {
    Map<String, Integer> register = new LinkedHashMap<>();
    for (String item : found) {
        register.put(item, register.getOrDefault(item, 0) + 1);
    }
    return register;
}

void main() {
    ArrayList<String> found = new ArrayList<>(List.of("hat", "scarf", "hat"));
    IO.println(registerFrom(found));
}
```
