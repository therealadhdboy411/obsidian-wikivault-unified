# WikiVault Enhanced - Installation & Upgrade Guide

## 🎯 Quick Summary

This update adds 7 major features to WikiVault:

1. **⚡ Batch Processing** - 3x faster with parallel requests
2. **📊 Progress + ETA** - See real-time progress and time remaining
3. **🎯 Ribbon Icon** - Quick access from sidebar
4. **🔤 Plural Handling** - Auto-detect plurals/singulars
5. **📚 Dictionary API** - Free definitions before AI summaries
6. **✏️ Custom Prompts** - Full control over AI responses
7. **🔍 Better Context** - Full paragraphs + heading hierarchy

---

## 📥 Installation Steps

### 1. Backup (Recommended)

```
.obsidian/plugins/obsidian-wikivault/
├── main.js (backup this)
└── data.json (backup this)
```

### 2. Install Files

Replace in `.obsidian/plugins/obsidian-wikivault/`:
- ✅ `main.js` (new enhanced version)
- ✅ `data.json` (updated with new settings)

### 3. Restart

- **Option A:** Restart Obsidian completely
- **Option B:** Settings → Community Plugins → WikiVault → Toggle off → Toggle on

### 4. Verify

Check Settings → WikiVault:
- Should see new sections: "AI Prompts", "Dictionary Integration", "Context Extraction", "Performance & Processing"
- Ribbon icon should appear in left sidebar (book icon)

---

## ⚙️ Initial Configuration

### Recommended Settings for LM Studio

```json
{
  "provider": "lmstudio-openai",
  "batchSize": 3,
  "useDictionaryAPI": true,
  "includeFullParagraphs": true,
  "includeHeadingContext": true,
  "showProgressNotification": true
}
```

**Steps:**
1. Settings → WikiVault
2. Provider → "LM Studio (OpenAI Compatible)"
3. Batch Size → 3 (for balanced speed)
4. Enable "Use Dictionary API"
5. Enable "Include Full Paragraphs"
6. Enable "Include Heading Context"
7. Optionally enable "Show Progress Notification"

### Customize AI Prompts (Optional)

**System Prompt Ideas:**

For students:
```
You are a teacher explaining concepts clearly and simply for students.
```

For researchers:
```
You are an academic providing scholarly definitions with proper context.
```

For developers:
```
You are a technical expert providing precise, implementation-focused definitions.
```

**User Prompt Template:**

Default:
```
Provide a one-paragraph summary/definition for the term: "{{term}}"
```

More detailed:
```
Define {{term}}, explain its key characteristics, and provide 1-2 real-world examples.
```

Simpler:
```
What is {{term}}? Explain in 2-3 simple sentences.
```

---

## 🚀 First Run

### Testing the Update

1. **Find an unresolved link** in your vault
   - Or create one: `[[Test Term]]`

2. **Click the ribbon icon** (book icon in left sidebar)
   - Or use command: "Generate missing Wikilink notes"

3. **Watch the progress**
   - Status bar shows: "WikiVault: 1/1 - ETA: 3s"
   - Notification appears (if enabled)

4. **Check the generated note**
   - Should be in "Vault Wiki" folder
   - Should have:
     - Dictionary definition (if available)
     - AI summary
     - Plural/singular note (if applicable)
     - Heading context in mentions
     - Full paragraphs

### Example Output

```markdown
# Machine Learning

## Dictionary Definition

**machine learning** _/məˈʃiːn ˈlɜːrnɪŋ/_

_noun_
1. The use and development of computer systems that can learn

## AI Summary

> Machine learning is a branch of artificial intelligence focused
> on building systems that learn from data...

## Mentions

### From [[AI Projects]] → Deep Learning → Applications

> We're using [[Machine Learning]] to analyze customer behavior
> patterns. The model has achieved 94% accuracy in predicting
> purchase intent based on browsing history.
```

---

## 🔧 Troubleshooting

### Installation Issues

**Problem:** Plugin doesn't show new settings

**Solution:**
1. Completely close Obsidian
2. Delete `.obsidian/plugins/obsidian-wikivault/data.json`
3. Restart Obsidian
4. Plugin will recreate with defaults

