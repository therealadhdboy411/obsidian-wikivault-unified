# WikiVault Enhanced - Wikipedia & Dictionary Context Integration

## 🎉 New Features

This version adds **two powerful enhancements** to how WikiVault generates summaries:

1. **📚 Dictionary Context Injection** - Dictionary definitions are sent to the AI for synthesis
2. **🌐 Wikipedia Integration** - Automatic Wikipedia excerpts and links

Together, these create **triple-source summaries**: Dictionary + Wikipedia + Your Notes

---

## How It Works

### Information Flow

```
1. Extract context from YOUR vault
   ↓
2. Fetch dictionary definition
   ↓
3. Fetch Wikipedia excerpt
   ↓
4. Send ALL THREE to AI
   ↓
5. AI synthesizes: formal definition + Wikipedia overview + your understanding
   ↓
6. Generate comprehensive note
```

### What the AI Sees

**Previous version:**
```
Based on your notes: [only your vault content]
```

**New version:**
```
Dictionary: "machine learning (noun) - The use and development of 
computer systems that can learn and adapt..."

Wikipedia: "Machine learning is a field of study in artificial 
intelligence concerned with the development and study of statistical 
algorithms..."

Your notes: "Using machine learning for customer segmentation. 
Neural network achieved 87% accuracy..."

→ Synthesize these three sources, emphasizing the user's application.
```

---

## Example Generated Note

### Your Vault Contains:
```markdown
# Project Notes
Implementing [[Machine Learning]] for customer churn prediction.
Current model accuracy: 87%.

# Learning Log
[[Machine Learning]] uses neural networks to learn patterns from data.
```

### Generated Wiki Note:

```markdown
# Machine Learning

## Wikipedia

[Read more on Wikipedia](https://en.wikipedia.org/wiki/Machine_learning)

Machine learning is a field of study in artificial intelligence 
concerned with the development and study of statistical algorithms 
that can learn from data and generalize to unseen data. It is seen 
as a part of artificial intelligence.

## Dictionary Definition

**machine learning** _/məˈʃiːn ˈlɜːrnɪŋ/_

_noun_
1. The use and development of computer systems that can learn and adapt
   - _"machine learning is transforming industries"_

## AI Summary

> Machine learning, formally defined as the development of systems that 
> learn from data, is what you're implementing for customer churn 
> prediction. You understand it uses neural networks to identify patterns, 
> and your current model has achieved 87% accuracy. As noted in Wikipedia, 
> it's a core field in AI focused on creating algorithms that generalize 
> to unseen data.

## Mentions

### From [[Project Notes]]
> Implementing Machine Learning for customer churn prediction.
> Current model accuracy: 87%.

### From [[Learning Log]]
> Machine Learning uses neural networks to learn patterns from data.
```

---

## Benefits

### 1. Formal Grounding
- Dictionary provides precise, authoritative definitions
- AI can reference standard terminology
- Helps clarify ambiguous terms

### 2. Broader Context  
- Wikipedia offers comprehensive overview
- Links to deeper reading
- Standardized information structure

### 3. Personal Application
- Your notes show HOW you use the concept
- Real examples from your work
- Practical understanding

### 4. AI Synthesis
- Combines all three sources intelligently
- Emphasizes your usage while grounding in formal definitions
- Creates comprehensive, personalized summaries

---

## Template Variables

### {{dictionary}}
Replaced with dictionary definition (if available).

**Format sent to AI:**
```
Dictionary definition of "term" (/pronunciation/): definition 1; 
definition 2; definition 3
```

**If unavailable:**
```
(No dictionary definition available)
```

### {{wikipedia}}
Replaced with Wikipedia excerpt (if available).

**Format sent to AI:**
```
Wikipedia definition: [First 2-3 sentences from Wikipedia article]
```

**If unavailable:**
```
(No Wikipedia entry available)
```

### {{context}}
Your vault mentions (unchanged from previous version).

**Format:**
```
From Note A (Section 1): Your text mentioning the term...
From Note B (Section 2): More of your text...
```

### {{term}}
The wikilink name.

---

## Configuration

### Wikipedia Settings

**Enable/Disable:**
```
Settings → WikiVault → External Sources → Use Wikipedia
```

**Language Selection:**
```
Wikipedia Language: en (English)
                    es (Spanish)
                    fr (French)
                    de (German)
                    [any Wikipedia language code]
```

**What Gets Fetched:**
- First matching Wikipedia article
- First 2-3 sentences (introductory excerpt)
- Direct link to full article

### Dictionary Settings

**Enable/Disable:**
```
Settings → WikiVault → External Sources → Use Dictionary API
```

**Endpoint:**
```
Dictionary API Endpoint: https://api.dictionaryapi.dev/api/v2/entries/en
```

**What Gets Sent to AI:**
- Word and pronunciation
- Part of speech
- Up to 3 definitions
- Formatted as plain text for AI consumption

**What's Displayed to User:**
- Formatted markdown version
- Includes examples when available
- Shows phonetic pronunciation

---

## Prompt Customization

