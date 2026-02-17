# WikiVault + Virtual Linker: Complete Integration Guide

## 🎯 What You Want

**Virtual links that:**
1. ✅ Show visually in editor/reader (like Virtual Linker)
2. ✅ Prefer longer matches ("Smooth Muscle" over "Smooth")
3. ✅ Show all possible matches on hover
4. ✅ Are collected in generated wiki notes
5. ✅ **NEVER modify source files** (links are virtual overlays)

## 🔍 How Virtual Linker Works

### The Magic: Post-Processing

Virtual Linker uses Obsidian's rendering APIs:

```typescript
// For Reading View (rendered markdown)
this.registerMarkdownPostProcessor((element, context) => {
    context.addChild(new GlossaryLinker(...));
});

// For Live/Edit View (CodeMirror editor)
this.registerEditorExtension(liveLinkerPlugin(...));
```

**Key insight:** These APIs let you modify HOW text is DISPLAYED without changing the actual file.

### What Happens:

1. **Your file**: `"Certain smooth muscles can divide"`
2. **Virtual Linker** detects "smooth muscles" matches `[[Smooth Muscle]]`
3. **Renders as**: `"Certain [smooth muscles](link) can divide"` visually
4. **File still contains**: `"Certain smooth muscles can divide"` (unchanged!)
5. **When plugin disabled**: Links disappear (they were never in the file)

## 🎨 Two-Plugin Strategy (RECOMMENDED)

### Keep Both Plugins

**Virtual Linker:**
- Shows virtual links as you type/read
- Multi-word smart matching
- Visual feedback
- Never modifies files

**WikiVault (Enhanced):**
- Uses same matching algorithm
- Collects all mentions (wikilinked + virtually linked)
- Generates comprehensive wiki notes
- Also never modifies files

### How They Work Together:

```
Your note: "Certain smooth muscles can divide"

Virtual Linker:
├─ Detects: "smooth muscles" → [[Smooth Muscle]]
├─ Renders: visual link overlay
└─ File unchanged: ✅

WikiVault:
├─ Uses same detection
├─ Collects mention
├─ Generates wiki note for [[Smooth Muscle]]
└─ Includes: "From [[Chapter 7]]: Certain smooth muscles..."
```

## 🔧 WikiVault Integration Options

### Option 1: Use Virtual Linker's Cache (EASIEST)

WikiVault reads from Virtual Linker's existing cache:

```typescript
// In WikiVault
import { LinkerCache } from 'virtual-linker';

async extractContextData(linkName) {
    const cache = LinkerCache.getInstance(this.app, virtualLinkerSettings);
    
    // Get all files that match this term
    const matches = cache.findFiles(linkName.toLowerCase());
    
    // Scan vault for these matches
    for (const file of allFiles) {
        const content = await this.app.vault.read(file);
        
        // Check each line for matches
        for (const line of content.split('\n')) {
            const detectedLinks = this.detectVirtualLinks(line, cache);
            
            if (detectedLinks.includes(linkName)) {
                // This line mentions our term!
                mentions.push({ file, line });
            }
        }
    }
}
```

**Pros:**
- ✅ Reuses existing code
- ✅ Same matching algorithm guaranteed
- ✅ No duplicate work

**Cons:**
- ❌ Requires Virtual Linker installed
- ❌ Dependency on another plugin

### Option 2: Implement Matching Algorithm (INDEPENDENT)

WikiVault implements its own version:

