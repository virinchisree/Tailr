package com.tailr.backend.scoring;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

class TopFixBuilderTest {

    private final TopFixBuilder builder = new TopFixBuilder();

    private ScoreResult result(List<String> required, List<ScoreResult.Evidence> evidence) {
        return new ScoreResult(70, 80, 75, 50, required, List.of(), List.of(), evidence);
    }

    @Test
    void suggestsProvingRequiredSkillsThatAreOnlyListed() {
        var fixes = builder.build(result(
                List.of("Java", "Spring Boot", "Kafka", "Docker"),
                List.of(new ScoreResult.Evidence("Java", true),
                        new ScoreResult.Evidence("Kafka", false))));

        assertThat(fixes).hasSize(1);
        assertThat(fixes.get(0).title()).isEqualTo("Show where you used Kafka");
        assertThat(fixes.get(0).estimatedGain()).isEqualTo(5); // 60 × 0.3 ÷ 4 = 4.5 → 5
    }

    @Test
    void ignoresNiceToHaveSkills() {
        var fixes = builder.build(result(
                List.of("Java"),
                List.of(new ScoreResult.Evidence("Docker", false)))); // Docker isn't required
        assertThat(fixes).isEmpty();
    }

    @Test
    void showsAtMostThree() {
        var fixes = builder.build(result(
                List.of("A", "B", "C", "D"),
                List.of(new ScoreResult.Evidence("A", false), new ScoreResult.Evidence("B", false),
                        new ScoreResult.Evidence("C", false), new ScoreResult.Evidence("D", false))));
        assertThat(fixes).extracting(TopFixBuilder.Fix::title)
                .containsExactly("Show where you used A", "Show where you used B", "Show where you used C");
    }
}