# G1: a range past its first line where the position is on a later line but the first line has several characters left
int g1(int a) { // note
    if (a > 0) return 1;
}

# G1b: the same without the comment (one character left on the first line)
int g1b(int a) {
    if (a > 0) return 1;
}

# G2: an expression result longer than 1000 characters (truncation at 1000)
"x".repeat(1200)

# G2b: a list whose text is over 1000 characters
java.util.stream.IntStream.range(0, 400).boxed().toList()

# G2c: exactly 1000 and 1001 characters
"y".repeat(998)

"z".repeat(999)

# G2d: a declaration over 80 (for the head and tail lengths)
String g2d = "abcdefghijklmnopqrstuvwxyz".repeat(5)

# G5: the same line twice in a row, then a line of spaces, then /history
int g5 = 1

int g5 = 1

@@blank

/history

# G7: a warning in a snippet that also prints
{ java.util.List r = new java.util.ArrayList(); r.add(1); System.out.println("printed in the block"); }

# G7b: a deprecated-for-removal call in a block that prints
{ System.out.println("before"); System.runFinalization(); System.out.println("after"); }
