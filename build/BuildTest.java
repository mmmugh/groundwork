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
import java.lang.reflect.*;
import java.util.*;

/** Runs the build's tests: $J build/BuildTest.java [filter]. Exits 1 on any failure, and when nothing ran. */
public class BuildTest {
  static final Class<?>[] SUITES = { JsonTest.class, VolumeTest.class, MarkdownTest.class, BoxesTest.class, PagesTest.class, PublishTest.class, RuntimeFilesTest.class, LegalFilesTest.class, ScratchpadFilesTest.class, JdkTest.class, AuditTest.class, VocabularyTest.class, ForkGateTest.class, BundleTest.class, SiteZipTest.class, ChecksTest.class, NameTest.class, DecisionsTest.class, BuildMainTest.class };
  public static void main(String[] args) {
    System.setProperty("jf.test", "1"); // lets tests pass --no-fork-gate-for-tests (Task 6); users cannot
    String filter = args.length > 0 ? args[0] : "";
    int ran = 0, failed = 0;
    for (Class<?> suite : SUITES) {
      Method[] ms = suite.getDeclaredMethods();
      Arrays.sort(ms, Comparator.comparing(Method::getName));
      for (Method m : ms) {
        if (!m.getName().startsWith("test") || !Modifier.isStatic(m.getModifiers())) continue;
        String name = suite.getSimpleName() + "." + m.getName();
        if (!name.contains(filter)) continue;
        ran++;
        try { m.setAccessible(true); m.invoke(null); System.out.println("  ok    " + name); }
        catch (InvocationTargetException e) { failed++; System.out.println("  FAIL  " + name + "\n      " + e.getCause()); }
        catch (Exception e) { failed++; System.out.println("  FAIL  " + name + "\n      " + e); }
      }
    }
    System.out.println(ran + " test(s), " + failed + " failed");
    System.exit(ran == 0 || failed > 0 ? 1 : 0);
  }
}
