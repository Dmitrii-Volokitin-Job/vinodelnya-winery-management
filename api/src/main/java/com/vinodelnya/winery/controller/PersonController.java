package com.vinodelnya.winery.controller;

import com.vinodelnya.winery.dto.PageResponse;
import com.vinodelnya.winery.dto.PersonDto;
import com.vinodelnya.winery.service.PersonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/persons")
@RequiredArgsConstructor
public class PersonController {

    private final PersonService personService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<PageResponse<PersonDto>> getAllPersons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "id,asc") String[] sort,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean active) {
        
        Pageable pageable = createPageable(page, size, sort);
        PageResponse<PersonDto> response = personService.findAll(name, active, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<PersonDto> getPersonById(@PathVariable Long id) {
        PersonDto person = personService.findById(id);
        return ResponseEntity.ok(person);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PersonDto> createPerson(@Valid @RequestBody PersonDto personDto) {
        PersonDto created = personService.create(personDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PersonDto> updatePerson(@PathVariable Long id, @Valid @RequestBody PersonDto personDto) {
        PersonDto updated = personService.update(id, personDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePerson(@PathVariable Long id) {
        personService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/archive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PersonDto> archivePerson(@PathVariable Long id) {
        PersonDto archived = personService.archive(id);
        return ResponseEntity.ok(archived);
    }

    private Pageable createPageable(int page, int size, String[] sort) {
        if (sort.length >= 2) {
            Sort.Direction direction = Sort.Direction.fromString(sort[1]);
            return PageRequest.of(page, size, Sort.by(direction, sort[0]));
        }
        return PageRequest.of(page, size);
    }
}