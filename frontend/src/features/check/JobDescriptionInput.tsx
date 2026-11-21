import { useId } from 'react';
import { Button, Card } from '../../components';
import { wordCount } from '../../lib/text';
import styles from './InputCard.module.css';

interface JobDescriptionInputProps {
    text: string;
    onTextChange: (value: string) => void;
    onUseSample: () => void;
    error?: string;
    disabled?: boolean;
}

export function JobDescriptionInput({ text, onTextChange, onUseSample, error, disabled }: JobDescriptionInputProps) {
    const errorId = useId();

    return (
        <Card
            title="Job description"
            aside={<Button variant="ghost" size="sm" onClick={onUseSample} disabled={disabled}>Use sample</Button>}
            padded={false}
            className={styles.card}
            bodyClassName={styles.body}
        >
            <textarea
                className={styles.textarea}
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="Paste the full job description, including requirements…"
                aria-label="Job description"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                disabled={disabled}
                spellCheck={false}
            />
            {error && <p id={errorId} className={styles.error}>{error}</p>}
            <div className={styles.footer}>
                <span>{wordCount(text)} words</span>
                <Button variant="ghost" size="sm" onClick={() => onTextChange('')} disabled={disabled || !text}>Clear</Button>
            </div>
        </Card>
    );
}