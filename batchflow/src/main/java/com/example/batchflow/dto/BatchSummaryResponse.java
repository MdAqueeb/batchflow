package com.example.batchflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BatchSummaryResponse {
    private Long batchId;
    private String batchName;
    private long studentCount;
    private long trainerCount;
    private long sessionCount;
    private long attendanceCount;
    private long presentCount;
    private long absentCount;
    private long lateCount;
    private double attendanceRate;
}
