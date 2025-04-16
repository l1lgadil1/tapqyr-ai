package com.tapqyr.analytics.repository;

import com.tapqyr.analytics.model.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface TodoRepository extends JpaRepository<Todo, String> {
    
    // Find todos by user
    List<Todo> findByUserId(String userId);
    
    // Find completed todos
    List<Todo> findByCompletedTrue();
    
    // Find todos created in date range
    List<Todo> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // Find todos by user and created in date range
    List<Todo> findByUserIdAndCreatedAtBetween(String userId, LocalDateTime start, LocalDateTime end);
    
    // Find overdue todos (due date is in the past and not completed)
    @Query("SELECT t FROM Todo t WHERE t.completed = false AND t.dueDate < CURRENT_TIMESTAMP")
    List<Todo> findOverdueTodos();
    
    // Find completion rate per user
    @Query("SELECT t.userId, " +
           "COUNT(CASE WHEN t.completed = true THEN 1 ELSE NULL END) AS completedCount, " +
           "COUNT(t.id) AS totalCount " +
           "FROM Todo t GROUP BY t.userId")
    List<Object[]> findCompletionRateByUser();
    
    // Find todos by priority
    List<Todo> findByPriority(String priority);
    
    // Find AI-generated todos
    List<Todo> findByIsAIGenerated(Boolean isAIGenerated);
    
    // Count todos by user
    Long countByUserId(String userId);
} 