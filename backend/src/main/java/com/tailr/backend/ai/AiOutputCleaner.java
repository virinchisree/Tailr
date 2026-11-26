package com.tailr.backend.ai;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/** Never trust a model's output as-is. */
public class AiOutputCleaner {

    static final int MAX_REWRITES = 6;
    private static final Set<String> STATUSES = Set.of("MET", "MISSING", "UNCLEAR");
    private static final Pattern LEADING_BULLET = Pattern.compile("^[\\s\\-•*▪●◦–]+");

    private AiOutputCleaner() {
    }

    static AiAnalysis clean(AiAnalysis a, String resumeText) {
        String title = a.jobTitle() == null ? "" : a.jobTitle().strip();

        var e = a.experience();
        var experience = e == null ? new AiAnalysis.Experience(0, 0, 0, 0)
                : new AiAnalysis.Experience(years(e.requiredMinYears()), years(e.requiredMaxYears()),
                        years(e.fullTimeYears()), years(e.freelanceYears()));

        var dealBreakers = a.dealBreakers() == null ? List.<AiAnalysis.Dealbreaker>of()
                : a.dealBreakers().stream()
                        .filter(d -> d.label() != null && !d.label().isBlank())
                        .map(d -> {
                            String status = d.status() == null ? "" : d.status().strip().toLowerCase(Locale.ROOT);
                            return new AiAnalysis.Dealbreaker(d.label().strip(),
                                    STATUSES.contains(status) ? status : "UNCLEAR",
                                    d.detail() == null ? "" : d.detail().strip());
                        }).toList();

        var reWrites = a.rewrites() == null ? List.<AiAnalysis.Rewrite>of()
                : a.rewrites().stream()
                        .filter(r -> r.original() != null && r.suggestion() != null)
                        .map(r -> new AiAnalysis.Rewrite(
                                LEADING_BULLET.matcher(r.original()).replaceFirst("").strip(),
                                r.suggestion().strip(),
                                r.reason() == null ? "" : r.reason().strip()))
                        // the results page replaces this exact text, so it must exist word for word
                        .filter(r -> !r.original().isEmpty() && resumeText.contains(r.original()))
                        .filter(r -> !r.suggestion().isEmpty() && !squash(r.suggestion()).equals(squash(r.original())))
                        .limit(MAX_REWRITES)
                        .toList();

        return new AiAnalysis(title, experience, dealBreakers, reWrites);
    }

    private static double years(double y) {
        return Double.isFinite(y) ? Math.round(Math.max(0, Math.min(y, 50)) * 10) / 10.0 : 0;
    }

    private static String squash(String s) {
        return s.replaceAll("\\s+", " ").strip().toLowerCase(Locale.ROOT);
    }
}