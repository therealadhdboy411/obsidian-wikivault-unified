import { App, TFile, TFolder, normalizePath } from 'obsidian';
import { ContextExtractor, ContextData, Mention } from './contextExtractor';

const DEFAULT_TEMPLATE = "---\ngenerated: {{date}}\ncategory: {{category}}\nmentions_count: {{mentions_count}}\n---\n\n# {{title}}\n\n{{wikipedia}}\n\n## AI Summary\n\n{{summary}}\n\n## Mentions\n\n{{mentions}}";
import { AIIntegration } from './aiIntegration';
import { CategoryManager, Category } from './categoryManager';
import { LinkerCache } from '../linker/linkerCache';

export class NoteGenerator {
    private app: App;
    private settings: any;
    private extractor: ContextExtractor;
    private ai: AIIntegration;
    private categoryManager: CategoryManager;

    constructor(app: App, settings: any, linkerCache: LinkerCache) {
        this.app = app;
        this.settings = settings;
        this.extractor = new ContextExtractor(app, settings, linkerCache);
        this.ai = new AIIntegration(settings);
        this.categoryManager = new CategoryManager(app, settings);
    }

    async generateAll() {
        const contextMap = await this.extractor.buildGlobalContextMap();

        for (const [term, contextData] of contextMap) {
            if (this.settings.excludePatterns && this.settings.excludePatterns.length > 0) {
                if (this.settings.excludePatterns.some((p: string) => term.includes(p))) continue;
            }

            if (contextData.mentions.length === 0 && !this.settings.createEmptyNotes) {
                continue;
            }

            const category = this.categoryManager.getDefaultCategory();
            await this.ensureFolderExists(category.path);

            const content = await this.buildNoteContent(term, category, contextData);
            const filePath = this.categoryManager.getWikiPath(category, term);

            await this.writeNote(filePath, content);
        }
    }

    async generateForFile(file: TFile) {
        const unresolvedLinks = this.app.metadataCache.unresolvedLinks;
        const linksInFile = unresolvedLinks[file.path];

        if (!linksInFile) return;

        for (const linkName in linksInFile) {
            await this.generateNote(linkName);
        }
    }

    async generateNote(term: string) {
        if (this.settings.excludePatterns && this.settings.excludePatterns.length > 0) {
            for (const pattern of this.settings.excludePatterns) {
                if (term.includes(pattern)) {
                    return;
                }
            }
        }

        const contextData = await this.extractor.extractContext(term);
        if (contextData.mentions.length === 0 && !this.settings.createEmptyNotes) {
            return;
        }

        // Determine category (voting or default)
        const category = this.categoryManager.getDefaultCategory(); // Simplified for now

        await this.ensureFolderExists(category.path);

        const content = await this.buildNoteContent(term, category, contextData);
        const filePath = this.categoryManager.getWikiPath(category, term);

        await this.writeNote(filePath, content);
    }

    private async ensureFolderExists(path: string) {
        const folder = this.app.vault.getAbstractFileByPath(path);
        if (!folder || !(folder instanceof TFolder)) {
            await this.app.vault.createFolder(path);
        }
    }

    private async buildNoteContent(term: string, category: Category, contextData: ContextData): Promise<string> {
        let wikipediaContent = "";
        if (this.settings.useWikipedia) {
            const wikiData = await this.ai.getWikipediaData(term);
            if (wikiData) {
                wikipediaContent = `## Wikipedia\n\n[Read more](${wikiData.url})\n\n> ${wikiData.extract}\n\n`;
            }
        }

        let aiSummary = "";
        try {
            const contextString = contextData.mentions.map(m => m.context).join('\n\n').slice(0, 4000);
            aiSummary = await this.ai.getAISummary(term, contextString);
        } catch (e) {
            aiSummary = `Failed to generate summary: ${e.message}`;
        }

        let mentionsContent = "";
        for (const mention of contextData.mentions) {
            mentionsContent += `### From [[${mention.file.basename}]]\n`;
            if (mention.heading) mentionsContent += `Section: ${mention.heading}\n`;
            mentionsContent += `\n> ${mention.line}\n\n`;
        }

        const template = this.settings.noteTemplate || DEFAULT_TEMPLATE;
        let content = template
            .replace(/{{title}}/g, term)
            .replace(/{{summary}}/g, aiSummary)
            .replace(/{{mentions}}/g, mentionsContent)
            .replace(/{{date}}/g, new Date().toISOString())
            .replace(/{{category}}/g, category.name)
            .replace(/{{mentions_count}}/g, contextData.mentions.length.toString())
            .replace(/{{wikipedia}}/g, wikipediaContent);

        return content;
    }

    private async writeNote(path: string, content: string) {
        if (this.settings.dryRun) {
            console.log(`[Dry Run] Would write to ${path}:\n${content.slice(0, 100)}...`);
            return;
        }

        const normalizedPath = normalizePath(path);
        const file = this.app.vault.getAbstractFileByPath(normalizedPath);

        if (file instanceof TFile) {
            if (this.settings.incrementalUpdate) {
                const existingContent = await this.app.vault.read(file);

                // If the file was manually edited (not generated), we might want to skip
                if (!existingContent.includes('generated:')) {
                    console.log(`Skipping regeneration of manually created note: ${path}`);
                    return;
                }

                // Incremental update: merge mentions
                const mentionsIndex = existingContent.indexOf('## Mentions');
                if (mentionsIndex !== -1) {
                    const newMentionsIndex = content.indexOf('## Mentions');
                    if (newMentionsIndex !== -1) {
                        const existingPrefix = existingContent.slice(0, mentionsIndex + '## Mentions'.length);
                        const newMentions = content.slice(newMentionsIndex + '## Mentions'.length);

                        // To avoid duplicates, we could do a more complex merge, but for now we'll just append
                        // or replace the mentions section if we assume we have ALL mentions now
                        await this.app.vault.modify(file, existingPrefix + '\n\n' + newMentions);
                        return;
                    }
                }
            }
            await this.app.vault.modify(file, content);
        } else {
            await this.app.vault.create(normalizedPath, content);
        }
    }
}
