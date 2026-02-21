import { App, EditorPosition, MarkdownView, Menu, Notice, Plugin, PluginSettingTab, Setting, TAbstractFile, TFile, TFolder, requestUrl } from 'obsidian';

import { GlossaryLinker } from './linker/readModeLinker';
import { liveLinkerPlugin } from './linker/liveLinker';
import { ExternalUpdateManager, LinkerCache } from 'linker/linkerCache';
import { LinkerMetaInfoFetcher } from 'linker/linkerInfo';

import * as path from 'path';

export interface LinkerPluginSettings {
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
    defaultUseMarkdownLinks: boolean; // Otherwise wiki links
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
    apiProvider: 'openai' | 'lmstudio';
    openaiEndpoint: string;
    openaiApiKey: string;
    lmstudioEndpoint: string;
    lmstudioApiKey: string;
    modelName: string;
    customPrompt: string;
    similarityThreshold: number;
    runOnStartup: boolean;
    runOnFileSwitch: boolean;
    useCustomDirectory: boolean;
    customDirectoryName: string;
    showProgressNotification: boolean;
    useDictionaryAPI: boolean;
    dictionaryAPIEndpoint: string;
    maxMentionsPerTerm: number;
    // wordBoundaryRegex: string;
    // conversionFormat
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
    apiProvider: 'openai',
    openaiEndpoint: 'https://api.openai.com/v1',
    openaiApiKey: '',
    lmstudioEndpoint: 'http://localhost:1234',
    lmstudioApiKey: '',
    modelName: 'gpt-3.5-turbo',
    customPrompt: 'You are a helpful assistant that provides concise, Wikipedia-style definitions for terms. Provide a one-paragraph summary/definition for the term: "{term}"',
    similarityThreshold: 0.9,
    runOnStartup: false,
    runOnFileSwitch: false,
    useCustomDirectory: true,
    customDirectoryName: 'Vault Wiki',
    showProgressNotification: true,
    useDictionaryAPI: true,
    dictionaryAPIEndpoint: 'https://api.dictionaryapi.dev/api/v2/entries/en/',
    maxMentionsPerTerm: 25,
    // wordBoundaryRegex: '/[\t- !-/:-@\[-`{-~\p{Emoji_Presentation}\p{Extended_Pictographic}]/u',
};

export default class LinkerPlugin extends Plugin {
    settings: LinkerPluginSettings;
    updateManager = new ExternalUpdateManager();
    statusBarItemEl: HTMLElement;

    async onload() {
        await this.loadSettings();

        // Set callback to update the cache when the settings are changed
        this.updateManager.registerCallback(() => {
            LinkerCache.getInstance(this.app, this.settings).clearCache();
        });

        // Register the glossary linker for the read mode
        this.registerMarkdownPostProcessor((element, context) => {
            context.addChild(new GlossaryLinker(this.app, this.settings, context, element));
        });

        // Register the live linker for the live edit mode
        this.registerEditorExtension(liveLinkerPlugin(this.app, this.settings, this.updateManager));

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new LinkerSettingTab(this.app, this));

        // Context menu item to convert virtual links to real links
        this.registerEvent(this.app.workspace.on('file-menu', (menu, file, source) => this.addContextMenuItem(menu, file, source)));