```typescript
// Adapted from Virtual Linker's PrefixTree

class TermMatcher {
    buildIndex() {
        const termIndex = new Map();
        
        for (const file of this.vault.getMarkdownFiles()) {
            // Index file basename
            this.indexTerm(file.basename, file);
            
            // Index aliases
            const aliases = this.getAliases(file);
            for (const alias of aliases) {
                this.indexTerm(alias, file);
            }
            
            // Index variations (singular/plural)
            const singular = getSingularForm(file.basename);
            const plural = getPluralForm(file.basename);
            if (singular) this.indexTerm(singular, file);
            if (plural) this.indexTerm(plural, file);
        }
        
        return termIndex;
    }
    
    findMatches(text, termIndex) {
        const matches = [];
        
        // Check 1-word, 2-word, 3-word combinations
        const words = text.split(/\s+/);
        
        for (let wordCount = 3; wordCount >= 1; wordCount--) {
            for (let i = 0; i <= words.length - wordCount; i++) {
                const phrase = words.slice(i, i + wordCount).join(' ');
                const matchedFiles = termIndex.get(phrase.toLowerCase());
                
                if (matchedFiles && matchedFiles.length > 0) {
                    matches.push({
                        text: phrase,
                        startWord: i,
                        endWord: i + wordCount,
                        files: matchedFiles,
                        wordCount: wordCount
                    });
                }
            }
        }
        
        // Remove overlapping matches (keep longer ones)
        return this.preferLongerMatches(matches);
    }
    
    preferLongerMatches(matches) {
        // Sort by word count (longer first)
        matches.sort((a, b) => b.wordCount - a.wordCount);
        
        const selected = [];
        const usedPositions = new Set();
        
        for (const match of matches) {
            // Check if any word position is already used
            let hasOverlap = false;
            for (let i = match.startWord; i < match.endWord; i++) {
                if (usedPositions.has(i)) {
                    hasOverlap = true;
                    break;
                }
            }
            
            if (!hasOverlap) {
                selected.push(match);
                for (let i = match.startWord; i < match.endWord; i++) {
                    usedPositions.add(i);
                }
            }
        }
        
        return selected;
    }
}
```

**Pros:**
- ✅ No dependencies
- ✅ Full control
- ✅ Can customize behavior

**Cons:**
- ❌ More code to maintain
- ❌ Need to keep algorithm in sync

### Option 3: Hybrid Approach (RECOMMENDED)

WikiVault can optionally use Virtual Linker if installed:

```typescript
async extractContextData(linkName) {
    let matcher;
    
    // Check if Virtual Linker is installed
    const virtualLinkerPlugin = this.app.plugins.getPlugin('virtual-linker');
    
    if (virtualLinkerPlugin) {
        // Use Virtual Linker's matcher
        matcher = this.createVirtualLinkerMatcher(virtualLinkerPlugin);
    } else {
        // Use built-in matcher
        matcher = this.createBuiltInMatcher();
    }
    
    // Rest of code uses matcher regardless of source
    const matches = matcher.findMatches(text);
    // ...
}
```

**Pros:**
- ✅ Best of both worlds
- ✅ Works standalone
- ✅ Enhanced when Virtual Linker present

## 📊 Example: "Smooth Muscle" Detection

### Scenario:
```markdown
# Chapter 7 Bone Tissue

Certain smooth muscles can divide, increase in numbers.
```

### Files in vault:
- `Smooth Muscle.md`
- `Smooth.md`
- `Muscle.md`

### Detection Process:

**Step 1: Build Index**
```
Index:
"smooth muscle" → [Smooth Muscle.md]
"smooth" → [Smooth.md]
"muscle" → [Muscle.md]
"muscles" → [Muscle.md]
```

**Step 2: Scan Text**
```
Text: "Certain smooth muscles can divide"
Words: ["Certain", "smooth", "muscles", "can", "divide"]

3-word combinations:
- "Certain smooth muscles" ❌ not in index
- "smooth muscles can" ❌ not in index

2-word combinations:
- "Certain smooth" ❌ not in index
- "smooth muscles" ✅ matches [[Smooth Muscle]]
- "muscles can" ❌ not in index

1-word combinations:
- "smooth" ✅ matches [[Smooth]]
- "muscles" ✅ matches [[Muscle]]
```

**Step 3: Prefer Longer**
```
Matches found:
1. "smooth muscles" (2 words) → [[Smooth Muscle]] ✅ SELECTED
2. "smooth" (1 word) → [[Smooth]] ❌ OVERLAPS with #1
3. "muscles" (1 word) → [[Muscle]] ❌ OVERLAPS with #1

Final: "smooth muscles" → [[Smooth Muscle]]
```

**Step 4: Show All Possibilities**
```markdown
### From [[Chapter 7 Bone Tissue]] [virtual link]

**Detected:** "smooth muscles"

**Possible interpretations:**
- [[Smooth Muscle]] ✅ (preferred - 2 words)
- [[Smooth]] + [[Muscle]] (1+1 words)

> Certain smooth muscles can divide, increase in numbers
```

