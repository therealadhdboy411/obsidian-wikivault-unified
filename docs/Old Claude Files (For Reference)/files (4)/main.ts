import { Notice, Plugin, PluginSettingTab, Setting, TFile, TFolder, requestUrl } from 'obsidian';

interface WikiVaultSettings {
	apiProvider: 'openai' | 'lmstudio';
	openaiEndpoint: string;
	openaiApiKey: string;
	modelName: string;
	lmstudioEndpoint: string;
	lmstudioApiKey: string;
	similarityThreshold: number;
	runOnStartup: boolean;
	runOnFileSwitch: boolean;
	useCustomDirectory: boolean;
	customDirectoryName: string;
	showProgressNotification: boolean;
}

const DEFAULT_SETTINGS: WikiVaultSettings = {
	apiProvider: 'openai',
	openaiEndpoint: 'https://api.openai.com/v1',
	openaiApiKey: '',
	modelName: 'gpt-3.5-turbo',
	lmstudioEndpoint: 'http://localhost:1234',
	lmstudioApiKey: '',
	similarityThreshold: 0.9,
	runOnStartup: false,
	runOnFileSwitch: false,
	useCustomDirectory: true,
	customDirectoryName: 'Vault Wiki',
	showProgressNotification: true
};

export default class WikiVaultPlugin extends Plugin {
	settings: WikiVaultSettings;
	statusBarItemEl: HTMLElement;

	async onload() {
		await this.loadSettings();

		this.statusBarItemEl = this.addStatusBarItem();
		this.statusBarItemEl.setText('');

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

		if (linksToProcess.size === 0) return;

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
		const baseFileName = `${linkName}.md`;
		const fullPath = this.settings.useCustomDirectory
			? `${this.settings.customDirectoryName}/${baseFileName}`
			: baseFileName;

		const existingFile = this.app.vault.getAbstractFileByPath(fullPath);

		let content = '';

		// Check for fuzzy matches
		const fuzzyMatch = this.findFuzzyMatch(linkName);
		if (fuzzyMatch && fuzzyMatch.basename.toLowerCase() !== linkName.toLowerCase()) {
			content += `See [[${fuzzyMatch.basename}]]\n\n`;
		}

		// Extract context
		const context = await this.extractContext(linkName);
		content += `## Mentions\n\n${context}\n\n`;

		// Get AI summary
		const summary = await this.getAISummary(linkName);
		if (summary) {
			content = `# ${linkName}\n\n> ${summary}\n\n` + content;
		} else {
			content = `# ${linkName}\n\n` + content;
		}

		// Create or update file
		if (existingFile instanceof TFile) {
			await this.app.vault.modify(existingFile, content);
		} else {
			await this.app.vault.create(fullPath, content);
		}
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
				if (i === 0) costs[j] = j;
				else {
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

		for (const file of files) {
			// Skip files in the wiki directory
			if (this.settings.useCustomDirectory && file.path.startsWith(this.settings.customDirectoryName))
				continue;

			const content = await this.app.vault.read(file);
			if (content.includes(`[[${linkName}]]`) || content.includes(`[[${linkName}|`)) {
				const lines = content.split('\n');
				for (let i = 0; i < lines.length; i++) {
					const line = lines[i];
					if (line.includes(`[[${linkName}]]`) || line.includes(`[[${linkName}|`)) {
						context += `From [[${file.basename}]]:\n`;

						if (this.isBulletPoint(line)) {
							// Include previous bullet if it exists
							if (i > 0 && this.isBulletPoint(lines[i - 1])) {
								context += `> ${lines[i - 1]}\n`;
							}

							context += `> ${line}\n`;

							// Include child bullets
							let j = i + 1;
							const currentIndent = this.getIndentLevel(line);
							while (j < lines.length) {
								const nextLine = lines[j];
								// Handle blank lines between nested bullets
								if (nextLine.trim() === '' && j + 1 < lines.length &&
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
							context += `> ${line}\n`;
						}
						context += '\n';
					}
				}
			}
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

	async getAISummary(linkName: string): Promise<string | null> {
		if (this.settings.apiProvider === 'lmstudio') {
			return await this.getLMStudioSummary(linkName);
		} else {
			return await this.getOpenAISummary(linkName);
		}
	}

	async getOpenAISummary(linkName: string): Promise<string | null> {
		if (!this.settings.openaiApiKey) return null;

		try {
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
						{ role: 'system', content: 'You are a helpful assistant that provides concise, Wikipedia-style definitions for terms.' },
						{ role: 'user', content: `Provide a one-paragraph summary/definition for the term: "${linkName}"` }
					]
				})
			});

			const data = response.json;
			return data.choices[0].message.content;
		} catch (error) {
			console.error('WikiVault: OpenAI Summary failed', error);
			return null;
		}
	}

