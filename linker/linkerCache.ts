import { App, getAllTags, parseFrontMatterAliases, TFile, Vault } from 'obsidian';

import { LinkerPluginSettings } from 'main';
import { LinkerMetaInfoFetcher } from './linkerInfo';

export class ExternalUpdateManager {
    registeredCallbacks: Set<Function> = new Set();

    constructor() {}

    registerCallback(callback: Function) {
        this.registeredCallbacks.add(callback);
    }

    update() {
        // Timeout to make sure the cache is updated
        setTimeout(() => {
            for (const callback of this.registeredCallbacks) {
                callback();
            }
        }, 50);
    }
}

export class PrefixNode {
    parent: PrefixNode | undefined;
    children: Map<string, PrefixNode> = new Map();
    files: Set<TFile> = new Set();
    // Cache the array representation of files to avoid repeated Array.from calls
    private _filesArray: TFile[] | null = null;
    charValue: string = '';
    value: string = '';
    requiresCaseMatch: boolean = false;

    /**
     * Lazily initializes and returns the cached array of files.
     */
    getFilesArray(): TFile[] {
        if (!this._filesArray) {
            this._filesArray = Array.from(this.files);
        }
        return this._filesArray;
    }

    /**
     * Invalidates the cached files array when the Set is modified.
     */
    invalidateCache() {
        this._filesArray = null;
    }
}

export class VisitedPrefixNode {
    node: PrefixNode;
    caseIsMatched: boolean;
    startedAtWordBeginning: boolean;
    formattingDelta: number = 0;
    constructor(node: PrefixNode, caseIsMatched: boolean = true, startedAtWordBeginning: boolean = false) {
        this.node = node;
        this.caseIsMatched = caseIsMatched;
        this.startedAtWordBeginning = startedAtWordBeginning;
    }
}

export class MatchNode {
    start: number = 0;
    length: number = 0;
    files: TFile[] = [];
    value: string = '';
    isAlias: boolean = false;
    caseIsMatched: boolean = true;
    startsAtWordBoundary: boolean = false;
    requiresCaseMatch: boolean = false;

    get end(): number {
        return this.start + this.length;
    }
}

export class PrefixTree {
    static readonly WORD_BOUNDARY_REGEX = /[^\p{L}]/u;
    static readonly FORMATTING_CHAR_REGEX = /[^\p{L}\p{N}]/u;

    root: PrefixNode = new PrefixNode();
    fetcher: LinkerMetaInfoFetcher;

    _currentNodes: VisitedPrefixNode[] = [];
    // Reuse buffers for next nodes and seen nodes to reduce allocations and GC pressure
    _nextNodes: VisitedPrefixNode[] = [];
    _seenNodes: Set<PrefixNode> = new Set();

    setIndexedFilePaths: Set<string> = new Set();
    mapIndexedFilePathsToUpdateTime: Map<string, number> = new Map();
    mapFilePathToLeaveNodes: Map<string, PrefixNode[]> = new Map();

    constructor(public app: App, public settings: LinkerPluginSettings) {
        this.fetcher = new LinkerMetaInfoFetcher(this.app, this.settings);
        this.updateTree();
    }

    clear() {
        this.root = new PrefixNode();
        this._currentNodes = [];
        this.setIndexedFilePaths.clear();
        this.mapIndexedFilePathsToUpdateTime.clear();
        this.mapFilePathToLeaveNodes.clear();
    }

    getCurrentMatchNodes(index: number, excludedNote?: TFile | null): MatchNode[] {
        const matchNodes: MatchNode[] = [];

        if (excludedNote === undefined && this.settings.excludeLinksToOwnNote) {
            excludedNote = this.app.workspace.getActiveFile();
        }
        // Pre-calculate excluded path to avoid repeated access in loop
        const excludedPath = excludedNote?.path;

        // From the current nodes in the trie, get all nodes that have files
        for (const node of this._currentNodes) {
            const nodeFiles = node.node.getFilesArray();
            if (nodeFiles.length === 0) {
                continue;
            }

            const nodeValueLower = node.node.value.toLowerCase();
            const filteredFiles: TFile[] = [];
            let isAlias = true;

            // Single loop for filtering and isAlias check to improve performance
            for (const file of nodeFiles) {
                if (file.path === excludedPath) continue;

                filteredFiles.push(file);
                if (isAlias && file.basename.toLowerCase() === nodeValueLower) {
                    isAlias = false;
                }
            }

            if (filteredFiles.length === 0) {
                continue;
            }

            const matchNode = new MatchNode();
            matchNode.length = node.node.value.length + node.formattingDelta;
            matchNode.start = index - matchNode.length;
            matchNode.files = filteredFiles;
            matchNode.value = node.node.value;
            matchNode.requiresCaseMatch = node.node.requiresCaseMatch;
            matchNode.isAlias = isAlias;

            // Check if the case is matched
            matchNode.caseIsMatched = node.caseIsMatched;

            // Check if the match starts at a word boundary
            matchNode.startsAtWordBoundary = node.startedAtWordBeginning;

            if (matchNode.requiresCaseMatch && !matchNode.caseIsMatched) {
                continue;
            }

            matchNodes.push(matchNode);
        }

        // Sort nodes by length, skipping for 0 or 1 matches
        if (matchNodes.length > 1) {
            matchNodes.sort((a, b) => b.length - a.length);
        }

        return matchNodes;
    }

