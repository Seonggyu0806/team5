// 대시보드 화면에서 사용하는 TypeScript 타입 정의
// TopReportedNumber   : 신고 횟수 기준 상위 위험 번호 목록 (순위 포함) — 홈 "신고 번호 TOP 5"
import type { RiskLevel } from './api'

export interface TopReportedNumber {
  rank: number
  number: string
  reportCount: number
  riskLevel: RiskLevel
}
