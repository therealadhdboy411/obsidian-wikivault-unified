# WikiVault Unified - Implementation Guide

## 🎯 Architecture Overview

**WikiVault Unified** merges two plugins into one cohesive system:

```
WikiVault Unified
├── Virtual Link Rendering (from Virtual Linker)
│   ├── Reading Mode Processor
│   ├── Live Editor Extension
│   ├── Smart Multi-Word Matcher
│   └── Term Index/Cache
│
├── Wiki Note Generation (from WikiVault)
│   ├── Context Extractor
│   ├── AI Integration
│   ├── Wikipedia/Dictionary APIs
│   └── Note Builder
│
└── New Features
    ├── Category System
    ├── File Type Filtering
    └── Unified Settings Panel
```

---

## 📁 File Structure

```
.obsidian/plugins/wikivault-unified/
├── main.ts                    // Main plugin class
├── manifest.json              // Plugin metadata
├── data.json                  // User settings
├── styles.css                 // Virtual link styling
│
├── linker/
│   ├── linkerCache.ts        // Term index/cache (from VL)
│   ├── readModeLinker.ts     // Reading mode rendering (from VL)
│   ├── liveLinker.ts         // Live editor extension (from VL)
│   └── virtualLinkDom.ts     // DOM manipulation (from VL)
│
├── generator/
│   ├── noteGenerator.ts      // Wiki note builder (from WV)
│   ├── contextExtractor.ts   // Mention collector (from WV)
│   ├── aiIntegration.ts      // AI/Wikipedia/Dict (from WV)
│   └── categoryManager.ts    // NEW: Category logic
│
└── utils/
    ├── fileFilter.ts          // NEW: File type filtering
    ├── pluralization.ts       // Singular/plural handling
    └── termMatcher.ts         // Smart multi-word matching
```

---

## 🔧 Key Components

### 1. Main Plugin Class

```typescript
export default class WikiVaultUnified extends Plugin {
    settings: WikiVaultSettings;
    linkerCache: LinkerCache;
    categoryManager: CategoryManager;
    
    async onload() {
        await this.loadSettings();
        
        // Initialize components
        this.linkerCache = new LinkerCache(this.app, this.settings);
        this.categoryManager = new CategoryManager(this.settings);
        
        // Register virtual link rendering (from Virtual Linker)
        if (this.settings.virtualLinksEnabled) {
            this.registerMarkdownPostProcessor((element, context) => {
                context.addChild(new GlossaryLinker(
                    this.app, 
                    this.settings, 
                    context, 
                    element,
                    this.linkerCache
                ));
            });
            
            this.registerEditorExtension(
                liveLinkerPlugin(this.app, this.settings, this.linkerCache)
            );
        }
        
        // Add ribbon icon for wiki generation (from WikiVault)
        this.addRibbonIcon("book-open", "Generate Wiki Notes", () => {
            this.generateWikiNotes();
        });
        
        // Add commands
        this.addCommand({
            id: "generate-wiki-notes",
            name: "Generate missing Wiki notes",
            callback: () => this.generateWikiNotes()
        });
        
        this.addCommand({
            id: "toggle-virtual-links",
            name: "Toggle Virtual Links",
            callback: () => this.toggleVirtualLinks()
        });
        
        // Settings tab
        this.addSettingTab(new WikiVaultSettingTab(this.app, this));
    }
    
    async generateWikiNotes() {
        const generator = new NoteGenerator(
            this.app,
            this.settings,
            this.linkerCache,
            this.categoryManager
        );
        
        await generator.generateAll();
    }
    
    async toggleVirtualLinks() {
        this.settings.virtualLinksEnabled = !this.settings.virtualLinksEnabled;
        await this.saveSettings();
        // Trigger re-render
        this.app.workspace.updateOptions();
    }
}
```

### 2. Term Index/Cache (from Virtual Linker)

