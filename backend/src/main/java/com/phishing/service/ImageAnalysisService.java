package com.phishing.service;

import com.phishing.domain.AnalysisHistory;
import com.phishing.repository.UrlAnalysisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ImageAnalysisService {

    private final OcrService ocrService;
    private final OpenAiService openAiService;
    private final UrlAnalysisRepository urlAnalysisRepository;

    // 여러 장 이미지 분석 (텍스트 합쳐서 AI에게 한 번에 분석)
    public Map<String, Object> analyzeImages(List<MultipartFile> imageFiles, Long userId) {
        if (imageFiles == null || imageFiles.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "이미지 파일이 없습니다.");
            return error;
        }

        // 각 이미지에서 텍스트 추출 후 합치기
        StringBuilder combinedText = new StringBuilder();
        List<String> fileNames = new ArrayList<>();
        for (int i = 0; i < imageFiles.size(); i++) {
            MultipartFile file = imageFiles.get(i);
            String text = ocrService.extractTextFromImage(file);
            if (text != null && !text.trim().isEmpty()) {
                if (combinedText.length() > 0) combinedText.append("\n---\n");
                combinedText.append("[이미지 ").append(i + 1).append("]\n").append(text);
            }
            fileNames.add(file.getOriginalFilename());
        }

        if (combinedText.length() == 0) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "모든 이미지에서 글자를 찾을 수 없습니다.");
            return error;
        }

        String extractedText = combinedText.toString();
        String aiResult = openAiService.analyzeImage(extractedText);
        String riskLevel = parseRiskLevel(aiResult);
        String phishingType = parsePhishingType(aiResult);

        Map<String, Object> response = new HashMap<>();
        response.put("extractedText", extractedText);
        response.put("detectedKeywords", extractKeywords(extractedText));
        response.put("riskLevel", riskLevel);
        response.put("phishingType", phishingType);
        response.put("message", aiResult);

        if (userId != null) {
            try {
                AnalysisHistory history = new AnalysisHistory();
                history.setUserId(userId);
                history.setType("IMAGE");
                history.setTarget(String.join(", ", fileNames));
                history.setRiskLevel(riskLevel);
                history.setPhishingType(phishingType);
                history.setAiResult(aiResult);
                history.setAnalyzedAt(LocalDateTime.now());
                urlAnalysisRepository.save(history);
            } catch (Exception e) {
                System.err.println("이미지 분석 이력 DB 저장 실패: " + e.getMessage());
            }
        }

        return response;
    }

    public Map<String, Object> analyzeImage(MultipartFile imageFile, Long userId) {
        Map<String, Object> response = new HashMap<>();

        String extractedText = ocrService.extractTextFromImage(imageFile);

        if (extractedText == null || extractedText.trim().isEmpty()) {
            response.put("error", "사진에서 글자를 찾을 수 없거나 구글 비전 API 오류가 발생했습니다.");
            return response;
        }

        String aiResult = openAiService.analyzeImage(extractedText);

        String riskLevel = parseRiskLevel(aiResult);
        String phishingType = parsePhishingType(aiResult);

        response.put("extractedText", extractedText);
        response.put("detectedKeywords", extractKeywords(extractedText));
        response.put("riskLevel", riskLevel);
        response.put("phishingType", phishingType);
        response.put("message", aiResult);

        if (userId != null) {
            try {
                AnalysisHistory history = new AnalysisHistory();
                history.setUserId(userId);
                history.setType("IMAGE");
                history.setTarget(imageFile.getOriginalFilename());
                history.setRiskLevel(riskLevel);
                history.setPhishingType(phishingType);
                history.setAiResult(aiResult);
                history.setAnalyzedAt(LocalDateTime.now());
                urlAnalysisRepository.save(history);
            } catch (Exception e) {
                System.err.println("이미지 분석 이력 DB 저장 실패: " + e.getMessage());
            }
        }

        return response;
    }

    private String parseRiskLevel(String text) {
        if (text == null) return "MEDIUM";
        String upper = text.toUpperCase();
        if (upper.contains("CRITICAL") || upper.contains("매우 위험")) return "CRITICAL";
        if (upper.contains("HIGH") || upper.contains("높은")) return "HIGH";
        if (upper.contains("LOW") || upper.contains("낮은")) return "LOW";
        if (upper.contains("SAFE") || upper.contains("안전")) return "SAFE";
        return "MEDIUM";
    }

    private String parsePhishingType(String text) {
        if (text == null) return "기타";
        if (text.contains("스미싱")) return "스미싱";
        if (text.contains("파밍")) return "파밍";
        if (text.contains("보이스피싱") || text.contains("보이스 피싱")) return "보이스피싱";
        if (text.contains("피싱")) return "피싱";
        return "기타";
    }

    private String extractKeywords(String text) {
        String[] keywords = {"계좌", "이체", "클릭", "링크", "인증", "비밀번호", "개인정보", "손실", "복구", "초대"};
        StringBuilder found = new StringBuilder();
        for (String kw : keywords) {
            if (text.contains(kw)) {
                if (found.length() > 0) found.append(", ");
                found.append(kw);
            }
        }
        return found.length() > 0 ? found.toString() : "없음";
    }
}