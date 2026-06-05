# 관리자 API 403 Forbidden 해결 가이드 (백엔드)

> 작성: 프론트엔드 / 대상: 백엔드
> 관련: 관리자 대시보드 — 신고/유저/URL 목록 조회

## 1. 증상

- 관리자 로그인(`POST /api/v1/admin/login`)은 **성공** (대시보드 진입됨)
- 그런데 관리자 조회 API가 전부 **403 Forbidden**:
  - `GET /api/v1/admin/reports`
  - `GET /api/v1/admin/users`
  - `GET /api/v1/admin/urls`
- 응답 본문이 비어 있음 (`Content-Length: 0`)

## 2. 진단 (프론트엔드에서 확인 완료)

브라우저 Network 탭에서 확인한 사실:

| 확인 항목 | 결과 |
|---|---|
| `Authorization: Bearer <토큰>` 전송 | ✅ 정상 전송됨 |
| 토큰 페이로드의 권한 | ✅ **`"role": "ADMIN"`** 포함 |
| 응답 | ❌ 403 Forbidden (본문 없음) |

즉 **프론트엔드는 ADMIN 권한이 담긴 관리자 토큰을 정상적으로 보내고 있는데, 백엔드가 거부**하고 있습니다.
→ **백엔드 Spring Security 인가(Authorization) 설정 문제**입니다. 프론트엔드 측 조치 사항은 없습니다.

## 3. 핵심 단서 — "로그인은 되는데 조회만 막힘"

`/admin/login`은 통과하고 `/admin/**` 조회만 403이라는 점이 중요합니다.
→ 로그인 경로는 공개(permitAll)인데, **조회 경로의 권한 인가에서 ADMIN 권한이 매칭되지 않아** 막히는 상황입니다.

## 4. 가장 흔한 원인 — `ROLE_` 접두사 불일치 ⭐

Spring Security의 `hasRole("ADMIN")`은 내부적으로 **`ROLE_ADMIN`** 이라는 authority를 요구합니다.
JWT의 `role: "ADMIN"`을 권한으로 변환할 때 **`ROLE_` 접두사를 붙이지 않으면** `hasRole("ADMIN")` 체크가 실패해 403이 납니다.
토큰에 ADMIN이 있는데도 403이 나는 전형적인 케이스입니다.

## 5. 해결 방법

아래 **A 또는 B 중 하나**를 적용하면 됩니다. (둘 중 하나로 통일하는 게 핵심)

### 방법 A (권장) — JWT 필터에서 `ROLE_` 접두사 붙이기

JWT 인증 필터에서 토큰의 `role`을 `GrantedAuthority`로 매핑하는 부분:

```java
// ❌ 잘못된 예 — hasRole("ADMIN")과 매칭되지 않아 403
String role = claims.get("role", String.class);              // "ADMIN"
var authorities = List.of(new SimpleGrantedAuthority(role));  // "ADMIN"  ← 접두사 없음

// ✅ 올바른 예 — ROLE_ 접두사 추가
String role = claims.get("role", String.class);                        // "ADMIN"
var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));  // "ROLE_ADMIN"
```

그리고 SecurityConfig는 `hasRole` 사용:

```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/v1/admin/login").permitAll()    // 로그인은 공개
    .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")  // 나머지 관리자 API는 ADMIN
    .anyRequest().authenticated()
);
```

### 방법 B — 접두사 없이 `hasAuthority` 사용

권한을 `ROLE_` 없이 `"ADMIN"`으로 넣는다면, 인가 규칙도 `hasAuthority`로 맞춥니다:

```java
// JWT 필터: 접두사 없이
var authorities = List.of(new SimpleGrantedAuthority("ADMIN"));

// SecurityConfig: hasRole 대신 hasAuthority
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/v1/admin/login").permitAll()
    .requestMatchers("/api/v1/admin/**").hasAuthority("ADMIN")  // ← hasAuthority
    .anyRequest().authenticated()
);
```

> ⚠️ A와 B를 섞으면 안 됩니다. 필터가 `ROLE_ADMIN`을 넣으면 `hasRole("ADMIN")`(A), `ADMIN`을 넣으면 `hasAuthority("ADMIN")`(B)로 **일치**시켜야 합니다.

## 6. 추가 확인 사항

위로 해결 안 되면 아래도 점검해 주세요.

1. **JWT 인증 필터가 SecurityContext에 권한을 실제로 세팅하는지**
   ```java
   var authentication = new UsernamePasswordAuthenticationToken(userId, null, authorities);
   SecurityContextHolder.getContext().setAuthentication(authentication);
   ```
   → 이게 빠지면 인증 자체가 안 잡혀 403/401이 납니다.

2. **`/admin/**` 가 JWT 필터를 타도록** SecurityFilterChain에 등록돼 있는지
   (관리자 토큰을 검증하는 필터가 이 경로에 적용되는지)

3. **CSRF** — REST API라면 보통 비활성화 (`http.csrf(csrf -> csrf.disable())`).
   GET 요청은 보통 CSRF 면제이므로 이번 GET 403의 직접 원인은 아닐 가능성이 높지만, 회원가입 등 POST가 막힌다면 확인 필요.

## 7. 수정 후 확인 방법

1. 관리자 로그인 → 토큰 발급
2. `GET /api/v1/admin/reports` 호출 (Authorization: Bearer 토큰)
3. **200 OK + 신고 목록 데이터** 반환되면 해결
4. 프론트 관리자 대시보드의 신고/유저/URL 탭에 데이터가 표시됨

## 8. 체크리스트

- [ ] JWT 필터에서 `role` → authority 매핑 시 `ROLE_` 접두사 (방법 A) **또는** `hasAuthority` 사용 (방법 B)
- [ ] SecurityConfig: `/admin/login`은 `permitAll`, `/admin/**`는 `hasRole("ADMIN")`/`hasAuthority("ADMIN")`
- [ ] JWT 필터가 `SecurityContext`에 `Authentication` 세팅
- [ ] `/admin/**` 가 JWT 검증 필터를 타는지
- [ ] (POST가 막히면) CSRF 비활성화

---

요약: **토큰엔 ADMIN 권한이 정상적으로 들어있습니다. 백엔드가 그 권한을 인가에서 인식하도록 `ROLE_` 접두사(방법 A) 또는 `hasAuthority`(방법 B)로 맞추면 해결됩니다.** 대부분 5번 방법 A 한 가지로 풀립니다.
