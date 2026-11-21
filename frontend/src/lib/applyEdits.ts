import type { Rewrite, RewriteStatus } from "../types/match";

export type RewriteDecisions = Record<string, RewriteStatus>;

const SKILL_LINE = /^\s*(technical\s+)?skills\s*:/i;
const SKILL_HEADING = /^\s*(technical\s+)?skills\s*$/i;
const EXPERIENCE_HEADING = /^\s*(work\s+|professional\s+)?experience\b/i;
const BULLET = /^\s*[-•*]/;

export function applyRewrites(resume: string, rewrites: Rewrite[], decisions: RewriteDecisions): string {
    return rewrites.reduce((text, r) => {
        if (decisions[r.id] !== 'accepted' || !r.suggestion) return text;
        const suggestion = r.suggestion
        // A function replacer that stops "$" in the suggestion being read as a pattern
        return text.replace(r.original, () => suggestion)
    }, resume);
}

//** Adds skills to the exiting skills line, or creates one above experince. */
export function applySkills(resume: string, skills: string[]): string {
    if (skills.length === 0) return resume;
    const names = skills.join(' ');
    const lines = resume.split('\n');
    const trimEnd = (s: string) => s.replace(/[\s,.]*$/, '');

    const inline = lines.findIndex((l) => SKILL_LINE.test(l));
    if (inline >= 0) {
        lines[inline] = `${trimEnd(lines[inline])}, ${names}`;
        return lines.join('\n');
    }

    const heading = lines.findIndex((l) => SKILL_HEADING.test(l));
    if (heading >= 0) {
        let next = heading + 1;
        while (next < lines.length && !lines[next].trim()) next++;
        if (next < lines.length && !BULLET.test(lines[next])) lines[next] = `${trimEnd(lines[next])}, ${names}`;
        else lines.splice(heading + 1, 0, names);
        return lines.join('\n');
    }

    const experience = lines.findIndex((l) => EXPERIENCE_HEADING.test(l));
    lines.splice(experience >= 0 ? experience : Math.min(3, lines.length), 0, `Skills: ${names}`, '');
    return lines.join('\n');
}

export function applyEdits(
    resume: string,
    rewrites: Rewrite[],
    decisions: RewriteDecisions,
    addedSkills: string[],
): string {
    return applySkills(applyRewrites(resume, rewrites, decisions), addedSkills);
}