package com.vinodelnya.winery.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vinodelnya.winery.dto.CategoryDto;
import com.vinodelnya.winery.dto.PageResponse;
import com.vinodelnya.winery.service.CategoryService;
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
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@DisplayName("CategoryController E2E API Tests")
class CategoryControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @MockBean
    private CategoryService categoryService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("GET /categories - Should return paginated categories")
    @WithMockUser
    void testGetAllCategories() throws Exception {
        // Arrange
        CategoryDto category1 = createCategoryDto(1L, "Vineyard Expenses", "Equipment and maintenance", "#FF5733", true);
        CategoryDto category2 = createCategoryDto(2L, "Labor Costs", "Worker salaries and benefits", "#33FF57", true);
        List<CategoryDto> categories = Arrays.asList(category1, category2);

        PageResponse<CategoryDto> pageResponse = new PageResponse<>();
        pageResponse.setContent(categories);
        pageResponse.setTotalElements(2L);
        pageResponse.setTotalPages(1);

        when(categoryService.findAll(any(), any(), any(Pageable.class))).thenReturn(pageResponse);

        // Act & Assert
        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].name").value("Vineyard Expenses"))
                .andExpect(jsonPath("$.content[0].color").value("#FF5733"))
                .andExpect(jsonPath("$.content[1].name").value("Labor Costs"));
    }

    @Test
    @DisplayName("GET /categories - Should filter by name")
    @WithMockUser
    void testGetCategoriesFilteredByName() throws Exception {
        // Arrange
        CategoryDto category = createCategoryDto(1L, "Vineyard Expenses", "Equipment", "#FF5733", true);
        
        PageResponse<CategoryDto> pageResponse = new PageResponse<>();
        pageResponse.setContent(Arrays.asList(category));

        when(categoryService.findAll(eq("Vineyard"), any(), any(Pageable.class))).thenReturn(pageResponse);

        // Act & Assert
        mockMvc.perform(get("/categories")
                .param("name", "Vineyard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Vineyard Expenses"));
    }

    @Test
    @DisplayName("GET /categories/{id} - Should return category by ID")
    @WithMockUser
    void testGetCategoryById() throws Exception {
        // Arrange
        CategoryDto category = createCategoryDto(1L, "Vineyard Expenses", "Equipment", "#FF5733", true);
        when(categoryService.findById(1L)).thenReturn(category);

        // Act & Assert
        mockMvc.perform(get("/categories/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Vineyard Expenses"))
                .andExpect(jsonPath("$.description").value("Equipment"))
                .andExpect(jsonPath("$.color").value("#FF5733"));
    }

    @Test
    @DisplayName("POST /categories - Should create category (Admin only)")
    @WithMockUser(roles = "ADMIN")
    void testCreateCategory() throws Exception {
        // Arrange
        CategoryDto newCategory = createCategoryDto(null, "New Category", "Description", "#FF0000", true);
        CategoryDto createdCategory = createCategoryDto(3L, "New Category", "Description", "#FF0000", true);

        when(categoryService.create(any(CategoryDto.class))).thenReturn(createdCategory);

        // Act & Assert
        mockMvc.perform(post("/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newCategory)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.name").value("New Category"))
                .andExpect(jsonPath("$.color").value("#FF0000"));
    }

    @Test
    @DisplayName("POST /categories - Should reject non-admin users")
    @WithMockUser(roles = "USER")
    void testCreateCategoryUnauthorized() throws Exception {
        // Arrange
        CategoryDto newCategory = createCategoryDto(null, "New Category", "Description", "#FF0000", true);

        // Act & Assert
        mockMvc.perform(post("/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newCategory)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /categories - Should validate required fields")
    @WithMockUser(roles = "ADMIN")
    void testCreateCategoryValidation() throws Exception {
        // Arrange - Category with empty name
        CategoryDto invalidCategory = createCategoryDto(null, "", "Description", "#FF0000", true);

        // Act & Assert
        mockMvc.perform(post("/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidCategory)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /categories - Should validate color format")
    @WithMockUser(roles = "ADMIN")
    void testCreateCategoryInvalidColor() throws Exception {
        // Arrange - Category with invalid color format
        CategoryDto invalidCategory = createCategoryDto(null, "Test", "Description", "invalid-color", true);

        // Act & Assert
        mockMvc.perform(post("/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidCategory)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /categories/{id} - Should update category (Admin only)")
    @WithMockUser(roles = "ADMIN")
    void testUpdateCategory() throws Exception {
        // Arrange
        CategoryDto updatedCategory = createCategoryDto(1L, "Updated Category", "Updated Description", "#00FF00", false);
        when(categoryService.update(eq(1L), any(CategoryDto.class))).thenReturn(updatedCategory);

        // Act & Assert
        mockMvc.perform(put("/categories/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedCategory)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Category"))
                .andExpect(jsonPath("$.description").value("Updated Description"))
                .andExpect(jsonPath("$.color").value("#00FF00"))
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    @DisplayName("PUT /categories/{id} - Should reject non-admin users")
    @WithMockUser(roles = "USER")
    void testUpdateCategoryUnauthorized() throws Exception {
        // Arrange
        CategoryDto updatedCategory = createCategoryDto(1L, "Updated", "Description", "#00FF00", false);

        // Act & Assert
        mockMvc.perform(put("/categories/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedCategory)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DELETE /categories/{id} - Should delete category (Admin only)")
    @WithMockUser(roles = "ADMIN")
    void testDeleteCategory() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/categories/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /categories/{id} - Should reject non-admin users")
    @WithMockUser(roles = "USER")
    void testDeleteCategoryUnauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/categories/1"))
                .andExpect(status().isForbidden());
    }

    private CategoryDto createCategoryDto(Long id, String name, String description, String color, boolean active) {
        CategoryDto category = new CategoryDto();
        category.setId(id);
        category.setName(name);
        category.setDescription(description);
        category.setColor(color);
        category.setActive(active);
        category.setCreatedAt(LocalDateTime.now());
        return category;
    }
}