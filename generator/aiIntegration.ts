import { requestUrl } from 'obsidian';

export interface AIProvider {
    name: string;
    endpoint: string;
    apiKey: string;
    model: string;
}

export class AIIntegration {
    private settings: any;

    constructor(settings: any) {
        this.settings = settings;
    }

    async getAISummary(term: string, context: string): Promise<string> {
        // Simple fallback chain logic
        const providers = this.getProviders();

        for (const provider of providers) {
            try {
                return await this.queryProvider(provider, term, context);
            } catch (e) {
                console.error(`Failed to query ${provider.name}:`, e);
                continue;
            }
        }

        throw new Error("All AI providers failed.");
    }

    private getProviders(): AIProvider[] {
        const providers: AIProvider[] = [];

        // Use custom endpoint if provided, otherwise fallback to OpenAI
        if (this.settings.aiEndpoint && this.settings.aiEndpoint !== 'https://api.openai.com/v1/chat/completions') {
            providers.push({
                name: 'Custom Endpoint',
                endpoint: this.settings.aiEndpoint,
                apiKey: this.settings.openaiKey, // Reuse key or allow custom
                model: this.settings.openaiModel
            });
        }

        if (this.settings.openaiKey) {
            providers.push({
                name: 'OpenAI',
                endpoint: 'https://api.openai.com/v1/chat/completions',
                apiKey: this.settings.openaiKey,
                model: this.settings.openaiModel || 'gpt-3.5-turbo'
            });
        }
        return providers;
    }

    private async queryProvider(provider: AIProvider, term: string, context: string): Promise<string> {
        const prompt = this.settings.aiPrompt
            ? this.settings.aiPrompt.replace('{{term}}', term).replace('{{context}}', context)
            : `Summarize the concept of "${term}" based on these mentions:\n\n${context}`;

        const response = await requestUrl({
            url: provider.endpoint,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${provider.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: provider.model,
                messages: [
                    { role: 'system', content: this.settings.systemPrompt || 'You are a helpful assistant creating a wiki.' },
                    { role: 'user', content: prompt }
                ]
            })
        });

        const data = response.json;
        return data.choices[0].message.content;
    }

    async getWikipediaData(term: string): Promise<{url: string, extract: string} | null> {
        try {
            const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`;
            const response = await requestUrl(url);
            if (response.status === 200) {
                const data = response.json;
                return {
                    url: data.content_urls.desktop.page,
                    extract: data.extract
                };
            }
        } catch (e) {
            console.error("Wikipedia fetch failed:", e);
        }
        return null;
    }
}
