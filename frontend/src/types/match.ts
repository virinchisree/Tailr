export type Verdict = 'STRONG' | 'PARTIAL' | 'STRETCH';
export type RewriteStatus = 'pending' | 'accepted' | 'rejected';
export type CheckStatus = 'MET' | 'MISSING' | 'UNCLEAR' | 'NOT_REQUIRED';

export interface Rewrite {
    id: string;
    original: string;
    suggestion: string | null;   // null = tip only
    reason: string;
}

export interface MatchRequest {
    resumeText: string;
    jobDescription: string;
}

export interface MatchResponse {
    checkId: string;
    jobTitle: string;
    score: number;               // 0–100
    verdict: Verdict;
    resumeText: string; // the text the server analyzed (parsed from the file for uploads)
    breakdown: { requiredSkills: number; keywords: number; impactWording: number };
    requiredSkills: string[];
    matchedSkills: string[];
    missingSkills: string[];
    topFixes: { title: string; detail: string; estimatedGain: number }[];
    dealbreakers: { label: string; status: CheckStatus; detail: string }[];
    experienceFit: {
        requiredMin: number | null; requiredMax: number | null;
        fullTimeYears: number; freelanceYears: number; message: string
    };
    skillEvidence: { skill: string; usedInExperience: boolean }[];
    atsChecks: { label: string; passed: boolean; detail: string }[];
    rewrites: Rewrite[];
}