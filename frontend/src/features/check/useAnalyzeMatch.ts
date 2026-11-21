import { useCallback, useEffect, useRef, useState } from 'react';
import { analyzeMatch, analyzeMatchWithFile } from '../../api/match';
import { ApiError } from '../../api/client';
import type { MatchResponse } from '../../types/match';

export const ANALYZE_STEPS = [
    'Reading your resume…',
    'Comparing skills with the job…',
    'Writing suggested rewrites…',
] as const;

const SHOW_AFTER = 400; // fast responses never show the animation
const MIN_SHOWN = 800;  // once shown, it stays long enough not to flicker
// TODO: replace the timed steps with real progress events from the server (Spring SseEmitter)
const STEP_MS = 1500;

export interface AnalyzeInput {
    resumeText: string;
    file: File | null;
    jobDescription: string;
}

export type AnalyzePhase = 'idle' | 'running' | 'error';

export function useAnalyzeMatch() {
    const [phase, setPhase] = useState<AnalyzePhase>('idle');
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState(0);
    const [error, setError] = useState<ApiError | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const timers = useRef<number[]>([]);

    const clearTimers = () => {
        timers.current.forEach((t) => window.clearTimeout(t));
        timers.current = [];
    };

    // cancel an in-flight request if the page unmounts
    useEffect(
        () => () => {
            abortRef.current?.abort();
            clearTimers();
        },
        [],
    );

    const run = useCallback(async (input: AnalyzeInput): Promise<MatchResponse | null> => {
        abortRef.current?.abort();
        clearTimers();
        const controller = new AbortController();
        abortRef.current = controller;

        setPhase('running');
        setError(null);
        setStep(0);
        setVisible(false);

        let shownAt = 0;
        timers.current.push(
            window.setTimeout(() => {
                shownAt = performance.now();
                setVisible(true);
            }, SHOW_AFTER),
        );
        for (let i = 1; i < ANALYZE_STEPS.length; i++) {
            timers.current.push(window.setTimeout(() => setStep(i), SHOW_AFTER + i * STEP_MS));
        }

        try {
            const result = input.file
                ? await analyzeMatchWithFile(input.file, input.jobDescription, controller.signal)
                : await analyzeMatch({ resumeText: input.resumeText, jobDescription: input.jobDescription }, controller.signal);

            clearTimers();
            if (shownAt) {
                const wait = MIN_SHOWN - (performance.now() - shownAt);
                if (wait > 0) await new Promise((r) => window.setTimeout(r, wait));
            }
            if (controller.signal.aborted) return null;
            setPhase('idle');
            setVisible(false);
            return result;
        } catch (err) {
            clearTimers();
            if (controller.signal.aborted) return null;
            const apiError = err instanceof ApiError ? err : new ApiError(0, 'Something went wrong. Please try again.');
            setError(apiError);
            if (apiError.status === 400) {
                // validation problem: go back to the inputs and show the field messages there
                setPhase('idle');
                setVisible(false);
            } else {
                setPhase('error');
                setVisible(true);
            }
            return null;
        }
    }, []);

    const reset = useCallback(() => {
        abortRef.current?.abort();
        clearTimers();
        setPhase('idle');
        setVisible(false);
        setError(null);
    }, []);

    return { run, reset, phase, visible, step, error };
}