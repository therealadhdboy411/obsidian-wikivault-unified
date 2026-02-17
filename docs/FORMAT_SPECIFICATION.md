# WikiVault Unified - Exact Output Format

## 📋 Complete Template

```markdown
---
generated: 2026-02-15T23:03:34.756Z
model: mistral-medium-latest
provider: mistral
tags:
  - "#anatomy"
  - "#physiology"
  - "#human-anatomy"
---
# Term Name

## Wikipedia
[Read more on Wikipedia](https://en.wikipedia.org/wiki/Term)
Brief excerpt from Wikipedia (1-3 sentences).

## Dictionary Definition
**term** _/pronunciation/_
_part of speech_
Definition text.

## AI Summary
*AI can make mistakes, always check information*
> Detailed AI-generated summary with **bold key terms** and comprehensive explanation based on user's notes and reference materials.

---

- **Key concept 1** (explanation)
- **Key concept 2** (explanation)
- **Key concept 3** (explanation)

## Related Concepts
* Only include this section if there are related concepts to link
* Otherwise omit this entire section

## Mentions

### From [[Source File]] → Heading Name
> Full content with all formatting preserved
> - Including bullet points
> - Nested items
>   - Sub-items
> - [[Wikilinks]] preserved
> ![[Images preserved]]
```

---

## 🔍 Section-by-Section Breakdown

### 1. Frontmatter

```yaml
---
generated: 2026-02-15T23:03:34.756Z
model: mistral-medium-latest
provider: mistral
tags:
  - "#anatomy"
  - "#physiology"
  - "#cellular-biology"
---
```

