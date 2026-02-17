# WikiVault Update - Wikipedia & Dictionary Context

## 🎯 What's New

**Triple-source summaries!** Your notes + Dictionary + Wikipedia

### Before
```
AI Summary: Based on your notes, machine learning is...
[Only uses your vault content]
```

### After
```
Wikipedia: [Link + excerpt from Wikipedia]

Dictionary Definition: [Formal definition with pronunciation]

AI Summary: Machine learning, formally defined as [dictionary]...
            As Wikipedia notes [wikipedia excerpt]...
            You're using it for [your notes]...
[Synthesizes all three sources]
```

---

## Quick Install

### 1. Install Files
Replace in `.obsidian/plugins/obsidian-wikivault/`:
- ✅ `main.js` (new version)
- ✅ `data.json` (new settings)

### 2. Restart Obsidian

### 3. Check Settings

Go to Settings → WikiVault → External Sources

You should see:
- ✅ Use Wikipedia (enabled by default)
- ✅ Wikipedia Language: en
- ✅ Use Dictionary API (enabled by default)

---

## What Gets Added to Notes

### New Section: Wikipedia
```markdown
## Wikipedia

[Read more on Wikipedia](https://en.wikipedia.org/wiki/Term)

[2-3 sentence excerpt from Wikipedia article]
```

### Enhanced: Dictionary Definition
Still displayed to you, BUT also sent to AI for synthesis

### Enhanced: AI Summary
Now incorporates all three sources:
```markdown
## AI Summary

> Formal definition + Wikipedia overview + your understanding
```

---

## New Template Variables

### {{dictionary}}
```
Dictionary definition of "term": definition text
```

### {{wikipedia}}
```
Wikipedia definition: excerpt text
```

Use in custom prompts:
```
Synthesize:
{{dictionary}}
{{wikipedia}}
My notes: {{context}}
```

---

## Example Output

**Your Vault:**
```markdown
Using [[Redux]] for state management. Better than prop drilling.
```

**Generated Note:**

```markdown
# Redux

## Wikipedia

[Read more on Wikipedia](https://en.wikipedia.org/wiki/Redux_(JavaScript_library))

Redux is an open-source JavaScript library for managing and 
centralizing application state. It is most commonly used with 
libraries such as React or Angular.

## Dictionary Definition

**redux** _/rɪˈdʌks/_

_adjective_
1. Brought back; resurgent

## AI Summary

> Redux, as Wikipedia describes, is a JavaScript library for managing 
> application state. You're using it in your project specifically to 
> avoid prop drilling, implementing centralized state management.

## Mentions

### From [[Project Notes]]
> Using Redux for state management. Better than prop drilling.
```

---

## Configuration

### Enable/Disable Features

**Turn off Wikipedia:**
```
Settings → WikiVault → External Sources
→ Use Wikipedia: OFF
```

**Turn off Dictionary:**
```
Settings → WikiVault → External Sources  
→ Use Dictionary API: OFF
```

**Both off = Previous behavior** (only your notes)

### Change Wikipedia Language

```
Settings → WikiVault → External Sources
→ Wikipedia Language: es (Spanish)
                       fr (French)
                       de (German)
                       [any code]
```

---

## Updated Default Prompts

### System Prompt (New)
```
You are a helpful assistant that synthesizes information from the 
user's notes. You will be provided with: 1) Formal dictionary 
definitions, 2) Wikipedia overview, and 3) The user's personal notes. 
Synthesize all three sources, emphasizing the user's understanding 
while incorporating the formal definitions for clarity.
```

### User Prompt Template (New)
```
Synthesize information about "{{term}}" from these sources:

{{dictionary}}

{{wikipedia}}

My notes:
{{context}}

Provide a summary that incorporates the formal definition but 
emphasizes how I understand and use this concept:
```

---

## When External Sources Fail

**Wikipedia not found:**
- Section omitted from note
- AI receives "(No Wikipedia entry available)"
- Continues with dictionary + your notes

**Dictionary not found:**
- Section omitted from note
- AI receives "(No dictionary definition available)"
- Continues with Wikipedia + your notes

**Both missing:**
- Works exactly like previous version
- Only uses your vault context

**Your notes missing:**
- No AI summary generated (same as before)
- Dictionary and Wikipedia still display

---

## Benefits

### 1. Formal Grounding
Dictionary provides authoritative definitions for clarity

### 2. Broader Context
Wikipedia offers comprehensive overviews and links for deeper reading

### 3. AI Synthesis
Combines formal knowledge with your personal usage

### 4. Better for Learning
- Learning new terms? Get dictionary + Wikipedia + your notes
- Technical terms? Wikipedia covers what dictionary doesn't
- Common words? Dictionary adds precision

---

## Use Cases

### Learning New Topics
```
Enable: Wikipedia ✅ + Dictionary ✅

Result: Formal definitions + comprehensive overview + your learning notes
```

### Internal/Project Terms
```
Enable: Wikipedia ❌ + Dictionary ❌

Result: Pure vault-based (previous behavior)
```

### Technical Documentation
```
Enable: Wikipedia ✅ + Dictionary ❌

Result: Wikipedia for tech terms + your implementation notes
```

---

## Performance Impact

**Minimal additional time:**
- +0.5-1s per link for Wikipedia
- +0.5-1s per link for dictionary
- Runs concurrently with vault scanning
- Network speed dependent

**Still uses batch processing:**
- Multiple links processed in parallel
- Progress tracking includes external fetches
- ETA calculation updated

---

## Troubleshooting

### "AI summary doesn't mention dictionary/Wikipedia"

**Check prompts include variables:**
```
{{dictionary}} ✅
{{wikipedia}} ✅
{{context}} ✅
```

### "No Wikipedia section appearing"

**Possible causes:**
- Term not in Wikipedia (expected for many terms)
- Setting disabled
- Internet connection issue

**Solution:** Enable setting, check internet

### "Dictionary empty for technical terms"

**Expected behavior:**
- Programming terms rarely in standard dictionaries
- Wikipedia usually covers these instead
- Not an error - just not in dictionary database

---

## Migration Checklist

- [ ] Backup current files
- [ ] Install new `main.js` and `data.json`
- [ ] Restart Obsidian
- [ ] Verify new "External Sources" section in settings
- [ ] Check prompts include {{dictionary}} and {{wikipedia}}
- [ ] Test with a common term (should have all three sources)
- [ ] Test with technical term (may only have Wikipedia)

---

## Quick Tips

1. **Use for general concepts** - Get formal grounding
2. **Disable for project terms** - Keep internal knowledge internal
3. **Language support** - Match Wikipedia to term language
4. **Regenerate notes** - Your notes improve, Wikipedia/dictionary don't change
5. **Customize prompts** - Emphasize whichever source matters most

---

## Summary

**What you get now:**

Before: `Your notes → AI → Summary`

After: `Dictionary + Wikipedia + Your notes → AI → Comprehensive summary`

**Result:** Richer, more authoritative notes that combine formal definitions with your personal understanding! 🎯

---

Read **WIKIPEDIA_DICTIONARY_INTEGRATION.md** for detailed examples and advanced usage!
