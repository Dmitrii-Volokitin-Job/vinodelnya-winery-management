package com.vinodelnya.winery.repository;

import com.vinodelnya.winery.entity.Person;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {
    
    Page<Person> findByActiveTrue(Pageable pageable);
    
    @Query("SELECT p FROM Person p WHERE " +
           "(:name IS NULL OR p.name LIKE %:name%) AND " +
           "(:active IS NULL OR p.active = :active)")
    Page<Person> findWithFilters(@Param("name") String name,
                                @Param("active") Boolean active,
                                Pageable pageable);
    
    boolean existsByNameIgnoreCase(String name);
    
    @Query("SELECT COUNT(e) > 0 FROM Entry e WHERE e.person.id = :personId")
    boolean isPersonUsedInEntries(@Param("personId") Long personId);
}