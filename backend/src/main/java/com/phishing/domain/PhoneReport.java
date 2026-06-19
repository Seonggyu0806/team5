package com.phishing.domain;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
@Entity                          // 이 클래스가 DB 테이블과 연결됨
@Table(name = "phone_reports")   // 연결할 테이블 이름
@Getter                          // Lombok이 getter 자동 생성
@NoArgsConstructor               // JPA용 빈 생성자 자동 생성
public class PhoneReport {
    @Id                                                        // 기본키 (PK)
    @GeneratedValue(strategy = GenerationType.IDENTITY)        // AUTO_INCREMENT
    private Long id;
    @Column(nullable = false, unique = true)                   // NOT NULL, 중복 불가
    private String phoneNumber;                                // 신고된 전화번호
    @Column(nullable = false)                                  // NOT NULL
    private int reportCount;                                   // 신고 횟수
    @Column(nullable = false)                                  // NOT NULL
    private String riskLevel;                                  // 위험 등급
    private Boolean isBlocked;                                 // 차단 여부 (true: 차단, false: 미차단)
    private LocalDateTime blockedAt;                           // 차단 시간 (차단 안됐으면 null)
    private String blockedReason;                              // 차단 이유 (없으면 null)
    @Column(nullable = false)                                  // NOT NULL
    private LocalDateTime createdAt;                           // 최초 신고 시간
    @Column(nullable = false)                                  // NOT NULL
    private LocalDateTime updatedAt;                           // 마지막 신고 시간
    
    // 처음 신고된 번호 생성자
    public PhoneReport(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    // 신고 횟수 증가 및 위험 등급 업데이트 메서드
    public void increaseReportCount() {
        this.reportCount++;
        // 신고 횟수별 위험 등급 업데이트
        if (this.reportCount >= 10) this.riskLevel = "CRITICAL";
        else if (this.reportCount >= 6) this.riskLevel = "HIGH";
        else if (this.reportCount >= 3) this.riskLevel = "MEDIUM";
        else this.riskLevel = "LOW";
    }
    
    @PrePersist                                                // DB 저장 직전 자동 실행
    public void prePersist() {
        this.reportCount = 0;                                  // 신고 횟수 초기값 0
        this.riskLevel = "LOW";                                // 위험 등급 초기값 LOW
        this.createdAt = LocalDateTime.now();                  // 현재 시간으로 자동 설정
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate                                                 // DB 수정 직전 자동 실행
    public void preUpdate() {
        if (this.createdAt == null) {                          // createdAt이 null인 기존 데이터 처리
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();                  // 수정 시간 자동 업데이트
    }
}
