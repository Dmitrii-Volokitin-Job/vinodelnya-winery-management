package com.vinodelnya.winery.repository;

import com.vinodelnya.winery.entity.Event;
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
public interface EventRepository extends JpaRepository<Event, Long> {
    
    @Query("SELECT e FROM Event e WHERE " +
           "(:dateFrom IS NULL OR e.visitDate >= :dateFrom) AND " +
           "(:dateTo IS NULL OR e.visitDate <= :dateTo) AND " +
           "(:specialPrice IS NULL OR e.specialPriceEnabled = :specialPrice) AND " +
           "(:masterclass IS NULL OR e.masterclass = :masterclass) AND " +
           "(:invoiceIssued IS NULL OR e.invoiceIssued = :invoiceIssued)")
    Page<Event> findWithFilters(@Param("dateFrom") LocalDate dateFrom,
                               @Param("dateTo") LocalDate dateTo,
                               @Param("specialPrice") Boolean specialPrice,
                               @Param("masterclass") Boolean masterclass,
                               @Param("invoiceIssued") Boolean invoiceIssued,
                               Pageable pageable);
    
    @Query("SELECT new map(" +
           "COALESCE(SUM(e.lunchTotal), 0) as lunchTotal, " +
           "COALESCE(SUM(e.tastingTotal), 0) as tastingTotal, " +
           "COALESCE(SUM(e.addedWinesValue), 0) as addedWinesValue, " +
           "COALESCE(SUM(e.extraChargeAmount), 0) as extraChargeAmount, " +
           "COALESCE(SUM(e.grandTotal), 0) as grandTotal) " +
           "FROM Event e WHERE " +
           "(:dateFrom IS NULL OR e.visitDate >= :dateFrom) AND " +
           "(:dateTo IS NULL OR e.visitDate <= :dateTo)")
    Map<String, BigDecimal> calculateEventTotals(@Param("dateFrom") LocalDate dateFrom,
                                                @Param("dateTo") LocalDate dateTo);
}