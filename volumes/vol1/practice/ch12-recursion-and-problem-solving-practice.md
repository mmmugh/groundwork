# Practice: adding up a folder tree

"How big is this folder?" is a question with no bottom to it. A folder holds files, and it holds folders, and those hold folders. You cannot write a loop that goes deep enough, because you do not know how deep it goes—which is exactly the shape recursion is for.

A folder is a record, `record Folder(String name, List<Integer> files, List<Folder> folders) {}`: a name, the sizes of the files directly inside it, and the folders directly inside it, each one the same shape again. Printed, one looks like this:

```text
Folder[name=docs, files=[100, 250], folders=[]]
```

A folder with nothing in it has two empty lists, and that is the base case for nearly everything here.

The tree to test with:

```text
root            files 10, 20
  docs          files 100
  images        files 300, 40
    raw         files 1000
```

In a box, it is one `new Folder(...)` with the others written inside it, a folder's folders in its last list. `List.of()`, with nothing between the parentheses, is an empty list:

```text
Folder root = new Folder("root", List.of(10, 20), List.of(
        new Folder("docs", List.of(100), List.of()),
        new Folder("images", List.of(300, 40), List.of(
                new Folder("raw", List.of(1000), List.of())))));
```

Everything here uses Chapters 1 to 12. Each method needs to answer for the folder it is given by asking the same question of the folders inside it.

Each step names the method exactly: its return type, its name and its parameters. Check calls it with the cases under "What it should do," and those cases build each folder with `new Folder(...)` and each list with `List.of(...)`, so no method here can add to a folder's own lists: where a step builds a list, make a new one. Every box declares the `Folder` record on its first line, since each box is a whole program: keep that line.

## Steps

**Step 1.** Write `int totalSize(Folder folder)`, returning every byte at or below it—1470 for `root`, and 0 for an empty folder. Add up its own files, then add what each folder inside reports.

```java
record Folder(String name, List<Integer> files, List<Folder> folders) {}

int totalSize(Folder folder) {
    int size = 0;
    for (int file : folder.files()) {
        size += file;
    }
    for (Folder inner : folder.folders()) {
        size += totalSize(inner);
    }
    return size;
}

void main() {
    Folder root = new Folder("root", List.of(10, 20), List.of(
            new Folder("docs", List.of(100), List.of()),
            new Folder("images", List.of(300, 40), List.of(
                    new Folder("raw", List.of(1000), List.of())))));
    IO.println(totalSize(root));
}
```

**Step 2.** Write `int fileCount(Folder folder)`, returning how many files there are altogether, all the way down. Six for `root`.

```java
record Folder(String name, List<Integer> files, List<Folder> folders) {}

int fileCount(Folder folder) {
    int count = folder.files().size();
    for (Folder inner : folder.folders()) {
        count += fileCount(inner);
    }
    return count;
}

void main() {
    Folder root = new Folder("root", List.of(10, 20), List.of(
            new Folder("docs", List.of(100), List.of()),
            new Folder("images", List.of(300, 40), List.of(
                    new Folder("raw", List.of(1000), List.of())))));
    IO.println(fileCount(root));
}
```

**Step 3.** Write `int depth(Folder folder)`, returning how many levels deep the tree goes. A folder with no folders inside is depth 1, so `root` is 3.

```java
record Folder(String name, List<Integer> files, List<Folder> folders) {}

int depth(Folder folder) {
    int deepest = 0;
    for (Folder inner : folder.folders()) {
        int innerDepth = depth(inner);
        if (innerDepth > deepest) {
            deepest = innerDepth;
        }
    }
    return 1 + deepest;
}

void main() {
    Folder root = new Folder("root", List.of(10, 20), List.of(
            new Folder("docs", List.of(100), List.of()),
            new Folder("images", List.of(300, 40), List.of(
                    new Folder("raw", List.of(1000), List.of())))));
    IO.println(depth(root));
}
```

**Step 4.** Write `ArrayList<String> folderNames(Folder folder)`, returning every folder name, the folder itself first, then each subtree in order: `root`, `docs`, `images`, `raw`.

```java
record Folder(String name, List<Integer> files, List<Folder> folders) {}

ArrayList<String> folderNames(Folder folder) {
    ArrayList<String> names = new ArrayList<>();
    names.add(folder.name());
    for (Folder inner : folder.folders()) {
        names.addAll(folderNames(inner));
    }
    return names;
}

void main() {
    Folder root = new Folder("root", List.of(10, 20), List.of(
            new Folder("docs", List.of(100), List.of()),
            new Folder("images", List.of(300, 40), List.of(
                    new Folder("raw", List.of(1000), List.of())))));
    IO.println(folderNames(root));
}
```

