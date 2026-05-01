package com.example.batchflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JoinBatchRequest {

    @NotBlank
    private String token;
}
