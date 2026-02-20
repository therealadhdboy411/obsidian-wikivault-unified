## 2025-05-14 - [Setting Input Optimization & Feedback]
**Learning:** For percentage-based settings, replacing text inputs with sliders significantly improves UX by preventing invalid input and providing a more tactile interaction. Additionally, providing immediate visual feedback via `Notice` for silent actions (like batch processing or state changes) is crucial for a responsive feel.
**Action:** Always prefer `addSlider` over `addText` for numeric ranges in Obsidian settings tabs, and ensure every significant user action triggers a confirmation notice.

## 2025-05-15 - [Keyboard Accessibility & Screen Reader Clarity]
**Learning:** Decorative characters (like pipe separators) inside link tags clutter screen reader output. Moving them to separate elements with `aria-hidden="true"` ensures cleaner descriptions. Additionally, using `:focus-within` in CSS is essential for making hover-only UI elements accessible to keyboard users.
**Action:** Always move decorative separators outside of anchor tags and use `:focus-within` to mirror `:hover` visibility logic for nested interactive elements.
