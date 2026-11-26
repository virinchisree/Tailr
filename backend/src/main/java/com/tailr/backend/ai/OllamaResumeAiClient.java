package com.tailr.backend.ai;

import java.net.http.HttpClient;
import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Component
@ConditionalOnProperty(name = "tailr.ai.provider", havingValue = "ollama", matchIfMissing = true)
public class OllamaResumeAiClient implements ResumeAiClient {

    private static final Logger log = LoggerFactory.getLogger(OllamaResumeAiClient.class);

    // the JSON shape of AiAnalysis; Ollama forces the answer into it
    private static final String SCHEMA = """
            {
              "type": "object",
              "properties": {
                "jobTitle": { "type": "string" },
                "experience": {
                  "type": "object",
                  "properties": {
                    "requiredMinYears": { "type": "number" },
                    "requiredMaxYears": { "type": "number" },
                    "fullTimeYears":    { "type": "number" },
                    "freelanceYears":   { "type": "number" }
                  },
                  "required": ["requiredMinYears", "requiredMaxYears", "fullTimeYears", "freelanceYears"]
                },
                "dealbreakers": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "label":  { "type": "string" },
                      "status": { "type": "string", "enum": ["MET", "MISSING", "UNCLEAR"] },
                      "detail": { "type": "string" }
                    },
                    "required": ["label", "status", "detail"]
                  }
                },
                "rewrites": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "original":   { "type": "string" },
                      "suggestion": { "type": "string" },
                      "reason":     { "type": "string" }
                    },
                    "required": ["original", "suggestion", "reason"]
                  }
                }
              },
              "required": ["jobTitle", "experience", "dealbreakers", "rewrites"]
            }
            """;

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ChatResponse(
            Message message,
            @JsonProperty("prompt_eval_count") Integer inputTokens,
            @JsonProperty("eval_count") Integer outputTokens) {

        @JsonIgnoreProperties(ignoreUnknown = true)
        record Message(String content) {
        }
    }

    private final RestClient rest;
    private final JsonMapper json;
    private final JsonNode schema;
    private final String model;

    public OllamaResumeAiClient(
            JsonMapper json,
            @Value("${tailr.ai.ollama.base-url:http://localhost:11434}") String baseUrl,
            @Value("${tailr.ai.ollama.model:qwen3:8b}") String model,
            @Value("${tailr.ai.ollama.timeout-seconds:180}") long timeoutSeconds) {
        var factory = new JdkClientHttpRequestFactory(
                HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build());
        factory.setReadTimeout(Duration.ofSeconds(timeoutSeconds));

        this.rest = RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
        this.json = json;
        this.schema = json.readTree(SCHEMA);
        this.model = model;
    }

    @Override
    public AiAnalysis analyze(String resumeText, String jobDescription, List<String> requiredSkills) {
        Map<String, Object> request = Map.of(
                "model", model,
                "stream", false,
                "think", false, // Qwen3 thinks by default, which is much slower on a laptop
                "format", schema,
                "options", Map.of(
                        "temperature", 0, // same input, same answer: easier to test
                        "num_ctx", 8192), // room for the instructions, a long resume, the JD and the answer
                "messages", List.of(
                        Map.of("role", "system", "content", Prompts.SYSTEM),
                        Map.of("role", "user", "content",
                                Prompts.user(resumeText, jobDescription, requiredSkills, LocalDate.now()))));

        String raw;
        try {
            raw = rest.post()
                    .uri("/api/chat")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(json.writeValueAsString(request))
                    .retrieve()
                    .body(String.class);
        } catch (ResourceAccessException e) {
            throw new AiUnavailableException("Ollama isn't reachable. Is the Ollama app running?", e);
        } catch (RestClientException e) {
            log.warn("Ollama request failed: {}", e.getMessage());
            throw new AiUnavailableException("Ollama request failed", e);
        }

        try {
            ChatResponse response = json.readValue(raw, ChatResponse.class);
            if (response.message() == null || response.message().content() == null
                    || response.message().content().isBlank()) {
                throw new AiUnavailableException("Ollama returned no result");
            }
            log.info("AI check (ollama {}): {} input / {} output tokens",
                    model, response.inputTokens(), response.outputTokens()); // tokens only, never resume text

            AiAnalysis analysis = json.readValue(response.message().content(), AiAnalysis.class);
            return AiOutputCleaner.clean(analysis, resumeText);
        } catch (JacksonException e) {
            throw new AiUnavailableException("Ollama returned an unreadable result", e);
        }
    }
}