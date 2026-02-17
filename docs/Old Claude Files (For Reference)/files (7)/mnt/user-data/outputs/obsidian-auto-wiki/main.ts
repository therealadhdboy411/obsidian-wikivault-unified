import { App, Plugin, PluginSettingTab, Setting, Notice, TFile, TFolder } from 'obsidian';

interface AutoWikiSettings {
    aiEnabled: boolean;
    aiEndpoint: string;
    aiApiKey: string;
    aiModel: string;
    similarityThreshold: number;
    autoProcess: boolean;
}

const DEFAULT_SETTINGS: AutoWikiSettings = {
    aiEnabled: false,
    aiEndpoint: 'https://api.openai.com/v1/chat/completions',
    aiApiKey: '',
    aiModel: 'gpt-3.5-turbo',
    similarityThreshold: 0.9,
    autoProcess: false
}

export default class AutoWikiPlugin extends Plugin {
    settings: AutoWikiSettings;

    async onload() {
        await this.loadSettings();

        // Add ribbon icon
        this.addRibbonIcon('link', 'Generate Wiki Links', async () => {
            await this.processVault();
        });

        // Add command
        this.addCommand({
            id: 'process-vault',
            name: 'Process vault and generate wiki pages',
            callback: async () => {
                await this.processVault();
            }
        });

        // Add settings tab
        this.addSettingTab(new AutoWikiSettingTab(this.app, this));

        console.log('Auto Wiki Plugin loaded');
    }

    async processVault() {
        new Notice('Processing vault for wikilinks...');
        
        const files = this.app.vault.getMarkdownFiles();
        const wikilinks: Map<string, Array<{file: TFile, context: string}>> = new Map();
        const existingNotes = new Set(files.map(f => this.normalizeFileName(f.basename)));

        // First pass: collect all wikilinks and their contexts
        for (const file of files) {
            const content = await this.app.vault.read(file);
            await this.extractWikilinks(content, file, wikilinks);
        }

        // Second pass: find missing notes and similar notes
        const missingLinks: Map<string, Array<{file: TFile, context: string}>> = new Map();
        const similarLinks: Map<string, string> = new Map();

        for (const [link, sources] of wikilinks) {
            const normalizedLink = this.normalizeFileName(link);
            
            if (!existingNotes.has(normalizedLink)) {
                // Check for similar existing notes
                const similar = this.findSimilarNote(normalizedLink, existingNotes);
                
                if (similar) {
                    similarLinks.set(link, similar);
                } else {
                    missingLinks.set(link, sources);
                }
            }
        }

        // Create missing notes
        let created = 0;
        for (const [link, sources] of missingLinks) {
            await this.createWikiNote(link, sources);
            created++;
        }

        // Update notes with similar links
        let updated = 0;
        for (const [link, similar] of similarLinks) {
            const sources = wikilinks.get(link) || [];
            await this.createWikiNoteWithSeeAlso(link, similar, sources);
            updated++;
        }

        new Notice(`Created ${created} new wiki pages, added ${updated} "See" references`);
    }

    async extractWikilinks(
        content: string, 
        file: TFile, 
        wikilinks: Map<string, Array<{file: TFile, context: string}>>
    ) {
        // Match [[wikilinks]]
        const wikilinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
        let match;

        while ((match = wikilinkRegex.exec(content)) !== null) {
            const link = match[1].trim();
            const position = match.index;
            
            // Extract context
            const context = this.extractContext(content, position);

            if (!wikilinks.has(link)) {
                wikilinks.set(link, []);
            }
            wikilinks.get(link)!.push({ file, context });
        }
    }

    extractContext(content: string, position: number): string {
        const lines = content.split('\n');
        let currentPos = 0;
        let lineIndex = 0;

        // Find which line contains the wikilink
        for (let i = 0; i < lines.length; i++) {
            if (currentPos + lines[i].length >= position) {
                lineIndex = i;
                break;
            }
            currentPos += lines[i].length + 1; // +1 for newline
        }

        const line = lines[lineIndex];

        // Check if it's a bullet point
        if (line.trim().match(/^[-*+]\s/)) {
            return this.extractBulletContext(lines, lineIndex);
        } else {
            return this.extractParagraphContext(lines, lineIndex);
        }
    }

    extractBulletContext(lines: string[], lineIndex: number): string {
        const currentLine = lines[lineIndex];
        const currentIndent = currentLine.search(/\S/);
        let context = currentLine + '\n';

        // Find parent bullet (if exists)
        for (let i = lineIndex - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const indent = lines[i].search(/\S/);
            if (line.match(/^[-*+]\s/) && indent < currentIndent) {
                context = lines[i] + '\n' + context;
                break;
            }
        }

        // Add sub-bullets
        for (let i = lineIndex + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) break;
            
            const indent = lines[i].search(/\S/);
            if (line.match(/^[-*+]\s/) && indent > currentIndent) {
                context += lines[i] + '\n';
            } else if (line.match(/^[-*+]\s/)) {
                break;
            }
        }

