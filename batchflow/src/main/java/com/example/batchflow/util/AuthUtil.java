package com.example.batchflow.util;

import com.example.batchflow.entity.User;
import com.example.batchflow.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class AuthUtil {

    private AuthUtil() {}

    public static User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User u)) {
            throw new UnauthorizedException("No authenticated user");
        }
        return u;
    }
}
