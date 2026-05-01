package com.example.batchflow.controller;

import com.example.batchflow.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestSecurityController {

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User user = (User) authentication.getPrincipal();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());
            response.put("authorities", authentication.getAuthorities());
        } else {
            response.put("message", "Authenticated, but principal is not of type User");
            if (authentication != null) {
                response.put("principal", authentication.getPrincipal().toString());
            }
        }
        
        return ResponseEntity.ok(response);
    }
}