**Rules:**
- ✅ ISO 8601 timestamp with milliseconds
- ✅ Model name as returned by API
- ✅ Provider name (mistral, openai, lmstudio)
- ✅ Tags with `#` prefix
- ✅ Each tag on new line with `  - ` prefix
- ❌ NO `category` field (user didn't show it)

### 2. Title

```markdown
# Equilibrium
```

**Rules:**
- ✅ H1 heading
- ✅ Term name exactly as provided
- ✅ No special formatting

### 3. Wikipedia Section

```markdown
## Wikipedia
[Read more on Wikipedia](https://en.wikipedia.org/wiki/Equilibrium)
Equilibrium may refer to:.
```

**Rules:**
- ✅ Always include if Wikipedia API returns data
- ✅ Link text: "Read more on Wikipedia"
- ✅ Brief excerpt (1-3 sentences)
- ✅ Blank line after URL
- ❌ NO "Learn more" or other variations

### 4. Dictionary Definition

```markdown
## Dictionary Definition
**equilibrium** _/iːkwɪˈlɪbɹɪəm/_
_noun_
The condition of a system in which competing influences are balanced, resulting in no net change.
```

**Rules:**
- ✅ Term in **bold**
- ✅ Pronunciation in _italics_ with slashes
- ✅ Part of speech in _italics_ on new line
- ✅ Definition text plain
- ✅ Blank line after definition
- ❌ NO numbered definitions (just first one)

### 5. AI Summary

```markdown
## AI Summary
*AI can make mistakes, always check information*
> **Equilibrium (in cellular electrophysiology)** is the state...
```

**Rules:**
- ✅ ALWAYS include disclaimer: `*AI can make mistakes, always check information*`
- ✅ Summary in blockquote (`>`)
- ✅ Use **bold** for key terms
- ✅ Can be multi-paragraph (each paragraph starts with `>`)
- ✅ Be comprehensive and detailed
- ✅ Include context from user's notes

**Example of multi-paragraph:**
```markdown
> **Equilibrium** is the state...
>
> For example, in the **resting membrane potential (RMP)**...
>
> True equilibrium is rarely achieved...
```

### 6. Separator + Key Concepts

```markdown
---

- **Resting membrane potential (RMP)**
- **Electrochemical gradient**
- **Nernst equation** (calculates equilibrium potential for an ion)
```

**Rules:**
- ✅ Horizontal rule (`---`) after AI Summary
- ✅ Blank line after `---`
- ✅ Bullet list with `-` (NOT `*`)
- ✅ Main term in **bold**
- ✅ Explanation in parentheses (optional)
- ✅ This is NOT under a heading
- ✅ List specific concepts mentioned in summary

### 7. Related Concepts (CONDITIONAL)

```markdown
## Related Concepts
* Only include if there are any. Otherwise, do not include them.
```

**Rules:**
- ❌ OMIT ENTIRE SECTION if no related concepts
- ✅ If present, use bullet list with `-`
- ✅ Link to other wiki pages: `- [[Concept Name]]`
- ✅ These should be separate terms that deserve their own pages

**Do NOT confuse with key concepts list above!**
- Key concepts = terms/ideas mentioned in summary
- Related Concepts = links to other wiki pages

### 8. Mentions Section

```markdown
## Mentions

### From [[Chapter 11 Muscular Tissue]] → Resting Membrane Potential
> ## Motor Neurons and Motor Units
> - Average [[Motor unit]] has 200 [[Muscle fibers]]
> - Small [[Motor units]]
>     - Fine degree of control
```

**Rules:**
- ✅ H3 heading format: `### From [[Source]] → Heading`
- ✅ Source in wikilink: `[[Filename]]`
- ✅ Arrow: ` → ` (space-arrow-space)
- ✅ Heading name after arrow
- ✅ ALL content in blockquote (every line starts with `>`)
- ✅ Preserve ALL formatting:
  - Nested bullets with spaces
  - Sub-lists with tabs/spaces
  - Headings (`## Motor Neurons`)
  - Wikilinks (`[[term]]`)
  - Images (`![[image.png]]`)
  - Bold, italics, etc.
- ✅ Blank line between mentions

**Nesting example:**
```markdown
> - Top level
>     - Second level (4 spaces)
>         - Third level (8 spaces)
> 	- Tab-indented item
```

---

## 🎯 Format Rules Summary

### Tags
```yaml
tags:
  - "#anatomy"          # ✅ With hashtag
  - "#physiology"       # ✅ Quoted
  - cellular-biology    # ❌ NO - missing hashtag
```

### AI Summary
```markdown
## AI Summary
*AI can make mistakes, always check information*    # ✅ ALWAYS include
> Summary here                                      # ✅ In blockquote

## AI Summary                                       # ❌ NO
Summary here (no disclaimer)                       # ❌ Missing disclaimer
```

### Key Concepts vs Related Concepts
```markdown
---
- **Key term** (from summary)          # ✅ After separator, no heading
- **Another term** (explanation)

## Related Concepts                    # ✅ Separate section, optional
- [[Other Page]]                       # ✅ Links to other wiki pages
```

### Mentions Formatting
```markdown
### From [[Source]] → Heading Name     # ✅ Correct format
> Full content preserved               # ✅ In blockquote

### From Source → Heading              # ❌ NO - source not wikilinked
From [[Source]]: content               # ❌ NO - wrong heading format
> Content (reformatted)                # ❌ NO - must preserve original
```

---

## 💻 Implementation Code Structure

### Frontmatter Generation
```typescript
function generateFrontmatter(term, tags, model, provider) {
    const timestamp = new Date().toISOString(); // Includes milliseconds
    
    let frontmatter = "---\n";
    frontmatter += `generated: ${timestamp}\n`;
    frontmatter += `model: ${model}\n`;
    frontmatter += `provider: ${provider}\n`;
    frontmatter += `tags:\n`;
    
    for (const tag of tags) {
        // Ensure tag has # prefix
        const tagText = tag.startsWith('#') ? tag : `#${tag}`;
        frontmatter += `  - "${tagText}"\n`;
    }
    
    frontmatter += "---\n\n";
    return frontmatter;
}
```

### AI Summary with Disclaimer
```typescript
function formatAISummary(summary) {
    let output = "## AI Summary\n";
    output += "*AI can make mistakes, always check information*\n";
    
    // Split into paragraphs, add blockquote
    const paragraphs = summary.split('\n\n');
    for (const para of paragraphs) {
        output += `> ${para}\n`;
        if (paragraphs.indexOf(para) < paragraphs.length - 1) {
            output += ">\n"; // Blank line between paragraphs
        }
    }
    
    output += "\n";
    return output;
}
```

### Key Concepts Extraction
```typescript
function formatKeyConcepts(summary) {
    // Extract bold terms from summary
    const boldPattern = /\*\*([^*]+)\*\*/g;
    const concepts = [];
    let match;
    
    while ((match = boldPattern.exec(summary)) !== null) {
        concepts.push(match[1]);
    }
    
    if (concepts.length === 0) return "";
    
    let output = "---\n\n";
    
    // Deduplicate and format
    const uniqueConcepts = [...new Set(concepts)];
    for (const concept of uniqueConcepts) {
        output += `- **${concept}**\n`;
    }
    
    output += "\n";
    return output;
}
```

### Mentions Formatting
```typescript
function formatMention(sourceFile, heading, content) {
    let output = `### From [[${sourceFile.basename}]]`;
    
    if (heading) {
        output += ` → ${heading}`;
    }
    
    output += "\n";
    
    // Add blockquote to every line
    const lines = content.split('\n');
    for (const line of lines) {
        output += `> ${line}\n`;
    }
    
    output += "\n";
    return output;
}
```

### Related Concepts (Conditional)
```typescript
function formatRelatedConcepts(concepts) {
    if (!concepts || concepts.length === 0) {
        return ""; // Omit section entirely
    }
    
    let output = "## Related Concepts\n";
    for (const concept of concepts) {
        output += `- [[${concept}]]\n`;
    }
    output += "\n";
    return output;
}
```

---

## ✅ Validation Checklist

Before considering a note complete, verify:

- [ ] Frontmatter has `generated`, `model`, `provider`, `tags`
- [ ] Tags have `#` prefix and are quoted
- [ ] Wikipedia link uses "Read more on Wikipedia"
- [ ] Dictionary has bold term, italic pronunciation, italic POS
- [ ] AI Summary has disclaimer line
- [ ] AI Summary content in blockquote
- [ ] Key concepts list after `---` separator
- [ ] Key concepts have **bold** main terms
- [ ] Related Concepts section omitted if none
- [ ] Each mention has `### From [[Source]] → Heading` format
- [ ] All mention content in blockquote
- [ ] Mention content preserves original formatting
- [ ] Wikilinks preserved: `[[term]]`
- [ ] Images preserved: `![[image.png]]`
- [ ] Nested bullets preserved with proper indentation

