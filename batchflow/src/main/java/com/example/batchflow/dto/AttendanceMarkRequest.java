package com.example.batchflow.dto;

import com.example.batchflow.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class AttendanceMarkRequest {

    @NotNull
    private Long sessionId;

    private UUID studentId;

    @NotNull
    private AttendanceStatus status;
}
