# interface with default method
interface Gr { default String hi() { return "hi"; } }

# change default body only
interface Gr { default String hi() { return "hello"; } }

# add abstract method
interface Gr { default String hi() { return "hello"; } int n(); }

# enum with a constructor and field
enum Pl { A(1), B(2); final int w; Pl(int w) { this.w = w; } }

# change enum constructor body only
enum Pl { A(1), B(2); final int w; Pl(int w) { this.w = w + 0; } }

# change enum constant argument only
enum Pl { A(1), B(3); final int w; Pl(int w) { this.w = w + 0; } }

# add enum constant
enum Pl { A(1), B(3), C(4); final int w; Pl(int w) { this.w = w + 0; } }

# record with compact constructor
record Rg(int lo, int hi) { Rg { if (lo > hi) throw new IllegalArgumentException("bad"); } }

# change compact constructor body
record Rg(int lo, int hi) { public Rg { if (lo >= hi) throw new IllegalArgumentException("bad"); } }

# invalid record use
new Rg(3, 1)

# record add static method
record Rg(int lo, int hi) { public Rg { if (lo >= hi) throw new IllegalArgumentException("bad"); } static int z() { return 0; } }

# record rename component
record Rg(int low, int hi) { public Rg { if (low >= hi) throw new IllegalArgumentException("bad"); } static int z() { return 0; } }

# record change component type
record Rg(long low, int hi) { public Rg { if (low >= hi) throw new IllegalArgumentException("bad"); } static int z() { return 0; } }

# class with instance holding subclass, variable of base type
class Base { int f() { return 1; } public String toString() { return "Base"; } }

# subclass
class Derived extends Base { int f() { return 2; } public String toString() { return "Derived"; } }

# variable of base type holding Derived
Base bv = new Derived();

# modify Base body only
class Base { int f() { return 3; } public String toString() { return "Base"; } }

# bv
bv

# bv.f()
bv.f()

# replace Base with new member
class Base { int f() { return 3; } int g() { return 0; } public String toString() { return "Base"; } }

# bv
bv

# two variable declarations of same name on one line
int tw = 1; int tw = 2;

# a variable and a method on one line
int vm = 1; int vmm() { return vm; }

# class and variable on one line
class Cv { public String toString() { return "Cv"; } } Cv cv = new Cv();

# drop a method that a class depends on
int dm1() { return 1; }

# class using dm1
class UDm { int f() { return dm1(); } }

# drop dm1
/drop dm1

# call
new UDm().f()

# redeclare dm1
int dm1() { return 5; }

# call again
new UDm().f()

# drop the class a method depends on
class DC { int v = 1; }

# method using DC
int udc() { return new DC().v; }

# drop DC
/drop DC

# call udc
udc()

# redeclare DC
class DC { int v = 1; }

# udc again
udc()

# overwrite a method after a drop
int rd() { return 1; }

# drop rd
/drop rd

# create again
int rd() { return 2; }

# redeclare an existing method as a variable name
int rd = 3;

# vars list
/vars

# methods list
/methods

# types list
/types
