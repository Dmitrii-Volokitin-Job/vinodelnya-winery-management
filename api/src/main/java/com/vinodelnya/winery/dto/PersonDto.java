package com.vinodelnya.winery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PersonDto {
    private Long id;
    
    @NotBlank
    @Size(max = 255)
    private String name;
    
    private String note;
    
    private Boolean active = true;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}