package com.tapqyr.analytics.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_memories")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMemory {

    @Id
    private String id;
    
    @Column(name = "userId", unique = true)
    private String userId;
    
    @Column(name = "createdAt")
    private LocalDateTime createdAt;
    
    @Column(name = "updatedAt")
    private LocalDateTime updatedAt;
    
    @Column(name = "taskPreferences", columnDefinition = "JSONB")
    private String taskPreferences;
    
    @Column(name = "workPatterns", columnDefinition = "JSONB")
    private String workPatterns;
    
    @Column(name = "interactionHistory", columnDefinition = "JSONB")
    private String interactionHistory;
    
    @Column(name = "userPersona", columnDefinition = "JSONB")
    private String userPersona;
    
    @Column(name = "memoryText")
    private String memoryText;
    
    @OneToOne
    @JoinColumn(name = "userId", insertable = false, updatable = false)
    private User user;
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getTaskPreferences() {
        return taskPreferences;
    }
    
    public void setTaskPreferences(String taskPreferences) {
        this.taskPreferences = taskPreferences;
    }
    
    public String getWorkPatterns() {
        return workPatterns;
    }
    
    public void setWorkPatterns(String workPatterns) {
        this.workPatterns = workPatterns;
    }
    
    public String getInteractionHistory() {
        return interactionHistory;
    }
    
    public void setInteractionHistory(String interactionHistory) {
        this.interactionHistory = interactionHistory;
    }
    
    public String getUserPersona() {
        return userPersona;
    }
    
    public void setUserPersona(String userPersona) {
        this.userPersona = userPersona;
    }
    
    public String getMemoryText() {
        return memoryText;
    }
    
    public void setMemoryText(String memoryText) {
        this.memoryText = memoryText;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
} 