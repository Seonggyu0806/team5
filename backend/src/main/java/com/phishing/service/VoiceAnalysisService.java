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
public class VoiceAnalysisService {

    private final SttService sttService;
    private final OpenAiService openAiService;
    private final UrlAnalysisRepository urlAnalysisRepository;

    // 여러 통화 파일을 합쳐서 AI에게 한 번에 분석
    public Map<String, Object> analyzeVoices(List<MultipartFile> audioFiles, Long userId) {
        if (audioFiles == null || audioFiles.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "음성 파일이 없습니다.");
            return error;
        }

        // 각 파일 STT 변환 후 합치기
        StringBuilder combinedText = new StringBuilder();
        List<String> fileNames = new ArrayList<>();
        for (int i = 0; i < audioFiles.size(); i++) {
            MultipartFile file = audioFiles.get(i);
            String text = sttService.transcribeAudio(file);
            if (text != null && !text.startsWith("오류:") && !text.contains("오류가 발생했습니다")) {
                if (combinedText.length() > 0) combinedText.append("\n---\n");
                combinedText.append("[통화 ").append(i + 1).append("]\n").append(text);
            }
            fileNames.add(file.getOriginalFilename());
        }

        if (combinedText.length() == 0) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "모든 음성 파일 변환에 실패했습니다. 60초 이하의 파일만 분석할 수 있습니다.");
            return error;
        }

        String extractedText = combinedText.toString();
        String aiResult = openAiService.analyzeVoice(extractedText);
        String riskLevel = parseRiskLevel(aiResult);
        String phishingType = parsePhishingType(aiResult);

        Map<String, Object> response = new HashMap<>();
        response.put("convertedText", extractedText);
        response.put("riskLevel", riskLevel);
        response.put("phishingType", phishingType);
        response.put("message", aiResult);

        if (userId != null) {
            try {
                AnalysisHistory history = new AnalysisHistory();
                history.setUserId(userId);
                history.setType("VOICE");
                history.setTarget(String.join(", ", fileNames));
                history.setRiskLevel(riskLevel);
                history.setPhishingType(phishingType);
                history.setAiResult(aiResult);
                history.setAnalyzedAt(LocalDateTime.now());
                urlAnalysisRepository.save(history);
            } catch (Exception e) {
                System.err.println("음성 분석 이력 DB 저장 실패: " + e.getMessage());
            }
        }

        return response;
    }

    public Map<String, Object> analyzeVoice(MultipartFile audioFile, Long userId) {
        Map<String, Object> response = new HashMap<>();

        String extractedText = sttService.transcribeAudio(audioFile);

        if (extractedText == null || extractedText.startsWith("오류:") || extractedText.contains("오류가 발생했습니다")) {
            response.put("error", extractedText != null ? extractedText : "STT 변환 중 오류가 발생했습니다.");
            return response;
        }

        String aiResult = openAiService.analyzeVoice(extractedText);

        String riskLevel = parseRiskLevel(aiResult);
        String phishingType = parsePhishingType(aiResult);

        response.put("convertedText", extractedText);
        response.put("riskLevel", riskLevel);
        response.put("phishingType", phishingType);
        response.put("message", aiResult);

        if (userId != null) {
            try {
                AnalysisHistory history = new AnalysisHistory();
                history.setUserId(userId);
                history.setType("VOICE");
                history.setTarget(audioFile.getOriginalFilename());
                history.setRiskLevel(riskLevel);
                history.setPhishingType(phishingType);
                history.setAiResult(aiResult);
                history.setAnalyzedAt(LocalDateTime.now());
                urlAnalysisRepository.save(history);
            } catch (Exception e) {
                System.err.println("음성 분석 이력 DB 저장 실패: " + e.getMessage());
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
        if (text.contains("보이스피싱") || text.contains("보이스 피싱")) return "보이스 피싱";
        if (text.contains("스미싱")) return "스미싱";
        if (text.contains("파밍")) return "파밍";
        if (text.contains("피싱")) return "피싱";
        return "기타";
    }
}