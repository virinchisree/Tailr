import type { ReactNode } from "react";
import styles from "./Card.module.css";
import { cn } from "../../lib/cn";

interface CardProps {
    title?: ReactNode;
    count?: number;
    aside?: ReactNode; // rightside of the header: a pill, hint text or button
    padded?: boolean; // false when the body is a list of rows with their own padding
    children?: ReactNode;
    className?: string;
    bodyClassName?: string;
}

export function Card({ title, count, aside, padded = true, children, className, bodyClassName }: CardProps) {
    return (
        <section className={cn(styles.card, className)}>
            {(title || aside) && (
                <header className={styles.header}>
                    {title && (
                        <h3 className={styles.title}>
                            {title}
                            {count !== undefined && <span className={styles.count}>{count}</span>}
                        </h3>
                    )}
                    {aside && <div className={styles.aside}>{aside}</div>}
                </header>
            )}
            <div className={cn(padded && styles.body, bodyClassName) || undefined}>{children}</div>
        </section>
    );
}