package com.tailr.backend.match;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.tailr.backend.match.dto.MatchRequest;
import com.tailr.backend.match.dto.MatchResponse;

@Service
public class MatchService {

        // TODO: replace with real parsing, scoring and Spring AI rewrites
        public MatchResponse analyze(MatchRequest request) {
                return new MatchResponse(
                                UUID.randomUUID().toString(),
                                "Java Developer",
                                request.resumeText(),
                                66,
                                MatchResponse.Verdict.PARTIAL,
                                new MatchResponse.Breakdown(73, 69, 33),
                                List.of("Java", "Spring Boot", "Microservices", "Mockito"),
                                List.of("Java", "Spring Boot", "REST APIs"),
                                List.of("Microservices", "Mockito", "Kafka"),
                                List.of(new MatchResponse.TopFix(
                                                "Show Mockito in a role or project bullet",
                                                "Required by the job. Add it only if you have used it.", 7)),
                                List.of(new MatchResponse.Dealbreaker(
                                                "Notice period", MatchResponse.CheckStatus.UNCLEAR,
                                                "Job prefers immediate joiners.")),
                                new MatchResponse.ExperienceFit(2, 4, 1, 4,
                                                "Full-time experience is below the 2-year minimum."),
                                List.of(new MatchResponse.SkillEvidence("Spring Boot", false)),
                                List.of(new MatchResponse.AtsCheck("Phone number", false, "No phone number found.")),
                                List.of(new MatchResponse.Rewrite("r1",
                                                "Responsible for working on REST APIs for the backend.",
                                                "Designed and documented 20+ Spring Boot REST endpoints used by the React front-end.",
                                                "Leads with what you built.")));
        }
}