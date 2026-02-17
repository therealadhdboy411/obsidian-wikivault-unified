# Migration Guide: Adding LM Studio Support

## Overview
This guide helps you upgrade your WikiVault plugin to support LM Studio's native API.

## Changes Summary

### New Features
1. ✨ **API Provider Selection**: Choose between OpenAI-compatible or LM Studio native API
2. 🏠 **Local AI Support**: Run completely offline with LM Studio
3. 💰 **Cost Savings**: No API costs when using local models
4. 🔒 **Privacy**: Your data never leaves your machine

### Modified Files
- `src/main.ts` - Updated with LM Studio support
- `manifest.json` - Version bumped to 1.1.0
- `data.json` - New `apiProvider` field added

### New Files
- `README-LMSTUDIO.md` - Comprehensive setup guide
- `data.json.lmstudio-example` - Example LM Studio configuration
- `esbuild.config.mjs` - Build configuration
- `package.json` - Dependencies and build scripts

## Migration Steps

### Step 1: Backup Your Current Configuration
```bash
# In your Obsidian vault's plugin folder
cp .obsidian/plugins/obsidian-wikivault/data.json data.json.backup
```

### Step 2: Update the Plugin Files

#### Option A: Replace the source and rebuild
1. Replace `src/main.ts` with the new version
2. Run `npm install`
3. Run `npm run build`
4. Restart Obsidian

#### Option B: Copy the built files
1. Replace `main.js` with the newly built version
2. Update `manifest.json` version to `1.1.0`
3. Restart Obsidian

### Step 3: Update Your Configuration

Your existing `data.json` will continue to work! The plugin automatically adds the `apiProvider` field with a default value of `"openai"` to maintain backward compatibility.

**If you want to switch to LM Studio:**

1. Open Obsidian Settings → WikiVault
2. Change **API Provider** to "LM Studio Native"
3. Update **API Endpoint** to `http://localhost:1234`
4. Clear the **API Key** (not needed)
5. Update **Model Name** to your LM Studio model

**Your data.json will now look like:**
```json
{
  "apiProvider": "lmstudio",
  "openaiEndpoint": "http://localhost:1234",
  "openaiApiKey": "",
  "modelName": "llama-3.2-3b-instruct",
  "similarityThreshold": 0.7,
  "runOnStartup": false,
  "runOnFileSwitch": true,
  "useCustomDirectory": true,
  "customDirectoryName": "Vault Wiki",
  "showProgressNotification": true
}
```

### Step 4: Test the Migration

1. Create a test note with an unresolved `[[wikilink]]`
2. Run: `WikiVault: Generate missing Wikilink notes`
3. Verify the note is generated correctly
4. Check the console for any errors (Ctrl+Shift+I / Cmd+Option+I)

## Rollback Instructions

If you need to revert to the previous version:

```bash
# Restore your backup
cp data.json.backup .obsidian/plugins/obsidian-wikivault/data.json

# Restore the old main.js (if you kept it)
cp main.js.backup .obsidian/plugins/obsidian-wikivault/main.js

# Restart Obsidian
```

## Configuration Field Mapping

### Old Configuration → New Configuration

| Old Field | New Field | Changes |
|-----------|-----------|---------|
| `openaiEndpoint` | `openaiEndpoint` | Same, but interpretation depends on `apiProvider` |
| `openaiApiKey` | `openaiApiKey` | Same, optional for LM Studio |
| `modelName` | `modelName` | Same |
| N/A | `apiProvider` | **NEW**: `"openai"` or `"lmstudio"` |
| All other fields | All other fields | Unchanged |

## Troubleshooting Migration Issues

### Issue: Plugin won't load after update
**Solution:** 
1. Check the console for errors (Ctrl+Shift+I)
2. Verify `main.js` was built correctly
3. Try reinstalling the plugin fresh

### Issue: Settings show "API Provider" but I don't see my old settings
**Solution:**
1. Check that `data.json` wasn't corrupted
2. Restore from backup if needed
3. Settings should automatically migrate

### Issue: LM Studio not working after migration
**Solution:**
1. Verify LM Studio server is running
2. Check the endpoint URL is exactly `http://localhost:1234`
3. Verify model name matches exactly what's in LM Studio

### Issue: OpenAI/Mistral stopped working after update
**Solution:**
1. Make sure `apiProvider` is set to `"openai"`
2. Verify your API key is still in the settings
3. Check the endpoint URL hasn't changed

## Backward Compatibility

The updated plugin is **fully backward compatible**:

- Existing configurations work without changes
- Default behavior is `apiProvider: "openai"` (OpenAI-compatible mode)
- All existing settings are preserved
- The plugin auto-migrates on first load

## Support

If you encounter issues during migration:

1. Check the console for error messages
2. Verify your configuration against the examples
3. Refer to README-LMSTUDIO.md for detailed setup instructions
4. Check that LM Studio (if using) is properly running

## What's Next?

After successful migration, you can:

1. **Experiment with Local Models**: Try different models in LM Studio
2. **Optimize Settings**: Adjust similarity threshold, triggers, etc.
3. **Go Offline**: Disconnect from the internet and still generate notes
4. **Save Money**: No more API costs with local models

Enjoy your upgraded WikiVault with LM Studio support! 🎉
