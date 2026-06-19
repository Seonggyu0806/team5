package com.phishing.service;

import com.phishing.domain.PhoneReport;
import com.phishing.domain.PhoneReportLog;
import com.phishing.domain.User;
import com.phishing.dto.ReportsDto;
import com.phishing.repository.PhoneReportLogRepository;
import com.phishing.repository.PhoneReportRepository;
import com.phishing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service                        // 이 클래스가 Service 역할임을 표시
@RequiredArgsConstructor        // final 필드 생성자 자동 생성
@Transactional                  // DB 작업 중 오류 나면 자동으로 롤백
public class ReportsService {

    private final PhoneReportRepository phoneReportRepository;      // 전화번호 신고 집계 DB 접근용
    private final PhoneReportLogRepository phoneReportLogRepository; // 신고 내역 DB 접근용
    private final UserRepository userRepository;                     // 유저 DB 접근용

    private String normalizePhone(String phone) {
        if (phone == null) return "";
        return phone.replaceAll("[^0-9]", "");
    }

    // 전화번호 신고
    public ReportsDto.ReportResponse report(Long userId, ReportsDto.ReportRequest request) {

        // 신고한 유저 찾기
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다"));

        String normalized = normalizePhone(request.getNumber());

        // 중복 신고 확인
        PhoneReport phoneReport;
        if (phoneReportRepository.existsByPhoneNumber(normalized)) {
            // 이미 신고된 번호면 기존 데이터 가져오기
            phoneReport = phoneReportRepository.findByPhoneNumber(normalized)
                    .orElseThrow();
        } else {
            // 처음 신고된 번호면 새로 생성
            phoneReport = new PhoneReport(normalized);
            phoneReportRepository.save(phoneReport);
        }

        // 같은 유저가 같은 번호 중복 신고 방지
        if (phoneReportLogRepository.existsByUserAndPhoneReport(user, phoneReport)) {
            return new ReportsDto.ReportResponse(
                    phoneReport.getPhoneNumber(),
                    phoneReport.getReportCount(),
                    "이미 신고한 번호입니다",
                    true
            );
        }

        // 신고 로그 저장
        PhoneReportLog log = new PhoneReportLog(user, phoneReport);
        phoneReportLogRepository.save(log);

        // 신고 횟수 증가 및 위험 등급 업데이트
        phoneReport.increaseReportCount();
        phoneReportRepository.save(phoneReport);

        return new ReportsDto.ReportResponse(
                phoneReport.getPhoneNumber(),
                phoneReport.getReportCount(),
                "신고가 접수되었습니다",
                false
        );
    }

    // 전화번호 조회
    @Transactional(readOnly = true)     // 읽기 전용 트랜잭션
    public ReportsDto.PhoneInfoResponse getPhoneInfo(String phoneNumber) {

        phoneNumber = normalizePhone(phoneNumber);

        // 신고 이력 없으면 UNKNOWN 반환
        if (!phoneReportRepository.existsByPhoneNumber(phoneNumber)) {
            return new ReportsDto.PhoneInfoResponse(
                    phoneNumber,
                    0,
                    "UNKNOWN",
                    "신고 이력이 없는 번호입니다. 피싱 번호로 의심되면 신고해주세요."
            );
        }

        PhoneReport phoneReport = phoneReportRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow();

        // 위험도별 메시지 생성
        String message;
        switch (phoneReport.getRiskLevel()) {
            case "LOW"      -> message = phoneReport.getReportCount() + "건 신고된 번호입니다. 주의하세요.";
            case "MEDIUM"   -> message = phoneReport.getReportCount() + "건 신고된 번호입니다. 피싱 가능성이 있습니다.";
            case "HIGH"     -> message = phoneReport.getReportCount() + "건 신고된 번호입니다. 피싱 위험이 높습니다.";
            case "CRITICAL" -> message = phoneReport.getReportCount() + "건 신고된 번호입니다. 매우 위험한 번호입니다.";
            default         -> message = phoneReport.getReportCount() + "건 신고된 번호입니다.";
        }

        return new ReportsDto.PhoneInfoResponse(
                phoneReport.getPhoneNumber(),
                phoneReport.getReportCount(),
                phoneReport.getRiskLevel(),
                message
        );
    }

    // 7일 신고 순위
    @Transactional(readOnly = true)
    public List<ReportsDto.RankingResponse> getRanking() {

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7); // 7일 전 시간
        List<Object[]> results = phoneReportLogRepository.findTop10RankingInLast7Days(sevenDaysAgo);

        List<ReportsDto.RankingResponse> ranking = new ArrayList<>();
        for (int i = 0; i < results.size(); i++) {
            Object[] row = results.get(i);
            ranking.add(new ReportsDto.RankingResponse(
                    i + 1,                          // 순위
                    (String) row[0],                // 전화번호
                    (Long) row[1]                   // 신고 횟수
            ));
        }
        return ranking;
    }

    // 내 신고 이력 조회
    @Transactional(readOnly = true)
    public List<ReportsDto.MyReportResponse> getMyReports(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다"));

        List<PhoneReportLog> logs = phoneReportLogRepository.findByUser(user);

        List<ReportsDto.MyReportResponse> myReports = new ArrayList<>();
        for (PhoneReportLog log : logs) {
            PhoneReport phoneReport = log.getPhoneReport();
            myReports.add(new ReportsDto.MyReportResponse(
                    phoneReport.getPhoneNumber(),
                    phoneReport.getReportCount(),
                    phoneReport.getRiskLevel(),
                    log.getCreatedAt()
            ));
        }
        return myReports;
    }
}