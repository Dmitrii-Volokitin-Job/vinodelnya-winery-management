package com.vinodelnya.winery.mapper;

import com.vinodelnya.winery.dto.PersonDto;
import com.vinodelnya.winery.entity.Person;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PersonMapper {
    
    PersonDto toDto(Person person);
    
    Person toEntity(PersonDto personDto);
    
    void updateEntity(PersonDto personDto, @MappingTarget Person person);
}