        this.addCommand({
            id: 'activate-virtual-linker',
            name: 'Activate Virtual Linker',
            checkCallback: (checking) => {
                if (!this.settings.linkerActivated) {
                    if (!checking) {
                        this.updateSettings({ linkerActivated: true });
                        this.updateManager.update();
                        new Notice('Virtual Linker activated.');
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
                        new Notice('Virtual Linker deactivated.');
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

                if (virtualLinks.length === 0) {
                    new Notice('No virtual links found in the selection.');
                    return;
                }

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
                    const sanitizedText = this.sanitizeLinkText(link.text, useMarkdownLinks);

                    if (replacementPath === link.text && linkFormat === 'shortest' && !useMarkdownLinks) {
                        replacement = `[[${replacementPath}]]`;
                    } else {
                        let path = linkFormat === 'shortest' ? shortestPath :
                                   linkFormat === 'relative' ? relativePath :
                                   absolutePath;

                        if (useMarkdownLinks) {
                            path = this.sanitizeLinkPath(path);
                            replacement = `[${sanitizedText}](${path})`;
                        } else {
                            replacement = `[[${path}|${sanitizedText}]]`;
                        }
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
                new Notice(`Converted ${replacements.length} virtual links to real links.`);
            }
        });

        this.statusBarItemEl = this.addStatusBarItem();
        this.statusBarItemEl.setText('');

        this.addRibbonIcon('book-open', 'Generate WikiVault notes', () => this.generateMissingNotes());

        this.addCommand({
            id: 'generate-missing-notes',
            name: 'Generate missing Wikilink notes',
            callback: () => this.generateMissingNotes(),
        });

        if (this.settings.runOnStartup) {
            this.app.workspace.onLayoutReady(() => {
                this.generateMissingNotes();
            });
        }

        this.registerEvent(
            this.app.workspace.on('file-open', (file) => {
                if (this.settings.runOnFileSwitch && file) {
                    this.generateMissingNotes();
                }
            })
        );

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

    /** Sanitize link text to prevent markdown/wikilink injection. */
    private sanitizeLinkText(text: string, markdownStyle: boolean): string {
        if (markdownStyle) {
            // Escape [ and ] for markdown links
            return text.replace(/([\[\]])/g, '\\$1');
        } else {
            // Remove [, ] and | for wikilinks as they are not easily escapable in aliases
            return text.replace(/[\[\]|]/g, '');
        }
    }

    /** Sanitize link path for markdown links. */
    private sanitizeLinkPath(path: string): string {
        // For markdown links, if the path contains spaces or parentheses, it should be wrapped in <>
        if (path.includes(' ') || path.includes('(') || path.includes(')')) {
            // Also escape any < or > already in the path to prevent escaping the wrapper
            return `<${path.replace(/[<>]/g, '')}>`;
        }
        return path;
    }

    addContextMenuItem(menu: Menu, file: TAbstractFile, source: string) {
        // addContextMenuItem(a: any, b: any, c: any) {
        // Capture the MouseEvent when the context menu is triggered   // Define a named function to capture the MouseEvent

        if (!file) {
            return;
        }

        // console.log('Context menu', menu, file, source);

        const that = this;
        const app: App = this.app;
        const updateManager = this.updateManager;
        const settings = this.settings;

        const fetcher = new LinkerMetaInfoFetcher(app, settings);
        // Check, if the file has the linker-included tag

        const isDirectory = app.vault.getAbstractFileByPath(file.path) instanceof TFolder;

        if (!isDirectory) {
            const metaInfo = fetcher.getMetaInfo(file);

            function contextMenuHandler(event: MouseEvent) {
                // Access the element that triggered the context menu
                const targetElement = event.target;

                if (!targetElement || !(targetElement instanceof HTMLElement)) {
                    console.error('No target element');
                    return;
                }

                // Check, if we are clicking on a virtual link inside a note or a note in the file explorer
                const isVirtualLink = targetElement.classList.contains('virtual-link-a');

                const from = parseInt(targetElement.getAttribute('from') || '-1');
                const to = parseInt(targetElement.getAttribute('to') || '-1');

                if (from === -1 || to === -1) {
                    menu.addItem((item) => {
                        // Item to convert a virtual link to a real link
                        item.setTitle(
                            '[Virtual Linker] Converting link is not here.'
                        ).setIcon('link');
                    });
                }
                // Check, if the element has the "virtual-link" class
                else if (isVirtualLink) {
                    menu.addItem((item) => {
                        // Item to convert a virtual link to a real link
                        item.setTitle('[Virtual Linker] Convert to real link')
                            .setIcon('link')
                            .onClick(() => {
                                // Get from and to position from the element
                                const from = parseInt(targetElement.getAttribute('from') || '-1');
                                const to = parseInt(targetElement.getAttribute('to') || '-1');

                                if (from === -1 || to === -1) {
                                    console.error('No from or to position');
                                    return;
                                }

                                // Get the shown text
                                const text = targetElement.getAttribute('origin-text') || '';
                                const target = file;
                                const activeFile = app.workspace.getActiveFile();
                                const activeFilePath = activeFile?.path ?? '';

                                if (!activeFile) {
                                    console.error('No active file');
                                    return;
                                }

                                let absolutePath = target.path;
                                let relativePath =
                                    path.relative(path.dirname(activeFile.path), path.dirname(absolutePath)) +
                                    '/' +
                                    path.basename(absolutePath);
                                relativePath = relativePath.replace(/\\/g, '/'); // Replace backslashes with forward slashes

                                // Problem: we cannot just take the fileToLinktext result, as it depends on the app settings
                                const replacementPath = app.metadataCache.fileToLinktext(target as TFile, activeFilePath);

                                // The last part of the replacement path is the real shortest file name
                                // We have to check, if it leads to the correct file
                                const lastPart = replacementPath.split('/').pop()!;
                                const shortestFile = app.metadataCache.getFirstLinkpathDest(lastPart!, '');
                                // let shortestPath = shortestFile?.path == target.path ? lastPart : replacementPath;
                                let shortestPath = shortestFile?.path == target.path ? lastPart : absolutePath;

                                // Remove superfluous .md extension
                                if (!replacementPath.endsWith('.md')) {
                                    if (absolutePath.endsWith('.md')) {
                                        absolutePath = absolutePath.slice(0, -3);
                                    }
                                    if (shortestPath.endsWith('.md')) {
                                        shortestPath = shortestPath.slice(0, -3);
                                    }
                                    if (relativePath.endsWith('.md')) {
                                        relativePath = relativePath.slice(0, -3);
                                    }
                                }

                                const useMarkdownLinks = settings.useDefaultLinkStyleForConversion
                                    ? settings.defaultUseMarkdownLinks
                                    : settings.useMarkdownLinks;

                                const linkFormat = settings.useDefaultLinkStyleForConversion
                                    ? settings.defaultLinkFormat
                                    : settings.linkFormat;

                                const createLink = (replacementPath: string, text: string, markdownStyle: boolean) => {
                                    const sanitizedText = that.sanitizeLinkText(text, markdownStyle);
                                    if (markdownStyle) {
                                        const sanitizedPath = that.sanitizeLinkPath(replacementPath);
                                        return `[${sanitizedText}](${sanitizedPath})`;
                                    } else {
                                        return `[[${replacementPath}|${sanitizedText}]]`;
                                    }
                                };

                                // Create the replacement
                                let replacement = '';

                                // If the file is the same as the shown text, and we can use short links, we use them
                                if (replacementPath === text && linkFormat === 'shortest' && !useMarkdownLinks) {
                                    replacement = `[[${replacementPath}]]`;
                                }
                                // Otherwise create a specific link, using the shown text
                                else {
                                    if (linkFormat === 'shortest') {
                                        replacement = createLink(shortestPath, text, useMarkdownLinks);
                                    } else if (linkFormat === 'relative') {
                                        replacement = createLink(relativePath, text, useMarkdownLinks);
                                    } else if (linkFormat === 'absolute') {
                                        replacement = createLink(absolutePath, text, useMarkdownLinks);
                                    }
                                }

                                // Replace the text
                                const editor = app.workspace.getActiveViewOfType(MarkdownView)?.editor;
                                const fromEditorPos = editor?.offsetToPos(from);
                                const toEditorPos = editor?.offsetToPos(to);

                                if (!fromEditorPos || !toEditorPos) {
                                    console.warn('No editor positions');
                                    return;
                                }

                                editor?.replaceRange(replacement, fromEditorPos, toEditorPos);
                                new Notice('Converted virtual link to real link.');
                            });
                    });
                }

                // Remove the listener to prevent multiple triggers
                document.removeEventListener('contextmenu', contextMenuHandler);
            }

            if (!metaInfo.excludeFile && (metaInfo.includeAllFiles || metaInfo.includeFile || metaInfo.isInIncludedDir)) {
                // Item to exclude a virtual link from the linker
                // This action adds the settings.tagToExcludeFile to the file
                menu.addItem((item) => {
                    item.setTitle('[Virtual Linker] Exclude this file')
                        .setIcon('trash')
                        .onClick(async () => {
                            // Get the shown text
                            const target = file;

                            // Get the file
                            const targetFile = app.vault.getFileByPath(target.path);

                            if (!targetFile) {
                                console.error('No target file');
                                return;
                            }

                            // Add the tag to the file
                            const fileCache = app.metadataCache.getFileCache(targetFile);
                            const frontmatter = fileCache?.frontmatter || {};

                            const tag = settings.tagToExcludeFile;
                            let tags = frontmatter['tags'];

                            if (typeof tags === 'string') {
                                tags = [tags];
                            }

                            if (!Array.isArray(tags)) {
                                tags = [];
                            }

                            if (!tags.includes(tag)) {
                                await app.fileManager.processFrontMatter(targetFile, (frontMatter) => {
                                    if (!frontMatter.tags) {
                                        frontMatter.tags = new Set();
                                    }
                                    const currentTags = [...frontMatter.tags];

                                    frontMatter.tags = new Set([...currentTags, tag]);

                                    // Remove include tag if it exists
                                    const includeTag = settings.tagToIncludeFile;
                                    if (frontMatter.tags.has(includeTag)) {
                                        frontMatter.tags.delete(includeTag);
                                    }
                                });

                                updateManager.update();
                                new Notice('File excluded from virtual linker.');
                            }
                        });
                });
            } else if (!metaInfo.includeFile && (!metaInfo.includeAllFiles || metaInfo.excludeFile || metaInfo.isInExcludedDir)) {
                //Item to include a virtual link from the linker
                // This action adds the settings.tagToIncludeFile to the file
                menu.addItem((item) => {
                    item.setTitle('[Virtual Linker] Include this file')
                        .setIcon('plus')
                        .onClick(async () => {
                            // Get the shown text
                            const target = file;

                            // Get the file
                            const targetFile = app.vault.getFileByPath(target.path);

                            if (!targetFile) {
                                console.error('No target file');
                                return;
                            }

                            // Add the tag to the file
                            const fileCache = app.metadataCache.getFileCache(targetFile);
                            const frontmatter = fileCache?.frontmatter || {};

                            const tag = settings.tagToIncludeFile;
                            let tags = frontmatter['tags'];

                            if (typeof tags === 'string') {
                                tags = [tags];
                            }

                            if (!Array.isArray(tags)) {
                                tags = [];
                            }

                            if (!tags.includes(tag)) {
                                await app.fileManager.processFrontMatter(targetFile, (frontMatter) => {
                                    if (!frontMatter.tags) {
                                        frontMatter.tags = new Set();
                                    }
                                    const currentTags = [...frontMatter.tags];

                                    frontMatter.tags = new Set([...currentTags, tag]);

                                    // Remove exclude tag if it exists
                                    const excludeTag = settings.tagToExcludeFile;
                                    if (frontMatter.tags.has(excludeTag)) {
                                        frontMatter.tags.delete(excludeTag);
                                    }
                                });

                                updateManager.update();
                                new Notice('File included in virtual linker.');
                            }
                        });
                });
            }

            // Capture the MouseEvent when the context menu is triggered
            document.addEventListener('contextmenu', contextMenuHandler, { once: true });
        } else {
            // Check if the directory is in the linker directories
            const path = file.path + '/';
            const isInIncludedDir = fetcher.includeDirPattern.test(path);
            const isInExcludedDir = fetcher.excludeDirPattern.test(path);

            // If the directory is in the linker directories, add the option to exclude it
            if ((fetcher.includeAllFiles && !isInExcludedDir) || isInIncludedDir) {
                menu.addItem((item) => {
                    item.setTitle('[Virtual Linker] Exclude this directory')
                        .setIcon('trash')
                        .onClick(async () => {
                            // Get the shown text
                            const target = file;

                            // Get the file
                            const targetFolder = app.vault.getAbstractFileByPath(target.path) as TFolder;

                            if (!targetFolder) {
                                console.error('No target folder');
                                return;
                            }

                            const newExcludedDirs = Array.from(new Set([...settings.excludedDirectories, targetFolder.name]));
                            const newIncludedDirs = settings.linkerDirectories.filter((dir) => dir !== targetFolder.name);
                            await this.updateSettings({ linkerDirectories: newIncludedDirs, excludedDirectories: newExcludedDirs });

                            updateManager.update();
                            new Notice('Directory excluded from virtual linker.');
                        });
                });
            } else if ((!fetcher.includeAllFiles && !isInIncludedDir) || isInExcludedDir) {
                // If the directory is in the excluded directories, add the option to include it
                menu.addItem((item) => {
                    item.setTitle('[Virtual Linker] Include this directory')
                        .setIcon('plus')
                        .onClick(async () => {
                            // Get the shown text
                            const target = file;

                            // Get the file
                            const targetFolder = app.vault.getAbstractFileByPath(target.path) as TFolder;

                            if (!targetFolder) {
                                console.error('No target folder');
                                return;
                            }

                            const newExcludedDirs = settings.excludedDirectories.filter((dir) => dir !== targetFolder.name);
                            const newIncludedDirs = Array.from(new Set([...settings.linkerDirectories, targetFolder.name]));
                            await this.updateSettings({ linkerDirectories: newIncludedDirs, excludedDirectories: newExcludedDirs });

                            updateManager.update();
                            new Notice('Directory included in virtual linker.');
                        });
                });
            }
        }
    }

    onunload() {}

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

        // Load markdown links from obsidian settings
        // At the moment obsidian does not provide a clean way to get the settings through an API
        // So we read the app.json settings file directly
        // We also Cannot use the vault API because it only reads the vault files not the .obsidian folder
        try {
            const fileContent = await this.app.vault.adapter.read(this.app.vault.configDir + '/app.json');
            const appSettings = JSON.parse(fileContent);
            this.settings.defaultUseMarkdownLinks = appSettings.useMarkdownLinks ?? false;
            this.settings.defaultLinkFormat = appSettings.newLinkFormat ?? 'shortest';
        } catch (e) {
            console.error('[WikiVault] Error loading app settings', e);
            this.settings.defaultUseMarkdownLinks = false;
            this.settings.defaultLinkFormat = 'shortest';
        }
    }

    /** Update plugin settings. */
    async updateSettings(settings: Partial<LinkerPluginSettings> = <Partial<LinkerPluginSettings>>{}) {
        Object.assign(this.settings, settings);
        await this.saveData(this.settings);
        this.updateManager.update();
    }

    async ensureDirectoryExists(pathToFolder: string) {
        const folder = this.app.vault.getAbstractFileByPath(pathToFolder);
        if (!(folder instanceof TFolder)) {
            await this.app.vault.createFolder(pathToFolder);
        }
    }

    async generateMissingNotes() {
        const unresolvedLinks = this.app.metadataCache.unresolvedLinks;
        const linksToProcess = new Set<string>();

        for (const sourcePath in unresolvedLinks) {
            for (const linkName in unresolvedLinks[sourcePath]) {
                linksToProcess.add(linkName);
            }
        }

        if (linksToProcess.size === 0) {
            new Notice('WikiVault: No unresolved links found.');
            return;
        }

        if (this.settings.useCustomDirectory) {
            await this.ensureDirectoryExists(this.settings.customDirectoryName);
        }

        const total = linksToProcess.size;
        let current = 0;
        let notice: Notice | null = null;

        if (this.settings.showProgressNotification) {
            notice = new Notice(`WikiVault: Processing 0/${total} links...`, 0);
        }

        for (const linkName of linksToProcess) {
            await this.processWikiLink(linkName);
            current++;

            const progressText = `WikiVault: ${current}/${total} links`;
            this.statusBarItemEl.setText(progressText);
            if (notice) {
                notice.setMessage(`WikiVault: Processing ${current}/${total} links...`);
            }
        }

        setTimeout(() => {
            this.statusBarItemEl.setText('');
            if (notice) notice.hide();
            new Notice(`WikiVault: Completed processing ${total} links.`);
        }, 2000);
    }

    async processWikiLink(linkName: string) {
        // Sanitize linkName to prevent path traversal
        const safeLinkName = linkName.replace(/\.\./g, '');
        const baseFileName = `${safeLinkName}.md`;
        const fullPath = this.settings.useCustomDirectory ? `${this.settings.customDirectoryName}/${baseFileName}` : baseFileName;
        const existingFile = this.app.vault.getAbstractFileByPath(fullPath);

        let content = '';

        const fuzzyMatch = this.findFuzzyMatch(linkName);
        if (fuzzyMatch && fuzzyMatch.basename.toLowerCase() !== linkName.toLowerCase()) {
            content += `See [[${fuzzyMatch.basename}]]\n\n`;
        }

        const context = await this.extractContext(linkName);
        content += `## Mentions\n\n${context}\n\n`;

        if (this.settings.useDictionaryAPI) {
            const dictionaryDefinition = await this.getDictionaryDefinition(linkName);
            if (dictionaryDefinition) {
                content += `## Dictionary Definition\n\n${dictionaryDefinition}\n\n`;
            }
        }

        const summary = await this.getAISummary(linkName);
        if (summary) {
            content = `# ${linkName}\n\n> ${summary}\n\n` + content;
        } else {
            content = `# ${linkName}\n\n` + content;
        }

        if (existingFile instanceof TFile) {
            await this.app.vault.modify(existingFile, content);
        } else {
            await this.app.vault.create(fullPath, content);
        }
    }

    findFuzzyMatch(linkName: string): TFile | null {
        const files = this.app.vault.getMarkdownFiles();
        for (const file of files) {
            const similarity = this.calculateSimilarity(linkName.toLowerCase(), file.basename.toLowerCase());
            if (similarity >= this.settings.similarityThreshold) {
                return file;
            }
        }
        return null;
    }

    calculateSimilarity(s1: string, s2: string): number {
        const longer = s1.length > s2.length ? s1 : s2;
        const shorter = s1.length > s2.length ? s2 : s1;
        if (longer.length === 0) return 1;
        return (longer.length - this.editDistance(longer, shorter)) / longer.length;
    }

    editDistance(s1: string, s2: string): number {
        const costs: number[] = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) costs[j] = j;
                else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }

    async extractContext(linkName: string): Promise<string> {
        let context = '';
        let mentionCount = 0;
        const mentionRegex = new RegExp(`\\[\\[${linkName.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}(\\|[^\\]]+)?\\]\\]`, 'i');

        for (const file of this.app.vault.getMarkdownFiles()) {
            if (this.settings.useCustomDirectory && file.path.startsWith(this.settings.customDirectoryName)) continue;
            const content = await this.app.vault.read(file);
            const lines = content.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (!mentionRegex.test(line)) continue;

                context += `From [[${file.basename}]]:\n`;
                if (this.isBulletPoint(line)) {
                    if (i > 0 && this.isBulletPoint(lines[i - 1])) {
                        context += `> ${lines[i - 1]}\n`;
                    }
                    context += `> ${line}\n`;

                    let j = i + 1;
                    const currentIndent = this.getIndentLevel(line);
                    while (j < lines.length && this.getIndentLevel(lines[j]) > currentIndent) {
                        context += `> ${lines[j]}\n`;
                        j++;
                    }
                } else {
                    context += `> ${line}\n`;
                }
                context += '\n';
                mentionCount++;

                if (mentionCount >= this.settings.maxMentionsPerTerm) {
                    return context;
                }
            }
        }

        if (mentionCount === 0) {
            return '*No mentions found in the vault.*\n';
        }

        return context;
    }

