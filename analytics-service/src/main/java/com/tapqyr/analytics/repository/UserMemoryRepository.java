package com.tapqyr.analytics.repository;

import com.tapqyr.analytics.model.UserMemory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserMemoryRepository extends JpaRepository<UserMemory, String> {
    
    // Find user memory by user ID
    Optional<UserMemory> findByUserId(String userId);
    
    // Find recently updated memories
    List<UserMemory> findByUpdatedAtAfter(LocalDateTime timestamp);
    
    // Find memories that contain specific text patterns
    List<UserMemory> findByMemoryTextContaining(String pattern);
} 