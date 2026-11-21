import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import styles from './StatusList.module.css';

export type StatusKind = 'ok' | 'fail' | 'warn';

export interface StatusItem {
    label: string;
    status: StatusKind;
    detail: string;
}

const ICON: Record<StatusKind, string> = { ok: '✓', fail: '✕', warn: '!' };
const SR_LABEL: Record<StatusKind, string> = { ok: 'Passed', fail: 'Not met', warn: 'Check' };

export function StatusList({ items, footnote }: { items: StatusItem[]; footnote?: ReactNode }) {
    return (
        <>
            {items.length > 0 && (
                <ul className={styles.list}>
                    {items.map((item) => (
                        <li key={item.label} className={styles.row}>
                            <span className={cn(styles.icon, styles[item.status])} aria-hidden="true">{ICON[item.status]}</span>
                            <div>
                                <p className={styles.label}>
                                    <span className="visually-hidden">{SR_LABEL[item.status]}: </span>
                                    {item.label}
                                </p>
                                <p className={styles.detail}>{item.detail}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {footnote && <p className={cn(styles.footnote, items.length === 0 && styles.footnoteOnly)}>{footnote}</p>}
        </>
    );
}