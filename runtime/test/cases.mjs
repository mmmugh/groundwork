/*
 *  Copyright 2026 Groundwork contributors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
// Test programs for runtime/test/differential.mjs, which runs each one on the fork and on the pinned JDK
// (`java Main.java`, same stdin). The pinned JDK is the only oracle: a case passes when the fork prints
// what the JDK prints, or when the difference is listed in known-differences.json with a reason. No case
// states what it should print. Each case is { id, group, src, stdin?, note? }; a note is for the reader
// and nothing checks it. Which patch a case depends on is shown by running the gates on the leave-one-out
// builds, each without one patch and the patches that declare they build on it (runtime/test/negatives.mjs),
// not written down here.
const R = String.raw;

const fault = {
  npe: { setup: R`String s = null;`, act: R`IO.println(s.length());`, cls: "NullPointerException" },
  aioobe: { setup: R`int[] a = {1, 2, 3};`, act: R`IO.println(a[3]);`, cls: "ArrayIndexOutOfBoundsException" },
  aioobe_loop: { setup: R`int[] a = {1, 2, 3}; int sum = 0;`, act: R`for (int i = 0; i <= a.length; i++) { sum += a[i]; }`, cls: "ArrayIndexOutOfBoundsException" },
  div0: { setup: R`int z = 0;`, act: R`IO.println(10 / z);`, cls: "ArithmeticException" },
  mod0: { setup: R`int z = 0;`, act: R`IO.println(10 % z);`, cls: "ArithmeticException" },
  ldiv0: { setup: R`long z = 0;`, act: R`IO.println(10L / z);`, cls: "ArithmeticException" },
  charat: { setup: R`String s = "abc";`, act: R`IO.println(s.charAt(5));`, cls: "StringIndexOutOfBoundsException" },
  cce: { setup: R`Object o = Integer.valueOf(1);`, act: R`String s = (String) o; IO.println(s);`, cls: "ClassCastException" },
};

export const cases = [];
for (const [k, f] of Object.entries(fault)) {
  cases.push({ id: `F1-${k}-catch-specific`, group: "F1",
    src: `void main() {\n    ${f.setup}\n    try {\n        ${f.act}\n    } catch (${f.cls} e) {\n        IO.println("caught");\n    }\n    IO.println("after");\n}\n` });
  cases.push({ id: `F1-${k}-catch-exception`, group: "F1",
    src: `void main() {\n    ${f.setup}\n    try {\n        ${f.act}\n    } catch (Exception e) {\n        IO.println("caught: " + e);\n    }\n    IO.println("after");\n}\n` });
  cases.push({ id: `F1-${k}-uncaught`, group: "F1",
    src: `void main() {\n    ${f.setup}\n    IO.println("before");\n    ${f.act}\n    IO.println("unreachable");\n}\n` });
}
cases.push(
  { id: "F1-const-div-in-try", group: "F1", note: "javac folds 10 / 0; used to crash the compiler",
    src: R`void main() {
    try {
        int x = 10 / 0;
        IO.println(x);
    } catch (ArithmeticException e) {
        IO.println("caught: " + e.getMessage());
    }
}
` },
  { id: "F1-next-compile-after-crash-candidate", group: "F1", note: "compiled right after F1-const-div-in-try",
    src: R`void main() { IO.println("compiler still alive"); }
` },
  { id: "F1-min-div-minus-one", group: "F1", note: "Java defines MIN_VALUE / -1 == MIN_VALUE; Wasm traps",
    src: R`void main() {
    int a = Integer.MIN_VALUE;
    IO.println(a / -1);
    IO.println(div(Integer.MIN_VALUE, -1));
    IO.println(Long.MIN_VALUE / neg());
}
static int div(int x, int y) { return x / y; }
static long neg() { return -1; }
` },
  { id: "F1-getMessage", group: "F1",
    src: R`void main() {
    try {
        throw new IllegalArgumentException("bad input");
    } catch (IllegalArgumentException e) {
        IO.println(e.getMessage());
        IO.println(e.getClass().getName());
    }
}
` },
  { id: "F1-throw-uncaught-custom", group: "F1",
    src: R`class InsufficientFundsException extends Exception {
    InsufficientFundsException(String msg) { super(msg); }
}

void main() throws InsufficientFundsException {
    IO.println("withdrawing");
    throw new InsufficientFundsException("balance too low");
}
` },
  { id: "F1-stack-trace-line", group: "F1", note: "second stderr line is the real frame",
    src: R`void main() {
    int[] data = new int[2];
    fill(data, 2);
}

static void fill(int[] d, int n) {
    d[n] = 1;
}
` },
  { id: "F1-parseInt-uncaught", group: "F1", note: "the trace runs through the library; only the program's own frame is compared",
    src: R`void main() {
    String text = "12a";
    int n = Integer.parseInt(text);
    IO.println(n);
}
` },
  { id: "F1-uncaught-two-calls-deep", group: "F1", note: "thrown by the program two calls below main: three frames of its own",
    src: R`void main() {
    IO.println("start");
    process(new int[] {4, 0});
}

static void process(int[] values) {
    IO.println(ratio(values[0], values[1]));
}

static int ratio(int a, int b) {
    if (b == 0) throw new IllegalArgumentException("b must not be zero");
    return a / b;
}
` },
  { id: "F1-unused-throwing-read", group: "F1", note: "known gap: TeaVM removes an array read whose result is unused, so nothing is thrown",
    src: R`void main() {
    int[] a = {1, 2, 3};
    try {
        int unused = a[3];
        IO.println("no exception");
    } catch (RuntimeException e) {
        IO.println("caught: " + e);
    }
}
` },
  { id: "F1-unused-cast", group: "F1", note: "known gap: TeaVM removes a cast whose result is unused, so nothing is thrown",
    src: R`void main() {
    Object o = Integer.valueOf(1);
    try {
        String s = (String) o;
        IO.println("no exception");
    } catch (ClassCastException e) {
        IO.println("caught: " + e.getMessage());
    }
}
` },
  { id: "F1-finally-order", group: "F1",
    src: R`void main() {
    try {
        Object o = null;
        o.hashCode();
    } catch (NullPointerException e) {
        IO.println("catch");
    } finally {
        IO.println("finally");
    }
}
` },
);

// ---------------------------------------------------------------- F3 input
const S = "import java.util.Scanner;\n\n";
cases.push(
  { id: "F3-scanner-nextInt-nextLine-trap", group: "F3", stdin: "42\nAda Lovelace\n",
    src: S + R`void main() {
    Scanner sc = new Scanner(System.in);
    IO.print("Age? ");
    int age = sc.nextInt();
    String rest = sc.nextLine();
    IO.print("Name? ");
    String name = sc.nextLine();
    IO.println("age=" + age + " rest=[" + rest + "] name=[" + name + "]");
}
` },
  { id: "F3-scanner-hasNextInt-sum", group: "F3", stdin: "1 2 3\n4\n  5\tx 6\n",
    src: S + R`void main() {
    Scanner sc = new Scanner(System.in);
    int sum = 0;
    while (sc.hasNextInt()) {
        sum += sc.nextInt();
    }
    IO.println("sum=" + sum + " next=" + sc.next());
}
` },
  { id: "F3-scanner-next-tokens", group: "F3", stdin: "  alpha\tbeta\n\n gamma  \n",
    src: S + R`void main() {
    Scanner sc = new Scanner(System.in);
    IO.println(sc.next() + "|" + sc.next() + "|" + sc.next() + "|" + sc.hasNext());
}
` },
  { id: "F3-scanner-nextDouble", group: "F3", stdin: "3.5 -2 1e3 .5 7.\n",
    src: S + R`void main() {
    Scanner sc = new Scanner(System.in);
    for (int i = 0; i < 5; i++) {
        IO.println(sc.nextDouble());
    }
}
` },
  { id: "F3-scanner-mismatch-uncaught", group: "F3", stdin: "abc\n",
    src: S + R`void main() {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    IO.println(n);
}
` },
  { id: "F3-scanner-mismatch-not-consumed", group: "F3", stdin: "abc 7\n",
    src: S + R`import java.util.InputMismatchException;

void main() {
    Scanner sc = new Scanner(System.in);
    try {
        sc.nextInt();
    } catch (InputMismatchException e) {
        IO.println("not a number: " + sc.next());
    }
    IO.println(sc.nextInt());
}
` },
  { id: "F3-scanner-eof-nextLine", group: "F3", stdin: "",
    src: S + R`void main() {
    Scanner sc = new Scanner(System.in);
    IO.println(sc.hasNextLine());
    IO.println(sc.nextLine());
}
` },
  { id: "F3-scanner-hasNextLine-loop", group: "F3", stdin: "first\n\nthird without newline",
    src: S + R`void main() {
    Scanner sc = new Scanner(System.in);
    int n = 0;
    while (sc.hasNextLine()) {
        n++;
        IO.println(n + ": [" + sc.nextLine() + "]");
    }
}
` },
  { id: "F3-scanner-crlf", group: "F3", stdin: "5\r\nhello world\r\nlast\r\n",
    src: S + R`void main() {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    String a = sc.nextLine();
    String b = sc.nextLine();
    String c = sc.nextLine();
    IO.println(n + "[" + a + "][" + b + "][" + c + "]" + sc.hasNextLine());
}
` },
  { id: "F3-scanner-utf8", group: "F3", stdin: "héllo wörld ✓ 😀\n",
    src: S + R`void main() {
    Scanner sc = new Scanner(System.in);
    String line = sc.nextLine();
    IO.println(line + " (" + line.length() + " chars)");
}
` },
  { id: "F3-scanner-long-boolean", group: "F3", stdin: "9000000000 true FALSE\n",
    src: S + R`void main() {
    Scanner sc = new Scanner(System.in);
    long big = sc.nextLong();
    boolean a = sc.nextBoolean();
    boolean b = sc.nextBoolean();
    IO.println(big + 1 + " " + a + " " + b);
}
` },
  { id: "F3-scanner-int-overflow", group: "F3", stdin: "99999999999\n",
    src: S + R`void main() {
    Scanner sc = new Scanner(System.in);
    IO.println(sc.hasNextInt() + " " + sc.hasNextLong());
    IO.println(sc.nextInt());
}
` },
  { id: "F3-scanner-grouped-number", group: "F3", stdin: "1,234 5,6\n",
    src: S + R`void main() {
    Scanner sc = new Scanner(System.in);
    IO.println(sc.nextInt());
    IO.println(sc.hasNextInt());
}
` },
  { id: "F3-scanner-string-source", group: "F3",
    src: S + R`void main() {
    Scanner sc = new Scanner("10 20\nthirty");
    IO.println(sc.nextInt() + sc.nextInt());
    sc.nextLine();
    IO.println(sc.nextLine());
}
` },
  { id: "F3-scanner-closed", group: "F3", stdin: "x\n",
    src: S + R`void main() {
    Scanner sc = new Scanner(System.in);
    sc.close();
    sc.nextLine();
}
` },
  { id: "F3-scanner-try-with-resources", group: "F3", stdin: "3\n",
    src: S + R`void main() {
    try (Scanner sc = new Scanner(System.in)) {
        int n = sc.nextInt();
        for (int i = 1; i <= n; i++) {
            IO.println(i * i);
        }
    }
}
` },
  { id: "F3-guessing-game", group: "F3", stdin: "50\n25\n37\n",
    src: S + R`void main() {
    Scanner sc = new Scanner(System.in);
    int secret = 37;
    int tries = 0;
    while (true) {
        IO.print("Guess: ");
        int g = sc.nextInt();
        tries++;
        if (g < secret) IO.println("higher");
        else if (g > secret) IO.println("lower");
        else { IO.println("got it in " + tries); break; }
    }
}
` },
  { id: "F3-readln-prompt", group: "F3", stdin: "Ada\n36\n",
    src: R`void main() {
    String name = IO.readln("Name? ");
    int age = Integer.parseInt(IO.readln("Age? "));
    IO.println("Hi " + name + ", next year you are " + (age + 1));
}
` },
  { id: "F3-readln-eof-null", group: "F3", stdin: "only line",
    src: R`void main() {
    IO.println(IO.readln());
    IO.println(IO.readln());
}
` },
  { id: "F3-system-in-read", group: "F3", stdin: "AB",
    src: R`void main() throws java.io.IOException {
    int a = System.in.read();
    int b = System.in.read();
    int c = System.in.read();
    IO.println(a + " " + b + " " + c);
}
` },
  { id: "F3-two-scanners", group: "F3", stdin: "one\ntwo\n", note: "JDK with piped stdin: the first Scanner reads ahead, the second sees nothing",
    src: S + R`void main() {
    Scanner a = new Scanner(System.in);
    IO.println(a.nextLine());
    Scanner b = new Scanner(System.in);
    IO.println(b.hasNextLine() ? b.nextLine() : "<nothing left>");
}
` },
  { id: "F3-readln-then-scanner", group: "F3", stdin: "Ada\n7\n", note: "JDK: IO.readln's BufferedReader reads ahead past the first line",
    src: S + R`void main() {
    String name = IO.readln();
    Scanner sc = new Scanner(System.in);
    IO.println(name + " " + (sc.hasNextInt() ? sc.nextInt() : -1));
}
` },
);

// ---------------------------------------------------------------- F4 formatting
cases.push(
  { id: "F4-format-float", group: "F4",
    src: R`void main() {
    IO.println(String.format("%.2f", 3.14159));
    IO.println("%.1f%%".formatted(12.345));
    System.out.printf("%8.3f|%-8.1f|%08.2f%n", Math.PI, 2.5, -3.14159);
}
` },
  { id: "F4-printf-n", group: "F4",
    src: R`void main() {
    System.out.printf("%d-%s%n", 5, "ok");
    System.out.printf("a%nb%n");
}
` },
  { id: "F4-percent-literal", group: "F4",
    src: R`void main() {
    IO.println(String.format("%d%% done", 50));
    IO.println(String.format("%% then %d and %s", 1, "two"));
}
` },
  { id: "F4-format-int-string", group: "F4",
    src: R`void main() {
    IO.println(String.format("[%5d][%-5d][%05d][%,d][%+d]", 42, 42, 42, 1234567, 7));
    IO.println(String.format("[%s][%10s][%-10s][%c][%b][%x][%X]", "a", "b", "c", 'z', true, 255, 255));
}
` },
  { id: "F4-format-rounding", group: "F4", note: "Java's %f rounds HALF_UP",
    src: R`void main() {
    IO.println(String.format("%.1f %.1f %.1f %.0f %.0f %.2f %.2f", 0.25, 0.35, 0.05, 2.5, 3.5, 1.005, 2.675));
}
` },
  { id: "F4-format-grouped-float", group: "F4",
    src: R`void main() {
    IO.println(String.format("%,.2f", 1234567.891));
    IO.println(String.format("%.3e", 12345.678));
}
` },
  { id: "F4-receipt", group: "F4",
    src: R`record Item(String name, int qty, double price) {}

void main() {
    var items = java.util.List.of(new Item("Apple", 3, 0.5), new Item("Bread", 1, 2.25), new Item("Milk", 2, 1.19));
    double total = 0;
    for (Item it : items) {
        double line = it.qty() * it.price();
        total += line;
        System.out.printf("%-6s x%d %7.2f%n", it.name(), it.qty(), line);
    }
    System.out.printf("%-9s %7.2f%n", "TOTAL", total);
}
` },
);

// ---------------------------------------------------------------- F5 general syllabus spot checks
cases.push(
  { id: "G-hello-compact", group: "G", src: R`void main() {
    IO.println("Hello, world!");
}
` },
  { id: "G-hello-classic", group: "G", src: R`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from a class");
    }
}
` },
  { id: "G-print-no-newline", group: "G", src: R`void main() {
    System.out.print("no newline");
}
` },
  { id: "G-utf8-output", group: "G", src: R`void main() {
    IO.println("café ✓ 😀 Ωμέγα");
}
` },
  { id: "G-primitives", group: "G", src: R`void main() {
    int big = Integer.MAX_VALUE;
    IO.println(big + 1);
    IO.println(7 / 2 + " " + -7 / 2 + " " + 7 % 3 + " " + -7 % 3 + " " + 7.0 / 2);
    IO.println(0.1 + 0.2);
    IO.println((int) 3.99 + " " + (int) -3.99 + " " + Math.round(2.5) + " " + Math.round(-2.5));
    IO.println((char) ('a' + 1) + " " + ('a' + 1));
    IO.println(10_000_000_000L * 3);
    IO.println(1.0 / 0 + " " + -1.0 / 0 + " " + 0.0 / 0);
    IO.println(Double.MAX_VALUE + " " + Float.MIN_VALUE + " " + 100.0 / 3);
}
` },
  { id: "G-strings", group: "G", src: R`void main() {
    String s = "  Hello, World  ";
    IO.println("[" + s.trim() + "][" + s.strip() + "]" + s.length());
    IO.println(s.trim().toUpperCase() + s.trim().toLowerCase());
    IO.println("banana".indexOf("an") + " " + "banana".lastIndexOf("an") + " " + "banana".replace('a', 'o'));
    IO.println(String.join("-", "a", "b", "c") + " " + "ab".repeat(3) + " " + "a,b,,c".split(",").length);
    IO.println(new StringBuilder("stressed").reverse());
    IO.println("apple".compareTo("banana") + " " + "Apple".equalsIgnoreCase("aPPLE") + " " + "abc".contains("bc"));
    String text = """
        Line one
          indented
        """;
    IO.print(text);
    IO.println(String.valueOf(3.0) + Integer.toBinaryString(10) + Integer.toHexString(255));
    IO.println("x".isBlank() + " " + "  ".isBlank() + " " + "Mississippi".chars().filter(c -> c == 's').count());
}
` },
  { id: "G-control-flow", group: "G", src: R`void main() {
    for (int i = 1; i <= 15; i++) {
        String out = (i % 15 == 0) ? "FizzBuzz" : (i % 3 == 0) ? "Fizz" : (i % 5 == 0) ? "Buzz" : String.valueOf(i);
        IO.print(out + (i < 15 ? " " : "\n"));
    }
    int day = 3;
    String name = switch (day) {
        case 1, 7 -> "weekend";
        case 2, 3, 4, 5, 6 -> {
            String w = "week";
            yield w + "day";
        }
        default -> "?";
    };
    IO.println(name);
    outer:
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            if (j == 2) continue outer;
            if (i == 2) break outer;
            IO.print(i + "" + j + " ");
        }
    }
    IO.println();
    int n = 0;
    do { n++; } while (n < 5);
    IO.println(n);
    String cmd = "stop";
    switch (cmd) {
        case "go": IO.println("going"); break;
        case "stop": IO.println("stopping");
        default: IO.println("fell through");
    }
}
` },
  { id: "G-methods-recursion", group: "G", src: R`static long fib(int n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); }
static int gcd(int a, int b) { return b == 0 ? a : gcd(b, a % b); }
static boolean isPrime(int n) {
    if (n < 2) return false;
    for (int d = 2; d * d <= n; d++) if (n % d == 0) return false;
    return true;
}

void main() {
    IO.println(fib(30));
    IO.println(gcd(84, 36));
    var primes = new StringBuilder();
    for (int i = 0; i < 30; i++) if (isPrime(i)) primes.append(i).append(' ');
    IO.println(primes.toString().trim());
}
` },
  { id: "G-arrays", group: "G", src: R`import java.util.Arrays;

void main() {
    int[] a = {5, 3, 9, 1, 7};
    Arrays.sort(a);
    IO.println(Arrays.toString(a));
    int[][] grid = new int[3][4];
    for (int r = 0; r < 3; r++) for (int c = 0; c < 4; c++) grid[r][c] = r * c;
    IO.println(Arrays.deepToString(grid));
    String[] words = {"pear", "Apple", "fig"};
    Arrays.sort(words);
    IO.println(Arrays.toString(words) + " " + Arrays.binarySearch(a, 7));
    int[] copy = Arrays.copyOf(a, 7);
    IO.println(Arrays.toString(copy) + " " + Arrays.stream(a).sum() + " " + a.length);
    char[] cs = "hello".toCharArray();
    Arrays.fill(cs, 1, 3, '*');
    IO.println(new String(cs));
}
` },
  { id: "G-collections", group: "G", src: R`import java.util.*;

void main() {
    List<String> list = new ArrayList<>(List.of("b", "a", "c"));
    Collections.sort(list);
    list.add(0, "z");
    IO.println(list + " " + list.size() + " " + list.contains("a") + " " + list.indexOf("c"));
    Map<String, Integer> counts = new HashMap<>();
    for (String w : "the cat and the hat and the bat".split(" ")) counts.merge(w, 1, Integer::sum);
    IO.println(new TreeMap<>(counts));
    Set<Integer> set = new TreeSet<>(List.of(5, 1, 5, 3));
    IO.println(set);
    Deque<Integer> stack = new ArrayDeque<>();
    stack.push(1); stack.push(2);
    IO.println(stack.pop() + " " + stack.peek());
    Queue<String> q = new LinkedList<>(List.of("x", "y"));
    IO.println(q.poll() + q.size());
    Iterator<String> it = list.iterator();
    while (it.hasNext()) if (it.next().equals("a")) it.remove();
    IO.println(list);
    IO.println(counts.getOrDefault("dog", 0) + " " + counts.containsKey("cat"));
}
` },
  { id: "G-records-enums-lambdas", group: "G", src: R`import java.util.*;
import java.util.stream.*;

record Point(int x, int y) {
    double dist() { return Math.sqrt(x * x + y * y); }
}

enum Color { RED, GREEN, BLUE }

void main() {
    Point p = new Point(3, 4);
    IO.println(p + " " + p.dist() + " " + p.equals(new Point(3, 4)));
    for (Color c : Color.values()) IO.print(c + ":" + c.ordinal() + " ");
    IO.println(Color.valueOf("GREEN").name());
    List<Integer> nums = List.of(5, 2, 8, 1, 9, 3);
    IO.println(nums.stream().filter(n -> n % 2 == 1).map(n -> n * n).collect(Collectors.toList()));
    IO.println(nums.stream().mapToInt(Integer::intValue).max().getAsInt() + " " + nums.stream().reduce(0, Integer::sum));
    List<String> names = new ArrayList<>(List.of("Charlie", "alice", "Bob"));
    names.sort(Comparator.comparing(String::toLowerCase));
    IO.println(names);
    Optional<String> first = names.stream().filter(s -> s.startsWith("Z")).findFirst();
    IO.println(first.orElse("none") + " " + first.isPresent());
    names.forEach(System.out::println);
    Map<Boolean, List<Integer>> parts = nums.stream().collect(Collectors.partitioningBy(n -> n > 4));
    IO.println(parts);
    IO.println(IntStream.rangeClosed(1, 5).mapToObj(Integer::toString).collect(Collectors.joining(",", "[", "]")));
}
` },
  { id: "G-oop", group: "G", src: R`abstract class Shape {
    abstract double area();
    public String toString() { return getClass().getSimpleName() + String.format("(%.2f)", area()); }
}
class Circle extends Shape {
    private final double r;
    Circle(double r) { this.r = r; }
    double area() { return Math.PI * r * r; }
}
class Square extends Shape {
    private final double s;
    Square(double s) { this.s = s; }
    double area() { return s * s; }
}
interface Greeter { String greet(String name); default String hi() { return greet("hi"); } }

void main() {
    java.util.List<Shape> shapes = java.util.List.of(new Circle(1), new Square(2));
    for (Shape s : shapes) IO.println(s);
    Greeter g = n -> "Hello, " + n;
    IO.println(g.hi());
    Object o = shapes.get(0);
    if (o instanceof Circle c) IO.println("circle area " + Math.round(c.area() * 100) / 100.0);
    IO.println(switch (o) { case Circle c -> "C"; case Square s -> "S"; default -> "?"; });
}
` },
  { id: "G-parse-errors", group: "G", src: R`void main() {
    IO.println(Integer.parseInt("-42") + Integer.parseInt("+8") + Double.parseDouble("2.5"));
    try {
        Integer.parseInt("12a");
    } catch (NumberFormatException e) {
        IO.println("NFE: " + e.getMessage());
    }
}
` },
  { id: "G-integer-sum", group: "G", src: R`void main() {
    IO.println(Integer.sum(2, 3) + " " + Long.sum(4L, 5L) + " " + Double.sum(0.5, 0.25));
}
` },
  { id: "G-compile-error", group: "G", src: R`void main() {
    int x = "not a number";
}
` },
  { id: "G-system-exit", group: "G", note: "System.exit ends the program (teavm-0012)", src: R`void main() {
    IO.println("before");
    System.exit(0);
}
` },
  { id: "G-math", group: "G", src: R`void main() {
    IO.println(Math.sqrt(2) + " " + Math.pow(2, 10) + " " + Math.abs(-7) + " " + Math.max(3, 9));
    IO.println(Math.floor(-2.5) + " " + Math.ceil(-2.5) + " " + Math.floorDiv(-7, 2) + " " + Math.floorMod(-7, 2));
    IO.println(Math.hypot(3, 4) + " " + Math.cbrt(27) + " " + Math.log10(1000) + " " + Math.toDegrees(Math.PI));
}
` },
  { id: "G-char-methods", group: "G", src: R`void main() {
    String s = "Hello World 42!";
    int upper = 0, digits = 0, spaces = 0;
    for (char c : s.toCharArray()) {
        if (Character.isUpperCase(c)) upper++;
        if (Character.isDigit(c)) digits++;
        if (Character.isWhitespace(c)) spaces++;
    }
    IO.println(upper + " " + digits + " " + spaces + " " + Character.toUpperCase('q') + Character.getNumericValue('7'));
}
` },
);

// Review Focus cases (Task 2): non-ASCII through IO.readln/IO.println byte for byte, int overflow,
// long arithmetic, and char arithmetic.
cases.push(
  { id: "RF-utf8-input", group: "review-focus", stdin: "café 😀\n",
    src: 'void main() { String s = IO.readln(); IO.println(s + " / " + s.length()); }' },
  { id: "RF-int-overflow", group: "review-focus",
    src: 'void main() { int x = Integer.MAX_VALUE; IO.println(x + 1); long y = x; IO.println(y + 1); }' },
  { id: "RF-char-arithmetic", group: "review-focus",
    src: "void main() { char c = 'a'; IO.println(c + 1); IO.println((char) (c + 1)); IO.println('A' + 'B'); }" },
);

// D11 (Task 4): the JDK's own message text for the errors a first course shows. Every case uses the
// value it computes: TeaVM's optimizer deletes an array read or a cast whose result is unused, so a
// case that discards its result can pass for the wrong reason.
const msg = (id, body) => ({ id: `D11-${id}`, group: "jdk-messages", src: `void main() { ${body} }` });
cases.push(
  msg("array-index-uncaught", "int[] a = new int[3]; IO.println(a[3]);"),
  msg("array-index-caught", "int[] a = new int[3]; try { a[-1] = 1; } catch (ArrayIndexOutOfBoundsException e) { IO.println(e.getMessage()); }"),
  msg("charAt", 'try { IO.println("abc".charAt(5)); } catch (StringIndexOutOfBoundsException e) { IO.println(e.getMessage()); }'),
  msg("substring", 'try { IO.println("abc".substring(2, 7)); } catch (StringIndexOutOfBoundsException e) { IO.println(e.getMessage()); }'),
  msg("parseInt-letters", 'try { IO.println(Integer.parseInt("12a")); } catch (NumberFormatException e) { IO.println(e.getMessage()); }'),
  msg("parseInt-empty", 'try { IO.println(Integer.parseInt("")); } catch (NumberFormatException e) { IO.println(e.getMessage()); }'),
  msg("parseInt-null", "String s = null; try { IO.println(Integer.parseInt(s)); } catch (NumberFormatException e) { IO.println(e.getMessage()); }"),
  msg("parseInt-overflow", 'try { IO.println(Integer.parseInt("99999999999")); } catch (NumberFormatException e) { IO.println(e.getMessage()); }'),
  msg("parseDouble", 'try { IO.println(Double.parseDouble("1.2.3")); } catch (NumberFormatException e) { IO.println(e.getMessage()); }'),
  msg("div-zero", "int z = 0; try { IO.println(5 / z); } catch (ArithmeticException e) { IO.println(e.getMessage()); }"),
  msg("mod-zero", "int z = 0; try { IO.println(5 % z); } catch (ArithmeticException e) { IO.println(e.getMessage()); }"),
  msg("cast", 'Object o = "text"; try { IO.println((Integer) o + 1); } catch (ClassCastException e) { IO.println(e.getMessage()); }'),
  msg("uncaught-custom-nested", 'class Oops extends RuntimeException { Oops(String m) { super(m); } } new Object() { void a() { b(); } void b() { throw new Oops("nested failure"); } }.a();'),
  msg("readln-at-end", "String s = IO.readln(); IO.println(s == null); IO.println(Integer.parseInt(s));"),
);

// D11 (Task 5): numbers the Javadoc pins down exactly: Math.round's ties, the smallest float, and
// Math.log10 of an exact power of ten.
cases.push(
  { id: "D11-round-halves", group: "numeric", src: "void main() { for (double d : new double[] { -2.5, -1.5, -0.5, 0.5, 1.5, 2.5 }) IO.println(Math.round(d)); }" },
  { id: "D11-float-min", group: "numeric", src: "void main() { IO.println(Float.MIN_VALUE); IO.println(Float.MIN_NORMAL); IO.println(Double.MIN_VALUE); }" },
  { id: "D11-log10-powers", group: "numeric", src: "void main() { for (int n = -3; n <= 6; n++) IO.println(Math.log10(Math.pow(10, n))); }" },
);

// Task 7: the remaining exception gaps.
cases.push(
  { id: "G7-getSuppressed", group: "gaps", src: 'void main() { try { throw new RuntimeException("plain"); } catch (RuntimeException e) { IO.println(e.getSuppressed().length); } }' },
  { id: "G7-twr-both-throw", group: "gaps", src: 'void main() { class R implements AutoCloseable { public void close() { throw new IllegalStateException("close"); } } try (R r = new R()) { throw new RuntimeException("body"); } catch (RuntimeException e) { IO.println(e.getMessage() + " / " + e.getSuppressed().length); } }' },
  { id: "G7-joining", group: "gaps", src: 'void main() { IO.println(java.util.List.of("a", "b").stream().map(String::toUpperCase).collect(java.util.stream.Collectors.joining(", "))); }' },
  { id: "G7-array-store", group: "gaps", src: 'void main() { Object[] a = new String[2]; try { a[0] = 1; } catch (ArrayStoreException e) { IO.println("caught"); } }' },
  // G7-array-store's store only looks harmless because nothing reads the element back; reading it back
  // through the String[] traps, and no catch handles a trap.
  { id: "G7-array-store-read-back", group: "gaps", src: R`void main() {
    String[] s = new String[2];
    Object[] a = s;
    try {
        a[0] = 1;
        IO.println("stored");
    } catch (ArrayStoreException e) {
        IO.println("caught: " + e.getMessage());
    }
    try {
        String first = s[0];
        IO.println("read: " + first);
    } catch (RuntimeException e) {
        IO.println("read threw: " + e);
    }
    IO.println("after");
}
` },
  { id: "G7-negative-size", group: "gaps", src: "void main() { int n = -1; try { IO.println(new int[n].length); } catch (NegativeArraySizeException e) { IO.println(e.getMessage()); } }" },
  { id: "G7-system-exit", group: "gaps", src: 'void main() { IO.println("before"); System.exit(0); }' },
  // Index errors a first course meets outside arrays and strings (chapter 7 teaches ArrayList), found
  // missing their JDK text while doing Task 4, plus a cast whose operand is not a local variable, which
  // pins the second path teavm-0009 uses to find the cast value.
  { id: "G7-arraylist-get", group: "gaps", src: 'void main() { var l = new java.util.ArrayList<Integer>(java.util.List.of(1, 2)); try { IO.println(l.get(5)); } catch (IndexOutOfBoundsException e) { IO.println(e.getMessage()); } }' },
  { id: "G7-arraylist-set", group: "gaps", src: 'void main() { var l = new java.util.ArrayList<Integer>(java.util.List.of(1, 2)); try { IO.println(l.set(2, 9)); } catch (IndexOutOfBoundsException e) { IO.println(e.getMessage()); } }' },
  { id: "G7-arraylist-remove", group: "gaps", src: 'void main() { var l = new java.util.ArrayList<Integer>(java.util.List.of(1, 2)); try { IO.println(l.remove(-1)); } catch (IndexOutOfBoundsException e) { IO.println(e.getMessage()); } }' },
  { id: "G7-stringbuilder-charAt", group: "gaps", src: 'void main() { var b = new StringBuilder("abc"); try { IO.println(b.charAt(3)); } catch (IndexOutOfBoundsException e) { IO.println(e.getClass().getName() + ": " + e.getMessage()); } }' },
  { id: "G7-stringbuilder-deleteCharAt", group: "gaps", src: 'void main() { var b = new StringBuilder("abc"); try { IO.println(b.deleteCharAt(3)); } catch (IndexOutOfBoundsException e) { IO.println(e.getClass().getName() + ": " + e.getMessage()); } }' },
  { id: "G7-cast-temp", group: "gaps", src: 'void main() { try { IO.println((String) (Object) Integer.valueOf(4)); } catch (ClassCastException e) { IO.println(e.getMessage()); } }' },
  // Found while doing Task 5: the fork evaluates NaN < x and NaN <= x as true, so a comparison gives the
  // wrong answer, which is worse than a wrong message. And a -0.0 literal loses its sign.
  { id: "G7-nan-compare", group: "gaps", src: "void main() { double n = 0.0 / 0.0; double one = 1; IO.println(n < one); IO.println(n <= one); IO.println(n > one); IO.println(n >= one); IO.println(n == n); IO.println(n != n); IO.println(one < n); IO.println(Math.max(n, one)); }" },
  { id: "G7-negative-zero", group: "gaps", src: "void main() { double z = -0.0; IO.println(z); IO.println(1 / z); IO.println(0.0 == -0.0); }" },
  // Found while doing Task 6: Map.Entry cannot be named as a type on the fork ("cannot find symbol class
  // Entry"), so chapter 9's usual loop over entrySet() does not compile; and any @SuppressWarnings
  // annotation crashes the compiler.
  { id: "G7-map-entry", group: "gaps", src: 'void main() { var m = new java.util.TreeMap<String, Integer>(java.util.Map.of("a", 1, "b", 2)); for (java.util.Map.Entry<String, Integer> e : m.entrySet()) IO.println(e.getKey() + "=" + e.getValue()); }' },
  { id: "G7-suppress-warnings", group: "gaps", src: '@SuppressWarnings("unchecked") void main() { IO.println("ok"); }' },
);

// Task 7a, beyond the plan's list: the rest of what teavm-0012 fixes. Each StringBuilder call runs on a
// fresh builder, printed afterward, because most of these used to succeed silently and break the builder
// ("abc" plus a '\0'). An exit status other than 0 must end the program where it is called, skip the
// finally, and keep output that has no newline yet. A multi-dimensional array checks every size, left to
// right, only after evaluating them all.
cases.push(
  { id: "G7-arraylist-add", group: "gaps", src: 'void main() { var l = new java.util.ArrayList<Integer>(java.util.List.of(1, 2)); try { l.add(3, 9); } catch (IndexOutOfBoundsException e) { IO.println(e.getMessage()); } try { l.addAll(-1, java.util.List.of(9)); } catch (IndexOutOfBoundsException e) { IO.println(e.getMessage()); } IO.println(l); }' },
  { id: "G7-stringbuilder-ranges", group: "gaps", src: 'void t(java.util.function.Function<StringBuilder, Object> f) { var b = new StringBuilder("abc"); try { IO.println(f.apply(b)); } catch (IndexOutOfBoundsException e) { IO.println(e.getClass().getName() + ": " + e.getMessage()); } IO.println(b); } void main() { t(b -> { b.setCharAt(3, \'x\'); return b; }); t(b -> b.insert(4, \'x\')); t(b -> b.insert(-1, "x")); t(b -> b.insert(4, 5)); t(b -> b.delete(4, 5)); t(b -> b.replace(2, 1, "x")); t(b -> b.substring(2, 7)); t(b -> { b.setLength(-1); return b; }); }' },
  { id: "G7-negative-size-2d", group: "gaps", src: "void main() { int m = -5, n = -1; try { IO.println(new int[m][n].length); } catch (NegativeArraySizeException e) { IO.println(e.getMessage()); } try { IO.println(new int[0][n].length); } catch (NegativeArraySizeException e) { IO.println(e.getMessage()); } }" },
  { id: "G7-system-exit-status", group: "gaps", src: 'void main() { IO.print("kept"); try { System.exit(3); } finally { IO.println(" but finally ran"); } }' },
);

// Task 7a fix round 1: the textbook demo of NegativeArraySizeException never uses the array it creates.
// TeaVM's optimizer deleted such an unused new T[n] (one or more dimensions) before its size check could
// run, so the catch never ran and the uncaught form carried on to the next line.
cases.push(
  { id: "G7-negative-size-unused", group: "gaps", src: 'void main() { try { int[] a = new int[-5]; } catch (NegativeArraySizeException e) { IO.println("Caught: " + e); } int n = -2; try { var b = new int[2][n]; } catch (NegativeArraySizeException e) { IO.println(e); } for (int i = 1; i >= -1; i--) { try { String[] c = new String[i]; IO.println("made " + i); } catch (NegativeArraySizeException e) { IO.println(e.getMessage()); } } }' },
  { id: "G7-negative-size-unused-uncaught", group: "gaps", src: 'void main() { int[] a = new int[-5]; IO.println("after"); }' },
);

// Task 7b, beyond the plan's list. G7-nan-compare and G7-negative-zero start from constants, which javac
// and TeaVM fold while compiling; these take the same values at run time, the path the code generator
// fix covers. Nested library types and annotation types other than Map.Entry and @SuppressWarnings, and
// the common collectors in a program whose main is an instance void main().
cases.push(
  { id: "G7-nan-runtime", group: "gaps", src: "void main() { double n = Math.sqrt(-1), one = 1; float f = (float) n; if (n < one) IO.println(\"lt\"); else IO.println(\"not lt\"); if (n >= one) IO.println(\"ge\"); else IO.println(\"not ge\"); int i = 0; while (n < 10 && i < 3) i++; IO.println(i + \" \" + (n > one) + \" \" + (n <= one) + \" \" + (n == n) + \" \" + (f < 1f) + \" \" + (f >= 1f) + \" \" + (n < 0 ? \"neg\" : n >= 0 ? \"nonneg\" : \"nan\")); }" },
  { id: "G7-negative-zero-runtime", group: "gaps", src: "void main() { double[] a = { 0.0 }; double z = -a[0]; float f = -(float) a[0]; IO.println(z + \" \" + (1 / z) + \" \" + f + \" \" + Double.compare(z, 0.0) + \" \" + Double.valueOf(z).equals(0.0)); }" },
  { id: "G7-nested-types", group: "gaps", src: 'import java.util.*; import java.util.Map.Entry; void main() { var m = new HashMap<String, Integer>(Map.of("a", 3, "b", 1)); List<Entry<String, Integer>> l = new ArrayList<>(m.entrySet()); l.sort(Map.Entry.comparingByValue()); IO.println(l); Map.Entry<String, Integer> e = new AbstractMap.SimpleEntry<>("k", 1); IO.println(e.getKey() + "=" + e.getValue()); }' },
  { id: "G7-annotation-types", group: "gaps", src: '@interface Note { String value(); } @Note("main") @SuppressWarnings({ "unused", "unchecked" }) void main() { @SuppressWarnings("unused") int x = 1; IO.println("ok"); }' },
  { id: "G7-collectors", group: "gaps", src: 'import java.util.*; import java.util.stream.*; void main() { var words = List.of("a", "bb", "c"); IO.println(words.stream().map(String::toUpperCase).collect(Collectors.toList())); IO.println(words.stream().collect(Collectors.groupingBy(String::length))); IO.println(words.stream().collect(Collectors.counting())); }' },
);

// Final review (A11): every comparison teavm-0013's hunks touch, over values built at run time, so no
// compiler can fold them: NaN, -0.0, 0.0, 1, -1 and both infinities, as double and as float, each pair
// through all six operators as values, the four negated branches, && and || (as values and as branches),
// and a while loop whose condition is a comparison.
const cmp = (t) => R`static String cmp(${t} a, ${t} b) {
    boolean lt = a < b, gt = a > b, le = a <= b, ge = a >= b, eq = a == b, ne = a != b;
    boolean both = a <= b && a >= b, either = a < b || a > b;
    StringBuilder s = new StringBuilder();
    for (boolean v : new boolean[] { lt, gt, le, ge, eq, ne, both, either }) s.append(v ? '1' : '0');
    s.append(' ');
    if (!(a < b)) s.append('1'); else s.append('0');
    if (!(a > b)) s.append('1'); else s.append('0');
    if (!(a <= b)) s.append('1'); else s.append('0');
    if (!(a >= b)) s.append('1'); else s.append('0');
    if (a < b && !(a >= b)) s.append('1'); else s.append('0');
    if (!(a <= b) || !(a >= b)) s.append('1'); else s.append('0');
    int k = 0, m = 0;
    while (a < b && k < 3) k++;
    while (!(a > b) && m < 3) m++;
    return s.append(' ').append(k).append(m).toString();
}
`;
cases.push(
  { id: "G7-comparison-matrix", group: "gaps", src: R`static double[] base = { 0.0, 1.0, -1.0 };

${cmp("double")}
${cmp("float")}
void main() {
    double zero = base[0], one = base[1], minusOne = base[2];
    double[] d = { Math.sqrt(minusOne), -zero, zero, one, minusOne, one / zero, minusOne / zero };
    float[] f = new float[d.length];
    for (int i = 0; i < d.length; i++) f[i] = (float) d[i];
    for (int i = 0; i < d.length; i++) {
        for (int j = 0; j < d.length; j++) {
            IO.println(d[i] + " " + d[j] + ": " + cmp(d[i], d[j]) + " | " + cmp(f[i], f[j]));
        }
    }
}
` },
);

// Task 8: java.util.Random follows the algorithms its Javadoc states, so a seeded generator prints the
// JDK's numbers (TeaVM's own Random ignored its seed and drew from Math.random()).
cases.push(
  { id: "R8-default-random", group: "random", src: 'void main() { double d = Math.random(); var g = new java.util.Random(); int k = g.nextInt(10); IO.println(d >= 0 && d < 1 && k >= 0 && k < 10); }' },
  { id: "R8-seeded-random", group: "random", src: 'void main() { var r = new java.util.Random(42); for (int i = 0; i < 5; i++) IO.print(r.nextInt(100) + " "); IO.println(); IO.println(r.nextInt()); IO.println(r.nextLong()); IO.println(r.nextDouble()); IO.println(r.nextFloat()); IO.println(r.nextBoolean()); IO.println(r.nextGaussian()); IO.println(r.nextInt(5, 10)); r.setSeed(7); IO.println(r.nextInt(1 << 20)); }' },
  // Random(long)'s Javadoc: new Random(seed) is equivalent to new Random() then setSeed(seed), so a
  // subclass's overriding setSeed runs from the constructor. The pinned JDK calls it once from each
  // constructor (the no-argument one with a seed nobody can predict, hence "default").
  { id: "R8-setseed-override", group: "random", src: 'void main() { class R extends java.util.Random { R() { super(); } R(long seed) { super(seed); } @Override public void setSeed(long seed) { IO.println("setSeed(" + (seed == 42 || seed == 7 ? String.valueOf(seed) : "default") + ")"); super.setSeed(seed); } } var r = new R(42); IO.println(r.nextInt(100)); r.setSeed(7); IO.println(r.nextInt(100)); new R(); IO.println("done"); }' },
  // ThreadLocalRandom extends Random and its setSeed throws, so its one instance must still build now that
  // Random's constructors call setSeed; a later setSeed still throws, as on the JDK.
  { id: "R8-threadlocal-random", group: "random", src: 'import java.util.concurrent.ThreadLocalRandom; void main() { int k = ThreadLocalRandom.current().nextInt(1, 7); IO.println(k >= 1 && k < 7); try { ThreadLocalRandom.current().setSeed(1); IO.println("no throw"); } catch (UnsupportedOperationException e) { IO.println("setSeed: " + e); } }' },
  // Two generators made with new Random() in one run must not share their numbers: the JDK prints true.
  { id: "R8-two-default-randoms", group: "random", src: 'void main() { var a = new java.util.Random(); var b = new java.util.Random(); IO.println(a.nextLong() != b.nextLong()); }' },
);

// Task 11: StrictMath.log follows fdlibm, as StrictMath's Javadoc requires, so nextGaussian (which calls
// it) prints the JDK's numbers. Most cases fold thousands of results into one hash, so a single last-bit
// difference anywhere shows; a few instead print each of a handful of values on its own line.
cases.push(
  { id: "R11-strictmath-log", group: "fdlibm", src: 'void main() { long h = 17; for (int i = 1; i <= 20000; i++) { double x = i * 0.0137 + 1e-300 * i; h = 31 * h + Double.doubleToLongBits(StrictMath.log(x)); } IO.println(h); IO.println(StrictMath.log(0.0)); IO.println(StrictMath.log(-1.0)); IO.println(StrictMath.log(Double.MIN_VALUE)); IO.println(StrictMath.log(Double.MAX_VALUE)); IO.println(StrictMath.log(1.0)); IO.println(StrictMath.log(Math.E)); }' },
  { id: "R11-gaussian", group: "fdlibm", src: 'void main() { var r = new java.util.Random(2026); long h = 17; for (int i = 0; i < 20000; i++) h = 31 * h + Double.doubleToLongBits(r.nextGaussian()); IO.println(h); }' },
  // e_log.c's near-1 and subnormal branches, which the sweep above never reaches (review of Task 11). The
  // review gave 2^-52 and 2^-53 as the literals 0x1p-52 and 0x1p-53; here they are 1.0 / (1L << 52) and half
  // of it, the same values, because the fork compiles every hexadecimal floating-point literal to NaN (a
  // separate difference, not log's), which would have kept those inputs from ever reaching log.
  { id: "R11-strictmath-log-edges", group: "fdlibm", src: 'void main() { double u = 1.0 / (1L << 52); long h = 17; for (int j = 1; j <= 4000; j++) { h = 31 * h + Double.doubleToLongBits(StrictMath.log(1 + j * u)); h = 31 * h + Double.doubleToLongBits(StrictMath.log(1 - j * (u / 2))); h = 31 * h + Double.doubleToLongBits(StrictMath.log(Double.MIN_VALUE * j)); } IO.println(h); }' },
  // Math.log uses the same port (D33): on the pinned JDK it equals fdlibm on every input checked.
  { id: "R11-math-log", group: "fdlibm", src: 'void main() { long h = 17; for (int i = 1; i <= 20000; i++) h = 31 * h + Double.doubleToLongBits(Math.log(i * 0.0137)); IO.println(h); IO.println(Math.log(10)); IO.println(Math.log(0.5)); }' },
  // Fix round 2 finding 1: the fork compiles every hexadecimal floating-point literal to NaN (the JDK
  // prints 1.0 for 0x1p0), and Double.parseDouble/Double.valueOf reject hex strings; pins the literals,
  // the arithmetic done with them, and the parse.
  { id: "R11-hex-float-literal", group: "fdlibm", src: 'void main() { double a = 0x1p0, b = 0x1.8p1, c = 0x1p-52; IO.println(a); IO.println(b); IO.println(c); try { IO.println(Double.parseDouble("0x1p4")); } catch (NumberFormatException e) { IO.println("NFE " + e.getMessage()); } }' },
  // Fix round 2 finding 2: Math.ulp(1.0) is wrong on the fork by many orders of magnitude; pins ulp at a
  // few representative values (1.0, 1e10, a float, and zero) so any of them that already match stay pinned.
  { id: "R11-math-ulp", group: "fdlibm", src: 'void main() { IO.println(Math.ulp(1.0)); IO.println(Math.ulp(1e10)); IO.println(Math.ulp(1.0f)); IO.println(Math.ulp(0.0)); }' },
);

// Plan 4 Task 6, S1 (D46): TeaVM's JavaScript interop (org.teavm.jso) is not in the JDK, so javac refuses
// it there; the fork must refuse it too, or a box could run JavaScript. One case per way in: the
// annotation imported and fully qualified, and two other packages, so a removal that leaves a package
// behind still shows.
cases.push(
  { id: "S1-jsbody-import", group: "S1", src: 'import org.teavm.jso.JSBody; class Net { @JSBody(script = "return 42;") static native int probe(); } void main() { IO.println(Net.probe()); }' },
  { id: "S1-jsbody-qualified", group: "S1", src: 'class Net { @org.teavm.jso.JSBody(script = "return 42;") static native int probe(); } void main() { IO.println(Net.probe()); }' },
  { id: "S1-browser-window", group: "S1", src: "void main() { IO.println(org.teavm.jso.browser.Window.current() != null); }" },
  { id: "S1-websocket", group: "S1", src: "void main() { org.teavm.jso.websocket.WebSocket s = null; IO.println(s == null); }" },
);

// Plan 4 Task 6, D86: a box's program talks to nobody, so java.net must fail as it does on a computer
// with no network. A .invalid host never resolves (RFC 6761), so the JDK's answer is the offline one:
// java.net.UnknownHostException naming the host, which a program can catch.
cases.push(
  { id: "D86-url-input-stream", group: "D86", src: 'void main() { try { new java.net.URL("http://nonexistent.invalid/").openConnection().getInputStream(); IO.println("connected"); } catch (java.io.IOException e) { IO.println(e.getClass().getName() + ": " + e.getMessage()); } }' },
  { id: "D86-response-code", group: "D86", src: 'void main() { try { var c = (java.net.HttpURLConnection) new java.net.URL("http://nonexistent.invalid/data?id=1").openConnection(); c.setRequestMethod("GET"); IO.println(c.getResponseCode()); } catch (java.io.IOException e) { IO.println(e.getClass().getName() + ": " + e.getMessage()); } }' },
  { id: "D86-unknown-host-by-name", group: "D86", src: 'void main() { try (var in = new java.net.URL("https://nonexistent.invalid/data.txt").openStream()) { IO.println(in.read()); } catch (java.net.UnknownHostException e) { IO.println("no such host: " + e.getMessage()); } catch (java.io.IOException e) { IO.println("other: " + e); } IO.println("after"); }' },
);

// Plan 4b Task 7, D99: getOutputStream() on a connection whose doOutput is false (the default) is refused
// before any connection is tried, so the JDK's answer is the same offline as online. A program that forgets
// setDoOutput(true), or sets the method to POST and expects that to be enough, must see that answer, not the
// offline one. The control sets doOutput and still fails offline.
cases.push(
  { id: "D99-output-stream-do-output-false", group: "D99", src: 'void main() { try { new java.net.URL("http://nonexistent.invalid/").openConnection().getOutputStream(); IO.println("connected"); } catch (java.io.IOException e) { IO.println(e.getClass().getName() + ": " + e.getMessage()); } }' },
  { id: "D99-output-stream-post-without-do-output", group: "D99", src: 'void main() { try { var c = (java.net.HttpURLConnection) new java.net.URL("http://nonexistent.invalid/").openConnection(); c.setRequestMethod("POST"); c.getOutputStream(); IO.println("connected"); } catch (java.io.IOException e) { IO.println(e.getClass().getName() + ": " + e.getMessage()); } }', note: "the method set to POST without doOutput" },
  { id: "D99-output-stream-do-output-true-still-offline", group: "D99", src: 'void main() { try { var c = new java.net.URL("http://nonexistent.invalid/").openConnection(); c.setDoOutput(true); c.getOutputStream(); IO.println("connected"); } catch (java.io.IOException e) { IO.println(e.getClass().getName() + ": " + e.getMessage()); } }', note: "control: with doOutput set, the call is not refused for it" },
  { id: "D99-output-stream-catch-types", group: "D99", src: 'void main() { try { new java.net.URL("http://nonexistent.invalid/").openConnection().getOutputStream(); } catch (java.net.ProtocolException e) { IO.println("protocol"); } catch (java.net.UnknownHostException e) { IO.println("unknown host"); } catch (java.io.IOException e) { IO.println("other: " + e.getClass().getName()); } }', note: "the catch clauses a program writes, in order" },
  { id: "D99-output-stream-do-output-false-address", group: "D99", src: 'void main() { try { new java.net.URL("http://127.0.0.1:1/").openConnection().getOutputStream(); IO.println("connected"); } catch (java.io.IOException e) { IO.println(e.getClass().getName() + ": " + e.getMessage()); } }', note: "the same refusal for an address literal, whose offline answer differs from a host name's" },
);

// Plan 4b Task 7, D100: a box has no computer of its own, so nothing listens on its loopback. Only the two
// names D100 gives, 127.0.0.1 and localhost, on port 1, where nothing listens on the machine that runs the
// JDK either; every other address answers as before (D92).
cases.push(
  { id: "D100-loopback-input-stream", group: "D100", src: 'void main() { try { new java.net.URL("http://127.0.0.1:1/").openConnection().getInputStream(); IO.println("connected"); } catch (java.io.IOException e) { IO.println(e.getClass().getName() + ": " + e.getMessage()); } }' },
  { id: "D100-localhost-input-stream", group: "D100", src: 'void main() { try { new java.net.URL("http://localhost:1/").openConnection().getInputStream(); IO.println("connected"); } catch (java.io.IOException e) { IO.println(e.getClass().getName() + ": " + e.getMessage()); } }' },
  { id: "D100-loopback-response-code", group: "D100", src: 'void main() { try { var c = (java.net.HttpURLConnection) new java.net.URL("http://127.0.0.1:1/data?id=1").openConnection(); c.setRequestMethod("GET"); IO.println(c.getResponseCode()); } catch (java.io.IOException e) { IO.println(e.getClass().getName() + ": " + e.getMessage()); } }' },
  { id: "D100-loopback-catch-types", group: "D100", src: 'void main() { for (String host : new String[] {"127.0.0.1", "localhost"}) { try { new java.net.URL("http://" + host + ":1/").openStream(); } catch (java.net.UnknownHostException e) { IO.println(host + ": unknown host"); } catch (java.net.ConnectException e) { IO.println(host + ": refused " + (e instanceof java.net.SocketException)); } catch (java.io.IOException e) { IO.println(host + ": other " + e.getClass().getName()); } } }', note: "the catch clauses a program writes, in order, for both names" },
  { id: "D100-loopback-https", group: "D100", src: 'void main() { try { new java.net.URL("https://127.0.0.1:1/").openConnection().getInputStream(); IO.println("connected"); } catch (java.io.IOException e) { IO.println(e.getClass().getName() + ": " + e.getMessage()); } }', note: "https goes through the same connection class" },
  { id: "D100-loopback-output-stream-do-output-true", group: "D100", src: 'void main() { try { var c = new java.net.URL("http://127.0.0.1:1/").openConnection(); c.setDoOutput(true); c.getOutputStream(); IO.println("connected"); } catch (java.io.IOException e) { IO.println(e.getClass().getName() + ": " + e.getMessage()); } }', note: "getOutputStream with doOutput set is the other way to connect" },
  { id: "D100-localhost-connect-is-socket-exception", group: "D100", src: 'void main() { try { new java.net.URL("http://localhost:1/").openConnection().connect(); IO.println("connected"); } catch (java.net.ConnectException e) { IO.println("ConnectException, a SocketException: " + (e instanceof java.net.SocketException)); } catch (java.io.IOException e) { IO.println("other: " + e.getClass().getName()); } }', note: "catches ConnectException and asks whether it is also a SocketException" },
);

export const byId = Object.fromEntries(cases.map((c) => [c.id, c]));
