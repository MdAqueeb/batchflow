package com.example.batchflow.controller;

import com.example.batchflow.dto.AttendanceMarkRequest;
import com.example.batchflow.dto.AttendanceResponse;
import com.example.batchflow.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT','TRAINER')")
    public ResponseEntity<AttendanceResponse> mark(@Valid @RequestBody AttendanceMarkRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attendanceService.mark(req));
    }

    @GetMapping("/session/{sessionId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AttendanceResponse>> bySession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(attendanceService.bySession(sessionId));
    }
}
