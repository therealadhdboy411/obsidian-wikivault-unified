import { App, Plugin, PluginSettingTab, Setting, TFile, Notice, normalizePath } from 'obsidian';

interface WikiLinkGeneratorSettings {
    apiEndpoint: string;
    apiKey: string;
    model: string;
    temperature: number;
    autoGenerate: boolean;
    similarityThreshold: number;
}

const DEFAULT_SETTINGS: WikiLinkGeneratorSettings = {
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    autoGenerate: false,
    similarityThreshold: 0.9
}

interface WikiLinkContext {
    link: string;
    context: string;
    sourceFile: string;
}

export default class WikiLinkGeneratorPlugin extends Plugin {
    settings: WikiLinkGeneratorSettings;

    async onload() {
        await this.loadSettings();

        // Add ribbon icon
        this.addRibbonIcon('link', 'Generate WikiLink Notes', async () => {
            await this.generateAllMissingNotes();
        });

        // Add command
        this.addCommand({
            id: 'generate-wikilink-notes',
            name: 'Generate missing WikiLink notes',
            callback: async () => {
                await this.generateAllMissingNotes();
            }
        });

        // Add command to generate for current file
        this.addCommand({
            id: 'generate-wikilink-notes-current',
            name: 'Generate missing WikiLink notes from current file',
            callback: async () => {
                const activeFile = this.app.workspace.getActiveFile();
                if (activeFile) {
                    await this.generateMissingNotesFromFile(activeFile);
                } else {
                    new Notice('No active file');
                }
            }
        });

        this.addSettingTab(new WikiLinkGeneratorSettingTab(this.app, this));
    }

