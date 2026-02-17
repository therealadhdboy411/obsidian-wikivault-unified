/*
WikiVault Unified - Complete Implementation
Combines Virtual Linker rendering + WikiVault note generation
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var main_exports = {};
__export(main_exports, {
  default: () => WikiVaultUnifiedPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

var DEFAULT_SETTINGS = {
  // AI Provider
  provider: "mistral",
  openaiEndpoint: "https://api.mistral.ai/v1",
  openaiApiKey: "",
  modelName: "mistral-medium-latest",
  apiType: "openai",
  
  // Core Settings
  similarityThreshold: 0.7,
  runOnStartup: false,
  runOnFileSwitch: false,
  useCustomDirectory: true,
  customDirectoryName: "Wiki",
  showProgressNotification: true,
  batchSize: 10,
  
  // Knowledge Sources
  useDictionaryAPI: true,
  dictionaryAPIEndpoint: "https://api.dictionaryapi.dev/api/v2/entries/en",
  useWikipedia: true,
  useWikipediaInContext: true,
  useDictionaryInContext: true,
  glossaryBasePath: "",
  
  // AI Prompts
  systemPrompt: "You are a helpful assistant that synthesizes information from the user's notes and provided reference materials. Base your responses on the context provided. Format your responses with key terms in **bold**.",
  userPromptTemplate: 'Based on the following information, provide a comprehensive summary of "{{term}}":\n\n{{context}}\n\nProvide a detailed explanation with key terms in **bold**.',
  
  // Context Extraction
  includeHeadingContext: true,
  includeFullParagraphs: true,
  contextLinesAround: 2,
  
  // Generation Features
  generateTags: true,
  maxTags: 20,
  tagsIncludeHashPrefix: true,
  generateRelatedConcepts: true,
  maxRelatedConcepts: 10,
  trackModel: true,
  usePriorityQueue: true,
  
  // Output Format
  aiSummaryDisclaimer: "*AI can make mistakes, always check information*",
  extractKeyConceptsFromSummary: true,
  wikipediaLinkText: "Read more on Wikipedia",
  preserveMentionFormatting: true,
  
  // Virtual Links (from Virtual Linker)
  virtualLinksEnabled: true,
  virtualLinkSuffix: "🔗",
  applyDefaultLinkStyling: true,
  matchWholeWordsOnly: true,
  matchBeginningOfWords: true,
  matchEndOfWords: true,
  matchAnyPartsOfWords: false,
  caseSensitiveMatching: false,
  onlyLinkOnce: true,
  excludeLinksToOwnNote: true,
  excludeLinksToRealLinkedFiles: true,
  includeAliases: true,
  alwaysShowMultipleReferences: true,
  
  // Smart Matching
  minWordLengthForAutoDetect: 3,
  maxWordsToMatch: 3,
  preferLongerMatches: true,
  showAllPossibleMatches: true,
  
  // File Filtering
  excludedFileTypes: ["png", "jpg", "jpeg", "gif", "svg", "pdf", "mp4", "mp3", "wav", "webp", "bmp"],
  
  // Categories
  useCategories: true,
  categories: [
    {
      name: "General",
      path: "Wiki/General",
      sourceFolder: "",
      tags: [],
      enabled: true
    }
  ],
  defaultCategory: "General",
  autoAssignCategory: true,
  
  // Synonyms & Abbreviations
  synonyms: {
    "ML": "Machine Learning",
    "AI": "Artificial Intelligence",
    "DL": "Deep Learning",
    "NLP": "Natural Language Processing",
    "RL": "Reinforcement Learning",
    "NN": "Neural Network",
    "RMP": "Resting Membrane Potential",
    "NMJ": "Neuromuscular Junction",
    "ACh": "Acetylcholine",
    "AP": "Action Potential",
    "ATP": "Adenosine Triphosphate"
  }
};

// Irregular plurals
var IRREGULAR_PLURALS = {
  "child": "children", "person": "people", "man": "men", "woman": "women",
  "tooth": "teeth", "foot": "feet", "mouse": "mice", "goose": "geese",
  "analysis": "analyses", "thesis": "theses", "criterion": "criteria",
  "phenomenon": "phenomena"
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getSingularForm(word) {
  const lower = word.toLowerCase();
  for (const [singular, plural] of Object.entries(IRREGULAR_PLURALS)) {
    if (lower === plural) return word.slice(0, -lower.length) + singular;
  }
  if (lower.endsWith('ies') && lower.length > 4) return word.slice(0, -3) + 'y';
  if (lower.endsWith('ves') && lower.length > 4) return word.slice(0, -3) + 'f';
  if (lower.endsWith('ses') && lower.length > 4) return word.slice(0, -2);
  if (lower.endsWith('xes') || lower.endsWith('ches') || lower.endsWith('shes')) return word.slice(0, -2);
  if (lower.endsWith('s') && !lower.endsWith('ss') && !lower.endsWith('us')) return word.slice(0, -1);
  return null;
}

function getPluralForm(word) {
  const lower = word.toLowerCase();
  if (IRREGULAR_PLURALS[lower]) return word.slice(0, -lower.length) + IRREGULAR_PLURALS[lower];
  if (lower.endsWith('y') && lower.length > 2 && !'aeiou'.includes(lower[lower.length - 2])) {
    return word.slice(0, -1) + 'ies';
  }
  if (lower.endsWith('f')) return word.slice(0, -1) + 'ves';
  if (lower.endsWith('fe')) return word.slice(0, -2) + 'ves';
  if (lower.endsWith('s') || lower.endsWith('x') || lower.endsWith('z') || 
      lower.endsWith('ch') || lower.endsWith('sh')) return word + 'es';
  return word + 's';
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// TERM INDEX / CACHE (Adapted from Virtual Linker)
// ============================================================================

class TermCache {
  constructor(app, settings) {
    this.app = app;
    this.settings = settings;
    this.termIndex = new Map();
    this.fileModTimes = new Map();
  }
  
  buildIndex() {
    console.log("WikiVault: Building term index...");
    this.termIndex.clear();
    
    const files = this.app.vault.getMarkdownFiles();
    for (const file of files) {
      if (this.isFileExcluded(file)) continue;
      this.indexFile(file);
    }
    
    console.log(`WikiVault: Indexed ${this.termIndex.size} terms from ${files.length} files`);
  }
  
  isFileExcluded(file) {
    const ext = file.extension.toLowerCase();
    if (this.settings.excludedFileTypes.includes(ext)) return true;
    if (file.path.startsWith(this.settings.customDirectoryName)) return true;
    return false;
  }
  
  indexFile(file) {
    const basename = file.basename;
    this.addTerm(basename, file);
    
    // Add aliases
    const metadata = this.app.metadataCache.getFileCache(file);
    if (metadata?.frontmatter?.aliases) {
      const aliases = Array.isArray(metadata.frontmatter.aliases) 
        ? metadata.frontmatter.aliases 
        : [metadata.frontmatter.aliases];
      for (const alias of aliases) {
        if (alias && typeof alias === 'string') {
          this.addTerm(alias, file);
        }
      }
    }
    
    // Add variations
    const singular = getSingularForm(basename);
    const plural = getPluralForm(basename);
    if (singular && singular !== basename) this.addTerm(singular, file);
    if (plural && plural !== basename) this.addTerm(plural, file);
    
    // Add synonyms
    for (const [abbr, full] of Object.entries(this.settings.synonyms || {})) {
      if (full.toLowerCase() === basename.toLowerCase()) {
        this.addTerm(abbr, file);
      }
    }
    
    this.fileModTimes.set(file.path, file.stat.mtime);
  }
  
  addTerm(term, file) {
    if (term.length < this.settings.minWordLengthForAutoDetect) return;
    
    const key = this.settings.caseSensitiveMatching ? term : term.toLowerCase();
    if (!this.termIndex.has(key)) {
      this.termIndex.set(key, []);
    }
    if (!this.termIndex.get(key).includes(file)) {
      this.termIndex.get(key).push(file);
    }
  }
  
  findMatches(text) {
    const words = text.split(/\s+/);
    const matches = [];
    
    // Check multi-word combinations (longest first)
    for (let wordCount = Math.min(this.settings.maxWordsToMatch, words.length); wordCount >= 1; wordCount--) {
      for (let i = 0; i <= words.length - wordCount; i++) {
        const phrase = words.slice(i, i + wordCount).join(' ');
        const key = this.settings.caseSensitiveMatching ? phrase : phrase.toLowerCase();
        const files = this.termIndex.get(key);
        
        if (files && files.length > 0) {
          matches.push({
            text: phrase,
            startWord: i,
            endWord: i + wordCount,
            wordCount: wordCount,
            files: files
          });
        }
      }
    }
    
    if (this.settings.preferLongerMatches) {
      return this.removeShorterOverlaps(matches);
    }
    return matches;
  }
  
  removeShorterOverlaps(matches) {
    matches.sort((a, b) => b.wordCount - a.wordCount);
    const selected = [];
    const usedPositions = new Set();
    
    for (const match of matches) {
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
  
  refresh() {
    const files = this.app.vault.getMarkdownFiles();
    let updated = false;
    
    for (const file of files) {
      if (this.isFileExcluded(file)) continue;
      const lastMod = this.fileModTimes.get(file.path);
      if (!lastMod || lastMod !== file.stat.mtime) {
        this.indexFile(file);
        updated = true;
      }
    }
    
    if (updated) {
      console.log("WikiVault: Term index refreshed");
    }
  }
}

// ============================================================================
// CATEGORY MANAGER
// ============================================================================

class CategoryManager {
  constructor(app, settings) {
    this.app = app;
    this.settings = settings;
  }
  
  assignCategory(sourceFile) {
    if (!this.settings.useCategories || !this.settings.autoAssignCategory) {
      return this.getDefaultCategory();
    }
    
    const metadata = this.app.metadataCache.getFileCache(sourceFile);
    const tags = (0, import_obsidian.getAllTags)(metadata) || [];
    
    // Try source folder match
    for (const category of this.settings.categories) {
      if (!category.enabled) continue;
      if (category.sourceFolder && sourceFile.path.startsWith(category.sourceFolder)) {
        return category;
      }
    }
    
    // Try tag match
    for (const category of this.settings.categories) {
      if (!category.enabled) continue;
      for (const tag of tags) {
        const cleanTag = tag.replace('#', '');
        if (category.tags.includes(cleanTag)) {
          return category;
        }
      }
    }
    
    return this.getDefaultCategory();
  }
  
  getDefaultCategory() {
    const defaultName = this.settings.defaultCategory;
    const defaultCat = this.settings.categories.find(c => c.name === defaultName);
    return defaultCat || this.settings.categories[0];
  }
  
  async ensureCategory exists(category) {
    const folder = this.app.vault.getAbstractFileByPath(category.path);
    if (!(folder instanceof import_obsidian.TFolder)) {
      await this.app.vault.createFolder(category.path);
    }
  }
}

// ============================================================================
// NOTE GENERATOR
// ============================================================================

class NoteGenerator {
  constructor(app, settings, termCache, categoryManager) {
    this.app = app;
    this.settings = settings;
    this.termCache = termCache;
    this.categoryManager = categoryManager;
  }
  
  async generateAll() {
    const unresolvedLinks = this.app.metadataCache.unresolvedLinks;
    const linkCounts = new Map();
    
    for (const sourcePath in unresolvedLinks) {
      for (const linkName in unresolvedLinks[sourcePath]) {
        const count = unresolvedLinks[sourcePath][linkName];
        const currentCount = linkCounts.get(linkName) || 0;
        linkCounts.set(linkName, currentCount + count);
      }
    }
    
    if (linkCounts.size === 0) {
      new import_obsidian.Notice("WikiVault: No unresolved links found!");
      return;
    }
    
    let linksArray = Array.from(linkCounts.keys());
    if (this.settings.usePriorityQueue) {
      linksArray.sort((a, b) => (linkCounts.get(b) || 0) - (linkCounts.get(a) || 0));
    }
    
    const total = linksArray.length;
    let current = 0;
    const startTime = Date.now();
    
    let notice = null;
    if (this.settings.showProgressNotification) {
      notice = new import_obsidian.Notice(`WikiVault: Processing 0/${total} links...`, 0);
    }
    
    for (let i = 0; i < linksArray.length; i += this.settings.batchSize) {
      const batch = linksArray.slice(i, Math.min(i + this.settings.batchSize, linksArray.length));
      await Promise.all(batch.map(term => this.generateNote(term)));
      
      current += batch.length;
      const elapsed = Date.now() - startTime;
      const avgTime = elapsed / current;
      const remaining = total - current;
      const etaSec = Math.ceil((avgTime * remaining) / 1000);
      
      if (notice) {
        notice.setMessage(`WikiVault: Processing ${current}/${total} - ETA: ${etaSec}s`);
      }
    }
    
    if (notice) notice.hide();
    new import_obsidian.Notice(`WikiVault: Generated ${total} wiki notes!`);
  }
  
  async generateNote(term) {
    try {
      // Extract context
      const contextData = await this.extractContext(term);
      
      // Determine category
      const category = this.determineBestCategory(contextData.sourceFiles);
      await this.categoryManager.ensureCategoryExists(category);
      
      // Build content
      const content = await this.buildNoteContent(term, category, contextData);
      
      // Write file
      const filePath = `${category.path}/${term}.md`;
      const existingFile = this.app.vault.getAbstractFileByPath(filePath);
      
      if (existingFile instanceof import_obsidian.TFile) {
        await this.app.vault.modify(existingFile, content);
      } else {
        await this.app.vault.create(filePath, content);
      }
      
      console.log(`WikiVault: Generated ${term}`);
    } catch (error) {
      console.error(`WikiVault: Error generating ${term}:`, error);
    }
  }
  
  async extractContext(term) {
    const mentions = [];
    const sourceFiles = [];
    const rawContext = [];
    
    const files = this.app.vault.getMarkdownFiles();
    for (const file of files) {
      if (file.path.startsWith(this.settings.customDirectoryName)) continue;
      
      const content = await this.app.vault.read(file);
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for wikilinks
        if (line.includes(`[[${term}]]`) || line.includes(`[[${term}|`)) {
          const heading = this.findPreviousHeading(lines, i);
          const context = this.settings.includeFullParagraphs 
            ? this.extractParagraph(lines, i)
            : this.extractLines(lines, i);
          
          mentions.push({
            file: file,
            heading: heading,
            content: context.join('\n'),
            type: 'wikilinked'
          });
          
          sourceFiles.push(file);
          rawContext.push(context.join(' '));
        }
        
        // Check for virtual mentions
        const matches = this.termCache.findMatches(line);
        for (const match of matches) {
          if (match.files.some(f => f.basename === term || f.basename === getSingularForm(term) || f.basename === getPluralForm(term))) {
            const heading = this.findPreviousHeading(lines, i);
            const context = this.settings.includeFullParagraphs 
              ? this.extractParagraph(lines, i)
              : this.extractLines(lines, i);
            
            mentions.push({
              file: file,
              heading: heading,
              content: context.join('\n'),
              type: 'virtual',
              matchText: match.text,
              alternatives: match.files.map(f => f.basename)
            });
            
            sourceFiles.push(file);
            rawContext.push(context.join(' '));
          }
        }
      }
    }
    
    return {
      mentions: mentions,
      sourceFiles: [...new Set(sourceFiles)],
      rawContext: rawContext.join('\n\n')
    };
  }
  
  findPreviousHeading(lines, currentIndex) {
    for (let i = currentIndex - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith('#')) {
        return line.replace(/^#+\s*/, '');
      }
    }
    return null;
  }
  
  extractParagraph(lines, lineIndex) {
    const paragraph = [];
    let start = lineIndex;
    while (start > 0 && lines[start - 1].trim() !== '') start--;
    let end = lineIndex;
    while (end < lines.length - 1 && lines[end + 1].trim() !== '') end++;
    for (let i = start; i <= end; i++) {
      if (lines[i].trim() !== '') paragraph.push(lines[i]);
    }
    return paragraph;
  }
  
  extractLines(lines, lineIndex) {
    const extracted = [];
    const start = Math.max(0, lineIndex - this.settings.contextLinesAround);
    const end = Math.min(lines.length - 1, lineIndex + this.settings.contextLinesAround);
    for (let i = start; i <= end; i++) {
      extracted.push(lines[i]);
    }
    return extracted;
  }
  
  determineBestCategory(sourceFiles) {
    if (!this.settings.useCategories || sourceFiles.length === 0) {
      return this.categoryManager.getDefaultCategory();
    }
    
    const categoryVotes = new Map();
    for (const file of sourceFiles) {
      const category = this.categoryManager.assignCategory(file);
      const count = categoryVotes.get(category.name) || 0;
      categoryVotes.set(category.name, count + 1);
    }
    
    let maxVotes = 0;
    let bestCategory = this.categoryManager.getDefaultCategory();
    for (const [catName, votes] of categoryVotes) {
      if (votes > maxVotes) {
        maxVotes = votes;
        const cat = this.settings.categories.find(c => c.name === catName);
        if (cat) bestCategory = cat;
      }
    }
    
    return bestCategory;
  }
  
  async buildNoteContent(term, category, contextData) {
    let content = "";
    
    // Frontmatter
    content += "---\n";
    content += `generated: ${new Date().toISOString()}\n`;
    if (this.settings.trackModel) {
      content += `model: ${this.settings.modelName}\n`;
      content += `provider: ${this.settings.provider}\n`;
    }
    
    // Tags
    if (this.settings.generateTags) {
      const tags = await this.generateTags(term, contextData);
      if (tags.length > 0) {
        content += "tags:\n";
        for (const tag of tags) {
          const tagText = this.settings.tagsIncludeHashPrefix 
            ? (tag.startsWith('#') ? tag : `#${tag}`)
            : tag.replace('#', '');
          content += `  - "${tagText}"\n`;
        }
      }
    }
    content += "---\n";
    
    // Title
    content += `# ${term}\n\n`;
    
    // Wikipedia
    if (this.settings.useWikipedia) {
      const wikiData = await this.getWikipediaData(term);
      if (wikiData) {
        content += `## Wikipedia\n`;
        content += `[${this.settings.wikipediaLinkText}](${wikiData.url})\n`;
        content += `${wikiData.extract}\n\n`;
      }
    }
    
    // Dictionary
    if (this.settings.useDictionaryAPI) {
      const dictData = await this.getDictionaryDefinition(term);
      if (dictData) {
        content += `## Dictionary Definition\n`;
        content += dictData.formatted + "\n\n";
      }
    }
    
    // AI Summary with context injection
    let aiContext = contextData.rawContext;
    if (this.settings.useDictionaryInContext && this.settings.useDictionaryAPI) {
      const dictData = await this.getDictionaryDefinition(term);
      if (dictData) aiContext += "\n\nDictionary: " + dictData.plain;
    }
    if (this.settings.useWikipediaInContext && this.settings.useWikipedia) {
      const wikiData = await this.getWikipediaData(term);
      if (wikiData) aiContext += "\n\nWikipedia: " + wikiData.extract;
    }
    if (this.settings.glossaryBasePath) {
      const glossary = await this.getGlossaryContext(term);
      if (glossary) aiContext += "\n\nGlossary: " + glossary;
    }
    
    const aiSummary = await this.getAISummary(term, aiContext);
    if (aiSummary) {
      content += `## AI Summary\n`;
      content += `${this.settings.aiSummaryDisclaimer}\n`;
      
      const paragraphs = aiSummary.split('\n\n');
      for (const para of paragraphs) {
        content += `> ${para}\n`;
        if (paragraphs.indexOf(para) < paragraphs.length - 1) {
          content += ">\n";
        }
      }
      content += "\n";
      
      // Key concepts extraction
      if (this.settings.extractKeyConceptsFromSummary) {
        const keyConcepts = this.extractKeyConcepts(aiSummary);
        if (keyConcepts.length > 0) {
          content += "---\n\n";
          for (const concept of keyConcepts) {
            content += `- **${concept}**\n`;
          }
          content += "\n";
        }
      }
    }
    
    // Related Concepts
    if (this.settings.generateRelatedConcepts) {
      const related = await this.getRelatedConcepts(term, aiContext);
      if (related.length > 0) {
        content += `## Related Concepts\n`;
        for (const concept of related) {
          content += `- [[${concept}]]\n`;
        }
        content += "\n";
      }
    }
    
    // Mentions
    if (contextData.mentions.length > 0) {
      content += `## Mentions\n\n`;
      for (const mention of contextData.mentions) {
        content += this.formatMention(mention);
      }
    }
    
    return content;
  }
  
  extractKeyConcepts(summary) {
    const boldPattern = /\*\*([^*]+)\*\*/g;
    const concepts = [];
    let match;
    while ((match = boldPattern.exec(summary)) !== null) {
      concepts.push(match[1]);
    }
    return [...new Set(concepts)].slice(0, 10);
  }
  
  formatMention(mention) {
    let output = `### From [[${mention.file.basename}]]`;
    if (mention.heading) {
      output += ` → ${mention.heading}`;
    }
    output += "\n";
    
    if (mention.type === 'virtual') {
      output += `> **Detected:** "${mention.matchText}"\n`;
      if (mention.alternatives && mention.alternatives.length > 1) {
        output += `> **Alternatives:** ${mention.alternatives.map(a => `[[${a}]]`).join(', ')}\n`;
      }
      output += ">\n";
    }
    
    const lines = mention.content.split('\n');
    for (const line of lines) {
      output += `> ${line}\n`;
    }
    output += "\n";
    
    return output;
  }
  
  async getWikipediaData(term) {
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${encodeURIComponent(term)}&limit=1`;
      const searchResponse = await (0, import_obsidian.requestUrl)({ url: searchUrl, method: "GET" });
      const searchData = searchResponse.json;
      
      if (!searchData || searchData.length < 4 || !searchData[1][0]) return null;
      
      const title = searchData[1][0];
      const pageUrl = searchData[3][0];
      
      const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(title)}`;
      const extractResponse = await (0, import_obsidian.requestUrl)({ url: extractUrl, method: "GET" });
      const extractData = extractResponse.json;
      
      const pages = extractData?.query?.pages;
      if (!pages) return null;
      
      const pageId = Object.keys(pages)[0];
      const extract = pages[pageId]?.extract;
      if (!extract) return null;
      
      const sentences = extract.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const shortExtract = sentences.slice(0, 3).join('. ') + '.';
      
      return { title: title, url: pageUrl, extract: shortExtract };
    } catch (error) {
      console.error("WikiVault: Wikipedia fetch failed", error);
      return null;
    }
  }
  
  async getDictionaryDefinition(term) {
    try {
      const searchTerm = getSingularForm(term) || term;
      const response = await (0, import_obsidian.requestUrl)({
        url: `${this.settings.dictionaryAPIEndpoint}/${encodeURIComponent(searchTerm)}`,
        method: "GET"
      });
      
      const data = response.json;
      if (!data || !Array.isArray(data) || data.length === 0) return null;
      
      const entry = data[0];
      let formatted = "";
      let plain = "";
      
      if (entry.word) {
        formatted += `**${entry.word}**`;
        plain += `${entry.word}`;
        if (entry.phonetic) {
          formatted += ` _${entry.phonetic}_`;
          plain += ` (${entry.phonetic})`;
        }
        formatted += "\n";
        plain += ": ";
      }
      
      if (entry.meanings && Array.isArray(entry.meanings)) {
        const meaning = entry.meanings[0];
        if (meaning.partOfSpeech) {
          formatted += `_${meaning.partOfSpeech}_\n`;
          plain += `[${meaning.partOfSpeech}] `;
        }
        if (meaning.definitions && Array.isArray(meaning.definitions)) {
          const def = meaning.definitions[0];
          formatted += `${def.definition}\n`;
          plain += `${def.definition}`;
        }
      }
      
      return { formatted: formatted.trim(), plain: plain.trim() };
    } catch (error) {
      console.error("WikiVault: Dictionary API failed", error);
      return null;
    }
  }
  
  async getGlossaryContext(term) {
    if (!this.settings.glossaryBasePath) return "";
    
    try {
      const glossaryFile = this.app.vault.getAbstractFileByPath(this.settings.glossaryBasePath);
      if (!(glossaryFile instanceof import_obsidian.TFile)) return "";
      
      const content = await this.app.vault.read(glossaryFile);
      const lines = content.split('\n');
      
      let extracting = false;
      let glossaryEntry = "";
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.toLowerCase().includes(term.toLowerCase())) {
          extracting = true;
          glossaryEntry += line + "\n";
          continue;
        }
        
        if (extracting) {
          if (line.startsWith('#') || (line.trim() === '' && glossaryEntry.trim() !== '')) {
            break;
          }
          glossaryEntry += line + "\n";
        }
      }
      
      return glossaryEntry.trim();
    } catch (error) {
      console.error("WikiVault: Glossary read failed", error);
      return "";
    }
  }
  
  async getAISummary(term, context) {
    if (!this.settings.openaiApiKey && this.settings.provider !== "lmstudio-native" && this.settings.provider !== "lmstudio-openai") {
      return null;
    }
    
    if (!context || context.trim() === "") return null;
    
    try {
      const userPrompt = this.settings.userPromptTemplate
        .replace('{{term}}', term)
        .replace('{{context}}', context);
      
      const headers = { "Content-Type": "application/json" };
      if (this.settings.openaiApiKey) {
        headers["Authorization"] = `Bearer ${this.settings.openaiApiKey}`;
      }
      
      const response = await (0, import_obsidian.requestUrl)({
        url: `${this.settings.openaiEndpoint}/chat/completions`,
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          model: this.settings.modelName,
          messages: [
            { role: "system", content: this.settings.systemPrompt },
            { role: "user", content: userPrompt }
          ]
        })
      });
      
      const data = response.json;
      return data.choices[0].message.content;
    } catch (error) {
      console.error("WikiVault: AI Summary failed", error);
      return null;
    }
  }
  
  async generateTags(term, contextData) {
    // Simple tag generation from context
    const tags = new Set();
    
    // Add category tags
    for (const file of contextData.sourceFiles) {
      const category = this.categoryManager.assignCategory(file);
      for (const tag of category.tags) {
        tags.add(tag);
      }
      
      // Add file tags
      const metadata = this.app.metadataCache.getFileCache(file);
      const fileTags = (0, import_obsidian.getAllTags)(metadata) || [];
      for (const tag of fileTags) {
        tags.add(tag.replace('#', ''));
      }
    }
    
    return Array.from(tags).slice(0, this.settings.maxTags);
  }
  
  async getRelatedConcepts(term, context) {
    // Extract wikilinks from context as related concepts
    const wikiLinkPattern = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
    const concepts = new Set();
    let match;
    
    while ((match = wikiLinkPattern.exec(context)) !== null) {
      const concept = match[1];
      if (concept !== term && concept.length >= 3) {
        concepts.add(concept);
      }
    }
    
    return Array.from(concepts).slice(0, this.settings.maxRelatedConcepts);
  }
}

