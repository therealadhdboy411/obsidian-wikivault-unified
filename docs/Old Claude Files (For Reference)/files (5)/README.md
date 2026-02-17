# WikiVault 2.0 - Enhanced Features

A powerful Obsidian plugin that automatically generates Wikipedia-like notes for missing Wikilinks with advanced features including batch processing, dictionary integration, plural detection, and more.

## 🆕 New Features in Version 2.0

### 1. **Batch Processing with Progress Tracking**
- Process multiple links in parallel for significantly faster performance
- Configurable batch size (1-20 links at a time)
- Real-time progress bar showing completion percentage
- **ETA calculation** - See estimated time remaining during processing
- Status bar updates with live progress

### 2. **Ribbon Icon**
- Quick access button in the left sidebar
- One-click generation of missing wiki notes
- Book icon for easy identification

### 3. **Dictionary API Integration**
- Automatically fetches dictionary definitions from free APIs
- Default: DictionaryAPI.dev (no API key required)
- Supports custom dictionary endpoints
- Displays word definitions with:
  - Part of speech
  - Definition
  - Example usage
- Gracefully handles technical terms not in dictionary

### 4. **Plural Detection & Handling**
- Automatically detects plural forms of terms
- Adds explanatory section: "About this term"
- Handles multiple plural patterns:
  - Regular plurals (s, es)
  - Y to IES transformations
  - Irregular plurals (children/child, mice/mouse, etc.)
- Links to singular form when detected

### 5. **Custom AI Prompts**
- Fully customizable AI prompt templates
- Use `{term}` placeholder for the link name
- Tailor AI responses to your specific needs
- Examples:
  - Academic style
  - Simple explanations
  - Technical definitions
  - Creative descriptions

### 6. **Enhanced Context Extraction**
- Improved surrounding context capture
- Shows lines before and after mentions
- Better nested bullet point handling
- Limits mentions to prevent overwhelming content (max 10)
- Regex-based detection for better accuracy
- Handles wikilink aliases properly

## 📖 How to Use

### Quick Start
1. Click the book icon in the left sidebar, or
2. Use Command Palette: "Generate missing Wikilink notes"

### Settings Configuration

#### AI Configuration
- **OpenAI Compatible Endpoint**: Your AI API endpoint
- **API Key**: Your API authentication key
- **Model Name**: Which model to use (e.g., gpt-3.5-turbo, mistral-small-latest)
- **Custom Prompt**: Customize how the AI generates summaries
  - Use `{term}` as placeholder for the link name
  - Example: "Explain {term} in simple terms for a beginner"

#### Dictionary Integration
- **Use Dictionary API**: Toggle dictionary lookups on/off
- **Dictionary API Endpoint**: URL for dictionary service
  - Default: `https://api.dictionaryapi.dev/api/v2/entries/en/`
  - Free and open-source, no API key needed

#### Storage & Organization
- **Use Custom Directory**: Save wiki notes to a specific folder
- **Directory Name**: Name of the wiki notes folder (default: "Vault Wiki")

#### Behavior & Triggers
- **Run on Startup**: Auto-generate notes when Obsidian starts
- **Run on File Change**: Auto-generate when switching files
- **Show Progress Notification**: Display progress popup
- **Handle Plurals**: Detect and explain plural terms

#### Performance
- **Batch Size**: How many links to process simultaneously (1-20)
  - Higher = faster but more API load
  - Recommended: 5-10 for most users
- **Similarity Threshold**: Fuzzy matching sensitivity (0.5-1.0)
  - Higher = stricter matching for "See also" links
  - Lower = more suggestions but less precise

## 🎯 Example Output

When you have an unresolved link like `[[quantum mechanics]]`, WikiVault will create:

```markdown
# quantum mechanics

> Quantum mechanics is a fundamental theory in physics that describes the behavior of matter and energy at atomic and subatomic scales, where classical physics no longer applies.

## Dictionary Definition

**noun**: The branch of mechanics that deals with the mathematical description of the motion and interaction of subatomic particles.

*Example: "The principles of quantum mechanics govern electron behavior in atoms."*

## About this term

This appears to be the plural form of "quantum mechanic".

## Mentions

From [[Physics Introduction]]:
> [[quantum mechanics]] revolutionized our understanding of the atomic world
> It introduced concepts like wave-particle duality and uncertainty

From [[Modern Science]]:
> The development of [[quantum mechanics]] in the early 20th century
> Led to numerous technological advances

```

## ⚙️ Technical Details

### Batch Processing Algorithm
- Divides links into configurable batches
- Processes each batch in parallel using `Promise.all()`
- Calculates ETA based on elapsed time and completion rate
- Updates progress every batch completion

### Dictionary API
Uses the free DictionaryAPI.dev by default:
- No API key required
- Open source and privacy-friendly
- Returns definitions, examples, and phonetics
- Fallback handling for missing terms

### Plural Detection
Handles multiple patterns:
- **Regular**: word → words
- **ES endings**: box → boxes
- **IES transformation**: city → cities
- **Irregular**: child → children, mouse → mice

### Context Extraction
- Scans all markdown files in vault
- Extracts surrounding lines for context
- Handles nested bullet points
- Preserves indentation and structure
- Limits to 10 mentions per term

## 🔧 Development

### Building from Source
```bash
npm install
npm run build
```

### File Structure
- `main.ts` - Main plugin source code
- `manifest.json` - Plugin metadata
- `data.json` - Default settings

## 🚀 Performance Tips

1. **Batch Size**: Start with 5, increase if stable
2. **Run on File Switch**: Disable for large vaults to reduce lag
3. **Dictionary API**: Disable if you don't need definitions (faster)
4. **Custom Directory**: Keeps generated notes organized

## 🐛 Troubleshooting

### Slow Performance
- Reduce batch size
- Disable "Run on File Switch"
- Use faster AI model

### API Errors
- Verify API key is correct
- Check endpoint URL format
- Ensure model name is valid

### Missing Definitions
- Dictionary API only works for common English words
- Technical terms may not have definitions (this is normal)
- AI summary will still be generated

## 📝 Changelog

### Version 2.0.0
- ✨ Added batch processing with parallel execution
- 📊 Added progress bar with ETA calculation
- 🎨 Added ribbon icon for quick access
- 📚 Added dictionary API integration
- 🔤 Added plural detection and handling
- ✏️ Added custom AI prompt support
- 🎯 Enhanced context extraction algorithm
- ⚡ Improved performance and reliability

### Version 1.0.0
- Initial release
- Basic wiki note generation
- AI summaries
- Context extraction

## 📄 License

MIT License - Feel free to modify and distribute

## 🤝 Contributing

Contributions welcome! Please feel free to submit issues or pull requests.

## 💡 Tips & Tricks

1. **Custom Prompts for Different Subjects**
   - Science: "Provide a technical explanation of {term} suitable for undergraduate students"
   - History: "Give a brief historical overview of {term} with key dates"
   - General: "Explain {term} in simple, everyday language"

2. **Organizing Your Wiki**
   - Use custom directory to keep wiki notes separate
   - Consider subdirectories for different topics
   - Use tags in generated notes for better organization

3. **Optimizing AI Usage**
   - Use cheaper/faster models for simple terms
   - Use advanced models for complex concepts
   - Batch process during off-peak times to reduce costs

## 🙏 Credits

- Dictionary API: [DictionaryAPI.dev](https://dictionaryapi.dev/)
- Inspired by Wikipedia's approach to knowledge organization
- Built for the Obsidian community

---

Made with ❤️ by Manus
