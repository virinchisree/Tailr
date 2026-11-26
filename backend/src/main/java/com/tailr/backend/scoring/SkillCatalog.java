package com.tailr.backend.scoring;

import static java.util.stream.Collectors.joining;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Pattern;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
public class SkillCatalog {

    record Skill(String name, List<Pattern> patterns) {
        boolean foundIn(String text) {
            return patterns.stream().anyMatch(p -> p.matcher(text).find());
        }
    }

    private final List<Skill> skills;

    public SkillCatalog() {
        try (var in = new ClassPathResource("skills.txt").getInputStream();
                var reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
            skills = reader.lines()
                    .map(String::strip)
                    .filter(line -> !line.isEmpty() && !line.startsWith("#"))
                    .map(SkillCatalog::parse)
                    .toList();
        } catch (IOException e) {
            throw new UncheckedIOException("Could not load skills.txt", e);
        }
    }

    /** Skills name found in the text file, in catalog order */
    public Set<String> find(String text) {
        Set<String> found = new LinkedHashSet<>();
        for (Skill skill : skills) {
            if (skill.foundIn(text))
                found.add(skill.name());
        }
        return found;
    }

    private static Skill parse(String line) {
        String[] parts = line.split("\\|", 2);
        String name = parts[0].strip();
        List<String> spellings = new ArrayList<>(List.of(name));
        if (parts.length > 1)
            spellings.addAll(Arrays.asList(parts[1].split(",")));
        return new Skill(name, spellings.stream()
                .map(String::strip)
                .filter(s -> !s.isEmpty())
                .map(SkillCatalog::pattern)
                .toList());
    }

    // "Spring Boot" also matches "SpringBoot" and "spring-boot"
    // the edges stop "Java" matching inside "JavaScript" and "SQL"
    // inside"PostgreSQL"
    private static Pattern pattern(String spelling) {
        String body = Arrays.stream(spelling.toLowerCase().split("\\s+"))
                .map(Pattern::quote)
                .collect(joining("[\\s-]?"));
        return Pattern.compile("(?<![\\p{Alnum}+#])" + body + "(?![\\p{Alnum}+#])", Pattern.CASE_INSENSITIVE);
    }
}