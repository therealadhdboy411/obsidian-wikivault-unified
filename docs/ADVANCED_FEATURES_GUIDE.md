# WikiVault Advanced - Complete Feature Guide

## 🚀 Major Features Added

This update transforms WikiVault into a comprehensive knowledge management system with 15+ major features:

### 1. ✅ **Priority Queue Processing**
Process frequently mentioned terms first

### 2. 🌐 **Wikipedia Integration**
Automatic Wikipedia links and excerpts

### 3. 📚 **Dictionary Context Injection**
Dictionary definitions passed to AI for better summaries

### 4. 📖 **Custom Glossary Base**
Reference your own glossary notes

### 5. 🔤 **Synonym & Abbreviation Detection**
Auto-map "ML" → "Machine Learning"

### 6. 🏷️ **Auto-Generated Tags**
AI creates relevant tags automatically

### 7. 🔗 **Related Concepts**
AI suggests connected terms

### 8. 📝 **Model Tracking**
Track which model generated each note

### 9. 🎯 **Enhanced Context Injection**
Vault + Dictionary + Wikipedia + Glossary → AI

### 10. 📊 **Improved Plural Handling**
Better detection of variations

---

## Detailed Feature Breakdown

### 1. Priority Queue Processing

**What it does:** Processes most-mentioned terms first

**How it works:**
- Counts how many times each unresolved link appears
- Sorts by frequency (highest first)
- Important terms get processed before rare ones

**Example:**
```
[[Machine Learning]] - mentioned 47 times → Priority 1
[[Neural Networks]] - mentioned 32 times → Priority 2
[[Gradient Descent]] - mentioned 8 times → Priority 3
[[Backpropagation]] - mentioned 2 times → Priority 4
```

**Settings:**
- `usePriorityQueue`: true/false
- Default: true

**Benefits:**
- Important terms get definitions faster
- Better for incremental processing
- Makes sense when you have many unresolved links

---

### 2. Wikipedia Integration

**What it does:** Fetches Wikipedia article links and excerpts

**How it works:**
1. Searches Wikipedia for the term
2. Gets the article URL
3. Extracts first 2-3 sentences
4. Adds to note with link

**Output:**
```markdown
## Wikipedia

[Read more on Wikipedia](https://en.wikipedia.org/wiki/Machine_Learning)

Machine learning is a branch of artificial intelligence (AI) and 
computer science that focuses on the use of data and algorithms to 
imitate the way humans learn. It is seen as a subset of artificial 
intelligence.
```

**Context Injection:**
If `useWikipediaInContext` is enabled, the full Wikipedia extract is also passed to the AI:

```
AI receives:
From your vault: [your notes]
From glossary: [your glossary]
Dictionary: [dictionary definition]
Wikipedia: [Wikipedia extract]
```

**Settings:**
- `useWikipedia`: Enable Wikipedia fetching
- `useWikipediaInContext`: Pass Wikipedia to AI
- Default: both true

---

### 3. Dictionary Context Injection

**What it does:** Passes dictionary definitions to AI for better summaries

**How it works:**
- Dictionary API fetches definition (as before)
- **NEW:** Definition is also injected into AI context
- AI can reference formal definition when writing summary

**Example AI Context:**
```
Based on the following information, summarize "Redux":

From your vault:
Using Redux for state management...

Dictionary definition:
Redux [noun] A predictable state container...

Wikipedia:
Redux is an open-source JavaScript library...

Summary:
```

**Result:** AI summaries are more accurate and formal when needed

**Settings:**
- `useDictionaryInContext`: true/false
- Default: true

---

### 4. Custom Glossary Base

**What it does:** References your own glossary/definitions note

**How it works:**
1. Specify a glossary file path (e.g., "Definitions.md")
2. Plugin searches that file for the term
3. Extracts relevant section
4. Includes in AI context

**Glossary File Format:**
```markdown
# My Glossary

## Machine Learning
A technique for teaching computers to learn from data...

## Neural Networks
Computational models inspired by biological brains...
```

**When Processing `[[Machine Learning]]`:**
```
AI Context includes:
From your vault: [mentions]
From your glossary: "A technique for teaching computers..."
Dictionary: [definition]
Wikipedia: [excerpt]
```

