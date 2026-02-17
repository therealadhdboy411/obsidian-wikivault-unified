# WikiLink Generator for Obsidian

An Obsidian plugin that automatically generates Wikipedia-style notes for missing wikilinks in your vault. It extracts context from references, creates new notes with relevant excerpts, and optionally uses AI to generate summaries.

## Features

- 🔍 **Automatic Wikilink Detection**: Scans your entire vault to find `[[wikilinks]]` that don't have corresponding notes
- 📝 **Context Extraction**: Intelligently extracts context from where wikilinks are referenced:
  - For text: Captures the entire paragraph
  - For bullet points: Includes the bullet, its sub-bullets, and the parent bullet above
- 🤖 **AI-Powered Summaries**: Optional integration with OpenAI-compatible APIs to generate concise, Wikipedia-style definitions
- 🔗 **Similar Note Detection**: Detects spelling variations (e.g., "Example" vs "example") and adds "See also" links
- ⚡ **Flexible Generation**: Generate notes for the entire vault or just the current file

## Installation

### Manual Installation

1. Download the latest release from the [Releases page](https://github.com/yourusername/obsidian-wikilink-generator/releases)
2. Extract the files into your vault's plugins folder: `<vault>/.obsidian/plugins/wikilink-generator/`
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

### Building from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/obsidian-wikilink-generator.git
cd obsidian-wikilink-generator

# Install dependencies
npm install

# Build the plugin
npm run build

# Copy main.js, manifest.json, and styles.css to your vault's plugins folder
cp main.js manifest.json <vault>/.obsidian/plugins/wikilink-generator/
```

## Usage

### Quick Start

1. **Open Command Palette** (Ctrl/Cmd + P)
2. Search for "Generate missing WikiLink notes"
3. Press Enter

The plugin will scan your vault and create notes for all missing wikilinks!

### Commands

The plugin provides the following commands:

- **Generate missing WikiLink notes**: Scans the entire vault and generates notes for all missing wikilinks
- **Generate missing WikiLink notes from current file**: Only processes wikilinks in the currently open file

You can also click the link icon (🔗) in the ribbon to generate notes for the entire vault.

### Configuration

Navigate to **Settings → WikiLink Generator** to configure:

#### API Settings (Optional)

Configure these if you want AI-generated summaries:

- **API Endpoint**: OpenAI-compatible API endpoint (default: `https://api.openai.com/v1/chat/completions`)
- **API Key**: Your API key (supports OpenAI, Anthropic Claude via proxy, local LLMs, etc.)
- **Model**: Model name (e.g., `gpt-3.5-turbo`, `gpt-4`, `claude-3-sonnet`)
- **Temperature**: Controls AI creativity (0.0-2.0, default: 0.7)
- **Auto-generate summaries**: Toggle automatic AI summary generation

#### Other Settings

- **Similarity threshold**: Controls how similar note names need to be to trigger "See also" links (0.5-1.0, default: 0.9 = 90% similar)

## How It Works

### 1. Context Extraction

When the plugin finds a wikilink like `[[Machine Learning]]`, it extracts the surrounding context:

**For text paragraphs:**
```markdown
Machine learning has revolutionized many fields. [[Machine Learning]] is 
a subset of artificial intelligence that enables systems to learn from data. 
It has applications in healthcare, finance, and more.
```

The entire paragraph is captured as context.

**For bullet points:**
```markdown
- Artificial Intelligence
  - [[Machine Learning]]
    - Supervised Learning
    - Unsupervised Learning
```

The plugin captures:
- The parent bullet ("Artificial Intelligence")
- The current bullet ("Machine Learning")
- All sub-bullets ("Supervised Learning", "Unsupervised Learning")

### 2. Note Generation

The plugin creates a new note with:

1. **Title**: The wikilink name
2. **AI Summary** (optional): A Wikipedia-style definition
3. **References Section**: All contexts grouped by source file

Example generated note:

```markdown
# Machine Learning

Machine Learning is a subset of artificial intelligence that enables 
computer systems to learn and improve from experience without being 
explicitly programmed. It uses algorithms and statistical models to 
analyze patterns in data and make predictions or decisions.

---

## References

### From [[AI Overview]]

Machine learning has revolutionized many fields. [[Machine Learning]] is 
a subset of artificial intelligence that enables systems to learn from data. 
It has applications in healthcare, finance, and more.

### From [[Tech Notes]]

- Artificial Intelligence
  - [[Machine Learning]]
    - Supervised Learning
    - Unsupervised Learning
```

### 3. Similar Note Detection

If a note already exists with a similar name (based on the similarity threshold), a "See also" link is added at the top:

```markdown
> [!note] See also
> [[machine learning]]

# Machine Learning

...
```

## Using Custom AI Endpoints

The plugin works with any OpenAI-compatible API endpoint:

### OpenAI

```
Endpoint: https://api.openai.com/v1/chat/completions
Model: gpt-3.5-turbo or gpt-4
```

### Anthropic Claude (via proxy)

Use a proxy that converts OpenAI format to Anthropic format, or use services like:
- [OpenRouter](https://openrouter.ai/)
- [Portkey](https://portkey.ai/)

### Local LLMs

Use local inference servers like:
- [LM Studio](https://lmstudio.ai/)
- [Ollama](https://ollama.ai/) with OpenAI compatibility
- [text-generation-webui](https://github.com/oobabooga/text-generation-webui) with OpenAI extension

Example for LM Studio:
```
Endpoint: http://localhost:1234/v1/chat/completions
Model: (whatever model you're running)
```

## Tips & Best Practices

1. **Start Small**: Try running it on a single file first to see how it works
2. **Review Generated Notes**: The AI summaries are helpful but may need editing
3. **Adjust Similarity Threshold**: If you're getting too many "See also" links, increase the threshold
4. **Use Meaningful Wikilinks**: The AI generates better summaries when wikilinks have clear, descriptive names
5. **Organize Context**: The plugin works best when wikilinks are used in well-written paragraphs or organized bullet lists

## Examples

### Before
```markdown
# My Notes on AI

I've been learning about [[neural networks]] and how they work. 
[[Neural networks]] are inspired by biological neurons and use layers 
of interconnected nodes to process information. They're fundamental 
to [[deep learning]].

- Key concepts:
  - [[Backpropagation]]
  - [[Gradient Descent]]
    - [[Stochastic Gradient Descent]]
    - [[Mini-batch Gradient Descent]]
```

### After Running Plugin

The plugin creates 5 new notes:
- `neural networks.md` (with "See also: Neural Networks")
- `Neural networks.md`
- `deep learning.md`
- `Backpropagation.md`
- `Gradient Descent.md`
- `Stochastic Gradient Descent.md`
- `Mini-batch Gradient Descent.md`

Each contains context from your original note plus an AI-generated summary.

## Troubleshooting

### API Errors

- **401 Unauthorized**: Check your API key
- **429 Rate Limited**: You're making too many requests; wait and try again
- **Connection Failed**: Check your endpoint URL and internet connection

### No Notes Generated

- Ensure you have wikilinks in your vault: `[[like this]]`
- Check that the wikilinks don't already have corresponding notes
- Look at the console (Ctrl/Cmd + Shift + I) for error messages

### Similar Note Detection Not Working

- Adjust the similarity threshold in settings
- Note that detection is case-insensitive
- The algorithm uses Levenshtein distance for fuzzy matching

## Privacy & Data

- The plugin only sends data to the API you configure
- Context excerpts and wikilink names are sent to generate summaries
- No data is collected by the plugin itself
- To use without any external API calls, simply don't configure an API key

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

If you encounter issues or have suggestions:
- Open an issue on [GitHub](https://github.com/yourusername/obsidian-wikilink-generator/issues)
- Check existing issues for solutions
- Provide your Obsidian version and plugin version when reporting bugs

## Changelog

### 1.0.0
- Initial release
- Automatic wikilink detection and note generation
- Context extraction for text and bullets
- AI-powered summaries
- Similar note detection
- OpenAI-compatible API support

---

Made with ❤️ for the Obsidian community
