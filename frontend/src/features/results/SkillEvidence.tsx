import { Pill } from '../../components';
import type { MatchResponse } from '../../types/match';
import { Collapsible } from './Collapsible';
import styles from './SkillEvidence.module.css';

interface SkillEvidenceProps {
    evidence: MatchResponse['skillEvidence'];
    added: string[];
}

export function SkillEvidence({ evidence, added }: SkillEvidenceProps) {
    // skills added from Missing skills are only on the Skills line, so they count as not shown in experience
    const rows = [
        ...evidence,
        ...added.filter((s) => !evidence.some((e) => e.skill === s)).map((skill) => ({ skill, usedInExperience: false })),
    ].sort((a, b) => Number(a.usedInExperience) - Number(b.usedInExperience));

    const used = rows.filter((r) => r.usedInExperience).length;
    const strong = rows.length > 0 && used / rows.length >= 0.6;

    return (
        <Collapsible
            title="Skill evidence"
            count={rows.length}
            flush
            aside={rows.length > 0 && <Pill tone={strong ? 'good' : 'warn'}>{used} of {rows.length} used in experience</Pill>}
        >
            {rows.length === 0 ? (
                <p className={styles.empty}>No matching skills yet.</p>
            ) : (
                <ul className={styles.list}>
                    {rows.map((r) => (
                        <li key={r.skill} className={styles.row}>
                            <span>{r.skill}</span>
                            {r.usedInExperience ? (
                                <Pill tone="good">Used in experience</Pill>
                            ) : (
                                <Pill tone="warn">Only in skills list</Pill>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            <p className={styles.footnote}>Recruiters trust a skill more when a role or project bullet shows you using it.</p>
        </Collapsible>
    );
}