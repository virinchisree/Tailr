package com.tailr.backend.match.dto;

import java.util.List;

public record MatchResponse(
        String checkId,
        String jobTitle,
        String resumeText,
        int score,
        Verdict verdict,
        Breakdown breakdown,
        List<String> requiredSkills,
        List<String> matchedSkills,
        List<String> missingSkills,
        List<TopFix> topFixes,
        List<Dealbreaker> dealbreakers,
        ExperienceFit experienceFit,
        List<SkillEvidence> skillEvidence,
        List<AtsCheck> atsChecks,
        List<Rewrite> rewrites) {
    public enum Verdict {
        STRONG, PARTIAL, STRETCH
    }

    public enum CheckStatus {
        MET, MISSING, UNCLEAR, NOT_REQUIRED
    }

    public record Breakdown(int requiredSkills, int keywords, int impactWording) {
    }

    public record TopFix(String title, String detail, int estimatedGain) {
    }

    public record Dealbreaker(String label, CheckStatus status, String detail) {
    }

    public record ExperienceFit(Integer requiredMin, Integer requiredMax,
            int fullTimeYears, int freelanceYears, String message) {
    }

    public record SkillEvidence(String skill, boolean usedInExperience) {
    }

    public record AtsCheck(String label, boolean passed, String detail) {
    }

    public record Rewrite(String id, String original, String suggestion, String reason) {
    }
}