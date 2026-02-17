# Quick Start Guide

## 🚀 Getting Started with LM Studio Support

### Option 1: Quick Setup (Use LM Studio Immediately)

**Step 1**: Install LM Studio
```bash
# Download from https://lmstudio.ai
# Install and open LM Studio
```

**Step 2**: Load a Model
1. Open LM Studio
2. Go to "Search" tab
3. Download "llama-3.2-3b-instruct" (or another small model)
4. Go to "Chat" tab and load the model

**Step 3**: Start Local Server
1. Click "Local Server" tab (↔️ icon)
2. Click "Start Server"
3. Note the address (usually `http://localhost:1234`)

**Step 4**: Configure WikiVault
1. Open Obsidian → Settings → WikiVault
2. Set:
   - **API Provider**: "LM Studio Native"
   - **API Endpoint**: `http://localhost:1234`
   - **Model Name**: `llama-3.2-3b-instruct` (exact name from LM Studio)
   - **API Key**: (leave empty)

**Step 5**: Test It!
1. Create a note with `[[test link]]`
2. Run command: "WikiVault: Generate missing Wikilink notes"
3. Check the "Vault Wiki" folder for your generated note

Done! You're now running WikiVault completely offline! 🎉

---

### Option 2: Build from Source

```bash
# Clone or download the updated files
cd obsidian-wikivault

# Install dependencies
npm install

# Build the plugin
npm run build

# The compiled main.js is ready to use
```

Then copy to your Obsidian vault:
```bash
cp main.js ~/.obsidian/plugins/obsidian-wikivault/
cp manifest.json ~/.obsidian/plugins/obsidian-wikivault/
```

---

### Option 3: Keep Using OpenAI/Mistral

No changes needed! Your existing configuration will continue to work. The plugin is fully backward compatible.

---

## 📁 File Overview

### Core Files
- `src/main.ts` - Updated plugin source with LM Studio support
- `manifest.json` - Plugin manifest (version 1.1.0)
- `package.json` - Build dependencies and scripts

### Build Files
- `esbuild.config.mjs` - Build configuration
- `tsconfig.json` - TypeScript configuration

### Documentation
- `README-LMSTUDIO.md` - Complete LM Studio setup guide
- `MIGRATION.md` - Upgrade instructions from v1.0.0
- `CHANGELOG.md` - Version history
- `CODE-CHANGES.md` - Detailed code modifications

### Configuration Examples
- `data.json.lmstudio-example` - Example LM Studio config

---

## 🔧 Troubleshooting

### "Can't connect to LM Studio"
- ✅ Check LM Studio server is running (green indicator)
- ✅ Verify URL is exactly `http://localhost:1234`
- ✅ Try refreshing Obsidian (Ctrl+R / Cmd+R)

### "Model not found"
- ✅ Copy exact model name from LM Studio
- ✅ Make sure model is loaded (not just downloaded)
- ✅ Check for typos in model name

### "Nothing happens"
- ✅ Check you have unresolved wikilinks
- ✅ Run command manually from command palette
- ✅ Check console for errors (Ctrl+Shift+I)

---

## 📚 Next Steps

1. **Read the docs**: Check out `README-LMSTUDIO.md` for detailed info
2. **Try different models**: Experiment with Phi-3, Mistral, etc.
3. **Optimize settings**: Adjust similarity threshold, triggers
4. **Go offline**: Disconnect and keep working!

---

## 💡 Pro Tips

- **Faster responses**: Use smaller models (3B parameters)
- **Better quality**: Use larger models when you have time (7B+)
- **Mixed approach**: Use LM Studio for offline, OpenAI when online
- **Model switching**: Change models in LM Studio without restarting plugin

---

## 🆘 Need Help?

1. Check the documentation files
2. Look at example configurations
3. Review the migration guide
4. Check LM Studio docs: https://lmstudio.ai/docs

Enjoy your new locally-powered WikiVault! 🚀
