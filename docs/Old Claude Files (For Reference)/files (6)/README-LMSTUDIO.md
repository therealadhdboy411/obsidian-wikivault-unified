# WikiVault - LM Studio Support Update

## What's New

This update adds native support for LM Studio's REST API (v1) alongside the existing OpenAI-compatible API support. You can now run WikiVault entirely locally using LM Studio!

## Key Changes

### 1. **Dual API Support**
- **OpenAI Compatible**: Works with OpenAI, Mistral, Anthropic, and other OpenAI-compatible APIs
- **LM Studio Native**: Uses LM Studio's `/api/v1/chat` endpoint with enhanced features

### 2. **New Settings**
- **API Provider**: Choose between "OpenAI Compatible" or "LM Studio Native"
- **Dynamic Configuration**: Settings UI adapts based on your chosen provider
- **No API Key Required**: When using LM Studio locally, no API key is needed

### 3. **Enhanced Features with LM Studio**
- Run completely offline with local models
- No API costs
- Full privacy - your data never leaves your machine
- Access to LM Studio's stateful chat and MCP features (future enhancement)

## Setup Instructions

### Option 1: Using LM Studio (Recommended for Local/Offline Use)

#### Step 1: Install and Configure LM Studio
1. Download LM Studio from https://lmstudio.ai
2. Open LM Studio and download a model (e.g., `llama-3.2-3b-instruct`)
3. Start the local server:
   - Click on the "Local Server" tab (or ↔️ icon)
   - Click "Start Server"
   - Note the port (usually `1234`)

#### Step 2: Configure WikiVault
1. Open Obsidian Settings
2. Go to WikiVault settings
3. Set the following:
   - **API Provider**: Select "LM Studio Native"
   - **API Endpoint**: `http://localhost:1234` (or your LM Studio port)
   - **Model Name**: The exact model name from LM Studio (e.g., `llama-3.2-3b-instruct`)
   - Leave **API Key** empty (not needed for local LM Studio)

#### Step 3: Test It
1. Create a note with a `[[wikilink]]` that doesn't exist
2. Run the command: `WikiVault: Generate missing Wikilink notes`
3. Check your Vault Wiki folder for the generated note

### Option 2: Using OpenAI-Compatible APIs

This works with OpenAI, Mistral, Anthropic, or any other OpenAI-compatible endpoint.

#### Configuration:
1. Open Obsidian Settings → WikiVault
2. Set:
   - **API Provider**: "OpenAI Compatible"
   - **API Endpoint**: Your API endpoint URL
     - OpenAI: `https://api.openai.com/v1`
     - Mistral: `https://api.mistral.ai/v1`
     - Custom: Your endpoint URL
   - **API Key**: Your API key
   - **Model Name**: The model to use (e.g., `gpt-3.5-turbo`, `mistral-small-latest`)

## Configuration Examples

### LM Studio Configuration
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

### Mistral Configuration
```json
{
  "apiProvider": "openai",
  "openaiEndpoint": "https://api.mistral.ai/v1",
  "openaiApiKey": "your-mistral-api-key",
  "modelName": "mistral-small-latest",
  "similarityThreshold": 0.7,
  "runOnStartup": true,
  "runOnFileSwitch": true,
  "useCustomDirectory": true,
  "customDirectoryName": "Vault Wiki",
  "showProgressNotification": false
}
```

### OpenAI Configuration
```json
{
  "apiProvider": "openai",
  "openaiEndpoint": "https://api.openai.com/v1",
  "openaiApiKey": "sk-...",
  "modelName": "gpt-3.5-turbo",
  "similarityThreshold": 0.9,
  "runOnStartup": false,
  "runOnFileSwitch": false,
  "useCustomDirectory": true,
  "customDirectoryName": "Vault Wiki",
  "showProgressNotification": true
}
```

## Building the Plugin

If you want to build from the updated source:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the plugin:
   ```bash
   npm run build
   ```

3. The compiled `main.js` will be in the root directory

## Technical Details

### API Endpoint Comparison

| Feature | OpenAI Compatible | LM Studio Native |
|---------|------------------|------------------|
| Endpoint | `/v1/chat/completions` | `/api/v1/chat` |
| Authentication | API Key required | No auth (local) |
| Streaming | ✅ | ✅ |
| Offline | ❌ | ✅ |
| Cost | Varies | Free |

### LM Studio Native API Implementation

The plugin now detects the API provider and formats requests accordingly:

**OpenAI-Compatible Request:**
```javascript
{
  url: "https://api.openai.com/v1/chat/completions",
  headers: {
    "Authorization": "Bearer sk-...",
    "Content-Type": "application/json"
  },
  body: {
    model: "gpt-3.5-turbo",
    messages: [...]
  }
}
```

**LM Studio Native Request:**
```javascript
{
  url: "http://localhost:1234/api/v1/chat",
  headers: {
    "Content-Type": "application/json"
  },
  body: {
    model: "llama-3.2-3b-instruct",
    messages: [...],
    stream: false
  }
}
```

## Troubleshooting

### LM Studio Issues

**Problem**: "Connection refused" error
- **Solution**: Make sure LM Studio's server is running (green indicator in Local Server tab)

**Problem**: "Model not found" error
- **Solution**: Check the exact model name in LM Studio and copy it exactly to WikiVault settings

**Problem**: Slow responses
- **Solution**: Load a smaller model or adjust LM Studio's GPU settings for better performance

### General Issues

**Problem**: No notes are being generated
- **Solution**: Check that you have unresolved wikilinks in your vault
- Run the command manually: `WikiVault: Generate missing Wikilink notes`

**Problem**: API errors in console
- **Solution**: Check your endpoint URL and API key (if using OpenAI-compatible)
- Verify the model name is correct

## Recommended Models for LM Studio

For WikiVault, smaller models work well since we're generating brief summaries:

- **Llama 3.2 3B Instruct** - Fast, accurate, great for summaries
- **Phi-3 Mini** - Excellent quality, very fast
- **Mistral 7B Instruct** - Higher quality, slightly slower
- **Qwen 2.5 3B Instruct** - Good balance of speed and quality

## Future Enhancements

Potential features to leverage LM Studio's advanced capabilities:

- [ ] Stateful chat sessions for context-aware summaries
- [ ] MCP (Model Context Protocol) integration for enhanced context
- [ ] Batch processing of multiple wikilinks
- [ ] Custom prompt templates
- [ ] Model auto-loading when plugin activates

## Support

For issues or feature requests:
- LM Studio: https://github.com/lmstudio-ai/lmstudio-bug-tracker
- WikiVault: Open an issue on the plugin repository

## License

Same as original WikiVault plugin.
