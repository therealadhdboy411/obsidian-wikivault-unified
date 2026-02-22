## 2025-05-15 - [PrefixTree Optimization]
**Learning:** The PrefixTree matching logic had O(N^2) complexity due to redundant array mapping and inclusion checks in `pushChar`. Carrying `caseIsMatched` state in `VisitedPrefixNode` instead of re-calculating it during match retrieval avoids redundant trie traversals.
**Action:** Use `Set` for node deduplication and propagate match state through the visited nodes to keep hot paths O(N).

## 2025-05-15 - [Regex Overhead]
**Learning:** Creating regex instances inside frequently called static methods like `checkWordBoundary` introduces significant overhead during document scanning.
**Action:** Hoist frequently used regexes to static constants.

## 2026-02-22 - [PrefixTree GC and MatchNode Allocation Optimization]
**Learning:** High-frequency methods like `pushChar` and `getCurrentMatchNodes` are significant bottlenecks due to per-call object allocations (Arrays, Sets, VisitedPrefixNodes). Double-buffering and reusable class members can drastically reduce GC pressure.
**Action:** Use class-level reusable arrays/sets for double-buffering in trie traversals. Implement conditional allocations and early exits in match retrieval to skip expensive filtering and sorting when unnecessary.
