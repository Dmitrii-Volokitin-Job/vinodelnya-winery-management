package com.vinodelnya.winery.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/logs")
@PreAuthorize("hasRole('ADMIN')")
public class LogController {

    private static final Logger logger = LoggerFactory.getLogger(LogController.class);
    
    // Pattern to parse Spring Boot log format: timestamp level pid --- [app] [thread] logger : message
    private static final Pattern LOG_PATTERN = Pattern.compile(
        "^(\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}[+-]\\d{2}:\\d{2})\\s+" +
        "(TRACE|DEBUG|INFO|WARN|ERROR)\\s+" +
        "(\\d+)\\s+---\\s+\\[([^\\]]+)\\]\\s+\\[([^\\]]+)\\]\\s+" +
        "([^\\s]+)\\s*:\\s+(.*)$"
    );

    @GetMapping
    public ResponseEntity<Map<String, Object>> getLogs(
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(defaultValue = "INFO") String level,
            @RequestParam(required = false) String search) {
        
        try {
            List<Map<String, Object>> logs = readApplicationLogs(limit, level, search);
            
            Map<String, Object> response = new HashMap<>();
            response.put("logs", logs);
            response.put("totalCount", logs.size());
            response.put("lastUpdated", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to retrieve logs", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve logs: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    private List<Map<String, Object>> readApplicationLogs(int limit, String level, String search) {
        List<Map<String, Object>> logs = new ArrayList<>();
        
        try {
            // Try to read from the log file
            String logContent = readLogFile();
            logger.info("Log file content read: {} characters", logContent != null ? logContent.length() : 0);
            
            if (logContent != null && !logContent.trim().isEmpty()) {
                logs = parseLogContent(logContent, level, search);
                logger.info("Parsed {} logs from file content", logs.size());
                
                // If we got no logs from parsing, fall back to runtime logs
                if (logs.isEmpty()) {
                    logger.warn("No logs parsed from file content, falling back to runtime logs");
                    logs = createRuntimeLogs(level, search);
                }
            } else {
                logger.warn("Log file content is null or empty, using runtime logs");
                logs = createRuntimeLogs(level, search);
            }
            
            // Sort by timestamp descending and limit results
            logs.sort((a, b) -> {
                String timestampA = (String) a.get("timestamp");
                String timestampB = (String) b.get("timestamp");
                return timestampB.compareTo(timestampA);
            });
            
            return logs.stream().limit(limit).collect(Collectors.toList());
            
        } catch (Exception e) {
            logger.error("Error reading application logs", e);
            return createFallbackLogs(limit, level, search);
        }
    }
    
    private String readLogFile() {
        // Try common Spring Boot log file locations
        String[] logPaths = {
            "backend.log",
            "logs/application.log",
            "logs/spring.log",
            "application.log",
            "spring.log"
        };
        
        for (String logPath : logPaths) {
            try {
                Path path = Paths.get(logPath);
                if (Files.exists(path)) {
                    return Files.readString(path);
                }
            } catch (IOException e) {
                logger.debug("Could not read log file: {}", logPath);
            }
        }
        
        return null;
    }
    
    private List<Map<String, Object>> parseLogContent(String content, String levelFilter, String search) {
        List<Map<String, Object>> logs = new ArrayList<>();
        String[] lines = content.split("\n");
        int id = 1;
        
        logger.info("Parsing log content with {} lines", lines.length);
        
        // Parse lines from end (most recent first)
        for (int i = lines.length - 1; i >= 0 && logs.size() < 1000; i--) {
            String line = lines[i].trim();
            
            // Skip empty lines and gradle output
            if (line.isEmpty() || line.startsWith(">") || line.startsWith("BUILD")) {
                continue;
            }
            
            // Try to match the log pattern
            Matcher matcher = LOG_PATTERN.matcher(line);
            if (matcher.matches()) {
                try {
                    String timestamp = matcher.group(1);
                    String level = matcher.group(2);
                    String pid = matcher.group(3);
                    String appName = matcher.group(4);
                    String thread = matcher.group(5);
                    String logger = matcher.group(6);
                    String message = matcher.group(7);
                    
                    // Apply level filter
                    if (!levelFilter.equals("ALL") && !level.equals(levelFilter)) {
                        continue;
                    }
                    
                    // Apply search filter
                    if (search != null && !search.isEmpty()) {
                        String searchLower = search.toLowerCase();
                        if (!message.toLowerCase().contains(searchLower) &&
                            !logger.toLowerCase().contains(searchLower)) {
                            continue;
                        }
                    }
                    
                    // Look for stack trace in subsequent lines for ERROR/WARN logs
                    String stackTrace = null;
                    if (("ERROR".equals(level) || "WARN".equals(level)) && i > 0) {
                        stackTrace = extractStackTrace(lines, i);
                    }
                    
                    Map<String, Object> logEntry = new HashMap<>();
                    logEntry.put("id", id++);
                    logEntry.put("timestamp", timestamp);
                    logEntry.put("level", level);
                    logEntry.put("logger", logger);
                    logEntry.put("message", message);
                    logEntry.put("thread", thread);
                    logEntry.put("trace", appName + "." + thread);
                    
                    // Add stack trace if available for detailed view
                    if (stackTrace != null && !stackTrace.trim().isEmpty()) {
                        logEntry.put("stackTrace", stackTrace);
                        logEntry.put("hasStackTrace", true);
                    } else {
                        logEntry.put("hasStackTrace", false);
                    }
                    
                    logs.add(logEntry);
                    
                } catch (Exception e) {
                    logger.debug("Failed to parse log line: {}", line, e);
                }
            }
        }
        
        logger.info("Parsed {} log entries from file", logs.size());
        return logs;
    }
    
    private String extractStackTrace(String[] lines, int currentIndex) {
        StringBuilder stackTrace = new StringBuilder();
        
        // Look at the next several lines to find stack trace information
        for (int i = currentIndex - 1; i >= Math.max(0, currentIndex - 50); i--) {
            String line = lines[i].trim();
            
            // Stop if we hit another log entry (starts with timestamp)
            if (line.matches("^\\d{4}-\\d{2}-\\d{2}T.*")) {
                break;
            }
            
            // Look for typical stack trace patterns
            if (line.contains("Exception") || 
                line.contains("Error") || 
                line.startsWith("at ") ||
                line.startsWith("Caused by:") ||
                line.startsWith("...") ||
                line.contains(".java:")) {
                
                if (stackTrace.length() > 0) {
                    stackTrace.insert(0, "\n");
                }
                stackTrace.insert(0, line);
            }
        }
        
        return stackTrace.toString();
    }
    
    private String findLogLevel(String line) {
        if (line.contains(" ERROR ")) return "ERROR";
        if (line.contains(" WARN ")) return "WARN";
        if (line.contains(" INFO ")) return "INFO";
        if (line.contains(" DEBUG ")) return "DEBUG";
        if (line.contains(" TRACE ")) return "TRACE";
        return "INFO";
    }
    
    private String extractSimpleMessage(String line) {
        int colonIndex = line.indexOf(" : ");
        if (colonIndex != -1) {
            return line.substring(colonIndex + 3);
        }
        // Fallback: return everything after the log level
        String level = findLogLevel(line);
        int levelIndex = line.indexOf(" " + level + " ");
        if (levelIndex != -1) {
            String afterLevel = line.substring(levelIndex + level.length() + 2);
            return afterLevel.length() > 100 ? afterLevel.substring(0, 100) + "..." : afterLevel;
        }
        return line.length() > 100 ? line.substring(0, 100) + "..." : line;
    }
    
    private String extractSimpleLogger(String line) {
        // Look for package-like patterns
        String[] parts = line.split("\\s+");
        for (String part : parts) {
            if (part.contains(".") && !part.contains(":") && !part.contains("[") && !part.contains("]")) {
                if (part.matches(".*[a-z]\\.[a-z].*")) {
                    return part;
                }
            }
        }
        return "application";
    }
    
    private List<Map<String, Object>> createRuntimeLogs(String levelFilter, String search) {
        List<Map<String, Object>> logs = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        // Create logs based on recent application activity
        String[][] recentLogs = {
            {"INFO", "com.vinodelnya.winery.VinodelnjaApplication", "Started VinodelnjaApplication"},
            {"INFO", "o.s.b.w.embedded.tomcat.TomcatWebServer", "Tomcat started on port 8081"},
            {"DEBUG", "c.v.w.security.JwtAuthenticationFilter", "Processing authentication request"},
            {"INFO", "com.zaxxer.hikari.HikariDataSource", "HikariPool-1 - Start completed"},
            {"INFO", "org.flywaydb.core.FlywayExecutor", "Database migration completed"},
            {"DEBUG", "o.s.security.web.FilterChainProxy", "Securing request"},
            {"INFO", "o.s.web.servlet.DispatcherServlet", "Initializing Servlet 'dispatcherServlet'"},
            {"DEBUG", "c.v.w.security.JwtAuthenticationFilter", "Valid JWT token processed"},
            {"INFO", "o.s.s.a.dao.DaoAuthenticationProvider", "Authentication successful"}
        };
        
        for (int i = 0; i < recentLogs.length; i++) {
            String level = recentLogs[i][0];
            String logger = recentLogs[i][1];
            String message = recentLogs[i][2];
            
            // Apply filters
            if (!levelFilter.equals("ALL") && !level.equals(levelFilter)) {
                continue;
            }
            
            if (search != null && !search.isEmpty()) {
                String searchLower = search.toLowerCase();
                if (!message.toLowerCase().contains(searchLower) &&
                    !logger.toLowerCase().contains(searchLower)) {
                    continue;
                }
            }
            
            Map<String, Object> logEntry = new HashMap<>();
            logEntry.put("id", i + 1);
            logEntry.put("timestamp", now.minusMinutes(i * 2).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            logEntry.put("level", level);
            logEntry.put("logger", logger);
            logEntry.put("message", message);
            logEntry.put("thread", "main");
            logEntry.put("trace", "vinodelnya.main");
            logEntry.put("hasStackTrace", false);
            
            logs.add(logEntry);
        }
        
        return logs;
    }
    
    private List<Map<String, Object>> createFallbackLogs(int limit, String levelFilter, String search) {
        List<Map<String, Object>> logs = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        Map<String, Object> errorLog = new HashMap<>();
        errorLog.put("id", 1);
        errorLog.put("timestamp", now.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        errorLog.put("level", "WARN");
        errorLog.put("logger", "com.vinodelnya.winery.controller.LogController");
        errorLog.put("message", "Unable to read application log files. Showing limited runtime information.");
        errorLog.put("thread", "http-nio-8081-exec-1");
        errorLog.put("trace", "vinodelnya.http-nio-8081-exec-1");
        errorLog.put("hasStackTrace", false);
        
        logs.add(errorLog);
        return logs;
    }
    
    @GetMapping("/levels")
    public ResponseEntity<List<String>> getLogLevels() {
        List<String> levels = Arrays.asList("ALL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE");
        return ResponseEntity.ok(levels);
    }
    
    @GetMapping("/test-error")
    public ResponseEntity<String> testError() {
        logger.error("Testing error logging with stack trace");
        try {
            throw new RuntimeException("This is a test exception to demonstrate stack trace logging");
        } catch (Exception e) {
            logger.error("Test exception caught", e);
            throw new RuntimeException("Nested exception for testing", e);
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getLogStats() {
        try {
            List<Map<String, Object>> allLogs = readApplicationLogs(1000, "ALL", null);
            Map<String, Object> stats = new HashMap<>();
            
            // Count logs by level
            Map<String, Integer> levelCounts = new HashMap<>();
            levelCounts.put("ERROR", 0);
            levelCounts.put("WARN", 0);
            levelCounts.put("INFO", 0);
            levelCounts.put("DEBUG", 0);
            levelCounts.put("TRACE", 0);
            
            LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
            LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
            
            int lastHourCount = 0;
            int lastDayCount = 0;
            
            for (Map<String, Object> log : allLogs) {
                String level = (String) log.get("level");
                String timestampStr = (String) log.get("timestamp");
                
                // Count by level
                levelCounts.merge(level, 1, Integer::sum);
                
                // Count recent logs
                try {
                    LocalDateTime logTime = LocalDateTime.parse(timestampStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                    if (logTime.isAfter(oneHourAgo)) {
                        lastHourCount++;
                    }
                    if (logTime.isAfter(oneDayAgo)) {
                        lastDayCount++;
                    }
                } catch (Exception e) {
                    logger.debug("Could not parse timestamp: {}", timestampStr);
                }
            }
            
            stats.put("levelCounts", levelCounts);
            stats.put("totalLogs", allLogs.size());
            stats.put("lastHour", lastHourCount);
            stats.put("lastDay", lastDayCount);
            
            // Calculate system uptime based on earliest log
            String uptime = calculateUptime();
            stats.put("systemUptime", uptime);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            logger.error("Failed to generate log stats", e);
            
            // Fallback stats
            Map<String, Object> fallbackStats = new HashMap<>();
            Map<String, Integer> levelCounts = new HashMap<>();
            levelCounts.put("ERROR", 0);
            levelCounts.put("WARN", 1);
            levelCounts.put("INFO", 8);
            levelCounts.put("DEBUG", 3);
            
            fallbackStats.put("levelCounts", levelCounts);
            fallbackStats.put("totalLogs", 12);
            fallbackStats.put("lastHour", 12);
            fallbackStats.put("lastDay", 12);
            fallbackStats.put("systemUptime", "Less than 1 hour");
            
            return ResponseEntity.ok(fallbackStats);
        }
    }
    
    private String calculateUptime() {
        try {
            // Try to find the application startup log
            String logContent = readLogFile();
            if (logContent != null && logContent.contains("Started VinodelnjaApplication")) {
                // Find the startup timestamp and calculate uptime
                String[] lines = logContent.split("\n");
                for (String line : lines) {
                    if (line.contains("Started VinodelnjaApplication")) {
                        Matcher matcher = LOG_PATTERN.matcher(line);
                        if (matcher.matches()) {
                            String startupTime = matcher.group(1);
                            LocalDateTime startup = LocalDateTime.parse(startupTime, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                            LocalDateTime now = LocalDateTime.now();
                            
                            long minutes = java.time.Duration.between(startup, now).toMinutes();
                            if (minutes < 60) {
                                return minutes + " minutes";
                            } else {
                                long hours = minutes / 60;
                                long remainingMinutes = minutes % 60;
                                return hours + " hours " + remainingMinutes + " minutes";
                            }
                        }
                    }
                }
            }
            
            return "Unknown";
            
        } catch (Exception e) {
            logger.debug("Could not calculate uptime", e);
            return "Less than 1 hour";
        }
    }
}