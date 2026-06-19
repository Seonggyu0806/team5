package com.phishing.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
public class ChatSession {
    @Id
    private String sessionId; // 프론트엔드가 생성한 고유 세션 ID

    private Long userId;      // 로그인한 유저의 고유 ID
    private String type;      // url, phone, image 등
    private String riskLevel; // SAFE, HIGH 등
    private String preview;   // 미리보기 텍스트

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}