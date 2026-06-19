package com.phishing.controller;

import com.phishing.dto.UserDto;
import com.phishing.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import org.springframework.security.core.context.SecurityContextHolder;
@RestController                         // JSON 응답을 반환하는 Controller
@RequestMapping("/api/v1/users")        // 기본 URL 경로
@RequiredArgsConstructor                // final 필드 생성자 자동 생성
@Tag(name = "회원 API", description = "회원가입, 로그인, 로그아웃, 내 정보 조회, 회원 탈퇴")
// Swagger에서 보여줄 그룹 이름과 설명
public class UserController {

    private final UserService userService;  // 비즈니스 로직 처리용

    @PostMapping                            // POST /api/v1/users
    @Operation(summary = "회원가입", description = "이메일과 비밀번호로 회원가입합니다")
    // Swagger에서 보여줄 API 설명
    public ResponseEntity<Map<String, Object>> join(@RequestBody UserDto.JoinRequest request) {
        // @RequestBody = 요청 바디의 JSON을 JoinRequest 객체로 변환
        // ResponseEntity = HTTP 상태 코드와 응답 바디를 함께 반환

        UserDto.JoinResponse response = userService.join(request);
        return ResponseEntity.ok(success("회원가입이 완료되었습니다", response));
    }

    @PostMapping("/login")                  // POST /api/v1/users/login
    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인합니다")
    public ResponseEntity<Map<String, Object>> login(@RequestBody UserDto.LoginRequest request) {

        UserDto.LoginResponse response = userService.login(request);
        return ResponseEntity.ok(success("로그인 성공했습니다", response));
    }

    @PostMapping("/logout")                 // POST /api/v1/users/logout
    @Operation(summary = "로그아웃", description = "로그아웃합니다")
    public ResponseEntity<Map<String, Object>> logout() {
        // JWT는 서버에서 토큰 삭제 불가
        // 클라이언트에서 토큰 삭제하면 됨
        return ResponseEntity.ok(success("로그아웃 되었습니다", null));
    }

    @GetMapping("/me")                      // GET /api/v1/users/me
    @Operation(summary = "내 정보 조회", description = "로그인한 회원의 정보를 조회합니다")
    public ResponseEntity<Map<String, Object>> getMyInfo() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        UserDto.MyInfoResponse response = userService.getMyInfo(userId);
        return ResponseEntity.ok(success("성공했습니다", response));
    }

    @DeleteMapping("/me")                   // DELETE /api/v1/users/me
    @Operation(summary = "회원 탈퇴", description = "회원 탈퇴를 처리합니다")
    public ResponseEntity<Map<String, Object>> withdraw(@RequestBody UserDto.WithdrawRequest request) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal(); // JWT 필터에서 저장한 userId 꺼내오기

        userService.withdraw(userId, request);
        return ResponseEntity.ok(success("회원 탈퇴가 완료되었습니다", null));
    }

    // 공통 응답 형식 생성 메서드
    // { "success": true, "message": "...", "data": ... }
    private Map<String, Object> success(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return response;
    }
}