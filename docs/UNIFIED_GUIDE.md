# WikiVault Unified - Complete Guide

## 🎉 One Plugin, Complete Solution

**WikiVault Unified** combines Virtual Linker's smart rendering with WikiVault's note generation into one powerful plugin.

## ✨ Features

### From Virtual Linker
- ✅ **Visual virtual links** - See links as you type
- ✅ **Smart multi-word matching** - "Smooth Muscle" > "Smooth"
- ✅ **No file modification** - Links are visual overlays
- ✅ **Hover to see alternatives** - Multiple file matches shown
- ✅ **Customizable styling** - Emoji suffix, colors, etc.

### From WikiVault
- ✅ **AI-powered summaries** - Based on YOUR notes
- ✅ **Wikipedia integration** - Links + excerpts
- ✅ **Dictionary definitions** - Automatic lookups
- ✅ **Priority queue** - Most-mentioned terms first
- ✅ **Related concepts** - Auto-suggested connections
- ✅ **Tags** - Auto-generated
- ✅ **Model tracking** - Know which AI generated what

### New Features
- ✅ **File type filtering** - Exclude images, PDFs, etc.
- ✅ **Category-based organization** - Different subfolders
- ✅ **Auto-categorization** - Based on source folder/tags
- ✅ **Unified experience** - One plugin, one settings panel

---

## 📁 Category System

### What Are Categories?

Categories let you organize wiki notes into logical subfolders based on topic, subject, or source.

**Example structure:**
```
Wiki/
├── Anatomy and Physiology/
│   ├── Smooth Muscle.md
│   ├── Cardiac Muscle.md
│   └── Neural Tissue.md
├── Biochemistry/
│   ├── Enzyme.md
│   ├── Protein.md
│   └── ATP.md
└── General/
    ├── Machine Learning.md
    └── Python.md
```

### How Categories Work

**Automatic assignment based on:**

1. **Source folder** - Where the note mentioning the term is located
2. **Tags** - Tags in the source note
3. **Manual override** - Specify in settings

**Example:**

```markdown
# Notes/Anatomy/Chapter 7.md
tags: [anatomy, tissue]

Content mentions [[Smooth Muscle]]
```

**Result:** `Smooth Muscle.md` created in `Wiki/Anatomy and Physiology/`

### Configuring Categories

```json
{
  "categories": [
    {
      "name": "Anatomy and Physiology",
      "path": "Wiki/Anatomy and Physiology",
      "sourceFolder": "Notes/Anatomy",
      "tags": ["anatomy", "physiology"],
      "enabled": true
    },
    {
      "name": "Biochemistry",
      "path": "Wiki/Biochemistry",
      "sourceFolder": "Notes/Biochemistry",
      "tags": ["biochemistry", "chemistry"],
      "enabled": true
    },
    {
      "name": "General",
      "path": "Wiki/General",
      "sourceFolder": "",
      "tags": [],
      "enabled": true
    }
  ],
  "defaultCategory": "General",
  "autoAssignCategory": true
}
```

### Category Assignment Logic

```
For term "Smooth Muscle" mentioned in note:

1. Check source folder:
   - Is note in "Notes/Anatomy"? → Use "Anatomy and Physiology"
   - Is note in "Notes/Biochemistry"? → Use "Biochemistry"

2. Check tags:
   - Has tag #anatomy? → Use "Anatomy and Physiology"
   - Has tag #biochemistry? → Use "Biochemistry"

3. Multiple matches:
   - Use first matching category
   - Or use most specific (folder > tags)

4. No match:
   - Use "General" (default category)
```

### Adding New Categories

**In settings UI:**
```
Category Name: Computer Science
Wiki Path: Wiki/Computer Science
Source Folder: Notes/CS
Tags: cs, programming, algorithms
Enabled: ✅
```

**Or in data.json:**
```json
{
  "name": "Computer Science",
  "path": "Wiki/Computer Science",
  "sourceFolder": "Notes/CS",
  "tags": ["cs", "programming", "algorithms"],
  "enabled": true
}
```

---

## 🚫 File Type Filtering

### What It Does

Prevents certain file types from being linked or processed.

**Default excluded:**
```json
"excludedFileTypes": [
  "png", "jpg", "jpeg", "gif", "svg",  // Images
  "pdf",                                // Documents
  "mp4", "mp3", "wav"                   // Media
]
```

