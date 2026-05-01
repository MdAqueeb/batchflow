package com.example.batchflow.controller;

import com.example.batchflow.dto.ProgrammeSummaryResponse;
import com.example.batchflow.service.SummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/programme")
@RequiredArgsConstructor
public class ProgrammeController {

    private final SummaryService summaryService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('PROGRAMME_MANAGER','MONITORING_OFFICER')")
    public ResponseEntity<ProgrammeSummaryResponse> summary() {
        return ResponseEntity.ok(summaryService.programmeSummary());
    }
}
