package com.phishing.repository;

import com.phishing.domain.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatSessionRepository extends JpaRepository<ChatSession, String> {
    // 특정 유저의 세션 목록을 최신순으로 가져옵니다.
    List<ChatSession> findByUserIdOrderByCreatedAtDesc(Long userId);
}