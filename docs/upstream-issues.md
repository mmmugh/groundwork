# Upstream issues

Bugs the course found in the projects it builds on are reported to those projects, each in its own tracker, one at a
time and each approved by the author first (D13). The course does not wait for the fixes: until one lands upstream and
the course moves to that release, the patch named beside the issue carries the course's own fix, in `runtime/patches/`.
JDK-fidelity changes, which make TeaVM behave like the JDK where TeaVM is free to differ, stay the course's and are not
listed here.

## TeaVM

| Issue | Filed | The course's fix |
|---|---|---|
| [teavm#1315](https://github.com/konsoletyper/teavm/issues/1315): wasm gc: strict mode skips the bound check for a constant index into a constant-sized array | 2026-10-12 | teavm-0002, part (a) |
| [teavm#1316](https://github.com/konsoletyper/teavm/issues/1316): classlib: Float.MIN_VALUE and Float.MIN_NORMAL are swapped, and Double.MIN_NORMAL is negative | 2026-10-12 | teavm-0010 (Float), teavm-0026 (Double) |
| [teavm#1317](https://github.com/konsoletyper/teavm/issues/1317): classlib: Formatter: %n throws UnknownFormatConversionException, and %% consumes an argument | 2026-10-12 | teavm-0006 |
| [teavm#1318](https://github.com/konsoletyper/teavm/issues/1318): classlib: SuppressWarnings has no value() element | 2026-10-12 | teavm-0013 |
| [teavm#1319](https://github.com/konsoletyper/teavm/issues/1319): classlib: Math.log10 is not exact for powers of ten (Math.log10(1000) gives 2.9999999999999996) | 2026-10-12 | teavm-0010 |
| [teavm#1320](https://github.com/konsoletyper/teavm/issues/1320): classlib: StringBuilder.insert, setCharAt and setLength accept positions their Javadoc rejects | 2026-10-12 | teavm-0012 |
| [teavm#1321](https://github.com/konsoletyper/teavm/issues/1321): wasm gc: unary minus of a float or double is compiled as 0 - x, so -(+0.0) gives +0.0 | 2026-10-12 | teavm-0013 |
| [teavm#1322](https://github.com/konsoletyper/teavm/issues/1322): wasm gc: String.format("%.2f", x) traps with "dereferencing a null pointer" | 2026-10-12 | teavm-0006 |
| [teavm#1323](https://github.com/konsoletyper/teavm/issues/1323): classlib: Formatter: %f rounds half even, the Javadoc says half up | 2026-10-12 | teavm-0006 |
| [teavm#1324](https://github.com/konsoletyper/teavm/issues/1324): wasm gc: calling a method on a caught implicit ArrayIndexOutOfBoundsException traps in strict mode | 2026-10-12 | teavm-0001 |
| [teavm#1325](https://github.com/konsoletyper/teavm/issues/1325): classlib: Random.nextInt(int) does not use the algorithm Random's Javadoc specifies, so seeded sequences differ from the JVM | 2026-10-12 | teavm-0014 |

## teavm-javac

| Issue | Filed | The course's fix |
|---|---|---|
| [teavm-javac#22](https://github.com/konsoletyper/teavm-javac/issues/22): Please add a LICENSE file at the repository root | 2026-10-12 | none: a request, not a bug |
| [teavm-javac#23](https://github.com/konsoletyper/teavm-javac/issues/23): StdlibConverter: java.lang.annotation.Annotation is an annotation type that extends itself | 2026-10-12 | teavm-javac-0104 |
| [teavm-javac#24](https://github.com/konsoletyper/teavm-javac/issues/24): StdlibConverter: nested library types such as Map.Entry do not resolve ("cannot find symbol: class Entry") | 2026-10-12 | teavm-javac-0104 |
| [teavm-javac#25](https://github.com/konsoletyper/teavm-javac/issues/25): compiler: a constant integer division by zero in the source makes compiler.wasm trap in compile() | 2026-10-12 | teavm-javac-0102 |

## Ristretto

The scratchpad's engine. These are filed for Ristretto's own sake; the course carries no patch for them.

| Issue | Filed |
|---|---|
| [ristretto#937](https://github.com/theseus-rs/ristretto/issues/937): THIRD_PARTY_LICENSES.txt has no notices for the Rust standard library or wasi-libc, which are linked into the wasm | 2026-10-12 |
| [ristretto#938](https://github.com/theseus-rs/ristretto/issues/938): Support JEP 512 launch protocol (compact source files and instance main methods) | 2026-10-12 |
| [ristretto#939](https://github.com/theseus-rs/ristretto/issues/939): Playground: after an uncaught exception's stack trace, an extra `java.lang.Throwable: Object(...)` line is printed | 2026-10-12 |
| [ristretto#940](https://github.com/theseus-rs/ristretto/issues/940): Web playground: running out of memory aborts the engine instead of throwing OutOfMemoryError, and Java memory is never reclaimed | 2026-10-12 |

The titles are the issues' own.
