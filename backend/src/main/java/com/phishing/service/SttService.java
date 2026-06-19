package com.phishing.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
public class SttService {

    @Value("${naver.stt.client.id}")
    private String CLIENT_ID;
    @Value("${naver.stt.client.secret}")
    private String CLIENT_SECRET;

    private static final int CHUNK_SECONDS = 50; // 네이버 STT 제한 60초보다 여유있게 50초

    // 외부에서 호출하는 메인 메서드 - 자동 분할 후 STT 변환
    public String transcribeAudio(MultipartFile file) {
        Path tempDir = null;
        try {
            // 1. 임시 디렉토리에 업로드 파일 저장
            tempDir = Files.createTempDirectory("stt_");
            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "audio.mp3";
            String ext = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf(".")) : ".mp3";
            Path inputPath = tempDir.resolve("input" + ext);
            file.transferTo(inputPath.toFile());

            // 2. FFmpeg로 50초 단위 분할
            List<File> chunks = splitAudio(inputPath.toFile(), tempDir, ext);

            // 3. 분할 없이 한 조각이면 그냥 바로 STT
            if (chunks.size() == 1) {
                return callNaverStt(Files.readAllBytes(chunks.get(0).toPath()));
            }

            // 4. 각 조각 STT 변환 후 합치기
            StringBuilder result = new StringBuilder();
            for (File chunk : chunks) {
                String text = callNaverStt(Files.readAllBytes(chunk.toPath()));
                if (text != null && !text.isBlank()) {
                    if (result.length() > 0) result.append(" ");
                    result.append(text);
                }
            }
            return result.length() > 0 ? result.toString() : "음성에서 텍스트를 추출할 수 없습니다.";

        } catch (Exception e) {
            e.printStackTrace();
            return "음성 분석 중 오류가 발생했습니다: " + e.getMessage();
        } finally {
            // 5. 임시 파일 정리
            if (tempDir != null) deleteTempDir(tempDir.toFile());
        }
    }

    // FFmpeg로 오디오를 CHUNK_SECONDS 단위로 분할
    private List<File> splitAudio(File input, Path tempDir, String ext) throws Exception {
        String outputPattern = tempDir.resolve("chunk_%03d" + ext).toString();

        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg", "-i", input.getAbsolutePath(),
                "-f", "segment",
                "-segment_time", String.valueOf(CHUNK_SECONDS),
                "-c", "copy",
                "-y",
                outputPattern
        );
        pb.redirectErrorStream(true);
        Process process = pb.start();
        process.waitFor();

        // 생성된 chunk 파일들을 이름순으로 정렬해서 반환
        File[] chunks = tempDir.toFile().listFiles(f -> f.getName().startsWith("chunk_"));
        if (chunks == null || chunks.length == 0) {
            // FFmpeg 분할 실패 시 원본 파일 그대로 사용
            return List.of(input);
        }
        Arrays.sort(chunks, Comparator.comparing(File::getName));
        return new ArrayList<>(Arrays.asList(chunks));
    }

    // 네이버 STT API 호출
    private String callNaverStt(byte[] audioBytes) {
        try {
            String apiUrl = "https://naveropenapi.apigw.ntruss.com/recog/v1/stt?lang=Kor";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.set("X-NCP-APIGW-API-KEY-ID", CLIENT_ID);
            headers.set("X-NCP-APIGW-API-KEY", CLIENT_SECRET);

            HttpEntity<byte[]> requestEntity = new HttpEntity<>(audioBytes, headers);
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, requestEntity, Map.class);

            return (String) response.getBody().get("text");

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            if (e.getStatusCode().value() == 413) {
                return ""; // 분할했는데도 크면 해당 조각은 스킵
            }
            e.printStackTrace();
            return "";
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    // 임시 디렉토리 전체 삭제
    private void deleteTempDir(File dir) {
        File[] files = dir.listFiles();
        if (files != null) {
            for (File f : files) f.delete();
        }
        dir.delete();
    }
}
