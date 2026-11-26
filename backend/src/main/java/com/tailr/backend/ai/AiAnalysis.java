package com.tailr.backend.ai;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonPropertyDescription;

public record AiAnalysis(
        @JsonPropertyDescription("Job title from the job description, as written") String jobTitle,
        Experience experience,
        List<Dealbreaker> dealBreakers,
        List<Rewrite> rewrites) {

    public record Experience(
            @JsonPropertyDescription("Minimum years the job asks for; 0 if not stated") double requiredMinYears,
            @JsonPropertyDescription("Maximum years the job asks for; 0 if not stated") double requiredMaxYears,
            @JsonPropertyDescription("Full-time professional years in the resume") double fullTimeYears,
            @JsonPropertyDescription("Freelance, contract or self-employed years in the resume") double freelanceYears) {
    }

    public record Dealbreaker(
            String label,
            @JsonPropertyDescription("MET, MISSING or UNCLEAR") String status,
            String detail) {
    }

    public record Rewrite(
            @JsonPropertyDescription("The bullet copied exactly from the resume, without the bullet symbol") String original,
            String suggestion,
            String reason) {
    }
}
