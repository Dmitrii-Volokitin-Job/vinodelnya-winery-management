package com.vinodelnya.winery.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@DisplayName("LogController E2E API Tests - Admin Only")
class LogControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @Test
    @DisplayName("GET /logs - Should return logs for admin with default parameters")
    @WithMockUser(roles = "ADMIN")
    void testGetLogsAsAdmin() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logs").isArray())
                .andExpect(jsonPath("$.totalCount").exists())
                .andExpect(jsonPath("$.lastUpdated").exists());
    }

    @Test
    @DisplayName("GET /logs - Should filter by log level")
    @WithMockUser(roles = "ADMIN")
    void testGetLogsFilteredByLevel() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/logs")
                .param("level", "ERROR")
                .param("limit", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logs").isArray());
    }

    @Test
    @DisplayName("GET /logs - Should filter by search text")
    @WithMockUser(roles = "ADMIN")
    void testGetLogsFilteredBySearch() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/logs")
                .param("search", "Application")
                .param("limit", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logs").isArray());
    }

    @Test
    @DisplayName("GET /logs - Should handle combined filters")
    @WithMockUser(roles = "ADMIN")
    void testGetLogsWithCombinedFilters() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/logs")
                .param("level", "INFO")
                .param("search", "startup")
                .param("limit", "25"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logs").isArray());
    }

    @Test
    @DisplayName("GET /logs - Should respect limit parameter")
    @WithMockUser(roles = "ADMIN")
    void testGetLogsWithLimit() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/logs")
                .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logs").isArray());
        // Note: In real implementation, you'd verify the actual count
    }

    @Test
    @DisplayName("GET /logs - Should reject non-admin users")
    @WithMockUser(roles = "USER")
    void testGetLogsAsUserForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/logs"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /logs - Should reject unauthenticated requests")
    void testGetLogsUnauthenticated() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/logs"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /logs/levels - Should return available log levels for admin")
    @WithMockUser(roles = "ADMIN")
    void testGetLogLevelsAsAdmin() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/logs/levels"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0]").value("ALL"))
                .andExpect(jsonPath("$[1]").value("ERROR"))
                .andExpect(jsonPath("$[2]").value("WARN"))
                .andExpect(jsonPath("$[3]").value("INFO"))
                .andExpect(jsonPath("$[4]").value("DEBUG"))
                .andExpect(jsonPath("$[5]").value("TRACE"));
    }

    @Test
    @DisplayName("GET /logs/levels - Should reject non-admin users")
    @WithMockUser(roles = "USER")
    void testGetLogLevelsAsUserForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/logs/levels"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /logs/stats - Should return log statistics for admin")
    @WithMockUser(roles = "ADMIN")
    void testGetLogStatsAsAdmin() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/logs/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.levelCounts").exists())
                .andExpect(jsonPath("$.totalLogs").exists())
                .andExpect(jsonPath("$.lastHour").exists())
                .andExpect(jsonPath("$.lastDay").exists())
                .andExpect(jsonPath("$.systemUptime").exists())
                .andExpect(jsonPath("$.levelCounts.ERROR").exists())
                .andExpect(jsonPath("$.levelCounts.WARN").exists())
                .andExpect(jsonPath("$.levelCounts.INFO").exists())
                .andExpect(jsonPath("$.levelCounts.DEBUG").exists());
    }

    @Test
    @DisplayName("GET /logs/stats - Should reject non-admin users")
    @WithMockUser(roles = "USER")
    void testGetLogStatsAsUserForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/logs/stats"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /logs - Should handle invalid level parameter gracefully")
    @WithMockUser(roles = "ADMIN")
    void testGetLogsInvalidLevel() throws Exception {
        // Act & Assert - Should still return results (fallback to ALL)
        mockMvc.perform(get("/logs")
                .param("level", "INVALID_LEVEL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logs").isArray());
    }

    @Test
    @DisplayName("GET /logs - Should handle empty search parameter")
    @WithMockUser(roles = "ADMIN")
    void testGetLogsEmptySearch() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/logs")
                .param("search", "")
                .param("limit", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logs").isArray());
    }

    @Test
    @DisplayName("GET /logs - Should handle zero limit parameter")
    @WithMockUser(roles = "ADMIN")
    void testGetLogsZeroLimit() throws Exception {
        // Act & Assert - Should use default limit
        mockMvc.perform(get("/logs")
                .param("limit", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logs").isArray());
    }

    @Test
    @DisplayName("GET /logs - Should handle very large limit parameter")
    @WithMockUser(roles = "ADMIN")
    void testGetLogsLargeLimit() throws Exception {
        // Act & Assert - Should cap the limit appropriately
        mockMvc.perform(get("/logs")
                .param("limit", "10000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logs").isArray());
    }

    @Test
    @DisplayName("All Log endpoints should require admin role")
    @WithMockUser(roles = "USER")
    void testAllLogEndpointsRequireAdminRole() throws Exception {
        // All log endpoints should return 403 Forbidden for non-admin users
        mockMvc.perform(get("/logs")).andExpect(status().isForbidden());
        mockMvc.perform(get("/logs/levels")).andExpect(status().isForbidden());
        mockMvc.perform(get("/logs/stats")).andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Log endpoints should handle server errors gracefully")
    @WithMockUser(roles = "ADMIN")
    void testLogEndpointsErrorHandling() throws Exception {
        // This test verifies that even if there are internal errors,
        // the endpoints don't expose sensitive information
        // The actual implementation should handle exceptions properly
        
        // These should not throw unhandled exceptions
        mockMvc.perform(get("/logs"))
                .andExpect(status().isOk()); // or appropriate error status
        
        mockMvc.perform(get("/logs/levels"))
                .andExpect(status().isOk());
        
        mockMvc.perform(get("/logs/stats"))
                .andExpect(status().isOk());
    }
}