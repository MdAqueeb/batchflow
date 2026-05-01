package com.example.batchflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BatchCreateRequest {

    @NotBlank
    private String name;

    @NotNull
    private Long institutionId;
}
