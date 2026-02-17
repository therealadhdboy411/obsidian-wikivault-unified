## 2025-05-15 - [Context Menu Clutter & Accessibility]
**Learning:** Adding context menu items globally without checking for target relevance causes significant UX clutter in Obsidian. Always verify the target element's class or attributes before adding plugin-specific actions. Accessibility of virtual/dynamic links can be significantly improved with aria-labels that describe their nature.
**Action:** Use `targetElement.classList.contains()` to filter context menu events. Add descriptive `aria-label` to dynamic links to distinguish them from standard links for screen reader users.
