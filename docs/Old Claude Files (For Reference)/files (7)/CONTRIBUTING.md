# Contributing to Auto Wiki

Thank you for considering contributing to Auto Wiki! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Make your changes
4. Test your changes by building and loading in Obsidian:
   ```bash
   npm run dev
   ```

## Development Workflow

### Building

- `npm run dev` - Builds and watches for changes
- `npm run build` - Production build

### Testing

1. Create a test vault or use an existing one
2. Copy/symlink the plugin directory to `.obsidian/plugins/auto-wiki/`
3. Enable the plugin in Obsidian
4. Test your changes

### Code Structure

```
main.ts          # Main plugin logic
manifest.json    # Plugin metadata
package.json     # Dependencies and scripts
tsconfig.json    # TypeScript configuration
esbuild.config.mjs # Build configuration
```

## Pull Request Process

1. **Create a feature branch**: `git checkout -b feature/your-feature-name`
2. **Make your changes**: Follow the coding standards below
3. **Test thoroughly**: Ensure your changes work in various scenarios
4. **Update documentation**: Update README.md if needed
5. **Commit with clear messages**: Use descriptive commit messages
6. **Push and create PR**: Submit a pull request with a clear description

## Coding Standards

### TypeScript Style

- Use TypeScript strict mode
- Add type annotations for function parameters and return types
- Use interfaces for object shapes
- Avoid `any` type when possible

### Code Formatting

- Use tabs for indentation
- Use single quotes for strings
- Add semicolons
- Keep line length reasonable (< 120 chars)

### Naming Conventions

- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Use UPPER_CASE for constants
- Use descriptive names

### Comments

- Add JSDoc comments for public methods
- Explain "why" not "what" in comments
- Keep comments up to date

## Feature Requests

Feature requests are welcome! Please:

1. Check if the feature has already been requested
2. Open an issue with the "enhancement" label
3. Clearly describe the feature and its use case
4. Include examples if possible

## Bug Reports

When reporting bugs, please include:

1. Obsidian version
2. Plugin version
3. Steps to reproduce
4. Expected behavior
5. Actual behavior
6. Any error messages (check Developer Console: Ctrl+Shift+I)
7. Screenshots if applicable

## Code of Conduct

- Be respectful and constructive
- Welcome newcomers
- Focus on the issue, not the person
- Give credit where due

## Questions?

Feel free to:
- Open an issue for discussion
- Reach out via [your contact method]

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
