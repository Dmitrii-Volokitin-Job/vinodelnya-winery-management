package com.vinodelnya.winery.mapper;

import com.vinodelnya.winery.dto.EntryDto;
import com.vinodelnya.winery.entity.Entry;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface EntryMapper {
    
    @Mapping(source = "person.id", target = "personId")
    @Mapping(source = "person.name", target = "personName")
    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    EntryDto toDto(Entry entry);
    
    @Mapping(source = "personId", target = "person.id")
    @Mapping(source = "categoryId", target = "category.id")
    @Mapping(target = "person.name", ignore = true)
    @Mapping(target = "category.name", ignore = true)
    Entry toEntity(EntryDto entryDto);
    
    @Mapping(source = "personId", target = "person.id")
    @Mapping(source = "categoryId", target = "category.id")
    @Mapping(target = "person.name", ignore = true)
    @Mapping(target = "category.name", ignore = true)
    void updateEntity(EntryDto entryDto, @MappingTarget Entry entry);
}