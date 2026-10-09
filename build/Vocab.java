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
import com.sun.source.tree.*;
import com.sun.source.util.*;
import java.io.IOException;
import java.net.URI;
import java.util.*;
import javax.lang.model.element.*;
import javax.tools.*;

/** What one compiled box uses, resolved through javac's own syntax tree (D4): every Tree.Kind that
 *  appears, every method, constructor or field the program's code resolves to (as
 *  "&lt;owner qualified name&gt;#&lt;name&gt;"), every library type it names, and the modifiers/keywords
 *  the course polices. Names the program declares itself never count. */
record Vocab(Set<String> kinds, Set<String> members, Set<String> types, Set<String> keywords) {

  /** No vocabulary at all: the starting point union folds onto. */
  static final Vocab EMPTY = new Vocab(Set.of(), Set.of(), Set.of(), Set.of());

  static Vocab of(String source) throws BuildError {
    JavaCompiler javac = ToolProvider.getSystemJavaCompiler();
    var diags = new DiagnosticCollector<JavaFileObject>();
    JavaFileObject src = new SimpleJavaFileObject(URI.create("string:///Main.java"), JavaFileObject.Kind.SOURCE) {
      @Override public CharSequence getCharContent(boolean ignore) { return source; }
    };
    var task = (JavacTask) javac.getTask(null, null, diags, List.of("--release", "25", "-proc:none"), null, List.of(src));
    Iterable<? extends CompilationUnitTree> units;
    try { units = task.parse(); task.analyze(); } catch (IOException e) { throw new BuildError(e.getMessage()); }
    if (diags.getDiagnostics().stream().anyMatch(d -> d.getKind() == Diagnostic.Kind.ERROR)) throw new BuildError("does not compile");
    Trees trees = Trees.instance(task);
    var own = new HashSet<Element>();       // the program's own types: their members never count
    var v = new Vocab(new TreeSet<>(), new TreeSet<>(), new TreeSet<>(), new TreeSet<>());
    for (CompilationUnitTree unit : units) {
      new TreePathScanner<Void, Void>() {
        @Override public Void visitClass(ClassTree t, Void x) { own.add(trees.getElement(getCurrentPath())); return super.visitClass(t, x); }
      }.scan(unit, null);
      new TreePathScanner<Void, Void>() {
        @Override public Void scan(Tree t, Void x) { if (t != null) v.kinds().add(t.getKind().name()); return super.scan(t, x); }
        @Override public Void visitModifiers(ModifiersTree t, Void x) {
          // A compact source file's implicit class carries a compiler-synthesized "final" with no real source
          // position (NOPOS, -1): skip a ModifiersTree the author did not write.
          if (trees.getSourcePositions().getStartPosition(unit, t) >= 0)
            for (Modifier m : t.getFlags()) v.keywords().add(m.toString());
          return super.visitModifiers(t, x);
        }
        @Override public Void visitVariable(VariableTree t, Void x) {
          // After analyze(), var's type tree prints the inferred type, so read the declaration's own text.
          var sp = trees.getSourcePositions();
          long start = sp.getStartPosition(unit, t), end = sp.getEndPosition(unit, t);
          if (start >= 0 && end > start) {
            String decl = source.substring((int) start, (int) Math.min(end, source.length()));
            if (decl.matches("(?s)(?:[\\w@]+\\s+)*var\\s+" + java.util.regex.Pattern.quote(t.getName().toString()) + "\\b.*"))
              v.keywords().add("var");
          }
          return super.visitVariable(t, x);
        }
        @Override public Void visitMethodInvocation(MethodInvocationTree t, Void x) { member(); return super.visitMethodInvocation(t, x); }
        @Override public Void visitNewClass(NewClassTree t, Void x) { member(); return super.visitNewClass(t, x); }
        @Override public Void visitMemberSelect(MemberSelectTree t, Void x) { member(); type(); return super.visitMemberSelect(t, x); }
        @Override public Void visitIdentifier(IdentifierTree t, Void x) { member(); type(); return super.visitIdentifier(t, x); }
        void member() {
          // A compact source file's implicit class carries an implicit no-arg constructor whose body is a
          // synthesized super() call with no real source position (NOPOS, -1): skip a call the author did not
          // write, the same way visitModifiers skips the implicit class's synthesized "final" above.
          if (trees.getSourcePositions().getEndPosition(unit, getCurrentPath().getLeaf()) < 0) return;
          Element e = trees.getElement(getCurrentPath());
          if (e == null) return;
          if (e.getKind().isField() || e.getKind() == ElementKind.METHOD || e.getKind() == ElementKind.CONSTRUCTOR) {
            Element owner = e.getEnclosingElement();
            if (owner instanceof TypeElement te && !isOwn(te)) v.members().add(te.getQualifiedName() + "#" + e.getSimpleName());
          }
        }
        void type() {
          Element e = trees.getElement(getCurrentPath());
          if (e instanceof TypeElement te && !isOwn(te)) v.types().add(te.getQualifiedName().toString());
        }
        boolean isOwn(Element e) { for (Element o = e; o != null; o = o.getEnclosingElement()) if (own.contains(o)) return true; return false; }
      }.scan(unit, null);
    }
    return v;
  }

  /** The union of this vocabulary and other's. */
  Vocab union(Vocab other) {
    var k = new TreeSet<>(kinds); k.addAll(other.kinds());
    var m = new TreeSet<>(members); m.addAll(other.members());
    var t = new TreeSet<>(types); t.addAll(other.types());
    var w = new TreeSet<>(keywords); w.addAll(other.keywords());
    return new Vocab(k, m, t, w);
  }

  /** Every item this vocabulary uses that known does not have, sorted, each as "kind X",
   *  "member &lt;owner&gt;#&lt;name&gt;", "type X" or "keyword X". */
  List<String> beyond(Vocab known) {
    var items = new TreeSet<String>();
    for (String s : kinds) if (!known.kinds().contains(s)) items.add("kind " + s);
    for (String s : members) if (!known.members().contains(s)) items.add("member " + s);
    for (String s : types) if (!known.types().contains(s)) items.add("type " + s);
    for (String s : keywords) if (!known.keywords().contains(s)) items.add("keyword " + s);
    return new ArrayList<>(items);
  }
}
