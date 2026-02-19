## 2025-05-14 - [Setting Input Optimization & Feedback]
**Learning:** For percentage-based settings, replacing text inputs with sliders significantly improves UX by preventing invalid input and providing a more tactile interaction. Additionally, providing immediate visual feedback via `Notice` for silent actions (like batch processing or state changes) is crucial for a responsive feel.
**Action:** Always prefer `addSlider` over `addText` for numeric ranges in Obsidian settings tabs, and ensure every significant user action triggers a confirmation notice.

## 2025-05-16 - [Note Customization & Preservation]
**Learning:** Users have diverse note-taking styles and fear losing manual edits to AI-generated content.
**Action:** Introduced a template system with variable substitution and a dedicated "User Edits" section that is preserved during regeneration.

## 2025-05-16 - [Selective AI Control]
**Learning:** Automatic vault-wide generation can be overwhelming and sometimes undesired for specific term patterns.
**Action:** Added regex-based "Exclude patterns" and explicit commands for manual triggering of generation.
