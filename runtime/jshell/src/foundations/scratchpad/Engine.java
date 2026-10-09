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

import java.util.HashMap;
import java.util.Map;
import jdk.jshell.execution.DirectExecutionControl;
import jdk.jshell.spi.ExecutionControl;
import jdk.jshell.spi.ExecutionControlProvider;
import jdk.jshell.spi.ExecutionEnv;

/**
 * The execution engine: the library's own direct engine (DirectExecutionControl), which runs each snippet in the
 * calling thread, as the real tool's default engine runs it in its agent's main thread, and adds no stop-check calls to
 * the reader's code (DERIVATION.md, R3); Ristretto can host only an in-process engine. It is watched: it keeps the bytes
 * of every class it loads, and when the library asks it to redefine classes, which an in-process engine cannot do, it
 * records whether a JVM could have redefined each one in place (same ClassShape). The real tool's default engine can,
 * so it says "modified" where this engine has to replace (DERIVATION.md, R1, R2).
 */
final class Engine extends DirectExecutionControl {
  /** The class bytes last loaded under each name. */
  private final Map<String, byte[]> loaded = new HashMap<>();

  /** Per evaluation: whether any class was asked to be redefined, and whether every one could have been in place. */
  boolean redefineAsked;
  boolean allInPlace;
  boolean staticStateAtStake;

  void beginEvaluation() {
    redefineAsked = false;
    allInPlace = true;
    staticStateAtStake = false;
  }

  @Override
  public void load(ClassBytecodes[] classes) throws ClassInstallException, NotImplementedException, EngineTerminationException {
    super.load(classes);
    for (ClassBytecodes c : classes) loaded.put(c.name(), c.bytecodes());
  }

  @Override
  public void redefine(ClassBytecodes[] classes) throws ClassInstallException, NotImplementedException, EngineTerminationException {
    redefineAsked = true;
    for (ClassBytecodes c : classes) {
      byte[] old = loaded.get(c.name());
      String before = old == null ? null : ClassShape.of(old);
      if (before == null || !before.equals(ClassShape.of(c.bytecodes()))) allInPlace = false;
      // R2: a type the reader declared (a member class of a snippet's wrapper, "REPL.$JShell$12C$Ctr") that holds
      // mutable static state would lose it when replaced; the wrappers' own static fields are the reader's
      // variables, which a redeclaration sets anew.
      if (old != null && c.name().indexOf('$', c.name().indexOf("$JShell$") + 8) >= 0 && ClassShape.holdsStaticState(old)) {
        staticStateAtStake = true;
      }
    }
    super.redefine(classes);
  }

  /** The provider the JShell builder is given: one engine per JShell instance, remembered for the shell. */
  static final class Provider implements ExecutionControlProvider {
    Engine engine;

    @Override public String name() { return "foundations-local"; }

    @Override
    public ExecutionControl generate(ExecutionEnv env, Map<String, String> parameters) {
      engine = new Engine();
      return engine;
    }
  }
}
