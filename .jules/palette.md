## 2025-05-14 - [Setting Input Optimization & Feedback]
**Learning:** For percentage-based settings, replacing text inputs with sliders significantly improves UX by preventing invalid input and providing a more tactile interaction. Additionally, providing immediate visual feedback via `Notice` for silent actions (like batch processing or state changes) is crucial for a responsive feel.
**Action:** Always prefer `addSlider` over `addText` for numeric ranges in Obsidian settings tabs, and ensure every significant user action triggers a confirmation notice.

## 2026-02-22 - [Keyboard Accessibility for Hover-Revealed Elements]
**Learning:** Elements revealed only on hover (like multi-file reference lists) are inaccessible to keyboard users. Using `:focus-within` on the parent container ensures that these elements are also revealed when any of their child interactive elements (links) receive focus, maintaining a consistent experience across different input methods.
**Action:** Always pair `:hover` with `:focus-within` for visibility-toggling CSS to ensure keyboard accessibility.
