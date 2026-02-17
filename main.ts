import { App, EditorPosition, MarkdownView, Menu, Plugin, PluginSettingTab, Setting, TAbstractFile, TFile, TFolder, Notice } from 'obsidian';

import { GlossaryLinker } from './linker/readModeLinker';
import { liveLinkerPlugin } from './linker/liveLinker';
import { ExternalUpdateManager, LinkerCache } from './linker/linkerCache';
import { LinkerMetaInfoFetcher } from './linker/linkerInfo';
import { NoteGenerator } from './generator/noteGenerator';
import { Category } from './generator/categoryManager';

import * as path from 'path';

export interface LinkerPluginSettings {
    // Virtual Linker Settings
    advancedSettings: boolean;
    linkerActivated: boolean;
    suppressSuffixForSubWords: boolean;
    matchAnyPartsOfWords: boolean;
    matchEndOfWords: boolean;
    matchBeginningOfWords: boolean;
    includeAllFiles: boolean;
    linkerDirectories: string[];
    excludedDirectories: string[];
    excludedDirectoriesForLinking: string[];
    virtualLinkSuffix: string;
    virtualLinkAliasSuffix: string;
    useDefaultLinkStyleForConversion: boolean;
    defaultUseMarkdownLinks: boolean;
    defaultLinkFormat: 'shortest' | 'relative' | 'absolute';
    useMarkdownLinks: boolean;
    linkFormat: 'shortest' | 'relative' | 'absolute';
    applyDefaultLinkStyling: boolean;
    includeHeaders: boolean;
    matchCaseSensitive: boolean;
    capitalLetterProportionForAutomaticMatchCase: number;
    tagToIgnoreCase: string;
    tagToMatchCase: string;
    propertyNameToMatchCase: string;
    propertyNameToIgnoreCase: string;
    tagToExcludeFile: string;
    tagToIncludeFile: string;
    excludeLinksToOwnNote: boolean;
    fixIMEProblem: boolean;
    excludeLinksInCurrentLine: boolean;
    onlyLinkOnce: boolean;
    excludeLinksToRealLinkedFiles: boolean;
    includeAliases: boolean;
    alwaysShowMultipleReferences: boolean;

    // WikiVault Generation Settings
    customDirectoryName: string;
    useWikipedia: boolean;
    useDictionaryAPI: boolean;
    openaiKey: string;
    openaiModel: string;
    aiPrompt: string;
    systemPrompt: string;
    useCategories: boolean;
    categories: Category[];
    defaultCategory: string;
    excludedFileTypes: string[];
    trackModel: boolean;
    modelName: string;
    provider: string;
    incrementalUpdate: boolean;
    createEmptyNotes: boolean;
    noteTemplate: string;
    excludePatterns: string[];
    dryRun: boolean;
    aiEndpoint: string;
}

