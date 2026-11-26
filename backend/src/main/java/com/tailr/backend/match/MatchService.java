package com.tailr.backend.match;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.tailr.backend.match.dto.MatchRequest;
import com.tailr.backend.match.dto.MatchResponse;
import com.tailr.backend.match.dto.MatchResponse.Verdict;
import com.tailr.backend.scoring.MatchScorer;
import com.tailr.backend.scoring.ScoreResult;
import com.tailr.backend.scoring.TopFixBuilder;

@Service
public class MatchService {

    private final MatchScorer scorer;
    private final TopFixBuilder topFixBuilder;

    public MatchService(MatchScorer scorer, TopFixBuilder topFixBuilder) {
        this.scorer = scorer;
        this.topFixBuilder = topFixBuilder;
    }

    public MatchResponse analyze(MatchRequest request) {
        ScoreResult s = scorer.score(request.resumeText(), request.jobDescription());
        Verdict verdict = s.score() >= 75 ? Verdict.STRONG : s.score() >= 50 ? Verdict.PARTIAL : Verdict.STRETCH;

        List<MatchResponse.SkillEvidence> skillEvidence = s.skillEvidence().stream()
                .map(e -> new MatchResponse.SkillEvidence(e.skill(), e.usedInExperience()))
                .toList();

        var topFixes = topFixBuilder.build(s).stream()
                .map(f -> new MatchResponse.TopFix(f.title(), f.detail(), f.estimatedGain()))
                .toList();

        return new MatchResponse(
                UUID.randomUUID().toString(),
                "Java Developer",
                request.resumeText(),
                s.score(),
                verdict,
                new MatchResponse.Breakdown(s.requiredSkillsScore(), s.keywordsScore(), s.impactScore()),
                s.requiredSkills(),
                s.matchedSkills(),
                s.missingSkills(),
                topFixes,
                List.of(new MatchResponse.Dealbreaker(
                        "Notice period", MatchResponse.CheckStatus.UNCLEAR,
                        "Job prefers immediate joiners.")),
                new MatchResponse.ExperienceFit(2, 4, 1, 4,
                        "Full-time experience is below the 2-year minimum."),
                skillEvidence,
                List.of(new MatchResponse.AtsCheck("Phone number", false, "No phone number found.")),
                List.of(new MatchResponse.Rewrite("r1",
                        "Responsible for working on REST APIs for the backend.",
                        "Designed and documented 20+ Spring Boot REST endpoints used by the React front-end.",
                        "Leads with what you built.")));
    }
}
