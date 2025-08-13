package com.vinodelnya.winery.mapper;

import com.vinodelnya.winery.dto.EventDto;
import com.vinodelnya.winery.entity.Event;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface EventMapper {
    
    EventDto toDto(Event event);
    
    Event toEntity(EventDto eventDto);
    
    void updateEntity(EventDto eventDto, @MappingTarget Event event);
}