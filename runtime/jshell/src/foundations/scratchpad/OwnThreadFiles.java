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

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Collection;
import java.util.List;
import javax.tools.FileObject;
import javax.tools.ForwardingJavaFileManager;
import javax.tools.JavaFileObject;
import javax.tools.StandardJavaFileManager;

/**
 * The compiler's file manager, unchanged for the thread that evaluates snippets and empty-handed for any other
 * (DERIVATION.md, R4). The library's source analysis starts a background thread that walks the class path, the platform
 * classes and the source path to index class names for Tab completion; observed natively, that thread asks the file
 * manager for exactly those three locations. On Ristretto a Java thread does not outlive the call that started it, so the
 * walk, slow in an interpreter, is frozen wherever the call ends. A later call that needs what it was holding then finds
 * nothing runnable and the VM dies (seen once in six runs under load). Given no paths, the walk ends at once, and only
 * Tab completion of class names not yet imported is poorer.
 */
final class OwnThreadFiles extends ForwardingJavaFileManager<StandardJavaFileManager> implements StandardJavaFileManager {
  private final Thread evaluator;

  OwnThreadFiles(StandardJavaFileManager files, Thread evaluator) {
    super(files);
    this.evaluator = evaluator;
  }

  @Override
  public Iterable<? extends Path> getLocationAsPaths(Location location) {
    if (Thread.currentThread() != evaluator) return List.of();
    return fileManager.getLocationAsPaths(location);
  }

  // Everything else is the standard file manager's own answer.

  @Override public Iterable<? extends JavaFileObject> getJavaFileObjectsFromFiles(Iterable<? extends File> files) { return fileManager.getJavaFileObjectsFromFiles(files); }
  @Override public Iterable<? extends JavaFileObject> getJavaFileObjectsFromPaths(Collection<? extends Path> paths) { return fileManager.getJavaFileObjectsFromPaths(paths); }
  @Override public Iterable<? extends JavaFileObject> getJavaFileObjects(File... files) { return fileManager.getJavaFileObjects(files); }
  @Override public Iterable<? extends JavaFileObject> getJavaFileObjects(Path... paths) { return fileManager.getJavaFileObjects(paths); }
  @Override public Iterable<? extends JavaFileObject> getJavaFileObjectsFromStrings(Iterable<String> names) { return fileManager.getJavaFileObjectsFromStrings(names); }
  @Override public Iterable<? extends JavaFileObject> getJavaFileObjects(String... names) { return fileManager.getJavaFileObjects(names); }
  @Override public void setLocation(Location location, Iterable<? extends File> files) throws IOException { fileManager.setLocation(location, files); }
  @Override public void setLocationFromPaths(Location location, Collection<? extends Path> paths) throws IOException { fileManager.setLocationFromPaths(location, paths); }
  @Override public void setLocationForModule(Location location, String module, Collection<? extends Path> paths) throws IOException { fileManager.setLocationForModule(location, module, paths); }
  @Override public Iterable<? extends File> getLocation(Location location) { return fileManager.getLocation(location); }
  @Override public Path asPath(FileObject file) { return fileManager.asPath(file); }
  @Override public void setPathFactory(PathFactory factory) { fileManager.setPathFactory(factory); }
}
