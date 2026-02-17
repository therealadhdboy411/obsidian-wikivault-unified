# WikiVault Unified - Output Format Quick Reference

## ✅ What You Get

Every generated wiki note will follow this EXACT format:

```markdown
---
generated: 2026-02-15T23:03:34.756Z
model: mistral-medium-latest
provider: mistral
tags:
  - "#anatomy"
  - "#physiology"
---
# Term Name

## Wikipedia
[Read more on Wikipedia](URL)
Brief excerpt.

## Dictionary Definition
**term** _/pronunciation/_
_part of speech_
Definition.

## AI Summary
*AI can make mistakes, always check information*
> Summary with **bold key terms**.

---

- **Key concept 1** (explanation)
- **Key concept 2**
- **Key concept 3** (details)

## Related Concepts
[Only if related pages exist - otherwise omitted]

## Mentions

### From [[Source]] → Heading
> Full preserved content
> - With all formatting
>     - Including nesting
> - [[Wikilinks]] kept
> ![[Images]] kept
```

---

## 🎯 Key Format Rules

### 1. Tags MUST Have # Prefix
```yaml
tags:
  - "#anatomy"      # ✅ Correct
  - "physiology"    # ❌ Wrong - missing #
```

### 2. AI Summary ALWAYS Has Disclaimer
```markdown
## AI Summary
*AI can make mistakes, always check information*    # ✅ REQUIRED
> Summary here
```

### 3. Key Concepts After Separator
```markdown
---                              # ✅ Separator first

- **Term** (explanation)         # ✅ No heading
- **Another term**               # ✅ Bullet list

## Key Concepts                  # ❌ NO HEADING HERE
```

### 4. Related Concepts Is Optional
```markdown
## Related Concepts              # ✅ Only if concepts exist
- [[Page 1]]
- [[Page 2]]

[If none exist, OMIT entire section]
```

### 5. Mentions Preserve Everything
```markdown
### From [[Source]] → Heading    # ✅ Format

> ## Original Heading            # ✅ Keep headings
> - Bullet                        # ✅ Keep bullets
>     - Nested                    # ✅ Keep nesting
> - [[Links]]                     # ✅ Keep wikilinks
> ![[image.png]]                  # ✅ Keep images
```

---

## ⚙️ Configuration Settings

### In data.json:

```json
{
  "aiSummaryDisclaimer": "*AI can make mistakes, always check information*",
  "tagsIncludeHashPrefix": true,
  "wikipediaLinkText": "Read more on Wikipedia",
  "extractKeyConceptsFromSummary": true,
  "preserveMentionFormatting": true,
  "generateRelatedConcepts": true,
  "maxTags": 20
}
```

---

## 📊 Example Output

### Input:
- Source: `Chapter 11 Muscular Tissue.md`
- Contains: "[[K+]] [[Leakage channels]] allow [[K+]] to leak out until [[Equilibrium]] reached"

### Output: `Wiki/Equilibrium.md`

```markdown
---
generated: 2026-02-15T23:03:34.756Z
model: mistral-medium-latest
provider: mistral
tags:
  - "#physiology"
  - "#cellular-biology"
  - "#electrophysiology"
  - "#membrane-potential"
---
# Equilibrium

## Wikipedia
[Read more on Wikipedia](https://en.wikipedia.org/wiki/Equilibrium)
Equilibrium may refer to:.

## Dictionary Definition
**equilibrium** _/iːkwɪˈlɪbɹɪəm/_
_noun_
The condition of a system in which competing influences are balanced.

## AI Summary
*AI can make mistakes, always check information*
> **Equilibrium (in cellular electrophysiology)** is the state in which the **electrochemical driving forces** acting on an ion are balanced, resulting in **no net movement**. In the **resting membrane potential (RMP)**, **potassium (K⁺)** leaks out through **leakage channels** until electrical charge attracts it back in.

---

- **Resting membrane potential (RMP)**
- **Electrochemical driving forces**
- **Leakage channels** (passive ion movement)
- **Potassium (K⁺)**
- **No net movement**

## Mentions

### From [[Chapter 11 Muscular Tissue]] → Resting Membrane Potential
> ## Resting Membrane Potential
> - [[K+]] [[Leakage channels]] allow [[K+]] to leak out of cell until electrical charge of cytoplasmic [[Anions]] attracts it back in, [[Equilibrium]] reached.
> 	- Large cytoplasmic [[Anions]] ([[Phosphate]], [[Proteins]], [[ATP]]) can't escape cell.
```

---

## 🔍 Format Validation

Check each generated note:

**Frontmatter:**
- [ ] Has `generated` timestamp with milliseconds
- [ ] Has `model` name
- [ ] Has `provider` name
- [ ] Tags have `#` prefix
- [ ] Tags are quoted

**Content:**
- [ ] Wikipedia link says "Read more on Wikipedia"
- [ ] Dictionary has bold term, italic pronunciation
- [ ] AI Summary has disclaimer line
- [ ] AI Summary in blockquote
- [ ] Separator (`---`) before key concepts
- [ ] Key concepts NOT under heading
- [ ] Related Concepts omitted if none
- [ ] Mention headers: `### From [[X]] → Y`
- [ ] All mention content in blockquote
- [ ] Original formatting preserved

---

## 🚀 Quick Start

1. **Install plugin** with these files
2. **Configure categories** in settings
3. **Run generator** (click book icon)
4. **Check output** matches format above

**Your notes will look exactly like the example!** ✅
