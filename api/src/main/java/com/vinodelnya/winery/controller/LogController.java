package com.vinodelnya.winery.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/logs")
@PreAuthorize("hasRole('ADMIN')")
public class LogController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getLogs(
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(defaultValue = "INFO") String level,
            @RequestParam(required = false) String search) {
        
        try {
            List<Map<String, Object>> logs = new ArrayList<>();
            
            // Add some sample logs for demonstration
            // In a real application, you would read from actual log files
            String[] logLevels = {"INFO", "WARN", "ERROR", "DEBUG"};
            String[] logMessages = {
                "Application started successfully",
                "User login attempt",
                "Database connection established", 
                "Cache refresh completed",
                "Scheduled task executed",
                "API request processed",
                "Authentication successful",
                "Data validation passed",
                "File upload completed",
                "System health check passed"
            };
            
            String[] logSources = {
                "com.vinodelnya.winery.VinodelnjaApplication",
                "com.vinodelnya.winery.security.JwtAuthenticationFilter",
                "com.vinodelnya.winery.service.UserService",
                "com.vinodelnya.winery.service.EntryService",
                "com.vinodelnya.winery.controller.AuthController",
                "org.springframework.web.servlet.DispatcherServlet",
                "org.hibernate.SQL",
                "com.vinodelnya.winery.service.AuditService"
            };
            
            Random random = new Random();
            LocalDateTime now = LocalDateTime.now();
            
            for (int i = 0; i < Math.min(limit, 200); i++) {
                Map<String, Object> logEntry = new HashMap<>();
                String entryLevel = logLevels[random.nextInt(logLevels.length)];
                String message = logMessages[random.nextInt(logMessages.length)];
                String source = logSources[random.nextInt(logSources.length)];
                LocalDateTime timestamp = now.minusMinutes(random.nextInt(1440)); // Last 24 hours
                
                // Apply level filter
                if (!level.equals("ALL") && !entryLevel.equals(level)) {
                    continue;
                }
                
                // Apply search filter
                if (search != null && !search.isEmpty() && 
                    !message.toLowerCase().contains(search.toLowerCase()) &&
                    !source.toLowerCase().contains(search.toLowerCase())) {
                    continue;
                }
                
                logEntry.put("id", i + 1);
                logEntry.put("timestamp", timestamp.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                logEntry.put("level", entryLevel);
                logEntry.put("logger", source);
                logEntry.put("message", message + " - Entry " + (i + 1));
                logEntry.put("thread", "http-nio-8081-exec-" + (random.nextInt(10) + 1));
                
                logs.add(logEntry);
            }
            
            // Sort by timestamp descending
            logs.sort((a, b) -> ((String) b.get("timestamp")).compareTo((String) a.get("timestamp")));
            
            Map<String, Object> response = new HashMap<>();
            response.put("logs", logs.stream().limit(limit).collect(Collectors.toList()));
            response.put("totalCount", logs.size());
            response.put("lastUpdated", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve logs: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @GetMapping("/levels")
    public ResponseEntity<List<String>> getLogLevels() {
        List<String> levels = Arrays.asList("ALL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE");
        return ResponseEntity.ok(levels);
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getLogStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Sample statistics
        Map<String, Integer> levelCounts = new HashMap<>();
        levelCounts.put("ERROR", 5);
        levelCounts.put("WARN", 12);
        levelCounts.put("INFO", 45);
        levelCounts.put("DEBUG", 23);
        
        stats.put("levelCounts", levelCounts);
        stats.put("totalLogs", 85);
        stats.put("lastHour", 15);
        stats.put("lastDay", 85);
        stats.put("systemUptime", "2 hours 15 minutes");
        
        return ResponseEntity.ok(stats);
    }
}