import { App, Plugin, PluginSettingTab, Setting, Notice, TFile, TFolder, requestUrl } from 'obsidian';

interface WikiVaultSettings {
	openaiEndpoint: string;
	openaiApiKey: string;
	modelName: string;
	similarityThreshold: number;
	runOnStartup: boolean;
	runOnFileSwitch: boolean;
	useCustomDirectory: boolean;
	customDirectoryName: string;
	showProgressNotification: boolean;
	batchSize: number;
	customPrompt: string;
	useDictionaryAPI: boolean;
	dictionaryAPIEndpoint: string;
	handlePlurals: boolean;
}

const DEFAULT_SETTINGS: WikiVaultSettings = {
	openaiEndpoint: 'https://api.openai.com/v1',
	openaiApiKey: '',
	modelName: 'gpt-3.5-turbo',
	similarityThreshold: 0.9,
	runOnStartup: false,
	runOnFileSwitch: false,
	useCustomDirectory: true,
	customDirectoryName: 'Vault Wiki',
	showProgressNotification: true,
	batchSize: 5,
	customPrompt: 'You are a helpful assistant that provides concise, Wikipedia-style definitions for terms. Provide a one-paragraph summary/definition for the term: "{term}"',
	useDictionaryAPI: true,
	dictionaryAPIEndpoint: 'https://api.dictionaryapi.dev/api/v2/entries/en/',
	handlePlurals: true
};

export default class WikiVaultPlugin extends Plugin {
	settings: WikiVaultSettings;
	statusBarItemEl: HTMLElement;
	ribbonIconEl: HTMLElement;

