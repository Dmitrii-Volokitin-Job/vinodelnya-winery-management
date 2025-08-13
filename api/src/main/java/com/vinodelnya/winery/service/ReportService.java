package com.vinodelnya.winery.service;

import com.vinodelnya.winery.dto.ReportSummaryDto;
import com.vinodelnya.winery.repository.EntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final EntryRepository entryRepository;

    public ReportSummaryDto generateSummary(LocalDate fromDate, LocalDate toDate, 
                                           Long personId, Long categoryId) {
        Map<String, BigDecimal> totals = entryRepository.calculateTotals(fromDate, toDate, personId, categoryId);
        
        ReportSummaryDto summary = new ReportSummaryDto();
        summary.setFromDate(fromDate);
        summary.setToDate(toDate);
        // Handle both lowercase (from native query) and camelCase keys
        summary.setTotalAmountPaid(totals.getOrDefault("amountpaid", totals.getOrDefault("amountPaid", BigDecimal.ZERO)));
        summary.setTotalAmountDue(totals.getOrDefault("amountdue", totals.getOrDefault("amountDue", BigDecimal.ZERO)));
        summary.setGrandTotal(totals.getOrDefault("total", BigDecimal.ZERO));
        summary.setTotalWorkHours(totals.getOrDefault("workhours", totals.getOrDefault("workHours", BigDecimal.ZERO)));
        
        // Count entries
        long count = entryRepository.findWithFilters(fromDate, toDate, personId, categoryId,
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
        summary.setTotalEntries(count);
        
        return summary;
    }
}