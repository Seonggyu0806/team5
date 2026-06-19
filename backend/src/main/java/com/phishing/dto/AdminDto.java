package com.phishing.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

public class AdminDto {

    @Getter
    @NoArgsConstructor
    public static class LoginRequest {
        private String adminId;
        private String password;
    }

    @Getter
    public static class LoginResponse {
        private String accessToken;
        private String adminId;

        public LoginResponse(String accessToken, String adminId) {
            this.accessToken = accessToken;
            this.adminId = adminId;
        }
    }

    @Getter
    public static class ReportListResponse {
        private String phoneNumber;
        private int reportCount;
        private String riskLevel;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public ReportListResponse(String phoneNumber, int reportCount, String riskLevel,
                                  LocalDateTime createdAt, LocalDateTime updatedAt) {
            this.phoneNumber = phoneNumber;
            this.reportCount = reportCount;
            this.riskLevel = riskLevel;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }
    }

    @Getter
    public static class UserListResponse {
        private Long id;
        private String email;
        private String name;
        private LocalDateTime createdAt;

        public UserListResponse(Long id, String email, String name, LocalDateTime createdAt) {
            this.id = id;
            this.email = email;
            this.name = name;
            this.createdAt = createdAt;
        }
    }

    @Getter
    public static class UrlListResponse {
        private Long id;
        private Long userId;
        private String url;
        private boolean isMalicious;
        private String details;
        private LocalDateTime timestamp;

        public UrlListResponse(Long id, Long userId, String url, boolean isMalicious,
                               String details, LocalDateTime timestamp) {
            this.id = id;
            this.userId = userId;
            this.url = url;
            this.isMalicious = isMalicious;
            this.details = details;
            this.timestamp = timestamp;
        }
    }
}