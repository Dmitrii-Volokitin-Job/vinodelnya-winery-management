package com.vinodelnya.winery.service;

import com.vinodelnya.winery.dto.EventDto;
import com.vinodelnya.winery.dto.PageResponse;
import com.vinodelnya.winery.entity.Event;
import com.vinodelnya.winery.exception.EntityNotFoundException;
import com.vinodelnya.winery.mapper.EventMapper;
import com.vinodelnya.winery.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class EventService {

    private final EventRepository eventRepository;
    private final EventMapper eventMapper;

    public PageResponse<EventDto> findAll(LocalDate dateFrom, LocalDate dateTo, 
                                         String company, String contactName, 
                                         Boolean specialPrice, Boolean masterclass, 
                                         Boolean invoiceIssued, Pageable pageable) {
        Page<Event> page = eventRepository.findWithFilters(dateFrom, dateTo, specialPrice, 
                                                          masterclass, invoiceIssued, pageable);
        PageResponse<EventDto> response = createPageResponse(page);
        
        // Calculate page totals
        Map<String, BigDecimal> pageTotal = calculatePageTotals(page.getContent());
        response.setPageTotal(pageTotal);
        
        // Calculate grand totals
        Map<String, BigDecimal> grandTotal = eventRepository.calculateEventTotals(dateFrom, dateTo);
        response.setGrandTotal(grandTotal);
        
        return response;
    }

    public EventDto findById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + id));
        return eventMapper.toDto(event);
    }

    public EventDto create(EventDto eventDto) {
        Event event = eventMapper.toEntity(eventDto);
        event = eventRepository.save(event);
        return eventMapper.toDto(event);
    }

    public EventDto update(Long id, EventDto eventDto) {
        Event existingEvent = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + id));
        
        eventMapper.updateEntity(eventDto, existingEvent);
        existingEvent = eventRepository.save(existingEvent);
        return eventMapper.toDto(existingEvent);
    }

    public void delete(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new EntityNotFoundException("Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }

    private PageResponse<EventDto> createPageResponse(Page<Event> page) {
        return new PageResponse<>(
                page.getContent().stream().map(eventMapper::toDto).toList(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize(),
                page.isFirst(),
                page.isLast()
        );
    }

    private Map<String, BigDecimal> calculatePageTotals(java.util.List<Event> events) {
        BigDecimal lunchTotal = events.stream()
                .map(Event::getLunchTotal)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal tastingTotal = events.stream()
                .map(Event::getTastingTotal)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal addedWinesValue = events.stream()
                .map(Event::getAddedWinesValue)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal extraChargeAmount = events.stream()
                .map(Event::getExtraChargeAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal grandTotal = events.stream()
                .map(Event::getGrandTotal)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return Map.of(
                "lunchTotal", lunchTotal,
                "tastingTotal", tastingTotal,
                "addedWinesValue", addedWinesValue,
                "extraChargeAmount", extraChargeAmount,
                "grandTotal", grandTotal
        );
    }
}