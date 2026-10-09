# Clean-room records

Three patch headers point at a clean-room record kept in a commit message. teavm-0011-hash-order.patch names
commits 7c90c06 and 081ed1e; teavm-0019-protocol-exception-before-offline.patch and
teavm-0020-loopback-connection-refused.patch say that the audit of the session's transcript "is recorded in the commit
that adds this patch", and 0011 calls 7c90c06 that commit too. All three commits belong to the history before this
repository's first commit, which stays private with the author's working notes (D95, D96). In this repository the commit
that adds every patch is that first commit. The headers are not edited, since each patch's bytes are hashed into the
released runtime's `SOURCES.txt`; the records are copied here instead, so that what the headers point at can be read.

Each copy below is the clean-room part of its commit message, unchanged but for these edits: the session link is left
out; a private path becomes the author's working notes (D95), which stay private; the name of a worksheet becomes "the
author's design worksheet"; a local script that was never committed is called "the project's transcript auditor"; and
the implementer's "I" is written in the third person.
Paths under `runtime/.work/` name local scratch directories that are never committed. In these records the implementer
is the fresh subagent that wrote the patch or its fix, and the controller is the session that directed and reviewed the
work.

## teavm-0011: HashMap and HashSet iterate in the JDK's order (D12)

Written for Plan 1's Task 6 (docs/superpowers/plans/2026-09-27-plan-1-runtime.md), then revised once after its review.

### 7c90c06, which added the patch: who wrote it, and the experiment behind each rule

```text
Who wrote it, and from what. The patch (teavm-0011-hash-order.patch, which
changes TeaVM's THashMap, THashSet and TLinkedHashMap) was written by a
fresh subagent, Claude Opus 5.5, as the clean-room implementer of D14. In
that session no OpenJDK source was opened, searched or fetched: no
OpenJDK .java file, no jdk25u download, no lib/src.zip, nothing on the
web. The inputs were the brief and its test, programs run on the pinned
JDK (jdk-25.0.4.1+1, with the plan's flags), the public Java SE 25
Javadoc, and TeaVM's own Apache-2.0 classes. Candidate rules were written
into an executable model and kept only when the JDK agreed. One caveat,
stated plainly: as a language model the implementer may have met
descriptions of OpenJDK's HashMap in training, so the shapes of some
hypotheses may come from there. No rule was taken on that basis. Each one
below was accepted only after an experiment on the JDK picked it over its
rivals.

The rules and the experiment behind each (programs and raw output are
kept in runtime/.work/hash-derive and runtime/.work/logs/task6-*):
1. Bucket = (h ^ (h >>> 16)) & (n - 1). E1: probe keys of chosen hash
   between references 0..15 in a 16-bucket map: 0x10000 lands in bucket 1,
   0x80000 in 8, 0x100000 in 0, 0x10001 in 0 (XOR, not OR or +), 0x30003
   in 0, 0x12345678 in 12. At 131072 buckets only >>> (not >>) fits random
   hashes (E4).
2. put and putIfAbsent append to the bucket; merge, compute and
   computeIfAbsent prepend (E2: 1,17,33,49 by put give [1, 17, 33, 49], by
   merge [49, 33, 17, 1]).
3. Doubling keeps each bucket's order (E2: 49,1,65,33,17 become
   [1, 65, 33] and [49, 17] at 32 buckets).
4. 16 buckets, 0.75; put grows after inserting past the threshold (the
   13th key), the compute family before looking when size > threshold (the
   14th key), even for a present key or a null result; computeIfPresent,
   get and put of a present key never grow (E2, E3).
5. HashMap(n) takes the next power of two (0 gives 1), fixed only by the
   first insertion; putAll into an unsettled map asks for the next power of
   two >= ceil(size / loadFactor), a larger request standing (E4, E6,
   E6b: HashMap().putAll(6 keys) has 8 buckets, HashMap(100).putAll(6) 128;
   clear, get, remove, computeIfPresent and putAll(empty) leave it
   unsettled). Into a settled map putAll doubles while its size alone
   passes the threshold (model: no growth 32/600 seeds wrong, one doubling
   16/600, doubling while 0/600).
6. clone() and new HashMap<>(m) are HashMap() then putAll (E6: a clone of
   10 keys from a 256-bucket map fits 16 buckets in the original's order);
   new HashSet<>(c) starts at max(ceil(size / 0.75), 16) (E4: 6 give 16,
   24 give 32, 25 give 64).
7. A new key that makes a bucket 9 long (8 for the compute family) doubles
   a table under 64 buckets, else makes a tree (E7: 16 buckets, load
   factor 10: put's 9th colliding key gives 32, 10th 64; merge's 8th 32).
8. Tree order: hash as a signed int, then compareTo for one class that
   implements Comparable of itself. The list is the iteration order: built
   in list order, root to the front, a new key right after its parent,
   root to the front again (E5, then the model: afterParent 0/600,
   head 323/600, tail 312/600; unsigned hashes 524/1000 wrong).
9. Splitting a tree: a part of 6 or fewer becomes a list, a part that took
   every key stays, others rebuild (keep=false 49/600, 5 48/600, 7 55/600).
10. map.remove on a tree: if the root has no left child or that child has
   none, the bucket becomes a list; otherwise delete by the successor and
   move the root to the front (predecessor 157/200 wrong, no move 83/200;
   in 4000 trials the untreeify rules count <= 2..6 and "never" were wrong
   350 to 829 times, the shape rule 0; in 6000 more, dropping its left-
   grandchild clause or trading it for a right-side one was wrong 494 to
   1133 times, a root.right clause changed nothing (a red-black tree
   implies it), and the same check made after the deletion was wrong 498
   times). Removal through an iterator (and so removeIf,
   values().remove, retainAll) neither moves the root nor makes a list
   (E9b; the model went from 13-19/3000 wrong to 0/9000).
11. Turning a bucket into a tree or back replaces its entries (E6, E8: a
   held entry's setValue no longer reaches the map).
12. A function that adds or removes keys throws
   ConcurrentModificationException (E8: the recursive memoized fib throws
   with the memo holding {2=1}); a null value or function throws a
   message-less NullPointerException before any growth (E9).
Known limit: ties between colliding keys that are not of one Comparable
class break by identity hash in the JDK, and that order moves with
unrelated allocations on the JDK itself (E5w: three orders for three
warm-ups), so no other runtime can match it; here such a tie goes right.
```

