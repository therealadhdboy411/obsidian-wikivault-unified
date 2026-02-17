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

*AI can make mistakes, always check information.*
