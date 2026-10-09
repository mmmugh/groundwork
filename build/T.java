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
/** Assertions for the build's tests. A failed assertion throws AssertionError with a readable message. */
final class T {
  private T() {}
  static void eq(Object want, Object got, String what) {
    if (!java.util.Objects.equals(want, got))
      throw new AssertionError(what + "\n      want: " + show(want) + "\n      got:  " + show(got));
  }
  static void check(boolean ok, String what) { if (!ok) throw new AssertionError(what); }
  interface Body { void run() throws Exception; }
  /** Runs body, which must throw BuildError whose message contains part. */
  static void fails(String part, Body body, String what) {
    try { body.run(); } catch (BuildError e) {
      if (!e.getMessage().contains(part)) throw new AssertionError(what + ": message lacks \"" + part + "\": " + e.getMessage());
      return;
    } catch (Exception e) { throw new AssertionError(what + ": threw " + e, e); }
    throw new AssertionError(what + ": did not fail");
  }
  static String show(Object o) { return o instanceof String s ? "\"" + s.replace("\n", "\\n") + "\"" : String.valueOf(o); }
}
