package com.tapqyr.analytics.service;

import com.tapqyr.analytics.model.Todo;
import com.tapqyr.analytics.model.User;
import com.tapqyr.analytics.model.UserMemory;
import com.tapqyr.analytics.repository.TodoRepository;
import com.tapqyr.analytics.repository.UserMemoryRepository;
import com.tapqyr.analytics.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UserAnalyticsService {

    private final UserRepository userRepository;
    private final TodoRepository todoRepository;
    private final UserMemoryRepository userMemoryRepository;
    
    public UserAnalyticsService(UserRepository userRepository, TodoRepository todoRepository, UserMemoryRepository userMemoryRepository) {
        this.userRepository = userRepository;
        this.todoRepository = todoRepository;
        this.userMemoryRepository = userMemoryRepository;
    }

    // Get user growth metrics (daily, weekly, monthly)
    public Map<String, Long> getUserGrowthMetrics() {
        Map<String, Long> metrics = new HashMap<>();
        
        LocalDateTime now = LocalDateTime.now();
        
        // Daily - users created in the last 24 hours
        LocalDateTime yesterday = now.minus(1, ChronoUnit.DAYS);
        Long dailyNewUsers = userRepository.countByCreatedAtBetween(yesterday, now);
        metrics.put("dailyNewUsers", dailyNewUsers);
        
        // Weekly - users created in the last 7 days
        LocalDateTime lastWeek = now.minus(7, ChronoUnit.DAYS);
        Long weeklyNewUsers = userRepository.countByCreatedAtBetween(lastWeek, now);
        metrics.put("weeklyNewUsers", weeklyNewUsers);
        
        // Monthly - users created in the last 30 days
        LocalDateTime lastMonth = now.minus(30, ChronoUnit.DAYS);
        Long monthlyNewUsers = userRepository.countByCreatedAtBetween(lastMonth, now);
        metrics.put("monthlyNewUsers", monthlyNewUsers);
        
        // Total users
        Long totalUsers = userRepository.count();
        metrics.put("totalUsers", totalUsers);
        
        return metrics;
    }
    
    // Get todo completion rate metrics by user
    public List<Map<String, Object>> getTodoCompletionRateByUser() {
        List<Object[]> completionRates = todoRepository.findCompletionRateByUser();
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Object[] rate : completionRates) {
            String userId = (String) rate[0];
            Long completedCount = (Long) rate[1];
            Long totalCount = (Long) rate[2];
            
            Double completionRate = totalCount > 0 ? (double) completedCount / totalCount : 0.0;
            
            Map<String, Object> userCompletionData = new HashMap<>();
            userCompletionData.put("userId", userId);
            userCompletionData.put("completedCount", completedCount);
            userCompletionData.put("totalCount", totalCount);
            userCompletionData.put("completionRate", completionRate);
            
            // Get user details
            Optional<User> userOpt = userRepository.findById(userId);
            userOpt.ifPresent(user -> {
                userCompletionData.put("userName", user.getName());
                userCompletionData.put("userEmail", user.getEmail());
            });
            
            result.add(userCompletionData);
        }
        
        return result;
    }
    
    // Get user activity patterns (e.g., most active days/times)
    public Map<String, Object> getUserActivityPatterns(String userId) {
        Map<String, Object> patterns = new HashMap<>();
        
        // Get all todos for this user
        List<Todo> userTodos = todoRepository.findByUserId(userId);
        
        if (userTodos.isEmpty()) {
            patterns.put("todoCount", 0);
            return patterns;
        }
        
        patterns.put("todoCount", userTodos.size());
        
        // Analyze todo creation patterns by day of week
        Map<DayOfWeek, Long> todosByDayOfWeek = userTodos.stream()
                .collect(Collectors.groupingBy(
                        todo -> todo.getCreatedAt().getDayOfWeek(),
                        Collectors.counting()
                ));
        patterns.put("todosByDayOfWeek", todosByDayOfWeek);
        
        // Find most active day
        Map.Entry<DayOfWeek, Long> mostActiveDay = todosByDayOfWeek.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .orElse(null);
        
        if (mostActiveDay != null) {
            patterns.put("mostActiveDay", mostActiveDay.getKey());
            patterns.put("mostActiveDayCount", mostActiveDay.getValue());
        }
        
        // Calculate completion rate
        long completedCount = userTodos.stream().filter(todo -> Boolean.TRUE.equals(todo.getCompleted())).count();
        double completionRate = (double) completedCount / userTodos.size();
        patterns.put("completionRate", completionRate);
        
        // Analyze due date patterns
        Map<String, Long> dueDatePatterns = new HashMap<>();
        long todosWithDueDate = userTodos.stream().filter(todo -> todo.getDueDate() != null).count();
        dueDatePatterns.put("withDueDate", todosWithDueDate);
        dueDatePatterns.put("withoutDueDate", userTodos.size() - todosWithDueDate);
        patterns.put("dueDatePatterns", dueDatePatterns);
        
        // Analyze priority distribution
        Map<String, Long> priorityDistribution = userTodos.stream()
                .collect(Collectors.groupingBy(
                        todo -> todo.getPriority(),
                        Collectors.counting()
                ));
        patterns.put("priorityDistribution", priorityDistribution);
        
        // Get AI generated todo stats
        long aiGeneratedCount = userTodos.stream().filter(todo -> Boolean.TRUE.equals(todo.getIsAIGenerated())).count();
        patterns.put("aiGeneratedCount", aiGeneratedCount);
        patterns.put("aiGeneratedPercentage", (double) aiGeneratedCount / userTodos.size());
        
        return patterns;
    }
    
    // Get user engagement metrics
    public Map<String, Object> getUserEngagementMetrics(String userId) {
        Map<String, Object> metrics = new HashMap<>();
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return metrics;
        }
        
        User user = userOpt.get();
        
        // Last login time
        metrics.put("lastLogin", user.getLastLogin());
        
        // Days since registration
        if (user.getCreatedAt() != null) {
            long daysSinceRegistration = ChronoUnit.DAYS.between(user.getCreatedAt().toLocalDate(), LocalDate.now());
            metrics.put("daysSinceRegistration", daysSinceRegistration);
        }
        
        // Onboarding status
        metrics.put("onboardingComplete", user.getOnboardingComplete());
        
        // Profile completeness (based on optional fields filled)
        int profileFields = 0;
        int filledFields = 0;
        
        if (user.getName() != null) filledFields++;
        profileFields++;
        
        if (user.getWorkDescription() != null) filledFields++;
        profileFields++;
        
        if (user.getShortTermGoals() != null) filledFields++;
        profileFields++;
        
        if (user.getLongTermGoals() != null) filledFields++;
        profileFields++;
        
        if (user.getOtherContext() != null) filledFields++;
        profileFields++;
        
        double profileCompleteness = (double) filledFields / profileFields;
        metrics.put("profileCompleteness", profileCompleteness);
        
        // Todo activity
        long totalTodos = todoRepository.countByUserId(userId);
        metrics.put("totalTodos", totalTodos);
        
        // Get user memory data
        Optional<UserMemory> memoryOpt = userMemoryRepository.findByUserId(userId);
        if (memoryOpt.isPresent()) {
            UserMemory memory = memoryOpt.get();
            metrics.put("hasMemory", true);
            metrics.put("memoryLastUpdated", memory.getUpdatedAt());
            
            // Check if memory fields are populated
            boolean hasTaskPreferences = memory.getTaskPreferences() != null;
            boolean hasWorkPatterns = memory.getWorkPatterns() != null;
            boolean hasInteractionHistory = memory.getInteractionHistory() != null;
            boolean hasUserPersona = memory.getUserPersona() != null;
            
            metrics.put("hasTaskPreferences", hasTaskPreferences);
            metrics.put("hasWorkPatterns", hasWorkPatterns);
            metrics.put("hasInteractionHistory", hasInteractionHistory);
            metrics.put("hasUserPersona", hasUserPersona);
        } else {
            metrics.put("hasMemory", false);
        }
        
        return metrics;
    }
    
    // Get todo analytics for all users in a given time period
    public Map<String, Object> getTodoAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> analytics = new HashMap<>();
        
        // Get todos created in date range
        List<Todo> todos = todoRepository.findByCreatedAtBetween(startDate, endDate);
        
        if (todos.isEmpty()) {
            analytics.put("todoCount", 0);
            return analytics;
        }
        
        analytics.put("todoCount", todos.size());
        
        // Completion rate in period
        long completedCount = todos.stream().filter(todo -> Boolean.TRUE.equals(todo.getCompleted())).count();
        double completionRate = (double) completedCount / todos.size();
        analytics.put("completionRate", completionRate);
        
        // Priority distribution
        Map<String, Long> priorityDistribution = todos.stream()
                .collect(Collectors.groupingBy(
                        todo -> todo.getPriority(),
                        Collectors.counting()
                ));
        analytics.put("priorityDistribution", priorityDistribution);
        
        // AI generated stats
        long aiGeneratedCount = todos.stream().filter(todo -> Boolean.TRUE.equals(todo.getIsAIGenerated())).count();
        analytics.put("aiGeneratedCount", aiGeneratedCount);
        analytics.put("aiGeneratedPercentage", (double) aiGeneratedCount / todos.size());
        
        // Due date analysis
        long withDueDate = todos.stream().filter(todo -> todo.getDueDate() != null).count();
        analytics.put("withDueDate", withDueDate);
        analytics.put("withoutDueDate", todos.size() - withDueDate);
        
        return analytics;
    }
    
    // Get weekly report for a specific user
    public Map<String, Object> getWeeklyUserReport(String userId) {
        Map<String, Object> report = new HashMap<>();
        
        // Current week start (Monday) and end (Sunday)
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        
        LocalDateTime weekStart = startOfWeek.atStartOfDay();
        LocalDateTime weekEnd = endOfWeek.atTime(LocalTime.MAX);
        
        // Get user's todos for the week
        List<Todo> weeklyTodos = todoRepository.findByUserIdAndCreatedAtBetween(userId, weekStart, weekEnd);
        
        report.put("userId", userId);
        report.put("weekStart", startOfWeek);
        report.put("weekEnd", endOfWeek);
        report.put("totalTodosCreated", weeklyTodos.size());
        
        // Completion stats
        long completedCount = weeklyTodos.stream().filter(todo -> Boolean.TRUE.equals(todo.getCompleted())).count();
        report.put("completedTodos", completedCount);
        report.put("completionRate", weeklyTodos.isEmpty() ? 0 : (double) completedCount / weeklyTodos.size());
        
        // Priority breakdown
        Map<String, Long> priorityBreakdown = weeklyTodos.stream()
                .collect(Collectors.groupingBy(
                        todo -> todo.getPriority(),
                        Collectors.counting()
                ));
        report.put("priorityBreakdown", priorityBreakdown);
        
        // AI generation stats
        long aiGeneratedCount = weeklyTodos.stream().filter(todo -> Boolean.TRUE.equals(todo.getIsAIGenerated())).count();
        report.put("aiGeneratedCount", aiGeneratedCount);
        report.put("aiGeneratedPercentage", weeklyTodos.isEmpty() ? 0 : (double) aiGeneratedCount / weeklyTodos.size());
        
        // Due date stats
        long withDueDate = weeklyTodos.stream().filter(todo -> todo.getDueDate() != null).count();
        report.put("withDueDate", withDueDate);
        report.put("withoutDueDate", weeklyTodos.size() - withDueDate);
        
        // Get all-time user stats for comparison
        List<Todo> allTodos = todoRepository.findByUserId(userId);
        
        if (!allTodos.isEmpty()) {
            long allTimeCompleted = allTodos.stream().filter(todo -> Boolean.TRUE.equals(todo.getCompleted())).count();
            double allTimeCompletionRate = (double) allTimeCompleted / allTodos.size();
            
            // Compare weekly to all-time
            double completionRateDiff = 
                    (weeklyTodos.isEmpty() ? 0 : (double) completedCount / weeklyTodos.size()) - allTimeCompletionRate;
            report.put("completionRateChangeFromAverage", completionRateDiff);
            
            // Week-over-week comparison (previous week)
            LocalDateTime prevWeekStart = weekStart.minus(7, ChronoUnit.DAYS);
            LocalDateTime prevWeekEnd = weekEnd.minus(7, ChronoUnit.DAYS);
            
            List<Todo> prevWeekTodos = todoRepository.findByUserIdAndCreatedAtBetween(
                    userId, prevWeekStart, prevWeekEnd);
            
            report.put("prevWeekTodoCount", prevWeekTodos.size());
            report.put("todoCountChangeFromPrevWeek", weeklyTodos.size() - prevWeekTodos.size());
            
            long prevWeekCompleted = prevWeekTodos.stream().filter(todo -> Boolean.TRUE.equals(todo.getCompleted())).count();
            double prevWeekCompletionRate = prevWeekTodos.isEmpty() ? 0 : (double) prevWeekCompleted / prevWeekTodos.size();
            
            report.put("prevWeekCompletionRate", prevWeekCompletionRate);
            report.put("completionRateChangeFromPrevWeek", 
                    (weeklyTodos.isEmpty() ? 0 : (double) completedCount / weeklyTodos.size()) - prevWeekCompletionRate);
        }
        
        return report;
    }
    
    // Find similar users based on activity patterns
    public List<Map<String, Object>> findSimilarUsers(String userId) {
        // Get the user's activity patterns
        Map<String, Object> userPatterns = getUserActivityPatterns(userId);
        
        // Get all users
        List<User> allUsers = userRepository.findAll();
        List<Map<String, Object>> similarUsers = new ArrayList<>();
        
        for (User otherUser : allUsers) {
            // Skip the same user
            if (otherUser.getId().equals(userId)) {
                continue;
            }
            
            // Get this user's patterns
            Map<String, Object> otherPatterns = getUserActivityPatterns(otherUser.getId());
            
            // Calculate similarity score
            double similarityScore = calculateSimilarityScore(userPatterns, otherPatterns);
            
            if (similarityScore > 0.5) { // Threshold for similarity
                Map<String, Object> similarUserData = new HashMap<>();
                similarUserData.put("userId", otherUser.getId());
                similarUserData.put("userName", otherUser.getName());
                similarUserData.put("similarityScore", similarityScore);
                
                // Add shared patterns
                Map<String, Object> sharedPatterns = new HashMap<>();
                
                // Check for shared most active day
                if (userPatterns.get("mostActiveDay") != null && 
                        userPatterns.get("mostActiveDay").equals(otherPatterns.get("mostActiveDay"))) {
                    sharedPatterns.put("sharedMostActiveDay", userPatterns.get("mostActiveDay"));
                }
                
                similarUserData.put("sharedPatterns", sharedPatterns);
                similarUsers.add(similarUserData);
            }
        }
        
        // Sort by similarity score (descending)
        similarUsers.sort((a, b) -> Double.compare(
                (Double) b.get("similarityScore"),
                (Double) a.get("similarityScore")
        ));
        
        return similarUsers;
    }
    
    // Helper to calculate similarity between users
    private double calculateSimilarityScore(Map<String, Object> user1Patterns, Map<String, Object> user2Patterns) {
        double score = 0.0;
        double maxScore = 0.0;
        
        // Compare completion rates
        if (user1Patterns.containsKey("completionRate") && user2Patterns.containsKey("completionRate")) {
            double rate1 = (Double) user1Patterns.get("completionRate");
            double rate2 = (Double) user2Patterns.get("completionRate");
            double rateDiff = Math.abs(rate1 - rate2);
            
            // Score higher for more similar rates
            score += (1.0 - rateDiff) * 3.0; // Weight of 3
            maxScore += 3.0;
        }
        
        // Compare most active day
        if (user1Patterns.containsKey("mostActiveDay") && user2Patterns.containsKey("mostActiveDay")) {
            if (user1Patterns.get("mostActiveDay").equals(user2Patterns.get("mostActiveDay"))) {
                score += 2.0; // Exact match
            }
            maxScore += 2.0;
        }
        
        // Compare priority distributions
        if (user1Patterns.containsKey("priorityDistribution") && user2Patterns.containsKey("priorityDistribution")) {
            Map<String, Long> dist1 = (Map<String, Long>) user1Patterns.get("priorityDistribution");
            Map<String, Long> dist2 = (Map<String, Long>) user2Patterns.get("priorityDistribution");
            
            Set<String> allPriorities = new HashSet<>(dist1.keySet());
            allPriorities.addAll(dist2.keySet());
            
            double priorityScore = 0.0;
            for (String priority : allPriorities) {
                long count1 = dist1.getOrDefault(priority, 0L);
                long count2 = dist2.getOrDefault(priority, 0L);
                
                // Calculate percentage of each priority
                double total1 = user1Patterns.containsKey("todoCount") ? (Integer) user1Patterns.get("todoCount") : 1;
                double total2 = user2Patterns.containsKey("todoCount") ? (Integer) user2Patterns.get("todoCount") : 1;
                
                double pct1 = count1 / total1;
                double pct2 = count2 / total2;
                
                priorityScore += (1.0 - Math.abs(pct1 - pct2));
            }
            
            if (!allPriorities.isEmpty()) {
                priorityScore = priorityScore / allPriorities.size() * 2.5; // Weight of 2.5
                score += priorityScore;
                maxScore += 2.5;
            }
        }
        
        // Compare AI generated percentage
        if (user1Patterns.containsKey("aiGeneratedPercentage") && user2Patterns.containsKey("aiGeneratedPercentage")) {
            double pct1 = (Double) user1Patterns.get("aiGeneratedPercentage");
            double pct2 = (Double) user2Patterns.get("aiGeneratedPercentage");
            double pctDiff = Math.abs(pct1 - pct2);
            
            score += (1.0 - pctDiff) * 1.5; // Weight of 1.5
            maxScore += 1.5;
        }
        
        // Return normalized score
        return maxScore > 0 ? score / maxScore : 0.0;
    }
} 