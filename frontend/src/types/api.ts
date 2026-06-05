// 공통 API 응답 래퍼
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
}

// 위험 등급
export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

// ─── URL 피싱 분석 ───────────────────────────────────────────
export interface PhishingAnalyzeRequest {
  url: string
}

export interface PhishingAnalyzeResult {
  riskScore: number
  riskLevel: RiskLevel
  isHttps: boolean
  urlLength: number
  hasSuspiciousKeywords: boolean
  hasIpAddress: boolean
  hasExcessiveSubdomains: boolean
  hasSpecialChars: boolean
  hasRandomString: boolean
  detectedKeywords: string
  phishingType: string
  recommendation: string
}

// ─── 분석 이력 (통합) ─────────────────────────────────────────
// 통합 이력 API(GET /api/v1/analysis/history)는 type·target을 포함해
// URL·이미지·음성 분석 이력을 모두 반환한다.
// 구버전 응답(url 필드만 존재)도 호환되도록 신규 필드는 옵셔널로 둔다.
export interface PhishingHistory {
  id: number
  type?: 'URL' | 'IMAGE' | 'VOICE' // 분석 종류 (구버전 응답엔 없음 → URL로 간주)
  target?: string                  // 분석 대상 (URL 주소 / 이미지·음성 파일명)
  url?: string                     // 구버전 호환 (URL 분석)
  riskScore?: number               // 이미지·음성은 점수가 없을 수 있음
  riskLevel: RiskLevel
  phishingType?: string
  analyzedAt: string
}

// ─── AI 챗봇 ─────────────────────────────────────────────────
export interface ChatRequest {
  sessionId: string
  message: string
  // 세션 최초 생성 시 진단 메타데이터 — 백엔드가 세션에 저장 (대화 이력 목록의 type·riskLevel 용)
  type?: 'url' | 'phone' | 'image' | 'voice'
  riskLevel?: RiskLevel
}

export interface ChatResponse {
  sessionId: string
  reply: string
  riskLevel: RiskLevel
  // AI 답변의 서버 고유 ID — 피드백 평가(POST /chat/feedback)의 chatMessageId로 사용.
  // 백엔드가 응답에 포함해야 피드백이 정확한 답변에 매핑됨. 없으면 프론트는 피드백 버튼을 숨김.
  chatMessageId?: number
}

// ─── 솔루션 평가 ─────────────────────────────────────────────
export interface ChatFeedbackRequest {
  chatMessageId: number
  isHelpful: boolean
}

// ─── 대화 이력 ───────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface ConversationHistory {
  sessionId: string
  riskLevel?: RiskLevel // 세션 진단 위험도 — 채팅 화면 상단 뱃지에 표시. 백엔드가 제공하면 사용
  messages: ChatMessage[]
}

// ─── 대화 세션 목록 (GET /chat/sessions) ─────────────────────
// 마이페이지 "대화 이력" 탭에 표시할 세션 요약. (메시지 본문은 미포함 — preview만)
export interface ChatSessionSummary {
  sessionId: string
  type: 'url' | 'phone' | 'image' | 'voice' // 진단 종류
  riskLevel: RiskLevel
  preview: string  // 미리보기 텍스트
  createdAt: string
}

// ─── 전화번호 ─────────────────────────────────────────────────
export interface NumberReportRequest {
  number: string
  phishingType?: string // 사용자가 입력한 피싱 유형 (예: 보이스피싱, 스미싱 등)
}

export interface NumberReportResult {
  number: string
  reportCount: number
  message: string
  alreadyReported: boolean // 해당 계정이 이미 신고한 번호인지 — true면 reportCount 미증가 (계정당 1회 제한)
}

export interface NumberLookupResult {
  number: string
  reportCount: number
  riskLevel: RiskLevel
  riskScore?: number // TODO [백엔드 연동]: 전화번호 조회 응답에 riskScore(0~100) 추가 필요
  phishingType: string // 피싱 유형 (예: 보이스피싱, 스미싱, 기관 사칭형 등)
  message: string
  hasData: boolean // 시스템에 신고 이력이 존재하는지 여부 (false면 "데이터 없음" 안내)
}

// ─── 7일 신고 누적 순위 ───────────────────────────────────────
export interface NumberRankingItem {
  rank: number
  phoneNumber: string
  reportCount: number
}

// ─── 내 신고 이력 ────────────────────────────────────────────
export interface MyReportItem {
  phoneNumber: string
  reportCount: number
  createdAt: string
}

// ─── 음성 분석 ───────────────────────────────────────────────
export interface VoiceAnalyzeResult {
  convertedText: string
  riskLevel: RiskLevel
  riskScore?: number // TODO [백엔드 연동]: 음성 분석 응답에 riskScore(0~100) 추가 필요
  phishingType: string
  message: string
}

// ─── 이미지 분석 ─────────────────────────────────────────────
export interface ImageAnalyzeResult {
  extractedText: string
  detectedKeywords: string
  riskLevel: RiskLevel
  riskScore?: number // TODO [백엔드 연동]: 이미지 분석 응답에 riskScore(0~100) 추가 필요
  phishingType: string
  message: string
}

// ─── 관리자 ──────────────────────────────────────────────────
export interface AdminLoginRequest {
  adminId: string
  password: string
}

export interface AdminLoginResult {
  accessToken: string
  adminId: string
}

// ─── 관리자 — 전체 신고 목록 (GET /admin/reports) ──────────────
export interface AdminReportItem {
  phoneNumber: string
  reportCount: number
  riskLevel: RiskLevel
  createdAt: string
  updatedAt: string
}

// ─── 관리자 — 전체 유저 목록 (GET /admin/users) ────────────────
export interface AdminUserItem {
  id: number
  email: string
  name: string  // 백엔드 응답 필드명은 name (회원가입의 nickname이 여기로 옴)
  createdAt: string
}

// ─── 관리자 — 전체 URL 분석 목록 (GET /admin/urls) ─────────────
export interface AdminUrlItem {
  id: number
  userId: number
  url: string
  isMalicious: boolean
  details: string
  timestamp: string
}

// ─── 사용자 인증 ─────────────────────────────────────────────
export interface UserRegisterRequest {
  email: string
  password: string
  nickname: string
}

export interface UserRegisterResult {
  email: string
  nickname: string
  createdAt: string
}

export interface UserLoginRequest {
  email: string
  password: string
}

export interface UserLoginResult {
  accessToken: string
  email: string
  nickname: string
}

// ─── 내 정보 ─────────────────────────────────────────────────
export interface UserInfo {
  email: string
  nickname: string
  createdAt: string
}
