## 2025-05-15 - [PrefixTree Optimization]
**Learning:** The PrefixTree matching logic had O(N^2) complexity due to redundant array mapping and inclusion checks in `pushChar`. Carrying `caseIsMatched` state in `VisitedPrefixNode` instead of re-calculating it during match retrieval avoids redundant trie traversals.
**Action:** Use `Set` for node deduplication and propagate match state through the visited nodes to keep hot paths O(N).

## 2025-05-15 - [Regex Overhead]
**Learning:** Creating regex instances inside frequently called static methods like `checkWordBoundary` introduces significant overhead during document scanning.
**Action:** Hoist frequently used regexes to static constants.

## 2025-05-16 - [Hot Path Optimization: Match Retrieval]
**Learning:** The `getCurrentMatchNodes` method is a critical hot path called for every character in the visible viewport. Using `Set` for temporary match results and `Array.from()` for conversion in every consumer introduces significant allocation overhead and GC pressure. Consolidating filtering and alias detection into a single loop further reduces CPU cycles.
**Action:** Use `TFile[]` for `MatchNode.files` and consolidate match processing into a single-pass `for` loop with early exits.
