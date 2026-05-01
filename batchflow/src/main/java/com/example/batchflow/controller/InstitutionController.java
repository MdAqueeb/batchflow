package com.example.batchflow.controller;

import com.example.batchflow.dto.InstitutionResponse;
import com.example.batchflow.dto.InstitutionSummaryResponse;
import com.example.batchflow.dto.UserResponse;
import com.example.batchflow.entity.User;
import com.example.batchflow.enums.Role;
import com.example.batchflow.exception.ForbiddenException;
import com.example.batchflow.repository.InstitutionRepository;
import com.example.batchflow.repository.UserRepository;
import com.example.batchflow.service.SummaryService;
import com.example.batchflow.util.AuthUtil;
import com.example.batchflow.util.Mappers;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/institutions")
@RequiredArgsConstructor
public class InstitutionController {

    private final SummaryService summaryService;
    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<InstitutionResponse>> list() {
        List<InstitutionResponse> institutions = institutionRepository.findAll()
                .stream()
                .map(i -> InstitutionResponse.builder().id(i.getId()).name(i.getName()).build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(institutions);
    }

    @GetMapping("/{id}/trainers")
    @PreAuthorize("hasAnyRole('INSTITUTION','PROGRAMME_MANAGER')")
    public ResponseEntity<List<UserResponse>> trainers(@PathVariable Long id) {
        User actor = AuthUtil.currentUser();
        if (actor.getRole() == Role.INSTITUTION) {
            if (actor.getInstitution() == null || !actor.getInstitution().getId().equals(id)) {
                throw new ForbiddenException("Cannot view trainers of another institution");
            }
        }
        List<UserResponse> trainers = userRepository.findByInstitution_IdAndRole(id, Role.TRAINER)
                .stream()
                .map(Mappers::toUserResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(trainers);
    }

    @GetMapping("/{id}/summary")
    @PreAuthorize("hasAnyRole('INSTITUTION','PROGRAMME_MANAGER','MONITORING_OFFICER')")
    public ResponseEntity<InstitutionSummaryResponse> summary(@PathVariable Long id) {
        return ResponseEntity.ok(summaryService.institutionSummary(id));
    }
}
