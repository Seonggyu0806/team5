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

// ─── 분석 이력 ───────────────────────────────────────────────
export interface PhishingHistory {
  id: number
  url: string
  riskScore: number
  riskLevel: RiskLevel
  analyzedAt: string
}

// ─── AI 챗봇 ─────────────────────────────────────────────────
export interface ChatRequest {
  sessionId: string
  message: string
}

export interface ChatResponse {
  sessionId: string
  reply: string
  riskLevel: RiskLevel
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
  messages: ChatMessage[]
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
