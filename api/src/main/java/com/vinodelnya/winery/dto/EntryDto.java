package com.vinodelnya.winery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class EntryDto {
    private Long id;
    
    @NotNull
    private LocalDate date;
    
    @NotBlank
    private String description;
    
    @NotNull
    private Long personId;
    
    private String personName;
    
    @NotNull
    private Long categoryId;
    
    private String categoryName;
    
    @PositiveOrZero
    private BigDecimal workHours;
    
    @PositiveOrZero
    private BigDecimal amountPaid;
    
    @PositiveOrZero
    private BigDecimal amountDue;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}