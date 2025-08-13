package com.vinodelnya.winery.service;

import com.vinodelnya.winery.dto.EntryDto;
import com.vinodelnya.winery.dto.PageResponse;
import com.vinodelnya.winery.entity.Category;
import com.vinodelnya.winery.entity.Entry;
import com.vinodelnya.winery.entity.Person;
import com.vinodelnya.winery.exception.EntityNotFoundException;
import com.vinodelnya.winery.mapper.EntryMapper;
import com.vinodelnya.winery.repository.CategoryRepository;
import com.vinodelnya.winery.repository.EntryRepository;
import com.vinodelnya.winery.repository.PersonRepository;
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
public class EntryService {

    private final EntryRepository entryRepository;
    private final PersonRepository personRepository;
    private final CategoryRepository categoryRepository;
    private final EntryMapper entryMapper;

    public PageResponse<EntryDto> findAll(LocalDate dateFrom, LocalDate dateTo, 
                                         Long personId, Long categoryId, String description, 
                                         Pageable pageable) {
        // Use simple findAll for now to avoid PostgreSQL parameter issues
        Page<Entry> page;
        if (dateFrom == null && dateTo == null && personId == null && categoryId == null) {
            page = entryRepository.findAll(pageable);
        } else {
            page = entryRepository.findWithFilters(dateFrom, dateTo, personId, categoryId, pageable);
        }
        
        PageResponse<EntryDto> response = createPageResponse(page);
        
        // Calculate page totals
        Map<String, BigDecimal> pageTotal = calculatePageTotals(page.getContent());
        response.setPageTotal(pageTotal);
        
        // Calculate grand totals
        Map<String, BigDecimal> grandTotal;
        if (dateFrom == null && dateTo == null && personId == null && categoryId == null) {
            grandTotal = calculateAllTotals();
        } else {
            Map<String, BigDecimal> rawTotals = entryRepository.calculateTotals(dateFrom, dateTo, personId, categoryId);
            // Normalize keys to camelCase for frontend compatibility
            grandTotal = normalizeMapKeys(rawTotals);
        }
        response.setGrandTotal(grandTotal);
        
        return response;
    }

    public EntryDto findById(Long id) {
        Entry entry = entryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Entry not found with id: " + id));
        return entryMapper.toDto(entry);
    }

    public EntryDto create(EntryDto entryDto) {
        validateReferences(entryDto.getPersonId(), entryDto.getCategoryId());
        
        Entry entry = entryMapper.toEntity(entryDto);
        entry.setPerson(personRepository.getReferenceById(entryDto.getPersonId()));
        entry.setCategory(categoryRepository.getReferenceById(entryDto.getCategoryId()));
        
        entry = entryRepository.save(entry);
        return entryMapper.toDto(entry);
    }

    public EntryDto update(Long id, EntryDto entryDto) {
        Entry existingEntry = entryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Entry not found with id: " + id));
        
        validateReferences(entryDto.getPersonId(), entryDto.getCategoryId());
        
        entryMapper.updateEntity(entryDto, existingEntry);
        existingEntry.setPerson(personRepository.getReferenceById(entryDto.getPersonId()));
        existingEntry.setCategory(categoryRepository.getReferenceById(entryDto.getCategoryId()));
        
        existingEntry = entryRepository.save(existingEntry);
        return entryMapper.toDto(existingEntry);
    }

    public void delete(Long id) {
        if (!entryRepository.existsById(id)) {
            throw new EntityNotFoundException("Entry not found with id: " + id);
        }
        entryRepository.deleteById(id);
    }

    private void validateReferences(Long personId, Long categoryId) {
        if (!personRepository.existsById(personId)) {
            throw new EntityNotFoundException("Person not found with id: " + personId);
        }
        if (!categoryRepository.existsById(categoryId)) {
            throw new EntityNotFoundException("Category not found with id: " + categoryId);
        }
    }

    private PageResponse<EntryDto> createPageResponse(Page<Entry> page) {
        return new PageResponse<>(
                page.getContent().stream().map(entryMapper::toDto).toList(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize(),
                page.isFirst(),
                page.isLast()
        );
    }

    private Map<String, BigDecimal> calculatePageTotals(java.util.List<Entry> entries) {
        BigDecimal amountPaid = entries.stream()
                .map(Entry::getAmountPaid)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal amountDue = entries.stream()
                .map(Entry::getAmountDue)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal workHours = entries.stream()
                .map(Entry::getWorkHours)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return Map.of(
                "amountPaid", amountPaid,
                "amountDue", amountDue,
                "total", amountPaid.add(amountDue),
                "workHours", workHours
        );
    }
    
    private Map<String, BigDecimal> calculateAllTotals() {
        java.util.List<Entry> allEntries = entryRepository.findAll();
        return calculatePageTotals(allEntries);
    }
    
    private Map<String, BigDecimal> normalizeMapKeys(Map<String, BigDecimal> map) {
        if (map == null) return null;
        
        Map<String, BigDecimal> normalized = new java.util.HashMap<>();
        for (Map.Entry<String, BigDecimal> entry : map.entrySet()) {
            String key = entry.getKey().toLowerCase();
            BigDecimal value = entry.getValue();
            
            // Convert database column names to camelCase
            switch (key) {
                case "amountpaid":
                    normalized.put("amountPaid", value);
                    break;
                case "amountdue":
                    normalized.put("amountDue", value);
                    break;
                case "workhours":
                    normalized.put("workHours", value);
                    break;
                case "total":
                    normalized.put("total", value);
                    break;
                default:
                    normalized.put(key, value);
            }
        }
        return normalized;
    }
}