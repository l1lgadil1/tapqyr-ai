package com.tapqyr.analytics.controller;

import com.tapqyr.analytics.service.UserAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "User Analytics", description = "Endpoints for retrieving user analytics data")
public class UserAnalyticsController {

    private final UserAnalyticsService userAnalyticsService;
    
    public UserAnalyticsController(UserAnalyticsService userAnalyticsService) {
        this.userAnalyticsService = userAnalyticsService;
    }

    @GetMapping("/growth")
    @Operation(summary = "Get user growth metrics", description = "Returns daily, weekly, and monthly user growth metrics")
    public ResponseEntity<Map<String, Long>> getUserGrowthMetrics() {
        return ResponseEntity.ok(userAnalyticsService.getUserGrowthMetrics());
    }

    @GetMapping("/todo/completion-rates")
    @Operation(summary = "Get todo completion rates by user", description = "Returns completion rate statistics for all users")
    public ResponseEntity<List<Map<String, Object>>> getTodoCompletionRateByUser() {
        return ResponseEntity.ok(userAnalyticsService.getTodoCompletionRateByUser());
    }

    @GetMapping("/user/{userId}/activity-patterns")
    @Operation(summary = "Get user activity patterns", description = "Returns activity patterns for a specific user")
    public ResponseEntity<Map<String, Object>> getUserActivityPatterns(@PathVariable String userId) {
        return ResponseEntity.ok(userAnalyticsService.getUserActivityPatterns(userId));
    }

    @GetMapping("/user/{userId}/engagement")
    @Operation(summary = "Get user engagement metrics", description = "Returns engagement metrics for a specific user")
    public ResponseEntity<Map<String, Object>> getUserEngagementMetrics(@PathVariable String userId) {
        return ResponseEntity.ok(userAnalyticsService.getUserEngagementMetrics(userId));
    }

    @GetMapping("/todo/analytics")
    @Operation(summary = "Get todo analytics", description = "Returns analytics for todos created within a specific date range")
    public ResponseEntity<Map<String, Object>> getTodoAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(userAnalyticsService.getTodoAnalytics(startDate, endDate));
    }

    @GetMapping("/user/{userId}/weekly-report")
    @Operation(summary = "Get weekly user report", description = "Returns a weekly progress report for a specific user")
    public ResponseEntity<Map<String, Object>> getWeeklyUserReport(@PathVariable String userId) {
        return ResponseEntity.ok(userAnalyticsService.getWeeklyUserReport(userId));
    }

    @GetMapping("/user/{userId}/similar-users")
    @Operation(summary = "Find similar users", description = "Returns users with similar activity patterns")
    public ResponseEntity<List<Map<String, Object>>> findSimilarUsers(@PathVariable String userId) {
        return ResponseEntity.ok(userAnalyticsService.findSimilarUsers(userId));
    }
} 