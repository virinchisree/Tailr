import { AnalyzingGlyph, Button } from '../../components';
import { cn } from '../../lib/cn';
import styles from './AnalyzingState.module.css';

interface AnalyzingStateProps {
    status: 'running' | 'error';
    steps: readonly string[];
    step: number;
    errorMessage?: string;
    minHeight?: number; // matches the input cards so the page doesn't jump
    onRetry: () => void;
    onEdit: () => void;
}

export function AnalyzingState({ status, steps, step, errorMessage, minHeight, onRetry, onEdit }: AnalyzingStateProps) {
    const running = status === 'running';

    return (
        <section
            className={styles.box}
            style={minHeight ? { minHeight } : undefined}
            aria-live="polite"
            aria-busy={running}
        >
            <div className={styles.inner}>
                <AnalyzingGlyph animated={running} />

                {running ? (
                    <>
                        <p key={step} className={styles.text}>{steps[step]}</p>
                        <div className={styles.steps} aria-hidden="true">
                            {steps.map((s, i) => (
                                <span key={s} className={cn(styles.bar, i <= step && styles.on)} />
                            ))}
                        </div>
                        <p className={styles.note}>This usually takes a few seconds.</p>
                    </>
                ) : (
                    <>
                        <p className={styles.text}>Something went wrong</p>
                        <p className={styles.note}>
                            {errorMessage ?? 'The analysis didn’t finish.'} Your resume and job description are still here.
                        </p>
                        <div className={styles.actions}>
                            <Button onClick={onEdit}>Edit inputs</Button>
                            <Button variant="accent" onClick={onRetry} autoFocus>Try again</Button>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}