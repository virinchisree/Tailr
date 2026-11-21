import { Link, type LinkProps } from "react-router-dom";
import { ButtonClasses, type ButtonSize, type ButtonVariant } from "./ButtonClasses";

interface ButtonLinksProps extends LinkProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
}

export function ButtonLink({ variant = 'secondary', size = 'md', fullWidth = false, className, ...rest }: ButtonLinksProps) {
    return <Link className={ButtonClasses(variant, size, fullWidth, className)} {...rest} />;
}