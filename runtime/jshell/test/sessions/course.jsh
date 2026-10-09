# Scratchpad transcript entries. One entry = one or more lines; entries are separated by blank lines.
# Lines starting with "#!" name the rules the NEXT entry must trigger, exactly; "#" lines are comments.

# values
2 + 3

"Hello, " + "world"

10 / 3

10 / 3.0

2147483647 + 1

# variables
int x = 10

x * 2

x = x + 5

double price = 19.99

boolean big = x > 10

# strings
String name = "Ada"

name.toUpperCase()

name.charAt(0)

name.substring(1, 3)

String.format("%.2f", price)

"a,b,c".split(",")

# methods, and redefining one
int square(int n) {
    return n * n;
}

square(7)

int square(int n) {
    return n * n * n;
}

square(3)

boolean isEven(int n) { return n % 2 == 0; }

isEven(4)

int fact(int n) { return n <= 1 ? 1 : n * fact(n - 1); }

fact(5)

# a method that uses a name not declared yet (a typo): jshell accepts it and says so
int scaled(int n) {
    return n * factor;
}

int factor = 3

scaled(2)

# failing entries
y + 1

int z = "oops";

square("a")

name.size()

int q = 5 +;

String u = "abc

# after failures the ids have moved on in Ristretto
int zero = 0

10 / zero

#! frames
Integer.parseInt("abc")

int half(int n) { return 10 / n; }

half(0)

throw new IllegalStateException()

# output and loops
IO.println("Hi")

System.out.println("Hi again")

for (int i = 1; i <= 3; i++) {
    IO.println("i = " + i);
}

int total = 0

for (int i = 1; i <= 4; i++) {
    total += i;
}

total

int n = 3

while (n > 0) {
    IO.print(n + " ");
    n--;
}

# ArrayList
ArrayList<String> names = new ArrayList<>()

names.add("Ada")

names.add("Grace")

names

names.size()

names.get(0)

names.remove("Ada")

names.contains("Grace")

#! frames
names.get(5)

for (String s : names) {
    IO.println(s);
}

# arrays
int[] nums = {3, 1, 2}

nums[0]

nums.length

Arrays.toString(nums)

String[] words = {"a", "b"}

nums[5]

# records
record Point(int x, int y) {}

Point p = new Point(3, 4)

p.x()

p

p.equals(new Point(3, 4))

# session commands
/list

/vars

/methods

/types
