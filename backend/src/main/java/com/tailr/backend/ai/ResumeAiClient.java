package com.tailr.backend.ai;

import java.util.List;

public interface ResumeAiClient {
    AiAnalysis analyze(String resumeText, String jobDescription, List<String> requiredSkills);
}
