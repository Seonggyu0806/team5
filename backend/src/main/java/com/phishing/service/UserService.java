package com.phishing.service;

import com.phishing.config.JwtUtil;
import com.phishing.domain.User;
import com.phishing.dto.UserDto;
import com.phishing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service                        // 이 클래스가 Service 역할임을 표시
// Spring이 자동으로 Bean으로 등록해줌
@RequiredArgsConstructor        // final 필드 생성자 자동 생성 (의존성 주입용)
@Transactional                  // DB 작업 중 오류 나면 자동으로 롤백
public class UserService {

    private final UserRepository userRepository;    // DB 접근용
    private final PasswordEncoder passwordEncoder;  // 비밀번호 암호화용
    private final JwtUtil jwtUtil;  // JWT 토큰 생성용

    // 회원가입
    public UserDto.JoinResponse join(UserDto.JoinRequest request) {

        // 이메일 중복 확인
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용중인 이메일입니다");
            // 중복이면 예외 발생 → 400 에러 반환
        }

        // User 객체 생성 및 저장
        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()), // 비밀번호 암호화
                request.getNickname()
        );
        userRepository.save(user);  // DB에 저장

        // 응답 객체 반환
        return new UserDto.JoinResponse(
                user.getEmail(),
                user.getNickname(),
                user.getCreatedAt()
        );
    }

    // 로그인
    public UserDto.LoginResponse login(UserDto.LoginRequest request) {

        // 이메일로 유저 찾기
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 틀렸습니다"));
        // 없으면 예외 발생

        // 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 틀렸습니다");
            // 비밀번호 틀리면 예외 발생
        }

        // JWT 토큰 생성
        String accessToken = jwtUtil.generateToken(user.getId(), "USER");

        return new UserDto.LoginResponse(accessToken, user.getEmail(), user.getNickname());
    }

    // 내 정보 조회
    @Transactional(readOnly = true) // 읽기 전용 트랜잭션 (성능 최적화)
    public UserDto.MyInfoResponse getMyInfo(Long userId) {

        // userId로 유저 찾기
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다"));

        return new UserDto.MyInfoResponse(
                user.getEmail(),
                user.getNickname(),
                user.getCreatedAt()
        );
    }

    // 회원 탈퇴
    public void withdraw(Long userId, UserDto.WithdrawRequest request) {

        // userId로 유저 찾기
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다"));

        // 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 틀렸습니다");
        }

        userRepository.delete(user);    // DB에서 삭제
    }
}