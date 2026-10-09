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
import jdk.jshell.Diag;
import jdk.jshell.ExpressionSnippet;
import jdk.jshell.JShell;
import jdk.jshell.MethodSnippet;
import jdk.jshell.PersistentSnippet;
import jdk.jshell.Snippet;
import jdk.jshell.Snippet.Status;
import jdk.jshell.TypeDeclSnippet;
import jdk.jshell.VarSnippet;

/**
 * The line (or lines) the reader sees for one event of the library: a value, "created method ...", "update replaced
 * variable ..." and so on, in each feedback mode (DERIVATION.md, F1 to F8). Every rule here was read off the real
 * tool's own "/set mode" listing of its four modes and checked against observed output.
 */
final class Reports {
  private Reports() {}

  enum Kind { IMPORT, TYPE, METHOD, VARDECL, VARINIT, TEMPORARY, VARVALUE, ASSIGNMENT, OTHER }

  enum Act { ADDED, MODIFIED, REPLACED, OVERWROTE, DROPPED, USED }

  enum Resolution { OK, DEFINED, NOTDEFINED }

  /** What one event says, in the terms the display rules need. */
  record Facts(Snippet snippet, Kind kind, String typeKind, Act act, boolean update, Resolution resolution,
         String name, String type, String value) {}

  static Kind kind(Snippet s) {
    if (s instanceof TypeDeclSnippet) return Kind.TYPE;
    if (s instanceof MethodSnippet) return Kind.METHOD;
    if (s instanceof VarSnippet) {
      return switch (s.subKind()) {
        case VAR_DECLARATION_SUBKIND -> Kind.VARDECL;
        case TEMP_VAR_EXPRESSION_SUBKIND -> Kind.TEMPORARY;
        default -> Kind.VARINIT;
      };
    }
    if (s instanceof ExpressionSnippet) {
      return switch (s.subKind()) {
        case VAR_VALUE_SUBKIND -> Kind.VARVALUE;
        case ASSIGNMENT_SUBKIND -> Kind.ASSIGNMENT;
        default -> Kind.OTHER;
      };
    }
    if (s.kind() == Snippet.Kind.IMPORT) return Kind.IMPORT;
    return Kind.OTHER;
  }

  /** F2: the word for a type declaration's kind. */
  static String typeKind(Snippet s) {
    return switch (s.subKind()) {
      case INTERFACE_SUBKIND -> "interface";
      case ENUM_SUBKIND -> "enum";
      case ANNOTATION_TYPE_SUBKIND -> "annotation interface";
      case RECORD_SUBKIND -> "record";
      default -> "class";
    };
  }

  static Resolution resolution(Status status) {
    return switch (status) {
      case RECOVERABLE_DEFINED -> Resolution.DEFINED;
      case RECOVERABLE_NOT_DEFINED -> Resolution.NOTDEFINED;
      default -> Resolution.OK;
    };
  }

  /** F3: what happened to the snippet, from its statuses before and after and whether its signature changed. */
  static Act act(Status previous, Status status, boolean signatureChange) {
    if (status == Status.OVERWRITTEN) return Act.OVERWROTE;
    if (status == Status.DROPPED) return Act.DROPPED;
    if (!previous.isActive()) return Act.ADDED;
    return signatureChange ? Act.REPLACED : Act.MODIFIED;
  }

  static Facts facts(Snippet s, Act act, boolean update, Resolution resolution, String value) {
    Kind kind = kind(s);
    String name = s instanceof PersistentSnippet p ? p.name() : s instanceof ExpressionSnippet e ? e.name() : "";
    String type = s instanceof VarSnippet v ? v.typeName()
        : s instanceof MethodSnippet m ? m.parameterTypes()
        : s instanceof ExpressionSnippet e ? e.typeName() : "";
    return new Facts(s, kind, kind == Kind.TYPE ? typeKind(s) : "", act, update, resolution, name, type, value);
  }

