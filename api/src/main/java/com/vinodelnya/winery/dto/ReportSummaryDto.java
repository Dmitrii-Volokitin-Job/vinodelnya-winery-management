package com.vinodelnya.winery.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ReportSummaryDto {
    private LocalDate fromDate;
    private LocalDate toDate;
    private BigDecimal totalAmountPaid;
    private BigDecimal totalAmountDue;
    private BigDecimal grandTotal;
    private BigDecimal totalWorkHours;
    private long totalEntries;
}