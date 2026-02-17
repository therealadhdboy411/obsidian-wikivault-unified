## 2024-05-24 - [Prefix Tree Matching Optimizations]
**Learning:** The PrefixTree implementation had several O(N^2) or even exponential growth patterns.
1. `pushChar` was adding duplicate root nodes for every non-alphabetic character, leading to a massive increase in `_currentNodes` over time.
2. The `includes` check in `pushChar` was $O(N)$ because it used `Array.map().includes()`, making the character processing loop $O(N^2)$.
3. `getCurrentMatchNodes` was performing redundant parent traversal and unnecessary Set/Array allocations for file filtering.
4. Regex objects were being re-compiled for every single character in the vault.

**Action:**
- Hoist Regex objects to static constants.
- Use a `Set` to track visited nodes in `pushChar` for $O(1)$ lookups and to prevent duplicate root node additions.
- Only process characters once if their lowercase version is identical.
- Remove redundant loops and optimize allocations in `getCurrentMatchNodes`.
- Use simple loops instead of `split().filter()` for string analysis.
