package com.vinodelnya.winery.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vinodelnya.winery.dto.EntryDto;
import com.vinodelnya.winery.dto.PageResponse;
import com.vinodelnya.winery.service.EntryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class EntryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EntryService entryService;

    private PageResponse<EntryDto> mockPageResponse;

    @BeforeEach
    void setUp() {
        mockPageResponse = new PageResponse<>(
            Collections.emptyList(),
            0L,
            0,
            0,
            15,
            true,
            true
        );
        
        Map<String, BigDecimal> totals = Map.of(
            "amountPaid", BigDecimal.ZERO,
            "amountDue", BigDecimal.ZERO,
            "total", BigDecimal.ZERO,
            "workHours", BigDecimal.ZERO
        );
        
        mockPageResponse.setPageTotal(totals);
        mockPageResponse.setGrandTotal(totals);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetEntriesWithDateFilters() throws Exception {
        LocalDate dateFrom = LocalDate.of(2025, 7, 31);
        LocalDate dateTo = LocalDate.of(2025, 8, 30);
        
        when(entryService.findAll(
            eq(dateFrom),
            eq(dateTo),
            isNull(),
            isNull(),
            isNull(),
            any(PageRequest.class)
        )).thenReturn(mockPageResponse);

        mockMvc.perform(get("/entries")
                .param("page", "0")
                .param("size", "15")
                .param("sort", "date,desc")
                .param("dateFrom", "2025-07-31")
                .param("dateTo", "2025-08-30")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalElements").value(0))
            .andExpect(jsonPath("$.size").value(15));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testGetEntriesWithAllFilters() throws Exception {
        LocalDate dateFrom = LocalDate.of(2025, 7, 1);
        LocalDate dateTo = LocalDate.of(2025, 8, 31);
        Long personId = 1L;
        Long categoryId = 2L;
        
        when(entryService.findAll(
            eq(dateFrom),
            eq(dateTo),
            eq(personId),
            eq(categoryId),
            isNull(),
            any(PageRequest.class)
        )).thenReturn(mockPageResponse);

        mockMvc.perform(get("/entries")
                .param("page", "0")
                .param("size", "15")
                .param("sort", "date,desc")
                .param("dateFrom", "2025-07-01")
                .param("dateTo", "2025-08-31")
                .param("personId", "1")
                .param("categoryId", "2")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalElements").value(0))
            .andExpect(jsonPath("$.currentPage").value(0));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetEntriesWithoutFilters() throws Exception {
        when(entryService.findAll(
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            any(PageRequest.class)
        )).thenReturn(mockPageResponse);

        mockMvc.perform(get("/entries")
                .param("page", "0")
                .param("size", "15")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalElements").value(0))
            .andExpect(jsonPath("$.first").value(true))
            .andExpect(jsonPath("$.last").value(true));
    }

    @Test
    void testGetEntriesUnauthorized() throws Exception {
        mockMvc.perform(get("/entries")
                .param("page", "0")
                .param("size", "15")
                .param("dateFrom", "2025-07-31")
                .param("dateTo", "2025-08-30")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isForbidden());
    }

}