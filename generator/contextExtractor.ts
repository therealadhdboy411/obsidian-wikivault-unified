import { App, TFile, TFolder } from 'obsidian';
import { LinkerCache } from '../linker/linkerCache';
import { getSingularForm, getPluralForm } from '../utils/pluralization';

export interface Mention {
    file: TFile;
    line: string;
    lineNumber: number;
    context: string;
    heading?: string;
    type: 'wikilinked' | 'virtual';
    matchText?: string;
    alternatives?: string[];
}

export interface ContextData {
    mentions: Mention[];
    sourceFiles: TFile[];
}

export class ContextExtractor {
    private app: App;
    private settings: any;
    private linkerCache: LinkerCache;

    constructor(app: App, settings: any, linkerCache: LinkerCache) {
        this.app = app;
        this.settings = settings;
        this.linkerCache = linkerCache;
    }

    async buildGlobalContextMap(): Promise<Map<string, ContextData>> {
        const contextMap = new Map<string, ContextData>();
        const files = this.app.vault.getMarkdownFiles();
        const unresolvedLinks = this.app.metadataCache.unresolvedLinks;

        // Pre-fill with wikilinks from unresolved links cache
        for (const sourcePath in unresolvedLinks) {
            const sourceFile = this.app.vault.getAbstractFileByPath(sourcePath);
            if (!(sourceFile instanceof TFile) || this.isExcluded(sourceFile)) continue;

            for (const term in unresolvedLinks[sourcePath]) {
                if (!contextMap.has(term)) {
                    contextMap.set(term, { mentions: [], sourceFiles: [] });
                }
            }
        }

        // Now scan files to get actual lines and context
        // This is still $O(N)$ files, but we process all terms at once
        for (const file of files) {
            if (this.isExcluded(file)) continue;

            const content = await this.app.vault.read(file);
            const lines = content.split('\n');
            const fileCache = this.app.metadataCache.getFileCache(file);

            const fileUnresolved = unresolvedLinks[file.path] || {};

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Check all terms in contextMap for this line
                // Optimized: only check terms that are known to be in this file via unresolvedLinks
                // PLUS virtual links if enabled
                for (const term in fileUnresolved) {
                    if (line.includes(`[[${term}]]`) || line.includes(`[[${term}|`)) {
                        this.addMentionToMap(contextMap, term, file, line, i, fileCache, 'wikilinked');
                    }
                }

                if (this.settings.linkerActivated) {
                    // For virtual links, we might still need a broader check
                    // but we can limit it to terms that already have a note or are unresolved
                    // This is still a bit expensive, but better than before
                }
            }
        }

        return contextMap;
    }

    async extractContext(term: string): Promise<ContextData> {
        const mentions: Mention[] = [];
        const sourceFiles = new Set<TFile>();

        const unresolvedLinks = this.app.metadataCache.unresolvedLinks;
        const candidateFiles: TFile[] = [];

        // Use unresolved links cache to find candidate files
        for (const sourcePath in unresolvedLinks) {
            if (unresolvedLinks[sourcePath][term]) {
                const file = this.app.vault.getAbstractFileByPath(sourcePath);
                if (file instanceof TFile) candidateFiles.push(file);
            }
        }

        // If virtual linker is on, we unfortunately might need to scan all files
        // OR we can rely on a search index if available
        const filesToScan = this.settings.linkerActivated ? this.app.vault.getMarkdownFiles() : candidateFiles;

        for (const file of filesToScan) {
            if (this.isExcluded(file)) continue;

            const content = await this.app.vault.read(file);
            if (!content.toLowerCase().includes(term.toLowerCase()) && !content.includes(`[[${term}`)) continue;

            const lines = content.split('\n');
            const fileCache = this.app.metadataCache.getFileCache(file);

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                let mentionType: 'wikilinked' | 'virtual' | null = null;

                const singular = getSingularForm(term);
                const plural = getPluralForm(term);

                if (line.includes(`[[${term}]]`) || line.includes(`[[${term}|`)) {
                    mentionType = 'wikilinked';
                } else if (singular && (line.includes(`[[${singular}]]`) || line.includes(`[[${singular}|`))) {
                    mentionType = 'wikilinked';
                } else if (plural && (line.includes(`[[${plural}]]`) || line.includes(`[[${plural}|`))) {
                    mentionType = 'wikilinked';
                } else if (this.settings.linkerActivated && (
                    line.toLowerCase().includes(term.toLowerCase()) ||
                    (singular && line.toLowerCase().includes(singular.toLowerCase())) ||
                    (plural && line.toLowerCase().includes(plural.toLowerCase()))
                )) {
                    mentionType = 'virtual';
                }

                if (mentionType) {
                    const heading = this.getHeadingForLine(i, fileCache);
                    const context = this.getSurroundingContext(lines, i);

                    mentions.push({
                        file,
                        line,
                        lineNumber: i,
                        context,
                        heading,
                        type: mentionType,
                        matchText: term
                    });
                    sourceFiles.add(file);
                }
            }
        }

        return { mentions, sourceFiles: Array.from(sourceFiles) };
    }

    private addMentionToMap(map: Map<string, ContextData>, term: string, file: TFile, line: string, lineNumber: number, fileCache: any, type: 'wikilinked' | 'virtual') {
        let data = map.get(term);
        if (!data) {
            data = { mentions: [], sourceFiles: [] };
            map.set(term, data);
        }
        data.mentions.push({
            file,
            line,
            lineNumber,
            context: this.getSurroundingContext(line.split('\n'), 0), // Simplified
            heading: this.getHeadingForLine(lineNumber, fileCache),
            type,
            matchText: term
        });
        if (!data.sourceFiles.includes(file)) data.sourceFiles.push(file);
    }

    private isExcluded(file: TFile): boolean {
        if (this.settings.customDirectoryName && file.path.startsWith(this.settings.customDirectoryName)) return true;

        if (this.settings.excludePatterns && this.settings.excludePatterns.length > 0) {
            for (const pattern of this.settings.excludePatterns) {
                if (file.basename.includes(pattern) || file.path.includes(pattern)) {
                    return true;
                }
            }
        }

        return false;
    }

    private getHeadingForLine(lineNumber: number, fileCache: any): string | undefined {
        if (!fileCache || !fileCache.headings) return undefined;

        let lastHeading = undefined;
        for (const heading of fileCache.headings) {
            if (heading.position.start.line <= lineNumber) {
                lastHeading = heading.heading;
            } else {
                break;
            }
        }
        return lastHeading;
    }

    private getSurroundingContext(lines: string[], lineNumber: number): string {
        const start = Math.max(0, lineNumber - 2);
        const end = Math.min(lines.length - 1, lineNumber + 2);
        return lines.slice(start, end + 1).join('\n');
    }
}
