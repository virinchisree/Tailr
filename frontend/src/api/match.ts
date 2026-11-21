import type { MatchRequest, MatchResponse } from "../types/match";
import { ApiError, request } from "./client";

export async function analyzeMatch(input: MatchRequest, signal?: AbortSignal): Promise<MatchResponse> {
    const result = await request<MatchResponse>('/match', { method: 'POST', json: input, signal });
    if (typeof result.resumeText !== 'string' || !Array.isArray(result.rewrites)) {
        throw new ApiError(0, 'The server sent an unexpected response.');
    }
    return result;
}

// Needs POST /api/match/upload on the background (added with PDF parsing)
export function analyzeMatchWithFile(
    file: File,
    jobDescription: string,
    signal?: AbortSignal,
): Promise<MatchResponse> {
    const form = new FormData();
    form.append('resume', file);
    form.append('jobDescription', jobDescription);
    return request<MatchResponse>('/match/upload', { method: "POST", body: form, signal });
}

// results are cached under this key so the Results page can read them without refetching
export const matchKey = (checkId: string) => ['match', checkId] as const;

export interface CachedMatch {
    result: MatchResponse;
    jobDescription: string;
}