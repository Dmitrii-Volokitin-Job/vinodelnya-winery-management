package com.vinodelnya.winery.controller;

import com.vinodelnya.winery.dto.EventDto;
import com.vinodelnya.winery.dto.PageResponse;
import com.vinodelnya.winery.service.EventService;
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
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<PageResponse<EventDto>> getAllEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "visitDate,desc") String[] sort,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String contactName,
            @RequestParam(required = false) Boolean specialPrice,
            @RequestParam(required = false) Boolean masterclass,
            @RequestParam(required = false) Boolean invoiceIssued) {
        
        Pageable pageable = createPageable(page, size, sort);
        PageResponse<EventDto> response = eventService.findAll(dateFrom, dateTo, company, 
                                                             contactName, specialPrice, 
                                                             masterclass, invoiceIssued, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<EventDto> getEventById(@PathVariable Long id) {
        EventDto event = eventService.findById(id);
        return ResponseEntity.ok(event);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventDto> createEvent(@Valid @RequestBody EventDto eventDto) {
        EventDto created = eventService.create(eventDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventDto> updateEvent(@PathVariable Long id, @Valid @RequestBody EventDto eventDto) {
        EventDto updated = eventService.update(id, eventDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.delete(id);
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