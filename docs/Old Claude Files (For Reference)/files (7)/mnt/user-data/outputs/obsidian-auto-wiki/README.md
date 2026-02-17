# Auto Wiki - Obsidian Plugin

Transform your Obsidian vault into a self-documenting wiki by automatically creating pages for missing wikilinks, complete with context, backlinks, and optional AI-generated summaries.

## Features

- 🔗 **Automatic Link Detection**: Scans your entire vault for `[[Wikilinks]]`
- 📝 **Context Extraction**: Captures the full context where links are mentioned
  - For text: Extracts the complete paragraph
  - For bullets: Includes parent bullet and all sub-bullets
- 🤖 **AI Summaries**: Optional AI-powered summaries using any OpenAI-compatible API
- 🔍 **Fuzzy Matching**: Detects similar note names (e.g., "Example" vs "example") and creates "See" references
- 📚 **Backlinks**: Automatically creates references to source notes
- ⚙️ **Configurable**: Customize AI endpoint, model, and similarity threshold

## Installation

### Manual Installation

1. Download the latest release from the [Releases](https://github.com/yourusername/obsidian-auto-wiki/releases) page
2. Extract the files into your vault's `.obsidian/plugins/auto-wiki/` directory
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

### Building from Source

1. Clone this repository into your vault's `.obsidian/plugins/` directory:
   ```bash
   cd /path/to/your/vault/.obsidian/plugins/
   git clone https://github.com/yourusername/obsidian-auto-wiki.git auto-wiki
   cd auto-wiki
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

4. Reload Obsidian and enable the plugin

## Usage

### Basic Usage

1. Click the chain link icon in the ribbon, or use the command palette: `Process vault and generate wiki pages`
2. The plugin will:
   - Scan all notes for `[[Wikilinks]]`
   - Identify missing notes
   - Create new notes with context and backlinks
   - Detect similar existing notes and add "See" references

### Example Output

If you have a note with:

```markdown
The concept of [[Zettelkasten]] is a method for personal knowledge management.

- Research methods
  - [[Zettelkasten]] helps organize thoughts
    - Use atomic notes
    - Link ideas together
```

The plugin will create a new note `Zettelkasten.md`:

```markdown
# Zettelkasten

## Summary

Zettelkasten is a personal knowledge management method that helps organize thoughts through atomic notes and interconnected ideas.

## References

From [[Your Original Note]]:

> The concept of [[Zettelkasten]] is a method for personal knowledge management.

From [[Your Original Note]]:

> - Research methods
>   - [[Zettelkasten]] helps organize thoughts
>     - Use atomic notes
>     - Link ideas together
```

### Fuzzy Matching Example

If you have notes about "Machine Learning" and create a link to "[[machine learning]]" (different capitalization), the plugin will detect the similarity and create:

```markdown
# machine learning

> **See:** [[Machine Learning]]

## References

From [[Some Note]]:

> Context where machine learning was mentioned...
```

## Configuration

### Settings

Access settings via Settings → Auto Wiki

- **Enable AI summaries**: Toggle AI-powered summary generation
- **AI endpoint**: URL for your OpenAI-compatible API (default: OpenAI)
  - OpenAI: `https://api.openai.com/v1/chat/completions`
  - LocalAI: `http://localhost:8080/v1/chat/completions`
  - LM Studio: `http://localhost:1234/v1/chat/completions`
  - Ollama (with compatibility): `http://localhost:11434/v1/chat/completions`
- **API key**: Your API key for the AI service
- **AI model**: Model name (e.g., `gpt-3.5-turbo`, `gpt-4`, `llama2`)
- **Similarity threshold**: How similar note names must be to trigger a "See" reference (0.7-1.0, default: 0.9)

### Using Different AI Providers

#### OpenAI
```
Endpoint: https://api.openai.com/v1/chat/completions
Model: gpt-3.5-turbo or gpt-4
API Key: Your OpenAI API key
```

#### Local LLM (LM Studio)
```
Endpoint: http://localhost:1234/v1/chat/completions
Model: The name of your loaded model
API Key: (leave blank or use 'lm-studio')
```

#### Ollama (requires OpenAI compatibility mode)
```bash
# Run Ollama with OpenAI compatible endpoint
OLLAMA_ORIGINS=* ollama serve
```
```
Endpoint: http://localhost:11434/v1/chat/completions
Model: llama2, mistral, etc.
API Key: ollama
```

#### Claude (via Anthropic API)
Note: You'll need to use a proxy that converts OpenAI format to Anthropic format, or modify the code to support Anthropic's native format.

## How It Works

### 1. Wikilink Detection
The plugin uses regex to find all `[[wikilinks]]` in your vault, including aliased links like `[[Link|Display Text]]`.

### 2. Context Extraction

**For paragraphs:**
- Extracts the entire paragraph containing the wikilink
- Preserves formatting and structure

**For bullet points:**
- Captures the current bullet point
- Includes the parent bullet (if it exists)
- Includes all sub-bullets
- Maintains hierarchy and indentation

### 3. Fuzzy Matching

The plugin uses Levenshtein distance to calculate similarity between note names:
- Compares normalized (lowercase) versions
- Default threshold: 90% similarity
- Creates "See" references instead of duplicate pages

### 4. AI Summary Generation

When enabled:
- Collects all contexts where the term is mentioned
- Sends to the configured AI endpoint
- Generates a 2-3 sentence definition
- Adds summary at the top of the new note

## Commands

- **Process vault and generate wiki pages**: Manually trigger the vault scan and page generation

## Tips

- **Review Before Processing**: The plugin creates new files in your vault, so review your wikilinks first
- **Adjust Similarity Threshold**: Lower threshold = more aggressive fuzzy matching
- **Use Folders**: Place generated wiki pages in a dedicated folder by prefixing wikilinks like `[[Wiki/Term]]`
- **AI Costs**: Be mindful of API costs when enabling AI summaries for large vaults
- **Local Models**: Consider using local LLMs (LM Studio, Ollama) for privacy and cost savings

## Roadmap

- [ ] Batch processing with progress indicator
- [ ] Folder organization for generated pages
- [ ] Custom templates for generated pages
- [ ] Exclude specific tags or folders from processing
- [ ] Incremental updates (only process new/changed notes)
- [ ] Interactive preview before creating pages
- [ ] Support for embedded links `![[link]]`
- [ ] Multi-language support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you find this plugin useful, consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs via [Issues](https://github.com/yourusername/obsidian-auto-wiki/issues)
- 💡 Suggesting features
- ☕ Buying me a coffee

## License

MIT License - see [LICENSE](LICENSE) for details

## Acknowledgments

- Inspired by Wikipedia's auto-generated disambiguation pages
- Built for the Obsidian community
- Thanks to all contributors and users

## Changelog

### 1.0.0 (Initial Release)
- ✨ Automatic wikilink detection and page generation
- 📝 Context extraction for paragraphs and bullet points
- 🔍 Fuzzy matching for similar note names
- 🤖 AI-powered summary generation
- ⚙️ Configurable settings for AI providers
- 📚 Automatic backlinks to source notes
