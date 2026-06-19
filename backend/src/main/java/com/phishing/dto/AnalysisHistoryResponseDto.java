package com.phishing.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AnalysisHistoryResponseDto {
    private Long id;
    private String type;
    private String target;
    private String riskLevel;
    private Integer riskScore;
    private String phishingType;
    private String analyzedAt; // 프론트 요구사항에 맞춰 String으로 전달
}