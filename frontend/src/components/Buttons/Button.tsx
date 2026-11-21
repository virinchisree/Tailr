import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";
import { cn } from "../../lib/cn";
import type { ButtonSize, ButtonVariant } from "./ButtonClasses";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
}

export function Button({
    variant = 'secondary',
    size = 'md',
    loading = false,
    fullWidth = false,
    disabled,
    className,
    children,
    type = 'button',
    ...rest
}: ButtonProps) {
    return (
        <button
            type={type}
            className={cn(styles.btn, styles[variant], styles[size], fullWidth && styles.full, className)}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...rest}
        >
            {loading && <span className={styles.spinner} aria-hidden="true" />}
            {children}
        </button>
    );
}