# WikiVault 2.0 - Installation Guide

## Quick Install

### Option 1: Manual Installation (Recommended for Development)

1. **Download the plugin files:**
   - `main.js` (compiled plugin)
   - `manifest.json` (plugin metadata)
   - `data.json` (default settings)

2. **Locate your Obsidian vault:**
   - Open Obsidian
   - Go to Settings → About → Show vault folder
   - Navigate to `.obsidian/plugins/` directory

3. **Create plugin folder:**
   ```
   .obsidian/plugins/obsidian-wikivault/
   ```

4. **Copy files:**
   - Copy `main.js`, `manifest.json`, and `data.json` into the folder

5. **Enable the plugin:**
   - Open Obsidian Settings
   - Go to Community Plugins
   - Find "WikiVault" and enable it

### Option 2: From Source (For Developers)

1. **Clone or download the source:**
   ```bash
   cd /path/to/vault/.obsidian/plugins/
   mkdir obsidian-wikivault
   cd obsidian-wikivault
   ```

2. **Copy the source files:**
   - `main.ts` (TypeScript source)
   - `package.json`
   - `tsconfig.json`
   - `esbuild.config.mjs`
   - `manifest.json`

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Build the plugin:**
   ```bash
   npm run build
   ```

5. **Enable in Obsidian:**
   - Restart Obsidian
   - Enable WikiVault in Community Plugins

## Initial Configuration

### 1. AI Configuration

You'll need an AI API to generate summaries. WikiVault supports any OpenAI-compatible API:

#### OpenAI
- Endpoint: `https://api.openai.com/v1`
- Get API key from: https://platform.openai.com/api-keys
- Model: `gpt-3.5-turbo` or `gpt-4`

#### Mistral AI
- Endpoint: `https://api.mistral.ai/v1`
- Get API key from: https://console.mistral.ai/
- Model: `mistral-small-latest` or `mistral-medium-latest`

#### Anthropic Claude (via OpenRouter)
- Endpoint: `https://openrouter.ai/api/v1`
- Get API key from: https://openrouter.ai/keys
- Model: `anthropic/claude-3-sonnet`

#### Local LLMs (Ollama, LM Studio, etc.)
- Endpoint: `http://localhost:11434/v1` (for Ollama)
- No API key needed
- Model: Your local model name

### 2. Dictionary API (Optional)

The default dictionary API is **free and requires no configuration**:
- Endpoint: `https://api.dictionaryapi.dev/api/v2/entries/en/`
- No API key needed
- Works out of the box

### 3. Configure Settings

Open WikiVault settings in Obsidian:

1. **AI Configuration:**
   - Enter your API endpoint
   - Enter your API key
   - Enter your model name

2. **Dictionary Integration:**
   - Toggle "Use Dictionary API" (enabled by default)
   - Dictionary endpoint is pre-configured

3. **Storage & Organization:**
   - Enable "Use Custom Directory" (recommended)
   - Set directory name (default: "Vault Wiki")

4. **Behavior & Triggers:**
   - Choose when to auto-run:
     - On startup (useful for keeping wiki updated)
     - On file switch (real-time updates)
   - Enable progress notifications

5. **Performance:**
   - Set batch size (5 recommended)
   - Adjust similarity threshold (0.7 recommended)

## First Run

### Test the Plugin

1. Create a test note with unresolved wikilinks:
   ```markdown
   # Test Note
   
   I want to learn about [[quantum mechanics]] and [[photosynthesis]].
   ```

2. Run WikiVault:
   - Click the book icon in left sidebar, OR
   - Open Command Palette (Cmd/Ctrl + P)
   - Search for "WikiVault: Generate missing Wikilink notes"

3. Check results:
   - Navigate to your "Vault Wiki" folder
   - Open generated notes
   - Verify AI summaries and dictionary definitions

## Verification Checklist

- [ ] Plugin appears in Community Plugins list
- [ ] Book icon visible in left sidebar
- [ ] Settings page accessible
- [ ] API key configured correctly
- [ ] Test wiki note generated successfully
- [ ] Dictionary definitions appearing (for common words)
- [ ] AI summaries generating properly
- [ ] Progress notifications working

## Troubleshooting

### Plugin doesn't appear in list
- Ensure files are in correct directory: `.obsidian/plugins/obsidian-wikivault/`
- Verify `manifest.json` is present
- Restart Obsidian

### No API key setting
- Check that `main.js` file is present
- Ensure plugin is enabled in Community Plugins
- Try reloading plugin (toggle off/on)

### API errors
- Verify API key is correct (no extra spaces)
- Check endpoint URL format (must include https://)
- Ensure model name matches your API provider
- Check API quota/billing

### Dictionary not working
- Dictionary API only works for common English words
- Technical/specialized terms may not have definitions
- This is normal - AI summary will still generate

### Slow performance
- Reduce batch size to 1-3
- Disable "Run on File Switch"
- Use faster/cheaper AI model

### Progress bar not showing
- Enable "Show Progress Notification" in settings
- Check that you have unresolved links to process

## Recommended Setup

For best experience:

```json
{
  "openaiEndpoint": "https://api.openai.com/v1",
  "openaiApiKey": "your-key-here",
  "modelName": "gpt-3.5-turbo",
  "batchSize": 5,
  "similarityThreshold": 0.7,
  "useDictionaryAPI": true,
  "handlePlurals": true,
  "useCustomDirectory": true,
  "customDirectoryName": "Vault Wiki",
  "showProgressNotification": true,
  "runOnStartup": false,
  "runOnFileSwitch": false
}
```

## Updating the Plugin

### From 1.x to 2.x

1. Backup your settings (optional):
   - Copy `.obsidian/plugins/obsidian-wikivault/data.json`

2. Replace files:
   - Download new `main.js` and `manifest.json`
   - Replace old files

3. Restart Obsidian

4. Verify settings:
   - New options will use defaults
   - Your existing settings are preserved

## Advanced Configuration

### Custom AI Prompts

Customize how WikiVault generates summaries:

**Academic Style:**
```
You are a scholarly assistant. Provide a formal, academic definition of "{term}" suitable for research purposes, including key concepts and theoretical frameworks.
```

**Simple Explanations:**
```
Explain "{term}" in simple, everyday language that a 10-year-old could understand. Use analogies and examples.
```

**Technical Focus:**
```
Provide a precise technical definition of "{term}" with implementation details, common use cases, and best practices.
```

### Alternative Dictionary APIs

If DictionaryAPI.dev doesn't work for you:

**Merriam-Webster** (requires free API key):
```
https://www.dictionaryapi.com/api/v3/references/collegiate/json/{term}?key=YOUR_KEY
```

**Oxford** (requires paid subscription)
**WordsAPI** (free tier available)

## Getting Help

1. Check the README for detailed documentation
2. Review CHANGELOG for recent changes
3. Search existing issues
4. Create new issue with:
   - Obsidian version
   - Plugin version
   - Error messages
   - Steps to reproduce

## Next Steps

After installation:

1. **Organize your vault:**
   - Create main notes with wikilinks
   - Let WikiVault generate definitions

2. **Customize settings:**
   - Experiment with different batch sizes
   - Try custom prompts
   - Adjust when auto-run triggers

3. **Build your wiki:**
   - Review generated notes
   - Add your own context
   - Link related concepts

4. **Maintain your wiki:**
   - Run periodically to catch new links
   - Update AI summaries as needed
   - Refine custom prompts

---

**Enjoy building your personal wiki! 📚**

For questions or support, contact via the plugin page or GitHub repository.
