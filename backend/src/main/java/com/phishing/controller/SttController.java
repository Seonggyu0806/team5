package com.phishing.controller;

import com.phishing.service.VoiceAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SttController {

    private final VoiceAnalysisService voiceAnalysisService;

    @PostMapping("/analysis/voice")
    public ResponseEntity<Map<String, Object>> analyzeVoice(
            @RequestParam("file") List<MultipartFile> files,
            Authentication authentication) {

        Long userId = null;
        if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
            try {
                userId = Long.parseLong(authentication.getName());
            } catch (NumberFormatException e) {
                userId = null;
            }
        }

        Map<String, Object> result = voiceAnalysisService.analyzeVoices(files, userId);

        Map<String, Object> response = new HashMap<>();
        if (result.containsKey("error")) {
            response.put("success", false);
            response.put("message", result.get("error"));
            response.put("data", null);
            return ResponseEntity.ok(response);
        }

        response.put("success", true);
        response.put("message", "성공했습니다");
        response.put("data", result);
        return ResponseEntity.ok(response);
    }
}