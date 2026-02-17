# WikiVault - LM Studio Support

## What's New

WikiVault now supports **LM Studio's native v1 REST API** in addition to OpenAI-compatible endpoints! This means you can run the plugin entirely locally with models running in LM Studio.

## Changes in This Version

### New Features

1. **API Provider Selection**: Choose between:
   - **OpenAI / OpenAI-compatible**: For OpenAI, Mistral AI, or any OpenAI-compatible API
   - **LM Studio (Native API)**: For LM Studio's native `/api/v1/chat` endpoint

2. **Separate Configuration**: Each provider has its own configuration settings:
   - LM Studio: endpoint URL and optional API key
   - OpenAI-compatible: endpoint URL and API key

3. **Automatic Migration**: Your existing settings will continue to work. The plugin defaults to OpenAI-compatible mode.

### How It Works

The plugin now detects which API provider you've selected and uses the appropriate endpoint:

- **OpenAI-compatible**: Uses `/v1/chat/completions` (standard OpenAI format)
- **LM Studio**: Uses `/api/v1/chat` (LM Studio's native v1 API)

## Setup Instructions

### Using LM Studio

1. **Start LM Studio**:
   - Open LM Studio on your computer
   - Load a model (e.g., any local LLM you have downloaded)
   - Go to the "Local Server" tab
   - Start the server (default: `http://localhost:1234`)

2. **Configure WikiVault**:
   - Open Obsidian Settings
   - Go to WikiVault plugin settings
   - Under "AI Configuration":
     - Set **API Provider** to "LM Studio (Native API)"
     - Set **LM Studio Endpoint** to `http://localhost:1234` (or your custom port)
     - Set **Model Name** to the identifier of your loaded model (e.g., `llama-3.2-1b`)
     - Leave **API Key** empty unless you've enabled authentication in LM Studio

3. **Test It**:
   - Create a note with an unresolved wikilink like `[[Machine Learning]]`
   - Run the command "Generate missing Wikilink notes"
   - WikiVault will create a new note with an AI-generated summary from your local LM Studio model!

### Using OpenAI or Compatible Services

1. **Configure WikiVault**:
   - Open Obsidian Settings
   - Go to WikiVault plugin settings
   - Under "AI Configuration":
     - Set **API Provider** to "OpenAI / OpenAI-compatible"
     - For **OpenAI**: Use `https://api.openai.com/v1`
     - For **Mistral AI**: Use `https://api.mistral.ai/v1`
     - For other services: Use their OpenAI-compatible endpoint
     - Set your **API Key**
     - Set your **Model Name** (e.g., `gpt-3.5-turbo`, `mistral-small-latest`)

## Configuration Examples

### Example 1: LM Studio (Local)

```json
{
  "apiProvider": "lmstudio",
  "lmstudioEndpoint": "http://localhost:1234",
  "lmstudioApiKey": "",
  "modelName": "llama-3.2-1b",
  "useCustomDirectory": true,
  "customDirectoryName": "Vault Wiki"
}
```

### Example 2: Mistral AI

```json
{
  "apiProvider": "openai",
  "openaiEndpoint": "https://api.mistral.ai/v1",
  "openaiApiKey": "your-mistral-api-key",
  "modelName": "mistral-small-latest",
  "useCustomDirectory": true,
  "customDirectoryName": "Vault Wiki"
}
```

### Example 3: OpenAI

```json
{
  "apiProvider": "openai",
  "openaiEndpoint": "https://api.openai.com/v1",
  "openaiApiKey": "sk-...",
  "modelName": "gpt-3.5-turbo",
  "useCustomDirectory": true,
  "customDirectoryName": "Vault Wiki"
}
```

## Benefits of Using LM Studio

- **Privacy**: All processing happens locally on your machine
- **No API Costs**: No per-request charges
- **Offline**: Works without internet connection
- **Customization**: Use any model you want from LM Studio's catalog
- **Speed**: Can be faster than API calls depending on your hardware

## Troubleshooting

### LM Studio Connection Issues

1. **"Connection refused" error**:
   - Make sure LM Studio is running
   - Verify the server is started in the "Local Server" tab
   - Check that the endpoint URL matches (default: `http://localhost:1234`)

2. **No response from model**:
   - Ensure a model is loaded in LM Studio
   - Check the model name matches what's shown in LM Studio
   - Try a simpler/smaller model if yours is timing out

3. **Authentication errors**:
   - If you've enabled API authentication in LM Studio, add your API token
   - If not using authentication, leave the API Key field empty

### OpenAI-Compatible Issues

1. **401 Unauthorized**:
   - Check your API key is correct
   - Verify you have credits/access for the service

2. **Model not found**:
   - Verify the model name is exactly correct
   - Check the service's documentation for available models

## API Comparison

| Feature | LM Studio Native | OpenAI-Compatible |
|---------|------------------|-------------------|
| Privacy | ✅ Fully local | ❌ Cloud-based |
| Cost | ✅ Free | 💰 Pay-per-use |
| Setup | Medium | Easy |
| Speed | Depends on hardware | Generally fast |
| Model Selection | Any local model | Provider's models |
| Offline | ✅ Yes | ❌ No |

## Migration Guide

If you're currently using the plugin with Mistral AI or another OpenAI-compatible service, your settings will continue to work without any changes. The plugin defaults to OpenAI-compatible mode.

To switch to LM Studio:
1. Install and set up LM Studio
2. Change the API Provider setting to "LM Studio (Native API)"
3. Configure the LM Studio endpoint and model name
4. You're ready to go!

## Technical Details

### Endpoint Differences

**LM Studio Native API** (`/api/v1/chat`):
- Native LM Studio v1 REST API
- Supports stateful chats (future feature potential)
- Supports MCP (Model Context Protocol)
- Enhanced streaming events

**OpenAI-Compatible** (`/v1/chat/completions`):
- Standard OpenAI API format
- Works with OpenAI, Mistral AI, and many other providers
- Widely supported format

Both endpoints support the core functionality needed by WikiVault: sending a prompt and receiving a text response.

## Support

- For plugin issues: Open an issue on the WikiVault repository
- For LM Studio issues: Visit [LM Studio's bug tracker](https://github.com/lmstudio-ai/lmstudio-bug-tracker/issues)
- For API questions: Check [LM Studio's documentation](https://lmstudio.ai/docs)
