package com.phishing.repository;

import com.phishing.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // JpaRepository<User, Long>
    // User      → 이 레포지토리가 다루는 Entity
    // Long      → PK 타입 (id가 Long이라서)

    Optional<User> findByEmail(String email);
    // 이메일로 유저 찾기
    // Optional = 결과가 없을 수도 있음 (null 대신 사용)

    boolean existsByEmail(String email);
    // 이메일 중복 확인용
    // true = 이미 존재 / false = 없음
}