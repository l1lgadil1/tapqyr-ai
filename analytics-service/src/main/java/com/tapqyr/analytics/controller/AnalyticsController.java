package com.tapqyr.analytics.controller;

import com.tapqyr.analytics.service.UserAnalyticsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final UserAnalyticsService userAnalyticsService;
    
    public AnalyticsController(UserAnalyticsService userAnalyticsService) {
        this.userAnalyticsService = userAnalyticsService;
    }
    
    /**
     * Get comprehensive user analytics including task completion and activities
     * 
     * @param userId The user ID to get analytics for
     * @return A map containing all user analytics
     */
    @GetMapping("/user/{userId}/comprehensive")
    public ResponseEntity<Map<String, Object>> getUserComprehensiveAnalytics(@PathVariable String userId) {
        Map<String, Object> userAnalytics = new HashMap<>();
        
        try {
            // Get user activity patterns (task statistics)
            Map<String, Object> activityPatterns = userAnalyticsService.getUserActivityPatterns(userId);
            userAnalytics.put("taskAnalytics", activityPatterns);
            
            // Get user engagement metrics
            Map<String, Object> engagementMetrics = userAnalyticsService.getUserEngagementMetrics(userId);
            userAnalytics.put("engagementMetrics", engagementMetrics);
            
            // Get weekly report data
            Map<String, Object> weeklyReport = userAnalyticsService.getWeeklyUserReport(userId);
            userAnalytics.put("weeklyReport", weeklyReport);
            
            return ResponseEntity.ok(userAnalytics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Failed to fetch user analytics: " + e.getMessage())
            );
        }
    }
} 