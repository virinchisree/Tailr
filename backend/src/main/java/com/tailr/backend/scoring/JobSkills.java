package com.tailr.backend.scoring;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

public record JobSkills(List<String> required, List<String> preferred) {
    private static final Pattern PREFERRED_HEADING = Pattern
            .compile("(nice|good) to have|preferred|bonus|desirable|optional");
    private static final Pattern REQUIRED_HEADING = Pattern.compile(
            "requirement|required|must have|qualification|you('ll| will)? need|looking for|responsibilit|skills|tech stack");
    private static final Pattern PREFERRED_INLINE = Pattern
            .compile("(nice|good) to have|is a plus|\\ba plus\\b|preferred|bonus|desirable");

    public static JobSkills parse(String jobDescription, SkillCatalog catalog) {
        Set<String> required = new LinkedHashSet<>();
        Set<String> preferred = new LinkedHashSet<>();
        boolean inPreferredSection = false;

        for (String line : jobDescription.split("\n")) {
            String lower = line.toLowerCase();
            Set<String> found = catalog.find(line);

            // a short line with no skills in it is probably a heading
            if (found.isEmpty() && line.strip().length() <= 60) {
                if (PREFERRED_HEADING.matcher(lower).find())
                    inPreferredSection = true;
                else if (REQUIRED_HEADING.matcher(lower).find())
                    inPreferredSection = false;
                continue;
            }
            if (inPreferredSection || PREFERRED_INLINE.matcher(lower).find())
                preferred.addAll(found);
            else
                required.addAll(found);
        }

        preferred.removeAll(required); // if it's required anywhere, it's required
        return new JobSkills(List.copyOf(required), List.copyOf(preferred));
    }
}