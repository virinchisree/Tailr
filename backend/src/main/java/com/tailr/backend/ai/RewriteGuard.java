package com.tailr.backend.ai;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.tailr.backend.scoring.SkillCatalog;

/** TO reject rewrites that claim more than the original bullet does. */
@Component
public class RewriteGuard {
    private static final Logger log = LoggerFactory.getLogger(RewriteGuard.class);

    private static final Pattern PLACEHOLDER = Pattern.compile("\\[[^\\]]*\\]");
    private static final Pattern NUMBER = Pattern
            .compile("(?i)\\d[\\d,.]*(?:\\s?(?:%|\\+|k\\b|x\\b|lakh|crore|million))?");
    private static final Pattern INFLATED_NUMBER = Pattern
            .compile("(?i)\\b(over|more than|nearly|almost|up to|at least|around)\\s+\\d");

    // a bigger role than "worked on" or "helped with"
    private static final Set<String> ROLE_WORDS = Set.of(
            "designed", "architected", "led", "owned", "spearheaded", "managed", "headed", "mentored",
            "founded", "drove", "directed", "supervised", "oversaw");

    // results and benefits the user has to state themselves
    private static final List<String> RESULT_STEMS = List.of(
            "improv", "increas", "boost", "enhanc", "optimi", "accelerat", "sav", "reduc", "cut",
            "grew", "grow", "scalab", "reliab", "efficien", "revenue", "cost", "faster", "performan");

    private static final double TOO_SIMILAR = 0.75;

    private final SkillCatalog catalog;

    public RewriteGuard(SkillCatalog catalog) {
        this.catalog = catalog;
    }

    public List<AiAnalysis.Rewrite> keepHonest(List<AiAnalysis.Rewrite> rewrites) {
        List<AiAnalysis.Rewrite> kept = rewrites.stream().filter(r -> problem(r).isEmpty()).toList();
        if (kept.size() < rewrites.size()) {
            log.info("Rewrite guard dropped {} of {} rewrites", rewrites.size() - kept.size(), rewrites.size());
        }
        return kept;
    }

    /** Why a rewrite is rejected, or empty if it's fine. */
    public Optional<String> problem(AiAnalysis.Rewrite r) {
        String before = r.original();
        String after = PLACEHOLDER.matcher(r.suggestion()).replaceAll(" ");

        if (!numbers(before).containsAll(numbers(after))
                || (INFLATED_NUMBER.matcher(after).find() && !INFLATED_NUMBER.matcher(before).find())) {
            return Optional.of("changes or adds a number");
        }
        if (!catalog.find(before).containsAll(catalog.find(after))) {
            return Optional.of("adds a skill");
        }

        Set<String> beforeWords = words(before);
        Set<String> afterWords = words(after);

        if (afterWords.stream().anyMatch(w -> ROLE_WORDS.contains(w) && !beforeWords.contains(w))) {
            return Optional.of("claims a bigger role");
        }
        for (String stem : RESULT_STEMS) {
            if (hasStem(afterWords, stem) && !hasStem(beforeWords, stem)) {
                return Optional.of("adds a result or benefit");
            }
        }
        if (similarity(beforeWords, afterWords) >= TOO_SIMILAR) {
            return Optional.of("barely changes the bullet");
        }
        return Optional.empty();
    }

    private static Set<String> numbers(String s) {
        return NUMBER.matcher(s).results()
                .map(m -> m.group().replaceAll("[.,]+$", "").replace(" ", "").toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());
    }

    private static Set<String> words(String s) {
        return Arrays.stream(s.toLowerCase(Locale.ROOT).split("[^\\p{L}\\p{N}]+"))
                .filter(w -> !w.isEmpty())
                .collect(Collectors.toSet());
    }

    private static boolean hasStem(Set<String> words, String stem) {
        return words.stream().anyMatch(w -> w.startsWith(stem));
    }

    private static double similarity(Set<String> a, Set<String> b) {
        long shared = a.stream().filter(b::contains).count();
        return (double) shared / (a.size() + b.size() - shared);
    }
}