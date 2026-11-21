import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components';
import { matchKey, type CachedMatch } from '../../api/match';
import { cn } from '../../lib/cn';
import { wordCount } from '../../lib/text';
import { AnalyzingState } from './AnalyzingState';
import { JobDescriptionInput } from './JobDescriptionInput';
import { ResumeInput } from './ResumeInput';
import { SAMPLE_JD, SAMPLE_RESUME } from './sample';
import type { CheckPrefill } from './prefill';
import { ANALYZE_STEPS, useAnalyzeMatch, type AnalyzeInput } from './useAnalyzeMatch';
import styles from './CheckPage.module.css';

const MIN_RESUME_WORDS = 30;
const MIN_JD_WORDS = 15;

function Stepper() {
    return (
        <ol className={styles.stepper} aria-label="Progress">
            <li className={styles.current} aria-current="step"><span className={styles.dot}>1</span>Inputs</li>
            <li className={styles.line} aria-hidden="true" />
            <li><span className={styles.dot}>2</span>Results</li>
        </ol>
    );
}

export function CheckPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const [params] = useSearchParams();
    const prefill = (location.state as CheckPrefill | null) ?? null;
    const sampleRequested = params.get('sample') === '1';

    const [resumeText, setResumeText] = useState(
        () => prefill?.resumeText ?? (sampleRequested ? SAMPLE_RESUME : ''),
    );
    const [file, setFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState(
        () => prefill?.jobDescription ?? (sampleRequested ? SAMPLE_JD : ''),
    );
    const [boxHeight, setBoxHeight] = useState<number>();

    const inputsRef = useRef<HTMLDivElement>(null);
    const lastInput = useRef<AnalyzeInput | null>(null);
    const { run, reset, phase, visible, step, error } = useAnalyzeMatch();

    const resumeWords = wordCount(resumeText);
    const jdWords = wordCount(jobDescription);
    const resumeReady = file !== null || resumeWords >= MIN_RESUME_WORDS;
    const jdReady = jdWords >= MIN_JD_WORDS;
    const running = phase === 'running';

    const submit = useCallback(
        async (input: AnalyzeInput) => {
            lastInput.current = input;
            setBoxHeight(inputsRef.current?.offsetHeight);
            const result = await run(input);
            if (!result) return;

            const cached: CachedMatch = { result, jobDescription: input.jobDescription };
            queryClient.setQueryData(matchKey(result.checkId), cached);

            // keep the inputs in history so Back from the results returns to a filled-in form
            const back: CheckPrefill = { resumeText: result.resumeText, jobDescription: input.jobDescription };
            navigate('/check', { replace: true, state: back });
            navigate(`/results/${result.checkId}`);
        },
        [run, queryClient, navigate],
    );

    // start straight away for "See an example" and for "Re-check with edits"
    const startAutomatically = useEffectEvent(() => {
        if (prefill?.autoStart) {
            void submit({ resumeText: prefill.resumeText, file: null, jobDescription: prefill.jobDescription });
        } else if (sampleRequested) {
            void submit({ resumeText: SAMPLE_RESUME, file: null, jobDescription: SAMPLE_JD });
        }
    });
    useEffect(() => {
        startAutomatically();
    }, []);

    const hint = !resumeReady
        ? `Add at least ${MIN_RESUME_WORDS} words of resume text, or upload a file.`
        : !jdReady
            ? `Paste the full job description (at least ${MIN_JD_WORDS} words).`
            : null;

    const fieldErrors = error?.status === 400 ? error.fieldErrors : {};

    return (
        <div className={cn('container', styles.page)}>
            <header className={styles.head}>
                <div>
                    <h1 className={styles.title}>New check</h1>
                    <p className={styles.subtitle}>Add your resume and the job you’re applying for.</p>
                </div>
                <Stepper />
            </header>

            {visible ? (
                <AnalyzingState
                    status={phase === 'error' ? 'error' : 'running'}
                    steps={ANALYZE_STEPS}
                    step={step}
                    errorMessage={error?.message}
                    minHeight={boxHeight}
                    onRetry={() => lastInput.current && void submit(lastInput.current)}
                    onEdit={reset}
                />
            ) : (
                <>
                    <div ref={inputsRef} className={styles.inputs}>
                        <ResumeInput
                            text={resumeText}
                            onTextChange={setResumeText}
                            file={file}
                            onFileChange={setFile}
                            onUseSample={() => { setFile(null); setResumeText(SAMPLE_RESUME); }}
                            error={fieldErrors.resumeText}
                            disabled={running}
                        />
                        <JobDescriptionInput
                            text={jobDescription}
                            onTextChange={setJobDescription}
                            onUseSample={() => setJobDescription(SAMPLE_JD)}
                            error={fieldErrors.jobDescription}
                            disabled={running}
                        />
                    </div>

                    <div className={styles.submitRow}>
                        <p className={styles.privacy}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                                <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.4" />
                            </svg>
                            Processed privately and not stored.
                        </p>
                        <div className={styles.actions}>
                            {hint && <span className={styles.hint}>{hint}</span>}
                            <Button
                                variant="accent"
                                size="lg"
                                loading={running}
                                disabled={!resumeReady || !jdReady}
                                onClick={() => void submit({ resumeText, file, jobDescription })}
                            >
                                Analyze match
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}