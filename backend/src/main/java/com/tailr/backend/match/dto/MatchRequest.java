package com.tailr.backend.match.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MatchRequest(
        @NotBlank @Size(max = 20_000) String resumeText,
        @NotBlank @Size(max = 20_000) String jobDescription) {
};