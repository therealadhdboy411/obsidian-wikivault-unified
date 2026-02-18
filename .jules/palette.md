## 2025-05-14 - [Setting Input Optimization & Feedback]
**Learning:** For percentage-based settings, replacing text inputs with sliders significantly improves UX by preventing invalid input and providing a more tactile interaction. Additionally, providing immediate visual feedback via `Notice` for silent actions (like batch processing or state changes) is crucial for a responsive feel.
**Action:** Always prefer `addSlider` over `addText` for numeric ranges in Obsidian settings tabs, and ensure every significant user action triggers a confirmation notice.

## 2025-05-15 - [Accessible Virtual Links]
**Learning:** For dynamic link elements that use short, non-descriptive text (like numbers for multiple references), adding an `aria-label` with the destination's name is essential for screen reader accessibility. Additionally, hiding purely decorative icons with `aria-hidden="true"` while providing a `title` for mouse users ensures a balanced UX.
**Action:** Always audit dynamically generated DOM elements for missing ARIA attributes, especially when using icon-only or number-only link text.
