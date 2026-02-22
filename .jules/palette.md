## 2025-05-14 - [Setting Input Optimization & Feedback]
**Learning:** For percentage-based settings, replacing text inputs with sliders significantly improves UX by preventing invalid input and providing a more tactile interaction. Additionally, providing immediate visual feedback via `Notice` for silent actions (like batch processing or state changes) is crucial for a responsive feel.
**Action:** Always prefer `addSlider` over `addText` for numeric ranges in Obsidian settings tabs, and ensure every significant user action triggers a confirmation notice.

## 2025-05-22 - [Keyboard Accessibility for Hover-Reveal Elements]
**Learning:** Pairing `:hover` with `:focus-within` on a parent container ensures that elements revealed on mouse-over (like multi-file reference lists) are also accessible to keyboard users when they tab into the primary interactive element.
**Action:** Always use `:focus-within` alongside `:hover` for any progressive disclosure UI pattern to maintain keyboard parity.

## 2025-05-22 - [Descriptive ARIA Labels for Virtual Links]
**Learning:** Virtual links generated from plain text benefit greatly from descriptive `aria-label` attributes that clarify the link's destination (e.g., "Virtual link to [Filename]") rather than just reading the anchor text, which may be ambiguous. Moving decorative separators (like pipes) outside the link tag further reduces screen reader noise.
**Action:** Provide explicit ARIA labels for dynamically generated links and keep decorative characters outside the focusable link area.
