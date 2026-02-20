## 2025-05-15 - [PrefixTree Optimization]
**Learning:** The PrefixTree matching logic had O(N^2) complexity due to redundant array mapping and inclusion checks in `pushChar`. Carrying `caseIsMatched` state in `VisitedPrefixNode` instead of re-calculating it during match retrieval avoids redundant trie traversals.
**Action:** Use `Set` for node deduplication and propagate match state through the visited nodes to keep hot paths O(N).

## 2025-05-15 - [Regex Overhead]
**Learning:** Creating regex instances inside frequently called static methods like `checkWordBoundary` introduces significant overhead during document scanning.
**Action:** Hoist frequently used regexes to static constants.
## 2025-05-15 - [Double-Buffering & Lazy Caching]
**Learning:** Reusing arrays and sets via double-buffering in  significantly reduces GC pressure on the hot path (scanning every character of a document). Lazy caching of  to  conversions in  avoids repeated (N)$ overhead during match retrieval.
**Action:** Always check for repeated allocations in loops that run per-character or per-match, and use class-level buffers to reuse memory.
## 2025-05-15 - [Double-Buffering & Lazy Caching]
**Learning:** Reusing arrays and sets via double-buffering in `pushChar` significantly reduces GC pressure on the hot path (scanning every character of a document). Lazy caching of `Set` to `Array` conversions in `PrefixNode` avoids repeated O(N) overhead during match retrieval.
**Action:** Always check for repeated allocations in loops that run per-character or per-match, and use class-level buffers to reuse memory.
