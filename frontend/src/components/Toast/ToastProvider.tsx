import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./Toast.module.css";
import { ToastContext } from "./ToastContext";

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
    const timer = useRef<number | undefined>(undefined);

    const show = useCallback((text: string) => {
        window.clearTimeout(timer.current);
        setToast({ id: Date.now(), text });
        timer.current = window.setTimeout(() => setToast(null), 2200);
    }, []);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    return (
        <ToastContext.Provider value={show}>
            {children}
            <div className={styles.region} role="status" aria-live="polite">
                {toast && (
                    <div className={styles.toast} key={toast.id}>
                        {toast.text}
                    </div>
                )}
            </div>
        </ToastContext.Provider>
    );
}