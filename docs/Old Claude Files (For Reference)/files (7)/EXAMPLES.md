# Example: How Auto Wiki Works

This file demonstrates how the Auto Wiki plugin processes wikilinks and generates pages.

## Scenario 1: Simple Paragraph Context

Let's say you have a note with this content:

```markdown
The [[Zettelkasten]] method is a powerful note-taking system developed by Niklas Luhmann. 
It emphasizes atomic notes and connections between ideas, making it perfect for knowledge workers 
and researchers who want to build a comprehensive personal knowledge base.
```

**Result:** Auto Wiki creates `Zettelkasten.md`:

```markdown
# Zettelkasten

## Summary

The Zettelkasten method is a note-taking system developed by Niklas Luhmann that uses atomic notes 
and emphasizes connections between ideas for building a personal knowledge base.

## References

From [[Original Note]]:

> The [[Zettelkasten]] method is a powerful note-taking system developed by Niklas Luhmann. 
> It emphasizes atomic notes and connections between ideas, making it perfect for knowledge workers 
> and researchers who want to build a comprehensive personal knowledge base.
```

## Scenario 2: Bullet Point Context

If your note has:

```markdown
Research methods for knowledge management:
- Traditional methods
  - Filing systems
  - Index cards
- Modern methods
  - [[Digital Gardens]] allow organic growth
    - Non-linear structure
    - Interconnected ideas
    - Public learning
```

**Result:** Auto Wiki creates `Digital Gardens.md`:

```markdown
# Digital Gardens

## Summary

Digital gardens are a modern knowledge management approach characterized by organic growth, 
non-linear structure, and interconnected ideas shared publicly for collaborative learning.

## References

From [[Original Note]]:

> - Modern methods
>   - [[Digital Gardens]] allow organic growth
>     - Non-linear structure
>     - Interconnected ideas
>     - Public learning
```

Note: The plugin captures the parent bullet and all sub-bullets!

## Scenario 3: Fuzzy Matching / Similar Notes

If you already have a note called "Machine Learning" and create a link to "[[machine learning]]":

**Result:** Auto Wiki creates `machine learning.md`:

```markdown
# machine learning

> **See:** [[Machine Learning]]

## References

From [[AI Research Notes]]:

> Recent advances in [[machine learning]] have revolutionized natural language processing.
```

This prevents duplicate pages while still capturing the reference!

## Scenario 4: Multiple References

If multiple notes reference the same missing wikilink:

**Note 1:**
```markdown
[[PKM]] stands for Personal Knowledge Management.
```

**Note 2:**
```markdown
Tools for [[PKM]]:
- Obsidian
- Roam Research
- Notion
```

**Result:** Auto Wiki creates `PKM.md` with ALL references:

```markdown
# PKM

## Summary

PKM (Personal Knowledge Management) refers to the practice of collecting, organizing, and utilizing 
personal knowledge using various tools and methodologies.

## References

From [[Note 1]]:

> [[PKM]] stands for Personal Knowledge Management.

From [[Note 2]]:

> Tools for [[PKM]]:
> - Obsidian
> - Roam Research
> - Notion
```

## Configuration Examples

### Using OpenAI

```
AI Endpoint: https://api.openai.com/v1/chat/completions
API Key: sk-...
Model: gpt-3.5-turbo
```

### Using Local LLM (LM Studio)

```
AI Endpoint: http://localhost:1234/v1/chat/completions
API Key: (leave blank)
Model: local-model-name
```

### Using Ollama

First, run Ollama with OpenAI compatibility:
```bash
OLLAMA_ORIGINS=* ollama serve
```

Then configure:
```
AI Endpoint: http://localhost:11434/v1/chat/completions
API Key: ollama
Model: llama2
```

## Tips for Best Results

1. **Review your wikilinks first** - Make sure they're spelled correctly
2. **Use consistent naming** - Decide on capitalization conventions
3. **Adjust similarity threshold** - Lower = more aggressive fuzzy matching
4. **Use folders** - Organize wiki pages like `[[Wiki/Concept]]`
5. **Run incrementally** - Process sections of your vault at a time

## What Gets Created

For each missing wikilink, Auto Wiki creates:

1. ✅ A new markdown file with the wikilink name
2. ✅ A heading with the concept name
3. ✅ (Optional) An AI-generated summary
4. ✅ A "References" section with backlinks
5. ✅ Context from where the link was mentioned
6. ✅ (If similar exists) A "See" reference to the similar note

## What Doesn't Get Processed

- Links to existing notes (no duplicates!)
- Embedded images `![[image.png]]` (only text wikilinks)
- External links `[external](url)`
- Tags `#tag`

## Real-World Use Case

Imagine you're researching machine learning and taking notes. You write:

```markdown
# ML Fundamentals

The core of [[supervised learning]] involves training on labeled data. 
Key algorithms include:
- [[Decision Trees]]
  - Easy to interpret
  - Prone to overfitting
- [[Neural Networks]]
  - Powerful but complex
  - Require large datasets

[[Unsupervised learning]], on the other hand, works with unlabeled data.
```

After running Auto Wiki:

1. Creates `supervised learning.md` with the paragraph context
2. Creates `Decision Trees.md` with bullet hierarchy
3. Creates `Neural Networks.md` with bullet hierarchy  
4. Creates `Unsupervised learning.md` with sentence context
5. Each includes AI summary + backlinks to "ML Fundamentals"

Now you have 5 interconnected wiki pages that build out your knowledge base automatically!
