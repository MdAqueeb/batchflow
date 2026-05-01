package com.example.batchflow.controller;

import com.example.batchflow.dto.BatchAssignTrainerRequest;
import com.example.batchflow.dto.BatchCreateRequest;
import com.example.batchflow.dto.BatchInviteRequest;
import com.example.batchflow.dto.BatchInviteResponse;
import com.example.batchflow.dto.BatchResponse;
import com.example.batchflow.dto.BatchSummaryResponse;
import com.example.batchflow.dto.JoinBatchRequest;
import com.example.batchflow.service.BatchService;
import com.example.batchflow.service.SummaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/batches")
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;
    private final SummaryService summaryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('INSTITUTION','PROGRAMME_MANAGER')")
    public ResponseEntity<BatchResponse> create(@Valid @RequestBody BatchCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(batchService.createBatch(req));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BatchResponse>> list() {
        return ResponseEntity.ok(batchService.listBatches());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BatchResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(batchService.getBatch(id));
    }

    @PostMapping("/invites")
    @PreAuthorize("hasAnyRole('INSTITUTION','TRAINER','PROGRAMME_MANAGER')")
    public ResponseEntity<BatchInviteResponse> createInvite(@Valid @RequestBody BatchInviteRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(batchService.createInvite(req.getBatchId(), req.getTtlHours()));
    }

    @PostMapping("/join")
    @PreAuthorize("hasAnyRole('STUDENT','TRAINER')")
    public ResponseEntity<BatchResponse> join(@Valid @RequestBody JoinBatchRequest req) {
        return ResponseEntity.ok(batchService.joinViaInvite(req.getToken()));
    }

    @PostMapping("/{batchId}/assign-trainer")
    @PreAuthorize("hasAnyRole('INSTITUTION','PROGRAMME_MANAGER')")
    public ResponseEntity<BatchResponse> assignTrainer(
            @PathVariable Long batchId,
            @Valid @RequestBody BatchAssignTrainerRequest req) {
        return ResponseEntity.ok(batchService.assignTrainer(batchId, req.getTrainerId()));
    }

    @GetMapping("/{id}/summary")
    @PreAuthorize("hasAnyRole('INSTITUTION','TRAINER','PROGRAMME_MANAGER','MONITORING_OFFICER')")
    public ResponseEntity<BatchSummaryResponse> summary(@PathVariable Long id) {
        return ResponseEntity.ok(summaryService.batchSummary(id));
    }
}
