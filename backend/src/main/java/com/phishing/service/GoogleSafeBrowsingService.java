package com.phishing.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Service
public class GoogleSafeBrowsingService {

    // application.properties 에 적힌 구글 API 키를 가져옵니다.
    @Value("${google.safebrowsing.api.key}")
    private String apiKey;

    public boolean isMaliciousUrl(String targetUrl) {
        String apiUrl = "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + apiKey;
        RestTemplate restTemplate = new RestTemplate();

        // 1. 구글이 요구하는 JSON 형태로 데이터 포장하기
        Map<String, Object> requestBody = new HashMap<>();

        Map<String, Object> client = new HashMap<>();
        client.put("clientId", "donkimi-capstone");
        client.put("clientVersion", "1.0.0");

        Map<String, Object> threatInfo = new HashMap<>();
        threatInfo.put("threatTypes", Arrays.asList("MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"));
        threatInfo.put("platformTypes", Arrays.asList("ANY_PLATFORM"));
        threatInfo.put("threatEntryTypes", Arrays.asList("URL"));

        Map<String, String> urlEntry = new HashMap<>();
        urlEntry.put("url", targetUrl);
        threatInfo.put("threatEntries", Arrays.asList(urlEntry));

        requestBody.put("client", client);
        requestBody.put("threatInfo", threatInfo);

        try {
            // 2. 구글에 물어보기 (POST 요청)
            Map response = restTemplate.postForObject(apiUrl, requestBody, Map.class);

            // 3. 구글 응답에 "matches"가 있으면 악성 URL이라는 뜻! (true 반환)
            return response != null && response.containsKey("matches");

        } catch (Exception e) {
            System.err.println("🚨 구글 API 호출 에러: " + e.getMessage());
            // 에러가 나면 일단 안전하다고 치고 AI가 검사할 수 있게 false 반환
            return false;
        }
    }
}