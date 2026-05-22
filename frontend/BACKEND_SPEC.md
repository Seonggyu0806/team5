# 돈킴이 - 백엔드 연동 명세서

> 최초 작성: 2026-03-13 / 최종 수정: 2026-04-10
> 구버전 문서(API_PARAMS.md, API_CHANGES.md, BACKEND_INTEGRATION.md, CHANGELOG.md, OPTIMIZATION_CHANGES.md)를 하나로 통합

---

## ⚠️ 백엔드 추가 요청사항

> 프론트엔드에서 진단 결과에 **피싱 확률을 특정 수치(%)로 표시**하기 위해 아래 응답 필드 추가가 필요합니다.

| API | 추가 필드 | 타입 | 설명 |
|-----|-----------|------|------|
| `GET /api/v1/reports/phone/{phoneNumber}` | `riskScore` | Integer (0~100) | 피싱 확률 수치 |
| `POST /api/v1/analysis/voice` | `riskScore` | Integer (0~100) | 피싱 확률 수치 |
| `POST /api/v1/analysis/image` | `riskScore` | Integer (0~100) | 피싱 확률 수치 |

> URL 분석(`POST /api/v1/analysis/url`)은 이미 `riskScore` 반환 중 — 동일한 방식으로 추가하면 됩니다.

피싱 확률 기준:

| riskScore 범위 | 등급 | 한글 표시 |
|---------------|------|-----------|
| 0 ~ 20 | SAFE | 안전 |
| 20 ~ 40 | LOW | 낮음 |
| 40 ~ 60 | MEDIUM | 중간 |
| 60 ~ 80 | HIGH | 주의 |
| 80 ~ 100 | CRITICAL | 위험 |

---

## 목차

