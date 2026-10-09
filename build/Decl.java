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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/** A box's declaration from _boxes.json: the exemptions the author claims (it raises, it never compiles,
 *  its output varies, it is a syntax reference with nothing to run) and, for a runnable box, its typed
 *  stdin. Boxes.validate is what enforces the rules below; this class only knows how to read one entry. */
record Decl(boolean reference, String raises, String compileError, boolean varies, List<String> stdin, String why) {

  /** A box with no entry in _boxes.json at all. */
  static final Decl EMPTY = new Decl(false, null, null, false, List.of(), null);

  private static final Set<String> KEYS = Set.of("reference", "raises", "compileError", "varies", "stdin", "why");
  private static final Pattern RAISES = Pattern.compile("[a-z][\\w.]*\\.[A-Z]\\w*");

  /** Parses one _boxes.json entry, enforcing every rule Boxes.validate reports. Throws BuildError, prefixed
   *  with "<id>: ", on the first violation found. */
  static Decl from(String id, Object json) throws BuildError {
    if (!(json instanceof Map<?, ?> raw)) throw new BuildError(id + ": expected an object");

    for (Object k : raw.keySet()) {
      String key = String.valueOf(k);
      if (!KEYS.contains(key)) throw new BuildError(id + ": unknown key \"" + key + "\"");
    }

    boolean reference = raw.get("reference") instanceof Boolean b && b;
    boolean varies = raw.get("varies") instanceof Boolean b && b;
    String raises = raw.get("raises") instanceof String s ? s : null;
    String compileError = raw.get("compileError") instanceof String s ? s : null;
    String why = raw.get("why") instanceof String s ? s : null;
    List<String> stdin = stdinOf(id, raw.get("stdin"));

    if (raises != null && !RAISES.matcher(raises).matches())
      throw new BuildError(id + ": \"raises\" is not a qualified class name");
    if (raises != null && compileError != null)
      throw new BuildError(id + ": raises and compileError cannot both be declared");

    if (reference) {
      for (Object k : raw.keySet()) {
        String key = String.valueOf(k);
        if (!key.equals("reference") && !key.equals("why"))
          throw new BuildError(id + ": a reference box takes no key but why");
      }
    } else if (varies && isBlank(why)) {
      throw new BuildError(id + ": varies needs a why");
    } else if (raises != null && isBlank(why)) {
      throw new BuildError(id + ": raises needs a why");
    } else if (compileError != null && isBlank(why)) {
      throw new BuildError(id + ": compileError needs a why");
    }

    return new Decl(reference, raises, compileError, varies, stdin, why);
  }

  private static boolean isBlank(String s) { return s == null || s.isBlank(); }

  private static List<String> stdinOf(String id, Object v) throws BuildError {
    if (v == null) return List.of();
    if (!(v instanceof List<?> list)) throw new BuildError(id + ": \"stdin\" must be a list of strings");
    List<String> out = new ArrayList<>();
    for (Object o : list) {
      if (!(o instanceof String s)) throw new BuildError(id + ": \"stdin\" must be a list of strings");
      out.add(s);
    }
    return out;
  }
}
