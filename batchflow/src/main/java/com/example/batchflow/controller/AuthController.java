package com.example.batchflow.controller;

import com.example.batchflow.config.JwtTokenProvider;
import com.example.batchflow.dto.AuthResponse;
import com.example.batchflow.dto.LoginRequest;
import com.example.batchflow.dto.RegisterRequest;
import com.example.batchflow.entity.Institution;
import com.example.batchflow.entity.User;
import com.example.batchflow.exception.BadRequestException;
import com.example.batchflow.exception.ResourceNotFoundException;
import com.example.batchflow.exception.UnauthorizedException;
import com.example.batchflow.repository.InstitutionRepository;
import com.example.batchflow.repository.UserRepository;
import com.example.batchflow.util.Mappers;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }

        User.UserBuilder userBuilder = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .role(request.getRole())
                .passwordHash(passwordEncoder.encode(request.getPassword()));

        switch (request.getRole()) {
            case INSTITUTION -> {
                if (request.getInstitutionName() == null || request.getInstitutionName().isBlank()) {
                    throw new BadRequestException("institutionName is required for INSTITUTION role");
                }
                Institution inst = institutionRepository.save(
                        Institution.builder().name(request.getInstitutionName().trim()).build()
                );
                userBuilder.institution(inst);
            }
            case TRAINER, STUDENT -> {
                if (request.getInstitutionId() == null) {
                    throw new BadRequestException("institutionId is required for " + request.getRole() + " role");
                }
                Institution inst = institutionRepository.findById(request.getInstitutionId())
                        .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));
                userBuilder.institution(inst);
            }
            default -> { /* PROGRAMME_MANAGER, MONITORING_OFFICER need no institution */ }
        }

        User user = userRepository.save(userBuilder.build());
        String token = jwtTokenProvider.generateToken(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, Mappers.toUserResponse(user)));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtTokenProvider.generateToken(user);
        AuthResponse response = new AuthResponse(token, Mappers.toUserResponse(user));
        return ResponseEntity.ok(response);
    }
}
