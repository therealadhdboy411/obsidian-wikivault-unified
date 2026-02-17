# Changelog

## [1.1.0] - 2024-02-14

### Added
- **LM Studio Native API Support**: Full integration with LM Studio's `/api/v1/chat` endpoint
- **API Provider Selection**: New dropdown to choose between OpenAI-compatible and LM Studio native APIs
- **Local AI Capabilities**: Run WikiVault completely offline using local models
- **Dynamic Settings UI**: Settings adapt based on selected API provider
- **Example Configurations**: Added example configs for LM Studio, Mistral, and OpenAI
- **Comprehensive Documentation**: New README-LMSTUDIO.md and MIGRATION.md guides

### Changed
- **Settings Interface**: Added API Provider dropdown at top of AI Configuration section
- **API Endpoint Field**: Description now changes based on selected provider
- **Model Name Field**: Placeholder text adapts to selected provider
- **API Key Field**: Now hidden when using LM Studio (not required for local servers)

### Technical Changes
- Split `getAISummary()` into provider-specific methods:
  - `getAISummaryOpenAI()`: Handles OpenAI-compatible endpoints
  - `getAISummaryLMStudio()`: Handles LM Studio native API
- Added `apiProvider` field to settings interface
- Updated endpoint URL construction for LM Studio
- Removed authentication headers for LM Studio requests

### Fixed
- Improved error handling for API requests
- Better endpoint URL normalization

### Backward Compatibility
- ✅ Fully backward compatible with existing configurations
- ✅ Existing `data.json` files work without modification
- ✅ Defaults to OpenAI-compatible mode for existing installations
- ✅ All existing settings preserved during upgrade

---

## [1.0.0] - Original Release

### Features
- Automatic generation of notes for unresolved wikilinks
- Context extraction from existing notes
- AI-powered summaries using OpenAI-compatible APIs
- Fuzzy matching for similar note names
- Customizable storage directory
- Configurable triggers (startup, file switch)
- Progress notifications
- Similarity threshold adjustment
