package com.phishing.repository;

import com.phishing.domain.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByAdminId(String adminId);
    // 관리자 아이디로 조회
    // 로그인할 때 사용
}