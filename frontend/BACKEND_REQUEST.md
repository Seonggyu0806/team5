# 백엔드 요청서 — 분석 이력 통합 API

> 작성: 프론트엔드 / 대상: 백엔드
> 관련: 마이페이지 "분석 이력" 기능

## 배경 / 문제

현재 마이페이지의 분석 이력이 **브라우저 localStorage**에 저장되고 있어, 계정이 아닌 **기기 단위로 동작하는 버그**가 있습니다.

- 같은 브라우저면 어떤 계정으로 로그인하든 같은 이력이 보임
- 다른 기기에서 같은 계정으로 로그인하면 이력이 비어 있음

프론트엔드는 이력을 **서버에서 계정 기반으로 조회**하도록 수정했습니다. 이를 위해 백엔드에 아래 작업을 요청합니다.

현재 `GET /api/v1/analysis/history`는 **URL 분석 이력만** 반환하며(`url` 필드), 이미지·음성 분석은 응답에 `id`조차 없어 **DB에 저장되지 않는 것**으로 보입니다.

---

## 요청 1 — 이미지·음성 분석 결과를 DB에 저장

`POST /api/v1/analysis/image`, `POST /api/v1/analysis/voice` 호출이 처리될 때, 분석 결과를 **요청한 사용자 계정과 함께 분석 이력 테이블에 저장**해 주세요. (URL 분석은 이미 저장되고 있는 것으로 보입니다.)

저장 항목: 사용자 ID, 분석 종류(URL/IMAGE/VOICE/PHONE), 분석 대상, 위험 등급, 위험 점수, 피싱 유형, 분석 시각

---

## 요청 2 — `GET /api/v1/analysis/history` 를 통합 응답으로 변경

기존 URL 전용 응답을 **URL·이미지·음성·전화번호 조회를 모두 포함하는 통합 형태**로 변경해 주세요. (로그인한 사용자 본인의 이력만 반환)

### 변경된 응답 형식

```json
{
  "success": true,
  "message": "성공했습니다",
  "data": [
    {
      "id": 1,
      "type": "URL",
      "target": "http://fake-kakao.com",
      "riskLevel": "HIGH",
      "riskScore": 85,
      "phishingType": "파밍",
      "analyzedAt": "2026-03-13 19:41:25"
    },
    {
      "id": 2,
      "type": "IMAGE",
      "target": "screenshot_0312.png",
      "riskLevel": "CRITICAL",
      "riskScore": null,
      "phishingType": "스미싱",
      "analyzedAt": "2026-03-12 11:02:10"
    }
  ]
}
```

### 필드 명세

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| id | Long | O | 분석 이력 고유 번호 |
| type | String | O | 분석 종류 — `URL` / `IMAGE` / `VOICE` / `PHONE` |
| target | String | O | 분석 대상 — URL이면 주소, 이미지·음성이면 파일명, 전화번호면 번호 |
| riskLevel | String | O | 위험 등급 — SAFE/LOW/MEDIUM/HIGH/CRITICAL |
| riskScore | Integer | X | 위험 점수(0~100). 점수가 없는 이미지·음성·전화번호는 `null` 허용 |
| phishingType | String | X | 피싱 종류 (예: 파밍, 스미싱, 보이스피싱) |
| analyzedAt | String | O | 분석 시각 |

> 참고: 프론트엔드는 위 형식과 함께 **구버전 응답(`url` 필드만 있는 형태)도 호환** 처리해 두었으므로, 통합 적용 전까지 URL 이력은 정상 동작합니다. `type`/`target` 추가가 핵심입니다.

---

## 요청 3 — 전화번호 "조회" 이력 저장 및 통합 이력에 포함

현재 전화번호 관련 이력은 `GET /api/v1/reports/my`(내가 **신고한** 번호)만 존재합니다. 사용자가 **조회만 한 번호**(`GET /api/v1/reports/phone/{phoneNumber}` 호출)는 어디에도 기록되지 않아, 마이페이지 분석 이력에서 빠집니다.

