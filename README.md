## 📂 프로젝트 구조 (Project Structure)

본 프로젝트는 Spring Boot 기반의 백엔드와 React 기반의 프론트엔드로 구성된 모노레포(Monorepo) 형식 또는 단일 디렉터리 구조를 가집니다.

```text
safeguard-ai/
├── safeguard-backend/              # Spring Boot (Java) 프로젝트 root
│   ├── src/main/java/com/safeguard/
│   │   ├── global/                 # 공통 설정 (Security, Filter, Exception Handler)
│   │   └── domain/                 # 비즈니스 도메인별 패키지
│   │       ├── diagnosis/          # 진단 (URL, OCR, STT 분석)
│   │       │   ├── controller/     # API 엔드포인트
│   │       │   ├── service/        # 비즈니스 로직
│   │       │   ├── repository/     # DB 접근 (JPA/Querydsl)
│   │       │   ├── dto/            # 데이터 전송 객체 (PhishingAnalysisResult.java)
│   │       │   └── entity/         # DB 엔티티 (DiagnosisHistory.java)
│   │       ├── chatbot/            # 챗봇 상담 로직
│   │       ├── filter/             # 필터링/차단 관리
│   │       └── member/             # 사용자/마이페이지
│   └── src/main/resources/         # application.yml, 정적 리소스
│
├── safeguard-frontend/             # React 프로젝트 root
│   ├── public/                     # 정적 파일 (favicon, index.html)
│   └── src/
│       ├── api/                    # Axios/Fetch 등 백엔드 통신 모듈
│       ├── components/             # 공통 컴포넌트 (Layout, Button, Modal)
│       │   ├── common/             # 공통 UI
│       │   └── diagnosis/          # 진단 결과 카드, 게이지 차트 등
│       ├── pages/                  # 페이지 단위 컴포넌트
│       │   ├── Home.jsx            # 메인 홈 화면
│       │   ├── DiagnosisResult.jsx # AI 진단 결과 화면
│       │   ├── Chatbot.jsx         # 챗봇 상담 화면
│       │   └── MyPage.jsx          # 마이페이지
│       ├── hooks/                  # 커스텀 훅 (useChat, useAuth 등)
│       ├── store/                  # 전역 상태 관리 (Redux, Recoil, Zustand 등)
│       └── styles/                 # Tailwind CSS 또는 CSS Modules
│
└── docs/                           # 설계 문서 및 Mermaid 파일
