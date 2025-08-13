package com.vinodelnya.winery.controller;

import com.vinodelnya.winery.dto.ReportSummaryDto;
import com.vinodelnya.winery.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ReportSummaryDto> getSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long personId,
            @RequestParam(required = false) Long categoryId) {
        
        ReportSummaryDto summary = reportService.generateSummary(fromDate, toDate, personId, categoryId);
        return ResponseEntity.ok(summary);
    }
}