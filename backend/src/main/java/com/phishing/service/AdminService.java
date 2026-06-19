package com.phishing.service;

import com.phishing.config.JwtUtil;
import com.phishing.domain.Admin;
import com.phishing.domain.PhoneReport;
import com.phishing.domain.User;
import com.phishing.dto.AdminDto;
import com.phishing.repository.AdminRepository;
import com.phishing.repository.PhoneReportRepository;
import com.phishing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// 🌟 수정 1: 옛날 UrlAnalysis 대신 우리가 새로 만든 AnalysisHistory를 불러옵니다!
import com.phishing.domain.AnalysisHistory;
import com.phishing.repository.UrlAnalysisRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PhoneReportRepository phoneReportRepository;
    private final UserRepository userRepository;
    private final UrlAnalysisRepository urlAnalysisRepository;

    // 관리자 로그인
    public AdminDto.LoginResponse login(AdminDto.LoginRequest request) {
        Admin admin = adminRepository.findByAdminId(request.getAdminId())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 틀렸습니다"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 틀렸습니다");
        }

        String accessToken = jwtUtil.generateToken(admin.getId(), "ADMIN");
        return new AdminDto.LoginResponse(accessToken, admin.getAdminId());
    }

    // 전체 신고 목록 조회
    @Transactional(readOnly = true)
    public List<AdminDto.ReportListResponse> getAllReports() {
        List<PhoneReport> reports = phoneReportRepository.findAll();
        return reports.stream()
                .map(r -> new AdminDto.ReportListResponse(
                        r.getPhoneNumber(),
                        r.getReportCount(),
                        r.getRiskLevel(),
                        r.getCreatedAt(),
                        r.getUpdatedAt()
                ))
                .collect(Collectors.toList());
    }

    // 전체 유저 목록 조회
    @Transactional(readOnly = true)
    public List<AdminDto.UserListResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(u -> new AdminDto.UserListResponse(
                        u.getId(),
                        u.getEmail(),
                        u.getNickname(),
                        u.getCreatedAt()
                ))
                .collect(Collectors.toList());

    }

    // URL 분석 전체 조회 (통합 분석 내역 조회)
    @Transactional(readOnly = true)
    public List<AdminDto.UrlListResponse> getAllUrls() {
        // 🌟 수정 2: UrlAnalysis 대신 AnalysisHistory로 받습니다.
        List<AnalysisHistory> urls = urlAnalysisRepository.findAll();

        return urls.stream()
                .map(u -> new AdminDto.UrlListResponse(
                        u.getId(),
                        u.getUserId(),
                        u.getTarget(),     // 🌟 수정 3: getUrl() ➔ getTarget()으로 변경
                        u.isMalicious(),
                        u.getDetails(),
                        u.getAnalyzedAt()  // 🌟 수정 4: getTimestamp() ➔ getAnalyzedAt()으로 변경
                ))
                .collect(Collectors.toList());
    }
}