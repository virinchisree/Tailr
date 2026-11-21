const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function timeAgo(date: string | Date, now: number = Date.now()): string {
    const diff = now - new Date(date).getTime();
    if (diff < MINUTE) return 'Just now';
    if (diff < HOUR) return `${Math.floor(diff / MINUTE)} min ago`;
    if (diff < DAY) return `${Math.floor(diff / HOUR)} hr ago`;
    const days = Math.floor(diff / DAY);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
}

export const plural = (n: number, word: string): string => `${n} ${word}${n === 1 ? '' : 's'}`;

export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}