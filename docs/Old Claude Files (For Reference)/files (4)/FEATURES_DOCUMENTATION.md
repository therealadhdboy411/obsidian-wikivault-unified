# WikiVault Enhanced - Feature Update

## 🎉 New Features Overview

This update adds **7 major features** to WikiVault, transforming it into a powerful knowledge management tool:

1. **⚡ Batch Processing** - Process multiple links in parallel for 3x+ faster generation
2. **📊 Progress Tracking with ETA** - Real-time progress bar with estimated completion time
3. **🎯 Ribbon Menu Icon** - Quick access from left sidebar
4. **🔤 Plural Handling** - Automatic detection and linking of plural/singular forms
5. **📚 Dictionary API Integration** - Free dictionary definitions before AI summaries
6. **✏️ Custom AI Prompts** - Fully customizable system and user prompts
7. **🔍 Enhanced Context** - Full paragraphs and heading hierarchy in mentions

---

## Feature Details

### 1. ⚡ Batch Processing

Process multiple wikilinks simultaneously instead of one at a time.

**Benefits:**
- 3-5x faster processing for large vaults
- Configurable batch size (1-10 links at once)
- Parallel API requests reduce total wait time

**Settings:**
- `Batch Size` slider: Choose how many links to process simultaneously
- Default: 3 (good balance of speed and API load)
- Higher values = faster but more API calls at once

**Example:**
- Old: 30 links × 2 seconds each = 60 seconds total
- New (batch size 3): 10 batches × 2 seconds = ~20 seconds total

---

### 2. 📊 Progress Tracking with ETA

Real-time progress updates with estimated time remaining.

**Features:**
- Live progress counter in status bar
- Persistent notification (if enabled)
- Dynamic ETA calculation based on actual processing speed
- Format: "WikiVault: 15/47 - ETA: 2m 34s"

**What You'll See:**
```
Status Bar: WikiVault: 23/100 - ETA: 1m 15s
Notification: WikiVault: Processing 23/100 links... - ETA: 1m 15s
```

**Settings:**
- `Show Progress Notification` toggle to show/hide notification
- Status bar always shows progress regardless

---

### 3. 🎯 Ribbon Menu Icon

Quick access button in the left sidebar.

**Location:** Left sidebar ribbon (near file explorer)
**Icon:** Book icon (📖)
**Action:** Click to generate missing wiki notes instantly

**No more:**
- Opening command palette
- Typing command name
- Searching for the plugin

**Just click and go!**

---

### 4. 🔤 Plural Handling

Automatic detection and cross-referencing of plural/singular forms.

**How It Works:**
When you create a link like `[[Algorithms]]`, WikiVault:
1. Detects it's likely plural
2. Checks if `[[Algorithm]]` exists
3. Adds a note at the top:

```markdown
> **Note:** This appears to be the plural form of [[Algorithm]]. 
> The definition below may refer to the singular form.
```

**Supported Patterns:**
- Regular plurals: cat/cats, dog/dogs
- -ies endings: story/stories, city/cities
- -ves endings: knife/knives, shelf/shelves
- Irregular: child/children, person/people, mouse/mice

**Vice Versa:**
If `[[Algorithm]]` exists and you create `[[Algorithms]]`:
```markdown
> **Note:** The plural form of this term is [[Algorithms]].
```

---

### 5. 📚 Dictionary API Integration

Free dictionary definitions from dictionaryapi.dev before AI summaries.

**Structure:**
```markdown
# Machine Learning

## Dictionary Definition

**machine learning** _/məˈʃiːn ˈlɜːrnɪŋ/_

_noun_
1. The use and development of computer systems able to learn and adapt
   - _"machine learning is transforming industries"_

## AI Summary

> Machine learning is a branch of artificial intelligence...

## Mentions
...
```

**Features:**
- Free, no API key required
- Includes pronunciation (phonetics)
- Multiple definitions per word
- Example sentences
- Part of speech labels

**Settings:**
- `Use Dictionary API` toggle: Enable/disable dictionary lookups
- `Dictionary API Endpoint`: Customize the API (default: dictionaryapi.dev)

**Fallback:** If dictionary API fails, only AI summary is shown (graceful degradation)

---

### 6. ✏️ Custom AI Prompts

Complete control over AI responses with template system.

**Two Customizable Fields:**

