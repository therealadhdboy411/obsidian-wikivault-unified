## 2025-05-15 - [PrefixTree Optimization]
**Learning:** The PrefixTree matching logic had O(N^2) complexity due to redundant array mapping and inclusion checks in `pushChar`. Carrying `caseIsMatched` state in `VisitedPrefixNode` instead of re-calculating it during match retrieval avoids redundant trie traversals.
**Action:** Use `Set` for node deduplication and propagate match state through the visited nodes to keep hot paths O(N).

## 2025-05-15 - [Regex Overhead]
**Learning:** Creating regex instances inside frequently called static methods like `checkWordBoundary` introduces significant overhead during document scanning.
**Action:** Hoist frequently used regexes to static constants.

## 2025-05-16 - [Collection Allocation and Conversion]
**Learning:** Repeatedly allocating arrays and sets in the hot path (`pushChar`) and converting `Set<TFile>` to `TFile[]` on every match retrieval (`getCurrentMatchNodes`) creates significant GC pressure and overhead. Reusing buffers and lazy-caching the array representation of trie nodes dramatically reduces this overhead.
**Action:** Use class-level buffers for temporary collections and implement lazy-initialization caching for frequently converted data structures.
