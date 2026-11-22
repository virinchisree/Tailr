package com.tailr.backend.common;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.tailr.backend.resume.parse.ResumeParseException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiError handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
        return new ApiError(400, "Please check your inputs.", errors);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<ApiError> handleUnexpected(Exception e) {
        if (e instanceof ErrorResponse er) {
            int status = er.getStatusCode().value();
            String message = er.getBody().getDetail() != null ? er.getBody().getDetail()
                    : "The request could not be completed";
            return ResponseEntity.status(status).body(new ApiError(status, message, Map.of()));
        }
        log.error("Unhandled error", e); // stack trace only
        return ResponseEntity.internalServerError()
                .body(new ApiError(500, "Something went wrong. Please try agin", Map.of()));
    }

    @ExceptionHandler(ResumeParseException.class)
    public ResponseEntity<ApiError> handlePrase(ResumeParseException e) {
        return ResponseEntity.badRequest()
                .body(new ApiError(400, e.getMessage(), Map.of("resumeText", e.getMessage())));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> handleTooLarge(MaxUploadSizeExceededException e) {
        return ResponseEntity.status(HttpStatus.CONTENT_TOO_LARGE)
                .body(new ApiError(413, "Files must be under 5 MB.", Map.of()));
    }
}