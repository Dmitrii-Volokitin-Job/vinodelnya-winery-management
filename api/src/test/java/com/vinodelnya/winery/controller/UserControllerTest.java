package com.vinodelnya.winery.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vinodelnya.winery.dto.PageResponse;
import com.vinodelnya.winery.dto.UserDto;
import com.vinodelnya.winery.entity.User;
import com.vinodelnya.winery.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@DisplayName("UserController E2E API Tests - Admin Only Features")
class UserControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @MockBean
    private UserService userService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
        objectMapper = new ObjectMapper();
    }

    // ===== GET /users - Admin Only =====

    @Test
    @DisplayName("GET /users - Should return paginated users list for admin")
    @WithMockUser(roles = "ADMIN")
    void testGetAllUsersAsAdmin() throws Exception {
        // Arrange
        UserDto user1 = createUserDto(1L, "admin", "ADMIN", true);
        UserDto user2 = createUserDto(2L, "user", "USER", true);
        List<UserDto> users = Arrays.asList(user1, user2);

        PageResponse<UserDto> pageResponse = new PageResponse<>();
        pageResponse.setContent(users);
        pageResponse.setTotalElements(2L);
        pageResponse.setTotalPages(1);
        pageResponse.setSize(20);
        pageResponse.setCurrentPage(0);

        when(userService.findAll(any(Pageable.class))).thenReturn(pageResponse);

        // Act & Assert
        mockMvc.perform(get("/users")
                .param("page", "0")
                .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].username").value("admin"))
                .andExpect(jsonPath("$.content[0].role").value("ADMIN"))
                .andExpect(jsonPath("$.content[1].username").value("user"))
                .andExpect(jsonPath("$.content[1].role").value("USER"));
    }

    @Test
    @DisplayName("GET /users - Should reject regular user")
    @WithMockUser(roles = "USER")
    void testGetAllUsersAsUserForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /users - Should reject unauthenticated request")
    void testGetAllUsersUnauthenticated() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/users"))
                .andExpect(status().isUnauthorized());
    }

    // ===== GET /users/{id} - Admin Only =====

    @Test
    @DisplayName("GET /users/{id} - Should return user by ID for admin")
    @WithMockUser(roles = "ADMIN")
    void testGetUserByIdAsAdmin() throws Exception {
        // Arrange
        UserDto user = createUserDto(1L, "testuser", "USER", true);
        when(userService.findById(1L)).thenReturn(user);

        // Act & Assert
        mockMvc.perform(get("/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    @DisplayName("GET /users/{id} - Should reject regular user")
    @WithMockUser(roles = "USER")
    void testGetUserByIdAsUserForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/users/1"))
                .andExpect(status().isForbidden());
    }

    // ===== POST /users - Admin Only =====

    @Test
    @DisplayName("POST /users - Should create new user as admin")
    @WithMockUser(roles = "ADMIN")
    void testCreateUserAsAdmin() throws Exception {
        // Arrange
        UserDto newUser = createUserDto(null, "newuser", "USER", true);
        UserDto createdUser = createUserDto(3L, "newuser", "USER", true);

        when(userService.create(any(UserDto.class))).thenReturn(createdUser);

        // Act & Assert
        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newUser)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.username").value("newuser"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    @DisplayName("POST /users - Should reject regular user")
    @WithMockUser(roles = "USER")
    void testCreateUserAsUserForbidden() throws Exception {
        // Arrange
        UserDto newUser = createUserDto(null, "newuser", "USER", true);

        // Act & Assert
        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newUser)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /users - Should validate required fields")
    @WithMockUser(roles = "ADMIN")
    void testCreateUserValidation() throws Exception {
        // Arrange - User with empty username
        UserDto invalidUser = createUserDto(null, "", "USER", true);

        // Act & Assert
        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidUser)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /users - Should create admin user")
    @WithMockUser(roles = "ADMIN")
    void testCreateAdminUser() throws Exception {
        // Arrange
        UserDto newAdmin = createUserDto(null, "newadmin", "ADMIN", true);
        UserDto createdAdmin = createUserDto(4L, "newadmin", "ADMIN", true);

        when(userService.create(any(UserDto.class))).thenReturn(createdAdmin);

        // Act & Assert
        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newAdmin)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    // ===== PUT /users/{id} - Admin Only =====

    @Test
    @DisplayName("PUT /users/{id} - Should update user as admin")
    @WithMockUser(roles = "ADMIN")
    void testUpdateUserAsAdmin() throws Exception {
        // Arrange
        UserDto updatedUser = createUserDto(1L, "updateduser", "USER", false);
        when(userService.update(eq(1L), any(UserDto.class))).thenReturn(updatedUser);

        // Act & Assert
        mockMvc.perform(put("/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("updateduser"))
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    @DisplayName("PUT /users/{id} - Should reject regular user")
    @WithMockUser(roles = "USER")
    void testUpdateUserAsUserForbidden() throws Exception {
        // Arrange
        UserDto updatedUser = createUserDto(1L, "updateduser", "USER", false);

        // Act & Assert
        mockMvc.perform(put("/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedUser)))
                .andExpect(status().isForbidden());
    }

    // ===== DELETE /users/{id} - Admin Only =====

    @Test
    @DisplayName("DELETE /users/{id} - Should delete user as admin")
    @WithMockUser(roles = "ADMIN")
    void testDeleteUserAsAdmin() throws Exception {
        // Arrange
        doNothing().when(userService).deleteById(1L);

        // Act & Assert
        mockMvc.perform(delete("/users/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /users/{id} - Should reject regular user")
    @WithMockUser(roles = "USER")
    void testDeleteUserAsUserForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/users/1"))
                .andExpect(status().isForbidden());
    }

    // ===== PATCH /users/{id}/activate - Admin Only =====

    @Test
    @DisplayName("PATCH /users/{id}/activate - Should activate user as admin")
    @WithMockUser(roles = "ADMIN")
    void testActivateUserAsAdmin() throws Exception {
        // Arrange
        UserDto activatedUser = createUserDto(1L, "testuser", "USER", true);
        when(userService.activateUser(1L)).thenReturn(activatedUser);

        // Act & Assert
        mockMvc.perform(patch("/users/1/activate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    @DisplayName("PATCH /users/{id}/activate - Should reject regular user")
    @WithMockUser(roles = "USER")
    void testActivateUserAsUserForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(patch("/users/1/activate"))
                .andExpect(status().isForbidden());
    }

    // ===== PATCH /users/{id}/deactivate - Admin Only =====

    @Test
    @DisplayName("PATCH /users/{id}/deactivate - Should deactivate user as admin")
    @WithMockUser(roles = "ADMIN")
    void testDeactivateUserAsAdmin() throws Exception {
        // Arrange
        UserDto deactivatedUser = createUserDto(1L, "testuser", "USER", false);
        when(userService.deactivateUser(1L)).thenReturn(deactivatedUser);

        // Act & Assert
        mockMvc.perform(patch("/users/1/deactivate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    @DisplayName("PATCH /users/{id}/deactivate - Should reject regular user")
    @WithMockUser(roles = "USER")
    void testDeactivateUserAsUserForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(patch("/users/1/deactivate"))
                .andExpect(status().isForbidden());
    }

    // ===== Edge Cases and Error Scenarios =====

    @Test
    @DisplayName("GET /users/{id} - Should handle non-existent user")
    @WithMockUser(roles = "ADMIN")
    void testGetNonExistentUser() throws Exception {
        // Arrange
        when(userService.findById(999L)).thenThrow(new RuntimeException("User not found"));

        // Act & Assert
        mockMvc.perform(get("/users/999"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("POST /users - Should handle duplicate username")
    @WithMockUser(roles = "ADMIN")
    void testCreateDuplicateUsername() throws Exception {
        // Arrange
        UserDto duplicateUser = createUserDto(null, "admin", "USER", true);
        when(userService.create(any(UserDto.class)))
                .thenThrow(new RuntimeException("Username already exists"));

        // Act & Assert
        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(duplicateUser)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("PUT /users/{id} - Should handle invalid role")
    @WithMockUser(roles = "ADMIN")
    void testUpdateUserInvalidRole() throws Exception {
        // Arrange
        UserDto invalidRoleUser = createUserDto(1L, "testuser", "INVALID_ROLE", true);

        // Act & Assert - Should fail validation
        mockMvc.perform(put("/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRoleUser)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /users - Should handle pagination parameters")
    @WithMockUser(roles = "ADMIN")
    void testGetUsersPagination() throws Exception {
        // Arrange
        PageResponse<UserDto> pageResponse = new PageResponse<>();
        pageResponse.setContent(Arrays.asList());
        pageResponse.setTotalElements(50L);
        pageResponse.setTotalPages(3);
        pageResponse.setSize(20);
        pageResponse.setCurrentPage(1);

        when(userService.findAll(any(Pageable.class))).thenReturn(pageResponse);

        // Act & Assert
        mockMvc.perform(get("/users")
                .param("page", "1")
                .param("size", "20")
                .param("sortBy", "username")
                .param("sortDir", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(50))
                .andExpect(jsonPath("$.totalPages").value(3))
                .andExpect(jsonPath("$.currentPage").value(1));
    }

    @Test
    @DisplayName("All User endpoints should require admin role")
    @WithMockUser(roles = "USER")
    void testAllEndpointsRequireAdminRole() throws Exception {
        UserDto testUser = createUserDto(null, "test", "USER", true);
        String userJson = objectMapper.writeValueAsString(testUser);

        // All endpoints should return 403 Forbidden for non-admin users
        mockMvc.perform(get("/users")).andExpect(status().isForbidden());
        mockMvc.perform(get("/users/1")).andExpect(status().isForbidden());
        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(userJson))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(userJson))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/users/1")).andExpect(status().isForbidden());
        mockMvc.perform(patch("/users/1/activate")).andExpect(status().isForbidden());
        mockMvc.perform(patch("/users/1/deactivate")).andExpect(status().isForbidden());
    }

    private UserDto createUserDto(Long id, String username, String role, boolean active) {
        User.Role userRole = User.Role.valueOf(role);
        return new UserDto(id, username, userRole, active, LocalDateTime.now(), LocalDateTime.now());
    }
}