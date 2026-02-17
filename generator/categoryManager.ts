import { TFile, getAllTags, MetadataCache, App } from 'obsidian';

export interface Category {
    name: string;
    path: string;
    enabled: boolean;
    sourceFolder?: string;
    tags: string[];
}

export class CategoryManager {
    private app: App;
    private settings: any; // Will be typed once settings interface is merged

    constructor(app: App, settings: any) {
        this.app = app;
        this.settings = settings;
    }

    assignCategory(file: TFile): Category {
        if (!this.settings.useCategories || !this.settings.categories) {
            return this.getDefaultCategory();
        }

        const metadata = this.app.metadataCache.getFileCache(file);
        if (!metadata) return this.getDefaultCategory();
        const tags = getAllTags(metadata) || [];

        // Try to match by source folder
        for (const category of this.settings.categories) {
            if (!category.enabled) continue;

            if (category.sourceFolder &&
                file.path.startsWith(category.sourceFolder)) {
                return category;
            }
        }

        // Try to match by tags
        for (const category of this.settings.categories) {
            if (!category.enabled) continue;

            for (const tag of tags) {
                const cleanTag = tag.replace('#', '');
                if (category.tags.includes(cleanTag)) {
                    return category;
                }
            }
        }

        // Default category
        return this.getDefaultCategory();
    }

    getDefaultCategory(): Category {
        if (this.settings.categories && this.settings.categories.length > 0) {
            const defaultCat = this.settings.categories.find((c: Category) => c.name === this.settings.defaultCategory);
            return defaultCat || this.settings.categories[0];
        }

        return {
            name: 'Default',
            path: this.settings.customDirectoryName || 'Wiki',
            enabled: true,
            tags: []
        };
    }

    getWikiPath(category: Category, fileName: string): string {
        return `${category.path}/${fileName}.md`;
    }
}
