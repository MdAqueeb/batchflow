package com.example.batchflow.dto;

import com.example.batchflow.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private UUID id;
    private String name;
    private String email;
    private Role role;
    private Long institutionId;
    private String institutionName;
    private LocalDateTime createdAt;
}
