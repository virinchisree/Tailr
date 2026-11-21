import styles from './SiteFooter.module.css'

export function SiteFooter() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.inner}>
                    <span>© {new Date().getFullYear()} Tailr</span>
                    <nav className={styles.links} aria-label='Footer'>
                        <span>Privacy</span>
                        <span>Terms</span>
                        <span>Contact</span>
                    </nav>
                </div>
            </div>
        </footer>
    );
}