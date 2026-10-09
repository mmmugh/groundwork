# comment before snippet on the same line
/* c */ int m1 = 1;

# comment between two snippets on one line
int m2 = 2; /* mid */ int m3 = 3;

# trailing comment containing a semicolon after an expression
1 + 1 // ;

# declaration no semicolon then second
int n1 = 1; int n2 = 2

# two statements printing, second without semicolon
System.out.println(1); System.out.println(2)

# double semicolon after a declaration
int dd = 1;;

# space before semicolon
int sb = 5 ;

# whitespace-only line at the prompt
   

# if header then body on next line
if (true)
    System.out.println("body");

# if else on separate lines at prompt
if (false) System.out.println("a");
else System.out.println("b");

# lone else
else

# open paren then closing
(1 +
2)

# trailing division operator
10 /
5

# ternary split over three lines
true ?
1 :
2

# trailing dot
"abc".
length()

# two blank lines inside an open expression
1 +
@@blank
@@blank
2

# comment line as first continuation line
int cm() {
// only comment
return 1;
}

# brace inside a line comment in an open method
int cb() { // {
    return 2;
}

# brace inside a string in an open method
int cs() {
    String t = "}";
    return t.length();
}

# brace inside a char literal in an open method
int cc() {
    char q = '}';
    return q;
}

# text block with comment opener inside
String tb2 = """
    /* not a comment
    // nor this
    """;

# text block with blank line inside
String tb3 = """
    a
@@blank
    b
    """;

# text block one closing line
String tb4 = """
    x""";

# import then declaration on one line
import java.util.*; List<Integer> li = new ArrayList<>();

# declaration then method on one line
int mm = 1; int sq(int n) { return n*n; }

# method then call on one line
void v() {} v()

# ok bad ok on one line
int ok1 = 1; int bad1 = "s"; int ok2 = 2;

# ok exception ok on one line
int a5 = 1; 1/0; int b5 = 2;

# exception then statement on one line
System.out.println("p"); Integer.parseInt("x"); System.out.println("q");

# line with only a closing brace
}

# line with only a closing paren
)

# unicode escape in source
int \u0061b = 1;

# cjk identifier
int 变量 = 1;

# emoji in string
String em = "😀";

# emoji length
em.length()

# 500 char string literal
String longs = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

# expression increment without semicolon
mm++

# expression increment with semicolon
mm++;

# a bare identifier
mm

# a bare string
"hi"

# empty statement then declaration on one line
; int af = 1;

# comment then blank inside open method
int cbm() {
    // c
@@blank
    return 3;
}

# block comment spanning lines opened on a snippet line
int bcm = 1; /* a
 b */

# block comment closes then code on same line
/* a
 b */ int bc2 = 2;

# line comment only inside open block comment
/* a
// b
c */

# string with escaped quote
String eq = "a\"b";

# backslash n in string
String bn = "a\nb";

# char literal brace at prompt
char cl = '{';
