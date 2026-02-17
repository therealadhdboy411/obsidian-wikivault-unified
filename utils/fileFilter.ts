import { TFile } from 'obsidian';

export function isFileExcluded(file: TFile, excludedTypes: string[], excludedDirs: string[]): boolean {
    const ext = file.extension.toLowerCase();
    if (excludedTypes.includes(ext)) return true;

    for (const dir of excludedDirs) {
        if (file.path.startsWith(dir)) return true;
    }

    return false;
}
