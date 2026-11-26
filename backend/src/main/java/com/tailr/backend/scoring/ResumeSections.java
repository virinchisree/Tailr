package com.tailr.backend.scoring;

import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

public final class ResumeSections {
    public enum Section {
        HEADER, SUMMARY, EXPERIENCE, EDUCATION, SKILLS, PROJECTS, OTHER
    }

    private static final Map<Section, Pattern> HEADINGS = new LinkedHashMap<>();
    static {
        HEADINGS.put(Section.EXPERIENCE,
                Pattern.compile("(work |professional )?experience|employment( history)?|work history"));
        HEADINGS.put(Section.PROJECTS, Pattern.compile("(key |personal |academic )?projects"));
        HEADINGS.put(Section.SKILLS,
                Pattern.compile("(technical |key |core )?skills|technologies|tech stack|skills (&|and) tools"));
        HEADINGS.put(Section.EDUCATION, Pattern.compile("education|academics?"));
        HEADINGS.put(Section.SUMMARY, Pattern.compile("(professional )?summary|profile|about me|objective"));
        HEADINGS.put(Section.OTHER, Pattern.compile("certifications?|achievements|awards|languages|interests|hobbies"));
    }

    private final Map<Section, String> parts;

    private ResumeSections(Map<Section, String> parts) {
        this.parts = parts;
    }

    public static ResumeSections parse(String text) {
        Map<Section, StringBuilder> builders = new EnumMap<>(Section.class);
        Section current = Section.HEADER;

        for (String line : text.split("\n")) {
            int colon = line.indexOf(':');
            String head = (colon >= 0 ? line.substring(0, colon) : line)
                    .replaceAll("^[\\s\\-•*▪●]+", "").strip().toLowerCase();
            Section heading = head.length() <= 40 ? headingFor(head) : null;

            if (heading != null) {
                current = heading;
                if (colon >= 0)
                    line = line.substring(colon + 1); // keep "Java, Spring" after "Skills:"
                else
                    continue;
            }
            builders.computeIfAbsent(current, s -> new StringBuilder()).append(line).append('\n');
        }

        Map<Section, String> parts = new EnumMap<>(Section.class);
        builders.forEach((section, sb) -> parts.put(section, sb.toString()));
        return new ResumeSections(parts);
    }

    public String get(Section section) {
        return parts.getOrDefault(section, "");
    }

    /** Where a skill counts as actually used: jobs and projects. */
    public String workText() {
        return get(Section.EXPERIENCE) + "\n" + get(Section.PROJECTS);
    }

    private static Section headingFor(String head) {
        for (var entry : HEADINGS.entrySet()) {
            if (entry.getValue().matcher(head).matches())
                return entry.getKey();
        }
        return null;
    }
}