### Why Filter?

**Problem without filtering:**
```markdown
Your note: "Check image.png for diagram"

Without filter: [image.png]🔗 (tries to link/generate wiki)
With filter: "Check image.png for diagram" (ignored)
```

### Custom Filtering

**Add more types:**
```json
"excludedFileTypes": [
  "png", "jpg", "jpeg", "gif", "svg",
  "pdf", "docx", "xlsx",
  "mp4", "mp3", "wav",
  "zip", "tar", "gz"
]
```

**Filter by pattern:**
```json
"excludedFilePatterns": [
  ".*\\.backup$",        // Backup files
  "^temp-.*",            // Temp files
  ".*\\[draft\\].*"      // Draft files
]
```

---

## 🔗 Virtual Link Rendering

### How It Works

**Your file:** `"Certain smooth muscles can divide"`

**Visual rendering:**
```
Certain [smooth muscles]🔗 can divide
        ^^^^^^^^^^^^^^^
        (clickable overlay, not in file!)
```

**File still contains:** `"Certain smooth muscles can divide"`

**When you hover:**
```
┌─────────────────────────────┐
│ Smooth Muscle               │
│ (or: Smooth, Muscle)        │
│ Click to open               │
└─────────────────────────────┘
```

### Virtual Link Settings

```json
{
  "virtualLinksEnabled": true,
  "virtualLinkSuffix": "🔗",
  "applyDefaultLinkStyling": true,
  "matchWholeWordsOnly": true,
  "onlyLinkOnce": true,
  "excludeLinksToOwnNote": true,
  "excludeLinksToRealLinkedFiles": true
}
```

**Settings explained:**

| Setting | Description | Default |
|---------|-------------|---------|
| `virtualLinksEnabled` | Show virtual links | true |
| `virtualLinkSuffix` | Emoji/symbol after link | 🔗 |
| `applyDefaultLinkStyling` | Use default colors | true |
| `matchWholeWordsOnly` | Only complete words | true |
| `onlyLinkOnce` | Link first occurrence only | true |
| `excludeLinksToOwnNote` | Skip self-links | true |
| `excludeLinksToRealLinkedFiles` | Skip if already `[[linked]]` | true |

### Customizing Appearance

**Default style:**
```css
.virtual-link a {
    filter: brightness(0.6);
    text-decoration-thickness: 1px;
}

.virtual-link a:hover {
    filter: brightness(1.0);
}
```

**Custom style** (in `.obsidian/snippets/wikivault.css`):
```css
.virtual-link a {
    color: #9b59b6;
    text-decoration-style: dotted;
    text-underline-offset: 2px;
}

.virtual-link a:hover {
    color: #e74c3c;
    background-color: rgba(231, 76, 60, 0.1);
}
```

---

## 🎯 Smart Multi-Word Matching

### The Problem

Text: `"Certain smooth muscles can divide"`

**Files exist:**
- `Smooth Muscle.md`
- `Smooth.md`
- `Muscle.md`

**Question:** Which should be linked?

### The Solution

**Prefer longer matches:**

1. Check 3-word combinations: "Certain smooth muscles" ❌
2. Check 2-word combinations: "smooth muscles" ✅ → `Smooth Muscle.md`
3. Skip overlapping 1-word: "smooth" (overlaps), "muscles" (overlaps)

**Result:** Links to `Smooth Muscle.md` (most specific)

### Configuration

```json
{
  "preferLongerMatches": true,
  "maxWordsToMatch": 3,
  "showAllPossibleMatches": true
}
```

**With `showAllPossibleMatches: true`:**

**Hover popup shows:**
```
┌──────────────────────────┐
│ Smooth Muscle (preferred)│
│ ─────────────────────────│
│ Other matches:           │
│ • Smooth                 │
│ • Muscle                 │
└──────────────────────────┘
```

### Match Modes

```json
{
  "matchWholeWordsOnly": true,      // "book" ≠ "notebook"
  "matchBeginningOfWords": true,    // "note" = "notebook"
  "matchEndOfWords": true,          // "book" = "notebook"
  "matchAnyPartsOfWords": false     // "ook" = "notebook"
}
```

**Recommended:** Use `matchWholeWordsOnly: true` for best results.

---

## 📝 Generated Wiki Notes

### Example: Anatomy Category