    private addFileWithName(name: string, file: TFile, matchCase: boolean) {
        let node = this.root;

        // For each character in the name, add a node to the trie
        for (let char of name) {
            // char = char.toLowerCase();
            let child = node.children.get(char);
            if (!child) {
                child = new PrefixNode();
                child.parent = node;
                child.charValue = char;
                child.value = node.value + char;
                node.children.set(char, child);
            }
            node = child;
        }

        // The last node is a leaf node, add the file to the node
        node.files.add(file);
        node.invalidateCache();
        node.requiresCaseMatch = matchCase;

        // Store the leaf node for the file to be able to remove it later
        const path = file.path;
        this.mapFilePathToLeaveNodes.set(path, [node, ...(this.mapFilePathToLeaveNodes.get(path) ?? [])]);
        // console.log("Adding file", file, name);
    }

    private static isNoneEmptyString(value: string | null | undefined): value is string {
        return value !== null && value !== undefined && typeof value === 'string' && value.trim().length > 0;
    }

    private static isUpperCaseString(value: string | null | undefined, upperCasePart = 0.75) {
        if (!PrefixTree.isNoneEmptyString(value)) {
            return false;
        }

        const length = value.length;
        let upperCaseChars = 0;
        for (let i = 0; i < length; i++) {
            const char = value[i];
            if (char === char.toUpperCase()) {
                upperCaseChars++;
            }
        }

        return upperCaseChars / length >= upperCasePart;
    }

