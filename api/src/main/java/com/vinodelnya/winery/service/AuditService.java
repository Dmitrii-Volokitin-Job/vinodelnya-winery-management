package com.vinodelnya.winery.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vinodelnya.winery.dto.PageResponse;
import com.vinodelnya.winery.entity.AuditLog;
import com.vinodelnya.winery.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public void logCreate(String tableName, Long recordId, Object newEntity) {
        try {
            JsonNode newValues = objectMapper.valueToTree(newEntity);
            
            AuditLog auditLog = new AuditLog();
            auditLog.setTableName(tableName);
            auditLog.setRecordId(recordId);
            auditLog.setAction(AuditLog.AuditAction.INSERT);
            auditLog.setNewValues(newValues);
            auditLog.setChangedBy(getCurrentUser());
            auditLog.setIpAddress(getClientIpAddress());
            auditLog.setUserAgent(getUserAgent());
            
            auditLogRepository.save(auditLog);
            log.debug("Logged CREATE audit for {} with id {}", tableName, recordId);
        } catch (Exception e) {
            log.error("Failed to log audit for CREATE operation", e);
        }
    }

    public void logUpdate(String tableName, Long recordId, Object oldEntity, Object newEntity) {
        try {
            JsonNode oldValues = objectMapper.valueToTree(oldEntity);
            JsonNode newValues = objectMapper.valueToTree(newEntity);
            
            AuditLog auditLog = new AuditLog();
            auditLog.setTableName(tableName);
            auditLog.setRecordId(recordId);
            auditLog.setAction(AuditLog.AuditAction.UPDATE);
            auditLog.setOldValues(oldValues);
            auditLog.setNewValues(newValues);
            auditLog.setChangedBy(getCurrentUser());
            auditLog.setIpAddress(getClientIpAddress());
            auditLog.setUserAgent(getUserAgent());
            
            auditLogRepository.save(auditLog);
            log.debug("Logged UPDATE audit for {} with id {}", tableName, recordId);
        } catch (Exception e) {
            log.error("Failed to log audit for UPDATE operation", e);
        }
    }

    public void logDelete(String tableName, Long recordId, Object deletedEntity) {
        try {
            JsonNode oldValues = objectMapper.valueToTree(deletedEntity);
            
            AuditLog auditLog = new AuditLog();
            auditLog.setTableName(tableName);
            auditLog.setRecordId(recordId);
            auditLog.setAction(AuditLog.AuditAction.DELETE);
            auditLog.setOldValues(oldValues);
            auditLog.setChangedBy(getCurrentUser());
            auditLog.setIpAddress(getClientIpAddress());
            auditLog.setUserAgent(getUserAgent());
            
            auditLogRepository.save(auditLog);
            log.debug("Logged DELETE audit for {} with id {}", tableName, recordId);
        } catch (Exception e) {
            log.error("Failed to log audit for DELETE operation", e);
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLog> getAuditHistory(String tableName, Long recordId, 
                                                 String changedBy, LocalDateTime startDate, 
                                                 LocalDateTime endDate, Pageable pageable) {
        Page<AuditLog> auditPage;
        
        // Check if any filters are provided
        boolean hasFilters = (tableName != null && !tableName.trim().isEmpty()) ||
                           (recordId != null) ||
                           (changedBy != null && !changedBy.trim().isEmpty()) ||
                           (startDate != null) ||
                           (endDate != null);
        
        if (hasFilters) {
            auditPage = auditLogRepository.findWithFilters(
                tableName, recordId, changedBy, startDate, endDate, pageable);
        } else {
            auditPage = auditLogRepository.findAllOrderByChangedAtDesc(pageable);
        }
        
        return new PageResponse<>(
            auditPage.getContent(),
            auditPage.getTotalElements(),
            auditPage.getTotalPages(),
            auditPage.getNumber(),
            auditPage.getSize(),
            auditPage.isFirst(),
            auditPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLog> getEntityHistory(String tableName, Long recordId, Pageable pageable) {
        Page<AuditLog> auditPage = auditLogRepository.findByTableNameAndRecordId(tableName, recordId, pageable);
        
        return new PageResponse<>(
            auditPage.getContent(),
            auditPage.getTotalElements(),
            auditPage.getTotalPages(),
            auditPage.getNumber(),
            auditPage.getSize(),
            auditPage.isFirst(),
            auditPage.isLast()
        );
    }

    private String getCurrentUser() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return "system";
        }
    }

    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                    return xForwardedFor.split(",")[0].trim();
                }
                return request.getRemoteAddr();
            }
        } catch (Exception e) {
            log.debug("Could not determine client IP address", e);
        }
        return "unknown";
    }

    private String getUserAgent() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                return request.getHeader("User-Agent");
            }
        } catch (Exception e) {
            log.debug("Could not determine user agent", e);
        }
        return "unknown";
    }
}