요청 사항:

1. 로그인한 사용자가 `GET /api/v1/reports/phone/{phoneNumber}` 로 **전화번호를 조회**할 때, 그 조회 기록을 사용자 계정과 함께 분석 이력 테이블에 저장해 주세요.
   - 저장 항목: 사용자 ID, `type = PHONE`, 대상 번호, 조회 시점의 위험 등급, 조회 시각
2. 이 조회 이력을 **요청 2의 통합 `/api/v1/analysis/history` 응답에 `type: "PHONE"` 항목으로 포함**해 주세요.

→ 이렇게 하면 마이페이지가 통합 이력 API 하나로 URL·이미지·음성·전화번호 조회를 모두 표시할 수 있습니다. (전화번호 **신고** 이력은 기존 `/reports/my` 유지)

---

## 요청 4 (선택) — 내 대화 세션 목록 API

마이페이지 "대화 이력"도 동일하게 기기 종속 문제가 있습니다. 현재 `GET /api/v1/chat/{sessionId}/history`는 특정 세션만 조회 가능하고, **"내 전체 대화 세션 목록"을 주는 API가 없어** 세션 목록을 계정 기반으로 만들 수 없습니다.

가능하면 아래 API 신설을 검토해 주세요. (분석 이력 작업보다 우선순위는 낮음)

```
GET /api/v1/chat/sessions   (로그인 필요)
→ data: [ { sessionId, 분석종류, riskLevel, createdAt, 마지막 메시지 미리보기 } ]
```

---

## 요청 5 — AI 챗봇 응답에 `chatMessageId` 포함 (피드백 평가 정상화)

### 문제
챗봇 답변 평가(`POST /api/v1/chat/feedback`)는 `chatMessageId`(평가할 AI 답변의 ID)를 요구합니다.
그런데 챗봇 응답(`POST /api/v1/chat`)은 현재 `{ sessionId, reply, riskLevel }`만 반환하고
**답변의 ID를 주지 않습니다.** 그래서 프론트는 어떤 답변을 평가하는지 식별할 수단이 없습니다.

(임시로 화면상 순번을 보내던 것을 제거했고, 지금은 **서버가 ID를 줄 때만 평가 버튼이 활성화**되도록
프론트를 수정했습니다. 즉 아래 작업 전까지 피드백 버튼은 표시되지 않습니다.)

### 요청
챗봇 응답(`POST /api/v1/chat`)에 그 AI 답변의 **DB 고유 ID**를 `chatMessageId` 필드로 포함해 주세요.

**변경된 응답 예시**
```json
{
  "success": true,
  "message": "성공했습니다",
  "data": {
    "sessionId": "abc123",
    "chatMessageId": 1024,          // ← 추가: 이 AI 답변의 고유 ID
    "reply": "피싱번호로 등록된 기록이 있는 번호입니다",
    "riskLevel": "HIGH"
  }
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| chatMessageId | Long | O(신규) | 이 AI 답변의 고유 ID. 이후 `/chat/feedback`의 `chatMessageId`로 그대로 사용됨 |

→ 이 값이 들어오면 프론트가 평가 버튼을 표시하고, 사용자가 누른 버튼이 **정확히 그 답변에** 매핑됩니다.

### (선택) 대화 이력에도 동일 적용
`GET /api/v1/chat/{sessionId}/history`의 각 assistant 메시지에도 `chatMessageId`를 포함하면,
과거 대화에서도 평가가 가능해집니다. (없으면 과거 메시지는 평가 버튼 미표시 — 현재 프론트 동작)

---

## 우선순위

1. **요청 1·2·3 (분석 이력 통합 — URL/이미지/음성/전화번호 조회)** — 마이페이지 분석 이력 버그 직결, 우선 처리 요망
2. **요청 5 (챗봇 chatMessageId)** — 피드백 평가 기능 정상화에 필요. 응답 필드 1개 추가라 부담 적음
3. 요청 4 (대화 세션 목록) — 여유 시 진행
