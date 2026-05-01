package com.example.batchflow.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BatchInviteRequest {

    @NotNull
    private Long batchId;

    private Integer ttlHours;
}
