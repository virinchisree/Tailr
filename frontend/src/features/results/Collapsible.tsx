import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import styles from './Collapsible.module.css';

interface CollapsibleProps {
    title: ReactNode;
    count?: number;
    aside?: ReactNode;
    defaultOpen?: boolean;
    flush?: boolean; // true when the body is a list of rows with their own padding
    children: ReactNode;
}

export function Collapsible({ title, count, aside, defaultOpen = false, flush = false, children }: CollapsibleProps) {
    return (
        <details className={styles.box} open={defaultOpen}>
            <summary className={styles.summary}>
                <h3 className={styles.title}>
                    {title}
                    {count !== undefined && <span className={styles.count}>{count}</span>}
                </h3>
                <span className={styles.right}>
                    {aside}
                    <svg className={styles.chevron} width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            </summary>
            <div className={cn(styles.body, flush && styles.flush)}>{children}</div>
        </details>
    );
}