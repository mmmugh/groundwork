# deprecated constructor not for removal
new java.util.Date(99, 1, 1).getYear()

# deprecated method alone
Character.isSpace('a')

# user deprecated method
@Deprecated void old() { }

# call user deprecated
old();

# deprecated for removal user
@Deprecated(forRemoval=true) void gone() { }

# call it
gone();

# unchecked in method alone
void w2() { List r = new ArrayList(); r.add("a"); }

# unchecked and error in method
void w3() { List r = new ArrayList(); r.add("a"); int e = "x"; }

# raw add statement then error line
List rw = new ArrayList();

# unchecked call statement
rw.add("a");

# unchecked call plus error same snippet line
rw.add("b"); int bad = "x";

# unchecked call in second snippet on line
int fine = 1; rw.add("c");

# deprecation and unchecked in one statement
rw.add(new Integer(3));

# deprecation for removal and error
Thread.currentThread().stop(); int bad2 = "x";

# warning in class body
class WC { void m() { List r = new ArrayList(); r.add("a"); } }

# unchecked cast in method
void uc(Object o) { List<String> l = (List<String>) o; }

# unchecked generic array
List<String>[] ga = new List[2];

# unchecked conversion
List<String> lc = new ArrayList();

# warning and a value
List<String> lc2 = new ArrayList(); 

# division by constant zero in method
int dz() { return 1 / 0; }

# call it
dz()

# modulo zero
5 % 0

# double division zero
1.0 / 0

# final constant zero
final int zz = 1 / 0;

# long constant zero
long lz = 10L / 0L;

# division in expression statement
System.out.println(10 / 0);

# not a statement in method
void ns() { 5; }

# not a statement string
void ns2() { "abc"; }

# not a statement var
int nv = 1;
void ns3() { nv + 1; }

# not a statement comparison
void ns4() { nv == 1; }

# illegal start in method
void is1() { int = 5; }

# illegal start paren
void is2() { int a = (; }

# illegal start expr 3
int is3 = 1 +;

# illegal start expr 4
int is4 = (1 + 2;

# else without if method
void ew() { else { } }

# missing semicolon in method
void ms() { int a = 1 int b = 2; }

# missing semicolon statement
System.out.println("a")
System.out.println("b")

# missing quote
System.out.println("a);

# not a statement then other
5 +

# lone semicolon error
);

# lone brace
}

# lone paren
)

# lone bracket
]

# at sign
@

# hash
#

# backslash
\

# backtick
`

# unicode weird char
int ü = 5 ¿

# error spans lines call
Math.max(1,
         2,
         3)

# error spans lines array
int sp = new int[] {
    1,
    2
};

# error spans lines string concat
int sc = "a" +
    "b" +
    "c";

# error spans lines cond
boolean bl = 1 +
    2;

# error third line of two snippets
int la = 1;
int lb = 2;
int lc3 = "x";

# multiple errors second line
int m1 = "a";
int m2 = "b";
