import type { MatchRequest, MatchResponse } from "../types/match";
import { ApiError, request } from "./client";

function assertMatchShape(result: MatchResponse): MatchResponse {
    if (typeof result.resumeText !== 'string' || !Array.isArray(result.rewrites)) {
        throw new ApiError(0, 'The server sent an unexpected response.');
    }
    return result;
}

export async function analyzeMatch(input: MatchRequest, signal?: AbortSignal): Promise<MatchResponse> {
    return assertMatchShape(await request<MatchResponse>('/match', { method: 'POST', json: input, signal }));
}

// POST /api/match/upload (PDF/DOCX are read on the backend)
export async function analyzeMatchWithFile(
    file: File,
    jobDescription: string,
    signal?: AbortSignal,
): Promise<MatchResponse> {
    const form = new FormData();
    form.append('file', file);
    form.append('jobDescription', jobDescription);
    return assertMatchShape(await request<MatchResponse>('/match/upload', { method: 'POST', body: form, signal }));
}

// results are cached under this key so the Results page can read them without refetching
export const matchKey = (checkId: string) => ['match', checkId] as const;

export interface CachedMatch {
    result: MatchResponse;
    jobDescription: string;
}