const DEFAULT_SETTINGS: LinkerPluginSettings = {
    advancedSettings: false,
    linkerActivated: true,
    matchAnyPartsOfWords: false,
    matchEndOfWords: true,
    matchBeginningOfWords: true,
    suppressSuffixForSubWords: false,
    includeAllFiles: true,
    linkerDirectories: ['Glossary'],
    excludedDirectories: [],
    excludedDirectoriesForLinking: [],
    virtualLinkSuffix: '🔗',
    virtualLinkAliasSuffix: '🔗',
    useMarkdownLinks: false,
    linkFormat: 'shortest',
    defaultUseMarkdownLinks: false,
    defaultLinkFormat: 'shortest',
    useDefaultLinkStyleForConversion: true,
    applyDefaultLinkStyling: true,
    includeHeaders: true,
    matchCaseSensitive: false,
    capitalLetterProportionForAutomaticMatchCase: 0.75,
    tagToIgnoreCase: 'linker-ignore-case',
    tagToMatchCase: 'linker-match-case',
    propertyNameToMatchCase: 'linker-match-case',
    propertyNameToIgnoreCase: 'linker-ignore-case',
    tagToExcludeFile: 'linker-exclude',
    tagToIncludeFile: 'linker-include',
    excludeLinksToOwnNote: true,
    fixIMEProblem: false,
    excludeLinksInCurrentLine: false,
    onlyLinkOnce: true,
    excludeLinksToRealLinkedFiles: true,
    includeAliases: true,
    alwaysShowMultipleReferences: false,

    // WikiVault Defaults
    customDirectoryName: 'Wiki',
    useWikipedia: true,
    useDictionaryAPI: false,
    openaiKey: '',
    openaiModel: 'gpt-3.5-turbo',
    aiPrompt: 'Summarize the concept of "{{term}}" based on these mentions:\n\n{{context}}',
    systemPrompt: 'You are a professional knowledge manager and researcher. Create a concise, encyclopedic summary.',
    useCategories: false,
    categories: [],
    defaultCategory: 'Default',
    excludedFileTypes: ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'mp4'],
    trackModel: true,
    modelName: 'GPT-3.5',
    provider: 'OpenAI',
    incrementalUpdate: true,
    createEmptyNotes: false,
    noteTemplate: "---\ngenerated: {{date}}\ncategory: {{category}}\nmentions_count: {{mentions_count}}\n---\n\n# {{title}}\n\n{{wikipedia}}\n\n## AI Summary\n\n{{summary}}\n\n## Mentions\n\n{{mentions}}",
    excludePatterns: [],
    dryRun: false,
    aiEndpoint: 'https://api.openai.com/v1/chat/completions',
};

export default class LinkerPlugin extends Plugin {
    settings: LinkerPluginSettings;
    updateManager = new ExternalUpdateManager();
    generator: NoteGenerator;

    async onload() {
        await this.loadSettings();

        const linkerCache = LinkerCache.getInstance(this.app, this.settings);
        this.generator = new NoteGenerator(this.app, this.settings, linkerCache);

        // Set callback to update the cache when the settings are changed
        this.updateManager.registerCallback(() => {
            linkerCache.clearCache();
        });

        // Register the glossary linker for the read mode
        this.registerMarkdownPostProcessor((element, context) => {
            context.addChild(new GlossaryLinker(this.app, this.settings, context, element));
        });

        // Register the live linker for the live edit mode
        this.registerEditorExtension(liveLinkerPlugin(this.app, this.settings, this.updateManager));

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new LinkerSettingTab(this.app, this));

        // Ribbon icon for Wiki generation
        this.addRibbonIcon('book-open', 'Generate Wiki Notes', async () => {
            new Notice('Starting Wiki Note Generation...');
            await this.generator.generateAll();
            new Notice('Wiki Note Generation Complete!');
        });

        // Context menu item to convert virtual links to real links
        this.registerEvent(this.app.workspace.on('file-menu', (menu, file, source) => this.addContextMenuItem(menu, file, source)));

        // Editor menu for unresolved links
        this.registerEvent(this.app.workspace.on('editor-menu', (menu, editor, view) => {
            const cursor = editor.getCursor();
            const line = editor.getLine(cursor.line);
            const linkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
            let match;
            while ((match = linkRegex.exec(line)) !== null) {
                if (cursor.ch >= match.index && cursor.ch <= match.index + match[0].length) {
                    const term = match[1];
                    menu.addItem((item) => {
                        item.setTitle(`Generate Wiki Note for "${term}"`)
                            .setIcon('book-open')
                            .onClick(() => this.generator.generateNote(term));
                    });
                }
            }
        }));

        this.addCommand({
            id: 'generate-wiki-notes',
            name: 'Generate All Missing Wiki Notes',
            callback: () => this.generator.generateAll(),
        });

