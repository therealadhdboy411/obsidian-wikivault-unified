# Code Changes: LM Studio Integration

## Summary of Changes

This document details the specific code modifications made to add LM Studio support to WikiVault.

## 1. Settings Interface Update

### Before:
```typescript
interface WikiVaultSettings {
	openaiEndpoint: string;
	openaiApiKey: string;
	modelName: string;
	similarityThreshold: number;
	runOnStartup: boolean;
	runOnFileSwitch: boolean;
	useCustomDirectory: boolean;
	customDirectoryName: string;
	showProgressNotification: boolean;
}
```

### After:
```typescript
interface WikiVaultSettings {
	apiProvider: 'openai' | 'lmstudio';  // NEW FIELD
	openaiEndpoint: string;
	openaiApiKey: string;
	modelName: string;
	similarityThreshold: number;
	runOnStartup: boolean;
	runOnFileSwitch: boolean;
	useCustomDirectory: boolean;
	customDirectoryName: string;
	showProgressNotification: boolean;
}
```

**Change**: Added `apiProvider` field to track which API format to use.

---

## 2. Default Settings Update

### Before:
```typescript
const DEFAULT_SETTINGS: WikiVaultSettings = {
	openaiEndpoint: 'https://api.openai.com/v1',
	openaiApiKey: '',
	modelName: 'gpt-3.5-turbo',
	// ... other settings
};
```

### After:
```typescript
const DEFAULT_SETTINGS: WikiVaultSettings = {
	apiProvider: 'openai',  // NEW: Defaults to OpenAI-compatible for backward compatibility
	openaiEndpoint: 'https://api.openai.com/v1',
	openaiApiKey: '',
	modelName: 'gpt-3.5-turbo',
	// ... other settings
};
```

**Change**: Added default `apiProvider` value ensuring backward compatibility.

---

## 3. AI Summary Method Refactoring

### Before (Single Method):
```typescript
async getAISummary(linkName: string): Promise<string | null> {
	if (!this.settings.openaiApiKey) return null;
	
	try {
		const response = await requestUrl({
			url: `${this.settings.openaiEndpoint}/chat/completions`,
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${this.settings.openaiApiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model: this.settings.modelName,
				messages: [
					{ role: 'system', content: '...' },
					{ role: 'user', content: `...${linkName}...` },
				],
			}),
		});
		
		const data = response.json;
		return data.choices[0].message.content;
	} catch (error) {
		console.error('WikiVault: AI Summary failed', error);
		return null;
	}
}
```

### After (Provider Dispatch + Two Implementations):

#### Main Method (Dispatcher):
```typescript
async getAISummary(linkName: string): Promise<string | null> {
	if (!this.settings.openaiApiKey && this.settings.apiProvider === 'openai') return null;

	try {
		if (this.settings.apiProvider === 'lmstudio') {
			return await this.getAISummaryLMStudio(linkName);
		} else {
			return await this.getAISummaryOpenAI(linkName);
		}
	} catch (error) {
		console.error('WikiVault: AI Summary failed', error);
		return null;
	}
}
```

#### OpenAI-Compatible Implementation:
```typescript
async getAISummaryOpenAI(linkName: string): Promise<string | null> {
	const response = await requestUrl({
		url: `${this.settings.openaiEndpoint}/chat/completions`,
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${this.settings.openaiApiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			model: this.settings.modelName,
			messages: [
				{ role: 'system', content: 'You are a helpful assistant that provides concise, Wikipedia-style definitions for terms.' },
				{ role: 'user', content: `Provide a one-paragraph summary/definition for the term: "${linkName}"` },
			],
		}),
	});

	const data = response.json;
	return data.choices[0].message.content;
}
```

#### LM Studio Native Implementation:
```typescript
async getAISummaryLMStudio(linkName: string): Promise<string | null> {
	// Remove trailing /v1 if present to get base URL
	const endpoint = this.settings.openaiEndpoint.replace(/\/v1\/?$/, '');
	
	const response = await requestUrl({
		url: `${endpoint}/api/v1/chat`,  // LM Studio native endpoint
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			// Note: No Authorization header for local LM Studio
		},
		body: JSON.stringify({
			model: this.settings.modelName,
			messages: [
				{ role: 'system', content: 'You are a helpful assistant that provides concise, Wikipedia-style definitions for terms.' },
				{ role: 'user', content: `Provide a one-paragraph summary/definition for the term: "${linkName}"` },
			],
			stream: false,  // Explicitly disable streaming
		}),
	});

	const data = response.json;
	
	// LM Studio response format is compatible with OpenAI
	if (data.choices && data.choices.length > 0) {
		return data.choices[0].message.content;
	}
	
	return null;
}
```

**Changes**:
1. Split into three methods for better separation of concerns
2. Added provider-specific logic
3. Removed authentication for LM Studio
4. Added endpoint URL normalization for LM Studio
5. Added explicit streaming control

---

## 4. Settings Tab UI Updates

### Before:
```typescript
containerEl.createEl('h2', { text: 'AI Configuration' });

new Setting(containerEl)
	.setName('OpenAI Compatible Endpoint')
	.setDesc('The API endpoint for your AI model')
	.addText(/* ... */);

new Setting(containerEl)
	.setName('API Key')
	.setDesc('Your API key for the endpoint')
	.addText(/* ... */);
```

