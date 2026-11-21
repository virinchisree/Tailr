import type { CheckStatus, Verdict } from "../types/match";

export type Tone = 'good' | 'warn' | 'bad' | 'neutral' | 'accent';

export const scoreTone = (score: number): Tone =>
    score >= 75 ? 'good' : score >= 50 ? 'warn' : 'bad';

export const VERDICT_LABEL: Record<Verdict, string> = {
    STRONG: 'Strong fit',
    PARTIAL: 'Partial fit',
    STRETCH: 'Stretch',
};

export const VERDICT_HINT: Record<Verdict, string> = {
    STRONG: 'Worth applying once you fix the gaps below.',
    PARTIAL: 'Close the required gaps first.',
    STRETCH: 'Apply only if you can honestly cover the gaps.',
};

export const CHECK_STATUS_TONE: Record<CheckStatus, Tone> = {
    MET: 'good',
    MISSING: 'bad',
    UNCLEAR: 'warn',
    NOT_REQUIRED: 'neutral',
};