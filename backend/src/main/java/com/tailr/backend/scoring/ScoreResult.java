package com.tailr.backend.scoring;

import java.util.List;

public record ScoreResult(
        int score,
        int requiredSkillsScore,
        int keywordsScore,
        int impactScore,
        List<String> requiredSkills,
        List<String> matchedSkills,
        List<String> missingSkills, // required ones first
        List<Evidence> skillEvidence) {

    public record Evidence(String skill, boolean usedInExperience) {
    }
}