  /**
   * The text for one event in the given mode; "" when the mode shows nothing for it. The rules are applied in the
   * order the real tool lists them for each mode, a later rule replacing an earlier one (F1).
   */
  static String display(Facts f, Mode mode, JShell shell) {
    if (mode == Mode.SILENT) return "";
    boolean verbose = mode == Mode.VERBOSE, concise = mode == Mode.CONCISE;
    boolean ok = f.resolution == Resolution.OK;
    boolean changed = f.act == Act.ADDED || f.act == Act.MODIFIED || f.act == Act.REPLACED;
    String action = action(f);
    String result = changed && ok && !f.update ? f.name + " ==> " + valueText(f) + "\n" : "";
    String resolve = resolve(f, shell);
    String out = "";
    switch (f.kind) {
      case TEMPORARY -> {
        if (changed && !f.update) out = result + "|  created scratch variable " + f.name + " : " + f.type + "\n";
        if (f.act == Act.DROPPED) out = "|  " + action + " variable " + f.name + "\n";
        if (!verbose && f.update) out = "";
        if (!verbose && changed && ok && !f.update) out = result;
      }
      case VARVALUE -> {
        if (changed && !f.update) out = result + "|  value of " + f.name + " : " + f.type + "\n";
        if (!verbose && f.update) out = "";
        if (!verbose && changed && ok && !f.update) out = result;
      }
      case ASSIGNMENT -> {
        if (!f.update) out = result + "|  assigned to " + f.name + " : " + f.type + "\n";
        if (!verbose && f.update) out = "";
        if (!verbose && changed && ok && !f.update) out = result;
        if (concise && ok) out = "";
      }
      case VARDECL, VARINIT -> {
        out = result + "|  " + action + " variable " + f.name + " : " + f.type + resolve + "\n";
        if (f.resolution == Resolution.NOTDEFINED) out = "|  " + action + " variable " + f.name + resolve + "\n";
        if (f.act == Act.DROPPED) out = "|  " + action + " variable " + f.name + "\n";
        if (!verbose && f.update && f.act != Act.USED) out = "";
        if (!concise && f.act == Act.REPLACED && ok && f.update) out = "|  " + action + " variable " + f.name + ", reset to null\n";
        if (!verbose && f.act == Act.REPLACED && f.resolution == Resolution.NOTDEFINED) {
          out = "|  " + action + " variable " + f.name + resolve + "\n";
        }
        if (!verbose && changed && ok && !f.update) out = result;
        if (concise && ok) out = "";
      }
      case TYPE -> {
        out = f.act == Act.USED ? "|  attempted to use " + f.typeKind + " " + f.name + resolve + "\n"
            : "|  " + action + " " + f.typeKind + " " + f.name + resolve + "\n";
        if (!verbose && f.update && f.act != Act.USED) out = "";
        if (concise && ok) out = "";
      }
      case METHOD -> {
        out = f.act == Act.USED ? "|  attempted to call method " + f.name + "(" + f.type + ")" + resolve + "\n"
            : "|  " + action + " method " + f.name + "(" + f.type + ")" + resolve + "\n";
        if (!verbose && f.update && f.act != Act.USED) out = "";
        if (concise && ok) out = "";
      }
      default -> { }
    }
    return out;
  }

  private static String action(Facts f) {
    String word = switch (f.act) {
      case ADDED -> "created";
      case MODIFIED -> "modified";
      case REPLACED -> "replaced";
      case OVERWROTE -> "overwrote";
      case DROPPED -> "dropped";
      case USED -> "";
    };
    return f.update ? "  update " + word : word;
  }

  /** V1: the value, shortened. */
  private static String valueText(Facts f) {
    int limit = f.kind == Kind.TEMPORARY || f.kind == Kind.VARVALUE ? ValueText.LONG : ValueText.SHORT;
    return ValueText.cut(f.value == null ? "" : f.value, limit);
  }

  /** F5, F6: ", however, it cannot be ... until x is declared" and its update form. */
  static String resolve(Facts f, JShell shell) {
    if (f.resolution == Resolution.OK) return "";
    if (f.act == Act.OVERWROTE || f.act == Act.DROPPED) return "";
    boolean update = f.update || f.act == Act.USED;
    String until;
    if (f.resolution == Resolution.NOTDEFINED) {
      until = update ? " which cannot be referenced until" : ", however, it cannot be referenced until";
    } else if (f.kind == Kind.METHOD) {
      until = update ? " which cannot be invoked until" : ", however, it cannot be invoked until";
    } else if (f.kind == Kind.TYPE) {
      until = switch (f.typeKind) {
        case "interface" -> update ? " whose methods cannot be invoked until" : ", however, its methods cannot be invoked until";
        case "enum", "annotation interface" -> update ? "" : ", however, it cannot be used until";
        default -> update ? " which cannot be instantiated or its methods invoked until"
            : ", however, it cannot be instantiated or its methods invoked until";
      };
    } else {
      until = "";
    }
    List<String> unresolved = f.snippet instanceof jdk.jshell.DeclarationSnippet d
        ? shell.unresolvedDependencies(d).toList() : List.of();
    List<Diag> errors = new ArrayList<>();
    shell.diagnostics(f.snippet).filter(Diag::isError).forEach(errors::add);
    StringBuilder text = new StringBuilder(until);
    if (!unresolved.isEmpty()) text.append(' ').append(list(unresolved));
    boolean many = unresolved.size() > 1;
    if (errors.isEmpty()) {
      if (!unresolved.isEmpty()) text.append(many ? " are declared" : " is declared");
      return text.toString();
    }
    if (!unresolved.isEmpty()) text.append(many ? " are declared and " : " is declared and ");
    else text.append(' ');
    text.append(errors.size() > 1 ? "these errors are corrected: " : "this error is corrected: ");
    for (Diag d : errors) {
      for (String line : ErrorBlock.body(d, f.snippet.source())) text.append("\n|      ").append(line);
    }
    return text.toString();
  }

  /** F5: "a", "a, and b", "a, b, and c". */
  private static String list(List<String> names) {
    if (names.size() == 1) return names.get(0);
    return String.join(", ", names.subList(0, names.size() - 1)) + ", and " + names.get(names.size() - 1);
  }
}
