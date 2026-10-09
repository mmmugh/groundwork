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
package foundations.scratchpad;

import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;

/**
 * The parts of a class file that a JVM redefinition may not change (DERIVATION.md, R1): the JVM TI specification says
 * a redefinition "must not add, remove or rename fields or methods, change the signatures of methods, change
 * modifiers, or change inheritance", nor change the NestHost, NestMembers, Record or PermittedSubclasses attributes.
 * Two class files with the same shape could be redefined one into the other; method bodies, the constant pool and
 * other attributes are left out on purpose. The class file layout is the one in the JVM specification, chapter 4.
 */
final class ClassShape {
  private ClassShape() {}

  /** A canonical text of the shape, or null when the bytes are not a class file this reader understands. */
  static String of(byte[] bytes) {
    try {
      return read(new Reader(bytes));
    } catch (RuntimeException malformed) {
      return null;
    }
  }

  /** Whether mutable static state lives in the class: a static field that is not final. */
  static boolean holdsStaticState(byte[] bytes) {
    try {
      Reader in = new Reader(bytes);
      String[] pool = constantPool(in);
      in.u2();
      in.u2();
      in.u2();
      in.skip(2 * in.u2());
      int fields = in.u2();
      for (int i = 0; i < fields; i++) {
        int access = in.u2();
        in.u2();
        in.u2();
        boolean constant = false;
        int attributes = in.u2();
        for (int a = 0; a < attributes; a++) {
          String name = pool[in.u2()];
          int length = in.u4();
          if ("ConstantValue".equals(name)) constant = true;
          in.skip(length);
        }
        if ((access & 0x0008) != 0 && (access & 0x0010) == 0 && !constant) return true;
      }
      return false;
    } catch (RuntimeException malformed) {
      return true;
    }
  }

  private static String read(Reader in) {
    String[] pool = constantPool(in);
    StringBuilder shape = new StringBuilder();
    shape.append("access ").append(in.u2());
    shape.append(" this ").append(pool[in.u2()]);
    int superIndex = in.u2();
    shape.append(" super ").append(superIndex == 0 ? "-" : pool[superIndex]);
    List<String> interfaces = new ArrayList<>();
    int count = in.u2();
    for (int i = 0; i < count; i++) interfaces.add(pool[in.u2()]);
    shape.append(" implements ").append(interfaces);
    List<String> fields = new ArrayList<>();
    count = in.u2();
    for (int i = 0; i < count; i++) {
      int access = in.u2();
      fields.add(access + " " + pool[in.u2()] + " " + pool[in.u2()]);
      skipAttributes(in);
    }
    shape.append(" fields ").append(fields);
    TreeSet<String> methods = new TreeSet<>();
    count = in.u2();
    for (int i = 0; i < count; i++) {
      int access = in.u2();
      methods.add(pool[in.u2()] + pool[in.u2()] + " " + access);
      skipAttributes(in);
    }
    shape.append(" methods ").append(methods);
    count = in.u2();
    for (int i = 0; i < count; i++) {
      String name = pool[in.u2()];
      int length = in.u4();
      int end = in.at + length;
      switch (name) {
        case "NestHost" -> shape.append(" nesthost ").append(pool[in.u2()]);
        case "NestMembers", "PermittedSubclasses" -> {
          List<String> classes = new ArrayList<>();
          int n = in.u2();
          for (int k = 0; k < n; k++) classes.add(pool[in.u2()]);
          shape.append(' ').append(name).append(' ').append(classes);
        }
        case "Record" -> {
          List<String> components = new ArrayList<>();
          int n = in.u2();
          for (int k = 0; k < n; k++) {
            components.add(pool[in.u2()] + " " + pool[in.u2()]);
            skipAttributes(in);
          }
          shape.append(" record ").append(components);
        }
        default -> { }
      }
      in.at = end;
    }
    return shape.toString();
  }

  /** Reads the constant pool; entry i holds the text of a Utf8 entry, or the name of a Class entry. */
  private static String[] constantPool(Reader in) {
    if (in.u4() != 0xCAFEBABE) throw new IllegalArgumentException("not a class file");
    in.u2();
    in.u2();
    int count = in.u2();
    String[] text = new String[count];
    int[] classNames = new int[count];
    for (int i = 1; i < count; i++) {
      int tag = in.u1();
      switch (tag) {
        case 1 -> text[i] = in.utf(in.u2());
        case 3, 4 -> in.skip(4);
        case 5, 6 -> { in.skip(8); i++; }
        case 7 -> classNames[i] = in.u2();
        case 8, 16, 19, 20 -> in.skip(2);
        case 9, 10, 11, 12, 17, 18 -> in.skip(4);
        case 15 -> in.skip(3);
        default -> throw new IllegalArgumentException("constant pool tag " + tag);
      }
    }
    for (int i = 1; i < count; i++) if (classNames[i] != 0) text[i] = text[classNames[i]];
    return text;
  }

  private static void skipAttributes(Reader in) {
    int count = in.u2();
    for (int i = 0; i < count; i++) {
      in.u2();
      in.skip(in.u4());
    }
  }

  private static final class Reader {
    final byte[] bytes;
    int at;

    Reader(byte[] bytes) { this.bytes = bytes; }

    int u1() { return bytes[at++] & 0xff; }
    int u2() { return (u1() << 8) | u1(); }
    int u4() { return (u2() << 16) | u2(); }
    void skip(int n) {
      if (n < 0 || at + n > bytes.length) throw new IllegalArgumentException("truncated class file");
      at += n;
    }

    /** A "modified UTF-8" string (JVMS 4.4.7), decoded the simple way: names in class files are rarely exotic. */
    String utf(int length) {
      StringBuilder out = new StringBuilder(length);
      int end = at + length;
      while (at < end) {
        int b = u1();
        if (b < 0x80) out.append((char) b);
        else if ((b & 0xe0) == 0xc0) out.append((char) (((b & 0x1f) << 6) | (u1() & 0x3f)));
        else out.append((char) (((b & 0x0f) << 12) | ((u1() & 0x3f) << 6) | (u1() & 0x3f)));
      }
      return out.toString();
    }
  }
}
