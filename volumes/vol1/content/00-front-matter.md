# Groundwork: Learn to Program in Java

Justin Stewart—built with Claude Opus 5.5

*A workable first course—every example runs as written.*

## How to Use This Course

This course teaches you to write programs in Java. It assumes you have never written a line of code and know roughly the algebra taught in a first high-school course. By the end you will be able to read a problem, break it into steps, choose a way to store the data, and write a program that solves it.

Every example here runs exactly as shown. Nothing needs to be installed, no files need to be downloaded, and no example depends on one printed in an earlier chapter unless it says so. If you type it in and it does not run, the problem is a typo, and Appendix A will help you find it.

### The three parts

**Part I (Chapters 1-6)** builds the machinery every program uses: storing values, doing arithmetic, making choices, repeating work, and packaging steps into methods. These six ideas are enough to write real programs, and everything later is built on them.

**Part II (Chapters 7-10)** is about *structuring data*. A program that tracks one test score needs a variable. A program that tracks a whole class needs an array or a list, and one that tracks a whole school needs something better still. These chapters cover the containers Java gives you and, more importantly, when to reach for each one.

**Part III (Chapters 11-12)** is about *algorithms*: named, reusable procedures for common problems. You will write searching and sorting algorithms by hand, measure how much work each one does, and meet recursion, where a method calls itself.

### The twelve chapters

| Chapter | Title |
| --- | --- |
| 1 | Your First Programs |
| 2 | Variables and Types |
| 3 | Expressions and Operators |
| 4 | Making Decisions |
| 5 | Repetition |
| 6 | Methods |
| 7 | Arrays and Lists |
| 8 | Strings as Data |
| 9 | Maps and Sets |
| 10 | Records |
| 11 | Searching and Sorting |
| 12 | Recursion and Problem Solving |

### What each chapter contains

| Section | What it is |
| --- | --- |
| Concept | The idea explained in plain language, with a worked example |
| Worked examples | Complete programs, ready to run and to change |
| Try It | Short exercises that practice one thing each, many with a Check button |
| Common mistakes | Errors that catch nearly everyone, and what they look like |
| Chapter project | A longer program combining everything in the chapter |

Do the Try It exercises as you go rather than saving them for the end. Programming is a skill like playing an instrument: reading about it and doing it are different activities, and only one of them works.

### Running the code

There is nothing to install and nothing for you to download. Every example sits in a box you can type in, with a **Run** button underneath. Press Run, and the output appears below the box.

Then change something and press Run again. Change a number, swap a `<` for a `>`, delete a line and see which part of the output disappears. This is the whole reason the code is in a box rather than on a page, and there is no way to break anything: the **Reset** button puts a box back to exactly how it started, and your own edits are kept if you close the page and come back.

Each box is a whole program, a complete Java file, and runs top to bottom the way a saved file does. A value you create in one box does not exist in the next one. Where an example needs something set up first, the box includes that setup itself, so every box runs on its own.

A few boxes fail on purpose: some do not compile, and some crash while they run. Those carry a note saying so before you run them, because the error message is the thing being taught.

> **A note on `IO.readln`.** Several programs ask you to type something. The program stops at its question, and a place to type your answer appears right there in the output; type it and press Enter. If a program seems to be doing nothing, check whether it is waiting for you. **End input** (or Ctrl-D) tells it there are no more answers.

> **If a program never stops.** A loop with no way out is an easy mistake to make, and here the box stops it after five seconds and says so. Nothing is lost when it does.

### The scratchpad

The boxes behave like files, because a program is a file. But a lot of learning happens by simply asking Java a question—what does `"5" + 1` give? is `7 / 2` 3 or 3.5?—and for that there is a **Scratchpad** button in the bottom right-hand corner of every page.

It opens jshell, the Java shell, right in the page. It remembers what you typed, so you can build something up a line at a time, and it shows you the value of anything you type without your having to print it. The page fetches about 30 MB for it the first time you open it, so it takes a few seconds to start (up to a minute on a phone). Appendix D explains the difference between the boxes and the scratchpad, and when each is the right one to reach for.

### Checking your answers

Every chapter ends with a handful of Try It exercises. About half have a **Check** button: it runs your answer against several test cases and, if something is wrong, tells you which case failed and what it expected. It does not care how you wrote it—a `for` loop and a `while` loop that both work will both pass.

Some exercises have no Check button. Those are the ones where you choose the words the program prints, or the data it works on, so there is no single right answer to check against. The box says as much rather than pretending otherwise. Appendix A is how you check those yourself, and it is worth reading before you need it.

A few boxes ask you to predict what a program prints: write your prediction under the code and press Check. Exercises and practice steps that ask you to write a program end with **Show a solution**, shut until you open it: try them first.

### On typing the examples out

Every example is already typed in for you, which is convenient and is also a trap. Reading code you did not write feels like understanding; writing it is what turns into being able to write it. Type the short examples out yourself—over the top of the box, or into the scratchpad—and run the long ones as printed, then change them until you can predict what the change will do.

### If you would rather use your own editor

Nothing here requires it, but every chapter's programs are also supplied as `.java` files, linked at the end of the chapter's page, if you would rather work on your own machine. You need Java 25 (the JDK) or newer and nothing else—no libraries beyond Java's own. A box's program saved as `Hello.java` runs unchanged with `java Hello.java`.

Every example here whose output can be known in advance is run, and its output compared against what the course says it prints, every time the site is rebuilt: once on the real JDK and once in the Java that runs in your browser. If they ever disagree, the build fails. So if an example behaves differently for you, something really is different, and Appendix A is about tracking that down.
