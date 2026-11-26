package com.tailr.backend.ai;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.tailr.backend.scoring.MatchScorer;

// Calls the configured model (free with Ollama). Skipped in normal runs and in CI:
// ./mvnw test -Dlive=true -Dtest=ResumeAiClientLiveTest
@SpringBootTest
@EnabledIfSystemProperty(named = "live", matches = "true")
class ResumeAiClientLiveTest {

  @Autowired
  ResumeAiClient ai;
  @Autowired
  MatchScorer scorer;
  @Autowired
  RewriteGuard guard;

  @Test
  void analyzesTheSample() throws Exception {
    String resume = Files.readString(Path.of("src/main/resources/sample/resume.txt"));
    String jd = Files.readString(Path.of("src/main/resources/sample/jd.txt"));

    AiAnalysis result = ai.analyze(resume, jd, scorer.score(resume, jd).requiredSkills());

    System.out.println("Title:        " + result.jobTitle());
    System.out.println("Experience:   " + result.experience());
    result.dealBreakers().forEach(d -> System.out.println("Dealbreaker:  " + d));
    result.rewrites().forEach(r -> System.out.println(
        "\nBEFORE: " + r.original() + "\nAFTER:  " + r.suggestion() + "\nGUARD: "
            + guard.problem(r).map(p -> "REJECTED (" + p + ")").orElse("kept")));
    System.out.println("Kept " + guard.keepHonest(result.rewrites()).size() + " of " + result.rewrites().size());

    assertThat(result.jobTitle()).containsIgnoringCase("Java");
    assertThat(result.rewrites()).isNotEmpty();
    // a small local model can miss this; check the printed output before treating
    // it as a bug
    assertThat(result.experience().requiredMinYears()).isEqualTo(3);
  }
}