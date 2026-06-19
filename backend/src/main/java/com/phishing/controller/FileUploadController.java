package com.phishing.controller;

import com.phishing.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    // 파일을 받는 API (POST 방식, 파라미터 이름은 'file')
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        String savedFileName = fileStorageService.storeFile(file);
        return ResponseEntity.ok("✅ 파일 저장 성공! 저장된 이름: " + savedFileName);
    }
}
