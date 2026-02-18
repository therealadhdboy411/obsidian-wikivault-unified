## 2025-05-15 - [PrefixTree Optimization]
**Learning:** The PrefixTree matching logic had O(N^2) complexity due to redundant array mapping and inclusion checks in `pushChar`. Carrying `caseIsMatched` state in `VisitedPrefixNode` instead of re-calculating it during match retrieval avoids redundant trie traversals.
**Action:** Use `Set` for node deduplication and propagate match state through the visited nodes to keep hot paths O(N).

## 2025-05-15 - [Regex Overhead]
**Learning:** Creating regex instances inside frequently called static methods like `checkWordBoundary` introduces significant overhead during document scanning.
**Action:** Hoist frequently used regexes to static constants.

## 2025-05-22 - [Trie Match Retrieval Optimization]
**Learning:** `getCurrentMatchNodes` is a hot path called per-character. Using `Set` for matching files and repeatedly calling `.toLowerCase()` on node values introduced significant allocation and CPU overhead. Switching to pre-calculated `lowerCaseValue` and using a `TFile[]` array for `MatchNode.files` avoids intermediate `Array.from()` conversions and redundant string operations.
**Action:** Cache `lowerCaseValue` on `PrefixNode` during insertion, change `MatchNode.files` to an array, and consolidate file filtering into a single pass.
