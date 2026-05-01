package com.example.batchflow.dto;

import com.example.batchflow.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceResponse {
    private Long id;
    private Long sessionId;
    private UUID studentId;
    private String studentName;
    private AttendanceStatus status;
    private LocalDateTime markedAt;
}
