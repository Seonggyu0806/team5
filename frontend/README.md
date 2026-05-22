# 돈킴이 (Donkimi) - 보이스피싱 탐지 서비스

> "당신의 소중한 돈을 지킵니다"

---

## 프로젝트 소개

**돈킴이**는 날로 증가하는 보이스피싱·스미싱 피해로부터 사용자를 보호하기 위해 만든 AI 기반 사기 탐지 서비스입니다.

전화번호, URL, 음성 파일, 이미지를 업로드하면 AI가 즉시 위험도를 분석하고, AI 챗봇 상담을 통해 피싱 여부를 쉽게 판단할 수 있습니다. 금융 사기에 취약한 고령층부터 바쁜 직장인까지, 누구나 빠르고 간편하게 사기 피해를 예방할 수 있도록 설계했습니다.

---

## 만든 이유

- **다양한 입력 방식 지원**: URL, 전화번호, 음성, 이미지를 한 곳에서 분석
- **AI 챗봇 상담**: 의심스러운 상황을 직접 대화하며 판단할 수 있는 환경 제공
- **낮은 진입 장벽**: 누구나 직관적으로 사용할 수 있는 모바일 친화적 UI
- **커뮤니티 신고 시스템**: 사용자가 직접 위험 번호를 신고해 DB를 함께 쌓아가는 구조

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | React 19 + TypeScript |
| 빌드 도구 | Vite 8 |
| 스타일링 | Tailwind CSS 4 |
| 상태 관리 | TanStack Query (React Query) |
| 폼 처리 | React Hook Form + Zod |
| HTTP 클라이언트 | Axios |
| 라우팅 | React Router DOM 7 |
| 차트 | Recharts |

---

## 주요 기능

### 1. URL 피싱 분석
의심스러운 링크를 붙여넣으면 AI가 피싱 사이트 여부를 즉시 판별합니다.

### 2. 전화번호 조회 및 신고
수상한 번호의 위험 등급과 신고 횟수를 즉시 조회하고, 직접 신고할 수 있습니다. 7일 신고 누적 순위, 내 신고 이력, 번호 차단/해제 기능을 제공합니다.

### 3. 음성 파일 분석
녹음된 보이스피싱 의심 통화를 업로드하면 AI가 음성 내용을 분석합니다.

### 4. 이미지 분석
스미싱 문자 캡처, 사기 계좌 화면 등 이미지를 분석해 위험 여부를 탐지합니다.

### 5. AI 챗봇 상담
상황을 직접 설명하면 AI가 피싱 여부를 판단하고 대응 방법을 안내합니다.

### 6. 신고 번호 TOP 5
최근 7일간 가장 많이 신고된 위험 번호 순위를 홈 화면 캐러셀에서 확인할 수 있습니다.
AI 분석 결과 HIGH/CRITICAL 등급이면 자동으로 신고 카운트에 반영됩니다.

### 7. 회원 관리
회원가입·로그인 이후 내 정보 조회, 비밀번호 확인을 통한 회원 탈퇴 기능을 제공합니다.

### 8. 관리자 페이지
서비스 운영자를 위한 전체 현황 모니터링 화면입니다.

---

## 프로젝트 구조

```
src/
├── api/                    # 백엔드 API 통신 함수 모음
│   ├── client.ts           # Axios 인스턴스, 토큰 자동 첨부, 401 처리
│   ├── auth.ts             # 회원가입 / 로그인 / 로그아웃 / 내 정보 조회 / 회원 탈퇴
│   ├── phishing.ts         # URL 피싱 분석 및 이력 조회
│   ├── number.ts           # 전화번호 조회 / 신고 / 7일 순위 / 내 신고 이력 / 차단
│   ├── chat.ts             # AI 챗봇 메시지 전송 / 대화 이력 / 솔루션 평가
│   ├── media.ts            # 음성 / 이미지 파일 분석
│   ├── dashboard.ts        # 통계 요약, 신고 순위, 일별 데이터
│   ├── admin.ts            # 관리자 로그인 / 로그아웃
│   └── mock/               # 백엔드 연동 전 사용하는 Mock 데이터 (store.ts: 공유 인메모리 스토어)
│
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx   # 로그인 상태에 따른 라우트 보호
│   ├── common/
│   │   └── RiskBadge.tsx        # 위험도 등급 표시 배지 (안전/주의/위험)
│   └── layout/
│       ├── Header.tsx           # 상단 헤더 (로고, 로그인 상태)
│       ├── BottomNav.tsx        # 하단 탭 내비게이션
│       └── MainLayout.tsx       # 전체 레이아웃 래퍼
│
├── contexts/
│   └── AuthContext.tsx      # 로그인 사용자 정보 전역 상태 관리
│
├── lib/
│   ├── utils.ts             # 공통 유틸 함수 (cn 클래스 병합 등)
│   ├── analysisHistory.ts   # 분석 이력 localStorage 캐시 처리
│   └── chatSessions.ts      # 챗봇 세션 localStorage 캐시 처리
│
├── pages/
│   ├── HomePage.tsx              # 홈 화면 (히어로 캐러셀 + 신고 번호 TOP 5 + 진단 기능 목록)
│   ├── auth/
│   │   ├── LoginPage.tsx         # 로그인 페이지
│   │   └── RegisterPage.tsx      # 회원가입 페이지
│   ├── diagnosis/                # 로그인 필요
│   │   ├── DiagnosisPage.tsx     # URL / 전화번호 / 음성 / 이미지 탭 통합 진단 페이지
│   │   ├── tabs/                 # 각 분석 탭 컴포넌트
│   │   └── components/           # 결과 카드, 챗 인터페이스 (솔루션 평가 포함)
│   ├── chat/
│   │   └── ChatPage.tsx          # AI 챗봇 상담 페이지 (로그인 필요)
│   ├── mypage/
│   │   └── MyPage.tsx            # 마이페이지 - 내 분석 이력, 신고 이력, 설정 (로그인 필요)
│   └── admin/
│       └── AdminPage.tsx         # 관리자 현황 모니터링
│
└── types/
    ├── api.ts              # API 요청/응답 TypeScript 타입 정의
    └── dashboard.ts        # 대시보드 데이터 TypeScript 타입 정의
```

---

## 로컬 실행 방법

```bash
# 의존성 설치
npm install

# 환경변수 설정 (.env.example 참고)
cp .env.example .env.development

# 개발 서버 실행 (http://localhost:5173)
npm run dev
```

> 백엔드 연동 방법은 [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) 참고

---

## 팀 정보

**캡스톤 디자인 - Team 5**

---
