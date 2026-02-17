## 2025-05-14 - Regex Injection in Directory Filters
**Vulnerability:** User-provided directory names were used to construct a `RegExp` without sanitization. This could lead to Regex Denial of Service (ReDoS) or unintended path matching if a directory name contained regex special characters.
**Learning:** The plugin dynamically builds regexes to filter files based on user settings. It assumed directory names would be simple strings, but didn't account for the fact that these strings are interpolated into a `new RegExp()` constructor.
**Prevention:** Always escape user-provided strings before using them in a regular expression. Use a helper like `escapeRegExp` and handle cases where the input list might be empty by using a "never-match" regex like `/$^/`.

## 2025-05-14 - Hardcoded API Key in Documentation
**Vulnerability:** A realistic-looking API key (Mistral AI) was found in a documentation file (`docs/CHANGES_SUMMARY.md`).
**Learning:** Even if intended as an example, hardcoded keys can be accidentally used or leaked. Documentation files are often overlooked during security audits but are part of the repository.
**Prevention:** Use clear placeholders like `your-api-key-here` or `sk-placeholder` in all repository files, including documentation and examples.
