import type { ReactNode } from "react";
import type { Tone } from "../../lib/tone";
import styles from './Pill.module.css';
import { cn } from "../../lib/cn";

interface PillProps {
    tone?: Tone;
    dot?: boolean;
    children: ReactNode;
    className?: string;
}

export function Pill({ tone = 'neutral', dot = false, children, className }: PillProps) {
    return <span className={cn(styles.pill, styles[tone], dot && styles.dot, className)}>{children}</span>;
}