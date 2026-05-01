package com.example.batchflow.service;

import com.example.batchflow.dto.BatchCreateRequest;
import com.example.batchflow.dto.BatchInviteResponse;
import com.example.batchflow.dto.BatchResponse;
import com.example.batchflow.entity.Batch;
import com.example.batchflow.entity.BatchInvite;
import com.example.batchflow.entity.Institution;
import com.example.batchflow.entity.User;
import com.example.batchflow.enums.Role;
import com.example.batchflow.exception.BadRequestException;
import com.example.batchflow.exception.ForbiddenException;
import com.example.batchflow.exception.ResourceNotFoundException;
import com.example.batchflow.repository.BatchInviteRepository;
import com.example.batchflow.repository.BatchRepository;
import com.example.batchflow.repository.InstitutionRepository;
import com.example.batchflow.repository.UserRepository;
import com.example.batchflow.util.AuthUtil;
import com.example.batchflow.util.Mappers;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BatchService {

    private final BatchRepository batchRepository;
    private final UserRepository userRepository; 
    private final InstitutionRepository institutionRepository;
    private final BatchInviteRepository batchInviteRepository;

    @Transactional
    public BatchResponse createBatch(BatchCreateRequest req) {
        User actor = AuthUtil.currentUser();
        if (actor.getRole() != Role.INSTITUTION && actor.getRole() != Role.PROGRAMME_MANAGER) {
            throw new ForbiddenException("Only INSTITUTION or PROGRAMME_MANAGER can create batches");
        }

        Institution inst = institutionRepository.findById(req.getInstitutionId())
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found: " + req.getInstitutionId()));

        if (actor.getRole() == Role.INSTITUTION) {
            if (actor.getInstitution() == null || !actor.getInstitution().getId().equals(inst.getId())) {
                throw new ForbiddenException("Cannot create batch for another institution");
            }
        }

        Batch batch = Batch.builder()
                .name(req.getName())
                .institution(inst)
                .build();
        return Mappers.toBatchResponse(batchRepository.save(batch));
    }

    @Transactional(readOnly = true)
    public List<BatchResponse> listBatches() {
        User actor = AuthUtil.currentUser();

        User freshUser = userRepository.findById(actor.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return switch (freshUser.getRole()) {

            case PROGRAMME_MANAGER, MONITORING_OFFICER ->
                    batchRepository.findAll().stream()
                            .map(Mappers::toBatchResponse)
                            .toList();

            case INSTITUTION -> {
                if (freshUser.getInstitution() == null) yield List.of();

                yield batchRepository.findByInstitutionId(freshUser.getInstitution().getId())
                        .stream()
                        .map(Mappers::toBatchResponse)
                        .toList();
            }

            case TRAINER ->
                    freshUser.getTrainerBatches().stream()
                            .map(Mappers::toBatchResponse)
                            .toList();

            case STUDENT ->
                    freshUser.getStudentBatches().stream()
                            .map(Mappers::toBatchResponse)
                            .toList();
        };
    }

    @Transactional(readOnly = true)
    public BatchResponse getBatch(Long id) {
        Batch b = batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + id));
        ensureCanViewBatch(b);
        return Mappers.toBatchResponse(b);
    }

    @Transactional
    public BatchInviteResponse createInvite(Long batchId, Integer ttlHours) {
        User actor = AuthUtil.currentUser();
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + batchId));

        boolean allowed = switch (actor.getRole()) {
            case PROGRAMME_MANAGER -> true;
            case INSTITUTION -> actor.getInstitution() != null
                    && actor.getInstitution().getId().equals(batch.getInstitution().getId());
            case TRAINER -> batch.getTrainers().stream().anyMatch(t -> t.getId().equals(actor.getId()));
            default -> false;
        };
        if (!allowed) throw new ForbiddenException("Not allowed to issue invites for this batch");

        int hours = ttlHours == null || ttlHours <= 0 ? 24 : ttlHours;
        BatchInvite invite = BatchInvite.builder()
                .batch(batch)
                .token(UUID.randomUUID().toString().replace("-", ""))
                .expiresAt(LocalDateTime.now(ZoneId.of("Asia/Kolkata")).plusHours(hours))
                .isActive(true)
                .build();
        return Mappers.toInviteResponse(batchInviteRepository.save(invite));
    }

    @Transactional
    public BatchResponse joinViaInvite(String token) {
        User actor = AuthUtil.currentUser();
        BatchInvite invite = batchInviteRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invite not found"));

        if (Boolean.FALSE.equals(invite.getIsActive())) {
            throw new BadRequestException("Invite inactive");
        }
        if (invite.getExpiresAt().isBefore(LocalDateTime.now(ZoneId.of("Asia/Kolkata")))) {
            invite.setIsActive(false);
            batchInviteRepository.save(invite);
            throw new BadRequestException("Invite expired");
        }

        Batch batch = invite.getBatch();
        switch (actor.getRole()) {
            case STUDENT -> batch.getStudents().add(actor);
            case TRAINER -> batch.getTrainers().add(actor);
            default -> throw new ForbiddenException("Only STUDENT or TRAINER can join via invite");
        }
        batchRepository.save(batch);
        return Mappers.toBatchResponse(batch);
    }

    @Transactional
    public BatchResponse assignTrainer(Long batchId, UUID trainerId) {
        User actor = AuthUtil.currentUser();
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + batchId));

        if (actor.getRole() == Role.INSTITUTION) {
            if (actor.getInstitution() == null
                    || !actor.getInstitution().getId().equals(batch.getInstitution().getId())) {
                throw new ForbiddenException("Cannot manage trainers for another institution's batch");
            }
        }

        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + trainerId));
        if (trainer.getRole() != Role.TRAINER) {
            throw new BadRequestException("Target user is not a TRAINER");
        }
        if (trainer.getInstitution() == null
                || !trainer.getInstitution().getId().equals(batch.getInstitution().getId())) {
            throw new BadRequestException("Trainer does not belong to this batch's institution");
        }

        batch.getTrainers().add(trainer);
        return Mappers.toBatchResponse(batchRepository.save(batch));
    }

    private void ensureCanViewBatch(Batch b) {
        User actor = AuthUtil.currentUser();
        boolean ok = switch (actor.getRole()) {
            case PROGRAMME_MANAGER, MONITORING_OFFICER -> true;
            case INSTITUTION -> actor.getInstitution() != null
                    && actor.getInstitution().getId().equals(b.getInstitution().getId());
            case TRAINER -> b.getTrainers().stream().anyMatch(t -> t.getId().equals(actor.getId()));
            case STUDENT -> b.getStudents().stream().anyMatch(s -> s.getId().equals(actor.getId()));
        };
        if (!ok) throw new ForbiddenException("Not allowed to view this batch");
    }
}
