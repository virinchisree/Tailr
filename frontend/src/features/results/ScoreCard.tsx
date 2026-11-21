import type { CSSProperties } from 'react';
import { Button, Pill } from '../../components';
import { plural } from '../../lib/format';
import { VERDICT_HINT, VERDICT_LABEL, type Tone } from '../../lib/tone';
import { useCountUp } from '../../lib/useCountUp';
import type { MatchResponse, Verdict } from '../../types/match';
import styles from './ScoreCard.module.css';

const RING = 2 * Math.PI * 41;

const VERDICT_TONE: Record<Verdict, Tone> = { STRONG: 'good', PARTIAL: 'warn', STRETCH: 'bad' };

interface ScoreCardProps {
    score: number;
    verdict: Verdict;
    breakdown: MatchResponse['breakdown'];
    editCount: number;
    onRecheck: () => void;
    onDownload: () => void;
    onEdit: () => void;
}

export function ScoreCard({ score, verdict, breakdown, editCount, onRecheck, onDownload, onEdit }: ScoreCardProps) {
    const shown = useCountUp(score);
    const tone = VERDICT_TONE[verdict];

    const metrics = [
        { label: 'Required skills', value: breakdown.requiredSkills },
        { label: 'Keywords', value: breakdown.keywords },
        { label: 'Impact wording', value: breakdown.impactWording },
    ];

    return (
        <section className={styles.card} aria-label="Match score">
            <div className={styles.top}>
                <div className={styles.gauge}>
                    <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
                        <circle cx="48" cy="48" r="41" fill="none" stroke="var(--subtle)" strokeWidth="8" />
                        <circle
                            className={styles.arc}
                            cx="48"
                            cy="48"
                            r="41"
                            fill="none"
                            stroke={`var(--${tone})`}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={RING}
                            strokeDashoffset={RING * (1 - score / 100)}
                            style={{ '--ring': RING } as CSSProperties}
                        />
                    </svg>
                    <span className={styles.value} aria-label={`${score} out of 100`}>{shown}</span>
                </div>
                <div>
                    <Pill tone={tone} dot>{VERDICT_LABEL[verdict]}</Pill>
                    <p className={styles.hint}>{VERDICT_HINT[verdict]}</p>
                </div>
            </div>

            <div className={styles.metrics}>
                {metrics.map((m) => (
                    <div key={m.label} className={styles.metric}>
                        <div className={styles.metricRow}>
                            <span>{m.label}</span>
                            <b>{m.value}%</b>
                        </div>
                        <div className={styles.track}>
                            <div className={styles.fill} style={{ width: `${m.value}%` }} />
                        </div>
                    </div>
                ))}
            </div>

            {editCount > 0 && (
                <div className={styles.edits}>
                    <p>
                        You’ve made <strong>{plural(editCount, 'change')}</strong>. The score above is for your original resume.
                    </p>
                    <Button size="sm" fullWidth onClick={onRecheck}>Re-check with edits</Button>
                </div>
            )}

            <div className={styles.actions}>
                <Button variant="primary" fullWidth onClick={onDownload}>Download resume</Button>
                <Button variant="ghost" fullWidth onClick={onEdit}>Edit inputs</Button>
            </div>
        </section>
    );
}