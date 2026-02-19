## 2025-05-14 - [Setting Input Optimization & Feedback]
**Learning:** For percentage-based settings, replacing text inputs with sliders significantly improves UX by preventing invalid input and providing a more tactile interaction. Additionally, providing immediate visual feedback via `Notice` for silent actions (like batch processing or state changes) is crucial for a responsive feel.
**Action:** Always prefer `addSlider` over `addText` for numeric ranges in Obsidian settings tabs, and ensure every significant user action triggers a confirmation notice.

## 2025-05-15 - [Keyboard Accessibility for Hover Content]
**Learning:** Content that is only visible on hover (like multi-reference links in the Virtual Linker) is inaccessible to keyboard users. Using `:focus-within` in CSS allows this content to be revealed when any child element receives focus, ensuring full accessibility for non-mouse users.
**Action:** Always use `:focus-within` alongside `:hover` for any UI pattern that reveals hidden interactive elements.

## 2025-05-15 - [Privacy in Settings UI]
**Learning:** API keys and other sensitive tokens should always be masked in the settings UI. In Obsidian's `Setting` API, this is done by setting `text.inputEl.type = 'password'` within the `addText` callback.
**Action:** Default to password types for all API key inputs to prevent accidental exposure during screen sharing.
