# Changelog

All notable changes to WikiVault will be documented in this file.

## [2.0.0] - 2024

### 🎉 Major Features Added

#### Batch Processing & Performance
- **Batch API Requests**: Process multiple links in parallel with configurable batch size (1-20)
- **Progress Bar with ETA**: Real-time progress tracking with estimated time remaining
- **Status Bar Updates**: Live progress percentage display in status bar
- **Performance Improvements**: Significantly faster processing for large vaults

#### User Interface
- **Ribbon Icon**: Added quick-access book icon in left sidebar
- **Enhanced Notifications**: Progress notifications show percentage and ETA
- **Better Visual Feedback**: Clear progress indicators during processing

#### Dictionary Integration
- **Dictionary API Support**: Automatic dictionary definition lookups
- **Free API Integration**: Uses DictionaryAPI.dev by default (no key required)
- **Custom Endpoints**: Support for alternative dictionary APIs
- **Rich Definitions**: Displays part of speech, definitions, and usage examples
- **Graceful Fallback**: Handles technical terms not in dictionary

#### Plural Handling
- **Automatic Detection**: Identifies plural forms of terms
- **Multiple Patterns**: Handles regular, irregular, and special plurals
  - Regular: word → words
  - ES endings: box → boxes  
  - IES transformation: city → cities
  - Irregular: child → children, mouse → mice
- **Explanatory Section**: Adds "About this term" section explaining plurals
- **Smart Linking**: Links to singular form when detected

#### Customization
- **Custom AI Prompts**: Fully customizable prompt templates
- **Prompt Variables**: Use `{term}` placeholder in prompts
- **Flexible Styling**: Tailor AI responses to your needs
- **Context Control**: Better control over generated content

#### Enhanced Context Extraction
- **Improved Algorithm**: Better surrounding context capture
- **Regex-based Detection**: More accurate wikilink matching
- **Alias Support**: Properly handles wikilink aliases
- **Nested Bullets**: Better handling of indented bullet points
- **Mention Limiting**: Caps at 10 mentions to prevent overwhelming content
- **Surrounding Lines**: Captures context before and after mentions

### 🔧 Technical Improvements

#### Code Quality
- **TypeScript Refactoring**: Better type safety and code organization
- **Error Handling**: Improved error handling for API calls
- **Async Optimization**: Better async/await patterns
- **Memory Management**: More efficient processing of large vaults

#### API Enhancements
- **Rate Limiting**: Better API rate limit handling
- **Retry Logic**: Improved retry mechanisms for failed requests
- **Temperature Control**: Added temperature parameter to AI calls
- **Token Limits**: Configurable max_tokens for AI responses

#### Settings
- **New Settings**: Added multiple new configuration options
- **Setting Validation**: Better validation of user inputs
- **Setting Groups**: Organized settings into logical categories
- **Dynamic UI**: Settings UI updates based on enabled features

### 🐛 Bug Fixes

- Fixed regex escaping issues in wikilink detection
- Improved bullet point indentation handling
- Better handling of empty lines in context extraction
- Fixed edge cases in plural detection
- Improved error messages for API failures

### 📝 Documentation

- **Comprehensive README**: Detailed documentation of all features
- **Usage Examples**: Real-world examples of generated notes
- **Configuration Guide**: Step-by-step setup instructions
- **Troubleshooting Section**: Common issues and solutions
- **Performance Tips**: Optimization recommendations

### ⚙️ Configuration Changes

#### New Settings
```json
{
  "batchSize": 5,
  "customPrompt": "...",
  "useDictionaryAPI": true,
  "dictionaryAPIEndpoint": "...",
  "handlePlurals": true
}
```

#### Modified Defaults
- `showProgressNotification`: Now defaults to `true`
- `similarityThreshold`: Lowered to `0.7` for better fuzzy matching
- Added temperature and token controls for AI

### 🔄 Migration Guide

#### From 1.x to 2.x

No breaking changes - your existing settings will be preserved. New settings will use sensible defaults:

- `batchSize`: 5
- `customPrompt`: Uses default Wikipedia-style prompt
- `useDictionaryAPI`: true
- `dictionaryAPIEndpoint`: DictionaryAPI.dev
- `handlePlurals`: true

Just update the plugin and your existing configuration will continue working!

### 📊 Performance Benchmarks

Example processing times (may vary based on API speed):

| Links | Batch Size 1 | Batch Size 5 | Batch Size 10 |
|-------|-------------|--------------|---------------|
| 10    | 45s         | 12s          | 8s            |
| 50    | 220s        | 55s          | 30s           |
| 100   | 440s        | 105s         | 58s           |

*Note: Times include API calls and file operations*

### 🎯 Future Roadmap

Planned features for future versions:

- [ ] Caching of AI responses
- [ ] Support for multiple languages
- [ ] Image generation for concepts
- [ ] Graph view integration
- [ ] Template system for note structure
- [ ] Bulk editing of generated notes
- [ ] Statistics dashboard

---

## [1.0.0] - Initial Release

### Features
- Basic wiki note generation
- AI-powered summaries
- Context extraction from vault
- Fuzzy matching for similar terms
- Configurable storage directory
- Run on startup/file switch options

### Initial Settings
- OpenAI API integration
- Custom directory support
- Similarity threshold
- Progress notifications

---

## Version History

- **2.0.0**: Major feature release with batch processing, dictionary API, and plural handling
- **1.0.0**: Initial release with core functionality

## Upgrade Instructions

### Automatic Upgrade
Simply replace the plugin files - settings are preserved.

### Manual Upgrade
1. Backup your `data.json` settings file
2. Replace `main.js` and `manifest.json`
3. Your settings will be automatically migrated

## Support & Issues

If you encounter any issues or have feature requests:
1. Check the README troubleshooting section
2. Review this changelog for known issues
3. Submit an issue on GitHub
4. Contact the author via the plugin page

---

**Note**: This plugin respects your privacy. All processing happens locally except for API calls to your configured AI service and optional dictionary API.
