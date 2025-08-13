package com.vinodelnya.winery.repository;

import com.vinodelnya.winery.entity.Entry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Repository
public interface EntryRepository extends JpaRepository<Entry, Long> {
    
    @Query(value = "SELECT * FROM entries e WHERE " +
           "(CAST(:dateFrom AS DATE) IS NULL OR e.date >= CAST(:dateFrom AS DATE)) AND " +
           "(CAST(:dateTo AS DATE) IS NULL OR e.date <= CAST(:dateTo AS DATE)) AND " +
           "(CAST(:personId AS BIGINT) IS NULL OR e.person_id = CAST(:personId AS BIGINT)) AND " +
           "(CAST(:categoryId AS BIGINT) IS NULL OR e.category_id = CAST(:categoryId AS BIGINT))",
           nativeQuery = true)
    Page<Entry> findWithFilters(@Param("dateFrom") LocalDate dateFrom,
                               @Param("dateTo") LocalDate dateTo,
                               @Param("personId") Long personId,
                               @Param("categoryId") Long categoryId,
                               Pageable pageable);
    
    @Query(value = "SELECT " +
           "COALESCE(SUM(e.amount_paid), 0) as amountPaid, " +
           "COALESCE(SUM(e.amount_due), 0) as amountDue, " +
           "COALESCE(SUM(e.amount_paid), 0) + COALESCE(SUM(e.amount_due), 0) as total, " +
           "COALESCE(SUM(e.work_hours), 0) as workHours " +
           "FROM entries e WHERE " +
           "(CAST(:dateFrom AS DATE) IS NULL OR e.date >= CAST(:dateFrom AS DATE)) AND " +
           "(CAST(:dateTo AS DATE) IS NULL OR e.date <= CAST(:dateTo AS DATE)) AND " +
           "(CAST(:personId AS BIGINT) IS NULL OR e.person_id = CAST(:personId AS BIGINT)) AND " +
           "(CAST(:categoryId AS BIGINT) IS NULL OR e.category_id = CAST(:categoryId AS BIGINT))",
           nativeQuery = true)
    Map<String, BigDecimal> calculateTotals(@Param("dateFrom") LocalDate dateFrom,
                                           @Param("dateTo") LocalDate dateTo,
                                           @Param("personId") Long personId,
                                           @Param("categoryId") Long categoryId);
}