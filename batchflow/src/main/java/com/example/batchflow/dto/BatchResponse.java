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
public class BatchResponse {
    private Long id;
    private String name;
    private Long institutionId;
    private String institutionName;
    private int trainerCount;
    private int studentCount;
    private LocalDateTime createdAt;
}
