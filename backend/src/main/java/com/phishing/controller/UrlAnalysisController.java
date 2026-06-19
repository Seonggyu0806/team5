package com.phishing.controller;

import com.phishing.dto.AnalysisHistoryResponseDto;
import com.phishing.service.UrlAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class UrlAnalysisController {

    private final UrlAnalysisService urlAnalysisService;

    @PostMapping("/analysis/url")
    public ResponseEntity<Map<String, Object>> analyzeUrl(
            @RequestParam(value = "url", required = false) String paramUrl,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {

        String targetUrl = paramUrl != null ? paramUrl : (body != null ? body.get("url") : null);
        if (targetUrl == null || targetUrl.isBlank()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "url 파라미터가 필요합니다.");
            return ResponseEntity.badRequest().body(error);
        }

        Long userId = null;
        if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
            try {
                userId = Long.parseLong(authentication.getName());
            } catch (NumberFormatException e) {
                userId = null;
            }
        }

        Map<String, Object> result = urlAnalysisService.analyzeUrl(targetUrl, userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "성공했습니다");
        response.put("data", result);
        return ResponseEntity.ok(response);
    }


    // 3. 통계 조회
    @GetMapping("/phishing/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(urlAnalysisService.getEvaluationStats());
    }

    // 🌟 프론트엔드가 요청한 통합 이력 조회 API (본게임!)
    @GetMapping("/analysis/history")
    public ResponseEntity<Map<String, Object>> getHistory(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        List<AnalysisHistoryResponseDto> historyList = urlAnalysisService.getUserHistory(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "성공했습니다");
        response.put("data", historyList);
        return ResponseEntity.ok(response);
    }

    // 🛠️ 껍데기 테스트용 임시 API
    @GetMapping("/analysis/history/test")
    public ResponseEntity<AnalysisHistoryResponseDto> testDto() {
        AnalysisHistoryResponseDto dummyData = AnalysisHistoryResponseDto.builder()
                .id(2L)
                .type("IMAGE")
                .target("screenshot_0312.png")
                .riskLevel("CRITICAL")
                .riskScore(null)
                .phishingType("스미싱")
                .analyzedAt("2026-03-12 11:02:10")
                .build();

        return ResponseEntity.ok(dummyData);
    }
}