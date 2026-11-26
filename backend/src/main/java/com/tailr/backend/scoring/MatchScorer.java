package com.tailr.backend.scoring;

import java.util.*;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

@Component
public class MatchScorer {
    private static final double REQUIRED_WEIGHT = 0.60;
    private static final double KEYWORDS_WEIGHT = 0.25;
    private static final double IMPACT_WEIGHT = 0.15;
    private static final double SKILLS_LIST_ONLY = 0.7; // list skills that are never used

    private static final Set<String> ACTION_VERBS = Set.of(
            "built", "developed", "designed", "implemented", "led", "created", "reduced", "improved",
            "increased", "optimized", "optimised", "automated", "migrated", "delivered", "launched",
            "integrated", "refactored", "deployed", "architected", "owned", "mentored", "resolved",
            "streamlined", "cut", "scaled", "wrote", "shipped", "engineered", "introduced", "established");
    private static final Pattern HAS_NUMBER = Pattern.compile("\\d|%|₹|\\$");
    private static final Pattern BULLET = Pattern.compile("^[\\s\\-•*▪●◦–]+");

    private final SkillCatalog catalog;

    public MatchScorer(SkillCatalog catalog) {
        this.catalog = catalog;
    }

    public ScoreResult score(String resumeText, String jobDescription) {
        JobSkills job = JobSkills.parse(jobDescription, catalog);
        ResumeSections sections = ResumeSections.parse(resumeText);
        Set<String> inResume = catalog.find(resumeText);
        Set<String> usedAtWork = catalog.find(sections.workText());

        List<String> allJobSkills = new ArrayList<>(job.required());
        allJobSkills.addAll(job.preferred());

        List<String> matched = allJobSkills.stream().filter(inResume::contains).toList();
        List<String> missing = allJobSkills.stream().filter(s -> !inResume.contains(s)).toList();
        List<ScoreResult.Evidence> evidence = matched.stream()
                .map(s -> new ScoreResult.Evidence(s, usedAtWork.contains(s)))
                .toList();

        // no recognised skills in the JD: don't punish the user for a gap in our
        // dictionary
        int requiredScore = job.required().isEmpty() ? 100
                : percent(
                        job.required().stream()
                                .mapToDouble(
                                        s -> usedAtWork.contains(s) ? 1.0 : inResume.contains(s) ? SKILLS_LIST_ONLY : 0)
                                .sum(),
                        job.required().size());

        int keywordsScore = allJobSkills.isEmpty() ? 100 : percent(matched.size(), allJobSkills.size());
        int impactScore = impact(sections.workText());

        int score = (int) Math.round(
                REQUIRED_WEIGHT * requiredScore + KEYWORDS_WEIGHT * keywordsScore + IMPACT_WEIGHT * impactScore);

        return new ScoreResult(score, requiredScore, keywordsScore, impactScore, job.required(), matched, missing,
                evidence);
    }

    // half for bullets starting with an action verb, half for bullets with a number
    private int impact(String workText) {
        List<String> bullets = workText.lines()
                .map(l -> BULLET.matcher(l).replaceFirst("").strip())
                .filter(l -> l.split("\\s+").length >= 6) // skip titles, dates, company names
                .toList();
        if (bullets.isEmpty())
            return 0;

        long strongStart = bullets.stream().filter(b -> ACTION_VERBS.contains(firstWord(b))).count();
        long quantified = bullets.stream().filter(b -> HAS_NUMBER.matcher(b).find()).count();
        return (int) Math.round(50.0 * strongStart / bullets.size() + 50.0 * quantified / bullets.size());
    }

    private static String firstWord(String line) {
        return line.split("\\s+")[0].toLowerCase().replaceAll("[^a-z]", "");
    }

    private static int percent(double part, int total) {
        return (int) Math.round(100.0 * part / total);
    }
}