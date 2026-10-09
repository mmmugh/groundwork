# value at prompt
2 + 3

# two-line method
int square(int n) {
    return n * n;
}

# if else multi-line statement
if (true) {
    System.out.println("yes");
} else {
    System.out.println("no");
}

# nested braces method
int f(int n) {
    if (n > 0) {
        for (int i = 0; i < 2; i++) {
            n++;
        }
    }
    return n;
}

# switch expression multi-line
int k = 2;
String s = switch (k) {
    case 1 -> "one";
    case 2 -> "two";
    default -> "many";
};

# lambda multi-line applied at once
int g = ((java.util.function.Function<Integer,Integer>) x -> {
    int y = x + 1;
    return y * 2;
}).apply(3);

# blank at prompt
@@blank

# blank twice at prompt
@@blank
@@blank

# blank inside open snippet
int h(int n) {
@@blank
    return n;
}

# line comment at prompt
// hi

# block comment at prompt
/* x */

# multi-line block comment at prompt
/* start
 end */

# comment inside open snippet
int c1(int n) {
    // inner
    /* x */
    return n;
}

# snippet followed by line comment
int d = 4; // trailing

# snippet followed by block comment
int d2 = 5; /* trailing */

# expression followed by comment no semicolon
d + d2 // sum

# two declarations on one line
int a = 1; int b = 2;

# two expressions on one line
1 + 1; 2 + 2

# declaration then expression
int e = 7; e * 2

# three snippets on one line
int p = 1; int q = 2; p + q

# expression with semicolon
3 + 4;

# statement without semicolon
System.out.println("no semi")

# statement with semicolon
System.out.println("semi");

# leading spaces
   int sp = 9;

# trailing spaces
int tr = 8;   

# leading spaces expression
      sp + tr

# division continuation starts with slash
int dv = 10
/ 2;

# division continuation expression
10
/ 5

# text block
String tbk = """
    hello
      world
    """;

# text block print
System.out.println(tbk);

# string with block comment opener
String sc = "a /* b";

# string with line comment
String sl = "a // b";

# string comment then following
sc + sl

# unicode identifier
int café = 1;

# unicode identifier use
café + 1

# greek identifier
String αβγ = "x";

# lone semicolon
;

# two lone semicolons
;;

# open brace then close later
{
    int z1 = 1;
}

# incomplete expression
1 +
2

# unclosed paren
Math.max(1,
    2)

# unclosed paren statement
System.out.println(
    "hi"
);

# incomplete declaration
int w =
5;

# blank after incomplete expression
1 +
@@blank
2

# error in multi-line snippet
int bad(int n) {
    return n +;
}

# string unclosed
String u = "abc

# char unclosed
char ch = 'a

# array initializer multi-line
int[] arr = {
    1,
    2,
    3
};

# method chain over lines
"abc"
    .toUpperCase()
    .length()

# class multi-line
class Pt {
    int x;
    Pt(int x) { this.x = x; }
}

# record one line
record R(int a) {}

# interface multi-line
interface Sh {
    double area();
}

# for loop one line
for (int i = 0; i < 3; i++) System.out.print(i);

# while multi-line
int cnt = 0;
while (cnt < 3) {
    cnt++;
}

# try catch
try {
    Integer.parseInt("x");
} catch (NumberFormatException ex) {
    System.out.println("nfe");
}
