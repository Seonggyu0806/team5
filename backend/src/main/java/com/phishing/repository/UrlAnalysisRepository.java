package com.phishing.repository;

import com.phishing.domain.AnalysisHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UrlAnalysisRepository extends JpaRepository<AnalysisHistory, Long> {

    // 🌟 1. 기존 코드: isHelpful 값이 true(또는 false)인 데이터의 개수를 세어라!
    long countByIsHelpful(Boolean isHelpful);

    // 🌟 2. 추가된 마법의 코드: 특정 유저(userId)의 모든 분석 이력을 최신순으로 가져와라!
    List<AnalysisHistory> findByUserIdOrderByAnalyzedAtDesc(Long userId);
}