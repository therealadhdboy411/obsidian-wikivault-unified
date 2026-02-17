## 2025-05-14 - Regex Injection in Directory Filters
**Vulnerability:** User-provided directory names were used to construct a `RegExp` without sanitization. This could lead to Regex Denial of Service (ReDoS) or unintended path matching if a directory name contained regex special characters.
**Learning:** The plugin dynamically builds regexes to filter files based on user settings. It assumed directory names would be simple strings, but didn't account for the fact that these strings are interpolated into a `new RegExp()` constructor.
**Prevention:** Always escape user-provided strings before using them in a regular expression. Use a helper like `escapeRegExp` and handle cases where the input list might be empty by using a "never-match" regex like `/$^/`.

## 2025-05-14 - Hardcoded API Key in Documentation
**Vulnerability:** A realistic-looking API key (Mistral AI) was found in a documentation file (`docs/CHANGES_SUMMARY.md`).
**Learning:** Even if intended as an example, hardcoded keys can be accidentally used or leaked. Documentation files are often overlooked during security audits but are part of the repository.
**Prevention:** Use clear placeholders like `your-api-key-here` or `sk-placeholder` in all repository files, including documentation and examples.

## 2025-05-14 - XSS via javascript: URI in Virtual Links
**Vulnerability:** Virtual links were created using file paths as the `href` attribute without validation. A malicious file named `javascript:alert(1).md` could trigger XSS when the virtual link is clicked.
**Learning:** Even internal file paths should be treated as untrusted input when used in sensitive DOM attributes like `href`. Standard Obsidian link handling might be bypassed when a plugin adds its own `<a>` tags.
**Prevention:** Always validate or sanitize URLs before assigning them to `href`. Block `javascript:` and other executable URI schemes.

## 2025-05-14 - Markdown and Wikilink Injection
**Vulnerability:** Link display text was used directly in markdown/wikilink construction. Characters like `[`, `]`, and `|` could break the link syntax and potentially be used for injection.
**Learning:** User-controlled text should be escaped when used to build structured strings like Markdown links to prevent breaking the structure or injecting malicious components.
**Prevention:** Sanitize or escape special characters in link components (text, alias, path) before string concatenation.
