## 2025-05-14 - [Setting Input Optimization & Feedback]
**Learning:** For percentage-based settings, replacing text inputs with sliders significantly improves UX by preventing invalid input and providing a more tactile interaction. Additionally, providing immediate visual feedback via `Notice` for silent actions (like batch processing or state changes) is crucial for a responsive feel.
**Action:** Always prefer `addSlider` over `addText` for numeric ranges in Obsidian settings tabs, and ensure every significant user action triggers a confirmation notice.

## 2026-02-21 - [Virtual Link Accessibility & Security UX]
**Learning:** For interactive elements like virtual links that reveal more content on hover, using `:focus-within` is essential for keyboard accessibility. Descriptive ARIA labels (e.g., "Reference 1: File") and hiding decorative characters (e.g., brackets and pipes) significantly improve the screen reader experience. Masking sensitive API inputs as passwords prevents accidental exposure during sharing.
**Action:** Always implement `:focus-within` alongside `:hover` for hidden UI elements, and ensure all generated links have descriptive `aria-label` attributes while marking purely decorative text as `aria-hidden="true"`.