**Settings:**
- `glossaryBasePath`: Path to glossary file
- Example: "Definitions.md" or "Reference/Glossary.md"

**Benefits:**
- Your custom definitions take precedence
- Domain-specific terminology
- Company/project-specific meanings

---

### 5. Synonym & Abbreviation Detection

**What it does:** Maps abbreviations to full terms automatically

**How it works:**

**Method 1: Custom Mapping**
```json
"synonyms": {
  "ML": "Machine Learning",
  "AI": "Artificial Intelligence",
  "NN": "Neural Network"
}
```

When you have `[[ML]]` → Creates note that links to `[[Machine Learning]]`

**Method 2: Automatic Detection**
If you have a note titled "Machine Learning", and encounter `[[ML]]`:
- Checks if "ML" = initials of "Machine Learning"
- Automatically creates link

**Output:**
```markdown
# ML

> **Note:** "ML" appears to be an abbreviation or synonym for 
> [[Machine Learning]].

[Rest of note...]
```

**Pre-configured Synonyms:**
- ML → Machine Learning
- AI → Artificial Intelligence
- DL → Deep Learning
- NLP → Natural Language Processing
- RL → Reinforcement Learning
- NN → Neural Network
- CNN → Convolutional Neural Network
- RNN → Recurrent Neural Network
- GAN → Generative Adversarial Network
- LLM → Large Language Model

**Adding Custom Synonyms:**
Edit `data.json`:
```json
"synonyms": {
  "API": "Application Programming Interface",
  "DB": "Database",
  "CI/CD": "Continuous Integration Continuous Deployment"
}
```

---

### 6. Auto-Generated Tags

**What it does:** AI generates relevant tags based on content

**How it works:**
1. AI analyzes all context (vault + dictionary + Wikipedia + glossary)
2. Generates relevant tags
3. Adds to note frontmatter

**AI Prompt Addition:**
```
Additionally, provide:
- Up to 5 relevant tags (format: TAGS: tag1, tag2, tag3)
```

**Output in Note:**
```yaml
---
generated: 2024-02-15T10:30:00.000Z
model: mistral-small-latest
provider: mistral
tags:
  - machine-learning
  - artificial-intelligence
  - data-science
  - algorithms
  - neural-networks
---
```

**Settings:**
- `generateTags`: Enable/disable
- `maxTags`: Number of tags (1-10)
- Default: true, 5 tags

**Benefits:**
- Automatic organization
- Consistent tagging
- Searchable by tag
- Dataview queries

---

### 7. Related Concepts

**What it does:** AI suggests related terms and concepts

**How it works:**
1. AI analyzes context
2. Identifies related concepts
3. Creates wikilinks to them

**AI Prompt Addition:**
```
Additionally, provide:
- Up to 5 related concepts (format: RELATED: concept1, concept2, concept3)
```

**Output in Note:**
```markdown
## Related Concepts

- [[Deep Learning]]
- [[Neural Networks]]
- [[Supervised Learning]]
- [[Feature Engineering]]
- [[Model Training]]
```

**Settings:**
- `generateRelatedConcepts`: Enable/disable
- `maxRelatedConcepts`: Number (1-10)
- Default: true, 5 concepts

**Benefits:**
- Discovery of connections
- Knowledge graph building
- Navigation between topics
- Identifies gaps

**Advanced:** If related concepts don't exist yet, they'll become unresolved links → Run WikiVault again → They get created → Knowledge base grows organically!

---

### 8. Model Tracking

**What it does:** Records which AI model generated each note

**How it works:**
Adds metadata to frontmatter:

```yaml
---
generated: 2024-02-15T10:30:00.000Z
model: mistral-small-latest
provider: mistral
tags: [...]
---
```

**Benefits:**
- Track quality across models
- Compare outputs
- Regenerate with different model
- Attribution for AI content

**Settings:**
- `trackModel`: Enable/disable
- Default: true

**Use Cases:**
- A/B testing models
- Quality auditing
- Compliance requirements
- Historical tracking

---

### 9. Enhanced Context Injection

**What it does:** Comprehensive context from multiple sources

