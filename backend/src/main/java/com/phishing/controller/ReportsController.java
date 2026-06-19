package com.phishing.controller;

import com.phishing.dto.ReportsDto;
import com.phishing.service.ReportsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController                         // JSON 응답을 반환하는 Controller
@RequestMapping("/api/v1/reports")      // 기본 URL 경로
@RequiredArgsConstructor                // final 필드 생성자 자동 생성
@Tag(name = "신고 API", description = "전화번호 신고, 조회, 순위, 내 신고 이력")
public class ReportsController {

    private final ReportsService reportsService;    // 비즈니스 로직 처리용

    @PostMapping("/phone")                          // POST /api/v1/reports/phone
    @Operation(summary = "전화번호 신고", description = "피싱 의심 전화번호를 신고합니다")
    public ResponseEntity<Map<String, Object>> report(@RequestBody ReportsDto.ReportRequest request) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        ReportsDto.ReportResponse response = reportsService.report(userId, request);
        return ResponseEntity.ok(success("성공했습니다", response));
    }

    @GetMapping("/phone/{phoneNumber}")             // GET /api/v1/reports/phone/{phoneNumber}
    @Operation(summary = "전화번호 조회", description = "전화번호의 피싱 신고 이력을 조회합니다")
    public ResponseEntity<Map<String, Object>> getPhoneInfo(@PathVariable String phoneNumber) {
        // @PathVariable = URL 경로의 {phoneNumber} 값을 가져옴

        ReportsDto.PhoneInfoResponse response = reportsService.getPhoneInfo(phoneNumber);
        return ResponseEntity.ok(success("성공했습니다", response));
    }

    @GetMapping("/ranking")                         // GET /api/v1/reports/ranking
    @Operation(summary = "7일 신고 순위", description = "최근 7일간 신고 누적 순위 상위 10개를 조회합니다")
    public ResponseEntity<Map<String, Object>> getRanking() {

        List<ReportsDto.RankingResponse> response = reportsService.getRanking();
        return ResponseEntity.ok(success("성공했습니다", response));
    }

    @GetMapping("/my")                              // GET /api/v1/reports/my
    @Operation(summary = "내 신고 이력", description = "내가 신고한 전화번호 이력을 조회합니다")
    public ResponseEntity<Map<String, Object>> getMyReports() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        List<ReportsDto.MyReportResponse> response = reportsService.getMyReports(userId);
        return ResponseEntity.ok(success("성공했습니다", response));
    }

    // 공통 응답 형식 생성 메서드
    private Map<String, Object> success(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return response;
    }
}