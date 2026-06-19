package com.phishing.controller;

import com.phishing.service.OcrService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ocr")
@RequiredArgsConstructor
public class OcrController {

    private final OcrService ocrService;

    @PostMapping("/analyze")
    public ResponseEntity<String> analyzeImage(@RequestParam("file") MultipartFile file) {
        String extractedText = ocrService.extractTextFromImage(file);
        return ResponseEntity.ok("📝 [추출된 텍스트]\n" + extractedText);
    }
}