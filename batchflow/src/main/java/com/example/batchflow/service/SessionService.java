package com.example.batchflow.service;

import com.example.batchflow.dto.SessionCreateRequest;
import com.example.batchflow.dto.SessionResponse;
import com.example.batchflow.entity.Batch;
import com.example.batchflow.entity.Session;
import com.example.batchflow.entity.User;
import com.example.batchflow.enums.Role;
import com.example.batchflow.exception.BadRequestException;
import com.example.batchflow.exception.ForbiddenException;
import com.example.batchflow.exception.ResourceNotFoundException;
import com.example.batchflow.repository.BatchRepository;
import com.example.batchflow.repository.SessionRepository;
import com.example.batchflow.util.AuthUtil;
import com.example.batchflow.util.Mappers;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final BatchRepository batchRepository;

    @Transactional
    public SessionResponse createSession(SessionCreateRequest req) {
        User actor = AuthUtil.currentUser();
        if (actor.getRole() != Role.TRAINER) {
            throw new ForbiddenException("Only TRAINER can create sessions");
        }

        Batch batch = batchRepository.findById(req.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + req.getBatchId()));

        boolean assigned = batch.getTrainers().stream().anyMatch(t -> t.getId().equals(actor.getId()));
        if (!assigned) throw new ForbiddenException("Trainer not assigned to this batch");

        if (req.getEndTime().isBefore(req.getStartTime()) || req.getEndTime().equals(req.getStartTime())) {
            throw new BadRequestException("endTime must be after startTime");
        }

        Session session = Session.builder()
                .batch(batch)
                .trainer(actor)
                .title(req.getTitle())
                .date(req.getDate())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .build();
        return Mappers.toSessionResponse(sessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> sessionsByBatch(Long batchId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + batchId));
        ensureCanViewBatch(batch);
        return sessionRepository.findByBatchId(batchId).stream()
                .map(Mappers::toSessionResponse).toList();
    }

    @Transactional(readOnly = true)
    public SessionResponse getSession(Long sessionId) {
        Session s = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));
        ensureCanViewBatch(s.getBatch());
        return Mappers.toSessionResponse(s);
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
