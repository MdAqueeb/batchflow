package com.example.batchflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProgrammeSummaryResponse {
    private long totalInstitutions;
    private long totalBatches;
    private long totalTrainers;
    private long totalStudents;
    private long totalSessions;
    private long totalAttendance;
    private long presentCount;
    private long absentCount;
    private long lateCount;
    private List<InstitutionSummaryResponse> perInstitution;
}
