package com.phishing.service;

import com.phishing.domain.AnalysisHistory;
import com.phishing.dto.AnalysisHistoryResponseDto;
import com.phishing.repository.UrlAnalysisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UrlAnalysisService {

    private final OpenAiService openAiService;
    private final UrlAnalysisRepository urlAnalysisRepository;
    private final GoogleSafeBrowsingService googleSafeBrowsingService;

    // 1. [기존 기능 수정] URL 분석 및 DB 저장 (하이브리드 탐지)
    // 💡 변경점: 이제 누가(userId) 검사했는지 파라미터로 받아야 합니다.
    public Map<String, Object> analyzeUrl(String targetUrl, Long userId) {
        String aiResult = "";
        String riskLevel = "SAFE";
        String phishingType = "기타";
        String recommendation = "";

        // 0차: 공인 도메인이면 즉시 SAFE 반환 (AI 호출 불필요)
        if (isTrustedDomain(targetUrl)) {
            aiResult = "공인된 도메인으로 확인되었습니다. 안전한 URL입니다.";
            riskLevel = "SAFE";
            phishingType = "정상";
            recommendation = "안전한 URL로 판단됩니다.";
        } else {
            boolean isMalicious = googleSafeBrowsingService.isMaliciousUrl(targetUrl);

            // AI가 항상 분석
            aiResult = openAiService.analyzeUrl(targetUrl);

            // HTTPS URL인데 AI가 HTTPS 미사용을 언급한 경우 강제 제거
            if (targetUrl.startsWith("https://")) {
                String[] lines = aiResult.split("\n");
                StringBuilder filtered = new StringBuilder();
                for (String line : lines) {
                    String lower = line.toLowerCase();
                    if (lower.contains("https") && (lower.contains("미사용") || lower.contains("사용하지") || lower.contains("보안 연결 없음"))) {
                        continue;
                    }
                    if (filtered.length() > 0) filtered.append("\n");
                    filtered.append(line);
                }
                aiResult = filtered.toString();
            }

            riskLevel = parseRiskLevel(aiResult);
            phishingType = parsePhishingType(aiResult);
            recommendation = parseRecommendation(aiResult);

            // Safe Browsing이 악성 판단했는데 AI가 SAFE/LOW로 판단한 경우 → 최소 HIGH로 보정
            if (isMalicious && (riskLevel.equals("SAFE") || riskLevel.equals("LOW"))) {
                riskLevel = "HIGH";
                recommendation = "구글 Safe Browsing에서 악성으로 탐지된 URL입니다. 주의하세요.";
            }
        }

        int riskScore = riskLevelToScore(riskLevel);

        try {
            AnalysisHistory newRecord = new AnalysisHistory();
            newRecord.setUserId(userId);
            newRecord.setType("URL");
            newRecord.setTarget(targetUrl);
            newRecord.setRiskLevel(riskLevel);
            newRecord.setRiskScore(riskScore);
            newRecord.setPhishingType(phishingType);
            newRecord.setAnalyzedAt(LocalDateTime.now());
            newRecord.setAiResult(aiResult);
            urlAnalysisRepository.save(newRecord);
        } catch (Exception e) {
            System.err.println("DB 저장 중 문제가 발생했습니다: " + e.getMessage());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("riskScore", riskScore);
        result.put("riskLevel", riskLevel);
        result.put("phishingType", phishingType);
        result.put("recommendation", recommendation);
        result.put("detectedKeywords", aiResult);
        return result;
    }

    private static final List<String> TRUSTED_DOMAINS = List.of(
            // 글로벌 대형 서비스
            "google.com", "google.co.kr", "youtube.com", "gmail.com",
            "apple.com", "icloud.com", "microsoft.com", "live.com", "outlook.com",
            "amazon.com", "netflix.com", "spotify.com", "linkedin.com",
            "facebook.com", "instagram.com", "twitter.com", "x.com",
            "github.com", "stackoverflow.com", "wikipedia.org",
            "dropbox.com", "zoom.us", "slack.com", "notion.so",
            // 한국 포털·메신저
            "naver.com", "daum.net", "kakao.com", "kakaocorp.com",
            "band.us", "line.me", "tistory.com", "blog.me",
            // 한국 쇼핑·배달
            "coupang.com", "gmarket.co.kr", "auction.co.kr", "11st.co.kr",
            "ssg.com", "lotteon.com", "oliveyoung.co.kr",
            "baemin.com", "yogiyo.co.kr",
            // 한국 금융·은행
            "toss.im", "kb.co.kr", "kbstar.com", "kbcard.com",
            "shinhan.com", "shinhancard.com", "wooribank.com", "wooricard.com",
            "hanabank.com", "hanacard.co.kr", "ibk.co.kr",
            "nhbank.com", "nhcard.co.kr", "kbank.com", "kakaobank.com",
            "samsung.com", "samsungcard.com", "lottecard.co.kr",
            "cardif.co.kr", "citibank.co.kr",
            // 한국 통신사
            "skt.co.kr", "tworld.co.kr", "kt.com", "lguplus.com",
            // 한국 공공·교육 도메인
            "gov.kr", "go.kr", "or.kr", "ac.kr", "re.kr", "ne.kr",
            // 한국 기타 대형 서비스
            "samsung.com", "lg.com", "hyundai.com",
            "papago.naver.com", "map.naver.com", "pay.naver.com",
            "melon.com", "bugs.co.kr", "watcha.com"
    );

    private boolean isTrustedDomain(String url) {
        try {
            String host = url.replaceFirst("^https?://", "").split("/")[0].split("\\?")[0].split(":")[0].toLowerCase();
            for (String trusted : TRUSTED_DOMAINS) {
                if (host.equals(trusted) || host.endsWith("." + trusted)) {
                    return true;
                }
            }
        } catch (Exception e) {
            // 파싱 실패 시 신뢰하지 않음
        }
        return false;
    }

    private int riskLevelToScore(String riskLevel) {
        return switch (riskLevel) {
            case "CRITICAL" -> 95;
            case "HIGH"     -> 75;
            case "MEDIUM"   -> 50;
            case "LOW"      -> 25;
            default         -> 5;
        };
    }

    private String parsePhishingType(String text) {
        if (text == null) return "기타";
        if (text.contains("스미싱")) return "스미싱";
        if (text.contains("파밍")) return "파밍";
        if (text.contains("보이스피싱") || text.contains("보이스 피싱")) return "보이스피싱";
        if (text.contains("피싱")) return "피싱";
        return "기타";
    }

    private String parseRecommendation(String text) {
        if (text == null) return "주의하세요.";
        if (text.contains("접속") && text.contains("중단")) return "즉시 접속을 중단하세요.";
        if (text.contains("클릭") && (text.contains("금지") || text.contains("하지 마"))) return "링크를 클릭하지 마세요.";
        if (text.contains("안전") || text.contains("정상")) return "안전한 URL로 판단됩니다.";
        return "주의가 필요합니다. 개인정보를 입력하지 마세요.";
    }

    // 🌟 [신규 기능] 특정 유저의 통합 분석 이력 조회 (프론트엔드 명세서 완벽 대응)
    public List<AnalysisHistoryResponseDto> getUserHistory(Long userId) {
        // 1. DB에서 유저 ID로 모든 기록을 가져옵니다.
        List<AnalysisHistory> histories = urlAnalysisRepository.findByUserIdOrderByAnalyzedAtDesc(userId);

        // 프론트엔드가 요청한 날짜 포맷 (예: 2026-03-13 19:41:25)
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        // 2. DB 데이터를 프론트엔드 전용 DTO 그릇으로 예쁘게 옮겨 담습니다.
        return histories.stream().map(history ->
                AnalysisHistoryResponseDto.builder()
                        .id(history.getId())
                        .type(history.getType())
                        .target(history.getTarget())
                        .riskLevel(history.getRiskLevel())
                        .riskScore(history.getRiskScore())
                        .phishingType(history.getPhishingType())
                        .analyzedAt(history.getAnalyzedAt() != null ? history.getAnalyzedAt().format(formatter) : null)
                        .build()
        ).collect(Collectors.toList());
    }

    // 3. [기존 기능] 분석 결과 평가하기 (도움됨/안됨)
    public void evaluateResult(Long id, boolean helpful) {
        AnalysisHistory record = urlAnalysisRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 기록이 없습니다. ID: " + id));

        record.setIsHelpful(helpful);
        urlAnalysisRepository.save(record);
    }

    private String parseRiskLevel(String aiResult) {
        if (aiResult == null) return "MEDIUM";
        // "위험도: CRITICAL" 형식을 우선 파싱
        if (aiResult.contains("위험도: CRITICAL") || aiResult.contains("위험도:CRITICAL")) return "CRITICAL";
        if (aiResult.contains("위험도: HIGH") || aiResult.contains("위험도:HIGH")) return "HIGH";
        if (aiResult.contains("위험도: MEDIUM") || aiResult.contains("위험도:MEDIUM")) return "MEDIUM";
        if (aiResult.contains("위험도: LOW") || aiResult.contains("위험도:LOW")) return "LOW";
        if (aiResult.contains("위험도: SAFE") || aiResult.contains("위험도:SAFE")) return "SAFE";
        // 폴백: 단어 자체로 판단
        String upper = aiResult.toUpperCase();
        if (upper.contains("CRITICAL")) return "CRITICAL";
        if (upper.contains("HIGH")) return "HIGH";
        if (upper.contains("SAFE")) return "SAFE";
        if (upper.contains("LOW")) return "LOW";
        return "MEDIUM";
    }

    // 4. [기존 기능] 평가 통계 계산해서 가져오기
    public Map<String, Object> getEvaluationStats() {
        long totalCount = urlAnalysisRepository.count();
        long helpfulCount = urlAnalysisRepository.countByIsHelpful(true);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAnalyses", totalCount);
        stats.put("helpfulCount", helpfulCount);
        stats.put("satisfactionRate", totalCount > 0 ? (double) helpfulCount / totalCount * 100 : 0);

        return stats;
    }
}