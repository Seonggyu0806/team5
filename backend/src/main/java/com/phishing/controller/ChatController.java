package com.phishing.controller;

import com.phishing.domain.ChatSession;
import com.phishing.dto.ChatResponseDto;
import com.phishing.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // 대화 전송 및 세션 저장 로직
    @PostMapping
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> request, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName()); // 로그인한 진짜 유저 ID

        String sessionId = request.get("sessionId");
        String message = request.get("message");
        // 프론트엔드가 첫 메시지 전송 시 함께 보내는 메타데이터
        String type = request.get("type");
        String riskLevel = request.get("riskLevel");
        String preview = request.get("preview");

        ChatResponseDto responseDto = chatService.processAndSaveChat(sessionId, message, type, riskLevel, preview, userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "성공했습니다");
        response.put("data", responseDto);

        return ResponseEntity.ok(response);
    }

    // (A) 내 대화 세션 목록 API
    @GetMapping("/sessions")
    public ResponseEntity<Map<String, Object>> getSessions(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        List<ChatSession> sessions = chatService.getUserSessions(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "성공했습니다");
        response.put("data", sessions);

        return ResponseEntity.ok(response);
    }

    // (C) 대화 이력 조회 응답 (riskLevel 추가)
    @GetMapping("/{sessionId}/history")
    public ResponseEntity<Map<String, Object>> getHistory(@PathVariable String sessionId) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "성공했습니다");
        response.put("data", chatService.getHistoryWithRiskLevel(sessionId));

        return ResponseEntity.ok(response);
    }

    // 채팅 메시지 피드백 (도움됨/안됨)
    @PostMapping("/feedback")
    public ResponseEntity<Map<String, Object>> feedback(@RequestBody Map<String, Object> body) {
        Long chatMessageId = Long.valueOf(body.get("chatMessageId").toString());
        boolean isHelpful = Boolean.parseBoolean(body.get("isHelpful").toString());
        chatService.saveFeedback(chatMessageId, isHelpful);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "평가가 반영되었습니다. 감사합니다!");
        response.put("data", null);
        return ResponseEntity.ok(response);
    }
}