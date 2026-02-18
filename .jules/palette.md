## 2025-05-14 - [Setting Input Optimization & Feedback]
**Learning:** For percentage-based settings, replacing text inputs with sliders significantly improves UX by preventing invalid input and providing a more tactile interaction. Additionally, providing immediate visual feedback via `Notice` for silent actions (like batch processing or state changes) is crucial for a responsive feel.
**Action:** Always prefer `addSlider` over `addText` for numeric ranges in Obsidian settings tabs, and ensure every significant user action triggers a confirmation notice.

## 2025-05-15 - [Keyboard Accessibility for Hover-based UI]
**Learning:** UI elements that reveal additional content only on hover (like the multi-reference indicators in this plugin) are inaccessible to keyboard and screen reader users. Using the CSS `:focus-within` pseudo-class allows these elements to be revealed when a user tabs into them, providing a much more inclusive experience without changing the visual design for mouse users.
**Action:** Whenever implementing hover-to-reveal patterns, always pair them with `:focus-within` or an equivalent focus-based state to ensure keyboard accessibility.
