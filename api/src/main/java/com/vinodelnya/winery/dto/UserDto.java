package com.vinodelnya.winery.dto;

import com.vinodelnya.winery.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Schema(description = "User data transfer object")
public record UserDto(
        @Schema(description = "User ID", example = "1")
        Long id,

        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        @Schema(description = "Username", example = "john_doe", required = true)
        String username,

        @Size(min = 6, max = 255, message = "Password must be at least 6 characters")
        @Schema(description = "Password (only for creation/update)", example = "password123")
        String password,

        @NotNull(message = "Role is required")
        @Schema(description = "User role", example = "USER", required = true, allowableValues = {"ADMIN", "USER"})
        User.Role role,

        @NotNull(message = "Active status is required")
        @Schema(description = "Whether the user is active", example = "true", required = true)
        Boolean active,

        @Schema(description = "Creation timestamp", example = "2025-01-15T10:30:00")
        LocalDateTime createdAt,

        @Schema(description = "Last update timestamp", example = "2025-01-15T10:30:00")
        LocalDateTime updatedAt
) {
    // Constructor for creating without password (for responses)
    public UserDto(Long id, String username, User.Role role, Boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this(id, username, null, role, active, createdAt, updatedAt);
    }
}