---

**Problem:** Ribbon icon doesn't appear

**Solution:**
1. Settings → Appearance → Disable and re-enable "Show ribbon"
2. Reload plugin
3. Check left sidebar near top

---

**Problem:** "Module not found" error

**Solution:**
- Ensure `main.js` was replaced correctly
- File should be ~25KB in size
- Restart Obsidian completely

---

### Runtime Issues

**Problem:** Dictionary API not working

**Solution:**
1. Check internet connection
2. Test URL manually: `https://api.dictionaryapi.dev/api/v2/entries/en/test`
3. Disable "Use Dictionary API" if you don't need it

---

**Problem:** Slow processing

**Solution:**
1. Reduce batch size to 1-2
2. Check LM Studio response time
3. Try smaller model in LM Studio
4. Disable dictionary API for speed

---

**Problem:** ETA shows very long time

**Solution:**
- ETA stabilizes after first few items
- Check API is responding quickly
- Large first batch can skew estimate

---

**Problem:** Plural detection incorrect

**Solution:**
- Most common words work automatically
- For technical terms, manually link singular/plural
- Report patterns that don't work for future updates

---

## 📊 Performance Comparison

### Before Update
- Processing: 1 link at a time (sequential)
- No progress feedback
- Basic context (single lines)
- AI summary only
- No dictionary definitions

**Example:** 50 links × 2 seconds = 100 seconds total

### After Update
- Processing: 3 links at a time (parallel)
- Live progress + ETA
- Rich context (paragraphs + headings)
- AI summary + dictionary
- Plural handling

**Example:** 17 batches × 2 seconds = 34 seconds total ⚡

**Speed improvement:** ~3x faster

---

## 🎛️ Configuration Profiles

### Speed Optimized
```
Batch Size: 10
Dictionary API: Disabled
Progress Notification: Disabled
Full Paragraphs: Disabled
```
**Best for:** Large vaults, bulk processing

### Quality Optimized
```
Batch Size: 1
Dictionary API: Enabled
Full Paragraphs: Enabled
Heading Context: Enabled
Custom detailed prompts
```
**Best for:** Important notes, research

### Balanced (Default)
```
Batch Size: 3
Dictionary API: Enabled
Full Paragraphs: Enabled
Heading Context: Enabled
Default prompts
```
**Best for:** Most users

---

## 🔄 Migrating from Previous Version

### Your Settings Are Preserved

The update automatically keeps:
- API endpoint
- API key
- Model name
- Similarity threshold
- Custom directory settings
- Run on startup/file switch

### New Settings Get Defaults

These new settings use safe defaults:
- Batch size: 3
- Dictionary API: Enabled
- Custom prompts: Wikipedia-style
- Context: Full paragraphs + headings

### Manual Migration (If Needed)

If your `data.json` has custom modifications:

1. **Backup your current `data.json`**

2. **Install new `data.json`**

3. **Copy your custom values** from backup to new file:
   - `openaiEndpoint`
   - `openaiApiKey`
   - `modelName`
   - `customDirectoryName`
   - etc.

4. **Keep new settings** as-is

---

## 📚 Further Reading

- **FEATURES_DOCUMENTATION.md** - Detailed feature explanations
- **Obsidian Community Plugins** - Plugin marketplace
- **LM Studio Docs** - API reference

---

## ✅ Checklist

Installation complete when:
- [ ] Files replaced in plugin folder
- [ ] Obsidian restarted
- [ ] New settings visible in plugin settings
- [ ] Ribbon icon appears in left sidebar
- [ ] Test generation creates notes with new format
- [ ] Dictionary definitions appear (if enabled)
- [ ] Progress shows in status bar
- [ ] ETA calculates correctly

---

## 🎉 You're All Set!

Your WikiVault is now supercharged with:
- ⚡ Parallel processing
- 📊 Progress tracking
- 📚 Dictionary integration
- ✏️ Custom AI prompts
- 🔍 Better context extraction
- 🔤 Smart plural handling

Click the book icon in the ribbon or use the command palette to start generating amazing wiki notes!

---

**Questions?** Check FEATURES_DOCUMENTATION.md for detailed guides on each feature.
