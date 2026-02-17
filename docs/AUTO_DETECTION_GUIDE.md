# WikiVault Auto-Detection & Auto-Linking - Feature Guide

## 🎯 Major New Feature: Automatic Mention Detection

WikiVault now automatically finds mentions of terms **EVEN IF THEY'RE NOT WIKILINKED**!

### Before (Required Wikilinks)
```markdown
# My Notes

I'm studying Machine Learning for my project.
The Neural Network achieved 95% accuracy.
```

**Result:** No mentions found because terms aren't wikilinked

### After (Auto-Detection Enabled)
```markdown
# My Notes

I'm studying Machine Learning for my project.
The Neural Network achieved 95% accuracy.
```

**Result:** Both mentions found and included in generated notes!

---

## How It Works

### 1. Auto-Detection of Plain-Text Mentions

When processing `[[Machine Learning]]`, WikiVault now:

1. **Searches your entire vault** for the text "Machine Learning"
2. **Finds ALL occurrences** - wikilinked or not
3. **Includes both in Mentions section**:
   - `[wikilinked]` - Already linked
   - `[plain text]` - Found but not linked

### 2. Smart Variation Handling

Automatically searches for:
- **Exact term**: `Machine Learning`
- **Singular/Plural**: `Machine Learnings` (if applicable)
- **Synonyms**: `ML` (if configured)
- **Case variations**: `machine learning`, `MACHINE LEARNING` (configurable)

### 3. Optional Auto-Linking

Can automatically convert plain-text mentions to wikilinks:

**Before:**
```markdown
I'm studying Machine Learning for data science.
```

**After (with auto-create enabled):**
```markdown
I'm studying [[Machine Learning|Machine Learning]] for data science.
```

---

## Example Output

### Generated Note for [[Machine Learning]]

```markdown
---
generated: 2024-02-15T10:30:00.000Z
model: mistral-small-latest
tags:
  - ai
  - data-science
  - algorithms
---

# Machine Learning

## Wikipedia

[Read more on Wikipedia](https://en.wikipedia.org/wiki/Machine_learning)

Machine learning is a field of study...

## AI Summary

> Based on your notes, machine learning is what you're using for customer 
> analysis with neural networks achieving 95% accuracy...

## Mentions

### From [[Project Notes]] → Implementation [wikilinked]

> We're implementing [[Machine Learning]] algorithms for customer 
> segmentation.

### From [[Reading Log]] [plain text]

> I'm studying Machine Learning for data science. The field has grown 
> tremendously in recent years.

### From [[Meeting Notes]] [plain text]

> Team discussion: should we use Machine Learning or traditional 
> statistics for this problem?

### From [[Weekly Summary]] → Progress [wikilinked]

> [[Machine Learning]] model training completed. Results look promising.
```

**Notice:** Both wikilinked and plain-text mentions are included!

---

## Configuration

### Auto-Detection Settings

#### `autoDetectMentions` (Default: true)
Enables automatic detection of non-wikilinked mentions.

**Enabled:**
```
Searches for: "Machine Learning" (plain text)
Finds: All occurrences in vault
Includes: Both [[wikilinked]] and plain text
```

**Disabled:**
```
Searches for: [[Machine Learning]] only
Finds: Only wikilinked mentions
```

#### `minWordLengthForAutoDetect` (Default: 3)
Minimum length to prevent matching common short words.

**Why it matters:**
```
Length 2: Matches "AI", "ML", "is", "to", "an" ❌ Too many false positives
Length 3: Matches "API", "SQL" but not "is", "to" ✅ Better balance
Length 4: Matches "Java", "Ruby" ✅ More selective
```

**Examples:**
```
Setting: 3
✅ Matches: "API" (3 chars), "Machine Learning" (17 chars)
❌ Skips: "ML" (2 chars), "AI" (2 chars)

Setting: 2  
✅ Matches: "ML" (2 chars), "AI" (2 chars)
⚠️ Warning: May match many common words
```

#### `caseSensitiveMatching` (Default: false)
Require exact case match.

**Case-Insensitive (false):**
```
Search for: "Machine Learning"
Matches:
  ✅ "Machine Learning"
  ✅ "machine learning"  
  ✅ "MACHINE LEARNING"
  ✅ "Machine LEARNING"
```

**Case-Sensitive (true):**
```
Search for: "Machine Learning"
Matches:
  ✅ "Machine Learning"
  ❌ "machine learning"
  ❌ "MACHINE LEARNING"
```

**Use case-sensitive when:**
- You have terms with specific capitalization (e.g., "API" vs "api")
- You want to distinguish acronyms from words
- You have proper nouns

#### `matchWholeWordsOnly` (Default: true)
Match complete words only.

**Whole Words Only (true):**
```
Search for: "learning"
Matches:
  ✅ "I'm learning Python"
  ✅ "Machine learning is great"
  ❌ "elearning platform"
  ❌ "relearning concepts"
```