        this.addCommand({
            id: 'generate-notes-for-current-file',
            name: 'Generate Wiki Notes for Unresolved Links in Current File',
            callback: async () => {
                const activeFile = this.app.workspace.getActiveFile();
                if (!activeFile) {
                    new Notice('No active file found.');
                    return;
                }
                new Notice('Processing current file...');
                await this.generator.generateForFile(activeFile);
                new Notice('Done processing current file.');
            }
        });

        this.addCommand({
            id: 'process-link-under-cursor',
            name: 'Process Wiki Link Under Cursor',
            editorCallback: async (editor: any, view: MarkdownView) => {
                const cursor = editor.getCursor();
                const line = editor.getLine(cursor.line);

                // Find [[Link]] under cursor
                const linkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
                let match;
                while ((match = linkRegex.exec(line)) !== null) {
                    if (cursor.ch >= match.index && cursor.ch <= match.index + match[0].length) {
                        const term = match[1];
                        new Notice(`Generating note for: ${term}`);
                        await this.generator.generateNote(term);
                        new Notice(`Done: ${term}`);
                        return;
                    }
                }
                new Notice('No wiki link found under cursor.');
            }
        });

        this.addCommand({
            id: 'activate-virtual-linker',
            name: 'Activate Virtual Linker',
            checkCallback: (checking) => {
                if (!this.settings.linkerActivated) {
                    if (!checking) {
                        this.updateSettings({ linkerActivated: true });
                        this.updateManager.update();
                    }
                    return true;
                }
                return false;
            },
        });

        this.addCommand({
            id: 'deactivate-virtual-linker',
            name: 'Deactivate Virtual Linker',
            checkCallback: (checking) => {
                if (this.settings.linkerActivated) {
                    if (!checking) {
                        this.updateSettings({ linkerActivated: false });
                        this.updateManager.update();
                    }
                    return true;
                }
                return false;
            },
        });

