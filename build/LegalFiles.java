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
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/** D53: a runtime reaches site/ only with its notices. Both runtimes call this on the directory they just
 *  published (site/runtime/, site/scratchpad/), so what it checks is what a reader is served. */
final class LegalFiles {
  private LegalFiles() {}

  /** Each name must be a non-empty regular file under dir. Every one that is not is named, then the build stops. */
  static void require(Path dir, List<String> names) throws BuildError {
    var bad = new ArrayList<String>();
    for (String n : names) {
      Path f = dir.resolve(n);
      try {
        if (!Files.isRegularFile(f)) bad.add(n + ": missing");
        else if (Files.size(f) == 0) bad.add(n + ": empty");
      } catch (IOException e) { throw new BuildError(f + ": " + e.getMessage()); }
    }
    if (!bad.isEmpty()) throw new BuildError(dir + " would be published without its legal files:\n  " + String.join("\n  ", bad)
        + "\nthe licenses of the code a reader's browser runs require them (D21, D53), so the build stops");
  }
}
