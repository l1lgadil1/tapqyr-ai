package com.tapqyr.analytics.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private String id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column
    private String name;
    
    @Column(nullable = false)
    private String password;
    
    @Column(name = "createdAt")
    private LocalDateTime createdAt;
    
    @Column(name = "updatedAt")
    private LocalDateTime updatedAt;
    
    @Column(name = "isEmailVerified")
    private Boolean isEmailVerified;
    
    @Column(name = "verificationToken")
    private String verificationToken;
    
    @Column(name = "resetPasswordToken")
    private String resetPasswordToken;
    
    @Column(name = "resetPasswordExpires")
    private LocalDateTime resetPasswordExpires;
    
    @Column(name = "lastLogin")
    private LocalDateTime lastLogin;
    
    @Column(name = "workDescription")
    private String workDescription;
    
    @Column(name = "shortTermGoals")
    private String shortTermGoals;
    
    @Column(name = "longTermGoals")
    private String longTermGoals;
    
    @Column(name = "otherContext")
    private String otherContext;
    
    @Column(name = "onboardingComplete")
    private Boolean onboardingComplete;
    
    @Column(name = "refreshToken")
    private String refreshToken;
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
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
    
    public Boolean getIsEmailVerified() {
        return isEmailVerified;
    }
    
    public void setIsEmailVerified(Boolean isEmailVerified) {
        this.isEmailVerified = isEmailVerified;
    }
    
    public String getVerificationToken() {
        return verificationToken;
    }
    
    public void setVerificationToken(String verificationToken) {
        this.verificationToken = verificationToken;
    }
    
    public String getResetPasswordToken() {
        return resetPasswordToken;
    }
    
    public void setResetPasswordToken(String resetPasswordToken) {
        this.resetPasswordToken = resetPasswordToken;
    }
    
    public LocalDateTime getResetPasswordExpires() {
        return resetPasswordExpires;
    }
    
    public void setResetPasswordExpires(LocalDateTime resetPasswordExpires) {
        this.resetPasswordExpires = resetPasswordExpires;
    }
    
    public LocalDateTime getLastLogin() {
        return lastLogin;
    }
    
    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }
    
    public String getWorkDescription() {
        return workDescription;
    }
    
    public void setWorkDescription(String workDescription) {
        this.workDescription = workDescription;
    }
    
    public String getShortTermGoals() {
        return shortTermGoals;
    }
    
    public void setShortTermGoals(String shortTermGoals) {
        this.shortTermGoals = shortTermGoals;
    }
    
    public String getLongTermGoals() {
        return longTermGoals;
    }
    
    public void setLongTermGoals(String longTermGoals) {
        this.longTermGoals = longTermGoals;
    }
    
    public String getOtherContext() {
        return otherContext;
    }
    
    public void setOtherContext(String otherContext) {
        this.otherContext = otherContext;
    }
    
    public Boolean getOnboardingComplete() {
        return onboardingComplete;
    }
    
    public void setOnboardingComplete(Boolean onboardingComplete) {
        this.onboardingComplete = onboardingComplete;
    }
    
    public String getRefreshToken() {
        return refreshToken;
    }
    
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
} 