        return context;
    }

    extractParagraphContext(lines: string[], lineIndex: number): string {
        let start = lineIndex;
        let end = lineIndex;

        // Find paragraph start
        for (let i = lineIndex - 1; i >= 0; i--) {
            if (lines[i].trim() === '') {
                break;
            }
            start = i;
        }

        // Find paragraph end
        for (let i = lineIndex + 1; i < lines.length; i++) {
            if (lines[i].trim() === '') {
                break;
            }
            end = i;
        }

        return lines.slice(start, end + 1).join('\n');
    }

    async createWikiNote(link: string, sources: Array<{file: TFile, context: string}>) {
        let content = `# ${link}\n\n`;
        
        // Add backlinks and contexts
        content += '## References\n\n';
        for (const source of sources) {
            const linkToSource = `[[${source.file.basename}]]`;
            content += `From ${linkToSource}:\n\n`;
            content += '> ' + source.context.split('\n').join('\n> ') + '\n\n';
        }

        // Add AI summary if enabled
        if (this.settings.aiEnabled && this.settings.aiApiKey) {
            try {
                const summary = await this.generateAISummary(link, sources);
                content = `# ${link}\n\n${summary}\n\n` + content;
            } catch (error) {
                console.error('Failed to generate AI summary:', error);
            }
        }

        const fileName = `${link}.md`;
        const file = await this.app.vault.create(fileName, content);
        console.log(`Created wiki page: ${fileName}`);
    }

    async createWikiNoteWithSeeAlso(
        link: string, 
        seeAlsoLink: string, 
        sources: Array<{file: TFile, context: string}>
    ) {
        let content = `# ${link}\n\n`;
        content += `> **See:** [[${seeAlsoLink}]]\n\n`;
        
        content += '## References\n\n';
        for (const source of sources) {
            const linkToSource = `[[${source.file.basename}]]`;
            content += `From ${linkToSource}:\n\n`;
            content += '> ' + source.context.split('\n').join('\n> ') + '\n\n';
        }

        const fileName = `${link}.md`;
        await this.app.vault.create(fileName, content);
        console.log(`Created wiki page with "See" reference: ${fileName}`);
    }

    async generateAISummary(
        term: string, 
        sources: Array<{file: TFile, context: string}>
    ): Promise<string> {
        const contextsText = sources.map(s => s.context).join('\n\n');
        
        const prompt = `Based on the following contexts where "${term}" is mentioned, provide a concise definition or explanation of what "${term}" means:

${contextsText}

Provide a clear, 2-3 sentence summary that defines or explains this concept.`;

        const response = await fetch(this.settings.aiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.settings.aiApiKey}`
            },
            body: JSON.stringify({
                model: this.settings.aiModel,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that creates concise, accurate definitions and explanations.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 200
            })
        });

        if (!response.ok) {
            throw new Error(`AI API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        const summary = data.choices[0].message.content.trim();
        
        return `## Summary\n\n${summary}\n`;
    }

    normalizeFileName(name: string): string {
        return name.toLowerCase().trim();
    }

    findSimilarNote(target: string, existing: Set<string>): string | null {
        const targetNorm = this.normalizeFileName(target);
        
        for (const note of existing) {
            const noteNorm = this.normalizeFileName(note);
            const similarity = this.calculateSimilarity(targetNorm, noteNorm);
            
            if (similarity >= this.settings.similarityThreshold && targetNorm !== noteNorm) {
                return note;
            }
        }
        
        return null;
    }

    calculateSimilarity(str1: string, str2: string): number {
        // Levenshtein distance based similarity
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
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

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class AutoWikiSettingTab extends PluginSettingTab {
    plugin: AutoWikiPlugin;

    constructor(app: App, plugin: AutoWikiPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Auto Wiki Settings' });

        new Setting(containerEl)
            .setName('Enable AI summaries')
            .setDesc('Use AI to generate automatic summaries for wiki pages')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.aiEnabled)
                .onChange(async (value) => {
                    this.plugin.settings.aiEnabled = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('AI endpoint')
            .setDesc('OpenAI-compatible API endpoint (e.g., https://api.openai.com/v1/chat/completions)')
            .addText(text => text
                .setPlaceholder('Enter API endpoint')
                .setValue(this.plugin.settings.aiEndpoint)
                .onChange(async (value) => {
                    this.plugin.settings.aiEndpoint = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('API key')
            .setDesc('Your API key for the AI service')
            .addText(text => {
                text.setPlaceholder('Enter API key')
                    .setValue(this.plugin.settings.aiApiKey)
                    .onChange(async (value) => {
                        this.plugin.settings.aiApiKey = value;
                        await this.plugin.saveSettings();
                    });
                text.inputEl.type = 'password';
            });

        new Setting(containerEl)
            .setName('AI model')
            .setDesc('Model name to use (e.g., gpt-3.5-turbo, gpt-4)')
            .addText(text => text
                .setPlaceholder('Enter model name')
                .setValue(this.plugin.settings.aiModel)
                .onChange(async (value) => {
                    this.plugin.settings.aiModel = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Similarity threshold')
            .setDesc('Threshold for detecting similar notes (0.0 - 1.0, default 0.9)')
            .addSlider(slider => slider
                .setLimits(0.7, 1.0, 0.05)
                .setValue(this.plugin.settings.similarityThreshold)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.similarityThreshold = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('h3', { text: 'About' });
        containerEl.createEl('p', { 
            text: 'This plugin automatically creates wiki-style pages for missing wikilinks in your vault. It collects context from where links are mentioned and optionally uses AI to generate summaries.' 
        });
    }
}
