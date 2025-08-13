package com.vinodelnya.winery.repository;

import com.vinodelnya.winery.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    Page<AuditLog> findByTableNameAndRecordId(String tableName, Long recordId, Pageable pageable);
    
    Page<AuditLog> findByTableName(String tableName, Pageable pageable);
    
    Page<AuditLog> findByChangedBy(String changedBy, Pageable pageable);
    
    @Query("SELECT a FROM AuditLog a WHERE a.changedAt BETWEEN :startDate AND :endDate")
    Page<AuditLog> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                  @Param("endDate") LocalDateTime endDate, 
                                  Pageable pageable);
    
    @Query("SELECT a FROM AuditLog a ORDER BY a.changedAt DESC")
    Page<AuditLog> findAllOrderByChangedAtDesc(Pageable pageable);
    
    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:tableName IS NULL OR a.tableName = :tableName) AND " +
           "(:recordId IS NULL OR a.recordId = :recordId) AND " +
           "(:changedBy IS NULL OR :changedBy = '' OR a.changedBy LIKE CONCAT('%', :changedBy, '%')) AND " +
           "(:startDate IS NULL OR a.changedAt >= :startDate) AND " +
           "(:endDate IS NULL OR a.changedAt <= :endDate) " +
           "ORDER BY a.changedAt DESC")
    Page<AuditLog> findWithFilters(@Param("tableName") String tableName,
                                  @Param("recordId") Long recordId,
                                  @Param("changedBy") String changedBy,
                                  @Param("startDate") LocalDateTime startDate,
                                  @Param("endDate") LocalDateTime endDate,
                                  Pageable pageable);
}