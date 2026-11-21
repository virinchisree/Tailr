import { useState } from 'react';
import { Button, Card, Pill } from '../../components';
import type { RewriteDecisions } from '../../lib/applyEdits';
import { cn } from '../../lib/cn';
import type { Tone } from '../../lib/tone';
import type { Rewrite, RewriteStatus } from '../../types/match';
import styles from './RewriteList.module.css';

interface RewriteListProps {
    rewrites: Rewrite[];
    decisions: RewriteDecisions;
    onDecide: (id: string, status: RewriteStatus) => void;
    onAcceptAll: () => void;
}

function statusPill(r: Rewrite, status: RewriteStatus): [Tone, string] {
    if (!r.suggestion) return ['neutral', 'Tip only'];
    if (status === 'accepted') return ['good', 'Accepted'];
    if (status === 'rejected') return ['neutral', 'Kept original'];
    return ['warn', 'Needs review'];
}

export function RewriteList({ rewrites, decisions, onDecide, onAcceptAll }: RewriteListProps) {
    const [flashId, setFlashId] = useState<string | null>(null);
    const reviewable = rewrites.filter((r) => r.suggestion);
    const reviewed = reviewable.filter((r) => (decisions[r.id] ?? 'pending') !== 'pending').length;
    const waiting = reviewable.length - reviewed;

    const decide = (id: string, status: RewriteStatus) => {
        onDecide(id, status);
        setFlashId(status === 'accepted' ? id : null);
    };

    return (
        <Card
            title="Suggested rewrites"
            count={rewrites.length}
            padded={false}
            aside={
                <>
                    {reviewable.length > 0 && <span>{reviewed} of {reviewable.length} reviewed</span>}
                    {waiting >= 2 && <Button size="sm" onClick={onAcceptAll}>Accept all</Button>}
                </>
            }
        >
            {rewrites.length === 0 ? (
                <p className={styles.empty}>No weak bullets found.</p>
            ) : (
                <ol className={styles.list}>
                    {rewrites.map((r, i) => {
                        const status = decisions[r.id] ?? 'pending';
                        const [tone, label] = statusPill(r, status);
                        return (
                            <li
                                key={r.id}
                                className={cn(
                                    styles.item,
                                    status === 'accepted' && styles.accepted,
                                    status === 'rejected' && styles.rejected,
                                    flashId === r.id && status === 'accepted' && styles.flash,
                                )}
                                onAnimationEnd={() => setFlashId(null)}
                            >
                                <div className={styles.top}>
                                    <span className={styles.num}>Bullet {i + 1}</span>
                                    <Pill tone={tone}>{label}</Pill>
                                </div>

                                <div className={styles.compare}>
                                    <div className={cn(styles.box, styles.before)}>
                                        <span className={styles.k}>Your bullet</span>
                                        <p>{r.original}</p>
                                    </div>
                                    <div className={styles.arrow} aria-hidden="true">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className={cn(styles.box, styles.after, !r.suggestion && styles.tip)}>
                                        <span className={styles.k}>{r.suggestion ? 'Suggested' : 'How to improve'}</span>
                                        <p>{r.suggestion ?? r.reason}</p>
                                    </div>
                                </div>

                                <div className={styles.foot}>
                                    <p className={styles.why}>
                                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                            <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.3" />
                                            <path d="M8 7.25V11M8 5v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                        <span>{r.suggestion ? r.reason : 'Rewrite this bullet in your own words using the tip above.'}</span>
                                    </p>
                                    {r.suggestion && (
                                        <div className={styles.acts}>
                                            {status === 'pending' ? (
                                                <>
                                                    <Button size="sm" onClick={() => decide(r.id, 'rejected')}>Keep original</Button>
                                                    <Button size="sm" variant="primary" onClick={() => decide(r.id, 'accepted')}>Accept</Button>
                                                </>
                                            ) : (
                                                <Button size="sm" variant="ghost" onClick={() => decide(r.id, 'pending')}>Undo</Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
        </Card>
    );
}