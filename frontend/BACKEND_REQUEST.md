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

저장 항목: 사용자 ID, 분석 종류(URL/IMAGE/VOICE), 분석 대상, 위험 등급, 위험 점수, 피싱 유형, 분석 시각

---

## 요청 2 — `GET /api/v1/analysis/history` 를 통합 응답으로 변경

기존 URL 전용 응답을 **URL·이미지·음성을 모두 포함하는 통합 형태**로 변경해 주세요. (로그인한 사용자 본인의 이력만 반환)

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
| type | String | O | 분석 종류 — `URL` / `IMAGE` / `VOICE` |
| target | String | O | 분석 대상 — URL이면 주소, 이미지·음성이면 파일명(또는 추출/변환 텍스트 요약) |
| riskLevel | String | O | 위험 등급 — SAFE/LOW/MEDIUM/HIGH/CRITICAL |
| riskScore | Integer | X | 위험 점수(0~100). 점수가 없는 이미지·음성은 `null` 허용 |
| phishingType | String | X | 피싱 종류 (예: 파밍, 스미싱, 보이스피싱) |
| analyzedAt | String | O | 분석 시각 |

> 참고: 프론트엔드는 위 형식과 함께 **구버전 응답(`url` 필드만 있는 형태)도 호환** 처리해 두었으므로, 통합 적용 전까지 URL 이력은 정상 동작합니다. `type`/`target` 추가가 핵심입니다.

---

## 요청 3 (선택) — 내 대화 세션 목록 API

마이페이지 "대화 이력"도 동일하게 기기 종속 문제가 있습니다. 현재 `GET /api/v1/chat/{sessionId}/history`는 특정 세션만 조회 가능하고, **"내 전체 대화 세션 목록"을 주는 API가 없어** 세션 목록을 계정 기반으로 만들 수 없습니다.

가능하면 아래 API 신설을 검토해 주세요. (분석 이력 작업보다 우선순위는 낮음)

```
GET /api/v1/chat/sessions   (로그인 필요)
→ data: [ { sessionId, 분석종류, riskLevel, createdAt, 마지막 메시지 미리보기 } ]
```

---

## 우선순위

1. **요청 1·2 (분석 이력 통합)** — 마이페이지 분석 이력 버그 직결, 우선 처리 요망
2. 요청 3 (대화 세션 목록) — 여유 시 진행
