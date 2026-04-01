package com.example.ohbs.response;

public class LoginMessage {
    private String message;
    private boolean success;
    private String role;
    private Long userId;
    private String token;

    // Constructor without token (for backward compatibility)
    public LoginMessage(String message, boolean success, String role, Long userId) {
        this.message = message;
        this.success = success;
        this.role = role;
        this.userId = userId;
    }
    
    // Constructor with token (used in your service)
    public LoginMessage(String message, boolean success, String role, Long userId, String token) {
        this.message = message;
        this.success = success;
        this.role = role;
        this.userId = userId;
        this.token = token;
    }

    // Getters
    public String getMessage() {
        return message;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getRole() {
        return role;
    }

    public Long getUserId() {
        return userId;
    }
    
    public String getToken() {
        return token;
    }

    // Setters
    public void setMessage(String message) {
        this.message = message;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
}