### After:
```typescript
containerEl.createEl('h2', { text: 'AI Configuration' });

// NEW: API Provider Selection
new Setting(containerEl)
	.setName('API Provider')
	.setDesc('Choose between OpenAI-compatible API or LM Studio native API')
	.addDropdown((dropdown) =>
		dropdown
			.addOption('openai', 'OpenAI Compatible')
			.addOption('lmstudio', 'LM Studio Native')
			.setValue(this.plugin.settings.apiProvider)
			.onChange(async (value: 'openai' | 'lmstudio') => {
				this.plugin.settings.apiProvider = value;
				await this.plugin.saveSettings();
				this.display(); // Refresh to update UI
			})
	);

// UPDATED: Dynamic endpoint description
new Setting(containerEl)
	.setName('API Endpoint')
	.setDesc(
		this.plugin.settings.apiProvider === 'lmstudio'
			? 'LM Studio server URL (e.g., http://localhost:1234)'
			: 'OpenAI-compatible endpoint (e.g., https://api.openai.com/v1)'
	)
	.addText((text) =>
		text
			.setPlaceholder(
				this.plugin.settings.apiProvider === 'lmstudio'
					? 'http://localhost:1234'
					: 'https://api.openai.com/v1'
			)
			.setValue(this.plugin.settings.openaiEndpoint)
			.onChange(async (value) => {
				this.plugin.settings.openaiEndpoint = value;
				await this.plugin.saveSettings();
			})
	);

// UPDATED: Conditional API Key field
if (this.plugin.settings.apiProvider === 'openai') {
	new Setting(containerEl)
		.setName('API Key')
		.setDesc('Your API key for the endpoint')
		.addText((text) =>
			text
				.setPlaceholder('sk-...')
				.setValue(this.plugin.settings.openaiApiKey)
				.onChange(async (value) => {
					this.plugin.settings.openaiApiKey = value;
					await this.plugin.saveSettings();
				})
		);
}

// UPDATED: Dynamic model name description
new Setting(containerEl)
	.setName('Model Name')
	.setDesc(
		this.plugin.settings.apiProvider === 'lmstudio'
			? 'The name of the loaded model in LM Studio'
			: 'The name of the model to use'
	)
	.addText((text) =>
		text
			.setPlaceholder(
				this.plugin.settings.apiProvider === 'lmstudio'
					? 'llama-3.2-3b-instruct'
					: 'gpt-3.5-turbo'
			)
			.setValue(this.plugin.settings.modelName)
			.onChange(async (value) => {
				this.plugin.settings.modelName = value;
				await this.plugin.saveSettings();
			})
	);
```

**Changes**:
1. Added dropdown for API provider selection
2. Made descriptions and placeholders dynamic based on provider
3. Conditionally show/hide API key field
4. Added UI refresh on provider change

---

## 5. Key Differences: OpenAI vs LM Studio

### Request Comparison

| Aspect | OpenAI Compatible | LM Studio Native |
|--------|-------------------|------------------|
| **Endpoint** | `/v1/chat/completions` | `/api/v1/chat` |
| **Base URL** | Full endpoint with /v1 | Base URL (strips /v1) |
| **Auth Header** | `Authorization: Bearer <key>` | None (local server) |
| **Stream Param** | Optional | Explicit `false` for sync |
| **Response Format** | Standard OpenAI | Compatible with OpenAI |

### Example Requests

**OpenAI:**
```javascript
POST https://api.openai.com/v1/chat/completions
Authorization: Bearer sk-...
Content-Type: application/json

{
  "model": "gpt-3.5-turbo",
  "messages": [...]
}
```

**LM Studio:**
```javascript
POST http://localhost:1234/api/v1/chat
Content-Type: application/json

{
  "model": "llama-3.2-3b-instruct",
  "messages": [...],
  "stream": false
}
```

---

## 6. Testing Checklist

When implementing these changes, verify:

- ✅ Existing OpenAI-compatible configs still work
- ✅ New installations default to OpenAI mode
- ✅ LM Studio mode works with local server
- ✅ Settings UI updates when switching providers
- ✅ API key is not required for LM Studio
- ✅ Model names are validated correctly
- ✅ Error handling works for both providers
- ✅ Configuration saves and loads correctly

---

## 7. Files Modified

1. **src/main.ts** - Main plugin logic (all changes above)
2. **manifest.json** - Version bump to 1.1.0
3. **README.md** - Updated documentation (new file: README-LMSTUDIO.md)
4. **data.json** - Example configs for different providers

---

## 8. Future Enhancement Opportunities

Based on LM Studio's API capabilities, future enhancements could include:

1. **Stateful Chats**: Use LM Studio's stateful chat sessions for context-aware summaries
2. **MCP Integration**: Leverage Model Context Protocol for enhanced knowledge
3. **Model Management**: Auto-load/unload models via API
4. **Batch Processing**: Use LM Studio's batch endpoints for multiple wikilinks
5. **Streaming**: Implement streaming responses for real-time feedback
6. **Custom Tools**: Add LM Studio tools for specialized wikifunctions

These would require additional modifications to the plugin architecture.
