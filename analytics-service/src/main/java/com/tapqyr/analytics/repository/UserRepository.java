package com.tapqyr.analytics.repository;

import com.tapqyr.analytics.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    
    // Find users by onboarding status
    List<User> findByOnboardingComplete(Boolean onboardingComplete);
    
    // Find users created within a date range
    List<User> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // Find users by last login date
    List<User> findByLastLoginBetween(LocalDateTime start, LocalDateTime end);
    
    // Count users by date range
    Long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // Custom query to find users with most todos
    @Query("SELECT u FROM User u JOIN Todo t ON u.id = t.userId GROUP BY u.id ORDER BY COUNT(t.id) DESC")
    List<User> findUsersByTodoCount();
} 