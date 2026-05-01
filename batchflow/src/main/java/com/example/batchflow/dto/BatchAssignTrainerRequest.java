package com.example.batchflow.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class BatchAssignTrainerRequest {
    @NotNull(message = "trainerId is required")
    private UUID trainerId;
}
