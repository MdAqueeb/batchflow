package com.example.batchflow.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "BatchFlow API",
                version = "1.0.0",
                description = "Attendance Management System API",
                contact = @Contact(name = "BatchFlow Team", email = "support@batchflow.com")
        ),
        servers = {
                @Server(url = "http://localhost:8080", description = "Local Development"),
                @Server(url = "https://api.batchflow.com", description = "Production")
        },
        security = @SecurityRequirement(name = "Bearer JWT")
)
@SecurityScheme(
        name = "Bearer JWT",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "JWT authentication. Format: Bearer <token>",
        in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
}
