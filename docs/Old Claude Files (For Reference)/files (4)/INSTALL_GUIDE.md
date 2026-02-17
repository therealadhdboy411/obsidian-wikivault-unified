# WikiVault Ultimate - Installation & Feature Guide

## 🎉 What's New in This Version

### 🌟 **MAJOR: Auto-Detection of Non-Wikilinked Mentions**

**The game-changer:** WikiVault now finds mentions EVEN IF NOT WIKILINKED!

```markdown
Before: Only finds [[Machine Learning]]
Now: Finds "Machine Learning" anywhere in your vault!
```

### Complete Feature List (20+ Features)

1. ✅ **Auto-Detect Plain-Text Mentions** - NEW!
2. ✅ **Optional Auto-Create Wikilinks** - NEW!
3. ✅ **Smart Variation Matching** - NEW! (singular/plural/synonyms)
4. ✅ **Priority Queue Processing**
5. ✅ **Wikipedia Integration** (links + excerpts)
6. ✅ **Dictionary API** (definitions)
7. ✅ **Context Injection** (vault + dictionary + Wikipedia)
8. ✅ **Custom Glossary Support**
9. ✅ **Synonym/Abbreviation Detection**
10. ✅ **Auto-Generated Tags**
11. ✅ **Related Concepts Suggestions**
12. ✅ **Model Tracking**
13. ✅ **Batch Processing** (3x faster)
14. ✅ **Progress Bar with ETA**
15. ✅ **Ribbon Icon**
16. ✅ **Plural Handling**
17. ✅ **Full Paragraph Extraction**
18. ✅ **Heading Context**
19. ✅ **Fuzzy Matching**
20. ✅ **LM Studio Support**

---

## 📥 Installation

### 1. Backup (Important!)
```
.obsidian/plugins/obsidian-wikivault/
├── main.js (backup)
└── data.json (backup)
```

### 2. Install Files
Replace in `.obsidian/plugins/obsidian-wikivault/`:
- ✅ `main.js` (new version with auto-detection)
- ✅ `data.json` (updated settings)

### 3. Restart Obsidian
- Close and reopen Obsidian, OR
- Settings → Community Plugins → Toggle WikiVault off/on

### 4. Verify Installation
Check Settings → WikiVault for new section:
- "Auto-Detection & Linking" ✅

---

## ⚙️ Quick Configuration

### Recommended (Balanced)
```json
{
  "autoDetectMentions": true,
  "autoCreateWikilinks": false,
  "minWordLengthForAutoDetect": 3,
  "useWikipedia": true,
  "useDictionaryAPI": true,
  "generateRelatedConcepts": true,
  "batchSize": 5
}
```

### Conservative (Safe)
```json
{
  "autoDetectMentions": true,
  "autoCreateWikilinks": false,
  "minWordLengthForAutoDetect": 4,
  "useWikipedia": false,
  "useDictionaryAPI": false,
  "batchSize": 3
}
```

### Aggressive (Power User)
```json
{
  "autoDetectMentions": true,
  "autoCreateWikilinks": true,
  "minWordLengthForAutoDetect": 2,
  "useWikipedia": true,
  "useDictionaryAPI": true,
  "generateRelatedConcepts": true,
  "batchSize": 10
}
```

---

## 🚀 First Test

### 1. Create Test Notes

**Note 1: "AI Research.md"**
```markdown
I'm exploring machine learning and deep learning.
Neural networks show promising results.
Working with Python and TensorFlow.
```

**Note 2: "Project.md"**
```markdown
Our [[Machine Learning]] model is ready.
Need to study more about neural networks.
```

### 2. Run WikiVault
Click book icon in ribbon (or Command Palette → "Generate missing Wikilink notes")

### 3. Check Results

**Generated: "Machine Learning.md"**
```markdown
---
generated: 2024-02-15T10:30:00.000Z
model: mistral-small-latest
tags: [ai, data-science]
---

# Machine Learning

## Wikipedia

[Read more on Wikipedia](https://en.wikipedia.org/wiki/Machine_learning)

Machine learning is a field of study...

## AI Summary

> Based on your notes, machine learning is what you're exploring 
> along with deep learning. Your model is ready for deployment...

## Related Concepts

- [[Deep Learning]]
- [[Neural Networks]]
- [[Python]]

## Mentions

### From [[AI Research]] [plain text]
> I'm exploring machine learning and deep learning.

### From [[Project]] [wikilinked]
> Our [[Machine Learning]] model is ready.
```

