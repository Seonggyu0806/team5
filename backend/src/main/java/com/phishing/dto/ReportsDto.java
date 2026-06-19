package com.phishing.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

public class ReportsDto {

    @Getter
    @NoArgsConstructor
    public static class ReportRequest {
        // 전화번호 신고 요청 DTO
        // POST /api/v1/reports/phone 요청 바디

        private String number;          // 신고할 전화번호
        private String phishingType;    // 피싱 종류 (선택)
    }

    @Getter
    public static class ReportResponse {
        // 전화번호 신고 응답 DTO

        private String number;          // 신고된 전화번호
        private int reportCount;        // 현재까지 신고 횟수
        private String message;         // 신고 접수 안내 문구
        private boolean alreadyReported; // 이미 신고한 번호 여부

        public ReportResponse(String number, int reportCount, String message, boolean alreadyReported) {
            this.number = number;
            this.reportCount = reportCount;
            this.message = message;
            this.alreadyReported = alreadyReported;
        }
    }

    @Getter
    public static class PhoneInfoResponse {
        // 전화번호 조회 응답 DTO
        // GET /api/v1/reports/phone/{phoneNumber} 응답

        private String number;          // 조회한 전화번호
        private int reportCount;        // 신고 횟수
        private String riskLevel;       // 위험 등급
        private String message;         // 위험도 안내 문구

        public PhoneInfoResponse(String number, int reportCount, String riskLevel, String message) {
            this.number = number;
            this.reportCount = reportCount;
            this.riskLevel = riskLevel;
            this.message = message;
        }
    }

    @Getter
    public static class RankingResponse {
        // 7일 신고 순위 응답 DTO
        // GET /api/v1/reports/ranking 응답

        private int rank;               // 순위
        private String phoneNumber;     // 전화번호
        private long reportCount;       // 7일간 신고 횟수

        public RankingResponse(int rank, String phoneNumber, long reportCount) {
            this.rank = rank;
            this.phoneNumber = phoneNumber;
            this.reportCount = reportCount;
        }
    }

    @Getter
    public static class MyReportResponse {
        // 내 신고 이력 응답 DTO
        // GET /api/v1/reports/my 응답

        private String phoneNumber;     // 신고한 전화번호
        private int reportCount;        // 해당 번호 총 신고 횟수
        private String riskLevel;       // 위험 등급
        private LocalDateTime createdAt; // 내가 신고한 시간

        public MyReportResponse(String phoneNumber, int reportCount, String riskLevel, LocalDateTime createdAt) {
            this.phoneNumber = phoneNumber;
            this.reportCount = reportCount;
            this.riskLevel = riskLevel;
            this.createdAt = createdAt;
        }
    }
}