1. [공통 규격](#1-공통-규격)
2. [백엔드 연동 방법](#2-백엔드-연동-방법)
3. [API 엔드포인트 목록 (최신)](#3-api-엔드포인트-목록-최신)
4. [상세 파라미터 명세](#4-상세-파라미터-명세)
5. [엔드포인트 변경 이력](#5-엔드포인트-변경-이력)

---

## 1. 공통 규격

| 항목 | 내용 |
|------|------|
| Base URL | `/api/v1` |
| 데이터 형식 | JSON (application/json) |
| 인코딩 | UTF-8 |

### 응답 구조

```json
// 성공
{ "success": true,  "message": "성공했습니다", "data": { } }

// 실패
{ "success": false, "message": "에러 메시지",  "data": null }
```

### HTTP 상태 코드

| 코드 | 의미 |
|------|------|
| 200 | 성공 |
| 400 | 잘못된 요청 |
| 401 | 권한 없음 (토큰 필요 또는 만료) |
| 404 | 존재하지 않는 리소스 |
| 500 | 서버 오류 |

### 위험 등급 (RiskLevel)

`SAFE` · `LOW` · `MEDIUM` · `HIGH` · `CRITICAL`

### 인증 헤더

로그인이 필요한 API는 요청 헤더에 포함:

```
Authorization: Bearer {accessToken}
```

---

## 2. 백엔드 연동 방법

### 환경변수 설정

`.env.development` (개발):
```env
VITE_USE_MOCK=false                      # Mock 끄기
VITE_API_BASE_URL=http://localhost:8080  # Spring Boot 주소
```

`.env.production` (배포):
```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://api.donkimi.com
```

### 인증 토큰 처리

- 로그인 응답의 `accessToken` → `localStorage("donkimi_user")`에 자동 저장
- 이후 모든 API 요청 헤더에 `Authorization: Bearer {accessToken}` 자동 첨부
- 401 응답 시 자동 로그아웃 + `/login` 이동
- 관리자 토큰은 `localStorage("donkimi_admin_token")`에 별도 저장
- 코드 위치: `src/api/client.ts`

### CORS 처리

**개발 환경**: Vite proxy가 자동 처리
```
브라우저 → localhost:5173/api/v1/... → (Vite proxy) → localhost:8080/api/v1/...
```

**프로덕션**: Spring Boot에서 프론트엔드 도메인 CORS 허용 필요
```java
@CrossOrigin(origins = "https://donkimi.com")
```
→ Vite proxy 설정: `vite.config.ts`

### 파일 업로드 (음성/이미지)

`multipart/form-data` 형식, 파라미터명 `file`:
```
POST /api/v1/analysis/voice  → FormData { file: AudioFile }
POST /api/v1/analysis/image  → FormData { file: ImageFile }
```
→ 코드 위치: `src/api/media.ts`

### 접근 권한 정책

| 경로 | 비회원 | 회원 |
|------|--------|------|
| `/` (홈) | ✅ | ✅ |
| `/diagnosis` | ❌ → `/login` | ✅ |
| `/chat` | ❌ → `/login` | ✅ |
| `/mypage` | ❌ → `/login` | ✅ |
| `/login`, `/register` | ✅ | ✅ |
| `/admin` | ✅ (별도 관리자 인증) | ✅ |

→ 코드 위치: `src/components/auth/ProtectedRoute.tsx`, `src/App.tsx`

### Mock 데이터 위치 (연동 전 참고용)

| 파일 | 내용 |
|------|------|
| `src/api/mock/auth.ts` | 회원가입/로그인/내정보/탈퇴 |
| `src/api/mock/phishing.ts` | URL 분석, 분석 이력 |
| `src/api/mock/number.ts` | 전화번호 조회/신고/순위/내이력 |
| `src/api/mock/chat.ts` | 챗봇 응답, 대화이력, 피드백 |
| `src/api/mock/media.ts` | 음성/이미지 분석 |
| `src/api/mock/dashboard.ts` | 신고 번호 TOP 5 |
| `src/api/mock/store.ts` | 신고 데이터 공유 인메모리 스토어 (number/dashboard Mock 연결) |
| `src/api/mock/admin.ts` | 관리자 로그인 |

---

## 3. API 엔드포인트 목록 (최신)

> ⚠️ 아래는 2026-04-03 기준 최신 확정 엔드포인트입니다.

| # | 기능 | 메서드 | URL | 프론트 파일 |
|---|------|--------|-----|-------------|
| 1 | 회원가입 | POST | `/api/v1/users` | `src/api/auth.ts` |
| 2 | 로그인 | POST | `/api/v1/users/login` | `src/api/auth.ts` |
| 3 | 로그아웃 | POST | `/api/v1/users/logout` | `src/api/auth.ts` |
| 4 | 내 정보 조회 | GET | `/api/v1/users/me` | `src/api/auth.ts` |
| 5 | 회원 탈퇴 | DELETE | `/api/v1/users/me` | `src/api/auth.ts` |
| 6 | URL 피싱 분석 | POST | `/api/v1/analysis/url` | `src/api/phishing.ts` |
| 7 | 분석 이력 조회 | GET | `/api/v1/analysis/history` | `src/api/phishing.ts` |
| 8 | 음성 피싱 분석 | POST | `/api/v1/analysis/voice` | `src/api/media.ts` |
| 9 | 캡처 사진 분석 | POST | `/api/v1/analysis/image` | `src/api/media.ts` |
| 10 | AI 챗봇 상담 | POST | `/api/v1/chat` | `src/api/chat.ts` |
| 11 | 대화 이력 조회 | GET | `/api/v1/chat/{sessionId}/history` | `src/api/chat.ts` |
| 12 | 솔루션 평가 | POST | `/api/v1/chat/feedback` | `src/api/chat.ts` |
| 13 | 전화번호 조회 | GET | `/api/v1/reports/phone/{phoneNumber}` | `src/api/number.ts` |
| 14 | 전화번호 신고 | POST | `/api/v1/reports/phone` | `src/api/number.ts` |
| 15 | 7일 신고 순위 | GET | `/api/v1/reports/ranking` | `src/api/number.ts` |
| 16 | 내 신고 이력 | GET | `/api/v1/reports/my` | `src/api/number.ts` |
| 17 | 신고 번호 TOP 5 | GET | `/api/v1/dashboard/top-numbers` | `src/api/dashboard.ts` |
| 18 | 관리자 로그인 | POST | `/api/v1/admin/login` | `src/api/admin.ts` |
| 19 | 관리자 로그아웃 | POST | `/api/v1/admin/logout` | `src/api/admin.ts` |

---

## 4. 상세 파라미터 명세

### 회원 (`/users`)

#### 회원가입 `POST /api/v1/users`

**요청**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| email | String | O | 이메일 주소 |
| password | String | O | 비밀번호 (8자리 이상) |
| nickname | String | O | 닉네임 |

```json
{ "email": "user@example.com", "password": "password123", "nickname": "홍길동" }
```

**응답 (`data`)**

| 필드 | 타입 | 설명 |
|------|------|------|
| email | String | 가입한 이메일 |
| nickname | String | 닉네임 |
| createdAt | String | 가입 시간 |

---

#### 로그인 `POST /api/v1/users/login`

**요청**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| email | String | O | 이메일 주소 |
| password | String | O | 비밀번호 |

**응답 (`data`)**

| 필드 | 타입 | 설명 |
|------|------|------|
| accessToken | String | 인증 토큰 |
| email | String | 로그인한 이메일 |
| nickname | String | 닉네임 |

---

#### 로그아웃 `POST /api/v1/users/logout` *(로그인 필요)*

요청 파라미터 없음 (헤더 토큰만 사용)

---

#### 내 정보 조회 `GET /api/v1/users/me` *(로그인 필요)*

**응답 (`data`)**

| 필드 | 타입 | 설명 |
|------|------|------|
| email | String | 이메일 |
| nickname | String | 닉네임 |
| createdAt | String | 가입 시간 |

---

#### 회원 탈퇴 `DELETE /api/v1/users/me` *(로그인 필요)*

**요청**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| password | String | O | 본인 확인용 비밀번호 |

---

### 분석 (`/analysis`)

#### URL 피싱 분석 `POST /api/v1/analysis/url`

**요청**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| url | String | O | 분석할 URL |

**응답 (`data`)**

| 필드 | 타입 | 설명 |
|------|------|------|
| riskScore | Number | 위험 점수 |
| riskLevel | RiskLevel | 위험 등급 |
| phishingType | String | 피싱 종류 (예: "파밍", "스미싱") |
| isHttps | Boolean | HTTPS 여부 |
| urlLength | Number | URL 길이 |
| hasSuspiciousKeywords | Boolean | 의심 키워드 포함 여부 |
| hasIpAddress | Boolean | IP 주소 포함 여부 |
| hasExcessiveSubdomains | Boolean | 서브도메인 과다 여부 |
| hasSpecialChars | Boolean | 특수문자 포함 여부 |
| detectedKeywords | String | 탐지된 키워드 |
| recommendation | String | 권고 문구 |

---

#### 분석 이력 조회 `GET /api/v1/analysis/history` *(로그인 필요)*

**응답 (`data[]`)**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | Number | 이력 ID |
| url | String | 분석한 URL |
| riskScore | Number | 위험 점수 |
| riskLevel | RiskLevel | 위험 등급 |
| analyzedAt | String | 분석 시간 |

---

#### 음성 피싱 분석 `POST /api/v1/analysis/voice`

**요청**: `multipart/form-data`

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| file | File | O | 음성 파일 |

**응답 (`data`)**

| 필드 | 타입 | 설명 |
|------|------|------|
| convertedText | String | 음성 → 텍스트 변환 결과 |
| riskLevel | RiskLevel | 위험 등급 |
| phishingType | String | 피싱 종류 |
| message | String | 안내 문구 |

---

#### 캡처 사진 분석 `POST /api/v1/analysis/image`

**요청**: `multipart/form-data`

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| file | File | O | 이미지 파일 |

**응답 (`data`)**

| 필드 | 타입 | 설명 |
|------|------|------|
| extractedText | String | OCR 텍스트 추출 결과 |
| detectedKeywords | String | 탐지된 피싱 키워드 |
| riskLevel | RiskLevel | 위험 등급 |
| phishingType | String | 피싱 종류 |
| message | String | 안내 문구 |

---

### AI 챗봇 (`/chat`)

#### 챗봇 상담 `POST /api/v1/chat`

**요청**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| sessionId | String | O | 세션 ID |
| message | String | O | 사용자 메시지 |

**응답 (`data`)**

| 필드 | 타입 | 설명 |
|------|------|------|
| sessionId | String | 세션 ID |
| reply | String | AI 응답 텍스트 |
| riskLevel | RiskLevel | 위험 등급 |

---

#### 대화 이력 조회 `GET /api/v1/chat/{sessionId}/history`

**요청**: Path 파라미터 `sessionId`

**응답 (`data`)**

| 필드 | 타입 | 설명 |
|------|------|------|
| sessionId | String | 세션 ID |
| messages[].role | String | `user` 또는 `assistant` |
| messages[].content | String | 메시지 내용 |
| messages[].createdAt | String | 작성 시간 |

---

#### 솔루션 평가 `POST /api/v1/chat/feedback` *(로그인 필요)*

**요청**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| chatMessageId | Long | O | 평가할 AI 답변 ID |
| isHelpful | Boolean | O | 도움 여부 |

```json
{ "chatMessageId": 1, "isHelpful": true }
```

**응답**
```json
// 성공
{ "success": true,  "message": "평가가 등록되었습니다", "data": null }

// 중복 평가
{ "success": false, "message": "이미 평가한 답변입니다", "data": null }
```

---

### 신고 (`/reports`)

#### 전화번호 조회 `GET /api/v1/reports/phone/{phoneNumber}`

**요청**: Path 파라미터 `phoneNumber`

**응답 (`data`)**

| 필드 | 타입 | 설명 |
|------|------|------|
| number | String | 전화번호 |
| reportCount | Integer | 신고 횟수 |
| riskLevel | RiskLevel | 위험 등급 |
| message | String | 안내 문구 |

---

#### 전화번호 신고 `POST /api/v1/reports/phone`

> HIGH / CRITICAL 등급 진단 시 프론트에서 자동 호출됨

**요청**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| number | String | O | 신고할 전화번호 |

**응답 (`data`)**

| 필드 | 타입 | 설명 |
|------|------|------|
| number | String | 신고된 전화번호 |
| reportCount | Integer | 누적 신고 횟수 |
| message | String | 안내 문구 |

---

#### 7일 신고 순위 `GET /api/v1/reports/ranking` *(로그인 필요)*

**응답 (`data[]`)**

| 필드 | 타입 | 설명 |
|------|------|------|
| rank | Integer | 순위 |
| phoneNumber | String | 전화번호 |
| reportCount | Integer | 최근 7일 신고 횟수 |

---

#### 내 신고 이력 `GET /api/v1/reports/my` *(로그인 필요)*

**응답 (`data[]`)**

| 필드 | 타입 | 설명 |
|------|------|------|
| phoneNumber | String | 신고한 전화번호 |
| reportCount | Integer | 해당 번호 총 신고 횟수 |
| createdAt | String | 신고 시간 |

---

### 대시보드 (`/dashboard`)

#### 신고 번호 TOP 5 `GET /api/v1/dashboard/top-numbers`

> ⚠️ 백엔드 팀과 엔드포인트 최종 협의 필요

**응답 (`data[]`)**

| 필드 | 타입 | 설명 |
|------|------|------|
| rank | Integer | 순위 (1~5) |
| number | String | 전화번호 |
| reportCount | Integer | 신고 횟수 |
| riskLevel | RiskLevel | 위험 등급 |

---

### 관리자 (`/admin`)

#### 관리자 로그인 `POST /api/v1/admin/login`

**요청**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| adminId | String | O | 관리자 ID |
| password | String | O | 비밀번호 |

**응답 (`data`)**

| 필드 | 타입 | 설명 |
|------|------|------|
| accessToken | String | 관리자 인증 토큰 |
| adminId | String | 관리자 ID |

---

#### 관리자 로그아웃 `POST /api/v1/admin/logout`

요청/응답 파라미터 없음

---

## 5. 엔드포인트 변경 이력

> 구버전 → 현재 확정 엔드포인트 변경 내역 요약

### 회원 (`/user` → `/users`)

| 기능 | 구버전 | 현재 |
|------|--------|------|
| 회원가입 | `POST /api/v1/user/join` | `POST /api/v1/users` |
| 로그인 | `POST /api/v1/user/login` | `POST /api/v1/users/login` |
| 로그아웃 | `POST /api/v1/user/logout` | `POST /api/v1/users/logout` |
| 내 정보 조회 | `GET /api/v1/user/me` | `GET /api/v1/users/me` |
| 회원 탈퇴 | `DELETE /api/v1/user/me` | `DELETE /api/v1/users/me` |

### 분석 (`/phishing`, `/voice`, `/image` → `/analysis`)

| 기능 | 구버전 | 현재 |
|------|--------|------|
| URL 분석 | `POST /api/v1/phishing/analyze` | `POST /api/v1/analysis/url` |
| 분석 이력 | `GET /api/v1/phishing/history` | `GET /api/v1/analysis/history` |
| 음성 분석 | `POST /api/v1/voice` | `POST /api/v1/analysis/voice` |
| 사진 분석 | `POST /api/v1/image` | `POST /api/v1/analysis/image` |

### 챗봇 (`prefix 누락` → `/chat`)

| 기능 | 구버전 | 현재 |
|------|--------|------|
| 대화 이력 | `GET /api/v1/{sessionId}/history` | `GET /api/v1/chat/{sessionId}/history` |

### 신고 (`/number` → `/reports`)

| 기능 | 구버전 | 현재 |
|------|--------|------|
| 전화번호 조회 | `GET /api/v1/number/{phoneNumber}` | `GET /api/v1/reports/phone/{phoneNumber}` |
| 전화번호 신고 | `POST /api/v1/number/report` | `POST /api/v1/reports/phone` |
| 7일 순위 | `GET /api/v1/number/ranking` | `GET /api/v1/reports/ranking` |
| 내 신고 이력 | `GET /api/v1/number/my-reports` | `GET /api/v1/reports/my` |
| ~~차단 목록~~ | `GET /api/v1/number/blocked` | **명세서에서 제거됨** |
| ~~번호 차단/해제~~ | `POST /api/v1/number/{phoneNumber}/block` | **명세서에서 제거됨** |

### 타입 변경

- 분석 결과 응답에 `phishingType: string` 필드 추가 (`PhishingAnalyzeResult`, `VoiceAnalyzeResult`, `ImageAnalyzeResult`)
- 회원 관련 필드: `userId` / `username` → `email` / `nickname`