**Notice:**
- ✅ Found "machine learning" WITHOUT wikilinks
- ✅ Found `[[Machine Learning]]` WITH wikilinks
- ✅ Both included in mentions
- ✅ Labels show [plain text] vs [wikilinked]

---

## 🎯 Key Features Explained

### Auto-Detection

**What it does:** Finds mentions even without `[[wikilinks]]`

**Example:**
```markdown
You write: "I'm learning about Machine Learning"
WikiVault finds it and includes in mentions!
```

**Configuration:**
```json
"autoDetectMentions": true,
"minWordLengthForAutoDetect": 3
```

### Auto-Create Wikilinks

**What it does:** Converts plain text to wikilinks automatically

**⚠️ CAUTION:** Modifies your source files!

**Example:**
```markdown
Before: I'm learning about Machine Learning
After:  I'm learning about [[Machine Learning|Machine Learning]]
```

**Configuration:**
```json
"autoCreateWikilinks": true
```

**Safer alternative:** Use command on single file
```
Command Palette → "Auto-link all mentions in current file"
```

### Smart Variation Matching

**Searches for:**
- Main term: `Machine Learning`
- Singular: `Machine Learning` (same)
- Plural: `Machine Learnings`
- Synonyms: `ML` (if configured)
- Case variations: `machine learning`, `MACHINE LEARNING`

**Example:**
```markdown
Your notes contain:
- "machine learning" (lowercase)
- "ML" (acronym)
- "Machine Learning" (exact)

All three found and included in [[Machine Learning]] note!
```

### Priority Queue

**What it does:** Processes most-mentioned terms first

**Example:**
```
[[API]] - 47 mentions → Priority 1 (processed first)
[[Database]] - 38 mentions → Priority 2
[[Cache]] - 5 mentions → Priority 3 (processed last)
```

**Why it matters:** Most important terms get comprehensive notes faster

---

## 📊 Example Complete Note

```yaml
---
generated: 2024-02-15T10:30:00.000Z
model: mistral-small-latest
provider: mistral
tags:
  - machine-learning
  - artificial-intelligence
  - data-science
---

# Machine Learning

## Wikipedia

[Read more on Wikipedia](https://en.wikipedia.org/wiki/Machine_learning)

Machine learning (ML) is a field of study in artificial intelligence...

## Dictionary Definition

**machine learning** _/məˈʃiːn ˈlɜːrnɪŋ/_

_noun_
1. The use and development of computer systems that can learn from data

## AI Summary

> Based on your notes and reference materials, machine learning is the 
> primary technique you're using for customer segmentation, achieving 
> 87% accuracy with random forest classifiers. You're exploring deep 
> learning extensions and studying foundational concepts.

## Related Concepts

- [[Deep Learning]]
- [[Neural Networks]]
- [[Supervised Learning]]
- [[Random Forest]]
- [[Python]]

## Mentions

### From [[Project Documentation]] → Implementation [wikilinked]

> Our [[Machine Learning]] pipeline processes data in batches of 1000 
> records. Performance is excellent with sub-second response times.

### From [[Study Notes]] [plain text]

> machine learning fundamentals: supervised, unsupervised, reinforcement. 
> Need to understand the mathematical foundations better.

### From [[Meeting Notes]] [plain text]

> Team discussed ML approach for fraud detection. Consensus: start with 
> logistic regression as baseline before trying neural networks.

### From [[Reading Log]] → Chapter 3 [plain text]

> The book explains machine learning as learning from examples rather 
> than being explicitly programmed. Key insight: pattern recognition.
```

**Features shown:**
- ✅ Wikipedia link + excerpt
- ✅ Dictionary definition
- ✅ AI summary (from YOUR notes)
- ✅ Related concepts
- ✅ Tags (auto-generated)
- ✅ Model tracking
- ✅ Mixed mentions (wikilinked + plain text)
- ✅ Heading context
- ✅ Full paragraphs

---

## 🔧 Settings Guide

### Auto-Detection & Linking
| Setting | Description | Default | Recommendation |
|---------|-------------|---------|----------------|
| Auto-Detect Mentions | Find plain-text mentions | ✅ true | Keep enabled |
| Auto-Create Wikilinks | Convert to wikilinks | ❌ false | Test first |
| Min Word Length | Minimum chars to match | 3 | 3-4 |
| Case-Sensitive | Exact case match | ❌ false | Usually false |
| Whole Words Only | Match complete words | ✅ true | Keep enabled |

