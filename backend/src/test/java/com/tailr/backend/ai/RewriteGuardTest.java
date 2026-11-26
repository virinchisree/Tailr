package com.tailr.backend.ai;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import com.tailr.backend.scoring.SkillCatalog;

class RewriteGuardTest {

    private final RewriteGuard guard = new RewriteGuard(new SkillCatalog());

    private static AiAnalysis.Rewrite rw(String before, String after) {
        return new AiAnalysis.Rewrite(before, after, "");
    }

    @Test
    void rejectsInflatedNumber() {
        assertThat(guard.problem(rw(
                "Built REST APIs in Java and Spring Boot for the order service, handling 50,000 orders a day",
                "Built REST APIs in Java and Spring Boot for the order service, handling 50,000+ orders daily.")))
                .contains("changes or adds a number");
    }

    @Test
    void rejectsInventedResult() {
        assertThat(guard.problem(rw(
                "Migrated the checkout module from the monolith into 3 Microservices",
                "Migrated the checkout module from a monolith to 3 microservices, improving scalability.")))
                .contains("adds a result or benefit");
    }

    @Test
    void rejectsBiggerRole() {
        assertThat(guard.problem(rw(
                "Worked on the team's internal admin dashboard",
                "Designed and developed the team's internal admin dashboard for operational monitoring.")))
                .contains("claims a bigger role");
    }

    @Test
    void rejectsPointlessRephrase() {
        assertThat(guard.problem(rw(
                "Wrote JUnit tests that raised coverage from 45% to 80%",
                "Wrote JUnit tests that increased test coverage from 45% to 80%.")))
                .isPresent();
    }

    @Test
    void rejectsAddedSkill() {
        assertThat(guard.problem(rw(
                "Built the order service",
                "Built the order service with Kafka for event streaming")))
                .contains("adds a skill");
    }

    @Test
    void keepsHonestRewriteFromYourOutput() {
        assertThat(guard.problem(rw(
                "Developed a React front end with a Spring Boot backend for tracking monthly expenses",
                "Developed a React frontend with a Spring Boot backend for a personal expense tracking application.")))
                .isEmpty();
    }

    @Test
    void allowsPlaceholdersForMissingFacts() {
        assertThat(guard.problem(rw(
                "Worked on the team's internal admin dashboard",
                "Built [feature] for the team's internal admin dashboard, used by [number of people]")))
                .isEmpty();
    }
}