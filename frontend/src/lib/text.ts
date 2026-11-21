export const wordCount = (text: string): number => {
    const t = text.trim();
    return t ? t.split(/\s+/).length : 0;
};