export function getSingularForm(word: string): string | null {
    if (word.endsWith('s')) {
        return word.slice(0, -1);
    }
    return null;
}

export function getPluralForm(word: string): string | null {
    if (!word.endsWith('s')) {
        return word + 's';
    }
    return null;
}
