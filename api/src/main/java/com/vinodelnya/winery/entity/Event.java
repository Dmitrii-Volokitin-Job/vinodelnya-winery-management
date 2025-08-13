package com.vinodelnya.winery.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "events")
@Getter
@Setter
public class Event extends BaseEntity {

    @Column(name = "created_timestamp")
    private LocalDateTime createdTimestamp;

    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    @Column(name = "visit_time", nullable = false)
    private LocalTime visitTime;

    @Column(name = "adult_lunch_guests")
    private Integer adultLunchGuests = 0;

    @Column(name = "adult_tasting_guests")
    private Integer adultTastingGuests = 0;

    @Column(name = "children_guests")
    private Integer childrenGuests = 0;

    @Column(name = "extra_guests")
    private Integer extraGuests = 0;

    @Column(name = "hot_dish_vegetarian")
    private String hotDishVegetarian;

    @Column(name = "hot_dish_meat")
    private String hotDishMeat;

    @Column(name = "masterclass")
    private Boolean masterclass = false;

    @Column(name = "meal_extra_info", columnDefinition = "TEXT")
    private String mealExtraInfo;

    @Column(name = "company")
    private String company;

    @Column(name = "contact_name", nullable = false)
    private String contactName;

    @Column(name = "contact_phone", length = 50)
    private String contactPhone;

    @Column(name = "special_price_enabled")
    private Boolean specialPriceEnabled = false;

    @Column(name = "special_lunch_price", precision = 10, scale = 2)
    private BigDecimal specialLunchPrice;

    @Column(name = "lunch_group_size")
    private Integer lunchGroupSize = 0;

    @Column(name = "lunch_rate", precision = 10, scale = 2)
    private BigDecimal lunchRate = BigDecimal.ZERO;

    @Column(name = "lunch_total", precision = 10, scale = 2)
    private BigDecimal lunchTotal = BigDecimal.ZERO;

    @Column(name = "special_tasting_price", precision = 10, scale = 2)
    private BigDecimal specialTastingPrice;

    @Column(name = "tasting_group_size")
    private Integer tastingGroupSize = 0;

    @Column(name = "tasting_rate", precision = 10, scale = 2)
    private BigDecimal tastingRate = BigDecimal.ZERO;

    @Column(name = "tasting_total", precision = 10, scale = 2)
    private BigDecimal tastingTotal = BigDecimal.ZERO;

    @Column(name = "lunch_and_tasting_total", precision = 10, scale = 2)
    private BigDecimal lunchAndTastingTotal = BigDecimal.ZERO;

    @Column(name = "added_wines_count")
    private Integer addedWinesCount = 0;

    @Column(name = "added_wines_value", precision = 10, scale = 2)
    private BigDecimal addedWinesValue = BigDecimal.ZERO;

    @Column(name = "extra_charge_comment", columnDefinition = "TEXT")
    private String extraChargeComment;

    @Column(name = "extra_charge_amount", precision = 10, scale = 2)
    private BigDecimal extraChargeAmount = BigDecimal.ZERO;

    @Column(name = "grand_total", precision = 10, scale = 2)
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Column(name = "invoice_issued")
    private Boolean invoiceIssued = false;

    @PrePersist
    public void prePersist() {
        if (createdTimestamp == null) {
            createdTimestamp = LocalDateTime.now();
        }
        calculateTotals();
    }

    @PreUpdate
    public void preUpdate() {
        calculateTotals();
    }

    private void calculateTotals() {
        this.lunchAndTastingTotal = (lunchTotal != null ? lunchTotal : BigDecimal.ZERO)
                .add(tastingTotal != null ? tastingTotal : BigDecimal.ZERO);
        
        this.grandTotal = lunchAndTastingTotal
                .add(addedWinesValue != null ? addedWinesValue : BigDecimal.ZERO)
                .add(extraChargeAmount != null ? extraChargeAmount : BigDecimal.ZERO);
    }
}