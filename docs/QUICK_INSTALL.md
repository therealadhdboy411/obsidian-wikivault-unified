# WikiVault Advanced - Quick Install Guide

## 🎯 What's New

This update adds 15+ major features including:
- ✅ Priority queue (process important terms first)
- 🌐 Wikipedia integration (automatic links + excerpts)
- 📚 Dictionary context injection (definitions passed to AI)
- 📖 Custom glossary support (reference your own definitions)
- 🔤 Synonym/abbreviation detection (ML → Machine Learning)
- 🏷️ Auto-generated tags
- 🔗 Related concepts suggestions
- 📝 Model tracking
- 🎯 Enhanced context (vault + dictionary + Wikipedia + glossary)

---

## 📥 Installation

### 1. Backup
Backup these files (optional but recommended):
```
.obsidian/plugins/obsidian-wikivault/main.js
.obsidian/plugins/obsidian-wikivault/data.json
```

### 2. Install Files
Replace in `.obsidian/plugins/obsidian-wikivault/`:
- ✅ `main.js` (NEW advanced version)
- ✅ `data.json` (NEW settings)

### 3. Restart Obsidian
- Close and reopen Obsidian, OR
- Settings → Community Plugins → WikiVault → Toggle off/on

### 4. Verify
Check Settings → WikiVault for new sections:
- Knowledge Sources
- AI-Generated Content
- Synonyms & Abbreviations

---

## ⚙️ Quick Configuration

### Minimal Setup (Fast)
```json
{
  "useWikipedia": false,
  "useDictionaryAPI": false,
  "generateTags": false,
  "batchSize": 5
}
```

### Recommended (Balanced)
```json
{
  "useWikipedia": true,
  "useDictionaryAPI": true,
  "generateTags": true,
  "generateRelatedConcepts": true,
  "usePriorityQueue": true,
  "batchSize": 3
}
```

### Maximum Quality
```json
{
  "useWikipedia": true,
  "useDictionaryAPI": true,
  "glossaryBasePath": "Definitions.md",
  "generateTags": true,
  "generateRelatedConcepts": true,
  "usePriorityQueue": true,
  "batchSize": 1
}
```

---

## 🚀 First Run

### 1. Test with One Note
Create a test note:
```markdown
# Test

I'm learning about [[Machine Learning]] and [[Python]].
```

### 2. Run WikiVault
Click the book icon in ribbon, or use command palette

### 3. Check Results
Look in "Vault Wiki" folder for generated notes with:
- ✅ Wikipedia section
- ✅ Dictionary definition
- ✅ AI summary (from YOUR notes)
- ✅ Related concepts
- ✅ Tags in frontmatter
- ✅ Your mentions

---

## 🔧 Optional: Custom Configuration

### Add Synonyms
Edit `data.json` to add your own:
```json
"synonyms": {
  "ML": "Machine Learning",
  "API": "Application Programming Interface",
  "DB": "Database"
}
```

### Create a Glossary
Create `Definitions.md` in your vault:
```markdown
# My Glossary

## Machine Learning
Our company uses ML for customer segmentation...

## API Gateway
Our API gateway is Kong, deployed on AWS...
```

Then set:
```json
"glossaryBasePath": "Definitions.md"
```

---

## 📊 Example Output

### Before (Old Version)
```markdown
# Machine Learning

## AI Summary

> Machine learning is a branch of AI...

## Mentions

### From [[My Notes]]
> Using machine learning...
```

### After (New Version)
```yaml
---
generated: 2024-02-15T10:30:00.000Z
model: mistral-small-latest
provider: mistral
tags:
  - artificial-intelligence
  - data-science
  - algorithms
---

# Machine Learning

## Wikipedia

[Read more on Wikipedia](https://en.wikipedia.org/wiki/Machine_learning)

Machine learning is a field of study in artificial intelligence...

## Dictionary Definition

**machine learning** _/məˈʃiːn ˈlɜːrnɪŋ/_

_noun_
1. The use and development of computer systems...

## AI Summary

> Based on your notes, Wikipedia, and dictionary: Machine learning 
> is the technique you're using for customer segmentation...

## Related Concepts

- [[Deep Learning]]
- [[Neural Networks]]
- [[Supervised Learning]]

## Mentions

### From [[My Notes]] → Projects → AI
> Using machine learning for customer analysis...
```

---

## 🔍 Feature Highlights

### Priority Queue
```
Processing [[API]] (45 mentions) first
Then [[Database]] (38 mentions)
Then [[Auth]] (27 mentions)
...
```
Most important terms get defined first!

### Synonym Detection
```
You write: [[ML]]
WikiVault creates note linking to [[Machine Learning]]
```

### Wikipedia Integration
```
Adds:
- Link to Wikipedia article
- First 2-3 sentences as context
- Optional: Full extract passed to AI
```

### Auto Tags
```yaml
tags:
  - machine-learning
  - ai
  - data-science
```

### Related Concepts
```markdown
## Related Concepts
- [[Deep Learning]]
- [[Neural Networks]]
- [[Supervised Learning]]
```
Click these → More unresolved links → Run again → Knowledge base grows!

---

## 🐛 Troubleshooting

### No Wikipedia section
- Term may not have Wikipedia page
- Check internet connection
- Normal for very specific/technical terms

### No Tags generated
- AI response format issue
- Check AI is responding properly
- Tags appear in frontmatter YAML

### Synonyms not resolving
- Check spelling in data.json
- Mappings are case-sensitive
- Restart after editing data.json

### Slow processing
- Reduce batch size
- Disable Wikipedia
- Disable dictionary

---

## 📚 Next Steps

1. ✅ Install files
2. ✅ Restart Obsidian
3. ✅ Configure settings
4. ✅ Add custom synonyms (optional)
5. ✅ Create glossary (optional)
6. ✅ Run WikiVault
7. ✅ Review generated notes
8. ✅ Adjust settings as needed

**Read full documentation:**
- `ADVANCED_FEATURES_GUIDE.md` - Complete feature breakdown
- `ADVANCED_EXAMPLES.md` - Real-world use cases

---

## 🎓 Learning Path

### Day 1: Basic Usage
- Install and run with defaults
- Review generated notes
- Understand structure

### Day 2: Customization  
- Add your synonyms
- Adjust tag/concept limits
- Try different batch sizes

### Day 3: Advanced
- Create custom glossary
- Tune AI prompts
- Compare models

### Week 2: Optimization
- Analyze which features you use
- Disable unused features
- Perfect your workflow

---

## ✨ Key Benefits

1. **Comprehensive Notes** - Dictionary + Wikipedia + Your understanding
2. **Smart Processing** - Priority queue, batch processing, ETA
3. **Knowledge Graph** - Related concepts build connections
4. **Auto-Organization** - Tags, tracking, structure
5. **Personalized** - Glossary, synonyms, your context
6. **Extensible** - Model tracking, multiple sources

---

**You're ready to go! Click the book icon and watch WikiVault create an amazing knowledge base.** 🚀
