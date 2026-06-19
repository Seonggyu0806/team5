package com.phishing.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChatResponseDto {
    private String sessionId;
    private Long chatMessageId; // 🌟 프론트엔드가 요청한 핵심 ID!
    private String reply;
    private String riskLevel;
}