```typescript
export class LinkerCache {
    private termIndex: Map<string, TFile[]>;
    private app: App;
    private settings: WikiVaultSettings;
    
    constructor(app: App, settings: WikiVaultSettings) {
        this.app = app;
        this.settings = settings;
        this.termIndex = new Map();
        this.buildIndex();
    }
    
    buildIndex() {
        this.termIndex.clear();
        
        for (const file of this.app.vault.getMarkdownFiles()) {
            // Skip if file type is excluded
            if (this.isFileTypeExcluded(file)) continue;
            
            // Index basename
            this.indexTerm(file.basename, file);
            
            // Index aliases
            const metadata = this.app.metadataCache.getFileCache(file);
            const aliases = metadata?.frontmatter?.aliases || [];
            for (const alias of aliases) {
                this.indexTerm(alias, file);
            }
            
            // Index variations (singular/plural)
            const singular = getSingularForm(file.basename);
            const plural = getPluralForm(file.basename);
            if (singular) this.indexTerm(singular, file);
            if (plural) this.indexTerm(plural, file);
        }
    }
    
    private indexTerm(term: string, file: TFile) {
        const key = this.settings.caseSensitiveMatching 
            ? term 
            : term.toLowerCase();
            
        if (!this.termIndex.has(key)) {
            this.termIndex.set(key, []);
        }
        this.termIndex.get(key).push(file);
    }
    
    private isFileTypeExcluded(file: TFile): boolean {
        const ext = file.extension.toLowerCase();
        return this.settings.excludedFileTypes.includes(ext);
    }
    
    findMatches(text: string): Match[] {
        const words = text.split(/\s+/);
        const matches: Match[] = [];
        
        // Check multi-word combinations (3, 2, 1 words)
        for (let wordCount = this.settings.maxWordsToMatch; wordCount >= 1; wordCount--) {
            for (let i = 0; i <= words.length - wordCount; i++) {
                const phrase = words.slice(i, i + wordCount).join(' ');
                const key = this.settings.caseSensitiveMatching 
                    ? phrase 
                    : phrase.toLowerCase();
                    
                const files = this.termIndex.get(key);
                if (files && files.length > 0) {
                    matches.push({
                        text: phrase,
                        startWord: i,
                        endWord: i + wordCount,
                        files: files,
                        wordCount: wordCount
                    });
                }
            }
        }
        
        return this.preferLongerMatches(matches);
    }
    
    private preferLongerMatches(matches: Match[]): Match[] {
        // Sort by word count (longer first)
        matches.sort((a, b) => b.wordCount - a.wordCount);
        
        const selected: Match[] = [];
        const usedPositions = new Set<number>();
        
        for (const match of matches) {
            // Check for overlap
            let hasOverlap = false;
            for (let i = match.startWord; i < match.endWord; i++) {
                if (usedPositions.has(i)) {
                    hasOverlap = true;
                    break;
                }
            }
            
            if (!hasOverlap) {
                selected.push(match);
                for (let i = match.startWord; i < match.endWord; i++) {
                    usedPositions.add(i);
                }
            }
        }
        
        return selected;
    }
}
```

### 3. Category Manager (NEW)

```typescript
export class CategoryManager {
    private settings: WikiVaultSettings;
    
    constructor(settings: WikiVaultSettings) {
        this.settings = settings;
    }
    
    assignCategory(file: TFile, term: string): Category {
        if (!this.settings.useCategories) {
            return this.getDefaultCategory();
        }
        
        const metadata = this.app.metadataCache.getFileCache(file);
        const tags = getAllTags(metadata) || [];
        
        // Try to match by source folder
        for (const category of this.settings.categories) {
            if (!category.enabled) continue;
            
            if (category.sourceFolder && 
                file.path.startsWith(category.sourceFolder)) {
                return category;
            }
        }
        
        // Try to match by tags
        for (const category of this.settings.categories) {
            if (!category.enabled) continue;
            
            for (const tag of tags) {
                if (category.tags.includes(tag.replace('#', ''))) {
                    return category;
                }
            }
        }
        
        // Default category
        return this.getDefaultCategory();
    }
    
    getDefaultCategory(): Category {
        const defaultName = this.settings.defaultCategory;
        return this.settings.categories.find(c => c.name === defaultName)
            || this.settings.categories[0];
    }
    
    getWikiPath(category: Category, fileName: string): string {
        return `${category.path}/${fileName}.md`;
    }
}
```

### 4. Note Generator (from WikiVault + NEW features)

