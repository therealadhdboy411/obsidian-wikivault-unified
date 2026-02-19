## 2025-05-15 - [PrefixTree Optimization]
**Learning:** The PrefixTree matching logic had O(N^2) complexity due to redundant array mapping and inclusion checks in `pushChar`. Carrying `caseIsMatched` state in `VisitedPrefixNode` instead of re-calculating it during match retrieval avoids redundant trie traversals.
**Action:** Use `Set` for node deduplication and propagate match state through the visited nodes to keep hot paths O(N).

## 2025-05-15 - [Regex Overhead]
**Learning:** Creating regex instances inside frequently called static methods like `checkWordBoundary` introduces significant overhead during document scanning.
**Action:** Hoist frequently used regexes to static constants.

## 2026-02-19 - [Trie Traversal & Match Retrieval Optimization]
**Learning:** Reusing arrays and sets (hoisting them as class members) in the hot path of `pushChar` significantly reduces GC overhead. Switching `MatchNode.files` from `Set` to `Array` eliminates redundant `Array.from()` calls and allows single-pass filtering and alias detection.
**Action:** Always look for buffer reuse opportunities in character-by-character processing loops. Minimize type conversions (Set -> Array) in hot paths.