    isBulletPoint(line: string): boolean {
        const trimmed = line.trim();
        return trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\. /.test(trimmed);
    }

    getIndentLevel(line: string): number {
        const match = line.match(/^(\s*)/);
        return match ? match[1].length : 0;
    }

    async getDictionaryDefinition(term: string): Promise<string | null> {
        if (!this.settings.dictionaryAPIEndpoint) return null;
        try {
            const url = `${this.settings.dictionaryAPIEndpoint}${encodeURIComponent(term)}`;
            const response = await requestUrl({ url, method: 'GET' });
            const first = response.json?.[0];
            const meaning = first?.meanings?.[0];
            const definition = meaning?.definitions?.[0]?.definition;
            if (!definition) return null;
            const pos = meaning?.partOfSpeech ? ` (${meaning.partOfSpeech})` : '';
            return `${term}${pos}: ${definition}`;
        } catch (error) {
            console.error('WikiVault: Dictionary lookup failed', error);
            return null;
        }
    }

    async getAISummary(linkName: string): Promise<string | null> {
        try {
            if (this.settings.apiProvider === 'lmstudio') {
                return await this.getLMStudioSummary(linkName);
            }
            return await this.getOpenAISummary(linkName);
        } catch (error) {
            console.error('WikiVault: AI Summary failed', error);
            return null;
        }
    }

