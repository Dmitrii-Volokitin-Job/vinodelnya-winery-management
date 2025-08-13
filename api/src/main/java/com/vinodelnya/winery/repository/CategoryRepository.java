package com.vinodelnya.winery.repository;

import com.vinodelnya.winery.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    Page<Category> findByActiveTrue(Pageable pageable);
    
    @Query("SELECT c FROM Category c")
    Page<Category> findWithFilters(@Param("name") String name,
                                  @Param("active") Boolean active,
                                  Pageable pageable);
    
    boolean existsByNameIgnoreCase(String name);
    
    @Query("SELECT COUNT(e) > 0 FROM Entry e WHERE e.category.id = :categoryId")
    boolean isCategoryUsedInEntries(@Param("categoryId") Long categoryId);
}