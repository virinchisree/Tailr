package com.tailr.backend.scoring;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

public class MatchScorerTest {
    private final SkillCatalog catalog = new SkillCatalog();
    private final MatchScorer scorer = new MatchScorer(catalog);

    private static final String JD = """
            Requirements
            - 3+ years with Java and Spring Boot
            - Building REST APIs with PostgreSQL
            Nice to have
            - Kafka
            - Docker is a plus
            """;

    private static final String RESUME = """
            Jane Doe
            Experience
            Software Engineer, Acme
            - Built REST APIs in Java and Spring Boot serving 40,000 daily users
            - Reduced PostgreSQL query time by 35% by adding indexes
            Skills: Java, Spring Boot, PostgreSQL, Kafka
            """;

    @Test
    void javaDoesNotMatchInsideJavaScript() {
        assertThat(catalog.find("Senior JavaScript developer")).doesNotContain("Java").contains("JavaScript");
    }

    @Test
    void matchesSpellingVariants() {
        assertThat(catalog.find("SpringBoot, spring-boot")).contains("Spring Boot");
        assertThat(catalog.find("Postgres")).contains("PostgreSQL").doesNotContain("SQL");
    }

    @Test
    void splitsRequiredFromNiceToHave() {
        JobSkills job = JobSkills.parse(JD, catalog);
        assertThat(job.required()).containsExactly("Java", "Spring Boot", "REST APIs", "PostgreSQL");
        assertThat(job.preferred()).containsExactly("Kafka", "Docker");
    }

    @Test
    void scoresAndExplainsTheMatch() {
        ScoreResult r = scorer.score(RESUME, JD);

        assertThat(r.requiredSkillsScore()).isEqualTo(100);
        assertThat(r.missingSkills()).containsExactly("Docker");
        assertThat(r.impactScore()).isEqualTo(100);
        assertThat(r.skillEvidence())
                .contains(new ScoreResult.Evidence("Kafka", false)) // only in the skills list
                .contains(new ScoreResult.Evidence("Java", true)); // used at a job
    }
}