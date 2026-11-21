import { cn } from "../../lib/cn";
import styles from "./Button.module.css";

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export function ButtonClasses(
    variant: ButtonVariant = 'secondary',
    size: ButtonSize = 'md',
    fullWidth = false,
    className?: string,): string {
    return cn(styles.btn, styles[variant], styles[size], fullWidth && styles.full, className);
}

export { styles as buttonStyles };