## 2025-05-14 - Regex Injection in Directory Filters
**Vulnerability:** User-provided directory names were used to construct a `RegExp` without sanitization. This could lead to Regex Denial of Service (ReDoS) or unintended path matching if a directory name contained regex special characters.
**Learning:** The plugin dynamically builds regexes to filter files based on user settings. It assumed directory names would be simple strings, but didn't account for the fact that these strings are interpolated into a `new RegExp()` constructor.
**Prevention:** Always escape user-provided strings before using them in a regular expression. Use a helper like `escapeRegExp` and handle cases where the input list might be empty by using a "never-match" regex like `/$^/`.

## 2025-05-14 - Hardcoded API Key in Documentation
**Vulnerability:** A realistic-looking API key (Mistral AI) was found in a documentation file (`docs/CHANGES_SUMMARY.md`).
**Learning:** Even if intended as an example, hardcoded keys can be accidentally used or leaked. Documentation files are often overlooked during security audits but are part of the repository.
**Prevention:** Use clear placeholders like `your-api-key-here` or `sk-placeholder` in all repository files, including documentation and examples.

## 2026-02-17 - Denial of Service via Frontmatter Property Access
**Vulnerability:** User-configurable property names were used to access Obsidian frontmatter without validation. If set to a built-in JavaScript property like `constructor`, the plugin would attempt to iterate over a non-iterable value (the `Object` constructor), causing a crash during background indexing.
**Learning:** Dynamic property access on objects populated from external data (like frontmatter) can be dangerous if the key matches built-in object members. This is a subtle form of prototype-related vulnerability that can lead to DoS.
**Prevention:** Always validate that the value retrieved from an object using a dynamic key is of the expected type (e.g., `Array.isArray()`) before use. Additionally, maintain a blacklist of forbidden property names for user settings.

## 2026-05-22 - Markdown and Wikilink Injection in Link Conversion
**Vulnerability:** User-controlled text from notes was interpolated directly into Markdown and Wikilink syntax when converting virtual links to real links. This allowed for link breakage or content injection if the text contained characters like `]`, `[[`, or `|`.
**Learning:** Even internal tool transformations must treat document content as untrusted when using it to build structured syntax. Markdown parsers are particularly sensitive to unescaped brackets in link text and unquoted spaces or parentheses in URLs.
**Prevention:** Always sanitize link text by escaping brackets for Markdown and removing link-breaking characters for Wikilinks. Wrap Markdown URLs in `<...>` if they contain special characters (spaces or parentheses) to ensure they are parsed as a single unit according to CommonMark.

## 2026-05-23 - Exposure of Sensitive API Keys in Settings UI
**Vulnerability:** API keys for OpenAI and LM Studio were displayed in plain text within the Obsidian settings tab. This posed a risk of accidental exposure during screen sharing, screen recordings, or shoulder surfing.
**Learning:** Standard UI components (like Obsidian's `addText`) default to plain text. Security-sensitive fields must be explicitly configured to mask input.
**Prevention:** Always set `text.inputEl.type = 'password'` for any setting component that handles credentials or sensitive tokens.