        this.addCommand({
            id: 'convert-selected-virtual-links',
            name: 'Convert All Virtual Links in Selection to Real Links',
            checkCallback: (checking: boolean) => {
                const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                const editor = view?.editor;

                if (!editor || !editor.somethingSelected()) {
                    return false;
                }

                if (checking) return true;

                // Get the selected text range
                const from = editor.getCursor('from');
                const to = editor.getCursor('to');

                // Get the DOM element containing the selection
                const cmEditor = (editor as any).cm;
                if (!cmEditor) return false;

                const selectionRange = cmEditor.dom.querySelector('.cm-content');
                if (!selectionRange) return false;

                // Find all virtual links in the selection
                const virtualLinks = Array.from(selectionRange.querySelectorAll('.virtual-link-a'))
                    .filter((link): link is HTMLElement => link instanceof HTMLElement)
                    .map(link => ({
                        element: link,
                        from: parseInt(link.getAttribute('from') || '-1'),
                        to: parseInt(link.getAttribute('to') || '-1'),
                        text: link.getAttribute('origin-text') || '',
                        href: link.getAttribute('href') || ''
                    }))
                    .filter(link => {
                        const linkFrom = editor.offsetToPos(link.from);
                        const linkTo = editor.offsetToPos(link.to);
                        return this.isPosWithinRange(linkFrom, linkTo, from, to);
                    })
                    .sort((a, b) => a.from - b.from);

                if (virtualLinks.length === 0) return;

                // Process all links in a single operation
                const replacements: {from: number, to: number, text: string}[] = [];

                for (const link of virtualLinks) {
                    const targetFile = this.app.vault.getAbstractFileByPath(link.href);
                    if (!(targetFile instanceof TFile)) continue;

                    const activeFile = this.app.workspace.getActiveFile();
                    const activeFilePath = activeFile?.path ?? '';

                    let absolutePath = targetFile.path;
                    let relativePath = path.relative(
                        path.dirname(activeFilePath),
                        path.dirname(absolutePath)
                    ) + '/' + path.basename(absolutePath);
                    relativePath = relativePath.replace(/\\/g, '/');

                    const replacementPath = this.app.metadataCache.fileToLinktext(targetFile, activeFilePath);
                    const lastPart = replacementPath.split('/').pop()!;
                    const shortestFile = this.app.metadataCache.getFirstLinkpathDest(lastPart!, '');
                    let shortestPath = shortestFile?.path === targetFile.path ? lastPart : absolutePath;

                    // Remove .md extension if needed
                    if (!replacementPath.endsWith('.md')) {
                        if (absolutePath.endsWith('.md')) absolutePath = absolutePath.slice(0, -3);
                        if (shortestPath.endsWith('.md')) shortestPath = shortestPath.slice(0, -3);
                        if (relativePath.endsWith('.md')) relativePath = relativePath.slice(0, -3);
                    }

                    const useMarkdownLinks = this.settings.useDefaultLinkStyleForConversion
                        ? this.settings.defaultUseMarkdownLinks
                        : this.settings.useMarkdownLinks;

                    const linkFormat = this.settings.useDefaultLinkStyleForConversion
                        ? this.settings.defaultLinkFormat
                        : this.settings.linkFormat;

                    let replacement = '';
                    if (replacementPath === link.text && linkFormat === 'shortest') {
                        replacement = `[[${replacementPath}]]`;
                    } else {
                        const path = linkFormat === 'shortest' ? shortestPath :
                                   linkFormat === 'relative' ? relativePath :
                                   absolutePath;

                        replacement = useMarkdownLinks ?
                            `[${link.text}](${path})` :
                            `[[${path}|${link.text}]]`;
                    }

                    replacements.push({
                        from: link.from,
                        to: link.to,
                        text: replacement
                    });
                }

                // Apply all replacements in reverse order to maintain correct positions
                for (const replacement of replacements.reverse()) {
                    const fromPos = editor.offsetToPos(replacement.from);
                    const toPos = editor.offsetToPos(replacement.to);
                    editor.replaceRange(replacement.text, fromPos, toPos);
                }
            }
        });

    }

    private isPosWithinRange(
        linkFrom: EditorPosition,
        linkTo: EditorPosition,
        selectionFrom: EditorPosition,
        selectionTo: EditorPosition
    ): boolean {
        return (
            (linkFrom.line > selectionFrom.line ||
             (linkFrom.line === selectionFrom.line && linkFrom.ch >= selectionFrom.ch)) &&
            (linkTo.line < selectionTo.line ||
             (linkTo.line === selectionTo.line && linkTo.ch <= selectionTo.ch))
        );
    }

    addContextMenuItem(menu: Menu, file: TAbstractFile, source: string) {
        if (!file) return;

        const app: App = this.app;
        const updateManager = this.updateManager;
        const settings = this.settings;
        const fetcher = new LinkerMetaInfoFetcher(app, settings);
        const isDirectory = app.vault.getAbstractFileByPath(file.path) instanceof TFolder;

        if (!isDirectory) {
            const metaInfo = fetcher.getMetaInfo(file);

            function contextMenuHandler(event: MouseEvent) {
                const targetElement = event.target;
                if (!targetElement || !(targetElement instanceof HTMLElement)) return;

                const isVirtualLink = targetElement.classList.contains('virtual-link-a');
                const from = parseInt(targetElement.getAttribute('from') || '-1');
                const to = parseInt(targetElement.getAttribute('to') || '-1');

                if (from !== -1 && to !== -1 && isVirtualLink) {
                    menu.addItem((item) => {
                        item.setTitle('[Virtual Linker] Convert to real link')
                            .setIcon('link')
                            .onClick(() => {
                                const text = targetElement.getAttribute('origin-text') || '';
                                const target = file;
                                const activeFile = app.workspace.getActiveFile();
                                if (!activeFile) return;

                                const activeFilePath = activeFile.path;
                                let absolutePath = target.path;
                                let relativePath = path.relative(path.dirname(activeFile.path), path.dirname(absolutePath)) + '/' + path.basename(absolutePath);
                                relativePath = relativePath.replace(/\\/g, '/');

                                const replacementPath = app.metadataCache.fileToLinktext(target as TFile, activeFilePath);
                                const lastPart = replacementPath.split('/').pop()!;
                                const shortestFile = app.metadataCache.getFirstLinkpathDest(lastPart!, '');
                                let shortestPath = shortestFile?.path == target.path ? lastPart : absolutePath;

                                if (!replacementPath.endsWith('.md')) {
                                    if (absolutePath.endsWith('.md')) absolutePath = absolutePath.slice(0, -3);
                                    if (shortestPath.endsWith('.md')) shortestPath = shortestPath.slice(0, -3);
                                    if (relativePath.endsWith('.md')) relativePath = relativePath.slice(0, -3);
                                }

                                const useMarkdownLinks = settings.useDefaultLinkStyleForConversion ? settings.defaultUseMarkdownLinks : settings.useMarkdownLinks;
                                const linkFormat = settings.useDefaultLinkStyleForConversion ? settings.defaultLinkFormat : settings.linkFormat;

                                const createLink = (p: string, t: string, m: boolean) => m ? `[${t}](${p})` : `[[${p}|${t}]]`;
                                let replacement = (replacementPath === text && linkFormat === 'shortest') ? `[[${replacementPath}]]` :
                                    (linkFormat === 'shortest' ? createLink(shortestPath, text, useMarkdownLinks) :
                                     linkFormat === 'relative' ? createLink(relativePath, text, useMarkdownLinks) :
                                     createLink(absolutePath, text, useMarkdownLinks));

                                const editor = app.workspace.getActiveViewOfType(MarkdownView)?.editor;
                                const fromEditorPos = editor?.offsetToPos(from);
                                const toEditorPos = editor?.offsetToPos(to);
                                if (fromEditorPos && toEditorPos) editor?.replaceRange(replacement, fromEditorPos, toEditorPos);
                            });
                    });
                }
                document.removeEventListener('contextmenu', contextMenuHandler);
            }

            if (!metaInfo.excludeFile && (metaInfo.includeAllFiles || metaInfo.includeFile || metaInfo.isInIncludedDir)) {
                menu.addItem((item) => {
                    item.setTitle('[Virtual Linker] Exclude this file')
                        .setIcon('trash')
                        .onClick(async () => {
                            const targetFile = app.vault.getFileByPath(file.path);
                            if (!targetFile) return;
                            await app.fileManager.processFrontMatter(targetFile, (frontMatter) => {
                                if (!frontMatter.tags) frontMatter.tags = new Set();
                                const currentTags = Array.isArray(frontMatter.tags) ? frontMatter.tags : (typeof frontMatter.tags === 'string' ? [frontMatter.tags] : []);
                                frontMatter.tags = new Set([...currentTags, settings.tagToExcludeFile]);
                                if (frontMatter.tags.has(settings.tagToIncludeFile)) frontMatter.tags.delete(settings.tagToIncludeFile);
                            });
                            updateManager.update();
                        });
                });
            } else if (!metaInfo.includeFile && (!metaInfo.includeAllFiles || metaInfo.excludeFile || metaInfo.isInExcludedDir)) {
                menu.addItem((item) => {
                    item.setTitle('[Virtual Linker] Include this file')
                        .setIcon('plus')
                        .onClick(async () => {
                            const targetFile = app.vault.getFileByPath(file.path);
                            if (!targetFile) return;
                            await app.fileManager.processFrontMatter(targetFile, (frontMatter) => {
                                if (!frontMatter.tags) frontMatter.tags = new Set();
                                const currentTags = Array.isArray(frontMatter.tags) ? frontMatter.tags : (typeof frontMatter.tags === 'string' ? [frontMatter.tags] : []);
                                frontMatter.tags = new Set([...currentTags, settings.tagToIncludeFile]);
                                if (frontMatter.tags.has(settings.tagToExcludeFile)) frontMatter.tags.delete(settings.tagToExcludeFile);
                            });
                            updateManager.update();
                        });
                });
            }
            document.addEventListener('contextmenu', contextMenuHandler, { once: true });
        } else {
            const path = file.path + '/';
            const isInIncludedDir = fetcher.includeDirPattern.test(path);
            const isInExcludedDir = fetcher.excludeDirPattern.test(path);

            if ((fetcher.includeAllFiles && !isInExcludedDir) || isInIncludedDir) {
                menu.addItem((item) => {
                    item.setTitle('[Virtual Linker] Exclude this directory')
                        .setIcon('trash')
                        .onClick(async () => {
                            const newExcludedDirs = Array.from(new Set([...settings.excludedDirectories, file.name]));
                            const newIncludedDirs = settings.linkerDirectories.filter((dir) => dir !== file.name);
                            await this.updateSettings({ linkerDirectories: newIncludedDirs, excludedDirectories: newExcludedDirs });
                            updateManager.update();
                        });
                });
            } else if ((!fetcher.includeAllFiles && !isInIncludedDir) || isInExcludedDir) {
                menu.addItem((item) => {
                    item.setTitle('[Virtual Linker] Include this directory')
                        .setIcon('plus')
                        .onClick(async () => {
                            const newExcludedDirs = settings.excludedDirectories.filter((dir) => dir !== file.name);
                            const newIncludedDirs = Array.from(new Set([...settings.linkerDirectories, file.name]));
                            await this.updateSettings({ linkerDirectories: newIncludedDirs, excludedDirectories: newExcludedDirs });
                            updateManager.update();
                        });
                });
            }
        }
    }

    onunload() {}

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        try {
            const fileContent = await this.app.vault.adapter.read(this.app.vault.configDir + '/app.json');
            const appSettings = JSON.parse(fileContent);
            this.settings.defaultUseMarkdownLinks = appSettings.useMarkdownLinks;
            this.settings.defaultLinkFormat = appSettings.newLinkFormat ?? 'shortest';
        } catch (e) {
            console.warn('Could not read app.json settings', e);
        }
    }

    async updateSettings(settings: Partial<LinkerPluginSettings> = {}) {
        Object.assign(this.settings, settings);
        await this.saveData(this.settings);
        this.updateManager.update();
    }
}

