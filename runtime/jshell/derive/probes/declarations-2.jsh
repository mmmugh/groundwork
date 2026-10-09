# class create
class Dog { String name = "Rex"; }

# class use
new Dog().name

# class change only a method body (add method first)
class Dog { String name = "Rex"; String speak() { return "woof"; } }

# change only method body
class Dog { String name = "Rex"; String speak() { return "bark"; } }

# identical redefine
class Dog { String name = "Rex"; String speak() { return "bark"; } }

# add a field
class Dog { String name = "Rex"; int age = 3; String speak() { return "bark"; } }

# add a method
class Dog { String name = "Rex"; int age = 3; String speak() { return "bark"; } int years() { return age * 7; } public String toString() { return "Dog"; } }

# variable holding an instance of the class
Dog d = new Dog();

# redefine class dog with another body
class Dog { String name = "Max"; }

# what is d now
d

# d name
d.name

# interface
interface Shape { double area(); }

# redefine interface body change
interface Shape { double area(); double perimeter(); }

# class implementing interface
class Sq implements Shape { public double area() { return 1; } public double perimeter() { return 4; } }

# redefine the interface again, Sq depends
interface Shape { double area(); }

# Sq still valid
new Sq().area()

# enum
enum Color { RED, GREEN }

# use enum
Color.RED

# enum add constant
enum Color { RED, GREEN, BLUE }

# enum with body
enum Planet { EARTH(1.0); final double m; Planet(double m) { this.m = m; } }

# record
record Point(int x, int y) {}

# record use
new Point(1, 2)

# record change components
record Point(int x, int y, int z) {}

# record only a method body
record Point(int x, int y, int z) { int sum() { return x + y + z; } }

# record method body change
record Point(int x, int y, int z) { int sum() { return x + y; } }

# record generic
record Box<T>(T value) {}

# record use generic
new Box<>("a")

# annotation type
@interface Marker {}

# annotation with element
@interface Marker { String value() default ""; }

# generic class
class Cell<T> { T v; }

# generic class change bound
class Cell<T extends Number> { T v; }

# nested class
class Outer { class Inner {} static class SNested {} }

# nested interface and enum
class Outer2 { interface I {} enum E { A } record R(int a) {} }

# class extends another snippet class
class Animal { String sound() { return "..."; } }

# subclass
class Cat extends Animal { String sound() { return "meow"; } }

# subclass use
new Cat().sound()

# redefine Animal
class Animal { String sound() { return "x"; } String name() { return "a"; } }

# Cat still fine
new Cat().sound()

# class extends undeclared class
class Puppy extends Dogg {}

# declare Dogg
class Dogg {}

# class using undeclared class in a field
class Owner { Pet pet; }

# declare Pet
class Pet {}

# class using undeclared method
class Calc { int f() { return g(); } }

# declare g
int g() { return 1; }

# new Calc
new Calc().f()

# class with compile error
class Bad { int f() { return "s"; } }

# class final
final class Fin {}

# abstract class
abstract class Abs { abstract int f(); }

# class public
public class Pub {}

# class static
static class St {}

# class private
private class Pr {}

# sealed
sealed interface S permits A1, B1 {}

# permit members
record A1() implements S {}

# permit B1
record B1() implements S {}

# class with main
class Main { public static void main(String[] a) { System.out.println("m"); } }

# call main
Main.main(null)

# class with static field
class Counter { static int n = 0; }

# class with constructor
class P { int a; P(int a) { this.a = a; } }

# new P without args
new P()

# new P
new P(3).a

# redefine P default ctor
class P { int a; }

# interface default method
interface Greeter { default String hi() { return "hi"; } }

# interface static method
interface Util { static int one() { return 1; } }

# class with the name of an existing variable
int Counter2 = 4;

# class named Counter2
class Counter2 {}

# enum redefine as class
class Color {}

# variable of enum type
Color c = null;
