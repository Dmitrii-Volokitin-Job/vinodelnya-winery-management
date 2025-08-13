package com.vinodelnya.winery.service;

import com.vinodelnya.winery.dto.CategoryDto;
import com.vinodelnya.winery.dto.PageResponse;
import com.vinodelnya.winery.entity.Category;
import com.vinodelnya.winery.exception.EntityInUseException;
import com.vinodelnya.winery.exception.EntityNotFoundException;
import com.vinodelnya.winery.mapper.CategoryMapper;
import com.vinodelnya.winery.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public PageResponse<CategoryDto> findAll(String name, Boolean active, Pageable pageable) {
        Page<Category> page = categoryRepository.findWithFilters(name, active, pageable);
        return createPageResponse(page);
    }

    public CategoryDto findById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));
        return categoryMapper.toDto(category);
    }

    public CategoryDto create(CategoryDto categoryDto) {
        if (categoryRepository.existsByNameIgnoreCase(categoryDto.getName())) {
            throw new RuntimeException("Category with name '" + categoryDto.getName() + "' already exists");
        }
        
        Category category = categoryMapper.toEntity(categoryDto);
        category = categoryRepository.save(category);
        return categoryMapper.toDto(category);
    }

    public CategoryDto update(Long id, CategoryDto categoryDto) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));
        
        if (!existingCategory.getName().equalsIgnoreCase(categoryDto.getName()) && 
            categoryRepository.existsByNameIgnoreCase(categoryDto.getName())) {
            throw new RuntimeException("Category with name '" + categoryDto.getName() + "' already exists");
        }
        
        categoryMapper.updateEntity(categoryDto, existingCategory);
        existingCategory = categoryRepository.save(existingCategory);
        return categoryMapper.toDto(existingCategory);
    }

    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new EntityNotFoundException("Category not found with id: " + id);
        }
        
        if (categoryRepository.isCategoryUsedInEntries(id)) {
            throw new EntityInUseException("Cannot delete category as it is referenced in entries");
        }
        
        categoryRepository.deleteById(id);
    }

    public CategoryDto archive(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));
        
        category.setActive(false);
        category = categoryRepository.save(category);
        return categoryMapper.toDto(category);
    }

    private PageResponse<CategoryDto> createPageResponse(Page<Category> page) {
        return new PageResponse<>(
                page.getContent().stream().map(categoryMapper::toDto).toList(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize(),
                page.isFirst(),
                page.isLast()
        );
    }
}