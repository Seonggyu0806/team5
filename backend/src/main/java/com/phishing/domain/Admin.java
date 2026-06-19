package com.phishing.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity                        // DB 테이블과 연결
@Table(name = "admin")         // 연결할 테이블 이름
@Getter                        // Lombok이 getter 자동 생성
@NoArgsConstructor             // JPA용 빈 생성자 자동 생성
public class Admin {

    @Id                                                     // 기본키 (PK)
    @GeneratedValue(strategy = GenerationType.IDENTITY)     // AUTO_INCREMENT
    private Long id;

    @Column(nullable = false, unique = true)                // NOT NULL, 중복 불가
    private String adminId;                                 // 관리자 아이디

    @Column(nullable = false)                               // NOT NULL
    private String password;                                // 비밀번호 (암호화해서 저장)

    @Column(nullable = false)                               // NOT NULL
    private LocalDateTime createdAt;                        // 계정 생성 시간

    @PrePersist                                             // DB 저장 직전 자동 실행
    public void prePersist() {
        this.createdAt = LocalDateTime.now();               // 현재 시간으로 자동 설정
    }
}