**Step 5.** Write `int largestFile(Folder folder)`, returning the size of the biggest file anywhere below. The biggest one is three levels down, so this cannot only look at its own files. A tree with no files has no biggest file, and 0 cannot say so, since a file can be empty. A size is never negative, so -1 could stand in, as it did for "no score" in Chapter 6's project. But your `fileCount` from step 2 already tells you whether there are any files, so the caller checks before it calls: `if (fileCount(root) > 0)`. Check never hands it a tree with no files, though a folder in it may hold none of its own.

```java
record Folder(String name, List<Integer> files, List<Folder> folders) {}

int fileCount(Folder folder) {
    int count = folder.files().size();
    for (Folder inner : folder.folders()) {
        count += fileCount(inner);
    }
    return count;
}

int largestFile(Folder folder) {
    int biggest = 0;
    for (int size : folder.files()) {
        if (size > biggest) {
            biggest = size;
        }
    }
    for (Folder inner : folder.folders()) {
        int innerBiggest = largestFile(inner);
        if (innerBiggest > biggest) {
            biggest = innerBiggest;
        }
    }
    return biggest;
}

void main() {
    Folder root = new Folder("root", List.of(10, 20), List.of(
            new Folder("docs", List.of(100), List.of()),
            new Folder("images", List.of(300, 40), List.of(
                    new Folder("raw", List.of(1000), List.of())))));
    if (fileCount(root) > 0) {
        IO.println(largestFile(root));
    } else {
        IO.println("No files");
    }
}
```

**Step 6.** Write `Folder findFolder(Folder folder, String name)`, returning the folder record with that name, searching the whole tree, or `null` if there is no such folder.

```java
record Folder(String name, List<Integer> files, List<Folder> folders) {}

Folder findFolder(Folder folder, String name) {
    if (folder.name().equals(name)) {
        return folder;
    }
    for (Folder inner : folder.folders()) {
        Folder found = findFolder(inner, name);
        if (found != null) {
            return found;
        }
    }
    return null;
}

void main() {
    Folder root = new Folder("root", List.of(10, 20), List.of(
            new Folder("docs", List.of(100), List.of()),
            new Folder("images", List.of(300, 40), List.of(
                    new Folder("raw", List.of(1000), List.of())))));
    IO.println(findFolder(root, "raw"));
    IO.println(findFolder(root, "nowhere"));
}
```

**Step 7.** Write `ArrayList<Integer> allSizes(Folder folder)`, returning a flat list of every file size, in the same order as step 4 visits the folders.

```java
record Folder(String name, List<Integer> files, List<Folder> folders) {}

ArrayList<Integer> allSizes(Folder folder) {
    ArrayList<Integer> sizes = new ArrayList<>(folder.files());
    for (Folder inner : folder.folders()) {
        sizes.addAll(allSizes(inner));
    }
    return sizes;
}

void main() {
    Folder root = new Folder("root", List.of(10, 20), List.of(
            new Folder("docs", List.of(100), List.of()),
            new Folder("images", List.of(300, 40), List.of(
                    new Folder("raw", List.of(1000), List.of())))));
    IO.println(allSizes(root));
}
```

**Step 8.** Write `ArrayList<String> sizeReport(Folder folder)`, returning one line per folder, reading `docs: 100`, with each folder's own total from step 1, in the same order again. Bring in your `totalSize` from step 1.

```java
record Folder(String name, List<Integer> files, List<Folder> folders) {}

int totalSize(Folder folder) {
    int size = 0;
    for (int file : folder.files()) {
        size += file;
    }
    for (Folder inner : folder.folders()) {
        size += totalSize(inner);
    }
    return size;
}

ArrayList<String> sizeReport(Folder folder) {
    ArrayList<String> lines = new ArrayList<>();
    lines.add(folder.name() + ": " + totalSize(folder));
    for (Folder inner : folder.folders()) {
        lines.addAll(sizeReport(inner));
    }
    return lines;
}

void main() {
    Folder root = new Folder("root", List.of(10, 20), List.of(
            new Folder("docs", List.of(100), List.of()),
            new Folder("images", List.of(300, 40), List.of(
                    new Folder("raw", List.of(1000), List.of())))));
    for (String line : sizeReport(root)) {
        IO.println(line);
    }
}
```
