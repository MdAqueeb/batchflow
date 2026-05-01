package com.example.batchflow.service;

import com.example.batchflow.dto.AttendanceMarkRequest;
import com.example.batchflow.dto.AttendanceResponse;
import com.example.batchflow.entity.Attendance;
import com.example.batchflow.entity.Batch;
import com.example.batchflow.entity.Session;
import com.example.batchflow.entity.User;
import com.example.batchflow.enums.Role;
import com.example.batchflow.exception.BadRequestException;
import com.example.batchflow.exception.ForbiddenException;
import com.example.batchflow.exception.ResourceNotFoundException;
import com.example.batchflow.repository.AttendanceRepository;
import com.example.batchflow.repository.SessionRepository;
import com.example.batchflow.repository.UserRepository;
import com.example.batchflow.util.AuthUtil;
import com.example.batchflow.util.Mappers;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;

    @Transactional
    public AttendanceResponse mark(AttendanceMarkRequest req) {
        User actor = AuthUtil.currentUser();
        Session session = sessionRepository.findById(req.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + req.getSessionId()));
        Batch batch = session.getBatch();

        UUID studentId;
        if (actor.getRole() == Role.STUDENT) {
            LocalDate today = LocalDate.now();
            LocalTime now = LocalTime.now();
            if (!session.getDate().equals(today)
                    || now.isBefore(session.getStartTime())
                    || now.isAfter(session.getEndTime())) {
                throw new BadRequestException("Session is not currently active");
            }
            if (req.getStudentId() != null && !req.getStudentId().equals(actor.getId())) {
                throw new ForbiddenException("Student cannot mark another student");
            }
            boolean enrolled = batch.getStudents().stream().anyMatch(s -> s.getId().equals(actor.getId()));
            if (!enrolled) throw new ForbiddenException("Not enrolled in this batch");
            studentId = actor.getId();
        } else if (actor.getRole() == Role.TRAINER) {
            boolean assigned = batch.getTrainers().stream().anyMatch(t -> t.getId().equals(actor.getId()));
            if (!assigned) throw new ForbiddenException("Trainer not assigned to this batch");
            if (req.getStudentId() == null) throw new BadRequestException("studentId required");
            studentId = req.getStudentId();
        } else {
            throw new ForbiddenException("Only STUDENT or TRAINER can mark attendance");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
        if (student.getRole() != Role.STUDENT) {
            throw new BadRequestException("Target user not a student");
        }
        boolean inBatch = batch.getStudents().stream().anyMatch(s -> s.getId().equals(student.getId()));
        if (!inBatch) throw new BadRequestException("Student not in this batch");

        Attendance att = attendanceRepository
                .findBySessionIdAndStudentId(session.getId(), student.getId())
                .orElseGet(() -> Attendance.builder()
                        .session(session)
                        .student(student)
                        .build());
        att.setStatus(req.getStatus());
        att.setMarkedAt(LocalDateTime.now());

        return Mappers.toAttendanceResponse(attendanceRepository.save(att));
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> bySession(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));
        ensureCanViewSession(session);
        return attendanceRepository.findBySessionId(sessionId).stream()
                .map(Mappers::toAttendanceResponse).toList();
    }

    private void ensureCanViewSession(Session s) {
        User actor = AuthUtil.currentUser();
        Batch b = s.getBatch();
        boolean ok = switch (actor.getRole()) {
            case PROGRAMME_MANAGER, MONITORING_OFFICER -> true;
            case INSTITUTION -> actor.getInstitution() != null
                    && actor.getInstitution().getId().equals(b.getInstitution().getId());
            case TRAINER -> b.getTrainers().stream().anyMatch(t -> t.getId().equals(actor.getId()));
            case STUDENT -> b.getStudents().stream().anyMatch(st -> st.getId().equals(actor.getId()));
        };
        if (!ok) throw new ForbiddenException("Not allowed to view this session attendance");
    }
}
