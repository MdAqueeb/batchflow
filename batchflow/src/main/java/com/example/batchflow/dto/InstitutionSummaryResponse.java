package com.example.batchflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InstitutionSummaryResponse {
    private Long institutionId;
    private String institutionName;
    private long batchCount;
    private long trainerCount;
    private long studentCount;
    private long sessionCount;
    private long attendanceCount;
    private long presentCount;
    private long absentCount;
    private long lateCount;
}
