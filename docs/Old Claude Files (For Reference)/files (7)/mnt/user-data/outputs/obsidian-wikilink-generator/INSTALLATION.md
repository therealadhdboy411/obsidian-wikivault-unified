# Quick Installation Guide

## Method 1: Manual Installation (Easiest)

1. **Locate your Obsidian plugins folder:**
   - Windows: `%APPDATA%\Obsidian\<your-vault>\.obsidian\plugins\`
   - Mac: `~/Library/Application Support/obsidian/<your-vault>/.obsidian/plugins/`
   - Linux: `~/.config/obsidian/<your-vault>/.obsidian/plugins/`

2. **Create plugin folder:**
   - Create a new folder called `wikilink-generator` inside the plugins folder

3. **Copy files:**
   - Copy `manifest.json` to the new folder
   - Copy `main.ts` to the new folder
   - Copy `styles.css` to the new folder (optional)

4. **Build the plugin:**
   ```bash
   cd <vault>/.obsidian/plugins/wikilink-generator
   npm install
   npm run build
   ```

5. **Enable the plugin:**
   - Open Obsidian
   - Go to Settings → Community plugins
   - Turn off "Restricted mode" if needed
   - Click "Reload plugins"
   - Enable "WikiLink Generator"

## Method 2: Development Mode

For testing and development:

1. **Clone/copy the entire folder to your vault's plugins directory**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start development mode:**
   ```bash
   npm run dev
   ```
4. **Enable the plugin in Obsidian**

## Configuration

After installation, configure the plugin:

1. Go to **Settings → WikiLink Generator**
2. (Optional) Add your API credentials for AI summaries:
   - **API Endpoint**: Default is OpenAI, but works with any compatible endpoint
   - **API Key**: Your API key
   - **Model**: e.g., `gpt-3.5-turbo` or `gpt-4`
3. Toggle **"Auto-generate summaries"** if you want AI descriptions
4. Adjust the **Similarity threshold** (default 0.9 = 90% similarity)

## First Use

1. Open Command Palette (Ctrl/Cmd + P)
2. Type "Generate missing WikiLink notes"
3. Press Enter
4. The plugin will scan your vault and create notes!

## Troubleshooting

**Plugin doesn't appear:**
- Make sure you copied the files to the correct location
- Check that you ran `npm run build` successfully
- Reload Obsidian or restart it

**Build errors:**
- Make sure you have Node.js installed (v16 or higher)
- Try deleting `node_modules` and running `npm install` again

**No notes generated:**
- Make sure you have wikilinks in your vault: `[[like this]]`
- Check that the wikilinks don't already have notes
- Open the console (Ctrl/Cmd + Shift + I) to see errors

## Using Without AI

The plugin works perfectly without AI:
- Simply don't enter an API key
- It will create notes with context excerpts from your vault
- You can manually write summaries or add them later

## Need Help?

Check the full README.md for detailed documentation and examples!
