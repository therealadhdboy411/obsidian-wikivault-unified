## 2025-05-15 - [PrefixTree Optimization]
**Learning:** The PrefixTree matching logic had O(N^2) complexity due to redundant array mapping and inclusion checks in `pushChar`. Carrying `caseIsMatched` state in `VisitedPrefixNode` instead of re-calculating it during match retrieval avoids redundant trie traversals.
**Action:** Use `Set` for node deduplication and propagate match state through the visited nodes to keep hot paths O(N).

## 2025-05-15 - [Regex Overhead]
**Learning:** Creating regex instances inside frequently called static methods like `checkWordBoundary` introduces significant overhead during document scanning.
**Action:** Hoist frequently used regexes to static constants.

## 2025-05-15 - [Batch Link Context Optimization]
**Learning:** Sequential processing of unresolved links in `generateMissingNotes` led to $O(L \cdot N)$ vault scans. Using Obsidian's `unresolvedLinks` metadata to pre-calculate a backlink map allows $O(L \cdot S)$ processing by only reading files that actually contain the mention.
**Action:** Always check `metadataCache` before performing vault-wide file scans for specific terms.