The patch header corrects one point of this record: no Javadoc page was opened, so the public Javadoc was not an input.

### 081ed1e, fix round 1: the names are neutral and the tree helpers only relink

```text
Task 6's review raised a clean-room (D14) point about
teavm-0011-hash-order.patch. Several of its internal identifiers
(balanceInsertion, balanceDeletion, moveRootToFront, treeify, untreeify)
match names the reviewer recalls from OpenJDK's java.util.HashMap, and
the static tree helpers all took the root and returned the new root. The
reviewer opened no OpenJDK source and found the structure independent
(the tree only decides order; lookups walk the bucket's list), so this
is about how the patch's provenance reads, not how it behaves. But a
patch that exists because its author had not read that source should
not look as if it had been copied from it. This commit changes names and
plumbing only. Every ordering rule is the same as before, and the proofs
below show it.

Renamed, from the reviewer's list: balanceInsertion ->
rebalanceAfterInsert, balanceDeletion -> rebalanceAfterDelete,
moveRootToFront -> bringRootToHead, treeify -> listToTree, untreeify ->
treeToList. Renamed by the same test (a name a reader could take for
borrowed): treeifyOrGrow -> listToTreeOrGrow; indexFor -> bucketIndex,
including its three calls in TLinkedHashMap; resize -> doubleTable, since
it only ever doubles; and the split's lowTail/highTail/lowCount/highCount
-> stayTail/moveTail/stayCount/moveCount, the words the method's own
comment already used. None of the old names is TeaVM's: none appears in
TeaVM's classlib outside the two files this patch rewrites. The extra
renames rest on the same kind of general recall the reviewer described.
No source was consulted to check them.

The signature: a bucket's tree has no object of its own to hold its
root. So rotateLeft, rotateRight, transplant, deleteFromTree and both
rebalancing loops now just relink nodes and return nothing, and any code
that needs the root walks up to it with rootOf. listToTree and treeInsert
start that walk from the node just added. unlinkEntry starts from the
bucket's first entry, which is always a live tree node at that point.
The deletion loop's "x != root" becomes "parent != null". x may be null,
so its parent travels alongside it, and x is the root exactly when that
parent is null. Its final case now breaks out after the last rotation
instead of setting x to the root. The patch header gains one line saying
the names were chosen neutrally after review.

Proof that behavior is unchanged (logs in
runtime/.work/logs/task6-fix1-*.log):
- hash-order.mjs on the rebuilt fork: exit 0, 13 of 13 ok.
- differential.mjs: exit 0, 99 cases, 10 differing, 0 problems. The
  output is identical to the previous round's once timings are
  stripped. smoke, runner-safety and runner-faults: exit 0.
- The previous round's random-program fuzz (scratch): the fork against
  the pinned JDK, with the order printed after every operation, covering
  tree buckets that are built, split, shrunk and emptied. Seeds 1 (40
  programs), 777 (60 programs, up to 150 operations) and a fresh seed
  20260927 (40): 140 programs, 0 differ.
- The old and new tree helpers, pasted verbatim from both versions of
  THashMap into one scratch program and run on the pinned JDK with the
  same random insert and delete sequences: 20,000 sequences, 2,428,503
  inserts, 1,580,970 deletes (597,864 through the successor, 598,102 of a
  black node that leave x null, which is the case the new loop condition
  has to carry). After every operation the two trees had the same shape,
  colors and root, and each was a valid red-black tree. The implementer checked
  that this harness can fail: with the loop condition written as "x != null &&
  x.parent != null", the tempting rewrite that drops the null-x case, it
  diverges at seed 1, operation 5, exit 1.
- Neighbors, fork against JDK: LinkedHashMap insertion order and access
  order, TreeMap and TreeSet, and HashMap's documented behavior (null key
  and values, remove, iterator removal, putAll, containsKey and
  containsValue, equals and hashCode) are all IDENTICAL. The LRU program
  (removeEldestEntry) still fails to compile on the fork with the
  pre-existing "cannot find symbol class Entry", as it did before this
  patch.

Negative proof: bash runtime/build.sh --negatives exit 0, so every
fork-no-NNNN builds with this patch and one earlier patch left out. Then
JF_DIST=runtime/.work/variants/fork-no-0011 node
runtime/test/hash-order.mjs exits 1, with 13 of 13 programs FAIL.
hash-order exits 0 on fork-no-0001 to 0006, 0008 to 0010, 0102 and 0103.
On fork-no-0007 only the merge program fails, because it uses
Integer::sum, which is 0007's own fix (a compile error without it), as
in the previous round. The dist/fork that --negatives rebuilt is byte
for byte the build these checks ran on (identical manifest).

Written by a fresh subagent (Claude Opus 5.5), the clean-room implementer
for this fix round. In this session the implementer never opened, searched or
fetched OpenJDK source in any form: no OpenJDK .java file, no jdk25u download,
no lib/src.zip, nothing on the web. No recursive search ran across
runtime/.work or teavm-javac's checkout. The implementer did not open
the author's design worksheet (D95) or any spike report, and read no commit
message that mentions HashMap. Inputs: the review finding, the Task 6 brief and its
test, the global constraints, the previous round's report, TeaVM's own
Apache-2.0 THashMap and TLinkedHashMap as this patch leaves them, the
textbook (CLRS) red-black algorithms, and the pinned JDK's output.
```

