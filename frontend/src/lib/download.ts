export function saveBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function resumeFileName(resumeText: string, ext: string): string {
    const firstLine = resumeText.split('\n').find((l) => l.trim()) ?? '';
    const base = firstLine.trim().replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'My';
    return `${base}_Resume.${ext}`;
}