import { useState } from 'react';
import { Card, useToast } from '../../components';
import { cn } from '../../lib/cn';
import { ConfirmSkillModal } from './ConfirmSkillModal';
import styles from './MissingSkills.module.css';

const CONFIRM_KEY = 'tailr.skillConfirmed';

// sessionStorage can throw in some private-browsing modes
const confirmedThisSession = () => {
    try { return sessionStorage.getItem(CONFIRM_KEY) === '1'; } catch { return false; }
};
const rememberConfirmed = () => {
    try { sessionStorage.setItem(CONFIRM_KEY, '1'); } catch { /* ignore */ }
};

interface MissingSkillsProps {
    missing: string[];
    required: string[];
    added: string[];
    onAdd: (skill: string) => void;
    onRemove: (skill: string) => void;
}

export function MissingSkills({ missing, required, added, onAdd, onRemove }: MissingSkillsProps) {
    const toast = useToast();
    const [pending, setPending] = useState<string | null>(null);
    const requiredSet = new Set(required);
    const stillMissing = missing
        .filter((s) => !added.includes(s))
        .sort((a, b) => Number(requiredSet.has(b)) - Number(requiredSet.has(a)));

    const add = (skill: string) => {
        onAdd(skill);
        toast(`${skill} added to your skills`);
    };

    const request = (skill: string) => {
        if (confirmedThisSession()) add(skill);
        else setPending(skill);
    };

    return (
        <Card title="Missing skills" count={stillMissing.length} aside="From the job description">
            {stillMissing.length > 0 ? (
                <div className={styles.tags}>
                    {stillMissing.map((skill) => (
                        <button
                            key={skill}
                            type="button"
                            className={cn(styles.tag, styles.missing, requiredSet.has(skill) && styles.required)}
                            onClick={() => request(skill)}
                            aria-label={`Add ${skill} to your skills${requiredSet.has(skill) ? ' (required)' : ''}`}
                        >
                            <span className={styles.plus} aria-hidden="true">+</span>
                            {skill}
                        </button>
                    ))}
                </div>
            ) : (
                <p className={styles.empty}>Nothing missing. Nice.</p>
            )}

            {added.length > 0 && (
                <div className={styles.addedRow}>
                    <span>Added to your skills:</span>
                    {added.map((skill) => (
                        <button
                            key={skill}
                            type="button"
                            className={cn(styles.tag, styles.added)}
                            onClick={() => onRemove(skill)}
                            aria-label={`Remove ${skill}`}
                        >
                            {skill} <span aria-hidden="true">×</span>
                        </button>
                    ))}
                </div>
            )}

            <p className={styles.hint}>
                Click a skill to add it to your Skills line. Only add skills you’ve actually used; the rest belong on your
                learning list.
            </p>

            <ConfirmSkillModal
                skill={pending}
                onCancel={() => setPending(null)}
                onConfirm={() => {
                    if (pending) {
                        rememberConfirmed();
                        add(pending);
                    }
                    setPending(null);
                }}
            />
        </Card>
    );
}