	async onload() {
		await this.loadSettings();

		this.statusBarItemEl = this.addStatusBarItem();
		this.statusBarItemEl.setText('');

		// Add ribbon icon
		this.ribbonIconEl = this.addRibbonIcon('book-open', 'Generate WikiVault Notes', () => {
			this.generateMissingNotes();
		});

		this.addCommand({
			id: 'generate-missing-notes',
			name: 'Generate missing Wikilink notes',
			callback: () => this.generateMissingNotes()
		});

		this.addSettingTab(new WikiVaultSettingTab(this.app, this));

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

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async ensureDirectoryExists(path: string) {
		const folder = this.app.vault.getAbstractFileByPath(path);
		if (!(folder instanceof TFolder)) {
			await this.app.vault.createFolder(path);
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
		const startTime = Date.now();
		let notice: Notice | null = null;

		if (this.settings.showProgressNotification) {
			notice = new Notice(`WikiVault: Processing 0/${total} links... (Calculating ETA...)`, 0);
		}

		const linksArray = Array.from(linksToProcess);
		
		// Process in batches
		for (let i = 0; i < linksArray.length; i += this.settings.batchSize) {
			const batch = linksArray.slice(i, i + this.settings.batchSize);
			
			// Process batch in parallel
			await Promise.all(batch.map(linkName => this.processWikiLink(linkName)));
			
			current += batch.length;
			
			// Calculate ETA
			const elapsed = Date.now() - startTime;
			const rate = current / elapsed; // links per ms
			const remaining = total - current;
			const etaMs = remaining / rate;
			const etaSeconds = Math.round(etaMs / 1000);
			const etaText = etaSeconds > 60 
				? `${Math.floor(etaSeconds / 60)}m ${etaSeconds % 60}s`
				: `${etaSeconds}s`;

			const progressText = `WikiVault: ${current}/${total} links`;
			const progressPercent = Math.round((current / total) * 100);
			
			this.statusBarItemEl.setText(`${progressText} (${progressPercent}%)`);
			
			if (notice) {
				const etaDisplay = current < total ? ` - ETA: ${etaText}` : '';
				notice.setMessage(`WikiVault: Processing ${current}/${total} links (${progressPercent}%)${etaDisplay}`);
			}
		}

		setTimeout(() => {
			this.statusBarItemEl.setText('');
			if (notice) notice.hide();
			new Notice(`WikiVault: Completed processing ${total} links.`);
		}, 2000);
	}

	async processWikiLink(linkName: string) {
		const baseFileName = `${linkName}.md`;
		const fullPath = this.settings.useCustomDirectory
			? `${this.settings.customDirectoryName}/${baseFileName}`
			: baseFileName;

		const existingFile = this.app.vault.getAbstractFileByPath(fullPath);

		let content = '';

		// Check for fuzzy match
		const fuzzyMatch = this.findFuzzyMatch(linkName);
		if (fuzzyMatch && fuzzyMatch.basename.toLowerCase() !== linkName.toLowerCase()) {
			content += `See [[${fuzzyMatch.basename}]]\n\n`;
		}

		// Handle plurals
		let pluralSection = '';
		if (this.settings.handlePlurals) {
			const pluralInfo = this.detectPlural(linkName);
			if (pluralInfo) {
				pluralSection = `## About this term\n\nThis appears to be the ${pluralInfo.type} form of "${pluralInfo.singular}".\n\n`;
			}
		}

		// Extract context
		const context = await this.extractContext(linkName);
		
		// Get dictionary definition
		let dictionaryDef = '';
		if (this.settings.useDictionaryAPI) {
			const dictResult = await this.getDictionaryDefinition(linkName);
			if (dictResult) {
				dictionaryDef = `## Dictionary Definition\n\n${dictResult}\n\n`;
			}
		}

		// Get AI summary with batch support
		const summary = await this.getAISummary(linkName);
		
		// Build final content
		if (summary) {
			content = `# ${linkName}\n\n> ${summary}\n\n` + content;
		} else {
			content = `# ${linkName}\n\n` + content;
		}

		if (dictionaryDef) {
			content += dictionaryDef;
		}

		if (pluralSection) {
			content += pluralSection;
		}

		content += `## Mentions\n\n${context}\n\n`;

		if (existingFile instanceof TFile) {
			await this.app.vault.modify(existingFile, content);
		} else {
			await this.app.vault.create(fullPath, content);
		}
	}

	detectPlural(term: string): { type: string; singular: string } | null {
		const lower = term.toLowerCase();
		
		// Common plural patterns
		if (lower.endsWith('ies') && lower.length > 4) {
			const singular = term.slice(0, -3) + 'y';
			return { type: 'plural', singular };
		}
		if (lower.endsWith('es') && lower.length > 3) {
			// Check for -ches, -shes, -xes, -zes, -sses
			if (lower.endsWith('ches') || lower.endsWith('shes') || 
			    lower.endsWith('xes') || lower.endsWith('zes') || 
			    lower.endsWith('sses')) {
				const singular = term.slice(0, -2);
				return { type: 'plural', singular };
			}
			// Could be regular -es plural
			const singular = term.slice(0, -2);
			return { type: 'plural', singular };
		}
		if (lower.endsWith('s') && lower.length > 2 && !lower.endsWith('ss')) {
			const singular = term.slice(0, -1);
			return { type: 'plural', singular };
		}
		
		// Irregular plurals
		const irregulars: { [key: string]: string } = {
			'children': 'child',
			'men': 'man',
			'women': 'woman',
			'people': 'person',
			'teeth': 'tooth',
			'feet': 'foot',
			'mice': 'mouse',
			'geese': 'goose'
		};
		
		if (irregulars[lower]) {
			return { type: 'irregular plural', singular: irregulars[lower] };
		}
		
		return null;
	}

	async getDictionaryDefinition(term: string): Promise<string | null> {
		if (!this.settings.dictionaryAPIEndpoint) return null;

		try {
			const url = `${this.settings.dictionaryAPIEndpoint}${encodeURIComponent(term)}`;
			const response = await requestUrl({ url, method: 'GET' });
			
			if (response.status === 200 && response.json && response.json.length > 0) {
				const data = response.json[0];
				const meanings = data.meanings || [];
				
				let definition = '';
				for (let i = 0; i < Math.min(2, meanings.length); i++) {
					const meaning = meanings[i];
					const partOfSpeech = meaning.partOfSpeech || '';
					const defs = meaning.definitions || [];
					
					if (defs.length > 0) {
						definition += `**${partOfSpeech}**: ${defs[0].definition}\n\n`;
						
						if (defs[0].example) {
							definition += `*Example: "${defs[0].example}"*\n\n`;
						}
					}
				}
				
				return definition.trim();
			}
		} catch (error) {
			console.log('WikiVault: Dictionary lookup failed (this is normal for technical terms):', error);
		}
		
		return null;
	}

	findFuzzyMatch(linkName: string): TFile | null {
		const files = this.app.vault.getMarkdownFiles();
		
		for (const file of files) {
			const similarity = this.calculateSimilarity(
				linkName.toLowerCase(),
				file.basename.toLowerCase()
			);
			if (similarity >= this.settings.similarityThreshold) {
				return file;
			}
		}
		
		return null;
	}

	calculateSimilarity(s1: string, s2: string): number {
		const longer = s1.length > s2.length ? s1 : s2;
		const shorter = s1.length > s2.length ? s2 : s1;
		
		if (longer.length === 0) return 1.0;
		
		return (longer.length - this.editDistance(longer, shorter)) / longer.length;
	}

	editDistance(s1: string, s2: string): number {
		const costs: number[] = [];
		
		for (let i = 0; i <= s1.length; i++) {
			let lastValue = i;
			for (let j = 0; j <= s2.length; j++) {
				if (i === 0) {
					costs[j] = j;
				} else {
					if (j > 0) {
						let newValue = costs[j - 1];
						if (s1.charAt(i - 1) !== s2.charAt(j - 1))
							newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
						costs[j - 1] = lastValue;
						lastValue = newValue;
					}
				}
			}
			if (i > 0) costs[s2.length] = lastValue;
		}
		
		return costs[s2.length];
	}

	async extractContext(linkName: string): Promise<string> {
		let context = '';
		const files = this.app.vault.getMarkdownFiles();
		let mentionCount = 0;
		const maxMentions = 10; // Limit to prevent overwhelming content

		for (const file of files) {
			if (this.settings.useCustomDirectory && 
			    file.path.startsWith(this.settings.customDirectoryName)) continue;

			const content = await this.app.vault.read(file);
			
			// Improved regex for wikilink detection
			const wikiLinkPattern = new RegExp(`\\[\\[${this.escapeRegex(linkName)}(?:\\|[^\\]]*)?\\]\\]`, 'gi');
			
			if (wikiLinkPattern.test(content)) {
				const lines = content.split('\n');
				
				for (let i = 0; i < lines.length; i++) {
					const line = lines[i];
					wikiLinkPattern.lastIndex = 0; // Reset regex
					
					if (wikiLinkPattern.test(line)) {
						if (mentionCount >= maxMentions) break;
						
						context += `From [[${file.basename}]]:\n`;
						
						// Enhanced context extraction with surrounding lines
						if (this.isBulletPoint(line)) {
							// Get parent bullet if exists
							if (i > 0 && this.isBulletPoint(lines[i - 1])) {
								context += `> ${lines[i - 1]}\n`;
							}
							
							context += `> ${line}\n`;
							
							// Get child bullets
							let j = i + 1;
							const currentIndent = this.getIndentLevel(line);
							while (j < lines.length) {
								const nextLine = lines[j];
								
								// Handle empty lines between nested bullets
								if (nextLine.trim() === '' && 
								    j + 1 < lines.length && 
								    this.getIndentLevel(lines[j + 1]) > currentIndent) {
									j++;
									continue;
								}
								
								if (this.getIndentLevel(nextLine) > currentIndent) {
									context += `> ${nextLine}\n`;
									j++;
								} else {
									break;
								}
							}
						} else {
							// Add surrounding context for non-bullet points
							if (i > 0 && lines[i - 1].trim() !== '') {
								context += `> ${lines[i - 1]}\n`;
							}
							context += `> ${line}\n`;
							if (i < lines.length - 1 && lines[i + 1].trim() !== '') {
								context += `> ${lines[i + 1]}\n`;
							}
						}
						
						context += '\n';
						mentionCount++;
					}
				}
			}
			
			if (mentionCount >= maxMentions) break;
		}

		if (mentionCount === 0) {
			context = '*No mentions found in the vault.*\n';
		}

		return context;
	}

	escapeRegex(str: string): string {
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	isBulletPoint(line: string): boolean {
		const trimmed = line.trim();
		return trimmed.startsWith('- ') || 
		       trimmed.startsWith('* ') || 
		       /^\d+\. /.test(trimmed);
	}

	getIndentLevel(line: string): number {
		const match = line.match(/^(\s*)/);
		return match ? match[1].length : 0;
	}

	async getAISummary(linkName: string): Promise<string | null> {
		if (!this.settings.openaiApiKey) return null;

		try {
			// Replace {term} placeholder in custom prompt
			const prompt = this.settings.customPrompt.replace(/{term}/g, linkName);
			
			const response = await requestUrl({
				url: `${this.settings.openaiEndpoint}/chat/completions`,
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.settings.openaiApiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: this.settings.modelName,
					messages: [
						{ role: 'user', content: prompt }
					],
					temperature: 0.7,
					max_tokens: 200
				})
			});

			const data = response.json;
			return data.choices[0].message.content.trim();
		} catch (error) {
			console.error('WikiVault: AI Summary failed', error);
			return null;
		}
	}
}

class WikiVaultSettingTab extends PluginSettingTab {
	plugin: WikiVaultPlugin;

