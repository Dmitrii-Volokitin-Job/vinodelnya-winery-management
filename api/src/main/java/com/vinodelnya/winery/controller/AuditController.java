package com.vinodelnya.winery.controller;

import com.vinodelnya.winery.dto.PageResponse;
import com.vinodelnya.winery.entity.AuditLog;
import com.vinodelnya.winery.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/audit")
@RequiredArgsConstructor
@Tag(name = "Audit Log", description = "Operations for viewing audit history")
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    @Operation(summary = "Get audit history with filters", description = "Retrieve paginated audit log with optional filters")
    @ApiResponse(responseCode = "200", description = "Audit history retrieved successfully")
    public ResponseEntity<PageResponse<AuditLog>> getAuditHistory(
            @Parameter(description = "Table name filter") @RequestParam(required = false) String tableName,
            @Parameter(description = "Record ID filter") @RequestParam(required = false) Long recordId,
            @Parameter(description = "User filter") @RequestParam(required = false) String changedBy,
            @Parameter(description = "Start date filter") @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "End date filter") @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "15") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "changedAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : 
            Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<AuditLog> auditHistory = auditService.getAuditHistory(
            tableName, recordId, changedBy, startDate, endDate, pageable);
        
        return ResponseEntity.ok(auditHistory);
    }

    @GetMapping("/entity/{tableName}/{recordId}")
    @Operation(summary = "Get entity audit history", description = "Retrieve audit history for a specific entity")
    @ApiResponse(responseCode = "200", description = "Entity audit history retrieved successfully")
    public ResponseEntity<PageResponse<AuditLog>> getEntityHistory(
            @Parameter(description = "Table name") @PathVariable String tableName,
            @Parameter(description = "Record ID") @PathVariable Long recordId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "15") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("changedAt").descending());
        PageResponse<AuditLog> auditHistory = auditService.getEntityHistory(tableName, recordId, pageable);
        
        return ResponseEntity.ok(auditHistory);
    }
}