```typescript
export class NoteGenerator {
    private app: App;
    private settings: WikiVaultSettings;
    private linkerCache: LinkerCache;
    private categoryManager: CategoryManager;
    
    constructor(
        app: App, 
        settings: WikiVaultSettings,
        linkerCache: LinkerCache,
        categoryManager: CategoryManager
    ) {
        this.app = app;
        this.settings = settings;
        this.linkerCache = linkerCache;
        this.categoryManager = categoryManager;
    }
    
    async generateAll() {
        const unresolvedLinks = this.app.metadataCache.unresolvedLinks;
        const terms = new Set<string>();
        
        // Collect all unresolved links
        for (const sourcePath in unresolvedLinks) {
            for (const linkName in unresolvedLinks[sourcePath]) {
                terms.add(linkName);
            }
        }
        
        // Process each term
        for (const term of terms) {
            await this.generateNote(term);
        }
    }
    
    async generateNote(term: string) {
        // Extract all mentions (wikilinked + virtual)
        const contextData = await this.extractContext(term);
        
        // Determine category based on source files
        const category = this.determineCategory(contextData.sourceFiles);
        
        // Ensure category folder exists
        await this.ensureFolderExists(category.path);
        
        // Build note content
        const content = await this.buildNoteContent(
            term, 
            category,
            contextData
        );
        
        // Write to file
        const filePath = this.categoryManager.getWikiPath(category, term);
        await this.writeNote(filePath, content);
    }
    
    private async extractContext(term: string): Promise<ContextData> {
        const mentions: Mention[] = [];
        const sourceFiles: TFile[] = [];
        
        for (const file of this.app.vault.getMarkdownFiles()) {
            // Skip if file type excluded
            if (this.isFileTypeExcluded(file)) continue;
            
            // Skip wiki folder itself
            if (file.path.startsWith(this.settings.customDirectoryName)) continue;
            
            const content = await this.app.vault.read(file);
            const lines = content.split('\n');
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // Check for wikilinks
                if (line.includes(`[[${term}]]`) || line.includes(`[[${term}|`)) {
                    mentions.push({
                        file: file,
                        line: line,
                        lineNumber: i,
                        type: 'wikilinked'
                    });
                    sourceFiles.push(file);
                }
                
                // Check for virtual matches
                const matches = this.linkerCache.findMatches(line);
                for (const match of matches) {
                    if (match.files.some(f => f.basename === term)) {
                        mentions.push({
                            file: file,
                            line: line,
                            lineNumber: i,
                            type: 'virtual',
                            matchText: match.text,
                            alternatives: match.files.map(f => f.basename)
                        });
                        sourceFiles.push(file);
                    }
                }
            }
        }
        
        return { mentions, sourceFiles };
    }
    
    private determineCategory(sourceFiles: TFile[]): Category {
        // Vote: most common category among source files
        const categoryVotes = new Map<string, number>();
        
        for (const file of sourceFiles) {
            const category = this.categoryManager.assignCategory(file, '');
            const count = categoryVotes.get(category.name) || 0;
            categoryVotes.set(category.name, count + 1);
        }
        
        // Return category with most votes
        let maxVotes = 0;
        let selectedCategory = this.categoryManager.getDefaultCategory();
        
        for (const [categoryName, votes] of categoryVotes) {
            if (votes > maxVotes) {
                maxVotes = votes;
                selectedCategory = this.settings.categories.find(
                    c => c.name === categoryName
                );
            }
        }
        
        return selectedCategory;
    }
    
    private async buildNoteContent(
        term: string,
        category: Category,
        contextData: ContextData
    ): Promise<string> {
        let content = "";
        
        // Frontmatter
        content += "---\n";
        content += `generated: ${new Date().toISOString()}\n`;
        content += `category: ${category.name}\n`;
        
        if (this.settings.trackModel) {
            content += `model: ${this.settings.modelName}\n`;
            content += `provider: ${this.settings.provider}\n`;
        }
        
        // Tags
        const tags = await this.generateTags(term, contextData);
        if (tags.length > 0) {
            content += "tags:\n";
            for (const tag of tags) {
                content += `  - ${tag}\n`;
            }
        }
        
        content += "---\n\n";
        
        // Title
        content += `# ${term}\n\n`;
        
        // Wikipedia
        if (this.settings.useWikipedia) {
            const wikiData = await this.getWikipediaData(term);
            if (wikiData) {
                content += `## Wikipedia\n\n`;
                content += `[Read more](${wikiData.url})\n\n`;
                content += `${wikiData.extract}\n\n`;
            }
        }
        
        // Dictionary
        if (this.settings.useDictionaryAPI) {
            const dictData = await this.getDictionaryData(term);
            if (dictData) {
                content += `## Dictionary\n\n${dictData}\n\n`;
            }
        }
        
        // AI Summary
        const summary = await this.getAISummary(term, contextData);
        if (summary) {
            content += `## AI Summary\n\n> ${summary}\n\n`;
        }
        
        // Related Concepts
        if (this.settings.generateRelatedConcepts) {
            const related = await this.getRelatedConcepts(term, contextData);
            if (related.length > 0) {
                content += `## Related Concepts\n\n`;
                for (const concept of related) {
                    content += `- [[${concept}]]\n`;
                }
                content += "\n";
            }
        }
        
        // Mentions
        content += `## Mentions\n\n`;
        for (const mention of contextData.mentions) {
            content += this.formatMention(mention);
        }
        
        return content;
    }
    
    private formatMention(mention: Mention): string {
        let output = `### From [[${mention.file.basename}]]`;
        
        if (mention.type === 'virtual') {
            output += ` [virtual link]\n\n`;
            output += `**Detected:** "${mention.matchText}"\n`;
            if (mention.alternatives && mention.alternatives.length > 1) {
                output += `**Alternatives:** `;
                output += mention.alternatives.map(a => `[[${a}]]`).join(', ');
                output += `\n`;
            }
        } else {
            output += ` [wikilinked]\n`;
        }
        
        output += `\n> ${mention.line}\n\n`;
        
        return output;
    }
    
    private isFileTypeExcluded(file: TFile): boolean {
        const ext = file.extension.toLowerCase();
        return this.settings.excludedFileTypes.includes(ext);
    }
}
```

---

## 🎨 Virtual Link Rendering

### Reading Mode Processor

```typescript
export class GlossaryLinker extends MarkdownRenderChild {
    private app: App;
    private settings: WikiVaultSettings;
    private linkerCache: LinkerCache;
    private element: HTMLElement;
    
