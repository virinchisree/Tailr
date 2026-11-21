import { cn } from "../../lib/cn";
import styles from "./Logo.module.css";

type LogoTone = 'dark' | 'accent' | 'light';

const COLORS: Record<LogoTone, { bg: string; fg: string }> = {
    dark: { bg: '#111110', fg: '#ffffff' },
    accent: { bg: '#2B4FE0', fg: '#ffffff' },
    light: { bg: '#ffffff', fg: '#111110' },
};

const T_PATH = 'M6 8.5h6.5M9.5 5v8.4c0 2 1.6 2.8 3.1 1.8l3.9-3.9';

interface LogoMarkProps {
    size?: number;
    tone?: LogoTone;
    title?: string; // set when the marks appears without the wordmark
}

export function LogoMark({ size = 22, tone = 'dark', title }: LogoMarkProps) {
    const { bg, fg } = COLORS[tone];
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 22 22"
            fill="none"
            role={title ? 'img' : undefined}
            aria-label={title}
            aria-hidden={title ? undefined : true}
        >
            <rect width="22" height="22" rx="6" fill={bg} />
            <path d={T_PATH} stroke={fg} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

interface LogoProps extends LogoMarkProps {
    withWordMark?: boolean;
    className?: string;
}

export function Logo({ size = 22, tone = 'dark', withWordMark = true, className }: LogoProps) {
    return (
        <span className={cn(styles.logo, tone === "light" && styles.onDark, className)}>
            <span className={styles.mark}>
                <LogoMark size={size} tone={tone} title={withWordMark ? undefined : 'Tailr'} />
            </span>
            {withWordMark && <span className={styles.wordmark}>Tailr</span>}
        </span>
    );
}