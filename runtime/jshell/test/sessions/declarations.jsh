# Declarations and their feedback in normal mode (DERIVATION.md F1 to F7, R1, R2).
int square(int n) { return n * n; }

square(4)

int square(int n) { return n * n * n; }

square(2)

long square(int n) { return n; }

int square(int a, int b) { return a * b; }

int square(String s) { return s.length(); }

<T> T first(java.util.List<T> xs) { return xs.get(0); }

int sum(int... xs) { int t = 0; for (int x : xs) t += x; return t; }

void hi() { System.out.println("hi"); }

hi()

int usesX() { return x + 1; }

usesX()

int x = 5

usesX()

int callsFoo() { return foo() * 2; }

int foo() { return 21; }

callsFoo()

int foo() { return 4; }

callsFoo()

int three() { return aa + bb() + cc; }

class Dog { String name; Dog(String n) { name = n; } String speak() { return name + " barks"; } }

class Dog { String name; Dog(String n) { name = n; } String speak() { return name + " woofs"; } }

class Dog { String name; int age; Dog(String n) { name = n; } String speak() { return name + "!"; } }

interface Shape { double area(); }

record Point(int x, int y) {}

record Point(int x, int y) { int sum() { return x + y; } }

record Point(int x, int y, int z) {}

enum Color { RED, GREEN }

enum Color { RED, GREEN, BLUE }

@interface Marker {}

class Puppy extends Dogg {}

class Dogg {}

class Calc { int g2() { return g() * 2; } }

class Gen<T> { T v; }

class Gen<U> { U v; }

class Kind { int f() { return 1; } }

class Kind extends Object { int f() { return 2; } }

class Kind { int f() { return 2; } int g() { return 3; } }

import java.util.function.*;

# A lambda prints as its hidden class and identity hash, which differ from run to run, so it is assigned in a block.
Function<Integer, Integer> inc;

{ inc = n -> n + 1; }

inc.apply(41)

int n = 5

String n = "now a string"

n

class Box { int v = 1; public String toString() { return "Box" + v; } }

Box b = new Box()

#! engine
class Box { int v = 2; public String toString() { return "Box" + v; } }

#! engine
b

class Counter { static int made = 0; Counter() { made++; } }

# An object without its own toString prints its identity hash, which differs from run to run.
new Counter() != null

#! engine
class Counter { static int made = 0; Counter() { made += 2; } }

#! engine
Counter.made
