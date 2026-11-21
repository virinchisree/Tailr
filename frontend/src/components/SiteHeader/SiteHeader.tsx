import styles from './SiteHeader.module.css';
import { cn } from '../../lib/cn';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../Logo/Logo';
import { Button } from '../Buttons/Button';
import { ButtonLink } from '../Buttons/ButtonLink';

interface SiteHeaderProps {
    onSignIn?: () => void;
}

export function SiteHeader({ onSignIn }: SiteHeaderProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header className={cn(styles.header, scrolled && styles.scrolled)}>
            <a href="#main" className={styles.skip}>Skip to content</a>
            <div className={cn('container', styles.inner)}>
                <Link to='/' aria-label="Tailr Home">
                    <Logo />
                </Link>
                <nav className={styles.nav} aria-label='Main'>
                    <Link to='/#how' className={cn(styles.link, styles.hidesm)}>How it Works</Link>
                    <Link to='/#pricing' className={cn(styles.link, styles.hideSm)}>Pricing</Link>
                    {onSignIn && (
                        <Button variant="ghost" size="sm" onClick={onSignIn}>Sign in</Button>
                    )}
                    <ButtonLink to="/check" variant='primary' size='sm'>Check my resume</ButtonLink>
                </nav>
            </div>
        </header>
    );
}