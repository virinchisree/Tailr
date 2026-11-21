import type { RewriteDecisions } from "../lib/applyEdits";
import type { MatchResponse, Verdict } from "../types/match";
import { request } from "./client";

export interface CheckSummary {
    id: string;
    jobTitle: string;
    location: string | null;
    score: number;
    verdict: Verdict;
    missingCount: number;
    createdAt: string; // ISO date
}

export interface SavedCheck {
    id: string;
    createdAt: string;
    resumeText: string;
    jobDescription: string;
    result: MatchResponse;
    decisions: RewriteDecisions;
    addedSkills: string[];
}

export interface SaveCheckInput {
    checkId: string;
    resumeText: string;
    jobDescription: string;
    decisions: RewriteDecisions;
    addedSkills: string[];
}

// These endpoints are added with sing-in and database
export const listChecks = (limit = 10) => request<CheckSummary[]>(`/checks?list=${limit}`);

export const getCheck = (id: string) => request<SavedCheck>(`/checks/${encodeURIComponent(id)}`);

export const saveCheck = (input: SaveCheckInput) => request<SavedCheck>(`/checks/`, { method: 'POST', json: input });

export const updateCheck = (id: string, input:
    Pick<SaveCheckInput, 'decisions' | 'addedSkills'>) => {
    request<SavedCheck>
        (`/checks/${encodeURIComponent(id)}`, { method: 'PUT', json: input })
};

export const deleteCheck = (id: string) => request<void>(`/checks/${encodeURIComponent(id)}`, { method: 'DELETE' });