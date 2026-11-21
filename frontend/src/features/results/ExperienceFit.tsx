import { Pill } from '../../components';
import type { Tone } from '../../lib/tone';
import type { MatchResponse } from '../../types/match';
import { Collapsible } from './Collapsible';
import styles from './ExperienceFit.module.css';

type Fit = MatchResponse['experienceFit'];

const years = (n: number) => (n === 1 ? '1 yr' : `${n} yrs`);

function asked({ requiredMin: min, requiredMax: max }: Fit): string {
    if (min === null) return 'Not stated';
    return max !== null ? `${min}–${max} yrs` : `${min}+ yrs`;
}

function verdict(fit: Fit): [Tone, string] {
    const total = fit.fullTimeYears + fit.freelanceYears;
    if (fit.requiredMin === null) return ['neutral', 'No requirement'];
    if (total < fit.requiredMin) return ['bad', 'Below range'];
    if (fit.fullTimeYears < fit.requiredMin) return ['warn', 'Relies on freelance'];
    if (fit.requiredMax !== null && fit.fullTimeYears > fit.requiredMax + 3) return ['warn', 'Possibly overqualified'];
    return ['good', 'In range'];
}

export function ExperienceFit({ fit }: { fit: Fit }) {
    const [tone, label] = verdict(fit);

    return (
        <Collapsible title="Experience fit" aside={<Pill tone={tone}>{label}</Pill>} defaultOpen>
            <dl className={styles.stats}>
                <div>
                    <dt>Job asks for</dt>
                    <dd>{asked(fit)}</dd>
                </div>
                <div>
                    <dt>Full-time</dt>
                    <dd>{years(fit.fullTimeYears)}</dd>
                </div>
                <div>
                    <dt>Freelance / contract</dt>
                    <dd>{years(fit.freelanceYears)}</dd>
                </div>
            </dl>
            {fit.message && <p className={styles.hint}>{fit.message}</p>}
        </Collapsible>
    );
}