package com.tailr.backend.match;

import java.io.IOException;

import org.springframework.http.MediaType;
// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tailr.backend.match.dto.MatchRequest;
import com.tailr.backend.match.dto.MatchResponse;
import com.tailr.backend.resume.parse.ResumeParseException;
import com.tailr.backend.resume.parse.ResumeTextExtractor;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/match")
public class MatchController {
    private MatchService matchService;
    private ResumeTextExtractor extractor;

    // private static final Logger log =
    // LoggerFactory.getLogger(MatchController.class);

    public MatchController(MatchService matchService, ResumeTextExtractor extractor) {
        this.matchService = matchService;
        this.extractor = extractor;
    }

    @PostMapping
    public MatchResponse match(@Valid @RequestBody MatchRequest request) {
        return matchService.analyze(request);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MatchResponse matchUpload(
            @RequestPart("file") MultipartFile file,
            @RequestParam("jobDescription") String jobDescription) throws IOException {

        if (jobDescription.isBlank() || jobDescription.length() > 20_000) {
            throw new ResumeParseException("Paste a job description     under 20,000 characters.");
        }
        String resumeText = extractor.extract(file.getBytes());
        return matchService.analyze(new MatchRequest(resumeText, jobDescription));
    }
}