    private addFileToTree(file: TFile) {
        const path = file.path;

        if (!file || !path) {
            return;
        }

        // Remove the old nodes of the file
        this.removeFileFromTree(file);

        // Add the file to the set of indexed files
        this.setIndexedFilePaths.add(path);
        this.mapIndexedFilePathsToUpdateTime.set(path, file.stat.mtime);

        // Get the virtual linker related metadata of the file
        const metaInfo = this.fetcher.getMetaInfo(file);

        // Get the tags of the file
        // and normalize them by removing the # in front of tags
        const tags = (getAllTags(this.app.metadataCache.getFileCache(file)!!) ?? [])
            .filter(PrefixTree.isNoneEmptyString)
            .map((tag) => (tag.startsWith('#') ? tag.slice(1) : tag));

        const includeFile = metaInfo.includeFile;
        const excludeFile = metaInfo.excludeFile;

        const isInIncludedDir = metaInfo.isInIncludedDir;
        const isInExcludedDir = metaInfo.isInExcludedDir;

        // console.log({
        //     file: file.path,
        //     tags: tags,
        //     includeFile,
        //     excludeFile,
        //     isInIncludedDir,
        //     isInExcludedDir,
        //     includeAllFiles: metaInfo.includeAllFiles
        // });

        if (excludeFile || (isInExcludedDir && !includeFile)) {
            return;
        }

        // Skip files that are not in the linker directories
        if (!includeFile && !isInIncludedDir && !metaInfo.includeAllFiles) {
            return;
        }

        const metadata = this.app.metadataCache.getFileCache(file);
        let aliases: string[] = metadata?.frontmatter?.aliases ?? [];

        const fmMatchCase = metadata?.frontmatter?.[this.settings.propertyNameToMatchCase];
        let aliasesWithMatchCase: Set<string> = new Set(Array.isArray(fmMatchCase) ? fmMatchCase : []);
        const fmIgnoreCase = metadata?.frontmatter?.[this.settings.propertyNameToIgnoreCase];
        let aliasesWithIgnoreCase: Set<string> = new Set(Array.isArray(fmIgnoreCase) ? fmIgnoreCase : []);

        // if (aliasesWithMatchCase.size > 0 || aliasesWithIgnoreCase.size > 0) {
        //     console.log("Aliases with match case", aliasesWithMatchCase, file.basename);
        //     console.log("Aliases with ignore case", aliasesWithIgnoreCase, file.basename);
        // }

        // If aliases is not an array, convert it to an array
        if (!Array.isArray(aliases)) {
            aliases = [aliases];
        }

        // Filter out empty aliases
        try {
            aliases = aliases.filter(PrefixTree.isNoneEmptyString);
        } catch (e) {
            console.error('[VL LC] Error filtering aliases', aliases, e);
        }

        let names = [file.basename];
        if (aliases && this.settings.includeAliases) {
            names.push(...aliases);
        }

        names = names.filter(PrefixTree.isNoneEmptyString);

        let namesWithCaseIgnore = new Array<string>();
        let namesWithCaseMatch = new Array<string>();

        // Check if the file should match case sensitive
        if (this.settings.matchCaseSensitive) {
            let lowerCaseNames = new Array<string>();
            if (tags.includes(this.settings.tagToIgnoreCase)) {
                namesWithCaseIgnore = [...names];
            } else {
                namesWithCaseMatch = [...names];
            }
            lowerCaseNames = lowerCaseNames.map((name) => name.toLowerCase());
            names.push(...lowerCaseNames);
        } else {
            let lowerCaseNames = new Array<string>();
            if (tags.includes(this.settings.tagToMatchCase)) {
                namesWithCaseMatch = [...names];
                lowerCaseNames = names.filter((name) => aliasesWithIgnoreCase.has(name));
            } else {
                const prop = this.settings.capitalLetterProportionForAutomaticMatchCase;
                namesWithCaseMatch = [...names].filter(
                    (name) => PrefixTree.isUpperCaseString(name, prop) && !aliasesWithIgnoreCase.has(name)
                );
                namesWithCaseIgnore = [...names].filter((name) => !namesWithCaseMatch.includes(name));
            }
        }

        const namesToMoveFromIgnoreToMatch = namesWithCaseIgnore.filter((name) => aliasesWithMatchCase.has(name));
        const namesToMoveFromMatchToIgnore = namesWithCaseMatch.filter((name) => aliasesWithIgnoreCase.has(name));

        namesWithCaseIgnore = namesWithCaseIgnore.filter((name) => !namesToMoveFromIgnoreToMatch.includes(name));
        namesWithCaseMatch = namesWithCaseMatch.filter((name) => !namesToMoveFromMatchToIgnore.includes(name));
        namesWithCaseIgnore.push(...namesToMoveFromMatchToIgnore);
        namesWithCaseMatch.push(...namesToMoveFromIgnoreToMatch);

        namesWithCaseIgnore.push(...namesWithCaseIgnore.map((name) => name.toLowerCase()));

        namesWithCaseIgnore.forEach((name) => {
            this.addFileWithName(name, file, false);
        });

        namesWithCaseMatch.forEach((name) => {
            this.addFileWithName(name, file, true);
        });
    }

