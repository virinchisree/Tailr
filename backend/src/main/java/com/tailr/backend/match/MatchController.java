package com.tailr.backend.match;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tailr.backend.match.dto.MatchRequest;
import com.tailr.backend.match.dto.MatchResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/match")
public class MatchController {
    private MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @PostMapping
    public MatchResponse match(@Valid @RequestBody MatchRequest request) {
        return matchService.analyze(request);
    }
}
