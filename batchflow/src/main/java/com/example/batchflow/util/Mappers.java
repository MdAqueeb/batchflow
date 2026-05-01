package com.example.batchflow.util;

import com.example.batchflow.dto.AttendanceResponse;
import com.example.batchflow.dto.BatchInviteResponse;
import com.example.batchflow.dto.BatchResponse;
import com.example.batchflow.dto.SessionResponse;
import com.example.batchflow.dto.UserResponse;
import com.example.batchflow.entity.Attendance;
import com.example.batchflow.entity.Batch;
import com.example.batchflow.entity.BatchInvite;
import com.example.batchflow.entity.Session;
import com.example.batchflow.entity.User;

public final class Mappers {

    private Mappers() {}

    public static BatchResponse toBatchResponse(Batch b) {
        return BatchResponse.builder()
                .id(b.getId())
                .name(b.getName())
                .institutionId(b.getInstitution() != null ? b.getInstitution().getId() : null)
                .institutionName(b.getInstitution() != null ? b.getInstitution().getName() : null)
                .trainerCount(b.getTrainers() != null ? b.getTrainers().size() : 0)
                .studentCount(b.getStudents() != null ? b.getStudents().size() : 0)
                .createdAt(b.getCreatedAt())
                .build();
    }

    public static SessionResponse toSessionResponse(Session s) {
        return SessionResponse.builder()
                .id(s.getId())
                .batchId(s.getBatch().getId())
                .batchName(s.getBatch().getName())
                .trainerId(s.getTrainer().getId())
                .trainerName(s.getTrainer().getName())
                .title(s.getTitle())
                .date(s.getDate())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .createdAt(s.getCreatedAt())
                .build();
    }

    public static AttendanceResponse toAttendanceResponse(Attendance a) {
        return AttendanceResponse.builder()
                .id(a.getId())
                .sessionId(a.getSession().getId())
                .studentId(a.getStudent().getId())
                .studentName(a.getStudent().getName())
                .status(a.getStatus())
                .markedAt(a.getMarkedAt())
                .build();
    }

    public static BatchInviteResponse toInviteResponse(BatchInvite i) {
        return BatchInviteResponse.builder()
                .id(i.getId())
                .batchId(i.getBatch().getId())
                .token(i.getToken())
                .expiresAt(i.getExpiresAt())
                .isActive(i.getIsActive())
                .build();
    }

    public static UserResponse toUserResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .role(u.getRole())
                .institutionId(u.getInstitution() != null ? u.getInstitution().getId() : null)
                .institutionName(u.getInstitution() != null ? u.getInstitution().getName() : null)
                .createdAt(u.getCreatedAt())
                .build();
    }
}
