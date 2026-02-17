# WikiVault Unified

**WikiVault Unified** is a complete knowledge management system for Obsidian. It combines AI-powered note generation with advanced virtual linker technology to create a seamless, automated wiki experience within your vault.

This plugin is a collaborative effort, building upon the foundations of **Virtual Linker** with significant enhancements and logic provided by **Claude** and **Manus**.

## Core Features

### AI-Powered Knowledge Management
- **AI Note Generation**: Automatically generate comprehensive wiki notes based on your existing vault content.
- **Context Injection**:
  - **Your Notes**: AI synthesizes information from your own personal knowledge base.
  - **Dictionary Integration**: Automatically injects definitions into the AI context for better accuracy.
  - **Wikipedia Integration**: Fetches Wikipedia links and excerpts to ground AI responses in external facts.
  - **Custom Glossary**: Supports your own custom glossary files for specialized domain knowledge.
- **Priority Queue**: Intelligently processes frequently-mentioned terms first.
- **Model Tracking**: Automatically records which AI model and provider generated each note in the frontmatter.

### Smart Detection (Virtual Linker Integration)
- **Intelligent Matching**:
  - **Multi-word Matching**: Prioritizes specific terms (e.g., "Smooth Muscle" over "Smooth").
  - **Wikilink Detection**: Automatically handles existing `[[Term]]` links.
  - **Plain Text Detection**: Identifies potential wiki terms in your plain text automatically.
- **Linguistic Awareness**:
  - **Synonym Detection**: Handles abbreviations and synonyms (e.g., "ML" → "Machine Learning").
  - **Plural/Singular Handling**: Automatically manages variations of terms.
  - **Alias Support**: Recognizes aliases defined in file frontmatter.

### Organization & Performance
- **Smart Categorization**:
  - **Category Folders**: Organizes notes into logical subfolders (e.g., `Wiki/Anatomy and Physiology/`).
  - **Auto-Categorization**: Assigns categories based on source folders or tags.
- **File Filtering**: Excludes non-markdown files like images, PDFs, and media.
- **Efficiency**:
  - **Smart Caching**: Efficiently indexes your vault for fast performance.
  - **Auto-Refresh**: Automatically updates the term index when files are modified.
  - **Copilot Compatible**: Works seamlessly alongside Obsidian Copilot.

## Output Format
- **Exact Template Matching**: Generates notes that follow your preferred structure.
- **Standardized Tags**: Auto-generates tags with the `#` prefix.
- **Transparency**: Includes an AI disclaimer line for safety.
- **Key Concepts**: Extracts and highlights key terms from AI summaries.
- **Reference Links**: Clean Wikipedia formatting ("Read more on Wikipedia").
- **Preserved Context**: Maintains original formatting in mentions for better readability.

## Documentation