### Default System Prompt
```
You are a helpful assistant that synthesizes information from the 
user's notes. You will be provided with: 1) Formal dictionary 
definitions, 2) Wikipedia overview, and 3) The user's personal notes. 
Synthesize all three sources, emphasizing the user's understanding 
while incorporating the formal definitions for clarity.
```

### Default User Prompt Template
```
Synthesize information about "{{term}}" from these sources:

{{dictionary}}

{{wikipedia}}

My notes:
{{context}}

Provide a summary that incorporates the formal definition but 
emphasizes how I understand and use this concept:
```

### Custom Prompt Ideas

**Emphasize Dictionary:**
```
Define {{term}} using:
1. Dictionary: {{dictionary}}
2. Wikipedia: {{wikipedia}}
3. My usage: {{context}}

Start with the formal definition, then explain my application.
```

**Emphasize Your Notes:**
```
How do I use {{term}}?

My notes: {{context}}

Reference: {{dictionary}} | {{wikipedia}}

Focus on my practical understanding, briefly noting the formal definition.
```

**Compare Understanding:**
```
Compare these definitions of {{term}}:

Standard: {{dictionary}}
Wikipedia: {{wikipedia}}
My understanding: {{context}}

Highlight where my usage aligns or differs from formal definitions.
```

**Technical Focus:**
```
Technical summary of {{term}}:

Formal: {{dictionary}}
Overview: {{wikipedia}}
Implementation: {{context}}

Provide technical synthesis focusing on implementation details from 
my notes.
```

---

## Note Structure

### Section Order

1. **Wikipedia** (if available)
   - Link to full article
   - 2-3 sentence excerpt

2. **Dictionary Definition** (if available)
   - Word + pronunciation
   - Definitions with examples

3. **AI Summary**
   - Synthesis of all three sources
   - Emphasizes your understanding

4. **See Also** (if fuzzy matches found)
   - Related notes in your vault

5. **Mentions**
   - Your actual vault references
   - With heading context

---

## Behavior Details

### Wikipedia Fetching

**Search Process:**
1. Search Wikipedia for the term (tries singular form first)
2. Get first matching article
3. Extract intro section (first 2-3 sentences)
4. Generate article URL

**Fallback:**
- If no Wikipedia article found, section is skipped
- AI receives "(No Wikipedia entry available)"
- Note continues without Wikipedia section

**Language Support:**
- Uses Wikipedia in your selected language
- Defaults to English (`en`)
- URLs point to language-specific Wikipedia

### Dictionary Fetching

**Search Process:**
1. Try to fetch from dictionary API
2. Attempt singular form if original fails
3. Parse first entry
4. Extract up to 3 definitions

**Context for AI:**
- Simplified format: "word: definition1; definition2; definition3"
- Includes pronunciation in parentheses
- Optimized for AI understanding

**Display Format:**
- Rich markdown formatting
- Bullet points for definitions
- Indented examples
- Part of speech labels

### AI Synthesis

**Priority Order:**
1. **Primary**: Your notes ({{context}})
2. **Supporting**: Formal definitions ({{dictionary}}, {{wikipedia}})
3. **Approach**: Ground in formal, emphasize personal

**When Sources Missing:**
- Missing dictionary: AI synthesizes Wikipedia + your notes
- Missing Wikipedia: AI synthesizes dictionary + your notes  
- Missing both: AI works with only your notes (previous behavior)
- Missing your notes: No AI summary generated

---

## Example Comparisons

### Technical Term: "Redux"

**Dictionary:**
```
(Often not in standard dictionaries - programming term)
```

**Wikipedia:**
```
Redux is an open-source JavaScript library for managing and 
centralizing application state. It is most commonly used with 
libraries such as React or Angular.
```

**Your Notes:**
```
Using Redux for state management in our React app. Much better 
than prop drilling. Implemented with Redux Toolkit.
```

**AI Summary:**
```
Redux, as described by Wikipedia, is a JavaScript library for 
managing application state, commonly used with React. You're using 
it in your React application specifically to avoid prop drilling, 
and you've implemented it with Redux Toolkit for enhanced development 
experience.
```

---

### Common Term: "Algorithm"

**Dictionary:**
```
algorithm (/ˈælɡəˌrɪðəm/) - noun
1. A process or set of rules to be followed in calculations
2. A step-by-step procedure for solving a problem
```

**Wikipedia:**
```
In mathematics and computer science, an algorithm is a finite 
sequence of rigorous instructions, typically used to solve a class 
of specific problems or to perform a computation.
```

**Your Notes:**
```
Implementing sorting algorithms for the data pipeline. Quicksort 
vs mergesort tradeoffs. Need O(n log n) for production.
```

**AI Summary:**
```
An algorithm, formally defined as a step-by-step procedure for 
solving problems, is what you're implementing for your data pipeline. 
You're specifically comparing sorting algorithms (quicksort vs 
mergesort) and require O(n log n) time complexity for production use. 
As Wikipedia notes, algorithms are rigorous instructions for 
computation.
```

---

## Advanced Features

### Multi-Language Support

