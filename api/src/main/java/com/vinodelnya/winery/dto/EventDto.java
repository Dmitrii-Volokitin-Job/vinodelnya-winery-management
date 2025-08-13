package com.vinodelnya.winery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class EventDto {
    private Long id;
    
    private LocalDateTime createdTimestamp;
    
    @NotNull
    private LocalDate visitDate;
    
    @NotNull
    private LocalTime visitTime;
    
    @PositiveOrZero
    private Integer adultLunchGuests = 0;
    
    @PositiveOrZero
    private Integer adultTastingGuests = 0;
    
    @PositiveOrZero
    private Integer childrenGuests = 0;
    
    @PositiveOrZero
    private Integer extraGuests = 0;
    
    private String hotDishVegetarian;
    
    private String hotDishMeat;
    
    private Boolean masterclass = false;
    
    private String mealExtraInfo;
    
    private String company;
    
    @NotBlank
    private String contactName;
    
    private String contactPhone;
    
    private Boolean specialPriceEnabled = false;
    
    @PositiveOrZero
    private BigDecimal specialLunchPrice;
    
    @PositiveOrZero
    private Integer lunchGroupSize = 0;
    
    @PositiveOrZero
    private BigDecimal lunchRate = BigDecimal.ZERO;
    
    @PositiveOrZero
    private BigDecimal lunchTotal = BigDecimal.ZERO;
    
    @PositiveOrZero
    private BigDecimal specialTastingPrice;
    
    @PositiveOrZero
    private Integer tastingGroupSize = 0;
    
    @PositiveOrZero
    private BigDecimal tastingRate = BigDecimal.ZERO;
    
    @PositiveOrZero
    private BigDecimal tastingTotal = BigDecimal.ZERO;
    
    @PositiveOrZero
    private BigDecimal lunchAndTastingTotal = BigDecimal.ZERO;
    
    @PositiveOrZero
    private Integer addedWinesCount = 0;
    
    @PositiveOrZero
    private BigDecimal addedWinesValue = BigDecimal.ZERO;
    
    private String extraChargeComment;
    
    @PositiveOrZero
    private BigDecimal extraChargeAmount = BigDecimal.ZERO;
    
    @PositiveOrZero
    private BigDecimal grandTotal = BigDecimal.ZERO;
    
    private Boolean invoiceIssued = false;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}