	async getLMStudioSummary(linkName: string): Promise<string | null> {
		try {
			const headers: Record<string, string> = {
				'Content-Type': 'application/json'
			};

			// Add authentication if API key is provided
			if (this.settings.lmstudioApiKey) {
				headers['Authorization'] = `Bearer ${this.settings.lmstudioApiKey}`;
			}

			const response = await requestUrl({
				url: `${this.settings.lmstudioEndpoint}/api/v1/chat`,
				method: 'POST',
				headers: headers,
				body: JSON.stringify({
					model: this.settings.modelName,
					messages: [
						{
							role: 'system',
							content: 'You are a helpful assistant that provides concise, Wikipedia-style definitions for terms.'
						},
						{
							role: 'user',
							content: `Provide a one-paragraph summary/definition for the term: "${linkName}"`
						}
					]
				})
			});

			const data = response.json;
			
			// LM Studio's native API returns messages in a similar format
			if (data.choices && data.choices[0] && data.choices[0].message) {
				return data.choices[0].message.content;
			}
			
			return null;
		} catch (error) {
			console.error('WikiVault: LM Studio Summary failed', error);
			return null;
		}
	}
}

class WikiVaultSettingTab extends PluginSettingTab {
	plugin: WikiVaultPlugin;

	constructor(app: any, plugin: WikiVaultPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'AI Configuration' });

		// API Provider selection
		new Setting(containerEl)
			.setName('API Provider')
			.setDesc('Choose your AI provider')
			.addDropdown(dropdown => dropdown
				.addOption('openai', 'OpenAI / OpenAI-compatible')
				.addOption('lmstudio', 'LM Studio (Native API)')
				.setValue(this.plugin.settings.apiProvider)
				.onChange(async (value: 'openai' | 'lmstudio') => {
					this.plugin.settings.apiProvider = value;
					await this.plugin.saveSettings();
					this.display(); // Refresh to show relevant settings
				}));

		// OpenAI-compatible settings
		if (this.plugin.settings.apiProvider === 'openai') {
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
		}

		// LM Studio settings
		if (this.plugin.settings.apiProvider === 'lmstudio') {
			new Setting(containerEl)
				.setName('LM Studio Endpoint')
				.setDesc('The base URL for your LM Studio server (e.g., http://localhost:1234)')
				.addText(text => text
					.setPlaceholder('http://localhost:1234')
					.setValue(this.plugin.settings.lmstudioEndpoint)
					.onChange(async (value) => {
						this.plugin.settings.lmstudioEndpoint = value;
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName('API Key (Optional)')
				.setDesc('Your LM Studio API key if authentication is enabled')
				.addText(text => text
					.setPlaceholder('Leave empty if not using authentication')
					.setValue(this.plugin.settings.lmstudioApiKey)
					.onChange(async (value) => {
						this.plugin.settings.lmstudioApiKey = value;
						await this.plugin.saveSettings();
					}));

			containerEl.createEl('p', {
				text: 'Note: Make sure your LM Studio server is running and a model is loaded.',
				cls: 'setting-item-description'
			});
		}

		// Model name (common to both)
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

		containerEl.createEl('h2', { text: 'Storage & Organization' });

		new Setting(containerEl)
			.setName('Use Custom Directory')
			.setDesc('Save all generated Wiki notes in a specific folder')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useCustomDirectory)
				.onChange(async (value) => {
					this.plugin.settings.useCustomDirectory = value;
					await this.plugin.saveSettings();
					this.display(); // Refresh to show/hide directory name setting
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
