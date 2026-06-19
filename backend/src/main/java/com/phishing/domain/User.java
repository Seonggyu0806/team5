package com.phishing.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity                        // 이 클래스가 DB 테이블과 연결됨
@Table(name = "users")         // 연결할 테이블 이름
@Getter                        // Lombok이 getter 자동 생성
@NoArgsConstructor             // JPA용 빈 생성자 자동 생성
public class User {

    @Id                                                     // 기본키 (PK)
    @GeneratedValue(strategy = GenerationType.IDENTITY)     // AUTO_INCREMENT
    private Long id;

    @Column(nullable = false, unique = true)                // NOT NULL, 중복 불가 (이메일 중복 방지)
    private String email;                                   // 이메일 (로그인 아이디)

    @Column(nullable = false)                               // NOT NULL
    private String password;                                // 비밀번호 (암호화해서 저장)

    @Column(nullable = false)                               // NOT NULL
    private String nickname;                                // 닉네임

    @Column(nullable = false)                               // NOT NULL
    private LocalDateTime createdAt;                        // 가입 시간

    // 회원가입할 때 User 객체 만드는 생성자
    public User(String email, String password, String nickname) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
    }
    @PrePersist                                             // DB 저장 직전 자동 실행
    public void prePersist() {
        this.createdAt = LocalDateTime.now();               // 현재 시간으로 자동 설정
    }
}