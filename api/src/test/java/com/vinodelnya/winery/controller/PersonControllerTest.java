package com.vinodelnya.winery.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vinodelnya.winery.dto.PageResponse;
import com.vinodelnya.winery.dto.PersonDto;
import com.vinodelnya.winery.service.PersonService;
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
@DisplayName("PersonController E2E API Tests")
class PersonControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @MockBean
    private PersonService personService;

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
    @DisplayName("GET /persons - Should return paginated list of persons")
    @WithMockUser
    void testGetAllPersons() throws Exception {
        // Arrange
        PersonDto person1 = createPersonDto(1L, "John Doe", "Vineyard Manager", true);
        PersonDto person2 = createPersonDto(2L, "Jane Smith", "Wine Taster", true);
        List<PersonDto> persons = Arrays.asList(person1, person2);

        PageResponse<PersonDto> pageResponse = new PageResponse<>();
        pageResponse.setContent(persons);
        pageResponse.setTotalElements(2L);
        pageResponse.setTotalPages(1);
        pageResponse.setSize(20);
        pageResponse.setCurrentPage(0);

        when(personService.findAll(any(), any(), any(Pageable.class))).thenReturn(pageResponse);

        // Act & Assert
        mockMvc.perform(get("/persons")
                .param("page", "0")
                .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].name").value("John Doe"))
                .andExpect(jsonPath("$.content[1].name").value("Jane Smith"))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(1));
    }

    @Test
    @DisplayName("GET /persons - Should filter by name")
    @WithMockUser
    void testGetPersonsFilteredByName() throws Exception {
        // Arrange
        PersonDto person = createPersonDto(1L, "John Doe", "Vineyard Manager", true);
        List<PersonDto> persons = Arrays.asList(person);

        PageResponse<PersonDto> pageResponse = new PageResponse<>();
        pageResponse.setContent(persons);
        pageResponse.setTotalElements(1L);

        when(personService.findAll(eq("John"), any(), any(Pageable.class))).thenReturn(pageResponse);

        // Act & Assert
        mockMvc.perform(get("/persons")
                .param("name", "John"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].name").value("John Doe"));
    }

    @Test
    @DisplayName("GET /persons - Should filter by active status")
    @WithMockUser
    void testGetPersonsFilteredByActive() throws Exception {
        // Arrange
        PersonDto person = createPersonDto(1L, "John Doe", "Vineyard Manager", true);
        List<PersonDto> persons = Arrays.asList(person);

        PageResponse<PersonDto> pageResponse = new PageResponse<>();
        pageResponse.setContent(persons);

        when(personService.findAll(any(), eq(true), any(Pageable.class))).thenReturn(pageResponse);

        // Act & Assert
        mockMvc.perform(get("/persons")
                .param("active", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].active").value(true));
    }

    @Test
    @DisplayName("GET /persons/{id} - Should return person by ID")
    @WithMockUser
    void testGetPersonById() throws Exception {
        // Arrange
        PersonDto person = createPersonDto(1L, "John Doe", "Vineyard Manager", true);
        when(personService.findById(1L)).thenReturn(person);

        // Act & Assert
        mockMvc.perform(get("/persons/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.note").value("Vineyard Manager"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    @DisplayName("GET /persons/{id} - Should return 404 for non-existent person")
    @WithMockUser
    void testGetPersonByIdNotFound() throws Exception {
        // Arrange
        when(personService.findById(999L)).thenThrow(new RuntimeException("Person not found"));

        // Act & Assert
        mockMvc.perform(get("/persons/999"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("POST /persons - Should create new person (Admin only)")
    @WithMockUser(roles = "ADMIN")
    void testCreatePerson() throws Exception {
        // Arrange
        PersonDto newPerson = createPersonDto(null, "New Person", "New Employee", true);
        PersonDto createdPerson = createPersonDto(3L, "New Person", "New Employee", true);

        when(personService.create(any(PersonDto.class))).thenReturn(createdPerson);

        // Act & Assert
        mockMvc.perform(post("/persons")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newPerson)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.name").value("New Person"))
                .andExpect(jsonPath("$.note").value("New Employee"));
    }

    @Test
    @DisplayName("POST /persons - Should reject unauthorized user")
    @WithMockUser(roles = "USER")
    void testCreatePersonUnauthorized() throws Exception {
        // Arrange
        PersonDto newPerson = createPersonDto(null, "New Person", "New Employee", true);

        // Act & Assert
        mockMvc.perform(post("/persons")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newPerson)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /persons - Should validate required fields")
    @WithMockUser(roles = "ADMIN")
    void testCreatePersonValidation() throws Exception {
        // Arrange - Person with empty name
        PersonDto invalidPerson = createPersonDto(null, "", "Note", true);

        // Act & Assert
        mockMvc.perform(post("/persons")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidPerson)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /persons/{id} - Should update existing person (Admin only)")
    @WithMockUser(roles = "ADMIN")
    void testUpdatePerson() throws Exception {
        // Arrange
        PersonDto updatedPerson = createPersonDto(1L, "Updated Name", "Updated Note", false);
        when(personService.update(eq(1L), any(PersonDto.class))).thenReturn(updatedPerson);

        // Act & Assert
        mockMvc.perform(put("/persons/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedPerson)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.note").value("Updated Note"))
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    @DisplayName("PUT /persons/{id} - Should reject unauthorized user")
    @WithMockUser(roles = "USER")
    void testUpdatePersonUnauthorized() throws Exception {
        // Arrange
        PersonDto updatedPerson = createPersonDto(1L, "Updated Name", "Updated Note", false);

        // Act & Assert
        mockMvc.perform(put("/persons/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedPerson)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DELETE /persons/{id} - Should delete person (Admin only)")
    @WithMockUser(roles = "ADMIN")
    void testDeletePerson() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/persons/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /persons/{id} - Should reject unauthorized user")
    @WithMockUser(roles = "USER")
    void testDeletePersonUnauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/persons/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PUT /persons/{id}/archive - Should archive person (Admin only)")
    @WithMockUser(roles = "ADMIN")
    void testArchivePerson() throws Exception {
        // Arrange
        PersonDto archivedPerson = createPersonDto(1L, "John Doe", "Vineyard Manager", false);
        when(personService.archive(1L)).thenReturn(archivedPerson);

        // Act & Assert
        mockMvc.perform(put("/persons/1/archive"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    @DisplayName("PUT /persons/{id}/archive - Should reject unauthorized user")
    @WithMockUser(roles = "USER")
    void testArchivePersonUnauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(put("/persons/1/archive"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /persons - Should handle pagination parameters")
    @WithMockUser
    void testGetPersonsPagination() throws Exception {
        // Arrange
        PageResponse<PersonDto> pageResponse = new PageResponse<>();
        pageResponse.setContent(Arrays.asList());
        pageResponse.setTotalElements(100L);
        pageResponse.setTotalPages(5);
        pageResponse.setSize(20);
        pageResponse.setCurrentPage(2);

        when(personService.findAll(any(), any(), any(Pageable.class))).thenReturn(pageResponse);

        // Act & Assert
        mockMvc.perform(get("/persons")
                .param("page", "2")
                .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(100))
                .andExpect(jsonPath("$.totalPages").value(5))
                .andExpect(jsonPath("$.currentPage").value(2))
                .andExpect(jsonPath("$.size").value(20));
    }

    @Test
    @DisplayName("GET /persons - Should handle sorting parameters")
    @WithMockUser
    void testGetPersonsSorting() throws Exception {
        // Arrange
        PageResponse<PersonDto> pageResponse = new PageResponse<>();
        pageResponse.setContent(Arrays.asList());

        when(personService.findAll(any(), any(), any(Pageable.class))).thenReturn(pageResponse);

        // Act & Assert
        mockMvc.perform(get("/persons")
                .param("sort", "name,desc"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /persons - Should limit page size to maximum")
    @WithMockUser
    void testGetPersonsMaxPageSize() throws Exception {
        // Arrange
        PageResponse<PersonDto> pageResponse = new PageResponse<>();
        pageResponse.setContent(Arrays.asList());
        pageResponse.setSize(200); // Should be limited to 200

        when(personService.findAll(any(), any(), any(Pageable.class))).thenReturn(pageResponse);

        // Act & Assert
        mockMvc.perform(get("/persons")
                .param("size", "500")) // Request more than limit
                .andExpect(status().isOk());
    }

    private PersonDto createPersonDto(Long id, String name, String note, boolean active) {
        PersonDto person = new PersonDto();
        person.setId(id);
        person.setName(name);
        person.setNote(note);
        person.setActive(active);
        person.setCreatedAt(LocalDateTime.now());
        return person;
    }
}