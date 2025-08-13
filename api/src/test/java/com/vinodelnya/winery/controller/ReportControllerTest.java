package com.vinodelnya.winery.controller;

import com.vinodelnya.winery.dto.ReportSummaryDto;
import com.vinodelnya.winery.service.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReportService reportService;

    private ReportSummaryDto mockSummary;

    @BeforeEach
    void setUp() {
        mockSummary = new ReportSummaryDto();
        mockSummary.setFromDate(LocalDate.of(2025, 7, 1));
        mockSummary.setToDate(LocalDate.of(2025, 8, 31));
        mockSummary.setTotalAmountPaid(BigDecimal.valueOf(1000));
        mockSummary.setTotalAmountDue(BigDecimal.valueOf(500));
        mockSummary.setGrandTotal(BigDecimal.valueOf(1500));
        mockSummary.setTotalWorkHours(BigDecimal.valueOf(40));
        mockSummary.setTotalEntries(10L);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetSummaryWithDateFilters() throws Exception {
        LocalDate fromDate = LocalDate.of(2025, 7, 1);
        LocalDate toDate = LocalDate.of(2025, 8, 31);
        
        when(reportService.generateSummary(
            eq(fromDate),
            eq(toDate),
            isNull(),
            isNull()
        )).thenReturn(mockSummary);

        mockMvc.perform(get("/reports/summary")
                .param("fromDate", "2025-07-01")
                .param("toDate", "2025-08-31")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.fromDate").value("2025-07-01"))
            .andExpect(jsonPath("$.toDate").value("2025-08-31"))
            .andExpect(jsonPath("$.totalAmountPaid").value(1000))
            .andExpect(jsonPath("$.totalAmountDue").value(500))
            .andExpect(jsonPath("$.grandTotal").value(1500))
            .andExpect(jsonPath("$.totalWorkHours").value(40))
            .andExpect(jsonPath("$.totalEntries").value(10));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testGetSummaryWithAllFilters() throws Exception {
        LocalDate fromDate = LocalDate.of(2025, 7, 1);
        LocalDate toDate = LocalDate.of(2025, 8, 31);
        Long personId = 1L;
        Long categoryId = 2L;
        
        when(reportService.generateSummary(
            eq(fromDate),
            eq(toDate),
            eq(personId),
            eq(categoryId)
        )).thenReturn(mockSummary);

        mockMvc.perform(get("/reports/summary")
                .param("fromDate", "2025-07-01")
                .param("toDate", "2025-08-31")
                .param("personId", "1")
                .param("categoryId", "2")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalEntries").value(10));
    }

    @Test
    void testGetSummaryUnauthorized() throws Exception {
        mockMvc.perform(get("/reports/summary")
                .param("fromDate", "2025-07-01")
                .param("toDate", "2025-08-31")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isForbidden());
    }


    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetSummaryDateRangeValidation() throws Exception {
        LocalDate fromDate = LocalDate.of(2025, 8, 31);
        LocalDate toDate = LocalDate.of(2025, 7, 1);
        
        ReportSummaryDto emptySummary = new ReportSummaryDto();
        emptySummary.setFromDate(fromDate);
        emptySummary.setToDate(toDate);
        emptySummary.setTotalAmountPaid(BigDecimal.ZERO);
        emptySummary.setTotalAmountDue(BigDecimal.ZERO);
        emptySummary.setGrandTotal(BigDecimal.ZERO);
        emptySummary.setTotalWorkHours(BigDecimal.ZERO);
        emptySummary.setTotalEntries(0L);
        
        when(reportService.generateSummary(
            eq(fromDate),
            eq(toDate),
            isNull(),
            isNull()
        )).thenReturn(emptySummary);

        mockMvc.perform(get("/reports/summary")
                .param("fromDate", "2025-08-31")
                .param("toDate", "2025-07-01")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalEntries").value(0));
    }
}