### Knowledge Sources
| Setting | Description | Default |
|---------|-------------|---------|
| Use Wikipedia | Fetch Wikipedia | ✅ true |
| Use Dictionary | Fetch definitions | ✅ true |
| Wikipedia in Context | Pass to AI | ✅ true |
| Dictionary in Context | Pass to AI | ✅ true |
| Glossary Path | Custom glossary | empty |

### AI Generation
| Setting | Description | Default |
|---------|-------------|---------|
| Generate Tags | Auto-create tags | ❌ false |
| Max Tags | Number of tags | 5 |
| Generate Related | Related concepts | ✅ true |
| Max Related | Number of concepts | 10 |
| Track Model | Record model used | ✅ true |

---

## 🎓 Usage Examples

### Example 1: Academic Research

**Setup:**
```json
{
  "autoDetectMentions": true,
  "useWikipedia": true,
  "generateRelatedConcepts": true
}
```

**Workflow:**
1. Take notes mentioning concepts
2. Don't worry about wikilinks
3. Run WikiVault
4. Get comprehensive wiki notes
5. Follow related concepts
6. Knowledge base grows organically

### Example 2: Company Documentation

**Setup:**
```json
{
  "autoDetectMentions": true,
  "glossaryBasePath": "Company Glossary.md",
  "synonyms": {
    "CS": "Customer Score",
    "AE": "Activation Event"
  }
}
```

**Workflow:**
1. Write docs with company terms
2. Use abbreviations naturally
3. Run WikiVault
4. Get notes with company definitions
5. Abbreviations auto-link to full terms

### Example 3: Knowledge Graph

**Setup:**
```json
{
  "autoDetectMentions": true,
  "generateRelatedConcepts": true,
  "maxRelatedConcepts": 10,
  "usePriorityQueue": true
}
```

**Workflow:**
1. Write naturally (no forced wikilinks)
2. Run WikiVault → Finds 100+ mentions
3. Creates 100+ notes with related concepts
4. Run again → More related concepts found
5. Iterative growth to 1000+ interconnected notes

---

## 🐛 Troubleshooting

### Auto-Detection Not Finding Mentions

**Check:**
1. Is term long enough? (check `minWordLengthForAutoDetect`)
2. Is `autoDetectMentions` enabled?
3. Case mismatch? (check `caseSensitiveMatching`)

**Solution:**
```json
"autoDetectMentions": true,
"minWordLengthForAutoDetect": 2,
"caseSensitiveMatching": false
```

### Too Many False Positives

**Problem:** Matching unwanted text

**Solution:**
```json
"minWordLengthForAutoDetect": 4,
"matchWholeWordsOnly": true
```

### Auto-Linking Not Working

**Check:**
1. `autoCreateWikilinks` enabled?
2. Try command on single file first

**Command:**
```
Command Palette → "Auto-link all mentions in current file"
```

---

## 📚 Documentation

- **AUTO_DETECTION_GUIDE.md** - Complete auto-detection guide
- **ADVANCED_FEATURES_GUIDE.md** - All other features
- **ADVANCED_EXAMPLES.md** - Real-world use cases

---

## ✅ Installation Checklist

- [ ] Backup current files
- [ ] Install new `main.js` and `data.json`
- [ ] Restart Obsidian
- [ ] Check "Auto-Detection & Linking" in settings
- [ ] Configure `autoDetectMentions: true`
- [ ] Leave `autoCreateWikilinks: false` initially
- [ ] Test with a few notes
- [ ] Review generated notes
- [ ] Optionally enable auto-linking
- [ ] Build your knowledge base!

---

## 🎉 Summary

**What makes this version special:**

1. **Finds mentions WITHOUT wikilinks** - Revolutionary!
2. **Smart variation matching** - Singular/plural/synonyms
3. **Optional auto-linking** - Convert plain text to links
4. **20+ features** - Complete knowledge management
5. **Your notes, your knowledge** - AI uses YOUR context

**This is WikiVault evolved from "wikilink processor" to "intelligent knowledge extractor"!** 🚀

---

**Start building your comprehensive knowledge base today!**
