package com.phishing.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    // 프로젝트 폴더 안에 'uploads' 라는 폴더를 만들어서 저장할게요!
    private final String uploadDir = System.getProperty("user.dir") + "/uploads/";

    public String storeFile(MultipartFile file) {
        try {
            // 1. uploads 폴더가 없으면 자동으로 만들기
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // 2. 파일 이름 겹치지 않게 고유한 이름(UUID) 붙여주기
            // (예: 강아지.jpg -> 123e4567-e89b..._강아지.jpg)
            String originalFileName = file.getOriginalFilename();
            String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;

            // 3. 파일 저장 경로 설정 및 진짜로 복사해서 저장하기!
            Path targetLocation = Paths.get(uploadDir + uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation);

            return uniqueFileName; // 저장 성공하면 파일 이름을 반환!

        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패! 다시 시도해주세요.", e);
        }
    }
}