// ============================================================================
// MAIN PLUGIN CLASS
// ============================================================================

var WikiVaultUnifiedPlugin = class extends import_obsidian.Plugin {
  async onload() {
    console.log("WikiVault Unified: Loading...");
    
    await this.loadSettings();
    
    // Initialize components
    this.termCache = new TermCache(this.app, this.settings);
    this.categoryManager = new CategoryManager(this.app, this.settings);
    this.generator = new NoteGenerator(this.app, this.settings, this.termCache, this.categoryManager);
    
    // Build initial index
    this.termCache.buildIndex();
    
    // Add ribbon icon
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
      id: "refresh-term-cache",
      name: "Refresh term cache",
      callback: () => {
        this.termCache.buildIndex();
        new import_obsidian.Notice("WikiVault: Term cache refreshed!");
      }
    });
    
    // Add settings tab
    this.addSettingTab(new WikiVaultSettingTab(this.app, this));
    
    // Register events
    if (this.settings.runOnStartup) {
      this.app.workspace.onLayoutReady(() => {
        this.generateWikiNotes();
      });
    }
    
    this.registerEvent(
      this.app.workspace.on("file-open", (file) => {
        if (this.settings.runOnFileSwitch && file) {
          this.generateWikiNotes();
        }
      })
    );
    
    // Refresh cache on file changes
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (file instanceof import_obsidian.TFile) {
          this.termCache.refresh();
        }
      })
    );
    
    console.log("WikiVault Unified: Loaded successfully!");
  }
  
  async generateWikiNotes() {
    this.termCache.refresh();
    await this.generator.generateAll();
  }
  
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  
  async saveSettings() {
    await this.saveData(this.settings);
    if (this.termCache) {
      this.termCache.buildIndex();
    }
  }
  
  onunload() {
    console.log("WikiVault Unified: Unloading...");
  }
};

