## 2025-05-14 - [Setting Input Optimization & Feedback]
**Learning:** For percentage-based settings, replacing text inputs with sliders significantly improves UX by preventing invalid input and providing a more tactile interaction. Additionally, providing immediate visual feedback via `Notice` for silent actions (like batch processing or state changes) is crucial for a responsive feel.
**Action:** Always prefer `addSlider` over `addText` for numeric ranges in Obsidian settings tabs, and ensure every significant user action triggers a confirmation notice.

## 2025-05-15 - [A11y-First Multi-Reference UI]
**Learning:** Hover-only interactions for secondary information (like multi-file matches) create a significant barrier for keyboard users. Utilizing CSS `:focus-within` ensures that hidden UI elements become visible when any of their children receive focus. Additionally, moving decorative characters (like separators) out of anchor tags prevents them from cluttering the screen reader's accessible name for the link.
**Action:** Always pair `:hover` with `:focus-within` for revealing hidden content, and ensure decorative separators are wrapped in spans with `aria-hidden="true"` outside of interactive elements.
