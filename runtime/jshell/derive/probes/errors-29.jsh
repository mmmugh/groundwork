# deprecated for removal constructor
Integer boxed = new Integer(5);

# same in a method
void nw() { Integer b = new Integer(5); }

# runFinalization for removal
System.runFinalization();

# suspend deprecated for removal
Thread.currentThread().getName()

# user deprecated forRemoval used in method
@Deprecated(forRemoval=true) int oldv() { return 1; }

# call from a method
int callold() { return oldv(); }

# call alone
oldv()

# user deprecated class
@Deprecated(forRemoval=true) class OldC { }

# use class
OldC oc = null;

# warning plus error in one snippet
oldv() + "a" + foo

# warning then valid value on next line
oldv() + 1
