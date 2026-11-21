import { useEffect, useId, useRef, type ReactNode } from "react";
import styles from "./modal.module.css";
import { cn } from "../../lib/cn";
import { createPortal } from "react-dom";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: ReactNode;
    icon?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    role?: 'dialog' | 'alertDialog';
    hideClose?: boolean;
    children?: ReactNode;
}

const FOCUSABLE =
    'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const stack: symbol[] = [];

export function Modal({
    open,
    onClose,
    title,
    description,
    icon,
    size = 'sm',
    role = 'dialog',
    hideClose = false,
    children,
}: ModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);
    const titleId = useId();
    const descId = useId();

    useEffect(() => {
        onCloseRef.current = onClose;
    });

    useEffect(() => {
        if (!open) return;
        const me = Symbol('modal');
        stack.push(me);
        const previous = document.activeElement as HTMLElement | null;
        const panel = panelRef.current;
        const focusables = () => (panel ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)) : []);

        (focusables().find((el) => !el.dataset.modalClose) ?? panel)?.focus();

        const onKey = (e: KeyboardEvent) => {
            if (stack[stack.length - 1] !== me) return;
            if (e.key === 'Escape') {
                onCloseRef.current();
                return;
            }
            if (e.key !== 'Tab') return;
            const els = focusables();
            if (els.length === 0) return;
            const first = els[0];
            const last = els[els.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKey);
        const overlfow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKey);
            stack.splice(stack.indexOf(me), 1);
            document.body.style.overflow = overlfow;
            if (previous?.isConnected) previous.focus();
        };
    }, [open]);

    if (!open) return null;

    return createPortal(
        <div className={styles.root}>
            <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
            <div
                ref={panelRef}
                className={cn(styles.panel, styles[size])}
                role={role}
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descId : undefined}
                tabIndex={-1}>
                {!hideClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.close}
                        data-modal-close="true"
                        aria-label="Close modal">
                        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                    </button>
                )}
                {icon && <div className={styles.icon}>{icon}</div>}
                <h2 id={titleId} className={styles.title}>{title}</h2>
                {description && <p id={descId} className={styles.description}>{description}</p>}
                {children}
            </div>
        </div >,
        document.body,
    );
}