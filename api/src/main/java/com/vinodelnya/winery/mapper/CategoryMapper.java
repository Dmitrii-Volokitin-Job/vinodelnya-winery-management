package com.vinodelnya.winery.mapper;

import com.vinodelnya.winery.dto.CategoryDto;
import com.vinodelnya.winery.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    
    CategoryDto toDto(Category category);
    
    Category toEntity(CategoryDto categoryDto);
    
    void updateEntity(CategoryDto categoryDto, @MappingTarget Category category);
}