package com.phishing.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
public class AnalysisHistory { // UrlAnalysis에서 이름 변경!
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;         // 분석을 요청한 사용자 ID

    // --- 프론트엔드 통합 요청 핵심 필드 (추가됨) ---
    private String type;         // 분석 종류: "URL", "IMAGE", "VOICE", "PHONE"
    private String target;       // 분석 대상: 주소, 파일명, 전화번호 (기존 url 대체)
    private String riskLevel;    // 위험 등급: "SAFE", "LOW", "MEDIUM", "HIGH", "CRITICAL"
    private Integer riskScore;   // 위험 점수: 0~100 (null 허용)
    private String phishingType; // 피싱 종류: 파밍, 스미싱 등

    private LocalDateTime analyzedAt; // 분석 시각 (기존 timestamp 대체)

    // --- 기존에 있던 유용한 데이터 (유지) ---
    private boolean isMalicious; // 악성 여부
    private String details;      // 상세 결과 메시지

    // 솔루션 평가 (true: 도움됨, false: 도움안됨, null: 아직 평가안함)
    private Boolean isHelpful;

    // AI가 분석한 결과 전체 내용
    @Column(columnDefinition = "TEXT")
    private String aiResult;
}