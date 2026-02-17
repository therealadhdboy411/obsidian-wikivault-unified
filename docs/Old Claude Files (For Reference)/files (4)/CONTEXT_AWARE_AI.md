# WikiVault Context-Aware AI - Documentation

## 🎯 Major Change: Your Notes, Your Summaries

**This version fundamentally changes how AI summaries work:**

### Before (Generic AI Knowledge)
- AI used its pre-trained knowledge
- Summaries were generic, like Wikipedia
- No connection to your specific notes

### After (Your Vault Context)
- AI **only** uses what YOU wrote
- Summaries synthesize YOUR understanding
- Reflects YOUR knowledge and terminology

---

## How It Works

### 1. Context Collection

When you have an unresolved link like `[[Machine Learning]]`, WikiVault:

1. **Scans your entire vault** for mentions
2. **Extracts context** from each mention:
   - The paragraph/lines containing the link
   - The heading/section it appears in
   - The source note name

3. **Builds a context package**:
```
From Project Notes (Deep Learning): We're using Machine Learning 
to analyze customer data. The neural network achieved 94% accuracy.

From Reading Notes (AI Books): Machine Learning differs from 
traditional programming by learning patterns from data rather 
than following explicit rules.

From Ideas (Future Research): Could Machine Learning help predict 
equipment failures before they happen?
```

### 2. AI Synthesis

The AI receives:
- **System Prompt**: "Base your response ONLY on the provided context"
- **User Prompt**: "Here's what the user wrote about this term..."
- **Your Context**: All the mentions from step 1

The AI then **synthesizes** your notes into a coherent summary.

### 3. Result

Instead of generic knowledge, you get **YOUR understanding** condensed:

```markdown
## AI Summary

> Based on your notes, Machine Learning is a technique for analyzing 
> data by learning patterns rather than following explicit rules. You're 
> using it for customer analysis with neural networks achieving 94% 
> accuracy, and you're exploring applications in predictive maintenance 
> for equipment failures.
```

---

## Example Comparison

### Scenario: You mention `[[Zettelkasten]]` in your vault

**Your Mentions:**
```
From Reading Notes: Zettelkasten is a note-taking method I learned 
from "How to Take Smart Notes". Each note should be atomic.

From Workflow: My Zettelkasten system uses a numbering scheme: 
1.1, 1.1.1, etc. for hierarchical organization.

From Ideas: Zettelkasten + AI could revolutionize knowledge management.
```

**OLD (Generic AI):**
```
Zettelkasten is a German word meaning "slip box". It's a method 
of note-taking developed by Niklas Luhmann involving index cards 
and systematic organization...
```

**NEW (Your Vault Context):**
```
Based on your notes, Zettelkasten is a note-taking method you 
learned from "How to Take Smart Notes" that emphasizes atomic 
notes. You're implementing it with a hierarchical numbering system 
(1.1, 1.1.1), and you see potential in combining it with AI for 
enhanced knowledge management.
```

See the difference? The new version reflects **YOUR** understanding and implementation.

---

## Benefits

### 1. Personalized Knowledge Base
- Summaries match your terminology
- Reflects your actual usage and context
- No generic "textbook" definitions

### 2. Consolidates Your Thinking
- Shows patterns in how you use concepts
- Synthesizes scattered thoughts
- Reveals connections you've made

### 3. Privacy-Focused
- AI never adds external information
- Only uses what's in your vault
- Your knowledge stays yours

### 4. Evolves With You
- Regenerate notes as you write more
- Summaries improve with richer context
- Grows with your understanding

---

## Configuration

### Template Variables

**{{term}}** - The wikilink name
```
Example: [[Machine Learning]] → "Machine Learning"
```

**{{context}}** - All mentions from your vault
```
Example:
From Note A (Section 1): Text containing [[term]]...
From Note B (Section 2): More text about [[term]]...
```

### Default Prompts

**System Prompt:**
```
You are a helpful assistant that synthesizes information from the 
user's notes. Base your responses ONLY on the context provided from 
their vault, not on your pre-trained knowledge. If the context doesn't 
contain enough information, say so.
```

**User Prompt Template:**
```
Based on the following mentions from my notes, provide a concise 
summary of "{{term}}":

{{context}}

Summary:
```

### Customization Ideas

**For detailed synthesis:**
```
User Prompt: Analyze these mentions of "{{term}}" from my notes and 
provide: 1) A summary of my understanding, 2) Key themes I've explored, 
3) Connections I've made:

{{context}}
```

**For simple consolidation:**
```
User Prompt: Briefly summarize what I know about {{term}} based on:

{{context}}
```

**For question-answering:**
```
User Prompt: Based on my notes below, what is {{term}} and how am I 
using it?

{{context}}
```

---

## Important Notes

### When AI Summary is Skipped

The AI summary will be **skipped** if:
- No context found in your vault (term never mentioned)
- Only wikilink exists but no surrounding text
- API is unavailable or not configured

In these cases:
- Dictionary definition still shows (if enabled)
- "Mentions" section will be empty
- Only the heading and "See Also" sections appear

### Context Quality Matters

**Better context = Better summaries**

