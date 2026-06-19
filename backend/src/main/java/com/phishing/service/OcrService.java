package com.phishing.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OcrService {

    // ⭐ 방금 복사하신 구글 API 키를 여기에 넣어주세요!
    @Value("${google.vision.api.key}")
    private String GOOGLE_API_KEY;

    public String extractTextFromImage(MultipartFile file) {
        try {
            // 1. 이미지를 구글이 읽을 수 있는 Base64 암호문으로 변환
            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
            String apiUrl = "https://vision.googleapis.com/v1/images:annotate?key=" + GOOGLE_API_KEY;

            // 2. 구글에게 "이 사진에서 글자(TEXT_DETECTION) 좀 찾아줘!" 라고 요청서 작성
            Map<String, Object> request = new HashMap<>();
            Map<String, Object> image = new HashMap<>();
            image.put("content", base64Image);

            Map<String, Object> feature = new HashMap<>();
            feature.put("type", "TEXT_DETECTION"); // 글자 인식 모드 켜기!

            Map<String, Object> requestItem = new HashMap<>();
            requestItem.put("image", image);
            requestItem.put("features", new Object[]{feature});

            request.put("requests", new Object[]{requestItem});

            // 3. 구글에 전송! (우체부 역할)
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, Map.class);

            // 4. 받아온 결과물에서 진짜 '글자'만 쏙 뽑아내기
            Map<String, Object> body = response.getBody();
            List<Map<String, Object>> responses = (List<Map<String, Object>>) body.get("responses");

            // 만약 사진에 글자가 아예 없다면? 방어 로직!
            if (responses.isEmpty() || !responses.get(0).containsKey("fullTextAnnotation")) {
                return "사진에서 인식된 글자가 없습니다.";
            }

            Map<String, Object> fullTextAnnotation = (Map<String, Object>) responses.get(0).get("fullTextAnnotation");
            return (String) fullTextAnnotation.get("text");

        } catch (Exception e) {
            e.printStackTrace();
            return "이미지 분석 중 오류가 발생했습니다. API 키를 확인해주세요!";
        }
    }
}