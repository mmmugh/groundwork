# earlier lines of a failed multi-snippet line: was the last snippet run
int ok1 = 1; int bad1 = "s"; int ok2 = 2;

# ok2 after the failed line
ok2

# b5 after an exception mid line
int a5 = 1; 1/0; int b5 = 2;

# b5 lookup
b5

# first snippet complete, second incomplete at end of line
int x1 = 1; int y1 =
3;

# x1 y1 after that
x1 + y1

# complete snippet then open brace on one line
int u1 = 1; {
    u1++;
}

# closing brace followed by snippet on the closing line
int k1() {
    return 1;
} k1()

# line ending with a comment on an open snippet
int k2() { // open
    return 2;
}

# unclosed paren then line starting with slash
(10
/ 5)

# unclosed paren then slash then close
Math.max(10
/ 5, 1)

# line starting with plus after a complete line
int k4 = 1
+ 2

# k4 value
k4

# semicolon only line inside an open method
int k5() {
    ;
    return 5;
}

# non-breaking space before a declaration
 int nb = 1;

# space then slash command
  /vars

# slash command then trailing spaces
/vars   

# complete if block then declaration on same line
if (true) { } int u4 = 1;

# declaration then block comment open then close on next line
int z2 = 1; /* a
 b */ int z3 = 2;

# unterminated string inside an open method
int k6() {
    String t = "abc;
    return 1;
}

# method call split after open paren with blank
Math.abs(
@@blank
-1)

# for loop header split over lines
for (int i = 0;
     i < 2;
     i++) {
    System.out.print(i);
}

# annotation then method on separate lines
@Deprecated
int old() { return 1; }

# generic method call over lines
java.util.List.of(1,
    2,
    3)

# array access then newline operator
int[] ar = {1, 2, 3};

# expression with trailing plus-plus split
ar[0]
++

# lambda split over two lines applied at once
((Runnable) () ->
    System.out.println("run")).run();

# switch statement over lines
switch (ar.length) {
    case 3:
        System.out.println("three");
        break;
    default:
        System.out.println("other");
}

# do while multi-line
int dw = 0;
do {
    dw++;
} while (dw < 3);

# enum multi-line
enum Color {
    RED, GREEN
}

# var declaration split
var vv =
    List.of(1, 2);
