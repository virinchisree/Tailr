import { Pill } from '../../components';
import { cn } from '../../lib/cn';
import styles from './ProductPreview.module.css';

const RING = 2 * Math.PI * 41;
const SCORE = 80;

const METRICS = [
    { label: 'Required skills', value: 86 },
    { label: 'Keywords', value: 75 },
    { label: 'Impact wording', value: 60 },
];

export function ProductPreview({ className }: { className?: string }) {
    return (
        <div className={cn(styles.shot, className)} aria-hidden="true">
            <div className={styles.bar}>
                <i /><i /><i />
                <span className={styles.url}>tailr.app/results</span>
            </div>

            <div className={styles.body}>
                <div className={styles.side}>
                    <div className={styles.scoreRow}>
                        <div className={styles.gauge}>
                            <svg width="96" height="96" viewBox="0 0 96 96">
                                <circle cx="48" cy="48" r="41" fill="none" stroke="var(--subtle)" strokeWidth="8" />
                                <circle
                                    className={styles.arc}
                                    cx="48"
                                    cy="48"
                                    r="41"
                                    fill="none"
                                    stroke="var(--good)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={RING}
                                    strokeDashoffset={RING * (1 - SCORE / 100)}
                                    style={{ ['--ring' as string]: RING }}
                                />
                            </svg>
                            <span className={styles.value}>{SCORE}</span>
                        </div>
                        <div>
                            <Pill tone="good" dot>Strong fit</Pill>
                            <p className={styles.job}>Java Developer · 2–4 yrs</p>
                        </div>
                    </div>

                    <div className={styles.metrics}>
                        {METRICS.map((m) => (
                            <div key={m.label} className={styles.metric}>
                                <div className={styles.metricRow}><span>{m.label}</span><b>{m.value}%</b></div>
                                <div className={styles.track}><div className={styles.fill} style={{ width: `${m.value}%` }} /></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.main}>
                    <p className={styles.label}>Missing skills</p>
                    <div className={styles.tags}>
                        <span className={cn(styles.tag, styles.required)}>Mockito</span>
                        <span className={styles.tag}>Kafka</span>
                        <span className={styles.tag}>Kubernetes</span>
                    </div>

                    <p className={styles.label}>Suggested rewrite</p>
                    <div className={styles.compare}>
                        <div className={cn(styles.box, styles.before)}>
                            <span className={styles.k}>Your bullet</span>
                            Responsible for working on REST APIs for the backend.
                        </div>
                        <div className={styles.arrow}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className={cn(styles.box, styles.after)}>
                            <span className={styles.k}>Suggested</span>
                            Designed and documented 20+ Spring Boot REST endpoints used by the React front-end.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}