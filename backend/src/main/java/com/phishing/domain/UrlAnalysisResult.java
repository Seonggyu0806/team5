package com.phishing.domain;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UrlAnalysisResult {
    private String url;          // 검사한 URL
    private boolean isMalicious; // 악성(피싱) 여부 (true면 위험, false면 안전)
    private String details;      // 상세 결과 메시지
}