    async getOpenAISummary(linkName: string): Promise<string | null> {
        if (!this.settings.openaiApiKey) return null;
        const prompt = this.settings.customPrompt.replace(/{term}/g, linkName);
        const endpoint = this.settings.openaiEndpoint.replace(/\/+$/, '');

        const response = await requestUrl({
            url: `${endpoint}/chat/completions`,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.settings.openaiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.settings.modelName,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 250,
            }),
        });

        return response.json?.choices?.[0]?.message?.content?.trim() ?? null;
    }

    async getLMStudioSummary(linkName: string): Promise<string | null> {
        const prompt = this.settings.customPrompt.replace(/{term}/g, linkName);
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (this.settings.lmstudioApiKey) {
            headers.Authorization = `Bearer ${this.settings.lmstudioApiKey}`;
        }

        const endpoint = this.settings.lmstudioEndpoint.replace(/\/+$/, '');
        const response = await requestUrl({
            url: `${endpoint}/api/v1/chat`,
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: this.settings.modelName,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 250,
            }),
        });

        return response.json?.choices?.[0]?.message?.content?.trim() ?? null;
    }
}

class LinkerSettingTab extends PluginSettingTab {
    constructor(app: App, public plugin: LinkerPlugin) {
        super(app, plugin);
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        // Toggle to activate or deactivate the linker
        new Setting(containerEl).setName('Activate Virtual Linker').addToggle((toggle) =>
            toggle.setValue(this.plugin.settings.linkerActivated).onChange(async (value) => {
                // console.log("Linker activated: " + value);
                await this.plugin.updateSettings({ linkerActivated: value });
            })
        );

        // Toggle to show advanced settings
        new Setting(containerEl).setName('Show advanced settings').addToggle((toggle) =>
            toggle.setValue(this.plugin.settings.advancedSettings).onChange(async (value) => {
                // console.log("Advanced settings: " + value);
                await this.plugin.updateSettings({ advancedSettings: value });
                this.display();
            })
        );

        new Setting(containerEl).setName('Matching behavior').setHeading();

        // Toggle to include aliases
        new Setting(containerEl)
            .setName('Include aliases')
            .setDesc('If activated, the virtual linker will also include aliases for the files.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.includeAliases).onChange(async (value) => {
                    // console.log("Include aliases: " + value);
                    await this.plugin.updateSettings({ includeAliases: value });
                })
            );

        if (this.plugin.settings.advancedSettings) {
            // Toggle to only link once
            new Setting(containerEl)
                .setName('Only link once')
                .setDesc('If activated, there will not be several identical virtual links in the same note (Wikipedia style).')
                .addToggle((toggle) =>
                    toggle.setValue(this.plugin.settings.onlyLinkOnce).onChange(async (value) => {
                        // console.log("Only link once: " + value);
                        await this.plugin.updateSettings({ onlyLinkOnce: value });
                    })
                );

            // Toggle to exclude links to real linked files
            new Setting(containerEl)
                .setName('Exclude links to real linked files')
                .setDesc('If activated, there will be no links to files that are already linked in the note by real links.')
                .addToggle((toggle) =>
                    toggle.setValue(this.plugin.settings.excludeLinksToRealLinkedFiles).onChange(async (value) => {
                        // console.log("Exclude links to real linked files: " + value);
                        await this.plugin.updateSettings({ excludeLinksToRealLinkedFiles: value });
                    })
                );
        }

        // If headers should be matched or not
        new Setting(containerEl)
            .setName('Include headers')
            .setDesc('If activated, headers (so your lines beginning with at least one `#`) are included for virtual links.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.includeHeaders).onChange(async (value) => {
                    // console.log("Include headers: " + value);
                    await this.plugin.updateSettings({ includeHeaders: value });
                })
            );

        // Toggle setting to match only whole words or any part of the word
        new Setting(containerEl)
            .setName('Match any part of a word')
            .setDesc('If deactivated, only whole words are matched. Otherwise, every part of a word is found.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.matchAnyPartsOfWords).onChange(async (value) => {
                    // console.log("Match only whole words: " + value);
                    await this.plugin.updateSettings({ matchAnyPartsOfWords: value });
                    this.display();
                })
            );

        if (!this.plugin.settings.matchAnyPartsOfWords) {
            // Toggle setting to match only beginning of words
            new Setting(containerEl)
                .setName('Match the beginning of words')
                .setDesc('If activated, the beginnings of words are also linked, even if it is not a whole match.')
                .addToggle((toggle) =>
                    toggle.setValue(this.plugin.settings.matchBeginningOfWords).onChange(async (value) => {
                        // console.log("Match only beginning of words: " + value);
                        await this.plugin.updateSettings({ matchBeginningOfWords: value });
                        this.display();
                    })
                );

            // Toggle setting to match only end of words
            new Setting(containerEl)
                .setName('Match the end of words')
                .setDesc('If activated, the ends of words are also linked, even if it is not a whole match.')
                .addToggle((toggle) =>
                    toggle.setValue(this.plugin.settings.matchEndOfWords).onChange(async (value) => {
                        // console.log("Match only end of words: " + value);
                        await this.plugin.updateSettings({ matchEndOfWords: value });
                        this.display();
                    })
                );
        }

        // Toggle setting to suppress suffix for sub words
        if (this.plugin.settings.matchAnyPartsOfWords || this.plugin.settings.matchBeginningOfWords) {
            new Setting(containerEl)
                .setName('Suppress suffix for sub words')
                .setDesc('If activated, the suffix is not added to links for subwords, but only for complete matches.')
                .addToggle((toggle) =>
                    toggle.setValue(this.plugin.settings.suppressSuffixForSubWords).onChange(async (value) => {
                        // console.log("Suppress suffix for sub words: " + value);
                        await this.plugin.updateSettings({ suppressSuffixForSubWords: value });
                    })
                );
        }

        if (this.plugin.settings.advancedSettings) {
            // Toggle setting to exclude links in the current line start for fixing IME
            new Setting(containerEl)
                .setName('Fix IME problem')
                .setDesc(
                    'If activated, there will be no links in the current line start which is followed immediately by the Input Method Editor (IME). This is the recommended setting if you are using IME (input method editor) for typing, e.g. for chinese characters, because instant linking might interfere with IME.'
                )
                .addToggle((toggle) =>
                    toggle.setValue(this.plugin.settings.fixIMEProblem).onChange(async (value) => {
                        // console.log("Exclude links in current line: " + value);
                        await this.plugin.updateSettings({ fixIMEProblem: value });
                    })
                );
        }

        if (this.plugin.settings.advancedSettings) {
            // Toggle setting to exclude links in the current line
            new Setting(containerEl)
                .setName('Avoid linking in current line')
                .setDesc('If activated, there will be no links in the current line.')
                .addToggle((toggle) =>
                    toggle.setValue(this.plugin.settings.excludeLinksInCurrentLine).onChange(async (value) => {
                        // console.log("Exclude links in current line: " + value);
                        await this.plugin.updateSettings({ excludeLinksInCurrentLine: value });
                    })
                );

            // Input for setting the word boundary regex
            // new Setting(containerEl)
            // 	.setName('Word boundary regex')
            // 	.setDesc('The regex for the word boundary. This regex is used to find the beginning and end of a word. It is used to find the boundaries of the words to match. Defaults to /[\t- !-/:-@\[-`{-~\p{Emoji_Presentation}\p{Extended_Pictographic}]/u to catch most word boundaries.')
            // 	.addText((text) =>
            // 		text
            // 			.setValue(this.plugin.settings.wordBoundaryRegex)
            // 			.onChange(async (value) => {
            // 				try {
            // 					await this.plugin.updateSettings({ wordBoundaryRegex: value });
            // 				} catch (e) {
            // 					console.error('Invalid regex', e);
            // 				}
            // 			})
            // 	);
        }

        new Setting(containerEl).setName('Case sensitivity').setHeading();

        // Toggle setting for case sensitivity
        new Setting(containerEl)
            .setName('Case sensitive')
            .setDesc('If activated, the matching is case sensitive.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.matchCaseSensitive).onChange(async (value) => {
                    // console.log("Case sensitive: " + value);
                    await this.plugin.updateSettings({ matchCaseSensitive: value });
                    this.display();
                })
            );

        if (this.plugin.settings.advancedSettings) {
            // Slider setting for capital letter proportion for automatic match case
            new Setting(containerEl)
                .setName('Capital letter percentage for automatic match case')
                .setDesc(
                    'The percentage of capital letters in a file name or alias to be automatically considered as case sensitive.'
                )
                .addSlider((slider) =>
                    slider
                        .setLimits(0, 100, 1)
                        .setValue(Math.round(this.plugin.settings.capitalLetterProportionForAutomaticMatchCase * 100))
                        .setDynamicTooltip()
                        .onChange(async (value) => {
                            await this.plugin.updateSettings({ capitalLetterProportionForAutomaticMatchCase: value / 100 });
                        })
                );

            if (this.plugin.settings.matchCaseSensitive) {
                // Text setting for tag to ignore case
                new Setting(containerEl)
                    .setName('Tag to ignore case')
                    .setDesc('By adding this tag to a file, the linker will ignore the case for the file.')
                    .addText((text) =>
                        text.setValue(this.plugin.settings.tagToIgnoreCase).onChange(async (value) => {
                            // console.log("New tag to ignore case: " + value);
                            await this.plugin.updateSettings({ tagToIgnoreCase: value });
                        })
                    );
            } else {
                // Text setting for tag to match case
                new Setting(containerEl)
                    .setName('Tag to match case')
                    .setDesc('By adding this tag to a file, the linker will match the case for the file.')
                    .addText((text) =>
                        text.setValue(this.plugin.settings.tagToMatchCase).onChange(async (value) => {
                            // console.log("New tag to match case: " + value);
                            await this.plugin.updateSettings({ tagToMatchCase: value });
                        })
                    );
            }

            const forbiddenPropertyNames = ['constructor', '__proto__', 'prototype', 'toString', 'valueOf', 'toLocaleString', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable'];

            // Text setting for property name to ignore case
            new Setting(containerEl)
                .setName('Property name to ignore case')
                .setDesc(
                    'By adding this property to a note, containing a list of names, the linker will ignore the case for the specified names / aliases. This way you can decide, which alias should be insensitive.'
                )
                .addText((text) =>
                    text.setValue(this.plugin.settings.propertyNameToIgnoreCase).onChange(async (value) => {
                        if (forbiddenPropertyNames.includes(value)) {
                            return;
                        }
                        // console.log("New property name to ignore case: " + value);
                        await this.plugin.updateSettings({ propertyNameToIgnoreCase: value });
                    })
                );

            // Text setting for property name to match case
            new Setting(containerEl)
                .setName('Property name to match case')
                .setDesc(
                    'By adding this property to a note, containing a list of names, the linker will match the case for the specified names / aliases. This way you can decide, which alias should be case sensitive.'
                )
                .addText((text) =>
                    text.setValue(this.plugin.settings.propertyNameToMatchCase).onChange(async (value) => {
                        if (forbiddenPropertyNames.includes(value)) {
                            return;
                        }
                        // console.log("New property name to match case: " + value);
                        await this.plugin.updateSettings({ propertyNameToMatchCase: value });
                    })
                );
        }

        new Setting(containerEl).setName('Matched files').setHeading();

        new Setting(containerEl)
            .setName('Include all files')
            .setDesc('Include all files for the virtual linker.')
            .addToggle((toggle) =>
                toggle
                    // .setValue(true)
                    .setValue(this.plugin.settings.includeAllFiles)
                    .onChange(async (value) => {
                        // console.log("Include all files: " + value);
                        await this.plugin.updateSettings({ includeAllFiles: value });
                        this.display();
                    })
            );

        if (!this.plugin.settings.includeAllFiles) {
            new Setting(containerEl)
                .setName('Glossary linker directories')
                .setDesc('Directories to include for the virtual linker (separated by new lines).')
                .addTextArea((text) => {
                    let setValue = '';
                    try {
                        setValue = this.plugin.settings.linkerDirectories.join('\n');
                    } catch (e) {
                        console.warn(e);
                    }

                    text.setPlaceholder('List of directory names (separated by new line)')
                        .setValue(setValue)
                        .onChange(async (value) => {
                            this.plugin.settings.linkerDirectories = value
                                .split('\n')
                                .map((x) => x.trim())
                                .filter((x) => x.length > 0);
                            // console.log("New folder name: " + value, this.plugin.settings.linkerDirectories);
                            await this.plugin.updateSettings();
                        });

                    // Set default size
                    text.inputEl.addClass('linker-settings-text-box');
                });
        } else {
            if (this.plugin.settings.advancedSettings) {
                new Setting(containerEl)
                    .setName('Excluded directories')
                    .setDesc(
                        'Directories from which files are to be excluded for the virtual linker (separated by new lines). Files in these directories will not create any virtual links in other files.'
                    )
                    .addTextArea((text) => {
                        let setValue = '';
                        try {
                            setValue = this.plugin.settings.excludedDirectories.join('\n');
                        } catch (e) {
                            console.warn(e);
                        }

                        text.setPlaceholder('List of directory names (separated by new line)')
                            .setValue(setValue)
                            .onChange(async (value) => {
                                this.plugin.settings.excludedDirectories = value
                                    .split('\n')
                                    .map((x) => x.trim())
                                    .filter((x) => x.length > 0);
                                // console.log("New folder name: " + value, this.plugin.settings.excludedDirectories);
                                await this.plugin.updateSettings();
                            });

                        // Set default size
                        text.inputEl.addClass('linker-settings-text-box');
                    });
            }
        }

        if (this.plugin.settings.advancedSettings) {
            // Text setting for tag to include file
            new Setting(containerEl)
                .setName('Tag to include file')
                .setDesc('Tag to explicitly include the file for the linker.')
                .addText((text) =>
                    text.setValue(this.plugin.settings.tagToIncludeFile).onChange(async (value) => {
                        // console.log("New tag to include file: " + value);
                        await this.plugin.updateSettings({ tagToIncludeFile: value });
                    })
                );

            // Text setting for tag to ignore file
            new Setting(containerEl)
                .setName('Tag to ignore file')
                .setDesc('Tag to ignore the file for the linker.')
                .addText((text) =>
                    text.setValue(this.plugin.settings.tagToExcludeFile).onChange(async (value) => {
                        // console.log("New tag to ignore file: " + value);
                        await this.plugin.updateSettings({ tagToExcludeFile: value });
                    })
                );

            // Toggle setting to exclude links to the active file
            new Setting(containerEl)
                .setName('Exclude self-links to the current note')
                .setDesc('If toggled, links to the note itself are excluded from the linker. (This might not work in preview windows.)')
                .addToggle((toggle) =>
                    toggle.setValue(this.plugin.settings.excludeLinksToOwnNote).onChange(async (value) => {
                        // console.log("Exclude links to active file: " + value);
                        await this.plugin.updateSettings({ excludeLinksToOwnNote: value });
                    })
                );

            // Setting to exclude directories from the linker to be executed
            new Setting(containerEl)
                .setName('Excluded directories for generating virtual links')
                .setDesc('Directories in which the plugin will not create virtual links (separated by new lines).')
                .addTextArea((text) => {
                    let setValue = '';
                    try {
                        setValue = this.plugin.settings.excludedDirectoriesForLinking.join('\n');
                    } catch (e) {
                        console.warn(e);
                    }

                    text.setPlaceholder('List of directory names (separated by new line)')
                        .setValue(setValue)
                        .onChange(async (value) => {
                            this.plugin.settings.excludedDirectoriesForLinking = value
                                .split('\n')
                                .map((x) => x.trim())
                                .filter((x) => x.length > 0);
                            // console.log("New folder name: " + value, this.plugin.settings.excludedDirectoriesForLinking);
                            await this.plugin.updateSettings();
                        });

                    // Set default size
                    text.inputEl.addClass('linker-settings-text-box');
                });
        }

        new Setting(containerEl).setName('Link style').setHeading();

        new Setting(containerEl)
            .setName('Always show multiple references')
            .setDesc('If toggled, if there are multiple matching notes, all references are shown behind the match. If not toggled, the references are only shown if hovering over the match.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.alwaysShowMultipleReferences).onChange(async (value) => {
                    // console.log("Always show multiple references: " + value);
                    await this.plugin.updateSettings({ alwaysShowMultipleReferences: value });
                })
            );

        new Setting(containerEl)
            .setName('Virtual link suffix')
            .setDesc('The suffix to add to auto generated virtual links.')
            .addText((text) =>
                text.setValue(this.plugin.settings.virtualLinkSuffix).onChange(async (value) => {
                    // console.log("New glossary suffix: " + value);
                    await this.plugin.updateSettings({ virtualLinkSuffix: value });
                })
            );
        new Setting(containerEl)
            .setName('Virtual link suffix for aliases')
            .setDesc('The suffix to add to auto generated virtual links for aliases.')
            .addText((text) =>
                text.setValue(this.plugin.settings.virtualLinkAliasSuffix).onChange(async (value) => {
                    // console.log("New glossary suffix: " + value);
                    await this.plugin.updateSettings({ virtualLinkAliasSuffix: value });
                })
            );

        // Toggle setting to apply default link styling
        new Setting(containerEl)
            .setName('Apply default link styling')
            .setDesc(
                'If toggled, the default link styling will be applied to virtual links. Furthermore, you can style the links yourself with a CSS-snippet affecting the class `virtual-link`. (Find the CSS snippet directory at Appearance -> CSS Snippets -> Open snippets folder)'
            )
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.applyDefaultLinkStyling).onChange(async (value) => {
                    // console.log("Apply default link styling: " + value);
                    await this.plugin.updateSettings({ applyDefaultLinkStyling: value });
                })
            );

        // Toggle setting to use default link style for conversion
        new Setting(containerEl)
            .setName('Use default link style for conversion')
            .setDesc('If toggled, the default link style will be used for the conversion of virtual links to real links.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.useDefaultLinkStyleForConversion).onChange(async (value) => {
                    // console.log("Use default link style for conversion: " + value);
                    await this.plugin.updateSettings({ useDefaultLinkStyleForConversion: value });
                    this.display();
                })
            );

        if (!this.plugin.settings.useDefaultLinkStyleForConversion) {
            // Toggle setting to use markdown links
            new Setting(containerEl)
                .setName('Use [[Wiki-links]]')
                .setDesc('If toggled, the virtual links will be created as wiki-links instead of markdown links.')
                .addToggle((toggle) =>
                    toggle.setValue(!this.plugin.settings.useMarkdownLinks).onChange(async (value) => {
                        // console.log("Use markdown links: " + value);
                        await this.plugin.updateSettings({ useMarkdownLinks: !value });
                    })
                );

            // Dropdown setting for link format
            new Setting(containerEl)
                .setName('Link format')
                .setDesc('The format of the generated links.')
                .addDropdown((dropdown) =>
                    dropdown
                        .addOption('shortest', 'Shortest')
                        .addOption('relative', 'Relative')
                        .addOption('absolute', 'Absolute')
                        .setValue(this.plugin.settings.linkFormat)
                        .onChange(async (value) => {
                            // console.log("New link format: " + value);
                            await this.plugin.updateSettings({ linkFormat: value as 'shortest' | 'relative' | 'absolute' });
                        })
                );
        }

        new Setting(containerEl).setName('Wiki generation').setHeading();

        new Setting(containerEl)
            .setName('API provider')
            .setDesc('Select which AI backend should be used for generated wiki summaries.')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('openai', 'OpenAI / OpenAI-compatible')
                    .addOption('lmstudio', 'LM Studio (native API)')
                    .setValue(this.plugin.settings.apiProvider)
                    .onChange(async (value) => {
                        await this.plugin.updateSettings({ apiProvider: value as 'openai' | 'lmstudio' });
                        this.display();
                    })
            );

        if (this.plugin.settings.apiProvider === 'openai') {
            new Setting(containerEl)
                .setName('OpenAI-compatible endpoint')
                .setDesc('For example: https://api.openai.com/v1 or https://api.mistral.ai/v1')
                .addText((text) =>
                    text.setValue(this.plugin.settings.openaiEndpoint).onChange(async (value) => {
                        await this.plugin.updateSettings({ openaiEndpoint: value });
                    })
                );

            new Setting(containerEl)
                .setName('OpenAI API key')
                .setDesc('API key used for OpenAI-compatible providers.')
                .addText((text) => {
                    text.inputEl.type = 'password';
                    text.setValue(this.plugin.settings.openaiApiKey).onChange(async (value) => {
                        await this.plugin.updateSettings({ openaiApiKey: value });
                    });
                });
        } else {
            new Setting(containerEl)
                .setName('LM Studio endpoint')
                .setDesc('Default LM Studio local server: http://localhost:1234')
                .addText((text) =>
                    text.setValue(this.plugin.settings.lmstudioEndpoint).onChange(async (value) => {
                        await this.plugin.updateSettings({ lmstudioEndpoint: value });
                    })
                );

            new Setting(containerEl)
                .setName('LM Studio API key (optional)')
                .setDesc('Leave empty unless authentication is enabled in LM Studio.')
                .addText((text) => {
                    text.inputEl.type = 'password';
                    text.setValue(this.plugin.settings.lmstudioApiKey).onChange(async (value) => {
                        await this.plugin.updateSettings({ lmstudioApiKey: value });
                    });
                });
        }

        new Setting(containerEl)
            .setName('Model name')
            .setDesc('Identifier of the model loaded by your selected provider.')
            .addText((text) =>
                text.setValue(this.plugin.settings.modelName).onChange(async (value) => {
                    await this.plugin.updateSettings({ modelName: value });
                })
            );

        new Setting(containerEl)
            .setName('Custom prompt')
            .setDesc('Prompt template for AI summaries. Use {term} placeholder for the unresolved link.')
            .addTextArea((text) => {
                text.setValue(this.plugin.settings.customPrompt).onChange(async (value) => {
                    await this.plugin.updateSettings({ customPrompt: value });
                });
                text.inputEl.addClass('linker-settings-text-box');
            });

        new Setting(containerEl)
            .setName('Use custom output directory')
            .setDesc('Store generated notes in a dedicated folder.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.useCustomDirectory).onChange(async (value) => {
                    await this.plugin.updateSettings({ useCustomDirectory: value });
                    this.display();
                })
            );

        if (this.plugin.settings.useCustomDirectory) {
            new Setting(containerEl)
                .setName('Wiki output directory')
                .setDesc('Folder where generated notes are created/updated.')
                .addText((text) =>
                    text.setValue(this.plugin.settings.customDirectoryName).onChange(async (value) => {
                        // Sanitize to prevent path traversal
                        const sanitized = value.replace(/\.\./g, '');
                        await this.plugin.updateSettings({ customDirectoryName: sanitized });
                    })
                );
        }

        new Setting(containerEl)
            .setName('Run on startup')
            .setDesc('Automatically generate missing notes when Obsidian starts.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.runOnStartup).onChange(async (value) => {
                    await this.plugin.updateSettings({ runOnStartup: value });
                })
            );

        new Setting(containerEl)
            .setName('Run on file switch')
            .setDesc('Automatically generate missing notes when switching files.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.runOnFileSwitch).onChange(async (value) => {
                    await this.plugin.updateSettings({ runOnFileSwitch: value });
                })
            );

        new Setting(containerEl)
            .setName('Show progress notification')
            .setDesc('Display persistent progress while generating notes.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.showProgressNotification).onChange(async (value) => {
                    await this.plugin.updateSettings({ showProgressNotification: value });
                })
            );

        new Setting(containerEl)
            .setName('Use dictionary API')
            .setDesc('Fetch dictionary definitions before AI summaries.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.useDictionaryAPI).onChange(async (value) => {
                    await this.plugin.updateSettings({ useDictionaryAPI: value });
                    this.display();
                })
            );

        if (this.plugin.settings.useDictionaryAPI) {
            new Setting(containerEl)
                .setName('Dictionary API endpoint')
                .setDesc('Default: https://api.dictionaryapi.dev/api/v2/entries/en/')
                .addText((text) =>
                    text.setValue(this.plugin.settings.dictionaryAPIEndpoint).onChange(async (value) => {
                        await this.plugin.updateSettings({ dictionaryAPIEndpoint: value });
                    })
                );
        }

        new Setting(containerEl)
            .setName('Fuzzy match threshold')
            .setDesc('Similarity threshold (0.1-1.0) used to suggest nearby existing notes.')
            .addSlider((slider) =>
                slider
                    .setLimits(0.1, 1, 0.01)
                    .setValue(this.plugin.settings.similarityThreshold)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        await this.plugin.updateSettings({ similarityThreshold: value });
                    })
            );

        new Setting(containerEl)
            .setName('Maximum mentions per generated note')
            .setDesc('Caps how many contextual mentions are injected into each note.')
            .addSlider((slider) =>
                slider
                    .setLimits(1, 100, 1)
                    .setValue(this.plugin.settings.maxMentionsPerTerm)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        await this.plugin.updateSettings({ maxMentionsPerTerm: value });
                    })
            );
    }
}