**Use Case:** Learning foreign language terms

**Setup:**
```
Wikipedia Language: es (Spanish)
Dictionary API: [Spanish dictionary endpoint if available]
```

**Result:**
- Spanish Wikipedia excerpts
- Spanish dictionary definitions (if API supports)
- Your notes still in your language

### Selective Source Usage

**Disable Wikipedia for personal concepts:**
```
Use Wikipedia: OFF
```
Good for: Internal project names, personal terminology

**Disable Dictionary for technical jargon:**
```
Use Dictionary API: OFF
```
Good for: Programming terms, domain-specific language

**Use only your notes:**
```
Use Wikipedia: OFF
Use Dictionary API: OFF
```
Result: Pure vault-based summaries (previous behavior)

---

## Troubleshooting

### Wikipedia Not Showing

**Problem:** No Wikipedia section in generated note

**Possible Causes:**
1. Term not in Wikipedia
2. Misspelled or ambiguous term
3. Wikipedia API timeout
4. Setting disabled

**Solution:**
- Check if Wikipedia has article for the term
- Try singular form of plural terms
- Verify "Use Wikipedia" is enabled
- Check internet connection

---

### Dictionary Definition Missing

**Problem:** No dictionary section

**Possible Causes:**
1. Technical/specialized term not in dictionary
2. Compound words or phrases
3. API error
4. Setting disabled

**Solution:**
- Expected for programming terms, proper nouns
- Wikipedia usually covers these instead
- Dictionary focuses on common English words

---

### AI Summary Ignores External Sources

**Problem:** Summary only references your notes

**Check:**
1. Are {{dictionary}} and {{wikipedia}} in your prompt template?
2. Is system prompt instructing AI to synthesize all sources?

**Fix:**
Update prompts to explicitly request synthesis:
```
System: Synthesize ALL provided sources: dictionary, Wikipedia, 
and user notes.

User: Use these sources for {{term}}:
{{dictionary}}
{{wikipedia}}
{{context}}

Integrate all three in your summary.
```

---

### Too Much External Info

**Problem:** AI summary too focused on Wikipedia/dictionary

**Solution:**
Adjust prompt to emphasize your notes:
```
Based on MY understanding: {{context}}

For reference:
{{dictionary}}
{{wikipedia}}

Focus on how I use {{term}}, briefly noting the formal definition.
```

---

## Best Practices

### 1. Balanced Synthesis
Default prompts create good balance - formal grounding + personal application

### 2. Selective Disabling
- Disable Wikipedia for internal/project terms
- Keep dictionary for general concepts
- Keep both for learning new topics

### 3. Language Consistency
- Use English Wikipedia for English terms
- Match Wikipedia language to term language
- Dictionary API usually English-only

### 4. Context Quality
Your notes remain most important - write good context around links!

### 5. Regeneration
- Delete and regenerate after learning more
- Wikipedia/dictionary don't change
- Your notes evolve → better summaries

---

## Privacy & Performance

### External API Calls

**Wikipedia:**
- Free, no authentication
- Public API
- Article titles and excerpts only

**Dictionary:**
- Free, no authentication  
- Public API
- Word lookups only

**Your Notes:**
- Sent only to your AI provider
- Not sent to Wikipedia/Dictionary APIs
- Local processing with LM Studio

### Performance Impact

**Additional Time:**
- +0.5-1 second per link for Wikipedia fetch
- +0.5-1 second per link for dictionary fetch
- Runs in parallel with vault scanning

**Batch Processing:**
- External calls happen concurrently
- Minimal impact on total processing time
- Network speed dependent

---

## Summary of Changes

### What's New
✅ Wikipedia integration with excerpts and links
✅ Dictionary definitions sent to AI as context
✅ New template variables: {{dictionary}}, {{wikipedia}}
✅ Updated default prompts for triple-source synthesis
✅ Language selection for Wikipedia
✅ Separate enable/disable for each external source

### What's Enhanced
✅ AI summaries now grounded in formal definitions
✅ Comprehensive triple-source notes
✅ Better handling of technical vs. common terms
✅ Richer context for AI synthesis

### What's Unchanged
✅ Your vault context extraction (still primary source)
✅ Batch processing and progress tracking
✅ All previous features (plurals, custom prompts, etc.)

---

## Quick Reference

### Triple-Source Hierarchy

1. **Your Notes** (Primary) - How YOU use it
2. **Dictionary** (Supporting) - What it formally means  
3. **Wikipedia** (Supporting) - General knowledge overview

### Template Variables

- `{{term}}` - The wikilink name
- `{{dictionary}}` - Dictionary definition
- `{{wikipedia}}` - Wikipedia excerpt
- `{{context}}` - Your vault mentions

### Settings Location

**Wikipedia:** Settings → WikiVault → External Sources → Use Wikipedia
**Dictionary:** Settings → WikiVault → External Sources → Use Dictionary API
**Prompts:** Settings → WikiVault → AI Prompts

---

**Result:** The most comprehensive, personalized knowledge base possible - combining formal definitions, general knowledge, and YOUR unique understanding! 🎯