**Source note:** `Notes/Anatomy/Chapter 7.md`
```markdown
---
tags: [anatomy, tissue]
---

# Chapter 7: Bone Tissue

Certain smooth muscles can divide, increase in numbers.
```

**Generated:** `Wiki/Anatomy and Physiology/Smooth Muscle.md`
```markdown
---
generated: 2024-02-16T04:30:00.000Z
model: mistral-small-latest
provider: mistral
category: Anatomy and Physiology
tags:
  - anatomy
  - muscle
  - tissue
---

# Smooth Muscle

## Wikipedia

[Read more on Wikipedia](https://en.wikipedia.org/wiki/Smooth_muscle)

Smooth muscle is an involuntary non-striated muscle found in the 
walls of hollow organs...

## Dictionary Definition

**smooth muscle**

_noun_
1. Muscle tissue that contracts without conscious control

## AI Summary

> Based on your anatomy notes, smooth muscles are involuntary muscles 
> that can divide and increase in numbers, unlike skeletal muscle. 
> They're found in hollow organs and exhibit unique contractile properties.

## Related Concepts

- [[Cardiac Muscle]]
- [[Skeletal Muscle]]
- [[Muscle Tissue]]
- [[Involuntary Control]]
- [[Cell Division]]

## Mentions

### From [[Chapter 7 Bone Tissue]] → Introduction [virtual link]

**Detected:** "smooth muscles" → [[Smooth Muscle]]
**Category:** Anatomy and Physiology (from tags: anatomy)

> Certain smooth muscles can divide, increase in numbers

### From [[Histology Notes]] → Muscle Types [wikilinked]

> [[Smooth Muscle]] differs from striated muscle in organization
```

---

## ⚙️ Complete Settings Reference

### AI Configuration

```json
{
  "provider": "mistral",
  "openaiEndpoint": "https://api.mistral.ai/v1",
  "openaiApiKey": "your-key-here",
  "modelName": "mistral-small-latest",
  "apiType": "openai",
  "systemPrompt": "You are a helpful assistant...",
  "userPromptTemplate": "Based on {{context}}..."
}
```

### Virtual Link Settings

```json
{
  "virtualLinksEnabled": true,
  "virtualLinkSuffix": "🔗",
  "applyDefaultLinkStyling": true,
  "matchWholeWordsOnly": true,
  "matchBeginningOfWords": true,
  "matchEndOfWords": true,
  "matchAnyPartsOfWords": false,
  "caseSensitiveMatching": false,
  "onlyLinkOnce": true,
  "excludeLinksToOwnNote": true,
  "excludeLinksToRealLinkedFiles": true,
  "minWordLengthForAutoDetect": 3,
  "maxWordsToMatch": 3,
  "preferLongerMatches": true,
  "showAllPossibleMatches": true
}
```

### Category Settings

```json
{
  "useCategories": true,
  "categories": [
    {
      "name": "Category Name",
      "path": "Wiki/Category Name",
      "sourceFolder": "Notes/Source",
      "tags": ["tag1", "tag2"],
      "enabled": true
    }
  ],
  "defaultCategory": "General",
  "autoAssignCategory": true
}
```

### File Type Filtering

```json
{
  "excludedFileTypes": [
    "png", "jpg", "jpeg", "gif", "svg",
    "pdf", "mp4", "mp3", "wav"
  ]
}
```

### Knowledge Sources

```json
{
  "useDictionaryAPI": true,
  "dictionaryAPIEndpoint": "https://api.dictionaryapi.dev/api/v2/entries/en",
  "useWikipedia": true,
  "useWikipediaInContext": true,
  "useDictionaryInContext": true,
  "glossaryBasePath": ""
}
```

### Content Generation

```json
{
  "generateTags": false,
  "maxTags": 5,
  "generateRelatedConcepts": true,
  "maxRelatedConcepts": 10,
  "trackModel": true,
  "usePriorityQueue": true
}
```

---

## 🚀 Quick Start

### 1. Install Plugin

Copy files to `.obsidian/plugins/wikivault-unified/`:
- `main.js`
- `manifest.json`
- `data.json`
- `styles.css`

### 2. Configure Categories

Settings → WikiVault Unified → Categories

Add your categories:
```
Name: Anatomy and Physiology
Path: Wiki/Anatomy and Physiology
Source: Notes/Anatomy
Tags: anatomy, physiology
```

