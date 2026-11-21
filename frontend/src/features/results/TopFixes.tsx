import { Card } from '../../components';
import type { MatchResponse } from '../../types/match';
import styles from './TopFixes.module.css';

export function TopFixes({ fixes }: { fixes: MatchResponse['topFixes'] }) {
    const top = [...fixes].sort((a, b) => b.estimatedGain - a.estimatedGain).slice(0, 3);

    return (
        <Card title="Top fixes" aside="Estimated score gain" padded={false}>
            {top.length === 0 ? (
                <p className={styles.empty}>No quick wins left. Your resume covers what this job asks for.</p>
            ) : (
                <ol className={styles.list}>
                    {top.map((fix, i) => (
                        <li key={fix.title} className={styles.fix}>
                            <span className={styles.num}>{i + 1}</span>
                            <div>
                                <p className={styles.title}>{fix.title}</p>
                                <p className={styles.detail}>{fix.detail}</p>
                            </div>
                            <span className={styles.gain} aria-label={`About ${fix.estimatedGain} points`}>
                                ≈ +{Math.max(1, Math.round(fix.estimatedGain))}
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </Card>
    );
}