**System Prompt** (sets AI behavior):
```
Default: "You are a helpful assistant that provides concise, 
Wikipedia-style definitions for terms."

Examples:
- "You are a technical expert providing detailed explanations"
- "You are a teacher explaining concepts simply for students"
- "You are a researcher providing academic definitions"
```

**User Prompt Template** (query structure):
```
Default: 'Provide a one-paragraph summary/definition for the term: "{{term}}"'

Examples:
- "What is {{term}}? Explain in 2-3 sentences."
- "Define {{term}} technically with examples"
- "{{term}} - provide origin, definition, and usage"
```

**Variable:**
- `{{term}}` - Automatically replaced with the link name

**Use Cases:**
- **Students:** "Explain {{term}} simply like I'm 12 years old"
- **Researchers:** "Academic definition of {{term}} with citations"
- **Developers:** "Technical explanation of {{term}} with code examples"
- **Writers:** "Creative description of {{term}} for fiction writing"

---

### 7. 🔍 Enhanced Context Extraction

Richer, more useful context from your vault.

**Two Major Improvements:**

#### A. Heading Hierarchy

Shows which section contains each mention:

**Before:**
```markdown
### From [[My Project Notes]]

> This line mentions [[API Design]]
```

**After:**
```markdown
### From [[My Project Notes]] → Architecture → Backend Services

> This line mentions [[API Design]]
```

**Benefits:**
- Know the topic context instantly
- Navigate to specific sections faster
- Understand relationships better

---

#### B. Full Paragraph Extraction

Extract complete paragraphs instead of isolated lines.

**Before:**
```markdown
> This sentence mentions [[Machine Learning]].
```

**After:**
```markdown
> Machine learning has revolutionized data science. 
> Modern [[Machine Learning]] algorithms can process 
> vast datasets and identify patterns humans might miss.
> This has applications in healthcare, finance, and more.
```

**Settings:**
- `Include Heading Context` toggle: Show/hide headings
- `Include Full Paragraphs` toggle: Extract full paragraphs vs lines
- `Context Lines Around` slider (if paragraphs disabled): How many lines ±

**Default:** Full paragraphs + heading context for maximum usefulness

---

## Settings Guide

### AI Provider Section
| Setting | Description | Default |
|---------|-------------|---------|
| Provider | Choose AI service | LM Studio (OpenAI Compatible) |
| API Endpoint | API URL | http://localhost:1234/v1 |
| API Key | Authentication | (empty for LM Studio) |
| Model Name | Specific model | (empty = use loaded model) |

### AI Prompts Section
| Setting | Description | Default |
|---------|-------------|---------|
| System Prompt | AI behavior instructions | Wikipedia-style definitions |
| User Prompt Template | Query format with {{term}} | One-paragraph summary |

### Dictionary Integration Section
| Setting | Description | Default |
|---------|-------------|---------|
| Use Dictionary API | Enable dictionary lookups | ✅ Enabled |
| Dictionary API Endpoint | API URL | dictionaryapi.dev |

### Context Extraction Section
| Setting | Description | Default |
|---------|-------------|---------|
| Include Heading Context | Show section headings | ✅ Enabled |
| Include Full Paragraphs | Extract full paragraphs | ✅ Enabled |
| Context Lines Around | Lines ± (if paragraphs off) | 2 |

### Performance & Processing Section
| Setting | Description | Default |
|---------|-------------|---------|
| Batch Size | Parallel processing count | 3 |
| Show Progress Notification | Display progress popup | ❌ Disabled |

---

## Example Generated Note

Here's what a fully-featured generated note looks like:

```markdown
# Algorithms

> **Note:** The plural form of this term is [[Algorithm]].

## Dictionary Definition

**algorithm** _/ˈælɡəˌrɪðəm/_

_noun_
1. A process or set of rules to be followed in calculations
   - _"a basic algorithm for division"_
2. A step-by-step procedure for solving a problem
   - _"search algorithms are essential for databases"_

## AI Summary

> An algorithm is a finite sequence of well-defined instructions used 
> to solve a class of problems or perform a computation. Algorithms are 
> fundamental to computer science and are used in everything from 
> sorting data to complex machine learning models.

## See Also

[[Algorithm Design]]

## Mentions

### From [[Computer Science Notes]] → Data Structures → Sorting

> When comparing sorting [[Algorithms]], we need to consider 
> time complexity, space complexity, and stability. Quick sort 
> and merge sort are both O(n log n) but have different trade-offs 
> in terms of memory usage and worst-case scenarios.

### From [[Project Documentation]] → Performance Optimization

> We implemented several [[Algorithms]] to improve query speed, 
> including binary search for lookups and a custom caching strategy. 
> These optimizations reduced average response time by 60%.
```

