# Quick Installation Guide - Auto Wiki Plugin

## Method 1: Install in Your Obsidian Vault (Recommended)

### Step 1: Locate Your Vault's Plugin Folder
Open your Obsidian vault folder and navigate to:
```
YourVault/.obsidian/plugins/
```

If the `plugins` folder doesn't exist, create it.

### Step 2: Copy Plugin Files
1. Create a new folder called `auto-wiki` inside the plugins folder
2. Copy all the files from the `obsidian-auto-wiki` folder into this new folder

Your structure should look like:
```
YourVault/
  .obsidian/
    plugins/
      auto-wiki/
        main.ts
        manifest.json
        package.json
        ... (all other files)
```

### Step 3: Build the Plugin
Open a terminal/command prompt in the `auto-wiki` folder and run:

```bash
# Install dependencies
npm install

# Build the plugin
npm run build
```

This will create a `main.js` file that Obsidian needs to run the plugin.

### Step 4: Enable the Plugin
1. Open Obsidian
2. Go to Settings → Community Plugins
3. Turn off "Restricted Mode" if it's on
4. Click "Browse" and find "Auto Wiki" in the list
5. Enable it

## Method 2: Development Mode (For Testing)

If you want to work on the plugin while testing:

```bash
cd /path/to/your/vault/.obsidian/plugins/auto-wiki
npm install
npm run dev
```

This watches for file changes and rebuilds automatically.

## Configuration

After installation:

1. Go to Settings → Auto Wiki
2. Configure your settings:
   - **Enable AI summaries**: Toggle on if you want AI-generated summaries
   - **AI endpoint**: Enter your API endpoint (OpenAI, local LLM, etc.)
   - **API key**: Enter your API key
   - **AI model**: Specify the model name
   - **Similarity threshold**: Adjust fuzzy matching (default: 0.9)

## First Use

1. Click the chain link icon in the left ribbon, OR
2. Open Command Palette (Ctrl/Cmd + P) and search for "Process vault and generate wiki pages"
3. Wait for the plugin to scan your vault
4. Check your vault root for new wiki pages!

## Troubleshooting

### Plugin Doesn't Appear
- Make sure you ran `npm run build`
- Check that `main.js` exists in the plugin folder
- Reload Obsidian (Ctrl/Cmd + R)

### Build Errors
- Make sure you have Node.js installed (v16 or later)
- Try deleting `node_modules` and running `npm install` again

### AI Summaries Not Working
- Check your API endpoint URL
- Verify your API key is correct
- Make sure your endpoint is OpenAI-compatible
- Check the console (Ctrl/Cmd + Shift + I) for error messages

## Using Different AI Providers

### OpenAI
```
Endpoint: https://api.openai.com/v1/chat/completions
API Key: Your OpenAI API key
Model: gpt-3.5-turbo or gpt-4
```

### LM Studio (Local)
```
1. Start LM Studio
2. Load a model
3. Enable "Start Server" in LM Studio

Endpoint: http://localhost:1234/v1/chat/completions
API Key: (leave blank or enter "lm-studio")
Model: The name shown in LM Studio
```

### Ollama (Local)
```bash
# Start Ollama with OpenAI compatibility
OLLAMA_ORIGINS=* ollama serve
```
```
Endpoint: http://localhost:11434/v1/chat/completions
API Key: ollama
Model: llama2 (or your installed model)
```

## Next Steps

- Read `EXAMPLES.md` for usage examples
- Check `README.md` for detailed documentation
- Review `CONTRIBUTING.md` if you want to contribute

## Need Help?

- Check the console for errors: View → Toggle Developer Tools (Ctrl/Cmd + Shift + I)
- Review the README for detailed documentation
- Open an issue on GitHub if you encounter problems
