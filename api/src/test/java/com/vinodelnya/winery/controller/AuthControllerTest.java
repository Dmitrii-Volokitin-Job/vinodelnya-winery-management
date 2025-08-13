package com.vinodelnya.winery.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vinodelnya.winery.dto.AuthResponse;
import com.vinodelnya.winery.dto.LoginRequest;
import com.vinodelnya.winery.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@DisplayName("AuthController E2E API Tests")
class AuthControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @MockBean
    private AuthService authService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("POST /auth/login - Should authenticate valid admin user")
    void testLoginAdmin() throws Exception {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("admin");

        AuthResponse response = new AuthResponse();
        response.setAccessToken("mock-jwt-token");
        response.setRefreshToken("mock-refresh-token");
        response.setUsername("admin");
        response.setRole("ADMIN");

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("mock-jwt-token"))
                .andExpect(jsonPath("$.refreshToken").value("mock-refresh-token"))
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    @DisplayName("POST /auth/login - Should authenticate valid regular user")
    void testLoginUser() throws Exception {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("user");
        request.setPassword("user");

        AuthResponse response = new AuthResponse();
        response.setAccessToken("mock-jwt-token-user");
        response.setRefreshToken("mock-refresh-token-user");
        response.setUsername("user");
        response.setRole("USER");

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("mock-jwt-token-user"))
                .andExpect(jsonPath("$.refreshToken").value("mock-refresh-token-user"))
                .andExpect(jsonPath("$.username").value("user"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    @DisplayName("POST /auth/login - Should reject invalid credentials")
    void testLoginInvalidCredentials() throws Exception {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("invalid");
        request.setPassword("invalid");

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new RuntimeException("Invalid credentials"));

        // Act & Assert
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /auth/login - Should reject empty username")
    void testLoginEmptyUsername() throws Exception {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("");
        request.setPassword("admin");

        // Act & Assert
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /auth/login - Should reject empty password")
    void testLoginEmptyPassword() throws Exception {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("");

        // Act & Assert
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /auth/login - Should reject null request body")
    void testLoginNullRequest() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /auth/refresh - Should refresh valid token")
    void testRefreshToken() throws Exception {
        // Arrange
        String refreshToken = "valid-refresh-token";
        
        AuthResponse response = new AuthResponse();
        response.setAccessToken("new-jwt-token");
        response.setRefreshToken("new-refresh-token");
        response.setUsername("admin");
        response.setRole("ADMIN");

        when(authService.refresh(refreshToken)).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content("\"" + refreshToken + "\""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-jwt-token"))
                .andExpect(jsonPath("$.refreshToken").value("new-refresh-token"))
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    @DisplayName("POST /auth/refresh - Should reject invalid refresh token")
    void testRefreshInvalidToken() throws Exception {
        // Arrange
        String refreshToken = "invalid-refresh-token";

        when(authService.refresh(refreshToken))
                .thenThrow(new RuntimeException("Invalid refresh token"));

        // Act & Assert
        mockMvc.perform(post("/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content("\"" + refreshToken + "\""))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /auth/refresh - Should reject empty refresh token")
    void testRefreshEmptyToken() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content("\"\""))
                .andExpect(status().isBadRequest());
    }
}