package com.example.batchflow.controller;

import com.example.batchflow.dto.UserResponse;
import com.example.batchflow.entity.User;
import com.example.batchflow.repository.UserRepository;
import com.example.batchflow.util.AuthUtil;
import com.example.batchflow.util.Mappers;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {

        User current = AuthUtil.currentUser();

        User user = userRepository.findByIdWithInstitution(current.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(Mappers.toUserResponse(user));
    }
}
