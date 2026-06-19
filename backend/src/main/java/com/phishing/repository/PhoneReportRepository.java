package com.phishing.repository;

import com.phishing.domain.PhoneReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface PhoneReportRepository extends JpaRepository<PhoneReport, Long> {

    Optional<PhoneReport> findByPhoneNumber(String phoneNumber);
    // 전화번호로 조회
    // Optional = 없을 수도 있음

    boolean existsByPhoneNumber(String phoneNumber);
    // 전화번호 존재 여부 확인
    // 신고할 때 이미 있는 번호인지 체크용

    @Query("SELECT p FROM PhoneReport p ORDER BY p.reportCount DESC LIMIT 10")
        // @Query = 직접 JPQL 쿼리 작성
        // reportCount 기준 내림차순 정렬해서 상위 10개
    List<PhoneReport> findTop10ByOrderByReportCountDesc();
    // 7일 신고 순위용 (전체 순위)
}