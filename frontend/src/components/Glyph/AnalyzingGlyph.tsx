import { cn } from "../../lib/cn";
import styles from "./AnalyzingGlyph.module.css";

interface AnalyzingGlyphProps {
    size?: number;
    animated?: boolean; //false for the error state
    className?: string;
}

export function AnalyzingGlyph({ size = 56, animated = true, className }: AnalyzingGlyphProps) {
    return (
        <svg
            className={cn(styles.glyph, animated ? styles.animated : styles.still, className)}
            width={size}
            height={Math.round(size * (15 / 14))}
            viewBox="4 3 14 15"
            fill="none"
            aria-hidden="true"
        >
            <path className={styles.bar} pathLength={1} d="M6 8.5h6.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
            <path
                className={styles.stem}
                pathLength={1}
                d="M9.5 5v8.4c0 2 1.6 2.8 3.1 1.8l3.9-3.9"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}