### 3. Enable Virtual Links

Settings → WikiVault Unified → Virtual Links
- ✅ Enable virtual links
- Set suffix: 🔗
- Match whole words: ✅

### 4. Test It

**Create note:** `Notes/Anatomy/Test.md`
```markdown
---
tags: [anatomy]
---

Smooth muscles contract involuntarily.
```

**See:** `[smooth muscles]🔗` appears as virtual link

**Click:** Book icon → Generates `Wiki/Anatomy and Physiology/Smooth Muscle.md`

---

## 💡 Usage Examples

### Example 1: Anatomy Study

**Your notes structure:**
```
Notes/
└── Anatomy/
    ├── Chapter 1.md
    ├── Chapter 2.md
    └── Lab Notes.md
```

**Settings:**
```json
{
  "categories": [{
    "name": "Anatomy and Physiology",
    "path": "Wiki/Anatomy and Physiology",
    "sourceFolder": "Notes/Anatomy",
    "tags": ["anatomy"]
  }]
}
```

**Result:**
```
Wiki/
└── Anatomy and Physiology/
    ├── Smooth Muscle.md
    ├── Cardiac Muscle.md
    ├── Neural Tissue.md
    └── Bone Matrix.md
```

### Example 2: Multi-Subject

**Your notes:**
```
Notes/
├── Anatomy/
├── Biochemistry/
└── Pharmacology/
```

**Categories:**
```json
{
  "categories": [
    {
      "name": "Anatomy and Physiology",
      "path": "Wiki/Anatomy and Physiology",
      "sourceFolder": "Notes/Anatomy"
    },
    {
      "name": "Biochemistry",
      "path": "Wiki/Biochemistry",
      "sourceFolder": "Notes/Biochemistry"
    },
    {
      "name": "Pharmacology",
      "path": "Wiki/Pharmacology",
      "sourceFolder": "Notes/Pharmacology"
    }
  ]
}
```

**Result:**
```
Wiki/
├── Anatomy and Physiology/
│   └── [anatomy terms]
├── Biochemistry/
│   └── [biochemistry terms]
└── Pharmacology/
    └── [drug terms]
```

---

## 🎨 Customization

### Custom Emoji Suffix

```json
"virtualLinkSuffix": "📖"    // Book
"virtualLinkSuffix": "🔍"    // Magnifying glass
"virtualLinkSuffix": "💡"    // Light bulb
"virtualLinkSuffix": ""      // No suffix
```

### Custom Colors

Create `.obsidian/snippets/wikivault-custom.css`:

```css
/* Anatomy links in red */
.virtual-link[data-category="anatomy"] a {
    color: #e74c3c;
}

/* Biochemistry links in blue */
.virtual-link[data-category="biochemistry"] a {
    color: #3498db;
}

/* General links in purple */
.virtual-link[data-category="general"] a {
    color: #9b59b6;
}
```

### Category-Specific Prompts

```json
{
  "categories": [
    {
      "name": "Anatomy",
      "path": "Wiki/Anatomy",
      "systemPrompt": "Focus on anatomical structures and relationships...",
      "userPromptTemplate": "Describe the anatomy of {{term}}..."
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Virtual Links Not Showing

**Check:**
1. `virtualLinksEnabled: true`
2. Plugin is enabled
3. Restart Obsidian

### Wrong Category Assignment

**Check:**
1. Source folder path matches
2. Tags are correct
3. Category is enabled

**Debug:** Check console (Ctrl+Shift+I) for category matching logs

### Images Being Linked

**Solution:**
```json
"excludedFileTypes": ["png", "jpg", "jpeg", "gif", "svg"]
```

### Too Many False Positives

**Adjust:**
```json
{
  "matchWholeWordsOnly": true,
  "minWordLengthForAutoDetect": 4,
  "maxWordsToMatch": 2
}
```

---

## ✅ Summary

**WikiVault Unified = Virtual Linker + WikiVault + Categories**

✅ See virtual links as you type
✅ Smart multi-word matching
✅ Generate comprehensive wiki notes
✅ Organize by category/subject
✅ Filter file types
✅ AI summaries from YOUR notes
✅ Wikipedia + Dictionary integration
✅ Never modifies source files

**One plugin. Complete solution.** 🎉
