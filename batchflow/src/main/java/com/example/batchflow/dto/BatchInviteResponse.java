package com.example.batchflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BatchInviteResponse {
    private Long id;
    private Long batchId;
    private String token;
    private LocalDateTime expiresAt;
    private Boolean isActive;
}
