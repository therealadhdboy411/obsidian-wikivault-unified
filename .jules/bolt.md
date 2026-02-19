## 2025-05-15 - [PrefixTree Optimization]
**Learning:** The PrefixTree matching logic had O(N^2) complexity due to redundant array mapping and inclusion checks in `pushChar`. Carrying `caseIsMatched` state in `VisitedPrefixNode` instead of re-calculating it during match retrieval avoids redundant trie traversals.
**Action:** Use `Set` for node deduplication and propagate match state through the visited nodes to keep hot paths O(N).

## 2025-05-15 - [Regex Overhead]
**Learning:** Creating regex instances inside frequently called static methods like `checkWordBoundary` introduces significant overhead during document scanning.
**Action:** Hoist frequently used regexes to static constants.

## 2025-05-16 - [Incremental Update Optimization]
**Learning:** Overwriting the entire note for every mention addition is inefficient and causes vault-wide file change events.
**Action:** Implemented incremental updates in `processWikiLink` that parse existing mentions and only append new ones, reducing disk I/O and preserving metadata.

## 2025-05-16 - [Selective Processing]
**Learning:** Scanning the entire vault for unresolved links is slow for large vaults.
**Action:** Added commands to process only the current file or a single link under the cursor, significantly reducing the scope of metadata cache lookups.
