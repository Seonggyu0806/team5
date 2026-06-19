package com.phishing.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenAiService {

    @Value("${openai.api.key}")
    private String OPENAI_API_KEY;
    private static final String API_URL = "https://api.openai.com/v1/chat/completions";
    private final RestTemplate restTemplate = new RestTemplate();

    // URL 피싱 분석
    public String analyzeUrl(String url) {
        String system = """
                당신은 사이버 보안 전문가입니다. 주어진 URL이 피싱·악성 사이트인지 분석합니다.

                【중요 원칙】
                - google.com, naver.com, kakao.com, youtube.com, apple.com, microsoft.com, samsung.com, gov.kr 등
                  전 세계적으로 공인된 도메인은 반드시 SAFE로 판정하세요.
                - HTTPS를 사용하는 공식 도메인은 기본적으로 안전합니다.
                - URL에 https://가 있으면 "HTTPS 미사용"이라고 절대 쓰지 마세요.

                반드시 아래 항목을 분석하세요:
                1. 도메인 신뢰도 (공식 기관 도메인 여부, 오타 도메인 여부)
                2. URL 구조 이상 여부 (과도한 서브도메인, 특수문자, 무작위 문자열)
                3. 의심 키워드 포함 여부 (login, verify, secure, account, update 등)
                4. 단축 URL 또는 IP 직접 접근 여부

                【절대 규칙】 사용자 메시지에서 HTTPS 사용 여부를 이미 알려줍니다. 그 정보를 그대로 따르세요. 절대 HTTPS 관련 판단을 스스로 하지 마세요.

                위험도는 반드시 첫 줄에 "위험도: SAFE" / "위험도: LOW" / "위험도: MEDIUM" / "위험도: HIGH" / "위험도: CRITICAL" 형식으로 명시하세요.
                판정 근거를 2~4줄로 설명하고, 마지막에 권고 행동을 한 줄로 알려주세요.
                """;
        boolean isHttps = url.startsWith("https://");
        String user = "분석할 URL: " + url + "\n[참고] 이 URL은 " + (isHttps ? "HTTPS를 사용 중입니다. HTTPS 미사용 관련 언급을 하지 마세요." : "HTTPS를 사용하지 않습니다.");
        return call(system, user);
    }

    // 이미지(스미싱 문자) 분석
    public String analyzeImage(String extractedText) {
        String system = """
                당신은 스미싱·피싱 문자 탐지 전문가입니다. 이미지에서 추출된 텍스트를 분석합니다.

                반드시 아래 항목을 분석하세요:
                1. 발신자 위장 여부 (은행, 검찰, 국세청, 택배사 등 공공기관 사칭)
                2. 긴급성·공포 조장 표현 (계좌 정지, 즉시 클릭, 선착순 등)
                3. 악성 링크 유도 여부 (URL 클릭, 앱 설치 유도)
                4. 개인정보·금전 요구 여부
                5. 비정상적 문법·맞춤법 오류

                위험도는 SAFE / LOW / MEDIUM / HIGH / CRITICAL 중 하나로 판정하고,
                주요 의심 근거를 2~4줄로 설명하세요.
                마지막에 피싱 종류(스미싱/파밍/피싱/보이스피싱/정상)를 명시하세요.
                """;
        String user = "분석할 문자 내용:\n" + extractedText;
        return call(system, user);
    }

    // 음성(보이스피싱) 분석
    public String analyzeVoice(String transcript) {
        String system = """
                당신은 보이스피싱 탐지 전문가입니다. 통화 녹음에서 변환된 텍스트를 분석합니다.

                반드시 아래 항목을 분석하세요:
                1. 공공기관·금융기관 사칭 여부 (검찰, 경찰, 금감원, 은행 등)
                2. 계좌이체·현금 요구 여부
                3. 개인정보(주민번호, 계좌번호, 비밀번호) 요구 여부
                4. 심리적 압박·협박 표현 (수사, 체포, 명의도용, 즉시 등)
                5. 특정 앱 설치 또는 원격 제어 유도 여부

                위험도는 SAFE / LOW / MEDIUM / HIGH / CRITICAL 중 하나로 판정하고,
                주요 의심 근거를 2~4줄로 설명하세요.
                마지막에 피해 예방을 위한 구체적 행동 지침을 한 줄로 알려주세요.
                """;
        String user = "분석할 통화 내용:\n" + transcript;
        return call(system, user);
    }

    // 채팅 상담 (기존 호환용)
    public String analyzePhishing(String input) {
        String system = """
                당신은 피싱·사기 피해 예방 상담 전문가입니다.
                사용자의 질문이나 의심 내용에 대해 친절하고 명확하게 답변하세요.
                위험 여부와 대처 방법을 구체적으로 안내해 주세요.
                """;
        return call(system, input);
    }

    private String call(String systemPrompt, String userPrompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(OPENAI_API_KEY);

            Map<String, Object> body = new HashMap<>();
            body.put("model", "gpt-4o-mini");

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            messages.add(Map.of("role", "user", "content", userPrompt));

            body.put("messages", messages);
            body.put("temperature", 0.2);
            body.put("max_tokens", 500);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(API_URL, request, Map.class);

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");

        } catch (Exception e) {
            e.printStackTrace();
            return "AI 분석 중 오류가 발생했습니다: " + e.getMessage();
        }
    }
}