Write around your wikilinks:
```
❌ Just a link: [[Machine Learning]]

✅ With context: We're implementing [[Machine Learning]] algorithms 
to predict customer churn based on usage patterns.
```

### Rebuilding Summaries

To update a summary after writing more:
1. Delete the generated note
2. Run WikiVault again
3. New summary reflects all current mentions

Or just modify the generated note manually!

---

## Example Generated Note

Here's what a full note looks like with context-aware AI:

```markdown
# Neural Networks

> **Note:** The plural form of this term is [[Neural Network]].

## Dictionary Definition

**neural network** _/ˈnʊrəl ˈnetwɜrk/_

_noun_
1. A computer system modeled on the human brain and nervous system

## AI Summary

> Based on your notes, neural networks are a core component of your 
> deep learning project for customer segmentation. You're using a 
> 3-layer architecture with ReLU activation and achieving 87% accuracy. 
> You've noted challenges with overfitting and are exploring dropout 
> regularization. You're also considering using neural networks for 
> your predictive maintenance initiative.

## See Also

[[Deep Learning]]

## Mentions

### From [[Project Documentation]] → Deep Learning → Architecture

> Our customer segmentation model uses a 3-layer [[Neural Network]] 
> with ReLU activation functions. The input layer has 15 features, 
> hidden layers have 64 and 32 neurons, and the output layer produces 
> 5 customer segments.

### From [[Weekly Notes 2024-02]] → Experiments

> [[Neural Networks]] are showing promising results but we're seeing 
> overfitting on the training data. Will try dropout regularization 
> next week. Current accuracy: 87% validation, 94% training.

### From [[Ideas]] → Future Projects

> Could [[Neural Networks]] help with predictive maintenance? Worth 
> exploring for the equipment failure prediction initiative.
```

---

## Troubleshooting

### AI Summary Seems Generic

**Problem:** Summary doesn't reflect your notes

**Solutions:**
1. Check the prompt uses `{{context}}` variable
2. Verify system prompt emphasizes using provided context
3. Ensure context extraction is working (check "Mentions" section)

### No AI Summary Generated

**Problem:** Summary section is missing

**Possible Causes:**
- No mentions found in vault (term never used)
- API not configured or unavailable
- Context extraction returned empty

**Check:**
- Does "Mentions" section have content?
- Is LM Studio running?
- Are prompts correctly formatted?

### Summary Too Short/Vague

**Problem:** Not enough detail in summary

**Solutions:**
1. Write more around your wikilinks in notes
2. Use "Include Full Paragraphs" setting
3. Adjust prompt to request more detail:
```
Provide a detailed summary including all key points about {{term}}...
```

### Summary Contradicts Your Notes

**Problem:** AI adds external information

**Solution:**
- Strengthen system prompt:
```
You MUST base your response ONLY on the provided context. Do NOT 
use any external knowledge. If the context is insufficient, state 
that clearly.
```

---

## Advanced Usage

### Compare Your Understanding vs. General Knowledge

**Two-step approach:**

1. **Use context-aware summary** (your understanding)
2. **Add dictionary definition** (general knowledge)
3. **Compare** to see where your usage differs

### Track Knowledge Evolution

**Regenerate notes periodically:**
- Month 1: Basic understanding
- Month 6: Richer context, deeper synthesis
- Year 1: Comprehensive personal knowledge base

### Custom Synthesis Modes

**Different prompts for different purposes:**

**Learning Mode:**
```
Based on my notes, what have I learned about {{term}}? 
What questions remain?

{{context}}
```

**Application Mode:**
```
How am I using {{term}} in my projects? What results am I seeing?

{{context}}
```

**Connection Mode:**
```
What connections have I made between {{term}} and other concepts?

{{context}}
```

---

## Best Practices

### 1. Write Contextually

Instead of:
```
See [[Machine Learning]]
```

Write:
```
We'll use [[Machine Learning]] to segment customers by behavior patterns
```

### 2. Use Headings

The heading context helps AI understand structure:
```
## Project Goals
- Implement [[Machine Learning]] for churn prediction

## Current Status
- [[Machine Learning]] model at 85% accuracy
```

### 3. Regular Regeneration

Update generated notes as your knowledge grows:
- After major learning sessions
- When completing projects
- Quarterly knowledge reviews

### 4. Maintain Quality

Your vault quality determines AI quality:
- Clear, complete sentences
- Proper context around links
- Organized note structure

---

## Privacy & Security

### What the AI Sees
- ONLY the text from your vault mentions
- NO file names (except in "From [[Note]]" format)
- NO metadata or system information

### What the AI Doesn't See
- Other notes without mentions
- Your vault structure
- Personal information outside mention context

### Local Processing (LM Studio)
- Everything stays on your machine
- No data sent to cloud
- Complete privacy

---

## Summary

**WikiVault now creates a personal knowledge base that:**
- ✅ Reflects YOUR understanding
- ✅ Uses YOUR terminology
- ✅ Synthesizes YOUR notes
- ✅ Grows with YOUR learning
- ✅ Respects YOUR privacy

The AI is your synthesis assistant, not a generic encyclopedia. It helps you understand what YOU know about each topic based on what YOU'VE written.

**Your notes → Your knowledge → Your summaries** 🎯