class LinkerSettingTab extends PluginSettingTab {
    constructor(app: App, public plugin: LinkerPlugin) {
        super(app, plugin);
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'WikiVault Unified Settings' });

        new Setting(containerEl).setName('Activate Virtual Linker').addToggle((toggle) =>
            toggle.setValue(this.plugin.settings.linkerActivated).onChange(async (value) => {
                await this.plugin.updateSettings({ linkerActivated: value });
            })
        );

        new Setting(containerEl).setName('Show advanced settings').addToggle((toggle) =>
            toggle.setValue(this.plugin.settings.advancedSettings).onChange(async (value) => {
                await this.plugin.updateSettings({ advancedSettings: value });
                this.display();
            })
        );

        this.addAIUserSettings();
        this.addVirtualLinkerSettings();
        this.addWikiGenerationSettings();
    }

    addAIUserSettings() {
        const { containerEl } = this;
        containerEl.createEl('h3', { text: 'AI Configuration' });

        new Setting(containerEl)
            .setName('AI Endpoint')
            .setDesc('Custom AI endpoint (e.g., for LM Studio or local Mistral). Default is OpenAI.')
            .addText(text => text
                .setValue(this.plugin.settings.aiEndpoint)
                .onChange(async (value) => {
                    await this.plugin.updateSettings({ aiEndpoint: value });
                }));

        new Setting(containerEl)
            .setName('OpenAI API Key')
            .setDesc('Enter your OpenAI API key for note generation.')
            .addText(text => text
                .setPlaceholder('sk-...')
                .setValue(this.plugin.settings.openaiKey)
                .onChange(async (value) => {
                    await this.plugin.updateSettings({ openaiKey: value });
                }));

        new Setting(containerEl)
            .setName('Model')
            .addDropdown(dropdown => dropdown
                .addOption('gpt-3.5-turbo', 'GPT-3.5 Turbo')
                .addOption('gpt-4', 'GPT-4')
                .setValue(this.plugin.settings.openaiModel)
                .onChange(async (value) => {
                    await this.plugin.updateSettings({ openaiModel: value });
                }));
    }

    addWikiGenerationSettings() {
        const { containerEl } = this;
        containerEl.createEl('h3', { text: 'Wiki Generation' });

        new Setting(containerEl)
            .setName('Note Template')
            .setDesc('Custom template for generated notes. Use {{title}}, {{summary}}, {{mentions}}, {{date}}, {{category}}, {{mentions_count}}, {{wikipedia}}.')
            .addTextArea(text => text
                .setValue(this.plugin.settings.noteTemplate)
                .onChange(async (value) => {
                    await this.plugin.updateSettings({ noteTemplate: value });
                }));

        new Setting(containerEl)
            .setName('Wiki Directory')
            .setDesc('Folder where generated wiki notes will be stored.')
            .addText(text => text
                .setValue(this.plugin.settings.customDirectoryName)
                .onChange(async (value) => {
                    await this.plugin.updateSettings({ customDirectoryName: value });
                }));

        new Setting(containerEl)
            .setName('Use Wikipedia')
            .setDesc('Fetch summaries from Wikipedia.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.useWikipedia)
                .onChange(async (value) => {
                    await this.plugin.updateSettings({ useWikipedia: value });
                }));

        new Setting(containerEl)
            .setName('Incremental Updates')
            .setDesc('Update existing notes instead of overwriting them.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.incrementalUpdate)
                .onChange(async (value) => {
                    await this.plugin.updateSettings({ incrementalUpdate: value });
                }));

        new Setting(containerEl)
            .setName('Dry Run')
            .setDesc('If enabled, no files will be created or modified. A report will be shown in the console/notice.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.dryRun)
                .onChange(async (value) => {
                    await this.plugin.updateSettings({ dryRun: value });
                }));

        new Setting(containerEl)
            .setName('Exclude Patterns')
            .setDesc('Comma-separated list of patterns to exclude (e.g., MOC-, 2023-).')
            .addText(text => text
                .setValue(this.plugin.settings.excludePatterns.join(', '))
                .onChange(async (value) => {
                    await this.plugin.updateSettings({ excludePatterns: value.split(',').map(s => s.trim()).filter(s => s.length > 0) });
                }));
    }

    addVirtualLinkerSettings() {
        const { containerEl } = this;
        containerEl.createEl('h3', { text: 'Virtual Linker Matching' });

        new Setting(containerEl)
            .setName('Include aliases')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.includeAliases).onChange(async (value) => {
                    await this.plugin.updateSettings({ includeAliases: value });
                })
            );

        new Setting(containerEl)
            .setName('Case sensitive')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.matchCaseSensitive).onChange(async (value) => {
                    await this.plugin.updateSettings({ matchCaseSensitive: value });
                    this.display();
                })
            );

        if (!this.plugin.settings.includeAllFiles) {
            new Setting(containerEl)
                .setName('Glossary linker directories')
                .addTextArea((text) => {
                    text.setValue(this.plugin.settings.linkerDirectories.join('\n'))
                        .onChange(async (value) => {
                            this.plugin.settings.linkerDirectories = value.split('\n').map((x) => x.trim()).filter((x) => x.length > 0);
                            await this.plugin.updateSettings();
                        });
                });
        }

        new Setting(containerEl)
            .setName('Include all files')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.includeAllFiles)
                    .onChange(async (value) => {
                        await this.plugin.updateSettings({ includeAllFiles: value });
                        this.display();
                    })
            );
    }
}
