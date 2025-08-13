package com.vinodelnya.winery.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private String username;
    private String role;
    
    public AuthResponse() {}
    
    public AuthResponse(String accessToken, String refreshToken, String username, String role) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.username = username;
        this.role = role;
    }
}