**Context Hierarchy:**
```
AI Context = 
  Your Vault Notes
  + Custom Glossary
  + Dictionary Definition (if enabled)
  + Wikipedia Extract (if enabled)
```

**Example Complete Context:**
```
Based on the following information, summarize "Machine Learning":

From your vault:
From Project Notes (Implementation): We're using Machine Learning 
to segment customers with 87% accuracy. The model uses a random 
forest classifier...

From your glossary:
Machine Learning: A technique we use for data-driven predictions. 
Focus on supervised learning for our use cases.

Dictionary definition:
machine learning [noun]: The use and development of computer 
systems that are able to learn and adapt...

Wikipedia:
Machine learning (ML) is a field of study in artificial 
intelligence concerned with the development of algorithms...

Summary:
```

**Result:** Rich, accurate summaries that combine:
- Your understanding
- Formal definitions
- Domain knowledge
- Reference material

**Control Toggles:**
- `useDictionaryInContext`: Include dictionary
- `useWikipediaInContext`: Include Wikipedia
- Both default: true

---

### 10. Improved Plural Handling

**What it does:** Better detection of plural/singular variations

**Enhanced Patterns:**
- Regular: cat/cats, dog/dogs
- -ies: story/stories, category/categories  
- -ves: knife/knives, shelf/shelves
- -xes/-ches/-shes: box/boxes, church/churches
- Irregular: child/children, person/people, analysis/analyses
- Latin: criterion/criteria, phenomenon/phenomena

**New Additions:**
- analysis/analyses
- thesis/theses
- criterion/criteria
- phenomenon/phenomena

**Output:**
```markdown
> **Note:** This appears to be the plural form of [[Analysis]]. 
> The definition below may refer to the singular form.
```

---

## Complete Example Note

Here's what a fully-featured generated note looks like:

```markdown
---
generated: 2024-02-15T10:30:00.000Z
model: mistral-small-latest
provider: mistral
tags:
  - machine-learning
  - artificial-intelligence
  - supervised-learning
  - algorithms
  - data-science
---

# Machine Learning

## Wikipedia

[Read more on Wikipedia](https://en.wikipedia.org/wiki/Machine_learning)

Machine learning (ML) is a field of study in artificial intelligence 
concerned with the development and study of statistical algorithms 
that can learn from data and generalize to unseen data.

## Dictionary Definition

**machine learning** _/məˈʃiːn ˈlɜːrnɪŋ/_

_noun_
1. The use and development of computer systems that are able to learn 
and adapt without following explicit instructions

## AI Summary

> Based on your notes and reference materials, machine learning is a 
> data-driven approach you're using for customer segmentation, achieving 
> 87% accuracy with random forest classifiers. You understand it as a 
> subset of AI focused on learning from data rather than explicit 
> programming. Your implementation uses supervised learning techniques 
> for pattern recognition in customer behavior.

## Related Concepts

- [[Deep Learning]]
- [[Neural Networks]]
- [[Supervised Learning]]
- [[Feature Engineering]]
- [[Random Forest]]

## Mentions

### From [[Project Documentation]] → Implementation → Customer Segmentation

> We're using Machine Learning to segment customers based on purchase 
> history and browsing behavior. Our random forest model achieved 87% 
> accuracy on the validation set, significantly outperforming rule-based 
> approaches.

### From [[Reading Notes]] → AI Fundamentals

> Machine Learning is fundamentally different from traditional 
> programming. Instead of writing explicit rules, we provide examples 
> and let the algorithm discover patterns. This makes it powerful for 
> complex, data-rich problems.

### From [[Weekly Meeting Notes]] → Tech Discussion

> Discussed expanding Machine Learning use cases to fraud detection 
> and demand forecasting. Team consensus: start with supervised learning 
> before exploring unsupervised methods.
```

---

## Configuration Guide

### Minimal Setup (Fast & Simple)
```json
{
  "useDictionaryAPI": false,
  "useWikipedia": false,
  "generateTags": false,
  "generateRelatedConcepts": false,
  "batchSize": 5
}
```
**Result:** Fast processing, vault context only

### Balanced (Recommended)
```json
{
  "useDictionaryAPI": true,
  "useWikipedia": true,
  "useDictionaryInContext": true,
  "useWikipediaInContext": true,
  "generateTags": true,
  "generateRelatedConcepts": true,
  "batchSize": 3
}
```
**Result:** Rich notes, good speed

