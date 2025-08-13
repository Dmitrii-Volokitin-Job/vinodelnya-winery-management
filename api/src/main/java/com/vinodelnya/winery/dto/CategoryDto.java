package com.vinodelnya.winery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CategoryDto {
    private Long id;
    
    @NotBlank
    @Size(max = 255)
    private String name;
    
    private String description;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color must be a valid hex color code")
    private String color;
    
    private Boolean active = true;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}