    onunload() {
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async generateAllMissingNotes() {
        new Notice('Scanning vault for missing wikilinks...');
        
        const files = this.app.vault.getMarkdownFiles();
        const allWikiLinks = new Map<string, WikiLinkContext[]>();

        // Scan all files for wikilinks
        for (const file of files) {
            const content = await this.app.vault.read(file);
            const links = this.extractWikiLinks(content, file.path);
            
            for (const link of links) {
                if (!allWikiLinks.has(link.link)) {
                    allWikiLinks.set(link.link, []);
                }
                allWikiLinks.get(link.link)?.push(link);
            }
        }

        // Find missing notes
        const missingLinks: string[] = [];
        for (const [linkName] of allWikiLinks) {
            const file = this.app.metadataCache.getFirstLinkpathDest(linkName, '');
            if (!file) {
                missingLinks.push(linkName);
            }
        }

        if (missingLinks.length === 0) {
            new Notice('No missing wikilinks found!');
            return;
        }

        new Notice(`Found ${missingLinks.length} missing wikilinks. Generating notes...`);

        // Generate notes for each missing link
        let generated = 0;
        for (const linkName of missingLinks) {
            try {
                const contexts = allWikiLinks.get(linkName) || [];
                await this.createNoteForWikiLink(linkName, contexts);
                generated++;
            } catch (error) {
                console.error(`Error generating note for ${linkName}:`, error);
            }
        }

        new Notice(`Generated ${generated} notes!`);
    }

    async generateMissingNotesFromFile(file: TFile) {
        const content = await this.app.vault.read(file);
        const links = this.extractWikiLinks(content, file.path);

        const missingLinks = [];
        for (const link of links) {
            const existingFile = this.app.metadataCache.getFirstLinkpathDest(link.link, '');
            if (!existingFile) {
                missingLinks.push(link);
            }
        }

        if (missingLinks.length === 0) {
            new Notice('No missing wikilinks in this file!');
            return;
        }

        new Notice(`Generating ${missingLinks.length} missing notes...`);

        const linkMap = new Map<string, WikiLinkContext[]>();
        for (const link of missingLinks) {
            if (!linkMap.has(link.link)) {
                linkMap.set(link.link, []);
            }
            linkMap.get(link.link)?.push(link);
        }

        for (const [linkName, contexts] of linkMap) {
            try {
                await this.createNoteForWikiLink(linkName, contexts);
            } catch (error) {
                console.error(`Error generating note for ${linkName}:`, error);
            }
        }

        new Notice(`Done!`);
    }

    extractWikiLinks(content: string, sourceFile: string): WikiLinkContext[] {
        const wikiLinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
        const links: WikiLinkContext[] = [];
        const lines = content.split('\n');

        let match;
        while ((match = wikiLinkRegex.exec(content)) !== null) {
            const linkName = match[1];
            const position = match.index;
            
            // Find which line this match is on
            let currentPos = 0;
            let lineIndex = 0;
            for (let i = 0; i < lines.length; i++) {
                if (currentPos + lines[i].length >= position) {
                    lineIndex = i;
                    break;
                }
                currentPos += lines[i].length + 1; // +1 for newline
            }

            // Extract context
            const context = this.extractContext(lines, lineIndex);

            links.push({
                link: linkName,
                context: context,
                sourceFile: sourceFile
            });
        }

        return links;
    }

    extractContext(lines: string[], lineIndex: number): string {
        const line = lines[lineIndex];
        
        // Check if it's a bullet point
        const bulletMatch = line.match(/^(\s*[-*+]|\s*\d+\.)\s/);
        
        if (bulletMatch) {
            // Extract bullet context
            return this.extractBulletContext(lines, lineIndex);
        } else {
            // Extract paragraph context
            return this.extractParagraphContext(lines, lineIndex);
        }
    }

    extractBulletContext(lines: string[], lineIndex: number): string {
        const currentLine = lines[lineIndex];
        const currentIndent = this.getIndentLevel(currentLine);
        const context: string[] = [];

        // Find the parent bullet (first bullet above with less indent)
        let parentIndex = lineIndex - 1;
        while (parentIndex >= 0) {
            const line = lines[parentIndex];
            if (line.trim() === '') {
                parentIndex--;
                continue;
            }
            const indent = this.getIndentLevel(line);
            if (indent < currentIndent && line.match(/^(\s*[-*+]|\s*\d+\.)\s/)) {
                context.unshift(line.trim());
                break;
            }
            parentIndex--;
        }

        // Add current bullet
        context.push(currentLine.trim());

        // Add sub-bullets
        let subIndex = lineIndex + 1;
        while (subIndex < lines.length) {
            const line = lines[subIndex];
            if (line.trim() === '') {
                subIndex++;
                continue;
            }
            const indent = this.getIndentLevel(line);
            if (indent > currentIndent) {
                context.push(line.trim());
                subIndex++;
            } else {
                break;
            }
        }

        return context.join('\n');
    }

    extractParagraphContext(lines: string[], lineIndex: number): string {
        const context: string[] = [];
        
        // Find start of paragraph
        let startIndex = lineIndex;
        while (startIndex > 0 && lines[startIndex - 1].trim() !== '') {
            startIndex--;
        }

        // Find end of paragraph
        let endIndex = lineIndex;
        while (endIndex < lines.length - 1 && lines[endIndex + 1].trim() !== '') {
            endIndex++;
        }

        // Collect paragraph
        for (let i = startIndex; i <= endIndex; i++) {
            context.push(lines[i]);
        }

        return context.join('\n');
    }

    getIndentLevel(line: string): number {
        const match = line.match(/^(\s*)/);
        return match ? match[1].length : 0;
    }

    async createNoteForWikiLink(linkName: string, contexts: WikiLinkContext[]) {
        // Check for similar existing notes
        const similarNote = await this.findSimilarNote(linkName);
        
        // Create note content
        let content = '';

        // Add "See also" link if similar note exists
        if (similarNote) {
            content += `> [!note] See also\n> [[${similarNote}]]\n\n`;
        }

        // Add references section
        content += '## References\n\n';
        
        // Group contexts by source file
        const contextsByFile = new Map<string, string[]>();
        for (const ctx of contexts) {
            if (!contextsByFile.has(ctx.sourceFile)) {
                contextsByFile.set(ctx.sourceFile, []);
            }
            contextsByFile.get(ctx.sourceFile)?.push(ctx.context);
        }

        // Add contexts
        for (const [sourceFile, ctxs] of contextsByFile) {
            const fileName = sourceFile.split('/').pop()?.replace('.md', '') || sourceFile;
            content += `### From [[${fileName}]]\n\n`;
            
            for (const ctx of ctxs) {
                content += `${ctx}\n\n`;
            }
        }

        // Generate AI summary if API key is configured
        if (this.settings.apiKey && this.settings.autoGenerate) {
            try {
                const summary = await this.generateAISummary(linkName, contexts);
                content = `# ${linkName}\n\n${summary}\n\n---\n\n${content}`;
            } catch (error) {
                console.error('Error generating AI summary:', error);
                content = `# ${linkName}\n\n${content}`;
            }
        } else {
            content = `# ${linkName}\n\n${content}`;
        }

        // Create the file
        const filePath = normalizePath(`${linkName}.md`);
        
        try {
            await this.app.vault.create(filePath, content);
            console.log(`Created note: ${filePath}`);
        } catch (error) {
            // If file creation fails (e.g., invalid characters), try sanitizing the filename
            const sanitizedPath = this.sanitizeFileName(linkName);
            await this.app.vault.create(sanitizedPath, content);
            console.log(`Created note: ${sanitizedPath}`);
        }
    }

    sanitizeFileName(name: string): string {
        // Remove invalid characters for file names
        let sanitized = name.replace(/[\\/:*?"<>|]/g, '-');
        sanitized = normalizePath(`${sanitized}.md`);
        return sanitized;
    }

    async findSimilarNote(linkName: string): Promise<string | null> {
        const files = this.app.vault.getMarkdownFiles();
        const threshold = this.settings.similarityThreshold;

        for (const file of files) {
            const fileName = file.basename;
            const similarity = this.calculateSimilarity(
                linkName.toLowerCase(), 
                fileName.toLowerCase()
            );

            if (similarity >= threshold && linkName.toLowerCase() !== fileName.toLowerCase()) {
                return fileName;
            }
        }

        return null;
    }

    calculateSimilarity(str1: string, str2: string): number {
        // Levenshtein distance based similarity
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) {
            return 1.0;
        }

        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    levenshteinDistance(str1: string, str2: string): number {
        const matrix: number[][] = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    async generateAISummary(linkName: string, contexts: WikiLinkContext[]): Promise<string> {
        const contextText = contexts.map(ctx => ctx.context).join('\n\n');
        
        const prompt = `Based on the following references to "${linkName}", provide a concise, Wikipedia-style definition or summary of what "${linkName}" is. Focus on being informative and encyclopedic.\n\nReferences:\n${contextText}\n\nProvide a clear, concise summary (2-4 sentences):`;

        const response = await fetch(this.settings.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.settings.apiKey}`
            },
            body: JSON.stringify({
                model: this.settings.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that creates concise, Wikipedia-style definitions based on context provided.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: this.settings.temperature,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }
}

class WikiLinkGeneratorSettingTab extends PluginSettingTab {
    plugin: WikiLinkGeneratorPlugin;

    constructor(app: App, plugin: WikiLinkGeneratorPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        containerEl.createEl('h2', {text: 'WikiLink Generator Settings'});

        new Setting(containerEl)
            .setName('API Endpoint')
            .setDesc('OpenAI-compatible API endpoint URL')
            .addText(text => text
                .setPlaceholder('https://api.openai.com/v1/chat/completions')
                .setValue(this.plugin.settings.apiEndpoint)
                .onChange(async (value) => {
                    this.plugin.settings.apiEndpoint = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('API Key')
            .setDesc('Your API key for the endpoint')
            .addText(text => text
                .setPlaceholder('sk-...')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                })
                .inputEl.type = 'password');

        new Setting(containerEl)
            .setName('Model')
            .setDesc('Model name to use (e.g., gpt-3.5-turbo, gpt-4)')
            .addText(text => text
                .setPlaceholder('gpt-3.5-turbo')
                .setValue(this.plugin.settings.model)
                .onChange(async (value) => {
                    this.plugin.settings.model = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Temperature')
            .setDesc('AI creativity (0.0-2.0, higher = more creative)')
            .addSlider(slider => slider
                .setLimits(0, 2, 0.1)
                .setValue(this.plugin.settings.temperature)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.temperature = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Auto-generate summaries')
            .setDesc('Automatically generate AI summaries when creating notes')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoGenerate)
                .onChange(async (value) => {
                    this.plugin.settings.autoGenerate = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Similarity threshold')
            .setDesc('Threshold for detecting similar note names (0.0-1.0, default 0.9 = 90%)')
            .addSlider(slider => slider
                .setLimits(0.5, 1, 0.05)
                .setValue(this.plugin.settings.similarityThreshold)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.similarityThreshold = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('h3', {text: 'Instructions'});
        containerEl.createEl('p', {text: 'Use the ribbon icon or command palette to generate missing wikilink notes.'});
        containerEl.createEl('p', {text: 'The plugin will scan your vault, find wikilinks without corresponding notes, and create them with context and optional AI summaries.'});
    }
}
