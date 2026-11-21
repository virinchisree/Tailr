import { useCallback, useMemo, useState } from 'react';
import type { RewriteDecisions } from '../../lib/applyEdits';
import type { Rewrite, RewriteStatus } from '../../types/match';

export function useResultEdits(rewrites: Rewrite[]) {
    const [decisions, setDecisions] = useState<RewriteDecisions>({});
    const [addedSkills, setAddedSkills] = useState<string[]>([]);

    const decide = useCallback((id: string, status: RewriteStatus) => {
        setDecisions((d) => ({ ...d, [id]: status }));
    }, []);

    /** Accepts every rewrite still waiting for a decision and returns how many there were. */
    const acceptAll = useCallback((): number => {
        const ids = rewrites
            .filter((r) => r.suggestion && (decisions[r.id] ?? 'pending') === 'pending')
            .map((r) => r.id);
        setDecisions((d) => ({ ...d, ...Object.fromEntries(ids.map((id) => [id, 'accepted' as const])) }));
        return ids.length;
    }, [rewrites, decisions]);

    const addSkill = useCallback((skill: string) => {
        setAddedSkills((s) => (s.includes(skill) ? s : [...s, skill]));
    }, []);

    const removeSkill = useCallback((skill: string) => {
        setAddedSkills((s) => s.filter((x) => x !== skill));
    }, []);

    const acceptedSuggestions = useMemo(
        () => rewrites.filter((r) => r.suggestion && decisions[r.id] === 'accepted').map((r) => r.suggestion as string),
        [rewrites, decisions],
    );

    return { decisions, decide, acceptAll, addedSkills, addSkill, removeSkill, acceptedSuggestions };
}