    private removeFileFromTree(file: TFile | string) {
        const path = typeof file === 'string' ? file : file.path;

        // Get the leaf nodes of the file
        const nodes = this.mapFilePathToLeaveNodes.get(path) ?? [];
        for (const node of nodes) {
            // Remove the file from the node
            node.files = new Set([...node.files].filter((f) => f.path !== path));
            node.invalidateCache();
        }

        // If the nodes have no files or children, remove them from the tree
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i];
            let currentNode = node;
            while (currentNode.files.size === 0 && currentNode.children.size === 0) {
                const parent = currentNode.parent;
                if (!parent || parent === this.root) {
                    break;
                }
                parent.children.delete(currentNode.charValue);
                currentNode = parent;
            }
        }

        // Remove the file from the set of indexed files
        this.setIndexedFilePaths.delete(path);
        this.mapFilePathToLeaveNodes.delete(path);

        // Remove the update time of the file
        this.mapIndexedFilePathsToUpdateTime.delete(path);
    }

    private fileIsUpToDate(file: TFile) {
        const mtime = file.stat.mtime;
        const path = file.path;
        return this.mapIndexedFilePathsToUpdateTime.has(path) && this.mapIndexedFilePathsToUpdateTime.get(path) === mtime;
    }

    updateTree(updateFiles?: (string | undefined)[]) {
        this.fetcher.refreshSettings();

        const currentVaultFiles = new Set<string>();
        let files = new Array<TFile>();
        const allFiles = this.app.vault.getMarkdownFiles();

        allFiles.forEach((f) => currentVaultFiles.add(f.path));

        // If the number of files has changed, update all files
        if (allFiles.length != this.setIndexedFilePaths.size || !updateFiles || updateFiles.length == 0) {
            files = allFiles;
        } else {
            // If files are provided, only update the provided files
            files = updateFiles
                .map((f) => (f ? this.app.vault.getAbstractFileByPath(f) : null))
                .filter((f) => f !== null && f instanceof TFile) as TFile[];
        }

        for (const file of files) {
            // Get the update time of the file
            const mtime = file.stat.mtime;

            // Check if the file has been updated
            if (this.fileIsUpToDate(file)) {
                continue;
            }
            // console.log("Updating", file, file.stat.mtime, this.mapIndexedFilePathsToUpdateTime.get(file.path));

            // Otherwise, add the file to the tree
            try {
                this.addFileToTree(file);
            } catch (e) {
                console.error('[VL LC] Error adding file to tree', file, e);
            }
        }

        // Remove files that are no longer in the vault
        const filesToRemove = [...this.setIndexedFilePaths].filter((f) => !currentVaultFiles.has(f));
        // console.log("Removing", filesToRemove);
        filesToRemove.forEach((f) => this.removeFileFromTree(f));
    }

    findFiles(prefix: string): Set<TFile> {
        let node: PrefixNode | undefined = this.root;
        for (const char of prefix) {
            node = node.children.get(char.toLowerCase());
            if (!node) {
                return new Set();
            }
        }
        return node.files;
    }

    resetSearch() {
        // this._current = this.root;
        this._currentNodes = [new VisitedPrefixNode(this.root)];
    }

    /**
     * Pushes a character to update the current nodes in the prefix tree.
     * Uses double-buffering to minimize allocations.
     */
    pushChar(char: string) {
        this._nextNodes.length = 0;
        this._seenNodes.clear();

        const charLower = char.toLowerCase();
        const chars = char === charLower ? [char] : [char, charLower];

        for (const c of chars) {
            const isBoundary = PrefixTree.checkWordBoundary(c);
            if (this.settings.matchAnyPartsOfWords || isBoundary || this.settings.matchEndOfWords) {
                if (!this._seenNodes.has(this.root)) {
                    this._nextNodes.push(new VisitedPrefixNode(this.root, true, isBoundary));
                    this._seenNodes.add(this.root);
                }
            }

            for (const node of this._currentNodes) {
                const child = node.node.children.get(c);
                const startedAtBoundary = node.startedAtWordBeginning;
                if (child && !this._seenNodes.has(child)) {
                    const newVisited = new VisitedPrefixNode(child, node.caseIsMatched && char === c, startedAtBoundary);
                    newVisited.formattingDelta = node.formattingDelta;
                    this._nextNodes.push(newVisited);
                    this._seenNodes.add(child);
                }
            }

            // TODO: Ignore formatting (#59)
            if (false) {
                // Check if the current char is a formatting char, if so also add the current nodes
                const isFormatting = PrefixTree.isFormattingChar(char);
                if (isFormatting) {
                    this._currentNodes.forEach((node) => {
                        node.formattingDelta += 1;
                    });
                    this._nextNodes.push(...this._currentNodes);
                }
            }
        }

        // Swap buffers
        const tmp = this._currentNodes;
        this._currentNodes = this._nextNodes;
        this._nextNodes = tmp;
    }

    static checkWordBoundary(char: string): boolean {
        return PrefixTree.WORD_BOUNDARY_REGEX.test(char);
    }

    static isFormattingChar(char: string): boolean {
        return PrefixTree.FORMATTING_CHAR_REGEX.test(char);
    }
}

export class CachedFile {
    constructor(public mtime: number, public file: TFile, public aliases: string[], public tags: string[]) {}
}

export class LinkerCache {
    static instance: LinkerCache;

    activeFilePath?: string;
    // files: Map<string, CachedFile> = new Map();
    // linkEntries: Map<string, CachedFile[]> = new Map();
    vault: Vault;
    cache: PrefixTree;

    constructor(public app: App, public settings: LinkerPluginSettings) {
        const { vault } = app;
        this.vault = vault;
        // console.log("Creating LinkerCache");
        this.cache = new PrefixTree(app, settings);
        this.updateCache(true);
    }

    static getInstance(app: App, settings: LinkerPluginSettings) {
        if (!LinkerCache.instance) {
            LinkerCache.instance = new LinkerCache(app, settings);
        }
        return LinkerCache.instance;
    }

    clearCache() {
        this.cache.clear();
    }

    reset() {
        this.cache.resetSearch();
    }

    updateCache(force = false) {
        // force = true;
        if (!this.app?.workspace?.getActiveFile()) {
            return;
        }

        // We only need to update cache if the active file has changed
        const activeFile = this.app.workspace.getActiveFile()?.path;
        if (activeFile === this.activeFilePath && !force) {
            return;
        }
        // console.log("Updating cache", force);
        this.cache.updateTree(force ? undefined : [activeFile, this.activeFilePath]);

        this.activeFilePath = activeFile;
    }
}
