# G26: feedback after the reader replaces System.out, and output to System.err
java.io.PrintStream keep = System.out

System.err.println("to err")

System.setOut(new java.io.PrintStream(new java.io.ByteArrayOutputStream()))

int after = 5

System.out.println("hidden")

keep.println("kept")

System.setOut(keep)

int back = 6
