# WikiVault - LM Studio Support

## What's New

This updated version of WikiVault adds first-class support for LM Studio, along with a provider selection system that makes it easy to switch between different AI providers.

## Key Features

### Provider Presets
Choose from multiple pre-configured providers:
- **LM Studio (Native API)** - Uses LM Studio's native `/api/v1/chat` endpoint
- **LM Studio (OpenAI Compatible)** - Uses LM Studio's OpenAI-compatible endpoint
- **OpenAI** - Official OpenAI API
- **Mistral AI** - Mistral's API
- **Custom** - Configure your own endpoint

### LM Studio Integration

#### Two Ways to Connect

1. **OpenAI Compatible Mode** (Recommended)
   - Endpoint: `http://localhost:1234/v1`
   - Works with LM Studio's OpenAI-compatible API
   - No API key required for local inference
   - Model name is optional (uses currently loaded model)

2. **Native API Mode**
   - Endpoint: `http://localhost:1234/api/v1`
   - Uses LM Studio's native v1 REST API
   - Access to additional features like stateful chats
   - No API key required

#### Setup Instructions

1. **Start LM Studio's Local Server**
   - Open LM Studio
   - Load a model
   - Go to the "Local Server" tab
   - Click "Start Server"
   - Default port is 1234

2. **Configure WikiVault**
   - Open Obsidian Settings
   - Go to WikiVault settings
   - Select "LM Studio (OpenAI Compatible)" or "LM Studio (Native API)" from the Provider dropdown
   - The endpoint will auto-populate to `http://localhost:1234/v1` or `http://localhost:1234/api/v1`
   - Leave "Model Name" empty to use your currently loaded model, or specify a model identifier
   - Leave "API Key" empty (not required for local inference)

3. **Generate Notes**
   - Use the command palette: "Generate missing Wikilink notes"
   - Or enable auto-generation on startup/file switch

## Configuration Options

### Provider Settings
- **Provider**: Choose your AI service provider
- **API Endpoint**: The base URL for the API (auto-filled when you select a provider)
- **API Key**: Required for cloud providers (OpenAI, Mistral), optional for LM Studio
- **Model Name**: The model to use (optional for LM Studio - uses loaded model if empty)

### LM Studio Advantages
- ✅ No API key required
- ✅ Free local inference
- ✅ Privacy - your data stays on your machine
- ✅ Works offline
- ✅ Uses your currently loaded model automatically
- ✅ No rate limits

## Migration from Previous Version

If you're upgrading from the previous version, your settings will be preserved. The plugin will:
- Detect your existing endpoint configuration
- Set "Custom" as the provider
- Maintain all your existing settings

To switch to LM Studio:
1. Select "LM Studio (OpenAI Compatible)" from the Provider dropdown
2. Start LM Studio's local server
3. Load a model in LM Studio

## API Endpoint Comparison

| Feature | LM Studio Native | LM Studio OpenAI | Cloud APIs |
|---------|------------------|------------------|------------|
| Local inference | ✅ | ✅ | ❌ |
| Requires API key | ❌ | ❌ | ✅ |
| Stateful chats | ✅ | ❌ | ❌ |
| MCP support | ✅ | ❌ | Varies |
| Works offline | ✅ | ✅ | ❌ |
| Default port | 1234 | 1234 | 443 |

## Troubleshooting

### Connection Issues
- **Error: "Failed to connect"**
  - Ensure LM Studio's local server is running
  - Check the port number (default: 1234)
  - Verify the endpoint URL in settings

- **Error: "Model not loaded"**
  - Load a model in LM Studio before generating notes
  - Or specify a model name in WikiVault settings

### Model Selection
- Leave "Model Name" **empty** to use whatever model is currently loaded in LM Studio
- Specify a model name only if you want to use a specific model identifier

## Files Changed

- **main.js** - Updated with provider presets and LM Studio API support
- **data.json** - Updated default configuration for LM Studio

## Example Configurations

### LM Studio Local (Default)
```json
{
  "provider": "lmstudio-openai",
  "openaiEndpoint": "http://localhost:1234/v1",
  "openaiApiKey": "",
  "modelName": "",
  "apiType": "openai"
}
```

### OpenAI
```json
{
  "provider": "openai",
  "openaiEndpoint": "https://api.openai.com/v1",
  "openaiApiKey": "sk-...",
  "modelName": "gpt-3.5-turbo",
  "apiType": "openai"
}
```

### Mistral AI
```json
{
  "provider": "mistral",
  "openaiEndpoint": "https://api.mistral.ai/v1",
  "openaiApiKey": "your-api-key",
  "modelName": "mistral-small-latest",
  "apiType": "openai"
}
```

## Support

For issues or questions:
- Check LM Studio is running and has a model loaded
- Verify the endpoint URL matches your LM Studio server port
- Check the Obsidian console for error messages (Ctrl+Shift+I / Cmd+Option+I)
