import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ButtonLink, Card, useToast } from '../../components';
import { getCheck } from '../../api/check';
import { matchKey, type CachedMatch } from '../../api/match';
import { applyEdits } from '../../lib/applyEdits';
import { cn } from '../../lib/cn';
import type { CheckPrefill } from '../check/prefill';
import { AtsChecks } from './AtsChecks';
import { Dealbreakers } from './Dealbreakers';
import { DownloadModal } from './DownloadModal';
import { ExperienceFit } from './ExperienceFit';
import { MissingSkills } from './MissingSkills';
import { RewriteList } from './RewriteList';
import { ScoreCard } from './ScoreCard';
import { SkillEvidence } from './SkillEvidence';
import { TopFixes } from './TopFixes';
import { useResultEdits } from './useResultEdits';
import styles from './ResultsPage.module.css';

export function ResultsPage() {
    const { checkId = '' } = useParams();

    const query = useQuery({
        queryKey: matchKey(checkId),
        // the Check page fills this cache; a fetch only happens after a refresh or from a saved-check link
        queryFn: async (): Promise<CachedMatch> => {
            const saved = await getCheck(checkId);
            return { result: saved.result, jobDescription: saved.jobDescription };
        },
        staleTime: Infinity,
        retry: false,
    });

    if (query.isPending) {
        return <div className={cn('container', styles.state)}><p className={styles.stateText}>Loading result…</p></div>;
    }

    if (query.isError) {
        return (
            <div className={cn('container', styles.state)}>
                <Card className={styles.stateCard}>
                    <h1 className={styles.stateTitle}>This result isn’t available</h1>
                    <p className={styles.stateText}>
                        Results aren’t stored unless you save them, so they’re lost when the page is refreshed. Run the check again
                        to see it.
                    </p>
                    <ButtonLink to="/check" variant="accent">New check</ButtonLink>
                </Card>
            </div>
        );
    }

    return <ResultsView key={checkId} data={query.data} />;
}

function ResultsView({ data }: { data: CachedMatch }) {
    const { result, jobDescription } = data;
    const resumeText = result.resumeText;
    const navigate = useNavigate();
    const toast = useToast();
    const edits = useResultEdits(result.rewrites);
    const [downloadOpen, setDownloadOpen] = useState(false);

    const finalText = useMemo(
        () => applyEdits(resumeText, result.rewrites, edits.decisions, edits.addedSkills),
        [resumeText, result.rewrites, edits.decisions, edits.addedSkills],
    );

    const editCount = edits.acceptedSuggestions.length + edits.addedSkills.length;
    const totalSkills = result.matchedSkills.length + result.missingSkills.length;

    const openCheck = (resumeText: string, autoStart: boolean) => {
        const state: CheckPrefill = { resumeText, jobDescription, autoStart };
        navigate('/check', { state });
    };

    return (
        <div className={cn('container', styles.page)}>
            <header className={styles.head}>
                <div>
                    <h1 className={styles.title}>{result.jobTitle || 'Results'}</h1>
                    <p className={styles.meta}>
                        {result.matchedSkills.length} of {totalSkills} skills matched · {result.requiredSkills.length} required
                    </p>
                </div>
                <ButtonLink to="/check" variant="secondary" size="sm">New check</ButtonLink>
            </header>

            <div className={styles.grid}>
                <aside className={styles.side}>
                    <ScoreCard
                        score={result.score}
                        verdict={result.verdict}
                        breakdown={result.breakdown}
                        editCount={editCount}
                        onRecheck={() => openCheck(finalText, true)}
                        onDownload={() => setDownloadOpen(true)}
                        onEdit={() => openCheck(resumeText, false)}
                    />
                </aside>

                <div className={styles.main}>
                    <TopFixes fixes={result.topFixes} />
                    <Dealbreakers items={result.dealbreakers} />
                    <MissingSkills
                        missing={result.missingSkills}
                        required={result.requiredSkills}
                        added={edits.addedSkills}
                        onAdd={edits.addSkill}
                        onRemove={edits.removeSkill}
                    />
                    <RewriteList
                        rewrites={result.rewrites}
                        decisions={edits.decisions}
                        onDecide={edits.decide}
                        onAcceptAll={() => {
                            const n = edits.acceptAll();
                            if (n) toast(`${n} rewrites accepted`);
                        }}
                    />
                    <ExperienceFit fit={result.experienceFit} />
                    <SkillEvidence evidence={result.skillEvidence} added={edits.addedSkills} />
                    <AtsChecks checks={result.atsChecks} />
                </div>
            </div>

            <DownloadModal
                open={downloadOpen}
                onClose={() => setDownloadOpen(false)}
                text={finalText}
                acceptedSuggestions={edits.acceptedSuggestions}
                addedSkills={edits.addedSkills}
            />
        </div>
    );
}