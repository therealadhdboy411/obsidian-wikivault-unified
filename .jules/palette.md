## 2025-05-14 - [Setting Input Optimization & Feedback]
**Learning:** For percentage-based settings, replacing text inputs with sliders significantly improves UX by preventing invalid input and providing a more tactile interaction. Additionally, providing immediate visual feedback via `Notice` for silent actions (like batch processing or state changes) is crucial for a responsive feel.
**Action:** Always prefer `addSlider` over `addText` for numeric ranges in Obsidian settings tabs, and ensure every significant user action triggers a confirmation notice.

## 2026-05-23 - ARIA labels for virtual link indicators
**Problem:** Multi-reference indicators and virtual link icons lacked context for screen readers, being read as "bracket ellipsis bracket" or just the suffix text.
**Learning:** Decorative and functional symbols in custom DOM elements must have explicit ARIA labels and `aria-hidden` attributes to provide a meaningful experience for non-visual users. Moving separators outside anchor tags also prevents them from being part of the link text.
**Prevention:** Use `aria-label` and `title` for functional indicators. Use `aria-hidden="true"` for decorative brackets and separators.
