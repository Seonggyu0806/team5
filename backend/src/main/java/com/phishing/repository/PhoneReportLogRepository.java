package com.phishing.repository;

import com.phishing.domain.PhoneReport;
import com.phishing.domain.PhoneReportLog;
import com.phishing.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface PhoneReportLogRepository extends JpaRepository<PhoneReportLog, Long> {

    boolean existsByUserAndPhoneReport(User user, PhoneReport phoneReport);
    // 같은 유저가 같은 번호 중복 신고 여부 확인
    // true = 이미 신고함 (어뷰징 방지)

    List<PhoneReportLog> findByUser(User user);
    // 특정 유저의 신고 이력 전체 조회
    // 내 신고 이력 API에서 사용

    @Query("SELECT p.phoneReport.phoneNumber, COUNT(p) as cnt " +
            "FROM PhoneReportLog p " +
            "WHERE p.createdAt >= :sevenDaysAgo " +
            "GROUP BY p.phoneReport.phoneNumber " +
            "ORDER BY cnt DESC LIMIT 5")
    List<Object[]> findTop10RankingInLast7Days(LocalDateTime sevenDaysAgo);
    // 7일 신고 순위 API에서 사용
}