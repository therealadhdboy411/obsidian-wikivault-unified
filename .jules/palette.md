## 2025-05-14 - [Setting Input Optimization & Feedback]
**Learning:** For percentage-based settings, replacing text inputs with sliders significantly improves UX by preventing invalid input and providing a more tactile interaction. Additionally, providing immediate visual feedback via `Notice` for silent actions (like batch processing or state changes) is crucial for a responsive feel.
**Action:** Always prefer `addSlider` over `addText` for numeric ranges in Obsidian settings tabs, and ensure every significant user action triggers a confirmation notice.

## 2025-05-15 - [Virtual Link Accessibility & Security]
**Learning:** Virtual links and multi-reference indicators must be accessible to keyboard and screen reader users. Using `:focus-within` in CSS allows hover-only content to be accessible via tab navigation, and adding descriptive `aria-label` attributes to dynamically generated links (e.g., "Virtual link to [File]") provides critical context that raw text like "1" or "🔗" lacks. Additionally, masking sensitive API keys with `type="password"` is a standard but often overlooked UX/privacy best practice.
**Action:** Always verify that hover-triggered UI elements are also accessible via `:focus-within` or `:focus`, and ensure all interactive elements have meaningful ARIA labels.