---

## Installation

1. **Backup your current plugin** (recommended)
2. **Replace files** in `.obsidian/plugins/obsidian-wikivault/`:
   - `main.js`
   - `data.json`
3. **Restart Obsidian** or reload the plugin
4. **Configure settings** to your preference

---

## Quick Start

### For LM Studio Users

1. **Start LM Studio:**
   - Load any model
   - Start local server (port 1234)

2. **Configure WikiVault:**
   - Provider: "LM Studio (OpenAI Compatible)"
   - Enable "Use Dictionary API"
   - Set "Batch Size" to 3-5
   - Enable "Include Full Paragraphs"
   - Customize prompts if desired

3. **Generate:**
   - Click book icon in ribbon, OR
   - Command palette → "Generate missing Wikilink notes"

### Performance Tips

**Faster Processing:**
- Increase batch size (5-10) for faster completion
- Disable dictionary API if you only want AI summaries
- Disable progress notification for minimal UI

**Better Quality:**
- Enable full paragraphs for richer context
- Enable heading context to show structure
- Customize prompts for your specific use case
- Lower batch size (1-2) to reduce API errors

**Balanced (Recommended):**
- Batch size: 3
- Dictionary API: Enabled
- Full paragraphs: Enabled
- Heading context: Enabled

---

## Troubleshooting

### Slow Processing
- **Check batch size**: Higher = faster
- **Check API response time**: LM Studio should respond in <2 seconds
- **Check model**: Smaller models = faster responses

### Dictionary API Fails
- **Normal for technical terms**: Many specialized terms aren't in dictionaries
- **Check internet connection**: API requires network access
- **Try singular form**: "algorithms" → "algorithm"

### ETA Inaccurate
- **First few items**: ETA stabilizes after processing 3-5 items
- **Variable API speed**: ETA adjusts based on actual performance
- **Mixed content**: Some terms take longer than others

### Plural Detection Issues
- **Irregular words**: Add to `IRREGULAR_PLURALS` in code
- **Technical terms**: May not follow standard rules
- **Acronyms**: Usually not pluralized correctly (add manually)

---

## What's Changed

### Added Files
- Enhanced `main.js` with all new features
- Updated `data.json` with new settings defaults

### New Settings
- `batchSize`: 3
- `useDictionaryAPI`: true
- `dictionaryAPIEndpoint`: "https://api.dictionaryapi.dev/api/v2/entries/en"
- `systemPrompt`: "You are a helpful assistant..."
- `userPromptTemplate`: 'Provide a one-paragraph summary...'
- `includeHeadingContext`: true
- `includeFullParagraphs`: true
- `contextLinesAround`: 2

### Code Improvements
- Parallel batch processing with `Promise.all()`
- Real-time ETA calculation
- Pluralization detection functions
- Dictionary API integration
- Template string replacement for prompts
- Paragraph extraction algorithm
- Heading context finder

---

## Future Roadmap Ideas

Based on your initial feature wishlist, here are ideas we could add next:

- ✅ Batch requests - **DONE**
- ✅ Progress bar with ETA - **DONE**
- ✅ Ribbon icon - **DONE**
- ✅ Plural handling - **DONE**
- ✅ Dictionary API - **DONE**
- ✅ Custom prompts - **DONE**
- ✅ Context improvements - **DONE**

Potential future additions:
- Template system for note structure
- Incremental updates (preserve user edits)
- Process current file only
- Tag generation from AI analysis
- Multi-model support with fallbacks
- Statistics dashboard

---

## Support

**Need help?**
1. Check Obsidian console for errors (Ctrl+Shift+I / Cmd+Option+I)
2. Verify LM Studio is running and responding
3. Test with small batch size (1-2) first
4. Check dictionary API is reachable

**Found a bug?**
- Note the error message
- Check which feature caused it
- Try disabling features one by one to isolate

Enjoy your enhanced WikiVault! 🚀