// ============================================================================
// SETTINGS TAB
// ============================================================================

var WikiVaultSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  
  display() {
    const {containerEl} = this;
    containerEl.empty();
    containerEl.createEl("h1", {text: "WikiVault Unified Settings"});
    
    // AI Provider Section
    containerEl.createEl("h2", {text: "AI Provider"});
    
    new import_obsidian.Setting(containerEl)
      .setName("Provider")
      .setDesc("AI service provider")
      .addDropdown(dropdown => dropdown
        .addOption("mistral", "Mistral AI")
        .addOption("openai", "OpenAI")
        .addOption("lmstudio-openai", "LM Studio (OpenAI Compatible)")
        .addOption("custom", "Custom")
        .setValue(this.plugin.settings.provider)
        .onChange(async (value) => {
          this.plugin.settings.provider = value;
          await this.plugin.saveSettings();
          this.display();
        }));
    
    new import_obsidian.Setting(containerEl)
      .setName("API Endpoint")
      .setDesc("API endpoint URL")
      .addText(text => text
        .setValue(this.plugin.settings.openaiEndpoint)
        .onChange(async (value) => {
          this.plugin.settings.openaiEndpoint = value;
          await this.plugin.saveSettings();
        }));
    
    new import_obsidian.Setting(containerEl)
      .setName("API Key")
      .setDesc("Your API key")
      .addText(text => text
        .setValue(this.plugin.settings.openaiApiKey)
        .onChange(async (value) => {
          this.plugin.settings.openaiApiKey = value;
          await this.plugin.saveSettings();
        }));
    
    new import_obsidian.Setting(containerEl)
      .setName("Model Name")
      .setDesc("Model to use (e.g., mistral-medium-latest)")
      .addText(text => text
        .setValue(this.plugin.settings.modelName)
        .onChange(async (value) => {
          this.plugin.settings.modelName = value;
          await this.plugin.saveSettings();
        }));
    
    // Knowledge Sources
    containerEl.createEl("h2", {text: "Knowledge Sources"});
    
    new import_obsidian.Setting(containerEl)
      .setName("Use Dictionary API")
      .setDesc("Fetch definitions from dictionary")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.useDictionaryAPI)
        .onChange(async (value) => {
          this.plugin.settings.useDictionaryAPI = value;
          await this.plugin.saveSettings();
        }));
    
    new import_obsidian.Setting(containerEl)
      .setName("Use Dictionary in AI Context")
      .setDesc("Pass dictionary definitions to AI")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.useDictionaryInContext)
        .onChange(async (value) => {
          this.plugin.settings.useDictionaryInContext = value;
          await this.plugin.saveSettings();
        }));
    
    new import_obsidian.Setting(containerEl)
      .setName("Use Wikipedia")
      .setDesc("Fetch Wikipedia links and excerpts")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.useWikipedia)
        .onChange(async (value) => {
          this.plugin.settings.useWikipedia = value;
          await this.plugin.saveSettings();
        }));
    
    new import_obsidian.Setting(containerEl)
      .setName("Use Wikipedia in AI Context")
      .setDesc("Pass Wikipedia content to AI")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.useWikipediaInContext)
        .onChange(async (value) => {
          this.plugin.settings.useWikipediaInContext = value;
          await this.plugin.saveSettings();
        }));
    
    new import_obsidian.Setting(containerEl)
      .setName("Glossary Base Path")
      .setDesc("Path to custom glossary file (e.g., Definitions.md)")
      .addText(text => text
        .setValue(this.plugin.settings.glossaryBasePath)
        .onChange(async (value) => {
          this.plugin.settings.glossaryBasePath = value;
          await this.plugin.saveSettings();
        }));
    
    // Generation Features
    containerEl.createEl("h2", {text: "Generation Features"});
    
    new import_obsidian.Setting(containerEl)
      .setName("Generate Tags")
      .setDesc("Auto-generate tags from context")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.generateTags)
        .onChange(async (value) => {
          this.plugin.settings.generateTags = value;
          await this.plugin.saveSettings();
        }));
    
    new import_obsidian.Setting(containerEl)
      .setName("Max Tags")
      .setDesc("Maximum number of tags to generate")
      .addSlider(slider => slider
        .setLimits(1, 30, 1)
        .setValue(this.plugin.settings.maxTags)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.maxTags = value;
          await this.plugin.saveSettings();
        }));
    
    new import_obsidian.Setting(containerEl)
      .setName("Tags Include # Prefix")
      .setDesc("Add # prefix to generated tags")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.tagsIncludeHashPrefix)
        .onChange(async (value) => {
          this.plugin.settings.tagsIncludeHashPrefix = value;
          await this.plugin.saveSettings();
        }));
    
    new import_obsidian.Setting(containerEl)
      .setName("Generate Related Concepts")
      .setDesc("Auto-suggest related terms")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.generateRelatedConcepts)
        .onChange(async (value) => {
          this.plugin.settings.generateRelatedConcepts = value;
          await this.plugin.saveSettings();
        }));
    
    new import_obsidian.Setting(containerEl)
      .setName("Max Related Concepts")
      .setDesc("Maximum number of related concepts")
      .addSlider(slider => slider
        .setLimits(1, 20, 1)
        .setValue(this.plugin.settings.maxRelatedConcepts)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.maxRelatedConcepts = value;
          await this.plugin.saveSettings();
        }));
    
    new import_obsidian.Setting(containerEl)
      .setName("Track Model")
      .setDesc("Record which AI model generated each note")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.trackModel)
        .onChange(async (value) => {
          this.plugin.settings.trackModel = value;
          await this.plugin.saveSettings();
        }));
    
    new import_obsidian.Setting(containerEl)
      .setName("Use Priority Queue")
      .setDesc("Process frequently-mentioned terms first")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.usePriorityQueue)
        .onChange(async (value) => {
          this.plugin.settings.usePriorityQueue = value;
          await this.plugin.saveSettings();
        }));
    
    // Categories
    containerEl.createEl("h2", {text: "Organization"});
    
    new import_obsidian.Setting(containerEl)
      .setName("Use Custom Directory")
      .setDesc("Save wiki notes in specific folder")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.useCustomDirectory)
        .onChange(async (value) => {
          this.plugin.settings.useCustomDirectory = value;
          await this.plugin.saveSettings();
        }));
    
    new import_obsidian.Setting(containerEl)
      .setName("Directory Name")
      .setDesc("Folder for wiki notes")
      .addText(text => text
        .setValue(this.plugin.settings.customDirectoryName)
        .onChange(async (value) => {
          this.plugin.settings.customDirectoryName = value;
          await this.plugin.saveSettings();
        }));
    
    new import_obsidian.Setting(containerEl)
      .setName("Use Categories")
      .setDesc("Organize notes into subject-based subfolders")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.useCategories)
        .onChange(async (value) => {
          this.plugin.settings.useCategories = value;
          await this.plugin.saveSettings();
        }));
    
    // Performance
    containerEl.createEl("h2", {text: "Performance"});
    
    new import_obsidian.Setting(containerEl)
      .setName("Batch Size")
      .setDesc("Number of notes to process simultaneously")
      .addSlider(slider => slider
        .setLimits(1, 20, 1)
        .setValue(this.plugin.settings.batchSize)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.batchSize = value;
          await this.plugin.saveSettings();
        }));
    
    new import_obsidian.Setting(containerEl)
      .setName("Show Progress Notification")
      .setDesc("Display progress during generation")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showProgressNotification)
        .onChange(async (value) => {
          this.plugin.settings.showProgressNotification = value;
          await this.plugin.saveSettings();
        }));
    
    // Matching
    containerEl.createEl("h2", {text: "Term Matching"});
    
    new import_obsidian.Setting(containerEl)
      .setName("Min Word Length")
      .setDesc("Minimum characters for term matching")
      .addSlider(slider => slider
        .setLimits(2, 10, 1)
        .setValue(this.plugin.settings.minWordLengthForAutoDetect)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.minWordLengthForAutoDetect = value;
          await this.plugin.saveSettings();
        }));
    
    new import_obsidian.Setting(containerEl)
      .setName("Max Words to Match")
      .setDesc("Check 1-word, 2-word, or 3-word combinations")
      .addSlider(slider => slider
        .setLimits(1, 5, 1)
        .setValue(this.plugin.settings.maxWordsToMatch)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.maxWordsToMatch = value;
          await this.plugin.saveSettings();
        }));
    
    new import_obsidian.Setting(containerEl)
      .setName("Prefer Longer Matches")
      .setDesc("Prioritize multi-word matches (e.g., 'Smooth Muscle' over 'Smooth')")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.preferLongerMatches)
        .onChange(async (value) => {
          this.plugin.settings.preferLongerMatches = value;
          await this.plugin.saveSettings();
        }));
    
    new import_obsidian.Setting(containerEl)
      .setName("Match Whole Words Only")
      .setDesc("Prevent partial matches (recommended)")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.matchWholeWordsOnly)
        .onChange(async (value) => {
          this.plugin.settings.matchWholeWordsOnly = value;
          await this.plugin.saveSettings();
        }));
  }
};
