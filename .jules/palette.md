## 2025-05-14 - [Setting Input Optimization & Feedback]
**Learning:** For percentage-based settings, replacing text inputs with sliders significantly improves UX by preventing invalid input and providing a more tactile interaction. Additionally, providing immediate visual feedback via `Notice` for silent actions (like batch processing or state changes) is crucial for a responsive feel.
**Action:** Always prefer `addSlider` over `addText` for numeric ranges in Obsidian settings tabs, and ensure every significant user action triggers a confirmation notice.

## 2025-05-22 - [Keyboard Accessibility & Screen Reader Context for Dynamic Links]
**Learning:** Hover-based UI elements (like multi-reference lists) are inaccessible to keyboard users unless paired with `:focus-within` or similar focus-triggering logic. Furthermore, numbered links (e.g., [ 1 | 2 ]) lack context for screen readers; providing explicit `aria-label` and `title` attributes, and moving decorative separators outside the link text, significantly improves the experience for assistive technology.
**Action:** Always use `:focus-within` to reveal hover-only content when its children gain focus. Ensure all dynamically generated links have descriptive ARIA labels, especially if the link text is a number or icon.
