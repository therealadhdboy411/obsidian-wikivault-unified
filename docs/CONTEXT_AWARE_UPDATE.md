# WikiVault Context-Aware Update - Quick Guide

## 🎯 What Changed?

**The AI now uses YOUR notes instead of pre-trained knowledge!**

### Before
```
User: Generate note for [[Machine Learning]]
AI: "Machine learning is a branch of AI that uses statistical 
     techniques..." [Generic Wikipedia-style]
```

### After
```
User: Generate note for [[Machine Learning]]
AI: "Based on your notes, machine learning is what you're using 
     for customer segmentation. Your neural network achieved 87% 
     accuracy..." [YOUR specific understanding]
```

---

## Quick Start

### 1. Install Files
Replace in `.obsidian/plugins/obsidian-wikivault/`:
- `main.js` ✅
- `data.json` ✅

### 2. Restart Obsidian

### 3. Check Settings
Go to Settings → WikiVault → AI Prompts

You should see:
```
⚠️ The AI now uses YOUR vault context, not pre-trained knowledge. 
Use {{context}} to inject your notes.
```

### 4. Test It

**Create a test note:**
```markdown
# My Test Note

I'm exploring [[Quantum Computing]] for cryptography applications.
The concept uses superposition to process multiple states simultaneously.
```

**Run WikiVault** (click ribbon icon)

**Check generated note:** Should reference YOUR note about cryptography, not generic quantum computing info.

---

## New Template Variables

### {{context}}
Injects all mentions from your vault.

**Example prompt:**
```
Based on these mentions: {{context}}

Summarize what I know about {{term}}.
```

**What gets injected:**
```
From My Test Note (Cryptography): I'm exploring Quantum Computing 
for cryptography applications. The concept uses superposition...
```

---

## Updated Default Prompts

### System Prompt (New Default)
```
You are a helpful assistant that synthesizes information from the 
user's notes. Base your responses ONLY on the context provided from 
their vault, not on your pre-trained knowledge. If the context doesn't 
contain enough information, say so.
```

### User Prompt Template (New Default)
```
Based on the following mentions from my notes, provide a concise 
summary of "{{term}}":

{{context}}

Summary:
```

---

## Key Behaviors

### ✅ When It Works Great
- You have multiple mentions of the term in your vault
- Mentions have surrounding context (full sentences)
- Headings and structure provide organization

### ⚠️ When Summary is Skipped
- No mentions found (unlinked term)
- Only bare `[[link]]` without context
- API unavailable

### 📝 Result
- Dictionary definition: Shows if available
- AI Summary: **Only** if context exists
- Mentions: Shows your vault references

---

## Example Before/After

### Your Vault Contains:
```markdown
# Project Notes
We're using [[Redux]] for state management in the React app.
It helps manage complex data flow across components.

# Learning Log
[[Redux]] follows unidirectional data flow: action → reducer → store.
Much better than prop drilling.
```

### OLD Behavior (Generic)
```markdown
## AI Summary

> Redux is a predictable state container for JavaScript apps, 
> commonly used with React. It provides centralized state management 
> through actions, reducers, and a single store following the Flux 
> architecture pattern...
```

### NEW Behavior (Your Notes)
```markdown
## AI Summary

> Based on your notes, Redux is a state management solution you're 
> using in your React application to handle complex data flow across 
> components. You note it uses unidirectional data flow (action → 
> reducer → store) and prefer it over prop drilling.
```

---

## Customization Examples

### Detailed Analysis
```
System: Analyze the user's understanding deeply based only on 
provided context.

User: Analyze my understanding of {{term}} based on:

{{context}}

Provide:
1. Summary of my understanding
2. Key points I've made
3. How I'm using it
```

### Learning Gaps
```
System: Identify what the user knows and what they might want to 
learn based only on their notes.

User: Based on my notes about {{term}}:

{{context}}

What do I understand? What questions remain?
```

### Project Focus
```
System: Focus on practical applications from the user's notes.

User: How am I using {{term}} in my projects?

{{context}}

Practical summary:
```

---

## Migration Checklist

- [ ] Backup current `data.json`
- [ ] Install new `main.js` and `data.json`
- [ ] Restart Obsidian
- [ ] Check "AI Prompts" section exists
- [ ] Verify `{{context}}` variable in prompts
- [ ] Test with a term you've mentioned multiple times
- [ ] Verify summary reflects YOUR notes, not generic info

---

## Troubleshooting

### "Summary is still generic"

**Check:**
1. Does prompt include `{{context}}` variable?
2. Is system prompt emphasizing "use provided context only"?
3. Are mentions showing in "Mentions" section?

**Fix:**
Update system prompt:
```
Base your response ONLY on the context provided. Do NOT use external 
knowledge. If context is insufficient, say "Not enough information 
in your notes."
```

### "No summary generated"

**Causes:**
- Term not mentioned in vault
- No context around wikilinks
- API not running

**Check:**
- Look at "Mentions" section - is it populated?
- If yes: API issue
- If no: Term not used in vault yet

### "Summary contradicts my notes"

**Problem:** AI adding external knowledge

**Fix:**
Strengthen system prompt:
```
You are STRICTLY limited to summarizing the provided context. 
Never add information from your training. If the context is unclear 
or contradictory, note that explicitly.
```

---

## Tips for Best Results

### 1. Write Around Your Links
```
❌ Bad: See [[Machine Learning]]
✅ Good: Using [[Machine Learning]] to predict customer churn with 
         94% accuracy
```

### 2. Use Descriptive Headings
```
## Project Implementation
[[Redux]] is handling our app state...

## Lessons Learned  
[[Redux]] DevTools made debugging easier...
```

### 3. Be Specific
```
❌ Vague: [[Python]] is good
✅ Specific: [[Python]] is our choice for data processing because 
             pandas handles our 10M row datasets efficiently
```

### 4. Regenerate as You Learn
- Delete generated note
- Run WikiVault again
- New summary includes recent learning

---

## What You Get

### Personal Knowledge Base
- Summaries match YOUR understanding
- Uses YOUR terminology
- Reflects YOUR usage

### Evolution Tracking
- Month 1: "I'm learning about X"
- Month 6: "I'm using X for Y with Z results"
- Year 1: Comprehensive personal reference

### Privacy
- 100% local processing (with LM Studio)
- No external data sent
- Your knowledge stays yours

---

## Next Steps

1. **Install the update** ✅
2. **Test with your notes** - Find a term you mention often
3. **Customize prompts** - Tune for your workflow
4. **Build your knowledge base** - Let it grow with you

Read **CONTEXT_AWARE_AI.md** for detailed examples and advanced usage!

---

**The shift:** From generic AI encyclopedia to YOUR personal knowledge synthesizer 🎯
