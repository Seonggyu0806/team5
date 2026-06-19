package com.phishing.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

public class UserDto {
    // UserDto 안에 여러 DTO를 static class로 묶어서 관리
    // 관련된 DTO끼리 한 파일에 모아두면 관리가 편함

    @Getter                         // getter 자동 생성
    @NoArgsConstructor              // 빈 생성자 자동 생성
    public static class JoinRequest {
        // 회원가입 요청 DTO
        // POST /api/v1/users 요청 바디

        private String email;       // 이메일
        private String password;    // 비밀번호
        private String nickname;    // 닉네임
    }

    @Getter
    @NoArgsConstructor
    public static class LoginRequest {
        // 로그인 요청 DTO
        // POST /api/v1/users/login 요청 바디

        private String email;       // 이메일
        private String password;    // 비밀번호
    }

    @Getter
    @NoArgsConstructor
    public static class LoginResponse {
        // 로그인 응답 DTO
        // 로그인 성공시 반환

        private String accessToken; // JWT 토큰
        private String email;       // 이메일
        private String nickname;    // 닉네임

        public LoginResponse(String accessToken, String email, String nickname) {
            // 생성자 - 응답 객체 만들 때 사용
            this.accessToken = accessToken;
            this.email = email;
            this.nickname = nickname;
        }
    }

    @Getter
    @NoArgsConstructor
    public static class JoinResponse {
        // 회원가입 응답 DTO

        private String email;           // 가입한 이메일
        private String nickname;        // 닉네임
        private LocalDateTime createdAt; // 가입 시간

        public JoinResponse(String email, String nickname, LocalDateTime createdAt) {
            this.email = email;
            this.nickname = nickname;
            this.createdAt = createdAt;
        }
    }

    @Getter
    @NoArgsConstructor
    public static class MyInfoResponse {
        // 내 정보 조회 응답 DTO
        // GET /api/v1/users/me 응답

        private String email;            // 이메일
        private String nickname;         // 닉네임
        private LocalDateTime createdAt; // 가입 시간

        public MyInfoResponse(String email, String nickname, LocalDateTime createdAt) {
            this.email = email;
            this.nickname = nickname;
            this.createdAt = createdAt;
        }
    }

    @Getter
    @NoArgsConstructor
    public static class WithdrawRequest {
        // 회원 탈퇴 요청 DTO
        // DELETE /api/v1/users/me 요청 바디

        private String password;    // 본인 확인용 비밀번호
    }
}