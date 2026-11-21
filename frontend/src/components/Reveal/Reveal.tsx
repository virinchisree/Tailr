import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import styles from './Reveal.module.css';

interface RevealProps {
    delay?: number; // ms, for staggering items in a row
    className?: string;
    children: ReactNode;
}

// very old browsers without IntersectionObserver just show content straight away
const canObserve = typeof window !== 'undefined' && 'IntersectionObserver' in window;

/** Fades its children up the first time they scroll into view. */
export function Reveal({ delay = 0, className, children }: RevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [shown, setShown] = useState(!canObserve);

    useEffect(() => {
        const el = ref.current;
        if (!el || !canObserve) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShown(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={cn(styles.reveal, shown && styles.shown, className)}
            style={{ '--delay': `${delay}ms` } as CSSProperties}
        >
            {children}
        </div>
    );
}