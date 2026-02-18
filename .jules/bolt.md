## 2025-05-15 - [PrefixTree Optimization]
**Learning:** The PrefixTree matching logic had O(N^2) complexity due to redundant array mapping and inclusion checks in `pushChar`. Carrying `caseIsMatched` state in `VisitedPrefixNode` instead of re-calculating it during match retrieval avoids redundant trie traversals.
**Action:** Use `Set` for node deduplication and propagate match state through the visited nodes to keep hot paths O(N).

## 2025-05-15 - [Regex Overhead]
**Learning:** Creating regex instances inside frequently called static methods like `checkWordBoundary` introduces significant overhead during document scanning.
**Action:** Hoist frequently used regexes to static constants.

## 2025-05-23 - [Collection Overhead in Hot Path]
**Learning:** Frequent conversion between `Set` and `Array` (using `Array.from`) and repeated object allocations in character-by-character loops are major bottlenecks. Combining filtering and transformation into a single pass over collections significantly reduces CPU time.
**Action:** Use arrays for transient result sets and pre-calculate/cache static properties (like string length or lowercase versions) on trie nodes.
