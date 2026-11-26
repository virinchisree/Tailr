package com.tailr.backend.scoring;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

@Component
public class TopFixBuilder {
    static final int MAX_FIXES = 3; // A short list to act on

    public record Fix(String title, String detail, int estimatedGain) {
    }

    public List<Fix> build(ScoreResult s) {
        Set<String> provenAtWork = s.skillEvidence().stream()
                .filter(ScoreResult.Evidence::usedInExperience)
                .map(ScoreResult.Evidence::skill)
                .collect(Collectors.toSet());

        Set<String> listedOnly = s.skillEvidence().stream()
                .filter(e -> !e.usedInExperience())
                .map(ScoreResult.Evidence::skill)
                .collect(Collectors.toSet());

        int requiredCount = s.requiredSkills().size();
        if (requiredCount == 0)
            return List.of();

        // keep the JD's order: skills mentioned first are usually the most important
        return s.requiredSkills().stream()
                .filter(listedOnly::contains)
                .filter(skill -> !provenAtWork.contains(skill))
                .limit(MAX_FIXES)
                .map(skill -> new Fix(
                        "Show where you used " + skill,
                        skill + " is a required skill, but it only appears in your Skills list. "
                                + "If you've used it at a job or in a project, add a bullet there that says how.",
                        gain(requiredCount)))
                .toList();

    }

    static int gain(int requiredCount) {
        return (int) Math.round(60 * (1.0 - 0.7) / requiredCount);
    }
}