    constructor(
        app: App,
        settings: WikiVaultSettings,
        context: MarkdownPostProcessorContext,
        element: HTMLElement,
        linkerCache: LinkerCache
    ) {
        super(element);
        this.app = app;
        this.settings = settings;
        this.element = element;
        this.linkerCache = linkerCache;
    }
    
    onload() {
        if (!this.settings.virtualLinksEnabled) return;
        
        // Process all text nodes
        const walker = document.createTreeWalker(
            this.element,
            NodeFilter.SHOW_TEXT,
            null
        );
        
        const textNodes: Text[] = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node as Text);
        }
        
        for (const textNode of textNodes) {
            this.processTextNode(textNode);
        }
    }
    
    private processTextNode(textNode: Text) {
        const text = textNode.textContent;
        const matches = this.linkerCache.findMatches(text);
        
        if (matches.length === 0) return;
        
        // Replace text with links
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        
        for (const match of matches) {
            // Add text before match
            if (match.startIndex > lastIndex) {
                fragment.appendText(text.substring(lastIndex, match.startIndex));
            }
            
            // Add link
            const link = this.createVirtualLink(match);
            fragment.appendChild(link);
            
            lastIndex = match.endIndex;
        }
        
        // Add remaining text
        if (lastIndex < text.length) {
            fragment.appendText(text.substring(lastIndex));
        }
        
        // Replace text node
        textNode.replaceWith(fragment);
    }
    
    private createVirtualLink(match: Match): HTMLElement {
        const span = document.createElement('span');
        span.className = 'virtual-link glossary-entry';
        
        const link = document.createElement('a');
        link.className = 'internal-link';
        link.textContent = match.text;
        
        // Handle click
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (match.files.length === 1) {
                this.app.workspace.openLinkText(match.files[0].path, '', false);
            } else {
                this.showFileMenu(match, e);
            }
        });
        
        // Add suffix
        if (this.settings.virtualLinkSuffix) {
            const suffix = document.createElement('span');
            suffix.className = 'linker-suffix-icon';
            suffix.textContent = this.settings.virtualLinkSuffix;
            link.appendChild(suffix);
        }
        
        span.appendChild(link);
        return span;
    }
    
    private showFileMenu(match: Match, event: MouseEvent) {
        const menu = new Menu();
        
        for (const file of match.files) {
            menu.addItem((item) => {
                item.setTitle(file.basename);
                item.onClick(() => {
                    this.app.workspace.openLinkText(file.path, '', false);
                });
            });
        }
        
        menu.showAtMouseEvent(event);
    }
}
```

### Live Editor Extension (CodeMirror 6)

```typescript
import { EditorView, Decoration, ViewPlugin, ViewUpdate } from "@codemirror/view";