For detailed guides on specific features, please refer to the [docs](./docs) folder:
- [Unified Guide](./docs/UNIFIED_GUIDE.md) - Complete overview of the unified system.
- [LM Studio Support](./docs/LMSTUDIO_SUPPORT.md) - Running WikiVault with local models.
- [Virtual Linker Integration](./docs/VIRTUAL_LINKER_INTEGRATION.md) - Deep dive into smart detection.
- [Category System](./docs/UNIFIED_GUIDE.md#category-system) - How auto-categorization works.

## Installation

1. Download the latest release.
2. Extract the files into your vault's `.obsidian/plugins/wikivault-unified` folder.
3. Enable the plugin in Obsidian settings.

## Configuration

Access the settings tab to configure your AI provider (Mistral, OpenAI, LM Studio, etc.), set up your knowledge sources, and customize your organization preferences.

## Credits & Acknowledgments

Aside from the original **Virtual Linker** rendering engine, the core logic, feature set, and documentation of **WikiVault Unified** were developed by **Claude** and **Manus**.

---

---

## 🚀 Roadmap & Upcoming Features

### 🎯 Smart Processing & Control
- [ ] **Selective Processing**
    - [x] Process only unresolved links from the current file (not entire vault)
    - [x] Exclude patterns (e.g., skip dates, URLs, or specific prefixes like "MOC-")
    - [ ] Preview mode - show what will be created before generating
    - [x] Dry run - report what would be processed without creating files
- [ ] **Update Management**
    - [x] Incremental updates - only add new mentions, preserve existing content
    - [x] Track last update timestamp in frontmatter
    - [ ] "Preserve user edits" section that won't be overwritten
    - [ ] Skip regeneration if note was manually edited
    - [ ] Update only AI summary vs entire note

### 📝 Customization & Templates
- [ ] **Template System**
    - [x] Custom note templates with variables like {{title}}, {{summary}}, {{mentions}}
    - [ ] Different templates for different link types (people, concepts, places)
    - [ ] Template per folder or tag pattern
    - [ ] YAML frontmatter customization (auto-add tags, dates, status)
- [x] **Custom AI Prompts**
    - [x] Editable system prompt for summaries
    - [ ] Different prompts for different contexts (technical terms vs people vs places)
    - [ ] Multi-step prompts (summary → detailed explanation → examples)
    - [x] Prompt templates with variables

### 🔍 Enhanced Context & Content
- [x] **Better Context Extraction**
    - [x] Include full paragraphs, not just lines
    - [x] Capture heading hierarchy (show which section the mention is in)
    - [x] Extract surrounding context (±2 sentences)
    - [ ] Show block references if the mention is in a block
- [ ] **Content Enrichment**
    - [ ] Auto-generate tags based on AI analysis
    - [ ] Suggest related wikilinks based on content
    - [ ] Extract key quotes from mentions
    - [ ] Generate a "Related Concepts" section

### 🤖 Advanced AI Features
- [ ] **Multi-Model Support**
    - [ ] Query multiple models simultaneously and compare results
    - [x] Fallback chain (try LM Studio → Mistral → OpenAI)
    - [ ] A/B testing mode to compare model outputs
    - [ ] Consensus summary from multiple models
- [ ] **Smarter Summaries**
    - [ ] Detect entity type (person/place/concept) and adjust prompt
    - [ ] Include confidence score or uncertainty indicators
    - [ ] Add source citations for factual claims
    - [ ] Generate multiple summary lengths (short/medium/long)

### 📊 Analytics & Visualization
- [ ] **Statistics & Reporting**
    - [ ] Dashboard showing # of generated notes, most-mentioned terms
    - [ ] Link relationship graph
    - [ ] Track which AI model was used for each note
    - [ ] Processing history log
- [ ] **Quality Indicators**
    - [ ] Fuzzy match confidence score displayed in notes
    - [ ] Flag potentially incorrect AI summaries for review
    - [ ] Show how many mentions exist for each term

### ⚡ Performance & UX
- [ ] **Batch Processing Improvements**
    - [ ] Parallel AI requests (process multiple links simultaneously)
    - [ ] Queue system with priority (process frequently mentioned terms first)
    - [ ] Resume interrupted processing
    - [ ] Rate limiting configuration for API calls
- [ ] **User Interface**
    - [x] Command to process single link under cursor
    - [x] Right-click context menu on unresolved links
    - [ ] Status bar showing current processing status
    - [ ] Progress bar with ETA

### 🔧 Power User Features
- [ ] **Advanced Matching**
    - [ ] Synonym detection (link "ML" → note about "Machine Learning")
    - [ ] Abbreviation expansion
    - [ ] Handle plurals/variations automatically
    - [ ] Cross-reference with external knowledge base
- [ ] **Integration**
    - [ ] Export generated notes to Anki
    - [ ] Sync definitions with a glossary note
    - [ ] Integration with Dataview for queries
    - [ ] Webhook notifications when processing completes

---

*AI can make mistakes, always check information.*