---

## 🎨 Example: Complete Generated Note

```markdown
---
generated: 2026-02-15T23:03:34.756Z
model: mistral-medium-latest
provider: mistral
tags:
  - "#physiology"
  - "#cellular-biology"
  - "#electrophysiology"
---
# Equilibrium

## Wikipedia
[Read more on Wikipedia](https://en.wikipedia.org/wiki/Equilibrium)
Equilibrium may refer to:.

## Dictionary Definition
**equilibrium** _/iːkwɪˈlɪbɹɪəm/_
_noun_
The condition of a system in which competing influences are balanced, resulting in no net change.

## AI Summary
*AI can make mistakes, always check information*
> **Equilibrium (in cellular electrophysiology)** is the state in which the **electrochemical driving forces** acting on an ion (e.g., **K⁺** or **Na⁺**) across a cell membrane are balanced, resulting in **no net movement** of that ion.

---

- **Resting membrane potential (RMP)**
- **Electrochemical gradient**
- **Nernst equation** (calculates equilibrium potential for an ion)
- **Na⁺-K⁺ ATPase pump** (active transport maintaining RMP)

## Mentions

### From [[Chapter 11 Muscular Tissue]] → Resting Membrane Potential
> ## Resting Membrane Potential
> - [[K+]] [[Leakage channels]] allow [[K+]] to leak out of cell until electrical charge of cytoplasmic [[Anions]] attracts it back in, [[Equilibrium]] reached.
> 	- Large cytoplasmic [[Anions]] ([[Phosphate]], [[Proteins]], [[ATP]]) can't escape cell.
```

---

This is the EXACT format WikiVault Unified will generate! 🎉