export function liveLinkerPlugin(
    app: App,
    settings: WikiVaultSettings,
    linkerCache: LinkerCache
) {
    return ViewPlugin.fromClass(
        class {
            decorations: DecorationSet;
            
            constructor(view: EditorView) {
                this.decorations = this.buildDecorations(view);
            }
            
            update(update: ViewUpdate) {
                if (update.docChanged || update.viewportChanged) {
                    this.decorations = this.buildDecorations(update.view);
                }
            }
            
            buildDecorations(view: EditorView): DecorationSet {
                const builder = new RangeSetBuilder<Decoration>();
                
                for (let { from, to } of view.visibleRanges) {
                    const text = view.state.doc.sliceString(from, to);
                    const matches = linkerCache.findMatches(text);
                    
                    for (const match of matches) {
                        const decoration = Decoration.mark({
                            class: "virtual-link",
                            // Add click handling, hover, etc.
                        });
                        
                        builder.add(from + match.startIndex, from + match.endIndex, decoration);
                    }
                }
                
                return builder.finish();
            }
        },
        {
            decorations: v => v.decorations
        }
    );
}
```

---

## 📝 Implementation Checklist

### Phase 1: Core Integration
- [ ] Copy Virtual Linker's linkerCache.ts
- [ ] Copy Virtual Linker's readModeLinker.ts
- [ ] Copy Virtual Linker's liveLinker.ts
- [ ] Copy WikiVault's note generation logic
- [ ] Merge settings interfaces
- [ ] Create unified main plugin class

### Phase 2: Category System
- [ ] Implement CategoryManager
- [ ] Add category assignment logic
- [ ] Add folder structure creation
- [ ] Update note generator to use categories
- [ ] Add category settings UI

### Phase 3: File Filtering
- [ ] Add excluded file types check in cache
- [ ] Add excluded file types check in generator
- [ ] Add file filter settings UI
- [ ] Test with images, PDFs, etc.

### Phase 4: Virtual Link Rendering
- [ ] Test reading mode links
- [ ] Test live editor links
- [ ] Add hover popup for alternatives
- [ ] Add custom styling
- [ ] Test link clicking

### Phase 5: Polish
- [ ] Add progress indicators
- [ ] Add error handling
- [ ] Add logging
- [ ] Write user documentation
- [ ] Test all features together

---

## 🚀 Deployment

### Files to Include

```
wikivault-unified/
├── main.js (compiled TypeScript)
├── manifest.json
├── data.json (default settings)
├── styles.css
└── README.md
```

### Installation

1. Copy folder to `.obsidian/plugins/wikivault-unified/`
2. Enable in Community Plugins
3. Configure categories in settings
4. Test with sample notes

---

## ✅ Success Criteria

**Virtual Links:**
- ✅ Links appear as you type
- ✅ Links prefer longer matches
- ✅ Hover shows alternatives
- ✅ Click opens note
- ✅ No file modification

**Note Generation:**
- ✅ Collects wikilinked mentions
- ✅ Collects virtual mentions
- ✅ Assigns correct category
- ✅ Excludes filtered file types
- ✅ Generates comprehensive notes

**One Plugin:**
- ✅ Single install
- ✅ Unified settings
- ✅ Seamless experience

Perfect! 🎉
