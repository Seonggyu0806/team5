package com.phishing.controller;

import com.phishing.dto.AdminDto;
import com.phishing.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "관리자 API", description = "관리자 로그인, 로그아웃, 전체 조회")
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/login")
    @Operation(summary = "관리자 로그인", description = "관리자 계정으로 로그인합니다")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AdminDto.LoginRequest request) {
        AdminDto.LoginResponse response = adminService.login(request);
        return ResponseEntity.ok(success("로그인 성공했습니다", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "관리자 로그아웃", description = "관리자 계정에서 로그아웃합니다")
    public ResponseEntity<Map<String, Object>> logout() {
        return ResponseEntity.ok(success("로그아웃 되었습니다", null));
    }

    @GetMapping("/reports")
    @Operation(summary = "전체 신고 목록 조회", description = "모든 전화번호 신고 내역을 조회합니다")
    public ResponseEntity<Map<String, Object>> getAllReports() {
        List<AdminDto.ReportListResponse> response = adminService.getAllReports();
        return ResponseEntity.ok(success("성공했습니다", response));
    }

    @GetMapping("/users")
    @Operation(summary = "전체 유저 목록 조회", description = "가입된 모든 유저를 조회합니다")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        List<AdminDto.UserListResponse> response = adminService.getAllUsers();
        return ResponseEntity.ok(success("성공했습니다", response));
    }

    @GetMapping("/urls")
    @Operation(summary = "전체 URL 분석 목록 조회", description = "모든 URL 분석 내역을 조회합니다")
    public ResponseEntity<Map<String, Object>> getAllUrls() {
        List<AdminDto.UrlListResponse> response = adminService.getAllUrls();
        return ResponseEntity.ok(success("성공했습니다", response));
    }

    private Map<String, Object> success(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return response;
    }
}