package com.phishing.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity                             // DB 테이블과 연결
@Table(name = "phone_report_logs")  // 연결할 테이블 이름
@Getter                             // getter 자동 생성
@NoArgsConstructor                  // JPA용 빈 생성자 자동 생성
public class PhoneReportLog {

    @Id                                                     // 기본키 (PK)
    @GeneratedValue(strategy = GenerationType.IDENTITY)     // AUTO_INCREMENT
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)                      // N:1 관계 (여러 신고 로그 → 한 명의 유저)
    @JoinColumn(name = "user_id", nullable = false)         // FK 컬럼명 = user_id
    private User user;                                      // 신고한 회원

    @ManyToOne(fetch = FetchType.LAZY)                      // N:1 관계 (여러 신고 로그 → 한 전화번호)
    @JoinColumn(name = "phone_number", referencedColumnName = "phoneNumber", nullable = false) // FK = phone_number
    private PhoneReport phoneReport;                        // 신고된 전화번호

    @Column(nullable = false)                               // NOT NULL
    private LocalDateTime createdAt;                        // 신고 시간

    // 신고 로그 생성자
    public PhoneReportLog(User user, PhoneReport phoneReport) {
        this.user = user;
        this.phoneReport = phoneReport;
    }

    @PrePersist                                             // DB 저장 직전 자동 실행
    public void prePersist() {
        this.createdAt = LocalDateTime.now();               // 현재 시간으로 자동 설정
    }
}