## teavm-0019 and teavm-0020: java.net answers as the JDK does (D99, D100)

### 2ab56b9, which added both patches (Plan 4b, Task 7)

```text
Two new TeaVM patches, written in the clean room (D14). Their only sources were the pinned JDK's observed output
and TeaVM's own Apache-2.0 class library.
- teavm-0019 (D99): when doOutput is false, getOutputStream() throws java.net.ProtocolException, before
  teavm-0018's offline exception.
- teavm-0020 (D100): 127.0.0.1 and localhost fail with ConnectException "Connection refused", as the JDK does
  when nothing listens there. Every other address literal keeps "Network is unreachable" (D92), and every other
  host name keeps UnknownHostException.

Observed JDK lines, from the RED run (the only source of the JDK's wording):
  D99-output-stream-do-output-false
  D99-output-stream-post-without-do-output
  D99-output-stream-do-output-false-address
    java.net.ProtocolException: cannot write to a URLConnection if doOutput=false - call setDoOutput(true)
  D99-output-stream-catch-types
    protocol
  D100-loopback-input-stream
  D100-localhost-input-stream
  D100-loopback-response-code
  D100-loopback-https
  D100-loopback-output-stream-do-output-true
    java.net.ConnectException: Connection refused
  D100-loopback-catch-types
    127.0.0.1: refused true
    localhost: refused true
  D100-localhost-connect-is-socket-exception
    ConnectException, a SocketException: true
Both controls agreed before the patches: D99's doOutput-true case on a .invalid host, and the D86 .invalid cases.

Negatives: `bash runtime/build.sh --negatives` built 25 variants, exit 0. `node runtime/test/negatives.mjs`
exit 0: every one of 25 patches caught, the control passing all four gates. Exact case ids, from each variant's
differential.log `!!` lines:
- fork-no-0018 leaves out 0018, 0019 and 0020. Differential exit 1, 15 ids:
  D86-url-input-stream, D86-response-code, D86-unknown-host-by-name, D99-output-stream-do-output-false,
  D99-output-stream-post-without-do-output, D99-output-stream-do-output-true-still-offline,
  D99-output-stream-catch-types, D99-output-stream-do-output-false-address, D100-loopback-input-stream,
  D100-localhost-input-stream, D100-loopback-response-code, D100-loopback-catch-types, D100-loopback-https,
  D100-loopback-output-stream-do-output-true, D100-localhost-connect-is-socket-exception.
- fork-no-0019: differential exit 1, exactly the D99 cases that set no doOutput:
  D99-output-stream-do-output-false, D99-output-stream-post-without-do-output, D99-output-stream-catch-types,
  D99-output-stream-do-output-false-address.
- fork-no-0020: differential exit 1, exactly the D100 cases:
  D100-loopback-input-stream, D100-localhost-input-stream, D100-loopback-response-code,
  D100-loopback-catch-types, D100-loopback-https, D100-loopback-output-stream-do-output-true,
  D100-localhost-connect-is-socket-exception.
- No hash-order, random-seed or runner-safety log of fork-no-0019 or fork-no-0020 names a D99 or D100 id.

Clean room:
- Both patch headers record the resemblance read, done before the rebuild: the patches add no name, and nothing
  was renamed.
- Derivation log (local, never committed), kept in the author's private working notes (D95). It ties
  every rule to an observed line and logs every TeaVM file opened.
- Transcript audit, by the controller after the work and before this commit: clean, nothing to disclose.
  - The project's transcript auditor checked 156 tool calls and flagged one input: the derivation log's own text
    restating the rule ("no javap; no decompiling").
  - runtime/jshell/derive/audit-transcripts.mjs found three hits: that same text, and two shasum reads of the Java
    preferences plist. Those two were the required before-and-after hash check, and the hash did not change.
  - The TeaVM files opened were TeaVM's own Apache-2.0 classlib files (TXHRURLConnection, THttpURLConnection,
    TProtocolException, TURLConnection, TURL), each by exact path in a scratch clone and each logged.
  - Nothing under teavm-javac/javac was opened, and no OpenJDK source in any form.
```

fork-no-0018 leaves out teavm-0019 and teavm-0020 with teavm-0018, since both declare that they build on it, so its D99
and D100 failures could come from their absence alone, with one exception. fork-no-0019 and fork-no-0020 each fail
only their own group, and D99-output-stream-do-output-true-still-offline, which fork-no-0018 fails, is in neither
list. So that case and the three D86 cases that fork-no-0018 fails (D86-url-input-stream, D86-response-code and
D86-unknown-host-by-name) are the four that show teavm-0018's own effect.
