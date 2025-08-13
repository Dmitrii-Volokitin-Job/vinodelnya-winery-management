package com.vinodelnya.winery.service;

import com.vinodelnya.winery.dto.PageResponse;
import com.vinodelnya.winery.dto.PersonDto;
import com.vinodelnya.winery.entity.Person;
import com.vinodelnya.winery.exception.EntityNotFoundException;
import com.vinodelnya.winery.exception.EntityInUseException;
import com.vinodelnya.winery.mapper.PersonMapper;
import com.vinodelnya.winery.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class PersonService {

    private final PersonRepository personRepository;
    private final PersonMapper personMapper;
    private final AuditService auditService;

    public PageResponse<PersonDto> findAll(String name, Boolean active, Pageable pageable) {
        Page<Person> page = personRepository.findWithFilters(name, active, pageable);
        return createPageResponse(page);
    }

    public PersonDto findById(Long id) {
        Person person = personRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Person not found with id: " + id));
        return personMapper.toDto(person);
    }

    public PersonDto create(PersonDto personDto) {
        if (personRepository.existsByNameIgnoreCase(personDto.getName())) {
            throw new RuntimeException("Person with name '" + personDto.getName() + "' already exists");
        }
        
        Person person = personMapper.toEntity(personDto);
        person = personRepository.save(person);
        
        // Log audit
        auditService.logCreate("persons", person.getId(), person);
        
        return personMapper.toDto(person);
    }

    public PersonDto update(Long id, PersonDto personDto) {
        Person existingPerson = personRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Person not found with id: " + id));
        
        if (!existingPerson.getName().equalsIgnoreCase(personDto.getName()) && 
            personRepository.existsByNameIgnoreCase(personDto.getName())) {
            throw new RuntimeException("Person with name '" + personDto.getName() + "' already exists");
        }
        
        // Store old state for audit
        Person oldPerson = new Person();
        oldPerson.setId(existingPerson.getId());
        oldPerson.setName(existingPerson.getName());
        oldPerson.setNote(existingPerson.getNote());
        oldPerson.setActive(existingPerson.getActive());
        oldPerson.setCreatedAt(existingPerson.getCreatedAt());
        oldPerson.setUpdatedAt(existingPerson.getUpdatedAt());
        
        personMapper.updateEntity(personDto, existingPerson);
        existingPerson = personRepository.save(existingPerson);
        
        // Log audit
        auditService.logUpdate("persons", id, oldPerson, existingPerson);
        
        return personMapper.toDto(existingPerson);
    }

    public void delete(Long id) {
        Person existingPerson = personRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Person not found with id: " + id));
        
        if (personRepository.isPersonUsedInEntries(id)) {
            throw new EntityInUseException("Cannot delete person as it is referenced in entries");
        }
        
        // Log audit before deletion
        auditService.logDelete("persons", id, existingPerson);
        
        personRepository.deleteById(id);
    }

    public PersonDto archive(Long id) {
        Person person = personRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Person not found with id: " + id));
        
        person.setActive(false);
        person = personRepository.save(person);
        return personMapper.toDto(person);
    }

    private PageResponse<PersonDto> createPageResponse(Page<Person> page) {
        return new PageResponse<>(
                page.getContent().stream().map(personMapper::toDto).toList(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize(),
                page.isFirst(),
                page.isLast()
        );
    }
}