## 🎯 Generated Wiki Note Format

```markdown
---
generated: 2024-02-16T04:00:00.000Z
model: mistral-small-latest
---

# Smooth Muscle

## Wikipedia

[Read more on Wikipedia](https://en.wikipedia.org/wiki/Smooth_muscle)

Smooth muscle is an involuntary non-striated muscle...

## AI Summary

> Based on your notes, smooth muscles are involuntary muscles that 
> can divide and increase in numbers, unlike skeletal muscle...

## Mentions

### From [[Chapter 7 Bone Tissue]] [wikilinked]

> The [[Smooth Muscle]] tissue is found in...

### From [[Chapter 7 Bone Tissue]] [virtual link]

**Detected:** "smooth muscles" → [[Smooth Muscle]]
(Alternative interpretations: [[Smooth]], [[Muscle]])

> Certain smooth muscles can divide, increase in numbers

### From [[Anatomy Notes]] [virtual link]

**Detected:** "smooth muscle" → [[Smooth Muscle]]

> In smooth muscle cells, the actin and myosin...
```

## 🛠️ Implementation Checklist

### Phase 1: Detection (NO Rendering Yet)
- [ ] Implement term index builder
- [ ] Implement multi-word matcher
- [ ] Implement "prefer longer" algorithm
- [ ] Integrate with `extractContextData()`
- [ ] Test with "Smooth Muscle" example
- [ ] Show all possible matches in generated notes

### Phase 2: Virtual Link Rendering (Optional)
- [ ] Study Virtual Linker's `GlossaryLinker.ts`
- [ ] Study Virtual Linker's `liveLinker.ts`
- [ ] Implement `registerMarkdownPostProcessor` for reading view
- [ ] Implement `registerEditorExtension` for live view
- [ ] Add hover popup showing all possible matches
- [ ] Add styling (similar to Virtual Linker)

### Phase 3: Integration
- [ ] Detect if Virtual Linker is installed
- [ ] Use its cache if available
- [ ] Fall back to built-in matcher
- [ ] Settings to enable/disable virtual link rendering

## ⚙️ Settings

```json
{
  "autoDetectMentions": true,
  "preferLongerMatches": true,        // "Smooth Muscle" > "Smooth"
  "showAllPossibleMatches": true,     // Show alternatives
  "renderVirtualLinks": false,        // Future: render like VL
  "matchWholeWordsOnly": true,
  "minWordLengthForAutoDetect": 3,
  "maxWordsToMatch": 3                // Check up to 3-word combinations
}
```

## 🎨 Visual Rendering (Future Enhancement)

If you want WikiVault to also show virtual links like Virtual Linker:

```typescript
// Register post-processor for reading view
this.registerMarkdownPostProcessor((element, context) => {
    const matcher = this.createMatcher();
    const textNodes = this.getTextNodes(element);
    
    for (const node of textNodes) {
        const matches = matcher.findMatches(node.textContent);
        
        if (matches.length > 0) {
            this.replaceTextWithLinks(node, matches);
        }
    }
});

// Register editor extension for live view  
this.registerEditorExtension(
    this.createLiveLinkerExtension()
);
```

## 📝 Current Recommendation

**For now (MVP):**
1. ✅ Implement detection algorithm
2. ✅ Collect mentions in generated notes
3. ✅ Show all possible matches
4. ❌ Skip visual rendering (let Virtual Linker do that)

**User workflow:**
1. Install Virtual Linker → See virtual links
2. Install WikiVault → Generate wiki notes
3. WikiVault collects same mentions Virtual Linker shows
4. Best of both worlds!

**Future enhancement:**
- WikiVault can optionally render virtual links itself
- Users won't need both plugins
- But keeping them separate is cleaner for now

## 🚀 Next Steps

1. Copy term matching algorithm from Virtual Linker
2. Integrate into WikiVault's `extractContextData()`
3. Format mentions to show alternatives
4. Test with your "Smooth Muscle" example
5. Deploy and test!

The key: **Detection WITHOUT modification**. Just like Virtual Linker!