**Partial Match (false):**
```
Search for: "learning"
Matches:
  ✅ "I'm learning Python"
  ✅ "elearning platform"
  ✅ "relearning concepts"
  ⚠️ May cause unwanted matches
```

**Recommendation:** Keep enabled (true) to avoid false positives.

---

### Auto-Linking Settings

#### `autoCreateWikilinks` (Default: false)

**⚠️ CAUTION: This modifies your source files!**

When enabled, automatically converts plain-text mentions to wikilinks.

**How it works:**
1. Finds plain-text mentions
2. Wraps them in `[[...]]` syntax
3. Preserves original text as display text

**Example transformation:**
```markdown
Before: I'm studying Machine Learning and Neural Networks.
After:  I'm studying [[Machine Learning|Machine Learning]] and [[Neural Networks|Neural Networks]].
```

**Safety features:**
- Skips text already wikilinked
- Skips text in code blocks (` ` or ```)
- Processes from longest to shortest term (prevents partial matches)
- Case-preserving (maintains original capitalization)

**How to use:**
1. Set `autoCreateWikilinks: true`
2. Run WikiVault
3. Check your notes - plain text is now linked!

**Alternative:** Use the command
- Command Palette → "Auto-link all mentions in current file"
- This only processes the active file (safer for testing)

---

## Configuration Examples

### Conservative (Safe)
```json
{
  "autoDetectMentions": true,
  "autoCreateWikilinks": false,
  "minWordLengthForAutoDetect": 4,
  "caseSensitiveMatching": false,
  "matchWholeWordsOnly": true
}
```
**Result:** Detects mentions, doesn't modify files, avoids short words

### Aggressive (Power User)
```json
{
  "autoDetectMentions": true,
  "autoCreateWikilinks": true,
  "minWordLengthForAutoDetect": 3,
  "caseSensitiveMatching": false,
  "matchWholeWordsOnly": true
}
```
**Result:** Detects and auto-links everything

### Acronym-Focused
```json
{
  "autoDetectMentions": true,
  "autoCreateWikilinks": false,
  "minWordLengthForAutoDetect": 2,
  "caseSensitiveMatching": true,
  "matchWholeWordsOnly": true
}
```
**Result:** Matches 2-letter acronyms with exact case

---

## Real-World Examples

### Example 1: Academic Writing

**Your Notes:**
```markdown
# Literature Review

Recent advances in machine learning have revolutionized NLP.
Deep learning models achieve state-of-the-art results.
Neural networks require large datasets for training.
```

**Without Auto-Detection:**
- 0 mentions found (nothing wikilinked)

**With Auto-Detection:**
```markdown
## Mentions

### From [[Literature Review]] [plain text]
> Recent advances in machine learning have revolutionized NLP.

### From [[Literature Review]] [plain text]
> Deep learning models achieve state-of-the-art results.

### From [[Literature Review]] [plain text]
> Neural networks require large datasets for training.
```

**With Auto-Linking Enabled:**
```markdown
# Literature Review (AFTER)

Recent advances in [[machine learning|machine learning]] have 
revolutionized [[NLP|NLP]]. [[Deep learning|Deep learning]] models 
achieve state-of-the-art results. [[Neural networks|Neural networks]] 
require large datasets for training.
```

### Example 2: Multi-Word Terms

**Setup:**
```
Note exists: [[Machine Learning]]
Variations: ML, machine learning, MACHINE LEARNING
```

**Your Notes:**
```markdown
# Project Log

Started ML project today. Using machine learning for predictions.
The MACHINE LEARNING model trained overnight.
Our [[Machine Learning]] implementation is complete.
```

**Generated Note Mentions:**
```markdown
## Mentions

### From [[Project Log]] [plain text]
> Started ML project today.

### From [[Project Log]] [plain text]
> Using machine learning for predictions.

### From [[Project Log]] [plain text]
> The MACHINE LEARNING model trained overnight.

### From [[Project Log]] [wikilinked]
> Our [[Machine Learning]] implementation is complete.
```

**Notice:** All 4 mentions found (3 plain text, 1 wikilinked)!

### Example 3: Singular/Plural Handling

**Setup:**
```
Note exists: [[Neural Network]]
Auto-detects: "Neural Network", "Neural Networks", "neural network"
```

**Your Notes:**
```markdown
# Deep Learning Notes

Neural networks are powerful models.
A neural network consists of layers.
Our [[Neural Networks]] paper is published.
```

**Generated Note:**
```markdown
## Mentions

### From [[Deep Learning Notes]] [plain text]
> Neural networks are powerful models.

### From [[Deep Learning Notes]] [plain text]
> A neural network consists of layers.

### From [[Deep Learning Notes]] [wikilinked]
> Our [[Neural Networks]] paper is published.
```

---

## Best Practices

### 1. Start Conservative

**First time:** 
```json
{
  "autoDetectMentions": true,
  "autoCreateWikilinks": false
}
```

- See what gets detected
- Review the Mentions sections
- Verify accuracy before enabling auto-linking

### 2. Test on One File First

Use command:
```
Command Palette → "Auto-link all mentions in current file"
```

- Test on a single file
- Check the results
- If good, enable `autoCreateWikilinks` for full vault

### 3. Adjust Minimum Length

**If too many false positives:**
```json
"minWordLengthForAutoDetect": 4  // or 5
```

**If missing important short terms:**
```json
"minWordLengthForAutoDetect": 2,
"synonyms": {
  "ML": "Machine Learning",
  "AI": "Artificial Intelligence"
}
```

### 4. Use Whole Words

**Keep enabled:**
```json
"matchWholeWordsOnly": true
```

Prevents "learning" from matching inside "elearning"

### 5. Handle Acronyms Carefully

**Option A: Case-sensitive**
```json
"caseSensitiveMatching": true,
"minWordLengthForAutoDetect": 2
```
Matches "AI", "ML" but not "is", "to"

**Option B: Synonym mapping**
```json
"caseSensitiveMatching": false,
"synonyms": {
  "ML": "Machine Learning",
  "API": "Application Programming Interface"
}
```
Explicitly define acronyms

---

## Troubleshooting

### Too Many False Positives

**Problem:** Finding unwanted matches

**Solutions:**
1. Increase `minWordLengthForAutoDetect`
2. Enable `matchWholeWordsOnly`
3. Enable `caseSensitiveMatching` for specific terms

### Missing Important Mentions

**Problem:** Not finding all occurrences

**Check:**
1. Is term long enough? (check `minWordLengthForAutoDetect`)
2. Case mismatch? (check `caseSensitiveMatching`)
3. Inside another word? (check `matchWholeWordsOnly`)

**Solutions:**
1. Lower `minWordLengthForAutoDetect`
2. Disable `caseSensitiveMatching`
3. Add variations to `synonyms`

### Auto-Linking Not Working

**Problem:** Text not being converted to wikilinks

**Check:**
1. Is `autoCreateWikilinks` enabled?
2. Is text already wikilinked?
3. Is text in a code block?

**Debug:**
Run command on single file first:
```
"Auto-link all mentions in current file"
```

### Links Look Wrong

**Problem:** Links have strange formatting

**This is expected:**
```markdown
[[Machine Learning|Machine Learning]]
```

The format `[[target|display]]` preserves original text case.

**To simplify (manual):**
```markdown
[[Machine Learning]]
```

---

## Advanced Usage

### Combine with Priority Queue

**Setup:**
```json
{
  "autoDetectMentions": true,
  "usePriorityQueue": true
}
```

**Result:**
1. Counts all mentions (wikilinked + plain text)
2. Processes most-mentioned terms first
3. Most important terms get comprehensive notes faster

### Selective Auto-Linking

**Don't want to auto-link everything?**

1. Keep `autoCreateWikilinks: false`
2. Manually use command on specific files:
   ```
   "Auto-link all mentions in current file"
   ```
3. Selective control over which files get linked

### Build Knowledge Graph Organically

**Workflow:**
1. Enable `autoDetectMentions: true`
2. Enable `generateRelatedConcepts: true`
3. Run WikiVault multiple times

**What happens:**
- Iteration 1: Creates 50 notes from plain-text mentions
- Iteration 2: Finds more mentions + related concepts → 200 notes
- Iteration 3: Continues growing
- Result: Comprehensive knowledge graph from unstructured notes!

---

## Performance Impact

### Detection Speed
- **Fast:** Regex-based search
- **Scales well:** 1000+ notes processed quickly
- **Minimal impact:** ~50ms per note

### Auto-Linking Speed
- **Moderate:** File modification required
- **Batch processing:** Multiple files in parallel
- **Recommendation:** Start with small vaults

---

## Safety & Backups

### Before Enabling Auto-Linking

1. **Backup your vault**
2. **Test on a copy** of your vault first
3. **Try one file** with the command
4. **Check git diff** if using version control

### Reversing Auto-Links

**If you don't like the results:**

1. **Use git:** `git revert`
2. **Manual find/replace:**
   ```
   Find: \[\[([^\]|]+)\|\1\]\]
   Replace: $1
   ```
3. **Restore from backup**

---

## Summary

### Key Features

✅ **Auto-Detect Mentions** - Find terms even without wikilinks
✅ **Smart Variations** - Handles plural, synonyms, case
✅ **Optional Auto-Linking** - Convert plain text to wikilinks
✅ **Safe Defaults** - Detection on, linking off
✅ **Configurable** - Fine-tune for your use case

### Recommended Setup

```json
{
  "autoDetectMentions": true,
  "autoCreateWikilinks": false,
  "minWordLengthForAutoDetect": 3,
  "caseSensitiveMatching": false,
  "matchWholeWordsOnly": true
}
```

### Next Steps

1. ✅ Enable `autoDetectMentions`
2. ✅ Run WikiVault
3. ✅ Review generated notes
4. ✅ If satisfied, optionally enable `autoCreateWikilinks`
5. ✅ Build amazing knowledge base!

---

**This feature transforms WikiVault from "wikilink processor" to "intelligent knowledge extractor"!** 🚀
