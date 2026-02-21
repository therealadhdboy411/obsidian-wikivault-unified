## 2025-05-15 - [PrefixTree Optimization]
**Learning:** The PrefixTree matching logic had O(N^2) complexity due to redundant array mapping and inclusion checks in `pushChar`. Carrying `caseIsMatched` state in `VisitedPrefixNode` instead of re-calculating it during match retrieval avoids redundant trie traversals.
**Action:** Use `Set` for node deduplication and propagate match state through the visited nodes to keep hot paths O(N).

## 2025-05-15 - [Regex Overhead]
**Learning:** Creating regex instances inside frequently called static methods like `checkWordBoundary` introduces significant overhead during document scanning.
**Action:** Hoist frequently used regexes to static constants.

## 2026-02-21 - [Correctness over Micro-optimization]
**Learning:** Attempting to avoid a single `toLowerCase()` call in `getCurrentMatchNodes` by conditionally checking `requiresCaseMatch` broke the `isAlias` logic because `isAlias` must always be checked against the lowercased basename. Performance optimizations must never compromise functional correctness.
**Action:** Always prioritize functional correctness and use confirmed code patterns from exploration rather than assuming optimized shortcuts are safe.

## 2026-02-21 - [Allocation Reduction in Hot Paths]
**Learning:** Reusing class-level collection buffers (`_nextNodes`, `_seenNodes`) and implementing double-buffering for trie traversal significantly reduces GC pressure, as these methods are called for every character in every document.
**Action:** Use double-buffering and pre-allocated members for frequent, small allocations in critical loops.
