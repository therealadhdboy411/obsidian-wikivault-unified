## 2025-05-15 - [PrefixTree Optimization]
**Learning:** The PrefixTree matching logic had O(N^2) complexity due to redundant array mapping and inclusion checks in `pushChar`. Carrying `caseIsMatched` state in `VisitedPrefixNode` instead of re-calculating it during match retrieval avoids redundant trie traversals.
**Action:** Use `Set` for node deduplication and propagate match state through the visited nodes to keep hot paths O(N).

## 2025-05-15 - [Regex Overhead]
**Learning:** Creating regex instances inside frequently called static methods like `checkWordBoundary` introduces significant overhead during document scanning.
**Action:** Hoist frequently used regexes to static constants.

## 2025-05-16 - [Buffer Reuse and Type Optimization]
**Learning:** Frequent allocations of arrays and Sets in the prefix tree scanning path (`pushChar` and `getCurrentMatchNodes`) cause significant GC pressure. Converting `MatchNode.files` to a plain array and caching `PrefixNode` file sets as arrays avoids repeated $O(N)$ conversions.
**Action:** Use double-buffering for active nodes and cache Set-to-Array conversions in the trie nodes.