### Maximum Quality
```json
{
  "useDictionaryAPI": true,
  "useWikipedia": true,
  "useDictionaryInContext": true,
  "useWikipediaInContext": true,
  "glossaryBasePath": "Definitions.md",
  "generateTags": true,
  "maxTags": 8,
  "generateRelatedConcepts": true,
  "maxRelatedConcepts": 8,
  "batchSize": 1
}
```
**Result:** Highest quality, slower

---

## Obsidian Copilot Integration

**Status:** Not directly integrated yet

**Why:** Obsidian Copilot doesn't expose a public API that other plugins can call

**Workaround:** You can:
1. Use WikiVault to generate comprehensive notes
2. Use Copilot to chat about those notes
3. Copilot will have access to all the rich content

**Future:** If Copilot adds a plugin API, integration will be possible

---

## Workflow Examples

### Research Workflow

1. **Take notes** mentioning terms like `[[Quantum Computing]]`
2. **Run WikiVault** → Priority queue processes most-mentioned first
3. **Get comprehensive notes** with:
   - Wikipedia overview
   - Dictionary definition
   - Your specific notes
   - AI synthesis
   - Related concepts to explore

4. **Follow related concepts** → More unresolved links
5. **Run WikiVault again** → Knowledge base grows
6. **Iterate** → Complete knowledge graph

### Learning Workflow

1. **Create study notes** with `[[New Concepts]]`
2. **Run WikiVault**
3. **Get:**
   - Formal definitions (dictionary)
   - General knowledge (Wikipedia)
   - Your understanding (vault)
   - AI synthesis combining all

4. **Review related concepts**
5. **Fill knowledge gaps**

### Project Documentation

1. **Document with technical terms** `[[API Gateway]]`
2. **Add to custom glossary** with project-specific meanings
3. **Run WikiVault**
4. **Get notes combining:**
   - General definitions
   - Your project-specific usage
   - Team's understanding
   - Related technologies

---

## Tips & Best Practices

### 1. Use Glossary for Domain Terms

Create a glossary note:
```markdown
# Project Glossary

## Customer Score
Our proprietary metric combining engagement, spend, and loyalty...

## Activation Event
When a user completes onboarding and makes their first purchase...
```

Then: `glossaryBasePath: "Project Glossary.md"`

### 2. Curate Synonyms

Add team/project abbreviations:
```json
"synonyms": {
  "CS": "Customer Score",
  "AE": "Activation Event",
  "DAU": "Daily Active Users"
}
```

### 3. Let Related Concepts Grow Your Knowledge Base

- Enable `generateRelatedConcepts`
- Run WikiVault multiple times
- Each run creates more notes
- Knowledge base grows organically

### 4. Use Tags for Organization

Enable `generateTags`, then:
- Query by tag in search
- Use Dataview queries
- Filter in graph view
- Group related notes

### 5. Track Model Performance

Enable `trackModel`, then compare:
- Which model gives better summaries?
- Cost vs. quality trade-offs
- Regenerate important notes with better models

---

## Troubleshooting

### Wikipedia Not Loading
- Check internet connection
- Some terms may not have Wikipedia pages
- Wikipedia API may be rate-limited

### Dictionary API Fails
- Normal for technical/specialized terms
- Check internet connection
- Try singular form of plural terms

### AI Not Generating Tags/Related Concepts
- Check format in AI response
- Must match: `TAGS: tag1, tag2, tag3`
- Must match: `RELATED: concept1, concept2`
- Strengthen prompt if needed

### Abbreviations Not Resolving
- Add to synonyms in data.json
- Check spelling exactly
- Custom mappings are case-sensitive

### Glossary Not Found
- Check path is relative to vault root
- Include file extension (.md)
- Make sure file exists

---

## Next Steps

1. **Install the update**
2. **Configure settings** for your workflow
3. **Add custom synonyms** for your domain
4. **Create a glossary** (optional)
5. **Run WikiVault** and watch it work!

Read the ADVANCED_FEATURES_EXAMPLES.md for detailed use cases!
