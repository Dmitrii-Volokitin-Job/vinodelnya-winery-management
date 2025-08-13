package com.vinodelnya.winery.controller;

import com.vinodelnya.winery.dto.EntryDto;
import com.vinodelnya.winery.dto.PageResponse;
import com.vinodelnya.winery.service.EntryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/entries")
@RequiredArgsConstructor
public class EntryController {

    private final EntryService entryService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<PageResponse<EntryDto>> getAllEntries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "date,desc") String[] sort,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long personId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String description) {
        
        Pageable pageable = createPageable(page, size, sort);
        PageResponse<EntryDto> response = entryService.findAll(dateFrom, dateTo, personId, categoryId, description, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<EntryDto> getEntryById(@PathVariable Long id) {
        EntryDto entry = entryService.findById(id);
        return ResponseEntity.ok(entry);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EntryDto> createEntry(@Valid @RequestBody EntryDto entryDto) {
        EntryDto created = entryService.create(entryDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EntryDto> updateEntry(@PathVariable Long id, @Valid @RequestBody EntryDto entryDto) {
        EntryDto updated = entryService.update(id, entryDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long id) {
        entryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private Pageable createPageable(int page, int size, String[] sort) {
        if (sort.length >= 2) {
            Sort.Direction direction = Sort.Direction.fromString(sort[1]);
            return PageRequest.of(page, size, Sort.by(direction, sort[0]));
        }
        return PageRequest.of(page, size);
    }
}