	constructor(app: App, plugin: WikiVaultPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'AI Configuration' });

		new Setting(containerEl)
			.setName('OpenAI Compatible Endpoint')
			.setDesc('The API endpoint for your AI model (e.g., https://api.openai.com/v1)')
			.addText(text => text
				.setPlaceholder('https://api.openai.com/v1')
				.setValue(this.plugin.settings.openaiEndpoint)
				.onChange(async (value) => {
					this.plugin.settings.openaiEndpoint = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('API Key')
			.setDesc('Your API key for the endpoint')
			.addText(text => text
				.setPlaceholder('sk-...')
				.setValue(this.plugin.settings.openaiApiKey)
				.onChange(async (value) => {
					this.plugin.settings.openaiApiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Model Name')
			.setDesc('The name of the model to use')
			.addText(text => text
				.setPlaceholder('gpt-3.5-turbo')
				.setValue(this.plugin.settings.modelName)
				.onChange(async (value) => {
					this.plugin.settings.modelName = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Custom Prompt')
			.setDesc('Customize the AI prompt. Use {term} as a placeholder for the link name.')
			.addTextArea(text => text
				.setPlaceholder('You are a helpful assistant...')
				.setValue(this.plugin.settings.customPrompt)
				.onChange(async (value) => {
					this.plugin.settings.customPrompt = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h2', { text: 'Dictionary Integration' });

		new Setting(containerEl)
			.setName('Use Dictionary API')
			.setDesc('Fetch dictionary definitions before AI summary')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useDictionaryAPI)
				.onChange(async (value) => {
					this.plugin.settings.useDictionaryAPI = value;
					await this.plugin.saveSettings();
					this.display();
				}));

		if (this.plugin.settings.useDictionaryAPI) {
			new Setting(containerEl)
				.setName('Dictionary API Endpoint')
				.setDesc('Free Dictionary API endpoint (default: dictionaryapi.dev)')
				.addText(text => text
					.setPlaceholder('https://api.dictionaryapi.dev/api/v2/entries/en/')
					.setValue(this.plugin.settings.dictionaryAPIEndpoint)
					.onChange(async (value) => {
						this.plugin.settings.dictionaryAPIEndpoint = value;
						await this.plugin.saveSettings();
					}));
		}

		containerEl.createEl('h2', { text: 'Storage & Organization' });

		new Setting(containerEl)
			.setName('Use Custom Directory')
			.setDesc('Save all generated Wiki notes in a specific folder')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useCustomDirectory)
				.onChange(async (value) => {
					this.plugin.settings.useCustomDirectory = value;
					await this.plugin.saveSettings();
					this.display();
				}));

		if (this.plugin.settings.useCustomDirectory) {
			new Setting(containerEl)
				.setName('Directory Name')
				.setDesc('The folder where Wiki notes will be stored')
				.addText(text => text
					.setPlaceholder('Vault Wiki')
					.setValue(this.plugin.settings.customDirectoryName)
					.onChange(async (value) => {
						this.plugin.settings.customDirectoryName = value;
						await this.plugin.saveSettings();
					}));
		}

		containerEl.createEl('h2', { text: 'Behavior & Triggers' });

		new Setting(containerEl)
			.setName('Run on Startup')
			.setDesc('Automatically scan and update notes when Obsidian starts')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.runOnStartup)
				.onChange(async (value) => {
					this.plugin.settings.runOnStartup = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Run on File Change')
			.setDesc('Scan and update notes whenever you switch to a different file')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.runOnFileSwitch)
				.onChange(async (value) => {
					this.plugin.settings.runOnFileSwitch = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Show Progress Notification')
			.setDesc('Show a persistent notification while processing links')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showProgressNotification)
				.onChange(async (value) => {
					this.plugin.settings.showProgressNotification = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Handle Plurals')
			.setDesc('Detect and explain plural forms of terms')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.handlePlurals)
				.onChange(async (value) => {
					this.plugin.settings.handlePlurals = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h2', { text: 'Performance' });

		new Setting(containerEl)
			.setName('Batch Size')
			.setDesc('Number of links to process in parallel (higher = faster but more API load)')
			.addSlider(slider => slider
				.setLimits(1, 20, 1)
				.setValue(this.plugin.settings.batchSize)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.batchSize = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Similarity Threshold')
			.setDesc('Threshold for fuzzy matching (0.0 to 1.0) for "See also" links')
			.addSlider(slider => slider
				.setLimits(0.5, 1.0, 0.05)
				.setValue(this.plugin.settings.similarityThreshold)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.similarityThreshold = value;
					await this.plugin.saveSettings();
				}));
	}
}
