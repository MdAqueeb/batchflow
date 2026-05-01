package com.example.batchflow.controller;

import com.example.batchflow.dto.SessionCreateRequest;
import com.example.batchflow.dto.SessionResponse;
import com.example.batchflow.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping
    @PreAuthorize("hasRole('TRAINER')")
    public ResponseEntity<SessionResponse> create(@Valid @RequestBody SessionCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionService.createSession(req));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SessionResponse>> listByBatch(@RequestParam Long batchId) {
        return ResponseEntity.ok(sessionService.sessionsByBatch(batchId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SessionResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(sessionService.getSession(id));
    }
}
